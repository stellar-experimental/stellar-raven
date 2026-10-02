import { env } from "cloudflare:test";
import { streamText, type ToolSet } from "ai";
import { describe, expect, it } from "vitest";
import { openAiResponses } from "../../src/demo/model-config";
import { buildDemoTools } from "../../src/demo/tools";

// The Playground sends its two tools to OpenAI through the Responses API. The
// wire shape of those tools is model-facing, and the provider package decides
// part of it. `@ai-sdk/openai` 4.0.77 changed an omitted `strict` from "not
// sent" to `strict: false`. With `strict` omitted, Responses attempts strict
// mode and falls back to non-strict when it cannot convert the schema; with
// `strict: false` it uses best-effort function calling from the start.
// Typecheck, unit, build, and smoke gates all passed across that change.
//
// This test takes the tools from the production builder and the model from the
// production factory, captures the request, and fails when the `strict` field
// or a parameter schema changes. Descriptions are not pinned here; other tests
// own them.

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

async function sha256(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(stable(value)));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function capturedTools(): Promise<FunctionTool[]> {
  let body: { tools?: FunctionTool[] } | undefined;
  const fetch: typeof globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    // Stop here: no model answers, so no tool executes.
    return new Response(JSON.stringify({ error: { message: "captured", type: "test" } }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  };
  const model = openAiResponses.create({ modelId: "gpt-5.6-terra", fetch } as Parameters<typeof openAiResponses.create>[0]);
  const built = buildDemoTools({ env: env as unknown as Env, emit: () => {} });
  const result = streamText({
    model,
    prompt: "capture",
    maxRetries: 0,
    onError: () => {},
    tools: built.tools as ToolSet
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
    // Make it in src/demo/tools.ts, measure it, and then update this test. Do
    // not let a provider default make it. See .agents/TODO.md, "Upgrade `ai`".
    for (const entry of tools) expect(entry, entry.name).not.toHaveProperty("strict");
  });

  it("sends the parameter schemas recorded here", async () => {
    const tools = await capturedTools();
    // Update a hash only for a reviewed schema change or a reviewed provider
    // normalization change. Print the new schema with `stable(entry.parameters)`.
    const hashes = Object.fromEntries(
      await Promise.all(tools.map(async (entry) => [entry.name, await sha256(entry.parameters)] as const))
    );
    expect(hashes).toEqual({
      search: "c683ff874aeae288a21842cfef134670674ad294b4b96cf44da7d2803943bbfc",
      execute: "8a2d74fec2536309aaab83458396de4e4a0fef6d1184e670f689274c194641a5"
    });
  });
});
