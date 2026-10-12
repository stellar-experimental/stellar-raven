import { spawnSync } from "node:child_process";

function run(command, args, { spawnSyncImpl = spawnSync, label }) {
  const result = spawnSyncImpl(command, args, {
    encoding: "utf8",
    timeout: 10_000,
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${label}: ${String(result.stderr || result.error?.message || result.status).trim()}`
    );
  }
  return String(result.stdout);
}

export function gitWorktreeIdentity(cwd, options = {}) {
  const revision = run("git", ["-C", cwd, "rev-parse", "HEAD"], {
    ...options,
    label: `git worktree identity for ${cwd}`
  }).trim();
  const status = run("git", ["-C", cwd, "status", "--porcelain=v1", "--untracked-files=all"], {
    ...options,
    label: `git worktree cleanliness for ${cwd}`
  });
  return {
    verification: "git-worktree",
    cwd,
    revision,
    dirty: status.length > 0
  };
}

export function assertStableGitWorktreeIdentity(before, after, { label = "runner worktree" } = {}) {
  if (before?.dirty) throw new Error(`${label}: worktree was dirty before collection`);
  const fields = ["cwd", "revision", "dirty"];
  const changedFields = fields.filter((field) => before?.[field] !== after?.[field]);
  if (after?.dirty || changedFields.length > 0) {
    throw new Error(`${label}: worktree changed during paid calls (${changedFields.join(", ") || "dirty"})`);
  }
  return {
    verification: "git-worktree-stability",
    checkedFields: fields,
    changedFields,
    matches: true
  };
}

export function boundServerIdentity(port, expectedRevision, options = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`bound server identity: invalid port ${port}`);
  }
  if (!/^[a-f0-9]{40}$/.test(String(expectedRevision ?? ""))) {
    throw new Error("bound server identity: expected revision must be a 40-character commit");
  }
  const listenerText = run("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fpc"], {
    ...options,
    label: `bound server identity on port ${port}`
  });
  const pids = [...new Set(listenerText.split(/\r?\n/).filter((line) => /^p\d+$/.test(line)).map((line) => line.slice(1)))];
  if (pids.length !== 1) {
    throw new Error(`bound server identity on port ${port}: expected one listener process, found ${pids.length}`);
  }
  const pid = pids[0];
  const command = listenerText.split(/\r?\n/).find((line) => line.startsWith("c"))?.slice(1) ?? null;
  const cwdText = run("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], {
    ...options,
    label: `bound server identity for pid ${pid}`
  });
  const cwd = cwdText.split(/\r?\n/).find((line) => line.startsWith("n"))?.slice(1);
  if (!cwd) throw new Error(`bound server identity for pid ${pid}: listener cwd is unavailable`);
  const worktree = gitWorktreeIdentity(cwd, options);
  const { revision } = worktree;
  if (revision !== expectedRevision) {
    throw new Error(
      `bound server identity: expected revision ${expectedRevision}, listener cwd ${cwd} is ${revision}`
    );
  }
  if (worktree.dirty) {
    throw new Error(`bound server identity: listener cwd ${cwd} is dirty; refusing paid calls`);
  }
  return {
    verification: "listener-process-cwd",
    port,
    pid: Number(pid),
    command,
    cwd,
    revision,
    dirty: false
  };
}

export function assertStableBoundServerIdentity(before, after) {
  const fields = ["port", "pid", "command", "cwd", "revision", "dirty"];
  const changedFields = fields.filter((field) => before?.[field] !== after?.[field]);
  if (changedFields.length > 0) {
    throw new Error(
      `bound server identity changed during paid calls (${changedFields.join(", ")}); refusing comparison use`
    );
  }
  return {
    verification: "listener-process-stability",
    checkedFields: fields,
    changedFields,
    matches: true
  };
}

export function dualBoundServerIdentity(
  { adapterPort, adapterRevision, upstreamPort, upstreamRevision },
  options = {}
) {
  if (adapterPort === upstreamPort) {
    throw new Error("dual listener identity: adapter and upstream ports must differ");
  }
  const adapter = boundServerIdentity(adapterPort, adapterRevision, options);
  const upstream = boundServerIdentity(upstreamPort, upstreamRevision, options);
  if (adapter.pid === upstream.pid) {
    throw new Error("dual listener identity: adapter and upstream must use different processes");
  }
  if (adapter.cwd === upstream.cwd) {
    throw new Error("dual listener identity: adapter and upstream must use different worktrees");
  }
  return {
    verification: "dual-listener-process-cwd",
    adapter,
    upstream
  };
}

export function assertStableDualBoundServerIdentity(before, after) {
  const adapter = assertStableBoundServerIdentity(before?.adapter, after?.adapter);
  const upstream = assertStableBoundServerIdentity(before?.upstream, after?.upstream);
  return {
    verification: "dual-listener-process-stability",
    adapter,
    upstream,
    matches: true
  };
}

export const SERVER_LOST_CODE = "paired-server-lost";

// Re-read each recorded listener pair and require the same processes. A missing listener, or
// another process on a recorded port, throws. Only local lsof and git commands run; this never
// restarts a server.
export function assertDualBoundServersUnchanged(recordedPairs, { identify = dualBoundServerIdentity } = {}) {
  for (const [label, recorded] of Object.entries(recordedPairs)) {
    try {
      assertStableDualBoundServerIdentity(recorded, identify({
        adapterPort: recorded.adapter.port,
        adapterRevision: recorded.adapter.revision,
        upstreamPort: recorded.upstream.port,
        upstreamRevision: recorded.upstream.revision
      }));
    } catch (error) {
      const lost = new Error(`${label} server stopped answering on its port or changed: ${error.message}`);
      lost.code = SERVER_LOST_CODE;
      throw lost;
    }
  }
}

const PAIRED_ARMS = ["baseline", "candidate"];
const TARGET_FIELDS = ["adapterPort", "adapterRevision", "upstreamPort", "upstreamRevision"];

// `boundServerIdentity` records each listener process ID as a number.
const isProcessId = (pid) => Number.isSafeInteger(pid) && pid > 0;

const pairTarget = (pair) => ({
  adapterPort: pair?.adapter?.port,
  adapterRevision: pair?.adapter?.revision,
  upstreamPort: pair?.upstream?.port,
  upstreamRevision: pair?.upstream?.revision
});

/**
 * Validate a paired launch's `listeners.json` record and return its pair for each arm.
 * The record must name exactly baseline and candidate, with four distinct ports and four
 * distinct listener processes. With `expectedTargets`, each arm's ports and revisions must equal
 * those independent values, so a record cannot omit or substitute a server.
 */
export function pairedListenerPairs(record, expectedTargets = null) {
  const arms = Object.keys(record ?? {}).sort();
  if (JSON.stringify(arms) !== JSON.stringify(PAIRED_ARMS)) {
    throw new Error(`paired listener record must name exactly baseline and candidate; found: ${arms.join(", ") || "none"}`);
  }
  const pairs = {};
  for (const arm of PAIRED_ARMS) {
    const pair = record[arm]?.identity;
    const target = pairTarget(pair);
    if (!Number.isInteger(target.adapterPort) || !Number.isInteger(target.upstreamPort) ||
        !/^[a-f0-9]{40}$/.test(String(target.adapterRevision ?? "")) ||
        !/^[a-f0-9]{40}$/.test(String(target.upstreamRevision ?? "")) ||
        !isProcessId(pair.adapter.pid) || !isProcessId(pair.upstream.pid)) {
      throw new Error(`${arm} listener record is not a recorded listener pair`);
    }
    const expected = expectedTargets?.[arm];
    if (expectedTargets) {
      const changed = TARGET_FIELDS.filter((field) => expected?.[field] !== target[field]);
      if (changed.length) {
        throw new Error(`${arm} listener record does not match the expected targets (${changed.join(", ")})`);
      }
    }
    pairs[arm] = pair;
  }
  const listeners = PAIRED_ARMS.flatMap((arm) => [pairs[arm].adapter, pairs[arm].upstream]);
  if (new Set(listeners.map((listener) => listener.port)).size !== 4 ||
      new Set(listeners.map((listener) => listener.pid)).size !== 4) {
    throw new Error("paired listener record must name four distinct ports and four distinct processes");
  }
  return pairs;
}
