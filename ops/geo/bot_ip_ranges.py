#!/usr/bin/env python3
"""每天抓各家官方公布的爬虫 IP 段，写入 Supabase 表 public.bot_ip_ranges。只用标准库。

谁用：
  - .github/workflows/bot-ip-ranges.yml（每天自动跑，走 REST + SUPABASE_SERVICE_KEY）
  - 本机手动跑（没设 SUPABASE_SERVICE_KEY 时走 crawler_db 的 CLI 回退）

源清单沿用 GEOInflow（geo-chain src/lib/liekan/rules/range-sources.ts），再补上：
  - Google 用户触发抓取器（user-triggered-fetchers.json、user-triggered-fetchers-google.json）
  - AhrefsSiteAudit（和 AhrefsBot 同一个官方接口）
  - Meta（Meta 没出爬虫专用 JSON，官方文档指明用 AS32934；经 RIPE RIS 公开路由表取通告网段）

防静默坏掉：
  - 每个源都要返回非空、合法的公网 CIDR，空列表或解析失败就判该源失败、不覆盖旧数据（数据库函数也会拒空列表）。
  - 跑完所有源，健康源照常更新，只要有任意一个源失败就以非零状态码退出，让 GitHub Actions 标红告警。

用法：
  python3 ops/geo/bot_ip_ranges.py --selftest
  python3 ops/geo/bot_ip_ranges.py --dry
  python3 ops/geo/bot_ip_ranges.py
"""
from __future__ import annotations

import argparse
import html
import ipaddress
import json
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import crawler_db as db  # noqa: E402

USER_AGENT = "JasonZhuAI-CrawlerVerifier/1.0 (+https://jasonzhu.ai/research/ai-crawlers)"
MAX_BYTES = 2 * 1024 * 1024
MAX_PREFIXES = 5000
TIMEOUT = 25
RETRIES = 2

EXCLUDED_V4 = tuple(
    ipaddress.ip_network(c)
    for c in (
        "0.0.0.0/8",
        "10.0.0.0/8",
        "100.64.0.0/10",
        "127.0.0.0/8",
        "169.254.0.0/16",
        "172.16.0.0/12",
        "192.0.0.0/24",
        "192.0.2.0/24",
        "192.31.196.0/24",
        "192.52.193.0/24",
        "192.88.99.0/24",
        "192.168.0.0/16",
        "192.175.48.0/24",
        "198.18.0.0/15",
        "198.51.100.0/24",
        "203.0.113.0/24",
        "224.0.0.0/4",
        "240.0.0.0/4",
    )
)
GLOBAL_V6 = ipaddress.ip_network("2000::/3")
EXCLUDED_V6 = tuple(
    ipaddress.ip_network(c)
    for c in (
        "2001::/23",
        "2001:db8::/32",
        "2002::/16",
        "2620:4f:8000::/48",
        "3ffe::/16",
        "3fff::/20",
    )
)


@dataclass(frozen=True)
class Source:
    id: str
    vendor: str
    bots: tuple[str, ...]
    url: str
    parser: str = "prefixes"  # prefixes | amazon_html | ripe_asn


SOURCES: tuple[Source, ...] = (
    # OpenAI
    Source("openai-gpt", "OpenAI", ("GPTBot",), "https://openai.com/gptbot.json"),
    Source("openai-search", "OpenAI", ("OAI-SearchBot",), "https://openai.com/searchbot.json"),
    Source("openai-user", "OpenAI", ("ChatGPT-User",), "https://openai.com/chatgpt-user.json"),
    Source("openai-ads", "OpenAI", ("OAI-AdsBot",), "https://openai.com/adsbot.json"),
    # Anthropic（一个文件涵盖全部 3 个爬虫）
    Source("anthropic", "Anthropic", ("ClaudeBot", "Claude-SearchBot", "Claude-User"), "https://claude.com/crawling/bots.json"),
    # Perplexity
    Source("perplexity-bot", "Perplexity", ("PerplexityBot",), "https://www.perplexity.ai/perplexitybot.json"),
    Source("perplexity-user", "Perplexity", ("Perplexity-User",), "https://www.perplexity.ai/perplexity-user.json"),
    # Kimi / Moonshot
    Source("kimi-bot", "Kimi", ("KimiBot",), "https://www.kimi.ai/policies/kimibot.json"),
    Source("kimi-search", "Kimi", ("Kimi-SearchBot",), "https://www.kimi.ai/policies/kimi-searchbot.json"),
    Source("kimi-user", "Kimi", ("Kimi-User",), "https://www.kimi.ai/policies/kimi-user.json"),
    # Tencent
    Source("tencent-hyspider", "Tencent", ("HySpider",), "https://hy.tencent.com/policy/hyspider.json"),
    # Google（通用爬虫 + 用户触发抓取器）
    Source(
        "google-common",
        "Google",
        (
            "Googlebot",
            "Googlebot-Image",
            "Googlebot-Video",
            "GoogleOther",
            "GoogleOther-Image",
            "GoogleOther-Video",
            "Storebot-Google",
            "Google-InspectionTool",
            "Google-CloudVertexBot",
        ),
        "https://developers.google.com/static/crawling/ipranges/common-crawlers.json",
    ),
    Source(
        "google-user-triggered",
        "Google",
        ("Google-UserTriggered",),
        "https://developers.google.com/static/crawling/ipranges/user-triggered-fetchers.json",
    ),
    Source(
        "google-user-triggered-google",
        "Google",
        ("Google-UserTriggered-Google",),
        "https://developers.google.com/static/crawling/ipranges/user-triggered-fetchers-google.json",
    ),
    # Microsoft / Bing
    Source("bing", "Microsoft", ("bingbot",), "https://www.bing.com/toolbox/bingbot.json"),
    # Apple
    Source("apple", "Apple", ("Applebot",), "https://search.developer.apple.com/applebot.json"),
    # Mistral AI
    Source("mistral-user", "Mistral AI", ("MistralAI-User",), "https://mistral.ai/mistralai-user-ips.json"),
    Source("mistral-index", "Mistral AI", ("MistralAI-Index",), "https://mistral.ai/mistralai-index-ips.json"),
    # DuckDuckGo
    Source("duck-bot", "DuckDuckGo", ("DuckDuckBot",), "https://duckduckgo.com/duckduckbot.json"),
    Source("duck-assist", "DuckDuckGo", ("DuckAssistBot",), "https://duckduckgo.com/duckassistbot.json"),
    # Common Crawl
    Source("commoncrawl", "Common Crawl", ("CCBot",), "https://index.commoncrawl.org/ccbot.json"),
    # Ahrefs（同一接口涵盖 AhrefsBot 和 AhrefsSiteAudit）
    Source("ahrefs", "Ahrefs", ("AhrefsBot", "AhrefsSiteAudit"), "https://api.ahrefs.com/v3/public/crawler-ip-ranges"),
    # Amazon（官方页面 <code> 里的 JSON）
    Source("amazonbot", "Amazon", ("Amazonbot",), "https://developer.amazon.com/amazonbot/ip-addresses/", "amazon_html"),
    Source("amazon-search", "Amazon", ("Amzn-SearchBot",), "https://developer.amazon.com/amazonbot/searchbot-ip-addresses/", "amazon_html"),
    Source("amazon-user", "Amazon", ("Amzn-User",), "https://developer.amazon.com/amazonbot/live-ip-addresses/", "amazon_html"),
    # Meta（官方未出爬虫 JSON，web-crawlers 文档指定 AS32934；经 RIPE RIS 公开接口取通告网段）
    Source(
        "meta-as32934",
        "Meta",
        ("Meta-ExternalAgent", "Meta-ExternalFetcher", "FacebookBot"),
        "https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS32934",
        "ripe_asn",
    ),
)


class ParseError(ValueError):
    """官方列表格式不对或为空。"""


def parse_timestamp(raw: object) -> str | None:
    if raw is None or raw == "":
        return None
    if not isinstance(raw, str):
        raise ParseError(f"creationTime 不是字符串：{raw!r}")
    s = raw.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?", s):
        s += "Z"
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError as e:
        raise ParseError(f"creationTime 格式不对：{raw!r}") from e
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def normalize_cidr(raw: str, allow_bare: bool = False) -> str:
    if not isinstance(raw, str) or not raw.strip():
        raise ParseError(f"空 CIDR：{raw!r}")
    text = raw.strip()
    if "/" not in text:
        if not allow_bare:
            raise ParseError(f"缺少前缀长度：{text!r}")
        addr = ipaddress.ip_address(text)
        text = f"{addr}/{32 if addr.version == 4 else 128}"
    try:
        net = ipaddress.ip_network(text, strict=False)
    except ValueError as e:
        raise ParseError(f"非法 CIDR：{text!r}") from e
    if net.prefixlen == 0:
        raise ParseError(f"拒绝 /0 网段：{net}")
    if net.version == 4:
        if any(net.overlaps(ex) for ex in EXCLUDED_V4):
            raise ParseError(f"非公网 IPv4 CIDR：{net}")
    else:
        if not net.subnet_of(GLOBAL_V6) or any(net.overlaps(ex) for ex in EXCLUDED_V6):
            raise ParseError(f"非公网 IPv6 CIDR：{net}")
    return str(net)


def dedup_sort(cidrs: list[str]) -> list[str]:
    if not cidrs:
        raise ParseError("网段列表为空")
    if len(cidrs) > MAX_PREFIXES:
        raise ParseError(f"网段过多（{len(cidrs)} > {MAX_PREFIXES}）")
    nets = [ipaddress.ip_network(c, strict=False) for c in cidrs]
    nets.sort(key=lambda n: (n.version, int(n.network_address), n.prefixlen))
    out: list[str] = []
    seen: set[str] = set()
    for n in nets:
        s = str(n)
        if s not in seen:
            seen.add(s)
            out.append(s)
    return out


def parse_prefixes_json(data: object, allow_bare: bool = False) -> tuple[list[str], str | None]:
    if not isinstance(data, dict) or not isinstance(data.get("prefixes"), list):
        raise ParseError("JSON 缺少 prefixes 数组")
    rows = data["prefixes"]
    if not rows:
        raise ParseError("prefixes 数组为空")
    if len(rows) > MAX_PREFIXES:
        raise ParseError(f"prefixes 过多：{len(rows)}")
    cidrs: list[str] = []
    for row in rows:
        if not isinstance(row, dict):
            raise ParseError(f"prefix 项不是对象：{row!r}")
        val = row.get("ipv4Prefix") or row.get("ipv6Prefix") or (row.get("ip_prefix") if allow_bare else None)
        if not isinstance(val, str):
            raise ParseError(f"prefix 项缺少网段字段：{row!r}")
        cidr = normalize_cidr(val, allow_bare=allow_bare)
        if "ipv4Prefix" in row and ":" in cidr:
            raise ParseError(f"ipv4Prefix 含 IPv6：{cidr}")
        if "ipv6Prefix" in row and ":" not in cidr:
            raise ParseError(f"ipv6Prefix 含 IPv4：{cidr}")
        cidrs.append(cidr)
    return dedup_sort(cidrs), parse_timestamp(data.get("creationTime"))


def parse_amazon_html(text: str) -> tuple[list[str], str | None]:
    cands: list[dict] = []
    for m in re.finditer(r"<code\b[^>]*>([\s\S]*?)</code>", text, re.I):
        block = re.sub(r"</?span\b[^>]*>", "", m.group(1), flags=re.I)
        if "<" in block:
            continue
        decoded = html.unescape(block)
        try:
            obj = json.loads(decoded)
        except ValueError:
            continue
        if isinstance(obj, dict) and "prefixes" in obj and "creationTime" in obj:
            cands.append(obj)
    if len(cands) != 1:
        raise ParseError(f"Amazon 页面里找到 {len(cands)} 份候选 JSON（预期 1 份）")
    cidrs, published = parse_prefixes_json(cands[0], allow_bare=True)
    if not published:
        raise ParseError("Amazon JSON 缺少 creationTime")
    return cidrs, published


def parse_ripe_asn(text: str) -> tuple[list[str], str | None]:
    try:
        obj = json.loads(text)
    except ValueError as e:
        raise ParseError("RIPE 接口返回非 JSON") from e
    data = obj.get("data") if isinstance(obj, dict) else None
    prefixes = data.get("prefixes") if isinstance(data, dict) else None
    if not isinstance(prefixes, list) or not prefixes:
        raise ParseError("RIPE 接口缺少非空 data.prefixes")
    cidrs = [normalize_cidr(p["prefix"], allow_bare=False) for p in prefixes if isinstance(p, dict) and p.get("prefix")]
    published = parse_timestamp(data.get("latest_time"))
    return dedup_sort(cidrs), published


def parse_body(parser: str, text: str) -> tuple[list[str], str | None]:
    if parser == "prefixes":
        try:
            obj = json.loads(text)
        except ValueError as e:
            raise ParseError("返回不是合法 JSON") from e
        return parse_prefixes_json(obj, allow_bare=False)
    if parser == "amazon_html":
        return parse_amazon_html(text)
    if parser == "ripe_asn":
        return parse_ripe_asn(text)
    raise ParseError(f"未知解析器：{parser}")


def fetch_text(url: str, accept: str) -> str:
    last_err: Exception | None = None
    for attempt in range(1, RETRIES + 1):
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                if r.status != 200:
                    raise RuntimeError(f"HTTP {r.status}")
                raw = r.read(MAX_BYTES + 1)
                if len(raw) > MAX_BYTES:
                    raise RuntimeError(f"响应超过 {MAX_BYTES} 字节")
                return raw.decode("utf-8", errors="replace")
        except (urllib.error.URLError, TimeoutError, OSError, RuntimeError) as e:
            last_err = e
            if attempt < RETRIES:
                time.sleep(2 * attempt)
    raise RuntimeError(f"抓取失败（重试 {RETRIES} 次）：{last_err}")


def sync_all(dry: bool = False, only: set[str] | None = None) -> int:
    selected = [s for s in SOURCES if not only or s.id in only]
    if only and len(selected) != len(only):
        missing = sorted(only - {s.id for s in selected})
        print(f"未知 source id：{', '.join(missing)}", file=sys.stderr)
        return 2
    ok = 0
    failed: list[tuple[str, str]] = []
    totals_by_vendor: dict[str, int] = {}
    for src in selected:
        accept = "text/html" if src.parser == "amazon_html" else "application/json"
        try:
            body = fetch_text(src.url, accept)
            cidrs, published = parse_body(src.parser, body)
            if not dry:
                for bot in src.bots:
                    n = db.replace_ranges(src.vendor, bot, src.url, cidrs, published)
                    if n != len(cidrs):
                        raise RuntimeError(f"{bot} 写入条数 {n} != {len(cidrs)}")
            ok += 1
            totals_by_vendor[src.vendor] = totals_by_vendor.get(src.vendor, 0) + len(cidrs) * len(src.bots)
            pub = (published or "-")[:19]
            print(f"OK   {src.id:28s} {src.vendor:13s} bots={len(src.bots)} cidrs={len(cidrs):4d} published={pub}  {src.url}")
        except Exception as e:
            failed.append((src.id, str(e)))
            print(f"FAIL {src.id:28s} {src.url} -> {e}", file=sys.stderr)
    print(f"\n完成（mode={'dry' if dry else db.mode()}）：成功 {ok}/{len(selected)}，失败 {len(failed)}")
    if failed:
        print("失败列表（不覆盖旧数据，并以错误码退出以便告警）：", file=sys.stderr)
        for sid, msg in failed:
            print(f"  - {sid}: {msg}", file=sys.stderr)
        return 1
    return 0


def selftest() -> int:
    cidrs, pub = parse_body("prefixes", json.dumps({
        "creationTime": "2026-11-25T15:46:00.000000",
        "prefixes": [{"ipv4Prefix": "20.171.207.0/24"}, {"ipv6Prefix": "2603:1030::/32"}, {"ipv4Prefix": "20.171.207.0/24"}],
    }))
    assert cidrs == ["20.171.207.0/24", "2603:1030::/32"], cidrs
    assert pub == "2026-11-25T15:46:00+00:00", pub

    for bad in (
        {"prefixes": []},
        {"prefixes": [{"ipv4Prefix": "10.0.0.0/8"}]},
        {"prefixes": [{"ipv4Prefix": "127.0.0.1/32"}]},
        {"prefixes": [{"ipv6Prefix": "fe80::/10"}]},
        {"prefixes": [{"ipv4Prefix": "0.0.0.0/0"}]},
    ):
        try:
            parse_prefixes_json(bad)
            raise AssertionError(f"应该拒绝：{bad}")
        except ParseError:
            pass

    amz_html = '<html><body><code>{"creationTime":"2026-09-08T05:24:10+00:00","prefixes":[{"ipv4Prefix":"3.81.245.78"},{"ip_prefix":"3.82.67.224/32"}]}</code></body></html>'
    cidrs, pub = parse_body("amazon_html", amz_html)
    assert cidrs == ["3.81.245.78/32", "3.82.67.224/32"] and pub == "2026-09-08T05:24:10+00:00", (cidrs, pub)

    ripe = json.dumps({"data": {"latest_time": "2026-11-26T00:00:00", "prefixes": [{"prefix": "57.141.18.0/24"}, {"prefix": "2a03:2880::/32"}]}})
    cidrs, pub = parse_body("ripe_asn", ripe)
    assert cidrs == ["57.141.18.0/24", "2a03:2880::/32"] and pub == "2026-11-26T00:00:00+00:00", (cidrs, pub)

    # 覆盖面检查：hits.ts 里的所有 RANGE_BOTS 都在 SOURCES 里有配置
    covered = {b for s in SOURCES for b in s.bots}
    for req_bot in (
        "GPTBot", "OAI-SearchBot", "ChatGPT-User", "OAI-AdsBot",
        "ClaudeBot", "Claude-SearchBot", "Claude-User",
        "PerplexityBot", "Perplexity-User",
        "Googlebot", "Google-InspectionTool", "Google-UserTriggered", "Google-UserTriggered-Google",
        "bingbot", "Applebot", "DuckDuckBot", "DuckAssistBot", "CCBot",
        "AhrefsBot", "AhrefsSiteAudit", "Amazonbot", "Amzn-SearchBot", "Amzn-User",
        "Meta-ExternalAgent", "Meta-ExternalFetcher", "FacebookBot",
    ):
        assert req_bot in covered, f"缺少 {req_bot}"
    print("bot_ip_ranges selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="刷新官方爬虫 IP 段到 Supabase bot_ip_ranges")
    ap.add_argument("--selftest", action="store_true", help="不联网自检")
    ap.add_argument("--dry", action="store_true", help="抓并校验，不写库")
    ap.add_argument("--only", help="只跑指定 source id（逗号分隔）")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    only = {x.strip() for x in a.only.split(",") if x.strip()} if a.only else None
    return sync_all(dry=a.dry, only=only)


if __name__ == "__main__":
    sys.exit(main())
