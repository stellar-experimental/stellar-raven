#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { REVIEWED_ARTIFACT_SCHEMA, gradeResults } from "./contract.mjs";
import { DEFAULT_SUITE_PATH, lintSuite, loadManifest, loadSuite } from "./lint.mjs";

function main() {
  const resultPath = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const suitePathIndex = process.argv.indexOf("--suite");
  const suitePath = suitePathIndex >= 0 ? resolve(process.argv[suitePathIndex + 1]) : DEFAULT_SUITE_PATH;
  const enforce = process.argv.includes("--gate");
  if (!resultPath || resultPath.startsWith("--")) {
    console.error("Usage: node eval/repo-recovery/grade-results.mjs <results.json> [--suite <cases.json>] [--gate]");
    process.exitCode = 2;
    return;
  }
  const suite = loadSuite(suitePath);
  const lintErrors = lintSuite(suite, loadManifest());
  if (lintErrors.length > 0) throw new Error(`suite lint failed: ${lintErrors.join("; ")}`);
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  if (result.artifactSchema !== REVIEWED_ARTIFACT_SCHEMA) {
    throw new Error(`grader accepts only stored ${REVIEWED_ARTIFACT_SCHEMA} artifacts`);
  }
  const grade = gradeResults(suite, result);
  if (!grade.identityPass) {
    console.log(JSON.stringify({
      contract: grade.contract,
      complete: grade.complete,
      identityPass: false,
      identityReason: "stored artifact identity does not match current suite",
      reviewPass: grade.reviewPass,
      reviewReasons: grade.reviewReasons,
      operationProjectionErrors: grade.operationProjectionErrors,
      pass: false
    }, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify(grade, null, 2));
  if (enforce && !grade.pass) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
