import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const CASES_PATH = join(ROOT, "eval", "qa", "cases.json");
const REJUDGE_PATH = join(ROOT, "eval", "qa", "re-judge.mjs");
const temporaryDirectories: string[] = [];
type SourceCasesVerification = {
  selectedCases: unknown[];
  guard: { matches: boolean } & Record<string, unknown>;
};
type VerifySourceCases = (results: object, sourceResultsPath: string, options?: { casesRef?: string; repoRoot?: string }) => SourceCasesVerification;
type JudgeCostAccounting = (rows: Array<{ new?: { costUsd?: unknown } }>, expectedJudgeCalls: number) => {
  expectedJudgeCalls: number;
  reportedJudgeCalls: number;
  missingJudgeCosts: number;
  totalJudgeCostUsd: number;
};
type RejudgeRows = (options: {
  selectedRows: Array<{ id: string; answer: string; transcript: unknown[]; verdict: { score: string } | null }>;
  caseById: Map<string, Record<string, unknown>>;
  judgeModel: string;
  judge: () => Promise<{ score: string; costUsd: number }>;
  checkpoint: (rows: unknown[]) => void;
  log?: (message: string) => void;
}) => Promise<unknown[]>;

async function loadVerifySourceCases(): Promise<VerifySourceCases> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { verifySourceCases: VerifySourceCases }).verifySourceCases;
}

async function loadJudgeCostAccounting(): Promise<JudgeCostAccounting> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { judgeCostAccounting: JudgeCostAccounting }).judgeCostAccounting;
}

async function loadRejudgeRows(): Promise<RejudgeRows> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { rejudgeRows: RejudgeRows }).rejudgeRows;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function writeResults(verdicts: Array<null | { score: string }>) {
  const battery = JSON.parse(readFileSync(CASES_PATH, "utf8"));
  const selected = battery.cases.slice(0, verdicts.length);
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-"));
  temporaryDirectories.push(directory);
  const resultsPath = join(directory, "results.json");
  writeFileSync(
    resultsPath,
    `${JSON.stringify({
      meta: {
        casesPath: CASES_PATH,
        judgeModel: null,
        judgeRubric: null,
        packVersion: "p3",
        inputSnapshot: { casesSha256: sha256(JSON.stringify(selected)) }
      },
      rows: selected.map((item: { id: string }, index: number) => ({
        id: item.id,
        answer: "Saved answer.",
        transcript: [],
        verdict: verdicts[index]
      }))
    })}\n`
  );
  return { resultsPath, ids: selected.map((item: { id: string }) => item.id) };
}

function writeGitCases(cases: unknown, casesPath = "eval/qa/cases.json") {
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-git-"));
  temporaryDirectories.push(directory);
  const absoluteCasesPath = join(directory, casesPath);
  mkdirSync(join(absoluteCasesPath, ".."), { recursive: true });
  writeFileSync(absoluteCasesPath, `${JSON.stringify(cases)}\n`);
  for (const command of [
    ["init", "--quiet"],
    ["config", "user.email", "test@example.com"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "--quiet", "-m", "cases"]
  ]) {
    const result = spawnSync("git", command, { cwd: directory, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
  }
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" });
  expect(revision.status, revision.stderr).toBe(0);
  return { directory, casesPath, revision: revision.stdout.trim() };
}

function commitGitFile(directory: string, filePath: string, text: string) {
  writeFileSync(join(directory, filePath), text);
  for (const command of [["add", filePath], ["commit", "--quiet", "-m", "update"]]) {
    const result = spawnSync("git", command, { cwd: directory, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
  }
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" });
  expect(revision.status, revision.stderr).toBe(0);
  return revision.stdout.trim();
}

function revisionResults(casesPath: string, ids: string[], expectedCasesSha256: string, caseIdsSha256?: string) {
  return {
    meta: { casesPath, inputSnapshot: { casesSha256: expectedCasesSha256, ...(caseIdsSha256 ? { caseIdsSha256 } : {}) } },
    rows: ids.map((id) => ({ id }))
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("re-judge saved-answer selection", () => {
  it("checkpoints each paid verdict before the next judge call", async () => {
    const rejudgeRows = await loadRejudgeRows();
    const checkpoints: unknown[][] = [];
    let calls = 0;
    const selectedRows = ["one", "two"].map((id) => ({
      id,
      answer: "Saved answer.",
      transcript: [],
      verdict: { score: "correct" }
    }));

    await expect(
      rejudgeRows({
        selectedRows,
        caseById: new Map(selectedRows.map((row) => [row.id, { id: row.id, question: "Question?" }])),
        judgeModel: "stub-judge",
        judge: async () => {
          calls++;
          if (calls === 2) throw new Error("second judge failed");
          return { score: "partial", costUsd: 0.25 };
        },
        checkpoint: (rows) => checkpoints.push(structuredClone(rows)),
        log: () => {}
      })
    ).rejects.toThrow("second judge failed");

    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0]).toMatchObject([
      { id: "one", original: { score: "correct" }, new: { score: "partial", costUsd: 0.25 } }
    ]);
  });

  it("records every expected judge call and only finite reported costs", async () => {
    const judgeCostAccounting = await loadJudgeCostAccounting();

    expect(
      judgeCostAccounting(
        [
          { new: { costUsd: 0.1 } },
          { new: { costUsd: 0.2 } },
          { new: { costUsd: 0 } },
          { new: { costUsd: Number.NaN } },
          { new: { costUsd: Infinity } },
          { new: { costUsd: "0.5" } },
          { new: {} }
        ],
        7
      )
    ).toEqual({
      expectedJudgeCalls: 7,
      reportedJudgeCalls: 3,
      missingJudgeCosts: 4,
      totalJudgeCostUsd: 0.3
    });
  });

  it("loads an absolute saved cases path from the requested Git revision", async () => {
    const verifySourceCases = await loadVerifySourceCases();
    const git = writeGitCases({ cases: [{ id: "one" }, { id: "two" }] });
    const selected = [{ id: "two" }, { id: "one" }];
    writeFileSync(join(git.directory, git.casesPath), JSON.stringify({ cases: [{ id: "one" }, { id: "two", changed: true }] }));
    const results = {
      meta: {
        casesPath: join(git.directory, git.casesPath),
        inputSnapshot: { casesSha256: sha256(JSON.stringify(selected)) }
      },
      rows: selected.map((item) => ({ id: item.id }))
    };

    expect(verifySourceCases(results, join(git.directory, "results.json"), { casesRef: "HEAD", repoRoot: git.directory })).toMatchObject({
      selectedCases: selected,
      guard: { matches: true }
    });
  });

  it("fails closed for an unavailable revision, blob, JSON, selected case, order, or hash", async () => {
    const verifySourceCases = await loadVerifySourceCases();
    const git = writeGitCases({ cases: [{ id: "one" }, { id: "two" }] });
    const selected = [{ id: "one" }, { id: "two" }];
    const sourceResultsPath = join(git.directory, "results.json");
    const verify = (results: object, casesRef = "HEAD") =>
      verifySourceCases(results, sourceResultsPath, { casesRef, repoRoot: git.directory });

    expect(() => verify(revisionResults(git.casesPath, ["one", "two"], sha256(JSON.stringify(selected))), "missing")).toThrow(
      "cases revision missing cannot be resolved"
    );
    expect(() => verify(revisionResults("eval/qa/missing.json", ["one"], sha256(JSON.stringify([{ id: "one" }]))))).toThrow(
      "cases blob eval/qa/missing.json is missing"
    );

    const malformedRevision = commitGitFile(git.directory, git.casesPath, "{");
    expect(() => verify(revisionResults(git.casesPath, ["one"], sha256(JSON.stringify([{ id: "one" }]))), malformedRevision)).toThrow(
      "source cases file is not valid JSON"
    );

    const restoredRevision = commitGitFile(git.directory, git.casesPath, JSON.stringify({ cases: [{ id: "one" }, { id: "two" }] }));
    expect(() => verify(revisionResults(git.casesPath, ["missing"], sha256(JSON.stringify([]))), restoredRevision)).toThrow(
      "revision-pinned case identity guard failed"
    );
    const reversed = [{ id: "two" }, { id: "one" }];
    expect(() => verify(revisionResults(git.casesPath, ["two", "one"], sha256(JSON.stringify(reversed)), "0".repeat(64)), restoredRevision)).toThrow(
      "order matches: false"
    );
    expect(() => verify(revisionResults(git.casesPath, ["one"], "0".repeat(64)), restoredRevision)).toThrow(
      "revision-pinned case identity guard failed"
    );
  });

  it("reads a revision-pinned cases blob larger than one MiB", async () => {
    const verifySourceCases = await loadVerifySourceCases();
    const selected = [{ id: "large", payload: "x".repeat(1_100_000) }];
    const git = writeGitCases({ cases: selected });
    const results = revisionResults(git.casesPath, ["large"], sha256(JSON.stringify(selected)));

    expect(verifySourceCases(results, join(git.directory, "results.json"), { casesRef: "HEAD", repoRoot: git.directory }).guard).toMatchObject({
      matches: true
    });
  });

  it("records revision-pinned case guard details in a dry run", () => {
    const historicalRevision = "70726884a723786c669283953f576277ce9d955b";
    const historicalCases = JSON.parse(
      spawnSync("git", ["show", `${historicalRevision}:eval/qa/corpus/live/live-cases.json`], { cwd: ROOT, encoding: "utf8" }).stdout
    ).cases;
    const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-historical-"));
    temporaryDirectories.push(directory);
    const resultsPath = join(directory, "results.json");
    writeFileSync(
      resultsPath,
      JSON.stringify({
        meta: {
          casesPath: "eval/qa/corpus/live/live-cases.json",
          inputSnapshot: { casesSha256: sha256(JSON.stringify(historicalCases)) }
        },
        rows: historicalCases.map((kase: { id: string }) => ({ id: kase.id, verdict: { score: "correct" } }))
      })
    );

    const result = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--ids", historicalCases[0].id, "--cases-ref", historicalRevision, "--allow-non-identical", "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).guards.historicalCases).toMatchObject({
      requested: historicalRevision,
      resolvedCommit: historicalRevision,
      repositoryRelativeCasesPath: "eval/qa/corpus/live/live-cases.json",
      selectedCasesSha256: sha256(JSON.stringify(historicalCases)),
      guard: { matches: true }
    });
  });

  it("rejects a revision-pinned cases path outside the repository", async () => {
    const verifySourceCases = await loadVerifySourceCases();
    const git = writeGitCases({ cases: [{ id: "one" }] });
    const results = revisionResults(join(git.directory, "..", "outside.json"), ["one"], sha256(JSON.stringify([{ id: "one" }])));

    expect(() => verifySourceCases(results, join(git.directory, "results.json"), { casesRef: "HEAD", repoRoot: git.directory })).toThrow(
      "source results meta.casesPath is outside the repository"
    );
  });

  it("refuses a quarantine source or flips baseline before dry-run processing", () => {
    const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-quarantine-"));
    temporaryDirectories.push(directory);
    const quarantinePath = join(directory, "quarantine.json");
    writeFileSync(quarantinePath, JSON.stringify({ artifactContract: "playground-semantic-quarantine/v1", quarantinedRows: [] }));
    const source = spawnSync(process.execPath, [REJUDGE_PATH, quarantinePath, "--ids", "anything", "--allow-non-identical", "--dry-run"], {
      cwd: ROOT,
      encoding: "utf8"
    });
    expect(source.status).toBe(1);
    expect(source.stderr).toContain("non-promotable playground quarantine");

    const { resultsPath } = writeResults([{ score: "correct" }]);
    const baseline = spawnSync(process.execPath, [REJUDGE_PATH, resultsPath, "--flips-vs", quarantinePath, "--allow-non-identical", "--dry-run"], {
      cwd: ROOT,
      encoding: "utf8"
    });
    expect(baseline.status).toBe(1);
    expect(baseline.stderr).toContain("non-promotable playground quarantine");
  });

  it("labels an all-unjudged --ids dry run as initial judging without spending", () => {
    const { resultsPath, ids } = writeResults([null]);
    const result = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--ids", ids[0]!, "--allow-non-identical", "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ selectedIds: ids, initialJudging: true });
  });

  it("rejects a mixed judged/unjudged --ids selection before any judge call", () => {
    const { resultsPath, ids } = writeResults([{ score: "correct" }, null]);
    const result = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--ids", ids.join(","), "--allow-non-identical", "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("cannot mix saved verdicts with --no-judge rows");
  });
});
