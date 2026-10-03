"""用 Resend 把日报发到邮箱。标题里直接带关键数和故障标记，不开信就知道今天要不要看。

Env：RESEND_API_KEY（必需）、DIGEST_FROM（默认 news@jasonzhu.ai，已在 Resend 验证）、DIGEST_TO（默认站长邮箱）
用法：python send_email.py digest.md
"""
import os
import re
import sys

import markdown
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
    # 标题不放 emoji（垃圾邮件信号之一），有告警用文字标出
    subject = (f"【需处理 {n_alert} 项】" if n_alert else "") + f"jasonzhu.ai 数据日报 {today_cst()} · {head}"

    # 渲染成真正的 HTML（标题/表格/列表）并附纯文本版：整封 <pre> 包 Markdown 原文 + 没有 text 部分，Gmail 会当成群发垃圾
    inner = markdown.markdown(md, extensions=["tables"])
    body = f"""<div lang="zh" style="font-family:-apple-system,'PingFang SC',system-ui,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;max-width:760px">
<style>table{{border-collapse:collapse;margin:8px 0}}th,td{{border-bottom:1px solid #e5e7eb;padding:4px 8px;text-align:left;font-size:13px}}
h1{{font-size:20px}}h2{{font-size:16px;margin-top:22px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}}blockquote{{margin:6px 0;padding:4px 10px;background:#f8fafc;border-left:3px solid #cbd5e1;color:#475569}}code{{background:#f1f5f9;padding:1px 4px}}</style>
{inner}
<p style="font-size:12px;color:#888">jasonzhu.ai · Analytics Daily（.github/workflows/analytics-daily.yml）· 原始 JSON 在 Actions artifact 保留 30 天</p></div>"""
    r = requests.post("https://api.resend.com/emails", headers={"Authorization": f"Bearer {key}"},
                      json={"from": sender, "to": [to], "subject": subject, "html": body, "text": md}, timeout=30)
    if r.status_code >= 300:
        sys.exit(f"Resend {r.status_code}: {r.text[:300]}")
    print(f"✓ 已发到 {to}：{subject}（resend id {r.json().get('id', '')}）")


if __name__ == "__main__":
    main()
