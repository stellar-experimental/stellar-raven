import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ANSWER_GUIDANCE_FIELDS,
  COMPILED_GOLDEN_FIELDS,
  ROUTING_FIELDS,
  assertCompiledGoldenCase,
  compileGoldenCard,
  compileGoldenCorpus,
} from "../eval/corpus/raven-next/research/golden/_meta/compile.mjs";

const fixturePath = fileURLToPath(new URL("./fixtures/golden-compiler/full-source-card.md", import.meta.url));
const fixture = readFileSync(fixturePath, "utf8");
const sourceFile = "research/golden/fixture-category/q-fixture-full-source-card.md";

function compiledFixture() {
  return compileGoldenCard({ raw: fixture, category: "fixture-category", sourceFile });
}

describe("golden source-card compiler", () => {
  it("round-trips every compiled field and routing label from a full source card", () => {
    const compiled = compiledFixture();
    expect(Object.keys(compiled)).toEqual(COMPILED_GOLDEN_FIELDS);
    expect(Object.keys(compiled.answerGuidance)).toEqual(ANSWER_GUIDANCE_FIELDS);
    expect(Object.keys(compiled.routing)).toEqual(ROUTING_FIELDS);
    expect(compiled).toEqual({
      id: "q-fixture-full-source-card",
      question: "How does the full source-card compiler contract work?",
      category: "fixture-category",
      subcategory: "compiler-contract",
      canonicalAnswer: "The compiler preserves the complete canonical answer.\n\nIt also preserves paragraph boundaries.",
      answerGuidance: {
        mustInclude: [
          "Preserves the first required answer claim.",
          "Preserves the second required answer claim.",
        ],
        shouldInclude: ["Preserves the recommended answer claim."],
        mustAvoid: ["Do NOT drop a required routing label."],
        mustCite: ["The primary compiler source."],
        notes: "A complete compiler fixture.",
      },
      sources: ["https://example.com/primary", "https://example.com/secondary"],
      freshnessSensitive: true,
      sourceFile,
      routing: {
        expectedService: "stellar_docs",
        shouldFire: true,
        expectedCards: ["stellar_docs_mcp"],
        acceptableCards: ["scout_research", "lumenloop_search_content_semantic"],
        forbiddenCards: ["parallel_search"],
        mustNotUseTier: ["deep-research"],
      },
    });
  });

  it("rejects every missing required compiled field", () => {
    for (const field of COMPILED_GOLDEN_FIELDS) {
      const invalid = structuredClone(compiledFixture());
      delete invalid[field];
      expect(() => assertCompiledGoldenCase(invalid), field).toThrow(/invalid fields/);
    }
  });

  it("rejects every missing answer-guidance field and routing label", () => {
    for (const field of ANSWER_GUIDANCE_FIELDS) {
      const invalid = structuredClone(compiledFixture());
      delete invalid.answerGuidance[field];
      expect(() => assertCompiledGoldenCase(invalid), field).toThrow(/invalid fields/);
    }
    for (const field of ROUTING_FIELDS) {
      const invalid = structuredClone(compiledFixture());
      delete invalid.routing[field];
      expect(() => assertCompiledGoldenCase(invalid), field).toThrow(/invalid fields/);
    }
  });

  it("compiles and validates all 538 source cards", () => {
    const cases = compileGoldenCorpus();
    const artifact = JSON.parse(readFileSync(
      new URL("../eval/corpus/raven-next/research/golden/compiled/golden.json", import.meta.url),
      "utf8",
    ));
    expect(cases).toHaveLength(538);
    expect(new Set(cases.map(({ id }) => id)).size).toBe(538);
    for (const compiledCase of cases) expect(() => assertCompiledGoldenCase(compiledCase)).not.toThrow();
    expect(artifact).toEqual(cases);
  });
});
