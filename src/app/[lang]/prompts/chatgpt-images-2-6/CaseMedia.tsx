"use client";

import { useEffect, useRef, useState } from "react";
import CaseVideo from "../claude-opus-5-5/CaseVideo";
import { pbsSized, type ImageMedia } from "@/lib/image-prompts-shared";

interface Props {
  id: string;
  media: ImageMedia[];
  postUrl: string;
  label: string;
  isZh: boolean;
  /** card：卡片里的方图拼贴；detail：详情页逐张完整显示 */
  variant: "card" | "detail";
}

function Unavailable({ postUrl, isZh }: { postUrl: string; isZh: boolean }) {
  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500 text-sm hover:text-gray-900 transition-colors"
    >
      <span className="text-2xl">↗</span>
      {isZh ? "加载失败，去 X 看原帖" : "Unavailable — view on X"}
    </a>
  );
}

/** GIF（X 上是 mp4）：静音循环，只在进入视口时播放，离开就暂停 */
function GifLoop({ m, postUrl, label, isZh, fit }: { m: ImageMedia; postUrl: string; label: string; isZh: boolean; fit: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  if (failed) return <Unavailable postUrl={postUrl} isZh={isZh} />;
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={m.poster}
      src={m.url}
      aria-label={label}
      onError={() => setFailed(true)}
      className={`absolute inset-0 w-full h-full ${fit} bg-black`}
    />
  );
}

function Photo({ m, label, size, fit, eager }: { m: ImageMedia; label: string; size: "small" | "large"; fit: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="absolute inset-0 bg-gray-100" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- X 的图片 CDN 外链，不走 next/image（不占图片优化额度）
    <img
      src={pbsSized(m.url, size)}
      alt={label}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`absolute inset-0 w-full h-full ${fit}`}
    />
  );
}

export default function CaseMedia({ id, media, postUrl, label, isZh, variant }: Props) {
  if (variant === "detail") {
    return (
      <div className="space-y-3">
        {media.map((m, i) => {
          const ratio = m.width && m.height ? `${m.width} / ${m.height}` : "1 / 1";
          return (
            <div key={i} className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100" style={{ aspectRatio: ratio }}>
              {m.type === "photo" && <Photo m={m} label={`${label} ${i + 1}`} size="large" fit="object-contain" eager={i === 0} />}
              {m.type === "gif" && <GifLoop m={m} postUrl={postUrl} label={label} isZh={isZh} fit="object-contain" />}
              {m.type === "video" && <CaseVideo id={id} poster={m.poster || ""} mp4={m.url} postUrl={postUrl} label={label} isZh={isZh} />}
            </div>
          );
        })}
      </div>
    );
  }

  // 卡片：最多 4 个拼成方格；第一个是 GIF / 视频时整格给它
  const first = media[0];
  if (first.type !== "photo") {
    return (
      <div className="relative aspect-square bg-black">
        {first.type === "gif" ? <GifLoop m={first} postUrl={postUrl} label={label} isZh={isZh} fit="object-cover" />
          : <CaseVideo id={id} poster={first.poster || ""} mp4={first.url} postUrl={postUrl} label={label} isZh={isZh} />}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold tracking-wide pointer-events-none">
          {first.type === "gif" ? "GIF" : isZh ? "视频" : "VIDEO"}
        </span>
      </div>
    );
  }
  const photos = media.filter((m) => m.type === "photo").slice(0, 4);
  const grid = photos.length === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`relative aspect-square grid ${grid} gap-0.5 bg-gray-100`}>
      {photos.map((m, i) => (
        <div key={i} className={`relative ${photos.length === 3 && i === 0 ? "row-span-2" : ""}`}>
          <Photo m={m} label={`${label} ${i + 1}`} size="small" fit="object-cover" />
        </div>
      ))}
    </div>
  );
}
