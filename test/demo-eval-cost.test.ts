import { afterEach, describe, expect, it, vi } from "vitest";
import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { openai } from "workers-ai-provider/openai";
import { createEvalCostBinding } from "../src/demo/eval-cost";

function fixture(costs: number[], ids: (string | null)[] = ["one", "two"]) {
  const run = vi.fn(async () => {
    const id = ids.shift();
    return new Response("stream", { headers: id ? { "cf-aig-log-id": id } : {} });
  });
  const getLog = vi.fn(async () => ({ cost: costs.shift() }));
  const ai = { run, gateway: () => ({ getLog }) } as unknown as Ai;
  const accounting = createEvalCostBinding(ai, "eval", 1);
  const call = () => accounting.binding.run("openai/gpt-5.4", {}, { returnRawResponse: true });
  return { accounting, call, run, getLog };
}

describe("loopback answer cost accounting", () => {
  afterEach(() => vi.useRealTimers());

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
  it("settles each stream before another provider call, including fallback calls", async () => {
    const f = fixture([0.4, 0.6]);
    await f.call();
    expect(f.getLog).not.toHaveBeenCalled();
    await f.call();
    expect(f.getLog).toHaveBeenCalledWith("one");
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 1, calls: 2, reportedCalls: 2 });
    await expect(f.call()).rejects.toThrow(/exhausted/);
    expect(f.run).toHaveBeenCalledTimes(2);
    expect(f.run).toHaveBeenCalledWith("openai/gpt-5.4", {}, expect.objectContaining({
      gateway: { id: "eval", collectLog: true, retries: { maxAttempts: 1 } },
      extraHeaders: { "cf-aig-collect-log-payload": "false" }
    }));
  });

  it("stops after a missing log identity or transport failure", async () => {
    const f = fixture([], [null]);
    await f.call();
    await expect(f.call()).rejects.toThrow(/log-id/);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: null, calls: 1, reportedCalls: 0 });
    const g = fixture([]);
    g.run.mockRejectedValueOnce(new Error("network"));
    await expect(g.call()).rejects.toThrow("network");
    await expect(g.call()).rejects.toThrow(/missing-answer-cost/);
    expect(g.run).toHaveBeenCalledTimes(1);
  });

  it("retains the cost when one call exceeds its authorization", async () => {
    const f = fixture([1.1]);
    await f.call();
    await expect(f.call()).rejects.toThrow(/exceeds/);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: 1.1, error: "answer-cost-exceeds-authorization" });
  });

  it("rejects unsupported transports before a provider call", async () => {
    const f = fixture([]);
    await expect(f.accounting.binding.run("openai/gpt-5.4", {})).rejects.toThrow(/raw-response/);
    expect(f.run).not.toHaveBeenCalled();
  });

  it("retries only log reads and stops when costs remain unavailable", async () => {
    vi.useFakeTimers();
    const f = fixture([]);
    await f.call();
    const blocked = expect(f.call()).rejects.toThrow(/missing-answer-cost/);
    await vi.runAllTimersAsync();
    await blocked;
    expect(f.getLog).toHaveBeenCalledTimes(5);
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(await f.accounting.finish()).toMatchObject({ costUsd: null, reportedCostUsd: 0, reportedCalls: 0 });
  });

  it("bounds unavailable log reads and preserves partial reported costs", async () => {
    vi.useFakeTimers();
    const f = fixture([0.2]);
    await f.call();
    await f.call();
    f.getLog.mockImplementation(() => new Promise(() => {}));
    const finished = f.accounting.finish();
    await vi.runAllTimersAsync();
    expect(await finished).toMatchObject({ costUsd: null, reportedCostUsd: 0.2, calls: 2, reportedCalls: 1 });
  });
});
