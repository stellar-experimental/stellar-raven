#!/usr/bin/env node
import { McpServer, InMemoryTransport } from "@modelcontextprotocol/server";
import { Client } from "@modelcontextprotocol/client";
import { registerTools, SERVER_INSTRUCTIONS } from "../src/mcp/tools.ts";
import { formatSurfaceReport, surfaceMetrics } from "../eval/lib/mcp-surface.mjs";

export async function collectMcpSurfaceReport() {
  const server = new McpServer(
    { name: "mcp-surface-report", version: "0.0.0" },
    { instructions: SERVER_INSTRUCTIONS }
  );
  registerTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "mcp-surface-report", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    const { tools } = await client.listTools();
    return surfaceMetrics(tools, SERVER_INSTRUCTIONS);
  } finally {
    await client.close();
    await server.close();
  }
}

const report = await collectMcpSurfaceReport();
process.stdout.write(
  process.argv.includes("--json")
    ? `${JSON.stringify(report, null, 2)}\n`
    : `${formatSurfaceReport(report, { label: "local MCP surface" })}\n`
);
