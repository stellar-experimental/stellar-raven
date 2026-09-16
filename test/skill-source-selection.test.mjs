import { describe, expect, it } from "vitest";
import { selectGitHubSkillFiles } from "../scripts/lib/skill-source-selection.mjs";

const tree = {
  tree: [
    { type: "blob", path: "README.md", size: 10, sha: "root-readme" },
    { type: "blob", path: "LICENSE.md", size: 11, sha: "root-license" },
    { type: "blob", path: "skill-a/SKILL.md", size: 12, sha: "skill-a" },
    { type: "blob", path: "skill-a/reference.md", size: 13, sha: "skill-a-ref" },
    { type: "blob", path: "skill-b/SKILL.md", size: 14, sha: "skill-b" },
    { type: "blob", path: "skills/skill-c/SKILL.md", size: 15, sha: "skill-c" }
  ]
};

describe("GitHub skill source selection", () => {
  it("rejects root Markdown files when child skill directories live at the repo root", () => {
    expect(selectGitHubSkillFiles(tree, { sourcePath: "." }).map((file) => file.src)).toEqual([
      "skill-a/reference.md",
      "skill-a/SKILL.md",
      "skill-b/SKILL.md",
      "skills/skill-c/SKILL.md"
    ]);
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
});
