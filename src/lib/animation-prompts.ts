import listData from "@/generated/animation-prompts.json";
import type { AnimationCaseSlim, AnimationLibrary } from "./animation-prompts-shared";

/**
 * Claude 动画提示词库数据访问。源：src/content/animation-prompts/animation.json → scripts/generate-animation-prompts.mjs
 * 只在服务端组件里引用——客户端组件引了会把整份 JSON 打进 JS 包。
 */
export * from "./animation-prompts-shared";

const library = listData as unknown as AnimationLibrary;

export function getAnimationLibrary(): AnimationLibrary {
  return library;
}

export function getAnimationCase(id: string): AnimationCaseSlim | undefined {
  return library.cases.find((c) => c.id === id);
}
