/**
 * A document series: an operation that searches documents, whose input filters them by a `source`
 * enum that its rows also carry. The values of that enum are the series the upstream service
 * itself declares ("sep", "cap", ...). This file holds the one definition, so the catalog build,
 * the manifest check, and the execute-time pointer cannot disagree. It keeps no list of standards.
 */

/** Lanes whose rows are candidate evidence; the host marks exact rows only on these (src/executor/providers.ts). */
export const CANDIDATE_LANES: ReadonlySet<string> = new Set(["semantic", "research", "av"]);

/** The filter, and the row keys that make a row a document: the same two fields `exactRowsOf` reads. */
export const SERIES_FILTER = "source";
export const SERIES_ROW_KEYS: readonly string[] = [SERIES_FILTER, "url"];
/** The input that carries the identifier, in the order the operation's own contract prefers. */
export const SERIES_QUERY_INPUTS: readonly string[] = ["q", "query"];

export type DocumentSeries = {
  filter: string;
  /** The input string that holds the query. */
  query: string;
  /** The enum values that are plain lower-case letters, in the upstream's order. */
  values: string[];
};

type PropertyLike = { type?: unknown; enum?: unknown; items?: { properties?: Record<string, unknown> } };
type SchemaLike = { properties?: Record<string, PropertyLike> };

type SeriesEntryShape = {
  kind?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
  retrievalProfile?: { lane?: string };
};

/**
 * The series an operation declares, or null. It needs a candidate lane, a string query input, a
 * `source` input enum, and one output array whose rows carry `source` and `url`. Enum values that
 * are not plain letters (`sdf-blog`) cannot be the letters of an identifier and are left out.
 */
export function documentSeriesOf(entry: SeriesEntryShape): DocumentSeries | null {
  if (entry.kind !== "operation") return null;
  const lane = entry.retrievalProfile?.lane;
  if (lane === undefined || !CANDIDATE_LANES.has(lane)) return null;
  const input = (entry.inputSchema as SchemaLike | undefined)?.properties ?? {};
  const query = SERIES_QUERY_INPUTS.find((name) => input[name]?.type === "string");
  const enumValues = input[SERIES_FILTER]?.enum;
  if (!query || !Array.isArray(enumValues)) return null;
  const output = (entry.outputSchema as SchemaLike | undefined)?.properties ?? {};
  const rowsCarryKeys = Object.values(output).some(
    (property) =>
      property.type === "array" && SERIES_ROW_KEYS.every((key) => key in (property.items?.properties ?? {}))
  );
  if (!rowsCarryKeys) return null;
  const values = enumValues.filter((value): value is string => typeof value === "string" && /^[a-z]+$/.test(value));
  return values.length > 0 ? { filter: SERIES_FILTER, query, values } : null;
}
