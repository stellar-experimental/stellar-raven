#!/usr/bin/env node
/**
 * Isolated plain-tool arm for the per-operation architecture A/B.
 *
 * The server exposes the manifest's 60 service operations as ordinary MCP tools.
 * Each call is translated into one call to the existing local Raven `execute`
 * tool, so adapter dispatch, manifest argument validation, normalization,
 * redaction, truncation, telemetry, and the networkless Worker boundary remain
 * the shipped implementation. The harness never starts Wrangler and refuses a
 * non-loopback upstream URL.
 *
 * This is eval infrastructure, not a production registration path.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(QA_DIR, "..", "..");
export const MANIFEST_PATH = path.join(REPO_ROOT, "catalog", "manifest.json");
export const EXPECTED_OPERATION_COUNTS = Object.freeze({ lumenloop: 18, scout: 30, stellarDocs: 12 });
export const EXPECTED_OPERATION_COUNT = 60;

export const PLAIN_SERVER_INSTRUCTIONS = `Plain per-operation Stellar gateway used only by the architecture eval.

Choose directly among the manifest-derived service tools. Use several independent broad tools in parallel when useful, then follow with exact detail tools using ids/slugs returned by the broad calls. Tool names are <service>_<operation>.

Source families:
- lumenloop: community/editorial projects, content, research, SCF and funding context.
- scout: live ecosystem graph for projects, repos, builders, hackathons, partners and rankings.
- stellarDocs: official protocol, SDK, CLI, contract, RPC, asset, anchor and wallet documentation.

Every tool returns the same service envelope as the shipped execute path: { ok: true, data } or { ok: false, error: { service, kind, message, status?, hint? } }. Read payload fields under data. kind="soft-empty" is inconclusive, not evidence of absence. Returned data can be truncated at the same model boundary as execute; narrow later calls and request only the fields needed.`;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function plainToolName(operationId) {
  if (!/^(lumenloop|scout|stellarDocs)\.[A-Za-z0-9_]+$/.test(operationId)) {
    throw new Error(`cannot map non-operation id to a plain tool name: ${operationId}`);
  }
  const operationName = operationId.slice(operationId.indexOf(".") + 1);
  if (operationName.includes("__")) {
    throw new Error(`plain operation names cannot contain double underscores: ${operationId}`);
  }
  return operationId.replace(".", "_");
}

export function operationIdFromPlainTool(name) {
  const match = /^(lumenloop|scout|stellarDocs)_([A-Za-z0-9_]+)$/.exec(String(name));
  if (match?.[2].includes("__")) return null;
  return match ? `${match[1]}.${match[2]}` : null;
}

export function loadPlainOperationSurface(manifestPath = MANIFEST_PATH) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entries = manifest.entries.filter((entry) => entry.kind === "operation").sort((a, b) => a.id.localeCompare(b.id));
  const serviceCounts = Object.fromEntries(Object.keys(EXPECTED_OPERATION_COUNTS).map((service) => [service, 0]));
  const seenNames = new Set();
  const tools = entries.map((entry) => {
    if (!(entry.service in serviceCounts)) throw new Error(`unexpected operation service in manifest: ${entry.id}`);
    serviceCounts[entry.service]++;
    const name = plainToolName(entry.id);
    if (seenNames.has(name)) throw new Error(`plain tool name collision: ${name}`);
    seenNames.add(name);
    return {
      name,
      description: entry.description,
      inputSchema: entry.inputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    };
  });
  if (tools.length !== EXPECTED_OPERATION_COUNT) {
    throw new Error(`manifest operation count drift: expected ${EXPECTED_OPERATION_COUNT}, got ${tools.length}`);
  }
  for (const [service, expected] of Object.entries(EXPECTED_OPERATION_COUNTS)) {
    if (serviceCounts[service] !== expected) {
      throw new Error(`manifest ${service} operation count drift: expected ${expected}, got ${serviceCounts[service]}`);
    }
  }
  const byName = new Map(entries.map((entry) => [plainToolName(entry.id), entry]));
  const serializedTools = JSON.stringify({ tools });
  const advertisedWireChars = serializedTools.length + PLAIN_SERVER_INSTRUCTIONS.length;
  return {
    tools,
    byName,
    metrics: {
      toolCount: tools.length,
      serviceCounts,
      manifestGeneratedAt: manifest.generatedAt ?? null,
      operationIdsSha256: sha256(JSON.stringify(entries.map((entry) => entry.id))),
      operationEntriesSha256: sha256(
        JSON.stringify(
          entries.map(({ id, service, description, inputSchema, outputSchema }) => ({
            id,
            service,
            description,
            inputSchema,
            outputSchema
          }))
        )
      ),
      descriptionsChars: tools.reduce((sum, tool) => sum + tool.description.length, 0),
      inputSchemaChars: tools.reduce((sum, tool) => sum + JSON.stringify(tool.inputSchema).length, 0),
      serializedToolsChars: serializedTools.length,
      instructionsChars: PLAIN_SERVER_INSTRUCTIONS.length,
      advertisedWireChars,
      estimatedAdvertisedWireTokens: Math.ceil(advertisedWireChars / 4),
      metricMeaning: "serialized MCP tool definitions plus server instructions; not consumed model context",
      surfaceSha256: sha256(`${PLAIN_SERVER_INSTRUCTIONS}\n${serializedTools}`)
    }
  };
}

export function assertLoopbackMcpUrl(value) {
  const url = new URL(value);
  const loopback = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
  if (url.protocol !== "http:" || !loopback.has(url.hostname) || url.pathname !== "/mcp") {
    throw new Error(`plain-operation harness upstream must be loopback http://.../mcp, got ${value}`);
  }
  return url.toString();
}

export function executeCodeForOperation(entry, args) {
  const [service, operation] = entry.id.split(".");
  const serializedArgs = JSON.stringify(args ?? {});
  // JSON.parse preserves an own `__proto__` key. Embedding JSON directly as an
  // object literal would instead give that key JavaScript prototype semantics.
  return `async () => ${service}.${operation}(JSON.parse(${JSON.stringify(serializedArgs)}))`;
}

export function parseMcpHttpResponse(text) {
  const body = String(text).trim();
  if (!body) throw new Error("empty MCP HTTP response");
  if (body.startsWith("{")) return JSON.parse(body);
  const dataLines = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  for (const line of dataLines) {
    if (line === "[DONE]") continue;
    return JSON.parse(line);
  }
  throw new Error(`MCP HTTP response had no JSON data event: ${body.slice(0, 200)}`);
}

export async function forwardOperation({ upstreamUrl, entry, args, requestId = 1, fetchImpl = fetch }) {
  const response = await fetchImpl(assertLoopbackMcpUrl(upstreamUrl), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method: "tools/call",
      params: { name: "execute", arguments: { code: executeCodeForOperation(entry, args) } }
    }),
    signal: AbortSignal.timeout(70_000)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`upstream execute HTTP ${response.status}: ${text.slice(0, 500)}`);
  const message = parseMcpHttpResponse(text);
  if (message.error) throw new Error(`upstream execute JSON-RPC error: ${JSON.stringify(message.error).slice(0, 500)}`);
  if (!message.result || !Array.isArray(message.result.content)) {
    throw new Error(`upstream execute returned no CallToolResult: ${text.slice(0, 500)}`);
  }
  return message.result;
}

export function createPlainOperationServer({ upstreamUrl, surface = loadPlainOperationSurface(), fetchImpl = fetch }) {
  const safeUpstreamUrl = assertLoopbackMcpUrl(upstreamUrl);
  const server = new Server(
    { name: "stellar-raven-per-operation-eval", version: "0.1.0" },
    { capabilities: { tools: {} }, instructions: PLAIN_SERVER_INSTRUCTIONS }
  );
  let requestId = 0;
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: surface.tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const entry = surface.byName.get(request.params.name);
    if (!entry) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown plain operation tool: ${request.params.name}` }]
      };
    }
    try {
      return await forwardOperation({
        upstreamUrl: safeUpstreamUrl,
        entry,
        args: request.params.arguments ?? {},
        requestId: ++requestId,
        fetchImpl
      });
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Plain operation proxy failed: ${error instanceof Error ? error.message : String(error)}` }]
      };
    }
  });
  return server;
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const surface = loadPlainOperationSurface();
  if (args.includes("--surface-json")) {
    process.stdout.write(`${JSON.stringify(surface.metrics, null, 2)}\n`);
    return;
  }
  const upstreamUrl = argValue(args, "--upstream");
  if (!upstreamUrl) throw new Error("usage: plain-operation-harness.mjs --upstream http://localhost:<port>/mcp");
  const server = createPlainOperationServer({ upstreamUrl, surface });
  await server.connect(new StdioServerTransport());
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
