import assert from "node:assert/strict";
import { createAI } from "agents/models/ai-sdk";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, streamText } from "ai";

let networkCalls = 0;
globalThis.fetch = async () => {
  networkCalls++;
  throw new Error("The reproduction must not use the network");
};
const gateway = { id: "test", collectLog: false };
const providerOptions = (effort) => ({ anthropic: { thinking: { type: "adaptive" }, effort } });
const answer = () => Response.json({
  choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "ok" } }],
  usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
});

const catalogCalls = [];
const catalog = createAI({ gateway, binding: {
  async run(model, inputs, options) {
    catalogCalls.push({ model, inputs, options });
    return answer();
  },
  fetch() { throw new Error("A string model must use AI.run"); }
} });
for (const effort of ["low", "xhigh"]) {
  await generateText({ model: catalog("anthropic/claude-fable-5"), prompt: "hi", maxRetries: 0,
    providerOptions: providerOptions(effort) });
}
assert.equal(catalogCalls.length, 2);
for (const call of catalogCalls) {
  assert.equal(call.options.gateway.id, "test");
  assert.equal(call.options.openaiEndpoint, "/v1/chat/completions");
  assert.equal(call.inputs.thinking, undefined);
  assert.equal(call.inputs.output_config, undefined);
  assert.equal(call.inputs.reasoning_effort, undefined);
}
console.log(JSON.stringify({ check: "catalog-drops-anthropic-options", calls: catalogCalls }));

const nativeCalls = [];
const native = createAI({ gateway, binding: {
  run() { throw new Error("A vendor model must use AI.fetch"); },
  async fetch(url, init) {
    nativeCalls.push({ url: String(url), body: JSON.parse(init.body) });
    return Response.json({ id: "test", type: "message", model: "claude-fable-5", role: "assistant",
      content: [{ type: "text", text: "ok" }], stop_reason: "end_turn", stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 } });
  }
} });
await generateText({ model: native(createAnthropic({ apiKey: "unused" })("claude-fable-5")),
  prompt: "hi", maxRetries: 0, providerOptions: providerOptions("xhigh") });
assert.equal(nativeCalls[0].body.thinking.type, "adaptive");
assert.equal(nativeCalls[0].body.output_config.effort, "xhigh");
assert.match(nativeCalls[0].url, /\/anthropic\/v1\/messages$/);
console.log(JSON.stringify({ check: "native-preserves-options-but-changes-transport", calls: nativeCalls }));

const chunk = (text, finish = null) => `data: ${JSON.stringify({ id: "test", model: "moonshotai/kimi-k3",
  choices: [{ index: 0, delta: text ? { content: text } : {}, finish_reason: finish }] })}\n\n`;
const encoder = new TextEncoder();
let inferenceCalls = 0;
let firstChunk = true;
const resumeRequests = [];
// JavaScript permits this unknown field. The public TypeScript settings have no resume option.
const streaming = createAI({ gateway, resume: false, binding: {
  async run() {
    inferenceCalls++;
    return new Response(new ReadableStream({ pull(controller) {
      if (firstChunk) { firstChunk = false; controller.enqueue(encoder.encode(chunk("before"))); }
      else controller.error(new Error("simulated connection failure"));
    } }), { headers: { "content-type": "text/event-stream", "cf-aig-run-id": "existing-run" } });
  },
  async fetch(url) {
    resumeRequests.push(String(url));
    return new Response(chunk("after") + chunk("", "stop") + "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream" } });
  }
} });
const result = streamText({ model: streaming("moonshotai/kimi-k3"), prompt: "hi", maxRetries: 0 });
assert.equal(await result.text, "beforeafter");
assert.equal(inferenceCalls, 1);
assert.equal(resumeRequests.length, 1);
assert.match(resumeRequests[0], /\/run\/existing-run\/resume\?from=1$/);
assert.equal(networkCalls, 0);
console.log(JSON.stringify({ check: "binding-resumes-existing-run", text: await result.text,
  inferenceCalls, resumeRequests, networkCalls }));
