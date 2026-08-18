/**
 * POST /playground/chat — the stateless SSE chat turn.
 *
 * Gauntlet order: method → CSRF/origin (Origin must equal the request
 * origin; Sec-Fetch-Site, when present, must be "same-origin" — "same-site"
 * is rejected on purpose, the worker serves two same-site custom domains) →
 * auth (signed demo cookie, or the loopback-only dev bypass shared with
 * /mcp) → body validation (size-capped BEFORE parse; a malformed body must
 * not burn a throttle slot) → best-effort KV throttle. Only then does a
 * model turn start: streamText over the AI binding — routed through the AI
 * Gateway whose spend-limit rule is the mandatory account-level cost
 * backstop — with the two demo tools, the production
 * SERVER_INSTRUCTIONS + playground preamble as system prompt, and
 * fullStream translated to DemoFrame SSE events. The whole turn is bounded
 * by one abort signal: client disconnect (stream cancel) or the turn
 * timeout stops model + tool spend, not just frame delivery.
 * tool-start/tool-result frames are emitted by the tools themselves
 * (src/demo/tools.ts); here only token/step/done/error mapping remains
 * (part names re-verified against ai v7's TextStreamPart union: text-delta,
 * reasoning-delta, start-step, tool-error, abort, error, finish — all
 * unchanged from v6, and `finish` still carries finishReason + totalUsage).
 * The switch below is over a discriminated union, so a renamed part is a type
 * error rather than a silent no-op — but the demo tests mock streamText, so
 * only a live turn exercises the provider network path.
 *
 * WORKER-ONLY MODULE: imports src/demo/tools.ts (→ src/executor/run.ts →
 * cloudflare:workers). Route coverage lives in test/smoke/server.test.ts.
 */
import { stepCountIs, streamText, type ToolSet } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createWorkersAI } from "workers-ai-provider";
import { openai as openaiChat } from "workers-ai-provider/openai";
import { google as googleGemini } from "workers-ai-provider/google";
import { allowDevUnauthenticated } from "../auth/gate.ts";
import { logEvent } from "../observability.ts";
import { verifyDemoCookie } from "./auth.ts";
import { DEMO_CAPS, clampHistory, createDemoToolBudget, demoThrottle } from "./budget.ts";
import { encodeFrame, type DemoFrame } from "./frames.ts";
import {
  DEMO_GATEWAY_ID_FALLBACK,
  DEMO_MODELS,
  DEMO_MODEL_OVERRIDE_VAR,
  DEMO_OPENAI_API_MODE_VAR,
  DEMO_REASONING_EFFORT_OVERRIDE_VAR,
  DEMO_TEMPERATURE,
  demoEffectiveOpenAiApiMode,
  demoAnthropicProviderOptions,
  demoGatewayOptions,
  demoOpenAiApiModeFromOverride,
  demoOpenAiProviderOptions,
  demoModelSettings,
  demoTemperatureFor,
  demoUsesUnifiedRun,
  demoReasoningEffortFromOverride,
  demoReasoningEffortOverride,
  demoModelsFromOverride,
  openAiResponses,
  demoSessionAffinity
} from "./model-config.ts";
import {
  demoInputTelemetry,
  demoFinalTextTelemetry,
  demoProviderErrorTelemetry,
  demoTerminalProviderErrorTelemetry,
  isMeaningfulDemoOutput,
  sumDemoUsage,
  type DemoProviderErrorTelemetry,
  type DemoUsage
} from "./output.ts";
import { DEMO_SYSTEM_PROMPT } from "./prompt.ts";
import { demoOperationSummary, demoStepTelemetry, prepareDemoStep } from "./steps.ts";
import { buildDemoTools } from "./tools.ts";

declare global {
  interface Env {
    DEMO_MODEL_OVERRIDE?: string;
    DEMO_OPENAI_API_MODE?: string;
    DEMO_REASONING_EFFORT_OVERRIDE?: string;
  }
}

// Model defaults come from measured gauntlet results. The current matrix and
// provider routing constraints live in scripts/run-demo-model-gauntlet.mjs.
/** Throttle-bucket subject for loopback dev requests (no cookie, no WorkOS). */
const DEV_SUBJECT = "dev-loopback";
const TOOL_BUDGET_MESSAGE =
  "The demo hit its tool/step budget before the model produced a final answer. The trace above shows the completed tool work, but the answer may be incomplete; ask a narrower follow-up.";
/**
 * Whole-turn ceiling.
 * Worst legitimate turn: 3 model steps + 1 sandbox execute; generous so it
 * only trips hung provider streams, not slow-but-live turns.
 */
const TURN_TIMEOUT_MS = 120_000;
/**
 * Pre-parse request-body cap: well above the worst legitimate replay
 * (maxHistoryMessages × a full maxOutputTokens assistant answer at the
 * same 4-chars/token estimate used by the model-boundary cap, plus JSON
 * overhead), so JSON.parse and the per-entry validation walk are both
 * bounded before clampHistory ever runs.
 */
const MAX_BODY_CHARS = 384 * 1024;

const SSE_HEADERS: Record<string, string> = {
  "content-type": "text/event-stream",
  "cache-control": "no-store",
  // Defeats intermediary buffering/compression — SSE must flush per event.
  "content-encoding": "identity"
};

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function handleDemoChat(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "POST") {
    return reject(405, "method_not_allowed", "POST only", { allow: "POST" });
  }

  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (origin !== url.origin || (secFetchSite !== null && secFetchSite !== "same-origin")) {
    return reject(403, "cross_origin", "This endpoint only accepts same-origin browser requests.");
  }

  const subject =
    (await verifyDemoCookie(env.MCP_SERVER_SECRET, request.headers.get("cookie"))) ??
    (allowDevUnauthenticated(env, url.hostname) ? DEV_SUBJECT : null);
  if (!subject) {
    return reject(401, "unauthenticated", "No valid playground session — reload /playground and sign in.");
  }

  // Body before throttle: a malformed request must not burn one of the
  // subject's hourly chats. Size-capped before JSON.parse touches it.
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_CHARS) {
    return reject(413, "payload_too_large", `Request body exceeds ${MAX_BODY_CHARS} bytes.`);
  }
  const messages = await parseChatBody(request);
  if (!messages) {
    return reject(
      400,
      "bad_request",
      'Body must be JSON { messages: [{ role: "user" | "assistant", content: string }, ...] } with at least one message.'
    );
  }
  const history = clampHistory(messages) as ChatMessage[];

  const throttle = await demoThrottle(env.OAUTH_KV, subject);
  if (!throttle.allowed) {
    return reject(
      429,
      "rate_limited",
      `Hourly demo limit (${DEMO_CAPS.chatsPerHour} chats) reached — try again next hour.`,
      { "retry-after": "3600" }
    );
  }

  // Response streams while the turn runs; ctx.waitUntil keeps the pump alive
  // independent of body-consumption timing. One signal bounds the turn's
  // spend: client disconnect (cancel) or the whole-turn timeout aborts the
  // model stream — and with it further tool calls — not just frame delivery.
  const clientGone = new AbortController();
  const turnSignal = AbortSignal.any([clientGone.signal, AbortSignal.timeout(TURN_TIMEOUT_MS)]);
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let open = true;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      open = false;
      clientGone.abort();
    }
  });
  let emittedTerminal = false;
  const emit = (frame: DemoFrame): void => {
    if (!open) return;
    if (frame.type === "done" || frame.type === "error") {
      // First terminal wins. The AI SDK can emit `finish` after an `error`,
      // and the later generic frame must not replace the provider error.
      if (emittedTerminal) return;
      emittedTerminal = true;
    }
    try {
      controller.enqueue(encoder.encode(encodeFrame(frame)));
    } catch (error) {
      open = false; // client went away — keep the turn's tool caps honest, drop frames
      clientGone.abort();
      // Record which frame failed. Client disconnects also reach this path.
      logEvent("demo-stream-drop", { frame: frame.type, error: errorText(error) });
    }
  };

  // First byte out immediately: a reasoning model can sit silent for tens of
  // seconds before fullStream yields anything — the ready frame proves the
  // turn is live (and defeats any intermediary that buffers empty responses).
  emit({ type: "ready" });

  ctx.waitUntil(runTurn(env, emit, history, subject, turnSignal).finally(() => {
    // Mark an unexpected non-terminal exit as incomplete. The client and
    // gauntlet treat this reason as a failure instead of a normal stop.
    if (!emittedTerminal) emit({ type: "done", reason: "incomplete" });
    open = false;
    try {
      controller.close();
    } catch {
      // already closed/errored
    }
  }));

  return new Response(stream, { headers: SSE_HEADERS });
}

async function runTurn(
  env: Env,
  emit: (frame: DemoFrame) => void,
  messages: ChatMessage[],
  subject: string,
  abortSignal: AbortSignal
): Promise<void> {
  const t0 = Date.now();
  const toolBudget = createDemoToolBudget();
  const usageReports: DemoUsage[] = [];
  let finalText = "";
  let steps = 0;
  let finishReason = "none";
  const demoModels = demoModelsFromOverride(env.DEMO_MODEL_OVERRIDE);
  const requestedOpenAiApiMode = demoOpenAiApiModeFromOverride(env.DEMO_OPENAI_API_MODE);
  const openAiApiMode = demoEffectiveOpenAiApiMode(demoModels, requestedOpenAiApiMode);
  const reasoningEffort = demoReasoningEffortFromOverride(env.DEMO_REASONING_EFFORT_OVERRIDE);
  const reasoningEffortOverride = demoReasoningEffortOverride(env.DEMO_REASONING_EFFORT_OVERRIDE);
  const openAiReasoningEffort = openAiApiMode === "responses" ? reasoningEffort : reasoningEffortOverride;
  const inputTelemetry = await demoInputTelemetry(messages, subject);
  let selectedModel = demoModels[0]?.model ?? "unknown";
  const attemptedModels: string[] = [];
  let lastProviderError: DemoProviderErrorTelemetry | undefined;
  logEvent("demo-chat-start", {
    auth: subject === DEV_SUBJECT ? "dev-bypass" : "cookie",
    model: selectedModel,
    modelOverride: env.DEMO_MODEL_OVERRIDE ? DEMO_MODEL_OVERRIDE_VAR : undefined,
    openAiApiMode,
    openAiApiModeRequested: env.DEMO_OPENAI_API_MODE ? DEMO_OPENAI_API_MODE_VAR : undefined,
    reasoningEffort,
    reasoningEffortSource: reasoningEffortOverride ? "override" : "default",
    reasoningEffortOverride: reasoningEffortOverride ? DEMO_REASONING_EFFORT_OVERRIDE_VAR : undefined,
    ...inputTelemetry
  });
  try {
    const workersai = createWorkersAI({
      binding: env.AI,
      // Gateway routing is mandatory. Spend and rate limits are account-side
      // configuration; verify them live as described in ARCHITECTURE.md §7.
      gateway: demoGatewayOptions(env.DEMO_AI_GATEWAY_ID ?? DEMO_GATEWAY_ID_FALLBACK),
      // Register one plugin for each wire format. OpenAI-compatible vendors
      // share one plugin, while Anthropic and Google use distinct plugins.
      providers: [
        openAiApiMode === "responses" ? openAiResponses : openaiChat,
        cloudflareAnthropic,
        googleGemini
      ],
      resume: false
    });
    // The unified-run client omits `providers` for slugs that the plugin
    // registry cannot resolve. Keep it separate so other models retain their
    // provider SDK normalization.
    const unifiedRun = createWorkersAI({
      binding: env.AI,
      gateway: demoGatewayOptions(env.DEMO_AI_GATEWAY_ID ?? DEMO_GATEWAY_ID_FALLBACK)
    });
    const sessionAffinity = await demoSessionAffinity(subject);
    for (let index = 0; index < demoModels.length; index += 1) {
      const config = demoModels[index];
      if (!config) continue;
      selectedModel = config.model;
      attemptedModels.push(config.model);
      let emittedUsefulOutput = false;
      let fallbackLogged = false;
      const attemptEmit = (frame: DemoFrame): void => {
        if (isMeaningfulDemoOutput(frame)) emittedUsefulOutput = true;
        emit(frame);
      };
      // Fallback model attempts share the same demo tool budget. Tool trace
      // frames intentionally count as useful output, so a model that reached
      // tool activity does not unlock another search/execute allowance.
      const { tools } = buildDemoTools({ env, emit: attemptEmit, budget: toolBudget });
      const fallbackToNextModel = (reason: string): void => {
        if (fallbackLogged) return;
        fallbackLogged = true;
        finishReason = "empty-fallback";
        logEvent("demo-model-fallback", {
          fromModel: config.model,
          toModel: demoModels[index + 1]?.model,
          reason
        });
      };
      try {
        // Vendors the plugin registry does not know (see DEMO_UNIFIED_RUN_PREFIXES)
        // resolve through the plain binding instead. Same dispatch either way —
        // binding.run(slug, body, { gateway }) — so the gateway's rate limit and
        // spend rule still apply; only the SDK wrapper differs.
        const viaUnifiedRun = demoUsesUnifiedRun(config.model);
        const settings = demoModelSettings(config.model, sessionAffinity, reasoningEffort);
        const result = streamText({
          model: viaUnifiedRun
            ? unifiedRun(config.model, { extraHeaders: settings.extraHeaders })
            : workersai(config.model, settings),
          system: DEMO_SYSTEM_PROMPT,
          messages,
          tools: tools as ToolSet,
          stopWhen: stepCountIs(DEMO_CAPS.maxSteps),
          prepareStep: ({ steps, stepNumber }) => prepareDemoStep({ steps, stepNumber, budget: toolBudget }),
          onStepFinish: (step) => {
            logEvent("demo-step", {
              model: config.model,
              ...demoStepTelemetry(step, toolBudget)
            });
          },
          maxOutputTokens: DEMO_CAPS.maxOutputTokens,
          temperature: demoTemperatureFor(config.model),
          ...demoAnthropicProviderOptions(config.model, reasoningEffort),
          ...demoOpenAiProviderOptions(config.model, openAiReasoningEffort),
          abortSignal
        });
        for await (const part of result.fullStream) {
          switch (part.type) {
            case "text-delta":
              finalText += part.text;
              attemptEmit({ type: "token", text: part.text });
              break;
            case "reasoning-delta":
              // Reasoning models can sit silent before answering; stream the
              // reasoning tail so the wait is visibly alive (client shows a
              // rolling tail, not a transcript).
              //
              // Empty deltas are dropped: the Claude family reports
              // `thinkingChars: 0` across whole runs while still emitting
              // reasoning parts — its thinking is signature/redacted, so the text
              // is genuinely "". Forwarding those paints the pulse "thinking · "
              // with nothing after it and costs a frame per delta.
              if (part.text) attemptEmit({ type: "thinking", text: part.text });
              break;
            case "start-step":
              // Round boundaries are telemetry only (`steps` in demo-chat) —
              // deliberately no frame: numbered step dividers taught a false
              // fixed-pipeline mental model for what is a free-form tool loop.
              steps += 1;
              break;
            case "tool-error":
              // A call that never reached our execute (e.g. invalid input) —
              // the tools' own emit didn't fire, so trace it here.
              if (part.toolName === "search" || part.toolName === "execute") {
                attemptEmit({ type: "tool-start", id: part.toolCallId, tool: part.toolName, input: part.input });
                attemptEmit({
                  type: "tool-result",
                  id: part.toolCallId,
                  tool: part.toolName,
                  ok: false,
                  output: errorText(part.error)
                });
              }
              break;
            case "abort":
              finishReason = "abort";
              if (abortSignal.aborted && !emittedUsefulOutput) throw new Error("turn aborted before useful output");
              if (!emittedUsefulOutput && index < demoModels.length - 1) throw new Error("model aborted before useful output");
              attemptEmit({ type: "error", message: "The turn was aborted before finishing." });
              break;
            case "error":
              finishReason = "error";
              lastProviderError = demoProviderErrorTelemetry(
                part.error,
                config.model,
                index + 1
              );
              if (!emittedUsefulOutput && index < demoModels.length - 1) throw part.error;
              attemptEmit({ type: "error", message: errorText(part.error) });
              break;
            case "finish":
              finishReason = part.finishReason;
              usageReports.push({
                inputTokens: part.totalUsage.inputTokens,
                cacheReadTokens: part.totalUsage.inputTokenDetails.cacheReadTokens,
                cacheWriteTokens: part.totalUsage.inputTokenDetails.cacheWriteTokens,
                outputTokens: part.totalUsage.outputTokens,
                reasoningTokens: part.totalUsage.outputTokenDetails.reasoningTokens,
                totalTokens: part.totalUsage.totalTokens
              });
              if (!emittedUsefulOutput && index < demoModels.length - 1) {
                fallbackToNextModel(`model finished (${part.finishReason}) before useful output`);
                break;
              }
              if (part.finishReason === "tool-calls") {
                attemptEmit({ type: "error", message: TOOL_BUDGET_MESSAGE });
                return;
              }
              attemptEmit({ type: "done", reason: part.finishReason });
              return;
            default:
              break; // source/raw/tool-call etc. — no frame mapping
          }
        }
        if (emittedUsefulOutput || index === demoModels.length - 1) return;
        fallbackToNextModel("model stream ended before useful output");
      } catch (error) {
        finishReason = "exception";
        lastProviderError = demoProviderErrorTelemetry(
          error,
          config.model,
          index + 1
        );
        if (abortSignal.aborted && !emittedUsefulOutput) throw error;
        if (emittedUsefulOutput || index === demoModels.length - 1) throw error;
        fallbackToNextModel("provider-error");
      }
    }
  } catch (e) {
    // fullStream only throws for stream-stopping failures (network, provider).
    finishReason = "exception";
    lastProviderError ??= demoProviderErrorTelemetry(
      e,
      selectedModel,
      attemptedModels.length
    );
    emit({ type: "error", message: errorText(e) });
  } finally {
    const usage = sumDemoUsage(usageReports);
    const finalTelemetry = demoFinalTextTelemetry(finalText, finishReason);
    const terminalProviderError = demoTerminalProviderErrorTelemetry(
      lastProviderError,
      finalTelemetry.stopReasonClass,
      finalTelemetry.hadFinalText,
      abortSignal.aborted
    );
    logEvent("demo-chat", {
      auth: subject === DEV_SUBJECT ? "dev-bypass" : "cookie",
      model: selectedModel,
      attemptedModels,
      modelOverride: env.DEMO_MODEL_OVERRIDE ? DEMO_MODEL_OVERRIDE_VAR : undefined,
      temperature: DEMO_TEMPERATURE,
      openAiApiMode,
      openAiApiModeRequested: env.DEMO_OPENAI_API_MODE ? DEMO_OPENAI_API_MODE_VAR : undefined,
      reasoningEffort,
      reasoningEffortSource: reasoningEffortOverride ? "override" : "default",
      reasoningEffortOverride: reasoningEffortOverride ? DEMO_REASONING_EFFORT_OVERRIDE_VAR : undefined,
      openAiReasoningEffortSent:
        selectedModel.startsWith("openai/") ||
        selectedModel.startsWith("xai/") ||
        selectedModel.startsWith("grok/")
          ? (openAiReasoningEffort ?? null)
          : undefined,
      sessionAffinity: true,
      inputTokens: usage?.inputTokens,
      cacheReadTokens: usage?.cacheReadTokens,
      cacheWriteTokens: usage?.cacheWriteTokens,
      outputTokens: usage?.outputTokens,
      reasoningTokens: usage?.reasoningTokens,
      totalTokens: usage?.totalTokens,
      messages: messages.length,
      steps,
      finishReason,
      ...finalTelemetry,
      ...terminalProviderError,
      searchCalls: toolBudget.searchCalls,
      searchTruncatedCalls: toolBudget.searchTruncatedCalls,
      executeCalls: toolBudget.executeCalls,
      searchRefusals: toolBudget.searchRefusals,
      executeRefusals: toolBudget.executeRefusals,
      unknownServiceSearches: toolBudget.unknownServiceSearches,
      executeFailures: toolBudget.executeFailures,
      executeResultTruncated: toolBudget.executeResultTruncated,
      recoveryHintedExecutes: toolBudget.recoveryHintedExecutes,
      operationSummary: demoOperationSummary(toolBudget),
      toolCounterScope: "turn",
      usageScope: "sum-per-model-attempt",
      ms: Date.now() - t0
    });
  }
}

const cloudflareAnthropic = {
  wireFormat: "anthropic",
  create: ({
    modelId,
    fetch,
    baseURL
  }: {
    modelId: string;
    fetch: typeof globalThis.fetch;
    baseURL?: string;
  }) =>
    createAnthropic({
      apiKey: "unused",
      fetch: normalizeAnthropicFetch(fetch),
      ...(baseURL ? { baseURL } : {})
    })(modelId)
} as const;

function normalizeAnthropicFetch(fetchImpl: typeof fetch): typeof fetch {
  return (async (input, init) => {
    if (init?.body) {
      const body = JSON.parse(bodyText(init.body)) as Record<string, unknown>;
      const system = body.system;
      // Cloudflare's Anthropic Messages endpoint currently rejects Anthropic's
      // text-block array form for `system` even though @ai-sdk/anthropic emits
      // it. The same endpoint accepts stream/tools; it just wants a plain string.
      if (Array.isArray(system)) {
        body.system = system
          .map((part) =>
            typeof part === "object" &&
            part !== null &&
            (part as { type?: unknown; text?: unknown }).type === "text" &&
            typeof (part as { text?: unknown }).text === "string"
              ? (part as { text: string }).text
              : ""
          )
          .filter(Boolean)
          .join("\n\n");
      }
      return fetchImpl(input, { ...init, body: JSON.stringify(body) });
    }
    return fetchImpl(input, init);
  }) as typeof fetch;
}

function bodyText(body: BodyInit): string {
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);
  if (body instanceof ArrayBuffer) return new TextDecoder().decode(body);
  // Refuse unknown body types. Replacing a request with empty JSON would hide
  // an incompatible SDK change, while a throw activates the normal fallback.
  throw new TypeError(`Unsupported Anthropic request body type: ${Object.prototype.toString.call(body)}`);
}

/**
 * null = malformed (caller answers 400). Oversized contents are truncated,
 * not rejected. Reads text first and re-checks the char cap (Content-Length
 * can lie or be absent on chunked bodies) so JSON.parse and the entry walk
 * are bounded — within MAX_BODY_CHARS the walk is a few thousand entries at
 * worst, so no separate messages.length rejection is needed pre-clamp.
 */
async function parseChatBody(request: Request): Promise<ChatMessage[] | null> {
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_CHARS) return null;
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null) return null;
  const { messages } = body as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const entry of messages) {
    if (typeof entry !== "object" || entry === null) return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    // Apply the per-message cap only to user input. Replayed assistant answers
    // can exceed it, while aggregate history remains bounded separately.
    out.push({ role, content: role === "user" ? content.slice(0, DEMO_CAPS.maxUserMessageChars) : content });
  }
  return out;
}

/** Message text only — never a stack, never a serialized error object. */
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function reject(
  status: number,
  error: string,
  hint: string,
  headers: Record<string, string> = {}
): Response {
  logEvent("demo-chat-rejected", { status, error });
  return Response.json(
    { error, hint },
    { status, headers: { "cache-control": "no-store", ...headers } }
  );
}
