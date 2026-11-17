/**
 * The identifier token rule for exact-row matching (src/executor/providers.ts `exactRowsOf`):
 * letters, an optional hyphen or space, then digits, as in `SEP-45`, `CAP-0046`, `sep24`, `SEP 45`.
 *
 * A token whose letters are title case (`Sep-24`, `Cap 12`) is not an identifier: it reads as a
 * month or a sentence-initial word, and would otherwise mark `sep-0024` exact for a question about
 * September. All-upper and all-lower letters are the two ways a standard's name is written. A run
 * of more than six digits is not an identifier either.
 *
 * A token joined to a number on either side by `-` or `.` is part of a longer string, not an
 * identifier: followed by one (`CVE-2024-1234`, `SEP-43.1`) or preceded by one (`10-SEP-2024`,
 * `2024-SEP-10`, `10-SEP-24`, a date). The rule is the shape, not a month list, and the host keeps
 * no list of standards.
 *
 * Still read, because no `-` or `.` joins a number to the token: `SEP 10, 2024`, `10 SEP 2024`,
 * `in SEP 2024` and `2024/SEP-10` read as `sep-10` or `sep-2024`. The rule also drops a second
 * token that follows a digit and a hyphen (`CAP-46-SEP-45` reads `cap-46` only). Both are accepted:
 * a missed exact mark, never a false one.
 */

export type IdentifierToken = {
  /** The letters, lower-cased. */
  letters: string;
  /** The digits without leading zeros: `0045` and `45` are the same number. */
  number: string;
};

const TOKEN_RE = /(?<!\d[-.])\b([A-Za-z]+)[- ]?(\d{1,6})\b(?![-.]\d)/g;
// `Sep-24`, `Cap-12`: a month or a word that starts a sentence, not an identifier.
const TITLE_CASE_RE = /^[A-Z][a-z]+$/;

/** The digits without leading zeros (`0045` is `45`, `0` stays `0`). */
export const stripLeadingZeros = (digits: string): string => digits.replace(/^0+(?=\d)/, "");

/** Identifier tokens in `text`, in order of appearance. */
export function identifierTokens(text: string): IdentifierToken[] {
  return [...text.matchAll(TOKEN_RE)]
    .filter((match) => !TITLE_CASE_RE.test(match[1]!))
    .map((match) => ({ letters: match[1]!.toLowerCase(), number: stripLeadingZeros(match[2]!) }));
}
