"""用 Resend 把日报发到邮箱。标题里直接带关键数和故障标记，不开信就知道今天要不要看。

Env：RESEND_API_KEY（必需）、DIGEST_FROM（默认 news@jasonzhu.ai，已在 Resend 验证）、DIGEST_TO（默认站长邮箱）
用法：python send_email.py digest.md
"""
import html
import os
import re
import sys

import requests

from common import today_cst


def main():
    md = open(sys.argv[1], encoding="utf-8").read()
    key = os.environ.get("RESEND_API_KEY")
    if not key:
        sys.exit("RESEND_API_KEY 没配")
    sender = os.environ.get("DIGEST_FROM") or "JasonZhu.AI 数据日报 <news@jasonzhu.ai>"
    to = os.environ.get("DIGEST_TO") or "m17551076169@gmail.com"

    m = re.search(r"新订阅 \*\*(\d+)\*\*", md)
    head = f"新订阅 {m.group(1)}" if m else "订阅数据缺失"
    v = re.search(r"浏览 \*\*([\d,]+)\*\*", md)
    if v:
        head += f" · 浏览 {v.group(1)}"
    n_alert = len(re.findall(r"^- ", md.split("## ⚠️ 需要处理")[1].split("##")[0], re.M)) if "## ⚠️ 需要处理" in md else 0
    subject = f"📊 jasonzhu.ai 日报 {today_cst()} · {head}" + (f" · ⚠️ {n_alert} 项要处理" if n_alert else "")

    body = f"""<div lang="zh" style="font-family:system-ui,-apple-system,sans-serif;max-width:760px">
<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.55;white-space:pre-wrap">{html.escape(md)}</pre>
<p style="font-size:12px;color:#888">jasonzhu.ai · Analytics Daily（.github/workflows/analytics-daily.yml）· 原始 JSON 在 Actions artifact 保留 30 天</p></div>"""
    r = requests.post("https://api.resend.com/emails", headers={"Authorization": f"Bearer {key}"},
                      json={"from": sender, "to": [to], "subject": subject, "html": body}, timeout=30)
    if r.status_code >= 300:
        sys.exit(f"Resend {r.status_code}: {r.text[:300]}")
    print(f"✓ 已发到 {to}：{subject}（resend id {r.json().get('id', '')}）")


if __name__ == "__main__":
    main()
