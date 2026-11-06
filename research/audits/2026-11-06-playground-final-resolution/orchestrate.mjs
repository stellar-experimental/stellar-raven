#!/usr/bin/env node
/**
 * Dated, offline planning/accounting only. No process or network launch exists.
 * Keep the journal/raw receipts in the coordinator's ignored eval/local-lanes/,
 * outside the frozen measurement checkout. Commit sanitized closeout summaries.
 * Subscription release trusts the owner's reviewed, receipt-specific auth attestation;
 * it does not infer subscription billing from Claude's reported dollar amount.
 */
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertPlaygroundArtifactMeta } from '../../../eval/playground/artifact-contract.mjs';
import { isSettledJudgeRowFailure, gatewayJudgeConfig } from '../../../eval/qa/gateway-judge.mjs';
import { diagnosticRejudgeSource, diagnosticAnswerProblem, partialRecoverySource, isHarnessTransportFailure } from '../../../eval/qa/diagnostic-rejudge-source.mjs';

const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SCALE = 1e12;
export const CASH_CAP_USD = 200;
export const CASH_BUFFER_USD = 20;
export const FINALISTS = Object.freeze([
  ['openai/gpt-5.6-luna', 'none'],
  ['anthropic/claude-haiku-5.5', 'none'],
  ['openai/gpt-6.1-terra', 'none'],
  ['openai/gpt-6.1-sol', 'low'],
  ['openai/gpt-5.6-terra', 'none'],
  ['anthropic/claude-sonnet-5.5', 'none'],
  ['openai/gpt-5.6-sol', 'none'],
  ['openai/gpt-6-astra', 'low']
]);
const INPUT_FILES = {
  corpusFileSha256: 'eval/qa/cases.json',
  manifestFileSha256: 'catalog/manifest.json',
  superSpecFileSha256: 'specs/super-spec.json',
  runnerFileSha256: 'scripts/run-playground-semantic-eval.mjs',
  modelConfigFileSha256: 'src/demo/model-config.ts',
  judgeFileSha256: 'eval/qa/judge.mjs',
  evidencePackFileSha256: 'eval/qa/evidence-pack.mjs'
};
const fail = message => { throw new Error(message); };
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const hashJson = value => sha256(JSON.stringify(value));
const load = file => JSON.parse(readFileSync(file, 'utf8'));
const jsonBytes = value => `${JSON.stringify(value, null, 2)}\n`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const required = (value, label) => { if (typeof value !== 'string' || !value.trim()) fail(`${label} is required`); return value; };
const sha = (value, label) => { if (!/^[a-f0-9]{64}$/.test(value)) fail(`${label} must be a SHA-256`); return value; };
function units(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > CASH_CAP_USD * 10) fail('invalid USD amount');
  return Math.round(value * SCALE);
}
const usd = value => value / SCALE;
const unique = xs => Array.isArray(xs) && xs.length === new Set(xs).size;
function inside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
function physicalDestination(file) {
  if (existsSync(file)) return realpathSync(file);
  let ancestor = path.resolve(file);
  const suffix = [];
  while (!existsSync(ancestor)) { suffix.unshift(path.basename(ancestor)); ancestor = path.dirname(ancestor); }
  return path.join(realpathSync(ancestor), ...suffix);
}
export function plan(selection, cases) {
  if (selection.contract !== 'playground-model-finals-selection/v1' || selection.repeats !== 2 || selection.models !== 8) fail('unexpected selection contract');
  const quality = selection.qualityCaseIds;
  const safety = selection.safetyCaseIds;
  if (!unique(quality) || quality.length !== 100 || !unique(safety) || safety.length !== 1 || quality.includes(safety[0])) fail('expected 100 unique quality IDs and one disjoint safety ID');
  if (!same(selection.orderedCaseIds, [...quality, ...safety])) fail('selection order differs');
  if (quality.some(id => selection.excludedStage2Ids.includes(id))) fail('quality selection overlaps stage 2');
  const byId = new Map(cases.map(c => [c.id, c]));
  if (byId.size !== cases.length || selection.orderedCaseIds.some(id => !byId.has(id))) fail('missing or duplicate corpus IDs');
  if (hashJson(quality.map(id => byId.get(id))) !== selection.qualityCasesSha256) fail('quality case content differs from frozen selection');
  if (hashJson(selection.orderedCaseIds) !== selection.orderedCaseIdsSha256 || hashJson(selection.orderedCaseIds.map(id => byId.get(id))) !== selection.orderedCasesSha256) fail('ordered case selection differs');
  const tasks = [];
  FINALISTS.forEach(([model, effort], modelIndex) => {
    for (let repeat = 1; repeat <= 2; repeat++) {
      const shards = [safety, ...Array.from({ length: 4 }, (_, i) => quality.slice(i * 25, i * 25 + 25))];
      shards.forEach((ids, shard) => {
        // --ids is a filter: the native runner emits corpus order, not argument order.
        const selected = cases.filter(c => ids.includes(c.id));
        tasks.push({ id: `m${modelIndex + 1}-r${repeat}-s${shard}`, model, effort, repeat, shard,
          kind: shard === 0 ? 'safety' : 'quality', ids: selected.map(c => c.id), casesSha256: hashJson(selected), caseIdsSha256: hashJson(selected.map(c => c.id)) });
      });
    }
  });
  const shards = tasks.filter(t => t.model === tasks[0].model && t.repeat === 1).map(({shard, kind, ids, casesSha256, caseIdsSha256}) => ({shard, kind, ids, casesSha256, caseIdsSha256}));
  if (!same(shards, selection.shards) || hashJson(shards) !== selection.shardMappingsSha256) fail('frozen shard mapping differs');
  if (tasks.length !== 80 || tasks.reduce((sum, t) => sum + t.ids.length, 0) !== selection.plannedAnswerTurns) fail('planned denominator differs');
  return tasks;
}
export function createJournal(config, selection, cases, journalPath) {
  const measurementRoot = realpathSync(config.measurementRoot);
  if (inside(physicalDestination(journalPath), measurementRoot)) fail('durable journal must be outside the frozen measurement checkout');
  if (!/^[a-f0-9]{40}$/.test(config.measurementRevision)) fail('measurementRevision must be a full Git commit');
  sha(config.generationSha256, 'generationSha256');
  required(config.reviewRef, 'independent plan review reference');
  required(config.gatewayId, 'gatewayId');
  const endpoint = new URL(config.url);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname) || !['http:', 'https:'].includes(endpoint.protocol)) fail('measurement URL must be loopback');
  for (const field of Object.keys(INPUT_FILES)) sha(config.inputFileHashes?.[field], field);
  if (config.inputFileHashes.corpusFileSha256 !== selection.corpusSha256) fail('selection corpus pin differs');
  if (config.judgeA?.model !== 'claude-sonnet-5' || config.judgeA?.rubric !== 'v2.11' || config.judgeA?.packVersion !== 'p9') fail('unexpected Judge A contract');
  sha(config.judgeA.executableSha256, 'judgeA executable');
  sha(config.judgeA.environmentSha256, 'judgeA environment');
  required(config.judgeA.realPath, 'judgeA realPath');
  const result = {
    contract: 'playground-finals-journal/v1', experimentId: required(config.experimentId, 'experimentId'),
    createdAt: new Date().toISOString(), selectionSha256: hashJson(selection), cashCapUsd: CASH_CAP_USD,
    measurement: { measurementRoot, measurementRevision: config.measurementRevision, generationSha256: config.generationSha256,
      reviewRef: config.reviewRef, url: config.url, gatewayId: config.gatewayId, inputFileHashes: { ...config.inputFileHashes }, judgeA: { ...config.judgeA }, judgeB: config.judgeB ? normalizedJudgeB(config.judgeB) : null }, state: 'ready', halt: null, server: null,
    tasks: plan(selection, cases).map(t => ({ ...t, state: 'planned' })), external: [], events: []
  };
  verifyMeasurement(result);
  return result;
}
export function verifyMeasurement(journal) {
  for (const [field, file] of Object.entries(INPUT_FILES)) {
    const actual = sha256(readFileSync(path.join(journal.measurement.measurementRoot, file)));
    if (actual !== journal.measurement.inputFileHashes[field]) fail(`measurement input changed: ${file}`);
  }
}
export function accounting(journal) {
  const entries = [...journal.tasks, ...journal.external];
  const reserved = entries.filter(t => ['reserved', 'unresolved'].includes(t.state)).reduce((sum, t) => sum + units(t.methodCapUsd), 0);
  const cash = entries.filter(t => ['settled', 'failed', 'settled-partial'].includes(t.state)).reduce((sum, t) => sum + units(t.ceilingChargeUsd ?? t.cashUsd), 0);
  const conservative = entries.filter(t=>t.state==='settled-partial').reduce((n,t)=>n+units(t.ceilingChargeUsd),0);
  const knownCash = entries.filter(t=>['settled','failed','settled-partial'].includes(t.state)).reduce((n,t)=>n+units(t.state==='settled-partial'?t.knownCashUsd:t.cashUsd),0);
  const apiJudgeCalls = entries.reduce((sum, t) => sum + (t.calls?.apiJudge ?? 0), 0);
  const reservedAnswerTurns = entries.filter(t => ['reserved', 'unresolved'].includes(t.state)).reduce((sum, t) => sum + (t.ids?.length ?? (t.receiptContract === 'demo-gauntlet' ? t.callIds.length : 0)), 0);
  const reservedApiJudgeCalls = journal.external.filter(t => ['reserved', 'unresolved'].includes(t.state) && t.receiptContract === 'gateway-rejudge-v1').reduce((sum, t) => sum + t.callIds.length, 0);
  const notional = entries.reduce((sum, t) => sum + units(t.subscriptionNotionalUsd ?? 0), 0);
  const answerCalls = entries.reduce((sum, t) => sum + (t.calls?.answerTurns ?? 0), 0);
  const judgeCalls = entries.reduce((sum, t) => sum + (t.calls?.judgeA ?? 0), 0);
  // Reconciled actual cash and conservative ceiling consumption are distinct.
  return { cashCapUsd: CASH_CAP_USD, knownCashUsd: usd(knownCash), ceilingConsumedUsd: usd(cash), conservativeChargeUsd: usd(conservative), reservedUsd: usd(reserved), availableUsd: usd(units(CASH_CAP_USD) - cash - reserved), subscriptionNotionalUsd: usd(notional), answerTurns: answerCalls, judgeACalls: judgeCalls, apiJudgeCalls, reservedAnswerTurns, reservedApiJudgeCalls };
}
function active(journal) { return [...journal.tasks, ...journal.external].filter(t => ['reserved', 'unresolved'].includes(t.state)); }
export function declareServer(journal, model, ownerTerminalId) {
  if (journal.state !== 'ready' || journal.server || active(journal).length) fail('cannot declare another server while stopped, leased or reserved');
  const next = journal.tasks.find(t => t.state === 'planned');
  if (next?.model !== model) fail('models must run in fixed planned order');
  journal.server = { model, ownerTerminalId: required(ownerTerminalId, 'owner terminal'), generationSha256: journal.measurement.generationSha256, gatewayId: journal.measurement.gatewayId };
}
export function closeServer(journal) {
  if (!journal.server || active(journal).length) fail('cannot close the declared server while reservations remain');
  // This records an owner's observed stop; it never stops a process.
  journal.events.push({ type: 'server-observed-stopped', model: journal.server.model });
  journal.server = null;
}
export function reserveBatch(journal, allocations) {
  if (journal.state !== 'ready') fail('journal halted; explicit reviewed reconciliation is required');
  if (!journal.server || active(journal).length) fail('declare one server and settle the prior batch first');
  if (!Array.isArray(allocations) || allocations.length < 1 || allocations.length > 4 || !unique(allocations.map(a => a.taskId))) fail('reserve one to four distinct shards');
  const tasks = allocations.map(a => journal.tasks.find(t => t.id === a.taskId));
  if (tasks.some(t => !t || t.state !== 'planned')) fail('task absent or already reserved/attempted; no automatic retry');
  const first = journal.tasks.find(t => t.model === journal.server.model && t.state === 'planned');
  if (tasks.some(t => t.model !== journal.server.model || t.repeat !== first?.repeat)) fail('a batch must share the active model and next repeat');
  const safety = journal.tasks.find(t => t.model === first.model && t.repeat === first.repeat && t.kind === 'safety');
  if (safety.state === 'planned' && (tasks.length !== 1 || tasks[0].id !== safety.id)) fail('run the isolated safety shard first');
  const reservation = allocations.reduce((sum, a) => {
    const n = units(a.methodCapUsd); if (n <= 0) fail('method caps must be positive'); return sum + n;
  }, 0);
  if (reservation + units(CASH_BUFFER_USD) > units(accounting(journal).availableUsd)) fail('batch would exceed the owner $200 ceiling with $20 buffer');
  const before = {answerTurns: journal.tasks.reduce((n,t) => n + (t.calls?.answerTurns ?? 0), 0),
    judgeACalls: journal.tasks.reduce((n,t) => n + (t.calls?.judgeA ?? 0), 0)};
  const batchId = randomUUID();
  tasks.forEach((task, i) => {
    Object.assign(task, { state: 'reserved', methodCapUsd: allocations[i].methodCapUsd, batchId, reservedAt: new Date().toISOString(),
      consumedBefore: { answerTurns: before.answerTurns, judgeA: before.judgeACalls }, outputKey: `native/${task.id}` });
    task.roundCapSha256 = sha256(jsonBytes(roundCap(journal, task)));
  });
  journal.events.push({ type: 'batch-reserved', batchId, tasks: tasks.map(t => t.id), methodCapUsd: usd(reservation) });
  return tasks;
}
export function roundCap(journal, task) {
  return { contract: 'playground-semantic-round-cap/v1', experimentId: journal.experimentId, kind: 'reviewed-round', runAllocation: 'planned',
    plannedAnswerCalls: 1616, absoluteAnswerCallCap: 1616, answerCallsConsumedBeforeRun: task.consumedBefore.answerTurns,
    plannedJudgeCalls: 1616, absoluteJudgeCallCap: 1616, judgeCallsConsumedBeforeRun: task.consumedBefore.judgeA,
    infraRetryReserve: 0, infraRetryConsumedBeforeRun: 0, savedAnswerRejudgeReserve: 0, savedAnswerRejudgesConsumedBeforeRun: 0 };
}
export function commandFor(journal, task, capPath, rawOutBase) {
  const rawOutDir = path.join(path.resolve(rawOutBase), task.id);
  if (task.state !== 'reserved') fail('commands require a durable reservation');
  task.rawOutDir = path.resolve(rawOutDir);
  task.launch = { taskId: task.id, model: task.model, repeat: task.repeat, caseIdsSha256: task.caseIdsSha256, rawOutDir: task.rawOutDir, batchId: task.batchId };
  return { cwd: journal.measurement.measurementRoot,
    environment: { DEMO_MODEL_OVERRIDE: task.model, DEMO_REASONING_EFFORT_OVERRIDE: task.effort, DEMO_OPENAI_API_MODE: 'responses' },
    rawOutDir, argv: ['node', 'scripts/run-playground-semantic-eval.mjs', '--confirm-paid', '--max-budget-usd', String(task.methodCapUsd), '--url', journal.measurement.url,
      '--server-generation', journal.measurement.generationSha256, '--round-cap-context', capPath, '--cases', 'eval/qa/cases.json', '--ids', task.ids.join(','),
      '--judge-model', 'claude-sonnet-5', '--timeout-ms', '150000', '--out-dir', rawOutDir],
    instruction: 'Proposal only. Owner verifies the sole loaded server, CLI/environment, gateway and reviewed authorization before manual launch.' };
}
export function validateReceipt(journal, task, receipt, partial = null) {
  if (receipt.quarantinedMeta || receipt.quarantinedRows || receipt.artifactContract?.includes('quarantine')) fail('quarantine is forensic only');
  assertPlaygroundArtifactMeta(receipt.meta);
  if (partial) {
    if(partial.recovery.parentTaskId!==task.id || partial.recovery.experimentId!==journal.experimentId || !same(partial.recovery.receipt,task.receipt))fail('partial task source binding differs');
    partialRecoverySource(receipt, partial.recovery, partial.proof, partial.receiptSha256);
  }
  else diagnosticRejudgeSource(receipt);
  const { meta, budget, rows } = receipt;
  if (!partial && (!['complete', 'incomplete'].includes(budget?.status) || budget.missingCosts !== 0 || budget.error)) fail('invalid/unknown accounting requires reconciliation');
  if (!Array.isArray(rows) || !same(rows.map(r => r.id), partial ? partial.recovery.attemptedIds : task.ids) || !same(budget.selectedCaseIds, task.ids) || !Array.isArray(budget.incompleteCaseIds) || !unique(budget.incompleteCaseIds) || budget.incompleteCaseIds.some(id => !task.ids.includes(id)) || !same(budget.unattemptedCaseIds, partial ? partial.recovery.continuationIds : [])) fail('receipt denominator differs or has unattempted rows');
  if (meta.capContext.roundAuthorization.sourceFile.sha256 !== task.roundCapSha256 || meta.capContext.roundAuthorization.experimentId !== journal.experimentId) fail('receipt round authorization differs');
  if (units(meta.capContext.evaluator.maxBudgetUsd) !== units(task.methodCapUsd)) fail('receipt evaluator budget differs');
  const snapshot = meta.inputSnapshot;
  if (snapshot.tree.headRevision !== journal.measurement.measurementRevision || snapshot.tree.dirty || snapshot.serverGenerationSha256 !== journal.measurement.generationSha256) fail('receipt generation differs');
  if (snapshot.casesSha256 !== task.casesSha256 || snapshot.caseIdsSha256 !== task.caseIdsSha256) fail('selected case snapshot differs');
  for (const field of Object.keys(INPUT_FILES)) if (snapshot[field] !== journal.measurement.inputFileHashes[field]) fail(`receipt input differs: ${field}`);
  if (meta.answering.primaryModel !== task.model || meta.answering.fallbackModels.length || meta.answering.reasoningEffort.value !== task.effort || meta.answering.apiMode.effective !== (task.model.startsWith('openai/') ? 'responses' : 'chat')) fail('answer configuration differs');
  if (meta.judge.model !== journal.measurement.judgeA.model || meta.judge.rubric !== journal.measurement.judgeA.rubric || meta.judge.packVersion !== journal.measurement.judgeA.packVersion ||
      meta.judge.executable?.sha256 !== journal.measurement.judgeA.executableSha256 || meta.judge.executable?.realPath !== journal.measurement.judgeA.realPath) fail('Judge A identity differs');
  if (units(budget.authorizedUsd) !== units(task.methodCapUsd) || !Array.isArray(budget.calls) || budget.reportedCalls !== budget.calls.length - (partial ? 1 : 0) || budget.expectedCalls !== budget.calls.length) fail('method budget/call count differs');
  let remaining = units(task.methodCapUsd);
  for (const call of budget.calls) {
    if (units(call.authorizedUsd) !== remaining || (call.costUsd !== null && units(call.costUsd) > remaining)) fail('per-call authorization differs');
    if (call.costUsd !== null) remaining -= units(call.costUsd);
    else if (!partial) fail("missing call cost");
  }
  let answer = 0, judge = 0, providerCalls = 0, judgeCalls = 0, index = 0;
  const outcomes = [], logIdHashes = [];
  const previouslyUsedLogs = new Set([...journal.tasks, ...journal.external].filter(t => t.id !== task.id).flatMap(t => t.logIdHashes ?? []));
  for (const row of rows) {
    const a = budget.calls[index++], frame = row.answerCost;
    if (partial && row.id === partial.recovery.failure.id) {
      // The partial guard proved this sole unknown-cost final answer call; retain its failed cell.
      outcomes.push({id:row.id,finishReason:row.finishReason,answerPresent:false,score:null,methodValid:true,
        answerCostUsd:null,judgeACostUsd:null,gatewayModels:[],responseStatus:null,clientError:true,httpError:false,sseError:false,
        toolFailureCount:0,adjudication:'pending',answerFailure:'harness-transport-failure'});
      continue;
    }
    if (a?.method !== 'answer' || a.id !== row.id || units(a.costUsd) !== units(row.costUsd)) fail('missing or inconsistent answer ledger call');
    const b = budget.calls[index]?.method === 'judge' ? budget.calls[index++] : null;
    if (b && (b.id !== row.id || units(b.costUsd) !== units(row.verdict?.costUsd))) fail('judge row cost differs from ledger');
    if (!!row.answer !== !!b) fail('judge call does not match answer eligibility');
    if (!frame || frame.error || !Number.isInteger(frame.calls) || frame.calls < 1 || frame.reportedCalls !== frame.calls || !same(frame.models, [task.model]) || units(frame.costUsd) !== units(a.costUsd)) fail('missing/inconsistent Gateway settlement');
    if (!Array.isArray(frame.logIds) || frame.logIds.length !== frame.calls || !unique(frame.logIds) || frame.logIds.some(id => typeof id !== 'string' || !id)) fail('missing/duplicate answer Gateway IDs');
    for (const id of frame.logIds) {
      const hashed = sha256(id);
      if (logIdHashes.includes(hashed) || previouslyUsedLogs.has(hashed)) fail('answer Gateway identity reused');
      logIdHashes.push(hashed);
    }
    if (!Array.isArray(row.frames) || row.frames.filter(f => f.type === 'eval-cost').length !== 1 || !same(row.frames.find(f => f.type === 'eval-cost'), frame)) fail('accounting frames differ');
    const problem = diagnosticAnswerProblem(row) !== null || !['correct', 'partial', 'wrong'].includes(row.verdict?.score);
    if (problem && !budget.incompleteCaseIds.includes(row.id)) fail('semantic failure missing from incomplete IDs');
    outcomes.push({ id: row.id, finishReason: row.finishReason, answerPresent: !!row.answer?.trim(), score: row.verdict?.score ?? null,
      methodValid: true, answerCostUsd: row.costUsd, judgeACostUsd: b?.costUsd ?? null, gatewayModels: [...frame.models],
      responseStatus: row.responseStatus, clientError: !!row.clientError, httpError: !!row.httpError, sseError: !!row.sseErrors?.length,
      toolFailureCount: (row.transcript ?? []).filter(t => t.isError).length, adjudication: 'pending' });
    answer += units(a.costUsd); if (b) { judge += units(b.costUsd); judgeCalls++; } providerCalls += frame.calls;
  }
  const total = answer + judge;
  if (index !== budget.calls.length || total > units(task.methodCapUsd) || units(meta.totalAgentCostUsd) !== answer || units(meta.totalJudgeCostUsd) !== judge || units(meta.totalCostUsd) !== total || units(budget.reportedSpendUsd) !== total) fail('receipt cost sum differs or exceeds reservation');
  return { answerUsd: usd(answer), judgeUsd: usd(judge), methodUsd: usd(total), calls: { answerTurns: rows.length, judgeA: judgeCalls, answerProviderCalls: providerCalls, ...(partial ? {unknownAnswerProviderCalls:true} : {}) },
    logIdHashes, sourceRunId: required(meta.runId, 'receipt runId'), sourceStatus: budget.status, sourceNonPromotable: receipt.nonPromotable === true, incompleteIds: [...budget.incompleteCaseIds], outcomes };
}
export function settle(journal, taskId, receipt, receiptIdentity, subscriptionProof = null) {
  const task = journal.tasks.find(t => t.id === taskId);
  if (!task || task.state !== 'reserved') fail('settlement requires an unsettled reservation');
  // A bad receipt is persisted as a halt with the entire reservation retained.
  try {
    sha(receiptIdentity.sha256, 'receipt file');
    if (!task.launch || task.launch.taskId !== task.id || task.launch.model !== task.model || task.launch.repeat !== task.repeat || task.launch.caseIdsSha256 !== task.caseIdsSha256 ||
        path.dirname(path.resolve(receiptIdentity.path)) !== task.launch.rawOutDir || path.basename(receiptIdentity.path) !== `${receipt.meta?.runId}-playground-semantic.json`) fail('receipt is not in the prelaunch task output mapping');
    if ([...journal.tasks, ...journal.external].some(t => t.id !== taskId && t.receipt?.sha256 === receiptIdentity.sha256)) fail('receipt file already accounted');
    const costs = validateReceipt(journal, task, receipt);
    if (subscriptionProof) {
      if (subscriptionProof.contract !== 'playground-claude-subscription-attestation/v1' || subscriptionProof.taskId !== taskId || subscriptionProof.experimentId !== journal.experimentId ||
          subscriptionProof.receiptSha256 !== receiptIdentity.sha256 || subscriptionProof.executableSha256 !== journal.measurement.judgeA.executableSha256 ||
          subscriptionProof.environmentSha256 !== journal.measurement.judgeA.environmentSha256 || subscriptionProof.billingMode !== 'subscription' || subscriptionProof.apiCredentialsExcluded !== true) fail('subscription evidence does not attest this receipt and executable');
      sha(subscriptionProof.environmentSha256, 'subscription environment');
      required(subscriptionProof.reviewRef, 'reviewed subscription authentication evidence');
    }
    Object.assign(task, { state: 'settled', receipt: receiptIdentity, ...costs,
      cashUsd: subscriptionProof ? costs.answerUsd : costs.methodUsd, subscriptionNotionalUsd: subscriptionProof ? costs.judgeUsd : 0,
      subscriptionAttestation: subscriptionProof ? { sha256: hashJson(subscriptionProof), environmentSha256: subscriptionProof.environmentSha256, reviewRef: subscriptionProof.reviewRef } : null });
    journal.events.push({ type: 'settled', taskId, receiptSha256: receiptIdentity.sha256, cashUsd: task.cashUsd });
  } catch (error) {
    task.state = 'unresolved'; task.receipt = receiptIdentity; task.reconciliationReason = error.message;
    journal.state = 'halted'; journal.halt = { taskId, reason: error.message };
    journal.events.push({ type: 'reconciliation-required', taskId, reason: error.message, retainedUsd: task.methodCapUsd });
  }
  return task;
}
function assertSubscription(journal,task,identity,proof) {
  if (!proof || proof.contract!=='playground-claude-subscription-attestation/v1' || proof.taskId!==task.id || proof.experimentId!==journal.experimentId ||
      proof.receiptSha256!==identity.sha256 || proof.executableSha256!==journal.measurement.judgeA.executableSha256 ||
      proof.environmentSha256!==journal.measurement.judgeA.environmentSha256 || proof.billingMode!=='subscription' || proof.apiCredentialsExcluded!==true || !proof.reviewRef?.trim()) fail('partial subscription attestation differs');
}
export function loadRecoveryEvidence(identity, readBytes=readFileSync) {
  sha(identity?.sha256,'recovery sidecar'); required(identity?.path,'recovery sidecar path');
  const bytes=readBytes(identity.path); if(sha256(bytes)!==identity.sha256)fail('recovery sidecar changed');
  const recovery=JSON.parse(bytes), pinned=recovery.gatewayProof;
  sha(pinned?.sha256,'Gateway proof');required(pinned?.path,'Gateway proof path');
  const proofBytes=readBytes(pinned.path);if(sha256(proofBytes)!==pinned.sha256)fail('Gateway proof changed');
  return {recovery,proof:JSON.parse(proofBytes),receiptSha256:recovery.receipt?.sha256};
}
export function settlePartial(journal,taskId,receipt,identity,recoveryIdentity,subscriptionProof,{readBytes=readFileSync}={}) {
  const task=journal.tasks.find(t=>t.id===taskId);
  if (!task || task.state!=='unresolved' || task.parentTaskId || journal.tasks.some(t=>t.recovery) || active(journal).some(t=>t.id!==taskId)) fail('partial settlement requires sole unresolved original task');
  if (!same(task.receipt,identity) || !task.launch || task.launch.rawOutDir!==path.dirname(identity.path) || path.basename(identity.path)!==`${receipt.meta?.runId}-playground-semantic.json`) fail('partial original receipt differs');
  const partial=loadRecoveryEvidence(recoveryIdentity,readBytes), {recovery,proof}=partial;
  if (!same(recovery.receipt,identity) || recovery.parentTaskId!==taskId || recovery.experimentId!==journal.experimentId ||
      !same(recovery.selectedCaseIds,task.ids) || proof.gatewayId!==journal.measurement.gatewayId || proof.accountId!==journal.measurement.judgeB?.config.accountId || costMismatch(recovery.conservativeChargeUsd,task.methodCapUsd)) fail('recovery authorization differs');
  assertSubscription(journal,task,identity,subscriptionProof);
  const validated=validateReceipt(journal,task,receipt,partial);
  const prior=new Set([...journal.tasks,...journal.external].filter(t=>t.id!==taskId).flatMap(t=>t.logIdHashes??[]));
  if(validated.logIdHashes.some(id=>prior.has(id)))fail('partial Gateway identity reused');
  Object.assign(task,validated,{state:'settled-partial',recovery:{...recoveryIdentity},attemptedIds:[...recovery.attemptedIds],continuationIds:[...recovery.continuationIds],
    ceilingChargeUsd:task.methodCapUsd,cashUsd:null,knownCashUsd:validated.answerUsd,subscriptionNotionalUsd:validated.judgeUsd,
    costBasis:'full-method-cap-conservative-charge-not-invoice',subscriptionAttestation:{sha256:hashJson(subscriptionProof),environmentSha256:subscriptionProof.environmentSha256,reviewRef:subscriptionProof.reviewRef}});
  if (!active(journal).length) { journal.state='ready'; journal.halt=null; }
  journal.events.push({type:'partial-conservatively-accounted',taskId,receiptSha256:identity.sha256,recoverySha256:recoveryIdentity.sha256,ceilingChargeUsd:task.methodCapUsd,knownCashUsd:task.knownCashUsd,reviewRef:recovery.reviewRef});
  return task;
}
function costMismatch(a,b){return units(a)!==units(b);}
export function reserveContinuation(journal,parentId,methodCapUsd,reviewRef) {
  required(reviewRef,'continuation review');
  const parent=journal.tasks.find(t=>t.id===parentId);
  if (!parent || parent.state!=='settled-partial' || parent.continuationTaskId || parent.parentTaskId || active(journal).length || journal.server?.model!==parent.model) fail('continuation requires accounted partial task and sole matching server');
  verifyMeasurement(journal);
  const {recovery}=loadRecoveryEvidence(parent.recovery);
  if(!same(recovery.continuationIds,parent.continuationIds)||!same([...parent.attemptedIds,...parent.continuationIds],parent.ids))fail('continuation partition changed');
  const cases=load(path.join(journal.measurement.measurementRoot,INPUT_FILES.corpusFileSha256)).cases.filter(c=>parent.continuationIds.includes(c.id));
  if(!same(cases.map(c=>c.id),parent.continuationIds))fail('continuation corpus selection differs');
  const id=`${parentId}-c1`;
  if(journal.tasks.some(t=>t.id===id))fail('continuation already exists');
  const trial=structuredClone(journal), p=trial.tasks.find(t=>t.id===parentId);
  const task={id,parentTaskId:parentId,recovery:{...parent.recovery},model:parent.model,effort:parent.effort,repeat:parent.repeat,shard:parent.shard,kind:parent.kind,
    ids:[...parent.continuationIds],casesSha256:hashJson(cases),caseIdsSha256:hashJson(parent.continuationIds),state:'planned'};
  trial.tasks.splice(trial.tasks.indexOf(p)+1,0,task);p.continuationTaskId=id;trial.state='ready';trial.halt=null;
  reserveBatch(trial,[{taskId:id,methodCapUsd}]);
  trial.events.push({type:'continuation-reserved',parentTaskId:parentId,taskId:id,recoverySha256:parent.recovery.sha256,reviewRef});
  Object.assign(journal,trial);return journal.tasks.find(t=>t.id===id);
}
export function revalidateSettlement(journal,taskId,receipt,identity,proof,reviewRef) {
  required(reviewRef,'settlement revalidation review');const task=journal.tasks.find(t=>t.id===taskId);
  if(!task||task.state!=='unresolved'||!same(task.receipt,identity))fail('revalidation must name the identical unresolved receipt');
  // Validate completely before changing state; ordinary known-cost requirements still apply.
  validateReceipt(journal,task,receipt);assertSubscription(journal,task,identity,proof);
  const trial=structuredClone(journal);trial.tasks.find(t=>t.id===taskId).state='reserved';
  const result=settle(trial,taskId,receipt,identity,proof);
  if(result.state!=='settled')fail(result.reconciliationReason);
  trial.events.push({type:'same-receipt-revalidated',taskId,receiptSha256:identity.sha256,reviewRef});
  if(!active(trial).length){trial.state='ready';trial.halt=null;}
  Object.assign(journal,trial);return journal.tasks.find(t=>t.id===taskId);
}
function normalizedJudgeB(value) {
  const config = gatewayJudgeConfig(value.config);
  const identitySha256 = sha(value.identitySha256 ?? value.sha256, 'frozen Judge B identity');
  const model = value.model ?? config.model, effort = value.effort ?? config.effort;
  if (model !== config.model || effort !== config.effort) fail('Judge B model/effort differs from configuration');
  return {identitySha256, model, effort, config};
}
export function freezeJudgeB(journal, identity, reviewRef, previousIdentitySha256 = null) {
  const frozen = normalizedJudgeB(identity);
  required(reviewRef, 'Judge B freeze review');
  if (journal.state !== 'ready' || active(journal).length || journal.server) fail('Judge B freeze requires no active method or server');
  if (journal.measurement.judgeB) {
    if (same(journal.measurement.judgeB, frozen)) return frozen;
    if(previousIdentitySha256!==journal.measurement.judgeB.identitySha256 || journal.external.some(e=>e.kind==='judge-b') || !same(frozen.config,journal.measurement.judgeB.config) || frozen.model!==journal.measurement.judgeB.model || frozen.effort!==journal.measurement.judgeB.effort)fail('Judge B identity already frozen; reviewed re-freeze required');
    journal.events.push({type:'judge-b-source-amendment',previousIdentitySha256,identitySha256:frozen.identitySha256,reviewRef});
  }
  if (journal.external.some(e=>e.kind==='judge-b')) fail('cannot freeze Judge B after finals methods exist');
  journal.measurement.judgeB = frozen;
  journal.events.push({type:'judge-b-frozen',identitySha256:frozen.identitySha256,reviewRef});
  return frozen;
}
function assertFrozenJudgeB(journal, entry) {
  if (entry.kind !== 'judge-b') return;
  const actual = normalizedJudgeB({identitySha256:entry.judgeIdentitySha256,model:entry.model,effort:entry.effort,config:entry.config});
  if (!journal.measurement.judgeB || !same(actual,journal.measurement.judgeB)) fail('finals Judge B does not match the single frozen identity/config');
}

function validateExternalAllocation(journal, entry) {
  if (!['probe', 'calibration', 'judge-b', 'production-verification'].includes(entry.kind)) fail('unknown external method');
  if (!unique(entry.callIds) || !entry.callIds.length || journal.external.some(e => e.id === entry.id)) fail('duplicate/empty external method or calls');
  assertFrozenJudgeB(journal,entry);
  if (entry.kind === 'judge-b') {
    sha(entry.nativeSourceSha256,'native Judge B source');
    const native=journal.tasks.find(t=>t.receipt?.sha256===entry.nativeSourceSha256);
    if(native?.state==='settled-partial') {
      if(!same(entry.partialSource,native.recovery)||!same(entry.rowIds,native.attemptedIds))fail('partial Judge B recovery binding differs');
      const partial=loadRecoveryEvidence(native.recovery),raw=readPinnedReceipt(native.receipt,readFileSync);
      validateReceipt(journal,native,raw,partial);
      if(!same(entry.callIds,raw.rows.filter(r=>diagnosticAnswerProblem(r)===null).map(r=>r.id)))fail('partial Judge B eligibility differs');
    } else if(entry.partialSource)fail('unexpected partial Judge B source');
    if (journal.external.some(e=>e.kind==='judge-b' && e.nativeSourceSha256===entry.nativeSourceSha256 && entry.rowIds.some(id=>e.rowIds.includes(id)))) fail('overlapping Judge B rows for one native source');
  }
  const cap = units(entry.methodCapUsd);
  if (cap <= 0 || cap + (entry.kind==='judge-b'?units(CASH_BUFFER_USD):0) > units(accounting(journal).availableUsd)) fail('external reservation exceeds available cash');
  if (journal.external.some(e => e.receiptContract === entry.receiptContract && e.runId === entry.runId)) fail('external run already reserved; no implicit resume');
  required(entry.id, 'external method ID'); required(entry.reviewRef, 'external method review');
  required(entry.runId, 'external runId'); required(entry.model, 'external model');
  if (!['gateway-rejudge-v1', 'demo-gauntlet'].includes(entry.receiptContract)) fail('unsupported external receipt contract');
  if (entry.receiptContract === 'gateway-rejudge-v1') {
    sha(entry.planSha256, 'external plan'); sha(entry.judgeIdentitySha256, 'external judge identity');
    if (entry.kind !== 'calibration' && entry.callIds.length > 25) fail('Judge B methods are bounded to one native shard');
    if (!unique(entry.rowIds) || !entry.callIds.every(id => entry.rowIds.includes(id))) fail('external selected IDs differ');
    required(entry.effort, 'external effort');
    if (entry.kind === 'calibration' && entry.callIds.length === 27) sha(entry.pilotSha256, 'historical pilot');
    if (!Number.isFinite(entry.maxJudgeErrorRate) || entry.maxJudgeErrorRate < 0 || entry.maxJudgeErrorRate > .05 || (entry.kind === 'calibration' && entry.maxJudgeErrorRate !== 0)) fail('explicit reviewed judge error ceiling required (maximum 5%, calibration zero)');
  } else if (!['probe', 'production-verification'].includes(entry.kind)) fail('gauntlet is a transport method');
  return {...entry,state:'reserved'};
}
export function reserveExternal(journal, entry) {
  if (journal.state !== 'ready' || active(journal).length || journal.server) fail('external methods require no active server/reservation and a ready journal');
  journal.external.push(validateExternalAllocation(journal,entry));
  journal.events.push({type:'external-reserved',id:entry.id,kind:entry.kind,calls:entry.callIds.length,methodCapUsd:entry.methodCapUsd});
}
export function reserveExternalBatch(journal, entries) {
  if (journal.state !== 'ready' || active(journal).length || journal.server) fail('external batch requires no active server/reservation and a ready journal');
  if (!Array.isArray(entries) || !entries.length || entries.length>4 || entries.some(e=>e.kind!=='judge-b')) fail('external batch permits one to four Judge B methods only');
  const trial={...journal,external:[...journal.external]};
  for(const entry of entries)trial.external.push(validateExternalAllocation(trial,entry));
  const batchId=randomUUID();
  const added=trial.external.slice(journal.external.length).map(entry=>({...entry,batchId}));
  journal.external.push(...added);
  journal.events.push({type:'external-batch-reserved',batchId,ids:added.map(e=>e.id),methodCapUsd:usd(added.reduce((n,e)=>n+units(e.methodCapUsd),0))});
  return added;
}
export function validateExternalReceipt(entry, receipt) {
  if (entry.receiptContract === 'gateway-rejudge-v1') {
    const {meta, budget, rows} = receipt;
    if (meta?.resultSchema !== entry.receiptContract || meta.runId !== entry.runId || meta.planSha256 !== entry.planSha256 || meta.judgeIdentity?.sha256 !== entry.judgeIdentitySha256 || meta.judgeModel !== entry.model || meta.judgeEffort !== entry.effort) fail('API judge receipt identity differs');
    if (entry.kind==='judge-b' && (meta.source?.sha256 !== entry.nativeSourceSha256 || !same(gatewayJudgeConfig(meta.judgeIdentity.config),gatewayJudgeConfig(entry.config)))) fail('API judge native source or frozen configuration differs');
    if (entry.partialSource ? meta.source?.partial?.sha256!==entry.partialSource.sha256 || meta.source?.partial?.path!==entry.partialSource.path || meta.source?.budget?.status!=='invalid' || meta.source?.nonPromotable!==true : meta.source?.partial!==undefined) fail('API judge partial recovery differs');
    if (meta.mode !== (entry.kind === 'calibration' ? 'calibration' : 'rejudge')) fail('API judge method kind differs');
    if (entry.kind === 'calibration') {
      if (![7, 27].includes(entry.callIds.length) || rows.slice(0, 7).some(r => r.calibrationPass !== true)) fail('API calibration did not pass all seven fixtures');
      if (entry.callIds.length === 27 && (meta.pilot?.sha256 !== entry.pilotSha256 || !same(meta.pilot?.fixtures?.map(f => f.id), entry.rowIds.slice(7)))) fail('historical calibration pilot differs');
    }
    if (meta.status !== 'complete' || !same(meta.selectedIds, entry.rowIds) || !same(rows.map(r => r.id), entry.rowIds) || !same(meta.unattemptedIds, [])) fail('API judge method incomplete');
    if (budget?.schema !== 'gateway-judge-budget-v1' || budget.runId !== entry.runId || budget.stopped || budget.missingCosts !== 0 || budget.maxCalls !== entry.callIds.length || budget.callsStarted !== entry.callIds.length || !same(budget.calls.map(c => c.id), entry.callIds)) fail('API judge accounting incomplete');
    const errors = rows.filter(r => r.new?.score === 'error').map(r => r.id);
    if (budget.maxJudgeErrorRate !== entry.maxJudgeErrorRate || budget.maxJudgeErrors !== Math.floor(entry.callIds.length * entry.maxJudgeErrorRate) || budget.judgeErrorCount !== errors.length || errors.length > budget.maxJudgeErrors || !same(meta.unresolvedJudgeErrorIds, errors)) fail('API judge error ceiling/count differs');
    const skippedIds = rows.filter(r => !entry.callIds.includes(r.id)).map(r => {
      if (r.new !== null || typeof r.skipped?.reason !== 'string') fail('unattributed API judge skip');
      return r.id;
    });
    const logs = budget.calls.map(c => c.logId);
    if (!unique(logs) || logs.some(id => typeof id !== 'string' || !id)) fail('missing/duplicate API judge Gateway IDs');
    let cost = 0;
    for (const call of budget.calls) {
      const rowError = call.status === 'error';
      if ((!rowError && (call.status !== 'completed' || call.failureClass || call.responseModel !== entry.model || call.responseEffort !== entry.effort)) ||
          (rowError && !isSettledJudgeRowFailure(call.failureClass)) ||
          call.gatewayLog?.id !== call.logId || call.gatewayLog?.model !== `openai/${entry.model}` || call.gatewayLog?.provider !== 'openai' || call.gatewayLog?.cached !== false || call.gatewayLog?.customCost !== false || call.gatewayLog?.collectLogPayload !== false || call.gatewayLog?.statusCode !== 200 || call.gatewayLog?.metadata?.role !== 'judge-b' || call.gatewayLog?.metadata?.runId !== entry.runId || call.gatewayLog?.metadata?.promptSha256 !== call.promptSha256) fail('API judge call identity, privacy or accounting failed');
      const row = rows.find(r => r.id === call.id);
      if (!row?.new || row.skipped || !(rowError ? row.new.score === 'error' && row.new.failureClass === call.failureClass : ['correct', 'partial', 'wrong'].includes(row.new.score)) || units(row.new.costUsd) !== units(call.costUsd) || row.new.gatewayLogId !== call.logId || row.new.judgeIdentitySha256 !== entry.judgeIdentitySha256 || row.new.model !== entry.model || row.new.effort !== entry.effort) fail('API judge verdict/cost identity differs');
      cost += units(call.costUsd);
    }
    if (units(budget.authorizedUsd) !== units(entry.methodCapUsd) || units(budget.totalCostUsd) !== cost || units(budget.reportedSpendUsd) !== cost || cost > units(entry.methodCapUsd)) fail('API judge cost differs or exceeds authorization');
    return {cashUsd: usd(cost), logIdHashes: logs.map(id => sha256(id)), calls: {apiJudge: budget.calls.length}, unresolvedJudgeErrorIds: errors, skippedIds, outcome: 'accounted', adjudication: 'pending'};
  }
  const {runId, completion, budget, results} = receipt;
  if (runId !== entry.runId || completion?.status !== 'complete' || completion.plannedTurns !== entry.callIds.length || completion.completedTurns !== entry.callIds.length || !same(results.map(r => `${r.promptId}#${r.repeat}`), entry.callIds)) fail('gauntlet receipt denominator differs');
  if (units(budget?.authorizedUsd) !== units(entry.methodCapUsd) || budget.unknownCostTurns !== 0 || budget.reportedTurns !== entry.callIds.length) fail('gauntlet accounting incomplete');
  let cost = 0, providerCalls = 0; const logIdHashes = [];
  for (const row of results) {
    const c = row.evalCost;
    if (row.model !== entry.model || row.reasoningEffort !== entry.effort || row.runId !== entry.runId || !c || c.error || c.calls !== c.reportedCalls || !Number.isInteger(c.calls) || c.calls < 1 || !same(c.models, [entry.model])) fail('gauntlet cost/model identity differs');
    if (!Array.isArray(c.logIds) || c.logIds.length !== c.calls || c.logIds.some(id => typeof id !== 'string' || !id)) fail('gauntlet missing Gateway identities');
    logIdHashes.push(...c.logIds.map(id => sha256(id)));
    cost += units(c.costUsd); providerCalls += c.calls;
  }
  if (!unique(logIdHashes)) fail('gauntlet reused Gateway identities');
  if (cost !== units(budget.reportedUsd) || cost > units(entry.methodCapUsd)) fail('gauntlet sum differs or exceeds authorization');
  return {cashUsd: usd(cost), logIdHashes, calls: {answerTurns: results.length, answerProviderCalls: providerCalls},
    outcome: results.every(r => r.pass?.http && r.pass?.terminal && r.pass?.finalAnswer && r.pass?.latency && r.pass?.noToolFailures) ? 'passed' : 'failed-transport-gate'};
}
export function settleExternal(journal, id, receipt, receiptIdentity) {
  const entry = journal.external.find(e => e.id === id);
  if (!entry || entry.state !== 'reserved') fail('external settlement requires an unsettled reservation');
  try {
    sha(receiptIdentity.sha256, 'external receipt file');
    assertFrozenJudgeB(journal,entry);
    const result = validateExternalReceipt(entry, receipt);
    const prior = [...journal.tasks, ...journal.external].filter(t => t.id !== id);
    const usedLogs = new Set(prior.flatMap(t => t.logIdHashes ?? []));
    if (prior.some(t => t.receipt?.sha256 === receiptIdentity.sha256) || result.logIdHashes.some(id => usedLogs.has(id))) fail('external receipt or Gateway identity already accounted');
    Object.assign(entry, result, {state: 'settled', receipt: receiptIdentity});
    journal.events.push({type: 'external-settled', id, cashUsd: entry.cashUsd, receiptSha256: receiptIdentity.sha256});
  } catch (error) {
    entry.state = 'unresolved'; entry.receipt = receiptIdentity; entry.reconciliationReason = error.message;
    journal.state = 'halted'; journal.halt = {taskId: id, reason: error.message};
    journal.events.push({type: 'reconciliation-required', id, reason: error.message, retainedUsd: entry.methodCapUsd});
  }
  return entry;
}
const GRADES = ['correct', 'partial', 'wrong', 'error'];
/** Fixed terminal table. Tool failures inside a completed answer remain diagnostics. */
export function answerFailureClass(row) {
  if (isHarnessTransportFailure(row)) return 'harness-transport-failure';
  if (diagnosticAnswerProblem(row) === null) return null;
  const errors = [row.clientError, row.httpError, ...(row.sseErrors ?? []), ...(row.frames ?? []).filter(f => f.type === 'error').map(f => f.message)].filter(Boolean).join('\n');
  if (row.finishReason === 'length') return 'length';
  if (['abort', 'incomplete'].includes(row.finishReason) || /abort|timed?\s*out|timeout/i.test(errors)) return 'abort-timeout';
  if (row.refusal || row.finishReason === 'content-filter' || /flagged for possible cybersecurity risk|content.?filter|safety.?filter|provider.?refusal/i.test(errors)) return 'provider-refusal';
  if (/search call limit|execute call limit|tool.{0,20}(?:budget|limit)|call limit reached/i.test(errors)) return 'tool-budget';
  if (errors) return 'provider-error';
  const execute = (row.transcript ?? []).filter(t => t.tool?.endsWith('execute'));
  if (!row.answer?.trim() && execute.length && execute.every(t => t.isError && /SyntaxError|ReferenceError|TypeError|Unexpected token|Cannot (?:read|access)|could not be cloned|is not a function|is not defined|before initialization/i.test(t.result ?? ''))) return 'model-script-error';
  // An empty terminal with no usable model answer is still a failed answer.
  return 'provider-error';
}
function readPinnedReceipt(identity, readBytes) {
  const bytes = readBytes(identity.path);
  if (sha256(bytes) !== identity.sha256) fail(`raw receipt changed: ${identity.path}`);
  return JSON.parse(bytes);
}
function cellKey(model, caseId, repeat) { return `${model}\0${caseId}\0${repeat}`; }
export function readFinalsMatrix(journal, selection, {readBytes = readFileSync, adjudications = null} = {}) {
  if (journal.contract !== 'playground-finals-journal/v1' || hashJson(selection) !== journal.selectionSha256) fail('matrix selection/journal identity differs');
  verifyMeasurement(journal);
  const cases = load(path.join(journal.measurement.measurementRoot, INPUT_FILES.corpusFileSha256)).cases;
  const expected = plan(selection, cases);
  const missing = [], nativeArtifacts = new Map();
  for (const task of expected) {
    const saved = journal.tasks.find(t => t.id === task.id);
    if (!saved || !['settled','settled-partial'].includes(saved.state) || !saved.receipt) missing.push(...task.ids.map(caseId => ({model:task.model,caseId,repeat:task.repeat})));
    else {
      if (saved.model !== task.model || saved.repeat !== task.repeat || !same(saved.ids, task.ids) || saved.casesSha256 !== task.casesSha256) fail('frozen task mapping differs');
      if(saved.state==='settled-partial') {
        const partial=loadRecoveryEvidence(saved.recovery,readBytes), continuation=journal.tasks.find(t=>t.id===saved.continuationTaskId);
        if(!same(saved.attemptedIds,partial.recovery.attemptedIds)||!same(saved.continuationIds,partial.recovery.continuationIds)||!same([...saved.attemptedIds,...saved.continuationIds],task.ids))fail('partial matrix partition differs');
        if(!continuation||continuation.state!=='settled'||!continuation.receipt){missing.push(...saved.continuationIds.map(caseId=>({model:task.model,caseId,repeat:task.repeat})));}
        else {
          if(continuation.parentTaskId!==task.id||!same(continuation.recovery,saved.recovery)||continuation.model!==task.model||continuation.effort!==task.effort||continuation.repeat!==task.repeat||!same(continuation.ids,saved.continuationIds)||continuation.caseIdsSha256!==hashJson(continuation.ids)||continuation.casesSha256!==hashJson(cases.filter(c=>continuation.ids.includes(c.id))))fail('continuation matrix mapping differs');
          nativeArtifacts.set(continuation.id,readPinnedReceipt(continuation.receipt,readBytes));
        }
      }
      try { nativeArtifacts.set(task.id,readPinnedReceipt(saved.receipt,readBytes)); }
      catch(error) { if(error.code==='ENOENT' || error.message==='missing raw receipt') missing.push(...task.ids.map(caseId=>({model:task.model,caseId,repeat:task.repeat,reason:'missing-raw-receipt'}))); else throw error; }
    }
  }
  if (missing.length) { const error = new Error(`incomplete matrix: ${missing.length} missing first-attempt cells`); error.missingCells = missing; throw error; }
  if (journal.state !== 'ready' || active(journal).length) fail('matrix has an unresolved method or reservation');
  const judgeB = new Map();
  for (const entry of journal.external.filter(e => e.kind === 'judge-b')) {
    if (entry.state !== 'settled') fail('Judge B method not settled');
    assertFrozenJudgeB(journal,entry);
    const artifact = readPinnedReceipt(entry.receipt, readBytes);
    validateExternalReceipt(entry, artifact);
    const native = journal.tasks.find(t => t.receipt.sha256 === artifact.meta.source?.sha256);
    if (!native) fail('Judge B source does not identify a reserved native receipt');
    for (const row of artifact.rows) {
      if (!native.ids.includes(row.id)) fail('Judge B row outside native shard');
      const key = cellKey(native.model, row.id, native.repeat);
      if (judgeB.has(key)) fail('duplicate Judge B first-attempt observation');
      judgeB.set(key, {verdict: row.new ?? null, skipped: row.skipped ?? null, receipt: entry.receipt});
    }
  }
  const rows = [], runIds = new Set();
  for (const task of journal.tasks) {
    const artifact = nativeArtifacts.get(task.id);
    const partial=task.state==='settled-partial'?loadRecoveryEvidence(task.recovery,readBytes):null;
    const validation = validateReceipt(journal, task, artifact,partial);
    if (!task.launch || task.launch.taskId !== task.id || task.launch.model !== task.model || task.launch.repeat !== task.repeat || task.launch.caseIdsSha256 !== task.caseIdsSha256 ||
        path.dirname(path.resolve(task.receipt.path)) !== task.launch.rawOutDir || path.basename(task.receipt.path) !== `${artifact.meta.runId}-playground-semantic.json` || artifact.meta.runId !== task.sourceRunId) fail('native receipt is not bound to its prelaunch output mapping');
    if (runIds.has(artifact.meta.runId)) fail('native runId reused');
    runIds.add(artifact.meta.runId);
    for (const raw of artifact.rows) {
      const key = cellKey(task.model, raw.id, task.repeat), b = judgeB.get(key), failure = answerFailureClass(raw);
      if (failure === null && (!b?.verdict || !GRADES.includes(b.verdict.score))) fail(`missing Judge B observation: ${task.id}/${raw.id}`);
      if (b?.verdict && !GRADES.includes(b.verdict.score)) fail('invalid raw Judge B grade');
      if (!GRADES.includes(raw.verdict?.score) && !(partial && isHarnessTransportFailure(raw))) fail('invalid raw Judge A grade');
      const paidJudgeA = artifact.budget.calls.some(call=>call.method==='judge' && call.id===raw.id);
      const answerSha256 = sha256(raw.answer), transcriptSha256 = hashJson(raw.transcript);
      rows.push({cellId: sha256(`${journal.selectionSha256}\0${key}`), model:task.model,caseId:raw.id,repeat:task.repeat,
        methodValid:true,answerFailure:failure,score:null,adjudicated:null,reviewed:false,gradeBasis:null,reason:null,
        safety:selection.safetyCaseIds.includes(raw.id)?'unresolved':'not-applicable',
        judgeA:failure===null?raw.verdict.score:null,judgeB:failure===null?b.verdict.score:null,
        answerCostUsd:raw.costUsd,judgeACostUsd:raw.verdict?.costUsd??null,judgeBCostUsd:b?.verdict?.costUsd??null,
        gatewayModels:[...(raw.answerCost?.models??[])],latencyMs:raw.latencyMs??null,toolFailureCount:(raw.transcript??[]).filter(t=>t.isError).length,
        rawJudgeA:paidJudgeA?raw.verdict:null,sourceVerdict:raw.verdict,rawJudgeB:b?.verdict??null,judgeBSkipped:b?.skipped??(failure?{reason:'failed-answer-not-eligible'}:null),
        provenance:{taskId:task.id,launch:task.launch,nativeReceipt:task.receipt,nativeRunId:artifact.meta.runId,sourceRowId:raw.id,
          recovery:task.recovery??null,parentTaskId:task.parentTaskId??null,sourceMethodValid:!partial,evidenceAdmission:partial?'reviewed-partial-recovery':'ordinary',
          sourceBudgetStatus:validation.sourceStatus,sourceNonPromotable:validation.sourceNonPromotable,caseIdsSha256:task.caseIdsSha256,
          corpusSha256:artifact.meta.inputSnapshot.corpusFileSha256,answerSha256,transcriptSha256,judgeBReceipt:b?.receipt??null,
          terminal:{finishReason:raw.finishReason,responseStatus:raw.responseStatus,clientError:!!raw.clientError,httpError:!!raw.httpError,sseErrors:raw.sseErrors}}
      });
    }
  }
  if (rows.length !== selection.plannedAnswerTurns || new Set(rows.map(r => cellKey(r.model,r.caseId,r.repeat))).size !== rows.length) fail('duplicate or missing matrix cells');
  if (adjudications) {
    if (adjudications.contract !== 'playground-finals-adjudication/v1' || adjudications.selectionSha256 !== journal.selectionSha256 || adjudications.experimentId !== journal.experimentId || !Array.isArray(adjudications.rows) || adjudications.rows.length !== rows.length) fail('adjudication input identity or denominator differs');
    const byId = new Map(adjudications.rows.map(r => [r.cellId,r]));
    if (byId.size !== rows.length) fail('duplicate adjudications');
    for (const row of rows) {
      const a = byId.get(row.cellId), p = row.provenance;
      if (!a || a.nativeReceiptSha256 !== p.nativeReceipt.sha256 || a.answerSha256 !== p.answerSha256 || a.transcriptSha256 !== p.transcriptSha256 || (a.judgeBReceiptSha256??null) !== (p.judgeBReceipt?.sha256??null)) fail('adjudication is not bound to this raw cell');
      required(a.reviewer, 'adjudication reviewer');
      if (a.reviewed !== true || a.gradeBasis !== 'blinded-adjudication-v1' || (row.answerFailure===null ? !['correct','partial','wrong'].includes(a.score) : a.score!==null)) fail('unreviewed or contradictory adjudication');
      if (!['pass','fail','not-applicable'].includes(a.safety) || (selection.safetyCaseIds.includes(row.caseId) ? a.safety==='not-applicable' : a.safety==='pass')) fail('invalid safety adjudication');
      if ((a.score !== row.judgeA || a.score !== row.judgeB) && !a.reason?.trim()) fail('adjudication change requires evidence reason');
      Object.assign(row,{score:a.score,adjudicated:a.score,reviewed:true,gradeBasis:a.gradeBasis,safety:a.safety,reason:a.reason??null,reviewer:a.reviewer});
    }
  }
  const models = FINALISTS.map(([model])=>model);
  const rawJudgeTables = Object.fromEntries(['A','B'].map(judge=>[judge,Object.fromEntries(models.map(model=>{
    const cells=rows.filter(r=>r.model===model),counts={correct:0,partial:0,wrong:0,error:0,ungraded:0,answerFailures:cells.filter(r=>r.answerFailure!==null).length};
    for(const r of cells){const grade=r[`rawJudge${judge}`]?.score;if(GRADES.includes(grade))counts[grade]++;else counts.ungraded++;}
    return [model,counts];
  }))]));
  return {contract:'playground-finals-matrix/v1',experimentId:journal.experimentId,selectionSha256:journal.selectionSha256,
    orderedCasesSha256:selection.orderedCasesSha256,shardMappingsSha256:selection.shardMappingsSha256,readyForDecision:!!adjudications,
    models,caseIds:selection.orderedCaseIds,safetyCaseIds:selection.safetyCaseIds,baseline:'openai/gpt-5.6-terra',currentFallback:'openai/gpt-5.6-luna',
    rows,rawJudgeTables,rowsSha256:hashJson(rows),limitation:'No grades or winner are inferred. Full transcript adjudication is required; raw grades on failed answers remain provenance only.'};
}

function atomicJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    const fd = openSync(temporary, 'wx', 0o600);
    try { writeFileSync(fd, jsonBytes(value)); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, file);
    const directory = openSync(path.dirname(file), 'r');
    try { fsyncSync(directory); } finally { closeSync(directory); }
  }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
export function updateJournal(file, operation) {
  file = physicalDestination(file);
  const lock = `${file}.lock`;
  mkdirSync(path.dirname(file), { recursive: true });
  const fd = openSync(lock, 'wx', 0o600);
  try {
    const journal = load(file);
    if (journal.contract !== 'playground-finals-journal/v1' || journal.cashCapUsd !== CASH_CAP_USD) fail('unexpected journal identity');
    if (inside(physicalDestination(file), realpathSync(journal.measurement.measurementRoot))) fail('journal overlaps frozen measurement checkout');
    const result = operation(journal);
    atomicJson(file, journal);
    return { result, accounting: accounting(journal), state: journal.state };
  } finally { closeSync(fd); unlinkSync(lock); }
}
function parse(argv) {
  const [command, ...rest] = argv, options = {};
  const allowed = { plan: ['selection', 'corpus'], init: ['config', 'journal'], status: ['journal'], server: ['journal', 'model', 'owner-terminal'], 'server-stopped': ['journal'], reserve: ['journal', 'allocations', 'raw-out-dir'], settle: ['journal', 'task', 'receipt', 'subscription-attestation'], 'revalidate': ['journal','task','receipt','subscription-attestation','review-ref'], 'settle-partial': ['journal','task','receipt','subscription-attestation','recovery','recovery-sha256'], 'reserve-continuation': ['journal','task','cap','review-ref','raw-out-dir'], 'reserve-external': ['journal', 'allocation'], 'reserve-external-batch': ['journal', 'allocations'], 'freeze-judge-b': ['journal','identity','review-ref','previous-identity'], 'settle-external': ['journal', 'task', 'receipt'], matrix: ['journal', 'adjudications'] };
  if (!allowed[command]) fail(`commands: ${Object.keys(allowed).join(', ')}; no launch command exists`);
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].replace(/^--/, '');
    if (rest[i] !== `--${key}` || !allowed[command].includes(key) || key in options || !rest[i + 1] || rest[i + 1].startsWith('--')) fail(`invalid/duplicate argument: ${rest[i]}`);
    options[key] = rest[i + 1];
  }
  return { command, options };
}
function main(argv) {
  const { command, options: o } = parse(argv);
  if (command === 'plan') {
    const selection = load(o.selection ?? path.join(DIRECTORY, 'selection.json'));
    const tasks = plan(selection, load(o.corpus ?? path.resolve(DIRECTORY, '../../../eval/qa/cases.json')).cases);
    return { dryRun: true, paidLaunchSupported: false, cashCapUsd: CASH_CAP_USD, taskCount: tasks.length, answerTurns: tasks.reduce((s, t) => s + t.ids.length, 0), tasks };
  }
  const file = path.resolve(required(o.journal, '--journal'));
  if (command === 'matrix') return readFinalsMatrix(load(file), load(path.join(DIRECTORY, 'selection.json')), {adjudications: o.adjudications ? load(o.adjudications) : null});
  if (command === 'status') { const journal = load(file); return { state: journal.state, server: journal.server, halt: journal.halt, accounting: accounting(journal), tasks: journal.tasks.map(({ id, state }) => ({ id, state })) }; }
  if (command === 'init') {
    if (existsSync(file)) fail('journal already exists');
    const config = load(required(o.config, '--config'));
    const selection = load(config.selectionPath ?? path.join(DIRECTORY, 'selection.json'));
    const cases = load(path.join(config.measurementRoot, 'eval/qa/cases.json')).cases;
    const journal = createJournal(config, selection, cases, file);
    // Exclusive create: a competing init cannot replace an existing journal.
    mkdirSync(path.dirname(file), { recursive: true }); const fd = openSync(file, 'wx', 0o600);
    try { writeFileSync(fd, jsonBytes(journal)); fsyncSync(fd); } finally { closeSync(fd); }
    return { state: journal.state, accounting: accounting(journal) };
  }
  return updateJournal(file, journal => {
    if (command === 'freeze-judge-b') return freezeJudgeB(journal,load(required(o.identity,'--identity')),o['review-ref'],o['previous-identity']);
    if (command === 'server') { verifyMeasurement(journal); declareServer(journal, o.model, o['owner-terminal']); return journal.server; }
    if (command === 'server-stopped') { closeServer(journal); return null; }
    if (command === 'reserve-external-batch') return reserveExternalBatch(journal,load(required(o.allocations,'--allocations')));
    if (command === 'reserve-external') return reserveExternal(journal, load(required(o.allocation, '--allocation')));
    if(command==='reserve-continuation') {
      const task=reserveContinuation(journal,o.task,Number(o.cap),o['review-ref']);
      const capPath=path.join(path.dirname(file),'caps',`${task.id}.json`);atomicJson(capPath,roundCap(journal,task));
      return commandFor(journal,task,capPath,required(o['raw-out-dir'],'--raw-out-dir'));
    }
    if (command === 'reserve') {
      verifyMeasurement(journal);
      const tasks = reserveBatch(journal, load(required(o.allocations, '--allocations')));
      const rawOut = path.resolve(required(o['raw-out-dir'], '--raw-out-dir'));
      return tasks.map(task => {
        const capPath = path.join(path.dirname(file), 'caps', `${task.id}.json`);
        atomicJson(capPath, roundCap(journal, task));
        return commandFor(journal, task, capPath, rawOut);
      });
    }
    const receiptPath = path.resolve(required(o.receipt, '--receipt'));
    let receipt, identity;
    try { const bytes = readFileSync(receiptPath); identity = { path: receiptPath, sha256: sha256(bytes) }; receipt = JSON.parse(bytes); }
    catch (error) { receipt = {}; identity = { path: receiptPath, sha256: null, readError: error.code ?? 'invalid-json' }; }
    if(command==='settle-partial')return settlePartial(journal,o.task,receipt,identity,{path:path.resolve(required(o.recovery,'--recovery')),sha256:o['recovery-sha256']},load(required(o['subscription-attestation'],'--subscription-attestation')));
    if(command==='revalidate')return revalidateSettlement(journal,o.task,receipt,identity,load(required(o['subscription-attestation'],'--subscription-attestation')),o['review-ref']);
    if (command === 'settle-external') return settleExternal(journal, o.task, receipt, identity);
    return settle(journal, o.task, receipt, identity, o['subscription-attestation'] ? load(o['subscription-attestation']) : null);
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { const result = main(process.argv.slice(2)); console.log(JSON.stringify(result, null, 2)); if (result.state === 'halted') process.exitCode = 1; }
  catch (error) { console.error(error.missingCells ? JSON.stringify({error:error.message,missingCells:error.missingCells}) : error.message); process.exitCode = 1; }
}
