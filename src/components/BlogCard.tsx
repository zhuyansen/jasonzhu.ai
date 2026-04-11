import Link from "next/link";
import type { BlogPost } from "@/lib/mdx";

const categoryColors: Record<string, string> = {
  "AI工具": "bg-blue-50 text-blue-700",
  "教程": "bg-green-50 text-green-700",
  "观点": "bg-purple-50 text-purple-700",
  "案例": "bg-orange-50 text-orange-700",
  "Vibe Coding": "bg-pink-50 text-pink-700",
};

export default function BlogCard({ post, lang = "zh" }: { post: BlogPost; lang?: string }) {
  const colorClass = categoryColors[post.category] || "bg-gray-50 text-gray-600";

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {post.category}
        </span>
        <span className="text-xs text-gray-400">{post.date}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors mb-2">
        {post.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
        {post.excerpt}
      </p>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gray-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
