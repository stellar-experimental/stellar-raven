import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { oneLineTitle } from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

function findNotFixedUpstreamFinding(): string {
  const improvementsDir = path.join(ROOT, "improvements");
  for (const relativePath of readdirSync(improvementsDir, { recursive: true, encoding: "utf8" }).sort()) {
    if (!relativePath.endsWith(".md")) continue;
    const absolutePath = path.join(improvementsDir, relativePath);
    const raw = readFileSync(absolutePath, "utf8");
    const id = raw.match(/^id:\s*(\S+)\s*$/m)?.[1];
    const status = raw.match(/^status:\s*(\S+)\s*$/m)?.[1];
    if (id && status && status !== "fixed-upstream") return path.relative(ROOT, absolutePath);
  }
  throw new Error("expected an active improvements finding whose status is not fixed-upstream");
}

describe("improvements resolution lifecycle", () => {
  test("uses the full first Finding paragraph for wrapped titles", () => {
    expect(oneLineTitle({
      body: "## Finding\n\nA wrapped finding title\ncontinues on the next physical line.\n\nSecond paragraph.\n",
    })).toBe("A wrapped finding title continues on the next physical line");
  });

  test("removes leading blockquote markers from generated titles", () => {
    expect(oneLineTitle({
      body: "## Finding\n\n> **Fixed 2026-08-28.** The source recheck closed the contradiction.\n",
    })).toBe("Fixed 2026-08-28. The source recheck closed the contradiction");
  });

  test("truncates long titles on a word boundary", () => {
    const title = oneLineTitle({ body: `## Finding\n\n${"complete ".repeat(30)}trailing` });
    expect(title.length).toBeLessThanOrEqual(140);
    expect(title).toMatch(/complete…$/);
    expect(title).not.toContain("trailing");
    expect(oneLineTitle({ body: `## Finding\n\n${"x".repeat(141)}` })).toBe("…");
  });

  test("resolved receipt keeps immutable source auditable after active-file deletion", () => {
    const finding = "improvements/skills/sk-001-wasm-target-stale.md";
    const ledger = JSON.parse(readFileSync(path.join(ROOT, "improvements/resolved.json"), "utf8"));
    const entry = ledger.entries.find((candidate: { id: string }) => candidate.id === "sk-001");
    if (!entry) throw new Error("missing sk-001 resolution receipt");

    expect(existsSync(path.join(ROOT, finding))).toBe(false);
    expect(entry.sourceCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(entry.sourceUrl).toBe(
      `https://github.com/stellar-experimental/stellar-raven/blob/${entry.sourceCommit}/${finding}`,
    );
    expect(execFileSync("git", ["show", `${entry.sourceCommit}:${finding}`], {
      cwd: ROOT,
      encoding: "utf8",
    })).toContain("id: sk-001");
  });

  test("refuses to retire a finding before fixed-upstream", () => {
    const finding = findNotFixedUpstreamFinding();
    const result = spawnSync(
      process.execPath,
      [
        "scripts/improvements-resolve.mjs",
        "--file", finding,
        "--live-recheck", "still reproduces",
        "--review-evidence", "reviewed",
        "--references-reviewed",
        "--upstream-commented",
        "--dry-run",
      ],
      { cwd: ROOT, encoding: "utf8" },
    );

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("status must be fixed-upstream before resolution");
  });

  function goneRefFixture(): string {
    const dir = mkdtempSync(path.join(os.tmpdir(), "resolve-gone-"));
    const file = path.join(dir, "cs-900-fixture.md");
    writeFileSync(file, [
      "---",
      "id: cs-900",
      "service: canonical-source",
      "status: fixed-upstream",
      "discovered: 2026-11-02",
      "evidence:",
      "  - upstream issue filed: https://github.com/example-owner/example-repo/issues/7",
      "  - owner reply: https://github.com/example-owner/other-repo/issues/8",
      "---",
      "",
      "## Finding",
      "",
      "Fixture finding.",
      "",
    ].join("\n"));
    return file;
  }

  function resolveFixture(extra: string[]) {
    return spawnSync(
      process.execPath,
      [
        "scripts/improvements-resolve.mjs",
        "--file", goneRefFixture(),
        "--repo", "example-owner/example-repo",
        "--live-recheck", "fixed",
        "--review-evidence", "reviewed",
        "--references-reviewed",
        "--dry-run",
        ...extra,
      ],
      { cwd: ROOT, encoding: "utf8" },
    );
  }

  test("refuses a gone ref that the finding does not record", () => {
    const result = resolveFixture(["--upstream-ref-gone", "https://github.com/example-owner/example-repo/issues/99"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("must be an upstream ref that the finding records");
  });

  test("still requires a comment on every ref that is not gone", () => {
    const result = resolveFixture(["--upstream-ref-gone", "https://github.com/example-owner/example-repo/issues/7"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("pass --upstream-commented");
  });
});
