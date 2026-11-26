// ai_crawler_hits: classify and verify each crawler request when the drain delivers it.
// Pure parts (classify, prefix, CIDR match, row building) are exported for hits_test.ts.
// Nothing here may throw into the drain: index.ts calls recordHits() after vercel_drain is
// stored and only logs its failures, so GEOInflow's transit table keeps working regardless.
import { RULES, type Rule } from './catalog.ts';

export type Entry = Record<string, unknown>;
export type Verification = 'verified' | 'range_mismatch' | 'no_published_ranges' | 'unknown';
export type Method = 'ip_range' | 'rdns' | 'none';
export type HitRow = {
  id: string; ts: string; host: string; path: string; status: number; http_method: string;
  source: string; bot: string; vendor: string; bot_type: string; agent: string | null;
  verification: Verification; method: Method; reason: string; ip_prefix: string; ja4: string | null;
};

/** Only this site's requests, like GEOInflow's website (jasonzhu.ai, with or without www). */
export const SITE = 'jasonzhu.ai';
/** GEOInflow treats a range list older than this as unusable (stale_snapshot). */
export const STALE_MS = 7 * 24 * 3600 * 1000;
const RANGE_TTL_MS = 5 * 60 * 1000;
const FIREWALL_STATUS = 403;
const MAX_PATH = 500;

/**
 * Operators who publish an IP list (bot_ip_ranges, refreshed daily by
 * .github/workflows/bot-ip-ranges.yml). If one of these has no rows, that is our fault
 * (missing_snapshot), not the operator's.
 */
export const RANGE_BOTS = new Set([
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'OAI-AdsBot',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'KimiBot', 'Kimi-SearchBot', 'Kimi-User', 'HySpider',
  'Googlebot', 'Googlebot-Image', 'Googlebot-Video', 'GoogleOther', 'GoogleOther-Image', 'GoogleOther-Video',
  'Storebot-Google', 'Google-InspectionTool', 'Google-CloudVertexBot',
  'bingbot', 'Applebot', 'MistralAI-User', 'MistralAI-Index', 'DuckDuckBot', 'DuckAssistBot', 'CCBot',
  'AhrefsBot', 'AhrefsSiteAudit', 'Amazonbot', 'Amzn-SearchBot', 'Amzn-User',
  'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'FacebookBot',
]);

/** Operators who document reverse-DNS verification instead of an IP list. */
export const RDNS: Record<string, readonly string[]> = {
  YandexBot: ['yandex.ru', 'yandex.net', 'yandex.com'],
  Baiduspider: ['baidu.com', 'baidu.jp'],
  'Baiduspider-render': ['baidu.com', 'baidu.jp'],
  'Sogou web spider': ['sogou.com'],
  'Sogou inst spider': ['sogou.com'],
  SeznamBot: ['seznam.cz'],
  FreshBot: ['seznam.cz'],
  Yeti: ['naver.com'],
};

// ───────────── user agent → bot (GEOInflow classifyBot, token mode) ─────────────

function tokenMatches(ua: string, pattern: string) {
  const source = ua.toLowerCase();
  const needle = pattern.toLowerCase();
  let offset = source.indexOf(needle);
  while (offset !== -1) {
    const before = source[offset - 1];
    const after = source[offset + needle.length];
    if ((!before || /[\s;(,]/u.test(before)) && (!after || /[\s;),(/]/u.test(after))) return true;
    offset = source.indexOf(needle, offset + 1);
  }
  return false;
}

/** URLs in a UA are documentation links, not product tokens (GEOInflow withoutDocumentationUrls). */
export function withoutUrls(ua: string) {
  return ua.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"]*/gi, ' ').replace(/\bwww\.[^\s<>"]+/gi, ' ');
}

const UNKNOWN = { name: '其他', vendor: '', type: '其他' };

export function classify(ua: string): { name: string; vendor: string; type: string } {
  const tokens = withoutUrls(ua);
  const matches = RULES.filter(rule => tokenMatches(tokens, rule.name));
  if (!matches.length) return UNKNOWN;
  const specific = matches.filter(rule => !matches.some(other => other.parent === rule.id));
  const unique = [...new Map(specific.map(rule => [rule.id, rule])).values()];
  return unique.length === 1 ? pick(unique[0]) : UNKNOWN;
}
const pick = (rule: Rule) => ({ name: rule.name, vendor: rule.vendor, type: rule.type });

/** For unmapped crawlers only: the bot-like word in the UA, so the catalogue can grow later. */
export function agentWord(ua: string): string | null {
  const clean = withoutUrls(ua);
  const compatible = clean.match(/compatible;\s*([A-Za-z][\w.-]*)/i);
  const botish = clean.match(/([A-Za-z][\w.-]*(?:bot|crawler|spider|fetcher|indexer|agent|-user)[\w.-]*)/i);
  const first = clean.match(/^\s*([A-Za-z][\w.-]*)/);
  const word = (compatible && !/^msie$/i.test(compatible[1]) ? compatible[1] : null) ??
    botish?.[1] ?? (first && !/^mozilla$/i.test(first[1]) ? first[1] : null);
  return word ? word.slice(0, 40) : null;
}

// ───────────── addresses ─────────────

function ipv4Number(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    value = value * 256 + Number(part);
  }
  return value;
}

function ipv6Hextets(ip: string): number[] | null {
  let text = ip.toLowerCase().split('%')[0];
  const v4 = text.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const n = ipv4Number(v4[2]);
    if (n === null) return null;
    text = `${v4[1]}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0 || (halves.length === 1 && head.length !== 8)) return null;
  const all = [...head, ...Array(fill).fill('0'), ...tail];
  if (all.length !== 8 || !all.every(h => /^[0-9a-f]{1,4}$/.test(h))) return null;
  return all.map(h => parseInt(h, 16));
}

export type Address = { family: 4; v4: number; text: string } | { family: 6; v6: bigint; hextets: number[]; text: string };

export function parseIp(raw: unknown): Address | null {
  if (typeof raw !== 'string' || !raw) return null;
  const ip = raw.trim();
  const v4 = ipv4Number(ip);
  if (v4 !== null) return { family: 4, v4, text: ip };
  const hextets = ipv6Hextets(ip);
  if (!hextets) return null;
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) is an IPv4 client, as ipaddr.process treats it.
  if (hextets.slice(0, 5).every(h => h === 0) && hextets[5] === 0xffff) {
    const n = hextets[6] * 65536 + hextets[7];
    return { family: 4, v4: n, text: [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.') };
  }
  return { family: 6, v6: hextets.reduce((acc, h) => (acc << 16n) | BigInt(h), 0n), hextets, text: ip };
}

/** GEOInflow's ip_masked: IPv4 a.b.c.0/24, IPv6 first three hextets ::/48. Not reversible. */
export function prefixOf(address: Address | null): string {
  if (!address) return '';
  if (address.family === 4) {
    const n = address.v4;
    return `${n >>> 24}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.0/24`;
  }
  return `${address.hextets.slice(0, 3).map(h => h.toString(16)).join(':')}::/48`;
}

export type Network = { family: 4; net: number; bits: number } | { family: 6; net: bigint; bits: number };

export function parseCidr(cidr: string): Network | null {
  const [ip, bitsText] = cidr.split('/');
  const address = parseIp(ip);
  if (!address) return null;
  const max = address.family === 4 ? 32 : 128;
  const bits = bitsText === undefined ? max : Number(bitsText);
  if (!Number.isInteger(bits) || bits < 0 || bits > max) return null;
  if (address.family === 4) {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return { family: 4, net: (address.v4 & mask) >>> 0, bits };
  }
  const mask = bits === 0 ? 0n : ((1n << BigInt(bits)) - 1n) << BigInt(128 - bits);
  return { family: 6, net: address.v6 & mask, bits };
}

export function inNetworks(address: Address, networks: readonly Network[]) {
  for (const network of networks) {
    if (network.family !== address.family) continue;
    if (network.family === 4 && address.family === 4) {
      const mask = network.bits === 0 ? 0 : (0xffffffff << (32 - network.bits)) >>> 0;
      if (((address.v4 & mask) >>> 0) === network.net) return true;
    } else if (network.family === 6 && address.family === 6) {
      const mask = network.bits === 0 ? 0n : ((1n << BigInt(network.bits)) - 1n) << BigInt(128 - network.bits);
      if ((address.v6 & mask) === network.net) return true;
    }
  }
  return false;
}

// ───────────── request fields (GEOInflow chain/vercel-drain.ts rowOf + canonicalPath) ─────────────

const record = (value: unknown): Entry =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Entry) : {};

function bareHost(host: unknown) {
  if (typeof host !== 'string') return '';
  return host.toLowerCase().split(':')[0].replace(/^www\./, '');
}

/** Path only, as GEOInflow stores it: the URL parser's pathname, no query or fragment. */
export function cleanPath(raw: string): string {
  let path: string;
  try {
    const url = new URL(raw, `https://${SITE}`);
    path = url.hostname === SITE ? url.pathname || '/' : raw.split(/[?#]/)[0];
  } catch {
    path = raw.split(/[?#]/)[0];
  }
  return path.slice(0, MAX_PATH);
}

export type Request = {
  key: string; ts: string; host: string; path: string; status: number; httpMethod: string;
  source: string; ua: string; ip: unknown; ja4: string | null;
};

/** One delivery's requests for this site; a function's several log lines count once. */
export function requestsOf(entries: Entry[]): Request[] {
  const seen = new Set<string>();
  const out: Request[] = [];
  for (const entry of entries) {
    const proxy = record(entry.proxy);
    const path = proxy.path;
    const time = Number(proxy.timestamp ?? entry.timestamp);
    const host = (proxy.host ?? entry.host) as unknown;
    if (typeof path !== 'string' || !Number.isFinite(time) || bareHost(host) !== SITE) continue;
    const code = Number(proxy.statusCode ?? entry.statusCode);
    const status = Number.isInteger(code) && code >= 100 && code < 600
      ? code
      : entry.source === 'firewall' ? FIREWALL_STATUS : null;
    if (status === null) continue;
    const key = String(entry.requestId || proxy.vercelId || entry.id || '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const agents = Array.isArray(proxy.userAgent) ? proxy.userAgent : [];
    out.push({
      key,
      ts: new Date(time).toISOString(),
      host: String(host).toLowerCase(),
      path: cleanPath(path),
      status,
      httpMethod: typeof proxy.method === 'string' ? proxy.method.slice(0, 10) : 'GET',
      source: String(entry.source ?? ''),
      ua: typeof agents[0] === 'string' ? agents[0] : '',
      ip: proxy.clientIp,
      ja4: typeof entry.ja4Digest === 'string' ? entry.ja4Digest.slice(0, 64) : null,
    });
  }
  return out;
}

// ───────────── verification ─────────────

export type Ranges = Map<string, { fetchedAt: number; networks: Network[] }>;
export type Resolver = (name: string, type: 'PTR' | 'A' | 'AAAA') => Promise<string[]>;

function reverseName(address: Address) {
  if (address.family === 4) {
    const n = address.v4;
    return `${n & 255}.${(n >>> 8) & 255}.${(n >>> 16) & 255}.${n >>> 24}.in-addr.arpa`;
  }
  const hex = address.hextets.map(h => h.toString(16).padStart(4, '0')).join('');
  return `${[...hex].reverse().join('.')}.ip6.arpa`;
}

function sameAddress(a: string, address: Address) {
  const parsed = parseIp(a);
  if (!parsed || parsed.family !== address.family) return false;
  return parsed.family === 4 ? parsed.v4 === (address as { v4: number }).v4 : parsed.v6 === (address as { v6: bigint }).v6;
}

/** Forward-confirmed reverse DNS, the check these operators document. */
export async function rdnsCheck(address: Address, suffixes: readonly string[], resolve: Resolver):
  Promise<'verified_rdns' | 'rdns_mismatch'> {
  const names = (await resolve(reverseName(address), 'PTR')).map(n => n.toLowerCase().replace(/\.$/, ''));
  for (const name of names) {
    if (!suffixes.some(s => name === s || name.endsWith(`.${s}`))) continue;
    const forward = await resolve(name, address.family === 4 ? 'A' : 'AAAA');
    if (forward.some(a => sameAddress(a, address))) return 'verified_rdns';
  }
  return 'rdns_mismatch';
}

export type VerifyContext = {
  ranges: Ranges | null;          // null: could not load bot_ip_ranges this time
  now: number;
  resolve: Resolver | null;       // null: no DNS in this runtime
  rdnsBudget: { left: number };
  rdnsCache: Map<string, string>;
};

export async function verify(bot: string, address: Address | null, ctx: VerifyContext):
  Promise<{ verification: Verification; method: Method; reason: string }> {
  if (bot === UNKNOWN.name) return { verification: 'unknown', method: 'none', reason: 'unmapped_identity' };
  const suffixes = RDNS[bot];
  if (!RANGE_BOTS.has(bot) && !suffixes)
    return { verification: 'no_published_ranges', method: 'none', reason: 'no_official_source' };
  if (!address) return { verification: 'unknown', method: 'none', reason: 'untrusted_ip' };
  if (RANGE_BOTS.has(bot)) {
    const entry = ctx.ranges?.get(bot);
    if (!entry || !entry.networks.length) return { verification: 'unknown', method: 'none', reason: 'missing_snapshot' };
    if (ctx.now - entry.fetchedAt > STALE_MS) return { verification: 'unknown', method: 'none', reason: 'stale_snapshot' };
    return inNetworks(address, entry.networks)
      ? { verification: 'verified', method: 'ip_range', reason: 'verified_range' }
      : { verification: 'range_mismatch', method: 'ip_range', reason: 'range_mismatch' };
  }
  if (!ctx.resolve) return { verification: 'unknown', method: 'none', reason: 'dns_unavailable' };
  const cacheKey = `${bot}|${address.text}`;
  let outcome = ctx.rdnsCache.get(cacheKey);
  if (!outcome) {
    if (ctx.rdnsBudget.left <= 0) return { verification: 'unknown', method: 'none', reason: 'dns_budget_exhausted' };
    ctx.rdnsBudget.left--;
    try {
      outcome = await rdnsCheck(address, suffixes!, ctx.resolve);
    } catch (error) {
      const name = (error as Error)?.name ?? '';
      outcome = /abort|timeout/i.test(name) ? 'dns_timeout' : /notfound|nxdomain/i.test(`${name} ${(error as Error)?.message}`) ? 'rdns_mismatch' : 'dns_unavailable';
    }
    if (outcome === 'verified_rdns' || outcome === 'rdns_mismatch') {
      if (ctx.rdnsCache.size > 5000) ctx.rdnsCache.clear();
      ctx.rdnsCache.set(cacheKey, outcome);
    }
  }
  if (outcome === 'verified_rdns') return { verification: 'verified', method: 'rdns', reason: outcome };
  if (outcome === 'rdns_mismatch') return { verification: 'range_mismatch', method: 'rdns', reason: outcome };
  return { verification: 'unknown', method: 'none', reason: outcome };
}

export async function buildRows(requests: Request[], ctx: VerifyContext): Promise<HitRow[]> {
  return await Promise.all(requests.map(async request => {
    const identity = classify(request.ua);
    const address = parseIp(request.ip);
    const checked = await verify(identity.name, address, ctx);
    return {
      id: request.key,
      ts: request.ts,
      host: request.host,
      path: request.path,
      status: request.status,
      http_method: request.httpMethod,
      source: request.source,
      bot: identity.name,
      vendor: identity.vendor,
      bot_type: identity.type,
      agent: identity.name === UNKNOWN.name ? agentWord(request.ua) : null,
      ...checked,
      ip_prefix: prefixOf(address),
      ja4: request.ja4,
    };
  }));
}

// ───────────── range cache (bot_ip_ranges, a few minutes in memory) ─────────────

let cache: { at: number; ranges: Ranges } | null = null;

export function rangesFrom(rows: { bot: string; fetched_at: string; cidrs: string[] }[]): Ranges {
  const ranges: Ranges = new Map();
  for (const row of rows) {
    const networks = (row.cidrs ?? []).map(parseCidr).filter((n): n is Network => !!n);
    ranges.set(row.bot, { fetchedAt: Date.parse(row.fetched_at), networks });
  }
  return ranges;
}

export async function loadRanges(url: string, key: string, fetcher: typeof fetch = fetch): Promise<Ranges | null> {
  if (cache && Date.now() - cache.at < RANGE_TTL_MS) return cache.ranges;
  try {
    const response = await fetcher(`${url}/rest/v1/rpc/bot_ip_ranges_compact`, {
      method: 'POST',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: '{}',
    });
    if (!response.ok) {
      console.error('ai_crawler_hits: bot_ip_ranges read failed', response.status);
      return cache?.ranges ?? null;
    }
    cache = { at: Date.now(), ranges: rangesFrom(await response.json()) };
    return cache.ranges;
  } catch (error) {
    console.error('ai_crawler_hits: bot_ip_ranges read error', String(error).slice(0, 200));
    return cache?.ranges ?? null;
  }
}

const rdnsCache = new Map<string, string>();

/** Deno's resolver with a timeout; null if this runtime has no DNS API. */
export function denoResolver(timeoutMs = 2000): Resolver | null {
  const deno = (globalThis as { Deno?: { resolveDns?: unknown } }).Deno;
  if (!deno || typeof deno.resolveDns !== 'function') return null;
  const resolveDns = deno.resolveDns as (q: string, t: string, o?: { signal?: AbortSignal }) => Promise<unknown[]>;
  return async (name, type) => {
    const signal = AbortSignal.timeout(timeoutMs);
    const answers = await resolveDns(name, type, { signal });
    return answers.map(String);
  };
}

/** Classify, verify and insert one delivery's crawler requests. Returns rows written. */
export async function recordHits(entries: Entry[], url: string, key: string, fetcher: typeof fetch = fetch,
  resolve: Resolver | null = denoResolver()): Promise<number> {
  const requests = requestsOf(entries);
  if (!requests.length) return 0;
  const ctx: VerifyContext = {
    ranges: await loadRanges(url, key, fetcher),
    now: Date.now(),
    resolve,
    rdnsBudget: { left: 25 },
    rdnsCache,
  };
  const rows = await buildRows(requests, ctx);
  for (let start = 0; start < rows.length; start += 500) {
    const response = await fetcher(`${url}/rest/v1/ai_crawler_hits?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(rows.slice(start, start + 500)),
    });
    if (!response.ok) throw new Error(`insert ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
  return rows.length;
}
