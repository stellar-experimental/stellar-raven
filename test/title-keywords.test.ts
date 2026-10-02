import { describe, expect, it } from "vitest";
import { stellarDocsTitleExtras } from "../scripts/build-catalog.mjs";

const docs = {
  id: "docs.search_guides",
  service: "docs",
  kind: "operation",
  description: "Search guides",
  transport: { algolia: { clientFilter: { prefixesAnyOf: ["https://example.org/guides/"] } } }
};
const directory = {
  id: "directory.list_widgets",
  service: "directory",
  kind: "operation",
  description: "Inspect resources and widgets",
  keywords: ["containers"],
  routingKeywords: ["packages"]
};
const skills = {
  id: "skills.widget_recipes",
  service: "skills",
  kind: "skill",
  description: "Inspect resources, widgets, containers, and packages"
};

const repeatedEntries = [
  docs, directory, { ...directory, id: "directory.get_widgets" },
  skills, { ...skills, id: "skills.widget_manual" }
];

function titleTokens(title: string, entries: Record<string, unknown>[] = repeatedEntries): string[] {
  const extras = stellarDocsTitleExtras([docs], {
    titles: [{ path: "/guides/example", title }]
  }, entries);
  return (extras.get(docs.id)?.[0] ?? "").split(" ").filter(Boolean);
}

describe("page-title keyword distinctiveness", () => {
  it("drops service names and shared prose, but keeps novel and named topics", () => {
    expect(titleTokens("Skills skill inspect resources containers packages widgets quasar"))
      .toEqual(["widgets", "quasar"]);
  });

  it("needs independent services, not many entries from one service", () => {
    const sibling = { ...directory, id: "directory.get_widgets" };
    const unrelated = { ...skills, description: "Different domain" };
    expect(titleTokens("Inspect resources", [docs, directory, sibling, unrelated]))
      .toEqual(["inspect", "resources"]);
  });

  it("keeps isolated mentions even when every service mentions a topic", () => {
    expect(titleTokens("Resources containers", [docs, directory, skills]))
      .toEqual(["resources", "containers"]);
  });

  it("rejects repeated cross-service prose with normalized title tokens", () => {
    // These tokens contain no namespace, capitalization, punctuation, or named
    // topic. A normalized but filterless extractor must fail this fixture.
    expect(titleTokens("resources containers packages")).toEqual([]);
  });

  it("preserves topics established by the owning service's descriptions", () => {
    const overview = { ...docs, id: "docs.overview", description: "Resources and containers" };
    expect(titleTokens("Resources containers packages", [...repeatedEntries, overview]))
      .toEqual(["resources", "containers"]);
  });

  it("keeps exclusions stable when an unrelated service appears", () => {
    const unrelated = { ...directory, id: "pricing.quote", service: "pricing", description: "Quote a route",
      keywords: [], routingKeywords: [] };
    expect(titleTokens("Resources containers packages", [...repeatedEntries, unrelated])).toEqual([]);
  });

  it("ignores hidden sections when counting competing vocabulary", () => {
    const hidden = { ...skills, id: "skills.widget_recipes#details", searchable: false };
    const unrelated = { ...skills, description: "Different domain" };
    expect(titleTokens("Inspect resources", [docs, directory, unrelated, hidden]))
      .toEqual(["inspect", "resources"]);
  });

  it("does not treat a single-service catalog as universal competing prose", () => {
    expect(titleTokens("Inspect quasar", [docs])).toEqual(["inspect", "quasar"]);
  });

  it("keeps URL scoping and gives unfiltered operations no title keywords", () => {
    const broad = { ...docs, id: "docs.search_everything", transport: null };
    const extras = stellarDocsTitleExtras([docs, broad], {
      titles: [
        { path: "/guides/example", title: "Quasar" },
        { path: "/elsewhere/example", title: "Nebula" }
      ]
    }, [docs, directory, skills, broad]);
    expect(extras.get(docs.id)).toEqual(["quasar"]);
    expect(extras.has(broad.id)).toBe(false);
  });

  it("assigns overlapping title paths only to their longest matching prefix", () => {
    const nested = { ...docs, id: "docs.search_nested", transport: {
      algolia: { clientFilter: { prefixesAnyOf: ["https://example.org/guides/topic/"] } }
    } };
    const extras = stellarDocsTitleExtras([docs, nested], { titles: [
      { path: "/guides/topic", title: "Quasar" },
      { path: "/guides/topic/child", title: "Nebula" },
      { path: "/guides/topic-other", title: "Pulsar" }
    ] }, [docs, nested]);
    expect(extras.get(nested.id)).toEqual(["quasar nebula"]);
    expect(extras.get(docs.id)).toEqual(["pulsar"]);
    expect(stellarDocsTitleExtras([nested, docs], { titles: [
      { path: "/guides/topic/child", title: "Nebula" }
    ] }, [docs, nested])).toEqual(new Map([[nested.id, ["nebula"]]]));
  });

  it("rejects equally specific ownership instead of choosing an operation by ID", () => {
    expect(() => stellarDocsTitleExtras([docs, { ...docs, id: "docs.other" }], {
      titles: [{ path: "/guides/child", title: "Quasar" }]
    }, [docs])).toThrow("ambiguous title prefix");
  });
});
