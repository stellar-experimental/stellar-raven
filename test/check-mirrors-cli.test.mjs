import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
let root;

// Run the real checker against a throwaway tree: the script resolves its root
// from its own location, so a copy under <tmp>/scripts reads <tmp>/ecosystem-skills.
function runChecker(manifest, args = []) {
  root = mkdtempSync(join(tmpdir(), "check-mirrors-"));
  mkdirSync(join(root, "scripts", "lib"), { recursive: true });
  mkdirSync(join(root, "ecosystem-skills"), { recursive: true });
  copyFileSync(join(REPO, "scripts", "check-mirrors.mjs"), join(root, "scripts", "check-mirrors.mjs"));
  copyFileSync(join(REPO, "scripts", "lib", "skill-mirror.mjs"), join(root, "scripts", "lib", "skill-mirror.mjs"));
  writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), JSON.stringify(manifest));
  writeFileSync(join(root, "ecosystem-skills", "groups.json"), JSON.stringify({ groups: [] }));
  writeFileSync(join(root, "ecosystem-skills", "catalog.json"), "{}");
  writeFileSync(join(root, "ecosystem-skills", "INDEX.md"), "");
  return spawnSync(process.execPath, [join(root, "scripts", "check-mirrors.mjs"), ...args], { encoding: "utf8" });
}

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

const malformed = {
  status: "complete",
  skill_count: 0,
  sources: [{ id: "broken", type: "github", owner: "o", repo: "r", commit: "a".repeat(40), license_files: ["LICENSE"], skills: {} }]
};

describe("check-mirrors exit contract", () => {
  it("reports a malformed skills value as a pin problem offline", () => {
    const result = runChecker(malformed);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('ecosystem-skills source "broken" pins no skills');
  });

  it("reports the same pin problem with --fetch instead of crashing", () => {
    const result = runChecker(malformed, ["--fetch"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('ecosystem-skills source "broken" pins no skills');
    expect(result.stderr).not.toContain("could not complete");
  });
});
