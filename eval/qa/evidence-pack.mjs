const EVIDENCE_PACK_MAX_CHARS = 12000;
// p7 adds candidate-anchored claim-support spans whose coverage is measured on the
// final serialized text. It keeps the p6 A/V created_at exclusions and the p5 evidence boundaries.
export const PACK_VERSION = "p7";
const MAX_CANONICAL_URLS = 8;
const MAX_CITED_SOURCE_TITLES = 24;
const MAX_CITED_SOURCE_FIELDS = 24;
const INITIAL_MAX_ITEMS = 18;
const INITIAL_MAX_FACTS = 28;
const INITIAL_MAX_CASE_SNIPPETS = 4;
const INITIAL_SUMMARY_CHARS = 520;
const MIN_SUMMARY_CHARS = 180;
const INITIAL_CLAIM_SNIPPET_CHARS = 520;
const MIN_CLAIM_SNIPPET_CHARS = 260;
const INITIAL_SUPPORT_SPAN_CHARS = 360;
const MID_SUPPORT_SPAN_CHARS = 200;
const MIN_SUPPORT_SPAN_CHARS = 120;
// Support units drop to this count before source items drop below 8, so roster answers keep records.
const SUPPORT_UNIT_ITEM_FLOOR = 24;
const SUPPORT_UNIT_FLOOR = 12;
const MAX_SUPPORT_OCCURRENCES_PER_ANCHOR = 24;
const MAX_ALTERNATE_SUPPORT_UNITS = 6;
const MAX_PHRASE_ANCHORS = 24;
const MAX_PHRASE_ANCHORS_PER_CLAIM = 3;
const PHRASE_ANCHOR_MIN_TOKENS = 4;
const MAX_LISTED_SUPPORT_OMISSIONS = 24;
const SOURCE_BASIS_MARKER = "\n--- SOURCE BASIS ---";
// Host provenance sidecar on untruncated results (src/policy/source-basis.ts).
// It does not signal a loss boundary or set `truncated`, unlike SOURCE BASIS.
const SOURCE_METADATA_MARKER = "\n--- SOURCE METADATA ---";
const LEGACY_TRUNCATION_MARKER = "\n--- TRUNCATED ---";
const CONSOLE_MARKER = "\n\n--- console (";

function stripAnsi(value) {
  return String(value ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termMatchRegExp(term, flags = "gi") {
  const escaped = escapeRegExp(term);
  if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
    return new RegExp(
      `(?<![\\p{L}\\p{N},.])${escaped}(?=T\\d{2}:|[^\\p{L}\\p{N},.]|$)`,
      flags.includes("u") ? flags : `${flags}u`
    );
  }
  if (isNumericLikeClaimTerm(term)) {
    return new RegExp(`(?<![\\p{L}\\p{N},.])${escaped}(?![\\p{L}\\p{N},.])`, flags.includes("u") ? flags : `${flags}u`);
  }
  return new RegExp(escaped, flags);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maxChars) {
  const text = cleanText(value);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}

function truncateAroundTerm(value, term, maxChars) {
  const text = cleanText(value);
  if (text.length <= maxChars) return text;
  const match = termMatchRegExp(term, "i").exec(text);
  if (!match) return truncate(text, maxChars);
  const room = Math.max(0, maxChars - 6);
  const before = Math.floor((room - match[0].length) / 2);
  const start = Math.max(0, match.index - Math.max(0, before));
  const end = Math.min(text.length, start + room);
  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
}

function sanitizeUrl(raw) {
  if (!raw) return "";
  try {
    let value = String(raw);
    value = value.replace(/[.,;:!?]+$/g, "");
    while (value.endsWith(")") && (value.match(/\)/g)?.length ?? 0) > (value.match(/\(/g)?.length ?? 0)) {
      value = value.slice(0, -1);
    }
    while (value.endsWith("]") && (value.match(/\]/g)?.length ?? 0) > (value.match(/\[/g)?.length ?? 0)) {
      value = value.slice(0, -1);
    }
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

function sanitizeUrlsInText(value) {
  return String(value ?? "").replace(/https?:\/\/[^\s"'<>\\]+/g, (raw) => sanitizeUrl(raw) || "");
}

export function extractEvidenceTerms({ candidateAnswer = "", golden }) {
  const text = `${candidateAnswer}\n${golden?.answer ?? ""}\n${(golden?.keyFacts ?? []).join("\n")}\n${(golden?.avoid ?? []).join("\n")}\n${golden?.notes ?? ""}`;
  const terms = [];

  for (const match of text.matchAll(/`([^`\n]{3,80})`/g)) terms.push(match[1]);
  for (const match of text.matchAll(/\b[a-z]+[A-Z][A-Za-z0-9_]{2,}\b/g)) terms.push(match[0]);
  for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9]+(?:[- ][A-Z0-9][A-Za-z0-9]+){0,5}\b/g)) {
    const term = cleanText(match[0]);
    if (
      term.length >= 4 &&
      !/^(The|This|That|When|Where|Which|What|With|Source|Sources|Grade|Golden|Question|Candidate|Answer)$/i.test(term)
    ) {
      terms.push(term);
    }
  }
  for (const match of text.matchAll(/\b(?:status|asOf|source|url|amount|round|date|version|limit|summary|title|rank|count|window)\b/gi)) {
    terms.push(match[0]);
  }
  for (const term of exactSupportTerms(text)) {
    terms.push(term);
    if (/^\$?\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:USD|USDC|XLM|EURC|%|[KMB]))?$/i.test(term)) {
      terms.push(term.replace(/[$,\s]/g, ""));
    }
  }

  return unique(terms)
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, 90);
}

function orderedUnique(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function claimTermPriority(term) {
  if (/^\$\s?\d/i.test(term)) return 5;
  if (/%$/.test(term)) return 4;
  if (/\b(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/i.test(term)) return 4;
  if (/^\d/.test(term)) return 3;
  return 2;
}

function exactClaimTermPriority(term) {
  if (/^https:\/\//i.test(term)) return 7;
  if (/\b\d{4}-\d{2}-\d{2}/.test(term)) return 13;
  if (/\b(?:id\d{6,}|(?:[a-z][a-z0-9-]*\.){2,}[a-z0-9-]+)\b/i.test(term)) return 13;
  if (/\b[a-z]+[A-Z][A-Za-z0-9]+\b/.test(term)) return 12;
  if (/^\$?\s?\d/i.test(term)) return 11;
  if (/\b[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\b/.test(term)) return 10;
  return 8;
}

export const GENERIC_CANDIDATE_CLAIM_STOP_RE =
  /^(?:The|This|That|Source|Sources|Article|Articles|Event|Events|Most|Recent|Overall|Net|Question|Answer|Candidate|Golden)$/i;

function isNumericLikeClaimTerm(value) {
  return /^\$?\s?\d/i.test(value) || /\d/.test(value) && /(?:%|[KMB]\b|seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/i.test(value);
}

function isIdentifierLikeClaimTerm(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) ||
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value) ||
    /^(?:[a-z][a-z0-9-]*\.){2,}[a-z0-9-]+$/i.test(value) ||
    /^[a-z]+[A-Z][A-Za-z0-9]+$/.test(value) ||
    /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/i.test(value)
  );
}

function isProperNounPhrase(value) {
  return /\b[A-Z][A-Za-z0-9]+(?:[- ][A-Z0-9][A-Za-z0-9]+)+\b/.test(value);
}

function literalCaseContext({ question = "", golden }) {
  return cleanText(
    `${question}\n${golden?.answer ?? ""}\n${(golden?.keyFacts ?? []).join("\n")}\n${(golden?.avoid ?? []).join("\n")}`
  );
}

function appearsLiterallyInQuestionOrGoldenEntity(term, contextText) {
  if (!isProperNounPhrase(term)) return false;
  return contextText.includes(term);
}

function extractCandidateClaimTerms({ candidateAnswer = "", question = "", golden } = {}) {
  const text = String(candidateAnswer ?? "");
  const contextText = literalCaseContext({ question, golden });
  const found = [];
  for (const value of exactSupportTerms(text)) {
    found.push({
      value,
      index: text.toLowerCase().indexOf(value.toLowerCase()),
      priority: exactClaimTermPriority(value),
      exact: true
    });
  }
  const addMatches = (regex) => {
    for (const match of text.matchAll(regex)) {
      const value = match[0];
      found.push({ value, index: match.index ?? 0, priority: claimTermPriority(value) });
    }
  };

  addMatches(/\$\s?\d[\d,]*(?:\.\d+)?\s?(?:[KMB])?\b/gi);
  addMatches(/\b\d+(?:\.\d+)?%\b/g);
  addMatches(/\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|sixty|ninety|\d+(?:\.\d+)?)\s*[- ]\s*(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi);
  addMatches(/\b\d{2,}[\d,]*(?:\.\d+)?\s?(?:[KMB])?\b/g);
  addMatches(/\b[A-Z][A-Za-z0-9]+(?:[- ][A-Z0-9][A-Za-z0-9]+){0,6}\b/g);

  return orderedUnique(
    found
      .filter((term) => {
        const value = cleanText(term.value);
        if (value.length < 2 || value.length > 90) return false;
        if (/^(?:19|20)\d{2}$/.test(value)) return false;
        if (/^0\d/.test(value)) return false;
        if (/^\d[\d,]*(?:\.\d+)?\s?(?:[KMB])?$/i.test(value)) {
          const numeric = Number(value.replace(/,/g, "").replace(/[KMB]$/i, ""));
          if (Number.isFinite(numeric) && numeric < 100 && !/[KMB]$/i.test(value) && !term.exact) return false;
        }
        if (GENERIC_CANDIDATE_CLAIM_STOP_RE.test(value)) return false;
        return !appearsLiterallyInQuestionOrGoldenEntity(value, contextText);
      })
      .sort((a, b) => b.priority - a.priority || a.index - b.index || a.value.localeCompare(b.value))
      .map((term) => term.value)
  ).slice(0, 160);
}

function extractCaseEvidenceTerms({ candidateAnswer = "", question = "", golden } = {}) {
  const caseText = literalCaseContext({ question, golden });
  const candidateText = cleanText(candidateAnswer).toLowerCase();
  const found = [];
  const add = (value, index, basePriority) => {
    const cleaned = cleanText(value);
    if (cleaned.length < 3 || cleaned.length > 90) return;
    if (candidateText.includes(cleaned.toLowerCase())) return;
    if (GENERIC_CANDIDATE_CLAIM_STOP_RE.test(cleaned)) return;
    const occurrences = caseText.match(termMatchRegExp(cleaned, "gi"))?.length ?? 1;
    found.push({ value: cleaned, index, priority: basePriority + Math.min(4, occurrences) });
  };
  for (const value of exactSupportTerms(caseText)) {
    add(value, caseText.toLowerCase().indexOf(value.toLowerCase()), 10);
  }
  for (const match of caseText.matchAll(/\b[A-Z][A-Za-z0-9]+(?:[- ][A-Z0-9][A-Za-z0-9]+){0,6}\b/g)) {
    add(match[0], match.index ?? 0, 4);
  }
  return orderedUnique(
    found
      .sort((a, b) => b.priority - a.priority || a.index - b.index || a.value.localeCompare(b.value))
      .map((term) => term.value)
  ).slice(0, 40);
}

function shouldIncludeTranscriptEvidence(tags = {}) {
  return tags.freshness !== "stable";
}

function splitExecuteResult(result) {
  const text = stripAnsi(result);
  const sourceBasisAt = text.indexOf(SOURCE_BASIS_MARKER);
  const sourceMetadataAt = text.indexOf(SOURCE_METADATA_MARKER);
  const legacyTruncationAt = text.indexOf(LEGACY_TRUNCATION_MARKER);
  const consoleAt = text.indexOf(CONSOLE_MARKER);
  const bodyEnd = [sourceBasisAt, sourceMetadataAt, legacyTruncationAt, consoleAt]
    .filter((index) => index >= 0)
    .reduce((earliest, index) => Math.min(earliest, index), text.length);
  const sectionEnd = (start) => {
    if (start < 0) return -1;
    const nextSectionAt = text.indexOf("\n\n--- ", start + 2);
    const candidates = [nextSectionAt, consoleAt].filter((index) => index > start);
    return candidates.length ? Math.min(...candidates) : text.length;
  };
  return {
    body: text.slice(0, bodyEnd),
    sourceBasis:
      sourceBasisAt >= 0 ? text.slice(sourceBasisAt + 1, sectionEnd(sourceBasisAt)) : "",
    sourceMetadata:
      sourceMetadataAt >= 0 ? text.slice(sourceMetadataAt + 1, sectionEnd(sourceMetadataAt)) : "",
    legacyTruncation:
      legacyTruncationAt >= 0 ? text.slice(legacyTruncationAt + 1, sectionEnd(legacyTruncationAt)) : "",
    truncated: sourceBasisAt >= 0 || legacyTruncationAt >= 0
  };
}

function executeEntries(transcript) {
  return (Array.isArray(transcript) ? transcript : []).filter(
    (entry) =>
      (String(entry.tool ?? "").endsWith("execute") ||
        /^mcp__.+__(?:lumenloop|scout|stellarDocs)_/.test(String(entry.tool ?? ""))) &&
      typeof entry.result === "string"
  );
}

function tryParseJsonPrefix(result) {
  const jsonText = splitExecuteResult(result).body;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function sourceTitle(value) {
  return cleanText(value?.title ?? value?.name ?? value?.fullName ?? value?.label ?? value?.slug ?? "");
}

const AV_COLLECTION_VALUES = new Set(["av", "videos"]);

function isSupportedAvCollection(value) {
  return AV_COLLECTION_VALUES.has(cleanText(value).toLowerCase());
}

function isSupportedAvPath(path) {
  return String(path ?? "")
    .split(/[.\[\]]+/)
    .some((segment) => isSupportedAvCollection(segment));
}

function activeSupportedAvContainer(text, index) {
  const containers = [];
  let lastString = "";
  let pendingKey = "";
  let inString = false;
  let escaped = false;
  let stringStart = -1;
  for (let at = 0; at < index; at += 1) {
    const ch = text[at];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') {
        lastString = text.slice(stringStart + 1, at);
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      stringStart = at;
    } else if (ch === ":") {
      pendingKey = lastString;
    } else if (ch === "[" || ch === "{") {
      containers.push(pendingKey);
      pendingKey = "";
    } else if (ch === "]" || ch === "}") {
      containers.pop();
    } else if (ch === ",") {
      pendingKey = "";
    }
  }
  return [...containers].reverse().find((key) => isSupportedAvCollection(key)) ?? "";
}

function entryIsAv(entry) {
  const tool = String(entry.tool ?? "");
  if (/__lumenloop_find_av_passages$/.test(tool)) return true;
  const rawInput = String(entry.input ?? "");
  let input = rawInput;
  try {
    const parsed = JSON.parse(rawInput);
    if (typeof parsed?.code === "string") input = parsed.code;
  } catch {
    // Direct test fixtures can carry JavaScript instead of a recorded tool input.
  }
  const operations = [...new Set([...input.matchAll(/\blumenloop\.([a-z_]+)/g)].map((match) => match[1]))];
  if (operations.length !== 1) return false;
  if (operations[0] === "find_av_passages") return true;
  return ["list_documents", "search_documents", "get_document"].includes(operations[0]) &&
    /collection\s*:\s*["'](?:av|videos)["']/i.test(input);
}

function isAvSource(value, path, entryAv = false) {
  return entryAv ||
    isSupportedAvCollection(value?.collection) ||
    isSupportedAvCollection(value?.type) ||
    isSupportedAvCollection(value?.kind) ||
    isSupportedAvPath(path) ||
    "start_offset" in value;
}

function omitsAvDateField(value, key, avSource) {
  return avSource && (
    key === "created_at" ||
    key === "dateField" ||
    (key === "date" && value?.dateField === "created_at")
  );
}

function sourceDate(value, path, entryAv) {
  const avSource = isAvSource(value, path, entryAv);
  const dateFromAvCreatedAt = avSource && value?.dateField === "created_at";
  return cleanText(
    (dateFromAvCreatedAt ? undefined : value?.date) ??
      value?.publishing_date ??
      value?.publishedAt ??
      (avSource ? undefined : value?.created_at) ??
      value?.updated_at ??
      value?.lastCommitAt ??
      value?.checkedAt ??
      value?.asOf ??
      ""
  );
}

function sourceSummary(value) {
  return cleanText(
    value?.summary ??
      value?.description ??
      value?.excerpt ??
      value?.snippet ??
      value?.contentSummary ??
      value?.text ??
      ""
  );
}

function maybeSourceItem(value, path, entryIndex, entryAv) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const title = sourceTitle(value);
  const url = sanitizeUrl(value.url ?? value.sourceUrl ?? value.source ?? value.href);
  const alternateUrls = unique(
    [value.sourceUrl, value.href, value.externalUrl, value.githubUrl, value.demoUrl, value.videoUrl]
      .map(sanitizeUrl)
      .filter((candidate) => candidate && candidate !== url)
  );
  const summary = sourceSummary(value);
  const avSource = isAvSource(value, path, entryAv);
  const date = sourceDate(value, path, entryAv);
  if (!title && !url && !summary) return null;
  if (!title && summary.length < 24) return null;
  return {
    title,
    url,
    alternateUrls,
    date,
    summary,
    type: cleanText(value.type ?? value.kind ?? value.domain ?? value.channel ?? ""),
    fields: scalarFactsForObject(value, avSource),
    path,
    entryIndex
  };
}

function scalarFactsForObject(value, avSource = false) {
  const skip = new Set([
    "title",
    "name",
    "fullName",
    "label",
    "slug",
    "url",
    "sourceUrl",
    "source",
    "href",
    "externalUrl",
    "githubUrl",
    "demoUrl",
    "videoUrl",
    "summary",
    "description",
    "excerpt",
    "snippet",
    "contentSummary",
    "text"
  ]);
  const facts = [];
  for (const [key, raw] of Object.entries(value)) {
    if (omitsAvDateField(value, key, avSource)) continue;
    if (skip.has(key) || raw === null || raw === undefined || typeof raw === "object") continue;
    const rendered = cleanText(raw);
    if (!rendered || rendered.length > 100) continue;
    facts.push({ key, value: rendered, priority: scalarFieldPriority(key) });
  }
  return facts
    .sort((a, b) => b.priority - a.priority || a.key.localeCompare(b.key))
    .slice(0, 8)
    .map((fact) => `${fact.key}=${JSON.stringify(fact.value)}`);
}

function scalarFieldPriority(key) {
  return /rank|placement|winner|count|date|status|round|amount|total|source|award|prize/i.test(key) ? 2 : 1;
}

function walkSourceItems(value, path, entryIndex, out, entryAv) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSourceItems(item, `${path}[${index}]`, entryIndex, out, entryAv));
    return;
  }
  const item = maybeSourceItem(value, path, entryIndex, entryAv);
  if (item) out.push(item);
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === "object") walkSourceItems(child, path ? `${path}.${key}` : key, entryIndex, out, entryAv);
  }
}

function scanBalancedObjectAt(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return "";
}

function scanSourceItemsFromText(result, entryIndex, entryAv) {
  const text = splitExecuteResult(result).body;
  const out = [];
  const seenStarts = new Set();
  for (const marker of ["\"title\"", "\"name\"", "\"fullName\""]) {
    let index = 0;
    while ((index = text.indexOf(marker, index)) >= 0) {
      const start = text.lastIndexOf("{", index);
      index += marker.length;
      if (start < 0 || seenStarts.has(start)) continue;
      seenStarts.add(start);
      const objectText = scanBalancedObjectAt(text, start);
      if (!objectText) continue;
      try {
        const parsed = JSON.parse(objectText);
        const activeContainer = activeSupportedAvContainer(text, start);
        const path = activeContainer ? `visible-json-fragment.${activeContainer}` : "visible-json-fragment";
        const item = maybeSourceItem(parsed, path, entryIndex, entryAv);
        if (item) out.push(item);
      } catch {
        // Ignore partial/truncated fragments.
      }
    }
  }
  return out;
}

function dedupeItems(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = `${item.url || item.title}|${item.date}|${item.summary.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function termHits(text, terms) {
  const haystack = text.toLowerCase();
  const hits = [];
  for (const term of terms) {
    if (term.length < 3 && !isNumericLikeClaimTerm(term)) continue;
    if (
      isNumericLikeClaimTerm(term)
        ? containsExactSupport(text, term)
        : haystack.includes(term.toLowerCase())
    ) hits.push(term);
  }
  return unique(hits);
}

function sourceItemText(item) {
  return cleanText(
    `${item.title} ${item.date} ${item.url} ${item.alternateUrls.join(" ")} ${item.type} ${item.fields.join(" ")} ${item.summary}`
  );
}

function enclosingObjectStartAt(text, index) {
  const objects = [];
  let inString = false;
  let escaped = false;
  for (let at = 0; at < index; at += 1) {
    const ch = text[at];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") objects.push(at);
    else if (ch === "}") objects.pop();
  }
  return objects.at(-1) ?? -1;
}

function objectAt(text, index) {
  const start = enclosingObjectStartAt(text, index);
  if (start < 0) return null;
  const objectText = scanBalancedObjectAt(text, start);
  if (!objectText) return null;
  try {
    const value = JSON.parse(objectText);
    return { start, end: start + objectText.length, value };
  } catch {
    return null;
  }
}

function avObjectAt(text, index, entryAv) {
  const object = objectAt(text, index);
  if (!object) return null;
  const path = activeSupportedAvContainer(text, object.start);
  return isAvSource(object.value, path, entryAv || Boolean(path)) ? object : null;
}

function dateKeyAt(text, index, object) {
  return (
    text.slice(object.start, index).match(/"([^"]+)"\s*:\s*"[^"]*$/)?.[1] ??
    text.slice(index, object.end).match(/^"([^"]+)"\s*:/)?.[1]
  );
}

function classifiedAvDateFieldAt(text, index, entryAv) {
  const object = avObjectAt(text, index, entryAv);
  if (!object) return false;
  const key = dateKeyAt(text, index, object);
  return omitsAvDateField(object.value, key, true);
}

function classifiedAvDateFieldsInRange(text, start, end, entryAv) {
  const fields = [];
  const dateFieldRe = /"(?:created_at|date)"\s*:\s*"(?:\\.|[^"\\])*"/g;
  let match;
  while ((match = dateFieldRe.exec(text)) && match.index < end) {
    const fieldEnd = match.index + match[0].length;
    if (fieldEnd <= start || !classifiedAvDateFieldAt(text, match.index, entryAv)) continue;
    const valueStart = match.index + match[0].indexOf('"', match[0].indexOf(":")) + 1;
    fields.push({ start: match.index, end: fieldEnd, valueStart, valueEnd: fieldEnd - 1 });
  }
  return fields;
}

function snippetWithClassifiedAvDatesOmitted(text, start, end, entryAv) {
  const fields = classifiedAvDateFieldsInRange(text, start, end, entryAv);
  let snippet = text.slice(start, end);
  for (const field of [...fields].reverse()) {
    let removeStart = Math.max(field.start, start) - start;
    let removeEnd = Math.min(field.end, end) - start;
    while (/\s/.test(snippet[removeEnd] ?? "")) removeEnd += 1;
    if (snippet[removeEnd] === ",") {
      removeEnd += 1;
      while (/\s/.test(snippet[removeEnd] ?? "")) removeEnd += 1;
    } else {
      let before = removeStart - 1;
      while (before >= 0 && /\s/.test(snippet[before])) before -= 1;
      if (snippet[before] === ",") removeStart = before;
    }
    snippet = `${snippet.slice(0, removeStart)}${snippet.slice(removeEnd)}`;
  }
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return cleanText(sanitizeUrlsInText(`${prefix}${snippet}${suffix}`));
}

function isClassifiedAvDateValueMatch(fields, matchStart, matchEnd) {
  return fields.some((field) => field.valueStart <= matchStart && matchEnd <= field.valueEnd);
}

function collectClaimSnippets(entries, claimTerms) {
  const snippets = [];
  const seen = new Set();
  const seenRangesByEntry = new Map();
  for (const [termIndex, term] of claimTerms.entries()) {
    const re = termMatchRegExp(term, "gi");
    for (const [entryIndex, entry] of entries.entries()) {
      const text = splitExecuteResult(entry.result).body;
      const entryAv = entryIsAv(entry);
      let match;
      let perTermEntryMatches = 0;
      while ((match = re.exec(text))) {
        const start = Math.max(0, match.index - 360);
        const end = Math.min(text.length, match.index + match[0].length + 360);
        const dateFields = classifiedAvDateFieldsInRange(text, start, end, entryAv);
        if (isClassifiedAvDateValueMatch(dateFields, match.index, match.index + match[0].length)) continue;
        const ranges = seenRangesByEntry.get(entryIndex) ?? [];
        if (ranges.some((range) => Math.max(start, range.start) < Math.min(end, range.end))) {
          perTermEntryMatches += 1;
          if (perTermEntryMatches >= 2) break;
          continue;
        }
        const snippet = snippetWithClassifiedAvDatesOmitted(text, start, end, entryAv);
        const key = snippet.slice(0, 220).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          ranges.push({ start, end });
          seenRangesByEntry.set(entryIndex, ranges);
          snippets.push({
            term,
            termIndex,
            entryIndex,
            matchIndex: match.index,
            tool: cleanText(entry.tool ?? `entry#${entryIndex + 1}`),
            resultChars: entry.resultChars ?? text.length,
            snippet
          });
        }
        perTermEntryMatches += 1;
        if (perTermEntryMatches >= 2) break;
      }
    }
  }
  return snippets.sort(
    (a, b) =>
      a.termIndex - b.termIndex ||
      a.entryIndex - b.entryIndex ||
      a.matchIndex - b.matchIndex ||
      a.term.localeCompare(b.term)
  );
}

function selectClaimSnippetsForCoverage(snippets, terms, limit) {
  const remaining = snippets.map((snippet, index) => ({
    ...snippet,
    index,
    hits: termHits(snippet.snippet, terms)
  }));
  const covered = new Set();
  const selected = [];
  while (selected.length < limit && remaining.length) {
    remaining.sort((a, b) => {
      const aGain = a.hits.filter((term) => !covered.has(term.toLowerCase())).length;
      const bGain = b.hits.filter((term) => !covered.has(term.toLowerCase())).length;
      return bGain - aGain || b.hits.length - a.hits.length || a.index - b.index;
    });
    const next = remaining.shift();
    selected.push(next);
    next.hits.forEach((term) => covered.add(term.toLowerCase()));
  }
  return selected;
}

function scoreItem(item, terms) {
  const titleHits = termHits(item.title, terms);
  const summaryHits = termHits(item.summary, terms);
  const metaHits = termHits(`${item.date} ${item.url} ${item.type}`, terms);
  return titleHits.length * 6 + summaryHits.length * 4 + metaHits.length + Math.min(2, Math.floor(item.summary.length / 240));
}

function rankedItems(items, terms) {
  return items
    .map((item, originalIndex) => ({
      ...item,
      originalIndex,
      score: scoreItem(item, terms),
      hits: termHits(`${item.title} ${item.summary} ${item.date} ${item.url}`, terms).slice(0, 8)
    }))
    .sort((a, b) => b.score - a.score || a.entryIndex - b.entryIndex || a.originalIndex - b.originalIndex);
}

function prioritizeItemsForCandidateExactTerms(items, candidateAnswer) {
  const answer = String(candidateAnswer ?? "");
  const exactTerms = exactSupportTerms(answer);
  const supportCounts = new Map(
    exactTerms.map((term) => [
      term,
      items.filter((item) => containsExactSupport(sourceItemText(item), term)).length
    ])
  );
  const byCoverage = items
    .map((item, index) => {
      const supported = exactTerms.filter((term) => containsExactSupport(sourceItemText(item), term));
      const answerIndex = supported.reduce((earliest, term) => {
        const index = answer.toLowerCase().indexOf(term.toLowerCase());
        return index < 0 ? earliest : Math.min(earliest, index);
      }, Number.POSITIVE_INFINITY);
      return {
        item,
        index,
        coverage: supported.reduce(
          (score, term) => score + exactClaimTermPriority(term) / Math.max(1, supportCounts.get(term)),
          0
        ),
        answerIndex
      };
    })
    .sort(
      (a, b) =>
        b.coverage - a.coverage ||
        a.answerIndex - b.answerIndex ||
        a.index - b.index
    )
    .map(({ item }) => item);
  const byUrlOrder = [];
  const seenUrlItems = new Set();
  for (const url of exactTerms.filter((term) => /^https:\/\//i.test(term))) {
    const item = items.find((candidate) => containsExactSupport(candidate.url, url));
    if (!item || seenUrlItems.has(item)) continue;
    seenUrlItems.add(item);
    byUrlOrder.push(item);
  }
  const prioritized = [];
  const seen = new Set();
  const add = (item) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    prioritized.push(item);
  };
  for (let index = 0; index < Math.max(byCoverage.length, byUrlOrder.length); index += 1) {
    add(byCoverage[index]);
    add(byUrlOrder[index]);
  }
  return prioritized;
}

function collectSourceItems(entries) {
  const items = [];
  entries.forEach((entry, entryIndex) => {
    const parsed = tryParseJsonPrefix(entry.result);
    const entryAv = entryIsAv(entry);
    if (parsed) walkSourceItems(parsed, "", entryIndex, items, entryAv);
    for (const item of scanSourceItemsFromText(entry.result, entryIndex, entryAv)) items.push(item);
  });
  return dedupeItems(items);
}

function collectRelevantFactsFromParsed(value, terms, path = "", out = [], entryAv = false) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRelevantFactsFromParsed(item, terms, `${path}[${index}]`, out, entryAv));
    return out;
  }
  const avSource = isAvSource(value, path, entryAv);
  for (const [key, raw] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (raw && typeof raw === "object") {
      collectRelevantFactsFromParsed(raw, terms, nextPath, out, entryAv);
      continue;
    }
    if (raw === undefined) continue;
    if (omitsAvDateField(value, key, avSource)) continue;
    for (const fact of factValuesFromText(nextPath, raw, terms)) {
      if (!fact.value || fact.value.length > 120) continue;
      const score = termHits(`${fact.path} ${fact.value}`, terms).length +
        (scalarFieldPriority(fact.path) > 1 ? 1 : 0);
      if (score > 0) out.push({ ...fact, score });
    }
  }
  return out;
}

function factValuesFromText(key, raw, terms) {
  const values = [];
  const rendered = cleanText(raw);
  if (/^https?:\/\//i.test(rendered)) {
    const sanitized = sanitizeUrl(rendered);
    if (sanitized) values.push({ path: key, value: sanitized });
    for (const term of termHits(rendered, terms)) {
      if (!sanitized.toLowerCase().includes(term.toLowerCase())) {
        values.push({ path: `${key}.matchedIdentifier`, value: term });
      }
    }
    return values;
  }
  values.push({ path: key, value: rendered });
  return values;
}

function collectRelevantFactsFromText(result, terms, entryAv) {
  const body = splitExecuteResult(result).body;
  const facts = [];
  const scalarRe = /"((?:\\.|[^"\\]){1,90})"\s*:\s*("(?:\\.|[^"\\]){0,400}"|-?\d+(?:\.\d+)?|true|false|null)/g;
  for (const match of body.matchAll(scalarRe)) {
    let raw;
    try {
      raw = match[2].startsWith('"') ? JSON.parse(match[2]) : match[2];
    } catch {
      continue;
    }
    const avObject = avObjectAt(body, match.index ?? 0, entryAv);
    if (omitsAvDateField(avObject?.value, match[1], Boolean(avObject))) continue;
    for (const fact of factValuesFromText(match[1], raw, terms)) {
      if (!fact.value || fact.value.length > 200) continue;
      const hits = termHits(`${fact.path} ${fact.value}`, terms).length;
      const priority = scalarFieldPriority(fact.path);
      if (hits > 0 || priority > 1) facts.push({ ...fact, score: hits * 3 + priority });
    }
  }

  const scalarArrayRe = /"((?:\\.|[^"\\]){1,90})"\s*:\s*(\[(?:\s*(?:"(?:\\.|[^"\\]){0,120}"|-?\d+(?:\.\d+)?|true|false|null)\s*,?){1,24}\])/g;
  for (const match of body.matchAll(scalarArrayRe)) {
    let values;
    try {
      values = JSON.parse(match[2]);
    } catch {
      continue;
    }
    values.forEach((raw, index) => {
      for (const fact of factValuesFromText(`${match[1]}[${index}]`, raw, terms)) {
        const hits = termHits(`${fact.path} ${fact.value}`, terms).length;
        const priority = scalarFieldPriority(fact.path);
        if (hits > 0 || priority > 1) facts.push({ ...fact, score: hits * 3 + priority });
      }
    });
  }
  return facts;
}

function collectRelevantFacts(entries, terms) {
  const facts = [];
  entries.forEach((entry, entryIndex) => {
    const parsed = tryParseJsonPrefix(entry.result);
    const entryAv = entryIsAv(entry);
    if (parsed) {
      for (const fact of collectRelevantFactsFromParsed(parsed, terms, "", [], entryAv)) facts.push({ ...fact, entryIndex });
    }
    for (const fact of collectRelevantFactsFromText(entry.result, terms, entryAv)) facts.push({ ...fact, entryIndex });
  });
  const seen = new Set();
  return facts
    .sort((a, b) => b.score - a.score || a.entryIndex - b.entryIndex || a.path.localeCompare(b.path))
    .filter((fact) => {
      const key = `${fact.path}=${fact.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function collectVerbatimClaimFacts(entries, terms) {
  const facts = [];
  for (const term of terms) {
    let entryIndex = -1;
    let value = term;
    for (const [candidateEntryIndex, entry] of entries.entries()) {
      const body = splitExecuteResult(entry.result).body;
      const match = termMatchRegExp(term, "i").exec(body);
      if (!match) continue;
      entryIndex = candidateEntryIndex;
      value = `${match[0]}${body.slice(match.index + match[0].length).match(/^[.!?]/)?.[0] ?? ""}`;
      break;
    }
    if (entryIndex < 0) continue;
    facts.push({
      path: `candidateClaim[${entryIndex + 1}]`,
      value,
      score: 100,
      entryIndex
    });
  }
  return facts;
}

function prioritizeFactsForExactTerms(facts, candidateAnswer) {
  const answer = String(candidateAnswer ?? "");
  const exactTerms = exactSupportTerms(answer)
    .map((term) => ({
      term,
      priority: exactClaimTermPriority(term),
      index: answer.toLowerCase().indexOf(term.toLowerCase())
    }))
    .sort((a, b) => b.priority - a.priority || a.index - b.index || a.term.localeCompare(b.term));
  const selected = [];
  const used = new Set();
  for (const { term } of exactTerms) {
    const index = facts.findIndex(
      (fact, factIndex) =>
        !used.has(factIndex) && containsExactSupport(`${fact.path}=${fact.value}`, term)
    );
    if (index < 0) continue;
    used.add(index);
    selected.push(facts[index]);
  }
  return [...selected, ...facts.filter((_, index) => !used.has(index))];
}

function protocolVersionClaimTerms(text) {
  const input = String(text ?? "");
  const terms = [];
  // Consume each whole name once. Repeated hyphens must not create overlapping
  // ways to partition the name when the version is absent.
  const names = /\b[A-Z][A-Za-z0-9.-]*/g;
  let name;
  while ((name = names.exec(input)) !== null) {
    if (!/-[A-Z]/.test(name[0])) continue;
    const version = /^\s+\d+(?:\.\d+)+\b/.exec(input.slice(names.lastIndex));
    if (!version) continue;
    terms.push(name[0] + version[0]);
    names.lastIndex += version[0].length;
  }
  return orderedUnique(terms);
}

function verbatimClaimTerms(text) {
  const input = String(text ?? "");
  const terms = [];
  const add = (value) => {
    const cleaned = cleanText(value);
    if (cleaned.length >= 2 && cleaned.length <= 180) terms.push(cleaned);
  };
  for (const match of input.matchAll(/["“]([^"”\n]{3,600})["”]/g)) {
    for (const sentence of match[1].split(/(?<=[.!?])\s+/)) {
      if (cleanText(sentence).split(" ").length >= 3 && cleanText(sentence).length <= 90) {
        add(sentence);
      }
    }
  }
  for (const term of protocolVersionClaimTerms(input)) add(term);
  return orderedUnique(terms);
}

const PROSE_SUPPORT_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by", "for",
  "from", "has", "have", "in", "is", "it", "its", "of", "on", "or", "that", "the",
  "their", "this", "through", "to", "was", "were", "with"
]);

function proseSupportTokens(value, { contentOnly = false } = {}) {
  const tokens = String(value ?? "").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return contentOnly ? tokens.filter((token) => !PROSE_SUPPORT_STOP_WORDS.has(token)) : tokens;
}

function proseSupportProbes(claims) {
  const probes = [];
  const seen = new Set();
  const add = (label, tokens) => {
    const cleaned = cleanText(label).replace(/[.,;:!?]+$/g, "");
    const key = tokens.join(" ");
    if (
      tokens.length < 3 ||
      tokens.length > 24 ||
      !tokens.some((token) => /\d/.test(token) || token.length >= 5) ||
      seen.has(key)
    ) return;
    seen.add(key);
    probes.push({ label: cleaned, tokens });
  };

  for (const claim of claims) {
    const quoted = [];
    for (const regex of [
      /(?<![\p{L}\p{N}])['‘]([^'’\n]{3,180})['’](?![\p{L}\p{N}])/gu,
      /["“]([^"”\n]{3,180})["”]/g
    ]) {
      for (const match of String(claim ?? "").matchAll(regex)) quoted.push(match[1]);
    }
    const qualifiedQuoted = quoted.filter((value) => proseSupportTokens(value).length >= 3);
    if (qualifiedQuoted.length) {
      for (const value of qualifiedQuoted) add(value, proseSupportTokens(value));
      continue;
    }

    const supportClause = cleanText(String(claim ?? "").split(
      /\b(?:without|unsupported|unverified|fabricated|not\s+supported|not\s+(?:shown|present|found|appearing))\b/i
    )[0])
      .replace(/[,;:]?\s*(?:but\s+)?this\s+(?:statement|claim|detail|fact)\s+is\s*$/i, "")
      .replace(/[.,;:!?]+$/g, "");
    const tokens = proseSupportTokens(supportClause, { contentOnly: true });
    if (tokens.length >= 5) add(supportClause, tokens);
  }
  return probes;
}

function proseSupportUnits(value) {
  const units = [];
  const seen = new Set();
  const add = (raw) => {
    for (const part of String(raw ?? "").split(/(?:\r?\n)+|(?<=[.!?])\s+/)) {
      const cleaned = cleanText(part);
      const key = cleaned.toLowerCase();
      if (cleaned.length < 8 || cleaned.length > 2000 || seen.has(key)) continue;
      seen.add(key);
      units.push(cleaned);
    }
  };
  const text = stripAnsi(value);
  for (const match of text.matchAll(/"(?:\\.|[^"\\])*"/g)) {
    try {
      const decoded = JSON.parse(match[0]);
      if (typeof decoded === "string") add(decoded);
    } catch {
      // Ignore incomplete strings in clipped JSON.
    }
  }
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(?:[\[\]{}]|"(?:\\.|[^"\\])*"\s*:)/.test(line)) continue;
    add(line);
  }
  return units;
}

function unitContainsProseProbe(unit, probeTokens) {
  const tokens = proseSupportTokens(unit);
  const maxExtraTokens = Math.max(3, Math.ceil(probeTokens.length / 2));
  for (let start = 0; start < tokens.length; start += 1) {
    if (tokens[start] !== probeTokens[0]) continue;
    let at = start;
    let matched = true;
    for (const probeToken of probeTokens.slice(1)) {
      const next = tokens.indexOf(probeToken, at + 1);
      if (next < 0 || next - at > 4) {
        matched = false;
        break;
      }
      at = next;
    }
    if (matched && at - start + 1 <= probeTokens.length + maxExtraTokens) return true;
  }
  return false;
}

function textUnitsContainProseProbe(units, probe) {
  return units.some((unit) => unitContainsProseProbe(unit, probe.tokens));
}

function exactSupportTerms(text) {
  const input = String(text ?? "");
  const terms = [];
  const add = (value) => {
    const cleaned = cleanText(value);
    if (cleaned.length >= 2 && cleaned.length <= 180) terms.push(cleaned);
  };
  for (const match of input.matchAll(/`([^`\n]{2,180})`/g)) add(match[1]);
  for (const term of protocolVersionClaimTerms(input)) add(term);
  for (const match of input.matchAll(/https:\/\/[^\s"'<>\\]+/g)) add(sanitizeUrl(match[0]));
  for (const match of input.matchAll(/\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?\b/g)) add(match[0]);
  for (const match of input.matchAll(/\$\s?\d[\d,]*(?:\.\d+)?\s?(?:[KMB])?\b/gi)) add(match[0]);
  for (const match of input.matchAll(/\b\d[\d,]*(?:\.\d+)?\s?(?:USD|USDC|XLM|EURC|%|[KMB])\b/gi)) add(match[0]);
  for (const match of input.matchAll(/\b(?:id\d{6,}|(?:[a-z][a-z0-9-]*\.){2,}[a-z0-9-]+)\b/gi)) add(match[0]);
  for (const match of input.matchAll(/\b[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\b/g)) add(match[0]);
  for (const match of input.matchAll(/\b[a-z]+[A-Z][A-Za-z0-9]+\b/g)) add(match[0]);
  for (const match of input.matchAll(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/gi)) add(match[0]);
  for (const match of input.matchAll(/(?<![\w/-])\d{2,}(?:,\d{3})*(?:\.\d+)?(?![\w/-])/g)) add(match[0]);
  return orderedUnique(terms);
}

function jsonValueContainsExactNumber(value, term) {
  if (typeof value === "number") return Number.isFinite(value) && String(value) === term;
  if (typeof value === "string") return value === term;
  if (Array.isArray(value)) return value.some((item) => jsonValueContainsExactNumber(item, term));
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some((item) => jsonValueContainsExactNumber(item, term));
}

function containsExactBareNumber(text, term) {
  const haystack = String(text ?? "");
  const parsed = tryParseJsonPrefix(haystack);
  if (parsed !== null) return jsonValueContainsExactNumber(parsed, term);

  const withoutUrls = haystack.replace(/https?:\/\/[^\s"'<>\\]+/g, "");
  const numericTokenRe = /(?<![\p{L}\p{N}._\/-])\$?\s?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s?(?:USD|USDC|XLM|EURC|%|[KMB]))?(?![\p{L}\p{N}._\/-])/giu;
  const normalized = (value) => value.toLowerCase().replace(/[\s,$]/g, "");
  for (const match of withoutUrls.matchAll(numericTokenRe)) {
    if (normalized(match[0]) === term) return true;
  }
  return false;
}

function containsExactSupport(text, term) {
  const haystack = String(text ?? "");
  if (/^https:\/\//i.test(term)) {
    for (const match of haystack.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
      if (sanitizeUrl(match[0]).toLowerCase() === term.toLowerCase()) return true;
    }
    return false;
  }
  if (/^\d+$/.test(term)) return containsExactBareNumber(haystack, term);
  if (/^\$?\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:USD|USDC|XLM|EURC|%|[KMB]))?$/i.test(term)) {
    const normalized = (value) => value.toLowerCase().replace(/[\s,$]/g, "");
    for (const match of haystack.matchAll(/\$?\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:USD|USDC|XLM|EURC|%|[KMB]))?/gi)) {
      if (normalized(match[0]) === normalized(term)) return true;
    }
    return false;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(term)) return termMatchRegExp(term, "i").test(haystack);
  if (isIdentifierLikeClaimTerm(term)) {
    return new RegExp(
      `(?<![\\p{L}\\p{N}_./-])${escapeRegExp(term)}(?![\\p{L}\\p{N}_./-])`,
      "iu"
    ).test(haystack);
  }
  return haystack.toLowerCase().includes(term.toLowerCase());
}

export function findTranscriptEvidencePackOmissions({
  transcript = [],
  transcriptEvidence = "",
  claims = []
} = {}) {
  const exactTerms = exactSupportTerms(claims.join("\n"));
  const fullTranscriptResults = executeEntries(transcript).map((entry) => stripAnsi(entry.result));
  const supportedTerms = exactTerms.filter((term) =>
    fullTranscriptResults.some((result) => containsExactSupport(result, term))
  );
  const omittedTerms = supportedTerms
    .filter((term) => !containsExactSupport(transcriptEvidence, term))
    .slice(0, 24);
  const proseProbes = proseSupportProbes(claims);
  const fullTranscriptUnits = fullTranscriptResults.flatMap(proseSupportUnits);
  const transcriptEvidenceUnits = proseSupportUnits(transcriptEvidence);
  const supportedProse = proseProbes.filter((probe) =>
    textUnitsContainProseProbe(fullTranscriptUnits, probe)
  );
  const omittedProse = supportedProse
    .filter((probe) => !textUnitsContainProseProbe(transcriptEvidenceUnits, probe))
    .slice(0, Math.max(0, 24 - omittedTerms.length))
    .map((probe) => probe.label);
  const hasOmission = omittedTerms.length > 0 || omittedProse.length > 0;
  return {
    status: hasOmission ? "pack-omission" : "no-pack-omission",
    requiresReview: hasOmission,
    checkedClaims: claims.length,
    checkedTerms: exactTerms.length,
    transcriptSupportedTerms: supportedTerms.length,
    omittedTerms,
    checkedProse: proseProbes.length,
    transcriptSupportedProse: supportedProse.length,
    omittedProse
  };
}

// Claim support (p7). Anchors come from the candidate answer and the saved execute results only;
// judge verdicts never select judge input. Each unit is an exact source span with provenance, and
// coverage counts an anchor only when the rendered span still contains it.

const SUPPORT_TOKEN_RE = /[\p{L}\p{N}]+/gu;
const SUPPORT_SEPARATOR = "[^\\p{L}\\p{N}]+";
const WRITTEN_DATE_BEFORE_DAY = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+$/i;
const WRITTEN_DATE_AFTER_DAY = /^(?:st|nd|rd|th)?,?\s+(?:19|20)\d{2}\b/;
const BARE_NUMBER_RE = /^\d[\d,]*(?:\.\d+)?$/;
const QUOTED_SEPARATOR = "[^\\p{L}\\p{N}]+(?:[\\p{L}\\p{N}]{1,12}[^\\p{L}\\p{N}]+){0,2}?";
const VERSION_ANCHOR_RE =
  /(?<![\p{L}\p{N}.])(?:v\d+(?:\.\d+)+|\d+\.\d+\.\d+(?:\.\d+)?)(?:-(?:alpha|beta|rc|pre|preview|dev|canary|next)(?:\.?\d+)*)?(?![\p{L}\p{N}]|[.-][\p{L}\p{N}])/giu;

function isErrorEntry(entry) {
  return Boolean(entry.isError) || /^Execution failed:/i.test(String(entry.result ?? ""));
}

function supportTokens(value) {
  return String(value ?? "").toLowerCase().match(SUPPORT_TOKEN_RE) ?? [];
}

function supportAnchorRegExp(anchor) {
  if (anchor.kind === "phrase" || (anchor.kind === "quoted" && supportTokens(anchor.value).length >= 3)) {
    const tokens = supportTokens(anchor.value).map(escapeRegExp);
    // A quotation may drop a short word, so up to two source words may sit between quoted words.
    const separator = anchor.kind === "quoted" ? QUOTED_SEPARATOR : SUPPORT_SEPARATOR;
    return new RegExp(`(?<![\\p{L}\\p{N}])${tokens.join(separator)}(?![\\p{L}\\p{N}])`, "giu");
  }
  if (anchor.kind === "version") {
    const core = escapeRegExp(anchor.value.replace(/^v/i, ""));
    return new RegExp(`(?<![\\p{N}.])v?${core}(?![\\p{N}]|[.-][\\p{L}\\p{N}])`, "giu");
  }
  const scaled = anchor.value.match(/^(\$?)\s?(\d[\d,]*(?:\.\d+)?)\s?([KMB])$/i);
  if (scaled) {
    // An abbreviated amount also matches its spelled-out scale: $174.4M and $174.4 million.
    const scale = { k: "k|thousand", m: "m|mn|million", b: "b|bn|billion" }[scaled[3].toLowerCase()];
    return new RegExp(
      `(?<![\\p{L}\\p{N}.,_/:-])${scaled[1] ? "\\$\\s?" : "\\$?\\s?"}${escapeRegExp(scaled[2])}\\s?(?:${scale})(?![\\p{L}\\p{N}])`,
      "giu"
    );
  }
  const number = anchor.value.match(/^(\$?)\s?(\d[\d,]*(?:\.\d+)?)$/);
  if (number) {
    // A bare number never matches inside a date, version, identifier, path, or larger number.
    // Thousands separators and a currency sign are optional in the source: $96,000 matches 96000.
    const digits = escapeRegExp(number[2]).replace(/,/g, ",?");
    return new RegExp(`(?<![\\p{L}\\p{N}.,_/:-])${number[1] ? "\\$?\\s?" : ""}${digits}(?![\\p{L}\\p{N}_/-]|[.,:]\\p{N})`, "giu");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(anchor.value) || /^\$?\s?\d/.test(anchor.value)) return termMatchRegExp(anchor.value, "gi");
  if (isIdentifierLikeClaimTerm(anchor.value)) {
    return new RegExp(`(?<![\\p{L}\\p{N}_./-])${escapeRegExp(anchor.value)}(?![\\p{L}\\p{N}_./-])`, "giu");
  }
  return new RegExp(escapeRegExp(anchor.value), "gi");
}

// Every match of an anchor in text. A URL anchor matches a URL whose sanitized form is equal.
function anchorMatches(anchor, text, limit = Number.POSITIVE_INFINITY) {
  const found = [];
  if (/^https:\/\//i.test(anchor.value)) {
    for (const match of text.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
      if (found.length >= limit) break;
      if (sanitizeUrl(match[0]).toLowerCase() === anchor.value.toLowerCase()) {
        found.push({ start: match.index ?? 0, end: (match.index ?? 0) + match[0].length });
      }
    }
    return found;
  }
  const re = supportAnchorRegExp(anchor);
  let match;
  while (found.length < limit && (match = re.exec(text)) !== null) {
    found.push({ start: match.index, end: match.index + match[0].length });
    if (match[0].length === 0) re.lastIndex += 1;
  }
  return found;
}

function answerClaimRanges(answer) {
  const ranges = [];
  let start = 0;
  const close = (end) => {
    if (cleanText(answer.slice(start, end))) ranges.push({ start, end });
    start = end;
  };
  for (const match of answer.matchAll(/[.!?]+(?=\s|$)|\n/g)) close((match.index ?? 0) + match[0].length);
  close(answer.length);
  return ranges.length ? ranges : [{ start: 0, end: answer.length }];
}

function claimIndexAt(ranges, index) {
  const at = ranges.findIndex((range) => index >= range.start && index < range.end);
  return at < 0 ? 0 : at;
}

function quotedClauseAnchors(answer) {
  const anchors = [];
  for (const regex of [
    /["“]([^"”\n]{3,400})["”]/g,
    /(?<![\p{L}\p{N}])['‘]([^'’\n]{3,400})['’](?![\p{L}\p{N}])/gu
  ]) {
    for (const match of answer.matchAll(regex)) {
      const offset = (match.index ?? 0) + match[0].indexOf(match[1]);
      for (const sentence of match[1].split(/(?<=[.!?])\s+/)) {
        const value = cleanText(sentence).replace(/^[,;:]+|[.,;:!?]+$/g, "").trim();
        if (value.length < 3 || value.length > 180 || !supportTokens(value).length) continue;
        anchors.push({ value, kind: "quoted", index: offset + Math.max(0, match[1].indexOf(sentence.trim())) });
      }
    }
  }
  return anchors;
}

function versionAnchors(answer) {
  return [...answer.matchAll(VERSION_ANCHOR_RE)].map((match) => ({
    value: match[0],
    kind: "version",
    index: match.index ?? 0
  }));
}

function decimalAnchors(answer) {
  return [...answer.matchAll(/(?<![\p{L}\p{N}.,_/:-])\d+\.\d+(?![\p{L}\p{N}_/-]|[.,:]\p{N})/gu)].map((match) => ({
    value: match[0],
    kind: "exact",
    index: match.index ?? 0
  }));
}

function identityLabel(value) {
  return sourceTitle(value) || cleanText(value?.repo ?? value?.repository ?? "");
}

function parseJsonText(literal) {
  try {
    return JSON.parse(literal);
  } catch {
    return null;
  }
}

function addSupportSegment(out, base, path, source, text, compact = false) {
  const value = String(text ?? "");
  if (!cleanText(value)) return;
  out.push({ ...base, path: path || "(root)", source, text: value, compact });
}

function isScalarArray(value) {
  return Array.isArray(value) && value.length > 0 && value.length <= 24 &&
    value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item) && String(item).length <= 120);
}

// A string array keeps its exact JSON text. Other arrays separate items with ", " so that each
// number keeps its own boundaries.
function renderScalarArray(key, values) {
  if (values.every((item) => typeof item === "string")) return `${key}=${JSON.stringify(values)}`;
  return `${key}=[${values.map((item) => typeof item === "string" ? JSON.stringify(item) : String(item)).join(", ")}]`;
}

// Short scalar values carry their field name, so the span keeps the field relationship.
// Long text stays as written.
function scalarSegmentText(key, value) {
  const text = String(value);
  if (typeof value === "string" && (text.length > 120 || /\n/.test(text))) return text;
  return `${key || "value"}=${text}`;
}

// A small all-scalar object stays one segment, so its field name and values stay together.
function compactObjectText(key, entries) {
  if (!entries.length || entries.length > 8) return "";
  const scalar = ([, child]) =>
    child === null || (["string", "number", "boolean"].includes(typeof child) && String(child).length <= 80);
  if (!entries.every(scalar)) return "";
  return `${key}={${entries.map(([childKey, child]) => `${childKey}: ${child}`).join(" | ")}}`;
}

function walkSupportSegments(value, path, key, source, base, out, entryAv) {
  if (value === null || value === undefined) return;
  if (typeof value !== "object") {
    addSupportSegment(out, base, path, source, scalarSegmentText(key, value));
    return;
  }
  if (Array.isArray(value)) {
    if (isScalarArray(value)) {
      addSupportSegment(out, base, path, source, renderScalarArray(key || "values", value));
      return;
    }
    // The path keeps the index. The span label does not, so a generated index never reads as source text.
    value.forEach((item, index) => walkSupportSegments(item, `${path}[${index}]`, key || "item", source, base, out, entryAv));
    return;
  }
  const label = identityLabel(value) || source;
  const avSource = isAvSource(value, path, entryAv);
  const kept = Object.entries(value).filter(([childKey]) => !omitsAvDateField(value, childKey, avSource));
  const compact = key ? compactObjectText(key, kept) : "";
  if (compact) {
    addSupportSegment(out, base, path, label, compact, true);
    return;
  }
  for (const [childKey, child] of kept) {
    walkSupportSegments(child, path ? `${path}.${childKey}` : childKey, childKey, label, base, out, entryAv);
  }
}

function visibleObjectLabel(body, index) {
  const object = objectAt(body, index);
  if (object) return identityLabel(object.value);
  const start = enclosingObjectStartAt(body, index);
  if (start < 0) return "";
  const field = body
    .slice(start, index)
    .match(/"(?:title|name|fullName|label|slug|repo|repository)"\s*:\s*("(?:\\.|[^"\\]){1,200}")/);
  return field ? cleanText(parseJsonText(field[1]) ?? "") : "";
}

function scanSupportSegmentsFromText(body, base, out, entryAv) {
  const literalRe = /"(?:\\.|[^"\\])*"/y;
  let lastKey = "";
  for (let at = 0; at < body.length; at += 1) {
    if (body[at] !== '"') continue;
    literalRe.lastIndex = at;
    const match = literalRe.exec(body);
    if (!match) {
      // A clipped body ends inside this string. Keep its visible text as a cut segment.
      const raw = body.slice(at + 1).replace(/\\$/, "");
      const decoded = parseJsonText(`"${raw}"`) ?? raw;
      addSupportSegment(out, base, `visible-json.${lastKey || "value"}(cut)`, visibleObjectLabel(body, at), decoded);
      break;
    }
    const end = at + match[0].length;
    at = end - 1;
    const after = body.slice(end).match(/^\s*:/);
    if (after) {
      lastKey = parseJsonText(match[0]) ?? match[0].slice(1, -1);
      const rest = body.slice(end + after[0].length);
      const number = rest.match(/^\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false)\b/);
      const array = rest.match(/^\s*(\[[^\[\]{}"]*\])/);
      const values = array ? parseJsonText(array[1]) : null;
      const objectStart = rest.match(/^\s*\{/) ? end + after[0].length + rest.indexOf("{") : -1;
      const object = objectStart >= 0 ? parseJsonText(scanBalancedObjectAt(body, objectStart) || "null") : null;
      const avPath = isSupportedAvCollection(lastKey) ? lastKey : activeSupportedAvContainer(body, objectStart);
      const objectEntries = object && typeof object === "object" && !Array.isArray(object)
        ? Object.entries(object).filter(([childKey]) => !omitsAvDateField(object, childKey, isAvSource(object, avPath, entryAv)))
        : [];
      const compact = compactObjectText(lastKey, objectEntries);
      if (number) {
        addSupportSegment(out, base, `visible-json.${lastKey}`, visibleObjectLabel(body, match.index), `${lastKey}=${number[1]}`);
      } else if (compact) {
        addSupportSegment(out, base, `visible-json.${lastKey}`, visibleObjectLabel(body, match.index), compact, true);
      } else if (isScalarArray(values)) {
        addSupportSegment(out, base, `visible-json.${lastKey}`, visibleObjectLabel(body, match.index), renderScalarArray(lastKey, values));
      }
      continue;
    }
    const keyed = /:\s*$/.test(body.slice(Math.max(0, match.index - 40), match.index));
    if (
      keyed &&
      (classifiedAvDateFieldAt(body, match.index + 1, entryAv) ||
        (lastKey === "created_at" && (entryAv || activeSupportedAvContainer(body, match.index))))
    ) continue;
    const decoded = parseJsonText(match[0]);
    if (typeof decoded !== "string") continue;
    addSupportSegment(
      out,
      base,
      `visible-json.${lastKey || "value"}${keyed ? "" : "[]"}`,
      visibleObjectLabel(body, match.index),
      keyed ? scalarSegmentText(lastKey, decoded) : decoded
    );
  }
}

function collectSupportSegments(entries) {
  const segments = [];
  entries.forEach((entry, entryIndex) => {
    const parts = splitExecuteResult(entry.result);
    const base = {
      entryIndex,
      tool: cleanText(entry.tool ?? `entry#${entryIndex + 1}`),
      outcome: isErrorEntry(entry) ? "error" : "ok",
      truncated: parts.truncated
    };
    const entryAv = entryIsAv(entry);
    const textLines = (text) =>
      text.split(/\r?\n/).forEach((line, index) => addSupportSegment(segments, base, `text[${index}]`, "", line));
    const parsed = tryParseJsonPrefix(entry.result);
    const leading = parts.body.match(/^\s*/)[0].length;
    const prefix = parsed === null && parts.body[leading] === "{" ? scanBalancedObjectAt(parts.body, leading) : "";
    const prefixValue = prefix ? parseJsonText(prefix) : null;
    if (parsed !== null && typeof parsed === "object") {
      walkSupportSegments(parsed, "", "", "", base, segments, entryAv);
    } else if (prefixValue !== null && typeof prefixValue === "object") {
      // A complete JSON object followed by host text, such as an evidence checkpoint.
      walkSupportSegments(prefixValue, "", "", "", base, segments, entryAv);
      textLines(parts.body.slice(leading + prefix.length));
    } else if (/^\s*[\[{]/.test(parts.body)) {
      scanSupportSegmentsFromText(parts.body, base, segments, entryAv);
    } else {
      textLines(parts.body);
    }
  });
  return segments.map((segment, index) => {
    const lower = segment.text.toLowerCase();
    return { ...segment, index, lower, normalized: cleanText(lower) };
  });
}

function sharedPhraseAnchors(answer, ranges, segments, excluded) {
  const grams = new Set();
  for (const segment of segments) {
    const tokens = supportTokens(segment.text);
    for (let at = 0; at + PHRASE_ANCHOR_MIN_TOKENS <= tokens.length; at += 1) {
      grams.add(tokens.slice(at, at + PHRASE_ANCHOR_MIN_TOKENS).join(" "));
    }
  }
  const anchors = [];
  ranges.forEach((range, claimIndex) => {
    const tokens = [...answer.slice(range.start, range.end).matchAll(SUPPORT_TOKEN_RE)].map((match) => ({
      value: match[0].toLowerCase(),
      start: range.start + (match.index ?? 0),
      end: range.start + (match.index ?? 0) + match[0].length
    }));
    const inGram = (at) => grams.has(tokens.slice(at, at + PHRASE_ANCHOR_MIN_TOKENS).map((token) => token.value).join(" "));
    let perClaim = 0;
    let at = 0;
    while (at + PHRASE_ANCHOR_MIN_TOKENS <= tokens.length && perClaim < MAX_PHRASE_ANCHORS_PER_CLAIM) {
      if (!inGram(at)) {
        at += 1;
        continue;
      }
      let last = at;
      while (last + 1 + PHRASE_ANCHOR_MIN_TOKENS <= tokens.length && inGram(last + 1)) last += 1;
      const run = tokens.slice(at, last + PHRASE_ANCHOR_MIN_TOKENS);
      const content = run.filter((token) => token.value.length >= 3 && !PROSE_SUPPORT_STOP_WORDS.has(token.value));
      const start = run[0].start;
      const end = run.at(-1).end;
      if (
        content.length >= 2 &&
        content.some((token) => token.value.length >= 5 || /\d/.test(token.value)) &&
        !excluded.some((range) => start < range.end && range.start < end)
      ) {
        anchors.push({ value: cleanText(answer.slice(start, end)), kind: "phrase", index: start, claimIndex });
        perClaim += 1;
      }
      at = last + PHRASE_ANCHOR_MIN_TOKENS;
    }
  });
  return anchors.slice(0, MAX_PHRASE_ANCHORS);
}

// A single capitalized word counts only when it is capitalized somewhere other than a sentence,
// line, or list-item start. Sentence-initial capitals are not names.
function occursAsClaimTerm(answer, term) {
  if (/\s/.test(term) || !/^[A-Z][a-z]/.test(term)) return true;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, "gu");
  for (const match of answer.matchAll(re)) {
    const before = answer.slice(Math.max(0, (match.index ?? 0) - 12), match.index).replace(/[ \t*_#>`"'“‘(\[-]+$/u, "");
    if (before && !/(?:[.!?:]|\n|^\s*\d+[.)])$/.test(before)) return true;
  }
  return false;
}

/** Candidate anchors in deterministic claim-interleaved order. Exported for the replay diagnostics. */
export function claimSupportAnchors({ candidateAnswer = "", question = "", golden, segments = [] } = {}) {
  const answer = String(candidateAnswer ?? "");
  if (!answer.trim()) return [];
  const ranges = answerClaimRanges(answer);
  const lowerAnswer = answer.toLowerCase();
  const exact = new Set(exactSupportTerms(answer).map((term) => term.toLowerCase()));
  const quoted = quotedClauseAnchors(answer);
  const versions = versionAnchors(answer);
  const versionText = versions.map((anchor) => anchor.value).join(" ");
  const decimals = decimalAnchors(answer).filter((anchor) => !versionText.includes(anchor.value));
  // A bare number must occur on its own, not only as the day of a written date (Aug 26, 2026).
  const standsAlone = (term) =>
    anchorMatches({ value: term, kind: "exact" }, answer).some(({ start, end }) =>
      !WRITTEN_DATE_BEFORE_DAY.test(answer.slice(Math.max(0, start - 12), start)) &&
      !WRITTEN_DATE_AFTER_DAY.test(answer.slice(end, end + 12))
    );
  const terms = orderedUnique([
    ...extractCandidateClaimTerms({ candidateAnswer: answer, question, golden }),
    // Long exact terms such as URLs exceed the claim-term length cap but remain exact anchors.
    ...exactSupportTerms(answer).filter((term) => term.length > 90)
  ])
    .map((term) => (exact.has(term.toLowerCase()) ? term : term.replace(/[,;:]+$/, "")))
    // A bare number must stand alone in the answer, not only inside a decimal, date, or version.
    .filter((term) => !/^\d[\d,]*$/.test(term) || standsAlone(term))
    .filter((term) => exact.has(term.toLowerCase()) || (!/^(?:19|20)\d{2}$/.test(term) && occursAsClaimTerm(answer, term)))
    .map((value) => ({
      value,
      kind: exact.has(value.toLowerCase()) ? "exact" : "term",
      index: Math.max(0, lowerAnswer.indexOf(value.toLowerCase()))
    }));
  const excluded = quoted.map((anchor) => ({ start: anchor.index, end: anchor.index + anchor.value.length }));
  const phrases = sharedPhraseAnchors(answer, ranges, segments, excluded);
  const rank = { quoted: 0, version: 1, exact: 2, phrase: 3, term: 4 };
  // Specific anchors (quoted, version, exact, shared phrase) come before multi-word names, then
  // single words. Bare numbers come last: they carry no unit or name. Claims interleave inside each tier.
  const tier = (anchor) =>
    BARE_NUMBER_RE.test(anchor.value) ? 3 : anchor.kind !== "term" ? 0 : /\s/.test(anchor.value) ? 1 : 2;
  const seen = new Set();
  const byClaim = new Map();
  for (const anchor of [...quoted, ...versions, ...decimals, ...terms.filter((term) => term.kind === "exact"), ...phrases, ...terms.filter((term) => term.kind === "term")]) {
    const key = anchor.value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const claimIndex = anchor.claimIndex ?? claimIndexAt(ranges, anchor.index);
    const list = byClaim.get(claimIndex) ?? [];
    list.push({ ...anchor, claimIndex, rank: rank[anchor.kind] });
    byClaim.set(claimIndex, list);
  }
  const claims = [...byClaim.keys()].sort((a, b) => a - b);
  for (const claim of claims) byClaim.get(claim).sort((a, b) => a.rank - b.rank);
  const ordered = [];
  for (const level of [0, 1, 2, 3]) {
    const lists = claims.map((claim) => byClaim.get(claim).filter((anchor) => tier(anchor) === level));
    for (let round = 0; lists.some((list) => round < list.length); round += 1) {
      for (const list of lists) if (list[round]) ordered.push(list[round]);
    }
  }
  return ordered.map(({ rank: _rank, ...anchor }, id) => ({ ...anchor, id }));
}

function anchorOccurrences(anchors, segments) {
  const occurrences = anchors.map(() => []);
  const bySegment = new Map();
  for (const anchor of anchors) {
    const firstToken = supportTokens(anchor.value)[0] ?? "";
    for (const segment of segments) {
      if (occurrences[anchor.id].length >= MAX_SUPPORT_OCCURRENCES_PER_ANCHOR) break;
      if (firstToken && !segment.lower.includes(firstToken)) continue;
      for (const { start, end } of anchorMatches(anchor, segment.text, 4)) {
        const occurrence = { anchorId: anchor.id, segmentIndex: segment.index, start, end };
        occurrences[anchor.id].push(occurrence);
        const list = bySegment.get(segment.index) ?? [];
        list.push(occurrence);
        bySegment.set(segment.index, list);
      }
    }
  }
  return { occurrences, bySegment };
}

function isSentenceEnd(text, at) {
  return text[at] === "\n" || (/[.!?]/.test(text[at] ?? "") && (at + 1 >= text.length || /\s/.test(text[at + 1])));
}

function sentenceWindow(text, start, end, spanChars, whole = false) {
  if (whole) return centeredWindow(0, text.length, start, end, spanChars);
  let from = start;
  while (from > 0 && start - from <= spanChars && !isSentenceEnd(text, from - 1) && !(from >= 2 && isSentenceEnd(text, from - 2) && /\s/.test(text[from - 1]))) {
    from -= 1;
  }
  let to = end;
  while (to < text.length && to - end <= spanChars && !isSentenceEnd(text, to)) to += 1;
  if (to < text.length && /[.!?]/.test(text[to])) to += 1;
  return centeredWindow(from, to, start, end, spanChars);
}

// Keep [from, to) when it fits. Otherwise center a spanChars window on the match; never cut the match.
function centeredWindow(from, to, start, end, spanChars) {
  if (to - from <= spanChars) return { from, to };
  if (end - start >= spanChars) return { from: start, to: end };
  const before = Math.floor((spanChars - (end - start)) / 2);
  let windowFrom = Math.max(from, start - before);
  const windowTo = Math.min(to, windowFrom + spanChars);
  windowFrom = Math.max(from, windowTo - spanChars);
  return { from: windowFrom, to: windowTo };
}

function renderSupportSpan(segment, window) {
  const prefix = window.from > 0 ? "..." : "";
  const suffix = window.to < segment.text.length ? "..." : "";
  return cleanText(sanitizeUrlsInText(`${prefix}${segment.text.slice(window.from, window.to)}${suffix}`));
}

function anchorsInRenderedSpan(span, candidateIds, anchors) {
  return candidateIds.filter((id) => anchorMatches(anchors[id], span, 1).length > 0);
}

function buildSupportUnit({ occurrence, anchors, segments, bySegment, spanChars }) {
  const segment = segments[occurrence.segmentIndex];
  const window = sentenceWindow(segment.text, occurrence.start, occurrence.end, spanChars, segment.compact);
  const span = renderSupportSpan(segment, window);
  const inSegment = [...new Set((bySegment.get(segment.index) ?? []).map((item) => item.anchorId))].sort((a, b) => a - b);
  return {
    span,
    segment,
    covered: anchorsInRenderedSpan(span, inSegment, anchors),
    window
  };
}

function rankSupportCandidates({ anchor, candidates, anchors, covered, usedEntries, bySegment, spanChars, segments }) {
  return candidates
    .map((occurrence, order) => {
      const segment = segments[occurrence.segmentIndex];
      const window = sentenceWindow(segment.text, occurrence.start, occurrence.end, spanChars, segment.compact);
      const inWindow = new Set(
        (bySegment.get(segment.index) ?? [])
          .filter((item) => item.start >= window.from && item.end <= window.to)
          .map((item) => item.anchorId)
      );
      const ids = [...inWindow];
      return {
        occurrence,
        order,
        sameClaim: ids.filter((id) => anchors[id].claimIndex === anchor.claimIndex).length,
        gain: ids.filter((id) => !covered.has(id)).length,
        freshEntry: usedEntries.has(segment.entryIndex) ? 0 : 1
      };
    })
    .sort((a, b) =>
      b.sameClaim - a.sameClaim ||
      b.gain - a.gain ||
      b.freshEntry - a.freshEntry ||
      a.order - b.order
    );
}

function selectSupportUnits({ anchors, segments, occurrences, bySegment, spanChars }) {
  const covered = new Set();
  const usedEntries = new Set();
  const unrenderable = new Set();
  const units = [];
  const spans = new Set();
  for (const anchor of anchors) {
    if (covered.has(anchor.id) || !occurrences[anchor.id].length) continue;
    const ranked = rankSupportCandidates({
      anchor,
      candidates: occurrences[anchor.id],
      anchors,
      covered,
      usedEntries,
      bySegment,
      spanChars,
      segments
    });
    let placed = false;
    for (const { occurrence } of ranked) {
      const unit = buildSupportUnit({ occurrence, anchors, segments, bySegment, spanChars });
      if (!unit.covered.includes(anchor.id)) continue;
      units.push({ ...unit, primary: anchor.id, alternate: false });
      spans.add(unit.span.toLowerCase());
      usedEntries.add(unit.segment.entryIndex);
      unit.covered.forEach((id) => covered.add(id));
      placed = true;
      break;
    }
    // No rendered span keeps the anchor, for example when URL sanitization removes it.
    if (!placed) unrenderable.add(anchor.id);
  }
  let alternates = 0;
  for (const anchor of anchors) {
    if (alternates >= MAX_ALTERNATE_SUPPORT_UNITS) break;
    const shownEntries = new Set(units.filter((unit) => unit.covered.includes(anchor.id)).map((unit) => unit.segment.entryIndex));
    if (!shownEntries.size) continue;
    const other = occurrences[anchor.id].find((occurrence) => !shownEntries.has(segments[occurrence.segmentIndex].entryIndex));
    if (!other) continue;
    const unit = buildSupportUnit({ occurrence: other, anchors, segments, bySegment, spanChars });
    if (!unit.covered.includes(anchor.id) || spans.has(unit.span.toLowerCase())) continue;
    units.push({ ...unit, primary: anchor.id, alternate: true });
    spans.add(unit.span.toLowerCase());
    alternates += 1;
  }
  for (const unit of units) {
    const core = cleanText(unit.segment.text.slice(unit.window.from, unit.window.to)).toLowerCase();
    unit.alsoIn = core.length < 24 ? [] : unique(
      segments
        .filter((segment) => segment.entryIndex !== unit.segment.entryIndex && segment.normalized.includes(core))
        .map((segment) => segment.entryIndex)
    ).filter((entryIndex) => !units.some((other) => other !== unit && other.segment.entryIndex === entryIndex && other.span.toLowerCase() === unit.span.toLowerCase()));
  }
  return { units, unrenderable };
}

function supportUnitLines(unit, index, anchors) {
  const anchorList = unit.covered.map((id) => truncate(anchors[id].value, 60));
  const shown = anchorList.slice(0, 5).map((value) => JSON.stringify(value)).join(", ");
  const meta = [
    `${index + 1}. anchors=[${shown}${anchorList.length > 5 ? `, +${anchorList.length - 5} more` : ""}]`,
    `entry=${unit.segment.entryIndex + 1}`,
    // The calls line names each entry; a unit names only a direct tool and an error outcome.
    /(?:^|__)execute$/.test(unit.segment.tool) ? "" : `tool="${truncate(unit.segment.tool, 80)}"`,
    unit.segment.outcome === "error" ? "outcome=error" : "",
    unit.segment.truncated ? "sourceTruncated=yes" : "",
    `path="${truncate(unit.segment.path, 90)}"`,
    unit.segment.source ? `source="${truncate(unit.segment.source, 100)}"` : "",
    unit.alsoIn.length ? `alsoIn=${unit.alsoIn.map((entryIndex) => entryIndex + 1).join(",")}` : "",
    unit.alternate ? "role=other-source" : ""
  ].filter(Boolean).join(" ");
  return [meta, `   span: ${unit.span}`];
}

// Listing order: clauses and names first, then dates and amounts, then bare numbers.
function omissionListRank(anchor) {
  if (BARE_NUMBER_RE.test(anchor.value)) return 2;
  return /^\$?\s?\d/.test(anchor.value) ? 1 : 0;
}

function supportOmissionLine(omitted, anchors, occurrences, segments, unrenderable) {
  if (!omitted.length) return "claimSupportOmitted: none";
  const ordered = [...omitted].sort((a, b) => omissionListRank(anchors[a]) - omissionListRank(anchors[b]) || a - b);
  const listed = ordered.slice(0, MAX_LISTED_SUPPORT_OMISSIONS).map((id) => {
    const entriesSeen = unique(occurrences[id].map((occurrence) => segments[occurrence.segmentIndex].entryIndex + 1));
    const reason = unrenderable.has(id) ? "; no rendered span keeps it, such as a URL part that sanitization removes" : "";
    return `${JSON.stringify(truncate(anchors[id].value, 60))} (entry=${entriesSeen.slice(0, 4).join(",")}${reason})`;
  });
  const more = omitted.length > listed.length ? `; +${omitted.length - listed.length} more` : "";
  return `claimSupportOmitted: ${omitted.length} candidate anchors occur in execute results, but their spans did not fit the pack; an occurrence alone does not establish a claim, and a listed anchor can belong to a different record: ${listed.join("; ")}${more}`;
}

function shapeLine(entries, sourceCount) {
  const totalChars = entries.reduce((sum, entry) => sum + (entry.resultChars ?? String(entry.result ?? "").length), 0);
  const truncated = entries.filter((entry) => splitExecuteResult(entry.result).truncated).length;
  const errored = entries.filter((entry) => entry.isError || /^Execution failed:/i.test(String(entry.result ?? ""))).length;
  return `capturedResults=${entries.length}; resultChars=${totalChars}; truncated=${truncated}; errors=${errored}; sourceItems=${sourceCount}`;
}

function callsLine(entries) {
  if (!entries.length) return "none";
  return entries
    .map((entry, index) => {
      const chars = entry.resultChars ?? String(entry.result ?? "").length;
      const outcome = entry.isError || /^Execution failed:/i.test(String(entry.result ?? "")) ? "error" : "ok";
      return `execute#${index + 1}=${outcome}/${chars} chars`;
    })
    .join("; ");
}

function canonicalUrlsLine(items, limit) {
  const urls = unique(items.map((item) => item.url)).slice(0, limit);
  if (!urls.length) return "none (data-derived/untrusted; https-only after sanitization)";
  return `data-derived/untrusted; ${urls.join("; ")}${items.filter((item) => item.url).length > urls.length ? ` (+${items.filter((item) => item.url).length - urls.length} more)` : ""}`;
}

function citedSourceItems(items, candidateAnswer) {
  const cited = [];
  const seen = new Set();
  for (const url of exactSupportTerms(candidateAnswer).filter((term) => /^https:\/\//i.test(term))) {
    const item = items.find((candidate) =>
      [candidate.url, ...candidate.alternateUrls].some((candidateUrl) => containsExactSupport(candidateUrl, url))
    );
    if (!item || seen.has(item)) continue;
    seen.add(item);
    cited.push(item);
  }
  return cited;
}

function citedSourcesLine(items, candidateAnswer) {
  const sources = [];
  const seen = new Set();
  for (const item of citedSourceItems(items, candidateAnswer)) {
    if (!item?.title) continue;
    const key = item.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push(
      `title=${JSON.stringify(truncate(item.title, 140))}${item.url ? ` url=${JSON.stringify(truncate(item.url, 180))}` : ""}`
    );
    if (sources.length >= MAX_CITED_SOURCE_TITLES) break;
  }
  return sources.length ? sources.join("; ") : "none";
}

function citedSourceFieldsLine(items, candidateAnswer) {
  const fields = [];
  for (const item of citedSourceItems(items, candidateAnswer)) {
    for (const field of item.fields) {
      const key = field.slice(0, field.indexOf("="));
      if (scalarFieldPriority(key) <= 1) continue;
      fields.push(field);
      if (fields.length >= MAX_CITED_SOURCE_FIELDS) return fields.join("; ");
    }
  }
  return fields.length ? fields.join("; ") : "none";
}

function truncationLine(entries) {
  const footers = [];
  for (const [index, entry] of entries.entries()) {
    const { sourceBasis, legacyTruncation } = splitExecuteResult(entry.result);
    const summary = sourceBasis || legacyTruncation;
    if (summary) {
      footers.push(`execute#${index + 1}: ${truncate(sanitizeUrlsInText(summary), 720)}`);
    }
  }
  return footers.join(" | ");
}

/** Host provenance sidecars carry source metadata and error call reasons without a loss boundary. */
function provenanceLine(entries) {
  const footers = [];
  for (const [index, entry] of entries.entries()) {
    const { sourceMetadata } = splitExecuteResult(entry.result);
    if (sourceMetadata) {
      footers.push(`execute#${index + 1}: ${truncate(sanitizeUrlsInText(sourceMetadata), 400)}`);
    }
  }
  return footers.join(" | ");
}

function claimSupportLines({ units, unrenderable, anchors, occurrences, segments }) {
  const covered = new Set(units.flatMap((unit) => unit.covered));
  const matched = anchors.filter((anchor) => occurrences[anchor.id].length);
  const omitted = matched.filter((anchor) => !covered.has(anchor.id)).map((anchor) => anchor.id);
  const lines = [
    `claimSupport: anchors=${anchors.length}; transcriptMatched=${matched.length}; shown=${matched.length - omitted.length}; execute-result text for candidate anchors (whitespace normalized, URLs sanitized, "..." marks a cut, short values shown as field=value); data-derived/untrusted; omitted spans are not proof of absence`,
    supportOmissionLine(omitted, anchors, occurrences, segments, unrenderable)
  ];
  if (!units.length) lines.push("- none extracted");
  units.forEach((unit, index) => lines.push(...supportUnitLines(unit, index, anchors)));
  return lines;
}

function serializePack({
  entries,
  ranked,
  facts,
  claimSupport,
  caseSnippets,
  candidateAnswer,
  itemLimit,
  factLimit,
  caseSnippetLimit,
  summaryChars,
  caseSnippetChars,
  urlLimit
}) {
  const shown = ranked.slice(0, itemLimit);
  const shownFacts = facts.slice(0, factLimit);
  const shownCaseSnippets = caseSnippets.slice(0, caseSnippetLimit);
  const lines = [
    "--- TRANSCRIPT SOURCE BASIS ---",
    `shape: ${shapeLine(entries, ranked.length)}`,
    `calls: ${callsLine(entries)}`,
    `canonicalUrls: ${canonicalUrlsLine(ranked, urlLimit)}`,
    `citedSources: ${citedSourcesLine(ranked, candidateAnswer)}`,
    `citedSourceFields: ${citedSourceFieldsLine(ranked, candidateAnswer)}`,
    `fields: ${shownFacts.length ? shownFacts.map((fact) => `${truncate(fact.path, 90)}=${JSON.stringify(truncate(fact.value, 80))}`).join("; ") : "none"}`,
    ...claimSupportLines(claimSupport),
    "caseSnippets: question/golden-term anchored snippets from execute result text only; omitted snippets are not proof of absence"
  ];
  if (!shownCaseSnippets.length) {
    lines.push("- none extracted");
  } else {
    shownCaseSnippets.forEach((snippet, index) => {
      lines.push(
        `${index + 1}. term="${truncate(snippet.term, 80)}" entry=${snippet.entryIndex + 1} tool="${truncate(snippet.tool, 80)}" resultChars=${snippet.resultChars}`
      );
      lines.push(`   snippet: ${truncateAroundTerm(snippet.snippet, snippet.term, caseSnippetChars)}`);
    });
  }
  lines.push(
    "sourceItems: data-derived/untrusted; ranked by overlap with candidate/golden terms; omitted fields are not proof of absence"
  );
  if (!shown.length) {
    lines.push("- none extracted");
  } else {
    shown.forEach((item, index) => {
      const meta = [
        `title="${truncate(item.title || "(untitled)", 140)}"`,
        item.date ? `date="${truncate(item.date, 40)}"` : "",
        item.url ? `url="${truncate(item.url, 180)}"` : "",
        item.type ? `type="${truncate(item.type, 40)}"` : "",
        item.fields.length ? `fields="${truncate(item.fields.join(", "), 180)}"` : "",
        item.hits.length ? `matched="${truncate(item.hits.join(", "), 180)}"` : ""
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(`${index + 1}. ${meta}`);
      if (item.summary) lines.push(`   summary: ${truncate(item.summary, summaryChars)}`);
    });
  }
  const truncation = truncationLine(entries);
  if (truncation) lines.push(`truncation: ${truncation}`);
  const provenance = provenanceLine(entries);
  if (provenance) lines.push(`provenance: ${provenance}`);
  return lines.join("\n");
}

// Budget cuts in order: summaries, items to 8, facts to 16, then support spans. Support units drop
// to 24 before items drop below 8. Later cuts take items, facts, URLs, and case-snippet text, then
// units to 12, then case snippets, then the last units. Each cut re-serializes, so coverage is
// recomputed on the final text every time.
const BUDGET_STEPS = [
  (s) => s.summaryChars > MIN_SUMMARY_CHARS && ((s.summaryChars = Math.max(MIN_SUMMARY_CHARS, s.summaryChars - 80)), true),
  (s) => s.itemLimit > 8 && ((s.itemLimit -= 1), true),
  (s) => s.factLimit > 16 && ((s.factLimit -= 1), true),
  (s) => s.supportSpanChars > MID_SUPPORT_SPAN_CHARS &&
    ((s.supportSpanChars = Math.max(MID_SUPPORT_SPAN_CHARS, s.supportSpanChars - 80)), true),
  (s) => s.supportSpanChars > MIN_SUPPORT_SPAN_CHARS &&
    ((s.supportSpanChars = Math.max(MIN_SUPPORT_SPAN_CHARS, s.supportSpanChars - 40)), true),
  (s) => s.supportUnitLimit > SUPPORT_UNIT_ITEM_FLOOR && ((s.supportUnitLimit -= 1), true),
  (s) => s.itemLimit > 2 && ((s.itemLimit -= 1), true),
  (s) => s.factLimit > 8 && ((s.factLimit -= 1), true),
  (s) => s.urlLimit > 4 && ((s.urlLimit -= 1), true),
  (s) => s.caseSnippetChars > MIN_CLAIM_SNIPPET_CHARS &&
    ((s.caseSnippetChars = Math.max(MIN_CLAIM_SNIPPET_CHARS, s.caseSnippetChars - 80)), true),
  (s) => s.supportUnitLimit > SUPPORT_UNIT_FLOOR && ((s.supportUnitLimit -= 1), true),
  (s) => s.caseSnippetLimit > 0 && ((s.caseSnippetLimit -= 1), true),
  (s) => s.supportUnitLimit > 0 && ((s.supportUnitLimit -= 1), true)
];

function claimSupportInputs({ entries, candidateAnswer, question, golden }) {
  const segments = collectSupportSegments(entries);
  const anchors = claimSupportAnchors({ candidateAnswer, question, golden, segments });
  const { occurrences, bySegment } = anchorOccurrences(anchors, segments);
  return { segments, anchors, occurrences, bySegment };
}

export function buildTranscriptEvidencePack({
  transcript = [],
  candidateAnswer = "",
  question = "",
  golden,
  tags,
  maxChars = EVIDENCE_PACK_MAX_CHARS
}) {
  if (!shouldIncludeTranscriptEvidence(tags)) return "";
  const entries = executeEntries(transcript);
  if (!entries.length) return "";

  const terms = extractEvidenceTerms({ candidateAnswer, golden });
  const factTerms = orderedUnique([...exactSupportTerms(candidateAnswer), ...terms]);
  const items = collectSourceItems(entries);
  const ranked = prioritizeItemsForCandidateExactTerms(rankedItems(items, terms), candidateAnswer);
  const facts = prioritizeFactsForExactTerms(
    [
      ...collectVerbatimClaimFacts(entries, verbatimClaimTerms(candidateAnswer)),
      ...collectRelevantFacts(entries, factTerms)
    ],
    candidateAnswer
  );
  const caseTerms = extractCaseEvidenceTerms({ candidateAnswer, question, golden });
  const caseSnippets = selectClaimSnippetsForCoverage(
    collectClaimSnippets(entries, caseTerms),
    caseTerms,
    INITIAL_MAX_CASE_SNIPPETS
  );
  const support = claimSupportInputs({ entries, candidateAnswer, question, golden });
  const unitsBySpan = new Map();
  const supportUnitsAt = (spanChars) => {
    if (!unitsBySpan.has(spanChars)) unitsBySpan.set(spanChars, selectSupportUnits({ ...support, spanChars }));
    return unitsBySpan.get(spanChars);
  };

  const state = {
    itemLimit: Math.min(ranked.length, INITIAL_MAX_ITEMS),
    factLimit: Math.min(facts.length, INITIAL_MAX_FACTS),
    caseSnippetLimit: caseSnippets.length,
    summaryChars: INITIAL_SUMMARY_CHARS,
    caseSnippetChars: INITIAL_CLAIM_SNIPPET_CHARS,
    supportSpanChars: INITIAL_SUPPORT_SPAN_CHARS,
    supportUnitLimit: Number.POSITIVE_INFINITY,
    urlLimit: MAX_CANONICAL_URLS
  };
  for (;;) {
    const { units, unrenderable } = supportUnitsAt(state.supportSpanChars);
    state.supportUnitLimit = Math.min(state.supportUnitLimit, units.length);
    const text = serializePack({
      entries,
      ranked,
      facts,
      claimSupport: { ...support, unrenderable, units: units.slice(0, state.supportUnitLimit) },
      caseSnippets,
      candidateAnswer,
      itemLimit: state.itemLimit,
      factLimit: state.factLimit,
      caseSnippetLimit: state.caseSnippetLimit,
      summaryChars: state.summaryChars,
      caseSnippetChars: state.caseSnippetChars,
      urlLimit: state.urlLimit
    });
    if (text.length <= maxChars) return text;
    if (BUDGET_STEPS.some((step) => step(state))) continue;
    return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
  }
}

export { EVIDENCE_PACK_MAX_CHARS };
