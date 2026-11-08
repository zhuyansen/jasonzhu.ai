"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { track } from "@/lib/track";

/**
 * 提示词宇宙：public/universe/index.html（three.js 星图，每个作品一颗星）用 iframe 嵌进来。
 * - embed：提示词页顶部的横幅（2026-11-08 起替换「本周最火」：那三张卡一周只被点开 9 次）。等浏览器空闲再加载，不拖慢首屏。
 * - full：/prompts/claude-opus-5-5/universe 全屏页。
 * 星图里点「看这个作品」会在本窗口打开作品页，同时 postMessage 过来，这里记一次 universe_star。
 */
export default function UniverseFrame({ lang, total, mode = "embed" }: { lang: "zh" | "en"; total: number; mode?: "embed" | "full" }) {
  const isZh = lang === "zh";
  const url = `/universe/index.html?lang=${lang}${mode === "embed" ? "&embed=1" : ""}`;
  const [src, setSrc] = useState<string | null>(mode === "full" ? url : null);   // 全屏页直接加载；嵌在列表页时等空闲
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (mode === "full") return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setSrc(url), { timeout: 1500 }); return () => w.cancelIdleCallback?.(id); }
    const t = setTimeout(() => setSrc(url), 600);
    return () => clearTimeout(t);
  }, [url, mode]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "universe:open") return;
      track("universe_star", { id: String(e.data.id), where: mode });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [mode]);

  const frame = (
    <div
      className={`relative overflow-hidden bg-[#06060e] ${mode === "full" ? "h-[calc(100dvh-4rem)]" : "h-[400px] sm:h-[460px] rounded-2xl ring-1 ring-black/10"}`}
      style={{ backgroundImage: "radial-gradient(90% 70% at 60% 45%, #0d1226 0%, #06060e 65%)" }}
    >
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-xs tracking-[0.2em] text-[#a59e8c]" aria-hidden="true">
          {isZh ? "星图展开中…" : "Unfolding the star map…"}
        </div>
      )}
      {src && (
        <iframe
          src={src}
          title={isZh ? "提示词宇宙：每个作品一颗星" : "Prompt Universe: one star per work"}
          onLoad={() => setReady(true)}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );

  if (mode === "full") return frame;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">🌌 {isZh ? "提示词宇宙" : "Prompt Universe"}</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {isZh
              ? `${total.toLocaleString("zh-CN")} 个作品，一个作品一颗星，按分类排成 8 个星座。拖动看看，点一颗星打开作品`
              : `${total.toLocaleString("en-US")} works, one star each, in 8 constellations by category. Drag to look around, click a star to open it`}
          </p>
        </div>
        <Link
          href={`/${lang}/prompts/claude-opus-5-5/universe`}
          onClick={() => track("universe_fullscreen", { where: "embed" })}
          className="shrink-0 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
        >
          {isZh ? "全屏看 ↗" : "Full screen ↗"}
        </Link>
      </div>
      {frame}
    </section>
  );
}
