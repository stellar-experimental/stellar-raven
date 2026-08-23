import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildJudgePrompt,
  judgeCase,
  JUDGE_RUBRIC,
  sanitizeCliEvidenceText
} from "../eval/qa/judge.mjs";
import { checkVerdictConsistency } from "../eval/qa/verdict-consistency.mjs";

const CORPUS = join(import.meta.dirname, "..", "eval", "qa", "corpus", "battery");
const NULL_VERTICAL_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "scf-grants-builders", "q-gap-vet-pitch-vertical-null.json"), "utf8")
).golden;
const ARBITRAGE_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "defi-ecosystem", "q-defi-arbitrage-pathpayment-bots.json"), "utf8")
).golden;
const SEQUENCE_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "protocol-core", "q-pc-sequence-numbers-ordering-replace.json"), "utf8")
).golden;

async function judgeWithFakeClaude(modelVerdict, { costUsd = 0.125, promptIncludes = [] } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "qa-fake-claude-"));
  const executable = join(directory, "claude");
  const envelope = JSON.stringify({ result: JSON.stringify(modelVerdict), total_cost_usd: costUsd });
  writeFileSync(
    executable,
    `#!/usr/bin/env node\n` +
      `const prompt = require("node:fs").readFileSync(0, "utf8");\n` +
      `const required = ${JSON.stringify(promptIncludes)};\n` +
      `if (required.some((text) => !prompt.includes(text))) process.exit(23);\n` +
      `process.stdout.write(${JSON.stringify(envelope)});\n`
  );
  chmodSync(executable, 0o755);
  const originalPath = process.env.PATH;
  process.env.PATH = `${directory}:${originalPath}`;
  try {
    return await judgeCase({
      question: "What does a null Scout vertical mean?",
      golden: {
        answer: "It means unmapped, not marketless.",
        keyFacts: ["The vertical is unmapped."],
        avoid: ["Do NOT call the market absent."],
        notes: ""
      },
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped."
    });
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

async function judgeFailureWithFakeClaude({ stdout, stderr, exitCode = 1 }) {
  const directory = mkdtempSync(join(tmpdir(), "qa-failing-claude-"));
  const executable = join(directory, "claude");
  writeFileSync(
    executable,
    `#!/usr/bin/env node\n` +
      `process.stdout.write(${JSON.stringify(stdout)});\n` +
      `process.stderr.write(${JSON.stringify(stderr)});\n` +
      `process.exit(${exitCode});\n`
  );
  chmodSync(executable, 0o755);
  const originalPath = process.env.PATH;
  process.env.PATH = `${directory}:${originalPath}`;
  try {
    return await judgeCase({
      question: "What does a null Scout vertical mean?",
      golden: {
        answer: "It means unmapped, not marketless.",
        keyFacts: ["The vertical is unmapped."],
        avoid: ["Do NOT call the market absent."],
        notes: ""
      },
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped."
    });
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

async function judgeFailureWithRawBytes({ stdout, stderr = Buffer.alloc(0), exitCode = 1 }) {
  const directory = mkdtempSync(join(tmpdir(), "qa-raw-failing-claude-"));
  const executable = join(directory, "claude");
  writeFileSync(
    executable,
    `#!/usr/bin/env node\n` +
      `process.stdout.write(Buffer.from(${JSON.stringify(stdout.toString("base64"))}, "base64"));\n` +
      `process.stderr.write(Buffer.from(${JSON.stringify(stderr.toString("base64"))}, "base64"));\n` +
      `process.exit(${exitCode});\n`
  );
  chmodSync(executable, 0o755);
  const originalPath = process.env.PATH;
  process.env.PATH = `${directory}:${originalPath}`;
  try {
    return await judgeCase({
      question: "What does a null Scout vertical mean?",
      golden: {
        answer: "It means unmapped, not marketless.",
        keyFacts: ["The vertical is unmapped."],
        avoid: ["Do NOT call the market absent."],
        notes: ""
      },
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped."
    });
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

async function judgeWithMissingClaude() {
  const directory = mkdtempSync(join(tmpdir(), "qa-missing-claude-"));
  const originalPath = process.env.PATH;
  process.env.PATH = directory;
  try {
    return await judgeCase({
      question: "What does a null Scout vertical mean?",
      golden: {
        answer: "It means unmapped, not marketless.",
        keyFacts: ["The vertical is unmapped."],
        avoid: ["Do NOT call the market absent."],
        notes: ""
      },
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped."
    });
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

async function judgeSignalWithFakeClaude() {
  const directory = mkdtempSync(join(tmpdir(), "qa-signaled-claude-"));
  const executable = join(directory, "claude");
  writeFileSync(executable, "#!/bin/sh\nkill -TERM $$\n");
  chmodSync(executable, 0o755);
  const originalPath = process.env.PATH;
  process.env.PATH = `${directory}:${originalPath}`;
  try {
    return await judgeCase({
      question: "What does a null Scout vertical mean?",
      golden: {
        answer: "It means unmapped, not marketless.",
        keyFacts: ["The vertical is unmapped."],
        avoid: ["Do NOT call the market absent."],
        notes: ""
      },
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped."
    });
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

async function judgeTimeoutWithFakeClaude() {
  const directory = mkdtempSync(join(tmpdir(), "qa-timeout-claude-"));
  const executable = join(directory, "claude");
  writeFileSync(executable, "#!/bin/sh\nwhile :; do :; done\n");
  chmodSync(executable, 0o755);
  const originalPath = process.env.PATH;
  process.env.PATH = `${directory}:${originalPath}`;
  try {
    return await judgeCase(
      {
        question: "What does a null Scout vertical mean?",
        golden: {
          answer: "It means unmapped, not marketless.",
          keyFacts: ["The vertical is unmapped."],
          avoid: ["Do NOT call the market absent."],
          notes: ""
        },
        tags: { freshness: "stable" },
        candidateAnswer: "The vertical is unmapped."
      },
      { timeoutMs: 50 }
    );
  } finally {
    process.env.PATH = originalPath;
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("QA verdict consistency", () => {
  it("states the v2.7 omission severity without a competing wrong clause", () => {
    const prompt = buildJudgePrompt({
      question: "What does a null Scout vertical mean?",
      golden: NULL_VERTICAL_GOLDEN,
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped.",
      transcriptEvidence: ""
    });

    expect(JUDGE_RUBRIC).toBe("v2.7");
    expect(prompt).toContain(
      '- score = "wrong": the core answer is incorrect, any must-avoid item appears, or (trap cases) the candidate fell for the trap.'
    );
    expect(prompt).not.toContain("most key facts are absent");
  });

  it("preserves bounded CLI evidence and cost when Claude exits nonzero", async () => {
    const stdout = JSON.stringify({
      type: "result",
      subtype: "error_max_turns",
      result: "The judge stopped before grading.",
      total_cost_usd: 0.375
    });
    const stderr = "independent stderr evidence\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict).toMatchObject({
      score: "error",
      costUsd: 0.375,
      rubric: "v2.7",
      packVersion: "p5",
      cliFailure: {
        kind: "nonzero-exit",
        exitStatus: 1,
        signal: null,
        message: expect.stringContaining("exit 1"),
        stdout: {
          excerpt: stdout,
          totalBytes: Buffer.byteLength(stdout),
          sha256: "a178112caf70633d459f6e784bdcd0306f12108c8950e2e74e67360079a03773",
          truncated: false
        },
        stderr: {
          excerpt: stderr,
          totalBytes: Buffer.byteLength(stderr),
          sha256: "8c5c1501950ca14a0ff2e869248644c6295ee99b315484c3f64c08b1ff92597f",
          truncated: false
        },
        parsedEnvelope: {
          excerpt: stdout,
          totalBytes: Buffer.byteLength(stdout),
          sha256: "a178112caf70633d459f6e784bdcd0306f12108c8950e2e74e67360079a03773",
          truncated: false
        }
      }
    });
    expect(verdict).toHaveProperty("promptSha256");
  });

  it("preserves a valid failure envelope when stderr is empty", async () => {
    const stdout = JSON.stringify({ type: "result", subtype: "error", total_cost_usd: 0 });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict.costUsd).toBe(0);
    expect(verdict.cliFailure.stdout.excerpt).toBe(stdout);
    expect(verdict.cliFailure.stderr).toMatchObject({ excerpt: "", totalBytes: 0, truncated: false });
    expect(verdict.cliFailure.parsedEnvelope.excerpt).toBe(stdout);
  });

  it("preserves non-JSON stdout without parsed envelope evidence", async () => {
    const stdout = "plain CLI failure text\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict).not.toHaveProperty("costUsd");
    expect(verdict.cliFailure.stdout.excerpt).toBe(stdout);
    expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
    expect(verdict.cliFailure.message).toContain("plain CLI failure text");
  });

  it("bounds emitted invalid UTF-8 evidence by decoded bytes", async () => {
    const cases = [
      {
        stdout: Buffer.alloc(2_000, 0x80),
        totalBytes: 2_000,
        sha256: "9907f87ade465115c7576b01d7775eb9eab16e4f72295f68c170e04beca5fe72",
        truncated: false
      },
      {
        stdout: Buffer.alloc(4_000, 0x80),
        totalBytes: 4_000,
        sha256: "f98a0f8991f98b0d9a5d362c01e5292f9170b577ea5aeb6691a59651f36c06eb",
        truncated: true
      }
    ];

    for (const entry of cases) {
      const verdict = await judgeFailureWithRawBytes({ stdout: entry.stdout });

      expect(Buffer.byteLength(verdict.cliFailure.stdout.excerpt)).toBeLessThanOrEqual(8_192);
      expect(verdict.cliFailure.stdout).toMatchObject({
        totalBytes: entry.totalBytes,
        sha256: entry.sha256,
        truncated: entry.truncated
      });
    }
  });

  it("returns bounded CLI evidence for a spawn error", async () => {
    const verdict = await judgeWithMissingClaude();

    expect(verdict).toMatchObject({
      score: "error",
      cliFailure: {
        kind: "spawn-error",
        exitStatus: null,
        signal: null,
        stdout: { excerpt: "", totalBytes: 0, truncated: false },
        stderr: { excerpt: "", totalBytes: 0, truncated: false }
      }
    });
    expect(verdict.cliFailure.message).toContain("ENOENT");
    expect(Buffer.byteLength(verdict.cliFailure.message)).toBeLessThanOrEqual(8_192);
    expect(verdict).not.toHaveProperty("costUsd");
  });

  it("classifies signal termination without a process exit status", async () => {
    const verdict = await judgeSignalWithFakeClaude();

    expect(verdict).toMatchObject({
      score: "error",
      cliFailure: {
        kind: "signal",
        exitStatus: null,
        signal: "SIGTERM"
      }
    });
  });

  it("classifies a bounded fake-Claude timeout", async () => {
    const verdict = await judgeTimeoutWithFakeClaude();

    expect(verdict).toMatchObject({
      score: "error",
      cliFailure: {
        kind: "timeout",
        exitStatus: null,
        signal: "SIGTERM"
      }
    });
    expect(verdict.cliFailure.message).toContain("ETIMEDOUT");
  });

  it("bounds large stdout, stderr, message, and parsed envelope evidence", async () => {
    const stdout = JSON.stringify({
      type: "result",
      result: `HEAD-${"x".repeat(12_000)}-TAIL`,
      total_cost_usd: 1.25
    });
    const stderr = `ERR-HEAD-${"y".repeat(12_000)}-ERR-TAIL`;

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.costUsd).toBe(1.25);
    expect(verdict.cliFailure.stdout).toMatchObject({
      totalBytes: 12_061,
      sha256: "128ffbb7de7e5472288a49b792aae02f9b87182efc72f173949f22216f3e5245",
      truncated: true
    });
    expect(verdict.cliFailure.stderr).toMatchObject({
      totalBytes: 12_018,
      sha256: "5cdc71d179690f11c59069884f11d3a2bc8132f5b3fc958e90808a16ec00e096",
      truncated: true
    });
    expect(verdict.cliFailure.parsedEnvelope).toMatchObject({
      totalBytes: 12_061,
      sha256: "128ffbb7de7e5472288a49b792aae02f9b87182efc72f173949f22216f3e5245",
      truncated: true
    });
    for (const evidence of [
      verdict.cliFailure.stdout,
      verdict.cliFailure.stderr,
      verdict.cliFailure.parsedEnvelope
    ]) {
      expect(Buffer.byteLength(evidence.excerpt)).toBeLessThanOrEqual(8_192);
      expect(evidence.excerpt).toContain("…[truncated]…");
    }
    expect(verdict.cliFailure.stdout.excerpt).toMatch(/^\{"type":"result"/);
    expect(verdict.cliFailure.stdout.excerpt).toMatch(/"total_cost_usd":1\.25\}$/);
    expect(verdict.cliFailure.stderr.excerpt).toMatch(/^ERR-HEAD-/);
    expect(verdict.cliFailure.stderr.excerpt).toMatch(/-ERR-TAIL$/);
    expect(Buffer.byteLength(verdict.cliFailure.message)).toBeLessThanOrEqual(8_192);
  });

  it("keeps deterministic UTF-8-safe heads and tails at multibyte cut points", async () => {
    const stdout = "🙂".repeat(3_000);
    const stderr = "é".repeat(5_000);

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.cliFailure.stdout).toMatchObject({
      totalBytes: 12_000,
      sha256: "ed8c867c192fcdeda013585771ae0aaa459de401163d5ec90781fafc6f2b8029",
      truncated: true
    });
    expect(verdict.cliFailure.stderr).toMatchObject({
      totalBytes: 10_000,
      sha256: "349e5086ea495fe725baa7b08612d860e91c5e0dec8e42b4ec5ba1b051700f48",
      truncated: true
    });
    for (const evidence of [verdict.cliFailure.stdout, verdict.cliFailure.stderr]) {
      expect(Buffer.byteLength(evidence.excerpt)).toBeLessThanOrEqual(8_192);
      expect(evidence.excerpt).not.toContain("�");
    }
    expect(verdict.cliFailure.stdout.excerpt).toMatch(/^🙂+/u);
    expect(verdict.cliFailure.stdout.excerpt).toMatch(/🙂+$/u);
    expect(verdict.cliFailure.stderr.excerpt).toMatch(/^é+/u);
    expect(verdict.cliFailure.stderr.excerpt).toMatch(/é+$/u);
  });

  it("produces identical truncation for identical failure streams", async () => {
    const stdout = JSON.stringify({ result: "z".repeat(9_000), total_cost_usd: 0.2 });
    const stderr = "q".repeat(9_000);

    const first = await judgeFailureWithFakeClaude({ stdout, stderr });
    const second = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(second.cliFailure.stdout).toEqual(first.cliFailure.stdout);
    expect(second.cliFailure.stderr).toEqual(first.cliFailure.stderr);
    expect(second.cliFailure.parsedEnvelope).toEqual(first.cliFailure.parsedEnvelope);
  });

  it("preserves ANSI and NUL evidence without parsing malformed JSON", async () => {
    const stdout = "\u001b[31m{\"total_cost_usd\":0.5,\u0000broken\u001b[0m";
    const stderr = "\u001b[33mwarning\u0000detail\u001b[0m";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.cliFailure.stdout.excerpt).toBe(stdout);
    expect(verdict.cliFailure.stderr.excerpt).toBe(stderr);
    expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
    expect(verdict).not.toHaveProperty("costUsd");
  });

  it("omits negative, string, NaN, and infinite failure costs", async () => {
    const cases = [
      { stdout: JSON.stringify({ total_cost_usd: -1 }), parsed: true },
      { stdout: JSON.stringify({ total_cost_usd: "0.5" }), parsed: true },
      { stdout: '{"total_cost_usd":NaN}', parsed: false },
      { stdout: '{"total_cost_usd":Infinity}', parsed: false }
    ];

    for (const entry of cases) {
      const verdict = await judgeFailureWithFakeClaude({ stdout: entry.stdout, stderr: "" });
      expect(verdict).not.toHaveProperty("costUsd");
      if (entry.parsed) expect(verdict.cliFailure).toHaveProperty("parsedEnvelope", expect.any(Object));
      else expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
    }
  });

  it("preserves a stderr-only cost when stdout is not JSON", async () => {
    const stdout = "plain CLI failure text\n";
    const stderr = JSON.stringify({ type: "result", subtype: "error_max_turns", total_cost_usd: 0.42 });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.costUsd).toBe(0.42);
    expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
  });

  it("prefers the stdout cost over stderr and never adds them", async () => {
    const stdout = JSON.stringify({ type: "result", total_cost_usd: 0.3 });
    const stderr = JSON.stringify({ type: "result", total_cost_usd: 0.7 });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.costUsd).toBe(0.3);
    expect(verdict.costUsd).not.toBe(1);
  });

  it("falls back to a valid stderr cost when the stdout cost is invalid", async () => {
    for (const invalidCost of [-1, "0.5", Number.NaN, Number.POSITIVE_INFINITY]) {
      const stdout = JSON.stringify({ type: "result", total_cost_usd: invalidCost });
      const stderr = JSON.stringify({ type: "result", total_cost_usd: 0.6 });

      const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

      expect(verdict.costUsd).toBe(0.6);
    }
  });

  it("omits costUsd when both streams carry only invalid costs", async () => {
    const stdout = JSON.stringify({ type: "result", total_cost_usd: -2 });
    const stderr = JSON.stringify({ type: "result", total_cost_usd: "free" });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict).not.toHaveProperty("costUsd");
  });

  it("excludes prompt and environment fields from all serialized CLI failure evidence", async () => {
    const stdout = JSON.stringify({
      type: "result",
      prompt: "PRIVATE_PROMPT_SENTINEL",
      environment: { TOKEN: "PRIVATE_ENV_SENTINEL" },
      nested: { systemPrompt: "PRIVATE_SYSTEM_SENTINEL", value: "kept" },
      total_cost_usd: 0.1
    });
    const stderr = JSON.stringify({
      level: "fatal",
      prompt: "STDERR_PROMPT_SENTINEL",
      environment: { TOKEN: "STDERR_ENV_SENTINEL" },
      detail: "kept-detail"
    });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    const parsedStdout = JSON.parse(verdict.cliFailure.stdout.excerpt);
    const parsedStderr = JSON.parse(verdict.cliFailure.stderr.excerpt);
    expect(parsedStdout).toEqual({
      type: "result",
      prompt: "[redacted]",
      environment: "[redacted]",
      nested: { systemPrompt: "[redacted]", value: "kept" },
      total_cost_usd: 0.1
    });
    expect(parsedStderr).toEqual({
      level: "fatal",
      prompt: "[redacted]",
      environment: "[redacted]",
      detail: "kept-detail"
    });
    expect(verdict.cliFailure.parsedEnvelope.excerpt).toBe(
      '{"type":"result","prompt":"[redacted]","environment":"[redacted]","nested":{"systemPrompt":"[redacted]","value":"kept"},"total_cost_usd":0.1}'
    );

    const serialized = JSON.stringify(verdict.cliFailure);
    expect(serialized).not.toContain("SENTINEL");
    expect(verdict.cliFailure.message).toContain("exit 1");
  });

  it("redacts structured sensitive keys with unique sentinels across evidence surfaces", async () => {
    const stdout = JSON.stringify({
      type: "result",
      systemPrompt: "STDOUT_SYSTEM_PROMPT_SENTINEL",
      access_token: "STDOUT_ACCESS_TOKEN_SENTINEL",
      apiKey: "STDOUT_APIKEY_SENTINEL",
      Authorization: "STDOUT_AUTHORIZATION_SENTINEL",
      credential: "STDOUT_CREDENTIAL_SENTINEL",
      env: "STDOUT_ENV_SENTINEL",
      environment: "STDOUT_ENVIRONMENT_SENTINEL",
      keptField: "benign-stdout-value"
    });
    const stderr = JSON.stringify({
      level: "fatal",
      password: "STDERR_PASSWORD_SENTINEL",
      api_key: "STDERR_API_KEY_SENTINEL",
      secret: "STDERR_SECRET_SENTINEL",
      detail: "benign-stderr-value"
    });

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    const expectedStdout =
      '{"type":"result","systemPrompt":"[redacted]","access_token":"[redacted]","apiKey":"[redacted]","Authorization":"[redacted]","credential":"[redacted]","env":"[redacted]","environment":"[redacted]","keptField":"benign-stdout-value"}';
    expect(verdict.cliFailure.stdout.excerpt).toBe(expectedStdout);
    expect(verdict.cliFailure.parsedEnvelope.excerpt).toBe(expectedStdout);
    expect(JSON.parse(verdict.cliFailure.stderr.excerpt)).toEqual({
      level: "fatal",
      password: "[redacted]",
      api_key: "[redacted]",
      secret: "[redacted]",
      detail: "benign-stderr-value"
    });
    expect(verdict.cliFailure.message).toContain("exit 1");
    expect(verdict.cliFailure.message).toContain("[redacted]");
    expect(verdict.rationale).toBe(verdict.cliFailure.message);

    const serialized = JSON.stringify(verdict);
    for (const sentinel of [
      "STDOUT_SYSTEM_PROMPT_SENTINEL",
      "STDOUT_ACCESS_TOKEN_SENTINEL",
      "STDOUT_APIKEY_SENTINEL",
      "STDOUT_AUTHORIZATION_SENTINEL",
      "STDOUT_CREDENTIAL_SENTINEL",
      "STDOUT_ENV_SENTINEL",
      "STDOUT_ENVIRONMENT_SENTINEL",
      "STDERR_PASSWORD_SENTINEL",
      "STDERR_API_KEY_SENTINEL",
      "STDERR_SECRET_SENTINEL"
    ]) {
      expect(serialized).not.toContain(sentinel);
    }
  });

  it("redacts plaintext secrets while preserving benign lines", async () => {
    const stdout = "run started\nsystem token: PLAINTEXT_STDOUT_TOKEN_SENTINEL\ndone cleanly\n";
    const stderr = "warning issued\npassword=PLAINTEXT_STDERR_PASSWORD_SENTINEL\nrecovered\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      "run started\nsystem token: [redacted]\ndone cleanly\n"
    );
    expect(verdict.cliFailure.stderr.excerpt).toBe(
      "warning issued\npassword=[redacted]\nrecovered\n"
    );
    expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
    expect(verdict.cliFailure.message).toContain("exit 1");
    expect(verdict.cliFailure.message).toContain("password=[redacted]");
    expect(verdict.rationale).toBe(verdict.cliFailure.message);

    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("PLAINTEXT_STDOUT_TOKEN_SENTINEL");
    expect(serialized).not.toContain("PLAINTEXT_STDERR_PASSWORD_SENTINEL");
    expect(serialized).toContain("done cleanly");
    expect(serialized).toContain("recovered");
  });

  it("redacts full environment assignments across stdout, stderr, message, and rationale", async () => {
    const stdout = "ANTHROPIC_API_KEY=STDOUT_ANTHROPIC_SENTINEL\nOPENAI_API_KEY: STDOUT_OPENAI_SENTINEL\nready\n";
    const stderr = "SECRET_TOKEN=STDERR_SECRET_TOKEN_SENTINEL\nPASSWORD=STDERR_PASSWORD_SENTINEL\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      "ANTHROPIC_API_KEY=[redacted]\nOPENAI_API_KEY: [redacted]\nready\n"
    );
    expect(verdict.cliFailure.stderr.excerpt).toBe(
      "SECRET_TOKEN=[redacted]\nPASSWORD=[redacted]\n"
    );
    expect(verdict.cliFailure.message).toContain("exit 1");
    expect(verdict.cliFailure.message).not.toContain("_SENTINEL");
    expect(verdict.rationale).toBe(verdict.cliFailure.message);

    const serialized = JSON.stringify(verdict);
    for (const sentinel of [
      "STDOUT_ANTHROPIC_SENTINEL",
      "STDOUT_OPENAI_SENTINEL",
      "STDERR_SECRET_TOKEN_SENTINEL",
      "STDERR_PASSWORD_SENTINEL"
    ]) {
      expect(serialized).not.toContain(sentinel);
    }
  });

  it("redacts quoted sensitive keys inside JSONL evidence", async () => {
    const stdout =
      '{"apiKey":"JSONL_API_KEY_SENTINEL","ok":true}\n{"secretToken":"JSONL_SECRET_TOKEN_SENTINEL","row":2}\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      '{"apiKey":"[redacted]","ok":true}\n{"secretToken":"[redacted]","row":2}\n'
    );
    expect(verdict.cliFailure).not.toHaveProperty("parsedEnvelope");
    expect(JSON.stringify(verdict)).not.toContain("JSONL_API_KEY_SENTINEL");
    expect(JSON.stringify(verdict)).not.toContain("JSONL_SECRET_TOKEN_SENTINEL");
  });

  it("redacts interior sensitive segments in complete assignment keys", async () => {
    const stdout =
      "AWS_SECRET_ACCESS_KEY=INTERIOR_AWS_SENTINEL\n" +
      "GITHUB_TOKEN_FILE=INTERIOR_GITHUB_SENTINEL\n" +
      "GOOGLE_APPLICATION_CREDENTIALS=INTERIOR_GOOGLE_SENTINEL\n" +
      "PROMPT_CACHE_KEY=INTERIOR_PROMPT_SENTINEL\n" +
      "release_version=1.2.3\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      "AWS_SECRET_ACCESS_KEY=[redacted]\n" +
        "GITHUB_TOKEN_FILE=[redacted]\n" +
        "GOOGLE_APPLICATION_CREDENTIALS=[redacted]\n" +
        "PROMPT_CACHE_KEY=[redacted]\n" +
        "release_version=1.2.3\n"
    );
    const serialized = JSON.stringify(verdict);
    for (const sentinel of [
      "INTERIOR_AWS_SENTINEL",
      "INTERIOR_GITHUB_SENTINEL",
      "INTERIOR_GOOGLE_SENTINEL",
      "INTERIOR_PROMPT_SENTINEL"
    ]) {
      expect(serialized).not.toContain(sentinel);
    }
    expect(serialized).toContain("release_version=1.2.3");
  });

  it("keeps nested JSONL lines valid JSON after redaction", async () => {
    const stdout =
      '{"environment":{"TOKEN":"NESTED_SENTINEL"},"ok":true}\n' +
      '{"row":2,"secretToken":"NESTED_ROW_SENTINEL"}\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout });

    const lines = verdict.cliFailure.stdout.excerpt.split("\n").filter((line) => line.trim());
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toEqual({ environment: "[redacted]", ok: true });
    expect(JSON.parse(lines[1])).toEqual({ row: 2, secretToken: "[redacted]" });
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("NESTED_SENTINEL");
    expect(serialized).not.toContain("NESTED_ROW_SENTINEL");
  });

  it("redacts plaintext assignment values through the record boundary", async () => {
    const stdout = "PASSWORD=alpha,beta_SENTINEL\nTOKEN=gamma}delta_SENTINEL\nafter=kept\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      "PASSWORD=[redacted]\nTOKEN=[redacted]\nafter=kept\n"
    );
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("beta_SENTINEL");
    expect(serialized).not.toContain("delta_SENTINEL");
    expect(serialized).toContain("after=kept");
  });

  it("redacts comma-bearing assignment values inside parsed JSON strings", async () => {
    const stdout = '{"detail":"PASSWORD=alpha,beta_SENTINEL","kept":1}';

    const verdict = await judgeFailureWithFakeClaude({ stdout });

    expect(verdict.cliFailure.parsedEnvelope.excerpt).toBe(
      '{"detail":"PASSWORD=[redacted]","kept":1}'
    );
    expect(JSON.parse(verdict.cliFailure.stdout.excerpt)).toEqual({
      detail: "PASSWORD=[redacted]",
      kept: 1
    });
    expect(JSON.stringify(verdict)).not.toContain("beta_SENTINEL");
  });

  it("redacts prefixed multiline nested environment objects structurally", async () => {
    const stdout =
      'envdump: {"environment":{\n' +
      '  "TOKEN":"MULTILINE_TOKEN_SENTINEL",\n' +
      '  "note":"MULTILINE_SECRET_SENTINEL"\n' +
      '}}\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout });

    expect(verdict.cliFailure.stdout.excerpt).toBe('envdump: {"environment":"[redacted]"}\n');
    expect(JSON.parse(verdict.cliFailure.stdout.excerpt.slice("envdump: ".length))).toEqual({
      environment: "[redacted]"
    });
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("MULTILINE_TOKEN_SENTINEL");
    expect(serialized).not.toContain("MULTILINE_SECRET_SENTINEL");
  });

  it("redacts common credential names in structured and plaintext surfaces", async () => {
    const stdout =
      "PRIVATE_KEY=PRIVATE_KEY_SENTINEL\n" +
      "AWS_ACCESS_KEY_ID=AWS_ACCESS_SENTINEL\n" +
      "DATABASE_URL=DATABASE_URL_SENTINEL\n" +
      '{"privateKey":"PRIVATE_KEY_SENTINEL","kept":1}\n' +
      "keynote=still-here\naccess_log=/tmp/audit.log\n";

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      "PRIVATE_KEY=[redacted]\n" +
        "AWS_ACCESS_KEY_ID=[redacted]\n" +
        "DATABASE_URL=[redacted]\n" +
        '{"privateKey":"[redacted]","kept":1}\n' +
        "keynote=still-here\naccess_log=/tmp/audit.log\n"
    );
    const lines = verdict.cliFailure.stdout.excerpt.split("\n").filter((line) => line.trim());
    expect(JSON.parse(lines[3])).toEqual({ privateKey: "[redacted]", kept: 1 });
    const serialized = JSON.stringify(verdict);
    for (const sentinel of [
      "PRIVATE_KEY_SENTINEL",
      "AWS_ACCESS_SENTINEL",
      "DATABASE_URL_SENTINEL"
    ]) {
      expect(serialized).not.toContain(sentinel);
    }
    expect(serialized).toContain("keynote=still-here");
    expect(serialized).toContain("access_log=/tmp/audit.log");
  });

  it("sanitizes unmatched-brace evidence in bounded linear time", () => {
    const stdout = `${"{".repeat(32_000)}\nPASSWORD=UNMATCHED_BRACE_SENTINEL\n`;

    const startedAt = performance.now();
    const excerpt = sanitizeCliEvidenceText(stdout);
    const elapsedMs = performance.now() - startedAt;

    expect(elapsedMs).toBeLessThan(250);
    expect(excerpt).toContain("PASSWORD=[redacted]");
    expect(excerpt).not.toContain("UNMATCHED_BRACE_SENTINEL");
  });

  it("redacts quoted sensitive keys inside prefixed JSON evidence", async () => {
    const stdout = 'stderr: {"OPENAI_API_KEY":"PREFIXED_OPENAI_SENTINEL","attempts":1}\ndone\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr: "" });

    expect(verdict.cliFailure.stderr.excerpt).toBe("");
    expect(verdict.cliFailure.stdout.excerpt).toBe(
      'stderr: {"OPENAI_API_KEY":"[redacted]","attempts":1}\ndone\n'
    );
    expect(verdict.cliFailure.message).toContain('"OPENAI_API_KEY":"[redacted]"');
    expect(JSON.stringify(verdict)).not.toContain("PREFIXED_OPENAI_SENTINEL");
  });

  it("redacts mixed plain and quoted secrets in one stream", async () => {
    const stdout =
      'boot ok\n{"token":"MIXED_TOKEN_SENTINEL"}\npassword: MIXED_PASSWORD_SENTINEL\nbye\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout });

    expect(verdict.cliFailure.stdout.excerpt).toBe(
      'boot ok\n{"token":"[redacted]"}\npassword: [redacted]\nbye\n'
    );
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("MIXED_TOKEN_SENTINEL");
    expect(serialized).not.toContain("MIXED_PASSWORD_SENTINEL");
    expect(serialized).toContain("bye");
  });

  it("redacts escaped secret values inside embedded JSON strings", async () => {
    const stdout = '{"detail":"ANTHROPIC_API_KEY=\\"STRUCTURED_ESCAPED_SENTINEL\\"","kept":1}';
    const stderr = 'wrapped: {"msg":"SECRET_TOKEN=\\"PREFIXED_ESCAPED_SENTINEL\\""}\n';

    const verdict = await judgeFailureWithFakeClaude({ stdout, stderr });

    expect(verdict.cliFailure.parsedEnvelope.excerpt).toBe(
      '{"detail":"ANTHROPIC_API_KEY=[redacted]","kept":1}'
    );
    expect(verdict.cliFailure.stderr.excerpt).toBe(
      'wrapped: {"msg":"SECRET_TOKEN=[redacted]"}\n'
    );
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("STRUCTURED_ESCAPED_SENTINEL");
    expect(serialized).not.toContain("PREFIXED_ESCAPED_SENTINEL");
  });

  it("sanitizes and bounds the unparseable-verdict rationale", async () => {
    const leakyResult = `${"filler ".repeat(120)}ANTHROPIC_API_KEY=RATIONALE_LEAK_SENTINEL`;

    const verdict = await judgeWithFakeClaude(leakyResult, { costUsd: 0.4 });

    expect(verdict.score).toBe("error");
    expect(verdict.rationale.startsWith("judge returned unparseable verdict:")).toBe(true);
    expect(Buffer.byteLength(verdict.rationale, "utf8")).toBeLessThanOrEqual(512);
    const serialized = JSON.stringify(verdict);
    expect(serialized).not.toContain("RATIONALE_LEAK_SENTINEL");
    expect(serialized).toContain("[redacted]");
  });

  it("keeps the normal judgeCase success result unchanged", async () => {
    const verdict = await judgeWithFakeClaude(
      {
        rationale: "The candidate gives the required answer.",
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches: [],
        score: "correct"
      },
      { costUsd: 0.25 }
    );

    expect(verdict).toEqual({
      score: "correct",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [],
      rationale: "The candidate gives the required answer.",
      costUsd: 0.25,
      rubric: "v2.7",
      packVersion: "p5",
      promptSha256: verdict.promptSha256
    });
    expect(verdict).not.toHaveProperty("cliFailure");
  });

  it("keeps only finite nonnegative success costs", async () => {
    const modelVerdict = {
      rationale: "The candidate gives the required answer.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [],
      score: "correct"
    };

    for (const costUsd of [0, 1.25]) {
      const verdict = await judgeWithFakeClaude(modelVerdict, { costUsd });
      expect(verdict.costUsd).toBe(costUsd);
    }

    for (const costUsd of [-1, "0.5", Number.NaN, Number.POSITIVE_INFINITY]) {
      const verdict = await judgeWithFakeClaude(modelVerdict, { costUsd });
      expect(verdict).not.toHaveProperty("costUsd");
    }
  });

  it("rejects a wrong score for the omission-only null-vertical verdict", () => {
    const result = checkVerdictConsistency({
      golden: NULL_VERTICAL_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [
          "Evaluate the separate SCF-pitch round block through round.source.",
          "Read returned competitor, maturity, and prior-art blocks on their stated basis."
        ],
        wrongClaims: [],
        score: "wrong"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["omission-only-wrong"] });
  });

  it("does not fire omission-only-wrong when avoidMatches is invalid", () => {
    const result = checkVerdictConsistency({
      golden: NULL_VERTICAL_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: "none",
        missingFacts: [
          "Evaluate the separate SCF-pitch round block through round.source."
        ],
        wrongClaims: [],
        score: "wrong"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-avoid-match"] });
  });

  it("rejects a correct score with a nonempty substantive wrongClaims list", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [],
        wrongClaims: ["Claims PathPayment always routes through a direct pair."],
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["correct-with-wrong-claims"] });
  });

  it("maps a correct score with wrong claims to error and preserves judgeScore", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is right, but one claim is wrong.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: ["Calls the vertical marketless."],
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "correct",
      consistencyViolations: ["correct-with-wrong-claims"]
    });
  });

  it("rejects a partial score when the arbitrage verdict fires an avoid", () => {
    const result = checkVerdictConsistency({
      golden: ARBITRAGE_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [1],
        missingFacts: ["Makes the as-of date visible for every changeable claim."],
        wrongClaims: ["Calls Aquarius rewards a realistic path to profitable small-capital market-making."],
        score: "partial"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["fired-avoid-not-wrong"] });
  });

  it("rejects a partial score for an incorrect core answer", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "incorrect",
        avoidMatches: [],
        missingFacts: ["The answer misses the required core conclusion."],
        wrongClaims: [],
        score: "partial"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["core-incorrect-not-wrong"] });
  });

  it("rejects a missing or invalid core-answer classification", () => {
    const base = { avoidMatches: [], missingFacts: [], wrongClaims: [], score: "correct" };

    for (const verdict of [base, { ...base, coreAnswer: "mostly-correct" }]) {
      expect(checkVerdictConsistency({ golden: { avoid: [] }, verdict })).toEqual({
        ok: false,
        violations: ["invalid-core-answer"]
      });
    }
  });

  it("rejects malformed or out-of-range avoid matches", () => {
    const golden = { avoid: ["avoid one", "avoid two"] };
    const base = { coreAnswer: "correct", missingFacts: [], wrongClaims: [], score: "correct" };

    for (const avoidMatches of ["1", [1, 1], [0], [-1], [1.5], [3]]) {
      expect(checkVerdictConsistency({ golden, verdict: { ...base, avoidMatches } })).toEqual({
        ok: false,
        violations: ["invalid-avoid-match"]
      });
    }
  });

  it("accepts the required omission, minor-slip, fired-avoid, and incorrect-core controls", () => {
    const accepted = [
      {
        golden: NULL_VERTICAL_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["round.source", "competitor and prior-art blocks"],
          wrongClaims: [],
          score: "partial"
        }
      },
      {
        golden: ARBITRAGE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["Makes the as-of date visible for every changeable claim."],
          wrongClaims: ["One minor profitability phrasing slip."],
          score: "partial"
        }
      },
      {
        golden: ARBITRAGE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: ["Promises reliable small-capital profit."],
          score: "wrong"
        }
      },
      {
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims: [],
          score: "wrong"
        }
      },
      {
        golden: SEQUENCE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["The exact 10x fee-bump bid and bounds caveat."],
          wrongClaims: [],
          score: "correct"
        }
      },
      {
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims: [],
          score: "correct"
        }
      }
    ];

    for (const input of accepted) {
      expect(checkVerdictConsistency(input)).toEqual({ ok: true, violations: [] });
    }
  });

  it("rejects a string missingFacts value with a stable invalid-field violation", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: "The candidate omits one detail.",
        wrongClaims: [],
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-missing-facts"] });
  });

  it("rejects non-string-element missingFacts values", () => {
    for (const missingFacts of [[1], [null], [undefined], [{}], [["nested"]]]) {
      expect(
        checkVerdictConsistency({
          golden: { avoid: [] },
          verdict: {
            coreAnswer: "correct",
            avoidMatches: [],
            missingFacts,
            wrongClaims: [],
            score: "correct"
          }
        })
      ).toEqual({ ok: false, violations: ["invalid-missing-facts"] });
    }
  });

  it("rejects a string wrongClaims value with a stable invalid-field violation", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [],
        wrongClaims: "Calls PathPayment always direct.",
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-wrong-claims"] });
  });

  it("rejects non-string-element wrongClaims values without firing claim rules on invalid fields", () => {
    for (const wrongClaims of [[42], [false], [{ text: "wrong" }]]) {
      const result = checkVerdictConsistency({
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims,
          score: "correct"
        }
      });

      expect(result.ok).toBe(false);
      expect(result.violations).toEqual(["invalid-wrong-claims"]);
    }
  });

  it("reports both invalid claim fields in stable order", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: ["not", 2],
        wrongClaims: { length: 1 },
        score: "correct"
      }
    });

    expect(result).toEqual({
      ok: false,
      violations: ["invalid-missing-facts", "invalid-wrong-claims"]
    });
  });

  it("maps a string wrongClaims from the judge to error and keeps returned fields as arrays", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is right.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: "Calls the vertical marketless.",
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "correct",
      consistencyViolations: ["invalid-wrong-claims"]
    });
    expect(Array.isArray(verdict.wrongClaims)).toBe(true);
    expect(Array.isArray(verdict.missingFacts)).toBe(true);
  });

  it("maps non-string-element missingFacts from the judge to error", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "One fact is missing.",
      coreAnswer: "correct",
      missingFacts: [7],
      wrongClaims: [],
      avoidMatches: [],
      score: "partial"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "partial",
      consistencyViolations: ["invalid-missing-facts"],
      missingFacts: []
    });
  });

  it("returns every applicable violation in stable order without using invalid fields", () => {
    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["core-incorrect-not-wrong", "fired-avoid-not-wrong"]
    });

    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "invalid",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["invalid-core-answer", "fired-avoid-not-wrong"]
    });

    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [0],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["invalid-avoid-match", "core-incorrect-not-wrong"]
    });
  });

  it("requests semantic core and avoid fields under rubric v2.7", async () => {
    const verdict = await judgeWithFakeClaude(
      {
        rationale: "The candidate has the correct core answer and fires no avoid.",
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches: [],
        score: "correct"
      },
      {
        costUsd: 0.25,
        promptIncludes: [
          '"coreAnswer": "correct|incorrect"',
          '"avoidMatches": [1]',
          "For trap cases, the graded behavior is the core conclusion.",
          "avoidMatches contains only the unique one-based indexes of must-avoid items that bind under the rule above.",
          "Advisory items never match."
        ]
      }
    );

    expect(verdict).toMatchObject({
      score: "correct",
      costUsd: 0.25,
      rubric: "v2.7",
      packVersion: "p5"
    });
  });

  it("retains core answer and avoid matches on a consistent verdict", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The candidate has the correct core answer and fires no avoid.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({ coreAnswer: "correct", avoidMatches: [] });
    expect(verdict).not.toHaveProperty("judgeScore");
    expect(verdict).not.toHaveProperty("consistencyViolations");
  });

  it("preserves a valid cost when the result text is unparseable", async () => {
    const verdict = await judgeWithFakeClaude("not json at all", { costUsd: 0.4 });

    expect(verdict).toMatchObject({ score: "error", costUsd: 0.4 });
    expect(verdict.rationale).toContain("unparseable verdict");
  });

  it("maps a judge consistency conflict to error without losing cost data", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is correct, but one detail is missing.",
      coreAnswer: "correct",
      missingFacts: ["The candidate omits one detail."],
      wrongClaims: [],
      avoidMatches: [],
      score: "wrong"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "wrong",
      coreAnswer: "correct",
      avoidMatches: [],
      consistencyViolations: ["omission-only-wrong"],
      costUsd: 0.125
    });
  });

  it("passes raw invalid avoid matches to the check but emits []", async () => {
    for (const avoidMatches of [[0], [2], [5], [1.5], ["1"], [1, 1]]) {
      const verdict = await judgeWithFakeClaude({
        rationale: "The model returned an unusable avoid-match list.",
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches,
        score: "correct"
      });

      expect(verdict.score).toBe("error");
      expect(verdict.judgeScore).toBe("correct");
      expect(verdict.consistencyViolations).toContain("invalid-avoid-match");
      expect(verdict.avoidMatches).toEqual([]);
    }
  });

  it("emits [] when an avoid index exceeds the golden range", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The model fired an out-of-range avoid index.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [2],
      score: "wrong"
    });

    expect(verdict.score).toBe("error");
    expect(verdict.consistencyViolations).toContain("invalid-avoid-match");
    expect(verdict.avoidMatches).toEqual([]);

    const direct = checkVerdictConsistency({
      golden: { avoid: ["Only one avoid item."] },
      verdict: {
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches: [2],
        score: "correct"
      }
    });
    expect(direct.ok).toBe(false);
    expect(direct.violations).toContain("invalid-avoid-match");
  });

  it("retains a valid fired avoid index on a non-avoid violation", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is correct and one avoid fired, but the score contradicts.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [1],
      score: "correct"
    });

    expect(verdict.score).toBe("error");
    expect(verdict.consistencyViolations).toContain("fired-avoid-not-wrong");
    expect(verdict.avoidMatches).toEqual([1]);
  });
});
