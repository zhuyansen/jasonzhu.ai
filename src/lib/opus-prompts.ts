import listData from "@/generated/opus-prompts.json";
import type { OpusCaseSlim, OpusLibrary } from "./opus-prompts-shared";

/**
 * Opus 5.5 提示词库数据访问。源：src/content/opus-prompts/cases.json → scripts/generate-opus-prompts.mjs
 * 只在服务端组件里引用——客户端组件引了会把整份 JSON 打进 JS 包。
 */
export * from "./opus-prompts-shared";

const library = listData as unknown as OpusLibrary;

export function getOpusLibrary(): OpusLibrary {
  return library;
}

export function getOpusCase(id: string): OpusCaseSlim | undefined {
  return library.cases.find((c) => c.id === id);
}
