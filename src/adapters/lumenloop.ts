/**
 * Lumenloop adapter — generic invocation of manifest operations
 * (ARCHITECTURE.md: host-side `POST /v1/tools/{name}` + Bearer).
 *
 * Envelope mapping (the doc's "normalize per-tool, never assume data.results"):
 *  - HTTP 2xx + success:true + meta.format "json" | "blocks" → { ok, data }
 *    (data shape is per-tool by design — bare arrays, {count,projects}, …).
 *    The one authored exception is search_content_semantic, whose type-keyed
 *    rows are normalized into the catalog-documented {items,counts,meta}
 *    contract so callers cannot erase stronger evidence by guessing a key.
 *  - meta.format "text" → data is { text } and is soft-empty/guidance by
 *    contract ("not evidence") → kind "soft-empty" with the text as message.
 *  - success:false → kind "error" with upstream code/details/hint preserved.
 *
 * Secrets: LUMENLOOP_API_KEY is read here, host-side, and never echoed —
 * policy/redact.ts additionally scrubs any accidental key echo from results.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import {
  errResult,
  okResult,
  caughtResult,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";
import { normalizeLumenloopOutput } from "./lumenloop-shape.ts";

const SERVICE = "lumenloop";

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

  try {
    const res = await fetchImpl(`${transport.base ?? "https://api.lumenloop.com"}${transport.path}`, {
      method: transport.method ?? "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(args)
    });

    let body: LumenloopEnvelope;
    try {
      body = (await res.json()) as LumenloopEnvelope;
    } catch {
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

    // meta.format "text" = soft-empty/guidance under success:true — by the
    // service contract this is NOT evidence (unknown slug, "pass query or
    // slug" messages). Surface it as a soft-empty so the model never cites it.
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

    // "json" (per-tool shape) and "blocks" ({content:[{type,text},…]}) are
    // both evidence. Upstream meta.format is
    // consumed HERE (the text→soft-empty branch above) and not forwarded:
    // the envelope is exactly { ok: true, data }.
    return okResult(normalizeLumenloopOutput(entry.id, body.data));
  } catch (e) {
    return caughtResult(SERVICE, e);
  }
}
