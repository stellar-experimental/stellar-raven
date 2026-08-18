/**
 * Catalog id helpers. The terminal segment is the high-weight
 * name field for search scoring (catalog/search.ts), the sandbox function
 * name per operation (executor/providers.ts), and the skill terminal name
 * used by nearest-id suggestions (skills/store.ts).
 *
 * Plain module, no I/O — importable under plain `node` type-stripping
 * (the eval CLI + vitest both load src/catalog/** directly).
 */

/**
 * The segment after the final "." of an id, ignoring any `#<section>` suffix.
 * `lumenloop.search_directory` → `search_directory`;
 * `skills.stellar-dev.smart-contracts#storage` → `smart-contracts`.
 */
export function lastIdSegment(id: string): string {
  const base = id.split("#")[0] ?? id;
  const segments = base.split(".");
  return segments[segments.length - 1] ?? id;
}

/**
 * A legal JS identifier — the one place this rule lives. A kind:"operation"
 * entry's `service` and terminal name segment (`lastIdSegment`) each become a
 * sandbox namespace/function name in executor/providers.ts, so both MUST match
 * this. loadManifest (catalog/search.ts) enforces it at load time so a builder
 * regression THROWS loudly instead of yielding a searchable-but-uncallable op.
 */
export const VALID_IDENT = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
