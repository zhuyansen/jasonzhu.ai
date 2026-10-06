"use client";

import { useCallback, useEffect, useState } from "react";

type Digest = {
  slug: string;
  date: string;
  title: string;
  itemCount: number;
  aiSummary: string;
  humanComment: string;
  humanCommentEn: string;
  reviewedAt: string;
  indexable: boolean;
};

const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : ""}`,
});

/**
 * 快讯点评：给 AI 每日生成的快讯写 Jason 本人的点评。
 * 写了点评的那期才放开 Google 收录、进 sitemap；保存 = 提交到 GitHub → Vercel 自动部署（约 3–4 分钟生效）。
 */
export default function NewsCommentsTab() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [canSave, setCanSave] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todo" | "done" | "all">("todo");
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState({ comment: "", commentEn: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Record<string, string>>({}); // slug → 保存结果

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDigests(data.digests || []);
        setCanSave(Boolean(data.canSave));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const edit = (d: Digest) => {
    setOpen(d.slug);
    setDraft({ comment: d.humanComment, commentEn: d.humanCommentEn });
  };

  const save = async (slug: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice((n) => ({ ...n, [slug]: `❌ ${data.error || "保存失败"}` }));
        return;
      }
      setNotice((n) => ({
        ...n,
        [slug]: data.unchanged
          ? "没有改动"
          : draft.comment.trim()
            ? `✅ 已提交（${data.commit}），约 3–4 分钟后上线并放开收录`
            : `✅ 已撤回点评（${data.commit}），部署后该期重新 noindex`,
      }));
      // 本地先更新显示；服务器上的数据要等重新部署后才变
      setDigests((ds) =>
        ds.map((d) =>
          d.slug === slug
            ? { ...d, humanComment: draft.comment.trim(), humanCommentEn: draft.commentEn.trim(), indexable: Boolean(draft.comment.trim()) }
            : d
        )
      );
      setOpen(null);
    } catch {
      setNotice((n) => ({ ...n, [slug]: "❌ 网络错误，请重试" }));
    } finally {
      setSaving(false);
    }
  };

  const shown = digests.filter((d) => (filter === "all" ? true : filter === "done" ? d.indexable : !d.indexable));
  const doneCount = digests.filter((d) => d.indexable).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
        <p>
          快讯每天由 AI 自动生成并发布、发邮件。<b>只有写了点评的那期</b>才允许 Google 收录、进 sitemap；
          其余期数是 noindex。点评会显示在页面最上方的「Jason 说」，AI 写的那句标成「AI 摘要」。
        </p>
        <p>
          已点评 <b>{doneCount}</b> / {digests.length} 期。保存后会提交到 GitHub，约 3–4 分钟部署生效；清空点评再保存 = 撤回。
        </p>
        {!canSave && (
          <p className="text-amber-700">⚠️ Vercel 还没配 GITHUB_CONTENTS_TOKEN，现在可以看但还不能保存。</p>
        )}
      </div>

      <div className="flex gap-2">
        {([
          ["todo", "待点评"],
          ["done", "已点评"],
          ["all", "全部"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === k ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">加载中…</p>
      ) : (
        <div className="space-y-3">
          {shown.slice(0, 60).map((d) => (
            <div key={d.slug} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <a href={`/zh/news/${d.slug}`} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-blue-600">
                  {d.title} <span className="text-gray-400 font-normal">· {d.itemCount} 条</span>
                </a>
                <span className={`text-xs px-2 py-0.5 rounded-full ${d.indexable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.indexable ? "已点评 · 可收录" : "未点评 · noindex"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">AI 摘要：{d.aiSummary || "（无）"}</p>
              {d.humanComment && open !== d.slug && (
                <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">💡 {d.humanComment}</p>
              )}
              {notice[d.slug] && <p className="text-xs mt-2 text-gray-600">{notice[d.slug]}</p>}

              {open === d.slug ? (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs text-gray-500" htmlFor={`c-${d.slug}`}>
                    你的点评（中文，必填；清空再保存 = 撤回）
                  </label>
                  <textarea
                    id={`c-${d.slug}`}
                    value={draft.comment}
                    onChange={(e) => setDraft((x) => ({ ...x, comment: e.target.value }))}
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    placeholder="今天最值得关注的是……我的判断是……"
                  />
                  <label className="block text-xs text-gray-500" htmlFor={`ce-${d.slug}`}>
                    English（可选；不填则英文页显示中文原话）
                  </label>
                  <textarea
                    id={`ce-${d.slug}`}
                    value={draft.commentEn}
                    onChange={(e) => setDraft((x) => ({ ...x, commentEn: e.target.value }))}
                    rows={2}
                    maxLength={2000}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving || !canSave}
                      onClick={() => save(d.slug)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
                    >
                      {saving ? "提交中…" : "保存并发布"}
                    </button>
                    <button type="button" onClick={() => setOpen(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => edit(d)} className="mt-3 text-sm text-blue-600 hover:underline">
                  {d.humanComment ? "修改点评" : "写点评"}
                </button>
              )}
            </div>
          ))}
          {shown.length === 0 && <p className="text-sm text-gray-400">没有符合条件的期数。</p>}
        </div>
      )}
    </div>
  );
}
