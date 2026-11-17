/**
 * The case-text ratchet (eval/qa/case-text-scan.mjs): the repository baseline holds, and the scan
 * counts, filters and reports as documented on a synthetic corpus. Failures print paths and counts
 * only; nothing here reads a case into an assertion message.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
