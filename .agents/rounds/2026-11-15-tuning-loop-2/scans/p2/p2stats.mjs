import { readFileSync } from "node:fs";
import { scanPass, seriesOfCatalog } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-corroboration.mjs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL=readFileSync(`${R}/scans/panel-ids.txt`,"utf8").trim().split(",");
const ID17=["q-comp-aml-analytics-vendors","q-comp-sep8-regulated-assets-approval-server","q-crp-oz-rwa-erc3643-trex","q-edge-asset-site-scam-detection","q-edge-inject-ignore-instructions","q-net-protocol-meeting-notes-find-cap","q-nft-vault-contract-standards","q-pc-cross-redstone-sep40","q-pc-quantum-preparedness-dormant","q-pc-sponsored-reserves","q-sep-43-web-wallet-api","q-sep-45-contract-auth","q-sep-53-sign-verify-message","q-sep24-interactive-deposit-flow","q-sep6-sep24-sep31-choice","q-soroban-oz-token","q-zk-host-functions-status"];
const manifest=JSON.parse(readFileSync("/home/tyler/code/raven-wt/loop2-run/catalog/manifest.json","utf8"));
const series=seriesOfCatalog(manifest), operationIds=new Set(manifest.entries.map(e=>e.id));
const G="Audit, incident, governance and standards-authorship claims are fact only when";
const med=a=>{a=[...a].sort((x,y)=>x-y);const m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2};const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const runs={P0:"2026-11-15T04-31-41",P1:"2026-11-15T05-28-42",P2:process.argv[2]};
for(const [l,f] of Object.entries(runs)){
 const rows=JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>PANEL.includes(r.id));
 const ex=r=>(r.transcript||[]).filter(e=>/execute$/.test(e.tool||""));
 let results=0,blocks=0,blockGuard=0,standalone=0,multi=0,trunc=0,big=0,maxChars=0,guardRows=new Set();
 for(const r of rows) for(const e of ex(r)){const t=String(e.result??"");results++;const g=t.split(G).length-1;const b=/--- CANDIDATE EVIDENCE ---/.test(t);if(b)blocks++;if(b&&g===1)blockGuard++;if(!b&&g>=1)standalone++;if(g>1)multi++;if(g)guardRows.add(r.id);if(/--- SOURCE BASIS ---/.test(t))trunc++;maxChars=Math.max(maxChars,t.length);if(t.length>=20000)big++}
 const cost=rows.map(r=>r.agent.costUsd),turns=rows.map(r=>r.agent.turns),dur=rows.map(r=>r.durationMs/1000);
 const inTok=rows.map(r=>{const u=r.agent.usage?.final??{};return (u.input_tokens||0)+(u.cache_creation_input_tokens||0)+(u.cache_read_input_tokens||0)});
 const res=rows.map(r=>ex(r).reduce((s,e)=>s+(e.resultChars??String(e.result??"").length),0));
 const id17=rows.filter(r=>ID17.includes(r.id)).map(r=>scanPass(r,{operationIds,series}));
 const named=id17.filter(s=>s.identifierNamed),withR=named.filter(s=>!s.identifierWithoutResearch);
 console.log(`${l}: rows ${rows.length} execResults ${results} withBlock ${blocks} blockWithGuardOnce ${blockGuard} standaloneGuard ${standalone} guardTwice ${multi} rowsWithGuard ${guardRows.size} truncated(SOURCE BASIS) ${trunc} >=20000ch ${big} max ${maxChars}`);
 console.log(`   agent$ ${cost.reduce((a,b)=>a+b,0).toFixed(3)} med ${med(cost).toFixed(4)} mean ${mean(cost).toFixed(4)} turns med ${med(turns)} mean ${mean(turns).toFixed(2)} inTok med ${Math.round(med(inTok))} mean ${Math.round(mean(inTok))} execChars med ${Math.round(med(res))} dur med ${med(dur).toFixed(1)}s`);
 console.log(`   identifier rows named ${named.length} research-with-identifier ${withR.length} (${(100*withR.length/named.length).toFixed(0)}%)  anyResearch ${rows.filter(r=>ID17.includes(r.id)&&ex(r).some(e=>/scout\.searchResearch/.test(String(e.input??""))) ).length}`);
}
