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
