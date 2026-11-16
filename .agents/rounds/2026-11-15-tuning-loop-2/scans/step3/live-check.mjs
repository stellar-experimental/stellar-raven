// Free, keyless, read-only live check against a local `npm run dev:eval` server (port as argv[2]).
// 1. The end-to-end result: the pointer sentence in the MCP `execute` result, once, only where the rule says.
// 2. The mechanism's ceiling: for each distinct identifier the replay fired on, the call the sentence names
//    (`scout.searchResearch({ q, source })`) and whether the host marks an exact row on the result.
import { readFileSync, writeFileSync } from "node:fs";

const port = process.argv[2] ?? "8812";
const here = new URL(".", import.meta.url).pathname;
const url = `http://localhost:${port}/mcp`;
const h = { "content-type": "application/json", accept: "application/json, text/event-stream" };
const parse = async (r) => { const t = await r.text(); const m = t.match(/data: (.*)/); return JSON.parse(m ? m[1] : t); };
let r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "probe", version: "0" } } }) });
const sid = r.headers.get("mcp-session-id"); const hh = sid ? { ...h, "mcp-session-id": sid } : h; await r.text();
await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
let id = 1;
const execute = async (code) => {
  const j = await parse(await fetch(url, { method: "POST", headers: hh, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method: "tools/call", params: { name: "execute", arguments: { code } } }) }));
  return (j.result?.content ?? []).map((c) => c.text).join("");
};
const SENTENCE = (token, series) => `If \`${token}\` names a document, \`scout.searchResearch\` holds documents of source \`${series}\`: call it with \`{ q: "${token}", source: "${series}" }\`. A row it marks exact is the document itself.`;

const out = { endToEnd: [], ceiling: [] };
const cases = [
  ["names SEP-45 in a Docs search, no research", 'async()=>{const r=await stellarDocs.search_docs({query:"SEP-45 contract auth",hitsPerPage:2});return {ok:r.ok}}', ["SEP-45", "sep"], 1],
  ["names SEP-45 and a phrase (audit 2024, release 23, paper 1)", 'async()=>{const r=await stellarDocs.search_docs({query:"SEP-45 audit 2024 release 23 paper 1 incident 2023",hitsPerPage:2});return {ok:r.ok}}', ["SEP-45", "sep"], 1],
  ["phrases only", 'async()=>{const r=await stellarDocs.search_docs({query:"audit 2024 release 23 paper 1 incident 2023 SEP 45",hitsPerPage:2});return {ok:r.ok}}', null, 0],
  ["names SEP-45 and researches it", 'async()=>{const a=await stellarDocs.search_docs({query:"SEP-45",hitsPerPage:2});const b=await scout.searchResearch({q:"SEP-45",source:"sep",limit:2});return {a:a.ok,b:b.ok,exact:b.exactRows}}', null, 0],
  ["names SEP-45, researches CAP-46 only", 'async()=>{const a=await stellarDocs.search_docs({query:"SEP-45",hitsPerPage:2});const b=await scout.searchResearch({q:"CAP-46",source:"cap",limit:2});return {a:a.ok,b:b.ok}}', ["SEP-45", "sep"], 1],
  ["names a document that does not exist", 'async()=>{const a=await stellarDocs.search_docs({query:"SEP-99999",hitsPerPage:2});return {a:a.ok}}', ["SEP-99999", "sep"], 1],
  ["no identifier", 'async()=>{const a=await stellarDocs.search_docs({query:"trustline limits",hitsPerPage:2});return {a:a.ok}}', null, 0]
];
for (const [name, code, expect, count] of cases) {
  const text = await execute(code);
  const holds = expect ? text.includes(SENTENCE(...expect)) : false;
  const occurrences = text.split("names a document, `scout.searchResearch` holds documents of source").length - 1;
  out.endToEnd.push({ name, resultChars: text.length, sentenceOnce: expect ? holds && occurrences === 1 : null, occurrences, expectedOccurrences: count, blocks: (text.match(/--- [A-Z -]+ ---/g) || []).join(" > ") });
}

const identifiers = JSON.parse(readFileSync(`${here}identifiers.json`, "utf8"));
for (let i = 0; i < identifiers.length; i += 4) {
  const batch = identifiers.slice(i, i + 4);
  const code = `async()=>{const items=${JSON.stringify(batch.map((x) => ({ key: x.key, q: x.written[0], source: x.series })))};
    const rs=await Promise.all(items.map(it=>scout.searchResearch({q:it.q,source:it.source,limit:5})));
    return items.map((it,k)=>{const r=rs[k];return {key:it.key,ok:r.ok,kind:r.ok?undefined:r.error.kind,rows:r.ok?(r.data.results??[]).length:0,exact:r.ok?(r.exactRows??[]).map(x=>x.key):[]}})}`;
  const text = await execute(code);
  // The returned value comes first; the host's source-metadata footer follows it.
  const json = text.split("\n--- ")[0];
  out.ceiling.push(...JSON.parse(json));
}
// A named identifier that does not exist: the call the sentence names, and what comes back.
{
  const text = await execute(`async()=>{const r=await scout.searchResearch({q:"SEP-99999",source:"sep",limit:5});return {ok:r.ok,rows:r.ok?(r.data.results??[]).length:0,exact:r.ok?(r.exactRows??[]).map(x=>x.key):[],caveat:r.caveat}}`);
  out.nonexistent = JSON.parse(text.split("\n--- ")[0]);
}
const exact = out.ceiling.filter((x) => x.exact.length > 0);
out.summary = { identifiers: out.ceiling.length, ok: out.ceiling.filter((x) => x.ok).length, withRows: out.ceiling.filter((x) => x.rows > 0).length, exactRowReturned: exact.length, noExactRow: out.ceiling.filter((x) => x.exact.length === 0).map((x) => x.key) };
writeFileSync(`${here}live-check.json`, `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify(out.endToEnd, null, 1));
console.log(JSON.stringify(out.summary));
console.log(JSON.stringify(out.nonexistent));
