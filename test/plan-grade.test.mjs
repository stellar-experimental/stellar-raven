/**
 * Plan-eval tests (eval/plan/*) — rule matching (override + refinement +
 * catch-all), op extraction from realistic execute code, broad→detail
 * progression ordering, legacy-truncation flagging, and op-classes
 * generation. Pure Node, no network; uses the real committed rules/classes
 * so the tests also pin the data contracts.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractExecuteOps,
  extractPlainOperationTool,
  matchPlanRule,
  detectProgression,
  gradeRow,
  summarizePlan
} from "../eval/plan/grade-plan.mjs";
import { buildOpClasses, classifyOp } from "../eval/plan/build-op-classes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rulesDoc = JSON.parse(readFileSync(join(ROOT, "eval", "plan", "coverage-rules.json"), "utf8"));
const opClasses = JSON.parse(readFileSync(join(ROOT, "eval", "plan", "op-classes.json"), "utf8")).classes;
const manifest = JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"));

const row = (tags, extra = {}) => ({ id: "q-test", question: "", tags, transcript: [], ...extra });

describe("matchPlanRule — ordered rules, first match wins", () => {
  it("routes SCF cases to the overlap rule (scout AND lumenloop acceptable)", () => {
    const m = matchPlanRule(row({ category: "scf-grants-builders", service: "scout" }), rulesDoc);
    expect(m.ruleId).toBe("scf-grants-builders");
    expect(m.plan.anyOf).toEqual(["scout", "lumenloop"]);
    expect(m.plan.acceptable).toContain("skills");
    expect(m.plan.progressionExpected).toBe(true);
  });

  it("service-refined rule beats the category default (soroban + scout)", () => {
    const eco = matchPlanRule(row({ category: "soroban", service: "scout" }), rulesDoc);
    expect(eco.ruleId).toBe("soroban-ecosystem");
    expect(eco.plan.required).toEqual(["scout"]);
    const docs = matchPlanRule(row({ category: "soroban", service: "stellarDocs" }), rulesDoc);
    expect(docs.ruleId).toBe("soroban");
    expect(docs.plan.anyOf).toEqual(["stellarDocs", "skills"]);
  });

  it("question-regex rule fires before category rules", () => {
    const m = matchPlanRule(
      row({ category: "soroban", service: "stellarDocs" }, { question: "How do I use OpenZeppelin contracts on Soroban?" }),
      rulesDoc
    );
    expect(m.ruleId).toBe("openzeppelin");
    expect(m.plan.anyOf).toContain("skills");
  });

  it("id overrides beat every rule and normalize acceptable ⊇ anyOf", () => {
    const m = matchPlanRule(
      { id: "q-soroban-av-passkeys-talk", question: "", tags: { category: "soroban", service: "lumenloop" } },
      rulesDoc
    );
    expect(m.ruleId).toBe("override:q-soroban-av-passkeys-talk");
    expect(m.plan.anyOf).toEqual(["lumenloop"]);
    expect(m.plan.acceptable).toContain("lumenloop");
  });

  it("traps (service none) match first; unknown categories hit the catch-all", () => {
    const trap = matchPlanRule(row({ category: "edge-behavior", service: "none" }), rulesDoc);
    expect(trap.ruleId).toBe("trap-none");
    expect(trap.plan.required).toEqual([]);
    const misc = matchPlanRule(row({ category: "brand-new-category", service: "scout" }), rulesDoc);
    expect(misc.ruleId).toBe("catch-all");
    expect(misc.plan.acceptable.sort()).toEqual(["lumenloop", "scout", "skills", "stellarDocs"]);
  });

  it("every cases.json case matches some rule (catch-all guarantees totality)", () => {
    const cases = JSON.parse(readFileSync(join(ROOT, "eval", "qa", "cases.json"), "utf8")).cases;
    for (const c of cases) expect(() => matchPlanRule(c, rulesDoc)).not.toThrow();
  });
});

describe("extractExecuteOps — regex over stored execute inputs", () => {
  const code = [
    "const rfps = await scout.getRfps({ status: 'open' });",
    "const subs = await lumenloop.find_similar_scf_submissions({ query: 'anchor' });",
    "const detail = await lumenloop.get_scf_submissions({ project_slug: subs[0].slug });",
    "const hits = await codemode.search('scf audit skill');",
    "const skill = await codemode.skill.read('scf-submission-radar');",
    "const docs = await stellarDocs.search_docs({ query: 'SEP-8' });",
    "return { rfps, detail, skill, docs };"
  ].join("\n");
  const input = JSON.stringify({ code });

  it("extracts service ops, skills reads, and meta-discovery in source order", () => {
    const { ops, truncated } = extractExecuteOps(input);
    expect(truncated).toBe(false);
    expect(ops).toEqual([
      { service: "scout", op: "getRfps" },
      { service: "lumenloop", op: "find_similar_scf_submissions" },
      { service: "lumenloop", op: "get_scf_submissions" },
      { service: "meta-discovery", op: "search" },
      { service: "skills", op: "skill.read" },
      { service: "stellarDocs", op: "search_docs" }
    ]);
  });

  it("flags legacy truncation: unparseable slices and exactly-600-char inputs", () => {
    const cut = input.slice(0, 180); // mid-token slice → invalid JSON
    expect(extractExecuteOps(cut).truncated).toBe(true);
    const padded = JSON.stringify({ code: "x".repeat(600) }).slice(0, 600);
    expect(padded.length).toBe(600);
    expect(extractExecuteOps(padded).truncated).toBe(true);
    // still extracts what survives the cut
    expect(extractExecuteOps(cut).ops[0]).toEqual({ service: "scout", op: "getRfps" });
  });
});

describe("detectProgression — broad must PRECEDE detail, per service", () => {
  it("broad then detail counts; detail-only and detail-before-broad do not", () => {
    const used = detectProgression(
      [
        { service: "scout", op: "searchProjects" },
        { service: "scout", op: "getPartner" }
      ],
      opClasses
    );
    expect(used.progressionUsed).toBe(true);
    expect(used.perService.scout.broadBeforeDetail).toBe(true);

    const detailOnly = detectProgression([{ service: "scout", op: "getPartner" }], opClasses);
    expect(detailOnly.progressionUsed).toBe(false);

    const reversed = detectProgression(
      [
        { service: "scout", op: "getPartner" },
        { service: "scout", op: "searchProjects" }
      ],
      opClasses
    );
    expect(reversed.progressionUsed).toBe(false);
  });

  it("progression is per-service — broad in one service doesn't cover another's detail", () => {
    const cross = detectProgression(
      [
        { service: "lumenloop", op: "search_directory" },
        { service: "scout", op: "getPartner" }
      ],
      opClasses
    );
    expect(cross.progressionUsed).toBe(false);
    expect(cross.perService.scout.broadBeforeDetail).toBe(false);
  });

  it("skills detail accepts an earlier discovery search as its broad half; meta ops never count", () => {
    const viaDiscovery = detectProgression(
      [
        { service: "meta-discovery", op: "search" },
        { service: "skills", op: "skill.read" }
      ],
      opClasses
    );
    expect(viaDiscovery.progressionUsed).toBe(true);
    const metaFirst = detectProgression(
      [
        { service: "scout", op: "getStatus" }, // meta, not broad
        { service: "scout", op: "getPartner" }
      ],
      opClasses
    );
    expect(metaFirst.progressionUsed).toBe(false);
  });
});

describe("gradeRow — end-to-end over a realistic transcript", () => {
  const scfRow = {
    id: "q-scf-audit-bank",
    question: "Which SCF program funds audits?",
    tags: { category: "scf-grants-builders", service: "scout" },
    verdict: { score: "correct" },
    transcript: [
      { tool: "mcp__raven__search", input: '{"query":"scf audits"}' },
      {
        tool: "mcp__raven__execute",
        input: JSON.stringify({
          code: "const r = await scout.getRfps({}); const h = await scout.getHackathon({ slug: r.rfps[0].slug }); return h;"
        })
      },
      {
        tool: "mcp__raven__execute",
        input: JSON.stringify({ code: "return lumenloop.find_similar_scf_submissions({ query: 'audit' });" })
      }
    ]
  };

  it("grades set coverage, ratio, progression, and search count together", () => {
    const g = gradeRow(scfRow, rulesDoc, opClasses);
    expect(g.ruleId).toBe("scf-grants-builders");
    expect(g.touchedServices).toEqual(["lumenloop", "scout"]);
    expect(g.requiredCovered).toBe(true); // anyOf(scout|lumenloop) satisfied
    expect(g.onPlanRatio).toBe(1);
    expect(g.offPlanServices).toEqual([]);
    expect(g.searchQueries).toBe(1);
    expect(g.executeCalls).toBe(2);
    expect(g.truncatedInputs).toBe(0);
    expect(g.progressionUsed).toBe(true); // scout getRfps (broad) → getHackathon (detail)
    expect(g.progression.scout.broadBeforeDetail).toBe(true);
  });

  it("reports off-plan touches and missed required sets without conflating them", () => {
    const g = gradeRow(
      {
        id: "q-proto-x",
        question: "How does SCP consensus reach agreement?",
        tags: { category: "protocol-core", service: "stellarDocs" },
        verdict: { score: "wrong" },
        transcript: [
          {
            tool: "mcp__raven__execute",
            input: JSON.stringify({ code: "return lumenloop.search_directory({ query: 'SCP' });" })
          }
        ]
      },
      rulesDoc,
      opClasses
    );
    expect(g.requiredCovered).toBe(false); // required stellarDocs untouched
    expect(g.offPlanServices).toEqual(["lumenloop"]); // not in protocol-core acceptable
    expect(g.onPlanRatio).toBe(0);
    const summary = summarizePlan([g]);
    expect(summary.byRequired.missed.wrong).toBe(1);
    expect(summary.offPlanCounts.lumenloop).toBe(1);
  });

  it("grades the isolated plain-operation harness without execute-code extraction", () => {
    expect(extractPlainOperationTool("mcp__raven__scout_getRfps")).toEqual({
      service: "scout",
      op: "getRfps"
    });
    const g = gradeRow(
      {
        ...scfRow,
        transcript: [
          { tool: "mcp__raven__scout_getRfps", input: "{}" },
          { tool: "mcp__raven__scout_getHackathon", input: '{"slug":"demo"}' },
          { tool: "mcp__raven__lumenloop_find_similar_scf_submissions", input: '{"query":"audit"}' }
        ]
      },
      rulesDoc,
      opClasses
    );
    expect(g.touchedServices).toEqual(["lumenloop", "scout"]);
    expect(g.operationToolCalls).toBe(3);
    expect(g.executeCalls).toBe(0);
    expect(g.searchQueries).toBe(0);
    expect(g.progression.scout.broadBeforeDetail).toBe(true);
  });
});

describe("build-op-classes — generated classes stay in sync with the catalog", () => {
  it("classifies known ops per the documented prefix/override data", () => {
    expect(classifyOp("stellarDocs.search_docs").cls).toBe("broad");
    expect(classifyOp("scout.getHackathons").cls).toBe("broad"); // plural override
    expect(classifyOp("scout.getHackathon").cls).toBe("detail");
    expect(classifyOp("scout.searchHackathonBuilds").cls).toBe("broad");
    expect(classifyOp("scout.getPeople").cls).toBe("broad");
    expect(classifyOp("scout.listAudits").cls).toBe("broad");
    expect(classifyOp("scout.getStablecoins").cls).toBe("broad");
    expect(classifyOp("scout.scfPitch").cls).toBe("broad");
    expect(classifyOp("scout.vetIdea").cls).toBe("broad");
    expect(classifyOp("scout.getStatus").cls).toBe("meta"); // override
    expect(classifyOp("scout.someFutureThing").matched).toBe(false); // → warned
    // Build-time-excluded ops (ADR-0003) carry no override — they classify
    // like any other unknown name an LLM might hallucinate.
    expect(classifyOp("lumenloop.request_research").matched).toBe(false);
  });

  it("committed op-classes.json matches a fresh build (no hand edits, no unmatched)", () => {
    const fresh = buildOpClasses(manifest);
    const committed = JSON.parse(readFileSync(join(ROOT, "eval", "plan", "op-classes.json"), "utf8"));
    expect(committed.classes).toEqual(fresh.classes);
    expect(committed.unmatched).toEqual([]);
  });
});
