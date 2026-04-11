"use client";

import { useEffect, useState } from "react";

export default function LikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check localStorage for existing like
    const hasLiked = localStorage.getItem(`liked_${slug}`) === "true";
    setLiked(hasLiked);

    // Fetch current count
    fetch(`/api/likes/${slug}`)
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => {});
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: "POST" });
      const data = await res.json();
      setCount(data.count ?? count + 1);
      setLiked(true);
      localStorage.setItem(`liked_${slug}`, "true");
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
        liked
          ? "border-red-200 bg-red-50 text-red-500 cursor-default"
          : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 cursor-pointer"
      }`}
    >
      <svg
        className={`w-5 h-5 transition-transform duration-300 ${
          animating ? "scale-125" : "scale-100"
        }`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
