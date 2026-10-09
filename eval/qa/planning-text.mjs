#!/usr/bin/env node
/** Offline, report-only screen of saved final answers. No model calls. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

export const PLANNING_TEXT_SCHEMA = "qa-planning-text-v1";
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const ACTION = "(?:search|call|check|look up|look into|fetch|query|use|find|verify|read|retrieve|pull|gather|inspect|compose|write|draft|summarize)";
const FIRST_LINE_CUE = /^(?:Now I have|Let me|I['’]ll|I will|I['’]m going to|I am going to|I need to)\b/i;
const RULES = [
  { id: "let-me-action", pattern: new RegExp(`\\blet me\\s+(?:(?:now|first|just|quickly)\\s+)?${ACTION}\\b`, "gi") },
  { id: "future-action", pattern: new RegExp(`\\b(?:I['’]ll|I will|I['’]m going to|I am going to|I need to)\\s+(?:(?:now|first)\\s+)?${ACTION}\\b`, "g") },
  { id: "answer-readiness", pattern: /\bNow I have\b[^\n.!?]{0,240}/g }
];

// Preserve offsets while removing common Markdown and quotation contexts.
function proseOnly(answer) {
  let text = answer;
  const mask = (pattern) => {
    text = text.replace(pattern, (match) => match.replace(/[^\n]/g, " "));
  };
  mask(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[^\n]*(?:\n|$)/gm);
  mask(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*$/gm);
  mask(/`+[^\n]*?`+/g);
  mask(/^[ \t]*>[^\n]*/gm);
  mask(/"[^"\n]*"|“[^”\n]*”/g);
  mask(/(?:^|[\s(])'[^'\n]*'(?!\w)|‘[^’\n]*’/g);
  return text;
}

/** Matches need manual review. The rules do not measure all planning text. */
export function findPlanningText(answer) {
  if (typeof answer !== "string") throw new Error("answer must be a string");
  const prose = proseOnly(answer);
  const matches = [];
  for (const rule of RULES) {
    for (const match of prose.matchAll(rule.pattern)) {
      const start = match.index;
      const paragraphBreak = prose.lastIndexOf("\n\n", start);
      const paragraphStart = paragraphBreak < 0 ? 0 : paragraphBreak + 2;
      const lineStart = prose.lastIndexOf("\n", start) + 1;
      const prefix = prose.slice(Math.max(0, paragraphStart, lineStart), start);
      // Examples and conditional follow-up offers do not describe current work.
      if (/\b(?:example|quote|quoted|say|says|saying|if|once|when|send|provide|share|give)\b/i.test(prefix)) continue;
      if (rule.id === "future-action") {
        const explicitNow = /\b(?:now|first)\b/.test(match[0]);
        if (!explicitNow && prose.slice(0, start).trim()) continue;
      }
      if (rule.id === "answer-readiness") {
        if (prose.slice(0, start).trim()) continue;
        const paragraph = prose.slice(start).split(/\n\s*\n/)[0];
        if (!/\b(?:answer|composing|to compose|confirm(?:s|ed)?|well-grounded|(?:here['’]s|here is) (?:the|my|a|what)|enough|everything (?:needed|grounded))\b/i.test(paragraph)) continue;
      }
      matches.push({ rule: rule.id, start, end: start + match[0].length, text: answer.slice(start, start + match[0].length) });
    }
  }
  return matches.sort((a, b) => a.start - b.start || compareText(a.rule, b.rule));
}

function jsonPaths(input) {
  // Sorting gives stable input order. Symbolic links do not enter a directory scan.
  const paths = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => compareText(a.name, b.name))) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith(".json")) paths.push(file);
    }
  };
  visit(input);
  return paths;
}

export function scanPlanningText(directory, { sampleSize = 20 } = {}) {
  if (!Number.isInteger(sampleSize) || sampleSize < 0) throw new Error("sample size must be a non-negative integer");
  const input = path.resolve(directory);
  const files = [];
  const candidates = [];
  const answerHashes = new Set();
  const counts = { jsonFiles: 0, resultFiles: 0, rows: 0, nonEmptyAnswers: 0, missingAnswers: 0, emptyAnswers: 0, matchedAnswers: 0, matches: 0,
    firstLineCueAnswers: 0, matchedFirstLineCueAnswers: 0, unmatchedFirstLineCueAnswers: 0 };
  for (const file of jsonPaths(input)) {
    const bytes = readFileSync(file);
    const artifact = JSON.parse(bytes.toString("utf8"));
    const relative = path.relative(input, file);
    const hasRows = Array.isArray(artifact?.rows);
    files.push({ path: relative, sha256: sha256(bytes), hasRows });
    counts.jsonFiles++;
    if (!hasRows) continue;
    counts.resultFiles++;
    for (const [rowIndex, row] of artifact.rows.entries()) {
      counts.rows++;
      if (typeof row?.answer !== "string") { counts.missingAnswers++; continue; }
      if (!row.answer.trim()) { counts.emptyAnswers++; continue; }
      counts.nonEmptyAnswers++;
      const answerSha256 = sha256(row.answer);
      answerHashes.add(answerSha256);
      const matches = findPlanningText(row.answer);
      if (FIRST_LINE_CUE.test(row.answer.trim().split("\n")[0])) {
        counts.firstLineCueAnswers++;
        if (matches.length) counts.matchedFirstLineCueAnswers++;
        else counts.unmatchedFirstLineCueAnswers++;
      }
      if (!matches.length) continue;
      counts.matchedAnswers++;
      counts.matches += matches.length;
      candidates.push({
        file: relative, fileSha256: sha256(bytes), rowIndex, id: row.id ?? null,
        answerSha256, matches,
        excerpt: row.answer.slice(Math.max(0, matches[0].start - 120), matches.at(-1).end + 220)
      });
    }
  }
  // Hash ordering selects a reproducible sample without favoring the earliest run.
  const sample = [...candidates].sort((a, b) => {
    const key = (row) => sha256(JSON.stringify([row.file, row.rowIndex, row.answerSha256]));
    return compareText(key(a), key(b));
  }).slice(0, sampleSize);
  return {
    schema: PLANNING_TEXT_SCHEMA,
    rules: RULES.map((rule) => ({ id: rule.id, pattern: rule.pattern.source, flags: rule.pattern.flags })),
    firstLineCue: { pattern: FIRST_LINE_CUE.source, flags: FIRST_LINE_CUE.flags },
    inputSha256: sha256(JSON.stringify(files)), files,
    counts: { ...counts, uniqueAnswerTexts: answerHashes.size },
    limits: [
      "Matches need manual review. The count does not equal confirmed planning text.",
      "The rules cover English action statements and explicit answer preparation.",
      "Quotation masking covers common Markdown forms. Other quotation forms can produce false positives.",
      "Evidence summaries can resemble answer preparation. Conditional offers can resemble current work.",
      "The denominator counts saved row occurrences. Repeated answers remain in the denominator.",
      "The diagnostic changes no answer, grade, prompt, or release gate.",
      `The screen matches ${counts.matchedFirstLineCueAnswers} of ${counts.firstLineCueAnswers} first-line cue answers; ${counts.unmatchedFirstLineCueAnswers} remain unmatched.`,
      "The first-line cue gap does not measure recall. A cue can introduce a legitimate evidence summary."
    ],
    candidates, sample
  };
}

export function assessPlanningReview(report, review) {
  if (review.inputSha256 !== report.inputSha256) throw new Error("review input hash differs");
  if (!isDeepStrictEqual(review.counts, report.counts)) throw new Error("review counts differ from recomputed counts");
  if (!Array.isArray(review.rows)) throw new Error("review must contain rows");
  const seen = new Set();
  const counts = { reviewed: 0, planning: 0, falsePositive: 0, uncertain: 0 };
  for (const row of review.rows) {
    const key = JSON.stringify([row.file, row.rowIndex, row.answerSha256]);
    if (seen.has(key)) throw new Error("review repeats a row");
    seen.add(key);
    const candidate = report.candidates.find((item) => item.file === row.file && item.rowIndex === row.rowIndex && item.answerSha256 === row.answerSha256);
    if (!candidate) throw new Error("review row does not match a candidate");
    if (!["planning", "falsePositive", "uncertain"].includes(row.label) || typeof row.reason !== "string" || !row.reason.trim()) {
      throw new Error("review row needs a valid label and reason");
    }
    counts.reviewed++;
    counts[row.label]++;
  }
  const labeled = counts.planning + counts.falsePositive;
  const summary = { ...counts, precision: labeled ? counts.planning / labeled : null,
    precisionLower: counts.reviewed ? counts.planning / counts.reviewed : null,
    precisionUpper: counts.reviewed ? (counts.planning + counts.uncertain) / counts.reviewed : null,
    coversSample: report.sample.length > 0 && report.sample.every((row) => seen.has(JSON.stringify([row.file, row.rowIndex, row.answerSha256]))) };
  if (!summary.coversSample) throw new Error("review does not cover the sample");
  if (!isDeepStrictEqual(review.summary, summary)) throw new Error("review summary differs from recomputed summary");
  return summary;
}

export function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && ["--help", "-h"].includes(argv[0])) {
    console.log("usage: node eval/qa/planning-text.mjs <results-directory> [--sample-size <n>] [--review <review.json>]");
    return;
  }
  const directory = argv[0];
  if (!directory || directory.startsWith("--")) throw new Error("provide a results directory");
  let sampleSize = 20;
  let reviewPath;
  const seen = new Set();
  for (let index = 1; index < argv.length; index++) {
    const flag = argv[index];
    if (!["--sample-size", "--review"].includes(flag) || seen.has(flag)) throw new Error(`invalid or repeated flag: ${flag}`);
    seen.add(flag);
    const value = argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    if (flag === "--sample-size") sampleSize = /^\d+$/.test(value) ? Number(value) : NaN;
    else reviewPath = value;
  }
  const report = scanPlanningText(directory, { sampleSize });
  if (reviewPath) report.review = assessPlanningReview(report, JSON.parse(readFileSync(reviewPath, "utf8")));
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) { console.error(`planning-text: ${error.message}`); process.exitCode = 1; }
}
