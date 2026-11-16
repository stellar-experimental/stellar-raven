// Free, keyless live check against a local `npm run dev:eval` server (port as argv[2], default 8811).
// Each script runs through MCP HTTP `execute`; the host blocks of the result are listed in order.
const port = process.argv[2] ?? "8811";
const url = `http://localhost:${port}/mcp`;
const h = { "content-type": "application/json", accept: "application/json, text/event-stream" };
const parse = async (r) => { const t = await r.text(); const m = t.match(/data: (.*)/); return JSON.parse(m ? m[1] : t); };
let r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "probe", version: "0" } } }) });
const sid = r.headers.get("mcp-session-id"); const hh = sid ? { ...h, "mcp-session-id": sid } : h; await r.text();
await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
const guard = "Audit, incident, governance and standards-authorship claims are fact only when";
const detailOrg = "`stellarOrg.search_site` returned page rows, not whole pages.";
const detailDocs = "returned sections of pages, not whole pages.";
const scripts = [
  'async()=>{const r=await stellarOrg.search_site({query:"strategy",limit:3});return {ok:r.ok,kinds:r.ok?r.data.hits.map(h=>h.kind+":"+(h.path??h.url??"")):r.error}}',
  'async()=>{const r=await stellarOrg.get_page({path:"/foundation/strategy"});return {ok:r.ok,title:r.ok?r.data.title:r.error,chars:r.ok?r.data.content.length:0}}',
  'async()=>{const s=await stellarOrg.search_site({query:"roadmap",limit:2});const p=s.ok&&s.data.hits.find(h=>h.path)?await stellarOrg.get_page({path:s.data.hits.find(h=>h.path).path}):null;return {search:s.ok,page:p&&p.ok}}',
  'async()=>await stellarDocs.search_docs({query:"trustline",hitsPerPage:2})',
  'async()=>({sum:1+1})'
];
for (const code of scripts) {
  const j = await parse(await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "execute", arguments: { code } } }) }));
  const x = (j.result?.content ?? []).map((c) => c.text).join("");
  console.log(code.slice(0, 70).padEnd(70), "|", String(x.length).padStart(6), "chars | guard", x.split(guard).length - 1, "| org-detail", x.includes(detailOrg), "| docs-detail", x.includes(detailDocs), "| blocks", (x.match(/--- [A-Z -]+ ---/g) || []).join(" > "));
}
// The public `search` page with no `limit` holds the default number of hits, and its size.
for (const query of ["stellar soroban contract documentation", "SDF strategy roadmap"]) {
  const j = await parse(await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search", arguments: { query } } }) }));
  const text = (j.result?.content ?? []).map((c) => c.text).join("");
  const page = JSON.parse(text);
  console.log("search".padEnd(70), "|", String(text.length).padStart(6), "chars |", page.hits.length, "hits |", page.hits.map((x) => x.id.split(".")[0]).join(","));
}
