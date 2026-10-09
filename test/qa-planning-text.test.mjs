import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { assessPlanningReview, findPlanningText, scanPlanningText } from "../eval/qa/planning-text.mjs";

const examples = JSON.parse(readFileSync(new URL("./fixtures/qa-planning-text-examples.json", import.meta.url), "utf8"));

describe("offline planning-text diagnostic", () => {
  it.each(examples.examples)("matches the reviewed $id example", ({ answer, planning, reason }) => {
    expect(reason).toBeTruthy();
    expect(findPlanningText(answer).length > 0).toBe(planning);
  });

  it("preserves source offsets through quotation masking", () => {
    const answer = 'The query is "wallet". Let me search the documentation.';
    const [match] = findPlanningText(answer);
    expect(answer.slice(match.start, match.end)).toBe("Let me search");
  });

  it("counts saved rows, scans nested files, and reports a reproducible reviewed sample", () => {
    const root = mkdtempSync(join(tmpdir(), "planning-text-"));
    try {
      mkdirSync(join(root, "nested"));
      const source = JSON.stringify({ rows: [
        { id: "planning", answer: "Let me search the index.", verdict: { score: "correct" } },
        { id: "uncertain", answer: "Now I have complete data from the same dated snapshot.\n\nI cannot verify the date.", transcript: ["Let me search"] },
        { id: "empty", answer: "" }, { id: "missing" }
      ] });
      writeFileSync(join(root, "run.json"), source);
      writeFileSync(join(root, "nested", "repeat.json"), JSON.stringify({ rows: [{ id: "planning", answer: "Let me search the index." }] }));
      writeFileSync(join(root, "plan.json"), JSON.stringify({ answers: ["I'll now call the tool."] }));
      const report = scanPlanningText(root, { sampleSize: 1 });
      expect(report).toEqual(scanPlanningText(root, { sampleSize: 1 }));
      expect(report.counts).toEqual({ jsonFiles: 3, resultFiles: 2, rows: 5, nonEmptyAnswers: 3,
        missingAnswers: 1, emptyAnswers: 1, matchedAnswers: 2, matches: 2, uniqueAnswerTexts: 2,
        firstLineCueAnswers: 3, matchedFirstLineCueAnswers: 2, unmatchedFirstLineCueAnswers: 1 });
      expect(report.sample).toHaveLength(1);
      const review = { inputSha256: report.inputSha256, counts: report.counts,
        summary: { reviewed: 1, planning: 1, falsePositive: 0, uncertain: 0, precision: 1, precisionLower: 1, precisionUpper: 1, coversSample: true },
        rows: report.sample.map((row) => ({ ...row, label: "planning", reason: "The assistant announces a search." })) };
      expect(assessPlanningReview(report, review)).toMatchObject({ planning: 1, precision: 1, coversSample: true });
      expect(() => assessPlanningReview(report, { ...review, inputSha256: "changed" })).toThrow("input hash differs");
      expect(() => assessPlanningReview(report, { ...review, rows: [...review.rows, ...review.rows] })).toThrow("repeats a row");
      expect(() => assessPlanningReview(report, { ...review, rows: [{ ...review.rows[0], answerSha256: "changed" }] })).toThrow("does not match");
      expect(() => assessPlanningReview(report, { ...review, counts: { ...review.counts, matches: 999 } })).toThrow("counts differ");
      expect(() => assessPlanningReview(report, { ...review, summary: { ...review.summary, planning: 999 } })).toThrow("summary differs");
      expect(() => assessPlanningReview(report, { ...review, rows: [] })).toThrow("does not cover the sample");
      expect(readFileSync(join(root, "run.json"), "utf8")).toBe(source);
      const cli = spawnSync(process.execPath, ["eval/qa/planning-text.mjs", root, "--sample-size", "1"], { encoding: "utf8" });
      expect(cli.status, cli.stderr).toBe(0);
      expect(JSON.parse(cli.stdout)).toEqual(report);
      const invalid = spawnSync(process.execPath, ["eval/qa/planning-text.mjs", root, "--sample-size", "-1"], { encoding: "utf8" });
      expect(invalid.status).toBe(1);
      // Keep the review outside the scanned directory to preserve its input hash.
      const reviewDirectory = mkdtempSync(join(tmpdir(), "planning-review-"));
      try {
        const externalReview = join(reviewDirectory, "review.json");
        writeFileSync(externalReview, JSON.stringify({ ...review, summary: { ...review.summary, precision: 0 } }));
        const tampered = spawnSync(process.execPath, ["eval/qa/planning-text.mjs", root, "--sample-size", "1", "--review", externalReview], { encoding: "utf8" });
        expect(tampered.status).toBe(1);
        expect(tampered.stderr).toContain("summary differs");
        writeFileSync(externalReview, JSON.stringify({ ...review, rows: [] }));
        const incomplete = spawnSync(process.execPath, ["eval/qa/planning-text.mjs", root, "--sample-size", "1", "--review", externalReview], { encoding: "utf8" });
        expect(incomplete.status).toBe(1);
        expect(incomplete.stderr).toContain("does not cover the sample");
      } finally { rmSync(reviewDirectory, { recursive: true, force: true }); }
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it("keeps uncertain reviews outside the labeled precision denominator", () => {
    const candidates = ["a", "b", "c"].map((id, rowIndex) => ({ file: "run.json", rowIndex, answerSha256: id }));
    const report = { inputSha256: "hash", counts: { matchedAnswers: 3 }, candidates, sample: candidates };
    const rows = candidates.map((row, index) => ({ ...row, label: ["planning", "falsePositive", "uncertain"][index], reason: "Reviewed example." }));
    const summary = { reviewed: 3, planning: 1,
      falsePositive: 1, uncertain: 1, precision: 0.5, precisionLower: 1 / 3, precisionUpper: 2 / 3, coversSample: true };
    expect(assessPlanningReview(report, { inputSha256: "hash", counts: report.counts, summary, rows })).toEqual(summary);
  });
});
