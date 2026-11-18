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

  it("is empty when every row ran on one exact model", async () => {
    const { discoveryModelComparabilityReasons } = await import("../eval/discovery/run-agent-discovery.mjs");
    expect(discoveryModelComparabilityReasons([ran("claude-sonnet-5-5"), ran("claude-sonnet-5-5")], "sonnet")).toEqual([]);
  });

  it("gives a reason for two models, or an alias whose rows name none, and skips failed rows", async () => {
    const { discoveryModelComparabilityReasons } = await import("../eval/discovery/run-agent-discovery.mjs");
    expect(discoveryModelComparabilityReasons([ran("claude-sonnet-5-5"), ran("claude-sonnet-5-6")], "sonnet")).toEqual([
      expect.stringContaining("more than one model")
    ]);
    expect(discoveryModelComparabilityReasons([ran(null)], "sonnet")).toEqual([expect.stringContaining("unknown for 1 row(s)")]);
    expect(discoveryModelComparabilityReasons([{ agent: { model: null, error: "spawn failed" } }], "sonnet")).toEqual([]);
  });
});
