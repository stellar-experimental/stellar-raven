import { readFileSync } from "node:fs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";
const RES="/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const [stamp,id,fireExec,token]=process.argv.slice(2);
const r=JSON.parse(readFileSync(`${RES}/${stamp}-variantA.json`,"utf8")).rows.find(r=>r.id===id);
const ex=(r.transcript||[]).filter(e=>/execute$/.test(e.tool||""));
ex.forEach((e,k)=>{if(k>+fireExec)return;const s=scriptOf(e);console.log(`--- exec ${k} ${k===+fireExec?"(FIRE)":""}`);console.log(s.split("\n").filter(l=>/searchResearch|q\(|research/i.test(l)||l.includes(token)).slice(0,8).join("\n").slice(0,900));const res=String(e.result??"");const m=res.match(/If `([^`]+)` names a document/g);console.log("   pointer in result:",m);})
