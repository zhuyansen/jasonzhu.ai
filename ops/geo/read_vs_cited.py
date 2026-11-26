#!/usr/bin/env python3
"""读了不引：AI 现场读了我们哪些页，面板里 AI 又引了哪些页，按页对起来（2026-11-26 起，只在本机跑）。

为什么：排进 Google 第一页，AI 也不一定引用你。一页没被引用，可能是 AI 根本没读到（排名、检索的问题，L3），
也可能读了却没选它（页面本身的问题，L4）。两种该做的事不一样，所以按页分开：
  读了也被引：正常。
  读了不引：ChatGPT 这周现场读过这页（ChatGPT-User，IP 在 OpenAI 公布的范围里），面板里 ChatGPT 却没引它 → 改页面（L4）。
  引了但没现场读：ChatGPT 从自己的索引或缓存里引的，不用管。
  没读也没引：有题指向这页，但这周 ChatGPT 一次都没现场读、也没引 → 补排名（L3），先进它搜的那几条词的前 20。
读和引都按 ChatGPT 一家对：现场读取只有 ChatGPT-User 能按 IP 核实。Claude-User 单列，只作参考（IP 没核）。
另列「AI 读得多、面板却没有题的页」：可以出新题（加新 id，旧题不改）。

数据：
  读：本机 GEOInflow（docker 里的 liekan-db-1，表 liekan_log），面板日期往前 DAYS 天（北京时间，含面板那天），只算 2xx、3xx。
      面板自己在跑的时段去掉：面板问 ChatGPT 时它会现场读页（gh 查 geo-panel 工作流每次运行的开始、结束时间；
      查不到就整天去掉面板那天，并在报告里写明）。
  引：ops/geo/panel/results-<日期>.json 的 our_urls（每个有效回答引用了本站哪些网址）。
  题：ops/geo/questions*.json 的 target_url；展示数：ops/geo/demand.json。
  页按「去掉 /zh、/en 前缀的路径」合并：同一页的中英文版本算一页。
局限：ChatGPT-User 的读取来自所有用户，不只我们的题；一页读得少不一定没排名（也可能没人问）。这是分诊，不是因果。

只在本机跑（GEOInflow 不在 GitHub 上）。公开文件只有本站自己的路径和计数，没有回答原文、搜索词和别的网站。

用法：
  python3 ops/geo/read_vs_cited.py --selftest
  python3 ops/geo/read_vs_cited.py run                         # 最新一期面板，前 7 天
  python3 ops/geo/read_vs_cited.py run --results ops/geo/panel/results-2026-11-23.json --days 7 \\
      --out /tmp/read-cited.md --public ops/geo/panel/read-cited-2026-11-23.json
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import panel_run as pr  # noqa: E402

SITE_ID = "a11d5ca8-c6e3-4683-bab7-808caef7fdff"      # GEOInflow 里 jasonzhu.ai 的 website_id
DB = ["docker", "exec", "liekan-db-1", "psql", "-U", "liekan", "-d", "liekan", "-At", "-F", "\t", "-c"]
DAYS = 7
READ_MIN = 2            # 一周里 ChatGPT 现场读了至少这么多次，才算「读过」（1 次可能是偶然一个人问到）
NO_QUESTION_MIN = 5     # 没有题的页，一周读了至少这么多次才列出来，当出新题的候选
SHOWN = 25
DEMAND = pr.GEO / "demand.json"
WORKFLOW = "geo-panel.yml"
REPO = "zhuyansen/jasonzhu.ai"


def page_key(url_or_path: str) -> str:
    """网址或路径 → 去掉主机、/zh 或 /en 前缀、参数和末尾斜杠后的路径；首页是 "/"。"""
    s = (url_or_path or "").strip()
    if not s:
        return ""
    if s.startswith("/"):
        s = pr.OWN + s
    n = pr.any_lang(pr.norm_url(s if "://" in s else "https://" + s))
    path = n.split("/", 1)[1] if "/" in n else ""
    return "/" + path.strip("/") if path.strip("/") else "/"


def own_url(u: str) -> bool:
    host = pr.norm_url(u if "://" in u else "https://" + u).split("/", 1)[0]
    return host == pr.OWN or host in pr.OWN_ALIASES


def window(day: str, days: int = DAYS) -> tuple[datetime, datetime]:
    """面板日期往前 days 天（北京时间整天，含面板那天）：[开始, 结束)，UTC。"""
    end = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=pr.CST) + timedelta(days=1)
    return (end - timedelta(days=days)).astimezone(timezone.utc), end.astimezone(timezone.utc)


def panel_runs(start: datetime, end: datetime) -> list[tuple[datetime, datetime]] | None:
    """窗口里 geo-panel 工作流每次运行的（开始, 结束），UTC；gh 查不到是 None。"""
    try:
        out = subprocess.run(["gh", "run", "list", "-R", REPO, "--workflow", WORKFLOW, "-L", "60",
                              "--json", "createdAt,updatedAt"], capture_output=True, text=True, timeout=60, check=True).stdout
        runs = json.loads(out)
    except (OSError, subprocess.SubprocessError, ValueError):
        return None
    parse = lambda t: datetime.fromisoformat(t.replace("Z", "+00:00"))
    spans = [(parse(r["createdAt"]), parse(r["updatedAt"])) for r in runs if r.get("createdAt") and r.get("updatedAt")]
    return [(a, b) for a, b in spans if a < end and b > start]


def reads(start: datetime, end: datetime, skip: list[tuple[datetime, datetime]]) -> dict[str, Counter]:
    """{页: Counter(chatgpt=核实过的 ChatGPT-User 次数, chatgpt_other=IP 对不上的, claude=Claude-User)}。只算 2xx、3xx。"""
    cond = " ".join(f"and not (created_at >= '{a.isoformat()}' and created_at < '{b.isoformat()}')" for a, b in skip)
    sql = (f"select path, bot, verification, count(*) from liekan_log where website_id = '{SITE_ID}' "
           f"and bot in ('ChatGPT-User', 'Claude-User') and status < 400 "
           f"and created_at >= '{start.isoformat()}' and created_at < '{end.isoformat()}' {cond} group by 1, 2, 3")
    out = subprocess.run(DB + [sql], capture_output=True, text=True, timeout=120)
    if out.returncode:
        raise SystemExit(f"GEOInflow 查不了（docker 里的 liekan-db-1 没开？）：{out.stderr.strip()[:200]}")
    got: dict[str, Counter] = defaultdict(Counter)
    for line in out.stdout.splitlines():
        path, bot, verification, n = line.split("\t")
        key = page_key(path)
        if not key or re.search(r"\.(txt|json|xml|png|jpe?g|webp|svg|ico|pdf|css|js)$", key):
            continue                        # llms.txt、服务卡片、图片这类不是页面
        if bot == "ChatGPT-User":
            got[key]["chatgpt" if verification == "verified_range" else "chatgpt_other"] += int(n)
        else:
            got[key]["claude"] += int(n)
    return got


def cites(rows: list[dict], engine: str = "chatgpt") -> tuple[Counter, Counter, dict[str, int]]:
    """(这家引用每页的有效回答数, 所有家引用每页的有效回答数, 这家每道题的有效回答数)。"""
    one, every, per_q = Counter(), Counter(), Counter()
    for r in pr.valid(rows):
        pages = {page_key(u) for u in r.get("our_urls") or [] if own_url(u)}
        for p in pages:
            every[p] += 1
            if r["engine"] == engine:
                one[p] += 1
        if r["engine"] == engine:
            per_q[r["question_id"]] += 1
    return one, every, dict(per_q)


def questions_by_page(qs: list[dict], ids: set[str]) -> dict[str, list[str]]:
    """{页: [这次面板问了的、指向这页的题 id]}；品牌题不算。"""
    out: dict[str, list[str]] = defaultdict(list)
    for q in qs:
        if q["id"] in ids and q.get("kind") != "brand" and q.get("target_url"):
            out[page_key(q["target_url"])].append(q["id"])
    return dict(out)


def holds(qs: list[dict], exp_path: Path = pr.EXPERIMENTS) -> dict[str, str]:
    """{题 id: 为什么这题对应的页现在不能改}。冻结组（questions.json）的页 2027-01-01 前不改；
    在跑的对照实验（experiments.json 的 treated、control）的页也先不动，不然读数就不干净。"""
    out = {q["id"]: "冻结到 2027-01-01" for q in qs if q.get("set") == "frozen"}
    try:
        exps = json.loads(exp_path.read_text(encoding="utf-8")).get("experiments") or []
    except (OSError, ValueError):
        exps = []
    for e in exps:
        for qid in list(e.get("treated") or []) + list(e.get("control") or []):
            out.setdefault(qid, f"实验 {e.get('id', '')} 在跑，先不动")
    return out


def soft_holds(rows: list[dict], exp_path: Path = pr.EXPERIMENTS) -> dict[str, str]:
    """{页: 提醒}：不在冻结组、但这期面板里实验处理组的题引用了它的页。改它会动到处理组题目的「引用本站」，
    改之前先在 experiments.json 记一笔（PANEL.md「收款格子组」一节有同样的提醒）。"""
    try:
        exps = json.loads(exp_path.read_text(encoding="utf-8")).get("experiments") or []
    except (OSError, ValueError):
        exps = []
    treated = {q: e.get("id", "") for e in exps for q in e.get("treated") or []}
    out: dict[str, str] = {}
    for r in pr.valid(rows):
        if r["question_id"] in treated:
            for u in r.get("our_urls") or []:
                if own_url(u):
                    out.setdefault(page_key(u), f"实验 {treated[r['question_id']]} 处理组的题也引用这页，改前先在 experiments.json 记一笔")
    return out


def impressions(path: Path = DEMAND) -> Counter:
    try:
        pages = json.loads(path.read_text(encoding="utf-8")).get("pages") or {}
    except (OSError, ValueError):
        return Counter()
    out = Counter()
    for u, v in pages.items():
        out[page_key(u)] += int(v.get("impressions") or 0)
    return out


def classify(read: int, cited: int) -> str:
    if read >= READ_MIN:
        return "读了也被引" if cited else "读了不引"
    return "引了但没现场读" if cited else "没读也没引"


ACTION = {"读了不引": "改页面（L4）", "没读也没引": "补排名（L3）", "读了也被引": "—", "引了但没现场读": "—"}
ORDER = ["读了不引", "没读也没引", "读了也被引", "引了但没现场读"]


def table(got: dict[str, Counter], by_page: dict[str, list[str]], one: Counter, every: Counter, per_q: dict[str, int],
          imp: Counter, hold: dict[str, str] | None = None, soft: dict[str, str] | None = None) -> list[dict]:
    rows, hold, soft = [], hold or {}, soft or {}
    for page, qids in by_page.items():
        r = got.get(page, Counter())
        why = next((hold[q] for q in sorted(qids) if q in hold and hold[q].startswith("冻结")), None) \
            or next((hold[q] for q in sorted(qids) if q in hold), None) or soft.get(page)
        rows.append({"page": page, "questions": sorted(qids), "chatgpt_reads": r["chatgpt"], "chatgpt_reads_unverified": r["chatgpt_other"],
                     "claude_reads": r["claude"], "chatgpt_cited": one[page], "chatgpt_answers": sum(per_q.get(q, 0) for q in qids),
                     "all_cited": every[page], "impressions": imp[page], "class": classify(r["chatgpt"], one[page]),
                     "hold": why})
    rows.sort(key=lambda x: (ORDER.index(x["class"]), -x["impressions"], -x["chatgpt_reads"], x["page"]))
    return rows


def unasked(got: dict[str, Counter], by_page: dict[str, list[str]], one: Counter) -> list[dict]:
    """AI 读得多、面板却没有题的页（出新题的候选）。"""
    rows = [{"page": p, "chatgpt_reads": c["chatgpt"], "claude_reads": c["claude"], "chatgpt_cited": one[p]}
            for p, c in got.items() if p not in by_page and c["chatgpt"] >= NO_QUESTION_MIN]
    return sorted(rows, key=lambda x: (-x["chatgpt_reads"], x["page"]))


def report(day: str, start: datetime, end: datetime, skip_note: str, rows: list[dict], extra: list[dict], totals: dict) -> str:
    cst = lambda t: t.astimezone(pr.CST).strftime("%m-%d")
    n = Counter(r["class"] for r in rows)
    out = [f"## 读了不引：AI 现场读了哪些页、面板里引了哪些页（面板 {day}）", "",
           f"读取：{cst(start)} 到 {cst(end - timedelta(seconds=1))}（北京时间），ChatGPT-User 只算 IP 在 OpenAI 范围里的，"
           f"{READ_MIN} 次以上算「读过」；{skip_note}。引用：这期面板 ChatGPT 的有效回答。",
           f"有题指向的 {len(rows)} 页：读了不引 {n['读了不引']}、没读也没引 {n['没读也没引']}、读了也被引 {n['读了也被引']}、"
           f"引了但没现场读 {n['引了但没现场读']}。这一周 ChatGPT 现场读本站页面 {totals['chatgpt']} 次（另有 IP 对不上的 "
           f"{totals['chatgpt_other']} 次），Claude-User {totals['claude']} 次。"
           f"标「冻结」「实验在跑」的页先记下，到期或实验结束再改。", "",
           "| 页 | 分类 | 该做 | ChatGPT 现场读 | ChatGPT 引用（回答数 / 这页题的回答数） | 各家引用 | Claude-User 读 | 近 3 个月展示 | 题 |",
           "|---|---|---|---|---|---|---|---|---|"]
    for r in rows[:SHOWN]:
        todo = ACTION[r["class"]] + (f"；{r['hold']}" if r.get("hold") and ACTION[r["class"]] != "—" else "")
        out.append(f"| {r['page']} | {r['class']} | {todo} | {r['chatgpt_reads']} | {r['chatgpt_cited']}/{r['chatgpt_answers']} | "
                   f"{r['all_cited']} | {r['claude_reads']} | {r['impressions']} | {'、'.join(r['questions'][:3])}"
                   + ("…" if len(r["questions"]) > 3 else "") + " |")
    if len(rows) > SHOWN:
        out.append(f"| …另有 {len(rows) - SHOWN} 页 | | | | | | | | |")
    out += ["", f"### AI 读得多、面板却没有题的页（一周 ChatGPT 现场读 ≥ {NO_QUESTION_MIN} 次）", "",
            "这些页有人在 ChatGPT 里问到，面板却没有对应的题：要量它们，就加新题（新 id，旧题不改）。", ""]
    out += [f"- {r['page']}：ChatGPT 现场读 {r['chatgpt_reads']} 次，面板里被 ChatGPT 引 {r['chatgpt_cited']} 次，Claude-User 读 {r['claude_reads']} 次"
            for r in extra[:15]] or ["（没有）"]
    out += ["", "怎么读：「读了不引」说明 AI 拿到了页面却没选它，改页面开头、补条件和数字；「没读也没引」说明 AI 根本没拿到这页，"
            "先看行动清单里这页的题在 Google 排第几。ChatGPT-User 的读取来自所有用户，不只面板的题；读得少也可能只是没人问。", ""]
    return "\n".join(out)


def latest_results() -> Path | None:
    files = sorted(p for p in pr.PANEL.glob("results-*.json") if pr.RESULT_NAME.match(p.name))
    return files[-1] if files else None


def cmd_run(a) -> int:
    path = Path(a.results) if a.results else latest_results()
    if not path or not path.exists():
        raise SystemExit("找不到面板结果文件（ops/geo/panel/results-<日期>.json）")
    res = json.loads(path.read_text(encoding="utf-8"))
    day, rows = res["date"], res["rows"]
    start, end = window(day, a.days)
    runs = panel_runs(start, end)
    if runs is None:
        d0 = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=pr.CST)
        runs, skip_note = [(d0.astimezone(timezone.utc), (d0 + timedelta(days=1)).astimezone(timezone.utc))], \
            "gh 查不到面板运行时间，整天去掉了面板那天"
    else:
        skip_note = f"去掉了面板自己运行的 {len(runs)} 个时段" if runs else "窗口里没有面板运行"
    got = reads(start, end, runs)
    qs = pr.load_questions(list(pr.SETS))
    by_page = questions_by_page(qs, {r["question_id"] for r in rows})
    one, every, per_q = cites(rows)
    out_rows = table(got, by_page, one, every, per_q, impressions(), holds(qs), soft_holds(rows))
    extra = unasked(got, by_page, one)
    totals = {k: sum(c[k] for c in got.values()) for k in ("chatgpt", "chatgpt_other", "claude")}
    text = report(day, start, end, skip_note, out_rows, extra, totals)
    public = {"date": day, "window_utc": [start.isoformat(), end.isoformat()], "days": a.days, "read_min": READ_MIN,
              "panel_runs_skipped": len(runs), "skip_note": skip_note, "totals": totals,
              "classes": dict(Counter(r["class"] for r in out_rows)), "pages": out_rows, "unasked": extra,
              "script": pr.file_hash(Path(__file__))}
    if a.out:
        Path(a.out).write_text(text + "\n", encoding="utf-8")
    if a.public:
        Path(a.public).write_text(json.dumps(public, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    c = public["classes"]
    print(f"读了不引（面板 {day}）：有题指向的 {len(out_rows)} 页，读了不引 {c.get('读了不引', 0)}、没读也没引 {c.get('没读也没引', 0)}、"
          f"读了也被引 {c.get('读了也被引', 0)}、引了但没现场读 {c.get('引了但没现场读', 0)}；ChatGPT 现场读 {totals['chatgpt']} 次；"
          f"没题但读得多的页 {len(extra)} 个；{skip_note}")
    if not a.out:
        print(text)
    return 0


def selftest() -> int:
    assert page_key("https://jasonzhu.ai/en/go-global") == "/go-global" and page_key("jasonzhu.ai/") == "/"
    assert page_key("jasonzhu.ai/en") == "/" and page_key("/zh/blog/x/?a=1") == "/blog/x" and page_key("/") == "/"
    assert page_key("https://www.jasonzhu.ai/zh/about#top") == "/about" and page_key("") == ""
    assert own_url("jasonzhu.ai/en/x") and own_url("https://jasonzhuai.vercel.app/en") and not own_url("other.example/x")
    s, e = window("2026-11-23")
    assert s.isoformat() == "2026-11-16T16:00:00+00:00" and e.isoformat() == "2026-11-23T16:00:00+00:00", (s, e)
    assert classify(2, 0) == "读了不引" and classify(5, 1) == "读了也被引" and classify(1, 1) == "引了但没现场读" and classify(0, 0) == "没读也没引"
    rows = [{"engine": "chatgpt", "question_id": "q1", "status": "answered", "our_urls": ["jasonzhu.ai/en/a", "jasonzhu.ai/zh/a"]},
            {"engine": "chatgpt", "question_id": "q1", "status": "answered", "our_urls": []},
            {"engine": "chatgpt", "question_id": "q2", "status": "refused", "our_urls": ["jasonzhu.ai/en/b"]},     # 拒答不算
            {"engine": "perplexity", "question_id": "q2", "status": "answered", "our_urls": ["jasonzhu.ai/en/b", "other.example/x"]}]
    one, every, per_q = cites(rows)
    assert one == {"/a": 1} and every == {"/a": 1, "/b": 1} and per_q == {"q1": 2}, (one, every, per_q)
    qs = [{"id": "q1", "target_url": "https://jasonzhu.ai/en/a"}, {"id": "q2", "target_url": "https://jasonzhu.ai/en/b"},
          {"id": "q3", "target_url": "https://jasonzhu.ai/en/c"}, {"id": "qb", "kind": "brand", "target_url": "https://jasonzhu.ai/en"}]
    by_page = questions_by_page(qs, {"q1", "q2", "qb"})
    assert by_page == {"/a": ["q1"], "/b": ["q2"]}, by_page          # q3 这次没问，品牌题不算
    got = {"/a": Counter(chatgpt=3, claude=1), "/b": Counter(chatgpt=4), "/hot": Counter(chatgpt=9, chatgpt_other=2)}
    t = table(got, by_page, one, every, per_q, Counter({"/b": 50}), {"q2": "冻结到 2027-01-01"})
    assert [(r["page"], r["class"]) for r in t] == [("/b", "读了不引"), ("/a", "读了也被引")], t
    assert t[0]["chatgpt_answers"] == 0 and t[0]["all_cited"] == 1 and t[1]["chatgpt_cited"] == 1 and t[1]["chatgpt_answers"] == 2
    ex = unasked(got, by_page, one)
    assert [r["page"] for r in ex] == ["/hot"], ex
    s, e = window("2026-11-23")
    text = report("2026-11-23", s, e, "窗口里没有面板运行", t, ex, {"chatgpt": 16, "chatgpt_other": 2, "claude": 1})
    assert "| /b | 读了不引 | 改页面（L4）；冻结到 2027-01-01 | 4 | 0/0 | 1 | 0 | 50 | q2 |" in text, text
    assert "| /a | 读了也被引 | — |" in text, text
    h = holds([{"id": "f1", "set": "frozen"}, {"id": "r1", "set": "real"}, {"id": "r2", "set": "real"}],
              Path("/nonexistent/experiments.json"))
    assert h == {"f1": "冻结到 2027-01-01"}, h
    t2 = table(got, by_page, one, every, per_q, Counter(), {}, {"/b": "实验 x 处理组的题也引用这页，改前先在 experiments.json 记一笔"})
    assert t2[0]["page"] == "/b" and t2[0]["hold"].startswith("实验 x 处理组"), t2
    assert "11-17 到 11-23" in text and "- /hot：ChatGPT 现场读 9 次" in text, text
    assert "other.example" not in text and "other.example" not in json.dumps(t), "公开文件和报告里不能有别的网站"
    print("read_vs_cited selftest ok")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="按页对读取和引用")
    r.add_argument("--results", help="面板结果文件，默认最新一期")
    r.add_argument("--days", type=int, default=DAYS)
    r.add_argument("--out", help="报告（markdown）写到这里；不给就打到标准输出")
    r.add_argument("--public", help="只有本站路径和计数的结果，可以提交到公开仓库")
    return cmd_run(ap.parse_args())


if __name__ == "__main__":
    sys.exit(main())
