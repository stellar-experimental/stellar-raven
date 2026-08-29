/**
 * One fake `claude` CLI on PATH, for judgeCase tests.
 *
 * Every judge test needs the same scaffolding: a temp directory, an executable
 * named `claude` inside it, a PATH swap around the call, and cleanup that runs
 * even when the assertion throws. Only the script and the judgeCase options
 * differ, so the scaffolding lives here once and each named helper below
 * supplies its own script.
 */
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { judgeCase } from "../../eval/qa/judge.mjs";

/**
 * The single graded input behind every fake-CLI judge test. The fake CLI
 * decides the verdict, so the case only has to be a well-formed one; keeping
 * it identical across tests means a failure is always about the CLI evidence
 * path and never about the case.
 */
export const FAKE_JUDGE_INPUT = {
  question: "What does a null Scout vertical mean?",
  golden: {
    answer: "It means unmapped, not marketless.",
    keyFacts: ["The vertical is unmapped."],
    avoid: ["Do NOT call the market absent."],
    notes: ""
  },
  tags: { freshness: "stable" },
  candidateAnswer: "The vertical is unmapped."
};

/**
 * Run judgeCase with `script` installed on PATH as `claude`.
 *
 * `prefix` names the temp directory so a leaked one is traceable to its test.
 * `isolatePath` drops the inherited PATH entirely, which is how the
 * missing-CLI case is produced. Remaining options go straight to judgeCase.
 */
export async function judgeWithFakeCli(
  script,
  { prefix, isolatePath = false, input = FAKE_JUDGE_INPUT, ...judgeOptions } = {}
) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  if (script !== null) {
    const executable = join(directory, "claude");
    writeFileSync(executable, script);
    chmodSync(executable, 0o755);
  }
  const originalPath = process.env.PATH;
  process.env.PATH = isolatePath ? directory : `${directory}:${originalPath}`;
  try {
    return await judgeCase(input, judgeOptions);
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

/** A CLI that returns `modelVerdict` in a normal envelope and exits 0. */
export function judgeWithFakeClaude(
  modelVerdict,
  { costUsd = 0.125, promptIncludes = [], input = FAKE_JUDGE_INPUT } = {}
) {
  const envelope = JSON.stringify({ result: JSON.stringify(modelVerdict), total_cost_usd: costUsd });
  return judgeWithFakeCli(
    `#!/usr/bin/env node\n` +
      `const prompt = require("node:fs").readFileSync(0, "utf8");\n` +
      `const required = ${JSON.stringify(promptIncludes)};\n` +
      `if (required.some((text) => !prompt.includes(text))) process.exit(23);\n` +
      `process.stdout.write(${JSON.stringify(envelope)});\n`,
    { prefix: "qa-fake-claude-", input }
  );
}

/** A CLI that writes the given streams and exits nonzero. */
export function judgeFailureWithFakeClaude({ stdout, stderr, exitCode = 1 }) {
  return judgeWithFakeCli(
    `#!/usr/bin/env node\n` +
      // writeSync so a large payload cannot be truncated by process.exit.
      `const fs = require("node:fs");\n` +
      `const flush = (fd, text) => {\n` +
      `  const buffer = Buffer.from(text);\n` +
      `  let offset = 0;\n` +
      `  while (offset < buffer.length) offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);\n` +
      `};\n` +
      `flush(1, ${JSON.stringify(stdout)});\n` +
      `flush(2, ${JSON.stringify(stderr)});\n` +
      `process.exit(${exitCode});\n`,
    { prefix: "qa-failing-claude-" }
  );
}

/** The same failure, with the streams given as exact bytes rather than text. */
export function judgeFailureWithRawBytes({ stdout, stderr = Buffer.alloc(0), exitCode = 1 }) {
  return judgeWithFakeCli(
    `#!/usr/bin/env node\n` +
      `process.stdout.write(Buffer.from(${JSON.stringify(stdout.toString("base64"))}, "base64"));\n` +
      `process.stderr.write(Buffer.from(${JSON.stringify(stderr.toString("base64"))}, "base64"));\n` +
      `process.exit(${exitCode});\n`,
    { prefix: "qa-raw-failing-claude-" }
  );
}

/** No `claude` anywhere on PATH: spawnSync reports ENOENT. */
export function judgeWithMissingClaude() {
  return judgeWithFakeCli(null, { prefix: "qa-missing-claude-", isolatePath: true });
}

/** A CLI that kills itself, so the result carries a signal and no exit status. */
export function judgeSignalWithFakeClaude() {
  return judgeWithFakeCli("#!/bin/sh\nkill -TERM $$\n", { prefix: "qa-signaled-claude-" });
}

/** A CLI whose output overruns `maxBuffer`, which Node reports as ENOBUFS. */
export function judgeOverflowWithFakeClaude({ stdout, maxBuffer = 16 }) {
  return judgeWithFakeCli(
    `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(stdout)});\n`,
    { prefix: "qa-overflow-claude-", maxBuffer }
  );
}

/** A CLI that never exits, so judgeCase hits its wall-clock timeout. */
export function judgeTimeoutWithFakeClaude() {
  return judgeWithFakeCli("#!/bin/sh\nwhile :; do :; done\n", {
    prefix: "qa-timeout-claude-",
    timeoutMs: 50
  });
}
