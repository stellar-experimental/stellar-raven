import { describe, expect, it } from "vitest";
import {
  panelRole,
  scanTranscript,
  scanTuningRows
} from "../eval/qa/scan-tuning-exposure.mjs";

const execute = (code) => ({ tool: "mcp__raven__execute", input: JSON.stringify({ code }) });

describe("scanTranscript", () => {
  it("marks a Docs search with no page read as arm 1 exposed", () => {
    const scan = scanTranscript([
      execute('async()=>stellarDocs.search_docs({query:"x"})'),
      execute("async()=>stellarDocs.search_meeting_notes({query:'y'})")
    ]);
    expect(scan.docsSearchOps).toEqual(["search_docs", "search_meeting_notes"]);
    expect(scan.arm1Exposed).toBe(true);
  });

  it("clears arm 1 exposure when any script reads a page", () => {
    const scan = scanTranscript([
      execute('async()=>stellarDocs.search_docs({query:"x"})'),
      execute('async()=>stellarDocs.get_doc_page({path:"a"})')
    ]);
    expect(scan.pageRead).toBe(true);
    expect(scan.arm1Exposed).toBe(false);
  });

  it("ignores a non-execute entry that quotes an operation", () => {
    const scan = scanTranscript([{ tool: "mcp__raven__search", input: '{"query":"stellarDocs.search_docs"}' }]);
    expect(scan.arm1Exposed).toBe(false);
  });

  it("reads an identifier from a literal research query, in either spelling of the key", () => {
    const a = scanTranscript([execute('async()=>scout.searchResearch({query:"SEP-43 standard"})')]);
    const b = scanTranscript([execute("async()=>scout.searchResearch({ q: 'cap 33 reserves' })")]);
    expect(a.identifierTokens).toEqual(["SEP-43"]);
    expect(b.identifierTokens).toEqual(["cap 33"]);
    expect(a.arm2Direct && b.arm2Direct).toBe(true);
  });

  it("finds no identifier in a query without digits", () => {
    const scan = scanTranscript([execute('async()=>scout.searchResearch({query:"sponsored reserves"})')]);
    expect(scan.researchCalls).toBe(1);
    expect(scan.arm2Exposed).toBe(false);
  });

  it("infers from the script's literals when the query is a variable, and says so", () => {
    const scan = scanTranscript([
      execute('async()=>{const qs=["SEP-12 KYC","anchors"];return qs.map(q=>scout.searchResearch({q,limit:5}))}')
    ]);
    expect(scan.arm2Direct).toBe(false);
    expect(scan.arm2Exposed).toBe(true);
    expect(scan.inferredIdentifierTokens).toEqual(["SEP-12"]);
    expect(scan.dynamicResearchQueries).toBe(1);
  });

  it("falls back to the raw input when it is not JSON", () => {
    const scan = scanTranscript([{ tool: "execute", input: 'stellarDocs.search_docs({query:"x"})' }]);
    expect(scan.arm1Exposed).toBe(true);
  });
});

describe("panelRole", () => {
  const scan = (over = {}) => ({ arm1Exposed: false, arm2Exposed: false, arm2Direct: false, researchCalls: 0, ...over });
  const row = (over) => ({ id: "q-x", category: "protocol-core", baseline: "partial", ...over });

  it("splits baseline-correct rows into exposed and unexposed controls", () => {
    expect(panelRole(row({ baseline: "correct" }), scan({ arm1Exposed: true }))).toBe("control, exposed");
    expect(panelRole(row({ baseline: "correct" }), scan())).toBe("control, unexposed");
  });

  it("takes a priority partial only in a priority category where a mechanism's family was called", () => {
    const soroban = row({ category: "soroban" });
    expect(panelRole(soroban, scan({ arm1Exposed: true }))).toBe("priority partial");
    expect(panelRole(soroban, scan({ researchCalls: 2 }))).toBe("priority partial");
    expect(panelRole(soroban, scan())).toBeNull();
    expect(panelRole(row({ category: "scf-grants-builders" }), scan({ arm1Exposed: true }))).toBeNull();
  });

  it("names an outside row whose research query directly names an identifier", () => {
    expect(panelRole(row(), scan({ arm2Exposed: true, arm2Direct: true }))).toBe("A2 rule fires");
    expect(panelRole(row(), scan({ arm2Exposed: true }))).toBeNull();
  });

  it("leaves out the open-defect rows", () => {
    expect(panelRole(row({ id: "q-scf-hackathons-active", baseline: "correct" }), scan({ arm1Exposed: true }))).toBeNull();
  });
});

describe("scanTuningRows", () => {
  const ids = Array.from({ length: 79 }, (_, i) => `q-t${i}`);
  const split = { sets: { tuning: ids } };
  const rowFor = (id) => ({ id, tags: { category: "soroban" }, verdict: { score: "correct" }, transcript: [] });

  it("asserts the tuning count and the rows present", () => {
    expect(() => scanTuningRows({ split: { sets: { tuning: ids.slice(1) } }, results: { rows: [] } })).toThrow(/79/);
    expect(() => scanTuningRows({ split, results: { rows: ids.slice(1).map(rowFor) } })).toThrow(/78 of the 79/);
  });

  it("never reads a field of a row outside the tuning set", () => {
    const outsider = new Proxy({ id: "q-held-out" }, {
      get(target, key) {
        if (key === "id") return target.id;
        throw new Error(`read ${String(key)} of a non-tuning row`);
      }
    });
    const rows = scanTuningRows({ split, results: { rows: [outsider, ...ids.map(rowFor)] } });
    expect(rows).toHaveLength(79);
  });
});
