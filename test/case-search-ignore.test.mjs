/**
 * The `.ignore` layout that keeps case-bearing paths out of a recursive ripgrep (eval/qa/README.md,
 * "Held-out split"). The layout test pins each file's exact entries, so adding or dropping a path is
 * a reviewed change. The behavior test runs real ripgrep over a canary tree that carries copies of
 * the three files; it prints paths and never file content. It skips locally when `rg` is not on
 * PATH and fails when `CI` is set, so the layout is exercised where it is enforced.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..");

const IGNORE_FILES = {
  "eval/.ignore": ["/corpus/", "/holdout-cases.json", "/protocol-history-blind-cases.json", "/protocol-history-blind-cases-v2.json"],
  "eval/qa/.ignore": [
    "/corpus/",
    "/reviewed/",
    "/results/",
    "/cases.json",
    "/sample.json",
    "/tool-cases.json",
    "/consistency-register.json",
    "/source-sentinels.json",
  ],
  ".agents/rounds/.ignore": ["/2026-11-02-golden-audit/", "/2026-11-14-golden-coverage-audit/"],
};

function entries(file) {
  return readFileSync(join(REPO, file), "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.startsWith("#"));
}

describe("case-search .ignore layout", () => {
  for (const [file, expected] of Object.entries(IGNORE_FILES)) {
    it(`${file} lists exactly the pinned entries, each anchored to one component`, () => {
      expect(entries(file)).toEqual(expected);
      for (const entry of expected) expect(entry).toMatch(/^\/[A-Za-z0-9._-]+\/?$/);
    });

    it(`${file} entries exist in the tree or are git-ignored`, () => {
      for (const entry of expected) {
        const path = join(dirname(file), entry.slice(1));
        if (existsSync(join(REPO, path))) continue;
        // A folder that is absent from a fresh checkout (eval/qa/results/) must be git-ignored.
        // Ask with the trailing slash: without it `git check-ignore` does not match a missing folder.
        expect(entry.endsWith("/"), `${path} is missing and is not a folder entry`).toBe(true);
        const ignored = spawnSync("git", ["check-ignore", "-q", path], { cwd: REPO });
        expect(ignored.status, `${path} is neither present nor git-ignored`).toBe(0);
      }
    });
  }
});

const probe = spawnSync("rg", ["--version"], { encoding: "utf8" });
const hasRg = probe.status === 0;
if (!hasRg && !process.env.CI) {
  console.warn("case-search .ignore behavior test skipped: ripgrep (rg) is not on PATH; CI installs it and fails without it");
}

describe("case-search .ignore behavior under ripgrep", () => {
  const root = mkdtempSync(join(tmpdir(), "case-search-ignore-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const write = (path) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), "CANARY\n");
  };
  const hidden = [];
  const visible = ["eval/visible.md", "eval/qa/visible.md", ".agents/visible.md", ".agents/rounds/visible.md", "eval/discovery/visible.md"];
  for (const [file, list] of Object.entries(IGNORE_FILES)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), readFileSync(join(REPO, file)));
    for (const entry of list) {
      const path = join(dirname(file), entry.slice(1));
      const target = entry.endsWith("/") ? join(path, "canary.json") : path;
      write(target);
      hidden.push(target);
    }
  }
  for (const path of visible) write(path);
  spawnSync("git", ["init", "-q"], { cwd: root });

  // Paths the search printed, relative to the canary root.
  function search(cwd, flags, path) {
    const run = spawnSync("rg", ["-l", ...flags, "CANARY", path], {
      cwd: join(root, cwd),
      encoding: "utf8",
      env: { ...process.env, RIPGREP_CONFIG_PATH: "" },
    });
    expect(run.status === 0 || run.status === 1, "rg failed").toBe(true);
    return run.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => join(cwd, line).replace(/^\.\//, ""));
  }

  const scopes = [
    { cwd: ".", path: "." },
    { cwd: ".", path: "eval" },
    { cwd: ".", path: "eval/qa" },
    { cwd: ".", path: ".agents" },
    { cwd: ".", path: ".agents/rounds" },
    { cwd: "eval", path: "." },
    { cwd: "eval/qa", path: "." },
    { cwd: ".agents", path: "." },
    { cwd: ".agents/rounds", path: "." },
  ];

  it.skipIf(!hasRg && !process.env.CI)("prints no ignored path from any scope, with and without --hidden", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    for (const flags of [[], ["--hidden", "-g", "!.git"]]) {
      for (const scope of scopes) {
        const found = search(scope.cwd, flags, scope.path);
        for (const path of hidden) {
          expect(found.includes(path), `${path} printed from ${scope.cwd} (${scope.path}) with [${flags.join(" ")}]`).toBe(false);
        }
      }
    }
  });

  it.skipIf(!hasRg && !process.env.CI)("still searches the visible files next to the ignored paths", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    const found = search(".", ["--hidden", "-g", "!.git"], ".");
    for (const path of visible) expect(found).toContain(path);
  });

  it.skipIf(!hasRg && !process.env.CI)("searches an ignored path named explicitly", () => {
    expect(hasRg, "ripgrep must be installed in CI").toBe(true);
    for (const path of hidden) expect(search(".", [], path)).toEqual([path]);
  });
});
