const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_ORG = process.env.GITHUB_ORG || "gosail-club";
const GITHUB_TEAM = process.env.GITHUB_TEAM || "members";

/** 邀请 GitHub 用户进 org team（自动拿到 team 下所有仓库权限） */
export async function inviteToTeam(username: string): Promise<{ ok: boolean; error?: string }> {
  if (!GITHUB_PAT) return { ok: false, error: "GITHUB_PAT 未配置" };

  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${GITHUB_PAT}`, "User-Agent": "gosail-club" },
    signal: AbortSignal.timeout(10000),
  });
  if (userRes.status === 404) return { ok: false, error: "GitHub 用户名不存在，请检查拼写" };
  if (!userRes.ok) return { ok: false, error: `GitHub 校验失败 (${userRes.status})` };

  const res = await fetch(
    `https://api.github.com/orgs/${GITHUB_ORG}/teams/${GITHUB_TEAM}/memberships/${encodeURIComponent(username)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        "User-Agent": "gosail-club",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ role: "member" }),
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[github-invite] team invite failed:", res.status, t.slice(0, 200));
    return { ok: false, error: `邀请失败 (${res.status})，请联系 Jason` };
  }
  return { ok: true };
}

export { GITHUB_ORG };
