/**
 * Re-judge model identity: the default judge is the one the source recorded, the Playground tuple
 * prefers the resolved ID, and an explicit alias pins to the exact ID of its first response.
 */
import { describe, expect, it } from "vitest";
import { parseArgs, recordedJudgeModel, rejudgeRows, tupleGuard } from "../eval/qa/re-judge.mjs";
import { JUDGE_MODEL } from "../eval/qa/judge.mjs";
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

  it("falls back to judge.model for a stored v3 artifact with no resolved ID", () => {
    const meta = {
      artifactContract: PLAYGROUND_ARTIFACT_CONTRACT,
      judge: { model: "claude-sonnet-5", rubric: "v2.11", packVersion: "p9" }
    };
    expect(recordedJudgeModel({ meta })).toBe("claude-sonnet-5");
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
