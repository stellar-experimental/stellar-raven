import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadDiscoveryCases } from "../eval/discovery/lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASES_PATH = path.join(ROOT, "eval/discovery/cases.json");

function withCasesFile(cases, manifestEntries, check) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "discovery-cases-"));
  try {
    const casesPath = path.join(dir, "cases.json");
    const manifestPath = path.join(dir, "manifest.json");
    writeFileSync(casesPath, JSON.stringify({ cases }));
    writeFileSync(manifestPath, JSON.stringify({ entries: manifestEntries }));
    return check(() => loadDiscoveryCases(casesPath, { manifestPath }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const entries = [
  { id: "skills.stellar-dev.data", service: "skills", kind: "skill" },
  { id: "skills.stellar-dev.data#stellar-rpc", service: "skills", kind: "skill-section", searchable: false },
  { id: "stellarDocs.search_docs", service: "stellarDocs", kind: "operation" }
];
const labeled = (acceptableOps) => [{ id: "c1", question: "q", expectedFamilies: ["skills"], acceptableOps }];

describe("discovery case labels", () => {
  it("rejects a skill-section id that search can never rank", () => {
    withCasesFile(labeled(["skills.stellar-dev.data#stellar-rpc"]), entries, (load) => {
      expect(load).toThrow(/acceptableOps must be searchable manifest entries:\nc1: skills\.stellar-dev\.data#stellar-rpc/);
    });
  });

  it("rejects an id missing from the manifest", () => {
    withCasesFile(labeled(["skills.stellar-dev.retired"]), entries, (load) => {
      expect(load).toThrow(/c1: skills\.stellar-dev\.retired/);
    });
  });

  it("accepts whole skills and operations", () => {
    withCasesFile(labeled(["skills.stellar-dev.data", "stellarDocs.search_docs"]), entries, (load) => {
      expect(load().cases).toHaveLength(1);
    });
  });

  it("loads the committed discovery cases against the committed manifest", () => {
    expect(loadDiscoveryCases(CASES_PATH).cases.length).toBeGreaterThan(0);
  });

  // familyHit@3 credits any hit from a listed family, so each family needs a gradable route.
  it("backs every expected family with an acceptable operation or skill", () => {
    const { cases } = JSON.parse(readFileSync(CASES_PATH, "utf8"));
    const unbacked = cases.flatMap((c) => {
      const services = new Set(c.acceptableOps.map((id) => id.split(".")[0]));
      return c.expectedFamilies.filter((family) => !services.has(family)).map((family) => `${c.id}: ${family}`);
    });
    expect(unbacked).toEqual([]);
  });
});
