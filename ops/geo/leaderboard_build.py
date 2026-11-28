#!/usr/bin/env python3
"""月度 AI 可见度公开榜单提取器（支持选题 A「收款/MoR」与选题 B「中国出海 AI 工具」）。

设计原则（吸收 GrowthX AI CheckThat.ai + daydream AI Visibility Leaderboard 最佳实践）：
  1. 多轮采样抗噪：聚合本月多份周度 panel-full.json 或多轮实时采样 JSON，输出：
     - mention_rate_pct（品牌提及率）
     - cited_rate_pct（品牌官网直引率）
     - first_mention_rate_pct（答案中首个推荐品牌占比）
     - ci95_low / ci95_high（Wilson 95% 置信区间）
     - round_min_pct / round_max_pct（跨轮次/跨周最小-最大波动区间，透明展示 59% 单日抽样噪声）
  2. 绝对克制护栏（Self-Rank Guard）：关联品牌/自家站点自动标注 `is_affiliated: true`，默认只排第三方赛道品牌，绝不把自己排第一。
  3. 隐私合规：仅把聚合统计写入公开仓库 `src/generated/ai-visibility-leaderboard.json` 与 `public/data/ai-visibility/*.csv`，
     原始 AI 回答文本与付费接口原始日志绝不进入公开仓库（仅可写本地 `--raw-out /Users/zhuyansen/出海/specs/...`）。
  4. 零伪造红线：未喂入真实采样文件时，自动导出 `status: "awaiting_first_run"` 骨架（不含任何假数字），页面透明展示题库与方法论原型。

用法：
  python3 ops/geo/leaderboard_build.py --selftest
  # 初始化原型骨架（零假数据，生成 src/generated/ai-visibility-leaderboard.json + CSV 模板）
  python3 ops/geo/leaderboard_build.py init-skeleton
  # 用 1–4 份真实 panel-full.json 聚合出真实月榜（选题 A 或选题 B）
  python3 ops/geo/leaderboard_build.py aggregate --board payments-mor --period 2026-11 --inputs /tmp/panel-full-w1.json /tmp/panel-full-w2.json
  # 针对独立题库（如选题 B）跑预算封顶的多轮实时采样（默认 3 轮，预算上限 --max-usd 0.60）
  python3 ops/geo/leaderboard_build.py run-live --board china-ai-global --period 2026-11 --rounds 3 --max-usd 0.60 --raw-out /Users/zhuyansen/出海/specs/lb-china-ai-raw-2026-11.json
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = ROOT / "ops" / "geo" / "leaderboard-configs"
OUT_JSON = ROOT / "src" / "generated" / "ai-visibility-leaderboard.json"
OUT_CSV_DIR = ROOT / "public" / "data" / "ai-visibility"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
SITE = "https://jasonzhu.ai"


def wilson_ci95(hits: int, n: int) -> tuple[float, float]:
    """计算二项比例的 Wilson 95% 置信区间（返回 0–100 百分比，保留 1 位小数）。"""
    if n <= 0:
        return 0.0, 0.0
    z = 1.959963984540054
    p = hits / n
    denom = 1.0 + (z * z) / n
    center = (p + (z * z) / (2.0 * n)) / denom
    half = (z * math.sqrt((p * (1.0 - p) + (z * z) / (4.0 * n)) / n)) / denom
    lo = max(0.0, (center - half) * 100.0)
    hi = min(100.0, (center + half) * 100.0)
    return round(lo, 1), round(hi, 1)


def host_of(url: str) -> str:
    try:
        h = (urllib.parse.urlsplit(url).hostname or "").lower()
        return h[4:] if h.startswith("www.") else h
    except Exception:
        return ""


def compile_brand_patterns(brands: list[dict[str, Any]]) -> list[dict[str, Any]]:
    compiled = []
    for b in brands:
        pats = []
        for alias in b.get("aliases") or [b["name"]]:
            a = alias.strip()
            if not a:
                continue
            # 英文短词使用严格词边界，避免误命中子串（例如 polar 命中 bipolar）
            esc = re.escape(a)
            pats.append(re.compile(rf"(?<![A-Za-z0-9]){esc}(?![A-Za-z0-9])", re.I))
        domains = {d.lower().lstrip("www.") for d in (b.get("domains") or [])}
        compiled.append({**b, "_pats": pats, "_domains": domains})
    return compiled


def find_first_pos(text: str, pats: list[re.Pattern[str]]) -> int | None:
    best: int | None = None
    for pat in pats:
        m = pat.search(text)
        if m:
            pos = m.start()
            if best is None or pos < best:
                best = pos
    return best


def normalize_answers(raw_obj: Any, source_label: str) -> list[dict[str, Any]]:
    """兼容 panel-full.json（answers / rows）与 leaderboard_build run-live 的原始采样结构。"""
    rows = raw_obj if isinstance(raw_obj, list) else (raw_obj.get("answers") or raw_obj.get("rows") or [])
    out: list[dict[str, Any]] = []
    for r in rows:
        if not isinstance(r, dict):
            continue
        qid = str(r.get("question_id") or r.get("id") or "").strip()
        engine = str(r.get("engine") or "unknown").strip().lower()
        text = str(r.get("answer") or r.get("text") or r.get("content") or r.get("response") or "")
        round_key = f"{source_label}#s{r.get('sample', r.get('round', 0))}"
        cited_hosts: set[str] = set()
        for c in r.get("cited") or r.get("citations") or []:
            u = c.get("url") if isinstance(c, dict) else str(c)
            h = host_of(u)
            if h:
                cited_hosts.add(h)
        out.append({
            "question_id": qid,
            "engine": engine,
            "round_key": round_key,
            "text": text,
            "cited_hosts": cited_hosts,
        })
    return out


def aggregate_board(config: dict[str, Any], raw_records: list[dict[str, Any]], period: str) -> dict[str, Any]:
    """按榜单配置聚合多轮回答，计算推荐率、官网直引率、首位率、95% CI 与跨轮波动区间。"""
    allowed_qids = {q["id"] for q in config.get("questions") or []}
    prefixes = tuple(config.get("question_filter_prefixes") or [])

    matched = [
        r for r in raw_records
        if (r["question_id"] in allowed_qids) or (prefixes and r["question_id"].startswith(prefixes))
    ]
    brands = compile_brand_patterns(config.get("brands") or [])
    affiliated_set = {x.lower() for x in (config.get("affiliated_brands") or [])}

    n_total = len(matched)
    engines = sorted({r["engine"] for r in matched})
    rounds = sorted({r["round_key"] for r in matched})
    qids_covered = sorted({r["question_id"] for r in matched})

    # 统计每个品牌的总体 / 分引擎 / 分轮次命中
    mentions: dict[str, int] = defaultdict(int)
    citations: dict[str, int] = defaultdict(int)
    first_picks: dict[str, int] = defaultdict(int)
    by_engine_hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    by_engine_total: dict[str, int] = defaultdict(int)
    by_round_hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    by_round_total: dict[str, int] = defaultdict(int)

    for rec in matched:
        eng = rec["engine"]
        rk = rec["round_key"]
        by_engine_total[eng] += 1
        by_round_total[rk] += 1

        # 找出所有命中品牌及其首次出现位置（判断 First-Mention 首位推荐）
        positions: list[tuple[int, str]] = []
        for b in brands:
            bid = b["id"]
            pos = find_first_pos(rec["text"], b["_pats"])
            domain_hit = any(
                h == d or h.endswith("." + d)
                for h in rec["cited_hosts"]
                for d in b["_domains"]
            )
            if pos is not None or domain_hit:
                mentions[bid] += 1
                by_engine_hits[bid][eng] += 1
                by_round_hits[bid][rk] += 1
            if domain_hit:
                citations[bid] += 1
            if pos is not None:
                positions.append((pos, bid))
        if positions:
            positions.sort(key=lambda x: x[0])
            first_picks[positions[0][1]] += 1

    rankings: list[dict[str, Any]] = []
    for b in brands:
        bid = b["id"]
        m_cnt = mentions[bid]
        c_cnt = citations[bid]
        f_cnt = first_picks[bid]
        m_pct = round((m_cnt / n_total) * 100.0, 1) if n_total else 0.0
        c_pct = round((c_cnt / n_total) * 100.0, 1) if n_total else 0.0
        f_pct = round((f_cnt / n_total) * 100.0, 1) if n_total else 0.0
        ci_lo, ci_hi = wilson_ci95(m_cnt, n_total)

        round_pcts = [
            round((by_round_hits[bid].get(rk, 0) / by_round_total[rk]) * 100.0, 1)
            for rk in rounds
            if by_round_total[rk] > 0
        ]
        r_min = min(round_pcts) if round_pcts else 0.0
        r_max = max(round_pcts) if round_pcts else 0.0

        eng_breakdown = {
            e: round((by_engine_hits[bid].get(e, 0) / by_engine_total[e]) * 100.0, 1)
            for e in engines
            if by_engine_total[e] > 0
        }
        is_aff = (bid.lower() in affiliated_set) or any(d in affiliated_set for d in b["_domains"])
        rankings.append({
            "brand_id": bid,
            "name": b["name"],
            "origin": b.get("origin", "global_incumbent"),
            "category": b.get("category", ""),
            "domains": b.get("domains") or [],
            "is_affiliated": is_aff,
            "mentions": m_cnt,
            "mention_rate_pct": m_pct,
            "ci95_low": ci_lo,
            "ci95_high": ci_hi,
            "round_min_pct": r_min,
            "round_max_pct": r_max,
            "cited_rate_pct": c_pct,
            "first_mention_rate_pct": f_pct,
            "by_engine": eng_breakdown,
        })

    # 按推荐率降序，再按首位推荐率与官网直引率排序；关联品牌强制后置披露，绝不自吹第一
    rankings.sort(key=lambda x: (x["is_affiliated"], -x["mention_rate_pct"], -x["first_mention_rate_pct"], -x["cited_rate_pct"], x["name"]))
    for idx, row in enumerate(rankings, start=1):
        row["rank"] = idx

    return {
        "id": config["id"],
        "status": "published" if n_total > 0 else "awaiting_first_run",
        "period": period,
        "title_en": config["title_en"],
        "title_zh": config["title_zh"],
        "subtitle_en": config["subtitle_en"],
        "subtitle_zh": config["subtitle_zh"],
        "cadence": config.get("cadence", "monthly"),
        "methodology": {
            "frozen_questions": len(config.get("questions") or []),
            "questions_sampled": len(qids_covered),
            "total_answers": n_total,
            "rounds": len(rounds),
            "engines": engines,
            "self_rank_policy": "Affiliated domains/products are disclosed and excluded from #1 self-promotion.",
            "noise_disclosure": "AI recommendations vary up to ~50-60% across single-day runs; we publish Wilson 95% CI and cross-round min-max spread.",
        },
        "questions_preview": config.get("questions") or [],
        "rankings": rankings,
        "csv_path": f"/data/ai-visibility/{config['id']}.csv",
    }


def write_board_csv(board: dict[str, Any], out_dir: Path = OUT_CSV_DIR) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    p = out_dir / f"{board['id']}.csv"
    fieldnames = [
        "period", "status", "rank", "brand_id", "name", "origin", "category",
        "mention_rate_pct", "ci95_low", "ci95_high", "round_min_pct", "round_max_pct",
        "cited_rate_pct", "first_mention_rate_pct", "total_answers", "rounds", "is_affiliated",
    ]
    with p.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in board["rankings"]:
            w.writerow({
                "period": board["period"],
                "status": board["status"],
                "rank": r["rank"],
                "brand_id": r["brand_id"],
                "name": r["name"],
                "origin": r["origin"],
                "category": r["category"],
                "mention_rate_pct": r["mention_rate_pct"],
                "ci95_low": r["ci95_low"],
                "ci95_high": r["ci95_high"],
                "round_min_pct": r["round_min_pct"],
                "round_max_pct": r["round_max_pct"],
                "cited_rate_pct": r["cited_rate_pct"],
                "first_mention_rate_pct": r["first_mention_rate_pct"],
                "total_answers": board["methodology"]["total_answers"],
                "rounds": board["methodology"]["rounds"],
                "is_affiliated": r["is_affiliated"],
            })
    return p


def load_all_configs(cfg_dir: Path = CONFIG_DIR) -> dict[str, dict[str, Any]]:
    out = {}
    for p in sorted(cfg_dir.glob("*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        out[d["id"]] = d
    return out


def save_generated(boards: dict[str, dict[str, Any]], out_json: Path = OUT_JSON) -> None:
    now_iso = datetime.now(timezone(timedelta(hours=8))).date().isoformat()
    payload = {
        "schema_version": 1,
        "generated_at": now_iso,
        "license": "CC BY 4.0",
        "boards": [boards[k] for k in sorted(boards.keys())],
    }
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_existing_boards(out_json: Path = OUT_JSON) -> dict[str, dict[str, Any]]:
    if not out_json.exists():
        return {}
    try:
        data = json.loads(out_json.read_text(encoding="utf-8"))
        return {b["id"]: b for b in data.get("boards") or []}
    except Exception:
        return {}


def load_env_key(name: str) -> str:
    if os.environ.get(name):
        return os.environ[name]
    for p in (Path.home() / ".claude" / ".env", ROOT / ".env.local", ROOT / ".env"):
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
            s = line.strip()
            if s and not s.startswith("#") and "=" in s:
                k, v = s.split("=", 1)
                if k.strip() == name:
                    return v.strip().strip('"').strip("'")
    return ""


def openrouter_sample(api_key: str, model: str, question: str) -> dict[str, Any]:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": question}],
        "max_tokens": 700,
        "temperature": 0.2,
    }
    req = urllib.request.Request(
        OPENROUTER_URL,
        method="POST",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": SITE,
            "X-Title": "jasonzhu-ai-visibility-index",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    msg = (data.get("choices") or [{}])[0].get("message") or {}
    usage = data.get("usage") or {}
    cites = []
    for c in data.get("citations") or []:
        cites.append(c if isinstance(c, str) else c.get("url", ""))
    for ann in msg.get("annotations") or []:
        uc = ann.get("url_citation") or {}
        if uc.get("url"):
            cites.append(uc["url"])
    return {
        "text": msg.get("content") or "",
        "citations": [c for c in cites if c],
        "cost_usd": float(usage.get("cost") or 0.0),
    }


def cmd_run_live(args: argparse.Namespace) -> int:
    configs = load_all_configs()
    if args.board not in configs:
        raise SystemExit(f"未知榜单 ID: {args.board}（可选：{', '.join(configs.keys())}）")
    cfg = configs[args.board]
    api_key = load_env_key("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("缺少 OPENROUTER_API_KEY（检查环境变量或 ~/.claude/.env）")

    models = [m.strip() for m in args.models.split(",") if m.strip()]
    total_cost = 0.0
    raw_answers: list[dict[str, Any]] = []
    for rnd in range(1, args.rounds + 1):
        for model in models:
            eng = model.split("/")[0]
            for q in cfg["questions"]:
                if total_cost >= args.max_usd:
                    print(f"[budget] 达到预算上限 ${total_cost:.4f} >= ${args.max_usd:.2f}，停止采样")
                    break
                res = openrouter_sample(api_key, model, q["question"])
                total_cost += res["cost_usd"]
                raw_answers.append({
                    "question_id": q["id"],
                    "engine": eng,
                    "model": model,
                    "round": rnd,
                    "text": res["text"],
                    "citations": res["citations"],
                })
            if total_cost >= args.max_usd:
                break
        if total_cost >= args.max_usd:
            break

    if args.raw_out:
        rp = Path(args.raw_out)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(json.dumps({"board": args.board, "period": args.period, "cost_usd": round(total_cost, 4), "answers": raw_answers}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"已将原始采样写入本地（不进公开库）：{rp}")

    normalized = normalize_answers(raw_answers, source_label="live")
    board = aggregate_board(cfg, normalized, period=args.period)
    boards = load_existing_boards()
    for cid, c in configs.items():
        if cid not in boards:
            boards[cid] = aggregate_board(c, [], period=args.period)
    boards[args.board] = board
    save_generated(boards)
    csv_p = write_board_csv(board)
    print(f"完成实时采样聚合：{args.board}，样本={board['methodology']['total_answers']}，花费=${total_cost:.4f}，CSV={csv_p}")
    return 0


def selftest() -> int:
    lo, hi = wilson_ci95(6, 10)
    assert 25.0 < lo < 35.0 and 80.0 < hi < 90.0, (lo, hi)

    cfg = {
        "id": "test-board",
        "title_en": "Test Board",
        "title_zh": "测试榜",
        "subtitle_en": "Sub",
        "subtitle_zh": "副标题",
        "affiliated_brands": ["jasonzhu.ai"],
        "question_filter_prefixes": ["q-"],
        "questions": [{"id": "q-1", "category": "MoR", "question": "Best MoR?"}],
        "brands": [
            {"id": "paddle", "name": "Paddle", "origin": "global_incumbent", "category": "MoR", "domains": ["paddle.com"], "aliases": ["paddle"]},
            {"id": "creem", "name": "Creem", "origin": "challenger", "category": "MoR", "domains": ["creem.io"], "aliases": ["creem"]},
            {"id": "polar", "name": "Polar", "origin": "challenger", "category": "MoR", "domains": ["polar.sh"], "aliases": ["polar"]},
        ],
    }
    raw = normalize_answers([
        {"question_id": "q-1", "engine": "chatgpt", "sample": 1, "text": "Paddle is the top choice, followed by Creem. Note: bipolar is unrelated.", "cited": [{"url": "https://www.paddle.com/pricing"}]},
        {"question_id": "q-1", "engine": "perplexity", "sample": 2, "text": "Creem and Paddle both work well for AI SaaS.", "cited": [{"url": "https://creem.io/fees"}]},
    ], source_label="w1")
    board = aggregate_board(cfg, raw, period="2026-11")
    assert board["status"] == "published"
    by_id = {r["brand_id"]: r for r in board["rankings"]}
    # Polar must NOT match "bipolar"!
    assert by_id["polar"]["mentions"] == 0, by_id["polar"]
    assert by_id["paddle"]["mention_rate_pct"] == 100.0
    assert by_id["paddle"]["cited_rate_pct"] == 50.0
    assert by_id["paddle"]["first_mention_rate_pct"] == 50.0
    assert by_id["creem"]["first_mention_rate_pct"] == 50.0
    assert by_id["paddle"]["round_min_pct"] == 100.0 and by_id["paddle"]["round_max_pct"] == 100.0

    # Verify real configs load cleanly
    real_cfgs = load_all_configs()
    assert "payments-mor" in real_cfgs and "china-ai-global" in real_cfgs
    print("leaderboard_build selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="月度 AI 可见度公开榜单聚合与实时采样脚本")
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")

    sk = sub.add_parser("init-skeleton", help="用冻结题库与品牌表初始化零假数据的原型骨架")
    sk.add_argument("--period", default=datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m"))

    ag = sub.add_parser("aggregate", help="从 1–N 份本地 panel-full.json 聚合公开榜单 JSON 与 CSV")
    ag.add_argument("--board", required=True, help="榜单 ID（payments-mor 或 china-ai-global）")
    ag.add_argument("--period", required=True, help="期数 YYYY-MM")
    ag.add_argument("--inputs", nargs="+", required=True, help="本地 panel-full.json 文件路径列表")

    lv = sub.add_parser("run-live", help="通过 OpenRouter 跑预算封顶的多轮实时采样并聚合")
    lv.add_argument("--board", required=True)
    lv.add_argument("--period", default=datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m"))
    lv.add_argument("--rounds", type=int, default=3)
    lv.add_argument("--models", default="perplexity/sonar")
    lv.add_argument("--max-usd", type=float, default=0.60)
    lv.add_argument("--raw-out", default="", help="原始回答本地保存路径（务必存 specs/ 或 /tmp，绝不进公开库）")

    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.cmd == "init-skeleton":
        configs = load_all_configs()
        boards = {}
        for cid, cfg in configs.items():
            b = aggregate_board(cfg, [], period=args.period)
            boards[cid] = b
            write_board_csv(b)
        save_generated(boards)
        print(f"已初始化 {len(boards)} 个榜单零假数据骨架：{OUT_JSON}")
        return 0
    if args.cmd == "aggregate":
        configs = load_all_configs()
        if args.board not in configs:
            raise SystemExit(f"未知榜单 ID: {args.board}")
        all_recs: list[dict[str, Any]] = []
        for idx, inp in enumerate(args.inputs, start=1):
            raw = json.loads(Path(inp).read_text(encoding="utf-8"))
            all_recs.extend(normalize_answers(raw, source_label=f"f{idx}"))
        board = aggregate_board(configs[args.board], all_recs, period=args.period)
        boards = load_existing_boards()
        for cid, c in configs.items():
            if cid not in boards:
                boards[cid] = aggregate_board(c, [], period=args.period)
        boards[args.board] = board
        save_generated(boards)
        csv_p = write_board_csv(board)
        print(f"聚合完成：{args.board}（{board['status']}，样本={board['methodology']['total_answers']}），输出 {OUT_JSON} 与 {csv_p}")
        return 0
    if args.cmd == "run-live":
        return cmd_run_live(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
