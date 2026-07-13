"use client";

import { useState } from "react";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface Session {
  slug: string;
  date: string;
  topic: string;
  title: string;
  uid: string | null;
  hlsUrl: string | null;
  iframeUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  transcript: TranscriptSegment[];
}

interface Data {
  title: string;
  sessions: Session[];
}

interface Props {
  lang: "zh" | "en";
  isLoggedIn: boolean;
  isMember: boolean;
  data: Data;
}

function formatTime(sec: number | null): string {
  if (sec === null) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionsClient({ lang, isLoggedIn, isMember, data }: Props) {
  const isZh = lang === "zh";
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = data.sessions[activeIndex];

  async function copyTranscript() {
    const text = active.transcript.map((seg) => `[${formatTime(seg.start)}] ${seg.text}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">🔒</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{isZh ? "请先登录" : "Please sign in"}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {isZh ? "登录后查看 GoSail Club 闭门讨论会" : "Sign in to view closed-door sessions"}
        </p>
        <a href={`/${lang}/login`} className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
          {isZh ? "去登录 →" : "Sign in →"}
        </a>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">🎙</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{isZh ? "这是会员专属内容" : "Members only"}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {isZh ? "加入 GoSail Club 解锁全部闭门讨论会回放" : "Join GoSail Club to unlock session recordings"}
        </p>
        <a href={`/${lang}/club`} className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
          {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
        </a>
      </div>
    );
  }

  if (data.sessions.length === 0) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">🎙</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{isZh ? "还没有讨论会回放" : "No sessions yet"}</h1>
        <p className="text-sm text-gray-400">{isZh ? "第一场闭门讨论会结束后会更新在这里" : "Check back after the first session"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">{data.title}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {isZh ? `共 ${data.sessions.length} 场 · GoSail Club 会员专属` : `${data.sessions.length} sessions · Members only`}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* 播放器 + 逐字稿 */}
        <div className="min-w-0">
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {active.iframeUrl ? (
              <iframe
                key={active.slug}
                src={active.iframeUrl}
                className="w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                {isZh ? "视频处理中，稍后再来看" : "Processing, check back soon"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs px-2 py-1 bg-blue-50 text-[var(--primary)] rounded-md font-medium">{active.topic}</span>
            <span className="text-xs text-gray-400">{active.date}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mt-2">{active.title}</h2>

          {active.transcript.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{isZh ? "逐字稿" : "Transcript"}</h3>
                <button
                  onClick={copyTranscript}
                  className="text-xs text-[var(--primary)] hover:underline shrink-0"
                >
                  {copied ? (isZh ? "已复制 ✓" : "Copied ✓") : (isZh ? "复制全部" : "Copy all")}
                </button>
              </div>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                {active.transcript.map((seg, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-gray-300 tabular-nums shrink-0 w-12">{formatTime(seg.start)}</span>
                    <span className="text-gray-600 leading-relaxed">{seg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 讨论会列表 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {isZh ? "讨论会归档" : "Session archive"}
          </h3>
          <div className="space-y-1.5">
            {data.sessions.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  i === activeIndex ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="w-20 aspect-video bg-gray-900 rounded overflow-hidden shrink-0 relative">
                  {s.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- Cloudflare Stream 缩略图，不走 next/image 域名白名单
                    <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0.5 right-0.5 text-[10px] text-white bg-black/70 px-1 rounded">
                    {formatTime(s.durationSeconds)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">{s.date} · {s.topic}</div>
                  <div className={`text-sm leading-snug line-clamp-2 ${i === activeIndex ? "text-[var(--primary)] font-medium" : "text-gray-700"}`}>
                    {s.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
