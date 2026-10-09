#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { findTranscriptEvidencePackOmissions } from "./evidence-pack.mjs";
import { sanitizeCliEvidenceText } from "./evidence-sanitizer.mjs";

const LIMIT = "Matches support fragments only. They do not establish the full claim, source authority, or a changed grade.";
const NUMBER_TERM = /^\$?\s?\d[\d,.]*(?:\s?(?:USD|USDC|XLM|EURC|%|[KMB]))?$/i;
const isExecute = (entry) => /(?:^|__)execute$/.test(entry?.tool ?? "") ||
  /^mcp__.+__(?:lumenloop|scout|stellarDocs)_/.test(entry?.tool ?? "");

function savedEvidence(transcript) {
  const entries = [];
  const losses = [];
  if (!Array.isArray(transcript)) return { entries, losses: ["missing-transcript"] };
  for (const [index, entry] of transcript.entries()) {
    if (!isExecute(entry)) continue;
    if (typeof entry.result !== "string") {
      losses.push(`entry-${index}:missing-result`);
      continue;
    }
    const raw = entry.result;
    if (entry.isError || /^Execution failed:/i.test(raw)) {
      losses.push(`entry-${index}:error-result`);
      continue;
    }
    if (/\n--- (?:SOURCE BASIS|TRUNCATED) ---/.test(raw) ||
        /\[truncated\]/i.test(raw) || entry.resultChars > raw.length) {
      losses.push(`entry-${index}:truncated-result`);
    }
    // Provenance and console text are not evidence for a factual claim.
    const body = raw.split(/\n--- (?:SOURCE BASIS|SOURCE METADATA|TRUNCATED) ---|\n\n--- console \(/, 1)[0];
    if (!body.trim()) {
      losses.push(`entry-${index}:empty-result`);
      continue;
    }
    entries.push({ index, tool: entry.tool, result: body });
  }
  return { entries, losses };
}

/** Check saved final-verdict claims. Never construct or attach a judge pack. */
export function diagnoseRow(row) {
  const { entries, losses } = savedEvidence(row.transcript);
  const claims = Array.isArray(row.verdict?.wrongClaims) ? row.verdict.wrongClaims : [];
  return {
    id: row.id,
    freshness: row.caseInput?.tags?.freshness ?? row.tags?.freshness ?? null,
    claimSource: "verdict.wrongClaims",
    transcriptEntries: Array.isArray(row.transcript) ? row.transcript.length : null,
    usableExecuteResults: entries.length,
    evidenceLosses: losses,
    claims: claims.map((claim, claimIndex) => {
      if (typeof claim !== "string" || !claim.trim()) {
        return { claimIndex, status: "uncertain", reason: "invalid-saved-claim", matches: [] };
      }
      const matches = [];
      const excludedMatches = [];
      const hasAnswer = typeof row.answer === "string" && Boolean(row.answer.trim());
      // Separate trailing prose punctuation without splitting decimals or dotted identifiers.
      const probeAnswer = hasAnswer ? row.answer.replace(/[.,;:!?)\]]+(?=\s|$)/g, " $&") : "";
      // Establish allowed probes from the saved answer before checking source evidence.
      // The helper returns bounded probe lists, so mark any hidden probes explicitly.
      const answerCheck = findTranscriptEvidencePackOmissions({
        transcript: hasAnswer ? [{ tool: "execute", result: probeAnswer }] : [],
        claims: [claim]
      });
      const answerTerms = new Set(answerCheck.omittedTerms);
      const answerProse = new Set(answerCheck.omittedProse);
      const probeLimitReached = answerCheck.transcriptSupportedTerms > answerTerms.size ||
        answerCheck.transcriptSupportedProse > answerProse.size;
      for (const entry of entries) {
        const check = findTranscriptEvidencePackOmissions({ transcript: [entry], claims: [claim] });
        const terms = check.omittedTerms.filter((term) => answerTerms.has(term));
        const prose = check.omittedProse.filter((probe) => answerProse.has(probe));
        const excludedTerms = check.omittedTerms.filter((term) => !answerTerms.has(term));
        const excludedProse = check.omittedProse.filter((probe) => !answerProse.has(probe));
        if (excludedTerms.length || excludedProse.length) {
          excludedMatches.push({
            transcriptIndex: entry.index,
            reason: !hasAnswer ? "missing-answer" : probeLimitReached ? "answer-probe-limit" : "judge-text-only",
            terms: excludedTerms,
            prose: excludedProse
          });
        }
        if (terms.length || prose.length) {
          matches.push({
            transcriptIndex: entry.index,
            tool: entry.tool,
            supportedTerms: terms.length,
            supportedProse: prose.length,
            terms,
            prose
          });
        }
      }
      const status = matches.some((match) => match.prose.length) ? "prose-match" :
        matches.length ? "term-match" : "uncertain";
      const numberOnly = status === "term-match" && matches.every((match) => match.terms.every((term) => NUMBER_TERM.test(term)));
      const reason = matches.length ? "fragment-match" :
        !hasAnswer ? "missing-answer" :
        excludedMatches.some((match) => match.reason === "judge-text-only") ? "judge-text-only" :
        probeLimitReached ? "answer-probe-limit" :
        losses.includes("missing-transcript") ? "missing-transcript" :
        losses.length ? "incomplete-evidence" :
        !entries.length ? "no-execute-results" :
        !answerCheck.checkedTerms && !answerCheck.checkedProse ? "no-probes" : "no-match-in-saved-evidence";
      return {
        claimIndex,
        claim,
        status,
        reason,
        numberOnly,
        checkedTerms: answerCheck.checkedTerms,
        checkedProse: answerCheck.checkedProse,
        answerTerms: [...answerTerms],
        answerProse: [...answerProse],
        judgeTextOnlyTerms: hasAnswer ? answerCheck.checkedTerms - answerCheck.transcriptSupportedTerms : null,
        judgeTextOnlyProse: hasAnswer ? answerCheck.checkedProse - answerCheck.transcriptSupportedProse : null,
        probeLimitReached,
        excludedMatches,
        matches
      };
    })
  };
}

export function diagnoseArtifact(artifact, { allFreshness = false, ids } = {}) {
  if (!Array.isArray(artifact?.rows)) throw new Error("The artifact must contain a rows array.");
  const summary = {
    savedRows: artifact.rows.length,
    selectedRows: 0,
    rowsWithoutClaims: 0,
    skippedById: 0,
    skippedFreshness: 0,
    unknownFreshness: 0,
    claims: 0,
    proseMatches: 0,
    termMatches: 0,
    numberOnlyMatches: 0,
    judgeTextOnly: 0,
    uncertain: 0
  };
  const rows = [];
  for (const row of artifact.rows) {
    if (ids && !ids.includes(row.id)) { summary.skippedById++; continue; }
    const freshness = row.caseInput?.tags?.freshness ?? row.tags?.freshness;
    if (!freshness) summary.unknownFreshness++;
    if (!allFreshness && freshness !== "stable") { summary.skippedFreshness++; continue; }
    const diagnostic = diagnoseRow(row);
    summary.selectedRows++;
    if (!diagnostic.claims.length) summary.rowsWithoutClaims++;
    for (const claim of diagnostic.claims) {
      summary.claims++;
      summary[claim.status === "prose-match" ? "proseMatches" : claim.status === "term-match" ? "termMatches" : "uncertain"]++;
      if (claim.numberOnly) summary.numberOnlyMatches++;
      if (claim.reason === "judge-text-only") summary.judgeTextOnly++;
    }
    rows.push(diagnostic);
  }
  return { summary, rows };
}

const USAGE = `Usage: node eval/qa/diagnose-stable-evidence.mjs <file-or-directory>... [--all-freshness] [--ids id,id]
Read saved QA artifacts and print a separate JSON diagnostic to stdout.
Directories include JSON files in subdirectories. The command never writes source files.
The default selects saved stable rows. --all-freshness includes other rows.
Only final verdict.wrongClaims enter the diagnostic. Missing tags remain unknown.
${LIMIT}`;

function parseArgs(args) {
  const paths = [];
  let allFreshness = false;
  let ids;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--all-freshness" && !allFreshness) allFreshness = true;
    else if (arg === "--ids" && !ids) {
      const value = args[++index];
      if (!value || value.startsWith("-") || value.split(",").some((id) => !id.trim())) {
        throw new Error("Supply a comma-separated ID list after --ids.");
      }
      ids = [...new Set(value.split(",").map((id) => id.trim()))];
    } else if (arg.startsWith("-")) throw new Error(`Unknown or repeated option: ${arg}`);
    else paths.push(resolve(arg));
  }
  if (!paths.length) throw new Error(USAGE);
  return { paths, allFreshness, ids };
}

function jsonFiles(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) return jsonFiles(child);
    return entry.isFile() && entry.name.endsWith(".json") ? [child] : [];
  });
}

export function main(args = process.argv.slice(2)) {
  if (args.some((arg) => ["--help", "-h"].includes(arg))) { console.log(USAGE); return; }
  const options = parseArgs(args);
  const files = [...new Set(options.paths.flatMap(jsonFiles).map((file) => realpathSync(file)))].sort();
  const artifacts = [];
  const skipped = [];
  for (const file of files) {
    const bytes = readFileSync(file);
    const sourceSha256 = createHash("sha256").update(bytes).digest("hex");
    let artifact;
    try { artifact = JSON.parse(bytes); } catch {
      skipped.push({ file, sourceSha256, reason: "invalid-json" });
      continue;
    }
    // Plan sidecars also contain rows, but do not store answers or verdicts.
    if (!Array.isArray(artifact?.rows) || !artifact.rows.some((row) => row &&
      (Object.hasOwn(row, "answer") || Object.hasOwn(row, "verdict")))) {
      skipped.push({ file, sourceSha256, reason: "not-saved-qa-rows" });
      continue;
    }
    artifacts.push({ file, sourceSha256, ...diagnoseArtifact(artifact, options) });
  }
  const report = {
    schema: "qa-saved-evidence-diagnostic-v1",
    scope: options.allFreshness ? "all-freshness" : "stable",
    ids: options.ids ?? null,
    limits: LIMIT,
    artifacts,
    skipped
  };
  // Reuse the existing credential sanitizer before emitting any saved prose.
  console.log(sanitizeCliEvidenceText(JSON.stringify(report, null, 2)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); } catch (error) {
    console.error(sanitizeCliEvidenceText(error.message));
    process.exitCode = 1;
  }
}
