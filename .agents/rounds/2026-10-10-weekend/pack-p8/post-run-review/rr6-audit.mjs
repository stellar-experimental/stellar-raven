import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='.agents/rounds/2026-10-10-weekend/pack-p8';
const manifest=JSON.parse(fs.readFileSync(`${dir}/rejudge-artifacts.json`));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const j=x=>JSON.parse(fs.readFileSync(x));
const modules={};
for (const [arm,rev] of [['A','d15a4ce5'],['B','36e77d40']]) {
 const root=`/Users/kalepail/Desktop/raven-p${arm==='A'?6:8}-arm`;
 assert(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).startsWith(rev));
 modules[arm]={root,judge:await import(`${root}/eval/qa/judge.mjs`),rejudge:await import(`${root}/eval/qa/re-judge.mjs`)};
}
let calls=0,total=0,max=0; const stages={}, paired={}, invocations=[];
for (const e of manifest.artifacts) {
 const bytes=fs.readFileSync(e.path); assert.equal(hash(bytes),e.sha256);
 const a=JSON.parse(bytes),m=a.meta,{root,judge,rejudge}=modules[e.arm];
 const sb=fs.readFileSync(m.sourceResultsPath);assert.equal(hash(sb),m.sourceResultsSha256);
 const source=JSON.parse(sb);
 const cases=rejudge.verifySourceCases(source,m.sourceResultsPath,{casesRef:rejudge.resolveCasesRef(source,m.casesMode==='worktree'?'worktree':undefined),repoRoot:root});
 assert.equal(cases.guard.actualCasesSha256,m.casesSha256);
 assert.equal(m.judgeModel,'claude-sonnet-5');assert.equal(m.judgePanel,3);assert.equal(m.judgeRubric,'v2.11');
 assert.equal(m.packVersion,e.arm==='A'?'p6':'p8');
 for(const when of ['before','after']) {
  assert.equal(m.judgeIdentity[when].binary.sha256,'c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937');
  assert.equal(m.judgeIdentity[when].environment.sha256,'ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac');
  assert.equal(m.judgeIdentity[when].binary.matches,true);assert.equal(m.judgeIdentity[when].environment.matches,true);
 }
 assert.equal(m.judgeIdentity.guard.matches,true);assert.equal(m.outcome.status,'successful');assert.equal(m.outcome.postflight.status,'passed');
 assert.equal(m.goldenTime.violations.length,0);assert.equal(m.incompleteIds.length,0);assert.equal(m.unattemptedIds.length,0);
 const rows=a.rows; assert.deepEqual(rows.map(r=>r.id),m.selectedIds);assert.deepEqual(m.completedIds,m.selectedIds);
 let cost=0; let n=0;
 for(const r of rows) {
  const s=source.rows.find(x=>x.id===r.id),k=cases.caseById.get(r.id),input={...k,candidateAnswer:s.answer,transcript:s.transcript};
  const pack=judge.buildTranscriptEvidence(input); assert.equal(hash(pack),r.evidencePack.sha256);assert.equal(pack.length,r.evidencePack.chars);
  assert(pack.length<=12000); if(e.arm==='A')assert.equal(hash(pack),s.evidencePack.sha256);
  const promptHash=judge.judgeInputSha256(input);assert.equal(promptHash,m.promptSha256ById[r.id]);
  const votes=r.attempts.judgeCalls;assert.equal(votes.length,3);
  for(const v of votes){assert.equal(v.inputSha256,promptHash);assert.equal(v.answerSha256,hash(s.answer));if(v.verdict.score!=='error')assert.equal(v.failureClass,null);assert(Number.isFinite(v.costUsd)); cost+=v.costUsd;n++;max=Math.max(max,v.costUsd);}
  const counts={wrong:0,partial:0,correct:0};for(const v of votes)if(v.verdict.score!=='error')counts[v.verdict.score]++;
  const score=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];assert.equal(score,r.new.score);
  const key=e.invocation+'|'+r.id;paired[key]??={invocation:e.invocation,id:r.id};
  const file=`tmp/rr6-${e.invocation}-${e.arm}-${r.id}`;
  fs.writeFileSync(file+'-pack.txt',pack);fs.writeFileSync(file+'-input.json',JSON.stringify(input,null,2));
  paired[key][e.arm]={score,votes:votes.map(v=>v.verdict.score),support:votes.map(v=>v.verdict.evidenceSupportCheck?.status??'none'),cost:votes.reduce((s,v)=>s+v.costUsd,0),packSha256:hash(pack),chars:pack.length,verdicts:votes.map(v=>v.verdict),file};
 }
 const cap={S1a:.85,S1b:2.45,S1c:1.65,S2a:10.55,S2b:2.45,S2c:1.65,S2d:.85,S2e:.85,S3a:.85,S3b:.85,S3c:.85,S3d:2.45}[e.invocation];
 assert.equal(m.budget.authorizedUsd,cap);assert(cost<cap);assert(Math.abs(cost-m.budget.reportedSpendUsd)<1e-9);assert.equal(n,m.budget.reportedCalls);assert.equal(n,m.budget.calls.length);
 let remaining=cap;for(const c of m.budget.calls){assert(Math.abs(c.authorizedUsd-remaining)<1e-9);remaining-=c.costUsd;}
 const st=e.invocation[1];stages[st]??={cost:0,calls:0};stages[st].cost+=cost;stages[st].calls+=n;calls+=n;total+=cost;
 invocations.push({invocation:e.invocation,arm:e.arm,calls:n,cost,cap,casesMode:m.casesMode,casesSha256:m.casesSha256});
}
const out={calls,total,max,stages,invocations,paired:Object.values(paired)};
fs.writeFileSync('tmp/rr6-audit.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({calls,total,max,stages,invocations},null,2));
for(const p of out.paired)console.log(p.invocation,p.id,p.A.votes.join('/'),'=>',p.B.votes.join('/'),p.A.support.join('/'),'=>',p.B.support.join('/'));
