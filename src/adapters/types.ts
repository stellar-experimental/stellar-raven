/**
 * Uniform result envelope across all four service adapters (ARCHITECTURE.md).
 * Expected adapter contract: return `{ ok: true, data }` or `{ ok: false, error }` envelopes
 * (`error.kind` `"error"` or `"soft-empty"`) for upstream/validation outcomes rather than throwing.
 * Exposure is filtered at build time (ADR-0003), so there is no `"denied"` kind.
 * Node-testable: no `cloudflare:workers` imports in any adapter.
 */
import type { CatalogEntry } from "../catalog/types.ts";

/** The Worker env slice adapters need. Structurally satisfied by the real Env. */
export type AdapterEnv = {
  LUMENLOOP_API_KEY?: string;
  /** developers.stellar.org Mintlify project (assistant key: search and page content). */
  MINTLIFY_ASSISTANT_API_KEY?: string;
};

/**
 * Wall-clock budget for one operation call (ms), covering headers, body, retries, and redirects.
 * Any retry must use the remaining budget, never a fresh one, so timeouts cannot multiply.
 */
export const OPERATION_BUDGET_MS = 24_000;

/** Injectable fetch so unit tests run against recorded fixtures, no network. */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type AdapterErrorKind = "error" | "soft-empty";

export type AdapterError = {
  service: string;
  kind: AdapterErrorKind;
  message: string;
  /** HTTP status when the upstream answered; absent for network/validation errors. */
  status?: number;
  /** Upstream machine code (lumenloop `code`), when present. */
  code?: string;
  /** Upstream hint / valid-value lists — model-actionable retry guidance. */
  hint?: string;
  details?: unknown;
};

/**
 * Host-derived evidence caveat on ok results, set by src/executor/providers.ts (never adapters).
 * Values stay disjoint from `soft-empty` so an empty ok result cannot read as a failed call.
 */
export type ResultCaveat = "no-rows" | "unverified-match";

/**
 * Candidate-lane row whose source label and URL slug match an identifier named in the query.
 * Reports agreement only, never relevance.
 */
export type ExactRow = { index: number; key: string };

export type AdapterResult =
  | {
      ok: true;
      data: unknown;
      /** Upstream-stated data date, else the host observation time (ISO-8601). */
      asOf?: string;
      /** The allowlisted payload path that supplied `asOf`, or "observed". */
      asOfBasis?: string;
      /** Present only when the payload has no rows, or its rows are unverified matches. */
      caveat?: ResultCaveat;
      /** Present only when a row is the document the query names by identifier. `caveat` is unchanged. */
      exactRows?: ExactRow[];
    }
  | { ok: false; error: AdapterError };

export function okResult(data: unknown): AdapterResult {
  return { ok: true, data };
}

export function errResult(error: AdapterError): AdapterResult {
  return { ok: false, error };
}

/** Uncaught adapter failure (network, JSON parse, bug) → error-as-data. */
export function caughtResult(service: string, e: unknown): AdapterResult {
  const message = e instanceof Error ? e.message : String(e);
  return errResult({ service, kind: "error", message });
}

export type Adapter = (
  entry: CatalogEntry,
  args: Record<string, unknown>,
  env: AdapterEnv,
  fetchImpl?: FetchLike
) => Promise<AdapterResult>;
