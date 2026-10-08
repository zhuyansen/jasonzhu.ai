"""模型通道体检：每天给快讯 / 提示词库用到的每条通道发一个极小的请求（max_tokens=8），哪条不通就在日报开头告警。

起因：CI 里的 apimart key 4 月起就调不了 Claude，2026-10-04 主代理一限流，备用全挂，11 个作品卡进待审——
平时没人发现，因为主代理一直在顶着。生图（gpt-image-2.5-flare）用空 prompt 探测：返回 400 = 有权限，403 = 没权限，不花钱。
"""
import os

import requests

from common import run, save, secret

AIGOCODE = "https://api.aigocode.app"
APIMART = "https://api.apimart.ai"
FLATROUTER = "https://api.flatrouter.com"
IMAGE_MODEL = os.environ.get("APIMART_IMAGE_MODEL") or "gpt-image-2.5-flare"   # 和封面脚本用同一个模型


def anthropic_ping(base, key, model):
    r = requests.post(f"{base}/v1/messages", timeout=60,
                      headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                      json={"model": model, "max_tokens": 8, "messages": [{"role": "user", "content": "hi"}]})
    return r.status_code, r.text[:160]


def openai_ping(base, key, model):
    r = requests.post(f"{base}/v1/chat/completions", timeout=60, headers={"Authorization": f"Bearer {key}"},
                      json={"model": model, "max_tokens": 8, "messages": [{"role": "user", "content": "hi"}]})
    return r.status_code, r.text[:160]


def main():
    checks = []

    def add(channel, used_by, model, fn, ok_codes=(200,)):
        try:
            code, body = fn()
        except Exception as e:  # noqa: BLE001
            code, body = 0, f"{type(e).__name__}: {e}"[:160]
        checks.append({"channel": channel, "used_by": used_by, "model": model, "ok": code in ok_codes, "status": code,
                       "detail": "" if code in ok_codes else body})

    ag = secret("ANTHROPIC_AUTH_TOKEN")
    if ag:
        for m in ("claude-opus-5", "claude-sonnet-5"):
            add("aigocode（主力）", "快讯 + 提示词库", m, lambda m=m: anthropic_ping(AIGOCODE, ag, m))
    fr = secret("FLATROUTER_API_KEY")
    if fr:
        add("flatrouter（第一备用）", "快讯 + 提示词库", "gpt-6-astra", lambda: openai_ping(FLATROUTER, fr, "gpt-6-astra"))
    ac = secret("APIMART_CLAUDE_KEY") or secret("APIMART_API_KEY")
    if ac:
        add("apimart Claude（第二备用 + 终审兜底）", "快讯 + 提示词库", "claude-opus-5-5", lambda: anthropic_ping(APIMART, ac, "claude-opus-5-5"))
    ai = secret("APIMART_API_KEY")
    if not ai:
        # 生图 key 为空也要报：2026-10-05 一次 `grep … | gh secret set` 没读到值，存进去空串，体检却静默跳过了
        checks.append({"channel": "apimart 生图", "used_by": "快讯封面 / 博客封面", "model": IMAGE_MODEL, "ok": False, "status": 0,
                       "detail": "APIMART_API_KEY 没配或为空"})
    else:
        # 空 prompt：有权限会因为参数不全返回 400，没权限返回 403，不会真的生成图片
        add("apimart 生图", "快讯封面 / 博客封面", IMAGE_MODEL,
            lambda: (lambda r: (r.status_code, r.text[:160]))(requests.post(f"{APIMART}/v1/images/generations", timeout=60,
                     headers={"Authorization": f"Bearer {ai}"}, json={"model": IMAGE_MODEL, "prompt": ""})),
            ok_codes=(200, 400, 422))
    jev = secret("JEV_API_KEY")
    if jev:
        # 一道两选项的小题（约 300 token），能答出来才算通
        add("Jev 官方（主）", "提示词库审核 + 快讯融资复核", "jev-latest",
            lambda: (lambda r: (r.status_code if r.status_code >= 300 or "answers" in r.text else 599, r.text[:160]))(
                requests.post("https://api.typesafe.ai/v1/systemone", timeout=60, headers={"Authorization": f"Bearer {jev}"},
                              json={"model": "jev-latest", "state": "Card c1: Acme raised $5M in a closed seed round.",
                                    "questions": {"c1": {"type": "choice", "instructions": "What does c1 describe?",
                                                         "criteria": {"done": "A completed funding round", "rumor": "Only rumored"}}}})))
    orr = secret("OPENROUTER_API_KEY")
    if orr:
        # 只查 key 有效会漏掉「余额用光」：2026-10-08 余额 0 时 /key 照样 200，Jev 调用全是 402。余额 < $0.5 判不通
        def openrouter_balance():
            r = requests.get("https://openrouter.ai/api/v1/credits", timeout=60, headers={"Authorization": f"Bearer {orr}"})
            if r.status_code >= 300:
                return r.status_code, r.text[:160]
            d = r.json().get("data", {})
            left = (d.get("total_credits") or 0) - (d.get("total_usage") or 0)
            return (200 if left >= 0.5 else 402), f"余额 ${left:.2f}" + ("（不足，去 openrouter.ai/settings/credits 充值）" if left < 0.5 else "")
        add("OpenRouter（Jev 备用）", "Jev 官方不可用时兜底", "余额", openrouter_balance)
    if not checks:
        return save("channels", {"ok": False, "skipped": True, "reason": "没配任何模型通道的 key"})
    save("channels", {"ok": True, "checks": checks})


if __name__ == "__main__":
    run("channels", main)
