import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildLifecycleRegistry,
  contentSha256,
  lifecyclePolicyProblems,
  lifecycleProblems,
  massReviewStatus,
  tombstoneProblems
} from "../eval/qa/lifecycle.mjs";
import { partitionLifecycleCases, stratifiedSample } from "../eval/qa/lib.mjs";
import { buildRunnerTracks } from "../eval/qa/run-qa.mjs";
import { formatFiveTrackSummary } from "../eval/qa/five-track.mjs";
import { lintLifecycle } from "../eval/qa/lint-corpus.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function kase(id, state = "active", reviewState = "none") {
  return {
    id,
    tags: { service: "scout", category: "protocol-core" },
    truth: { lifecycle: { state, reviewState } }
  };
}

function record(value, lane = "battery") {
  return { file: path.join(ROOT, "eval/qa/corpus", lane, "protocol-core", `${value.id}.json`), value };
}

function registry(input, previousRegistry = null) {
  return buildLifecycleRegistry({
    root: ROOT,
    batteryRecords: input.battery ?? [],
    proposedRecords: input.proposed ?? [],
    tombstoneRecords: input.retired ?? [],
    previousRegistry
  });
}

function tombstone(id, lastCaseContentSha256, replacementIds = []) {
  return {
    id,
    lifecycle: { state: "retired", reviewState: "resolved" },
    retired: {
      date: "2026-08-29",
      author: "author",
      reviewer: "reviewer",
      reason: "The case duplicates an unchanged product boundary.",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      evidence: ["reviewed duplicate map"],
      lastCaseContentSha256,
      replacementIds
    }
  };
}

describe("golden lifecycle", () => {
  it("accepts only active and quarantined cases in the compiled battery", () => {
    expect(lifecycleProblems(kase("q-active"), { allowedStates: new Set(["active", "quarantined"]) })).toEqual([]);
    expect(lifecycleProblems(kase("q-proposed", "proposed"), { allowedStates: new Set(["active", "quarantined"]) })).toContain(
      "truth.lifecycle.state proposed is not allowed in this lane"
    );
  });

  it("requires a score-independent quarantine with independent review and a 30-day decision", () => {
    const quarantined = kase("q-quarantined", "quarantined", "queued");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "verified-user-failure",
      evidence: [".agents/rounds/2026-08-29-golden-lifecycle.md"]
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-29",
      author: "same",
      reviewer: "same",
      cause: "The judge score fell.",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      evidence: ["verified conflict"]
    };
    const problems = lifecycleProblems(quarantined).join("\n");
    expect(problems).toMatch(/within 30 days/);
    expect(problems).toMatch(/reviewer must differ/);
    expect(problems).toMatch(/score-independent/);
  });

  it("requires ordered review dates and timely quarantine renewals", () => {
    const quarantined = kase("q-renew", "quarantined", "resolved");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      startedOn: "2026-08-28",
      resolvedOn: "2026-08-27",
      trigger: "verified-user-failure",
      reviewer: "reviewer",
      ledger: "ledger",
      evidence: ["verified conflict"],
      resolution: "renewed"
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-28",
      author: "author",
      reviewer: "reviewer",
      cause: "A primary source is inaccurate.",
      ledger: "ledger",
      evidence: ["verified conflict"],
      renewals: [{
        date: "2026-09-29",
        reviewBy: "2026-10-29",
        author: "author",
        reviewer: "reviewer",
        ledger: "ledger",
        evidence: ["renewal evidence"]
      }]
    };
    const problems = lifecycleProblems(quarantined).join("\n");
    expect(problems).toMatch(/startedOn must not precede queuedOn/);
    expect(problems).toMatch(/resolvedOn must not precede startedOn/);
    expect(problems).toMatch(/date must not pass the prior reviewBy/);
    expect(problems).not.toMatch(/score-independent/);
  });

  it("reserves proposed and retired IDs and rejects every reuse", () => {
    const proposedCase = kase("q-reserved", "proposed", "queued");
    proposedCase.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "proposal-verification",
      evidence: ["proposal ledger"]
    };
    const first = registry({ proposed: [record(proposedCase, "proposed")] });
    expect(first.reservedIds).toEqual(["q-reserved"]);
    expect(() => registry({}, first)).toThrow(/reserved lifecycle id q-reserved is missing/);

    const retired = tombstone("q-reserved", first.entries[0].caseContentSha256);
    const retiredRegistry = registry({ retired: [record(retired, "retired")] }, first);
    expect(retiredRegistry.entries[0].state).toBe("retired");
    expect(() => registry({ battery: [record(kase("q-reserved"))] }, retiredRegistry)).toThrow(/cannot be reused/);
  });

  it("requires an activation review when a proposal enters the battery", () => {
    const proposedCase = kase("q-activate", "proposed", "queued");
    proposedCase.truth.lifecycle.review = { queuedOn: "2026-08-29", trigger: "proposal-verification", evidence: ["ledger"] };
    const prior = registry({ proposed: [record(proposedCase, "proposed")] });
    expect(() => registry({ battery: [record(kase("q-activate"))] }, prior)).toThrow(/requires truth.lifecycle.activation/);

    const active = kase("q-activate");
    active.truth.lifecycle.activation = {
      date: "2026-08-29",
      author: "author",
      reviewer: "reviewer",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      evidence: ["source verification", "duplicate and boundary checks"]
    };
    expect(registry({ battery: [record(active)] }, prior).entries[0].state).toBe("active");
  });

  it("requires an explicit independent decision before reactivation", () => {
    const quarantined = kase("q-reactivate", "quarantined", "queued");
    quarantined.truth.lifecycle.review = { queuedOn: "2026-08-29", trigger: "verified-user-failure", evidence: ["ledger"] };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-28",
      author: "author",
      reviewer: "reviewer",
      cause: "Two primary sources conflict on the case boundary.",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      evidence: ["source conflict"]
    };
    const prior = registry({ battery: [record(quarantined)] });
    expect(() => registry({ battery: [record(kase("q-reactivate"))] }, prior)).toThrow(/requires truth.lifecycle.reactivation/);

    const active = kase("q-reactivate", "active", "resolved");
    active.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "verified-user-failure",
      evidence: ["source conflict"],
      startedOn: "2026-08-29",
      resolvedOn: "2026-08-30",
      reviewer: "reviewer",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      resolution: "corrected"
    };
    active.truth.lifecycle.reactivation = {
      date: "2026-08-30",
      author: "author",
      reviewer: "reviewer",
      ledger: ".agents/rounds/2026-08-29-golden-lifecycle.md",
      evidence: ["corrected case verification"]
    };
    expect(registry({ battery: [record(active)] }, prior).entries[0].state).toBe("active");
  });

  it("validates retirement tombstones and their last case digest", () => {
    const active = kase("q-retire");
    const prior = registry({ battery: [record(active)] });
    const retired = tombstone("q-retire", "0".repeat(64));
    expect(tombstoneProblems(retired)).toEqual([]);
    expect(() => registry({ retired: [record(retired, "retired")] }, prior)).toThrow(/does not match the registry/);
  });

  it("fires mass review at 25 queued cases, five percent, or one quarter", () => {
    const policy = { schema: "qa-lifecycle-policy-v1", massReview: { cadenceAnchorOn: "2026-08-29", state: "none" } };
    const active = Array.from({ length: 100 }, (_, index) => kase(`q-case-${index}`));
    for (let index = 0; index < 5; index++) active[index].truth.lifecycle.reviewState = "queued";
    expect(massReviewStatus(active, policy, "2026-08-30").triggers).toMatchObject({ count: false, share: true, quarter: false });

    const twentyFive = Array.from({ length: 1000 }, (_, index) => kase(`q-large-${index}`));
    for (let index = 0; index < 25; index++) twentyFive[index].truth.lifecycle.reviewState = "queued";
    expect(massReviewStatus(twentyFive, policy, "2026-08-30").triggers).toMatchObject({ count: true, share: false, quarter: false });
    expect(lifecyclePolicyProblems([], policy, "2026-11-29").problems.join("\n")).toMatch(/quarter/);
    expect(lifecyclePolicyProblems([], policy, "2026-11-29", { enforceTriggers: false }).problems).toEqual([]);
  });

  it("fails lint when a lifecycle registry or policy is missing", () => {
    const messages = lintLifecycle([kase("q-missing")], undefined, undefined).map((item) => item.message);
    expect(messages).toContain("lifecycle registry is missing");
    expect(messages).toContain("lifecycle policy is missing");
  });

  it("samples the complete pool before it partitions quarantined IDs", () => {
    const pool = Array.from({ length: 10 }, (_, index) => kase(`q-sample-${index}`));
    const baselineIds = stratifiedSample(pool, 4).map((item) => item.id);
    pool.find((item) => item.id === baselineIds[1]).truth.lifecycle.state = "quarantined";
    pool.find((item) => item.id === baselineIds[1]).truth.lifecycle.reviewState = "queued";
    const selected = stratifiedSample(pool, 4);
    expect(selected.map((item) => item.id)).toEqual(baselineIds);
    const partition = partitionLifecycleCases(selected);
    expect(partition.quarantinedIds).toEqual([baselineIds[1]]);
    const tracks = buildRunnerTracks({ selectedCases: selected, rows: [] });
    expect(tracks.t1.firstAttemptRows.denominator).toBe(3);
    expect(tracks.t3.answeredCoverage.denominator).toBe(0);
    expect(formatFiveTrackSummary(tracks)).toContain(`performance set: 3 of 4 active · excluded quarantined IDs: ${baselineIds[1]}`);
  });

  it("lints stale registry digests and the checked-in registry covers every current case", () => {
    const active = kase("q-digest");
    const built = registry({ battery: [record(active)] });
    const policy = {
      schema: "qa-lifecycle-policy-v1",
      massReview: { cadenceAnchorOn: "2026-08-29", state: "none" }
    };
    expect(lintLifecycle([{ ...active, __file: "fixture" }], built, policy, "2026-08-30")).toEqual([]);
    built.entries[0].caseContentSha256 = "0".repeat(64);
    expect(lintLifecycle([{ ...active, __file: "fixture" }], built, policy, "2026-08-30").map((item) => item.message)).toContain(
      "registry caseContentSha256 is stale"
    );

    const current = JSON.parse(readFileSync(path.join(ROOT, "eval/qa/cases.json"), "utf8"));
    const currentRegistry = JSON.parse(readFileSync(path.join(ROOT, "eval/qa/lifecycle-registry.json"), "utf8"));
    expect(current.cases).toHaveLength(500);
    expect(currentRegistry.counts).toMatchObject({ active: 500, proposed: 0, quarantined: 0, retired: 0 });
    expect(currentRegistry.reservedIds).toHaveLength(500);
    expect(contentSha256(current.cases[0])).toBe(currentRegistry.entries.find((entry) => entry.id === current.cases[0].id).caseContentSha256);
  });
});
