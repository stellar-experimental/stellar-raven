#!/usr/bin/env node
/**
 * Grade the frozen protocol-history v2 sets without merging them into routing lanes.
 * Required cases need scout.searchResearch in the top five. Forbidden cases exclude it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(EVAL_DIR, "results");
const TARGET = "scout.searchResearch";
const inputs = [
  {
    path: join(EVAL_DIR, "protocol-history-cases-v2.json"),
    contract: "protocol-history-routing-v2",
  },
  {
    path: join(EVAL_DIR, "protocol-history-blind-cases-v2.json"),
    contract: "protocol-history-blind-v2",
  },
];

const catalog = loadManifest(
  JSON.parse(readFileSync(join(EVAL_DIR, "..", "catalog", "manifest.json"), "utf8"))
);

function validateRoleCases(path, cases, role, seen) {
  if (!Array.isArray(cases)) {
    throw new Error(`${path} ${role}Cases must be an array`);
  }
  return cases.map((testCase) => {
    if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
      throw new Error(`${path} ${role}Cases must contain objects`);
    }
    if (typeof testCase.id !== "string" || testCase.id.length === 0) {
      throw new Error(`${path} ${role} case must have a non-empty id`);
    }
    if (typeof testCase.question !== "string" || testCase.question.length === 0) {
      throw new Error(`${path} ${testCase.id} must have a non-empty question`);
    }
    if (typeof testCase.class !== "string" || testCase.class.length === 0) {
      throw new Error(`${path} ${testCase.id} must have a non-empty class`);
    }
    if (seen.has(testCase.id)) throw new Error(`${path} repeats id ${testCase.id}`);
    seen.add(testCase.id);
    return testCase;
  });
}

function runSet({ path, contract }) {
  const diagnostic = JSON.parse(readFileSync(path, "utf8"));
  if (diagnostic.frozen !== true || diagnostic.contract !== contract) {
    throw new Error(`${path} must declare frozen ${contract}`);
  }
  if (diagnostic.version !== 2 || diagnostic.authoredAt !== "2026-09-03") {
    throw new Error(`${path} must declare the approved v2 contract metadata`);
  }
  if (diagnostic.targetOperation !== TARGET) {
    throw new Error(`${path} target must be ${TARGET}`);
  }
  const seen = new Set();
  const runCases = (cases, role) => validateRoleCases(path, cases, role, seen).map((testCase) => {
    const hits = searchCatalog(catalog, { query: testCase.question, limit: 5 });
    const index = hits.findIndex((hit) => hit.id === TARGET);
    return {
      id: testCase.id,
      class: testCase.class,
      role,
      targetRank: index === -1 ? null : index + 1,
      topHits: hits.map(({ id, score, tier }) => ({ id, score, tier }))
    };
  });
  const cases = [
    ...runCases(diagnostic.requiredCases, "required"),
    ...runCases(diagnostic.forbiddenCases, "forbidden"),
    ...runCases(diagnostic.neutralCases, "neutral"),
  ];
  const required = cases.filter((testCase) => testCase.role === "required");
  const forbidden = cases.filter((testCase) => testCase.role === "forbidden");
  const neutral = cases.filter((testCase) => testCase.role === "neutral");
  const requiredTop5 = required.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5
  ).length;
  const forbiddenTop5Captures = forbidden.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5
  ).length;
  const neutralTop5Captures = neutral.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5
  ).length;
  return {
    contract: diagnostic.contract,
    targetOperation: TARGET,
    required: required.length,
    requiredTop5,
    forbidden: forbidden.length,
    forbiddenTop5Captures,
    neutral: neutral.length,
    neutralTop5Captures,
    pass: requiredTop5 === required.length && forbiddenTop5Captures === 0,
    cases,
  };
}

const sets = inputs.map(runSet);
for (const set of sets) {
  console.log(
    `${set.contract}: required ${set.requiredTop5}/${set.required} top-five; ` +
      `forbidden captures ${set.forbiddenTop5Captures}/${set.forbidden}; ` +
      `neutral captures ${set.neutralTop5Captures}/${set.neutral}; ` +
      `${set.pass ? "PASS" : "FAIL"}`
  );
  console.table(
    set.cases.map((testCase) => ({
      id: testCase.id,
      role: testCase.role,
      targetRank: testCase.targetRank ?? "miss",
      top: testCase.topHits[0]?.id ?? "none"
    }))
  );
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
mkdirSync(RESULTS_DIR, { recursive: true });
const outputPath = join(RESULTS_DIR, `protocol-history-${stamp}.json`);
writeFileSync(
  outputPath,
  `${JSON.stringify({ ranAt: new Date().toISOString(), sets }, null, 2)}\n`
);
console.log(`results -> ${outputPath}`);

if (sets.some((set) => !set.pass)) process.exitCode = 1;
