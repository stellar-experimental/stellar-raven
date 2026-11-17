/**
 * Item 4.1: cited-fact candidates of a golden answer. The extraction, normalization and matching
 * rules are those of item 3.4's read-boundary.mjs (`answerCandidates`, `norm`, `occurrences`),
 * copied unchanged so a candidate means the same thing in both items.
 */
export const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
  july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11,
  nov: 11, december: 12, dec: 12
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const normDates = (s) =>
  s
    .replace(new RegExp(`\\b(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "g"), (_, m, d, y) => iso(y, MONTHS[m], d))
    .replace(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_RE})\\.?,?\\s+(\\d{4})\\b`, "g"), (_, d, m, y) => iso(y, MONTHS[m], d));
/** Lowercase, dates to ISO, commas removed only inside digit groups. */
export const norm = (s) => normDates(s.toLowerCase()).replace(/(?<!\d)\d{1,3}(?:,\d{3})+(?!\d)/g, (m) => m.replace(/,/g, ""));

const NUMERIC = /^\d[\d.]*$/;
/** Start offsets of `needle` in `hay`; a numeric needle matches only at digit boundaries. */
export function occurrences(hay, needle) {
  const out = [];
  if (!needle) return out;
  if (NUMERIC.test(needle)) {
    const re = new RegExp(`(?<!\\d|\\d\\.)${needle.replace(/\./g, "\\.")}(?!\\d|\\.\\d)`, "g");
    for (const m of hay.matchAll(re)) out.push(m.index);
  } else {
    let i = -1;
    while ((i = hay.indexOf(needle, i + 1)) >= 0) out.push(i);
  }
  return out;
}

// ---- candidates from the answer -------------------------------------------------------------

/** Candidate texts of the stored answer (plan step 5, answer side), keyed by normalized text. */
export function answerCandidates(answer) {
  const found = new Map();
  const add = (text, kind) => {
    const key = norm(text.trim());
    if (key && !found.has(key)) found.set(key, { text: text.trim(), kind });
  };
  for (const m of answer.matchAll(/https?:\/\/[^\s)\]>"'`]+/g)) add(m[0].replace(/[.,;:!?*]+$/, ""), "url");
  for (const m of normDates(answer.toLowerCase()).matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)) add(m[0], "date");
  for (const m of answer.matchAll(/(?<![\w.])v?\d+(?:\.\d+){2,}(?:[-+][\w.]+)?(?![\w])/g)) add(m[0].replace(/^v/, ""), "version");
  for (const m of answer.matchAll(/(?<![\w.])\d[\d,]*(?:\.\d+)?(?![\w]|\.\d)/g)) {
    const v = m[0].replace(/(?<=\d),(?=\d{3})/g, "").replace(/[,]+$/, "");
    if (v.replace(/\D/g, "").length >= 3 && !/^(199\d|20[0-3]\d)$/.test(v)) add(v, "number");
  }
  for (const m of answer.matchAll(/`([^`\n]{4,})`/g)) add(m[1], "backtick");
  for (const m of answer.matchAll(/\*\*([^*\n]{3,})\*\*/g)) add(m[1], "bold");
  for (const m of answer.matchAll(/\[([^\]\n]{3,})\]\(/g)) add(m[1], "link");
  for (const m of answer.matchAll(/\b[GCMS][A-Z2-7]{55}\b/g)) add(m[0], "strkey");
  for (const m of answer.matchAll(/\b[0-9a-fA-F]{8,}\b/g)) add(m[0], "hex");
  return found;
}

