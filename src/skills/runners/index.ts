/**
 * RUNNERS — the runnable-skill allowlist-as-data (design §2/§5), keyed by
 * EXACT catalog skill id. One source of truth consumed by:
 *  - the catalog builder (scripts/build-catalog.mjs — attaches runnable: true
 *    + schemas to the matching skill entries, fail-loud drift guards),
 *  - the super-spec emitter (scripts/build-super-spec.mjs — /skills/run_skill
 *    + x-runnable-index),
 *  - the runtime dispatch (src/skills/run.ts — registry lookup +
 *    assertRunnersWired pins registry ↔ manifest in both directions,
 *    including deep schema equality and declared-ops membership),
 *  - the eval instruments (eval/qa/analyze-composition.mjs, plan grader —
 *    expand each skill.run call through the runner's declared ops).
 *
 * It lives beside the runners rather than in scripts/exposure.mjs because
 * exposure.mjs holds EXCLUSIONS (things never emitted); runnability is an
 * inclusion feature whose source of truth must sit with the schemas and code
 * it describes. Node-clean by construction: runner modules import only
 * ./types.ts (design §12 lint), so `node` type stripping loads this registry
 * exactly the way build-catalog.mjs already loads extract-keywords.ts.
 *
 * Retire a runner by deleting its module and registry entry, then rebuild.
 * The skill entry remains in the catalog as a readable skill.
 */
import type { SkillRunner } from "./types.ts";
import { stellarEcosystemDigest } from "./stellar-ecosystem-digest.ts";

export const RUNNERS: Record<string, SkillRunner> = {
  "skills.lumenloop.stellar-ecosystem-digest": stellarEcosystemDigest
};
