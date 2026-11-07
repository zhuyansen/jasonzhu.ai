"""模型通道体检：每天给快讯 / 提示词库用到的每条通道发一个极小的请求（max_tokens=8），哪条不通就在日报开头告警。

起因：CI 里的 apimart key 4 月起就调不了 Claude，2026-10-04 主代理一限流，备用全挂，11 个作品卡进待审——
平时没人发现，因为主代理一直在顶着。生图（gpt-image-2.5-flare）用空 prompt 探测：返回 400 = 有权限，403 = 没权限，不花钱。

X 数据（2026-11-07 起）：提示词库先走 AIsa，出错再直连 twitterapi.io（scripts/opus-prompts/lib/x.mjs）。两边都查余额，
任一边不到 MIN_USD 就告警。11-06 twitterapi.io 余额用完，两个库停了一天，第二天下午才在日报里看到失败。
"""
import os

import requests

from common import run, save, secret

APIMART = "https://api.apimart.ai"
FLATROUTER = "https://api.flatrouter.com"
IMAGE_MODEL = os.environ.get("APIMART_IMAGE_MODEL") or "gpt-image-2.5-flare"   # 和封面脚本用同一个模型
AISA_BALANCE = "https://api.aisa.one/v1/credits/balance"
TWITTERAPI_INFO = "https://api.twitterapi.io/oapi/my/info"
MIN_USD = 1.0   # 主通道一天约 0.1 美元，低于 1 美元时还够用一周多，留出充值的时间


def anthropic_ping(base, key, model):
    r = requests.post(f"{base}/v1/messages", timeout=60,
                      headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                      json={"model": model, "max_tokens": 8, "messages": [{"role": "user", "content": "hi"}]})
    return r.status_code, r.text[:160]


def openai_ping(base, key, model):
    r = requests.post(f"{base}/v1/chat/completions", timeout=60, headers={"Authorization": f"Bearer {key}"},
                      json={"model": model, "max_tokens": 8, "messages": [{"role": "user", "content": "hi"}]})
    return r.status_code, r.text[:160]


def aisa_balance(key):
    r = requests.get(AISA_BALANCE, timeout=30, headers={"Authorization": f"Bearer {key}"})
    micros = r.json().get("available_balance_micros_usd") if r.status_code == 200 else None
    return r.status_code, (micros / 1e6 if isinstance(micros, (int, float)) else None), r.text[:160]


def twitterapi_balance(key):
    r = requests.get(TWITTERAPI_INFO, timeout=30, headers={"X-API-Key": key})
    credits = r.json().get("recharge_credits") if r.status_code == 200 else None
    return r.status_code, (credits / 100000 if isinstance(credits, (int, float)) else None), r.text[:160]   # 100,000 credits = $1


def main():
    checks = []

    def add(channel, used_by, model, fn, ok_codes=(200,)):
        try:
            code, body = fn()
        except Exception as e:  # noqa: BLE001
            code, body = 0, f"{type(e).__name__}: {e}"[:160]
        checks.append({"channel": channel, "used_by": used_by, "model": model, "ok": code in ok_codes, "status": code,
                       "detail": "" if code in ok_codes else body})

    def add_balance(channel, used_by, env, fetch):
        """查余额：key 没配、请求失败、余额不到 MIN_USD 都算异常"""
        key = secret(env)
        if not key:
            checks.append({"channel": channel, "used_by": used_by, "model": "余额", "ok": False, "status": 0, "detail": f"{env} 没配或为空"})
            return
        try:
            code, usd, body = fetch(key)
        except Exception as e:  # noqa: BLE001
            code, usd, body = 0, None, f"{type(e).__name__}: {e}"[:160]
        ok = code == 200 and usd is not None and usd >= MIN_USD
        detail = "" if ok else (f"余额只剩 ${usd:.2f}，不到 ${MIN_USD:.0f}，该充值了" if code == 200 and usd is not None else body)
        checks.append({"channel": channel, "used_by": used_by, "model": f"余额 ${usd:,.2f}" if usd is not None else "余额",
                       "ok": ok, "status": code, "detail": detail})

    fr = secret("FLATROUTER_API_KEY")
    if fr:
        add("flatrouter（主力）", "快讯 + 提示词库", "gpt-6-astra", lambda: openai_ping(FLATROUTER, fr, "gpt-6-astra"))
    ac = secret("APIMART_CLAUDE_KEY") or secret("APIMART_API_KEY")
    if ac:
        add("apimart Claude（备用 + 终审）", "快讯 + 提示词库", "claude-opus-5-5", lambda: anthropic_ping(APIMART, ac, "claude-opus-5-5"))
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
    # X 数据两条通道（提示词库收录用）只查余额
    add_balance("AIsa · X 数据（主）", "提示词库收录", "AISA_API_KEY", aisa_balance)
    add_balance("twitterapi.io · X 数据（备）", "提示词库收录（AIsa 出错时）", "TWITTERAPI_IO_KEY", twitterapi_balance)
    if not checks:
        return save("channels", {"ok": False, "skipped": True, "reason": "没配任何模型通道的 key"})
    save("channels", {"ok": True, "checks": checks})


if __name__ == "__main__":
    run("channels", main)
