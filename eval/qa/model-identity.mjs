/**
 * Model identity for eval artifacts. One rule: identity fields hold the exact model ID that ran; a
 * family alias (`sonnet`, `opus`) only chooses the model for a fresh measurement.
 *
 * Claude Code reports the exact ID in two places: `model` on the stream-json `system/init` line and
 * the keys of `modelUsage` in the result envelope. Capture is fail-closed: zero or several
 * candidates give `null` (unknown), never a guess. An auxiliary key of another family, for example
 * a Haiku call the CLI made for itself, is ignored.
 */

/**
 * A Claude Code family alias (`sonnet`, `opus`, `fable`, `haiku`, with an optional `[1m]`-style
 * suffix). Anything else is an exact request, and an exact request is its own identity.
 */
export function isAliasRequest(requested) {
  return typeof requested === "string" && /^(sonnet|opus|fable|haiku)(\[[^\]]*\])?$/i.test(requested);
}

function aliasFamily(requested) {
  return requested.replace(/\[.*\]$/, "").toLowerCase();
}

const FAMILY_PREFIX = /^(claude-(?:sonnet|opus|fable|haiku)-)/;

/**
 * The exact ID a call ran on, from the JSON envelope's `modelUsage` keys. Auxiliary keys of
 * another family (a Haiku call the CLI made for itself) are ignored; conflicting keys of the SAME
 * family are not, so an envelope that names two models of the family is unknown whether the
 * request is an alias or an exact ID, and whether or not the run has pinned an ID.
 * Alias request: the single key starting `claude-<family>-`. Exact request: the one same-family
 * key must equal it. Zero or conflicting candidates give `null`, which no caller may turn back
 * into the request.
 */
export function resolvedModelFromUsage(requested, modelUsage) {
  if (typeof requested !== "string" || requested === "") return null;
  if (modelUsage === null || typeof modelUsage !== "object" || Array.isArray(modelUsage)) return null;
  const keys = Object.keys(modelUsage);
  let candidates;
  if (isAliasRequest(requested)) {
    candidates = keys.filter((key) => key.startsWith(`claude-${aliasFamily(requested)}-`));
  } else {
    const prefix = FAMILY_PREFIX.exec(requested)?.[1];
    candidates = prefix ? keys.filter((key) => key.startsWith(prefix)) : keys.filter((key) => key === requested);
    if (candidates.some((key) => key !== requested)) return null;
  }
  return candidates.length === 1 ? candidates[0] : null;
}

/**
 * The exact ID an answering or discovery agent ran on. A stream `init.model` that is a `claude-`
 * ID is the answer only when the result's `modelUsage` does not contradict it: a same-family usage
 * key other than the init ID makes the capture unknown (`null`). Otherwise the `modelUsage` key,
 * by the rule above.
 */
export function resolvedModelFromStream({ requested, initModel, modelUsage }) {
  if (typeof initModel === "string" && /^claude-/.test(initModel)) {
    const prefix = FAMILY_PREFIX.exec(initModel)?.[1];
    if (prefix && modelUsage !== null && typeof modelUsage === "object" && !Array.isArray(modelUsage)) {
      const sameFamily = Object.keys(modelUsage).filter((key) => key.startsWith(prefix));
      if (sameFamily.length > 0 && !(sameFamily.length === 1 && sameFamily[0] === initModel)) return null;
    }
    return initModel;
  }
  return resolvedModelFromUsage(requested, modelUsage);
}

/**
 * Pin after the first response. Calls use the requested value until one reports its resolved ID,
 * then every later call of that role passes that exact ID. `observe` records every reported ID, so
 * a run that still saw two models shows both in `ids`.
 */
export function createModelPin(requested, { resolved = null } = {}) {
  const seen = new Set(resolved ? [resolved] : []);
  const pin = {
    requested,
    resolved,
    /** The value to pass to the CLI for the next call. */
    argument: () => pin.resolved ?? pin.requested,
    observe(id) {
      if (typeof id !== "string" || id === "") return;
      seen.add(id);
      pin.resolved ??= id;
    },
    /** Distinct exact IDs observed so far, in first-seen order. */
    get ids() {
      return [...seen];
    },
    /**
     * What an artifact stores as the identity: the pinned ID, or an exact request before any
     * response, or `null` when an alias has not resolved.
     */
    identity: () => pin.resolved ?? (isAliasRequest(pin.requested) ? null : pin.requested)
  };
  return pin;
}

/** A judge call whose resolved model is unknown or differs from the pinned one stops judging. */
export class JudgeModelIdentityError extends Error {
  constructor(message) {
    super(message);
    this.name = "JudgeModelIdentityError";
    this.code = "judge-model-identity";
  }
}

/**
 * Check one judge call's reported model against the run's pin. A verdict that is itself an error
 * (CLI failure, parse, consistency) never sets or checks the identity. A call that reports `null`
 * ran, but its model is unknown, so the judging method stops, as it does for a missing cost. An
 * adapter that reports nothing (`undefined`) is accepted only for an exact request, whose identity
 * is the request itself.
 */
export function observeJudgeModel(pin, verdict) {
  if (!pin || verdict?.score === "error") return;
  const reported = verdict?.resolvedModel;
  if (reported === undefined) {
    if (isAliasRequest(pin.requested)) {
      throw new JudgeModelIdentityError(
        `judge call did not report its model; the request "${pin.requested}" is an alias, so the judge identity is unknown`
      );
    }
    return;
  }
  if (reported === null) {
    throw new JudgeModelIdentityError(
      `judge call reported no usable model for the request "${pin.argument()}"; the judge identity is unknown`
    );
  }
  if (pin.resolved && reported !== pin.resolved) {
    throw new JudgeModelIdentityError(
      `judge call ran on ${reported} after the run pinned ${pin.resolved}; refusing to mix judge models`
    );
  }
  pin.observe(reported);
}

/**
 * Check a judge verdict against the pin without losing it. A paid verdict whose model identity is
 * unknown or conflicting comes back as an error verdict that keeps its cost and its model
 * evidence (`resolvedModel`), marked `failureClass: "judge-model-identity"`, so the caller can
 * settle the spend before it stops. Other errors are not identity failures and propagate.
 */
export function checkJudgeVerdictIdentity(pin, verdict) {
  try {
    observeJudgeModel(pin, verdict);
    return verdict;
  } catch (error) {
    if (!(error instanceof JudgeModelIdentityError)) throw error;
    return {
      ...verdict,
      score: "error",
      coreAnswer: null,
      judgeScore: verdict?.score,
      failureClass: "judge-model-identity",
      rationale: error.message
    };
  }
}
