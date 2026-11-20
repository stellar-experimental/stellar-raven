/** Catalog id helpers; plain-Node importable (`src/catalog/**`). */

/** Segment after the final `.`, ignoring any `#<section>` suffix. */
export function lastIdSegment(id: string): string {
  const base = id.split("#")[0] ?? id;
  const segments = base.split(".");
  return segments[segments.length - 1] ?? id;
}

/** Legal JS identifier; enforced by `loadManifest` for operation services and names used as sandbox globals. */
export const VALID_IDENT = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
