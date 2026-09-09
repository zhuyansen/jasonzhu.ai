/**
 * 付费会员角色白名单。profiles.role 取值：free / member / pro / partner。
 * 之前各处用 `role !== "free"` 黑名单判断——未知角色、脏数据也会被放行；
 * 这里改为白名单，查不到 profile 或角色不在表内一律按非会员处理。
 */
const PAID_ROLES = new Set(["member", "pro", "partner"]);

export function isPaidRole(role: string | null | undefined): boolean {
  return typeof role === "string" && PAID_ROLES.has(role);
}
