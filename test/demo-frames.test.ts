/** SSE frame encoding tests (src/demo/frames.ts). */
import { describe, expect, it } from "vitest";
import { encodeFrame, type DemoFrame } from "../src/demo/frames";

describe("encodeFrame", () => {
  it("wraps the frame as a single SSE `data:` event with the trailing blank line", () => {
    const frame: DemoFrame = { type: "token", text: "hi" };
    expect(encodeFrame(frame)).toBe(`data: ${JSON.stringify(frame)}\n\n`);
  });

  it("round-trips each frame variant through JSON with no dropped fields", () => {
    const frames: DemoFrame[] = [
      { type: "token", text: "chunk" },
      { type: "tool-start", id: "call_1", tool: "search", input: { query: "trustlines" } },
      { type: "tool-result", id: "call_1", tool: "search", ok: true, output: { hits: [] } },
      { type: "tool-result", id: "call_2", tool: "execute", ok: false, output: { message: "boom" } },
      { type: "done", reason: "stop" },
      { type: "error", message: "budget exceeded" }
    ];

    for (const frame of frames) {
      const encoded = encodeFrame(frame);
      expect(encoded.startsWith("data: ")).toBe(true);
      expect(encoded.endsWith("\n\n")).toBe(true);
      const payload = encoded.slice("data: ".length, -"\n\n".length);
      expect(JSON.parse(payload)).toEqual(frame);
    }
  });

  it("never emits an embedded newline that would split the SSE event", () => {
    // A literal newline in `text` must stay JSON-escaped (\\n), not a raw
    // newline — a raw one would prematurely terminate the SSE event.
    const encoded = encodeFrame({ type: "token", text: "line one\nline two" });
    const body = encoded.slice(0, -2);
    expect(body.includes("\n")).toBe(false);
  });
});
