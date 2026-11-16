import { describe, expect, it } from "vitest";
import { TUNING_ROW_COUNT } from "../eval/qa/tuning-rows.mjs";
import { identifiersIn, scanPass, scanCorroboration, seriesOfCatalog } from "../eval/qa/scan-corroboration.mjs";

const manifest = {
  entries: [
    { id: "scout.searchResearch", kind: "operation", inputSchema: { properties: { source: { enum: ["sep", "cap", "paper", "sdf-blog"] } } } },
    { id: "scout.listAudits", kind: "operation" },
    { id: "stellarDocs.search_docs", kind: "operation" }
  ]
};
const context = {
  operationIds: new Set(manifest.entries.map((e) => e.id)),
  series: seriesOfCatalog(manifest)
};
const exec = (code, result = "") => ({ tool: "mcp__raven__execute", input: JSON.stringify({ code }), result });
const BLOCK = "\n\n--- CANDIDATE EVIDENCE ---\nThis run used 1 semantic call(s).";

describe("series of the catalog", () => {
  it("takes the plain-letter values of the research source filter", () => {
    expect([...seriesOfCatalog(manifest)].sort()).toEqual(["cap", "paper", "sep"]);
    expect(() => seriesOfCatalog({ entries: [] })).toThrow(/source enum/);
  });
});

describe("identifiers in a script", () => {
  const series = new Set(["sep", "cap", "audit"]);
  it("takes hyphenated and joined tokens from string literals only", () => {
    expect(identifiersIn('x("SEP-45 and sep24", `CAP-0046`)', series)).toEqual(["SEP-45", "SEP-24", "CAP-0046"]);
    expect(identifiersIn("const sep45 = 1; foo(sep45)", series)).toEqual([]);
  });
  it("does not take a token with a space, another series, or a longer identifier", () => {
    expect(identifiersIn('x("audit 2024", "release 23", "SEP-45.1", "CVE-2024-1234")', series)).toEqual([]);
    expect(identifiersIn('x("audit-2024")', series)).toEqual(["AUDIT-2024"]);
  });
});

describe("scanPass", () => {
  it("marks a block, and does not offer a guard line where the block already renders", () => {
    const pass = scanPass(
      { id: "a", answer: "It was audited.", transcript: [exec('async()=>scout.searchResearch({q:"x"})', `{}${BLOCK}`)] },
      context
    );
    expect(pass).toMatchObject({ block: true, guardLine: false, claimPlan: true, calledScoutOrLumenloop: true });
  });

  it("offers a guard line for a directory call with no block, and not for a Docs-only run", () => {
    const audits = scanPass({ id: "a", answer: "", transcript: [exec("async()=>scout.listAudits({})", "{}")] }, context);
    expect(audits).toMatchObject({ block: false, guardLine: true });
    const docs = scanPass({ id: "b", answer: "", transcript: [exec("async()=>stellarDocs.search_docs({})", "{}")] }, context);
    expect(docs).toMatchObject({ guardLine: false, uncorroboratedCall: false });
  });

  it("offers no guard line when the result says every call failed or came back empty", () => {
    const failed = scanPass(
      { id: "a", answer: "", transcript: [exec("async()=>scout.listAudits({})", "{}\n\n--- SERVICE ERRORS ---\nAll 1 service calls failed.")] },
      context
    );
    expect(failed.guardLine).toBe(false);
  });

  it("reads an identifier a script names, and whether research was called in that script", () => {
    const none = scanPass({ id: "a", answer: "", transcript: [exec('async()=>stellarDocs.search_docs({query:"SEP-45"})')] }, context);
    expect(none).toMatchObject({ identifierNamed: true, identifierWithoutResearch: true, identifiers: ["SEP-45"] });
    const asked = scanPass({ id: "a", answer: "", transcript: [exec('async()=>scout.searchResearch({q:"SEP-45"})')] }, context);
    expect(asked).toMatchObject({ identifierNamed: true, identifierWithoutResearch: false });
  });
});

describe("scanCorroboration", () => {
  const ids = Array.from({ length: TUNING_ROW_COUNT }, (_, i) => `q-${String(i).padStart(2, "0")}`);
  const split = { sets: { tuning: ids } };
  const rowOf = (id, answer, result) => ({ id, answer, transcript: [exec('async()=>scout.searchResearch({q:"x"})', result)] });
  const run = (rowIds, answerOf) => ({ rows: rowIds.map((id) => rowOf(id, answerOf(id), `{}${BLOCK}`)) });

  it("counts references and picks the rows where a block and a claim word coincide in two runs", () => {
    const panelIds = ids.slice(0, 50);
    const audited = (id) => (id === ids[1] || id === ids[2] ? "It was audited." : "Fine.");
    const scan = scanCorroboration({
      split,
      manifest,
      panel: { rows: panelIds.map((id) => ({ id, inPanel: true, trap: id === ids[5] ? "governance" : null })) },
      runs: [
        { label: "baseline", results: run(ids, audited) },
        { label: "a", results: run(panelIds, audited) },
        { label: "b", results: run(panelIds, (id) => (id === ids[1] ? "It was audited." : "Fine.")) },
        { label: "c", results: run(panelIds, () => "Fine.") }
      ]
    });
    expect(scan.references.withMapNoGuard.blockAndClaimPlan).toBe(2 + 2 + 1);
    expect(scan.references.noMapNoGuard.blockAndClaimPlan).toBe(0);
    expect(scan.guardRowsPlan).toEqual([ids[1], ids[2]]);
    expect(scan.guardRowsFinal).toEqual([ids[1], ids[2], ids[5]].sort());
  });
});
