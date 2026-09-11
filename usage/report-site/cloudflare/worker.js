export const ARCHIVE_START = '2026-09-11T14:34:59.000Z';

export function bounds(now) {
  return {
    start: Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1),
    end: now.getTime()
  };
}

export { countsSql, receiptsSql } from './queries.js';
import { countsSql, receiptsSql, healthSql } from './queries.js';

async function authorized(request, token) {
  if (!token) return false;
  const header = request.headers.get('Authorization') || '';
  if (header.length > 256) return false;
  const digest = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [actual, expected] = await Promise.all([digest(header), digest(`Bearer ${token}`)]);
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}

export default {
  async fetch(request, env, ctx) {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (!(await authorized(request, env.REPORT_TOKEN))) return new Response('Unauthorized', { status: 401, headers });
    const url = new URL(request.url);
    if (url.pathname !== '/report' || url.search) return new Response('Not found', { status: 404, headers });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
    // Authenticate before accessing the aggregate cache. No account identifiers leave D1.
    const key = new Request(`${url.origin}/report`);
    const cache = globalThis.caches?.default;
    const cached = await cache?.match(key);
    if (cached) return new Response(cached.body, { headers: { ...headers, 'Content-Type': 'application/json' } });
    try {
      const now = new Date(), { start, end } = bounds(now);
      const queries = [countsSql('%Y-%m'), countsSql('%Y-%m-%d'), receiptsSql];
      const results = await env.USAGE.batch([...queries.map(sql => env.USAGE.prepare(sql).bind(start, end)), env.USAGE.prepare(healthSql).bind(end - 86400000, end)]);
      if (results.some(result => !result.success)) throw new Error('Query failed');
      const response = Response.json({
        schema: 1, generatedAt: now.toISOString(), timezone: 'UTC',
        retentionMonths: 13, retainedFrom: new Date(start).toISOString(), archiveStart: ARCHIVE_START,
        months: results[0].results, days: results[1].results, receipts: results[2].results, health: results[3].results[0]
      }, { headers });
      if (cache) ctx.waitUntil(cache.put(key, new Response(response.clone().body, {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
      })));
      return response;
    } catch {
      console.error('usage_report_query_failed');
      return Response.json({ error: 'Report unavailable' }, { status: 503, headers });
    }
  }
};
