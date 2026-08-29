#!/usr/bin/env node
/** Deterministic operating-characteristic simulation for qa-paired-ordinal-ni-v1. */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  LOOK_ALPHA,
  LOOK_Z,
  MINIMUM_ELIGIBLE_IDS,
  NO_CHANGE_CONFIDENCE_RADIUS,
  PAIRED_VERDICT_METHOD,
  calibrationFromPairedArtifacts,
  statisticalDecision
} from "./paired-verdict.mjs";

export const SIMULATION_SEED = 0x5eed1234;
export const SIMULATION_ITERATIONS = 100_000;
export const POWERED_N_CANDIDATES = [90, 100];
export const MARGIN_CANDIDATES = [0.05, 0.08, 0.10];
export const TRUE_LOSS_CANDIDATES = [0, 0.05, 0.08, 0.10, 0.12, 0.16];
export const MIXED_TUPLE_DISCORDANCE_UPPER_BOUND = Object.freeze({
  strictCorrect: 0.10,
  nonWrong: 0.08
});
export const MISSINGNESS_ASSUMPTIONS = Object.freeze({
  t4T5Rate: 0.03,
  candidateOnlyRate: 0.01,
  contentRate: 0.01
});

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

function adjacentScenario({ loss, strictDiscordance, nonWrongDiscordance }) {
  const strictRate = Math.max(strictDiscordance, loss);
  const nonWrongRate = Math.max(nonWrongDiscordance, loss);
  if (strictRate + nonWrongRate > 1) {
    throw new Error("the calibrated discordance rates cannot form an adjacent-move distribution");
  }
  return [
    { delta: [0, 0], probability: 1 - strictRate - nonWrongRate },
    { delta: [1, 0], probability: (strictRate - loss) / 2 },
    { delta: [-1, 0], probability: (strictRate + loss) / 2 },
    { delta: [0, 1], probability: (nonWrongRate - loss) / 2 },
    { delta: [0, -1], probability: (nonWrongRate + loss) / 2 }
  ];
}

function emptyVerdictCounts() {
  return { PASS: 0, FAIL: 0, INDETERMINATE: 0 };
}

function rates(counts, iterations) {
  return Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, Number((value / iterations).toFixed(6))])
  );
}

function averagePair(initial, repeat) {
  return initial.map((delta, index) => [
    (delta[0] + repeat[index][0]) / 2,
    (delta[1] + repeat[index][1]) / 2
  ]);
}

function simulateCompleteScenario({ probabilities, iterations, ids, seed, margins }) {
  const random = randomGenerator(seed);
  const byMargin = Object.fromEntries(
    margins.map((margin) => [
      margin.toFixed(2),
      { look1: emptyVerdictCounts(), twoLook: emptyVerdictCounts(), repeats: 0 }
    ])
  );
  for (let iteration = 0; iteration < iterations; iteration++) {
    const initial = Array.from({ length: ids }, () => draw(probabilities, random));
    const repeat = Array.from({ length: ids }, () => draw(probabilities, random));
    for (const margin of margins) {
      const accumulator = byMargin[margin.toFixed(2)];
      const first = statisticalDecision(initial, { margin });
      accumulator.look1[first.verdict] += 1;
      let final = first;
      if (first.code === "confidence-bounds-overlap") {
        accumulator.repeats += 1;
        final = statisticalDecision(averagePair(initial, repeat), { margin });
      }
      accumulator.twoLook[final.verdict] += 1;
    }
  }
  return Object.fromEntries(
    Object.entries(byMargin).map(([margin, result]) => [
      margin,
      {
        look1: rates(result.look1, iterations),
        twoLook: rates(result.twoLook, iterations),
        expectedSecondCollectionRate: Number((result.repeats / iterations).toFixed(6))
      }
    ])
  );
}

function drawMissingness(random) {
  const value = random();
  if (value < MISSINGNESS_ASSUMPTIONS.contentRate) return "content";
  if (value < MISSINGNESS_ASSUMPTIONS.contentRate + MISSINGNESS_ASSUMPTIONS.candidateOnlyRate) {
    return "candidate-only";
  }
  if (value < MISSINGNESS_ASSUMPTIONS.contentRate + MISSINGNESS_ASSUMPTIONS.t4T5Rate) {
    return "shared-T4-T5";
  }
  return null;
}

function missingnessStage(deltaLooks, missingnessLooks, margin) {
  let candidateOnly = false;
  let contentExcluded = 0;
  let t4T5Excluded = 0;
  const eligible = [];
  for (let id = 0; id < deltaLooks[0].length; id++) {
    const states = missingnessLooks.map((look) => look[id]);
    candidateOnly ||= states.includes("candidate-only");
    if (states.includes("content")) {
      contentExcluded += 1;
      continue;
    }
    if (states.some((state) => state === "candidate-only" || state === "shared-T4-T5")) {
      t4T5Excluded += 1;
      continue;
    }
    eligible.push([
      deltaLooks.reduce((sum, look) => sum + look[id][0], 0) / deltaLooks.length,
      deltaLooks.reduce((sum, look) => sum + look[id][1], 0) / deltaLooks.length
    ]);
  }
  const statistical = statisticalDecision(eligible, { margin });
  return {
    verdict: candidateOnly ? "INDETERMINATE" : statistical.verdict,
    code: candidateOnly ? "candidate-only-missingness" : statistical.code,
    eligible: eligible.length,
    contentExcluded,
    t4T5Excluded,
    candidateOnly
  };
}

function simulateMissingness({ probabilities, iterations, ids, seed, margin }) {
  const random = randomGenerator(seed);
  const look1 = emptyVerdictCounts();
  const twoLook = emptyVerdictCounts();
  let repeats = 0;
  let eligibleTotal = 0;
  let contentTotal = 0;
  let t4T5Total = 0;
  let candidateOnlyBlocks = 0;
  let belowPoweredN = 0;
  for (let iteration = 0; iteration < iterations; iteration++) {
    const initialDeltas = Array.from({ length: ids }, () => draw(probabilities, random));
    const initialMissingness = Array.from({ length: ids }, () => drawMissingness(random));
    const first = missingnessStage([initialDeltas], [initialMissingness], margin);
    look1[first.verdict] += 1;
    let final = first;
    if (first.code === "confidence-bounds-overlap") {
      repeats += 1;
      const repeatDeltas = Array.from({ length: ids }, () => draw(probabilities, random));
      const repeatMissingness = Array.from({ length: ids }, () => drawMissingness(random));
      final = missingnessStage(
        [initialDeltas, repeatDeltas],
        [initialMissingness, repeatMissingness],
        margin
      );
    }
    twoLook[final.verdict] += 1;
    eligibleTotal += final.eligible;
    contentTotal += final.contentExcluded;
    t4T5Total += final.t4T5Excluded;
    candidateOnlyBlocks += Number(final.candidateOnly);
    belowPoweredN += Number(final.code === "denominator-below-powered-n");
  }
  return {
    selectedIds: ids,
    assumptions: MISSINGNESS_ASSUMPTIONS,
    look1: rates(look1, iterations),
    twoLook: rates(twoLook, iterations),
    expectedSecondCollectionRate: Number((repeats / iterations).toFixed(6)),
    meanEligibleIds: Number((eligibleTotal / iterations).toFixed(3)),
    meanContentExclusions: Number((contentTotal / iterations).toFixed(3)),
    meanT4T5Exclusions: Number((t4T5Total / iterations).toFixed(3)),
    candidateOnlyBlockRate: Number((candidateOnlyBlocks / iterations).toFixed(6)),
    belowPoweredNRate: Number((belowPoweredN / iterations).toFixed(6))
  };
}

function labeled(row, calibrationLabel) {
  return { ...row, calibration: calibrationLabel };
}

export function runPairedVerdictValidation({
  iterations = SIMULATION_ITERATIONS,
  seed = SIMULATION_SEED,
  strictCorrectDiscordance = MIXED_TUPLE_DISCORDANCE_UPPER_BOUND.strictCorrect,
  nonWrongDiscordance = MIXED_TUPLE_DISCORDANCE_UPPER_BOUND.nonWrong,
  calibrationLabel = "mixed-tuple calibration"
} = {}) {
  const grid = {};
  for (const [nIndex, ids] of POWERED_N_CANDIDATES.entries()) {
    grid[ids] = {};
    for (const [lossIndex, loss] of TRUE_LOSS_CANDIDATES.entries()) {
      grid[ids][loss.toFixed(2)] = simulateCompleteScenario({
        probabilities: adjacentScenario({ loss, strictDiscordance: strictCorrectDiscordance, nonWrongDiscordance }),
        iterations,
        ids,
        seed: seed + nIndex * 100 + lossIndex,
        margins: MARGIN_CANDIDATES
      });
    }
  }

  const nTable = POWERED_N_CANDIDATES.map((ids) => labeled({
    eligibleIds: ids,
    margin: NO_CHANGE_CONFIDENCE_RADIUS,
    trueLoss: 0,
    ...grid[ids]["0.00"]["0.08"]
  }, calibrationLabel));
  const marginTable = MARGIN_CANDIDATES.map((margin) => {
    const noChange = grid[100]["0.00"][margin.toFixed(2)];
    const fivePointLoss = grid[100]["0.05"][margin.toFixed(2)];
    return labeled({
      margin,
      look1NoChangePass: noChange.look1.PASS,
      twoLookNoChangePass: noChange.twoLook.PASS,
      expectedSecondCollectionRate: noChange.expectedSecondCollectionRate,
      twoLookFalsePassAtFivePointLoss: fivePointLoss.twoLook.PASS
    }, calibrationLabel);
  });
  const lossTable = TRUE_LOSS_CANDIDATES.map((loss) => labeled({
    trueLoss: loss,
    margin: NO_CHANGE_CONFIDENCE_RADIUS,
    ...grid[100][loss.toFixed(2)]["0.08"]
  }, calibrationLabel));
  const missingness = labeled(
    simulateMissingness({
      probabilities: adjacentScenario({
        loss: 0,
        strictDiscordance: strictCorrectDiscordance,
        nonWrongDiscordance
      }),
      iterations,
      ids: 100,
      seed: seed + 1000,
      margin: NO_CHANGE_CONFIDENCE_RADIUS
    }),
    calibrationLabel
  );

  const noChange = grid[100]["0.00"]["0.08"];
  const lossEight = grid[100]["0.08"]["0.08"];
  const lossTwelve = grid[100]["0.12"]["0.08"];
  const gates = {
    noChangeFailControl:
      noChange.look1.FAIL <= 0.05 && noChange.twoLook.FAIL <= 0.05,
    noChangeTwoLookPassPower: noChange.twoLook.PASS >= 0.80,
    twelvePointFailPower: lossTwelve.twoLook.FAIL >= 0.80,
    falsePassAtEightPointLoss: lossEight.twoLook.PASS <= 0.05,
    poweredDenominator:
      grid[90]["0.00"]["0.08"].twoLook.INDETERMINATE === 1 &&
      MINIMUM_ELIGIBLE_IDS === 100,
    derivedLookZ: Math.abs(LOOK_Z - 2.45) < 0.001
  };
  return {
    method: PAIRED_VERDICT_METHOD,
    status: "experimental-indeterminate-first",
    seed,
    iterations,
    poweredN: MINIMUM_ELIGIBLE_IDS,
    noChangeConfidenceRadius: NO_CHANGE_CONFIDENCE_RADIUS,
    lookAlpha: LOOK_ALPHA,
    lookZ: LOOK_Z,
    calibration: {
      label: calibrationLabel,
      caveat: calibrationLabel === "mixed-tuple calibration"
        ? "The 2026-08-27 and 2026-08-28 artifacts use different judge-tier contracts. These rates are upper bounds, not operating noise."
        : "The rates come from the supplied same-tuple pinned pair.",
      strictCorrectDiscordance,
      nonWrongDiscordance // gitleaks:allow — a statistical discordance rate
    },
    tables: {
      poweredN: nTable,
      margins: marginTable,
      losses: lossTable,
      missingness
    },
    gates,
    pass: Object.values(gates).every(Boolean)
  };
}

function parseArgs(argv) {
  if (argv.length === 0) return { recalibrate: null };
  if (argv[0] === "--recalibrate" && argv.length === 3) {
    return { recalibrate: { baselinePath: argv[1], candidatePath: argv[2] } };
  }
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  throw new Error("usage: validate-paired-verdict.mjs [--recalibrate <baseline.json> <candidate.json>]");
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log("usage: validate-paired-verdict.mjs [--recalibrate <baseline.json> <candidate.json>]");
      return;
    }
    let options = {};
    let recalibration = null;
    if (args.recalibrate) {
      const baseline = JSON.parse(readFileSync(args.recalibrate.baselinePath, "utf8"));
      const candidate = JSON.parse(readFileSync(args.recalibrate.candidatePath, "utf8"));
      recalibration = calibrationFromPairedArtifacts(baseline, candidate);
      options = {
        strictCorrectDiscordance: recalibration.strictCorrectDiscordance,
        nonWrongDiscordance: recalibration.nonWrongDiscordance,
        calibrationLabel: "same-tuple pinned recalibration"
      };
    }
    const result = runPairedVerdictValidation(options);
    console.log(JSON.stringify({ ...result, ...(recalibration ? { recalibration } : {}) }, null, 2));
    if (!result.pass) process.exitCode = 1;
  } catch (error) {
    console.error(`paired-verdict validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
