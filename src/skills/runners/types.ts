/**
 * Host-side runnable-skill contract (src/skills/README.md).
 * Keep this module types-only and Node-compatible; runner modules import only `./types.ts`.
 */
import type { AdapterResult } from "../../adapters/types.ts";

export type { AdapterResult };

/** Service-namespace facade over the same host guard/adapter/redact closures the sandbox uses. */
export type OpsFacade = Record<
  string,
  Record<string, (args?: unknown) => Promise<AdapterResult>>
>;

export type SkillRunner = {
  /** Exact catalog op ids this runner may call; undeclared ops are omitted from its sub-facade. */
  ops: string[];
  /** Bounded JSON Schema (`src/policy/validate.ts`); `default` is doc-only, applied in `run()`. */
  inputSchema: Record<string, unknown>;
  /** Output `data` contract; `runSkill` unconditionally attaches `calls` from the host ledger. */
  outputSchema: Record<string, unknown>;
  /** Return expected failures as `{ ok: false, error }` envelopes; throws are treated as runner bugs. */
  run(input: Record<string, unknown>, ops: OpsFacade): Promise<unknown>;
};
