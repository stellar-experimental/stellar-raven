/**
 * stellarOrg is not a corroborating family (STEP-1-REVIEW R8: adding it would make SDF's own posts
 * official by data, a step 2 review decision). A run that returned its rows therefore carries the
 * standalone corroboration guard line, and a Stellar Docs run does not.
 */
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; this case needs only its pure ledger summary, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { summarizeOperationLedger } from "../src/executor/run.ts";
import type { OpLedgerCall } from "../src/executor/providers.ts";
import { candidateEvidenceSection } from "../src/policy/evidence-checkpoint.ts";
import { CORROBORATION_GUARD } from "../src/policy/corroboration.ts";

const ok = (op: string): OpLedgerCall => ({ op, outcome: "ok", hasServiceData: true, ms: 0 });

describe("stellarOrg and the corroboration guard", () => {
  it("counts a stellarOrg run as uncorroborated and a Docs run as corroborated", () => {
    expect(summarizeOperationLedger([ok("stellarOrg.search_site")]).uncorroboratedEvidence).toBe(1);
    expect(summarizeOperationLedger([ok("stellarDocs.search_docs")]).uncorroboratedEvidence).toBeUndefined();
  });

  it("renders the guard as its own line after a stellarOrg-only run, with no candidate block", () => {
    const summary = summarizeOperationLedger([ok("stellarOrg.search_site"), ok("stellarOrg.get_page")]);
    const section = candidateEvidenceSection({
      candidateEvidence: summary.candidateEvidence,
      uncorroboratedEvidence: summary.uncorroboratedEvidence,
      hasPriorArtPreflight: false,
      priorArtBlockRenders: false
    });
    expect(section).toBe(`\n\n${CORROBORATION_GUARD}`);
  });
});
