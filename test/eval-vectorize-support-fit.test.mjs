import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "acorn";
import { describe, expect, it } from "vitest";
import manifestJson from "../catalog/manifest.json" with { type: "json" };
import gates from "../eval/gates.json" with { type: "json" };
import originalContract from "../eval/protocol-history-cases.json" with { type: "json" };
import blindContract from "../eval/protocol-history-blind-cases.json" with { type: "json" };
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import {
  applyRerankHysteresis,
  buildCandidateUnion,
  loadBankedRerankClauseArtifact,
  pairIndexForBase,
} from "../eval/vectorize/rerank-retrieval.mjs";
import { createScoreCache, shouldFail as attemptTwoShouldFail } from "../eval/vectorize/run-rerank-fit.mjs";
import {
  RETAINED_CACHE_PINS,
  acceptance,
  assertIdentityCalibration,
  assertMaxClauseCalibration,
  assertRetainedCachePins,
  entrySupportFits,
  noisyOr,
  prepareSupportReadingsFromCache,
  shouldFail,
  stableSortByFit,
  supportFit,
} from "../eval/vectorize/run-support-fit.mjs";

const catalog = loadManifest(manifestJson);
const frozenRows = [originalContract, blindContract]
  .flatMap((contract) => [...contract.positiveCases, ...contract.controlCases]);
const environment = {
  node: "test",
  onnxruntimeNode: "test",
  platform: "test",
  probeScoreSha256: "0".repeat(64),
};

let clauseData;
function clausesFixture() {
  clauseData ??= loadBankedRerankClauseArtifact();
  return clauseData;
}

function passingReading() {
  return {
    name: "support-fit",
    original: { top5: 8, controlTop5Captures: 0 },
    blind: { top5: 11, controlTop5Captures: 0 },
    legacy: { top1: 208, top3: 279, top5: 311 },
    skills: { top1: 16 },
    holdout: { top1: 10, top3: 22, top5: 25, forbiddenCaptures: 11 },
    extended: {
      strict: { top1: 90, top3: 109, top5: 117 },
      acceptEither: { top5: 122 },
    },
    protocolVersionTop1: "stellarDocs.search_protocol_concepts_docs",
  };
}

function identityReading() {
  return {
    legacy: { ...gates.evidence.acceptedTotals.legacy },
    skills: { ...gates.evidence.acceptedTotals.skills },
    holdout: { ...gates.evidence.acceptedTotals.holdout },
    original: { top5: 4, controlTop5Captures: 1 },
    blind: { top5: 3, controlTop5Captures: 6 },
    changedRankings: [],
  };
}

function maxClauseReading() {
  return {
    original: {
      top1: 3,
      top3: 4,
      top5: 5,
      controlTop5Captures: 2,
      positiveMisses: [
        "ph-protocol-24-archival-root-cause",
        "ph-protocol-corrective-upgrade-history",
        "ph-protocol-upgrade-chronology",
      ],
      controlCaptures: ["ph-control-current-protocol", "ph-control-validator-vote"],
    },
    blind: {
      top1: 2,
      top3: 2,
      top5: 3,
      controlTop5Captures: 4,
      positiveMisses: [
        "phb-whisk-forced-follow-up",
        "phb-archival-defect-network-upgrade",
        "phb-auth-recursion-auditors",
        "phb-core-upgrades-dates-features",
        "phb-network-upgrades-reasons",
        "phb-second-cut-after-whisk",
        "phb-cap-archival-fee-repair",
        "phb-clawback-origin-emergency-changes",
      ],
      controlCaptures: [
        "phb-control-incident-runbook",
        "phb-control-sdk-version-history",
        "phb-control-kyc-breach-report",
        "phb-control-failed-deploy-post-mortem",
      ],
    },
    changedRankings: Array.from({ length: 495 }, (_, id) => ({ id })),
    routingGate: { pass: false },
  };
}

describe("support aggregate", () => {
  it("1. handles one clause, two clauses, and an empty set", () => {
    expect(noisyOr([0.25])).toBe(0.25);
    expect(noisyOr([0.5, 0.5])).toBe(0.75);
    expect(noisyOr([])).toBe(0);
  });

  it("2. is order-independent", () => {
    const scores = [0.12, 0.5, 0.77, 0.02];
    expect(noisyOr(scores)).toBeCloseTo(noisyOr([0.77, 0.02, 0.12, 0.5]), 14);
  });

  it("3. is monotone in each input", () => {
    const baseline = noisyOr([0.2, 0.4, 0.6]);
    for (const raised of [[0.3, 0.4, 0.6], [0.2, 0.5, 0.6], [0.2, 0.4, 0.7]]) {
      expect(noisyOr(raised)).toBeGreaterThanOrEqual(baseline);
    }
  });

  it("4. saturates at one and stays finite near one", () => {
    expect(noisyOr([0.2, 1, 0.3])).toBe(1);
    const nearOne = noisyOr([1 - Number.EPSILON, 0.999999999999]);
    expect(nearOne).toBeLessThanOrEqual(1);
    expect(Number.isFinite(nearOne)).toBe(true);
  });

  it("5. keeps the registered negative rule", () => {
    expect(supportFit([0.5])).toBe(0.5);
    expect(supportFit([0.5], [0.4])).toBe(0.5);
    expect(supportFit([0.5], [0.8])).toBeCloseTo(0.2);
  });

  it("6. groups scores through pairIndex and handles no positive clause", () => {
    const clauses = [
      { entryId: "a", role: "positive" },
      { entryId: "b", role: "negative" },
      { entryId: "a", role: "negative" },
      { entryId: "a", role: "positive" },
    ];
    const fits = entrySupportFits(clauses, [0, 1, 2, 3], [0.5, 0.9, 0.4, 0.5]);
    expect(fits.get("a")).toBe(0.75);
    expect(fits.get("b")).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe("support ordering", () => {
  const base = [
    { id: "a", tier: "gated", score: 10 },
    { id: "b", tier: "backfill", score: 20 },
    { id: "c", tier: "gated", score: 30 },
  ];

  it("7. sorts descending and keeps base order for ties", () => {
    const result = stableSortByFit(base, new Map([["a", 0.2], ["b", 0.8], ["c", 0.8]]));
    expect(result.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
  });

  it("8. equals zero-margin attempt-two ordering on random inputs and ties", () => {
    let state = 0x51f15e;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    for (let trial = 0; trial < 100; trial += 1) {
      const items = Array.from({ length: 20 }, (_, index) => ({ id: `id-${index}` }));
      const fits = new Map(items.map((item) => [item.id, Math.floor(random() * 5) / 4]));
      expect(stableSortByFit(items, fits).map((entry) => entry.id))
        .toEqual(applyRerankHysteresis(items, fits, 0).map((entry) => entry.id));
    }
  });

  it("9. preserves tier and lexical score values", () => {
    const result = stableSortByFit(base, new Map([["a", 0.2], ["b", 0.9], ["c", 0.1]]));
    expect(result.find((entry) => entry.id === "b")).toEqual({ id: "b", tier: "backfill", score: 20 });
  });
});

describe("frozen union and pair index", () => {
  it("10. contains scout.searchResearch for all 19 positive questions", () => {
    const positives = [originalContract, blindContract].flatMap((contract) => contract.positiveCases);
    expect(positives).toHaveLength(19);
    for (const row of positives) {
      expect(buildCandidateUnion(searchCatalog, catalog, row.question).map((hit) => hit.id), row.id)
        .toContain("scout.searchResearch");
    }
  });

  it("11. builds a strict artifact-order pair index for all 32 frozen questions", () => {
    expect(frozenRows).toHaveLength(32);
    const clauses = clausesFixture().clauses;
    for (const row of frozenRows) {
      const base = buildCandidateUnion(searchCatalog, catalog, row.question);
      const baseIds = new Set(base.map((hit) => hit.id));
      const indexes = pairIndexForBase(base, clauses);
      expect(indexes.every((index, offset) => offset === 0 || index > indexes[offset - 1]), row.id).toBe(true);
      expect(indexes.every((index) => baseIds.has(clauses[index].entryId)), row.id).toBe(true);
      expect(indexes).toEqual(clauses.flatMap((clause, index) => baseIds.has(clause.entryId) ? [index] : []));
    }
  });
});

describe("cache-only guards", () => {
  it("12. keeps forbidden modules out of the top-level static eval import graph", () => {
    const evalRoot = path.resolve("eval");
    const entry = path.resolve("eval/vectorize/run-support-fit.mjs");
    const pending = [entry];
    const walked = new Set();
    const forbidden = new Set([
      "rerank-scorer.mjs",
      "embedder.mjs",
      "fetch-rerank-model.mjs",
      "preflight-rerank-model.mjs",
      "preflight-clause-model.mjs",
    ]);
    while (pending.length) {
      const file = pending.pop();
      if (walked.has(file)) continue;
      walked.add(file);
      const ast = parse(readFileSync(file, "utf8"), { ecmaVersion: "latest", sourceType: "module" });
      for (const declaration of ast.body.filter((node) => node.type === "ImportDeclaration")) {
        const specifier = declaration.source.value;
        expect(specifier.startsWith("@huggingface") || specifier.startsWith("onnxruntime"), `${file}: ${specifier}`)
          .toBe(false);
        if (!specifier.startsWith(".")) continue;
        const resolved = path.resolve(path.dirname(file), specifier);
        if (resolved === evalRoot || resolved.startsWith(`${evalRoot}${path.sep}`)) pending.push(resolved);
      }
    }
    expect([...walked].some((file) => forbidden.has(path.basename(file)))).toBe(false);
  });

  it("13. imports with all model and support-cache variables unset", () => {
    const env = { ...process.env };
    delete env.RAVEN_RERANK_MODEL_DIR;
    delete env.RAVEN_VECTORIZE_MODEL_DIR;
    delete env.RAVEN_SUPPORT_CACHE_PATH;
    const referee = pathToFileURL(path.resolve("eval/vectorize/run-support-fit.mjs")).href;
    execFileSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(referee)});`], {
      cwd: path.resolve("."),
      env,
      stdio: "pipe",
    });
  });

  it("14. refuses each retained cache hash mismatch before a reading", () => {
    const cache = {
      queries: [],
      pairIndex: [],
      scoresSha256: RETAINED_CACHE_PINS.scoresSha256,
    };
    expect(() => assertRetainedCachePins({
      cache,
      fileSha256: "0".repeat(64),
      scoreCount: RETAINED_CACHE_PINS.scores,
    })).toThrow(/file SHA-256/);
    expect(() => assertRetainedCachePins({
      cache: { ...cache, scoresSha256: "0".repeat(64) },
      fileSha256: RETAINED_CACHE_PINS.fileSha256,
      scoreCount: RETAINED_CACHE_PINS.scores,
    })).toThrow(/scoresSha256/);
    expect(() => assertRetainedCachePins({
      cache,
      fileSha256: RETAINED_CACHE_PINS.fileSha256,
      scoreCount: RETAINED_CACHE_PINS.scores,
    })).toThrow(/record SHA-256/);
  });

  it("15. derives a planted support order from a synthetic pinned-shape cache", () => {
    const questions = ["synthetic query"];
    const bases = [[{ id: "a" }, { id: "b" }]];
    const clauses = [
      { entryId: "a", role: "positive" },
      { entryId: "a", role: "positive" },
      { entryId: "b", role: "positive" },
    ];
    const pairIndex = [[0, 1, 2]];
    const cache = createScoreCache({ questions, pairIndex, scores: [0.4, 0.4, 0.6], environment });
    const prepared = prepareSupportReadingsFromCache({ cache, questions, pairIndex, bases, clauses });
    const row = prepared.get(questions[0]);
    expect(stableSortByFit(row.base, row.maxClauseFits).map((hit) => hit.id)).toEqual(["b", "a"]);
    expect(stableSortByFit(row.base, row.supportFits).map((hit) => hit.id)).toEqual(["a", "b"]);
  });
});

describe("calibration and outcome", () => {
  it("16. rejects every compared identity calibration field", () => {
    const valid = identityReading();
    expect(() => assertIdentityCalibration(valid, gates)).not.toThrow();
    for (const lane of ["legacy", "skills", "holdout"]) {
      for (const key of Object.keys(gates.evidence.acceptedTotals[lane])) {
        const changed = structuredClone(valid);
        changed[lane][key] += 1;
        expect(() => assertIdentityCalibration(changed, gates), `${lane}.${key}`).toThrow();
      }
    }
    for (const [scope, key] of [
      ["original", "top5"],
      ["original", "controlTop5Captures"],
      ["blind", "top5"],
      ["blind", "controlTop5Captures"],
    ]) {
      const changed = structuredClone(valid);
      changed[scope][key] += 1;
      expect(() => assertIdentityCalibration(changed, gates), `${scope}.${key}`).toThrow();
    }
    const changedRank = structuredClone(valid);
    changedRank.changedRankings.push({ id: "changed" });
    expect(() => assertIdentityCalibration(changedRank, gates)).toThrow(/changedRankings/);
  });

  it("17. rejects every section 7 max-clause expectation", () => {
    const valid = maxClauseReading();
    expect(() => assertMaxClauseCalibration(valid)).not.toThrow();
    for (const contract of ["original", "blind"]) {
      for (const key of ["top1", "top3", "top5", "controlTop5Captures"]) {
        const changed = structuredClone(valid);
        changed[contract][key] += 1;
        expect(() => assertMaxClauseCalibration(changed), `${contract}.${key}`).toThrow();
      }
      for (const key of ["positiveMisses", "controlCaptures"]) {
        const changed = structuredClone(valid);
        changed[contract][key] = changed[contract][key].slice(1);
        expect(() => assertMaxClauseCalibration(changed), `${contract}.${key}`).toThrow();
      }
    }
    const changedRank = structuredClone(valid);
    changedRank.changedRankings.pop();
    expect(() => assertMaxClauseCalibration(changedRank)).toThrow(/changedRankings/);
    const changedGate = structuredClone(valid);
    changedGate.routingGate.pass = true;
    expect(() => assertMaxClauseCalibration(changedGate)).toThrow(/routingGate/);
  });

  it("18. fails unless support-fit passes the full table and keeps a local function", () => {
    const valid = passingReading();
    valid.acceptance = acceptance(valid);
    expect(shouldFail({ readings: [valid] })).toBe(false);
    expect(shouldFail).not.toBe(attemptTwoShouldFail);

    const changes = [
      (row) => { row.original.top5 = 7; },
      (row) => { row.original.controlTop5Captures = 1; },
      (row) => { row.blind.top5 = 10; },
      (row) => { row.blind.controlTop5Captures = 1; },
      (row) => { row.legacy.top1 = 204; },
      (row) => { row.skills.top1 = 15; },
      (row) => { row.holdout.top1 = 9; },
      (row) => { row.holdout.forbiddenCaptures = 12; },
      (row) => { row.extended.strict.top1 = 89; },
      (row) => { row.extended.acceptEither.top5 = 121; },
      (row) => { row.protocolVersionTop1 = "scout.searchResearch"; },
    ];
    for (const change of changes) {
      const reading = passingReading();
      change(reading);
      reading.acceptance = acceptance(reading);
      expect(shouldFail({ readings: [reading] })).toBe(true);
    }
    const partial = passingReading();
    partial.original.top5 = 7;
    partial.acceptance = acceptance(partial);
    expect(shouldFail({ outcome: "PARTIAL", readings: [partial] })).toBe(true);
  });
});
