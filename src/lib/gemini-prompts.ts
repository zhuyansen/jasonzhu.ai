import listData from "@/generated/gemini-prompts.json";
import type { GeminiCaseSlim, GeminiLibrary } from "./gemini-prompts-shared";

/**
 * Gemini 4 合集数据访问。源：src/content/gemini-prompts/gemini-4.json → scripts/generate-gemini-prompts.mjs
 * 只在服务端组件里引用——客户端组件引了会把整份 JSON 打进 JS 包。
 */
export * from "./gemini-prompts-shared";

const library = listData as unknown as GeminiLibrary;

export function getGeminiLibrary(): GeminiLibrary {
  return library;
}

export function getGeminiCase(id: string): GeminiCaseSlim | undefined {
  return library.cases.find((c) => c.id === id);
}
