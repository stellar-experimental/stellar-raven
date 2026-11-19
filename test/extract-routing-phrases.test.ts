import { describe, expect, it } from "vitest";
import {
  ROUTING_PHRASE_TOKEN_CAP,
  extractRoutingExclusions,
  extractRoutingPhrases
} from "../src/catalog/extract-routing-phrases.ts";

describe("extractRoutingPhrases", () => {
  it("preserves positive source strings as separate token phrases", () => {
    expect(extractRoutingPhrases({
      purpose: ["Rank active projects"],
      useWhen: ["compare project activity"],
      exampleQuestions: ["Which projects shipped recently?"],
      keywords: ["top projects"]
    })).toEqual([
      { field: "purpose", tokens: ["rank", "active", "projects"] },
      { field: "useWhen", tokens: ["compare", "project", "activity"] },
      { field: "exampleQuestions", tokens: ["projects", "shipped", "recently"] },
      { field: "keywords", tokens: ["top", "projects"] }
    ]);
  });

  it("keeps one multiword keyword phrase but never joins separate keywords", () => {
    expect(extractRoutingPhrases({ keywords: ["top", "projects", "top projects"] })).toEqual([
      { field: "keywords", tokens: ["top", "projects"] }
    ]);
  });

  it("skips an oversized phrase and continues fairly across source fields", () => {
    expect(extractRoutingPhrases({
      purpose: ["alpha beta"],
      useWhen: ["gamma delta epsilon"],
      exampleQuestions: ["zeta eta"]
    }, 4)).toEqual([
      { field: "purpose", tokens: ["alpha", "beta"] },
      { field: "exampleQuestions", tokens: ["zeta", "eta"] }
    ]);
  });

  it("uses a bounded default and rejects non-positive caps", () => {
    const phrases = extractRoutingPhrases({
      purpose: [Array.from({ length: ROUTING_PHRASE_TOKEN_CAP + 1 }, (_, i) => `token${i}`).join(" ")]
    });
    expect(phrases).toEqual([]);
    expect(extractRoutingPhrases({ purpose: ["alpha beta"] }, 0)).toEqual([]);
  });

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

  it("removes route targets from negative intent", () => {
    expect(extractRoutingExclusions([
      "how to issue an asset or build a tokenization contract -> stellarDocs / skills"
    ])).toEqual([{
      tokens: ["issue", "asset", "build", "tokenization", "contract"]
    }]);
  });
});
