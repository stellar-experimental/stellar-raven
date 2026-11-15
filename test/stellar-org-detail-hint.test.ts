/**
 * The stellar.org site search carries one `detail` edge to the whole-page read, joined on `path`.
 * The hint builder offers the read after a successful site search, never after the read itself, and
 * the Docs pointer is unchanged by it.
 */
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; these cases need only its pure hint builder, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest } from "../src/catalog/search.ts";
import { rowsCarryJoinKeys } from "../src/catalog/detail-relation.ts";
import { evidenceRecoveryHint, summarizeOperationLedger } from "../src/executor/run.ts";
import { buildSandbox, type OpLedgerCall } from "../src/executor/providers.ts";
import type { FetchLike } from "../src/adapters/types.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";
import { evidenceCheckpointBlock } from "../src/policy/evidence-checkpoint.ts";

const ok = (op: string): OpLedgerCall => ({ op, outcome: "ok", hasServiceData: true, ms: 0 });
const hintFor = (...ops: string[]) => {
  const ledger = ops.map(ok);
  return evidenceRecoveryHint(ledger, summarizeOperationLedger(ledger));
};

describe("stellarOrg detail pointer", () => {
  it("offers get_page after a site search, joined on path, naming page rows", () => {
    const hint = hintFor("stellarOrg.search_site");
    expect(hint?.detail).toEqual([
      {
        target: "stellarOrg.get_page",
        sourceOperations: ["stellarOrg.search_site"],
        keys: ["path"],
        part: { plural: "page rows", singular: "row" }
      }
    ]);
    const block = evidenceCheckpointBlock(hint);
    expect(block).toContain("`stellarOrg.search_site` returned page rows, not whole pages.");
    expect(block).toContain("`stellarOrg.get_page({ path })` with that hit's `path`.");
  });

  it("stays silent once the page was read, and for a get_page call alone", () => {
    expect(hintFor("stellarOrg.search_site", "stellarOrg.get_page")?.detail).toBeUndefined();
    expect(hintFor("stellarOrg.get_page")?.detail).toBeUndefined();
  });

  it("keeps the Docs pointer's wording when both sources ran", () => {
    const block = evidenceCheckpointBlock(hintFor("stellarDocs.search_docs", "stellarOrg.search_site"));
    expect(block).toContain("`stellarDocs.search_docs` returned sections of pages, not whole pages. A section is exact evidence");
    expect(block).toContain("`stellarOrg.search_site` returned page rows, not whole pages. A row is exact evidence");
  });
});

/**
 * The edge fires only when a returned row carries every join key. The site search returns audit,
 * tutorial and partner rows beside page rows, and only page rows have a `path`.
 */
describe("detail pointer needs a row that carries the join key", () => {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const catalog = loadManifest(JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")));

  /** Runs one site search against a fixed response and returns the ledger it left. */
  async function siteSearchLedger(results: unknown[]): Promise<OpLedgerCall[]> {
    const ledger: OpLedgerCall[] = [];
    const fetchImpl: FetchLike = async () => Response.json({ query: "x", locale: "en", results });
    const fns = buildSandbox(catalog, skillSource, {}, { fetchImpl, onOpCall: (call) => ledger.push(call) }).find(
      (provider) => provider.name === "stellarOrg"
    )!.fns;
    await fns.search_site!({ query: "x" });
    return ledger;
  }
  const audit = { kind: "audit", title: "Project - Firm", url: "https://reports.example/r.pdf", isExternal: true };
  const pageRow = { kind: "page", title: "Roadmap", url: "/foundation/roadmap", isExternal: false };
  const hintOf = (ledger: OpLedgerCall[]) => evidenceRecoveryHint(ledger, summarizeOperationLedger(ledger));

  it("gives no stellarOrg detail pointer when the search returned only audit rows", async () => {
    const ledger = await siteSearchLedger([audit, { ...audit, title: "Other - Firm" }]);
    expect(ledger[0]).toMatchObject({ op: "stellarOrg.search_site", outcome: "ok", hasServiceData: true, detailReady: [] });
    expect(hintOf(ledger)?.detail).toBeUndefined();
    expect(evidenceCheckpointBlock(hintOf(ledger))).not.toContain("returned page rows");
  });

  it("gives the pointer when the search returned a page row among others", async () => {
    const ledger = await siteSearchLedger([audit, pageRow]);
    expect(ledger[0]).toMatchObject({ detailReady: ["stellarOrg.get_page"] });
    expect(hintOf(ledger)?.detail).toEqual([
      { target: "stellarOrg.get_page", sourceOperations: ["stellarOrg.search_site"], keys: ["path"], part: { plural: "page rows", singular: "row" } }
    ]);
  });

  it("does not narrow a call the ledger did not check, or an operation with another unchecked call", () => {
    const checkedEmpty: OpLedgerCall = { ...ok("stellarOrg.search_site"), detailReady: [] };
    expect(evidenceRecoveryHint([checkedEmpty], summarizeOperationLedger([checkedEmpty]))?.detail).toBeUndefined();
    const mixed = [checkedEmpty, ok("stellarOrg.search_site")];
    expect(evidenceRecoveryHint(mixed, summarizeOperationLedger(mixed))?.detail).toHaveLength(1);
    const readyLater = [checkedEmpty, { ...ok("stellarOrg.search_site"), detailReady: ["stellarOrg.get_page"] }];
    expect(evidenceRecoveryHint(readyLater, summarizeOperationLedger(readyLater))?.detail).toHaveLength(1);
  });

  it("leaves the Docs pointer as it was: a Docs search row carries its path", () => {
    const docs = { ...ok("stellarDocs.search_docs"), detailReady: ["stellarDocs.get_doc_page"] };
    const unchecked = ok("stellarDocs.search_docs");
    const checked = evidenceCheckpointBlock(evidenceRecoveryHint([docs], summarizeOperationLedger([docs])));
    expect(checked).toContain("returned sections of pages");
    expect(checked).toBe(evidenceCheckpointBlock(evidenceRecoveryHint([unchecked], summarizeOperationLedger([unchecked]))));
    expect(rowsCarryJoinKeys({ hits: [{ path: "/docs/a", section: "s" }], candidates: 1 }, ["path"])).toBe(true);
  });

  it("counts a key only when a row holds it as a non-empty string", () => {
    expect(rowsCarryJoinKeys({ hits: [{ title: "t" }, { path: "" }, { path: 3 }] }, ["path"])).toBe(false);
    expect(rowsCarryJoinKeys({ hits: [{ a: "1" }, { a: "1", b: "2" }] }, ["a", "b"])).toBe(true);
    expect(rowsCarryJoinKeys({ hits: [{ a: "1" }, { b: "2" }] }, ["a", "b"])).toBe(false);
    expect(rowsCarryJoinKeys({ hits: [] }, ["path"])).toBe(false);
    expect(rowsCarryJoinKeys([{ path: "/x" }], ["path"])).toBe(false);
  });
});
