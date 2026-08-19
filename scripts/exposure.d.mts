// Ambient declaration for exposure.mjs (plain JS, no build step) so TS test
// files can import its exclusion data directly under `tsc --noEmit`. Keep in
// sync with the exported surface of exposure.mjs.
export const LUMENLOOP_ACCOUNT_OP_RE: RegExp;
export const EXCLUDED_LUMENLOOP_OPS: Set<string>;
export function lumenloopOpExcluded(tool: { name: string; metered?: boolean }): boolean;
export const EXCLUDED_SCOUT_OPS: Set<string>;
export const RETIRED_ONBOARDING_SKILLS: Set<string>;
export const RETIRED_PARTNER_ONBOARDING_SKILLS: Set<string>;
export const SKILL_EXPOSURE_CLASSIFICATION_VALUES: Set<string>;
export const SKILL_EXPOSURE_CLASSIFICATIONS: Array<{
  id: string;
  classification: "internal-guidance" | "removed";
  source: string;
  rationale: string;
  emittedSurface: "none";
}>;
export const SKILL_EXPOSURE_CLASSIFICATION_BY_ID: Map<
  string,
  {
    id: string;
    classification: "internal-guidance" | "removed";
    source: string;
    rationale: string;
    emittedSurface: "none";
  }
>;
export function scrubRetiredSkillRefs(text: string, context: string): string;
export function scrubNonExposedRefs(text: string, context: string): string;
