#!/usr/bin/env python3
"""CE-GAD 对抗式引用诊断（接在 read_vs_cited.py 之后）：针对「读了不引」的非冻结页，抓实际被引 Top 2 竞品正文，跑 1 轮前沿模型 Pairwise Critique，每页只出 ≤3 条最小硬核改稿补丁。

灵感来自 On-Policy Generative Adversarial Distillation (CE-GAD)：
  - 传统 GEO 改稿靠静态 checklist（容易写成 AI 套话或无效扩写）；
  - 本脚本把「AI 现场读过本站、最终却引用了竞品 A/B」的真实失败样本喂给判别器，
    逐条对比我们缺了哪条硬事实 / 决策边界 / 一手来源 / 表格结构，强制剪枝为 ≤3 条最小补丁。

护栏（硬规则）：
  1. 严格读取 src/lib/frozen-pages.ts + ops/geo/experiments.json + read-cited 的 hold 字段：
     任何冻结页（2027-01-01）或正在跑对照实验（treated/control）的页一律跳过，绝不产出改稿补丁。
  2. 隐私合规（同 fanout_actions.py）：竞品原文/URL 与付费接口输出只写本地 --out 报告或邮件附录，
     绝不提交到公开仓库；--public 只写不含竞品细节的纯计数摘要。
  3. 预算封顶：默认 --max-usd 0.40，每调一次 OpenRouter 累加真实费用，超限即停。

用法：
  python3 ops/geo/adversarial_critic.py --selftest
  # 生产模式（接在 geo-panel.yml / read_vs_cited.py 后，直接读 panel-full.json，不另花搜索费）：
  python3 ops/geo/adversarial_critic.py run --read-cited ops/geo/panel/read-cited-2026-11-23.json \\
      --full /tmp/panel-full.json --out /tmp/adversarial-critic.md
  # 本机试跑模式（没有解密 panel-full.json 时，用 --live-probe 调 sonar 现取真实被引 Top 2 竞品）：
  python3 ops/geo/adversarial_critic.py run --read-cited ops/geo/panel/read-cited-2026-11-23.json \\
      --live-probe --out /Users/zhuyansen/出海/specs/adversarial-critic-2026-11-27.md
"""
from __future__ import annotations

import argparse
import html as html_lib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEO = ROOT / "ops" / "geo"
PANEL = GEO / "panel"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"
EXPERIMENTS = GEO / "experiments.json"
SITE = "https://jasonzhu.ai"
OWN_HOST = "jasonzhu.ai"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
UA = "Mozilla/5.0 (compatible; jasonzhu-geo-critic/1.0; +https://jasonzhu.ai)"
DEFAULT_MODEL = "anthropic/claude-opus-5.5"
DEFAULT_PROBE_MODEL = "perplexity/sonar"
MAX_PATCHES = 3
MAX_PAGE_CHARS = 6500
MAX_COMP_CHARS = 5500

SKIP_DOMAINS = {
    OWN_HOST,
    f"www.{OWN_HOST}",
    "vertexaisearch.cloud.google.com",
    "google.com",
    "www.google.com",
    "bing.com",
    "www.bing.com",
}


# ───────────── 路径归一化与冻结护栏 ─────────────

def page_key(url_or_path: str) -> str:
    """去掉域名、/en 或 /zh 前缀、尾部斜杠与查询串，返回如 /go-global/open-account 或 /。"""
    p = urllib.parse.urlsplit(str(url_or_path)).path if "://" in str(url_or_path) else str(url_or_path).split("?", 1)[0].split("#", 1)[0]
    p = re.sub(r"^/(?:en|zh)(?=/|$)", "", p)
    p = p.rstrip("/")
    return p or "/"


def host_of(url: str) -> str:
    try:
        return (urllib.parse.urlsplit(url).hostname or "").lower()
    except Exception:
        return ""


def load_hard_frozen_pages(frozen_ts: Path = FROZEN_TS, exp_path: Path = EXPERIMENTS, geo_dir: Path = GEO) -> dict[str, str]:
    """返回 {page_key: 冻结原因}。合并 frozen-pages.ts + experiments.json(treated/control) + questions.json(frozen)。"""
    blocked: dict[str, str] = {}

    # 1. src/lib/frozen-pages.ts
    if frozen_ts.exists():
        txt = frozen_ts.read_text(encoding="utf-8")
        m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", txt)
        if m:
            for raw in re.findall(r'"([^"]+)"', m.group(1)):
                blocked.setdefault(page_key(raw), "frozen-pages.ts 硬冻结")

    # 2. questions*.json 建立 qid -> target_url 映射
    qid_to_page: dict[str, str] = {}
    for qf in sorted(geo_dir.glob("questions*.json")):
        try:
            data = json.loads(qf.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        qset = data.get("set") or ("frozen" if qf.name == "questions.json" else "")
        for q in data.get("questions") or []:
            if q.get("target_url"):
                pk = page_key(q["target_url"])
                qid_to_page[q["id"]] = pk
                if qset == "frozen" or q.get("set") == "frozen":
                    blocked.setdefault(pk, "questions.json 冻结组（2027-01-01）")

    # 3. experiments.json 里的在跑实验（treated + control）
    if exp_path.exists():
        try:
            exps = json.loads(exp_path.read_text(encoding="utf-8")).get("experiments") or []
        except (OSError, ValueError):
            exps = []
        for e in exps:
            if e.get("status") in ("closed", "done", "ended"):
                continue
            eid = e.get("id", "unknown")
            for qid in list(e.get("treated") or []) + list(e.get("control") or []):
                if qid in qid_to_page:
                    blocked.setdefault(qid_to_page[qid], f"实验 {eid} 在跑（treated/control）")

    return blocked


def load_all_questions(geo_dir: Path = GEO) -> dict[str, dict]:
    """加载 ops/geo/questions*.json 中所有题目，返回 {question_id: question_dict}。"""
    out: dict[str, dict] = {}
    for qf in sorted(geo_dir.glob("questions*.json")):
        try:
            data = json.loads(qf.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        for q in data.get("questions") or []:
            qid = q.get("id")
            if qid and qid not in out:
                out[qid] = {**q, "_file": qf.name}
    return out


# ───────────── HTML 正文提取（仅保留 <main>/<article> 语义结构） ─────────────

class _MainTextExtractor(HTMLParser):
    SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "header", "aside", "form", "button", "template"}
    BLOCK_TAGS = {"p", "div", "section", "article", "li", "tr", "blockquote", "pre", "dd", "dt"}
    HEADING_TAGS = {"h1", "h2", "h3", "h4"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._in_main = 0
        self._has_main = False
        self._main_buf: list[str] = []
        self._all_buf: list[str] = []
        self._title_in = False
        self.title = ""

    def _emit(self, text: str) -> None:
        if self._in_main > 0:
            self._main_buf.append(text)
        self._all_buf.append(text)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        t = tag.lower()
        if t == "title":
            self._title_in = True
            return
        if t in self.SKIP_TAGS:
            self._skip_depth += 1
            return
        if t in ("main", "article"):
            self._in_main += 1
            self._has_main = True
        if self._skip_depth > 0:
            return
        if t in self.HEADING_TAGS:
            self._emit(f"\n{'#' * int(t[1])} ")
        elif t in ("td", "th"):
            self._emit(" | ")
        elif t == "li":
            self._emit("\n- ")
        elif t in self.BLOCK_TAGS:
            self._emit("\n")

    def handle_endtag(self, tag: str) -> None:
        t = tag.lower()
        if t == "title":
            self._title_in = False
            return
        if t in self.SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
            return
        if t in ("main", "article") and self._in_main > 0:
            self._in_main -= 1
        if self._skip_depth == 0 and t in self.HEADING_TAGS:
            self._emit("\n")

    def handle_data(self, data: str) -> None:
        if self._title_in:
            self.title += data
            return
        if self._skip_depth > 0:
            return
        txt = re.sub(r"\s+", " ", data)
        if txt.strip():
            self._emit(txt)

    def result(self) -> tuple[str, str]:
        raw = "".join(self._main_buf) if (self._has_main and len("".join(self._main_buf).strip()) >= 200) else "".join(self._all_buf)
        lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in raw.splitlines()]
        cleaned = "\n".join(ln for ln in lines if ln)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
        return html_lib.unescape(self.title).strip(), cleaned


def extract_main_text(raw_html: str, max_chars: int = MAX_PAGE_CHARS) -> tuple[str, str]:
    parser = _MainTextExtractor()
    parser.feed(raw_html)
    title, text = parser.result()
    if len(text) > max_chars:
        text = text[:max_chars].rsplit("\n", 1)[0] + "\n…[truncated]"
    return title, text


def fetch_page(url: str, max_chars: int = MAX_PAGE_CHARS, timeout: int = 18) -> dict:
    """抓网页并提取正文；失败时不抛异常，返回 ok=False 与原因。"""
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            ct = (resp.headers.get("Content-Type") or "").lower()
            raw = resp.read(1_500_000).decode("utf-8", errors="replace")
            if "html" not in ct and "<html" not in raw[:500].lower():
                text = re.sub(r"\s+", " ", raw).strip()[:max_chars]
                return {"url": url, "ok": True, "title": host_of(url), "text": text, "chars": len(text)}
            title, text = extract_main_text(raw, max_chars=max_chars)
            return {"url": url, "ok": len(text) >= 120, "title": title, "text": text, "chars": len(text),
                    "error": None if len(text) >= 120 else "正文过短（可能需 JS 渲染）"}
    except Exception as exc:
        return {"url": url, "ok": False, "title": "", "text": "", "chars": 0, "error": str(exc)[:140]}


# ───────────── 竞品 URL 抽取（支持 panel-full.json 与 live-probe） ─────────────

def pick_competitor_urls(cited_urls: list[str], top_k: int = 2) -> list[str]:
    """去重、过滤自家域名与搜索引擎跳板、按同域名只取频次最高的 1 条，返回前 top_k 个竞品 URL。"""
    clean_counts: Counter[str] = Counter()
    for raw in cited_urls:
        if not raw or not isinstance(raw, str):
            continue
        u = raw.split("#:~:text=", 1)[0].split("#", 1)[0].strip()
        if not u.startswith(("http://", "https://")):
            continue
        h = host_of(u)
        if not h or h in SKIP_DOMAINS or h.endswith("." + OWN_HOST):
            continue
        clean_counts[u] += 1

    picked: list[str] = []
    seen_hosts: set[str] = set()
    for u, _ in clean_counts.most_common():
        h = host_of(u).removeprefix("www.")
        if h in seen_hosts:
            continue
        seen_hosts.add(h)
        picked.append(u)
        if len(picked) >= top_k:
            break
    return picked


def extract_competitors_from_full(full_data: dict, qids: list[str], top_k: int = 2) -> tuple[list[str], list[str]]:
    """从 panel-full.json 里取出指定题目的竞品被引 URL 与 Gemini #:~:text= 原句。"""
    urls: list[str] = []
    quotes: list[str] = []
    qset = set(qids)
    for row in full_data.get("answers") or full_data.get("rows") or []:
        if row.get("question_id") not in qset:
            continue
        for c in row.get("cited") or row.get("citations") or []:
            u = c.get("url") if isinstance(c, dict) else str(c)
            if not u:
                continue
            urls.append(u)
            if "#:~:text=" in u and OWN_HOST not in host_of(u):
                frag = urllib.parse.unquote(u.split("#:~:text=", 1)[1])[:200]
                quotes.append(f"[{host_of(u)}] {frag}")
    return pick_competitor_urls(urls, top_k=top_k + 2), quotes[:6]


def load_env_key(name: str) -> str:
    if os.environ.get(name):
        return os.environ[name]
    for p in (Path.home() / ".claude" / ".env", ROOT / ".env.local", ROOT / ".env"):
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
            s = line.strip()
            if s and not s.startswith("#") and "=" in s:
                k, v = s.split("=", 1)
                if k.strip() == name:
                    return v.strip().strip('"').strip("'")
    return ""


def openrouter_chat(api_key: str, model: str, messages: list[dict], max_tokens: int = 1600,
                    temperature: float = 0.2, response_format: dict | None = None, timeout: int = 90) -> dict:
    """调用 OpenRouter Chat Completions，返回 content, citations, cost_usd, usage。"""
    payload: dict = {"model": model, "messages": messages, "max_tokens": max_tokens, "temperature": temperature}
    if response_format:
        payload["response_format"] = response_format
    req = urllib.request.Request(
        OPENROUTER_URL,
        method="POST",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": SITE,
            "X-Title": "jasonzhu-geo-adversarial-critic",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    msg = (data.get("choices") or [{}])[0].get("message") or {}
    usage = data.get("usage") or {}
    # OpenRouter 返回 citations 在顶层或 annotations 里
    citations: list[str] = []
    for c in data.get("citations") or []:
        if isinstance(c, str):
            citations.append(c)
        elif isinstance(c, dict) and c.get("url"):
            citations.append(c["url"])
    for ann in msg.get("annotations") or []:
        uc = ann.get("url_citation") or {}
        if uc.get("url"):
            citations.append(uc["url"])
    cost = float(usage.get("cost") or 0.0)
    return {"content": msg.get("content") or "", "citations": citations, "cost_usd": cost, "usage": usage}


def live_probe_competitors(api_key: str, question_text: str, probe_model: str = DEFAULT_PROBE_MODEL) -> dict:
    """用带联网检索的模型（如 perplexity/sonar）现取该题真实被引 URL 与回答摘要。"""
    res = openrouter_chat(
        api_key=api_key,
        model=probe_model,
        messages=[{"role": "user", "content": question_text}],
        max_tokens=900,
        temperature=0.1,
    )
    return {
        "answer_excerpt": res["content"][:1800],
        "cited_urls": pick_competitor_urls(res["citations"], top_k=4),
        "raw_citations": res["citations"],
        "cost_usd": res["cost_usd"],
    }


# ───────────── CE-GAD Pairwise Adversarial Critique ─────────────

CRITIC_SYSTEM = """你是 GEO（Generative Engine Optimization）对抗判别器，遵循 CE-GAD（On-Policy Generative Adversarial Distillation）剪枝原则。
你会拿到：
1. 一道真实用户提问（AI 搜索引擎回答该题时，现场读过 jasonzhu.ai 的页面，但最终引用了竞品页面，没有引用 jasonzhu.ai）；
2. 我方页面正文（jasonzhu.ai）；
3. 实际被引的 Top 1–2 竞品页面正文（以及实时 AI 回答摘要/被引原句）。

你的任务：找出 AI 为什么选竞品而不选我方的**决定性差异**，并只输出 **≤3 条最小、最高信噪比的改稿补丁**。

严格规则（违反即不合格）：
- 严禁空泛 SEO 废话（例如「增加关键词」「写得更详细」「提升权威感」「优化可读性」「加入更多案例」）。
- 严禁编造任何未出现在我方正文或竞品正文里的费率、天数、政策数字；如果补丁需要某个我方目前没有的最新费率/政策数字，必须在 patch_instruction 里标明 `[需核实官方最新数据]` 并把 `verify_needed` 设为 `true`。
- 每条补丁必须能落地到具体位置（slot），且只改最小区块（例如顶部 BLUF 结论块、1 张对比表、1 条带边界条件的 FAQ、1 处一手来源/日期标注）。
- 补丁数量严格 ≤3 条，按「对 AI 引用率提升最大」排序；每个字段保持凝练（单字段 ≤120 字），字符串内部如有引号一律用中文引号「」或单引号，确保输出是合法可解析的完整 JSON。
- 用中文输出 JSON，不要输出 JSON 以外的解释文字。

输出 JSON schema：
{
  "why_not_cited": "1–2 句直击要害：AI 读了我方页却选竞品的真正原因",
  "competitor_winning_pattern": "竞品被 AI 当证据抽取的 1–2 个关键事实/结构特征",
  "patches": [
    {
      "priority": 1,
      "slot": "具体改哪里（如：H1 下第一屏 BLUF / 平台对比表 / 新增边界条件小节）",
      "gap_type": "decision_boundary | verifiable_data | official_source | comparison_matrix | bluf_extractability",
      "competitor_advantage": "竞品具体写了什么硬内容而我方缺失或埋太深",
      "patch_instruction": "精确到句子/表头的最小改稿指令（不重写全文；需核实数字标 [需核实官方最新数据]）",
      "verify_needed": true,
      "expected_quote": "改完后希望被 AI 直接抽取为引用证据的 1–2 句英文/中文样句"
    }
  ]
}"""


def parse_json_object(raw: str) -> dict:
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", s)
        if not m:
            raise
        return json.loads(m.group(0))


def normalize_critique(obj: dict) -> dict:
    """强制剪枝：最多保留 MAX_PATCHES 条，校验字段完整性。"""
    patches = []
    for i, p in enumerate((obj.get("patches") or [])[:MAX_PATCHES], start=1):
        if not isinstance(p, dict):
            continue
        patches.append({
            "priority": int(p.get("priority") or i),
            "slot": str(p.get("slot") or "").strip(),
            "gap_type": str(p.get("gap_type") or "verifiable_data").strip(),
            "competitor_advantage": str(p.get("competitor_advantage") or "").strip(),
            "patch_instruction": str(p.get("patch_instruction") or "").strip(),
            "verify_needed": bool(p.get("verify_needed", False)),
            "expected_quote": str(p.get("expected_quote") or "").strip(),
        })
    return {
        "why_not_cited": str(obj.get("why_not_cited") or "").strip(),
        "competitor_winning_pattern": str(obj.get("competitor_winning_pattern") or "").strip(),
        "patches": patches,
    }


def run_pairwise_critique(api_key: str, model: str, question_id: str, question_text: str,
                          our_page: dict, comp_pages: list[dict], ai_answer_excerpt: str = "",
                          gemini_quotes: list[str] | None = None) -> tuple[dict, float]:
    comp_blocks = []
    for idx, cp in enumerate(comp_pages, start=1):
        if cp.get("ok"):
            comp_blocks.append(f"### 竞品 {idx}: {cp['url']}\n标题: {cp.get('title','')}\n正文节选:\n{cp['text']}")
        else:
            comp_blocks.append(f"### 竞品 {idx}: {cp['url']}\n（抓正文受限: {cp.get('error')}，请结合下方 AI 实时回答摘要分析）")

    user_parts = [
        f"## 题目 ID: {question_id}",
        f"## 真实用户提问:\n{question_text}",
        f"## 我方页面（被读但未被引）: {our_page['url']}\n标题: {our_page.get('title','')}\n正文节选:\n{our_page.get('text','(抓取失败)')}",
        "## 实际被引 Top 竞品:\n" + ("\n\n".join(comp_blocks) if comp_blocks else "（无可用竞品正文）"),
    ]
    if ai_answer_excerpt:
        user_parts.append(f"## 实时 AI 回答摘要（用于观察 AI 实际抽取了什么信息结构）:\n{ai_answer_excerpt}")
    if gemini_quotes:
        user_parts.append("## 面板记录的竞品被引原句 (#:~:text=):\n" + "\n".join(f"- {q}" for q in gemini_quotes))

    total_cost = 0.0
    last_err: Exception | None = None
    for attempt in range(2):
        res = openrouter_chat(
            api_key=api_key,
            model=model,
            messages=[
                {"role": "system", "content": CRITIC_SYSTEM},
                {"role": "user", "content": "\n\n".join(user_parts) + ("\n\n注意：上次输出 JSON 未闭合，这次请更凝练并确保输出完整合法 JSON。" if attempt else "")},
            ],
            max_tokens=3200,
            temperature=0.15,
        )
        total_cost += res["cost_usd"]
        try:
            parsed = normalize_critique(parse_json_object(res["content"]))
            return parsed, total_cost
        except Exception as exc:
            last_err = exc
    raise RuntimeError(f"JSON 解析失败（已重试）: {last_err}")


# ───────────── 目标挑选与报告渲染 ─────────────

def select_targets(read_cited_data: dict, all_qs: dict[str, dict], hard_frozen: dict[str, str],
                   extra_qids: list[str] | None = None, include_claude_reads: bool = True,
                   max_pages: int = 6) -> tuple[list[dict], list[dict]]:
    """从 read-cited 产出里挑出非冻结的「读了不引」页（+ 可选 Claude 高读零引页 / 额外指定题）。
    返回 (selected_targets, skipped_frozen_list)。"""
    selected: list[dict] = []
    skipped: list[dict] = []
    seen_pages: set[str] = set()

    for row in read_cited_data.get("pages") or []:
        pk = page_key(row["page"])
        is_read_not_cited = row.get("class") == "读了不引"
        is_claude_heavy = include_claude_reads and int(row.get("claude_reads") or 0) >= 5 and int(row.get("all_cited") or 0) == 0
        if not (is_read_not_cited or is_claude_heavy):
            continue

        hold_str = str(row.get("hold") or "")
        hard_reason = hard_frozen.get(pk)
        if not hard_reason and (hold_str.startswith("冻结") or "在跑，先不动" in hold_str):
            hard_reason = hold_str

        if hard_reason:
            skipped.append({"page": pk, "class": row.get("class"), "chatgpt_reads": row.get("chatgpt_reads", 0),
                            "claude_reads": row.get("claude_reads", 0), "impressions": row.get("impressions", 0),
                            "reason": hard_reason})
            continue

        qids = [q for q in (row.get("questions") or []) if q in all_qs]
        if not qids:
            continue
        seen_pages.add(pk)
        selected.append({
            "page": pk,
            "url": f"{SITE}/en{'' if pk == '/' else pk}",
            "source": "read-not-cited" if is_read_not_cited else "claude-read-zero-cited",
            "chatgpt_reads": int(row.get("chatgpt_reads") or 0),
            "claude_reads": int(row.get("claude_reads") or 0),
            "chatgpt_cited": int(row.get("chatgpt_cited") or 0),
            "all_cited": int(row.get("all_cited") or 0),
            "impressions": int(row.get("impressions") or 0),
            "soft_hold": hold_str or None,
            "questions": qids,
        })

    for qid in extra_qids or []:
        q = all_qs.get(qid)
        if not q or not q.get("target_url"):
            continue
        pk = page_key(q["target_url"])
        if pk in hard_frozen:
            skipped.append({"page": pk, "class": "extra", "chatgpt_reads": 0, "claude_reads": 0,
                            "impressions": 0, "reason": hard_frozen[pk]})
            continue
        if pk in seen_pages:
            continue
        seen_pages.add(pk)
        selected.append({
            "page": pk,
            "url": q["target_url"],
            "source": "extra-unfrozen-panel-q",
            "chatgpt_reads": 0,
            "claude_reads": 0,
            "chatgpt_cited": 0,
            "all_cited": 0,
            "impressions": 0,
            "soft_hold": None,
            "questions": [qid],
        })

    return selected[:max_pages], skipped


def render_markdown(date_str: str, verify_date: str, model: str, probe_model: str | None,
                    total_cost: float, diagnostics: list[dict], skipped: list[dict]) -> str:
    lines = [
        f"# CE-GAD 对抗式引用诊断报告（{date_str}）",
        "",
        f"- **判别模型**：`{model}`" + (f"（竞品探针：`{probe_model}`）" if probe_model else "（竞品来源：`panel-full.json`）"),
        f"- **本轮实测成本**：`${total_cost:.4f}`",
        f"- **已诊断非冻结页**：{len(diagnostics)} 项诊断（共跳过 {len(skipped)} 个冻结/实验期页面）",
        f"- **3 周后效果验证节点**：**{verify_date}**（对应 `2026-12-21` 周一 GEO 引用面板 + `read_vs_cited.py` 读数；改稿前记得在 `ops/geo/experiments.json` 记一笔处理组/对照组）",
        "",
        "## 一、已跳过的冻结 / 在跑实验页（硬护栏生效）",
        "",
        "| 页面 | 分类 | ChatGPT 读 | Claude 读 | 近 3 月展示 | 跳过原因 |",
        "|---|---|---:|---:|---:|---|",
    ]
    for s in skipped:
        lines.append(f"| `{s['page']}` | {s['class']} | {s['chatgpt_reads']} | {s['claude_reads']} | {s['impressions']} | {s['reason']} |")

    lines += ["", "## 二、非冻结页对抗诊断与 ≤3 条最小改稿补丁", ""]
    for idx, d in enumerate(diagnostics, start=1):
        c = d["critique"]
        lines.append(f"### {idx}. `{d['page']}` · 题 `{d['question_id']}`")
        lines.append("")
        lines.append(f"- **页面**：{d['url']}（来源：`{d['source']}`；ChatGPT 读 {d['chatgpt_reads']} / Claude 读 {d['claude_reads']} / 近 3 月展示 {d['impressions']}）")
        if d.get("soft_hold"):
            lines.append(f"- **软提醒**：⚠️ {d['soft_hold']}")
        lines.append(f"- **真实提问**：{d['question_text']}")
        comps = [f"{cp['url']} ({'已抓正文 ' + str(cp['chars']) + ' 字' if cp['ok'] else '抓正文受限: ' + str(cp.get('error'))})" for cp in d["competitors"]]
        lines.append(f"- **实际被引 Top 竞品**：" + ("；".join(comps) if comps else "（无）"))
        lines.append(f"- **不引根因**：{c['why_not_cited']}")
        lines.append(f"- **竞品胜出特征**：{c['competitor_winning_pattern']}")
        lines.append("")
        for p in c["patches"]:
            badge = " `[需核实数据]`" if p["verify_needed"] else ""
            lines.append(f"**补丁 {p['priority']}（`{p['gap_type']}` · {p['slot']}）**{badge}")
            lines.append(f"- **竞品优势**：{p['competitor_advantage']}")
            lines.append(f"- **最小改稿**：{p['patch_instruction']}")
            lines.append(f"- **目标被引句**：> {p['expected_quote']}")
            lines.append("")

    lines += [
        "## 三、3 周效果验证闭环",
        "",
        f"1. **改稿前登记**：挑定要改的 2–3 页后，在 `ops/geo/experiments.json` 登记 `treated` 与未改同类 `control`（其中 `/go-global/open-account` 有 GIGALinks 软提醒，务必单列注明）。",
        f"2. **3 周验证日**：**{verify_date}**（并在 `2026-12-21` 周一面板自动读数），对比「ChatGPT 现场读 → 被引转化率」「Perplexity/Gemini/AI Mode 引用率」「GSC 曝光与点击」。",
        "3. **止损规则**：若 3 周后处理组引用率未显著高于对照组，直接停掉该类补丁，不扩大到冻结页解冻后的改写。",
        "",
    ]
    return "\n".join(lines)


# ───────────── 主命令与自测 ─────────────

def latest_read_cited() -> Path | None:
    files = sorted(PANEL.glob("read-cited-*.json"))
    return files[-1] if files else None


def cmd_run(a: argparse.Namespace) -> int:
    rc_path = Path(a.read_cited) if a.read_cited else latest_read_cited()
    if not rc_path or not rc_path.exists():
        raise SystemExit("找不到 read-cited-<日期>.json，请先跑 ops/geo/read_vs_cited.py")

    rc_data = json.loads(rc_path.read_text(encoding="utf-8"))
    all_qs = load_all_questions()
    hard_frozen = load_hard_frozen_pages()
    extra_qids = [x.strip() for x in (a.extra_questions or "").split(",") if x.strip()]
    targets, skipped = select_targets(rc_data, all_qs, hard_frozen, extra_qids=extra_qids,
                                      include_claude_reads=not a.only_chatgpt_reads, max_pages=a.max_pages)

    full_data = json.loads(Path(a.full).read_text(encoding="utf-8")) if a.full and Path(a.full).exists() else None
    if not full_data and not a.live_probe:
        raise SystemExit("必须提供 --full panel-full.json 或开启 --live-probe")

    api_key = load_env_key("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("缺少 OPENROUTER_API_KEY（检查环境变量或 ~/.claude/.env）")

    today = datetime.now(timezone(timedelta(hours=8))).date()
    date_str = a.date or today.isoformat()
    verify_date = (datetime.strptime(date_str, "%Y-%m-%d").date() + timedelta(days=21)).isoformat()

    total_cost = 0.0
    diagnostics: list[dict] = []

    for tgt in targets:
        # 每页默认挑前 max_q_per_page 个问题诊断（避免单页占满预算）
        for qid in tgt["questions"][:a.max_q_per_page]:
            if total_cost >= a.max_usd:
                print(f"[budget] 已达预算上限 ${total_cost:.4f} >= ${a.max_usd:.2f}，停止后续诊断")
                break
            qobj = all_qs[qid]
            qtext = qobj.get("question") or qobj.get("prompt") or qid
            print(f"[critic] 诊断 {tgt['page']} ({qid}) ...", flush=True)

            our_page = fetch_page(tgt["url"], max_chars=MAX_PAGE_CHARS)
            ai_excerpt = ""
            gemini_quotes: list[str] = []
            if full_data:
                comp_urls, gemini_quotes = extract_competitors_from_full(full_data, [qid], top_k=2)
            else:
                probe = live_probe_competitors(api_key, qtext, probe_model=a.probe_model)
                total_cost += probe["cost_usd"]
                comp_urls = probe["cited_urls"]
                ai_excerpt = probe["answer_excerpt"]

            # 抓取前 2 个可打开的竞品页（最多试 4 个候选 URL）
            comp_pages: list[dict] = []
            failed_comps: list[dict] = []
            for cu in comp_urls:
                if len(comp_pages) >= 2:
                    break
                fetched = fetch_page(cu, max_chars=MAX_COMP_CHARS)
                if fetched["ok"]:
                    comp_pages.append(fetched)
                else:
                    failed_comps.append(fetched)
            while len(comp_pages) < 2 and failed_comps:
                comp_pages.append(failed_comps.pop(0))

            critique, cost = run_pairwise_critique(
                api_key=api_key,
                model=a.model,
                question_id=qid,
                question_text=qtext,
                our_page=our_page,
                comp_pages=comp_pages,
                ai_answer_excerpt=ai_excerpt,
                gemini_quotes=gemini_quotes,
            )
            total_cost += cost
            diagnostics.append({
                "page": tgt["page"],
                "url": tgt["url"],
                "source": tgt["source"],
                "chatgpt_reads": tgt["chatgpt_reads"],
                "claude_reads": tgt["claude_reads"],
                "impressions": tgt["impressions"],
                "soft_hold": tgt["soft_hold"],
                "question_id": qid,
                "question_text": qtext,
                "our_chars": our_page["chars"],
                "competitors": comp_pages,
                "critique": critique,
                "cost_usd": cost,
            })

    md = render_markdown(date_str, verify_date, a.model, None if full_data else a.probe_model,
                         total_cost, diagnostics, skipped)
    if a.out:
        out_path = Path(a.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(md, encoding="utf-8")
        print(f"已写入诊断报告：{out_path}")

    if a.public:
        pub = {
            "date": date_str,
            "verify_after": verify_date,
            "model": a.model,
            "probe_mode": "panel-full" if full_data else "live-probe",
            "pages_diagnosed": len({d["page"] for d in diagnostics}),
            "questions_diagnosed": len(diagnostics),
            "pages_skipped_frozen": len(skipped),
            "total_patches": sum(len(d["critique"]["patches"]) for d in diagnostics),
            "cost_usd": round(total_cost, 4),
            "diagnosed_pages": sorted({d["page"] for d in diagnostics}),
            "script": "ops/geo/adversarial_critic.py",
        }
        pub_path = Path(a.public)
        pub_path.parent.mkdir(parents=True, exist_ok=True)
        pub_path.write_text(json.dumps(pub, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"已写入公开计数：{pub_path}")

    print(f"完成：{len(diagnostics)} 题诊断，跳过 {len(skipped)} 个冻结/实验页，总花费 ${total_cost:.4f}，3 周验证日 {verify_date}")
    return 0


def selftest() -> int:
    # 1. 路径归一化
    assert page_key("https://jasonzhu.ai/en/go-global/open-account/") == "/go-global/open-account"
    assert page_key("https://jasonzhu.ai/zh/") == "/"
    assert page_key("/en/blog/nvidia-dli-free-courses") == "/blog/nvidia-dli-free-courses"

    # 2. 冻结护栏（真实仓库文件）
    frozen = load_hard_frozen_pages()
    assert "/blog/nvidia-dli-free-courses" in frozen
    assert "/blog/us-llc-developer-accounts" in frozen
    assert "/go-global" not in frozen
    assert "/go-global/open-account" not in frozen
    assert "/go-global/payments" not in frozen

    # 3. 选页逻辑：冻结与在跑实验页必须被剔除，非冻结页与软提醒页保留
    fake_rc = {
        "pages": [
            {"page": "/blog/nvidia-dli-free-courses", "class": "读了不引", "chatgpt_reads": 5, "claude_reads": 9,
             "all_cited": 1, "impressions": 5540, "hold": "实验 bluf-real-2026-11-25 在跑，先不动",
             "questions": ["real-learn-nvidia-dli"]},
            {"page": "/go-global", "class": "读了不引", "chatgpt_reads": 12, "claude_reads": 1,
             "all_cited": 0, "impressions": 115, "hold": None, "questions": ["real-co-us-or-uk-remote"]},
            {"page": "/go-global/open-account", "class": "读了不引", "chatgpt_reads": 5, "claude_reads": 0,
             "all_cited": 3, "impressions": 781, "hold": "实验 gigalinks-jasonzhu 处理组的题也引用这页，改前先在 experiments.json 记一笔",
             "questions": ["real-pay-china-founder"]},
            {"page": "/go-global/payments", "class": "没读也没引", "chatgpt_reads": 1, "claude_reads": 17,
             "all_cited": 0, "impressions": 221, "hold": None, "questions": ["real-pay-tax-headaches"]},
        ]
    }
    all_qs = load_all_questions()
    sel, skip = select_targets(fake_rc, all_qs, frozen)
    assert [x["page"] for x in sel] == ["/go-global", "/go-global/open-account", "/go-global/payments"]
    assert [x["page"] for x in skip] == ["/blog/nvidia-dli-free-courses"]

    # 4. HTML 提取去掉 nav/script，保留 main 标题和表格
    sample_html = """<html><head><title>Test Page</title><script>var x=1;</script></head>
    <body><nav>Menu Noise</nav><main><h1>Payment Guide</h1><p>Direct answer here for founders with enough words to exceed the 200 char threshold so main is selected cleanly over body fallback content in our parser unit test verification.</p>
    <table><tr><th>Platform</th><th>Fee</th></tr><tr><td>Creem</td><td>3.9% + $0.40</td></tr></table></main><footer>Footer Noise</footer></body></html>"""
    title, text = extract_main_text(sample_html)
    assert title == "Test Page"
    assert "Payment Guide" in text and "Creem" in text and "Menu Noise" not in text and "Footer Noise" not in text

    # 5. 竞品 URL 去重、过滤本站与跳板、同域只取 1 条
    picked = pick_competitor_urls([
        "https://jasonzhu.ai/en/go-global",
        "https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc",
        "https://www.stripe.com/atlas#:~:text=hello",
        "https://stripe.com/guides/llc",
        "https://paddle.com/blog/mor",
        "https://paddle.com/blog/mor#section",
    ], top_k=2)
    assert picked == ["https://paddle.com/blog/mor", "https://www.stripe.com/atlas"], picked

    # 6. 补丁剪枝（强制 ≤3 条）
    norm = normalize_critique({
        "why_not_cited": "缺关键边界",
        "competitor_winning_pattern": "表格清晰",
        "patches": [{"slot": f"s{i}", "gap_type": "verifiable_data", "competitor_advantage": "a",
                     "patch_instruction": "p", "verify_needed": True, "expected_quote": "q"} for i in range(1, 6)],
    })
    assert len(norm["patches"]) == MAX_PATCHES

    print("adversarial_critic selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="CE-GAD 对抗式引用诊断（针对非冻结「读了不引」页产出 ≤3 条最小补丁）")
    ap.add_argument("--selftest", action="store_true", help="跑本地单测后退出")
    sub = ap.add_subparsers(dest="cmd")
    r = sub.add_parser("run", help="跑一轮对抗式引用诊断")
    r.add_argument("--read-cited", default="", help="read_vs_cited.py 的公开 JSON（默认最新一份）")
    r.add_argument("--full", default="", help="panel-full.json（生产模式：直接提取真实被引竞品，不另花搜索费）")
    r.add_argument("--live-probe", action="store_true", help="无 panel-full.json 时，用 OpenRouter 联网模型现取 Top 2 竞品")
    r.add_argument("--extra-questions", default="", help="额外补充的非冻结题目 ID（逗号分隔）")
    r.add_argument("--only-chatgpt-reads", action="store_true", help="只跑 ChatGPT 读了不引，不纳入 Claude 高读零引页")
    r.add_argument("--model", default=DEFAULT_MODEL, help=f"判别模型（默认 {DEFAULT_MODEL}）")
    r.add_argument("--probe-model", default=DEFAULT_PROBE_MODEL, help=f"live-probe 模型（默认 {DEFAULT_PROBE_MODEL}）")
    r.add_argument("--max-pages", type=int, default=6, help="最多诊断几个页面（默认 6）")
    r.add_argument("--max-q-per-page", type=int, default=2, help="每页最多诊断几道题（默认 2）")
    r.add_argument("--max-usd", type=float, default=0.40, help="本轮预算上限（美元，默认 0.40）")
    r.add_argument("--date", default="", help="报告日期 YYYY-MM-DD（默认北京时间今天）")
    r.add_argument("--out", default="", help="详细报告输出路径（本地/邮件附录，不进公开仓库）")
    r.add_argument("--public", default="", help="纯计数公开摘要路径（可选）")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.cmd == "run":
        return cmd_run(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
