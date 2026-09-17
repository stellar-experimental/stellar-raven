#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
    // against its own account. The credential is CLOUDFLARE_API_TOKEN or a local Wrangler OAuth profile.
    const config = JSON.parse((await readFile(new URL("../usage/wrangler.jsonc", import.meta.url), "utf8")).replace(/^\s*\/\/.*$/gm, ""));
    const accountId = config.account_id;
    if (!accountId) throw new Error("usage/wrangler.jsonc has no account_id");
    let token = process.env.CLOUDFLARE_API_TOKEN;
    for (const profile of [process.env.WRANGLER_PROFILE, "default", "sdf"].filter(Boolean)) {
      if (token) break;
      try { token = (await readFile(resolve(homedir(), `.wrangler/config/${profile}.toml`), "utf8")).match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1]; }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    if (!token) {
      console.log("No Cloudflare credential is available, so the usage deployment check was skipped. Set CLOUDFLARE_API_TOKEN or WRANGLER_PROFILE to run it.");
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
