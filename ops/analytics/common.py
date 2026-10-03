"""jasonzhu.ai 数据日报公共工具。

每个数据源一个 fetch_*.py，结果写 out/<源>.json，统一形状：
  {"ok": true, "fetched_at": ..., ...数据}
  {"ok": false, "skipped": true, "reason": "没配 xxx"}        ← 还没接入，日报里写一行说明
  {"ok": false, "error": "..."}                               ← 接入了但这次没拿到，日报标 ⚠️
一个源失败不影响其他源，日报照发（和 Agent Skills Hub 那套一样）。

密钥都从环境变量来（CI 由 secrets 注入）；本地调试可以把 JSON 凭证放 ops/analytics/.secrets/（已 gitignore）。
"""
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
STATE = os.path.join(HERE, "state")
SECRETS = os.path.join(HERE, ".secrets")
REPO_ROOT = os.path.dirname(os.path.dirname(HERE))
CST = timezone(timedelta(hours=8))
HOST = "jasonzhu.ai"

# 本机走 Clash 代理会让 googleapis 超时；CI 本来就直连。统一不走代理。
for _k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"):
    os.environ.pop(_k, None)


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def today_cst():
    return datetime.now(CST).date()


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    data = {"fetched_at": now_iso(), **data}
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    status = "ok" if data.get("ok") else ("skipped" if data.get("skipped") else "ERROR")
    print(f"  → out/{name}.json [{status}] {data.get('reason') or data.get('error') or ''}")


def load(name):
    p = os.path.join(OUT, f"{name}.json")
    if not os.path.exists(p):
        return {"ok": False, "error": "没有产出文件（抓取脚本没跑或中途崩了）"}
    with open(p) as f:
        return json.load(f)


def secret(env, filename=None):
    """环境变量优先，其次 .secrets/<filename>。拿不到返回 None。"""
    v = os.environ.get(env, "").strip()
    if v:
        return v
    if filename:
        p = os.path.join(SECRETS, filename)
        if os.path.exists(p):
            return open(p).read().strip() or None
    return None


_SECRET_RE = re.compile(r"(Bearer\s+|token=|key=|apikey[:=]\s*)[A-Za-z0-9._\-]{8,}", re.I)


def redact(msg):
    return _SECRET_RE.sub(r"\1***", str(msg))[:400]


def run(name, fn):
    """跑一个数据源：异常不往外抛，写成 ok=false 交给日报展示。"""
    try:
        fn()
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001 — 任何失败都要落成"未出数"，不能让整封日报挂掉
        save(name, {"ok": False, "error": redact(f"{type(e).__name__}: {e}")})
        print(f"  ✗ {name}: {redact(e)}", file=sys.stderr)
