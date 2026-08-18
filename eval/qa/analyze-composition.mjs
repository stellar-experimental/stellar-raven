#!/usr/bin/env node
/**
 * analyze-composition.mjs — per-case composition/adoption analysis over a QA
 * results file's tool transcripts (research/skill-run-design.md §10 — the
 * skill.run ship gate's composition instrument, landed BEFORE the feature so
 * both sides of the A/B are measured with identical tooling).
 *
 * Usage:
 *   node eval/qa/analyze-composition.mjs <results-file.json>
 *
 * Per case (from rows[].transcript):
 *   - execute script count (execute tool_use entries)
 *   - ADOPTION: did any execute input call codemode.skill.run / skill_run?
 *   - op-call counts, extracted grade-plan-style (imports extractExecuteOps
 *     from eval/plan/grade-plan.mjs — one extractor, no drift); skill.run
 *     calls are expanded through the runner registry's declared ops
 *     (loadRunnerOps) so before/after constituent work is comparable. The
 *     registry ships AFTER this instrument — absent registry degrades
 *     gracefully (no expansion; noted in the output).
 *   - truncation-footer detection + skill.run `calls`-array ok/error/softEmpty
 *     tallies from execute RESULTS — requires results captured whole (the
 *     run-qa.mjs whole-execute-results patch; older files degrade to "n/a").
 *   - turns + costUsd (rows[].agent)
 *
 * Prints a per-case table, then an aggregate table; writes
 * <results-file>.composition.json next to the input (grade-plan sidecar style).
 * Node-clean: plain Node ≥ 22.6 (registry import relies on native type
 * stripping), zero deps.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { extractExecuteOps, expandSkillRuns, loadRunnerOps } from "../plan/grade-plan.mjs";
import { assertNotPlaygroundQuarantine } from "../playground/artifact-contract.mjs";

/**
 * §10 adoption signal: any skill.run/skill_run call in an execute input.
 * The leading \b keeps this trigger-identical to grade-plan's OP_RE run branch
 * (`mycodemode.skill.run(` must not flip adoption while skillRunCalls stays 0).
 * Shared limitation with all regex op extraction: call syntax inside strings
 * or comments still matches — accepted, consistent with grade-plan.
 */
export const ADOPTION_RE = /\bcodemode\.skill(?:\.run|_run)\s*\(/;

/**
 * SOURCE BASIS and TRUNCATED both mark a loss boundary. Historical composition
 * stamps from before 2026-07-10 are not comparable on truncation counts.
 */
const TRUNCATION_MARKER = "--- TRUNCATED ---";
const SOURCE_BASIS_MARKER = "--- SOURCE BASIS ---";
/** src/mcp/tools.ts appends logs after this marker; strip before JSON parsing. */
const CONSOLE_MARKER = "\n\n--- console (";

const isExecuteEntry = (t) => (t?.tool ?? "").endsWith("execute");

/** A host-ledger call record per skill-run-design §6: { op, ok, errorKind?, ms }. */
const isCallEntry = (c) => c !== null && typeof c === "object" && typeof c.op === "string" && typeof c.ok === "boolean";

/**
 * Tally skill.run `calls` arrays inside one whole execute result text.
 * Strategy: strip the console block and truncation footer, JSON.parse the
 * body and walk it for `calls` keys holding ledger-shaped arrays; when the
 * body doesn't parse (truncation cut mid-JSON), fall back to a tolerant regex
 * over the raw text (ledger entries serialize key-ordered: op, ok, errorKind?).
 */
export function tallyCallsArrays(resultText) {
  const tally = { arrays: 0, calls: 0, ok: 0, error: 0, softEmpty: 0, parsed: true };
  let body = String(resultText ?? "");
  const consoleAt = body.indexOf(CONSOLE_MARKER);
  if (consoleAt !== -1) body = body.slice(0, consoleAt);
  const footerAt = body.indexOf(`\n${TRUNCATION_MARKER}`);
  if (footerAt !== -1) body = body.slice(0, footerAt);

  const count = (ok, errorKind) => {
    tally.calls++;
    if (ok) tally.ok++;
    else if (errorKind === "soft-empty") tally.softEmpty++;
    else tally.error++;
  };

  try {
    const walk = (v) => {
      if (Array.isArray(v)) {
        for (const x of v) walk(x);
        return;
      }
      if (v === null || typeof v !== "object") return;
      for (const [k, val] of Object.entries(v)) {
        if (k === "calls" && Array.isArray(val) && val.length > 0 && val.every(isCallEntry)) {
          tally.arrays++;
          for (const c of val) count(c.ok, c.errorKind);
        } else {
          walk(val);
        }
      }
    };
    walk(JSON.parse(body));
  } catch {
    tally.parsed = false;
    for (const m of body.matchAll(/"op"\s*:\s*"[^"]+"\s*,\s*"ok"\s*:\s*(true|false)(?:\s*,\s*"errorKind"\s*:\s*"(error|soft-empty)")?/g)) {
      count(m[1] === "true", m[2]);
    }
  }
  return tally;
}

/** Analyze one results row; returns the per-case record. */
export function analyzeRow(row, runnerOps) {
  const executeEntries = (row.transcript ?? []).filter(isExecuteEntry);

  let adoption = false;
  let truncatedInputs = 0;
  const extracted = [];
  for (const e of executeEntries) {
    if (ADOPTION_RE.test(String(e.input ?? ""))) adoption = true;
    const { ops, truncated } = extractExecuteOps(e.input);
    if (truncated) truncatedInputs++;
    extracted.push(...ops);
  }
  const expanded = expandSkillRuns(extracted, runnerOps);
  const skillRunCalls = extracted.filter((o) => o.service === "skills" && o.op === "skill.run").length;
  const expandedOps = expanded.length - extracted.length; // constituent ops added via registry
  const opCounts = {};
  for (const o of expanded) opCounts[`${o.service}.${o.op}`] = (opCounts[`${o.service}.${o.op}`] ?? 0) + 1;

  // Results side — needs whole execute results (entry.result); older files
  // only carry resultChars and degrade to resultsCaptured < scripts.
  let resultsCaptured = 0;
  let truncatedResults = 0;
  let executionFailures = 0;
  const calls = { arrays: 0, calls: 0, ok: 0, error: 0, softEmpty: 0, unparsedResults: 0 };
  for (const e of executeEntries) {
    if (typeof e.result !== "string") continue;
    resultsCaptured++;
    if (e.result.includes(TRUNCATION_MARKER) || e.result.includes(SOURCE_BASIS_MARKER)) truncatedResults++;
    if (e.isError || e.result.startsWith("Execution failed:")) executionFailures++;
    const t = tallyCallsArrays(e.result);
    calls.arrays += t.arrays;
    calls.calls += t.calls;
    calls.ok += t.ok;
    calls.error += t.error;
    calls.softEmpty += t.softEmpty;
    if (!t.parsed) calls.unparsedResults++;
  }

  return {
    id: row.id,
    truth: row.truth ?? null,
    verdict: row.verdict?.score ?? null,
    executeScripts: executeEntries.length,
    adoption,
    skillRunCalls,
    ops: expanded,
    opCounts,
    opCallsTotal: expanded.filter((o) => o.service !== "meta-discovery").length,
    expandedOps,
    truncatedInputs,
    resultsCaptured,
    truncatedResults,
    executionFailures,
    calls,
    turns: row.agent?.turns ?? null,
    costUsd: row.agent?.costUsd ?? null
  };
}

/** Aggregate the per-case records. */
export function summarizeComposition(caseRows) {
  const sum = (f) => caseRows.reduce((s, r) => s + (f(r) ?? 0), 0);
  const byService = {};
  for (const r of caseRows) {
    for (const o of r.ops) byService[o.service] = (byService[o.service] ?? 0) + 1;
  }
  const executeScripts = sum((r) => r.executeScripts);
  return {
    cases: caseRows.length,
    executeScripts,
    meanScriptsPerCase: caseRows.length ? executeScripts / caseRows.length : null,
    adoptionCases: caseRows.filter((r) => r.adoption).length,
    skillRunCalls: sum((r) => r.skillRunCalls),
    expandedOps: sum((r) => r.expandedOps),
    opCallsTotal: sum((r) => r.opCallsTotal),
    opCallsByService: byService,
    truncatedInputCases: caseRows.filter((r) => r.truncatedInputs > 0).length,
    resultsCaptured: sum((r) => r.resultsCaptured),
    truncatedResultCases: caseRows.filter((r) => r.truncatedResults > 0).length,
    executionFailures: sum((r) => r.executionFailures),
    calls: {
      arrays: sum((r) => r.calls.arrays),
      calls: sum((r) => r.calls.calls),
      ok: sum((r) => r.calls.ok),
      error: sum((r) => r.calls.error),
      softEmpty: sum((r) => r.calls.softEmpty),
      unparsedResults: sum((r) => r.calls.unparsedResults)
    },
    meanTurns: caseRows.length ? sum((r) => r.turns) / caseRows.length : null,
    totalCostUsd: sum((r) => r.costUsd)
  };
}

/** Aggregate table, formatPlanSummaryTable style (padded label lines). */
export function formatCompositionTable(summary, notes) {
  const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : "n/a");
  const line = (label, value) => `${label.padEnd(30)} ${value}`;
  const out = [
    "COMPOSITION (aggregate)",
    line("cases", String(summary.cases)),
    line("execute scripts", `${summary.executeScripts} total  (mean ${summary.meanScriptsPerCase === null ? "n/a" : summary.meanScriptsPerCase.toFixed(2)}/case)`),
    line("skill.run ADOPTION", `${summary.adoptionCases}/${summary.cases} cases (${pct(summary.adoptionCases, summary.cases)})  ${summary.skillRunCalls} call(s)`),
    line("op calls (non-meta)", `${summary.opCallsTotal} total  (${summary.expandedOps} via skill.run expansion)`),
    line("op calls by service", Object.entries(summary.opCallsByService).sort().map(([s, n]) => `${s}:${n}`).join("  ") || "none")
  ];
  const r = summary.resultsCaptured;
  if (r > 0) {
    out.push(line("truncation footers", `${summary.truncatedResultCases}/${summary.cases} case(s) with a truncated execute result`));
    out.push(line("execution failures", String(summary.executionFailures)));
    out.push(
      line(
        "skill.run calls-arrays",
        `${summary.calls.arrays} array(s), ${summary.calls.calls} entries: ${summary.calls.ok} ok / ${summary.calls.error} error / ${summary.calls.softEmpty} softEmpty` +
          (summary.calls.unparsedResults > 0 ? `  (${summary.calls.unparsedResults} result(s) regex-fallback)` : "")
      )
    );
    out.push(line("execute results captured", `${r} whole result(s) across ${summary.cases} cases`));
  } else {
    out.push(line("results-side metrics", "n/a — no whole execute results in this file (pre-instrument run-qa.mjs)"));
  }
  out.push(line("agent turns", summary.meanTurns === null ? "n/a" : `mean ${summary.meanTurns.toFixed(1)}/case`));
  out.push(line("agent cost", `$${summary.totalCostUsd.toFixed(2)} total`));
  for (const n of notes) out.push(`NOTE: ${n}`);
  return out.join("\n");
}

async function main() {
  const resultsPath = process.argv[2];
  if (!resultsPath || resultsPath.startsWith("--")) {
    console.error("usage: node eval/qa/analyze-composition.mjs <results-file.json>");
    process.exit(1);
  }
  const results = JSON.parse(readFileSync(resultsPath, "utf8"));
  assertNotPlaygroundQuarantine(results, resultsPath);
  if (!Array.isArray(results.rows)) throw new Error(`${resultsPath}: missing rows[]`);

  const notes = [];
  const { runnerOps, note: runnerNote } = await loadRunnerOps();
  if (runnerNote) notes.push(runnerNote);

  const caseRows = results.rows.map((row) => analyzeRow(row, runnerOps));
  const summary = summarizeComposition(caseRows);
  if (summary.resultsCaptured < summary.executeScripts) {
    notes.push(
      `${summary.executeScripts - summary.resultsCaptured}/${summary.executeScripts} execute results not captured whole (pre-instrument run-qa.mjs) — truncation/calls tallies cover only the captured ones`
    );
  }

  console.table(
    caseRows.map((r) => ({
      id: r.id,
      verdict: r.verdict ?? "n/a",
      scripts: r.executeScripts,
      adoption: r.adoption,
      skillRuns: r.skillRunCalls,
      ops: r.opCallsTotal,
      expanded: r.expandedOps,
      truncRes: r.resultsCaptured > 0 ? r.truncatedResults : "n/a",
      callsOk: r.resultsCaptured > 0 ? r.calls.ok : "n/a",
      callsErr: r.resultsCaptured > 0 ? r.calls.error : "n/a",
      callsSoft: r.resultsCaptured > 0 ? r.calls.softEmpty : "n/a",
      turns: r.turns ?? "n/a",
      costUsd: r.costUsd === null ? "n/a" : r.costUsd.toFixed(3)
    }))
  );

  const outPath = resultsPath.replace(/\.json$/, "") + ".composition.json";
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          resultsPath,
          runnerRegistry: runnerOps ? { runnableIds: Object.keys(runnerOps).sort() } : { absent: true, note: runnerNote },
          analyzedAt: new Date().toISOString()
        },
        summary,
        notes,
        rows: caseRows
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${outPath}\n`);
  console.log(formatCompositionTable(summary, notes));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
