/**
 * emitted-text-guard.mjs — reusable core of the ADR-0003 "no non-exposed
 * refs in emitted text" leak guard (research/decisions/0003-…), factored out
 * of scripts/build-catalog.mjs's `assertNoNonExposedRefs` so every emitter of
 * user-facing text — not just catalog manifest entries — can run the SAME
 * checks against the SAME exclusion data (scripts/exposure.mjs).
 *
 * `assertNoNonExposedRefsInText(text, label)` scans one blob of prose for:
 *   - an excluded lumenloop op name, bare ("request_research") or
 *     service-qualified ("lumenloop.request_research")
 *   - an excluded Scout op name, bare or service-qualified
 *   - a raw excluded-scout-endpoint path ("/api/feedback", …)
 *   - a retired-skill id/reference (lumenloop-api-*, lumenloop-mcp-connect)
 *
 * It does NOT reproduce build-catalog.mjs's general "any lumenloop./scout./
 * stellarDocs.<name> callable token not present in the manifest's opIds"
 * check — that check needs the full assembled manifest as an allowlist and
 * only makes sense there. This helper is for text with no such allowlist
 * (demo page copy, demo system/tool prompts): it only knows what must NOT
 * appear (the exclusion data), not the full set of what's currently exposed.
 */
import {
  EXCLUDED_LUMENLOOP_OPS,
  NON_EXPOSED_SCOUT_OP_NAMES,
  RETIRED_SKILL_REF_RE,
  findExcludedScoutPath
} from "./exposure.mjs";

// Share the runtime scrub pattern instead of maintaining another retired-id list.
const RETIRED_SKILL_RE = RETIRED_SKILL_REF_RE;
const SCOUT_NAME_SPELLINGS = [...NON_EXPOSED_SCOUT_OP_NAMES].flatMap((name) => [
  name, name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
]);
const EXCLUDED_SCOUT_NAME_RE = new RegExp(`\\b(?:${SCOUT_NAME_SPELLINGS.join("|")})\\b`, "i");
const EXCLUDED_LUMENLOOP_RE = new RegExp(`\\b(?:${[...EXCLUDED_LUMENLOOP_OPS].join("|")})\\b`, "i");
// Service-qualified form ("lumenloop.request_research") — same dotted-token
// shape build-catalog.mjs's callableRe matches, narrowed to the excluded
// lumenloop op names only (no opIds allowlist available here).
const EXCLUDED_LUMENLOOP_QUALIFIED_RE = new RegExp(
  `(?<![.\\w])lumenloop\\.(?:${[...EXCLUDED_LUMENLOOP_OPS].join("|")})\\b`, "i"
);

/**
 * Throw with a precise message naming the offending reference and `label`
 * if `text` leaks a non-exposed op or retired skill; otherwise return.
 */
export function assertNoNonExposedRefsInText(text, label) {
  const scoutNameMatch = text.match(EXCLUDED_SCOUT_NAME_RE);
  if (scoutNameMatch) {
    throw new Error(
      `ADR-0003 leak: ${label} emits an excluded scout operation name ` +
        `(${scoutNameMatch[0]}) — scrub or rewrite the source text in scripts/description-notes.mjs.`
    );
  }
  const qualifiedMatch = text.match(EXCLUDED_LUMENLOOP_QUALIFIED_RE);
  if (qualifiedMatch) {
    throw new Error(
      `ADR-0003 leak: ${label} emits a reference to non-exposed operation ` +
        `"${qualifiedMatch[0]}" — scrub or rewrite the source text (scripts/description-notes.mjs / ` +
        `scripts/exposure.mjs).`
    );
  }
  // Share the runtime path matcher (case-insensitive, percent-decoded,
  // boundary-checked over EXCLUDED_SCOUT_PATHS including SCOUT_PATHS_ABSENT_FROM_SPEC).
  const excludedPath = findExcludedScoutPath(text);
  if (excludedPath) {
    throw new Error(
      `ADR-0003 leak: ${label} emits excluded scout endpoint path "${excludedPath}" — ` +
        `if it came from an exposed OPERATION's description, add the clause to ` +
        `SCOUT_DESCRIPTION_SCRUBS in scripts/description-notes.mjs. That scrub is keyed by ` +
        `operationId and cannot reach COMPONENT prose: a component describing only an excluded ` +
        `op should be unreachable and pruned by build-super-spec.mjs, and a reachable ` +
        `component whose description names the path needs the text fixed at the source.`
    );
  }
  if (RETIRED_SKILL_RE.test(text)) {
    throw new Error(
      `ADR-0003 leak: ${label} emits a retired-skill reference — ` +
        `scrubNonExposedRefs missed it; see scripts/exposure.mjs.`
    );
  }
  const bareMatch = text.match(EXCLUDED_LUMENLOOP_RE);
  if (bareMatch) {
    throw new Error(
      `ADR-0003 leak: ${label} emits an excluded lumenloop tool name ` +
        `(${bareMatch[0]}) — the exclusion in scripts/exposure.mjs ` +
        `must take its cross-references with it.`
    );
  }
}
