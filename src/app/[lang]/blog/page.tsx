import type { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/mdx";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  return {
    title: dict.blog.title,
    description: dict.blog.desc,
  };
}

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
