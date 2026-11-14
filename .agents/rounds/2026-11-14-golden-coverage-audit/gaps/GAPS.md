# Gap ledger — golden coverage audit, 2026-11-14

Lane `findings`. Machine-readable twin: [`gaps.json`](gaps.json), which also holds each row's
re-check text and recommendation.

## What this is

One row per taxonomy leaf with a known or suspected gap between what the battery asks and what
Raven's sources hold. 43 rows: 15 `confirmed`, 28 `single`. Six findings cover 9 rows.

- `confirmed`: reproduced by two lanes, or by this lane on 2026-11-14.
- `single`: one observation, or an observation that did not reproduce.

## Method

- Inputs: `gap/verify-gap.json` and `gap/gap-*.json`, `review/REVIEW.md` finding D4,
  `map/taxonomy.json` (`ravenReach`), `audit/*.json`.
- Re-check, 2026-11-14 05:04 to 05:14 UTC: every mapper `no` or `partial` leaf of weight 3 (16),
  the nine non-answerable gap cases, D4, and three weight-2 `no` leaves. Each trigger ran an
  operation search (`codemode.search` inside the script) and the Docs, Scout, and Lumenloop
  operations it needed. Seven `execute` calls in total, batched by leaf.
- Each row that reached a finding was also checked on the upstream surface: the
  `developers.stellar.org` `.md` page, the `stellar/stellar-docs` source at `62f29bbb`, the Scout
  REST API (OpenAPI 1.9.150), or the `stellar.org` page.
- Of the 16 weight-3 mapper observations, 2 reproduced (`wallets.wrong-memo`, filed;
  `wallets.scams-phishing`, not filed), 1 partly (`standards.anchors-directory`), and 13 did not.
  The mappers recorded what a first query returned; a second wording or the Scout research corpus
  answered the rest. Two of the 13 leaves are `confirmed` for a different gap from another input:
  `ecosystem.xlm-supply` (D4) and `tooling.version-compat` (the gap lanes).

## Ledger

Sorted by weight, then evidence strength.

| Leaf | W | Evidence | Reach today | Missing fact or record | Owner | Cases | Finding |
|---|---|---|---|---|---|---|---|
| `wallets.wrong-memo` | 3 | confirmed | unreachable | The recovery path for a deposit sent without its memo: SDF cannot recover the funds; contact the exchange. | Stellar Light/Scout | `q-raph-missing-exchange-memo` | sls-117 |
| `ecosystem.xlm-supply` | 3 | confirmed | answerable; canonical page contradicts itself | Nothing is missing. The Docs Lumens page says all XLM was created at launch, above its own paragraph on 5.44 billion inflation lumens. | Stellar Docs | `q-token-xlm-supply-total-circulating` | sd-105 |
| `tooling.version-compat` | 3 | confirmed | partial: one key fact unreachable | The rule that the host rejects a contract built for a newer protocol than the network runs, and its error text. | Stellar Docs | `q-infra-version-lag-errors` | sd-107 |
| `wallets.scams-phishing` | 3 | confirmed | partial | What a victim should do after a scam. The returned sources are dated 2020 to 2023. | outside Raven's scope | `q-raph-stolen-wallet-recovery`, `q-edge-asset-site-scam-detection` | - |
| `protocol.accounts-reserves` | 3 | single | answerable | Mapper: why an unfunded address cannot receive a payment was not in the returned text. | none | - | - |
| `network.current-protocol` | 3 | single | answerable through Scout | Mapper: Docs search lands on the Protocol 20 section of Software Versions, and the full page exceeds Raven's result cap. | Raven (own repo) | - | - |
| `assets.trustlines` | 3 | single | answerable | Mapper: the reason for trustlines was not in the returned text. | none | - | - |
| `assets.sac` | 3 | single | answerable | Mapper: the contract-ID derivation command was not in the returned snippet. | none | - | - |
| `assets.usdc` | 3 | single | answerable through Scout | Mapper: the issuer identity of USDC was not in the returned Docs text. | none | - | - |
| `soroban.storage-types` | 3 | single | answerable | Mapper: neither canonical storage page ranked in the top three. | none | - | - |
| `soroban.authorization` | 3 | single | answerable | Mapper: Raven's operation search ranked Lumenloop operations above the Soroban docs operation. | Raven (own repo) | - | - |
| `data.result-codes` | 3 | single | answerable | Mapper: the transaction result-code reference did not rank in the top three. | none | - | - |
| `tooling.js-sdk` | 3 | single | answerable | Mapper: package and class names were not in the returned text. | none | - | - |
| `standards.deposit-withdrawal` | 3 | single | answerable | Mapper: no returned text contrasted SEP-24 with SEP-6. | none | - | - |
| `standards.anchors-directory` | 3 | single | answerable; per-country structure unchecked | Mapper: Bitso and Yellow Card were 'not-profiled' with null assets and SEPs; per-country rail coverage needs detail per anchor. | Stellar Light/Scout | - | - |
| `defi.bridges` | 3 | single | answerable | Mapper (shared note with assets.usdc): the CCTP page did not give the USDC issuer. | none | - | - |
| `network.tier1-quorum` | 2 | confirmed | partial: where to look is answerable, the roster is not | The current Tier 1 organizations. No Raven source names all ten. | Stellar Docs | `q-net-tier1-roster-current` | sd-106 |
| `network.quorum-freeze` | 2 | confirmed | partial: three of four key facts answerable | The record that Quorum Freeze was used on Mainnet: SLP-0006 (YieldBlox accounts) and SLP-0008 (Mercado Bitcoin account). | Stellar Light/Scout | `q-pc-quorum-freeze-cap77` | sls-118 |
| `ecosystem.strategy-roadmap` | 2 | confirmed | unreachable | SDF's 2026 strategy: the $1 billion network asset value target, 15 enterprises signed and 5 deployed, and where the strategy and roadmap are published. | Stellar Light/Scout | `q-sdf-2026-strategy-priorities` | sls-117 |
| `security.signing-safety` | 2 | confirmed | unreachable as a checklist | What a person checks before approving a signing request: domain and network, every operation, signer and merge operations, contract sub-invocations, hash signing. | Stellar Docs | `q-signing-safety-website-request` | sd-108 |
| `wallets.unsolicited-assets` | 2 | confirmed | unreachable | Why unknown tokens and claimable balances appear in an account, and how to treat them. | Stellar Docs | `q-raph-unsolicited-airdrop` | sd-108 |
| `standards.payment-patterns` | 2 | confirmed | reachable-not-surfaced | Nothing is missing. The Docs search does not return the wallet SEP-7 page for a query that contains `web+stellar:pay`. | unresolved | `q-pay-merchant-request-detect-reconcile` | - |
| `ecosystem.chain-comparisons` | 2 | confirmed | half reachable: Stellar side only | XRP Ledger facts: the Unique Node List, destroyed fees, trust line tokens. | outside Raven's scope | `q-stellar-vs-xrp-ledger` | - |
| `wallets.pi-network` | 2 | confirmed | unreachable | Any statement about Pi Network's relation to Stellar. | outside Raven's scope | `q-n3-pi-network-wrong-chain` | - |
| `security.regulation-policy` | 2 | confirmed | partial: historical positions only | SDF's current position on stablecoin regulation (MiCA, GENIUS Act). | outside Raven's scope | `q-pay-anchor-msb-licensing` | - |
| `ecosystem.institutional-adoption` | 2 | single | answerable | Gap lane: the Mastercard Crypto Credential release did not surface on the ordinary pass. | Lumenloop | - | - |
| `tooling.renames-repos` | 2 | single | answerable | Mapper and gap lane: no source stated the Soroban RPC and Go SDK renames. | none | - | - |
| `network.incidents` | 2 | single | answerable per gap lanes | Mapper: no row described the May 2019 halt. | Stellar Light/Scout | - | - |
| `ai.mcp-servers` | 2 | single | answerable per gap lanes | Mapper: the standards skill has no MCP mention; other sources were not probed. | none | - | - |
| `data.network-metrics` | 2 | single | answerable per gap lanes | Mapper: Scout's leaderboard has developer metrics but no on-chain accounts, transactions, or payment volume. | Stellar Light/Scout | - | - |
| `network.protocol-history` | 2 | single | not re-run | Mapper: Software Versions exceeds Raven's result cap (same note as network.current-protocol). | Raven (own repo) | - | - |
| `standards.moneygram-ramps` | 2 | single | not re-run | Mapper: scout.matchPartners returned HTTP 503; corridor detail was not checked. | Stellar Light/Scout | - | - |
| `standards.exchange-integration` | 2 | single | not re-run | Mapper: no exchange integration guide is in the Docs index; the pooled-accounts guide covers deposit attribution. | Stellar Docs | - | - |
| `defi.lending` | 2 | single | not re-run | Mapper: no call returned how Blend's pools are structured. | Stellar Light/Scout | - | - |
| `defi.tvl-landscape` | 2 | single | not re-run | Supply mapper: most rows had null TVL. Demand mapper: scout.getLeaderboard sort=tvl returned a ranking. | Stellar Light/Scout | - | - |
| `wallets.landscape` | 2 | single | not re-run | Mapper: contract-token support is not a field on Scout wallet rows. | Stellar Light/Scout | - | - |
| `ecosystem.sdf` | 2 | single | not re-run | Mapper: Scout's leadership rows were observed on 2026-07-19. | Stellar Light/Scout | - | - |
| `ecosystem.sdf-mandate-holdings` | 2 | single | not re-run | Mapper: no current SDF holding figure; it lives behind the Dashboard API. | outside Raven's scope | - | - |
| `ecosystem.xlm-staking-rewards` | 2 | single | not re-run | Mapper: no row states plainly that XLM has no protocol staking. | none | - | - |
| `ecosystem.history-origins` | 2 | single | not re-run | Mapper: nothing on the Ripple relationship in the returned rows. | Lumenloop | - | - |
| `funding.service-providers` | 1 | confirmed | partial: two of three key facts answerable | SDF's service providers directory (stellar.org/ecosystem/service-providers), the only list of integration and developer-service firms. | Stellar Light/Scout | `q-scf-service-provider-directories` | sls-117 |
| `assets.public-sector-cbdc` | 1 | confirmed | partial: one key fact unreachable | The National Bank of Ukraine's statement that the 2021 pilot was not its e-hryvnia. | outside Raven's scope | `q-crp-public-sector-cbdc-pilots-stellar` | - |
| `ecosystem.xlm-markets` | 1 | single | not re-run | Mapper: no regulated XLM investment product in the returned rows. | outside Raven's scope | - | - |

## Findings filed

All six are `verified` and local only. Nothing was posted upstream. Each renders with
`npm run improvements:file -- --file <path> --dry-run` (exit 0).

| Id | Title | Owner | Leaves |
|---|---|---|---|
| `sd-105` | Lumens page says all XLM was created at launch, then describes 5.44 billion inflation lumens | Stellar Docs (`stellar/stellar-docs`) | `ecosystem.xlm-supply` |
| `sd-106` | Tier 1 Organizations page does not name the current Tier 1 organizations | Stellar Docs (`stellar/stellar-docs`) | `network.tier1-quorum` |
| `sd-107` | Docs do not say that the network rejects a contract built for a newer protocol | Stellar Docs (`stellar/stellar-docs`) | `tooling.version-compat` |
| `sd-108` | Docs have no guidance on what to review before signing or how to treat unsolicited assets | Stellar Docs (`stellar/stellar-docs`) | `security.signing-safety`, `wallets.unsolicited-assets` |
| `sls-117` | Research source sdf-org omits the SDF strategy, roadmap, service-provider, and community pages | Stellar Light/Scout (`Stellar-Light/stellarlight`) | `ecosystem.strategy-roadmap`, `funding.service-providers`, `wallets.wrong-memo` |
| `sls-118` | Research corpus does not index Stellar Limits Proposals, so enacted Quorum Freeze votes are missing | Stellar Light/Scout (`Stellar-Light/stellarlight`) | `network.quorum-freeze` |

Notes for the reviewer:

- **Ids.** `git fetch origin` then `git merge-base --is-ancestor origin/main HEAD` exited 0.
  `gh pr list` returned no open pull request. Highest ids across `origin/main` and
  `improvements/resolved.json`: `sd-104`, `sls-116`. Next free: `sd-105`, `sls-117`.
- **Dedupe.** No active finding covers these topics. Two resolved receipts are related and are
  cited where relevant: `sls-055` (canonical SDF pages in Scout research; `sls-117` names four
  pages outside its fix) and `sd-037` (SLPs in the `stellar-protocol` README; a different surface
  from `sls-118`).
- **Intake.** `improvements/intake.json` gained overrides for `sd-105` to `sd-108`
  (`stellar/stellar-docs`); the service rule is `mixed` and the filer refuses without one. The Scout
  findings use the service default.
- **`sd-108` placement is a judgment.** No canonical page exists anywhere for either topic. The
  finding says so and argues that Stellar Docs already host the adjacent wallet and signing guides.
  If the owner prefers `stellar.org`, the finding becomes `unclear` like `sd-077`.
- **`sd-106` is a modest ask.** The page is a "how to join" guide. The finding offers a two-sentence
  pointer as the smallest fix and the dated list as the fuller one.
- **Probes.** Five findings carry an `http-text` probe (`sd-108` has none; it is a missing page).
  Each needle was checked by hand on 2026-11-14.

## Findings updated

None. No existing finding matched a confirmed gap.

## Gaps not filed, and why

| Leaf | W | Evidence | Why not filed | Next step |
|---|---|---|---|---|
| `wallets.scams-phishing` | 3 | confirmed | The source is held. No defect in it is established; the guide's age alone is not a finding. | Source-coverage question for the owner: ask SDF to refresh the 2022 guide with an 'if you were scammed' section. Read the guide in full before any filing. |
| `protocol.accounts-reserves` | 3 | single | Not reproduced. | None. |
| `network.current-protocol` | 3 | single | Not an upstream gap. The Docs-search anchor and the page-size cap are Raven-side observations. | Orchestrator: consider a .agents/TODO.md note on section-level reads of Software Versions. |
| `assets.trustlines` | 3 | single | Not reproduced. | None. |
| `assets.sac` | 3 | single | Not reproduced. | None. |
| `assets.usdc` | 3 | single | Not reproduced. | None. |
| `soroban.storage-types` | 3 | single | Not reproduced. | None. |
| `soroban.authorization` | 3 | single | Not reproduced. | None. |
| `data.result-codes` | 3 | single | Not reproduced. Related residue is tracked by sd-059. | None. |
| `tooling.js-sdk` | 3 | single | Not reproduced. | None. |
| `standards.deposit-withdrawal` | 3 | single | Not reproduced. | None. |
| `standards.anchors-directory` | 3 | single | The prose answers the question. The structured-profile claim was not re-read, so it stays a single observation. | If a case later needs per-country filtering, read the anchor profile fields and file then. |
| `defi.bridges` | 3 | single | Not reproduced. | None. |
| `standards.payment-patterns` | 2 | confirmed | The owner is not established. A Docs-search finding needs a retrieval-level check against the search backend first, to separate upstream ranking from Raven scoping. | Orchestrator: add a .agents/TODO.md item to run that check with this query and the expected page /docs/build/apps/wallet/sep7. |
| `ecosystem.chain-comparisons` | 2 | confirmed | Outside Raven's scope. | Source-coverage question for the owner: keep cross-chain comparison cases in the headline only if Raven is expected to answer the other chain's half from general knowledge; otherwise retire the case or ask SDF for a comparison page. |
| `wallets.pi-network` | 2 | confirmed | Outside Raven's scope. | Source-coverage question for the owner: the same choice as for chain comparisons. A one-line SDF FAQ entry ('Pi is a separate network; Pi cannot be sent to a Stellar address') would close it. |
| `security.regulation-policy` | 2 | confirmed | No current owner-side page is identified, so there is nothing to ask a Raven source to ingest. | Source-coverage question for the owner. The one battery case on the leaf does not depend on it. |
| `ecosystem.institutional-adoption` | 2 | single | Not reproduced by the second lane. | None. |
| `tooling.renames-repos` | 2 | single | Not reproduced by the second lane. | None. |
| `network.incidents` | 2 | single | Not re-run. Both gap lanes recorded q-network-halt-history as answerable. | None. |
| `ai.mcp-servers` | 2 | single | Not re-run. Both gap lanes recorded q-ai-mcp-servers-connect as answerable (Docs 'Building with AI'). | None. |
| `data.network-metrics` | 2 | single | Not re-run. Both gap lanes recorded q-data-network-metrics-sources as answerable. | None. |
| `network.protocol-history` | 2 | single | Weight 2, single observation, not re-run. | See network.current-protocol. |
| `standards.moneygram-ramps` | 2 | single | Weight 2, single observation; a transient 503 is not a content gap. | None. |
| `standards.exchange-integration` | 2 | single | Weight 2, single observation, not re-run. | Re-check before the next round; a missing guide would be a Docs content finding. |
| `defi.lending` | 2 | single | Weight 2, single observation, not re-run. | None. |
| `defi.tvl-landscape` | 2 | single | The two mappers disagree and the second answered the question. sls-039 tracks TVL history. | None. |
| `wallets.landscape` | 2 | single | sls-033 already tracks wallet enumeration and availability fields. | None. |
| `ecosystem.sdf` | 2 | single | Weight 2, single observation; the research row looks refreshed. | None. |
| `ecosystem.sdf-mandate-holdings` | 2 | single | A live figure belongs to dashboard.stellar.org, which is not a Raven source. | Source-coverage question for the owner: whether Raven should expose the Dashboard lumens API. |
| `ecosystem.xlm-staking-rewards` | 2 | single | Weight 2, single observation, not re-run. | None. |
| `ecosystem.history-origins` | 2 | single | Weight 2, single observation; the side observation suggests the history is held. | None. |
| `assets.public-sector-cbdc` | 1 | confirmed | The owner of the fact is outside Raven's scope. The Decrypt headline is a third party's wording, not a Lumenloop defect. | Source-coverage question for the owner: whether Lumenloop should ingest the NBU news item as an article. |
| `ecosystem.xlm-markets` | 1 | single | Weight 1, single observation, not re-run. | None. |

Source-coverage questions for the owner (outside Raven's scope, so not findings):

1. **Other chains** (`ecosystem.chain-comparisons`, `wallets.pi-network`). Raven holds no
   other-chain source. Either accept that these cases test general knowledge plus the Stellar half,
   or ask SDF for a comparison page and a one-line Pi Network FAQ entry.
2. **The National Bank of Ukraine statement** (`assets.public-sector-cbdc`). Should Lumenloop ingest
   the bank.gov.ua news item of 2021-12-15? Raven holds a Decrypt headline that says the opposite.
3. **Live XLM figures** (`ecosystem.sdf-mandate-holdings`, and the circulating figure in
   `ecosystem.xlm-supply`). They live in the Dashboard lumens API, which is not a Raven source. The
   Docs page carries a snapshot dated 2026-07-21.
4. **Scam and policy guidance** (`wallets.scams-phishing`, `security.regulation-policy`). The held
   SDF sources date from 2020 to 2023. No newer owner-side page was identified.

Own-repo notes for the orchestrator (not in this lane's write set):

- `standards.payment-patterns`: `stellarDocs.search_docs('web+stellar:pay payment request QR
  code')` does not return `/docs/build/apps/wallet/sep7`, which holds that exact string. Scout
  returns it. A `.agents/TODO.md` item should decide between Raven scoping and upstream ranking.
- `network.current-protocol`, `network.protocol-history`: the Docs search ranks the Protocol 20
  anchor of Software Versions first, and the full page exceeds the result cap. Scout answers both
  questions today.

## Audit inputs

- **`rot` entries with result `unverifiable`: 97** across ten audit lanes (hist-retail 31,
  compliance 20, protocol 13, defi 10, scf 6, soroban-b 4, tooling-a 4, assets 3, edge 3,
  tooling-b 3); 34 carry no evidence. They record claims that an audit lane could not re-verify in
  its pass. They are not observations of Raven's reach, so none is a ledger row on its own. Two
  ledger leaves have such entries on their cases: `wallets.wrong-memo`
  (`q-raph-missing-exchange-memo`, `q-raph-exchange-memo`) and `wallets.unsolicited-assets`
  (`q-raph-unsolicited-airdrop`).
- **`missing` arrays: 11 lanes, 67 items.** They list topics that no case tested. The coverage
  phase consumed them (36 new cases). They say nothing about Raven's sources.

## Case cautions

One case. The orchestrator applies it; this lane edited no case.

- **`q-token-xlm-supply-total-circulating`** (`golden.notes`, append):

  > Quoting the Stellar Docs Lumens page that all XLM that will ever exist was created at launch is
  > not wrong while sd-105 stands; grade caps at partial.

  Reason: the canonical page's sentence conflicts with the golden's inflation history (100 billion
  at genesis plus about 5.44 billion from inflation). `sd-105` is `verified`, so the `cap-finding`
  lint accepts it. The `improvements-pipeline` skill asks that a finding behind a cap be filed in
  the same round. This round forbids posting, so the owner chooses: authorize filing `sd-105` at
  close, or leave the caution out until it is filed.

Considered and not needed:

- `q-token-initial-supply-distribution`: its key fact (genesis created 100 billion XLM) agrees with
  the page's sentence.
- `q-pc-quorum-freeze-cap77`: Scout's YieldBlox incident row describes the earlier overlay filter
  as a quarantine. An answer that cites it is not wrong, and it does not satisfy key fact 4. No
  canonical page conflicts with the golden.
- `q-net-tier1-roster-current`: no canonical page gives a wrong roster. "SatoshiPay Frankfurt" in
  the Docs monitoring page is sample command output.

## Gate results

Run bare on 2026-11-14 in the worktree, after the last edit.

| Command | Exit | Result |
|---|---|---|
| `git fetch origin && git merge-base --is-ancestor origin/main HEAD` | 0 | `origin/main` is an ancestor |
| `npm run improvements:index` | 0 | `wrote improvements/INDEX.md (83 findings)` |
| `npm run improvements:lint` | 0 | `improvements lint ok (83 findings)` |
| `npm run improvements:lint -- --live` | 0 | `improvements lint ok (83 findings, live intake checked)` |
| `npm run secrets:scan -- --tree` | 0 | clean (tracked files; the new files are untracked) |
| `npm run improvements:file -- --file <finding> --dry-run`, six findings | 0 each | bodies render; nothing posted |
| `node -e 'JSON.parse(...)' gaps/gaps.json` | 0 | valid JSON |

Not run: `npm run improvements:probes`. The skill requires it on a drift refresh, not in an eval
round, and it writes recurrence drafts into other findings.

Files written: `improvements/stellar-docs/sd-105` to `sd-108`, `improvements/stellar-light-scout/sls-117`
and `sls-118`, `improvements/intake.json`, `improvements/INDEX.md` (generated), `gaps/GAPS.md`,
`gaps/gaps.json`. Nothing is committed.

Open: `qa/RESULT.md` did not exist when this ledger was written. Its results are not included.
