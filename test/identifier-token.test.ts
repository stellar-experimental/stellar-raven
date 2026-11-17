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
  });

  it("does not read a token preceded by a number joined with a dash or dot: that is a date", () => {
    expect(read("10-SEP-2024 2024-SEP-10 10-SEP-24 10.SEP-2024")).toEqual([]);
    expect(read("10-SEP-2024, then SEP-10")).toEqual(["sep-10"]);
  });

  it("reads a standard that a number or a word only precedes", () => {
    expect(read("SEP-6/SEP-24")).toEqual(["sep-6", "sep-24"]);
    expect(read("SEP-6,SEP-24")).toEqual(["sep-6", "sep-24"]);
    expect(read("x-SEP-10")).toEqual(["sep-10"]);
    expect(read("CAP 46 SEP 45")).toEqual(["cap-46", "sep-45"]);
    expect(read("SEP-10 and SEP-24")).toEqual(["sep-10", "sep-24"]);
    // `see 2024` is a token of its own (a word, a space, digits); the standard after it still reads.
    expect(read("see 2024 SEP-10")).toEqual(["see-2024", "sep-10"]);
  });

  it("reads a date with no dash or dot before it (accepted false mark) and drops a token after a digit and a dash or dot (accepted missed mark)", () => {
    // Accepted false mark: the host cannot tell a date from a standard when only a space or slash
    // joins the number, and a number and a space before a standard is common in real queries.
    expect(read("SEP 10, 2024")).toEqual(["sep-10"]);
    expect(read("10 SEP 24")).toEqual(["sep-24"]);
    expect(read("10 SEP 2024")).toEqual(["sep-2024"]);
    expect(read("in SEP 2024")).toEqual(["sep-2024"]);
    expect(read("2024/SEP-10")).toEqual(["sep-10"]);
    // Accepted missed mark, never a false one: any token that directly follows a digit and `-` or
    // `.` is dropped, even when it is the only standard named.
    expect(read("CAP-46-SEP-45")).toEqual(["cap-46"]);
    expect(read("BLS12-381-CAP-59")).toEqual([]);
    expect(read("9-SEP-10")).toEqual([]);
  });

  it("reads at most six digits", () => {
    expect(read(`SEP-${"0".repeat(200)}45`)).toEqual([]);
    expect(read(`sep${"9".repeat(50)}`)).toEqual([]);
    expect(read("SEP-1234567")).toEqual([]);
    expect(read("SEP-123456")).toEqual(["sep-123456"]);
  });
});

describe("against the matcher shipped in loop 1 (bd9719fb)", () => {
  // The regex exactRowsOf used before the shared module existed; the filters are applied in the test.
  const SHIPPED_RE = /\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g;
  const TITLE_CASE = /^[A-Z][a-z]+$/;

  const words = ["SEP", "sep", "Sep", "sEp", "CAP", "cap", "Cap", "CVE", "cve", "Protocol", "protocol", "audit", "I", "A", "Q"];
  const joiners = ["", "-", " ", "--", "_"];
  const numbers = ["0", "7", "24", "0024", "0045", "123456", "0000045", "1234567", "9".repeat(40)];
  const tails = ["", " standard", ".1", "-01", "-2024-1", " and SEP-12", ", see Sep-24", "."];
  const prefixes = ["", "10-", "2024-", "1.", "10 ", "2024/", "in ", "see 2024 ", "x-", "v1.", "9-", "SEP-6 "];
  const corpus: string[] = [];
  for (const prefix of prefixes) for (const word of words) for (const joiner of joiners) for (const number of numbers) for (const tail of tails) {
    corpus.push(`${prefix}${word}${joiner}${number}${tail}`, `how does ${prefix}${word}${joiner}${number}${tail} work`);
  }

  it("reads the shipped tokens, less a title-case word, a run of more than six digits and a token after a digit and a dash or dot", () => {
    expect(corpus.length).toBeGreaterThan(50000);
    const dropped = { titleCase: 0, longDigits: 0, afterNumber: 0 };
    for (const text of corpus) {
      const kept = [];
      for (const match of text.matchAll(SHIPPED_RE)) {
        const titleCase = TITLE_CASE.test(match[1]!);
        const longDigits = match[2]!.length > 6;
        // The third class is read from the text before the match, not with the lookbehind under test.
        const afterNumber = /\d[-.]$/.test(text.slice(0, match.index));
        if (titleCase) dropped.titleCase += 1;
        if (longDigits) dropped.longDigits += 1;
        if (afterNumber) dropped.afterNumber += 1;
        if (!titleCase && !longDigits && !afterNumber) kept.push({ letters: match[1]!.toLowerCase(), number: stripLeadingZeros(match[2]!) });
      }
      expect(identifierTokens(text), text).toEqual(kept);
    }
    expect(dropped.titleCase).toBeGreaterThan(0);
    expect(dropped.longDigits).toBeGreaterThan(0);
    expect(dropped.afterNumber).toBeGreaterThan(0);
  });
});
