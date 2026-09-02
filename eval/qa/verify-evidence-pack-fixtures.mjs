#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  beansSourceBasisFixture,
  indexerSourceBasisFixture,
  largeTranscriptCorrectControls
} from "../../test/fixtures/evidence-pack.mjs";
import {
  buildTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  PACK_VERSION
} from "./evidence-pack.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SAVED_RUN_REVISION = "70726884a723786c669283953f576277ce9d955b";
const GIT_MAX_BUFFER = 16 * 1024 * 1024;
const PORTFOLIO_RESULTS_FILES = [
  "eval/qa/results/2026-08-14T03-56-23-variantA.json",
  "eval/qa/results/2026-08-14T04-13-13-variantA.json",
  "eval/qa/results/2026-08-14T04-16-32-variantA.json"
];
const RAW_EXTRACTION_CONTROLS = [
  {
    id: "q-infra-horizon-vs-rpc",
    tags: { freshness: "live" },
    provenance: {
      rawTranscriptControl: true,
      resultsFile: "eval/qa/results/2026-08-14T03-56-23-variantA.json",
      resultsFileSha256: "93347cdaabb3b8e96d3598139ae56b42587bac30e5f94d3717b0b0b7fe0ba936",
      transcriptSha256: "fc900dce3bb04c998f902b584471372e69a1f8fde37ed7104cb4bff4f5f6b0ab",
      historicalGoldenSha256: "6ad083b22bb08c81e02897a5c4b2f53aff687d247d3c8de13e6d95dd5343f771",
      savedRowRequiredPackTerms: ["JSON-RPC 2.0"]
    }
  },
  {
    id: "q-scf-ecosystem-listing-partner-jobs",
    tags: { freshness: "live" },
    provenance: {
      rawTranscriptControl: true,
      resultsFile: "eval/qa/results/2026-08-14T03-56-23-variantA.json",
      resultsFileSha256: "93347cdaabb3b8e96d3598139ae56b42587bac30e5f94d3717b0b0b7fe0ba936",
      transcriptSha256: "4631b950b5f572db099bc55280795e0b5bbeabb894f458787fd83ca976b4cf0c",
      historicalGoldenSha256: "29cbd01cdc3b90127b74a8d37f556a9212d9735149b2a5869109fca1878a43fb",
      savedRowRequiredPackTerms: ["Details are coming soon."]
    }
  }
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fixtureProjection(fixture) {
  return {
    candidateAnswer: fixture.candidateAnswer,
    golden: fixture.golden,
    transcriptProjection: fixture.provenance.transcriptProjection
  };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function projectionFailures({ fixture, row, historicalCase }) {
  const failures = [];
  if (fixture.candidateAnswer !== row.answer) failures.push("candidate answer mismatch");
  if (!sameJson(fixture.golden, historicalCase.golden)) failures.push("golden mismatch");
  if (fixture.question !== historicalCase.question) failures.push("question mismatch");
  if (!sameJson(fixture.tags, row.tags)) failures.push("tags mismatch");

  const fixtureEntries = fixture.transcript;
  const projectedEntries = fixture.provenance.transcriptProjection;
  if (fixtureEntries.length !== projectedEntries.length) failures.push("fixture entry count mismatch");
  for (const [fixtureEntryIndex, projection] of projectedEntries.entries()) {
    const savedEntry = row.transcript[projection.savedEntryIndex];
    const fixtureEntry = fixtureEntries[fixtureEntryIndex];
    if (!savedEntry) {
      failures.push(`saved transcript entry ${projection.savedEntryIndex} is missing`);
      continue;
    }
    for (const field of ["tool", "resultChars", "isError"]) {
      if (savedEntry[field] !== projection[field]) failures.push(`saved ${field} mismatch at entry ${projection.savedEntryIndex}`);
      if (fixtureEntry?.[field] !== projection[field]) failures.push(`fixture ${field} mismatch at entry ${fixtureEntryIndex}`);
    }
    const savedResult = String(savedEntry.result ?? "");
    const fixtureResult = String(fixtureEntry?.result ?? "");
    if (savedResult.includes("--- SOURCE BASIS ---") !== projection.truncated) {
      failures.push(`saved truncation mismatch at entry ${projection.savedEntryIndex}`);
    }
    if (fixtureResult.includes("--- SOURCE BASIS ---") !== projection.truncated) {
      failures.push(`fixture truncation mismatch at entry ${fixtureEntryIndex}`);
    }
    if (projection.literalResult !== undefined && projection.literalResult !== savedResult) {
      failures.push(`saved literal result mismatch at entry ${projection.savedEntryIndex}`);
    }
    for (const record of projection.records) {
      const serialized = JSON.stringify(record);
      if (!savedResult.includes(serialized)) {
        failures.push(`saved transcript entry ${projection.savedEntryIndex} is missing a selected record`);
      }
      if (!fixtureResult.includes(serialized)) {
        failures.push(`fixture transcript entry ${fixtureEntryIndex} is missing a selected record`);
      }
    }
  }
  return failures;
}

export function findStoredP3PackHashFailure({ row, p3Pack }) {
  return sha256(p3Pack) === row.evidencePack?.sha256
    ? null
    : `${row.id}: rebuilt p3 pack SHA-256 mismatch`;
}

function corpusCases(value) {
  return Array.isArray(value) ? value : value.cases;
}

function gitShow(repoRoot, path) {
  return execFileSync("git", ["show", `${SAVED_RUN_REVISION}:${path}`], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: GIT_MAX_BUFFER
  });
}

function casesPathAtSavedRevision(configured) {
  if (!isAbsolute(configured)) return configured;
  const marker = "/eval/qa/";
  const markerAt = configured.indexOf(marker);
  if (markerAt < 0) throw new Error(`cannot map historical cases path ${configured}`);
  return configured.slice(markerAt + 1);
}

export function supportedExactTermOmissions({
  transcript,
  transcriptEvidence,
  candidateAnswer
}) {
  if (typeof transcriptEvidence !== "string") {
    throw new TypeError("pack text must be a string; stored evidencePack metadata is not pack text");
  }
  return findTranscriptEvidencePackOmissions({
    transcript,
    transcriptEvidence,
    claims: [candidateAnswer]
  }).omittedTerms;
}

export function requiredPackTermExactSupport({
  transcript,
  transcriptEvidence,
  requiredPackTerms
}) {
  return requiredPackTerms.map((term) => {
    const diagnostic = findTranscriptEvidencePackOmissions({
      transcript,
      transcriptEvidence,
      claims: [`\`${term}\``]
    });
    return {
      term,
      checkedTerms: diagnostic.checkedTerms,
      transcriptSupportedTerms: diagnostic.transcriptSupportedTerms,
      omittedTerms: diagnostic.omittedTerms,
      supported:
        diagnostic.checkedTerms === 1 &&
        diagnostic.transcriptSupportedTerms === 1 &&
        diagnostic.omittedTerms.length === 0
    };
  });
}

export async function verifyEvidencePackFixtureProvenance({
  repoRoot = REPO_ROOT,
  requireSaved = false
} = {}) {
  const fixtures = [
    beansSourceBasisFixture,
    indexerSourceBasisFixture,
    ...RAW_EXTRACTION_CONTROLS,
    ...largeTranscriptCorrectControls
  ];
  const failures = fixtures.flatMap((fixture) => {
    if (fixture.provenance.rawTranscriptControl) return [];
    if (!fixture.provenance.transcriptProjection) {
      return fixture.provenance.savedEntryProjection?.length
        ? []
        : [`${fixture.id}: committed saved-entry projection is missing`];
    }
    const actual = sha256(JSON.stringify(fixtureProjection(fixture)));
    return actual === fixture.provenance.projectionSha256
      ? []
      : [`${fixture.id}: committed fixture projection SHA-256 mismatch`];
  });
  const available = fixtures.filter((fixture) =>
    existsSync(resolve(repoRoot, fixture.provenance.resultsFile))
  );
  const missing = fixtures.filter((fixture) =>
    !existsSync(resolve(repoRoot, fixture.provenance.resultsFile))
  );
  if (requireSaved && missing.length) {
    for (const fixture of missing) {
      failures.push(`${fixture.id}: saved result artifact is missing`);
    }
    return {
      skipped: false,
      checkedFixtures: fixtures.length,
      checkedRows: 0,
      failures,
      rows: []
    };
  }
  if (!available.length) {
    return {
      skipped: true,
      checkedFixtures: fixtures.length,
      checkedRows: 0,
      failures,
      rows: []
    };
  }

  const historicalSource = gitShow(repoRoot, "eval/qa/evidence-pack.mjs");
  const historicalModule = await import(
    `data:text/javascript;base64,${Buffer.from(historicalSource).toString("base64")}`
  );

  const artifacts = new Map();
  const rows = [];
  for (const fixture of available) {
    const resultsPath = resolve(repoRoot, fixture.provenance.resultsFile);
    let cached = artifacts.get(resultsPath);
    if (!cached) {
      const raw = readFileSync(resultsPath, "utf8");
      const results = JSON.parse(raw);
      const historicalCasesPath = casesPathAtSavedRevision(results.meta.casesPath);
      cached = {
        results,
        resultsSha256: sha256(raw),
        historicalCases: new Map(
          corpusCases(JSON.parse(gitShow(repoRoot, historicalCasesPath))).map((kase) => [kase.id, kase])
        )
      };
      artifacts.set(resultsPath, cached);
    }

    const row = cached.results.rows.find((candidate) => candidate.id === fixture.id);
    const historicalCase = cached.historicalCases.get(fixture.id);
    if (!row || !historicalCase) {
      failures.push(`${fixture.id}: saved row or matching corpus case is missing`);
      continue;
    }

    const transcriptSha256 = sha256(JSON.stringify(row.transcript));
    const historicalGoldenSha256 = sha256(JSON.stringify(historicalCase.golden));
    const historicalInput = {
      ...historicalCase,
      candidateAnswer: row.answer,
      transcript: row.transcript
    };
    const pack = buildTranscriptEvidencePack(historicalInput);
    const requiredPackTerms = fixture.provenance.savedRowRequiredPackTerms ?? [];
    const missingPackTerms = requiredPackTerms.filter(
      (term) => !pack.toLowerCase().includes(term.toLowerCase())
    );
    const requiredTermSupportChecks = [
      beansSourceBasisFixture.id,
      indexerSourceBasisFixture.id
    ].includes(fixture.id)
      ? requiredPackTermExactSupport({
        transcript: row.transcript,
        transcriptEvidence: pack,
        requiredPackTerms
      })
      : [];
    const unsupportedRequiredTerms = requiredTermSupportChecks.filter(
      (check) => !check.supported
    );
    const fixtureProjectionFailures = fixture.provenance.rawTranscriptControl
      ? historicalGoldenSha256 === fixture.provenance.historicalGoldenSha256
        ? []
        : ["historical golden SHA-256 mismatch"]
      : projectionFailures({ fixture, row, historicalCase });
    const p3Pack = historicalModule.buildTranscriptEvidencePack(historicalInput);
    const rebuiltP3PackSha256 = sha256(p3Pack);
    const p3Omissions = supportedExactTermOmissions({
      transcript: row.transcript,
      transcriptEvidence: p3Pack,
      candidateAnswer: row.answer
    });
    const currentOmissions = supportedExactTermOmissions({
      transcript: row.transcript,
      transcriptEvidence: pack,
      candidateAnswer: row.answer
    });

    if (cached.resultsSha256 !== fixture.provenance.resultsFileSha256) {
      failures.push(`${fixture.id}: results file SHA-256 mismatch`);
    }
    if (transcriptSha256 !== fixture.provenance.transcriptSha256) {
      failures.push(`${fixture.id}: transcript SHA-256 mismatch`);
    }
    for (const failure of fixtureProjectionFailures) failures.push(`${fixture.id}: ${failure}`);
    const p3HashFailure = findStoredP3PackHashFailure({ row, p3Pack });
    if (p3HashFailure) failures.push(p3HashFailure);
    if (row.tags?.freshness !== fixture.tags.freshness) {
      failures.push(
        `${fixture.id}: freshness ${JSON.stringify(row.tags?.freshness)} != ${JSON.stringify(fixture.tags.freshness)}`
      );
    }
    if (fixture.provenance.storedVerdict && row.verdict?.score !== fixture.provenance.storedVerdict) {
      failures.push(
        `${fixture.id}: stored verdict ${JSON.stringify(row.verdict?.score)} != ${JSON.stringify(fixture.provenance.storedVerdict)}`
      );
    }
    if (fixture.provenance.storedVerdict === "correct" && currentOmissions.length > p3Omissions.length) {
      failures.push(
        `${fixture.id}: supported exact-term omissions regressed ${p3Omissions.length}->${currentOmissions.length}`
      );
    }
    if (
      fixture.id === beansSourceBasisFixture.id &&
      currentOmissions.length >= p3Omissions.length
    ) {
      failures.push(
        `${fixture.id}: target omissions did not improve ${p3Omissions.length}->${currentOmissions.length}`
      );
    }
    for (const term of missingPackTerms) failures.push(`${fixture.id}: pack missing ${term}`);
    for (const check of unsupportedRequiredTerms) {
      failures.push(
        `${fixture.id}: required term ${JSON.stringify(check.term)} lacks exact transcript-to-pack support`
      );
    }
    rows.push({
      id: fixture.id,
      packChars: pack.length,
      packSha256: sha256(pack),
      storedP3PackSha256: row.evidencePack?.sha256 ?? null,
      rebuiltP3PackSha256,
      projectionVerified: fixtureProjectionFailures.length === 0,
      requiredTermsPresent:
        requiredPackTerms.length - missingPackTerms.length,
      requiredTermsTotal: requiredPackTerms.length,
      requiredTermsExactSupported:
        requiredTermSupportChecks.length - unsupportedRequiredTerms.length,
      requiredTermsExactSupportTotal: requiredTermSupportChecks.length,
      p3Omissions,
      currentOmissions
    });
  }
  return {
    skipped: false,
    checkedFixtures: fixtures.length,
    checkedRows: rows.length,
    failures,
    rows
  };
}

export async function auditEvidencePackPortfolio({ repoRoot = REPO_ROOT } = {}) {
  const available = PORTFOLIO_RESULTS_FILES.filter((path) => existsSync(resolve(repoRoot, path)));
  if (!available.length) return { skipped: true, failures: [] };

  const historicalSource = gitShow(repoRoot, "eval/qa/evidence-pack.mjs");
  const historicalModule = await import(
    `data:text/javascript;base64,${Buffer.from(historicalSource).toString("base64")}`
  );
  const report = {
    skipped: false,
    resultRows: 0,
    packEligibleRows: 0,
    allRowsWithSourceBasis: 0,
    packEligibleSourceBasisRows: 0,
    p3Chars: 0,
    currentPackChars: 0,
    currentPackVersion: PACK_VERSION,
    transcriptSupportedExactTerms: 0,
    p3Omissions: 0,
    currentPackOmissions: 0,
    improvedRows: 0,
    tiedRows: 0,
    worsenedRows: [],
    failures: []
  };

  for (const relativeResultsPath of available) {
    const resultsPath = resolve(repoRoot, relativeResultsPath);
    const results = JSON.parse(readFileSync(resultsPath, "utf8"));
    const configuredCasesPath = results.meta?.casesPath;
    if (!configuredCasesPath) {
      report.failures.push(`${relativeResultsPath}: missing meta.casesPath`);
      continue;
    }
    const historicalCasesPath = casesPathAtSavedRevision(configuredCasesPath);
    const historicalCases = new Map(
      corpusCases(JSON.parse(gitShow(repoRoot, historicalCasesPath))).map((kase) => [kase.id, kase])
    );
    report.resultRows += results.rows.length;

    for (const row of results.rows) {
      const historicalCase = historicalCases.get(row.id);
      if (!historicalCase) {
        report.failures.push(`${row.id}: historical corpus case is missing`);
        continue;
      }
      const input = {
        ...historicalCase,
        candidateAnswer: row.answer,
        transcript: row.transcript
      };
      const p3Pack = historicalModule.buildTranscriptEvidencePack(input);
      const currentPack = buildTranscriptEvidencePack(input);
      const hasSourceBasis = row.transcript.some((entry) =>
        String(entry.result ?? "").includes("--- SOURCE BASIS ---")
      );
      if (hasSourceBasis) report.allRowsWithSourceBasis += 1;
      if (!p3Pack && !currentPack) continue;

      report.packEligibleRows += 1;
      if (hasSourceBasis) report.packEligibleSourceBasisRows += 1;
      report.p3Chars += p3Pack.length;
      report.currentPackChars += currentPack.length;
      const p3HashFailure = findStoredP3PackHashFailure({ row, p3Pack });
      if (p3HashFailure) report.failures.push(p3HashFailure);
      const p3Diagnostic = findTranscriptEvidencePackOmissions({
        transcript: row.transcript,
        transcriptEvidence: p3Pack,
        claims: [row.answer]
      });
      const currentPackDiagnostic = findTranscriptEvidencePackOmissions({
        transcript: row.transcript,
        transcriptEvidence: currentPack,
        claims: [row.answer]
      });
      report.transcriptSupportedExactTerms += currentPackDiagnostic.transcriptSupportedTerms;
      report.p3Omissions += p3Diagnostic.omittedTerms.length;
      report.currentPackOmissions += currentPackDiagnostic.omittedTerms.length;
      if (currentPackDiagnostic.omittedTerms.length < p3Diagnostic.omittedTerms.length) {
        report.improvedRows += 1;
      } else if (currentPackDiagnostic.omittedTerms.length === p3Diagnostic.omittedTerms.length) {
        report.tiedRows += 1;
      } else {
        report.worsenedRows.push({
          id: row.id,
          p3Omissions: p3Diagnostic.omittedTerms.length,
          currentPackOmissions: currentPackDiagnostic.omittedTerms.length
        });
      }
    }
  }

  report.p3MeanPackChars = report.packEligibleRows ? report.p3Chars / report.packEligibleRows : 0;
  report.currentPackMeanChars = report.packEligibleRows ? report.currentPackChars / report.packEligibleRows : 0;
  return report;
}

export function formatEvidencePackPortfolioSummary(portfolio) {
  return `portfolio: rows=${portfolio.resultRows} eligible=${portfolio.packEligibleRows} allRowsWithSourceBasis=${portfolio.allRowsWithSourceBasis} packEligibleSourceBasisRows=${portfolio.packEligibleSourceBasisRows} p3Mean=${portfolio.p3MeanPackChars.toFixed(2)} currentPack=${portfolio.currentPackVersion} currentMean=${portfolio.currentPackMeanChars.toFixed(2)} supportedTerms=${portfolio.transcriptSupportedExactTerms} omissions=${portfolio.p3Omissions}->${portfolio.currentPackOmissions} improved=${portfolio.improvedRows} tied=${portfolio.tiedRows} worsened=${portfolio.worsenedRows.length}`;
}

async function main() {
  const report = await verifyEvidencePackFixtureProvenance({ requireSaved: true });
  if (report.skipped) {
    for (const failure of report.failures) console.error(`FAIL ${failure}`);
    if (report.failures.length) process.exitCode = 1;
    console.log("evidence-pack fixture provenance: SKIP (no ignored result artifacts found)");
    return;
  }
  for (const row of report.rows) {
    const exactSupport = row.requiredTermsExactSupportTotal
      ? ` exactSupport=${row.requiredTermsExactSupported}/${row.requiredTermsExactSupportTotal}`
      : "";
    console.log(
      `${row.id}: pack=${row.packChars}/${row.packSha256} terms=${row.requiredTermsPresent}/${row.requiredTermsTotal}${exactSupport} projection=${row.projectionVerified ? "verified" : "failed"} omissions=${row.p3Omissions.length}->${row.currentOmissions.length} storedP3=${row.storedP3PackSha256} rebuiltP3=${row.rebuiltP3PackSha256}`
    );
  }
  if (report.failures.length) {
    for (const failure of report.failures) console.error(`FAIL ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(`evidence-pack fixture provenance: PASS (${report.checkedRows} saved rows)`);
  if (process.argv.includes("--portfolio")) {
    const portfolio = await auditEvidencePackPortfolio();
    if (portfolio.skipped) {
      console.log("evidence-pack portfolio: SKIP (no ignored result artifacts found)");
      return;
    }
    console.log(formatEvidencePackPortfolioSummary(portfolio));
    for (const row of portfolio.worsenedRows) {
      console.log(`portfolio worsened ${row.id}: ${row.p3Omissions}->${row.currentPackOmissions}`);
    }
    if (portfolio.failures.length) {
      for (const failure of portfolio.failures) console.error(`FAIL ${failure}`);
      process.exitCode = 1;
    } else {
      console.log("evidence-pack portfolio: PASS (all rebuilt p3 hashes match stored metadata)");
    }
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
