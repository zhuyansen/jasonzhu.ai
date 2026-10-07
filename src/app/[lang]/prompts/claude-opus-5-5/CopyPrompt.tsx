"use client";

import { useState } from "react";
import { track } from "@/lib/track";

interface Props {
  /** 已有全文就直接传；否则传 id，点击时从静态 JSON 拉 */
  text?: string;
  id?: string;
  isZh: boolean;
  className?: string;
}

export async function loadPrompt(id: string): Promise<string> {
  const res = await fetch(`/data/opus-prompts/${id}.json`);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()).prompt as string;
}

export default function CopyPrompt({ text, id, isZh, className }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      const full = text ?? (id ? await loadPrompt(id) : "");
      await navigator.clipboard.writeText(full);
      setState("copied");
      track("prompt_copy", { id });
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      onClick={copy}
      className={
        className ??
        "px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
      }
    >
      {state === "copied"
        ? isZh ? "已复制 ✓" : "Copied ✓"
        : state === "error"
          ? isZh ? "复制失败" : "Copy failed"
          : isZh ? "复制提示词" : "Copy prompt"}
    </button>
  );
}

/** claude.ai 的 ?q= 预填太长会被截断或打不开：超过这个长度只复制、打开空白对话让用户粘贴 */
const MAX_PREFILL = 3000;

/**
 * 「在 Claude 里试试」：拉全文 → 先复制到剪贴板（预填失败也能直接粘贴）→ 新标签打开 claude.ai，短提示词用 ?q= 预填。
 * 对应 revid 的「Use as prompt」，但导向 Claude 本身。
 */
export function TryInClaude({ text, id, isZh, className }: Props) {
  const [state, setState] = useState<"idle" | "opened" | "pasteHint" | "error">("idle");

  async function open() {
    // 先同步打开新标签，避免拉取全文的 await 之后被浏览器当成弹窗拦截
    const win = window.open("about:blank", "_blank");
    try {
      const full = text ?? (id ? await loadPrompt(id) : "");
      try {
        await navigator.clipboard.writeText(full);
      } catch {
        /* 剪贴板不可用时只靠预填 */
      }
      const long = full.length > MAX_PREFILL;
      const url = long ? "https://claude.ai/new" : `https://claude.ai/new?q=${encodeURIComponent(full)}`;
      if (win) win.location.href = url;
      else window.open(url, "_blank");
      setState(long ? "pasteHint" : "opened");
      track("prompt_try_claude", { id, long });
    } catch {
      win?.close();
      setState("error");
    }
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <button
      onClick={open}
      className={
        className ??
        "px-3 py-1.5 text-xs font-medium rounded-lg border border-[#d97757]/40 text-[#c2410c] hover:bg-orange-50 transition-colors"
      }
      title={isZh ? "复制提示词并在 claude.ai 打开" : "Copy the prompt and open it in claude.ai"}
    >
      {state === "opened"
        ? isZh ? "已在 Claude 打开 ✓" : "Opened in Claude ✓"
        : state === "pasteHint"
          ? isZh ? "已复制，粘贴到 Claude" : "Copied: paste in Claude"
          : state === "error"
            ? isZh ? "打开失败" : "Couldn't open"
            : isZh ? "在 Claude 里试试 ↗" : "Try in Claude ↗"}
    </button>
  );
}
