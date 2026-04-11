import { getAllPosts, getCategories } from "@/lib/mdx";
import BlogListClient from "./BlogListClient";

export const metadata = {
  title: "博客",
  description: "AI工具评测、实战教程、行业洞察",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getCategories();

  return <BlogListClient posts={posts} categories={categories} />;
}
