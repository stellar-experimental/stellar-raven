#!/usr/bin/env node
/**
 * Deterministic lint for the owned one-file-per-case QA corpus.
 *
 * The module exports the individual lanes for fixture tests. The CLI reads the
 * real corpus and enables diff-aware gospel checks with --since <ref> (or the
 * CI merge base), frozen live-contract validation with --live-contract <path>
 * --since <ref>, coverage reporting with --coverage, and the due-date gate
 * with --stale.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertNoNonExposedRefs } from "../../scripts/build-catalog.mjs";
import { QA_CATEGORIES, QA_SERVICES } from "./lib.mjs";

const ROOT = process.env.QA_REPO_ROOT
  ? realpathSync(process.env.QA_REPO_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULTS = {
  corpusDir: path.join(ROOT, "eval/qa/corpus/battery"),
  manifestPath: path.join(ROOT, "catalog/manifest.json"),
  registerPath: path.join(ROOT, "eval/qa/consistency-register.json"),
  ledgerPath: path.join(ROOT, "eval/qa/corpus/migration-ledger.json")
};

const CATEGORY_FLOORS = {
  "protocol-core": 46,
  soroban: 68,
  "tooling-infra": 58,
  "assets-anchors-seps": 47,
  "defi-ecosystem": 55,
  "scf-grants-builders": 46,
  "compliance-rwa-payments": 38,
  "history-org-tokenomics": 19,
  "retail-consumer": 33,
  "edge-behavior": 40
};
const DIGEST_SKILL = "skills.lumenloop.stellar-ecosystem-digest";
const LEDGER_SOURCE_COUNTS = {
  "battery-2026-07": 493,
  boxy: 21,
  kaan: 49,
  raph: 90,
  "core-35": 35,
  flue: 1
};
const CATALOG_NOTE_TRAPS = [
  { id: "person-entity-empty", surface: "lumenloop.find_content_by_entity", re: /\bperson\b.*\bempty|\bempty\b.*\bperson\b/i },
  { id: "winner-order", surface: "scout.getHackathon", re: /\bwinner\b.*\border|\border\b.*\bwinner\b/i },
  { id: "av-offset", surface: "lumenloop.find_av_passages", re: /\boffset\b.*\b(?:timestamp|seconds?)|\b(?:timestamp|seconds?)\b.*\boffset\b/i },
  { id: "payload-data-ok", surface: null, re: /\bdata\.ok\b/i },
  { id: "unindexed-api-refs", surface: "stellarDocs.search_rpc_horizon_data_docs", re: /\b(?:unindexed|not (?:in|indexed)|search index)\b.*\b(?:api|method|endpoint|reference)/i },
  { id: "semantic-fallback", surface: "lumenloop.search_directory", re: /\bsemantic\b.*\bfallback|\bfallback\b.*\bsemantic\b/i },
  { id: "matchPartners-503", surface: "scout.matchPartners", re: /\b503\b/ },
  { id: "zero-upcoming", surface: "scout.getHackathons", re: /\b(?:zero|no)\b.*\bupcoming|\bupcoming\b.*\b(?:zero|none|empty)\b/i }
];
const ROOT_CAUSE_SCORE_ONLY = [
  /\bscore(?:d|s|ing)?\b/i,
  /\b(?:qa|eval|judge|grader)\s+(?:result|verdict|failure|fail|metric|accuracy)\b/i,
  /\b(?:improve|raise|increase|recover|fix)\w*\s+(?:the\s+)?(?:score|pass rate|accuracy)\b/i,
  /\b(?:failed|failing)\s+(?:case|eval|test|judge)\b/i
];

// Ported unchanged in substance from lint-goldens.mjs.
const AVOID_PATTERNS = [
  { label: "beyond-support", re: /\bbeyond\b[^.;]*\b(corpus|golden|evidence|source|sources|support)\b/i },
  { label: "without-evidence", re: /\bwithout\b[^.;]*\b(evidence|support|source|sources|citation|verification)\b/i },
  { label: "not-verified", re: /\b(not|unless|until|if|never|without)\b[^.;]*\b(verified|substantiated|corroborated|evidenced|cited|vetted)\b/i },
  { label: "un-prefixed", re: /\bun(verified|substantiated|corroborated|sourced|evidenced)\s+(\w+\s+)?(names?|claims?|figures?|numbers?|counts?|values?|stats?|specifics?|details?|entities|projects?|amounts?|lists?|events?)\b/i },
  { label: "no-evidence", re: /\bno\b[^.;]*\b(evidence|corroboration|citation)\b/i },
  { label: "lacks-support", re: /\blacks?\b[^.;]*\b(evidence|support|source|corroboration)\b/i },
  { label: "corpus-support", re: /\b(corpus|evidence|reviewer)[- ]support(ed)?\b/i }
];
const JUDGE_BLIND_RE = /\b(corpus|reviewer|golden|source data|cited records?|catalog|directory|transcripts?)\b/i;
const NUMERIC_RE = /(?:\$\s*\d|\b\d+(?:\.\d+)?\s*(?:%|bps?|ms|seconds?|minutes?|hours?|days?|weeks?|months?|years?|xlm|usdc|usd|million|billion|k|m|b)\b|\b(?:v|version\s*)\d+(?:\.\d+)*\b|\b(?:protocol|cap-|sep-)\s*\d+\b|\b20\d{2}-\d{2}(?:-\d{2})?\b)/i;
const NEGATIVE_RE = /\b(?:no|none|not|never|without|cannot|can't|doesn't|isn't|aren't|unavailable|absent)\b/i;
const KEY_FACT_PREDICATE_RE = /\b(?:is|are|was|were|has|have|uses?|states?|explains?|identifies?|distinguishes?|separates?|rejects?|dates?|keeps?|preserves?|gives?|names?|describes?|reports?|requires?|mentions?|covers?|includes?|adds?|defines?|warns?|notes?|compares?|lists?|clarifies?|treats?|calls?|recommends?|shows?|attributes?|acknowledges?|frames?|presents?|omits?|can|must|should)\b/i;
const NON_CONTENT_AVOID_RE = /^(?:omits?|skips?|frames?|phrases?|words?|portrays?|characterizes?|presents?)\b|^fail(?:s)?\s+to\b|\b(?:without|unless)\b[^.;]*\b(?:date|dating|mention|stating|including|presenting|framing|phrasing)\b|\bdates?\s+(?:its|the)\b/i;
const NEGATIVE_PREDICATE_RE = /\b(?:rejects?|separates?|distinguishes?)\s+(.+?)(?=\s+(?:from|and)\b|[.,;]|$)/i;
const LIVE_CONTRACT_VERSION_RE = /-v(\d+)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const REVERIFY_BY_REFERENCE_RE = /\b(q-[a-z0-9-]+)\s+reverifyBy\s+(\d{4}-\d{2}-\d{2})\b/g;
const SOURCE_CLASSES = new Set(["A", "B", "C", "D", "E", "F"]);
const FRESHNESS = new Set(["stable", "scheduled", "live"]);
const TRAPS = new Set([
  "out-of-scope", "injection", "paid-bait", "fabrication-bait", "scam-check",
  "speculation", "cant-do", "ambiguous", "governance"
]);
const TRUTH_DOMAINS = new Set(["real-world", "corpus-grounded", "mixed"]);
const TRUTH_STATUSES = new Set(["confirmed", "disputed", "unverifiable", "mixed"]);
const CORROBORATION_VERDICTS = new Set([
  "confirmed", "confirmed-as-of", "disputed", "unverifiable", "corpus-only", "contradicted"
]);

function finding(level, lane, id, message) {
  return { level, lane, id: id ?? "-", message };
}

function json(pathname) {
  return JSON.parse(readFileSync(pathname, "utf8"));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function same(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function caseText(kase) {
  return [
    kase.question,
    kase.golden?.answer,
    ...(kase.golden?.keyFacts ?? []),
    ...(kase.golden?.avoid ?? []),
    kase.golden?.notes
  ].filter((part) => typeof part === "string").join("\n");
}

function entriesOf(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && Array.isArray(collection.entries)) return collection.entries;
  return [];
}

function walkJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

export function loadCases(corpusDir) {
  return walkJsonFiles(corpusDir).map((file) => ({ ...json(file), __file: file }));
}

export function lintSurface(cases, manifest) {
  const findings = [];
  const exposedEntries = (manifest.entries ?? []).filter((entry) => entry.kind === "operation" || entry.kind === "skill");
  const exposedIds = new Set(exposedEntries.map((entry) => entry.id));
  // Synthetic operation entries let the build's own guard provide the exact
  // callable-token allowlist logic; it delegates exclusions to the shared
  // emitted-text guard and exposure data.
  const operationAllowlist = exposedEntries
    .filter((entry) => entry.kind === "operation")
    .map((entry) => ({ id: entry.id, kind: "operation", description: "" }));

  for (const kase of cases) {
    const surface = Array.isArray(kase.surface) ? kase.surface : [];
    if (kase.tags?.service !== "none" && surface.length === 0) {
      findings.push(finding("error", "surface", kase.id, "surface must be non-empty unless tags.service is none"));
    }
    for (const id of surface) {
      if (!exposedIds.has(id)) findings.push(finding("error", "surface", kase.id, `non-exposed surface id: ${id}`));
    }
    try {
      assertNoNonExposedRefs([
        ...operationAllowlist,
        { id: `qa-case:${kase.id}`, kind: "qa-case", description: caseText(kase) }
      ]);
    } catch (error) {
      findings.push(finding("error", "surface", kase.id, error.message));
    }
  }
  return findings;
}

function invariantIds(invariant) {
  return invariant.affectedCaseIds ?? [];
}

function invariantLabel(invariant) {
  return String(invariant.label ?? "unnamed invariant");
}

function terms(text) {
  const expanded = String(text).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return new Set((expanded.match(/[a-z][a-z0-9-]{2,}/g) ?? []).map((term) => {
    if (term === "capped") return "cap";
    if (term.endsWith("ed") && term.length > 5) return term.slice(0, -2);
    if (term.endsWith("s") && term.length > 4) return term.slice(0, -1);
    return term;
  }));
}

function claimCovers(claim, expected) {
  const wanted = terms(expected);
  if (wanted.size === 0) return false;
  const actual = terms(claim);
  let overlap = 0;
  for (const term of wanted) if (actual.has(term)) overlap++;
  return overlap >= Math.min(2, wanted.size);
}

export function lintNumericInvariants(cases, register = {}) {
  const findings = [];
  const byId = new Map(cases.map((kase) => [kase.id, kase]));
  for (const invariant of entriesOf(register.numericInvariants)) {
    const label = invariantLabel(invariant);
    const forbidden = [
      ...(invariant.contradictions ?? []),
      ...(invariant.forbiddenValues ?? []),
      ...(invariant.forbidden ?? [])
    ].map(String).filter(Boolean);
    const accepted = [invariant.authoritativeValue, ...(invariant.acceptedSpellings ?? [])]
      .filter((value) => value !== undefined && value !== null)
      .map(String);
    for (const id of invariantIds(invariant)) {
      const kase = byId.get(id);
      if (!kase) {
        findings.push(finding("error", "numeric", id, `numeric invariant references missing case: ${label}`));
        continue;
      }
      const text = caseText(kase);
      for (const value of forbidden) {
        if (text.includes(value)) findings.push(finding("error", "numeric", id, `exact contradiction to ${label}: ${value}`));
      }
      if (accepted.length > 0 && !accepted.some((value) => text.includes(value))) {
        findings.push(finding("warn", "numeric", id, `fuzzy review: no authoritative spelling for ${label} found (${accepted.join(" | ")})`));
      }
    }
  }
  return findings;
}

export function lintDateContingentTraps(cases, register = {}) {
  const findings = [];
  const byId = new Map(cases.map((kase) => [kase.id, kase]));
  for (const trap of entriesOf(register.dateContingentTraps)) {
    for (const id of trap.caseIds ?? []) {
      if (!byId.has(id)) findings.push(finding("error", "date-trap", id, "date-contingent trap references missing case"));
    }
    for (const [field, value] of Object.entries(trap)) {
      if (typeof value !== "string") continue;
      for (const match of value.matchAll(REVERIFY_BY_REFERENCE_RE)) {
        const [, id, quotedDate] = match;
        const kase = byId.get(id);
        if (!kase) {
          findings.push(finding("error", "date-trap", id, `${field} reverifyBy reference names missing case`));
        } else if (kase.truth?.reverifyBy !== quotedDate) {
          findings.push(finding("error", "date-trap", id, `${field} reverifyBy ${quotedDate} does not match truth.reverifyBy ${kase.truth?.reverifyBy ?? "(missing)"}`));
        }
      }
    }
  }
  return findings;
}

function changedJudgeFacing(current, previous) {
  if (!previous) return true;
  return !same(current.question, previous.question)
    || !same(current.golden, previous.golden)
    || !same(current.tags?.freshness, previous.tags?.freshness)
    || !same(current.tags?.trap, previous.tags?.trap);
}

function validStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim());
}

function scoreOnlyRootCause(items) {
  return items.every((item) => ROOT_CAUSE_SCORE_ONLY.some((pattern) => pattern.test(item)));
}

export function lintGospelChanges(currentCases, previousCases) {
  const findings = [];
  const previousById = new Map(previousCases.map((kase) => [kase.id, kase]));
  for (const current of currentCases) {
    const previous = previousById.get(current.id);
    if (!previous) {
      // A new id is new gospel regardless of origin: it must arrive wearing
      // verification evidence. Authored cases additionally owe a rootCause;
      // harvest/redefine lineage lives in the migration ledger.
      const verified = current.truth?.verified;
      if (!validStringArray(verified?.evidence)) {
        findings.push(finding("error", "gospel", current.id, "new case requires non-empty truth.verified.evidence"));
      }
      if (String(current.truth?.origin ?? "").startsWith("authored ") && !validStringArray(verified?.rootCause)) {
        findings.push(finding("error", "gospel", current.id, "authored case requires non-empty truth.verified.rootCause"));
      }
      if (validStringArray(verified?.rootCause) && !verified.rootCause.includes("freshness-drift") && scoreOnlyRootCause(verified.rootCause)) {
        findings.push(finding("error", "gospel", current.id, "truth.verified.rootCause cannot be only a score/result rationale"));
      }
      continue;
    }
    if (!changedJudgeFacing(current, previous)) continue;
    const verified = current.truth?.verified;
    if (previous && same(verified, previous.truth?.verified)) {
      findings.push(finding("error", "gospel", current.id, "judge-facing gospel changed without changing truth.verified"));
      continue;
    }
    if (!validStringArray(verified?.evidence)) {
      findings.push(finding("error", "gospel", current.id, "changed gospel requires non-empty truth.verified.evidence"));
    }
    if (!validStringArray(verified?.rootCause)) {
      findings.push(finding("error", "gospel", current.id, "changed gospel requires non-empty truth.verified.rootCause"));
    } else if (!verified.rootCause.includes("freshness-drift") && scoreOnlyRootCause(verified.rootCause)) {
      findings.push(finding("error", "gospel", current.id, "truth.verified.rootCause cannot be only a score/result rationale"));
    }
  }
  return findings;
}

export function lintAvoidPhrases(cases) {
  const findings = [];
  for (const kase of cases) {
    for (const item of kase.golden?.avoid ?? []) {
      const body = item.replace(/^\s*do\s+not\b/i, "");
      const hits = AVOID_PATTERNS.filter((pattern) => pattern.re.test(body)).map((pattern) => pattern.label);
      if (hits.length === 0) continue;
      const tier = JUDGE_BLIND_RE.test(item) ? "judge-blind" : "sourcing-guard";
      findings.push(finding("warn", "avoid", kase.id, `${tier} [${hits.join(",")}]: ${item}`));
    }
  }
  return findings;
}

function hasMultiplePredicates(fact) {
  const clauses = String(fact).split(/\s+(?:and|but|while|whereas)\s+|;\s*/i);
  return clauses.filter((clause) => KEY_FACT_PREDICATE_RE.test(clause)).length > 1;
}

function significantTerms(text) {
  const stop = new Set(["a", "an", "and", "from", "its", "of", "or", "the", "to", "with"]);
  return (String(text).toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) ?? [])
    .filter((term) => !stop.has(term));
}

function questionContainsObject(question, object) {
  const questionText = String(question).toLowerCase();
  const objectTerms = significantTerms(object);
  return objectTerms.length > 0 && objectTerms.some((term) => questionText.includes(term));
}

function hasSymmetricCaution(notes) {
  const text = String(notes ?? "");
  return /\b(?:canonical|official|upstream)\b[^.!?]{0,80}\b(?:source|page|documentation)\b/i.test(text)
    && /\bnot (?:a )?wrong claim\b/i.test(text)
    && /\b(?:cap|caps|capped|grade)\b[^.!?]{0,60}\bpartial\b/i.test(text);
}

export function lintGoldenAuthoring(cases) {
  const findings = [];
  for (const kase of cases) {
    const snapshotDates = new Set([kase.truth?.asOf, kase.truth?.verified?.date].filter((date) => DATE_RE.test(date ?? "")));
    for (const fact of kase.golden?.keyFacts ?? []) {
      if (fact.length > 90) {
        findings.push(finding("warn", "key-fact", kase.id, `key fact exceeds 90 characters (${fact.length}): ${fact}`));
      }
      if (hasMultiplePredicates(fact)) {
        findings.push(finding("warn", "key-fact", kase.id, `key fact contains multiple predicates: ${fact}`));
      }
      const match = NEGATIVE_PREDICATE_RE.exec(fact);
      if (match && !questionContainsObject(kase.question, match[1])) {
        findings.push(finding("warn", "key-fact", kase.id, `negative predicate object is absent from the question; consider moving it to golden.avoid: ${fact}`));
      }
      for (const date of snapshotDates) {
        if (fact.includes(date)) {
          findings.push(finding("warn", "snapshot-date", kase.id, `key fact requires the golden snapshot date ${date}: ${fact}`));
        }
      }
    }
    for (const item of kase.golden?.avoid ?? []) {
      const body = item.replace(/^\s*do\s+not\b/i, "").trim();
      if (NON_CONTENT_AVOID_RE.test(body)) {
        findings.push(finding("warn", "avoid", kase.id, `presentation, omission, or phrasing requirement is not a concrete false-content avoid item: ${item}`));
      }
    }
    const hasImprovementRootCause = (kase.truth?.verified?.rootCause ?? [])
      .some((item) => /(?:^|\s)improvements\//i.test(String(item)));
    if (hasImprovementRootCause && !hasSymmetricCaution(kase.golden?.notes)) {
      findings.push(finding("warn", "symmetric-caution", kase.id, "improvements/ rootCause has no symmetric canonical-source grading caution in golden.notes"));
    }
  }
  return findings;
}

function numericFragments(text) {
  return String(text).match(/\$?\d+(?:\.\d+)?%?|(?:v|version\s*)\d+(?:\.\d+)*|(?:CAP|SEP)-?\d+/gi) ?? [];
}

export function lintCorroboration(cases, register = {}) {
  const findings = [];
  const invariantsByCase = new Map();
  for (const invariant of entriesOf(register.numericInvariants)) {
    for (const id of invariantIds(invariant)) {
      const list = invariantsByCase.get(id) ?? [];
      list.push(invariant);
      invariantsByCase.set(id, list);
    }
  }
  for (const kase of cases) {
    const rows = Array.isArray(kase.truth?.corroboration) ? kase.truth.corroboration : [];
    if (["disputed", "unverifiable"].includes(kase.truth?.status) && rows.length === 0) {
      findings.push(finding("error", "corroboration", kase.id, `${kase.truth.status} truth requires corroboration`));
    }
    for (const invariant of invariantsByCase.get(kase.id) ?? []) {
      if (!rows.some((row) => claimCovers(row.claim, invariantLabel(invariant)))) {
        findings.push(finding("error", "corroboration", kase.id, `no corroboration row covers numeric invariant: ${invariantLabel(invariant)}`));
      }
    }
    if (kase.truth?.domain === "real-world") {
      for (const fact of kase.golden?.keyFacts ?? []) {
        if (!NUMERIC_RE.test(fact)) continue;
        const fragments = numericFragments(fact).map((part) => part.toLowerCase());
        const covered = rows.some((row) => {
          const claim = String(row.claim ?? "").toLowerCase();
          return fragments.length > 0 && fragments.some((fragment) => claim.includes(fragment));
        });
        if (!covered) {
          findings.push(finding("error", "corroboration", kase.id, `numeric/version/date keyFact lacks a covering corroboration row: ${fact}`));
        }
      }
    }
    const negativeText = [kase.golden?.answer, ...(kase.golden?.keyFacts ?? [])].filter(Boolean).join(" ");
    if (NEGATIVE_RE.test(negativeText) && rows.length === 0) {
      findings.push(finding("warn", "corroboration", kase.id, "possible negative claim has no corroboration (heuristic review)"));
    }
  }
  return findings;
}

export function lintStale(cases, today = new Date().toISOString().slice(0, 10)) {
  const findings = [];
  for (const kase of cases) {
    const due = kase.truth?.reverifyBy;
    if (typeof due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(due) && due < today) {
      findings.push(finding("error", "stale", kase.id, `truth.reverifyBy ${due} is past due (today ${today})`));
    }
  }
  return findings;
}

function inc(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function familyOf(surfaceId) {
  return surfaceId.startsWith("skills.") ? "skills" : surfaceId.split(".")[0];
}

export function lintCoverage(cases, manifest, enforceFloors = false) {
  const findings = [];
  const level = enforceFloors ? "error" : "warn";
  const counts = new Map();
  const categories = new Map();
  let crossService = 0;
  let freshnessPinned = 0;
  let negativeOrEmpty = 0;
  let vocab = 0;
  for (const kase of cases) {
    for (const id of new Set(kase.surface ?? [])) inc(counts, id);
    inc(categories, kase.tags?.category ?? "(missing)");
    if (new Set((kase.surface ?? []).map(familyOf)).size >= 2) crossService++;
    if (kase.tags?.freshness === "scheduled") freshnessPinned++;
    const text = caseText(kase);
    if (/\b(?:NEG|soft[- ]empty|empty result|degrad|unavailable|not found|zero result)\b/i.test(`${kase.id} ${text}`)) negativeOrEmpty++;
    if (/\bVOCAB\b/i.test(`${kase.id} ${text}`)) vocab++;
  }
  for (const entry of (manifest.entries ?? []).filter((item) => item.kind === "operation")) {
    const count = counts.get(entry.id) ?? 0;
    if (count < 2) findings.push(finding(level, "coverage", entry.id, `operation floor 2; found ${count}`));
  }
  for (const entry of (manifest.entries ?? []).filter((item) => item.kind === "skill")) {
    const floor = entry.id === DIGEST_SKILL ? 2 : 1;
    const count = counts.get(entry.id) ?? 0;
    if (count < floor) findings.push(finding(level, "coverage", entry.id, `skill floor ${floor}; found ${count}`));
  }
  for (const [category, floor] of Object.entries(CATEGORY_FLOORS)) {
    const count = categories.get(category) ?? 0;
    if (count < floor) findings.push(finding(level, "coverage", category, `category floor ${floor}; found ${count}`));
  }
  if (crossService < 12) findings.push(finding(level, "coverage", "cross-service", `cross-service floor 12; found ${crossService}`));
  if (negativeOrEmpty < 20) findings.push(finding(level, "coverage", "NEG/soft-empty", `floor 20; heuristic found ${negativeOrEmpty}`));
  if (vocab < 6) findings.push(finding(level, "coverage", "VOCAB", `floor 6; marker found ${vocab}`));
  for (const trap of CATALOG_NOTE_TRAPS) {
    const count = cases.filter((kase) =>
      (!trap.surface || (kase.surface ?? []).includes(trap.surface)) && trap.re.test(caseText(kase))
    ).length;
    if (count < 1) findings.push(finding(level, "coverage", trap.id, "catalog-note trap floor 1; found 0"));
  }
  const share = cases.length === 0 ? 0 : freshnessPinned / cases.length;
  if (share > 0.35) findings.push(finding(level, "coverage", "freshness", `scheduled share ${(share * 100).toFixed(1)}% exceeds 35%`));
  const serviceCounts = new Map();
  for (const kase of cases) inc(serviceCounts, kase.tags?.service ?? "(missing)");
  findings.push(finding("info", "coverage", "summary", `cases=${cases.length}; cross-service=${crossService}; NEG/soft-empty=${negativeOrEmpty}; VOCAB=${vocab}; scheduled=${freshnessPinned}`));
  findings.push(finding("info", "coverage", "services", [...serviceCounts].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => `${name}=${count}`).join(", ")));
  return findings;
}

export function lintLedger(cases, ledger, enforceCompleteness = false) {
  const findings = [];
  if (!ledger) return [finding("error", "ledger", "-", "migration ledger is missing")];
  const rows = Array.isArray(ledger) ? ledger : ledger.entries ?? ledger.rows;
  if (!Array.isArray(rows)) return [finding("error", "ledger", "-", "migration ledger has no entries array")];
  const caseById = new Map(cases.map((kase) => [kase.id, kase]));
  const seenSource = new Set();
  const sourceCounts = new Map();
  const dispositions = new Set(["carry", "merge", "redefine", "retire"]);
  for (const row of rows) {
    if (!Object.hasOwn(LEDGER_SOURCE_COUNTS, row.source)) findings.push(finding("error", "ledger", row.sourceId, `invalid source: ${row.source}`));
    if (typeof row.sourceId !== "string" || !row.sourceId.trim()) findings.push(finding("error", "ledger", "-", "sourceId must be a non-empty string"));
    inc(sourceCounts, row.source);
    const key = `${row.source ?? ""}\0${row.sourceId ?? ""}`;
    if (seenSource.has(key)) findings.push(finding("error", "ledger", row.sourceId, `duplicate source row for ${row.source}`));
    seenSource.add(key);
    if (!dispositions.has(row.disposition)) findings.push(finding("error", "ledger", row.sourceId, `invalid disposition: ${row.disposition}`));
    if (["carry", "merge", "redefine"].includes(row.disposition) && (!Array.isArray(row.destination) || row.destination.length === 0)) {
      findings.push(finding("error", "ledger", row.sourceId, `${row.disposition} requires destination`));
    }
    if (["merge", "redefine", "retire"].includes(row.disposition) && (typeof row.reason !== "string" || !row.reason.trim())) {
      findings.push(finding("error", "ledger", row.sourceId, `${row.disposition} requires reason`));
    }
    for (const destination of row.destination ?? []) {
      const destCase = caseById.get(destination);
      if (!destCase) findings.push(finding("error", "ledger", row.sourceId, `destination does not exist: ${destination}`));
      if (["carry", "redefine"].includes(row.disposition) && destCase && !String(destCase.truth?.origin ?? "").includes(row.sourceId)) {
        findings.push(finding("error", "ledger", row.sourceId, `destination ${destination} truth.origin does not name sourceId`));
      }
    }
  }
  for (const kase of cases) {
    if (String(kase.truth?.origin ?? "").startsWith("authored ")) continue;
    const destinationRows = rows.filter((row) => (row.destination ?? []).includes(kase.id));
    if (destinationRows.length === 0) findings.push(finding("error", "ledger", kase.id, "non-authored case is not a ledger destination"));
  }
  for (const [source, expected] of Object.entries(LEDGER_SOURCE_COUNTS)) {
    const count = sourceCounts.get(source) ?? 0;
    if (count !== expected) {
      findings.push(finding(enforceCompleteness ? "error" : "warn", "ledger", source, `source completeness expected ${expected}; found ${count}`));
    }
  }
  // Optional declarations let P4 make external-source completeness exact
  // without hard-coding external fixture ids into the linter. Absent
  // declarations do not block the migration seed.
  for (const [source, ids] of Object.entries(ledger.expectedSourceIds ?? {})) {
    for (const id of ids) {
      if (!seenSource.has(`${source}\0${id}`)) findings.push(finding("error", "ledger", id, `expected ${source} source id is missing`));
    }
  }
  return findings;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function contractDigest(cases) {
  return createHash("sha256").update(JSON.stringify(cases)).digest("hex");
}

function declaredDigest(contract) {
  const value = contract?.contractProvenance?.caseContentDigest;
  const match = typeof value === "string" && /^sha256\(JSON\.stringify\(cases\)\)=([a-f0-9]{64})$/.exec(value);
  return match?.[1];
}

function contractVersion(contract) {
  const match = LIVE_CONTRACT_VERSION_RE.exec(String(contract?.contract ?? ""));
  return match && Number(match[1]) > 0 ? Number(match[1]) : undefined;
}

function liveCaseSchemaFindings(kase) {
  const findings = [];
  const id = kase?.id ?? "-";
  const error = (message) => findings.push(finding("error", "live-schema", id, message));
  if (!kase || typeof kase !== "object" || Array.isArray(kase)) {
    error("case must be an object");
    return findings;
  }
  if (!isNonEmptyString(kase.id) || !/^q-[a-z0-9-]+$/.test(kase.id)) error("id must be a q-* kebab id");
  if (!isNonEmptyString(kase.question)) error("question is required");
  if (!Array.isArray(kase.surface) || !kase.surface.every(isNonEmptyString)) error("surface must be a string array");
  if (!QA_CATEGORIES.has(kase.tags?.category)) error(`unknown category ${kase.tags?.category}`);
  if (!QA_SERVICES.has(kase.tags?.service)) error(`unknown service ${kase.tags?.service}`);
  if (!FRESHNESS.has(kase.tags?.freshness)) error(`unknown freshness ${kase.tags?.freshness}`);
  if (kase.tags?.freshness !== "live") error("live contracts require tags.freshness live");
  if (kase.tags?.service !== "none" && kase.surface?.length === 0) error("surface is required unless service is none");
  if (kase.tags?.trap !== undefined && !TRAPS.has(kase.tags.trap)) error(`unknown trap ${kase.tags.trap}`);
  if (!isNonEmptyString(kase.golden?.answer)) error("golden.answer is required");
  if (!validStringArray(kase.golden?.keyFacts)) error("golden.keyFacts must be a non-empty string array");
  if (!Array.isArray(kase.golden?.avoid) || !kase.golden.avoid.every(isNonEmptyString)) error("golden.avoid must be a string array");
  if (kase.golden?.notes !== undefined && typeof kase.golden.notes !== "string") error("golden.notes must be a string");
  if (!TRUTH_DOMAINS.has(kase.truth?.domain)) error(`unknown truth.domain ${kase.truth?.domain}`);
  if (!TRUTH_STATUSES.has(kase.truth?.status)) error(`unknown truth.status ${kase.truth?.status}`);
  if (!DATE_RE.test(kase.truth?.asOf ?? "")) error("live cases require truth.asOf as YYYY-MM-DD");
  if (!Array.isArray(kase.truth?.sources) || kase.truth.sources.length === 0 || !kase.truth.sources.every((source) =>
    source && typeof source === "object" && SOURCE_CLASSES.has(source.class) && isNonEmptyString(source.ref)
  )) error("truth.sources must be a non-empty class A-F evidence array");
  if (!isNonEmptyString(kase.truth?.origin)) error("truth.origin is required");
  if (!DATE_RE.test(kase.truth?.verified?.date ?? "") || !isNonEmptyString(kase.truth?.verified?.by)) {
    error("truth.verified requires date and by");
  }
  if (!validStringArray(kase.truth?.verified?.evidence)) error("truth.verified.evidence must be a non-empty string array");
  for (const [index, row] of (kase.truth?.corroboration ?? []).entries()) {
    if (!isNonEmptyString(row?.claim) || !CORROBORATION_VERDICTS.has(row?.verdict)) {
      error(`truth.corroboration[${index}] has an invalid claim or verdict`);
      continue;
    }
    if (!Array.isArray(row.evidence) || row.evidence.length === 0 || !row.evidence.every((source) =>
      source && typeof source === "object" && SOURCE_CLASSES.has(source.class) && isNonEmptyString(source.ref)
    )) error(`truth.corroboration[${index}].evidence must be a non-empty class A-F evidence array`);
  }
  return findings;
}

function liveBehavioralGoldenFindings(cases) {
  const findings = [];
  for (const kase of cases) {
    const judgeFacing = [kase.question, kase.golden?.answer, ...(kase.golden?.keyFacts ?? []), ...(kase.golden?.avoid ?? [])]
      .filter(isNonEmptyString)
      .join(" ");
    if (!/\b(?:live|as[- ]of|current(?:ly)?|right now|latest|most recent|ground(?:ed|ing)?|quer(?:y|ied)|behavior)\b/i.test(judgeFacing)) {
      findings.push(finding("error", "live-behavior", kase.id, "live behavioral golden must require live grounding or currency framing"));
    }
    // Live goldens may preserve dated examples when they explicitly frame them
    // as snapshots. What they may not do is turn a volatile value into the
    // judge's timeless target (for example, “the current price is $0.42”).
    const volatileClaim = /\b(?:current(?:ly)?|right now|today|latest|most recent|open now)\b[^.!?]{0,160}(?:\$\s*\d|\b\d+(?:\.\d+)?\s*(?:%|bps?|ms|seconds?|minutes?|hours?|days?|weeks?|months?|years?|xlm|usdc|usd|million|billion|k|m|b)\b|\b(?:v|version\s*)\d+(?:\.\d+)*\b|\b(?:protocol|cap-|sep-)\s*\d+\b|\b20\d{2}-\d{2}(?:-\d{2})?\b)/i;
    const snapshotCaveat = /\b(?:as[- ]of|snapshot|historical|will change|will rotate|at run time|grade (?:the )?behavior)\b/i;
    if (volatileClaim.test(judgeFacing) && !snapshotCaveat.test(judgeFacing)) {
      findings.push(finding("error", "live-behavior", kase.id, "live behavioral golden pins a volatile numeric/version/date value without a snapshot caveat"));
    }
  }
  return findings;
}

export function lintLiveContract(contract, previousContract) {
  const findings = [];
  const cases = Array.isArray(contract?.cases) ? contract.cases : [];
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return [finding("error", "live-contract", "-", "live contract must be an object")];
  }
  if (!isNonEmptyString(contract.contract) || contractVersion(contract) === undefined) {
    findings.push(finding("error", "live-contract", "-", "contract must end with a positive -vN version"));
  }
  if (!isNonEmptyString(contract.$comment)) findings.push(finding("error", "live-contract", "-", "$comment must be a non-empty provenance note"));
  if (!Array.isArray(contract.membership) || contract.membership.length === 0 || !contract.membership.every(isNonEmptyString)) {
    findings.push(finding("error", "live-contract", "-", "membership must be a non-empty string array"));
  }
  if (!Array.isArray(contract.cases) || contract.cases.length === 0) {
    findings.push(finding("error", "live-contract", "-", "cases must be a non-empty array"));
  }
  const ids = cases.map((kase) => kase?.id);
  if (!same(contract.membership, ids)) findings.push(finding("error", "live-contract", "-", "membership must exactly equal ordered case ids"));
  if (new Set(ids).size !== ids.length) findings.push(finding("error", "live-contract", "-", "case ids must be unique"));
  const provenance = contract.contractProvenance;
  for (const field of ["membership", "content", "caseContentDigest"]) {
    if (!isNonEmptyString(provenance?.[field])) {
      findings.push(finding("error", "live-contract", "-", `contractProvenance.${field} must be a non-empty provenance note`));
    }
  }
  const digest = declaredDigest(contract);
  if (!digest) findings.push(finding("error", "live-contract", "-", "contractProvenance.caseContentDigest must be sha256(JSON.stringify(cases))=<hex>"));
  else if (digest !== contractDigest(cases)) findings.push(finding("error", "live-contract", "-", "contractProvenance.caseContentDigest does not match case content"));
  for (const kase of cases) findings.push(...liveCaseSchemaFindings(kase));
  findings.push(...lintGoldenAuthoring(cases), ...lintCorroboration(cases, {}), ...liveBehavioralGoldenFindings(cases));

  if (!previousContract) return findings;
  const previousCases = Array.isArray(previousContract.cases) ? previousContract.cases : [];
  const contentChanged = contractDigest(cases) !== contractDigest(previousCases);
  if (contentChanged) {
    if (contractVersion(contract) === undefined || contractVersion(previousContract) === undefined || contractVersion(contract) <= contractVersion(previousContract)) {
      findings.push(finding("error", "live-contract", "-", "case content changed without a contract-version bump"));
    }
    if (!isNonEmptyString(provenance?.content) || provenance.content === previousContract.contractProvenance?.content) {
      findings.push(finding("error", "live-contract", "-", "case content changed without a new contractProvenance.content note"));
    }
  }
  findings.push(...lintGospelChanges(cases, previousCases));
  return findings;
}

function parseArgs(argv) {
  const options = { coverage: false, enforceFloors: false, stale: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--coverage") options.coverage = true;
    else if (arg === "--enforce-floors") { options.coverage = true; options.enforceFloors = true; }
    else if (arg === "--stale") options.stale = true;
    else if (["--since", "--corpus", "--manifest", "--register", "--ledger", "--today", "--live-contract"].includes(arg)) {
      if (!argv[index + 1]) throw new Error(`${arg} requires a value`);
      const option = arg === "--live-contract" ? "liveContract" : arg.slice(2);
      options[option] = argv[++index];
    } else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function eventPayload() {
  const file = process.env.GITHUB_EVENT_PATH;
  if (!file || !existsSync(file)) return {};
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return {}; }
}

function ciSinceRef() {
  if (!process.env.CI) return undefined;
  // Pull request: diff against the merge-base with the target branch.
  if (process.env.GITHUB_BASE_SHA) return git(["merge-base", "HEAD", process.env.GITHUB_BASE_SHA]);
  const baseSha = eventPayload().pull_request?.base?.sha;
  if (baseSha) { try { return git(["merge-base", "HEAD", baseSha]); } catch { /* fall through */ } }
  if (process.env.GITHUB_BASE_REF) {
    for (const ref of [`origin/${process.env.GITHUB_BASE_REF}`, process.env.GITHUB_BASE_REF]) {
      try { return git(["merge-base", "HEAD", ref]); } catch { /* try the next CI ref */ }
    }
  }
  // Push: diff against the pushed range's parent (`before`). Zero-SHA means a
  // brand-new ref with no prior state — no base to diff, skip cleanly.
  const before = eventPayload().before;
  if (before && !/^0+$/.test(before)) {
    try { return git(["merge-base", "HEAD", before]); } catch { /* fall through */ }
  }
  return undefined;
}

export function isPullRequestCI(env = process.env) {
  return Boolean(env.CI) &&
    (env.GITHUB_EVENT_NAME === "pull_request" || Boolean(env.GITHUB_BASE_REF));
}

function loadCasesAtRef(ref, corpusDir) {
  const relDir = path.relative(ROOT, corpusDir).split(path.sep).join("/");
  let files = [];
  try {
    files = git(["ls-tree", "-r", "--name-only", ref, "--", relDir]).split("\n").filter((file) => file.endsWith(".json"));
  } catch (error) {
    throw new Error(`cannot read corpus at ${ref}: ${error.message}`);
  }
  return files.sort().map((file) => JSON.parse(git(["show", `${ref}:${file}`])));
}

function loadLiveContractAtRef(ref, contractPath) {
  const relativePath = path.relative(ROOT, contractPath).split(path.sep).join("/");
  if (relativePath.startsWith("../")) throw new Error(`live contract must be inside the repository: ${contractPath}`);
  try {
    return JSON.parse(git(["show", `${ref}:${relativePath}`]));
  } catch (error) {
    // An exact path is deliberate: a rename cannot silently become a fresh
    // contract, because that would evade the carried-case gospel comparison.
    throw new Error(`prior live contract is absent or renamed at ${ref}: ${relativePath}`);
  }
}

function printFindings(findings) {
  const ordered = [...findings].sort((a, b) =>
    a.level.localeCompare(b.level) || a.lane.localeCompare(b.lane) || a.id.localeCompare(b.id) || a.message.localeCompare(b.message)
  );
  for (const item of ordered) console.log(`[lint-corpus] ${item.level.toUpperCase()} [${item.lane}] ${item.id}: ${item.message}`);
  const errors = findings.filter((item) => item.level === "error").length;
  const warnings = findings.filter((item) => item.level === "warn").length;
  console.log(`[lint-corpus] ${errors} error(s), ${warnings} warning(s)`);
  return errors;
}

export function runLint({ cases, manifest, register = {}, ledger, previousCases, coverage = false, enforceFloors = false, stale = false, today }) {
  const findings = [
    ...lintSurface(cases, manifest),
    ...lintNumericInvariants(cases, register),
    ...lintDateContingentTraps(cases, register),
    ...lintAvoidPhrases(cases),
    ...lintGoldenAuthoring(cases),
    ...lintCorroboration(cases, register),
    ...lintLedger(cases, ledger, enforceFloors)
  ];
  if (previousCases) findings.push(...lintGospelChanges(cases, previousCases));
  if (coverage) findings.push(...lintCoverage(cases, manifest, enforceFloors));
  if (stale) findings.push(...lintStale(cases, today));
  return findings;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const since = options.since ?? ciSinceRef();
  if (options.liveContract) {
    if (!since) throw new Error("live-contract mode requires --since <ref>");
    const contractPath = path.resolve(options.liveContract);
    const findings = lintLiveContract(json(contractPath), loadLiveContractAtRef(since, contractPath));
    process.exitCode = printFindings(findings) > 0 ? 1 : 0;
    return;
  }
  const corpusDir = path.resolve(options.corpus ?? DEFAULTS.corpusDir);
  const manifestPath = path.resolve(options.manifest ?? DEFAULTS.manifestPath);
  const registerPath = path.resolve(options.register ?? DEFAULTS.registerPath);
  const ledgerPath = path.resolve(options.ledger ?? DEFAULTS.ledgerPath);
  if (isPullRequestCI(process.env) && !since) {
    // Fail closed for PRs only: the gospel lane is a required PR gate, so an
    // unresolvable base ref there is an error, never a silent skip. Push events
    // resolve their base from `before` (below); if that is unavailable the lane
    // skips with a NOTE rather than failing an otherwise-valid push.
    console.error(
      "[lint-corpus] ERROR [gospel] no base ref for PR CI — set GITHUB_BASE_REF or pass --since <ref>"
    );
    process.exitCode = 1;
    return;
  }
  let previousCases;
  if (since) {
    previousCases = loadCasesAtRef(since, corpusDir);
    if (previousCases.length === 0) {
      console.log(`[lint-corpus] NOTE gospel lane skipped: no owned corpus at ${since} (pre-migration base)`);
      previousCases = undefined;
    }
  } else {
    console.log("[lint-corpus] NOTE gospel lane skipped: no --since ref");
  }
  const findings = runLint({
    cases: loadCases(corpusDir),
    manifest: json(manifestPath),
    register: existsSync(registerPath) ? json(registerPath) : {},
    ledger: existsSync(ledgerPath) ? json(ledgerPath) : undefined,
    previousCases,
    coverage: options.coverage,
    enforceFloors: options.enforceFloors,
    stale: options.stale,
    today: options.today
  });
  process.exitCode = printFindings(findings) > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try { main(); }
  catch (error) { console.error(`[lint-corpus] ERROR: ${error.message}`); process.exitCode = 1; }
}
