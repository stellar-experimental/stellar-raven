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
 * names any excluded path. In a plain paragraph or list item, a sentence that
 * names an excluded path only in a trailing `or` alternative clause drops that
 * clause and keeps the rest of the sentence; otherwise a paragraph drops the
 * complete sentence and a list item drops the whole item. The host exposure
 * policy owns the path set.
 *
 * Fail-loud drift guard: if upstream introduces a non-exposed reference
 * outside a removable Markdown block, sentence, or alternative clause (for
 * example, in a code fence), the scrub throws instead of emitting the leak. At
 * build time that fails the build. At read time src/skills/store.ts returns an
 * error envelope. The leak is never served.
 */
import { EXCLUDED_SCOUT_PATHS } from "../policy/scout-exposure.ts";

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

// A templated segment such as `{id}` matches any concrete value as well as
// the literal template, so `/api/x/{id}` also covers `/api/x/123`.
function excludedPathPattern(path: string): RegExp {
  const source = path
    .split(/(\{[^}/]+\})/)
    .map((part) =>
      /^\{[^}/]+\}$/.test(part) ? "[^\\s/`)\\]]+" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("");
  return new RegExp(`${source}(?![\\w/-])`);
}

const excludedScoutPathPatterns = [...EXCLUDED_SCOUT_PATHS].map(excludedPathPattern);

function decodePercentRuns(text: string): string {
  return text.replace(/(?:%[0-9a-f]{2})+/gi, (encoded) => {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  });
}

function containsExcludedScoutPath(text: string): boolean {
  const decoded = decodePercentRuns(text);
  return excludedScoutPathPatterns.some((pattern) => pattern.test(text) || pattern.test(decoded));
}

function headingDepth(line: string): number | undefined {
  const match = /^(#{1,6})\s/.exec(line);
  return match?.[1]?.length;
}

function listItemStart(line: string): boolean {
  return /^\s*(?:[-*+] |\d+[.)] )/.test(line);
}

function fenceLine(line: string): boolean {
  return /^\s*(?:```|~~~)/.test(line);
}

// An indented code block (four spaces or a tab) is code, not prose, so it is
// never split into sentences; a reference in it fails closed.
function paragraphLine(line: string): boolean {
  return (
    line.trim() !== "" &&
    !/^(?: {4}|\t)/.test(line) &&
    headingDepth(line) === undefined &&
    !fenceLine(line) &&
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
const ENDPOINT_REF_RE =
  /(\*{1,2})?(?:(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+)?(?:`(?:(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+)?(?:https?:\/\/[^\s`]+)?\/api\/[^`]*`|(?:https?:\/\/[^\s`)\]'’"”]+)?\/api\/[^\s`)\]'’"”]+)\1/i;
const ALT_LEAD_IN_RE =
  /^(?:call|use|try|query|hit|run|send|post|see|check|ask|fetch|read|via|with)(?:\s+(?:to|the))?$/i;
const ALT_MODIFIER_RE = /^(?:with|for|to|in|on|by|via|from|using|passing)\b/i;
const TAIL_CLAUSE_WORD_RE =
  /\b(?:and|but|then|which|that|if|when|while|unless|although|though|because|since|before|after|until|once|whenever|wherever|both|is|are|was|were|has|have|had|can|could|will|would|should|must|may|might|does|did|returns|yields|gives|produces|takes|accepts|requires|works|fails)\b/i;
const SUBORDINATOR_WORD_RE =
  /\b(?:if|when|while|unless|although|though|because|since|before|after|until|once|whenever|wherever)\b/gi;
const GERUND_START_RE = /^[a-z]+ing\b/i;
const DANGLING_END_WORD_RE =
  /\b(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|a|an|the|to|for|with|from|via|in|on|at|by|of|as|and|or|nor|but|than)$/i;
const CORRELATIVE_PAIRS: ReadonlyArray<[RegExp, RegExp]> = [
  [/\beither\b/gi, /\bor\b/i],
  [/\bwhether\b/gi, /\bor\b/i],
  [/\bneither\b/gi, /\bnor\b/i],
  [/\bbetween\b/gi, /\band\b/i],
  [/\bnot\s+only\b/gi, /\bbut\b/i],
  [/\bone\s+of\b/gi, /\b(?:and|or)\b/i]
];
const MAX_NARROW_SENTENCE_CHARS = 2000;
const MAX_NARROW_OR_SPLITS = 16;

function leadingIndent(line: string): number {
  let n = 0;
  while (n < line.length && (line[n] === " " || line[n] === "\t")) n += 1;
  return n;
}

function fenceMarker(line: string): string | undefined {
  const match = /^\s*(`{3,}|~{3,})/.exec(line);
  return match?.[1];
}

function hasBalancedMarkdownEmphasis(text: string): boolean {
  const prose = text.replace(/`[^`]*`/g, "");
  if (prose.includes("`")) return false;
  if ((prose.match(/\*\*/g)?.length ?? 0) % 2 !== 0) return false;
  const noBold = prose.replace(/\*\*/g, "");
  return (noBold.match(/\*/g)?.length ?? 0) % 2 === 0;
}

function hasUnclosedSingleQuote(text: string): boolean {
  const prose = text.replace(/`[^`]*`/g, " ");
  let open = false;
  for (let i = 0; i < prose.length; i++) {
    const ch = prose[i] ?? "";
    const prev = i > 0 ? (prose[i - 1] ?? "") : "";
    if (!open) {
      if (ch === "‘" || (ch === "'" && (i === 0 || /[\s(["“]/.test(prev)))) {
        open = true;
      }
    } else if (ch === "’" || (ch === "'" && !/[a-z]/i.test(prose[i + 1] ?? ""))) {
      open = false;
    }
  }
  return open;
}

function scanTopLevel(text: string): {
  balanced: boolean;
  topLevel: string;
  hasClauseBreak: boolean;
  lastClauseCut: number;
  lastTopLevelComma: number;
} {
  let inCode = false;
  let inDoubleQuote = false;
  let curlyQuoteDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let topLevel = "";
  let hasClauseBreak = false;
  let lastClauseCut = -1;
  let lastTopLevelComma = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    if (ch === "`") {
      inCode = !inCode;
      if (!inCode && !inDoubleQuote && curlyQuoteDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
        topLevel += " ";
      }
      continue;
    }
    if (inCode) continue;
    if (ch === '"') {
      inDoubleQuote = !inDoubleQuote;
      if (!inDoubleQuote && curlyQuoteDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
        topLevel += " ";
      }
      continue;
    }
    if (inDoubleQuote) continue;
    if (ch === "“") {
      curlyQuoteDepth += 1;
      continue;
    }
    if (ch === "”") {
      curlyQuoteDepth -= 1;
      if (curlyQuoteDepth < 0) {
        return { balanced: false, topLevel, hasClauseBreak, lastClauseCut, lastTopLevelComma };
      }
      if (curlyQuoteDepth === 0 && parenDepth === 0 && bracketDepth === 0) topLevel += " ";
      continue;
    }
    if (curlyQuoteDepth > 0) continue;
    if (ch === "(") {
      parenDepth += 1;
      continue;
    }
    if (ch === ")") {
      parenDepth -= 1;
      if (parenDepth < 0) {
        return { balanced: false, topLevel, hasClauseBreak, lastClauseCut, lastTopLevelComma };
      }
      if (parenDepth === 0 && bracketDepth === 0) topLevel += " ";
      continue;
    }
    if (ch === "[") {
      bracketDepth += 1;
      continue;
    }
    if (ch === "]") {
      bracketDepth -= 1;
      if (bracketDepth < 0) {
        return { balanced: false, topLevel, hasClauseBreak, lastClauseCut, lastTopLevelComma };
      }
      if (parenDepth === 0 && bracketDepth === 0) topLevel += " ";
      continue;
    }
    if (parenDepth === 0 && bracketDepth === 0) {
      topLevel += ch;
      if (ch === ",") {
        hasClauseBreak = true;
        lastTopLevelComma = i;
      } else if (ch === ";" || ch === ":") {
        hasClauseBreak = true;
        lastClauseCut = i;
      } else if (ch === "—" || ch === "–") {
        hasClauseBreak = true;
      } else if (ch === "-" && text[i - 1] === " " && text[i + 1] === " ") {
        hasClauseBreak = true;
      }
    }
  }

  const balanced =
    !inCode &&
    !inDoubleQuote &&
    curlyQuoteDepth === 0 &&
    parenDepth === 0 &&
    bracketDepth === 0 &&
    hasBalancedMarkdownEmphasis(text) &&
    !hasUnclosedSingleQuote(text);
  return { balanced, topLevel, hasClauseBreak, lastClauseCut, lastTopLevelComma };
}

function isSingleParenthetical(text: string): boolean {
  if (!text.startsWith("(") || !text.endsWith(")")) return false;
  let inCode = false;
  let inDoubleQuote = false;
  let curlyQuoteDepth = 0;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    if (ch === "`") {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (ch === '"') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inDoubleQuote) continue;
    if (ch === "“") {
      curlyQuoteDepth += 1;
      continue;
    }
    if (ch === "”") {
      curlyQuoteDepth -= 1;
      if (curlyQuoteDepth < 0) return false;
      continue;
    }
    if (curlyQuoteDepth > 0) continue;
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth < 0) return false;
      if (depth === 0 && i < text.length - 1) return false;
    }
  }
  return !inCode && !inDoubleQuote && curlyQuoteDepth === 0 && depth === 0;
}

function hasUnpairedCorrelative(clause: string): boolean {
  for (const [opener, partner] of CORRELATIVE_PAIRS) {
    let lastMatchEnd = -1;
    for (const match of clause.matchAll(opener)) {
      lastMatchEnd = match.index + match[0].length;
    }
    if (lastMatchEnd !== -1 && !partner.test(clause.slice(lastMatchEnd))) {
      return true;
    }
  }
  return false;
}

const COMMA_OR_RE = /,\s*or\s+/iy;
const SPACE_OR_RE = /\s+or\s+/iy;

function topLevelOrSplits(text: string): Array<{ start: number; end: number; hasComma: boolean }> {
  const splits: Array<{ start: number; end: number; hasComma: boolean }> = [];
  let inCode = false;
  let inDoubleQuote = false;
  let curlyQuoteDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    if (ch === "`") {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (ch === '"') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inDoubleQuote) continue;
    if (ch === "“") {
      curlyQuoteDepth += 1;
      continue;
    }
    if (ch === "”") {
      curlyQuoteDepth = Math.max(0, curlyQuoteDepth - 1);
      continue;
    }
    if (curlyQuoteDepth > 0) continue;
    if (ch === "(") {
      parenDepth += 1;
      continue;
    }
    if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (ch === "[") {
      bracketDepth += 1;
      continue;
    }
    if (ch === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (parenDepth !== 0 || bracketDepth !== 0) continue;

    if (ch === ",") {
      COMMA_OR_RE.lastIndex = i;
      const match = COMMA_OR_RE.exec(text);
      if (match) splits.push({ start: i, end: i + match[0].length, hasComma: true });
    } else if (/\s/.test(ch) && i > 0 && !/[\s,]/.test(text[i - 1] ?? "")) {
      SPACE_OR_RE.lastIndex = i;
      const match = SPACE_OR_RE.exec(text);
      if (match) splits.push({ start: i, end: i + match[0].length, hasComma: false });
    }
  }
  return splits;
}

function isValidNarrowedPrefix(
  prefix: string,
  opts: { connectorHasComma: boolean; tailHasModifier: boolean }
): boolean {
  const visibleEnd = prefix.replace(/\*+$/, "");
  if (
    visibleEnd === "" ||
    /[;,:\(\[\/—–-]$/.test(visibleEnd) ||
    DANGLING_END_WORD_RE.test(visibleEnd)
  ) {
    return false;
  }
  const scan = scanTopLevel(prefix);
  if (!scan.balanced) return false;
  const cut = Math.max(scan.topLevel.lastIndexOf(";"), scan.topLevel.lastIndexOf(":"));
  const activeClause = scan.topLevel.slice(cut + 1).trim();
  if (hasUnpairedCorrelative(activeClause)) return false;

  const clauseStart = activeClause.replace(/^\*+\s*/, "");
  if (GERUND_START_RE.test(clauseStart) && !activeClause.includes(",")) {
    return false;
  }
  if (/^both\b/i.test(clauseStart) && !/\band\b/i.test(activeClause)) {
    return false;
  }
  const rawActiveClause = prefix.slice(scan.lastClauseCut + 1);
  if (
    /\bboth\s+(?:of\s+)?(?:`?\/api\/|\*+`?\/api\/)/i.test(rawActiveClause) &&
    !/\band\b/i.test(activeClause)
  ) {
    return false;
  }

  let lastSubEnd = -1;
  for (const match of activeClause.matchAll(SUBORDINATOR_WORD_RE)) {
    lastSubEnd = match.index + match[0].length;
  }
  if (lastSubEnd !== -1 && !activeClause.slice(lastSubEnd).includes(",")) {
    return false;
  }

  // A bare code-span subject (`\`/api/x\` or \`/api/y\` with ... <verb>`) can
  // precede a shared predicate in the tail when there is no comma before `or`.
  if (activeClause === "" && !opts.connectorHasComma && opts.tailHasModifier) {
    return false;
  }

  // Dropping `, or <excluded>` from a 3+ item serial endpoint list
  // (`Use /api/a, /api/b, or /api/c.`) would leave a comma-spliced pair.
  if (opts.connectorHasComma && scan.lastTopLevelComma > scan.lastClauseCut) {
    const beforeComma = prefix.slice(scan.lastClauseCut + 1, scan.lastTopLevelComma);
    const afterComma = prefix.slice(scan.lastTopLevelComma + 1);
    const afterCommaTop = scanTopLevel(afterComma).topLevel;
    if (
      ENDPOINT_REF_RE.test(beforeComma) &&
      ENDPOINT_REF_RE.test(afterComma) &&
      !/\b(?:and|or)\b/i.test(afterCommaTop)
    ) {
      return false;
    }
  }

  return true;
}

function parseExcludedAlternativeTail(tail: string): { hasModifier: boolean } | null {
  if (!containsExcludedScoutPath(tail) || /['’]$/.test(tail)) return null;
  const scan = scanTopLevel(tail);
  if (!scan.balanced || scan.hasClauseBreak) return null;
  const refMatch = ENDPOINT_REF_RE.exec(tail);
  if (!refMatch) return null;
  const endpoint = refMatch[0];
  if (!containsExcludedScoutPath(endpoint)) return null;
  const before = tail.slice(0, refMatch.index).trim();
  if (before !== "" && !ALT_LEAD_IN_RE.test(before)) return null;
  const after = tail.slice(refMatch.index + endpoint.length).trim();
  if (after === "") return { hasModifier: false };
  if (/\/api\//i.test(decodePercentRuns(after))) return null;
  if (isSingleParenthetical(after)) return { hasModifier: true };
  if (!ALT_MODIFIER_RE.test(after)) return null;
  const afterTop = scanTopLevel(after).topLevel;
  if (TAIL_CLAUSE_WORD_RE.test(afterTop)) return null;
  return { hasModifier: true };
}

/**
 * Strip one or more trailing top-level `or` alternative clauses that offer an
 * excluded Scout endpoint (e.g. `, or \`POST /api/partners/match\` with ...`)
 * when the remaining prefix stands as a complete, balanced sentence. Returns
 * `null` whenever narrowing would risk a fragment, exceed the scan cap, or
 * leave an excluded path.
 */
function stripExcludedAlternativeClause(sentence: string): string | null {
  if (sentence.length > MAX_NARROW_SENTENCE_CHARS) return null;
  const terminatorMatch = /([.!?])$/.exec(sentence);
  let body = terminatorMatch ? sentence.slice(0, -1) : sentence;
  const terminator = terminatorMatch?.[1] ?? "";

  while (containsExcludedScoutPath(body)) {
    const splits = topLevelOrSplits(body);
    if (splits.length > MAX_NARROW_OR_SPLITS) return null;
    let peeled = false;
    for (let k = splits.length - 1; k >= 0; k--) {
      const split = splits[k]!;
      const prefix = body.slice(0, split.start).trimEnd();
      const tail = body.slice(split.end).trimStart();
      const parsedTail = parseExcludedAlternativeTail(tail);
      if (parsedTail === null) continue;
      if (
        !isValidNarrowedPrefix(prefix, {
          connectorHasComma: split.hasComma,
          tailHasModifier: parsedTail.hasModifier
        })
      ) {
        continue;
      }
      body = prefix;
      peeled = true;
      break;
    }
    if (!peeled) return null;
  }

  return body + terminator;
}

function narrowAllSentences(text: string): string | null {
  const kept: string[] = [];
  for (const sentence of splitSentences(text)) {
    if (!containsExcludedScoutPath(sentence)) {
      kept.push(sentence);
      continue;
    }
    const narrowed = stripExcludedAlternativeClause(sentence);
    if (narrowed === null) return null;
    kept.push(narrowed);
  }
  return kept.length > 0 ? kept.join(" ") : null;
}

/**
 * Narrow a list item when every excluded-path reference in it sits inside a
 * removable trailing `or` alternative clause (a wrapped narrowed item is
 * re-flowed onto one line). If any sentence in the item is about an excluded
 * operation as a whole, return `null` so the caller drops the complete list
 * item rather than leaving orphan continuation text.
 */
function narrowListItem(item: string[]): string[] | null {
  const match = LIST_ITEM_MARKER_RE.exec(item[0] ?? "");
  if (!match) return null;
  const marker = match[1]!;
  const firstBody = match[2]!;
  const continuations = item.slice(1);
  if (continuations.some((part) => /^\s*[|>]/.test(part))) return null;

  const bodyLines = [firstBody, ...continuations];
  if (bodyLines.every(endsSentence)) {
    const keptLines: string[] = [];
    for (let k = 0; k < bodyLines.length; k++) {
      const rawLine = bodyLines[k]!;
      const prefix = k === 0 ? marker : (/^\s*/.exec(rawLine)?.[0] ?? "");
      const content = k === 0 ? rawLine : rawLine.slice(prefix.length);
      if (!containsExcludedScoutPath(content)) {
        keptLines.push(prefix + content);
        continue;
      }
      const narrowed = narrowAllSentences(content);
      if (narrowed === null) return null;
      keptLines.push(prefix + narrowed);
    }
    return keptLines;
  }

  const joined = bodyLines
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join(" ");
  const narrowed = narrowAllSentences(joined);
  return narrowed !== null ? [marker + narrowed] : null;
}

/**
 * Remove complete Markdown blocks that advertise excluded Scout paths, and
 * narrow or drop affected sentences in plain paragraphs and list items. A
 * trailing `or` alternative clause that names an excluded endpoint is removed
 * when the remaining sentence stands on its own; otherwise a paragraph drops
 * that sentence and a list item drops the whole item. Blocks that name no
 * excluded path keep their exact bytes. Any reference that does not fit one of
 * these units stops the build or read.
 */
export function scrubExcludedScoutOperationRefs(text: string, context: string): string {
  const lines = text.split("\n");
  const withoutSections: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const depth = headingDepth(line);
    if (depth === undefined || !containsExcludedScoutPath(line)) {
      withoutSections.push(line);
      continue;
    }

    i += 1;
    while (i < lines.length) {
      const nextDepth = headingDepth(lines[i] ?? "");
      if (nextDepth !== undefined && nextDepth <= depth) {
        i -= 1;
        break;
      }
      i += 1;
    }
  }

  const out: string[] = [];
  let inFence = false;
  for (let i = 0; i < withoutSections.length; i++) {
    const line = withoutSections[i] ?? "";
    // Fenced lines bypass every removal, so a reference in a fence fails closed.
    if (fenceLine(line)) inFence = !inFence;
    if (inFence || fenceLine(line)) {
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
        const kept: string[] = [];
        for (const sentence of splitSentences(unit)) {
          if (!containsExcludedScoutPath(sentence)) {
            kept.push(sentence);
            continue;
          }
          const narrowed = stripExcludedAlternativeClause(sentence);
          if (narrowed !== null) kept.push(narrowed);
        }
        return kept.length > 0 ? [indent + kept.join(" ")] : [];
      });
      out.push(...keptLines);
      // A fully removed paragraph also drops one blank line, so no double gap remains.
      if (keptLines.length === 0 && (withoutSections[j] ?? "").trim() === "" && (out.at(-1) ?? "").trim() === "") i = j;
      continue;
    }

    const itemIndent = leadingIndent(line);
    const item = [line];
    let j = i + 1;
    while (
      j < withoutSections.length &&
      /^\s+\S/.test(withoutSections[j] ?? "") &&
      !listItemStart(withoutSections[j] ?? "") &&
      !fenceLine(withoutSections[j] ?? "")
    ) {
      item.push(withoutSections[j] ?? "");
      j += 1;
    }
    if (!containsExcludedScoutPath(item.join("\n"))) {
      out.push(...item);
      i = j - 1;
      continue;
    }
    const narrowed = narrowListItem(item);
    if (narrowed !== null) {
      out.push(...narrowed);
      i = j - 1;
      continue;
    }

    // The list item is dropped. Drop its indented fenced blocks and trailing
    // continuations together so they do not orphan onto the previous item,
    // unless a child fence contains an excluded path (which must fail closed).
    let tailEnd = j;
    let tailComplete = true;
    let fenceHasExcluded = false;
    while (tailEnd < withoutSections.length) {
      const next = withoutSections[tailEnd] ?? "";
      if (!/^\s+\S/.test(next) || leadingIndent(next) <= itemIndent || listItemStart(next)) {
        break;
      }
      const openMarker = fenceMarker(next);
      if (openMarker !== undefined) {
        if (containsExcludedScoutPath(next)) fenceHasExcluded = true;
        const closeRe = new RegExp(`^\\s*${openMarker[0]}{${openMarker.length},}\\s*$`);
        let k = tailEnd + 1;
        let closed = false;
        while (k < withoutSections.length) {
          const fenceBodyLine = withoutSections[k] ?? "";
          if (closeRe.test(fenceBodyLine)) {
            closed = true;
            k += 1;
            break;
          }
          if (containsExcludedScoutPath(fenceBodyLine)) fenceHasExcluded = true;
          k += 1;
        }
        if (!closed) {
          tailComplete = false;
          break;
        }
        tailEnd = k;
        continue;
      }
      tailEnd += 1;
    }
    i = tailComplete && !fenceHasExcluded ? tailEnd - 1 : j - 1;
  }

  const scrubbed = out.join("\n");
  if (containsExcludedScoutPath(scrubbed)) {
    throw new Error(
      `Non-exposed Scout operation reference survives outside a removable Markdown block or sentence in ${context} — ` +
        `an upstream re-sync changed the reference shape; update the structural scrub in ` +
        `src/skills/scrub.ts so the reference cannot be emitted.`
    );
  }
  return scrubbed;
}

/** Apply every model-facing skill-body exposure filter. */
export function scrubNonExposedRefs(text: string, context: string): string {
  return scrubExcludedScoutOperationRefs(scrubRetiredSkillRefs(text, context), context);
}
