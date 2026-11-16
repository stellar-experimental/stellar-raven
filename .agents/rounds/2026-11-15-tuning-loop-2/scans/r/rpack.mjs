import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";
const R="/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const IDS=readFileSync(`${R}/scans/step3/identifier-ids.txt`,"utf8").trim().split(",");
const out=process.argv[2];mkdirSync(out,{recursive:true});
const load=f=>new Map(JSON.parse(readFileSync(`${RES}/${f}-variantA.json`,"utf8")).rows.filter(r=>IDS.includes(r.id)).map(r=>[r.id,r]));
const S={P0:load("2026-11-15T04-31-41"),P1:load("2026-11-15T05-28-42"),P2:load("2026-11-15T07-33-40"),R1:load("2026-11-15T08-55-41"),R2:load("2026-11-15T09-08-35")};
const head=(L,r)=>{const v=r.verdict;return [`Verdict: ${v.score} (judge tier ${v.meta.judgeTierUsed}${v.meta.escalationReason?", "+v.meta.escalationReason:""}); core: ${v.coreAnswer}`,`Missing facts: ${JSON.stringify(v.missingFacts)}`,`Wrong claims: ${JSON.stringify(v.wrongClaims)}`,`Avoid matches: ${JSON.stringify(v.avoidMatches)}`,`Rationale: ${v.rationale}`].join("\n")};
const full=(label,r)=>{const p=[`# ${label}`,"",head(label,r),"","## Final answer",r.answer,"",`Turns: ${r.agent.turns}; agent cost USD ${r.agent.costUsd}`];(r.transcript||[]).forEach((e,i)=>{if(/ToolSearch/.test(e.tool))return;const code=/execute$/.test(e.tool)?scriptOf(e):String(e.input??"");const res=String(e.result??"");p.push(`## Call ${i+1} (${e.tool}) input`,"```",code,"```",`## Call ${i+1} result as the agent saw it (${res.length} chars)`,"```",res,"```","")});return p.join("\n")};
const short=(label,r)=>[`# ${label} (summary only)`,"",head(label,r),"","## Final answer",r.answer].join("\n");
for(const id of IDS){const a=S.P2.get(id);
 writeFileSync(`${out}/${id}.md`,[`# Row ${id}`,"",`Question: ${a.question}`,`Tags: ${JSON.stringify(a.tags)}`,`Golden: ${JSON.stringify(a.caseInput.golden)}`,"",short("P0 control (loop 1 surface, no guard)",S.P0.get(id)),"\n\n--------\n\n",short("P1 pass 1 (guard, map removed)",S.P1.get(id)),"\n\n--------\n\n",full("P2 (control for R: source, new openings, seven cards; NO pointer)",a),"\n\n--------\n\n",full("R pass 1 (P2 plus the identifier pointer)",S.R1.get(id)),"\n\n--------\n\n",full("R pass 2 (P2 plus the identifier pointer)",S.R2.get(id))].join("\n"))}
console.log("wrote",IDS.length)
