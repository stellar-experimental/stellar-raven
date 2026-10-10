import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertClaudePin } from './paired-claude-pin.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const ANSWER_MODEL = 'claude-sonnet-5';

export function selectionSnapshot(root, stratifiedSample) {
  const bytes = readFileSync(`${root}/eval/qa/cases.json`);
  const all = JSON.parse(bytes).cases;
  assert.equal(new Set(all.map(c => c.id)).size, all.length);
  const active = all.filter(c => c.truth?.lifecycle?.state === 'active');
  assert.ok(active.length >= 200);
  const sampled = stratifiedSample(active, 200);
  const ids = sampled.map(c => c.id);
  const selected = active.filter(c => ids.includes(c.id));
  assert.deepEqual(selected.map(c => c.id), ids);
  return {
    count: 200, ids, idsSha256: sha(JSON.stringify(ids)),
    contentSha256: sha(JSON.stringify(selected)), casesFileSha256: sha(bytes),
    activeCorpusCount: active.length,
    activeCorpusIdsSha256: sha(JSON.stringify(active.map(c => c.id)))
  };
}

// `judge` carries the runner's exported JUDGE_MODEL, JUDGE_RUBRIC, and PACK_VERSION.
// The supervisor derives the same flip tuple from those exports, so no literal can drift.
export function buildPairedPlan({ env: e, selected, immutableClaude, binary, environment, register,
  capacityContract, surfaces, devVars, judge }) {
  const fileHash = name => sha(readFileSync(`${e.PAIRED_CR}/${name}`));
  const worktrees = {
    baselineRunner: e.PAIRED_BR, candidateRunner: e.PAIRED_CR,
    baselineServer: e.PAIRED_BS, candidateServer: e.PAIRED_CS
  };
  const registerPath = `${e.PAIRED_RUN}/paired-stability-register.json`;
  const capacityPath = `${e.PAIRED_RUN}/capacity.json`;
  const hashes = {
    agentBinarySha256: binary.sha256, judgeBinarySha256: binary.sha256,
    agentEnvironmentSha256: environment.sha256, judgeEnvironmentSha256: environment.sha256,
    adapterImplementationSha256: fileHash('eval/qa/exact-old-runtime-adapter.mjs'),
    remoteIdentityProbeSha256: fileHash('eval/qa/probe-remote-identities.mjs'),
    remoteIdentityVectorSha256: readFileSync(`${e.PAIRED_RUN}/stable.sha256`, 'utf8').trim(),
    stabilityRegisterSha256: register.sha256,
    runQaSha256: fileHash('eval/qa/run-qa.mjs'),
    pairedVerdictSha256: fileHash('eval/qa/paired-verdict.mjs'),
    pairedCollectionSupervisorSha256: fileHash('eval/qa/paired-collection-supervisor.mjs'),
    pairedCollectionControlSha256: fileHash('eval/qa/paired-collection-control.mjs')
  };
  assert.match(hashes.remoteIdentityVectorSha256, /^[a-f0-9]{64}$/);
  const collection = arm => [
    process.execPath, 'eval/qa/run-qa.mjs',
    '--ids', selected.ids.join(','), '--no-judge', '--paired-control-arm', arm,
    '--max-budget-usd', '80', '--variant', 'A', '--surface', 'search-execute',
    '--search-tool', 'search', '--model', ANSWER_MODEL, '--judge-model', judge.model,
    '--max-panel-cases', '34', '--server-revision', arm === 'baseline' ? e.PAIRED_BASE : e.PAIRED_REV,
    '--expect-sha256', surfaces[arm], '--adapter-mode', arm === 'baseline' ? 'add-missing' : 'verify-native',
    '--adapter-revision', e.PAIRED_REV,
    '--expect-agent-binary-sha256', hashes.agentBinarySha256,
    '--expect-agent-environment-sha256', hashes.agentEnvironmentSha256,
    '--expect-adapter-sha256', hashes.adapterImplementationSha256,
    '--remote-identity-probe', 'eval/qa/probe-remote-identities.mjs',
    '--expect-remote-identity-probe-sha256', hashes.remoteIdentityProbeSha256,
    '--expect-remote-identity-sha256', hashes.remoteIdentityVectorSha256,
    '--stability-register', registerPath,
    '--port', arm === 'baseline' ? '8789' : '8788',
    '--upstream-port', arm === 'baseline' ? '8791' : '8790'
  ];
  const judgeCommand = arm => [
    process.execPath, 'eval/qa/run-qa.mjs', '--judge-stored', `{${arm}Artifact}`,
    '--max-budget-usd', '120', '--judge-model', judge.model, '--max-panel-cases', '34',
    '--expect-agent-binary-sha256', hashes.judgeBinarySha256,
    '--expect-agent-environment-sha256', hashes.judgeEnvironmentSha256,
    '--stability-register', registerPath
  ];
  const flip = arm => [
    process.execPath, 'eval/qa/re-judge.mjs', `{${arm}Artifact}`,
    '--flips-vs', `{${arm === 'baseline' ? 'candidate' : 'baseline'}Artifact}`,
    '--judge-model', judge.model, '--claude-path', binary.resolvedPath,
    '--expect-agent-binary-sha256', hashes.judgeBinarySha256,
    '--expect-agent-environment-sha256', hashes.judgeEnvironmentSha256,
    '--cases-ref', e.PAIRED_REV, '--allow-empty', '--max-budget-usd', '15'
  ];
  const p6Path = `${e.PAIRED_RUN}/p6-summary.json`;
  return {
    schema: 'qa-paired-collection-plan-v2', deadlineMs: 14400000, selected, worktrees,
    immutableClaude,
    launchProcessGuard:{path:e.PAIRED_PROCESS_GUARD,sha256:sha(readFileSync(e.PAIRED_PROCESS_GUARD))},
    devVars,
    caps: {baseline:{collectionUsd:80,cumulativeUsd:120},candidate:{collectionUsd:80,cumulativeUsd:120},twoArmCumulativeUsd:240},
    capacity: {
      command: [process.execPath, 'eval/qa/check-paired-capacity.mjs', '--out', capacityPath],
      instrumentSha256: fileHash('eval/qa/check-paired-capacity.mjs'), artifactPath: capacityPath,
      artifactSha256: sha(readFileSync(capacityPath)), contract: capacityContract
    },
    arms: Object.fromEntries(['baseline','candidate'].map(arm => [arm, {
      collectionCommand:collection(arm), judgeCommand:judgeCommand(arm), inputHashes:{...hashes}
    }])),
    p6: {
      runnerArm: 'candidate', summaryArtifactPath:p6Path, claudePath:binary.resolvedPath,
      wrapperSha256:fileHash('eval/qa/run-p6-judge-self-test.mjs'), judgeSha256:fileHash('eval/qa/judge.mjs'),
      calls:7, perCallBudgetUsd:0.5, maxAuthorizedCostUsd:3.5,
      command: [process.execPath,'eval/qa/run-p6-judge-self-test.mjs',
        '--runner-revision',e.PAIRED_REV,'--claude-path',binary.resolvedPath,
        '--expect-claude-binary-sha256',hashes.agentBinarySha256,
        '--expect-claude-environment-sha256',hashes.agentEnvironmentSha256,'--out',p6Path]
    },
    flipRejudge: {
      implementationSha256:fileHash('eval/qa/re-judge.mjs'),
      judgeImplementationSha256:fileHash('eval/qa/judge.mjs'),
      evidencePackImplementationSha256:fileHash('eval/qa/evidence-pack.mjs'),
      judgeTuple:{model:judge.model,rubric:judge.rubric,packVersion:judge.packVersion,judgePanel:1},
      perArmBudgetUsd:15, commands:{baseline:flip('baseline'),candidate:flip('candidate')}
    },
    comparisonCommand:[process.execPath,'eval/qa/paired-verdict.mjs','{baselineArtifact}','{candidateArtifact}','--json']
  };
}

// Each paid command must parse through the runner's own CLI parser.
export function assertPlanCommandSyntax(plan, { assertRunQaCliSyntax, parseRejudge, parseP6SelfTestCli }) {
  for (const arm of ['baseline','candidate']) {
    assertRunQaCliSyntax(plan.arms[arm].collectionCommand.slice(2));
    assertRunQaCliSyntax(plan.arms[arm].judgeCommand.slice(2));
    parseRejudge(plan.flipRejudge.commands[arm].slice(2));
  }
  parseP6SelfTestCli(plan.p6.command.slice(2));
}

async function main(e) {
  const load = name => import(pathToFileURL(`${e.PAIRED_CR}/${name}`));
  const { stratifiedSample } = await load('eval/qa/lib.mjs');
  const { PAIRED_CAPACITY_CONTRACT, capacityRejectionReasons } = await load('eval/qa/check-paired-capacity.mjs');
  const { loadJudgeStabilityRegister } = await load('eval/qa/judge-stability.mjs');
  const { assertRunQaCliSyntax } = await load('eval/qa/run-qa.mjs');
  const { parseArgs: parseRejudge } = await load('eval/qa/re-judge.mjs');
  const { parseP6SelfTestCli } = await load('eval/qa/run-p6-judge-self-test.mjs');
  const { JUDGE_MODEL, JUDGE_RUBRIC } = await load('eval/qa/judge.mjs');
  const { PACK_VERSION } = await load('eval/qa/evidence-pack.mjs');
  assert.equal(e.QA_AGENT_PROMPT_APPEND, undefined);
  for (const [name, root] of Object.entries({
    baselineRunner: e.PAIRED_BR, candidateRunner: e.PAIRED_CR,
    baselineServer: e.PAIRED_BS, candidateServer: e.PAIRED_CS
  })) {
    assert.equal(execFileSync('git', ['-C', root, 'status', '--porcelain=v1', '--untracked-files=all'], {encoding:'utf8'}), '');
    assert.equal(execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), name === 'baselineServer' ? e.PAIRED_BASE : e.PAIRED_REV);
  }
  const selected = selectionSnapshot(e.PAIRED_CR, stratifiedSample);
  assert.deepEqual(selectionSnapshot(e.PAIRED_BR, stratifiedSample), selected);
  const immutableClaude = json(`${e.PAIRED_RUN}/claude-pin.json`);
  const { binary, environment } = assertClaudePin(immutableClaude, e);
  const register = loadJudgeStabilityRegister(`${e.PAIRED_RUN}/paired-stability-register.json`, {verifySources:false});
  assert.equal(register.status, 'available');
  const capacity = json(`${e.PAIRED_RUN}/capacity.json`);
  assert.equal(capacity.accepted, true);
  assert.deepEqual(capacityRejectionReasons(capacity), []);
  const age = Date.now() - Date.parse(capacity.completedAt);
  assert.ok(age >= 0 && age <= PAIRED_CAPACITY_CONTRACT.freshnessMs);
  const surface = arm => json(`${e.PAIRED_RUN}/${arm}-surface.json`).surfaceSha256;
  const surfaces = {baseline: surface('baseline'), candidate: surface('candidate')};
  assert.notEqual(surfaces.baseline, surfaces.candidate);
  const p6Path = `${e.PAIRED_RUN}/p6-summary.json`;
  assert.equal(existsSync(p6Path), false);
  assert.equal(existsSync(`${p6Path}.tmp`), false);
  const plan = buildPairedPlan({ env: e, selected, immutableClaude, binary, environment, register,
    capacityContract: PAIRED_CAPACITY_CONTRACT, surfaces,
    devVars: json(`${e.PAIRED_RUN}/dev-vars-identity.json`),
    judge: {model: JUDGE_MODEL, rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION} });
  assertPlanCommandSyntax(plan, { assertRunQaCliSyntax, parseRejudge, parseP6SelfTestCli });
  writeFileSync(`${e.PAIRED_RUN}/plan.json`, `${JSON.stringify(plan,null,2)}\n`, {flag:'wx',mode:0o600});
  writeFileSync(`${e.PAIRED_RUN}/cli-identity.json`, `${JSON.stringify({binary,environment},null,2)}\n`, {flag:'wx',mode:0o600});
  console.log(`plan frozen: ${selected.count} selected; ${selected.activeCorpusCount} active`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  await main(process.env);
}
