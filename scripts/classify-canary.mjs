#!/usr/bin/env node
/**
 * Map a `/health/skills` HTTP status + response body to a four-state drift enum.
 * Usage: node scripts/classify-canary.mjs <http-status> <body-file>
 *
 * States:
 *   clean   — fresh, valid, ok verdict
 *   failing — fresh, valid, non-ok verdict (only state that claims a live outage)
 *   stale   — verdict older than STALE_AFTER_MS (detector stopped; retrieval unknown)
 *   error   — unreachable, malformed, missing, future-dated, or status/body mismatch
 */
import { readFileSync } from "node:fs";

/** Cron is hourly; three missed runs means the detector itself is down. */
export const STALE_AFTER_MS = 180 * 60 * 1000;

/**
 * @param {{ status: string, body: string, now: number }} input
 * @returns {"clean" | "failing" | "stale" | "error"}
 */
export function classifyCanary({ status, body, now }) {
  // Only 200/503 come from the endpoint contract; 000/502/etc. are check errors.
  if (status !== "200" && status !== "503") return "error";

  let verdict;
  try {
    verdict = JSON.parse(body);
  } catch {
    return "error";
  }
  if (!verdict || typeof verdict !== "object" || Array.isArray(verdict)) return "error";

  // Validate shape before verdict: before the first cron runs, 503 returns {ok:false, reason}
  // without checkedAt, which is a missing verdict (error), not a live outage.
  if (typeof verdict.ok !== "boolean" || typeof verdict.checkedAt !== "string") return "error";
  const checkedAt = Date.parse(verdict.checkedAt);
  if (!Number.isFinite(checkedAt)) return "error";

  // Status and body must agree.
  if ((status === "200") !== (verdict.ok === true)) return "error";

  // Check freshness before verdict: a stale ok:false or ok:true only proves the detector stopped.
  const age = now - checkedAt;
  // Tolerate up to 5m clock skew; further in the future is an invalid timestamp.
  if (age < -5 * 60 * 1000) return "error";
  if (age > STALE_AFTER_MS) return "stale";

  return verdict.ok ? "clean" : "failing";
}

// CLI: argv[2] = http status, argv[3] = path to the response body.
if (process.argv[1] && process.argv[1].endsWith("classify-canary.mjs")) {
  const status = process.argv[2] ?? "";
  const bodyPath = process.argv[3] ?? "";
  let body = "";
  try {
    body = readFileSync(bodyPath, "utf8");
  } catch {
    body = "";
  }
  console.log(classifyCanary({ status, body, now: Date.now() }));
}
