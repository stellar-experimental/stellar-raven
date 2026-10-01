/** Loopback evaluation accounting. Never estimate unreported provider costs. */
export type AnswerCost = {
  costUsd: number | null;
  reportedCostUsd: number;
  calls: number;
  reportedCalls: number;
  error: string | null;
};

export function createEvalCostBinding(ai: Ai, gatewayId: string, maxBudgetUsd: number) {
  if (!Number.isFinite(maxBudgetUsd) || maxBudgetUsd <= 0) throw new Error("invalid-answer-budget");
  let calls = 0;
  let reportedCalls = 0;
  let reportedCostUsd = 0;
  let error: string | null = null;
  let pendingLogId: string | null = null;
  const seen = new Set<string>();

  async function settle() {
    if (!pendingLogId) return;
    const id = pendingLogId;
    pendingLogId = null;
    // Streaming log costs can lag the final response chunk. Retry reads only.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const log = await Promise.race([
          ai.gateway(gatewayId).getLog(id),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("cost-read-timeout")), 1_000);
          })
        ]);
        if (typeof log.cost === "number" && Number.isFinite(log.cost) && log.cost >= 0) {
          reportedCalls += 1;
          reportedCostUsd = Number((reportedCostUsd + log.cost).toFixed(12));
          if (reportedCostUsd > maxBudgetUsd) error = "answer-cost-exceeds-authorization";
          return;
        }
      } catch { /* A delayed or absent log is an unknown cost, never zero. */ }
      finally { clearTimeout(timer); }
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
    error = "missing-answer-cost";
  }

  const binding = new Proxy(ai, {
    get(target, key) {
      if (key !== "run") {
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      }
      return async (...args: Parameters<Ai["run"]>) => {
        await settle();
        if (error) throw new Error(error);
        if (reportedCostUsd >= maxBudgetUsd) throw new Error("answer-budget-exhausted");
        const [model, inputs, options] = args;
        // Raw responses carry the log identity. Unsupported transports stop before spend.
        if (!options?.returnRawResponse) throw new Error("answer-cost-requires-raw-response");
        calls += 1;
        try {
          const response = await target.run(model, inputs, {
            ...options,
            gateway: { ...options.gateway, id: gatewayId, collectLog: true, retries: { maxAttempts: 1 } },
            extraHeaders: { ...options.extraHeaders, "cf-aig-collect-log-payload": "false" }
          });
          const id = response instanceof Response ? response.headers.get("cf-aig-log-id") : null;
          if (!id || seen.has(id)) error = "missing-or-duplicate-answer-log-id";
          else { seen.add(id); pendingLogId = id; }
          return response;
        } catch (cause) {
          error = "missing-answer-cost";
          throw cause;
        }
      };
    }
  });

  return {
    binding,
    async finish(): Promise<AnswerCost> {
      await settle();
      return {
        costUsd: calls === 0 || reportedCalls !== calls ? null : reportedCostUsd,
        reportedCostUsd, calls, reportedCalls, error
      };
    }
  };
}
