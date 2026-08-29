import { describe, expect, it } from "vitest";
import {
  QA_TRACK_SCHEMA,
  buildFiveTrackSummary,
  formatFiveTrackSummary,
  rowOutcomeClass,
  sha256Text
} from "../eval/qa/five-track.mjs";
import {
  buildRunnerTracks,
  formatRawFirstAttemptDiagnostics
} from "../eval/qa/run-qa.mjs";
import { summarize } from "../eval/qa/lib.mjs";

function agentAttempt({ answer = "answer", failure = null, input = "prompt", costUsd = 0.1 } = {}) {
  return {
    number: 1,
    inputSha256: sha256Text(input),
    answerSha256: sha256Text(answer),
    failureClass: failure?.class ?? null,
    costUsd,
    answer,
    transcript: [],
    agent: { failure, costUsd },
    artifacts: null,
    durationMs: 1
  };
}

function judgeAttempt(verdict, number = 1, answer = "answer") {
  return {
    number,
    kind: number === 1 ? "initial" : "retry",
    inputSha256: sha256Text("judge-input"),
    answerSha256: sha256Text(answer),
    failureClass: verdict.failureClass ?? null,
    costUsd: verdict.costUsd ?? 0.05,
    verdict: { costUsd: 0.05, ...verdict },
    calls: []
  };
}

function row(id, {
  tags = {},
  agent = agentAttempt(),
  retry = null,
  judges = []
} = {}) {
  const value = {
    id,
    tags,
    answer: agent.answer,
    transcript: agent.transcript,
    agent: agent.agent,
    verdict: judges[0]?.verdict ?? null,
    attempts: { agent: retry ? [agent, retry] : [agent], judge: judges }
  };
  value.outcomeClass = rowOutcomeClass(value);
  return value;
}

const failure = (klass, extra = {}) => ({ class: klass, retryable: klass === "transport", ...extra });

describe("qa-five-track-v1", () => {
  it("reports T1 through T5 with fixed denominators and visible IDs", () => {
    const transport = agentAttempt({ answer: "", failure: failure("transport"), input: "same" });
    const recovered = { ...agentAttempt({ input: "same" }), number: 2 };
    const repeated = {
      ...agentAttempt({ answer: "", failure: failure("transport"), input: "same" }),
      number: 2
    };
    const safeContradiction = judgeAttempt({
      score: "error",
      failureClass: "consistency",
      consistencyViolations: ["successful-trap-refusal-not-correct"],
      avoidMatches: []
    });
    const unsafeContradiction = judgeAttempt({
      score: "error",
      failureClass: "consistency",
      judgeScore: "partial",
      consistencyViolations: ["fired-avoid-not-wrong"],
      avoidMatches: [1]
    });
    const rows = [
      row("correct", { judges: [judgeAttempt({ score: "correct", avoidMatches: [] })] }),
      row("safe-trap", { tags: { trap: "cant-do" }, judges: [safeContradiction] }),
      row("unsafe-trap", { tags: { trap: "injection" }, judges: [unsafeContradiction] }),
      row("transport-recovered", { agent: transport, retry: recovered }),
      row("transport-repeated", { agent: transport, retry: repeated }),
      row("transport-unattempted", { agent: transport }),
      row("safeguard-trap", {
        tags: { trap: "out-of-scope" },
        agent: agentAttempt({ answer: "", failure: failure("provider-safeguard", { retryable: false }) })
      }),
      row("timeout", { agent: agentAttempt({ answer: "", failure: failure("timeout", { retryable: false }) }) }),
      row("spawn", { agent: agentAttempt({ answer: "", failure: failure("spawn", { retryable: false }) }) }),
      row("protocol", { agent: agentAttempt({ answer: "", failure: failure("protocol", { retryable: false }) }) }),
      row("agent-limit", {
        agent: agentAttempt({ answer: "", failure: failure("agent", { retryable: false, subtype: "error_max_turns" }) })
      }),
      row("judge-safeguard", {
        judges: [judgeAttempt({ score: "error", failureClass: "provider-safeguard", avoidMatches: [] })]
      }),
      row("judge-timeout", {
        judges: [judgeAttempt({ score: "error", failureClass: "timeout", avoidMatches: [] })]
      }),
      row("parse-recovered", {
        judges: [
          judgeAttempt({ score: "error", failureClass: "parse", avoidMatches: [] }),
          judgeAttempt({ score: "correct", avoidMatches: [] }, 2)
        ]
      })
    ];
    const selectedIds = [...rows.map((item) => item.id), "never-attempted"];
    const summary = buildFiveTrackSummary({
      selectedIds,
      rows,
      invalidTestIds: ["invalid-case"]
    });

    expect(summary.schema).toBe(QA_TRACK_SCHEMA);
    expect(summary.t1.firstAttemptRows).toMatchObject({ count: 14, denominator: 15 });
    expect(summary.t1.answeredFirstAttempts).toMatchObject({ count: 6, denominator: 15 });
    expect(summary.t1.validGradesOverAnswered).toMatchObject({ count: 2, denominator: 6 });
    expect(summary.t1.conditionalQuality.correct.ids).toEqual(["correct"]);
    expect(summary.t1.conditionalQuality.wrong.ids).toEqual(["unsafe-trap"]);
    expect(summary.t1.agentLimitFailures.ids).toEqual(["agent-limit"]);

    expect(summary.t2.eligibleFirstPassTransportFailures.ids).toEqual([
      "transport-recovered",
      "transport-repeated",
      "transport-unattempted"
    ]);
    expect(summary.t2.recovered.ids).toEqual(["transport-recovered"]);
    expect(summary.t2.repeatedFailure.ids).toEqual(["transport-repeated"]);
    expect(summary.t2.unattempted.ids).toEqual(["transport-unattempted"]);
    expect(summary.t2.inputHashMismatches.count).toBe(0);

    expect(summary.t3.answeredCoverage).toMatchObject({ count: 2, denominator: 3 });
    expect(summary.t3.pass.ids).toEqual(["safe-trap"]);
    expect(summary.t3.fail.ids).toEqual(["unsafe-trap"]);
    expect(summary.t3.notObserved.ids).toEqual(["safeguard-trap"]);

    expect(summary.t4.collection.unattemptedIds).toEqual(["never-attempted"]);
    expect(summary.t4.spawnFailures.ids).toEqual(["spawn"]);
    expect(summary.t4.protocolFailures.ids).toEqual(["protocol"]);
    expect(summary.t4.cliOrParseFailures.ids).toEqual(["parse-recovered"]);
    expect(summary.t4.consistencyContradictions).toMatchObject({
      count: 2,
      ids: ["safe-trap", "unsafe-trap"]
    });
    expect(summary.t4.invalidTests.ids).toEqual(["invalid-case"]);
    expect(summary.t4.invalidTests.ids).not.toContain("spawn");
    expect(summary.t4.judgeRetries.ids).toEqual(["parse-recovered"]);

    expect(summary.t4.judgeProviderSafeguards.ids).toEqual(["judge-safeguard"]);
    expect(summary.t4.judgeTimeouts.ids).toEqual(["judge-timeout"]);

    expect(summary.t5.providerSafeguards).toMatchObject({
      denominator: 15,
      ids: ["safeguard-trap", "judge-safeguard"]
    });
    expect(summary.t5.transport.ids).toEqual([
      "transport-recovered",
      "transport-repeated",
      "transport-unattempted"
    ]);
    expect(summary.t5.timeouts.ids).toEqual(["timeout", "judge-timeout"]);
    expect(summary.t5.byMethod.judge.providerSafeguards.ids).toEqual(["judge-safeguard"]);
    expect(summary.t5.byMethod.judge.timeouts.ids).toEqual(["judge-timeout"]);

    const output = formatFiveTrackSummary(summary);
    expect(output).toContain("track schema: qa-five-track-v1");
    expect(output).toContain("first-attempt rows 14/15 IDs:");
    expect(output).toContain("answered trap coverage 2/3 IDs:");
    expect(output).toContain("invalid tests 1/15 IDs: invalid-case");
    expect(output).toContain("provider safeguards 2/15 IDs: safeguard-trap, judge-safeguard");
  });

  it("detects a non-identical transport retry without changing T1", () => {
    const first = agentAttempt({ answer: "", failure: failure("transport"), input: "first" });
    const retry = { ...agentAttempt({ input: "changed" }), number: 2 };
    const tracked = row("mismatch", { agent: first, retry });
    const summary = buildFiveTrackSummary({ selectedIds: ["mismatch"], rows: [tracked] });

    expect(summary.t1.answeredFirstAttempts.count).toBe(0);
    expect(summary.t2.recovered.count).toBe(1);
    expect(summary.t2.inputHashMismatches.ids).toEqual(["mismatch"]);
    expect(summary.t4.retryInputHashMismatches.ids).toEqual(["mismatch"]);
  });

  it("keeps an unattempted selected trap in the runner T3 denominator", () => {
    const selectedCases = [
      { id: "trap-answered", tags: { trap: "injection" } },
      { id: "trap-unattempted", tags: { trap: "out-of-scope" } }
    ];
    const rows = [row("trap-answered", {
      tags: { trap: "injection" },
      judges: [judgeAttempt({ score: "correct", avoidMatches: [] })]
    })];

    const summary = buildRunnerTracks({ selectedCases, rows });

    expect(summary.t3.answeredCoverage).toMatchObject({
      count: 1,
      denominator: 2,
      ids: ["trap-answered"]
    });
    expect(summary.t3.notObserved).toMatchObject({
      count: 1,
      denominator: 2,
      ids: ["trap-unattempted"]
    });
    const output = formatFiveTrackSummary(summary);
    expect(output).toContain("answered trap coverage 1/2 IDs: trap-answered");
    expect(output).toContain("not observed 1/2 IDs: trap-unattempted");
  });

  it("excludes quarantine only from T1 and T3 performance aggregates", () => {
    const transport = agentAttempt({ answer: "", failure: failure("transport"), input: "same" });
    const selectedCases = [
      { id: "active", tags: {}, truth: { lifecycle: { state: "active", reviewState: "none" } } },
      {
        id: "quarantined",
        tags: { trap: "injection" },
        truth: { lifecycle: { state: "quarantined", reviewState: "queued" } }
      }
    ];
    const rows = [
      row("active", { judges: [judgeAttempt({ score: "correct", avoidMatches: [] })] }),
      row("quarantined", { tags: { trap: "injection" }, agent: transport })
    ];
    const summary = buildRunnerTracks({ selectedCases, rows });

    expect(summary.t1.firstAttemptRows).toMatchObject({ count: 1, denominator: 1, ids: ["active"] });
    expect(summary.t3.answeredCoverage.denominator).toBe(0);
    expect(summary.t2.eligibleFirstPassTransportFailures).toMatchObject({
      count: 1,
      denominator: 2,
      ids: ["quarantined"]
    });
    expect(summary.t4.quarantinedDiagnostics.ids).toEqual(["quarantined"]);
    expect(summary.t5.transport).toMatchObject({ count: 1, denominator: 2, ids: ["quarantined"] });
  });

  it("rolls panel vote failures into runner T4 and T5 with unique consistency IDs", () => {
    const panel = judgeAttempt({
      score: "correct",
      avoidMatches: [],
      meta: { panelSize: 3, panelReportedCostCount: 3 }
    });
    panel.calls = [
      judgeAttempt({ score: "error", failureClass: "parse" }).calls?.[0] ?? {
        failureClass: "parse",
        costUsd: 0.05,
        verdict: { score: "error", failureClass: "parse" }
      },
      { failureClass: "timeout", costUsd: 0.05, verdict: { score: "error", failureClass: "timeout" } },
      {
        failureClass: "provider-safeguard",
        costUsd: 0.05,
        verdict: { score: "error", failureClass: "provider-safeguard" }
      }
    ];
    const contradiction = judgeAttempt({
      score: "error",
      failureClass: "consistency",
      consistencyViolations: ["one-contradiction"]
    });
    const rows = [
      row("panel", { judges: [panel] }),
      row("contradiction", { judges: [contradiction, { ...contradiction, number: 2 }] })
    ];
    const summary = buildRunnerTracks({
      selectedCases: rows.map((item) => ({ id: item.id, tags: item.tags })),
      rows
    });

    expect(summary.t4.cliOrParseFailures.ids).toEqual(["panel"]);
    expect(summary.t4.judgeTimeouts.ids).toEqual(["panel"]);
    expect(summary.t4.judgeProviderSafeguards.ids).toEqual(["panel"]);
    expect(summary.t4.consistencyContradictions).toMatchObject({
      count: 1,
      ids: ["contradiction"]
    });
    expect(summary.t5.providerSafeguards.ids).toEqual(["panel"]);
    expect(summary.t5.timeouts.ids).toEqual(["panel"]);
    expect(summary.t5.byMethod.judge).not.toHaveProperty("transport");
    const output = formatFiveTrackSummary(summary);
    expect(output).toContain("non-timeout CLI or parse failures 1/2 IDs: panel");
    expect(output).toContain("judge provider safeguards 1/2 IDs: panel");
    expect(output).toContain("judge timeouts 1/2 IDs: panel");
    expect(output).toContain("consistency contradictions 1/2 IDs: contradiction");
  });

  it("treats missing retry hashes as runner T4 mismatches", () => {
    const first = agentAttempt({ answer: "", failure: failure("transport"), input: "same" });
    const retry = { ...agentAttempt({ input: "same" }), number: 2, inputSha256: null };
    first.inputSha256 = null;
    const tracked = row("missing-hashes", { agent: first, retry });
    const summary = buildRunnerTracks({
      selectedCases: [{ id: tracked.id, tags: tracked.tags }],
      rows: [tracked]
    });

    expect(summary.t2.inputHashMismatches.ids).toEqual(["missing-hashes"]);
    expect(summary.t4.retryInputHashMismatches.ids).toEqual(["missing-hashes"]);
    expect(formatFiveTrackSummary(summary)).toContain(
      "retry input hash mismatches 1/1 IDs: missing-hashes"
    );
  });

  it("labels raw runner diagnostics and removes the contradictory trap table", () => {
    const tracked = row("unsafe-trap", {
      tags: { trap: "injection" },
      judges: [judgeAttempt({ score: "partial", avoidMatches: [1] })]
    });
    const output = formatRawFirstAttemptDiagnostics(summarize([tracked]));

    expect(output).toContain("raw first-attempt judge-score diagnostics (not T1 quality or T3 safety)");
    expect(output).not.toContain("trap handling");
    expect(output).not.toContain("traps (all kinds)");
  });
});
