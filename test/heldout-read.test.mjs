/**
 * The counting logic of the held-out launcher (eval/qa/heldout-read.sh): counts only, never an id.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseIds, planCheck, renderSummary, summarize } from "../eval/qa/heldout-read.mjs";

const row = (id, score, extra = {}) => ({
  id,
  tags: extra.trap ? { trap: extra.trap } : {},
  caseInputSha256: extra.sha ?? `sha-${id}`,
  verdict: score ? { score, coreAnswer: extra.core ?? (score === "wrong" ? "incorrect" : "correct") } : undefined
});
const file = (rows, cost = 1.5) => ({ meta: { totalCostUsd: cost }, rows });
const kase = (id, state) => ({ id, truth: state ? { lifecycle: { state } } : {} });

describe("held-out read: ids and plan", () => {
  it("reads ids separated by commas, spaces and newlines", () => {
    expect(parseIds("a,b\nc  d,\n")).toEqual(["a", "b", "c", "d"]);
  });

  it("plans one job per id when every id is an active case", () => {
    expect(planCheck(["a", "b"], [kase("a"), kase("b"), kase("c")])).toBe(2);
  });

  it("stops on an empty list, a duplicate, an unknown id and a quarantined case, with counts and no id", () => {
    const cases = [kase("secret-a"), kase("secret-q", "quarantined")];
    const errors = [];
    for (const ids of [[], ["secret-a", "secret-a"], ["secret-a", "secret-zzz"], ["secret-a", "secret-q"]]) {
      try {
        planCheck(ids, cases);
      } catch (error) {
        errors.push(error.message);
      }
    }
    expect(errors).toHaveLength(4);
    for (const message of errors) expect(message).not.toMatch(/secret-/);
    expect(errors[1]).toMatch(/1 duplicate/);
    expect(errors[2]).toMatch(/1 of 2 ids are not in the battery/);
    expect(errors[3]).toMatch(/1 of 2 ids are quarantined/);
  });
});

describe("held-out read: summary", () => {
  const ids = ["r1", "r2", "r3", "r4", "r5", "r6"];
  const baseline = file([
    row("r1", "correct"),
    row("r2", "partial"),
    row("r3", "wrong"),
    row("r4", "correct", { trap: "injection" }),
    row("r5", "partial", { sha: "changed-in-baseline" }),
    row("r6", "correct"),
    row("not-selected", "wrong")
  ]);
  const results = file(
    [
      row("r1", "partial"), // down
      row("r2", "correct"), // up
      row("r3", "partial"), // left wrong, up
      row("r4", "wrong", { trap: "injection" }), // became wrong, down, trap failed
      row("r5", "correct"), // not paired: case input differs
      row("r6", "correct", { core: "incorrect" }), // same grade
      row("not-selected", "wrong")
    ],
    2.25
  );

  it("counts verdicts, core answers, traps and paired movement on the selected ids only", () => {
    const s = summarize({ results, baseline, ids, planned: 6 });
    expect(s).toMatchObject({
      planned: 6,
      collected: 6,
      judged: 6,
      costUsd: 2.25,
      counts: { correct: 3, partial: 2, wrong: 1, error: 0, unjudged: 0 },
      coreCorrect: 4,
      trapRows: 1,
      trapPassed: 0,
      paired: 5,
      skipped: 1,
      up: 2,
      down: 2,
      becameWrong: 1,
      leftWrong: 1
    });
  });

  it("renders counts and no id", () => {
    const text = renderSummary(summarize({ results, baseline, ids, planned: 6 }));
    expect(text).toContain("jobs planned: 6");
    expect(text).toContain("jobs completed: 6 (judged 6)");
    expect(text).toContain("cost USD: 2.2500");
    expect(text).toContain("trap rows passed (verdict correct): 0 of 1");
    expect(text).toContain("rows up 2, rows down 2, became wrong 1, left wrong 1");
    expect(text).not.toMatch(/\br[1-6]\b|not-selected/);
  });

  it("counts a short run as short and an ungraded row as neither", () => {
    const short = file([row("r1", "correct"), row("r2", undefined)]);
    const s = summarize({ results: short, baseline, ids, planned: 6 });
    expect(s.collected).toBe(2);
    expect(s.judged).toBe(1);
    expect(s.counts.unjudged).toBe(1);
    expect(s.paired).toBe(1);
  });
});

describe("heldout-read.sh", () => {
  it("is valid bash, and echoes no id variable", () => {
    expect(() => execFileSync("bash", ["-n", "eval/qa/heldout-read.sh"])).not.toThrow();
    const source = execFileSync("cat", ["eval/qa/heldout-read.sh"], { encoding: "utf8" });
    expect(source).not.toMatch(/echo[^\n]*\$\{?IDS\b/);
    expect(source).not.toMatch(/set -x/);
    expect(source).toContain("--max-budget-usd 30");
    expect(source).toContain('--max-panel-cases "$N"');
  });

  it("refuses to run with the wrong arguments, printing nothing about ids", () => {
    const run = spawnSync("bash", ["eval/qa/heldout-read.sh", "only-one-argument"], { encoding: "utf8" });
    expect(run.status).toBe(64);
    const dir = mkdtempSync(join(tmpdir(), "heldout-"));
    writeFileSync(join(dir, "ids.txt"), "secret-id-1\nsecret-id-2\n");
    const missing = spawnSync("bash", ["eval/qa/heldout-read.sh", join(dir, "ids.txt"), "8799", join(dir, "nope"), join(dir, "base.json")], { encoding: "utf8" });
    expect(missing.status).not.toBe(0);
    expect(`${missing.stdout}${missing.stderr}`).not.toMatch(/secret-id/);
  });
});
