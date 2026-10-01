import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
const names = ["MANIFEST.json", "catalog.json", "community.json", "INDEX.md"];
let root;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

function swap(fail) {
  root = mkdtempSync(join(tmpdir(), "skills-swap-"));
  const target = join(root, "target");
  const stage = join(root, "stage");
  mkdirSync(target);
  mkdirSync(stage);
  for (const name of names) {
    writeFileSync(join(target, name), `old ${name}`);
    writeFileSync(join(stage, name), `new ${name}`);
  }
  const update = readFileSync(join(REPO, "ecosystem-skills", "update.sh"), "utf8");
  const swapCode = update.slice(update.indexOf("# --- Swap:"), update.indexOf('\necho "Pinned ${TOTAL_SKILLS}'));
  const harness = join(root, "swap.sh");
  writeFileSync(harness, `
    set -euo pipefail
    SCRIPT_DIR=$1 WORK=$2 FAIL_SWAP=$3
    MANIFEST="$SCRIPT_DIR/MANIFEST.json" CATALOG="$SCRIPT_DIR/catalog.json"
    COMMUNITY="$SCRIPT_DIR/community.json" INDEX="$SCRIPT_DIR/INDEX.md"
    MANIFEST_TMP="$WORK/MANIFEST.json" CATALOG_TMP="$WORK/catalog.json"
    COMMUNITY_TMP="$WORK/community.json" INDEX_TMP="$WORK/INDEX.md"
    mv() {
      if [ "$FAIL_SWAP" = yes ] && [ "$#" -eq 3 ] && [ "$2" = "$SWAP_DIR/community.json" ] && [ "$3" = "$COMMUNITY" ]; then
        return 23
      fi
      /bin/mv "$@"
    }
    ${swapCode}
  `);
  return { target, stage, result: spawnSync("/bin/bash", [harness, target, stage, fail ? "yes" : "no"], { encoding: "utf8" }) };
}

describe("skill update staged swap", () => {
  it("replaces all four artifacts after validation", () => {
    const { target, stage, result } = swap(false);
    expect(result.status, result.stderr).toBe(0);
    for (const name of names) expect(readFileSync(join(target, name), "utf8")).toBe(`new ${name}`);
    expect(existsSync(stage)).toBe(false);
  });

  it("restores all four artifacts when the Community rename fails", () => {
    const { target, stage, result } = swap(true);
    expect(result.status).toBe(23);
    expect(result.stderr).toContain("restoring the previous pins, directories, and index");
    for (const name of names) expect(readFileSync(join(target, name), "utf8")).toBe(`old ${name}`);
    expect(existsSync(stage)).toBe(false);
  });
});
