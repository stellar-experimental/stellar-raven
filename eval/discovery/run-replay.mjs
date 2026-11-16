#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compactHit,
  normalizeUrl,
  parseSearchPayload,
  postMcp,
  preflightSearch,
  resultStamp,
  writeResult
} from "./lib.mjs";
import { confirmationOnlyFor, consoleValue, tagRows } from "../lib/confirmation-only.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, "../..");
const DEFAULT_CASES = path.join(DIR, "mined-lumenloop-queries.json");
const DEFAULT_URL = "http://localhost:8787";

const argValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};

function bucket(rows) {
  const n = rows.length;
  const count = (field) => rows.filter((row) => row[field]).length;
  const metric = (field) => {
    const value = count(field);
    return { count: value, pct: n ? Number(((100 * value) / n).toFixed(1)) : 0 };
  };
  return {
    n,
    familyTop1: metric("familyTop1"),
    familyHitAt3: metric("familyHitAt3"),
    familyTop5: metric("familyTop5"),
    usableOpTop1: metric("usableOpTop1"),
    usableOpAt5: metric("usableOpAt5")
  };
}

function summarize(rows) {
  const byCase = {};
  for (const caseId of [...new Set(rows.map((row) => row.caseId))].sort()) {
    byCase[caseId] = bucket(rows.filter((row) => row.caseId === caseId));
  }
  const byRegister = {};
  for (const register of [...new Set(rows.map((row) => row.register))].sort()) {
    byRegister[register] = bucket(rows.filter((row) => row.register === register));
  }
  return { overall: bucket(rows), byCase, byRegister };
}

async function main() {
  const startedAt = new Date().toISOString();
  const url = normalizeUrl(argValue("--url") ?? DEFAULT_URL);
  const casesPath = path.resolve(argValue("--cases") ?? DEFAULT_CASES);
  const runLabel = argValue("--run-label") ?? "replay";
  const replay = JSON.parse(readFileSync(casesPath, "utf8"));
  if (!Array.isArray(replay.occurrences)) throw new Error(`${casesPath} must contain occurrences[]`);
  await preflightSearch(url, "mined-query-replay");
  // Rows whose query matches a QA headline question are tagged confirmation-only (eval/README.md).
  // The list covers the committed mined-query file; a `--cases` file with other ids has no listed rows.
  const isListed = confirmationOnlyFor(
    "mined-replay",
    JSON.parse(readFileSync(DEFAULT_CASES, "utf8")).occurrences.map((occurrence) => occurrence.id),
  );
  const rows = [];
  for (const [index, occurrence] of replay.occurrences.entries()) {
    process.stdout.write(`[${index + 1}/${replay.occurrences.length}] ${occurrence.id} ... `);
    const message = await postMcp(url, {
      jsonrpc: "2.0",
      id: 1000 + index,
      method: "tools/call",
      params: { name: "search", arguments: { query: occurrence.query, limit: 8 } }
    });
    const hits = (parseSearchPayload(message).hits ?? []).slice(0, 8).map((hit, rank) => compactHit(hit, rank + 1));
    const expected = new Set(occurrence.expectedFamilies);
    const acceptable = new Set(occurrence.acceptableOps);
    const row = {
      ...occurrence,
      familyTop1: Boolean(hits[0] && expected.has(hits[0].service)),
      familyHitAt3: hits.slice(0, 3).some((hit) => expected.has(hit.service)),
      familyTop5: hits.slice(0, 5).some((hit) => expected.has(hit.service)),
      usableOpTop1: Boolean(hits[0] && acceptable.has(hits[0].id)),
      usableOpAt5: hits.slice(0, 5).some((hit) => acceptable.has(hit.id)),
      topHits: hits
    };
    tagRows([row], isListed);
    rows.push(row);
    console.log(
      `family@1=${consoleValue(row, row.familyTop1 ? "hit" : "miss")} family@5=${consoleValue(row, row.familyTop5 ? "hit" : "miss")}`,
    );
  }
  const summary = summarize(rows);
  const stamp = resultStamp(runLabel);
  const outPath = path.join(DIR, "results", `${stamp}.json`);
  writeResult(outPath, {
    meta: {
      instrument: "mined-real-query-replay",
      casesPath: path.relative(REPO, casesPath),
      occurrenceCount: rows.length,
      url,
      runLabel,
      startedAt,
      finishedAt: new Date().toISOString(),
      grading: {
        familyTop1: "rank-1 service is expected",
        familyHitAt3: "an expected service appears at ranks 1-3",
        familyTop5: "an expected service appears at ranks 1-5",
        usableOpTop1: "rank-1 id is acceptable",
        usableOpAt5: "an acceptable id appears at ranks 1-5"
      }
    },
    sourceSummary: replay.summary ?? null,
    summary,
    rows
  });
  console.log(`results -> ${outPath}`);
}

main().catch((error) => {
  console.error(`run-replay failed: ${error.message}`);
  process.exit(1);
});
