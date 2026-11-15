// Unauthenticated MCP probe (initialize, tools/list, prompts/resources). Usage: mkdir probe && node probe.mjs <name> <url>. Writes probe/<name>.json. Sends no credential.
// Unauthenticated MCP probe: initialize, notifications/initialized, tools/list (paginated), prompts/list, resources/list.
import { writeFileSync } from 'node:fs';
const [,, name, url, ...rest] = process.argv;
const out = { name, url, status: {}, };
const H = { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2025-06-18' };
let sid;
async function rpc(method, params, id) {
  const headers = { ...H }; if (sid) headers['mcp-session-id'] = sid;
  const body = JSON.stringify(id === undefined ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id, method, params });
  const r = await fetch(url, { method: 'POST', headers, body, redirect: 'follow', signal: AbortSignal.timeout(30000) });
  const s = r.headers.get('mcp-session-id'); if (s) sid = s;
  const text = await r.text();
  let msg = null;
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('event-stream')) {
    for (const block of text.split(/\n\n/)) {
      const data = block.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
      if (!data) continue;
      try { const j = JSON.parse(data); if (j.id === id || id === undefined) msg = j; } catch {}
    }
  } else { try { msg = JSON.parse(text); } catch {} }
  return { http: r.status, ct, msg, raw: msg ? undefined : text.slice(0, 300), www: r.headers.get('www-authenticate') };
}
try {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'peer-survey-probe', version: '0.0.1' } }, 1);
  out.status.initialize = { http: init.http, ct: init.ct, www: init.www, raw: init.raw };
  if (init.msg?.result) {
    out.initialize = init.msg.result;
    await rpc('notifications/initialized', {}, undefined).catch(() => {});
    const caps = init.msg.result.capabilities || {};
    if (caps.tools || true) {
      const tools = []; let cursor; let pages = 0; const pageSizes = [];
      do {
        const r = await rpc('tools/list', cursor ? { cursor } : {}, 100 + pages);
        out.status.tools = { http: r.http, raw: r.raw, err: r.msg?.error };
        const res = r.msg?.result; if (!res) break;
        tools.push(...res.tools); pageSizes.push(res.tools.length); cursor = res.nextCursor; pages++;
      } while (cursor && pages < 20);
      out.tools = tools; out.toolPages = pageSizes;
    }
    for (const m of ['prompts/list', 'resources/list', 'resources/templates/list']) {
      if ((m.startsWith('prompts') && !caps.prompts) || (m.startsWith('resources') && !caps.resources)) continue;
      const r = await rpc(m, {}, 200); out[m] = r.msg?.result ?? r.msg?.error ?? r.raw;
    }
  }
} catch (e) { out.status.error = String(e); }
writeFileSync(`probe/${name}.json`, JSON.stringify(out, null, 2));
console.log(name, JSON.stringify(out.status), 'tools=', out.tools?.length, 'instr=', out.initialize?.instructions?.length);
