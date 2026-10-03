"""Vercel Web Analytics（官方 REST：/v1/query/web-analytics/visits/aggregate）

站上 <Analytics /> 走同域名 /_vercel/insights，国内访客也统计得到——jasonzhu.ai 读者以国内为主，这一点比 GA 准。
前提：Vercel 项目里 Analytics 开关要打开（没开时接口返回 web_analytics_not_enabled，日报会写明）。
凭证：VERCEL_TOKEN（vercel.com/account/tokens 生成，Scope 选 jasonzhu.ai 所在 team）。
"""
import requests

from common import run, save, secret, today_cst, token_shape
from datetime import timedelta

PROJECT = "prj_pc30SYxdZgkWJAAPvOQYfjWc9cP2"
TEAM = "team_Zu2IlrwfDsPhJX9Q3hJ5UX9D"
API = "https://api.vercel.com/v1/query/web-analytics/visits/aggregate"


class NotEnabled(Exception):
    pass


def agg(tok, by, since, until, limit=10):
    r = requests.get(API, params={"projectId": PROJECT, "teamId": TEAM, "by": by, "since": since, "until": until, "limit": limit},
                     headers={"Authorization": f"Bearer {tok}"}, timeout=60)
    if r.status_code == 400 and "web_analytics_not_enabled" in r.text:
        raise NotEnabled()
    if r.status_code >= 300:
        hint = f"（token {token_shape(tok)}）" if r.status_code in (401, 403) else ""
        raise RuntimeError(f"HTTP {r.status_code}{hint}: {r.text[:200]}")
    return r.json().get("data", [])


def main():
    tok = secret("VERCEL_TOKEN", "vercel_token")
    if not tok:
        return save("vercel", {"ok": False, "skipped": True, "reason": "没配 VERCEL_TOKEN"})
    today = today_cst()
    y = today - timedelta(days=1)
    s7, s28 = today - timedelta(days=7), today - timedelta(days=28)
    try:
        daily = agg(tok, "day", str(s28), str(y), 100)
    except NotEnabled:
        return save("vercel", {"ok": False, "skipped": True, "reason": "Vercel 项目的 Web Analytics 开关没打开，数据没在采"})
    save("vercel", {
        "ok": True, "yesterday": str(y), "window7": [str(s7), str(y)],
        "daily": daily,
        "paths7": agg(tok, "requestPath", str(s7), str(y), 30),
        "referrers7": agg(tok, "referrerHostname", str(s7), str(y), 40),
        "countries7": agg(tok, "country", str(s7), str(y), 10),
        "devices7": agg(tok, "deviceType", str(s7), str(y), 5),
        "utm7": agg(tok, "utmSource", str(s7), str(y), 15),
    })


if __name__ == "__main__":
    run("vercel", main)
