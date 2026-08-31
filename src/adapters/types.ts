/**
 * Shared adapter types — the uniform result envelope every service adapter
 * returns into the sandbox.
 *
 * Design (PLAN §4, "soft-empty ≠ error ≠ data"):
 *  - Adapters NEVER throw toward the sandbox. Every outcome is a value:
 *      { ok: true,  data }                — real evidence
 *      { ok: false, error: AdapterError } — error OR soft-empty
 *  - `error.kind` is the two-way discriminator the model (and tests) branch
 *    on: "error" (call failed / args invalid), "soft-empty" (the service
 *    answered politely with nothing — unknown slug, zero hits, guidance
 *    text). There is no separate "denied" kind. Exposure is filtered at
 *    build time. A recovery-only host refusal uses the standard error kind.
 *  - One envelope across three heterogeneous services keeps the `execute`
 *    prompt honest: model code checks `r.ok` and never has to guess whether
 *    a bare array vs `{error}` vs `{text}` means failure.
 *
 * Node-testable: no cloudflare:workers imports here or in any adapter.
 */
import type { CatalogEntry } from "../catalog/types.ts";

/** The Worker env slice adapters need. Structurally satisfied by the real Env. */
export type AdapterEnv = {
  LUMENLOOP_API_KEY?: string;
  /** developers.stellar.org DocSearch app (search-only key). */
  ALGOLIA_APPLICATION_ID_DOCS?: string;
  ALGOLIA_API_KEY_DOCS?: string;
  /** stellar.org site app — English `pages` index only (search-only key). */
  ALGOLIA_APPLICATION_ID_SITE?: string;
  ALGOLIA_API_KEY_SITE?: string;
};

/** Injectable fetch so unit tests run against recorded fixtures, no network. */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type AdapterErrorKind = "error" | "soft-empty";

export type AdapterError = {
  service: string;
  kind: AdapterErrorKind;
  message: string;
  /** HTTP status when the upstream answered; absent for network/validation errors. */
  status?: number;
  /** Upstream machine code (lumenloop `code`, algolia `status`), when present. */
  code?: string;
  /** Upstream hint / valid-value lists — model-actionable retry guidance. */
  hint?: string;
  details?: unknown;
};

export type AdapterResult =
  | { ok: true; data: unknown }
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
