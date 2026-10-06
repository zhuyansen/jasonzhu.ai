import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/admin-auth";
import { getAllDigests, isDigestIndexable } from "@/lib/news";

export const dynamic = "force-dynamic";

const REPO = "zhuyansen/jasonzhu.ai";
const BRANCH = "main";
const headers = { "Cache-Control": "private, no-store" };

/** 快讯列表（给后台「快讯点评」用）：日期、标题、AI 摘要、现有点评、是否已放开收录 */
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;
  const digests = getAllDigests().map((d) => ({
    slug: d.slug,
    date: d.date,
    title: d.title,
    itemCount: d.items.length,
    aiSummary: d.jasonSays,
    humanComment: d.humanComment || "",
    humanCommentEn: d.humanCommentEn || "",
    reviewedAt: d.reviewedAt || "",
    indexable: isDigestIndexable(d),
  }));
  return NextResponse.json({ digests, canSave: Boolean(process.env.GITHUB_CONTENTS_TOKEN) }, { headers });
}

/** 把 frontmatter 里的某个字段设成新值（JSON 字符串即合法的 YAML 双引号字符串）；value 为空则删掉该行 */
function setField(frontmatter: string, key: string, value: string): string {
  const line = new RegExp(`^${key}:.*$`, "m");
  if (!value) return frontmatter.replace(new RegExp(`^${key}:.*\\n?`, "m"), "");
  const next = `${key}: ${JSON.stringify(value)}`;
  return line.test(frontmatter) ? frontmatter.replace(line, next) : `${frontmatter.replace(/\n?$/, "\n")}${next}\n`;
}

/**
 * 保存 Jason 的点评：改 src/content/news/<slug>.md 的 frontmatter（humanComment / humanCommentEn / reviewedAt），
 * 通过 GitHub API 提交到 main → Vercel 自动部署（约 3–4 分钟后生效）。点评清空 = 撤回，该期重新 noindex。
 * Vercel 文件系统只读，所以不能直接写文件；需要 GITHUB_CONTENTS_TOKEN（只对本仓库 Contents 读写的 fine-grained token）。
 */
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const token = process.env.GITHUB_CONTENTS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Vercel 里还没配 GITHUB_CONTENTS_TOKEN，暂时不能保存" }, { status: 503, headers });
  }

  let body: { slug?: string; comment?: string; commentEn?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers });
  }
  const slug = String(body.slug || "");
  const comment = String(body.comment || "").trim();
  const commentEn = String(body.commentEn || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return NextResponse.json({ error: "slug 格式不对" }, { status: 400, headers });
  if (comment.length > 1000 || commentEn.length > 2000) {
    return NextResponse.json({ error: "点评太长了（中文 1000 字以内）" }, { status: 400, headers });
  }

  const gh = (path: string, init?: RequestInit) =>
    fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

  const path = `src/content/news/${slug}.md`;
  const cur = await gh(`${path}?ref=${BRANCH}`);
  if (cur.status === 404) return NextResponse.json({ error: `没有找到 ${slug} 这期快讯` }, { status: 404, headers });
  if (!cur.ok) return NextResponse.json({ error: `读取仓库失败：HTTP ${cur.status}` }, { status: 502, headers });
  const file = (await cur.json()) as { content: string; sha: string };
  const text = Buffer.from(file.content, "base64").toString("utf8");

  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return NextResponse.json({ error: "这期快讯没有 frontmatter，无法写入点评" }, { status: 422, headers });
  let fm = m[1];
  fm = setField(fm, "humanComment", comment);
  fm = setField(fm, "humanCommentEn", comment ? commentEn : "");
  fm = setField(fm, "reviewedAt", comment ? new Date().toISOString().slice(0, 10) : "");
  const next = `---\n${fm.replace(/\n+$/, "")}\n---\n${text.slice(m[0].length)}`;
  if (next === text) return NextResponse.json({ ok: true, unchanged: true }, { headers });

  const put = await gh(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: comment ? `📝 快讯点评 ${slug}` : `📝 撤回快讯点评 ${slug}`,
      content: Buffer.from(next, "utf8").toString("base64"),
      sha: file.sha,
      branch: BRANCH,
    }),
  });
  if (!put.ok) {
    const t = await put.text().catch(() => "");
    return NextResponse.json({ error: `提交失败：HTTP ${put.status} ${t.slice(0, 160)}` }, { status: 502, headers });
  }
  const res = (await put.json()) as { commit?: { sha?: string; html_url?: string } };
  return NextResponse.json({ ok: true, commit: res.commit?.sha?.slice(0, 7), url: res.commit?.html_url }, { headers });
}
