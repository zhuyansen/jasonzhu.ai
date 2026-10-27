import type { Metadata } from "next";
import Link from "@/components/Link";
import fullData from "@/generated/opus-prompts-full.json";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { MODEL_LABEL, categoryLabel, formatCount, type OpusCaseSlim } from "@/lib/opus-prompts-shared";
import CopyPrompt, { TryInClaude } from "../CopyPrompt";

/**
 * 订阅奖励：播放最高的 50 个带完整提示词的作品（2026-10-27，英文提示词库订阅入口 PromptsSubscribe 解锁）。
 * 同款提示词只留播放最高的一条。不收录、不进 sitemap：内容和各作品详情页重复，是给订阅者的合集。
 */
const PATH = "prompts/claude-opus-5-5";
const N = 50;
const full = fullData as Record<string, { prompt: string | null }>;

function top50(): (OpusCaseSlim & { text: string })[] {
  const seen = new Set<string>();
  const out: (OpusCaseSlim & { text: string })[] = [];
  for (const c of [...getOpusLibrary().cases].sort((a, b) => b.stats.views - a.stats.views)) {
    if (c.prompt?.kind !== "full") continue;
    const key = c.group?.key ?? c.id;
    const text = full[c.id]?.prompt;
    if (seen.has(key) || !text) continue;
    seen.add(key);
    out.push({ ...c, text });
    if (out.length === N) break;
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: isZh ? "播放最高的 50 个 Claude 5.5 视频提示词（完整原文）" : "Top 50 Claude 5.5 Video Prompts, Full Text",
    robots: { index: false, follow: true },
    referrer: "no-referrer",
  };
}

export default async function Top50Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const isZh = lang === "zh";
  const list = top50();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href={`/${lang}/${PATH}`} className="text-sm text-gray-500 hover:text-[var(--primary)]">
        ← {isZh ? "Claude 5.5 提示词库" : "Claude 5.5 prompt library"}
      </Link>
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
        {isZh ? `播放最高的 ${list.length} 个 Claude 5.5 视频提示词` : `The ${list.length} most-viewed Claude 5.5 video prompts`}
      </h1>
      <p className="mt-2 text-gray-600 leading-relaxed">
        {isZh
          ? "按原帖播放量排序，只收作者公开的完整提示词，原文照录；同一条提示词被多人复用时只留播放最高的一个。点标题看视频和出处。"
          : "Ranked by views on the original post. Only full prompts the creator shared, copied verbatim; when many people reused the same prompt, only the most-viewed one is kept. Click a title for the video and the source."}
      </p>

      <ol className="mt-8 space-y-4">
        {list.map((c, i) => (
          <li key={c.id} className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-7 shrink-0 text-right font-bold tabular-nums text-gray-300">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/${lang}/${PATH}/${c.id}`} className="font-semibold text-gray-900 hover:text-[var(--primary)]">
                  {isZh ? c.title.zh : c.title.en}
                </Link>
                <p className="mt-1 text-xs text-gray-500">
                  {c.models.map((m) => MODEL_LABEL[m]).join(" / ")} · {categoryLabel(c.category, lang)} ·{" "}
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">@{c.author.handle}</a> ·{" "}
                  {formatCount(c.stats.views, lang)} {isZh ? "播放" : "views"}
                  {c.referenceAssets && (isZh ? " · 需自备参考素材" : " · needs your own reference files")}
                </p>
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-sm text-[var(--primary)] select-none">
                    {isZh ? `展开提示词（${c.text.length.toLocaleString("en-US")} 字符）` : `Show prompt (${c.text.length.toLocaleString("en-US")} characters)`}
                  </summary>
                  <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">{c.text}</pre>
                </details>
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* 传 id、点击时再拉全文：全文已经在 <pre> 里渲染了一次，不要再塞进客户端组件的 props 里翻倍页面体积 */}
                  <CopyPrompt id={c.id} isZh={isZh} />
                  <TryInClaude id={c.id} isZh={isZh} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
