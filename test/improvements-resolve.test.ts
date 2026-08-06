import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { oneLineTitle } from "../scripts/improvements-lib.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

describe("improvements resolution lifecycle", () => {
  test("uses the full first Finding paragraph for wrapped titles", () => {
    expect(oneLineTitle({
      body: "## Finding\n\nA wrapped finding title\ncontinues on the next physical line.\n\nSecond paragraph.\n",
    })).toBe("A wrapped finding title continues on the next physical line");
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
    const result = spawnSync(
      process.execPath,
      [
        "scripts/improvements-resolve.mjs",
        "--file", "improvements/skills/sk-003-getledgers-retention-conflict.md",
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
});
