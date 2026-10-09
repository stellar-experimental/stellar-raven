import { expect, it } from "vitest";
import { buildSourceBasisManifest, sourceBasisShapeFromValue } from "../src/policy/source-basis.ts";
import { parseAgentResult } from "../eval/qa/agent-result.mjs";
import { buildTranscriptEvidencePack } from "../eval/qa/evidence-pack.mjs";

it.each([false, true])("classifies the error footer correctly when truncated=%s", (truncated) => {
  const value = { docs: [] };
  const footer = buildSourceBasisManifest({
    shape: sourceBasisShapeFromValue(value),
    calls: [{ op: "lumenloop.get_document", outcome: "error", ms: 0, reason: "http-404" }],
    artifact: { state: "absent", reason: truncated ? "unavailable" : "not-truncated" },
    truncated
  });
  expect(footer).toContain(truncated ? "--- SOURCE BASIS ---" : "--- SOURCE METADATA ---");
  expect(footer).toContain("[http-404]");
  const result = `${JSON.stringify(value)}\n${footer}`;
  // A read-containing execute exercises the parser's truncation classification.
  const code = `async () => {
    await codemode.artifact.read("11111111-2222-4333-8444-555555555555");
    const d = await lumenloop.get_document({ collection: "articles", id: 123 });
    const docs = [];
    if (d.ok) docs.push(d.data);
    return { docs };
  }`;
  const stdout = [
    { type: "assistant", message: { role: "assistant", content: [
      { type: "tool_use", id: "t1", name: "mcp__raven__execute", input: { code } }
    ] } },
    { type: "user", message: { role: "user", content: [
      { type: "tool_result", tool_use_id: "t1", is_error: false, content: [{ type: "text", text: result }] }
    ] } },
    { type: "result", subtype: "success", is_error: false, result: "The read failed.", num_turns: 1 }
  ].map((event) => JSON.stringify(event)).join("\n");
  const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
  expect(outcome.artifacts.readExecutes).toMatchObject({
    total: 1, bounded: truncated ? 0 : 1, truncated: truncated ? 1 : 0
  });
  expect(outcome.artifacts.finalProjection).toBe(truncated ? "truncated" : "bounded");

  const pack = buildTranscriptEvidencePack({ transcript: outcome.transcript, tags: { freshness: "live" } });
  expect(pack).toContain(`truncated=${truncated ? 1 : 0}`);
  if (truncated) {
    expect(pack).toContain("truncation: execute#1: --- SOURCE BASIS ---");
  } else {
    expect(pack).not.toContain("truncation:");
    expect(pack).toContain("provenance: execute#1: --- SOURCE METADATA ---");
    expect(pack).toContain("[http-404]");
  }
});
