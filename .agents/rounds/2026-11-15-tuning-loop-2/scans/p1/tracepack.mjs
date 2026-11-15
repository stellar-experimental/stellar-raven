import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL=new Set(readFileSync(`${R}/scans/panel-ids.txt`,"utf8").trim().split(","));
const [,, out, aStamp, bStamp, aLabel, bLabel, ...ids]=process.argv;
for(const id of ids) if(!PANEL.has(id)) throw new Error("not panel "+id);
const load=f=>new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>PANEL.has(r.id)).map(r=>[r.id,r]));
const A=load(aStamp),B=load(bStamp);
mkdirSync(out,{recursive:true});
const side=(label,r,full)=>{
  const v=r.verdict;
  const p=[`# ${label}`,"",`Verdict: ${v.score} (judge tier ${v.meta.judgeTierUsed}${v.meta.escalationReason?`, ${v.meta.escalationReason}`:""}); core answer: ${v.coreAnswer}`,
   `Missing facts: ${JSON.stringify(v.missingFacts)}`,`Wrong claims: ${JSON.stringify(v.wrongClaims)}`,`Avoid matches: ${JSON.stringify(v.avoidMatches)}`,`Rationale: ${v.rationale}`,"","## Final answer",r.answer,""];
  if(full){ (r.transcript??[]).forEach((e,i)=>{ if(/ToolSearch/.test(e.tool)) return; const code=/execute$/.test(e.tool)?scriptOf(e):String(e.input??""); const res=String(e.result??""); p.push(`## Call ${i+1} (${e.tool}) input`,"```",code,"```",`## Call ${i+1} result as the agent saw it (${res.length} chars)`,"```",res,"```","")}) }
  return p.join("\n");};
for(const id of ids){
  const a=A.get(id),b=B.get(id);
  writeFileSync(`${out}/${id}.md`,[`# Row ${id}`,"",`Question: ${a.question}`,`Tags: ${JSON.stringify(a.tags)}`,`Golden: ${JSON.stringify(a.caseInput.golden)}`,"",side(aLabel,a,true),"\n\n--------\n\n",side(bLabel,b,true)].join("\n"));
}
console.log("wrote",ids.length);
