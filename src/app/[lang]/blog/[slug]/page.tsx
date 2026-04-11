import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.flatMap((post) => [
    { lang: "zh", slug: post.slug },
    { lang: "en", slug: post.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back link */}
      <Link
        href={`/${lang}/blog`}
        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-8"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {dict.blog.backToBlog}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {post.category}
          </span>
          <span className="text-sm text-gray-400">{post.date}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose">
        <MDXRemote source={post.content} />
      </div>

      {/* Subscribe CTA */}
      <div className="mt-12">
        <SubscribeForm source={`blog-${slug}`} lang={lang} dict={dict} />
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Jason Zhu</p>
            <p className="text-sm text-gray-500">{dict.blog.authorTitle}</p>
          </div>
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {dict.blog.followOnX}
          </a>
        </div>
      </div>
    </article>
  );
}
