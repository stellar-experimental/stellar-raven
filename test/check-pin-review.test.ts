/**
 * Tests for scripts/check-pin-review.mjs against a throwaway git repo:
 * commit moves, retargeted files, source deletions, attestation replay, and sel: token parsing.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let repo: string;

const SHA_A = "a".repeat(40);
const SHA_B = "b".repeat(40);
const blob = (n: string) => n.repeat(40);

/** Two sources, so a test can move one and leave the other alone. */
const baseManifest = () => ({
  sources: [
    {
      id: "alpha",
      owner: "acme",
      repo: "skills",
      path: "skills",
      commit: SHA_A,
      skills: [{ name: "one", files: [{ path: "SKILL.md", sha: blob("1") }] }]
    },
    {
      id: "beta",
      owner: "acme",
      repo: "skills-b",
      path: "skills",
      commit: SHA_B,
      skills: [{ name: "two", files: [{ path: "SKILL.md", sha: blob("2") }] }]
    },
  ],
});

const git = (...args: string[]) => execFileSync("git", args, { cwd: repo, encoding: "utf8" });

function write(manifest: unknown, ledger: string) {
  writeFileSync(join(repo, "ecosystem-skills/MANIFEST.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(join(repo, "ecosystem-skills/PIN-REVIEW.md"), ledger);
}

/** Run the real script against the temp repo; returns status and streams. */
function runCheck() {
  return spawnSync(process.execPath, [join(repo, "scripts/check-pin-review.mjs"), "--base", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  });
}

function check(): number {
  return runCheck().status ?? -1;
}

/** The digest the script itself computes for a source — no reimplementation here. */
function digestOf(sourceId: string): string {
  const out = execFileSync(process.execPath, [join(repo, "scripts/check-pin-review.mjs"), "--digests"], {
    cwd: repo,
    encoding: "utf8",
  });
  const line = out.split("\n").find((l) => l.startsWith(`${sourceId} `));
  return line!.match(/sel:([0-9a-f]{12})/)![1]!;
}

const BASE_LEDGER = "# ledger\n\n(no changes yet)\n";

beforeAll(() => {
  repo = mkdtempSync(join(tmpdir(), "pin-review-"));
  mkdirSync(join(repo, "scripts"), { recursive: true });
  mkdirSync(join(repo, "ecosystem-skills"), { recursive: true });
  cpSync(join(ROOT, "scripts/check-pin-review.mjs"), join(repo, "scripts/check-pin-review.mjs"));
  write(baseManifest(), BASE_LEDGER);
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  git("add", "-A");
  git("commit", "-qm", "base");
});

afterAll(() => rmSync(repo, { recursive: true, force: true }));

describe("check-pin-review.mjs — the re-pin attestation gate", () => {
  it("passes when nothing about the served selection changed", () => {
    write(baseManifest(), BASE_LEDGER);
    const result = runCheck();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("no skill pin or file selection moved");
  });

  it("fails when a commit moves without a new attestation", () => {
    const m = baseManifest();
    m.sources[0]!.commit = "c".repeat(40);
    write(m, BASE_LEDGER);
    expect(check()).toBe(1);
  });

  it("fails when a file is retargeted inside the SAME pinned commit", () => {
    const m = baseManifest();
    m.sources[0]!.skills[0]!.files[0]!.path = "references/OTHER.md";
    write(m, BASE_LEDGER);
    expect(check()).toBe(1);
  });

  it("fails when an entire source is deleted", () => {
    const m = baseManifest();
    m.sources = [m.sources[0]!];
    write(m, BASE_LEDGER);
    expect(check()).toBe(1);
  });

  it("accepts a deletion that the ledger records in this diff", () => {
    const m = baseManifest();
    m.sources = [m.sources[0]!];
    write(m, `${BASE_LEDGER}\nremoved: beta — dropped upstream, reviewed 2026-07-30.\n`);
    expect(check()).toBe(0);
  });

  it("accepts a moved selection whose new sel: digest is newly recorded", () => {
    const m = baseManifest();
    m.sources[0]!.commit = "c".repeat(40);
    write(m, BASE_LEDGER);
    const digest = digestOf("alpha");
    write(m, `${BASE_LEDGER}\n| \`alpha\` | \`${"c".repeat(40)}\` | \`sel:${digest}\` | reviewed |\n`);
    expect(check()).toBe(0);
  });

  it("rejects an attestation that already existed at the base ref (replay)", () => {
    // Reverting to a previously reviewed selection is still a decision to serve
    // those bytes again today, so the old line must not satisfy the gate.
    write(baseManifest(), BASE_LEDGER);
    const original = digestOf("alpha");
    const ledgerWithOld = `${BASE_LEDGER}\n| \`alpha\` | \`${SHA_A}\` | \`sel:${original}\` | reviewed |\n`;
    const moved = baseManifest();
    moved.sources[0]!.commit = "c".repeat(40);
    write(moved, ledgerWithOld);
    git("add", "-A");
    git("commit", "-qm", "move alpha away, ledger already names the ORIGINAL selection");
    // Now revert to the original selection. Its digest is in the ledger — but it
    // was already there at the base ref, so it is not a fresh review.
    write(baseManifest(), ledgerWithOld);
    expect(check()).toBe(1);
    git("reset", "-q", "--hard", "HEAD~1");
  });

  it("does not accept 12 hex characters that are not a sel: token", () => {
    // The old `ledger.includes(digest)` matched anywhere — including inside the
    // 40-hex commit SHAs this file is full of.
    const m = baseManifest();
    m.sources[0]!.commit = "c".repeat(40);
    write(m, BASE_LEDGER);
    const digest = digestOf("alpha");
    write(m, `${BASE_LEDGER}\nunrelated prose mentioning ${digest} with no sel: prefix\n`);
    expect(check()).toBe(1);
    // Same 12 chars, now as a real token: accepted.
    write(m, `${BASE_LEDGER}\nsel:${digest} — reviewed\n`);
    expect(check()).toBe(0);
  });

  it("fails a location-only change (same commit, same files) without a new attestation", () => {
    write(baseManifest(), BASE_LEDGER);
    const before = digestOf("alpha");
    const m = baseManifest();
    m.sources[0]!.owner = "someone-else";
    write(m, BASE_LEDGER);
    const after = digestOf("alpha");
    expect(after).not.toBe(before);
    const result = runCheck();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("[MISSING FROM LEDGER]");
    expect(result.stderr).toContain(`alpha ${SHA_A.slice(0, 12)} sel:${after}`);
  });

  it.each([
    ["repo", { repo: "other-skills" }],
    ["path", { path: "." }],
  ])("treats a %s-only change as a selection move", (_field, overrides) => {
    write(baseManifest(), BASE_LEDGER);
    const before = digestOf("alpha");
    const m = baseManifest();
    Object.assign(m.sources[0]!, overrides);
    write(m, BASE_LEDGER);
    expect(digestOf("alpha")).not.toBe(before);
    expect(check()).toBe(1);
  });

  it("passes a location-only change once the ledger gains the new sel: token", () => {
    const m = baseManifest();
    m.sources[0]!.owner = "someone-else";
    write(m, BASE_LEDGER);
    const after = digestOf("alpha");
    write(m, `${BASE_LEDGER}\n- alpha ${SHA_A.slice(0, 12)} sel:${after} moved to someone-else/skills; bytes re-read.\n`);
    const result = runCheck();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[recorded]");
  });

  it("fails a same-location retarget of a file blob sha", () => {
    const m = baseManifest();
    m.sources[0]!.skills[0]!.files[0]!.sha = blob("c");
    write(m, BASE_LEDGER);
    expect(check()).toBe(1);
  });
});
