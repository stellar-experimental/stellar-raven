import { describe, expect, it } from "vitest";
import { selectGitHubSkillFiles } from "../scripts/lib/skill-source-selection.mjs";

const tree = {
  tree: [
    { type: "blob", path: "README.md", size: 10, sha: "root-readme" },
    { type: "blob", path: "SKILL.md", size: 9, sha: "root-skill" },
    { type: "blob", path: "LICENSE.md", size: 11, sha: "root-license" },
    { type: "blob", path: "skill-a/SKILL.md", size: 12, sha: "skill-a" },
    { type: "blob", path: "skill-a/reference.md", size: 13, sha: "skill-a-ref" },
    { type: "blob", path: "skill-b/SKILL.md", size: 14, sha: "skill-b" },
    { type: "blob", path: "skills/skill-c/SKILL.md", size: 15, sha: "skill-c" }
  ]
};

describe("GitHub skill source selection", () => {
  it("rejects root Markdown files when child skill directories live at the repo root", () => {
    const rootSkills = { tree: tree.tree.filter((entry) => !entry.path.startsWith("skills/")) };
    expect(selectGitHubSkillFiles(rootSkills, { sourcePath: "." }).map((file) => file.src)).toEqual([
      "skill-a/reference.md",
      "skill-a/SKILL.md",
      "skill-b/SKILL.md"
    ]);
  });

  it("refuses an unpicked child directory without its own SKILL.md", () => {
    // In "." mode `skills/skill-c/SKILL.md` would make `skills` a skill with no SKILL.md of its own.
    expect(() => selectGitHubSkillFiles(tree, { sourcePath: "." })).toThrow(/"skills" under "\." has no SKILL\.md/);
    const notesOnly = { tree: [{ type: "blob", path: "skills/broken/notes.md", size: 1, sha: "a" }] };
    expect(() => selectGitHubSkillFiles(notesOnly, { sourcePath: "skills" })).toThrow(/"broken" under "skills" has no SKILL\.md/);
  });

  it("applies a root-directory allow-list after rejecting root Markdown files", () => {
    expect(selectGitHubSkillFiles(tree, { sourcePath: ".", picks: ["skill-a"] })).toEqual([
      { skill: "skill-a", relpath: "reference.md", size: 13, sha: "skill-a-ref", src: "skill-a/reference.md" },
      { skill: "skill-a", relpath: "SKILL.md", size: 12, sha: "skill-a", src: "skill-a/SKILL.md" }
    ]);
  });

  it("rejects a Markdown file directly under a named source directory", () => {
    expect(selectGitHubSkillFiles(tree, { sourcePath: "skills" })).toEqual([
      { skill: "skill-c", relpath: "SKILL.md", size: 15, sha: "skill-c", src: "skills/skill-c/SKILL.md" }
    ]);
  });

  it("keeps repo-root single-skill mode distinct", () => {
    const selected = selectGitHubSkillFiles(tree, { sourcePath: "", picks: ["root-skill"] });
    expect(selected.some((file) => file.src === "README.md" && file.skill === "root-skill")).toBe(true);
  });

  it("refuses a truncated or malformed tree instead of pinning a partial set", () => {
    expect(() => selectGitHubSkillFiles({ ...tree, truncated: true }, { sourcePath: "skills" })).toThrow(/truncated/);
    expect(() => selectGitHubSkillFiles({}, { sourcePath: "skills" })).toThrow(/no tree array/);
  });

  it("refuses a pick that is missing or has no SKILL.md", () => {
    expect(() => selectGitHubSkillFiles({ tree: [] }, { sourcePath: ".", picks: ["skill-a"] })).toThrow(/no skill files/);
    expect(() => selectGitHubSkillFiles(tree, { sourcePath: ".", picks: ["skill-a", "absent"] })).toThrow(/"absent" has no SKILL\.md/);
    const noSkillFile = { tree: [{ type: "blob", path: "skill-x/notes.md", size: 1, sha: "x" }] };
    expect(() => selectGitHubSkillFiles(noSkillFile, { sourcePath: ".", picks: ["skill-x"] })).toThrow(/"skill-x" has no SKILL\.md/);
  });

  it("refuses a repo-root skill without a root SKILL.md", () => {
    const rootless = { tree: tree.tree.filter((entry) => entry.path !== "SKILL.md") };
    expect(() => selectGitHubSkillFiles(rootless, { sourcePath: "", picks: ["root-skill"] })).toThrow(/no SKILL\.md/);
  });
});
