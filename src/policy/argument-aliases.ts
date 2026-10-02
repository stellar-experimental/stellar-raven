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
 * array. Exact-match data by operation id, like exposure (ADR-0003).
 */
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
 * when the scalar holds a comma and the array parameter is absent; any other
 * combination is left for validation to judge.
 */
export function applyArgumentAliases(id: string, args: unknown): unknown {
  const aliases = ARGUMENT_ALIASES[id];
  if (!aliases || args === null || typeof args !== "object" || Array.isArray(args)) return args;
  let out = args as Record<string, unknown>;
  for (const alias of aliases) {
    const value = out[alias.from];
    if (typeof value !== "string" || !value.includes(",") || out[alias.to] !== undefined) continue;
    const list = value.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
    const { [alias.from]: _dropped, ...rest } = out;
    out = { ...rest, [alias.to]: list };
  }
  return out;
}
