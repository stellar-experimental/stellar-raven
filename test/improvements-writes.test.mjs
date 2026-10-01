import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { parseFinding, renderIndex, writeFindingFrontmatter, writeIndex } from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const fixtures = [];
const issueUrl = "https://github.com/stellar/stellar-docs/issues/4242";
const findingRelative = "improvements/stellar-docs/sd-995-write-fixture.md";

afterEach(() => {
  for (const directory of fixtures.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function fixture(status = "verified") {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "improvements-writes-")));
  fixtures.push(root);
  const at = (relative) => path.join(root, relative);
  for (const directory of ["scripts/lib", "improvements/stellar-docs", "bin", "tmp", "subdirectory"]) {
    mkdirSync(at(directory), { recursive: true });
  }
  for (const name of ["improvements-lib.mjs", "improvements-index.mjs", "improvements-file-issue.mjs", "improvements-resolve.mjs", "lib/shared.mjs"]) {
    cpSync(path.join(ROOT, "scripts", name), at(`scripts/${name}`));
  }
  const file = at(findingRelative);
  writeFileSync(file, `---
id: sd-995
service: stellar-docs
status: ${status}
discovered: 2026-08-13
upstreamTitle: Exercise the tracked local write path after filing
evidence:
  - isolated write fixture
---

## Finding

The local write must stay atomic.

## Evidence

Fixture.

## Recommendation

Keep the write order recoverable.
`);
  writeFileSync(at("improvements/intake.json"), JSON.stringify({ findings: { "sd-995": { repo: "stellar/stellar-docs" } } }));
  writeFileSync(at("improvements/resolved.json"), JSON.stringify({ entries: [] }));
  writeFileSync(at("improvements/INDEX.md"), "old index\n");
  writeFileSync(at("bin/gh"), `#!${process.execPath}
import { appendFileSync } from "node:fs";
const args = process.argv.slice(2);
appendFileSync(process.env.STUB_CALLS, args.slice(0, 2).join(" ") + "\\n");
if (args[0] === "label") console.log("0");
else if (args[0] === "issue" && args[1] === "create") console.log(${JSON.stringify(issueUrl)});
else if (args[0] === "issue" && args[1] === "view") {
  if (process.env.FAIL_READBACK) process.exit(1);
  console.log(${JSON.stringify(issueUrl)});
} else { console.error("STUB_GH_UNEXPECTED"); process.exit(42); }
`, { mode: 0o755 });
  writeFileSync(at("bin/git"), `#!${process.execPath}
import { readFileSync } from "node:fs";
if (process.argv[2] === "log") console.log("a".repeat(40));
else if (process.argv[2] === "show") process.stdout.write(readFileSync(process.env.STUB_FINDING));
else { console.error("STUB_GIT_UNEXPECTED"); process.exit(42); }
`, { mode: 0o755 });
  writeFileSync(at("fail-write.mjs"), `import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
const rename = fs.renameSync;
const unlink = fs.unlinkSync;
fs.renameSync = (from, to) => {
  if (to === process.env.FAIL_RENAME) throw new Error("injected rename failure");
  return rename(from, to);
};
fs.unlinkSync = (file) => {
  if (file === process.env.FAIL_UNLINK) throw new Error("injected unlink failure");
  return unlink(file);
};
syncBuiltinESMExports();
`);
  function run(script, args = [], options = {}) {
    const result = spawnSync(process.execPath, ["--import", at("fail-write.mjs"), at(`scripts/${script}`), ...args], {
      cwd: options.subdirectory ? at("subdirectory") : root,
      encoding: "utf8",
      env: {
        PATH: at("bin"), TMPDIR: at("tmp"), STUB_FINDING: file, STUB_CALLS: at("gh-calls"),
        ...options.env
      }
    });
    expect(result.error).toBeUndefined();
    expect(result.stderr).not.toMatch(/STUB_(GH|GIT)_UNEXPECTED/);
    return result;
  }
  const fileIssue = (options) => run("improvements-file-issue.mjs", ["--file", file, "--repo", "stellar/stellar-docs"], options);
  const resolve = (options) => run("improvements-resolve.mjs", [
    "--file", file, "--repo", "stellar/stellar-docs", "--resolved", "2026-08-14",
    "--live-recheck", "fixture recheck", "--review-evidence", "fixture review",
    "--references-reviewed", "--upstream-comment-na"
  ], options);
  return { at, file, run, fileIssue, resolve };
}

function readJson(file) { return JSON.parse(readFileSync(file, "utf8")); }

function expectNoTemporaryFiles(f) {
  expect(readdirSync(f.at("improvements")).sort()).toEqual(["INDEX.md", "intake.json", "resolved.json", "stellar-docs"]);
  expect(readdirSync(f.at("improvements/stellar-docs"))).toEqual(existsSync(f.file) ? [path.basename(f.file)] : []);
}

describe("improvements index writes", () => {
  test("writeIndex emits renderIndex bytes and reports the finding count", () => {
    const f = fixture();
    const findings = [parseFinding(f.file)];
    const output = f.at("direct-index.md");
    expect(writeIndex(findings, output)).toBe(1);
    expect(readFileSync(output, "utf8")).toBe(renderIndex(findings));
  });

  test("the isolated entrypoint writes the index and is deterministic", () => {
    const f = fixture();
    const result = f.run("improvements-index.mjs");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/wrote improvements\/INDEX.md \(1 findings\)/);
    const first = readFileSync(f.at("improvements/INDEX.md"), "utf8");
    expect(first).toContain("sd-995");
    expect(f.run("improvements-index.mjs").status).toBe(0);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe(first);
    expectNoTemporaryFiles(f);
  });

  test("the committed index matches an isolated rebuild of the current findings", () => {
    const f = fixture();
    rmSync(f.at("improvements"), { recursive: true });
    cpSync(path.join(ROOT, "improvements"), f.at("improvements"), { recursive: true });
    const committed = readFileSync(path.join(ROOT, "improvements/INDEX.md"), "utf8");
    const result = f.run("improvements-index.mjs");
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe(committed);
  });

  test("writeIndex replaces atomically and cleans up a failed replacement", () => {
    const f = fixture();
    const findings = [parseFinding(f.file)];
    const directory = f.at("atomic");
    mkdirSync(directory);
    const destination = path.join(directory, "INDEX.md");
    writeIndex(findings, destination);
    writeIndex(findings, destination);
    expect(readdirSync(directory)).toEqual(["INDEX.md"]);
    rmSync(destination);
    mkdirSync(destination);
    expect(() => writeIndex(findings, destination)).toThrow();
    expect(statSync(destination).isDirectory()).toBe(true);
    expect(readdirSync(directory)).toEqual(["INDEX.md"]);
  });
});

describe("improvements filing writes and recovery", () => {
  test("frontmatter replacement retains the body without temporary files", () => {
    const f = fixture();
    writeFindingFrontmatter(parseFinding(f.file), { status: "reported-upstream", evidenceAppend: issueUrl });
    expect(readFileSync(f.file, "utf8")).toContain("status: reported-upstream");
    expect(readFileSync(f.file, "utf8")).toContain("## Recommendation");
    expectNoTemporaryFiles(f);
  });

  test("filing records the issue and rebuilds the index", () => {
    const f = fixture();
    const result = f.fileIssue();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe(issueUrl);
    expect(readFileSync(f.file, "utf8")).toContain("status: reported-upstream");
    expect(readFileSync(f.file, "utf8")).toMatch(/upstream issue filed \d{4}-\d{2}-\d{2}:/);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toContain("reported-upstream");
    expect(readFileSync(f.file, "utf8")).toContain(issueUrl);
    expectNoTemporaryFiles(f);
  });

  test.each(["readback", "finding"])("a %s failure preserves the finding and warns about duplicate filing", (boundary) => {
    const f = fixture();
    const before = readFileSync(f.file, "utf8");
    const env = boundary === "readback" ? { FAIL_READBACK: "1" } : { FAIL_RENAME: f.file };
    const result = f.fileIssue({ env });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain(boundary === "readback" ? "read-back failed" : "the local finding was not updated");
    expect(result.stderr).toContain("already exist");
    expect(result.stderr).toContain("Do not re-run this command");
    expect(result.stderr).toContain("files a duplicate");
    expect(result.stderr).toContain(issueUrl);
    expect(result.stderr).toContain("status: reported-upstream");
    expect(result.stderr).toContain("npm run improvements:index");
    expect(readFileSync(f.file, "utf8")).toBe(before);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe("old index\n");
    expectNoTemporaryFiles(f);
  });

  test("an index failure retains the filing and the dedupe guard refuses another issue", () => {
    const f = fixture();
    const result = f.fileIssue({ env: { FAIL_RENAME: f.at("improvements/INDEX.md") } });
    expect(result.status, result.stderr).toBe(1);
    for (const message of ["improvements/INDEX.md was not regenerated", "the finding records it", "dedupe guard refuses another filing", "npm run improvements:index", "npm run improvements:lint"]) {
      expect(result.stderr).toContain(message);
    }
    expect(result.stderr).not.toContain("files a duplicate");
    expect(readFileSync(f.file, "utf8")).toContain(issueUrl);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe("old index\n");
    const calls = readFileSync(f.at("gh-calls"), "utf8");
    expect(f.fileIssue().status).toBe(2);
    expect(readFileSync(f.at("gh-calls"), "utf8")).toBe(calls);
    expectNoTemporaryFiles(f);
  });
});

describe("improvements resolution writes and recovery", () => {
  test("resolution from a subdirectory updates the repo intake, receipt, finding, and index", () => {
    const f = fixture("fixed-upstream");
    const result = f.resolve({ subdirectory: true });
    expect(result.status, result.stderr).toBe(0);
    expect(readJson(f.at("improvements/resolved.json")).entries).toHaveLength(1);
    expect(readJson(f.at("improvements/intake.json")).findings).toEqual({});
    expect(existsSync(f.file)).toBe(false);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).not.toContain("sd-995");
    expect(readdirSync(f.at("subdirectory"))).toEqual([]);
    expectNoTemporaryFiles(f);
  });

  test("a receipt failure leaves every active record intact", () => {
    const f = fixture("fixed-upstream");
    const before = readFileSync(f.file, "utf8");
    const result = f.resolve({ env: { FAIL_RENAME: f.at("improvements/resolved.json") } });
    expect(result.status, result.stderr).toBe(1);
    expect(readJson(f.at("improvements/resolved.json")).entries).toEqual([]);
    expect(readJson(f.at("improvements/intake.json")).findings).toHaveProperty("sd-995");
    expect(readFileSync(f.file, "utf8")).toBe(before);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe("old index\n");
    expectNoTemporaryFiles(f);
  });

  test.each(["intake", "deletion", "index"])("a %s failure preserves the receipt and reports each remaining repair", (boundary) => {
    const f = fixture("fixed-upstream");
    const before = readFileSync(f.file, "utf8");
    const env = boundary === "deletion" ? { FAIL_UNLINK: f.file }
      : { FAIL_RENAME: f.at(`improvements/${boundary === "intake" ? "intake.json" : "INDEX.md"}`) };
    const result = f.resolve({ env });
    expect(result.status, result.stderr).toBe(1);
    const receipts = readJson(f.at("improvements/resolved.json")).entries;
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({ id: "sd-995", resolved: "2026-08-14", sourceCommit: "a".repeat(40) });
    expect(readJson(f.at("improvements/intake.json")).findings).toEqual(boundary === "intake" ? { "sd-995": { repo: "stellar/stellar-docs" } } : {});
    expect(existsSync(f.file)).toBe(boundary !== "index");
    if (boundary !== "index") expect(readFileSync(f.file, "utf8")).toBe(before);
    expect(readFileSync(f.at("improvements/INDEX.md"), "utf8")).toBe("old index\n");
    expect(result.stderr).toContain("Do not re-run the resolver");
    expect(result.stderr).toContain("npm run improvements:index");
    expect(result.stderr).toContain("npm run improvements:lint");
    if (boundary === "intake") {
      expect(result.stderr).toContain("remove the sd-995 override");
      expect(result.stderr).toContain(`active finding ${findingRelative} still exists`);
      expect(result.stderr).toContain(`delete ${findingRelative}`);
    } else if (boundary === "deletion") {
      expect(result.stderr).toContain("was not deleted");
      expect(result.stderr).toContain(`delete ${findingRelative}`);
    } else {
      expect(result.stderr).toContain("improvements/INDEX.md was not regenerated");
    }
    // Restore the retired input only to reach the receipt dedupe guard on a second invocation.
    if (!existsSync(f.file)) writeFileSync(f.file, before);
    const retry = f.resolve();
    expect(retry.status).toBe(2);
    expect(retry.stderr).toContain("already exists in improvements/resolved.json");
    expectNoTemporaryFiles(f);
  });
});
