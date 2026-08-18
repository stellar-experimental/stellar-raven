/**
 * Analyzer smoke (design §12 unit rows — "analyze-composition.mjs against a
 * fixture transcript") — the §10.4 adoption/composition instrument the ship
 * decision reads. Two synthetic rows shaped exactly like
 * run-qa.mjs transcripts: one skill.run case (whole execute result carrying
 * a host `calls` ledger + a truncation footer) and one plain-ops case.
 * Pins: the adoption flag (and its \b guard), registry-based op expansion,
 * truncation-flag detection, calls-array tallies (JSON walk + the
 * regex fallback for footer-cut results), and the aggregate summary.
 */
import { describe, expect, it } from "vitest";
import {
  ADOPTION_RE,
  tallyCallsArrays,
  analyzeRow,
  summarizeComposition,
  formatCompositionTable
} from "../eval/qa/analyze-composition.mjs";
import { loadRunnerOps } from "../eval/plan/grade-plan.mjs";
import { RUNNERS } from "../src/skills/runners/index.ts";

const DIGEST_ID = "skills.lumenloop.stellar-ecosystem-digest";

/** Transcript entries store execute inputs JSON-stringified, per run-qa.mjs. */
const executeEntry = (code, result, extra = {}) => ({
  tool: "mcp__stellar-raven__execute",
  input: JSON.stringify({ code }),
  ...(result !== undefined ? { result } : {}),
  ...extra
});

const digestEnvelope = {
  ok: true,
  data: {
    subject: "RWA tokenization",
    subjectType: "theme",
    calls: [
      { op: "lumenloop.search_content_semantic", ok: true, ms: 120 },
      { op: "lumenloop.list_documents", ok: false, errorKind: "soft-empty", ms: 45 }
    ]
  }
};

const skillRunRow = {
  id: "q-fixture-skill-run",
  verdict: { score: "correct" },
  agent: { turns: 4, costUsd: 0.12 },
  transcript: [
    { tool: "mcp__stellar-raven__search", input: JSON.stringify({ query: "ecosystem digest" }) },
    executeEntry(
      `const r = await codemode.skill.run("${DIGEST_ID}", { subject: "RWA tokenization" });\nreturn r;`,
      // whole execute result (the run-qa.mjs instrument) with a truncation footer
      `${JSON.stringify(digestEnvelope)}\n--- TRUNCATED ---\n(output capped)`
    )
  ]
};

const plainOpsRow = {
  id: "q-fixture-plain-ops",
  verdict: { score: "correct" },
  agent: { turns: 3, costUsd: 0.08 },
  transcript: [
    executeEntry(
      `const d = await lumenloop.search_directory({ query: "blend" });\nconst p = await lumenloop.get_project({ slug: "blend" });\nreturn { d, p };`,
      JSON.stringify({ d: { ok: true, data: { count: 1 } }, p: { ok: true, data: { slug: "blend" } } })
    )
  ]
};

describe("ADOPTION_RE — the §10.4 adoption signal", () => {
  it("matches both dispatch spellings, word-bounded", () => {
    expect(ADOPTION_RE.test('await codemode.skill.run("x", {})')).toBe(true);
    expect(ADOPTION_RE.test('await codemode.skill_run("x", {})')).toBe(true);
    // \b guard: a lookalike identifier must not flip adoption
    expect(ADOPTION_RE.test('await mycodemode.skill.run("x", {})')).toBe(false);
    expect(ADOPTION_RE.test('await codemode.skill.read("x")')).toBe(false);
  });
});

describe("loadRunnerOps — registry-backed expansion source", () => {
  it("loads the real registry and mirrors each runner's declared ops", async () => {
    const { runnerOps, note } = await loadRunnerOps();
    expect(note).toBeNull();
    expect(runnerOps).not.toBeNull();
    expect(Object.keys(runnerOps).sort()).toEqual(Object.keys(RUNNERS).sort());
    for (const [id, ops] of Object.entries(runnerOps)) {
      expect(ops).toEqual(RUNNERS[id].ops);
    }
  });
});

describe("analyzeRow — fixture transcript", () => {
  /** Static-import-derived runnerOps: identical data to loadRunnerOps (pinned above). */
  const runnerOps = Object.fromEntries(Object.entries(RUNNERS).map(([id, r]) => [id, [...r.ops]]));

  it("skill.run case: adoption flag, registry expansion, truncation flag, calls tallies", () => {
    const r = analyzeRow(skillRunRow, runnerOps);
    expect(r.id).toBe("q-fixture-skill-run");
    expect(r.executeScripts).toBe(1); // the search entry is not an execute entry
    expect(r.adoption).toBe(true);
    expect(r.skillRunCalls).toBe(1);
    // the digest's declared ops are inserted after the skill.run entry
    expect(r.expandedOps).toBe(RUNNERS[DIGEST_ID].ops.length);
    expect(r.opCounts["skills.skill.run"]).toBe(1);
    for (const op of RUNNERS[DIGEST_ID].ops) expect(r.opCounts[op]).toBe(1);
    // results side: captured whole, footer detected, host-ledger entries tallied
    expect(r.resultsCaptured).toBe(1);
    expect(r.truncatedResults).toBe(1);
    expect(r.calls).toEqual({ arrays: 1, calls: 2, ok: 1, error: 0, softEmpty: 1, unparsedResults: 0 });
    expect(r.turns).toBe(4);
    expect(r.costUsd).toBe(0.12);
  });

  it("plain-ops case: no adoption, no expansion, ops counted verbatim", () => {
    const r = analyzeRow(plainOpsRow, runnerOps);
    expect(r.adoption).toBe(false);
    expect(r.skillRunCalls).toBe(0);
    expect(r.expandedOps).toBe(0);
    expect(r.opCounts).toEqual({ "lumenloop.search_directory": 1, "lumenloop.get_project": 1 });
    expect(r.calls.arrays).toBe(0);
    expect(r.truncatedResults).toBe(0);
  });

  it("degrades gracefully without the registry (the pre-feature baseline side of the A/B)", () => {
    const r = analyzeRow(skillRunRow, null);
    expect(r.adoption).toBe(true);
    expect(r.skillRunCalls).toBe(1);
    expect(r.expandedOps).toBe(0); // counted, not expanded
  });
});

describe("tallyCallsArrays — regex fallback for footer-cut results", () => {
  it("falls back to the tolerant regex when truncation cut the JSON mid-body", () => {
    const cut =
      '{"ok":true,"data":{"calls":[{"op":"lumenloop.get_project","ok":true,"ms":9},{"op":"lumenloop.list_documents","ok":false,"errorKind":"error","ms":3}],"profi';
    const t = tallyCallsArrays(cut);
    expect(t.parsed).toBe(false);
    expect(t.calls).toBe(2);
    expect(t.ok).toBe(1);
    expect(t.error).toBe(1);
    expect(t.softEmpty).toBe(0);
  });
});

describe("summarizeComposition + formatCompositionTable", () => {
  it("aggregates adoption/expansion/truncation across the fixture rows", () => {
    const runnerOps = Object.fromEntries(Object.entries(RUNNERS).map(([id, r]) => [id, [...r.ops]]));
    const rows = [analyzeRow(skillRunRow, runnerOps), analyzeRow(plainOpsRow, runnerOps)];
    const summary = summarizeComposition(rows);
    expect(summary.cases).toBe(2);
    expect(summary.executeScripts).toBe(2);
    expect(summary.adoptionCases).toBe(1);
    expect(summary.skillRunCalls).toBe(1);
    expect(summary.expandedOps).toBe(RUNNERS[DIGEST_ID].ops.length);
    expect(summary.truncatedResultCases).toBe(1);
    expect(summary.calls).toMatchObject({ arrays: 1, calls: 2, ok: 1, softEmpty: 1, error: 0 });
    expect(summary.totalCostUsd).toBeCloseTo(0.2);

    const table = formatCompositionTable(summary, ["fixture note"]);
    expect(table).toContain("skill.run ADOPTION");
    expect(table).toContain("1/2 cases (50%)");
    expect(table).toContain("NOTE: fixture note");
  });
});
