/**
 * Structured Workers Logs events (`console.log` JSON lines) grouped per invocation.
 * Keep fields flat and small (counts, statuses, catalog ids, durations). Never log
 * secrets, queries, code, results, answers, content-derived hashes, or provider error text.
 * See ARCHITECTURE.md for telemetry fields and usage/README.md for Tail Worker collection.
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
 * Log one `codemode.skill.read` call: shape, retrieval provenance, and timing only
 * (no skill body, section text, or caller identity). `from` separates memo, cache,
 * and upstream latencies, which differ by orders of magnitude.
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
