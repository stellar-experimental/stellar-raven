#!/usr/bin/env node
/**
 * capture-proxy.mjs — harness-owned HTTP capture for the agentic routing eval.
 *
 * The evaluated agents transcribe their own curl output into `searchCalls`;
 * the workflow harness never sees the wire, so an omitted/fabricated/
 * mistranscribed page becomes apparently-authoritative telemetry. This proxy
 * closes that gap: the runbook starts it in front of `wrangler dev`, the
 * agents' curl recipe points at the PROXY port, and every exchange is
 * appended to a JSONL file the evaluated agent never touches. After the run,
 * reconcile-capture.mjs joins this log against the workflow rows and rejects
 * any row whose transcript does not match the wire.
 *
 * Responses are fully buffered by design: eval traffic is single-frame SSE
 * tool calls bounded by the server's own truncation caps, never long streams.
 *
 * Usage:
 *   node eval/agentic/capture-proxy.mjs --upstream http://localhost:8788 \
 *     --port 8789 --out eval/agentic/results/capture-<stamp>.jsonl
 *   (--port 0 picks a free port; the bound port is printed on stdout)
 */
import { appendFileSync, mkdirSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const MARKER_HEADER = "x-eval-agent";

function argVal(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

const args = process.argv.slice(2);
const upstream = argVal(args, "--upstream");
const port = Number(argVal(args, "--port") ?? 0);
const out = argVal(args, "--out");
if (!upstream || !out) {
  console.error("usage: capture-proxy.mjs --upstream <url> --out <capture.jsonl> [--port N]");
  process.exit(1);
}
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const requestBody = Buffer.concat(chunks).toString("utf8");
  // Origin-form only: `new URL(req.url, upstream)` would let an absolute-form
  // request line (`POST http://elsewhere/x`) override the upstream and turn
  // this into an open loopback relay for the duration of a run.
  if (!req.url.startsWith("/")) {
    appendFileSync(
      out,
      JSON.stringify({
        ts: new Date().toISOString(),
        marker: req.headers[MARKER_HEADER] ?? null,
        method: req.method,
        path: req.url,
        request: requestBody,
        status: 400,
        error: "non-origin-form request URL refused"
      }) + "\n"
    );
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "capture-proxy refuses non-origin-form request URLs" }));
    return;
  }
  try {
    const upstreamResponse = await fetch(new URL(req.url, upstream), {
      method: req.method,
      headers: {
        ...(req.headers["content-type"] ? { "content-type": req.headers["content-type"] } : {}),
        ...(req.headers.accept ? { accept: req.headers.accept } : {}),
        ...(req.headers.authorization ? { authorization: req.headers.authorization } : {})
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : requestBody
    });
    const responseText = await upstreamResponse.text();
    appendFileSync(
      out,
      JSON.stringify({
        ts: new Date().toISOString(),
        marker: req.headers[MARKER_HEADER] ?? null,
        method: req.method,
        path: req.url,
        request: requestBody,
        status: upstreamResponse.status,
        response: responseText
      }) + "\n"
    );
    res.writeHead(upstreamResponse.status, {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/octet-stream"
    });
    res.end(responseText);
  } catch (error) {
    appendFileSync(
      out,
      JSON.stringify({
        ts: new Date().toISOString(),
        marker: req.headers[MARKER_HEADER] ?? null,
        method: req.method,
        path: req.url,
        request: requestBody,
        status: null,
        error: error.message
      }) + "\n"
    );
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "capture-proxy upstream fetch failed", message: error.message }));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`capture-proxy listening on ${server.address().port} → ${upstream} · capture ${out}`);
});
