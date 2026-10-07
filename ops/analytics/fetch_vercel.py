"""Vercel Web Analytics（官方 REST：/v1/query/web-analytics/visits/aggregate）

站上 <Analytics /> 走同域名 /_vercel/insights，国内访客也统计得到——jasonzhu.ai 读者以国内为主，这一点比 GA 准。
前提：Vercel 项目里 Analytics 开关要打开（没开时接口返回 web_analytics_not_enabled，日报会写明）。
凭证：VERCEL_TOKEN（vercel.com/account/tokens 生成，Scope 选 jasonzhu.ai 所在 team）。
"""
import requests

from common import run, save, secret, today_cst, token_shape
from datetime import datetime, timedelta, timezone

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
        # UTM 维度要 Enterprise 或 Web Analytics Plus（402 payment_required），Hobby 拿不到，来源看 referrer
    })


def usage_main():
    """Edge Requests 用量（2026-10-07 免费版超额整站停用后加）：每日请求数 + 套餐 / 账单周期 / 是否被停用。
    和上面的 Web Analytics 是两套数据：这里是 Vercel 计费口径，含爬虫、预加载、静态资源，比浏览量大得多。"""
    tok = secret("VERCEL_TOKEN", "vercel_token")
    if not tok:
        return save("vercel_usage", {"ok": False, "skipped": True, "reason": "没配 VERCEL_TOKEN"})
    h = {"Authorization": f"Bearer {tok}"}
    iso = lambda d: d.strftime("%Y-%m-%dT%H:%M:%S.000Z")  # 这个接口只认这种格式，毫秒数 / 带时区都报 invalid_from_date
    now = datetime.now(timezone.utc)
    r = requests.get("https://api.vercel.com/v2/usage", headers=h, timeout=60,
                     params={"teamId": TEAM, "type": "requests", "granularity": "day",  # 不写时超过 31 天会自动变成按周
                             "from": iso(now - timedelta(days=35)), "to": iso(now)})
    if r.status_code >= 300:
        hint = f"（token {token_shape(tok)}；token 要能访问 team 的用量）" if r.status_code in (401, 403) else ""
        raise RuntimeError(f"usage HTTP {r.status_code}{hint}: {r.text[:200]}")
    data = r.json()
    if data.get("granularity") != "day":
        raise RuntimeError(f"usage 返回的是按 {data.get('granularity')} 汇总，不是按天")
    daily = [{"date": x["date"][:10], "requests": x.get("request_hit_count", 0) + x.get("request_miss_count", 0),
              "complete": x["date"][:10] < now.date().isoformat()} for x in data.get("data", [])]
    t = requests.get(f"https://api.vercel.com/v2/teams/{TEAM}", headers=h, timeout=60)
    team = t.json() if t.status_code < 300 else {}
    b = team.get("billing") or {}
    period = b.get("period") or {}
    to_day = lambda ms: datetime.fromtimestamp(ms / 1000, timezone.utc).date().isoformat() if ms else None
    save("vercel_usage", {
        "ok": True, "daily": daily,  # 按 UTC 日；日报 8:20（UTC 0:20）跑，昨天那天已经完整
        "plan": b.get("plan"), "period": [to_day(period.get("start")), to_day(period.get("end"))],
        "soft_block": team.get("softBlock"), "team_error": None if t.status_code < 300 else f"HTTP {t.status_code}",
    })


if __name__ == "__main__":
    run("vercel", main)
    run("vercel_usage", usage_main)
