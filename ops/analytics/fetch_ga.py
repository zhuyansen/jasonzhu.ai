"""Google Analytics 4（Data API）

凭证：GA_ADC_JSON（OAuth authorized-user JSON，analytics.readonly；和 Agent Skills Hub 同一份）+ GA_PROPERTY_ID（纯数字）。
注意：国内不翻墙的访客加载不了 gtag，GA 的量会明显少于 Vercel；看来源/转化用 GA，看总量以 Vercel 为准。
"""
import json

from google.auth.transport.requests import AuthorizedSession, Request
from google.oauth2.credentials import Credentials

from common import HOST, run, save, secret

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
# 机房无头浏览器的屏幕（Agent Skills Hub 实测 87% 会话来自这几种），真实设备没有这种分辨率
AUTOMATION_SCREENS = ["1366x1366", "1280x1200", "1280x1280"]
_HOST = {"filter": {"fieldName": "hostName", "stringFilter": {"matchType": "ENDS_WITH", "value": HOST}}}
_BOTS = {"filter": {"fieldName": "screenResolution", "inListFilter": {"values": AUTOMATION_SCREENS}}}


def flt(bots=False):
    return {"andGroup": {"expressions": [_HOST, _BOTS if bots else {"notExpression": _BOTS}]}}


def main():
    prop, adc = secret("GA_PROPERTY_ID", "ga_property_id"), secret("GA_ADC_JSON", "ga_adc.json")
    if not prop or not adc:
        return save("ga", {"ok": False, "skipped": True, "reason": "没配 GA_PROPERTY_ID / GA_ADC_JSON"})
    a = json.loads(adc)
    creds = Credentials(None, refresh_token=a["refresh_token"], client_id=a["client_id"], client_secret=a["client_secret"],
                        token_uri="https://oauth2.googleapis.com/token", quota_project_id=a.get("quota_project_id"), scopes=SCOPES)
    creds.refresh(Request())
    s = AuthorizedSession(creds)

    def report(dims, mets, days, order=None, limit=25, bots=False):
        body = {"dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "yesterday"}], "dimensions": [{"name": d} for d in dims],
                "metrics": [{"name": m} for m in mets], "dimensionFilter": flt(bots), "limit": limit}
        if order:
            body["orderBys"] = [{"metric": {"metricName": order}, "desc": True}]
        r = s.post(f"https://analyticsdata.googleapis.com/v1beta/properties/{prop}:runReport", json=body, timeout=60)
        r.raise_for_status()
        d = r.json()
        rows = [{**{dims[i]: v["value"] for i, v in enumerate(row.get("dimensionValues", []))},
                 **{mets[i]: float(v["value"]) for i, v in enumerate(row.get("metricValues", []))}} for row in d.get("rows", [])]
        total = int(d.get("rowCount", 0) or 0)
        return {"rows": rows, "truncated": total > len(rows)}

    save("ga", {
        "ok": True,
        "daily": report(["date"], ["sessions", "activeUsers", "screenPageViews"], 28, limit=60),
        "pages7": report(["pagePath"], ["screenPageViews", "sessions", "bounceRate"], 7, "screenPageViews", 20),
        "sources7": report(["sessionSource", "sessionMedium"], ["sessions", "activeUsers"], 7, "sessions", 30),
        "events28": report(["eventName"], ["eventCount", "totalUsers"], 28, "eventCount", 40),
        "events7": report(["eventName"], ["eventCount", "totalUsers"], 7, "eventCount", 40),
        "automation28": report(["screenResolution"], ["sessions"], 28, "sessions", 10, bots=True),
        "screens28": report(["screenResolution"], ["sessions"], 28, "sessions", 8),
    })


if __name__ == "__main__":
    run("ga", main)
