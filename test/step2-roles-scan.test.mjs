import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIMIT_AFTER,
  DEFAULT_LIMIT_BEFORE,
  exposureOf,
  operationsCalledIn,
  searchCallsOf,
  seriesIdentifiersIn,
  seriesOf
} from "../eval/qa/scan-step2-roles.mjs";
import { loadManifest } from "../src/catalog/search.ts";

const manifestJson = JSON.parse(readFileSync("catalog/manifest.json", "utf8"));
const withSource = loadManifest(manifestJson);
// The catalog before the source: no stellarOrg entry, and no edge to one.
const without = loadManifest({
  ...manifestJson,
  entries: manifestJson.entries
    .filter((entry) => entry.service !== "stellarOrg")
    .map((entry) => ({
      ...entry,
      ...(entry.retrievalProfile
        ? {
            retrievalProfile: {
              ...entry.retrievalProfile,
              recoverWith: entry.retrievalProfile.recoverWith.filter((edge) => !edge.id.startsWith("stellarOrg."))
            }
          }
        : {})
    }))
});

const search = (input) => ({ tool: "mcp__raven__search", input: JSON.stringify(input) });
const execute = (code) => ({ tool: "mcp__raven__execute", input: JSON.stringify({ code }) });

describe("series identifiers", () => {
  const series = seriesOf(withSource);
  it("come from the upstream enum, so sep and cap are there and a space does not count", () => {
    expect(series.has("sep")).toBe(true);
    expect(series.has("cap")).toBe(true);
    expect(seriesIdentifiersIn([execute('scout.searchResearch({ q: "SEP-45 contract auth" })')], series)).toEqual(["sep-45"]);
    expect(seriesIdentifiersIn([execute('docs("sep24 flow", "CAP-0046")')], series)).toEqual(["cap-0046", "sep24"]);
    // Amendment A6: a space does not fire, and a word outside the enum does not either.
    expect(seriesIdentifiersIn([execute('q("release 23", "paper 1", "incident 2023", "protocol 23")')], series)).toEqual([]);
    expect(seriesIdentifiersIn([execute("const sep = 3; const n = sep45;")], series)).toEqual([]);
  });
});

describe("transcript reads", () => {
  it("reads search arguments and skips unreadable input", () => {
    const transcript = [search({ query: "a", limit: 3 }), { tool: "mcp__raven__search", input: "not json" }, execute("1")];
    expect(searchCallsOf(transcript)).toEqual([{ query: "a", limit: 3 }]);
  });

  it("names only exposed operation ids that a script calls", () => {
    const ids = new Set(["scout.searchResearch", "stellarOrg.search_site"]);
    const transcript = [execute("await scout.searchResearch({ q }); await stellarOrg.search_site({}); await scout.nope({});")];
    expect([...operationsCalledIn(transcript, ids)].sort()).toEqual(["scout.searchResearch", "stellarOrg.search_site"]);
  });
});

describe("exposure", () => {
  it("marks a default-limit search seven-exposed and a script that names the source source-exposed", () => {
    expect(DEFAULT_LIMIT_BEFORE).toBe(5);
    expect(DEFAULT_LIMIT_AFTER).toBe(7);
    const none = exposureOf([search({ query: "soroban storage", limit: 5 })], { without, withSource });
    expect(none).toMatchObject({ sevenExposed: false, sevenUsed: false, both: false });
    const plain = exposureOf([search({ query: "soroban storage" })], { without, withSource });
    expect(plain.sevenExposed).toBe(true);
    expect(plain.sevenCalls[0].ranks6to7.length).toBeLessThanOrEqual(2);
    const named = exposureOf([search({ query: "soroban storage" }), execute("await stellarOrg.get_page({ path: '/x' })")], { without, withSource });
    expect(named).toMatchObject({ sourceExposed: true, sevenExposed: true, both: true });
  });

  it("marks a called operation at rank 6 or 7 of a default-limit page seven-used", () => {
    const page = exposureOf([search({ query: "stellar soroban contract documentation" })], { without, withSource });
    const onlySeven = page.sevenCalls[0].ranks6to7;
    expect(onlySeven).toHaveLength(2);
    const [id] = onlySeven;
    const [service, name] = id.split(".");
    const used = exposureOf(
      [search({ query: "stellar soroban contract documentation" }), execute(`await ${service}.${name}({});`)],
      { without, withSource }
    );
    // A skill hit is not a callable operation; an operation at rank 6 or 7 is.
    expect(used.sevenUsed).toBe(withSource.entries.some((e) => e.id === id && e.kind === "operation"));
  });
});
