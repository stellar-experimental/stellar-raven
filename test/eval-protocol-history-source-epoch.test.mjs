import { describe, expect, it, vi } from "vitest";
import {
  actualSourceEpoch,
  evaluateProtocolHistory,
  protocolHistoryCaseDigest,
  sha256,
} from "../eval/lib/protocol-history-source-epoch.mjs";

function sourceFixture() {
  const manifest = {
    entries: [
      {
        id: "scout.searchResearch",
        service: "scout",
        kind: "operation",
        description: "Search the cited research corpus.",
        keywords: ["research", "citations"],
        routingKeywords: ["history", "incident"],
      },
    ],
  };
  const inventory = {
    openapi: {
      paths: {
        "/api/research": {
          get: {
            operationId: "searchResearch",
            "x-routing": {
              purpose: "Find cited research.",
              useWhen: ["A user needs source-backed history."],
              exampleQuestions: ["What caused a past network incident?"],
              keywords: ["research", "history"],
              notFor: ["Current account data."],
            },
          },
        },
      },
    },
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  const inventoryBytes = Buffer.from(`${JSON.stringify(inventory, null, 2)}\n`);
  return { manifest, manifestBytes, inventory, inventoryBytes };
}

function contractFixture(source) {
  const contract = {
    contract: "synthetic-protocol-history-v2",
    frozen: true,
    version: 2,
    authoredAt: "2026-09-03",
    targetOperation: "scout.searchResearch",
    sourceEpoch: {
      frozenAt: "2026-09-02T17:27:40.000Z",
      ...actualSourceEpoch({ ...source, targetOperation: "scout.searchResearch" }),
      caseAuthoringReceipt: "synthetic-label-review.md",
    },
    contractProvenance: {
      labelReview: "synthetic-label-review.md",
    },
    requiredCases: [
      {
        id: "required-history",
        question: "Why did the follow-up protocol repair the archival failure?",
        class: "protocol-history",
      },
    ],
    forbiddenCases: [
      {
        id: "forbidden-current",
        question: "What is the current protocol version?",
        class: "current-lookup",
      },
    ],
    neutralCases: [],
  };
  const digest = protocolHistoryCaseDigest(contract);
  contract.contractProvenance.caseContentDigest =
    `sha256(JSON.stringify({requiredCases,forbiddenCases,neutralCases}))=${digest}`;
  return contract;
}

function runWith(source, contract, rank) {
  const bytes = Buffer.from(`${JSON.stringify(contract, null, 2)}\n`);
  return {
    bytes,
    result: evaluateProtocolHistory({
      contractInputs: [{
        path: "eval/synthetic-protocol-history-v2.json",
        expectedContract: contract.contract,
        contract,
        bytes,
      }],
      ...source,
      rank,
    }),
  };
}

describe("protocol-history source epoch", () => {
  it("stamps actual manifest and contract digests for an eligible run", () => {
    const source = sourceFixture();
    const contract = contractFixture(source);
    const rank = vi.fn(() => []);
    const { bytes, result } = runWith(source, contract, rank);

    expect(result.measurementStatus).toBe("eligible");
    expect(result.source.manifest.sha256).toBe(sha256(source.manifestBytes));
    expect(result.contracts[0]).toMatchObject({
      contractFileSha256: sha256(bytes),
      caseContentSha256: protocolHistoryCaseDigest(contract),
      measurementStatus: "eligible",
      expiryReasons: [],
    });
    expect(rank).toHaveBeenCalledTimes(2);
  });

  it("expires before scoring after an exact frozen question enters x-routing", () => {
    const frozen = sourceFixture();
    const contract = contractFixture(frozen);
    const changed = structuredClone(frozen);
    changed.inventory.openapi.paths["/api/research"].get["x-routing"].exampleQuestions.push(
      contract.requiredCases[0].question,
    );
    changed.inventoryBytes = Buffer.from(`${JSON.stringify(changed.inventory, null, 2)}\n`);
    const rank = vi.fn(() => []);
    const { result } = runWith(changed, contract, rank);

    expect(result.measurementStatus).toBe("source-expired");
    expect(result.contracts[0].expiryReasons).toEqual(["target-routing-sha256"]);
    expect(result).not.toHaveProperty("sets");
    expect(rank).not.toHaveBeenCalled();
  });

  it("expires before scoring after a paraphrased frozen question enters x-routing", () => {
    const frozen = sourceFixture();
    const contract = contractFixture(frozen);
    const changed = structuredClone(frozen);
    changed.inventory.openapi.paths["/api/research"].get["x-routing"].useWhen.push(
      "Explain why an archival defect forced a rapid corrective network upgrade.",
    );
    changed.inventoryBytes = Buffer.from(`${JSON.stringify(changed.inventory, null, 2)}\n`);
    const rank = vi.fn(() => []);
    const { result } = runWith(changed, contract, rank);

    expect(result.measurementStatus).toBe("source-expired");
    expect(result.contracts[0].expiryReasons).toEqual(["target-routing-sha256"]);
    expect(result).not.toHaveProperty("sets");
    expect(rank).not.toHaveBeenCalled();
  });

  it("expires when a scored target field changes", () => {
    const frozen = sourceFixture();
    const contract = contractFixture(frozen);
    const changed = structuredClone(frozen);
    changed.manifest.entries[0].description = "Search research and protocol incident history.";
    changed.manifestBytes = Buffer.from(`${JSON.stringify(changed.manifest, null, 2)}\n`);
    const rank = vi.fn(() => []);
    const { result } = runWith(changed, contract, rank);

    expect(result.measurementStatus).toBe("source-expired");
    expect(result.contracts[0].expiryReasons).toEqual([
      "manifest-sha256",
      "target-scoring-sha256",
    ]);
    expect(rank).not.toHaveBeenCalled();
  });

  it("rejects changed contract cases before scoring", () => {
    const source = sourceFixture();
    const contract = contractFixture(source);
    contract.requiredCases[0].question = "A changed question after the contract freeze.";
    const rank = vi.fn(() => []);

    expect(() => runWith(source, contract, rank)).toThrow(/case-content digest mismatch/);
    expect(rank).not.toHaveBeenCalled();
  });
});
