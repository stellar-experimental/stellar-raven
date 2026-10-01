import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, openSync, closeSync,
  readFileSync, realpathSync, rmSync, writeFileSync, statSync, lstatSync } from "node:fs";
import { createConnection } from "node:net";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { executeFrozen } from "./execute-frozen.mjs";
import { assertListenersStopped, processTable, withLaunchCleanup } from "./paired-launch-runtime.mjs";

const ROUND = ".agents/rounds/2026-10-01-backlog-closeout";
export const PORTS = [8788, 8789, 8790, 8791];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function launchEnvironment(revision, original = process.env) {
  assert.match(revision, /^[a-f0-9]{40}$/, "supply the final clean launch revision");
  const base = "/Users/kalepail/Desktop/stellar-raven-codemode-worktrees";
  const env = { ...original,
    PAIRED_REPO: "/Users/kalepail/Desktop/stellar-raven-codemode",
    PAIRED_REV: revision, PAIRED_BASE: "90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0",
    PAIRED_BR: `${base}/paired-baseline-runner`, PAIRED_CR: `${base}/paired-candidate-runner`,
    PAIRED_BS: `${base}/paired-baseline-server`, PAIRED_CS: `${base}/paired-candidate-server`,
    PAIRED_RUN: "/private/tmp/stellar-raven-paired-launch"
  };
  delete env.QA_AGENT_PROMPT_APPEND;
  return env;
}

export async function freeCommand(manager, env, name, command, cwd) {
  const stdout = openSync(`${env.PAIRED_RUN}/${name}.log`, "wx", 0o600);
  let stderr;
  try {
    stderr = openSync(`${env.PAIRED_RUN}/${name}.stderr.log`, "wx", 0o600);
    const { completion } = manager.spawn(command, { cwd, env, name,
      stdio: ["ignore", stdout, stderr] });
    const result = await completion;
    assert.equal(result.code, 0, `${name} failed; retain its logs`);
  } finally { closeSync(stdout); if (stderr !== undefined) closeSync(stderr); }
}

async function startServer(manager, env, name, cwd, args, port) {
  const fd = openSync(`${env.PAIRED_RUN}/${name}.log`, "wx", 0o600);
  let running;
  try { running = manager.spawn([process.execPath, ...args], { cwd, env, name,
    stdio: ["ignore", fd, fd] }); } finally { closeSync(fd); }
  for (let attempt = 0; attempt < 60; attempt++) {
    if (running.child.exitCode !== null || running.child.signalCode !== null) {
      throw new Error(`${name} exited during startup`);
    }
    const ready = await new Promise((resolve) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => resolve(false));
      socket.setTimeout(500, () => { socket.destroy(); resolve(false); });
    });
    if (ready) return;
    await wait(500);
  }
  throw new Error(`${name} did not bind within its startup deadline`);
}

export async function runLaunchSteps(manager, steps) {
  for (const step of steps) {
    if (manager.stopping) throw new Error("launch cleanup has started");
    await step(manager);
  }
}

export async function launchPaired(env) {
  mkdirSync(env.PAIRED_RUN, { mode: 0o700 });
  const load = (name) => import(pathToFileURL(`${env.PAIRED_CR}/${name}`));
  // The cleanup handlers exist before installs, servers, probes, or paid children start.
  return withLaunchCleanup(async (manager) => runLaunchSteps(manager, [
    async () => {
      const created = [];
      const ownershipPath = `${env.PAIRED_RUN}/worktrees-created.json`;
      writeFileSync(ownershipPath, "[]\n", {flag:"wx",mode:0o600});
      for (const [name, root, revision] of [
        ["baseline-runner", env.PAIRED_BR, env.PAIRED_REV],
        ["candidate-runner", env.PAIRED_CR, env.PAIRED_REV],
        ["baseline-server", env.PAIRED_BS, env.PAIRED_BASE],
        ["candidate-server", env.PAIRED_CS, env.PAIRED_REV]
      ]) {
        await freeCommand(manager, env, `${name}-worktree`, ["git", "-C", env.PAIRED_REPO,
          "worktree", "add", "--detach", root, revision], env.PAIRED_REPO);
        created.push({root,revision,identity:inspectWorktreeIdentity(root,env.PAIRED_REPO)});
        writeFileSync(ownershipPath, `${JSON.stringify(created,null,2)}\n`, {mode:0o600});
        await freeCommand(manager, env, `${name}-install`, ["npm", "ci"], root);
      }
    },
    async () => {
      copyFileSync(`${env.PAIRED_REPO}/.dev.vars`, `${env.PAIRED_BS}/.dev.vars`);
      copyFileSync(`${env.PAIRED_REPO}/.dev.vars`, `${env.PAIRED_CS}/.dev.vars`);
      copyFileSync(`${env.PAIRED_CR}/${ROUND}/paired-stability-register.json`,
        `${env.PAIRED_RUN}/paired-stability-register.json`);
      const { devVarsIdentity } = await load("eval/qa/paired-collection-supervisor.mjs");
      const salt = randomBytes(32).toString("hex");
      const identity = devVarsIdentity(env.PAIRED_BS, salt);
      assert.deepEqual(devVarsIdentity(env.PAIRED_CS, salt), identity);
      writeFileSync(`${env.PAIRED_RUN}/dev-vars-identity.json`, `${JSON.stringify({salt,...identity},null,2)}\n`,
        { flag: "wx", mode: 0o600 });
    },
    async () => {
      assertListenersStopped(PORTS);
      await startServer(manager, env, "baseline-wrangler", env.PAIRED_BS,
        [`${env.PAIRED_BS}/node_modules/wrangler/bin/wrangler.js`, "dev", "--host", "localhost", "--port", "8791"], 8791);
      await startServer(manager, env, "baseline-adapter", env.PAIRED_BR,
        ["eval/qa/exact-old-runtime-adapter.mjs", "--port", "8789", "--upstream-port", "8791",
          "--source-revision", env.PAIRED_BASE, "--adapter-revision", env.PAIRED_REV, "--mode", "add-missing"], 8789);
      await startServer(manager, env, "candidate-wrangler", env.PAIRED_CS,
        ["scripts/run-eval-server.mjs", "--port", "8790"], 8790);
      await startServer(manager, env, "candidate-adapter", env.PAIRED_CR,
        ["eval/qa/exact-old-runtime-adapter.mjs", "--port", "8788", "--upstream-port", "8790",
          "--source-revision", env.PAIRED_REV, "--adapter-revision", env.PAIRED_REV, "--mode", "verify-native"], 8788);
      const { dualBoundServerIdentity } = await load("eval/lib/bound-server-identity.mjs");
      const { fetchAdapterAttestation, adapterImplementationSha256 } = await load("eval/qa/exact-old-runtime-adapter.mjs");
      const records = {};
      for (const arm of ["baseline", "candidate"]) {
        const baseline = arm === "baseline";
        const sourceRevision = baseline ? env.PAIRED_BASE : env.PAIRED_REV;
        const identity = dualBoundServerIdentity({ adapterPort: baseline ? 8789 : 8788,
          upstreamPort: baseline ? 8791 : 8790, adapterRevision: env.PAIRED_REV, upstreamRevision: sourceRevision });
        const attestation = await fetchAdapterAttestation(identity.adapter.port, {
          mode: baseline ? "add-missing" : "verify-native", sourceRevision,
          implementationSha256: adapterImplementationSha256(), upstreamPort: identity.upstream.port,
          upstreamIdentity: identity.upstream
        });
        records[arm] = {identity,attestation};
      }
      writeFileSync(`${env.PAIRED_RUN}/listeners.json`, `${JSON.stringify(records,null,2)}\n`, {flag:"wx",mode:0o600});
    },
    async () => {
      for (const arm of ["baseline", "candidate"]) {
        const baseline = arm === "baseline";
        const runner = baseline ? env.PAIRED_BR : env.PAIRED_CR;
        await freeCommand(manager, env, `${arm}-surface`, [process.execPath, "eval/report-live-surface.mjs",
          "--port", baseline ? "8789" : "8788", "--expect-source-revision", baseline ? env.PAIRED_BASE : env.PAIRED_REV,
          "--label", arm, "--json", `${env.PAIRED_RUN}/${arm}-surface.json`], runner);
      }
    },
    async () => freeCommand(manager, env, "capacity", [process.execPath,
      "eval/qa/check-paired-capacity.mjs", "--out", `${env.PAIRED_RUN}/capacity.json`], env.PAIRED_CR),
    async () => {
      await freeCommand(manager, env, "stable", [process.execPath,
        "eval/qa/probe-remote-identities.mjs", "--stable-sha256"], env.PAIRED_CR);
      copyFileSync(`${env.PAIRED_RUN}/stable.log`, `${env.PAIRED_RUN}/stable.sha256`);
    },
    async () => {
      await freeCommand(manager, env, "assembly", [process.execPath, `${ROUND}/assemble-paired-plan.mjs`], env.PAIRED_CR);
      await freeCommand(manager, env, "plan-hash", ["npm", "--silent", "run",
        "eval:qa:paired:plan-sha256", "--", `${env.PAIRED_RUN}/plan.json`], env.PAIRED_CR);
      copyFileSync(`${env.PAIRED_RUN}/plan-hash.log`, `${env.PAIRED_RUN}/plan.sha256`);
    },
    async () => {
      const text = readFileSync(`${env.PAIRED_CR}/.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md`, "utf8");
      const authorization = text.split("```text\nAUTHORIZATION:")[1].split("```")[0];
      const stops = text.split("## Stop rules\n")[1].split("## Result review requirements")[0];
      const decisions = Array.from({length:10}, (_,i) => `Decision ${i+1}: <owner answer>`).join("\n");
      const {launchProcessGuard}=JSON.parse(readFileSync(`${env.PAIRED_RUN}/plan.json`,'utf8'));
      const guardRecord=`Launch process guard: ${launchProcessGuard.path} ${launchProcessGuard.sha256}`;
      writeFileSync(`${env.PAIRED_RUN}/authorization.txt`, `AUTHORIZATION:${authorization}\n${decisions}\n${guardRecord}\n\nStop rules\n${stops}`,
        {flag:"wx",mode:0o600});
      const hash = readFileSync(`${env.PAIRED_RUN}/plan.sha256`, "utf8").trim();
      console.log(`Canonical plan SHA-256: ${hash}`);
      console.log(`Fill and sign ${env.PAIRED_RUN}/authorization.txt. Confirm all decisions and command arrays.`);
      const terminal = createInterface({input:process.stdin,output:process.stdout});
      let answer;
      try { answer = await terminal.question("Enter the owner's signed canonical SHA-256: "); }
      finally { terminal.close(); }
      assert.equal(answer.trim(), hash, "the owner signature did not confirm this plan hash");
      const record = readFileSync(`${env.PAIRED_RUN}/authorization.txt`, "utf8");
      assert.ok(record.includes(hash) && /^Signature: AUTHORIZED .+$/m.test(record), "the external signature is missing");
      assert.ok(!/<[^>]+>/.test(record), "the authorization still contains blank fields");
      assert.ok(/^Decision 5: ACCEPTED(?:\s|$)/m.test(record), "decision 5 lacks explicit owner acceptance");
      env.PAIRED_AUTHORIZED_SHA256 = hash;
      assert.ok([0,6].includes(new Date().getUTCDay()), "paid launch requires a weekend UTC day");
      const { capacityRejectionReasons, PAIRED_CAPACITY_CONTRACT } = await load("eval/qa/check-paired-capacity.mjs");
      const capacity = JSON.parse(readFileSync(`${env.PAIRED_RUN}/capacity.json`, "utf8"));
      assert.deepEqual(capacityRejectionReasons(capacity), []);
      const age = Date.now() - Date.parse(capacity.completedAt);
      assert.ok(age >= 0 && age <= PAIRED_CAPACITY_CONTRACT.freshnessMs, "capacity expired before P6");
    },
    async () => executeFrozen("p6", manager, env),
    async () => executeFrozen("collection", manager, env),
    async () => manager.stopServers(),
    async () => {
      await executeFrozen("baselineJudge", manager, env);
      await executeFrozen("candidateJudge", manager, env);
    },
    async () => {
      await executeFrozen("compare", manager, env);
      const {artifacts} = JSON.parse(readFileSync(`${env.PAIRED_RUN}/receipt.json`, "utf8"));
      await freeCommand(manager, env, "recalibration", [process.execPath, "eval/qa/validate-paired-verdict.mjs",
        "--recalibrate", artifacts.baseline, artifacts.candidate], env.PAIRED_CR);
    },
    async () => {
      await executeFrozen("baselineFlip", manager, env);
      await executeFrozen("candidateFlip", manager, env);
    },
    async () => console.log("Review all 400 rows and retain evidence before using --remove-worktrees.")
  ]), {journalPath:`${env.PAIRED_RUN}/owned-processes.json`,listeners:PORTS});
}

export function inspectWorktreeIdentity(root,repository,{git=(cwd,...args)=>execFileSync('git',[
  '-C',cwd,...args],{encoding:'utf8',timeout:1_000}).trim()}={}) {
  const rootReal=realpathSync(root);
  assert.equal(realpathSync(git(root,'rev-parse','--show-toplevel')),rootReal);
  const common=realpathSync(git(root,'rev-parse','--path-format=absolute','--git-common-dir'));
  assert.equal(common,realpathSync(git(repository,'rev-parse','--path-format=absolute','--git-common-dir')),
    'the worktree belongs to another repository');
  const administration=realpathSync(git(root,'rev-parse','--absolute-git-dir'));
  const relative=path.relative(path.join(common,'worktrees'),administration);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative),'the worktree administration is not owned');
  assert.ok(git(repository,'worktree','list','--porcelain','-z').split('\0')
    .includes(`worktree ${rootReal}`),'the repository does not list this worktree');
  const dotGit=path.join(rootReal,'.git');
  assert.ok(lstatSync(dotGit).isFile(),'the worktree administration link is not a file');
  assert.equal(realpathSync(readFileSync(path.join(administration,'gitdir'),'utf8').trim()),realpathSync(dotGit),
    'the administration backlink names another worktree');
  const creationIdentity=file=>{
    const record=statSync(file,{bigint:true});
    return {path:realpathSync(file),device:String(record.dev),inode:String(record.ino),birthtimeNs:String(record.birthtimeNs)};
  };
  return {revision:git(root,'rev-parse','HEAD'),root:creationIdentity(rootReal),
    administration:creationIdentity(administration),link:creationIdentity(dotGit),repository:creationIdentity(common)};
}

export async function removeLaunchWorktrees(env, { checkListeners = assertListenersStopped,
  removeWorktree, readWorktreeIdentity=inspectWorktreeIdentity, verifyWorktree = ({root,revision,identity}) => {
    assert.ok(identity,'the worktree creation identity is missing; retain all files');
    const current=readWorktreeIdentity(root,env.PAIRED_REPO);
    assert.equal(current.revision,revision,'the worktree revision changed; retain all files');
    assert.deepEqual(current,identity,'the worktree creation identity changed; retain all files');
  } } = {}) {
  // Never kill an old recorded PID here. A later run can reuse that PID.
  const journal = JSON.parse(readFileSync(`${env.PAIRED_RUN}/owned-processes.json`, "utf8"));
  assert.equal(journal.schema,'qa-paired-launch-processes-v2','the process ownership record is invalid; retain all files');
  assert.equal(journal.cleanup?.complete,true,
    `cleanup is unresolved; retain worktrees and records for manual action: ${JSON.stringify(journal.cleanup)}`);
  const table = processTable();
  for (const row of journal.identities) {
    assert.ok(!table.some((current) => current.pid === row.pid && current.startedAt === row.startedAt &&
      !current.state.startsWith("Z")), "an owned launch process remains active");
  }
  for (const group of [...journal.groups,...journal.retiredGroups]) {
    const live=table.filter(row=>row.pgid===group.pgid && !row.state.startsWith('Z'));
    assert.ok(!live.length,
      `process-group ownership is unresolved; retain worktrees for manual action: ${JSON.stringify({processes:live,listeners:PORTS})}`);
  }
  checkListeners(PORTS);
  const created = JSON.parse(readFileSync(`${env.PAIRED_RUN}/worktrees-created.json`, "utf8"));
  const allowed = new Set([env.PAIRED_BR,env.PAIRED_CR,env.PAIRED_BS,env.PAIRED_CS]);
  assert.ok(created.every(({root}) => allowed.has(root)), "the worktree ledger names an unknown root");
  for (const record of created) await verifyWorktree(record);
  const ownedRoots = new Set(created.map(({root}) => root));
  for (const [arm, runner] of [["baseline", env.PAIRED_BR], ["candidate", env.PAIRED_CR]]) {
    if (!ownedRoots.has(runner)) continue;
    const results = `${runner}/eval/qa/results`;
    if (existsSync(results)) cpSync(results, `${env.PAIRED_RUN}/${arm}-results`, {recursive:true,errorOnExist:true,force:false});
  }
  for (const file of ["plan.json", "dev-vars-identity.json"]) rmSync(`${env.PAIRED_RUN}/${file}`, {force:true});
  for (const root of [env.PAIRED_BS,env.PAIRED_CS].filter((root) => ownedRoots.has(root))) {
    rmSync(`${root}/.dev.vars`, {force:true});
  }
  if (removeWorktree) {
    for (const {root} of created) await removeWorktree(root);
  } else {
    await withLaunchCleanup(async (manager) => {
      for (const {root} of created) {
        await freeCommand(manager, env, `remove-${path.basename(root)}`, ["git", "-C", env.PAIRED_REPO,
          "worktree", "remove", root], env.PAIRED_REPO);
      }
    }, {listeners:PORTS});
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const args = process.argv.slice(2);
  if (!["--revision", "--remove-worktrees"].includes(args[0]) || args.length !== 2) {
    console.error("usage: paired-launch.mjs --revision <clean-40-character-sha> | --remove-worktrees <same-sha>");
    process.exitCode = 1;
  } else {
    const env = launchEnvironment(args[1]);
    (args[0] === "--revision" ? launchPaired(env) : removeLaunchWorktrees(env))
      .catch((error) => {console.error(error.message);process.exitCode=1;});
  }
}
