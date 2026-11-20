#!/usr/bin/env node
/**
 * Pre-spend live MCP surface fingerprinter (read-only: `initialize` + `tools/list`, zero cost).
 * Measures the bound server over Streamable HTTP using `eval/lib/mcp-surface.mjs` so its
 * `surfaceSha256` matches `meta.toolSurface` in `eval/qa/run-qa.mjs`.
 *
 * Usage:
 *   node eval/report-live-surface.mjs [--port 8788 | --url <url>] [--label <name>]
 *     [--json <path>] [--expect-sha256 <hex>] [--expect-source-revision <sha>]
 *
 * Non-local targets require `RAVEN_MCP_BEARER_TOKEN` (sent in `Authorization`, not logged directly;
 * HTTP error paths still print up to 200 chars of the server response body).
 */
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  MCP_PROTOCOL_VERSION,
  checkExpectedSourceRevision,
  checkExpectedSurface,
  formatSurfaceReport,
  parseMcpHttpPayload,
  surfaceMetrics
} from "./lib/mcp-surface.mjs";

const CLIENT = { name: "report-live-surface", version: "0" };

export function normalizeServerUrl(value) {
  const url = new URL(String(value));
  if (!url.pathname || url.pathname === "/") url.pathname = "/mcp";
  return url.toString();
}

/**
 * Initialize, list tools, fingerprint. `fetchImpl` is injectable for tests.
 */
export async function fetchLiveSurface(url, { fetchImpl = fetch, token = null } = {}) {
  const post = async (body) => {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        // Paid discovery can call this after a synchronous agent. Use a fresh
        // connection; see research/audits/2026-08-27-qa-postflight-keepalive.md.
        connection: "close",
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    if (!response.ok) {
      // A proxy can echo the Authorization header; never print the token. fetch trims header values, so redact the trimmed token too.
      const excerpt = token ? text.split(token).join("[redacted]").split(token.trim()).join("[redacted]") : text;
      throw new Error(`${url} → HTTP ${response.status}: ${excerpt.slice(0, 200)}`);
    }
    return parseMcpHttpPayload(text);
  };

  const initialized = await post({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {}, clientInfo: CLIENT }
  });
  const listed = await post({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const tools = listed.result?.tools ?? [];
  if (tools.length === 0) {
    throw new Error(`${url} advertised no tools — wrong port, or the server is not the arm you think`);
  }
  return {
    url,
    protocolVersion: initialized.result?.protocolVersion ?? null,
    serverInfo: initialized.result?.serverInfo ?? null,
    toolNames: tools.map((tool) => String(tool.name ?? "")),
    metrics: surfaceMetrics(tools, initialized.result?.instructions)
  };
}

async function main(argv) {
  const argVal = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const port = argVal("--port") ?? "8788";
  const url = normalizeServerUrl(argVal("--url") ?? `http://localhost:${port}/mcp`);
  const label = argVal("--label") ?? "live";
  const jsonPath = argVal("--json");
  const expectSha256 = argVal("--expect-sha256");
  const expectSourceRevision = argVal("--expect-source-revision");

  const surface = await fetchLiveSurface(url, {
    token: process.env.RAVEN_MCP_BEARER_TOKEN ?? null
  });
  const pin = checkExpectedSurface(surface.metrics, expectSha256);
  const sourceRevisionPin = checkExpectedSourceRevision(surface.serverInfo, expectSourceRevision);
  const report = {
    label,
    capturedAt: new Date().toISOString(),
    url: surface.url,
    protocolVersion: surface.protocolVersion,
    serverInfo: surface.serverInfo,
    toolNames: surface.toolNames,
    surfacePin: pin,
    sourceRevisionPin,
    ...surface.metrics
  };

  console.log(formatSurfaceReport(surface.metrics, { label: `${label} MCP surface`, url: surface.url }));
  if (jsonPath) {
    writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");
    console.log(`wrote ${jsonPath}`);
  }
  if (pin.checked && !pin.matches) {
    throw new Error(
      `arm pin FAILED: expected surfaceSha256 ${pin.expected}, live server serves ${pin.actual} — ` +
        `this process is not the declared arm; do not spend against it`
    );
  }
  if (pin.checked) console.log(`arm pin OK: ${pin.actual}`);
  if (sourceRevisionPin.checked && !sourceRevisionPin.matches) {
    throw new Error(
      `source revision pin FAILED: expected ${sourceRevisionPin.expected}, live Worker reports ${sourceRevisionPin.actual ?? "none"}`
    );
  }
  if (sourceRevisionPin.checked) console.log(`source revision pin OK: ${sourceRevisionPin.actual}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`report-live-surface failed: ${error.message}`);
    process.exit(1);
  });
}
