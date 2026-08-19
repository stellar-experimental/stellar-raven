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
import { EXCLUDED_LUMENLOOP_OPS, EXCLUDED_SCOUT_OPS, RETIRED_SKILL_REF_RE } from "./exposure.mjs";

// Share the runtime scrub pattern instead of maintaining another retired-id list.
const RETIRED_SKILL_RE = RETIRED_SKILL_REF_RE;
const RAW_SCOUT_PATHS = [...EXCLUDED_SCOUT_OPS].map((k) => k.split(" ")[1]);
const EXCLUDED_LUMENLOOP_RE = new RegExp(`\\b(?:${[...EXCLUDED_LUMENLOOP_OPS].join("|")})\\b`);
// Service-qualified form ("lumenloop.request_research") — same dotted-token
// shape build-catalog.mjs's callableRe matches, narrowed to the excluded
// lumenloop op names only (no opIds allowlist available here).
const EXCLUDED_LUMENLOOP_QUALIFIED_RE = new RegExp(
  `(?<![.\\w])lumenloop\\.(?:${[...EXCLUDED_LUMENLOOP_OPS].join("|")})\\b`
);

/**
 * Throw with a precise message naming the offending reference and `label`
 * if `text` leaks a non-exposed op or retired skill; otherwise return.
 */
export function assertNoNonExposedRefsInText(text, label) {
  const qualifiedMatch = text.match(EXCLUDED_LUMENLOOP_QUALIFIED_RE);
  if (qualifiedMatch) {
    throw new Error(
      `ADR-0003 leak: ${label} emits a reference to non-exposed operation ` +
        `"${qualifiedMatch[0]}" — scrub or rewrite the source text (scripts/description-notes.mjs / ` +
        `scripts/exposure.mjs).`
    );
  }
  for (const path of RAW_SCOUT_PATHS) {
    if (text.includes(path)) {
      throw new Error(
        `ADR-0003 leak: ${label} emits excluded scout endpoint path "${path}" — ` +
          `if it came from an exposed OPERATION's description, add the clause to ` +
          `SCOUT_DESCRIPTION_SCRUBS in scripts/description-notes.mjs. That scrub is keyed by ` +
          `operationId and cannot reach COMPONENT prose: a component describing only an excluded ` +
          `op should be unreachable and pruned by build-super-spec.mjs, and a reachable ` +
          `component whose description names the path needs the text fixed at the source.`
      );
    }
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
