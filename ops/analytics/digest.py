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


def digest_email(yd):
    """昨天那期快讯邮件的最终状态（fetch_site 读的 KV 发信账本）→（管线一行, 告警或 None）。
    daily-news 最后一档没发完会给 ALERT_EMAIL 告警；那档被 GitHub 丢掉、或 runner 中途没了，就靠日报这里兜底。"""
    d, md, e = yd["date"], yd["date"][5:], yd.get("email") or {}
    st, run = e.get("status"), str(e.get("run") or "")
    log = f"[运行日志]({run})" if run.startswith("http") else run
    head = f"昨日快讯邮件（{md}）"
    late = "。自动补发只管当天那期，昨天这期不会再补；按日志修好原因，免得今天也发不出去"
    if not yd.get("published"):
        return (f"⚠️ 昨日快讯（{md}）没有生成，没发邮件",
                f"昨天（{d}）的快讯没有生成，订阅者那天没收到邮件：daily-news 三档都没跑成（被 GitHub 丢了或都失败了），最后一档的告警可能也没发出——去 Actions 看 daily-news")
    if st == "sent":
        if e.get("manual_fix"):
            return f"✅ {head}：人工标记为发完（账本里确认发出 {e.get('sent')}/{e.get('total')}）", None
        drop = f"，{e['dropped']} 人补发前退订或被挤出最新 1000 个、没补发" if e.get("dropped") else ""
        return f"✅ {head}：已发 {e.get('sent')}/{e.get('total')}{drop}", None
    if st == "skipped":
        return f"⏭ {head}：按要求不发（手动跑选了 skip_email）", None
    if st == "failed":
        if e.get("total") is None:
            return (f"⚠️ {head}：一封都没发",
                    f"昨天（{d}）的快讯邮件一封都没发：{e.get('error')}（第 {e.get('attempts')} 次，{log}）{late}")
        return (f"⚠️ {head}：没发完，已发 {e.get('sent')}/{e.get('total')}",
                f"昨天（{d}）的快讯邮件没发完：已发 {e.get('sent')}/{e.get('total')}，还有 {e.get('pending_batches')} 批 {e.get('pending_people')} 人没发出去；"
                f"最近一次报错：{e.get('error')}（第 {e.get('attempts')} 次，{log}）{late}")
    if st == "sending":
        s = e.get("started_at")
        try:   # 账本是另一个脚本写的，时间格式不对也不能让整封日报挂掉
            at = datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(CST).strftime("%m-%d %H:%M")
        except (AttributeError, TypeError, ValueError):
            at = s or "?"
        return (f"⚠️ {head}：停在「发送中」，账本里确认发出 {e.get('sent')}/{e.get('total')}",
                f"昨天（{d}）的快讯邮件停在「发送中」没收尾：{at} 开始发（{log}），账本里确认发出 {e.get('sent')}/{e.get('total')}"
                f"（发到一半进程没了，或发完了但账本没记上）——看运行日志和 Resend 后台，确认订阅者收到没有")
    if st == "none":
        return (f"⚠️ {head}：没有发信记录",
                f"昨天（{d}）的快讯发布了，但没有发信记录，订阅者多半没收到：发信那一步没跑到，或在记账前就退出了"
                f"（比如缺 RESEND_API_KEY / UNSUBSCRIBE_SECRET / KV 配置）——看 daily-news 那天的运行日志")
    if st == "unknown":
        return f"❔ {head}：读不到发信账本", f"读不到昨天（{d}）的快讯发信账本，没法确认邮件发没发：{e.get('read_error')}"
    return f"⚠️ {head}：账本状态看不懂（{st}）", f"昨天（{d}）的快讯发信账本状态看不懂：{st}"


site, gsc, vercel, ga, clarity, channels = load("site"), load("gsc"), load("vercel"), load("ga"), load("clarity"), load("channels")
usage = load("vercel_usage")
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
        if nw.get("yesterday"):
            line, problem = digest_email(nw["yesterday"])
            health.append(line)
            if problem:
                alerts.append(problem)
    for wf in site.get("workflows") or []:
        if wf.get("error"):
            health.append(f"❔ {wf['label']}：查不到运行记录（{wf['error']}）")
        elif wf.get("conclusion") not in ("success", "skipped", None):
            alerts.append(f"{wf['label']} 最近一次运行 {wf['conclusion']}：{wf.get('url')}")
        elif wf.get("conclusion") == "success":
            at = datetime.fromisoformat(wf["at"].replace("Z", "+00:00")).astimezone(CST).strftime("%m-%d %H:%M")
            health.append(f"✅ {wf['label']}（{at}）")
    # 定时触发：Vercel Cron 按点触发三个任务（2026-11-09 起）；没按点就是落回了 GitHub 自己晚几小时的定时
    ct = site.get("cron_triggers")
    if ct:
        good = []
        for s in ct.get("slots") or []:
            if s["ok"]:
                good.append(f"{s['label']} {s['slot'][-5:]}")
                continue
            if not s.get("event"):
                what = "到现在还没跑"
            elif s["event"] == "schedule":
                what = f"是 GitHub 自己的定时晚 {s['late_min']} 分钟补跑的"
            else:
                what = f"第一次运行晚了 {s['late_min']} 分钟（{s['event']}）"
            d = s.get("dispatch") or {}
            if not d.get("at") or d["at"] < s["slot_utc"]:
                why = "这个点接口没被调用：Vercel 定时没生效，或 CRON_SECRET 不对（接口直接拒绝，不留记录）"
            elif not d.get("ok"):
                why = f"接口调了但触发失败：HTTP {d.get('status')} {(d.get('error') or '')[:160]}（token 没有 Actions 读写权限或过期最常见）"
            else:
                why = "接口当时触发成功了，但运行没按时出现，去 Actions 看看"
            alerts.append(f"{s['label']} {s['slot']} 没按点触发，{what}。{why}")
        exp = ct.get("token_expires")
        try:
            days = (datetime.strptime(exp, "%Y-%m-%d").date() - today).days if exp else None
        except ValueError:
            days = None
        if days is not None and days <= 14:
            alerts.append(f"触发工作流用的 GitHub token（Vercel 的 GITHUB_CONTENTS_TOKEN）{exp} 到期，还剩 {days} 天：到 GitHub 续期，"
                          f"重新生成的话要更新 Vercel 环境变量")
        if good:
            health.append(f"⏰ 按点触发：{' · '.join(good)}" + (f"（GitHub token {exp} 到期）" if exp else ""))
    pl = site.get("prompt_library")
    if pl:
        d = f"，较上次日报 {pl['delta']:+d}" if pl.get("delta") is not None else ""
        m = pl.get("models", {})
        health.append(f"📚 提示词库 {pl['works']:,} 个作品{d}（Opus {m.get('opus-5.5', 0)} · Sonnet {m.get('sonnet-5.5', 0)} · Haiku {m.get('haiku-5.5', 0)} · Fable {m.get('fable-5.5', 0)}，带提示词 {pl['with_prompt']}）")
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
    if kv.get("unsub_queued"):
        alerts.append(f"有 {kv['unsub_queued']} 条退订只记在 KV 兜底里（Supabase 当时写不进），这些人还会收到邮件 → 跑 `node scripts/reconcile-leads.mjs`")
    for k, e in (site.get("errors") or {}).items():
        alerts.append(f"站内数据 {k} 没取到：{e}")
else:
    alerts.append(f"站内数据整体没取到：{site.get('error')}")

# 通道体检（模型 + X 数据余额）：主力还在顶着时，备用通道坏了也没人发现（2026-10-04 教训）
if channels.get("ok"):
    for c in channels["checks"]:
        if c["ok"]:
            health.append(f"🔌 {c['channel']} · {c['model']} 正常")
        else:
            http = f"HTTP {c['status']}，" if c["status"] not in (0, 200) else ""
            alerts.append(f"通道异常：{c['channel']} · {c['model']}（{http}影响{c['used_by']}）{c['detail'][:90]}")
elif not channels.get("skipped"):
    alerts.append(f"通道体检没跑成：{channels.get('error')}")

# Vercel 请求额度：2026-10-07 免费版 Edge Requests 超额，整站 402 停用，事先没有任何提醒
QUOTA = {"pro": 10_000_000, "hobby": 1_000_000}  # 每个账单周期（月）的 Edge Requests
edge = None
if usage.get("ok"):
    full = [d for d in usage["daily"] if d["complete"]]
    quota = QUOTA.get(usage.get("plan") or "", QUOTA["pro"])
    yreq = full[-1]["requests"] if full else 0
    last7 = [d["requests"] for d in full[-7:]]
    prev7 = [d["requests"] for d in full[-8:-1]]
    avg7 = sum(last7) / len(last7) if last7 else 0
    pstart, pend = usage.get("period") or [None, None]
    used = sum(d["requests"] for d in usage["daily"] if pstart and d["date"] >= pstart)
    elapsed = (today - datetime.fromisoformat(pstart).date()).days if pstart else 0
    total_days = (datetime.fromisoformat(pend).date() - datetime.fromisoformat(pstart).date()).days if pstart and pend else 30
    # 周期刚开始几天按 7 天日均外推，之后按本周期实际用量外推
    projected = used / elapsed * total_days if elapsed >= 3 else avg7 * total_days
    edge = {"y": full[-1]["date"] if full else "", "yreq": yreq, "avg7": avg7, "quota": quota, "used": used, "projected": projected,
            "period": (pstart, pend), "elapsed": elapsed, "total_days": total_days, "full": full}
    sb = usage.get("soft_block")
    if sb:
        alerts.insert(0, f"🚨 Vercel 已经停用站点（{sb.get('reason')}，{sb.get('blockedDueToOverageType') or ''}）——网站现在打不开，去 Vercel 控制台 Usage 页处理")
    if used >= quota * 0.8:
        alerts.append(f"Vercel 请求额度本周期已用 {used / quota:.0%}（{fmt(used)} / {fmt(quota)}），超额会整站停用")
    elif projected >= quota * 0.8:
        alerts.append(f"Vercel 请求量按现在的速度，本周期预计用到额度的 {projected / quota:.0%}（预计 {fmt(projected)} / {fmt(quota)}；昨天 {fmt(yreq)}，7 天日均 {fmt(avg7)}）")
    p_avg = sum(prev7) / len(prev7) if prev7 else 0
    if p_avg and yreq >= 2 * p_avg and yreq >= quota / 30:
        alerts.append(f"Vercel 请求量昨天突增到 {fmt(yreq)}（前 7 天日均 {fmt(p_avg)} 的 {yreq / p_avg:.1f} 倍）——查爬虫或预加载，`/v4/usage/top` 看路径")
    if not (used >= quota * 0.8 or projected >= quota * 0.8):
        health.append(f"📈 Vercel 请求额度正常：本周期已用 {fmt(used)} / {fmt(quota)}，预计 {projected / quota:.0%}")
elif not usage.get("skipped"):
    alerts.append(f"Vercel 请求用量没取到：{usage.get('error')}")

# AI 引荐以 GA4 为准：ChatGPT 打开外链不带 Referer，Vercel 收不到；GA4 靠链接里的 utm_source=chatgpt.com 认得出来
def is_ai(src):
    return any(src.endswith(a) or src.endswith(a.split(".")[0]) for a in AI_REFERRERS)


ai_ga = None
if ga.get("ok") and ga.get("srcLanding7"):
    by_src, by_page = {}, {}
    for r in ga["srcLanding7"]["rows"]:
        if is_ai(r["sessionSource"]):
            by_src[r["sessionSource"]] = by_src.get(r["sessionSource"], 0) + r["sessions"]
            by_page[r["landingPage"]] = by_page.get(r["landingPage"], 0) + r["sessions"]
    ai_ga = {"total": sum(by_src.values()), "src": sorted(by_src.items(), key=lambda x: -x[1]), "pages": sorted(by_page.items(), key=lambda x: -x[1])}

# ───────────── 头部 KPI ─────────────
kpi = []
sub = site.get("subscribers") if site.get("ok") else None
if sub:
    bd = sub["by_day"]
    y_n = bd.get(str(y), 0)
    w7 = sum(bd.get(str(today - timedelta(days=i)), 0) for i in range(1, 8))
    p7 = sum(bd.get(str(today - timedelta(days=i)), 0) for i in range(8, 15))
    kpi.append(f"新订阅 **{y_n}**（7 天 {w7}，环比 {pct(w7, p7)}，累计 {sub['total']:,}）")
    un = sub.get("unsub")  # 2026-11-06 起有退订；累计订阅数含已退订的
    if un:
        u7 = sum(un["by_day"].get(str(today - timedelta(days=i)), 0) for i in range(1, 8))
        kpi.append(f"退订 {un['by_day'].get(str(y), 0)}（7 天 {u7}，累计 {un['total']:,}）")
if vercel.get("ok"):
    days = {r.get("timestamp", "")[:10]: n(r) for r in vercel.get("daily", [])}
    yv = days.get(str(y), 0)
    v7 = sum(days.get(str(today - timedelta(days=i)), 0) for i in range(1, 8))
    p7 = sum(days.get(str(today - timedelta(days=i)), 0) for i in range(8, 15))
    yu = next((r.get("visitors", 0) for r in vercel.get("daily", []) if r.get("timestamp", "")[:10] == str(y)), 0)
    kpi.append(f"浏览 **{fmt(yv)}** / 访客 {fmt(yu)}（7 天浏览 {fmt(v7)}，环比 {pct(v7, p7)}）")
if edge:
    kpi.append(f"Vercel 请求 {fmt(edge['yreq'])}（额度预计 {edge['projected'] / edge['quota']:.0%}）")
if ai_ga is not None:
    kpi.append(f"AI 引荐 7 天 **{ai_ga['total']:,.0f}** 次会话")
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
    w(f"**AI 引荐（7 天，Vercel 侧，偏低）**：{fmt(sum(c for _, c in ai))}" + (" ← " + " · ".join(f"{h} {fmt(c)}" for h, c in ai) if ai else "")
      + "。ChatGPT 打开链接不带来源，这里基本记不到，以 GA4 那节为准")
    w()
    w("**国家/地区**：" + " · ".join(f"{r.get('country') or '?'} {fmt(n(r))}" for r in vercel.get("countries7", [])[:8]))
    w("**设备**：" + " · ".join(f"{r.get('deviceType') or '?'} {fmt(n(r))}" for r in vercel.get("devices7", [])))
    w()

# ───────────── Vercel 请求额度 ─────────────
if edge:
    w("## 📈 Vercel 请求额度（Edge Requests，计费口径）")
    ps, pe = edge["period"]
    w(f"本周期 {ps} → {pe}（第 {edge['elapsed'] + 1}/{edge['total_days']} 天）：已用 **{fmt(edge['used'])}** / {fmt(edge['quota'])}"
      f"（{edge['used'] / edge['quota']:.0%}），按现在速度预计 **{edge['projected'] / edge['quota']:.0%}**；"
      f"80% 告警线，超额整站停用。")
    w()
    w("近 14 天（UTC 日）：" + " · ".join(f"{d['date'][5:].replace('-', '/')} {d['requests'] / 1000:,.0f}k" for d in edge["full"][-14:]))
    w()
    w("> 这是 Vercel 计费数，含爬虫、静态资源、预加载，远大于浏览量。全站链接用 `@/components/Link`（默认不预加载），中间件只匹配必要路径。")
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
    if ai_ga is not None:
        w(f"**AI 引荐（7 天）**：合计 {ai_ga['total']:,.0f} 次会话" + (" ← " + " · ".join(f"{s} {c:.0f}" for s, c in ai_ga["src"]) if ai_ga["src"] else ""))
        if ai_ga["pages"]:
            w("**AI 引荐落到的页面**：" + " · ".join(f"{p[:50]} {c:.0f}" for p, c in ai_ga["pages"][:5]))
    else:
        ai = [r for r in rows if is_ai(r["sessionSource"])]
        if ai:
            w("**AI 引荐（7 天）**：" + " · ".join(f"{r['sessionSource']} {r['sessions']:.0f}" for r in ai))
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
