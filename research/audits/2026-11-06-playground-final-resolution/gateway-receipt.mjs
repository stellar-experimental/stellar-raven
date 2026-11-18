// Frozen reader for stored `gateway-rejudge-v1` receipts; the producer was removed in round item 8.6.
const finiteCost = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const ROW_FAILURES = new Set(["response-incomplete-or-error", "response-final-message-count", "response-verdict-not-json", "response-verdict-not-object", "provider-safeguard", "parse", "consistency"]);
export function isSettledJudgeRowFailure(failureClass) { return ROW_FAILURES.has(failureClass); }

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
