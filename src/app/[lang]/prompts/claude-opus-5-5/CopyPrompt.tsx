"use client";

import { useState } from "react";

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
