import { readFileSync } from "node:fs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const IDS=readFileSync(`${R}/scans/step3/identifier-ids.txt`,"utf8").trim().split(",");
const ORD={wrong:0,partial:1,correct:2};
const load=f=>new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>IDS.includes(r.id)).map(r=>[r.id,r]));
const S={P0:load("2026-11-15T04-31-41"),P1:load("2026-11-15T05-28-42"),P2:load("2026-11-15T07-33-40"),R1:load("2026-11-15T08-55-41"),R2:load("2026-11-15T09-08-35")};
const sc=(L,id)=>S[L].get(id).verdict.score, tr=(L,id)=>S[L].get(id).verdict.meta.judgeTierUsed==="panel"?"P":"s";
console.log("row | P0 | P1 | P2 | R1 | R2");
for(const id of IDS)console.log(id.replace(/^q-/,""),"|",["P0","P1","P2","R1","R2"].map(L=>sc(L,id)+tr(L,id)).join(" | "));
const cmp=(A,B,ids)=>{let up=0,down=0;for(const id of ids){const d=ORD[sc(B,id)]-ORD[sc(A,id)];if(d>0)up++;if(d<0)down++}return {n:ids.length,up,down,net:down-up}};
const tm=(A,B)=>IDS.filter(id=>tr(A,id)===tr(B,id));
for(const C of ["P2","P1","P0"]){for(const L of ["R1","R2"])console.log(`${L} vs ${C}: all`,JSON.stringify(cmp(C,L,IDS)),"tier-matched",JSON.stringify(cmp(C,L,tm(C,L))),"tier changed",17-tm(C,L).length)}
// pooled
for(const C of ["P2","P1","P0"]){const a=cmp(C,"R1",IDS),b=cmp(C,"R2",IDS);console.log(`pooled vs ${C}: up ${a.up+b.up} down ${a.down+b.down} net ${a.down+b.down-a.up-b.up} n 34`);const t1=cmp(C,"R1",tm(C,"R1")),t2=cmp(C,"R2",tm(C,"R2"));console.log(`   pooled tier-matched n ${t1.n+t2.n} net ${t1.net+t2.net}`)}
const cnt=L=>{const c={};IDS.forEach(id=>c[sc(L,id)]=(c[sc(L,id)]||0)+1);return JSON.stringify(c)};
for(const L of Object.keys(S))console.log(L,cnt(L));
console.log("\nrows changed R vs P2:");
for(const id of IDS){for(const L of ["R1","R2"]){if(sc("P2",id)!==sc(L,id))console.log(id,L,`P0 ${sc("P0",id)}${tr("P0",id)} P1 ${sc("P1",id)}${tr("P1",id)} P2 ${sc("P2",id)}${tr("P2",id)} ${L} ${sc(L,id)}${tr(L,id)}`,ORD[sc(L,id)]>ORD[sc("P2",id)]?"up":"down")}}
