/**
 * Adapter dispatch — one clean client per service (ARCHITECTURE.md adapter dispatch).
 * Selection is by the entry's `service` field, which the catalog schema
 * constrains to the known set; anything else is an error-as-data.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import { callLumenloop } from "./lumenloop.ts";
import { callScout } from "./scout.ts";
import { callStellarDocs } from "./stellar-docs.ts";
import { errResult, type AdapterEnv, type AdapterResult, type FetchLike } from "./types.ts";

export type { AdapterEnv, AdapterError, AdapterResult, FetchLike } from "./types.ts";
export { callLumenloop } from "./lumenloop.ts";
export { callScout } from "./scout.ts";
export { callStellarDocs } from "./stellar-docs.ts";

export async function callService(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  env: AdapterEnv,
  fetchImpl?: FetchLike
): Promise<AdapterResult> {
  switch (entry.service) {
    case "lumenloop":
      return callLumenloop(entry, args, env, fetchImpl);
    case "scout":
      return callScout(entry, args, env, fetchImpl);
    case "stellarDocs":
      return callStellarDocs(entry, args, env, fetchImpl);
    default:
      return errResult({
        service: entry.service,
        kind: "error",
        message: `no adapter for service "${entry.service}" (entry ${entry.id}) — skills are read via codemode.skill.read, not called`
      });
  }
}
