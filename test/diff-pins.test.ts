/**
 * Verifies scripts/diff-pins.mjs prints the full body of newly added pinned files
 * (not just a header), since skill bodies are unvendored and reviewed through this diff.
 */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "ecosystem-skills/MANIFEST.json");

/** A real, small pinned file — the diff has to fetch it from its pinned commit. */
const TARGET = {
  source: "lumenloop",
  skill: "stellar-content-auditor",
  path: "reference/audit-report-template.md",
};

function runDiff(oldManifest: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "diff-pins-"));
  const oldPath = join(dir, "old.json");
  writeFileSync(oldPath, JSON.stringify(oldManifest));
  return execFileSync(process.execPath, [join(ROOT, "scripts/diff-pins.mjs"), oldPath, MANIFEST], {
    encoding: "utf8",
    timeout: 60_000,
  });
}

describe("diff-pins.mjs — the re-pin review gate", () => {
  it("prints the full body of a file that is new since the old pin", async () => {
    const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
    // "Old" manifest = today's, minus one file. That file is then NEW, exactly
    // as it would be after an upstream addition or a rename's incoming half.
    const source = manifest.sources.find((s: { id: string }) => s.id === TARGET.source);
    const skill = source.skills.find((s: { name: string }) => s.name === TARGET.skill);
    skill.files = skill.files.filter((f: { path: string }) => f.path !== TARGET.path);

    const out = runDiff(manifest);
    const key = `${TARGET.source}/${TARGET.skill}/${TARGET.path}`;
    expect(out).toContain(`### NEW ${key}`);
    // The body itself, not just the header: every line of a new file is
    // incoming prompt input and arrives as an addition.
    expect(out).toMatch(new RegExp(`^\\+\\+\\+ b/${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
    expect(out.split("\n").filter((line) => line.startsWith("+ ")).length).toBeGreaterThan(5);
  }, 60_000);

  it("reports no change when both sides are the same pin", () => {
    expect(runDiff(JSON.parse(readFileSync(MANIFEST, "utf8")))).toContain("No skill body changed.");
  }, 60_000);
});
