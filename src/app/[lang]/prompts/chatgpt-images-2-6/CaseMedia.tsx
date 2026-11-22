"use client";

import { useState } from "react";
import CaseVideo from "../claude-opus-5-5/CaseVideo";
import { pbsSized, type ImageMedia } from "@/lib/image-prompts-shared";

interface Props {
  media: ImageMedia[];
  postUrl: string;
  label: string;
  isZh: boolean;
  /** card：卡片里的方图拼贴；detail：详情页逐张完整显示 */
  variant: "card" | "detail";
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

/** GIF 和视频都在 X 的视频 CDN 上（带外站 Referer 返回 403），只放封面和去原帖的链接，见 CaseVideo */
export default function CaseMedia({ media, postUrl, label, isZh, variant }: Props) {
  if (variant === "detail") {
    return (
      <div className="space-y-3">
        {media.map((m, i) => {
          const ratio = m.width && m.height ? `${m.width} / ${m.height}` : "1 / 1";
          return (
            <div key={i} className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100" style={{ aspectRatio: ratio }}>
              {m.type === "photo" && <Photo m={m} label={`${label} ${i + 1}`} size="large" fit="object-contain" eager={i === 0} />}
              {m.type !== "photo" && <CaseVideo kind={m.type} poster={m.poster || ""} postUrl={postUrl} label={label} isZh={isZh} eager={i === 0} />}
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
        <CaseVideo kind={first.type} fit={first.type === "gif" ? "cover" : "contain"} poster={first.poster || ""} postUrl={postUrl} label={label} isZh={isZh} />
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
