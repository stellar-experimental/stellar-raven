import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../scripts/lib/skill-markdown.mjs";
import {
  SKILL_DESCRIPTION_OVERRIDES,
  assertSkillDescriptionOverrideIdsResolve,
  skillDescription
} from "../scripts/description-notes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("skill Markdown frontmatter", () => {
  it("folds a YAML scalar without retaining its marker", () => {
    const parsed = parseFrontmatter(`---\nname: example\ndescription: >\n  Use when one line\n  continues on another.\n\n  Keep the next paragraph.\n---\n# Body\n`);

    expect(parsed.attrs).toEqual({
      name: "example",
      description: "Use when one line continues on another.\nKeep the next paragraph."
    });
    expect(parsed.body).toBe("# Body\n");
  });

  it("uses the host-curated Trustless Work description in every generated surface", () => {
    const id = "skills.trustless-work.trustless-work-dev";
    const expected = SKILL_DESCRIPTION_OVERRIDES[id];
    const manifest = JSON.parse(readFileSync(path.join(ROOT, "catalog/manifest.json"), "utf8"));
    const entry = manifest.entries.find((item) => item.id === id);
    expect(entry.description).toBe(expected);
    expect(entry.description.startsWith(">"), entry.description).toBe(false);

    const index = readFileSync(path.join(ROOT, "ecosystem-skills/INDEX.md"), "utf8");
    const indexRow = index.split("\n").find((line) => line.includes("[`trustless-work-dev`]"));
    expect(indexRow).toContain(expected);
    expect(indexRow).not.toMatch(/\|\s*>\s*\|$/);
    expect(index).toContain("host-owned discovery text");
    expect(index).toContain("do not modify pinned source bytes");
    expect(index).toContain("exposure scrub");

    const spec = JSON.parse(readFileSync(path.join(ROOT, "specs/super-spec.json"), "utf8"));
    const skill = spec.paths["/skills/list_skills"].get["x-skill-index"]
      .find((item) => item.id === id);
    expect(skill.description).toBe(expected);
    expect(skill.description.startsWith(">"), skill.description).toBe(false);
  });

  it("keeps non-overridden descriptions and rejects stale override IDs", () => {
    expect(skillDescription("skills.example.other", "Upstream description")).toBe(
      "Upstream description"
    );
    expect(() => assertSkillDescriptionOverrideIdsResolve(new Set(), "test generator"))
      .toThrow(/trustless-work-dev/);
    expect(() =>
      assertSkillDescriptionOverrideIdsResolve(
        new Set(["skills.trustless-work.trustless-work-dev"]),
        "test generator"
      )
    ).not.toThrow();
  });
});
