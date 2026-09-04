import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import manifestJson from "../catalog/manifest.json" with { type: "json" };
import originalContract from "../eval/protocol-history-cases.json" with { type: "json" };
import blindContract from "../eval/protocol-history-blind-cases.json" with { type: "json" };
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { scoreEntryWeighted } from "../src/catalog/scoring.ts";
import {
  MODEL_FILES,
  REGISTERED_MARGINS,
  RERANK_MODEL,
  sha256,
  tokenizePairs,
} from "../eval/vectorize/rerank-config.mjs";
import {
  assertScoresVaryAcrossDistinctPairs,
  initializeReranker,
  scorePairsWithReranker,
  scoreRawLogits,
  sigmoid,
} from "../eval/vectorize/rerank-scorer.mjs";
import {
  applyRerankHysteresis,
  buildCandidateUnion,
  clauseFit,
  loadBankedRerankClauseArtifact,
  pairIndexForBase,
  scoringProjection,
} from "../eval/vectorize/rerank-retrieval.mjs";
import {
  buildRefereeDataset,
  createScoreCache,
  decodeFloat32Scores,
  loadRefereeInputs,
  prepareReadingsFromCache,
  scoreCacheRecordSha256,
  shouldFail,
  validateScoreCache,
} from "../eval/vectorize/run-rerank-fit.mjs";

const catalog = loadManifest(manifestJson);
const frozenRows = [originalContract, blindContract]
  .flatMap((contract) => [...contract.positiveCases, ...contract.controlCases]);

let clauseData;
function clausesFixture() {
  clauseData ??= loadBankedRerankClauseArtifact();
  return clauseData;
}

const candidateUnionCache = new Map();
function candidateUnionFixture(question) {
  let union = candidateUnionCache.get(question);
  if (!union) {
    union = buildCandidateUnion(searchCatalog, catalog, question);
    candidateUnionCache.set(question, union);
  }
  return union;
}

describe("pair construction and encoding", () => {
  it("1. validates the banked artifact without reconstructing current source text", () => {
    const { artifact, clauses } = clausesFixture();
    expect(clauses).toHaveLength(artifact.clauses.length);
    clauses.forEach((clause, index) => {
      expect(clause, `${index}:${clause.entryId}`).toEqual(artifact.clauses[index]);
      expect(clause.textSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(artifact.clauses[index]).not.toHaveProperty("text");
    });
  });

  it("2. keeps the raw query and never adds the embedding instruction wrapper", () => {
    const calls = [];
    const query = "raw referee question";
    tokenizePairs((texts, options) => calls.push({ texts, options }), [query], ["document"]);
    expect(calls[0].texts).toEqual([query]);
    expect(calls[0].texts[0]).not.toContain("Instruct:");
  });

  it("3. keeps historical clause text out of the banked artifact", () => {
    expect(clausesFixture().clauses.every((clause) => !Object.hasOwn(clause, "text"))).toBe(true);
  });

  it("4. passes clauses through text_pair with the frozen tokenizer options", () => {
    let received;
    const result = tokenizePairs((queries, options) => {
      received = { queries, options };
      return "tokens";
    }, ["query one", "query two"], ["clause one", "clause two"]);
    expect(result).toBe("tokens");
    expect(received).toEqual({
      queries: ["query one", "query two"],
      options: {
        text_pair: ["clause one", "clause two"],
        padding: true,
        truncation: true,
        max_length: 512,
      },
    });
    expect(received.queries).not.toContain("query one clause one");
  });
});

describe("score transform", () => {
  it("5. applies exactly one sigmoid to each raw logit", () => {
    expect(sigmoid(0)).toBe(0.5);
    const scores = scoreRawLogits([[-2], [0], [2]], 3);
    expect(scores[0]).toBeLessThan(scores[1]);
    expect(scores[1]).toBeLessThan(scores[2]);
  });

  it("6. reads logits[i][0], ignores pipeline scores, and rejects a constant path", () => {
    const output = Object.assign([[-1], [1]], { score: 1 });
    expect(scoreRawLogits(output, 2)).toEqual([sigmoid(-1), sigmoid(1)]);
    expect(() => assertScoresVaryAcrossDistinctPairs(["q1", "q2"], ["d1", "d2"], [1, 1]))
      .toThrow(/constant score/);
  });
});

describe("local-only lazy loader", () => {
  it("7. verifies the parent layout and sets local-only env before construction", async () => {
    const modelDir = mkdtempSync(path.join(tmpdir(), "rerank-model-parent-"));
    for (const pin of MODEL_FILES) {
      const file = path.join(modelDir, RERANK_MODEL.id, pin.path);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, pin.path);
    }
    const env = {};
    const events = [];
    const tokenizer = () => ({});
    const model = async () => ({ logits: [[0]] });
    const transformers = {
      env,
      AutoTokenizer: {
        from_pretrained: async (...args) => {
          events.push(["tokenizer", ...args, { ...env }]);
          expect(env).toMatchObject({
            allowRemoteModels: false,
            allowLocalModels: true,
            localModelPath: modelDir,
            useFSCache: false,
          });
          return tokenizer;
        },
      },
      AutoModelForSequenceClassification: {
        from_pretrained: async (...args) => {
          events.push(["model", ...args, { ...env }]);
          expect(env.allowRemoteModels).toBe(false);
          return model;
        },
      },
    };
    expect(await initializeReranker(transformers, modelDir)).toEqual({ tokenizer, model });
    expect(events[0].slice(0, 2)).toEqual(["tokenizer", RERANK_MODEL.id]);
    expect(events[1].slice(0, 3)).toEqual(["model", RERANK_MODEL.id, { dtype: "q8" }]);
    expect(events.flat().join(" ")).not.toContain(RERANK_MODEL.revision);
  });

  it("8. imports the scorer and referee without a model directory or construction", () => {
    const env = { ...process.env };
    delete env.RAVEN_RERANK_MODEL_DIR;
    const scorer = pathToFileURL(path.resolve("eval/vectorize/rerank-scorer.mjs")).href;
    const referee = pathToFileURL(path.resolve("eval/vectorize/run-rerank-fit.mjs")).href;
    execFileSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(scorer)}); await import(${JSON.stringify(referee)});`], {
      cwd: path.resolve("."),
      env,
      stdio: "pipe",
    });
  });
});

describe("fit formula", () => {
  it("9. equals pos when the entry has no negative clause", () => expect(clauseFit([0.2, 0.5])).toBe(0.5));
  it("10. equals pos when neg is not greater than pos", () => expect(clauseFit([0.5], [0.4])).toBe(0.5));
  it("11. equals 2*pos-neg when neg is greater than pos", () => expect(clauseFit([0.5], [0.8])).toBeCloseTo(0.2));
});

describe("one-pass hysteresis", () => {
  const items = [
    { id: "a", score: 10, tier: "gated" },
    { id: "b", score: 20, tier: "backfill" },
    { id: "c", score: 30, tier: "gated" },
  ];

  it("12. keeps the base order at Infinity", () => {
    expect(applyRerankHysteresis(items, new Map([["c", 1]]), Infinity)).toEqual(items);
  });

  it("13. swaps at the exact positive margin boundary only", () => {
    expect(applyRerankHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.55]]), 0.05).map((x) => x.id))
      .toEqual(["b", "a"]);
    expect(applyRerankHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.55 - 1e-9]]), 0.05).map((x) => x.id))
      .toEqual(["a", "b"]);
  });

  it("14. keeps equal fits in base order at every registered margin", () => {
    for (const margin of REGISTERED_MARGINS) {
      expect(applyRerankHysteresis(items, new Map(items.map((item) => [item.id, 1])), margin).map((x) => x.id))
        .toEqual(["a", "b", "c"]);
    }
  });

  it("15. stops at the first preceding candidate it does not dominate", () => {
    expect(applyRerankHysteresis(items, new Map([["a", 0.2], ["b", 0.8], ["c", 0.7]]), 0).map((x) => x.id))
      .toEqual(["b", "c", "a"]);
  });

  it("16. preserves tier and lexical score values", () => {
    const result = applyRerankHysteresis(items, new Map([["a", 0.1], ["b", 0.9], ["c", 0.2]]), 0.05);
    expect(result.find((item) => item.id === "b")).toEqual({ id: "b", score: 20, tier: "backfill" });
  });
});

describe("candidate union", () => {
  it("17. contains scout.searchResearch for all 19 frozen positives", () => {
    const positives = [originalContract, blindContract].flatMap((contract) => contract.positiveCases);
    expect(positives).toHaveLength(19);
    for (const row of positives) {
      expect(candidateUnionFixture(row.question).map((hit) => hit.id), row.id)
        .toContain("scout.searchResearch");
    }
  });

  it("18. has no duplicates and marks every gated failure as backfill", () => {
    expect(frozenRows).toHaveLength(32);
    for (const row of frozenRows) {
      const union = candidateUnionFixture(row.question);
      expect(new Set(union.map((hit) => hit.id)).size, row.id).toBe(union.length);
      for (const hit of union.slice(5)) {
        const entry = catalog.entries.find((candidate) => candidate.id === hit.id);
        if (scoreEntryWeighted(scoringProjection(entry), row.question) === null) {
          expect(hit.tier, `${row.id}:${hit.id}`).toBe("backfill");
        }
      }
    }
  });

  it("19. sorts R by ungated score descending then id ascending and uses name: entry.id", () => {
    const entry = catalog.entries.find((candidate) => candidate.searchable !== false);
    expect(scoringProjection({ ...entry, name: "production alias" })).toEqual({
      id: entry.id,
      name: entry.id,
      service: entry.service,
      kind: entry.kind,
      description: entry.description,
      keywords: entry.keywords,
      routingKeywords: entry.routingKeywords,
    });
    for (const row of frozenRows) {
      const remainder = candidateUnionFixture(row.question).slice(5);
      const sorted = remainder.slice().sort((left, right) => right.ungatedScore - left.ungatedScore || left.id.localeCompare(right.id));
      expect(remainder.map((hit) => hit.id), row.id).toEqual(sorted.map((hit) => hit.id));
    }
  });
});

describe("score cache and referee", () => {
  const environment = { node: "test", onnxruntimeNode: "test", platform: "test", probeScoreSha256: "0".repeat(64) };

  it("20. round-trips float32 scores and reproduces scoresSha256", () => {
    const cache = createScoreCache({ questions: ["q"], pairIndex: [[2, 4]], scores: [0.125, 0.75], environment });
    expect(validateScoreCache(cache, { questions: ["q"], pairIndex: [[2, 4]] })).toEqual([0.125, 0.75]);
    expect(decodeFloat32Scores(cache.scores, 2)).toEqual([0.125, 0.75]);
    expect(cache.scoresSha256).toBe(sha256(Buffer.from(cache.scores, "base64")));
  });

  it("21. refuses clause-set and model drift", () => {
    const cache = createScoreCache({ questions: ["q"], pairIndex: [[0]], scores: [0.5], environment });
    expect(() => validateScoreCache({ ...cache, clauseSetSha256: "f".repeat(64) })).toThrow(/clause-set/);
    expect(() => validateScoreCache({ ...cache, model: { ...RERANK_MODEL, dtype: "fp32" } })).toThrow(/model/);
  });

  it("22. freezes query, pair-index, and contiguous 16-plus-remainder batch order", async () => {
    const inputs = loadRefereeInputs();
    const dataset = buildRefereeDataset(inputs);
    expect(dataset.questions).toEqual([...new Set(dataset.allRows.map((row) => row.question))]);
    expect(dataset.questions).toHaveLength(563);
    const clauses = clausesFixture().clauses;
    const representativeQuestions = [
      inputs.compiled.cases[0].question,
      inputs.compiled.extendedCases[0].question,
      inputs.skills[0].question,
      inputs.holdout[0].question,
      inputs.original.positiveCases[0].question,
      inputs.blind.positiveCases[0].question,
    ];
    for (const question of representativeQuestions) {
      const base = candidateUnionFixture(question);
      const indexes = pairIndexForBase(base, clauses);
      expect(indexes).toEqual(indexes.slice().sort((left, right) => left - right));
      const baseIds = new Set(base.map((hit) => hit.id));
      expect(indexes).toEqual(clauses.flatMap((clause, index) => baseIds.has(clause.entryId) ? [index] : []));
    }

    const clauseEntryIds = [...new Set(clauses.map((clause) => clause.entryId))];
    const sparseIds = new Set(clauseEntryIds.filter((_, index) => index % 3 === 0));
    const reversedSparseBase = [...sparseIds].reverse().map((id) => ({ id }));
    const sparseIndexes = pairIndexForBase(reversedSparseBase, clauses);
    expect(sparseIndexes.length).toBeGreaterThan(0);
    expect(sparseIndexes.length).toBeLessThan(clauses.length);
    expect(sparseIndexes).toEqual(
      clauses.flatMap((clause, index) => sparseIds.has(clause.entryId) ? [index] : []),
    );

    const batches = [];
    const tokenizer = (queries, options) => {
      batches.push({ queries: queries.slice(), clauses: options.text_pair.slice() });
      return { queries };
    };
    const model = async (inputs) => ({ logits: inputs.queries.map((query) => [Number(query.slice(1)) / 10 - 1]) });
    await scorePairsWithReranker({ tokenizer, model }, Array.from({ length: 17 }, (_, index) => `q${index}`), Array.from({ length: 17 }, (_, index) => `d${index}`));
    expect(batches.map((batch) => batch.queries.length)).toEqual([16, 1]);
    expect(batches.flatMap((batch) => batch.queries)).toEqual(Array.from({ length: 17 }, (_, index) => `q${index}`));
  }, 30_000);

  it("23. derives readings from planted cache scores and changed pair indexes without a model call", () => {
    const questions = ["synthetic query"];
    const bases = [[{ id: "a", score: 10, tier: "gated" }, { id: "b", score: 9, tier: "gated" }]];
    const clauses = [
      { entryId: "a", role: "positive" },
      { entryId: "a", role: "positive" },
      { entryId: "b", role: "positive" },
    ];
    const firstIndex = [[0, 1]];
    const first = createScoreCache({ questions, pairIndex: firstIndex, scores: [0.1, 0.9], environment });
    const firstPrepared = prepareReadingsFromCache({ cache: first, questions, pairIndex: firstIndex, bases, clauses });
    expect(applyRerankHysteresis(bases[0], firstPrepared.get(questions[0]).fits, 0).map((hit) => hit.id)).toEqual(["a", "b"]);

    const plantedIndex = [[0, 2]];
    const planted = createScoreCache({ questions, pairIndex: plantedIndex, scores: [0.1, 0.9], environment });
    const plantedPrepared = prepareReadingsFromCache({ cache: planted, questions, pairIndex: plantedIndex, bases, clauses });
    expect(applyRerankHysteresis(bases[0], plantedPrepared.get(questions[0]).fits, 0).map((hit) => hit.id)).toEqual(["b", "a"]);
  });

  it("24. treats a different pairIndex order as a different cache record", () => {
    const first = createScoreCache({ questions: ["q"], pairIndex: [[0, 1]], scores: [0.2, 0.8], environment });
    const reordered = createScoreCache({ questions: ["q"], pairIndex: [[1, 0]], scores: [0.2, 0.8], environment });
    expect(first.scores).toBe(reordered.scores);
    expect(scoreCacheRecordSha256(first)).not.toBe(scoreCacheRecordSha256(reordered));
    expect(() => validateScoreCache(reordered, { questions: ["q"], pairIndex: [[0, 1]] })).toThrow(/pair-index order/);
  });

  it("25. fails when no grid reading passes", () => {
    expect(shouldFail({ readings: [
      { role: "identity", acceptance: { pass: true } },
      { role: "grid", acceptance: { pass: false } },
    ] })).toBe(true);
  });
});
