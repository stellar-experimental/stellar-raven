/**
 * Auth-bound R2 artifact store for oversized execute result payloads.
 *
 * Pure host module: no executor/server imports, no listing surface, no public
 * URLs. Callers pass an auth-bound owner (OAuth subject or fixed loopback-dev
 * owner); admin/no-owner calls get no artifact.
 */

export const ARTIFACT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ARTIFACT_MAX_BYTES = 2 * 1024 * 1024;
export const ARTIFACT_CUSTOM_METADATA_MAX_BYTES = 8_192;
export const ARTIFACT_KEY_PREFIX = "art";

const OWNER_HASH_HEX_CHARS = 16;
const ARTIFACT_CUSTOM_METADATA_TARGET_BYTES = 7_600;
const OP_LEDGER_METADATA_CALL_LIMIT = 12;
const OP_LEDGER_OP_MAX_CHARS = 180;
const ARTIFACT_NOT_FOUND = { ok: false as const, error: { kind: "not-found" as const } };

export type ArtifactMime = "application/json" | "text/plain; charset=utf-8" | "application/x.raven.undefined";

export type ArtifactOperationSummary = {
  op: string;
  status: "ok" | "error" | "soft-empty";
  ms?: number;
};

export type ArtifactPutInput = {
  /**
   * Exact post-redaction serialized result string. This is the string that
   * would otherwise be truncated at the model boundary.
   */
  body: string;
  /**
   * Controls deterministic reconstruction on read. JSON bodies are parsed;
   * text bodies are returned as strings; undefined bodies return undefined.
   */
  mime: ArtifactMime;
  requestId?: string;
  rayId?: string;
  capTokens: number;
  originalChars: number;
  opLedger: ArtifactOperationSummary[] | string;
  catalogGeneratedAt: string;
  now?: Date;
};

export type ArtifactMetadata = {
  id: string;
  createdAt: string;
  expiresAt: string;
  bytes: number;
  sha256: string;
  mime: ArtifactMime;
  requestId: string;
  rayId: string;
  capTokens: number;
  originalChars: number;
  opLedger: string;
  catalogGeneratedAt: string;
};

export type ArtifactPutResult =
  | { ok: true; artifact: ArtifactMetadata }
  | { ok: false; skipped: "size-cap"; bytes: number; maxBytes: number };

export type ArtifactInfoResult = { ok: true; artifact: ArtifactMetadata } | typeof ARTIFACT_NOT_FOUND;

export type ArtifactReadResult =
  | { ok: true; artifact: ArtifactMetadata; value: unknown }
  | typeof ARTIFACT_NOT_FOUND
  | { ok: false; error: { kind: "error"; message: string } };

class ArtifactOwnerError extends Error {
  constructor() {
    super("artifact owner must be a non-empty OAuth subject");
    this.name = "ArtifactOwnerError";
  }
}

function requireOwner(owner: unknown): string {
  if (typeof owner !== "string" || owner.trim().length === 0) {
    throw new ArtifactOwnerError();
  }
  return owner;
}

function isArtifactId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  );
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

async function ownerHash(owner: string): Promise<string> {
  return (await sha256Hex(owner)).slice(0, OWNER_HASH_HEX_CHARS);
}

async function keyFor(owner: string, id: string): Promise<string> {
  return `${ARTIFACT_KEY_PREFIX}/${await ownerHash(owner)}/${id}`;
}

function bytesOf(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

export function artifactCustomMetadataByteLength(meta: Record<string, string>): number {
  let bytes = 0;
  for (const [key, value] of Object.entries(meta)) {
    bytes += bytesOf(key) + bytesOf(value);
  }
  return bytes;
}

function metadataFromCustom(id: string, meta: Record<string, string> | undefined): ArtifactMetadata | null {
  if (!meta) return null;
  const {
    createdAt,
    expiresAt,
    bytes,
    sha256,
    mime,
    requestId = "",
    rayId = "",
    capTokens,
    originalChars,
    opLedger,
    catalogGeneratedAt
  } = meta;
  if (
    !createdAt ||
    !expiresAt ||
    !bytes ||
    !sha256 ||
    !mime ||
    !capTokens ||
    !originalChars ||
    !opLedger ||
    !catalogGeneratedAt
  ) {
    return null;
  }
  if (
    mime !== "application/json" &&
    mime !== "text/plain; charset=utf-8" &&
    mime !== "application/x.raven.undefined"
  ) {
    return null;
  }
  const parsedBytes = Number(bytes);
  if (!Number.isFinite(parsedBytes) || parsedBytes < 0) return null;
  return {
    id,
    createdAt,
    expiresAt,
    bytes: parsedBytes,
    sha256,
    mime,
    requestId,
    rayId,
    capTokens: Number(capTokens),
    originalChars: Number(originalChars),
    opLedger,
    catalogGeneratedAt
  };
}

function trimAtom(value: unknown, maxChars: number): string {
  const text = typeof value === "string" ? value : String(value);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}

function normalizeStatus(value: unknown): ArtifactOperationSummary["status"] {
  return value === "error" || value === "soft-empty" ? value : "ok";
}

function normalizeOpLedger(input: ArtifactOperationSummary[] | string): ArtifactOperationSummary[] {
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input) as unknown;
    return Array.isArray(parsed) ? (parsed as ArtifactOperationSummary[]) : [];
  } catch {
    return [];
  }
}

function opLedgerTotals(calls: ArtifactOperationSummary[]): Record<ArtifactOperationSummary["status"], number> {
  const totals = { ok: 0, error: 0, "soft-empty": 0 };
  for (const call of calls) totals[normalizeStatus(call.status)] += 1;
  return totals;
}

function opLedgerMetadata(input: ArtifactOperationSummary[] | string): string {
  const calls = normalizeOpLedger(input);
  const shown = calls.slice(0, OP_LEDGER_METADATA_CALL_LIMIT).map((call) => ({
    op: trimAtom(call.op, OP_LEDGER_OP_MAX_CHARS),
    status: normalizeStatus(call.status),
    ...(Number.isFinite(call.ms) ? { ms: Math.max(0, Math.round(call.ms as number)) } : {})
  }));
  return JSON.stringify({
    calls: shown,
    total: calls.length,
    omitted: Math.max(0, calls.length - shown.length),
    totals: opLedgerTotals(calls)
  });
}

function customMetadata(input: ArtifactPutInput, id: string, createdAt: Date, bytes: number, sha256: string): ArtifactMetadata {
  const expiresAt = new Date(createdAt.getTime() + ARTIFACT_TTL_MS).toISOString();
  const meta: ArtifactMetadata = {
    id,
    createdAt: createdAt.toISOString(),
    expiresAt,
    bytes,
    sha256,
    mime: input.mime,
    requestId: input.requestId ?? "",
    rayId: input.rayId ?? "",
    capTokens: input.capTokens,
    originalChars: input.originalChars,
    opLedger: opLedgerMetadata(input.opLedger),
    catalogGeneratedAt: input.catalogGeneratedAt
  };
  return fitCustomMetadata(meta);
}

function toR2Metadata(meta: ArtifactMetadata): Record<string, string> {
  return {
    createdAt: meta.createdAt,
    expiresAt: meta.expiresAt,
    bytes: String(meta.bytes),
    sha256: meta.sha256,
    mime: meta.mime,
    requestId: meta.requestId,
    rayId: meta.rayId,
    capTokens: String(meta.capTokens),
    originalChars: String(meta.originalChars),
    opLedger: meta.opLedger,
    catalogGeneratedAt: meta.catalogGeneratedAt
  };
}

function fitCustomMetadata(meta: ArtifactMetadata): ArtifactMetadata {
  const fitted = { ...meta };
  let r2 = toR2Metadata(fitted);
  if (artifactCustomMetadataByteLength(r2) <= ARTIFACT_CUSTOM_METADATA_TARGET_BYTES) return fitted;

  const parsed = JSON.parse(fitted.opLedger) as {
    calls?: ArtifactOperationSummary[];
    total?: number;
    omitted?: number;
    totals?: Record<string, number>;
  };
  const calls = Array.isArray(parsed.calls) ? [...parsed.calls] : [];
  while (calls.length > 0 && artifactCustomMetadataByteLength(r2) > ARTIFACT_CUSTOM_METADATA_TARGET_BYTES) {
    calls.pop();
    fitted.opLedger = JSON.stringify({
      ...parsed,
      calls,
      omitted: Math.max(0, (parsed.total ?? 0) - calls.length),
      truncated: true
    });
    r2 = toR2Metadata(fitted);
  }

  if (artifactCustomMetadataByteLength(r2) <= ARTIFACT_CUSTOM_METADATA_MAX_BYTES) return fitted;

  fitted.opLedger = JSON.stringify({
    calls: [],
    total: parsed.total ?? 0,
    omitted: parsed.total ?? 0,
    totals: parsed.totals ?? {},
    truncated: true
  });
  r2 = toR2Metadata(fitted);
  if (artifactCustomMetadataByteLength(r2) <= ARTIFACT_CUSTOM_METADATA_MAX_BYTES) return fitted;

  const withoutLedger = { ...r2, opLedger: "" };
  const budget = ARTIFACT_CUSTOM_METADATA_MAX_BYTES - artifactCustomMetadataByteLength(withoutLedger);
  fitted.opLedger = budget >= 2 ? "{}" : "";
  return fitted;
}

function expired(meta: ArtifactMetadata, now: Date): boolean {
  const expiresAt = Date.parse(meta.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= now.getTime();
}

function reconstruct(mime: ArtifactMime, body: string): unknown {
  if (mime === "application/x.raven.undefined") return undefined;
  if (mime === "application/json") return JSON.parse(body);
  return body;
}

export async function put(
  bucket: R2Bucket,
  owner: unknown,
  input: ArtifactPutInput
): Promise<ArtifactPutResult> {
  const subject = requireOwner(owner);
  const bytes = bytesOf(input.body);
  if (bytes > ARTIFACT_MAX_BYTES) {
    return { ok: false, skipped: "size-cap", bytes, maxBytes: ARTIFACT_MAX_BYTES };
  }

  const id = crypto.randomUUID();
  const key = await keyFor(subject, id);

  const sha256 = await sha256Hex(input.body);
  const now = input.now ?? new Date();
  const meta = customMetadata(input, id, now, bytes, sha256);
  await bucket.put(key, input.body, {
    customMetadata: toR2Metadata(meta)
  });
  return { ok: true, artifact: meta };
}

export async function info(
  bucket: R2Bucket,
  owner: unknown,
  id: unknown,
  now = new Date()
): Promise<ArtifactInfoResult> {
  const subject = requireOwner(owner);
  if (!isArtifactId(id)) return ARTIFACT_NOT_FOUND;
  const key = await keyFor(subject, id);
  const object = await bucket.head(key);
  const meta = metadataFromCustom(id, object?.customMetadata);
  if (!meta || expired(meta, now)) return ARTIFACT_NOT_FOUND;
  return { ok: true, artifact: meta };
}

export async function read(
  bucket: R2Bucket,
  owner: unknown,
  id: unknown,
  now = new Date()
): Promise<ArtifactReadResult> {
  const subject = requireOwner(owner);
  if (!isArtifactId(id)) return ARTIFACT_NOT_FOUND;
  const key = await keyFor(subject, id);
  const object = await bucket.get(key);
  const meta = metadataFromCustom(id, object?.customMetadata);
  if (!object || !meta || expired(meta, now)) return ARTIFACT_NOT_FOUND;

  try {
    const body = await object.text();
    return { ok: true, artifact: meta, value: reconstruct(meta.mime, body) };
  } catch (e) {
    return {
      ok: false,
      error: { kind: "error", message: e instanceof Error ? e.message : String(e) }
    };
  }
}
