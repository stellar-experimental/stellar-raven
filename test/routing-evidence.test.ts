import { describe, expect, it } from "vitest";
import {
  scoreEntryWeighted,
  tokensOverlap,
  type WeightedScorableEntry
} from "../src/catalog/scoring.ts";
import {
  ROUTING_PHRASE_TOKEN_CAP,
  extractRoutingExclusions,
  extractRoutingPhrases
} from "../src/catalog/extract-routing-phrases.ts";

describe("routing token boundaries", () => {
  it("normalizes plurals consistently", () => {
    expect(tokensOverlap("category", "categories")).toBe(true);
    expect(tokensOverlap("person", "people")).toBe(true);
  });

  it("normalizes x-plus-es plurals consistently", () => {
    expect(tokensOverlap("dex", "dexes")).toBe(true);
    expect(tokensOverlap("dexes", "dex")).toBe(true);
  });

  it("rejects unrelated short prefixes", () => {
    expect(tokensOverlap("phase", "has")).toBe(false);
    expect(tokensOverlap("use", "user")).toBe(false);
    expect(tokensOverlap("cat", "category")).toBe(false);
  });

  it("keeps bounded long morphology", () => {
    expect(tokensOverlap("region", "regional")).toBe(true);
    expect(tokensOverlap("issue", "issued")).toBe(true);
  });
});

describe("routing evidence scoring", () => {
  const operation: WeightedScorableEntry = {
    id: "scout.getBuilders",
    name: "getBuilders",
    service: "scout",
    kind: "operation",
    description: "Search the Stellar builder directory"
  };

  it("does not boost has from the unrelated schema word phase", () => {
    const exact = {
      id: "demo.has",
      name: "has",
      service: "demo",
      kind: "operation",
      description: "Report whether a value exists"
    };
    expect(scoreEntryWeighted({ ...exact, keywords: ["phase"] }, "has"))
      .toBe(scoreEntryWeighted(exact, "has"));
  });

  it("requires one coherent phrase for routing-only admission", () => {
    const query = "widgets latam hiring";
    expect(scoreEntryWeighted({
      ...operation,
      routingKeywords: ["widgets", "latam", "hiring"],
      routingPhrases: [
        { field: "useWhen", tokens: ["widgets", "recruiting"] },
        { field: "exampleQuestions", tokens: ["latam", "recruiting"] }
      ]
    }, query)).toBeNull();

    expect(scoreEntryWeighted({
      ...operation,
      routingKeywords: ["widgets", "latam", "hiring"],
      routingPhrases: [
        { field: "useWhen", tokens: ["widgets", "latam"] }
      ]
    }, query)).not.toBeNull();
  });

  it("adds only one routing delta for repeated evidence", () => {
    const query = "search stellar builders recruiting latam";
    const phrase = { field: "useWhen" as const, tokens: ["builders", "recruiting", "latam"] };
    const one = scoreEntryWeighted({
      ...operation,
      routingKeywords: ["builders", "recruiting", "latam"],
      routingPhrases: [phrase]
    }, query);
    const repeated = scoreEntryWeighted({
      ...operation,
      routingKeywords: ["builders", "recruiting", "latam", "builders"],
      routingPhrases: [phrase, phrase]
    }, query);
    expect(repeated).toBe(one);
  });
});

describe("routing phrase extraction", () => {
  it("allocates a bounded token budget across source fields", () => {
    expect(extractRoutingPhrases({
      purpose: ["alpha beta", "gamma delta", "epsilon zeta"],
      useWhen: ["yieldblox oracle"],
      exampleQuestions: ["reflector incident"]
    }, 6)).toEqual([
      { field: "purpose", tokens: ["alpha", "beta"] },
      { field: "useWhen", tokens: ["yieldblox", "oracle"] },
      { field: "exampleQuestions", tokens: ["reflector", "incident"] }
    ]);
  });

  it("keeps both source edges before middle phrases at the cap", () => {
    expect(extractRoutingPhrases({
      purpose: ["first purpose", "middle purpose", "last purpose"],
      useWhen: ["first usage"]
    }, 6)).toEqual([
      { field: "purpose", tokens: ["first", "purpose"] },
      { field: "useWhen", tokens: ["first", "usage"] },
      { field: "purpose", tokens: ["last", "purpose"] }
    ]);
  });

  it("never truncates a source phrase", () => {
    const tooLong = Array.from(
      { length: ROUTING_PHRASE_TOKEN_CAP + 1 },
      (_, index) => `token${index}`
    ).join(" ");
    expect(extractRoutingPhrases({ purpose: [tooLong] })).toEqual([]);
  });

  it("removes route targets from negative intent", () => {
    expect(extractRoutingExclusions([
      "how to issue an asset or build a tokenization contract -> stellarDocs / skills"
    ])).toEqual([{
      tokens: ["issue", "asset", "build", "tokenization", "contract"]
    }]);
  });
});
