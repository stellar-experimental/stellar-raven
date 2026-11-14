/**
 * Source-family orientation for the discovery micro-map.
 *
 * Authored data, guarded at build time:
 * - every `family` must be a real catalog service family.
 * - emitted prose is checked by the ADR-0003 text guards.
 *
 * The map names what each family can ground and who is the authority. It
 * carries no operation chains: `search` ranks operations, and a second router
 * written in prose drifts from it.
 */

export const SERVICE_FAMILY_PURPOSES = [
  {
    family: "lumenloop",
    label: "Lumenloop",
    line:
      "Community and editorial ecosystem intelligence: project directory/details, published research, documents, content search, AV passages, SCF submissions, related projects, and similar-project discovery.",
    authority:
      "Primary for project dossiers, funding or SCF context, editorial/community content, and ecosystem narratives; corroborate governance, standards, incident, and audit claims."
  },
  {
    family: "scout",
    label: "Scout",
    line:
      "Stellar Light/Scout ecosystem graph: projects, repos, builders, SDF people, hackathons and prior-art builds, audits, stablecoins, leaderboards, research, skills, partners, clusters, changelog, and status.",
    authority:
      "Primary for people, events, repos, partners, project discovery, and comparative ecosystem views; corroborate editorial/funding context with Lumenloop."
  },
  {
    family: "stellarDocs",
    label: "Stellar Docs",
    line:
      "Official Stellar documentation and meeting-note search: protocol concepts, SDK/CLI, smart contracts, RPC/Horizon, anchors, assets, wallets, dapps, and page sections.",
    authority:
      "Authority for protocol behavior, standards status, API shape, implementation reference, and current official wording."
  },
  {
    family: "skills",
    label: "Skills",
    line:
      "Pinned operational playbooks: tested build, integration, security, recovery, data, wallet, asset, standards, ZK, and agentic-payment procedures.",
    authority:
      "Authority for how-to workflows when read by section; pair with Stellar Docs for current reference truth and services for live ecosystem facts."
  }
];

export const FAMILY_LINE =
  "Families: lumenloop=community/editorial projects, research, content, SCF/funding; use for what's-been-said/editorial/freshness skims; scout=live ecosystem graph: projects, repos, people, hackathon builds, audits, stablecoins, partners; stellarDocs=official protocol/SDK/CLI/contracts/RPC/anchor/wallet docs; skills=tested build/integration/security playbooks.";

export const AUTHORITY_RULES = [
  "Use the family that can actually ground the claim, then add a corroborating family when the question crosses source boundaries.",
  "Treat Scout research items and Lumenloop articles/content as community-aggregated sources; protocol-governance, standards-authorship, incident, and audit claims stay unverified until corroborated by Stellar Docs or skills content.",
  "Official docs are authority for protocol, standards, API, and implementation claims; for ecosystem facts (funding/awards/amounts, program names, coverage/directories, who-builds-what, adoption), start Scout/Lumenloop even when docs mention the topic, then use docs only to corroborate standards mechanics."
];
