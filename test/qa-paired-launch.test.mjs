import { spawn } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, realpathSync, symlinkSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { reserveInvocation, processTable, withLaunchCleanup, OwnedProcesses, PROCESS_GUARD, processGuardSha256, managedEnvironment } from "../.agents/rounds/2026-10-01-backlog-closeout/paired-launch-runtime.mjs";
import { createClaudePin } from "../.agents/rounds/2026-10-01-backlog-closeout/paired-claude-pin.mjs";
import { agentEnvironmentIdentity } from "../eval/lib/executable-identity.mjs";
import { freeCommand, runLaunchSteps, removeLaunchWorktrees, inspectWorktreeIdentity, launchEnvironment, PORTS } from "../.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs";
import { executeFrozen, validateStoredJudgeArtifact } from "../.agents/rounds/2026-10-01-backlog-closeout/execute-frozen.mjs";
import { pairedCollectionPlanSha256, devVarsIdentity, validateAuthorizedPairedCollectionPlan, validatePairedCollectionPlan } from "../eval/qa/paired-collection-supervisor.mjs";
import { assertPlanCommandSyntax, buildPairedPlan, selectionSnapshot } from "../.agents/rounds/2026-10-01-backlog-closeout/assemble-paired-plan.mjs";
import { stratifiedSample } from "../eval/qa/lib.mjs";
import { PAIRED_CAPACITY_CONTRACT } from "../eval/qa/check-paired-capacity.mjs";
import { loadJudgeStabilityRegister } from "../eval/qa/judge-stability.mjs";
import { assertRunQaCliSyntax } from "../eval/qa/run-qa.mjs";
import { parseArgs as parseRejudge } from "../eval/qa/re-judge.mjs";
import { assertP6OutputAvailable, parseP6SelfTestCli } from "../eval/qa/run-p6-judge-self-test.mjs";
import { JUDGE_MODEL, JUDGE_RUBRIC } from "../eval/qa/judge.mjs";
import { PACK_VERSION } from "../eval/qa/evidence-pack.mjs";
import { acceptedCapacityArtifact, passingP6Summary } from "./helpers/paired-plan-fixtures.mjs";

function emptyJournal() {
  return {schema:'qa-paired-launch-processes-v2',identities:[],groups:[],retiredGroups:[],cleanup:{complete:true}};
}

function completeArtifact(plan) {
  const completeness={complete:true,aggregatesAllowed:true,expectedCases:200,expectedRows:200,collectedRows:200,
    missingIds:[],unexpectedIds:[],overRunIds:[],reasons:[],judgedRows:200};
  return {rows:plan.selected.ids.map(id=>({id,verdict:{score:'correct'}})),summary:{overall:{total:200}},meta:{
    comparable:true,aggregatesSuppressed:false,selectedIds:plan.selected.ids,unattemptedIds:[],
    inputSnapshot:{caseIdsSha256:plan.selected.idsSha256,casesSha256:plan.selected.contentSha256},
    completeness,judgingCompleteness:completeness,judgeStored:{unattemptedIds:[],incompleteIds:[]}}};
}

function freezeFixture(root, plan) {
  const versions = path.join(root, '.local/share/claude/versions');
  mkdirSync(versions, {recursive:true});
  mkdirSync(path.join(root, '.local/bin'), {recursive:true});
  const binary = path.join(versions, 'fixture-1');
  writeFileSync(binary, '#!/bin/sh\n[ "$1" = "--version" ] || exit 99\necho "fixture-1 (Claude Code)"\n', {mode:0o700});
  symlinkSync(binary, path.join(root, '.local/bin/claude'));
  const env = {...process.env, HOME:root, PAIRED_RUN:root, PAIRED_CR:root};
  delete env.QA_AGENT_PROMPT_APPEND;
  plan.immutableClaude = createClaudePin(env);
  const hash = agentEnvironmentIdentity(managedEnvironment(env)).sha256;
  for (const arm of ['baseline','candidate']) {
    plan.arms[arm].inputHashes = {agentBinarySha256:plan.immutableClaude.sha256,
      judgeBinarySha256:plan.immutableClaude.sha256, agentEnvironmentSha256:hash, judgeEnvironmentSha256:hash};
  }
  plan.p6.claudePath = plan.immutableClaude.claudePath;
  for (const command of new Set([plan.p6.command, ...Object.values(plan.flipRejudge.commands)])) {
    command.push('--claude-path', plan.immutableClaude.claudePath);
  }
  env.PAIRED_AUTHORIZED_SHA256 = pairedCollectionPlanSha256(plan);
  return env;
}

const runtime = fileURLToPath(new URL("../.agents/rounds/2026-10-01-backlog-closeout/paired-launch-runtime.mjs", import.meta.url));
const sha = "a".repeat(64);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const active = (pid) => processTable().some((row) => row.pid === pid && !row.state.startsWith("Z"));

async function waitFor(file) {
  const deadline = Date.now() + 3_000;
  while (!existsSync(file)) {
    if (Date.now() >= deadline) throw new Error(`fixture did not create ${file}`);
    await delay(20);
  }
}

function start(file, args = []) {
  const child = spawn(process.execPath, [file, ...args], { stdio: "ignore" });
  return { child, done: new Promise((resolve, reject) => {
    child.once("error", reject); child.once("exit", (code, signal) => resolve({code,signal}));
  }) };
}

function paidFixture(root, phase = "collection") {
  const childFile = path.join(root, "harmless-child.mjs");
  writeFileSync(childFile, `import {appendFileSync,writeFileSync} from 'node:fs';
appendFileSync(${JSON.stringify(path.join(root,"invocations"))},'started\\n');
writeFileSync(${JSON.stringify(path.join(root,"child-pid"))},String(process.pid));
process.stdout.write('evidence before interruption\\n');
setInterval(()=>{},1000);
`);
  const parentFile = path.join(root,"parent.mjs");
  writeFileSync(parentFile, `import {withLaunchCleanup,runReservedInvocation} from ${JSON.stringify(runtime)};
try {
await withLaunchCleanup(async manager=>{
await runReservedInvocation({manager,command:[process.execPath,${JSON.stringify(childFile)}],cwd:${JSON.stringify(root)},
directory:${JSON.stringify(root)},planSha256:${JSON.stringify(sha)},phase:${JSON.stringify(phase)},
stdoutPath:${JSON.stringify(path.join(root,phase==='collection'?'receipt.json':`${phase}.log`))},stderrPath:${JSON.stringify(path.join(root,`${phase}.stderr.log`))}});
},{timeoutMs:600,journalPath:${JSON.stringify(path.join(root,"fixture-processes.json"))}});
} catch(error) { process.exitCode=1; }
`);
  return parentFile;
}

function stopFixtureChild(root) {
  if (!existsSync(path.join(root,"child-pid"))) return;
  const pid = Number(readFileSync(path.join(root,"child-pid"),"utf8"));
  try { process.kill(-pid,"SIGKILL"); } catch (error) { if (error.code !== "ESRCH") throw error; }
}

describe("paired launch reservations", () => {
  it.each([...["p6","collection","baselineJudge","candidateJudge","compare","baselineFlip","candidateFlip"]
    .map(phase=>[phase,0]),["p6",9]])(
    "reserves the actual %s executor path before its harmless child exits %s", async (phase,code) => {
      const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-executor-"));
      try {
        const qa=path.join(root,"eval","qa");mkdirSync(qa,{recursive:true});
        const supervisor=fileURLToPath(new URL("../eval/qa/paired-collection-supervisor.mjs",import.meta.url));
        const harmless=`import {appendFileSync} from 'node:fs';
const {spawnSync}=await import('node:child_process');
if(spawnSync('claude',['--version'],{encoding:'utf8'}).stdout.trim()!=='fixture-1 (Claude Code)') throw new Error('followed the public link');
appendFileSync(${JSON.stringify(path.join(root,"invocations"))},'started\\n');
console.log(JSON.stringify({method:'qa-paired-ordinal-ni-v1',verdict:'PASS',reasons:[]}));
process.exitCode=${code};`;
        const child=path.join(root,"harmless.mjs");writeFileSync(child,harmless);
        writeFileSync(path.join(qa,"paired-collection-supervisor.mjs"),
          `import {appendFileSync} from 'node:fs';\n`+
          `export {validateAuthorizedPairedCollectionPlan} from ${JSON.stringify(supervisor)};\n`+
          `if(process.argv.includes('--plan')) {\n${harmless.split("\n").slice(1).join("\n")}\n}`);
        const command=[process.execPath,child];
        const plan={selected:{ids:Array.from({length:200},(_,i)=>`case-${i}`),idsSha256:sha,contentSha256:sha},launchProcessGuard:{path:PROCESS_GUARD,sha256:processGuardSha256()},worktrees:{baselineRunner:root,candidateRunner:root},
          p6:{command,runnerArm:"candidate"},
          arms:{baseline:{judgeCommand:command},candidate:{judgeCommand:command}},
          comparisonCommand:command,flipRejudge:{commands:{baseline:command,candidate:command}}};
        const env=freezeFixture(root,plan);
        const updated=path.join(root,'.local/share/claude/versions/fixture-2');
        writeFileSync(updated,'#!/bin/sh\necho "fixture-2 (Claude Code)"\n',{mode:0o700});
        unlinkSync(path.join(root,'.local/bin/claude'));
        symlinkSync(updated,path.join(root,'.local/bin/claude'));
        const planSha256=env.PAIRED_AUTHORIZED_SHA256;
        writeFileSync(path.join(root,"plan.json"),JSON.stringify(plan));
        if(!["p6","collection"].includes(phase)) {
          writeFileSync(path.join(root,"receipt.json"),JSON.stringify({
            schema:"qa-paired-collection-receipt-v1",planSha256,rows:200,artifacts:{baseline:path.join(root,"artifact.json"),candidate:path.join(root,"artifact.json")}}));
        }
        writeFileSync(path.join(root,"artifact.json"),JSON.stringify(completeArtifact(plan)));
        await withLaunchCleanup(async manager=>{
          if(code===0) await executeFrozen(phase,manager,env);
          else await expect(executeFrozen(phase,manager,env)).rejects.toThrow("p6 failed");
          const output=path.join(root,phase==="collection" ? "receipt.json" : `${phase}.log`);
          const first=readFileSync(output,"utf8");
          await expect(executeFrozen(phase,manager,env)).rejects.toThrow(/EEXIST/);
          expect(readFileSync(output,"utf8")).toBe(first);
        },{timeoutMs:600});
        expect(readFileSync(path.join(root,"invocations"),"utf8")).toBe("started\n");
        expect(JSON.parse(readFileSync(path.join(root,`${phase}.started.json`),"utf8")))
          .toMatchObject({planSha256,phase});
      } finally { rmSync(root,{recursive:true,force:true}); }
    },10_000);

  it.each(['p6','collection','baselineJudge','candidateJudge','compare','baselineFlip','candidateFlip'])(
    'stops %s before reservation or a child when the updater flag changes', async phase => {
      const root=mkdtempSync(path.join(os.tmpdir(),'paired-launch-pin-stop-'));
      try {
        const qa=path.join(root,'eval/qa');mkdirSync(qa,{recursive:true});
        const supervisor=fileURLToPath(new URL('../eval/qa/paired-collection-supervisor.mjs',import.meta.url));
        writeFileSync(path.join(qa,'paired-collection-supervisor.mjs'),
          `export {validateAuthorizedPairedCollectionPlan} from ${JSON.stringify(supervisor)};`);
        const command=[process.execPath,'must-not-start.mjs'];
        const plan={launchProcessGuard:{path:PROCESS_GUARD,sha256:processGuardSha256()},
          worktrees:{baselineRunner:root,candidateRunner:root},p6:{command,runnerArm:'candidate'},
          arms:{baseline:{judgeCommand:command},candidate:{judgeCommand:command}},
          flipRejudge:{commands:{baseline:command,candidate:command}},comparisonCommand:command};
        const env=freezeFixture(root,plan);
        writeFileSync(path.join(root,'plan.json'),JSON.stringify(plan));
        env.DISABLE_AUTOUPDATER='0';
        const manager={spawn:()=>{throw new Error('must not spawn');}};
        await expect(executeFrozen(phase,manager,env)).rejects.toThrow(/DISABLE_AUTOUPDATER must remain 1/);
        expect(existsSync(path.join(root,`${phase}.started.json`))).toBe(false);
        expect(existsSync(path.join(root,`${phase}.log`))).toBe(false);
      } finally {rmSync(root,{recursive:true,force:true});}
    });

  it.each(["p6", "collection"])("reserves %s atomically across simultaneous starts", async (phase) => {
    const root = mkdtempSync(path.join(os.tmpdir(),"paired-launch-race-"));
    const parents = [];
    try {
      const file = paidFixture(root,phase);
      parents.push(start(file),start(file));
      await waitFor(path.join(root,"child-pid"));
      const rejected = await Promise.race(parents.map(({done})=>done));
      expect(rejected.code).toBe(1);
      expect(readFileSync(path.join(root,"invocations"),"utf8")).toBe("started\n");
      const marker = JSON.parse(readFileSync(path.join(root,`${phase}.started.json`),"utf8"));
      expect(marker).toMatchObject({planSha256:sha,phase});
    } finally {
      for(const {child} of parents) child.kill("SIGTERM");
      await Promise.all(parents.map(({done})=>done));
      stopFixtureChild(root);
      rmSync(root,{recursive:true,force:true});
    }
  }, 10_000);

  it("keeps the start marker and partial receipt after an interrupted collection", async () => {
    const root = mkdtempSync(path.join(os.tmpdir(),"paired-launch-interrupted-"));
    let first;
    try {
      const file = paidFixture(root);
      first = start(file);
      await waitFor(path.join(root,"child-pid"));
      await delay(50);
      first.child.kill("SIGKILL"); await first.done;
      const receipt = readFileSync(path.join(root,"receipt.json"),"utf8");
      const marker = readFileSync(path.join(root,"collection.started.json"),"utf8");
      const second = start(file);
      expect((await second.done).code).toBe(1);
      expect(readFileSync(path.join(root,"invocations"),"utf8")).toBe("started\n");
      expect(readFileSync(path.join(root,"receipt.json"),"utf8")).toBe(receipt);
      expect(receipt).toContain("evidence before interruption");
      expect(readFileSync(path.join(root,"collection.started.json"),"utf8")).toBe(marker);
    } finally {
      first?.child.kill("SIGKILL");
      stopFixtureChild(root);
      rmSync(root,{recursive:true,force:true});
    }
  }, 10_000);

  it("retains an existing output and its marker when exclusive output creation fails", () => {
    const root = mkdtempSync(path.join(os.tmpdir(),"paired-launch-output-"));
    try {
      const stdoutPath=path.join(root,"receipt.json");
      writeFileSync(stdoutPath,"first receipt");
      expect(()=>reserveInvocation({directory:root,planSha256:sha,phase:"collection",
        stdoutPath,stderrPath:path.join(root,"collection.stderr.log")})).toThrow(/EEXIST/);
      expect(readFileSync(stdoutPath,"utf8")).toBe("first receipt");
      expect(existsSync(path.join(root,"collection.started.json"))).toBe(true);
    } finally { rmSync(root,{recursive:true,force:true}); }
  });
});

describe("paired launch cleanup", () => {
  it("stops owned groups and leaves an unrelated group active", async () => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-unrelated-"));
    let unrelated;
    let owned;
    try {
      unrelated=spawn(process.execPath,["-e","setInterval(()=>{},1000);"],{detached:true,stdio:"ignore"});
      await withLaunchCleanup(async manager=>{
        owned=manager.spawn([process.execPath,"-e","setInterval(()=>{},1000);"],{cwd:root}).child.pid;
      },{timeoutMs:600});
      expect(active(owned)).toBe(false);
      expect(active(unrelated.pid)).toBe(true);
    } finally {
      if(owned && active(owned)) process.kill(-owned,"SIGKILL");
      if(unrelated && active(unrelated.pid)) process.kill(-unrelated.pid,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it.each(["startup", "intermediate"])("cleans owned children after a %s failure", async (failure) => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-failure-"));
    let pid;
    let listenerChecks=0;
    try {
      const ready=path.join(root,"ready");
      const command=[process.execPath,"-e",`require('node:fs').writeFileSync(${JSON.stringify(ready)},'yes');setInterval(()=>{},1000);`];
      const fail=manager=>freeCommand(manager,{...process.env,PAIRED_RUN:root},failure,
        [process.execPath,"-e","process.stdout.write('partial command output');process.exitCode=9;"],root);
      const steps=[async manager=>{
        pid=manager.spawn(command,{cwd:root}).child.pid;
        await waitFor(ready);
        if(failure==="startup") await fail(manager);
      },fail];
      await expect(withLaunchCleanup(manager=>runLaunchSteps(manager,steps),{
        timeoutMs:600,listeners:PORTS,checkListeners:ports=>{
          expect(PORTS).toContain(ports[0]);expect(ports).toHaveLength(1);listenerChecks++;
        }
      })).rejects.toThrow(/failed/);
      expect(active(pid)).toBe(false);
      expect(listenerChecks).toBe(4);
      expect(readFileSync(path.join(root,`${failure}.log`),"utf8")).toBe("partial command output");
    } finally {
      if(pid && active(pid)) process.kill(-pid,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it("terminates a surviving descendant after its group leader exits", async () => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-descendant-"));
    let descendant;
    try {
      const ready=path.join(root,"descendant-pid");
      const childCode=`require('node:fs').writeFileSync(${JSON.stringify(ready)},String(process.pid));process.on('SIGTERM',()=>{});setInterval(()=>{},1000);`;
      const leaderCode=`const c=require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(childCode)}],{stdio:'ignore'});c.unref();`;
      const started=Date.now();
      await withLaunchCleanup(async manager=>{
        const running=manager.spawn([process.execPath,"-e",leaderCode],{cwd:root});
        await running.completion;
        await waitFor(ready);
        descendant=Number(readFileSync(ready,"utf8"));
        expect(active(descendant)).toBe(true);
      },{timeoutMs:600});
      expect(active(descendant)).toBe(false);
      expect(Date.now()-started).toBeLessThan(3_000);
    } finally {
      if(descendant && active(descendant)) process.kill(descendant,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it.each([["SIGINT",130],["SIGTERM",143]])("cleans owned children on %s", async (signal,code) => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-signal-"));
    let parent;
    let pid;
    try {
      parent=start(paidFixture(root,"p6"));
      await waitFor(path.join(root,"child-pid"));
      pid=Number(readFileSync(path.join(root,"child-pid"),"utf8"));
      parent.child.kill(signal);
      expect((await parent.done).code).toBe(code);
      expect(active(pid)).toBe(false);
      expect(existsSync(path.join(root,"p6.started.json"))).toBe(true);
    } finally {
      parent?.child.kill("SIGKILL");
      if(pid && active(pid)) process.kill(-pid,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it.each([1,2,3,4,5])("records an immediate-exit parent's child in the launch group, attempt %s", async () => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-detached-"));
    let descendant;
    try {
      const ready=path.join(root,"descendant-pid");
      const childCode=`require('node:fs').writeFileSync(${JSON.stringify(ready)},String(process.pid));setInterval(()=>{},1000);`;
      const leaderCode=`const c=require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(childCode)}],{stdio:'ignore',detached:true});c.unref();`;
      await withLaunchCleanup(async manager=>{
        const running=manager.spawn([process.execPath,"-e",leaderCode],{cwd:root});
        await waitFor(ready);
        descendant=Number(readFileSync(ready,"utf8"));
        await running.completion;
        expect(active(descendant)).toBe(true);
        expect(processTable().find(row=>row.pid===descendant).pgid).toBe(running.child.pid);
      },{timeoutMs:600});
      expect(active(descendant)).toBe(false);
    } finally {
      if(descendant && active(descendant)) process.kill(descendant,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it.each(["normal", "exit"])("cleans owned children on a %s exit", async (mode) => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-exit-"));
    let pid;
    try {
      const ready=path.join(root,"child-pid");
      const command=[process.execPath,"-e",`require('node:fs').writeFileSync(${JSON.stringify(ready)},String(process.pid));setInterval(()=>{},1000);`];
      const file=path.join(root,"parent.mjs");
      writeFileSync(file,`import {withLaunchCleanup} from ${JSON.stringify(runtime)};
import {existsSync} from 'node:fs';
await withLaunchCleanup(async manager=>{
manager.spawn(${JSON.stringify(command)},{cwd:${JSON.stringify(root)}});
while(!existsSync(${JSON.stringify(ready)})) await new Promise(resolve=>setTimeout(resolve,20));
${mode==="exit" ? "process.exit(7);" : ""}
},{timeoutMs:600});`);
      const parent=start(file);
      await waitFor(ready);
      pid=Number(readFileSync(ready,"utf8"));
      expect((await parent.done).code).toBe(mode==="exit" ? 7 : 0);
      expect(active(pid)).toBe(false);
    } finally {
      if(pid && active(pid)) process.kill(-pid,"SIGKILL");
      rmSync(root,{recursive:true,force:true});
    }
  },10_000);

  it("blocks worktree removal until every listener check passes", async () => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-removal-"));
    let removed=false;
    try {
      writeFileSync(path.join(root,"owned-processes.json"),JSON.stringify(emptyJournal()));
      const env={PAIRED_RUN:root};
      await expect(removeLaunchWorktrees(env,{
        checkListeners:ports=>{expect(ports).toEqual(PORTS);throw new Error("listener remains");},
        removeWorktree:()=>{removed=true;}
      })).rejects.toThrow("listener remains");
      expect(removed).toBe(false);
    } finally { rmSync(root,{recursive:true,force:true}); }
  });

  it("verifies all listeners and removes only this launch's recorded worktrees", async () => {
    const root=mkdtempSync(path.join(os.tmpdir(),"paired-launch-owned-removal-"));
    try {
      const owned=path.join(root,"owned-runner");
      const unrelated=path.join(root,"unrelated-runner");
      mkdirSync(owned);mkdirSync(unrelated);
      writeFileSync(path.join(root,"owned-processes.json"),JSON.stringify(emptyJournal()));
      writeFileSync(path.join(root,"worktrees-created.json"),JSON.stringify([{root:owned,revision:"a".repeat(40)}]));
      const env={PAIRED_RUN:root,PAIRED_BR:owned,PAIRED_CR:unrelated};
      const operations=[];
      await removeLaunchWorktrees(env,{
        checkListeners:ports=>{expect(ports).toEqual(PORTS);operations.push("listeners");},
        verifyWorktree:record=>{expect(record.root).toBe(owned);operations.push("revision");},
        removeWorktree:worktree=>{expect(worktree).toBe(owned);operations.push("remove");}
      });
      expect(operations).toEqual(["listeners","revision","remove"]);
      expect(existsSync(unrelated)).toBe(true);
    } finally { rmSync(root,{recursive:true,force:true}); }
  });
});

describe('paired launch delta regressions',()=>{
  it.each(['stale','retired'])('never signals a %s group reused by unknown members',async state=>{
    const root=mkdtempSync(path.join(os.tmpdir(),'paired-launch-stale-'));
    let table=[{pid:220,ppid:1,pgid:220,state:'S',startedAt:'owned-now'}];
    const signals=[];
    const checked=[];
    const manager=new OwnedProcesses({journalPath:path.join(root,'owned-processes.json'),timeoutMs:600,
      listeners:PORTS,readProcesses:()=>table,signalGroup:(pid,signal)=>{
        signals.push([pid,signal]);table=table.filter(row=>row.pgid!==-pid);
      },checkListeners:ports=>{checked.push(...ports);if(ports[0]===8788) throw new Error('unresolved listener');}});
    try {
      manager.groups.set(120,{pgid:120,generation:'old',exited:true,cwd:root});
      manager.identities.set(120,{pid:120,startedAt:'old-leader',generation:'old'});
      manager.groups.set(220,{pgid:220,generation:'owned',exited:false});
      manager.identities.set(220,{...table[0],generation:'owned'});
      if(state==='retired') {manager.capture();expect(manager.groups.has(120)).toBe(false);}
      table.push({pid:121,ppid:1,pgid:120,state:'S',startedAt:'unrelated-now',cwd:root});
      await expect(manager.stop()).rejects.toThrow(/manual action/);
      expect(signals).toEqual([[-220,'SIGTERM']]);
      expect(table.map(row=>row.pid)).toEqual([121]);
      expect(checked).toEqual(PORTS);
      const journal=JSON.parse(readFileSync(path.join(root,'owned-processes.json'),'utf8'));
      expect(journal.cleanup.complete).toBe(false);
      expect(journal.cleanup.unresolved[0].pid).toBe(121);
      expect(journal.cleanup.listeners[0].port).toBe(8788);
      await expect(removeLaunchWorktrees({PAIRED_RUN:root},{removeWorktree:()=>{throw new Error('must not remove');}}))
        .rejects.toThrow(/cleanup is unresolved/);
    } finally {manager.dispose();rmSync(root,{recursive:true,force:true});}
  });

  it('stops candidate judging when baseline budget exhaustion returns zero',async()=>{
    const root=mkdtempSync(path.join(os.tmpdir(),'paired-launch-incomplete-'));
    try {
      const qa=path.join(root,'eval','qa');mkdirSync(qa,{recursive:true});
      const supervisor=fileURLToPath(new URL('../eval/qa/paired-collection-supervisor.mjs',import.meta.url));
      writeFileSync(path.join(qa,'paired-collection-supervisor.mjs'),
        `export {validateAuthorizedPairedCollectionPlan} from ${JSON.stringify(supervisor)};`);
      const artifactPath=path.join(root,'baseline.json');
      const incomplete=path.join(root,'incomplete.mjs');
      const candidate=path.join(root,'candidate.mjs');
      const plan={selected:{ids:Array.from({length:200},(_,i)=>`case-${i}`),idsSha256:sha,contentSha256:sha},
        launchProcessGuard:{path:PROCESS_GUARD,sha256:processGuardSha256()},
        worktrees:{baselineRunner:root,candidateRunner:root},p6:{runnerArm:'candidate',command:[]},
        arms:{baseline:{judgeCommand:[process.execPath,incomplete]},candidate:{judgeCommand:[process.execPath,candidate]}},
        comparisonCommand:[],flipRejudge:{commands:{baseline:[],candidate:[]}}};
      const artifact=completeArtifact(plan);
      artifact.rows[199].verdict=null;
      artifact.summary=null;artifact.meta.aggregatesSuppressed=true;
      artifact.meta.judgeStored.unattemptedIds=['case-199'];
      artifact.meta.judgingCompleteness={...artifact.meta.judgingCompleteness,aggregatesAllowed:false,judgedRows:199};
      writeFileSync(incomplete,`import {writeFileSync} from 'node:fs';writeFileSync(${JSON.stringify(artifactPath)},${JSON.stringify(JSON.stringify(artifact))});console.log('budget exhausted; partial artifact retained');`);
      writeFileSync(candidate,`import {writeFileSync} from 'node:fs';writeFileSync(${JSON.stringify(path.join(root,'candidate-invoked'))},'yes');`);
      const env=freezeFixture(root,plan);
      writeFileSync(path.join(root,'plan.json'),JSON.stringify(plan));
      const planSha256=env.PAIRED_AUTHORIZED_SHA256;
      writeFileSync(path.join(root,'receipt.json'),JSON.stringify({schema:'qa-paired-collection-receipt-v1',planSha256,rows:200,
        artifacts:{baseline:artifactPath,candidate:path.join(root,'candidate.json')}}));
      await expect(withLaunchCleanup(manager=>runLaunchSteps(manager,[
        ()=>executeFrozen('baselineJudge',manager,env),()=>executeFrozen('candidateJudge',manager,env)
      ]),{timeoutMs:600})).rejects.toThrow(/suppresses aggregates/);
      expect(existsSync(path.join(root,'baselineJudge.started.json'))).toBe(true);
      expect(readFileSync(path.join(root,'baselineJudge.log'),'utf8')).toContain('budget exhausted');
      expect(existsSync(path.join(root,'candidateJudge.started.json'))).toBe(false);
      expect(existsSync(path.join(root,'candidate-invoked'))).toBe(false);
      expect(JSON.parse(readFileSync(artifactPath,'utf8')).summary).toBe(null);
      await expect(withLaunchCleanup(manager=>executeFrozen('candidateJudge',manager,env),{timeoutMs:600}))
        .rejects.toThrow(/suppresses aggregates/);
      expect(existsSync(path.join(root,'candidateJudge.started.json'))).toBe(false);
    } finally {rmSync(root,{recursive:true,force:true});}
  },10_000);

  it.each(['missing-completeness','unattempted','incomplete','ids','comparable','verdict','summary'])(
    'rejects stored judging with %s evidence',problem=>{
      const plan={selected:{ids:Array.from({length:200},(_,i)=>`case-${i}`),idsSha256:sha,contentSha256:sha}};
      const artifact=completeArtifact(plan);
      if(problem==='missing-completeness') delete artifact.meta.judgingCompleteness;
      if(problem==='unattempted') artifact.meta.judgeStored.unattemptedIds=['case-199'];
      if(problem==='incomplete') artifact.meta.judgeStored.incompleteIds=['case-199'];
      if(problem==='ids') artifact.rows[199].id='other-case';
      if(problem==='comparable') artifact.meta.comparable=false;
      if(problem==='verdict') artifact.rows[199].verdict=null;
      if(problem==='summary') artifact.summary=null;
      expect(()=>validateStoredJudgeArtifact(artifact,plan)).toThrow();
    });

  it('retains a replacement checkout with the same path and revision',async()=>{
    const root=mkdtempSync(path.join(os.tmpdir(),'paired-launch-replacement-'));
    try {
      const repository=path.join(root,'repository');mkdirSync(repository);
      const common=path.join(repository,'.git');mkdirSync(common);
      const administration=path.join(common,'worktrees','server');mkdirSync(administration,{recursive:true});
      const worktree=path.join(root,'server');mkdirSync(worktree);
      const dotGit=path.join(worktree,'.git');writeFileSync(dotGit,`gitdir: ${administration}\n`);
      writeFileSync(path.join(administration,'gitdir'),`${dotGit}\n`);
      const revision='a'.repeat(40);
      const git=(cwd,...args)=>args.includes('--show-toplevel') ? worktree : args.includes('--git-common-dir') ? common :
        args.includes('--absolute-git-dir') ? administration : args.includes('HEAD') ? revision : `worktree ${realpathSync(worktree)}\0`;
      const inspect=(tree,repo)=>inspectWorktreeIdentity(tree,repo,{git});
      const identity=inspect(worktree,repository);
      writeFileSync(path.join(root,'owned-processes.json'),JSON.stringify(emptyJournal()));
      writeFileSync(path.join(root,'worktrees-created.json'),JSON.stringify([{root:worktree,revision,identity}]));
      // Replace the directory without changing the path, revision, administration observations, or Git membership.
      const {renameSync}=await import('node:fs');renameSync(worktree,path.join(root,'original-server'));
      mkdirSync(worktree);writeFileSync(dotGit,`gitdir: ${administration}\n`);
      const synthetic=path.join(worktree,'.dev.vars');writeFileSync(synthetic,'SYNTHETIC=true\n');
      writeFileSync(path.join(root,'plan.json'),'retained plan');
      let removed=false;
      await expect(removeLaunchWorktrees({PAIRED_RUN:root,PAIRED_REPO:repository,PAIRED_BS:worktree},{
        checkListeners:()=>{},readWorktreeIdentity:inspect,removeWorktree:()=>{removed=true;}
      })).rejects.toThrow(/creation identity changed/);
      expect(existsSync(synthetic)).toBe(true);
      expect(existsSync(path.join(root,'plan.json'))).toBe(true);
      expect(removed).toBe(false);
    } finally {rmSync(root,{recursive:true,force:true});}
  });
});

it('records the same guarded agent environment for assembly and a later phase',async()=>{
  const root=mkdtempSync(path.join(os.tmpdir(),'paired-launch-environment-'));
  try {
    const identity=fileURLToPath(new URL('../eval/lib/executable-identity.mjs',import.meta.url));
    const script=path.join(root,'environment.mjs');
    writeFileSync(script,`import {agentEnvironmentIdentity} from ${JSON.stringify(identity)};
import {writeFileSync} from 'node:fs';writeFileSync(process.argv[2],agentEnvironmentIdentity().sha256);`);
    await withLaunchCleanup(async manager=>{
      for(const name of ['assembly','later-phase']) {
        const running=manager.spawn([process.execPath,script,path.join(root,name)],{cwd:root});
        expect((await running.completion).code).toBe(0);
      }
    },{timeoutMs:600});
    expect(readFileSync(path.join(root,'assembly'),'utf8')).toBe(readFileSync(path.join(root,'later-phase'),'utf8'));
  } finally {rmSync(root,{recursive:true,force:true});}
},10_000);

describe('paired plan assembly',()=>{
  const INSTRUMENTS=['run-qa.mjs','paired-verdict.mjs','paired-collection-supervisor.mjs','paired-collection-control.mjs',
    'exact-old-runtime-adapter.mjs','probe-remote-identities.mjs','check-paired-capacity.mjs',
    'run-p6-judge-self-test.mjs','judge.mjs','evidence-pack.mjs','re-judge.mjs','cases.json'];
  const judge={model:JUDGE_MODEL,rubric:JUDGE_RUBRIC,packVersion:PACK_VERSION};

  // Simulated launch records around real instrument bytes and the real corpus.
  function assemblyFixture(judgeConstants=judge) {
    const root=mkdtempSync(path.join(os.tmpdir(),'paired-assembly-'));
    const revision='a'.repeat(40);
    const env={...launchEnvironment(revision,{}),PAIRED_RUN:path.join(root,'run'),PAIRED_PROCESS_GUARD:PROCESS_GUARD};
    for (const [name,key] of [['baseline-runner','PAIRED_BR'],['candidate-runner','PAIRED_CR'],
      ['baseline-server','PAIRED_BS'],['candidate-server','PAIRED_CS']]) env[key]=path.join(root,name);
    mkdirSync(env.PAIRED_RUN);
    for (const runner of [env.PAIRED_BR,env.PAIRED_CR]) {
      mkdirSync(path.join(runner,'eval/qa'),{recursive:true});
      for (const name of INSTRUMENTS) copyFileSync(path.resolve('eval/qa',name),path.join(runner,'eval/qa',name));
    }
    for (const server of [env.PAIRED_BS,env.PAIRED_CS]) {
      mkdirSync(server);
      writeFileSync(path.join(server,'.dev.vars'),'ZETA=two\nALPHA=one\n');
    }
    copyFileSync(path.resolve('.agents/rounds/2026-10-01-backlog-closeout/paired-stability-register.json'),
      path.join(env.PAIRED_RUN,'paired-stability-register.json'));
    writeFileSync(path.join(env.PAIRED_RUN,'capacity.json'),
      `${JSON.stringify(acceptedCapacityArtifact(new Date().toISOString()),null,2)}\n`);
    writeFileSync(path.join(env.PAIRED_RUN,'stable.sha256'),`${'d'.repeat(64)}\n`);
    const salt='9'.repeat(64);
    const selected=selectionSnapshot(env.PAIRED_CR,stratifiedSample);
    expect(selectionSnapshot(env.PAIRED_BR,stratifiedSample)).toEqual(selected);
    const claudePath=path.join(env.PAIRED_RUN,'claude-bin/claude');
    const binary={resolvedPath:claudePath,sha256:'e'.repeat(64)};
    const environment={sha256:'f'.repeat(64)};
    const plan=buildPairedPlan({env,selected,binary,environment,
      immutableClaude:{schema:'qa-paired-claude-pin-v1',claudePath,sha256:binary.sha256},
      register:loadJudgeStabilityRegister(path.join(env.PAIRED_RUN,'paired-stability-register.json'),{verifySources:false}),
      capacityContract:PAIRED_CAPACITY_CONTRACT,surfaces:{baseline:'1'.repeat(64),candidate:'2'.repeat(64)},
      devVars:{salt,...devVarsIdentity(env.PAIRED_BS,salt)},judge:judgeConstants});
    const inspectWorktree=worktree=>({root:worktree,commonDir:root,
      revision:worktree===env.PAIRED_BS ? env.PAIRED_BASE : revision});
    return {root,env,plan,inspectWorktree};
  }

  function completeP6(plan) {
    const hashes=plan.arms.candidate.inputHashes;
    writeFileSync(plan.p6.summaryArtifactPath,`${JSON.stringify(passingP6Summary({wrapperSha256:plan.p6.wrapperSha256,
      runnerRevision:plan.p6.command[plan.p6.command.indexOf('--runner-revision')+1],claudePath:plan.p6.claudePath,
      claudeBinarySha256:hashes.agentBinarySha256,claudeEnvironmentSha256:hashes.agentEnvironmentSha256}),null,2)}\n`);
  }

  it('freezes a plan that passes every runner parser and the complete supervisor validator',()=>{
    const {root,env,plan,inspectWorktree}=assemblyFixture();
    try {
      expect(plan.flipRejudge.judgeTuple).toEqual({...judge,judgePanel:1});
      expect(plan.selected.activeCorpusCount).toBeGreaterThanOrEqual(200);
      assertPlanCommandSyntax(plan,{assertRunQaCliSyntax,parseRejudge,parseP6SelfTestCli});
      // P6 runs after assembly; its summary folder is the launch-record folder that launchPaired creates.
      expect(path.dirname(plan.p6.summaryArtifactPath)).toBe(env.PAIRED_RUN);
      expect(()=>assertP6OutputAvailable(plan.p6.summaryArtifactPath)).not.toThrow();
      completeP6(plan);
      expect(validatePairedCollectionPlan(plan,{inspectWorktree})).toBe(plan);
      expect(validateAuthorizedPairedCollectionPlan(plan,pairedCollectionPlanSha256(plan))).toBe(pairedCollectionPlanSha256(plan));
    } finally {rmSync(root,{recursive:true,force:true});}
  });

  it.each([
    ['a stale rubric',{rubric:'v2.10'}],
    ['another pack',{packVersion:'p5'}],
    ['another judge model',{model:'claude-opus-5'}]
  ])('rejects a flip tuple with %s',(_,change)=>{
    const {root,plan,inspectWorktree}=assemblyFixture(judge);
    try {
      completeP6(plan);
      const wrong=structuredClone(plan);
      Object.assign(wrong.flipRejudge.judgeTuple,change);
      expect(()=>validatePairedCollectionPlan(wrong,{inspectWorktree})).toThrow(/flipRejudge\.judgeTuple does not match/);
    } finally {rmSync(root,{recursive:true,force:true});}
  });

  it('rejects a plan assembled from a stale rubric constant',()=>{
    const {root,plan,inspectWorktree}=assemblyFixture({...judge,rubric:'v2.10'});
    try {
      completeP6(plan);
      expect(()=>validatePairedCollectionPlan(plan,{inspectWorktree})).toThrow(/flipRejudge\.judgeTuple does not match/);
    } finally {rmSync(root,{recursive:true,force:true});}
  });
});
