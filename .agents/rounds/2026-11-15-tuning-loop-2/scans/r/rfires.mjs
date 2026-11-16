import { readFileSync, writeFileSync } from "node:fs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const IDS=readFileSync(`${R}/scans/step3/identifier-ids.txt`,"utf8").trim().split(",");
const stamps=process.argv.slice(2);
const PT=/If `([^`]+)` names a document, `scout\.searchResearch` holds documents of source `([a-z\-]+)`/g;
const MARK="returned the document the query names by identifier";
const isEx=t=>/(^|__)execute$/.test(t||"");
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
const keyOf=t=>{const m=String(t).match(/([A-Za-z]+)[- ]?(\d{1,6})/);return m?m[1].toLowerCase()+parseInt(m[2],10):norm(t)};
function researchWindows(code){const w=[];let from=0;for(;;){const i=code.indexOf("searchResearch",from);if(i<0)break;from=i+14;let start=code[i+14]==="("?i+14:-1;if(start<0){let d=0;for(let j=i-1;j>=0;j--){if(code[j]===")")d++;else if(code[j]==="("){if(d===0){start=j;break}d--}}}
 if(start<0){w.push(code.slice(i,i+400));continue}let d=0,end=code.length;for(let j=start;j<code.length;j++){if(code[j]==="(")d++;else if(code[j]===")"){d--;if(d===0){end=j+1;break}}}w.push(code.slice(start,end))}return w}
const names=(code,key)=>researchWindows(code).some(win=>[...win.matchAll(/([A-Za-z]+)[- ]?(\d{1,6})/g)].some(m=>m[1].toLowerCase()+parseInt(m[2],10)===key));
const out=[];
for(const [pi,st] of stamps.entries()){
  const rows=JSON.parse(readFileSync(`${RES}/${st}-variantA.json`,"utf8")).rows.filter(r=>IDS.includes(r.id));
  for(const r of rows){
    const ex=(r.transcript||[]).map((e,i)=>({e,i})).filter(x=>isEx(x.e.tool));
    const fires=[];
    ex.forEach((x,k)=>{const res=String(x.e.result??"");for(const m of res.matchAll(PT)){fires.push({exec:k,token:m[1],series:m[2]})}});
    const detail=fires.map(f=>{
      const key=keyOf(f.token);
      // later executes naming the identifier and calling research
      const later=ex.map((x,k)=>({x,k})).filter(({k})=>k>f.exec);
      const follow=later.find(({x})=>names(scriptOf(x.e),key));
      let exact=null,exactDoc=null;
      if(follow){const res=String(follow.x.e.result??"");exact=res.includes(MARK);const mm=res.match(/Exception: `scout\.searchResearch` returned the document the query names by identifier \(`([^`]+)`(?:, `([^`]+)`)?\)/);exactDoc=mm?mm[1]+(mm[2]?" "+mm[2]:""):null}
      // re-fire: pointer for same token in an execute after the follow
      const refire=follow?fires.filter(g=>g.token===f.token&&g.exec>follow.k).length:0;
      // research before fire for same identifier (should be 0)
      const before=ex.slice(0,f.exec+1).some(x=>names(scriptOf(x.e),key));
      return {...f,followed:!!follow,followExec:follow?follow.k:null,exact,exactDoc,refire,researchBefore:before,titleCase:/^[A-Z][a-z]+/.test(f.token)&&!/^[A-Z]+/.test(f.token)};
    });
    out.push({pass:pi+1,id:r.id,executes:ex.length,turns:r.agent.turns,cost:r.agent.costUsd,fires:detail,score:r.verdict.score,tier:r.verdict.meta.judgeTierUsed,inTok:(()=>{const u=r.agent.usage?.final??{};return (u.input_tokens||0)+(u.cache_creation_input_tokens||0)+(u.cache_read_input_tokens||0)})(),toolCalls:(r.transcript||[]).length});
  }
}
writeFileSync("/tmp/claude-1000/rfires.json",JSON.stringify(out,null,1));
let tf=0,tfol=0,tex=0,rf=0,nonsc=0,tc=0;
for(const o of out){tf+=o.fires.length;tfol+=o.fires.filter(f=>f.followed).length;tex+=o.fires.filter(f=>f.exact).length;rf+=o.fires.reduce((s,f)=>s+f.refire,0);nonsc+=o.fires.filter(f=>!["sep","cap"].includes(f.series)).length;tc+=o.fires.filter(f=>f.titleCase).length}
console.log("per pass: rows",out.length,"fires",tf,"followed",tfol,"exact on follow",tex,"re-fires after follow",rf,"non sep/cap",nonsc,"title-case",tc);
for(const p of [1,2]){const o=out.filter(x=>x.pass===p);const f=o.flatMap(x=>x.fires);console.log("pass",p,"rows fired",o.filter(x=>x.fires.length).length,"fires",f.length,"followed",f.filter(x=>x.followed).length,`(${f.length?(100*f.filter(x=>x.followed).length/f.length).toFixed(0):0}%)`,"exact",f.filter(x=>x.exact).length,"refire",f.reduce((s,x)=>s+x.refire,0),"researchBefore",f.filter(x=>x.researchBefore).length)}
for(const o of out)console.log(o.pass,o.id,o.score,o.tier,"turns",o.turns,"cost",o.cost.toFixed(3),"fires:",o.fires.map(f=>`${f.token}${f.followed?"->followed"+(f.exact?"(exact "+f.exactDoc+")":"(no exact)"):""}${f.refire?" REFIRE"+f.refire:""}`).join(", ")||"none");
