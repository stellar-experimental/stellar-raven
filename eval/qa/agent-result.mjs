/**
 * agent-result.mjs — the pure parser between one answering-agent spawn and
 * one structured QA outcome.
 *
 * This module separates stream decoding, answer extraction, transcript
 * assembly, and failure naming from the live provider. Production code and
 * saved fixtures in test/fixtures/qa-agent-streams/ use the same parser.
 *
 * PURITY: no fs, no spawn, no clock, no network. Same input → same output,
 * hashes included.
 *
 * SAFETY: a `provider-safeguard` outcome is never retryable and carries no
 * derived request. Only `transport` may enter a retry policy, and the caller
 * still decides whether to use it — nothing here rewrites or re-issues a
 * blocked request.
 */
import { createHash } from "node:crypto";

/** Bump when the STORED outcome shape changes (run-qa stamps it in meta). */
export const AGENT_RESULT_SCHEMA = "qa-agent-result-v1";

/**
 * Exclusive failure classes. `unclassified` is the deliberate default: an
 * unrecognized provider outcome must stay unknown rather than be guessed into
 * a class that carries a retry or a root-cause claim.
 */
export const FAILURE_CLASSES = Object.freeze([
  "provider-safeguard",
  "transport",
  "timeout",
  "spawn",
  "protocol",
  "agent",
  "unclassified"
]);

/** Only transport failures may be retried. Everything else is terminal. */
const RETRYABLE_CLASSES = new Set(["transport"]);

/**
 * Exclusive outcomes for ONE execute whose source contains an artifact read.
 * They PARTITION `readExecutes`: bounded + truncated + guardFailed + hostDenied
 * + otherFailed === total, always. `otherFailed` exists because the two
 * historical post-read `Cannot read properties of undefined` rows
 * (q-pc-sponsored-reserves, q-protocol-operation-types-list, 2026-08-14) fit no
 * guard marker and no host reason, and so belonged to no bucket at all.
 */
export const READ_EXECUTE_OUTCOMES = Object.freeze([
  "bounded",
  "truncated",
  "guardFailed",
  "hostDenied",
  "otherFailed"
]);

/**
 * State of the LAST read-containing execute — the one whose projection the
 * answer could actually use. `bounded` is the only success: the execute
 * completed AND its own result was not truncated again. `none` means the run
 * never read an artifact.
 */
export const FINAL_PROJECTION_STATES = Object.freeze([
  "none",
  "bounded",
  "truncated",
  "guard-failed",
  "host-denied",
  "other-failed"
]);

/** READ_EXECUTE_OUTCOMES bucket → its FINAL_PROJECTION_STATES name. */
const PROJECTION_STATE_OF = Object.freeze({
  bounded: "bounded",
  truncated: "truncated",
  guardFailed: "guard-failed",
  hostDenied: "host-denied",
  otherFailed: "other-failed"
});

/**
 * Observed provider-safeguard markers (2026-08-14 canonical round, rows
 * q-n3-ssrf-metadata-endpoint attempt 1 and 2). Both markers come from the
 * same provider notice; either alone is sufficient and neither appears in a
 * model-authored answer.
 */
const PROVIDER_SAFEGUARD_MARKERS = [
  "safeguards flagged this message",
  "real-time-cyber-safeguards-on-claude"
];

/**
 * Observed transport markers. Kept narrow on purpose — an unmatched provider
 * error stays `unclassified` rather than becoming a retryable transport blip.
 */
const TRANSPORT_PATTERNS = [
  /API Error: Connection closed/i,
  /API Error:\s*529\s+Overloaded\b/i,
  /Connection error\b/i,
  /overloaded_error/i,
  /rate_limit_error/i,
  /ECONNRESET|ETIMEDOUT|EPIPE|fetch failed/i
];

/** Provider `subtype` values that mean the agent itself ran out of budget. */
const AGENT_SUBTYPES = new Set(["error_max_turns"]);

const FAILURE_EXCERPT_MAX_CHARS = 400;
const STDERR_EXCERPT_MAX_CHARS = 2000;
const TOOL_INPUT_SLICE_CHARS = 600;
const REPLACEMENT = "[REDACTED]";

/** Loss-boundary markers, mirroring eval/qa/analyze-composition.mjs. */
const TRUNCATION_MARKERS = ["--- TRUNCATED ---", "--- SOURCE BASIS ---"];
/** Same shape the smoke lane matches: `artifact: id=<uuid> ` in a source basis. */
const ARTIFACT_HANDLE_RE = /artifact: id=([0-9a-f-]{36})[\s)]/g;
const ARTIFACT_INFO_RE = /\bcodemode\.artifact(?:\.info|_info)\s*\(/g;
const ARTIFACT_READ_RE = /\bcodemode\.artifact(?:\.read|_read)\s*\(/g;
/**
 * Only execute source can contain RUNNABLE artifact calls. Same rule
 * eval/qa/analyze-composition.mjs uses, so the two instruments agree on what an
 * execute entry is. A search query, a skill read, or any other tool input that
 * merely quotes `codemode.artifact.read(...)` is prose, not work.
 */
const isExecuteEntry = (tool) => String(tool ?? "").endsWith("execute");
/** The fail-loud envelope guard's exact wording (src/executor/providers.ts). */
const WRONG_ENVELOPE_MARKER = "is on the data payload, not the envelope";
/**
 * Host-authored artifact denial messages (src/executor/providers.ts). The map
 * is closed: an unrecognized failure is not invented into a new reason.
 */
const ARTIFACT_FAILURE_REASONS = [
  ["artifact not found", "not-found"],
  ["artifact read cap exceeded", "read-cap"],
  ["artifact info cap exceeded", "info-cap"],
  ["artifact is unavailable for this request", "unavailable"]
];

/**
 * Pattern-based scrub for text this repo cannot match against known secret
 * VALUES (unlike src/policy/redact.ts, which holds the env's secrets). Bounded
 * to credential-shaped strings so a diagnostic excerpt stays readable.
 */
const SECRET_PATTERNS = [
  [/\b(Bearer|Basic|Token)\s+[\w\-._~+/]+=*/gi, (_m, scheme) => `${scheme} ${REPLACEMENT}`],
  [/\b(sk|pk|rk|xoxb|xoxp|ghp|gho|glpat)-[A-Za-z0-9_\-]{8,}/g, () => REPLACEMENT],
  [/\b([A-Za-z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD))\s*[=:]\s*["']?[^\s"']{8,}["']?/g, (_m, name) => `${name}=${REPLACEMENT}`],
  [/(https?:\/\/)[^/\s:@]+:[^/\s@]+@/g, (_m, scheme) => `${scheme}${REPLACEMENT}@`]
];

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function redact(text) {
  let out = text;
  for (const [pattern, replacer] of SECRET_PATTERNS) out = out.replace(pattern, replacer);
  return out;
}

/** Redact first, then bound — never the other way around. */
function excerpt(text, maxChars) {
  const scrubbed = redact(String(text ?? ""));
  return scrubbed.length <= maxChars ? scrubbed : `${scrubbed.slice(0, maxChars - 1)}…`;
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Per-turn usage as the provider emitted it. Absent counters stay null: a
 * character count is NOT a token count and this parser never substitutes one.
 *
 * `turn` MUST be the assistant-message ordinal, not the number of usage records
 * collected so far — a turn that emits no usage block would otherwise shift
 * every later turn's label down by one.
 */
function perTurnUsage(rawUsage, turn) {
  if (rawUsage === null || typeof rawUsage !== "object") return null;
  const record = {
    turn,
    inputTokens: numberOrNull(rawUsage.input_tokens),
    outputTokens: numberOrNull(rawUsage.output_tokens),
    cacheCreationInputTokens: numberOrNull(rawUsage.cache_creation_input_tokens),
    cacheReadInputTokens: numberOrNull(rawUsage.cache_read_input_tokens)
  };
  const hasAnyCounter = [
    record.inputTokens,
    record.outputTokens,
    record.cacheCreationInputTokens,
    record.cacheReadInputTokens
  ].some((v) => v !== null);
  return hasAnyCounter ? record : null;
}

function markerHit(text, markers) {
  return markers.some((marker) => text.includes(marker));
}

function isTruncated(text) {
  return markerHit(text, TRUNCATION_MARKERS);
}

function countMatches(text, regex) {
  return String(text ?? "").match(regex)?.length ?? 0;
}

/**
 * Classify the terminal outcome. Order is load-bearing: a spawn/timeout is
 * decided before any stream inspection (there may be no stream at all), and a
 * provider safeguard is decided before transport so a blocked request can
 * never be reclassified into the one retryable class.
 */
function classifyFailure({
  spawnError,
  status,
  signal,
  resultMessage,
  sawAnyMessage,
  hadMcpCall,
  protocolIssue
}) {
  const terminal = {
    subtype: resultMessage?.subtype ?? null,
    exitStatus: numberOrNull(status),
    signal: signal ?? null
  };
  const make = (klass, reason, message) => ({
    class: klass,
    reason,
    retryable: RETRYABLE_CLASSES.has(klass),
    messageExcerpt: message ? excerpt(message, FAILURE_EXCERPT_MAX_CHARS) : null,
    ...terminal
  });

  if (spawnError) {
    const code = spawnError.code ?? null;
    const timedOut = code === "ETIMEDOUT" || signal === "SIGTERM" || signal === "SIGKILL";
    return timedOut
      ? make("timeout", "agent process exceeded its wall-clock budget", spawnError.message)
      : make("spawn", "agent process could not be started", spawnError.message);
  }

  if (resultMessage?.is_error) {
    const text = String(resultMessage.result ?? "");
    if (markerHit(text, PROVIDER_SAFEGUARD_MARKERS)) {
      return make(
        "provider-safeguard",
        hadMcpCall
          ? "provider safeguard blocked the request after an MCP call"
          : "provider safeguard blocked the request before any MCP call",
        text
      );
    }
    if (TRANSPORT_PATTERNS.some((pattern) => pattern.test(text))) {
      return make("transport", "provider transport error", text);
    }
    if (AGENT_SUBTYPES.has(resultMessage.subtype)) {
      return make("agent", `agent stopped on provider subtype ${resultMessage.subtype}`, text);
    }
    return make("unclassified", "provider reported an error with no recognized shape", text);
  }

  if (protocolIssue) {
    return make("protocol", protocolIssue, null);
  }

  if (!resultMessage) {
    return make(
      "protocol",
      sawAnyMessage
        ? "agent stream ended without a result message"
        : "agent produced no parsable stream messages",
      null
    );
  }

  // A clean-looking result message is NOT proof of a clean run: the CLI can emit
  // a complete answer and still exit nonzero or die on a signal. Treating that
  // as success let the answer through to a paid judge. Deliberately last, so a
  // provider-classified error (including the one retryable class) keeps its more
  // specific class — a transport blip legitimately exits nonzero.
  if (typeof status === "number" && status !== 0) {
    return make("unclassified", `agent process exited with status ${status} despite a clean result message`, null);
  }
  if (signal) {
    return make("unclassified", `agent process was terminated by ${signal} despite a clean result message`, null);
  }

  return null;
}

/**
 * Classify ONE read-containing execute into exactly one READ_EXECUTE_OUTCOMES
 * bucket. Precedence is fixed and load-bearing:
 *
 *   1. guardFailed  — the fail-loud envelope guard fired (it surfaces AS an
 *                     execution failure, so it must outrank otherFailed).
 *   2. hostDenied   — a closed host denial message is present (usually returned
 *                     as data by a script that branched on r.ok).
 *   3. otherFailed  — the execute failed for any other reason (a post-read
 *                     TypeError is the observed case).
 *   4. truncated    — the execute completed but its own result truncated again,
 *                     so the projection was not bounded.
 *   5. bounded      — the only success.
 */
function classifyReadExecute(entry, result) {
  if (result.includes(WRONG_ENVELOPE_MARKER)) return { bucket: "guardFailed", reason: null };
  const reason = ARTIFACT_FAILURE_REASONS.find(([marker]) => result.includes(marker))?.[1] ?? null;
  if (reason) return { bucket: "hostDenied", reason };
  const envelope = parseVisibleArtifactEnvelope(result);
  if (envelope?.ok === false) {
    const kind = typeof envelope.error?.kind === "string" ? envelope.error.kind : "unknown";
    return {
      bucket: "hostDenied",
      reason: ["not-found", "read-cap", "info-cap", "unavailable"].includes(kind) ? kind : "unknown"
    };
  }
  if (Boolean(entry.isError) || result.startsWith("Execution failed:")) {
    return { bucket: "otherFailed", reason: null };
  }
  if (isTruncated(result)) return { bucket: "truncated", reason: null };
  return { bucket: "bounded", reason: null };
}

function parseVisibleArtifactEnvelope(result) {
  const body = String(result ?? "").split("\n\n--- console (")[0];
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Derive artifact-continuation outcomes from the transcript.
 *
 * Three DIFFERENT quantities are named separately, because conflating them was
 * the first cut's defect:
 *
 * - `callSites`   — STATIC TEXTUAL occurrences of `codemode.artifact.info/read(`
 *                   in EXECUTE source. It is not a runtime call count and it
 *                   bounds one in NEITHER direction: a site inside a loop
 *                   undercounts (one occurrence, many calls), and a site inside
 *                   a string or comment overcounts (one occurrence, no call).
 *                   Read it as text that was written, never as work that ran.
 * - `readExecutes` — executes whose source contains at least one read call site,
 *                   partitioned by outcome (see READ_EXECUTE_OUTCOMES).
 * - `readOutcomes` — execute-level evidence for an ok:true read, an observed
 *                   denial, or an indeterminate result. Only the VISIBLE result
 *                   body counts: promise resolution proves nothing (a read
 *                   returns `{ ok: false }` instead of rejecting) and neither
 *                   does anything written in the source (see the rule at the
 *                   `readOutcomes.successful` branch below).
 * - `finalProjection` — the state of the LAST such execute.
 *
 * ALL of it is execute-scoped — call sites, read outcomes, and handle discovery
 * alike. `handlesObserved` counts handles this run was actually issued, which
 * only an execute result can carry.
 *
 * Everything comes from what the MODEL saw. Host-side byte counts are separate
 * evidence, so `readBytes` stays null rather than being estimated.
 */
function artifactOutcomes(transcript) {
  const readExecutes = { total: 0 };
  for (const outcome of READ_EXECUTE_OUTCOMES) readExecutes[outcome] = 0;
  const readOutcomes = { total: 0, successful: 0, denied: 0, indeterminate: 0 };
  const out = {
    handlesObserved: 0,
    callSites: { info: 0, read: 0 },
    readExecutes,
    readOutcomes,
    hostDenialReasons: {},
    finalProjection: "none",
    readBytes: null
  };
  const handles = new Set();

  for (const entry of transcript) {
    // Every field here is execute-scoped. A non-execute tool cannot run an
    // artifact call and is never issued a handle, so it can add no call site,
    // no read-containing execute, no projection state, and no handle — however
    // faithfully its input or its result quotes the API. (Under the
    // per-operation surface non-execute results ARE stored, so this gate is
    // load-bearing, not theoretical.)
    if (!isExecuteEntry(entry.tool)) continue;

    const result = typeof entry.result === "string" ? entry.result : "";
    for (const match of result.matchAll(ARTIFACT_HANDLE_RE)) handles.add(match[1]);

    const input = String(entry.input ?? "");
    out.callSites.info += countMatches(input, ARTIFACT_INFO_RE);
    const readSites = countMatches(input, ARTIFACT_READ_RE);
    out.callSites.read += readSites;
    if (readSites === 0) continue;

    const { bucket, reason } = classifyReadExecute(entry, result);
    readExecutes.total += 1;
    readExecutes[bucket] += 1;
    readOutcomes.total += 1;
    if (bucket === "hostDenied") {
      readOutcomes.denied += 1;
    } else if (bucket === "bounded" && parseVisibleArtifactEnvelope(result)?.ok === true) {
      // The ONLY success proof: the execute COMPLETED (bounded) and its own
      // visible body parses as an object with `ok: true`. Both halves are
      // load-bearing — an errored execute can still leave an `ok:true` envelope
      // in its wreckage, which is not a projection any answer could use.
      //
      // Nothing about the SOURCE counts, because source is text and text does
      // not run: a guard and a `.data` use can sit on the failure return, inside
      // a string, or inside a comment and still read as a successful projection
      // (see the source-evidence regression tests). A truncated body hides
      // its own envelope by construction, and `r.data ?? fallback` produces the
      // same output whether the read returned data or was denied.
      //
      // This fails closed by design: a real, correctly guarded read whose
      // execute projected a small answer instead of the envelope now counts as
      // `indeterminate`, the real artifact-continuation fixture included. An
      // instrument that under-claims is repairable; one that invents evidence
      // is not.
      readOutcomes.successful += 1;
    } else {
      readOutcomes.indeterminate += 1;
    }
    if (reason) out.hostDenialReasons[reason] = (out.hostDenialReasons[reason] ?? 0) + 1;
    out.finalProjection = PROJECTION_STATE_OF[bucket];
  }

  out.handlesObserved = handles.size;
  return out;
}

/**
 * Parse ONE answering-agent spawn into ONE structured outcome.
 *
 * @param {object} spawn                 The spawnSync-shaped result.
 * @param {string} spawn.stdout          `--output-format stream-json` stream.
 * @param {string} spawn.stderr          Raw stderr (hashed + excerpted, never stored whole).
 * @param {number|null} spawn.status     Exit status.
 * @param {string|null} spawn.signal     Terminating signal.
 * @param {{message: string, code?: string}} [spawn.spawnError]  spawnSync's own `error`.
 * @param {object}   [options]
 * @param {number|null} [options.promptChars]   Prompt size, recorded verbatim.
 * @param {(toolName: string) => boolean} [options.keepWholeResult]
 *        Which tools' RESULTS are kept whole (default: execute). Downstream
 *        analyzers parse those bodies; other tools stay sliced.
 * @returns {object} the structured outcome (see AGENT_RESULT_SCHEMA).
 */
export function parseAgentResult(spawn, options = {}) {
  const { stdout = "", stderr = "", status = null, signal = null, spawnError = null } = spawn ?? {};
  const keepWholeResult = options.keepWholeResult ?? ((tool) => tool.endsWith("execute"));
  const promptChars = options.promptChars ?? null;

  const transcript = [];
  const perTurn = [];
  let answer = "";
  let costUsd = null;
  let turns = null;
  let finalUsage = null;
  let resultMessage = null;
  let sawAnyMessage = false;
  let protocolIssue = null;
  // Independent of `perTurn.length`: an assistant message that carries no usage
  // block must still consume an ordinal.
  let assistantOrdinal = 0;

  for (const [lineIndex, line] of String(stdout).split("\n").entries()) {
    if (!line.trim().startsWith("{")) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      protocolIssue ??= `agent stream contained malformed JSON on line ${lineIndex + 1}`;
      continue;
    }
    sawAnyMessage = true;

    if (msg.type === "assistant" && Array.isArray(msg.message?.content)) {
      assistantOrdinal += 1;
      const usage = perTurnUsage(msg.message.usage ?? null, assistantOrdinal);
      if (usage) perTurn.push(usage);
      for (const block of msg.message.content) {
        if (block.type !== "tool_use") continue;
        const rawInput = JSON.stringify(block.input ?? {});
        transcript.push({
          toolUseId: block.id,
          tool: block.name,
          input: keepWholeResult(String(block.name)) ? rawInput : rawInput.slice(0, TOOL_INPUT_SLICE_CHARS)
        });
      }
    } else if (msg.type === "user" && Array.isArray(msg.message?.content)) {
      for (const block of msg.message.content) {
        if (block.type !== "tool_result") continue;
        const entry = transcript.find((t) => t.toolUseId === block.tool_use_id);
        if (!entry) continue;
        const text = Array.isArray(block.content)
          ? block.content.map((c) => c.text ?? "").join("")
          : String(block.content ?? "");
        entry.resultChars = text.length;
        entry.isError = Boolean(block.is_error);
        if (keepWholeResult(String(entry.tool))) entry.result = text;
      }
    } else if (msg.type === "result") {
      resultMessage = msg;
      costUsd = numberOrNull(msg.total_cost_usd);
      turns = numberOrNull(msg.num_turns);
      finalUsage = msg.usage ?? null;
      // A provider notice is not a candidate answer: `answer` stays empty for
      // any errored result so no downstream consumer can grade it as one.
      answer = msg.is_error ? "" : (msg.result ?? "");
    }
  }

  const failure = classifyFailure({
    spawnError,
    status,
    signal,
    resultMessage,
    sawAnyMessage,
    hadMcpCall: transcript.length > 0,
    protocolIssue
  });
  const stderrText = String(stderr ?? "");

  return {
    schema: AGENT_RESULT_SCHEMA,
    answer: failure ? "" : answer,
    transcript,
    turns,
    costUsd,
    promptChars,
    usage: {
      final: finalUsage,
      perTurn,
      perTurnAvailable: perTurn.length > 0
    },
    failure,
    stderr: stderrText
      ? { chars: stderrText.length, sha256: sha256(stderrText), excerpt: excerpt(stderrText, STDERR_EXCERPT_MAX_CHARS) }
      : null,
    artifacts: artifactOutcomes(transcript)
  };
}
