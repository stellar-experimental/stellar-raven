#!/usr/bin/env node
/**
 * self-test.mjs — standalone checks for grader math and committed eval evidence.
 * No server is required:
 *   node eval/self-test.mjs
 *
 * Fixture: a fake 3-entry catalog (as ranked hit lists) + 3 fake cases + 1 skip,
 * proving top-1/3/5 semantics, card@5 tolerant matching, skip handling, aggregation.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { aggregate, cardMatches, cardMatchesExact, canonToken, gradeCase, tableRows } from "./lib/grade.mjs";
import {
  deriveExpectedAny,
  frontmatterRouting,
  overlayExpectedAnyById,
  parseFrontmatterList,
  unionExpectedAny,
} from "./lib/labels.mjs";

// --- fake catalog: 3 entries across our namespaces --------------------------------
const E = {
  scoutProjects: { id: "scout.list_projects", service: "scout", kind: "operation", score: 0, description: "" },
  docsSearch: { id: "stellarDocs.search_docs", service: "stellarDocs", kind: "operation", score: 0, description: "" },
  llDirectory: { id: "lumenloop.search_directory", service: "lumenloop", kind: "operation", score: 0, description: "" },
  skillContracts: { id: "skills.stellar-dev.smart-contracts", service: "skills", kind: "skill", score: 0, description: "" },
  skillContractsSection: { id: "skills.stellar-dev.smart-contracts#storage", service: "skills", kind: "skill-section", score: 0, description: "" },
  skillDossier: { id: "skills.lumenloop.stellar-project-dossier", service: "skills", kind: "skill", score: 0, description: "" },
};
const rank = (...entries) => entries.map((e, i) => ({ ...e, score: 1 - i * 0.1 }));

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
};

const GATE_EVIDENCE_INPUTS = [
  "catalog/manifest.json",
  "eval/routing-cases.json",
  "eval/skills-cases.json",
  "eval/holdout-cases.json",
];

check("routing gate evidence resolves from committed files", () => {
  const repoRoot = new URL("../", import.meta.url);
  const gates = JSON.parse(readFileSync(new URL("./gates.json", import.meta.url), "utf8"));
  assert.ok(gates.evidence && typeof gates.evidence === "object" && !Array.isArray(gates.evidence));
  assert.ok(Array.isArray(gates.evidence.inputs));
  assert.deepEqual(gates.evidence.inputs.map((input) => input.path), GATE_EVIDENCE_INPUTS);
  for (const input of gates.evidence.inputs) {
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
    const actual = createHash("sha256").update(readFileSync(new URL(input.path, repoRoot))).digest("hex");
    assert.equal(actual, input.sha256, `${input.path} must match its committed gate fingerprint`);
  }
  if (gates.evidence.localTrace !== undefined) {
    assert.equal(typeof gates.evidence.localTrace, "string");
    assert.ok(gates.evidence.localTrace.length > 0);
  }
});

check("routing gate evidence commits accepted totals", () => {
  const gates = JSON.parse(readFileSync(new URL("./gates.json", import.meta.url), "utf8"));
  const totals = gates.evidence.acceptedTotals;
  const assertCounts = (lane, required) => {
    assert.ok(totals[lane] && typeof totals[lane] === "object" && !Array.isArray(totals[lane]));
    for (const key of required) assert.ok(Number.isInteger(totals[lane][key]) && totals[lane][key] >= 0, `${lane}.${key} must be a non-negative integer`);
  };
  assertCounts("legacy", ["n", "top1", "top3", "top5", "cardN", "cardHit5"]);
  assertCounts("skills", ["n", "top1", "top3", "top5", "cardN", "cardHit5"]);
  assertCounts("holdout", ["n", "top1", "top3", "top5", "cardN", "cardHit5", "forbiddenCaptures", "passed"]);
  assert.deepEqual(
    { n: totals.legacy.n, top1: totals.legacy.top1, top3: totals.legacy.top3, top5: totals.legacy.top5 },
    { n: gates.legacy.n, top1: gates.legacy.top1, top3: gates.legacy.top3, top5: gates.legacy.top5 },
  );
  assert.equal(totals.skills.n, gates.skills.n);
  assert.ok(totals.skills.top1 >= gates.skills.minTop1);
  assert.equal(totals.holdout.n, gates.holdout.n);
  assert.ok(totals.holdout.top1 >= gates.holdout.minTop1);
  assert.ok(totals.holdout.top3 >= gates.holdout.minTop3);
  assert.ok(totals.holdout.top5 >= gates.holdout.minTop5);
  assert.ok(totals.holdout.forbiddenCaptures <= gates.holdout.maxForbiddenCaptures);
});

// --- canonToken / cardMatches ------------------------------------------------------
check("canonToken unifies separators + case", () => {
  assert.equal(canonToken("Lumenloop.Search-Directory"), "lumenloop_search_directory");
});
check("cardMatches: exact canonical id match", () => {
  assert.equal(cardMatches("lumenloop_search_directory", E.llDirectory), true);
});
check("cardMatchesExact: uses mapped service + exact operation only", () => {
  assert.equal(cardMatchesExact("stellar_docs_search_docs", E.docsSearch), true);
  assert.equal(cardMatchesExact("scout_projects", E.scoutProjects), false);
  assert.equal(cardMatchesExact("skills_smart_contracts", E.skillContracts), true);
});
check("cardMatches: stellar_docs_ prefix maps to stellarDocs service, tolerant op containment", () => {
  // expected op "search_docs" vs hit op "search_docs" via stellar_docs_ prefix
  assert.equal(cardMatches("stellar_docs_search_docs", E.docsSearch), true);
  // containment: "projects" (>=4 chars) within "list_projects", same service
  assert.equal(cardMatches("scout_projects", E.scoutProjects), true);
});
check("cardMatches: rejects cross-service and short-token matches", () => {
  assert.equal(cardMatches("scout_projects", E.llDirectory), false);
  assert.equal(cardMatches("scout_ls", E.scoutProjects), false); // shorter op < 4 chars
});
check("cardMatches: skills_ prefix maps to skills service; terminal name matches skills.<source>.<name>", () => {
  // catalog skill ids carry a <source> segment ("stellar-dev") the card omits;
  // rule-3 containment bridges it: "smart_contracts" within "stellar_dev_smart_contracts"
  assert.equal(cardMatches("skills_smart_contracts", E.skillContracts), true);
  // a section of the right skill also counts (id carries a #fragment suffix)
  assert.equal(cardMatches("skills_smart_contracts", E.skillContractsSection), true);
  assert.equal(cardMatches("skills_stellar_project_dossier", E.skillDossier), true);
  // wrong skill under the same service must not match
  assert.equal(cardMatches("skills_smart_contracts", E.skillDossier), false);
  // wrong service must not match even with a similar op name
  assert.equal(cardMatches("skills_search_directory", E.llDirectory), false);
});

// --- gradeCase: top-1/3/5 semantics ------------------------------------------------
// case 1: expected service at rank 1 -> all true; expected card present -> cardHit5 true
check("case1: hit at rank 1", () => {
  const g = gradeCase(rank(E.scoutProjects, E.docsSearch, E.llDirectory), "scout", ["scout_projects"]);
  assert.deepEqual(g, { top1: true, top3: true, top5: true, cardHit5: true });
});
// case 2: expected service at rank 3 -> top1 false, top3/top5 true; no expected_cards -> cardHit5 null
check("case2: hit at rank 3, no cards", () => {
  const g = gradeCase(rank(E.scoutProjects, E.llDirectory, E.docsSearch), "stellarDocs", undefined);
  assert.deepEqual(g, { top1: false, top3: true, top5: true, cardHit5: null });
});
// case 3: expected service never returned -> all false; expected card absent -> cardHit5 false
check("case3: total miss", () => {
  const g = gradeCase(rank(E.scoutProjects, E.docsSearch), "lumenloop", ["lumenloop_get_project"]);
  assert.deepEqual(g, { top1: false, top3: false, top5: false, cardHit5: false });
});
check("empty hits -> all false", () => {
  const g = gradeCase([], "scout", undefined);
  assert.deepEqual(g, { top1: false, top3: false, top5: false, cardHit5: null });
});

// --- expected_any (accept-either) --------------------------------------------------
check("expected_any: skills hit at rank 1 fails strict but passes accept-either", () => {
  const g = gradeCase(
    rank(E.skillContracts, E.docsSearch, E.scoutProjects),
    "stellarDocs",
    undefined,
    ["stellarDocs", "skills"],
  );
  // strict fields judge expected_service alone (docs at rank 2)
  assert.deepEqual(
    g,
    { top1: false, top3: true, top5: true, cardHit5: null, any1: true, any3: true, any5: true },
  );
});
check("expected_any: neither accepted service in hits -> any* all false", () => {
  const g = gradeCase(rank(E.scoutProjects, E.llDirectory), "stellarDocs", undefined, ["stellarDocs", "skills"]);
  assert.deepEqual(
    g,
    { top1: false, top3: false, top5: false, cardHit5: null, any1: false, any3: false, any5: false },
  );
});
check("expected_any: accepted service only past rank 3 -> any5 only", () => {
  const g = gradeCase(
    rank(E.scoutProjects, E.llDirectory, E.scoutProjects, E.skillContracts),
    "stellarDocs",
    undefined,
    ["stellarDocs", "skills"],
  );
  assert.deepEqual(
    g,
    { top1: false, top3: false, top5: false, cardHit5: null, any1: false, any3: false, any5: true },
  );
});
check("no expected_any -> result shape unchanged (no any* fields), strict math identical", () => {
  const withAny = gradeCase(rank(E.docsSearch, E.skillContracts), "stellarDocs", undefined, ["stellarDocs", "skills"]);
  const without = gradeCase(rank(E.docsSearch, E.skillContracts), "stellarDocs", undefined);
  assert.deepEqual(without, { top1: true, top3: true, top5: true, cardHit5: null });
  assert.equal("any1" in without, false);
  // strict fields identical with or without the accept set
  assert.deepEqual(
    { top1: withAny.top1, top3: withAny.top3, top5: withAny.top5 },
    { top1: without.top1, top3: without.top3, top5: without.top5 },
  );
});
check("skills-lane case: strict grading with skills as expected_service + skills card@5", () => {
  const g = gradeCase(rank(E.skillDossier, E.docsSearch), "skills", ["skills_stellar_project_dossier"]);
  assert.deepEqual(g, { top1: true, top3: true, top5: true, cardHit5: true });
  // right service, wrong skill -> service metrics hit, card metric misses
  const g2 = gradeCase(rank(E.skillContracts), "skills", ["skills_lumenloop_api_billing"]);
  assert.deepEqual(g2, { top1: true, top3: true, top5: true, cardHit5: false });
});

// --- aggregation over the 3 graded cases (the skip never reaches the grader:
// compile-routing.mjs routes unmappable labels to the skipped list, which run-routing
// only counts — mimic that by grading exactly the 3 usable cases). ------------------
check("aggregate: overall + per-service math", () => {
  const results = [
    { expected_service: "scout", top1: true, top3: true, top5: true, cardHit5: true },
    { expected_service: "stellarDocs", top1: false, top3: true, top5: true, cardHit5: null },
    { expected_service: "lumenloop", top1: false, top3: false, top5: false, cardHit5: false },
  ];
  const { overall, perService } = aggregate(results);
  assert.deepEqual(overall, { n: 3, top1: 1, top3: 2, top5: 2, cardN: 2, cardHit5: 1 });
  assert.deepEqual(perService.scout, { n: 1, top1: 1, top3: 1, top5: 1, cardN: 1, cardHit5: 1 });
  assert.deepEqual(perService.stellarDocs, { n: 1, top1: 0, top3: 1, top5: 1, cardN: 0, cardHit5: 0 });
  assert.deepEqual(perService.lumenloop, { n: 1, top1: 0, top3: 0, top5: 0, cardN: 1, cardHit5: 0 });
});
check("tableRows renders rates + n/a for zero-denominator card metric", () => {
  const rows = tableRows(aggregate([
    { expected_service: "scout", top1: true, top3: true, top5: true, cardHit5: null },
  ]));
  assert.equal(rows.length, 2); // scout + OVERALL
  assert.equal(rows[1].scope, "OVERALL");
  assert.equal(rows[1]["top-1"], "100.0%");
  assert.ok(rows[1]["card@5"].startsWith("n/a"));
});

// --- grading rule v3 (ADR-0003): no twin identity — service labels are exact --------
check("gradeCase v3: a skills hit does NOT satisfy a lumenloop-expected case", () => {
  const readable = { id: "skills.lumenloop.scf-submission-radar", service: "skills", kind: "skill", score: 0, description: "" };
  const g = gradeCase(rank(readable, E.docsSearch), "lumenloop", undefined, undefined);
  assert.deepEqual(g, { top1: false, top3: false, top5: false, cardHit5: null });
  const g2 = gradeCase(rank(readable, E.docsSearch), "skills", undefined, undefined);
  assert.deepEqual(g2, { top1: true, top3: true, top5: true, cardHit5: null });
});
check("cardMatches v3: cross-service card never matches", () => {
  const readable = { id: "skills.lumenloop.scf-submission-radar", service: "skills", kind: "skill", score: 0, description: "" };
  assert.equal(cardMatches("skills_scf_submission_radar", readable), true);
  assert.equal(cardMatches("lumenloop_scf_submission_radar", readable), false);
  assert.equal(cardMatches("skills_search_directory", E.llDirectory), false);
});
check("gradeCase v3: cross-service tolerance is expected_any only", () => {
  const readable = { id: "skills.lumenloop.scf-submission-radar", service: "skills", kind: "skill", score: 0, description: "" };
  const g = gradeCase(rank(readable), "stellarDocs", undefined, ["stellarDocs", "skills"]);
  assert.equal(g.any1, true); // skills is in the accept set
  assert.equal(g.top1, false); // strict vs stellarDocs unaffected
});

// --- labels.mjs: corpus-label helpers ----------------------------------------------
check("deriveExpectedAny: cross-service acceptable_cards produce a sorted accept set", () => {
  assert.deepEqual(
    deriveExpectedAny("stellarDocs", ["scout_research", "lumenloop_search_directory", "scout_repos"]),
    ["stellarDocs", "lumenloop", "scout"],
  );
});
check("deriveExpectedAny: same-service and out-of-catalog cards contribute nothing", () => {
  // acceptable cards on the expected service itself -> no tolerance to add
  assert.equal(deriveExpectedAny("scout", ["scout_research", "scout_repos"]), null);
  // perplexity/parallel aren't in this catalog -> excluded entirely
  assert.equal(deriveExpectedAny("stellarDocs", ["perplexity_search", "parallel_extract"]), null);
  assert.equal(deriveExpectedAny("stellarDocs", []), null);
  assert.equal(deriveExpectedAny("stellarDocs", undefined), null);
});
check("per-case overlay applies to legacy and extended labels", () => {
  const overlay = JSON.parse(readFileSync(new URL("./build-question-overlay.json", import.meta.url), "utf8"));
  const byId = overlayExpectedAnyById(overlay, new Set([
    "q-tool-cctp-stellar-integration",
    "q-defi-bridge-evm-to-stellar-axelar",
  ]));
  assert.deepEqual(
    unionExpectedAny("stellarDocs", undefined, byId.get("q-tool-cctp-stellar-integration")),
    ["stellarDocs", "skills"],
  );
  assert.deepEqual(
    unionExpectedAny("scout", ["scout", "lumenloop"], byId.get("q-defi-bridge-evm-to-stellar-axelar")),
    ["scout", "lumenloop", "skills"],
  );
});
check("per-case overlay rejects malformed and duplicate records", () => {
  const known = new Set(["q-x"]);
  assert.throws(
    () => overlayExpectedAnyById({ cases: [{ id: "q-x", expected_any: "skills" }] }, known),
    /non-empty expected_any string array/,
  );
  assert.throws(
    () => overlayExpectedAnyById({ cases: [
      { id: "q-unknown", expected_any: ["skills"] },
      { id: "q-unknown", expected_any: ["skills"] },
    ] }, known),
    /duplicate overlay case id/,
  );
});
check("parseFrontmatterList: inline style with comments", () => {
  const txt = "id: q-x\nexpected_cards: [stellar_docs_mcp]  # the docs card\nacceptable_cards: [scout_research, scout_repos]\n";
  assert.deepEqual(parseFrontmatterList(txt, "expected_cards"), ["stellar_docs_mcp"]);
  assert.deepEqual(parseFrontmatterList(txt, "acceptable_cards"), ["scout_research", "scout_repos"]);
  assert.deepEqual(parseFrontmatterList(txt, "forbidden_cards"), []);
});
check("parseFrontmatterList: block style", () => {
  const txt = "expected_cards:\n  - scout_research\nacceptable_cards:\n  - stellar_docs_mcp\n  - lumenloop_search_content_semantic\nforbidden_cards: []\n";
  assert.deepEqual(parseFrontmatterList(txt, "expected_cards"), ["scout_research"]);
  assert.deepEqual(parseFrontmatterList(txt, "acceptable_cards"), ["stellar_docs_mcp", "lumenloop_search_content_semantic"]);
});
check("frontmatterRouting: extracts service, fire flag, and both card lists", () => {
  const txt = [
    "---",
    "id: q-x",
    "expected_cards: [stellar_docs_mcp]",
    "acceptable_cards:",
    "  - scout_research",
    "forbidden_cards: []",
    "expected_service: stellar_docs",
    "should_fire: true",
    "---",
  ].join("\n");
  assert.deepEqual(frontmatterRouting(txt), {
    expected_service: "stellar_docs",
    should_fire: true,
    expected_cards: ["stellar_docs_mcp"],
    acceptable_cards: ["scout_research"],
  });
});

// --- content-pinned hand-authored QA lane contracts -------------------------------
const caseContentDigest = (cases) => createHash("sha256").update(JSON.stringify(cases)).digest("hex");

check("live-data-canonical-v3 pins carried-v2 identity, ordered membership, and full case content", () => {
  const canonical = JSON.parse(readFileSync(new URL("./qa/corpus/live/live-cases.json", import.meta.url), "utf8"));
  assert.equal(canonical.contract, "live-data-canonical-v3");
  const carriedV2Membership = [
      "q-live-rfps-open-now",
      "q-live-rfps-passkey-smart-account",
      "q-live-hackathon-recent-winners",
      "q-live-zk-repos-current",
      "q-live-oracle-repo-triage",
      "q-live-leaderboard-active-projects",
      "q-live-ecosystem-crowded-underbuilt",
      "q-live-ll-scf-latest-round",
      "q-live-ll-regions-vocab",
      "q-live-trap-market-price"
    ];
  const expectedMembership = [
    ...carriedV2Membership,
    "q-live-fluxity-status-provenance",
    "q-live-ll-active-jobs-recency",
    "q-live-beans-cross-service-reconcile",
    "q-live-ll-guessed-slug-soft-empty",
    "q-live-builders-artifact-continuation"
  ];
  assert.deepEqual(canonical.membership, expectedMembership);
  assert.deepEqual(canonical.cases.map((c) => c.id), expectedMembership);
  assert.deepEqual(canonical.cases.slice(0, carriedV2Membership.length).map((c) => c.id), carriedV2Membership);
  const carriedV2Projection = carriedV2Membership.map((id) => canonical.cases.find((c) => c.id === id));
  assert.ok(carriedV2Projection.every(Boolean));
  assert.equal(
    caseContentDigest(carriedV2Projection),
    "d5fd27a15c3ef0dd711df565e9809c15ebfb6d62f1a414738f47f41484866a90"
  );
  const services = canonical.cases.map((c) => c.tags.service);
  assert.deepEqual(
    Object.fromEntries([...new Set(services)].sort().map((service) => [service, services.filter((x) => x === service).length])),
    { lumenloop: 4, none: 1, scout: 10 }
  );
  assert.equal(canonical.cases.find((c) => c.tags.service === "none")?.tags.trap, "cant-do");
  const expectedDigest = "2a9c98d1088acc7bbbf563ac3a95fbe74e2bea81901c6d0fcc6e5860b1c23340";
  assert.equal(caseContentDigest(canonical.cases), expectedDigest);
  assert.equal(
    canonical.contractProvenance.caseContentDigest,
    `sha256(JSON.stringify(cases))=${expectedDigest}`
  );
});

check("live-digest-supplement-v2 pins contract, ordered membership, and full case content", () => {
  const canonical = JSON.parse(readFileSync(new URL("./qa/corpus/live/live-cases.json", import.meta.url), "utf8"));
  const supplement = JSON.parse(
    readFileSync(new URL("./qa/corpus/live/live-digest-supplement-cases.json", import.meta.url), "utf8")
  );
  assert.equal(supplement.contract, "live-digest-supplement-v2");
  const expectedMembership = ["q-live-digest-rwa-recent", "q-live-digest-blend-coverage"];
  assert.deepEqual(supplement.membership, expectedMembership);
  assert.deepEqual(supplement.cases.map((c) => c.id), expectedMembership);
  assert.ok(supplement.cases.every((c) => c.tags.service === "lumenloop"));
  const canonicalIds = new Set(canonical.cases.map((c) => c.id));
  assert.ok(supplement.cases.every((c) => !canonicalIds.has(c.id)));
  const expectedDigest = "a0e8ec59360c27d7acb50ff4ee76240cfc78c87e73204b1ecc458ce865e11900";
  assert.equal(caseContentDigest(supplement.cases), expectedDigest);
  assert.equal(
    supplement.contractProvenance.caseContentDigest,
    `sha256(JSON.stringify(cases))=${expectedDigest}`
  );
});

if (failures > 0) {
  console.error(`\nself-test: ${failures} failure(s)`);
  process.exit(1);
}
console.log("\nself-test: all checks passed");
