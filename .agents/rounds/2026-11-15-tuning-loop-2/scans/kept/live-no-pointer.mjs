const url = "http://localhost:8814/mcp";
const h = { "content-type": "application/json", accept: "application/json, text/event-stream" };
const parse = async (r) => { const t = await r.text(); const m = t.match(/data: (.*)/); return JSON.parse(m ? m[1] : t); };
let r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "probe", version: "0" } } }) });
const sid = r.headers.get("mcp-session-id"); const hh = sid ? { ...h, "mcp-session-id": sid } : h; await r.text();
await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
let id = 1;
const execute = async (code) => { const j = await parse(await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method: "tools/call", params: { name: "execute", arguments: { code } } }) })); return (j.result?.content ?? []).map((c) => c.text).join(""); };
const cases = {
  "docs search naming SEP-45": 'async()=>{const r=await stellarDocs.search_docs({query:"SEP-45 contract auth",hitsPerPage:2});return {ok:r.ok}}',
  "research with Sep-24 (title case)": 'async()=>{const r=await scout.searchResearch({q:"Sep-24",source:"sep",limit:5});return {ok:r.ok,exact:r.exactRows}}',
  "research with SEP-24": 'async()=>{const r=await scout.searchResearch({q:"SEP-24",source:"sep",limit:5});return {ok:r.ok,exact:(r.exactRows??[]).map(x=>x.key)}}',
  "research with sep-24": 'async()=>{const r=await scout.searchResearch({q:"sep-24",source:"sep",limit:5});return {ok:r.ok,exact:(r.exactRows??[]).map(x=>x.key)}}',
};
for (const [name, code] of Object.entries(cases)) {
  const t = await execute(code);
  const first = t.split("\n--- ")[0].slice(0, 200).replace(/\s+/g, " ");
  console.log(JSON.stringify({ name, chars: t.length, pointerSentence: /names a document/.test(t) || /holds documents of source/.test(t), exactRowException: /exact/i.test(t.split("\n--- ").slice(1).join("")), value: first }));
}
