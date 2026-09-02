/**
 * skills.lumenloop.stellar-ecosystem-digest — runnable core (design §4.2).
 *
 * Mechanizes the digest playbook's mechanical passes (window math, mode
 * routing, dedup, projection); the judgment passes (quotes, expansion) stay
 * with the model via codemode.skill.read.
 *
 * Two modes over ≤ 2 constituent calls:
 *  - theme  → semantic content search over the window PLUS the upcoming-events
 *    list (both in parallel);
 *  - entity → entity-mention lookup only (a generic upcoming-events list is
 *    off-subject noise for an entity digest).
 *
 * Window math runs on the host clock (UTC, YYYY-MM-DD) and both bounds ride
 * the output so answers carry as-of framing — the live-lane grading
 * expectation. ok: true iff the primary content call succeeded OR
 * soft-emptied (a quiet window is a legitimate answer: softEmpty: true,
 * items: []); ok: false only when it errored. Unexpected upstream shapes are
 * treated as that call erroring — fields are never guessed.
 *
 * Live payload shapes this projection matches (captured 2026-07-06, fixtures
 * in test/fixtures/skill-runners/): semantic search is adapter-normalized to
 * one `items` list with a canonical `collection` per row; entity mode remains
 * a distinct type-keyed contract and adds proposals/scf_submissions keys,
 * which are NOT digest output types and are dropped. Entity rows carry no
 * summary (projected ""); list_documents rows sit under `items` and may lack
 * start_at (null).
 *
 * The runner never authors `calls` — the host ledger owns the audit trail.
 * Defaults are applied in the first lines of run(); schema `default` is
 * documentation only.
 */
import type { AdapterResult, SkillRunner } from "./types.ts";

const CONTENT_TYPES = ["articles", "av", "events", "research"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];
const DAY_MS = 86_400_000;

// ---- tiny shape helpers (duplicated across runners deliberately — the §12
// import lint forbids helper modules) ---------------------------------------
const rec = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
const arr = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const trunc = (v: unknown, max: number): string => {
  const s = typeof v === "string" ? v : "";
  return s.length > max ? s.slice(0, max) : s;
};
/** Host-clock day in UTC, the exact YYYY-MM-DD the window schema declares. */
const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

type ErrEnvelope = {
  ok: false;
  error: { service: "skills"; kind: "error"; message: string; hint?: string };
};
const errData = (message: string, hint?: string): ErrEnvelope => ({
  ok: false,
  error: { service: "skills", kind: "error", message, ...(hint ? { hint } : {}) }
});

type DigestItem = { type: ContentType; title: string; url: string | null; date: string | null; summary: string };

/**
 * A/V created_at has no verified recording-date meaning (ll-019). Every
 * other collection keeps the existing publishing/start/created fallback.
 */
const itemDate = (type: ContentType, row: Record<string, unknown>): string | null => {
  if (type === "av") return null;
  return str(row["publishing_date"]) ?? str(row["start_at"]) ?? str(row["created_at"]);
};

/**
 * Project either operation's authored contract into the digest item list:
 * normalized semantic rows or the distinct entity operation's type-keyed
 * map. Digest-output types only, url/id-deduped, date-desc (undated last).
 */
function projectItems(data: unknown): DigestItem[] | null {
  const row = rec(data);
  if (!row) return null;
  const normalized = arr(row["items"]);
  const hasEntityCollections = CONTENT_TYPES.some((t) => t in row);
  if (!normalized && !hasEntityCollections) return null;
  const items: DigestItem[] = [];
  const seen = new Set<string>();
  const groups: Array<{ type: ContentType; rows: unknown[] }> = normalized
    ? CONTENT_TYPES.map((type) => ({
        type,
        rows: normalized.filter((raw) => rec(raw)?.["collection"] === type)
      }))
    : CONTENT_TYPES.map((type) => ({ type, rows: arr(row[type]) ?? [] }));
  for (const { type, rows } of groups) {
    for (const raw of rows) {
      const r = rec(raw);
      if (!r) continue;
      const title = str(r["title"]) ?? "";
      const url = str(r["url"]);
      const id = r["id"];
      const dedupKey =
        url ?? (id !== undefined && id !== null ? `id:${String(id)}` : `${type}:${title}`);
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      items.push({ type, title, url, date: itemDate(type, r), summary: trunc(r["summary"], 200) });
    }
  }
  items.sort((a, b) => {
    if (a.date === b.date) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date < b.date ? 1 : -1;
  });
  return items;
}

function projectUpcoming(data: unknown) {
  const row = rec(data);
  const rows = row ? arr(row["items"]) : null;
  if (!row || !rows) return null;
  return rows
    .map(rec)
    .filter((r): r is Record<string, unknown> => r !== null)
    .map((r) => ({
      title: str(r["title"]) ?? "",
      url: str(r["url"]),
      startAt: str(r["start_at"])
    }));
}

export const stellarEcosystemDigest: SkillRunner = {
  ops: [
    "lumenloop.search_content_semantic",
    "lumenloop.list_documents",
    "lumenloop.find_content_by_entity"
  ],

  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["subject"],
    properties: {
      subject: {
        type: "string",
        minLength: 1,
        description: 'Theme phrase ("RWA tokenization") or entity name ("Soroswap").'
      },
      subjectType: {
        type: "string",
        enum: ["theme", "entity"],
        default: "theme",
        description: "theme = semantic search over content; entity = entity-mention lookup."
      },
      days: { type: "integer", minimum: 1, maximum: 90, default: 30 },
      perTypeLimit: { type: "integer", minimum: 1, maximum: 10, default: 5 }
    }
  },

  outputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["subject", "subjectType", "window", "items", "counts", "softEmpty", "upcomingEvents", "calls"],
    properties: {
      subject: { type: "string" },
      subjectType: { type: "string", enum: ["theme", "entity"] },
      window: {
        type: "object",
        description: "As-of framing, always present — answers must state the window they cover.",
        additionalProperties: false,
        required: ["dateStart", "dateEnd"],
        properties: {
          dateStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          dateEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }
        }
      },
      items: {
        type: ["array", "null"],
        description: "Flat, url/id-deduped, date-desc; shape-stable across both modes. null ⇔ the call errored.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "title", "url", "date", "summary"],
          properties: {
            type: { type: "string", enum: ["articles", "av", "events", "research"] },
            title: { type: "string" },
            url: { type: ["string", "null"] },
            date: { type: ["string", "null"] },
            summary: { type: "string", maxLength: 200 }
          }
        }
      },
      counts: {
        type: "object",
        additionalProperties: false,
        required: ["articles", "av", "events", "research"],
        properties: {
          articles: { type: "integer", minimum: 0 },
          av: { type: "integer", minimum: 0 },
          events: { type: "integer", minimum: 0 },
          research: { type: "integer", minimum: 0 }
        }
      },
      softEmpty: { type: "boolean", description: "true ⇔ the window matched nothing — a quiet window, not a failure." },
      upcomingEvents: {
        type: ["array", "null"],
        description: "theme mode: null ⇔ that call errored; entity mode: always null (not attempted).",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "url", "startAt"],
          properties: {
            title: { type: "string" },
            url: { type: ["string", "null"] },
            startAt: { type: ["string", "null"] }
          }
        }
      },
      calls: {
        type: "array",
        description: "Host-recorded constituent-call audit trail — attached by runSkill, never runner-authored.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["op", "ok", "ms"],
          properties: {
            op: { type: "string" },
            ok: { type: "boolean" },
            errorKind: { type: "string", enum: ["error", "soft-empty"] },
            ms: { type: "number", minimum: 0 }
          }
        }
      }
    }
  },

  async run(input, ops) {
    // Defaults first — the pipeline never injects schema defaults (design §4).
    const subject = typeof input["subject"] === "string" ? input["subject"] : "";
    const subjectType: "theme" | "entity" = input["subjectType"] === "entity" ? "entity" : "theme";
    const days = typeof input["days"] === "number" ? input["days"] : 30;
    const perTypeLimit = typeof input["perTypeLimit"] === "number" ? input["perTypeLimit"] : 5;

    const call = (name: string, args: Record<string, unknown>) => {
      const fn = ops["lumenloop"]?.[name];
      if (!fn) throw new Error(`ops facade is missing lumenloop.${name} — undeclared op or wiring bug`);
      return fn(args);
    };

    // ---- window math: host clock, UTC, inclusive bounds -------------------
    const now = Date.now();
    const dateEnd = isoDay(new Date(now));
    const dateStart = isoDay(new Date(now - days * DAY_MS));
    const window = { dateStart, dateEnd };

    // ---- mode routing ------------------------------------------------------
    let primary: AdapterResult;
    let upcomingR: AdapterResult | null = null;
    if (subjectType === "theme") {
      [primary, upcomingR] = await Promise.all([
        call("search_content_semantic", {
          query: subject,
          date_start: dateStart,
          date_end: dateEnd,
          types: [...CONTENT_TYPES],
          limit: perTypeLimit,
          response_format: "concise"
        }),
        call("list_documents", { collection: "events", period: "upcoming", limit: 5 })
      ]);
    } else {
      primary = await call("find_content_by_entity", {
        entity: subject,
        date_start: dateStart,
        date_end: dateEnd,
        limit: perTypeLimit
      });
    }

    // ---- primary outcome: data ≠ soft-empty ≠ error ------------------------
    const primaryOp =
      subjectType === "theme" ? "lumenloop.search_content_semantic" : "lumenloop.find_content_by_entity";
    let items: DigestItem[];
    if (primary.ok) {
      const projected = projectItems(primary.data);
      if (projected === null) {
        return errData(
          `${primaryOp} returned an unexpected payload shape — digest aborted (upstream drift?)`
        );
      }
      items = projected;
    } else if (primary.error.kind === "soft-empty") {
      items = []; // a quiet window is a legitimate answer, not a failure
    } else {
      return errData(`digest primary call ${primaryOp} failed: ${primary.error.message}`, primary.error.hint);
    }

    const counts: Record<ContentType, number> = { articles: 0, av: 0, events: 0, research: 0 };
    for (const item of items) counts[item.type] += 1;

    // theme mode: upcoming-events degrade per-section (error/drift → null,
    // soft-empty → present-but-empty); entity mode: never attempted → null.
    const upcomingEvents =
      subjectType === "entity" || upcomingR === null
        ? null
        : upcomingR.ok
          ? projectUpcoming(upcomingR.data)
          : upcomingR.error.kind === "soft-empty"
            ? []
            : null;

    // No `calls` key here — runSkill attaches the host ledger (design §6).
    return {
      subject,
      subjectType,
      window,
      items,
      counts,
      softEmpty: items.length === 0,
      upcomingEvents
    };
  }
};
