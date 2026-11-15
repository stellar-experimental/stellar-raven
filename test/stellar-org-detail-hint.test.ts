/**
 * The stellar.org site search carries one `detail` edge to the whole-page read, joined on `path`.
 * The hint builder offers the read after a successful site search, never after the read itself, and
 * the Docs pointer is unchanged by it.
 */
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; these cases need only its pure hint builder, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { evidenceRecoveryHint, summarizeOperationLedger } from "../src/executor/run.ts";
import type { OpLedgerCall } from "../src/executor/providers.ts";
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
