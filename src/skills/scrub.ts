/**
 * Non-exposed reference scrub — ONE implementation, two consumers.
 *
 * Skill bodies come from the pinned upstream commit (see src/skills/source.ts),
 * so every served body passes through this scrub. The
 * builders (scripts/exposure.mjs re-exports this module) and the Worker read
 * path must agree byte-for-byte: what search advertises and what
 * `codemode.skill.read` returns are derived from the same scrubbed text.
 *
 * The exposed lumenloop playbooks were authored for the upstream
 * MCP-connector context and cross-link retired onboarding skills ("Connect
 * first -> ../lumenloop-mcp-connect/SKILL.md"). Through this gateway those are
 * dead pointers to skills that are never emitted, and the connector-setup
 * advice contradicts the sandbox model (no network; the caller is already
 * connected). Every such reference sits inside a markdown list item, so the
 * scrub drops the WHOLE item (bullet line + indented continuation lines) —
 * never a partial sentence.
 *
 * Scout skill bodies can also describe operations outside Raven's manifest.
 * The scrub removes a complete Markdown section, table row, or list item that
 * names any excluded path. The path set comes from the same operation records
 * that filter the manifest. Unstructured prose fails closed.
 *
 * Fail-loud drift guard: if upstream introduces a non-exposed reference
 * outside a removable Markdown block, the scrub throws instead of emitting
 * the leak. At build time that fails the build. At read time src/skills/store.ts
 * returns an error envelope. The leak is never served.
 */
import { EXCLUDED_SCOUT_PATHS } from "../policy/scout-exposure.ts";

/**
 * Matches any reference to a non-exposed skill in prose or a relative markdown
 * link (`../lumenloop-mcp-connect/SKILL.md`, "lumenloop-api-query"). The
 * stellar-developer-activity id is internal-guidance only; Scout upstream links
 * it as a companion skill, but ADR-0003 says non-exposed ids cannot appear in
 * emitted model-facing text.
 */
export const RETIRED_SKILL_REF_RE =
  /lumenloop-api-[a-z]+|lumenloop-mcp-connect|stellar-developer-activity/;

export function scrubRetiredSkillRefs(text: string, context: string): string {
  if (!RETIRED_SKILL_REF_RE.test(text)) return text;
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!/^\s*[-*] /.test(line)) {
      out.push(line);
      continue;
    }
    // Collect the full list item: the bullet line plus indented, non-bullet,
    // non-blank continuation lines.
    const item = [line];
    let j = i + 1;
    while (j < lines.length && /^\s+\S/.test(lines[j] ?? "") && !/^\s*[-*] /.test(lines[j] ?? "")) {
      item.push(lines[j] ?? "");
      j++;
    }
    if (!RETIRED_SKILL_REF_RE.test(item.join("\n"))) out.push(...item);
    i = j - 1;
  }
  const scrubbed = out.join("\n");
  if (RETIRED_SKILL_REF_RE.test(scrubbed)) {
    throw new Error(
      `Non-exposed skill reference survives outside a markdown list item in ${context} — ` +
        `an upstream re-sync changed the reference shape; extend scrubRetiredSkillRefs ` +
        `in src/skills/scrub.ts so the leak cannot be emitted.`
    );
  }
  return scrubbed;
}

function containsExcludedScoutPath(text: string): boolean {
  return [...EXCLUDED_SCOUT_PATHS].some((path) => text.includes(path));
}

function headingDepth(line: string): number | undefined {
  const match = /^(#{1,6})\s/.exec(line);
  return match?.[1]?.length;
}

function listItemStart(line: string): boolean {
  return /^\s*(?:[-*+] |\d+[.)] )/.test(line);
}

/**
 * Remove complete Markdown blocks that advertise excluded Scout paths.
 * Any reference that does not fit a safe structural block stops the build or
 * read. This keeps the policy general and prevents partial sentence edits.
 */
export function scrubExcludedScoutOperationRefs(text: string, context: string): string {
  const lines = text.split("\n");
  const withoutSections: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const depth = headingDepth(line);
    if (depth === undefined || !containsExcludedScoutPath(line)) {
      withoutSections.push(line);
      continue;
    }

    i += 1;
    while (i < lines.length) {
      const nextDepth = headingDepth(lines[i] ?? "");
      if (nextDepth !== undefined && nextDepth <= depth) {
        i -= 1;
        break;
      }
      i += 1;
    }
  }

  const out: string[] = [];
  for (let i = 0; i < withoutSections.length; i++) {
    const line = withoutSections[i] ?? "";
    if (/^\s*\|.*\|\s*$/.test(line) && containsExcludedScoutPath(line)) continue;

    if (!listItemStart(line)) {
      out.push(line);
      continue;
    }

    const item = [line];
    let j = i + 1;
    while (
      j < withoutSections.length &&
      /^\s+\S/.test(withoutSections[j] ?? "") &&
      !listItemStart(withoutSections[j] ?? "")
    ) {
      item.push(withoutSections[j] ?? "");
      j += 1;
    }
    if (!containsExcludedScoutPath(item.join("\n"))) out.push(...item);
    i = j - 1;
  }

  const scrubbed = out.join("\n");
  if (containsExcludedScoutPath(scrubbed)) {
    throw new Error(
      `Non-exposed Scout operation reference survives outside a removable Markdown block in ${context} — ` +
        `an upstream re-sync changed the reference shape; update the structural scrub in ` +
        `src/skills/scrub.ts so the reference cannot be emitted.`
    );
  }
  return scrubbed;
}

/** Apply every model-facing skill-body exposure filter. */
export function scrubNonExposedRefs(text: string, context: string): string {
  return scrubExcludedScoutOperationRefs(scrubRetiredSkillRefs(text, context), context);
}
