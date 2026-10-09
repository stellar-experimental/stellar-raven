/**
 * Documented upstream argument aliases, applied host-side BEFORE validation.
 *
 * An upstream OpenAPI description can promise an input form that the generated
 * single-value schema rejects. Scout 1.9.61 says a comma in `source` on
 * GET /api/research is read like the `sources` array; Raven validates `source`
 * against its enum, so `source: "cap,sep"` would fail before any call while
 * the upstream would accept it. Rather than edit model-facing text (every
 * description word moves the lexical routing gate), honor the documented alias
 * here: the scalar is split into the sibling array, then validated as that
 * array. Cross-parameter aliases use exact operation ids, like exposure
 * (ADR-0003). Same-parameter normalization instead reads the manifest: only
 * array parameters whose descriptions say comma-separated or comma-separable
 * accept a string list. A test pins the exact matched operation/parameter set
 * so an upstream description change requires explicit review. Empty lists
 * remain strings for validation; normalization never bypasses the guard.
 */
import type { CatalogEntry } from "../catalog/types.ts";

export type ArgumentAlias = {
  /** `kind` names the one normalization this table supports. */
  kind: "comma-list";
  /** The scalar parameter the caller used. */
  from: string;
  /** The array parameter the upstream reads the comma-joined scalar as. */
  to: string;
};

export const ARGUMENT_ALIASES: Readonly<Record<string, readonly ArgumentAlias[]>> = Object.freeze({
  "scout.searchResearch": [{ kind: "comma-list", from: "source", to: "sources" }]
});

/**
 * Return the arguments with every documented alias applied. Non-object input
 * passes through untouched so the validator reports it. An alias applies only
 * when the scalar holds a comma with at least one non-empty item, and the
 * array parameter is absent. Other combinations remain subject to validation.
 * A string in an array parameter
 * is split only when that parameter documents a comma-separated form.
 */
export function applyArgumentAliases(entry: CatalogEntry, args: unknown): unknown {
  if (args === null || typeof args !== "object" || Array.isArray(args)) return args;
  let out = args as Record<string, unknown>;
  for (const alias of ARGUMENT_ALIASES[entry.id] ?? []) {
    const value = out[alias.from];
    if (typeof value !== "string" || !value.includes(",") || out[alias.to] !== undefined) continue;
    const list = commaList(value);
    if (list.length === 0) continue;
    const { [alias.from]: _dropped, ...rest } = out;
    out = { ...rest, [alias.to]: list };
  }
  const properties = entry.inputSchema?.properties as Record<string, { type?: string; description?: string }> | undefined;
  for (const [name, parameter] of Object.entries(properties ?? {})) {
    if (parameter.type !== "array" || !/\bcomma[- ](?:separated|separable)\b/i.test(parameter.description ?? "")) continue;
    const value = out[name];
    if (typeof value !== "string") continue;
    const list = commaList(value);
    if (list.length > 0) out = { ...out, [name]: list };
  }
  return out;
}

function commaList(value: string): string[] {
  return value.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
}
