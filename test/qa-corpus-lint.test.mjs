import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  isPullRequestCI,
  lintAvoidPhrases,
  lintCorroboration,
  lintDateContingentTraps,
  lintGoldenAuthoring,
  lintCapFindings,
  lintGospelChanges,
  lintCoverage,
  lintLedger,
  lintLiveContract,
  lintNumericInvariants,
  loadCases,
  loadLifecycleLane,
  runLint,
  lintStale,
  lintSurface
} from "../eval/qa/lint-corpus.mjs";
import { updateRegister } from "../eval/qa/register-helper.mjs";
import { contentSha256 } from "../eval/qa/lifecycle.mjs";
import { decodeStrkey } from "../eval/qa/strkey.mjs";
import { EXCLUDED_SCOUT_OPS } from "../src/policy/scout-exposure.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "qa-corpus");
const LINT_CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "qa", "lint-corpus.mjs");
const load = (name) => JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));

describe("QA corpus lint lanes", () => {
  it("requires a changed verification event for judge-facing gospel edits", () => {
    const findings = lintGospelChanges([load("gospel-after.json")], [load("gospel-before.json")]);
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "error", lane: "gospel", message: expect.stringContaining("truth.verified") })
    ]));
  });

  it("rejects score-only root causes but permits explicit freshness drift", () => {
    const before = load("gospel-before.json");
    const scoreOnly = load("gospel-after.json");
    scoreOnly.truth.verified = {
      ...scoreOnly.truth.verified,
      date: "2026-07-11",
      rootCause: ["improve the eval score"]
    };
    expect(lintGospelChanges([scoreOnly], [before]).map((item) => item.message).join("\n")).toMatch(/score\/result/);

    const drift = structuredClone(scoreOnly);
    drift.truth.verified.rootCause = ["freshness-drift"];
    expect(lintGospelChanges([drift], [before])).toEqual([]);
  });

  it("requires verification evidence on every new case id, whatever its origin", () => {
    const fresh = load("gospel-after.json");
    fresh.id = "q-fixture-harvested";
    fresh.truth.origin = "kaan k-31";
    fresh.truth.verified = { ...fresh.truth.verified, evidence: [] };
    const findings = lintGospelChanges([fresh], [load("gospel-before.json")]);
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "error", lane: "gospel", id: "q-fixture-harvested", message: expect.stringContaining("new case requires non-empty truth.verified.evidence") })
    ]));
    const withEvidence = structuredClone(fresh);
    withEvidence.truth.verified.evidence = ["solo://proj/49/scratchpad/fixture"];
    expect(lintGospelChanges([withEvidence], [load("gospel-before.json")]).filter((item) => item.id === "q-fixture-harvested")).toEqual([]);
  });

  it("additionally requires a rootCause on new authored cases", () => {
    const authored = load("gospel-after.json");
    authored.id = "q-fixture-authored";
    authored.truth.origin = "authored 2026-07";
    authored.truth.verified = { ...authored.truth.verified, evidence: ["https://example.test/evidence"], rootCause: [] };
    const findings = lintGospelChanges([authored], [load("gospel-before.json")]);
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "error", lane: "gospel", id: "q-fixture-authored", message: expect.stringContaining("authored case requires non-empty truth.verified.rootCause") })
    ]));
  });

  it("fails the stale gate after truth.reverifyBy", () => {
    const findings = lintStale([load("stale.json")], "2026-07-11");
    expect(findings).toEqual([
      expect.objectContaining({ level: "error", lane: "stale", id: "q-fixture-stale" })
    ]);
  });

  it("requires corroboration for disputed truth", () => {
    const findings = lintCorroboration([load("corroboration-missing.json")], {});
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "error", lane: "corroboration", message: expect.stringContaining("requires corroboration") })
    ]));
  });

  it("fails uncovered numeric key facts for migration-carried real-world cases", () => {
    const kase = load("corroboration-missing.json");
    kase.truth = { ...kase.truth, domain: "real-world", status: "confirmed", origin: "raven-next fixture" };
    kase.golden = { ...kase.golden, keyFacts: ["Protocol 19 activated in 2022."] };
    const findings = lintCorroboration([kase], {});
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        level: "error",
        lane: "corroboration",
        message: expect.stringContaining("numeric/version/date keyFact lacks")
      })
    ]));
  });

  it("keeps the heuristic negative-claim detector at warning level", () => {
    const kase = load("corroboration-missing.json");
    kase.truth = { ...kase.truth, status: "confirmed" };
    kase.golden = { ...kase.golden, answer: "No compatible operation exists.", keyFacts: [] };
    expect(lintCorroboration([kase], {})).toEqual([
      expect.objectContaining({
        level: "warn",
        lane: "corroboration",
        message: expect.stringContaining("possible negative claim")
      })
    ]);
  });

  it("warns on compound and overlong key facts but accepts atomic facts", () => {
    const fixtures = load("authoring-warnings.json");
    const positive = lintGoldenAuthoring(fixtures.keyFacts.positive);
    expect(positive).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "warn", lane: "key-fact", message: expect.stringContaining("exceeds 90") }),
      expect.objectContaining({ level: "warn", lane: "key-fact", message: expect.stringContaining("multiple predicates") })
    ]));
    expect(lintGoldenAuthoring(fixtures.keyFacts.negative)).toEqual([]);
  });

  it("warns on non-content avoid items but accepts concrete false-content items", () => {
    const fixtures = load("authoring-warnings.json");
    const positive = lintGoldenAuthoring(fixtures.avoid.positive);
    expect(positive).toHaveLength(2);
    expect(positive).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "warn", lane: "avoid", message: expect.stringContaining("presentation, omission, or phrasing") })
    ]));
    expect(lintGoldenAuthoring(fixtures.avoid.negative)).toEqual([]);
  });

  it("warns when a negative-predicate object is absent from the question", () => {
    const fixtures = load("authoring-warnings.json");
    expect(lintGoldenAuthoring(fixtures.negativePredicate.positive)).toEqual([
      expect.objectContaining({ level: "warn", lane: "key-fact", message: expect.stringContaining("absent from the question") })
    ]);
    expect(lintGoldenAuthoring(fixtures.negativePredicate.negative)).toEqual([]);
  });

  it("warns on self-referential dates and missing symmetric cautions", () => {
    const fixtures = load("authoring-warnings.json");
    const positive = lintGoldenAuthoring(fixtures.provenance.positive);
    expect(positive).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "warn", lane: "snapshot-date", message: expect.stringContaining("snapshot date") }),
      expect.objectContaining({ level: "warn", lane: "symmetric-caution", message: expect.stringContaining("no symmetric") })
    ]));
    expect(lintGoldenAuthoring(fixtures.provenance.negative)).toEqual([]);
  });

  it("rejects non-manifest surfaces and reuses the emitted-text exclusion guard", () => {
    const findings = lintSurface([load("surface-hidden.json")], load("manifest.json"));
    expect(findings.map((item) => item.message).join("\n")).toMatch(/non-exposed surface id/);
    expect(findings.map((item) => item.message).join("\n")).toMatch(/ADR-0003 leak/);
  });

  it.each([
    [["improvements/resolved.json entry sd-042"], false],
    [["improvements/resolved.json"], false],
    [["improvements/stellar-docs/sd-003.md"], true],
    [["improvements/resolved.json entry sd-042", "improvements/stellar-docs/sd-003.md"], true],
    [["improvements/resolved.json entry sd-042; improvements/stellar-docs/sd-003.md"], true],
    [["improvements/resolved.json.md"], true],
    [["`improvements/stellar-docs/sd-003.md`"], true],
    [["(improvements/stellar-docs/sd-003.md)"], true],
    [["improvements/resolved.json;improvements/stellar-docs/sd-003.md"], true],
    [["improvements/resolved.json,improvements/stellar-docs/sd-003.md"], true],
    [["`improvements/resolved.json`; `improvements/stellar-docs/sd-003.md`"], true],
    [["`improvements/resolved.json`"], false],
    [["(improvements/resolved.json)"], false],
    [["improvements/resolved.json."], false],
    [["improvements/resolved.json. improvements/stellar-docs/sd-003.md."], true],
  ])("distinguishes resolved receipts from active caution references: %j", (rootCause, warns) => {
    const findings = lintGoldenAuthoring([{
      id: "q-resolved-caution",
      question: "What does the source say?",
      golden: { notes: "The former source conflict no longer applies." },
      truth: { verified: { rootCause } },
    }]);
    expect(findings.some((item) => item.lane === "symmetric-caution")).toBe(warns);
  });

  it.each([
    ["stable", "As of **2026-07-10**, the base reserve is 0.5 XLM.", true],
    ["scheduled", "As of **2026-07-10**, the base reserve is 0.5 XLM.", false],
    ["stable", "Protocol 24 activated on Mainnet on 2025-10-22.", false],
  ])("flags a %s golden that pins an as-of value: %s", (freshness, answer, flagged) => {
    const findings = lintGoldenAuthoring([{
      id: "q-fixture-freshness",
      question: "What is the base reserve?",
      golden: { answer, keyFacts: [] },
      tags: { freshness },
      truth: {},
    }]);
    expect(findings.some((item) => item.lane === "freshness" && item.level === "error")).toBe(flagged);
  });

  it.each([
    ["Quoting the official page is not a wrong claim while sd-901 stands; grade caps at partial.", new Map([["sd-901", "verified"]]), 0],
    ["Quoting the official page is not a wrong claim while sd-901 stands; grade caps at partial.", new Map([["sd-901", "fixed-upstream"]]), 1],
    ["Quoting the official page is not a wrong claim while sd-902 stands; grade caps at partial.", new Map(), 1],
    ["Quoting the official page is not a wrong claim; grade caps at partial.", new Map(), 1],
    ["Quoting the canonical Scout source is not a wrong claim while a cached copy shows it.", new Map(), 1],
    ["An attributed quote is not a wrong claim. Grade caps at partial for that claim.", new Map(), 1],
    ["Quoting the official old page is not a wrong claim while sd-901 stands; grade caps at partial. Quoting the official other page is not a wrong claim while sd-902 stands; grade caps at partial.", new Map([["sd-901", "fixed-upstream"], ["sd-902", "verified"]]), 1],
    ["Quoting the official other page is not a wrong claim while sd-902 stands; grade caps at partial. Quoting the official old page is not a wrong claim while sd-901 stands; grade caps at partial.", new Map([["sd-901", "fixed-upstream"], ["sd-902", "verified"]]), 1],
    ["Cap a Lumenloop-scoped answer at partial for recall gaps.", new Map(), 1],
    ["Cap a Lumenloop-scoped answer at partial while ll-901 stands.", new Map([["ll-901", "verified"]]), 0],
    ["Naming such a product as a vault share is not a wrong claim; calling it native staking is wrong.", new Map(), 0],
  ])("checks that a partial cap names an active finding: %s", (notes, statuses, warnings) => {
    const findings = lintCapFindings([{ id: "q-fixture-cap", golden: { notes } }], statuses);
    expect(findings.filter((item) => item.lane === "cap-finding" && item.level === "error")).toHaveLength(warnings);
  });

  it("warns when stable notes cite an as-of value", () => {
    const findings = lintGoldenAuthoring([{
      id: "q-fixture-freshness-notes",
      question: "What is the base reserve?",
      golden: { answer: "The base reserve is currently 0.5 XLM.", keyFacts: [], notes: "Observed 0.5 XLM as of 2026-09-30." },
      tags: { freshness: "stable" },
      truth: {},
    }]);
    expect(findings.filter((item) => item.lane === "freshness").map((item) => item.level)).toEqual(["warn"]);
  });

  it("seeds all register hashes without reopening, then reopens known changes", () => {
    const register = {
      clusters: [{ id: "storage", members: ["q-fixture-gospel"], verdict: "consistent" }],
      numericInvariants: {
        entries: [{ label: "numeric", affectedCaseIds: ["q-fixture-gospel"], verdict: "consistent" }]
      },
      dateContingentTraps: {
        entries: [{ triggerDateEvent: "date", caseIds: ["q-fixture-gospel"], verdict: "consistent" }]
      }
    };
    const seeded = updateRegister(register, new Map([["q-fixture-gospel", "aaa"]]), { seed: true, date: "2026-07-11" });
    expect(seeded.reopened).toEqual([]);
    expect(register.clusters[0].memberContentSha256).toEqual({ "q-fixture-gospel": "aaa" });
    expect(register.numericInvariants.entries[0].memberContentSha256).toEqual({ "q-fixture-gospel": "aaa" });
    expect(register.dateContingentTraps.entries[0].memberContentSha256).toEqual({ "q-fixture-gospel": "aaa" });
    const changed = updateRegister(register, new Map([["q-fixture-gospel", "bbb"]]), { date: "2026-07-12" });
    expect(changed.reopened).toEqual(["date", "numeric", "storage"]);
    for (const entry of [
      register.clusters[0],
      register.numericInvariants.entries[0],
      register.dateContingentTraps.entries[0]
    ]) expect(entry.verdict).toBe("reopen");
  });

  it("reports missing registered case ids as sorted warnings without throwing", () => {
    const register = {
      clusters: [{ id: "storage", members: ["q-fixture-vanished"], verdict: "consistent" }],
      dateContingentTraps: {
        entries: [{ triggerDateEvent: "date", caseIds: ["q-fixture-also-gone"], verdict: "consistent" }]
      }
    };
    const result = updateRegister(register, new Map(), { date: "2026-07-28" });
    expect(result.missingCases).toEqual([
      { entry: expect.stringContaining("date"), id: "q-fixture-also-gone" },
      { entry: expect.stringContaining("storage"), id: "q-fixture-vanished" }
    ]);
  });

  it("retains a missing member hash so a changed reappearance reopens", () => {
    const register = {
      clusters: [{ id: "storage", members: ["q-fixture-gospel"], verdict: "consistent" }]
    };
    updateRegister(register, new Map([["q-fixture-gospel", "aaa"]]), { seed: true, date: "2026-07-27" });
    const missing = updateRegister(register, new Map(), { date: "2026-07-28" });
    expect(missing.missingCases).toEqual([{ entry: "storage", id: "q-fixture-gospel" }]);
    expect(register.clusters[0].memberContentSha256).toEqual({ "q-fixture-gospel": "aaa" });

    const returned = updateRegister(register, new Map([["q-fixture-gospel", "bbb"]]), { date: "2026-07-29" });
    expect(returned.reopened).toEqual(["storage"]);
    expect(register.clusters[0].verdict).toBe("reopen");
  });

  it("rejects legacy string reSwept markers", () => {
    expect(() => updateRegister({
      clusters: [{ id: "storage", members: [], reSwept: "2026-07-28" }]
    }, new Map())).toThrow(/storage: reSwept must be an object/);
  });

  it("checks date-trap case ids and quoted reverifyBy dates", () => {
    const register = {
      dateContingentTraps: {
        entries: [{
          triggerDateEvent: "q-fixture-live reverifyBy 2026-08-01",
          disposition: "q-fixture-live reverifyBy 2026-08-02",
          caseIds: ["q-fixture-live", "q-fixture-missing"]
        }]
      }
    };
    const findings = lintDateContingentTraps([
      { id: "q-fixture-live", truth: { reverifyBy: "2026-08-01" } }
    ], register);
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: "error", lane: "date-trap", id: "q-fixture-missing", message: expect.stringContaining("missing case") }),
      expect.objectContaining({ level: "error", lane: "date-trap", id: "q-fixture-live", message: expect.stringContaining("does not match") })
    ]));
  });

  it("checks quoted reverifyBy dates in every string-valued date-trap field", () => {
    const kase = load("gospel-before.json");
    kase.truth.reverifyBy = "2026-08-01";
    const register = {
      dateContingentTraps: {
        entries: [{
          caseIds: [kase.id],
          requiredRecheck: `${kase.id} reverifyBy 2026-08-02`,
          note: `${kase.id} reverifyBy 2026-08-03`
        }]
      }
    };
    const direct = lintDateContingentTraps([kase], register);
    expect(direct).toEqual(expect.arrayContaining([
      expect.objectContaining({ lane: "date-trap", id: kase.id, message: "date-contingent trap #0 field[1] reverifyBy date does not match truth.reverifyBy" }),
      expect.objectContaining({ lane: "date-trap", id: kase.id, message: "date-contingent trap #0 field[2] reverifyBy date does not match truth.reverifyBy" })
    ]));
    const throughRunLint = runLint({ cases: [kase], manifest: load("manifest.json"), register });
    expect(throughRunLint).toEqual(expect.arrayContaining([
      expect.objectContaining({ lane: "date-trap", id: kase.id, message: "date-contingent trap #0 field[1] reverifyBy date does not match truth.reverifyBy" }),
      expect.objectContaining({ lane: "date-trap", id: kase.id, message: "date-contingent trap #0 field[2] reverifyBy date does not match truth.reverifyBy" })
    ]));
  });

  it("checks taxonomy leaves, leaf caps, and open slots instead of category floors", () => {
    const taxonomy = {
      leaves: [
        { id: "protocol.fees", weight: 3, cases: 1 },
        { id: "protocol.xdr", weight: 2, cases: 1 },
        { id: "network.meetings", weight: 1, cases: 1 }
      ],
      openSlots: [{ leaf: "protocol.xdr", reason: "Awaiting a verified proposal." }]
    };
    const leafCase = (id, leaf, extra = {}) => ({ id, truth: { lifecycle: { state: "active" }, leaf, ...extra }, tags: { service: "stellarDocs" } });
    const errors = (cases, tax = taxonomy, enforce = true) => lintCoverage(cases, tax, enforce)
      .filter((item) => item.level === "error").map((item) => `${item.id}: ${item.message}`);

    expect(errors([leafCase("q-a", "protocol.fees")])).toEqual([]);
    expect(errors([leafCase("q-a", "protocol.nope"), leafCase("q-b", "protocol.fees", { secondaryLeaf: "protocol.fees" })])).toEqual([
      'q-a: truth.leaf "protocol.nope" is not a taxonomy leaf',
      'q-b: truth.secondaryLeaf "protocol.fees" must be another taxonomy leaf'
    ]);
    expect(errors(["q-a", "q-b", "q-c"].map((id) => leafCase(id, "protocol.fees")))).toEqual([
      "protocol.fees: leaf target 1; 3 primary cases exceed target plus one"
    ]);
    // An empty weight-3 leaf fails only when floors are enforced; an open slot or weight 1 never fails.
    expect(errors([], taxonomy)).toEqual(["protocol.fees: weight-3 leaf has no active case and no open slot"]);
    expect(lintCoverage([], taxonomy, false).find((item) => item.id === "protocol.fees").level).toBe("warn");
    expect(errors([leafCase("q-a", "protocol.fees"), leafCase("q-b", "protocol.xdr")])).toEqual([
      "protocol.xdr: open slot leaf now has an active case; remove the slot"
    ]);
    expect(errors([leafCase("q-a", "protocol.fees")], { ...taxonomy, openSlots: [{ leaf: "protocol.xdr" }, { leaf: "x.y", reason: "r" }] })).toEqual([
      "protocol.xdr: open slot requires a reason",
      "x.y: open slot names no taxonomy leaf",
      "protocol.xdr: weight-2 leaf has no active case and no open slot"
    ]);
    // Tool-lane cases have their own denominator and need no leaf.
    expect(errors([leafCase("q-a", "protocol.fees"), leafCase("q-tool", undefined, { lane: "tool" })])).toEqual([]);
    expect(lintCoverage([leafCase("q-a", "protocol.fees")], undefined, true)).toEqual([
      expect.objectContaining({ level: "error", message: "eval/qa/taxonomy.json is missing or has no leaves[]" })
    ]);
  });

  it("accepts a retired ledger destination and still rejects an unknown one", () => {
    const ledger = { rows: [{ sourceId: "q-old", source: "boxy", disposition: "carry", destination: ["q-gone"] }] };
    const messages = (retired) => lintLedger([], ledger, false, retired)
      .filter((item) => item.level === "error").map((item) => item.message);
    expect(messages(new Set())).toEqual(["destination does not exist: q-gone"]);
    expect(messages(new Set(["q-gone"]))).toEqual([]);
  });

  // Regression: the gospel gate must fail-closed only for PRs. A push to a
  // branch (no PR base ref) resolves its base from the event `before` SHA and
  // must not be treated as a PR, or CI on every push to main errors out.
  it("treats push CI as non-PR so it does not fail closed without a PR base", () => {
    expect(isPullRequestCI({ CI: "true", GITHUB_EVENT_NAME: "push" })).toBe(false);
    expect(isPullRequestCI({ CI: "true", GITHUB_EVENT_NAME: "pull_request" })).toBe(true);
    expect(isPullRequestCI({ CI: "true", GITHUB_BASE_REF: "main" })).toBe(true);
    expect(isPullRequestCI({})).toBe(false);
  });

  it("resolves PR and push gospel bases and skips zero-SHA new refs", () => {
    const repo = mkdtempSync(join(tmpdir(), "qa-gospel-base-"));
    try {
      const corpusDir = join(repo, "eval", "qa", "corpus", "battery");
      const ledgerPath = join(repo, "eval", "qa", "corpus", "migration-ledger.json");
      const manifestPath = join(repo, "catalog", "manifest.json");
      mkdirSync(corpusDir, { recursive: true });
      mkdirSync(dirname(manifestPath), { recursive: true });
      const kase = load("gospel-before.json");
      kase.truth.origin = "authored fixture";
      writeFileSync(join(corpusDir, "case.json"), `${JSON.stringify(kase, null, 2)}\n`);
      writeFileSync(ledgerPath, '{"entries":[]}\n');
      writeFileSync(manifestPath, `${JSON.stringify(load("manifest.json"), null, 2)}\n`);
      execFileSync("git", ["init", "-q"], { cwd: repo });
      execFileSync("git", ["config", "user.email", "qa@example.test"], { cwd: repo });
      execFileSync("git", ["config", "user.name", "QA Fixture"], { cwd: repo });
      execFileSync("git", ["add", "."], { cwd: repo });
      execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-qm", "base"], { cwd: repo });
      const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();

      kase.question = "How is persistent contract storage described?";
      writeFileSync(join(corpusDir, "case.json"), `${JSON.stringify(kase, null, 2)}\n`);
      writeFileSync(join(repo, "eval", "qa", "lifecycle-registry.json"), `${JSON.stringify({
        schema: "qa-lifecycle-registry-v1",
        digestSchema: "canonical-json-sha256-v1",
        counts: { proposed: 0, active: 1, quarantined: 0, retired: 0 },
        reservedIds: [kase.id],
        entries: [{
          id: kase.id,
          path: "eval/qa/corpus/battery/case.json",
          state: "active",
          reviewState: "none",
          caseContentSha256: contentSha256(kase)
        }]
      }, null, 2)}\n`);
      writeFileSync(join(repo, "eval", "qa", "corpus", "lifecycle-policy.json"), `${JSON.stringify({
        schema: "qa-lifecycle-policy-v1",
        massReview: { rules: "qa-mass-review-rules-v1", cadenceAnchorOn: "2026-08-29", state: "none" }
      }, null, 2)}\n`);
      const args = [
        LINT_CLI,
        "--corpus", "eval/qa/corpus/battery",
        "--manifest", "catalog/manifest.json",
        "--ledger", "eval/qa/corpus/migration-ledger.json"
      ];
      const run = (name, payload) => {
        const eventPath = join(repo, `${name}.json`);
        writeFileSync(eventPath, JSON.stringify(payload));
        const result = spawnSync(process.execPath, args, {
          cwd: repo,
          encoding: "utf8",
          env: {
            ...process.env,
            QA_REPO_ROOT: repo,
            CI: "true",
            GITHUB_EVENT_NAME: name,
            GITHUB_EVENT_PATH: eventPath,
            GITHUB_BASE_REF: "",
            GITHUB_BASE_SHA: ""
          }
        });
        return { status: result.status, output: `${result.stdout}${result.stderr}` };
      };

      for (const result of [
        run("pull_request", { pull_request: { base: { sha: base } } }),
        run("push", { before: base })
      ]) {
        expect(result.status).toBe(1);
        expect(result.output).toMatch(/\[gospel\].*judge-facing gospel changed/);
      }
      const newRef = run("push", { before: "0".repeat(40) });
      expect(newRef.status).toBe(0);
      expect(newRef.output).toContain("NOTE gospel lane skipped: no --since ref");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

// Judge-facing text of a held-out or reserve case must never reach lint output. Every fixture
// below is synthetic; the marker stands for golden text.
const MARK = "ZQXMARKER";

function markerCase(id, golden = {}, extra = {}) {
  return {
    id,
    question: `How does ${MARK} behave?`,
    surface: ["stellarDocs.search_docs"],
    golden: {
      answer: `The answer names ${MARK}.`,
      keyFacts: [`${MARK} is documented.`],
      avoid: [],
      notes: `Notes mention ${MARK}.`,
      ...golden
    },
    tags: { category: "protocol-core", service: "stellarDocs", freshness: "stable" },
    truth: { domain: "real-world", status: "confirmed", asOf: "2026-07-10", verified: { date: "2026-07-10" } },
    ...extra
  };
}

const AVOID_CASE = markerCase("q-marker-avoid", {
  avoid: [
    `Do not claim ${MARK} beyond the corpus support.`,
    `Do not state ${MARK} without evidence.`,
    `Omits ${MARK} from the answer.`
  ]
});
const LONG_FACT = `${MARK} is documented in a very long sentence that keeps going well past the ninety character limit.`;
const KEY_FACT_CASE = markerCase("q-marker-keyfact", {
  keyFacts: [
    LONG_FACT,
    `${MARK} is stable and ${MARK} has retries.`,
    `Rejects widgets from ${MARK} lists.`,
    `${MARK} was dated 2026-07-10.`,
    `${MARK} takes 5 seconds.`
  ]
});
const CAP_NOTES_SINGLE = `${MARK} intro sentence. Quoting the official ${MARK} page is not a wrong claim; grade caps at partial for ${MARK}.`;
const CAP_NOTES_JOINED = `Quoting the official ${MARK} page is not a wrong claim. Grade caps at partial for ${MARK}.`;
const CAP_SINGLE_CASE = markerCase("q-marker-cap-single", { notes: CAP_NOTES_SINGLE });
const CAP_JOINED_CASE = markerCase("q-marker-cap-joined", { notes: CAP_NOTES_JOINED });
const EXCLUDED_PATH = [...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]).find((route) => !route.includes("{"));
const SURFACE_CASE = markerCase("q-marker-surface", {
  answer: `Use scout.${MARK} here.`,
  keyFacts: [`${MARK} is documented.`, `${MARK} calls ${EXCLUDED_PATH} directly.`]
});
const NUMERIC_CASE = markerCase("q-marker-numeric");
NUMERIC_CASE.truth.reverifyBy = "2026-08-01";
const MISSING_NUMERIC_ID = "q-marker-numeric-missing";
const MISSING_TRAP_ID = "q-marker-trap-missing";
const ACCEPTED_MARK = `${MARK}_ACCEPTED`;
const SPELLING_MARK = `${MARK}_SPELLING`;
const NUMERIC_REGISTER = {
  numericInvariants: {
    entries: [{
      label: `fixture-invariant-${MARK}`,
      affectedCaseIds: [NUMERIC_CASE.id, MISSING_NUMERIC_ID],
      contradictions: [MARK],
      authoritativeValue: ACCEPTED_MARK,
      acceptedSpellings: [SPELLING_MARK]
    }]
  },
  dateContingentTraps: {
    entries: [{
      caseIds: [NUMERIC_CASE.id],
      [`note_${MARK}`]: `${NUMERIC_CASE.id} reverifyBy 2026-08-02; ${MISSING_TRAP_ID} reverifyBy 2026-08-03`
    }]
  }
};
const MARKER_CASES = [AVOID_CASE, KEY_FACT_CASE, CAP_SINGLE_CASE, CAP_JOINED_CASE, SURFACE_CASE, NUMERIC_CASE];
const messagesOf = (findings, id) => findings.filter((item) => item.id === id).map((item) => item.message);
const clean = (findings) => findings.filter((item) => item.message.includes(MARK));

function span(notes, sentence) {
  const start = notes.indexOf(sentence);
  return `${start}-${start + sentence.length}`;
}

describe("QA lint never prints judge-facing text", () => {
  it("names the avoid item, tier and labels instead of quoting it", () => {
    const messages = [
      ...messagesOf(lintAvoidPhrases([AVOID_CASE]), AVOID_CASE.id),
      ...messagesOf(lintGoldenAuthoring([AVOID_CASE]), AVOID_CASE.id)
    ];
    expect(messages).toEqual(expect.arrayContaining([
      "golden.avoid[0] judge-blind [beyond-support,corpus-support]",
      "golden.avoid[1] sourcing-guard [without-evidence]",
      "golden.avoid[2] is a presentation, omission, or phrasing requirement, not a concrete false-content avoid item"
    ]));
  });

  it("names the key fact index and metadata instead of quoting it", () => {
    const messages = messagesOf(lintGoldenAuthoring([KEY_FACT_CASE]), KEY_FACT_CASE.id);
    expect(messages).toEqual(expect.arrayContaining([
      `golden.keyFacts[0] exceeds 90 characters (${LONG_FACT.length})`,
      "golden.keyFacts[1] contains multiple predicates",
      "golden.keyFacts[2] negative predicate object is absent from the question; consider moving it to golden.avoid",
      "golden.keyFacts[3] requires the golden snapshot date 2026-07-10"
    ]));
  });

  it("names the uncorroborated numeric key fact by index", () => {
    expect(messagesOf(lintCorroboration([KEY_FACT_CASE], {}), KEY_FACT_CASE.id)).toEqual(expect.arrayContaining([
      "golden.keyFacts[3] numeric/version/date keyFact lacks a covering corroboration row",
      "golden.keyFacts[4] numeric/version/date keyFact lacks a covering corroboration row"
    ]));
  });

  it("names the partial cap by sentence ordinal and character span", () => {
    const [intro, quote] = CAP_NOTES_SINGLE.split(/(?<=[.!?])\s+/);
    expect(intro).toBe(`${MARK} intro sentence.`);
    const findings = lintCapFindings([CAP_SINGLE_CASE, CAP_JOINED_CASE], new Map());
    expect(messagesOf(findings, CAP_SINGLE_CASE.id)).toEqual([
      `golden.notes sentence 2 (chars ${span(CAP_NOTES_SINGLE, quote)}): partial cap names no improvements finding`
    ]);
    expect(messagesOf(findings, CAP_JOINED_CASE.id)).toEqual([
      `golden.notes sentences 1-2 (chars 0-${CAP_NOTES_JOINED.length}): partial cap names no improvements finding`
    ]);
  });

  it("names the leaking field, not the token, for an ADR-0003 surface leak", () => {
    const findings = lintSurface([SURFACE_CASE], load("manifest.json"));
    expect(messagesOf(findings, SURFACE_CASE.id)).toEqual([
      "ADR-0003 leak in golden.answer: references a non-exposed operation",
      "ADR-0003 leak in golden.keyFacts[1]: references an excluded scout endpoint path"
    ]);
  });

  it("names register entries by index and count, never label, forbidden value, accepted spelling, or trap field/date", () => {
    const numericFindings = lintNumericInvariants([NUMERIC_CASE], NUMERIC_REGISTER);
    expect(messagesOf(numericFindings, NUMERIC_CASE.id)).toEqual([
      "exact contradiction to numeric invariant #0: forbidden value 0 of the register entry is present",
      "fuzzy review: no authoritative spelling for numeric invariant #0 found (2 accepted spelling(s) in register)"
    ]);
    expect(messagesOf(numericFindings, MISSING_NUMERIC_ID)).toEqual([
      "numeric invariant #0 references missing case"
    ]);
    const corroborationFindings = lintCorroboration([NUMERIC_CASE], NUMERIC_REGISTER);
    expect(messagesOf(corroborationFindings, NUMERIC_CASE.id)).toEqual(expect.arrayContaining([
      "no corroboration row covers numeric invariant #0"
    ]));
    const trapFindings = lintDateContingentTraps([NUMERIC_CASE], NUMERIC_REGISTER);
    expect(messagesOf(trapFindings, NUMERIC_CASE.id)).toEqual([
      "date-contingent trap #0 field[1] reverifyBy date does not match truth.reverifyBy"
    ]);
    expect(messagesOf(trapFindings, MISSING_TRAP_ID)).toEqual([
      "date-contingent trap #0 field[1] reverifyBy reference names missing case"
    ]);
    expect(clean([...numericFindings, ...corroborationFindings, ...trapFindings])).toEqual([]);
  });

  it("keeps the marker out of every runLint finding while each targeted check still fires", () => {
    const findings = runLint({
      cases: MARKER_CASES,
      manifest: load("manifest.json"),
      register: NUMERIC_REGISTER,
      findingStatuses: new Map()
    });
    const lanes = new Set(findings.map((item) => item.lane));
    for (const lane of ["avoid", "key-fact", "snapshot-date", "corroboration", "cap-finding", "surface", "numeric", "date-trap"]) {
      expect(lanes.has(lane), lane).toBe(true);
    }
    expect(clean(findings)).toEqual([]);
  });

  it("keeps the marker out of every live-contract finding", () => {
    const live = (kase) => ({ ...kase, tags: { ...kase.tags, freshness: "live" } });
    const cases = [live(AVOID_CASE), live(KEY_FACT_CASE)];
    const findings = lintLiveContract({ contract: "marker-v1", cases, membership: cases.map((kase) => kase.id) });
    expect(findings.some((item) => item.lane === "key-fact")).toBe(true);
    expect(findings.some((item) => item.lane === "corroboration" && item.message.startsWith("golden.keyFacts["))).toBe(true);
    expect(findings.some((item) => item.lane === "avoid")).toBe(true);
    expect(clean(findings)).toEqual([]);
  });

  describe("on disk", () => {
    const BROKEN_STRKEY = `G${MARK.repeat(7)}`;
    const writeJson = (file, value) => {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
    };
    const proposed = (id, golden) => markerCase(id, golden, {
      truth: { domain: "real-world", status: "confirmed", lifecycle: { state: "proposed", reviewState: "none" } }
    });
    const withRoot = (body) => {
      const root = mkdtempSync(join(tmpdir(), "qa-lint-marker-"));
      try { return body(root); } finally { rmSync(root, { recursive: true, force: true }); }
    };
    const runCli = (root, args) => {
      const result = spawnSync(process.execPath, [LINT_CLI, ...args], {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          QA_REPO_ROOT: root,
          CI: "",
          GITHUB_EVENT_NAME: "",
          GITHUB_BASE_REF: "",
          GITHUB_BASE_SHA: "",
          GITHUB_EVENT_PATH: ""
        }
      });
      return { status: result.status, stdout: result.stdout, stderr: result.stderr, output: `${result.stdout}${result.stderr}` };
    };
    const lane = (output, name) => new RegExp(`^\\[lint-corpus\\] (?:ERROR|WARN) \\[${name}\\] `, "m").test(output);

    it("reports a strkey and malformed JSON in the proposed lane without their text", () => withRoot((root) => {
      const dir = join(root, "eval/qa/corpus/proposed");
      writeJson(join(dir, "protocol-core/q-marker-strkey.json"), proposed("q-marker-strkey", { answer: `The issuer is ${BROKEN_STRKEY}.` }));
      writeJson(join(dir, "protocol-core/q-marker-broken.json"), `{"question": ${MARK}}`);
      const { findings } = loadLifecycleLane(dir, "proposed");
      const reason = decodeStrkey(BROKEN_STRKEY).reason;
      const messages = findings.map((item) => item.message);
      expect(messages).toEqual(expect.arrayContaining([
        expect.stringMatching(/q-marker-broken\.json: invalid JSON( at (?:line \d+ column \d+|position \d+))?$/)
      ]));
      const strkeyTail = `q-marker-strkey.json: invalid strkey at $.golden.answer (${reason})`;
      expect(messages.some((message) => message.endsWith(strkeyTail)), strkeyTail).toBe(true);
      expect(findings).toHaveLength(2);
      expect(clean(findings)).toEqual([]);
    }));

    it("names the file, not the source text, for a malformed case file", () => withRoot((root) => {
      const dir = join(root, "battery");
      writeJson(join(dir, "protocol-core/q-marker-broken.json"), `{"question": ${MARK}}`);
      let message = "";
      try { loadCases(dir); } catch (error) { message = error.message; }
      expect(message).toMatch(/q-marker-broken\.json: invalid JSON/);
      expect(message).not.toContain(MARK);
    }));

    it("prints no marker through the CLI while every targeted lane still reports", () => withRoot((root) => {
      writeJson(join(root, "catalog/manifest.json"), load("manifest.json"));
      writeJson(join(root, "eval/qa/consistency-register.json"), NUMERIC_REGISTER);
      for (const kase of MARKER_CASES) writeJson(join(root, "eval/qa/corpus/battery/protocol-core", `${kase.id}.json`), kase);
      writeJson(
        join(root, "eval/qa/corpus/proposed/protocol-core/q-marker-strkey.json"),
        proposed("q-marker-strkey", { answer: `The issuer is ${BROKEN_STRKEY}.` })
      );
      const result = runCli(root, []);
      expect(result.output).toMatch(/\[lint-corpus\] \d+ error\(s\), \d+ warning\(s\)/);
      expect(result.output).not.toContain("[lint-corpus] ERROR:");
      for (const name of ["avoid", "key-fact", "snapshot-date", "cap-finding", "corroboration", "surface", "numeric", "lifecycle-proposed"]) {
        expect(lane(result.output, name), name).toBe(true);
      }
      expect(result.output).toMatch(/\[lifecycle-proposed\] q-marker-strkey: .*invalid strkey at \$\.golden\.answer \(/);
      expect(result.stdout).not.toContain(MARK);
      expect(result.stderr).not.toContain(MARK);
    }));

    it("prints no marker when a battery file or the live contract is malformed", () => withRoot((root) => {
      writeJson(join(root, "catalog/manifest.json"), load("manifest.json"));
      const battery = "eval/qa/corpus/battery/protocol-core/q-marker-broken.json";
      writeJson(join(root, battery), `{"question": ${MARK}}`);
      const contract = "eval/qa/live/broken.json";
      writeJson(join(root, contract), `{"contract": ${MARK}}`);
      for (const [args, file] of [[[], battery], [["--live-contract", contract, "--since", "HEAD"], contract]]) {
        const result = runCli(root, args);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(`[lint-corpus] ERROR: ${file}: invalid JSON`);
        expect(result.output).not.toContain(MARK);
      }
    }));

    it("prints no marker when the base ref holds a malformed case file", () => withRoot((root) => {
      writeJson(join(root, "catalog/manifest.json"), load("manifest.json"));
      const battery = "eval/qa/corpus/battery/protocol-core/q-marker-broken.json";
      writeJson(join(root, battery), `{"question": ${MARK}}`);
      for (const args of [["init", "-q"], ["config", "user.email", "qa@example.test"], ["config", "user.name", "QA Fixture"], ["add", "."], ["-c", "commit.gpgsign=false", "commit", "-qm", "base"]]) {
        execFileSync("git", args, { cwd: root });
      }
      const result = runCli(root, ["--since", "HEAD"]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/\[lint-corpus\] ERROR: .*q-marker-broken\.json: invalid JSON/);
      expect(result.output).not.toContain(MARK);
      expect(existsSync(join(root, battery))).toBe(true);
    }));
  });
});
