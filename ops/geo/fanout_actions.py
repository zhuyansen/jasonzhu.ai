#!/usr/bin/env python3
"""子查询之后：把这周 AI 搜过的词，变成「改哪页、补哪几个词、去哪几个站」。

fanout.py 回答「AI 搜了什么、我们在 Google 排没排上」。这里接着做四件事，只读面板和 fanout.py 的存档，不另花钱：

  1 页面缺的词：同一道题问几次，整句几乎每次都不一样（两次之间原样相同的只有 7–16%），但 83–86% 的用词是同一批
    「公共词」（至少两个回答都用过的词；2026-11-24 用 11-21、11-23 两次面板和三轮中英文测试算的，见 PANEL.md）。
    把每道题的公共词和这道题 target_url 页面的正文比，列出页面上没有的词。再按 AI 拼搜索词常用的几类词
    （条件、成本、适用对象、年份）看页面缺了哪一类。
  2 代表搜索词：每道题挑一条覆盖公共词最多的真实搜索词，报它的 Google 名次。整句每周会变，但「这道题最典型的
    那条搜索」可以逐周比，比看几百条各不相同的整句稳。
  3 外部网站：AI 搜这些词时 Google 第一页上的网站，按覆盖了几道题排（贪心：每次挑能多盖住最多「我们一条都没排上的题」
    的站）。这是 Rochwerger 讲的 publisher-first：投稿、被收录、请求加链接，先找它们。官方站只能引用，不能投稿，单独标出。
  4 被引的原句（2026-11-24 起）：Gemini App 的引用链接几乎都带 #:~:text=（AI 拿来当证据的那句原文），从面板回答的
    cited 里挑出本站的，按页面和句子合并；顺带算每家引擎的链接里带原句、带 utm_source 的比例（GA4 看到的只是点进来的那部分）。
    2026-11-26 起再看每句在页面上的位置（检验「AI 只读页面前半截」）：取线上页面，正文 = <main> 里看得见的字
    （去掉导航、页脚、表单、按钮），只比字母和数字（空格、标点不管），按 textStart、textEnd 找到句子开头，
    位置 = 开头前的字数 ÷ 正文总字数，再记它在哪种块里（标题、段落、列表项、表格、FAQ 或折叠段、其他）。
    报前 10%、30%、50% 里各有几句、中位位置，区间按页面重抽（同一页的几句一起进出）；找不到的按原因计数。
  页面按 demand.json 排先后：Search Console 近 3 个月有展示的页面先改（出海专题只占全站点击约 1.5%，提示词库和学习页更多）。

报告只进邮件（--appendix）：里面有搜索词原文和别的网站的域名，来自付费接口。--public 只写计数，标准输出也只打计数
（公开仓库的 Actions 日志是公开的）。

用法：
  python3 ops/geo/fanout_actions.py --selftest
  python3 ops/geo/fanout_actions.py run --full panel-full.json --archive fanout-full.json --sets frozen,real \\
      --date 2026-11-30 --public ops/geo/panel/actions-2026-11-30.json --appendix actions.md
  python3 ops/geo/fanout_actions.py demand gsc-pages.json     # 用 Search Console 的页面导出更新 demand.json
"""
from __future__ import annotations

import argparse
import html
import json
import math
import random
import re
import statistics
import sys
import unicodedata
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fanout as fo  # noqa: E402
import panel_run as pr  # noqa: E402

DEMAND = pr.GEO / "demand.json"
MIN_ANSWERS = 2         # 公共词：至少几个回答都用过
SHOWN_WORDS = 8
SHOWN_PAGES = 15
SHOWN_SITES = 15
SHOWN_QUOTES = 15       # 第 3 张表：本站被引的原句最多列几句
CLASS_SHARE = 0.4       # 这道题至少这个比例的搜索都带某一类词，页面却一个都没有，才报「缺这一类」
UA = "jasonzhu-geo-panel/1.0 (+https://jasonzhu.ai)"
CJK = re.compile(r"[㐀-鿿]")
TOKEN = re.compile(r"[a-z0-9]+(?:[.+-][a-z0-9]+)*")
STOP = set("a an the of for to in on and or with is are be can do does how what which who where when why my your i we our "
           "it its this that as by from at me you vs via into than then".split())
NOT_ACTIONABLE = {"site", "official", "com", "www", "https", "http", pr.OWN, pr.OWN.split(".")[0]}
CLASSES = {   # AI 拼搜索词最常用、人自己搜几乎不用的几类（fanout_anatomy，2026-11-24）
    "条件（资格、要求、材料、审核）": r"supported|availability|available|eligib\w*|requirements?|required|documents?|\bkyc\b|verif\w*|"
                          r"onboarding|approv\w*|restrict\w*|prohibited|\bein\b|\bitin\b|\bssn\b",
    "成本（费用、价格）": r"fees?\b|pricing|prices?\b|costs?\b|charges?\b|commission|\brates?\b|\bfree\b",
    "适用对象（地区、身份）": r"china|chinese|mainland|non-?us\b|non-?residents?|residents?|foreign|overseas|abroad|international|"
                       r"cross-?border|\buk\b|\bus\b|\busa\b|united states|united kingdom",
    "年份": r"\b20\d\d\b",
}
CLASSES = {k: re.compile(v, re.I) for k, v in CLASSES.items()}
PLATFORMS = {"reddit.com", "youtube.com", "medium.com", "dev.to", "github.com", "linkedin.com", "quora.com", "x.com",
             "twitter.com", "substack.com", "producthunt.com", "indiehackers.com", "news.ycombinator.com", "hashnode.com",
             "stackoverflow.com", "huggingface.co", "facebook.com", "tiktok.com", "zhihu.com"}
# 被引原句在页面上的位置（第 3 张表）
POS_CUTS = (0.1, 0.3, 0.5)          # 报前 10%、30%、50% 里各有几句
BLOCK_ZH = {"heading": "标题", "paragraph": "段落", "list": "列表项", "table": "表格", "faq": "FAQ 或折叠段", "other": "其他"}
WHY_ZH = {"fetch": "页面打不开", "outside": "只在导航、页脚、标题或描述里，不在正文", "missing": "页面上找不到（页面改过，或这段是浏览器里才加载的）"}
WHY_SHORT = {"fetch": "打不开", "outside": "不在正文", "missing": "找不到"}


def words(text: str) -> set[str]:
    return {w for w in TOKEN.findall(str(text).lower()) if w not in STOP}


def singular(w: str) -> str:
    return w[:-1] if len(w) > 3 and w.endswith("s") and not w.endswith("ss") else w


def on_page(w: str, page_words: set[str], page_text: str) -> bool:
    """这个词在页面上有没有：原样、单复数、连字符写成空格（non-US / non US）都算有。"""
    if w in page_words or singular(w) in page_words or singular(w) in {singular(x) for x in page_words if x[:2] == w[:2]}:
        return True
    return any(sep in w for sep in "-.") and w.replace("-", " ").replace(".", " ") in page_text


# ───────────── 每道题：公共词、代表搜索词 ─────────────

def per_question(answers: list[dict]) -> dict[str, list[dict]]:
    out = defaultdict(list)
    for a in answers:
        if a.get("fan_out"):
            out[a["question_id"]].append(a)
    return out


def core_words(answers: list[dict]) -> list[tuple[str, int]]:
    """[(词, 几个回答用过)]：至少 MIN_ANSWERS 个回答都用过的英文词；只有一个回答搜了，就用它的词（标为不稳）。"""
    c = Counter()
    for a in answers:
        c.update(set().union(*(words(q) for q in a["fan_out"] if not CJK.search(str(q)))) if a["fan_out"] else set())
    need = min(MIN_ANSWERS, len(answers)) or 1
    return sorted(((w, n) for w, n in c.items() if n >= need), key=lambda x: (-x[1], x[0]))


def representative(answers: list[dict], core: set[str]) -> str:
    """覆盖公共词最多的那条真实搜索词；一样多取短的。"""
    searches = {fo.norm(q) for a in answers for q in a["fan_out"] if fo.norm(q) and not CJK.search(str(q))}
    return max(sorted(searches), key=lambda q: (len(words(q) & core), -len(q)), default="")


def classes_used(answers: list[dict]) -> list[str]:
    qs = [str(q) for a in answers for q in a["fan_out"] if not CJK.search(str(q))]
    return [k for k, rx in CLASSES.items() if qs and sum(bool(rx.search(q)) for q in qs) / len(qs) >= CLASS_SHARE]


# ───────────── 页面 ─────────────

_HTML: dict[str, str | None] = {}


def fetch_html(url: str) -> str | None:
    """页面的 HTML，取不到返回 None。同一个网址只取一次（第 1 张表和第 3 张表都要用）。"""
    if url not in _HTML:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as res:
                _HTML[url] = res.read(3_000_000).decode("utf-8", "ignore")
        except Exception:
            _HTML[url] = None
    return _HTML[url]


def fetch_page(url: str) -> str | None:
    """页面正文（小写）：去掉脚本、样式，留标题和 meta description。取不到返回 None。"""
    body = fetch_html(url)
    if body is None:
        return None
    meta = " ".join(re.findall(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', body, re.I))
    body = re.sub(r"(?is)<(script|style|noscript|svg)\b.*?</\1>", " ", body)
    return " ".join(html.unescape(meta + " " + re.sub(r"(?s)<[^>]+>", " ", body)).lower().split())


def norm_url(u: str) -> str:
    return u.split("#")[0].split("?")[0].rstrip("/")


def load_demand(path: Path = DEMAND) -> dict[str, dict]:
    if not path.exists():
        return {}
    return {norm_url(k): v for k, v in json.loads(path.read_text(encoding="utf-8")).get("pages", {}).items()}


# ───────────── AI 引用本站时指向的原句 ─────────────

def text_directive(url: str) -> tuple[str, str] | None:
    """网址里的 #:~:text=（Gemini App 的引用链接几乎都带）→ (开头, 结尾)；没有原句返回 None。
    格式是 [前文-,]开头[,结尾][,-后文]，句子里的逗号和连字符被编码成 %2C、%2D，所以先按逗号切、再解码。"""
    if ":~:" not in url:
        return None
    for part in url.split(":~:", 1)[1].split("&"):
        if not part.startswith("text="):
            continue
        bits = [b for b in part[len("text="):].split(",") if b and not b.endswith("-") and not b.startswith("-")]
        bits = [" ".join(urllib.parse.unquote(b).split()) for b in bits]
        if bits and bits[0]:
            return bits[0], (bits[1] if len(bits) > 1 else "")
    return None


def own_host(url: str) -> bool:
    host = (urllib.parse.urlsplit(url).hostname or "").lower().removeprefix("www.")
    return host in {pr.OWN, *pr.OWN_ALIASES}


def quotes(answers: list[dict]) -> tuple[dict, list[dict]]:
    """每家引擎：引用链接几条、带原句几条、带 utm_source 几条，其中本站几条；本站被引的原句按（页面, 句子）合并。
    只读面板回答的 cited，不另花钱。"""
    engines = defaultdict(Counter)
    found = {}
    for a in answers:
        e = a.get("engine") or "?"
        for c in a.get("cited") or []:
            url = c.get("url") or ""
            if not url:
                continue
            tx, own = text_directive(url), own_host(url)
            engines[e].update(links=1, with_text=bool(tx), with_utm="utm_source=" in url, own=own, own_with_text=own and bool(tx))
            if own and tx:
                path = urllib.parse.urlsplit(url).path.rstrip("/") or "/"
                row = found.setdefault((path, tx), {"path": path, "start": tx[0], "end": tx[1], "times": 0,
                                                     "engines": set(), "questions": set()})
                row["times"] += 1
                row["engines"].add(e)
                if a.get("question_id"):
                    row["questions"].add(a["question_id"])
    stats = {e: {k: c[k] for k in ("links", "with_text", "with_utm", "own", "own_with_text")} for e, c in sorted(engines.items())}
    rows = sorted(found.values(), key=lambda r: (-r["times"], -len(r["questions"]), r["path"], r["start"]))
    return stats, rows


# ───────────── 被引的原句在页面上的位置 ─────────────

SKIP_TAGS = {"script", "style", "noscript", "svg", "template", "iframe", "object", "head"}
CHROME_TAGS = {"nav", "footer", "form", "button", "select", "textarea", "dialog", "aside"}   # 不算正文：导航、页脚、表单、按钮、侧栏
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
BLOCK_TAGS = {"address", "article", "aside", "blockquote", "br", "caption", "dd", "details", "dialog", "div", "dl", "dt", "figcaption",
              "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "pre",
              "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"}
SHOWN_AT = re.compile(r"^(?:sm|md|lg|xl|2xl):(?:block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|contents|flow-root)$")
FAQ_HEAD = re.compile(r"^\s*(?:faq|frequently asked questions|常见问题|常见问答)", re.I)


def _hidden(attrs: list[tuple[str, str | None]]) -> bool:
    """看不见的元素：hidden 属性、sr-only，或 Tailwind 的 hidden 而没有 sm:block 这种在大屏上显示的类。"""
    a = dict(attrs)
    if "hidden" in a:
        return True
    cls = (a.get("class") or "").split()
    return "sr-only" in cls or ("hidden" in cls and not any(SHOWN_AT.match(c) for c in cls))


class _PageText(HTMLParser):
    """把页面拆成正文（<main> 里看得见的字，去掉导航、页脚、表单、按钮）和全文（导航、页脚、标题也算），
    正文每段字记下它在哪种块里。没有 <main> 的页面，正文就是 <body> 去掉导航、页脚这些。"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, bool, bool]] = []      # (标签, 看不见, 不算正文)
        self.main_open = 0
        self.saw_main = False
        self.chunks: list[tuple[str, str, bool, bool]] = []   # (字, 块类型, 在 <main> 里, 不算正文)
        self.extra: list[str] = []                      # 标题、meta description：只进全文
        self.faq_level = 0                              # 在「FAQ / 常见问题」标题下面：标题级别，0 = 不在
        self.head: tuple[int, list[str]] | None = None  # 正在读的标题：(级别, 字)

    def handle_starttag(self, tag, attrs):
        if tag in BLOCK_TAGS:
            self.chunks.append((" ", "", True, True))   # 块之间隔一个空格
        if tag == "meta" and (dict(attrs).get("name") or "").lower() == "description":
            self.extra.append(dict(attrs).get("content") or "")
        if tag in VOID_TAGS:
            return
        if re.fullmatch(r"h[1-6]", tag):
            level = int(tag[1])
            if self.faq_level and level <= self.faq_level:
                self.faq_level = 0
            self.head = (level, [])
        self.stack.append((tag, tag in SKIP_TAGS or _hidden(attrs), tag in CHROME_TAGS))
        if tag == "main":
            self.main_open += 1
            self.saw_main = True

    def handle_startendtag(self, tag, attrs):
        if tag in BLOCK_TAGS:
            self.chunks.append((" ", "", True, True))
        if tag == "meta" and (dict(attrs).get("name") or "").lower() == "description":
            self.extra.append(dict(attrs).get("content") or "")

    def handle_endtag(self, tag):
        if tag in BLOCK_TAGS:
            self.chunks.append((" ", "", True, True))
        if tag in VOID_TAGS or all(t != tag for t, _, _ in self.stack):
            return
        while self.stack:
            t, _, _ = self.stack.pop()
            if t == "main":
                self.main_open -= 1
            if re.fullmatch(r"h[1-6]", t) and self.head:
                level, said = self.head
                if FAQ_HEAD.match("".join(said)):
                    self.faq_level = level
                self.head = None
            if t == tag:
                break

    def _kind(self) -> str:
        tags = [t for t, _, _ in self.stack]
        if "details" in tags or "summary" in tags or self.faq_level:
            return "faq"
        if any(t in ("table", "td", "th", "caption") for t in tags):
            return "table"
        for t in reversed(tags):
            if re.fullmatch(r"h[1-6]", t):
                return "heading"
            if t == "li":
                return "list"
            if t in ("p", "blockquote", "dd", "dt", "figcaption"):
                return "paragraph"
        return "other"

    def handle_data(self, data):
        if self.stack and self.stack[-1][0] == "title":
            self.extra.append(data)
        if any(hide for _, hide, _ in self.stack):
            return
        if self.head:
            self.head[1].append(data)
        self.chunks.append((data, self._kind(), self.main_open > 0, any(c for _, _, c in self.stack)))


def _join(chunks: list[tuple[str, str]]) -> tuple[str, list[tuple[int, int, str]]]:
    """(字, 块类型) 拼成一段：空白合并成一个空格，NFKC 统一全角半角；记下每段字的 (起点, 终点, 块类型)。"""
    out, spans = "", []
    for data, kind in chunks:
        s = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", data))
        if out.endswith(" ") or not out:
            s = s.lstrip(" ")
        if not s:
            continue
        if kind:
            spans.append((len(out), len(out) + len(s), kind))
        out += s
    return out.rstrip(" "), spans


def page_text(body: str) -> tuple[str, list[tuple[int, int, str]], str]:
    """HTML → (正文, 正文里每段字的块类型, 全文)。"""
    p = _PageText()
    p.feed(body)
    p.close()
    main = [(d, k) for d, k, in_main, chrome in p.chunks if (in_main or not p.saw_main) and not (chrome and k)]
    text, spans = _join(main)
    full, _ = _join([(d, "") for d, _, _, _ in p.chunks] + [(" " + x, "") for x in p.extra])
    return text, spans, full


def skeleton(s: str) -> tuple[str, list[int]]:
    """只留字母和数字（中文也算），都转小写，记下每个字在原文里的位置：空格、标点、符号、表情都不比。
    Gemini 的原句常把两段拼成「标题. 正文」、把相邻的两个标签（分类和日期）粘在一起，这样都对得上。"""
    keep, where = [], []
    for i, ch in enumerate(unicodedata.normalize("NFKC", s)):
        if ch.isalnum():
            for c in ch.lower():
                keep.append(c)
                where.append(i)
    return "".join(keep), where


def locate(text: str, start: str, end: str = "") -> tuple[int, bool] | None:
    """原句开头在 text 里的位置（text 的字数下标），和结尾在它后面对没对上；找不到开头是 None。
    开头出现好几次时取第一处，和浏览器高亮 textStart,textEnd 一样（结尾只在开头后面找，所以挑不出更后面的那处）。
    结尾对不上的（页面改过，或 AI 把后面一段拼了进来）照样按开头算位置。"""
    sk, where = skeleton(text)
    a, b = skeleton(start)[0], skeleton(end)[0] if end else ""
    i = sk.find(a) if a else -1
    if i < 0:
        return None
    return where[i], bool(b) and sk.find(b, i + len(a)) >= 0


def block_at(spans: list[tuple[int, int, str]], off: int) -> str:
    for s, e, kind in spans:
        if s <= off < e:
            return kind
    return "other"


def place_quotes(rows: list[dict], get=None) -> dict:
    """第 3 张表的每句原句在本站线上页面正文里的位置：给每行加上 pos（0–1）、block（块类型）、end_ok（结尾对上没有）；
    找不到的加 why（fetch 页面打不开、outside 只在导航页脚标题里、missing 页面上没有）。同一页只取一次。返回只有数的汇总。"""
    get = get or fetch_html
    pages: dict[str, tuple | None] = {}
    for r in rows:
        url = f"https://{pr.OWN}{r['path']}"
        if url not in pages:
            body = get(url)
            pages[url] = None if body is None else page_text(body)
        r.update(pos=None, block=None, end_ok=None, why=None)
        if pages[url] is None:
            r["why"] = "fetch"
            continue
        main, spans, full = pages[url]
        got = locate(main, r["start"], r["end"])
        if got is None:
            r["why"] = "outside" if locate(full, r["start"], r["end"]) else "missing"
            continue
        r.update(pos=got[0] / len(main), block=block_at(spans, got[0]), end_ok=got[1])
    return position_stats(rows)


def page_boot(per_page: dict[str, list[float]], stat) -> list[float] | None:
    """按页面重抽的 95% 区间：页面有放回地重抽 BOOT 次（随机种子固定），同一页的几句一起进出。
    同一页的几句不独立（11-21 的 20 句里 9 句来自同一页），有效样本更接近页面数。不到 2 页给不出区间。"""
    keys = sorted(per_page)
    if len(keys) < 2:
        return None
    rnd, est = random.Random(pr.SEED), []
    for _ in range(pr.BOOT):
        est.append(stat([p for k in rnd.choices(keys, k=len(keys)) for p in per_page[k]]))
    est.sort()
    return [round(est[math.ceil(0.025 * pr.BOOT) - 1], 4), round(est[math.ceil(0.975 * pr.BOOT) - 1], 4)]


def position_stats(rows: list[dict]) -> dict:
    """只有数：几句、找到几句、几个页面，前 10%、30%、50% 里各有几句和区间，中位位置和区间，找不到的按原因，块类型。"""
    found = [r for r in rows if r.get("pos") is not None]
    per_page: dict[str, list[float]] = defaultdict(list)
    for r in found:
        per_page[r["path"]].append(r["pos"])
    out = {"sentences": len(rows), "located": len(found), "pages": len(per_page),
           "engines": sorted({e for r in rows for e in r.get("engines", ())}),
           "not_located": dict(sorted(Counter(r["why"] for r in rows if r.get("why")).items())),
           "blocks": dict(sorted(Counter(r["block"] for r in found).items())),
           "end_matched": sum(1 for r in found if r.get("end_ok")), "end_given": sum(1 for r in found if r.get("end"))}
    if found:
        pos = [r["pos"] for r in found]
        out["median"] = round(statistics.median(pos), 4)
        out["median_ci"] = page_boot(per_page, statistics.median)
        for cut in POS_CUTS:
            key = f"first_{round(cut * 100)}pct"
            out[key] = sum(p < cut for p in pos)
            out[key + "_ci"] = page_boot(per_page, lambda ps, cut=cut: sum(p < cut for p in ps) / len(ps))
    return out


def position_lines(w: dict) -> list[str]:
    """邮件里「原句在页面上的位置」一段（只有数，句子在上面的表里）。"""
    n, k = w["located"], w["sentences"]
    out = ["", "**原句在页面上的位置**（检验「AI 只读页面前半截」）：正文 = 线上页面 `<main>` 里看得见的字，去掉导航、页脚、表单、按钮；"
           "位置 = 句子开头前的字数 ÷ 正文总字数。只比字母和数字，空格、标点不管；原句是「开头,结尾」的，按开头找"
           "（出现几次取第一处，和浏览器高亮一样），结尾只用来核对。", ""]
    if not k:
        return out + ["这次没有本站被引的原句。"]
    ci = lambda v: f"，区间 {math.floor(v[0] * 100 + 1e-9)}–{math.ceil(v[1] * 100 - 1e-9)}%" if v else ""    # 向外取整，不比算出来的窄
    line = f"{k} 句里在页面正文找到 {n} 句（{w['pages']} 个页面）。"
    if n:
        line += "；".join(f"前 {round(c * 100)}%：{w[f'first_{round(c * 100)}pct']}/{n}"
                         f"（{round(100 * w[f'first_{round(c * 100)}pct'] / n)}%{ci(w[f'first_{round(c * 100)}pct_ci'])}）" for c in POS_CUTS)
        line += f"；中位位置 {round(w['median'] * 100)}%{('（' + ci(w['median_ci']).lstrip('，') + '）') if w['median_ci'] else ''}。"
    out.append(line)
    if n:
        out += ["", f"区间按页面重抽 {pr.BOOT:,} 次（同一页的几句一起进出，随机种子固定）：同一页的几句不独立，有效样本更接近页面数；"
                "页面少时区间偏窄，只当参考" + ("，这次不到 2 个页面，给不出区间" if not w["median_ci"] else "") + "。"
                "在哪种块：" + "、".join(f"{BLOCK_ZH.get(b, b)} {c}" for b, c in sorted(w["blocks"].items(), key=lambda x: -x[1])) + "。"]
    if w["not_located"]:
        out += ["", f"找不到的 {k - n} 句：" + "；".join(f"{WHY_ZH.get(y, y)}{'' if WHY_ZH.get(y, y).endswith('）') else ' '}{c} 句"
                                                      for y, c in w["not_located"].items()) + "。"]
    who = "、".join(pr.LABEL.get(e, e) for e in w["engines"]) or "–"
    out += ["", f"样本小，而且只来自引用链接带原句的那几家（这次是 {who}）。量的是 AI 拿来当证据的句子在页面哪里，不等于 AI 读到了哪里；"
            "页面是跑这一步那天线上的版本，和 AI 读的那一版可能不同。"]
    return out


def clip(s: str, n: int) -> str:
    return s if len(s) <= n else s[:n - 1].rstrip() + "…"


def quote_section(stats: dict, rows: list[dict], where: dict | None = None) -> list[str]:
    """where 是 place_quotes 的汇总：给了就在原句表里加「在页面哪里」「什么块」两列，表下面加位置的统计。"""
    out = ["", "### 3 AI 引用本站时指向哪句话", "",
           "引用链接里的 #:~:text= 就是 AI 拿来当证据的那句原文：点进来的访客会看到这句被高亮。"
           "这里是面板里的那一半；真实访客点进来的那一半在 GA4 的 text_fragment 事件里。", ""]
    if not stats:
        return out + ["这次没有面板回答（--full 没给或是空的）。"]
    share = lambda a, b: f"{a}/{b}（{round(100 * a / b)}%）" if b else "0"
    out += ["| 引擎 | 引用链接 | 带原句 | 带 utm_source | 其中本站 | 本站带原句 |", "|---|---|---|---|---|---|"]
    out += [f"| {e} | {s['links']} | {share(s['with_text'], s['links'])} | {share(s['with_utm'], s['links'])} | {s['own']} | "
            f"{s['own_with_text']} |" for e, s in stats.items()]
    if not rows:
        return out + ["", "本站被引的链接里没有带原句的。"]
    placed = where is not None
    out += ["", "| 页面 | 原句（开头 … 结尾） | 次数 | 引擎 | 题 |" + (" 在页面哪里 | 什么块 |" if placed else ""),
            "|---|---|---|---|---|" + ("---|---|" if placed else "")]
    for r in rows[:SHOWN_QUOTES]:
        said = clip(r["start"], 70) + (f" … {clip(r['end'], 40)}" if r["end"] else "")
        said = said.replace("|", "\\|")
        cells = (f" {round(r['pos'] * 100)}% | {BLOCK_ZH.get(r['block'], r['block'])} |" if r.get("pos") is not None
                 else f" {WHY_SHORT.get(r.get('why'), '–')} | – |") if placed else ""
        out.append(f"| {r['path']} | {said} | {r['times']} | {'、'.join(sorted(r['engines']))} | "
                   f"{'、'.join(sorted(r['questions'])[:4])}{' 等' if len(r['questions']) > 4 else ''} |" + cells)
    if len(rows) > SHOWN_QUOTES:
        out.append(f"\n另有 {len(rows) - SHOWN_QUOTES} 句只列计数。")
    return out + (position_lines(where) if placed else [])


# ───────────── 外部网站 ─────────────

def site_labels(site: str) -> list[str]:
    """域名里除了后缀的几段：google.co.uk → [google]，deepmind.google → [deepmind, google]。"""
    parts = site.lower().split(".")
    if len(parts) >= 3 and parts[-2] in {"co", "com", "org", "net", "ac", "gov", "edu"} and len(parts[-1]) == 2:
        parts = parts[:-2]
    elif len(parts) >= 2:
        parts = parts[:-1] if len(parts[-1]) <= 3 or parts[-1] in {"google"} else parts
    return [p for p in parts if p not in {"www", "m", "en", "docs", "help", "support"}]


def site_kind(site: str, question_texts: list[str]) -> str:
    if site in PLATFORMS or any(site.endswith("." + p) for p in PLATFORMS):
        return "平台（可以自己发）"
    joined = " ".join(t.lower().replace(" ", "") for t in question_texts)
    if re.search(r"\.(gov|edu)(\.[a-z]{2})?$|\.gov\.uk$|\.ac\.uk$", site) or any(len(lb) >= 4 and lb in joined for lb in site_labels(site)):
        return OFFICIAL
    return "媒体、博客（投稿、请求收录）"


OFFICIAL = "官方（引用它，不能投稿）"


def coverage(fan: dict, placed: dict, q_of: dict, own: str = pr.OWN, shown: int = SHOWN_SITES) -> tuple[list[dict], list[dict]]:
    """(能投放的站, 官方站)，每项 {site, kind, new, questions, searches, examples}。
    能投放的（平台、媒体、博客）用贪心排：每次挑能多盖住最多「我们一条都没排上的题」的站。官方站只能引用、链接，
    不能投稿，单独按出现在几道题排，不参与贪心（不然它们会占掉前几名）。"""
    gapq, dom_q, dom_s = set(), defaultdict(set), Counter()
    for qid, terms in fan.items():
        read = [t for t in terms if placed.get(t, {}).get("read")]
        if not read:
            continue
        if not any(placed[t]["google"] is not None or placed[t]["bing"] is not None for t in read):
            gapq.add(qid)
        for t in read:
            for site in placed[t]["first_page"]:
                if site and site != own and not site.endswith("." + own):
                    dom_q[site].add(qid)
                    dom_s[site] += 1
    kind = {s: site_kind(s, [q_of[q]["question"] for q in qids if q in q_of]) for s, qids in dom_q.items()}
    officials = sorted((s for s in dom_q if kind[s] == OFFICIAL), key=lambda s: (-len(dom_q[s]), -dom_s[s], s))
    official_rows = [{"site": s, "kind": OFFICIAL, "new": 0, "questions": len(dom_q[s]), "searches": dom_s[s],
                      "examples": sorted(dom_q[s])[:3]} for s in officials[:shown]]
    order, covered, pool = [], set(), {s: q for s, q in dom_q.items() if kind[s] != OFFICIAL}
    while pool and len(order) < shown:
        site = max(sorted(pool), key=lambda s: (len((pool[s] & gapq) - covered), len(pool[s]), dom_s[s]))
        new = (pool[site] & gapq) - covered
        order.append({"site": site, "kind": kind[site], "new": len(new), "questions": len(pool[site]),
                      "searches": dom_s[site], "examples": sorted(new or pool[site])[:3]})
        covered |= new
        del pool[site]
    return order, official_rows


# ───────────── 汇总 ─────────────

def rows_for(qs: list[dict], answers: list[dict], placed: dict, demand: dict, pages: dict[str, str | None]) -> list[dict]:
    """每道不带品牌名的题一行。pages：{target_url: 正文或 None}。"""
    by_q = per_question(answers)
    out = []
    for q in qs:
        if q.get("kind") == "brand":
            continue
        ans = by_q.get(q["id"], [])
        core = core_words(ans)
        core_set = {w for w, _ in core}
        rep = representative(ans, core_set) if ans else ""
        p = placed.get(rep, {})
        rep_pos = p.get("google") if p.get("read") else None
        read = [placed[fo.norm(x)] for a in ans for x in a["fan_out"] if placed.get(fo.norm(x), {}).get("read")]
        best = min((r["google"] for r in read if r["google"] is not None), default=None)
        url = norm_url(q.get("target_url", ""))
        text = pages.get(url)
        if text is None:
            missing, miss_cls = None, None
        else:
            pw = words(text)
            year_now = str(datetime.now().year)
            missing = [w for w, _ in core if w not in NOT_ACTIONABLE and not (re.fullmatch(r"20\d\d", w) and w != year_now)
                       and not on_page(w, pw, text)]
            miss_cls = [k for k in classes_used(ans) if not CLASSES[k].search(text)]
        out.append({"question_id": q["id"], "set": q.get("set", ""), "target_url": url,
                    "impressions": (demand.get(url) or {}).get("impressions", 0),
                    "answers": len(ans), "core": core, "representative": rep,
                    "rep_checked": bool(p.get("read")), "rep_google": rep_pos, "best_google": best, "read": len(read),
                    "missing": missing, "missing_classes": miss_cls, "single": len(ans) == 1})
    return out


def pos(p) -> str:
    return "—" if p is None else str(p)


def report(day: str, rows: list[dict], sites: list[dict], ranks_ok: bool, officials: list[dict] | None = None,
           read: tuple[int, int] = (0, 0), quoted: tuple[dict, list[dict]] | None = None, where: dict | None = None) -> str:
    out = [f"## 子查询之后：改哪页、补哪些词、去哪些站（{day}）", "",
           "公共词 = 同一道题至少两个回答都用过的词；整句每次都变，这批词基本不变。页面按 Search Console 近 3 个月的展示次数排，"
           "有人搜的先改。代表搜索词 = 这道题覆盖公共词最多的那条真实搜索词。", ""]
    n_read, n_all = read
    if not ranks_ok:
        out += ["这次没有可用的 Google 排名（子查询没跑，或自检没过），名次一栏是「—」，只看页面缺的词。", ""]
    elif n_all and n_read / n_all < 0.5:
        out += [f"Google 第一页只读到 {n_read}/{n_all} 条搜索：名次和第 2 节只供参考。", ""]
    elif n_all:
        out += [f"Google 第一页读到 {n_read}/{n_all} 条搜索。", ""]
    by_page = defaultdict(list)
    for r in rows:
        if r["answers"]:
            by_page[r["target_url"]].append(r)
    order = sorted(by_page.items(), key=lambda kv: (-max(r["impressions"] for r in kv[1]),
                                                   -sum(len(r["missing"] or []) for r in kv[1]), kv[0]))
    out += ["### 1 先改哪些页、补哪些词", "",
            "缺的词先判断再补：有的是 AI 理解偏了（问 fable 5.5，AI 去搜 Xbox 上的游戏《Fable》），那就该在页面上写清楚"
            "「不是那个」，而不是把词补进去；竞品名是 AI 拿来对比的那一圈，页面上写到它们才进得了对比类的搜索。", "",
            "| 页面 | 近 3 个月展示 | 题 · 代表搜索词（Google 名次） | 页面上没有的公共词 | 缺的类别 |", "|---|---|---|---|---|"]
    for url, rs in order[:SHOWN_PAGES]:
        qcell = "；".join(f"{r['question_id']} · {r['representative'] or '—'}（{pos(r['rep_google'])}）"
                         + ("（只有 1 个回答搜了，词不稳）" if r["single"] else "") for r in rs)
        miss = Counter(w for r in rs for w in (r["missing"] or []))
        mcell = "页面打不开" if all(r["missing"] is None for r in rs) else ("、".join(w for w, _ in miss.most_common(SHOWN_WORDS)) or "都有")
        ccell = "、".join(sorted({c for r in rs for c in (r["missing_classes"] or [])})) or "—"
        out.append(f"| {url.removeprefix('https://')} | {rs[0]['impressions']} | {qcell} | {mcell} | {ccell} |")
    out += ["", "### 2 外部网站：AI 搜这些词时常在 Google 第一页，按能补上几道「我们一条都没排上」的题排", ""]
    if sites:
        out += ["能投放的（平台自己发；媒体、博客投稿或请求收录）：", "",
                "| 网站 | 类型 | 新补上几道题 | 一共出现在几道题 | 几条搜索的第一页 | 例题 |", "|---|---|---|---|---|---|"]
        out += [f"| {s['site']} | {s['kind']} | {s['new']} | {s['questions']} | {s['searches']} | {'、'.join(s['examples'])} |"
                for s in sites]
    elif ranks_ok:
        out.append("第一页上没有能投放的网站（都是官方站或本站）。")
    else:
        out.append("没有：这次没有查到 Google 第一页（子查询没跑或自检没过）。")
    if officials:
        out += ["", "官方站（只能在页面里引用、链接，不能投稿）：" + "、".join(f"{s['site']}（{s['questions']} 题）" for s in officials)]
    if quoted is not None:
        out += quote_section(*quoted, where)
    return "\n".join(out) + "\n"


def public_counts(day: str, rows: list[dict], sites: list[dict], quoted: tuple[dict, list[dict]] | None = None,
                  where: dict | None = None) -> dict:
    """只有计数，不含搜索词、不含别的网站，也不含被引的原句（原句只进邮件）。where（原句在页面上的位置）也只有数。"""
    stats, qrows = quoted or ({}, [])
    out = {"date": day, "questions": len(rows), "with_searches": sum(1 for r in rows if r["answers"]),
           "pages_checked": sum(1 for r in rows if r["missing"] is not None),
           "rows": [{"question_id": r["question_id"], "target_url": r["target_url"], "impressions": r["impressions"],
                     "core_words": len(r["core"]), "missing_words": None if r["missing"] is None else len(r["missing"]),
                     "missing_classes": None if r["missing_classes"] is None else len(r["missing_classes"]),
                     "representative_google": r["rep_google"], "representative_checked": r["rep_checked"],
                     "best_google": r["best_google"]} for r in rows],
           "sites_listed": len(sites), "sites_new_questions": sum(s["new"] for s in sites),
           "citation_markers": stats, "own_quoted_sentences": len(qrows), "own_quoted_pages": len({r["path"] for r in qrows})}
    if where is not None:
        out["quote_positions"] = where              # 2026-11-26 起
    return out


# ───────────── 命令 ─────────────

def cmd_run(a) -> int:
    qs = pr.load_questions(a.sets.split(","))
    if a.limit:
        qs = qs[:a.limit]
    q_of = {q["id"]: q for q in qs}
    answers = []
    if a.full and Path(a.full).exists():
        answers = [x for x in json.loads(Path(a.full).read_text(encoding="utf-8")).get("answers") or [] if x.get("question_id") in q_of]
    quoted = quotes(answers) if a.full and Path(a.full).exists() else None     # 只看面板回答：子查询存档里没有引用链接
    ranks, ranks_ok = {"searches": []}, False
    if a.archive and Path(a.archive).exists():
        arch = json.loads(Path(a.archive).read_text(encoding="utf-8"))
        answers += [x for x in arch.get("gemini_answers") or [] if x.get("question_id") in q_of]
        ranks = arch.get("ranks") or ranks
        ranks_ok = any(fo.readable(r.get("google") or {}) for r in ranks.get("searches") or [])
    placed = fo.placements(ranks)
    targets = sorted({norm_url(q.get("target_url", "")) for q in qs if q.get("target_url") and q.get("kind") != "brand"})
    pages = {u: fetch_page(u) for u in targets}
    rows = rows_for(qs, answers, placed, load_demand(Path(a.demand)), pages)
    fan = {k: v for k, v in fo.by_question(answers).items() if q_of.get(k, {}).get("kind") != "brand"}
    sites, officials = coverage(fan, placed, q_of) if ranks_ok else ([], [])
    all_terms = {t for per in fan.values() for t in per}
    read = (sum(1 for t in all_terms if placed.get(t, {}).get("read")), len(all_terms))
    day = a.date or datetime.now(pr.CST).strftime("%Y-%m-%d")
    try:
        where = place_quotes(quoted[1]) if quoted else None  # 原句在页面上的位置：取本站线上页面，不花钱
    except Exception as e:                                   # 量位置出错不挡前面几张表；日志只打错误类型，不打原句
        print(f"原句在页面上的位置没量成：{type(e).__name__}", file=sys.stderr)
        where = None
    text = report(day, rows, sites, ranks_ok, officials, read, quoted, where)
    counts = public_counts(day, rows, sites, quoted, where)
    if not a.dry:
        if a.appendix:
            Path(a.appendix).write_text(text, encoding="utf-8")
        if a.public:
            Path(a.public).parent.mkdir(parents=True, exist_ok=True)
            Path(a.public).write_text(json.dumps(counts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    # 标准输出只打计数
    miss = [r for r in rows if r["missing"]]
    print(f"行动清单：{counts['with_searches']}/{counts['questions']} 道不带品牌名的题有搜索词；页面取到 {counts['pages_checked']} 个题的页面，"
          f"{len(miss)} 道题的页面缺公共词；排名{'可用' if ranks_ok else '不可用'}，外部网站列了 {len(sites)} 个；"
          f"本站被引的原句 {counts['own_quoted_sentences']} 句"
          + (f"，在页面正文里找到 {where['located']} 句" + (f"、中位位置 {round(where['median'] * 100)}%" if where.get("median") is not None else "")
             if where else "")
          + ("（--dry：什么都没写）" if a.dry else ""))
    return 0


def cmd_demand(a) -> int:
    """Search Console 页面导出（openseo get_search_console_performance，dimensions=["page"]）→ demand.json。"""
    src = json.loads(Path(a.export).read_text(encoding="utf-8"))
    pages = {norm_url(r["keys"][0]): {"impressions": r.get("impressions", 0), "clicks": r.get("clicks", 0),
                                      "position": round(r.get("position", 0), 1)}
             for r in src.get("rows") or [] if r.get("impressions", 0) >= a.min_impressions}
    out = {"_说明": "Search Console 各页面的展示和点击，fanout_actions.py 用它决定先改哪页。每月更新一次：导出页面维度、跑 demand 命令。",
           "source": f"Search Console {src.get('siteUrl', '')}, {src.get('startDate')} 至 {src.get('endDate')}，网页搜索，展示 ≥ {a.min_impressions}",
           "pages": dict(sorted(pages.items(), key=lambda kv: -kv[1]["impressions"]))}
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"demand.json：{len(pages)} 个页面（{out['source']}）")
    return 0


def selftest() -> int:
    qs = [{"id": "q1", "set": "real", "kind": "assistant", "question": "Can non-US residents open a Mercury account?",
           "target_url": "https://jasonzhu.ai/en/x"},
          {"id": "q2", "set": "real", "kind": "assistant", "question": "Stripe in China?", "target_url": "https://jasonzhu.ai/en/y"},
          {"id": "qb", "set": "frozen", "kind": "brand", "question": "who is jason", "target_url": "https://jasonzhu.ai/en"}]
    answers = [
        {"question_id": "q1", "engine": "chatgpt", "sample": 0, "fan_out": ["Mercury bank account non-US residents LLC required documents official 2026"]},
        {"question_id": "q1", "engine": "chatgpt", "sample": 1, "fan_out": ["Mercury non-US residents LLC eligibility documents 2026", "site:mercury.com help"]},
        {"question_id": "q1", "engine": "chatgpt", "sample": 2, "fan_out": ["Mercury LLC non-US founders requirements"]},
        {"question_id": "q2", "engine": "chatgpt", "sample": 0, "fan_out": ["Stripe supported countries China mainland"]},
        {"question_id": "qb", "engine": "chatgpt", "sample": 0, "fan_out": ["site:jasonzhu.ai"]},
    ]
    core = dict(core_words([a for a in answers if a["question_id"] == "q1"]))
    assert core["mercury"] == 3 and core["llc"] == 3 and core["non-us"] == 3 and core["documents"] == 2 and "eligibility" not in core, core
    rep = representative([a for a in answers if a["question_id"] == "q1"], set(core))
    assert rep == fo.norm("Mercury non-US residents LLC eligibility documents 2026"), rep     # 两条都盖住 6 个公共词，取短的
    assert on_page("non-us", {"non", "us"}, "for non us residents") and on_page("documents", {"document"}, "document")
    seen = lambda you, fp: {"you": you, "your_page": "", "first_page": list(fp)}
    ranks = {"searches": [
        {"query": fo.norm("Mercury bank account non-US residents LLC required documents official 2026"), "google": seen(None, ["mercury.com", "reddit.com", "doola.com"])},
        {"query": fo.norm("Mercury non-US residents LLC eligibility documents 2026"), "google": seen(None, ["doola.com", "mercury.com"])},
        {"query": fo.norm("Stripe supported countries China mainland"), "google": seen(7, ["stripe.com", "reddit.com"])},
    ]}
    placed = fo.placements(ranks)
    pages = {"https://jasonzhu.ai/en/x": "mercury bank account for an llc. fees and pricing.", "https://jasonzhu.ai/en/y": None}
    rows = {r["question_id"]: r for r in rows_for(qs, answers, placed, {"https://jasonzhu.ai/en/x": {"impressions": 50}}, pages)}
    assert "qb" not in rows and rows["q1"]["impressions"] == 50 and rows["q1"]["rep_google"] is None and rows["q1"]["rep_checked"]
    assert rows["q1"]["missing"][:3] == ["non-us", "documents", "residents"] or set(rows["q1"]["missing"]) >= {"non-us", "documents", "2026"}, rows["q1"]["missing"]
    assert "official" not in rows["q1"]["missing"] and "mercury" not in rows["q1"]["missing"]
    assert "年份" in rows["q1"]["missing_classes"] and "适用对象（地区、身份）" in rows["q1"]["missing_classes"], rows["q1"]["missing_classes"]
    assert rows["q2"]["missing"] is None and rows["q2"]["best_google"] == 7
    fan = {k: v for k, v in fo.by_question(answers).items() if k != "qb"}
    sites, officials = coverage(fan, placed, {q["id"]: q for q in qs})
    # q1 我们一条没排上，q2 排上了：reddit 两题都在、补上 q1，排第一；doola 只在 q1，已被补上，新补 0；官方站不进贪心
    assert [(s["site"], s["new"]) for s in sites] == [("reddit.com", 1), ("doola.com", 0)], sites
    assert sites[0]["kind"] == "平台（可以自己发）" and sites[1]["kind"] == "媒体、博客（投稿、请求收录）"
    assert [s["site"] for s in officials] == ["mercury.com", "stripe.com"] and officials[0]["kind"] == OFFICIAL, officials
    text = report("2026-11-30", list(rows.values()), sites, True, officials)
    assert "jasonzhu.ai/en/x | 50 |" in text and "页面打不开" in text and "doola.com" in text and "mercury.com（1 题）" in text
    pub = json.dumps(public_counts("2026-11-30", list(rows.values()), sites), ensure_ascii=False)
    assert "mercury" not in pub.lower() and "doola" not in pub and "reddit" not in pub, pub     # 公开计数里不能有搜索词和别的网站
    assert "页面打不开" not in report("d", [], [], False) and "测不出来" not in pub
    assert "只供参考" in report("d", [], [], True, [], (9, 454)) and "只供参考" not in report("d", [], [], True, [], (400, 454))
    assert site_kind("google.co.uk", ["How does Google rank?"]) == OFFICIAL and site_labels("deepmind.google") == ["deepmind"]
    assert site_kind("google.com.hk", ["What about Stripe?"]) == "媒体、博客（投稿、请求收录）"
    # 第 3 张表：被引的原句（11-23 面板里 Gemini App 的真实链接格式：开头,结尾；逗号编码成 %2C）
    assert text_directive("https://jasonzhu.ai/en#:~:text=JasonZhu.AI.%20AI%20tool%20reviews%2C%20hands-on,Free.%20Latest") == \
        ("JasonZhu.AI. AI tool reviews, hands-on", "Free. Latest")
    assert text_directive("https://jasonzhu.ai/en/x#top:~:text=pre-,Only%20this,-suf&text=second") == ("Only this", "")
    assert text_directive("https://jasonzhu.ai/en/x?utm_source=chatgpt.com") is None and text_directive("https://x.ai/#:~:text=") is None
    cite = lambda *urls: [{"url": u, "site": (urllib.parse.urlsplit(u).hostname or "").removeprefix("www.")} for u in urls]
    panel = [{"engine": "gemini_app", "question_id": "q1", "cited": cite("https://jasonzhu.ai/en/contact#:~:text=Contact%20Jason%20Zhu.,Open",
                                                                        "https://other.example/a#:~:text=Secret%20other%20sentence")},
             {"engine": "gemini_app", "question_id": "q2", "cited": cite("https://www.jasonzhu.ai/en/contact/#:~:text=Contact%20Jason%20Zhu.,Open")},
             {"engine": "chatgpt", "question_id": "q1", "cited": cite("https://jasonzhu.ai/en/x?utm_source=chatgpt.com", "https://other.example/b?utm_source=chatgpt.com")},
             {"engine": "perplexity", "question_id": "q1", "cited": cite("https://jasonzhu.ai/en/x")}]
    stats, qrows = quotes(panel)
    assert stats["gemini_app"] == {"links": 3, "with_text": 3, "with_utm": 0, "own": 2, "own_with_text": 2}, stats
    assert stats["chatgpt"] == {"links": 2, "with_text": 0, "with_utm": 2, "own": 1, "own_with_text": 0}, stats
    assert len(qrows) == 1 and qrows[0]["path"] == "/en/contact" and qrows[0]["times"] == 2 and qrows[0]["questions"] == {"q1", "q2"}, qrows
    text = report("2026-11-30", [], [], False, [], (0, 0), (stats, qrows))
    assert "### 3 AI 引用本站时指向哪句话" in text and "Contact Jason Zhu. … Open" in text and "3/3（100%）" in text, text
    assert "Secret other sentence" not in text      # 别的网站被引的句子不列
    pub = json.dumps(public_counts("2026-11-30", [], [], (stats, qrows)), ensure_ascii=False)
    assert "Contact Jason" not in pub and "other.example" not in pub and '"own_quoted_sentences": 1' in pub, pub
    assert "### 3" not in report("d", [], [], False) and "没有面板回答" in "\n".join(quote_section({}, []))
    # 原句在页面上的位置：造一页，正文只算 <main> 里看得见的字；导航、页脚、表单、按钮、看不见的、脚本都不算
    demo = """<!doctype html><html><head><title>Site title words</title><meta name="description" content="Meta words only here"/>
<script>var x = "Words inside a script";</script></head><body><div hidden>Body hidden words</div>
<header><nav><a>Blog</a><a>Header nav words</a></nav></header>
<main><article><nav><ol><li>Home</li><li>Crumb words</li></ol></nav>
<header><span>Guides</span><span>2026-01-02</span><h1>Contact the Demo Team</h1></header>
<div class="prose"><p>Write to us about training and workshops; this paragraph takes up some room on the page.</p>
<p class="hidden">Invisible words never shown</p><p class="hidden sm:block">Desktop only words are visible</p>
<ul><li>Pricing: <strong>fees</strong> start at “3.9%” for most sellers.</li><li>Second item in the list.</li></ul>
<table><tr><td>Both platforms handle global sales tax.</td></tr></table>
<p>Repeated sentence here. Ending one.</p><p>Some filler text between the two repeats.</p><p>Repeated sentence here. Ending two.</p>
<h2 id="faq">FAQ</h2><h3>Does it cost anything?</h3><p>No, every lesson in the demo is free.</p>
<details><summary>More questions</summary><p>Answer inside a details block.</p></details></div>
<form><button>Subscribe Free</button><p>Form words not content</p></form>
<h2>Related Posts</h2><p>Last block of the page.</p></article></main>
<footer><p>Footer words only here</p></footer></body></html>"""
    text, spans, full = page_text(demo)
    assert text.startswith("Guides2026-01-02 Contact the Demo Team Write to us about training"), text[:80]
    for gone in ("Header nav words", "Crumb words", "Footer words", "Form words", "Subscribe Free", "Invisible words", "Body hidden",
                 "inside a script", "Site title", "Meta words"):
        assert gone not in text, gone
    assert "Desktop only words are visible" in text and text.endswith("Last block of the page.")
    assert all(x in full for x in ("Header nav words", "Footer words", "Site title words", "Meta words only here"))
    assert "Invisible words" not in full and "inside a script" not in full
    at = lambda s, e="": (lambda got: (round(got[0] / len(text), 3), block_at(spans, got[0]), got[1]) if got else None)(locate(text, s, e))
    head, para = at("Contact the Demo Team. Write to us about", "this paragraph takes up"), at("Guides2026-01-02.")
    assert head[1:] == ("heading", True) and para[1] == "other" and para[0] == 0.0, (head, para)   # 两段拼成一句、标签粘在一起都认得出
    assert at('* Pricing: fees start at "3.9%" for')[1] == "list"                              # 直引号、弯引号、列表符号都不管
    assert at("Both platforms handle global")[1] == "table"
    one, gap = at("Repeated sentence here.", "Ending two."), at("Repeated sentence here. Ending one.")
    assert one[0] == gap[0] and one[2] is True                                                    # 开头出现两次取第一处，结尾在后面能找到
    assert at("Repeated sentence here.", "Not on the page")[2] is False                           # 结尾对不上，照样按开头算
    assert at("Does it cost anything? No, every lesson")[1] == "faq" and at("Answer inside a details block.")[1] == "faq"
    last = at("Last block of the page.")
    assert last[1] == "paragraph" and last[0] > 0.9                                               # 「FAQ」下面一个同级标题就结束了
    assert head[0] < at("Pricing: fees")[0] < at("Both platforms")[0] < at("Does it cost")[0] < last[0]
    assert locate(text, "Footer words only here") is None and locate(full, "Footer words only here") is not None
    # 每句的位置、找不到的原因、汇总：两页，另一页打不开
    other_page = "<html><body><main><h1>Second page</h1><p>Alpha line near the top.</p>" + "<p>filler words here.</p>" * 30 + \
                 "<p>Omega line at the bottom.</p></main></body></html>"
    pages_ = {f"https://{pr.OWN}/en/demo": demo, f"https://{pr.OWN}/en/second": other_page}
    q = lambda path, start, end="": {"path": path, "start": start, "end": end, "times": 1, "engines": {"gemini_app"}, "questions": {"q1"}}
    qrows = [q("/en/demo", "Contact the Demo Team. Write to us about", "takes up some room"), q("/en/demo", "Pricing: fees start at"),
             q("/en/demo", "Last block of the page."), q("/en/demo", "Footer words only here"), q("/en/demo", "Never written anywhere"),
             q("/en/second", "Alpha line near the top."), q("/en/second", "Omega line at the bottom."), q("/en/gone", "Whatever")]
    where = place_quotes(qrows, pages_.get)
    assert [r["why"] for r in qrows] == [None, None, None, "outside", "missing", None, None, "fetch"], [r["why"] for r in qrows]
    assert qrows[0]["block"] == "heading" and qrows[0]["end_ok"] is True and qrows[6]["pos"] > 0.9
    assert (where["sentences"], where["located"], where["pages"]) == (8, 5, 2) and where["engines"] == ["gemini_app"]
    assert where["not_located"] == {"fetch": 1, "missing": 1, "outside": 1} and where["end_matched"] == 1 and where["end_given"] == 1
    pos = sorted(r["pos"] for r in qrows if r["pos"] is not None)
    assert where["median"] == round(pos[2], 4) and where["first_10pct"] == sum(p < 0.1 for p in pos)
    assert where["first_50pct"] == sum(p < 0.5 for p in pos) and where["first_50pct"] < where["located"]
    lo, hi = where["median_ci"]
    assert lo <= where["median"] <= hi and where == place_quotes([dict(r) for r in qrows], pages_.get)   # 区间重算不变
    assert page_boot({"/a": [0.1, 0.2]}, statistics.median) is None                                # 只有一页，给不出区间
    text3 = report("2026-11-30", [], [], False, [], (0, 0), ({"gemini_app": {"links": 8, "with_text": 8, "with_utm": 0, "own": 8,
                                                                               "own_with_text": 8}}, qrows), where)
    assert "| 在页面哪里 | 什么块 |" in text3 and re.search(r"\| \d+% \| 标题 \|", text3) and "| 不在正文 | – |" in text3 and "| 打不开 | – |" in text3, text3
    assert "8 句里在页面正文找到 5 句（2 个页面）。前 10%：" in text3 and "中位位置" in text3 and "区间按页面重抽 2,000 次" in text3, text3
    assert "找不到的 3 句：页面打不开 1 句；页面上找不到" in text3 and "这次是 Gemini App" in text3, text3
    pub = json.dumps(public_counts("2026-11-30", [], [], ({}, qrows), where), ensure_ascii=False)
    assert '"quote_positions"' in pub and '"located": 5' in pub and "Demo Team" not in pub and "Alpha line" not in pub, pub
    assert "quote_positions" not in public_counts("d", [], [], ({}, qrows))                       # 没量位置就不写这一项
    print("selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    r = sub.add_parser("run", help="出行动清单")
    r.add_argument("--sets", default="frozen,real")
    r.add_argument("--full", help="panel_run.py --full 的完整结果")
    r.add_argument("--archive", help="fanout.py --archive 的完整结果（排名、Gemini 搜索词）")
    r.add_argument("--demand", default=str(DEMAND))
    r.add_argument("--date", default="")
    r.add_argument("--limit", type=int, default=0)
    r.add_argument("--public", help="只含计数的文件，进仓库")
    r.add_argument("--appendix", help="邮件附录（含搜索词和别的网站），不进仓库")
    r.add_argument("--dry", action="store_true")
    d = sub.add_parser("demand", help="用 Search Console 页面导出更新 demand.json")
    d.add_argument("export")
    d.add_argument("--out", default=str(DEMAND))
    d.add_argument("--min-impressions", type=int, default=5)
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    if a.cmd == "run":
        return cmd_run(a)
    if a.cmd == "demand":
        return cmd_demand(a)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
