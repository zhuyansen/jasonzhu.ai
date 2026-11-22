"use client";

import { useState } from "react";

interface Props {
  /** 封面（pbs.twimg.com）。带本站 Referer 也能正常加载（2026-11-21 用 curl 抽查 30 张，都是 200） */
  poster: string;
  /** 原帖网址 */
  postUrl: string;
  label: string;
  isZh: boolean;
  /** gif：X 上的动图（X 存成 mp4，和视频走同一个 CDN） */
  kind?: "video" | "gif";
  /** 卡片里的方形动图用 cover 铺满；其余照原比例放 */
  fit?: "contain" | "cover";
  /** 详情页首屏的封面不懒加载 */
  eager?: boolean;
}

/**
 * X 视频 / 动图的封面卡：封面图加「在 X 上看原视频」，整块点开去原帖。
 * 2026-11-21 起不在站内播放：video.twimg.com 对带外站 Referer 的请求返回 403，以前用 referrer=no-referrer 绕过去，
 * X 条款不允许绕开它设的技术限制（https://x.com/en/tos ）。也不用 X 的 widgets.js：它会写第三方 Cookie，还要过同意横幅。
 * 封面加载失败（作者删帖、链接失效）时只留文字卡片和链接。
 */
export default function CaseVideo({ poster, postUrl, label, isZh, kind = "video", fit = "contain", eager = false }: Props) {
  const [failed, setFailed] = useState(!poster);
  const cta = kind === "gif" ? (isZh ? "在 X 上看动图" : "Watch the GIF on X") : isZh ? "在 X 上看原视频" : "Watch on X";

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={isZh ? `${cta}：${label}` : `${cta}: ${label}`}
      className="group/x absolute inset-0 block bg-gray-900"
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- X 的图片 CDN 外链，不走 next/image
        <img
          src={poster}
          alt={label}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
        />
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 transition-colors group-hover/x:bg-black/35">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/25 transition-transform group-hover/x:scale-110">
          <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </span>
        <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white shadow">{cta} ↗</span>
      </span>
    </a>
  );
}
