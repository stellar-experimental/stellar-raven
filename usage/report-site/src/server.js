import assets from './assets.js';
import { renderLaunch, launchCsv, launchMarkdown } from './launch.js';

const security = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { ...security, Allow: 'GET, HEAD' } });
    }
    const launch = ['/launch', '/launch.csv', '/launch-report.md'].includes(url.pathname);
    if (url.pathname === '/api/report' || launch) {
      if (!env.USAGE_REPORT_URL || !env.USAGE_REPORT_TOKEN) {
        return Response.json({ error: 'The report connection is not configured.' }, { status: 503, headers: security });
      }
      try {
        const upstream = new URL(env.USAGE_REPORT_URL);
        if (launch) upstream.pathname = '/launch';
        if (upstream.protocol !== 'https:') throw new Error('HTTPS required');
        const result = await fetch(upstream, {
          headers: { Authorization: `Bearer ${env.USAGE_REPORT_TOKEN}`, 'User-Agent': 'Raven-Usage-Report/1.0' },
          redirect: 'manual', signal: AbortSignal.timeout(15000)
        });
        if (launch && result.status === 404) return new Response('The historical report is absent or expired.', { status: 404, headers: security });
        if (!result.ok) throw new Error('Upstream unavailable');
        const data = await result.json();
        if (launch) {
          if (!Array.isArray(data.months) || !Array.isArray(data.toolWindows)) throw new Error('Invalid snapshot');
          const [body, type] = url.pathname === '/launch.csv' ? [launchCsv(data), 'text/csv; charset=utf-8']
            : url.pathname === '/launch-report.md' ? [launchMarkdown(data), 'text/markdown; charset=utf-8']
              : [renderLaunch(data), 'text/html; charset=utf-8'];
          return new Response(request.method === 'HEAD' ? null : body, { headers: { ...security, 'Content-Type': type } });
        }
        if (data.schema !== 1 || !Array.isArray(data.months) || !Array.isArray(data.days)) throw new Error('Invalid report');
        return Response.json(data, { headers: security });
      } catch {
        return Response.json({ error: 'The report could not refresh. Try again shortly.' }, { status: 502, headers: security });
      }
    }
    const asset = assets[url.pathname];
    if (!asset) return new Response('Not found', { status: 404, headers: security });
    return new Response(request.method === 'HEAD' ? null : asset.body, {
      headers: { ...security, 'Content-Type': asset.type }
    });
  }
};
