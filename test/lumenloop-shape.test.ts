import { describe, expect, it } from "vitest";
import {
  LUMENLOOP_SEMANTIC_OPERATION,
  LUMENLOOP_SEMANTIC_OUTPUT_SCHEMA,
  LUMENLOOP_UNVERIFIED_OUTPUT_SCHEMA_OPERATIONS,
  lumenloopOutputSchema,
  normalizeLumenloopOutput
} from "../src/adapters/lumenloop-shape.ts";

describe("Lumenloop output-schema evidence", () => {
  const legacyResultsSchema = {
    type: "object",
    properties: { results: { type: "array" }, text: {} }
  };

  it("suppresses only the six live-disproved output schemas", () => {
    expect([...LUMENLOOP_UNVERIFIED_OUTPUT_SCHEMA_OPERATIONS].sort()).toEqual([
      "lumenloop.find_av_passages",
      "lumenloop.find_content_by_entity",
      "lumenloop.find_similar_projects_semantic",
      "lumenloop.find_similar_scf_submissions",
      "lumenloop.get_related_projects",
      "lumenloop.get_tags_vocabulary"
    ]);
    for (const operationId of LUMENLOOP_UNVERIFIED_OUTPUT_SCHEMA_OPERATIONS) {
      expect(lumenloopOutputSchema(operationId, legacyResultsSchema), operationId).toBeNull();
    }
  });

  it("keeps a verified upstream schema and the authored semantic schema", () => {
    expect(lumenloopOutputSchema("lumenloop.get_regions", legacyResultsSchema)).toBe(
      legacyResultsSchema
    );
    expect(lumenloopOutputSchema(LUMENLOOP_SEMANTIC_OPERATION, legacyResultsSchema)).toBe(
      LUMENLOOP_SEMANTIC_OUTPUT_SCHEMA
    );
  });
});

describe("Lumenloop semantic output normalization", () => {
  it("leaves every non-semantic operation untouched", () => {
    const data = { articles: [{ id: 1 }] };
    expect(normalizeLumenloopOutput("lumenloop.find_content_by_entity", data)).toBe(data);
  });

  it("leaves the canonical semantic contract unchanged when composed twice", () => {
    const canonical = {
      items: [{ id: "event", collection: "events", similarity: 0.8 }],
      counts: { events: 1 },
      meta: {}
    };
    expect(normalizeLumenloopOutput(LUMENLOOP_SEMANTIC_OPERATION, canonical)).toBe(canonical);
  });

  it("flattens every collection and ranks all rows by upstream similarity", () => {
    expect(
      normalizeLumenloopOutput(LUMENLOOP_SEMANTIC_OPERATION, {
        articles: [
          { id: "a", similarity: 0.2 },
          { id: "tie-a", similarity: 0.5 }
        ],
        events: [{ id: "best", collection: "wrong", similarity: 0.9 }],
        av: [{ id: "tie-b", similarity: 0.5 }, { id: "missing" }],
        research: [],
        query: "person name"
      })
    ).toEqual({
      items: [
        { id: "best", collection: "events", similarity: 0.9 },
        { id: "tie-a", collection: "articles", similarity: 0.5 },
        { id: "tie-b", collection: "av", similarity: 0.5 },
        { id: "a", collection: "articles", similarity: 0.2 },
        { id: "missing", collection: "av" }
      ],
      counts: { articles: 2, events: 1, av: 2, research: 0 },
      meta: { query: "person name" }
    });
  });

  it("adds provenance-labeled canonical fields across collection-specific row shapes", () => {
    expect(
      normalizeLumenloopOutput(LUMENLOOP_SEMANTIC_OPERATION, {
        articles: [
          {
            id: "article",
            title: "Protocol update",
            url: "https://example.com/article",
            publishing_date: "2026-07-01 12:00:00+00",
            domain: "example.com",
            summary: "A dated editorial summary.",
            similarity: 0.9
          }
        ],
        events: [
          {
            id: "event",
            name: "Developer meetup",
            link: "https://example.com/event",
            start_at: "2026-07-20 18:00:00+00",
            platform: "Community calendar",
            description: "An upcoming ecosystem event.",
            similarity: 0.8
          }
        ]
      })
    ).toEqual({
      items: [
        {
          id: "article",
          title: "Protocol update",
          url: "https://example.com/article",
          publishing_date: "2026-07-01 12:00:00+00",
          domain: "example.com",
          summary: "A dated editorial summary.",
          similarity: 0.9,
          date: "2026-07-01 12:00:00+00",
          dateField: "publishing_date",
          source: "example.com",
          sourceField: "domain",
          snippet: "A dated editorial summary.",
          collection: "articles"
        },
        {
          id: "event",
          name: "Developer meetup",
          link: "https://example.com/event",
          start_at: "2026-07-20 18:00:00+00",
          platform: "Community calendar",
          description: "An upcoming ecosystem event.",
          similarity: 0.8,
          title: "Developer meetup",
          url: "https://example.com/event",
          date: "2026-07-20 18:00:00+00",
          dateField: "start_at",
          source: "Community calendar",
          sourceField: "platform",
          snippet: "An upcoming ecosystem event.",
          collection: "events"
        }
      ],
      counts: { articles: 1, events: 1 },
      meta: {}
    });
  });

  it("fails closed when the authored upstream contract disappears", () => {
    expect(() => normalizeLumenloopOutput(LUMENLOOP_SEMANTIC_OPERATION, null)).toThrow(
      "non-object payload"
    );
    expect(() => normalizeLumenloopOutput(LUMENLOOP_SEMANTIC_OPERATION, { query: "x" })).toThrow(
      "no collection arrays"
    );
  });
});
