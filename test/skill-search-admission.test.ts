import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { admitsWholeSkill } from "../src/catalog/skill-search-admission.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);
const TRUSTLESS_WORK_ID = "skills.trustless-work.trustless-work-dev";

function skillIds(query: string): string[] {
  return searchCatalog(catalog, { query, kind: "skill", service: "skills", limit: 10 })
    .map((hit) => hit.id);
}

describe("whole-skill search admission", () => {
  it("keeps exact identity and genuine Trustless Work discovery", () => {
    for (const query of [
      TRUSTLESS_WORK_ID,
      "trustless-work-dev",
      "trustless work",
      "How do I integrate Trustless Work escrow?",
      "Trustless Work escrow API x-api-key"
    ]) {
      expect(skillIds(query), query).toContain(TRUSTLESS_WORK_ID);
    }
  });

  it("rejects identity-fragment captures without escrow evidence", () => {
    for (const query of [
      "How does the Stellar Development Foundation organize its work / spending priorities?",
      "How do path payments work on Stellar and which two operations implement them?",
      "What is StellarX and is it built by the Stellar Development Foundation?",
      "What's Blend's TVL today and how has it trended this quarter?",
      "How do I generate a typed TypeScript or Rust client for a deployed Soroban contract?"
    ]) {
      expect(skillIds(query), query).not.toContain(TRUSTLESS_WORK_ID);
    }
  });

  it("keeps exact short capabilities and named skill abbreviations", () => {
    const checks = [
      ["ZK proofs", "skills.stellar-dev.zk-proofs"],
      ["SCF submission", "skills.lumenloop.scf-submission-radar"],
      ["RPC data", "skills.stellar-dev.data"],
      ["MPP payments", "skills.stellar-dev.agentic-payments"],
      ["x402", "skills.stellar-dev.agentic-payments"],
      ["SAC assets", "skills.stellar-dev.assets"],
      ["DeFi", "skills.lumenloop.stellar-ecosystem-scout"],
      ["defi", "skills.lumenloop.stellar-ecosystem-scout"],
      ["dapp wallet", "skills.stellar-dev.dapp"]
    ] as const;
    for (const [query, expected] of checks) {
      expect(skillIds(query), query).toContain(expected);
    }
  });

  it("matches a conservative regular plural without prefix matching", () => {
    expect(skillIds("passkey")).toContain("skills.stellar-dev.dapp");
    expect(skillIds("passkeys")).toContain("skills.stellar-dev.dapp");
    expect(skillIds("development")).not.toContain(TRUSTLESS_WORK_ID);
  });

  it("keeps a published mixed-case domain code available to lowercase queries", () => {
    expect(
      admitsWholeSkill(
        {
          id: "skills.example.ecosystem-scout",
          description: "Map Stellar DeFi projects."
        },
        "defi"
      )
    ).toBe(true);
  });

  it("admits a whole skill when a receipt-backed alias trigger activates", () => {
    expect(
      admitsWholeSkill(
        {
          id: "skills.example.vendor-playbook",
          description: "A bounded integration guide.",
          knownAliases: ["Example Alpha", "EA"],
          knownAliasTriggers: ["EA42"]
        },
        "How do I use EA-42?"
      )
    ).toBe(true);
  });
});
