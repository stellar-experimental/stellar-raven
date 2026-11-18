/**
 * Re-judge model identity: the default judge is the one the source recorded, the Playground tuple
 * prefers the resolved ID, and an explicit alias pins to the exact ID of its first response.
 */
import { describe, expect, it } from "vitest";
import { parseArgs, recordedJudgeModel, rejudgeRows, tupleGuard } from "../eval/qa/re-judge.mjs";
import { JUDGE_MODEL } from "../eval/qa/judge.mjs";
import { createModelPin } from "../eval/qa/model-identity.mjs";
import { PLAYGROUND_ARTIFACT_CONTRACT } from "../eval/playground/artifact-contract.mjs";

describe("re-judge default judge", () => {
  it("leaves the judge undefined unless --judge-model is given, so main can default to the source", () => {
    expect(parseArgs(["source.json", "--ids", "one", "--dry-run"]).judgeModel).toBeUndefined();
    expect(parseArgs(["source.json", "--ids", "one", "--dry-run", "--judge-model", "sonnet"]).judgeModel).toBe("sonnet");
  });

  it("reads the exact judge a collection artifact recorded", () => {
    expect(recordedJudgeModel({ meta: { judgeModel: "claude-sonnet-5" } })).toBe("claude-sonnet-5");
    expect(recordedJudgeModel({ meta: { judgeModel: null } })).toBeNull();
    expect(recordedJudgeModel({ meta: {} })).toBeNull();
  });

  it("makes the tuple identical by construction when the default is the recorded judge", () => {
    const source = { meta: { judgeModel: "claude-sonnet-5", judgeRubric: "v2.11", packVersion: "p9" } };
    const guard = tupleGuard(source, recordedJudgeModel(source) ?? JUDGE_MODEL);
    expect(guard.source.model).toBe("claude-sonnet-5");
    expect(guard.current.model).toBe("claude-sonnet-5");
  });

  it("reads a Playground artifact's resolved ID in preference to the requested alias", () => {
    const meta = {
      artifactContract: PLAYGROUND_ARTIFACT_CONTRACT,
      judge: { model: "sonnet", resolvedModel: "claude-sonnet-5-5", rubric: "v2.11", packVersion: "p9" }
    };
    expect(recordedJudgeModel({ meta })).toBe("claude-sonnet-5-5");
    expect(tupleGuard({ meta }, "claude-sonnet-5-5").source.model).toBe("claude-sonnet-5-5");
  });

  it("treats a recorded Playground judge that a graded verdict contradicts as unknown, so the guard refuses", () => {
    const meta = {
      artifactContract: PLAYGROUND_ARTIFACT_CONTRACT,
      judge: { model: "sonnet", resolvedModel: "claude-sonnet-5-6", rubric: "v2.11", packVersion: "p9" }
    };
    const results = { meta, rows: [{ id: "a", verdict: { score: "correct", resolvedModel: "claude-sonnet-5-5" } }] };
    expect(recordedJudgeModel(results)).toBeNull();
    expect(tupleGuard(results, "claude-sonnet-5-6").matches).toBe(false);
    expect(tupleGuard(results, "claude-sonnet-5-5").matches).toBe(false);
    // Without the contradiction the recorded ID is the identity.
    const agreeing = { meta, rows: [{ id: "a", verdict: { score: "correct", resolvedModel: "claude-sonnet-5-6" } }] };
    expect(recordedJudgeModel(agreeing)).toBe("claude-sonnet-5-6");
    expect(tupleGuard(agreeing, "claude-sonnet-5-6").matches).toBe(true);
  });

  it("falls back to judge.model for a stored v3 artifact with no resolved ID", () => {
    const meta = {
      artifactContract: PLAYGROUND_ARTIFACT_CONTRACT,
      judge: { model: "claude-sonnet-5", rubric: "v2.11", packVersion: "p9" }
    };
    expect(recordedJudgeModel({ meta })).toBe("claude-sonnet-5");
  });
});

describe("same-judge guard needs known exact IDs", () => {
  const source = (judgeModel) => ({ meta: { judgeModel, judgeRubric: "v2.11", packVersion: "p9" } });

  it("does not match two nulls, two aliases, or an alias against its own resolution", () => {
    expect(tupleGuard(source(null), null).matches).toBe(false);
    expect(tupleGuard(source("sonnet"), "sonnet").matches).toBe(false);
    expect(tupleGuard(source("sonnet"), "claude-sonnet-5-5").matches).toBe(false);
    expect(tupleGuard(source("claude-sonnet-5-5"), "sonnet").matches).toBe(false);
  });

  it("matches the same exact ID on both sides, and refuses a different one", () => {
    expect(tupleGuard(source("claude-sonnet-5-5"), "claude-sonnet-5-5").matches).toBe(true);
    expect(tupleGuard(source("claude-sonnet-5"), "claude-sonnet-5-5").matches).toBe(false);
  });

  it("reads a recorded alias, legacy or Playground, as unknown", () => {
    expect(recordedJudgeModel({ meta: { judgeModel: "sonnet" } })).toBeNull();
    const playground = { meta: { artifactContract: PLAYGROUND_ARTIFACT_CONTRACT, judge: { model: "sonnet", rubric: "v2.11", packVersion: "p9" } } };
    expect(recordedJudgeModel(playground)).toBeNull();
    expect(tupleGuard(playground, "sonnet").matches).toBe(false);
  });

  it("gives an alias pin no identity before the first response, so the first checkpoint never records the alias", () => {
    expect(createModelPin("sonnet").identity()).toBeNull();
  });
});

describe("rejudgeRows pin", () => {
  const kase = {
    id: "one",
    question: "Question?",
    golden: { answer: "Answer.", keyFacts: [], avoid: [], notes: "" },
    tags: { freshness: "stable" }
  };
  const selectedRows = ["one", "two"].map((id) => ({
    id,
    answer: "Saved answer.",
    transcript: [],
    verdict: { score: "partial" }
  }));

  it("passes an explicit alias until a call reports its ID, then that exact ID, and records it", async () => {
    const models = [];
    const runState = {};
    await rejudgeRows({
      selectedRows,
      caseById: new Map([["one", kase], ["two", { ...kase, id: "two" }]]),
      judgeModel: "sonnet",
      judge: async (_input, options) => {
        models.push(options.model);
        return { score: "partial", costUsd: 0.1, resolvedModel: "claude-sonnet-5-5" };
      },
      checkpoint: () => {},
      log: () => {},
      runState
    });
    expect(models).toEqual(["sonnet", "claude-sonnet-5-5"]);
    expect(runState.judgePin.identity()).toBe("claude-sonnet-5-5");
  });
});
