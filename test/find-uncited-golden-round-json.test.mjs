/**
 * Tests for scripts/find-uncited-golden-round-json.mjs:
 * - Repository invariant: zero uncited JSON files remain in the two golden-round folders.
 * - Synthetic corpus & CLI behavior: full-path, relative-path, sentence-period, and register
 *   citations are kept; partial-name lookalikes do not false-match; candidate files are never read;
 *   stdout/stderr never print file content or case filenames.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { IGNORE_FILES } from "../scripts/agent-hooks/case-search-guard.mjs";
import {
  citationPattern,
  listRoundJsonFiles,
  scanGoldenRoundJson,
} from "../scripts/find-uncited-golden-round-json.mjs";

const REPO = join(import.meta.dirname, "..");
const SCRIPT = join(REPO, "scripts/find-uncited-golden-round-json.mjs");

const rgProbe = spawnSync("rg", ["--version"], { encoding: "utf8" });
const hasRg = rgProbe.status === 0;
if (!hasRg && !process.env.CI) {
  console.warn("find-uncited-golden-round-json tests skipped: ripgrep (rg) is not on PATH; CI installs it and fails without it");
}

describe("citationPattern", () => {
  const re = (rel) => new RegExp(citationPattern(rel));

  it("matches full paths, relative citations, hash fragments, and sentence-ending periods", () => {
    expect(re("map/taxonomy.json").test("(map/taxonomy.json, wallets.unsolicited-assets)")).toBe(true);
    expect(re("audit/audit-assets.json").test(".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-assets.json#q-x")).toBe(true);
    expect(re("pass1/soroban-04.json").test("See .agents/rounds/2026-11-02-golden-audit/pass1/soroban-04.json.")).toBe(true);
    expect(re("pass1/soroban-04.json").test('".agents/rounds/2026-11-02-golden-audit/pass1/soroban-04.json."')).toBe(true);
    expect(re("rejudge-set.json").test("rejudge-set.json")).toBe(true);
  });

  it("rejects partial-name and extension-suffix lookalikes", () => {
    expect(re("gap/gap-1.json").test("gap/gap-1.slots.json")).toBe(false);
    expect(re("gap/gap-1.json").test("other-gap/gap-1.json")).toBe(false);
    expect(re("gap/gap-1.json").test("foo_gap/gap-1.json")).toBe(false);
    expect(re("gap/gap-1.json").test("v2.gap/gap-1.json")).toBe(false);
    expect(re("gap/gap-1.json").test("gap/gap-1.json.bak")).toBe(false);
    expect(re("gap/gap-1.json").test("gap/gap-1.jsonl")).toBe(false);
    expect(re("map/taxonomy.json").test("eval/qa/taxonomy.json")).toBe(false);
  });
});

describe("golden-round JSON citation invariant on the repository", () => {
  it.skipIf(!hasRg && !process.env.CI)("has zero uncited JSON files remaining in the two golden rounds", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    const report = scanGoldenRoundJson({ repoDir: REPO });
    expect(report.summary.cited).toBeGreaterThan(0);
    expect(report.uncited.map((entry) => entry.path)).toEqual([]);
  }, 30_000);
});

describe("find-uncited-golden-round-json on a synthetic repository", () => {
  const CASE_CANARY = "SYNTHETIC_CASE_TEXT_CANARY_9b2e";
  const ROUND_CANARY = "SYNTHETIC_ROUND_BODY_CANARY_4c1d";
  const root = mkdtempSync(join(tmpdir(), "golden-round-flush-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const write = (relPath, content) => {
    mkdirSync(dirname(join(root, relPath)), { recursive: true });
    writeFileSync(join(root, relPath), content);
  };

  // Copy real `.ignore` files so ripgrep sees the exact ignore layout used by the repository.
  for (const ignoreFile of IGNORE_FILES) {
    write(ignoreFile, readFileSync(join(REPO, ignoreFile)));
  }

  // Candidate golden-round JSON files (deliberately non-JSON bytes with a canary prove the script
  // never opens or parses candidate files).
  write(".agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/map/taxonomy.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json", `NOT JSON ${ROUND_CANARY}`);
  write(".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json", `NOT JSON ${ROUND_CANARY}`);
  // Non-JSON file in a round folder should be ignored.
  write(".agents/rounds/2026-11-14-golden-coverage-audit/notes.md", "markdown stays");
  // Symlink in a round folder should be skipped.
  symlinkSync("notes.md", join(root, ".agents/rounds/2026-11-14-golden-coverage-audit/link.json"));

  // Citations in ignored case folders, consistency register, and improvements/.
  write(
    "eval/qa/corpus/battery/a/q-secret-case.json",
    JSON.stringify({
      id: "q-secret-case",
      golden: CASE_CANARY,
      provenance: [
        ".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json#q-secret-case",
        "Verified in .agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json.",
      ],
      lookalikes: ["other-gap/gap-1.json", "gap/gap-1.json.bak", "eval/qa/taxonomy.json"],
    }),
  );
  write(
    "eval/qa/consistency-register.json",
    JSON.stringify({ source: ".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json" }),
  );
  write(
    "improvements/docs/sd-999.md",
    "Relative references: (map/taxonomy.json) and (gap/gap-1.json).\n",
  );
  spawnSync("git", ["init", "-q"], { cwd: root });

  it("lists candidate JSON files without following symlinks or picking up non-JSON", () => {
    const listed = listRoundJsonFiles(root).map((entry) => entry.path);
    expect(listed).toEqual([
      ".agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json",
      ".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/map/taxonomy.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
    ]);
  });

  it.skipIf(!hasRg && !process.env.CI)("classifies cited vs uncited across corpus, register, and improvements without false-matching lookalikes", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    const report = scanGoldenRoundJson({ repoDir: root });
    expect(report.summary).toEqual({ total: 8, cited: 5, uncited: 3 });
    expect(report.cited.map((entry) => entry.path)).toEqual([
      ".agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/map/taxonomy.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json",
    ]);
    expect(report.uncited.map((entry) => entry.path)).toEqual([
      ".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
    ]);

    const gap1 = report.cited.find((entry) => entry.roundRelative === "gap/gap-1.json");
    expect(gap1.byScope).toEqual({ improvements: { files: 1, matches: 1 } });

    const auditA = report.cited.find((entry) => entry.roundRelative === "audit/audit-a.json");
    expect(auditA.byScope).toEqual({ "eval/qa/corpus": { files: 1, matches: 1 } });

    const resweep1 = report.cited.find((entry) => entry.roundRelative === "resweep/resweep-1.json");
    expect(resweep1.byScope).toEqual({ "eval/qa/consistency-register.json": { files: 1, matches: 1 } });
  });

  it.skipIf(!hasRg && !process.env.CI)("never leaks file content or case filenames across all CLI output modes and honors --check", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    const invocations = [
      { args: ["--repo", root], expectedStatus: 0 },
      { args: ["--repo", root, "--uncited"], expectedStatus: 0 },
      { args: ["--repo", root, "--cited"], expectedStatus: 0 },
      { args: ["--repo", root, "--json"], expectedStatus: 0 },
      { args: ["--repo", root, "--uncited", "--check"], expectedStatus: 1 },
    ];
    for (const { args, expectedStatus } of invocations) {
      const cli = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
      expect(cli.status, args.join(" ")).toBe(expectedStatus);
      const combined = `${cli.stdout}\n${cli.stderr}`;
      expect(combined.includes(CASE_CANARY), `case canary leaked for ${args.join(" ")}`).toBe(false);
      expect(combined.includes(ROUND_CANARY), `round canary leaked for ${args.join(" ")}`).toBe(false);
      expect(combined.includes("q-secret-case"), `case filename leaked for ${args.join(" ")}`).toBe(false);
    }

    const uncitedRun = spawnSync(process.execPath, [SCRIPT, "--repo", root, "--uncited"], { encoding: "utf8" });
    expect(uncitedRun.stdout.trim().split("\n")).toEqual([
      ".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
    ]);

    // Remove the uncited files in the synthetic repo and confirm `--check` passes.
    for (const rel of uncitedRun.stdout.trim().split("\n")) {
      rmSync(join(root, rel));
    }
    const cleanRun = spawnSync(process.execPath, [SCRIPT, "--repo", root, "--check"], { encoding: "utf8" });
    expect(cleanRun.status).toBe(0);
    expect(cleanRun.stdout).toContain("5 total, 5 cited, 0 uncited");
  });

  it("rejects malformed CLI arguments with a non-zero exit", () => {
    for (const args of [["--repo"], ["--uncited", "--json"], ["--bogus"]]) {
      const cli = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
      expect(cli.status, args.join(" ")).toBe(1);
      expect(cli.stderr).toMatch(/^find-uncited-golden-round-json failed:/);
    }
  });
});
