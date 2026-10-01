# Golden follow-ups — 2026-10-01

## Scope

This ledger records the `golden2` lane of the 2026-10-01 backlog closeout round. The lane closed
four `.agents/TODO.md` items that the owner-judgment lane opened
([ledger](golden-owner-judgments.md)):

1. "Refresh the SCF current-round goldens after the #45 phase change".
2. "Re-verify the MetaMask Bridge statements in `q-defi-bridge-evm-to-stellar-axelar`".
3. "Remove superseded legacy lines from the compliance grader notes".
4. "Assess a Stellar Docs lead for the ledger cadence after Protocol 28".

Out of scope: every paid evaluation, every upstream write, and a Protocol 29 sweep of other cases.
The lane made no paid model call and filed no upstream issue.

## Lanes

| lane | agent (model, effort) | write set | status |
|---|---|---|---|
| golden follow-up author | Claude Fable 5.1, high | seven battery cases, generated QA files, the register, one finding, `improvements/intake.json`, `improvements/INDEX.md`, `.agents/TODO.md`, this ledger | complete |
| independent blind review | GPT-6-Astra, assigned by the coordinator | review report | complete: ACCEPT WITH FIXES; three findings applied below |

All live checks ran on 2026-10-01 between 18:48Z and 18:56Z. Source classes follow the
`golden-truth` skill: A official docs, B source code, C live service, D general web, E docs index,
F empirical execution.

## Ledger

### Item 1 — SCF #45 phase refresh

Cases: `q-scf-current-round`, `q-edge-fresh-latest-scf-round`.

| claim | class | source | result |
|---|---|---|---|
| #46 is in Submission, deadline 2026-11-08 | A | `https://communityfund.stellar.org/awards`, fetched 18:48Z | "SCF #46 Submission, Deadline to submit: November 8, 2026" |
| #45 is in Notification & Award Distribution | A | same page | "SCF #45 Notification & Award Distribution" |
| #45 phase, detail page | A | `https://communityfund.stellar.org/awards/reccaFUJmN4HNQxvo` | "SCF #45 is currently in the Notification and Award Distribution phase." |
| #44 is the last concluded round | A | awards page | "SCF #44 Ended"; #45 has not ended |
| Same three states | C | `https://stellarlight.xyz/api/rfps?status=open`, `generatedAt` 17:56:10Z | `currentRound: 46`, `currentPhase: Submission`, `closes: 2026-11-08`; round 45 "Notification & Award Distribution"; `lastConfirmedRound: 44` |

Scout names the official awards page as its `verifyAt` source. Class C is therefore not fully
independent of class A. The fact rests on the two official pages.

Changes in both cases: the answer date moves from 2026-09-03 to 2026-10-01. The answer, key fact 5,
and the notes report #45 in Notification & Award Distribution. `truth.asOf` is 2026-10-01.
`truth.reverifyBy` is unchanged (2026-11-09 and 2026-11-10), because the next known phase event is
the #46 deadline. Root cause: `freshness-drift`.

Register: the hand-owned numeric invariant "SCF Submission" now carries the 2026-10-01 state and
evidence. The review helper covers clusters and date traps only, so the lane edited that entry
directly. A review closed the SCF date-contingent trap and `cluster-011`, `-027`, `-033`, `-040`,
`-121`, and `-122`.

Sibling sweep: `grep '#45|Panel Review'` over the battery. `q-scf-open-rfps-live` names #45 in an
avoid item without a phase. `q-scf-open-rfps`, `q-scf-rfp-tooling`, `q-scf-round-43-results`, and
`q-scf-total-distributed` carry no #45 phase claim.

### Item 2 — MetaMask route statements in `q-defi-bridge-evm-to-stellar-axelar`

| claim | class | source | result |
|---|---|---|---|
| MetaMask documents swaps into Stellar | A | `https://support.metamask.io/configure/networks/stellar/`, last-modified 2026-09-30 | "You can swap from another chain directly into XLM or another token like USDC on Stellar using the Swap button on the MetaMask homepage." |
| A bridge cannot create a trustline | A | same page | "A cross-chain swap (bridge) cannot create a trustline on your behalf." |
| Production configuration enables Stellar accounts | C | `https://client-config.api.cx.metamask.io/v1/flags?client=extension&distribution=main&environment=prod` | `stellarAccounts: {enabled: true, minimumVersion: "13.50.0"}` |
| Production configuration lists Stellar as an active bridge chain | C | same response | `bridgeConfig.chains["20000000000002"]: {isActiveSrc: true, isActiveDest: true}`; `chainRanking` includes `stellar:pubnet` |
| Mobile configuration agrees | C | same endpoint with `client=mobile` | `stellarAccounts: {enabled: true, minimumVersion: "8.13.0"}`; Stellar in `bridgeConfigV2.chainRanking` |
| The gating extension version is released | B | `MetaMask/metamask-extension` releases | `v13.50.0`, published 2026-09-25 |
| The chain ID above is Stellar | B | `MetaMask/core@418b73c1` `packages/bridge-controller/src/types.ts` | `STELLAR = 20000000000002` |
| Implementation support | B | `MetaMask/metamask-extension@ebd93b06` `CHANGELOG.md` | "Added a warning banner for missing Stellar trustlines during cross-chain swaps (#45693)" |
| The bridge token list covers Stellar | C | `https://bridge.api.cx.metamask.io/getTokens?chainId=20000000000002` | HTTP 200, 34 tokens, including XLM and Circle USDC |
| A route from Ethereum to Stellar returns quotes | F | `https://bridge.api.cx.metamask.io/getQuote`, five requests at 18:49Z; see "Recorded quote requests" | HTTP 200 with zero quotes each |
| The request shape is valid | F | same endpoint, Ethereum USDC → Solana USDC; see "Recorded quote requests" | HTTP 200 with nine quotes |

The quote requests were read-only. They signed nothing and submitted nothing.

#### Recorded quote requests

The lane recovered every request from its session record. It made no new request for this section.
Each request was a GET to `https://bridge.api.cx.metamask.io/getQuote` with the headers
`User-Agent: Mozilla/5.0` and `X-Client-Id: extension`. Every address below is a public address
that the lane used only as a quote input.

Shared parameters:

```text
walletAddress=0x28C6c06298d514Db089934071355E5743bf21d60
srcChainId=1
slippage=0.5
insufficientBal=true
resetApproval=false
```

Batch 1 started at 2026-10-01T18:49:33Z. Both requests used
`destChainId=20000000000002` and
`destWalletAddress=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`. That address is the
USDC issuer account, which is an unusual destination.

| # | srcTokenAddress | srcTokenAmount | destTokenAddress | status | quotes |
|---|---|---|---|---|---|
| 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (USDC) | `100000000` (100 USDC) | `USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` | 200 | 0 |
| 2 | same | same | `0x0000000000000000000000000000000000000000` (XLM) | 200 | 0 |

Batch 2 started at 2026-10-01T18:49:54Z. The Stellar requests used
`destWalletAddress=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX`. Horizon showed that
this account exists and holds XLM only, so it has no USDC trustline.

| # | destChainId | srcTokenAddress | srcTokenAmount | destTokenAddress | destWalletAddress | status | quotes |
|---|---|---|---|---|---|---|---|
| 3 (control) | `1151111081099710` (Solana) | USDC, as above | `100000000` | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | `5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1` | 200 | 9 |
| 4 | `20000000000002` | USDC, as above | `100000000` | `USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` | `GDUK…YLEX`, as above | 200 | 0 |
| 5 | `20000000000002` | USDC, as above | `100000000` | `0x0000000000000000000000000000000000000000` (XLM) | same | 200 | 0 |
| 6 | `20000000000002` | `0x0000000000000000000000000000000000000000` (ETH) | `100000000000000000` (0.1 ETH) | `0x0000000000000000000000000000000000000000` (XLM) | same | 200 | 0 |
| 7 | `stellar:pubnet` | USDC, as above | `100000000` | `stellar:pubnet/asset:USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` | same | 429, "error code: 1015" | — |

The control returned nine quotes. The session record kept the first six bridge labels: Across,
Mayan (two), Mayan through Socket, Relay, and Mayan through Rango. The last three labels are
unrecoverable.

Request 7 used a chain ID form that the API may not accept, and it met the rate limit. It is not
part of the route conclusion. The lane stopped the probe at that HTTP 429 and sent no further
request.

Correction: the first version of this ledger and of the case said "three" Stellar requests. The
session record shows five with the numeric chain ID: two in batch 1 and three in batch 2. All five
returned HTTP 200 with zero quotes. The conclusion does not change.

Limits of these requests: no destination account held a USDC trustline, batch 1 used an issuer
account, and the client headers were minimal. Each limit can explain an empty result. The empty
results do not show that no route exists.

Verdicts:

- "MetaMask documents and configures swaps into Stellar": `confirmed-as-of` 2026-10-01.
- "A working MetaMask route from Ethereum USDC to Stellar exists, with a known messenger and
  destination token": `unverifiable`. Zero quotes on five requests do not prove that no route
  exists. The request shape, the destination account, or the client version can explain them.

Changes:

- Answer: the sentence "this audit did not verify MetaMask Bridge itself as the Stellar route" now
  reports the documented support, the configuration, and the empty quote result, each dated. The
  answer states no request count.
- Avoid item 2: "Do NOT claim MetaMask Bridge itself supports Stellar or recommend a route as safe
  without dated provider evidence" is now "Do NOT claim a MetaMask route to Stellar is safe or
  delivers Circle-native Stellar USDC without dated provider evidence." The old text could punish
  a claim that MetaMask now documents.
- Notes: one also-good line and one new freshness line. A dated, attributed statement of MetaMask's
  support is accepted and is not required.
- `truth.asOf` stays 2026-07-10. The lane did not re-run the CCTP, Allbridge, Squid, or Axelar
  route observations.

Register: a review closed `cluster-037`. The bridge case and `q-edge-metamask-evm-mental-model`
now give the same dated account of MetaMask's Stellar support.

### Item 3 — legacy lines in the compliance grader notes

Each case kept a legacy grounding line above a dated CORRECTION line that overrides it. The edits
remove or reword only those lines. No answer, key fact, or avoid item changed.

| case | removed or reworded | conflicts with |
|---|---|---|
| `q-pay-anchor-msb-licensing` | "Anchor responsibility model is first-party (anchors are regulated financial institutions; the protocol/SDF is not a licensee)"; also-good "Anchors must map licenses…" now names each regulated participant | key fact 1, avoid item 1 |
| `q-pay-travel-rule-aid-flows` | "SDF-published responsibility framing: the originating org / licensed anchor holds Travel Rule/KYC; SDF disclaims control over independent orgs' fees in aid flows" | avoid items 1 and 3 |
| `q-comp-finclusive-caas` | "Partner names (MoneyGram, Bitso, Biccos, Kado, Nium) per SDF/anchor materials"; the SDF article line and the also-good line now carry the 2020 date | avoid item 4, key fact 2 |
| `q-comp-anchor-compliance-stack` | also-good "AUTH_REQUIRED / AUTH_CLAWBACK_ENABLED" is now "AUTH_REQUIRED / AUTH_REVOCABLE"; also-good "The anchor (a regulated financial institution) … licensing burden is the anchor's" now names the regulated operator | avoid items 3 and 4, key fact 5 |

The fourth case was not in the TODO item. The sibling sweep found the same legacy allocation line
there, so the lane cleaned it in the same change.

| claim | class | source | result |
|---|---|---|---|
| Treatment follows the business model, not a label | A | FinCEN FIN-2019-G001, `https://www.fincen.gov/system/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf` | "Although when describing a business model this guidance may use a label … the interpretation provided herein applies only to the business model the guidance describes" |
| Travel Rule duties attach by role in the transmittal | A | `https://www.fincen.gov/resources/statutes-regulations/guidance/funds-travel-regulations-questions-answers` | "An intermediary financial institution must pass on all of the above listed information … it receives from a transmittor's financial institution" |
| The SDF article names Biccos only | A | `https://stellar.org/blog/policy/drive-inclusion-through-compliance`, published 2020-09-11 | "Use Case: Biccos"; the recorded text search returned zero matches for MoneyGram, Bitso, Kado, and Nium |
| FinClusive's self-description | A | `https://finclusive.com/company/operating-provisions` | "FinClusive is not a bank, does not have a banking charter and is not a licensed Money Services Business." |
| SEP-8 flags | B | `stellar/stellar-protocol@af35d0cc` `ecosystem/sep-0008.md`, v1.7.4 | "Regulated asset issuers must have both `Authorization Required` and `Authorization Revocable` flags set on their account." |
| The anchors page states no licensing allocation | A | `stellar/stellar-docs@109d95d1` `docs/learn/fundamentals/anchors.mdx` | anchors are on and off-ramps "such as financial institutions or fintech companies" |

Root cause: eval-side authoring. The 2026-07-10 correction added the CORRECTION lines and left the
legacy lines in place.

Register: the three named cases are in no register entry. `q-comp-anchor-compliance-stack` reopened
`cluster-009` and `cluster-036`; a review closed both.

### Item 4 — Stellar Docs cadence lead

Decision: file a finding. The lane prepared `sd-054` at status `verified` and ran the dry run. It
did not file upstream.

Classification: `docs-content`. The Stellar Stack and Validators pages undertake to state the
cadence. The finding asks for a precision update. It does not claim a contradiction, because five
seconds is inside the documented range.

| claim | class | source | result |
|---|---|---|---|
| Two pages say "every 5-7 seconds" | A | `stellar/stellar-docs@109d95d1` `docs/learn/fundamentals/stellar-stack.mdx:22`, `docs/validators/README.mdx:10`, and both rendered pages | present |
| The sampled intervals are about five seconds after Protocol 28 | C | `https://horizon.stellar.org/ledgers?order=desc&limit=200`, 18:55Z | ledgers 64718827–64719026, Protocol 29, 5 s × 199 |
| The cadence changed at the Protocol 28 ledger | C | `https://horizon.stellar.org/ledgers?cursor=276846917520982016&limit=200`, `order=desc` and `order=asc` | ledgers 64458246–64458445 (Protocol 27): mean 5.553 s, 90 × 5 s, 108 × 6 s, 1 × 7 s; ledgers 64458447–64458646 (Protocol 28): 5 s × 199 |
| Rounded interval means stay near five seconds across Protocol 28 and Protocol 29 | C | the owner-judgment ledger's 15,000-ledger windows | each window mean rounds to 5.000 s since 2026-09-16T23:47Z; a rounded mean does not show that every interval is 5 s |
| The intervals are not all exactly five seconds | C | `https://horizon.stellar.org/ledgers/64458446` and `/64717645` | 259,199 intervals span 1,296,001 s; constant 5-second intervals span 1,295,995 s; the period contains 6 more seconds |
| The target is a setting, not a per-ledger guarantee | F | `stellar network settings --network mainnet` | `ledger_target_close_time_milliseconds 5000` |
| SDF states the Protocol 28 intent | A | `https://stellar.org/blog/developers/adapter-protocol-28-upgrade-guide` | "Protocol 28 introduces a new feature to make ledgers close faster and reduce close time variance." |
| Other Docs pages already say about 5 seconds | A | `grep` over `docs/` at the same commit | 27 files, for example `storage-strategies.mdx`: "today's ~5-second target close time" |
| No newer upstream cadence report exists | — | `gh search` on `stellar/stellar-docs` for "5-7 seconds" and "close time" | PR 2806 (merged 2026-09-08, closing issue 2805) set the current wording before Protocol 28 activated; issue 2883 cites issue 2805 as history only |

Calibration checks from the `improvements-pipeline` skill:

- Drift introduced versus observed: the sampled cadence changed at ledger 64458446 on 2026-09-16.
  PR 2806 set "5-7 seconds" eight days earlier, when samples had a 5.6-second mean.
- Repeated prose: only two pages carry the sentence. The recommendation covers both.
- Cause: the finding does not claim which Protocol 28 change caused the cadence.

Commands and results:

- `npm run improvements:index` — exit 0.
- `npm run improvements:lint` — exit 0, "improvements lint ok (66 findings)".
- `npm run improvements:probes -- --service stellar-docs` — "sd-054: recurring (status 200 == 200;
  contains "update the ledger every 5-7 seconds": true)".
- `npm run improvements:file -- --file improvements/stellar-docs/sd-054-ledger-cadence-5-7-seconds-stale-after-protocol-28.md --dry-run`
  — exit 0. It resolves `stellar/stellar-docs` through a new `improvements/intake.json` override
  and renders all five sections.

Golden side: `q-protocol-ledger-close-time` already accepts either figure when dated or attributed.
The lane did not change that case and added no canonical-page caution. ADR-0008 stays at three
cases.

### Generated files

- `npm run eval:qa:compile`: 501 cases. The lane report gives the final sha256.
- A parsed diff against `origin/main` shows exactly the seven edited cases.
- The register has no entry in `reopen` state.

### Review reconciliation

The independent blind review returned ACCEPT WITH FIXES. It accepted all seven case changes, kept
`q-comp-anchor-compliance-stack` in scope, and accepted all ten register reviews. The lane applied
its three findings.

1. Cadence claim (P2). `sd-054` said that a ledger closed every 5 seconds since Protocol 28. The
   cited endpoints disprove that exact statement: the period between the two upgrade ledgers
   contains 6 more seconds than constant 5-second intervals. The finding now says: "The sampled
   Mainnet intervals are about five seconds after Protocol 28. Both 199-delta post-upgrade samples
   contain five-second deltas." It labels the 15,000-ledger results as rounded interval means. It
   replaces the wrong-count claim with: "The wider range is less precise than the current
   observations. A five-second target gives readers a clearer estimate." It presents a precision
   update, not a demonstrated contradiction. It keeps the configurable target and the absence of a
   per-ledger guarantee explicit. It records that stellar/stellar-docs PR 2806 (merged 2026-09-08,
   closing issue 2805) set the current wording before Protocol 28 activated. The author confirmed
   "Closes #2805" in the PR body. The `.agents/TODO.md` item and the item 4 tables carry the same
   bounds.
2. Quote evidence (P3). "Recorded quote requests" under item 2 now keeps each request's
   parameters, headers, start time, status, and quote count, and the Solana control. The lane
   recovered them from its session record and made no new request. The recovery corrected a count:
   five Stellar requests returned zero quotes, not three. The bridge case's answer therefore states
   no request count, and its provenance carries the corrected count. Three control bridge labels
   are unrecoverable and are labeled so. The HTTP 429 stop condition and the uncertainty stay.
3. Register note (P3). The `cluster-122` note now reads "As of 2026-10-01, #45 is in Notification &
   Award Distribution." The note field is hand-owned, as the numeric invariant is, so the lane
   edited it directly and then ran the register helper and its check. The fixed SCF #43 result is
   unchanged.

The count correction changed the bridge case, so `cluster-037` reopened. A second review closed
it with the corrected wording. The register again has no entry in `reopen` state.

## Outcome

- Affected case IDs: `q-scf-current-round`, `q-edge-fresh-latest-scf-round`,
  `q-defi-bridge-evm-to-stellar-axelar`, `q-pay-anchor-msb-licensing`,
  `q-pay-travel-rule-aid-flows`, `q-comp-finclusive-caas`, `q-comp-anchor-compliance-stack`.
- New finding: `sd-054`, `verified`, not filed. It asks for a precision update. `.agents/TODO.md`
  carries the filing decision. Commit the finding before an authorized filing.
- Remaining uncertainty: no MetaMask route from Ethereum to Stellar was observed. The case says so.
- Independent review: complete, ACCEPT WITH FIXES; see "Review reconciliation".
- Retained evidence: this ledger. The seven case files and `sd-054` cite it.
