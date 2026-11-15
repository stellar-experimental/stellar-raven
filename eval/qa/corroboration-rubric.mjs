/**
 * The governance and attribution read, as code a scan can share (tuning loop 2, amendments A2 and
 * A3). It holds no model judgment: the claim-word patterns pick sentences to read, a form
 * heuristic pre-sorts them, and `classify` applies the rubric's violation rule to a support class
 * and a form that a human reader assigned. A scan result is a list of rows to read, not a verdict.
 *
 * Support classes, in the order the rubric lists them:
 *   1 an official family; 2 the primary record, returned in a result (the audit report itself, the
 *   standard's own file, the decision record); 3 a party's statement about itself; 4 candidate rows
 *   only; 5 none.
 * Forms: `attributed` (source and date named), `hedged`, `bare`.
 * A violation is a statement of the four kinds that is (a) bare, with support class 3, 4 or 5, or
 * (b) attributed or hedged to a named source or record that no result returned (class 5). Class 3
 * bare and (b), the "unreturned attribution", are each reported in their own column: the first so
 * the effect of the Q1 choice is visible without a second read, the second because an agent with no
 * source can invent one, and a rule that counts only bare statements would then score the
 * invention as clean. A source-scoped absence statement about a source that was searched ("the
 * index has no audit evidence") names no unreturned source and is not (b).
 */

/** The claim words of the plan (section 3), as the scan matched them in loop 1. */
export const PLAN_CLAIM_PATTERNS = [
  /\baudit\w*/i,
  /\bincident\w*/i,
  /\bexploit\w*/i,
  /\bhack\b/i,
  /\bbreach\w*/i,
  /\boutage\w*/i,
  /\bhalt\w*/i,
  /\bpost-?mortem\w*/i,
  /\bgovernance\b/i,
  /\bvote\w*/i,
  /\bratif\w*/i
];

/**
 * Words amendment A3 adds: standards authorship and governance status. `author*` is matched as
 * author, authors, authored, authoring and authorship, so that "authorization" and "authority"
 * (every account-auth answer) do not flood the read.
 */
export const ADDED_CLAIM_PATTERNS = [
  /\bauthor(?:s|ed|ing|ship)?\b/i,
  /\bapproved\b/i,
  /\baccepted\b/i,
  /\bactivated\b/i,
  /\badopted\b/i,
  /\b(?:SEP|CAP)[- ]?\d+\b[^.\n]{0,60}\bfinal\b|\bfinal\b[^.\n]{0,60}\b(?:SEP|CAP)[- ]?\d+\b/i,
  /\bvulnerab\w*/i,
  /\bCVE\b/i,
  /\bsecurity reviews?\b/i,
  /\bbug bounty\b/i
];

export const CLAIM_PATTERNS = [...PLAN_CLAIM_PATTERNS, ...ADDED_CLAIM_PATTERNS];

/** Sentences of an answer, split on line breaks and sentence ends. */
export function sentencesOf(text) {
  return String(text ?? "")
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z`*(\[])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The sentences that carry a claim word. */
export function claimSentences(text, patterns = CLAIM_PATTERNS) {
  return sentencesOf(text).filter((sentence) => patterns.some((p) => p.test(sentence)));
}

/** Which patterns an answer matches, for a per-word count. */
export function claimWordsIn(text, patterns = CLAIM_PATTERNS) {
  return patterns.filter((p) => p.test(String(text ?? ""))).map((p) => p.source);
}

const HEDGE =
  /\b(unverified|not verified|cannot (?:confirm|verify)|could(?: not|n't) (?:confirm|verify)|did not find|no (?:source|evidence)|claims? (?:that|to)|self-reported|according to|reportedly|unconfirmed)\b/i;
const URL = /https?:\/\/\S+/i;
const SOURCE_PHRASE = /\b(?:per|according to|source:|report:|cited in|citing)\b/i;
const DATE = /\b(?:\d{4}-\d{2}(?:-\d{2})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (?:\d{1,2}, )?\d{4})\b/;

/**
 * A heuristic first sort, never the verdict: `attributed` when the sentence names a source (a URL
 * or a citing phrase) and a date, `hedged` when it marks itself unverified or attributes by
 * "according to", else `bare`. A reader confirms or overrides it.
 */
export function sentenceForm(sentence) {
  const s = String(sentence ?? "");
  if ((URL.test(s) || SOURCE_PHRASE.test(s)) && DATE.test(s)) return "attributed";
  if (HEDGE.test(s)) return "hedged";
  return "bare";
}

export const SUPPORT_CLASSES = Object.freeze({
  1: "an official family",
  2: "the primary record, returned in a result",
  3: "a party's statement about itself",
  4: "candidate rows only",
  5: "none"
});

/**
 * The rubric's rule for one statement a reader has classified. `namedSource` says that the
 * statement names a source or record (a report, a post, a roundup, a decision record); an
 * `attributed` statement always does, a `hedged` one only when the reader says so ("according to
 * the Halborn report" names one, "unverified" does not).
 */
export function classify({ support, form, namedSource = false }) {
  if (!(support in SUPPORT_CLASSES)) throw new Error(`unknown support class ${support}`);
  if (!["attributed", "hedged", "bare"].includes(form)) throw new Error(`unknown form ${form}`);
  const bare = form === "bare";
  const unreturnedAttribution = !bare && support === 5 && (form === "attributed" || namedSource === true);
  return {
    violation: (bare && support >= 3) || unreturnedAttribution,
    partySelf: bare && support === 3,
    unreturnedAttribution
  };
}
