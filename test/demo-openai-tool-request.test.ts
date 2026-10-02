import { createHash } from "node:crypto";
import { streamText, tool } from "ai";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { openAiResponses } from "../src/demo/model-config";
import { executeInputSchema, rankedSearchInputSchema } from "../src/mcp/tools";

// The Playground sends its two tools to OpenAI through the Responses API. The
// wire shape of those tools is model-facing, and the provider package decides
// part of it. `@ai-sdk/openai` 4.0.77 changed an omitted `strict` from "not
// sent" to `strict: false`. With `strict` omitted, Responses attempts strict
// mode and normalizes the schema; with `strict: false` it uses best-effort
// function calling. Typecheck, unit, build, and smoke gates all passed across
// that change. This test makes a dependency update that alters the request
// fail here instead.
//
// src/demo/tools.ts is Worker-only, so the test rebuilds the two tools the same
// way that module does: `tool({ description, inputSchema: z.object(schema) })`
// with no `strict` option. It uses the production model factory.

type FunctionTool = { type: string; name: string; strict?: unknown; parameters: unknown };

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stable(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const sha256 = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");

async function capturedTools(): Promise<FunctionTool[]> {
  let body: { tools?: FunctionTool[] } | undefined;
  const fetch: typeof globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ error: { message: "captured", type: "test" } }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  };
  const model = openAiResponses.create({ modelId: "gpt-5.6-terra", fetch } as Parameters<typeof openAiResponses.create>[0]);
  const result = streamText({
    model,
    prompt: "capture",
    maxRetries: 0,
    onError: () => {},
    tools: {
      search: tool({
        description: "search",
        inputSchema: z.object(rankedSearchInputSchema),
        execute: async () => ({})
      }),
      execute: tool({
        description: "execute",
        inputSchema: z.object(executeInputSchema),
        execute: async () => ({})
      })
    }
  });
  for await (const _part of result.fullStream) {
    // Drain: the request is sent when the stream is read.
  }
  if (!body?.tools) throw new Error("the provider sent no tools");
  return body.tools;
}

describe("Playground tools on the OpenAI Responses wire", () => {
  it("sends two function tools and leaves strict mode to the API default", async () => {
    const tools = await capturedTools();
    expect(tools.map((entry) => [entry.type, entry.name])).toEqual([
      ["function", "search"],
      ["function", "execute"]
    ]);
    // An explicit `strict` in either direction is a model-facing decision.
    // Make it in src/demo/tools.ts and measure it; do not let a provider
    // default make it. See .agents/TODO.md, "Upgrade ai and @ai-sdk/*".
    for (const entry of tools) expect(entry, entry.name).not.toHaveProperty("strict");
  });

  it("sends the parameter schemas recorded here", async () => {
    const tools = await capturedTools();
    // Update a hash only for a reviewed schema change or a reviewed provider
    // normalization change. Print the new schema with `stable(entry.parameters)`.
    expect(Object.fromEntries(tools.map((entry) => [entry.name, sha256(entry.parameters)]))).toEqual({
      search: "c683ff874aeae288a21842cfef134670674ad294b4b96cf44da7d2803943bbfc",
      execute: "8a2d74fec2536309aaab83458396de4e4a0fef6d1184e670f689274c194641a5"
    });
  });
});
