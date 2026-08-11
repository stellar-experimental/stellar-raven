import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const CONFIG = join(dirname(fileURLToPath(import.meta.url)), "..", ".gitleaks.toml");
const GITLEAKS_AVAILABLE = spawnSync("gitleaks", ["version"], { stdio: "ignore" }).status === 0;
const HASH = ["9f4a8c2e6b1d7f305ac948e2d617bf90", "35ce8a14f2796bd041e7c5932af806db"].join("");
const AWS_ACCESS_KEY = ["AKIA", "7G5K9M2P4R8T6V3X"].join("");
const GENERIC_CREDENTIAL = ["k7H2v9Q4m6T8x3R5", "p1W0z4N8c2L6s9B3"].join("");

function scan(files) {
  const repo = mkdtempSync(join(tmpdir(), "gitleaks-config-"));
  try {
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(dirname(join(repo, name)), { recursive: true });
      writeFileSync(join(repo, name), content);
    }
    execFileSync("git", ["init", "-q"], { cwd: repo });
    execFileSync("git", ["config", "user.email", "gitleaks@example.test"], { cwd: repo });
    execFileSync("git", ["config", "user.name", "Gitleaks Fixture"], { cwd: repo });
    execFileSync("git", ["add", "."], { cwd: repo });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-qm", "fixture"], { cwd: repo });
    return spawnSync("gitleaks", [
      "git", "--no-banner", "--no-color", "--redact", "--config", CONFIG, "--log-opts=-1 HEAD"
    ], { cwd: repo, encoding: "utf8" }).status;
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

// Each case shells out several times — `git init`/`add`/`commit` in a throwaway repo, then the
// gitleaks binary — so the 5s default is not a meaningful deadline here; under full-suite parallel
// load it fires as a flake while the same cases pass in isolation. The timeout still bounds a real
// hang, just at a scale that matches the work.
describe("gitleaks config semantics", { timeout: 30_000 }, () => {
  if (!GITLEAKS_AVAILABLE) {
    it.skip("requires gitleaks on PATH; CI may omit it", () => {});
    return;
  }

  it("suppresses only bare register hashes while retaining default credential rules", () => {
    expect(scan({
      "eval/qa/consistency-register.json": `{"q-auth":"${HASH}"}\n`
    })).toBe(0);
    expect(scan({ "elsewhere.json": `{"q-auth":"${HASH}"}\n` })).toBe(1);
    expect(scan({
      "eval/qa/consistency-register.json": `${JSON.stringify({ accessKey: AWS_ACCESS_KEY })}\n`
    })).toBe(1);
    expect(scan({ "settings.toml": `credential = ${JSON.stringify(GENERIC_CREDENTIAL)}\n` })).toBe(1);
  });
});
