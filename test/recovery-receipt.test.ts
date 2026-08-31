import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadManifest } from "../src/catalog/search.ts";
import {
  RECOVERY_RECEIPT_TTL_MS,
  consumeRecoveryReceipt,
  issueRecoveryReceipt,
  qualifyingSourcesForRecoveryTarget,
  recoveryReceiptBlock,
  recoveryTransitionsFromLedger
} from "../src/policy/recovery-receipt.ts";
import { MemoryR2Bucket } from "./helpers/memory-r2.ts";

const catalog = loadManifest(JSON.parse(readFileSync(join(process.cwd(), "catalog/manifest.json"), "utf8")));
const secret = "unit-test-recovery-secret";
const identity = "oauth:owner-a";
const now = Date.parse("2026-08-30T12:00:00.000Z");
const transition = {
  source: "stellarDocs.search_sdk_cli_tools_docs",
  target: "scout.explainRepo"
};

async function grant(
  bucket: MemoryR2Bucket,
  nonce: string,
  source = transition.source
) {
  return issueRecoveryReceipt(
    bucket as unknown as R2Bucket,
    secret,
    identity,
    "request-authority-1",
    { ...transition, source },
    { now: () => now, nonce: () => nonce }
  );
}

describe("recovery capability transitions", () => {
  it("derives qualifying sources from the manifest graph", () => {
    expect(qualifyingSourcesForRecoveryTarget(catalog, "scout.explainRepo")).toEqual([
      "stellarDocs.search_rpc_horizon_data_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "stellarDocs.search_soroban_contract_docs"
    ]);
  });

  it("derives only manifest-owned recovery-only source-code transitions", () => {
    for (const source of [
      "stellarDocs.search_rpc_horizon_data_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "stellarDocs.search_soroban_contract_docs"
    ]) {
      expect(recoveryTransitionsFromLedger(catalog, [{ op: source, outcome: "ok" }])).toEqual([
        { source, target: "scout.explainRepo" }
      ]);
      expect(recoveryTransitionsFromLedger(catalog, [{ op: source, outcome: "soft-empty" }])).toEqual([
        { source, target: "scout.explainRepo" }
      ]);
    }
  });

  it("does not mint from failures or nonqualifying operations", () => {
    expect(
      recoveryTransitionsFromLedger(catalog, [
        { op: "stellarDocs.search_sdk_cli_tools_docs", outcome: "error" },
        { op: "stellarDocs.search_docs", outcome: "ok" },
        { op: "scout.searchRepos", outcome: "ok" }
      ])
    ).toEqual([]);
  });
});

describe("recovery receipt", () => {
  it("accepts one matching later use and rejects replay", async () => {
    const bucket = new MemoryR2Bucket();
    const issued = await grant(bucket, "00000000-0000-4000-8000-000000000001");
    await expect(
      consumeRecoveryReceipt(
        bucket as unknown as R2Bucket,
        secret,
        identity,
        transition.target,
        issued.receipt,
        { now: () => now + 1 }
      )
    ).resolves.toMatchObject({ ok: true, source: transition.source, target: transition.target });
    await expect(
      consumeRecoveryReceipt(
        bucket as unknown as R2Bucket,
        secret,
        identity,
        transition.target,
        issued.receipt,
        { now: () => now + 2 }
      )
    ).resolves.toMatchObject({ ok: false, reason: "replayed" });
  });

  it("uses conditional storage so concurrent replay has one winner", async () => {
    const bucket = new MemoryR2Bucket();
    const issued = await grant(bucket, "00000000-0000-4000-8000-000000000002");
    const attempts = await Promise.all([
      consumeRecoveryReceipt(bucket as unknown as R2Bucket, secret, identity, transition.target, issued.receipt, { now: () => now + 1 }),
      consumeRecoveryReceipt(bucket as unknown as R2Bucket, secret, identity, transition.target, issued.receipt, { now: () => now + 1 })
    ]);
    expect(attempts.filter((result) => result.ok)).toHaveLength(1);
    expect(attempts.filter((result) => !result.ok)).toMatchObject([{ reason: "replayed" }]);
  });

  it("rejects mismatched identity, target, expiry, and altered receipts", async () => {
    const cases: Array<{
      nonce: string;
      change: (receipt: string) => string;
      consumeIdentity?: string;
      consumeTarget?: string;
      consumeNow?: number;
      reason: string;
    }> = [
      {
        nonce: "00000000-0000-4000-8000-000000000003",
        change: (receipt) => receipt,
        consumeIdentity: "oauth:owner-b",
        reason: "identity"
      },
      {
        nonce: "00000000-0000-4000-8000-000000000004",
        change: (receipt) => receipt,
        consumeTarget: "scout.searchRepos",
        reason: "target"
      },
      {
        nonce: "00000000-0000-4000-8000-000000000005",
        change: (receipt) => receipt,
        consumeNow: now + RECOVERY_RECEIPT_TTL_MS,
        reason: "expired"
      },
      {
        nonce: "00000000-0000-4000-8000-000000000006",
        change: (receipt) => `${receipt.slice(0, -1)}${receipt.endsWith("A") ? "B" : "A"}`,
        reason: "invalid"
      },
      {
        nonce: "00000000-0000-4000-8000-000000000007",
        change: (receipt) => {
          const [encoded, signature] = receipt.split(".");
          const payload = JSON.parse(Buffer.from(encoded!, "base64url").toString("utf8"));
          payload.version = 2;
          return `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`;
        },
        reason: "invalid"
      }
    ];

    for (const testCase of cases) {
      const bucket = new MemoryR2Bucket();
      const issued = await grant(bucket, testCase.nonce);
      await expect(
        consumeRecoveryReceipt(
          bucket as unknown as R2Bucket,
          secret,
          testCase.consumeIdentity ?? identity,
          testCase.consumeTarget ?? transition.target,
          testCase.change(issued.receipt),
          { now: () => testCase.consumeNow ?? now + 1 }
        )
      ).resolves.toMatchObject({ ok: false, reason: testCase.reason });
    }
  });

  it("renders the shared receipt block only when grants exist", async () => {
    const bucket = new MemoryR2Bucket();
    const issued = await grant(bucket, "00000000-0000-4000-8000-000000000008");
    expect(recoveryReceiptBlock(catalog)).toBe("");
    const block = recoveryReceiptBlock(catalog, [issued]);
    expect(block).toContain("--- RECOVERY RECEIPT ---");
    expect(block).toContain("Contract (from the manifest):");
    expect(block).toContain("q: string");
    expect(block).toContain("repo?: string");
    expect(block).toContain("scout.explainRepo(input: ExplainRepoInput)");
    expect(block.split(issued.receipt)).toHaveLength(2);
    const example = JSON.parse(block.split("\n").at(-1) ?? "") as Record<string, string>;
    expect(Object.keys(example).sort()).toEqual(["code", "recoveryReceipt"]);
    expect(example.recoveryReceipt).toBe(issued.receipt);
    expect(example.code).toContain("scout.explainRepo({");
  });

  it("fails closed when a receipt target is absent from the manifest", async () => {
    const bucket = new MemoryR2Bucket();
    const issued = await grant(bucket, "00000000-0000-4000-8000-000000000009");
    expect(() => recoveryReceiptBlock(catalog, [{ ...issued, target: "scout.unknown" }])).toThrow(
      "recovery receipt target scout.unknown is not an exposed operation"
    );
  });
});
