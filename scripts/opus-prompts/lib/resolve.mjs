/**
 * 对账：模型只说「提示词在哪条推文、从哪到哪」，原文由代码从源推文里切出来。
 * 切不出来（不是逐字子串）就报错，由调用方决定重试还是放弃。
 */
const norm = (s) => s.replace(/\r/g, "").replace(/[ \t 　]+/g, " ").replace(/ ?\n ?/g, "\n").trim();

/** @returns {{prompt: object|null, error?: string}} */
export function resolvePrompt(bundle, o) {
  const p = o.prompt;
  if (!p) return { prompt: null };
  if (!["full", "brief"].includes(p.kind) || !["post", "author_reply", "image", "link"].includes(p.source)) return { prompt: null, error: "bad kind/source" };
  const posts = [bundle.root, ...bundle.thread];
  const src = posts.find((t) => t.tweet_id === p.source_tweet_id);
  if (!src) return { prompt: null, error: `source_tweet_id ${p.source_tweet_id} not in this case` };
  const url = `https://x.com/${bundle.handle}/status/${src.tweet_id}`;
  if (p.source === "image") {
    if (!p.image_urls?.length || !p.image_urls.every((u) => src.photos?.includes(u))) return { prompt: null, error: "image_urls must come from that post's photos" };
    return { prompt: { kind: p.kind, source: "image", sourceUrl: url, imageUrls: p.image_urls, text: null } };
  }
  if (p.source === "link") {
    if (!p.link_url || !posts.some((t) => (t.links || []).includes(p.link_url))) return { prompt: null, error: "link_url must come from links[]" };
    return { prompt: { kind: p.kind, source: "link", sourceUrl: url, linkUrl: p.link_url, text: null } };
  }
  const isRoot = src.tweet_id === bundle.root.tweet_id;
  const source = isRoot ? "post" : "author_reply"; // 位置以事实为准，不信模型填的
  let text;
  if (p.text) {
    if (p.text.length > 400) return { prompt: null, error: "text longer than 400 chars: use start/end" };
    const hay = norm(src.text), nd = norm(p.text), i = hay.indexOf(nd);
    if (i < 0) return { prompt: null, error: `text is not a verbatim substring of post ${src.tweet_id}: "${p.text.slice(0, 60)}…"` };
    text = hay.slice(i, i + nd.length);
  } else if (p.start && p.end) {
    const parts = /parts:\s*([\d,\s]+)/.exec(o.note || "")?.[1]?.split(",").map((s) => s.trim()).filter(Boolean);
    const seq = parts?.length ? parts.map((id) => posts.find((t) => t.tweet_id === id)) : [src];
    if (seq.some((x) => !x)) return { prompt: null, error: "parts: contains a tweet_id not in this case" };
    const hay = seq.map((x) => norm(x.text.replace(/\s*https:\/\/t\.co\/\w+\s*$/, ""))).join("\n\n");
    const s = hay.indexOf(norm(p.start)), eN = norm(p.end), e = hay.lastIndexOf(eN);
    if (s < 0) return { prompt: null, error: `start marker not found verbatim: "${p.start.slice(0, 60)}…"` };
    if (e < 0 || e + eN.length <= s) return { prompt: null, error: `end marker not found verbatim after start: "${p.end.slice(0, 60)}…"` };
    text = hay.slice(s, e + eN.length);
  } else return { prompt: null, error: "text source needs `text` or `start`+`end`" };
  const kind = p.kind === "full" && text.length < 120 ? "brief" : p.kind;
  return { prompt: { kind, source, sourceUrl: url, text } };
}

/** 把候选 + 作者回复打包成给模型看的样子；只留可能相关的回复 */
export function bundle(c, thread) {
  const re = /prompt|プロンプト|提示词|提示詞|프롬프트|指示|instruction|咒语|指令/i;
  const notX = (u) => !/^https?:\/\/(www\.)?(x|twitter)\.com\//.test(u);
  const direct = thread.filter((x) => x.inReplyToId === c.id).slice(0, 3).map((x) => x.id);
  const rel = thread.filter((x) => re.test(x.text) || x.text.length > 200 || x.photos.length || x.urls.some(notX) || direct.includes(x.id)).slice(0, 25);
  return { id: c.id, handle: c.handle, views: c.views, root: { tweet_id: c.id, text: c.text, links: c.links },
    quoted: c.quoted ? { handle: c.quoted.handle, text: (c.quoted.text || "").slice(0, 1500) } : null,
    thread: rel.map((x) => ({ tweet_id: x.id, text: x.text, links: x.urls.filter(notX), photos: x.photos })) };
}
