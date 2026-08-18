#!/usr/bin/env node
/**
 * Read-only retrieval comparison for allowlisted public partner documentation.
 *
 * Candidate URLs are fixed in eval/partner-docs/cases.json and must pass the
 * code-owned allowlist below. The harness never calls partner MCP servers and
 * never invokes partner APIs described by the documents.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CASES_PATH = resolve(ROOT, "eval/partner-docs/cases.json");
const MAX_DOC_BYTES = 256 * 1024;
const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * Phase 1 of the ship gate in research/partner-doc-source-onboarding.md requires the original
 * page-derived cohort to be expanded with at least four INDEPENDENT cases whose information need
 * did not come from reading the candidate page.
 *
 * What this constant checks is the COUNT, and only the count: a suite that has not been expanded
 * cannot report `pass`. It does NOT check independence itself. `caseType` classifies the
 * information need behind the question; the scoring rubric is unchanged, and every fact group in
 * both cohorts is still a literal string drawn from the candidate page. So a high candidate score
 * on an independent case is expected by construction and is not evidence of generalisation —
 * `provenance` is a human-reviewable claim, not a machine-checked one, and phase 3 is where
 * generalisation is actually measured.
 */
export const PHASE1_MIN_INDEPENDENT_CASES = 4;
const CASE_TYPES = new Set(["page-derived", "paraphrase", "negative", "conflict"]);
const INDEPENDENT_CASE_TYPES = new Set(["paraphrase", "negative", "conflict"]);

/**
 * Per-operation argument builders, NOT a name map. Each service takes its own envelope, and the
 * Scout adapter forwards unrecognised args straight into the query string — so reusing the
 * stellarDocs shape for `scout.searchResearch` would send `hitsPerPage`/`includeContent` as dead
 * query params and silently fall back to Scout's default page size, making the arms unequal
 * without anything failing.
 */
const OPERATION_CALLS = new Map([
  ["stellarDocs.search_docs", (q) => `stellarDocs.search_docs({ query: ${q}, hitsPerPage: 10, includeContent: true })`],
  ["stellarDocs.search_rpc_horizon_data_docs", (q) => `stellarDocs.search_rpc_horizon_data_docs({ query: ${q}, hitsPerPage: 10, includeContent: true })`],
  ["stellarDocs.search_sdk_cli_tools_docs", (q) => `stellarDocs.search_sdk_cli_tools_docs({ query: ${q}, hitsPerPage: 10, includeContent: true })`],
  ["scout.searchResearch", (q) => `scout.searchResearch({ q: ${q}, limit: 10 })`]
]);
const SKILL_IDS = new Set([
  "skills.openzeppelin-stellar.setup-stellar-contracts",
  "skills.openzeppelin-stellar.develop-secure-contracts"
]);

const PROMPT_SIGNAL_PATTERNS = [
  /ignore\s+(?:all\s+)?previous\s+instructions/iu,
  /(?:system|developer)\s+prompt/iu,
  /reveal\s+(?:your\s+)?(?:secrets?|credentials?|api\s*keys?)/iu,
  /(?:call|invoke|execute)\s+(?:this\s+)?tool/iu,
  /you\s+are\s+(?:chatgpt|an?\s+assistant)/iu
];

function parseArgs(argv) {
  const args = { json: false, selfTest: false, ravenUrl: undefined, timeoutMs: DEFAULT_TIMEOUT_MS };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--json") args.json = true;
    else if (argv[i] === "--self-test") args.selfTest = true;
    else if (argv[i] === "--raven-url") args.ravenUrl = argv[++i];
    else if (argv[i] === "--timeout-ms") args.timeoutMs = Number(argv[++i]);
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!Number.isInteger(args.timeoutMs) || args.timeoutMs < 250 || args.timeoutMs > 30_000) {
    throw new Error("--timeout-ms must be an integer from 250 to 30000");
  }
  return args;
}

export function normalizeText(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_#>|[\](){}:,.;'\"/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

export function matchFacts(text, facts) {
  const normalized = normalizeText(text);
  const matched = facts.map((alternatives) => alternatives.some((term) => containsBoundedTerm(normalized, term)));
  return {
    matched: matched.filter(Boolean).length,
    total: facts.length,
    recall: facts.length ? matched.filter(Boolean).length / facts.length : 0,
    detail: facts.map((alternatives, index) => ({ alternatives, matched: matched[index] }))
  };
}

function containsBoundedTerm(normalizedText, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;
  const phrase = normalizedTerm
    .split(" ")
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${phrase})(?=$|[^\\p{L}\\p{N}_])`, "iu").test(normalizedText);
}

export function allowedCandidateUrl(rawUrl, partner) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash) return false;
  try {
    if (decodeURIComponent(url.pathname) !== url.pathname) return false;
  } catch {
    return false;
  }
  if (partner === "alchemy") {
    return url.origin === "https://www.alchemy.com"
      && url.pathname.startsWith("/docs/")
      && (url.pathname.endsWith(".md") || url.pathname.endsWith("/llms.txt"));
  }
  if (partner === "openzeppelin") {
    return url.origin === "https://raw.githubusercontent.com"
      && /^\/OpenZeppelin\/docs\/(?:refs\/heads\/main|[0-9a-f]{40})\/content\/(?:stellar-contracts|relayer)\/.+\.mdx$/u.test(url.pathname);
  }
  return false;
}

export function resolvedCommitForUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.origin !== "https://raw.githubusercontent.com") return null;
    return url.pathname.match(/^\/OpenZeppelin\/docs\/([0-9a-f]{40})\//u)?.[1] ?? null;
  } catch {
    return null;
  }
}

function promptSignals(text) {
  const lines = String(text).split(/\r?\n/);
  const signals = [];
  for (let line = 0; line < lines.length; line++) {
    for (const pattern of PROMPT_SIGNAL_PATTERNS) {
      if (pattern.test(lines[line])) {
        signals.push({ line: line + 1, pattern: String(pattern), preview: lines[line].trim().slice(0, 180) });
      }
    }
  }
  return signals;
}

async function fetchAllowlistedDocument(rawUrl, partner, timeoutMs, redirectDepth = 0) {
  if (!allowedCandidateUrl(rawUrl, partner)) throw new Error(`allowlist rejected ${rawUrl}`);
  if (redirectDepth > 2) throw new Error(`too many redirects for ${rawUrl}`);
  const started = performance.now();
  const response = await fetch(rawUrl, {
    redirect: "manual",
    headers: { Accept: "text/markdown, text/plain;q=0.9", "User-Agent": "stellar-raven-partner-docs-eval/1" },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) throw new Error(`redirect without location from ${rawUrl}`);
    return fetchAllowlistedDocument(new URL(location, rawUrl).toString(), partner, timeoutMs, redirectDepth + 1);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${rawUrl}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!/^(?:text\/markdown|text\/plain)(?:;|$)/iu.test(contentType)) {
    throw new Error(`unexpected content-type ${contentType || "(missing)"} from ${rawUrl}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_DOC_BYTES) throw new Error(`document exceeds ${MAX_DOC_BYTES} bytes: ${rawUrl}`);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (!text.trim()) throw new Error(`empty document from ${rawUrl}`);
  return {
    url: rawUrl,
    finalUrl: response.url || rawUrl,
    text,
    status: response.status,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    elapsedMs: Math.round((performance.now() - started) * 10) / 10,
    contentType,
    cacheControl: response.headers.get("cache-control"),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified"),
    resolvedCommit: resolvedCommitForUrl(response.url || rawUrl),
    promptSignals: promptSignals(text)
  };
}

export function parseSseJson(text) {
  const data = String(text)
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");
  if (!data) return JSON.parse(text);
  return JSON.parse(data);
}

function baselineSourceCall(source, query) {
  if (source?.type === "operation") {
    const buildCall = OPERATION_CALLS.get(source.id);
    if (!buildCall) throw new Error(`unsupported baseline operation ${source.id}`);
    return buildCall(query);
  }
  if (source?.type === "skill" && SKILL_IDS.has(source.id)) {
    return `codemode.skill.read(${JSON.stringify(source.id)}, {})`;
  }
  throw new Error(`unsupported baseline source ${JSON.stringify(source)}`);
}

/**
 * `baseline` is an array because the candidate arm already is: it union-scores every document in
 * `candidateUrls`. Scoring three concatenated partner pages against a single Raven call measured
 * arity, not coverage — and a conflict case is by construction unanswerable from one lane, on
 * either side. The emitted script composes its sources in ONE execute run, which is also how
 * Raven's own contract tells an agent to work.
 */
export function baselineCode(testCase) {
  const query = JSON.stringify(testCase.question);
  if (!Array.isArray(testCase.baseline) || testCase.baseline.length === 0) {
    throw new Error(`baseline must be a non-empty array: ${testCase.id}`);
  }
  const calls = testCase.baseline.map((source) => baselineSourceCall(source, query));
  return `async () => { const r = await Promise.all([${calls.join(", ")}]); return r; }`;
}

async function ravenExecute(ravenUrl, code, timeoutMs) {
  const response = await fetch(ravenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method: "tools/call", params: { name: "execute", arguments: { code } } }),
    signal: AbortSignal.timeout(timeoutMs)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Raven HTTP ${response.status}: ${text.slice(0, 300)}`);
  const rpc = parseSseJson(text);
  if (rpc.error) throw new Error(`Raven JSON-RPC ${rpc.error.code}: ${rpc.error.message}`);
  if (rpc.result?.isError) throw new Error(`Raven execute error: ${rpc.result.content?.[0]?.text ?? "unknown"}`);
  return (rpc.result?.content ?? []).map((item) => item.text ?? "").join("\n");
}

function percentile(values, percentileValue) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)];
}

export function validateSuite(suite) {
  if (suite?.contract !== "partner-docs-retrieval-v1" || !Array.isArray(suite.cases) || suite.cases.length === 0) {
    throw new Error("invalid partner-docs suite header");
  }
  const ids = new Set();
  for (const testCase of suite.cases) {
    if (typeof testCase.id !== "string" || ids.has(testCase.id)) throw new Error(`invalid or duplicate case id: ${testCase.id}`);
    ids.add(testCase.id);
    if (!CASE_TYPES.has(testCase.caseType)) throw new Error(`invalid caseType: ${testCase.id}`);
    if (INDEPENDENT_CASE_TYPES.has(testCase.caseType)
      && (typeof testCase.provenance !== "string" || !testCase.provenance.trim())) {
      throw new Error(`independent case needs provenance: ${testCase.id}`);
    }
    if (typeof testCase.question !== "string" || !testCase.question.trim()) throw new Error(`missing question: ${testCase.id}`);
    if (!Array.isArray(testCase.facts) || testCase.facts.length === 0 || testCase.facts.some((group) => !Array.isArray(group) || group.length === 0)) {
      throw new Error(`invalid facts: ${testCase.id}`);
    }
    if (!Array.isArray(testCase.candidateUrls) || testCase.candidateUrls.length === 0
      || testCase.candidateUrls.some((url) => !allowedCandidateUrl(url, testCase.partner))) {
      throw new Error(`candidate URL outside allowlist: ${testCase.id}`);
    }
    baselineCode(testCase);
  }
  return suite;
}

export function summarize(rows) {
  const available = rows.filter((row) => row.baseline.score);
  const baselineErrors = rows.filter((row) => row.baseline.error !== null).length;
  const baselineMatched = available.reduce((sum, row) => sum + row.baseline.score.matched, 0);
  const candidateMatched = rows.reduce((sum, row) => sum + row.candidate.score.matched, 0);
  const totalFacts = rows.reduce((sum, row) => sum + row.candidate.score.total, 0);
  const baselineFacts = available.reduce((sum, row) => sum + row.baseline.score.total, 0);
  const wins = available.filter((row) => row.candidate.score.recall > row.baseline.score.recall).length;
  const regressions = available.filter((row) => row.candidate.score.recall < row.baseline.score.recall).length;
  const fetchErrors = rows.reduce((sum, row) => sum + row.candidate.errors.length, 0);
  const promptSignalCount = rows.reduce((sum, row) => sum + row.candidate.documents.reduce((n, doc) => n + doc.promptSignals.length, 0), 0);
  const baselineRecall = baselineFacts ? baselineMatched / baselineFacts : null;
  const candidateRecall = totalFacts ? candidateMatched / totalFacts : 0;
  const independentCases = rows.filter((row) => INDEPENDENT_CASE_TYPES.has(row.caseType)).length;
  // Fact groups repeat across cases (a conflict case re-checks strings its single-page siblings
  // already cover), so the pooled `totalFacts` counts some evidence twice. Report the distinct
  // count beside it: a pooled recall that looks like N independent measurements is the exact way
  // this kind of suite flatters itself.
  const distinctFactGroups = new Set(
    rows.flatMap((row) => (row.candidate.score.detail ?? [])
      .map((group) => JSON.stringify([...group.alternatives].sort())))
  ).size;
  const retrievalGate = baselineErrors > 0 || available.length !== rows.length
    ? "inconclusive"
    : candidateRecall >= baselineRecall + 0.20
      && wins >= 3
      && regressions === 0
      && fetchErrors === 0
      && independentCases >= PHASE1_MIN_INDEPENDENT_CASES
        ? "pass"
        : "fail";
  return {
    cases: rows.length,
    independentCases,
    phase1MinIndependentCases: PHASE1_MIN_INDEPENDENT_CASES,
    distinctFactGroups,
    baselineCases: available.length,
    baselineErrors,
    totalFacts,
    baselineRecall,
    candidateRecall,
    delta: baselineRecall === null ? null : candidateRecall - baselineRecall,
    wins,
    regressions,
    fetchErrors,
    promptSignalCount,
    candidateLatencyMs: {
      median: percentile(rows.flatMap((row) => row.candidate.documents.map((doc) => doc.elapsedMs)), 50),
      p95: percentile(rows.flatMap((row) => row.candidate.documents.map((doc) => doc.elapsedMs)), 95)
    },
    retrievalAdmissionGate: retrievalGate,
    headlineQaGate: "not-run",
    shipDecision: "do-not-ship-runtime-adapter"
  };
}

async function run(args) {
  const suite = validateSuite(JSON.parse(await readFile(CASES_PATH, "utf8")));
  const rows = [];
  for (const testCase of suite.cases) {
    const documents = [];
    const errors = [];
    for (const url of testCase.candidateUrls) {
      try {
        documents.push(await fetchAllowlistedDocument(url, testCase.partner, args.timeoutMs));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    let baselineText = null;
    let baselineError = null;
    if (args.ravenUrl) {
      try {
        baselineText = await ravenExecute(args.ravenUrl, baselineCode(testCase), args.timeoutMs);
      } catch (error) {
        baselineError = error instanceof Error ? error.message : String(error);
      }
    }
    rows.push({
      id: testCase.id,
      partner: testCase.partner,
      caseType: testCase.caseType,
      question: testCase.question,
      baseline: {
        source: testCase.baseline,
        score: baselineText === null ? null : matchFacts(baselineText, testCase.facts),
        error: baselineError
      },
      candidate: {
        urls: testCase.candidateUrls,
        score: matchFacts(documents.map((doc) => doc.text).join("\n"), testCase.facts),
        documents: documents.map(({ text: _text, ...metadata }) => metadata),
        errors
      }
    });
  }
  return { contract: suite.contract, generatedAt: new Date().toISOString(), ravenUrl: args.ravenUrl ?? null, rows, summary: summarize(rows) };
}

function printHuman(result) {
  console.log(`partner docs retrieval ${result.contract}`);
  for (const row of result.rows) {
    const baseline = row.baseline.score ? `${row.baseline.score.matched}/${row.baseline.score.total}` : "n/a";
    const candidate = `${row.candidate.score.matched}/${row.candidate.score.total}`;
    console.log(`- ${row.id} [${row.caseType}]: Raven ${baseline}; candidate ${candidate}; errors=${row.candidate.errors.length}`);
  }
  const s = result.summary;
  console.log(`independent cases: ${s.independentCases}/${s.phase1MinIndependentCases} required`);
  console.log(`fact groups: ${s.totalFacts} scored, ${s.distinctFactGroups} distinct`);
  console.log(`baseline recall: ${s.baselineRecall === null ? "n/a" : (100 * s.baselineRecall).toFixed(1) + "%"}`);
  console.log(`candidate recall: ${(100 * s.candidateRecall).toFixed(1)}%`);
  console.log(`retrieval admission: ${s.retrievalAdmissionGate}; headline QA: ${s.headlineQaGate}; ${s.shipDecision}`);
}

function selfTest() {
  assert.equal(allowedCandidateUrl("https://www.alchemy.com/docs/data/llms.txt", "alchemy"), true);
  assert.equal(allowedCandidateUrl("https://www.alchemy.com/docs/reference/x.md", "alchemy"), true);
  assert.equal(allowedCandidateUrl("https://www.alchemy.com/docs/reference/x.md?raw=1", "alchemy"), false);
  assert.equal(allowedCandidateUrl("https://www.alchemy.com/docs/%2e%2e/x.md", "alchemy"), false);
  assert.equal(allowedCandidateUrl("https://www.alchemy.com/api/delete", "alchemy"), false);
  assert.equal(allowedCandidateUrl("https://evil.example/docs/x.md", "alchemy"), false);
  assert.equal(allowedCandidateUrl("https://raw.githubusercontent.com/OpenZeppelin/docs/refs/heads/main/content/stellar-contracts/index.mdx", "openzeppelin"), true);
  assert.equal(allowedCandidateUrl("https://raw.githubusercontent.com/Other/docs/refs/heads/main/content/stellar-contracts/index.mdx", "openzeppelin"), false);
  assert.deepEqual(matchFacts("Native XLM and opaque pageKey cursor", [["native"], ["pageKey"], ["missing"]]), {
    matched: 2,
    total: 3,
    recall: 2 / 3,
    detail: [
      { alternatives: ["native"], matched: true },
      { alternatives: ["pageKey"], matched: true },
      { alternatives: ["missing"], matched: false }
    ]
  });
  assert.deepEqual(parseSseJson("event: message\ndata: {\"result\":{\"ok\":true}}\n\n"), { result: { ok: true } });
  assert.equal(matchFacts("posted data", [["POST"]]).matched, 0);
  const winningRow = (caseType) => ({
    caseType,
    baseline: { score: { matched: 0, total: 1, recall: 0, detail: [] }, error: null },
    candidate: { score: { matched: 1, total: 1, recall: 1, detail: [] }, errors: [], documents: [] }
  });
  const independent = Array.from({ length: PHASE1_MIN_INDEPENDENT_CASES }, () => winningRow("conflict"));
  assert.equal(summarize(independent).retrievalAdmissionGate, "pass");
  assert.equal(summarize(independent.slice(1)).retrievalAdmissionGate, "fail");
  assert.equal(summarize([...independent.slice(1), winningRow("page-derived")]).retrievalAdmissionGate, "fail");
  console.log("partner-docs eval self-test ok");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  const result = await run(args);
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
