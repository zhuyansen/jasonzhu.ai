/**
 * 从 markdown 正文提取 FAQ 段落，生成 FAQPage JSON-LD。
 * 约定：文章里出现 `## 常见问题` 或 `## FAQ` 段落时，
 * 其下每个 `### 问题` + 后续文本（到下一个 ### 或 ## 为止）算一组 Q&A。
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export function extractFaq(content: string): FaqItem[] {
  const sectionMatch = content.match(
    /^##\s+(?:常见问题|FAQ)[^\n]*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/m
  );
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const items: FaqItem[] = [];
  const qaRegex = /^###\s+(.+)\n([\s\S]*?)(?=^###\s|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = qaRegex.exec(section)) !== null) {
    const question = m[1].trim();
    // 去掉 markdown 标记，留纯文本给 schema
    const answer = m[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`>#]/g, "")
      .replace(/\n{2,}/g, " ")
      .replace(/\n/g, " ")
      .trim();
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
