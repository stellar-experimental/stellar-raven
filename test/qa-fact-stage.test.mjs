import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { join } from "node:path";

import {
  FACT_STAGE_BENCHMARK,
  FACT_STAGE_LABELS,
  claimDigest,
  resolveFactStageEvidence,
} from "../eval/qa/fact-stage-benchmark.mjs";

const REQUIRED_FIELDS = [
  "caseId",
  "factId",
  "requiredIdentity",
  "requiredEvidenceClass",
  "firstMissingStage",
  "stageEvidence",
  "claimRefs",
  "classificationRef",
];

const EXPECTED_FACT_STAGE_LABELS = [
  "absent-upstream",
  "route-uncalled",
  "called-fact-absent",
  "artifact-only",
  "visible-omitted",
  "contradicted",
  "judge-or-golden",
];

// The benchmark admits exactly these cases. A dated review record grades each
// one as a miss and names it, so a case joins this list only with that record.
const ALLOWED_CASE_IDS = [
  "q-hist-quantum-preparedness-plan",
  "q-live-ll-active-jobs-recency",
];

const CLASSIFICATION_REF =
  "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification";

describe("saved-miss fact-stage benchmark", () => {
  const byCaseId = new Map(FACT_STAGE_BENCHMARK.map((row) => [row.caseId, row]));

  it("pins the exact fact-stage label vocabulary", () => {
    expect(FACT_STAGE_LABELS).toEqual(EXPECTED_FACT_STAGE_LABELS);
  });

  it("keeps only the cases a graded review record supports", () => {
    expect([...byCaseId.keys()].sort()).toEqual(ALLOWED_CASE_IDS);
  });

  it("admits each allowed case exactly once", () => {
    for (const caseId of ALLOWED_CASE_IDS) {
      const rows = FACT_STAGE_BENCHMARK.filter((row) => row.caseId === caseId);
      expect(rows.length, caseId).toBe(1);
    }
  });

  it("holds one exact schema per row", () => {
    const seen = new Set();

    for (const row of FACT_STAGE_BENCHMARK) {
      expect(Object.keys(row).sort(), row.caseId).toEqual([...REQUIRED_FIELDS].sort());
      expect(FACT_STAGE_LABELS, row.caseId).toContain(row.firstMissingStage);
      expect(row.factId, row.caseId).not.toHaveLength(0);
      expect(row.requiredIdentity, row.caseId).not.toHaveLength(0);
      expect(row.requiredEvidenceClass, row.caseId).not.toHaveLength(0);
      expect(row.classificationRef, row.caseId).toBe(CLASSIFICATION_REF);
      expect(Object.keys(row.stageEvidence).sort(), row.caseId).toEqual([
        "dispositionDigest",
        "grade",
        "ref",
      ]);
      expect(row.stageEvidence.dispositionDigest, row.caseId).toMatch(
        /^sha256:[0-9a-f]{64}$/,
      );
      expect(row.claimRefs.length, row.caseId).toBeGreaterThan(0);
      expect(new Set(row.claimRefs).size, row.caseId).toBe(row.claimRefs.length);
      expect(seen.has(row.caseId), row.caseId).toBe(false);
      seen.add(row.caseId);
    }
  });

  it("binds every claim reference to an exact digest of the claim it names", () => {
    for (const row of FACT_STAGE_BENCHMARK) {
      for (const ref of row.claimRefs) {
        const resolved = resolveFactStageEvidence(ref, row.caseId);
        expect(resolved.kind, ref).toBe("claim");
        expect(ref, ref).toContain(`@${resolved.digest}`);
      }
    }
  });

  // The stage label is a claim about observed behavior. It resolves only
  // through a dated review row that graded this case, so the benchmark cannot
  // grade itself. A grade is one token and several cases share it, so the row
  // binds to the saved disposition text as well.
  it("binds every stage to a graded review row and its saved disposition", () => {
    for (const row of FACT_STAGE_BENCHMARK) {
      const resolved = resolveFactStageEvidence(row.stageEvidence.ref, row.caseId, {
        expect: {
          grade: row.stageEvidence.grade,
          dispositionDigest: row.stageEvidence.dispositionDigest,
        },
      });
      expect(resolved.kind, row.caseId).toBe("row");
      expect(row.stageEvidence.ref, row.caseId).not.toBe(row.classificationRef);
    }
  });

  it("binds every classification row to its fact, stage, and grade", () => {
    for (const row of FACT_STAGE_BENCHMARK) {
      expect(
        resolveFactStageEvidence(row.classificationRef, row.caseId, {
          expect: {
            factId: row.factId,
            firstMissingStage: row.firstMissingStage,
            grade: row.stageEvidence.grade,
          },
        }).kind,
        row.caseId,
      ).toBe("row");
    }
  });

  it("keeps the jobs case at its graded contradiction", () => {
    const row = byCaseId.get("q-live-ll-active-jobs-recency");

    expect(row.firstMissingStage).toBe("contradicted");
    expect(row.factId).toBe("distinct-active-job-listing-identities");
    expect(row.stageEvidence.ref).toBe(
      "eval/qa/reviewed/2026-07-12-live-v3-baseline.md#new-case-behavioral-review",
    );
    expect(row.stageEvidence.grade).toBe("W / W");
  });

  it("keeps the quantum case at its graded contradiction", () => {
    const row = byCaseId.get("q-hist-quantum-preparedness-plan");

    expect(row.firstMissingStage).toBe("contradicted");
    expect(row.stageEvidence.ref).toBe(
      "eval/qa/reviewed/2026-07-super-corpus-baseline.md#wrong-and-partial-triage",
    );
    expect(row.stageEvidence.grade).toBe("wrong");
  });
});

describe("fact-stage evidence gate", () => {
  function withFixture(files, run) {
    const root = mkdtempSync(join(tmpdir(), "qa-fact-stage-"));
    try {
      for (const [name, body] of Object.entries(files)) {
        writeFileSync(join(root, name), body);
      }
      return run(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const EXACT_FACT = "the exact fact";
  const EXACT_CASE = JSON.stringify({ id: "q-x", golden: { keyFacts: [EXACT_FACT] } });
  const EXACT_REF = `case.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`;

  it("resolves an exact digest-bound claim", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(resolveFactStageEvidence(EXACT_REF, "q-x", { repoRoot: root })).toEqual({
        kind: "claim",
        path: "golden.keyFacts",
        index: 0,
        digest: claimDigest(EXACT_FACT),
      });
    });
  });

  it("rejects unrelated JSON that merely parses", () => {
    withFixture({ "notes.json": JSON.stringify({ unrelated: true }) }, (root) => {
      expect(() =>
        resolveFactStageEvidence(
          `notes.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`,
          "q-x",
          { repoRoot: root },
        ),
      ).toThrow(/q-x/);
    });
  });

  it("rejects a JSON record whose id belongs to another case", () => {
    withFixture(
      { "notes.json": JSON.stringify({ id: "q-other", golden: { keyFacts: [EXACT_FACT] } }) },
      (root) => {
        expect(() =>
          resolveFactStageEvidence(
            `notes.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`,
            "q-x",
            { repoRoot: root },
          ),
        ).toThrow(/q-x/);
      },
    );
  });

  it("rejects a bare caseId container fragment", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(() =>
        resolveFactStageEvidence("case.json#caseId=q-x", "q-x", { repoRoot: root }),
      ).toThrow(/claim path/);
    });
  });

  it("rejects a non-claim path on an exact case record", () => {
    withFixture(
      {
        "case.json": JSON.stringify({
          id: "q-x",
          question: "an unrelated question",
          golden: { keyFacts: [EXACT_FACT] },
        }),
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence(
            `case.json#question@${claimDigest("an unrelated question")}`,
            "q-x",
            { repoRoot: root },
          ),
        ).toThrow(/claim path/);
      },
    );
  });

  it("rejects a claim reference that carries no digest", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(() =>
        resolveFactStageEvidence("case.json#golden.keyFacts[index=0]", "q-x", {
          repoRoot: root,
        }),
      ).toThrow(/must bind golden\.keyFacts to a claim digest/);
    });
  });

  it("rejects a digest that is not a sha256 hex digest", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      for (const digest of ["sha256:beef", "md5:" + "a".repeat(32), "not-a-digest"]) {
        expect(() =>
          resolveFactStageEvidence(`case.json#golden.keyFacts[index=0]@${digest}`, "q-x", {
            repoRoot: root,
          }),
        ).toThrow(/is not a sha256 claim digest/);
      }
    });
  });

  it("rejects a digest that names an unrelated claim", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(() =>
        resolveFactStageEvidence(
          `case.json#golden.keyFacts[index=0]@${claimDigest("some other fact")}`,
          "q-x",
          { repoRoot: root },
        ),
      ).toThrow(/does not match/);
    });
  });

  it("rejects a claim array reference without an index", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(() =>
        resolveFactStageEvidence(
          `case.json#golden.keyFacts@${claimDigest([EXACT_FACT])}`,
          "q-x",
          { repoRoot: root },
        ),
      ).toThrow(/must select one claim array index/);
    });
  });

  it("rejects a scalar where the claim path must hold an array", () => {
    withFixture(
      {
        "keyfacts.json": JSON.stringify({ id: "q-x", golden: { keyFacts: EXACT_FACT } }),
        "avoid.json": JSON.stringify({ id: "q-x", golden: { avoid: EXACT_FACT } }),
        "corroboration.json": JSON.stringify({ id: "q-x", truth: { corroboration: EXACT_FACT } }),
      },
      (root) => {
        const digest = claimDigest(EXACT_FACT);
        for (const [file, path] of [
          ["keyfacts.json", "golden.keyFacts"],
          ["avoid.json", "golden.avoid"],
          ["corroboration.json", "truth.corroboration"],
        ]) {
          expect(() =>
            resolveFactStageEvidence(`${file}#${path}[index=0]@${digest}`, "q-x", {
              repoRoot: root,
            }),
          ).toThrow(/claim array/);
        }
      },
    );
  });

  it("rejects an index on a scalar claim path", () => {
    withFixture(
      { "case.json": JSON.stringify({ id: "q-x", golden: { answer: EXACT_FACT } }) },
      (root) => {
        const digest = claimDigest(EXACT_FACT);
        expect(() =>
          resolveFactStageEvidence(`case.json#golden.answer[index=0]@${digest}`, "q-x", {
            repoRoot: root,
          }),
        ).toThrow(/cannot index a scalar claim/);
        expect(
          resolveFactStageEvidence(`case.json#golden.answer@${digest}`, "q-x", {
            repoRoot: root,
          }),
        ).toEqual({ kind: "claim", path: "golden.answer", index: null, digest });
      },
    );
  });

  it("rejects an array where the claim path must hold a scalar", () => {
    withFixture(
      { "case.json": JSON.stringify({ id: "q-x", golden: { answer: [EXACT_FACT] } }) },
      (root) => {
        expect(() =>
          resolveFactStageEvidence(
            `case.json#golden.answer@${claimDigest([EXACT_FACT])}`,
            "q-x",
            { repoRoot: root },
          ),
        ).toThrow(/not a scalar claim/);
      },
    );
  });

  it("rejects a row that only mentions the case outside the Case column", () => {
    withFixture(
      {
        "notes.md":
          "## Evidence\n\n| Case | Note |\n|---|---|\n| `q-other` | unrelated mention of `q-x` |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("notes.md#evidence", "q-x", { repoRoot: root }),
        ).toThrow(/q-x/);
      },
    );
  });

  it("rejects a Markdown section that only holds a longer case id", () => {
    withFixture(
      {
        "notes.md":
          "# Title\n\n## Evidence\n\n| Case | Note |\n|---|---|\n| `q-x-unrelated` | row |\n",
        "exact.md": "# Title\n\n## Evidence\n\n| Case | Note |\n|---|---|\n| `q-x` | row |\n",
        "prose.md": "# Title\n\n## Evidence\n\nq-x appears in prose only.\n",
        "nocolumn.md": "# Title\n\n## Evidence\n\n| Lane | Note |\n|---|---|\n| `q-x` | row |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("notes.md#evidence", "q-x", { repoRoot: root }),
        ).toThrow(/q-x/);
        expect(() =>
          resolveFactStageEvidence("prose.md#evidence", "q-x", { repoRoot: root }),
        ).toThrow(/row/);
        expect(() =>
          resolveFactStageEvidence("nocolumn.md#evidence", "q-x", { repoRoot: root }),
        ).toThrow(/Case column/);
        expect(
          resolveFactStageEvidence("exact.md#evidence", "q-x", { repoRoot: root }),
        ).toEqual({ kind: "row", heading: "evidence" });
      },
    );
  });

  it("rejects a table that only appears inside a fenced block", () => {
    withFixture(
      {
        "fenced.md":
          "## Evidence\n\n```md\n| Case | Note |\n|---|---|\n| `q-x` | row |\n```\n",
        "tilde.md":
          "## Evidence\n\n~~~\n| Case | Note |\n|---|---|\n| `q-x` | row |\n~~~\n",
      },
      (root) => {
        for (const file of ["fenced.md", "tilde.md"]) {
          expect(() =>
            resolveFactStageEvidence(`${file}#evidence`, "q-x", { repoRoot: root }),
          ).toThrow(/Case column/);
        }
      },
    );
  });

  // A closing fence carries only its marker. A fence line with trailing text
  // stays inside the block, so an example fence cannot end the block early and
  // expose the rows below it as evidence.
  it("keeps a fenced block open when an inner fence line carries trailing text", () => {
    withFixture(
      {
        "backtick.md":
          "## Evidence\n\n```\n```md\n| Case | Note |\n|---|---|\n| `q-x` | row |\n```\n",
        "tilde.md":
          "## Evidence\n\n~~~\n~~~ text\n| Case | Note |\n|---|---|\n| `q-x` | row |\n~~~\n",
      },
      (root) => {
        for (const file of ["backtick.md", "tilde.md"]) {
          expect(() =>
            resolveFactStageEvidence(`${file}#evidence`, "q-x", { repoRoot: root }),
          ).toThrow(/Case column/);
        }
      },
    );
  });

  // CommonMark reads a line indented four spaces, or one tab, as indented
  // code. A table written that way is an example, so no part of it resolves.
  it("rejects a table indented into a code block", () => {
    withFixture(
      {
        "spaces.md":
          "## Evidence\n\n    | Case | Note |\n    |---|---|\n    | `q-x` | row |\n",
        "tabs.md": "## Evidence\n\n\t| Case | Note |\n\t|---|---|\n\t| `q-x` | row |\n",
      },
      (root) => {
        for (const file of ["spaces.md", "tabs.md"]) {
          expect(() =>
            resolveFactStageEvidence(`${file}#evidence`, "q-x", { repoRoot: root }),
          ).toThrow(/Case column/);
        }
      },
    );
  });

  it("rejects a table whose header, alignment row, or case row is indented into code", () => {
    withFixture(
      {
        "header-spaces.md":
          "## Evidence\n\n    | Case | Note |\n|---|---|\n| `q-x` | row |\n",
        "header-tab.md": "## Evidence\n\n\t| Case | Note |\n|---|---|\n| `q-x` | row |\n",
        "alignment-spaces.md":
          "## Evidence\n\n| Case | Note |\n    |---|---|\n| `q-x` | row |\n",
        "alignment-tab.md": "## Evidence\n\n| Case | Note |\n\t|---|---|\n| `q-x` | row |\n",
        "row-spaces.md":
          "## Evidence\n\n| Case | Note |\n|---|---|\n    | `q-x` | row |\n",
        "row-tab.md": "## Evidence\n\n| Case | Note |\n|---|---|\n\t| `q-x` | row |\n",
      },
      (root) => {
        for (const file of [
          "header-spaces.md",
          "header-tab.md",
          "alignment-spaces.md",
          "alignment-tab.md",
          "row-spaces.md",
          "row-tab.md",
        ]) {
          expect(() =>
            resolveFactStageEvidence(`${file}#evidence`, "q-x", { repoRoot: root }),
          ).toThrow(/Case column/);
        }
      },
    );
  });

  // Three spaces is the last indentation CommonMark still reads as a block, so
  // an ordinary table keeps resolving there.
  it("accepts a table indented three spaces", () => {
    withFixture(
      {
        "three.md": "## Evidence\n\n   | Case | Note |\n   |---|---|\n   | `q-x` | row |\n",
      },
      (root) => {
        expect(
          resolveFactStageEvidence("three.md#evidence", "q-x", { repoRoot: root }),
        ).toEqual({ kind: "row", heading: "evidence" });
      },
    );
  });

  it("rejects a heading that only appears inside a fenced block", () => {
    withFixture(
      {
        "fenced.md":
          "# Title\n\n```md\n## Evidence\n\n| Case | Note |\n|---|---|\n| `q-x` | row |\n```\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("fenced.md#evidence", "q-x", { repoRoot: root }),
        ).toThrow(/names no exact heading/);
      },
    );
  });

  it("rejects Markdown that only mentions the case id", () => {
    withFixture({ "notes.md": "# Title\n\nq-x happened.\n" }, (root) => {
      expect(() =>
        resolveFactStageEvidence("notes.md#missing-heading", "q-x", { repoRoot: root }),
      ).toThrow(/missing-heading/);
    });
  });

  it("rejects an exact heading whose section omits the case id", () => {
    withFixture(
      {
        "notes.md":
          "# Title\n\n## Other\n\ntext\n\n## Mentions\n\n| Case | Note |\n|---|---|\n| `q-x` | row |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("notes.md#other", "q-x", { repoRoot: root }),
        ).toThrow(/q-x/);
        expect(
          resolveFactStageEvidence("notes.md#mentions", "q-x", { repoRoot: root }),
        ).toEqual({ kind: "row", heading: "mentions" });
      },
    );
  });

  it("rejects a repository reference without a fragment", () => {
    withFixture({ "notes.json": JSON.stringify({ id: "q-x" }) }, (root) => {
      expect(() => resolveFactStageEvidence("notes.json", "q-x", { repoRoot: root })).toThrow(
        /fragment/,
      );
    });
  });

  it("rejects repository path escapes", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      expect(() =>
        resolveFactStageEvidence(`../outside.json#golden.answer@${claimDigest("x")}`, "q-x", {
          repoRoot: root,
        }),
      ).toThrow(/escapes the repository root/);
    });
  });

  it("rejects Solo context as repository evidence", () => {
    for (const ref of [
      "solo://proj/49/todo/example--1#comment-1",
      "SOLO://proj/49/todo/example--1#comment-1",
      "Solo://proj/49/todo/example--1#comment-1",
    ]) {
      expect(() => resolveFactStageEvidence(ref, "q-x")).toThrow(
        /not repository-verifiable evidence/,
      );
    }
  });

  it("rejects a detached digest regardless of its case", () => {
    const digest = "a".repeat(64);
    for (const prefix of ["sha256", "SHA256", "Sha256"]) {
      expect(() => resolveFactStageEvidence(`${prefix}:${digest}`, "q-x")).toThrow(
        /detached digest/,
      );
    }
  });

  it("binds a classification row to the expected fact, stage, and grade", () => {
    withFixture(
      {
        "record.md":
          "## Classification\n\n| Case | Fact | First missing stage | Grade | Review basis |\n|---|---|---|---|---|\n| `q-x` | `some-fact-id` | `contradicted` | `W / W` | basis |\n",
      },
      (root) => {
        expect(
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: {
              factId: "some-fact-id",
              firstMissingStage: "contradicted",
              grade: "W / W",
            },
          }),
        ).toEqual({ kind: "row", heading: "classification" });
      },
    );
  });

  it("rejects a classification row whose stage drifted from the benchmark row", () => {
    withFixture(
      {
        "record.md":
          "## Classification\n\n| Case | Fact | First missing stage | Review basis |\n|---|---|---|---|\n| `q-x` | `some-fact-id` | `contradicted` | basis |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { factId: "some-fact-id", firstMissingStage: "absent-upstream" },
          }),
        ).toThrow(/first missing stage "contradicted", not "absent-upstream"/);
      },
    );
  });

  it("rejects a classification row whose fact drifted from the benchmark row", () => {
    withFixture(
      {
        "record.md":
          "## Classification\n\n| Case | Fact | First missing stage | Review basis |\n|---|---|---|---|\n| `q-x` | `some-fact-id` | `contradicted` | basis |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { factId: "other-fact-id", firstMissingStage: "contradicted" },
          }),
        ).toThrow(/fact "some-fact-id", not "other-fact-id"/);
      },
    );
  });

  it("rejects a review row whose grade drifted from the benchmark row", () => {
    withFixture(
      {
        "review.md":
          "## Review\n\n| Case | Raw / reviewed | Evidence |\n|---|---|---|\n| `q-x` | `C / C` | text |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("review.md#review", "q-x", {
            repoRoot: root,
            expect: { grade: "W / W" },
          }),
        ).toThrow(/grade "C \/ C", not "W \/ W"/);
      },
    );
  });

  const REVIEW_DISPOSITION = "The saved answer collapsed distinct returned ids.";
  const REVIEW_TABLE =
    "## Review\n\n| Case | Raw / reviewed | Evidence and disposition |\n|---|---|---|\n" +
    `| \`q-x\` | \`W / W\` | ${REVIEW_DISPOSITION} |\n`;

  it("binds a review row to its exact saved disposition", () => {
    withFixture({ "review.md": REVIEW_TABLE }, (root) => {
      expect(
        resolveFactStageEvidence("review.md#review", "q-x", {
          repoRoot: root,
          expect: {
            grade: "W / W",
            dispositionDigest: claimDigest(REVIEW_DISPOSITION),
          },
        }),
      ).toEqual({ kind: "row", heading: "review" });
    });
  });

  it("rejects a review row whose disposition drifted from the benchmark row", () => {
    withFixture({ "review.md": REVIEW_TABLE }, (root) => {
      expect(() =>
        resolveFactStageEvidence("review.md#review", "q-x", {
          repoRoot: root,
          expect: {
            grade: "W / W",
            dispositionDigest: claimDigest("The saved answer preserved every identity."),
          },
        }),
      ).toThrow(/disposition/);
    });
  });

  it("rejects an evidence table that carries no expected cell", () => {
    withFixture(
      {
        "record.md": "## Classification\n\n| Case | Note |\n|---|---|\n| `q-x` | basis |\n",
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { firstMissingStage: "contradicted" },
          }),
        ).toThrow(/carries no First missing stage cell for q-x/);
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { factId: "some-fact-id" },
          }),
        ).toThrow(/carries no Fact cell for q-x/);
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { grade: "wrong" },
          }),
        ).toThrow(/carries no Grade cell for q-x/);
        expect(() =>
          resolveFactStageEvidence("record.md#classification", "q-x", {
            repoRoot: root,
            expect: { dispositionDigest: claimDigest("basis") },
          }),
        ).toThrow(/carries no Disposition cell for q-x/);
      },
    );
  });

  it("rejects a symlink that resolves outside the repository root", () => {
    const outside = join(tmpdir(), `qa-fact-stage-outside-${process.pid}.json`);
    writeFileSync(outside, EXACT_CASE);
    try {
      withFixture({}, (root) => {
        symlinkSync(outside, join(root, "link.json"));
        expect(() =>
          resolveFactStageEvidence(
            `link.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`,
            "q-x",
            { repoRoot: root },
          ),
        ).toThrow(/escapes the repository root/);
      });
    } finally {
      rmSync(outside, { force: true });
    }
  });

  it("accepts a symlink that stays inside the repository root", () => {
    withFixture({ "case.json": EXACT_CASE }, (root) => {
      symlinkSync(join(root, "case.json"), join(root, "alias.json"));
      expect(
        resolveFactStageEvidence(
          `alias.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`,
          "q-x",
          { repoRoot: root },
        ).kind,
      ).toBe("claim");
    });
  });

  it("rejects a symlink into a sibling directory that shares the root name prefix", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-fact-stage-root-"));
    const sibling = mkdtempSync(join(tmpdir(), "qa-fact-stage-root-sibling-"));
    try {
      writeFileSync(join(sibling, "case.json"), EXACT_CASE);
      symlinkSync(join(sibling, "case.json"), join(root, "sneaky.json"));
      expect(() =>
        resolveFactStageEvidence(
          `sneaky.json#golden.keyFacts[index=0]@${claimDigest(EXACT_FACT)}`,
          "q-x",
          { repoRoot: root },
        ),
      ).toThrow(/escapes the repository root/);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(sibling, { recursive: true, force: true });
    }
  });
});
