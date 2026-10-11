import { env } from "cloudflare:test";
import { streamText, type ToolSet } from "ai";
import { describe, expect, it } from "vitest";
import { DEMO_CAPS } from "../../src/demo/budget";
import {
  DEMO_PRIMARY_MODEL,
  demoOpenAiProviderOptions,
  demoTemperatureFor,
  openAiResponses
} from "../../src/demo/model-config";
import { DEMO_SYSTEM_PROMPT } from "../../src/demo/prompt";
import { prepareDemoStep } from "../../src/demo/steps";
import { buildDemoTools } from "../../src/demo/tools";

// The Playground sends its two tools to OpenAI through the Responses API. The
// wire shape of those tools is model-facing, and the provider package decides
// part of it. `@ai-sdk/openai` 4.0.77 changed an omitted `strict` from "not
// sent" to `strict: false`, and 4.0.88 wrapped tool-error output in an `error`
// object. Typecheck, unit, build, and smoke gates all passed across both.
//
// These tests take the tools from the production builder and the model from
// the production factory, capture the requests, and fail when the `strict`
// field, a parameter schema, or the reviewed follow-up request shape changes.
// Descriptions are not pinned here; other tests own them.
//
// The tool-loop test rebuilds the `streamText` call from the production tool
// builder, model factory, settings, and `prepareDemoStep`. It does not run
// `src/demo/chat.ts`, so it omits `abortSignal`, `onStepFinish`, and the step
// limit. test/smoke/server.test.ts covers the assembled route.

type FunctionTool = { type: string; name: string; strict?: unknown; parameters: unknown };
type RequestBody = {
  tools?: FunctionTool[];
  tool_choice?: unknown;
  temperature?: unknown;
  max_output_tokens?: unknown;
  reasoning?: unknown;
  input?: Array<Record<string, unknown>>;
};

const FINAL_STEP_POLICY = "Final-step policy: tools are disabled now.";

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

function model(fetch: typeof globalThis.fetch) {
  return openAiResponses.create({ modelId: "gpt-5.6-terra", fetch } as Parameters<typeof openAiResponses.create>[0]);
}

function tools(): ToolSet {
  return buildDemoTools({ env: env as unknown as Env, emit: () => {} }).tools as ToolSet;
}

async function capturedTools(): Promise<FunctionTool[]> {
  let body: RequestBody | undefined;
  const fetch: typeof globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    // Stop here: no model answers, so no tool executes.
    return new Response(JSON.stringify({ error: { message: "captured", type: "test" } }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  };
  const result = streamText({
    model: model(fetch),
    prompt: "capture",
    maxRetries: 0,
    onError: () => {},
    tools: tools()
  });
  for await (const _part of result.fullStream) {
    // Drain: the request is sent when the stream is read.
  }
  if (!body?.tools) throw new Error("the provider sent no tools");
  return body.tools;
}

function sse(events: unknown[]): Response {
  const text = `${events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("")}data: [DONE]\n\n`;
  return new Response(text, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function functionCall(index: number, id: string, args: string) {
  const item = { type: "function_call", id: `fc_${id}`, call_id: `call_${id}`, name: "search" };
  return [
    { type: "response.output_item.added", output_index: index, item: { ...item, arguments: "" } },
    { type: "response.function_call_arguments.delta", item_id: `fc_${id}`, output_index: index, delta: args },
    { type: "response.output_item.done", output_index: index, item: { ...item, arguments: args, status: "completed" } }
  ];
}

// One valid and one invalid `search` call, then the final tools-disabled step.
async function capturedToolLoop(): Promise<RequestBody[]> {
  const bodies: RequestBody[] = [];
  const created = { type: "response.created", response: { id: "resp_1", created_at: 1, model: "gpt-5.6-terra" } };
  const completed = { type: "response.completed", response: { usage: { input_tokens: 1, output_tokens: 1 } } };
  const fetch: typeof globalThis.fetch = async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    if (bodies.length === 1) {
      return sse([
        created,
        ...functionCall(0, "valid", JSON.stringify({ query: "soroban storage types" })),
        ...functionCall(1, "invalid", JSON.stringify({ query: "" })),
        completed
      ]);
    }
    return sse([
      created,
      { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "msg_1" } },
      { type: "response.output_text.delta", item_id: "msg_1", output_index: 0, delta: "answer" },
      { type: "response.output_item.done", output_index: 0, item: { type: "message", id: "msg_1" } },
      completed
    ]);
  };
  const result = streamText({
    model: model(fetch),
    system: DEMO_SYSTEM_PROMPT,
    messages: [{ role: "user", content: "capture" }],
    tools: tools(),
    stopWhen: () => bodies.length >= 2,
    // Apply the production final-step policy to the second request.
    prepareStep: ({ steps, stepNumber }) =>
      prepareDemoStep({ steps, stepNumber: stepNumber === 0 ? 0 : DEMO_CAPS.maxSteps - 1 }),
    maxOutputTokens: DEMO_CAPS.maxOutputTokens,
    temperature: demoTemperatureFor(DEMO_PRIMARY_MODEL),
    ...demoOpenAiProviderOptions(DEMO_PRIMARY_MODEL, "none"),
    maxRetries: 0,
    onError: () => {}
  });
  for await (const _part of result.fullStream) {
    // Drain both steps.
  }
  return bodies;
}

describe("Playground tools on the OpenAI Responses wire", () => {
  it("sends two function tools with strict mode off", async () => {
    const sent = await capturedTools();
    expect(sent.map((entry) => [entry.type, entry.name])).toEqual([
      ["function", "search"],
      ["function", "execute"]
    ]);
    // `strict` is a model-facing decision made in src/demo/tools.ts. Change it
    // there, measure it, and then update this test.
    for (const entry of sent) expect(entry.strict, entry.name).toBe(false);
  });

  it("sends the parameter schemas recorded here", async () => {
    const sent = await capturedTools();
    // Update a hash only for a reviewed schema change or a reviewed provider
    // normalization change. Print the new schema with `stable(entry.parameters)`.
    const hashes = Object.fromEntries(
      await Promise.all(sent.map(async (entry) => [entry.name, await sha256(entry.parameters)] as const))
    );
    expect(hashes).toEqual({
      search: "c683ff874aeae288a21842cfef134670674ad294b4b96cf44da7d2803943bbfc",
      execute: "8a2d74fec2536309aaab83458396de4e4a0fef6d1184e670f689274c194641a5"
    });
  });

  it("sends the reviewed tool-loop requests", async () => {
    const bodies = await capturedToolLoop();
    expect(bodies).toHaveLength(2);
    const [first, final] = bodies as [RequestBody, RequestBody];
    const settings = {
      model: "gpt-5.6-terra",
      temperature: 0.1,
      max_output_tokens: DEMO_CAPS.maxOutputTokens,
      reasoning: { effort: "none" },
      stream: true
    };
    // Exact top-level keys: a new provider field fails here until reviewed.
    expect(Object.keys(first).sort()).toEqual(
      ["input", "max_output_tokens", "model", "reasoning", "stream", "temperature", "tool_choice", "tools"]
    );
    expect(first).toMatchObject({ ...settings, tool_choice: "auto" });
    expect(first.tools?.map((entry) => entry.name)).toEqual(["search", "execute"]);

    // The tools-disabled final step sends no tools and no tool choice.
    expect(Object.keys(final).sort()).toEqual(
      ["input", "max_output_tokens", "model", "reasoning", "stream", "temperature"]
    );
    expect(final).toMatchObject(settings);

    // Every input item, in order: the system text, the user turn, then the tool loop.
    const items = (input: RequestBody["input"]) =>
      (input ?? []).map((item) => [item.role ?? item.type, item.call_id ?? null]);
    expect(items(first.input)).toEqual([["developer", null], ["user", null]]);
    expect(items(final.input)).toEqual([
      ["developer", null],
      ["user", null],
      ["function_call", "call_valid"],
      ["function_call", "call_invalid"],
      ["function_call_output", "call_valid"],
      ["function_call_output", "call_invalid"]
    ]);
    expect(first.input?.[0]?.content).toBe(DEMO_SYSTEM_PROMPT);
    expect(String(final.input?.[0]?.content)).toContain(DEMO_SYSTEM_PROMPT);
    expect(String(final.input?.[0]?.content)).toContain(FINAL_STEP_POLICY);
    expect(final.input?.[1]).toEqual({ role: "user", content: [{ type: "input_text", text: "capture" }] });

    const history = (final.input ?? []).slice(2);
    // A valid result is the tool's JSON output as is.
    expect(JSON.parse(String(history[2]?.output))).toHaveProperty("hits");
    // An invalid input reaches the model as an `error` object, not bare text.
    const invalid = JSON.parse(String(history[3]?.output)) as { error?: unknown };
    expect(Object.keys(invalid)).toEqual(["error"]);
    expect(String(invalid.error)).toMatch(/^AI_InvalidToolInputError: Invalid input for tool search/);
  });
});
