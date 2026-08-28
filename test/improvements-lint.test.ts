import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { parseFinding, renderIndex, UPSTREAM_TITLE_MAX, UPSTREAM_TITLE_MIN, upstreamTitleError } from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const FIXTURE_ROOT = path.join(ROOT, "tmp");
mkdirSync(FIXTURE_ROOT, { recursive: true });

describe("upstreamTitle contract (unit)", () => {
  test("cap constants are the filing gate's numbers", () => {
    // The brief's contract is 20-120; the filer and the lint must read the same constants.
    expect(UPSTREAM_TITLE_MIN).toBe(20);
    expect(UPSTREAM_TITLE_MAX).toBe(120);
  });

  test("errors when the title is too short or too long (trimmed)", () => {
    expect(upstreamTitleError({ status: "verified", upstreamTitle: "x".repeat(19) })).toMatch(/20-120 characters \(got 19\)/);
    expect(upstreamTitleError({ status: "verified", upstreamTitle: "x".repeat(121) })).toMatch(/20-120 characters \(got 121\)/);
    // Trimming counts: padding must not smuggle a too-short title past the cap.
    expect(upstreamTitleError({ status: "verified", upstreamTitle: `  ${"x".repeat(19)}  ` })).toMatch(/got 19/);
  });

  test("accepts the 20 and 120 boundaries after trimming", () => {
    expect(upstreamTitleError({ status: "verified", upstreamTitle: "x".repeat(20) })).toBeNull();
    expect(upstreamTitleError({ status: "verified", upstreamTitle: "x".repeat(120) })).toBeNull();
    expect(upstreamTitleError({ status: "verified", upstreamTitle: ` ${"x".repeat(20)} ` })).toBeNull();
  });

  test("errors when the title is missing at verified with no filed ref", () => {
    expect(upstreamTitleError({ status: "verified", evidence: ["live re-check note"] })).toMatch(
      /upstreamTitle is required at status 'verified'/,
    );
    // A blank title is a missing title.
    expect(upstreamTitleError({ status: "verified", upstreamTitle: "   ", evidence: [] })).toMatch(/required/);
  });

  test("grandfathers post-proposal records whose evidence cites a filed ref", () => {
    const evidence = ["filed upstream: https://github.com/stellar/stellar-docs/issues/1234"];
    for (const status of ["reported-upstream", "declined-upstream", "fixed-upstream"]) {
      expect(upstreamTitleError({ status, evidence })).toBeNull();
    }
    // Also grandfathered at verified — that record already fails the "URL implies filed" rule,
    // but the title rule itself must not stack a second error on it.
    expect(upstreamTitleError({ status: "verified", evidence })).toBeNull();
  });

  test("keeps proposed exempt and a valid title valid", () => {
    expect(upstreamTitleError({ status: "proposed", evidence: [] })).toBeNull();
    expect(
      upstreamTitleError({
        status: "proposed",
        upstreamTitle: "Reject unknown sort values in list_documents",
        evidence: [],
      }),
    ).toBeNull();
  });
});

// The lint script derives its tree from its own location and runs at import, so the wiring is
// proven by spawning a COPY of it over a fixture tree: copied scripts, one fixture finding, an
// intake that covers all five services, and an INDEX.md rendered from the same lib.
function withLintTree<T>(finding: string, body: (run: () => ReturnType<typeof spawnSync>) => T): T {
  const dir = mkdtempSync(path.join(FIXTURE_ROOT, "improvements-lint-test-"));
  try {
    mkdirSync(path.join(dir, "scripts", "lib"), { recursive: true });
    for (const rel of ["improvements-lint.mjs", "improvements-lib.mjs"]) {
      cpSync(path.join(ROOT, "scripts", rel), path.join(dir, "scripts", rel));
    }
    cpSync(path.join(ROOT, "scripts", "lib", "shared.mjs"), path.join(dir, "scripts", "lib", "shared.mjs"));
    mkdirSync(path.join(dir, "improvements", "stellar-docs"), { recursive: true });
    const relFinding = "improvements/stellar-docs/sd-998-lint-fixture.md";
    writeFileSync(path.join(dir, relFinding), finding);
    writeFileSync(
      path.join(dir, "improvements", "intake.json"),
      JSON.stringify({
        services: {
          skills: { repo: "stellar/stellar-dev-skill" },
          "stellar-light-scout": { repo: "Stellar-Light/stellarlight" },
          "stellar-docs": { repo: "stellar/stellar-docs" },
          lumenloop: { repo: "lumenloop/lumenloop-backend" },
          "workers-ai-provider": { repo: "cloudflare/ai" },
        },
        findings: {},
      }),
    );
    writeFileSync(path.join(dir, "improvements", "resolved.json"), JSON.stringify({ entries: [] }));
    // INDEX.md must byte-match the rendered index or an unrelated staleness error fires first.
    writeFileSync(path.join(dir, "improvements", "INDEX.md"), renderIndex([parseFinding(path.join(dir, relFinding))]));
    const run = () =>
      spawnSync(process.execPath, ["scripts/improvements-lint.mjs"], { cwd: dir, encoding: "utf8" });
    return body(run);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function fixtureFinding(frontmatter: string): string {
  return `---
id: sd-998
service: stellar-docs
${frontmatter}
---

## Finding

A fixture record exercising the lint rule under test.

## Recommendation

Fix the upstream surface.
`;
}

describe("improvements lint wiring", { timeout: 30_000 }, () => {
  test("flags a verified record with no filed ref and no upstreamTitle", () => {
    withLintTree(
      fixtureFinding(`status: verified
discovered: 2026-08-28
evidence:
  - live re-check note`),
      (run) => {
        const result = run();
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("upstreamTitle is required at status 'verified'");
        expect(result.stderr).toContain("improvements lint failed (1)");
      },
    );
  });

  test("flags an out-of-cap upstreamTitle", () => {
    withLintTree(
      fixtureFinding(`status: verified
discovered: 2026-08-28
upstreamTitle: ${"x".repeat(121)}
evidence:
  - live re-check note`),
      (run) => {
        const result = run();
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("upstreamTitle must be 20-120 characters (got 121)");
        expect(result.stderr).toContain("improvements lint failed (1)");
      },
    );
  });

  test("grandfathers a reported-upstream record filed before the field existed", () => {
    withLintTree(
      fixtureFinding(`status: reported-upstream
discovered: 2026-07-14
evidence:
  - filed upstream: https://github.com/stellar/stellar-docs/issues/1234`),
      (run) => {
        const result = run();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("improvements lint ok (1 findings");
        expect(result.stderr).not.toContain("upstreamTitle");
      },
    );
  });
});
