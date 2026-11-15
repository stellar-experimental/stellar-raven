import { readFileSync, writeFileSync } from "node:fs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL=readFileSync(`${R}/scans/panel-ids.txt`,"utf8").trim().split(",");
const ORD={wrong:0,partial:1,correct:2};
const load=f=>JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>PANEL.includes(r.id));
const P0=new Map(load("2026-11-15T04-31-41").map(r=>[r.id,r])), P1=new Map(load(process.argv[2]).map(r=>[r.id,r]));
const tier=r=>r.verdict.meta.judgeTierUsed; const sc=r=>r.verdict.score;
const rows=PANEL.map(id=>({id,a:P0.get(id),b:P1.get(id)}));
const cmp=list=>{let up=0,down=0;for(const {a,b} of list){const d=ORD[sc(b)]-ORD[sc(a)];if(d>0)up++;if(d<0)down++}return {n:list.length,up,down,net:down-up,flips:up+down}};
console.log("all",JSON.stringify(cmp(rows)));
console.log("tier-matched",JSON.stringify(cmp(rows.filter(({a,b})=>tier(a)===tier(b)))));
console.log("tier changed rows",rows.filter(({a,b})=>tier(a)!==tier(b)).length);
const wrongNew=rows.filter(({a,b})=>sc(b)==="wrong"&&sc(a)!=="wrong").map(r=>r.id);console.log("new wrong",wrongNew,"left wrong",rows.filter(({a,b})=>sc(a)==="wrong"&&sc(b)!=="wrong").map(r=>r.id));
for(const {id,a,b} of rows){ if(sc(a)!==sc(b)) console.log("CHANGED",id,sc(a),`(${tier(a)})`,"->",sc(b),`(${tier(b)})`, ORD[sc(b)]>ORD[sc(a)]?"up":"down")}
const c={};rows.forEach(({b})=>c[sc(b)]=(c[sc(b)]||0)+1);console.log(c);
