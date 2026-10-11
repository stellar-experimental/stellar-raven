#!/usr/bin/env node
// Checks the pinned Claude judge executable for a paid Playground run.
// Usage: node judge-pin.mjs <pin-dir> [expected-sha256]
// The pin directory must hold only a `claude` link, must resolve first on PATH,
// and DISABLE_AUTOUPDATER must be 1. With an expected SHA-256, the resolved file
// must match it. Prints the identity as JSON; exit 1 on any failed check.
import { lstatSync, readdirSync } from "node:fs";
import path from "node:path";
import { assertExpectedExecutable, executableIdentity } from "../../../../eval/lib/executable-identity.mjs";

const [pinDir, expectedSha256] = process.argv.slice(2);
if (!pinDir) {
  console.error("usage: node judge-pin.mjs <pin-dir> [expected-sha256]");
  process.exit(2);
}
const fail = (message) => {
  console.error(`judge pin: ${message}`);
  process.exit(1);
};

if (process.env.DISABLE_AUTOUPDATER !== "1") fail("DISABLE_AUTOUPDATER is not 1");
const link = path.join(path.resolve(pinDir), "claude");
const entries = readdirSync(pinDir);
if (entries.length !== 1 || entries[0] !== "claude") fail(`${pinDir} must hold only claude, found ${entries.join(", ")}`);
if (!lstatSync(link).isSymbolicLink()) fail(`${link} is not a link`);

const identity = executableIdentity("claude");
if (identity.resolvedPath !== link) fail(`claude resolves to ${identity.resolvedPath}, not ${link}`);
if (expectedSha256) {
  try {
    assertExpectedExecutable(identity, expectedSha256, { label: "judge executable" });
  } catch (error) {
    fail(error.message);
  }
}
console.log(JSON.stringify(identity));
