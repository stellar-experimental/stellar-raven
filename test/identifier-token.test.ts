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
