import { readFileSync } from "node:fs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const G10=readFileSync(`${R}/scans/guard-ids.txt`,"utf8").trim().split(",");
const G="Audit, incident, governance and standards-authorship claims are fact only when";
const runs={P0:"2026-11-15T04-31-41",P1:"2026-11-15T05-28-42",P2:"2026-11-15T05-38-45",P3:"2026-11-15T05-45-31"};
const D={};for(const [l,f] of Object.entries(runs)){D[l]=new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>G10.includes(r.id)).map(r=>[r.id,r]))}
const info=r=>{const ex=(r.transcript||[]).filter(e=>/execute$/.test(e.tool||""));const blocks=ex.filter(e=>/--- CANDIDATE EVIDENCE ---/.test(String(e.result??""))).length;const g=ex.filter(e=>String(e.result??"").includes(G)).length;return {blocks,guard:g,s:r.verdict.score,t:r.verdict.meta.judgeTierUsed==="panel"?"P":"s"}};
console.log("row | P0 | P1 | P2 | P3   (verdict tier; b=blocks g=guard results)");
for(const id of G10){const row=[id];for(const l of Object.keys(runs)){const i=info(D[l].get(id));row.push(`${i.s}${i.t} b${i.blocks} g${i.guard}`)}console.log(row.join(" | "))}
for(const l of Object.keys(runs)){let b=0,g=0,bn=0;for(const id of G10){const i=info(D[l].get(id));b+=i.blocks;g+=i.guard;if(i.blocks&&!i.guard)bn++}console.log(l,"blocks",b,"guard results",g)}
