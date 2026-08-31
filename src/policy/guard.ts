/**
 * Call guard — runs host-side BEFORE any adapter call (PLAN §4): validates
 * args against the entry's inputSchema. That is the whole job. Exposure is
 * decided at BUILD time (ADR-0003) — everything in the manifest is callable,
 * so there is no runtime allow/deny to check here.
 *
 * Refusals come back as AdapterResult errors ({kind:"error"} for bad args) —
 * nothing here ever throws to the sandbox.
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
      hint: `Fix the listed fields and retry; codemode.describe(${JSON.stringify(entry.id)}) returns the exact input schema.${
        entry.discoveryMode === "recovery-only"
          ? " This rejection did not consume the recovery receipt; reuse it on the retry."
          : ""
      }`
    });
  }

  return null; // pass
}
