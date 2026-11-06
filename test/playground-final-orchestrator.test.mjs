import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { diagnosticAnswerProblem } from '../eval/qa/diagnostic-rejudge-source.mjs';
import { buildPlaygroundArtifactMeta, treeGenerationSha256 } from '../eval/playground/artifact-contract.mjs';
import { accounting, closeServer, commandFor, createJournal, declareServer, plan, reserveBatch, reserveExternal, roundCap, settle, settleExternal, sha256, updateJournal, answerFailureClass, readFinalsMatrix, reserveExternalBatch, freezeJudgeB } from '../research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs';

const selection = JSON.parse(readFileSync('research/audits/2026-11-06-playground-final-resolution/selection.json'));
const corpus = JSON.parse(readFileSync('eval/qa/cases.json'));
const scratch = [];
afterEach(() => { for (const dir of scratch.splice(0)) rmSync(dir, {recursive: true, force: true}); });
const h = x => sha256(JSON.stringify(x));
const S = 'a'.repeat(64);
const B_CONFIG={accountId:'a'.repeat(32),gatewayId:'test',model:'gpt-6.1-sol',gatewayLogModel:'openai/gpt-6.1-sol',effort:'high',maxOutputTokens:1024,maxPromptBytes:128000,timeoutMs:120000,callReserveUsd:1};
const INPUTS = {corpusFileSha256:'eval/qa/cases.json',manifestFileSha256:'catalog/manifest.json',superSpecFileSha256:'specs/super-spec.json',runnerFileSha256:'scripts/run-playground-semantic-eval.mjs',modelConfigFileSha256:'src/demo/model-config.ts',judgeFileSha256:'eval/qa/judge.mjs',evidencePackFileSha256:'eval/qa/evidence-pack.mjs'};
function fixture() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'playground-journal-')); scratch.push(dir);
  const measurementRoot = path.join(dir, 'measurement'); mkdirSync(measurementRoot);
  const inputFileHashes = {};
  for (const [field, file] of Object.entries(INPUTS)) {
    const bytes = readFileSync(file); const target = path.join(measurementRoot,file);
    mkdirSync(path.dirname(target),{recursive:true}); writeFileSync(target,bytes); inputFileHashes[field]=sha256(bytes);
  }
  const tree = {headRevision:'1'.repeat(40),dirty:false,statusSha256:S,trackedDiffSha256:S,untrackedFilesSha256:S};
  tree.generationSha256=treeGenerationSha256(tree);
  const config = {experimentId:'test-round',measurementRoot,measurementRevision:tree.headRevision,generationSha256:tree.generationSha256,
    reviewRef:'reviewed-plan',gatewayId:'test-gateway',url:'http://localhost:8787',inputFileHashes,
    judgeB:{identitySha256:S,model:'gpt-6.1-sol',effort:'high',config:B_CONFIG},judgeA:{model:'claude-sonnet-5',rubric:'v2.11',packVersion:'p9',realPath:'/pinned/claude',executableSha256:S,environmentSha256:S}};
  const journalPath=path.join(dir,'coordinator','journal.json');
  const journal=createJournal(config,selection,corpus.cases,journalPath);
  return {dir,journal,journalPath,config,tree};
}
function reserveSafety(f, cap=10) {
  declareServer(f.journal,f.journal.tasks[0].model,'owned-test-terminal');
  return reserveBatch(f.journal,[{taskId:f.journal.tasks[0].id,methodCapUsd:cap}])[0];
}
function receipt(f,task,{failure=null,answerCost=.1}={}) {
  commandFor(f.journal,task,'/coordinator/cap.json','/ignored/native');
  const selected=corpus.cases.filter(c=>task.ids.includes(c.id));
  const cap={...roundCap(f.journal,task),sourceFile:{path:'/coordinator/cap.json',sha256:task.roundCapSha256}};
  const meta=buildPlaygroundArtifactMeta({run:{runId:task.id,casesPath:'eval/qa/cases.json',caseContract:null,caseCount:selected.length,selection:{ids:task.ids.join(',')},startedAt:'2026-11-06T00:00:00Z',finishedAt:'2026-11-06T00:10:00Z'},
    answering:{primaryModel:task.model,fallbackModels:[],models:[{model:task.model,role:'primary'}],fallbackPolicy:'single-candidate',apiMode:{requested:'responses',effective:task.model.startsWith('openai/')?'responses':'chat',source:'process-env'},reasoningEffort:{value:task.effort,source:'process-env'},temperature:.1,configurationBasis:'fixture',runtimeIntrospection:'gateway-log',observedAttemptedModels:[task.model],proofLimit:'fixture'},
    judge:{enabled:true,model:'claude-sonnet-5',rubric:'v2.11',packVersion:'p9',executable:{sha256:S,realPath:'/pinned/claude'},temperature:{value:null,semantics:'provider-default-unpinned'}},
    capContext:{demo:{maxSteps:7,maxOutputTokens:4096,maxHistoryMessages:20,maxHistoryChars:24000,maxSearchLimit:6,maxSearchCallsPerTurn:3,maxExecuteCallsPerTurn:3,maxExecuteCodeChars:8000,maxUserMessageChars:8000,chatsPerHour:30},evaluator:{maxBudgetUsd:task.methodCapUsd,timeoutMs:150000,maxCasesPerRunSubject:30,selectedCases:selected.length,answerCallsThisRun:selected.length,judgeCallsThisRun:selected.length},roundAuthorization:cap},inputFiles:f.config.inputFileHashes,selectedCases:selected,tree:f.tree,
    server:{endpoint:'http://localhost:8787/playground/chat',generationBasis:'operator-asserted-local-working-tree',generationSha256:f.tree.generationSha256,operatorAssertionSha256:f.tree.generationSha256,runtimeIntrospection:'not-available',proofLimit:'fixture'}});
  const calls=[];let remaining=task.methodCapUsd;
  const addCall=(method,id,costUsd)=>{calls.push({method,id,costUsd,authorizedUsd:Number(remaining.toFixed(12))});remaining-=costUsd;};
  const rows=selected.map((c,index)=>{
    const refused=failure==='refusal'&&index===0;
    const frame={type:'eval-cost',costUsd:answerCost,reportedCostUsd:answerCost,calls:2,reportedCalls:2,models:[task.model],logIds:[task.id+'-'+c.id+'-1',task.id+'-'+c.id+'-2'],error:null,atMs:100};
    addCall('answer',c.id,answerCost);
    const judgeCost=failure==='judge-error-zero'&&index===0?0:.2;
    if(!refused)addCall('judge',c.id,judgeCost);
    const finishReason=refused?null:failure==='length'&&index===0?'length':'stop';
    return {id:c.id,answer:refused?'':'an answer',costUsd:answerCost,answerCost:frame,finishReason,responseStatus:200,httpError:null,clientError:null,sseErrors:refused?['provider refusal']:[],transcript:[],
      frames:refused?[frame]:[{type:'done',reason:finishReason},frame],verdict:refused?{score:'error'}:{score:failure?.startsWith('judge-error')&&index===0?'error':'partial',costUsd:judgeCost,promptSha256:S}};
  });
  const answer=Number((rows.length*answerCost).toFixed(9)),judge=Number((calls.filter(c=>c.method==='judge').reduce((n,c)=>n+c.costUsd,0)).toFixed(9)),total=Number((answer+judge).toFixed(9));
  Object.assign(meta,{totalAgentCostUsd:answer,totalJudgeCostUsd:judge,totalCostUsd:total});
  return {meta,rows,nonPromotable:!!failure,budget:{claimed:true,exhausted:false,stoppedBefore:null,remainingUsd:Number(remaining.toFixed(12)),status:failure?'incomplete':'complete',error:null,missingCosts:0,authorizedUsd:task.methodCapUsd,reportedCalls:calls.length,expectedCalls:calls.length,calls,reportedSpendUsd:total,selectedCaseIds:task.ids,incompleteCaseIds:failure?[task.ids[0]]:[],unattemptedCaseIds:[]}};
}
const identity = bytes => ({path:bytes.meta?.artifactContract?'/ignored/native/'+bytes.meta.runId+'/'+bytes.meta.runId+'-playground-semantic.json':'/ignored/api/'+(bytes.meta?.runId??'raw')+'.json',sha256:h(bytes)});
function settleSafety(f) {
  const task=reserveSafety(f); const r=receipt(f,task); settle(f.journal,task.id,r,identity(r)); return task;
}
function proof(f,task,r) {return {contract:'playground-claude-subscription-attestation/v1',experimentId:f.journal.experimentId,taskId:task.id,receiptSha256:h(r),executableSha256:S,environmentSha256:S,billingMode:'subscription',apiCredentialsExcluded:true,reviewRef:'reviewed-auth-evidence'};}

function apiEntry(task, ids, rowIds) {
  return {id:'b-'+task.id,kind:'judge-b',reviewRef:'bounded-B-plan',runId:'b-'+task.id,model:'gpt-6.1-sol',effort:'high',methodCapUsd:1,maxJudgeErrorRate:0,
    callIds:ids,rowIds,receiptContract:'gateway-rejudge-v1',planSha256:h('plan-'+task.id),judgeIdentitySha256:S,config:B_CONFIG,nativeSourceSha256:task.receipt?.sha256??h('source-'+task.id)};
}
function apiArtifact(entry, native, nativeIdentity) {
  const calls=entry.callIds.map((id,i)=>({id,promptSha256:S,status:'completed',failureClass:null,costUsd:.02,logId:entry.id+'-'+i,responseModel:entry.model,responseEffort:'high',gatewayLog:{id:entry.id+'-'+i,model:'openai/'+entry.model,provider:'openai',cached:false,customCost:false,collectLogPayload:false,statusCode:200,metadata:{role:'judge-b',runId:entry.runId,promptSha256:S}}}));
  const cost=Number((calls.length*.02).toFixed(12));
  return {meta:{resultSchema:'gateway-rejudge-v1',mode:'rejudge',runId:entry.runId,planSha256:entry.planSha256,judgeIdentity:{sha256:S,config:B_CONFIG},judgeModel:entry.model,judgeEffort:'high',status:'complete',selectedIds:entry.rowIds,unattemptedIds:[],unresolvedJudgeErrorIds:[],source:{sha256:nativeIdentity.sha256}},
    budget:{schema:'gateway-judge-budget-v1',runId:entry.runId,authorizedUsd:entry.methodCapUsd,maxCalls:calls.length,callsStarted:calls.length,reportedSpendUsd:cost,totalCostUsd:cost,missingCosts:0,maxJudgeErrorRate:0,maxJudgeErrors:0,judgeErrorCount:0,stopped:null,calls},
    rows:entry.rowIds.map(id=>{const call=calls.find(c=>c.id===id);return {id,...(call?{new:{score:'partial',costUsd:.02,gatewayLogId:call.logId,judgeIdentitySha256:S,model:entry.model,effort:'high'}}:{new:null,skipped:{reason:'unsuccessful-terminal'}})};})};
}
function completeMatrixFixture() {
  const f=fixture(),bytes=new Map();
  const save=r=>{const id=identity(r);bytes.set(id.path,Buffer.from(JSON.stringify(r)));return id;};
  for(const task of f.journal.tasks){
    if(f.journal.server?.model!==task.model){if(f.journal.server)closeServer(f.journal);declareServer(f.journal,task.model,'owned');}
    reserveBatch(f.journal,[{taskId:task.id,methodCapUsd:10}]);
    const r=receipt(f,task,{failure:task.id==='m1-r1-s1'?'length':task.id==='m1-r2-s0'?'refusal':null,answerCost:.05}),id=save(r);
    settle(f.journal,task.id,r,id,proof(f,task,r));
    if(f.journal.state!=='ready')throw new Error(f.journal.halt.reason);
  }
  closeServer(f.journal);
  for(const task of f.journal.tasks){
    const native=JSON.parse(bytes.get(task.receipt.path));
    const ids=native.rows.filter(r=>answerFailureClass(r)===null).map(r=>r.id);
    if(!ids.length)continue;
    const entry=apiEntry(task,ids,task.ids);reserveExternal(f.journal,entry);
    const r=apiArtifact(entry,native,task.receipt);settleExternal(f.journal,entry.id,r,save(r));
    if(f.journal.state!=='ready')throw new Error(f.journal.halt.reason);
  }
  return {...f,bytes,readBytes:p=>{if(!bytes.has(p))throw new Error('missing raw receipt');return bytes.get(p);}};
}

describe('dated Playground plan and cash journal',()=>{
  it('plans all eight finalists, disjoint safety, two repeats and 1616 exact turns',()=>{
    const tasks=plan(selection,corpus.cases);
    expect(tasks).toHaveLength(80);expect(tasks.reduce((s,t)=>s+t.ids.length,0)).toBe(1616);
    expect(tasks.every(t=>t.ids.length<=25)).toBe(true);
    expect(new Set(tasks.map(t=>t.model)).size).toBe(8);
    expect(()=>plan({...selection,qualityCasesSha256:S},corpus.cases)).toThrow('case content');
  });
  it('rejects journal writes inside the measured tree, including symlink-resolved destinations',()=>{
    const f=fixture();expect(()=>createJournal(f.config,selection,corpus.cases,path.join(f.config.measurementRoot,'journal.json'))).toThrow('outside');
  });
  it('reserves the entire combined method cap, once, with a single declared server',()=>{
    const f=fixture(),task=reserveSafety(f,20);
    expect(accounting(f.journal).reservedUsd).toBe(20);
    expect(()=>declareServer(f.journal,task.model,'other')).toThrow('another server');
    expect(()=>reserveBatch(f.journal,[{taskId:task.id,methodCapUsd:20}])).toThrow('prior batch');
    expect(()=>closeServer(f.journal)).toThrow('reservations');
    const cmd=commandFor(f.journal,task,'/coordinator/cap.json','/ignored/raw');
    expect(cmd.argv.filter(s=>s==='--max-budget-usd')).toHaveLength(1);
    expect(cmd.environment.DEMO_MODEL_OVERRIDE).toBe(task.model);
  });
  it('rejects a full parallel batch atomically when combined reservations pass $200',()=>{
    const f=fixture();settleSafety(f);const tasks=f.journal.tasks.slice(1,5);
    expect(()=>reserveBatch(f.journal,tasks.map(t=>({taskId:t.id,methodCapUsd:51})))).toThrow('$200');
    expect(tasks.every(t=>t.state==='planned')).toBe(true);
    reserveBatch(f.journal,tasks.map(t=>({taskId:t.id,methodCapUsd:44})));
    expect(accounting(f.journal).reservedUsd).toBe(176);
  });
  it('prohibits five-way, mixed-model and next-repeat reservations',()=>{
    const f=fixture();settleSafety(f);
    expect(()=>reserveBatch(f.journal,f.journal.tasks.slice(1,6).map(t=>({taskId:t.id,methodCapUsd:1})))).toThrow('one to four');
    expect(()=>reserveBatch(f.journal,[{taskId:'m2-r1-s1',methodCapUsd:1}])).toThrow('active model');
    expect(()=>reserveBatch(f.journal,[{taskId:'m1-r2-s0',methodCapUsd:1}])).toThrow('active model');
  });
  it('charges all reported method dollars unless a matching subscription proof is supplied',()=>{
    const f=fixture(),task=reserveSafety(f),r=receipt(f,task);
    settle(f.journal,task.id,r,identity(r));expect(accounting(f.journal).cashUsd).toBe(.3);expect(accounting(f.journal).reservedUsd).toBe(0);
    expect(()=>settle(f.journal,task.id,r,identity(r))).toThrow('unsettled');
  });
  it('releases only verified pinned Claude notional, keeping answer cash charged',()=>{
    const f=fixture(),task=reserveSafety(f),r=receipt(f,task);
    settle(f.journal,task.id,r,identity(r),proof(f,task,r));
    expect(accounting(f.journal).cashUsd).toBe(.1);expect(accounting(f.journal).subscriptionNotionalUsd).toBe(.2);
  });
  it.each(['length','refusal','judge-error','judge-error-zero'])('settles fully accounted %s outcomes without promoting them or stopping other rows',failure=>{
    const f=fixture();settleSafety(f);const task=reserveBatch(f.journal,[{taskId:'m1-r1-s1',methodCapUsd:10}])[0],r=receipt(f,task,{failure});
    settle(f.journal,task.id,r,identity(r),proof(f,task,r));
    expect(f.journal.state).toBe('ready');expect(task.sourceStatus).toBe('incomplete');expect(task.outcomes).toHaveLength(25);
    expect(task.outcomes.every(r=>r.adjudication==='pending')).toBe(true);expect(task.incompleteIds).toHaveLength(1);
    expect(task.calls.answerTurns).toBe(25);expect(task.calls.judgeA).toBe(failure==='refusal'?24:25);
    expect(()=>reserveBatch(f.journal,[{taskId:task.id,methodCapUsd:10}])).toThrow('already');
  });
  it.each(['missing-cost','quarantine','generation','model','overspend','partial-selection','bad-proof','missing-log-ids','duplicate-log-ids','round-cap','call-authorization','identity-drift','judge-error-null'])('halts and retains full cash reservation for %s',kind=>{
    const f=fixture(),task=reserveSafety(f,10),r=receipt(f,task);let auth=null;
    if(kind==='missing-cost')r.rows[0].answerCost.costUsd=null;
    if(kind==='quarantine')r.quarantinedMeta={};
    if(kind==='generation')r.meta.inputSnapshot.tree.headRevision='2'.repeat(40);
    if(kind==='model')r.rows[0].answerCost.models=['wrong-model'];
    if(kind==='overspend')r.meta.totalCostUsd=11;
    if(kind==='partial-selection')r.rows=[];
    if(kind==='missing-log-ids')delete r.rows[0].answerCost.logIds;
    if(kind==='duplicate-log-ids')r.rows[0].answerCost.logIds=['same','same'];
    if(kind==='round-cap')r.meta.capContext.roundAuthorization.sourceFile.sha256=S;
    if(kind==='call-authorization')r.budget.calls[0].authorizedUsd=.001;
    if(kind==='judge-error-null'){r.rows[0].verdict={score:'error',costUsd:null,promptSha256:S};r.budget.calls[1].costUsd=null;r.budget.missingCosts=1;r.budget.status='invalid';}
    if(kind==='identity-drift')r.meta.comparable=false;
    if(kind==='bad-proof')auth={...proof(f,task,r),receiptSha256:S};
    settle(f.journal,task.id,r,identity(r),auth);
    expect(f.journal.state).toBe('halted');expect(accounting(f.journal).reservedUsd).toBe(10);
    expect(()=>reserveBatch(f.journal,[{taskId:'m1-r1-s1',methodCapUsd:1}])).toThrow('halted');
  });
  it('persists journal settlement atomically and refuses concurrent mutation',()=>{
    const f=fixture();mkdirSync(path.dirname(f.journalPath));writeFileSync(f.journalPath,JSON.stringify(f.journal));
    writeFileSync(f.journalPath+'.lock','held');expect(()=>updateJournal(f.journalPath,()=>{})).toThrow();
    rmSync(f.journalPath+'.lock');updateJournal(f.journalPath,j=>declareServer(j,j.tasks[0].model,'test'));
    expect(JSON.parse(readFileSync(f.journalPath)).server.model).toBe(f.journal.tasks[0].model);
  });
  it('holds API/probe budget in the same $200 ledger and accepts only pinned API receipts',()=>{
    const f=fixture();
    const entry={id:'judge-one',kind:'judge-b',reviewRef:'review',runId:'api-run',model:'gpt-6.1-sol',effort:'high',methodCapUsd:20,maxJudgeErrorRate:0,callIds:['case'],rowIds:['case'],receiptContract:'gateway-rejudge-v1',planSha256:S,judgeIdentitySha256:S,config:B_CONFIG,nativeSourceSha256:S};
    reserveExternal(f.journal,entry);expect(accounting(f.journal).reservedUsd).toBe(20);
    const api={meta:{resultSchema:'gateway-rejudge-v1',runId:'api-run',planSha256:S,judgeIdentity:{sha256:S,config:B_CONFIG},judgeModel:entry.model,judgeEffort:'high',mode:'rejudge',source:{sha256:S},status:'complete',selectedIds:['case'],unattemptedIds:[],unresolvedJudgeErrorIds:[]},
      budget:{schema:'gateway-judge-budget-v1',runId:'api-run',authorizedUsd:20,maxCalls:1,callsStarted:1,reportedSpendUsd:.02,totalCostUsd:.02,missingCosts:0,maxJudgeErrorRate:0,maxJudgeErrors:0,judgeErrorCount:0,stopped:null,calls:[{id:'case',promptSha256:S,status:'completed',failureClass:null,costUsd:.02,logId:'log-1',responseModel:entry.model,responseEffort:'high',gatewayLog:{id:'log-1',model:'openai/'+entry.model,provider:'openai',cached:false,customCost:false,collectLogPayload:false,statusCode:200,metadata:{role:'judge-b',runId:entry.runId,promptSha256:S}}}]},
      rows:[{id:'case',new:{score:'partial',costUsd:.02,gatewayLogId:'log-1',judgeIdentitySha256:S,model:entry.model,effort:'high'}}]};
    settleExternal(f.journal,entry.id,api,identity(api));expect(accounting(f.journal).cashUsd).toBe(.02);expect(accounting(f.journal).reservedUsd).toBe(0);expect(accounting(f.journal).apiJudgeCalls).toBe(1);
    const second={...entry,id:'judge-two',runId:'api-run-two',nativeSourceSha256:'b'.repeat(64)};reserveExternal(f.journal,second);
    const broken=structuredClone(api);broken.meta.runId=second.runId;broken.meta.source.sha256=second.nativeSourceSha256;broken.budget.runId=second.runId;broken.budget.calls[0].gatewayLog.collectLogPayload=true;
    settleExternal(f.journal,second.id,broken,identity(broken));expect(f.journal.state).toBe('halted');expect(accounting(f.journal).reservedUsd).toBe(20);
  });
  it('settles native production transport failure costs without inventing a pass',()=>{
    const f=fixture(),entry={id:'prod',kind:'production-verification',reviewRef:'review',runId:'prod-run',model:'openai/gpt-5.6-terra',effort:'none',methodCapUsd:2,callIds:['rpc-simulate#1'],receiptContract:'demo-gauntlet'};
    reserveExternal(f.journal,entry);
    const r={runId:entry.runId,completion:{status:'complete',plannedTurns:1,completedTurns:1},budget:{authorizedUsd:2,reportedUsd:.1,reportedTurns:1,unknownCostTurns:0},results:[{runId:entry.runId,promptId:'rpc-simulate',repeat:1,model:entry.model,reasoningEffort:'none',evalCost:{costUsd:.1,calls:1,reportedCalls:1,models:[entry.model],logIds:['prod-log-1'],error:null},pass:{http:true,terminal:false,finalAnswer:false,latency:true,noToolFailures:true}}]};
    settleExternal(f.journal,entry.id,r,identity(r));expect(accounting(f.journal).cashUsd).toBe(.1);expect(f.journal.external[0].outcome).toBe('failed-transport-gate');
  });

  it('retains a fully settled API judge error within its explicit allowance',()=>{
    const f=fixture(),ids=Array.from({length:20},(_,i)=>'case-'+i);
    const entry={id:'api-errors',kind:'judge-b',reviewRef:'reviewed-five-percent',runId:'api-errors-run',model:'gpt-6.1-sol',effort:'high',methodCapUsd:20,maxJudgeErrorRate:.05,callIds:ids,rowIds:ids,receiptContract:'gateway-rejudge-v1',planSha256:S,judgeIdentitySha256:S,config:B_CONFIG,nativeSourceSha256:S};
    reserveExternal(f.journal,entry);
    const calls=ids.map((id,i)=>({id,promptSha256:S,status:i===0?'error':'completed',failureClass:i===0?'consistency':null,costUsd:.02,logId:'log-'+i,responseModel:entry.model,responseEffort:'high',gatewayLog:{id:'log-'+i,model:'openai/'+entry.model,provider:'openai',cached:false,customCost:false,collectLogPayload:false,statusCode:200,metadata:{role:'judge-b',runId:entry.runId,promptSha256:S}}}));
    const r={meta:{resultSchema:'gateway-rejudge-v1',mode:'rejudge',source:{sha256:S},runId:entry.runId,planSha256:S,judgeIdentity:{sha256:S,config:B_CONFIG},judgeModel:entry.model,judgeEffort:'high',status:'complete',selectedIds:ids,unattemptedIds:[],unresolvedJudgeErrorIds:[ids[0]]},
      budget:{schema:'gateway-judge-budget-v1',runId:entry.runId,authorizedUsd:20,maxCalls:20,callsStarted:20,reportedSpendUsd:.4,totalCostUsd:.4,missingCosts:0,maxJudgeErrorRate:.05,maxJudgeErrors:1,judgeErrorCount:1,stopped:null,calls},
      rows:ids.map((id,i)=>({id,new:{score:i===0?'error':'partial',failureClass:i===0?'consistency':undefined,costUsd:.02,gatewayLogId:'log-'+i,judgeIdentitySha256:S,model:entry.model,effort:'high'}}))};
    settleExternal(f.journal,entry.id,r,identity(r));
    expect(f.journal.state).toBe('ready');expect(accounting(f.journal).cashUsd).toBe(.4);
    expect(f.journal.external[0].unresolvedJudgeErrorIds).toEqual([ids[0]]);
    expect(f.journal.external[0].adjudication).toBe('pending');
  });

  it('creates distinct prelaunch output paths for each parallel shard',()=>{
    const f=fixture();settleSafety(f);const tasks=reserveBatch(f.journal,f.journal.tasks.slice(1,5).map(t=>({taskId:t.id,methodCapUsd:10})));
    const commands=tasks.map(t=>commandFor(f.journal,t,'/caps/'+t.id+'.json','/ignored/shared-base'));
    expect(new Set(commands.map(c=>c.rawOutDir)).size).toBe(4);
    for(let i=0;i<tasks.length;i++)expect(commands[i].rawOutDir.endsWith('/'+tasks[i].id)).toBe(true);
  });
  it('reserves at most four B methods atomically and refuses mixed kinds or cash oversubscription',()=>{
    const f=fixture();const entries=Array.from({length:4},(_,i)=>apiEntry({id:'task-'+i},['case'],['case']));
    expect(()=>reserveExternalBatch(f.journal,entries.map(e=>({...e,methodCapUsd:51})))).toThrow('cash');expect(f.journal.external).toHaveLength(0);
    expect(()=>reserveExternalBatch(f.journal,[entries[0],{...entries[1],kind:'calibration'}])).toThrow('Judge B');expect(f.journal.external).toHaveLength(0);
    expect(()=>reserveExternalBatch(f.journal,[...entries,{...entries[0],id:'fifth'}])).toThrow('one to four');
    reserveExternalBatch(f.journal,entries);expect(accounting(f.journal).reservedUsd).toBe(4);
    expect(()=>reserveExternal(f.journal,{...entries[0],id:'fifth'})).toThrow('active');
  });
  it.each([
    [{answer:'partial output',finishReason:'length'},'length'],
    [{answer:'',finishReason:'incomplete'},'abort-timeout'],
    [{answer:'',finishReason:null,sseErrors:['This content was flagged for possible cybersecurity risk.']},'provider-refusal'],
    [{answer:'',finishReason:null,sseErrors:['execute call limit reached for this turn']},'tool-budget'],
    [{answer:'',finishReason:null,frames:[{type:'error',message:'provider HTTP 503'}]},'provider-error'],
    [{answer:'',finishReason:null,transcript:[{tool:'mcp__playground__execute',isError:true,result:'TypeError: Cannot read properties of undefined'}]},'model-script-error'],
    [{answer:'completed answer',finishReason:'stop',transcript:[{isError:true}]},null]
  ])('maps terminal evidence without consulting grades: %j', (row,expected)=>expect(answerFailureClass({sseErrors:[],transcript:[],...row})).toBe(expected));
  it('refuses a partial matrix and emits every missing cell',()=>{
    const f=fixture();try{readFinalsMatrix(f.journal,selection);throw new Error('accepted');}catch(error){expect(error.missingCells).toHaveLength(1616);}
  });
  it('joins all 1616 reserved cells, keeps raw failed-answer grades, and requires source-bound adjudication',()=>{
    const f=completeMatrixFixture(),pending=readFinalsMatrix(f.journal,selection,{readBytes:f.readBytes});
    expect(pending.rows).toHaveLength(1616);expect(pending.readyForDecision).toBe(false);expect(pending.rawJudgeTables.A['openai/gpt-5.6-luna'].ungraded).toBe(1);
    const failed=pending.rows.find(r=>r.answerFailure==='length');expect(failed.judgeA).toBeNull();expect(failed.judgeB).toBeNull();expect(failed.rawJudgeA.score).toBe('partial');expect(failed.provenance.sourceNonPromotable).toBe(true);expect(failed.methodValid).toBe(true);
    const adjudications={contract:'playground-finals-adjudication/v1',experimentId:f.journal.experimentId,selectionSha256:f.journal.selectionSha256,rows:pending.rows.map(r=>({cellId:r.cellId,nativeReceiptSha256:r.provenance.nativeReceipt.sha256,answerSha256:r.provenance.answerSha256,transcriptSha256:r.provenance.transcriptSha256,judgeBReceiptSha256:r.provenance.judgeBReceipt?.sha256??null,reviewer:'blind-review-fixture',reviewed:true,gradeBasis:'blinded-adjudication-v1',score:r.answerFailure?null:'partial',safety:selection.safetyCaseIds.includes(r.caseId)?'pass':'not-applicable',reason:'Reviewed full source fixture.'}))};
    const ready=readFinalsMatrix(f.journal,selection,{readBytes:f.readBytes,adjudications});expect(ready.readyForDecision).toBe(true);expect(ready.rows.every(r=>r.reviewed)).toBe(true);
    adjudications.rows[0].answerSha256=S;expect(()=>readFinalsMatrix(f.journal,selection,{readBytes:f.readBytes,adjudications})).toThrow('bound');
    const frozen=f.journal.measurement.judgeB;f.journal.measurement.judgeB={...frozen,identitySha256:'b'.repeat(64)};expect(()=>readFinalsMatrix(f.journal,selection,{readBytes:f.readBytes})).toThrow('frozen');f.journal.measurement.judgeB=frozen;
    const changed=f.journal.tasks[0].receipt.path;f.bytes.set(changed,Buffer.from('{}'));expect(()=>readFinalsMatrix(f.journal,selection,{readBytes:f.readBytes})).toThrow('changed');
  });

  it('uses the frozen adapter eligibility predicate for synthetic and available historical rows',()=>{
    const base={answer:'answer',finishReason:'stop',sseErrors:[],transcript:[]};
    const rows=[base,{...base,refusal:true},{...base,agent:{failure:'reported-failure'}},{...base,frames:[{type:'error',message:'not-an-extra-eligibility-rule'}]},
      {...base,answer:''},{...base,clientError:'timeout'},{...base,httpError:'503'},{...base,sseErrors:['error']},{...base,finishReason:'length'},
      {...base,transcript:[{tool:'execute',isError:true,result:'TypeError'}]}];
    const directory='eval/local-lanes/playground-semantic';
    if(existsSync(directory))for(const file of readdirSync(directory).filter(n=>n.startsWith('2026-11-03T')&&n.endsWith('-playground-semantic.json')))rows.push(...JSON.parse(readFileSync(path.join(directory,file))).rows);
    for(const row of rows)expect(answerFailureClass(row)===null).toBe(diagnosticAnswerProblem(row)===null);
  });
  it('requires one frozen B identity/config before finals reservation, including within a batch',()=>{
    const f=fixture(),entry=apiEntry({id:'one'},['case'],['case']);f.journal.measurement.judgeB=null;
    expect(()=>reserveExternal(f.journal,entry)).toThrow('frozen');
    freezeJudgeB(f.journal,{identitySha256:S,model:entry.model,effort:entry.effort,config:B_CONFIG},'accepted-review');
    const other={...apiEntry({id:'two'},['case'],['case']),judgeIdentitySha256:'b'.repeat(64)};
    expect(()=>reserveExternalBatch(f.journal,[entry,other])).toThrow('frozen');expect(f.journal.external).toHaveLength(0);
    expect(()=>reserveExternal(f.journal,{...entry,config:{...B_CONFIG,maxPromptBytes:64000}})).toThrow('frozen');
    expect(()=>freezeJudgeB(f.journal,{identitySha256:'b'.repeat(64),config:B_CONFIG},'changed')).toThrow('already frozen');
    const calibration={...entry,kind:'calibration',id:'calibration',runId:'calibration',judgeIdentitySha256:'c'.repeat(64),callIds:Array.from({length:7},(_,i)=>'fixture-'+i),rowIds:Array.from({length:7},(_,i)=>'fixture-'+i)};
    reserveExternal(f.journal,calibration);expect(f.journal.external).toHaveLength(1);
  });
  it('rejects overlapping B rows only within the same native source before spend',()=>{
    const f=fixture(),one=apiEntry({id:'one'},['case'],['case']),two=apiEntry({id:'two'},['case'],['case']);
    expect(()=>reserveExternalBatch(f.journal,[one,{...two,nativeSourceSha256:one.nativeSourceSha256}])).toThrow('overlapping');expect(f.journal.external).toHaveLength(0);
    reserveExternal(f.journal,one);const r=apiArtifact(one,null,{sha256:one.nativeSourceSha256});settleExternal(f.journal,one.id,r,identity(r));
    expect(f.journal.state).toBe('ready');expect(()=>reserveExternal(f.journal,{...two,nativeSourceSha256:one.nativeSourceSha256})).toThrow('overlapping');
    reserveExternal(f.journal,two);expect(f.journal.external).toHaveLength(2);
  });
  it('preserves the $20 buffer for answer and B batches',()=>{
    const f=fixture();declareServer(f.journal,f.journal.tasks[0].model,'owned');
    expect(()=>reserveBatch(f.journal,[{taskId:f.journal.tasks[0].id,methodCapUsd:180.01}])).toThrow('buffer');expect(f.journal.tasks[0].state).toBe('planned');
    reserveBatch(f.journal,[{taskId:f.journal.tasks[0].id,methodCapUsd:180}]);expect(accounting(f.journal).availableUsd).toBe(20);
    const b=fixture(),entries=Array.from({length:4},(_,i)=>({...apiEntry({id:'task-'+i},['case'],['case']),methodCapUsd:45}));
    b.journal.external.push({id:'settled-calibration',kind:'calibration',state:'settled',cashUsd:.01});
    expect(()=>reserveExternalBatch(b.journal,entries)).toThrow('cash');expect(b.journal.external).toHaveLength(1);
  });

});
