# Live ecosystem-partner documentation as a Raven source

Status: held product idea (reviewed 2026-11-19: **hold stands**; no implementation round, no
promotion to phases 2–4). Reopen only if one of the triggers below fires. Raised as
[issue #1](https://github.com/stellar-experimental/stellar-raven/issues/1); the dated evidence and
the full admission contract live in
[`research/partner-doc-source-onboarding.md`](../research/partner-doc-source-onboarding.md).

## Current decision

The issue asks one question and it resolves into two answers that point in opposite directions.

**1. Do not federate partner MCP servers.** Not as an integration rule, and not for the two
partners named. This declines the mechanism asked for in the issue thread itself — "ideally we'd
tap into their docs mcps if they have them" and "most should have by now" (2026-07-09) — so it owes
those commenters a reason. The reason is a measured finding about what those servers actually are,
not a position on MCP:

- Alchemy's hosted MCP documents 168 tools behind OAuth 2.1, including account/app mutations such
  as `create_app`, `update_app`, `select_app`, and `update_allowlist`. Mounting it to read
  documentation would import an authenticated operational surface Raven did not ask for.
- OpenZeppelin's hosted MCP advertises contract *generation*, not documentation retrieval. It
  answers a different question than the one this issue is about.

Raven's whole boundary is that model code never owns endpoints, arguments, auth, or exposure
(ADR-0003). A federated partner MCP inverts that: the partner decides what is callable, and the
tool surface changes underneath us without a repo change.

**2. Allowlisted first-party partner Markdown is a credible fourth authority class** — and it is
the mechanism that actually delivers what the issue wants. Partner docs are authoritative for that
partner's own products, and their public Markdown is a bounded, reviewable, commit-pinnable source.
The design is written and the retrieval evidence is strong. It is **held behind a four-phase ship
gate**, and no runtime adapter ships until that gate passes.

Authority stays claim-scoped, never a global ranking: Stellar Docs, SEPs, and CAPs remain
authoritative for protocol behavior; a partner is authoritative for its own products; mirrored
skills are procedural interpretation pinned to a commit and never override newer first-party
reference docs. Conflicts are returned as conflicts, with dates and provenance — never merged into
a synthetic fact, and never resolved by letting the newer timestamp silently win.

## Why the HOLD currently stands

- **Phase 1 retrieval admission now passes, with a smaller measured gap than the July upper bound.**
  The 2026-11-19 paired 12-case run (`npm run eval:partner-docs -- --raven-url …`, zero baseline or
  candidate fetch errors, zero prompt-signal hits) scored **21/96 (21.9%)** on the harness baseline
  across 85 distinct fact groups (18/64 = **28.1%** on the original eight, up from 7/64 = 10.9% on
  2026-07-10; 3/32 = **9.4%** on the four independent cases) versus **95/96 (99.0%)** on the
  candidate arm (+77.1 percentage points, 12 wins, 0 regressions, median 118.3 ms / p95 308.9 ms;
  `retrievalAdmissionGate: "pass"`).
- **Current full-Raven sources close half the gap, leaving a real but low-demand residue.**
  The harness baseline still reads only a narrow subset of Raven on OpenZeppelin (one pinned skill
  or `stellarDocs.search_sdk_cli_tools_docs`) and omits full page reads and `scout.searchProjects`
  on Alchemy. Unioning the harness baseline with all partner-relevant Raven sources on 2026-11-19
  (`stellarDocs.get_doc_page`, `stellarDocs.search_docs`, `scout.searchResearch`,
  `scout.searchProjects`, `stellarOrg.search_site`, and the three pinned OpenZeppelin skills,
  excluding echoed query strings) raises literal Raven recall from **21/96 (21.9%)** to **48/96
  (50.0%)** — even counting incidental hits such as `Lazy`/`Eager` from upgrade-migration audits
  rather than `FeeForwarder`:
  - *Now largely covered:* `alchemy-stellar-data-overview` reaches **8/8** (`/docs/data/indexers`
    via `sd-010`, plus Scout); `openzeppelin-stellar-suite` reaches **7/8**
    (`/docs/tools/openzeppelin-contracts`, Scout audits); `openzeppelin-stellar-rwa` reaches
    **6/8**; `openzeppelin-smart-account` reaches **5/8**.
  - *Still absent across all probed Raven sources (48/96, including 1 known authoring defect in
    `alchemy-stellar-balances`):* Alchemy Stellar Data API endpoint contracts
    (`/data/stellar/transfers`, `/data/stellar/balances`, `/data/stellar/nfts`, `transferType`,
    `fromLedger`/`toLedger`, the `api.g.alchemy.com` vs `stellar-mainnet.g.alchemy.com` host split,
    mutually exclusive `contractId` vs `assetCode`/`assetIssuer` NFT filters, `asOfLedger`,
    `Invalid pageKey`, `Max holdings per page`, `Bearer` auth) and Alchemy RPC quickstart details
    (`getNetwork`, `apiKey`, `getLatestLedger`, `getLedgerEntries` in an Alchemy context);
    OpenZeppelin self-hosted Relayer policy config (`/docs/tools/openzeppelin-relayer` covers only
    the managed Channels service, omitting `fee_payment_strategy`, `allowed_tokens`,
    `concurrent_transactions`, and the classic-only `credit_alphanum4`/`credit_alphanum12`
    sponsored-transaction limit); and OpenZeppelin's `FeeForwarder` fee-abstraction contract
    (`FeeForwarder`, `max_fee_amount`, `collect_fee_and_invoke`, `set_allowed_fee_token`,
    `sweep_token`, off-chain simulation).
- **Upstream `coverage-watch` confirms the gap persists, but live failures do not meet the reopen
  bar.** The 2026-11-16 [`coverage-watch` run](https://github.com/Stellar-Light/stellarlight/issues/562)
  (weekly since 2026-11-12) reports **1 of 4 `own`** (Sentora via `lumenloop-research`), **3 of 4
  `mention`** (Alchemy via `dev-docs`, OpenZeppelin via `audit`, Chainlink via `sdf-blog`), and
  **0 of 4 `none`**. That aligns with
  [stellarlight#448](https://github.com/Stellar-Light/stellarlight/pull/448), which declined to
  ingest copies of partner docs (narrower than this hold, since request-time allowlisted fetch
  under serve-do-not-store is not a copy). Even so, the live-failure residue across Raven's owned
  QA battery and `improvements/` ledger does not clear the two-failure trigger:
  - *Alchemy:* **0** owned-QA or production failures. The issue's concrete example healed upstream
    via `stellar/stellar-docs#2573` (`sd-010`, live 2026-07-15) and
    [stellarlight#446](https://github.com/Stellar-Light/stellarlight/pull/446).
  - *OpenZeppelin:* **1** owned-QA failure —
    [`sk-022`](../improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md)
    (`q-soroban-oz-upgradeable-macro`, where the pinned `upgrade-stellar-contracts` skill still
    teaches retired `#[derive(Upgradeable)]` / `#[derive(UpgradeableMigratable)]` macros while
    `docs.openzeppelin.com/stellar-contracts/utils/upgradeable` teaches direct `impl Upgradeable`
    and "Why There Is No Migratable Trait", and `OpenZeppelin/openzeppelin-skills#16` remains open
    with zero comments on 2026-11-19; neither Stellar Docs nor Scout carries that correction).
    Outside the two candidate partners,
    [`sk-025`](../improvements/skills/sk-025-trustless-work-beta-auth-scope.md) records a pinned
    Trustless Work skill vs Core API auth conflict without verified deployed auth behavior.
  - *Rest of owned QA and production:* Round item 1.3's residual source-gap classification found
    **0** unreached Alchemy or OpenZeppelin gaps; production Workers Logs keep no query text today,
    so there is **0** measured production demand for the absent endpoint and configuration schemas.
- **Phases 2–4 have not run, and two candidate-side operational details drifted.** Reliability
  (≥100 probes over 24h, verified 304 / stale-if-error), paired headline QA (≥16 cases, same
  answering and judge models, zero new wrong answers), and the security/non-regression pass remain
  unstarted. Phase 3 is the ship decision, not phase 1. Before any future phase-2 run:
  - Alchemy's Markdown endpoints now return `cache-control: public, max-age=0, must-revalidate`
    with no `ETag` or `Last-Modified` (changed from `max-age=3600` in July), so the
    `min(upstream max-age, 1h)` cache rule in `research/partner-doc-source-onboarding.md` would
    produce a 0-second fresh TTL and no conditional 304 revalidation.
  - OpenZeppelin's candidate URLs in `eval/partner-docs/cases.json` still pin commit `f304ed55`
    (2026-07-09) and `relayer/1.4.x/stellar.mdx`, while `OpenZeppelin/docs` `main` (`4d74c325`,
    2026-11-17) has advanced to Relayer `1.8.x` / root `content/relayer/stellar.mdx` and added Vault
    and Confidential Token modules (live check confirmed the classic-only Relayer fee-token policy
    still holds verbatim on `main`).
- **MCP federation remains declined.** Verified on 2026-11-19: Alchemy's hosted MCP
  (`mcp.alchemy.com/mcp`) still documents 168 tools behind OAuth, and OpenZeppelin's hosted MCP
  (`mcp.openzeppelin.com`) still advertises contract generation rather than documentation retrieval.

## Triggers to revisit

Reopen the **Markdown source lane** (to promote to phase 2) only after **two unrelated,
live-reproduced production or owned-QA failures** where all of the following hold:

1. The missing or incorrect fact is present on a current first-party partner page.
2. No currently exposed source — including official Docs after the improvements pipeline has had a
   chance to correct them — returns quotable support for it.
3. The failure is a source-coverage problem, not answer craft, stale truth metadata, or routing.

[`sk-022`](../improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md) accounts for one
such OpenZeppelin skill-vs-docs failure while `OpenZeppelin/openzeppelin-skills#16` stays open; a
second unrelated qualifying failure — or measured production demand once query observability ships
— fires re-evaluation.

Reopen the **MCP federation question** only on a narrower, different fact: a partner shipping a
read-only, unauthenticated, documentation-scoped MCP surface with a stable tool contract. That is
not what either partner ships today, and it is the only shape that would not import an operational
surface. A partner adding *more* tools is evidence against, not for.

## Re-evaluation requirements

If a trigger fires:

1. Refresh OpenZeppelin's pinned commit and Relayer path in `eval/partner-docs/cases.json`, widen
   the harness baseline to match current Raven sources (including full Docs pages and Scout on
   OpenZeppelin), and re-run `npm run eval:partner-docs -- --raven-url …` over all 12 cases.
2. Check the newest weekly `coverage-watch` run in
   [Stellar-Light/stellarlight#562](https://github.com/Stellar-Light/stellarlight/issues/562)
   (`own` / `mention` / `none`) and re-count live production or owned-QA failures on partner-only
   facts. If that set is empty, close the idea without an implementation round.
3. Settle the caching policy for `max-age=0, must-revalidate` sources (Alchemy) before running
   phase 2's 24-hour reliability and 304 / stale-if-error probes.
4. Do not build a generic `fetch_url`, a caller-selected endpoint, or an MCP proxy. The smallest
   useful surface is one host adapter with manifest-authored, closure-captured source identities.
5. Treat fetched prose as untrusted data even from a first-party domain: never into catalog
   descriptions, server instructions, or tool error hints.
6. Honour serve-do-not-store. This lane must not become the reason Raven starts owning a mirror of
   someone else's content (ARCHITECTURE §6).
7. Phase 3 is the decision, not phase 1. Ship only on a measured answer-quality win with correct
   provenance on every partner-specific claim, and OpenZeppelin cases must show value beyond the
   existing skill and docs paths.

## Durable references

- Design, admission contract, and ship gate:
  [`research/partner-doc-source-onboarding.md`](../research/partner-doc-source-onboarding.md)
- Harness and case corpus: [`scripts/eval-partner-docs.mjs`](../scripts/eval-partner-docs.mjs),
  [`eval/partner-docs/`](../eval/partner-docs/README.md)
- The upstream correction that closed the issue's concrete example:
  [`stellar/stellar-docs#2573`](https://github.com/stellar/stellar-docs/pull/2573), tracked as
  `sd-010` and resolved 2026-07-15 in [`improvements/resolved.json`](../improvements/resolved.json)
- Active partner skill-vs-docs finding counted in the 2026-11-19 review:
  [`sk-022`](../improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md) (and outside
  the two candidate partners,
  [`sk-025`](../improvements/skills/sk-025-trustless-work-beta-auth-scope.md))
- Work on this issue in the Stellar Light upstream, which this lane must be measured against:
  [`#446`](https://github.com/Stellar-Light/stellarlight/pull/446) (corrected the `alchemy` record,
  2026-07-10), [`#448`](https://github.com/Stellar-Light/stellarlight/pull/448) (the converging
  earlier "no", plus the `#447` retraction and its negative-grep lesson),
  [`#561`](https://github.com/Stellar-Light/stellarlight/pull/561) / rolling issue
  [`#562`](https://github.com/Stellar-Light/stellarlight/issues/562) (coverage-and-freshness
  detector, weekly since 2026-11-12),
  [`#564`](https://github.com/Stellar-Light/stellarlight/pull/564) (fixed that detector's URL-only
  "served" verdict), [`#565`](https://github.com/Stellar-Light/stellarlight/pull/565) (ingested ≠
  retrievable; `q=Alchemy` returned zero results), and
  [`#657`](https://github.com/Stellar-Light/stellarlight/pull/657) (`data-providers` research
  anchor for the Alchemy roster case)
- Lessons from admitting a source: [`source-addition.md`](../.agents/skills/run-evals/references/source-addition.md)
