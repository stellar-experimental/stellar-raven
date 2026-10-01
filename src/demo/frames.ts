/**
 * SSE frame schema for `/playground/chat` — our own small vocabulary rather than
 * the AI SDK UI-message protocol (design Decision 1: we own both ends, there
 * is no `useChat` client). Trace states loosely mirror the AI SDK's
 * input-streaming -> input-available -> output-available/output-error, but
 * are re-expressed here so the wire format can't drift with an SDK bump.
 *
 * Pure module: no cloudflare:workers import, no env access — safe to unit
 * test under plain Node (test/demo-frames.test.ts).
 */

import type { AnswerCost } from "./eval-cost.ts";

export type DemoFrame =
  | ({ type: "eval-cost" } & AnswerCost)
  | { type: "ready" }
  | { type: "token"; text: string }
  | { type: "thinking"; text: string }
  | { type: "tool-start"; id: string; tool: "search" | "execute"; input: unknown }
  | { type: "tool-result"; id: string; tool: "search" | "execute"; ok: boolean; output: unknown }
  | { type: "done"; reason: string }
  | { type: "error"; message: string };

/** One SSE `data:` event per frame (SSE requires the trailing blank line). */
export function encodeFrame(frame: DemoFrame): string {
  return `data: ${JSON.stringify(frame)}\n\n`;
}
