/**
 * Third-party skill CONTENT is not vendored in this repo, and does not ship
 * inside the Worker — it is fetched from upstream at the pinned commit and
 * hash-verified at read time (src/skills/source.ts).
 *
 * What this repo may commit about a skill: its address (upstream url + git
 * blob sha), its id/slug structure, and the one-line frontmatter description
 * that drives routing. Not: bodies, section prose, or body-derived keyword
 * bags. These assertions are the standing guard on that line — they fail if a
 * future change starts re-copying upstream text into a committed artifact.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog } from "../src/catalog/search.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);
const skillEntries = catalog.entries.filter((e) => e.service === "skills");

describe("skill bodies are not vendored", () => {
  it("keeps no copy of upstream skill files in the repo or the Worker bundle", () => {
    expect(existsSync(join(ROOT, "ecosystem-skills", "skills"))).toBe(false);
    expect(existsSync(join(ROOT, "src", "skills", "bundle.json"))).toBe(false);
  });

  it("attaches no license text or notice to what skill.read returns", () => {
    // Responses carry upstream's own bytes and nothing WE authored. Upstream
    // frontmatter (which is where a source declares its licence) is forwarded
    // untouched; this guard is that Raven never composes a notice of its own,
    // because "helpfully" appending one is the obvious wrong turn.
    // License markers only — `notice` is a legitimate field name here (the
    // size advisory), so matching the bare word would be a false positive.
    const licenseish = /\bLICENSE\b|\bcopyright\b|©|\bAGPL\b|\bSPDX\b|Apache-2\.0|MIT License/i;
    for (const file of ["store.ts", "source.ts", "scrub.ts"]) {
      const code = readFileSync(join(ROOT, "src", "skills", file), "utf8")
        .replace(/^\s*\/\*[\s\S]*?\*\//gm, "") // block comments
        .replace(/^\s*\/\/.*$/gm, ""); // line comments
      expect(licenseish.test(code), `${file} references license text`).toBe(false);
    }
  });

  it("addresses every ## section by heading only — never a body excerpt", () => {
    const sections = skillEntries.filter(
      (e) => e.kind === "skill-section" && !e.id.includes("#file:")
    );
    expect(sections.length).toBeGreaterThan(150);
    for (const e of sections) {
      const heading = (e.transport as { section?: string }).section;
      expect(typeof heading, e.id).toBe("string");
      // The description IS the heading: no first-paragraph excerpt trailing it.
      expect(e.description, e.id).toBe(heading);
    }
  });

  it("carries no body-derived keyword bags on any skill entry", () => {
    for (const e of skillEntries) {
      expect(e.keywords, `${e.id} carries body-derived keywords`).toBeUndefined();
    }
  });

  it("keeps every companion-file entry to a single-line title", () => {
    for (const e of skillEntries.filter((x) => x.id.includes("#file:"))) {
      expect(e.description.includes("\n"), e.id).toBe(false);
      expect(e.description.length, e.id).toBeLessThanOrEqual(120);
    }
  });

  it("holds the committed skills-derived text to a routing-descriptions budget", () => {
    // Canary, not a style rule: the ~18 frontmatter descriptions are what
    // routing scores (measured, see PLAN §3); everything else is a heading. If
    // this leaps, body text has crept back into a committed artifact.
    // Currently ~11.6 KB (7.5 KB of frontmatter descriptions + headings); the
    // pre-change catalog carried 33.7 KB with excerpts and keyword bags.
    const bytes = skillEntries.reduce((n, e) => n + e.description.length, 0);
    expect(bytes).toBeLessThan(16_000);
  });
});
