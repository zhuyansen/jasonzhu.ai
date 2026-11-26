#!/usr/bin/env python3
"""AI 爬虫数据的读写小助手（Supabase 项目 zjylrwdrkabuugdvvgba）。只用标准库。

给 crawler_stats.py、read_vs_cited.py、crawler_report.py、bot_ip_ranges.py、geoinflow_export.py 用。

两条路，同一套 SQL：
  1. 有环境变量 SUPABASE_SERVICE_KEY（GitHub Actions 里已有这个 secret）和 SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL：
     走 REST。查询经 rpc/ai_crawler_sql（只给 service role；函数里把事务设成只读、只收 select / with，
     见 supabase/create-ai-crawler-tables.sql），写入经 rpc/replace_bot_ip_ranges 或表的 REST 接口。
  2. 没有 key（本机）：`supabase db query --linked --workdir <目录>`。<目录> 取环境变量 CRAWLER_DB_WORKDIR，
     默认 ~/.cache/jasonzhu-supabase；第一次会在那里 `supabase link`（不在仓库里 link，免得写出 supabase/.temp）。

查的是视图 ai_crawler_all：GEOInflow 导入的历史（ai_crawler_daily，origin = 'geoinflow'，CUTOVER 之前）
加新表（ai_crawler_hits，CUTOVER 起），每行带 n（条数）。CUTOVER 写死在视图里，这里的常量要和它一致。
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PROJECT_REF = "zjylrwdrkabuugdvvgba"
DEFAULT_URL = f"https://{PROJECT_REF}.supabase.co"
# 新表接手的时刻（UTC）：之前的数来自 GEOInflow 导出，之后来自 ai_crawler_hits。和视图 ai_crawler_all 里的一致。
CUTOVER = datetime(2026, 11, 26, 13, 35, tzinfo=timezone.utc)
TIMEOUT = 120


class DBError(Exception):
    """查询或写入失败：调用方应停住，不要当成 0 条。"""


def _key() -> str:
    return os.environ.get("SUPABASE_SERVICE_KEY", "").strip()


def _url() -> str:
    return (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or DEFAULT_URL).rstrip("/")


def mode() -> str:
    return "rest" if _key() else "cli"


def _rest(path: str, body: object, prefer: str | None = None) -> object:
    key = _key()
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if prefer:
        headers["Prefer"] = prefer
    req = urllib.request.Request(f"{_url()}/rest/v1/{path}", data=json.dumps(body).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            text = r.read().decode()
    except urllib.error.HTTPError as e:
        raise DBError(f"REST {path} → {e.code}: {e.read().decode(errors='replace')[:300]}") from None
    except urllib.error.URLError as e:
        raise DBError(f"REST {path} 连不上：{e.reason}") from None
    return json.loads(text) if text.strip() else None


def _workdir() -> Path:
    w = Path(os.environ.get("CRAWLER_DB_WORKDIR") or Path.home() / ".cache" / "jasonzhu-supabase")
    if not (w / "supabase" / ".temp" / "project-ref").exists():
        w.mkdir(parents=True, exist_ok=True)
        out = subprocess.run(["supabase", "link", "--project-ref", PROJECT_REF, "--workdir", str(w), "--password", ""],
                             capture_output=True, text=True, timeout=TIMEOUT)
        if out.returncode:
            raise DBError(f"supabase link 失败：{out.stderr.strip()[:300]}")
    return w


def _cli(sql: str) -> list[dict]:
    if not shutil.which("supabase"):
        raise DBError("没有 SUPABASE_SERVICE_KEY，本机也没有 supabase 命令")
    w = _workdir()
    out = subprocess.run(["supabase", "db", "query", "--linked", "--workdir", str(w), "-o", "json", sql],
                         capture_output=True, text=True, timeout=600)
    if out.returncode:
        raise DBError(f"supabase db query 失败：{(out.stderr or out.stdout).strip()[-400:]}")
    text = out.stdout
    start = text.find("{")
    if start < 0:
        raise DBError(f"supabase db query 输出看不懂：{text[:200]}")
    data, _ = json.JSONDecoder().raw_decode(text[start:])
    return data.get("rows", []) if isinstance(data, dict) else data


def query(sql: str) -> list[dict]:
    """跑一条只读 SELECT，返回 [{列: 值}]。数字列在 REST 路上是 JSON 数字，CLI 路上也是。"""
    sql = sql.strip().rstrip(";")
    if mode() == "rest":
        rows = _rest("rpc/ai_crawler_sql", {"q": sql})
        return rows if isinstance(rows, list) else []
    # CLI 路也包一层 jsonb_agg，两条路的返回形状、类型一样
    wrapped = f"select coalesce(jsonb_agg(t), '[]'::jsonb) as rows from ({sql}) t"
    got = _cli(wrapped)
    if not got:
        return []
    rows = got[0].get("rows")
    return json.loads(rows) if isinstance(rows, str) else (rows or [])


def lit(value: object) -> str:
    """SQL 字面量（只给我们自己拼的值用：日期、固定名字、官方网段）。"""
    if value is None:
        return "null"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return repr(value)
    return "'" + str(value).replace("'", "''") + "'"


def replace_ranges(vendor: str, bot: str, source_url: str, cidrs: list[str], published_at: str | None) -> int:
    """整份换掉一个机器人的 IP 段（数据库函数里一个事务完成；空列表会被拒绝）。返回写入条数。"""
    if not cidrs:
        raise DBError(f"{bot}：IP 段是空的，不写")
    if mode() == "rest":
        n = _rest("rpc/replace_bot_ip_ranges", {"p_vendor": vendor, "p_bot": bot, "p_source_url": source_url,
                                                 "p_cidrs": cidrs, "p_published_at": published_at})
        return int(n or 0)
    arr = "array[" + ",".join(lit(c) for c in cidrs) + "]::text[]"
    rows = _cli(f"select public.replace_bot_ip_ranges({lit(vendor)}, {lit(bot)}, {lit(source_url)}, {arr}, "
                f"{lit(published_at)}::timestamptz) as n")
    return int(rows[0]["n"]) if rows else 0


def execute(sql: str) -> list[dict]:
    """写入用（导出脚本建、删历史行）。只走 CLI：REST 路只开放只读查询。"""
    if mode() == "rest":
        raise DBError("写历史只在本机跑（supabase db query），REST 路只读")
    return _cli(sql)
