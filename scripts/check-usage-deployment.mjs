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
    const token = process.env.CLOUDFLARE_API_TOKEN ||
      (await readFile(resolve(homedir(), ".wrangler/config/sdf.toml"), "utf8")).match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
    if (!token) throw new Error("No Cloudflare credential is available for the deployment check");
    const get = async path => {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/ba55b7ae9acfb3ed152103e3497c0752/workers/scripts/${path}`, {
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
