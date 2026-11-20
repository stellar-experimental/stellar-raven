#!/usr/bin/env node
/**
 * Deploy preflight (runs as npm `predeploy` before `wrangler deploy`).
 * `wrangler deploy` bundles the working tree, not a commit; refuse unless the tree is
 * clean and HEAD matches fetched `origin/main`. Override with `DEPLOY_ALLOW_UNCLEAN=1`.
 */
import { spawnSync } from "node:child_process";

/** @returns {string[]} Failure messages; empty means safe to deploy. */
export function preflightFailures({ dirty, head, origin, fetchFailed }) {
  const failures = [];
  if (fetchFailed) {
    failures.push("could not reach origin — cannot prove HEAD matches the pushed commit");
  }
  if (dirty) {
    failures.push(`working tree is not clean; wrangler would bundle these changes:\n${dirty}`);
  }
  // Missing refs fail closed rather than skipping the comparison.
  if (!head) failures.push("could not resolve HEAD");
  if (!origin) failures.push("could not resolve origin/main");
  if (head && origin && head !== origin) {
    failures.push(`HEAD (${head.slice(0, 8)}) is not origin/main (${origin.slice(0, 8)})`);
  }
  return failures;
}

function git(...args) {
  const r = spawnSync("git", args, { encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim() };
}

if (process.argv[1] && process.argv[1].endsWith("deploy-preflight.mjs")) {
  if (process.env.DEPLOY_ALLOW_UNCLEAN === "1") {
    console.warn("deploy preflight SKIPPED (DEPLOY_ALLOW_UNCLEAN=1) — deploying the working tree as-is");
    process.exit(0);
  }
  // Fetch before resolving origin/main so a stale local ref cannot pass.
  const fetchFailed = !git("fetch", "--quiet", "origin", "main").ok;
  const failures = preflightFailures({
    fetchFailed,
    dirty: git("status", "--porcelain").out,
    head: git("rev-parse", "HEAD").out,
    origin: git("rev-parse", "origin/main").out
  });

  if (failures.length) {
    console.error("deploy preflight FAILED — refusing to deploy:\n");
    for (const f of failures) console.error(`  - ${f}`);
    console.error(
      "\nwrangler deploy bundles the working tree, not a commit. Commit and push, or" +
        "\ndeploy from a clean checkout pinned to the intended commit." +
        "\nDeliberate off-main deploy: DEPLOY_ALLOW_UNCLEAN=1 npm run deploy"
    );
    process.exit(1);
  }
  console.log("deploy preflight ok — tree clean and HEAD == origin/main");
}
