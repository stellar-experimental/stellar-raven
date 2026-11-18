/** Resolved-model capture and the pin rule (eval/qa/model-identity.mjs). Hand-made fixtures only. */
import { describe, expect, it } from "vitest";
import { parseAgentResult } from "../eval/qa/agent-result.mjs";
import {
  createModelPin,
  isAliasRequest,
  resolvedModelFromStream,
  resolvedModelFromUsage
} from "../eval/qa/model-identity.mjs";

// Synthetic stream: only the fields the parser reads. Under `--model sonnet` the lead's smoke saw
// `claude-sonnet-5-5` in both `init.model` and the `modelUsage` key.
const initLine = (model) =>
  JSON.stringify({ type: "system", subtype: "init", session_id: "synthetic", model, mcp_servers: [{ name: "raven", status: "connected" }] });
const resultLine = (modelUsage) =>
  JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "ok", total_cost_usd: 0.01, num_turns: 1, usage: {}, modelUsage });
const parse = (lines, requestedModel) =>
  parseAgentResult({ stdout: lines.join("\n"), stderr: "", status: 0 }, { requestedModel, requiredMcpServerName: "raven" });

describe("alias detection", () => {
  it("treats a family name as an alias and anything else as exact", () => {
    expect(isAliasRequest("sonnet")).toBe(true);
    expect(isAliasRequest("sonnet[1m]")).toBe(true);
    expect(isAliasRequest("claude-sonnet-5-5")).toBe(false);
  });
});

describe("judge capture from modelUsage", () => {
  it("takes the single key of the aliased family", () => {
    expect(resolvedModelFromUsage("sonnet", { "claude-sonnet-5-5": { costUSD: 0.1 } })).toBe("claude-sonnet-5-5");
  });

  it("ignores an auxiliary Haiku key", () => {
    const usage = { "claude-sonnet-5-5": {}, "claude-haiku-5-5": {} };
    expect(resolvedModelFromUsage("sonnet", usage)).toBe("claude-sonnet-5-5");
  });

  it("returns unknown for two keys of the same family", () => {
    expect(resolvedModelFromUsage("sonnet", { "claude-sonnet-5-5": {}, "claude-sonnet-5": {} })).toBeNull();
  });

  it("returns unknown for no key or a missing envelope field", () => {
    expect(resolvedModelFromUsage("sonnet", { "claude-opus-5-5": {} })).toBeNull();
    expect(resolvedModelFromUsage("sonnet", undefined)).toBeNull();
    expect(resolvedModelFromUsage("sonnet", [])).toBeNull();
  });

  it("requires the key to equal an exact request, so a differing key is unknown", () => {
    expect(resolvedModelFromUsage("claude-sonnet-5", { "claude-sonnet-5": {} })).toBe("claude-sonnet-5");
    expect(resolvedModelFromUsage("claude-sonnet-5", { "claude-sonnet-5-5": {} })).toBeNull();
  });
});

describe("conflicting same-family usage keys", () => {
  it("is unknown for an exact request whose envelope also names a competing same-family key", () => {
    const usage = { "claude-sonnet-5-5": {}, "claude-sonnet-5-6": {} };
    expect(resolvedModelFromUsage("claude-sonnet-5-5", usage)).toBeNull();
  });

  it("stays unknown after the run pins an exact ID, where the alias call was already unknown", () => {
    const usage = { "claude-sonnet-5-5": {}, "claude-sonnet-5-6": {} };
    expect(resolvedModelFromUsage("sonnet", usage)).toBeNull();
    const pin = createModelPin("sonnet");
    pin.observe("claude-sonnet-5-5");
    expect(resolvedModelFromUsage(pin.argument(), usage)).toBeNull();
  });

  it("still ignores keys of other families after pinning", () => {
    expect(resolvedModelFromUsage("claude-sonnet-5-5", { "claude-sonnet-5-5": {}, "claude-haiku-5-5": {} })).toBe(
      "claude-sonnet-5-5"
    );
  });
});

describe("contradictory stream capture", () => {
  it("is unknown when init and usage disagree, and never falls back to the request", () => {
    const run = parse(
      [initLine("claude-sonnet-5-5"), resultLine({ "claude-sonnet-5-6": {} })],
      "claude-sonnet-5-5"
    );
    expect(run.resolvedModel).toBeNull();
  });

  it("is unknown for an exact request when init is absent and the only usage key is a different model", () => {
    const run = parse([initLine(undefined), resultLine({ "claude-sonnet-5-6": {} })], "claude-sonnet-5-5");
    expect(run.resolvedModel).toBeNull();
  });

  it("accepts init when usage agrees or names only another family", () => {
    const run = parse(
      [initLine("claude-sonnet-5-5"), resultLine({ "claude-sonnet-5-5": {}, "claude-haiku-5-5": {} })],
      "sonnet"
    );
    expect(run.resolvedModel).toBe("claude-sonnet-5-5");
  });
});

describe("answering capture from the stream", () => {
  it("reads init.model under an alias", () => {
    const run = parse([initLine("claude-sonnet-5-5"), resultLine({ "claude-sonnet-5-5": {} })], "sonnet");
    expect(run.resolvedModel).toBe("claude-sonnet-5-5");
  });

  it("falls through to modelUsage when init.model is not a claude- ID", () => {
    const run = parse([initLine("sonnet"), resultLine({ "claude-sonnet-5-5": {}, "claude-haiku-5-5": {} })], "sonnet");
    expect(run.resolvedModel).toBe("claude-sonnet-5-5");
  });

  it("is null when neither source names a model", () => {
    const run = parse([initLine(undefined), resultLine({})], "sonnet");
    expect(run.resolvedModel).toBeNull();
  });

  it("keeps the schema string: an optional field no reader requires is not a shape move", () => {
    expect(parse([initLine("claude-sonnet-5-5"), resultLine({})], "sonnet").schema).toBe("qa-agent-result-v4");
  });
});

describe("pin after the first response", () => {
  it("passes the alias until a call reports its ID, then the exact ID", () => {
    const pin = createModelPin("sonnet");
    expect(pin.argument()).toBe("sonnet");
    expect(pin.identity()).toBeNull();
    pin.observe("claude-sonnet-5-5");
    expect(pin.argument()).toBe("claude-sonnet-5-5");
    expect(pin.identity()).toBe("claude-sonnet-5-5");
  });

  it("keeps the first ID and records a later different one", () => {
    const pin = createModelPin("sonnet");
    pin.observe("claude-sonnet-5-5");
    pin.observe("claude-sonnet-5-6");
    expect(pin.resolved).toBe("claude-sonnet-5-5");
    expect(pin.ids).toEqual(["claude-sonnet-5-5", "claude-sonnet-5-6"]);
  });

  it("treats an exact request as its own identity before any response", () => {
    expect(createModelPin("claude-sonnet-5").identity()).toBe("claude-sonnet-5");
  });

  it("ignores a null or empty observation", () => {
    const pin = createModelPin("sonnet");
    pin.observe(null);
    pin.observe("");
    expect(pin.argument()).toBe("sonnet");
  });

  it("resumes from a recorded ID", () => {
    const pin = createModelPin("claude-sonnet-5", { resolved: "claude-sonnet-5" });
    expect(pin.argument()).toBe("claude-sonnet-5");
  });
});

describe("stream fixtures keep recording", () => {
  it("resolves the recorded stream fixtures' init.model, which were run with an exact ID", () => {
    expect(resolvedModelFromStream({ requested: "claude-sonnet-5", initModel: "claude-sonnet-5", modelUsage: undefined })).toBe(
      "claude-sonnet-5"
    );
  });
});

describe("discovery agent model comparability", () => {
  const ran = (model) => ({ agent: { model, error: null } });

  it("is empty when every row ran on one exact model, which labels the run", async () => {
    const { discoveryModelComparabilityReasons, measuredDiscoveryModel } = await import("../eval/discovery/run-agent-discovery.mjs");
    const rows = [ran("claude-sonnet-5-5"), ran("claude-sonnet-5-5")];
    expect(discoveryModelComparabilityReasons(rows)).toEqual([]);
    expect(measuredDiscoveryModel(rows)).toBe("claude-sonnet-5-5");
  });

  it("gives a reason for two models, an unresolved row (either request type), or a conflicting pin; failed rows say nothing", async () => {
    const { discoveryModelComparabilityReasons, measuredDiscoveryModel } = await import("../eval/discovery/run-agent-discovery.mjs");
    expect(discoveryModelComparabilityReasons([ran("claude-sonnet-5-5"), ran("claude-sonnet-5-6")])).toEqual([
      expect.stringContaining("more than one model")
    ]);
    expect(discoveryModelComparabilityReasons([ran(null)])).toEqual([expect.stringContaining("unknown for 1 row(s)")]);
    expect(measuredDiscoveryModel([ran(null)])).toBeNull();
    const pin = createModelPin("sonnet");
    pin.observe("claude-sonnet-5-4");
    expect(discoveryModelComparabilityReasons([ran("claude-sonnet-5-5")], { pin })).toEqual([
      expect.stringContaining("pinned claude-sonnet-5-4")
    ]);
    expect(discoveryModelComparabilityReasons([{ agent: { model: null, error: "spawn failed" } }])).toEqual([]);
  });
});

describe("checkJudgeVerdictIdentity", () => {
  it("returns a verdict unchanged when its model is known and consistent", async () => {
    const { checkJudgeVerdictIdentity } = await import("../eval/qa/model-identity.mjs");
    const pin = createModelPin("sonnet");
    const verdict = { score: "correct", costUsd: 0.1, resolvedModel: "claude-sonnet-5-5" };
    expect(checkJudgeVerdictIdentity(pin, verdict)).toBe(verdict);
    expect(pin.resolved).toBe("claude-sonnet-5-5");
  });

  it("turns an unknown or mixed model into an error verdict that keeps cost and model evidence", async () => {
    const { checkJudgeVerdictIdentity } = await import("../eval/qa/model-identity.mjs");
    const pin = createModelPin("sonnet");
    const unknown = checkJudgeVerdictIdentity(pin, { score: "correct", costUsd: 0.2, resolvedModel: null });
    expect(unknown).toMatchObject({ score: "error", coreAnswer: null, judgeScore: "correct", costUsd: 0.2, resolvedModel: null, failureClass: "judge-model-identity" });
    pin.observe("claude-sonnet-5-5");
    const mixed = checkJudgeVerdictIdentity(pin, { score: "partial", costUsd: 0.3, resolvedModel: "claude-sonnet-5-6" });
    expect(mixed).toMatchObject({ score: "error", costUsd: 0.3, resolvedModel: "claude-sonnet-5-6", failureClass: "judge-model-identity" });
    // An error verdict is not an identity failure.
    const failed = { score: "error", failureClass: "cli" };
    expect(checkJudgeVerdictIdentity(pin, failed)).toBe(failed);
  });
});
