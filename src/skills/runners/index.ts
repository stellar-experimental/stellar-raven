/**
 * Runnable-skill registry keyed by exact catalog skill id (src/skills/README.md).
 * Consumed by catalog/super-spec builders, runtime `runSkill`, and eval composition analysis.
 * Keep runner modules importing only `./types.ts` so Node type-stripping loads this cleanly.
 */
import type { SkillRunner } from "./types.ts";
import { stellarEcosystemDigest } from "./stellar-ecosystem-digest.ts";

export const RUNNERS: Record<string, SkillRunner> = {
  "skills.lumenloop.stellar-ecosystem-digest": stellarEcosystemDigest
};
