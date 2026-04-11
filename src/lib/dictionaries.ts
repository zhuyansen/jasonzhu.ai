import type zhDict from "@/dictionaries/zh.json";

export type Dictionary = typeof zhDict;
export type Locale = "zh" | "en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  zh: () => import("@/dictionaries/zh.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export const locales: Locale[] = ["zh", "en"];
export const defaultLocale: Locale = "zh";
