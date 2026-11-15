const url="http://localhost:8806/mcp";
const h={"content-type":"application/json",accept:"application/json, text/event-stream"};
const parse=async r=>{const t=await r.text();const m=t.match(/data: (.*)/);return JSON.parse(m?m[1]:t)};
let r=await fetch(url,{method:"POST",headers:h,body:JSON.stringify({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-03-26",capabilities:{},clientInfo:{name:"probe",version:"0"}}})});
const sid=r.headers.get("mcp-session-id"); const hh=sid?{...h,"mcp-session-id":sid}:h; await r.text();
await fetch(url,{method:"POST",headers:hh,body:JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"})});
const call=async code=>{const j=await parse(await fetch(url,{method:"POST",headers:hh,body:JSON.stringify({jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"execute",arguments:{code}}})}));return (j.result?.content??[]).map(c=>c.text).join("")};
const PT="names a document, `scout.searchResearch` holds documents of source";
const cases={
 "A named SEP-45 in a Docs call, no research": 'async()=>{const r=await stellarDocs.search_docs({query:"SEP-45 contract account authentication",hitsPerPage:2});return {ok:r.ok}}',
 "B research already called for SEP-45": 'async()=>{const r=await scout.searchResearch({q:"SEP-45",source:"sep",limit:2});const d=await stellarDocs.search_docs({query:"SEP-45 contract auth",hitsPerPage:1});return {a:r.ok,b:d.ok}}',
 "C Sep-24 title case, Docs call": 'async()=>{const r=await stellarDocs.search_docs({query:"Sep-24 interactive deposit",hitsPerPage:2});return {ok:r.ok}}'
};
for(const [k,code] of Object.entries(cases)){const x=await call(code);const n=x.split(PT).length-1;const i=x.indexOf(PT);console.log(k,"| chars",x.length,"| pointer sentences",n,i>=0?"\n   "+x.slice(Math.max(i-40,0),i+190).replace(/\n/g," "):"")}
