/**
 * Runner module contract; see src/skills/README.md.
 * Runners execute reviewed first-party TypeScript on the host.
 * They receive input and declared operation closures, without an environment.
 * runSkill narrows the shared facade and records the host-owned call ledger.
 * The model sandbox is a separate boundary and does not confine runners.
 *
 * Runner imports are limited to ./types.ts. Keep this module types-only and
 * Node-compatible so builders and composition instruments can load the registry.
 * Import checks and fetch-stub tests support review, not sandbox confinement.
 */
import type { AdapterResult } from "../../adapters/types.ts";

/**
 * Re-exported so runner modules can type their envelopes while honoring the
 * runner import check (specifiers ⊆ {"./types.ts"}).
 */
export type { AdapterResult };

/**
 * The facade `runSkill` hands a runner: service namespace → operation fn,
 * mirroring the sandbox surface (`ops.lumenloop.get_project(args)`), each fn
 * the SAME guard → adapter → redact closure the sandbox namespaces use, plus
 * the host-owned call-ledger recording wrapper. Every call resolves — never
 * throws — to the service-call envelope.
 */
export type OpsFacade = Record<
  string,
  Record<string, (args?: unknown) => Promise<AdapterResult>>
>;

export type SkillRunner = {
  /**
   * Exact catalog operation ids this runner may call — allowlist-as-data for
   * the sub-facade, the build-time drift guard (src/skills/README.md), the plan grader,
   * and the live-drift classifier. A call to an undeclared op has no facade
   * fn and fails loudly (a runner bug, surfaced as an error envelope).
   */
  ops: string[];
  /**
   * JSON Schema for `skill.run` input, authored inside the bounded
   * src/policy/validate.ts dialect (src/skills/README.md: no oneOf, no $ref).
   * `default` values are documentation only — validateArgs ignores
   * annotation keywords and nothing injects them; each runner materializes
   * its own defaults in the first lines of `run()`.
   */
  inputSchema: Record<string, unknown>;
  /**
   * JSON Schema for the `data` payload — the contract, the runner test oracle,
   * and the signature source. It declares `calls`, but runners never author
   * that key: runSkill attaches it from the host-owned ledger, overwriting
   * anything runner-set (src/skills/README.md — runner code never owns the audit trail).
   */
  outputSchema: Record<string, unknown>;
  /**
   * The mechanized data-gathering core. Expected conditions — ambiguity,
   * soft-empty anchors, constituent errors — come back as DATA (either the
   * output payload with degraded sections or an { ok: false, error } service
   * envelope); a thrown exception is a runner bug and is caught by runSkill.
   */
  run(input: Record<string, unknown>, ops: OpsFacade): Promise<unknown>;
};
