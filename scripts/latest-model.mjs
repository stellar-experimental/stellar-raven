#!/usr/bin/env node
/**
 * Print the newest model ID for a family: `node scripts/latest-model.mjs <family>`.
 * Families: sonnet, opus, fable (Claude Code aliases, printed unchanged), sol, astra, terra
 * (Codex catalog), grok (Grok catalog). Exits non-zero with a reason on stderr on any failure, so
 * `M=$(node scripts/latest-model.mjs astra) && ...` stops instead of launching with an empty model.
 */
import { FAMILIES, ModelFamilyError, resolveFamilyDetail } from "./lib/model-family.mjs";

const [family, ...rest] = process.argv.slice(2);
if (!family || rest.length > 0) {
  console.error(`usage: latest-model.mjs <${FAMILIES.join("|")}>`);
  process.exit(2);
}
try {
  const { id, fetchedAt } = resolveFamilyDetail(family);
  if (fetchedAt) console.error(`catalog fetched_at ${fetchedAt}`);
  console.log(id);
} catch (error) {
  console.error(error instanceof ModelFamilyError ? error.message : "model family resolution failed");
  process.exit(1);
}
