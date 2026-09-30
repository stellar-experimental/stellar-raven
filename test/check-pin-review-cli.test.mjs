import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
let root;

const source = (overrides = {}) => ({
  id: "src",
  type: "github",
  owner: "acme",
  repo: "skills",
  path: "skills",
  ref: "main",
  commit: "a".repeat(40),
  url: "https://github.com/acme/skills/tree/" + "a".repeat(40) + "/skills",
  license_files: ["LICENSE"],
  skills: [{ name: "one", files: [{ path: "SKILL.md", size: 10, sha: "b".repeat(40) }] }],
  ...overrides,
});

const manifestWith = (src) => JSON.stringify({ synced_at: "2026-01-01T00:00:00Z", status: "complete", skill_count: 1, sources: [src] });

const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// Run the real checker in a throwaway git repository: the base manifest and
// ledger are committed on `main`, the working tree holds the candidate change.
function setup(baseSource, ledger = "# Pin review\n") {
  root = mkdtempSync(join(tmpdir(), "check-pin-review-"));
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "ecosystem-skills"), { recursive: true });
  copyFileSync(join(REPO, "scripts", "check-pin-review.mjs"), join(root, "scripts", "check-pin-review.mjs"));
  writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), manifestWith(baseSource));
  writeFileSync(join(root, "ecosystem-skills", "PIN-REVIEW.md"), ledger);
  git("init", "-q", "-b", "main");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "-m", "base");
}

const run = (args = []) =>
  spawnSync(process.execPath, [join(root, "scripts", "check-pin-review.mjs"), "--base", "main", ...args], {
    cwd: root,
    encoding: "utf8",
  });

const digestOf = () => run(["--digests"]).stdout.match(/sel:([0-9a-f]{12})/)[1];

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

describe("check-pin-review location fields", () => {
  it("passes when nothing moved", () => {
    setup(source());
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("no skill pin or file selection moved");
  });

  it("fails a location-only change (same commit, same files) without a new attestation", () => {
    setup(source());
    const before = digestOf();
    writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), manifestWith(source({ owner: "someone-else" })));
    const after = digestOf();
    expect(after).not.toBe(before);
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("[MISSING FROM LEDGER]");
    expect(result.stderr).toContain(`src ${"a".repeat(12)} sel:${after}`);
  });

  it.each([
    ["repo", { repo: "other-skills" }],
    ["path", { path: "." }],
  ])("treats a %s-only change as a selection move", (_field, overrides) => {
    setup(source());
    const before = digestOf();
    writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), manifestWith(source(overrides)));
    expect(digestOf()).not.toBe(before);
    expect(run().status).toBe(1);
  });

  it("passes a location-only change once the ledger gains the new sel: token", () => {
    setup(source());
    writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), manifestWith(source({ owner: "someone-else" })));
    const after = digestOf();
    writeFileSync(join(root, "ecosystem-skills", "PIN-REVIEW.md"), `# Pin review\n\n- src ${"a".repeat(12)} sel:${after} moved to someone-else/skills; bytes re-read.\n`);
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[recorded]");
  });

  it("still fails a same-location retarget of a file blob", () => {
    setup(source());
    const retargeted = source();
    retargeted.skills[0].files[0].sha = "c".repeat(40);
    writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), manifestWith(retargeted));
    expect(run().status).toBe(1);
  });
});
