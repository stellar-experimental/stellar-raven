// Isolated fixture tests for the round 2026-11-16 dated launcher script.
// Delete this test alongside items/1.4/dated/launch-dated-lead.sh when the dated systemd units retire (.agents/TODO.md).
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const DATED_DIR = resolve(process.cwd(), ".agents/rounds/2026-11-16-next-phase/items/1.4/dated");
const LAUNCHER = join(DATED_DIR, "launch-dated-lead.sh");
const tempHomes = [];

afterEach(() => {
  while (tempHomes.length > 0) {
    rmSync(tempHomes.pop(), { recursive: true, force: true });
  }
});

function writeExecutable(file, body) {
  writeFileSync(file, body, "utf8");
  chmodSync(file, 0o755);
}

function makeFixture({
  itemsJson = { "2.2a": { due: "2026-11-30", cutoff: "2026-11-30T20:00:00Z", cases: ["q-fixture"] } },
  includeBrief = true,
  caseReverifyBy = "2026-11-30",
  nowEpoch = Math.floor(Date.parse("2026-11-30T06:00:00Z") / 1000),
  clockSteps = null,
  hcAlertOk = false,
  ghAlertOk = false,
  fillLogOnGhAlert = false,
  fetchFails = false,
  hcGetStates = ["working"]
} = {}) {
  const home = mkdtempSync(join(tmpdir(), "raven-dated-launcher-"));
  tempHomes.push(home);
  const bin = join(home, ".local/bin");
  const state = join(home, ".local/state/raven-dated");
  const origin = join(home, "origin.git");
  const seed = join(home, "seed");
  const repo = join(home, "code/stellar-raven-codemode");
  mkdirSync(bin, { recursive: true });
  mkdirSync(state, { recursive: true });
  mkdirSync(join(home, "code"), { recursive: true });

  const git = (cwd, args) => {
    const res = spawnSync("git", args, { cwd, encoding: "utf8" });
    if (res.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
    return res.stdout.trim();
  };

  git(home, ["init", "--bare", "-b", "main", origin]);
  git(home, ["clone", origin, seed]);
  git(seed, ["config", "user.email", "test@example.com"]);
  git(seed, ["config", "user.name", "Test"]);

  const datedRel = ".agents/rounds/2026-11-16-next-phase/items/1.4/dated";
  mkdirSync(join(seed, datedRel), { recursive: true });
  mkdirSync(join(seed, "eval/qa"), { recursive: true });
  if (includeBrief) {
    writeFileSync(join(seed, datedRel, "2.2a-LEAD.md"), "# Fixture 2.2a brief\n");
  }
  writeFileSync(join(seed, datedRel, "items.json"), `${JSON.stringify(itemsJson, null, 2)}\n`);
  writeFileSync(
    join(seed, "eval/qa/cases.json"),
    `${JSON.stringify({ cases: [{ id: "q-fixture", truth: { reverifyBy: caseReverifyBy } }] }, null, 2)}\n`
  );
  git(seed, ["add", "."]);
  git(seed, ["commit", "-m", "seed"]);
  git(seed, ["push", "-u", "origin", "main"]);
  git(home, ["clone", origin, repo]);

  // Add a stale remote-tracking ref in the clone to verify dry-mode fetch does not prune it.
  const mainSha = git(repo, ["rev-parse", "origin/main"]);
  git(repo, ["update-ref", "refs/remotes/origin/stale-ref", mainSha]);

  if (fetchFails) {
    git(repo, ["remote", "set-url", "origin", join(home, "missing-origin.git")]);
  }

  // GNU-compatible `date` stub (handles `-u -d <iso> +%s` and `+%s` on macOS & Linux) with optional clock steps.
  const clockFile = join(home, "clock-step.txt");
  writeFileSync(clockFile, "0\n");
  const stepsJson = JSON.stringify(clockSteps ?? []);
  writeExecutable(
    join(bin, "date"),
    `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
const dIdx = args.indexOf("-d");
if (dIdx !== -1) {
  const raw = args[dIdx + 1];
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) process.exit(1);
  process.stdout.write(String(Math.floor(ms / 1000)) + "\\n");
  process.exit(0);
}
const steps = ${stepsJson};
let epoch = ${nowEpoch};
if (args.includes("+%s") && !args.includes("-u") && steps.length > 0) {
  const n = Number(fs.readFileSync(${JSON.stringify(clockFile)}, "utf8").trim()) || 0;
  epoch = n < steps.length ? steps[n] : steps[steps.length - 1] + (n - steps.length + 1) * 120;
  fs.writeFileSync(${JSON.stringify(clockFile)}, String(n + 1) + "\\n");
}
if (args.includes("+%s")) {
  process.stdout.write(String(epoch) + "\\n");
} else {
  process.stdout.write(new Date(epoch * 1000).toISOString().replace(/\\.\\d{3}Z$/, "Z") + "\\n");
}
`
  );

  // Stub `sleep` (no real waiting) and `timeout` (execute command directly).
  writeExecutable(join(bin, "sleep"), "#!/usr/bin/env bash\nexit 0\n");
  writeExecutable(join(bin, "timeout"), '#!/usr/bin/env bash\nshift\nexec "$@"\n');

  // Stub `hc` supporting `send`, `run`, `get`, `read`, `keys`.
  const hcCountFile = join(home, "hc-get-count.txt");
  writeFileSync(hcCountFile, "0\n");
  const statesJson = JSON.stringify(hcGetStates);
  writeExecutable(
    join(bin, "hc"),
    `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
const cmd = args[0];
if (cmd === "send") {
  process.exit(${hcAlertOk ? 0 : 1});
}
if (cmd === "run") {
  process.stdout.write(JSON.stringify({ address: "t999" }) + "\\n");
  process.exit(0);
}
if (cmd === "get") {
  const states = ${statesJson};
  const n = Number(fs.readFileSync(${JSON.stringify(hcCountFile)}, "utf8").trim()) || 0;
  const st = states[Math.min(n, states.length - 1)];
  fs.writeFileSync(${JSON.stringify(hcCountFile)}, String(n + 1) + "\\n");
  if (st === "finished") {
    process.stdout.write(JSON.stringify({ state: "finished", status: null }) + "\\n");
  } else {
    process.stdout.write(JSON.stringify({ state: "live", status: { state: st } }) + "\\n");
  }
  process.exit(0);
}
if (cmd === "read") {
  process.stdout.write("stub screen output\\n");
  process.exit(0);
}
if (cmd === "keys") {
  process.exit(0);
}
process.exit(1);
`
  );

  // Stub `gh` supporting `issue list`, `issue create`, `issue comment`.
  const logPath = join(state, "2.2a.log");
  writeExecutable(
    join(bin, "gh"),
    `#!/usr/bin/env bash
if [[ "$1" == "issue" && "$2" == "list" ]]; then
  echo "[]"
  exit 0
fi
if [[ "${fillLogOnGhAlert ? "1" : ""}" == "1" ]]; then
  dd if=/dev/zero bs=1 count=512 >> "${logPath}" 2>/dev/null || true
fi
exit ${ghAlertOk ? 0 : 1}
`
  );

  return { home, state, repo, git };
}

function runLauncher(home, args = ["2.2a", "software-versions"], extraEnv = {}) {
  return spawnSync("bash", [LAUNCHER, ...args], {
    env: { HOME: home, ...extraEnv },
    encoding: "utf8"
  });
}

describe("dated launcher script", () => {
  it("matches RestartPreventExitStatus=75 across every armed dated service unit", () => {
    for (const unit of ["raven-dated-2.2a.service", "raven-dated-2.2b.service", "raven-dated-2.2c.service"]) {
      const text = readFileSync(join(DATED_DIR, "units", unit), "utf8");
      expect(text, unit).toContain("RestartPreventExitStatus=75");
    }
  });

  it("exits 75 on expired cutoff when alert succeeds and writes FAILED marker", () => {
    const { home, state } = makeFixture({
      nowEpoch: Math.floor(Date.parse("2026-11-30T21:00:00Z") / 1000),
      ghAlertOk: true
    });
    const res = runLauncher(home);
    expect(res.status).toBe(75);
    expect(existsSync(join(state, "FAILED-2.2a.txt"))).toBe(true);
  });

  it("stays exit 75 on expired cutoff even when all alert channels fail, and leaves no FAILED marker", () => {
    const { home, state } = makeFixture({
      nowEpoch: Math.floor(Date.parse("2026-11-30T21:00:00Z") / 1000),
      hcAlertOk: false,
      ghAlertOk: false
    });
    const res = runLauncher(home);
    expect(res.status).toBe(75);
    expect(existsSync(join(state, "FAILED-2.2a.txt"))).toBe(false);
  });

  it("stays exit 75 on expired cutoff even if writing FAILED marker and failure diagnostics both fail under set -e", () => {
    const { home, state } = makeFixture({
      nowEpoch: Math.floor(Date.parse("2026-11-30T21:00:00Z") / 1000),
      ghAlertOk: true,
      fillLogOnGhAlert: true
    });
    // A directory at the marker path makes marker redirection fail, while `ulimit -f 1` (512 bytes)
    // with SIGXFSZ ignored causes `log "warning: ..."` to hit EFBIG right after `gh` pads the log.
    mkdirSync(join(state, "FAILED-2.2a.txt"));
    const res = spawnSync("bash", ["-c", `trap '' XFSZ; ulimit -f 1; exec bash "${LAUNCHER}" 2.2a software-versions`], {
      env: { HOME: home },
      encoding: "utf8"
    });
    expect(res.status).toBe(75);
  });

  it.each([
    { label: "bad cutoff", itemsJson: { "2.2a": { due: "2026-11-30", cutoff: "not-a-date", cases: ["q-fixture"] } }, includeBrief: true },
    { label: "missing cutoff + missing brief", itemsJson: { "2.2a": { due: "2026-11-30", cases: ["q-fixture"] } }, includeBrief: false },
    { label: "string entry", itemsJson: { "2.2a": "oops" }, includeBrief: false },
    { label: "null entry", itemsJson: { "2.2a": null }, includeBrief: false },
    { label: "false entry", itemsJson: { "2.2a": false }, includeBrief: false }
  ])("exits 75 on invalid items.json/cutoff: $label", ({ itemsJson, includeBrief }) => {
    const { home } = makeFixture({ itemsJson, includeBrief });
    expect(runLauncher(home).status).toBe(75);
  });

  it("downgrades pre-cutoff non-cutoff final failure (existing branch) to retryable exit 1 when alerts fail", () => {
    const { home, state, repo, git } = makeFixture({ hcAlertOk: false, ghAlertOk: false });
    git(repo, ["branch", "np/2.2a-software-versions", "origin/main"]);
    const res = runLauncher(home);
    expect(res.status).toBe(1);
    expect(existsSync(join(state, "FAILED-2.2a.txt"))).toBe(false);
  });

  it("preserves FAILED marker and remote-tracking refs in RAVEN_DATED_DRY=1 already-done mode", () => {
    const { home, state, repo, git } = makeFixture({ caseReverifyBy: "2027-02-08" });
    const marker = join(state, "FAILED-2.2a.txt");
    writeFileSync(marker, "previous failure\n");
    const res = runLauncher(home, ["2.2a", "software-versions"], { RAVEN_DATED_DRY: "1" });
    expect(res.status).toBe(0);
    expect(existsSync(marker)).toBe(true);
    expect(git(repo, ["show-ref", "refs/remotes/origin/stale-ref"])).toContain("refs/remotes/origin/stale-ref");
  });

  it.each([
    { label: "idle then working -> exit 0", hcGetStates: ["idle", "working"], expected: 0 },
    // Late working past 120s deadline is still accepted (avoids false alarm on a live lead).
    { label: "late working past 120s deadline -> exit 0", clockSteps: [1000, 1100, 1300], hcGetStates: ["idle", "working"], expected: 0 },
    // hc 0.1.21 ended-terminal JSON shape: { state: "finished", status: null }.
    { label: "finished (hc 0.1.21 shape) -> exit 75", hcGetStates: ["finished"], expected: 75 },
    { label: "done inside start window -> exit 75", hcGetStates: ["done"], expected: 75 },
    { label: "error inside start window -> exit 75", hcGetStates: ["error"], expected: 75 },
    { label: "never ready past deadline -> exit 75", clockSteps: [1000, 1200], hcGetStates: ["idle", "idle"], expected: 75 }
  ])("readiness loop: $label", ({ clockSteps, hcGetStates, expected }) => {
    const { home } = makeFixture({ clockSteps, hcGetStates });
    expect(runLauncher(home).status).toBe(expected);
  });
});
