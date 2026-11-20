/**
 * Source-family orientation emitted into src/mcp/family-text.ts by scripts/build-family-text.mjs.
 * Keep operation chains out of prose; ADR-0003 text checks guard emitted text at build time.
 */

export const FAMILY_LINE =
  "Families: lumenloop=community/editorial projects, research, content, SCF/funding; use for what's-been-said/editorial/freshness skims; scout=live ecosystem graph: projects, repos, people, hackathon builds, audits, stablecoins, partners; stellarDocs=official protocol/SDK/CLI/contracts/RPC/anchor/wallet docs; stellarOrg=SDF site: strategy, roadmap, programs, provider and audit directories; skills=tested build/integration/security playbooks.";

/**
 * Opening line of the `search` description (must end in `.` and fit in SEARCH_OPENING_MAX_CHARS
 * for clients that truncate at 117 chars). `{families}` expands from the catalog manifest.
 */
export const SEARCH_OPENING_TEMPLATE = "Ranked search over {families} operations and skills. Hits are cards, not evidence.";
export const SEARCH_OPENING_MAX_CHARS = 117;

/**
 * Families whose own text counts as an official record for audit/incident/governance/standards
 * claims (validated against catalog service families at build time).
 */
export const CORROBORATING_FAMILIES = [
  { family: "stellarDocs", name: "Stellar Docs" },
  { family: "skills", name: "a skill" }
];

/** Frozen corroboration guard wording (`{families}` expands from CORROBORATING_FAMILIES). */
export const CORROBORATION_GUARD_TEMPLATE =
  "Audit, incident, governance and standards-authorship claims are fact only when {families} or a primary record a result returned (the audit report itself, the standard's own file, the decision record) states them. Anything else, including a party's statement about itself (its own audit claim, its post-mortem, its marketing), is that source's claim: name the source and date, and do not state it as fact.";
