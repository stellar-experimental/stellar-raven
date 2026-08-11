#!/usr/bin/env node
/**
 * run-routing.mjs — grade searchCatalog() routing accuracy against the compiled cases.
 *
 * Consumes (frozen search contract, scratchpad 514):
 *   - src/catalog/search.ts  → loadManifest(json), searchCatalog(catalog, opts), SearchHit
 *   - catalog/manifest.json
 *   - eval/routing-cases.json (produced by eval/compile-routing.mjs)
 *
 * For each case: searchCatalog(catalog, { query: question, limit: 5 }) and record
 * whether any hit's service matches expected_service at top-1 / top-3 / top-5, plus
 * card-level hit@5 when expected_cards is present (tolerant normalizer in lib/grade.mjs).
 *
 * Skills lane + overlay (todo 809), applied HERE at load time so that re-running
 * compile-routing.mjs (which regenerates routing-cases.json) never wipes them:
 *   - eval/skills-cases.json          hand-authored supplement; expected_service=skills.
 *     Graded as its own lane ("skills lane"), NEVER mixed into the legacy aggregate.
 *   - eval/build-question-overlay.json hand-reviewed per-case expected_any records
 *     for legacy or extended cases. Those cases are reported BOTH ways:
 *     strict (expected_service only — the legacy numbers, unchanged) and
 *     accept-either (any service in expected_any counts).
 *
 * Todo 817 additions (all strict-grading-neutral):
 *   - compiled cases may carry corpus-derived expected_any (from acceptable_cards);
 *     per case it is unioned with the overlay's, and a legacy accept-either overall
 *     is reported alongside the unchanged strict aggregate.
 *   - compiled.extendedCases (net-new 538-corpus ids) grade as their own
 *     "extended lane", never merged into the legacy aggregate.
 *
 * Outputs eval/results/routing-<timestamp>.json and console tables. With
 * `--dump-ranked <file>` also writes { caseId: [hitId, ...] } (ordered top-5 per
 * graded case, all lanes) for direct rank/membership diffs between builds
 * (research/skill-run-design.md §10.1a); grading is unchanged by the flag.
 *
 * Gate enforcement (eval/gates.json): every run prints a gate verdict — legacy 338
 * strict within ±bandPct of the baselined top-1/3/5 counts, skills lane top-1 at or
 * above its floor. Advisory by default; `--gate` (what CI passes) exits 1 on breach.
 * A changed denominator always breaches: lanes never merge, so a different n means
 * the gate must be re-baselined explicitly, not silently absorbed.
 *
 * Import strategy for search.ts (zero new deps):
 *   1. Direct `import("../src/catalog/search.ts")` — Node >= 23.6 strips types natively
 *      (works when the TS is erasable and relative imports carry explicit extensions).
 *   2. Fallback: transpile search.ts (+ its relative imports, recursively) to .mjs in
 *      eval/.build/ using the repo's own `typescript` package, then import that.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { aggregate, cardMatchesExact, gradeCase, tableRows } from "./lib/grade.mjs";
import { overlayExpectedAnyById, unionExpectedAny } from "./lib/labels.mjs";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(EVAL_DIR, "..");
const SEARCH_TS = join(REPO, "src", "catalog", "search.ts");
// --manifest <path>: grade a variant manifest (skills-form arm builds) with
// the same cases/gates machinery; default is the shipped catalog.
const MANIFEST_FLAG = process.argv.indexOf("--manifest");
const MANIFEST =
  MANIFEST_FLAG >= 0 && process.argv[MANIFEST_FLAG + 1] && !process.argv[MANIFEST_FLAG + 1].startsWith("--")
    ? resolve(process.argv[MANIFEST_FLAG + 1])
    : join(REPO, "catalog", "manifest.json");
const CASES = join(EVAL_DIR, "routing-cases.json");
const SKILLS_CASES = join(EVAL_DIR, "skills-cases.json");
const HOLDOUT_CASES = join(EVAL_DIR, "holdout-cases.json");
const OVERLAY = join(EVAL_DIR, "build-question-overlay.json");
const GATES = join(EVAL_DIR, "gates.json");
const RESULTS_DIR = join(EVAL_DIR, "results");
const ENFORCE_GATE = process.argv.includes("--gate");
// --dump-ranked <file>: additionally write { caseId: [hitId, ...] } — the ordered
// top-5 hit ids per graded case across ALL lanes (legacy + extended + skills).
// This is the §10.1a rank/membership-identity artifact (research/skill-run-design.md):
// diff two dumps (main vs feature build) — empty diff proves the routing invariant
// directly, which the ±band gate alone cannot. Grading and normal output are
// byte-identical whether or not the flag is passed.
const DUMP_RANKED_PATH = (() => {
  const i = process.argv.indexOf("--dump-ranked");
  if (i === -1) return null;
  const p = process.argv[i + 1];
  if (!p || p.startsWith("--")) throw new Error("--dump-ranked requires a file path argument");
  return resolve(p);
})();

async function loadSearchModule() {
  if (!existsSync(SEARCH_TS)) throw new Error(`missing ${SEARCH_TS} — Lane C not landed yet?`);
  try {
    return await import(pathToFileURL(SEARCH_TS).href);
  } catch (directErr) {
    try {
      return await transpileFallback();
    } catch (fallbackErr) {
      throw new Error(
        `could not import search.ts.\n  direct import: ${directErr.message}\n  tsc fallback: ${fallbackErr.message}`,
      );
    }
  }
}

/** Transpile src/catalog/search.ts and its relative-import graph into eval/.build/*.mjs. */
async function transpileFallback() {
  const ts = (await import(pathToFileURL(join(REPO, "node_modules", "typescript", "lib", "typescript.js")).href)).default;
  const buildDir = join(EVAL_DIR, ".build");
  mkdirSync(buildDir, { recursive: true });
  const done = new Map(); // abs .ts path -> abs .mjs path

  const resolveRel = (fromDir, spec) => {
    for (const cand of [spec, `${spec}.ts`, `${spec}/index.ts`, spec.replace(/\.js$/, ".ts")]) {
      const p = resolve(fromDir, cand);
      if (p.endsWith(".ts") && existsSync(p)) return p;
    }
    throw new Error(`cannot resolve relative import "${spec}" from ${fromDir}`);
  };

  const transpile = (tsPath) => {
    if (done.has(tsPath)) return done.get(tsPath);
    const outName = tsPath.slice(REPO.length + 1).replace(/[\\/]/g, "__").replace(/\.ts$/, ".mjs");
    const outPath = join(buildDir, outName);
    done.set(tsPath, outPath);
    let src = readFileSync(tsPath, "utf8");
    // Rewrite relative import/export specifiers to the transpiled .mjs siblings.
    src = src.replace(
      /(from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g,
      (_m, lead, q, spec) => {
        const depTs = resolveRel(dirname(tsPath), spec);
        const depOut = transpile(depTs);
        return `${lead}${q}./${depOut.slice(buildDir.length + 1)}${q}`;
      },
    );
    const out = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      fileName: tsPath,
    });
    writeFileSync(outPath, out.outputText);
    return outPath;
  };

  const entry = transpile(SEARCH_TS);
  return import(pathToFileURL(entry).href);
}

async function main() {
  const { loadManifest, searchCatalog } = await loadSearchModule();
  if (typeof loadManifest !== "function" || typeof searchCatalog !== "function") {
    throw new Error("search.ts does not export loadManifest + searchCatalog (contract violation)");
  }
  if (!existsSync(MANIFEST)) throw new Error(`missing ${MANIFEST} — Lane C not landed yet?`);
  if (!existsSync(CASES)) throw new Error(`missing ${CASES} — run: node eval/compile-routing.mjs`);

  const manifestJson = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const catalog = loadManifest(manifestJson);
  const compiled = JSON.parse(readFileSync(CASES, "utf8"));

  // --- overlay: attach expected_any to hand-reviewed case ids (load-time, so
  // compile-routing.mjs regenerating routing-cases.json never wipes it) ---------------
  let overlay = null;
  const expectedAnyById = new Map();
  if (existsSync(OVERLAY)) {
    overlay = JSON.parse(readFileSync(OVERLAY, "utf8"));
    const known = new Set([...compiled.cases, ...(compiled.extendedCases ?? [])].map((c) => c.id));
    for (const [id, expectedAny] of overlayExpectedAnyById(overlay, known, (id) => {
      console.warn(`overlay warning: case id "${id}" not present in routing-cases.json — ignored`);
    })) expectedAnyById.set(id, expectedAny);
  }

  const runCase = (c) => {
    // Union of corpus-derived tolerance (compiled expected_any, from acceptable_cards —
    // todo 817) and the hand-reviewed overlay (adds "skills" on build questions). Strict
    // top1/3/5 grading ignores expected_any entirely, so legacy numbers are unaffected.
    const overlayAny = expectedAnyById.get(c.id);
    const expectedAny = unionExpectedAny(c.expected_service, c.expected_any, overlayAny);
    const hits = searchCatalog(catalog, { query: c.question, limit: 5 });
    const grade = gradeCase(hits, c.expected_service, c.expected_cards, expectedAny);
    return {
      id: c.id,
      expected_service: c.expected_service,
      ...(expectedAny ? { expected_any: expectedAny } : {}),
      ...grade,
      topHits: hits.map((h) => ({ id: h.id, service: h.service, score: h.score })),
    };
  };

  // card@5 has no accept-either variant; carry the strict value through so cardN stays comparable
  const asAny = (r) =>
    r.any1 === undefined ? r : { expected_service: r.expected_service, top1: r.any1, top3: r.any3, top5: r.any5, cardHit5: r.cardHit5 };

  // --- legacy compiled cases: strict v3 (the gate) -------------------------------------
  const perCase = compiled.cases.map(runCase);
  const agg = aggregate(perCase);

  // --- corpus accept-either: every legacy case graded with its expected_any union ------
  // (strict `agg` above is untouched; this is the corpus-authored-tolerance view)
  const acceptEitherAgg = aggregate(perCase.map(asAny));

  // --- extended lane: net-new 538-corpus cases (own aggregate, never merged) ----------
  let extendedLane = null;
  let extendedPerCase = [];
  if (Array.isArray(compiled.extendedCases) && compiled.extendedCases.length > 0) {
    extendedPerCase = compiled.extendedCases.map(runCase);
    extendedLane = {
      strict: aggregate(extendedPerCase),
      acceptEither: aggregate(extendedPerCase.map(asAny)).overall,
    };
  }

  // --- overlay dual grading: keep legacy and extended subsets separate ----------------
  let overlayReport = null;
  if (overlay) {
    const report = (cases) => {
      const selected = cases.filter((r) => expectedAnyById.has(r.id));
      return {
        n: selected.length,
        strict: aggregate(selected).overall,
        acceptEither: aggregate(selected.map(asAny)).overall,
      };
    };
    overlayReport = {
      cases: [...expectedAnyById].map(([id, expected_any]) => ({ id, expected_any })),
      legacy: {
        ...report(perCase),
        // Context only; the strict legacy aggregate above remains the gate.
        overallAcceptEither: aggregate(perCase.map((r) => (expectedAnyById.has(r.id) ? asAny(r) : r))).overall,
      },
      extended: report(extendedPerCase),
    };
  }

  // --- skills lane (hand-authored supplement; own aggregate, never merged) ------------
  let skillsLane = null;
  let skillsPerCase = [];
  if (existsSync(SKILLS_CASES)) {
    const supplement = JSON.parse(readFileSync(SKILLS_CASES, "utf8"));
    skillsPerCase = supplement.cases.map(runCase);
    skillsLane = { authoredAt: supplement.authoredAt, ...aggregate(skillsPerCase).overall };
  }

  // --- frozen blind holdout (card rank + forbidden capture; diagnostic only) --------
  let holdoutLane = null;
  let holdoutPerCase = [];
  if (existsSync(HOLDOUT_CASES)) {
    const supplement = JSON.parse(readFileSync(HOLDOUT_CASES, "utf8"));
    const searchableEntries = catalog.entries.filter((e) => e.searchable !== false && e.kind !== "skill-section");
    for (const c of supplement.cases) {
      for (const card of [...c.expected_cards, ...c.forbidden_cards]) {
        const matches = searchableEntries.filter((entry) => cardMatchesExact(card, entry));
        if (matches.length !== 1) {
          throw new Error(`holdout card "${card}" resolves to ${matches.length} searchable catalog entries (case ${c.id})`);
        }
      }
    }
    holdoutPerCase = supplement.cases.map((c) => {
      const hits = searchCatalog(catalog, { query: c.question, limit: 5 });
      const expectedIndex = hits.findIndex((hit) => c.expected_cards.some((card) => cardMatchesExact(card, hit)));
      const expectedRank = expectedIndex === -1 ? null : expectedIndex + 1;
      const forbiddenHits = hits
        .filter((hit) => c.forbidden_cards.some((card) => cardMatchesExact(card, hit)))
        .map((hit) => hit.id);
      const top1 = expectedRank === 1;
      const top3 = expectedRank !== null && expectedRank <= 3;
      const top5 = expectedRank !== null && expectedRank <= 5;
      const forbiddenCapture = forbiddenHits.length > 0;
      return {
        id: c.id,
        expected_service: c.expected_service,
        expected_cards: c.expected_cards,
        forbidden_cards: c.forbidden_cards,
        expectedRank,
        top1,
        top3,
        top5,
        cardHit5: top5,
        forbiddenCapture,
        forbiddenHits,
        pass: top5 && !forbiddenCapture,
        topHits: hits.map((h) => ({ id: h.id, service: h.service, score: h.score })),
      };
    });
    const holdoutAgg = aggregate(holdoutPerCase);
    holdoutLane = {
      authoredAt: supplement.authoredAt,
      ...holdoutAgg.overall,
      forbiddenCaptures: holdoutPerCase.filter((r) => r.forbiddenCapture).length,
      passed: holdoutPerCase.filter((r) => r.pass).length,
    };
  }

  // --- gate check (eval/gates.json; EVALS.md: two gates, everything else diagnostic) --
  let gate = null;
  if (existsSync(GATES)) {
    const g = JSON.parse(readFileSync(GATES, "utf8"));
    const failures = [];
    if (g.gradingRule !== "v3-manifest-exposed") {
      failures.push(`gates.json gradingRule "${g.gradingRule}" is not what this runner grades (v3-manifest-exposed) — re-baseline`);
    }
    const o = agg.overall;
    if (o.n !== g.legacy.n) {
      failures.push(`legacy n=${o.n} ≠ baselined n=${g.legacy.n} — denominator changed; re-baseline gates.json explicitly`);
    } else {
      const band = Math.round((g.legacy.n * g.legacy.bandPct) / 100);
      for (const k of ["top1", "top3", "top5"]) {
        if (Math.abs(o[k] - g.legacy[k]) > band) failures.push(`legacy ${k}=${o[k]} outside ±${band} of baseline ${g.legacy[k]}`);
      }
    }
    if (!skillsLane) {
      failures.push("skills lane absent (eval/skills-cases.json missing) — the skills gate cannot be evaluated");
    } else if (skillsLane.n !== g.skills.n) {
      failures.push(`skills lane n=${skillsLane.n} ≠ baselined n=${g.skills.n} — re-baseline gates.json explicitly`);
    } else if (skillsLane.top1 < g.skills.minTop1) {
      failures.push(`skills lane top-1=${skillsLane.top1} below floor ${g.skills.minTop1}`);
    }
    // Holdout: a no-regression vector, not a target. Each rank floor and the forbidden-capture
    // ceiling are checked SEPARATELY so a gain in one metric cannot pay for damage in another —
    // the failure this lane exists to catch is a scorer change that rescues one skill family by
    // capturing another's territory, which a single combined score would hide. No ±band: at n=49
    // one case is 2% of the denominator, so slack here would swallow real movement. These floors
    // are the frozen first measurement; moving them is a re-baseline like any other.
    if (g.holdout) {
      if (!holdoutLane) {
        failures.push("holdout lane absent (eval/holdout-cases.json missing) — the holdout gate cannot be evaluated");
      } else if (holdoutLane.n !== g.holdout.n) {
        failures.push(`holdout lane n=${holdoutLane.n} ≠ baselined n=${g.holdout.n} — the frozen set changed; re-baseline gates.json explicitly`);
      } else {
        for (const [k, floor] of [["top1", g.holdout.minTop1], ["top3", g.holdout.minTop3], ["top5", g.holdout.minTop5]]) {
          if (holdoutLane[k] < floor) failures.push(`holdout lane ${k}=${holdoutLane[k]} below floor ${floor}`);
        }
        if (holdoutLane.forbiddenCaptures > g.holdout.maxForbiddenCaptures) {
          failures.push(`holdout forbidden captures=${holdoutLane.forbiddenCaptures} above ceiling ${g.holdout.maxForbiddenCaptures}`);
        }
      }
    }
    gate = {
      pass: failures.length === 0,
      failures,
      holdoutChecked: Boolean(g.holdout && holdoutLane),
      baselinedAt: g.baselinedAt,
      baselineResults: g.baselineResults,
    };
  } else if (ENFORCE_GATE) {
    throw new Error(`--gate passed but ${GATES} is missing`);
  }

  // --- ranked-id dump (--dump-ranked): every graded case, every lane, in grade order --
  if (DUMP_RANKED_PATH) {
    const ranked = {};
    for (const r of [...perCase, ...extendedPerCase, ...skillsPerCase]) {
      if (r.id in ranked) throw new Error(`--dump-ranked: duplicate case id "${r.id}" across lanes — dump would silently drop one`);
      ranked[r.id] = r.topHits.map((h) => h.id);
    }
    mkdirSync(dirname(DUMP_RANKED_PATH), { recursive: true });
    writeFileSync(DUMP_RANKED_PATH, JSON.stringify(ranked, null, 2) + "\n");
    console.log(`ranked-id dump (${Object.keys(ranked).length} cases) -> ${DUMP_RANKED_PATH}`);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(RESULTS_DIR, { recursive: true });
  const outPath = join(RESULTS_DIR, `routing-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        gradingRule: "v3-manifest-exposed",
        ...(MANIFEST_FLAG >= 0 ? { manifestOverride: MANIFEST } : {}),
        ...(gate ? { gate } : {}),
        casesFile: { generatedAt: compiled.generatedAt, source: compiled.source, counts: compiled.counts },
        overall: agg.overall,
        perService: agg.perService,
        acceptEitherOverall: acceptEitherAgg.overall,
        skipped: compiled.counts.skipReasonCounts,
        ...(extendedLane ? { extendedLane: { strict: extendedLane.strict.overall, perService: extendedLane.strict.perService, acceptEither: extendedLane.acceptEither } } : {}),
        ...(skillsLane ? { skillsLane } : {}),
        ...(holdoutLane ? { holdoutLane } : {}),
        ...(overlayReport ? { overlay: overlayReport } : {}),
        cases: perCase,
        ...(extendedPerCase.length > 0 ? { extendedCases: extendedPerCase } : {}),
        ...(skillsPerCase.length > 0 ? { skillsCases: skillsPerCase } : {}),
        ...(holdoutPerCase.length > 0 ? { holdoutCases: holdoutPerCase } : {}),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\nsearch-routing eval — ${perCase.length} legacy cases (${compiled.counts.skipped} skipped at compile), strict grading (rule v3, manifest-exposed)\n`);
  console.table(tableRows(agg));
  {
    const a = acceptEitherAgg.overall;
    const p = (b, num) => `${((100 * num) / b.n).toFixed(1)}%`;
    console.log(
      `legacy accept-either (corpus acceptable_cards ∪ overlay): ` +
        `top-1 ${p(a, a.top1)}, top-3 ${p(a, a.top3)}, top-5 ${p(a, a.top5)}`,
    );
  }
  if (extendedLane) {
    console.log(`\nextended lane — ${extendedPerCase.length} net-new 538-corpus cases (frontmatter labels), strict grading\n`);
    console.table(tableRows(extendedLane.strict));
    const a = extendedLane.acceptEither;
    const p = (num) => `${((100 * num) / a.n).toFixed(1)}%`;
    console.log(`extended accept-either: top-1 ${p(a.top1)}, top-3 ${p(a.top3)}, top-5 ${p(a.top5)}`);
  }
  if (skillsLane) {
    console.log(`\nskills lane — ${skillsPerCase.length} hand-authored cases (eval/skills-cases.json), strict grading\n`);
    console.table(tableRows(aggregate(skillsPerCase)));
  }
  if (holdoutLane) {
    console.log(`\nholdout lane — ${holdoutPerCase.length} FROZEN blind-authored cases (expected exact-card rank; pass = expected top-5 and no forbidden top-5 capture)\n`);
    console.table(tableRows(aggregate(holdoutPerCase)));
    console.table(holdoutPerCase.map((r) => ({
      id: r.id,
      rank: r.expectedRank ?? "miss",
      top1: r.top1 ? "PASS" : "FAIL",
      top3: r.top3 ? "PASS" : "FAIL",
      top5: r.top5 ? "PASS" : "FAIL",
      forbidden: r.forbiddenCapture ? r.forbiddenHits.join(", ") : "none",
      result: r.pass ? "PASS" : "FAIL",
    })));
    console.log(`holdout forbidden captures: ${holdoutLane.forbiddenCaptures}/${holdoutLane.n}`);
  }
  if (overlayReport) {
    const printOverlayLane = (name, lane) => {
      if (lane.n === 0) return;
      const p = (num) => `${((100 * num) / lane.n).toFixed(1)}%`;
      console.log(`\noverlay ${name} — ${lane.n} cases, dual grading\n`);
      console.table([
        { grading: "strict", "top-1": p(lane.strict.top1), "top-3": p(lane.strict.top3), "top-5": p(lane.strict.top5) },
        { grading: "accept-either", "top-1": p(lane.acceptEither.top1), "top-3": p(lane.acceptEither.top3), "top-5": p(lane.acceptEither.top5) },
      ]);
    };
    printOverlayLane("legacy", overlayReport.legacy);
    printOverlayLane("extended", overlayReport.extended);
    const lo = overlayReport.legacy.overallAcceptEither;
    console.log(
      `legacy overall if overlay cases were graded accept-either (context only): ` +
        `top-1 ${((100 * lo.top1) / lo.n).toFixed(1)}%, top-3 ${((100 * lo.top3) / lo.n).toFixed(1)}%, top-5 ${((100 * lo.top5) / lo.n).toFixed(1)}%`,
    );
  }
  console.log("\nskipped at compile:", compiled.counts.skipReasonCounts);
  if (gate) {
    if (gate.pass) {
      // Name every lane the gate actually checked. A PASS that only mentions two of three lanes
      // reads as "the holdout was not evaluated" to anyone who did not open gates.json.
      console.log(
        `\nGATE PASS — legacy 338 within band, skills lane at/above floor${gate.holdoutChecked ? ", holdout lane at/above floors and under its capture ceiling" : ""} (baseline ${gate.baselineResults})`,
      );
    } else {
      console.log(`\nGATE FAIL${ENFORCE_GATE ? "" : " (advisory — enforce with --gate)"}:`);
      for (const f of gate.failures) console.log(`  - ${f}`);
    }
  }
  console.log(`\nresults -> ${outPath}`);
  if (gate && !gate.pass && ENFORCE_GATE) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`run-routing failed: ${err.message}`);
  process.exit(1);
});
