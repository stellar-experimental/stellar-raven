/**
 * evidence-sanitizer.mjs — bounded, credential-free evidence for judge CLI
 * failures (eval/qa/judge.mjs).
 *
 * A failed `claude -p` run is recorded verbatim into a results file that is
 * committed and shared, so its stdout/stderr may carry whatever the CLI
 * printed: an `ANTHROPIC_API_KEY=…` line, a `Bearer` header, a URL with
 * userinfo, a whole environment dump. This module turns those raw bytes into
 * evidence that is safe to keep: it decodes them without losing the control
 * bytes a credential can hide behind, redacts credentials in plaintext and in
 * structured JSON, and bounds the result to a fixed byte budget while
 * recording the untouched byte count and SHA-256 of the original.
 *
 * Entry points:
 *   buildCliEvidence(stdoutOrStderr) → { excerpt, truncated, totalBytes, sha256 }
 *   buildStructuredEvidence(parsedEnvelope) → the same shape, JSON-structural
 *   sanitizeBoundedText(text, limit) → one bounded sanitized string
 *   sanitizeCliEvidenceText(text) / decodeCliEvidenceText(bytes) → the pieces,
 *     exported for focused regression tests.
 */
import { createHash } from "node:crypto";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const CLI_EVIDENCE_EXCERPT_BYTES = 8_192;
const CLI_EVIDENCE_TRUNCATION_MARKER = "\n…[truncated]…\n";

function utf8HeadEnd(buffer, end) {
  if (end >= buffer.length) return buffer.length;
  let lead = end - 1;
  while (lead >= 0 && (buffer[lead] & 0xc0) === 0x80) lead -= 1;
  if (lead < 0) return end;
  const byte = buffer[lead];
  const width = byte < 0x80 ? 1 : byte < 0xe0 ? 2 : byte < 0xf0 ? 3 : byte < 0xf8 ? 4 : 1;
  return end - lead < width ? lead : end;
}

function utf8TailStart(buffer, start) {
  while (start < buffer.length && (buffer[start] & 0xc0) === 0x80) start += 1;
  return start;
}

function boundedUtf8Excerpt(buffer, limit = CLI_EVIDENCE_EXCERPT_BYTES) {
  if (buffer.length <= limit) return { excerpt: buffer.toString("utf8"), truncated: false };

  const markerBytes = Buffer.byteLength(CLI_EVIDENCE_TRUNCATION_MARKER);
  const contentBytes = limit - markerBytes;
  const headBudget = Math.ceil(contentBytes / 2);
  const tailBudget = Math.floor(contentBytes / 2);
  const headEnd = utf8HeadEnd(buffer, headBudget);
  const tailStart = utf8TailStart(buffer, buffer.length - tailBudget);
  return {
    excerpt:
      buffer.subarray(0, headEnd).toString("utf8") +
      CLI_EVIDENCE_TRUNCATION_MARKER +
      buffer.subarray(tailStart).toString("utf8"),
    truncated: true
  };
}

function streamBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value == null) return Buffer.alloc(0);
  return Buffer.from(String(value));
}

// Length of the well-formed UTF-8 sequence starting at `index`, or 0 when the
// byte does not start one. Overlong forms, surrogate halves, and out-of-range
// leads are rejected the same way a UTF-8 decoder rejects them, so only text
// that really is UTF-8 is treated as UTF-8.
function utf8SequenceLength(buffer, index) {
  const lead = buffer[index];
  if (lead < 0x80) return 1;
  if (lead < 0xc2 || lead > 0xf4) return 0;
  const length = lead <= 0xdf ? 2 : lead <= 0xef ? 3 : 4;
  if (index + length > buffer.length) return 0;
  for (let offset = 1; offset < length; offset += 1) {
    const byte = buffer[index + offset];
    if (byte < 0x80 || byte > 0xbf) return 0;
  }
  const second = buffer[index + 1];
  if (length === 3 && lead === 0xe0 && second < 0xa0) return 0;
  if (length === 3 && lead === 0xed && second > 0x9f) return 0;
  if (length === 4 && lead === 0xf0 && second < 0x90) return 0;
  if (length === 4 && lead === 0xf4 && second > 0x8f) return 0;
  return length;
}

// Decode captured CLI bytes without losing raw C1 controls.
//
// `Buffer.toString("utf8")` is lossy for them: a lone 0x9b is not valid UTF-8,
// so it decodes to U+FFFD and the 8-bit CSI introducer is gone before the
// sanitizer ever runs — a credential split by a raw C1 byte would survive into
// the excerpt. Sanitizing has to see the byte, so decoding happens here first:
// every well-formed UTF-8 sequence is decoded verbatim (including sequences
// whose continuation bytes fall inside 0x80-0x9f, such as `→` = E2 86 92), an
// invalid byte in 0x80-0x9f becomes its C1 code point, and any other invalid
// byte becomes U+FFFD as before. This only affects the sanitized excerpt; the
// recorded byte count and SHA-256 are always taken from the raw buffer.
export function decodeCliEvidenceText(value) {
  const buffer = streamBuffer(value);
  let out = "";
  let runStart = 0;
  let index = 0;
  const flushRun = (end) => {
    if (end > runStart) out += buffer.toString("utf8", runStart, end);
  };
  while (index < buffer.length) {
    const length = utf8SequenceLength(buffer, index);
    if (length > 0) {
      index += length;
      continue;
    }
    flushRun(index);
    const byte = buffer[index];
    out += byte >= 0x80 && byte <= 0x9f ? String.fromCharCode(byte) : "�";
    index += 1;
    runStart = index;
  }
  flushRun(index);
  return out;
}

const REDACTED = "[redacted]";

// Redaction events performed by the sanitizer. Counted at the source so the
// choice between variants never depends on marker text in the input.
function newRedactionTally() {
  return { count: 0 };
}

function redactedLeaf(tally) {
  tally.count += 1;
  return REDACTED;
}
const MAX_JSON_DEPTH = 64;
const MAX_JSON_ARRAY_LENGTH = 1_000;
const SECRET_PREFIX_RE =
  /^(?:sk|pk|rk|xox[abeoprs]|gh[opusr]|github_pat|glpat|shpat|shpss|npm|dop_v1|sq0atp|sq0csp)[-_]/i;
const AUTH_SCHEME_RE = /^(?:Bearer|Basic|Token)$/i;
// Common credential-name terms shared by the structured key predicate and the
// plaintext name source so both surfaces stay consistent: prompt/token/auth,
// API and cloud keys (api_key, PRIVATE_KEY, AWS_ACCESS_KEY_ID), secrets,
// passwords, credentials, and connection URLs (DATABASE_URL).
const SENSITIVE_TERM_SOURCE =
  "(?:prompt|token|authorization|api[-_]?key|private[-_]?key|access[-_]?key|secret|password|credential|database[-_]?url)";
const SENSITIVE_KEY_RE = new RegExp(SENSITIVE_TERM_SOURCE, "i");
const SENSITIVE_EXACT_KEY_RE = /^(?:env|environment)$/i;
// Usage counters carry the word "token" but hold no secret. Only these exact
// keys, and only when their value is a finite number, survive the sensitive-key
// rule. A string under one of these keys is still redacted, and plaintext has
// no value type, so the allowlist applies to structured values only.
const USAGE_COUNT_KEYS = new Set([
  "cache_creation_input_tokens",
  "cache_read_input_tokens",
  "input_tokens",
  "output_tokens",
  "total_tokens"
]);

function isUsageCount(key, value) {
  return USAGE_COUNT_KEYS.has(key) && typeof value === "number" && Number.isFinite(value);
}

function isSensitiveKey(key) {
  return SENSITIVE_EXACT_KEY_RE.test(key) || SENSITIVE_KEY_RE.test(key);
}

function hasControlCharacter(key) {
  for (let index = 0; index < key.length; index += 1) {
    const code = key.charCodeAt(index);
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

// A property name is classified on its control-stripped form: an embedded NUL
// or escape in `API<NUL>_KEY` hides the credential term from the key predicate
// while a reader still sees API_KEY. Normalization is used for classification
// only, and never becomes the emitted name.
//
// What the emitted object keeps depends on the name. An ordinary name survives
// unchanged, obfuscating bytes included, because an obfuscated key is itself
// evidence; classifying it sensitive collapses only its VALUE. A name that
// CARRIES a credential is a different case: emitKeyName rewrites it, so the
// emitted name is the scanned form, not the original.
//
// `truncated` is carried out with the name. An unterminated control sequence in
// a name swallows whatever follows it, so `API<ESC>]0;x_KEY` normalizes to a
// harmless-looking `API` while the sensitive suffix is simply gone. The name
// cannot be classified at all in that case, so the caller fails closed the same
// way the text sanitizer does.
//
// The fast path is exact: stripCredentialObfuscation changes nothing, and can
// report no truncation, for a name that holds no C0 or C1 control character.
function normalizeKeyForClassification(key) {
  if (!hasControlCharacter(key)) return { name: key, truncated: false };
  const normalized = stripCredentialObfuscation(key);
  return { name: normalized.text, truncated: normalized.truncated };
}

// A property NAME can carry the credential itself: `{"PASSWORD=SECRET": ...}`
// leaks in key position, and so do a bare secret-prefixed token, a
// `Bearer <token>` header line, and URL userinfo. The name therefore runs
// through the same credential scanner as a string leaf. An ordinary name scans
// clean and is emitted unchanged — `API_KEY` on its own is a name, not an
// assignment, so it keeps its spelling while the key predicate collapses its
// VALUE.
//
// Two different secret names can scan to the same marker, and the second write
// would silently drop the first field. A collision therefore takes the next
// free positional suffix. The suffix counts emitted names and says nothing
// about the key it replaced — never a digest of it, which would hand back the
// secret to anyone able to test a guess.
function emitKeyName(key, keyNames, tally) {
  const scanned = sanitizeStructuredStringLeaf(key);
  tally.count += scanned.redactions;
  const base = scanned.sanitized;
  // Resume from this base's next free suffix instead of restarting the search
  // at 2. Restarting costs a scan per collision — about N^2/2 lookups for N
  // names that scan to the same marker, which is tens of seconds at 20k keys.
  // The counter only ever moves forward, so the total stays linear in the
  // number of keys. The inner loop steps over the rare case where a generated
  // name is already taken by an unrelated base, and each step advances this
  // base's counter permanently.
  let suffix = keyNames.nextSuffix.get(base) ?? 1;
  let name = suffix === 1 ? base : `${base}-${suffix}`;
  while (keyNames.used.has(name)) {
    suffix += 1;
    name = `${base}-${suffix}`;
  }
  keyNames.nextSuffix.set(base, suffix + 1);
  keyNames.used.add(name);
  return name;
}

// HTTP auth schemes are case-insensitive (RFC 9110), so `bearer <token>` and
// `bAsIc <base64>` carry exactly the same credential as the capitalized
// spelling and must redact the same way. The single exception is a bare
// all-lowercase `token`, which is ordinary prose in CLI diagnostics
// ("token expired before retry") far more often than a scheme; `Token`,
// `TOKEN`, and any mixed spelling are still treated as the scheme.
const PROSE_SCHEME_WORD = "token";

function isAuthScheme(name) {
  return AUTH_SCHEME_RE.test(name) && name !== PROSE_SCHEME_WORD;
}

const ESCAPE = 0x1b;
const BELL = 0x07;
const C1_CSI = 0x9b;
const C1_STRING_TERMINATOR = 0x9c;
// ESC-introduced control strings: DCS, SOS, OSC, PM, APC. Each runs to a string
// terminator rather than to a final byte in a fixed range. BEL terminates OSC
// only (the xterm convention); inside DCS, SOS, PM, and APC it is ordinary
// payload, so those four require ESC-ST or C1-ST.
const OSC_INTRODUCER = "]";
const STRING_INTRODUCERS = new Set(["P", "X", "]", "^", "_"]);
// The same five introducers in their single-byte C1 spelling.
const C1_OSC_INTRODUCER = 0x9d;
const C1_STRING_INTRODUCERS = new Set([0x90, 0x98, 0x9d, 0x9e, 0x9f]);
const KEPT_CONTROLS = new Set(["\n", "\r", "\t"]);

// Each skip* helper returns the cursor plus whether the form ran off the end of
// the text without its terminator. An unterminated form hides an unbounded tail
// from a terminal but not from the file, so the caller redacts that tail rather
// than dropping it (dropping would lower the redaction count and hand the
// choice back to the un-stripped original, which still carries the secret).
function skipControlSequence(text, index) {
  while (index < text.length) {
    const code = text.charCodeAt(index);
    index += 1;
    if (code >= 0x40 && code <= 0x7e) return { index, truncated: false };
  }
  return { index, truncated: true };
}

// A control string runs to 7-bit ST (ESC \) or C1 ST (U+009C), and — for OSC
// only — to BEL. Honouring BEL for the others would end the string early and
// spill the rest of its payload back into the text, which breaks a split
// credential name apart again and defeats the sensitive-key match.
function skipControlString(text, index, acceptsBell) {
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (code === C1_STRING_TERMINATOR || (acceptsBell && code === BELL)) {
      return { index: index + 1, truncated: false };
    }
    if (code === ESCAPE && text[index + 1] === "\\") return { index: index + 2, truncated: false };
    index += 1;
  }
  return { index, truncated: true };
}

// Any other escape sequence: zero or more intermediates (0x20-0x2f) then one
// final byte (0x30-0x7e), covering forms such as `ESC ( B` and `ESC 7`. A byte
// outside both ranges — a newline after a stray ESC — ends the sequence in
// place and is left for the main loop.
function skipEscapeSequence(text, index) {
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (code >= 0x20 && code <= 0x2f) {
      index += 1;
      continue;
    }
    return { index: code >= 0x30 && code <= 0x7e ? index + 1 : index, truncated: false };
  }
  return { index, truncated: true };
}

// Remove terminal control codes before credential matching. This joins names
// split by NUL bytes or by any ANSI form: CSI and the control strings (OSC,
// DCS, SOS, PM, APC) in both their ESC-introduced and C1 single-byte
// spellings, plus any other escape sequence. Remaining C0 and C1 controls are
// dropped; newline, carriage return, and tab survive, so line boundaries do not
// move. Returns the stripped text plus `truncated`, set when some form never
// terminated.
function stripCredentialObfuscation(text) {
  let out = "";
  let index = 0;
  let truncated = false;
  const advance = (result) => {
    index = result.index;
    truncated = truncated || result.truncated;
  };
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (code === ESCAPE) {
      const next = text[index + 1];
      if (next === "[") advance(skipControlSequence(text, index + 2));
      else if (next !== undefined && STRING_INTRODUCERS.has(next)) advance(skipControlString(text, index + 2, next === OSC_INTRODUCER));
      else advance(skipEscapeSequence(text, index + 1));
      continue;
    }
    if (code === C1_CSI) {
      advance(skipControlSequence(text, index + 1));
      continue;
    }
    if (C1_STRING_INTRODUCERS.has(code)) {
      advance(skipControlString(text, index + 1, code === C1_OSC_INTRODUCER));
      continue;
    }
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) {
      if (KEPT_CONTROLS.has(text[index])) out += text[index];
      index += 1;
      continue;
    }
    out += text[index];
    index += 1;
  }
  return { text: out, truncated };
}
function isIdentStart(ch) {
  return (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z") || ch === "_";
}

function isIdentCont(ch) {
  return isIdentStart(ch) || (ch >= "0" && ch <= "9") || ch === "." || ch === "-";
}

function isSchemeChar(ch) {
  return isIdentStart(ch) || (ch >= "0" && ch <= "9") || ch === "+" || ch === "." || ch === "-";
}

function skipHorizontalSpace(text, index) {
  while (index < text.length && (text[index] === " " || text[index] === "\t")) index += 1;
  return index;
}

function scanIdentEnd(text, start) {
  let index = start;
  if (!isIdentStart(text[index])) return start;
  index += 1;
  while (index < text.length && isIdentCont(text[index])) index += 1;
  return index;
}

// A leading run of CLI flag hyphens is not identifier content. Only the first
// hyphen of a run at a word boundary starts a flag, so embedded hyphens inside
// `api-key` or `2026-07-11` stay identifier content.
function scanFlagNameStart(text, index) {
  if (text[index] !== "-") return -1;
  if (index > 0 && isIdentCont(text[index - 1])) return -1;
  let cursor = index;
  while (text[cursor] === "-") cursor += 1;
  return cursor > index && isIdentCont(text[cursor]) ? cursor : -1;
}

// A long option may start with a digit, as in `--2fa-token`. Only the first
// character differs from an ordinary identifier; the scheme and identifier
// rules elsewhere stay unchanged.
function scanFlagNameEnd(text, start) {
  if (!isIdentCont(text[start])) return start;
  let index = start + 1;
  while (index < text.length && isIdentCont(text[index])) index += 1;
  return index;
}

function isTokenDelimiter(ch) {
  return (
    ch === undefined ||
    ch === " " ||
    ch === "\t" ||
    ch === "\n" ||
    ch === "\r" ||
    ch === '"' ||
    ch === "'" ||
    ch === "," ||
    ch === "}" ||
    ch === "]" ||
    ch === ")" ||
    ch === ";" ||
    ch === "\\"
  );
}

// A known secret prefix owns its whole token, not just the identifier-shaped
// head, so a tail such as `+LEAKTAIL` cannot survive.
function scanTokenEnd(text, start) {
  let index = start;
  while (index < text.length && !isTokenDelimiter(text[index])) index += 1;
  return index;
}

function scanQuotedIdent(text, start) {
  const quote = text[start];
  if ((quote !== '"' && quote !== "'") || start + 1 >= text.length || !isIdentStart(text[start + 1])) {
    return null;
  }
  const end = scanIdentEnd(text, start + 1);
  if (text[end] !== quote) return null;
  return { name: text.slice(start + 1, end), end: end + 1 };
}

function quotedRedacted(quote) {
  return quote ? `${quote}${REDACTED}${quote}` : REDACTED;
}

function consumeQuotedValue(text, start, quote) {
  let index = start + 1;
  while (index < text.length) {
    const ch = text[index];
    if (ch === "\n") return { end: index, quote };
    if (ch === "\\") {
      index += 2;
      continue;
    }
    if (ch === quote) return { end: index + 1, quote };
    index += 1;
  }
  return { end: index, quote };
}

function consumeAssignmentValue(text, start) {
  if (start >= text.length || text[start] === "\n") return { end: start, quote: null };
  if (text[start] === '"' || text[start] === "'") return consumeQuotedValue(text, start, text[start]);
  let index = start;
  while (index < text.length && text[index] !== "\n") index += 1;
  return { end: index, quote: null };
}

function consumeStandaloneValue(text, start) {
  if (start >= text.length || text[start] === "\n") return null;
  if (text[start] === '"' || text[start] === "'") return consumeQuotedValue(text, start, text[start]);
  let index = start;
  while (index < text.length && text[index] !== " " && text[index] !== "\t" && text[index] !== "\n") {
    index += 1;
  }
  return index > start ? { end: index, quote: null } : null;
}

function consumeSchemeToken(text, start) {
  if (start >= text.length || text[start] === "\n") return null;
  let index = start;
  while (index < text.length && text[index] !== " " && text[index] !== "\t" && text[index] !== "\n") {
    index += 1;
  }
  return index > start ? { end: index } : null;
}

// One scheme-shaped run is parsed once. Every candidate start inside a run
// reaches the same run end, so a failed "://" or userinfo-free authority is
// reported back as `schemeRunEnd` and the caller skips the overlapping
// suffixes instead of rescanning them.
function consumeUserinfoUrl(text, start) {
  let index = start + 1;
  while (index < text.length && isSchemeChar(text[index])) index += 1;
  if (!text.startsWith("://", index)) return { schemeRunEnd: index };
  const schemeEnd = index + 3;
  let at = -1;
  for (let cursor = schemeEnd; cursor < text.length; cursor += 1) {
    const ch = text[cursor];
    if (ch === "/" || ch === "?" || ch === "#" || ch === " " || ch === "\t" || ch === "\n" || ch === '"' || ch === "'") {
      break;
    }
    if (ch === "@") {
      at = cursor;
    } else if (ch === "%" && text[cursor + 1] === "4" && text[cursor + 2] === "0") {
      at = cursor + 2;
      cursor += 2;
    }
  }
  if (at === -1) return { schemeRunEnd: index };
  return { end: at + 1, replacement: `${text.slice(start, schemeEnd)}${REDACTED}@` };
}

// Linear credential scan over plaintext. Assignment names are complete
// identifiers, not a wrapping wildcard around the sensitive term, so long
// near-matches stay O(n). Bare values run through the record boundary.
// Unterminated quotes, standalone sensitive keys, flag-prefixed names,
// Bearer/Basic/Token, known secret prefixes, and URL userinfo are redacted on
// the same pass. This runs on raw text and on JSON string leaves before
// serialization — never on serialized JSON.
function redactPlaintextAssignments(text, tally = newRedactionTally()) {
  let out = "";
  let index = 0;
  let schemeSkipUntil = 0;
  while (index < text.length) {
    const quoted = scanQuotedIdent(text, index);
    const flagNameStart = quoted ? -1 : scanFlagNameStart(text, index);
    const nameStart = flagNameStart >= 0 ? flagNameStart : index;
    const identStart =
      quoted ||
      flagNameStart >= 0 ||
      (isIdentStart(text[index]) && (index === 0 || !isIdentCont(text[index - 1])));
    if (!identStart) {
      out += text[index];
      index += 1;
      continue;
    }

    if (!quoted && flagNameStart < 0 && index >= schemeSkipUntil) {
      const url = consumeUserinfoUrl(text, index);
      if (url.replacement !== undefined) {
        out += url.replacement;
        tally.count += 1;
        index = url.end;
        continue;
      }
      schemeSkipUntil = url.schemeRunEnd;
    }

    const scanNameEnd = flagNameStart >= 0 ? scanFlagNameEnd : scanIdentEnd;
    const name = quoted ? quoted.name : text.slice(nameStart, scanNameEnd(text, nameStart));
    const nameEnd = quoted ? quoted.end : scanNameEnd(text, nameStart);
    if (SECRET_PREFIX_RE.test(name)) {
      out += text.slice(index, nameStart) + quotedRedacted(quoted ? text[index] : null);
      tally.count += 1;
      index = quoted ? nameEnd : scanTokenEnd(text, nameStart);
      continue;
    }

    const afterName = skipHorizontalSpace(text, nameEnd);
    const separator = text[afterName];
    const isAssignment = separator === "=" || separator === ":";

    if (isSensitiveKey(name) && isAssignment) {
      const valueStart = skipHorizontalSpace(text, afterName + 1);
      const value = consumeAssignmentValue(text, valueStart);
      out += text.slice(index, valueStart) + quotedRedacted(value.quote);
      tally.count += 1;
      index = value.end;
      continue;
    }

    if (isAuthScheme(name) && afterName > nameEnd && !isAssignment) {
      const token = consumeSchemeToken(text, afterName);
      if (token) {
        out += `${text.slice(index, afterName)}${REDACTED}`;
        tally.count += 1;
        index = token.end;
        continue;
      }
    }

    const credentialShapedStandalone =
      flagNameStart >= 0 || Boolean(quoted) || name === name.toUpperCase() || name.includes("_");
    if (isSensitiveKey(name) && credentialShapedStandalone && afterName > nameEnd && !isAssignment) {
      const standalone = consumeStandaloneValue(text, afterName);
      if (standalone) {
        out += text.slice(index, afterName) + quotedRedacted(standalone.quote);
        tally.count += 1;
        index = standalone.end;
        continue;
      }
    }

    out += text.slice(index, nameEnd);
    index = nameEnd;
  }
  return out;
}

function isJsonSafePrimitive(value) {
  if (value === null) return true;
  if (typeof value === "boolean") return true;
  return typeof value === "number" && Number.isFinite(value);
}

// Fail closed on hostile shapes. Only JSON-safe primitives are copied, so a
// function value — `toJSON` included — never reaches the output object and
// JSON.stringify can never call it. Objects already seen on this walk collapse
// to "[redacted]", which bounds cycles and shared references. Arrays past
// MAX_JSON_ARRAY_LENGTH collapse whole, so a sparse 200,000-slot array cannot
// expand into an output hole per slot.
function redactStructuredEntry(dst, key, entry, depth, stack, visited, tally) {
  if (typeof entry === "string") {
    const leaf = sanitizeStructuredStringLeaf(entry);
    dst[key] = leaf.sanitized;
    tally.count += leaf.redactions;
    return;
  }
  if (isJsonSafePrimitive(entry)) {
    dst[key] = entry;
    return;
  }
  if (!entry || typeof entry !== "object" || visited.has(entry) || depth + 1 >= MAX_JSON_DEPTH) {
    dst[key] = REDACTED;
    tally.count += 1;
    return;
  }
  const isArray = Array.isArray(entry);
  if (isArray && entry.length > MAX_JSON_ARRAY_LENGTH) {
    dst[key] = REDACTED;
    tally.count += 1;
    return;
  }
  visited.add(entry);
  const child = isArray ? [] : Object.create(null);
  dst[key] = child;
  stack.push({ src: entry, dst: child, depth: depth + 1 });
}

// Property descriptors are read instead of property values, so an accessor is
// redacted without ever being invoked.
function redactSensitiveValues(value, tally = newRedactionTally()) {
  if (typeof value === "string") {
    const leaf = sanitizeStructuredStringLeaf(value);
    tally.count += leaf.redactions;
    return leaf.sanitized;
  }
  if (isJsonSafePrimitive(value)) return value;
  if (!value || typeof value !== "object") return redactedLeaf(tally);
  if (Array.isArray(value) && value.length > MAX_JSON_ARRAY_LENGTH) return redactedLeaf(tally);

  const visited = new WeakSet([value]);
  const outRoot = Array.isArray(value) ? [] : Object.create(null);
  const stack = [{ src: value, dst: outRoot, depth: 0 }];
  while (stack.length > 0) {
    const { src, dst, depth } = stack.pop();
    if (Array.isArray(src)) {
      for (let index = 0; index < src.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(src, index);
        if (!descriptor) continue;
        if (descriptor.get || descriptor.set) {
          dst[index] = redactedLeaf(tally);
          continue;
        }
        redactStructuredEntry(dst, index, descriptor.value, depth, stack, visited, tally);
      }
      continue;
    }
    const keyNames = { used: new Set(), nextSuffix: new Map() };
    for (const key of Object.getOwnPropertyNames(src)) {
      const descriptor = Object.getOwnPropertyDescriptor(src, key);
      if (!descriptor || !descriptor.enumerable) continue;
      // Classification reads the ORIGINAL key; only the emitted name is scanned.
      const emittedName = emitKeyName(key, keyNames, tally);
      if (descriptor.get || descriptor.set) {
        dst[emittedName] = redactedLeaf(tally);
        continue;
      }
      // The usage-count allowlist is classified on the same normalized name, so
      // an obfuscated `input_tokens` behaves exactly like the plain spelling.
      // A truncated name short-circuits both checks: a name that hid part of
      // itself cannot be cleared as benign, and cannot be trusted as a usage
      // counter either.
      const classifiedKey = normalizeKeyForClassification(key);
      if (
        classifiedKey.truncated ||
        (isSensitiveKey(classifiedKey.name) && !isUsageCount(classifiedKey.name, descriptor.value))
      ) {
        dst[emittedName] = redactedLeaf(tally);
        continue;
      }
      redactStructuredEntry(dst, emittedName, descriptor.value, depth, stack, visited, tally);
    }
  }
  return outRoot;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// Structural redaction keeps valid JSON valid: sensitive keys collapse to
// "[redacted]" with an explicit stack (no recursive walk) and every string leaf
// is redacted before serialization. Nesting past MAX_JSON_DEPTH collapses to
// "[redacted]". The sanitized tree is serialized exactly once and is never
// rescanned as plaintext — a second pass would consume the serialized closing
// quote of a redacted leaf and destroy the remaining fields.
function sanitizeStructuredJson(value, tally = newRedactionTally()) {
  return JSON.stringify(redactSensitiveValues(value, tally));
}

// Non-JSON text: one bounded linear pass tracks brace depth with a single
// integer plus the current outer span start — constant auxiliary memory even
// for a 32 MiB unmatched-brace stream (unmatched openers never trigger a
// suffix rescan). Braces inside strings are skipped. Each outermost span
// that parses is redacted structurally — covering JSONL and prefixed
// multiline objects while preserving the surrounding prefix and suffix
// text; everything else, including unmatched-brace regions and spans whose
// JSON fails to parse, goes through the plaintext pass.
function sanitizeNonJsonText(text, tally = newRedactionTally()) {
  let sanitized = "";
  let cursor = 0;
  let depth = 0;
  let spanStart = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) spanStart = i;
      depth += 1;
    } else if (ch === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        const spanJson = tryParseJson(text.slice(spanStart, i + 1));
        if (spanJson !== undefined) {
          sanitized +=
            redactPlaintextAssignments(text.slice(cursor, spanStart), tally) +
            sanitizeStructuredJson(spanJson, tally);
          cursor = i + 1;
        }
        spanStart = -1;
      }
    }
  }
  return sanitized + redactPlaintextAssignments(text.slice(cursor), tally);
}

// Sanitize `text` twice — as captured, and with terminal escapes stripped — and
// keep whichever performed MORE redactions, so an escape-split credential is
// caught without rewriting text that gained nothing. `redact` sanitizes one
// variant and reports how many redactions it made; the choice never counts
// "[redacted]" occurrences, because evidence may contain that literal text.
// An unterminated escape form wins outright: its hidden tail becomes the marker,
// since leaving it to the un-stripped variant would emit the secret the escape
// was hiding.
function chooseSanitizedVariant(text, redact) {
  const original = redact(text);
  const normalized = stripCredentialObfuscation(text);
  if (!normalized.truncated && normalized.text === text) return original;
  const stripped = redact(normalized.text);
  if (normalized.truncated) {
    return { sanitized: stripped.sanitized + REDACTED, redactions: stripped.redactions + 1 };
  }
  return stripped.redactions > original.redactions ? stripped : original;
}

// One string leaf of a parsed structure. It runs the SAME control-aware choice
// as CLI text, so an escape- or NUL-split credential name is joined before
// matching. It deliberately does NOT go through sanitizeCliEvidenceText: that
// path parses its input as JSON, and a leaf whose text merely looks like JSON
// would be parsed and re-serialized, rewriting a string nothing was wrong with.
// Only the plaintext credential scan runs here.
function sanitizeStructuredStringLeaf(value) {
  return chooseSanitizedVariant(value, (variant) => {
    const tally = newRedactionTally();
    return { sanitized: redactPlaintextAssignments(variant, tally), redactions: tally.count };
  });
}

// Exported for focused sanitizer regression tests.
export function sanitizeCliEvidenceText(text) {
  try {
    return chooseSanitizedVariant(text, (variant) => {
      const tally = newRedactionTally();
      const parsed = tryParseJson(variant);
      const sanitized = parsed === undefined ? sanitizeNonJsonText(variant, tally) : sanitizeStructuredJson(parsed, tally);
      return { sanitized, redactions: tally.count };
    }).sanitized;
  } catch {
    return REDACTED;
  }
}
export function sanitizeBoundedText(value, limit = CLI_EVIDENCE_EXCERPT_BYTES) {
  return boundedUtf8Excerpt(Buffer.from(sanitizeCliEvidenceText(String(value))), limit).excerpt;
}

export function buildCliEvidence(value) {
  const buffer = streamBuffer(value);
  const excerptSource = Buffer.from(sanitizeCliEvidenceText(decodeCliEvidenceText(buffer)));
  return {
    ...boundedUtf8Excerpt(excerptSource),
    totalBytes: buffer.length,
    sha256: sha256(buffer)
  };
}

// The parsed envelope is sanitized into a depth-bounded tree first, and only
// that tree is serialized. JSON.stringify is recursive, so serializing the raw
// envelope would throw RangeError on deeply nested input before any redaction
// happened. Raw stdout keeps its own byte count and hash in `stdout`.
export function buildStructuredEvidence(value) {
  const buffer = Buffer.from(sanitizeStructuredJson(value));
  return {
    ...boundedUtf8Excerpt(buffer),
    totalBytes: buffer.length,
    sha256: sha256(buffer)
  };
}

