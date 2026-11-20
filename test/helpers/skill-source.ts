/**
 * Test SkillSource builders: `pinnedSkillSource` loads real pinned files from the working cache
 * (fetching and hash-verifying on a cache miss); `staticSkillSource` serves fixed in-memory maps.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkillTexts, skillFileUrl } from "../../scripts/lib/skill-mirror.mjs";
import { RETIRED_ONBOARDING_SKILLS } from "../../scripts/exposure.mjs";
import { scrubNonExposedRefs } from "../../src/skills/scrub.ts";
import type { SkillSource } from "../../src/skills/source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

let pinned: Promise<SkillSource> | undefined;

/**
 * A source over every pinned file, serving the same scrubbed bytes
 * src/skills/source.ts serves at runtime. Loaded once per test process.
 */
export function pinnedSkillSource(): Promise<SkillSource> {
  pinned ??= (async () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "ecosystem-skills", "MANIFEST.json"), "utf8")
    );
    // Retired skills are never cataloged, so the Worker can never fetch them
    // — and their own bodies name themselves, which the scrub refuses to emit.
    const texts = await loadSkillTexts(manifest, {
      skip: (name: string) => RETIRED_ONBOARDING_SKILLS.has(name)
    });
    const byUrl = new Map<string, string>();
    for (const source of manifest.sources) {
      for (const skill of source.skills) {
        for (const file of skill.files ?? []) {
          const loaded = texts.get(`${source.id}/${skill.name}/${file.path}`);
          if (loaded === undefined) continue;
          const url = skillFileUrl(source, skill.name, file.path);
          byUrl.set(url, scrubNonExposedRefs(loaded.text, url));
        }
      }
    }
    return async (pin) => {
      const text = byUrl.get(pin.url);
      if (text === undefined) throw new Error(`no pinned file for ${pin.url}`);
      return { text, from: "upstream" as const };
    };
  })();
  return pinned;
}

/**
 * The pinned source in a form usable at module scope (before any `beforeAll`):
 * each call resolves the shared load promise, so construction never blocks.
 */
export const lazyPinnedSkillSource: SkillSource = (pin) =>
  pinnedSkillSource().then((s) => s(pin));

/** A source over fixed url -> body pairs; unknown urls reject like upstream 404s. */
export function staticSkillSource(files: Record<string, string>): SkillSource {
  return async (pin) => {
    const text = files[pin.url];
    if (text === undefined) throw new Error(`could not fetch ${pin.url}: HTTP 404`);
    return { text, from: "upstream" as const };
  };
}
