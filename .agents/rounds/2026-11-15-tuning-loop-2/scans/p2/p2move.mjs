import { readFileSync } from "node:fs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL=readFileSync(`${R}/scans/panel-ids.txt`,"utf8").trim().split(",");
const SRC=["q-asset-usdc-eurc-issuer","q-comp-aml-analytics-vendors","q-data-network-metrics-sources","q-eco-stellar-rwa-stablecoin-volume","q-hot-fee-pool-burn-deflation","q-hot-sdf-xlm-holdings-sales","q-org-sdf-structure-mandate","q-raph-official-help-sdf-cannot-recover","q-scf-ambassador-program","q-scf-how-to-apply","q-scf-vs-sdf-enterprise-fund","q-soroban-pre-mainnet-security-steps"];
const ORD={wrong:0,partial:1,correct:2};
const load=f=>new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>PANEL.includes(r.id)).map(r=>[r.id,r]));
const P0=load("2026-11-15T04-31-41"),P1=load("2026-11-15T05-28-42"),P2=load(process.argv[2]);
const sc=r=>r.verdict.score, tier=r=>r.verdict.meta.judgeTierUsed;
const cmp=(A,B,ids)=>{let up=0,down=0;for(const id of ids){const d=ORD[sc(B.get(id))]-ORD[sc(A.get(id))];if(d>0)up++;if(d<0)down++}return {n:ids.length,up,down,net:down-up}};
const tm=(A,B)=>PANEL.filter(id=>tier(A.get(id))===tier(B.get(id)));
for(const [l,A] of [["P1 pass 1",P1],["P0",P0]]){
 console.log(`P2 vs ${l}: all`,JSON.stringify(cmp(A,P2,PANEL)),"tier-matched",JSON.stringify(cmp(A,P2,tm(A,P2))),"tier-changed",PANEL.length-tm(A,P2).length);
 const nosrc=PANEL.filter(id=>!SRC.includes(id));
 console.log("   non-source 46 rows all",JSON.stringify(cmp(A,P2,nosrc)),"tm",JSON.stringify(cmp(A,P2,nosrc.filter(id=>tier(A.get(id))===tier(P2.get(id))))));
 console.log("   source 12 rows",JSON.stringify(cmp(A,P2,SRC)));
}
console.log("\nCHANGED P1->P2 (with P0):");
for(const id of PANEL){const a=P1.get(id),b=P2.get(id),z=P0.get(id);if(sc(a)!==sc(b)){const mv=ORD[sc(b)]>ORD[sc(a)]?"up":"down";console.log(id+(SRC.includes(id)?" [SRC]":""),`P0 ${sc(z)}(${tier(z)}) P1 ${sc(a)}(${tier(a)}) P2 ${sc(b)}(${tier(b)}) ${mv}`,sc(b)===sc(z)?"RETURNED-to-P0":"")}}
console.log("\nCHANGED P0->P2 not in P1->P2:");
for(const id of PANEL){const a=P1.get(id),b=P2.get(id),z=P0.get(id);if(sc(a)===sc(b)&&sc(z)!==sc(b))console.log(id+(SRC.includes(id)?" [SRC]":""),`P0 ${sc(z)}(${tier(z)}) P1 ${sc(a)}(${tier(a)}) P2 ${sc(b)}(${tier(b)})`)}
const c={};PANEL.forEach(id=>c[sc(P2.get(id))]=(c[sc(P2.get(id))]||0)+1);console.log("P2 totals",JSON.stringify(c));
