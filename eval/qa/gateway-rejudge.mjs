#!/usr/bin/env node
/** Explicitly authorized API second judge; Claude's ordinary runner is unchanged. */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync, realpathSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { createGatewayJudge, gatewayJudgeConfig, gatewayJudgeIdentity, GATEWAY_JUDGE_TRANSPORT } from "./gateway-judge.mjs";
import { buildJudgePrompt, buildTranscriptEvidence, judgeSelfTestFixture, JUDGE_SELF_TEST_CANDIDATE_COUNT, JUDGE_RUBRIC } from "./judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";
import { diagnosticRejudgeSource, diagnosticAnswerProblem, partialRecoverySource } from "./diagnostic-rejudge-source.mjs";
import { verifySourceCases, resolveCasesRef, goldenTimeConsistency, verdictAgreement } from "./re-judge.mjs";
import { PLAYGROUND_ARTIFACT_CONTRACT, assertCurrentPlaygroundContract, assertNotPlaygroundQuarantine, assertPlaygroundArtifactMeta } from "../playground/artifact-contract.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const shaPattern = /^[a-f0-9]{64}$/;

/** Authorization names raw file bytes, including formatting, before parsing or loading credentials. */
export function readGatewayJudgePlan(file, authorizedSha256 = null) {
  const bytes = readFileSync(file);
  const planSha256 = sha256(bytes);
  if (authorizedSha256 !== null && (!shaPattern.test(authorizedSha256) || planSha256 !== authorizedSha256)) throw new Error("authorized plan SHA-256 mismatch");
  return { plan: JSON.parse(bytes), planSha256 };
}

export function prepareGatewayRejudge(plan, { identityImpl = gatewayJudgeIdentity } = {}) {
  if (plan?.schema !== "gateway-judge-plan-v1" || !["calibration", "rejudge"].includes(plan.mode) || plan.allowNonIdentical !== true) throw new Error("explicit non-identical Gateway judge plan required");
  if (!isAbsolute(plan.out ?? "") || !/^[a-zA-Z0-9_-]{1,100}$/.test(plan.runId ?? "")) throw new Error("absolute new output path and runId required");
  const config = gatewayJudgeConfig(plan.config);
  const identity = identityImpl(config);
  if (!shaPattern.test(plan.identitySha256 ?? "") || identity.sha256 !== plan.identitySha256) throw new Error("Gateway judge identity does not match plan");
  if (!Number.isFinite(plan.maxBudgetUsd) || plan.maxBudgetUsd < config.callReserveUsd) throw new Error("finite positive total method budget required");
  if (!Number.isFinite(plan.maxJudgeErrorRate) || plan.maxJudgeErrorRate < 0 || plan.maxJudgeErrorRate > 1 ||
      (plan.mode === "calibration" && plan.maxJudgeErrorRate !== 0)) throw new Error("explicit judge error rate ceiling required; calibration requires zero");
  const auth = plan.auth;
  if (auth?.kind === "env") {
    if (!/^(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CF_AIG_TOKEN)$/.test(auth.variable ?? "")) throw new Error("unsupported Gateway token variable");
  } else if (auth?.kind === "wrangler") {
    if (!isAbsolute(auth.path ?? "") || !shaPattern.test(auth.sha256 ?? "") ||
        !/^[a-zA-Z0-9_-]{1,64}$/.test(auth.profile ?? "")) throw new Error("explicit pinned Wrangler path and profile required");
    if (sha256(readFileSync(realpathSync(auth.path))) !== auth.sha256) throw new Error("Wrangler auth executable pin mismatch");
  } else throw new Error("standard Cloudflare auth source required");

  let source = null;
  let pilot = null;
  let entries;
  if (plan.mode === "calibration") {
    if (plan.source !== undefined || plan.ids !== undefined) throw new Error("calibration uses exactly the seven registered fixtures");
    entries = Array.from({ length: JUDGE_SELF_TEST_CANDIDATE_COUNT }, (_, index) => {
      const fixture = judgeSelfTestFixture(index);
      return { id: fixture.label, input: fixture.input, expectation: { expect: fixture.expect, expectNot: fixture.expectNot }, original: null };
    });
    if (plan.pilot !== undefined) {
      if (!isAbsolute(plan.pilot?.path ?? "") || !shaPattern.test(plan.pilot?.sha256 ?? "")) throw new Error("pinned pilot fixture bundle required");
      const bytes = readFileSync(plan.pilot.path);
      if (sha256(bytes) !== plan.pilot.sha256) throw new Error("pilot fixture bundle SHA-256 mismatch");
      const bundle = JSON.parse(bytes);
      if (bundle.contract !== "historical-judge-pilot-inputs/v1" || typeof bundle.seed !== "string" || !bundle.seed ||
          !shaPattern.test(bundle.sourceSha256 ?? "") || !Array.isArray(bundle.inputs) || bundle.inputs.length !== 20) throw new Error("pilot requires exactly 20 seeded historical input fixtures");
      const seen = new Set(entries.map((entry) => entry.id));
      for (const fixture of bundle.inputs) {
        if (typeof fixture.id !== "string" || !fixture.id || seen.has(fixture.id) ||
            !shaPattern.test(fixture.promptSha256 ?? "") ||
            typeof fixture.input?.question !== "string" || typeof fixture.input?.golden?.answer !== "string" ||
            typeof fixture.input?.candidateAnswer !== "string" || !Array.isArray(fixture.input?.transcript)) throw new Error("invalid historical pilot fixture");
        seen.add(fixture.id);
        const prompt = buildJudgePrompt({ ...fixture.input, transcriptEvidence: typeof fixture.input.transcriptEvidence === "string" ? fixture.input.transcriptEvidence : buildTranscriptEvidence(fixture.input) });
        if (sha256(prompt) !== fixture.promptSha256) throw new Error("historical pilot prompt hash mismatch");
        entries.push({ id: fixture.id, input: fixture.input, original: fixture.historicalJudgeA ?? null });
      }
      pilot = { path: plan.pilot.path, sha256: plan.pilot.sha256, seed: bundle.seed,
        source: bundle.source, sourceSha256: bundle.sourceSha256, sourceRevision: bundle.sourceRevision,
        fixtures: bundle.inputs.map(({ id, promptSha256 }) => ({ id, promptSha256 })) };
    }
  } else {
    if (plan.pilot !== undefined) throw new Error("historical pilot fixtures are calibration-only");
    if (!isAbsolute(plan.source?.path ?? "") || !shaPattern.test(plan.source?.sha256 ?? "") ||
        !Array.isArray(plan.ids) || !plan.ids.length || plan.ids.some((id) => typeof id !== "string" || !id) || new Set(plan.ids).size !== plan.ids.length) throw new Error("pinned source and unique ordered IDs required");
    const bytes = readFileSync(plan.source.path);
    if (sha256(bytes) !== plan.source.sha256) throw new Error("source artifact SHA-256 mismatch");
    const result = JSON.parse(bytes);
    assertCurrentPlaygroundContract(result);
    if (result.meta?.artifactContract !== PLAYGROUND_ARTIFACT_CONTRACT) throw new Error("Gateway second judge requires current Playground source");
    let diagnostic = null, partial = null;
    if (plan.source.partial !== undefined) {
      if (plan.source.diagnostic !== true || !isAbsolute(plan.source.partial?.path ?? "") || !shaPattern.test(plan.source.partial?.sha256 ?? "")) throw new Error("explicit pinned partial recovery required");
      const recoveryBytes = readFileSync(plan.source.partial.path);
      if (sha256(recoveryBytes) !== plan.source.partial.sha256) throw new Error("partial recovery SHA mismatch");
      const recovery = JSON.parse(recoveryBytes), proofIdentity = recovery.gatewayProof;
      if (recovery.receipt?.path !== plan.source.path || !isAbsolute(proofIdentity?.path ?? "") || !shaPattern.test(proofIdentity?.sha256 ?? "")) throw new Error("partial source/proof identity differs");
      const proofBytes = readFileSync(proofIdentity.path);
      if (sha256(proofBytes) !== proofIdentity.sha256) throw new Error("partial Gateway proof changed");
      const proof = JSON.parse(proofBytes);
      if (proof.accountId !== config.accountId || proof.gatewayId !== config.gatewayId) throw new Error("partial Gateway proof account differs");
      diagnostic = partialRecoverySource(result, recovery, proof, plan.source.sha256);
      if (JSON.stringify(plan.ids) !== JSON.stringify(diagnostic.attemptedIds)) throw new Error("partial source requires all attempted rows");
      partial = { ...plan.source.partial, parentTaskId: recovery.parentTaskId, experimentId: recovery.experimentId, proof: proofIdentity, conservativeChargeUsd: recovery.conservativeChargeUsd };
    } else if (plan.source.diagnostic === true) diagnostic = diagnosticRejudgeSource(result);
    else { assertNotPlaygroundQuarantine(result); assertPlaygroundArtifactMeta(result.meta); }
    const verified = verifySourceCases(result, plan.source.path, { casesRef: resolveCasesRef(result, plan.source.casesRef), ...(partial ? { selectedIds: diagnostic.selectedIds } : {}) });
    if (!verified.guard.matches) throw new Error("source case snapshot mismatch");
    const byId = new Map(result.rows.map((row) => [row.id, row]));
    if (byId.size !== result.rows.length) throw new Error("duplicate source rows");
    const rows = plan.ids.map((id) => { const row = byId.get(id); if (!row) throw new Error("selected ID absent from source"); return row; });
    if (!goldenTimeConsistency(result, rows, verified.caseById).matches) throw new Error("golden time drift; freeze the intended source before authorizing");
    entries = rows.map((row) => ({ id: row.id,
      input: { ...verified.caseById.get(row.id), candidateAnswer: row.answer, transcript: row.transcript },
      original: row.verdict ?? null, skipped: diagnostic ? diagnosticAnswerProblem(row) : null,
      sourceTerminal: { finishReason: row.finishReason ?? null, clientError: !!row.clientError, httpError: !!row.httpError, sseError: !!row.sseErrors?.length }
    }));
    source = { path: plan.source.path, sha256: plan.source.sha256, caseSnapshot: verified.guard, diagnostic, ...(partial ? { partial } : {}),
      nonPromotable: result.nonPromotable === true, budget: structuredClone(result.budget), judge: result.meta.judge };
  }
  const calls = entries.filter((entry) => !entry.skipped);
  if (!Number.isSafeInteger(plan.maxCalls) || plan.maxCalls < 1 || plan.maxCalls !== calls.length) throw new Error("maxCalls must equal the exact planned gradeable input count");
  const prompts = calls.map((entry) => {
    const transcriptEvidence = typeof entry.input.transcriptEvidence === "string" ? entry.input.transcriptEvidence : buildTranscriptEvidence(entry.input);
    const prompt = buildJudgePrompt({ ...entry.input, transcriptEvidence });
    if (Buffer.byteLength(prompt) > config.maxPromptBytes) throw new Error("planned prompt exceeds byte limit");
    return { id: entry.id, promptSha256: sha256(prompt), promptBytes: Buffer.byteLength(prompt) };
  });
  return { config, identity, entries, source, pilot, prompts };
}

async function loadToken(auth) {
  try {
    if (auth.kind === "env") {
      const token = process.env[auth.variable];
      if (typeof token !== "string" || !token) throw new Error();
      return token;
    }
    if (sha256(readFileSync(realpathSync(auth.path))) !== auth.sha256) throw new Error();
    const { stdout } = await promisify(execFile)(auth.path, ["auth", "token", "--json", "--profile", auth.profile], { timeout: 30000, maxBuffer: 1024 * 1024 });
    const token = JSON.parse(stdout).token;
    if (typeof token !== "string" || !token) throw new Error();
    return token;
  } catch { throw new Error("standard Cloudflare credential unavailable; no model request sent"); }
}

export async function runGatewayRejudge(plan, prepared, { token, authorizedPlanSha256 = null, createJudge = createGatewayJudge, write = writeFileSync, rename = renameSync } = {}) {
  plan = structuredClone(plan);
  const artifact = { meta: {
    resultSchema: "gateway-rejudge-v1", purpose: "second-judge-diagnostic", nonIdentical: true, nonPromotable: true,
    mode: plan.mode, runId: plan.runId, planSha256: authorizedPlanSha256, canonicalPlanSha256: sha256(JSON.stringify(plan)), source: prepared.source, pilot: prepared.pilot,
    selectedIds: prepared.entries.map((entry) => entry.id), prompts: prepared.prompts,
    judgeModel: prepared.config.model, judgeEffort: prepared.config.effort, judgeTransport: GATEWAY_JUDGE_TRANSPORT,
    judgeRubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, judgeIdentity: prepared.identity,
    startedAt: new Date().toISOString(), finishedAt: null, status: "running"
  }, nonPromotable: true, summary: null, budget: null, rows: [] };
  // Exclusive first checkpoint prevents overwriting a result or silently resuming it.
  write(plan.out, JSON.stringify(artifact, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  const persist = () => {
    write(`${plan.out}.tmp`, JSON.stringify(artifact, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    rename(`${plan.out}.tmp`, plan.out);
  };
  let judge;
  try {
    judge = createJudge({ config: prepared.config, identity: prepared.identity, token,
      authorization: { runId: plan.runId, identitySha256: plan.identitySha256, maxBudgetUsd: plan.maxBudgetUsd, maxCalls: plan.maxCalls, maxJudgeErrorRate: plan.maxJudgeErrorRate },
      checkpoint: async (budget) => { artifact.budget = budget; persist(); }
    });
    for (const entry of prepared.entries) {
      if (prepared.source && sha256(readFileSync(prepared.source.path)) !== prepared.source.sha256) throw new Error("source-artifact-drift");
      for (const pinned of [prepared.source?.partial, prepared.source?.partial?.proof].filter(Boolean)) {
        if (sha256(readFileSync(pinned.path)) !== pinned.sha256) throw new Error("partial-recovery-evidence-drift");
      }
      if (prepared.pilot && sha256(readFileSync(prepared.pilot.path)) !== prepared.pilot.sha256) throw new Error("pilot-fixture-drift");
      if (entry.skipped) {
        artifact.rows.push({ id: entry.id, original: entry.original, new: null, agreement: null, skipped: { reason: entry.skipped }, sourceTerminal: entry.sourceTerminal });
        persist(); continue;
      }
      const verdict = await judge.judge(entry.input, { id: entry.id });
      const expected = entry.expectation;
      const calibrationPass = expected ? verdict.score !== "error" && (expected.expectNot ? verdict.score !== expected.expectNot : verdict.score === expected.expect) : null;
      artifact.rows.push({ id: entry.id, original: entry.original, new: verdict,
        agreement: verdictAgreement(entry.original, verdict), ...(expected ? { expectation: expected, calibrationPass } : {}),
        ...(entry.sourceTerminal ? { sourceTerminal: entry.sourceTerminal } : {}) });
      persist();
      if (judge.snapshot().stopped || calibrationPass === false || (plan.mode === "calibration" && verdict.score === "error")) throw new Error("judge-or-calibration-failed");
    }
    judge.assertIdentity();
    for (const pinned of [prepared.source, prepared.pilot, prepared.source?.partial, prepared.source?.partial?.proof].filter(Boolean)) {
      if (sha256(readFileSync(pinned.path)) !== pinned.sha256) throw new Error("source-evidence-drift");
    }
    artifact.meta.status = "complete";
  } catch {
    artifact.meta.status = "incomplete";
    artifact.meta.error = "judge-method-stopped";
  } finally {
    artifact.budget = judge?.snapshot() ?? artifact.budget;
    artifact.meta.unattemptedIds = prepared.entries.filter((entry) => !artifact.rows.some((row) => row.id === entry.id)).map((entry) => entry.id);
    artifact.meta.unresolvedJudgeErrorIds = artifact.rows.filter((row) => row.new?.score === "error").map((row) => row.id);
    artifact.meta.finishedAt = new Date().toISOString();
    persist();
  }
  return artifact;
}

async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log("Gateway second judge (Claude defaults unchanged):\n  --identity <config.json>\n  --plan <plan.json> --dry-run\n  --plan <plan.json> --authorized-plan-sha256 <raw-file-sha256>\nNo Codex CLI/subscription transport is supported. See eval/qa/gateway-judge.md."); return;
  }
  if (args.length === 2 && args[0] === "--identity") {
    console.log(JSON.stringify(gatewayJudgeIdentity(JSON.parse(readFileSync(args[1], "utf8"))), null, 2)); return;
  }
  if (args[0] !== "--plan" || !args[1] || !((args.length === 3 && args[2] === "--dry-run") ||
      (args.length === 4 && args[2] === "--authorized-plan-sha256" && shaPattern.test(args[3])))) throw new Error("invalid Gateway judge command; use --help");
  const { plan, planSha256 } = readGatewayJudgePlan(resolve(args[1]), args[2] === "--dry-run" ? null : args[3]);
  const prepared = prepareGatewayRejudge(plan);
  if (args[2] === "--dry-run") {
    console.log(JSON.stringify({ planSha256, identity: prepared.identity, source: prepared.source, prompts: prepared.prompts, maxCalls: plan.maxCalls, maxBudgetUsd: plan.maxBudgetUsd }, null, 2)); return;
  }
  const token = await loadToken(plan.auth);
  const result = await runGatewayRejudge(plan, prepared, { token, authorizedPlanSha256: planSha256 });
  console.log(JSON.stringify({ out: plan.out, status: result.meta.status, calls: result.budget?.callsStarted, costUsd: result.budget?.totalCostUsd }));
  process.exitCode = result.meta.status === "complete" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(() => { console.error("Gateway judge refused or stopped; inspect the plan and retained artifact. No automatic retry."); process.exitCode = 1; });
}
