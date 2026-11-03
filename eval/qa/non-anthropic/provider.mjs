import { createEvalCostBinding } from "../../../src/demo/eval-cost.ts";
import { MODEL, nativeCostTicks, parseCompletion } from "./core.mjs";

/** Resolve observations only. The parent owns request identity and acceptance. */
export function resolveReportedCost({ receipt, usage, status, model, stream, parsed }) {
  let nativeReportedCost = null;
  let accountingError = null;
  try { nativeReportedCost = nativeCostTicks(usage); }
  catch { accountingError = "provider-native-cost-invalid"; }
  const gatewayCostComplete = receipt?.calls === 1 && receipt.reportedCalls === 1 &&
    Number.isFinite(receipt.costUsd) && receipt.costUsd >= 0 && receipt.reportedCostUsd === receipt.costUsd &&
    [null, "answer-cost-exceeds-authorization"].includes(receipt.error);
  const gatewayMissing = receipt?.calls === 1 && receipt.reportedCalls === 0 && receipt.costUsd === null &&
    receipt.reportedCostUsd === 0 && receipt.error === "missing-answer-cost";
  if (!gatewayCostComplete && !gatewayMissing) accountingError ??= "provider-gateway-receipt-invalid";
  const nativeEligible = nativeReportedCost !== null && status === 200 && stream === false && parsed != null &&
    [MODEL, "grok-4.7"].includes(model);
  let costUsd = gatewayCostComplete ? receipt.costUsd : null;
  let costSource = gatewayCostComplete ? "gateway-reported" : null;
  if (!accountingError && nativeEligible) {
    if (gatewayCostComplete && costUsd !== nativeReportedCost.usd) {
      accountingError = "provider-cost-conflict";
      costUsd = null;
      costSource = null;
    } else {
      costUsd = nativeReportedCost.usd;
      costSource = "native-reported";
    }
  }
  if (costUsd === null) accountingError ??= "provider-cost-missing";
  if (receipt?.error === "answer-cost-exceeds-authorization") accountingError ??= "provider-budget-exceeded";
  return { costUsd, costSource, accountingError, gatewayCostComplete, nativeReportedCost };
}

/** One call, with no SDK, provider fallback, or automatic inference retry. */
export async function providerCall(ai, { gatewayId, maxBudgetUsd, messages, tools, maxOutputTokens, judge = false, toolChoice = "auto",
  beforeDispatch = () => {}, onCompletion = () => {} }) {
  if (!["auto", "none"].includes(toolChoice)) throw new Error("invalid-answer-tool-choice");
  const accounting = createEvalCostBinding(ai, gatewayId, maxBudgetUsd);
  const startedAt = new Date().toISOString();
  const start = performance.now();
  let body = null;
  let parsed = null;
  let error = null;
  let logId = null;
  let status = null;
  try {
    beforeDispatch();
    const response = await accounting.binding.run(MODEL, {
      messages,
      ...(judge ? {} : { tools, tool_choice: toolChoice }),
      reasoning_effort: "high",
      max_tokens: maxOutputTokens,
      stream: false
    }, {
      returnRawResponse: true,
      gateway: { id: gatewayId, collectLog: true, retries: { maxAttempts: 1 } },
      extraHeaders: { "cf-aig-skip-cache": "true", "cf-aig-collect-log-payload": "false" }
    });
    if (!(response instanceof Response)) throw new Error("provider did not return a raw Response");
    status = response.status;
    logId = response.headers.get("cf-aig-log-id");
    if (!response.ok) throw new Error(`provider HTTP ${response.status}`);
    body = await response.json();
    parsed = parseCompletion(body, { judge });
    onCompletion({ parsed, model: body.model, usage: body.usage ?? null, stream: false });
  } catch (cause) {
    // Provider bodies and auth errors can contain credentials. Keep fixed classes only.
    error = cause instanceof SyntaxError ? "malformed-provider-json" : "provider-response-invalid";
  }
  const receipt = await accounting.finish();
  const observations = { receipt, usage: body?.usage ?? null, status, model: body?.model ?? null, stream: false, parsed };
  return {
    startedAt, endedAt: new Date().toISOString(), latencyMs: performance.now() - start,
    logId, error, rejectedCompletion: parsed ? null : body?.choices?.[0] ?? null, ...observations, ...resolveReportedCost(observations)
  };
}
