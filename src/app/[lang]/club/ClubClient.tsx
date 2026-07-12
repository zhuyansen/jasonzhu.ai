"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  lang: "zh" | "en";
}

// Stripe Payment Link（支持支付宝/微信支付）。填上后启航版按钮直接跳转支付；
// 留空则回落到下方申请表单。
const STRIPE_PAYMENT_LINK_L1 = "";

const TIERS = [
  {
    id: "l1",
    nameZh: "启航版",
    nameEn: "Starter",
    priceZh: "¥365",
    priceEn: "¥365",
    earlyBird: "¥199",
    period: "/年（下一年续费 ¥99）",
    limitZh: "首发早鸟 ¥199 · 限 7 天 · 2026.07.20 截止",
    featured: true,
    forZh: "想用 AI 杠杆做出海的你（一天一块钱）",
    itemsZh: [
      "🔍 AgentSkillsHub Pro 三件套：全库深度搜索 + 社区精选榜 + 每周 Top3 解读",
      "🔧 内容一键分发 Skill：写一次，公众号/小红书/X 三平台同步发",
      "🔥 X 热点雷达 Skill：捕捉热点 → 生成推文 → 发布，全自动涨粉引擎",
      "📖 AIP 出海手册会员版（105 页，1000+ 人实战验证，持续更新）",
      "🎙 半月度闭门讨论会 + 会员群（第一手实操，不对外）",
      "🚀 MCN 签约直通车：500 粉进 GoSail Lab（已执行 campaign 15+），开启你的第一个商单",
    ],
    itemsEn: ["SkillsHub Pro: deep search + curated ranking + weekly Top3", "One-click distribution skill (WeChat/RedNote/X)", "X hot-topic radar skill — auto growth engine", "AIP handbook member edition (105 pages, 1,000+ users)", "Bi-weekly closed-door sessions + member group", "MCN fast track: 500 followers → GoSail Lab, land your first brand deal"],
    gateZh: "开放加入，无需审核 · GitHub 权限自动开通",
  },
  {
    id: "l2",
    nameZh: "进阶版",
    nameEn: "Pro",
    priceZh: "¥3,999",
    priceEn: "¥3,999",
    earlyBird: null,
    period: "/年",
    limitZh: "VIP 小群限 50 人 · 审核制",
    featured: false,
    forZh: "已有产品/收入，要资源和信息差的你",
    itemsZh: [
      "启航版全部权益",
      "VIP 小群（限 50 人，全员实名背景）",
      "结构化资源对接（需求/能力入库撮合）",
      "季度线上私享会（真实数据闭门讲）",
    ],
    itemsEn: ["Everything in Starter", "VIP group (50 cap)", "Structured matchmaking", "Quarterly private sessions"],
    gateZh: "审核制：有上线产品或真实业务",
  },
];

export default function ClubClient({ lang }: Props) {
  const isZh = lang === "zh";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedTier, setSelectedTier] = useState("l1");
  // time-trap 反 bot：渲染期不可调 Date.now()（react-hooks/purity），挂载后再记时
  const mountedAt = useRef<number>(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const scrollToApply = (tier: string) => {
    setSelectedTier(tier);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/club-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          wechat: fd.get("wechat"),
          email: fd.get("email"),
          role: fd.get("role"),
          project: fd.get("project"),
          tier: fd.get("tier"),
          needs: fd.get("needs"),
          referral: fd.get("referral"),
          website: fd.get("website"),
          ts: mountedAt.current,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || (isZh ? "提交失败，请稍后重试" : "Submit failed, please retry"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(isZh ? "网络错误，请稍后重试" : "Network error, please retry");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-[var(--primary)] text-xs font-semibold rounded-full mb-6 tracking-wide">
            {isZh ? "GoSail Club · 首期招募" : "GoSail Club · Founding Cohort"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {isZh ? (
              <>
                GoSail Club <span className="text-[var(--primary)]">启航会</span>
              </>
            ) : (
              "GoSail Club"
            )}
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10">
            {isZh
              ? "AI 出海实战社群：不卖梦想，只交换第一手实操。从工作流改造到公司注册，从内容增长到资源对接。"
              : "A hands-on community for AI builders going global — first-hand playbooks, not dreams."}
          </p>
          {/* 真实数据，不注水 */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-14 mb-10">
            {[
              [isZh ? "4,500+" : "4,500+", isZh ? "邮件订阅者" : "subscribers"],
              ["94", isZh ? "篇双语实操长文" : "bilingual guides"],
              [isZh ? "日更" : "Daily", isZh ? "AI 快讯（86 期+）" : "AI digest"],
              ["68.7%", isZh ? "X 训练营打卡成功率" : "bootcamp completion"],
            ].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{n}</div>
                <div className="text-xs text-gray-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollToApply("l1")}
            className="px-10 py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            {isZh ? "申请加入 →" : "Apply →"}
          </button>
        </div>
      </section>

      {/* 谁适合 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isZh ? "谁应该在这里" : "Who is this for"}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-10">
          {isZh ? "只接纳真的在做出海、且能贡献价值的人" : "Builders actually going global"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            ["🚀", isZh ? "AI 产品创始人" : "Founders", isZh ? "已有海外用户或收入的 AI 产品创始人/独立开发者" : "AI product founders with global users"],
            ["✍️", isZh ? "内容创作者" : "Creators", isZh ? "想用 AI 杠杆做全球内容 IP 的自媒体人" : "Creators building global IP with AI"],
            ["📈", isZh ? "增长操盘手" : "Growth", isZh ? "有实战经验的海外增长 / BD / 营销负责人" : "Growth & BD operators"],
            ["🛠️", isZh ? "出海服务者" : "Enablers", isZh ? "支付、合规、云、投资等出海基础设施提供方" : "Payments, compliance, infra providers"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="border border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 定价 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isZh ? "会员方案" : "Membership"}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-10">
          {isZh ? "按你的出海阶段选，随时可升级" : "Pick by stage, upgrade anytime"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`relative flex flex-col rounded-2xl p-7 border ${
                t.featured
                  ? "border-[var(--primary)] shadow-lg shadow-blue-100"
                  : "border-gray-200"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--primary)] text-white text-xs font-semibold rounded-full">
                  {isZh ? "推荐" : "Popular"}
                </span>
              )}
              <div className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">
                {isZh ? t.nameZh : t.nameEn}
              </div>
              <div className="mb-1">
                {t.earlyBird ? (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-gray-900">{t.earlyBird}</span>
                    <span className="text-lg text-gray-300 line-through">{t.priceZh}</span>
                    <span className="text-sm text-gray-400">{t.period}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{t.priceZh}</span>
                    <span className="text-sm text-gray-400">{t.period}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-[var(--primary)] font-medium mb-1">{t.limitZh}</div>
              <div className="text-xs text-gray-400 mb-5">{isZh ? `适合：${t.forZh}` : ""}</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {(isZh ? t.itemsZh : t.itemsEn).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gray-400 mb-4">{isZh ? t.gateZh : ""}</div>
              {t.id === "l1" && STRIPE_PAYMENT_LINK_L1 ? (
                <a
                  href={STRIPE_PAYMENT_LINK_L1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-xl text-sm font-semibold text-center bg-[var(--primary)] text-white hover:opacity-90 transition-all"
                >
                  {isZh ? "立即加入 · 早鸟 ¥199 →" : "Join now · ¥199 →"}
                </a>
              ) : (
                <button
                  onClick={() => scrollToApply(t.id)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    t.featured
                      ? "bg-[var(--primary)] text-white hover:opacity-90"
                      : "border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {isZh ? `申请${t.nameZh}` : `Apply ${t.nameEn}`}
                </button>
              )}
            </div>
          ))}
        </div>
        {/* 企业锚点 */}
        <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {isZh
              ? "🏢 企业 AI 培训 / 出海咨询（¥30,000 起）——面向团队与公司的定制服务"
              : "🏢 Enterprise AI training & consulting (from ¥30,000)"}
          </p>
          <a
            href={`/${lang}/services`}
            className="text-sm text-[var(--primary)] font-medium hover:underline whitespace-nowrap"
          >
            {isZh ? "了解企业服务 →" : "Enterprise services →"}
          </a>
        </div>
      </section>

      {/* 申请表单 */}
      <section id="apply" className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {isZh ? "申请加入" : "Apply to join"}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-8">
            {isZh
              ? "启航版开放加入；进阶版 3 个工作日内审核回复"
              : "Starter is open; Pro reviewed within 3 business days"}
          </p>

          {status === "success" ? (
            <div className="bg-white border border-green-200 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isZh ? "申请已提交！" : "Application submitted!"}
              </h3>
              <p className="text-sm text-gray-500">
                {isZh
                  ? "我们会通过微信/邮箱联系你。启航版申请通常当天处理，付款后发兑换码自动开通。"
                  : "We'll reach out via WeChat/email shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-7 space-y-5">
              {/* honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "姓名 / 昵称" : "Name"} <span className="text-red-500">*</span>
                  </label>
                  <input name="name" required maxLength={100} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none" placeholder={isZh ? "社群中如何称呼你" : "Your name"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "微信号" : "WeChat"} <span className="text-red-500">*</span>
                  </label>
                  <input name="wechat" required maxLength={100} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none" placeholder={isZh ? "审核通过后联系你" : "WeChat ID"} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "邮箱" : "Email"} <span className="text-red-500">*</span>
                  </label>
                  <input name="email" type="email" required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "意向方案" : "Tier"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tier"
                    required
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none bg-white"
                  >
                    <option value="l1">{isZh ? "启航版 — 早鸟 ¥199/年" : "Starter ¥199/yr"}</option>
                    <option value="l2">{isZh ? "进阶版 — ¥3,999/年" : "Pro ¥3,999/yr"}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isZh ? "你的角色" : "Role"}
                </label>
                <select name="role" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none bg-white" defaultValue="">
                  <option value="" disabled>{isZh ? "选择最匹配的" : "Select"}</option>
                  <option value="founder">{isZh ? "AI 产品创始人 / 独立开发者" : "Founder / indie dev"}</option>
                  <option value="creator">{isZh ? "内容创作者 / 自媒体" : "Creator"}</option>
                  <option value="growth">{isZh ? "海外增长 / BD" : "Growth / BD"}</option>
                  <option value="ecosystem">{isZh ? "出海生态服务方" : "Ecosystem"}</option>
                  <option value="other">{isZh ? "其他" : "Other"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isZh ? "你在做什么（进阶版必填）" : "What are you building"}
                </label>
                <textarea name="project" maxLength={2000} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none resize-y" placeholder={isZh ? "产品/业务、目标市场、当前阶段。申请启航版可简写。" : "Product, market, stage"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isZh ? "最想对接的资源" : "What do you need"}
                </label>
                <textarea name="needs" maxLength={2000} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none resize-y" placeholder={isZh ? "例：北美分销渠道 / 出海支付方案 / AI 工作流改造…" : "e.g. distribution, payments, AI workflows…"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isZh ? "推荐人（可选，加速审核）" : "Referral (optional)"}
                </label>
                <input name="referral" maxLength={100} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none" placeholder={isZh ? "现有成员姓名或微信" : "Member name"} />
              </div>
              {status === "error" && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "loading"
                  ? isZh ? "提交中…" : "Submitting…"
                  : isZh ? "提交申请" : "Submit"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                {isZh ? "我们尊重你的隐私，信息仅用于入会审核。" : "Your info is only used for review."}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
