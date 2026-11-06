// Free read-only Discovery and public site-MCP searches. Never logs request headers/key.
// Run: node research/audits/2026-11-06-remaining-sweep/docs-search.mjs
import {readFileSync,writeFileSync} from 'node:fs';
const out='tmp/sweep-2026-11-06/docs/';
const env=readFileSync('.dev.vars','utf8');
const match=env.match(/^MINTLIFY_ASSISTANT_API_KEY\s*=\s*(.*)$/m);
const key=process.env.MINTLIFY_ASSISTANT_API_KEY || match?.[1]?.trim().replace(/^['"]|['"]$/g,'');
if(!key)throw Error('Missing assistant key');
const qs=['op_bad_signer','op_too_many_signers','op_line_full','op_cross_self','tx_bad_auth_extra','op_low_reserve','Any additional signers added to the account cannot be the master key','transaction inclusion proof'];
const results=[];
for(const query of qs){
 const r=await fetch('https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({query,pageSize:50}),signal:AbortSignal.timeout(30000)});
 const data=await r.json();
 const row={query,status:r.status,observedAt:new Date().toISOString(),data};
 if(query==='op_bad_signer'){
  const s=await fetch('https://developers.stellar.org/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'search_stellar_developer_docs',arguments:{query}}}),signal:AbortSignal.timeout(30000)});
  row.siteMcp={status:s.status,text:await s.text()};
 }
 results.push(row);
}
writeFileSync(out+'search-receipts.json',JSON.stringify(results,null,2)+'\n');
console.log(results.map(({query,status,data})=>({query,status,keys:Object.keys(data)})));
