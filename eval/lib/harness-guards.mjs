/**
 * harness-guards.mjs — pre-spend and pre-aggregate guards shared by every
 * agent-spawning eval lane.
 *
 * Two failure modes these guards exist for, both observed:
 *
 * 1. An answering agent spawned inside this repository reads AGENTS.md and
 *    CLAUDE.md as project instructions. Those files describe the measurement
 *    itself, so the agent under test is told how the lane grades it. The
 *    2026-08-26 connector round recorded exactly that leak in both arms
 *    (`.agents/rounds/2026-08-26-connectors-contract.md`).
 * 2. A lane that loses rows still prints a clean percentage. The denominator
 *    shrinks silently and the aggregate reads as full coverage.
 *
 * PURITY: no fs, no spawn, no clock, no network. Callers create their own
 * temporary directories and pass the path in.
 */
import path from "node:path";

/** The explicit MCP server every paid answering agent must connect to. */
export const REQUIRED_MCP_SERVER_NAME = "raven";

/**
 * Claude answering agents need explicit MCP access. Safe mode cannot be used:
 * Claude Code 2.1.247 drops non-SDK MCP servers while safe mode is active.
 */
export function answeringAgentIsolationArgs(environment = {}) {
  if (String(environment.CLAUDE_CODE_SAFE_MODE ?? "").trim()) {
    throw new Error(
      "answering agent: CLAUDE_CODE_SAFE_MODE disables explicit MCP servers; refusing paid calls"
    );
  }
  return ["--setting-sources", "", "--disable-slash-commands"];
}

/** Machine-readable record of the answering-agent isolation contract. */
export function answeringAgentIsolationRecord() {
  return {
    settingSources: [],
    slashCommandsDisabled: true,
    strictMcpConfig: true,
    safeMode: false
  };
}

/**
 * Refuse an answering-agent working directory that sits inside the repository.
 *
 * Neutrality is a property of the path, not of intent: any directory at or
 * below `repoRoot` puts AGENTS.md and CLAUDE.md on the agent's discovery walk.
 *
 * @param {string} cwd       the directory the agent will be spawned in
 * @param {object} options
 * @param {string} options.repoRoot  absolute repository root
 * @param {string} [options.label]   lane name, used in the error text
 */
export function assertNeutralAgentCwd(cwd, { repoRoot, label = "answering agent" }) {
  if (typeof cwd !== "string" || !cwd) {
    throw new Error(`${label}: a neutral working directory is required; got ${JSON.stringify(cwd)}`);
  }
  if (typeof repoRoot !== "string" || !repoRoot) {
    throw new Error(`${label}: repoRoot is required to check working-directory neutrality`);
  }
  const resolvedCwd = path.resolve(cwd);
  const resolvedRoot = path.resolve(repoRoot);
  const inside =
    resolvedCwd === resolvedRoot || resolvedCwd.startsWith(`${resolvedRoot}${path.sep}`);
  if (inside) {
    throw new Error(
      `${label}: working directory ${resolvedCwd} is inside the repository (${resolvedRoot}). ` +
        `The agent would read AGENTS.md/CLAUDE.md as project instructions and be told how this lane grades it. ` +
        `Spawn it in an empty temporary directory instead.`
    );
  }
  return resolvedCwd;
}

/**
 * Pre-spend plan check. A duplicated id double-spends silently and then
 * corrupts every per-id join downstream.
 */
export function assertRunPlan(ids, { label = "run" } = {}) {
  const list = Array.isArray(ids) ? ids.map(String) : [];
  if (list.length === 0) throw new Error(`${label}: no cases selected — refusing to spawn agents`);
  const seen = new Set();
  const duplicates = new Set();
  for (const id of list) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  if (duplicates.size) {
    throw new Error(
      `${label}: duplicate case ids would each be answered twice and collapse on join: ${[...duplicates].join(", ")}`
    );
  }
  return { caseCount: list.length };
}

/**
 * Row-count and denominator facts for one collected lane.
 *
 * `complete` is about presence: every expected id produced exactly one row.
 * `aggregatesAllowed` is stricter: when the lane also judges, every collected
 * row must additionally carry a verdict. An aggregate printed over anything
 * less reports a denominator the run did not actually measure.
 *
 * @param {object} options
 * @param {string[]} options.expectedIds  ids the lane planned to run, in order
 * @param {Array<object>} options.rows    collected rows
 * @param {boolean} [options.judging]     whether this lane also judged
 * @param {number} [options.repeat]       replicates per id (default 1)
 */
export function runCompleteness({ expectedIds, rows, judging = false, repeat = 1 }) {
  const planned = (Array.isArray(expectedIds) ? expectedIds : []).map(String);
  const collected = Array.isArray(rows) ? rows : [];
  const expectedRows = planned.length * repeat;
  const counts = new Map();
  for (const row of collected) {
    const id = String(row?.id ?? "");
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const missingIds = planned.filter((id) => (counts.get(id) ?? 0) < repeat);
  const unexpectedIds = [...counts.keys()].filter((id) => !planned.includes(id));
  const overRunIds = planned.filter((id) => (counts.get(id) ?? 0) > repeat);

  const judgedRows = collected.filter((row) => typeof row?.verdict?.score === "string").length;
  const agentFailureRows = collected.filter((row) => row?.agent?.failure != null).length;
  const errorVerdictRows = collected.filter((row) => row?.verdict?.score === "error").length;

  const reasons = [];
  if (collected.length !== expectedRows) {
    reasons.push(`collected ${collected.length} row(s), expected ${expectedRows}`);
  }
  if (missingIds.length) reasons.push(`missing ids: ${missingIds.join(", ")}`);
  if (unexpectedIds.length) reasons.push(`unplanned ids: ${unexpectedIds.join(", ")}`);
  if (overRunIds.length) reasons.push(`repeated beyond --repeat: ${overRunIds.join(", ")}`);
  const complete = reasons.length === 0;

  const aggregateReasons = [...reasons];
  if (judging && judgedRows !== collected.length) {
    aggregateReasons.push(`${collected.length - judgedRows} collected row(s) carry no verdict`);
  }

  return {
    expectedCases: planned.length,
    repeat,
    expectedRows,
    collectedRows: collected.length,
    missingIds,
    unexpectedIds,
    overRunIds,
    judgedRows,
    agentFailureRows,
    errorVerdictRows,
    complete,
    aggregatesAllowed: aggregateReasons.length === 0,
    reasons: aggregateReasons
  };
}

/** Loud, specific notice printed in place of a suppressed aggregate. */
export function formatCompletenessNotice(completeness, { label = "lane" } = {}) {
  return [
    `AGGREGATES SUPPRESSED — ${label} is incomplete, not smaller.`,
    `  expected ${completeness.expectedRows} row(s) over ${completeness.expectedCases} case(s)` +
      `${completeness.repeat > 1 ? ` × ${completeness.repeat} replicate(s)` : ""}; collected ${completeness.collectedRows}.`,
    ...completeness.reasons.map((reason) => `  - ${reason}`),
    `  Per-row and paired per-case reads stay valid. Any percentage over this run does not.`
  ].join("\n");
}

/** Throw instead of reporting. For callers with nothing paid left to lose. */
export function assertRunComplete(completeness, { label = "lane" } = {}) {
  if (!completeness.aggregatesAllowed) {
    throw new Error(formatCompletenessNotice(completeness, { label }));
  }
  return completeness;
}
