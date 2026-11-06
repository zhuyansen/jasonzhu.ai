import type { Metadata } from "next";
import Link from "@/components/Link";
import { getSupabase } from "@/lib/supabase";
import { isSubscriberId, verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

/**
 * 退订确认页（2026-11-06 起）。邮件页脚的「退订」链接打开这里；按钮是原生表单，POST 到 /api/unsubscribe，
 * 处理完 303 回到这里，带 s=unsubscribed|resubscribed|invalid|error。打开这一页本身不会退订（邮件网关会预先打开链接）。
 * 要读 query 和库，所以是动态渲染；noindex，不进 sitemap。
 */

export const dynamic = "force-dynamic";

const SITE_URL = "https://jasonzhu.ai";

type Lang = "zh" | "en";
type View =
  | { kind: "confirm" | "done" | "already" | "resubscribed"; email: string }
  | { kind: "retry"; email: string; next: "unsubscribe" | "resubscribe" }
  | { kind: "invalid" | "unavailable" };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "en" ? "Unsubscribe" : "退订邮件",
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/${lang === "en" ? "en" : "zh"}/unsubscribe` },
  };
}

function one(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value ? value : null;
}

/** 只露出第一两个字符和域名，确认是哪个邮箱就够了 */
function mask(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  const local = email.slice(0, at);
  return `${local.slice(0, local.length > 4 ? 2 : 1)}***${email.slice(at)}`;
}

async function resolveView(id: string | null, t: string | null, s: string | null): Promise<View> {
  if (!isSubscriberId(id) || !t) return { kind: "invalid" };
  let row: { email: string; unsubscribed_at: string | null } | null;
  try {
    const { data, error } = await getSupabase().from("subscribers").select("email, unsubscribed_at").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    row = data;
  } catch (e) {
    console.error("[unsubscribe page] lookup failed", { id, error: String(e) });
    return { kind: "unavailable" };
  }
  if (!row || !(await verifyUnsubscribeToken(row.email, t))) return { kind: "invalid" };

  const email = mask(row.email);
  // 刚提交过：以接口的结果为准（写库失败走了 KV 兜底时，库里这一列还是空的）
  if (s === "unsubscribed") return { kind: "done", email };
  if (s === "resubscribed") return { kind: "resubscribed", email };
  if (s === "error") return { kind: "retry", email, next: row.unsubscribed_at ? "resubscribe" : "unsubscribe" };
  return { kind: row.unsubscribed_at ? "already" : "confirm", email };
}

const COPY = {
  zh: {
    confirm: { title: "退订邮件", body: (e: string) => `确认后，${e} 将不再收到 JasonZhu.AI 的 AI 快讯和出海选品周报。` },
    done: { title: "已退订", body: (e: string) => `${e} 以后不会再收到 JasonZhu.AI 的 AI 快讯和出海选品周报。` },
    already: { title: "你已经退订了", body: (e: string) => `${e} 不会再收到 JasonZhu.AI 的 AI 快讯和出海选品周报。` },
    resubscribed: { title: "已恢复订阅", body: (e: string) => `${e} 重新回到了 JasonZhu.AI 的订阅名单。` },
    retry: { title: "没有处理成功", body: () => "服务器暂时出了问题，请再点一次。" },
    invalid: {
      title: "链接无效",
      body: () =>
        "这个退订链接不完整或已失效，也可能这个邮箱已经不在订阅名单里。请从最近一封邮件底部的「退订」重新打开；还是不行的话，在 X 上私信 @GoSailGlobal，我们手动帮你退订。",
    },
    unavailable: { title: "暂时打不开", body: () => "服务器暂时出了问题，请稍后再打开这个链接。" },
    unsubscribe: "确认退订",
    resubscribe: "重新订阅",
    mistake: "点错了？",
    home: "← 回到首页",
  },
  en: {
    confirm: { title: "Unsubscribe", body: (e: string) => `Once you confirm, ${e} will no longer receive newsletters from JasonZhu.AI.` },
    done: { title: "You're unsubscribed", body: (e: string) => `${e} will no longer receive newsletters from JasonZhu.AI.` },
    already: { title: "You're already unsubscribed", body: (e: string) => `${e} no longer receives newsletters from JasonZhu.AI.` },
    resubscribed: { title: "You're subscribed again", body: (e: string) => `${e} is back on the JasonZhu.AI mailing list.` },
    retry: { title: "Something went wrong", body: () => "We couldn't process that just now. Please try again." },
    invalid: {
      title: "Invalid link",
      body: () =>
        "This unsubscribe link is incomplete or no longer valid, or this address is no longer on our list. Please use the unsubscribe link at the bottom of our most recent email. If that doesn't work, message @GoSailGlobal on X and we'll remove you manually.",
    },
    unavailable: { title: "Temporarily unavailable", body: () => "Something went wrong on our end. Please open this link again later." },
    unsubscribe: "Unsubscribe",
    resubscribe: "Resubscribe",
    mistake: "Clicked by mistake?",
    home: "← Back to home",
  },
} as const;

const ICON: Record<View["kind"], string> = {
  confirm: "📭",
  done: "✅",
  already: "✅",
  resubscribed: "📬",
  retry: "⚠️",
  invalid: "⚠️",
  unavailable: "⚠️",
};

function ActionForm({
  id,
  t,
  lang,
  action,
  label,
  primary,
}: {
  id: string;
  t: string;
  lang: Lang;
  action: "unsubscribe" | "resubscribe";
  label: string;
  primary: boolean;
}) {
  return (
    <form method="post" action="/api/unsubscribe">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="t" value={t} />
      <input type="hidden" name="l" value={lang} />
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        className={
          primary
            ? "px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
            : "px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const sp = await searchParams;
  const id = one(sp.id);
  const t = one(sp.t);
  const view = await resolveView(id, t, one(sp.s));
  const c = COPY[lang];
  const text = c[view.kind];
  const body = "email" in view ? text.body(view.email) : text.body("");

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="text-3xl" aria-hidden="true">
          {ICON[view.kind]}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{text.title}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{body}</p>

        {id && t && view.kind === "confirm" && (
          <div className="mt-6">
            <ActionForm id={id} t={t} lang={lang} action="unsubscribe" label={c.unsubscribe} primary />
          </div>
        )}
        {id && t && view.kind === "retry" && (
          <div className="mt-6">
            <ActionForm id={id} t={t} lang={lang} action={view.next} label={c[view.next]} primary />
          </div>
        )}
        {id && t && (view.kind === "done" || view.kind === "already") && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">{c.mistake}</span>
            <ActionForm id={id} t={t} lang={lang} action="resubscribe" label={c.resubscribe} primary={false} />
          </div>
        )}

        <p className="mt-8 text-sm">
          <Link href={`/${lang}`} className="text-gray-500 hover:text-gray-900">
            {c.home}
          </Link>
        </p>
      </div>
    </div>
  );
}
