/// <reference lib="deno.ns" />
// Vercel Log Drain → Supabase, project zjylrwdrkabuugdvvgba. Source of truth since 2026-11-26:
// jasonzhu.ai repo, supabase/functions/vercel-drain (the copy in geo-chain is the old one; do
// not deploy it, it would drop the ai_crawler_hits write).
//
// Deliveries come in by POST, signed with x-vercel-signature (HMAC-SHA1 of the raw body, hex).
// 1. Their crawler request records wait in public.vercel_drain, exactly as before, for the
//    GEOInflow machine (no public URL), which takes them out with GET and DELETE using
//    RELAY_TOKEN (geo-chain scripts/liekan-chain/relay.py). Parallel run, plan A1.
// 2. Then each jasonzhu.ai crawler request is classified (GEOInflow's UA catalogue), checked
//    against the operator's published IP ranges (bot_ip_ranges) or reverse-DNS rule, and
//    written to public.ai_crawler_hits with only a /24 or /48 prefix (hits.ts). A failure
//    there is logged and never changes the response, so it cannot get the drain disabled.
// Deploy with --no-verify-jwt: neither caller sends a Supabase JWT.
import { recordHits } from './hits.ts';

const SECRET = Deno.env.get('VERCEL_DRAIN_SECRET') ?? '';
const RELAY_TOKEN = Deno.env.get('RELAY_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
/** Vercel batches at most 1 MB a delivery. */
const MAX_BYTES = 2 * 1024 * 1024;
/** Request records; build logs and edge output carry no request status. */
const REQUEST_SOURCES = new Set(['static', 'lambda', 'external', 'firewall', 'redirect']);
/**
 * Crawlers only: Vercel's drain form cannot filter by user agent, so a drain sends every
 * request, visitors included. Their addresses and paths are not kept; GEOInflow's own
 * classification decides later which of these is which crawler.
 */
const CRAWLER = /bot|crawl|spider|slurp|fetch|agent|-user|cohere|anthropic|openai|perplexity|gemini|mistral|kimi|bytedance|petal/i;
/** Rows a pull returns; the app imports at most 1,000 a batch. */
const PAGE = 1000;
/** Ids per delete request, to keep the REST URL short. */
const DELETE_CHUNK = 100;

type Entry = Record<string, unknown>;

async function sign(body: ArrayBuffer) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, body));
  return Array.from(mac, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** A delivery is a JSON array or NDJSON, whichever format the drain was given. */
function entries(text: string): Entry[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const values: unknown[] = trimmed.startsWith('[')
    ? JSON.parse(trimmed)
    : trimmed.split('\n').filter(Boolean).map(line => JSON.parse(line));
  return (Array.isArray(values) ? values : []).filter(
    (value): value is Entry => !!value && typeof value === 'object' && !Array.isArray(value),
  );
}

function rest(method: string, query: string, body?: unknown, prefer = 'return=minimal') {
  return fetch(`${SUPABASE_URL}/rest/v1/vercel_drain?${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      authorization: `Bearer ${SERVICE_KEY}`,
      'content-type': 'application/json',
      prefer,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function firstAgent(entry: Entry) {
  const agents = (entry.proxy as { userAgent?: unknown }).userAgent;
  return Array.isArray(agents) && typeof agents[0] === 'string' ? agents[0] : '';
}

const inList = (values: string[]) =>
  encodeURIComponent(`(${values.map(value => JSON.stringify(value)).join(',')})`);

async function receive(request: Request) {
  if (!SECRET) return Response.json({ error: 'not_configured' }, { status: 404 });
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return Response.json({ error: 'too_large' }, { status: 413 });
  if (!same(await sign(body), request.headers.get('x-vercel-signature') ?? ''))
    return Response.json({ code: 'invalid_signature', error: "signature didn't match" }, { status: 403 });
  let rows: { id: string; entry: Entry }[];
  try {
    rows = entries(new TextDecoder().decode(body))
      .filter(entry => REQUEST_SOURCES.has(String(entry.source)) && entry.proxy && entry.id)
      .filter(entry => CRAWLER.test(firstAgent(entry)))
      .map(entry => ({ id: String(entry.id), entry }));
  } catch {
    return Response.json({ error: 'not_json' }, { status: 400 });
  }
  if (rows.length) {
    const stored = await rest('POST', 'on_conflict=id', rows, 'resolution=ignore-duplicates,return=minimal');
    if (!stored.ok) return Response.json({ error: 'store_failed' }, { status: 500 });
    // Plan A1, after vercel_drain is safe: ai_crawler_hits. Runs in the background where the
    // edge runtime allows it, so the drain's response time is what it was.
    const job = recordHits(rows.map(row => row.entry), SUPABASE_URL, SERVICE_KEY)
      .catch(error => console.error('ai_crawler_hits failed:', String(error).slice(0, 300)));
    const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
    if (runtime?.waitUntil) runtime.waitUntil(job);
    else await job;
  }
  return Response.json({ received: rows.length });
}

/** The oldest waiting rows of these hosts, with and without www. */
async function pull(url: URL) {
  const hosts = (url.searchParams.get('hosts') ?? '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean);
  if (!hosts.length) return Response.json([]);
  const names = [...new Set(hosts.flatMap(host => [host, `www.${host}`]))];
  const hostPath = encodeURIComponent('entry->proxy->>host');
  const query = `select=id,entry&${hostPath}=in.${inList(names)}&order=received_at.asc&limit=${PAGE}`;
  const response = await rest('GET', query);
  if (!response.ok) return Response.json({ error: 'read_failed' }, { status: 502 });
  return Response.json(await response.json());
}

/** {"ids": [...]} removes rows the relay delivered; {"before": iso} prunes old ones. */
async function remove(request: Request) {
  const body = await request.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : [];
  for (let start = 0; start < ids.length; start += DELETE_CHUNK) {
    const response = await rest('DELETE', `id=in.${inList(ids.slice(start, start + DELETE_CHUNK))}`);
    if (!response.ok) return Response.json({ error: 'delete_failed' }, { status: 502 });
  }
  if (typeof body?.before === 'string') {
    const response = await rest('DELETE', `received_at=lt.${encodeURIComponent(body.before)}`);
    if (!response.ok) return Response.json({ error: 'delete_failed' }, { status: 502 });
  }
  return Response.json({ deleted: ids.length });
}

Deno.serve(async request => {
  if (request.method === 'POST') return receive(request);
  if (request.method !== 'GET' && request.method !== 'DELETE')
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  if (!RELAY_TOKEN || !same(request.headers.get('authorization') ?? '', `Bearer ${RELAY_TOKEN}`))
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  return request.method === 'GET' ? pull(new URL(request.url)) : remove(request);
});
