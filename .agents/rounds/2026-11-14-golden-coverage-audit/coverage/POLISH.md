# Polish: final overrides before the apply

Lane `polish`, 2026-11-14. Output: [`overrides.json`](overrides.json), 71 entries (68 rewrites, 2
retirement notes, 1 retirement). The apply was not run; no case file changed.

## Result

```sh
node .agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs --dry-run
# exit 1
# [summary] leaf=5 merge=91 retire=200 rewrite=205 tool=6; refusals=36; lintWarnings=95; openSlots=16; headline=210; tool=6
```

**The run does not exit 0, and the overrides cannot fix it.** All 36 refusals are
`case file has no audit record`, one for each new, untracked proposal under
`eval/qa/corpus/proposed/` (the gap lane wrote them while this lane ran; 4 existed at my first
run, 36 at my last). `apply.mjs` refuses any case file that has no audit record, and naming such
an id in `overrides.json` is itself a refusal. The fix is in `apply.mjs` or in the order of work:
skip unaudited files under `corpus/proposed/`, or run the apply before the proposals land.

Control: a scratch copy of `apply.mjs` with that one check limited to battery files, same inputs,
same overrides:

```
# exit 0
# [summary] leaf=5 merge=91 retire=200 rewrite=205 tool=6; refusals=0; lintWarnings=95; openSlots=16; headline=210; tool=6
```

Against my first dry run, with the draft overrides and `verify-coverage.json`: headline 211 to
210 (one retirement), lint warnings 147 to 95, snapshot-date warnings 18 to 0, key facts over 90
characters 23 to 0, wrapped avoid items 40 to 21 (the 21 read correctly), absorb-pending warnings
15 to 2 (both "none needed").

## How the overrides were built

Each rewrite starts from the case's current final rewrite (verifier `finalRewrite`, else auditor
`rewrite`) and changes only the named text. A build script applied each edit by exact anchor and
stopped on any anchor that did not match, so no rewrite was retyped. Avoid items the edits did not
touch were converted with `apply.mjs`'s own `normalizeAvoid`, so they read as they did in the
instrument lane's dry run. No "as of" date in any answer was moved.

**Key fact or answer clause.** The judge caps an answer at `partial` when any key fact is missing
(`eval/qa/judge.mjs`). So an absorbed fact became a key fact only where the survivor's question
asks for it. Where the question does not, the fact went into the answer as one clause, which
records the truth and gates nothing. Each row below says which form it took.

I read the final judge-facing form of all 210 headline cases, not only the 70 on weight-3 leaves.

## 1. Draft adopted (R1 to R3)

All eight entries of `apply/overrides-draft.json` are adopted after a diff against the base
rewrites: each changes one string. Two cases needed one more edit, because the draft removed a
date from the answer and left a key fact that still demanded it:

| Case | Added to the draft fix |
|---|---|
| `q-edge-noinfo-sep-9999` | Key fact "…absent from the official SEP registry, with an as-of date." → "States SEP-9999 is absent from the official SEP registry." |
| `q-pc-account-activation-not-found` | Key fact "(1 XLM at 0.5 XLM, dated)" → "(1 XLM at the 0.5 XLM reserve)" |

Unchanged from the draft: `q-asset-trustline-basics`, `q-pc-sequence-numbers-ordering-replace`,
`q-protocol-accounts-signers-thresholds`, and the notes for
`q-comp-sep8-number-lookup-no-deepresearch` and `q-gap-rpc-horizon-unindexed-reference`.
`q-sep-53-sign-verify-message` also carries its item-3 absorb.

## 2. verify-coverage

| Finding | Case | Change |
|---|---|---|
| accept-with-absorb | `q-aas-claimable-predicates-expiry-reserves` | New key fact: "The recipient needs no trustline at creation, but needs one to claim a non-native asset." The answer says the same. Five key facts. |
| accept-with-absorb | `q-asset-path-payment-ops` | The fixed-amount key fact became two, each with its bound (`destMin`, `sendMax`) and operation name. The key fact that only named the two operations is dropped as redundant. Four key facts. |
| leaf `ecosystem.xlm-markets` | `q-crp-cme-xlm-futures-dates` | `finalVerdict: "retire"` with a note. |
| leaf `protocol.fees-surge` | `q-pc-practical-fee-setting` | New key fact: "The fee charged is the network minimum outside surge and the lowest included bid in surge." The answer states both cases. |
| leaf `network.limits-settings` | `q-protocol-max-tx-set-size` | New key fact: "Limits are validator-voted settings, read live from Lab's Network Limits page or the CLI." The answer names both sources. |
| leaf `ecosystem.xlm-staking-rewards` | `q-raph-xlm-staking` | Key fact 3 now grades the proposal: "Rewards for locked XLM are an undecided SDF proposal, not a CAP or live feature (dated)." The note accepts a later dated status. |
| leaf `ecosystem.sdf` | `q-org-sdf-board-directors` | Question re-asked as the reviewer directed: "Who leads the Stellar Development Foundation today: who is its chief executive, and who sits on its board of directors?" Key facts: the chief executive, the board, and "Dates the leadership roster it cites." |
| mergeFix `q-tool-cctp-stellar-integration` | `q-cctp-v2-usdc-stellar` | Key fact with the reviewer's wording: "Inbound transfers set mintRecipient and destinationCaller to the CctpForwarder contract." Domain 27 stays in the answer. Five key facts. |

- **`q-aas-claimable-predicates-expiry-reserves` is the one absorb I made a key fact against my
  own rule.** The reviewer wrote that the survivor "must grade it", and the fact is the first line
  of the docs page. The survivor's question does not ask about trustlines, so a correct answer
  that sticks to the question can lose the fact. If that shows up as noise, append "and can the
  recipient lack a trustline?" to the question.
- **Tool lane (W2).** The review retired `q-ti-explain-repo-payload-status`. No case merges into
  it or into any other retired tool-lane case, so no `finalVerdict` override was needed. The four
  merges into kept tool-lane survivors still warn, as intended.
- **`duplicates`.** The reviewer names no merge.
- **Not expressible in overrides:** the new slot on `security.contract-security` (pre-Mainnet
  security practice). The untracked proposal `q-soroban-pre-mainnet-security-steps` appears to
  fill it.
- **Not taken:** the reviewer's option to reinstate `q-sep-31-cross-border`. The merge stands as
  the reviewer accepted it; the untracked proposal `q-sep31-flow-sep38-quotes` appears to fill
  the `standards.sep31-sep38` slot instead.

## 3. Absorb pending (W1)

| Merged case → survivor | Form | Text added to the survivor |
|---|---|---|
| `q-aas-burn-clawback-redemption-mechanics` → `q-asset-issue-asset-howto` | answer clause | "paying the asset back to the issuer burns it" |
| `q-comp-sac-inherits-flags` → `q-asset-trustline-vs-sac` | answer clause | "the issuer's authorization and clawback controls apply in both views" |
| `q-crp-become-an-anchor-licensing`, `q-production-anchor-architecture` → `q-anchor-sdp-vs-anchor-platform` | answer clause | "it is software, not a licence" |
| `q-infra-testnet-reset-schedule-recovery` → `q-infra-testnet-vs-futurenet` | key fact (the question asks when to use each network) | "Resets wipe accounts and contract data: Testnet on a planned cadence, Futurenet as needed." |
| `q-pay-travel-rule-aid-flows` → `q-pay-anchor-msb-licensing` | answer clause | "Travel Rule duties likewise attach to covered intermediaries, not to the protocol or to software." |
| `q-sep-7-uri` → `q-sep-53-sign-verify-message` | answer clause | "SEP-7 is the separate `web+stellar:` URI scheme for asking a wallet to sign a transaction." |
| `q-sor-recurring-escrow-patterns` → `q-stellar-recurring-payments` | answer clause | "A token allowance is the other pull pattern: the payer approves a bounded amount and the charger calls `transfer_from`." |
| `q-sor-sep41-transfer-vs-transferfrom` → `q-soroban-token-transfer-pattern` | answer clause | "…until its expiration, an absolute ledger number" |
| `q-soroban-oz-upgradeable-macro` → `q-soroban-storage-migration` | answer clause | "A Wasm update, which the contract must gate with its own authorization check, …" |
| `q-tool-passkey-wallet-recovery` → `q-passkey-wallet-recovery` | avoid item | "Do NOT claim SEP-30 recovers a passkey contract account." |

- No survivor's question changed.
- I did not add the suggested avoid item "Do NOT claim that running the Anchor Platform licenses
  an anchor": the survivor asks how three tools differ, so the item would not fire.
- `q-sep-7-uri`: `q-sep-53-sign-verify-message` does not test SEP-7 knowledge, so the fact is
  recorded there and not graded. `q-sep-catalog-list` already names SEP-7 in its answer and tests
  the number-to-purpose mapping; it is the better `survivor` if the orchestrator wants the
  tombstone to point at a case that tests the same knowledge.
- No change, as `REFUSALS.md` found: `q-aas-list-token-on-exchanges-aggregators` and
  `q-tool-indexer-repos-discovery` (these two still print "absorb pending").

## 4. Snapshot dates (W5)

All 18 key facts no longer name the round date; the dry run prints no `snapshot-date` warning.
Wording follows the corpus's existing "(as of a stated date)" form, and every case's note accepts
a later dated value (added for `q-sep-41-token-interface` and `q-sep-45-contract-auth`, which
lacked one).

| Case | Key fact now |
|---|---|
| `q-anchor-moneygram-ramps` | Names a dated path: the widget SDK for new partners or legacy SEP-10/SEP-24. |
| `q-defi-agent-identity-stellar-experimental` | Stellar has no ratified SEP for agent identity (as of a stated date). |
| `q-defi-bridge-evm-to-stellar-axelar` | An Axelar route can deliver USDC.axl rather than Circle-native Stellar USDC. |
| `q-edge-metamask-evm-mental-model` | MetaMask's support docs list Stellar as a default network for XLM (as of a stated date). |
| `q-infra-horizon-vs-rpc` | Official docs label Horizon as nearing end-of-life (as of a stated date). |
| `q-org-sdf-board-directors` | See item 2. |
| `q-protocol-max-tx-set-size` | Soroban has its own per-ledger transaction limit (2,000, dated) and resource limits. |
| `q-raph-xlm-staking` | See item 2. |
| `q-sep-41-token-interface` | SEP-41 signatures changed between Draft versions; a cited version carries its date. |
| `q-sep-45-contract-auth` | SEP-45 is a Draft, not a Final standard (as of a stated date). |
| `q-sep6-sep24-sep31-choice` | SEP-6, SEP-24 and SEP-31 are Active standards (as of a stated date). |
| `q-soroban-contract-build-verification` | SEP-55 and SEP-58 are complementary Draft standards (as of a stated date). |
| `q-sor-ttl-defaults-extend` | Mainnet TTL, dated: min Persistent 2,073,600, min Temporary 17,280, max 3,110,400. |
| `q-ti-rpc-gettransactions-pagination-xdr` | Stock limits, dated: getTransactions 50/200, getEvents 100/10000, getLedgers 50/200. |
| `q-ti-scaffold-stellar` | Current config is a v2 scaffold.yml; environments.toml is legacy (as of a stated date). |
| `q-ti-self-host-retention-backfill` | RPC HISTORY_RETENTION_WINDOW defaults to 120960 ledgers, about 7 days (dated release). |
| `q-tool-passkeykit-smart-wallet` | Passkey Kit and the Smart Account Kit SDK are labeled unaudited (as of a stated date). |
| `q-zk-host-functions-status` | No native Goldilocks, NTT or FRI host functions exist (as of a stated date). |

## 5. Key-fact warnings

110 `[lint-warn] key-fact` lines at the start, 78 now: 0 over 90 characters (was 23), 60 multiple
predicates (was 69), 18 negative-predicate objects (was 18).

**Split** (one key fact became two): `q-comp-sep8-regulated-assets-approval-server`,
`q-pc-tx-finality-failure-semantics`, `q-protocol-state-archival-ttl`, `q-cctp-v2-usdc-stellar`,
`q-asset-path-payment-ops`.

**Trimmed, same fact:** `q-crp-regional-offramp-mobilemoney`,
`q-eco-stellar-rwa-stablecoin-volume`, `q-rwa-projects-tokenizing-stellar`,
`q-pc-fee-bump-channel-accounts-feepool`, `q-pc-sponsored-reserves` (two),
`q-pc-slp-0004-0006-status`, `q-protocol-operation-types-list`, `q-protocol-tier1-requirements`,
`q-scf-nqg-voting`, `q-ti-secret-key-vs-mnemonic-derivation`, `q-zk-proof-systems-stellar`,
`q-pc-quantum-preparedness-dormant`, `q-asset-deploy-sac-cli`, `q-asset-issue-asset-howto`,
`q-sep-53-sign-verify-message` (two), and the item-4 cases.

**Trimmed, and a part dropped on purpose:**

| Case | Dropped from the key fact | Why |
|---|---|---|
| `q-defi-x402-on-stellar-what` | "x402 is distinct from MPP" | A second, unrelated predicate; the avoid item "Do NOT conflate seller, facilitator, x402 and MPP roles" already guards it. |
| `q-ti-openzeppelin-relayer` | "a 401 is not proof of downtime" | The answer does not say it. |
| `q-ti-self-host-retention-backfill` | `SERVE_LEDGERS_FROM_DATASTORE=true` | The answer names only `BACKFILL=true`. |
| `q-soroban-event-indexing-design` | "backfill needs another source" | The answer does not say it. |

### Warnings left in place (78)

The text of every line is in the dry run.

- **Negative-predicate object (18): all false positives.** The lint reads the adjective
  "separate" and the verbs "separates", "rejects", "distinguishes" as a rejection whose object
  must be in the question. None of these key facts is a trap.
- **Multiple predicates (60):**
  - Four false positives, where a noun ("date", "dates", "state") or the adjective "separate"
    matches the verb list: `q-edge-fresh-latest-blend-tvl` (two),
    `q-hist-unhcr-stellar-aid-assist`, `q-infra-testnet-vs-futurenet`.
  - One on a tool-lane case I did not edit: `q-scf-resolve-passport-superseded-slug`.
  - 55 real two-clause facts, left for one of two reasons. Most are one contrast or one
    consequence ("About 48M XLM was quarantined by validators; quarantine is not recovery";
    "SEP-6 is the programmatic API; only its interactive flow is deprecated"): the second clause
    is the point, and half of the fact means nothing alone. The rest pair two facts to stay
    within five key facts: `q-sep-catalog-list` (three key facts hold six SEPs),
    `q-scf-sdf-bug-bounty`, `q-scf-vs-sdf-enterprise-fund`, `q-pc-memos-reference`.

## 6. Avoid items (W4)

Seven items did not read as sentences. Five were wrapped; two came from a gerund conversion and
were not in the `[avoid-wrapped]` list.

| Case | Now |
|---|---|
| `q-anchor-list-builders-discovery` | Do NOT name anchors that no source lists, or call a listing a complete permanent roster. |
| `q-edge-fresh-latest-blend-tvl` | Do NOT give an undated or provider-less TVL, or only a dashboard link. |
| `q-sep-catalog-list` | Do NOT pair a SEP number with the wrong standard, such as SEP-24 as KYC or SEP-31 as interactive deposit. |
| `q-soroban-check-auth-custom-account` | Do NOT describe `__check_auth` as called directly by users, or model it on EIP-4337. |
| `q-sor-ttl-defaults-extend` | Do NOT state network TTL settings as undated, fixed constants. |
| `q-asset-deploy-sac-cli` | Do NOT say using a classic asset in Soroban needs a separately written and deployed token contract. (was "Do NOT write and deploy … is the way to use …") |
| `q-eco-stablecoins-on-stellar` | Do NOT conflate fiat stablecoins with yield-bearing certificates and fund tokens, or read a null supply as zero. (was "…or reading a null supply as zero") |

Two more, for meaning: `q-asset-issue-asset-howto` ("Do NOT describe issuing a classic asset as
deploying an ERC-20-style contract.") and `q-protocol-base-reserve-min-balance` ("Do NOT call
0.5 XLM a fixed protocol constant, or add liabilities to the minimum-balance formula."; "present
0.5 XLM as timeless" could be read as an omission rule, and a fired avoid item is always
`wrong`).

The 21 wrapped items that remain read correctly as "Do NOT claim that …".

## 7. Guard tests

| Test | Case | Call |
|---|---|---|
| `test/qa-judge-qpp-dormant.test.mjs` | `q-pc-quantum-preparedness-dormant` | **Keep the test.** The guarded fact matters: the QPP describes dormant holders in words, so the negative is only true of a final, mechanical rule. Restored: "No QPP or CAP source defines a final mechanical dormant-account eligibility rule (dated)." The answer uses the same words. I ran the test's assertions against the would-be case: all pass. |
| `test/qa-golden-max-tx.test.mjs` | `q-protocol-max-tx-set-size` | **Remove the test.** It requires an answer sentence about what the XDR schema defines. That sentence corrected a golden that once credited the schema with the values. The compact answer makes no schema claim, so there is nothing left to guard, and the sentence is not part of the question. The decision it protected (values come from Docs and live settings) is now the third key fact. |
| `test/qa-corpus-lint.test.mjs` ("permits the dated seven-, eight-, and current nine-row archive rosters") | `q-infra-rpc-provider-archive-tier` | **Remove the test.** It requires one key fact to name seven, eight and nine rows. The new key fact, "Names a dated archive roster taken from the official Providers table", accepts any dated roster, and the note keeps the seven- and eight-row allowance. Restoring the counts would make the key fact reject a ten-row roster. If a guard is wanted, assert that no key fact matches `must name only\|exactly (seven\|eight\|nine)`. |

## 8. Read-through

Weight-3 leaves: 37 leaves, 70 cases, each read once as the judge would. Fixes:

| Case | Leaf | Problem | Fix |
|---|---|---|---|
| `q-soroban-simulate-resource-fee` | `soroban.simulation` | Key fact required "a missing footprint entry is a `HostError`"; the answer does not say it. | "The simulated data, resource fee and auth are applied to the transaction before signing." (the leaf's waived facet) |
| `q-eco-defi-market-map` | `ecosystem.project-directory` | Key fact required "NFT marketplaces exist"; the answer does not, and the question is about DeFi. | "Thin lanes such as perps and liquid staking are to be verified, not called empty." |
| `q-soroban-token-transfer-pattern` | `soroban.authorization` | Key fact required the `MuxedAddress` typing of `transfer`; the answer never mentions it, and an agent reading the SDK docs cannot supply it. | Key fact removed. The note still accepts either typing. Three key facts. |
| `q-pc-memos-reference` | `protocol.memos-muxed` | "Memo types and limits, with at most one memo per classic transaction." states no types or limits. | "At most one memo per transaction: text (28 bytes), ID (uint64), hash or return (32 bytes)." |
| `q-pc-quantum-preparedness-dormant` | `behavior.no-info-honesty` | See item 7. | |
| `q-edge-noinfo-sep-9999`, `q-pc-account-activation-not-found` | `behavior.fabrication-bait`, `protocol.accounts-reserves` | See item 1. | |
| `q-protocol-base-reserve-min-balance` | `protocol.accounts-reserves` | See item 6. | |

The same defect outside weight 3, found while reading the rest:

| Case | Problem | Fix |
|---|---|---|
| `q-comp-yieldblox-oracle-incident` | The question asks for design lessons and a key fact grades them; the answer had none. | One sentence restored from the previous golden: "Defenses are market-depth minimums, value bounds and supply caps on thin collateral." |
| `q-defi-blend-alternatives` | Key fact "Slender's regular borrowing is over-collateralized" is not in the answer and is not what the question asks. The previous golden held it as an avoid item. | Key fact removed; avoid item restored: "Do NOT describe Slender's regular borrowing as uncollateralized." |
| `q-scf-audit-bank` | Key fact "Priority categories include financial protocols and infrastructure contracts" is not in the answer or the question. | Key fact removed. Two key facts. |
| `q-edge-metamask-evm-mental-model` | Key fact required "exposes XLM through SEP-41"; the answer does not say it. | "XLM has a deterministic, network-specific Stellar Asset Contract ID." |

Seen and not changed:

- `q-edge-oos-solana-vs-aptos` (a `keep`, so no rewrite) still carries two "GT-26 … 2026-07-10"
  history stamps in `golden.notes`. A `tighten` that moves them to `truth.notes` would fix it.
- `protocol.memos-muxed`: the coverage note asks for one SEP-29 key fact on
  `q-pc-memos-reference` "when it is next edited". The question does not ask about the
  memo-required check, so I did not add one.
- Avoid items that punish an undated roster or version (for example `q-tool-cli-skills-discovery`,
  `q-infra-testnet-vs-futurenet`) make an omission `wrong`. Two lanes kept them; I left them.

## Evidence for added facts

All observed 2026-11-14. Class letters as in `briefs/common.md`. `overrides.json` cannot carry
corroboration rows, and `apply.mjs` builds `truth.corroboration` only from the audit records, so
these rows reach a case's `truth` block only if the orchestrator adds them.

### q-aas-claimable-predicates-expiry-reserves

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/build/guides/transactions/claimable-balances | "A trustline must be established by the claimant to the asset before it can claim the claimable balance" |
| A | same page | "They can be used when you send a non-native asset to an account that has not yet established a trustline" |
| A | https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations | "`CLAIM_CLAIMABLE_BALANCE_NO_TRUST` \| -4 \| The source account does not trust the issuer of the asset it is trying to claim" |

### q-asset-path-payment-ops

The bounds were already in the survivor's verified answer.

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations | "Destination min \| integer \| The minimum amount of `destination asset` the destination account can receive." |

### q-pc-practical-fee-setting

One class (A); the reviewer read the same page independently.

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering | "During surge pricing mode, transactions are sorted based on their inclusion fee amount, and the user pays the minimum inclusion fee in their transaction set." |
| A | same page | "If all five transactions can make it to the ledger … each would pay the minimum inclusion fee of 100 stroops (.00001 XLM)." |

### q-protocol-max-tx-set-size

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/networks/resource-limits-fees | "The Stellar Lab's Network Limits page displays real-time network settings for Testnet, Mainnet, and Futurenet." |
| A | same page | "You can also query current network settings directly from the command line using: stellar network settings" |
| F | `stellar network settings --help` (stellar 30.0.1) | "Fetch the network's config settings" |

### q-raph-xlm-staking

The proposal's status was already in the survivor's verified answer.

| class | ref | quote |
|---|---|---|
| A | https://stellar.org/xlm-utility | "could support rewards for locked XLM over ten years. Illustrative scenarios, not forecasts or commitments." |
| B | https://github.com/orgs/stellar/discussions/2052 (Tokenomics, created 2026-10-31) | "asked whether a rewards mechanism funded from the existing fee pool could improve utility. Mechanics are not defined yet." |

### q-org-sdf-board-directors

| class | ref | quote |
|---|---|---|
| A | https://stellar.org/press/metamask-makes-stellar-a-default-network-bringing-global-payments-into-the-open-money-platform (dated October 29, 2026) | "said Denelle Dixon, CEO and Executive Director, Stellar Development Foundation." |
| A | https://stellar.org/foundation/team | "## Leadership … ### Denelle Dixon"; "## Board of directors ### Jed McCaleb ### Lin-Hua Wu ### Ronaldo Lemos ### Ginger Baker ### Asiff Hirji" |
| D | https://www.fastcompany.com/91630255/cryptos-next-win-is-invisibility (2026-10-28) | "Denelle Dixon is CEO and executive director of Stellar Development Foundation." |

The team page prints names without titles, so the title rests on the press release and the
byline. The case's sentinel `sdf-board-roster` watches the board list only.

### q-cctp-v2-usdc-stellar

| class | ref | quote |
|---|---|---|
| A | https://developers.circle.com/cctp/references/stellar | "Always use CctpForwarder when routing CCTP USDC to a Stellar address. Set both mintRecipient and destinationCaller to the CctpForwarder contract address." |
| A | https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc | "The Stellar CCTP Forwarder contract is set as both the mintRecipient and destinationCaller." |

### q-asset-issue-asset-howto

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets | "To delete, or \"burn\", an asset, you must send it back to the account that issued it." |
| A | https://developers.stellar.org/docs/tokens/stellar-asset-contract | "Transfers to the issuer account will burn the token, while transfers from the issuer account will mint." |

### q-asset-trustline-vs-sac

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/tokens/stellar-asset-contract | "allowing asset issuers to have the same control in Soroban as they do in Stellar classic" |
| A | same page | "A trustline balance can only be clawed back using the `clawback` contract function if the trustline has `TRUSTLINE_CLAWBACK_ENABLED_FLAG` set." |

### q-anchor-sdp-vs-anchor-platform

"Not a licence" is a negative: the page describes software and grants nothing. The merged case
`q-crp-become-an-anchor-licensing` held the same claim as a reviewed avoid item.

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/platforms/anchor-platform | "The Anchor Platform provides a set of tools and APIs for building on and off-ramp services on the Stellar network." |

### q-infra-testnet-vs-futurenet

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/networks | "Testnet and Futurenet are reset periodically to the genesis ledger" |
| A | same page | "Resets clear all ledger entries (accounts, trustlines, offers, smart contract data, etc.), transactions, and historical data" |

### q-pay-anchor-msb-licensing

A United States source; the clause says "covered intermediaries" and asserts no jurisdiction's
rule. The merged case `q-pay-travel-rule-aid-flows` cites the FATF guidance for the same
allocation.

| class | ref | quote |
|---|---|---|
| A | https://www.fincen.gov/resources/statutes-regulations/guidance/funds-travel-regulations-questions-answers | "All transmittor's financial institutions must include and send the following in the transmittal order" |
| A | same page | "An intermediary financial institution must pass on all of the above listed information" |

### q-sep-53-sign-verify-message

| class | ref | quote |
|---|---|---|
| B | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md | "Title: URI Scheme to facilitate delegated signing … Status: Active … Version: 2.1.0" |
| B | same file | "The scheme name will be `web+stellar` and should always be followed by a colon to look like this: `web+stellar:`" |

### q-stellar-recurring-payments, q-soroban-token-transfer-pattern

| class | ref | quote |
|---|---|---|
| B | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md (Draft, v0.5.2) | "fn approve(env: Env, from: Address, spender: Address, amount: i128, live_until_ledger: u32);" |
| B | same file | "`live_until_ledger` - The ledger number where this allowance expires." |
| B | same file | "fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128);" |

### q-soroban-storage-migration

| class | ref | quote |
|---|---|---|
| A | https://developers.stellar.org/docs/build/guides/conventions/upgrading-contracts | "Before upgrading, the contract checks if the action is authorized by the `Admin` address. This is crucial to prevent unauthorized upgrades." |

### q-passkey-wallet-recovery

A negative claim, relative to SEP-30 v0.8.1 as of 2026-11-14: the standard adds servers as
signers of an account and signs its transactions, and it depends on SEP-10.

| class | ref | quote |
|---|---|---|
| B | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0030.md | "add those servers as signers of the account" |
| B | same file | "Implementers and clients of this protocol must also implement [SEP-10]." |
| D | `parallel-cli search` "SEP-30 account recovery passkey smart wallet contract account C-address recovery Stellar" (six results; none describes SEP-30 recovering a contract account) | https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets: "They hold assets and enforce authorization in `__check_auth` instead of a single secret key." |

### Restored from the case's previous golden (no new fact)

- `q-comp-yieldblox-oracle-incident`: the defenses sentence ("require independent value/NAV
  bounds, market-depth and active-trader minimums, … per-asset supply/borrow/value caps").
- `q-defi-blend-alternatives`: the avoid item (previous `avoid[3]`; the case note cites `ll-033`).
- `q-pc-quantum-preparedness-dormant`: "final mechanical" (previous key fact 5).

## Method notes

- Sources: `parallel-cli extract` and `search`, `gh api`, raw SEP files, and the local Stellar CLI.
  No paid Lumenloop research, no model-calling eval, no sub-agents.
- No limit was met.
- Sibling sweep on the would-be battery: no other case names SDF's chief executive, and no other
  case states what fee is charged in or out of surge, so neither new key fact has a sibling to
  contradict.
