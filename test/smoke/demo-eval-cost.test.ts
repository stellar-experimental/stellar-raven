import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDemoChat } from "../../src/demo/chat";
import { mintDemoCookie } from "../../src/demo/auth";
import type { DemoFrame } from "../../src/demo/frames";

// Keep the chat route, AI SDK, plugins, and native parser real.
// Only upstream services are fake; no provider request leaves workerd.
function upstream() {
  const entries: AIGatewayUniversalRequest[] = [];
  const getLog = vi.fn(async (id: string) => {
    expect(id).toBe("private-request-log");
    return { cost: 0.15 };
  });
  const gatewayRun = vi.fn(async (requests: AIGatewayUniversalRequest[]) => {
    entries.push(...requests);
    const chunks = [
      { type: "response.created", response: { id: "response-test", created_at: 1, model: "gpt-5.6-terra" } },
      { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "message-test" } },
      { type: "response.output_text.delta", item_id: "message-test", delta: "answer" },
      { type: "response.output_item.done", output_index: 0, item: { type: "message", id: "message-test" } },
      { type: "response.completed", response: { usage: { input_tokens: 2, output_tokens: 1 } } }
    ];
    return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join(""), {
      headers: { "content-type": "text/event-stream", "cf-aig-log-id": "private-request-log" }
    });
  });
  const run = vi.fn(async (): Promise<Response> => { throw new Error("Unexpected AI.run transport"); });
  const gateway = vi.fn((id: string) => {
    expect(id).toBe("eval-test");
    return { run: gatewayRun, getLog };
  });
  const testEnv = {
    ...env,
    AI: { run, gateway },
    MCP_SERVER_SECRET: "test-only-secret",
    DEV_ALLOW_UNAUTHENTICATED: "false",
    DEMO_AI_GATEWAY_ID: "eval-test",
    DEMO_MODEL_OVERRIDE: "openai/gpt-5.6-terra",
    DEMO_OPENAI_API_MODE: "responses",
    DEMO_REASONING_EFFORT_OVERRIDE: "none"
  } as unknown as Env;
  return { entries, getLog, gatewayRun, run, gateway, testEnv };
}

async function request(testEnv: Env, options: { budget?: string; origin?: string; url?: string; authenticated?: boolean } = {}) {
  const url = options.url ?? "http://localhost/playground/chat";
  const headers = new Headers({ "content-type": "application/json", origin: options.origin ?? new URL(url).origin });
  if (options.budget !== undefined) headers.set("x-raven-eval-max-budget-usd", options.budget);
  if (options.authenticated !== false) {
    headers.set("cookie", await mintDemoCookie(testEnv.MCP_SERVER_SECRET, crypto.randomUUID()));
  }
  const pending: Promise<unknown>[] = [];
  const response = await handleDemoChat(new Request(url, {
    method: "POST", headers, body: JSON.stringify({ messages: [{ role: "user", content: "Say answer without tools." }] })
  }), testEnv, { waitUntil: (promise: Promise<unknown>) => { pending.push(promise); } } as ExecutionContext);
  const body = await response.text();
  await Promise.all(pending);
  const frames = body.split("\n").filter((line) => line.startsWith("data: ")).map((line) => JSON.parse(line.slice(6)) as DemoFrame);
  return { response, body, frames };
}

function chatResponse(model: string, format: "sse" | "json", id: string) {
  const usage = { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 };
  const headers = { "cf-aig-log-id": id };
  if (format === "json") {
    return Response.json({ choices: [{ message: { content: "answer" }, finish_reason: "stop" }], usage }, { headers });
  }
  const chunks = model.startsWith("@")
    ? [{ response: "answer" }, { finish_reason: "stop", usage }]
    : [{ choices: [{ delta: { content: "answer" }, finish_reason: null }] },
      { choices: [{ delta: {}, finish_reason: "stop" }], usage }];
  return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n", {
    headers: { ...headers, "content-type": "text/event-stream; charset=utf-8" }
  });
}

afterEach(() => vi.restoreAllMocks());

describe("evaluation accounting through real provider paths", () => {
  it("returns a complete cost receipt without exposing the Gateway log identity", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const f = upstream();
    const { response, body, frames } = await request(f.testEnv, { budget: "1" });
    expect(response.status).toBe(200);
    expect(frames).toContainEqual({ type: "token", text: "answer" });
    expect(frames.at(-2)).toEqual({ type: "done", reason: "stop" });
    expect(frames.at(-1)).toMatchObject({ type: "eval-cost", costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
    expect(body).not.toContain("private-request-log");
    expect(f.run).not.toHaveBeenCalled();
    expect(f.gatewayRun).toHaveBeenCalledTimes(1);
    expect(f.getLog).toHaveBeenCalledTimes(1);
    expect(f.entries[0]).toMatchObject({ provider: "openai", endpoint: "v1/responses", headers: {
      "cf-aig-collect-log": "true", "cf-aig-collect-log-payload": "false", "cf-aig-max-attempts": "1"
    } });
  });

  it("keeps ordinary requests unlogged and omits evaluation receipts", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const f = upstream();
    const { frames } = await request(f.testEnv);
    expect(frames).toContainEqual({ type: "token", text: "answer" });
    expect(frames.some((frame) => frame.type === "eval-cost")).toBe(false);
    expect(f.getLog).not.toHaveBeenCalled();
    expect(f.entries[0]?.headers).toMatchObject({ "cf-aig-collect-log": "false", "cf-aig-collect-log-payload": "false" });
  });

  it.each(["@cf/moonshotai/kimi-k2.7-code", "moonshotai/kimi-k3"])(
    "accounts for %s through the installed native parser",
    async (model) => {
      vi.spyOn(console, "log").mockImplementation(() => undefined);
      for (const format of ["sse", "json"] as const) {
        const f = upstream();
        f.testEnv.DEMO_MODEL_OVERRIDE = model;
        f.run.mockResolvedValueOnce(chatResponse(model, format, "private-request-log"));
        const { frames, body } = await request(f.testEnv, { budget: "1" });
        expect(frames).toContainEqual({ type: "token", text: "answer" });
        expect(frames.at(-2)).toEqual({ type: "done", reason: "stop" });
        expect(frames.at(-1)).toEqual({
          type: "eval-cost", costUsd: 0.15, reportedCostUsd: 0.15, calls: 1, reportedCalls: 1, error: null
        });
        expect(body).not.toContain("private-request-log");
        expect(f.run).toHaveBeenCalledExactlyOnceWith(model, expect.objectContaining({ stream: true, messages: expect.any(Array) }),
          expect.objectContaining({
            returnRawResponse: true,
            gateway: { id: "eval-test", collectLog: true, retries: { maxAttempts: 1 } },
            extraHeaders: expect.objectContaining({ "cf-aig-collect-log-payload": "false" })
          }));
        expect(f.gatewayRun).not.toHaveBeenCalled();
        expect(f.getLog).toHaveBeenCalledExactlyOnceWith("private-request-log");
      }
    }
  );

  it("settles the primary call before a fallback into a native model", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const f = upstream();
    const model = "@cf/moonshotai/kimi-k2.7-code";
    f.testEnv.DEMO_MODEL_OVERRIDE = `openai/gpt-5.6-terra,${model}`;
    f.gatewayRun.mockResolvedValueOnce(Response.json({ error: { message: "Unavailable" } }, {
      status: 503, headers: { "cf-aig-log-id": "primary-log" }
    }));
    f.getLog.mockImplementation(async (id) => {
      expect(["primary-log", "native-log"]).toContain(id);
      return { cost: id === "primary-log" ? 0.05 : 0.15 };
    });
    f.run.mockImplementationOnce(async () => {
      expect(f.getLog).toHaveBeenCalledExactlyOnceWith("primary-log");
      return chatResponse(model, "sse", "native-log");
    });
    const { frames, body } = await request(f.testEnv, { budget: "1" });
    expect(frames).toContainEqual({ type: "token", text: "answer" });
    expect(frames.at(-2)).toEqual({ type: "done", reason: "stop" });
    expect(frames.at(-1)).toEqual({
      type: "eval-cost", costUsd: 0.2, reportedCostUsd: 0.2, calls: 2, reportedCalls: 2, error: null
    });
    expect(f.gatewayRun).toHaveBeenCalledTimes(1);
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(f.getLog.mock.calls).toEqual([["primary-log"], ["native-log"]]);
    expect(body).not.toMatch(/primary-log|native-log/);
  });

  it("blocks native fallback after a response without a log identifier", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const f = upstream();
    f.testEnv.DEMO_MODEL_OVERRIDE = "moonshotai/kimi-k3,@cf/moonshotai/kimi-k2.7-code";
    const response = chatResponse("moonshotai/kimi-k3", "sse", "missing-log");
    response.headers.delete("cf-aig-log-id");
    f.run.mockResolvedValueOnce(response);
    const { frames } = await request(f.testEnv, { budget: "1" });
    expect(frames).toContainEqual({ type: "error", message: "missing-or-duplicate-answer-log-id" });
    expect(frames.some((frame) => frame.type === "token")).toBe(false);
    expect(frames.at(-1)).toEqual({
      type: "eval-cost", costUsd: null, reportedCostUsd: 0, calls: 1, reportedCalls: 0,
      error: "missing-or-duplicate-answer-log-id"
    });
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(f.gatewayRun).not.toHaveBeenCalled();
    expect(f.getLog).not.toHaveBeenCalled();
  });

  it.each([
    { status: 400, contentType: "application/json", body: JSON.stringify({ errors: [{ code: 8006, message: "temperature must be 1" }] }),
      message: "Answer provider returned HTTP 400. 8006: temperature must be 1" },
    { status: 200, contentType: "text/plain", body: "not a chat response", message: "unsupported-answer-content-type" }
  ])("reports native response errors with retained cost: $message", async ({ status, contentType, body, message }) => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const f = upstream();
    f.testEnv.DEMO_MODEL_OVERRIDE = "moonshotai/kimi-k3";
    f.run.mockResolvedValueOnce(new Response(body, {
      status, headers: { "content-type": contentType, "cf-aig-log-id": "private-request-log" }
    }));
    const { frames } = await request(f.testEnv, { budget: "1" });
    expect(frames).toContainEqual({ type: "error", message });
    expect(frames.some((frame) => frame.type === "token")).toBe(false);
    expect(frames.at(-1)).toEqual({
      type: "eval-cost", costUsd: 0.15, reportedCostUsd: 0.15, calls: 1, reportedCalls: 1, error: null
    });
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(f.getLog).toHaveBeenCalledExactlyOnceWith("private-request-log");
  });

  it("rejects accounting requests before provider access when origin, auth, or host checks fail", async () => {
    for (const [options, code] of [
      [{ origin: "https://other.test" }, 403],
      [{ authenticated: false }, 401],
      [{ url: "https://raven.test/playground/chat" }, 400]
    ] as const) {
      const f = upstream();
      const { response } = await request(f.testEnv, { ...options, budget: "1" });
      expect(response.status).toBe(code);
      expect(f.gateway).not.toHaveBeenCalled();
      expect(f.run).not.toHaveBeenCalled();
    }
  });
});
