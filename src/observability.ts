/**
 * Structured event logging for Workers Logs (observability.enabled in
 * wrangler.jsonc). One JSON line per event via console.log; the platform
 * groups lines by invocation, so every event of one /mcp request — auth mode,
 * tool call, each sandbox op — reads as a single correlated trace in the
 * dashboard (Workers → Logs) or `wrangler tail`.
 *
 * Discipline:
 *  - `evt` names the event; keep the rest FLAT and SMALL (counts, statuses,
 *    operation/catalog ids, and durations — never user/model content or
 *    content-derived hashes).
 *  - Never log secret values, queries, execute code, results, answers, or
 *    provider error messages. Adapter results are already secret-redacted
 *    before they reach the model-facing boundary, but redaction is not
 *    permission to log them.
 *
 * Second channel: trace spans (observability.traces in wrangler.jsonc).
 * Handler + host-side fetches are auto-instrumented; the sandbox boundary has
 * a custom span in src/executor/run.ts (Worker Loader isn't auto-traced).
 * Rule of thumb: logEvent for facts to query later (what happened), spans for
 * timing attribution (where the time went). Same no-payload discipline; spans
 * bill from the same event quota as logs (research/observability-cloudflare.md).
 */

export function logEvent(evt: string, fields: Record<string, unknown>): void {
  try {
    console.log(JSON.stringify({ evt, ...fields }));
  } catch {
    // Never let telemetry break the request path.
  }
}

export async function hashPrefix(value: string, chars = 16): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, chars);
}

export async function artifactOwnerHashPrefix(owner: string | undefined): Promise<string | null> {
  return owner ? hashPrefix(owner) : null;
}

export async function logArtifactWrite(fields: {
  owner?: string;
  bytes: number;
  ms: number;
  ok: boolean;
  skipped?: string;
  errorName?: string;
}): Promise<void> {
  logEvent("artifact_write", {
    ownerHash: await artifactOwnerHashPrefix(fields.owner),
    bytes: fields.bytes,
    ms: fields.ms,
    ok: fields.ok,
    skipped: fields.skipped ?? null,
    errorName: fields.errorName ?? null
  });
}

export async function logArtifactRead(fields: {
  kind?: "read" | "info";
  owner?: string;
  bytes: number;
  ms: number;
  hit: boolean;
  reason?: string;
  readCount: number;
}): Promise<void> {
  logEvent("artifact_read", {
    kind: fields.kind ?? "read",
    ownerHash: await artifactOwnerHashPrefix(fields.owner),
    bytes: fields.bytes,
    ms: fields.ms,
    hit: fields.hit,
    reason: fields.reason ?? null,
    readCount: fields.readCount
  });
}

/**
 * One `codemode.skill.read` call. Exists because the 2026-07-30 de-vendoring
 * turned skill reads into network reads and nothing measured the result: the
 * only prior signal was a boolean `sandbox.skillRead` span attribute, which
 * says a run read SOME skill and nothing else.
 *
 * Two questions this is the instrument for, both recorded in
 * ideas/skill-discovery-without-bundling.md: whether agents use SECTION reads at
 * all (if they only ever read whole skills, 204 section entries are dead
 * weight), and what the live-fetch latency profile actually is. `from` makes the
 * latency interpretable — a memo hit and an upstream fetch differ by orders of
 * magnitude and a mean over both is meaningless.
 *
 * No skill body, section text, or caller identity is logged: the id is a public
 * catalog id and the rest is shape and timing.
 */
export function logSkillRead(fields: {
  /** Exact catalog id requested, or null when the caller passed a non-id. */
  id: string | null;
  /** What was asked for: the whole skill, `##` sections, companion files, or a mix. */
  shape: "whole" | "sections" | "files" | "mixed";
  /** How many section keys were requested (0 for a whole read). */
  requested: number;
  /** Distinct pinned files this call had to retrieve. */
  retrievals: number;
  /** Retrieval provenance, most expensive wins: upstream > cache > memo. */
  from: "memo" | "cache" | "upstream" | "none";
  ms: number;
  outcome: "ok" | "error" | "soft-empty";
}): void {
  logEvent("skill_read", {
    id: fields.id,
    shape: fields.shape,
    requested: fields.requested,
    retrievals: fields.retrievals,
    from: fields.from,
    ms: fields.ms,
    outcome: fields.outcome
  });
}
