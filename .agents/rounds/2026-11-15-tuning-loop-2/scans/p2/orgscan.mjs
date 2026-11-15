import { readFileSync } from "node:fs";
import { loadManifest, searchCatalogPage } from "/home/tyler/code/raven-wt/loop2-run/src/catalog/search.ts";
import { searchCallsOf, operationsCalledIn } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-step2-roles.mjs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";
const S="/tmp/claude-1000/-home-tyler-code-raven-wt-loop2-run/800b3a03-ae31-428e-81ce-4e920da3cd93/scratchpad";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL=readFileSync(`${R}/scans/panel-ids.txt`,"utf8").trim().split(",");
const SRC=["q-asset-usdc-eurc-issuer","q-comp-aml-analytics-vendors","q-data-network-metrics-sources","q-eco-stellar-rwa-stablecoin-volume","q-hot-fee-pool-burn-deflation","q-hot-sdf-xlm-holdings-sales","q-org-sdf-structure-mandate","q-raph-official-help-sdf-cannot-recover","q-scf-ambassador-program","q-scf-how-to-apply","q-scf-vs-sdf-enterprise-fund","q-soroban-pre-mainnet-security-steps"];
const cat=loadManifest(JSON.parse(readFileSync(`${S}/manifest-with.json`,"utf8")));
const ids=new Set(cat.entries.filter(e=>e.kind==="operation").map(e=>e.id));
const load=f=>new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>PANEL.includes(r.id)).map(r=>[r.id,r]));
const P1=load("2026-11-15T05-28-42"),P2=load("2026-11-15T07-33-40"),P0=load("2026-11-15T04-31-41");
const page=(args,limit)=>searchCatalogPage(cat,{query:args.query,kind:args.kind,service:args.service,limit}).hits.map(h=>h.id);
const out=[];
for(const id of PANEL){
  const r=P2.get(id),p1=P1.get(id);
  const calls=searchCallsOf(r.transcript);
  const called=operationsCalledIn(r.transcript,ids), called1=operationsCalledIn(p1.transcript,ids);
  const orgCalled=[...called].filter(x=>x.startsWith("stellarOrg."));
  const cards=[];
  for(const a of calls){const lim=a.limit??7;const hits=page(a,lim);hits.forEach((h,i)=>{if(h.startsWith("stellarOrg."))cards.push({q:a.query,limit:lim,default:a.limit===undefined,rank:i+1,id:h,above:hits.slice(i+1).filter(x=>called1.has(x))})})}
  const defaults=calls.filter(a=>a.limit===undefined).length;
  out.push({id,src:SRC.includes(id),searches:calls.length,defaults,limits:calls.map(a=>a.limit??"def"),orgCalled,cards,
   p1OpsCalledAboveOrg:cards.flatMap(c=>c.above)});
}
console.log("rows with search",out.filter(o=>o.searches).length,"searches",out.reduce((s,o)=>s+o.searches,0),"default-limit searches",out.reduce((s,o)=>s+o.defaults,0),"rows with a default search",out.filter(o=>o.defaults).length);
const lims={};out.forEach(o=>o.limits.forEach(l=>lims[l]=(lims[l]||0)+1));console.log("limits",JSON.stringify(lims));
console.log("\nrows where a stellarOrg op was called in a script:");
for(const o of out.filter(o=>o.orgCalled.length))console.log(" ",o.id,o.src?"[SRC]":"[NON-SOURCE]",o.orgCalled.join(","));
console.log("\nrows whose P2 search page carries a stellarOrg card (replayed on the frozen catalog):");
for(const o of out.filter(o=>o.cards.length))console.log(" ",o.id,o.src?"[SRC]":"[non-source]",o.cards.map(c=>`rank ${c.rank}/${c.limit}${c.default?" (default)":""} ${c.id}`).join("; "),"| P1-called ops below it:",[...new Set(o.p1OpsCalledAboveOrg)].join(",")||"none");
console.log("\nsource-exposed rows outside the 12:",out.filter(o=>!o.src&&(o.cards.length||o.orgCalled.length)).map(o=>o.id));
import { writeFileSync } from "node:fs"; writeFileSync("/tmp/claude-1000/orgscan.json",JSON.stringify(out,null,1));
