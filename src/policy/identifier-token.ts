/**
 * The identifier token rule, in one place: letters, then digits, as in `SEP-45`, `CAP-0046`,
 * `sep24`. Two hosts read it. Arm 2 (src/executor/providers.ts `exactRowsOf`) reads a query and
 * accepts a space between the letters and the digits ("SEP 45"), because a person types a query.
 * The pointer before a research call (src/executor/run.ts) reads the string arguments of every
 * call and accepts only a hyphenated or joined token, because `audit 2024`, `release 23`,
 * `incident 2023` and `paper 1` are phrases, not identifiers (amendment A6).
 *
 * A token whose letters are title case (`Sep-24`, `Cap 12`) is not an identifier: it reads as a
 * month or a sentence-initial word. Both hosts share this rule. A token of more than six digits in
 * the joined form is not one either.
 *
 * A token followed by `-` or `.` and another digit (`CVE-2024-1234`, `SEP-43.1`) is a longer
 * identifier, not a prefix match. The host keeps no list of standards: the letters are compared
 * with the series an operation declares (src/catalog/document-series.ts).
 */

export type IdentifierToken = {
  /** The token as written. */
  text: string;
  /** The letters, lower-cased. */
  letters: string;
  /** The digits without leading zeros: `0045` and `45` are the same number. */
  number: string;
};

const SPACED_TOKEN_RE = /\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g;
// At most six digits: a longer run is not an identifier, and the pointer echoes the token twice.
const JOINED_TOKEN_RE = /\b([A-Za-z]+)-?(\d{1,6})\b(?![-.]\d)/g;
// `Sep-24`, `Cap-12`: a month or a word that starts a sentence, not an identifier. All-upper and
// all-lower letters are the two ways a standard's name is written.
const TITLE_CASE_RE = /^[A-Z][a-z]+$/;

const stripLeadingZeros = (digits: string): string => digits.replace(/^0+(?=\d)/, "");

/** Identifier tokens in `text`, in order of appearance. `joinedOnly` refuses the spaced form. */
export function identifierTokens(text: string, { joinedOnly }: { joinedOnly: boolean }): IdentifierToken[] {
  const pattern = joinedOnly ? JOINED_TOKEN_RE : SPACED_TOKEN_RE;
  return [...text.matchAll(pattern)]
    .filter((match) => !TITLE_CASE_RE.test(match[1]!))
    .map((match) => ({
      text: match[0],
      letters: match[1]!.toLowerCase(),
      number: stripLeadingZeros(match[2]!)
    }));
}

/** The identity of a token, for comparing two tokens: `sep-45` for `SEP-0045` and `sep45`. */
export const identifierKey = (token: Pick<IdentifierToken, "letters" | "number">): string =>
  `${token.letters}-${token.number}`;

const MAX_STRINGS = 64;
const MAX_DEPTH = 4;

/**
 * The joined identifier tokens in the string values of a call's arguments, whose letters are in
 * `series`, in order, one per identity. Arrays and objects are walked to a fixed depth and a fixed
 * number of strings. Keys are not read: only values the model wrote as data.
 */
export function identifiersInArguments(args: unknown, series: ReadonlySet<string>): IdentifierToken[] {
  const found = new Map<string, IdentifierToken>();
  let seen = 0;
  const walk = (value: unknown, depth: number): void => {
    if (seen >= MAX_STRINGS || depth > MAX_DEPTH) return;
    if (typeof value === "string") {
      seen += 1;
      for (const token of identifierTokens(value, { joinedOnly: true })) {
        if (series.has(token.letters) && !found.has(identifierKey(token))) found.set(identifierKey(token), token);
      }
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
    } else if (value !== null && typeof value === "object") {
      for (const item of Object.values(value)) walk(item, depth + 1);
    }
  };
  walk(args, 0);
  return [...found.values()];
}
