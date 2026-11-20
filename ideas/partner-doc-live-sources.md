# Live ecosystem-partner documentation as a Raven source

Status: held product idea (reviewed 2026-11-19: **hold stands**; no implementation round, no
promotion to phases 2–4). Reopen only if a trigger below fires. Raised as
[issue #1](https://github.com/stellar-experimental/stellar-raven/issues/1); dated evidence and the
full admission contract live in
[`research/partner-doc-source-onboarding.md`](../research/partner-doc-source-onboarding.md).

## Current decision

1. **Do not federate partner MCP servers.** Under [ADR-0003](../research/decisions/0003-build-time-exposure-filtering.md),
   model code never owns endpoints, arguments, auth, or exposure; federating a partner MCP inverts
   that boundary. Verified 2026-11-19: Alchemy's hosted MCP (`mcp.alchemy.com/mcp`) exposes 168
   tools behind OAuth 2.1 including account/app mutations (`create_app`, `update_app`,
   `update_allowlist`), and OpenZeppelin's hosted MCP (`mcp.openzeppelin.com`) advertises contract
   generation rather than documentation retrieval.
2. **Allowlisted first-party partner Markdown is a viable fourth authority class**, held behind a
   four-phase ship gate (no runtime adapter until it passes). Authority stays claim-scoped (Stellar
   Docs/SEPs/CAPs for protocol behavior; partner for its own products; pinned skills never override
   first-party reference docs); conflicts return as dated, attributed conflicts rather than merged
   facts.

## Why the hold stands (2026-11-19 review)

- **Narrow harness vs. full Raven recall:** The 2026-11-19 12-case harness run
  (`npm run eval:partner-docs -- --raven-url http://localhost:8795/mcp --json`) scored 21/96 (21.9%)
  baseline vs. 95/96 (99.0%) candidate (`retrievalAdmissionGate: "pass"`, median 118.3 ms / p95
  308.9 ms, 0 fetch errors, 0 prompt-signal hits). Adding broader current Raven reads
  (`stellarDocs.get_doc_page`, `scout.searchResearch`, `scout.searchProjects`, `stellarOrg`, pinned
  OZ skills) raises literal recall to 48/96 (50.0%): `alchemy-stellar-data-overview` reaches 8/8,
  `openzeppelin-stellar-suite` 7/8, `openzeppelin-stellar-rwa` 6/8, `openzeppelin-smart-account`
  5/8. Remaining gaps are Alchemy Stellar Data API endpoint contracts (absent everywhere; no public
  repo in Scout), OZ self-hosted Relayer policy fields, and OZ `FeeForwarder` (`scout.explainRepo`
  covers OZ repos via undated DeepWiki with `answerAsOf: null`).
- **Live failures do not clear the reopen bar:** Weekly upstream `coverage-watch`
  ([stellarlight#562](https://github.com/Stellar-Light/stellarlight/issues/562), 2026-11-16) shows 1
  of 4 `own` (Sentora), 3 of 4 `mention` (Alchemy, OpenZeppelin, Chainlink), 0 `none`. Recorded
  live failures: 0 for Alchemy (`sd-010` / [stellarlight#446](https://github.com/Stellar-Light/stellarlight/pull/446)
  healed the issue's example); 0 unqualified for OpenZeppelin (at most 1 stale-skill failure if
  excluding undated DeepWiki: [`sk-022`](../improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md),
  while [`sk-025`](../improvements/skills/sk-025-trustless-work-beta-auth-scope.md) is outside the
  two candidate partners); 0 unreached Alchemy/OZ gaps in round item 1.3. Production demand is
  unmeasured (no query logging today).
- **Phases 2–4 unstarted; two operational drifts before any phase-2 run:**
  - Alchemy Markdown endpoints now return `cache-control: public, max-age=0, must-revalidate` with
    no `ETag` or `Last-Modified`, giving a 0s TTL and no 304 revalidation under the draft
    `min(upstream max-age, 1h)` rule.
  - `eval/partner-docs/cases.json` pins `OpenZeppelin/docs` at `f304ed55` (`relayer/1.4.x/stellar.mdx`),
    while `main` (`4d74c325`, 2026-11-17) moved to Relayer `1.8.x` / `content/relayer/stellar.mdx`
    and added Vault and Confidential Token modules (classic-only fee-token constraint still holds).

## Triggers to revisit

- **Markdown source lane (promote to phase 2):** two unrelated, live-reproduced production or
  owned-QA failures where (1) the fact exists on a current first-party partner page, (2) no exposed
  source (after improvements-pipeline fixes) returns dated, quotable support, and (3) the cause is
  source coverage, not answer craft, stale truth metadata, or routing — **or** measured production
  demand once query observability ships showing repeated partner-endpoint misses.
- **MCP federation:** only if a partner ships a read-only, unauthenticated, documentation-scoped
  MCP surface with a stable tool contract (more tools is evidence against).

## Re-evaluation requirements

If a trigger fires:

1. Refresh OpenZeppelin's pinned commit/Relayer path in `eval/partner-docs/cases.json`, widen the
   harness baseline to full current Raven sources, and re-run
   `npm run eval:partner-docs -- --raven-url <bound URL>/mcp --json` over all 12 cases (omitting
   `--raven-url` measures only the candidate arm and returns `inconclusive`).
2. Re-check weekly `coverage-watch` ([stellarlight#562](https://github.com/Stellar-Light/stellarlight/issues/562))
   and live-failure counts; delete this idea if both coverage residue and live failures are empty,
   or keep held if qualifying live failures remain < 2 without telemetry demand.
3. Settle caching for `max-age=0, must-revalidate` sources (Alchemy) before phase-2 24h reliability
   probes.
4. Build one manifest-authored, closure-captured host adapter (never generic `fetch_url`,
   caller-selected endpoints, or an MCP proxy).
5. Treat fetched prose as untrusted data (never in catalog descriptions, server instructions, or
   error hints) and honor serve-do-not-store ([`ARCHITECTURE.md`](../ARCHITECTURE.md) §6).
6. Phase 3 (paired headline QA, ≥16 cases, ≥3 net `wrong/partial -> correct` wins, zero new wrong
   answers, zero unsupported partner claims, verified provenance on every partner-specific claim,
   and OZ incremental value beyond existing skills/docs) is the ship gate, not phase 1.

## References

- [`research/partner-doc-source-onboarding.md`](../research/partner-doc-source-onboarding.md),
  [`scripts/eval-partner-docs.mjs`](../scripts/eval-partner-docs.mjs),
  [`eval/partner-docs/README.md`](../eval/partner-docs/README.md),
  [`source-addition.md`](../.agents/skills/run-evals/references/source-addition.md)
- Resolved example: `sd-010` (`stellar/stellar-docs#2573`, [`improvements/resolved.json`](../improvements/resolved.json));
  active findings: [`sk-022`](../improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md),
  [`sk-025`](../improvements/skills/sk-025-trustless-work-beta-auth-scope.md)
- Upstream Stellar Light work: `#446`, `#448`, `#561`/`#562`, `#564`, `#565`, `#657`
