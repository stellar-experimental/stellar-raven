/**
 * Tests for scripts/find-uncited-golden-round-json.mjs:
 * - Repository invariant: zero uncited JSON files remain in the two golden-round folders.
 * - Synthetic corpus & CLI behavior: full-path, relative-path, sentence-period, register, hidden-file,
 *   and directory-level citations are kept; partial-name lookalikes do not false-match; missing
 *   scopes and rg errors fail closed without leaking stderr or file content; candidate files are
 *   never read; stdout/stderr never print file content or case filenames.
 */
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IGNORE_FILES } from "../scripts/agent-hooks/case-search-guard.mjs";
import {
  DEFAULT_SEARCH_SCOPES,
  ancestorRoundDirs,
  citationPattern,
  directoryCitationPattern,
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

describe("citationPattern and directoryCitationPattern", () => {
  const fileRe = (rel) => new RegExp(citationPattern(rel));
  const dirRe = (dir) => new RegExp(directoryCitationPattern(dir));

  it("matches full paths, relative citations, hash fragments, and sentence-ending periods", () => {
    expect(fileRe("map/taxonomy.json").test("(map/taxonomy.json, wallets.unsolicited-assets)")).toBe(true);
    expect(fileRe("audit/audit-assets.json").test(".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-assets.json#q-x")).toBe(true);
    expect(fileRe("pass1/soroban-04.json").test("See .agents/rounds/2026-11-02-golden-audit/pass1/soroban-04.json.")).toBe(true);
    expect(fileRe("pass1/soroban-04.json").test('".agents/rounds/2026-11-02-golden-audit/pass1/soroban-04.json."')).toBe(true);
    expect(fileRe("rejudge-set.json").test("rejudge-set.json")).toBe(true);
  });

  it("rejects partial-name and extension-suffix lookalikes", () => {
    expect(fileRe("gap/gap-1.json").test("gap/gap-1.slots.json")).toBe(false);
    expect(fileRe("gap/gap-1.json").test("other-gap/gap-1.json")).toBe(false);
    expect(fileRe("gap/gap-1.json").test("foo_gap/gap-1.json")).toBe(false);
    expect(fileRe("gap/gap-1.json").test("v2.gap/gap-1.json")).toBe(false);
    expect(fileRe("gap/gap-1.json").test("gap/gap-1.json.bak")).toBe(false);
    expect(fileRe("gap/gap-1.json").test("gap/gap-1.jsonl")).toBe(false);
    expect(fileRe("map/taxonomy.json").test("eval/qa/taxonomy.json")).toBe(false);
  });

  it("matches directory citations without matching specific files inside the directory", () => {
    const gapDir = dirRe("2026-11-14-golden-coverage-audit/gap");
    expect(gapDir.test('".agents/rounds/2026-11-14-golden-coverage-audit/gap/"')).toBe(true);
    expect(gapDir.test("See 2026-11-14-golden-coverage-audit/gap/.")).toBe(true);
    expect(gapDir.test("2026-11-14-golden-coverage-audit/gap/*.json")).toBe(true);
    expect(gapDir.test(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json")).toBe(false);
    expect(gapDir.test(".agents/rounds/2026-11-14-golden-coverage-audit/gap/.hidden")).toBe(false);
    expect(gapDir.test("x2026-11-14-golden-coverage-audit/gap/")).toBe(false);
  });

  it("computes ancestor round directories from root to parent", () => {
    expect(
      ancestorRoundDirs({
        roundDir: ".agents/rounds/2026-11-14-golden-coverage-audit",
        roundRelative: "gap/nested/gap-2.json",
      }),
    ).toEqual([
      "2026-11-14-golden-coverage-audit",
      "2026-11-14-golden-coverage-audit/gap",
      "2026-11-14-golden-coverage-audit/gap/nested",
    ]);
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
  let root;

  const write = (relPath, content) => {
    mkdirSync(dirname(join(root, relPath)), { recursive: true });
    writeFileSync(join(root, relPath), content);
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), "golden-round-flush-"));

    // Copy real `.ignore` files so ripgrep sees the exact ignore layout used by the repository.
    for (const ignoreFile of IGNORE_FILES) {
      write(ignoreFile, readFileSync(join(REPO, ignoreFile)));
    }

    // Create every default search scope so fail-closed scope validation passes.
    for (const scope of DEFAULT_SEARCH_SCOPES) {
      if (scope.endsWith(".json")) {
        write(scope, "{}\n");
      } else {
        mkdirSync(join(root, scope), { recursive: true });
      }
    }

    // Candidate golden-round JSON files (deliberately non-JSON bytes with a canary prove the
    // script never opens or parses candidate files).
    write(".agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-02-golden-audit/pass1/cited-hidden.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-2.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/map/taxonomy.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json", `NOT JSON ${ROUND_CANARY}`);
    write(".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json", `NOT JSON ${ROUND_CANARY}`);
    // Non-JSON file in a round folder should be ignored.
    write(".agents/rounds/2026-11-14-golden-coverage-audit/notes.md", "markdown stays");
    // Symlink in a round folder should be skipped.
    symlinkSync("notes.md", join(root, ".agents/rounds/2026-11-14-golden-coverage-audit/link.json"));

    // Citations in ignored case folders (direct file, period-terminated, and directory-level).
    write(
      "eval/qa/corpus/battery/a/q-secret-case.json",
      JSON.stringify({
        id: "q-secret-case",
        golden: CASE_CANARY,
        provenance: [
          ".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json#q-secret-case",
          "Verified in .agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json.",
          ".agents/rounds/2026-11-14-golden-coverage-audit/gap/",
        ],
        lookalikes: ["other-gap/gap-1.json", "gap/gap-1.json.bak", "eval/qa/taxonomy.json"],
      }),
    );
    // Dotfile inside a search scope should be searched when --hidden is enabled.
    write("eval/qa/corpus/.hidden-provenance.txt", "pass1/cited-hidden.json\n");
    write(
      "eval/qa/consistency-register.json",
      JSON.stringify({ source: ".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json" }),
    );
    write("improvements/docs/sd-999.md", "Relative references: (map/taxonomy.json) and (gap/gap-1.json).\n");
    spawnSync("git", ["init", "-q"], { cwd: root });
  });

  afterAll(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it("lists candidate JSON files without following symlinks or picking up non-JSON", () => {
    const listed = listRoundJsonFiles(root).map((entry) => entry.path);
    expect(listed).toEqual([
      ".agents/rounds/2026-11-02-golden-audit/pass1/cited-hidden.json",
      ".agents/rounds/2026-11-02-golden-audit/pass1/cited-period.json",
      ".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/audit/audit-a.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.slots.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-2.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/map/taxonomy.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/resweep/resweep-1.json",
      ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
    ]);
  });

  it.skipIf(!hasRg && !process.env.CI)(
    "classifies direct, hidden, and directory-cited files separately from uncited files without false-matching lookalikes",
    () => {
      expect(hasRg, "ripgrep must be installed in CI").toBe(true);
      const report = scanGoldenRoundJson({ repoDir: root });
      expect(report.summary).toEqual({
        total: 10,
        cited: 8,
        citedDirect: 6,
        citedDirectoryOnly: 2,
        uncited: 2,
      });
      expect(report.uncited.map((entry) => entry.path)).toEqual([
        ".agents/rounds/2026-11-02-golden-audit/pass1/uncited-one.json",
        ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
      ]);

      const gap1 = report.cited.find((entry) => entry.roundRelative === "gap/gap-1.json");
      expect(gap1.byScope).toEqual({ improvements: { files: 1, matches: 1 } });
      expect(gap1.dirCitations).toEqual([
        {
          dir: "2026-11-14-golden-coverage-audit/gap/",
          totalFiles: 1,
          totalMatches: 1,
          byScope: { "eval/qa/corpus": { files: 1, matches: 1 } },
        },
      ]);

      const gap2 = report.cited.find((entry) => entry.roundRelative === "gap/gap-2.json");
      expect(gap2.totalFiles).toBe(0);
      expect(gap2.dirCitations).toHaveLength(1);
      expect(gap2.dirCitations[0].dir).toBe("2026-11-14-golden-coverage-audit/gap/");

      const auditA = report.cited.find((entry) => entry.roundRelative === "audit/audit-a.json");
      expect(auditA.byScope).toEqual({ "eval/qa/corpus": { files: 1, matches: 1 } });

      const resweep1 = report.cited.find((entry) => entry.roundRelative === "resweep/resweep-1.json");
      expect(resweep1.byScope).toEqual({ "eval/qa/consistency-register.json": { files: 1, matches: 1 } });
    },
  );

  it("fails closed when any configured search scope or round directory is missing", () => {
    expect(() => scanGoldenRoundJson({ repoDir: root, searchScopes: ["eval/qa/corpus", "does/not/exist"] })).toThrow(
      /missing search scopes: does\/not\/exist/,
    );
    expect(() => scanGoldenRoundJson({ repoDir: root, searchScopes: [] })).toThrow(/no search scopes/);
    expect(() => scanGoldenRoundJson({ repoDir: root, roundDirs: [".agents/rounds/missing-round"] })).toThrow(
      /missing golden round directories: \.agents\/rounds\/missing-round/,
    );
    const emptyDir = mkdtempSync(join(tmpdir(), "golden-round-empty-"));
    try {
      expect(() => scanGoldenRoundJson({ repoDir: emptyDir })).toThrow(/missing golden round directories/);
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
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
      ".agents/rounds/2026-11-14-golden-coverage-audit/verify/uncited-two.json",
    ]);

    // Remove the uncited files in the synthetic repo and confirm `--check` passes.
    for (const rel of uncitedRun.stdout.trim().split("\n")) {
      rmSync(join(root, rel));
    }
    const cleanRun = spawnSync(process.execPath, [SCRIPT, "--repo", root, "--check"], { encoding: "utf8" });
    expect(cleanRun.status).toBe(0);
    expect(cleanRun.stdout).toContain("8 total, 8 cited (6 direct, 2 directory-only), 0 uncited");
  });

  it("handles --help regardless of flag order and rejects malformed CLI arguments", () => {
    for (const args of [["--help"], ["-h"], ["--help", "--json"], ["--json", "--help"]]) {
      const cli = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
      expect(cli.status, args.join(" ")).toBe(0);
      expect(cli.stdout).toMatch(/^Usage: node scripts\/find-uncited-golden-round-json\.mjs/);
    }
    for (const args of [["--repo"], ["--repo", "--check"], ["--uncited", "--json"], ["--bogus"]]) {
      const cli = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
      expect(cli.status, args.join(" ")).toBe(1);
      expect(cli.stderr).toMatch(/^find-uncited-golden-round-json failed:/);
    }
  });

  it("fails closed on missing rg or rg exit status 2 without leaking stderr content", () => {
    const missingRg = spawnSync(process.execPath, [SCRIPT, "--repo", root], {
      encoding: "utf8",
      env: { PATH: "" },
    });
    expect(missingRg.status).toBe(1);
    expect(missingRg.stderr).toMatch(/failed to run rg:/);

    const stubBin = mkdtempSync(join(tmpdir(), "rg-stub-"));
    const STDERR_CANARY = "SECRET_RG_STDERR_CASE_PATH_88e1";
    try {
      const stubRg = join(stubBin, "rg");
      writeFileSync(stubRg, `#!/bin/sh\necho "${STDERR_CANARY}" >&2\nexit 2\n`);
      chmodSync(stubRg, 0o755);
      const rgError = spawnSync(process.execPath, [SCRIPT, "--repo", root], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${stubBin}:${process.env.PATH ?? ""}` },
      });
      expect(rgError.status).toBe(1);
      expect(rgError.stderr).toContain("rg exited with status 2 (1 stderr line(s) suppressed)");
      expect(rgError.stderr.includes(STDERR_CANARY)).toBe(false);
      expect(rgError.stdout.includes(STDERR_CANARY)).toBe(false);
    } finally {
      rmSync(stubBin, { recursive: true, force: true });
    }
  });
});
