/**
 * SSE frame schema for `/playground/chat`. Decoupled from the AI SDK UI-message
 * protocol so the wire format stays stable across SDK bumps. Pure module.
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
