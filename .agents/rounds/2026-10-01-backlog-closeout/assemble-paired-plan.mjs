import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const e = process.env;
const load = name => import(pathToFileURL(`${e.PAIRED_CR}/${name}`));
const { stratifiedSample } = await load('eval/qa/lib.mjs');
const { executableIdentity, agentEnvironmentIdentity } = await load('eval/lib/executable-identity.mjs');
const { PAIRED_CAPACITY_CONTRACT, capacityRejectionReasons } = await load('eval/qa/check-paired-capacity.mjs');
const { loadJudgeStabilityRegister } = await load('eval/qa/judge-stability.mjs');
const { assertRunQaCliSyntax } = await load('eval/qa/run-qa.mjs');
const { parseArgs: parseRejudge } = await load('eval/qa/re-judge.mjs');
const { parseP6SelfTestCli } = await load('eval/qa/run-p6-judge-self-test.mjs');
const sha = value => createHash('sha256').update(value).digest('hex');
const fileHash = name => sha(readFileSync(`${e.PAIRED_CR}/${name}`));
const json = file => JSON.parse(readFileSync(file, 'utf8'));
assert.equal(e.QA_AGENT_PROMPT_APPEND, undefined);
const worktrees = {
  baselineRunner: e.PAIRED_BR, candidateRunner: e.PAIRED_CR,
  baselineServer: e.PAIRED_BS, candidateServer: e.PAIRED_CS
};
for (const [name, root] of Object.entries(worktrees)) {
  assert.equal(execFileSync('git', ['-C', root, 'status', '--porcelain=v1', '--untracked-files=all'], {encoding:'utf8'}), '');
  assert.equal(execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), name === 'baselineServer' ? e.PAIRED_BASE : e.PAIRED_REV);
}
function snapshot(root) {
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
const selected = snapshot(e.PAIRED_CR);
assert.deepEqual(snapshot(e.PAIRED_BR), selected);
const binary = executableIdentity('claude');
const environment = agentEnvironmentIdentity();
const registerPath = `${e.PAIRED_RUN}/paired-stability-register.json`;
const register = loadJudgeStabilityRegister(registerPath, {verifySources:false});
assert.equal(register.status, 'available');
const capacityPath = `${e.PAIRED_RUN}/capacity.json`;
const capacity = json(capacityPath);
assert.equal(capacity.accepted, true);
assert.deepEqual(capacityRejectionReasons(capacity), []);
const age = Date.now() - Date.parse(capacity.completedAt);
assert.ok(age >= 0 && age <= PAIRED_CAPACITY_CONTRACT.freshnessMs);
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
const surface = arm => json(`${e.PAIRED_RUN}/${arm}-surface.json`).surfaceSha256;
assert.notEqual(surface('baseline'), surface('candidate'));
const collection = arm => [
  process.execPath, 'eval/qa/run-qa.mjs',
  '--ids', selected.ids.join(','), '--no-judge', '--paired-control-arm', arm,
  '--max-budget-usd', '80', '--variant', 'A', '--surface', 'search-execute',
  '--search-tool', 'search', '--model', 'claude-sonnet-5', '--judge-model', 'claude-sonnet-5',
  '--max-panel-cases', '34', '--server-revision', arm === 'baseline' ? e.PAIRED_BASE : e.PAIRED_REV,
  '--expect-sha256', surface(arm), '--adapter-mode', arm === 'baseline' ? 'add-missing' : 'verify-native',
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
const judge = arm => [
  process.execPath, 'eval/qa/run-qa.mjs', '--judge-stored', `{${arm}Artifact}`,
  '--max-budget-usd', '120', '--judge-model', 'claude-sonnet-5', '--max-panel-cases', '34',
  '--expect-agent-binary-sha256', hashes.judgeBinarySha256,
  '--expect-agent-environment-sha256', hashes.judgeEnvironmentSha256,
  '--stability-register', registerPath
];
const flip = arm => [
  process.execPath, 'eval/qa/re-judge.mjs', `{${arm}Artifact}`,
  '--flips-vs', `{${arm === 'baseline' ? 'candidate' : 'baseline'}Artifact}`,
  '--judge-model', 'claude-sonnet-5', '--claude-path', binary.resolvedPath,
  '--expect-agent-binary-sha256', hashes.judgeBinarySha256,
  '--expect-agent-environment-sha256', hashes.judgeEnvironmentSha256,
  '--cases-ref', e.PAIRED_REV, '--allow-empty', '--max-budget-usd', '15'
];
const p6Path = `${e.PAIRED_RUN}/p6-summary.json`;
assert.equal(existsSync(p6Path), false);
assert.equal(existsSync(`${p6Path}.tmp`), false);
const plan = {
  schema: 'qa-paired-collection-plan-v2', deadlineMs: 14400000, selected, worktrees,
  launchProcessGuard:{path:e.PAIRED_PROCESS_GUARD,sha256:sha(readFileSync(e.PAIRED_PROCESS_GUARD))},
  devVars: json(`${e.PAIRED_RUN}/dev-vars-identity.json`),
  caps: {baseline:{collectionUsd:80,cumulativeUsd:120},candidate:{collectionUsd:80,cumulativeUsd:120},twoArmCumulativeUsd:240},
  capacity: {
    command: [process.execPath, 'eval/qa/check-paired-capacity.mjs', '--out', capacityPath],
    instrumentSha256: fileHash('eval/qa/check-paired-capacity.mjs'), artifactPath: capacityPath,
    artifactSha256: sha(readFileSync(capacityPath)), contract: PAIRED_CAPACITY_CONTRACT
  },
  arms: Object.fromEntries(['baseline','candidate'].map(arm => [arm, {
    collectionCommand:collection(arm), judgeCommand:judge(arm), inputHashes:{...hashes}
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
    judgeTuple:{model:'claude-sonnet-5',rubric:'v2.10',packVersion:'p6',judgePanel:1},
    perArmBudgetUsd:15, commands:{baseline:flip('baseline'),candidate:flip('candidate')}
  },
  comparisonCommand:[process.execPath,'eval/qa/paired-verdict.mjs','{baselineArtifact}','{candidateArtifact}','--json']
};
for (const arm of ['baseline','candidate']) {
  assertRunQaCliSyntax(plan.arms[arm].collectionCommand.slice(2));
  assertRunQaCliSyntax(plan.arms[arm].judgeCommand.slice(2));
  parseRejudge(plan.flipRejudge.commands[arm].slice(2));
}
parseP6SelfTestCli(plan.p6.command.slice(2));
writeFileSync(`${e.PAIRED_RUN}/plan.json`, `${JSON.stringify(plan,null,2)}\n`, {flag:'wx',mode:0o600});
writeFileSync(`${e.PAIRED_RUN}/cli-identity.json`, `${JSON.stringify({binary,environment},null,2)}\n`, {flag:'wx',mode:0o600});
console.log(`plan frozen: ${selected.count} selected; ${selected.activeCorpusCount} active`);
