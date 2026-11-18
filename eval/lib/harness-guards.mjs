/**
 * harness-guards.mjs — pre-spend and pre-aggregate guards shared by every
 * agent-spawning eval lane.
 *
 * Guard requirements:
 *
 * 1. Spawn answering agents outside the repository so project instructions
 *    cannot reveal the measurement contract to the agent under test.
 * 2. Require every selected row before printing an aggregate. Missing rows
 *    must not silently shrink the denominator.
 * 3. Reject unsupported CLI syntax before a paid call so measurement flags
 *    cannot be silently ignored.
 * 4. Refuse a Claude Code run that would bill an API key instead of the
 *    subscription (`assertClaudeSubscription`).
 *
 * PURITY: no fs, no clock, no network. The one process spawn is
 * `assertClaudeSubscription`'s `claude auth status --json`, injectable for
 * tests. Callers create their own temporary directories and pass the path in.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

/** The explicit MCP server every paid answering agent must connect to. */
export const REQUIRED_MCP_SERVER_NAME = "raven";

/** Accept only declared spaced-value and bare-boolean CLI forms. */
export function assertFailClosedCliSyntax(
  args,
  { valueFlags, booleanFlags, label = "command" }
) {
  const values = new Set(valueFlags);
  const booleans = new Set(booleanFlags);
  for (const flag of values) {
    if (booleans.has(flag)) {
      throw new Error(`${label}: ${flag} cannot be both a value flag and a boolean flag`);
    }
  }

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (values.has(arg)) {
      const value = args[++index];
      if (value === undefined || value === "" || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }
      continue;
    }
    if (booleans.has(arg)) continue;

    if (arg.startsWith("--")) {
      const equalsIndex = arg.indexOf("=");
      if (equalsIndex !== -1) {
        const flag = arg.slice(0, equalsIndex);
        if (values.has(flag)) {
          throw new Error(`${flag}=<value> is not supported; use ${flag} <value>`);
        }
        if (booleans.has(flag)) {
          throw new Error(`${flag}=<value> is not supported; use ${flag}`);
        }
      }
      throw new Error(`${label}: unknown flag ${arg}`);
    }

    throw new Error(`${label}: unexpected positional argument ${JSON.stringify(arg)}`);
  }
}

/**
 * Claude answering agents need explicit MCP access. Safe mode cannot be used:
 * Claude Code 2.1.247 drops non-SDK MCP servers while safe mode is active.
 */
export function answeringAgentIsolationArgs(environment = {}) {
  const safeMode = String(environment.CLAUDE_CODE_SAFE_MODE ?? "")
    .trim()
    .toLowerCase();
  if (["1", "true", "yes", "on"].includes(safeMode)) {
    throw new Error(
      "answering agent: CLAUDE_CODE_SAFE_MODE disables explicit MCP servers; refusing paid calls"
    );
  }
  return ["--setting-sources", "", "--disable-slash-commands"];
}

/**
 * Environment variables the Claude Code CLI reads to send inference somewhere other than the
 * first-party endpoint. Checked offline: each name is in the installed binary, and the three
 * `CLAUDE_CODE_USE_*` provider switches (Bedrock, Vertex, Foundry) change `auth status`.
 * A base URL set through a settings file is not in this environment; the probe sees it only
 * when it loads the same setting sources as the child.
 */
const ENDPOINT_OVERRIDE_VARIABLES = [
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_AWS_BASE_URL",
  "ANTHROPIC_BEDROCK_BASE_URL",
  "ANTHROPIC_BEDROCK_MANTLE_BASE_URL",
  "ANTHROPIC_FOUNDRY_BASE_URL",
  "ANTHROPIC_GOOGLE_CLOUD_BASE_URL",
  "ANTHROPIC_VERTEX_BASE_URL"
];
const PROVIDER_SWITCH_VARIABLES = [
  "CLAUDE_CODE_USE_ANTHROPIC_AWS",
  "CLAUDE_CODE_USE_ANTHROPIC_GOOGLE_CLOUD",
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_FOUNDRY",
  "CLAUDE_CODE_USE_GATEWAY",
  "CLAUDE_CODE_USE_MANTLE",
  "CLAUDE_CODE_USE_VERTEX"
];
const FALSE_SWITCH = new Set(["", "0", "false", "no", "off"]);
// Fixed text per known `authMethod`. The value itself is never interpolated.
const AUTH_METHOD_REFUSALS = new Map([
  ["api_key", "the login is an API key"],
  ["oauth_token", "the login is an auth token"],
  ["third_party", "the login is a cloud provider"]
]);

/**
 * Fail closed unless the Claude Code CLI, probed the way its paid child will run, is on the
 * claude.ai subscription at the first-party endpoint. `claude auth status --json` makes no model
 * call. It also requires `apiProvider` to be exactly `firstParty`. An API key, an auth token, a
 * cloud-provider switch or a stored Console login each change `authMethod`, so a positive check catches what a list of variables would miss. An endpoint
 * override leaves `authMethod` at `claude.ai`, so the environment is checked for those too.
 *
 * The probe must see what the child sees: pass the child's `env`, `cwd` and the root flags it uses
 * that change which settings load (`--setting-sources`, `--disable-slash-commands`, `--safe-mode`,
 * `--strict-mcp-config`). `auth status` accepts them only before the subcommand, so they go first.
 *
 * Messages are fixed text: never a status field, an environment value or the status body (it holds
 * an account email and organization).
 *
 * @param {object} options
 * @param {string} [options.claudePath]  the executable the paid run will spawn
 * @param {object} [options.env]         the environment the paid child will get
 * @param {string} [options.cwd]         the directory the paid child will run in
 * @param {string[]} [options.args]      root flags the paid child uses
 * @param {Function} [options.impl]      spawnSync-compatible, injectable for tests
 * @returns {{authMethod: string, subscriptionType: string}}
 */
export function assertClaudeSubscription({
  claudePath = "claude",
  env = process.env,
  cwd,
  args = [],
  impl = spawnSync
} = {}) {
  const refuse = (reason) => {
    throw new Error(`Claude subscription check: ${reason}; refusing paid calls`);
  };
  for (const name of ENDPOINT_OVERRIDE_VARIABLES) {
    if (String(env?.[name] ?? "").trim() !== "") {
      refuse(`${name} is set, an alternate model endpoint`);
    }
  }
  for (const name of PROVIDER_SWITCH_VARIABLES) {
    if (!FALSE_SWITCH.has(String(env?.[name] ?? "").trim().toLowerCase())) {
      refuse(`${name} is set, a cloud-provider switch`);
    }
  }
  const result = impl(claudePath, [...args, "auth", "status", "--json"], {
    encoding: "utf8",
    timeout: 15_000,
    maxBuffer: 1024 * 1024,
    env,
    ...(cwd === undefined ? {} : { cwd })
  });
  if (result?.error) refuse("claude auth status could not run");
  if (result?.status !== 0) refuse(`claude auth status exited ${result?.status ?? "without a status"}`);
  let status;
  try {
    status = JSON.parse(String(result.stdout));
  } catch {
    return refuse("claude auth status did not print JSON");
  }
  const method = typeof status?.authMethod === "string" ? status.authMethod : "";
  if (method !== "claude.ai") {
    refuse(
      `${method === "" ? "no authMethod" : (AUTH_METHOD_REFUSALS.get(method) ?? "the login is not the claude.ai subscription")}, ` +
        "not the claude.ai subscription"
    );
  }
  if (status.apiProvider !== "firstParty") {
    refuse("the API provider is missing or not first-party");
  }
  const subscriptionType = typeof status.subscriptionType === "string" ? status.subscriptionType.trim() : "";
  if (!subscriptionType) refuse("no subscriptionType");
  return { authMethod: method, subscriptionType };
}

/**
 * The same check for an answering agent: its neutral working directory, the isolation flags it
 * launches with and `--strict-mcp-config`.
 */
export function assertAnsweringAgentSubscription({
  claudePath,
  env = process.env,
  cwd,
  impl
}) {
  return assertClaudeSubscription({
    claudePath,
    env,
    cwd,
    args: [...answeringAgentIsolationArgs(env), "--strict-mcp-config"],
    impl
  });
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
