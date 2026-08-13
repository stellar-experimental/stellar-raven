import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  INDEX_PATH,
  listFindingFiles,
  parseFinding,
  renderIndex,
  writeFindingFrontmatter,
  writeIndex,
} from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

// Fixtures live in the repo's gitignored `tmp/`, not in os.tmpdir(): the filer refuses to post a
// finding that resolves outside the repository, so an out-of-tree fixture would be stopped by THAT
// gate before it reached the post-filing recovery paths these tests exercise.
const FIXTURE_ROOT = path.join(ROOT, "tmp");
mkdirSync(FIXTURE_ROOT, { recursive: true });

const fixtures = [];

afterEach(() => {
  for (const dir of fixtures.splice(0)) {
    // A permission test may have left the directory read-only; restore it so cleanup can run.
    try {
      chmodSync(dir, 0o755);
    } catch {
      // already writable, or already gone
    }
    rmSync(dir, { recursive: true, force: true });
  }
});

function fixtureDir(prefix) {
  const dir = mkdtempSync(path.join(FIXTURE_ROOT, prefix));
  fixtures.push(dir);
  return dir;
}

function writeFixtureFinding(dir, { id = "sd-995", status = "verified", extraEvidence = [] } = {}) {
  const file = path.join(dir, `${id}-write-fixture.md`);
  writeFileSync(
    file,
    `---
id: ${id}
service: stellar-docs
status: ${status}
discovered: 2026-08-13
upstreamTitle: Exercise the tracked local write path after filing
evidence:
  - isolated write fixture
${extraEvidence.map((entry) => `  - ${entry}\n`).join("")}---

## Finding

The local write path must stay atomic and forward-recoverable.

## Evidence

Fixture.

## Recommendation

Keep the write order replayable by hand.
`,
  );
  return file;
}

// A `gh` stub that files "successfully". `$1 $2` selects the sub-command, so the label probe, the
// create, and the read-back are answered separately and the real `gh` is never reachable.
function writeGhStub(dir, { readBack = "https://github.com/stellar/stellar-docs/issues/4242", readBackExit = 0 } = {}) {
  const bin = path.join(dir, "bin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    path.join(bin, "gh"),
    `#!/bin/sh
if [ "$1" = "label" ]; then echo 0; exit 0; fi
if [ "$1" = "issue" ] && [ "$2" = "create" ]; then echo "https://github.com/stellar/stellar-docs/issues/4242"; exit 0; fi
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then echo "${readBack}"; exit ${readBackExit}; fi
echo "STUB_GH_UNEXPECTED $*" >&2
exit 42
`,
    { mode: 0o755 },
  );
  return `${bin}:${process.env.PATH}`;
}

function runFiler(findingPath, stubPath) {
  return spawnSync(
    process.execPath,
    ["scripts/improvements-file-issue.mjs", "--file", findingPath, "--repo", "stellar/stellar-docs"],
    { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: stubPath } },
  );
}

describe("improvements index writes", () => {
  test("writeIndex emits exactly renderIndex bytes and reports the finding count", () => {
    const findings = listFindingFiles().map(parseFinding);
    const dir = fixtureDir("improvement-index-parity-");
    const destination = path.join(dir, "INDEX.md");

    const count = writeIndex(findings, destination);

    expect(count).toBe(findings.length);
    expect(readFileSync(destination, "utf8")).toBe(renderIndex(findings));
    // The committed index is the same bytes, so the direct call and the entrypoint agree.
    expect(readFileSync(destination, "utf8")).toBe(readFileSync(INDEX_PATH, "utf8"));
  });

  test("the index entrypoint and a direct writeIndex call produce identical bytes", () => {
    const before = readFileSync(INDEX_PATH, "utf8");
    const output = execFileSync(process.execPath, ["scripts/improvements-index.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });

    expect(output).toMatch(/^wrote improvements\/INDEX\.md \(\d+ findings\)$/m);
    expect(readFileSync(INDEX_PATH, "utf8")).toBe(before);
  });

  test("writeIndex replaces atomically and leaves no temporary sibling", () => {
    const findings = listFindingFiles().map(parseFinding);
    const dir = fixtureDir("improvement-index-atomic-");
    const destination = path.join(dir, "INDEX.md");

    writeIndex(findings, destination);
    writeIndex(findings, destination);
    expect(readdirSync(dir)).toEqual(["INDEX.md"]);

    // A destination that cannot be replaced must fail loudly and clean up after itself, rather
    // than leaving a half-written index or a stray temporary file for the next command to read.
    const blocked = path.join(dir, "blocked");
    mkdirSync(blocked);
    const blockedIndex = path.join(blocked, "INDEX.md");
    mkdirSync(blockedIndex);
    expect(() => writeIndex(findings, blockedIndex)).toThrow();
    expect(statSync(blockedIndex).isDirectory()).toBe(true);
    expect(readdirSync(blocked)).toEqual(["INDEX.md"]);
  });

  // The regeneration is a direct call now. A subprocess would report only an exit code, so the
  // operator-facing failure text below could not name what actually broke.
  test("no improvements script re-spawns the index entrypoint", () => {
    for (const script of ["improvements-file-issue.mjs", "improvements-resolve.mjs"]) {
      const source = readFileSync(path.join(ROOT, "scripts", script), "utf8");
      expect(source).not.toContain("improvements-index.mjs");
      expect(source).toContain("writeIndex(");
    }
  });

  // CWD-independence: the resolver used to compute the intake path from process.cwd(), so running
  // it from a subdirectory wrote (or failed to find) the wrong file.
  test("the resolver addresses intake through the exported repo-anchored path", () => {
    const source = readFileSync(path.join(ROOT, "scripts", "improvements-resolve.mjs"), "utf8");
    expect(source).toContain("INTAKE_PATH");
    expect(source).not.toContain('path.resolve("improvements/intake.json")');
    expect(source).not.toContain("writeFileSync(");
  });
});

describe("improvements finding writes", () => {
  test("writeFindingFrontmatter replaces atomically and leaves no temporary sibling", () => {
    const dir = fixtureDir("improvement-frontmatter-atomic-");
    const file = writeFixtureFinding(dir);

    writeFindingFrontmatter(parseFinding(file), {
      status: "reported-upstream",
      evidenceAppend: "upstream issue filed 2026-08-13: https://github.com/stellar/stellar-docs/issues/4242",
    });

    const updated = readFileSync(file, "utf8");
    expect(updated).toContain("status: reported-upstream");
    expect(updated).toContain(
      "  - upstream issue filed 2026-08-13: https://github.com/stellar/stellar-docs/issues/4242",
    );
    expect(updated).toContain("## Recommendation");
    expect(readdirSync(dir)).toEqual([path.basename(file)]);
  });

  test("a failed frontmatter write leaves the finding byte-identical", () => {
    if (process.getuid?.() === 0) return; // root ignores the directory mode this case depends on
    const dir = fixtureDir("improvement-frontmatter-fail-");
    const file = writeFixtureFinding(dir);
    const before = readFileSync(file, "utf8");
    const finding = parseFinding(file);

    chmodSync(dir, 0o555);
    expect(() => writeFindingFrontmatter(finding, { status: "reported-upstream" })).toThrow();
    chmodSync(dir, 0o755);

    expect(readFileSync(file, "utf8")).toBe(before);
    expect(readdirSync(dir)).toEqual([path.basename(file)]);
  });
});

// Everything here runs after `gh issue create` has already exited 0, so an issue exists upstream.
// The messages must say that and must not invite a re-run, which is what files a duplicate.
describe("improvements filing recovery text", { timeout: 30_000 }, () => {
  test("a filing regenerates the index in-process and records the issue", () => {
    const dir = fixtureDir("improvement-filed-ok-");
    const file = writeFixtureFinding(dir);
    const indexBefore = readFileSync(INDEX_PATH, "utf8");

    const result = runFiler(file, writeGhStub(dir));

    expect(result.stderr).not.toContain("STUB_GH_UNEXPECTED");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("https://github.com/stellar/stellar-docs/issues/4242");

    const updated = readFileSync(file, "utf8");
    expect(updated).toContain("status: reported-upstream");
    expect(updated).toMatch(
      /- upstream issue filed \d{4}-\d{2}-\d{2}: https:\/\/github\.com\/stellar\/stellar-docs\/issues\/4242/,
    );
    // The fixture is not under improvements/, so the regenerated index must be unchanged bytes.
    expect(readFileSync(INDEX_PATH, "utf8")).toBe(indexBefore);
  });

  test("a failed read-back reports the possible issue and forbids a re-run", () => {
    const dir = fixtureDir("improvement-readback-fail-");
    const file = writeFixtureFinding(dir);
    const before = readFileSync(file, "utf8");

    const result = runFiler(file, writeGhStub(dir, { readBack: "", readBackExit: 1 }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("read-back failed");
    expect(result.stderr).toContain("may already exist upstream");
    expect(result.stderr).toContain("Do not re-run this command");
    expect(result.stderr).toContain("files a duplicate");
    // The forward repair must be actionable: the URL, the file, the field, and the follow-up command.
    expect(result.stderr).toContain("https://github.com/stellar/stellar-docs/issues/4242");
    expect(result.stderr).toContain("status: reported-upstream");
    expect(result.stderr).toContain("npm run improvements:index");
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  test("a failed local write reports the filed issue and forbids a re-run", () => {
    if (process.getuid?.() === 0) return; // root ignores the directory mode this case depends on
    const dir = fixtureDir("improvement-localwrite-fail-");
    const file = writeFixtureFinding(dir);
    const before = readFileSync(file, "utf8");
    const stubPath = writeGhStub(dir);

    // The stub lives under this directory, so read+execute must survive the mode change.
    chmodSync(dir, 0o555);
    const result = runFiler(file, stubPath);
    chmodSync(dir, 0o755);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("the local finding was not updated");
    expect(result.stderr).toContain("already exists upstream");
    expect(result.stderr).toContain("Do not re-run this command");
    expect(result.stderr).toContain("files a duplicate");
    expect(result.stderr).toContain("previous content");
    expect(result.stderr).toContain("npm run improvements:index");
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  // The three post-filing branches must not warn identically, because they do not carry the same
  // risk. Read-back and frontmatter failures leave local state with no record of the issue, so a
  // re-run really would file a duplicate. The index failure happens AFTER the frontmatter recorded
  // the issue, so the finding is already reported-upstream and the dedupe guard refuses another
  // filing — telling the operator a re-run files a duplicate there would be untrue.
  //
  // The index branch cannot be forced without mutating the tracked improvements tree, so its
  // contract is asserted on the message itself.
  test("the index-failure message is truthful and asks only for the index repair", () => {
    const source = readFileSync(path.join(ROOT, "scripts", "improvements-file-issue.mjs"), "utf8");
    const branch = source.slice(
      source.indexOf("try {\n  writeIndex();"),
      source.indexOf("function renderBody"),
    );

    expect(branch).toContain("improvements/INDEX.md was not regenerated");
    expect(branch).toContain("the finding records it");
    expect(branch).toContain("a re-run is unnecessary");
    expect(branch).toContain("dedupe guard refuses another filing");
    expect(branch).toContain("npm run improvements:index");
    expect(branch).toContain("npm run improvements:lint");
    // The claim that must not appear here: the finding already records the issue.
    expect(branch).not.toContain("files a duplicate");
    expect(branch).not.toContain("Do not re-run this command");
  });

  test("the branches before the local write keep the stronger duplicate warning", () => {
    const source = readFileSync(path.join(ROOT, "scripts", "improvements-file-issue.mjs"), "utf8");
    // Read-back failure and frontmatter failure, in order, up to the index branch.
    const branches = source.slice(
      source.indexOf("const verify = spawnSync"),
      source.indexOf("try {\n  writeIndex();"),
    );

    expect(branches.match(/Do not re-run this command/g)).toHaveLength(2);
    expect(branches.match(/files a duplicate/g)).toHaveLength(2);
  });

  // The intake write is the FIRST step after the receipt lands, so its failure leaves the widest
  // residue: the receipt exists, but the override and the active finding both still describe the
  // finding as open. The repair therefore needs four parts, not two. Like the other post-receipt
  // branches, it cannot be forced without mutating the tracked improvements tree, so the contract
  // is asserted on the message itself.
  test("the resolver's intake-write failure names the receipt, both residues, and the full repair", () => {
    const source = readFileSync(path.join(ROOT, "scripts", "improvements-resolve.mjs"), "utf8");
    const branch = source.slice(
      source.indexOf("if (intake.findings?.[id])"),
      source.indexOf("try {\n  unlinkSync(finding.file);"),
    );

    // State: the receipt landed, and both later steps are still outstanding.
    expect(branch).toContain("the resolved receipt is written");
    expect(branch).toContain("improvements/intake.json still holds this finding's override");
    expect(branch).toContain("the active finding ${finding.relPath} still exists");
    // A re-run is refused, so the operator must not be sent back to the resolver.
    expect(branch).toContain("Do not re-run the resolver");
    expect(branch).toContain("refuses a receipt that already exists");
    // The forward repair: clear the override, delete the finding, then regenerate and lint.
    expect(branch).toContain("remove the ${id} override from improvements/intake.json");
    expect(branch).toContain("delete ${finding.relPath}");
    expect(branch).toContain("npm run improvements:index");
    expect(branch).toContain("npm run improvements:lint");
  });

  test("the resolver's post-receipt failures refuse a re-run and give the repair", () => {
    const source = readFileSync(path.join(ROOT, "scripts", "improvements-resolve.mjs"), "utf8");
    const branch = source.slice(source.indexOf("try {\n  unlinkSync(finding.file);"));
    expect(branch).toContain("was not deleted");
    expect(branch).toContain("improvements/INDEX.md was not regenerated");
    expect(branch.match(/Do not re-run the resolver/g)).toHaveLength(2);
    expect(branch.match(/npm run improvements:index/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
