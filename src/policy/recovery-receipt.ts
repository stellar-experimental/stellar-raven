import type { Catalog } from "../catalog/types.ts";
import { renderSignature } from "../catalog/search.ts";

export const RECOVERY_RECEIPT_VERSION = 1;
export const RECOVERY_RECEIPT_TTL_MS = 5 * 60 * 1000;
export const RECOVERY_RECEIPT_MAX_CHARS = 4096;

const MARKER_PREFIX = "recovery-receipt/v1/";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;
const textEncoder = new TextEncoder();

type ReceiptPayload = {
  version: number;
  source: string;
  target: string;
  identity: string;
  /** Audit binding only. Consumption does not compare it to the later request. */
  requestId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

export type RecoveryTransition = {
  source: string;
  target: string;
};

export type RecoveryReceiptGrant = RecoveryTransition & {
  receipt: string;
  expiresAt: string;
};

export type RecoveryReceiptFailure =
  | "missing"
  | "invalid"
  | "version"
  | "identity"
  | "target"
  | "expired"
  | "replayed"
  | "unavailable";

export type RecoveryReceiptConsumeResult =
  | { ok: true; source: string; target: string; requestId: string; expiresAt: string }
  | { ok: false; reason: RecoveryReceiptFailure; message: string };

type LedgerCall = {
  op: string;
  outcome: "ok" | "error" | "soft-empty";
};

type ReceiptClock = {
  now?: () => number;
  nonce?: () => string;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array | undefined {
  if (!BASE64URL_RE.test(value)) return undefined;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return undefined;
  }
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  if (!secret) throw new Error("MCP_SERVER_SECRET is unset — recovery receipts are unavailable");
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, textEncoder.encode(`stellar-raven-recovery:${value}`))
  );
}

async function verifyHmac(secret: string, value: string, signature: Uint8Array): Promise<boolean> {
  if (!secret) throw new Error("MCP_SERVER_SECRET is unset — recovery receipts are unavailable");
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    textEncoder.encode(`stellar-raven-recovery:${value}`)
  );
}

async function identityBinding(secret: string, identity: string): Promise<string> {
  return bytesToBase64Url(await hmac(secret, `identity:${identity}`));
}

async function payloadDigest(encodedPayload: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(encodedPayload));
  return bytesToBase64Url(new Uint8Array(digest));
}

function receiptMarkerKey(nonce: string): string {
  return `${MARKER_PREFIX}${nonce}`;
}

function validPayload(value: unknown): value is ReceiptPayload {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Partial<ReceiptPayload>;
  const keys = Object.keys(value).sort();
  const expected = [
    "expiresAt",
    "identity",
    "issuedAt",
    "nonce",
    "requestId",
    "source",
    "target",
    "version"
  ];
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index]) &&
    Number.isInteger(payload.version) &&
    typeof payload.source === "string" && payload.source.length > 0 && payload.source.length <= 200 &&
    typeof payload.target === "string" && payload.target.length > 0 && payload.target.length <= 200 &&
    typeof payload.identity === "string" && payload.identity.length === 43 && BASE64URL_RE.test(payload.identity) &&
    typeof payload.requestId === "string" && payload.requestId.length > 0 && payload.requestId.length <= 200 &&
    Number.isInteger(payload.issuedAt) &&
    Number.isInteger(payload.expiresAt) &&
    typeof payload.nonce === "string" && UUID_RE.test(payload.nonce)
  );
}

async function signPayload(secret: string, payload: ReceiptPayload): Promise<{ receipt: string; encoded: string }> {
  const encoded = bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(secret, encoded));
  return { receipt: `${encoded}.${signature}`, encoded };
}

async function parseAndVerify(
  secret: string,
  receipt: string
): Promise<{ ok: true; payload: ReceiptPayload; encoded: string } | { ok: false; reason: RecoveryReceiptFailure }> {
  if (!receipt) return { ok: false, reason: "missing" };
  if (receipt.length > RECOVERY_RECEIPT_MAX_CHARS) return { ok: false, reason: "invalid" };
  const parts = receipt.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "invalid" };
  const payloadBytes = base64UrlToBytes(parts[0]);
  const signature = base64UrlToBytes(parts[1]);
  if (!payloadBytes || !signature) return { ok: false, reason: "invalid" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!validPayload(parsed)) return { ok: false, reason: "invalid" };
  if (!(await verifyHmac(secret, parts[0], signature))) return { ok: false, reason: "invalid" };
  if (parsed.version !== RECOVERY_RECEIPT_VERSION) return { ok: false, reason: "version" };
  return { ok: true, payload: parsed, encoded: parts[0] };
}

/** Sources that the manifest graph permits to issue a receipt for this target. */
export function qualifyingSourcesForRecoveryTarget(catalog: Catalog, targetId: string): string[] {
  return catalog.entries
    .filter((entry) =>
      entry.retrievalProfile?.recoverWith?.some(
        (edge) => edge.id === targetId && edge.relation === "source-code"
      )
    )
    .map((entry) => entry.id)
    .sort();
}

export function recoveryTransitionsFromLedger(
  catalog: Catalog,
  calls: readonly LedgerCall[]
): RecoveryTransition[] {
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const selectedTargets = new Set<string>();
  const transitions: RecoveryTransition[] = [];
  for (const call of calls) {
    if (call.outcome === "error") continue;
    const source = byId.get(call.op);
    if (!source) continue;
    // The host sees call outcomes, not row relevance. Edge `on` values guide
    // the model; every non-error completion can qualify for a receipt.
    for (const edge of source.retrievalProfile?.recoverWith ?? []) {
      const target = byId.get(edge.id);
      if (
        edge.relation !== "source-code" ||
        target?.kind !== "operation" ||
        target.discoveryMode !== "recovery-only" ||
        selectedTargets.has(target.id)
      ) {
        continue;
      }
      selectedTargets.add(target.id);
      transitions.push({ source: source.id, target: target.id });
    }
  }
  return transitions;
}

export async function issueRecoveryReceipt(
  bucket: R2Bucket,
  secret: string,
  identity: string,
  requestId: string,
  transition: RecoveryTransition,
  clock: ReceiptClock = {}
): Promise<RecoveryReceiptGrant> {
  const now = clock.now?.() ?? Date.now();
  const nonce = clock.nonce?.() ?? crypto.randomUUID();
  const payload: ReceiptPayload = {
    version: RECOVERY_RECEIPT_VERSION,
    source: transition.source,
    target: transition.target,
    identity: await identityBinding(secret, identity),
    requestId,
    issuedAt: now,
    expiresAt: now + RECOVERY_RECEIPT_TTL_MS,
    nonce
  };
  if (!validPayload(payload)) throw new Error("invalid recovery receipt issuance input");
  const signed = await signPayload(secret, payload);
  // This relies on R2 treating "*" as the HTTP If-None-Match wildcard.
  const marker = await bucket.put(receiptMarkerKey(nonce), "ready", {
    onlyIf: { etagDoesNotMatch: "*" },
    customMetadata: {
      state: "ready",
      digest: await payloadDigest(signed.encoded),
      expiresAt: String(payload.expiresAt)
    }
  });
  if (!marker) throw new Error("recovery receipt nonce collision");
  return {
    ...transition,
    receipt: signed.receipt,
    expiresAt: new Date(payload.expiresAt).toISOString()
  };
}

/** Render the sole model-facing receipt handoff for MCP and the demo. */
export function recoveryReceiptBlock(
  catalog: Catalog,
  grants?: readonly RecoveryReceiptGrant[]
): string {
  if (!grants?.length) return "";
  return `\n\n--- RECOVERY RECEIPT ---\n${grants
    .map((grant) => {
      const entry = catalog.entries.find((candidate) => candidate.id === grant.target);
      if (!entry || entry.kind !== "operation") {
        throw new Error(`recovery receipt target ${grant.target} is not an exposed operation`);
      }
      const signature = renderSignature(entry, { compactOversizedOutput: true });
      if (!signature) {
        throw new Error(`recovery receipt target ${grant.target} has no callable signature`);
      }
      const input = JSON.stringify({
        code: `async () => ${grant.target}({ q: "<remaining code question>", repo: "<owner/name>" })`,
        recoveryReceipt: grant.receipt
      });
      return [
        `${grant.source} completed. If its result was empty or adjacent, one later execute may call ${grant.target} once before ${grant.expiresAt}.`,
        "Contract (from the manifest):",
        entry.description,
        signature,
        "Put the whole remaining code question in q. Pin repo to the exact current owner/name when you know it.",
        "Send exactly this shape as the execute tool input. The receipt is a top-level field beside code, never inside the script or the call arguments:",
        input
      ].join("\n");
    })
    .join("\n")}`;
}

function failure(reason: RecoveryReceiptFailure): RecoveryReceiptConsumeResult {
  const messages: Record<RecoveryReceiptFailure, string> = {
    missing: "a recovery receipt is required before this operation can run",
    invalid: "the recovery receipt is invalid or altered",
    version: "the recovery receipt version is not supported",
    identity: "the recovery receipt belongs to another authenticated identity",
    target: "the recovery receipt does not authorize this operation",
    expired: "the recovery receipt has expired",
    replayed: "the recovery receipt was already used",
    unavailable: "the recovery receipt cannot be verified"
  };
  return { ok: false, reason, message: messages[reason] };
}

export async function consumeRecoveryReceipt(
  bucket: R2Bucket,
  secret: string,
  identity: string,
  target: string,
  receipt: string | undefined,
  clock: Pick<ReceiptClock, "now"> = {}
): Promise<RecoveryReceiptConsumeResult> {
  const verified = await parseAndVerify(secret, receipt ?? "");
  if (!verified.ok) return failure(verified.reason);
  const { payload, encoded } = verified;
  const now = clock.now?.() ?? Date.now();
  const identitySignature = base64UrlToBytes(payload.identity);
  if (!identitySignature || !(await verifyHmac(secret, `identity:${identity}`, identitySignature))) {
    return failure("identity");
  }
  if (payload.target !== target) return failure("target");
  if (
    payload.expiresAt <= now ||
    payload.issuedAt > now + 30_000 ||
    payload.expiresAt - payload.issuedAt !== RECOVERY_RECEIPT_TTL_MS
  ) {
    return failure("expired");
  }

  let marker: R2Object | null;
  try {
    marker = await bucket.head(receiptMarkerKey(payload.nonce));
  } catch {
    return failure("unavailable");
  }
  if (!marker) return failure("replayed");
  if (marker.customMetadata?.state !== "ready") return failure("replayed");
  if (
    marker.customMetadata.digest !== await payloadDigest(encoded) ||
    marker.customMetadata.expiresAt !== String(payload.expiresAt)
  ) {
    return failure("invalid");
  }

  try {
    const consumed = await bucket.put(receiptMarkerKey(payload.nonce), "used", {
      onlyIf: { etagMatches: marker.etag },
      customMetadata: {
        state: "used",
        expiresAt: String(payload.expiresAt),
        consumedAt: String(now)
      }
    });
    if (!consumed) return failure("replayed");
  } catch {
    return failure("unavailable");
  }
  return {
    ok: true,
    source: payload.source,
    target: payload.target,
    requestId: payload.requestId,
    expiresAt: new Date(payload.expiresAt).toISOString()
  };
}
