/**
 * Source-family orientation for the `search` description.
 *
 * `FAMILY_LINE` is authored text, emitted by scripts/build-micro-map.mjs into
 * src/mcp/micro-map.ts and guarded at build time by the ADR-0003 text checks.
 * It carries no operation chains: `search` ranks operations, and a second router
 * written in prose drifts from it.
 */

export const FAMILY_LINE =
  "Families: lumenloop=community/editorial projects, research, content, SCF/funding; use for what's-been-said/editorial/freshness skims; scout=live ecosystem graph: projects, repos, people, hackathon builds, audits, stablecoins, partners; stellarDocs=official protocol/SDK/CLI/contracts/RPC/anchor/wallet docs; skills=tested build/integration/security playbooks.";

/**
 * Families whose own text is an official record for audit, incident, governance, and
 * standards-authorship claims. `name` is how the guard sentence names the family; the list is
 * joined in order, so a family added here is named in the sentence and exempt from the
 * standalone guard line with no other edit. Every `family` must be a real catalog service family
 * (checked at build time).
 */
export const CORROBORATING_FAMILIES = [
  { family: "stellarDocs", name: "Stellar Docs" },
  { family: "skills", name: "a skill" }
];

/**
 * The corroboration guard. The wording is frozen (tuning loop 2, amendment A2): it names the
 * record, not the party, and requires attribution rather than doubt for everything else.
 * `{families}` is replaced by the names of CORROBORATING_FAMILIES.
 */
export const CORROBORATION_GUARD_TEMPLATE =
  "Audit, incident, governance and standards-authorship claims are fact only when {families} or a primary record a result returned (the audit report itself, the standard's own file, the decision record) states them. Anything else, including a party's statement about itself (its own audit claim, its post-mortem, its marketing), is that source's claim: name the source and date, and do not state it as fact.";
