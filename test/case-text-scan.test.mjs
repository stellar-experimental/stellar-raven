/**
 * The case-text ratchet (eval/qa/case-text-scan.mjs): the repository baseline holds, and the scan
 * counts, filters and reports as documented on a synthetic corpus. Failures print paths and counts
 * only; nothing here reads a case into an assertion message.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  BASELINE_PATH,
  BREACH_HELP,
  FLOOR,
  MAX_CASES_PER_SHINGLE,
  SHINGLE_WORDS,
  baselineBreaches,
  ceilingFor,
  displayPath,
  scanCaseText,
} from "../eval/qa/case-text-scan.mjs";
import { IGNORE_FILES } from "../scripts/agent-hooks/case-search-guard.mjs";

const REPO = join(import.meta.dirname, "..");
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));

describe("case-text ratchet on the repository", () => {
  it("has no file at the floor that the baseline does not list, and none above its ceiling", () => {
    const { rows } = scanCaseText(REPO);
    const breaches = baselineBreaches(rows, baseline);
    // Paths and counts only. The help line says what to do instead of quoting.
    expect(breaches, BREACH_HELP).toEqual([]);
  }, 30_000);

  it("pins the scan parameters the baseline was measured with", () => {
    expect(baseline.shingleWords).toBe(SHINGLE_WORDS);
    expect(baseline.maxCasesPerShingle).toBe(MAX_CASES_PER_SHINGLE);
    expect(baseline.floor).toBe(FLOOR);
    for (const file of baseline.files) {
      expect(file.ceiling).toBeGreaterThanOrEqual(FLOOR);
      expect(Object.keys(file).sort()).toEqual(["ceiling", "path", ...(file.reason ? ["reason"] : [])].sort());
    }
  });
});

describe("case-text scan on a synthetic corpus", () => {
  const root = mkdtempSync(join(tmpdir(), "case-text-scan-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  // Distinct synthetic words so no shingle repeats by accident.
  const run = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}w${i}`).join(" ");
  const own = run("alpha", 70);
  const shared = run("shared", 20);

  for (const file of IGNORE_FILES) write(file, readFileSync(join(REPO, file)));
  write("eval/qa/corpus/battery/a/one.json", JSON.stringify({ id: "one", question: "ignored", golden: `${own} ${shared}`, truth: { notes: "" } }));
  write("eval/qa/corpus/battery/a/two.json", JSON.stringify({ id: "two", golden: shared, truth: { notes: run("beta", 12) } }));
  write("eval/qa/corpus/battery/a/three.json", JSON.stringify({ id: "three", golden: shared, truth: { notes: "" } }));
  write("record.md", `A ledger note that copies the answer: ${own}\n`);
  write("brief.md", `A short quote: ${run("alpha", 12)}\n`);
  write("shared-only.md", `${shared}\n`);
  write("eval/qa/reviewed/copy.md", `${own}\n`);
  write("eval/qa/cases.json", JSON.stringify({ golden: own }));
  spawnSync("git", ["init", "-q"], { cwd: root });
  const { cases, rows } = scanCaseText(root);
  const count = (path) => rows.find((row) => row.path === path)?.shingles ?? 0;

  it("counts shingles that a file repeats from golden text", () => {
    expect(cases).toBe(3);
    expect(count("record.md")).toBe(70 - SHINGLE_WORDS + 1);
    expect(count("brief.md")).toBe(12 - SHINGLE_WORDS + 1);
  });

  it("leaves out shingles shared by three cases and every path the .ignore files list", () => {
    expect(count("shared-only.md")).toBe(0);
    expect(count("eval/qa/reviewed/copy.md")).toBe(0);
    expect(count("eval/qa/cases.json")).toBe(0);
  });

  it("reports a file at the floor that is not listed, a file over its ceiling, and a stale entry, by path and count", () => {
    const empty = { floor: FLOOR, files: [] };
    expect(baselineBreaches(rows, empty)).toEqual([`record.md: 63 golden shingles, floor ${FLOOR}, not in the baseline`]);
    const listed = { floor: FLOOR, files: [{ path: "record.md", ceiling: 62 }, { path: "gone.md", ceiling: 60 }] };
    expect(baselineBreaches(rows, listed)).toEqual([
      "record.md: 63 golden shingles, above its ceiling 62",
      "gone.md: listed in the baseline but absent or clean; remove the entry",
    ]);
    expect(baselineBreaches(rows, { floor: FLOOR, files: [{ path: "record.md", ceiling: ceilingFor(63) }] })).toEqual([]);
  });

  it("gives headroom of a quarter, at least ten", () => {
    expect(ceilingFor(50)).toBe(63);
    expect(ceilingFor(325)).toBe(407);
    expect(ceilingFor(4)).toBe(14);
  });
});

function syntheticRepo(label) {
  const root = mkdtempSync(join(tmpdir(), `case-text-${label}-`));
  const write = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  for (const file of IGNORE_FILES) write(file, readFileSync(join(REPO, file)));
  spawnSync("git", ["init", "-q"], { cwd: root });
  return { root, write };
}

describe("case-text scan file names", () => {
  const { root, write } = syntheticRepo("names");
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const golden = Array.from({ length: 70 }, (_, i) => `namew${i}`).join(" ");
  write("eval/qa/corpus/battery/a/one.json", JSON.stringify({ id: "one", golden, truth: { notes: "" } }));
  const names = ["plain.md", "résumé.md", 'quoted"name.md', "line\nbreak.md", "with space.md"];
  for (const name of names) write(name, golden);
  write("gone.md", golden);
  spawnSync("git", ["add", "gone.md"], { cwd: root });
  rmSync(join(root, "gone.md"));
  symlinkSync("eval", join(root, "link-to-folder"));
  const { rows } = scanCaseText(root);

  it("counts a bulk copy under every kind of file name, and skips a deleted file and a symlink", () => {
    for (const name of names) expect(rows.find((row) => row.path === name)?.shingles, displayPath(name)).toBe(63);
    expect(rows.some((row) => row.path === "gone.md" || row.path === "link-to-folder")).toBe(false);
  });

  it("prints no raw newline or quote from a file name in a diagnostic", () => {
    const lines = baselineBreaches(rows, { floor: FLOOR, files: [] });
    expect(lines).toHaveLength(names.length);
    for (const line of lines) expect(line).not.toMatch(/[\n\r]/);
    expect(displayPath("line\nbreak.md")).toBe('"line\\nbreak.md"');
    expect(displayPath("plain.md")).toBe("plain.md");
  });
});

describe("case-text scan on a malformed corpus file", () => {
  const MARKER = "SYNTHETIC_PRIVATE_CASE_TEXT_7f3a";
  const { root, write } = syntheticRepo("malformed");
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  write("eval/qa/corpus/battery/a/good.json", JSON.stringify({ id: "good", golden: "fine words only here", truth: { notes: "" } }));
  write("eval/qa/corpus/battery/b/bad.json", `${MARKER} not json {`);
  const scanModule = join(REPO, "eval/qa/case-text-scan.mjs");

  it("throws a position-only error with no cause", () => {
    let thrown;
    try {
      scanCaseText(root);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.message.includes(MARKER)).toBe(false);
    expect(thrown.message.includes("bad")).toBe(false);
    expect(thrown.message).toMatch(/malformed battery case file #2 of 2 in folder b/);
    expect(thrown.cause).toBeUndefined();
  });

  it("keeps the marker out of stdout and stderr through the API and the CLI, and exits non-zero", () => {
    const api = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", `import { scanCaseText } from ${JSON.stringify(scanModule)}; scanCaseText(process.argv[1]);`, root],
      { encoding: "utf8" },
    );
    expect(api.status).not.toBe(0);
    expect(api.stdout.includes(MARKER) || api.stderr.includes(MARKER)).toBe(false);
    for (const args of [["--repo", root], ["--check", "--repo", root]]) {
      const cli = spawnSync(process.execPath, [scanModule, ...args], { encoding: "utf8" });
      expect(cli.status, args.join(" ")).toBe(1);
      expect(cli.stdout.includes(MARKER) || cli.stderr.includes(MARKER), args.join(" ")).toBe(false);
      expect(cli.stderr).toMatch(/^case-text scan failed: malformed battery case file #2 of 2/);
    }
  });

  it("treats valid JSON that is not a case the same way", () => {
    write("eval/qa/corpus/battery/b/bad.json", JSON.stringify(MARKER));
    const cli = spawnSync(process.execPath, [scanModule, "--repo", root], { encoding: "utf8" });
    expect(cli.status).toBe(1);
    expect(cli.stdout.includes(MARKER) || cli.stderr.includes(MARKER)).toBe(false);
  });
});

