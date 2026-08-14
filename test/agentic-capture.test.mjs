/**
 * Tests for the agentic-eval harness-owned capture pair (Solo todo 1257,
 * audit finding R24-SOL-01): capture-proxy.mjs is exercised as a real child
 * process against an in-process stub upstream (passthrough + JSONL capture +
 * marker recording), and reconcile-capture.mjs's wire-vs-transcript logic is
 * pinned on the four outcomes that matter — faithful transcript, mistranscribed
 * page, fabricated call, omitted call — plus the stripped-marker rejection.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { callKey, reconcile, wireSearchCall } from "../eval/agentic/reconcile-capture.mjs";

const PROXY = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "agentic", "capture-proxy.mjs");
const RECONCILER = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "agentic", "reconcile-capture.mjs");

const PAGE = {
  hits: [
    { id: "stellarDocs.search_docs", service: "stellarDocs", kind: "operation", tier: "gated", score: 42 },
    { id: "scout.searchProjects", service: "scout", kind: "operation", tier: "backfill", score: 12 }
  ],
  total: 7,
  truncated: true,
  widerCandidates: [{ id: "lumenloop.search_content_semantic" }]
};
const SSE_RESPONSE = `event: message\ndata: ${JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  result: { content: [{ type: "text", text: JSON.stringify(PAGE) }] }
})}\n\n`;

function searchRequestBody(query) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "search", arguments: { query, limit: 8 } }
  });
}

/** The call shape the workflow harness stores after deriving zeroGated. */
function transcribedCall(query) {
  return {
    query,
    limit: 8,
    hits: PAGE.hits.map(({ id, tier, score }) => ({ id, tier, score })),
    total: PAGE.total,
    truncated: PAGE.truncated,
    zeroGated: false,
    widerCandidateIds: ["lumenloop.search_content_semantic"]
  };
}

function captureEntry(marker, query) {
  return { ts: "2026-07-29T00:00:00Z", marker, method: "POST", path: "/mcp", request: searchRequestBody(query), status: 200, response: SSE_RESPONSE };
}

function runNormalization({
  captureEntries,
  rows,
  summary = { fixture: "unchanged" },
  includeSummary = true,
  outputIsReconciliation = false
}) {
  const root = mkdtempSync(join(tmpdir(), "agentic-normalize-"));
  const capturePath = join(root, "capture.jsonl");
  const resultsPath = join(root, "results.json");
  const reconciliationPath = join(root, "reconciliation.json");
  const outputPath = outputIsReconciliation ? reconciliationPath : join(root, "normalized.json");
  writeFileSync(capturePath, `${captureEntries.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
  const results = includeSummary ? { summary, rows } : { rows };
  writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`);
  const reconciliationText = `${JSON.stringify(reconcile(rows, captureEntries), null, 2)}\n`;
  writeFileSync(reconciliationPath, reconciliationText);
  const child = spawnSync(process.execPath, [
    RECONCILER,
    "--capture", capturePath,
    "--results", resultsPath,
    "--write-normalized", outputPath,
    "--workflow", "wf_fixture",
    "--raw-reconciliation", reconciliationPath
  ], { encoding: "utf8" });
  return {
    root,
    capturePath,
    resultsPath,
    reconciliationPath,
    reconciliationText,
    outputPath,
    child
  };
}

describe("capture-proxy", () => {
  it("passes traffic through and logs marker-keyed JSONL the agent never touches", async () => {
    const root = mkdtempSync(join(tmpdir(), "agentic-capture-"));
    const upstream = http.createServer((req, res) => {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(SSE_RESPONSE);
    });
    await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
    const upstreamPort = upstream.address().port;
    const capturePath = join(root, "capture.jsonl");
    const proxy = spawn(process.execPath, [
      PROXY, "--upstream", `http://127.0.0.1:${upstreamPort}`, "--port", "0", "--out", capturePath
    ]);
    try {
      const proxyPort = await new Promise((resolve, reject) => {
        proxy.stdout.on("data", (chunk) => {
          const match = String(chunk).match(/listening on (\d+)/);
          if (match) resolve(Number(match[1]));
        });
        proxy.on("exit", (code) => reject(new Error(`proxy exited early (${code})`)));
        setTimeout(() => reject(new Error("proxy did not report a port")), 10_000);
      });

      const response = await fetch(`http://127.0.0.1:${proxyPort}/mcp`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "x-eval-agent": "q-fixture:low"
        },
        body: searchRequestBody("soroban storage")
      });
      expect(response.status).toBe(200);
      expect(await response.text()).toBe(SSE_RESPONSE);

      const lines = readFileSync(capturePath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatchObject({ marker: "q-fixture:low", method: "POST", path: "/mcp", status: 200 });
      expect(lines[0].request).toBe(searchRequestBody("soroban storage"));
      expect(lines[0].response).toBe(SSE_RESPONSE);

      // The captured exchange parses into exactly the shape agents transcribe.
      expect(wireSearchCall(lines[0])).toEqual(transcribedCall("soroban storage"));
    } finally {
      proxy.kill();
      upstream.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("reconcile-capture", () => {
  const row = (searchCalls) => ({ caseId: "q-fixture", effort: "low", searchCalls });

  it("accepts a faithful transcript", () => {
    const report = reconcile([row([transcribedCall("soroban storage")])], [captureEntry("q-fixture:low", "soroban storage")]);
    expect(report.summary).toMatchObject({ rows: 1, ok: 1, rejected: 0, unmatchedMarkers: [] });
  });

  it("rejects a mistranscribed page (wrong score) as missing-from-wire + unreported", () => {
    const doctored = transcribedCall("soroban storage");
    doctored.hits[0] = { ...doctored.hits[0], score: 999 };
    const report = reconcile([row([doctored])], [captureEntry("q-fixture:low", "soroban storage")]);
    expect(report.rows[0].status).toBe("rejected");
    expect(report.rows[0].missingFromWire).toHaveLength(1);
    expect(report.rows[0].unreportedOnWire).toHaveLength(1);
  });

  it("rejects a fabricated call and an omitted call", () => {
    const fabricated = reconcile([row([transcribedCall("never sent")])], []);
    expect(fabricated.rows[0]).toMatchObject({ status: "rejected", reportedCalls: 1, wireCalls: 0 });

    const omitted = reconcile(
      [row([transcribedCall("soroban storage")])],
      [captureEntry("q-fixture:low", "soroban storage"), captureEntry("q-fixture:low", "second query the row hid")]
    );
    expect(omitted.rows[0].status).toBe("rejected");
    expect(omitted.rows[0].unreportedOnWire).toHaveLength(1);
  });

  it("rejects wholesale when the marker was stripped, and surfaces stray markers", () => {
    const report = reconcile(
      [row([transcribedCall("soroban storage")])],
      [captureEntry(null, "soroban storage"), captureEntry("q-other:medium", "soroban storage")]
    );
    expect(report.rows[0].status).toBe("rejected");
    expect(report.summary.unmatchedMarkers).toEqual(["q-other:medium"]);
    expect(report.summary.tainted).toBe(true);
  });

  // The five bypasses a five-model adversarial review reproduced against the
  // first cut: each returned status ok / tainted false, i.e. a clean
  // reconciliation certificate over unattributable wire traffic.
  it("fails closed on marker-strip combined with an empty transcript", () => {
    const report = reconcile([row([])], [captureEntry(null, "soroban storage")]);
    expect(report.rows[0]).toMatchObject({ status: "rejected", emptyReportWithTraffic: true });
    expect(report.summary.anomalies).toBe(1);
    expect(report.anomalies[0].kind).toBe("unmarked-search");
    expect(report.summary.tainted).toBe(true);
  });

  it("fails closed when a row omits searchCalls entirely", () => {
    const report = reconcile(
      [{ caseId: "q-fixture", effort: "low" }],
      [captureEntry(null, "soroban storage")]
    );
    expect(report.rows[0].status).toBe("rejected");
    expect(report.summary.tainted).toBe(true);
  });

  it("flags a JSON-RPC batch as an anomaly instead of ignoring it", () => {
    const batch = {
      ...captureEntry("q-fixture:low", "soroban storage"),
      request: JSON.stringify([
        {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: "search", arguments: { query: "soroban storage", limit: 8 } }
        }
      ])
    };
    const report = reconcile([row([])], [batch]);
    expect(report.anomalies[0]).toMatchObject({ kind: "batch" });
    expect(report.summary.tainted).toBe(true);
  });

  it("flags execute-routed discovery as an anomaly (codemode.search inside a script)", () => {
    const exec = {
      ...captureEntry("q-fixture:low", "soroban storage"),
      request: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "execute", arguments: { code: 'codemode.search("soroban storage")' } }
      })
    };
    const report = reconcile([row([])], [exec]);
    expect(report.anomalies[0]).toMatchObject({ kind: "non-search-tool", detail: "execute" });
    expect(report.summary.tainted).toBe(true);
  });

  it("segregates non-200 exchanges as anomalies rather than phantom omissions", () => {
    const failed = { ...captureEntry("q-fixture:low", "soroban storage"), status: 502, response: "" };
    const report = reconcile([row([transcribedCall("soroban storage")])], [
      captureEntry("q-fixture:low", "soroban storage"),
      failed
    ]);
    // The good exchange still reconciles; the 502 does not manufacture an
    // omission, but it does taint the run so it cannot pass unnoticed.
    expect(report.rows[0].status).toBe("ok");
    expect(report.anomalies[0]).toMatchObject({ kind: "non-200" });
    expect(report.summary.tainted).toBe(true);
  });

  it("a fully clean proxied run is not tainted", () => {
    const report = reconcile(
      [row([transcribedCall("soroban storage")])],
      [captureEntry("q-fixture:low", "soroban storage")]
    );
    expect(report.summary).toMatchObject({ ok: 1, rejected: 0, anomalies: 0, tainted: false });
  });

  it("counts repeated identical queries as distinct exchanges", () => {
    const twice = [transcribedCall("soroban storage"), transcribedCall("soroban storage")];
    const ok = reconcile([row(twice)], [captureEntry("q-fixture:low", "soroban storage"), captureEntry("q-fixture:low", "soroban storage")]);
    expect(ok.rows[0].status).toBe("ok");
    const short = reconcile([row(twice)], [captureEntry("q-fixture:low", "soroban storage")]);
    expect(short.rows[0].status).toBe("rejected");
  });

  it("callKey ignores field order — top level AND inside each hit — but binds every value", () => {
    const a = transcribedCall("q");
    const reordered = { widerCandidateIds: a.widerCandidateIds, zeroGated: a.zeroGated, truncated: a.truncated, total: a.total, hits: a.hits, limit: a.limit, query: a.query };
    expect(callKey(reordered)).toBe(callKey(a));
    // The agent's structured output does not guarantee {id, tier, score} order;
    // key order inside a hit used to be load-bearing and rejected honest rows.
    const nestedReorder = { ...a, hits: a.hits.map((h) => ({ score: h.score, tier: h.tier, id: h.id })) };
    expect(callKey(nestedReorder)).toBe(callKey(a));
    for (const changed of [
      { ...a, hits: a.hits.map((h) => ({ ...h, tier: "backfill" })) },
      { ...a, hits: a.hits.map((h) => ({ ...h, score: h.score + 1 })) },
      { ...a, hits: a.hits.map((h) => ({ ...h, id: "other" })) }
    ]) {
      expect(callKey(changed)).not.toBe(callKey(a));
    }
  });
});

describe("reconcile-capture --write-normalized", () => {
  const resultRow = (searchCalls) => ({
    caseId: "q-fixture",
    question: "How does this work?",
    expected: "stellarDocs",
    effort: "low",
    verdict: {
      queriesUsed: ["soroban storage"],
      searchCalls,
      primaryToolId: "stellarDocs.search_docs",
      primaryService: "stellarDocs",
      alternateToolIds: [],
      reasoning: "The official documentation is the best source."
    },
    searchCalls,
    primaryInHits: true
  });

  it("writes a wire-authoritative copy and preserves the raw report plus protected fields", () => {
    const rawCall = transcribedCall("soroban storage");
    rawCall.hits = rawCall.hits.slice(0, 1);
    const row = resultRow([rawCall]);
    row.verdict.searchCalls = [{ ...rawCall, zeroGated: true }];
    const summary = { low: { overall: { n: 1, primaryHit: 1, primaryPct: 100 } } };
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage")],
      rows: [row],
      summary
    });
    try {
      expect(run.child.status, run.child.stderr).toBe(0);
      const normalized = JSON.parse(readFileSync(run.outputPath, "utf8"));
      expect(normalized.summary).toEqual(summary);
      expect(normalized.rows[0].verdict).toEqual(row.verdict);
      expect(normalized.rows[0].rawAgentSearchCalls).toEqual(row.verdict.searchCalls);
      expect(normalized.rows[0].searchCalls).toEqual([transcribedCall("soroban storage")]);
      expect(normalized.rows[0].primaryInHits).toBe(true);
      for (const key of Object.keys(row).filter((key) => !["searchCalls", "primaryInHits"].includes(key))) {
        expect(normalized.rows[0][key]).toEqual(row[key]);
      }
      expect(normalized.normalization).toMatchObject({
        mode: "wire-authoritative",
        workflow: "wf_fixture",
        rawReconciliation: { rows: 1, ok: 0, rejected: 1, anomalies: 0, unmatchedMarkers: [], tainted: true },
        inputs: {
          results: { path: run.resultsPath, sha256: expect.stringMatching(/^[0-9a-f]{64}$/) },
          capture: { path: run.capturePath, sha256: expect.stringMatching(/^[0-9a-f]{64}$/) },
          reconciliation: {
            path: run.reconciliationPath,
            sha256: expect.stringMatching(/^[0-9a-f]{64}$/)
          }
        }
      });
      expect(reconcile(normalized.rows, [captureEntry("q-fixture:low", "soroban storage")]).summary)
        .toMatchObject({ rows: 1, ok: 1, rejected: 0, anomalies: 0, unmatchedMarkers: [], tainted: false });
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not write output when the capture contains an anomaly", () => {
    const run = runNormalization({
      captureEntries: [captureEntry(null, "soroban storage")],
      rows: [resultRow([transcribedCall("soroban storage")])]
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("capture anomalies are fatal");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not write output when the capture contains an unmatched marker", () => {
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage"), captureEntry("q-other:medium", "other")],
      rows: [resultRow([transcribedCall("soroban storage")])]
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("unmatched capture markers are fatal");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not normalize fabricated or omitted query identities", () => {
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "wire query")],
      rows: [resultRow([transcribedCall("reported query")])]
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("query/limit mismatch is fatal");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not normalize duplicate result markers", () => {
    const row = resultRow([transcribedCall("soroban storage")]);
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage")],
      rows: [row, structuredClone(row)]
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("duplicate result marker is fatal");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not overwrite the raw reconciliation input", () => {
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage")],
      rows: [resultRow([transcribedCall("soroban storage")])],
      outputIsReconciliation: true
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("must not overwrite an input artifact");
      expect(readFileSync(run.reconciliationPath, "utf8")).toBe(run.reconciliationText);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not normalize when verdict and top-level query identities differ", () => {
    const row = resultRow([transcribedCall("soroban storage")]);
    row.verdict.searchCalls = [transcribedCall("different query")];
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage")],
      rows: [row]
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("verdict/top-level query/limit mismatch is fatal");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });

  it("does not normalize a result object without a summary", () => {
    const run = runNormalization({
      captureEntries: [captureEntry("q-fixture:low", "soroban storage")],
      rows: [resultRow([transcribedCall("soroban storage")])],
      includeSummary: false
    });
    try {
      expect(run.child.status).toBe(1);
      expect(run.child.stderr).toContain("result summary object is required");
      expect(existsSync(run.outputPath)).toBe(false);
    } finally {
      rmSync(run.root, { recursive: true, force: true });
    }
  });
});
