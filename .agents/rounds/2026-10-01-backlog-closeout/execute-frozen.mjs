import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { runReservedInvocation, withLaunchCleanup, PROCESS_GUARD, processGuardSha256 } from "./paired-launch-runtime.mjs";
import { runCompleteness } from "../../../eval/lib/harness-guards.mjs";

export function validateStoredJudgeArtifact(artifact, plan) {
  const ids = plan.selected?.ids;
  assert.ok(Array.isArray(ids) && ids.length === 200 && new Set(ids).size === 200,
    "the signed selected IDs are missing or invalid");
  assert.deepEqual(artifact.rows?.map(row=>row.id),ids,"stored judging changed the signed selected IDs");
  assert.deepEqual(artifact.meta?.selectedIds,ids,"stored judging lacks the signed selected IDs");
  assert.equal(artifact.meta?.inputSnapshot?.caseIdsSha256,plan.selected.idsSha256,
    "stored judging changed the signed selected-ID hash");
  assert.equal(artifact.meta?.inputSnapshot?.casesSha256,plan.selected.contentSha256,
    "stored judging changed the signed selected-content hash");
  assert.equal(artifact.meta?.comparable,true,"stored judging is not comparable");
  assert.equal(artifact.meta?.aggregatesSuppressed,false,"stored judging suppresses aggregates");
  assert.ok(artifact.summary && typeof artifact.summary === 'object',"stored judging lacks aggregates");
  assert.equal(artifact.summary.overall?.total,200,"stored judging lacks the signed aggregate denominator");
  for (const name of ['completeness','judgingCompleteness']) {
    assert.equal(artifact.meta?.[name]?.complete,true,`${name} is missing or incomplete`);
    assert.equal(artifact.meta[name].aggregatesAllowed,true,`${name} disallows aggregates`);
    for (const key of ['expectedCases','expectedRows','collectedRows']) {
      assert.equal(artifact.meta[name][key],200,`${name} lacks the complete denominator`);
    }
    for (const key of ['missingIds','unexpectedIds','overRunIds','reasons']) {
      assert.deepEqual(artifact.meta[name][key],[],`${name} contains ${key} or lacks evidence`);
    }
  }
  for (const key of ['unattemptedIds','incompleteIds']) {
    assert.deepEqual(artifact.meta?.judgeStored?.[key],[],`stored judging contains ${key} or lacks evidence`);
  }
  assert.deepEqual(artifact.meta.unattemptedIds,[],"stored judging has missing selected rows");
  assert.equal(artifact.meta.judgingCompleteness.judgedRows,200,"stored judging has unjudged rows");
  assert.equal(runCompleteness({expectedIds:ids,rows:artifact.rows,judging:true}).aggregatesAllowed,true,
    "stored judging has rows without verdicts");
}

export async function executeFrozen(phase, manager, env = process.env) {
  const plan = JSON.parse(readFileSync(`${env.PAIRED_RUN}/plan.json`, "utf8"));
  const { validateAuthorizedPairedCollectionPlan } = await import(
    pathToFileURL(`${env.PAIRED_CR}/eval/qa/paired-collection-supervisor.mjs`)
  );
  const planSha256 = validateAuthorizedPairedCollectionPlan(plan, env.PAIRED_AUTHORIZED_SHA256);
  assert.deepEqual(plan.launchProcessGuard,{path:PROCESS_GUARD,sha256:processGuardSha256()},
    "the signed process guard differs from this executor");
  const methods = {
    p6: [plan.p6.command, plan.worktrees[`${plan.p6.runnerArm}Runner`]],
    collection: [[process.execPath, "eval/qa/paired-collection-supervisor.mjs",
      "--plan", `${env.PAIRED_RUN}/plan.json`, "--authorized-plan-sha256", planSha256],
    plan.worktrees.candidateRunner],
    baselineJudge: [plan.arms.baseline.judgeCommand, plan.worktrees.baselineRunner],
    candidateJudge: [plan.arms.candidate.judgeCommand, plan.worktrees.candidateRunner],
    compare: [plan.comparisonCommand, plan.worktrees.candidateRunner],
    baselineFlip: [plan.flipRejudge.commands.baseline, plan.worktrees.baselineRunner],
    candidateFlip: [plan.flipRejudge.commands.candidate, plan.worktrees.candidateRunner]
  };
  assert.ok(Object.hasOwn(methods, phase), "unknown frozen phase");
  const [frozen, cwd] = methods[phase];
  let artifacts = {};
  if (!["p6", "collection"].includes(phase)) {
    const receipt = JSON.parse(readFileSync(`${env.PAIRED_RUN}/receipt.json`, "utf8"));
    assert.equal(receipt.schema, "qa-paired-collection-receipt-v1");
    assert.equal(receipt.planSha256, planSha256);
    assert.equal(receipt.rows, 200);
    artifacts = receipt.artifacts;
    const requiredJudgedArms = phase === 'candidateJudge' ? ['baseline'] :
      ['compare','baselineFlip','candidateFlip'].includes(phase) ? ['baseline','candidate'] : [];
    for (const arm of requiredJudgedArms) {
      assert.ok(typeof artifacts[arm] === 'string',`${arm} has no stored-judge artifact path`);
      validateStoredJudgeArtifact(JSON.parse(readFileSync(artifacts[arm],'utf8')),plan);
    }
  }
  const command = frozen.map((value) => value === "{baselineArtifact}" ? artifacts.baseline :
    value === "{candidateArtifact}" ? artifacts.candidate : value);
  const stdoutPath = `${env.PAIRED_RUN}/${phase === "collection" ? "receipt.json" : `${phase}.log`}`;
  const stderrPath = `${env.PAIRED_RUN}/${phase}.stderr.log`;
  const result = await runReservedInvocation({
    command, cwd, env, manager, directory: env.PAIRED_RUN, planSha256, phase, stdoutPath, stderrPath
  });
  if (phase === "compare") {
    const verdict = JSON.parse(readFileSync(stdoutPath, "utf8"));
    assert.equal(verdict.method, "qa-paired-ordinal-ni-v1");
    assert.equal(result.code, { PASS: 0, FAIL: 1, INDETERMINATE: 2 }[verdict.verdict]);
    const statistical = new Set(["loss-demonstrated", "experimental-margin-cleared",
      "confidence-bounds-overlap", "repeat-required"]);
    assert.ok(verdict.reasons.every((reason) => statistical.has(reason.code)),
      "comparison reports a method blocker; stop before any further paid method");
  } else {
    assert.equal(result.code, 0, `${phase} failed; retain its marker, receipt, and logs`);
    if (['baselineJudge','candidateJudge'].includes(phase)) {
      const arm = phase === 'baselineJudge' ? 'baseline' : 'candidate';
      assert.ok(typeof artifacts[arm] === 'string',"the stored-judge artifact path is missing");
      validateStoredJudgeArtifact(JSON.parse(readFileSync(artifacts[arm],'utf8')),plan);
    }
  }
  console.log(`${phase} complete; read ${stdoutPath}`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  withLaunchCleanup((manager) => executeFrozen(process.argv[2], manager), {
    journalPath: `${process.env.PAIRED_RUN}/phase-processes-${process.pid}-${randomUUID()}.json`
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
