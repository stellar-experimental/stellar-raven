#!/usr/bin/env node
/**
 * report-live-surface.mjs — fingerprint the surface a BOUND server advertises.
 *
 * This is the pre-spend arm check. `scripts/report-mcp-surface.mjs` measures
 * the source tree in process; this measures the process that will actually
 * answer the cases, over the same Streamable HTTP path an answering agent
 * uses. The two answer different questions: a source-tree report cannot catch
 * "the Wrangler process on this port is serving the other arm".
 *
 * It reuses eval/lib/mcp-surface.mjs, so the fingerprint printed here and the
 * `meta.toolSurface` block stamped by eval/qa/run-qa.mjs are the same numbers
 * and the same `surfaceSha256`.
 *
 * Read-only: initialize + tools/list, nothing else. No model call, no cost.
 *
 * Usage:
 *   node eval/report-live-surface.mjs --port 8788
 *   node eval/report-live-surface.mjs --url http://localhost:8787/mcp --json /tmp/armA.json
 *   node eval/report-live-surface.mjs --port 8788 --expect-sha256 <hex>   # arm pin
 *
 * Flags:
 *   --url URL           full server URL (`/mcp` appended when missing)
 *   --port N            shorthand for http://localhost:N/mcp (default 8788)
 *   --label NAME        arm label recorded in the artifact (default "live")
 *   --json PATH         also write the report as JSON
 *   --expect-sha256 HEX refuse (exit 1) unless the live surfaceSha256 matches
 *
 * A non-local target needs a full named credential in RAVEN_MCP_BEARER_TOKEN.
 * The token is sent and never printed.
 */
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  MCP_PROTOCOL_VERSION,
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
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${url} → HTTP ${response.status}: ${text.slice(0, 200)}`);
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

  const surface = await fetchLiveSurface(url, {
    token: process.env.RAVEN_MCP_BEARER_TOKEN ?? null
  });
  const pin = checkExpectedSurface(surface.metrics, expectSha256);
  const report = {
    label,
    capturedAt: new Date().toISOString(),
    url: surface.url,
    protocolVersion: surface.protocolVersion,
    serverInfo: surface.serverInfo,
    toolNames: surface.toolNames,
    surfacePin: pin,
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
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`report-live-surface failed: ${error.message}`);
    process.exit(1);
  });
}
