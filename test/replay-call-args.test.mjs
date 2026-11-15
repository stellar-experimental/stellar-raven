import { describe, expect, it } from "vitest";
import { callSitesOf, footerCallsOf, literalsOf } from "../eval/qa/replay-call-args.mjs";

const OPS = new Set(["stellarDocs.search_docs", "scout.searchResearch", "scout.listAudits"]);
const sites = (code) => callSitesOf(code, OPS);

describe("static call sites of a stored execute script", () => {
  it("reads literal arguments, and ignores calls that are not operations", () => {
    expect(sites(`async () => { await stellarDocs.search_docs({ query: "SEP-45 auth" }); await codemode.search("x"); }`)).toEqual([
      { op: "stellarDocs.search_docs", strings: ["SEP-45 auth"], unresolved: false }
    ]);
  });

  it("follows const names, templates, concatenation and array .map parameters", () => {
    const code = `async () => {
      const n = "45";
      const qs = ["SEP-" + n, \`CAP-\${"46"} host\`];
      const r = await Promise.all(qs.map((q) => stellarDocs.search_docs({ query: q })));
      for (const t of ["x-1"]) await scout.searchResearch({ q: t, source: "sep" });
    }`;
    const found = sites(code);
    expect(found[0]).toMatchObject({ op: "stellarDocs.search_docs", unresolved: false });
    expect(found[0].strings).toEqual(expect.arrayContaining(["SEP-45", "CAP-46 host"]));
    expect(found[1]).toMatchObject({ op: "scout.searchResearch", unresolved: false });
    expect(found[1].strings).toEqual(expect.arrayContaining(["x-1", "sep"]));
  });

  it("marks a value it cannot follow, and keeps what it could", () => {
    const code = `async () => { const a = await scout.listAudits({}); const q = a.data.rows[0].name; await scout.searchResearch({ q, source: "audit" }); }`;
    expect(sites(code).at(-1)).toMatchObject({ op: "scout.searchResearch", unresolved: true, strings: ["audit"] });
  });

  it("does not loop on a name that is defined by itself", () => {
    expect(sites(`async () => { let q = q + "x"; await stellarDocs.search_docs({ query: q }); }`)[0].op).toBe("stellarDocs.search_docs");
  });

  it("lists every string literal of a script", () => {
    expect(literalsOf(`const a = "sep-1"; const b = \`cap-\${a}-2\`;`)).toEqual(expect.arrayContaining(["sep-1", "cap-", "-2"]));
  });
});

describe("the footer of an execute result", () => {
  it("lists the calls with their outcomes, in order, and ignores the totals", () => {
    const text = "x\ncalls: scout.getStablecoins=ok/318ms; lumenloop.search_content_semantic=ok/454ms [caveat: unverified-match]; stellarDocs.search_docs=error/12ms (totals ok=2 (1 with caveat) error=1 soft-empty=0)";
    expect(footerCallsOf(text)).toEqual([
      { op: "scout.getStablecoins", outcome: "ok" },
      { op: "lumenloop.search_content_semantic", outcome: "ok" },
      { op: "stellarDocs.search_docs", outcome: "error" }
    ]);
    expect(footerCallsOf("no footer")).toEqual([]);
  });
});
