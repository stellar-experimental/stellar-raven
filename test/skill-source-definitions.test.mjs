import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readSourceDefinitions, sourceDefinition } from "../scripts/lib/skill-source-definitions.mjs";

const REPO = resolve(import.meta.dirname, "..");
const definitionsPath = join(REPO, "ecosystem-skills", "sources.json");
let dir;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("shared skill source definitions", () => {
  it("preserves every current source's coordinates and pick list", () => {
    const definitions = readSourceDefinitions(definitionsPath);
    const manifest = JSON.parse(readFileSync(join(REPO, "ecosystem-skills", "MANIFEST.json"), "utf8"));
    expect(definitions.map((entry) => entry.id).sort()).toEqual(manifest.sources.map((entry) => entry.id).sort());
    for (const source of manifest.sources) {
      const definition = sourceDefinition(source, definitions);
      if (definition.mode !== "all") expect([...definition.picks].sort()).toEqual(source.skills.map((skill) => skill.name).sort());
    }
  });

  it("passes exact source arguments through update.sh's shell loop", () => {
    dir = mkdtempSync(join(tmpdir(), "skill-definitions-"));
    const script = readFileSync(join(REPO, "ecosystem-skills", "update.sh"), "utf8");
    const loop = script.slice(script.indexOf('node "$SCRIPT_DIR/../scripts/lib/skill-source-definitions.mjs"'), script.indexOf('\nfetch_catalog\n'));
    const harness = join(dir, "harness.sh");
    writeFileSync(harness, `set -euo pipefail\nSCRIPT_DIR=$1\nWORK=$2\npin_github() { printf '%s\\0' "$@"; printf '\\n'; }\n${loop}\n`);
    const result = spawnSync("/bin/bash", [harness, join(REPO, "ecosystem-skills"), dir], { encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const argumentsBySource = result.stdout.trimEnd().split("\n").map((line) => line.split("\0").slice(0, -1));
    expect(argumentsBySource).toEqual(readSourceDefinitions(definitionsPath).map((source) => [source.id, source.owner, source.repo, source.path, source.ref, ...source.picks]));
  });

  it.each([
    { mode: "pick", picks: [] }, { mode: "all", picks: ["one"] }, { mode: "root", path: "skills" },
    { mode: "unknown" }, { picks: ["one two"] }
  ])("rejects inconsistent source definitions: %j", (changes) => {
    dir = mkdtempSync(join(tmpdir(), "skill-definitions-"));
    const path = join(dir, "sources.json");
    writeFileSync(path, JSON.stringify([{ id: "one", owner: "o", repo: "r", path: "skills", ref: "main", mode: "pick", picks: ["one"], ...changes }]));
    expect(() => readSourceDefinitions(path)).toThrow();
  });

  it("rejects a missing or mismatched source definition", () => {
    const source = readSourceDefinitions(definitionsPath)[0];
    expect(() => sourceDefinition(source, [])).toThrow(/no source definition/);
    expect(() => sourceDefinition({ ...source, path: "wrong" }, [source])).toThrow(/path differs/);
  });
});
