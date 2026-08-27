export type McpSurfaceMetrics = {
  schema: string;
  toolCount: number;
  descriptionsChars: number;
  inputSchemaChars: number;
  outputSchemaChars: number;
  serializedToolsChars: number;
  instructionsChars: number;
  instructionsSha256: string;
  advertisedWireChars: number;
  estimatedAdvertisedWireTokens: number;
  perTool: Array<{
    name: string;
    descriptionChars: number;
    inputSchemaChars: number;
    outputSchemaChars: number;
    definitionChars: number;
  }>;
  metricMeaning: string;
  surfaceSha256: string;
};

export function surfaceMetrics(
  tools: ReadonlyArray<Record<string, unknown>>,
  instructions?: string | null
): McpSurfaceMetrics;

export function formatSurfaceReport(
  metrics: McpSurfaceMetrics,
  options?: { label?: string; url?: string | null }
): string;

export const MCP_SURFACE_SCHEMA: string;
export const MCP_PROTOCOL_VERSION: string;

export function parseMcpHttpPayload(text: string): Record<string, unknown>;

export type McpSurfacePin = {
  expected: string | null;
  actual: string | null;
  checked: boolean;
  matches: boolean | null;
};

export function checkExpectedSurface(
  metrics: McpSurfaceMetrics,
  expectedSha256?: string | null
): McpSurfacePin;

export function assertExpectedSurface(
  metrics: McpSurfaceMetrics,
  expectedSha256?: string | null,
  options?: { label?: string }
): McpSurfacePin;
