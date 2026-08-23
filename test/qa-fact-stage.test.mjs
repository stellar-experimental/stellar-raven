import { describe, expect, it } from "vitest";
import { posix, win32 } from "node:path";

import {
  FACT_STAGE_BENCHMARK,
  FACT_STAGE_LABELS,
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

const ROUND_RELATIVE_ARTIFACT_REF =
  /^qa-round-2026-08-19-accepted\/.+\.json#rows\[id=[^\]]+\]$/;
const SHA_256_REF = /^sha256:[0-9a-f]{64}$/;

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
      expect(
        row.evidenceRefs.filter((ref) => ROUND_RELATIVE_ARTIFACT_REF.test(ref)),
        row.caseId,
      ).toHaveLength(1);
      expect(
        row.evidenceRefs.filter((ref) => SHA_256_REF.test(ref)),
        row.caseId,
      ).toHaveLength(1);
      expect(
        row.evidenceRefs.some(
          (ref) => posix.isAbsolute(ref) || win32.isAbsolute(ref),
        ),
        row.caseId,
      ).toBe(false);
      expect(
        row.evidenceRefs.some((ref) => ref.startsWith("solo://")),
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
