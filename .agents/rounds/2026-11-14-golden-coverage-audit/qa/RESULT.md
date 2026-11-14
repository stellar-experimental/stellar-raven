# qa-run result: light QA test of the rebuilt battery

Lane `qa-run`, 2026-11-14. This tests the battery, not Raven; there is no headline number. Commit under test
`aaaf107f10fcdddbfe4434ae28550d3ac1af20f2`, clean detached worktree `/home/tyler/code/raven-wt/gca-eval`
(`git status --porcelain` empty before and after; server `dirty:false` before and after). Variant A, one collection,
no re-run, no re-judge, subscription CLI only.

## Identity (hashes only)

| Pin | SHA-256 |
|---|---|
| Surface (live `tools/list`, 2 tools) | `b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404` |
| Claude executable (v2.1.325 versioned binary, linked in a private PATH dir; `DISABLE_AUTOUPDATER=1`) | `0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf` |
| Agent environment (names HOME, PATH, SHELL) | `19e88460fde1be6ba190895bfee3f6af23abdb9e0bfafd4419c8c80f4ab5645d` |
| Remote identity probe script | `aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99` |
| Stable remote identity vector (3 captures, 5 min apart) | `046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8` |

Server revision pin matched before and after; `meta.comparable: true`, no postflight errors, `aggregatesSuppressed: false`.

## Run

| Item | Value |
|---|---|
| Results stamp | `2026-11-14T06-06-31-variantA` |
| Results JSON (ignored) | `/home/tyler/code/raven-wt/gca-eval/eval/qa/results/2026-11-14T06-06-31-variantA.json` |
| Answering model / judge model | `claude-sonnet-5-5` / `claude-sonnet-5` |
| Rubric / evidence pack | `v2.11` / `p9` |
| Judge tiering | stability register absent; boundary panels (3 calls) on 24 of 26 eligible rows (cap 24, 2 skipped) |
| Jobs planned / completed | 70 / 70 (asserted from `active 70 of 70 selected` before spend and `completeness`: 70 rows, 0 missing, 0 agent failures, 0 error verdicts) |
| Judge calls | 118 of 118 with cost; answer costs 70 of 70; cost complete |
| Cost | USD 15.43 (answering 7.41, judging 8.02) against the USD 40 cap and the brief's USD 22 to 29 estimate; about USD 0.22 per case |
| Time | 57 min (05:09 to 06:06 UTC) after a 10 min remote-probe wait |
| Retries | none (T2 empty); no safeguards, timeouts or spawn failures |

Case sets: the 36 cases activated in aaaf107f (all 36 of the activation, the diff of `cases.json` against its parent) and 34
drawn from the 210 survivors by `sha256("gca-qa-test:" + id)` per domain of `truth.leaf`. The draw was proportional to
domain size with at least two per domain: ai 2, assets 3, behavior 2, data 2, defi 2, ecosystem 2, funding 2, network 2,
protocol 4, security 2, soroban 5, standards 2, tooling 2, wallets 2. Ids are in `ids.txt`; the split is in `ids.txt.meta.json`.
Note the "rewritten" set is the draw from every surviving case, since the audit rewrote them all.

## Verdicts

| Set | correct | partial | wrong | error | total |
|---|---|---|---|---|---|
| New (activated) | 16 | 17 | 3 | 0 | 36 |
| Rewritten (drawn) | 8 | 23 | 3 | 0 | 34 |
| All | 24 | 40 | 6 | 0 | 70 |

Core answer was `correct` on 65 of 70 rows, so most partials are missing key facts, not wrong answers. T3: three trap
cases, two pass, one fails (`q-raph-stolen-wallet-recovery`, reviewed below as a judge artifact). The five-track report is
in the collection log; it is not a quality score.

## Review coverage

Every `wrong` (6) and `partial` (40) row, plus every fifth `correct` row in run order (4 of 24), so 50 of 70. The 20 other
`correct` rows are unreviewed, not passes. Review read the question, golden, verdict, rationale, panel scores and the final
answer, plus tool-call sizes for every row. Evidence column: **probe** means I re-executed a read-only live call through the
Stellar Raven connector (not the paid pipeline); **transcript** means verdict and stored transcript only. Ten
classifications rest on probes; the rest on transcript evidence and should be read as likely, not proven. The full raw
transcripts of the 50 rows were not read line by line.

## Review table

| Id | Set | Verdict | Class | Reason | Proposed action |
|---|---|---|---|---|---|
| `q-pc-core-software-audits` | new | wrong | agent-failure | Docs "Audits" pages for Core+Soroban host, RPC, Rust SDK and Poseidon SDK exist and are searchable; the agent used only scout.listAudits and denied RPC/SDK audits. | Monitor-only (one case); no case change. |
| `q-pc-slp-0004-0006-status` | rewritten | wrong | upstream-data-gap | No Stellar Docs page, meeting note, Scout or Lumenloop hit mentions SLPs; the agent could not confirm the proposal type exists. | Upstream gap (see list); keep the case. |
| `q-raph-stolen-wallet-recovery` | rewritten | wrong (panel wrong/correct/wrong) | judge-artifact | Panel split wrong/correct/wrong; the rationale says behavior matched and only the background clawback fact was missing, yet the trap grade was wrong. | Demote key fact 2 (clawback) to golden.notes; no re-judge. |
| `q-scf-service-provider-directories` | new | wrong (panel wrong/wrong/partial) | judge-artifact | Agent named Scout's live partners directory with audit firms and anchors; the golden notes accept "another maintained partner directory named with its source", but the judge graded wrong. | Rubric note: honor "accept another directory" notes; reword key facts to "names a maintained directory with its source". |
| `q-sdf-2026-strategy-priorities` | new | wrong | corpus-coverage-diagnostic | stellar.org/foundation/strategy and the roadmap page are in no Raven source (Docs none; Lumenloop returned policy-hub and blog rows); the agent correctly declined to list priorities. | Keep golden; record coverage result. |
| `q-ti-scaffold-stellar` | rewritten | wrong | upstream-data-gap | Docs Scaffold page mentions environments.toml 3 times and scaffold.yml 0 times; the answer followed it and fired the avoid. | Upstream gap (see list). |
| `q-aas-claimable-predicates-expiry-reserves` | rewritten | partial | agent-failure | Core answer correct; omitted the 10-claimant cap. | None. |
| `q-aas-list-token-on-exchanges-aggregators` | rewritten | partial | agent-failure | Omitted setting the issuer home_domain; "each venue sets its own policy" given only as "no process found". | None. |
| `q-ai-mcp-servers-connect` | new | partial | agent-failure | Gave both endpoints and scopes; omitted Raven sign-in and that the Docs MCP needs none. | None. |
| `q-asset-sdex-vs-amm` | rewritten | partial | agent-failure | Omitted that a pool-share trustline needs two base reserves. | None. |
| `q-audit-reports-where-published` | new | partial | corpus-coverage-diagnostic | Portal and firms correct; stellar.org/audit-bank/projects is in no Raven source (Docs audit pages cover network software only; Lumenloop has only the Audit Bank blog post). | Keep golden; record coverage result. |
| `q-comp-yieldblox-oracle-incident` | rewritten | partial (panel partial/correct/partial) | eval-side-gap | Only "supply caps" was missing from a key fact that bundles three defenses plus a staleness claim. | Split key fact 4 or accept any two named defenses. |
| `q-crp-public-sector-cbdc-pilots-stellar` | new | partial | agent-failure | Conclusion and Marshall Islands right; omitted that the National Bank of Ukraine said the pilot was not its e-hryvnia. | None. |
| `q-data-network-metrics-sources` | new | partial | agent-failure | Hubble pages are indexed in Docs; the agent said no source existed for accounts or operations. SDF quarterly reports are a stellar.org-side source. | Monitor-only. |
| `q-defi-agent-identity-stellar-experimental` | rewritten | partial | corpus-coverage-diagnostic | ERC-8004 Draft status and x402 scope live with Ethereum; no Raven source hosts them. Stellar-side facts (no SEP, community Soroban code) were correct. | Make key facts 1-2 optional or move to notes. |
| `q-defi-blend-alternatives` | rewritten | partial | eval-side-gap | Key facts 2-3 demand unprompted disclaimers on named non-lenders (DeFindex, EquitX, Templar) the question did not ask for. | Collapse to one fact: names real lenders and separates non-independent or CDP systems; accept any example. |
| `q-defi-blend-audit-record` | new | partial | eval-side-gap | All firms, versions and dates correct; key fact 3 demands three report locations when the portal alone answers "where can I read them". | Reword to "at least one hosting location". |
| `q-defi-x402-on-stellar-what` | rewritten | partial | upstream-semantics-gap | Stellar Docs and skills present x402 as Coinbase-owned; Linux Foundation stewardship is absent, and the case notes already cap such an answer at partial. | Known; the case cannot score correct while the sources say Coinbase. |
| `q-eco-defi-market-map` | rewritten | partial | agent-failure | Omitted liquid staking and insurance as unverified lanes. | None. |
| `q-eco-hermes-renamed-zenex` | new | partial | agent-failure | Succession right; the agent did not confirm live status. Scout project record not checked in the transcript. | Monitor-only. |
| `q-eco-institutions-payment-networks-banks` | new | partial | agent-failure | Visa, Wirex and U.S. Bank right; named a later Mastercard item, not the October 2024 Crypto Credential. | None. |
| `q-eco-stablecoins-on-stellar` | rewritten | partial (panel wrong/partial/partial) | judge-artifact | Judge called "USDM (Montelibero)" fabricated; Scout getStablecoins returns USDM-GDHDC4GB, company Montelibero (re-run live). The pack did not show it; panel wrong/partial/partial. | Round record; rubric note not needed (pack gap). |
| `q-hist-meridian-2026-corrected-venue` | rewritten | partial | eval-side-gap | Venue and dates correct and the answer says "not Abu Dhabi"; key fact 2 requires Yas Marina Oct 21-22 and the 2026-04-01 announcement, which no Raven source states (Docs soft-empty). | Reword fact 2 to "earlier Abu Dhabi plans were superseded"; drop the dates. |
| `q-hist-unhcr-stellar-aid-assist` | rewritten | partial | agent-failure | Omitted UNICC and the non-additivity caveat on adoption snapshots. | None. |
| `q-infra-rpc-provider-archive-tier` | rewritten | partial | agent-failure | Exact dated nine-provider roster; omitted that ordinary RPC also serves getLedgers within retention. | None. |
| `q-infra-sdf-hosted-endpoints` | new | partial | upstream-semantics-gap | Docs Horizon overview lists only testnet and futurenet as SDF-run; a Skills playbook uses horizon.stellar.org; Docs say the public Horizon keeps a year. The agent hedged honestly. | Upstream gap (see list). |
| `q-infra-software-versions-current-protocol` | new | partial | corpus-coverage-diagnostic | Release set correct; no Raven source states which protocol Mainnet runs today (live network value). | Keep golden; record coverage result. |
| `q-net-protocol-meeting-notes-find-cap` | new | partial | agent-failure | Right index and URL patterns; omitted that pages carry the video and that the CAP preamble holds status. | None. |
| `q-net-tier1-roster-current` | new | partial | upstream-data-gap | Docs Tier 1 page covers requirements and Obsrvr Radar but lists none of the ten organizations; the agent said it could not retrieve the roster. | Upstream gap (see list). |
| `q-network-status-where-to-check` | new | partial | upstream-data-gap | Three places right; the Docs Network Status page is silent on SDF-run services such as Horizon and Friendbot (agent reading, not re-read). | Monitor-only. |
| `q-nft-vault-contract-standards` | new | partial | agent-failure | SEP-50, SEP-56 and OpenZeppelin right; reported "type Standard" instead of status Draft. | None. |
| `q-pay-anchor-msb-licensing` | rewritten | partial | eval-side-gap | Question is jurisdiction-neutral; key fact 2 demands US FinCEN-versus-state regimes. | Reword fact 2 to "jurisdiction-specific licensing regimes". |
| `q-pc-quorum-freeze-cap77` | new | partial | upstream-data-gap | Mechanism right; the agent found no source tying the YieldBlox freeze to CAP-77, whose SLP-0006 record is in no Raven source. | Upstream gap (see list). |
| `q-protocol-max-tx-set-size` | rewritten | partial | corpus-coverage-diagnostic | 1,000 classic operations right and dated; the 2,000 Soroban transactions per ledger figure lives only in live settings and Lab. | Keep golden; record coverage result. |
| `q-raph-buy-xlm-safely` | rewritten | partial | agent-failure | Declined to name a cheapest venue; omitted the withdrawal-network and memo check and the discount-offer warning. | None. |
| `q-signing-safety-website-request` | new | partial | agent-failure | Nine checks right; omitted account merge. | None. |
| `q-sor-classic-dex-from-contract` | rewritten | partial | eval-side-gap | Key fact 4 (programmable escrow) is not in the golden answer and the question does not ask for it; the other three facts were met. | Delete key fact 4. |
| `q-sor-scval-conversion` | rewritten | partial | upstream-data-gap | Agent reports Docs do not state the i128/u64 JS mapping or post-upgrade client behavior (transcript only, not re-read). | Monitor-only. |
| `q-soroban-cli-bindings` | rewritten | partial | agent-failure | TypeScript and Rust right; did not list placeholder languages or the regenerate rule. | None. |
| `q-soroban-pre-mainnet-security-steps` | new | partial | agent-failure | Docs STRIDE template and monitoring-plan pages are searchable; the answer omitted the threat-model step. | None. |
| `q-soroban-storage-migration` | rewritten | partial | agent-failure | Version marker and lazy or eager migration right; omitted bounded idempotent batches and the CAP-86 sparse-read nuance. | None. |
| `q-stellar-vs-xrp-ledger` | new | partial | corpus-coverage-diagnostic | No Raven source covers the XRP Ledger (Docs search returns nothing); key facts 2-4 are XRPL-side. | Retire, or restate to Stellar-side facts with XRPL as attributed context. |
| `q-ti-parse-raw-ledger-data` | rewritten | partial | eval-side-gap | Key fact 2 (getTransactions field types) is not asked; the question names LedgerCloseMeta, getLedgers, v4 meta and .xdr.zst, all of which were handled. | Drop getTransactions from the golden answer and key facts. |
| `q-ti-testnet-usdc-faucet` | rewritten | partial | eval-side-gap | Friendbot, trustline and issuer correct; the SAC-address clause and XLM-reserve point are not asked. | Delete the SAC clause from the golden. |
| `q-tool-indexer-repos-discovery` | rewritten | partial | agent-failure | Real Scout repos with dates; omitted the getEvents retention window. | None. |
| `q-zk-proof-systems-stellar` | rewritten | partial | agent-failure | Systems, host functions and Groth16 setup right; declined to say whether UltraHonk needs a setup. | None. |
| `q-consumer-apps-spend-save-send` | new | correct | none | Answer head and verdict rationale agree; all key facts present. | None. |
| `q-pc-account-merge-reclaim-reserve` | rewritten | correct | none | Answer head and verdict rationale agree; all key facts present. | None. |
| `q-scf-ai-agent-projects-agents-hackathon` | new | correct | none | Answer head and verdict rationale agree; all key facts present. | None. |
| `q-soroban-fee-refundable-rent` | new | correct | none | Answer head and verdict rationale agree; all key facts present. | None. |

Class tally of the 46 failures: agent failure 21, eval-side gap 8, upstream data gap 6, corpus-coverage diagnostic 6, judge artifact 3, upstream semantics gap 2, own-repo gap 0.

## Cases to fix (through golden-truth, not edited here)

- `q-raph-stolen-wallet-recovery` (judge-artifact): Demote key fact 2 (clawback) to golden.notes; no re-judge.
- `q-scf-service-provider-directories` (judge-artifact): Rubric note: honor "accept another directory" notes; reword key facts to "names a maintained directory with its source".
- `q-comp-yieldblox-oracle-incident` (eval-side-gap): Split key fact 4 or accept any two named defenses.
- `q-defi-agent-identity-stellar-experimental` (corpus-coverage-diagnostic): Make key facts 1-2 optional or move to notes.
- `q-defi-blend-alternatives` (eval-side-gap): Collapse to one fact: names real lenders and separates non-independent or CDP systems; accept any example.
- `q-defi-blend-audit-record` (eval-side-gap): Reword to "at least one hosting location".
- `q-hist-meridian-2026-corrected-venue` (eval-side-gap): Reword fact 2 to "earlier Abu Dhabi plans were superseded"; drop the dates.
- `q-pay-anchor-msb-licensing` (eval-side-gap): Reword fact 2 to "jurisdiction-specific licensing regimes".
- `q-sor-classic-dex-from-contract` (eval-side-gap): Delete key fact 4.
- `q-stellar-vs-xrp-ledger` (corpus-coverage-diagnostic): Retire, or restate to Stellar-side facts with XRPL as attributed context.
- `q-ti-parse-raw-ledger-data` (eval-side-gap): Drop getTransactions from the golden answer and key facts.
- `q-ti-testnet-usdc-faucet` (eval-side-gap): Delete the SAC clause from the golden.

Pattern across them: key facts that bundle several predicates, or that require a detail the question never asks for, turn
an otherwise correct answer into `partial`. Eight of the 46 failures are eval-side gaps of this kind.

## Upstream gaps by leaf

Bar for a finding is the same failure in two unrelated cases, so only the first two are finding candidates; the rest stay on
the monitor-only list.

| Leaf | Source | What it lacks | Content that would close it | Cases |
|---|---|---|---|---|
| `network.limits-settings`, `network.quorum-freeze` | Stellar Docs, meeting notes, Scout, Lumenloop | No page or hit for Stellar Limits Proposals (SLPs); nothing ties the YieldBlox freeze to CAP-77 or SLP-0006 | A Docs concept page on SLPs under `limits/` of stellar-protocol, with the SLP list and which are live | q-pc-slp-0004-0006-status, q-pc-quorum-freeze-cap77 |
| `tooling.scaffold-bindings` | Stellar Docs `/docs/tools/scaffold-stellar` | Describes legacy `environments.toml` (3 mentions) and never `scaffold.yml` v2 | Rewrite the page to v2 `scaffold.yml`, mark `environments.toml` legacy | q-ti-scaffold-stellar |
| `network.tier1-quorum` | Stellar Docs `/docs/validators/tier-1-orgs` | Requirements and process, no member list | A dated list of the ten Tier 1 organizations | q-net-tier1-roster-current |
| `data.providers` | Docs Horizon overview vs Skills data playbook | Disagree on whether SDF hosts a public Mainnet Horizon | One stated answer with the one-year retention | q-infra-sdf-hosted-endpoints |
| `ai.x402` | Stellar Docs and skills | Say Coinbase owns x402; omit Linux Foundation stewardship (known, `sd-005`) | State the stewardship | q-defi-x402-on-stellar-what |
| `data.explorers-status` | Docs Network Status page | Silent on SDF-run services (Horizon, Friendbot); not re-read | One sentence on coverage | q-network-status-where-to-check |
| `soroban.sdk-dialect-types` | Stellar Docs | Per the agent, no i128/u64 JS mapping or post-upgrade client note; not re-read | A ScVal conversion guide | q-sor-scval-conversion |

Corpus-coverage diagnostics (truth lives with another owner; keep the golden, record the result): `ecosystem.strategy-roadmap`
(stellar.org strategy page), `security.audit-registry` (stellar.org Audit Bank projects page; the same stellar.org gap
also shows in `q-scf-service-provider-directories`), `tooling.version-compat` and `network.limits-settings` (live network
values), `ai.mpp-agentic-protocols` (Ethereum ERC-8004), `ecosystem.chain-comparisons` (XRP Ledger). Three unrelated cases
(strategy, audit bank, service providers) miss for the same reason: stellar.org pages outside Docs are in no Raven source.
That meets the bar for an owner decision on whether a stellar.org source belongs in scope, not for an `improvements/` filing.

## Judge artifacts

- `q-eco-stablecoins-on-stellar`: panel wrong/partial/partial on "USDM (Montelibero)" as unsupported. Scout `getStablecoins`
  returns `USDM-GDHDC4GB`, company Montelibero (re-run live 2026-11-14). The pack did not show the row. Verified.
- `q-raph-stolen-wallet-recovery`: panel wrong/correct/wrong; the rationale itself says the behavior matched and only the
  background clawback fact was missing. Transcript-level call, not re-executed.
- `q-scf-service-provider-directories`: golden notes accept another maintained directory with its source; the judge ignored them.
  Transcript-level call, not re-executed.

## Other observations

- `q-pc-core-software-audits` and `q-audit-reports-where-published` both went to `scout.listAudits` and the Stellar Security
  Portal; the first never reached the Docs Audits pages that exist. One case, so monitor-only; two together would be an own-repo
  search-routing question (not claimed).
- The run used the subscription login; no API-billed path. The server terminal `gca-eval-server` is stopped. The worktree is left in place at `/home/tyler/code/raven-wt/gca-eval`.
