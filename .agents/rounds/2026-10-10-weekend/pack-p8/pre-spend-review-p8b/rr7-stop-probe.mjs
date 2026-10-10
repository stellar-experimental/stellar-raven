import fs from 'node:fs';
import {rejudgeRows} from '/Users/kalepail/Desktop/raven-p8-arm/eval/qa/re-judge.mjs';
import {createSpendLedger,spendLedgerRecord} from '/Users/kalepail/Desktop/raven-p8-arm/eval/qa/spend-budget.mjs';
const input=JSON.parse(fs.readFileSync('.agents/rounds/2026-10-10-weekend/pack-p8/post-run-review/saved-data/rr6-S2a-B-q-defi-arbitrage-pathpayment-bots-input.json'));
const results=[];
for(const scenario of ['over-0.60','error-vote']) {
 const ledger=createSpendLedger(.85),runState={},seen=[];
 const rows=await rejudgeRows({selectedRows:[{id:input.id,answer:input.candidateAnswer,transcript:input.transcript,verdict:{score:'correct'}}],caseById:new Map([[input.id,input]]),judgeModel:'claude-sonnet-5',judgePanel:3,spendLedger:ledger,runState,checkpoint:async()=>{},log:()=>{},judge:async(_input,options)=>{
  const n=seen.length;const verdict={score:scenario==='error-vote'&&n===0?'error':'correct',coreAnswer:'correct',missingFacts:[],wrongClaims:[],avoidMatches:[],rationale:scenario==='error-vote'&&n===0?'Mock CLI failure':'Mock complete answer',costUsd:scenario==='over-0.60'&&n===0?.61:.1};seen.push({call:n+1,authorization:options.maxBudgetUsd,...verdict});return verdict;
 }});
 results.push({scenario,calls:seen,score:rows[0].new.score,runState,budget:spendLedgerRecord(ledger)});
}
fs.writeFileSync('tmp/rr7-stop-probe.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
