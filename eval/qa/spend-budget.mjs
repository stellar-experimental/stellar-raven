/**
 * Sequential spend authorization for one QA method invocation.
 *
 * A claimed cap is enforceable only when every paid call reports its cost.
 * Callers authorize immediately before a provider call and record immediately
 * after it. The next call receives only the remaining authorized amount.
 */

const USD_EPSILON = 1e-12;

function roundUsd(value) {
  return Number(value.toFixed(12));
}

export class BudgetExhaustedError extends Error {
  constructor({ method, id, remainingUsd }) {
    super(`budget exhausted before ${method} call for ${id}; remaining authorized spend is $${remainingUsd}`);
    this.name = "BudgetExhaustedError";
    this.code = "budget-exhausted";
    this.method = method;
    this.id = id;
    this.remainingUsd = remainingUsd;
  }
}

export class MissingReportedCostError extends Error {
  constructor({ method, id }) {
    super(`budgeted ${method} call for ${id} did not report costUsd`);
    this.name = "MissingReportedCostError";
    this.code = "missing-reported-cost";
    this.method = method;
    this.id = id;
  }
}

export class BudgetAuthorizationExceededError extends Error {
  constructor({ method, id, authorizedUsd, costUsd }) {
    super(`budgeted ${method} call for ${id} reported $${costUsd}, above its $${authorizedUsd} authorization`);
    this.name = "BudgetAuthorizationExceededError";
    this.code = "budget-cost";
    this.method = method;
    this.id = id;
    this.authorizedUsd = authorizedUsd;
    this.costUsd = costUsd;
  }
}

export function parseMaxBudgetUsd(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(text)) {
    throw new Error(`--max-budget-usd must be a non-negative decimal number, got ${value}`);
  }
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`--max-budget-usd must be a finite non-negative number, got ${value}`);
  }
  return roundUsd(amount);
}

export function createSpendLedger(maxBudgetUsd = null) {
  if (maxBudgetUsd !== null && (!Number.isFinite(maxBudgetUsd) || maxBudgetUsd < 0)) {
    throw new Error(`maxBudgetUsd must be null or a finite non-negative number, got ${maxBudgetUsd}`);
  }
  return {
    claimed: maxBudgetUsd !== null,
    authorizedUsd: maxBudgetUsd === null ? null : roundUsd(maxBudgetUsd),
    reportedSpendUsd: 0,
    calls: [],
    stoppedBefore: null
  };
}

/** Restore a persisted method ledger before a stored resume. */
export function resumeSpendLedger(maxBudgetUsd = null, prior = null) {
  const effectiveBudgetUsd = maxBudgetUsd ?? (prior?.claimed ? prior.authorizedUsd : null);
  const ledger = createSpendLedger(effectiveBudgetUsd);
  if (!prior) return ledger;
  if (!Array.isArray(prior.calls)) {
    throw new Error("stored budget ledger has no calls array");
  }
  ledger.calls = prior.calls.map((call) => ({ ...call }));
  const missing = ledger.calls.find((call) => !Number.isFinite(call.costUsd) || call.costUsd < 0);
  if (ledger.claimed && missing) {
    throw new MissingReportedCostError({ method: missing.method, id: missing.id });
  }
  ledger.reportedSpendUsd = roundUsd(
    ledger.calls
      .filter((call) => Number.isFinite(call.costUsd) && call.costUsd >= 0)
      .reduce((sum, call) => sum + call.costUsd, 0)
  );
  if (
    Number.isFinite(prior.reportedSpendUsd) &&
    Math.abs(prior.reportedSpendUsd - ledger.reportedSpendUsd) > USD_EPSILON
  ) {
    throw new Error(
      `stored budget ledger spend differs: calls report $${ledger.reportedSpendUsd}, ` +
      `but the ledger reports $${prior.reportedSpendUsd}`
    );
  }
  return ledger;
}

export function remainingBudgetUsd(ledger) {
  if (!ledger?.claimed) return null;
  return roundUsd(Math.max(0, ledger.authorizedUsd - ledger.reportedSpendUsd));
}

export function authorizeSpend(ledger, { method, id, attempt }) {
  if (!ledger?.claimed) {
    return { method, id, attempt, maxBudgetUsd: null };
  }
  const remainingUsd = remainingBudgetUsd(ledger);
  if (remainingUsd <= USD_EPSILON) {
    ledger.stoppedBefore ??= { method, id, attempt, remainingUsd };
    throw new BudgetExhaustedError({ method, id, remainingUsd });
  }
  return { method, id, attempt, maxBudgetUsd: remainingUsd };
}

export function recordSpend(ledger, authorization, costUsd) {
  const reported = Number.isFinite(costUsd) && costUsd >= 0;
  const call = {
    method: authorization.method,
    id: authorization.id,
    attempt: authorization.attempt,
    authorizedUsd: authorization.maxBudgetUsd,
    costUsd: reported ? roundUsd(costUsd) : null
  };
  ledger.calls.push(call);
  if (!reported) {
    if (ledger.claimed) throw new MissingReportedCostError(authorization);
    return call;
  }
  ledger.reportedSpendUsd = roundUsd(ledger.reportedSpendUsd + costUsd);
  if (!ledger.claimed) return call;
  if (costUsd - authorization.maxBudgetUsd > USD_EPSILON) {
    throw new BudgetAuthorizationExceededError({
      method: authorization.method,
      id: authorization.id,
      authorizedUsd: authorization.maxBudgetUsd,
      costUsd
    });
  }
  return call;
}

export function spendLedgerRecord(ledger) {
  const expectedCalls = ledger.calls.length;
  const reportedCalls = ledger.calls.filter((call) => Number.isFinite(call.costUsd)).length;
  return {
    claimed: ledger.claimed,
    authorizedUsd: ledger.authorizedUsd,
    reportedSpendUsd: roundUsd(ledger.reportedSpendUsd),
    remainingUsd: remainingBudgetUsd(ledger),
    expectedCalls,
    reportedCalls,
    missingCosts: expectedCalls - reportedCalls,
    exhausted: ledger.claimed && remainingBudgetUsd(ledger) <= USD_EPSILON,
    stoppedBefore: ledger.stoppedBefore,
    calls: ledger.calls
  };
}

export function formatBudgetUsd(value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`budget value must be a finite non-negative number, got ${value}`);
  }
  return String(roundUsd(value));
}
