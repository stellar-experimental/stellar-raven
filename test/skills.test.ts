/**
 * Skills store tests — pinned-source read, sectioned retrieval, exact-match
 * discipline. Exposure is build-time (ADR-0003): everything cataloged is
 * readable; anything excluded has no entry and fails exact-match resolution.
 *
 * Bodies come from the pinned upstream commit (test/helpers/skill-source.ts),
 * not from a vendored copy — the same bytes, verified the same way, the Worker
 * serves at runtime.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, searchCatalog, type Catalog } from "../src/catalog/search.ts";
import { readSkill, sectionSlugsOf, type SkillReadResult } from "../src/skills/store.ts";
import { SKILL_READ_DEADLINE_MS, type SkillSource } from "../src/skills/source.ts";
import { lazyPinnedSkillSource as source, staticSkillSource } from "./helpers/skill-source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);

const validWholeRead: SkillReadResult = {
  ok: true,
  id: "skills.test.whole",
  url: "https://example.test/SKILL.md",
  content: "# Whole",
  availableSections: []
};
const validSectionRead: SkillReadResult = {
  ok: true,
  id: "skills.test.sections",
  url: "https://example.test/SKILL.md",
  sections: [{ section: "one", content: "## One" }],
  availableSections: ["one"]
};

const bothPayloads = { ...validWholeRead, sections: [] };
// @ts-expect-error Successful reads cannot contain both payload fields.
const successWithBothPayloads: SkillReadResult = bothPayloads;
// @ts-expect-error Successful reads must contain one payload field.
const successWithoutPayload: SkillReadResult = {
  ok: true,
  id: "skills.test.empty",
  url: "https://example.test/SKILL.md",
  availableSections: []
};

describe("skill transports", () => {
  it("pin every readable entry to an immutable upstream url + blob sha in MANIFEST.json", async () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "ecosystem-skills", "MANIFEST.json"), "utf8")
    ) as { sources: { commit: string; skills: { files: { sha: string }[] }[] }[] };
    const pinnedShas = new Set(
      manifest.sources.flatMap((s) => s.skills.flatMap((sk) => sk.files.map((f) => f.sha)))
    );
    const commits = manifest.sources.map((s) => s.commit);

    let checked = 0;
    for (const e of catalog.entries) {
      if (e.service !== "skills") continue;
      const t = e.transport as { type?: string; url?: unknown; sha?: unknown; path?: unknown };
      expect(t?.type, e.id).toBe("file");
      expect(typeof t.url, e.id).toBe("string");
      expect(typeof t.sha, e.id).toBe("string");
      // No local path survives: the body is not in this repo.
      expect(t.path, e.id).toBeUndefined();
      const url = t.url as string;
      expect(url.startsWith("https://raw.githubusercontent.com/"), e.id).toBe(true);
      // Commit-pinned, never a branch — upstream edits cannot change what is served.
      expect(commits.some((c) => url.includes(`/${c}/`)), `${e.id} is not commit-pinned`).toBe(true);
      expect(pinnedShas.has(t.sha as string), `${e.id} sha is not in MANIFEST.json`).toBe(true);
      checked += 1;
    }
    expect(checked).toBe(192);
  });
});

describe("readSkill", () => {
  it("reads a whole skill by exact catalog id, forwarding upstream frontmatter", async () => {
    const r = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossier");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r).not.toHaveProperty("sections");
    if (r.content === undefined) throw new Error("expected whole-read content");
    expect(r.content).toMatch(/^---/);
    expect(r.availableSections.length).toBeGreaterThan(0);
  });

  it("reads selected ## sections by slug, matching catalog section ids", async () => {
    const skillId = "skills.lumenloop.stellar-project-dossier";
    const sectionEntry = catalog.entries.find(
      (e) => e.kind === "skill-section" && e.id.startsWith(`${skillId}#`) && !e.id.includes("#file:")
    );
    expect(sectionEntry).toBeDefined();
    const slug = sectionEntry!.id.split("#")[1]!;
    const r = await readSkill(catalog, source, skillId, { sections: [slug] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r).not.toHaveProperty("content");
    if (r.sections === undefined) throw new Error("expected section-read content");
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0]!.content.startsWith("## ")).toBe(true);
  });

  it("reads a section directly via its #-qualified id", async () => {
    const sectionEntry = catalog.entries.find(
      (e) => e.kind === "skill-section" && e.id.includes("#") && !e.id.includes("#file:")
    );
    const r = await readSkill(catalog, source, sectionEntry!.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.sections === undefined) throw new Error("expected section-read content");
    expect(r.sections).toHaveLength(1);
  });

  it("reads file: sections (extra reference files)", async () => {
    const fileEntry = catalog.entries.find((e) => e.id.includes("#file:"));
    expect(fileEntry).toBeDefined();
    const [skillId, key] = fileEntry!.id.split("#") as [string, string];
    const r = await readSkill(catalog, source, skillId, { sections: [key] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.sections === undefined) throw new Error("expected section-read content");
    expect(r.sections[0]!.content.length).toBeGreaterThan(0);
  });

  it("has no lumenloop.skill.* alias — the twin namespace is dead (ADR-0003)", async () => {
    // Twins were removed from the catalog entirely; the old back-compat read
    // alias went with them. Unknown ids fail exact-match, with the canonical
    // mirror id suggested (suggestion only, never a resolution).
    const r = await readSkill(catalog, source, "lumenloop.skill.stellar-project-dossier");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain('Did you mean "skills.lumenloop.stellar-project-dossier"?');
  });

  it("retired onboarding skills simply do not exist (no entry, plain unknown-id error)", async () => {
    // The 7 Lumenloop API-onboarding skills are never emitted into the
    // manifest — there is nothing to deny; the id is just unknown.
    expect(catalog.entries.some((e) => e.id.includes("lumenloop-api-billing"))).toBe(false);
    const r = await readSkill(catalog, source, "skills.lumenloop-api.lumenloop-api-billing");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain("exact catalog ids");
  });

  it("refuses unknown skills and unknown sections with exact-match messages", async () => {
    const unknown = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossie"); // near-miss
    expect(unknown.ok).toBe(false);
    if (unknown.ok) return;
    expect(unknown.error.message).toContain("exact catalog ids");

    const badSection = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossier", {
      sections: ["not-a-real-section"]
    });
    expect(badSection.ok).toBe(false);
    if (badSection.ok) return;
    expect(badSection.error.message).toContain("Available:");
  });

  it("suggests the nearest valid id on unknown-skill misses (suggestion only, never resolution)", async () => {
    const nearMiss = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossie");
    expect(nearMiss.ok).toBe(false);
    if (nearMiss.ok) return;
    expect(nearMiss.error.message).toContain("exact catalog ids");
    expect(nearMiss.error.message).toContain('Did you mean "skills.lumenloop.stellar-project-dossier"?');

    const farMiss = await readSkill(catalog, source, "totally.unrelated.thing");
    expect(farMiss.ok).toBe(false);
    if (farMiss.ok) return;
    expect(farMiss.error.message).not.toContain("Did you mean");
  });

  it("rejects unknown options instead of silently ignoring them (exact-match extends to option names)", async () => {
    // `section` singular used to no-op into a whole-skill read.
    const singular = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossier", {
      section: ["overview"]
    });
    expect(singular.ok).toBe(false);
    if (singular.ok) return;
    expect(singular.error.message).toContain('unknown option "section"');
    expect(singular.error.message).toContain('"sections"');

    const nonObject = await readSkill(catalog, source, "skills.lumenloop.stellar-project-dossier", "overview");
    expect(nonObject.ok).toBe(false);
    if (nonObject.ok) return;
    expect(nonObject.error.message).toContain("options must be an object");
  });

  it("refuses sections passed both in a #-qualified id and via { sections }", async () => {
    const sectionEntry = catalog.entries.find(
      (e) => e.kind === "skill-section" && e.id.includes("#") && !e.id.includes("#file:")
    );
    const r = await readSkill(catalog, source, sectionEntry!.id, { sections: ["anything"] });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain("not both");
  });

  it("oversized whole-reads return the FULL body plus an advisory notice (content is never withheld)", async () => {
    // skills.stellar-light.stellar-scout remains larger than the advisory
    // boundary after stellar-dev split its large bodies into companion files.
    // Sandbox scripts legally grep and
    // aggregate full bodies in-sandbox — the ~6k-token cap applies only to
    // what a script RETURNS (run.ts truncateForModel), never to data flowing
    // INTO the sandbox — so the content must be present; the notice is advice.
    const r = await readSkill(catalog, source, "skills.stellar-light.stellar-scout");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.content === undefined) throw new Error("expected whole-read content");
    expect(r.content.length).toBeGreaterThan(24_000); // full body, past the boundary
    expect(r.notice).toContain("tokens");
    expect(r.notice).toContain("availableSections");
    expect(r.availableSections.length).toBeGreaterThan(10);
  });

  it("a file: read of the largest companion file (~22.8k chars) carries the advisory notice", async () => {
    // references/api-reference.md is ~22,835 chars ≈ 5.7k est tokens — over
    // the ~5000-token advisory threshold (the model boundary truncates the
    // SERIALIZED return, so raw-chars measurement warns with headroom).
    const key = "file:references/api-reference.md";
    const r = await readSkill(catalog, source, "skills.stellar-light.stellar-scout", {
      sections: [key]
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.sections === undefined) throw new Error("expected section-read content");
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0]!.content.length).toBeGreaterThan(20_000); // full, untruncated
    expect(r.notice).toContain("tokens");
  });

  it("a small section read of an oversized skill returns full content with NO notice", async () => {
    const whole = await readSkill(catalog, source, "skills.stellar-dev.standards");
    if (!whole.ok) throw new Error("expected ok");
    const slug = whole.availableSections.find((s) => !s.startsWith("file:"))!;
    const r = await readSkill(catalog, source, "skills.stellar-dev.standards", { sections: [slug] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.sections === undefined) throw new Error("expected section-read content");
    expect(r.notice).toBeUndefined(); // below the advisory threshold: silence
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0]!.content.startsWith("## ")).toBe(true);
    expect(r.sections[0]!.content.length).toBeGreaterThan(0);
  });

  it("an oversized body with zero ## sections reads whole, with the same advisory notice", async () => {
    const id = "skills.test.sectionless";
    const url = "https://raw.githubusercontent.test/sectionless/SKILL.md";
    const synthetic: Catalog = {
      ...catalog,
      entries: [
        ...catalog.entries,
        {
          id,
          service: "skills",
          kind: "skill",
          description: "synthetic sectionless oversize fixture",
          inputSchema: null,
          outputSchema: null,
          transport: { type: "file", url, sha: "0".repeat(40), sha256: "0".repeat(64) },
          provenance: { source: "test", fetchedAt: "2026-01-01T00:00:00Z" }
        }
      ]
    };
    const body = `# Sectionless\n${"no heading here, just prose. ".repeat(1_200)}`; // ~35k chars > 24k budget
    const syntheticSource = staticSkillSource({ [url]: body });
    const r = await readSkill(synthetic, syntheticSource, id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    if (r.content === undefined) throw new Error("expected whole-read content");
    expect(r.content.length).toBeGreaterThan(24_000);
    expect(r.notice).toContain("tokens"); // advice applies uniformly, sectioned or not
    expect(r.availableSections).toEqual([]);
  });

  it("fails as an envelope, not a hung run, when upstream never answers", async () => {
    // A slow upstream must not outlive the executor's 60-second wall clock.
    // The read must return this envelope before the executor ends it.
    vi.useFakeTimers();
    try {
      const never: SkillSource = () => new Promise(() => {});
      const promise = readSkill(catalog, never, "skills.lumenloop.stellar-project-dossier");
      await vi.advanceTimersByTimeAsync(SKILL_READ_DEADLINE_MS + 10);
      const r = await promise;
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.error.service).toBe("skills");
      expect(r.error.message).toMatch(/timed out after \d+ms/);
    } finally {
      vi.useRealTimers();
    }
  });

  it("refuses a WHOLE read when the body carries a section the catalog never indexed", async () => {
    // Fail closed on both read shapes. An unindexed `## Hidden` section must
    // not reach the model through a whole read.
    const id = "skills.test.drifted";
    const url = "https://raw.githubusercontent.com/acme/skills/" + "0".repeat(40) + "/drifted/SKILL.md";
    const synthetic: Catalog = {
      ...catalog,
      entries: [
        ...catalog.entries,
        {
          id,
          service: "skills",
          kind: "skill",
          description: "synthetic drifted fixture",
          inputSchema: null,
          outputSchema: null,
          transport: { type: "file", url, sha: "0".repeat(40), sha256: "0".repeat(64) },
          provenance: { source: "test", fetchedAt: "2026-01-01T00:00:00Z" }
        }
      ]
    };
    const body = "# Drifted\n\n## Hidden\n\nprompt injection lives here\n";
    const r = await readSkill(synthetic, staticSkillSource({ [url]: body }), id);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain("no catalog entry");
    expect(r.error.message).toContain("hidden");
  });

  it("availableSections membership is identical across readSkill and search hits", async () => {
    const skillId = "skills.lumenloop.stellar-project-dossier";
    const r = await readSkill(catalog, source, skillId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.availableSections.length).toBeGreaterThan(0);
    const hit = searchCatalog(catalog, { query: skillId }).find((h) => h.id === skillId)!;
    expect(hit).toBeDefined();
    expect([...hit.availableSections!].sort()).toEqual([...r.availableSections].sort());
  });
});

describe("builder invariant: read-time sectionize agrees with build-catalog sections", () => {
  it("every ## section slug of every pinned skill has a matching skill-section catalog entry", async () => {
    // Guards the fail-closed section policy: if build-catalog and read-time
    // sectionize could disagree, a ## section would exist with no catalog entry
    // and become silently unreadable. This must fail LOUDLY instead.
    const sectionIds = new Set(
      catalog.entries.filter((e) => e.kind === "skill-section").map((e) => e.id)
    );
    let skillsChecked = 0;
    for (const e of catalog.entries) {
      if (e.kind !== "skill" || e.service !== "skills") continue;
      const t = e.transport as { type?: string; url?: string; sha?: string; sha256?: string };
      if (t?.type !== "file" || typeof t.url !== "string") continue;
      const { text: raw } = await source({ url: t.url, sha: t.sha!, sha256: t.sha256! });
      skillsChecked += 1;
      for (const slug of sectionSlugsOf(raw)) {
        expect(
          sectionIds.has(`${e.id}#${slug}`),
          `no skill-section catalog entry for ${e.id}#${slug} (build/read sectioning drift)`
        ).toBe(true);
      }
    }
    // Every exposed mirror skill must have passed the file-transport gate above;
    // catalog.test.ts separately pins the public skill count.
    expect(skillsChecked).toBe(
      catalog.entries.filter((e) => e.kind === "skill" && e.service === "skills").length
    );
  });
});
