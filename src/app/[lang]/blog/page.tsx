import { getAllPosts, getCategories } from "@/lib/mdx";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import BlogListClient from "./BlogListClient";

export const metadata = {
  title: "博客",
  description: "AI工具评测、实战教程、行业洞察",
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  const posts = getAllPosts();
  const categories = getCategories();

  return (
    <BlogListClient
      posts={posts}
      categories={categories}
      lang={lang}
      dict={dict.blog}
    />
  );
}
