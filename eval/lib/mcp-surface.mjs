/**
 * mcp-surface.mjs — one definition of the advertised MCP surface fingerprint.
 *
 * A description A/B arm is only comparable when the server that answered the
 * cases is provably the arm it claims to be. This module owns that proof: the
 * same `surfaceMetrics` shape is stamped into every QA results file
 * (`meta.toolSurface`) and printed by the standalone pre-spend report
 * (eval/report-live-surface.mjs), so a fingerprint captured before a run and a
 * fingerprint recorded during it cannot drift apart.
 *
 * PURITY: no fs, no spawn, no clock, no network. Transport lives in the
 * callers; only the shape and the framing parse live here.
 *
 * `surfaceSha256` is the identity. Its input is deliberately frozen as
 * `${instructions}\n${JSON.stringify({ tools })}` — the value predates this
 * module and is carried forward byte-identically so fingerprints recorded by
 * earlier runs still compare. Everything else in the returned object is
 * reporting detail and may grow; MCP_SURFACE_SCHEMA stamps that growth.
 */
import { createHash } from "node:crypto";

/** Bump when the returned metrics shape changes. Stamped into every report. */
export const MCP_SURFACE_SCHEMA = "mcp-surface-v1";

/**
 * The protocol version every local eval client initializes with. Shared so the
 * QA preflight and the standalone report negotiate identically — two clients
 * on different versions can be served different tool lists.
 */
export const MCP_PROTOCOL_VERSION = "2025-06-18";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");

const chars = (value) =>
  typeof value === "string" ? value.length : JSON.stringify(value ?? {}).length;

/**
 * Fingerprint one advertised surface.
 *
 * @param {Array<object>} tools        `tools/list` result, verbatim.
 * @param {string|null|undefined} instructions  initialize-time server instructions.
 */
export function surfaceMetrics(tools, instructions) {
  const toolList = Array.isArray(tools) ? tools : [];
  const serializedTools = JSON.stringify({ tools: toolList });
  const instructionsText = String(instructions ?? "");
  const instructionsChars = instructionsText.length;
  const advertisedWireChars = serializedTools.length + instructionsChars;
  return {
    schema: MCP_SURFACE_SCHEMA,
    toolCount: toolList.length,
    descriptionsChars: toolList.reduce((sum, tool) => sum + String(tool.description ?? "").length, 0),
    inputSchemaChars: toolList.reduce((sum, tool) => sum + chars(tool.inputSchema), 0),
    outputSchemaChars: toolList.reduce(
      (sum, tool) => sum + (tool.outputSchema === undefined ? 0 : chars(tool.outputSchema)),
      0
    ),
    serializedToolsChars: serializedTools.length,
    instructionsChars,
    instructionsSha256: sha256(instructionsText),
    advertisedWireChars,
    estimatedAdvertisedWireTokens: Math.ceil(advertisedWireChars / 4),
    // Per-tool detail: an arm that trims one description must be readable as
    // such, not as an aggregate that moved for an unknown reason.
    perTool: toolList.map((tool) => ({
      name: String(tool.name ?? ""),
      descriptionChars: String(tool.description ?? "").length,
      inputSchemaChars: chars(tool.inputSchema),
      outputSchemaChars: tool.outputSchema === undefined ? 0 : chars(tool.outputSchema),
      definitionChars: JSON.stringify(tool).length
    })),
    metricMeaning: "serialized MCP tool definitions plus server instructions; not consumed model context",
    surfaceSha256: sha256(`${instructions ?? ""}\n${serializedTools}`)
  };
}

/**
 * Parse one Streamable-HTTP MCP response body. The server answers either a
 * bare JSON-RPC object or an SSE frame; both reach eval clients.
 */
export function parseMcpHttpPayload(text) {
  const body = String(text ?? "");
  const data = body.startsWith("event:") ? body.split("data: ")[1] : body;
  if (data === undefined) throw new Error("MCP SSE frame carried no data: line");
  return JSON.parse(data.trim().split("\n")[0]);
}

/**
 * Compare a measured surface against a declared arm identity. Returns the
 * verdict rather than throwing so a caller can record a mismatch before it
 * decides to stop.
 */
export function checkExpectedSurface(metrics, expectedSha256) {
  const actual = metrics?.surfaceSha256 ?? null;
  const expected = expectedSha256 ? String(expectedSha256).trim().toLowerCase() : null;
  return {
    expected,
    actual,
    checked: expected !== null,
    matches: expected === null ? null : expected === actual
  };
}

/** Require an exact live-surface identity before any paid agent call. */
export function assertExpectedSurface(metrics, expectedSha256, { label = "MCP surface" } = {}) {
  const pin = checkExpectedSurface(metrics, expectedSha256);
  if (!pin.checked) {
    throw new Error(`${label}: --expect-sha256 is required before collection`);
  }
  if (!pin.matches) {
    throw new Error(
      `${label}: expected surfaceSha256 ${pin.expected}, live server serves ${pin.actual}; refusing collection`
    );
  }
  return pin;
}

/** Human-readable one-screen report. Numbers only; no policy claim. */
export function formatSurfaceReport(metrics, { label = "live MCP surface", url = null } = {}) {
  const lines = [
    `${label}${url ? ` · ${url}` : ""}`,
    `schema                     ${metrics.schema}`,
    `tools                      ${metrics.toolCount}`,
    `descriptions               ${metrics.descriptionsChars} chars`,
    `input schemas              ${metrics.inputSchemaChars} chars`,
    `output schemas             ${metrics.outputSchemaChars} chars`,
    `serialized tool list       ${metrics.serializedToolsChars} chars`,
    `server instructions        ${metrics.instructionsChars} chars (sha256 ${metrics.instructionsSha256.slice(0, 12)}…)`,
    `advertised wire            ${metrics.advertisedWireChars} chars (~${metrics.estimatedAdvertisedWireTokens} tokens)`,
    `surfaceSha256              ${metrics.surfaceSha256}`
  ];
  for (const tool of metrics.perTool) {
    lines.push(
      `  ${tool.name.padEnd(10)} description ${String(tool.descriptionChars).padStart(6)} · input ${String(tool.inputSchemaChars).padStart(5)} · output ${String(tool.outputSchemaChars).padStart(6)} · definition ${String(tool.definitionChars).padStart(6)}`
    );
  }
  lines.push(`NOTE: ${metrics.metricMeaning}. Report only — no size threshold is a gate.`);
  return lines.join("\n");
}
