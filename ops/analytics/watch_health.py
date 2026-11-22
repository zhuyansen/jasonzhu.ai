"""30 分钟可用性巡检 + 状态变化即时邮件告警（网站 / 数据库 / 模型 API / 余额）。

设计原则：
1. 端到端探活：不只测首页 HTML，还打 `/api/health` 验证 Supabase + Vercel KV；并复测 AgentSkillsHub 首页与 sitemap.xml。
2. 复用 `fetch_channels.py`：用极小请求探测各模型通道（gemini-4-hydrogen / claude-opus-5-5 / 生图权限 / Jev /v1/systemone）与余额（APIMart / AIsa / twitterapi.io）。
3. 边沿触发 + 防抖：把每次结果记进 Upstash KV（`health:watch:state`）。单个检查**连续失败 >= ALERT_THRESHOLD 次（默认 2 次）**才发故障告警；之前告警过的项恢复后，立即发一封恢复通知。避免单次网络抖动误报或持续刷屏。

用法：
  python watch_health.py           # 正式巡检（读写 KV、状态变化时用 Resend 发信）
  python watch_health.py --dry-run # 本地只跑探测并打印 JSON，不改 KV、不发邮件
"""
from __future__ import annotations

import argparse
import html
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

import requests

import fetch_channels
from common import CST, load, redact, secret

STATE_KEY = "health:watch:state"
ALERT_THRESHOLD = int(os.environ.get("HEALTH_ALERT_THRESHOLD", "2"))

SITES = (
    {"id": "site:jasonzhu-home", "label": "jasonzhu.ai 首页", "url": "https://jasonzhu.ai/", "marker": "<title>"},
    {"id": "site:jasonzhu-api-health", "label": "jasonzhu.ai /api/health (DB+KV)", "url": "https://jasonzhu.ai/api/health", "json_ok": True},
    {"id": "site:hub-home", "label": "agentskillshub.top 首页", "url": "https://agentskillshub.top/", "marker": "AgentSkillsHub"},
    {"id": "site:hub-sitemap", "label": "agentskillshub.top sitemap.xml", "url": "https://agentskillshub.top/sitemap.xml", "marker": "<loc>"},
)


def probe_sites() -> list[dict]:
    results = []
    for spec in SITES:
        url = spec["url"]
        try:
            t0 = time.monotonic()
            r = requests.get(url, timeout=20, headers={"User-Agent": "JasonZhu-HealthWatch/1.0"})
            ms = round((time.monotonic() - t0) * 1000)
            if spec.get("json_ok"):
                data = r.json() if r.status_code == 200 else {}
                ok = r.status_code == 200 and isinstance(data, dict) and data.get("ok") is True
                detail = "" if ok else f"HTTP {r.status_code} {r.text[:160]}"
            else:
                marker = spec.get("marker", "")
                has_marker = (not marker) or (marker in r.text)
                ok = r.status_code == 200 and len(r.text.strip()) > 0 and has_marker
                detail = "" if ok else (f"HTTP {r.status_code}" if r.status_code != 200 else f"缺少预期标记 {marker}")
            results.append({
                "id": spec["id"],
                "label": spec["label"],
                "target": url,
                "ok": ok,
                "latency_ms": ms,
                "status_text": f"HTTP {r.status_code} ({ms}ms)" if ok else f"异常 ({r.status_code})",
                "detail": redact(detail),
            })
        except Exception as e:  # noqa: BLE001
            results.append({
                "id": spec["id"],
                "label": spec["label"],
                "target": url,
                "ok": False,
                "latency_ms": None,
                "status_text": "连接失败",
                "detail": redact(f"{type(e).__name__}: {e}"),
            })
    return results


def collect_checks() -> list[dict]:
    checks = probe_sites()
    fetch_channels.main()
    ch = load("channels")
    if not ch.get("ok"):
        checks.append({
            "id": "channel:runner",
            "label": "API 通道检测脚本",
            "target": "fetch_channels.py",
            "ok": False,
            "latency_ms": None,
            "status_text": "执行失败",
            "detail": redact(ch.get("error") or ch.get("reason") or "unknown"),
        })
        return checks

    for c in ch.get("checks") or []:
        name = c.get("channel") or "unknown"
        checks.append({
            "id": f"channel:{name}",
            "label": f"{name}（{c.get('model', '')}）",
            "target": c.get("used_by", ""),
            "ok": bool(c.get("ok")),
            "latency_ms": None,
            "status_text": f"正常 (HTTP {c.get('status')})" if c.get("ok") else f"异常 (HTTP {c.get('status')})",
            "detail": redact(c.get("detail") or ""),
        })
    return checks


def kv_get_state(url: str, token: str) -> dict:
    try:
        r = requests.post(
            f"{url.rstrip('/')}/pipeline",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=[["GET", STATE_KEY]],
            timeout=10,
        )
        if not r.ok:
            return {}
        out = r.json()
        raw = out[0].get("result") if isinstance(out, list) and out else None
        if not raw:
            return {}
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def kv_set_state(url: str, token: str, state: dict) -> bool:
    try:
        r = requests.post(
            f"{url.rstrip('/')}/pipeline",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=[["SET", STATE_KEY, json.dumps(state, ensure_ascii=False)]],
            timeout=10,
        )
        if not r.ok:
            return False
        out = r.json()
        return isinstance(out, list) and not out[0].get("error")
    except Exception:  # noqa: BLE001
        return False


def evaluate_transitions(
    checks: list[dict],
    prev_state: dict,
    threshold: int = ALERT_THRESHOLD,
    now_iso: str | None = None,
) -> tuple[dict, list[dict], list[dict]]:
    """Apply hysteresis transitions.

    Returns (next_state, new_alerts, recoveries).
    """
    ts = now_iso or datetime.now(CST).isoformat(timespec="seconds")
    next_state: dict = dict(prev_state)
    new_alerts: list[dict] = []
    recoveries: list[dict] = []

    for c in checks:
        cid = c["id"]
        old = prev_state.get(cid) or {}
        prev_failures = int(old.get("failures") or 0)
        was_alerted = bool(old.get("alerted"))

        if c["ok"]:
            if was_alerted:
                recoveries.append({**c, "prev_failures": prev_failures})
            next_state[cid] = {
                "ok": True,
                "failures": 0,
                "alerted": False,
                "last_seen": ts,
                "label": c["label"],
            }
        else:
            failures = prev_failures + 1
            alerted = was_alerted
            if failures >= threshold and not was_alerted:
                alerted = True
                new_alerts.append({**c, "failures": failures})
            next_state[cid] = {
                "ok": False,
                "failures": failures,
                "alerted": alerted,
                "last_seen": ts,
                "last_error": c.get("detail") or c.get("status_text") or "",
                "label": c["label"],
            }

    return next_state, new_alerts, recoveries


def build_email(new_alerts: list[dict], recoveries: list[dict], checks: list[dict], now_str: str) -> tuple[str, str]:
    if new_alerts and recoveries:
        subject = f"【告警 {len(new_alerts)} / 恢复 {len(recoveries)}】网站与 API 可用性变化 · {now_str}"
    elif new_alerts:
        names = "、".join(a["label"].split("（")[0] for a in new_alerts[:2])
        tail = f" 等 {len(new_alerts)} 项" if len(new_alerts) > 2 else ""
        subject = f"【故障告警 {len(new_alerts)} 项】{names}{tail} · {now_str}"
    else:
        subject = f"【已恢复 {len(recoveries)} 项】可用性巡检恢复正常 · {now_str}"

    lines = [f"巡检时间：{now_str}（北京时间）", ""]
    if new_alerts:
        lines.append("## 连续故障（触发告警）")
        for a in new_alerts:
            lines.append(f"- ❌ {a['label']}（连续失败 {a['failures']} 次）：{a.get('detail') or a.get('status_text')}")
        lines.append("")
    if recoveries:
        lines.append("## 已恢复正常")
        for r in recoveries:
            lines.append(f"- ✅ {r['label']}（此前连续失败 {r['prev_failures']} 次）：{r.get('status_text')}")
        lines.append("")

    bad_now = [c for c in checks if not c["ok"]]
    lines.append(f"## 当前全量快照（{len(checks) - len(bad_now)}/{len(checks)} 正常）")
    for c in checks:
        icon = "✅" if c["ok"] else "❌"
        extra = f" — {c['detail']}" if not c["ok"] and c.get("detail") else ""
        lines.append(f"- {icon} {c['label']}: {c.get('status_text', '')}{extra}")

    return subject, "\n".join(lines)


def send_alert_email(subject: str, text_body: str) -> str:
    key = secret("RESEND_API_KEY")
    to = secret("ALERT_EMAIL") or secret("DIGEST_TO")
    sender = os.environ.get("DIGEST_FROM") or "JasonZhu.AI 可用性监控 <news@jasonzhu.ai>"
    if not key or not to:
        raise RuntimeError("RESEND_API_KEY 或 ALERT_EMAIL/DIGEST_TO 未配置")
    body_html = (
        "<div lang=\"zh\" style=\"font-family:-apple-system,'PingFang SC',system-ui,sans-serif;"
        "font-size:14px;line-height:1.6;color:#1f2937;max-width:720px\">"
        f"<pre style=\"font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.55;white-space:pre-wrap\">{html.escape(text_body)}</pre>"
        "<p style=\"font-size:12px;color:#888\">jasonzhu.ai · 30 分钟可用性巡检 (.github/workflows/health-watch.yml)</p>"
        "</div>"
    )
    r = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}"},
        json={"from": sender, "to": [to], "subject": subject, "html": body_html, "text": text_body},
        timeout=30,
    )
    if r.status_code >= 300:
        raise RuntimeError(f"Resend {r.status_code}: {r.text[:240]}")
    try:
        return r.json().get("id", "")
    except ValueError:
        return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="30 分钟可用性巡检与状态变化告警")
    parser.add_argument("--dry-run", action="store_true", help="只执行探测并打印结果，不读写 KV 也不发邮件")
    args = parser.parse_args()

    now_str = datetime.now(CST).strftime("%m-%d %H:%M")
    checks = collect_checks()
    ok_cnt = sum(1 for c in checks if c["ok"])

    if args.dry_run:
        print(json.dumps({"checked_at": now_str, "ok_count": ok_cnt, "total": len(checks), "checks": checks},
                         ensure_ascii=False, indent=2))
        return

    kv_url = secret("KV_REST_API_URL") or secret("UPSTASH_REDIS_REST_URL")
    kv_tok = secret("KV_REST_API_TOKEN") or secret("UPSTASH_REDIS_REST_TOKEN")
    prev_state = kv_get_state(kv_url, kv_tok) if (kv_url and kv_tok) else {}
    next_state, new_alerts, recoveries = evaluate_transitions(checks, prev_state, threshold=ALERT_THRESHOLD)

    if kv_url and kv_tok:
        saved = kv_set_state(kv_url, kv_tok, next_state)
        if not saved:
            print("⚠️ 写入 KV 状态失败（本次仍正常判定）", file=sys.stderr)
    else:
        print("ℹ️ 未配置 KV_REST_API_URL/KV_REST_API_TOKEN，跳过跨次防抖状态保存", file=sys.stderr)

    print(f"✓ health-watch checked {len(checks)} targets ({ok_cnt} ok, {len(checks) - ok_cnt} bad, "
          f"new_alerts={len(new_alerts)}, recoveries={len(recoveries)})")

    if new_alerts or recoveries:
        subject, text_body = build_email(new_alerts, recoveries, checks, now_str)
        rid = send_alert_email(subject, text_body)
        print(f"✉️ alert sent: {subject} resend_id={rid}")


if __name__ == "__main__":
    main()
