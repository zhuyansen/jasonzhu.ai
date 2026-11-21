// 出海专题各页共用的样式和小组件（首页 page.tsx 和拆出去的 SEO / GEO 页面都用）
export const OUT = { target: "_blank", rel: "noopener noreferrer" } as const;
// 每一步是一块浅灰底的面板，面板里的卡片是白底，分区一眼能看出来（用户 10-17 要求「界限分明」）
export const PANEL = "mb-10 scroll-mt-24 rounded-3xl border border-gray-200 bg-gray-100/60 p-5 md:p-6";
export const BOX = "rounded-2xl border border-gray-200 bg-white p-4";
export const CARD = "block rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors";

/** Google 文档和 Looker Studio 模板默认链中文版，英文页换成英文版 */
export function hl(url: string, l: "zh" | "en"): string {
  return l === "en" ? url.replace("hl=zh-cn", "hl=en") : url;
}

export type PostRef = { url: string; date: string; title: { zh: string; en: string } };

export function FromMyPost({ post, lang }: { post: PostRef; lang: "zh" | "en" }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {lang === "zh" ? "出自我的帖子" : "From my post"}{" "}
      <a href={post.url} {...OUT} className="text-blue-600 hover:underline">
        「{post.title[lang]}」
      </a>{" "}
      {post.date}
    </p>
  );
}
