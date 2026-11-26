/// <reference lib="deno.ns" />
// deno test supabase/functions/vercel-drain/hits_test.ts
// Fixtures follow real Vercel drain entries (2026-11-26) with every address replaced:
// documentation ranges (192.0.2.x, 203.0.113.x, 2001:db8::) or an address picked from
// an operator's *published* list, never a visitor's.
import {
  agentWord, buildRows, classify, cleanPath, inNetworks, parseCidr, parseIp, prefixOf, rangesFrom,
  rdnsCheck, recordHits, requestsOf, type Entry, type Network, type VerifyContext,
} from './hits.ts';

function eq(actual: unknown, expected: unknown, label = '') {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}\n  expected ${e}\n  actual   ${a}`);
}

const UA = {
  gpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)',
  chatgptUser: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  bing: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
  gImage: 'Googlebot-Image/1.0',
  exa: 'Mozilla/5.0 (compatible; ExaSearchBot/1.0; +https://crawler.exa.ai/)',
  petal: 'Mozilla/5.0 (Linux; Android 7.0;) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; PetalBot;+https://webmaster.petalsearch.com/site/petalbot)',
  yandex: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  claudeUser: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
  feedly: 'Feedly/1.0 (+http://www.feedly.com/fetcher.html; )',
  hatch: 'HatchFeed/1.0 (+https://agent.meta.ai; link preview)',
};

function entry(over: Partial<{ id: string; requestId: string; host: string; path: string; status: number | null;
  ua: string; ip: string; source: string; ts: number }> = {}): Entry {
  const ts = over.ts ?? 1795698353421;
  return {
    id: over.id ?? `id-${Math.random()}`,
    requestId: over.requestId ?? `req-${Math.random()}`,
    source: over.source ?? 'static',
    host: over.host ?? 'jasonzhu.ai',
    ja4Digest: 't13d2212h2_231e334592e8_36bf25f296df',
    statusCode: over.status === undefined ? 200 : over.status,
    timestamp: ts + 190,
    proxy: {
      clientIp: over.ip ?? '203.0.113.7',
      host: over.host ?? 'jasonzhu.ai',
      method: 'GET',
      path: over.path ?? '/zh/blog/some-post',
      statusCode: over.status === undefined ? 200 : over.status ?? undefined,
      timestamp: ts,
      userAgent: [over.ua ?? UA.gpt],
    },
  };
}

Deno.test('classify follows GEOInflow token rules', () => {
  eq(classify(UA.gpt), { name: 'GPTBot', vendor: 'OpenAI', type: '训练' });
  eq(classify(UA.chatgptUser), { name: 'ChatGPT-User', vendor: 'OpenAI', type: '用户触发' });
  eq(classify(UA.bing).name, 'bingbot');
  eq(classify(UA.gImage).name, 'Googlebot-Image', 'child crawler wins over parent');
  eq(classify('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Googlebot-Image/1.0').name,
    'Googlebot-Image', 'both tokens: the child counts');
  eq(classify(UA.exa), { name: 'ExaSearchBot', vendor: 'Exa', type: '搜索' });
  eq(classify('ExaSearchBot-Images').name, '其他', 'ExaSearchBot-Images is not ExaSearchBot (GEOInflow agrees)');
  eq(classify(UA.petal), { name: '其他', vendor: '', type: '其他' }, 'PetalBot is pending in GEOInflow');
  eq(classify(UA.feedly).name, '其他', 'fetcher.html inside a URL is not a token');
  eq(classify(UA.claudeUser).name, 'Claude-User');
  eq(classify('Mozilla/5.0 (compatible; Sogou web spider/4.0; +http://www.sogou.com/docs/help/webmasters.htm#07)').name,
    'Sogou web spider');
});

Deno.test('agentWord names unmapped crawlers without the UA', () => {
  eq(agentWord(UA.petal), 'PetalBot');
  eq(agentWord(UA.hatch), 'HatchFeed');
  eq(agentWord('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ShapBot/0.1.0'), 'ShapBot');
  eq(agentWord('RiverBot/1.0 (+https://river.ai/bot)'), 'RiverBot');
  eq(agentWord('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 (compatible; meta-webindexer/1.1)'),
    'meta-webindexer');
});

Deno.test('prefixes match GEOInflow ip_masked and never keep the host part', () => {
  eq(prefixOf(parseIp('203.0.113.77')), '203.0.113.0/24');
  eq(prefixOf(parseIp('::ffff:192.0.2.9')), '192.0.2.0/24', 'IPv4-mapped is IPv4');
  eq(prefixOf(parseIp('2001:db8:85a3::8a2e:370:7334')), '2001:db8:85a3::/48');
  eq(prefixOf(parseIp('2001:0db8:0000:0000::1')), '2001:db8:0::/48');
  eq(prefixOf(parseIp('not-an-ip')), '');
  eq(prefixOf(parseIp('999.1.1.1')), '');
});

Deno.test('CIDR membership, v4 and v6', () => {
  const nets = ['20.171.206.0/24', '74.7.175.128/25', '2600:1f28:365:80b0::/60'].map(parseCidr) as Network[];
  eq(inNetworks(parseIp('20.171.206.33')!, nets), true);
  eq(inNetworks(parseIp('74.7.175.200')!, nets), true);
  eq(inNetworks(parseIp('74.7.175.100')!, nets), false);
  eq(inNetworks(parseIp('2600:1f28:365:80b5::1')!, nets), true);
  eq(inNetworks(parseIp('2600:1f28:365:80c0::1')!, nets), false);
  eq(parseCidr('1.2.3.4/33'), null);
});

Deno.test('paths drop query strings like GEOInflow canonicalPath', () => {
  eq(cleanPath('/zh/blog/x?utm=1#top'), '/zh/blog/x');
  eq(cleanPath('/a b'), '/a%20b');
  eq(cleanPath('/中文'), '/%E4%B8%AD%E6%96%87');
  eq(cleanPath('//evil.example/x?y'), '//evil.example/x');
  eq(cleanPath('/' + 'a'.repeat(600)).length, 500);
});

Deno.test('requestsOf: this site only, one row per request, firewall 403', () => {
  const rows = requestsOf([
    entry({ id: 'a', requestId: 'r1' }),
    entry({ id: 'b', requestId: 'r1' }),                       // second log line of the same request
    entry({ id: 'c', requestId: 'r2', host: 'jasonzhuai.vercel.app' }),
    entry({ id: 'd', requestId: 'r3', host: 'www.jasonzhu.ai' }),
    entry({ id: 'e', requestId: 'r4', source: 'firewall', status: null }),
  ]);
  eq(rows.map(r => r.key), ['r1', 'r3', 'r4']);
  eq(rows[2].status, 403);
  eq(rows[0].ts, new Date(1795698353421).toISOString());
});

function ctx(over: Partial<VerifyContext> = {}): VerifyContext {
  return {
    ranges: rangesFrom([
      { bot: 'GPTBot', fetched_at: new Date().toISOString(), cidrs: ['20.171.206.0/24'] },
      { bot: 'ClaudeBot', fetched_at: new Date(Date.now() - 9 * 86400e3).toISOString(), cidrs: ['192.0.2.0/24'] },
    ]),
    now: Date.now(),
    resolve: null,
    rdnsBudget: { left: 5 },
    rdnsCache: new Map(),
    ...over,
  };
}

Deno.test('verification labels', async () => {
  const rows = await buildRows(requestsOf([
    entry({ requestId: 'v1', ua: UA.gpt, ip: '20.171.206.9' }),
    entry({ requestId: 'v2', ua: UA.gpt, ip: '203.0.113.7' }),
    entry({ requestId: 'v3', ua: UA.exa }),
    entry({ requestId: 'v4', ua: UA.petal }),
    entry({ requestId: 'v5', ua: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', ip: '192.0.2.5' }),
    entry({ requestId: 'v6', ua: UA.chatgptUser }),
    entry({ requestId: 'v7', ua: UA.yandex }),
    entry({ requestId: 'v8', ua: UA.gpt, ip: 'garbage' }),
  ]), ctx());
  eq(rows.map(r => [r.bot, r.verification, r.method, r.reason]), [
    ['GPTBot', 'verified', 'ip_range', 'verified_range'],
    ['GPTBot', 'range_mismatch', 'ip_range', 'range_mismatch'],
    ['ExaSearchBot', 'no_published_ranges', 'none', 'no_official_source'],
    ['其他', 'unknown', 'none', 'unmapped_identity'],
    ['ClaudeBot', 'unknown', 'none', 'stale_snapshot'],
    ['ChatGPT-User', 'unknown', 'none', 'missing_snapshot'],
    ['YandexBot', 'unknown', 'none', 'dns_unavailable'],
    ['GPTBot', 'unknown', 'none', 'untrusted_ip'],
  ]);
  eq(rows[3].agent, 'PetalBot');
  eq(rows[0].agent, null);
  eq(rows[0].ip_prefix, '20.171.206.0/24');
  for (const row of rows) {
    const text = JSON.stringify(row);
    if (/20\.171\.206\.9\b|203\.0\.113\.7\b|192\.0\.2\.5\b/.test(text)) throw new Error('full IP leaked: ' + text);
  }
});

Deno.test('reverse DNS: forward-confirmed, cached, budgeted', async () => {
  const zone: Record<string, string[]> = {
    '9.2.0.192.in-addr.arpa': ['spider-192-0-2-9.yandex.com.'],
    'spider-192-0-2-9.yandex.com': ['192.0.2.9'],
    '8.2.0.192.in-addr.arpa': ['fake.yandex.com.evil.example.'],
  };
  let calls = 0;
  const resolve = async (name: string) => {
    calls++;
    if (!(name in zone)) throw Object.assign(new Error('no record'), { name: 'NotFound' });
    return zone[name];
  };
  eq(await rdnsCheck(parseIp('192.0.2.9')!, ['yandex.com'], resolve), 'verified_rdns');
  eq(await rdnsCheck(parseIp('192.0.2.8')!, ['yandex.com'], resolve), 'rdns_mismatch');
  const c = ctx({ resolve, rdnsBudget: { left: 2 } });
  calls = 0;
  const rows = await buildRows(requestsOf([
    entry({ requestId: 'y1', ua: UA.yandex, ip: '192.0.2.9' }),
    entry({ requestId: 'y2', ua: UA.yandex, ip: '192.0.2.7' }),
    entry({ requestId: 'y3', ua: UA.yandex, ip: '192.0.2.6' }),
  ]), c);
  eq(rows.map(r => r.reason), ['verified_rdns', 'rdns_mismatch', 'dns_budget_exhausted']);
  const again = await buildRows(requestsOf([entry({ requestId: 'y4', ua: UA.yandex, ip: '192.0.2.9' })]), c);
  eq(again[0].reason, 'verified_rdns', 'cache hit needs no budget');
});

Deno.test('recordHits posts once per delivery with ignore-duplicates and survives a dead range read', async () => {
  const calls: { url: string; body: string; prefer: string | null }[] = [];
  const fake = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: String(init?.body ?? ''), prefer: new Headers(init?.headers).get('prefer') });
    if (url.includes('/rpc/')) return new Response('boom', { status: 503 });
    return new Response(null, { status: 201 });
  }) as typeof fetch;
  const n = await recordHits([entry({ requestId: 'k1' }), entry({ requestId: 'k2', ua: UA.exa })],
    'http://fake', 'key', fake, null);
  eq(n, 2);
  const insert = calls.find(c => c.url.includes('/ai_crawler_hits'))!;
  eq(insert.url, 'http://fake/rest/v1/ai_crawler_hits?on_conflict=id');
  eq(insert.prefer, 'resolution=ignore-duplicates,return=minimal');
  const body = JSON.parse(insert.body);
  eq(body.map((r: { reason: string }) => r.reason), ['missing_snapshot', 'no_official_source']);
});
