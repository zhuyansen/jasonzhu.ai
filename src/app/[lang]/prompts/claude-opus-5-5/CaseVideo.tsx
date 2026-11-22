"use client";

import { useRef, useState } from "react";

interface Props {
  id: string;
  poster: string;
  mp4: string;
  postUrl: string;
  label: string;
  isZh: boolean;
}

/**
 * 站内播放 X 原视频。video.twimg.com 对带外站 Referer 的请求返回 403，
 * 所以这组页面必须是 referrer=no-referrer（见 page.tsx metadata + next.config headers）。
 * 加载失败（链接失效 / 作者删帖）时退回「去 X 看原视频」。
 */
export default function CaseVideo({ id, poster, mp4, postUrl, label, isZh }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);

  // 同一时间只播一个，避免多个视频叠音
  const pauseOthers = () => {
    document.querySelectorAll<HTMLVideoElement>("video[data-opus-case]").forEach((v) => {
      if (v !== ref.current && !v.paused) v.pause();
    });
  };

  const startPlay = () => {
    const el = ref.current;
    if (!el) return;
    setStarted(true);
    pauseOthers();
    el.play().catch(() => {
      /* 浏览器拦截自动播时保留原生 controls 让用户操作 */
    });
  };

  if (failed) {
    return (
      <a
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-300 text-sm hover:text-white transition-colors"
      >
        <span className="text-2xl">↗</span>
        {isZh ? "视频加载失败，去 X 看原视频" : "Video unavailable — watch on X"}
      </a>
    );
  }

  return (
    <>
      <video
        ref={ref}
        data-opus-case={id}
        controls
        playsInline
        preload="none"
        poster={poster}
        src={mp4}
        aria-label={label}
        onPlay={() => {
          setStarted(true);
          pauseOthers();
        }}
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-contain bg-black"
      />
      {!started && (
        <button
          type="button"
          onClick={startPlay}
          aria-label={isZh ? `播放视频：${label}` : `Play video: ${label}`}
          className="group/play absolute inset-0 z-[1] flex items-center justify-center bg-black/15 hover:bg-black/25 transition-colors cursor-pointer"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/25 transition-transform group-hover/play:scale-110">
            <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </span>
        </button>
      )}
    </>
  );
}
