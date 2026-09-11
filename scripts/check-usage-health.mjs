#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function healthFailures(report, now = Date.now()) {
  const failures = [];
  const generated = Date.parse(report?.generatedAt);
  if (!Number.isFinite(generated) || now - generated > 15 * 60000 || generated > now + 5 * 60000) {
    failures.push("The report timestamp is absent or stale");
  }
  const health = report?.health;
  if (!health || !Number.isFinite(health.last_canary_ms) || now - health.last_canary_ms > 3 * 3600000) {
    failures.push("No collection canary arrived in the last three hours");
  }
  for (const field of ["missing_response_ids", "failed_statements", "truncated_invocations", "failed_invocations"]) {
    if (!Number.isFinite(health?.[field]) || health[field] < 0) failures.push(`Missing health field: ${field}`);
    else if (health[field] > 0) failures.push(`Possible missing responses: ${field}=${health[field]} in the last 24 hours`);
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.env.USAGE_REPORT_TOKEN) throw new Error("USAGE_REPORT_TOKEN is not configured");
    const url = process.env.USAGE_REPORT_URL || "https://stellar-raven-usage-report.sdf-ecosystem.workers.dev/report";
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.USAGE_REPORT_TOKEN}`, "User-Agent": "Raven-Usage-Monitor/1.0" },
      redirect: "manual", signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`Usage report returned HTTP ${response.status}`);
    const failures = healthFailures(await response.json());
    if (failures.length) throw new Error(failures.join("; "));
    console.log("Usage archive healthy: recent canary and no reported collection gaps in the last 24 hours.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
