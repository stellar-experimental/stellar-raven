/**
 * VENDORED (adapted) from @cloudflare/codemode@0.4.2
 *   upstream source: src/connectors/search.ts (`searchConnectors` and helpers;
 *   shipped inside dist/index.js in the published package)
 *
 * Why vendored instead of imported:
 *   1. `searchConnectors` is NOT exported from the package's public entry
 *      points in 0.4.2 (only Connector classes / executor / type-gen are).
 *   2. Even if it were, the main entry imports `cloudflare:workers`, so it
 *      cannot be loaded from plain Node — and src/catalog/search.ts must be
 *      importable from vitest and the eval CLI (frozen search contract).
 *
 * Adaptation: upstream scores ConnectorDescription items with fields
 * {path, connector, method, description}. Our catalog entries map onto the
 * same scheme — id→path(12), name(last id segment)→method(10),
 * service→connector(8), description→description(5) — plus a low-weight
 * kind field (2). Scoring math (exact/prefix/phrase multipliers, token hits,
 * coverage gate, bonuses) is unchanged from upstream.
 */

export type ScorableEntry = {
  /** Full catalog id, e.g. "lumenloop.search_directory" (upstream: path). */
  id: string;
  /** Last id segment / operation name (upstream: method). */
  name: string;
  /** Service namespace (upstream: connector). */
  service: string;
  /** Entry kind: operation | skill | skill-section (extra field, low weight). */
  kind: string;
  description: string;
};

const FIELD_WEIGHTS = {
  id: 12,
  name: 10,
  service: 8,
  description: 5,
  kind: 2
} as const;

export function normalizeSearchText(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_./:#-]+/g, " ")
    .toLowerCase()
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

type PreparedField = { raw: string; tokens: string[] };

function prepareField(value: string | undefined): PreparedField {
  return { raw: normalizeSearchText(value ?? ""), tokens: tokenize(value ?? "") };
}

type FieldScore = { score: number; matchedTokens: Set<string>; exactPhrase: boolean };

function scoreField(
  query: string,
  queryTokens: string[],
  field: PreparedField,
  weight: number
): FieldScore {
  if (field.raw.length === 0) {
    return { score: 0, matchedTokens: new Set(), exactPhrase: false };
  }
  let score = 0;
  const matchedTokens = new Set<string>();
  const exactPhrase = query.length > 0 && field.raw.includes(query);
  if (query.length > 0) {
    if (field.raw === query) score += weight * 14;
    else if (field.raw.startsWith(query)) score += weight * 9;
    else if (exactPhrase) score += weight * 6;
  }
  for (const token of queryTokens) {
    if (field.tokens.includes(token)) {
      score += weight * 4;
      matchedTokens.add(token);
    } else if (field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))) {
      score += weight * 2;
      matchedTokens.add(token);
    } else if (field.raw.includes(token)) {
      score += weight;
      matchedTokens.add(token);
    }
  }
  return { score, matchedTokens, exactPhrase };
}

/**
 * Score one entry against a query. Returns null when the entry does not pass
 * the coverage gate (upstream behavior: 100% token coverage required for
 * queries of <=2 tokens, 60% otherwise, unless an exact phrase matched).
 */
export function scoreEntry(entry: ScorableEntry, query: string): number | null {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = tokenize(query);
  if (normalizedQuery.length === 0 || queryTokens.length === 0) return null;

  const fields: FieldScore[] = [
    scoreField(normalizedQuery, queryTokens, prepareField(entry.id), FIELD_WEIGHTS.id),
    scoreField(normalizedQuery, queryTokens, prepareField(entry.name), FIELD_WEIGHTS.name),
    scoreField(normalizedQuery, queryTokens, prepareField(entry.service), FIELD_WEIGHTS.service),
    scoreField(
      normalizedQuery,
      queryTokens,
      prepareField(entry.description),
      FIELD_WEIGHTS.description
    ),
    scoreField(normalizedQuery, queryTokens, prepareField(entry.kind), FIELD_WEIGHTS.kind)
  ];

  const matchedTokens = new Set<string>();
  let score = 0;
  let exactPhrase = false;
  for (const field of fields) {
    score += field.score;
    exactPhrase ||= field.exactPhrase;
    for (const t of field.matchedTokens) matchedTokens.add(t);
  }
  if (matchedTokens.size === 0) return null;

  const coverage = matchedTokens.size / queryTokens.length;
  if (coverage < (queryTokens.length <= 2 ? 1 : 0.6) && !exactPhrase) return null;
  if (coverage === 1) score += 25;
  else score += Math.round(coverage * 10);

  const idTokens = tokenize(entry.id);
  const nameTokens = tokenize(entry.name);
  if (idTokens[0] === queryTokens[0] || nameTokens[0] === queryTokens[0]) score += 8;
  // Boost exact id / name match (upstream: exact path/method match).
  if (
    normalizeSearchText(entry.id) === normalizedQuery ||
    normalizeSearchText(entry.name) === normalizedQuery
  ) {
    score += 20;
  }
  return score;
}
