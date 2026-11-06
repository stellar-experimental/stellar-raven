/** One dated aborted cohort. Read-only import; never repairs its journal or releases its holds. */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
export const RESTART_ID = '2026-11-06-playground-final-transport-fixed';
export const OLD_REVISION = '44048cc64f2f659871d7d44b86aad13e365933f5';
export const OLD_ANSWER_REVISION = 'e800eef8d543599bf8561e84353cedada4d330fd';
export const OLD_RUNNER_SHA = 'd317196932ed35ee63690dd0ecfb4e44f9e9d4c74247225eeb5149c60e15bd04';
const hash = b => createHash('sha256').update(b).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const check = (ok, message) => { if (!ok) throw new Error(`prior cohort: ${message}`); };
const unit = n => { check(typeof n==='number' && Number.isFinite(n) && n>=0 && n<=2000,'invalid cash'); return Math.round(n*1e12); };
const usd = n => n/1e12;
const EXPECTED_TASKS = ['m1-r1-s0','m1-r1-s1','m1-r1-s2','m1-r1-s2-c1','m1-r1-s3','m1-r1-s4'];
export function pinnedJson(pin, readBytes=readFileSync) {
  check(typeof pin?.path==='string' && /^[a-f0-9]{64}$/.test(pin.sha256),'missing file identity');
  const bytes=readBytes(pin.path); check(hash(bytes)===pin.sha256,`changed evidence: ${pin.path}`);
  return JSON.parse(bytes);
}
export function importPriorCohort(manifestIdentity, {readBytes=readFileSync, readHistorical}={}) {
  const manifest=pinnedJson(manifestIdentity,readBytes);
  check(manifest.contract==='playground-aborted-cohort-import/v1' && manifest.experimentId===RESTART_ID && manifest.sourceRevision===OLD_REVISION,'import contract/era');
  check(manifest.reviewRef?.trim() && manifest.decisionRef?.trim() && manifest.uniformRestartBeforeNewData===true,'pre-data decision/review required');
  const inventory=pinnedJson(manifest.inventory,readBytes);
  check(inventory.contract==='playground-restart-accounting-evidence/v1' && Array.isArray(inventory.pins),'inventory contract');
  const pins=new Map(inventory.pins.map(p=>[p.path,p]));
  check(pins.size===inventory.pins.length,'duplicate inventory path');
  for(const pin of pins.values())pinnedJson(pin,readBytes);
  const read=p=>{check(pins.has(p),`unpinned source: ${p}`);return pinnedJson(pins.get(p),readBytes);};
  const one=suffix=>{const found=[...pins.keys()].filter(p=>p.endsWith(suffix));check(found.length===1,`ambiguous/missing ${suffix}`);return found[0];};
  const source=read(inventory.journal.path);
  check(same(pins.get(inventory.journal.path),inventory.journal) && source.experimentId==='2026-11-06-playground-final-resolution' && source.state==='halted' && source.cashCapUsd===200,'old journal identity/state');
  const stop=pinnedJson(manifest.serverStop,readBytes);
  check(stop.contract==='playground-aborted-cohort-server-stop/v1' && stop.state==='finished' && stop.terminal===source.server?.ownerTerminalId && same(stop.journal,inventory.journal) && Number.isFinite(Date.parse(stop.observedAt)),'observed server stop required');
  const codePins=read(one('/collection-code-pins.json'));
  const root=path.resolve(path.dirname(inventory.journal.path),'../../..');
  const historical=readHistorical ?? ((file)=>execFileSync('git',['show',`${OLD_REVISION}:${file}`],{cwd:root,stdio:['ignore','pipe','pipe']}));
  for(const [file,sha] of Object.entries(codePins)) {
    // Old tracked hashes belong to the frozen commit, never the patched checkout.
    let bytes;
    if(file.startsWith('tmp/')) {
      const copy=manifest.historicalHelperCopies?.[file];
      const copyRoot=path.join(root,'tmp/playground-final/transport-fixed/historical-helpers');
      check(copy?.sha256===sha && typeof copy.path==='string' && path.dirname(copy.path)===copyRoot && realpathSync(copy.path)===copy.path,'immutable historical helper copy required');
      bytes=readBytes(copy.path);
    } else bytes=historical(file);
    check(hash(bytes)===sha,`historical code pin differs: ${file}`);
  }
  const tasks=source.tasks.filter(t=>t.receipt);
  check(same(tasks.map(t=>t.id),EXPECTED_TASKS) && source.tasks.filter(t=>!t.receipt).every(t=>t.state==='planned'),'unexpected original work');
  const logs=new Set(),receipts=[],components=[];
  let settled=0,known=0,notional=0,answerTurns=0,judgeA=0,providerCalls=0;
  const addLog=id=>{check(typeof id==='string' && id.length>0,'missing log');const sha=hash(id);check(!logs.has(sha),'duplicate imported Gateway log');logs.add(sha);};
  for(const task of tasks) {
    const r=read(task.receipt.path); check(same(pins.get(task.receipt.path),task.receipt),'receipt binding');receipts.push(task.receipt.sha256);
    const dir=path.dirname(task.receipt.path),completion=read(path.join(dir,'completion.json')),auth=read(path.join(dir,'subscription-attestation.json'));
    check(completion.taskId===task.id && completion.receipt===task.receipt.path && completion.receiptSha256===task.receipt.sha256 && Number.isInteger(completion.exitCode) && completion.signal===null,'missing completed original process');
    check(auth.contract==='playground-claude-subscription-attestation/v1' && auth.taskId===task.id && auth.experimentId===source.experimentId && auth.receiptSha256===task.receipt.sha256 && auth.executableSha256===source.measurement.judgeA.executableSha256 && auth.environmentSha256===source.measurement.judgeA.environmentSha256 && auth.billingMode==='subscription' && auth.apiCredentialsExcluded===true,'subscription evidence');
    for(const phase of ['before','after'])check(auth[phase]?.authMethod==='claude.ai' && auth[phase]?.subscriptionType==='max' && auth[phase]?.executableSha256===auth.executableSha256 && auth[phase]?.environmentSha256===auth.environmentSha256,'subscription pre/post check');
    const uncertain=task.id==='m1-r1-s2'||task.id==='m1-r1-s2-c1';
    check(task.state===(task.id==='m1-r1-s2'?'settled-partial':task.id.endsWith('-c1')?'unresolved':'settled'),'original task state');
    check(r.meta.capContext.roundAuthorization.experimentId===source.experimentId && r.meta.answering.primaryModel===task.model && r.meta.inputSnapshot.tree.headRevision===OLD_ANSWER_REVISION,'original receipt era/model');
    check(same(r.budget.selectedCaseIds,task.ids) && same([...r.rows.map(x=>x.id),...r.budget.unattemptedCaseIds],task.ids),'attempted partition');
    check(r.budget.missingCosts===(uncertain?1:0) && (uncertain?r.budget.status==='invalid':['complete','incomplete'].includes(r.budget.status)),'missing-cost shape');
    const proof=read(uncertain?one(task.id.endsWith('-c1')?'/second-infra-gateway-evidence.json':'/first-infra-gateway-evidence.json'):task.receipt.path.replace(/\.json$/,'.gateway-proof.json'));
    const proofRows=proof.knownRows??proof.rows;
    check(proof.gatewayId===source.measurement.gatewayId && proof.accountId===source.measurement.judgeB.config.accountId,'proof account/gateway');
    if(proof.receipt)check(same(proof.receipt,task.receipt),'proof receipt');
    const knownRows=uncertain?r.rows.slice(0,-1):r.rows;
    check(same(proofRows.map(x=>x.id),knownRows.map(x=>x.id)),'proof row selection');
    let a=0,b=0,callIndex=0,remaining=unit(task.methodCapUsd);
    for(const row of r.rows) {
      const call=r.budget.calls[callIndex++];check(call?.method==='answer' && call.id===row.id && unit(call.authorizedUsd)===remaining,'answer call order');
      if(uncertain && row===r.rows.at(-1)) {
        check(call.costUsd===null && row.costUsd===null && row.answerCost===null && row.responseStatus===null && row.frames.length===0 && row.clientError==='fetch failed' && row.verdict===null,'unknown failure must remain null');continue;
      }
      const f=row.answerCost,p=proofRows.find(x=>x.id===row.id);
      check(f?.error===null && f.calls===f.logIds.length && f.reportedCalls===f.calls && same(f.models,[task.model]) && unit(f.costUsd)===unit(row.costUsd) && unit(call.costUsd)===unit(f.costUsd),'answer accounting');
      check(same(p.logs.map(x=>x.id),f.logIds),'exact proof log ids');
      let rowCost=0;
      for(const l of p.logs){check(l.model===task.model && l.provider===task.model.split('/')[0] && l.cached===false && l.custom_cost===false && l.collect_log_payload===false,'Gateway identity/privacy');rowCost+=unit(l.costUsd??l.cost);addLog(l.id);}
      check(rowCost===unit(row.costUsd) && rowCost===unit(p.costUsd),'proof cost sum');a+=rowCost;remaining-=rowCost;providerCalls+=f.calls;
      if(r.budget.calls[callIndex]?.method==='judge') {const c=r.budget.calls[callIndex++];check(c.id===row.id && unit(c.authorizedUsd)===remaining && unit(c.costUsd)===unit(row.verdict?.costUsd),'judge cost');const n=unit(c.costUsd);remaining-=n;b+=n;judgeA++;}
    }
    check(callIndex===r.budget.calls.length && remaining>=0 && a===unit(r.meta.totalAgentCostUsd) && b===unit(r.meta.totalJudgeCostUsd) && a+b===unit(r.budget.reportedSpendUsd),'method totals');
    answerTurns+=r.rows.length;known+=a;notional+=b;
    if(uncertain){const cap=unit(task.methodCapUsd);check(cap===unit(task.id.endsWith('-c1')?3.64:4.33),'full uncertain cap');components.push({taskId:task.id,ceilingChargeUsd:usd(cap),knownCashUsd:usd(a),failedCashUsd:null,failedProviderCalls:null});}
    else {check(a===unit(task.cashUsd),'settled cash');settled+=a;}
  }
  check(source.external.length===1 && source.external[0].kind==='calibration' && source.external[0].state==='settled','unexpected external work');
  const cal=source.external[0],b=read(cal.receipt.path);receipts.push(cal.receipt.sha256);
  check(same(pins.get(cal.receipt.path),cal.receipt) && b.budget.calls.length===27 && b.budget.missingCosts===0 && b.budget.stopped===null,'B calibration complete');
  let bCash=0;for(const c of b.budget.calls){check(c.logId===c.gatewayLog.id && c.gatewayLog.cached===false && c.gatewayLog.customCost===false && c.gatewayLog.collectLogPayload===false,'B calibration Gateway');addLog(c.logId);bCash+=unit(c.costUsd);}
  check(bCash===unit(cal.cashUsd) && bCash===unit(b.budget.totalCostUsd),'B calibration cash');settled+=bCash;known+=bCash;
  const aCalPath=one('/judge-a-calibration.json'),aCal=read(aCalPath);receipts.push(pins.get(aCalPath).sha256);
  check(aCal.calls===7 && aCal.callRecords.length===7 && aCal.missingCosts.length===0 && aCal.callRecords.every(c=>c.ok===true),'A calibration complete');
  const aNotional=aCal.callRecords.reduce((n,c)=>n+unit(c.costUsd),0);check(aNotional===unit(aCal.totalCostUsd),'A calibration totals');
  check(stop.lastMethod==='m1-r1-s2-c1' && stop.lastCompletionSha256===pins.get(one('/m1-r1-s2-c1/completion.json')).sha256,'stop completion binding');
  const conservative=components.reduce((n,c)=>n+unit(c.ceilingChargeUsd),0);
  const result={contract:'playground-prior-cohort/v1',status:'aborted-diagnostic',sourceJournal:inventory.journal,sourceRevision:OLD_REVISION,selectionSha256:source.selectionSha256,
    manifest:manifestIdentity,serverStop:manifest.serverStop,receiptSha256s:receipts,logIdHashes:[...logs].sort(),uncertainMethods:components,
    settledCashUsd:usd(settled),knownCashUsd:usd(known),conservativeChargeUsd:usd(conservative),ceilingConsumedUsd:usd(settled+conservative),subscriptionNotionalUsd:usd(notional+aNotional),
    calls:{answerTurns,judgeA,judgeACalibration:7,apiJudge:27,knownAnswerProviderCalls:providerCalls,unknownAnswerProviderCalls:true},
    reviewObligation:{attemptedCells:85,kind:'separate-full-blinded-diagnostic-review',canonicalCells:0}};
  check(answerTurns===85 && judgeA===83 && providerCalls===337 && logs.size===364 && unit(result.knownCashUsd)===unit(.8915166) && settled===unit(.85879459) && conservative===unit(7.97) && unit(result.subscriptionNotionalUsd)===unit(6.6363862),'reviewed opening totals differ');
  return result;
}
export function verifyPriorCohort(journal, options) {
  if(journal.experimentId!==RESTART_ID && !journal.priorCohort)return null;
  check(journal.experimentId===RESTART_ID && journal.recoveryPolicy==='halt-only' && journal.priorCohort,'restart requires immutable prior cohort and halt-only policy');
  const derived=importPriorCohort(journal.priorCohort.manifest,options);
  check(same(derived,journal.priorCohort) && journal.priorCohortSha256===hash(JSON.stringify(derived)) && derived.selectionSha256===journal.selectionSha256,'opening record changed');
  return derived;
}
