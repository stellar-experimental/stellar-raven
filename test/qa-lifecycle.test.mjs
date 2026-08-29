import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  buildLifecycleRegistry,
  contentSha256,
  lifecyclePolicyProblems,
  lifecycleProblems,
  MASS_REVIEW_RULES_NAME,
  MASS_REVIEW_RULES_SHA256,
  massReviewStatus,
  tombstoneProblems
} from "../eval/qa/lifecycle.mjs";
import { loadGitAnchoredLifecycleRegistry } from "../eval/qa/compile-qa.mjs";
import { partitionLifecycleCases, stratifiedSample } from "../eval/qa/lib.mjs";
import { buildRunnerTracks } from "../eval/qa/run-qa.mjs";
import { formatFiveTrackSummary } from "../eval/qa/five-track.mjs";
import { lintLifecycle, loadLifecycleLane } from "../eval/qa/lint-corpus.mjs";

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

function policy(massReview = {}) {
  return {
    schema: "qa-lifecycle-policy-v1",
    massReview: {
      rules: MASS_REVIEW_RULES_NAME,
      cadenceAnchorOn: "2026-08-29",
      state: "none",
      ...massReview
    }
  };
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

  it.each([
    "T1 conditional quality dropped after the last round.",
    "The headline numbers moved against us.",
    "Correct rate fell on the sample.",
    "The correct-rate fell on the sample.",
    "The pass-rate fell on the sample.",
    "We need a better aggregate.",
    "The track moved.",
    "The correctness-rate fell.",
    "We need desired-movement."
  ])("rejects the score cause in quarantine and retirement: %s", (cause) => {
    const quarantined = kase("q-score-cause", "quarantined", "queued");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "verified-user-failure",
      evidence: ["verified failure"]
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-28",
      author: "author",
      reviewer: "reviewer",
      cause,
      ledger: "ledger",
      evidence: ["evidence"]
    };
    expect(lifecycleProblems(quarantined).join("\n")).toMatch(/score-independent/);
    const retired = tombstone("q-retired-score-cause", "a".repeat(64));
    retired.retired.reason = cause;
    expect(tombstoneProblems(retired).join("\n")).toMatch(/score-independent/);
  });

  it.each([
    "The protocol inflation-rate changed.",
    "The exchange-rate source became stale.",
    "The fee-rate assumption is no longer valid."
  ])("accepts a truth cause that uses a non-score rate: %s", (cause) => {
    const quarantined = kase("q-truth-rate", "quarantined", "queued");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "live-drift",
      evidence: ["verified source change"]
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-28",
      author: "author",
      reviewer: "reviewer",
      cause,
      ledger: "ledger",
      evidence: ["verified source change"]
    };
    expect(lifecycleProblems(quarantined)).toEqual([]);
    const retired = tombstone("q-retired-truth-rate", "a".repeat(64));
    retired.retired.reason = cause;
    expect(tombstoneProblems(retired)).toEqual([]);
  });

  it("forbids judge-noise quarantine evidence", () => {
    const quarantined = kase("q-judge-noise", "quarantined", "queued");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "judge-noise",
      evidence: ["judge variance"]
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-09-28",
      author: "author",
      reviewer: "reviewer",
      cause: "The golden wording is ambiguous on the boundary.",
      ledger: "ledger",
      evidence: ["source review"]
    };
    expect(lifecycleProblems(quarantined)).toContain("judge-noise review evidence cannot quarantine a case");
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

  it("requires each quarantine deadline to start on or after its decision date", () => {
    const quarantined = kase("q-backward-deadline", "quarantined", "queued");
    quarantined.truth.lifecycle.review = {
      queuedOn: "2026-08-29",
      trigger: "verified-user-failure",
      evidence: ["verified conflict"]
    };
    quarantined.truth.lifecycle.quarantine = {
      startedOn: "2026-08-29",
      reviewBy: "2026-08-28",
      author: "author",
      reviewer: "reviewer",
      cause: "A primary source is inaccurate.",
      ledger: "ledger",
      evidence: ["verified conflict"],
      renewals: [{
        date: "2026-08-29",
        reviewBy: "2026-08-28",
        author: "author",
        reviewer: "reviewer",
        ledger: "ledger",
        evidence: ["renewal evidence"]
      }]
    };
    const problems = lifecycleProblems(quarantined).join("\n");
    expect(problems).toMatch(/quarantine\.reviewBy must not precede startedOn/);
    expect(problems).toMatch(/renewals\[0\]\.reviewBy must not precede date/);
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

  it("requires every post-genesis ID to enter a committed proposal first", () => {
    const prior = registry({ proposed: [] });
    const active = kase("q-direct-active");
    active.truth.lifecycle.activation = {
      date: "2026-08-29",
      author: "author",
      reviewer: "reviewer",
      ledger: "ledger",
      evidence: ["activation evidence"]
    };
    expect(() => registry({ battery: [record(kase("q-direct-active"))] }, prior)).toThrow(/must first be committed as proposed/);
    expect(() => registry({ battery: [record(active)] }, prior)).toThrow(/must first be committed as proposed/);
    expect(() => registry({ battery: [record(kase("q-direct-quarantine", "quarantined", "queued"))] }, prior))
      .toThrow(/must first be committed as proposed/);
    expect(registry({ proposed: [record(kase("q-new-proposal", "proposed", "none"), "proposed")] }, prior).reservedIds)
      .toContain("q-new-proposal");
  });

  it("loads the prior registry from Git history and refuses a false genesis", () => {
    const root = mkdtempSync(path.join(tmpdir(), "qa-lifecycle-git-anchor-"));
    try {
      const registryPath = path.join(root, "eval/qa/lifecycle-registry.json");
      mkdirSync(path.dirname(registryPath), { recursive: true });
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync("git", ["config", "user.email", "qa@example.test"], { cwd: root });
      execFileSync("git", ["config", "user.name", "QA Fixture"], { cwd: root });
      const committed = registry({ proposed: [] });
      writeFileSync(registryPath, `${JSON.stringify(committed)}\n`);
      execFileSync("git", ["add", "."], { cwd: root });
      execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-qm", "registry genesis"], { cwd: root });
      writeFileSync(registryPath, "{}\n");
      const anchored = loadGitAnchoredLifecycleRegistry({ root, registryPath, baseRef: "HEAD" });
      expect(anchored.genesis).toBe(false);
      expect(anchored.registry).toEqual(committed);
      vi.stubEnv("CI", "");
      vi.stubEnv("QA_LIFECYCLE_BASE_REF", "missing-ref");
      try {
        expect(loadGitAnchoredLifecycleRegistry({ root, registryPath }).registry).toEqual(committed);
      } finally {
        vi.unstubAllEnvs();
      }
      expect(() => buildLifecycleRegistry({
        root,
        batteryRecords: [{ file: path.join(root, "eval/qa/corpus/battery/protocol-core/q-bypass.json"), value: kase("q-bypass") }],
        proposedRecords: [],
        tombstoneRecords: [],
        previousRegistry: anchored.registry,
        genesis: anchored.genesis
      })).toThrow(/must first be committed as proposed/);
      writeFileSync(registryPath, "{not-json}\n");
      execFileSync("git", ["add", "."], { cwd: root });
      execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-qm", "malformed registry"], { cwd: root });
      expect(() => loadGitAnchoredLifecycleRegistry({ root, registryPath, baseRef: "HEAD" }))
        .toThrow(/committed lifecycle registry.*invalid JSON/);
      expect(() => loadGitAnchoredLifecycleRegistry({ root, registryPath, baseRef: "missing-ref" }))
        .toThrow(/refusing genesis/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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
    const lifecyclePolicy = policy();
    const active = Array.from({ length: 100 }, (_, index) => kase(`q-case-${index}`));
    for (let index = 0; index < 5; index++) active[index].truth.lifecycle.reviewState = "queued";
    expect(massReviewStatus(active, lifecyclePolicy, "2026-08-30").triggers).toMatchObject({ count: false, share: true, quarter: false });

    const twentyFive = Array.from({ length: 1000 }, (_, index) => kase(`q-large-${index}`));
    for (let index = 0; index < 25; index++) twentyFive[index].truth.lifecycle.reviewState = "queued";
    expect(massReviewStatus(twentyFive, lifecyclePolicy, "2026-08-30").triggers).toMatchObject({ count: true, share: false, quarter: false });
    expect(lifecyclePolicyProblems([], lifecyclePolicy, "2026-11-29").problems.join("\n")).toMatch(/quarter/);
    expect(lifecyclePolicyProblems([], lifecyclePolicy, "2026-11-29", { enforceTriggers: false }).problems).toEqual([]);
  });

  it("binds an in-review mass review to the named canonical rules digest", () => {
    const activeIdsSha256 = contentSha256([]);
    const valid = policy({
      state: "in-review",
      startedOn: "2026-08-29",
      ledger: "ledger",
      frozenActiveIdsSha256: activeIdsSha256,
      rulesSha256: MASS_REVIEW_RULES_SHA256
    });
    expect(lifecyclePolicyProblems([], valid, "2026-08-30").problems).toEqual([]);
    valid.massReview.rulesSha256 = "a".repeat(64);
    expect(lifecyclePolicyProblems([], valid, "2026-08-30").problems).toContain(
      `massReview.rulesSha256 must match ${MASS_REVIEW_RULES_NAME}`
    );
  });

  it("fails lint when a lifecycle registry or policy is missing", () => {
    const messages = lintLifecycle([kase("q-missing")], undefined, undefined).map((item) => item.message);
    expect(messages).toContain("lifecycle registry is missing");
    expect(messages).toContain("lifecycle policy is missing");
  });

  it("lints proposal and retirement lanes plus complete registry reservations", () => {
    const proposed = kase("q-lint-proposed", "proposed", "none");
    const retired = tombstone("q-lint-retired", "b".repeat(64));
    const complete = registry({
      proposed: [record(proposed, "proposed")],
      retired: [record(retired, "retired")]
    });
    expect(lintLifecycle([], complete, policy(), "2026-08-30", {
      proposedCases: [{ ...proposed, __file: record(proposed, "proposed").file }],
      tombstones: [{ ...retired, __file: record(retired, "retired").file }]
    })).toEqual([]);

    const missingFiles = lintLifecycle([], complete, policy(), "2026-08-30").map((item) => item.message);
    expect(missingFiles).toContain("reserved id has no battery, proposal, or retired file");

    const emptyRegistry = registry({});
    const unreserved = lintLifecycle([], emptyRegistry, policy(), "2026-08-30", {
      proposedCases: [{ ...proposed, __file: record(proposed, "proposed").file }],
      tombstones: [{ ...retired, __file: record(retired, "retired").file }]
    }).map((item) => item.message);
    expect(unreserved).toContain("proposed id is not permanently reserved");
    expect(unreserved).toContain("retired id is not permanently reserved");

    const invalidProposal = kase("q-wrong-proposal-lane", "active", "none");
    const invalidRetired = { ...retired, id: "q-wrong-retired-lane", lifecycle: { state: "active", reviewState: "resolved" } };
    const invalid = lintLifecycle([], emptyRegistry, policy(), "2026-08-30", {
      proposedCases: [invalidProposal],
      tombstones: [invalidRetired]
    }).map((item) => item.message);
    expect(invalid).toContain("truth.lifecycle.state active is not allowed in this lane");
    expect(invalid).toContain("lifecycle.state must be retired");
  });

  it("loads and rejects invalid proposal and retirement lane files", () => {
    const root = mkdtempSync(path.join(tmpdir(), "qa-lifecycle-lint-lanes-"));
    try {
      const compiled = JSON.parse(readFileSync(path.join(ROOT, "eval/qa/cases.json"), "utf8")).cases[0];
      const proposedDir = path.join(root, "proposed", compiled.tags.category);
      const retiredDir = path.join(root, "retired");
      mkdirSync(proposedDir, { recursive: true });
      mkdirSync(retiredDir, { recursive: true });
      writeFileSync(path.join(proposedDir, `${compiled.id}.json`), JSON.stringify(compiled));
      writeFileSync(path.join(retiredDir, "q-invalid-tombstone.json"), JSON.stringify({
        id: "q-invalid-tombstone",
        lifecycle: { state: "active", reviewState: "resolved" }
      }));
      expect(loadLifecycleLane(path.join(root, "proposed"), "proposed").findings[0].message)
        .toMatch(/state active is not allowed in this lane/);
      expect(loadLifecycleLane(retiredDir, "retired").findings[0].message)
        .toMatch(/lifecycle.state must be retired/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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
    expect(formatFiveTrackSummary(tracks)).toContain(`performance set: active 3 of 4 selected · excluded quarantined IDs: ${baselineIds[1]}`);
  });

  it("lints stale registry digests and the checked-in registry covers every current case", () => {
    const active = kase("q-digest");
    const built = registry({ battery: [record(active)] });
    const lifecyclePolicy = policy();
    expect(lintLifecycle([{ ...active, __file: "fixture" }], built, lifecyclePolicy, "2026-08-30")).toEqual([]);
    built.entries[0].caseContentSha256 = "0".repeat(64);
    expect(lintLifecycle([{ ...active, __file: "fixture" }], built, lifecyclePolicy, "2026-08-30").map((item) => item.message)).toContain(
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
