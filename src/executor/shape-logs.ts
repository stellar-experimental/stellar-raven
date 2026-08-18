/**
 * Log shaping for the `execute` sandbox — structural caps on console output
 * BEFORE it reaches the tool-boundary token budget (src/executor/run.ts).
 *
 * Plain-Node module (no cloudflare:workers import — observability.ts and
 * policy/redact.ts are both plain Node), so it is unit-testable directly,
 * unlike run.ts (worker-only via @cloudflare/codemode).
 *
 * Security ordering: redact each line before clipping it. Clipping
 * before redaction would let a secret straddling the MAX_LOG_LINE_CHARS
 * boundary leak its prefix — the tail (with the redactable substring) gets cut
 * off, so scrubbing no longer matches. Redacting first collapses the whole
 * secret to [REDACTED] regardless of where it sits, then the clip is safe.
 */
import { redactSecrets } from "../policy/redact.ts";
import { logEvent } from "../observability.ts";

export const MAX_LOG_LINES = 100;
export const MAX_LOG_LINE_CHARS = 2_000;

/** logEvent-shaped emitter (injectable so tests can spy without globals). */
export type LogEmitter = (evt: string, fields: Record<string, unknown>) => void;

export function shapeLogs(
  logs: string[] | undefined,
  secrets: string[],
  emit: LogEmitter = logEvent
): string[] {
  const all = logs ?? [];
  let clipped = 0;
  const shaped = all.slice(0, MAX_LOG_LINES).map((line) => {
    // Redact FIRST — a secret at the clip boundary must never leak a prefix.
    const redacted = redactSecrets(line, secrets);
    if (redacted.length <= MAX_LOG_LINE_CHARS) return redacted;
    clipped += 1;
    return `${redacted.slice(0, MAX_LOG_LINE_CHARS)}… [log line clipped]`;
  });
  const dropped = Math.max(0, all.length - MAX_LOG_LINES);
  if (dropped > 0) {
    shaped.push(`… [${dropped} more log lines dropped]`);
  }
  // Structural shaping happens before the tool-boundary token budget, so it
  // is invisible to the execute event's logsTruncated flag — emit its own
  // event, only when something was actually lost (zero cost otherwise).
  if (clipped > 0 || dropped > 0) {
    emit("execute_logs_shaped", { clipped, dropped, totalLines: all.length });
  }
  return shaped;
}
