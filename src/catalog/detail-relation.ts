/**
 * The `detail` recovery relation says: the source returns parts of records, the target returns
 * one whole record, and the target is addressed by fields the source's rows already carry.
 * This file holds the one definition of "carries", so the catalog build, the manifest check, and
 * the execute-time walk cannot disagree.
 */

type SchemaLike = {
  properties?: Record<string, { type?: unknown; items?: { properties?: Record<string, unknown> } }>;
  required?: unknown;
};

type DetailEntryShape = {
  inputSchema?: unknown;
  outputSchema?: unknown;
  retrievalProfile?: { lane?: string };
};

/**
 * The target's required inputs, when a `detail` edge is valid: the target's lane is `detail`, it
 * has at least one required input, and one array of the source's output has items that carry every
 * one of them. Null when the edge is not valid.
 */
export function detailJoinKeys(source: DetailEntryShape, target: DetailEntryShape): string[] | null {
  if (target.retrievalProfile?.lane !== "detail") return null;
  const required = (target.inputSchema as SchemaLike | undefined)?.required;
  if (!Array.isArray(required) || required.length === 0 || !required.every((key) => typeof key === "string")) {
    return null;
  }
  const output = source.outputSchema as SchemaLike | undefined;
  for (const property of Object.values(output?.properties ?? {})) {
    if (property.type !== "array" || !property.items?.properties) continue;
    const itemKeys = property.items.properties;
    if ((required as string[]).every((key) => key in itemKeys)) return [...(required as string[])];
  }
  return null;
}

/**
 * Whether a returned payload holds at least one row that carries every join key of a `detail`
 * edge. The schema says the source's rows can carry the keys; a result can still hold rows that
 * do not (a site search returns audit and partner rows beside page rows, and only page rows have
 * a `path`). A key counts when its value is a non-empty string.
 */
export function rowsCarryJoinKeys(data: unknown, keys: readonly string[]): boolean {
  if (data === null || typeof data !== "object" || Array.isArray(data) || keys.length === 0) return false;
  return Object.values(data as Record<string, unknown>).some(
    (value) =>
      Array.isArray(value) &&
      value.some(
        (row) =>
          row !== null &&
          typeof row === "object" &&
          keys.every((key) => {
            const field = (row as Record<string, unknown>)[key];
            return typeof field === "string" && field !== "";
          })
      )
  );
}
