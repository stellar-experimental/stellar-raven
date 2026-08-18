#!/usr/bin/env node
/**
 * compile-routing.mjs — compile the labeled golden QA corpus into routing eval cases.
 *
 * Reads:  eval/corpus/raven-golden-qa/big.json (override: argv[2]) — vendored snapshot,
 *         see eval/corpus/PROVENANCE.md (the raven sibling checkouts are retired)
 *         eval/corpus/raven-next/research/golden/ — the 538-case corpus, for the
 *         EXTENDED lane (the 144 net-new ids big.json predates; labels parsed from
 *         each question file's YAML frontmatter)
 * Writes: eval/routing-cases.json
 *
 * The whole point of this compile step (vs. raven-next's, which dropped them) is to
 * PRESERVE the routing labels: `expected_service`, `expected_cards`, and
 * `acceptable_cards`. The last field becomes a service-level `expected_any`
 * accept-either set (corpus-authored tolerance; non-empty on 383/395 big.json cases,
 * cross-service on 361). Strict grading is untouched: `expected_any` only feeds the
 * additional any1/any3/any5 fields in lib/grade.mjs, so the legacy 338-case strict
 * aggregate stays byte-identical.
 *
 * Lanes in the output:
 *   cases          — the legacy 338 (big.json labels; the comparable historical numbers)
 *   extendedCases  — net-new 538-corpus ids absent from big.json, same mapping/skips.
 *                    Graded as their own lane by run-routing.mjs, never merged into
 *                    the legacy aggregate.
 *
 * Label → catalog-namespace mapping (corpus label on the left, our namespace on the right):
 *   stellar_light → scout        (Stellar Light / Scout ecosystem analytics API)
 *   stellar_docs  → stellarDocs  (Stellar docs MCP / authored docs search op)
 *   lumenloop     → lumenloop    (Lumenloop partner API)
 *
 * Labels with no corresponding catalog namespace are SKIPPED with a reason and counted:
 *   perplexity, parallel — general-web services not in this catalog
 *   none                 — governance / should-not-fire cases (no expected service)
 * Any other/unknown label is also skipped (reason: unknown-label).
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveExpectedAny, frontmatterRouting } from "./lib/labels.mjs";
import { writeFileAtomic } from "../scripts/lib/shared.mjs";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
// Repo root, so committed paths are machine-independent (determinism convention:
// tracked generated artifacts must be byte-stable across checkouts).
const REPO_ROOT = resolve(EVAL_DIR, "..");
const DEFAULT_SOURCE = resolve(EVAL_DIR, "corpus/raven-golden-qa/big.json");
const EXTENDED_CORPUS_ROOT = resolve(EVAL_DIR, "corpus/raven-next");
const OUT_PATH = resolve(EVAL_DIR, "routing-cases.json");

// NOT exported: this file runs main() on import — importing anything from it is a
// footgun. eval/qa/lib.mjs keeps its own map (it additionally maps `none`).
const SERVICE_MAP = {
  stellar_light: "scout",
  stellar_docs: "stellarDocs",
  lumenloop: "lumenloop",
};

const SKIP_REASONS = {
  perplexity: "general-web service (perplexity) not in this catalog",
  parallel: "general-web service (parallel) not in this catalog",
  none: "governance / should-not-fire case (expected_service=none)",
};

/** Map one labeled entry into a routing case, or record a skip. Shared by both lanes. */
function compileEntry({ id, question, labels }, cases, skipped) {
  const label = labels.expected_service;
  const service = SERVICE_MAP[label];
  if (!service) {
    skipped.push({
      id,
      expected_service: label ?? null,
      reason: SKIP_REASONS[label] ?? `unknown-label (${String(label)})`,
    });
    return;
  }
  const c = { id, question, expected_service: service };
  if (Array.isArray(labels.expected_cards) && labels.expected_cards.length > 0) {
    c.expected_cards = labels.expected_cards;
  }
  const expectedAny = deriveExpectedAny(service, labels.acceptable_cards);
  if (expectedAny) c.expected_any = expectedAny;
  cases.push(c);
}

function laneCounts(cases, skipped) {
  const perService = {};
  for (const c of cases) perService[c.expected_service] = (perService[c.expected_service] ?? 0) + 1;
  const skipReasonCounts = {};
  for (const s of skipped) skipReasonCounts[s.reason] = (skipReasonCounts[s.reason] ?? 0) + 1;
  return { perService, skipReasonCounts };
}

function main() {
  const sourcePath = process.argv[2] ?? DEFAULT_SOURCE;
  const corpus = JSON.parse(readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(corpus)) throw new Error(`expected an array at ${sourcePath}`);

  // --- legacy lane: big.json labels (the comparable historical numbers) --------------
  const cases = [];
  const skipped = [];
  for (const entry of corpus) {
    compileEntry(
      {
        id: entry.id,
        question: entry.q,
        labels: {
          expected_service: entry.expected_service,
          expected_cards: entry.expected_cards,
          acceptable_cards: entry.acceptable_cards,
        },
      },
      cases,
      skipped,
    );
  }

  // --- extended lane: 538-corpus ids absent from big.json (frontmatter labels) -------
  const legacyIds = new Set(corpus.map((e) => e.id));
  const goldenPath = join(EXTENDED_CORPUS_ROOT, "research/golden/compiled/golden.json");
  const golden = JSON.parse(readFileSync(goldenPath, "utf8"));
  const extendedCases = [];
  const extendedSkipped = [];
  let extendedTotal = 0;
  for (const src of [...golden].sort((a, b) => a.id.localeCompare(b.id))) {
    if (legacyIds.has(src.id)) continue;
    extendedTotal += 1;
    const txt = readFileSync(join(EXTENDED_CORPUS_ROOT, src.sourceFile), "utf8");
    compileEntry({ id: src.id, question: src.question, labels: frontmatterRouting(txt) }, extendedCases, extendedSkipped);
  }

  const legacy = laneCounts(cases, skipped);
  const extended = laneCounts(extendedCases, extendedSkipped);
  const anyCount = cases.filter((c) => c.expected_any).length;
  const anyCountExt = extendedCases.filter((c) => c.expected_any).length;

  const out = {
    source: relative(REPO_ROOT, sourcePath),
    extendedSource: relative(REPO_ROOT, goldenPath),
    mapping: SERVICE_MAP,
    counts: {
      total: corpus.length,
      usable: cases.length,
      skipped: skipped.length,
      perService: legacy.perService,
      skipReasonCounts: legacy.skipReasonCounts,
      expectedAny: anyCount,
      extended: {
        total: extendedTotal,
        usable: extendedCases.length,
        skipped: extendedSkipped.length,
        perService: extended.perService,
        skipReasonCounts: extended.skipReasonCounts,
        expectedAny: anyCountExt,
      },
    },
    cases,
    extendedCases,
    skipped,
    extendedSkipped,
  };
  mkdirSync(EVAL_DIR, { recursive: true });
  writeFileAtomic(OUT_PATH, JSON.stringify(out, null, 2) + "\n");

  console.log(`compiled ${cases.length}/${corpus.length} legacy routing cases (${anyCount} with expected_any) -> ${OUT_PATH}`);
  console.table(legacy.perService);
  console.log(`skipped ${skipped.length}:`);
  console.table(legacy.skipReasonCounts);
  console.log(`\nextended lane: ${extendedCases.length}/${extendedTotal} net-new 538-corpus cases (${anyCountExt} with expected_any)`);
  console.table(extended.perService);
  console.log(`extended skipped ${extendedSkipped.length}:`);
  console.table(extended.skipReasonCounts);
}

main();
