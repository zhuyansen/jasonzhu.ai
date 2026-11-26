#!/usr/bin/env python3
"""导出本机 GEOInflow（Docker 容器 liekan-db-1）里 jasonzhu.ai 的历史日志（2026-10-26 起至 CUTOVER）。只用标准库。

做两件事：
  1. 本机原始归档（只保留 ip_masked，不导出 ip_hash 或完整 IP），存在仓库外：
     /Users/zhuyansen/出海/specs/geoinflow-archive/
     （jasonzhu-ai-liekan-log-2026-10-26-to-<YYYYMMDDTHHMMZ>.csv.gz + manifest.json）
  2. 回填 Supabase 长期历史表 public.ai_crawler_daily（origin = 'geoinflow'，label_set = 'geoinflow'，
     保留 GEOInflow 旧核验标签 verification / reason，不与新表 A1 标签混淆）。
     - 用户触发类（bot_type = '用户触发'）：保留精确到秒的 at 和完整干净路径，供 read_vs_cited.py 按北京时间窗口和排除面板时段统计。
     - 其余类型：完整保留机器可读文件（robots.txt / llms.txt / sitemap.xml 等）的精确路径；
       其他路径折叠到栏目层（/<seg1> 或 /<zh|en>/<seg2>；若前缀撞到机器可读文件名，加 /_ 防误计），
       体积缩 10 倍，且 crawler_stats.py / crawler_report.py 的统计结果逐字一致。
     - 每天记 24 位 UTC 小时掩码 hours 和每组最早时间 first_at。

幂等：写库时先删旧的 origin = 'geoinflow' 行再分批写入，并在最后核对总条数一致。

用法：
  python3 ops/geo/geoinflow_export.py --selftest
  python3 ops/geo/geoinflow_export.py --archive-only
  python3 ops/geo/geoinflow_export.py --cutover 2026-11-26T14:00:00Z
"""
from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import io
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import crawler_db as db  # noqa: E402

CONTAINER = "liekan-db-1"
SITE_ID = "a11d5ca8-c6e3-4683-bab7-808caef7fdff"
START_UTC = "2026-10-26T00:00:00+00:00"
ARCHIVE_DIR = Path("/Users/zhuyansen/出海/specs/geoinflow-archive")
MACHINE_FILES = (
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/llms-full.txt",
    "/ai.txt",
    "/agents.md",
    "/.well-known/mcp/server-card.json",
)
MASKED_RE = re.compile(r"^(?:$|\d{1,3}\.\d{1,3}\.\d{1,3}\.0/24|[0-9a-f:]+::/48)$", re.I)
BATCH_SIZE = 800


def clean_path(raw: str) -> str:
    p = (raw or "").split("?", 1)[0].split("#", 1)[0]
    return p[:500]


def collapse_path(raw: str, bot_type: str) -> str:
    p = clean_path(raw)
    if bot_type == "用户触发" or p in MACHINE_FILES:
        return p
    if not p.startswith("/"):
        return ":"
    if p in ("/", "/zh", "/en"):
        return p
    parts = p.split("/")
    seg1 = parts[1] if len(parts) > 1 else ""
    if seg1 in ("zh", "en"):
        seg2 = parts[2] if len(parts) > 2 else ""
        bucket = f"/{seg1}/{seg2}" if seg2 else f"/{seg1}"
    else:
        bucket = f"/{seg1}"
    # 防止像 /robots.txt/foo 折叠成 /robots.txt 误撞 MACHINE_FILES
    if bucket in MACHINE_FILES and p != bucket:
        bucket += "/_"
    return bucket[:500]


def psql_csv(sql: str) -> list[dict]:
    cmd = [
        "docker", "exec", CONTAINER, "psql", "-U", "liekan", "-d", "liekan",
        "-X", "-q", "-v", "ON_ERROR_STOP=1",
        "-c", f"COPY ({sql}) TO STDOUT WITH (FORMAT csv, HEADER true)",
    ]
    out = subprocess.run(cmd, capture_output=True, encoding="utf-8", timeout=600)
    if out.returncode:
        raise RuntimeError(f"liekan-db-1 查询失败：{out.stderr.strip()[:300]}")
    return list(csv.DictReader(io.StringIO(out.stdout)))


def parse_cutover(raw: str | None) -> datetime:
    if not raw:
        return db.CUTOVER
    dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def export_archive(cutover: datetime, out_dir: Path) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    tag = cutover.strftime("%Y%m%dT%H%MZ")
    gz_path = out_dir / f"jasonzhu-ai-liekan-log-2026-10-26-to-{tag}.csv.gz"
    sql = (
        "SELECT id, created_at, "
        "left(split_part(split_part(path, '?', 1), '#', 1), 500) AS path, "
        "method, status, bytes, ip_masked, location, bot, vendor, bot_type, "
        "verification, coalesce(verification_reason, '') AS verification_reason, "
        "ai_eligible, recognition_state "
        "FROM liekan_log "
        f"WHERE website_id = '{SITE_ID}' "
        f"AND created_at >= timestamptz '{START_UTC}' "
        f"AND created_at < timestamptz '{cutover.isoformat()}' "
        "ORDER BY created_at ASC, id ASC"
    )
    cmd = [
        "docker", "exec", CONTAINER, "psql", "-U", "liekan", "-d", "liekan",
        "-X", "-q", "-v", "ON_ERROR_STOP=1",
        "-c", f"COPY ({sql}) TO STDOUT WITH (FORMAT csv, HEADER true)",
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdout is not None and proc.stderr is not None
    rows = 0
    bad_ip = 0
    min_ts = ""
    max_ts = ""
    h = hashlib.sha256()
    with gzip.open(gz_path, "wt", encoding="utf-8", newline="") as gz:
        reader = csv.reader(io.TextIOWrapper(proc.stdout, encoding="utf-8", newline=""))
        writer = csv.writer(gz)
        header = next(reader, None)
        if not header:
            err = proc.stderr.read().decode(errors="replace")
            proc.wait()
            raise RuntimeError(f"导出为空：{err[:300]}")
        writer.writerow(header)
        idx_ts = header.index("created_at")
        idx_ip = header.index("ip_masked")
        for row in reader:
            ip = row[idx_ip]
            if not MASKED_RE.match(ip):
                bad_ip += 1
                row[idx_ip] = ""
            if not min_ts:
                min_ts = row[idx_ts]
            max_ts = row[idx_ts]
            rows += 1
            writer.writerow(row)
    err = proc.stderr.read().decode(errors="replace")
    rc = proc.wait()
    if rc != 0:
        raise RuntimeError(f"psql COPY 失败（{rc}）：{err[:300]}")
    if bad_ip:
        raise RuntimeError(f"发现 {bad_ip} 条非脱敏 ip_masked，已拒绝")
    with gz_path.open("rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    manifest = {
        "site": "jasonzhu.ai",
        "website_id": SITE_ID,
        "start_utc": START_UTC,
        "cutover_utc": cutover.isoformat(),
        "exported_at_utc": datetime.now(timezone.utc).isoformat(),
        "rows": rows,
        "first_created_at": min_ts,
        "last_created_at": max_ts,
        "file": gz_path.name,
        "bytes_gz": gz_path.stat().st_size,
        "sha256_gz": h.hexdigest(),
        "privacy": "masked IPs only (ip_masked /24 or /48), no ip_hash, no user_agent, query strings stripped",
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def fetch_daily_groups(cutover: datetime) -> tuple[int, list[dict]]:
    mf_sql = ", ".join(db.lit(p) for p in MACHINE_FILES)
    clean = "left(split_part(split_part(path, '?', 1), '#', 1), 500)"
    seg1 = f"split_part({clean}, '/', 2)"
    seg2 = f"split_part({clean}, '/', 3)"
    bucket_raw = (
        f"CASE "
        f"WHEN bot_type = '用户触发' OR {clean} IN ({mf_sql}) THEN {clean} "
        f"WHEN left({clean}, 1) <> '/' THEN ':' "
        f"WHEN {clean} IN ('/', '/zh', '/en') THEN {clean} "
        f"WHEN {seg1} IN ('zh', 'en') THEN '/' || {seg1} || CASE WHEN {seg2} <> '' THEN '/' || {seg2} ELSE '' END "
        f"ELSE '/' || {seg1} END"
    )
    sql = f"""
    WITH base AS (
      SELECT (created_at AT TIME ZONE 'UTC')::date AS day,
             extract(hour FROM created_at AT TIME ZONE 'UTC')::int AS hr,
             CASE WHEN bot_type = '用户触发' THEN date_trunc('second', created_at) ELSE NULL END AS at_sec,
             bot, vendor, bot_type, verification, coalesce(verification_reason, '') AS reason,
             status, created_at, {clean} AS cpath, ({bucket_raw}) AS bpath
      FROM liekan_log
      WHERE website_id = '{SITE_ID}'
        AND created_at >= timestamptz '{START_UTC}'
        AND created_at < timestamptz '{cutover.isoformat()}'
    ),
    day_hours AS (
      SELECT day, bit_or(1 << hr) AS hours FROM base GROUP BY day
    ),
    norm AS (
      SELECT day, at_sec, bot, vendor, bot_type, verification, reason, status, created_at,
             CASE WHEN bot_type <> '用户触发' AND bpath IN ({mf_sql}) AND cpath <> bpath
                  THEN bpath || '/_' ELSE bpath END AS path
      FROM base
    )
    SELECT to_char(n.day, 'YYYY-MM-DD') AS day,
           coalesce(to_char(n.at_sec AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), '') AS at,
           to_char(min(n.created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS first_at,
           n.bot, n.vendor, n.bot_type, n.verification, n.reason, n.status, n.path,
           count(*) AS n, h.hours
    FROM norm n
    JOIN day_hours h ON h.day = n.day
    GROUP BY n.day, n.at_sec, n.bot, n.vendor, n.bot_type, n.verification, n.reason, n.status, n.path, h.hours
    ORDER BY n.day, n.at_sec NULLS LAST, n.bot, n.path
    """
    rows = psql_csv(sql)
    total = sum(int(r["n"]) for r in rows)
    return total, rows


def upload_daily(rows: list[dict], expected_total: int) -> dict:
    db.execute("delete from public.ai_crawler_daily where origin = 'geoinflow';")
    cols = "(day, at, first_at, origin, label_set, bot, vendor, bot_type, verification, reason, status, path, n, hours)"
    inserted_batches = 0
    for start in range(0, len(rows), BATCH_SIZE):
        chunk = rows[start : start + BATCH_SIZE]
        vals = []
        for r in chunk:
            at_lit = f"{db.lit(r['at'])}::timestamptz" if r["at"] else "null"
            vals.append(
                f"({db.lit(r['day'])}::date, {at_lit}, {db.lit(r['first_at'])}::timestamptz, "
                f"'geoinflow', 'geoinflow', {db.lit(r['bot'])}, {db.lit(r['vendor'])}, {db.lit(r['bot_type'])}, "
                f"{db.lit(r['verification'])}, {db.lit(r['reason'])}, {int(r['status'])}, "
                f"{db.lit(r['path'])}, {int(r['n'])}, {int(r['hours'])})"
            )
        sql = f"insert into public.ai_crawler_daily {cols} values " + ",\n".join(vals) + ";"
        db.execute(sql)
        inserted_batches += 1
        if inserted_batches % 5 == 0 or start + BATCH_SIZE >= len(rows):
            print(f"  已写入 {min(start + BATCH_SIZE, len(rows))}/{len(rows)} 组...", flush=True)
    check = db.query("select count(*) as groups, coalesce(sum(n), 0) as total from public.ai_crawler_daily where origin = 'geoinflow'")
    got_groups = int(check[0]["groups"])
    got_total = int(check[0]["total"])
    if got_groups != len(rows) or got_total != expected_total:
        raise RuntimeError(f"回填核对失败：写入 {got_groups} 组 / {got_total} 条，预期 {len(rows)} 组 / {expected_total} 条")
    return {"groups": got_groups, "total_requests": got_total, "batches": inserted_batches}


def selftest() -> int:
    assert collapse_path("/en/blog/foo?a=1", "用户触发") == "/en/blog/foo"
    assert collapse_path("/en/blog/foo?a=1", "训练") == "/en/blog"
    assert collapse_path("/zh/prompts/claude-opus-5-5/123", "搜索") == "/zh/prompts"
    assert collapse_path("/robots.txt", "训练") == "/robots.txt"
    assert collapse_path("/robots.txt/fake", "训练") == "/robots.txt/_"
    assert collapse_path("/.well-known/mcp/server-card.json?x=1", "搜索") == "/.well-known/mcp/server-card.json"
    assert collapse_path("https://evil.example/x", "其他") == ":"
    assert collapse_path("/zh", "传统搜索") == "/zh"
    assert collapse_path("/", "传统搜索") == "/"
    assert MASKED_RE.match("57.141.18.0/24") and MASKED_RE.match("2603:1030:20e::/48") and MASKED_RE.match("")
    assert not MASKED_RE.match("57.141.18.42")
    print("geoinflow_export selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="导出 GEOInflow 历史归档并回填 Supabase ai_crawler_daily")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--cutover", help=f"截止时间（UTC ISO，不含），默认 {db.CUTOVER.isoformat()}")
    ap.add_argument("--archive-dir", default=str(ARCHIVE_DIR))
    ap.add_argument("--archive-only", action="store_true", help="只导出本机归档，不写 Supabase")
    ap.add_argument("--skip-archive", action="store_true", help="只回填 Supabase，不重写本机归档")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    cutover = parse_cutover(a.cutover)
    if not a.skip_archive:
        manifest = export_archive(cutover, Path(a.archive_dir))
        print(f"本机归档完成：{manifest['file']}（{manifest['rows']:,} 条，{manifest['bytes_gz']:,} 字节，{manifest['first_created_at']} 至 {manifest['last_created_at']}）")
    if not a.archive_only:
        total, groups = fetch_daily_groups(cutover)
        print(f"汇总完成：{total:,} 条原始日志 → {len(groups):,} 组（cutover < {cutover.isoformat()}）")
        res = upload_daily(groups, total)
        print(f"Supabase ai_crawler_daily 回填核对通过：{res['groups']:,} 组，合计 {res['total_requests']:,} 条（{res['batches']} 批）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
