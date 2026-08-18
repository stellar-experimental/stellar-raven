/**
 * Forward-only response normalization for Lumenloop operations whose upstream
 * wire shape is needlessly difficult to consume safely.
 *
 * `search_content_semantic` ranks rows with one comparable similarity score,
 * but returns a type-keyed map. A caller that projects only the first guessed
 * collection can therefore erase the strongest evidence. Normalize that one
 * known contract at the adapter boundary into a single ranked list. This does
 * not inspect the caller's question, label identity matches, or add evidence;
 * it preserves every upstream row and its source collection. It also adds a
 * small canonical projection for the cross-collection fields callers need
 * most often, while naming the upstream date/source field selected so those
 * values are not mistaken for a stronger provenance claim.
 *
 * The schema constant is imported by both catalog/spec generators so the
 * documented sandbox contract cannot drift from the runtime adapter.
 */

export const LUMENLOOP_SEMANTIC_OPERATION = "lumenloop.search_content_semantic";

/**
 * The live 2026-08-18 probe disproved these inventory output schemas. The
 * adapter returns their upstream `data` values unchanged, so publishing the
 * schemas would teach a false `r.data.results` access path. Keep their output
 * contracts unknown until a future probe supports exact replacement schemas.
 * See improvements/lumenloop/ll-029-output-schema-top-level-shape-drift.md
 * for the shared defect; ll-019 covers find_av_passages.
 *
 * Do not infer this list from the shared legacy schema shape. Other operations
 * can legitimately return an object with `results`, and their contracts stay
 * model-visible unless evidence disproves them too.
 */
export const LUMENLOOP_UNVERIFIED_OUTPUT_SCHEMA_OPERATIONS = new Set([
  "lumenloop.find_av_passages",
  "lumenloop.find_content_by_entity",
  "lumenloop.find_similar_projects_semantic",
  "lumenloop.find_similar_scf_submissions",
  "lumenloop.get_related_projects",
  "lumenloop.get_tags_vocabulary"
]);

export const LUMENLOOP_DOCUMENT_SORTS = [
  "processed_at",
  "publishing_date",
  "created_at",
  "domain",
  "source",
  "start_at",
  "updated_at",
  "last_seen_at",
  "published_at"
] as const;

export const LUMENLOOP_SEMANTIC_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items", "counts", "meta"],
  properties: {
    items: {
      type: "array",
      description:
        "All upstream candidate rows in one globally similarity-sorted list. Each row carries its original collection.",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["collection"],
        properties: {
          collection: {
            type: "string",
            description: "The upstream result collection, for example articles, events, av, or research."
          },
          title: {
            type: "string",
            description: "Canonical display title selected from upstream title/name fields when present."
          },
          url: {
            type: "string",
            description: "Canonical item URL selected from upstream url/link fields when present."
          },
          date: {
            type: "string",
            description:
              "Best available upstream item timestamp. Interpret it using dateField; it is not automatically a publication or observation date."
          },
          dateField: {
            type: "string",
            description: "Exact upstream field copied into date, such as publishing_date, start_at, or created_at."
          },
          source: {
            type: "string",
            description: "Canonical source label selected from upstream source/domain/channel/platform fields when present."
          },
          sourceField: {
            type: "string",
            description: "Exact upstream field copied into source."
          },
          snippet: {
            type: "string",
            description: "Canonical concise text selected from upstream snippet/summary/description fields when present."
          }
        }
      }
    },
    counts: {
      type: "object",
      description: "Upstream row count for every returned collection.",
      additionalProperties: { type: "integer", minimum: 0 }
    },
    meta: {
      type: "object",
      description: "Non-collection upstream metadata preserved without reshaping.",
      additionalProperties: true
    }
  }
} as const;

type JsonRecord = Record<string, unknown>;

/**
 * Lumenloop currently accepts an unknown list_documents sort key. The live
 * operation schema documents its supported fields in prose, so make that
 * closed set executable in both generated model-facing contracts. This runs
 * through the normal host-side schema guard before the adapter sends traffic.
 */
export function lumenloopInputSchema(operationId: string, upstream: unknown): unknown {
  if (
    operationId !== "lumenloop.list_documents" ||
    upstream === null ||
    typeof upstream !== "object" ||
    Array.isArray(upstream)
  ) {
    return upstream;
  }

  const schema = upstream as JsonRecord;
  const properties = schema.properties;
  if (properties === null || typeof properties !== "object" || Array.isArray(properties)) {
    return upstream;
  }

  const sort = (properties as JsonRecord).sort;
  if (sort === null || typeof sort !== "object" || Array.isArray(sort)) return upstream;

  return {
    ...schema,
    properties: {
      ...properties,
      sort: { ...(sort as JsonRecord), enum: [...LUMENLOOP_DOCUMENT_SORTS] }
    }
  };
}

function firstString(
  source: JsonRecord,
  keys: readonly string[]
): { value: string; field: string } | undefined {
  for (const field of keys) {
    const value = source[field];
    if (typeof value === "string" && value.trim() !== "") return { value, field };
  }
  return undefined;
}

function canonicalSemanticFields(source: JsonRecord): JsonRecord {
  const title = firstString(source, ["title", "name"]);
  const url = firstString(source, ["url", "link"]);
  const date = firstString(source, [
    "date",
    "publishing_date",
    "published_at",
    "publishedAt",
    "start_at",
    "startAt",
    "created_at",
    "createdAt"
  ]);
  const sourceLabel = firstString(source, [
    "source",
    "domain",
    "channel",
    "platform",
    "user_screen_name",
    "userScreenName"
  ]);
  const snippet = firstString(source, ["snippet", "summary", "description", "long_summary"]);
  return {
    ...(title ? { title: title.value } : {}),
    ...(url ? { url: url.value } : {}),
    ...(date ? { date: date.value, dateField: date.field } : {}),
    ...(sourceLabel ? { source: sourceLabel.value, sourceField: sourceLabel.field } : {}),
    ...(snippet ? { snippet: snippet.value } : {})
  };
}

export function lumenloopOutputSchema(operationId: string, upstream: unknown): unknown {
  if (operationId === LUMENLOOP_SEMANTIC_OPERATION) return LUMENLOOP_SEMANTIC_OUTPUT_SCHEMA;
  return LUMENLOOP_UNVERIFIED_OUTPUT_SCHEMA_OPERATIONS.has(operationId) ? null : upstream;
}

export function normalizeLumenloopOutput(operationId: string, data: unknown): unknown {
  if (operationId !== LUMENLOOP_SEMANTIC_OPERATION) return data;
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("search_content_semantic returned a non-object payload");
  }

  const input = data as JsonRecord;
  const keys = Object.keys(input);
  // Keep the authored boundary idempotent. This matters for provider-level
  // composition and makes an upstream migration to the canonical contract a
  // no-op instead of relabeling the `items` array as collection "items".
  if (
    keys.length === 3 &&
    keys.every((key) => key === "items" || key === "counts" || key === "meta") &&
    Array.isArray(input.items) &&
    input.items.every(
      (row) =>
        row !== null &&
        typeof row === "object" &&
        !Array.isArray(row) &&
        typeof (row as JsonRecord).collection === "string"
    ) &&
    input.counts !== null &&
    typeof input.counts === "object" &&
    !Array.isArray(input.counts) &&
    input.meta !== null &&
    typeof input.meta === "object" &&
    !Array.isArray(input.meta)
  ) {
    return data;
  }

  const counts: Record<string, number> = {};
  const meta: JsonRecord = {};
  const ranked: Array<{ row: JsonRecord; ordinal: number; similarity: number | null }> = [];
  let ordinal = 0;

  for (const [collection, value] of Object.entries(input)) {
    if (!Array.isArray(value)) {
      meta[collection] = value;
      continue;
    }
    counts[collection] = value.length;
    for (const raw of value) {
      const source: JsonRecord = raw !== null && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as JsonRecord)
        : { value: raw };
      const similarity = typeof source.similarity === "number" && Number.isFinite(source.similarity)
        ? source.similarity
        : null;
      ranked.push({
        // Canonical collection wins if an upstream row happens to carry a
        // conflicting property of the same name.
        row: { ...source, ...canonicalSemanticFields(source), collection },
        ordinal,
        similarity
      });
      ordinal += 1;
    }
  }

  if (Object.keys(counts).length === 0) {
    throw new Error("search_content_semantic returned no collection arrays");
  }

  ranked.sort((a, b) => {
    if (a.similarity === b.similarity) return a.ordinal - b.ordinal;
    if (a.similarity === null) return 1;
    if (b.similarity === null) return -1;
    return b.similarity - a.similarity;
  });

  return { items: ranked.map(({ row }) => row), counts, meta };
}
