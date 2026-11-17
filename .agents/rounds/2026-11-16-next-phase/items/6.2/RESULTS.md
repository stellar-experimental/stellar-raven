# Item 6.2: answer A/B results (executor, Claude Sonnet 5.5, agentpc `t1vc`)

Pre-registration commit `4092901af4ee0308008b3696c358404d435ec951` (questions, rubric, scoring and
rule). Rule outcome, computed once by `blind.mjs --score`: **absorb** (no hold trigger; inconclusive
clause not triggered). Both second opinions agree (see "Second opinions"); the absorb commits are
in [EXEC.md](EXEC.md).

## Summary

- 60 of 60 runs answered (10 questions x 2 arms x 3 clients). No failure of any class, no retry, no
  resume, no cap stop. 30 of 30 pairs graded; 0 missing.
- FRESH wins 1, losses 0, ties 29. The one win is Fable on L2 (HOLD's answer was marked wrong for
  uncited figures). Rule pairs (18): losses 0, wins 1, net -1. Per client over 10 pairs: Fable net -1,
  Opus 0, Sonnet 0. No attributable FRESH loss (there were no FRESH losses).
- No fabrication marked on either arm (0 and 0). One answer was bad: HOLD Fable L2.
- Correct against partial, reported not counted: 6 pairs. FRESH graded higher on 4 (Sonnet L1, N3, F2,
  F4) and HOLD on 2 (Opus L1, Sonnet L2); Sonnet's HOLD was partial more often than its FRESH, which is
  within one-sample noise.
- Reach (mechanical, per arm over 30 runs): a `stellarDocs.*` operation was called in 28 runs and a
  reference path appeared in a tool result in 26, on both arms, with the same pattern in every pair
  (no pair reached a reference on one arm only). The two runs per arm with no Docs call are Sonnet L2
  and Sonnet F3; the four per arm with no reference path are the three L2 runs (no reference pages)
  and Sonnet F3.
- Cost (subscription-equivalent, as the CLI reports): USD 19.9 for 60 runs (Fable 6.37 + 6.31, Opus
  2.61 + 2.72, Sonnet 0.96 + 0.93), against the plan's USD 40 to 90 guess and USD 150 item cap.

## Probes and identity

| Check | HOLD arm | FRESH arm |
|---|---|---|
| Arm commit | `4092901af4ee0308008b3696c358404d435ec951` | `8c9241ccce32415f5702e6170eb1dec0e86705ce` (commit A: titles file and manifest only) |
| `serverInfo.sourceRevision`, start and end | equal to the arm commit, both times | equal to the arm commit, both times |
| `git show <rev>:catalog/manifest.json` SHA-256 | `4e7094be6c3a2e39462020910ec163ad4e88f07fa0af8ec712d6f13aad0635bb` | `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` |
| `git status --porcelain --untracked-files=all` at start and end | empty | empty |
| Docs probe (`execute` of `stellarDocs.search_docs`, start and end) | ok, 2 hits, both times | ok, 2 hits, both times |
| Window (UTC, 2026-11-17) | 19:44:20 to 19:49:45 | 19:50:15 to 19:57:30 |

- The arms do not straddle 00:00 UTC.
- The "Varial wallet" search probe returned the same top five on both arms
  (`stellarDocs.search_wallet_dapp_docs`, `lumenloop.search_directory`,
  `skills.lumenloop.stellar-integration-finder`, `skills.stellar-dev.dapp`,
  `skills.lumenloop.stellar-ecosystem-scout`) and the search text does not surface the word on either.
  It did not discriminate the arms, so identity rests on `sourceRevision`, the clean tree and the
  manifest SHA-256. The committed manifests do differ as the plan says (case-insensitive "varial": 0
  matches at the HOLD commit, 1 at commit A; the titles file 0 and 3).
- Commit A check (step 4): the refreshed `inventory/stellar-docs.json` was unchanged (`fetchedAt` kept).
  The new titles file equals the lead's `tmp/6.2-titles-fresh.json` by (path, title) pairs (982 each,
  0 differing). The rebuilt manifest equals `tmp/6.2-fresh-manifest.json` with `generatedAt` removed.
  So the routing comparison was not re-run; the lead's numbers stand.

## Runs per client and arm

| Client | Arm | Answered | Failures by class | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD |
|---|---|---|---|---|---|---|---|---|---|---|
| claude-fable-5-2 | hold | 10/10 | none | 57 | 67 | 108 | 33176 | 1655343 | 294378 | 6.37 |
| claude-fable-5-2 | fresh | 10/10 | none | 56 | 66 | 108 | 33683 | 1666695 | 289532 | 6.31 |
| claude-opus-5-5 | hold | 10/10 | none | 48 | 58 | 116 | 29775 | 1574304 | 212556 | 2.61 |
| claude-opus-5-5 | fresh | 10/10 | none | 50 | 60 | 118 | 29802 | 1667362 | 223801 | 2.72 |
| claude-sonnet-5-5 | hold | 10/10 | none | 38 | 48 | 94 | 18651 | 1176160 | 163273 | 0.96 |
| claude-sonnet-5-5 | fresh | 10/10 | none | 37 | 47 | 92 | 18238 | 1142063 | 157606 | 0.93 |

Harness: `ab-run.mjs`, requested model ids `claude-fable-5-2`, `claude-opus-5-5`, `claude-sonnet-5-5` at
default effort, one retry per run for transport failures only (none needed). The resolved model is not
recorded (`runAgent` does not return `modelUsage`); `claude --version` is in every record.

## Judges

Blind packets (opaque pair ids, shuffled, X/Y by `crypto.randomInt`, key in ignored
`tmp/6.2/blind-key.json`), each judge in a fresh `/tmp` directory holding only `packet.json`, `RUBRIC.md`
and `BRIEF.md`. Claude Opus 5.5 (`--model opus`, effort high) graded the 20 Sonnet and Fable pairs;
Claude Fable (`--model fable`, effort high) graded the 10 Opus pairs. Verdicts: `tmp/6.2/verdicts-opus.json`
and `tmp/6.2/verdicts-fable.json` (copied from the judge directories, un-blinded by the scorer only).

## Per-pair table

| Client | Q | Rule | Outcome | HOLD grade | FRESH grade | Attributable | Reach HOLD | Reach FRESH | Judge reason |
|---|---|---|---|---|---|---|---|---|---|
| claude-fable-5-2 | L1 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both match the data-products comparison, RPC retention (120960 ledgers), getLedgerEntries limits and Hubble state/_current tables in crypto_stellar_dbt. |
| claude-fable-5-2 | L2 | yes | win | wrong | correct | no | docs/- | docs/- | No-reference rule: X gives figures with no cited source (weekly-roundup $4.5B tokenized funds, SCF #45 $4.04M to 40 projects, Peridot 5x); Y's figures are all tied to cited directory/registry/article sources and its protocols resolve as Stellar projects. |
| claude-fable-5-2 | N1 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both match the claimable-balances guide: CAP-23, predicates, balance ID, reserves, clawback, trustline use case. |
| claude-fable-5-2 | N2 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both correctly give the 100-stroop minimum, inclusion fee formula, surge-pricing example and fee-bump note from the fees page. |
| claude-fable-5-2 | N3 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both correctly describe params, transactionData/minResourceFee/results/restorePreamble, assemble/prepareTransaction and CLI, matching the simulateTransaction reference. |
| claude-fable-5-2 | N4 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both accurately describe require_auth implementation details (invocation tree matching, nonce, __check_auth, account types) per the authorization docs. |
| claude-fable-5-2 | F1 | no | tie | correct | correct | no | docs/ref | docs/ref | Both match the Varial pages (formerly Freighter, @stellar/varial-sdk signTransaction flow); rename date, platforms and blog features are supported by cited directory/blog. |
| claude-fable-5-2 | F2 | no | tie | correct | correct | no | docs/ref | docs/ref | Both match the fee-sponsorship and fee-bump guides; OZ Relayer/Channels and Launchtube details are supported by the cited openzeppelin-relayer and smart-wallets pages. |
| claude-fable-5-2 | F3 | no | tie | correct | correct | no | docs/ref | docs/ref | Both cover seller middleware, facilitators and agent payment accurately; extra details (latestLedger+12, inclusionFeeStroops, payment-required header, x402-MCP status) are supported by cited skill/docs. |
| claude-fable-5-2 | F4 | no | tie | correct | correct | no | docs/ref | docs/ref | Both give both signer tables with correct keys/partition/clustering/columns and the bronze/silver/gold (19/22/9) catalog structure. |
| claude-opus-5-5 | L1 | yes | tie | correct | partial | no | docs/ref | docs/ref | Both give the right split (RPC for current state and ~7 days, Hubble for full history and analytics) with the comparison table as published; X's table names and batch_run_date advice match the queries page, while Y's example query filters history_transactions on source_account (the reference page uses account; the column comes from the cited data skill) and lumps *_current tables in with the SCD Type 2 valid_from/valid_to snapshots. |
| claude-opus-5-5 | L2 | yes | tie | correct | correct | no | docs/- | docs/- | No reference pages: both disclaim being an exhaustive multi-hour report, attribute their figures (TVL table matches the live Scout leaderboard exactly; SCF, supply and incident figures match Scout), name only protocols confirmable on the web (Y's 'Noter'/'Soxno' appear under those spellings on lumenloop.com's Meridian SCF pitch page, i.e. Noether/XOXNO), and cover all major DeFi sectors. |
| claude-opus-5-5 | N1 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both match the claimable-balances guide and list of operations: two-step create/claim, predicates, thresholds, base reserve per claimant, op_no_trust, full-amount clawback, no-trustline/anchor onboarding and time-bound/reclaim use cases, and the forever-on-ledger caution. |
| claude-opus-5-5 | N2 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both match the fees page: inclusion fee = operations x effective base fee, 100-stroop minimum, 1,000-operation classic ledger limit, surge-pricing example (2,3,4,4,5 XLM -> 3 XLM) and fee-bump payer; X's buildFeeBumpTransaction argument order matches the fee-bump guide. |
| claude-opus-5-5 | N3 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both describe simulateTransaction params, minResourceFee/transactionData/results, Protocol 23 restore behaviour, assembleTransaction/prepareTransaction and the CLI simulate paths in agreement with the RPC reference, simulation, deep-dive, fees and CLI pages. |
| claude-opus-5-5 | N4 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both state there is no msg.sender, the Address is passed as an argument and require_auth() makes the host verify that address authorized this exact contract/function/arguments (not a permission list), consistent with the authorization page and auth example; X adds the host's step-by-step checks verbatim-accurate, Y the four account types, and both snippets come from the cited contract-authorization guide. |
| claude-opus-5-5 | F1 | no | tie | correct | correct | no | docs/ref | docs/ref | Both identify Varial as the renamed Freighter extension and give the guide's flow (@stellar/varial-sdk, connect to Testnet, signTransaction returns an object with the signed XDR, freighter-api still works); extra details (Scout slug, edunode, SDF rebrand post, state-archival isConnected snippet, 11-wallet kit) check out on the cited pages. |
| claude-opus-5-5 | F2 | no | tie | correct | correct | no | docs/ref | docs/ref | Both reproduce the fee-sponsorship guide's three approaches (fee-bump, sponsored reserves, relayer), who signs, the contract-account limitation, the selection guidance and combinations, with fee-bump and OpenZeppelin Relayer/Channels/Launchtube details matching the fee-bump and relayer pages. |
| claude-opus-5-5 | F3 | no | tie | partial | partial | no | docs/ref | docs/ref | Both give the seller middleware, facilitator, payTo/trustline and wrapped-fetch agent flow correctly and every identifier is in the cited skill/CLI pages, but both say mainnet needs only .env changes (the seller-and-agent guide requires an RPC URL passed to the client's ExactStellarScheme) and both say there is no spending-limit layer while that guide documents spendControls. |
| claude-opus-5-5 | F4 | no | tie | correct | correct | no | docs/ref | docs/ref | Both name bronze account_signers and silver account_signers_current with the exact keys, partitioning and clustering from the reference pages, and describe the catalog as Data Model Diagram / Data Dictionary (bronze, silver, gold) / Data Lineage; X's column list is incomplete but disclosed and not asked for, Y's 19/22/9 item counts match the live page. |
| claude-sonnet-5-5 | L1 | yes | tie | partial | correct | no | docs/ref | docs/ref | X says SDF hosts only the Futurenet RPC (reference: testnet and futurenet) and lists the SDK helper getAccount as an RPC method; Y matches the RPC, Hubble and migration docs. |
| claude-sonnet-5-5 | L2 | yes | tie | correct | partial | no | -/- | -/- | Both disclaim exhaustiveness and cite the Stellarlight/Scout directory for figures; Y's takeaway that Blend is ~2.5x the listed DEX TVL is miscomputed (103.7M vs 54.3M is ~1.9x). |
| claude-sonnet-5-5 | N1 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both accurately summarize claimable balances and when to prefer them over direct payments per the reference guide. |
| claude-sonnet-5-5 | N2 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both match the fees page: base fee as per-op max bid, 100-stroop minimum, inclusion fee formula, July 2026 ledger limits, surge pricing. |
| claude-sonnet-5-5 | N3 | yes | tie | partial | correct | no | docs/ref | docs/ref | Both use simulateTransaction/CLI correctly; X never says where footprint/fee appear in the result or how to apply them before submitting, Y gives the simulate-apply-sign-submit workflow. |
| claude-sonnet-5-5 | N4 | yes | tie | correct | correct | no | docs/ref | docs/ref | Both correctly explain explicit Address + require_auth, what it binds to (contract, function, args), host-managed replay protection and when to call it. |
| claude-sonnet-5-5 | F1 | no | tie | correct | correct | no | docs/ref | docs/ref | Both correctly identify Varial (formerly Freighter) and the @stellar/varial-sdk signTransaction flow. |
| claude-sonnet-5-5 | F2 | no | tie | partial | correct | no | docs/ref | docs/ref | X matches the fee-sponsorship guide; Y attributes an 'EVM paymaster' equivalence to the docs that no doc page states, and says a relayer is required for any Soroban invocation (fee-bumps work for G-account Soroban txs). |
| claude-sonnet-5-5 | F3 | no | tie | correct | correct | no | -/- | -/- | Both faithfully reproduce the cited stellar-dev-skill x402 guide (facilitators, Express middleware, wrapFetchWithPaymentFromConfig, USDC SAC ids) consistent with the quickstart/seller guides. |
| claude-sonnet-5-5 | F4 | no | tie | partial | correct | no | docs/ref | docs/ref | Both name bronze account_signers and silver account_signers_current; X says the dictionary layers are bronze and silver and cannot describe Gold, although the reference lists bronze, silver and gold. |

## Rule outcome

- Rule pairs (18): FRESH losses 0, wins 1, net -1.
- claude-fable-5-2, 10 pairs: losses 0, wins 1, ties 9, net -1.
- claude-opus-5-5, 10 pairs: losses 0, wins 0, ties 10, net 0.
- claude-sonnet-5-5, 10 pairs: losses 0, wins 0, ties 10, net 0.
- Missing pairs: 0 of 30 (0 of 18 rule pairs). Unanswered runs: HOLD 0, FRESH 0.
- Inconclusive clause: not triggered.
- Hold triggers: none.
- **Outcome: absorb.**

## Second opinions

Claude Opus 5.5 and Claude Fable (separate children of the lead, high effort, read-only) each
re-derived all 30 outcomes from the key and the verdict files and matched this table. Both say
**absorb**: [SECOND-OPUS.md](SECOND-OPUS.md) and [SECOND-FABLE.md](SECOND-FABLE.md). Neither found a
scoring, blinding or arm-identity defect. Fable's sensitivity check: reversing Sonnet L2 and Opus L1
to FRESH losses still gives net +1 per client and over the rule pairs (absorb); a hold needs both
reversals and the one win voided.

## Limits

- **No detectable harm, not "FRESH is better".** One sample per cell, 29 of 30 pairs tie, and the one
  win rests on a strict reading of the L2 "uncited figure" clause. The F1 to F4 pairs written for the
  fresh vocabulary all tie. The correct-against-partial lean toward FRESH (4 to 2) is not a gain.
- **X/Y imbalance.** HOLD was X in 22 of 30 pairs (the code path `randomInt(2) === 1` is correct, so
  this is chance, about p 0.016 two-sided). If judges favour X this leans toward HOLD, against absorb,
  and it cannot produce a FRESH loss.
- **Rule 2(b) degenerate case.** When `R` is empty (HOLD reached no reference path through a
  `stellarDocs.*` call), any FRESH loss with no reference reach counts as attributable. It did not
  arise here (no FRESH loss at all; the scorer would flag it as `(R empty)`). `blind.mjs` is left as
  pre-registered; any reuse must fix it first.
- **Arm identity rests on `sourceRevision`, the clean tree and the manifest hashes.** The Varial
  search probe returned the same top five on both arms, so it did not separate them, and the run
  records do not keep `search` rankings.
- **The third lost row (a holdout row, known only by count) was not tested**; its slot went to a
  control by design. The A/B covers two of the three routing losses.
- **Only Claude clients were run**, as the owner asked. GPT-6.1 Terra and Grok 4.7 may lean on `search`
  ranking differently; this A/B says nothing about them.
- The clients mostly went on to `stellarDocs.search_docs`/`get_doc_page`, which read live Docs on both
  arms, so the title vocabulary reaches an answer only through `search` ranking.
