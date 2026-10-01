import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
const SCRIPT = join(REPO, "ecosystem-skills", "build-index.mjs");
const INDEX = join(REPO, "ecosystem-skills", "INDEX.md");
let dir;

// The real builder, the real groups.json, and a copy of the real manifest whose
// per-skill file lists are emptied: every skill id still resolves (so the
// description-override assertion holds), but nothing is fetched upstream and the
// run stays offline. Output goes to a temp path, never to the committed INDEX.md.
function stagedManifest(mutate = (m) => m) {
  const manifest = JSON.parse(readFileSync(join(REPO, "ecosystem-skills", "MANIFEST.json"), "utf8"));
  for (const src of manifest.sources) for (const skill of src.skills) skill.files = [];
  return mutate(manifest);
}

function stage(manifest) {
  dir = mkdtempSync(join(tmpdir(), "build-index-"));
  writeFileSync(join(dir, "MANIFEST.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, "catalog.json"), JSON.stringify({ source: "https://example.invalid", fetched_at: "2026-01-01T00:00:00Z", entries: [] }));
  writeFileSync(join(dir, "community.json"), JSON.stringify({ source: "https://community.example.invalid", fetched_at: "2026-01-01T00:00:00Z", entries: [{ title: "Staged Community", url: "https://example.invalid/community" }] }));
  return dir;
}

const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: REPO, encoding: "utf8" });
const staged = (extra = []) => run(["--manifest", join(dir, "MANIFEST.json"), "--catalog", join(dir, "catalog.json"), "--community", join(dir, "community.json"), "--out", join(dir, "INDEX.md"), ...extra]);

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("build-index staged inputs and source types", () => {
  it("builds from --manifest/--catalog into --out and leaves the committed index untouched", () => {
    const before = readFileSync(INDEX, "utf8");
    stage(stagedManifest());
    const result = staged();
    expect(result.status, result.stderr).toBe(0);
    const out = readFileSync(join(dir, "INDEX.md"), "utf8");
    expect(out).toContain("## Sources (pinned)");
    expect(out).toContain("`lumenloop/lumenloop-skills`");
    expect(out).toContain("https://example.invalid");
    expect(out).toContain("Staged Community");
    expect(out).toContain("https://community.example.invalid");
    expect(readFileSync(INDEX, "utf8")).toBe(before);
  });

  it("fails closed on a source that is not a public GitHub source, writing nothing", () => {
    stage(stagedManifest((m) => { m.sources[0].type = "lumenloop-archive"; return m; }));
    const result = staged();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`source "${JSON.parse(readFileSync(join(dir, "MANIFEST.json"), "utf8")).sources[0].id}" has type "lumenloop-archive"`);
    expect(() => readFileSync(join(dir, "INDEX.md"))).toThrow();
  });

  it("rejects a path flag without a value", () => {
    stage(stagedManifest());
    const result = run(["--manifest", join(dir, "MANIFEST.json"), "--out"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--out needs a path");
  });
});
