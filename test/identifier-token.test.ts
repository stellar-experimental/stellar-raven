import { describe, expect, it } from "vitest";
import { identifierTokens, stripLeadingZeros } from "../src/policy/identifier-token.ts";

const read = (text: string) => identifierTokens(text).map((token) => `${token.letters}-${token.number}`);

describe("the identifier token rule", () => {
  it("reads letters, an optional hyphen or space, and digits, ignoring zero padding", () => {
    expect(read("SEP-0045, sep24, CAP 46 and cap-0046")).toEqual(["sep-45", "sep-24", "cap-46", "cap-46"]);
    expect(stripLeadingZeros("0045")).toBe("45");
    expect(stripLeadingZeros("0")).toBe("0");
  });

  it("treats a token followed by a dash or dot and another digit as a longer identifier", () => {
    expect(read("CVE-2024-1234 SEP-43.1 CAP-0046-01")).toEqual([]);
  });

  it("does not read a token whose letters are title case; all-upper and all-lower are identifiers", () => {
    expect(read("Sep-24 Cap-12 Sep24 Sep 24")).toEqual([]);
    expect(read("SEP-24 and sep-24 and CAP12")).toEqual(["sep-24", "sep-24", "cap-12"]);
    // Known and accepted: an all-upper month joined to a year still reads as an identifier.
    expect(read("10-SEP-2024")).toEqual(["sep-2024"]);
  });

  it("reads at most six digits", () => {
    expect(read(`SEP-${"0".repeat(200)}45`)).toEqual([]);
    expect(read(`sep${"9".repeat(50)}`)).toEqual([]);
    expect(read("SEP-1234567")).toEqual([]);
    expect(read("SEP-123456")).toEqual(["sep-123456"]);
  });
});

describe("against the matcher shipped in loop 1 (bd9719fb)", () => {
  // The regex and the mapping exactRowsOf used before the shared module existed.
  const SHIPPED_RE = /\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g;
  const shipped = (text: string) =>
    [...text.matchAll(SHIPPED_RE)].map((match) => ({
      letters: match[1]!.toLowerCase(),
      number: stripLeadingZeros(match[2]!),
      titleCase: /^[A-Z][a-z]+$/.test(match[1]!),
      digits: match[2]!.length
    }));

  const words = ["SEP", "sep", "Sep", "sEp", "CAP", "cap", "Cap", "CVE", "cve", "Protocol", "protocol", "audit", "I", "A", "Q"];
  const joiners = ["", "-", " ", "--", "_"];
  const numbers = ["0", "7", "24", "0024", "0045", "123456", "0000045", "1234567", "9".repeat(40)];
  const tails = ["", " standard", ".1", "-01", "-2024-1", " and SEP-12", ", see Sep-24", "."];
  const corpus: string[] = [];
  for (const word of words) for (const joiner of joiners) for (const number of numbers) for (const tail of tails) {
    corpus.push(`${word}${joiner}${number}${tail}`, `how does ${word}${joiner}${number}${tail} work`);
  }

  it("reads the shipped tokens, less a title-case word and a run of more than six digits", () => {
    expect(corpus.length).toBeGreaterThan(5000);
    let dropped = 0;
    for (const text of corpus) {
      const legacy = shipped(text);
      const kept = legacy.filter((token) => !token.titleCase && token.digits <= 6);
      expect(identifierTokens(text), text).toEqual(kept.map(({ letters, number }) => ({ letters, number })));
      dropped += legacy.length - kept.length;
    }
    expect(dropped).toBeGreaterThan(0);
  });
});
