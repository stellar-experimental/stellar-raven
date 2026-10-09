import { afterEach, describe, expect, it, vi } from "vitest";
import { generateText, streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { openai } from "workers-ai-provider/openai";
import { createEvalCostBinding } from "../src/demo/eval-cost";
import { DEMO_PRIMARY_MODEL, demoGatewayOptions, demoModelSettings, openAiResponses } from "../src/demo/model-config";

function fixture(costs: number[], ids: (string | null)[] = ["one", "two"], transport = "binding") {
  const run = vi.fn(async () => {
    const id = ids.shift();
    return new Response("stream", { headers: { "content-type": "text/event-stream", ...(id ? { "cf-aig-log-id": id } : {}) } });
  });
  const getLog = vi.fn(async () => ({ cost: costs.shift() }));
  const ai = { run, gateway: () => ({ getLog, run }) } as unknown as Ai;
  const accounting = createEvalCostBinding(ai, "eval", 1);
  const call = () => transport === "native"
    ? accounting.binding.run("@cf/moonshotai/kimi-k2.7-code", { messages: [], stream: true })
    : transport === "binding"
    ? accounting.binding.run("openai/gpt-5.4", {}, { returnRawResponse: true })
    : accounting.binding.gateway("eval").run({ provider: "openai", endpoint: "v1/responses", headers: {}, query: {} });
  return { accounting, call, run, getLog };
}

describe("loopback answer cost accounting", () => {
  afterEach(() => vi.useRealTimers());

  it("accounts for the production Responses gateway transport", async () => {
    const entries: AIGatewayUniversalRequest[] = [];
    const getLog = vi.fn(async () => ({ cost: 0.15 }));
    const run = vi.fn(() => { throw new Error("Responses must use the Gateway transport"); });
    const ai = {
      run,
      gateway: (id: string) => {
        expect(id).toBe("eval");
        return {
          getLog,
          async run(requests: AIGatewayUniversalRequest[]) {
            entries.push(...requests);
            const chunks = [
              { type: "response.created", response: { id: "resp-test", created_at: 1, model: DEMO_PRIMARY_MODEL } },
              { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "msg-test" } },
              { type: "response.output_text.delta", item_id: "msg-test", delta: "answer" },
              { type: "response.output_item.done", output_index: 0, item: { type: "message", id: "msg-test" } },
              { type: "response.completed", response: { usage: { input_tokens: 2, output_tokens: 1 } } }
            ];
            return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join(""), {
              headers: { "content-type": "text/event-stream", "cf-aig-log-id": "responses-log" }
            });
          }
        };
      }
    } as unknown as Ai;
    const accounting = createEvalCostBinding(ai, "eval", 1);
    const provider = createWorkersAI({
      binding: accounting.binding, gateway: demoGatewayOptions("eval"), providers: [openAiResponses], resume: false
    });
    const result = streamText({
      model: provider(DEMO_PRIMARY_MODEL, demoModelSettings(DEMO_PRIMARY_MODEL, "test-affinity", "none")),
      prompt: "question", maxRetries: 0
    });
    expect(await result.text).toBe("answer");
    expect(await accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
    expect(run).not.toHaveBeenCalled();
    expect(getLog).toHaveBeenCalledWith("responses-log");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ endpoint: "v1/responses", headers: {
      "cf-aig-collect-log": "true", "cf-aig-collect-log-payload": "false", "cf-aig-max-attempts": "1"
    } });
  });

  it("captures the Gateway identity through the installed provider's streaming transport", async () => {
    const f = fixture([0.15]);
    const chunk = (choices: unknown[], usage?: unknown) => `data: ${JSON.stringify({
      id: "chat-1", model: "gpt-5.4", created: 1, choices, ...(usage ? { usage } : {})
    })}\n\n`;
    f.run.mockResolvedValueOnce(new Response(
      chunk([{ index: 0, delta: { role: "assistant", content: "answer" }, finish_reason: null }]) +
      chunk([{ index: 0, delta: {}, finish_reason: "stop" }], { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 }) +
      "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream", "cf-aig-log-id": "real-transport" } }
    ));
    const provider = createWorkersAI({ binding: f.accounting.binding, gateway: { id: "eval" }, providers: [openai], resume: false });
    const result = streamText({ model: provider("openai/gpt-5.4"), prompt: "question", maxRetries: 0 });
    expect(await result.text).toBe("answer");
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1 });
    expect(f.getLog).toHaveBeenCalledWith("real-transport");
  });
  it.each(["binding", "gateway", "native"])("settles %s streams before another provider call, including fallback calls", async (transport) => {
    const f = fixture([0.4, 0.6], undefined, transport);
    await f.call();
    expect(f.getLog).not.toHaveBeenCalled();
    await f.call();
    expect(f.getLog).toHaveBeenCalledWith("one");
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 1, calls: 2, reportedCalls: 2 });
    await expect(f.call()).rejects.toThrow(/exhausted/);
    expect(f.run).toHaveBeenCalledTimes(2);
    const controls = expect.objectContaining({
      gateway: { id: "eval", collectLog: true, retries: { maxAttempts: 1 } },
      extraHeaders: { "cf-aig-collect-log-payload": "false" }
    });
    if (transport === "native") expect(f.run).toHaveBeenCalledWith(
      "@cf/moonshotai/kimi-k2.7-code", { messages: [], stream: true }, controls
    );
    else if (transport === "binding") expect(f.run).toHaveBeenCalledWith("openai/gpt-5.4", {}, controls);
    else expect(f.run).toHaveBeenCalledWith([expect.objectContaining({ headers: {
      "cf-aig-collect-log": "true", "cf-aig-collect-log-payload": "false", "cf-aig-max-attempts": "1"
    } })], controls);
  });

  it.each(["binding", "gateway", "native"])("stops %s after a missing log identity or transport failure", async (transport) => {
    const f = fixture([], [null], transport);
    if (transport === "native") await expect(f.call()).rejects.toThrow(/log-id/);
    else await f.call();
    await expect(f.call()).rejects.toThrow(/log-id/);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: null, calls: 1, reportedCalls: 0 });
    const g = fixture([], undefined, transport);
    g.run.mockRejectedValueOnce(new Error("network"));
    await expect(g.call()).rejects.toThrow("network");
    await expect(g.call()).rejects.toThrow(/missing-answer-cost/);
    expect(g.run).toHaveBeenCalledTimes(1);
  });

  it.each(["binding", "gateway", "native"])("retains %s cost when one call exceeds its authorization", async (transport) => {
    const f = fixture([1.1], undefined, transport);
    await f.call();
    await expect(f.call()).rejects.toThrow(/exceeds/);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 1.1, error: "answer-cost-exceeds-authorization" });
  });

  it("rejects unsupported transports before a provider call", async () => {
    const f = fixture([]);
    await expect(f.accounting.binding.run("openai/gpt-5.4", {})).rejects.toThrow(/raw-response/);
    expect(f.run).not.toHaveBeenCalled();
  });

  it("preserves the full response for raw callers", async () => {
    const f = fixture([0.15]);
    const response = new Response("body", { status: 503, headers: { "cf-aig-log-id": "raw-log" } });
    f.run.mockResolvedValueOnce(response);
    expect(await f.call()).toBe(response);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, error: null });
    expect(f.getLog).toHaveBeenCalledWith("raw-log");
  });

  it("returns parsed JSON to the installed non-streaming native parser", async () => {
    const f = fixture([0.15]);
    f.run.mockResolvedValueOnce(Response.json({ response: "answer", usage: { prompt_tokens: 2, completion_tokens: 1 } }, {
      headers: { "cf-aig-log-id": "json-log" }
    }));
    const provider = createWorkersAI({ binding: f.accounting.binding, gateway: { id: "eval" } });
    const result = await generateText({ model: provider("@cf/moonshotai/kimi-k2.7-code"), prompt: "question", maxRetries: 0 });
    expect(result.text).toBe("answer");
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
    expect(f.getLog).toHaveBeenCalledWith("json-log");
  });

  it("retains captured cost when native response parsing fails", async () => {
    const f = fixture([0.15], undefined, "native");
    f.run.mockResolvedValueOnce(new Response("invalid JSON", { headers: {
      "cf-aig-log-id": "bad-json", "content-type": "application/json; charset=utf-8"
    } }));
    await expect(f.call()).rejects.toThrow(SyntaxError);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
    expect(f.getLog).toHaveBeenCalledWith("bad-json");
  });

  it.each([
    [JSON.stringify({ errors: [{ code: 8006, message: "temperature must be 1" }] }), " 8006: temperature must be 1"],
    [JSON.stringify({ internalCode: 3040, description: "out of capacity" }), " 3040: out of capacity"],
    ["not JSON", ""]
  ])("retains native HTTP error details and cost for %s", async (body, detail) => {
    const f = fixture([0.15], undefined, "native");
    const response = new Response(body, { status: 400, headers: { "cf-aig-log-id": "error-log" } });
    f.run.mockResolvedValueOnce(response);
    await expect(f.call()).rejects.toThrow(`Answer provider returned HTTP 400.${detail}`);
    expect(response.bodyUsed).toBe(true);
    expect(response.body?.locked).toBe(false);
    expect(await f.accounting.finish()).toEqual({
      costUsd: 0.15, reportedCostUsd: 0.15, calls: 1, reportedCalls: 1, error: null
    });
    expect(f.getLog).toHaveBeenCalledExactlyOnceWith("error-log");
  });

  it("bounds native HTTP error reads and cancels the unread body", async () => {
    const f = fixture([0.15], undefined, "native");
    const cancel = vi.fn();
    const pull = vi.fn((controller: ReadableStreamDefaultController<Uint8Array>) => {
      controller.enqueue(new TextEncoder().encode(" ".repeat(8 * 1024)));
    });
    const response = new Response(new ReadableStream({ pull, cancel }, { highWaterMark: 0 }), {
      status: 503, headers: { "cf-aig-log-id": "bounded-error" }
    });
    f.run.mockResolvedValueOnce(response);
    await expect(f.call()).rejects.toThrow("Answer provider returned HTTP 503.");
    expect(pull).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
  });

  it("retains captured cost when the SSE body is missing", async () => {
    const f = fixture([0.15], undefined, "native");
    f.run.mockResolvedValueOnce(new Response(null, {
      headers: { "content-type": "text/event-stream", "cf-aig-log-id": "empty-stream" }
    }));
    await expect(f.call()).rejects.toThrow("missing-answer-stream");
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 0.15, calls: 1, reportedCalls: 1, error: null });
    expect(f.getLog).toHaveBeenCalledExactlyOnceWith("empty-stream");
  });

  it.each([null, "text/plain", "application/octet-stream"])(
    "names unsupported native content type %s and retains its cost",
    async (contentType) => {
      const f = fixture([0.15], undefined, "native");
      const cancel = vi.fn();
      const response = new Response(new ReadableStream({ cancel }), {
        headers: { "cf-aig-log-id": "unsupported-type", ...(contentType ? { "content-type": contentType } : {}) }
      });
      f.run.mockResolvedValueOnce(response);
      await expect(f.call()).rejects.toThrow("unsupported-answer-content-type");
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(await f.accounting.finish()).toEqual({
        costUsd: 0.15, reportedCostUsd: 0.15, calls: 1, reportedCalls: 1, error: null
      });
      expect(f.getLog).toHaveBeenCalledExactlyOnceWith("unsupported-type");
    }
  );

  it.each(["binding", "gateway", "native"])("retries only %s log reads and stops when costs remain unavailable", async (transport) => {
    vi.useFakeTimers();
    const f = fixture([], undefined, transport);
    await f.call();
    const blocked = expect(f.call()).rejects.toThrow(/missing-answer-cost/);
    await vi.runAllTimersAsync();
    await blocked;
    expect(f.getLog).toHaveBeenCalledTimes(5);
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: null, reportedCostUsd: 0, reportedCalls: 0 });
  });

  it.each(["binding", "gateway", "native"])("bounds unavailable %s log reads and preserves partial reported costs", async (transport) => {
    vi.useFakeTimers();
    const f = fixture([0.2], undefined, transport);
    await f.call();
    await f.call();
    f.getLog.mockImplementation(() => new Promise(() => {}));
    const finished = f.accounting.finish();
    await vi.runAllTimersAsync();
    expect(await finished).toMatchObject({ costUsd: null, reportedCostUsd: 0.2, calls: 2, reportedCalls: 1 });
  });

  it("shares accounting across transport changes and rejects duplicate log identities", async () => {
    const f = fixture([0.4], ["same", "same"]);
    await f.call();
    await f.accounting.binding.gateway("eval").run({ provider: "openai", endpoint: "v1/responses", headers: {}, query: {} });
    expect(await f.accounting.finish()).toMatchObject({
      costUsd: null, reportedCostUsd: 0.4, calls: 2, reportedCalls: 1, error: "missing-or-duplicate-answer-log-id"
    });
    await expect(f.call()).rejects.toThrow(/log-id/);
    expect(f.run).toHaveBeenCalledTimes(2);
    expect(f.getLog).toHaveBeenCalledTimes(1);
  });

  it("rejects another gateway and hidden server-side fallback before dispatch", async () => {
    const f = fixture([]);
    expect(() => f.accounting.binding.gateway("other")).toThrow(/gateway-mismatch/);
    const entry = { provider: "openai", endpoint: "v1/responses", headers: {}, query: {} };
    await expect(f.accounting.binding.gateway("eval").run([entry, entry])).rejects.toThrow(/single-gateway-entry/);
    expect(f.run).not.toHaveBeenCalled();
    expect(f.getLog).not.toHaveBeenCalled();
  });
});
