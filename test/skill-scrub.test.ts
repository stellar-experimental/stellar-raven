import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
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

  it("fails closed when an excluded path is not in a removable block or sentence", () => {
    expect(() =>
      scrubExcludedScoutOperationRefs(
        ["Run this:", "```sh", `curl https://example.test${excludedPath}`, "```"].join("\n"),
        "code fence fixture"
      )
    ).toThrow("survives outside a removable Markdown block or sentence");
  });

  it("removes only the complete sentences that name an excluded path in a paragraph", () => {
    const text = [
      "Intro.",
      "",
      `**Units:** count rows (e.g. one per entry). The unit \`${excludedPath}\` counts matches it.`,
      `**Values** (here and on \`${excludedPath}\`): each is a slug. A bad value returns 400!`,
      "**Kept line** stays exactly.  Two spaces stay.",
      "",
      "Outro."
    ].join("\n");
    expect(scrubExcludedScoutOperationRefs(text, "sentence fixture")).toBe(
      [
        "Intro.",
        "",
        "**Units:** count rows (e.g. one per entry).",
        "A bad value returns 400!",
        "**Kept line** stays exactly.  Two spaces stay.",
        "",
        "Outro."
      ].join("\n")
    );
  });

  it("joins a wrapped paragraph before it removes a sentence that spans lines", () => {
    const text = [
      "Keep the first sentence. Then call",
      `\`${excludedPath}\` for the rest. Keep the`,
      "last sentence."
    ].join("\n");
    expect(scrubExcludedScoutOperationRefs(text, "wrapped fixture")).toBe(
      "Keep the first sentence. Keep the last sentence."
    );
  });

  it("drops a fully removed paragraph and one blank line", () => {
    const text = ["Before.", "", `Use ${excludedPath} here.`, "", "After."].join("\n");
    expect(scrubExcludedScoutOperationRefs(text, "whole paragraph fixture")).toBe(
      ["Before.", "", "After."].join("\n")
    );
  });

  it("fails closed on an indented code block and on structural lines inside a fence", () => {
    for (const text of [
      ["Before.", "", `    curl https://x${excludedPath}`, "    echo done. Next thing.", "", "After."].join("\n"),
      ["```", `- ${excludedPath}`, `| ${excludedPath} |`, `> ${excludedPath}`, "```"].join("\n")
    ]) {
      expect(() => scrubExcludedScoutOperationRefs(text, "code fixture")).toThrow(
        "survives outside a removable Markdown block or sentence"
      );
    }
  });

  it("splits after closing marks and keeps the next sentence", () => {
    const analyze = "/api/hackathons/analyze";
    expect(scrubExcludedScoutOperationRefs(`(See ${analyze}.) Keep this.`, "paren")).toBe("Keep this.");
    expect(scrubExcludedScoutOperationRefs(`He said "call ${analyze}." Keep this.`, "quote")).toBe(
      "Keep this."
    );
    expect(scrubExcludedScoutOperationRefs(`**Note.** Call ${analyze}. Keep.`, "bold")).toBe(
      "**Note.** Keep."
    );
  });

  it("treats a line that ends in an abbreviation as part of the next sentence", () => {
    const text = ["Call e.g.", "/api/hackathons/analyze now.", "Keep this."].join("\n");
    expect(scrubExcludedScoutOperationRefs(text, "abbreviation")).toBe("Keep this.");
    expect(
      scrubExcludedScoutOperationRefs("Call (e.g.) /api/hackathons/analyze for counts. Keep this.", "paren abbreviation")
    ).toBe("Keep this.");
  });

  it("matches a templated excluded path with a concrete value and a percent-encoded path", () => {
    const text = [
      "- Fetch /api/hackathons/builds/dorahacks-buidl-12 for detail.",
      "- Call /api/hackathons%2Fanalyze now.",
      "- Keep `/api/hackathons/builds?q=defi`."
    ].join("\n");
    expect(scrubExcludedScoutOperationRefs(text, "templated")).toBe(
      "- Keep `/api/hackathons/builds?q=defi`."
    );
  });

  it("does not split a sentence at a period inside a code span or parentheses", () => {
    const text = `Keep \`a. b\` and (see c. d) together. Drop \`${excludedPath}\` here.`;
    expect(scrubExcludedScoutOperationRefs(text, "split fixture")).toBe(
      "Keep `a. b` and (see c. d) together."
    );
  });

  it("removes an unavailable collection's whole blockquote and retains exposed child paths", () => {
    const text = [
      "## GET /api/repos/explain",
      "Read the explanation.",
      "",
      "> Two repository views.",
      "> `/api/repos` is the stored collection.",
      "> `/api/repos/search` is the curated view.",
      "",
      "## GET /api/repos/search",
      "Keep the search documentation.",
      "",
      "> Keep this separate quotation."
    ].join("\n");
    const scrubbed = scrubExcludedScoutOperationRefs(text, "collection quotation");
    expect(scrubbed).toContain("## GET /api/repos/explain\nRead the explanation.");
    expect(scrubbed).toContain("## GET /api/repos/search\nKeep the search documentation.");
    expect(scrubbed).toContain("> Keep this separate quotation.");
    expect(scrubbed).not.toContain("Two repository views.");
    expect(scrubbed).not.toContain("stored collection");
    expect(scrubbed).not.toContain("curated view");
  });

  it("matches a collection path with query parameters without matching longer path names", () => {
    const text = [
      "- Remove `/api/repos?limit=1`.",
      "- Keep `/api/repos/search`.",
      "- Keep `/api/repos-extra`.",
      "- Keep `/api/repository`."
    ].join("\n");
    const scrubbed = scrubExcludedScoutOperationRefs(text, "path boundaries");
    expect(scrubbed).not.toContain("Remove");
    expect(scrubbed).toContain("/api/repos/search");
    expect(scrubbed).toContain("/api/repos-extra");
    expect(scrubbed).toContain("/api/repository");
  });

  it("narrows trailing excluded alternative clauses inside list items and paragraphs", () => {
    const match = "/api/partners/match";
    const assistant = "/api/partners/assistant";
    const listText = [
      "1. **Step one.** Keep `/api/stablecoins`.",
      `2. **Rails and partners.** \`/api/stablecoins?peg={USD}\` (compare \`marketCapUSD\`, never raw \`supply\`) and \`/api/partners?type=anchor\`, or \`POST ${match}\` with the need in plain language. Empty results mean none listed.`,
      `3. **Wrapped step.** Use \`/api/partners\`,`,
      `   or call \`POST ${match}\``,
      "   for plain-language matching, or",
      `   \`POST ${assistant}\` (guided flow). Keep this.`,
      "4. **Final step.** Keep `/api/rfps`."
    ].join("\n");

    expect(scrubExcludedScoutOperationRefs(listText, "workflow list")).toBe(
      [
        "1. **Step one.** Keep `/api/stablecoins`.",
        "2. **Rails and partners.** `/api/stablecoins?peg={USD}` (compare `marketCapUSD`, never raw `supply`) and `/api/partners?type=anchor`. Empty results mean none listed.",
        "3. **Wrapped step.** Use `/api/partners`. Keep this.",
        "4. **Final step.** Keep `/api/rfps`."
      ].join("\n")
    );

    const paragraph = [
      "One profile by slug.",
      `**Use when** you hold a slug from \`/api/partners\`; for *finding* a partner use \`/api/partners\` filters or \`POST ${match}\`.`
    ].join(" ");
    expect(scrubExcludedScoutOperationRefs(paragraph, "paragraph alternative")).toBe(
      "One profile by slug. **Use when** you hold a slug from `/api/partners`; for *finding* a partner use `/api/partners` filters."
    );
  });

  it("drops the whole sentence or list item when narrowing would leave a fragment or drop exposed paths", () => {
    const match = "/api/partners/match";
    for (const sentence of [
      `Either call \`/api/partners\` or \`POST ${match}\`.`,
      `Check whether \`/api/partners\` or \`POST ${match}\` fits.`,
      `If \`/api/partners\` or \`POST ${match}\` fails, retry.`,
      `The \`/api/partners\` or \`POST ${match}\` endpoint returns 200.`,
      `Use \`/api/partners\` or \`POST ${match}\`, then inspect.`,
      `Use \`/api/a\` or \`/api/b\` when \`POST ${match}\` is unavailable.`,
      `Compare \`/api/partners\` or \`POST ${match}\` with \`/api/projects\`.`,
      `Send GET or POST ${match}.`,
      `**Partners:** or \`POST ${match}\`.`
    ]) {
      expect(
        scrubExcludedScoutOperationRefs(`${sentence} Keep this.`, "unsafe alternative"),
        sentence
      ).toBe("Keep this.");
    }

    const orphanList = [
      "- Keep before.",
      `- **Partner matching.** Call \`POST ${match}\`. It ranks partners by fit.`,
      "- Keep after."
    ].join("\n");
    expect(scrubExcludedScoutOperationRefs(orphanList, "orphan list")).toBe(
      ["- Keep before.", "- Keep after."].join("\n")
    );

    const fencedAfterBullet = [
      "- Keep this bullet.",
      "  ```sh",
      `  curl https://example.test${match}`,
      "  ```"
    ].join("\n");
    expect(() => scrubExcludedScoutOperationRefs(fencedAfterBullet, "fenced bullet")).toThrow(
      "survives outside a removable Markdown block or sentence"
    );
  });

  it("removes excluded paths from every selected Scout file while keeping the partner-filter workflow", async () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "ecosystem-skills", "MANIFEST.json"), "utf8")
    );
    const source = manifest.sources.find((item: { id: string }) => item.id === "stellar-light");
    expect(source).toBeDefined();

    const selected = await loadSkillTexts({ ...manifest, sources: [source] });
    expect(selected.size).toBeGreaterThan(0);
    const scrubbedByKey = new Map<string, string>();
    for (const [key, file] of selected) {
      const scrubbed = scrubNonExposedRefs(file.text, key);
      scrubbedByKey.set(key, scrubbed);
      expect(() => assertNoNonExposedRefsInText(scrubbed, key)).not.toThrow();
      const mentionedPaths = scrubbed.match(/\/api\/[\w/{}/-]+/g) ?? [];
      for (const path of EXCLUDED_SCOUT_PATHS) {
        expect(mentionedPaths, `${key} retains ${path}`).not.toContain(path);
      }
    }

    const skillMd = scrubbedByKey.get("stellar-light/stellar-scout/SKILL.md");
    expect(skillMd).toBeDefined();
    expect(skillMd).toContain("4. **Rails and partners the demo needs.**");
    expect(skillMd).toContain("`/api/stablecoins?peg={USD|EUR|BRL…}` (compare `marketCapUSD`, never raw `supply` across pegs)");
    expect(skillMd).toContain("`/api/partners?type={anchor|on-off-ramp|audit-firm}&q={country}`.");
    expect(skillMd).toContain('"none listed at our source"');
    expect(skillMd).not.toContain("/api/partners/match");

    const apiRef = scrubbedByKey.get("stellar-light/stellar-scout/references/api-reference.md");
    expect(apiRef).toBeDefined();
    expect(apiRef).toContain(
      "**Use when** you already hold a slug from `/api/partners`; for *finding* a partner use `/api/partners` filters."
    );
    expect(apiRef).not.toContain("## `POST /api/partners/match`");
  });
});
