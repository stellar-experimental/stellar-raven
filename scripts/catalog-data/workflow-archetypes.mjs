/**
 * Workflow archetypes for the discovery micro-map and vector search cards.
 *
 * Authored data, guarded at build time:
 * - `families` must be real catalog service families.
 * - every `steps[]` value must be an exact exposed manifest id.
 * - emitted prose is checked by the ADR-0003 text guards.
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

export const WORKFLOW_ARCHETYPES = [
  {
    id: "project-funding-lookup",
    title: "Project/funding lookup",
    questionShape: "Who builds/funds project X, and which named SCF Build/Liquidity/Public-Goods award or grant program, award amount, or ecosystem context applies?",
    families: ["lumenloop", "scout"],
    steps: [
      "lumenloop.search_directory",
      "lumenloop.get_project",
      "lumenloop.get_scf_submissions",
      "scout.searchProjects",
      "scout.getBuilders"
    ]
  },
  {
    id: "editorial-community-content",
    title: "Editorial/community content",
    questionShape: "What has the ecosystem written or said about X?",
    families: ["lumenloop"],
    steps: [
      "lumenloop.search_content_semantic",
      "lumenloop.find_content_about_project",
      "lumenloop.search_documents",
      "lumenloop.get_document"
    ]
  },
  {
    id: "protocol-sdk-factual",
    title: "Protocol/SDK factual",
    questionShape: "What does Stellar officially say about protocol, SDK, CLI, or API behavior?",
    families: ["stellarDocs"],
    steps: [
      "stellarDocs.search_protocol_concepts_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "stellarDocs.search_docs",
      "stellarDocs.get_doc_page_sections"
    ]
  },
  {
    id: "build-integrate-implementation",
    title: "Design/build/integrate",
    questionShape: "How should I design a Stellar contract, dapp, SDK, protocol, or infrastructure component?",
    families: ["scout", "skills", "stellarDocs"],
    steps: [
      "scout.searchProjects",
      "scout.searchRepos",
      "skills.stellar-dev.smart-contracts",
      "stellarDocs.search_soroban_contract_docs",
      "skills.stellar-dev.dapp",
      "stellarDocs.search_wallet_dapp_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "skills.stellar-dev.standards",
      "stellarDocs.search_protocol_concepts_docs",
      "skills.stellar-dev.data",
      "stellarDocs.search_rpc_horizon_data_docs"
    ]
  },
  {
    id: "implementation-debug",
    title: "Known-step implementation/debug",
    questionShape: "How do I implement, deploy, or debug one already-scoped Stellar step?",
    families: ["skills", "stellarDocs"],
    steps: [
      "skills.stellar-dev.smart-contracts",
      "stellarDocs.search_soroban_contract_docs",
      "skills.stellar-dev.dapp",
      "stellarDocs.search_wallet_dapp_docs"
    ]
  },
  {
    id: "ecosystem-people-events",
    title: "Ecosystem people/events",
    questionShape: "Who participated, built, won, or showed up in a hackathon or ecosystem event?",
    families: ["scout", "lumenloop"],
    steps: [
      "scout.getHackathons",
      "scout.getHackathon",
      "scout.searchHackathonBuilds",
      "scout.getPeople",
      "scout.getBuilders",
      "lumenloop.search_directory",
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]
  },
  {
    id: "evidence-poor-open-world-recovery",
    title: "Evidence-poor open-world recovery",
    questionShape: "Who or what is an obscure Stellar entity, what is its history, or what should I do when narrow lookups return empty or only adjacent candidates?",
    families: ["lumenloop", "scout", "stellarDocs"],
    steps: [
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "scout.searchProjects",
      "stellarDocs.search_docs",
      "lumenloop.find_av_passages"
    ]
  },
  {
    id: "incident-audit-claim",
    title: "Incident/audit claim",
    questionShape: "Did an incident, exploit, audit finding, or governance claim happen?",
    families: ["scout", "lumenloop", "stellarDocs", "skills"],
    steps: [
      "scout.listAudits",
      "lumenloop.search_content_semantic",
      "lumenloop.find_av_passages",
      "stellarDocs.search_docs",
      "skills.lumenloop.stellar-content-auditor"
    ]
  },
  {
    id: "asset-anchor-coverage",
    title: "Asset/anchor coverage",
    questionShape: "Which/how many assets, anchors, rails, or partners cover a payment/tokenization flow, including exhaustive directory or coverage listings?",
    families: ["scout", "lumenloop", "stellarDocs", "skills"],
    steps: [
      "scout.getStablecoins",
      "scout.getPartners",
      "lumenloop.search_directory",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_anchor_sep_docs",
      "stellarDocs.search_asset_token_docs",
      "skills.stellar-dev.assets"
    ]
  },
  {
    id: "wallet-tooling-comparison",
    title: "Wallet/tooling comparison",
    questionShape: "Which wallet, SDK, repo, or tool should I compare or use?",
    families: ["stellarDocs", "skills", "scout"],
    steps: [
      "stellarDocs.search_wallet_dapp_docs",
      "skills.stellar-dev.dapp",
      "scout.searchRepos",
      "scout.explainRepo"
    ]
  },
  {
    id: "data-rpc-indexing",
    title: "Data/RPC indexing",
    questionShape: "How do I read chain data, transactions, events, ledgers, or history?",
    families: ["stellarDocs", "skills"],
    steps: [
      "stellarDocs.search_rpc_horizon_data_docs",
      "skills.stellar-dev.data",
      "stellarDocs.get_doc_page_sections"
    ]
  },
  {
    id: "landscape-similarity",
    title: "Landscape/similarity scan",
    questionShape: "What projects are similar to X, adjacent to a category, or part of a landscape?",
    families: ["lumenloop", "scout"],
    steps: [
      "lumenloop.find_similar_projects_semantic",
      "scout.analyzeEcosystem",
      "scout.getClusters"
    ]
  }
];
