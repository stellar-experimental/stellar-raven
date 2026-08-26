import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
type EffectiveVerdictScore = (verdict: { score?: string; judgeScore?: string } | null) => string | undefined;
type StoredVerdict = { score?: string; judgeScore?: string } | null | undefined;
type VerdictAgreement = (original: StoredVerdict, next: StoredVerdict) => boolean | null;
type ResolveCasesRef = (results: object, explicit?: string) => string | undefined;

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

async function loadEffectiveVerdictScore(): Promise<EffectiveVerdictScore> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { effectiveVerdictScore: EffectiveVerdictScore }).effectiveVerdictScore;
}

async function loadVerdictAgreement(): Promise<VerdictAgreement> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { verdictAgreement: VerdictAgreement }).verdictAgreement;
}

async function loadResolveCasesRef(): Promise<ResolveCasesRef> {
  const modulePath = "../eval/qa/re-judge.mjs";
  return (await import(modulePath) as { resolveCasesRef: ResolveCasesRef }).resolveCasesRef;
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

async function writeGoldenDriftResult() {
  const tuple = await loadJudgeTuple();
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-time-"));
  temporaryDirectories.push(directory);
  const kase = {
    id: "q-live-newer-golden",
    question: "What is current?",
    golden: { answer: "Current answer.", keyFacts: ["Current fact."], avoid: [], notes: "" },
    tags: { freshness: "live" },
    truth: { asOf: "2026-08-26", verified: { date: "2026-08-26" } }
  };
  const casesPath = join(directory, "cases.json");
  writeFileSync(casesPath, `${JSON.stringify({ cases: [kase] })}\n`);
  const resultsPath = join(directory, "results.json");
  writeFileSync(
    resultsPath,
    `${JSON.stringify({
      meta: {
        casesPath,
        ...tuple,
        finishedAt: "2026-08-25T23:59:59.000Z",
        inputSnapshot: { casesSha256: sha256(JSON.stringify([kase])) }
      },
      rows: [{
        id: kase.id,
        answer: "Saved answer.",
        transcript: [],
        agent: { failure: null },
        verdict: { score: "correct" }
      }]
    })}\n`
  );
  return { resultsPath, id: kase.id };
}

type JudgeTuple = { judgeModel: string; judgeRubric: string; packVersion: string };

async function loadJudgeTuple(): Promise<JudgeTuple> {
  const judgePath = "../eval/qa/judge.mjs";
  const packPath = "../eval/qa/evidence-pack.mjs";
  const judge = (await import(judgePath)) as { JUDGE_MODEL: string; JUDGE_RUBRIC: string };
  const pack = (await import(packPath)) as { PACK_VERSION: string };
  return { judgeModel: judge.JUDGE_MODEL, judgeRubric: judge.JUDGE_RUBRIC, packVersion: pack.PACK_VERSION };
}

// A source and a baseline over the same single case, both identical to the
// current corpus and judge tuple unless `baselineMeta` drifts the baseline.
function writeFlipsPair(tuple: JudgeTuple, baselineMeta: Record<string, unknown> = {}) {
  const battery = JSON.parse(readFileSync(CASES_PATH, "utf8"));
  const selected = battery.cases.slice(0, 1);
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-flips-"));
  temporaryDirectories.push(directory);
  const identicalMeta = {
    casesPath: CASES_PATH,
    ...tuple,
    inputSnapshot: { casesSha256: sha256(JSON.stringify(selected)) }
  };
  const rows = (score: string) =>
    selected.map((item: { id: string }) => ({
      id: item.id,
      answer: "Saved answer.",
      transcript: [],
      verdict: { score }
    }));
  const resultsPath = join(directory, "results.json");
  const baselinePath = join(directory, "baseline.json");
  writeFileSync(resultsPath, `${JSON.stringify({ meta: identicalMeta, rows: rows("correct") })}\n`);
  writeFileSync(
    baselinePath,
    `${JSON.stringify({ meta: { ...identicalMeta, ...baselineMeta }, rows: rows("partial") })}\n`
  );
  return { resultsPath, baselinePath, ids: selected.map((item: { id: string }) => item.id) };
}

// PATH for a refusal test: `claude` exists but fails immediately, so a missed
// guard shows up as a wrong exit status instead of a paid judge call.
// A source and a baseline that each reproduce their own snapshot, but whose
// shared case id carries different content. Only a cross-comparison catches it.
function writeDivergentCasesPair(tuple: JudgeTuple, id = "shared-drift-case") {
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-drift-"));
  temporaryDirectories.push(directory);
  const write = (name: string, question: string, score: string) => {
    const kase = { id, question, golden: { answer: question, keyFacts: [], avoid: [], notes: "" } };
    const casesPath = join(directory, `${name}-cases.json`);
    writeFileSync(casesPath, `${JSON.stringify({ cases: [kase] })}\n`);
    const resultsPath = join(directory, `${name}.json`);
    writeFileSync(
      resultsPath,
      `${JSON.stringify({
        meta: { casesPath, ...tuple, inputSnapshot: { casesSha256: sha256(JSON.stringify([kase])) } },
        rows: [{ id, answer: "Saved answer.", transcript: [], verdict: { score } }]
      })}\n`
    );
    return resultsPath;
  };
  return { resultsPath: write("results", "Question as judged in the source.", "correct"), baselinePath: write("baseline", "A different question under the same id.", "partial") };
}

function stubClaudeDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "raven-rejudge-stub-"));
  temporaryDirectories.push(directory);
  const executable = join(directory, "claude");
  writeFileSync(executable, "#!/bin/sh\nexit 70\n");
  chmodSync(executable, 0o755);
  return directory;
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
  it("defaults the cases revision to the recorded runner revision", async () => {
    const resolveCasesRef = await loadResolveCasesRef();
    const recorded = "a".repeat(40);

    expect(resolveCasesRef({ meta: { sourceIdentity: { runnerRevision: recorded } } })).toBe(recorded);
    expect(resolveCasesRef({ meta: { sourceIdentity: { runnerRevision: recorded } } }, "HEAD~1")).toBe("HEAD~1");
  });

  it("refuses a newer live golden unless golden drift is explicit", async () => {
    const { resultsPath, id } = await writeGoldenDriftResult();
    const refused = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--ids", id, "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(refused.status).toBe(1);
    expect(refused.stderr).toContain("time-inconsistent re-judge");
    expect(refused.stderr).toContain("--allow-golden-drift");

    const allowed = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--ids", id, "--allow-golden-drift", "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );
    expect(allowed.status, allowed.stderr).toBe(0);
  });

  it("uses the raw judge score for validation-error comparisons", async () => {
    const effectiveVerdictScore = await loadEffectiveVerdictScore();

    expect(effectiveVerdictScore({ score: "error", judgeScore: "partial" })).toBe("partial");
    expect(effectiveVerdictScore({ score: "wrong" })).toBe("wrong");
    expect(effectiveVerdictScore(null)).toBeUndefined();
  });

  it("does not select a validation error as a grade change", async () => {
    const { resultsPath } = writeResults([{ score: "error" }]);
    const source = JSON.parse(readFileSync(resultsPath, "utf8"));
    source.rows[0].verdict = { score: "error", judgeScore: "partial" };
    writeFileSync(resultsPath, `${JSON.stringify(source)}\n`);
    const baselinePath = join(resultsPath, "..", "baseline.json");
    const baseline = structuredClone(source);
    // The baseline guard is absolute, so only the source may be non-identical.
    baseline.meta = { ...baseline.meta, ...(await loadJudgeTuple()) };
    baseline.rows[0].verdict = { score: "partial" };
    writeFileSync(baselinePath, `${JSON.stringify(baseline)}\n`);

    const result = spawnSync(
      process.execPath,
      [
        REJUDGE_PATH,
        resultsPath,
        "--flips-vs",
        baselinePath,
        "--allow-non-identical",
        "--allow-empty",
        "--dry-run"
      ],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).selectedIds).toEqual([]);
  });

  it("records agreement when both verdicts have the same raw judge score", async () => {
    const rejudgeRows = await loadRejudgeRows();
    const selectedRows = [
      {
        id: "one",
        answer: "Saved answer.",
        transcript: [],
        verdict: { score: "error", judgeScore: "partial" }
      }
    ];
    const rows = await rejudgeRows({
      selectedRows,
      caseById: new Map([["one", { id: "one", question: "Question?" }]]),
      judgeModel: "stub-judge",
      judge: async () => ({ score: "partial", costUsd: 0.1 }),
      checkpoint: () => {},
      log: () => {}
    }) as Array<{ agreement: boolean }>;

    expect(rows[0]?.agreement).toBe(true);
  });

  it("skips an ungradeable saved row and preserves its error verdict", async () => {
    const rejudgeRows = await loadRejudgeRows();
    let judgeCalls = 0;
    const original = { score: "error" };
    const rows = await rejudgeRows({
      selectedRows: [{
        id: "failed",
        answer: "A provider safeguard message.",
        transcript: [],
        agent: { failure: { class: "provider-safeguard", reason: "blocked" } },
        verdict: original
      }] as never,
      caseById: new Map([["failed", { id: "failed", question: "Question?" }]]),
      judgeModel: "stub-judge",
      judge: async () => {
        judgeCalls++;
        return { score: "wrong", costUsd: 0.1 };
      },
      checkpoint: () => {},
      log: () => {}
    }) as Array<{ new: { score: string }; skipped?: { reason: string } }>;

    expect(judgeCalls).toBe(0);
    expect(rows[0]?.new).toBe(original);
    expect(rows[0]?.skipped).toEqual({ reason: "unsuccessful-answer" });
  });

  // agreement measures grade variance, so it needs a grade on both sides. An
  // effective error measured nothing, and reporting it as a disagreement would
  // inflate every rate computed from the artifact.
  it("reports no agreement value when either side has no grade", async () => {
    const verdictAgreement = await loadVerdictAgreement();

    expect(verdictAgreement({ score: "wrong" }, { score: "wrong" })).toBe(true);
    expect(verdictAgreement({ score: "wrong" }, { score: "error", judgeScore: "wrong" })).toBe(true);
    expect(verdictAgreement({ score: "wrong" }, { score: "partial" })).toBe(false);
    expect(verdictAgreement({ score: "wrong" }, { score: "error" })).toBeNull();
    expect(verdictAgreement({ score: "error" }, { score: "correct" })).toBeNull();
    expect(verdictAgreement(undefined, { score: "correct" })).toBeNull();
  });

  it("records no agreement when the re-judge itself fails", async () => {
    const rejudgeRows = await loadRejudgeRows();
    const rows = await rejudgeRows({
      selectedRows: [
        { id: "one", answer: "Saved answer.", transcript: [], verdict: { score: "wrong" } }
      ],
      caseById: new Map([["one", { id: "one", question: "Question?" }]]),
      judgeModel: "stub-judge",
      judge: async () => ({ score: "error", costUsd: 0 }),
      checkpoint: () => {},
      log: () => {}
    }) as Array<{ agreement: boolean | null }>;

    expect(rows[0]?.agreement).toBeNull();
  });

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
          return {
            score: "error",
            judgeScore: "wrong",
            consistencyViolations: ["omission-only-wrong"],
            costUsd: 0.25
          };
        },
        checkpoint: (rows) => checkpoints.push(structuredClone(rows)),
        log: () => {}
      })
    ).rejects.toThrow("second judge failed");

    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0]).toMatchObject([
      {
        id: "one",
        original: { score: "correct" },
        new: {
          score: "error",
          judgeScore: "wrong",
          consistencyViolations: ["omission-only-wrong"],
          costUsd: 0.25
        }
      }
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

  it("reports an identical --flips-vs baseline as guarded", async () => {
    const { resultsPath, baselinePath, ids } = writeFlipsPair(await loadJudgeTuple());
    const result = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--flips-vs", baselinePath, "--dry-run"],
      { cwd: ROOT, encoding: "utf8" }
    );

    expect(result.status, result.stderr).toBe(0);
    const guards = JSON.parse(result.stdout).guards;
    expect(guards.baseline).toMatchObject({
      matches: true,
      cases: { matches: true },
      tuple: { matches: true }
    });
    expect(guards.wouldRefuse).toBe(false);
    expect(JSON.parse(result.stdout).selectedIds).toEqual(ids);
  });

  it("refuses a --flips-vs baseline whose snapshot or judge tuple differs", async () => {
    const tuple = await loadJudgeTuple();
    const drifted: Array<[string, Record<string, unknown>, string]> = [
      ["snapshot", { inputSnapshot: { casesSha256: sha256("drifted baseline snapshot") } }, "case input snapshot differs"],
      ["model", { judgeModel: "claude-some-other-model" }, "judge tuple differs"],
      ["rubric", { judgeRubric: "v0.0" }, "judge tuple differs"],
      ["pack", { packVersion: "p0" }, "judge tuple differs"]
    ];

    for (const [label, baselineMeta, reason] of drifted) {
      const { resultsPath, baselinePath } = writeFlipsPair(tuple, baselineMeta);

      // PATH holds only a stub `claude`, so a guard that fails to fire cannot
      // reach the paid judge.
      for (const extra of [["--dry-run"], []]) {
        const result = spawnSync(
          process.execPath,
          [REJUDGE_PATH, resultsPath, "--flips-vs", baselinePath, ...extra],
          { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: stubClaudeDirectory() } }
        );

        expect(result.status, `${label} ${extra.join(" ")}: ${result.stdout}`).toBe(1);
        expect(result.stderr, label).toContain("baseline");
        expect(result.stderr, label).toContain(reason);
      }
    }
  });

  it("refuses a drifted --flips-vs baseline even with --allow-non-identical", async () => {
    // The override covers a source snapshot that no longer reproduces. It
    // never covers the baseline, which decides what gets paid for.
    const tuple = await loadJudgeTuple();
    for (const baselineMeta of [
      { judgeRubric: "v0.0" },
      { inputSnapshot: { casesSha256: sha256("drifted baseline snapshot") } }
    ]) {
      const { resultsPath, baselinePath } = writeFlipsPair(tuple, baselineMeta);
      const result = spawnSync(
        process.execPath,
        [REJUDGE_PATH, resultsPath, "--flips-vs", baselinePath, "--allow-non-identical", "--dry-run"],
        { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: stubClaudeDirectory() } }
      );

      expect(result.status, result.stdout).toBe(1);
      expect(result.stderr).toContain("--allow-non-identical does not waive");
    }
  });

  it("refuses when a shared case id has different content in source and baseline", async () => {
    // Both artifacts reproduce their own snapshot, so only a cross-comparison
    // catches it: the same id is a different question on each side.
    const { resultsPath, baselinePath } = writeDivergentCasesPair(await loadJudgeTuple());
    const result = spawnSync(
      process.execPath,
      [REJUDGE_PATH, resultsPath, "--flips-vs", baselinePath, "--dry-run"],
      { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: stubClaudeDirectory() } }
    );

    expect(result.status, result.stdout).toBe(1);
    expect(result.stderr).toContain("shared case");
    expect(result.stderr).toContain("shared-drift-case");
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
