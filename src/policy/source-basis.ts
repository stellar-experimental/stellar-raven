import { CHARS_PER_TOKEN, DEFAULT_MAX_TOKENS, truncateForModel, type Truncated } from "./truncate.ts";

export const SOURCE_BASIS_MANIFEST_MAX_CHARS = 1600;

const MAX_URLS = 5;
const INITIAL_MAX_CALLS = 14;
const INITIAL_SHAPE_DETAIL_CHARS = 420;
const MIN_SHAPE_DETAIL_CHARS = 120;
const MAX_ATOM_CHARS = 96;

export type SourceBasisShapeKind = "object" | "array" | "string";

type SourceBasisShapeBase = {
  serializedChars: number;
  approxTokens?: number;
  /**
   * Human-readable loss detail derived from truncateForModel's existing
   * loss-detail/key-segment machinery. Do not build a parallel key-span
   * summarizer here.
   */
  lossDetail?: string;
};

export type SourceBasisShape = SourceBasisShapeBase &
  (
    | { kind: "object"; totalKeys: number; totalItems?: never; stringChars?: never }
    | { kind: "array"; totalItems: number; totalKeys?: never; stringChars?: never }
    | { kind: "string"; stringChars: number; totalKeys?: never; totalItems?: never }
  );

export type SourceBasisCallOutcome = "ok" | "error" | "soft-empty";

export type SourceBasisCall = {
  op: string;
  outcome: SourceBasisCallOutcome;
  ms: number;
};

export type SourceBasisArtifact =
  | {
      state: "available";
      id: string;
      sha256: string;
      bytes: number;
      expiresAt: string;
    }
  | { state: "skipped"; reason: string }
  | { state: "absent"; reason?: string };

export type BuildSourceBasisManifestInput = {
  shape: SourceBasisShape;
  calls: SourceBasisCall[];
  canonicalUrls?: string[];
  artifact?: SourceBasisArtifact;
  skillSectionAdvice?: boolean;
};

export type BuildSourceBasisManifestOptions = {
  maxChars?: number;
};

export type SourceBasisTelemetry = {
  shape: SourceBasisShapeKind;
  calls: {
    first: SourceBasisCall[];
    total: number;
    omitted: number;
    totals: Record<SourceBasisCallOutcome, number>;
  };
  canonicalUrlCount: number;
  artifactState: SourceBasisArtifact["state"];
  skillSectionAdvice: boolean;
};

export function projectSourceBasisTelemetry(
  input: BuildSourceBasisManifestInput | undefined,
  callLimit: number
): SourceBasisTelemetry | null {
  if (!input) return null;
  const calls = input.calls ?? [];
  return {
    shape: input.shape.kind,
    calls: {
      first: calls.slice(0, callLimit),
      total: calls.length,
      omitted: Math.max(0, calls.length - callLimit),
      totals: sourceBasisCallTotals(calls)
    },
    canonicalUrlCount: input.canonicalUrls?.length ?? 0,
    artifactState: input.artifact?.state ?? "absent",
    skillSectionAdvice: input.skillSectionAdvice === true
  };
}

export function sourceBasisShapeFromValue(value: unknown, maxTokens = DEFAULT_MAX_TOKENS): SourceBasisShape {
  const truncated = truncateForModel(value, maxTokens);
  return sourceBasisShapeFromTruncation(value, truncated);
}

export function sourceBasisShapeFromTruncation(value: unknown, truncated: Truncated): SourceBasisShape {
  const base = {
    serializedChars: truncated.originalChars,
    approxTokens: truncated.approxOriginalTokens,
    lossDetail: extractLossDetail(truncated.text, truncated.maxChars)
  };

  if (Array.isArray(value)) return { ...base, kind: "array", totalItems: value.length };
  if (typeof value === "string") return { ...base, kind: "string", stringChars: value.length };
  if (value !== null && typeof value === "object") {
    return { ...base, kind: "object", totalKeys: Object.keys(value).length };
  }
  return { ...base, kind: "string", stringChars: truncated.originalChars };
}

export function buildSourceBasisManifest(
  input: BuildSourceBasisManifestInput,
  options: BuildSourceBasisManifestOptions = {}
): string {
  const maxChars = positiveInteger(options.maxChars) ?? SOURCE_BASIS_MANIFEST_MAX_CHARS;
  const urls = sanitizeCanonicalUrls(input.canonicalUrls ?? []);
  let callLimit = Math.min(input.calls.length, INITIAL_MAX_CALLS);
  let urlLimit = Math.min(urls.length, MAX_URLS);
  let shapeDetailLimit = INITIAL_SHAPE_DETAIL_CHARS;

  for (;;) {
    const text = serializeManifest(input, urls, {
      callLimit,
      urlLimit,
      shapeDetailLimit
    });
    if (text.length <= maxChars) return text;
    if (callLimit > 0) {
      callLimit -= 1;
      continue;
    }
    if (urlLimit > 0) {
      urlLimit -= 1;
      continue;
    }
    if (shapeDetailLimit > MIN_SHAPE_DETAIL_CHARS) {
      shapeDetailLimit = Math.max(MIN_SHAPE_DETAIL_CHARS, shapeDetailLimit - 60);
      continue;
    }

    const fallback = serializeManifest(input, urls, {
      callLimit: 0,
      urlLimit: 0,
      shapeDetailLimit: MIN_SHAPE_DETAIL_CHARS
    });
    return fallback.length <= maxChars ? fallback : `${fallback.slice(0, Math.max(0, maxChars - 3))}...`;
  }
}

export function sanitizeCanonicalUrls(rawUrls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawUrls) {
    if (out.length >= MAX_URLS) break;
    let url: URL;
    try {
      url = new URL(String(raw));
    } catch {
      continue;
    }
    if (url.protocol !== "https:") continue;
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    const sanitized = url.href;
    if (seen.has(sanitized)) continue;
    seen.add(sanitized);
    out.push(sanitized);
  }
  return out;
}

function serializeManifest(
  input: BuildSourceBasisManifestInput,
  urls: string[],
  limits: { callLimit: number; urlLimit: number; shapeDetailLimit: number }
): string {
  return [
    "--- SOURCE BASIS ---",
    `shape: ${shapeLine(input.shape, limits.shapeDetailLimit)}`,
    `calls: ${callsLine(input.calls, limits.callLimit)}`,
    `canonicalUrls: ${urlsLine(urls, input.canonicalUrls?.length ?? 0, limits.urlLimit)}`,
    `artifact: ${artifactLine(input.artifact)}`,
    `guidance: ${guidanceLine(input)}`
  ].join("\n");
}

function guidanceLine(input: BuildSourceBasisManifestInput): string {
  const skillClause = input.skillSectionAdvice
    ? " This run read skill content: return specific sections or aggregates, not whole skill bodies."
    : "";
  if (input.artifact?.state === "available") {
    return `prefer a narrower re-run; for full data call codemode.artifact.read(id) inside execute (data into the sandbox is never truncated; project a small answer out).${skillClause}`;
  }
  return `prefer a narrower re-run: select only the fields you need, slice arrays, or aggregate inside the sandbox before returning.${skillClause}`;
}

function shapeLine(shape: SourceBasisShape, detailLimit: number): string {
  const parts = [
    shape.kind,
    `${safeInteger(shape.serializedChars)} chars`,
    `~${safeInteger(shape.approxTokens ?? Math.round(shape.serializedChars / CHARS_PER_TOKEN))} tokens`
  ];
  if (shape.kind === "object") parts.push(`${safeInteger(shape.totalKeys)} top-level keys`);
  if (shape.kind === "array") parts.push(`${safeInteger(shape.totalItems)} items`);
  if (shape.kind === "string") parts.push(`${safeInteger(shape.stringChars)} string chars`);
  const detail = truncateAtom(shape.lossDetail ?? "", detailLimit);
  return detail ? `${parts.join("; ")}; ${detail}` : parts.join("; ");
}

function callsLine(calls: SourceBasisCall[], limit: number): string {
  if (calls.length === 0) return "none";
  const shown = calls.slice(0, Math.max(0, limit)).map((call) => {
    const op = truncateAtom(call.op, MAX_ATOM_CHARS);
    const ms = Number.isFinite(call.ms) ? `${Math.max(0, Math.round(call.ms))}ms` : "?ms";
    return `${op}=${call.outcome}/${ms}`;
  });
  const totals = callTotals(calls);
  const suffix = calls.length > shown.length ? ` (+${calls.length - shown.length} more; ${totals})` : ` (${totals})`;
  return shown.length > 0 ? `${shown.join("; ")}${suffix}` : `${calls.length} calls omitted (${totals})`;
}

function urlsLine(urls: string[], rawCount: number, limit: number): string {
  if (urls.length === 0) return "none (data-derived/untrusted; https-only after sanitization)";
  const shown = urls.slice(0, Math.max(0, limit)).map((u) => truncateAtom(u, 140));
  const omitted = Math.max(0, rawCount - shown.length);
  const suffix = omitted > 0 ? ` (+${omitted} more omitted or sanitized away)` : "";
  return `data-derived/untrusted; ${shown.join("; ")}${suffix}`;
}

function artifactLine(artifact: SourceBasisArtifact | undefined): string {
  if (!artifact || artifact.state === "absent") {
    const reason = artifact?.reason ? ` (${truncateAtom(artifact.reason, MAX_ATOM_CHARS)})` : "";
    return `absent${reason}`;
  }
  if (artifact.state === "skipped") return `skipped (${truncateAtom(artifact.reason, MAX_ATOM_CHARS)})`;
  return [
    `id=${truncateAtom(artifact.id, MAX_ATOM_CHARS)}`,
    `sha256=${truncateAtom(artifact.sha256.slice(0, 12), 12)}`,
    `bytes=${safeInteger(artifact.bytes)}`,
    `expiresAt=${truncateAtom(artifact.expiresAt, MAX_ATOM_CHARS)}`
  ].join(" ");
}

function extractLossDetail(text: string, maxChars: number): string {
  const footer = text.slice(maxChars);
  const match = /^\n--- TRUNCATED --- Result was ~\d+ tokens \(limit: \d+\)\.(.*?) Re-run returning/s.exec(footer);
  return match?.[1]?.trim() ?? "";
}

function sourceBasisCallTotals(calls: SourceBasisCall[]): Record<SourceBasisCallOutcome, number> {
  let ok = 0;
  let error = 0;
  let softEmpty = 0;
  for (const call of calls) {
    if (call.outcome === "ok") ok += 1;
    else if (call.outcome === "error") error += 1;
    else softEmpty += 1;
  }
  return { ok, error, "soft-empty": softEmpty };
}

function callTotals(calls: SourceBasisCall[]): string {
  const totals = sourceBasisCallTotals(calls);
  return `totals ok=${totals.ok} error=${totals.error} soft-empty=${totals["soft-empty"]}`;
}

function truncateAtom(value: string, maxChars: number): string {
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, Math.max(0, maxChars - 3))}...`;
}

function safeInteger(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function positiveInteger(value: unknown): number | undefined {
  if (!Number.isInteger(value) || (value as number) <= 0) return undefined;
  return value as number;
}
