import { parse } from "acorn";
import { normalizeCode } from "../../src/catalog/vendor/normalize.ts";
import {
  COLLECTION_SCHEMA,
  EVIDENCE_OUTCOMES,
  REVIEW_ANNOTATIONS_SCHEMA,
  REVIEW_EFFORTS,
  REVIEWED_SCHEMA,
  sameClaimedActor,
  sha256,
  suiteIdentity
} from "./contract.mjs";
export {
  COLLECTION_SCHEMA,
  REVIEW_ANNOTATIONS_SCHEMA,
  REVIEWED_SCHEMA
} from "./contract.mjs";

export const SUCCESSFUL_PATH_PAID_CALLS = 20;
export const MAX_PAID_CALLS = 40;
export const MAX_ATTEMPTS_PER_CASE = 2;
export const RECOVERY_COST_PLAN = Object.freeze({
  cohort: "2026-08-27 connector collect-only, 8 cases per run",
  cohortClaudeVersion: "2.1.247",
  cohortWrapperSha256: "a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297",
  plannedClaudeVersion: "2.1.251",
  runMeansUsd: Object.freeze([0.280770775, 0.2965796]),
  pooledCallMinUsd: 0.0661584,
  pooledCallMedianUsd: 0.2353369,
  pooledCallMaxUsd: 0.5837418,
  pooledCallMeanUsd: 0.2886751875,
  successfulPathAtObservedMaxUsd: 11.674836,
  maximumPathAtObservedMaxUsd: 23.349672,
  hardCapUsd: 30,
  headroomUsd: 6.650328,
  headroomPercent: 28.4815
});

const SERVICE_NAMES = new Set(["lumenloop", "scout", "stellarDocs"]);

export function artifactSha256(value) {
  return sha256(JSON.stringify(value));
}

function parsedToolInput(input) {
  try {
    return JSON.parse(String(input ?? ""));
  } catch {
    return null;
  }
}

function serviceName(node, bindings, seen = new Set()) {
  if (node?.type !== "Identifier") return null;
  if (SERVICE_NAMES.has(node.name)) return node.name;
  if (seen.has(node.name) || !bindings.has(node.name)) return null;
  return serviceName(bindings.get(node.name), bindings, new Set([...seen, node.name]));
}

function memberName(node, bindings) {
  if (!node || node.type !== "MemberExpression") return null;
  const service = serviceName(node.object, bindings);
  if (!service) return null;
  const property = node.computed
    ? staticValue(node.property, bindings)
    : { complete: node.property?.type === "Identifier", value: node.property?.name };
  if (!property.complete || typeof property.value !== "string") return null;
  return `${service}.${property.value}`;
}

function operationName(node, bindings, operationBindings, seen = new Set()) {
  if (node?.type === "MemberExpression") return memberName(node, bindings);
  if (node?.type !== "Identifier" || seen.has(node.name)) return null;
  if (operationBindings.has(node.name)) return operationBindings.get(node.name);
  const binding = bindings.get(node.name);
  if (!binding) return null;
  return operationName(binding, bindings, operationBindings, new Set([...seen, node.name]));
}

function unresolvedServiceCall(node, bindings, operationBindings) {
  if (operationName(node, bindings, operationBindings)) return false;
  if (node?.type === "MemberExpression" && serviceName(node.object, bindings)) return true;
  if (node?.type === "Identifier" && bindings.has(node.name)) {
    return unresolvedServiceCall(bindings.get(node.name), bindings, operationBindings);
  }
  return false;
}

function isSkillRead(node) {
  if (!node || node.type !== "MemberExpression" || node.computed) return false;
  if (node.object?.type === "Identifier" && node.object.name === "codemode") {
    return node.property?.type === "Identifier" && node.property.name === "skill_read";
  }
  return (
    node.property?.type === "Identifier" &&
    node.property.name === "read" &&
    node.object?.type === "MemberExpression" &&
    !node.object.computed &&
    node.object.object?.type === "Identifier" &&
    node.object.object.name === "codemode" &&
    node.object.property?.type === "Identifier" &&
    node.object.property.name === "skill"
  );
}

function skillReadId(node, bindings) {
  if (!isSkillRead(node.callee)) return null;
  const skill = staticValue(node.arguments[0], bindings);
  const options = staticValue(node.arguments[1], bindings);
  if (!skill.complete || typeof skill.value !== "string") return "skills.unknown";
  const sections = options.complete && Array.isArray(options.value?.sections)
    ? options.value.sections.filter((section) => typeof section === "string")
    : [];
  const skillId = skill.value.startsWith("skills.") ? skill.value : `skills.${skill.value}`;
  return sections.length === 1 ? `${skillId}#${sections[0]}` : skillId;
}

function staticValue(node, bindings, seen = new Set()) {
  if (!node) return { complete: false, value: null };
  if (node.type === "Literal") return { complete: true, value: node.value };
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return { complete: true, value: node.quasis[0]?.value?.cooked ?? "" };
  }
  if (node.type === "Identifier") {
    if (node.name === "undefined") return { complete: true, value: null };
    if (seen.has(node.name) || !bindings.has(node.name)) return { complete: false, value: null };
    return staticValue(bindings.get(node.name), bindings, new Set([...seen, node.name]));
  }
  if (node.type === "UnaryExpression" && ["+", "-"].includes(node.operator)) {
    const inner = staticValue(node.argument, bindings, seen);
    if (!inner.complete || typeof inner.value !== "number") return { complete: false, value: null };
    return { complete: true, value: node.operator === "-" ? -inner.value : inner.value };
  }
  if (node.type === "ArrayExpression") {
    const values = node.elements.map((entry) => staticValue(entry, bindings, seen));
    return values.every((entry) => entry.complete)
      ? { complete: true, value: values.map((entry) => entry.value) }
      : { complete: false, value: null };
  }
  if (node.type === "ObjectExpression") {
    const out = {};
    for (const property of node.properties) {
      if (property.type !== "Property" || property.kind !== "init" || property.computed) {
        return { complete: false, value: null };
      }
      const key = property.key.type === "Identifier" ? property.key.name : property.key.value;
      if (typeof key !== "string") return { complete: false, value: null };
      const value = staticValue(property.value, bindings, seen);
      if (!value.complete) return { complete: false, value: null };
      Object.defineProperty(out, key, {
        value: value.value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return { complete: true, value: out };
  }
  if (
    node.type === "CallExpression" &&
    node.callee?.type === "MemberExpression" &&
    node.callee.object?.name === "JSON" &&
    node.callee.property?.name === "parse" &&
    node.arguments.length === 1
  ) {
    const encoded = staticValue(node.arguments[0], bindings, seen);
    if (!encoded.complete || typeof encoded.value !== "string") return { complete: false, value: null };
    try {
      return { complete: true, value: JSON.parse(encoded.value) };
    } catch {
      return { complete: false, value: null };
    }
  }
  return { complete: false, value: null };
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (["start", "end", "loc"].includes(key)) continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else if (value && typeof value.type === "string") {
      walk(value, visit);
    }
  }
}

export function extractOperationsFromCode(code, executeCallIndex) {
  const normalizedCode = normalizeCode(String(code ?? ""));
  let tree;
  try {
    tree = parse(normalizedCode, { ecmaVersion: "latest", sourceType: "module" });
  } catch (error) {
    return {
      operations: [],
      parseError: error instanceof Error ? error.message : String(error)
    };
  }
  const bindings = new Map();
  const destructuredBindings = [];
  const calls = [];
  walk(tree, (node) => {
    if (node.type === "VariableDeclarator" && node.id?.type === "Identifier" && node.init) {
      bindings.set(node.id.name, node.init);
    }
    if (node.type === "VariableDeclarator" && node.id?.type === "ObjectPattern" && node.init) {
      destructuredBindings.push(node);
    }
    if (node.type === "CallExpression") calls.push({ node });
  });
  const operationBindings = new Map();
  for (const declarator of destructuredBindings) {
    const service = serviceName(declarator.init, bindings);
    if (!service) continue;
    for (const property of declarator.id.properties) {
      if (
        property.type !== "Property" || property.computed ||
        property.key?.type !== "Identifier" || property.value?.type !== "Identifier"
      ) continue;
      operationBindings.set(property.value.name, `${service}.${property.key.name}`);
    }
  }
  const operationCalls = calls
    .map(({ node }) => ({ node, id: operationName(node.callee, bindings, operationBindings) ?? skillReadId(node, bindings) }))
    .filter((entry) => entry.id);
  const unresolvedCalls = calls.filter(({ node }) => unresolvedServiceCall(node.callee, bindings, operationBindings));
  if (unresolvedCalls.length > 0) {
    return {
      operations: [],
      parseError: `operation projection cannot resolve ${unresolvedCalls.length} dynamic service call(s)`
    };
  }
  operationCalls.sort((a, b) => a.node.start - b.node.start);
  return {
    operations: operationCalls.map(({ node, id }, sourceOrder) => {
      const firstArgument = node.arguments[0];
      const resolved = id.startsWith("skills.")
        ? {
            complete: true,
            value: {
              skillId: staticValue(node.arguments[0], bindings).value,
              options: staticValue(node.arguments[1], bindings).value
            }
          }
        : staticValue(firstArgument, bindings);
      return {
        id,
        executeCallIndex,
        sourceOrder,
        argumentsSource: node.arguments.map((argument) => normalizedCode.slice(argument.start, argument.end)),
        args: resolved.complete && resolved.value && typeof resolved.value === "object"
          ? resolved.value
          : null,
        argsResolved: resolved.complete
      };
    }),
    parseError: null
  };
}

export function projectTranscript(transcript) {
  const toolCalls = [];
  const operations = [];
  const parseErrors = [];
  for (const [toolIndex, entry] of (transcript ?? []).entries()) {
    const input = parsedToolInput(entry.input);
    toolCalls.push({
      sequence: toolIndex + 1,
      tool: entry.tool,
      args: input,
      argsSource: entry.input,
      result: entry.result ?? null,
      resultProjection: entry.resultProjection ?? null,
      resultChars: entry.resultChars ?? null,
      isError: Boolean(entry.isError)
    });
    if (!String(entry.tool ?? "").endsWith("execute")) continue;
    const code = input?.code;
    const extracted = extractOperationsFromCode(code, toolIndex + 1);
    if (extracted.parseError) {
      parseErrors.push({ executeCallIndex: toolIndex + 1, message: extracted.parseError });
    }
    operations.push(...extracted.operations);
  }
  return {
    toolCalls,
    operations: operations.map((operation, index) => ({ ...operation, sequence: index + 1 })),
    parseErrors
  };
}

export function createPaidCallLedger(maxPaidCalls) {
  if (!Number.isInteger(maxPaidCalls) || maxPaidCalls < 1 || maxPaidCalls > MAX_PAID_CALLS) {
    throw new Error(`--max-paid-calls must be an integer from 1 through ${MAX_PAID_CALLS}`);
  }
  return { cap: maxPaidCalls, attempted: 0, calls: [], stoppedBefore: null };
}

export function authorizePaidCall(ledger, { id, attempt }) {
  if (ledger.attempted >= ledger.cap) {
    ledger.stoppedBefore ??= { id, attempt, reason: "call-cap" };
    const error = new Error(`paid call cap reached before answering attempt ${attempt} for ${id}`);
    error.code = "call-cap";
    throw error;
  }
  ledger.attempted += 1;
  const call = { number: ledger.attempted, id, attempt };
  ledger.calls.push(call);
  return call;
}

export function paidCallLedgerRecord(ledger) {
  return {
    cap: ledger.cap,
    successfulPathCalls: SUCCESSFUL_PATH_PAID_CALLS,
    maximumContractCalls: MAX_PAID_CALLS,
    attempted: ledger.attempted,
    remaining: ledger.cap - ledger.attempted,
    stoppedBefore: ledger.stoppedBefore,
    calls: ledger.calls
  };
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} is required`);
  if (value !== value.trim()) throw new Error(`${label} must not contain surrounding whitespace`);
  return value;
}

export function assertCollection(suite, collection) {
  const identity = suiteIdentity(suite);
  if (collection?.artifactSchema !== COLLECTION_SCHEMA) {
    throw new Error(`collection artifactSchema must be ${COLLECTION_SCHEMA}`);
  }
  for (const key of ["contract", "caseContentDigest", "orderedIdsDigest"]) {
    if (collection[key] !== identity[key]) throw new Error(`collection ${key} does not match the frozen suite`);
  }
  if (collection?.meta?.comparable !== true) throw new Error("collection is not comparable");
  if (collection?.meta?.completeness?.complete !== true) throw new Error("collection is incomplete");
  const expectedIds = suite.cases.map((entry) => entry.id);
  const rowIds = (collection.rows ?? []).map((entry) => entry.id);
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedIds)) {
    throw new Error("collection rows do not match the frozen ordered IDs");
  }
  if (collection.rows.some((row) => row.answerReview !== undefined)) {
    throw new Error("raw collection must not contain answerReview");
  }
  if (collection.rows.some((row) => (row.operations ?? []).some((operation) =>
    operation.evidence !== undefined || operation.evidenceReview !== undefined
  ))) {
    throw new Error("raw collection must not contain evidence review fields");
  }
}

function assertReviewerEligibility(collection, reviewer) {
  const identity = requireText(reviewer?.identity, "reviewer.identity");
  const model = requireText(reviewer?.model, "reviewer.model");
  const effort = requireText(reviewer?.effort, "reviewer.effort");
  if (!REVIEW_EFFORTS.has(effort)) throw new Error("reviewer.effort must be high or xhigh");
  if (reviewer?.independent !== true) throw new Error("reviewer.independent must be true");
  const disqualified = [
    collection.meta?.roles?.collectorAuthor,
    collection.meta?.roles?.orchestrator,
    collection.meta?.answering?.model
  ].filter(Boolean).map((value) => String(value).toLowerCase());
  if (sameClaimedActor(identity, disqualified) || sameClaimedActor(model, disqualified)) {
    throw new Error("reviewer must differ from the collector author, orchestrator, and answering model");
  }
  return { ...reviewer, identity, model, effort };
}

export function buildReviewedArtifact(suite, collection, annotations) {
  assertCollection(suite, collection);
  if (annotations?.artifactSchema !== REVIEW_ANNOTATIONS_SCHEMA) {
    throw new Error(`annotations artifactSchema must be ${REVIEW_ANNOTATIONS_SCHEMA}`);
  }
  const collectionDigest = artifactSha256(collection);
  if (annotations.collectionSha256 !== collectionDigest) {
    throw new Error("annotations do not target this exact collection artifact");
  }
  const reviewer = assertReviewerEligibility(collection, annotations.reviewer);
  const annotationsById = new Map((annotations.rows ?? []).map((row) => [row.id, row]));
  if (annotations.rows?.length !== suite.cases.length || annotationsById.size !== suite.cases.length) {
    throw new Error("annotations must review all frozen cases exactly once");
  }
  const rows = suite.cases.map((caseEntry, index) => {
    const raw = collection.rows[index];
    const annotation = annotationsById.get(caseEntry.id);
    if (!annotation) throw new Error(`missing annotation for ${caseEntry.id}`);
    const operationSequence = annotation.initialEvidenceReview?.operationSequence;
    const outcome = annotation.initialEvidenceReview?.outcome;
    if (!EVIDENCE_OUTCOMES.has(outcome)) throw new Error(`${caseEntry.id}: invalid reviewed evidence outcome`);
    const reviewedOperation = operationSequence == null
      ? null
      : raw.operations?.find((operation) => operation.sequence === operationSequence);
    const firstInitialOperation = raw.operations?.find(
      (operation) => operation.id === caseEntry.initialEvidence.id
    );
    if (reviewedOperation && reviewedOperation.id !== caseEntry.initialEvidence.id) {
      throw new Error(`${caseEntry.id}: initialEvidenceReview selected the wrong collected operation`);
    }
    if (reviewedOperation && reviewedOperation !== firstInitialOperation) {
      throw new Error(`${caseEntry.id}: initialEvidenceReview must select the first collected authority`);
    }
    if (!reviewedOperation && (operationSequence != null || outcome !== "other")) {
      throw new Error(`${caseEntry.id}: a missing initial operation must use null sequence and other outcome`);
    }
    const basis = annotation.initialEvidenceReview?.evidence;
    if (!Array.isArray(basis) || basis.length === 0 || basis.some((item) => typeof item !== "string" || !item.trim())) {
      throw new Error(`${caseEntry.id}: initialEvidenceReview.evidence is required`);
    }
    const answerReview = annotation.answerReview;
    if (
      typeof answerReview?.correct !== "boolean" ||
      typeof answerReview?.grounded !== "boolean" ||
      !Array.isArray(answerReview?.evidence) ||
      answerReview.evidence.length === 0 ||
      answerReview.evidence.some((item) => typeof item !== "string" || !item.trim())
    ) {
      throw new Error(`${caseEntry.id}: a complete independent answerReview is required`);
    }
    return {
      ...raw,
      operations: raw.operations.map((operation) => reviewedOperation && operation.sequence === operationSequence
        ? { ...operation, evidence: outcome, evidenceReview: basis }
        : operation),
      answerReview
    };
  });
  const reviewedAt = requireText(annotations.reviewedAt, "annotations.reviewedAt");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(reviewedAt) || Number.isNaN(Date.parse(reviewedAt))) {
    throw new Error("annotations.reviewedAt must be a UTC ISO timestamp");
  }
  return {
    artifactSchema: REVIEWED_SCHEMA,
    ...suiteIdentity(suite),
    collection: {
      artifactSchema: collection.artifactSchema,
      sha256: collectionDigest,
      artifact: collection
    },
    review: {
      artifactSchema: annotations.artifactSchema,
      annotationsSha256: artifactSha256(annotations),
      annotations,
      reviewer,
      reviewedAt
    },
    rows
  };
}

export function buildReviewPacket(suite, collection) {
  assertCollection(suite, collection);
  return {
    artifactSchema: "repository-recovery-review-packet-v1",
    collectionSha256: artifactSha256(collection),
    contract: collection.contract,
    caseContentDigest: collection.caseContentDigest,
    orderedIdsDigest: collection.orderedIdsDigest,
    instructions: [
      "Review every stored answer and transcript independently.",
      "Select the collected initial-evidence operation, or use null with outcome other when it never ran.",
      "Classify the initial evidence from the visible tool result, not from the frozen expected label.",
      "Set answerReview.correct and answerReview.grounded from the golden and pinned truth sources.",
      "Do not alter the collection artifact or infer a review from the answering model."
    ],
    cases: suite.cases.map((caseEntry, index) => ({
      id: caseEntry.id,
      class: caseEntry.class,
      question: caseEntry.question,
      requiredInitialOperationId: caseEntry.initialEvidence.id,
      golden: caseEntry.golden,
      truth: caseEntry.truth,
      collected: {
        answer: collection.rows[index].answer,
        transcript: collection.rows[index].transcript,
        toolCalls: collection.rows[index].toolCalls,
        operations: collection.rows[index].operations,
        operationParseErrors: collection.rows[index].operationParseErrors,
        attempts: collection.rows[index].attempts,
        retryCount: collection.rows[index].retryCount,
        agent: collection.rows[index].agent
      }
    }))
  };
}
