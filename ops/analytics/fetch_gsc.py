"""Google Search Console · sc-domain:jasonzhu.ai

凭证：GSC_TOKEN_JSON（OAuth authorized-user JSON，webmasters.readonly），和 Agent Skills Hub 用的是同一个 Google 账号的同一份 token。
本地：.secrets/gsc_token.json
"""
import json
import re
from datetime import timedelta
from urllib.parse import quote

from google.auth.transport.requests import AuthorizedSession, Request
from google.oauth2.credentials import Credentials

from common import run, save, secret, today_cst

API = "https://www.googleapis.com/webmasters/v3"
SITE = "sc-domain:jasonzhu.ai"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

# 搜索操作符查询（引号 / site: / 减号…）是排名监控工具在跑，不是真人：曝光虚高、点击为 0、排名虚好。
# 在抓取这一层就剔掉，下游所有统计都拿干净数据；剔掉多少也存下来，日报里写明。
OPERATOR = [re.compile(p, re.I) for p in (r'"', r"\b(site|inurl|intitle|intext|filetype):", r"(^|\s)-\w", r"\*", r"\bOR\b")]


def is_operator(q):
    return any(p.search(q or "") for p in OPERATOR)


def session():
    raw = secret("GSC_TOKEN_JSON", "gsc_token.json")
    if not raw:
        return None
    creds = Credentials.from_authorized_user_info(json.loads(raw), SCOPES)
    if not creds.valid:
        creds.refresh(Request())
    return AuthorizedSession(creds)


def query(s, start, end, dims, limit=500):
    body = {"startDate": str(start), "endDate": str(end), "dimensions": dims, "rowLimit": limit}
    r = s.post(f"{API}/sites/{quote(SITE, safe='')}/searchAnalytics/query", json=body, timeout=60)
    r.raise_for_status()
    return [{**{d: row["keys"][i] for i, d in enumerate(dims)}, "clicks": row["clicks"], "impressions": row["impressions"],
             "ctr": round(row["ctr"] * 100, 2), "position": round(row["position"], 1)} for row in r.json().get("rows", [])]


def main():
    s = session()
    if not s:
        return save("gsc", {"ok": False, "skipped": True, "reason": "没配 GSC_TOKEN_JSON"})
    end = today_cst() - timedelta(days=2)          # GSC 约有 2 天延迟，取已定稿的数据
    start28 = end - timedelta(days=27)
    cur7, prev7 = (end - timedelta(days=6), end), (end - timedelta(days=13), end - timedelta(days=7))

    allq = query(s, start28, end, ["query"], 1000)
    ops = [r for r in allq if is_operator(r["query"])]
    queries = [r for r in allq if not is_operator(r["query"])]

    def by_query(a, b):
        return {r["query"]: r for r in query(s, a, b, ["query"], 1000) if not is_operator(r["query"])}
    c, p = by_query(*cur7), by_query(*prev7)
    rising = sorted(({"query": q, "clicks": c.get(q, {}).get("clicks", 0), "d_clicks": c.get(q, {}).get("clicks", 0) - p.get(q, {}).get("clicks", 0),
                      "impressions": c.get(q, {}).get("impressions", 0), "d_impressions": c.get(q, {}).get("impressions", 0) - p.get(q, {}).get("impressions", 0)}
                     for q in set(c) | set(p)), key=lambda r: (-r["d_clicks"], -r["d_impressions"]))

    dates = query(s, start28, end, ["date"])

    def tot(a, b):
        rows = [r for r in dates if str(a) <= r["date"] <= str(b)]
        return {"clicks": sum(r["clicks"] for r in rows), "impressions": sum(r["impressions"] for r in rows)}
    save("gsc", {
        "ok": True, "window": [str(start28), str(end)], "window7": [str(cur7[0]), str(cur7[1])],
        "queries": queries[:50], "rising": rising[:20],
        "operators": {"count": len(ops), "impressions": sum(r["impressions"] for r in ops), "clicks": sum(r["clicks"] for r in ops)},
        "pages": query(s, start28, end, ["page"], 50),
        "dates": dates,
        # 总数要按日期维度取：按搜索词汇总会漏掉 Google 隐去的长尾/匿名查询，少算一大截
        "totals7": tot(*cur7), "totals7_prev": tot(*prev7),
    })


if __name__ == "__main__":
    run("gsc", main)
