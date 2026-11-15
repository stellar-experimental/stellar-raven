import { describe, expect, it } from "vitest";
import { scanPanel, sdfSiteSources, stellarOrgPath } from "../eval/qa/scan-tuning-panel.mjs";
import { selectById, tuningIdsOf } from "../eval/qa/tuning-rows.mjs";

const ids = Array.from({ length: 79 }, (_, i) => `q-${String(i).padStart(2, "0")}`);
const split = { sets: { tuning: ids, "held-out": ["secret-1"], reserve: ["secret-2"] } };
const source = (ref) => ({ class: "A", ref });

describe("stellarOrgPath", () => {
  it("accepts only stellar.org and www.stellar.org", () => {
    expect(stellarOrgPath("https://www.stellar.org/foundation")).toBe("/foundation");
    expect(stellarOrgPath("https://stellar.org/scf")).toBe("/scf");
    expect(stellarOrgPath("https://developers.stellar.org/docs/x")).toBeNull();
    expect(stellarOrgPath("https://example.com/stellar.org")).toBeNull();
    expect(stellarOrgPath("not a url")).toBeNull();
  });
});

describe("sdfSiteSources", () => {
  it("serves a page unless every stellar.org path is a blog, press or events path", () => {
    expect(sdfSiteSources([source("https://stellar.org/blog/x")]).servedByNewSource).toBe(false);
    expect(sdfSiteSources([source("https://stellar.org/press-room")]).servedByNewSource).toBe(true);
    expect(sdfSiteSources([source("https://stellar.org/events"), source("https://stellar.org/foundation")]).servedByNewSource).toBe(true);
    expect(sdfSiteSources([source("https://developers.stellar.org/docs")]).paths).toEqual([]);
  });
});

describe("tuning selection", () => {
  it("asserts 79 unique tuning ids and reads no other set", () => {
    expect(tuningIdsOf(split)).toHaveLength(79);
    expect(() => tuningIdsOf({ sets: { tuning: ids.slice(1) } })).toThrow(/79/);
    expect(() => tuningIdsOf({ sets: { tuning: [...ids.slice(1), ids[1]] } })).toThrow(/duplicate/);
  });

  it("selects by id before reading any other field", () => {
    const poisoned = { id: "secret-1" };
    Object.defineProperty(poisoned, "verdict", {
      get() {
        throw new Error("a row outside sets.tuning was read");
      }
    });
    const list = [...ids.map((id) => ({ id })), poisoned];
    expect(selectById(list, ids, 79, "run")).toHaveLength(79);
    expect(() => selectById(list, ids, 50, "run")).toThrow(/expected 50/);
  });
});

describe("scanPanel", () => {
  const panelIds = ids.slice(0, 50);
  const run = (rows, score) => ({ rows: rows.map((id) => ({ id, verdict: { score } })) });
  const cases = ids.map((id, i) => ({
    id,
    tags: { category: "c", service: i % 2 ? "scout" : "stellarDocs" },
    truth: { sources: i === 60 ? [source("https://stellar.org/foundation")] : i === 3 ? [source("https://stellar.org/blog/a")] : [] }
  }));

  it("adds the served-path rows outside the stored panel and counts the rest", () => {
    const scan = scanPanel({
      split,
      cases: { cases: [...cases, { id: "secret-1", truth: { sources: [] } }] },
      runs: [
        { label: "baseline", results: run(ids, "partial") },
        { label: "a", results: run(panelIds, "correct") },
        { label: "b", results: run(panelIds, "wrong") }
      ]
    });
    expect(scan.summary).toMatchObject({ tuningRows: 79, citeStellarOrg: 2, citeServedPath: 1, added: 1, panel: 51 });
    const added = scan.rows.find((r) => r.id === ids[60]);
    expect(added).toMatchObject({ inPanel: true, inLoop1Panel: false, sourceRow: true });
    expect(added.verdicts).toEqual({ baseline: "partial", a: null, b: null });
    expect(scan.rows.find((r) => r.id === ids[3])).toMatchObject({ inPanel: true, citesStellarOrg: true, sourceRow: false });
  });

  it("rejects a panel run that is not the same 50 rows", () => {
    expect(() =>
      scanPanel({
        split,
        cases: { cases },
        runs: [
          { label: "baseline", results: run(ids, "partial") },
          { label: "a", results: run(panelIds, "correct") },
          { label: "b", results: run([...panelIds.slice(1), ids[70]], "wrong") }
        ]
      })
    ).toThrow(/same 50 rows/);
  });
});
