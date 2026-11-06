/** Host-side, tool-free Responses judge. No CLI session or subscription credentials. */
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { buildJudgePrompt, buildTranscriptEvidence, judgeVerdictFromText, JUDGE_RUBRIC } from "./judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";

export const GATEWAY_JUDGE_TRANSPORT = "cloudflare-openai-responses-no-tools-v1";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const finiteCost = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const integer = (value) => Number.isSafeInteger(value) && value >= 0;
const rounded = (value) => Number(value.toFixed(12));
const ROW_FAILURES = new Set(["response-incomplete-or-error", "response-final-message-count", "response-verdict-not-json", "response-verdict-not-object", "provider-safeguard", "parse", "consistency"]);
export function isSettledJudgeRowFailure(failureClass) { return ROW_FAILURES.has(failureClass); }
const ENV_KEYS = ["HOME", "PATH", "NODE_OPTIONS", "NODE_EXTRA_CA_CERTS", "NODE_USE_ENV_PROXY", "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "all_proxy", "no_proxy", "SSL_CERT_FILE", "SSL_CERT_DIR", "WRANGLER_PROFILE"];

export function gatewayJudgeConfig(value) {
  const keys = ["accountId", "gatewayId", "model", "gatewayLogModel", "effort", "maxOutputTokens", "maxPromptBytes", "timeoutMs", "callReserveUsd"];
  if (!value || typeof value !== "object" || Object.keys(value).some((key) => !keys.includes(key))) throw new Error("unsupported Gateway judge configuration field");
  if (!/^[a-f0-9]{32}$/.test(value?.accountId ?? "") || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(value?.gatewayId ?? "")) throw new Error("explicit Gateway account and gateway IDs required");
  if (!/^gpt-[a-z0-9][a-z0-9.-]*$/.test(value.model ?? "") || !["low", "medium", "high", "xhigh", "max"].includes(value.effort)) throw new Error("explicit OpenAI model and supported effort required");
  if (value.gatewayLogModel !== `openai/${value.model}`) throw new Error("explicit exact openai-prefixed gatewayLogModel required");
  for (const [key, min, max] of [["maxOutputTokens", 256, 32768], ["maxPromptBytes", 1024, 1000000], ["timeoutMs", 1000, 1200000]]) {
    if (!Number.isInteger(value[key]) || value[key] < min || value[key] > max) throw new Error(`invalid ${key}`);
  }
  if (!finiteCost(value.callReserveUsd) || value.callReserveUsd <= 0) throw new Error("positive callReserveUsd required");
  return Object.freeze(Object.fromEntries(keys.map((key) => [key, value[key]])));
}

/** Identity contains no credentials or credential hashes; endpoints cannot be overridden. */
export function gatewayJudgeIdentity(config, { env = process.env } = {}) {
  const effective = gatewayJudgeConfig(config);
  // The standard fetch transport must not silently pick up injected code or a proxy.
  for (const name of ["NODE_OPTIONS", "NODE_USE_ENV_PROXY", "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]) {
    if (env[name]) throw new Error(`Gateway judge refuses inherited ${name}`);
  }
  if (process.execArgv.some((arg) => /^(?:-r$|--(?:require|import|loader|experimental-loader)(?:=|$))/.test(arg))) throw new Error("Gateway judge refuses injected Node modules");
  const implementation = Object.fromEntries([
    "gateway-judge.mjs", "gateway-rejudge.mjs", "judge.mjs", "lib.mjs", "evidence-pack.mjs", "evidence-sanitizer.mjs", "verdict-consistency.mjs", "diagnostic-rejudge-source.mjs", "re-judge.mjs"
  ].map((name) => [name, sha256(readFileSync(new URL(name, import.meta.url)))]));
  const { input: _input, ...requestTemplate } = gatewayJudgeRequest("", effective);
  const identity = {
    transport: GATEWAY_JUDGE_TRANSPORT, authentication: "cloudflare-api-token", provider: "openai", config: effective,
    temperature: "provider-default-unpinned", requestTemplate, requestTemplateSha256: sha256(JSON.stringify(requestTemplate)),
    rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION,
    node: { path: realpathSync(process.execPath), version: process.version, execArgv: process.execArgv, platform: process.platform, arch: process.arch, sha256: sha256(readFileSync(process.execPath)) },
    implementation,
    environment: { names: ENV_KEYS.filter((key) => env[key] !== undefined), sha256: sha256(JSON.stringify(ENV_KEYS.map((key) => [key, env[key] ?? null]))) }
  };
  return { ...identity, sha256: sha256(JSON.stringify(identity)) };
}

export function gatewayJudgeRequest(prompt, config) {
  const c = gatewayJudgeConfig(config);
  if (typeof prompt !== "string" || Buffer.byteLength(prompt) > c.maxPromptBytes) throw new Error("judge prompt exceeds authorized byte limit");
  return {
    model: c.model, reasoning: { effort: c.effort }, input: [{ role: "user", content: prompt }],
    tools: [], tool_choice: "none", parallel_tool_calls: false,
    stream: false, store: false, background: false, service_tier: "default",
    max_output_tokens: c.maxOutputTokens, text: { format: { type: "json_object" } }
  };
}

export function responsesJudgeOutput(body, config) {
  const usage = body?.usage;
  const validUsage = usage && integer(usage.input_tokens) && integer(usage.output_tokens) &&
    integer(usage.total_tokens) && usage.total_tokens === usage.input_tokens + usage.output_tokens &&
    integer(usage.input_tokens_details?.cached_tokens) && usage.input_tokens_details.cached_tokens <= usage.input_tokens &&
    integer(usage.output_tokens_details?.reasoning_tokens) && usage.output_tokens_details.reasoning_tokens <= usage.output_tokens;
  const reportedUsage = validUsage ? {
    inputTokens: usage.input_tokens, cachedInputTokens: usage.input_tokens_details.cached_tokens,
    outputTokens: usage.output_tokens, reasoningTokens: usage.output_tokens_details.reasoning_tokens,
    totalTokens: usage.total_tokens
  } : null;
  const reject = (error) => ({ error, usage: reportedUsage, resultText: null });
  if (!body || body.object !== "response") return reject("response-envelope-invalid");
  if (body.model !== config.model || body.reasoning?.effort !== config.effort || body.service_tier !== "default") return reject("response-identity-mismatch");
  if (body.tools?.length !== 0 || body.tool_choice !== "none" || !Array.isArray(body.output)) return reject("response-tools-or-output-invalid");
  if (!reportedUsage || usage.output_tokens > config.maxOutputTokens) return reject("response-usage-invalid");
  if (body.status !== "completed" || body.error != null || body.incomplete_details != null) return reject("response-incomplete-or-error");
  const messages = [];
  for (const item of body.output) {
    if (item?.type === "message" && Array.isArray(item.content) && item.content.some((part) => part.type === "refusal")) return reject("provider-safeguard");
    if (item?.type === "reasoning" && (item.status === undefined || item.status === "completed")) continue;
    if (item?.type !== "message" || item.role !== "assistant" || item.status !== "completed" ||
        !Array.isArray(item.content) || item.content.length !== 1 || item.content[0]?.type !== "output_text" ||
        typeof item.content[0].text !== "string") return reject("response-tool-or-unexpected-item");
    messages.push(item.content[0].text);
  }
  if (messages.length !== 1) return reject("response-final-message-count");
  try { const parsed = JSON.parse(messages[0]); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reject("response-verdict-not-object"); }
  catch { return reject("response-verdict-not-json"); }
  return { error: null, resultText: messages[0], usage: reportedUsage };
}

async function boundedJson(response) {
  if (response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    await response.body?.cancel().catch(() => {});
    throw new Error("unsupported-response-content-type");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("missing-response-body");
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2 * 1024 * 1024) throw new Error("response-too-large");
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

/** One method invocation. Reserve/checkpoint before POST; failures close all remaining authorization. */
export function createGatewayJudge({ config, identity, authorization, token, checkpoint }, {
  fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  identityImpl = gatewayJudgeIdentity
} = {}) {
  const c = gatewayJudgeConfig(config);
  if (!identity || identity.sha256 !== authorization?.identitySha256 || identity.sha256 !== identityImpl(c).sha256) throw new Error("Gateway judge identity pin mismatch");
  if (typeof token !== "string" || !token || /[\r\n]/.test(token)) throw new Error("standard Cloudflare API token required");
  if (typeof checkpoint !== "function" || !Number.isSafeInteger(authorization.maxCalls) || authorization.maxCalls < 1 ||
      !finiteCost(authorization.maxBudgetUsd) || authorization.maxBudgetUsd < c.callReserveUsd ||
      !Number.isFinite(authorization.maxJudgeErrorRate) || authorization.maxJudgeErrorRate < 0 || authorization.maxJudgeErrorRate > 1 ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(authorization.runId ?? "")) throw new Error("explicit run, call and dollar authorization required");
  const auth = Object.freeze({ ...authorization });
  const calls = [];
  const logIds = new Set();
  let spent = 0;
  let stopped = null;
  let judgeErrorCount = 0;
  const maxJudgeErrors = Math.floor(auth.maxCalls * auth.maxJudgeErrorRate);
  let busy = false;
  const snapshot = () => structuredClone({ schema: "gateway-judge-budget-v1", runId: auth.runId,
    authorizedUsd: auth.maxBudgetUsd, maxCalls: auth.maxCalls, callsStarted: calls.length,
    reportedSpendUsd: spent, totalCostUsd: calls.some((call) => call.costUsd === null) ? null : spent,
    missingCosts: calls.filter((call) => call.costUsd === null).length,
    remainingUsd: stopped ? 0 : rounded(Math.max(0, auth.maxBudgetUsd - spent)), maxJudgeErrorRate: auth.maxJudgeErrorRate, maxJudgeErrors, judgeErrorCount, stopped, calls });
  const assertIdentity = () => { if (identityImpl(c).sha256 !== identity.sha256) throw new Error("judge-identity-drift"); };
  async function settle(logId, httpStatus, expectedMetadata) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(logId ?? "") || logIds.has(logId)) return { costUsd: null, error: "missing-or-duplicate-gateway-log-id" };
    logIds.add(logId);
    const url = `https://api.cloudflare.com/client/v4/accounts/${c.accountId}/ai-gateway/gateways/${c.gatewayId}/logs/${logId}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetchImpl(url, { method: "GET", redirect: "error", headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
        const body = await boundedJson(response);
        const log = body.result;
        if (response.ok && body.success === true && finiteCost(log?.cost)) {
          let metadata;
          try { metadata = typeof log.metadata === "string" ? JSON.parse(log.metadata) : log.metadata; } catch { metadata = null; }
          const metadataMatches = Object.entries(expectedMetadata).every(([key, value]) => metadata?.[key] === value);
          const evidence = { id: log.id, model: log.model, provider: log.provider, cached: log.cached, customCost: log.custom_cost, statusCode: log.status_code, collectLogPayload: log.collect_log_payload ?? null, metadata: metadataMatches ? expectedMetadata : null };
          if (log.id !== logId || log.model !== c.gatewayLogModel || log.provider !== "openai" || log.cached !== false || log.custom_cost !== false || log.status_code !== httpStatus || log.collect_log_payload !== false || !metadataMatches) return {
            costUsd: log.id === logId && log.custom_cost === false && metadataMatches ? log.cost : null,
            evidence, error: "gateway-log-identity-or-privacy-mismatch"
          };
          return { costUsd: log.cost, evidence, error: null };
        }
      } catch { /* Read-only settlement retries; never resend inference. */ }
      if (attempt < 4) await sleep(100 * (attempt + 1));
    }
    return { costUsd: null, error: "missing-gateway-cost" };
  }
  async function judge(input, { id = "judge" } = {}) {
    if (busy) throw new Error("Gateway judge calls must be sequential");
    if (stopped) throw new Error(`Gateway judge authorization stopped: ${stopped}`);
    if (calls.length >= auth.maxCalls || rounded(auth.maxBudgetUsd - spent) < c.callReserveUsd) throw new Error("Gateway judge authorization exhausted");
    assertIdentity();
    const transcriptEvidence = typeof input.transcriptEvidence === "string" ? input.transcriptEvidence : buildTranscriptEvidence(input);
    const prompt = buildJudgePrompt({ ...input, transcriptEvidence });
    const request = gatewayJudgeRequest(prompt, c);
    const promptSha256 = sha256(prompt);
    const requestMetadata = { role: "judge-b", runId: auth.runId, promptSha256 };
    const call = { id, number: calls.length + 1, promptSha256, requestSha256: sha256(JSON.stringify(request)), status: "reserved", costUsd: null, usage: null, logId: null, responseModel: null, responseEffort: null, gatewayLog: null, failureClass: null };
    calls.push(call);
    busy = true;
    let failure = null;
    let resultText = null;
    try {
      await checkpoint(snapshot());
      assertIdentity();
      const response = await fetchImpl(`https://gateway.ai.cloudflare.com/v1/${c.accountId}/${c.gatewayId}/openai/responses`, {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(c.timeoutMs),
        headers: { "content-type": "application/json", "cf-aig-authorization": `Bearer ${token}`, "cf-aig-collect-log": "true", "cf-aig-collect-log-payload": "false", "cf-aig-skip-cache": "true", "cf-aig-max-attempts": "1", "cf-aig-metadata": JSON.stringify(requestMetadata) },
        body: JSON.stringify(request)
      });
      call.logId = response.headers.get("cf-aig-log-id");
      try {
        const body = await boundedJson(response);
        call.responseModel = typeof body?.model === "string" ? body.model : null;
        call.responseEffort = typeof body?.reasoning?.effort === "string" ? body.reasoning.effort : null;
        const parsed = responsesJudgeOutput(body, c);
        call.usage = parsed.usage;
        resultText = parsed.resultText;
        failure = response.ok ? parsed.error : "provider-http-error";
      } catch { failure = "invalid-provider-response"; }
      const settled = await settle(call.logId, response.status, requestMetadata);
      call.costUsd = settled.costUsd;
      call.gatewayLog = settled.evidence ?? null;
      if (finiteCost(call.costUsd)) spent = rounded(spent + call.costUsd);
      failure = settled.error ?? failure;
      if (spent > auth.maxBudgetUsd || call.costUsd > c.callReserveUsd) failure = "judge-cost-exceeds-authorization";
      assertIdentity();
    } catch {
      // Never include exception text, provider bodies, headers or credentials.
      failure = "judge-transport-checkpoint-or-identity-error";
    }
    const verdict = failure ? {
      score: "error", coreAnswer: null, missingFacts: [], wrongClaims: [], avoidMatches: [],
      rationale: failure, failureClass: failure, rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, promptSha256
    } : judgeVerdictFromText(input, { resultText, transcriptEvidence, promptSha256, costUsd: call.costUsd });
    call.failureClass = verdict.failureClass ?? null;
    call.status = verdict.score === "error" ? "error" : "completed";
    if (call.status === "error") {
      if (isSettledJudgeRowFailure(call.failureClass) && finiteCost(call.costUsd)) {
        judgeErrorCount++;
        if (judgeErrorCount > maxJudgeErrors) stopped = "judge-error-rate-exceeded";
      } else stopped = call.failureClass ?? "judge-error";
    }
    const result = { ...verdict, costUsd: call.costUsd, costBasis: "gateway-reported-usd", usage: call.usage,
      judgeIdentitySha256: identity.sha256, transport: GATEWAY_JUDGE_TRANSPORT, model: c.model, effort: c.effort,
      responseModel: call.responseModel, gatewayLogModel: call.gatewayLog?.model ?? null,
      requestSha256: call.requestSha256, maxOutputTokens: c.maxOutputTokens, gatewayLogId: call.logId };
    try { await checkpoint(snapshot()); }
    catch { stopped = "checkpoint-failed"; throw new Error("Gateway judge checkpoint failed; authorization closed"); }
    finally { busy = false; }
    return result;
  }
  return Object.freeze({ judge, snapshot, assertIdentity });
}
