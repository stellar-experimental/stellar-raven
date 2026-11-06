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
    if (answerCalls.length !== 1 || judgeCalls.length !== expectedJudgeCalls || answerCalls[0].costUsd !== row.costUsd ||
        (expectedJudgeCalls === 1 && (!finiteCost(row.verdict?.costUsd) || judgeCalls[0].costUsd !== row.verdict.costUsd ||
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
