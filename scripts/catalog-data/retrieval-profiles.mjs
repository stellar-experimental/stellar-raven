/**
 * Query-independent retrieval contingencies. Keys and targets are exact
 * exposed operation IDs; no entity names, query strings, or paid operations
 * belong here. The catalog builder validates every edge and fails on drift.
 */

const BROAD_MISS = ["empty", "weak", "adjacent", "ambiguous"];
const CORROBORATE = ["weak", "adjacent", "ambiguous", "partial"];
const REPOSITORY_MISS = ["empty", "adjacent"];

export const RETRIEVAL_PROFILES = {
  "lumenloop.search_directory": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchProjects", relation: "cross-family", on: ["empty", "ambiguous"] },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "lumenloop.get_project": { lane: "detail", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchProjects", relation: "cross-family", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "lumenloop.find_content_by_entity": { lane: "exact", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "lumenloop.find_av_passages", relation: "different-medium", on: CORROBORATE }
  ] },
  "lumenloop.find_content_about_project": { lane: "semantic", emptyScope: "inconclusive", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "stellarDocs.search_docs", relation: "cross-family", on: CORROBORATE }
  ] },
  "lumenloop.search_documents": { lane: "exact", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "lumenloop.list_documents": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "lumenloop.search_content_semantic": { lane: "semantic", emptyScope: "inconclusive", recoverWith: [
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "stellarDocs.search_docs", relation: "cross-family", on: CORROBORATE },
    { id: "lumenloop.find_av_passages", relation: "different-medium", on: ["weak", "partial"] }
  ] },
  "lumenloop.find_av_passages": { lane: "av", emptyScope: "inconclusive", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "lumenloop.find_similar_scf_submissions": { lane: "semantic", emptyScope: "inconclusive", recoverWith: [
    { id: "scout.searchProjects", relation: "structured-identity", on: BROAD_MISS },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },

  "scout.getBuilders": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "lumenloop.find_av_passages", relation: "different-medium", on: CORROBORATE }
  ] },
  "scout.getPeople": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.getBuilders", relation: "structured-identity", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE }
  ] },
  "scout.listAudits": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE },
    { id: "stellarDocs.search_docs", relation: "cross-family", on: CORROBORATE }
  ] },
  "scout.getStablecoins": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchProjects", relation: "structured-identity", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE }
  ] },
  "scout.listContracts": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchRepos", relation: "source-code", on: ["empty", "partial"] },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.getRepoTrust": { lane: "detail", emptyScope: "operation", recoverWith: [
    { id: "scout.searchRepos", relation: "source-code", on: ["empty", "partial"] },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.searchProjects": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "scout.searchRepos", relation: "source-code", on: ["empty", "partial"] }
  ] },
  "scout.searchRepos": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "stellarDocs.search_docs", relation: "cross-family", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE }
  ] },
  "scout.getHackathons": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.searchHackathonBuilds": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchProjects", relation: "structured-identity", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE }
  ] },
  "scout.getHackathon": { lane: "detail", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.getRfps": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.getPartners": { lane: "directory", emptyScope: "operation", recoverWith: [
    { id: "scout.searchProjects", relation: "structured-identity", on: BROAD_MISS },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.searchResearch": { lane: "research", emptyScope: "corpus", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "cross-family", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: CORROBORATE },
    { id: "lumenloop.find_av_passages", relation: "different-medium", on: ["weak", "partial"] }
  ] },
  "scout.scfPitch": { lane: "research", emptyScope: "inconclusive", recoverWith: [
    { id: "lumenloop.find_similar_scf_submissions", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchHackathonBuilds", relation: "source-code", on: ["weak", "partial"] },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "scout.vetIdea": { lane: "research", emptyScope: "inconclusive", recoverWith: [
    { id: "lumenloop.find_similar_scf_submissions", relation: "broader-semantic", on: BROAD_MISS },
    { id: "scout.searchHackathonBuilds", relation: "source-code", on: ["weak", "partial"] },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },

  "stellarDocs.search_docs": { lane: "corpus", emptyScope: "corpus", recoverWith: [
    { id: "scout.searchResearch", relation: "cited-research", on: BROAD_MISS },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: BROAD_MISS },
    { id: "stellarDocs.search_meeting_notes", relation: "corpus-wide", on: ["empty", "partial"] }
  ] },
  "stellarDocs.search_doc_titles": { lane: "exact", emptyScope: "corpus", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_docs_in_category": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: CORROBORATE }
  ] },
  "stellarDocs.search_meeting_notes": { lane: "corpus", emptyScope: "corpus", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: CORROBORATE }
  ] },
  "stellarDocs.get_doc_page_sections": { lane: "detail", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_protocol_concepts_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: CORROBORATE }
  ] },
  "stellarDocs.search_rpc_horizon_data_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "scout.explainRepo", relation: "source-code", on: REPOSITORY_MISS },
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_sdk_cli_tools_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "scout.explainRepo", relation: "source-code", on: REPOSITORY_MISS },
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_soroban_contract_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "scout.explainRepo", relation: "source-code", on: REPOSITORY_MISS },
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_wallet_dapp_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE }
  ] },
  "stellarDocs.search_anchor_sep_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: CORROBORATE }
  ] },
  "stellarDocs.search_asset_token_docs": { lane: "corpus", emptyScope: "operation", recoverWith: [
    { id: "stellarDocs.search_docs", relation: "corpus-wide", on: BROAD_MISS },
    { id: "scout.searchResearch", relation: "cited-research", on: CORROBORATE },
    { id: "lumenloop.search_content_semantic", relation: "cross-family", on: CORROBORATE }
  ] }
};
