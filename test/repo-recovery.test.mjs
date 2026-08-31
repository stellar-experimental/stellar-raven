import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  COLLECTION_SCHEMA,
  CONTRACT,
  FROZEN_CASE_CONTENT_DIGEST,
  FROZEN_ORDERED_IDS_DIGEST,
  REVIEW_ANNOTATIONS_SCHEMA,
  caseContentDigest,
  gradeResults,
  orderedIdsDigest
} from "../eval/repo-recovery/contract.mjs";
import {
  artifactSha256,
  buildReviewedArtifact
} from "../eval/repo-recovery/artifact.mjs";
import {
  DEFAULT_SUITE_PATH,
  lintSuite,
  loadManifest
} from "../eval/repo-recovery/lint.mjs";

function resultFor(suite, positivePasses = 10, prematureNegative = false) {
  const raw = {
    artifactSchema: COLLECTION_SCHEMA,
    contract: CONTRACT,
    caseContentDigest: caseContentDigest(suite.cases),
    orderedIdsDigest: orderedIdsDigest(suite.cases),
    meta: {
      comparable: true,
      completeness: { complete: true },
      answering: { model: "claude-sonnet-5" },
      roles: { collectorAuthor: "codex-sol", orchestrator: "codex-sol" }
    },
    rows: suite.cases.map((entry, index) => {
      if (entry.class === "positive") {
        const pass = index < positivePasses;
        return {
          id: entry.id,
          operations: pass
            ? [
                { sequence: 1, id: entry.initialEvidence.id, executeCallIndex: 2 },
                { sequence: 2, id: "scout.explainRepo", args: { repo: entry.repository }, executeCallIndex: 4 }
              ]
            : [{ sequence: 1, id: entry.initialEvidence.id, executeCallIndex: 2 }]
        };
      }
      return {
        id: entry.id,
        operations: prematureNegative && entry === suite.cases.find((item) => item.class === "negative")
          ? [
              { sequence: 1, id: "scout.explainRepo", args: { repo: entry.repository }, executeCallIndex: 1 },
              { sequence: 2, id: entry.initialEvidence.id, executeCallIndex: 2 }
            ]
          : [{ sequence: 1, id: entry.initialEvidence.id, executeCallIndex: 2 }]
      };
    })
  };
  const firstNegative = suite.cases.find((entry) => entry.class === "negative");
  const annotations = {
    artifactSchema: REVIEW_ANNOTATIONS_SCHEMA,
    collectionSha256: artifactSha256(raw),
    reviewedAt: "2026-08-30T18:00:00Z",
    reviewer: {
      identity: "fable-reviewer",
      model: "claude-fable-5",
      effort: "high",
      independent: true
    },
    rows: suite.cases.map((entry, index) => {
      const pass = entry.class !== "positive" || index < positivePasses;
      return {
        id: entry.id,
        initialEvidenceReview: {
          operationSequence: prematureNegative && entry === firstNegative ? 2 : 1,
          outcome: entry.class === "positive" ? (index % 2 === 0 ? "empty" : "adjacent") : "sufficient",
          evidence: ["reviewed stored evidence"]
        },
        answerReview: {
          correct: pass,
          grounded: pass,
          evidence: [pass ? "pinned source" : "answer defect recorded"]
        }
      };
    })
  };
  return buildReviewedArtifact(suite, raw, annotations);
}

describe("frozen repository-tooling recovery suite", () => {
  it("keeps the committed suite valid and identity-pinned", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    expect(lintSuite(suite, loadManifest())).toEqual([]);
    expect(suite.contractProvenance.caseContentDigest).toBe(FROZEN_CASE_CONTENT_DIGEST);
    expect(suite.contractProvenance.orderedIdsDigest).toBe(FROZEN_ORDERED_IDS_DIGEST);
    expect(suite.contractProvenance.caseContentDigest).toBe(caseContentDigest(suite.cases));
    expect(suite.contractProvenance.orderedIdsDigest).toBe(orderedIdsDigest(suite.cases));

    const changed = structuredClone(suite);
    changed.cases[0].question = "Changed frozen question";
    changed.contractProvenance.caseContentDigest = caseContentDigest(changed.cases);
    expect(lintSuite(changed, loadManifest())).toContain(
      "contractProvenance.caseContentDigest does not match the frozen contract literal"
    );
  });

  it("requires 10 positive recoveries and no premature negative detour", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const pass = gradeResults(suite, resultFor(suite, 10));
    expect(pass).toMatchObject({
      pass: true,
      complete: true,
      identityPass: true,
      reviewPass: true,
      positivePasses: 10,
      prematureDetours: 0
    });

    expect(gradeResults(suite, resultFor(suite, 9)).pass).toBe(false);
    expect(gradeResults(suite, resultFor(suite, 10, true)).pass).toBe(false);
  });

  it("rejects an unpinned or incomplete stored result", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const result = resultFor(suite, 12);
    result.caseContentDigest = "sha256(JSON.stringify(cases))=bad";
    result.rows.pop();
    expect(gradeResults(suite, result)).toMatchObject({
      pass: false,
      complete: false,
      identityPass: false
    });
  });

  it("rejects an artifact without the reviewed schema and same-execute recovery", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const raw = resultFor(suite, 12);
    delete raw.artifactSchema;
    expect(gradeResults(suite, raw).reviewPass).toBe(false);

    const sameExecute = resultFor(suite, 12);
    const positive = sameExecute.rows.find((row) => row.id === suite.cases[0].id);
    positive.operations[1].executeCallIndex = positive.operations[0].executeCallIndex;
    expect(gradeResults(suite, sameExecute).positivePasses).toBe(11);
  });

  it("requires an empty or adjacent reviewed evidence label for each positive", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const sufficient = resultFor(suite, 12);
    sufficient.rows[0].operations[0].evidence = "sufficient";
    sufficient.review.annotations.rows[0].initialEvidenceReview.outcome = "sufficient";
    sufficient.review.annotationsSha256 = artifactSha256(sufficient.review.annotations);
    expect(gradeResults(suite, sufficient).positives[0].sequencePass).toBe(false);

    const other = resultFor(suite, 12);
    other.rows[0].operations = [];
    other.collection.artifact.rows[0].operations = [];
    other.collection.sha256 = artifactSha256(other.collection.artifact);
    other.review.annotations.collectionSha256 = other.collection.sha256;
    other.review.annotations.rows[0].initialEvidenceReview = {
      operationSequence: null,
      outcome: "other",
      evidence: ["the required operation did not run"]
    };
    other.review.annotationsSha256 = artifactSha256(other.review.annotations);
    expect(gradeResults(suite, other).reviewPass).toBe(true);
    expect(gradeResults(suite, other).positives[0].sequencePass).toBe(false);
  });

  it("accepts an adjacent authority followed by one later pinned recovery", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const reviewed = resultFor(suite, 12);
    reviewed.rows[0].operations[0].evidence = "adjacent";
    reviewed.review.annotations.rows[0].initialEvidenceReview.outcome = "adjacent";
    reviewed.review.annotationsSha256 = artifactSha256(reviewed.review.annotations);
    expect(gradeResults(suite, reviewed).positives[0]).toMatchObject({ pass: true, sequencePass: true });
  });

  it("rejects a suite that retains an expected evidence label", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    suite.cases[0].initialEvidence.outcome = "empty";
    expect(lintSuite(suite, loadManifest())).toContain("cases[0].initialEvidence must contain only id");
  });

  it("fails the gate when an executed operation projection has an error", () => {
    const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));
    const reviewed = resultFor(suite, 12);
    const error = { executeCallIndex: 1, message: "operation projection failed" };
    reviewed.rows[0].operationParseErrors = [error];
    reviewed.collection.artifact.rows[0].operationParseErrors = [error];
    reviewed.collection.sha256 = artifactSha256(reviewed.collection.artifact);
    reviewed.review.annotations.collectionSha256 = reviewed.collection.sha256;
    reviewed.review.annotationsSha256 = artifactSha256(reviewed.review.annotations);
    const grade = gradeResults(suite, reviewed);
    expect(grade.reviewPass).toBe(true);
    expect(grade.operationProjectionErrors).toBe(1);
    expect(grade.positives[0].projectionPass).toBe(false);
    expect(grade.pass).toBe(false);
  });
});
