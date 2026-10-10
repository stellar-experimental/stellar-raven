#!/usr/bin/env node
// Reads a saved `npm run dev:eval` server log and reports each Playground turn
// from its `demo-chat-start`, `demo-step`, and `demo-chat` events, in log order.
// Usage: node demo-steps.mjs <server.log> [--final-step N] [--strict-usage]
// Exit 1 when a turn has a tool call on the final step or when the log holds an
// unfinished turn. A step-usage sum that differs from the turn usage is listed in
// `usageMismatches`; it sets exit 1 only with --strict-usage (receipt probes).
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const finalIndex = args.indexOf("--final-step");
const finalStep = finalIndex >= 0 ? Number(args[finalIndex + 1]) : 7;
const strictUsage = args.includes("--strict-usage");
const path = args.find((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--final-step");
if (!path || !Number.isInteger(finalStep) || finalStep < 1) {
  console.error("usage: node demo-steps.mjs <server.log> [--final-step N] [--strict-usage]");
  process.exit(2);
}

const events = [];
for (const line of readFileSync(path, "utf8").split("\n")) {
  const start = line.indexOf('{"evt":');
  if (start < 0) continue;
  try {
    const event = JSON.parse(line.slice(start));
    if (["demo-chat-start", "demo-step", "demo-chat"].includes(event.evt)) events.push(event);
  } catch {
    // Wrangler can wrap or prefix a line; skip what is not one JSON event.
  }
}

const turns = [];
let open = null;
const problems = [];
const usageMismatches = [];
for (const event of events) {
  if (event.evt === "demo-chat-start") {
    if (open) problems.push(`turn ${turns.length + 1}: started before the previous turn ended`);
    open = { start: event, steps: [] };
  } else if (event.evt === "demo-step") {
    if (!open) problems.push("demo-step outside a turn");
    else open.steps.push(event);
  } else {
    if (!open) {
      problems.push("demo-chat without demo-chat-start");
      continue;
    }
    turns.push({ ...open, end: event });
    open = null;
  }
}
if (open) problems.push(`turn ${turns.length + 1}: no demo-chat event`);

const sum = (steps, key) =>
  steps.every((step) => typeof step[key] === "number") ? steps.reduce((total, step) => total + step[key], 0) : null;

const rows = turns.map((turn, index) => {
  const final = turn.steps.find((step) => step.step === finalStep) ?? null;
  const models = [...new Set(turn.steps.map((step) => step.model))];
  const usage = Object.fromEntries(
    ["inputTokens", "outputTokens", "totalTokens"].map((key) => [key, { steps: sum(turn.steps, key), turn: turn.end[key] ?? null }])
  );
  const row = {
    turn: index + 1,
    attemptedModels: turn.end.attemptedModels ?? null,
    stepModels: models,
    steps: turn.steps.length,
    finishReason: turn.end.finishReason ?? null,
    searchCalls: turn.end.searchCalls ?? null,
    executeCalls: turn.end.executeCalls ?? null,
    finalStepReached: final !== null,
    finalStepToolCalls: final ? final.toolCalls : null,
    finalStepTextChars: final ? final.textChars : null,
    usage
  };
  if (final && final.toolCalls !== 0) problems.push(`turn ${row.turn}: ${final.toolCalls} tool call(s) on final step ${finalStep}`);
  // Usage sums are comparable only for one model attempt.
  if (models.length === 1) {
    for (const [key, pair] of Object.entries(usage)) {
      if (pair.steps === null || pair.turn === null || pair.steps !== pair.turn) {
        usageMismatches.push(`turn ${row.turn}: ${key} steps=${pair.steps} turn=${pair.turn}`);
      }
    }
  }
  return row;
});

console.log(JSON.stringify({
  log: path,
  finalStep,
  turns: rows.length,
  finalStepCoverage: rows.filter((row) => row.finalStepReached).length,
  rows,
  problems,
  usageMismatches
}, null, 2));
process.exitCode = problems.length > 0 || (strictUsage && usageMismatches.length > 0) ? 1 : 0;
