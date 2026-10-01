# Golden owner judgments — 2026-10-01

## Scope

This ledger records the `golden` lane of the 2026-10-01 backlog closeout round.

In scope:

- Owner decision C from `.agents/TODO.md`: seven golden truth and product judgment questions.
- The TODO item "Reconcile Soroswap API and contract scope in sibling grader notes".

Out of scope: owner decisions A, D, G, H, I, and K, every paid evaluation, and every case that the
two items above do not name. The lane made no paid model call and started no QA arm.

Owner authority (2026-10-01): "Resolve with evidence". Agent lanes decide each question with
evidence. Golden edits use the `golden-truth` workflow with independent review. The owner can veto
each decision.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
|---|---|---|---|---|
| golden author | Claude Fable 5.1, high | coordinator-assigned | seven battery cases, generated QA files, `.agents/TODO.md`, this ledger | complete |
| independent golden review | GPT-6-Astra through Codex, assigned by the coordinator | — | review report | complete: ACCEPT WITH FIXES; three findings applied below |

All live checks below ran on 2026-10-01 between 17:56Z and 18:10Z. Source classes follow the
`golden-truth` skill: A official docs, B source code, C live service, D general web, E docs index,
F empirical execution.

## Ledger

### Decision C1 — `q-scf-rfp-tooling`: scope binding

Decision: the RFP-track definition binds, not the Scout category of each brief. The yes/no label
is not gated. The edit adds one grader scope note. Answer, key facts, avoid items, and the dated
roster are unchanged.

| claim | class | source | result |
|---|---|---|---|
| The RFP Track funds developer tooling | A | `stellar/scf-handbook@7abdddd0` `scf-awards/build-award/rfp-track.md` | "The RFP (Request for Proposals) Track funds developer tooling that solves known problems in the ecosystem." |
| Two briefs are open | A | same page, "Current Open RFPs" | Stellar-compatible LayerZero DVN; X402 Facilitator with Bazaar (discovery) support |
| Two briefs are open, one synthetic round row | C | `https://stellarlight.xyz/api/rfps?status=open`, `generatedAt` 2026-10-01T17:56:10Z | `open: 2`, `syntheticRounds: 1`; categories Infrastructure and Payments; #46 Submission through 2026-11-08 |
| Neither brief is a chain-data indexing brief | A | same handbook page | the x402 brief lists an off-chain "discovery catalog and search index" |

Reason: the SCF handbook is the canonical owner of the track definition. The Scout category is an
aggregator label. An answer that reports both briefs and states their scope is correct with either
a "yes" or a qualified "no indexing brief" label. An answer that says no RFP is open is wrong.

### Decision C2 — `q-sor-persistent-unbounded-collection-cap`: avoid item 2

Decision: an attributed, dated 64 KiB figure does not trip avoid item 2. The edit adds one grader
note that states the durable distinction only. The dated 65,536-byte observation stays in
`truth.corroboration`. Answer, key facts, and avoid items are unchanged.

| claim | class | source | result |
|---|---|---|---|
| Mainnet contract-data entry limit is 65,536 bytes | F | `stellar network settings --network mainnet --output json` (stellar-cli 28.1.0) | `contract_data_entry_size_bytes 65536` |
| Same value from the raw ledger entry | F | `getLedgerEntries` key `AAAACAAAAAk=` on `https://mainnet.sorobanrpc.com` | XDR `000000080000000900010000`, `latestLedger` 64718335 |
| The official guide states 64 KiB with a dated check | A | `stellar/stellar-docs@109d95d1` `docs/build/guides/storage/storage-strategies.mdx` | "Max contract-data entry size, 65,536 B (64 KiB)"; "Protocol 27, checked 2026-07-20. Network validators can change these values" |

Reason: a trap must punish a false claim. A dated or attributed current figure is true. The trap
keeps its target: a byte limit stated as universal or permanent.

### Decision C3 — `q-protocol-ledger-close-time`: key fact 1

Decision: key fact 1 accepts a dated or attributed cadence. It no longer requires a live
multi-ledger sample. The re-check also found freshness drift, so the edit is larger than the
question asked.

| claim | class | source | result |
|---|---|---|---|
| Every delta in a 199-delta sample is 5 s | C | `https://horizon.stellar.org/ledgers?order=desc&limit=200` | ledgers 64718137–64718336, 17:41:07Z–17:57:42Z, 5 s × 199 |
| Mean is 5.000 s since Protocol 28 | C | `https://horizon.stellar.org/ledgers/{sequence}` at 15,000-ledger steps | 5.000 s for every window from 2026-09-16T23:47Z; 5.396–5.702 s from 2026-09-01 to 2026-09-16 |
| Protocol upgrade ledgers | C | same endpoint, binary search on `protocol_version` | first Protocol 28 ledger 64458446 at 2026-09-16T17:00:06Z; first Protocol 29 ledger 64717645 at 2026-10-01T17:00:07Z |
| Independent reader agrees | C | `https://api.stellar.expert/explorer/public/ledger/{sequence}` | 64700000→64718000 mean 5.0 s; 64400000→64440000 mean 5.583 s |
| Target is 5000 ms | F | `stellar network settings --network mainnet` | `scp_timing.ledger_target_close_time_milliseconds 5000` |
| Protocol 28 changed consensus | B | `stellar/stellar-protocol` `core/cap-0083.md` | "This will improve SCP performance"; protocol version 28 |
| Docs still say 5-7 seconds | A | `stellar/stellar-docs@109d95d1` `docs/validators/README.mdx`, `docs/learn/fundamentals/stellar-stack.mdx`, and both rendered pages | "update the ledger every 5-7 seconds" |
| No exposed operation returns close timestamps | — | `catalog/manifest.json` | zero matches for `closed_at`, `closeTime`, `close_time` |

Changes: the answer states about 5 seconds as of 2026-10-01, with the target, the sample, and the
Docs wording. Key fact 1 reads "States about 5 seconds, or the documented 5–7 seconds, with a date
or source." The avoid item keeps only the durable false claim: a fixed constant or a per-ledger
guarantee. The 3–5-second number trap is removed, because 5 seconds is now the observed value. The
case moves from `stable` to `scheduled`, with `truth.asOf` 2026-10-01 and `truth.reverifyBy`
2026-12-15.

Not claimed: this lane did not prove that CAP-0083 caused the change. The Docs range contains the
observed value, so the lane added no canonical-page caution. `.agents/TODO.md` carries the Docs
lead.

Root cause: `freshness-drift`.

### Decision C4 — `q-ti-historical-pointintime-balances`: avoid item 3

Decision: trade-implied prices from Hubble trade rows are not invented prices when the answer names
the table and states the pair, the quote asset, and the window. The edit adds one grader note.
Answer, key facts, and avoid items are unchanged.

| claim | class | source | result |
|---|---|---|---|
| Hubble documents trade prices | A | `stellar/stellar-docs@109d95d1` `.../bronze/history-trades.mdx`, `.../gold/trade-agg.mdx` | `price_n`, `price_d`; `avg_price_daily` per asset pair |
| Hubble documents USD price snapshots | A | `.../silver/reflector-prices-data-{sdex,cex,fex}-snapshot.mdx` | `open_usd`, `high_usd`, `low_usd`, `close_usd`; "Prices originate from the Reflector oracle contracts" |
| The public models implement those tables | B | `stellar/stellar-dbt-public@4b29c2ea` `models/intermediate/reflector_prices/`, `models/intermediate/trades/` | Reflector price entries decoded from `contract_data_snapshot` |
| A sibling accepts named price methods | — | `q-ti-compute-token-lp-market-data` | "an explicitly named last/mid/VWAP/oracle/route method" |

Reason: avoid item 3 targets a USD price with no named source or method. A stablecoin trade price
equals a USD price only when the answer states that assumption.

### Decision C5 — compliance cluster: ADR-0008 or strict goldens

Cases: `q-pay-anchor-msb-licensing`, `q-pay-travel-rule-aid-flows`, `q-comp-finclusive-caas`,
`q-crp-custodial-vs-noncustodial-wallets`, `q-crp-become-an-anchor-licensing`.

Decision: keep the goldens strict. Do not expand ADR-0008. Record the gap as a corpus-coverage
diagnostic. No golden edit.

| check | class | source | result |
|---|---|---|---|
| Does the anchors page state a licensing allocation? | A | `stellar/stellar-docs@109d95d1` `docs/learn/fundamentals/anchors.mdx` | no; it describes anchors as on and off-ramps "such as financial institutions or fintech companies" |
| Same question on the docs index | E | `stellarDocs.search_anchor_sep_docs({query:'anchor license money transmitter regulated'})`, `stellarDocs.search_docs({query:'anchors are regulated financial institutions licensed'})`, `stellarDocs.search_docs({query:'Travel Rule KYC responsibility anchor'})`, five hits each | no returned page states who holds a license or a Travel Rule duty |
| Same question on GitHub code search | B | `stellar/stellar-docs` queries "money transmitter", "Travel Rule", "regulated anchor" | the three recorded queries returned zero documentation hits |
| The closest surface text | C | `scout.searchResearch`, SEP-31 row | "the Sending and Receiving Anchors, who have the necessary licenses in their respective jurisdictions" |

Reasons:

1. ADR-0008 covers a canonical page that conflicts with stronger authority. The checked pages and
   recorded searches identified no conflicting canonical page. SEP-31 states an operating assumption for one flow. It does not state a legal allocation
   rule, and it does not conflict with the regulators' facts-and-circumstances test.
2. An ADR-0008 caution must name the conflicting page, its finding, and its expiry. The checks
   identified no page and no finding to name.
3. The canonical owners of the legal facts are the regulators. The tested surface does not
   undertake to explain licensing law. The `golden-truth` skill routes that case to a coverage
   diagnostic.
4. The accepted ADR-0008 set stays at three cases: base reserve, Horizon lifecycle, and RPC
   pagination.

Coverage diagnostic: the checked pages and recorded searches returned SEP mechanics and one SEP-31
licensing assumption. They returned no entity, activity, custody, route, or jurisdiction analysis.
A wrong or partial row in this cluster is consistent with a corpus limit. It does not show a
retrieval defect or a Docs defect.

### Decision C6 — `q-edge-metamask-evm-mental-model`: freshness tag

Decision: move the case from `stable` to `scheduled`, with `truth.asOf` 2026-10-01 and
`truth.reverifyBy` 2026-12-16. The `golden-truth` skill requires that tag for a dated product
claim. The re-check also found freshness drift, so the edit is larger than the question asked.

| claim | class | source | result |
|---|---|---|---|
| MetaMask documents built-in Stellar support | A | `https://support.metamask.io/configure/networks/stellar/`, last-modified 2026-09-30 | "MetaMask supports Stellar as a default network, allowing you to manage XLM and other assets." |
| The extension ships a first-party Stellar Snap | B | `MetaMask/metamask-extension@ebd93b06` `package.json` | `"@metamask/stellar-wallet-snap": "^1.1.0"` |
| The first-party Snap is published | B | `https://registry.npmjs.org/@metamask%2Fstellar-wallet-snap` | created 2026-08-24, latest 1.1.0 |
| Implementation support is behind a feature flag | B | `MetaMask/metamask-extension@ebd93b06` `CHANGELOG.md` | "Added Stellar account support behind a feature flag (#45692)" |
| Bridge route availability | B | `MetaMask/core@418b73c1` `packages/bridge-controller/src/constants/bridge.ts` | `ALLOWED_BRIDGE_CHAIN_IDS` includes `XlmScope.Pubnet`. The default bridge ranking omits Stellar when remote configuration is unavailable. Actual client and route availability remain unverified. |
| The third-party Snap stays listed | A | `https://acl.execution.metamask.io/latest/registry.json` | `npm:stellar-snap`, author Paul Fears, version 1.0.9 |
| General web sources lag | D | web search, 2026-10-01 | results still say MetaMask does not support Stellar |
| Docs index query | E | `stellarDocs.search_docs({query:'MetaMask',hitsPerPage:6})` | The recorded MetaMask query returned zero hits on 2026-10-01. |

Changes: the answer keeps the EVM-flow limit and the asset-model paragraph. It now reports the
documented built-in support with its date and source, and it keeps the third-party Snap distinct.
Key fact 2 reads "Dates the MetaMask Stellar pathway it reports: built-in support or a Snap." The
avoid items name the third-party Snap and bar a frozen support state. The golden attributes the
built-in support to MetaMask documentation and does not gate a rollout state. Its region caveat
names the Buy feature, which is the only region limit that the support page states.

Root cause: `freshness-drift`, plus an eval-side tag error.

### Decision C7 — `q-defi-aquarius-what-is`: key fact 3

Decision: key fact 3 stays binding. Record the gap as a corpus-coverage diagnostic. No golden edit.

| check | class | source | result |
|---|---|---|---|
| Does the project record carry ICE roles? | C | `lumenloop.get_project({slug:'aquarius'})` | 1,493 bytes; zero matches for "ICE" |
| Same question on entity content | C | `lumenloop.find_content_by_entity({entity:'Aquarius'})` | 8,713 bytes; zero matches for "ICE", "upvoteICE", "governICE" |
| Scout summary | C | `scout.searchProjects({q:'aquarius'})`, `generatedAt` 2026-10-01T18:02:19Z | "AQUA locks into ICE for on-chain DAO governance votes directing rewards"; one merged role |
| The truth itself | A, B | the case's 2026-09-17 verification of `docs.aqua.network` and `AquariusDeFi` source | unchanged; not re-derived today |

Reason: the case is `real-world`. The skill says a lagging corpus is never a reason to weaken a
golden. The operator docs are the canonical owner. The recorded Lumenloop and Scout calls returned
no ICE role split. A miss on key fact 3 is a coverage result, and Scout's merged summary stays a
monitor-only lead.

### Soroswap scope reconciliation — `q-eco-dex-saturation`, `q-defi-soroswap-vs-stellarx`

Decision: both grader notes now separate the on-chain aggregator from the API quote layer. The
notes name no dated adapter roster; the roster stays in `truth.corroboration`. Answers, key facts,
and avoid items are unchanged.

| claim | class | source | result |
|---|---|---|---|
| The aggregator has three adapters | F | `stellar contract invoke --id CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO --send no -- get_adapters` on Mainnet | `protocol_id` 0, 1, 2, all unpaused |
| The deployment file lists the same three | B | `soroswap/aggregator@84de10e0` `public/mainnet.contracts.json` | `soroswap_adapter`, `phoenix_adapter`, `aqua_adapter` |
| The aggregator excludes SDEX | A | `soroswap/docs@1d7a3c8a` `concepts/aggregator.mdx` | "Stellar SDEX is not included as it is incompatible with Soroban-based smart contracts" |
| API quotes can include SDEX | A | `soroswap/docs@1d7a3c8a` `api/index.mdx` | "across multiple protocols (Soroswap, Phoenix, Aqua and SDEX)" |
| Scout now separates the layers | C | `https://stellarlight.xyz/api/projects/search?q=soroswap` | on-chain aggregation across Soroban AMMs; Route API quotes include SDEX |

Changes:

- `q-eco-dex-saturation`: the note "Soroswap's aggregator routes across Soroswap/Phoenix/Aquarius +
  SDEX" now states both layers. The also-good line "new AMM entrants tend to be absorbed into
  Soroswap's aggregation routing" is removed. It contradicted avoid item 1, and the live adapter
  set has no Sushi or Comet adapter.
- `q-defi-soroswap-vs-stellarx`: the note "routing across AMMs + SDEX with a Route API" now states
  both layers. It also attributes the "first" wording to Soroswap, as `q-defi-soroswap-what-is`
  does.

The `soroswap/docs` aggregator page still carries stale Testnet labels (`cs-002`). The lane used
that page only for the SDEX exclusion sentence.

### Register and generated files

- `npm run eval:qa:compile`: 501 cases. The sha256 before the review fixes was
  `9c85f4cca60dd2d1ab48322302272efbeb3bc4ea8c29af9ac9869fdea99c6f54`; "Review reconciliation" gives
  the final value. A parsed diff against `HEAD` shows exactly seven changed cases.
- `npm run eval:qa:register`: 12 entries reopened. A review closed ten clusters as consistent:
  `cluster-011`, `-014`, `-017`, `-018`, `-022`, `-065`, `-081`, `-089`, `-130`, `-133`.
- Two entries stay in `reopen` state. Each has a real open question outside this lane, and each
  has a `.agents/TODO.md` item:
  - `cluster-037`: `q-defi-bridge-evm-to-stellar-axelar` bars a MetaMask Bridge claim. MetaMask
    documentation now describes swaps from another chain into Stellar. The default bridge ranking
    omits Stellar when remote configuration is unavailable. Actual client and route availability
    remain unverified. The sibling needs a dated route review.
  - The SCF date-contingent trap: SCF #45 moved to Notification & Award Distribution. Two cases
    still place it in Panel Review as of 2026-09-03.
- `q-protocol-ledger-close-time` is one of the 30 sampled cases. A later comparison must use
  unchanged IDs or disclose this change.
- The plan grader reads no `golden`, `tags.freshness`, or `truth` field, and no `surface` changed.
  Plan grades cannot move.

### Re-judge note

No saved answer was re-judged. The 2026-09-04 candidate artifact is not on this machine. Expected
directions:

- Ledger case: an answer that states about 5 seconds with a date now meets key fact 1. An answer
  that states 3–5 seconds stays below correct. The direction follows a protocol change, not a score.
- MetaMask case: an answer that says MetaMask cannot access Stellar stays wrong. A dated Snap-only
  answer stays acceptable under key fact 2.
- The four notes-only cases narrow two avoid items and two scope readings. Each can move a verdict
  only toward the reading that the evidence supports.

### Review reconciliation

The independent review returned ACCEPT WITH FIXES with three P2 findings. The reviewer accepted all
seven case decisions, the ten register closures, and the four TODO items. The lane applied each
finding.

1. MetaMask bridge. The lane had read a commented-out Stellar entry as a disabled bridge route.
   The reviewer showed that the comment belongs to `DEFAULT_CHAIN_RANKING` and that
   `ALLOWED_BRIDGE_CHAIN_IDS` includes `XlmScope.Pubnet`. The author confirmed both in
   `MetaMask/core@418b73c1`. The TODO item, the case provenance, the C6 table, and the register
   note now say: "The default bridge ranking omits Stellar when remote configuration is
   unavailable. Actual client and route availability remain unverified." `cluster-037` stays open
   for the sibling's dated route review. Nothing labels the feature disputed.
2. Volatile facts in stable grader notes. The three stable cases keep only the durable distinction
   in `golden.notes`. Both Soroswap notes lost the dated adapter parenthesis. The
   Persistent-storage note lost its current-value sentence. The dated observations stay in
   `truth.corroboration`.
3. Absence claims. The MetaMask case now says "The recorded MetaMask query returned zero hits on
   2026-10-01." C5 now says "The checked pages and recorded searches identified no conflicting
   canonical page." The C5 strict-grading decision is unchanged. The C7 wording has the same bound.

One more edit follows a reviewer observation that was not a finding. The support page limits the
Buy feature by region and states no region limit for Stellar wallet support. The MetaMask answer
now says "Availability can differ by app version, and MetaMask limits its Buy feature by region".

Protocol 29: Mainnet moved to Protocol 29 at ledger 64717645 on 2026-10-01T17:00:07Z. The C3 answer
stays true. The author's 199-delta sample is all Protocol 29, and the reviewer measured 199
five-second deltas immediately before that upgrade. The lane made no Protocol 29 sweep of other
cases.

After the fixes, the corpus sha256 is `76979c0365506490657a16631478b9e4c555481bb9f165de8ef7032250ffdfef`.
The re-edited cases reopened `cluster-014`, `-022`, `-130`, and `-133`. A second review closed
those four. `cluster-037` and the SCF date-contingent trap stay open.

## Outcome

- Affected case IDs: `q-scf-rfp-tooling`, `q-sor-persistent-unbounded-collection-cap`,
  `q-protocol-ledger-close-time`, `q-ti-historical-pointintime-balances`,
  `q-edge-metamask-evm-mental-model`, `q-eco-dex-saturation`, `q-defi-soroswap-vs-stellarx`.
- Decisions without a golden edit: the compliance cluster (five cases) and
  `q-defi-aquarius-what-is`. ADR-0008 stays at three cases.
- Independent golden review: complete, ACCEPT WITH FIXES. The reviewer re-derived the cadence,
  MetaMask, and Soroswap facts before reading the author's notes. The three findings are applied;
  see "Review reconciliation".
- Follow-up items added to `.agents/TODO.md`: the SCF #45 refresh, the MetaMask Bridge
  re-verification, the legacy compliance grader lines, and the Docs cadence lead.
- Retained evidence: this ledger. The seven case files cite it in `truth.verified`.
