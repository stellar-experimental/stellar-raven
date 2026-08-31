import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  artifactSha256,
  authorizePaidCall,
  buildReviewPacket,
  buildReviewedArtifact,
  createPaidCallLedger,
  extractOperationsFromCode,
  paidCallLedgerRecord,
  projectTranscript
} from "../eval/repo-recovery/artifact.mjs";
import {
  COLLECTION_SCHEMA,
  REVIEW_ANNOTATIONS_SCHEMA,
  gradeResults,
  suiteIdentity
} from "../eval/repo-recovery/contract.mjs";
import { DEFAULT_SUITE_PATH } from "../eval/repo-recovery/lint.mjs";

const suite = JSON.parse(readFileSync(DEFAULT_SUITE_PATH, "utf8"));

function rawCollection() {
  return {
    artifactSchema: COLLECTION_SCHEMA,
    ...suiteIdentity(suite),
    meta: {
      comparable: true,
      completeness: { complete: true },
      answering: { model: "claude-sonnet-5" },
      roles: { collectorAuthor: "codex-gpt-5.6-sol", orchestrator: "codex-gpt-5.6-sol" }
    },
    rows: suite.cases.map((entry) => ({
      id: entry.id,
      answer: "Stored answer",
      transcript: [],
      toolCalls: [],
      operationParseErrors: [],
      operations: [{
        sequence: 1,
        id: entry.initialEvidence.id,
        executeCallIndex: 2,
        sourceOrder: 0,
        args: {}
      }],
      attempts: { answer: [] },
      retryCount: 0,
      agent: { model: "claude-sonnet-5" }
    }))
  };
}

function annotations(collection) {
  return {
    artifactSchema: REVIEW_ANNOTATIONS_SCHEMA,
    collectionSha256: artifactSha256(collection),
    reviewedAt: "2026-08-30T18:00:00Z",
    reviewer: {
      identity: "claude-fable-reviewer",
      model: "claude-fable-5",
      effort: "high",
      independent: true
    },
    rows: suite.cases.map((entry, index) => ({
      id: entry.id,
      initialEvidenceReview: {
        operationSequence: 1,
        outcome: entry.class === "positive" ? (index % 2 === 0 ? "empty" : "adjacent") : "sufficient",
        evidence: ["Reviewed the stored operation result."]
      },
      answerReview: {
        correct: true,
        grounded: true,
        evidence: ["Checked the answer against the pinned truth sources."]
      }
    }))
  };
}

describe("repository-recovery artifact contract", () => {
  it("extracts ordered service and exact skill-section calls with static arguments", () => {
    const code = `async () => {
      const repo = { repo: "stellar/stellar-cli" };
      await stellarDocs.search_sdk_cli_tools_docs({ query: "config home" });
      await codemode.skill.read("stellar-dev.data", { sections: ["network-configuration"] });
      return scout.explainRepo(repo);
    }`;
    const extracted = extractOperationsFromCode(code, 2);
    expect(extracted.parseError).toBeNull();
    expect(extracted.operations).toEqual([
      expect.objectContaining({ id: "stellarDocs.search_sdk_cli_tools_docs", executeCallIndex: 2, args: { query: "config home" } }),
      expect.objectContaining({
        id: "skills.stellar-dev.data#network-configuration",
        executeCallIndex: 2,
        args: { skillId: "stellar-dev.data", options: { sections: ["network-configuration"] } }
      }),
      expect.objectContaining({ id: "scout.explainRepo", executeCallIndex: 2, args: { repo: "stellar/stellar-cli" } })
    ]);
  });

  it("does not duplicate the skills namespace for an already canonical skill ID", () => {
    const extracted = extractOperationsFromCode(`async () =>
      codemode.skill.read("skills.stellar-dev.data", { sections: ["network-configuration"] })`, 1);
    expect(extracted.parseError).toBeNull();
    expect(extracted.operations).toEqual([
      expect.objectContaining({
        id: "skills.stellar-dev.data#network-configuration",
        args: { skillId: "skills.stellar-dev.data", options: { sections: ["network-configuration"] } }
      })
    ]);
  });

  it("normalizes executable code and resolves common service aliases", () => {
    const fenced = `\`\`\`js
const s = scout;
const { search_sdk_cli_tools_docs: docs } = stellarDocs;
await docs({ query: "timeout" });
await s["explainRepo"]({ repo: "stellar/js-stellar-sdk" });
\`\`\``;
    const extracted = extractOperationsFromCode(fenced, 3);
    expect(extracted.parseError).toBeNull();
    expect(extracted.operations).toEqual([
      expect.objectContaining({ id: "stellarDocs.search_sdk_cli_tools_docs", executeCallIndex: 3 }),
      expect.objectContaining({ id: "scout.explainRepo", args: { repo: "stellar/js-stellar-sdk" } })
    ]);

    const dynamic = extractOperationsFromCode(`async () => scout[operation]({ repo: "x" })`, 4);
    expect(dynamic.operations).toEqual([]);
    expect(dynamic.parseError).toMatch(/dynamic service call/);
  });

  it("retains exact search and execute inputs while projecting operation order", () => {
    const transcript = [
      { tool: "mcp__raven__search", input: '{"query":"sdk timeout"}', resultProjection: { hits: [] } },
      {
        tool: "mcp__raven__execute",
        input: '{"code":"async () => stellarDocs.search_sdk_cli_tools_docs({query: \\\"timeout\\\"})"}',
        result: "stored result"
      }
    ];
    const projected = projectTranscript(transcript);
    expect(projected.toolCalls[0]).toMatchObject({ sequence: 1, args: { query: "sdk timeout" } });
    expect(projected.toolCalls[1]).toMatchObject({ sequence: 2, result: "stored result" });
    expect(projected.operations[0]).toMatchObject({
      sequence: 1,
      id: "stellarDocs.search_sdk_cli_tools_docs",
      executeCallIndex: 2,
      args: { query: "timeout" }
    });
  });

  it("prepares a deterministic packet and joins only independent complete annotations", () => {
    const collection = rawCollection();
    const packet = buildReviewPacket(suite, collection);
    expect(packet.collectionSha256).toBe(artifactSha256(collection));
    expect(packet.cases).toHaveLength(20);
    expect(packet.cases[0].collected.answer).toBe("Stored answer");
    expect(packet.cases[0].collected.operationParseErrors).toEqual([]);
    expect(JSON.stringify(packet)).not.toContain("\"outcome\"");
    expect(JSON.stringify(packet)).not.toContain("\"expectedOperationOrder\"");

    const reviewed = buildReviewedArtifact(suite, collection, annotations(collection));
    expect(reviewed.artifactSchema).toBe("repository-recovery-reviewed-v1");
    expect(reviewed.rows[0].operations[0].evidence).toBe("empty");
    expect(reviewed.rows[0].answerReview.correct).toBe(true);
    expect(gradeResults(suite, reviewed).reviewPass).toBe(true);

    const changedCollection = structuredClone(reviewed);
    changedCollection.collection.artifact.rows[0].answer = "Changed after review";
    const changedGrade = gradeResults(suite, changedCollection);
    expect(changedGrade.reviewPass).toBe(false);
    expect(changedGrade.reviewReasons).toContain("embedded collection SHA-256 does not match");

    const changedAnnotation = structuredClone(reviewed);
    changedAnnotation.review.annotations.rows[0].answerReview.correct = false;
    expect(gradeResults(suite, changedAnnotation).reviewPass).toBe(false);

    const extraOverlay = structuredClone(reviewed);
    extraOverlay.rows[0].operations.push({
      sequence: 2,
      id: "scout.explainRepo",
      evidence: "adjacent",
      evidenceReview: ["Not selected by the independent review."]
    });
    extraOverlay.collection.artifact.rows[0].operations.push({ sequence: 2, id: "scout.explainRepo" });
    extraOverlay.collection.sha256 = artifactSha256(extraOverlay.collection.artifact);
    extraOverlay.review.annotations.collectionSha256 = extraOverlay.collection.sha256;
    extraOverlay.review.annotationsSha256 = artifactSha256(extraOverlay.review.annotations);
    expect(gradeResults(suite, extraOverlay).reviewPass).toBe(false);

    const duplicateAuthority = rawCollection();
    duplicateAuthority.rows[0].operations.push({
      sequence: 2,
      id: suite.cases[0].initialEvidence.id,
      executeCallIndex: 3
    });
    const duplicateAnnotations = annotations(duplicateAuthority);
    duplicateAnnotations.rows[0].initialEvidenceReview.operationSequence = 2;
    duplicateAnnotations.collectionSha256 = artifactSha256(duplicateAuthority);
    expect(() => buildReviewedArtifact(suite, duplicateAuthority, duplicateAnnotations))
      .toThrow(/first collected authority/);

    const ineligible = annotations(collection);
    ineligible.reviewer = {
      identity: "claude-sonnet-5",
      model: "claude-sonnet-5",
      effort: "high",
      independent: true
    };
    expect(() => buildReviewedArtifact(suite, collection, ineligible)).toThrow(/reviewer must differ/);

    const padded = annotations(collection);
    padded.reviewer.identity = " claude-fable-reviewer ";
    expect(() => buildReviewedArtifact(suite, collection, padded)).toThrow(/surrounding whitespace/);

    const overlappingCollection = rawCollection();
    overlappingCollection.meta.roles.collectorAuthor = "codex";
    const overlapping = annotations(overlappingCollection);
    overlapping.reviewer.identity = "codex-gpt-5.6-sol-high";
    expect(() => buildReviewedArtifact(suite, overlappingCollection, overlapping)).toThrow(/reviewer must differ/);
  });

  it("stops before a paid call beyond the explicit cap", () => {
    const ledger = createPaidCallLedger(2);
    authorizePaidCall(ledger, { id: "one", attempt: 1 });
    authorizePaidCall(ledger, { id: "two", attempt: 1 });
    expect(() => authorizePaidCall(ledger, { id: "three", attempt: 1 })).toThrow(/call cap/);
    expect(paidCallLedgerRecord(ledger)).toMatchObject({ cap: 2, attempted: 2, remaining: 0 });
  });
});
