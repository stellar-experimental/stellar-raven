/**
 * Lumenloop adapter: host-side `POST /v1/tools/{name}` with Bearer auth (ARCHITECTURE.md).
 * `meta.format === "text"` maps to `soft-empty` (advisory, not evidence); `"json"` and `"blocks"`
 * pass through normalized per tool (`lumenloop-shape.ts`). Timeout aborts are detected from
 * `signal.aborted`, never from the thrown error.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import {
  errResult,
  okResult,
  caughtResult,
  OPERATION_BUDGET_MS,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";
import { normalizeLumenloopOutput } from "./lumenloop-shape.ts";

const SERVICE = "lumenloop";
const TIMEOUT_HINT =
  "The call timed out. Do not retry it in this script. Report this source as unavailable, not as missing data.";

function timeoutResult(): AdapterResult {
  return errResult({
    service: SERVICE,
    kind: "error",
    message: `${SERVICE} timed out after ${OPERATION_BUDGET_MS / 1000} s`,
    hint: TIMEOUT_HINT
  });
}

type LumenloopEnvelope = {
  success?: boolean;
  data?: unknown;
  error?: string | null;
  code?: string;
  details?: unknown;
  hint?: string;
  meta?: { tool?: string; format?: string };
};

export async function callLumenloop(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  env: AdapterEnv,
  fetchImpl: FetchLike = fetch
): Promise<AdapterResult> {
  const transport = entry.transport;
  if (!transport || transport.type !== "http" || !transport.path) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `catalog entry ${entry.id} has no http transport — cannot call it`
    });
  }
  const key = env.LUMENLOOP_API_KEY;
  if (!key) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: "LUMENLOOP_API_KEY is not configured on the host — lumenloop calls are unavailable"
    });
  }

  const signal = AbortSignal.timeout(OPERATION_BUDGET_MS);
  try {
    const res = await fetchImpl(`${transport.base ?? "https://api.lumenloop.com"}${transport.path}`, {
      method: transport.method ?? "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(args),
      signal
    });

    let body: LumenloopEnvelope;
    try {
      body = (await res.json()) as LumenloopEnvelope;
    } catch {
      // A body read cut off by the budget rejects here; it is a timeout, not a non-JSON answer.
      if (signal.aborted) return timeoutResult();
      return errResult({
        service: SERVICE,
        kind: "error",
        message: `lumenloop returned non-JSON (HTTP ${res.status})`,
        status: res.status
      });
    }

    if (!res.ok || body.success === false) {
      return errResult({
        service: SERVICE,
        kind: "error",
        message: body.error ?? `lumenloop tool call failed (HTTP ${res.status})`,
        status: res.status,
        ...(body.code ? { code: body.code } : {}),
        ...(body.hint ? { hint: body.hint } : {}),
        ...(body.details !== undefined ? { details: body.details } : {})
      });
    }

    const format = body.meta?.format ?? "json";

    // Upstream `meta.format: "text"` is guidance under success:true, not evidence.
    if (format === "text") {
      const data = body.data as { text?: unknown } | null;
      const text = typeof data?.text === "string" ? data.text : JSON.stringify(body.data);
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message: text,
        status: res.status,
        hint:
          "This lane is inconclusive. For an open-world topic, identity, or history question, make one broader Lumenloop pass with search_content_semantic; use search_directory only to resolve a project slug, and validate semantic rows against exact identity, source, and date before attribution."
      });
    }

    // Consume upstream meta.format here; both "json" and "blocks" are evidence.
    return okResult(normalizeLumenloopOutput(entry.id, body.data));
  } catch (e) {
    return signal.aborted ? timeoutResult() : caughtResult(SERVICE, e);
  }
}
