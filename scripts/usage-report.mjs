#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { countsSql } from "../usage/report-site/cloudflare/queries.js";

export function monthTimestamp(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "")) throw new Error("Expected a month as YYYY-MM");
  const time = Date.parse(value + "-01T00:00:00Z");
  if (!Number.isSafeInteger(time)) throw new Error("Invalid month");
  return time;
}

export function reportSql(from, to) {
  const start = monthTimestamp(from), end = monthTimestamp(to);
  if (start >= end) throw new Error("--to must follow --from");
  const counts = countsSql('%Y-%m', 'month').replaceAll('?1', String(start)).replaceAll('?2', String(end));
  return `${counts};
  SELECT datetime(MIN(timestamp_ms)/1000, 'unixepoch') AS first_receipt_utc,
    datetime(MAX(timestamp_ms)/1000, 'unixepoch') AS last_receipt_utc,
    SUM(truncated) AS truncated_invocations,
    SUM(outcome NOT IN ('ok', 'unknown')) AS interrupted_invocations,
    SUM(missing_response_ids) AS missing_response_ids, SUM(failed_statements) AS failed_statements,
    SUM(canary) AS canary_receipts,
    datetime(MAX(CASE WHEN canary = 1 THEN timestamp_ms END)/1000, 'unixepoch') AS last_canary_utc
  FROM usage_receipts WHERE timestamp_ms >= ${start} AND timestamp_ms < ${end};`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    let from, to, local = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--from") from = args[++i];
      else if (args[i] === "--to") to = args[++i];
      else if (args[i] === "--local") local = true;
      else throw new Error(`Unknown argument: ${args[i]}`);
    }
    const sql = reportSql(from, to);
    // Wrangler returns only the final result for a multi-statement --command.
    const data = sql.split(";").map(query => query.trim()).filter(Boolean).map(query => {
      const result = spawnSync("npx", [
        "wrangler", "d1", "execute", "stellar-raven-usage",
        "--config", "usage/wrangler.jsonc", "--profile", "sdf",
        local ? "--local" : "--remote", "--json", "--command", query
      ], { cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8" });
      if (result.status !== 0) throw new Error(result.stderr || "Wrangler query failed");
      const response = JSON.parse(result.stdout);
      if (!Array.isArray(response) || response.length !== 1 || !response[0].success) {
        throw new Error("Unexpected D1 query response");
      }
      return response[0].results;
    });
    console.log(JSON.stringify({
      from, toExclusive: to, timezone: "UTC", source: local ? "local" : "production",
      definition: "Logged tool responses, including error/refusal responses; not client delivery acknowledgements.",
      coverage: "Missing months are unavailable, not zero. Inspect receipt dates and canary continuity before publishing.",
      months: data[0], receipts: data[1]
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
