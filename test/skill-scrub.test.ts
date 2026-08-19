import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadSkillTexts } from "../scripts/lib/skill-mirror.mjs";
import { EXCLUDED_SCOUT_PATHS } from "../src/policy/scout-exposure.ts";
import {
  scrubExcludedScoutOperationRefs,
  scrubNonExposedRefs
} from "../src/skills/scrub.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const excludedPath = [...EXCLUDED_SCOUT_PATHS][0]!;

describe("skill-body operation exposure scrub", () => {
  it("removes a heading section that advertises an excluded operation", () => {
    const text = [
      "## Safe",
      "Keep this.",
      `## POST ${excludedPath}`,
      "Remove this complete section.",
      "### Request body",
      "Remove this subsection too.",
      "## Next safe section",
      "Keep this too."
    ].join("\n");

    expect(scrubExcludedScoutOperationRefs(text, "heading fixture")).toBe(
      ["## Safe", "Keep this.", "## Next safe section", "Keep this too."].join("\n")
    );
  });

  it("removes table rows and list items that advertise excluded operations", () => {
    const text = [
      "| Path | Purpose |",
      "| --- | --- |",
      "| `/api/status` | Keep |",
      `| \`${excludedPath}\` | Remove |`,
      "",
      "- Keep this item.",
      `- Call ${excludedPath}.`,
      "  This continuation also goes.",
      "- Keep the last item."
    ].join("\n");

    const scrubbed = scrubExcludedScoutOperationRefs(text, "row fixture");
    expect(scrubbed).toContain("| `/api/status` | Keep |");
    expect(scrubbed).toContain("- Keep this item.");
    expect(scrubbed).toContain("- Keep the last item.");
    expect(scrubbed).not.toContain(excludedPath);
    expect(scrubbed).not.toContain("This continuation also goes.");
  });

  it("fails closed when excluded operation prose is not a removable block", () => {
    expect(() =>
      scrubExcludedScoutOperationRefs(
        `A plain paragraph tells the caller to use ${excludedPath}.`,
        "unsafe prose fixture"
      )
    ).toThrow("survives outside a removable Markdown block");
  });

  it("removes excluded paths from every selected Scout file", async () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "ecosystem-skills", "MANIFEST.json"), "utf8")
    );
    const source = manifest.sources.find((item: { id: string }) => item.id === "stellar-light");
    expect(source).toBeDefined();

    const selected = await loadSkillTexts({ ...manifest, sources: [source] });
    expect(selected.size).toBeGreaterThan(0);
    for (const [key, file] of selected) {
      const scrubbed = scrubNonExposedRefs(file.text, key);
      for (const path of EXCLUDED_SCOUT_PATHS) {
        expect(scrubbed, `${key} retains ${path}`).not.toContain(path);
      }
    }
  });
});
