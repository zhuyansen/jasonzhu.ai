"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  lang: "zh" | "en";
  onClose: () => void;
  initialEmail?: string;
  initialGithub?: string;
  isLoggedIn?: boolean;
  initialRef?: string;
}

type Step = "form" | "qr" | "expired" | "done" | "error";

export default function XunhupayCheckoutModal({ lang, onClose, initialEmail = "", initialGithub = "", isLoggedIn = false, initialRef = "" }: Props) {
  const isZh = lang === "zh";
  const [step, setStep] = useState<Step>("form");
  const [channel, setChannel] = useState<"wechat" | "alipay">("wechat");
  const [email, setEmail] = useState(initialEmail);
  const [wechat, setWechat] = useState("");
  const [github, setGithub] = useState(initialGithub);
  const [ref, setRef] = useState(initialRef);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [payUrl, setPayUrl] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [result, setResult] = useState<{ github: string; hubKey: string } | null>(null);
  const mountedAt = useRef<number>(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (expireTimer.current) clearTimeout(expireTimer.current);
  }

  useEffect(() => {
    mountedAt.current = Date.now();
    return clearTimers;
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setAlreadyMember(false);
    try {
      const res = await fetch("/api/checkout/xunhupay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, wechat, github, channel, ref, ts: mountedAt.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || (isZh ? "创建订单失败" : "Failed to create order"));
        setAlreadyMember(Boolean(data.alreadyMember));
        setSubmitting(false);
        return;
      }
      setQrUrl(data.qrUrl);
      setPayUrl(data.payUrl);
      setAmount(data.amount);
      setStep("qr");
      setSubmitting(false);

      // 支付宝手机端体验更好：直接跳转，不用扫码
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (channel === "alipay" && isMobile && data.payUrl) {
        window.location.href = data.payUrl;
      }

      clearTimers();
      pollTimer.current = setInterval(async () => {
        const s = await fetch(`/api/checkout/xunhupay/status?order=${data.tradeOrderId}`).then((r) => r.json());
        if (s.status === "completed") {
          clearTimers();
          setResult({ github: s.github, hubKey: s.hubKey });
          setStep("done");
        }
      }, 3000);
      // 二维码 5 分钟有效期，到点就提示重新生成，别让用户对着失效码干扫
      expireTimer.current = setTimeout(() => {
        clearTimers();
        setStep("expired");
      }, 5 * 60 * 1000);
    } catch {
      setErrorMsg(isZh ? "网络错误，请稍后重试" : "Network error");
      setSubmitting(false);
    }
  }

  const copyKey = async () => {
    if (!result?.hubKey) return;
    await navigator.clipboard.writeText(result.hubKey);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm"
          aria-label="close"
        >
          ✕
        </button>

        {step === "form" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {isZh ? "加入 GoSail Club 启航版" : "Join GoSail Club Starter"}
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "邮箱" : "Email"}</label>
              <input
                type="email"
                required
                readOnly={isLoggedIn}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none ${isLoggedIn ? "bg-gray-50 text-gray-500" : ""}`}
              />
              {isLoggedIn && (
                <p className="text-xs text-gray-400 mt-1">{isZh ? "已登录账号的邮箱，直接绑定到当前账号" : "Locked to your logged-in account's email"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "微信号" : "WeChat ID"}</label>
              <input
                required
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder={isZh ? "拉你进会员群用" : "So we can add you to the member group"}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {isZh ? "GitHub 用户名（可选）" : "GitHub username (optional)"}
              </label>
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder={isZh ? "没有就先跳过，之后在会员中心补填" : "Skip if you don't have one — add it later"}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {isZh ? "推荐码（选填）" : "Referral code (optional)"}
              </label>
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder={isZh ? "朋友推荐的话填 TA 的推荐码" : "If a member referred you"}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:border-[var(--primary)] focus:outline-none"
              />
              {initialRef && ref === initialRef && (
                <p className="text-xs text-green-600 mt-1">{isZh ? "✓ 已带上推荐关系" : "✓ Referral applied"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "支付方式" : "Pay with"}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel("wechat")}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    channel === "wechat" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"
                  }`}
                >
                  微信支付
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("alipay")}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    channel === "alipay" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"
                  }`}
                >
                  支付宝
                </button>
              </div>
            </div>
            {errorMsg && (
              <p className="text-sm text-red-500">
                {errorMsg}
                {alreadyMember && (
                  <>
                    {" "}
                    <a href={`/${lang}/login`} className="text-[var(--primary)] hover:underline font-medium">
                      {isZh ? "去登录 →" : "Sign in →"}
                    </a>
                  </>
                )}
              </p>
            )}
            {!alreadyMember && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (isZh ? "生成中…" : "Creating…") : isZh ? `生成收款二维码 →` : "Generate QR →"}
              </button>
            )}
          </form>
        )}

        {step === "qr" && (
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isZh ? `用${channel === "wechat" ? "微信" : "支付宝"}扫码支付` : "Scan to pay"}
            </h3>
            <p className="text-sm text-gray-400 mb-5">¥{amount}</p>
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 虎皮椒直接返回二维码图片地址，不走 next/image 域名白名单
              <img
                src={qrUrl}
                alt="QR code"
                className="mx-auto rounded-xl border border-gray-100"
                width={240}
                height={240}
              />
            ) : (
              <div className="w-60 h-60 mx-auto flex items-center justify-center text-sm text-gray-400 border border-gray-100 rounded-xl">
                {isZh ? "二维码生成中…" : "Generating…"}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">
              {isZh ? "支付完成后页面会自动跳转，别关闭这个窗口" : "This page updates automatically once paid"}
            </p>
            {channel === "wechat" && (
              <p className="text-xs text-gray-300 mt-2">
                {isZh ? "手机端：截图后用微信「扫一扫→相册」识别" : "Mobile: screenshot and scan via WeChat"}
              </p>
            )}
            {/* 微信"唤醒跳转支付"官方已关闭（2025-11-06 起），这个跳转链接对微信渠道点了没反应，只有支付宝还能用 */}
            {channel === "alipay" && payUrl && (
              <a href={payUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline mt-3 inline-block">
                {isZh ? "手机上？点这里直接打开" : "On mobile? Tap to open"}
              </a>
            )}
          </div>
        )}

        {step === "expired" && (
          <div className="text-center">
            <span className="text-3xl">⏱️</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3 mb-1">{isZh ? "二维码已过期" : "QR code expired"}</h3>
            <p className="text-sm text-gray-400 mb-5">{isZh ? "5 分钟内没扫码，重新生成一个" : "Not scanned within 5 minutes"}</p>
            <button
              onClick={() => setStep("form")}
              className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {isZh ? "重新生成 →" : "Regenerate →"}
            </button>
          </div>
        )}

        {step === "done" && result && (
          <div className="text-center">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3 mb-1">{isZh ? "开通成功！" : "You're in!"}</h3>
            <p className="text-sm text-gray-500 mb-5">
              {result.github
                ? (isZh ? "GitHub 邀请和确认邮件都发出去了" : "GitHub invite and confirmation email are on the way")
                : (isZh ? "确认邮件发出去了，想要 GitHub 仓库权限可以去会员中心补填用户名" : "Confirmation email is on the way — add a GitHub username in Dashboard later for repo access")}
            </p>
            <div className="text-left bg-gray-900 rounded-lg p-3 mb-4">
              <div className="text-[10px] text-gray-400 mb-1">Agent Skills Hub Pro Key</div>
              <code className="text-green-400 text-xs break-all">{result.hubKey}</code>
            </div>
            <div className="flex gap-3">
              <button onClick={copyKey} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-[var(--primary)] hover:text-[var(--primary)]">
                {isZh ? "复制 Key" : "Copy key"}
              </button>
              <a
                href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/login?mode=signup&email=${encodeURIComponent(email)}`}
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm text-center hover:opacity-90"
              >
                {isZh ? "去会员中心" : "Dashboard"}
              </a>
            </div>
            {!isLoggedIn && (
              <p className="text-xs text-gray-300 mt-3">
                {isZh ? "第一次去？用这个邮箱设个密码注册一下就能登录了" : "First time? Set a password for this email to sign up"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
