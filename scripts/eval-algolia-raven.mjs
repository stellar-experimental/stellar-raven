#!/usr/bin/env node
/**
 * Probe Algolia strategies for Raven-facing Stellar Docs retrieval.
 *
 * This is intentionally read-only: it never creates indexes, rules, synonyms,
 * events, or crawler tasks. Use it before changing Raven routing or Algolia
 * settings so the known improvements-derived cases have a repeatable baseline.
 */
import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { RULE_CANARY_CASES } from "./lib/algolia-rule-canary.mjs";

const PRIMARY_INDEX = "crawler_Stellar Docs - Docusaurus";
const DOCS_FACET = [["docusaurus_tag:docs-default-current"]];
const MEETINGS_FACET = [["docusaurus_tag:-docs-default-current"]];

const CASES = [
  ...RULE_CANARY_CASES.map(({ assertionPrefix: _assertionPrefix, ...testCase }) => testCase),
  {
    id: "sd-001-software-versions-rank-one",
    category: "software versions",
    finding: "sd-001",
    query: "Protocol 24",
    expectUrlIncludes: ["/docs/networks/software-versions"],
    monitorOnly: true,
    expectedPrimaryRulesRank: 1,
    note: "Monitor only: the sd-001 crawler fix should keep the software-versions page at rank 1 with rules enabled and disabled."
  },
  {
    id: "sd-003-gettransactions-limits",
    category: "RPC getTransactions",
    finding: "sd-003",
    query: "getTransactions pagination limit default 50 max 200",
    expectUrlIncludes: ["/docs/data/apis/rpc/"],
    note: "RPC pagination facts should surface from indexed config/structure pages or a supplement."
  },
  {
    id: "sd-005-ap2-acp-agentic-commerce",
    category: "AP2/ACP",
    finding: "sd-005",
    query: "AP2 ACP Agentic Commerce Protocol Google agentic payments",
    expectTextIncludesAny: ["AP2", "Agentic Commerce Protocol", "ACP"],
    note: "A hit counts only when its returned text actually names AP2/ACP; generic x402/MPP meetings content is not landscape grounding."
  },
  {
    id: "opv-account-merge-reserve",
    category: "operation vocabulary",
    finding: "routing-control",
    query: "account merge reclaim base reserve trustlines offers subentries",
    expectUrlIncludes: ["/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/account-merge", "/docs/learn/fundamentals/transactions/list-of-operations"],
    note: "Classic operation vocabulary should reach account-merge result codes or operation docs."
  },
  {
    id: "opv-sponsored-reserves",
    category: "operation vocabulary",
    finding: "routing-control",
    query: "sponsored reserves num_sponsored revoke sponsorship CAP-33",
    expectUrlIncludes: ["/docs/build/guides/transactions/sponsored-reserves", "/docs/learn/fundamentals/transactions/list-of-operations"],
    note: "Sponsored reserve terms should reach the sponsored-reserves guide or operation list."
  },
  {
    id: "opv-claimable-balance-predicates",
    category: "operation vocabulary",
    finding: "routing-control",
    query: "claimable balance predicates claimant reclaim",
    expectUrlIncludes: ["/docs/build/guides/transactions/claimable-balances", "/docs/learn/fundamentals/transactions/list-of-operations"],
    note: "Claimable-balance predicate vocabulary should reach the guide or operation list."
  },
  {
    id: "opv-require-auth",
    category: "operation vocabulary",
    finding: "routing-control",
    query: "require_auth authorize_as_current_contract msg.sender",
    expectUrlIncludes: ["/docs/learn/fundamentals/contract-development/authorization"],
    note: "Soroban auth vocabulary should reach the contract authorization docs."
  }
];

const STRATEGIES = [
  {
    id: "primary-docs-rules",
    label: "primary+rules docs",
    index: PRIMARY_INDEX,
    params: { facetFilters: DOCS_FACET }
  },
  {
    id: "primary-docs-no-rules",
    label: "primary-only docs",
    index: PRIMARY_INDEX,
    params: { facetFilters: DOCS_FACET, enableRules: false }
  },
  {
    id: "primary-meetings-rules",
    label: "primary+rules meetings",
    index: PRIMARY_INDEX,
    params: { facetFilters: MEETINGS_FACET }
  },
  {
    id: "primary-meetings-no-rules",
    label: "primary-only meetings",
    index: PRIMARY_INDEX,
    params: { facetFilters: MEETINGS_FACET, enableRules: false }
  }
];

function parseArgs(argv) {
  const out = { hitsPerPage: 10, json: false, envFile: undefined, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") out.json = true;
    else if (arg === "--self-test") out.selfTest = true;
    else if (arg === "--env-file") out.envFile = argv[++i];
    else if (arg === "--hits") out.hitsPerPage = Number(argv[++i]);
    else throw new Error(`unknown argument: ${arg}`);
  }
  return out;
}

function loadDotEnv(path) {
  if (!path || !existsSync(path)) return {};
  const env = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function envCandidates(explicit) {
  return [
    explicit,
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "..", "stellar-raven-codemode", ".env")
  ].filter(Boolean);
}

function requireAlgoliaEnv(args) {
  const fileEnv = Object.assign({}, ...envCandidates(args.envFile).map(loadDotEnv));
  const applicationId = process.env.ALGOLIA_APPLICATION_ID_DOCS || fileEnv.ALGOLIA_APPLICATION_ID_DOCS;
  const apiKey = process.env.ALGOLIA_API_KEY_DOCS || fileEnv.ALGOLIA_API_KEY_DOCS;
  if (!applicationId || !apiKey) {
    throw new Error("ALGOLIA_APPLICATION_ID_DOCS / ALGOLIA_API_KEY_DOCS are required; pass --env-file if .env is elsewhere");
  }
  return { applicationId, apiKey };
}

function breadcrumb(hit) {
  const h = hit.hierarchy ?? {};
  const parts = [];
  for (let i = 0; i <= 6; i++) {
    if (typeof h[`lvl${i}`] === "string" && h[`lvl${i}`]) parts.push(h[`lvl${i}`]);
  }
  return parts.join(" > ");
}

function shapeHit(hit, rank) {
  return {
    rank,
    url: hit.url_without_anchor || hit.url,
    anchor: hit.anchor,
    breadcrumb: breadcrumb(hit) || [hit.title, hit.heading].filter(Boolean).join(" > "),
    snippet: hit._snippetResult?.content?.value || hit._snippetResult?.text?.value || hit.content?.slice(0, 220) || hit.text?.slice(0, 220) || ""
  };
}

async function algoliaQuery({ applicationId, apiKey }, index, params) {
  const res = await fetch(`https://${applicationId}-dsn.algolia.net/1/indexes/${encodeURIComponent(index)}/query`, {
    method: "POST",
    headers: {
      "X-Algolia-Application-Id": applicationId,
      "X-Algolia-API-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(8000)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${index}: ${body.message || `HTTP ${res.status}`}`);
  return body;
}

function applyClientFilter(hits, clientFilter) {
  if (!clientFilter?.prefixesAnyOf) return hits;
  return hits.filter((hit) => {
    const value = hit[clientFilter.field];
    return typeof value === "string" && clientFilter.prefixesAnyOf.some((prefix) => value.startsWith(prefix));
  });
}

function containsBoundedTerm(text, term) {
  const words = term.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  const phrase = words
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${phrase})(?=$|[^\\p{L}\\p{N}_])`, "iu").test(text);
}

function rankExpected(hits, testCase) {
  const expectedUrls = testCase.expectUrlIncludes ?? [];
  const requiredText = testCase.expectTextIncludesAll ?? [];
  const alternativeText = testCase.expectTextIncludesAny ?? [];
  const index = hits.findIndex((hit) => {
    if (expectedUrls.length && !expectedUrls.some((item) => hit.url?.includes(item))) return false;
    const searchable = [hit.url, hit.breadcrumb, hit.snippet]
      .filter(Boolean)
      .join(" ")
      .replace(/\*\*/g, " ")
      .replace(/<[^>]+>/g, " ")
      .normalize("NFKC");
    if (requiredText.some((item) => !containsBoundedTerm(searchable, item))) return false;
    if (alternativeText.length && !alternativeText.some((item) => containsBoundedTerm(searchable, item))) return false;
    return expectedUrls.length > 0 || requiredText.length > 0 || alternativeText.length > 0;
  });
  return index < 0 ? null : index + 1;
}

function expectedLabel(testCase) {
  const groups = [];
  if (testCase.expectUrlIncludes?.length) {
    groups.push(`url-any(${testCase.expectUrlIncludes.join(" | ")})`);
  }
  if (testCase.expectTextIncludesAll?.length) {
    groups.push(`text-all(${testCase.expectTextIncludesAll.join(" + ")})`);
  }
  if (testCase.expectTextIncludesAny?.length) {
    groups.push(`text-any(${testCase.expectTextIncludesAny.join(" | ")})`);
  }
  return groups.join(" AND ");
}

async function runCase(auth, testCase, strategy, hitsPerPage) {
  const requestedHits = Math.max(hitsPerPage, strategy.params.hitsPerPage ?? hitsPerPage);
  const body = await algoliaQuery(auth, strategy.index, {
    analytics: false,
    query: testCase.query,
    hitsPerPage: requestedHits,
    attributesToRetrieve: ["url", "url_without_anchor", "anchor", "hierarchy", "type", "content", "title", "heading"],
    attributesToSnippet: ["content:24", "text:24"],
    highlightPreTag: "**",
    highlightPostTag: "**",
    ...strategy.params
  });
  const filtered = applyClientFilter(body.hits ?? [], strategy.clientFilter).slice(0, hitsPerPage);
  const hits = filtered.map(shapeHit);
  return {
    strategy: strategy.id,
    index: strategy.index,
    nbHits: body.nbHits,
    returned: hits.length,
    expectedRank: rankExpected(hits, testCase),
    topUrl: hits[0]?.url ?? null,
    hits
  };
}

function summarize(results) {
  return results.map((item) => {
    const bestAny = item.results
      .filter((r) => r.expectedRank !== null)
      .sort((a, b) => a.expectedRank - b.expectedRank)[0];
    const primaryRulesBest = bestRank(item.results, ["primary-docs-rules", "primary-meetings-rules"]);
    const primaryNoRulesBest = bestRank(item.results, ["primary-docs-no-rules", "primary-meetings-no-rules"]);
    const primaryGood = primaryRulesBest !== null && primaryRulesBest <= 3;
    const monitorExpectationMet = item.monitorOnly
      ? primaryRulesBest === item.expectedPrimaryRulesRank && primaryNoRulesBest === item.expectedPrimaryRulesRank
      : undefined;
    return {
      id: item.id,
      category: item.category,
      finding: item.finding,
      query: item.query,
      primaryRulesBest,
      primaryNoRulesBest,
      bestStrategy: bestAny?.strategy ?? null,
      bestRank: bestAny?.expectedRank ?? null,
      recommendation: item.monitorOnly
        ? monitorExpectationMet
          ? `Monitor only: the target remains at expected rank #${item.expectedPrimaryRulesRank} with rules enabled and disabled.`
          : `Monitor only: expected rank #${item.expectedPrimaryRulesRank} with rules enabled and disabled; observed rules=${rankLabel(primaryRulesBest)}, no-rules=${rankLabel(primaryNoRulesBest)}; investigate crawler or index drift.`
        : primaryGood
        ? "Primary DocSearch now covers this in the top 3; keep this as a regression check for crawler/rule drift."
        : bestAny && bestAny.expectedRank <= 3
          ? "A non-default primary query strategy can cover this; prefer routing/category selection over adding a second docs op."
          : "Needs supplement records or upstream indexing/rules; query strategy alone did not reach the target."
    };
  });
}

function bestRank(results, strategyIds) {
  const ranks = results
    .filter((r) => strategyIds.includes(r.strategy) && r.expectedRank !== null)
    .map((r) => r.expectedRank);
  return ranks.length ? Math.min(...ranks) : null;
}

function rankLabel(rank) {
  return rank === null || rank === undefined ? "miss" : `#${rank}`;
}

function printHuman(results) {
  for (const item of results) {
    console.log(`\n## ${item.id} (${item.category}; ${item.finding})`);
    console.log(`query: ${item.query}`);
    console.log(`target: ${expectedLabel(item)}`);
    for (const result of item.results) {
      const rank = result.expectedRank === null ? "miss" : `#${result.expectedRank}`;
      console.log(`- ${result.strategy}: ${rank}; top=${result.topUrl ?? "none"}; nbHits=${result.nbHits}`);
    }
  }

  console.log("\n## Evidence table");
  console.log("| Category | Case | Primary+rules | Primary-only (rules disabled) | Best | Decision note |");
  console.log("|---|---|---:|---:|---|---|");
  for (const row of summarize(results)) {
    const best = row.bestStrategy ? `${row.bestStrategy} ${rankLabel(row.bestRank)}` : "none";
    console.log(
      `| ${row.category} | ${row.id} | ${rankLabel(row.primaryRulesBest)} | ${rankLabel(row.primaryNoRulesBest)} | ${best} | ${row.recommendation} |`
    );
  }
}

function runMatcherSelfTest() {
  const byId = (id) => CASES.find((testCase) => testCase.id === id);
  const hit = (snippet, url = "https://developers.stellar.org/unrelated") => ({
    url,
    breadcrumb: "",
    snippet,
  });
  const sd001 = byId("sd-001-software-versions-rank-one");
  const sd005 = byId("sd-005-ap2-acp-agentic-commerce");
  const textAll = { expectTextIncludesAll: ["state", "archival", "Whisk"] };

  assert.equal(rankExpected([hit("Protocol 24", "https://developers.stellar.org/meetings/2025/10/16")], sd001), null);
  assert.equal(rankExpected([hit("Protocol 24", "https://developers.stellar.org/docs/networks/software-versions")], sd001), 1);
  assert.equal(rankExpected([
    hit("unrelated"),
    hit("Protocol 24", "https://developers.stellar.org/docs/networks/software-versions")
  ], sd001), 2);

  assert.equal(rankExpected([hit("generic x402 and MPP meeting notes")], sd005), null);
  assert.equal(rankExpected([hit("SNAP2 upgrade notes")], sd005), null);
  assert.equal(rankExpected([hit("SACP migration notes")], sd005), null);
  assert.equal(rankExpected([hit("AP2 coordinates agent payment mandates")], sd005), 1);
  assert.equal(rankExpected([hit("Agentic Commerce Protocol")], sd005), 1);
  assert.equal(rankExpected([hit("ACP")], sd005), 1);

  assert.equal(rankExpected([hit("state archival")], textAll), null);
  assert.equal(rankExpected([hit("Whisk state archival")], textAll), 1);

  const monitorResults = (rulesRank, noRulesRank) => [{
    ...sd001,
    results: [
      { strategy: "primary-docs-rules", expectedRank: rulesRank },
      { strategy: "primary-docs-no-rules", expectedRank: noRulesRank }
    ]
  }];
  assert.match(summarize(monitorResults(1, 1))[0].recommendation, /rules enabled and disabled/);
  assert.match(summarize(monitorResults(1, 2))[0].recommendation, /observed rules=#1, no-rules=#2/);
  assert.match(summarize(monitorResults(null, null))[0].recommendation, /observed rules=miss, no-rules=miss/);

  console.log("Algolia semantic matcher self-test ok (14 controls)");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) {
    runMatcherSelfTest();
    return;
  }
  const auth = requireAlgoliaEnv(args);
  const results = [];
  for (const testCase of CASES) {
    const caseResults = [];
    for (const strategy of STRATEGIES) {
      caseResults.push(await runCase(auth, testCase, strategy, args.hitsPerPage));
    }
    results.push({ ...testCase, results: caseResults });
  }
  if (args.json) console.log(JSON.stringify({ generatedAt: new Date().toISOString(), cases: results, summary: summarize(results) }, null, 2));
  else printHuman(results);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
