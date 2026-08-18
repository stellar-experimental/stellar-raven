import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PHASE1_MIN_INDEPENDENT_CASES,
  allowedCandidateUrl,
  baselineCode as buildBaselineCode,
  matchFacts,
  parseSseJson,
  resolvedCommitForUrl,
  summarize,
  validateSuite
} from "../scripts/eval-partner-docs.mjs";

const passingScore = { matched: 1, total: 1, recall: 1, detail: [] };
const losingScore = { matched: 0, total: 1, recall: 0, detail: [] };
const winningRow = (caseType) => ({
  caseType,
  baseline: { score: losingScore, error: null },
  candidate: { score: passingScore, errors: [], documents: [] }
});

describe("partner docs eval harness", () => {
  it("accepts only the two bounded public source families", () => {
    expect(allowedCandidateUrl("https://www.alchemy.com/docs/data/llms.txt", "alchemy")).toBe(true);
    expect(allowedCandidateUrl("https://www.alchemy.com/docs/reference/page.md", "alchemy")).toBe(true);
    expect(allowedCandidateUrl("https://www.alchemy.com/docs/reference/page.md?raw=1", "alchemy")).toBe(false);
    expect(allowedCandidateUrl("https://www.alchemy.com/docs/%2e%2e/page.md", "alchemy")).toBe(false);
    expect(allowedCandidateUrl("https://www.alchemy.com/api/mutate", "alchemy")).toBe(false);
    expect(allowedCandidateUrl("https://evil.example/docs/page.md", "alchemy")).toBe(false);
    expect(allowedCandidateUrl(
      "https://raw.githubusercontent.com/OpenZeppelin/docs/refs/heads/main/content/stellar-contracts/index.mdx",
      "openzeppelin"
    )).toBe(true);
    expect(allowedCandidateUrl(
      "https://raw.githubusercontent.com/OpenZeppelin/other/refs/heads/main/content/stellar-contracts/index.mdx",
      "openzeppelin"
    )).toBe(false);
  });

  it("matches fact groups with explicit alternatives", () => {
    const score = matchFacts("Native XLM; pagination uses an opaque pageKey cursor.", [
      ["native XLM"],
      ["pageKey", "cursor"],
      ["NFT holdings"]
    ]);
    expect(score.matched).toBe(2);
    expect(score.total).toBe(3);
    expect(score.recall).toBeCloseTo(2 / 3);
    expect(matchFacts("posted the update", [["POST"]]).matched).toBe(0);
    expect(matchFacts("POST the request", [["POST"]]).matched).toBe(1);
  });

  it("parses Raven's single-event SSE responses", () => {
    expect(parseSseJson('event: message\ndata: {"result":{"ok":true}}\n\n')).toEqual({ result: { ok: true } });
  });

  it("records immutable GitHub revisions and leaves branch refs unresolved", () => {
    expect(resolvedCommitForUrl(
      "https://raw.githubusercontent.com/OpenZeppelin/docs/f304ed55579dedf7ee0d2cc46982cca67c48e700/content/stellar-contracts/index.mdx"
    )).toBe("f304ed55579dedf7ee0d2cc46982cca67c48e700");
    expect(resolvedCommitForUrl(
      "https://raw.githubusercontent.com/OpenZeppelin/docs/refs/heads/main/content/stellar-contracts/index.mdx"
    )).toBeNull();
  });

  it("makes a baseline error gate-inconclusive instead of dropping the row", () => {
    const rows = [
      {
        baseline: { score: passingScore, error: null },
        candidate: { score: passingScore, errors: [], documents: [] }
      },
      {
        baseline: { score: null, error: "timeout" },
        candidate: { score: passingScore, errors: [], documents: [] }
      }
    ];
    const summary = summarize(rows);
    expect(summary.baselineCases).toBe(1);
    expect(summary.baselineErrors).toBe(1);
    expect(summary.retrievalAdmissionGate).toBe("inconclusive");
  });

  it("rejects an invalid CLI suite before making a fetch call", () => {
    const fixtureRoot = realpathSync(mkdtempSync(join(tmpdir(), "partner-docs-invalid-suite-")));
    const markerPath = join(fixtureRoot, "fetch-called");
    const scriptPath = join(fixtureRoot, "scripts/eval-partner-docs.mjs");
    const casesPath = join(fixtureRoot, "eval/partner-docs/cases.json");
    const preloadPath = join(fixtureRoot, "block-fetch.mjs");
    try {
      mkdirSync(join(fixtureRoot, "scripts"), { recursive: true });
      mkdirSync(join(fixtureRoot, "eval/partner-docs"), { recursive: true });
      copyFileSync(new URL("../scripts/eval-partner-docs.mjs", import.meta.url), scriptPath);
      writeFileSync(casesPath, JSON.stringify({
        contract: "partner-docs-retrieval-v1",
        cases: [{
          id: "invalid-url",
          partner: "alchemy",
          caseType: "page-derived",
          question: "question",
          baseline: [{ type: "operation", id: "stellarDocs.search_docs" }],
          candidateUrls: ["https://evil.example/docs/page.md"],
          facts: [["fact"]]
        }]
      }));
      writeFileSync(preloadPath, [
        'import { writeFileSync } from "node:fs";',
        `globalThis.fetch = async () => { writeFileSync(${JSON.stringify(markerPath)}, "called"); throw new Error("unexpected fetch"); };`
      ].join("\n"));

      const result = spawnSync(process.execPath, ["--import", preloadPath, scriptPath, "--json"], {
        cwd: fixtureRoot,
        encoding: "utf8"
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/candidate URL outside allowlist/);
      expect(existsSync(markerPath)).toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("rejects duplicate case ids and unsupported baseline calls", () => {
    const baseCase = {
      id: "case-a",
      partner: "alchemy",
      caseType: "page-derived",
      question: "question",
      baseline: [{ type: "operation", id: "stellarDocs.search_docs" }],
      candidateUrls: ["https://www.alchemy.com/docs/reference/page.md"],
      facts: [["fact"]]
    };
    expect(() => validateSuite({ contract: "partner-docs-retrieval-v1", cases: [baseCase, { ...baseCase }] })).toThrow(/duplicate/);
    expect(() => validateSuite({
      contract: "partner-docs-retrieval-v1",
      cases: [{ ...baseCase, baseline: [{ type: "operation", id: "partner.fetch_url" }] }]
    })).toThrow(/unsupported baseline/);
    expect(() => validateSuite({
      contract: "partner-docs-retrieval-v1",
      cases: [{ ...baseCase, caseType: "page derived" }]
    })).toThrow(/invalid caseType/);
    expect(() => validateSuite({
      contract: "partner-docs-retrieval-v1",
      cases: [{ ...baseCase, caseType: "conflict" }]
    })).toThrow(/needs provenance/);
    // Forward-only: the single-object form is gone, not tolerated alongside the array.
    expect(() => validateSuite({
      contract: "partner-docs-retrieval-v1",
      cases: [{ ...baseCase, baseline: { type: "operation", id: "stellarDocs.search_docs" } }]
    })).toThrow(/non-empty array/);
    expect(() => validateSuite({
      contract: "partner-docs-retrieval-v1",
      cases: [{ ...baseCase, baseline: [] }]
    })).toThrow(/non-empty array/);
  });

  it("composes every baseline source in one execute run, like the candidate arm unions its pages", () => {
    const suite = validateSuite(JSON.parse(readFileSync(new URL("../eval/partner-docs/cases.json", import.meta.url), "utf8")));
    const alchemy = suite.cases.filter((testCase) => testCase.partner === "alchemy");

    // #657 anchored the provider-roster docs on the research lane for exactly these questions, so
    // excluding it would measure Raven minus the lane that answers them.
    expect(alchemy.length).toBeGreaterThan(0);
    for (const testCase of alchemy) {
      expect(testCase.baseline.map((source) => source.id)).toContain("scout.searchResearch");
    }

    // Scout takes q/limit; reusing the stellarDocs envelope would silently mis-page it.
    const composed = buildBaselineCode(suite.cases.find((testCase) => testCase.id === "alchemy-stellar-data-overview"));
    expect(composed).toContain("Promise.all([");
    expect(composed).toContain("scout.searchResearch({ q:");
    expect(composed).not.toContain("scout.searchResearch({ query:");
    expect(composed).toContain("stellarDocs.search_rpc_horizon_data_docs({ query:");
  });

  it("holds the phase-1 floor: independent cases are what admit the retrieval gate", () => {
    const independent = Array.from({ length: PHASE1_MIN_INDEPENDENT_CASES }, () => winningRow("conflict"));
    const summary = summarize(independent);
    expect(summary).not.toHaveProperty("allowlistViolations");
    expect(summary.retrievalAdmissionGate).toBe("pass");
    expect(summarize(independent).independentCases).toBe(PHASE1_MIN_INDEPENDENT_CASES);

    // One short of the floor fails, and page-derived cases cannot backfill it — that substitution
    // is exactly what the gate exists to forbid.
    expect(summarize(independent.slice(1)).retrievalAdmissionGate).toBe("fail");
    expect(summarize([...independent.slice(1), winningRow("page-derived")]).retrievalAdmissionGate).toBe("fail");
  });

  it("keeps the committed suite above the phase-1 floor", () => {
    const suite = validateSuite(JSON.parse(readFileSync(new URL("../eval/partner-docs/cases.json", import.meta.url), "utf8")));
    const independent = suite.cases.filter((testCase) => testCase.caseType !== "page-derived");
    expect(independent.length).toBeGreaterThanOrEqual(PHASE1_MIN_INDEPENDENT_CASES);
    // The gate asks for paraphrase/negative/conflict coverage, not four of one kind.
    expect(new Set(independent.map((testCase) => testCase.caseType))).toEqual(
      new Set(["paraphrase", "negative", "conflict"])
    );
  });
});
