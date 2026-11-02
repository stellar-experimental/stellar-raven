// Retrieval-level A/B for the Stellar Docs backend migration (Algolia → Mintlify).
//
// Free and read-only: it calls each arm's real `callStellarDocs` adapter with that arm's own
// catalog entries. Arm A = a checkout of the Algolia baseline; arm B = the Mintlify candidate.
// Queries: the stellarDocs calls agents actually issued in stored QA transcripts, plus each case's
// question text sent to search_docs. Metric: whether returned hits reach the case's golden
// developers.stellar.org source pages (page-level, anchors and /index ignored).
//
// usage: node retrieval-ab.mts --base <repoA> --cand <repoB> --calls <calls.json> --out <out.json>
//        [--max-per-case 8] [--concurrency 6]
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    base: { type: "string" },
    cand: { type: "string" },
    calls: { type: "string" },
    out: { type: "string" },
    "max-per-case": { type: "string", default: "8" },
    concurrency: { type: "string", default: "6" }
  }
});
const BASE = values.base!;
const CAND = values.cand!;
const MAX_PER_CASE = Number(values["max-per-case"]);
const CONCURRENCY = Number(values.concurrency);

type Env = Record<string, string>;
function loadEnv(repo: string): Env {
  return Object.fromEntries(
    readFileSync(`${repo}/.env`, "utf8")
      .split("\n")
      .map((line) => line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
      .filter((m): m is RegExpMatchArray => Boolean(m))
      .map((m) => [m[1], m[2]])
  );
}

async function loadArm(repo: string) {
  const { callStellarDocs } = await import(`${repo}/src/adapters/stellar-docs.ts`);
  const manifest = JSON.parse(readFileSync(`${repo}/catalog/manifest.json`, "utf8"));
  const entries = new Map<string, unknown>(
    manifest.entries.filter((e: { service: string }) => e.service === "stellarDocs").map((e: { id: string }) => [e.id, e])
  );
  return { callStellarDocs, entries, env: loadEnv(repo) };
}

export function normPath(url: string): string {
  return url
    .replace(/^https?:\/\/developers\.stellar\.org/, "")
    .replace(/[#?].*$/, "")
    .replace(/\/+$/, "")
    .replace(/\/index$/, "") || "/";
}

const cases = JSON.parse(readFileSync(`${CAND}/eval/qa/cases.json`, "utf8")).cases as Array<{
  id: string;
  question: string;
  surface?: string[];
  truth?: { sources?: Array<{ ref?: string }> };
}>;
const goldenPaths = new Map<string, string[]>();
for (const c of cases) {
  const refs = (c.truth?.sources ?? [])
    .map((s) => s.ref ?? "")
    .filter((ref) => /^https:\/\/developers\.stellar\.org\/(docs|meetings)\//.test(ref));
  if (refs.length) goldenPaths.set(c.id, [...new Set(refs.map(normPath))]);
}

type Call = { id: string; op: string; query: string | null; args: string };
const rawCalls = JSON.parse(readFileSync(values.calls!, "utf8")) as Call[];
const SEARCH_OPS = new Set([
  "search_docs", "search_doc_titles", "search_docs_in_category", "search_soroban_contract_docs",
  "search_asset_token_docs", "search_protocol_concepts_docs", "search_rpc_horizon_data_docs",
  "search_anchor_sep_docs", "search_sdk_cli_tools_docs", "search_wallet_dapp_docs", "search_meeting_notes"
]);

type Job = { caseId: string; op: string; args: Record<string, unknown>; source: "transcript" | "question" };
const jobs: Job[] = [];
for (const c of cases) {
  if (!goldenPaths.has(c.id)) continue;
  jobs.push({ caseId: c.id, op: "search_docs", args: { query: c.question, hitsPerPage: 5 }, source: "question" });
  const seen = new Set<string>();
  for (const call of rawCalls) {
    if (call.id !== c.id || !call.query || !SEARCH_OPS.has(call.op)) continue;
    const args: Record<string, unknown> = { query: call.query };
    const hits = call.args.match(/hitsPerPage\s*:\s*(\d+)/);
    args.hitsPerPage = hits ? Math.min(20, Math.max(1, Number(hits[1]))) : 5;
    const category = call.args.match(/category\s*:\s*["']([a-z]+)["']/);
    if (call.op === "search_docs_in_category") {
      if (!category) continue;
      args.category = category[1];
    }
    if (/includeMeetings\s*:\s*true/.test(call.args)) args.includeMeetings = true;
    const key = `${call.op}|${JSON.stringify(args)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (seen.size > MAX_PER_CASE) break;
    jobs.push({ caseId: c.id, op: call.op, args, source: "transcript" });
  }
}

const armA = await loadArm(BASE);
const armB = await loadArm(CAND);

type ArmResult = { ok: boolean; kind?: string; paths: string[]; ms: number; message?: string };
async function run(arm: Awaited<ReturnType<typeof loadArm>>, op: string, args: Record<string, unknown>): Promise<ArmResult> {
  const entry = arm.entries.get(`stellarDocs.${op}`);
  if (!entry) return { ok: false, kind: "missing-op", paths: [], ms: 0 };
  const t = Date.now();
  const r = await arm.callStellarDocs(entry, args, arm.env);
  const ms = Date.now() - t;
  if (!r.ok) return { ok: false, kind: r.error.kind, paths: [], ms, message: String(r.error.message).slice(0, 160) };
  const hits = (r.data as { hits?: Array<{ url?: string; url_without_anchor?: string }> }).hits ?? [];
  return { ok: true, paths: hits.map((h) => normPath(h.url_without_anchor ?? h.url ?? "")), ms };
}

const results: Array<Job & { a: ArmResult; b: ArmResult }> = [];
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++]!;
    const [a, b] = await Promise.all([run(armA, job.op, job.args), run(armB, job.op, job.args)]);
    results.push({ ...job, a, b });
    if (results.length % 100 === 0) console.error(`${results.length}/${jobs.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// ---- scoring
const golden = (id: string) => new Set(goldenPaths.get(id) ?? []);
const reached = (rows: typeof results, arm: "a" | "b", id: string) => {
  const g = golden(id);
  const hit = new Set<string>();
  for (const row of rows) for (const p of row[arm].paths) if (g.has(p)) hit.add(p);
  return hit;
};
const byCase = new Map<string, typeof results>();
for (const row of results) byCase.set(row.caseId, [...(byCase.get(row.caseId) ?? []), row]);

function summarize(filter: (row: (typeof results)[number]) => boolean) {
  const perCase = [...byCase].map(([id, rows]) => {
    const kept = rows.filter(filter);
    const g = golden(id).size;
    const ra = reached(kept, "a", id).size;
    const rb = reached(kept, "b", id).size;
    return { id, golden: g, queries: kept.length, recallA: ra / g, recallB: rb / g, anyA: ra > 0, anyB: rb > 0 };
  }).filter((c) => c.queries > 0);
  const n = perCase.length;
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
  const rows = results.filter(filter);
  const qHitA = rows.filter((r) => r.a.paths.some((p) => golden(r.caseId).has(p))).length;
  const qHitB = rows.filter((r) => r.b.paths.some((p) => golden(r.caseId).has(p))).length;
  const softA = rows.filter((r) => r.a.kind === "soft-empty").length;
  const softB = rows.filter((r) => r.b.kind === "soft-empty").length;
  const errA = rows.filter((r) => !r.a.ok && r.a.kind !== "soft-empty").length;
  const errB = rows.filter((r) => !r.b.ok && r.b.kind !== "soft-empty").length;
  const median = (xs: number[]) => xs.sort((x, y) => x - y)[Math.floor(xs.length / 2)] ?? 0;
  return {
    cases: n,
    queries: rows.length,
    caseAnyHit: { a: perCase.filter((c) => c.anyA).length, b: perCase.filter((c) => c.anyB).length },
    meanCaseRecall: { a: +mean(perCase.map((c) => c.recallA)).toFixed(3), b: +mean(perCase.map((c) => c.recallB)).toFixed(3) },
    caseRecallWinsLossesTies: {
      bBetter: perCase.filter((c) => c.recallB > c.recallA).length,
      aBetter: perCase.filter((c) => c.recallA > c.recallB).length,
      tie: perCase.filter((c) => c.recallA === c.recallB).length
    },
    queryGoldenHit: { a: qHitA, b: qHitB },
    softEmpty: { a: softA, b: softB },
    errors: { a: errA, b: errB },
    medianMs: { a: median(rows.map((r) => r.a.ms)), b: median(rows.map((r) => r.b.ms)) },
    p95Ms: {
      a: rows.map((r) => r.a.ms).sort((x, y) => x - y)[Math.floor(rows.length * 0.95)] ?? 0,
      b: rows.map((r) => r.b.ms).sort((x, y) => x - y)[Math.floor(rows.length * 0.95)] ?? 0
    },
    perCase
  };
}

const ops = [...new Set(results.map((r) => r.op))];
const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  cand: CAND,
  jobs: jobs.length,
  completed: results.length,
  all: summarize(() => true),
  transcriptQueries: summarize((r) => r.source === "transcript"),
  questionText: summarize((r) => r.source === "question"),
  byOp: Object.fromEntries(ops.map((op) => {
    const s = summarize((r) => r.op === op && r.source === "transcript");
    return [op, { queries: s.queries, queryGoldenHit: s.queryGoldenHit, softEmpty: s.softEmpty, errors: s.errors }];
  })),
  rows: results
};
writeFileSync(values.out!, JSON.stringify(report, null, 1));
const brief = (s: ReturnType<typeof summarize>) => {
  const { perCase: _perCase, ...rest } = s;
  return rest;
};
console.log(JSON.stringify({
  jobs: report.jobs,
  completed: report.completed,
  all: brief(report.all),
  transcriptQueries: brief(report.transcriptQueries),
  questionText: brief(report.questionText),
  byOp: report.byOp
}, null, 1));
