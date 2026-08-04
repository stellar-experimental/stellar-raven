/**
 * Non-exposed skill-reference scrub — ONE implementation, two consumers.
 *
 * Skill bodies are no longer vendored into this repo (they are fetched from
 * upstream at the pinned commit — see src/skills/source.ts), so the scrub that
 * used to run once at bundle time now has to run on every served body. The
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
 * Fail-loud drift guard: if upstream ever introduces a non-exposed skill
 * reference OUTSIDE a list item, the scrub cannot remove it cleanly and throws
 * instead of emitting the leak. At build time that fails the build; at read
 * time src/skills/store.ts turns it into an error envelope — either way the
 * leak is never served.
 */

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
