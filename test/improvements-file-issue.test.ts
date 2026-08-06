import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { escapesRepo } from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

// Fixtures live inside the repo, not in os.tmpdir(). The filer refuses to post a finding that
// resolves outside the repository, so an out-of-tree fixture would be blocked by THAT gate before
// reaching the guard a given test is actually exercising — every "did not reach filing" assertion
// below would then pass even if its own guard were deleted. `tmp/` is already gitignored.
const FIXTURE_ROOT = path.join(ROOT, "tmp");
mkdirSync(FIXTURE_ROOT, { recursive: true });

// These two assertions are about the TEMPLATE, not about any particular finding, so they run
// against a fixture. Pointing them at a live finding file coupled the suite to the improvements
// queue: retiring that finding — the normal, expected end of its lifecycle — turned the build red
// for a reason that had nothing to do with the template.
function withFixtureFinding<T>(body: (findingPath: string) => T): T {
  const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-template-test-"));
  try {
    const finding = path.join(dir, "sd-998-template-fixture.md");
    writeFileSync(
      finding,
      `---
id: sd-998
service: stellar-docs
status: verified
discovered: 2026-07-14
upstreamTitle: Correct multi-entry ExtendFootprintTTLOp guidance
evidence:
  - isolated template fixture
---

## Finding

A reader-first upstream title must become the issue heading.

## Recommendation

Use the upstreamTitle, never the bare finding id.
`,
    );
    return body(finding);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("improvements issue filing template", () => {
  test("uses an explicit reader-first upstream title for an unreported finding", () => {
    const output = withFixtureFinding((finding) =>
      execFileSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          finding,
          "--repo",
          "stellar/stellar-docs",
          "--dry-run",
        ],
        { cwd: ROOT, encoding: "utf8" },
      ),
    );

    expect(output).toMatch(/^# Correct multi-entry ExtendFootprintTTLOp guidance$/m);
    expect(output).not.toMatch(/^# sd-998:/m);
  });

  test("opens with a visible automation disclaimer and durable marker", () => {
    const output = withFixtureFinding((finding) =>
      execFileSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          finding,
          "--repo",
          "stellar/stellar-docs",
          "--dry-run",
        ],
        { cwd: ROOT, encoding: "utf8" },
      ),
    );

    const marker = "<!-- generated-by-stellar-raven -->";
    const notice =
      "This issue was filed from [Stellar Raven](https://github.com/stellar-experimental/stellar-raven)'s automated evaluation pipeline. Evidence and a public source record are included below. The finding may still be incomplete or incorrect — please verify against the live surface before acting on it.";
    expect(output).toContain(`> **Automated notice:** ${notice}`);
    // The disclosure is the first thing in the body, above every substantive section.
    expect(output).toMatch(
      new RegExp(`^# [^\\n]+\\n\\n${marker}\\n\\n> \\[!NOTE\\]\\n> \\*\\*Automated notice:\\*\\* `),
    );
    expect(output.indexOf(marker)).toBeLessThan(output.indexOf("## Finding"));
  });

  // This guards a PUBLIC-WRITE boundary, so the test must never be able to reach real `gh`.
  // A stub `gh` is prepended to PATH: it answers the state query the guard makes and exits 42
  // for anything else, so "did we reach the filing call?" is observable and a regression posts
  // nothing. The first version of this test used --dry-run for the accept case, which exits
  // BEFORE the guard runs and therefore asserted nothing at all.
  function withSuccessorFixture<T>(
    body: (ctx: {
      run: (extra: string[], citedState?: string) => ReturnType<typeof spawnSync>;
      findingPath: string;
      stubPath: string;
    }) => T,
  ): T {
    const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-successor-test-"));
    try {
      const bin = path.join(dir, "bin");
      mkdirSync(bin);
      writeFileSync(
        path.join(bin, "gh"),
        `#!/bin/sh
# stub gh: answer the successor state probe, refuse to do anything else
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then echo "\${STUB_STATE-CLOSED}"; exit 0; fi
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then echo "\${STUB_STATE-CLOSED}"; exit 0; fi
echo "STUB_GH_REACHED_FILING $*" >&2
exit 42
`,
        { mode: 0o755 },
      );
      const finding = path.join(dir, "sd-997-successor.md");
      writeFileSync(
        finding,
        `---
id: sd-997
service: stellar-docs
status: reported-upstream
discovered: 2026-07-14
upstreamTitle: Supersede a closed report that covered something else
evidence:
  - filed upstream: https://github.com/stellar/stellar-docs/issues/1234
---

## Finding

The cited report closed without covering this residual.

## Recommendation

File a successor rather than reopening it.
`,
      );
      const run = (extra: string[], citedState = "CLOSED") =>
        spawnSync(
          process.execPath,
          [
            "scripts/improvements-file-issue.mjs",
            "--file",
            finding,
            "--repo",
            "stellar/stellar-docs",
            ...extra,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_STATE: citedState },
          },
        );
      return body({ run, findingPath: finding, stubPath: `${bin}:${process.env.PATH}` });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  test("a successor filing may only supersede a CLOSED ref the finding cites exactly", () => {
    withSuccessorFixture(({ run, findingPath, stubPath }) => {
      const CITED = "https://github.com/stellar/stellar-docs/issues/1234";

      // reported-upstream still refuses by default — the dedupe guard is the point
      expect(run([]).status).toBe(2);

      // a ref this finding never cited cannot be superseded
      expect(run(["--successor-to", "https://github.com/stellar/stellar-docs/issues/9999"]).status).toBe(2);

      // EXACT ref match: a bare scheme, or a numeric prefix of the cited ref, must not satisfy it
      expect(run(["--successor-to", "https"]).status).toBe(2);
      expect(run(["--successor-to", "https://github.com/stellar/stellar-docs/issues/123"]).status).toBe(2);

      // a cited ref that is still OPEN is a duplicate, not a successor
      expect(run(["--successor-to", CITED], "OPEN").status).toBe(2);

      // FAIL CLOSED: empty or junk state must block. Asserting `!== 0` here is too weak — a
      // fail-open bug reaches the stub and exits 42, which is also non-zero. Assert the guard's
      // own exit code, and that the filing call was never reached.
      for (const junk of ["", "   ", "banana", "OPENISH"]) {
        const blocked = run(["--successor-to", CITED], junk);
        expect(blocked.status).toBe(2);
        expect(blocked.stderr).not.toContain("STUB_GH_REACHED_FILING");
      }

      // a closed ref in a DIFFERENT repo must not authorise a filing into this one
      const crossRepo = spawnSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          findingPath,
          "--repo",
          "stellar/rs-soroban-sdk",
          "--successor-to",
          CITED,
        ],
        { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: stubPath } },
      );
      expect(crossRepo.status).toBe(2);
      expect(crossRepo.stderr).not.toContain("STUB_GH_REACHED_FILING");

      // the accept path: cited + exact + closed + same repo reaches the filing call
      // (stub exits 42, so a regression here still posts nothing)
      const ok = run(["--successor-to", CITED]);
      expect(ok.status).toBe(42);
      expect(ok.stderr).toContain("STUB_GH_REACHED_FILING");
    });
  });

  // Checking only the named ref is not dedupe: once a successor is filed it joins the evidence,
  // so naming the ORIGINAL closed ref again would open a third issue while the second is live.
  test("a finding with any still-open recorded ref cannot file another successor", () => {
    const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-openref-test-"));
    try {
      const bin = path.join(dir, "bin");
      mkdirSync(bin);
      // 4321 is the already-filed successor and is still OPEN; 1234 is the original, closed.
      writeFileSync(
        path.join(bin, "gh"),
        `#!/bin/sh
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then
  case "$3" in *4321) echo OPEN; exit 0 ;; *) echo CLOSED; exit 0 ;; esac
fi
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then echo CLOSED; exit 0; fi
echo "STUB_GH_REACHED_FILING $*" >&2
exit 42
`,
        { mode: 0o755 },
      );
      const finding = path.join(dir, "sd-994-openref.md");
      writeFileSync(
        finding,
        `---
id: sd-994
service: stellar-docs
status: reported-upstream
discovered: 2026-07-14
upstreamTitle: Must not open a third issue while the second is live
evidence:
  - filed upstream: https://github.com/stellar/stellar-docs/issues/1234
  - successor filed: https://github.com/stellar/stellar-docs/issues/4321
---

## Finding

The original closed; a successor is already open.

## Recommendation

Follow up on the open successor, do not file again.
`,
      );
      const result = spawnSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          finding,
          "--repo",
          "stellar/stellar-docs",
          "--successor-to",
          "https://github.com/stellar/stellar-docs/issues/1234",
        ],
        { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("not closed");
      expect(result.stderr).not.toContain("STUB_GH_REACHED_FILING");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // The sibling loop must fail CLOSED too. Blocking only on literal "open" let an UNREADABLE
  // sibling through — a transient gh failure is not evidence that a live report closed.
  test("an unreadable recorded ref blocks a successor rather than being waved through", () => {
    const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-unreadable-test-"));
    try {
      const bin = path.join(dir, "bin");
      mkdirSync(bin);
      // 1234 (the named ref) reads CLOSED; 4321 (the sibling) is unreadable from both endpoints.
      writeFileSync(
        path.join(bin, "gh"),
        `#!/bin/sh
if [ "$2" = "view" ]; then
  case "$3" in *4321) exit 1 ;; *) echo CLOSED; exit 0 ;; esac
fi
echo "STUB_GH_REACHED_FILING $*" >&2
exit 42
`,
        { mode: 0o755 },
      );
      const finding = path.join(dir, "sd-993-unreadable.md");
      writeFileSync(
        finding,
        `---
id: sd-993
service: stellar-docs
status: reported-upstream
discovered: 2026-07-14
upstreamTitle: An unreadable sibling must not authorise a filing
evidence:
  - filed upstream: https://github.com/stellar/stellar-docs/issues/1234
  - successor filed: https://github.com/stellar/stellar-docs/issues/4321
---

## Finding

One recorded ref cannot be read.

## Recommendation

Refuse until it can be.
`,
      );
      const result = spawnSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          finding,
          "--repo",
          "stellar/stellar-docs",
          "--successor-to",
          "https://github.com/stellar/stellar-docs/issues/1234",
        ],
        { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("not closed");
      expect(result.stderr).not.toContain("STUB_GH_REACHED_FILING");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("declined and fixed findings are never re-filable, even with --successor-to", () => {
    for (const status of ["declined-upstream", "fixed-upstream"]) {
      const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-terminal-test-"));
      try {
        const finding = path.join(dir, "sd-996-terminal.md");
        writeFileSync(
          finding,
          `---
id: sd-996
service: stellar-docs
status: ${status}
discovered: 2026-07-14
upstreamTitle: A terminal finding must not be re-filed
evidence:
  - filed upstream: https://github.com/stellar/stellar-docs/issues/1234
---

## Finding

Terminal for filing.

## Recommendation

Do not re-file.
`,
        );
        // Stub `gh` here too. Without it, deleting the guard would send this test to the real
        // `gh issue create` on an authenticated machine — a test that can post a public issue
        // when it regresses is worse than no test. This is the same hazard the successor test
        // above was rewritten to remove; it must not come back through the side door.
        const bin = path.join(dir, "bin");
        mkdirSync(bin);
        writeFileSync(
          path.join(bin, "gh"),
          `#!/bin/sh\necho "STUB_GH_REACHED_FILING $*" >&2\nexit 42\n`,
          { mode: 0o755 },
        );
        const result = spawnSync(
          process.execPath,
          [
            "scripts/improvements-file-issue.mjs",
            "--file",
            finding,
            "--repo",
            "stellar/stellar-docs",
            "--successor-to",
            "https://github.com/stellar/stellar-docs/issues/1234",
          ],
          { cwd: ROOT, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } },
        );
        expect(result.status).toBe(2);
        expect(result.stderr).toContain("not re-filable");
        expect(result.stderr).not.toContain("STUB_GH_REACHED_FILING");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  test("omits an immutable snapshot when no matching committed blob exists", () => {
    const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvement-template-test-"));
    try {
      const finding = path.join(dir, "sd-999-uncommitted.md");
      writeFileSync(finding, `---
id: sd-999
service: stellar-docs
status: verified
discovered: 2026-07-14
upstreamTitle: Describe an uncommitted source record safely
evidence:
  - isolated template fixture
---

## Finding

An uncommitted finding must not link an older immutable blob.

## Evidence

The fixture has no committed blob.

## Recommendation

Keep the main link and omit the immutable snapshot.
`);
      const output = execFileSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          finding,
          "--repo",
          "stellar/stellar-docs",
          "--dry-run",
        ],
        { cwd: ROOT, encoding: "utf8" },
      );

      expect(output).toContain("Public source record:");
      expect(output).not.toContain("Immutable source snapshot:");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // This one genuinely needs a real, committed finding — it asserts the commit-pinned blob URL,
  // which a temp fixture cannot have. So it picks whichever committed finding exists rather than
  // naming one: hardcoding an id re-arms the trap that turned the suite red when sd-019 was
  // retired, and every finding in this directory is expected to be retired eventually.
  test("links the exact source record and gives upstream a resolution handoff", () => {
    const finding = execFileSync(
      "git",
      ["ls-files", "improvements/*/*.md"],
      { cwd: ROOT, encoding: "utf8" },
    )
      .split("\n")
      .filter(Boolean)
      .sort()
      .at(0);
    if (!finding) throw new Error("no committed finding available to exercise blob-URL rendering");
    const output = execFileSync(
      process.execPath,
      ["scripts/improvements-file-issue.mjs", "--file", finding, "--dry-run"],
      { cwd: ROOT, encoding: "utf8" },
    );

    expect(output).toContain("## Source Record");
    expect(output).toContain(`https://github.com/stellar-experimental/stellar-raven/blob/main/${finding}`);
    expect(output).toMatch(new RegExp(`https://github\\.com/stellar-experimental/stellar-raven/blob/[0-9a-f]{40}/${finding}`));
    expect(output).toContain("## Resolution Handoff");
    expect(output).toContain("template=upstream-improvement-ready.yml");
    expect(output).toContain("Raven independently verifies the upstream surface");
    expect(output).toContain("retired to Raven's resolved ledger");
  });
  // The incident this guards: a fixture in os.tmpdir() reached the live `gh issue create` and
  // became stellar/stellar-docs#2716. `path.relative` does not fail on an out-of-tree path, it
  // walks up with `../`, and that string is joined onto a blob URL — so the published source
  // record was a link that could never resolve.
  test("refuses to file a finding that resolves outside the repository", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "improvement-outoftree-test-"));
    try {
      const findingPath = path.join(dir, "sd-996-outside.md");
      writeFileSync(
        findingPath,
        `---
id: sd-996
service: stellar-docs
status: verified
discovered: 2026-08-04
upstreamTitle: Out of tree fixture for the repository path guard
evidence:
  - fixture
---

## Finding

Out of tree.

## Evidence

Fixture.

## Recommendation

Do not file.
`,
      );
      // Stub `gh` so a regression posts nothing and is observable instead.
      const bin = path.join(dir, "bin");
      mkdirSync(bin);
      writeFileSync(path.join(bin, "gh"), `#!/bin/sh\necho "STUB_GH_REACHED_FILING $*" >&2\nexit 42\n`, {
        mode: 0o755,
      });
      const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` };

      const blocked = spawnSync(
        process.execPath,
        ["scripts/improvements-file-issue.mjs", "--file", findingPath, "--repo", "stellar/stellar-docs"],
        { cwd: ROOT, encoding: "utf8", env },
      );
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("resolves outside the repository");
      expect(blocked.stderr).not.toContain("STUB_GH_REACHED_FILING");

      // --dry-run is the deliberate carve-out: it posts nothing, so inspecting the body of an
      // out-of-tree finding stays available.
      const dry = spawnSync(
        process.execPath,
        [
          "scripts/improvements-file-issue.mjs",
          "--file",
          findingPath,
          "--repo",
          "stellar/stellar-docs",
          "--dry-run",
        ],
        { cwd: ROOT, encoding: "utf8", env },
      );
      expect(dry.status).toBe(0);
      expect(dry.stdout).toContain("## Source Record");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  // The gate's predicate, exercised directly. `path.relative` has two out-of-tree shapes and the
  // absolute one is unreachable from a POSIX integration test: it is what Windows returns when the
  // finding sits on another drive letter, where a `..`-only check silently passes.
  test("escapesRepo rejects both out-of-tree shapes and keeps in-tree paths", () => {
    expect(escapesRepo("../var/folders/T/fixture/sd-996.md")).toBe(true);
    expect(escapesRepo("/var/folders/T/fixture/sd-996.md")).toBe(true);

    expect(escapesRepo("improvements/stellar-docs/sd-018-sac-cap67-event-schema-gap.md")).toBe(false);
    // Not `startsWith("..")`: a leading-dots directory name is a repo path, not an escape.
    expect(escapesRepo("..hidden/sd-001.md")).toBe(false);
  });
});
