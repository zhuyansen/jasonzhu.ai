import listData from "@/generated/image-prompts.json";
import type { ImageCaseSlim, ImageLibrary } from "./image-prompts-shared";

/**
 * ChatGPT Images 2.6 合集数据访问。源：src/content/image-prompts/chatgpt-images-2-6.json → scripts/generate-image-prompts.mjs
 * 只在服务端组件里引用——客户端组件引了会把整份 JSON 打进 JS 包。
 */
export * from "./image-prompts-shared";

const library = listData as unknown as ImageLibrary;

export function getImageLibrary(): ImageLibrary {
  return library;
}

export function getImageCase(id: string): ImageCaseSlim | undefined {
  return library.cases.find((c) => c.id === id);
}
