#!/usr/bin/env node
/**
 * One-off: apply the reviewed 2026-11-14 golden coverage audit to the QA corpus.
 *
 *   node apply.mjs [--dry-run] [--only id,id] [--coverage <file>] [--review <file>] [--overrides <file>]
 *                  [--todo-heading <text>] [--date YYYY-MM-DD]
 *
 * Optional inputs beside coverage.json: verify-coverage.json (the cut review) and overrides.json
 * ({ "cases": [{ id, finalVerdict?, survivor?, note?, rewrite?, leaf?, secondaryLeaf? }] }).
 * Precedence per case: overrides, verify-coverage, coverage, the verifier, the auditor. Every target state is
 * built and checked in memory first; any refusal stops the run before a file changes. A second
 * run is a no-op. Design: DESIGN.md beside this file.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUND_DIR = path.resolve(HERE, "..");
const ROOT = path.resolve(ROUND_DIR, "../../..");
const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");
const ROUND_LEDGER = ".agents/rounds/2026-11-14-golden-coverage-audit.md";
const QA = path.join(ROOT, "eval/qa");
const BATTERY = path.join(QA, "corpus/battery");
const PROPOSED = path.join(QA, "corpus/proposed");
const RETIRED = path.join(QA, "corpus/retired");
const REGISTER = path.join(QA, "consistency-register.json");
const SENTINELS = path.join(QA, "source-sentinels.json");
const LEDGER = path.join(QA, "corpus/migration-ledger.json");
const TAXONOMY_OUT = path.join(QA, "taxonomy.json");

const { validateCase } = await import(path.join(QA, "compile-qa.mjs"));
const { contentSha256, COMPILED_LIFECYCLE_STATES, tombstoneProblems } = await import(path.join(QA, "lifecycle.mjs"));
const lint = await import(path.join(QA, "lint-corpus.mjs"));

const SCORE_CAUSE_RE = /\b(?:score|scoring|verdict|judge[- ]noise|pass[- ]rate|correct(?:ness)?[- ]rate|accuracy|aggregates?|headline|tracks?|t[1-5]|desired[- ]movement)\b/i;
const HEADLINE = new Set(["keep", "tighten"]);
const wrappedAvoid = [];
const VERDICTS = new Set(["keep", "tighten", "merge", "retire", "move-tool-lane"]);
// Leading gerunds seen in the reviewed avoid items, mapped to the base verb. An unmapped gerund
// is refused, never guessed.
const GERUNDS = Object.fromEntries(`Advising advise|Affirming affirm|Asking ask|Asserting assert|Assuming assume|
Attributing attribute|Calling call|Checking check|Claiming claim|Conflating conflate|Confusing confuse|
Declaring declare|Describing describe|Emitting emit|Exporting export|Flattening flatten|Giving give|
Hard-coding hard-code|Implying imply|Including include|Inferring infer|Inflating inflate|Inventing invent|
Issuing issue|Listing list|Naming name|Offering offer|Outputting output|Passing pass|Pinning pin|
Predicting predict|Prescribing prescribe|Presenting present|Promising promise|Putting put|Refusing refuse|
Relying rely|Removing remove|Requesting request|Routing route|Saying say|Signing sign|Stating state|
Substituting substitute|Summing sum|Treating treat|Using use|Writing write`.split("|").map((pair) => pair.trim().split(" ")));
const NOT_GERUNDS = new Set(["Missing"]);
// Coordinated gerunds after a leading gerund ("Summing rows or mixing snapshots"). Words that are
// also nouns here (staking, voting, licensing, timing) are left alone.
const COORDINATED = Object.fromEntries(`advising advise|asserting assert|calling call|claiming claim|comparing compare|
conflating conflate|counting count|denying deny|deploying deploy|describing describe|equating equate|excluding exclude|
giving give|guaranteeing guarantee|ignoring ignore|inferring infer|inventing invent|issuing issue|making make|
merging merge|mixing mix|pinning pin|recommending recommend|relabeling relabel|repeating repeat|saying say|
submitting submit|treating treat`.split("|").map((pair) => pair.trim().split(" ")));
const IMPERATIVES = new Set(["Use", "Store", "Give", "Pass"]);
const PROPER_NOUNS = new Set(["Stellar", "Soroban", "Rust", "Horizon", "Freighter", "Circle", "Lobstr", "Reflector",
  "Friendbot", "Galexie", "Hubble", "Blend", "Aquarius", "Soroswap", "Ethereum", "Solana", "Bitcoin", "Coinbase",
  "Binance", "Lumenloop", "Scout", "Raven", "Meridian", "MoneyGram", "Pi"]);

function parseArgs(argv) {
  const options = { dryRun: false, only: null, coverage: path.join(ROUND_DIR, "coverage/coverage.json"),
    review: path.join(ROUND_DIR, "coverage/verify-coverage.json"), overrides: path.join(ROUND_DIR, "coverage/overrides.json"),
    todoHeading: "Apply the 2026-11-14 golden coverage audit", date: "2026-11-14" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (["--only", "--coverage", "--review", "--overrides", "--todo-heading", "--date"].includes(arg)) {
      if (!argv[i + 1]) throw new Error(`${arg} requires a value`);
      const value = argv[++i];
      if (arg === "--only") options.only = new Set(value.split(",").map((id) => id.trim()).filter(Boolean));
      else if (arg === "--coverage") options.coverage = path.resolve(value);
      else if (arg === "--review") options.review = path.resolve(value);
      else if (arg === "--overrides") options.overrides = path.resolve(value);
      else if (arg === "--todo-heading") options.todoHeading = value;
      else options.date = value;
    } else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, value) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".json") ? [full] : [];
  });
}

function loadRecords(kind, key) {
  const map = new Map();
  for (const name of readdirSync(path.join(ROUND_DIR, kind)).filter((f) => f.endsWith(".json")).sort()) {
    const file = path.join(ROUND_DIR, kind, name);
    const doc = readJson(file);
    for (const record of doc[key]) {
      if (map.has(record.id)) throw new Error(`${kind}: duplicate record ${record.id}`);
      map.set(record.id, { record, lane: doc.lane, ref: `${rel(file)}#${record.id}` });
    }
  }
  return map;
}

function normalizeAvoid(item) {
  const text = item.trim();
  if (/^Do NOT\b/.test(text)) return { text };
  const prefixed = /^(?:do not|don't)\s+(.*)$/is.exec(text);
  if (prefixed) return { text: `Do NOT ${prefixed[1]}` };
  const [first, ...rest] = text.split(/\s+/);
  const tail = rest.join(" ");
  if (GERUNDS[first]) {
    const coordinated = tail.replace(/\b(or|and|nor)\s+([a-z][a-z-]*ing)\b/g, (match, conj, word) => COORDINATED[word] ? `${conj} ${COORDINATED[word]}` : match);
    return { text: `Do NOT ${GERUNDS[first]} ${coordinated}` };
  }
  if (/^[A-Z][a-z-]+ing$/.test(first) && !NOT_GERUNDS.has(first)) return { error: `unmapped leading gerund "${first}" in avoid item: ${text}` };
  if (IMPERATIVES.has(first)) return { text: `Do NOT ${first.toLowerCase()} ${tail}` };
  const lowered = /^[A-Z][a-z]*(?:-[a-z]+)*$/.test(first) && !PROPER_NOUNS.has(first)
    ? `${first[0].toLowerCase()}${first.slice(1)}`
    : first;
  return { text: `Do NOT claim that ${[lowered, tail].filter(Boolean).join(" ")}`, wrapped: true };
}

function liveEvidence(evidence) {
  return `Live ${evidence.class} ${evidence.observedAt}: ${evidence.ref} -- '${evidence.quote}'`;
}

const DISPOSITION_VERDICT = { merged: "merge", retired: "retire", "tool-lane": "move-tool-lane" };
const ABSORB_RE = /Absorb(?: one)? facts?:\s*(.+)$/is;

/**
 * Resolve the final decision for one case. Precedence: overrides.json, verify-coverage.json,
 * coverage.json (its disposition is the state after the coverage lane's cuts), the verifier, the
 * auditor.
 */
function resolve(id, sources) {
  const { audit, verify, coverage, review, overrides } = sources;
  const a = audit.get(id);
  const v = verify.get(id);
  const c = coverage.cases.get(id);
  const o = overrides.get(id);
  const base = v?.record.finalVerdict ?? a.record.verdict;
  let verdict = base;
  let survivor = a.record.mergeInto ?? a.record.survivor ?? null;
  const reasons = [v?.record.why, a.record.reason];
  const absorb = [a.record.absorb];
  if (c) {
    verdict = c.disposition === "headline" ? base : DISPOSITION_VERDICT[c.disposition] ?? base;
    if (c.survivor) survivor = c.survivor;
    reasons.unshift(c.note);
    absorb.push(ABSORB_RE.exec(c.note ?? "")?.[1]);
  }
  const cut = coverage.extraCuts.get(id);
  if (cut) {
    reasons.unshift(cut.why);
    absorb.push(ABSORB_RE.exec(cut.why ?? "")?.[1]);
    if (cut.into) survivor = cut.into;
    const check = review.extraCuts.get(id);
    if (check?.decision === "reject") {
      // A rejected cut keeps the case on its leaf with its pre-coverage verdict.
      verdict = base === "keep" ? "keep" : "tighten";
      survivor = null;
    } else if (check) {
      reasons.unshift(check.why);
      if (check.decision === "accept-with-absorb") {
        absorb.push(check.absorbFact);
        // An absorbed fact moves the cut case's knowledge forward, so the tombstone points there.
        if (check.absorbInto && verdict === "retire") { verdict = "merge"; survivor = check.absorbInto; }
      }
    }
  }
  const fix = review.mergeFixes.get(id);
  if (fix?.survivor) survivor = fix.survivor;
  const tool = review.toolLane.get(id) ?? coverage.toolLane.get(id);
  if (tool?.final === "retire") {
    verdict = "retire";
    reasons.unshift(tool.why, `Raven-mechanics case covered by ${coverage.toolLane.get(id)?.coveredBy ?? "another check"}.`);
  } else if (tool?.final === "keep-tool-lane") verdict = "move-tool-lane";
  if (o?.finalVerdict) verdict = o.finalVerdict;
  if (o?.survivor) survivor = o.survivor;
  if (o?.note) reasons.unshift(o.note);
  if (verdict === "merge" && !survivor) {
    const candidates = [...new Set((a.record.duplicates ?? []).map((d) => d.survivor).filter((s) => s && s !== id))];
    if (candidates.length === 1) survivor = candidates[0];
  }
  return {
    id, verdict, survivor, reasons,
    rewrite: o?.rewrite ?? v?.record.finalRewrite ?? a.record.rewrite ?? null,
    overridden: Boolean(o?.rewrite),
    leaf: o?.leaf ?? c?.leaf ?? null, secondaryLeaf: o?.secondaryLeaf ?? c?.secondaryLeaf ?? null,
    audit: a, verify: v, absorb: [...new Set(absorb.filter(nonEmpty).map((t) => t.trim()))]
  };
}

function corroborationFromRot(rot, freshness) {
  return rot.filter((entry) => entry.result === "holds" && entry.evidence?.length).map((entry) => ({
    claim: entry.claim,
    verdict: freshness === "stable" ? "confirmed" : "confirmed-as-of",
    evidence: entry.evidence.map((e) => ({ class: e.class, ref: e.ref, observedAt: e.observedAt, note: e.quote }))
  }));
}

function verifiedEvent(decision, options) {
  const rot = decision.audit.record.rot ?? [];
  const evidence = [
    `Audit record: ${decision.audit.ref}`,
    ...(decision.verify ? [`Verifier decision: ${decision.verify.ref}`] : []),
    `Coverage decision: ${rel(options.coverage)}#${decision.id}`,
    ...rot.flatMap((entry) => entry.evidence ?? []).map(liveEvidence),
    ...(decision.verify?.record.evidence ?? []).map(liveEvidence)
  ];
  const rootCause = [`.agents/TODO.md — ${options.todoHeading}`];
  if (rot.some((entry) => entry.result === "changed")) rootCause.push("freshness-drift");
  const lanes = [decision.audit.lane, decision.verify?.lane].filter(Boolean).join(", ");
  return { date: options.date, by: `Golden coverage audit ${options.date} (${lanes}; ${ROUND_LEDGER})`, evidence: [...new Set(evidence)], rootCause };
}

function alreadyApplied(kase) {
  return String(kase.truth?.verified?.by ?? "").includes(ROUND_LEDGER);
}

function roundEvidenceCoversCase(decision, options) {
  const rot = decision.audit.record.rot ?? [];
  return rot.length > 0
    && !(decision.audit.record.notRechecked?.length)
    && rot.every((entry) => ["holds", "changed"].includes(entry.result) && entry.evidence?.length
      && entry.evidence.every((e) => e.observedAt >= options.date));
}

function applyRewrite(kase, decision, options, sentinelCaseIds, problems) {
  const next = structuredClone(kase);
  const rw = decision.rewrite;
  if (nonEmpty(rw.question)) next.question = rw.question;
  const avoid = [];
  for (const item of rw.avoid ?? []) {
    const normalized = normalizeAvoid(item);
    if (normalized.error) problems.push(normalized.error);
    else avoid.push(normalized.text);
    if (normalized.wrapped) wrappedAvoid.push({ id: kase.id, from: item, to: normalized.text });
  }
  next.golden = { answer: rw.answer, keyFacts: [...rw.keyFacts], avoid };
  if (nonEmpty(rw.notes)) next.golden.notes = rw.notes;
  if (nonEmpty(kase.golden?.notes)) next.truth.notes = kase.golden.notes;
  const rows = next.truth.corroboration ?? [];
  for (const row of corroborationFromRot(decision.audit.record.rot ?? [], next.tags.freshness)) {
    if (!rows.some((existing) => existing.claim === row.claim)) rows.push(row);
  }
  if (rows.length) next.truth.corroboration = rows;
  next.truth.verified = verifiedEvent(decision, options);
  if (next.truth.asOf && !sentinelCaseIds.has(kase.id) && roundEvidenceCoversCase(decision, options)) next.truth.asOf = options.date;
  return next;
}

function setLeaf(kase, decision) {
  if (decision.leaf) kase.truth.leaf = decision.leaf;
  if (decision.secondaryLeaf) kase.truth.secondaryLeaf = decision.secondaryLeaf;
  else delete kase.truth.secondaryLeaf;
}

function retireReason(decision, problems) {
  const reason = decision.reasons.find((text) => nonEmpty(text) && !SCORE_CAUSE_RE.test(text));
  if (!reason) problems.push("no score-independent retirement reason (coverage note, verifier why, auditor reason all match SCORE_CAUSE_RE)");
  const prefix = decision.verdict === "merge" ? `Merged into ${decision.survivor}. ` : "";
  return `${prefix}${reason ?? ""}`.trim();
}

function tombstoneFor(kase, decision, options, problems) {
  const tombstone = {
    id: kase.id,
    lifecycle: { state: "retired", reviewState: "resolved" },
    retired: {
      date: options.date,
      author: `${decision.audit.lane} (golden coverage audit)`,
      reviewer: `${decision.verify?.lane ?? "coverage"} (golden coverage audit)`,
      reason: retireReason(decision, problems),
      ledger: ROUND_LEDGER,
      evidence: [
        `Audit record: ${decision.audit.ref}`,
        ...(decision.verify ? [`Verifier decision: ${decision.verify.ref}`] : []),
        `Coverage decision: ${rel(options.coverage)}#${kase.id}`
      ],
      lastCaseContentSha256: contentSha256(kase),
      replacementIds: decision.verdict === "merge" ? [decision.survivor] : []
    }
  };
  problems.push(...tombstoneProblems(tombstone));
  return tombstone;
}

const byId = (rows = []) => new Map((Array.isArray(rows) ? rows : Object.entries(rows).map(([id, row]) => ({ id, ...row }))).map((row) => [row.id, row]));

function loadCoverage(file) {
  if (!existsSync(file)) throw new Error(`coverage file is missing: ${rel(file)} (pass --coverage <file>)`);
  const doc = readJson(file);
  return { doc, cases: byId(doc.cases), extraCuts: byId(doc.extraCuts), toolLane: byId(doc.toolLane) };
}

/** Optional coverage/verify-coverage.json (briefs/verify-coverage.md) and coverage/overrides.json. */
function loadOptional(file) {
  return existsSync(file) ? readJson(file) : null;
}

function buildTaxonomy(map, finalCases, coverage) {
  const leaves = map.domains.flatMap((domain) => domain.leaves.map((leaf) => ({
    id: leaf.id, title: leaf.title, domain: domain.id, weight: leaf.weight, volatility: leaf.volatility, cases: leaf.cases
  })));
  const active = new Set(finalCases
    .filter((kase) => kase.truth.lane !== "tool" && kase.truth.lifecycle.state === "active")
    .map((kase) => kase.truth.leaf));
  const coverageLeaves = new Map((coverage.doc.leaves ?? []).map((leaf) => [leaf.id, leaf]));
  const openSlots = leaves.filter((leaf) => leaf.weight >= 2 && !active.has(leaf.id)).map((leaf) => {
    const facets = (coverageLeaves.get(leaf.id)?.slots ?? []).map((slot) => slot.facet).filter(nonEmpty);
    const waived = (coverageLeaves.get(leaf.id)?.waived ?? []).map((w) => `${w.facet} (tested by ${(w.coveredBy ?? []).join(", ")})`);
    const parts = [
      facets.length ? `Awaiting a verified proposal for: ${facets.join("; ")}.` : null,
      waived.length ? `Waived, covered by a case on another leaf: ${waived.join("; ")}.` : null
    ].filter(Boolean);
    return { leaf: leaf.id, reason: parts.join(" ") || "Awaiting a verified proposal; the 2026-11-14 audit left this leaf empty." };
  });
  return {
    $comment: "Coverage map for the QA battery (2026-11-14 golden coverage audit). Each headline case names one leaf in truth.leaf. openSlots lists empty weight-2/3 leaves; a slot is removed when its leaf gains an active case.",
    schema: "qa-taxonomy-v1",
    domains: map.domains.map((domain) => ({ id: domain.id, title: domain.title })),
    leaves,
    openSlots
  };
}

function updateRegister(register, retired, date) {
  const changes = [];
  const fix = (ids, substitute) => {
    const out = [];
    for (const id of ids) {
      const replacement = retired.has(id) ? (substitute ? retired.get(id) : null) : id;
      if (replacement && !out.includes(replacement)) out.push(replacement);
    }
    return out;
  };
  const prune = (entry, members) => {
    if (!entry.memberContentSha256) return;
    for (const id of Object.keys(entry.memberContentSha256)) if (!members.includes(id)) delete entry.memberContentSha256[id];
  };
  const clusters = Array.isArray(register.clusters) ? register.clusters : register.clusters?.entries ?? [];
  for (let i = clusters.length - 1; i >= 0; i--) {
    const cluster = clusters[i];
    const members = fix(cluster.members, true);
    if (members.join() === cluster.members.join()) continue;
    if (members.length < 2) { changes.push(`delete cluster ${cluster.id} (members ${cluster.members.join(", ")})`); clusters.splice(i, 1); continue; }
    changes.push(`cluster ${cluster.id}: ${cluster.members.join(", ")} -> ${members.join(", ")}`);
    cluster.members = members;
    prune(cluster, members);
  }
  for (const [collection, field, label] of [["numericInvariants", "affectedCaseIds", "label"], ["dateContingentTraps", "caseIds", "triggerDateEvent"]]) {
    const entries = register[collection]?.entries ?? [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      const ids = fix(entry[field] ?? [], false);
      if (collection === "dateContingentTraps") {
        // A trap's prose may quote a retired case's reverifyBy; that date no longer exists.
        for (const [key, value] of Object.entries(entry)) {
          if (typeof value !== "string") continue;
          const next = value.replace(/\b(q-[a-z0-9-]+) reverifyBy \d{4}-\d{2}-\d{2}\b/g, (match, id) => {
            if (!retired.has(id)) return match;
            return retired.get(id) ? `${id} (merged into ${retired.get(id)} on ${date})` : `${id} (retired on ${date})`;
          });
          if (next !== value) { changes.push(`dateContingentTraps "${entry[label]}": ${key} names retired cases`); entry[key] = next; }
        }
      }
      if (ids.join() === (entry[field] ?? []).join()) continue;
      if (ids.length === 0) { changes.push(`delete ${collection} "${entry[label]}"`); entries.splice(i, 1); continue; }
      changes.push(`${collection} "${entry[label]}": drop ${entry[field].filter((id) => !ids.includes(id)).join(", ")}`);
      entry[field] = ids;
      prune(entry, ids);
    }
  }
  return changes;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sources = {
    audit: loadRecords("audit", "records"),
    verify: loadRecords("verify", "decisions"),
    coverage: loadCoverage(options.coverage)
  };
  const reviewDoc = loadOptional(options.review);
  sources.review = { doc: reviewDoc, extraCuts: byId(reviewDoc?.extraCuts), mergeFixes: byId(reviewDoc?.mergeFixes), toolLane: byId(reviewDoc?.toolLane) };
  const overridesDoc = loadOptional(options.overrides);
  sources.overrides = byId(overridesDoc?.cases);
  console.log(`[inputs] coverage=${rel(options.coverage)} verify-coverage=${reviewDoc ? rel(options.review) : "absent"} overrides=${overridesDoc ? `${rel(options.overrides)} (${sources.overrides.size})` : "absent"}`);
  const map = readJson(path.join(ROUND_DIR, "map/taxonomy.json"));
  const leafIds = new Set(map.domains.flatMap((domain) => domain.leaves.map((leaf) => leaf.id)));
  const sentinels = readJson(SENTINELS);
  const sentinelCaseIds = new Set(sentinels.sentinels.map((s) => s.caseId));

  const files = new Map();
  // This round's own gap proposals are out of scope: they enter later through activation.
  const ROUND_PROPOSAL_ORIGIN = "golden-coverage-audit 2026-11-14";
  let skippedProposals = 0;
  for (const file of [...walk(BATTERY), ...walk(PROPOSED)]) {
    const kase = readJson(file);
    if (file.startsWith(PROPOSED) && !sources.audit.has(kase.id) && String(kase.truth?.origin ?? "").startsWith(ROUND_PROPOSAL_ORIGIN)) {
      skippedProposals++;
      continue;
    }
    files.set(kase.id, file);
  }
  console.log(`[inputs] skipped ${skippedProposals} round proposals (truth.origin "${ROUND_PROPOSAL_ORIGIN}")`);
  const tombstoneIds = new Set(walk(RETIRED).map((file) => readJson(file).id));

  const refusals = [];
  const warnings = [];
  const plan = [];
  const decisions = new Map();
  for (const id of [...sources.audit.keys()].sort()) decisions.set(id, resolve(id, sources));
  for (const id of files.keys()) if (!decisions.has(id)) refusals.push({ id, problem: "case file has no audit record" });
  for (const id of sources.coverage.cases.keys()) if (!decisions.has(id)) refusals.push({ id, problem: "coverage names an id with no audit record" });
  for (const id of sources.overrides.keys()) if (!decisions.has(id)) refusals.push({ id, problem: "overrides.json names an id with no audit record" });
  for (const [id, o] of sources.overrides) if (o.finalVerdict && !VERDICTS.has(o.finalVerdict)) refusals.push({ id, problem: `overrides.json finalVerdict ${o.finalVerdict} is not one of ${[...VERDICTS].join(", ")}` });

  for (const decision of decisions.values()) {
    const { id } = decision;
    if (options.only && !options.only.has(id)) continue;
    const problems = [];
    const file = files.get(id);
    if (!VERDICTS.has(decision.verdict)) problems.push(`unknown final verdict ${decision.verdict}`);
    if (!file) {
      if (tombstoneIds.has(id) && ["retire", "merge"].includes(decision.verdict)) plan.push({ id, action: "noop", detail: "already retired" });
      else problems.push("no case file and no matching tombstone");
      if (problems.length) refusals.push(...problems.map((problem) => ({ id, problem })));
      continue;
    }
    const kase = readJson(file);
    const proposal = file.startsWith(PROPOSED);
    if (["retire", "merge"].includes(decision.verdict)) {
      if (decision.verdict === "merge") {
        const survivor = decision.survivor ? decisions.get(decision.survivor) : null;
        if (!decision.survivor) problems.push("merge has no resolvable survivor (ambiguous duplicates; set coverage survivor)");
        else if (!survivor) problems.push(`survivor ${decision.survivor} has no audit record`);
        else if (survivor.verdict === "move-tool-lane") warnings.push({ id, warning: `survivor ${decision.survivor} is in the tool lane, outside the headline` });
        else if (!HEADLINE.has(survivor.verdict)) problems.push(`survivor ${decision.survivor} is itself ${survivor.verdict}`);
        else if (files.get(decision.survivor)?.startsWith(PROPOSED)) warnings.push({ id, warning: `survivor ${decision.survivor} is a proposal, outside the battery` });
        for (const fact of decision.absorb) {
          if (survivor && !survivor.overridden) warnings.push({ id, warning: `absorb pending into ${decision.survivor} (${survivor.verdict}, no override rewrite): ${fact}` });
        }
      }
      if (decision.verdict === "retire") {
        for (const fact of decision.absorb) warnings.push({ id, warning: `retires with absorb text but no survivor: ${fact}` });
      }
      const tombstone = tombstoneFor(kase, decision, options, problems);
      plan.push({ id, action: decision.verdict, file, tombstone, survivor: decision.survivor, proposal });
    } else if (decision.verdict === "move-tool-lane") {
      const next = decision.rewrite && !alreadyApplied(kase) ? applyRewrite(kase, decision, options, sentinelCaseIds, problems) : structuredClone(kase);
      next.truth.lane = "tool";
      delete next.truth.leaf;
      delete next.truth.secondaryLeaf;
      plan.push({ id, action: "tool", file, before: kase, after: next });
    } else {
      if (!proposal && !leafIds.has(decision.leaf)) problems.push(`headline case needs a taxonomy leaf; got ${JSON.stringify(decision.leaf)}`);
      if (decision.secondaryLeaf && (!leafIds.has(decision.secondaryLeaf) || decision.secondaryLeaf === decision.leaf)) problems.push(`invalid secondaryLeaf ${decision.secondaryLeaf}`);
      let next;
      if (decision.verdict === "tighten" && !alreadyApplied(kase)) {
        const rw = decision.rewrite;
        if (!rw) problems.push("tighten has no rewrite");
        else if (!Array.isArray(rw.keyFacts) || rw.keyFacts.length === 0) problems.push("rewrite has no key facts");
        else if (!nonEmpty(rw.answer)) problems.push("rewrite has no answer");
        else next = applyRewrite(kase, decision, options, sentinelCaseIds, problems);
      }
      next ??= structuredClone(kase);
      setLeaf(next, decision);
      plan.push({ id, action: decision.verdict === "tighten" ? "rewrite" : "leaf", file, before: kase, after: next });
    }
    refusals.push(...problems.map((problem) => ({ id, problem })));
  }

  // Validate every target case file and the corpus-level lint lanes on the would-be state.
  for (const step of plan.filter((s) => s.after)) {
    try {
      validateCase(step.file, step.after, { allowedLifecycleStates: step.file.startsWith(PROPOSED) ? new Set(["proposed"]) : COMPILED_LIFECYCLE_STATES });
    } catch (error) {
      refusals.push({ id: step.id, problem: `invalid result: ${error.message}` });
    }
    if (JSON.stringify(step.before) === JSON.stringify(step.after)) step.action = "noop";
  }
  const retiredMap = new Map(plan.filter((s) => s.tombstone).map((s) => [s.id, s.action === "merge" ? s.survivor : null]));
  const register = readJson(REGISTER);
  const registerChanges = updateRegister(register, retiredMap, options.date);
  const droppedSentinels = sentinels.sentinels.filter((s) => retiredMap.has(s.caseId));
  sentinels.sentinels = sentinels.sentinels.filter((s) => !retiredMap.has(s.caseId));

  const finalById = new Map();
  for (const file of walk(BATTERY)) { const kase = readJson(file); finalById.set(kase.id, kase); }
  for (const step of plan) {
    if (step.tombstone && !step.proposal) finalById.delete(step.id);
    else if (step.after && !step.file.startsWith(PROPOSED)) finalById.set(step.id, step.after);
  }
  const finalCases = [...finalById.values()];
  const taxonomy = buildTaxonomy(map, finalCases, sources.coverage);
  const allTombstones = [...walk(RETIRED).map(readJson), ...plan.filter((s) => s.tombstone).map((s) => s.tombstone)];
  const corpusFindings = [
    ...lint.lintCorroboration(finalCases, register),
    ...lint.lintGoldenAuthoring(finalCases),
    ...lint.lintNumericInvariants(finalCases, register),
    ...lint.lintDateContingentTraps(finalCases, register),
    ...lint.lintLedger(finalCases, readJson(LEDGER), true, new Set(allTombstones.map((t) => t.id))),
    ...(options.only ? [] : lint.lintCoverage(finalCases, taxonomy, true))
  ];
  const touched = new Set(plan.map((s) => s.id));
  for (const item of corpusFindings.filter((f) => f.level === "error")) {
    if (options.only && !touched.has(item.id)) continue;
    refusals.push({ id: item.id, problem: `lint ${item.lane}: ${item.message}` });
  }
  const warnCount = corpusFindings.filter((f) => f.level === "warn").length;

  const counts = {};
  for (const step of plan) counts[step.action] = (counts[step.action] ?? 0) + 1;
  if (options.dryRun || refusals.length) {
    for (const step of plan) {
      const extra = step.action === "merge" ? ` -> ${step.survivor}` : step.after?.truth?.leaf ? ` leaf=${step.after.truth.leaf}` : "";
      console.log(`[plan] ${step.action.padEnd(7)} ${step.id}${extra}`);
      if (options.dryRun && step.after && step.action === "rewrite") {
        const changed = step.before.golden.avoid.length !== step.after.golden.avoid.length || step.after.golden.avoid.some((a, i) => a !== (step.before.golden.avoid[i] ?? ""));
        if (changed) for (const item of step.after.golden.avoid) console.log(`         avoid: ${item}`);
      }
    }
    for (const change of registerChanges) console.log(`[register] ${change}`);
    for (const s of droppedSentinels) console.log(`[sentinel] drop ${s.id} (case ${s.caseId} retires)`);
    for (const w of warnings) console.log(`[warn] ${w.id}: ${w.warning}`);
    for (const w of wrappedAvoid) console.log(`[avoid-wrapped] ${w.id}: ${w.to}`);
    for (const f of corpusFindings.filter((item) => item.level === "warn")) console.log(`[lint-warn] ${f.lane} ${f.id}: ${f.message}`);
  }
  console.log(`[summary] ${Object.entries(counts).sort().map(([k, v]) => `${k}=${v}`).join(" ")}; refusals=${refusals.length}; lintWarnings=${warnCount}; openSlots=${taxonomy.openSlots.length}; headline=${finalCases.filter((k) => k.truth.lane !== "tool").length}; tool=${finalCases.filter((k) => k.truth.lane === "tool").length}`);
  if (refusals.length) {
    for (const r of refusals.sort((a, b) => a.id.localeCompare(b.id))) console.error(`[refuse] ${r.id}: ${r.problem}`);
    console.error(`[apply] ${refusals.length} refusal(s); nothing written`);
    process.exitCode = 1;
    return;
  }
  if (options.dryRun) return;

  for (const step of plan) {
    if (step.after && step.action !== "noop") writeJson(step.file, step.after);
    if (step.tombstone) {
      writeJson(path.join(RETIRED, `${step.id}.json`), step.tombstone);
      rmSync(step.file);
    }
  }
  writeJson(REGISTER, register);
  writeJson(SENTINELS, sentinels);
  writeJson(TAXONOMY_OUT, taxonomy);
  console.log("[apply] written; next: npm run eval:qa:compile && npm run eval:qa:register");
}

main();
