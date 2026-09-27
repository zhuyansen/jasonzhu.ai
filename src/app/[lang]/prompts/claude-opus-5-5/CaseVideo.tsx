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

  // 同一时间只播一个，避免多个视频叠音
  const pauseOthers = () => {
    document.querySelectorAll<HTMLVideoElement>("video[data-opus-case]").forEach((v) => {
      if (v !== ref.current && !v.paused) v.pause();
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
    <video
      ref={ref}
      data-opus-case={id}
      controls
      playsInline
      preload="none"
      poster={poster}
      src={mp4}
      aria-label={label}
      onPlay={pauseOthers}
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-contain bg-black"
    />
  );
}
