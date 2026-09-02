const EVIDENCE_PACK_MAX_CHARS = 12000;
// p6 omits A/V created_at from source dates and retains the p5 evidence boundaries.
export const PACK_VERSION = "p6";
const MAX_CANONICAL_URLS = 8;
const MAX_CITED_SOURCE_TITLES = 24;
const MAX_CITED_SOURCE_FIELDS = 24;
const INITIAL_MAX_ITEMS = 18;
const INITIAL_MAX_FACTS = 28;
const INITIAL_MAX_CLAIM_SNIPPETS = 12;
const INITIAL_SUMMARY_CHARS = 520;
const MIN_SUMMARY_CHARS = 180;
const INITIAL_CLAIM_SNIPPET_CHARS = 520;
const MIN_CLAIM_SNIPPET_CHARS = 260;
const SOURCE_BASIS_MARKER = "\n--- SOURCE BASIS ---";
// Host provenance sidecar on untruncated results (src/policy/source-basis.ts).
// A loss boundary signal, unlike SOURCE BASIS: it does not set `truncated`.
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
  if (/\b[a-z]+(?:[A-Z][A-Za-z0-9]+)+\b/.test(term)) return 12;
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
    /^[a-z]+(?:[A-Z][A-Za-z0-9]+)+$/.test(value) ||
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

function overlapsSourceItem(snippet, rankedItemsForDedupe) {
  const normalized = cleanText(snippet).toLowerCase();
  if (normalized.length < 80) return false;
  return rankedItemsForDedupe.some((item) => {
    const text = sourceItemText(item).toLowerCase();
    if (!text) return false;
    const sample = normalized.slice(0, Math.min(180, normalized.length));
    return text.includes(sample) || normalized.includes(text.slice(0, Math.min(180, text.length)));
  });
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

function collectClaimSnippets(entries, claimTerms, rankedItemsForDedupe) {
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
        if (!seen.has(key) && !overlapsSourceItem(snippet, rankedItemsForDedupe)) {
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
  return orderedUnique(
    [...String(text ?? "").matchAll(/\b[A-Z][A-Za-z0-9.-]*(?:-[A-Z][A-Za-z0-9.-]*)+\s+\d+(?:\.\d+)+\b/g)]
      .map((match) => match[0])
  );
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
  for (const match of input.matchAll(/\b[a-z]+(?:[A-Z][A-Za-z0-9]+)+\b/g)) add(match[0]);
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
  return {
    status: omittedTerms.length ? "pack-omission" : "no-pack-omission",
    requiresReview: omittedTerms.length > 0,
    checkedClaims: claims.length,
    checkedTerms: exactTerms.length,
    transcriptSupportedTerms: supportedTerms.length,
    omittedTerms
  };
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

/** Host provenance sidecars are NOT loss boundaries; they carry as-of/matchMode. */
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

function serializePack({
  entries,
  ranked,
  facts,
  claimSnippets,
  candidateAnswer,
  itemLimit,
  factLimit,
  claimSnippetLimit,
  summaryChars,
  claimSnippetChars,
  urlLimit
}) {
  const shown = ranked.slice(0, itemLimit);
  const shownFacts = facts.slice(0, factLimit);
  const shownClaimSnippets = claimSnippets.slice(0, claimSnippetLimit);
  const lines = [
    "--- TRANSCRIPT SOURCE BASIS ---",
    `shape: ${shapeLine(entries, ranked.length)}`,
    `calls: ${callsLine(entries)}`,
    `canonicalUrls: ${canonicalUrlsLine(ranked, urlLimit)}`,
    `citedSources: ${citedSourcesLine(ranked, candidateAnswer)}`,
    `citedSourceFields: ${citedSourceFieldsLine(ranked, candidateAnswer)}`,
    `fields: ${shownFacts.length ? shownFacts.map((fact) => `${truncate(fact.path, 90)}=${JSON.stringify(truncate(fact.value, 80))}`).join("; ") : "none"}`,
    "claimSnippets: candidate-claim anchored snippets from execute result text only; omitted snippets are not proof of absence"
  ];
  if (!shownClaimSnippets.length) {
    lines.push("- none extracted");
  } else {
    shownClaimSnippets.forEach((snippet, index) => {
      lines.push(
        `${index + 1}. term="${truncate(snippet.term, 80)}" entry=${snippet.entryIndex + 1} tool="${truncate(snippet.tool, 80)}" resultChars=${snippet.resultChars}`
      );
      lines.push(`   snippet: ${truncateAroundTerm(snippet.snippet, snippet.term, claimSnippetChars)}`);
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
  const claimTerms = extractCandidateClaimTerms({ candidateAnswer, question, golden });
  const caseTerms = extractCaseEvidenceTerms({ candidateAnswer, question, golden });
  const guaranteedItems = ranked.slice(0, 2);
  const candidateSnippets = selectClaimSnippetsForCoverage(
    collectClaimSnippets(entries, claimTerms, guaranteedItems),
    claimTerms,
    8
  );
  const caseSnippets = selectClaimSnippetsForCoverage(
    collectClaimSnippets(entries, caseTerms, guaranteedItems),
    caseTerms,
    4
  );
  const claimSnippets = [...candidateSnippets, ...caseSnippets];

  let itemLimit = Math.min(ranked.length, INITIAL_MAX_ITEMS);
  let factLimit = Math.min(facts.length, INITIAL_MAX_FACTS);
  let claimSnippetLimit = Math.min(claimSnippets.length, INITIAL_MAX_CLAIM_SNIPPETS);
  let summaryChars = INITIAL_SUMMARY_CHARS;
  let claimSnippetChars = INITIAL_CLAIM_SNIPPET_CHARS;
  let urlLimit = MAX_CANONICAL_URLS;
  for (;;) {
    const text = serializePack({
      entries,
      ranked,
      facts,
      claimSnippets,
      candidateAnswer,
      itemLimit,
      factLimit,
      claimSnippetLimit,
      summaryChars,
      claimSnippetChars,
      urlLimit
    });
    if (text.length <= maxChars) return text;
    if (summaryChars > MIN_SUMMARY_CHARS) {
      summaryChars = Math.max(MIN_SUMMARY_CHARS, summaryChars - 80);
      continue;
    }
    if (itemLimit > 2) {
      itemLimit -= 1;
      continue;
    }
    if (factLimit > 8) {
      factLimit -= 1;
      continue;
    }
    if (urlLimit > 4) {
      urlLimit -= 1;
      continue;
    }
    if (claimSnippetChars > MIN_CLAIM_SNIPPET_CHARS) {
      claimSnippetChars = Math.max(MIN_CLAIM_SNIPPET_CHARS, claimSnippetChars - 80);
      continue;
    }
    if (claimSnippetLimit > 0) {
      claimSnippetLimit -= 1;
      continue;
    }
    return text.length <= maxChars ? text : `${text.slice(0, Math.max(0, maxChars - 3))}...`;
  }
}

export { EVIDENCE_PACK_MAX_CHARS };
