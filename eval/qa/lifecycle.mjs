import { createHash } from "node:crypto";
import path from "node:path";

export const LIFECYCLE_STATES = new Set(["proposed", "active", "quarantined", "retired"]);
export const REVIEW_STATES = new Set(["none", "queued", "in-review", "resolved"]);
export const REVIEW_TRIGGERS = new Set([
  "verified-observability-failure",
  "landed-improvement",
  "live-drift",
  "verified-user-failure",
  "recurrent-eval-evidence",
  "judge-noise",
  "proposal-verification"
]);
export const COMPILED_LIFECYCLE_STATES = new Set(["active", "quarantined"]);
export const LIFECYCLE_REGISTRY_SCHEMA = "qa-lifecycle-registry-v1";
export const LIFECYCLE_POLICY_SCHEMA = "qa-lifecycle-policy-v1";
export const MASS_REVIEW_COUNT_THRESHOLD = 25;
export const MASS_REVIEW_SHARE_THRESHOLD = 0.05;
export const QUARANTINE_REVIEW_DAYS = 30;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SCORE_CAUSE_RE = /\b(?:score|scoring|verdict|judge[- ]noise|rates?|pass[- ]rate|correct(?:ness)?[- ]rate|accuracy|aggregates?|headline|tracks?|t[1-5]|desired[- ]movement)\b/i;

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(stable(value));
}

export function contentSha256(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export const MASS_REVIEW_RULES_NAME = "qa-mass-review-rules-v1";
export const MASS_REVIEW_RULES = Object.freeze({
  name: MASS_REVIEW_RULES_NAME,
  activeQueuedCountThreshold: MASS_REVIEW_COUNT_THRESHOLD,
  activeQueuedShareThreshold: MASS_REVIEW_SHARE_THRESHOLD,
  activeQueuedShareRounding: "ceiling",
  cadenceMonths: 3,
  frozenPopulation: "active-case-ids"
});
export const MASS_REVIEW_RULES_SHA256 = contentSha256(MASS_REVIEW_RULES);

function parseDate(value) {
  if (!DATE_RE.test(value ?? "")) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value ? null : parsed;
}

function addUtcDays(value, days) {
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addUtcMonths(value, months) {
  const date = parseDate(value);
  if (!date) return null;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

function requireEvidence(problems, value, field) {
  if (!Array.isArray(value) || value.length === 0 || !value.every(nonEmptyString)) {
    problems.push(`${field} must contain non-empty strings`);
  }
}

export function lifecycleProblems(kase, { allowedStates = LIFECYCLE_STATES, today = null } = {}) {
  const problems = [];
  const lifecycle = kase?.truth?.lifecycle;
  if (!lifecycle || typeof lifecycle !== "object" || Array.isArray(lifecycle)) {
    return ["truth.lifecycle is required"];
  }
  if (!LIFECYCLE_STATES.has(lifecycle.state)) {
    problems.push(`unknown truth.lifecycle.state ${lifecycle.state}`);
  } else if (!allowedStates.has(lifecycle.state)) {
    problems.push(`truth.lifecycle.state ${lifecycle.state} is not allowed in this lane`);
  }
  if (!REVIEW_STATES.has(lifecycle.reviewState)) {
    problems.push(`unknown truth.lifecycle.reviewState ${lifecycle.reviewState}`);
  }

  const review = lifecycle.review;
  if (lifecycle.reviewState === "none" && review !== undefined) {
    problems.push("truth.lifecycle.review must be absent when reviewState is none");
  }
  if (["queued", "in-review", "resolved"].includes(lifecycle.reviewState)) {
    if (!review || typeof review !== "object" || Array.isArray(review)) {
      problems.push(`truth.lifecycle.review is required when reviewState is ${lifecycle.reviewState}`);
    } else {
      if (!parseDate(review.queuedOn)) problems.push("truth.lifecycle.review.queuedOn must be YYYY-MM-DD");
      if (!REVIEW_TRIGGERS.has(review.trigger)) problems.push(`unknown truth.lifecycle.review.trigger ${review.trigger}`);
      requireEvidence(problems, review.evidence, "truth.lifecycle.review.evidence");
      if (["in-review", "resolved"].includes(lifecycle.reviewState)) {
        if (!parseDate(review.startedOn)) problems.push("truth.lifecycle.review.startedOn must be YYYY-MM-DD");
        if (parseDate(review.queuedOn) && parseDate(review.startedOn) && review.startedOn < review.queuedOn) {
          problems.push("truth.lifecycle.review.startedOn must not precede queuedOn");
        }
        if (!nonEmptyString(review.reviewer)) problems.push("truth.lifecycle.review.reviewer is required");
        if (!nonEmptyString(review.ledger)) problems.push("truth.lifecycle.review.ledger is required");
      }
      if (lifecycle.reviewState === "resolved") {
        if (!parseDate(review.resolvedOn)) problems.push("truth.lifecycle.review.resolvedOn must be YYYY-MM-DD");
        if (parseDate(review.startedOn) && parseDate(review.resolvedOn) && review.resolvedOn < review.startedOn) {
          problems.push("truth.lifecycle.review.resolvedOn must not precede startedOn");
        }
        if (!nonEmptyString(review.resolution)) problems.push("truth.lifecycle.review.resolution is required");
      }
    }
  }

  if (lifecycle.state === "quarantined") {
    const quarantine = lifecycle.quarantine;
    if (!quarantine || typeof quarantine !== "object" || Array.isArray(quarantine)) {
      problems.push("truth.lifecycle.quarantine is required for a quarantined case");
    } else {
      if (!parseDate(quarantine.startedOn)) problems.push("truth.lifecycle.quarantine.startedOn must be YYYY-MM-DD");
      if (!parseDate(quarantine.reviewBy)) problems.push("truth.lifecycle.quarantine.reviewBy must be YYYY-MM-DD");
      if (parseDate(quarantine.startedOn) && parseDate(quarantine.reviewBy)) {
        if (quarantine.reviewBy < quarantine.startedOn) {
          problems.push("truth.lifecycle.quarantine.reviewBy must not precede startedOn");
        }
        const latest = addUtcDays(quarantine.startedOn, QUARANTINE_REVIEW_DAYS);
        if (quarantine.reviewBy > latest) problems.push(`truth.lifecycle.quarantine.reviewBy must be within ${QUARANTINE_REVIEW_DAYS} days`);
      }
      if (!nonEmptyString(quarantine.author)) problems.push("truth.lifecycle.quarantine.author is required");
      if (!nonEmptyString(quarantine.reviewer)) problems.push("truth.lifecycle.quarantine.reviewer is required");
      if (quarantine.author === quarantine.reviewer) problems.push("truth.lifecycle.quarantine.reviewer must differ from author");
      if (!nonEmptyString(quarantine.cause)) problems.push("truth.lifecycle.quarantine.cause is required");
      else if (SCORE_CAUSE_RE.test(quarantine.cause)) problems.push("truth.lifecycle.quarantine.cause must be score-independent");
      if (!nonEmptyString(quarantine.ledger)) problems.push("truth.lifecycle.quarantine.ledger is required");
      requireEvidence(problems, quarantine.evidence, "truth.lifecycle.quarantine.evidence");
      if (lifecycle.review?.trigger === "judge-noise") {
        problems.push("judge-noise review evidence cannot quarantine a case");
      }
      if (quarantine.renewals !== undefined && !Array.isArray(quarantine.renewals)) {
        problems.push("truth.lifecycle.quarantine.renewals must be an array");
      }
      for (const [index, renewal] of (quarantine.renewals ?? []).entries()) {
        const prefix = `truth.lifecycle.quarantine.renewals[${index}]`;
        if (!parseDate(renewal?.date)) problems.push(`${prefix}.date must be YYYY-MM-DD`);
        if (!parseDate(renewal?.reviewBy)) problems.push(`${prefix}.reviewBy must be YYYY-MM-DD`);
        if (parseDate(renewal?.date) && parseDate(renewal?.reviewBy) && renewal.reviewBy > addUtcDays(renewal.date, QUARANTINE_REVIEW_DAYS)) {
          problems.push(`${prefix}.reviewBy must be within ${QUARANTINE_REVIEW_DAYS} days`);
        }
        if (parseDate(renewal?.date) && parseDate(renewal?.reviewBy) && renewal.reviewBy < renewal.date) {
          problems.push(`${prefix}.reviewBy must not precede date`);
        }
        if (!nonEmptyString(renewal?.author)) problems.push(`${prefix}.author is required`);
        if (!nonEmptyString(renewal?.reviewer)) problems.push(`${prefix}.reviewer is required`);
        if (renewal?.author === renewal?.reviewer) problems.push(`${prefix}.reviewer must differ from author`);
        if (!nonEmptyString(renewal?.ledger)) problems.push(`${prefix}.ledger is required`);
        requireEvidence(problems, renewal?.evidence, `${prefix}.evidence`);
        const previousDate = index === 0 ? quarantine.startedOn : quarantine.renewals[index - 1]?.date;
        if (parseDate(previousDate) && parseDate(renewal?.date) && renewal.date <= previousDate) {
          problems.push(`${prefix}.date must follow the prior quarantine review`);
        }
        const previousReviewBy = index === 0 ? quarantine.reviewBy : quarantine.renewals[index - 1]?.reviewBy;
        if (parseDate(previousReviewBy) && parseDate(renewal?.date) && renewal.date > previousReviewBy) {
          problems.push(`${prefix}.date must not pass the prior reviewBy`);
        }
      }
      const latestReviewBy = quarantine.renewals?.at(-1)?.reviewBy ?? quarantine.reviewBy;
      if (parseDate(today) && parseDate(latestReviewBy) && today > latestReviewBy) {
        problems.push(`truth.lifecycle.quarantine decision is overdue since ${latestReviewBy}`);
      }
    }
    if (!["queued", "in-review"].includes(lifecycle.reviewState)) {
      problems.push("a quarantined case must have reviewState queued or in-review");
    }
  } else if (lifecycle.quarantine !== undefined) {
    problems.push("truth.lifecycle.quarantine is allowed only for a quarantined case");
  }

  if (lifecycle.activation !== undefined) {
    const activation = lifecycle.activation;
    if (!parseDate(activation?.date)) problems.push("truth.lifecycle.activation.date must be YYYY-MM-DD");
    if (!nonEmptyString(activation?.author)) problems.push("truth.lifecycle.activation.author is required");
    if (!nonEmptyString(activation?.reviewer)) problems.push("truth.lifecycle.activation.reviewer is required");
    if (activation?.author === activation?.reviewer) problems.push("truth.lifecycle.activation.reviewer must differ from author");
    if (!nonEmptyString(activation?.ledger)) problems.push("truth.lifecycle.activation.ledger is required");
    requireEvidence(problems, activation?.evidence, "truth.lifecycle.activation.evidence");
    if (!COMPILED_LIFECYCLE_STATES.has(lifecycle.state)) {
      problems.push("truth.lifecycle.activation is allowed only after a proposal enters the battery");
    }
  }
  if (lifecycle.reactivation !== undefined) {
    const reactivation = lifecycle.reactivation;
    if (!parseDate(reactivation?.date)) problems.push("truth.lifecycle.reactivation.date must be YYYY-MM-DD");
    if (!nonEmptyString(reactivation?.author)) problems.push("truth.lifecycle.reactivation.author is required");
    if (!nonEmptyString(reactivation?.reviewer)) problems.push("truth.lifecycle.reactivation.reviewer is required");
    if (reactivation?.author === reactivation?.reviewer) problems.push("truth.lifecycle.reactivation.reviewer must differ from author");
    if (!nonEmptyString(reactivation?.ledger)) problems.push("truth.lifecycle.reactivation.ledger is required");
    requireEvidence(problems, reactivation?.evidence, "truth.lifecycle.reactivation.evidence");
    if (lifecycle.state !== "active") {
      problems.push("truth.lifecycle.reactivation is allowed only for an active case");
    }
  }

  return problems;
}

export function tombstoneProblems(tombstone) {
  const problems = [];
  if (!tombstone || typeof tombstone !== "object" || Array.isArray(tombstone)) return ["tombstone must be an object"];
  if (!nonEmptyString(tombstone.id) || !/^q-[a-z0-9-]+$/.test(tombstone.id)) problems.push("id must be a q-* kebab id");
  if (tombstone.lifecycle?.state !== "retired") problems.push("lifecycle.state must be retired");
  if (tombstone.lifecycle?.reviewState !== "resolved") problems.push("lifecycle.reviewState must be resolved");
  if (!parseDate(tombstone.retired?.date)) problems.push("retired.date must be YYYY-MM-DD");
  if (!nonEmptyString(tombstone.retired?.author)) problems.push("retired.author is required");
  if (!nonEmptyString(tombstone.retired?.reviewer)) problems.push("retired.reviewer is required");
  if (tombstone.retired?.author === tombstone.retired?.reviewer) problems.push("retired.reviewer must differ from author");
  if (!nonEmptyString(tombstone.retired?.reason)) problems.push("retired.reason is required");
  else if (SCORE_CAUSE_RE.test(tombstone.retired.reason)) problems.push("retired.reason must be score-independent");
  if (!nonEmptyString(tombstone.retired?.ledger)) problems.push("retired.ledger is required");
  requireEvidence(problems, tombstone.retired?.evidence, "retired.evidence");
  if (!/^[a-f0-9]{64}$/.test(tombstone.retired?.lastCaseContentSha256 ?? "")) {
    problems.push("retired.lastCaseContentSha256 must be a SHA-256 digest");
  }
  if (!Array.isArray(tombstone.retired?.replacementIds) || !tombstone.retired.replacementIds.every(nonEmptyString)) {
    problems.push("retired.replacementIds must be a string array");
  }
  return problems;
}

function registryPath(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

export function buildLifecycleRegistry({
  root,
  batteryRecords,
  proposedRecords,
  tombstoneRecords,
  previousRegistry = null,
  genesis = previousRegistry === null
}) {
  const entries = [];
  const byId = new Map();
  const add = (record, lane) => {
    const id = record.value.id;
    if (byId.has(id)) throw new Error(`lifecycle id reuse: ${id} appears in ${byId.get(id).path} and ${registryPath(root, record.file)}`);
    const entry = lane === "retired"
      ? {
          id,
          path: registryPath(root, record.file),
          state: "retired",
          reviewState: "resolved",
          tombstoneContentSha256: contentSha256(record.value),
          lastCaseContentSha256: record.value.retired.lastCaseContentSha256,
          replacementIds: [...record.value.retired.replacementIds].sort()
        }
      : {
          id,
          path: registryPath(root, record.file),
          state: record.value.truth.lifecycle.state,
          reviewState: record.value.truth.lifecycle.reviewState,
          caseContentSha256: contentSha256(record.value)
        };
    byId.set(id, entry);
    entries.push(entry);
  };
  for (const record of batteryRecords) add(record, "battery");
  for (const record of proposedRecords) add(record, "proposed");
  for (const record of tombstoneRecords) add(record, "retired");

  const previousEntries = previousRegistry?.entries ?? [];
  if (previousRegistry) {
    if (previousRegistry.schema !== LIFECYCLE_REGISTRY_SCHEMA) throw new Error(`previous lifecycle registry schema must be ${LIFECYCLE_REGISTRY_SCHEMA}`);
    const previousIds = previousEntries.map((entry) => entry.id);
    if (new Set(previousIds).size !== previousIds.length) throw new Error("previous lifecycle registry has duplicate ids");
    if (canonicalJson(previousRegistry.reservedIds ?? []) !== canonicalJson([...previousIds].sort())) {
      throw new Error("previous lifecycle registry reservedIds do not match entries");
    }
  }
  const previousById = new Map(previousEntries.map((entry) => [entry.id, entry]));
  if (!genesis) {
    for (const entry of entries) {
      if (!previousById.has(entry.id) && entry.state !== "proposed") {
        throw new Error(`new lifecycle id ${entry.id} must first be committed as proposed`);
      }
    }
  }
  for (const [id, previous] of previousById) {
    const current = byId.get(id);
    if (!current) throw new Error(`reserved lifecycle id ${id} is missing; add or retain its retired tombstone`);
    if (previous.state === "retired" && current.state !== "retired") {
      throw new Error(`retired lifecycle id ${id} cannot be reused`);
    }
    if (["active", "quarantined"].includes(previous.state) && current.state === "proposed") {
      throw new Error(`compiled lifecycle id ${id} cannot return to proposed state`);
    }
    if (previous.state === "proposed" && !["proposed", "active", "quarantined", "retired"].includes(current.state)) {
      throw new Error(`proposed lifecycle id ${id} remains permanently reserved`);
    }
    if (previous.state === "proposed" && ["active", "quarantined"].includes(current.state)) {
      const source = [...batteryRecords, ...proposedRecords].find((record) => record.value.id === id)?.value;
      if (!source?.truth?.lifecycle?.activation) {
        throw new Error(`activated proposal ${id} requires truth.lifecycle.activation evidence and independent review`);
      }
    }
    if (previous.state === "quarantined" && current.state === "active") {
      const source = batteryRecords.find((record) => record.value.id === id)?.value;
      if (!source?.truth?.lifecycle?.reactivation) {
        throw new Error(`reactivated case ${id} requires truth.lifecycle.reactivation evidence and independent review`);
      }
    }
    if (current.state === "retired" && previous.state !== "retired") {
      const priorDigest = previous.caseContentSha256;
      if (priorDigest && current.lastCaseContentSha256 !== priorDigest) {
        throw new Error(`retired tombstone ${id} lastCaseContentSha256 does not match the registry`);
      }
    }
  }
  for (const entry of entries.filter((item) => item.state === "retired")) {
    for (const replacementId of entry.replacementIds) {
      if (replacementId === entry.id || !byId.has(replacementId)) {
        throw new Error(`retired tombstone ${entry.id} has unknown replacement id ${replacementId}`);
      }
    }
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));
  const counts = Object.fromEntries([...LIFECYCLE_STATES].map((state) => [
    state,
    entries.filter((entry) => entry.state === state).length
  ]));
  return {
    $comment: "Generated lifecycle registry. Regenerate with npm run eval:qa:compile.",
    schema: LIFECYCLE_REGISTRY_SCHEMA,
    digestSchema: "canonical-json-sha256-v1",
    counts,
    reservedIds: entries.map((entry) => entry.id),
    entries
  };
}

export function massReviewStatus(cases, policy, today = new Date().toISOString().slice(0, 10)) {
  const active = cases.filter((kase) => kase.truth?.lifecycle?.state === "active");
  const queued = active.filter((kase) => kase.truth?.lifecycle?.reviewState === "queued");
  const shareThresholdCount = active.length ? Math.ceil(active.length * MASS_REVIEW_SHARE_THRESHOLD) : 0;
  const cadenceDueOn = addUtcMonths(policy?.massReview?.cadenceAnchorOn, 3);
  const triggers = {
    count: queued.length >= MASS_REVIEW_COUNT_THRESHOLD,
    share: active.length > 0 && queued.length >= shareThresholdCount,
    quarter: Boolean(cadenceDueOn && today >= cadenceDueOn)
  };
  return {
    activeCount: active.length,
    queuedActiveCount: queued.length,
    queuedActiveIds: queued.map((kase) => kase.id).sort(),
    countThreshold: MASS_REVIEW_COUNT_THRESHOLD,
    shareThreshold: MASS_REVIEW_SHARE_THRESHOLD,
    shareThresholdCount,
    cadenceDueOn,
    triggers,
    required: Object.values(triggers).some(Boolean)
  };
}

export function lifecyclePolicyProblems(cases, policy, today, { enforceTriggers = true } = {}) {
  const problems = [];
  if (policy?.schema !== LIFECYCLE_POLICY_SCHEMA) problems.push(`policy schema must be ${LIFECYCLE_POLICY_SCHEMA}`);
  if (policy?.massReview?.rules !== MASS_REVIEW_RULES_NAME) {
    problems.push(`massReview.rules must be ${MASS_REVIEW_RULES_NAME}`);
  }
  if (!parseDate(policy?.massReview?.cadenceAnchorOn)) problems.push("massReview.cadenceAnchorOn must be YYYY-MM-DD");
  if (!["none", "in-review"].includes(policy?.massReview?.state)) problems.push("massReview.state must be none or in-review");
  const status = massReviewStatus(cases, policy, today);
  if (enforceTriggers && status.required && policy?.massReview?.state !== "in-review") {
    const fired = Object.entries(status.triggers).filter(([, value]) => value).map(([name]) => name).join(", ");
    problems.push(`mass review is required by ${fired}`);
  }
  if (policy?.massReview?.state === "in-review") {
    if (!parseDate(policy.massReview.startedOn)) problems.push("massReview.startedOn must be YYYY-MM-DD");
    if (!nonEmptyString(policy.massReview.ledger)) problems.push("massReview.ledger is required");
    if (!/^[a-f0-9]{64}$/.test(policy.massReview.frozenActiveIdsSha256 ?? "")) problems.push("massReview.frozenActiveIdsSha256 must be a SHA-256 digest");
    else {
      const frozenActiveIdsSha256 = contentSha256(cases
        .filter((kase) => kase.truth?.lifecycle?.state === "active")
        .map((kase) => kase.id)
        .sort());
      if (policy.massReview.frozenActiveIdsSha256 !== frozenActiveIdsSha256) {
        problems.push("massReview.frozenActiveIdsSha256 does not match the active case set");
      }
    }
    if (!/^[a-f0-9]{64}$/.test(policy.massReview.rulesSha256 ?? "")) {
      problems.push("massReview.rulesSha256 must be a SHA-256 digest");
    } else if (policy.massReview.rulesSha256 !== MASS_REVIEW_RULES_SHA256) {
      problems.push(`massReview.rulesSha256 must match ${MASS_REVIEW_RULES_NAME}`);
    }
  }
  return { problems, status };
}
