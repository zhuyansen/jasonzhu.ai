"""The week's new sellers from the payment-link history, as Markdown and CSV for the weekly issue.

    python weekly_report.py [YYYY-MM-DD]      # the week ending that day (default: yesterday)

A seller belongs to the week its first checkout link was seen (first_seen). Builders' default
words are cleared and sites on a link shared by five or more sites (networks, copied links) are
left out first, as in the history summary. Research only: the rows are DataForSEO's; publish
counts and your own picks, not the lists.
"""
from __future__ import annotations

import csv
import os
import sqlite3
import sys
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, os.environ.get("RADAR_SRC", str(Path.home() / "content/new-term-radar")))
from radar import seller_history, sellers  # noqa: E402

# 路径可由环境变量覆盖（GitHub Actions 里 .github/workflows/seller-weekly.yml 用），默认是本机的位置
DB = Path(os.environ.get("SELLER_DB", Path.home() / "content/new-term-radar/state/sellers_history.db"))
OUT = Path(os.environ.get("SELLER_EXPORTS", Path.home() / "content/new-term-radar/state/exports/weekly"))
WEEKS_BACK = 8
LIST_MAX = 80
RANK_MAX = 350          # as signal 8: past this, a site is a platform where someone posted the link
KIND_ZH = {"ai": "软件（含 AI）", "template": "模板/素材", "course": "课程/培训/咨询", "content": "内容/电子书/社区",
           "physical": "实物", "donation": "捐款/新闻/公益", "other": "其他", None: "读不到或未分类"}


def week_rows(db: sqlite3.Connection, start: str, end: str) -> list[dict]:
    keys = ["platform", "host", "first_seen", "kind", "ai", "title", "description", "page", "link", "rank"]
    q = f"""SELECT {', '.join(keys)} FROM sites WHERE pays = 1 AND network = 0 AND first_seen >= ? AND first_seen <= ?
            ORDER BY rank DESC"""
    return [dict(zip(keys, r)) for r in db.execute(q, (start, end))]


def weekly_counts(db: sqlite3.Connection, end: date) -> list[tuple[str, int, int, int]]:
    """(week ending, sellers, software, AI) for the WEEKS_BACK weeks up to `end`."""
    out = []
    for i in range(WEEKS_BACK - 1, -1, -1):
        e = end - timedelta(days=7 * i)
        s = e - timedelta(days=6)
        n, sw, ai = db.execute("""SELECT count(*), sum(kind = 'ai'), sum(ai = 1) FROM sites WHERE pays = 1 AND network = 0
                                  AND first_seen >= ? AND first_seen <= ?""", (s.isoformat(), e.isoformat())).fetchone()
        out.append((e.isoformat(), n or 0, sw or 0, ai or 0))
    return out


def second_platform(db: sqlite3.Connection, start: str, end: str) -> list[tuple[str, str, str]]:
    """Sellers whose checkout on one platform is new this week while another platform's is older: (host, new, old)."""
    q = """SELECT n.host, n.platform, group_concat(DISTINCT o.platform) FROM sites n JOIN sites o ON o.host = n.host
           AND o.platform != n.platform AND o.pays = 1 AND o.first_seen < ?
           WHERE n.pays = 1 AND n.network = 0 AND n.first_seen >= ? AND n.first_seen <= ? GROUP BY n.host, n.platform"""
    return db.execute(q, (start, start, end)).fetchall()


def markdown(start: str, end: str, rows: list[dict], counts: list, moved: list) -> str:
    plat = Counter(r["platform"] for r in rows)
    kinds = Counter(r["kind"] for r in rows)
    sorted_ = [r for r in rows if r["kind"]]
    sw = sorted((r for r in rows if (r["kind"] == "ai" or r["ai"] == 1) and r["title"] and r["rank"] <= RANK_MAX
                 and sellers.own_page(r["page"])), key=lambda r: (r["ai"] != 1, -r["rank"]))   # a platform's page is no seller
    lines = [f"# 本周新卖家（{start} 至 {end}）", "",
             f"{len(rows):,} 个卖家第一次挂上收款链接（不含站群和建站平台默认页）。已分类 {len(sorted_):,} 个，其中卖软件（含 AI）"
             f" {sum(1 for r in sorted_ if r['kind'] == 'ai'):,} 个，AI 产品 {sum(1 for r in sorted_ if r['ai'] == 1):,} 个。", "",
             "| 平台 | 新卖家 |", "|---|---|"]
    lines += [f"| {sellers.LABEL.get(p, p)} | {n:,} |" for p, n in plat.most_common()]
    lines += ["", "| 卖什么 | 个数 |", "|---|---|"] + [f"| {KIND_ZH.get(k, k)} | {n:,} |" for k, n in kinds.most_common()]
    lines += ["", "## 最近几周", "", "| 周末 | 新卖家 | 卖软件 | AI 产品 |", "|---|---|---|---|"]
    lines += [f"| {e} | {n:,} | {s:,} | {a:,} |" for e, n, s, a in counts]
    lines += ["", "最近一两周的数字会继续涨：链接图要几天到几周才收录新链接。", ""]
    if moved:
        lines += ["## 加了第二个收款平台的", "", "| 网站 | 本周新加 | 之前用的 |", "|---|---|---|"]
        lines += [f"| {h} | {sellers.LABEL.get(n, n)} | {', '.join(sellers.LABEL.get(o, o) for o in old.split(','))} |" for h, n, old in moved[:30]]
        lines.append("")
    lines += [f"## 本周的软件和 AI 卖家（AI 在前；收款链接在它自己的首页、价格页或产品页；前 {LIST_MAX} 个）", "", "| 网站 | 平台 | AI | 它自己的说法 |", "|---|---|---|---|"]
    for r in sw[:LIST_MAX]:
        what = ((r["title"] or "") + (" — " + r["description"] if r["description"] else "")).replace("|", "/").replace("\n", " ")[:120]
        lines.append(f"| {r['host']} | {sellers.LABEL.get(r['platform'], r['platform'])} | {'是' if r['ai'] == 1 else ''} | {what} |")
    lines += ["", "数据来自 DataForSEO，只做研究用：公开时只用数字和自己挑过的产品，不发名单。"]
    return "\n".join(lines) + "\n"


def main() -> None:
    end = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else date.today() - timedelta(days=1)
    start = end - timedelta(days=6)
    db = sqlite3.connect(DB, timeout=60)
    seller_history.drop_shared(db)
    seller_history.clean_defaults(db)
    seller_history.mark_networks(db)
    rows = week_rows(db, start.isoformat(), end.isoformat())
    OUT.mkdir(parents=True, exist_ok=True)
    md = markdown(start.isoformat(), end.isoformat(), rows, weekly_counts(db, end), second_platform(db, start.isoformat(), end.isoformat()))
    (OUT / f"{end.isoformat()}.md").write_text(md, encoding="utf-8")
    with (OUT / f"{end.isoformat()}.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]) if rows else ["host"])
        w.writeheader()
        w.writerows(rows)
    print(md[:1500])
    print(f"written: {OUT / (end.isoformat() + '.md')}")


if __name__ == "__main__":
    main()
