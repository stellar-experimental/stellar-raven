/**
 * Non-exposed reference scrub — ONE implementation, two consumers.
 *
 * Skill bodies come from the pinned upstream commit (see src/skills/source.ts),
 * so every served body passes through this scrub. The
 * builders (scripts/exposure.mjs re-exports this module) and the Worker read
 * path must agree byte-for-byte: what search advertises and what
 * `codemode.skill.read` returns are derived from the same scrubbed text.
 *
 * The exposed lumenloop playbooks were authored for the upstream
 * MCP-connector context and cross-link retired onboarding skills ("Connect
 * first -> ../lumenloop-mcp-connect/SKILL.md"). Through this gateway those are
 * dead pointers to skills that are never emitted, and the connector-setup
 * advice contradicts the sandbox model (no network; the caller is already
 * connected). Every such reference sits inside a markdown list item, so the
 * scrub drops the WHOLE item (bullet line + indented continuation lines) —
 * never a partial sentence.
 *
 * Scout skill bodies can also describe operations outside Raven's manifest.
 * The scrub removes a complete Markdown section, table row, or blockquote that
 * names any excluded path. In a paragraph or list item it drops a trailing `or`
 * alternative clause when every excluded path sits there; otherwise it drops
 * the sentence (paragraph) or whole item (list). The host exposure policy owns
 * the path set.
 *
 * Fail-loud drift guard: if upstream introduces a non-exposed reference
 * outside a removable Markdown block or sentence (for example, in a code
 * fence), the scrub throws instead of emitting the leak. At build time that fails the build. At read time src/skills/store.ts
 * returns an error envelope. The leak is never served.
 */
import { findExcludedScoutPath } from "../policy/scout-exposure.ts";

export type NarrowedSentence = {
  before: string;
  after: string;
};

export type ScrubOptions = {
  onNarrow?: (change: NarrowedSentence) => void;
};

/**
 * Matches any reference to a non-exposed skill in prose or a relative markdown
 * link (`../lumenloop-mcp-connect/SKILL.md`, "lumenloop-api-query"). The
 * stellar-developer-activity id is internal-guidance only; Scout upstream links
 * it as a companion skill, but ADR-0003 says non-exposed ids cannot appear in
 * emitted model-facing text.
 */
export const RETIRED_SKILL_REF_RE =
  /lumenloop-api-[a-z]+|lumenloop-mcp-connect|stellar-developer-activity/;

export function scrubRetiredSkillRefs(text: string, context: string): string {
  if (!RETIRED_SKILL_REF_RE.test(text)) return text;
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!/^\s*[-*] /.test(line)) {
      out.push(line);
      continue;
    }
    // Collect the full list item: the bullet line plus indented, non-bullet,
    // non-blank continuation lines.
    const item = [line];
    let j = i + 1;
    while (j < lines.length && /^\s+\S/.test(lines[j] ?? "") && !/^\s*[-*] /.test(lines[j] ?? "")) {
      item.push(lines[j] ?? "");
      j++;
    }
    if (!RETIRED_SKILL_REF_RE.test(item.join("\n"))) out.push(...item);
    i = j - 1;
  }
  const scrubbed = out.join("\n");
  if (RETIRED_SKILL_REF_RE.test(scrubbed)) {
    throw new Error(
      `Non-exposed skill reference survives outside a markdown list item in ${context} — ` +
        `an upstream re-sync changed the reference shape; extend scrubRetiredSkillRefs ` +
        `in src/skills/scrub.ts so the leak cannot be emitted.`
    );
  }
  return scrubbed;
}

function containsExcludedScoutPath(text: string): boolean {
  return findExcludedScoutPath(text) !== null;
}

function headingDepth(line: string): number | undefined {
  const match = /^(#{1,6})\s/.exec(line);
  return match?.[1]?.length;
}

function listItemStart(line: string): boolean {
  return /^\s*(?:[-*+] |\d+[.)] )/.test(line);
}

type Fence = { char: "`" | "~"; length: number };

function openingFence(line: string): Fence | null {
  const match = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return null;
  const marker = match[1]!;
  const char = marker[0] as "`" | "~";
  // CommonMark: backtick fence info strings cannot contain backticks, so an
  // inline code span like ```foo``` on one line does not open a fence.
  if (char === "`" && match[2]!.includes("`")) return null;
  return { char, length: marker.length };
}

function closesFence(line: string, fence: Fence): boolean {
  const match = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
  return match !== null && match[1]![0] === fence.char && match[1]!.length >= fence.length;
}

// An indented code block (four spaces or a tab) is code, not prose, so it is
// never split into sentences; a reference in it fails closed.
function paragraphLine(line: string): boolean {
  return (
    line.trim() !== "" &&
    !/^(?: {4}|\t)/.test(line) &&
    headingDepth(line) === undefined &&
    openingFence(line) === null &&
    !/^\s*[|>]/.test(line) &&
    !listItemStart(line)
  );
}

const ABBREVIATION_END_RE = /\b(?:e\.g|i\.e|etc|vs|cf)\.$/i;
const CLOSING_CHARS = new Set(["*", "_", '"', "'", ")", "]"]);
const SENTENCE_END_RE = /[.!?][*_"')\]]*\s*$/;

function endsSentence(line: string): boolean {
  return SENTENCE_END_RE.test(line) && !ABBREVIATION_END_RE.test(line.trimEnd());
}

/**
 * Split paragraph text at sentence ends: ".", "!", or "?", then any closing
 * marks (`*`, `_`, quotes, `)`, `]`), then whitespace, outside code spans and
 * open parentheses or brackets. Unbalanced backticks or parentheses keep the
 * rest of the text as one unit, so the scrub can remove too much but never
 * part of a sentence.
 */
function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  let inCode = false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "`") inCode = !inCode;
    if (inCode) continue;
    if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
    else if (char === "." || char === "!" || char === "?") {
      let end = i + 1;
      let closedDepth = depth;
      while (end < text.length && CLOSING_CHARS.has(text[end] ?? "")) {
        if (text[end] === ")" || text[end] === "]") closedDepth = Math.max(0, closedDepth - 1);
        end += 1;
      }
      if (closedDepth !== 0 || !/\s/.test(text[end] ?? "")) continue;
      const sentence = text.slice(start, end);
      if (ABBREVIATION_END_RE.test(sentence.replace(/[*_"')\]]+$/, ""))) continue;
      sentences.push(sentence.trim());
      start = end;
      depth = 0;
      i = end - 1;
    }
  }
  const rest = text.slice(start).trim();
  if (rest !== "") sentences.push(rest);
  return sentences;
}

const LIST_ITEM_MARKER_RE = /^(\s*(?:[-*+] |\d+[.)] ))(.*)$/;
const TRAILING_OR_RE = /(?:,\s*|\s+)or\s+/iy;

function stripTrailingExcludedOrClause(sentence: string): string | null {
  const terminator = /[.!?]$/.exec(sentence)?.[0] ?? "";
  const body = terminator ? sentence.slice(0, -1) : sentence;
  let inCode = false;
  let inQuote = false;
  let depth = 0;
  let lastOrStart = -1;
  let clauseBreakInTail = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i] ?? "";
    if (ch === "`") inCode = !inCode;
    if (inCode) continue;
    if (ch === '"') inQuote = !inQuote;
    if (inQuote) continue;
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") {
      if (--depth < 0) return null;
    } else if (depth === 0) {
      if (ch === "," || (/\s/.test(ch) && i > 0 && !/[\s,]/.test(body[i - 1] ?? ""))) {
        TRAILING_OR_RE.lastIndex = i;
        const match = TRAILING_OR_RE.exec(body);
        if (match) {
          lastOrStart = i;
          clauseBreakInTail = false;
          i += match[0].length - 1;
          continue;
        }
      }
      if (ch === "," || ch === ";" || ch === ":") clauseBreakInTail = true;
    }
  }

  if (inCode || inQuote || depth !== 0 || lastOrStart <= 0 || clauseBreakInTail) return null;
  const prefix = body.slice(0, lastOrStart).trimEnd();
  return prefix === "" || containsExcludedScoutPath(prefix) ? null : prefix + terminator;
}

function narrowListItem(item: string[], narrowedOut: NarrowedSentence[]): string[] | null {
  const match = LIST_ITEM_MARKER_RE.exec(item[0] ?? "");
  if (!match || item.slice(1).some((part) => /^\s*[|>]/.test(part))) return null;
  const joined = [match[2]!, ...item.slice(1)].map((part) => part.trim()).filter(Boolean).join(" ");
  const itemNarrowed: NarrowedSentence[] = [];
  const kept = splitSentences(joined).map((sentence) => {
    if (!containsExcludedScoutPath(sentence)) return sentence;
    const narrowed = stripTrailingExcludedOrClause(sentence);
    if (narrowed !== null) itemNarrowed.push({ before: sentence, after: narrowed });
    return narrowed;
  });
  if (kept.length === 0 || !kept.every((sentence): sentence is string => sentence !== null)) {
    return null;
  }
  narrowedOut.push(...itemNarrowed);
  return [match[1]! + kept.join(" ")];
}

/**
 * Remove complete Markdown blocks that advertise excluded Scout paths, and
 * narrow or drop affected sentences in plain paragraphs and list items. A
 * block that names no excluded path keeps its exact bytes. Any reference that
 * does not fit one of these units stops the build or read.
 */
export function scrubExcludedScoutOperationRefs(
  text: string,
  context: string,
  options?: ScrubOptions
): string {
  const lines = text.split("\n");
  const withoutSections: string[] = [];

  let headingFence: Fence | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (headingFence) {
      withoutSections.push(line);
      if (closesFence(line, headingFence)) headingFence = null;
      continue;
    }
    const opened = openingFence(line);
    if (opened) {
      headingFence = opened;
      withoutSections.push(line);
      continue;
    }
    const depth = headingDepth(line);
    if (depth === undefined || !containsExcludedScoutPath(line)) {
      withoutSections.push(line);
      continue;
    }

    let skippedFence: Fence | null = null;
    i += 1;
    while (i < lines.length) {
      const nextLine = lines[i] ?? "";
      if (skippedFence) {
        if (closesFence(nextLine, skippedFence)) skippedFence = null;
        i += 1;
        continue;
      }
      const nextOpened = openingFence(nextLine);
      if (nextOpened) {
        skippedFence = nextOpened;
        i += 1;
        continue;
      }
      const nextDepth = headingDepth(nextLine);
      if (nextDepth !== undefined && nextDepth <= depth) {
        i -= 1;
        break;
      }
      i += 1;
    }
  }

  const out: string[] = [];
  const narrowedSentences: NarrowedSentence[] = [];
  let activeFence: Fence | null = null;
  for (let i = 0; i < withoutSections.length; i++) {
    const line = withoutSections[i] ?? "";
    // Fenced lines bypass every removal, so a reference in a fence fails closed.
    if (activeFence) {
      out.push(line);
      if (closesFence(line, activeFence)) activeFence = null;
      continue;
    }
    const opened = openingFence(line);
    if (opened) {
      activeFence = opened;
      out.push(line);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && containsExcludedScoutPath(line)) continue;

    if (/^\s*>/.test(line)) {
      const quote = [line];
      let j = i + 1;
      while (j < withoutSections.length && /^\s*>/.test(withoutSections[j] ?? "")) {
        quote.push(withoutSections[j] ?? "");
        j += 1;
      }
      if (!containsExcludedScoutPath(quote.join("\n"))) out.push(...quote);
      i = j - 1;
      continue;
    }

    if (!listItemStart(line)) {
      if (!paragraphLine(line)) {
        out.push(line);
        continue;
      }
      const paragraph = [line];
      let j = i + 1;
      while (j < withoutSections.length && paragraphLine(withoutSections[j] ?? "")) {
        paragraph.push(withoutSections[j] ?? "");
        j += 1;
      }
      i = j - 1;
      if (!containsExcludedScoutPath(paragraph.join("\n"))) {
        out.push(...paragraph);
        continue;
      }
      // Keep the source line breaks when each line ends a sentence; otherwise
      // a sentence can wrap across lines, so split the joined paragraph.
      const units = paragraph.every(endsSentence)
        ? paragraph
        : [paragraph.map((part) => part.trim()).join(" ")];
      const keptLines = units.flatMap((unit) => {
        if (!containsExcludedScoutPath(unit)) return [unit];
        const indent = /^\s*/.exec(unit)?.[0] ?? "";
        const kept = splitSentences(unit).flatMap((sentence) => {
          if (!containsExcludedScoutPath(sentence)) return [sentence];
          const narrowed = stripTrailingExcludedOrClause(sentence);
          if (narrowed !== null) narrowedSentences.push({ before: sentence, after: narrowed });
          return narrowed === null ? [] : [narrowed];
        });
        return kept.length > 0 ? [indent + kept.join(" ")] : [];
      });
      out.push(...keptLines);
      // A fully removed paragraph also drops one blank line, so no double gap remains.
      if (keptLines.length === 0 && (withoutSections[j] ?? "").trim() === "" && (out.at(-1) ?? "").trim() === "") i = j;
      continue;
    }

    const item = [line];
    let j = i + 1;
    while (
      j < withoutSections.length &&
      /^\s+\S/.test(withoutSections[j] ?? "") &&
      !listItemStart(withoutSections[j] ?? "") &&
      openingFence(withoutSections[j] ?? "") === null
    ) {
      item.push(withoutSections[j] ?? "");
      j += 1;
    }
    if (!containsExcludedScoutPath(item.join("\n"))) {
      out.push(...item);
    } else {
      const narrowed = narrowListItem(item, narrowedSentences);
      if (narrowed !== null) out.push(...narrowed);
    }
    i = j - 1;
  }

  const scrubbed = out.join("\n");
  if (containsExcludedScoutPath(scrubbed)) {
    throw new Error(
      `Non-exposed Scout operation reference survives outside a removable Markdown block or sentence in ${context} — ` +
        `an upstream re-sync changed the reference shape; update the structural scrub in ` +
        `src/skills/scrub.ts so the reference cannot be emitted.`
    );
  }
  if (options?.onNarrow) {
    for (const change of narrowedSentences) options.onNarrow(change);
  }
  return scrubbed;
}

/** Apply every model-facing skill-body exposure filter. */
export function scrubNonExposedRefs(text: string, context: string, options?: ScrubOptions): string {
  return scrubExcludedScoutOperationRefs(scrubRetiredSkillRefs(text, context), context, options);
}
