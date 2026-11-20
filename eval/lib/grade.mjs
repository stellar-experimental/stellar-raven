/**
 * grade.mjs — pure grading logic for the search-routing eval.
 * No I/O, no imports from src/ — unit-testable standalone (see eval/self-test.mjs).
 */

/** Known card/id prefixes → catalog namespace. Longest-prefix-first matching. */
const CARD_PREFIXES = [
  ["stellar_docs_", "stellarDocs"],
  ["stellar_light_", "scout"],
  ["stellardocs_", "stellarDocs"],
  ["lumenloop_", "lumenloop"],
  ["scout_", "scout"],
  ["skills_", "skills"],
];

/** Canonicalize a card/entry id: lowercase, unify [-. ] separators to "_". */
export function canonToken(s) {
  return String(s).toLowerCase().replace(/[-.\s]+/g, "_");
}

/**
 * Split a canonical token into { service, op }. E.g.:
 *   "lumenloop_search_directory"  -> { service: "lumenloop",   op: "search_directory" }
 *   "stellar_docs_mcp"            -> { service: "stellarDocs", op: "mcp" }
 *   "scout.projects" (canon'd)    -> { service: "scout",       op: "projects" }
 * Unknown prefix -> { service: null, op: token }.
 */
export function splitCard(token) {
  const t = canonToken(token);
  for (const [prefix, service] of CARD_PREFIXES) {
    if (t.startsWith(prefix)) return { service, op: t.slice(prefix.length) };
  }
  return { service: null, op: t };
}

/** Exact card-id match after applying the repository's card-prefix mapping. */
export function cardMatchesExact(expectedCard, hit) {
  const expected = splitCard(expectedCard);
  if (!expected.service || canonToken(expected.service) !== canonToken(hit.service)) return false;
  if (hit.service === "skills") {
    return expected.op === canonToken(hit.id.split("#", 1)[0].split(".").at(-1));
  }
  const hitCanon = canonToken(hit.id);
  const hitService = canonToken(hit.service);
  const hitOp = hitCanon.startsWith(hitService + "_")
    ? hitCanon.slice(hitService.length + 1)
    : splitCard(hit.id).op;
  return expected.op === hitOp;
}

/**
 * Tolerant card match between an expected card label (raven-next naming, e.g.
 * "lumenloop_search_directory") and a catalog hit (id "lumenloop.search_directory",
 * service "lumenloop"). Rules, documented:
 *   1. Full canonical equality (separators unified, case-insensitive).
 *   2. Same service (expected card's prefix vs. hit.service) AND op names equal.
 *   3. Same service AND one op name contains the other, when the shorter op is
 *      >= 4 chars (tolerates "projects" vs "list_projects"; guards against
 *      trivial substrings like "get").
 *   4. Same service AND a `<noun>_detail` card matches a `get_<noun>` or
 *      `get<noun>` operation by name (e.g. `scout_hackathon_detail` ->
 *      `scout.getHackathon`, `scout_skill_detail` -> `scout.getSkill`).
 */
export function cardMatches(expectedCard, hit) {
  if (cardMatchesExact(expectedCard, hit)) return true;
  const exp = canonToken(expectedCard);
  const hitCanon = canonToken(hit.id);
  if (exp === hitCanon) return true;
  const e = splitCard(expectedCard);
  const eService = e.service ? canonToken(e.service) : null;
  if (!eService) return false;
  const hitService = canonToken(hit.service);
  const hitOp = hitCanon.startsWith(hitService + "_")
    ? hitCanon.slice(hitService.length + 1)
    : splitCard(hit.id).op;
  if (eService !== hitService) return false;
  if (e.op === hitOp) return true;
  const [shorter, longer] = e.op.length <= hitOp.length ? [e.op, hitOp] : [hitOp, e.op];
  if (shorter.length >= 4 && longer.includes(shorter)) return true;
  if (e.op.endsWith("_detail")) {
    const noun = e.op.slice(0, -"_detail".length);
    if (/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(noun)) {
      return hitOp === `get_${noun}` || hitOp === `get${noun.replace(/_/g, "")}`;
    }
  }
  return false;
}

/** Service-only cards are outside the operation-level card@5 metric. */
export function isServiceLevelCard(card) {
  return splitCard(card).op === "mcp";
}

/** General-web service prefixes outside this catalog (never surfaceable in search). */
const EXTERNAL_CARD_PREFIXES = ["perplexity_", "parallel_"];

/** True when a card belongs to a documented out-of-catalog general-web service. */
export function isExternalServiceCard(card) {
  const c = canonToken(card);
  return EXTERNAL_CARD_PREFIXES.some((prefix) => c.startsWith(prefix));
}

function searchableEntriesOf(entries) {
  return entries.filter((e) => e.searchable !== false && e.kind !== "skill-section");
}

function classifyCardBindingInSearchable(card, searchable) {
  if (isExternalServiceCard(card)) return "external";
  const { service } = splitCard(card);
  if (!service) return null;
  if (isServiceLevelCard(card)) {
    const svcCanon = canonToken(service);
    return searchable.some((e) => canonToken(e.service) === svcCanon) ? "service" : null;
  }
  return searchable.some((e) => cardMatches(card, e)) ? "operation" : null;
}

/**
 * Classify how a routing card binds to searchable catalog entries:
 *   - "external"  — documented general-web prefix outside this catalog (`perplexity_*`, `parallel_*`)
 *   - "service"   — `<service>_mcp` card whose service exists among searchable entries
 *   - "operation" — matches at least one searchable non-section entry via `cardMatches`
 *   - null        — unbound (unknown prefix, missing service, or zero matching operations)
 */
export function classifyCardBinding(card, entries) {
  return classifyCardBindingInSearchable(card, searchableEntriesOf(entries));
}

/**
 * Find any unbound card, missing/empty card list, or case whose expected_cards lack any
 * catalog-bound card. Reports only lane name, case index, card index, and reason — never
 * a case id, question, or card label — so failures stay safe in logs.
 */
export function findUnboundRoutingCards(cases, entries, { lane = "routing" } = {}) {
  const searchable = searchableEntriesOf(entries);
  const failures = [];
  cases.forEach((c, caseIndex) => {
    if (!Array.isArray(c.expected_cards) || c.expected_cards.length === 0) {
      failures.push({ lane, caseIndex, cardIndex: null, reason: "no-cards" });
      return;
    }
    let hasCatalogBinding = false;
    c.expected_cards.forEach((card, cardIndex) => {
      const binding = classifyCardBindingInSearchable(card, searchable);
      if (binding === null) {
        failures.push({ lane, caseIndex, cardIndex, reason: "unbound" });
      } else if (binding === "service" || binding === "operation") {
        hasCatalogBinding = true;
      }
    });
    if (!hasCatalogBinding) {
      failures.push({ lane, caseIndex, cardIndex: null, reason: "no-catalog-card" });
    }
  });
  return failures;
}

/**
 * Grade one case against its top-5 hits. Returns `{ top1, top3, top5, cardHit5 }` (strict against
 * `expectedService`; `cardHit5` is null when no operation-level expected card exists). When
 * `expectedAny` is non-empty, also adds `{ any1, any3, any5 }` without altering strict fields.
 */
export function gradeCase(hits, expectedService, expectedCards, expectedAny) {
  const svc = (h) => h.service === expectedService;
  const top1 = hits.length > 0 && svc(hits[0]);
  const top3 = hits.slice(0, 3).some(svc);
  const top5 = hits.slice(0, 5).some(svc);
  let cardHit5 = null;
  if (Array.isArray(expectedCards) && expectedCards.length > 0) {
    // Service-level cards name no operation. Top-k already measures their service.
    const opCards = expectedCards.filter((c) => !isServiceLevelCard(c));
    if (opCards.length > 0) {
      cardHit5 = hits.slice(0, 5).some((h) => opCards.some((c) => cardMatches(c, h)));
    }
  }
  const result = { top1, top3, top5, cardHit5 };
  if (Array.isArray(expectedAny) && expectedAny.length > 0) {
    const anySvc = (h) => expectedAny.includes(h.service);
    result.any1 = hits.length > 0 && anySvc(hits[0]);
    result.any3 = hits.slice(0, 3).some(anySvc);
    result.any5 = hits.slice(0, 5).some(anySvc);
  }
  return result;
}

/**
 * Aggregate per-case results into overall + per-service rates.
 * results: [{ expected_service, top1, top3, top5, cardHit5 }]
 */
export function aggregate(results) {
  const mk = () => ({ n: 0, top1: 0, top3: 0, top5: 0, cardN: 0, cardHit5: 0 });
  const overall = mk();
  const perService = {};
  for (const r of results) {
    const buckets = [overall, (perService[r.expected_service] ??= mk())];
    for (const b of buckets) {
      b.n += 1;
      if (r.top1) b.top1 += 1;
      if (r.top3) b.top3 += 1;
      if (r.top5) b.top5 += 1;
      if (r.cardHit5 !== null && r.cardHit5 !== undefined) {
        b.cardN += 1;
        if (r.cardHit5) b.cardHit5 += 1;
      }
    }
  }
  return { overall, perService };
}

const pct = (num, den) => (den === 0 ? "n/a" : `${((100 * num) / den).toFixed(1)}%`);

/** Rows suitable for console.table: one per service + Overall. */
export function tableRows({ overall, perService }) {
  const row = (name, b) => ({
    scope: name,
    cases: b.n,
    "top-1": pct(b.top1, b.n),
    "top-3": pct(b.top3, b.n),
    "top-5": pct(b.top5, b.n),
    "card@5": `${pct(b.cardHit5, b.cardN)} (${b.cardN})`,
  });
  const rows = Object.keys(perService).sort().map((s) => row(s, perService[s]));
  rows.push(row("OVERALL", overall));
  return rows;
}
