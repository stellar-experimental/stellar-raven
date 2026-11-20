/**
 * Identifier token rule for exact-row matching (`src/executor/providers.ts` `exactRowsOf`):
 * letters, optional hyphen or space, and 1–6 digits (e.g. `SEP-45`, `CAP-0046`, `sep24`).
 * Rejects title-case words (`Sep-24`) to avoid months/sentence-initial words, and rejects
 * tokens joined to adjacent digits by `-` or `.` (`CVE-2024-1234`, `SEP-43.1`, `10-SEP-2024`).
 * Space before a token stays allowed for queries like `Protocol 19 CAP-40`; accepted tradeoff:
 * space-separated dates (`10 SEP 24`, `SEP 10, 2024`) still match if a row's source/slug aligns.
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
