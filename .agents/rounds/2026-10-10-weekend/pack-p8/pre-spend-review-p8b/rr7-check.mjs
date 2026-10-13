import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import * as current from '../eval/qa/judge.mjs';
const base='.agents/rounds/2026-10-10-weekend/pack-p8';
const json=p=>JSON.parse(fs.readFileSync(p));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const amendment=fs.readFileSync(base+'/amendment-p8b.md','utf8');
const review=fs.readFileSync(base+'/post-run-review/rr6-review.md','utf8');
const extract=s=>s.slice(s.indexOf('> Review every lower arm-B panel score'),s.indexOf('> This amendment applies only to its separately declared future measurement.')+'> This amendment applies only to its separately declared future measurement.'.length);
assert.equal(extract(amendment),extract(review));
const modules={};
for(const [arm,n] of [['A',6],['B',8]]){const root=`/Users/kalepail/Desktop/raven-p${n}-arm`;modules[arm]={root,judge:await import(`${root}/eval/qa/judge.mjs`),rejudge:await import(`${root}/eval/qa/re-judge.mjs`)};}
let artifacts=0,packs=0,prompts=0,calls=0; const pairs=new Set();const target=[];
const p7=json('.agents/rounds/2026-10-10-weekend/pack-p7/rejudge-artifacts.json');
for(const e of json(base+'/rejudge-artifacts.json').artifacts){
 const bytes=fs.readFileSync(e.path);assert.equal(hash(bytes),e.sha256);artifacts++;
 if(e.arm==='A')assert(p7.artifacts.some(x=>x.arm==='A'&&x.path===e.path&&x.sha256===e.sha256));
 const a=JSON.parse(bytes),m=a.meta,mod=modules[e.arm];
 const raw=fs.readFileSync(m.sourceResultsPath);assert.equal(hash(raw),m.sourceResultsSha256);
 const source=JSON.parse(raw);
 const cases=mod.rejudge.verifySourceCases(source,m.sourceResultsPath,{repoRoot:mod.root,casesRef:mod.rejudge.resolveCasesRef(source,m.casesMode==='worktree'?'worktree':undefined)});
 assert.equal(cases.guard.actualCasesSha256,m.casesSha256);
 assert.equal(m.judgeModel,'claude-sonnet-5');assert.equal(m.judgeRubric,'v2.11');assert.equal(m.judgePanel,3);
 for(const when of ['before','after']){assert.equal(m.judgeIdentity[when].binary.sha256,'c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937');assert.equal(m.judgeIdentity[when].environment.sha256,'ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac');}
 assert.equal(m.outcome.status,'successful');assert.equal(m.outcome.postflight.status,'passed');
 for(const row of a.rows){
 const sr=source.rows.find(x=>x.id===row.id);const input={...cases.caseById.get(row.id),candidateAnswer:sr.answer,transcript:sr.transcript};
 const pack=mod.judge.buildTranscriptEvidence(input);const prompt=current.buildJudgePrompt({...input,transcriptEvidence:pack});
 assert.equal(hash(pack),row.evidencePack.sha256);assert.equal(hash(prompt),m.promptSha256ById[row.id]);
 if(e.arm==='B')assert.equal(current.buildTranscriptEvidence(input),pack);
 assert.deepEqual(input,json(`${base}/post-run-review/saved-data/rr6-${e.invocation}-${e.arm}-${row.id}-input.json`));
 for(const call of row.attempts.judgeCalls){assert.equal(call.inputSha256,hash(prompt));assert.equal(call.answerSha256,hash(sr.answer));calls++;}
 packs++;prompts++;pairs.add(e.invocation+'|'+row.id);
 if(e.invocation==='S2a'&&row.id==='q-defi-arbitrage-pathpayment-bots')target.push({arm:e.arm,pack:hash(pack),prompt:hash(prompt),votes:row.attempts.judgeCalls.map(x=>x.verdict),stellartermLines:pack.split('\n').filter(x=>/stellarterm/i.test(x))});
 }
}
const selfPath='/Users/kalepail/Desktop/raven-p8-arm/eval/qa/results/2026-10-10T18-19-55-p8-selftest.json';
assert.equal(hash(fs.readFileSync(selfPath)),'dbf292c7c6abde342ccf27c7912717d7b8db63aab6074f8bbc69e287e435b99d');
const out={exactRule:true,artifacts,packs,prompts,calls,pairedRows:pairs.size,reusedRows:pairs.size-1,target};
fs.writeFileSync('tmp/rr7-check.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
