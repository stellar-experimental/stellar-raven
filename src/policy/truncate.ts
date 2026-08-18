/**
 * Result truncation for model-facing output (configured token budget, default
 * ~6k, with an actionable footer; PLAN §4 / research/codemode.md §9 item 7).
 *
 * Why not import codemode's `truncateResult`: it IS importable inside the
 * Worker, but the package's main entry imports `cloudflare:workers`, which
 * makes every module that touches it untestable under plain-Node vitest.
 * The semantics are small, so this pure module keeps the policy layer
 * testable under Node. The footer also identifies the clipped bulk by key,
 * array length, or string length.
 *
 * Applied ONLY at the model boundary (the `execute` tool's final result +
 * logs/errors) — results flowing back INTO sandbox code cost no context
 * tokens and are never truncated, so scripts can post-process big payloads
 * freely.
 */

export const DEFAULT_MAX_TOKENS = 6000;
export const MIN_MODEL_BOUNDARY_MAX_TOKENS = 1000;
export const MAX_MODEL_BOUNDARY_MAX_TOKENS = 32000;
export const MODEL_BOUNDARY_MAX_TOKENS_ENV = "EXECUTE_MODEL_BOUNDARY_MAX_TOKENS";
export const CHARS_PER_TOKEN = 4;

export type Truncated = {
  text: string;
  truncated: boolean;
  /** Serialized result size before truncation. */
  originalChars: number;
  /** Returned text size after any truncation footer has been appended. */
  returnedChars: number;
  /** Boundary used for this truncation decision. */
  maxTokens: number;
  /** Character budget implied by maxTokens and CHARS_PER_TOKEN. */
  maxChars: number;
  /** Same estimate the footer uses; useful for observability aggregates. */
  approxOriginalTokens: number;
};

/**
 * Advice-only options for the truncation footer. SECURITY INVARIANT: these
 * flags may change the ADVICE TEXT appended after the cut, never which bytes
 * of the result are kept or where the cut lands — the bounded token cap is a
 * security boundary, and no caller-supplied signal may widen it.
 */
export type TruncateAdvice = {
  /** Host-set: a skill body/section was read this run — advise section reads. */
  skillSectionAdvice?: boolean;
};

/**
 * Host-side cap configuration for the execute model boundary. The default is
 * deliberately unchanged; all overrides are bounded so this is not an
 * unbounded payload-dump switch.
 */
export function modelBoundaryMaxTokensFromValue(raw: unknown): number {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_MAX_TOKENS;
  const value = typeof raw === "number" ? String(raw) : String(raw).trim();
  if (!/^\d+$/.test(value)) return DEFAULT_MAX_TOKENS;
  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < MIN_MODEL_BOUNDARY_MAX_TOKENS ||
    parsed > MAX_MODEL_BOUNDARY_MAX_TOKENS
  ) {
    return DEFAULT_MAX_TOKENS;
  }
  return parsed;
}

export function modelBoundaryMaxTokensFromEnv(env: Record<string, unknown> = {}): number {
  return modelBoundaryMaxTokensFromValue(env[MODEL_BOUNDARY_MAX_TOKENS_ENV]);
}

function footer(
  originalChars: number,
  maxTokens: number,
  detail: string,
  advice?: TruncateAdvice
): string {
  const approxTokens = Math.round(originalChars / CHARS_PER_TOKEN);
  const skillHint = advice?.skillSectionAdvice
    ? " This run read skill content: request specific sections via codemode.skill.read(id, { sections: [...] }) (keys in availableSections) instead of whole skills."
    : "";
  const detailPart = detail ? ` ${detail}` : "";
  return `\n--- TRUNCATED --- Result was ~${approxTokens} tokens (limit: ${maxTokens}).${detailPart} Re-run returning a smaller value: select only the fields you need, slice arrays, or project fewer columns / aggregate inside the sandbox before returning.${skillHint}`;
}

/** Max keys listed per footer group, and max chars of a key name shown. */
const MAX_LISTED_KEYS = 8;
const MAX_KEY_DISPLAY_CHARS = 40;

function approxSize(chars: number): string {
  return chars < 1000 ? `${chars} chars` : `~${(chars / 1000).toFixed(1)}k chars`;
}

function displayKey(key: string): string {
  const shown = key.length > MAX_KEY_DISPLAY_CHARS ? `${key.slice(0, MAX_KEY_DISPLAY_CHARS - 1)}…` : key;
  return `"${shown}"`;
}

type KeySegment = { key: string; size: number; start: number; end: number };

/**
 * Locate each top-level key's span inside the compact serialization by
 * mirroring JSON.stringify's layout ({"k":v,"k2":v2,...}; entries whose value
 * serializes to undefined are skipped). Returns null when the reconstruction
 * doesn't add up (toJSON on the object, exotic proxies) — the footer then
 * degrades to the generic advice rather than report wrong spans.
 */
function objectKeySegments(value: Record<string, unknown>, serializedChars: number): KeySegment[] | null {
  const segs: KeySegment[] = [];
  let pos = 1; // past the opening "{"
  for (const key of Object.keys(value)) {
    let part: string | undefined;
    try {
      part = JSON.stringify(value[key]);
    } catch {
      return null; // getter threw on re-access; don't guess spans
    }
    if (part === undefined) continue;
    if (segs.length > 0) pos += 1; // separating comma
    const start = pos;
    pos += JSON.stringify(key).length + 1 + part.length; // "key":value
    segs.push({ key, size: part.length, start, end: pos });
  }
  return pos + 1 === serializedChars ? segs : null; // +1: closing "}"
}

/** How many leading array items survive the clip in full (same layout mirroring). */
function arrayItemsKept(value: unknown[], maxChars: number): number {
  let pos = 1; // past the opening "["
  let kept = 0;
  for (let i = 0; i < value.length; i++) {
    let part: string | undefined;
    try {
      part = JSON.stringify(value[i]);
    } catch {
      return kept;
    }
    if (i > 0) pos += 1; // separating comma
    pos += (part ?? "null").length; // undefined items serialize as null
    if (pos > maxChars) break;
    kept = i + 1;
  }
  return kept;
}

/**
 * One sentence saying WHERE the clipped bulk was, so the agent can re-run
 * projecting it away instead of re-running the whole batch blind. Objects
 * name the top-level keys that were cut or dropped (largest first, with
 * approximate serialized sizes); arrays and strings report kept-vs-total.
 * Empty string when nothing useful can be said (the generic advice stands).
 */
function lossDetail(value: unknown, serializedChars: number, maxChars: number): string {
  if (typeof value === "string") {
    return `String result: kept the first ${maxChars} of ${serializedChars} chars.`;
  }
  if (Array.isArray(value)) {
    return `Array result: kept the first ~${arrayItemsKept(value, maxChars)} of ${value.length} items.`;
  }
  if (value === null || typeof value !== "object") return "";
  const segs = objectKeySegments(value as Record<string, unknown>, serializedChars);
  if (!segs) return "";
  const lost = segs.filter((s) => s.end > maxChars);
  const kept = segs.filter((s) => s.end <= maxChars);
  if (lost.length === 0) return "";
  const lostList = [...lost]
    .sort((a, b) => b.size - a.size)
    .slice(0, MAX_LISTED_KEYS)
    .map((s) => `${displayKey(s.key)} ${approxSize(s.size)} (${s.start >= maxChars ? "dropped" : "cut"})`)
    .join(", ");
  const lostMore = lost.length > MAX_LISTED_KEYS ? ` +${lost.length - MAX_LISTED_KEYS} more` : "";
  const keptPart =
    kept.length > 0
      ? `; kept intact: ${kept
          .slice(0, MAX_LISTED_KEYS)
          .map((s) => displayKey(s.key))
          .join(", ")}${kept.length > MAX_LISTED_KEYS ? ` +${kept.length - MAX_LISTED_KEYS} more` : ""}`
      : "";
  return `Bulk lost from top-level keys: ${lostList}${lostMore}${keptPart}.`;
}

/**
 * Serialize a value for the model within a token budget. Small values pass
 * through as compact JSON; oversized ones are clipped with a footer telling
 * the model how to get under the limit (shape the return value in-script).
 * `advice` tweaks footer wording only — see TruncateAdvice.
 */
export function truncateForModel(
  value: unknown,
  maxTokens = DEFAULT_MAX_TOKENS,
  advice?: TruncateAdvice
): Truncated {
  maxTokens = modelBoundaryMaxTokensFromValue(maxTokens);
  let text: string;
  if (typeof value === "string") {
    text = value;
  } else if (value === undefined) {
    text = "undefined";
  } else {
    try {
      text = JSON.stringify(value);
    } catch (e) {
      text = `[unserializable result: ${e instanceof Error ? e.message : String(e)}]`;
    }
  }
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const approxOriginalTokens = Math.round(text.length / CHARS_PER_TOKEN);
  if (text.length <= maxChars) {
    return {
      text,
      truncated: false,
      originalChars: text.length,
      returnedChars: text.length,
      maxTokens,
      maxChars,
      approxOriginalTokens
    };
  }
  // SECURITY: the cut position is fixed at maxChars regardless of shape; the
  // loss detail only changes the ADVICE TEXT appended after it. Callers
  // redact BEFORE this function (run.ts), so both the kept prefix and any key
  // names echoed in the footer are already scrubbed — never reorder that.
  const returnedText = text.slice(0, maxChars) + footer(text.length, maxTokens, lossDetail(value, text.length, maxChars), advice);
  return {
    text: returnedText,
    truncated: true,
    originalChars: text.length,
    returnedChars: returnedText.length,
    maxTokens,
    maxChars,
    approxOriginalTokens
  };
}

function logsFooter(originalChars: number, maxTokens: number): string {
  const approxTokens = Math.round(originalChars / CHARS_PER_TOKEN);
  return `\n--- TRUNCATED --- console output was ~${approxTokens} tokens (limit: ${maxTokens}). console.log is for diagnostics: log counts and previews, not whole payloads — return data from the script instead.`;
}

/**
 * Token budget for the `execute` tool's console-logs block, applied to the
 * joined lines AFTER shapeLogs' structural caps (line count / line length).
 * Deliberately equal to the result budget rather than tighter: logs are the
 * model's only diagnostic channel when a script fails, and clipping them
 * hurts most during debugging. This bound prevents payloads from bypassing
 * the result cap through console.log. Execute telemetry records when it fires
 * (`logsTruncated`); tighten it only when production data supports the change.
 */
export function truncateLogsForModel(text: string, maxTokens = DEFAULT_MAX_TOKENS): Truncated {
  maxTokens = modelBoundaryMaxTokensFromValue(maxTokens);
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const approxOriginalTokens = Math.round(text.length / CHARS_PER_TOKEN);
  if (text.length <= maxChars) {
    return {
      text,
      truncated: false,
      originalChars: text.length,
      returnedChars: text.length,
      maxTokens,
      maxChars,
      approxOriginalTokens
    };
  }
  const returnedText = text.slice(0, maxChars) + logsFooter(text.length, maxTokens);
  return {
    text: returnedText,
    truncated: true,
    originalChars: text.length,
    returnedChars: returnedText.length,
    maxTokens,
    maxChars,
    approxOriginalTokens
  };
}
