import { createHash } from "node:crypto";

const SHA256 = /^[a-f0-9]{64}$/;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalValue(value[key])]),
  );
}

export function canonicalDigest(value) {
  return sha256(JSON.stringify(canonicalValue(value)));
}

export function protocolHistoryCaseDigest(contract) {
  return sha256(JSON.stringify({
    requiredCases: contract.requiredCases,
    forbiddenCases: contract.forbiddenCases,
    neutralCases: contract.neutralCases,
  }));
}

export function targetScoringProjection(manifest, targetOperation) {
  const matches = (manifest?.entries ?? []).filter((entry) => entry.id === targetOperation);
  if (matches.length !== 1) {
    throw new Error(`${targetOperation} resolves to ${matches.length} manifest entries`);
  }
  const entry = matches[0];
  return {
    id: entry.id,
    service: entry.service,
    kind: entry.kind,
    searchable: entry.searchable !== false,
    description: entry.description,
    keywords: entry.keywords ?? [],
    routingKeywords: entry.routingKeywords ?? [],
    knownAliases: entry.knownAliases ?? [],
    knownAliasTriggers: entry.knownAliasTriggers ?? [],
  };
}

export function targetRoutingBlock(inventory, targetOperation) {
  const operationId = targetOperation.split(".").at(-1);
  const matches = [];
  for (const [path, pathItem] of Object.entries(inventory?.openapi?.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (operation?.operationId === operationId) {
        matches.push({ path, method, routing: operation["x-routing"] ?? null });
      }
    }
  }
  if (matches.length !== 1) {
    throw new Error(`${targetOperation} resolves to ${matches.length} inventory operations`);
  }
  if (!matches[0].routing || typeof matches[0].routing !== "object") {
    throw new Error(`${targetOperation} has no x-routing block`);
  }
  return matches[0].routing;
}

export function actualSourceEpoch({ manifestBytes, manifest, inventory, targetOperation }) {
  return {
    manifestSha256: sha256(manifestBytes),
    targetScoringSha256: canonicalDigest(targetScoringProjection(manifest, targetOperation)),
    targetRoutingSha256: canonicalDigest(targetRoutingBlock(inventory, targetOperation)),
  };
}

function validateRoleCases(path, cases, role, seen) {
  if (!Array.isArray(cases)) throw new Error(`${path} ${role}Cases must be an array`);
  return cases.map((testCase) => {
    if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
      throw new Error(`${path} ${role}Cases must contain objects`);
    }
    if (typeof testCase.id !== "string" || testCase.id.length === 0) {
      throw new Error(`${path} ${role} case must have a non-empty id`);
    }
    if (typeof testCase.question !== "string" || testCase.question.length === 0) {
      throw new Error(`${path} ${testCase.id} must have a non-empty question`);
    }
    if (typeof testCase.class !== "string" || testCase.class.length === 0) {
      throw new Error(`${path} ${testCase.id} must have a non-empty class`);
    }
    if (seen.has(testCase.id)) throw new Error(`${path} repeats id ${testCase.id}`);
    seen.add(testCase.id);
    return testCase;
  });
}

function validateContractInput(input) {
  const contract = input.contract;
  const path = input.path;
  if (contract.frozen !== true || contract.contract !== input.expectedContract) {
    throw new Error(`${path} must declare frozen ${input.expectedContract}`);
  }
  if (contract.version !== 2 || contract.authoredAt !== "2026-09-03") {
    throw new Error(`${path} must declare the approved v2 contract metadata`);
  }
  if (contract.targetOperation !== "scout.searchResearch") {
    throw new Error(`${path} target must be scout.searchResearch`);
  }
  const seen = new Set();
  validateRoleCases(path, contract.requiredCases, "required", seen);
  validateRoleCases(path, contract.forbiddenCases, "forbidden", seen);
  validateRoleCases(path, contract.neutralCases, "neutral", seen);

  const caseContentSha256 = protocolHistoryCaseDigest(contract);
  const expectedDigest =
    `sha256(JSON.stringify({requiredCases,forbiddenCases,neutralCases}))=${caseContentSha256}`;
  if (contract.contractProvenance?.caseContentDigest !== expectedDigest) {
    throw new Error(`${path} case-content digest mismatch`);
  }
  const epoch = contract.sourceEpoch;
  if (!epoch || typeof epoch !== "object" || Array.isArray(epoch)) {
    throw new Error(`${path} sourceEpoch is missing`);
  }
  const frozenAt = new Date(epoch.frozenAt ?? "");
  if (Number.isNaN(frozenAt.getTime()) || frozenAt.toISOString() !== epoch.frozenAt) {
    throw new Error(`${path} sourceEpoch.frozenAt must be an ISO timestamp`);
  }
  for (const key of ["manifestSha256", "targetScoringSha256", "targetRoutingSha256"]) {
    if (!SHA256.test(epoch[key] ?? "")) throw new Error(`${path} sourceEpoch.${key} is invalid`);
  }
  if (epoch.caseAuthoringReceipt !== contract.contractProvenance?.labelReview) {
    throw new Error(`${path} sourceEpoch.caseAuthoringReceipt must match labelReview`);
  }
  return { caseContentSha256 };
}

function gradeSet(contract, rank) {
  const runCases = (cases, role) => cases.map((testCase) => {
    const hits = rank(testCase.question);
    const index = hits.findIndex((hit) => hit.id === contract.targetOperation);
    return {
      id: testCase.id,
      class: testCase.class,
      role,
      targetRank: index === -1 ? null : index + 1,
      topHits: hits.map(({ id, score, tier }) => ({ id, score, tier })),
    };
  });
  const cases = [
    ...runCases(contract.requiredCases, "required"),
    ...runCases(contract.forbiddenCases, "forbidden"),
    ...runCases(contract.neutralCases, "neutral"),
  ];
  const required = cases.filter((testCase) => testCase.role === "required");
  const forbidden = cases.filter((testCase) => testCase.role === "forbidden");
  const neutral = cases.filter((testCase) => testCase.role === "neutral");
  const requiredTop5 = required.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5,
  ).length;
  const forbiddenTop5Captures = forbidden.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5,
  ).length;
  const neutralTop5Captures = neutral.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5,
  ).length;
  return {
    contract: contract.contract,
    targetOperation: contract.targetOperation,
    required: required.length,
    requiredTop5,
    forbidden: forbidden.length,
    forbiddenTop5Captures,
    neutral: neutral.length,
    neutralTop5Captures,
    pass: requiredTop5 === required.length && forbiddenTop5Captures === 0,
    cases,
  };
}

export function evaluateProtocolHistory({
  contractInputs,
  manifestBytes,
  manifest,
  inventoryBytes,
  inventory,
  rank,
}) {
  const records = contractInputs.map((input) => {
    const { caseContentSha256 } = validateContractInput(input);
    const actual = actualSourceEpoch({
      manifestBytes,
      manifest,
      inventory,
      targetOperation: input.contract.targetOperation,
    });
    const expected = input.contract.sourceEpoch;
    const expiryReasons = [
      ["manifest-sha256", "manifestSha256"],
      ["target-scoring-sha256", "targetScoringSha256"],
      ["target-routing-sha256", "targetRoutingSha256"],
    ].flatMap(([reason, key]) => expected[key] === actual[key] ? [] : [reason]);
    return {
      contract: input.contract.contract,
      path: input.path,
      contractFileSha256: sha256(input.bytes),
      caseContentSha256,
      targetOperation: input.contract.targetOperation,
      sourceEpoch: {
        frozenAt: expected.frozenAt,
        caseAuthoringReceipt: expected.caseAuthoringReceipt,
        expected: {
          manifestSha256: expected.manifestSha256,
          targetScoringSha256: expected.targetScoringSha256,
          targetRoutingSha256: expected.targetRoutingSha256,
        },
        actual,
      },
      measurementStatus: expiryReasons.length === 0 ? "eligible" : "source-expired",
      expiryReasons,
    };
  });
  const source = {
    manifest: { path: "catalog/manifest.json", sha256: sha256(manifestBytes) },
    inventory: { path: "inventory/stellar-light.json", sha256: sha256(inventoryBytes) },
  };
  if (records.some((record) => record.measurementStatus === "source-expired")) {
    return {
      schemaVersion: 1,
      measurementStatus: "source-expired",
      source,
      contracts: records,
    };
  }
  if (typeof rank !== "function") throw new Error("eligible protocol-history measurement needs a rank function");
  return {
    schemaVersion: 1,
    measurementStatus: "eligible",
    source,
    contracts: records,
    sets: contractInputs.map((input) => gradeSet(input.contract, rank)),
  };
}
