import { execFile } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "qa", "register-helper.mjs");

function runCli(cwd, args) {
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" }, (error, stdout, stderr) => {
      const status = error && typeof error.code === "number" ? error.code : error ? null : 0;
      resolve({ status, stdout, stderr });
    });
  });
}

describe("QA register CLI", () => {
  it.concurrent("hashes raw bytes and keeps --check read-only", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-cli-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      writeFileSync(register, '{"clusters":[{"id":"temp","members":["q-temp"]}]}\n');
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-07-28", ...args
      ]);

      expect((await run()).status).toBe(0);
      const baseline = readFileSync(register, "utf8");
      const firstHash = JSON.parse(baseline).clusters[0].memberContentSha256["q-temp"];
      writeFileSync(join(corpus, "case.json"), '{ "id": "q-temp" }\n');

      const check = await run("--check");
      expect(check.status).toBe(1);
      expect(check.stdout).toContain("changes required");
      expect(readFileSync(register, "utf8")).toBe(baseline);

      expect((await run()).status).toBe(0);
      const updated = readFileSync(register, "utf8");
      expect(JSON.parse(updated).clusters[0].memberContentSha256["q-temp"]).not.toBe(firstHash);
      expect(readdirSync(root).some((name) => name.endsWith(".tmp"))).toBe(false);
      expect((await run("--check")).status).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.concurrent("applies reviewed closures without changing generated member hashes", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-review-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      const review = join(root, "review.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      writeFileSync(register, JSON.stringify({
        clusters: [{
          id: "temp",
          members: ["q-temp"],
          verdict: "reopen",
          lastChecked: "2026-09-01",
          reopened: { date: "2026-09-02", reason: "member-content-changed" }
        }]
      }));
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-09-02", ...args
      ]);
      expect((await run("--seed")).status).toBe(0);
      const hash = JSON.parse(readFileSync(register, "utf8")).clusters[0].memberContentSha256["q-temp"];
      writeFileSync(review, JSON.stringify({
        clusters: [{
          id: "temp",
          verdict: "consistent",
          lastChecked: "2026-09-02",
          reSwept: { date: "2026-09-02", reason: "Reviewed.", verdict: "consistent" },
          clearReopened: true
        }]
      }));

      const applied = await run("--review", review);
      expect(applied.status).toBe(0);
      const closed = JSON.parse(readFileSync(register, "utf8")).clusters[0];
      expect(closed.verdict).toBe("consistent");
      expect(closed.reopened).toBeUndefined();
      expect(closed.memberContentSha256["q-temp"]).toBe(hash);
      expect((await run("--check")).status).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.concurrent("rejects unsafe reviewed closures without writing the register", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-review-reject-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      const review = join(root, "review.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      writeFileSync(register, JSON.stringify({
        clusters: [{
          id: "temp",
          members: ["q-temp"],
          verdict: "reopen",
          reopened: { date: "2026-09-02", reason: "member-content-changed" }
        }]
      }));
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-09-02", ...args
      ]);
      const writeReview = (overrides = {}) => writeFileSync(review, JSON.stringify({
        clusters: [{
          id: "temp",
          verdict: "consistent",
          lastChecked: "2026-09-02",
          reSwept: { date: "2026-09-02", reason: "Reviewed.", verdict: "consistent" },
          clearReopened: true,
          ...overrides
        }]
      }));
      const rejectWithoutWrite = async (args, message, expected = readFileSync(register, "utf8")) => {
        const result = await run(...args);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(message);
        expect(readFileSync(register, "utf8")).toBe(expected);
      };

      expect((await run("--seed")).status).toBe(0);
      let baseline = readFileSync(register, "utf8");

      writeReview({ verdict: "reopen" });
      await rejectWithoutWrite(["--review", review], "review verdict must be consistent", baseline);

      writeReview({ clearReopened: false });
      await rejectWithoutWrite(["--review", review], "clearReopened must be true", baseline);

      writeReview({ reSwept: {} });
      await rejectWithoutWrite(["--review", review], "reSwept.date must match lastChecked", baseline);

      writeReview();
      await rejectWithoutWrite(["--check", "--review", review], "--review cannot be combined with --check", baseline);
      await rejectWithoutWrite(["--seed", "--review", review], "--review cannot be combined with --seed", baseline);

      writeFileSync(join(corpus, "case.json"), '{ "id": "q-temp" }\n');
      await rejectWithoutWrite(["--review", review], "cannot apply a review while member changes are unstamped", baseline);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');

      expect((await run("--review", review)).status).toBe(0);
      baseline = readFileSync(register, "utf8");
      await rejectWithoutWrite(["--review", review], "target must be reopened", baseline);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.concurrent("applies a date-trap review once and rejects ambiguous matches", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-trap-review-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      const review = join(root, "review.json");
      const oldTrigger = "2026-09-01 review";
      const newTrigger = "2026-12-01 review";
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      writeFileSync(register, JSON.stringify({
        dateContingentTraps: {
          entries: [{
            triggerDateEvent: oldTrigger,
            caseIds: ["q-temp"],
            verdict: "reopen",
            reopened: { date: "2026-09-02", reason: "member-content-changed" }
          }]
        }
      }));
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-09-02", ...args
      ]);
      writeFileSync(review, JSON.stringify({
        dateContingentTraps: [{
          matchTriggerDateEvent: oldTrigger,
          triggerDateEvent: newTrigger,
          disposition: "open",
          verdict: "consistent",
          lastChecked: "2026-09-02",
          reSwept: { date: "2026-09-02", reason: "Reviewed.", verdict: "consistent" },
          clearReopened: true
        }]
      }));

      expect((await run("--seed")).status).toBe(0);
      expect((await run("--review", review)).status).toBe(0);
      const closed = JSON.parse(readFileSync(register, "utf8")).dateContingentTraps.entries[0];
      expect(closed.triggerDateEvent).toBe(newTrigger);
      expect(closed.disposition).toBe("open");
      expect(closed.verdict).toBe("consistent");

      const closedBytes = readFileSync(register, "utf8");
      const repeated = await run("--review", review);
      expect(repeated.status).toBe(1);
      expect(repeated.stderr).toContain("expected one match, found 0");
      expect(readFileSync(register, "utf8")).toBe(closedBytes);

      const hash = closed.memberContentSha256["q-temp"];
      writeFileSync(register, JSON.stringify({
        dateContingentTraps: {
          entries: ["a", "b"].map((suffix) => ({
            triggerDateEvent: oldTrigger,
            requiredRecheck: suffix,
            caseIds: ["q-temp"],
            verdict: "reopen",
            reopened: { date: "2026-09-02", reason: "member-content-changed" },
            memberContentSha256: { "q-temp": hash }
          }))
        }
      }));
      const ambiguousBytes = readFileSync(register, "utf8");
      const ambiguous = await run("--review", review);
      expect(ambiguous.status).toBe(1);
      expect(ambiguous.stderr).toContain("expected one match, found 2");
      expect(readFileSync(register, "utf8")).toBe(ambiguousBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.concurrent("closes a reviewed numeric invariant once while preserving its value and member hashes", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-numeric-review-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      const review = join(root, "review.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      writeFileSync(register, JSON.stringify({ numericInvariants: { entries: [{
        label: "Activation history", authoritativeValue: "An unchanged dated boundary",
        affectedCaseIds: ["q-temp"], verdict: "reopen",
        reopened: { date: "2026-09-02", reason: "member-content-changed" }
      }] } }));
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-09-02", ...args
      ]);
      expect((await run("--seed")).status).toBe(0);
      const baseline = JSON.parse(readFileSync(register, "utf8")).numericInvariants.entries[0];
      const closure = {
        matchLabel: "Activation history", verdict: "consistent", lastChecked: "2026-09-02",
        reSwept: { date: "2026-09-02", reason: "Independent boundary review.", verdict: "consistent" },
        clearReopened: true
      };
      const baselineBytes = readFileSync(register, "utf8");
      for (const field of ["triggerDateEvent", "disposition", "authoritativeValue", "memberContentSha256"]) {
        writeFileSync(review, JSON.stringify({ numericInvariants: [{ ...closure, [field]: "unexpected" }] }));
        const rejected = await run("--review", review);
        expect(rejected.status).toBe(1);
        expect(rejected.stderr).toContain(`unsupported review field ${field}`);
        expect(readFileSync(register, "utf8")).toBe(baselineBytes);
      }
      writeFileSync(review, JSON.stringify({ numericInvariants: [closure] }));
      expect((await run("--review", review)).status).toBe(0);
      const closedBytes = readFileSync(register, "utf8");
      const closed = JSON.parse(closedBytes).numericInvariants.entries[0];
      expect(closed.verdict).toBe("consistent");
      expect(closed.reopened).toBeUndefined();
      expect(closed.authoritativeValue).toBe(baseline.authoritativeValue);
      expect(closed.memberContentSha256).toEqual(baseline.memberContentSha256);
      expect((await run("--check")).status).toBe(0);
      expect((await run("--review", review)).stderr).toContain("target must be reopened");
      expect(readFileSync(register, "utf8")).toBe(closedBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.concurrent("rejects ambiguous numeric labels and unsupported review collections without writing", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-numeric-reject-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      const review = join(root, "review.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"id":"q-temp"}\n');
      const invariant = {
        label: "Duplicated label", affectedCaseIds: ["q-temp"], verdict: "reopen",
        reopened: { date: "2026-09-02", reason: "member-content-changed" }
      };
      writeFileSync(register, JSON.stringify({ numericInvariants: { entries: [invariant, invariant] } }));
      const run = (...args) => runCli(root, [
        "--corpus", corpus, "--register", register, "--date", "2026-09-02", ...args
      ]);
      expect((await run("--seed")).status).toBe(0);
      const baseline = readFileSync(register, "utf8");
      const closure = {
        matchLabel: "Duplicated label", verdict: "consistent", lastChecked: "2026-09-02",
        reSwept: { date: "2026-09-02", reason: "Reviewed.", verdict: "consistent" }, clearReopened: true
      };
      for (const [payload, message] of [
        [{ numericInvariants: [closure] }, "expected one match, found 2"],
        [{ numericInvariants: [{ ...closure, matchLabel: "Missing" }] }, "expected one match, found 0"],
        [{ numericInvariants: [{ ...closure, matchLabel: "" }] }, "requires matchLabel"],
        [{ numericInvariant: [closure] }, "unsupported review collection"],
        [{ numericInvariants: {} }, "must be an array"]
      ]) {
        writeFileSync(review, JSON.stringify(payload));
        const result = await run("--review", review);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(message);
        expect(readFileSync(register, "utf8")).toBe(baseline);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("QA register CLI output", () => {
  it.concurrent("names a malformed case file without printing its text", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-register-malformed-"));
    try {
      const corpus = join(root, "corpus");
      const register = join(root, "register.json");
      mkdirSync(corpus);
      writeFileSync(join(corpus, "case.json"), '{"question": ZQXMARKER}\n');
      writeFileSync(register, '{"clusters":[]}\n');
      const result = await runCli(root, ["--corpus", corpus, "--register", register, "--check"]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/\[register-helper\] ERROR: .*case\.json: invalid JSON/);
      expect(`${result.stdout}${result.stderr}`).not.toContain("ZQXMARKER");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
