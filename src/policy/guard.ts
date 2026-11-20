/**
 * Host-side call guard before any adapter call (ARCHITECTURE.md). Validates args against
 * `inputSchema` and returns error envelopes (never throws). Exposure is build-time (ADR-0003).
 */
import type { CatalogEntry } from "../catalog/types.ts";
import { errResult, type AdapterResult } from "../adapters/types.ts";
import { validateArgs } from "./validate.ts";

export function guard(entry: CatalogEntry, args: unknown): AdapterResult | null {
  const issues = validateArgs(entry.inputSchema, args);
  if (issues.length > 0) {
    return errResult({
      service: entry.service,
      kind: "error",
      message: `invalid arguments for ${entry.id} — no call was made`,
      details: issues,
      hint: "Fix the listed fields and retry; the operation's exact input schema is in its `search` hit signature."
    });
  }

  return null; // pass
}
