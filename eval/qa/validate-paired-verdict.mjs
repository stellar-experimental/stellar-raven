#!/usr/bin/env node
/** Deterministic operating-characteristic simulation for qa-paired-ordinal-ni-v1. */
import { pathToFileURL } from "node:url";
import {
  NON_INFERIORITY_MARGIN,
  statisticalDecision
} from "./paired-verdict.mjs";

export const SIMULATION_SEED = 0x5eed1234;
export const SIMULATION_ITERATIONS = 100_000;
export const SIMULATION_IDS = 100;
export const MARGIN_SEARCH_ITERATIONS = 20_000;
export const MARGIN_CANDIDATES = [0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08];
export const DISCORDANCE_CANDIDATES = [0.08, 0.10, 0.15, 0.20, 0.30, 0.40];
export const CALIBRATED_STRICT_DISCORDANCE = 0.10;
export const CALIBRATED_NON_WRONG_DISCORDANCE = 0.08;

function randomGenerator(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 2 ** 32;
  };
}

function draw(probabilities, random) {
  let value = random();
  for (const entry of probabilities) {
    value -= entry.probability;
    if (value <= 0) return entry.delta;
  }
  return probabilities.at(-1).delta;
}

function decide(caseDeltas, margin) {
  return statisticalDecision(caseDeltas, { margin }).verdict;
}

function simulateScenario({ probabilities, iterations, ids, seed, margin = NON_INFERIORITY_MARGIN }) {
  const random = randomGenerator(seed);
  const counts = { PASS: 0, FAIL: 0, INDETERMINATE: 0, repeated: 0 };
  for (let iteration = 0; iteration < iterations; iteration++) {
    const initial = Array.from({ length: ids }, () => draw(probabilities, random));
    let verdict = decide(initial, margin);
    if (verdict === "INDETERMINATE") {
      counts.repeated += 1;
      const repeat = Array.from({ length: ids }, () => draw(probabilities, random));
      const combined = initial.map((delta, index) => [
        (delta[0] + repeat[index][0]) / 2,
        (delta[1] + repeat[index][1]) / 2
      ]);
      verdict = decide(combined, margin);
    }
    counts[verdict] += 1;
  }
  return Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, Number((value / iterations).toFixed(6))])
  );
}

function adjacentScenario({ strictDelta = 0, nonWrongDelta = 0 }) {
  const strictUp = (CALIBRATED_STRICT_DISCORDANCE + strictDelta) / 2;
  const strictDown = (CALIBRATED_STRICT_DISCORDANCE - strictDelta) / 2;
  const nonWrongUp = (CALIBRATED_NON_WRONG_DISCORDANCE + nonWrongDelta) / 2;
  const nonWrongDown = (CALIBRATED_NON_WRONG_DISCORDANCE - nonWrongDelta) / 2;
  return [
    {
      delta: [0, 0],
      probability: 1 - CALIBRATED_STRICT_DISCORDANCE - CALIBRATED_NON_WRONG_DISCORDANCE
    },
    { delta: [1, 0], probability: strictUp },
    { delta: [-1, 0], probability: strictDown },
    { delta: [0, 1], probability: nonWrongUp },
    { delta: [0, -1], probability: nonWrongDown }
  ];
}

export function runPairedVerdictValidation({
  iterations = SIMULATION_ITERATIONS,
  ids = SIMULATION_IDS,
  seed = SIMULATION_SEED
} = {}) {
  const scenarios = {
    noChange: adjacentScenario({}),
    falsePassBoundary: adjacentScenario({ strictDelta: -NON_INFERIORITY_MARGIN }),
    falseFailBoundary: adjacentScenario({
      strictDelta: -NON_INFERIORITY_MARGIN,
      nonWrongDelta: -NON_INFERIORITY_MARGIN
    }),
    materialRegression: [
      { delta: [0, 0], probability: 0.68 },
      { delta: [-1, 0], probability: 0.16 },
      { delta: [0, -1], probability: 0.16 }
    ]
  };
  const results = Object.fromEntries(
    Object.entries(scenarios).map(([name, probabilities], index) => [
      name,
      simulateScenario({ probabilities, iterations, ids, seed: seed + index })
    ])
  );
  const marginSearch = Object.fromEntries(
    MARGIN_CANDIDATES.map((margin, index) => [
      margin.toFixed(3),
      simulateScenario({
        probabilities: scenarios.noChange,
        iterations: MARGIN_SEARCH_ITERATIONS,
        ids,
        seed: seed + 100 + index,
        margin
      }).PASS
    ])
  );
  const discordanceSearch = {
    falsePass: Object.fromEntries(
      DISCORDANCE_CANDIDATES.map((discordance, index) => [
        discordance.toFixed(2),
        simulateScenario({
          probabilities: [
            {
              delta: [0, 0],
              probability: 1 - discordance - CALIBRATED_NON_WRONG_DISCORDANCE
            },
            { delta: [1, 0], probability: (discordance - NON_INFERIORITY_MARGIN) / 2 },
            { delta: [-1, 0], probability: (discordance + NON_INFERIORITY_MARGIN) / 2 },
            { delta: [0, 1], probability: CALIBRATED_NON_WRONG_DISCORDANCE / 2 },
            { delta: [0, -1], probability: CALIBRATED_NON_WRONG_DISCORDANCE / 2 }
          ],
          iterations: MARGIN_SEARCH_ITERATIONS,
          ids,
          seed: seed + 200 + index
        }).PASS
      ])
    ),
    falseFail: Object.fromEntries(
      DISCORDANCE_CANDIDATES.map((discordance, index) => [
        discordance.toFixed(2),
        simulateScenario({
          probabilities: [
            { delta: [0, 0], probability: 1 - 2 * discordance },
            { delta: [1, 0], probability: (discordance - NON_INFERIORITY_MARGIN) / 2 },
            { delta: [-1, 0], probability: (discordance + NON_INFERIORITY_MARGIN) / 2 },
            { delta: [0, 1], probability: (discordance - NON_INFERIORITY_MARGIN) / 2 },
            { delta: [0, -1], probability: (discordance + NON_INFERIORITY_MARGIN) / 2 }
          ],
          iterations: MARGIN_SEARCH_ITERATIONS,
          ids,
          seed: seed + 300 + index
        }).FAIL
      ])
    )
  };
  const worstFalsePass = Math.max(...Object.values(discordanceSearch.falsePass));
  const worstFalseFail = Math.max(...Object.values(discordanceSearch.falseFail));
  const gates = {
    falsePassAtMargin: results.falsePassBoundary.PASS <= 0.05 && worstFalsePass <= 0.05,
    falseFailAtMargin: results.falseFailBoundary.FAIL <= 0.05 && worstFalseFail <= 0.05,
    nonInferiorityPower: results.noChange.PASS >= 0.80,
    materialRegressionPower: results.materialRegression.FAIL >= 0.90,
    smallestPoweredMargin:
      marginSearch[NON_INFERIORITY_MARGIN.toFixed(3)] >= 0.80 &&
      MARGIN_CANDIDATES
        .filter((margin) => margin < NON_INFERIORITY_MARGIN)
        .every((margin) => marginSearch[margin.toFixed(3)] < 0.80)
  };
  return {
    method: "qa-paired-ordinal-ni-v1",
    seed,
    iterations,
    ids,
    margin: NON_INFERIORITY_MARGIN,
    calibration: {
      strictCorrectDiscordance: CALIBRATED_STRICT_DISCORDANCE,
      nonWrongDiscordance: CALIBRATED_NON_WRONG_DISCORDANCE // gitleaks:allow — statistical rate
    },
    marginSearch: {
      iterations: MARGIN_SEARCH_ITERATIONS,
      noChangePassPower: marginSearch
    },
    discordanceSearch: {
      iterations: MARGIN_SEARCH_ITERATIONS,
      falsePassByStrictDiscordance: discordanceSearch.falsePass,
      falseFailByBothDiscordances: discordanceSearch.falseFail,
      worstFalsePass,
      worstFalseFail
    },
    results,
    gates,
    pass: Object.values(gates).every(Boolean)
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = runPairedVerdictValidation();
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exitCode = 1;
}
