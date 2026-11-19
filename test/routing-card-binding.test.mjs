import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  cardMatches,
  classifyCardBinding,
  findUnboundRoutingCards,
  isExternalServiceCard,
} from "../eval/lib/grade.mjs";

const REPO = join(import.meta.dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(REPO, relPath), "utf8"));
}

const SAMPLE_ENTRIES = [
  { id: "scout.getHackathon", service: "scout", kind: "operation", searchable: true },
  { id: "scout.getHackathons", service: "scout", kind: "operation", searchable: true },
  { id: "scout.getSkill", service: "scout", kind: "operation", searchable: true },
  { id: "lumenloop.get_project", service: "lumenloop", kind: "operation", searchable: true },
  { id: "stellarDocs.search_docs", service: "stellarDocs", kind: "operation", searchable: true },
  { id: "skills.stellar-dev.smart-contracts", service: "skills", kind: "skill", searchable: true },
  { id: "skills.stellar-dev.smart-contracts#storage", service: "skills", kind: "skill-section", searchable: false },
  { id: "scout.hiddenOp", service: "scout", kind: "operation", searchable: false },
];

describe("routing card binding helpers", () => {
  it("classifies operation, service, external, and unbound cards", () => {
    expect(classifyCardBinding("scout_hackathon_detail", SAMPLE_ENTRIES)).toBe("operation");
    expect(classifyCardBinding("scout_skill_detail", SAMPLE_ENTRIES)).toBe("operation");
    expect(classifyCardBinding("lumenloop_project_detail", SAMPLE_ENTRIES)).toBe("operation");
    expect(classifyCardBinding("stellar_docs_mcp", SAMPLE_ENTRIES)).toBe("service");
    expect(classifyCardBinding("perplexity_search", SAMPLE_ENTRIES)).toBe("external");
    expect(classifyCardBinding("parallel_web_search", SAMPLE_ENTRIES)).toBe("external");
    expect(isExternalServiceCard("perplexity_search")).toBe(true);
    expect(isExternalServiceCard("scout_projects")).toBe(false);

    // Unbound: no matching op, typo'd service prefix, missing service, or unsearchable-only entry.
    expect(classifyCardBinding("scout_nonexistent_detail", SAMPLE_ENTRIES)).toBeNull();
    expect(classifyCardBinding("scuot_hackathon_detail", SAMPLE_ENTRIES)).toBeNull();
    expect(classifyCardBinding("mcp", SAMPLE_ENTRIES)).toBeNull();
    expect(classifyCardBinding("scout_hiddenop", SAMPLE_ENTRIES)).toBeNull();
    expect(
      classifyCardBinding(
        "stellar_docs_mcp",
        SAMPLE_ENTRIES.filter((e) => e.service !== "stellarDocs"),
      ),
    ).toBeNull();
  });

  it("fails on unbound cards, external-only cases, and missing/empty card lists without leaking case text", () => {
    const MARKER = "SYNTHETIC_PRIVATE_MARKER_7b3e";
    const failures = findUnboundRoutingCards(
      [
        { id: `${MARKER}-ok`, question: MARKER, expected_cards: ["scout_hackathon_detail"] },
        { id: `${MARKER}-ext-with-cat`, question: MARKER, expected_cards: ["lumenloop_project_detail", "perplexity_search"] },
        { id: `${MARKER}-unbound`, question: MARKER, expected_cards: [`scout_${MARKER}`] },
        { id: `${MARKER}-ext-only`, question: MARKER, expected_cards: ["perplexity_search"] },
        { id: `${MARKER}-empty`, question: MARKER, expected_cards: [] },
        { id: `${MARKER}-missing`, question: MARKER },
      ],
      SAMPLE_ENTRIES,
      { lane: "synthetic" },
    );

    expect(failures).toEqual([
      { lane: "synthetic", caseIndex: 2, cardIndex: 0, reason: "unbound" },
      { lane: "synthetic", caseIndex: 2, cardIndex: null, reason: "no-catalog-card" },
      { lane: "synthetic", caseIndex: 3, cardIndex: null, reason: "no-catalog-card" },
      { lane: "synthetic", caseIndex: 4, cardIndex: null, reason: "no-cards" },
      { lane: "synthetic", caseIndex: 5, cardIndex: null, reason: "no-cards" },
    ]);
    expect(JSON.stringify(failures)).not.toContain(MARKER);
  });
});

describe("committed routing corpus card bindings", () => {
  const manifest = readJson("catalog/manifest.json");
  const searchableEntries = manifest.entries.filter(
    (e) => e.searchable !== false && e.kind !== "skill-section",
  );

  it("binds scout_hackathon_detail and scout_skill_detail to their exact getter ops", () => {
    expect(
      searchableEntries.filter((e) => cardMatches("scout_hackathon_detail", e)).map((e) => e.id),
    ).toEqual(["scout.getHackathon"]);
    expect(
      searchableEntries.filter((e) => cardMatches("scout_skill_detail", e)).map((e) => e.id),
    ).toEqual(["scout.getSkill"]);
  });

  // Holdout exact-card binding is already enforced on every `eval:routing -- --gate` run in eval/run-routing.mjs.
  it("binds every card in routing-cases.json and skills-cases.json to a catalog op or service", () => {
    const routing = readJson("eval/routing-cases.json");
    const skills = readJson("eval/skills-cases.json");

    expect(findUnboundRoutingCards(routing.cases, manifest.entries, { lane: "legacy" })).toEqual([]);
    expect(findUnboundRoutingCards(routing.extendedCases, manifest.entries, { lane: "extended" })).toEqual([]);
    expect(findUnboundRoutingCards(skills.cases, manifest.entries, { lane: "skills" })).toEqual([]);
  });
});
