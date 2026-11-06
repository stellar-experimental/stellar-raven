import {
  PLAYGROUND_ARTIFACT_CONTRACT,
  assertPlaygroundArtifactMeta,
  sha256Json
} from "../playground/artifact-contract.mjs";

/**
 * Per-row diagnostic exception for settled collections, never missing costs.
 * Validate the original object; do not repair its flags to pass ordinary gates.
 */
export function diagnosticRejudgeSource(results) {
  const refuse = (reason) => { throw new Error(`diagnostic re-judge source: ${reason}`); };
  if (results?.meta?.artifactContract !== PLAYGROUND_ARTIFACT_CONTRACT ||
      results.artifactContract || results.quarantinedMeta || results.quarantinedRows ||
      results.status === "quarantined-non-evidence") refuse("requires an unquarantined current Playground result");
  assertPlaygroundArtifactMeta(results.meta);
  if (results.meta.comparable === false || results.meta.judgeIdentity?.guard?.matches === false ||
      results.meta.identity?.matches === false) refuse("identity drift is not a judge error");
  const { budget, rows } = results;
  if (!Array.isArray(rows) || rows.length === 0 || !results.meta.judge.enabled) refuse("requires collected and judged rows");
  const ids = rows.map((row) => row.id);
  if (ids.some((id) => typeof id !== "string" || !id) || new Set(ids).size !== ids.length) refuse("invalid row IDs");
  if (sha256Json(ids) !== results.meta.inputSnapshot.caseIdsSha256 ||
      JSON.stringify(ids) !== JSON.stringify(budget?.selectedCaseIds)) refuse("selection is incomplete or changed");
  if (!["complete", "incomplete"].includes(budget?.status) || budget.error !== null ||
      budget.missingCosts !== 0 || budget.claimed !== true || budget.exhausted !== false ||
      budget.stoppedBefore !== null || !Array.isArray(budget.unattemptedCaseIds) ||
      budget.unattemptedCaseIds.length !== 0 || !Array.isArray(budget.calls)) refuse("collection or cost accounting is incomplete");
  const finiteCost = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  if (!finiteCost(budget.authorizedUsd) ||
      budget.expectedCalls !== budget.calls.length || budget.reportedCalls !== budget.calls.length ||
      budget.calls.some((call) => !finiteCost(call.costUsd))) refuse("missing or invalid call accounting");
  const total = Number(budget.calls.reduce((sum, call) => sum + call.costUsd, 0).toFixed(12));
  if (budget.reportedSpendUsd !== total || total >= budget.authorizedUsd ||
      budget.remainingUsd !== Number((budget.authorizedUsd - total).toFixed(12))) refuse("inconsistent or exhausted cost ledger");
  const models = results.meta.answering.models.map((entry) => entry.model);
  const judgeErrorIds = [];
  const ungradeableRows = [];
  const incompleteIds = [];
  let accountedCalls = 0;
  for (const row of rows) {
    if (typeof row.answer !== "string" || !Array.isArray(row.transcript) || row.provenanceError ||
        !Array.isArray(row.sseErrors) ||
        !finiteCost(row.costUsd) || row.answerCost?.error || !Number.isInteger(row.answerCost?.calls) ||
        row.answerCost.calls < 0 || !Array.isArray(row.answerCost.models) ||
        (row.answerCost.calls > 0 && !row.answerCost.models.length) ||
        (row.answerCost.calls === 0 && row.costUsd !== 0) ||
        row.answerCost.models.some((model) => !models.includes(model))) refuse(`invalid saved answer: ${row.id}`);
    const answerCalls = budget.calls.filter((call) => call.id === row.id && call.method === "answer");
    const judgeCalls = budget.calls.filter((call) => call.id === row.id && call.method === "judge");
    // The collector calls the judge only for a non-empty answer, even if its
    // terminal event is unsuccessful. Preserve those sunk costs too.
    const expectedJudgeCalls = row.answer ? 1 : 0;
    if (answerCalls.length !== 1 || judgeCalls.length !== expectedJudgeCalls || Number(answerCalls[0].costUsd.toFixed(12)) !== Number(row.costUsd.toFixed(12)) ||
        (expectedJudgeCalls === 1 && (!finiteCost(row.verdict?.costUsd) || Number(judgeCalls[0].costUsd.toFixed(12)) !== Number(row.verdict.costUsd.toFixed(12)) ||
          typeof row.verdict.promptSha256 !== "string" || !/^[a-f0-9]{64}$/.test(row.verdict.promptSha256))) ||
        !["correct", "partial", "wrong", "error"].includes(row.verdict?.score)) refuse(`unaccounted judge call: ${row.id}`);
    accountedCalls += answerCalls.length + judgeCalls.length;
    const problem = diagnosticAnswerProblem(row);
    if (problem) ungradeableRows.push({ id: row.id, reason: problem });
    if (row.verdict.score === "error") judgeErrorIds.push(row.id);
    if (problem || row.verdict.score === "error") incompleteIds.push(row.id);
  }
  if (accountedCalls !== budget.calls.length) refuse("unattributed calls");
  if (JSON.stringify(incompleteIds) !== JSON.stringify(budget.incompleteCaseIds) ||
      budget.status !== (incompleteIds.length ? "incomplete" : "complete") ||
      (incompleteIds.length > 0 && results.nonPromotable !== true)) refuse("incompleteness does not match saved row outcomes");
  return {
    mode: "saved-answer-diagnostic-v1",
    nonPromotable: true,
    sourceNonPromotable: results.nonPromotable === true,
    sourceBudget: structuredClone(budget),
    judgeErrorIds,
    ungradeableRows,
    limitation: "Per-row judge diagnostic only; source collection status is unchanged. No promotion or aggregate comparison."
  };
}

export function diagnosticAnswerProblem(row) {
  if (!row.answer.trim()) return "empty-answer";
  if (row.clientError || row.httpError || row.sseErrors.length || row.agent?.failure) return "answer-error";
  if (row.refusal || row.finishReason !== "stop") return "unsuccessful-terminal";
  return null;
}

/** A retained failed HTTP attempt; does not assert that the provider was never reached. */
export function isHarnessTransportFailure(row) {
  return typeof row?.clientError === "string" && !!row.clientError && row.responseStatus === null && row.httpError === null &&
    row.costUsd === null && row.answerCost === null && row.answer === "" && row.verdict === null &&
    Array.isArray(row.frames) && row.frames.length === 0 && Array.isArray(row.transcript) && row.transcript.length === 0 &&
    Array.isArray(row.sseErrors) && row.sseErrors.length === 0;
}

/** Explicit reviewed exception. Never modifies or projects the original native artifact. */
export function partialRecoverySource(results, recovery, proof, receiptSha256) {
  const fail = message => { throw new Error(`partial recovery: ${message}`); };
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const cost = n => {
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0) fail("missing/invalid known cost");
    return Number(n.toFixed(12));
  };
  const sum = ns => Number(ns.reduce((a,b)=>a+cost(b),0).toFixed(12));
  const unique = ids => Array.isArray(ids) && ids.every(id=>typeof id==='string' && id) && new Set(ids).size===ids.length;
  if (recovery?.contract !== "playground-partial-recovery/v1" || !/^[a-f0-9]{64}$/.test(receiptSha256 ?? "") ||
      recovery.receipt?.sha256 !== receiptSha256 || !recovery.reviewRef?.trim() || !recovery.parentTaskId?.trim() || !recovery.experimentId?.trim()) fail("explicit pinned recovery required");
  if (results?.meta?.artifactContract !== PLAYGROUND_ARTIFACT_CONTRACT || results.artifactContract || results.quarantinedMeta || results.quarantinedRows || results.status === "quarantined-non-evidence") fail("quarantine or wrong contract");
  assertPlaygroundArtifactMeta(results.meta);
  if (results.meta.comparable === false || results.meta.identity?.matches === false || results.meta.judgeIdentity?.guard?.matches === false || results.nonPromotable !== true) fail("source drift or flags");
  const {rows,budget,meta}=results;
  if (!Array.isArray(rows) || rows.length<2 || !meta.judge.enabled || !unique(budget?.selectedCaseIds) || budget.selectedCaseIds.length>25 || rows.length>=budget.selectedCaseIds.length) fail("partial selection required");
  const ids=rows.map(r=>r.id), selected=budget.selectedCaseIds, suffix=selected.slice(rows.length);
  if (!unique(ids) || !same(ids,selected.slice(0,rows.length)) || !same(budget.unattemptedCaseIds,suffix) ||
      sha256Json(selected)!==meta.inputSnapshot.caseIdsSha256 || !same(recovery.inputSnapshot,meta.inputSnapshot) ||
      !same(recovery.selectedCaseIds,selected) || !same(recovery.attemptedIds,ids) || !same(recovery.continuationIds,suffix) ||
      !same(recovery.sourceBudget,budget) || recovery.sourceNonPromotable!==true) fail("source partition or snapshot differs");
  if (budget.status!=="invalid" || budget.error!=="missing-reported-cost" || budget.missingCosts!==1 || budget.claimed!==true || budget.exhausted!==false || budget.stoppedBefore!==null ||
      !Array.isArray(budget.calls) || budget.expectedCalls!==budget.calls.length || budget.reportedCalls!==budget.calls.length-1 ||
      cost(recovery.conservativeChargeUsd)!==cost(budget.authorizedUsd)) fail("unsupported accounting failure");
  const failed=rows.at(-1);
  if (!isHarnessTransportFailure(failed) || failed.clientError !== "fetch failed" || !same(recovery.failure,{id:failed.id,class:"harness-transport-failure"})) fail("unsupported failed attempt");
  let index=0, remaining=cost(budget.authorizedUsd); const knownRows=[], logs=new Set();
  for (const row of rows.slice(0,-1)) {
    const a=budget.calls[index++], b=budget.calls[index++], frame=row.answerCost;
    if (typeof row.answer!=="string" || !row.answer.trim() || !Array.isArray(row.transcript) || !Array.isArray(row.sseErrors) || row.provenanceError ||
        a?.method!=="answer" || a.id!==row.id || b?.method!=="judge" || b.id!==row.id ||
        !["correct","partial","wrong","error"].includes(row.verdict?.score) || !/^[a-f0-9]{64}$/.test(row.verdict?.promptSha256 ?? "")) fail("invalid known row");
    if (cost(a.authorizedUsd)!==remaining || cost(a.costUsd)!==cost(row.costUsd)) fail("answer authorization differs");
    remaining=cost(Number((remaining-cost(a.costUsd)).toFixed(12)));
    if (cost(b.authorizedUsd)!==remaining || cost(b.costUsd)!==cost(row.verdict.costUsd)) fail("judge authorization differs");
    remaining=cost(Number((remaining-cost(b.costUsd)).toFixed(12)));
    if (!frame || frame.error!==null || !unique(frame.logIds) || !frame.logIds.length || frame.calls!==frame.logIds.length || frame.reportedCalls!==frame.calls ||
        !same(frame.models,[meta.answering.primaryModel]) || meta.answering.fallbackModels.length || cost(frame.costUsd)!==cost(row.costUsd) || cost(frame.reportedCostUsd)!==cost(row.costUsd) ||
        !Array.isArray(row.frames) || row.frames.filter(f=>f.type==='eval-cost').length!==1 || !same(row.frames.find(f=>f.type==='eval-cost'),frame)) fail("known Gateway accounting differs");
    for (const id of frame.logIds) { if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id) || logs.has(id)) fail("duplicate/invalid Gateway log"); logs.add(id); }
    knownRows.push({id:row.id,costUsd:cost(row.costUsd),judgeCostUsd:cost(row.verdict.costUsd),logIds:[...frame.logIds]});
  }
  const last=budget.calls[index++];
  if (index!==budget.calls.length || last?.method!=="answer" || last.id!==failed.id || last.costUsd!==null || cost(last.authorizedUsd)!==remaining) fail("unknown final call differs");
  const answer=sum(knownRows.map(r=>r.costUsd)), judge=sum(knownRows.map(r=>r.judgeCostUsd)), total=sum([answer,judge]);
  if (cost(budget.reportedSpendUsd)!==total || cost(budget.remainingUsd)!==remaining || cost(meta.totalAgentCostUsd)!==answer || cost(meta.totalJudgeCostUsd)!==judge || cost(meta.totalCostUsd)!==total ||
      cost(recovery.knownAnswerCashUsd)!==answer || cost(recovery.knownSubscriptionNotionalUsd)!==judge || !same(recovery.knownRows,knownRows)) fail("known totals differ");
  const incomplete=[...rows.filter(r=>diagnosticAnswerProblem(r)!==null || r.verdict?.score==='error').map(r=>r.id),...suffix];
  if (!same(budget.incompleteCaseIds,incomplete)) fail("incomplete IDs differ");
  if (!Array.isArray(proof?.knownRows) || proof.knownRows.length!==knownRows.length || proof.knownAnswerCashUsd!==answer) fail("missing exact Gateway proof");
  for (let i=0;i<knownRows.length;i++) {
    const known=knownRows[i], observed=proof.knownRows[i];
    if (observed.id!==known.id || cost(observed.costUsd)!==known.costUsd || !same(observed.logs?.map(l=>l.id),known.logIds)) fail("Gateway proof rows differ");
    for (const l of observed.logs) if (l.model!==meta.answering.primaryModel || l.provider!==meta.answering.primaryModel.split('/')[0] || l.cached!==false || l.custom_cost!==false || l.collect_log_payload!==false) fail("Gateway proof identity/privacy differs");
    if (sum(observed.logs.map(l=>l.cost))!==known.costUsd) fail("Gateway proof cost differs");
  }
  return {mode:"reviewed-partial-diagnostic-v1",nonPromotable:true,sourceNonPromotable:true,sourceBudget:structuredClone(budget),
    selectedIds:[...selected],attemptedIds:ids,continuationIds:suffix,knownRows,knownAnswerCashUsd:answer,knownSubscriptionNotionalUsd:judge,
    ungradeableRows:rows.filter(r=>diagnosticAnswerProblem(r)!==null).map(r=>({id:r.id,reason:diagnosticAnswerProblem(r)})),
    limitation:"Original collection remains invalid. Full method cap conservatively charged, not an invoice; failed attempt retained and never retried."};
}
