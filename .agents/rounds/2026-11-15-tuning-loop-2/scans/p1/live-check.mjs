const url="http://localhost:8804/mcp";
const h={"content-type":"application/json",accept:"application/json, text/event-stream"};
const parse=async r=>{const t=await r.text();const m=t.match(/data: (.*)/);return JSON.parse(m?m[1]:t)};
let r=await fetch(url,{method:"POST",headers:h,body:JSON.stringify({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-03-26",capabilities:{},clientInfo:{name:"probe",version:"0"}}})});
const sid=r.headers.get("mcp-session-id"); const hh=sid?{...h,"mcp-session-id":sid}:h; await r.text();
await fetch(url,{method:"POST",headers:hh,body:JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"})});
const g="Audit, incident, governance and standards-authorship claims are fact only when";
for (const code of ['async()=>await scout.searchResearch({ q: "SEP-10 web authentication", limit: 2 })','async()=>await scout.listAudits({ limit: 2 })','async()=>({sum:1+1})']){
 const j=await parse(await fetch(url,{method:"POST",headers:hh,body:JSON.stringify({jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"execute",arguments:{code}}})}));
 const x=(j.result?.content??[]).map(c=>c.text).join("");
 console.log(code.slice(0,60),"|",x.length,"chars | guard count",x.split(g).length-1,"at",x.indexOf(g),"| blocks",(x.match(/--- [A-Z -]+ ---/g)||[]).join(" > "));
}
