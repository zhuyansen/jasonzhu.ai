"""PostHog Query API (HogQL) fetcher for jasonzhu.ai — tracks funnels, AI search referrals & content conversions.

Credentials (env vars or local gitignored files):
  POSTHOG_API_KEY     (or ops/posthog/.api_key)    — Personal API Key (phx_..., scope: query:read)
  POSTHOG_PROJECT_ID  (or ops/posthog/.project_id) — Numeric project ID for jasonzhu.ai
  POSTHOG_HOST        (optional, default https://us.posthog.com)

Usage:
  python3 ops/posthog/fetch_posthog.py dump [--days 28]
"""
import json
import os
import sys
import time
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

HOST_FILTER = "properties.$host IN ('jasonzhu.ai', 'www.jasonzhu.ai')"

AI_REFERRERS_SQL = (
    "('chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'claude.ai', "
    "'doubao.com', 'kimi.com', 'kimi.moonshot.cn', 'deepseek.com', 'chat.deepseek.com', "
    "'copilot.microsoft.com', 'yuanbao.tencent.com', 'metaso.cn', 'grok.com', 'you.com', 'phind.com', 'poe.com')"
)


def _read_cred(env_name, filename, default=""):
    val = (os.environ.get(env_name) or "").strip()
    if val:
        return val
    p = os.path.join(HERE, filename)
    if os.path.exists(p):
        return open(p).read().strip()
    return default


API_KEY = _read_cred("POSTHOG_API_KEY", ".api_key")
PROJECT_ID = _read_cred("POSTHOG_PROJECT_ID", ".project_id")
HOST = _read_cred("POSTHOG_HOST", ".host", "https://us.posthog.com").rstrip("/")


def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag) + 1]) if flag in sys.argv else default


def hogql(sess, query, name="query"):
    url = f"{HOST}/api/projects/{PROJECT_ID}/query/"
    body = {"query": {"kind": "HogQLQuery", "query": query}, "name": f"jasonzhu_sweep_{name}"}
    last = None
    for attempt in range(3):
        try:
            r = sess.post(url, json=body, timeout=60)
            if r.status_code in (429, 502, 503, 504) and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            r.raise_for_status()
            data = r.json()
            return [dict(zip(data.get("columns") or [], row)) for row in (data.get("results") or [])]
        except requests.exceptions.RequestException as exc:
            last = exc
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
    raise last


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"  → {p} ({len(data)} rows)")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "dump"
    days = arg("--days", 28)

    if not API_KEY or not PROJECT_ID:
        print("PostHog 未配置 (缺少 POSTHOG_API_KEY / POSTHOG_PROJECT_ID)，跳过抓取。")
        return

    sess = requests.Session()
    sess.headers["Authorization"] = f"Bearer {API_KEY}"

    if cmd in ("overview", "dump"):
        save("overview", hogql(sess, f"""
            SELECT
                toDate(timestamp) AS day,
                countIf(event = '$pageview') AS pageviews,
                uniqExact(distinct_id) AS visitors,
                uniqExact($session_id) AS sessions
            FROM events
            WHERE timestamp >= now() - INTERVAL {days} DAY
              AND {HOST_FILTER}
              AND event = '$pageview'
            GROUP BY day
            ORDER BY day ASC
        """, "overview"))

    if cmd in ("ai_referrals", "dump"):
        save("ai_referrals", hogql(sess, f"""
            SELECT
                coalesce(nullIf(properties.entry_ai_engine, ''), nullIf(properties.$referring_domain, '')) AS ai_source,
                uniqExact($session_id) AS sessions,
                uniqExact(distinct_id) AS visitors,
                countIf(event = '$pageview') AS pageviews,
                uniqExactIf(distinct_id, event IN ('newsletter_subscribe', 'club_apply_submit', 'checkout_order_created')) AS conversions
            FROM events
            WHERE timestamp >= now() - INTERVAL {days} DAY
              AND {HOST_FILTER}
              AND (properties.$referring_domain IN {AI_REFERRERS_SQL} OR coalesce(properties.entry_ai_engine, '') != '')
            GROUP BY ai_source
            ORDER BY sessions DESC
        """, "ai_referrals"))

    if cmd in ("funnel", "dump"):
        save("funnel", hogql(sess, f"""
            SELECT
                event,
                count() AS events_28d,
                uniqExact(distinct_id) AS users_28d,
                countIf(timestamp >= now() - INTERVAL 7 DAY) AS events_7d,
                uniqExactIf(distinct_id, timestamp >= now() - INTERVAL 7 DAY) AS users_7d
            FROM events
            WHERE timestamp >= now() - INTERVAL {days} DAY
              AND {HOST_FILTER}
              AND event IN (
                '$pageview', 'newsletter_subscribe', 'club_apply_submit', 'checkout_order_created',
                'prompt_copy', 'prompt_try_claude', 'github_click', 'referral_click',
                'payment_picker_result', 'ai_readiness_scan', 'wechat_copy', 'contact_click'
              )
            GROUP BY event
            ORDER BY users_28d DESC
        """, "funnel"))


if __name__ == "__main__":
    main()
