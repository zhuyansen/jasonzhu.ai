"""out/*.json → Markdown 日报（stdout）。第一屏回答：昨天怎么样、哪里坏了、该做什么。"""
from datetime import datetime, timedelta

from common import CST, load, today_cst

AI_REFERRERS = ("chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "claude.ai", "doubao.com", "kimi.com",
                "kimi.moonshot.cn", "deepseek.com", "chat.deepseek.com", "copilot.microsoft.com", "yuanbao.tencent.com",
                "metaso.cn", "grok.com", "you.com", "phind.com", "poe.com")
CONVERSIONS = {"newsletter_subscribe": "邮件订阅", "club_apply_submit": "GoSail Club 申请", "checkout_order_created": "创建支付订单",
               "prompt_copy": "复制提示词", "prompt_try_claude": "在 Claude 里试试"}            # 和 src/lib/track.ts 的 TrackEvent 对应
DIM_KEYS = {"timestamp", "requestPath", "referrerHostname", "country", "deviceType", "osName", "browserName", "route", "environment",
            "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm", "projectId", "projectName", "requestHostname", "visitorId", "flags"}

lines, alerts = [], []


def w(s=""):
    lines.append(s)


def n(row):
    """Vercel 聚合行带 pageviews 和 visitors，默认取浏览量；字段名变了就退回第一个非维度的数值字段。"""
    if isinstance(row.get("pageviews"), (int, float)):
        return row["pageviews"]
    for k, v in row.items():
        if k not in DIM_KEYS and isinstance(v, (int, float)):
            return v
    return 0


def fmt(x):
    return f"{x:,.0f}" if isinstance(x, (int, float)) else str(x)


def pct(a, b):
    return "—" if not b else f"{(a - b) / b * 100:+.0f}%"


def section_status(name, d, label):
    """接入了但失败 → ⚠️ 进告警；没接入 → 一行说明。返回 True 表示可以继续画这一节。"""
    if d.get("ok"):
        return True
    if d.get("skipped"):
        w(f"> ⏸ **{label}未接入**：{d.get('reason')}")
    else:
        alerts.append(f"{label}没拿到数据：{d.get('error')}")
        w(f"> ⚠️ **{label}未出数**：{d.get('error')}")
    w()
    return False


site, gsc, vercel, ga, clarity, channels = load("site"), load("gsc"), load("vercel"), load("ga"), load("clarity"), load("channels")
today = today_cst(); y = today - timedelta(days=1)

# ───────────── 管线健康（先算告警，放第一屏） ─────────────
health = []
if site.get("ok"):
    nw = site.get("news") or {}
    if nw:
        if nw.get("published_today"):
            health.append(f"✅ 今日快讯已发（{nw['items_today']} 条）")
        elif datetime.now(CST).hour >= 8:      # 快讯 cron 5:30–7:15 才跑，8 点前手动跑日报不算异常
            alerts.append(f"今天（{nw.get('today')}）的快讯还没出，最新一期是 {nw.get('latest')}")
        else:
            health.append(f"⏳ 今日快讯还没到发布时间（最新一期 {nw.get('latest')}）")
    for wf in site.get("workflows") or []:
        if wf.get("error"):
            health.append(f"❔ {wf['label']}：查不到运行记录（{wf['error']}）")
        elif wf.get("conclusion") not in ("success", "skipped", None):
            alerts.append(f"{wf['label']} 最近一次运行 {wf['conclusion']}：{wf.get('url')}")
        elif wf.get("conclusion") == "success":
            at = datetime.fromisoformat(wf["at"].replace("Z", "+00:00")).astimezone(CST).strftime("%m-%d %H:%M")
            health.append(f"✅ {wf['label']}（{at}）")
    pl = site.get("prompt_library")
    if pl:
        d = f"，较上次日报 {pl['delta']:+d}" if pl.get("delta") is not None else ""
        m = pl.get("models", {})
        health.append(f"📚 提示词库 {pl['works']:,} 个作品{d}（Opus {m.get('opus-5.5', 0)} · Sonnet {m.get('sonnet-5.5', 0)} · Fable {m.get('fable-5.5', 0)}，带提示词 {pl['with_prompt']}）")
    aw = site.get("awesome")
    if aw:
        s = aw.get("sync") or {}
        if s.get("conclusion") not in ("success", None):
            alerts.append(f"GitHub 合集同步最近一次 {s.get('conclusion')}")
        health.append(f"⭐ awesome-opus-5.5-video {aw['stars']:,} stars · {aw['forks']} forks")
    sm = site.get("sitemap")
    if sm:
        if not sm["ok"]:
            alerts.append(f"sitemap 只有 {sm['urls']} 条（下限 {sm['expected_min']}，HTTP {sm['status']}）——可能又静默坏了")
        else:
            health.append(f"✅ sitemap {sm['urls']:,} 条")
    kv = site.get("kv_pending") or {}
    if kv.get("missing"):
        alerts.append(f"有 {kv['missing']} 条订阅只在 KV 兜底里、Supabase 主表没有 → 跑 `node scripts/reconcile-leads.mjs`")
    for k, e in (site.get("errors") or {}).items():
        alerts.append(f"站内数据 {k} 没取到：{e}")
else:
    alerts.append(f"站内数据整体没取到：{site.get('error')}")

# 模型通道体检：主力还在顶着时，备用通道坏了也没人发现（2026-10-04 教训）
if channels.get("ok"):
    for c in channels["checks"]:
        if c["ok"]:
            health.append(f"🔌 {c['channel']} · {c['model']} 正常")
        else:
            alerts.append(f"模型通道不通：{c['channel']} · {c['model']}（HTTP {c['status']}，影响{c['used_by']}）{c['detail'][:90]}")
elif not channels.get("skipped"):
    alerts.append(f"模型通道体检没跑成：{channels.get('error')}")

# ───────────── 头部 KPI ─────────────
kpi = []
sub = site.get("subscribers") if site.get("ok") else None
if sub:
    bd = sub["by_day"]
    y_n = bd.get(str(y), 0)
    w7 = sum(bd.get(str(today - timedelta(days=i)), 0) for i in range(1, 8))
    p7 = sum(bd.get(str(today - timedelta(days=i)), 0) for i in range(8, 15))
    kpi.append(f"新订阅 **{y_n}**（7 天 {w7}，环比 {pct(w7, p7)}，累计 {sub['total']:,}）")
if vercel.get("ok"):
    days = {r.get("timestamp", "")[:10]: n(r) for r in vercel.get("daily", [])}
    yv = days.get(str(y), 0)
    v7 = sum(days.get(str(today - timedelta(days=i)), 0) for i in range(1, 8))
    p7 = sum(days.get(str(today - timedelta(days=i)), 0) for i in range(8, 15))
    yu = next((r.get("visitors", 0) for r in vercel.get("daily", []) if r.get("timestamp", "")[:10] == str(y)), 0)
    kpi.append(f"浏览 **{fmt(yv)}** / 访客 {fmt(yu)}（7 天浏览 {fmt(v7)}，环比 {pct(v7, p7)}）")
if gsc.get("ok"):
    t, tp = gsc["totals7"], gsc["totals7_prev"]
    kpi.append(f"搜索点击 7 天 **{t['clicks']:,}**（环比 {pct(t['clicks'], tp['clicks'])}）")
pv = (site.get("page_views") or {}) if site.get("ok") else {}
if pv.get("delta_total") is not None:
    kpi.append(f"文章阅读 +{pv['delta_total']:,}")

w(f"# jasonzhu.ai 数据日报 · {today}（数据截至 {y}）")
w()
if kpi:
    w(" · ".join(kpi))
    w()
if alerts:
    w("## ⚠️ 需要处理")
    for a in alerts:
        w(f"- {a}")
    w()

w("## 🩺 自动化管线")
for h in health:
    w(f"- {h}")
w()

# ───────────── 订阅 ─────────────
w("## 📮 订阅")
if sub:
    bd = sub["by_day"]
    w("近 7 天：" + " · ".join(f"{(today - timedelta(days=i)).strftime('%m/%d')} {bd.get(str(today - timedelta(days=i)), 0)}" for i in range(7, 0, -1)))
    if sub["by_source7"]:
        w("7 天来源：" + " · ".join(f"{s} {c}" for s, c in sub["by_source7"]))
    if site.get("supabase_key") == "anon":
        w("> 用的是 anon key 读的（本地调试）；CI 用 service key。")
else:
    w("> ⚠️ 没取到订阅数据")
w()

# ───────────── 文章阅读（站内计数器） ─────────────
w("## 📖 文章阅读（站内计数）")
if pv.get("top_delta"):
    w(f"*与上次快照（{pv['prev_taken_at']}）相比*")
    w()
    w("| 文章 | 新增 | 累计 |")
    w("|---|--:|--:|")
    for r in pv["top_delta"]:
        w(f"| {(r['title'] or r['slug'])[:40]} | +{r['delta']} | {r['count']:,} |")
elif pv.get("prev_taken_at"):
    w(f"与上次快照（{pv['prev_taken_at']}）相比没有新增阅读")
elif pv:
    w("首次运行：今天建立基线，明天起显示每日增量。累计最高：")
    for r in pv.get("top_all", [])[:5]:
        w(f"- {(r['title'] or r['slug'])[:40]} — {r['count']:,}")
w()

# ───────────── Vercel 流量 ─────────────
w("## 🌐 流量（Vercel Analytics，含国内访客）")
if section_status("vercel", vercel, "Vercel Analytics ") and not vercel.get("paths7"):
    w("> 刚开始采集，近 7 天还没有数据（开关 2026-10-04 才打开）")
    w()
elif vercel.get("ok"):
    w("| 页面 | 7 天浏览 |")
    w("|---|--:|")
    for r in vercel.get("paths7", [])[:12]:
        w(f"| {r.get('requestPath', '')[:60]} | {fmt(n(r))} |")
    w()
    refs = [(r.get("referrerHostname") or "(直接访问)", n(r)) for r in vercel.get("referrers7", [])]
    w("**来源（7 天）**：" + " · ".join(f"{h} {fmt(c)}" for h, c in refs[:10]))
    ai = [(h, c) for h, c in refs if any(h.endswith(a) for a in AI_REFERRERS)]
    w()
    w(f"**AI 引荐（7 天）**：合计 {fmt(sum(c for _, c in ai))}" + (" ← " + " · ".join(f"{h} {fmt(c)}" for h, c in ai) if ai else ""))
    w()
    w("**国家/地区**：" + " · ".join(f"{r.get('country') or '?'} {fmt(n(r))}" for r in vercel.get("countries7", [])[:8]))
    w("**设备**：" + " · ".join(f"{r.get('deviceType') or '?'} {fmt(n(r))}" for r in vercel.get("devices7", [])))
    w()

# ───────────── GSC ─────────────
w("## 🔍 Google 搜索（GSC）")
if section_status("gsc", gsc, "GSC "):
    op = gsc["operators"]
    if op["count"]:
        w(f"> 已剔除 {op['count']} 个搜索操作符查询（曝光 {op['impressions']:,}，点击 {op['clicks']}）——排名监控工具，不是真人")
        w()
    w(f"*28 天 {gsc['window'][0]} → {gsc['window'][1]}（GSC 有 2 天延迟）*")
    w()
    w("| 搜索词 | 点击 | 曝光 | CTR% | 排名 |")
    w("|---|--:|--:|--:|--:|")
    for r in gsc["queries"][:10]:
        w(f"| {r['query'][:40]} | {r['clicks']} | {r['impressions']:,} | {r['ctr']} | {r['position']} |")
    w()
    up = [r for r in gsc["rising"] if r["d_clicks"] > 0][:8]
    if up:
        w("**涨幅（近 7 天 vs 前 7 天，按点击）**：" + " · ".join(f"{r['query'][:30]} +{r['d_clicks']}" for r in up))
        w()
    w("**带来点击最多的页面（28 天）**")
    for r in sorted(gsc["pages"], key=lambda x: -x["clicks"])[:8]:
        w(f"- {r['page'].replace('https://jasonzhu.ai', '')[:70]} — {r['clicks']} 点击 / {r['impressions']:,} 曝光 / 排名 {r['position']}")
    w()

# ───────────── GA4 ─────────────
w("## 📈 GA4（来源与转化）")
if section_status("ga", ga, "GA4 "):
    bots = sum(r["sessions"] for r in ga["automation28"]["rows"])
    if bots:
        w(f"> 已剔除机房无头浏览器 {bots:,.0f} 个会话（28 天）")
        w()
    rows = ga["sources7"]["rows"]
    w("**来源（7 天）**：" + " · ".join(f"{r['sessionSource']}/{r['sessionMedium']} {r['sessions']:.0f}" for r in rows[:8]))
    ai = [r for r in rows if any(r["sessionSource"].endswith(a.split(".")[0]) or r["sessionSource"].endswith(a) for a in AI_REFERRERS)]
    if ai:
        w(f"**AI 引荐（7 天）**：" + " · ".join(f"{r['sessionSource']} {r['sessions']:.0f}" for r in ai))
    w()
    ev28 = {r["eventName"]: r for r in ga["events28"]["rows"]}
    ev7 = {r["eventName"]: r for r in ga["events7"]["rows"]}
    hit = [k for k in CONVERSIONS if k in ev28]
    if hit:
        w("**转化事件**（7 天 / 28 天）")
        for k in hit:
            w(f"- 🎯 **{CONVERSIONS[k]}** `{k}` — {ev7.get(k, {}).get('eventCount', 0):.0f} / {ev28[k]['eventCount']:.0f} 次")
    else:
        w("转化事件 28 天内还没有记录（埋点刚上线时正常）")
    w()

# ───────────── Clarity ─────────────
w("## 🖱 体验摩擦（Clarity，近 3 天）")
if section_status("clarity", clarity, "Clarity "):
    for m in clarity.get("overview", []):
        name = m.get("metricName")
        info = (m.get("information") or [{}])[0]
        if name in ("Traffic", "DeadClickCount", "RageClickCount", "QuickbackClick", "ScriptErrorCount", "ExcessiveScroll"):
            vals = {k: v for k, v in info.items() if k in ("totalSessionCount", "sessionsCount", "sessionsWithMetricPercentage", "subTotal", "distinctUserCount")}
            w(f"- {name}: " + " · ".join(f"{k}={v}" for k, v in vals.items()))
    w()

w("---")
w(f"*生成：ops/analytics/digest.py · {datetime.now(CST).strftime('%Y-%m-%d %H:%M')} 北京时间*")
print("\n".join(lines))
