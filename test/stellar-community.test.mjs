import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { COMMUNITY_URL, communityEntries, communityIndex, compareCommunity } from "../scripts/lib/stellar-community.mjs";

const card = (title, copyValue, description = "Description.") => ({ title, copyValue, description });
const listing = (cards) => `export const ECOSYSTEM_CARDS = ${JSON.stringify(cards)} as const;`;
const sortedListing = readFileSync(new URL("./fixtures/stellar-community-sorted.ts", import.meta.url), "utf8");

describe("Community directory projection", () => {
  it("reads a sorted copy of a local literal array without executing the module", () => {
    expect(communityEntries("throw new Error('upstream executed');\n" + sortedListing)).toEqual([
      { title: "Alpha", url: "https://example.com/a" },
      { title: "Zed", url: "https://example.com/z" },
    ]);
  });

  it("follows the local binding and comparator parameters rather than fixed names", () => {
    const renamed = sortedListing.replaceAll("ECOSYSTEM_CARD_SOURCES", "cards")
      .replace('(a, b) => a.title.localeCompare(b.title', '(left, right) => left.title.localeCompare(right.title');
    expect(communityEntries(renamed)).toEqual(communityEntries(sortedListing));
  });

  it.each([
    ['.sort(', '.filter('],
    ['a.title.localeCompare(b.title, "en", { sensitivity: "base" })', 'rename(a, b)'],
    ['a.title.localeCompare(b.title, "en", { sensitivity: "base" })', '(a.title = "Renamed", 0)'],
    ['"en"', 'getLocale()'],
    ['{ sensitivity: "base" }', '{ ...options }'],
    ['[...ECOSYSTEM_CARD_SOURCES]', '[...ECOSYSTEM_CARD_SOURCES, ...extra]'],
    ['[...ECOSYSTEM_CARD_SOURCES]', 'ECOSYSTEM_CARD_SOURCES'],
    ['const ECOSYSTEM_CARD_SOURCES', 'let ECOSYSTEM_CARD_SOURCES'],
    ['[...ECOSYSTEM_CARD_SOURCES]', '[...importedCards]'],
    ['b.title', 'b.copyValue'],
    ['a.title.localeCompare(b.title', 'b.title.localeCompare(a.title'],
    ['(a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" })', 'byTitle'],
    ['a.title.localeCompare(b.title, "en", { sensitivity: "base" })', '{ return 0; }'],
    ['{ sensitivity: "base" }', '{ get sensitivity() { return "base"; } }'],
    ['].sort(', ']?.sort('],
    ['{ sensitivity: "base" }),\n);', '{ sensitivity: "base" }),\n).reverse();'],
    ['title: "Zed"', 'get title() { return "Zed"; }'],
  ])("rejects an unsupported sorted-copy expression: %s", (before, after) => {
    expect(() => communityEntries(sortedListing.replace(before, after))).toThrow(/stellar community/);
  });

  it("rejects a source array that is not a preceding literal", () => {
    const declaration = sortedListing.match(/const ECOSYSTEM_CARD_SOURCES[\s\S]*?\] as const;\n/)[0];
    expect(() => communityEntries(sortedListing.replace(declaration, "") + declaration)).toThrow(/stellar community/);
    expect(() => communityEntries(sortedListing.replace(declaration, "const ECOSYSTEM_CARD_SOURCES = load();\n")))
      .toThrow(/stellar community/);
  });

  it.each([
    'ECOSYSTEM_CARD_SOURCES[0].title = "Renamed";',
    'const alias = ECOSYSTEM_CARD_SOURCES;',
    'function later() { return ECOSYSTEM_CARD_SOURCES; }',
    'ECOSYSTEM_CARDS.push({ title: "Two", copyValue: "https://example.com/two" });',
  ])("rejects references outside the sorted-copy declarations: %s", (suffix) => {
    expect(() => communityEntries(sortedListing + suffix)).toThrow(/reference outside its declaration/);
  });

  it("ignores descriptions, other arrays, line endings, and entry order", () => {
    const text = `export const OTHER = [{ title: "Other", copyValue: "https://example.com/other" }];\n` +
      listing([card("Zed", "https://example.com/z", "Desc.\n- Plain bullet\n## Heading\n* [Fake](https://example.com/fake): Text."), card("Alpha", "https://example.com/a")]);
    const entries = communityEntries(text);
    expect(entries).toEqual([{ title: "Alpha", url: "https://example.com/a" }, { title: "Zed", url: "https://example.com/z" }]);
    expect(communityEntries(text.replace(/\n/g, "\r\n").replace(/Desc\./g, "Updated description."))).toEqual(entries);
    expect(compareCommunity(entries, [...entries].reverse())).toBe("");
  });

  it.each([
    "# Error page", "export const OTHER = [];", listing([]),
    "export const ECOSYSTEM_CARDS = getCards();",
    "export const ECOSYSTEM_CARDS = [getCard()];",
    "export const ECOSYSTEM_CARDS = [...other];",
    "export const ECOSYSTEM_CARDS = [{ ...other, title: 'One', copyValue: 'https://example.com' }];",
    "export const ECOSYSTEM_CARDS = [{ title: getTitle(), copyValue: 'https://example.com' }];",
    "export const ECOSYSTEM_CARDS = [{ title: 'One', ['copyValue']: 'https://example.com' }];",
    "export const ECOSYSTEM_CARDS = [{ title: 'One', title: 'Two', copyValue: 'https://example.com' }];",
    listing([card("One", "http://example.com")]),
    listing([card("One", "https://user:password@example.com")]),
    listing([card("One", "invalid")]), listing([card("", "https://example.com")]),
    listing([{ title: "Missing link" }]),
    listing([card("One", "https://example.com"), card("Two", "https://example.com")]),
  ])("rejects an incomplete or unsupported identity: %s", (text) => {
    expect(() => communityEntries(text)).toThrow(/stellar community/);
  });

  it.each([
    'ECOSYSTEM_CARDS.push({ title: "Two", copyValue: "https://example.com/two" });',
    'ECOSYSTEM_CARDS[0].title = "Renamed";',
    'const alias = ECOSYSTEM_CARDS; alias.push({ title: "Two", copyValue: "https://example.com/two" });',
    'function later() { return ECOSYSTEM_CARDS; }',
  ])("rejects references outside the declaration: %s", (suffix) => {
    expect(() => communityEntries(listing([card("One", "https://example.com/one")]) + suffix))
      .toThrow("ECOSYSTEM_CARDS reference outside its declaration");
  });

  it("never executes source code", () => {
    const text = "throw new Error('upstream executed');\n" + listing([card("One", "https://example.com/one")]);
    expect(communityEntries(text)).toEqual([{ title: "One", url: "https://example.com/one" }]);
  });

  it("reports additions, removals, and renames", () => {
    expect(compareCommunity([{ title: "Old", url: "https://example.com/one" }, { title: "Gone", url: "https://example.com/gone" }], [
      { title: "New", url: "https://example.com/one" }, { title: "Added", url: "https://example.com/added" }
    ])).toBe("added: https://example.com/added; removed: https://example.com/gone; renamed: https://example.com/one");
  });

  it("renders discovery links without creating served skill IDs", () => {
    const index = communityIndex({ source: COMMUNITY_URL, fetched_at: "date", entries: [{ title: "A | [B]", url: "https://example.com/one" }] }).join("\n");
    expect(index).toContain("A \\| \\[B\\]");
    expect(index).toContain("[Source](https://example.com/one)");
    expect(index).toContain("separate pin and exposure review");
    expect(index).toContain("stellar/stellar-dev-skill main source snapshot");
    expect(index).toContain("Source changes can precede deployment or never deploy.");
    expect(index).not.toContain("skills.stellar.org snapshot");
    expect(index).not.toMatch(/`skills\./);
  });

  it("escapes backslashes before table and link characters", () => {
    const index = communityIndex({ source: COMMUNITY_URL, fetched_at: "date", entries: [{ title: "A\\| B\\", url: "https://example.com/one" }] }).join("\n");
    expect(index).toContain("| A\\\\\\| B\\\\ | [Source](https://example.com/one) |");
  });
});
