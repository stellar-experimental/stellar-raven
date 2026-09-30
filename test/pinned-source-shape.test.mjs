import { describe, expect, it } from "vitest";
import { pinnedSourceFailures } from "../scripts/lib/skill-mirror.mjs";

const sha = (char) => char.repeat(40);
const valid = {
  id: "example",
  commit: sha("a"),
  license_files: ["LICENSE"],
  skills: [{ name: "skill-a", files: [{ path: "SKILL.md", sha: sha("b") }, { path: "reference.md", sha: sha("c") }] }]
};

describe("pinned source shape", () => {
  it("accepts a complete pinned source", () => {
    expect(pinnedSourceFailures(valid)).toEqual([]);
  });

  it("rejects a source that pins no skills, including a non-array skills value", () => {
    expect(pinnedSourceFailures({ ...valid, skills: [] })).toEqual(['ecosystem-skills source "example" pins no skills']);
    expect(pinnedSourceFailures({ ...valid, skills: {} })).toEqual(['ecosystem-skills source "example" pins no skills']);
  });

  it("rejects a skill without a SKILL.md file row", () => {
    const skills = [{ name: "skill-a", files: [{ path: "reference.md", sha: sha("c") }] }];
    expect(pinnedSourceFailures({ ...valid, skills })).toEqual([
      "ecosystem-skills manifest lists example/skill-a without a SKILL.md file"
    ]);
  });

  it("rejects a short commit, a missing blob sha, and missing license provenance", () => {
    const skills = [{ name: "skill-a", files: [{ path: "SKILL.md", sha: "abc" }] }];
    const failures = pinnedSourceFailures({ ...valid, commit: "abc", skills, license_files: [] });
    expect(failures).toHaveLength(3);
    expect(failures[0]).toMatch(/no full commit SHA/);
    expect(failures[1]).toMatch(/example\/skill-a\/SKILL\.md without a git blob sha/);
    expect(failures[2]).toMatch(/records no upstream LICENSE\/NOTICE/);
  });
});
