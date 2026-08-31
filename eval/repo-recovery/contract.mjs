import { createHash } from "node:crypto";

export const CONTRACT = "repository-tooling-recovery-v2";
export const POSITIVE_TOTAL = 12;
export const NEGATIVE_TOTAL = 8;
export const REQUIRED_POSITIVE_PASSES = 10;
export const MAX_PREMATURE_DETOURS = 0;
export const EXPLAIN_REPO_ID = "scout.explainRepo";
export const COLLECTION_SCHEMA = "repository-recovery-collection-v1";
export const REVIEW_ANNOTATIONS_SCHEMA = "repository-recovery-review-annotations-v1";
export const REVIEWED_SCHEMA = "repository-recovery-reviewed-v1";
export const COLLECTION_ARTIFACT_SCHEMA = COLLECTION_SCHEMA;
export const REVIEWED_ARTIFACT_SCHEMA = REVIEWED_SCHEMA;
export const FROZEN_CASE_CONTENT_DIGEST =
  "sha256(JSON.stringify(cases))=482547a95a07f760f892bc72f9014d51f9e7dec26ac457ab83e4d1a3225a5479";
export const FROZEN_ORDERED_IDS_DIGEST =
  "sha256(ids.join(\"\\n\"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
export const REVIEW_EFFORTS = new Set(["high", "xhigh"]);
export const EVIDENCE_OUTCOMES = new Set(["empty", "adjacent", "sufficient", "other"]);
export const RECOVERY_TRIGGER_OUTCOMES = new Set(["empty", "adjacent"]);
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function caseContentDigest(cases) {
  return `sha256(JSON.stringify(cases))=${sha256(JSON.stringify(cases))}`;
}

export function orderedIdsDigest(cases) {
  return `sha256(ids.join("\\n"))=${sha256(cases.map((entry) => entry.id).join("\n"))}`;
}

export function suiteIdentity(suite) {
  return {
    contract: suite.contract,
    caseContentDigest: caseContentDigest(suite.cases ?? []),
    orderedIdsDigest: orderedIdsDigest(suite.cases ?? [])
  };
}

export function operationIds(row) {
  return (row.operations ?? []).map((entry) => entry.id);
}

export function positiveRowPass(caseEntry, row) {
  const ids = operationIds(row);
  const initialIndex = ids.indexOf(caseEntry.initialEvidence.id);
  const explainIndexes = ids
    .map((id, index) => id === EXPLAIN_REPO_ID ? index : -1)
    .filter((index) => index >= 0);
  const explainIndex = explainIndexes[0] ?? -1;
  const explainCall = explainIndex >= 0 ? row.operations[explainIndex] : undefined;
  const initialCall = initialIndex >= 0 ? row.operations[initialIndex] : undefined;
  const sequencePass =
    initialIndex >= 0 &&
    explainIndexes.length === 1 &&
    explainIndex > initialIndex &&
    Number.isInteger(initialCall?.executeCallIndex) &&
    Number.isInteger(explainCall?.executeCallIndex) &&
    explainCall.executeCallIndex > initialCall.executeCallIndex &&
    RECOVERY_TRIGGER_OUTCOMES.has(initialCall?.evidence) &&
    explainCall?.args?.repo === caseEntry.repository;
  const answerPass =
    row.answerReview?.correct === true &&
    row.answerReview?.grounded === true &&
    Array.isArray(row.answerReview.evidence) &&
    row.answerReview.evidence.length > 0;
  const projectionPass = (row.operationParseErrors ?? []).length === 0;
  return { pass: sequencePass && answerPass && projectionPass, sequencePass, answerPass, projectionPass };
}

export function negativePrematureDetour(caseEntry, row) {
  const operations = row.operations ?? [];
  const ids = operationIds(row);
  const explainIndex = ids.indexOf(EXPLAIN_REPO_ID);
  if (explainIndex < 0) return false;
  const authorityIndex = ids.findIndex((id) =>
    id === caseEntry.initialEvidence.id || id.startsWith("stellarDocs.") || id.startsWith("skills.")
  );
  if (authorityIndex < 0) return true;
  const explainCall = operations[explainIndex];
  const authorityCall = operations[authorityIndex];
  if (
    !Number.isInteger(explainCall?.executeCallIndex) ||
    !Number.isInteger(authorityCall?.executeCallIndex) ||
    explainCall.executeCallIndex <= authorityCall.executeCallIndex
  ) return true;
  return explainIndex < authorityIndex;
}

function stripReviewFields(row) {
  const { answerReview: _answerReview, ...base } = row ?? {};
  return {
    ...base,
    operations: (base.operations ?? []).map(({ evidence: _evidence, evidenceReview: _evidenceReview, ...operation }) => operation)
  };
}

function integrity(condition, message) {
  if (!condition) throw new Error(message);
}

export function sameClaimedActor(candidate, disqualified) {
  const normalized = String(candidate ?? "").toLowerCase();
  return disqualified.some((value) =>
    normalized === value ||
    (normalized.length >= 5 && value.length >= 5 && (normalized.includes(value) || value.includes(normalized)))
  );
}

function assertReviewedArtifactIntegrity(result, cases) {
  const collection = result.collection?.artifact;
  const annotations = result.review?.annotations;
  integrity(collection?.artifactSchema === COLLECTION_ARTIFACT_SCHEMA, "embedded collection schema is invalid");
  integrity(annotations?.artifactSchema === REVIEW_ANNOTATIONS_SCHEMA, "embedded annotation schema is invalid");
  integrity(SHA256_PATTERN.test(result.collection?.sha256 ?? ""), "collection SHA-256 is invalid");
  integrity(SHA256_PATTERN.test(result.review?.annotationsSha256 ?? ""), "annotation SHA-256 is invalid");
  integrity(sha256(JSON.stringify(collection)) === result.collection.sha256, "embedded collection SHA-256 does not match");
  integrity(sha256(JSON.stringify(annotations)) === result.review.annotationsSha256, "embedded annotation SHA-256 does not match");
  integrity(annotations.collectionSha256 === result.collection.sha256, "annotations target a different collection");
  integrity(collection.meta?.comparable === true, "embedded collection is not comparable");
  integrity(collection.meta?.completeness?.complete === true, "embedded collection is incomplete");
  integrity(
    collection.contract === result.contract &&
    collection.caseContentDigest === result.caseContentDigest &&
    collection.orderedIdsDigest === result.orderedIdsDigest,
    "embedded collection identity differs from reviewed identity"
  );
  const reviewer = result.review?.reviewer;
  integrity(reviewer?.independent === true, "reviewer independence attestation is missing");
  integrity(REVIEW_EFFORTS.has(reviewer?.effort), "reviewer effort must be high or xhigh");
  integrity(typeof reviewer?.identity === "string" && reviewer.identity === reviewer.identity.trim() && reviewer.identity.length > 0,
    "reviewer identity is empty or padded");
  integrity(typeof reviewer?.model === "string" && reviewer.model === reviewer.model.trim() && reviewer.model.length > 0,
    "reviewer model is empty or padded");
  integrity(JSON.stringify(reviewer) === JSON.stringify(annotations.reviewer), "reviewer records do not match");
  integrity(
    result.review?.reviewedAt === annotations.reviewedAt &&
    ISO_TIMESTAMP_PATTERN.test(annotations.reviewedAt ?? "") &&
    !Number.isNaN(Date.parse(annotations.reviewedAt)),
    "reviewedAt is not one matching UTC ISO timestamp"
  );
  const disqualified = [
    collection.meta?.roles?.collectorAuthor,
    collection.meta?.roles?.orchestrator,
    collection.meta?.answering?.model
  ].filter(Boolean).map((value) => String(value).toLowerCase());
  integrity(!sameClaimedActor(reviewer.identity, disqualified), "reviewer identity overlaps a disqualified actor");
  integrity(!sameClaimedActor(reviewer.model, disqualified), "reviewer model overlaps a disqualified actor");
  integrity(annotations.rows?.length === cases.length, "annotations do not contain exactly one row per case");
  const annotationById = new Map((annotations.rows ?? []).map((row) => [row.id, row]));
  integrity(
    annotationById.size === cases.length &&
    collection.rows?.length === cases.length &&
    result.rows?.length === cases.length,
    "reviewed, collection, or annotation row count is invalid"
  );
  for (const [index, caseEntry] of cases.entries()) {
    const reviewedRow = result.rows?.[index];
    const rawRow = collection.rows[index];
    const annotation = annotationById.get(caseEntry.id);
    integrity(
      Boolean(
      !reviewedRow || !rawRow || !annotation ||
      reviewedRow.id !== caseEntry.id || rawRow.id !== caseEntry.id || annotation.id !== caseEntry.id ||
      rawRow.answerReview !== undefined ||
      (rawRow.operations ?? []).some((operation) =>
        operation.evidence !== undefined || operation.evidenceReview !== undefined
      )
      ) === false,
      `${caseEntry.id}: row identity or raw review-field contract is invalid`
    );
    integrity(JSON.stringify(stripReviewFields(reviewedRow)) === JSON.stringify(rawRow),
      `${caseEntry.id}: reviewed row changes raw evidence`);
    const answerReview = annotation.answerReview;
    integrity(
      !(
      typeof answerReview?.correct !== "boolean" ||
      typeof answerReview?.grounded !== "boolean" ||
      !Array.isArray(answerReview?.evidence) ||
      answerReview.evidence.length === 0 ||
      answerReview.evidence.some((item) => typeof item !== "string" || !item.trim()) ||
      JSON.stringify(reviewedRow.answerReview) !== JSON.stringify(answerReview)
      ),
      `${caseEntry.id}: answerReview is incomplete or does not match annotations`
    );
    const operationSequence = annotation.initialEvidenceReview?.operationSequence;
    const outcome = annotation.initialEvidenceReview?.outcome;
    const evidence = annotation.initialEvidenceReview?.evidence;
    integrity(
      !(
      !EVIDENCE_OUTCOMES.has(outcome) ||
      !Array.isArray(evidence) || evidence.length === 0 ||
      evidence.some((item) => typeof item !== "string" || !item.trim())
      ),
      `${caseEntry.id}: initialEvidenceReview is incomplete`
    );
    const selected = reviewedRow.operations?.find((operation) => operation.sequence === operationSequence);
    const firstInitialOperation = reviewedRow.operations?.find(
      (operation) => operation.id === caseEntry.initialEvidence.id
    );
    const operationOverlaysPass = (reviewedRow.operations ?? []).every((operation) => {
      if (operationSequence != null && operation.sequence === operationSequence) {
        return operation.evidence === outcome && JSON.stringify(operation.evidenceReview) === JSON.stringify(evidence);
      }
      return operation.evidence === undefined && operation.evidenceReview === undefined;
    });
    integrity(operationOverlaysPass, `${caseEntry.id}: evidence overlays do not match annotations`);
    if (operationSequence == null) {
      integrity(outcome === "other", `${caseEntry.id}: a missing initial operation must use outcome other`);
      continue;
    }
    integrity(Number.isInteger(operationSequence) && (
      selected === firstInitialOperation &&
      selected.evidence === outcome &&
      JSON.stringify(selected.evidenceReview) === JSON.stringify(evidence)
    ), `${caseEntry.id}: selected initial-evidence operation is not the first collected authority`);
  }
}

function reviewedArtifactIntegrityReasons(result, cases) {
  try {
    assertReviewedArtifactIntegrity(result, cases);
    return [];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

export function gradeResults(suite, result) {
  const cases = suite.cases ?? [];
  const rows = result.rows ?? [];
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const positives = [];
  const negatives = [];
  for (const caseEntry of cases) {
    const row = rowsById.get(caseEntry.id);
    if (caseEntry.class === "positive") {
      positives.push({ id: caseEntry.id, ...(row ? positiveRowPass(caseEntry, row) : {
        pass: false,
        sequencePass: false,
        answerPass: false,
        projectionPass: false
      }) });
    } else {
      negatives.push({
        id: caseEntry.id,
        prematureDetour: row ? negativePrematureDetour(caseEntry, row) : true,
        projectionPass: row ? (row.operationParseErrors ?? []).length === 0 : false
      });
    }
  }
  const positivePasses = positives.filter((entry) => entry.pass).length;
  const prematureDetours = negatives.filter((entry) => entry.prematureDetour).length;
  const expectedIds = cases.map((entry) => entry.id);
  const rowIds = rows.map((entry) => entry.id);
  const complete =
    rows.length === cases.length &&
    new Set(rowIds).size === rowIds.length &&
    expectedIds.every((id) => rowsById.has(id)) &&
    rowIds.every((id) => expectedIds.includes(id));
  const identity = suiteIdentity(suite);
  const identityPass =
    result.contract === identity.contract &&
    result.caseContentDigest === identity.caseContentDigest &&
    result.orderedIdsDigest === identity.orderedIdsDigest;
  const reviewReasons = [];
  if (result.artifactSchema !== REVIEWED_ARTIFACT_SCHEMA) reviewReasons.push("reviewed artifact schema is invalid");
  if (result.review?.artifactSchema !== REVIEW_ANNOTATIONS_SCHEMA) reviewReasons.push("review annotation schema is invalid");
  if (!rows.every((row) => row.answerReview !== undefined)) reviewReasons.push("one or more rows have no answerReview");
  reviewReasons.push(...reviewedArtifactIntegrityReasons(result, cases));
  const reviewPass = reviewReasons.length === 0;
  const operationProjectionErrors = rows.reduce((sum, row) => sum + (row.operationParseErrors ?? []).length, 0);
  return {
    contract: CONTRACT,
    complete,
    identityPass,
    reviewPass,
    reviewReasons,
    operationProjectionErrors,
    maxOperationProjectionErrors: 0,
    positivePasses,
    positiveTotal: positives.length,
    requiredPositivePasses: REQUIRED_POSITIVE_PASSES,
    prematureDetours,
    negativeTotal: negatives.length,
    maxPrematureDetours: MAX_PREMATURE_DETOURS,
    pass:
      complete &&
      identityPass &&
      reviewPass &&
      operationProjectionErrors === 0 &&
      positivePasses >= REQUIRED_POSITIVE_PASSES &&
      prematureDetours <= MAX_PREMATURE_DETOURS,
    positives,
    negatives
  };
}
