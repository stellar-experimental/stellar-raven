#!/usr/bin/env node
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

export function deploymentFailures(producer, schedules) {
  const failures = [];
  if (!producer?.tail_consumers?.some(consumer => consumer.service === "stellar-raven-usage")) {
    failures.push("The producer does not send traces to stellar-raven-usage");
  }
  if (!schedules?.schedules?.some(schedule => schedule.cron === "17 3 * * *")) {
    failures.push("The usage retention cleanup schedule is missing");
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    // The account comes from the collector config so a fork that edits usage/wrangler.jsonc is checked
    // against its own account. Wrangler resolves the credential: CLOUDFLARE_API_TOKEN, then
    // WRANGLER_PROFILE, then the profile bound to this directory. It also refreshes an expired token.
    const config = JSON.parse((await readFile(new URL("../usage/wrangler.jsonc", import.meta.url), "utf8")).replace(/^\s*\/\/.*$/gm, ""));
    const accountId = config.account_id;
    if (!accountId) throw new Error("usage/wrangler.jsonc has no account_id");
    const wrangler = fileURLToPath(new URL("../node_modules/.bin/wrangler", import.meta.url));
    const profileArgs = process.env.WRANGLER_PROFILE ? ["--profile", process.env.WRANGLER_PROFILE] : [];
    let token;
    try {
      const { stdout } = await promisify(execFile)(wrangler, ["auth", "token", "--json", ...profileArgs], { timeout: 30000 });
      token = JSON.parse(stdout).token;
    } catch {}
    if (!token) {
      console.log("No Cloudflare credential is available, so the usage deployment check was skipped. Run wrangler login, bind a profile to this directory, or set CLOUDFLARE_API_TOKEN.");
      process.exit(0);
    }
    const get = async path => {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${path}`, {
        headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(`Deployment check returned HTTP ${response.status}`);
      return data.result;
    };
    const failures = deploymentFailures(await get("stellar-raven-codemode/settings"), await get("stellar-raven-usage/schedules"));
    if (failures.length) throw new Error(failures.join("; "));
    console.log("Usage tail consumer and daily retention schedule are present.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
