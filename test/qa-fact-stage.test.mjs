import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { join } from "node:path";

import {
  FACT_STAGE_BENCHMARK,
  FACT_STAGE_LABELS,
  resolveFactStageEvidence,
} from "../eval/qa/fact-stage-benchmark.mjs";

const REQUIRED_FIELDS = [
  "caseId",
  "factId",
  "requiredIdentity",
  "requiredEvidenceClass",
  "firstMissingStage",
  "evidenceRefs",
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

const COLLISION_CASE_IDS = [
  "q-ti-java-sdk-wallet-feebump",
  "q-tool-cctp-stellar-integration",
  "q-hist-quantum-preparedness-plan",
  "q-infra-rpc-provider-archive-tier",
  "q-defi-blend-alternatives",
  "q-scf-build-award-cap",
];

describe("saved-miss fact-stage benchmark", () => {
  it("pins the exact fact-stage label vocabulary", () => {
    expect(FACT_STAGE_LABELS).toEqual(EXPECTED_FACT_STAGE_LABELS);
  });

  it("keeps jobs and builders at their distinct first missing stages", () => {
    const byCaseId = new Map(
      FACT_STAGE_BENCHMARK.map((row) => [row.caseId, row]),
    );

    expect(byCaseId.get("q-live-ll-active-jobs-recency")?.firstMissingStage).toBe(
      "contradicted",
    );
    expect(
      byCaseId.get("q-live-builders-artifact-continuation")?.firstMissingStage,
    ).toBe("visible-omitted");
  });

  it("covers every named collision with the required schema and evidence", () => {
    const rowsByCaseId = new Map();

    for (const row of FACT_STAGE_BENCHMARK) {
      expect(Object.keys(row).sort(), row.caseId).toEqual(
        [...REQUIRED_FIELDS].sort(),
      );
      expect(FACT_STAGE_LABELS, row.caseId).toContain(row.firstMissingStage);
      expect(row.factId, row.caseId).not.toHaveLength(0);
      expect(row.requiredIdentity, row.caseId).not.toHaveLength(0);
      expect(row.requiredEvidenceClass, row.caseId).not.toHaveLength(0);
      expect(row.evidenceRefs.length, row.caseId).toBeGreaterThan(1);
      expect(new Set(row.evidenceRefs).size, row.caseId).toBe(
        row.evidenceRefs.length,
      );
      const kinds = row.evidenceRefs.map((ref) => resolveFactStageEvidence(ref, row.caseId));
      expect(
        kinds.some((resolved) => resolved.kind === "repository"),
        row.caseId,
      ).toBe(true);
      expect(rowsByCaseId.has(row.caseId), row.caseId).toBe(false);
      rowsByCaseId.set(row.caseId, row);
    }

    expect([...rowsByCaseId.keys()].sort()).toEqual(
      [
        ...COLLISION_CASE_IDS,
        "q-live-builders-artifact-continuation",
        "q-live-ll-active-jobs-recency",
      ].sort(),
    );
  });

  // Reviewer-rejected evidence, kept as an explicit guard so a stale reference
  // cannot return silently. The stage claim and the referenced grade must agree.
  const CONTRADICTED_EVIDENCE = [
    {
      caseId: "q-live-builders-artifact-continuation",
      stage: "visible-omitted",
      path: "eval/qa/reviewed/2026-07-12-live-v3-baseline.md",
      reason:
        "line 91 grades the case C / C and reports preserved grouping evidence, which contradicts a visible-omitted stage",
    },
  ];

  it("keeps reviewer-rejected evidence out of the benchmark", () => {
    const byCaseId = new Map(FACT_STAGE_BENCHMARK.map((row) => [row.caseId, row]));

    for (const { caseId, stage, path, reason } of CONTRADICTED_EVIDENCE) {
      const row = byCaseId.get(caseId);
      expect(row, caseId).toBeDefined();
      expect(row.firstMissingStage, caseId).toBe(stage);
      expect(
        row.evidenceRefs.filter((ref) => ref.startsWith(path)),
        `${caseId}: ${reason}`,
      ).toEqual([]);
      expect(row.evidenceRefs.length, caseId).toBeGreaterThan(1);
    }
  });

  it("assigns one owner stage to each named collision", () => {
    const stageByCaseId = Object.fromEntries(
      FACT_STAGE_BENCHMARK.map(({ caseId, firstMissingStage }) => [
        caseId,
        firstMissingStage,
      ]),
    );

    expect(stageByCaseId).toMatchObject({
      "q-ti-java-sdk-wallet-feebump": "called-fact-absent",
      "q-tool-cctp-stellar-integration": "absent-upstream",
      "q-hist-quantum-preparedness-plan": "contradicted",
      "q-infra-rpc-provider-archive-tier": "called-fact-absent",
      "q-defi-blend-alternatives": "absent-upstream",
      "q-scf-build-award-cap": "judge-or-golden",
    });
  });

  it("keeps accepted collision identities and ownership boundaries", () => {
    const rowsByCaseId = new Map(
      FACT_STAGE_BENCHMARK.map((row) => [row.caseId, row]),
    );

    expect(
      rowsByCaseId.get("q-defi-blend-alternatives")?.requiredIdentity,
    ).toBe("OrbitCDP lifecycle conflict");
    expect(
      rowsByCaseId.get("q-scf-build-award-cap")?.requiredEvidenceClass,
    ).toBe("ownership collision; saved artifact verdict remains correct");
    expect(FACT_STAGE_BENCHMARK.map((row) => row.firstMissingStage)).not.toContain(
      "route-uncalled",
    );
    expect(FACT_STAGE_BENCHMARK.map((row) => row.firstMissingStage)).not.toContain(
      "artifact-only",
    );
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

  it("rejects unrelated JSON that merely parses", () => {
    withFixture({ "notes.json": JSON.stringify({ unrelated: true }) }, (root) => {
      expect(() =>
        resolveFactStageEvidence("notes.json#golden.keyFacts", "q-x", { repoRoot: root }),
      ).toThrow(/q-x/);
    });
  });

  it("rejects a JSON record whose id belongs to another case", () => {
    withFixture(
      { "notes.json": JSON.stringify({ id: "q-other", golden: { keyFacts: ["a"] } }) },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("notes.json#golden.keyFacts", "q-x", { repoRoot: root }),
        ).toThrow(/q-x/);
      },
    );
  });

  it("rejects a bare caseId container fragment", () => {
    withFixture(
      {
        "case.json": JSON.stringify({
          id: "q-x",
          question: "an unrelated question",
          golden: { keyFacts: ["an unrelated fact"] },
        }),
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("case.json#caseId=q-x", "q-x", { repoRoot: root }),
        ).toThrow(/claim path/);
      },
    );
  });

  it("rejects a non-claim path on an exact case record", () => {
    withFixture(
      {
        "case.json": JSON.stringify({
          id: "q-x",
          question: "an unrelated question",
          golden: { keyFacts: ["an unrelated fact"] },
        }),
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("case.json#question", "q-x", { repoRoot: root }),
        ).toThrow(/claim path/);
        expect(
          resolveFactStageEvidence("case.json#golden.keyFacts[index=0]", "q-x", { repoRoot: root }),
        ).toEqual({ kind: "repository" });
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
        ).toEqual({ kind: "repository" });
      },
    );
  });

  it("rejects a register cluster that does not list the case", () => {
    withFixture(
      {
        "register.json": JSON.stringify({
          clusters: { entries: [{ id: "cluster-1", label: "unrelated", members: ["q-other"] }] },
        }),
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("register.json#clusters.entries[id=cluster-1]", "q-x", {
            repoRoot: root,
          }),
        ).toThrow(/cluster-1/);
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
        ).toEqual({ kind: "repository" });
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

  it("rejects an unselected claim array", () => {
    withFixture(
      {
        "case.json": JSON.stringify({
          id: "q-x",
          golden: { keyFacts: ["the exact fact"] },
        }),
      },
      (root) => {
        expect(() =>
          resolveFactStageEvidence("case.json#golden.keyFacts", "q-x", { repoRoot: root }),
        ).toThrow(/select one claim array index/);
        expect(
          resolveFactStageEvidence("case.json#golden.keyFacts[index=0]", "q-x", {
            repoRoot: root,
          }),
        ).toEqual({ kind: "repository" });
      },
    );
  });

  it("rejects repository path escapes", () => {
    withFixture({ "case.json": JSON.stringify({ id: "q-x" }) }, (root) => {
      expect(() =>
        resolveFactStageEvidence("../outside.json#golden.answer", "q-x", { repoRoot: root }),
      ).toThrow(/escapes the repository root/);
    });
  });

  it("rejects Solo context as repository evidence", () => {
    expect(() =>
      resolveFactStageEvidence("solo://proj/49/todo/example--1#comment-1", "q-x"),
    ).toThrow(/not repository-verifiable evidence/);
  });
});
