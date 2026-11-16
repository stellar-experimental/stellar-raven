import { describe, expect, it } from "vitest";
import { packetOf } from "../eval/qa/claim-read-packets.mjs";

const execute = (code, result) => ({ tool: "mcp__raven__execute", input: JSON.stringify({ code }), result });
const long = `${"x".repeat(30_000)}END`;

describe("packetOf", () => {
  it("returns null for an answer with no claim word", () => {
    expect(packetOf("run", { id: "a", question: "q", answer: "Plain answer.", transcript: [] })).toBeNull();
  });

  it("writes every result in full, never cut", () => {
    const packet = packetOf("run", {
      id: "a",
      question: "Was it audited?",
      answer: "It was audited by ExampleAuditor.",
      transcript: [execute("async()=>scout.listAudits({})", long)]
    });
    expect(packet.text).toContain("It was audited by ExampleAuditor.");
    expect(packet.text).toContain("END");
    expect(packet.text).toContain(`(${long.length} chars)`);
    expect(packet.hasBlock).toBe(false);
  });

  it("can require the candidate block, and marks it", () => {
    const row = {
      id: "a",
      question: "q",
      answer: "The vote was held.",
      transcript: [execute("async()=>1", "{}\n\n--- CANDIDATE EVIDENCE ---\nx")]
    };
    expect(packetOf("run", row, { requireBlock: true }).hasBlock).toBe(true);
    expect(packetOf("run", { ...row, transcript: [execute("async()=>1", "{}")] }, { requireBlock: true })).toBeNull();
  });
});
