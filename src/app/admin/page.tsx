"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  filename?: string;
};

type ImageInfo = {
  name: string;
  url: string;
};

type Subscriber = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

async function adminFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${sessionStorage.getItem("admin_token")}`,
    },
  });
}

const DEFAULT_CATEGORIES = ["教程", "AI工具", "观点", "案例", "Vibe Coding"];

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "articles" | "images" | "subscribers"
  >("articles");

  // Articles state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    category: "",
    tags: "",
    excerpt: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [customCategory, setCustomCategory] = useState(false);

  // Images state
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Views state
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // Subscribers state
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      verifyExistingSession(token);
    }
  }, []);

  const verifyExistingSession = async (token: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAuthed(true);
      } else {
        sessionStorage.removeItem("admin_token");
      }
    } catch {
      setAuthError("Network error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("admin_token", data.token);
        setIsAuthed(true);
      } else if (res.status === 429) {
        setAuthError("Too many attempts. Please wait a moment.");
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Network error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      try {
        await fetch("/api/admin/login", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best-effort revocation
      }
    }
    sessionStorage.removeItem("admin_token");
    setIsAuthed(false);
    setPassword("");
    setPosts([]);
    setImages([]);
    setRecentSubscribers([]);
  };

  // ── Articles ──

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await adminFetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);

        // Fetch view counts from Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: views } = await supabase
            .from("page_views")
            .select("slug, count");
          if (views) {
            const counts: Record<string, number> = {};
            for (const v of views) {
              counts[v.slug] = v.count;
            }
            setViewCounts(counts);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      date: post.date,
      category: post.category,
      tags: post.tags.join(", "),
      excerpt: post.excerpt || "",
    });
    setSaveMessage("");
    setCustomCategory(false);
  };

  const closeEditModal = () => {
    setEditingPost(null);
    setSaveMessage("");
    setCustomCategory(false);
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    setSaveLoading(true);
    setSaveMessage("");
    try {
      const res = await adminFetch(`/api/admin/posts/${editingPost.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: {
            title: editForm.title,
            date: editForm.date,
            category: editForm.category,
            tags: editForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            excerpt: editForm.excerpt,
          },
        }),
      });
      if (res.ok) {
        setSaveMessage("Saved successfully");
        fetchPosts();
        setTimeout(() => closeEditModal(), 1000);
      } else {
        setSaveMessage("Failed to save");
      }
    } catch {
      setSaveMessage("Network error");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Images ──

  const fetchImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      const res = await adminFetch("/api/admin/upload");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch {
      // ignore
    } finally {
      setImagesLoading(false);
    }
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadedUrl("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedUrl(data.url);
        fetchImages();
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(id || text);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      // ignore
    }
  };

  // ── Subscribers ──

  const fetchSubscribers = useCallback(async () => {
    setSubscribersLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { count } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true });

      setSubscriberCount(count ?? 0);

      const { data } = await supabase
        .from("subscribers")
        .select("id, email, source, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentSubscribers((data as Subscriber[]) ?? []);
    } catch {
      // ignore
    } finally {
      setSubscribersLoading(false);
    }
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAuthed) return;
    if (activeTab === "articles") fetchPosts();
    if (activeTab === "images") fetchImages();
    if (activeTab === "subscribers") fetchSubscribers();
  }, [isAuthed, activeTab, fetchPosts, fetchImages, fetchSubscribers]);

  // Derived: all categories and tags from posts
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...posts.map((p) => p.category).filter(Boolean)])
  );
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).sort();

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterTag && !(p.tags || []).includes(filterTag)) return false;
    return true;
  });

  // ── Login Screen ──

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-200"
        >
          <h1 className="text-xl font-bold mb-6 text-gray-900">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent"
            autoFocus
          />
          {authError && (
            <p className="text-red-500 text-sm mb-4">{authError}</p>
          )}
          <button
            type="submit"
            disabled={authLoading || !password}
            className="w-full py-2 bg-[var(--primary,#3b82f6)] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {authLoading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ──

  const tabs = [
    { key: "articles" as const, label: "Articles" },
    { key: "images" as const, label: "Images" },
    { key: "subscribers" as const, label: "Subscribers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--primary,#3b82f6)] text-[var(--primary,#3b82f6)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* ── Articles Tab ── */}
        {activeTab === "articles" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              {(filterCategory || filterTag) && (
                <button
                  onClick={() => { setFilterCategory(""); setFilterTag(""); }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <span className="px-3 py-2 text-sm text-gray-400">
                {filteredPosts.length} / {posts.length} articles
              </span>
            </div>

            {postsLoading ? (
              <p className="text-gray-500">Loading articles...</p>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">
                        Title
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">
                        Category
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">
                        Tags
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">
                        Views
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.slug}
                        onClick={() => openEditModal(post)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {post.category}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {post.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {post.date}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                          {viewCounts[post.slug] ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`/zh/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              View
                            </a>
                            <a
                              href={`obsidian://open?vault=jasonzhu.ai&file=src%2Fcontent%2Fblog%2F${post.filename || post.slug + ".mdx"}`}
                              className="inline-flex items-center px-2.5 py-1 text-xs text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                            >
                              Obsidian
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {posts.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No articles found
                  </p>
                )}
              </div>
            )}

            {/* Edit Modal */}
            {editingPost && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Edit Article
                      </h2>
                      <button
                        onClick={closeEditModal}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        {customCategory ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({ ...editForm, category: e.target.value })
                              }
                              placeholder="Enter custom category"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setCustomCategory(false)}
                              className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Select
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={allCategories.includes(editForm.category) ? editForm.category : ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, category: e.target.value })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm"
                            >
                              <option value="">Select category</option>
                              {allCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setCustomCategory(true)}
                              className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Custom
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editForm.tags}
                          onChange={(e) =>
                            setEditForm({ ...editForm, tags: e.target.value })
                          }
                          placeholder="tag1, tag2, tag3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Excerpt
                        </label>
                        <textarea
                          value={editForm.excerpt}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              excerpt: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary,#3b82f6)] focus:border-transparent text-sm resize-vertical"
                        />
                      </div>
                    </div>

                    {saveMessage && (
                      <p
                        className={`mt-4 text-sm ${
                          saveMessage.includes("success")
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {saveMessage}
                      </p>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSavePost}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-[var(--primary,#3b82f6)] text-white rounded-md hover:opacity-90 disabled:opacity-50 text-sm transition-opacity"
                      >
                        {saveLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Images Tab ── */}
        {activeTab === "images" && (
          <div>
            {/* Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[var(--primary,#3b82f6)] bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploading ? (
                <p className="text-gray-500">Uploading...</p>
              ) : (
                <>
                  <div className="text-4xl text-gray-300 mb-3">+</div>
                  <p className="text-gray-500 text-sm">
                    Drag & drop an image here, or click to select
                  </p>
                </>
              )}
            </div>

            {/* Uploaded URL */}
            {uploadedUrl && (
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <code className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md overflow-x-auto">
                  {uploadedUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(uploadedUrl, "uploaded")}
                  className="px-3 py-2 bg-[var(--primary,#3b82f6)] text-white text-sm rounded-md hover:opacity-90 whitespace-nowrap transition-opacity"
                >
                  {copyFeedback === "uploaded" ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            {/* Image Gallery */}
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-500 mb-4">
                Existing Images
              </h2>
              {imagesLoading ? (
                <p className="text-gray-500">Loading images...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.name}
                      onClick={() => copyToClipboard(img.url, img.name)}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {copyFeedback === img.name
                              ? "Copied!"
                              : "Click to copy URL"}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-xs text-gray-500 truncate">
                          {img.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!imagesLoading && images.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No images uploaded yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Subscribers Tab ── */}
        {activeTab === "subscribers" && (
          <div>
            {subscribersLoading ? (
              <p className="text-gray-500">Loading subscribers...</p>
            ) : (
              <>
                {/* Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-1">
                    Total Subscribers
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {subscriberCount}
                  </p>
                </div>

                {/* Recent Subscribers */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-sm font-medium text-gray-600">
                      Recent Subscribers
                    </h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2 font-medium text-gray-500">
                          Email
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">
                          Source
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubscribers.map((sub) => (
                        <tr
                          key={sub.id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2.5 text-gray-900">
                            {sub.email}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {sub.source || "direct"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {new Date(sub.created_at).toLocaleDateString(
                              "zh-CN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentSubscribers.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No subscribers yet
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
