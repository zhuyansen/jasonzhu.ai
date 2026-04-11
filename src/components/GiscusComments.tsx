"use client";

import Giscus from "@giscus/react";

const LOCALE_MAP: Record<string, string> = {
  zh: "zh-CN",
  en: "en",
};

export default function GiscusComments({ lang }: { lang: string }) {
  return (
    <Giscus
      repo="zhuyansen/jasonzhu.ai"
      repoId="R_kgDOR_pAuw"
      category="Announcements"
      categoryId="DIC_kwDOR_pAu84C6mpu"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang={LOCALE_MAP[lang] || "en"}
      loading="lazy"
    />
  );
}
