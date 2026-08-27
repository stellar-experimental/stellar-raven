/**
 * search-projection.mjs — the bounded record of what a `search` call actually
 * showed the answering agent.
 *
 * Why this exists: the transcript writer keeps whole results only for tools
 * whose bodies a downstream analyzer parses (execute, plain operations).
 * Everything else stored a character count and nothing more, so a routing or
 * coverage A/B could not see which hits an arm was offered. The 2026-08-26
 * connectors item-8 round recorded that exact limit: "Search result bodies
 * were not stored, so result-hit differences remain unreviewable."
 *
 * Keeping the whole body instead is the wrong fix. Hits carry large descriptions
 * and signatures. This module keeps ranking facts and a bounded `nextSteps`
 * excerpt. It also keeps the full guidance length and hash.
 *
 * PURITY: no fs, no spawn, no clock, no network.
 */
import { createHash } from "node:crypto";

/** Bump when the projection shape changes. Stamped on every projection. */
export const SEARCH_PROJECTION_SCHEMA = "qa-search-projection-v1";

/** Bounds. A page may request up to limit 50; the projection stays small. */
export const MAX_PROJECTED_HITS = 20;
export const MAX_PROJECTED_CANDIDATES = 8;
export const MAX_PROJECTED_NEXT_STEPS_CHARS = 4096;

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const str = (value) => (typeof value === "string" ? value : null);
const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/**
 * Unwrap the shapes a search result can arrive in. The tool answers with a
 * JSON text block; some clients hand back the whole MCP envelope instead.
 */
function searchPayload(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  if (Array.isArray(parsed.hits)) return parsed;
  const structured = parsed.result?.structuredContent;
  if (structured && Array.isArray(structured.hits)) return structured;
  const textBlock = (parsed.result?.content ?? parsed.content ?? []).find?.(
    (item) => item?.type === "text" && typeof item.text === "string"
  );
  if (!textBlock) return null;
  try {
    const inner = JSON.parse(textBlock.text);
    return Array.isArray(inner?.hits) ? inner : null;
  } catch {
    return null;
  }
}

/**
 * Project ONE search tool result into bounded ranking evidence.
 *
 * An unparseable body yields `{ parsed: false }` and its size. It never yields
 * a partial guess and never retains the body.
 */
export function projectSearchResult(text) {
  const raw = typeof text === "string" ? text : "";
  const base = { schema: SEARCH_PROJECTION_SCHEMA, parsed: false, resultChars: raw.length };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return base;
  }
  const payload = searchPayload(parsed);
  if (!payload) return base;

  const hits = payload.hits.slice(0, MAX_PROJECTED_HITS).map((hit, index) => ({
    rank: index + 1,
    id: str(hit?.id),
    service: str(hit?.service),
    kind: str(hit?.kind),
    tier: str(hit?.tier),
    score: num(hit?.score)
  }));
  const nextSteps = typeof payload.nextSteps === "string" ? payload.nextSteps : "";
  const candidateIds = (list) =>
    (Array.isArray(list) ? list : [])
      .slice(0, MAX_PROJECTED_CANDIDATES)
      .map((item) => str(item?.id))
      .filter(Boolean);

  return {
    schema: SEARCH_PROJECTION_SCHEMA,
    parsed: true,
    resultChars: raw.length,
    // hitCount is the page length; hits[] is capped, so a capped projection
    // stays visible instead of reading as a short page.
    hitCount: payload.hits.length,
    hitsProjected: hits.length,
    hits,
    total: num(payload.total),
    truncated: payload.truncated === true,
    widerCandidateIds: candidateIds(payload.widerCandidates),
    recoveryIds: candidateIds(payload.recovery),
    // Keep a bounded copy because guidance text can be the treatment under test.
    nextStepsChars: nextSteps.length,
    nextStepsSha256: nextSteps ? sha256(nextSteps) : null,
    nextStepsExcerpt: nextSteps.slice(0, MAX_PROJECTED_NEXT_STEPS_CHARS),
    nextStepsTruncated: nextSteps.length > MAX_PROJECTED_NEXT_STEPS_CHARS
  };
}

/**
 * Build the `projectResult` hook for parseAgentResult from the exact tool
 * names this run exposes. Exact-match only: a guessed name would silently
 * project nothing.
 */
export function makeSearchResultProjector(toolNames) {
  const names = new Set((Array.isArray(toolNames) ? toolNames : []).filter(Boolean).map(String));
  if (names.size === 0) return () => null;
  return (toolName, text) => (names.has(String(toolName)) ? projectSearchResult(text) : null);
}
