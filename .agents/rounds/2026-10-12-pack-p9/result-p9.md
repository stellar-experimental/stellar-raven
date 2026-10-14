# Result: pack p9 measurement

Date: 2026-10-13, 21:09Z to 21:22Z. Operator: Claude Opus 5.5 (lane J, high).
Plan: [measurement-plan-p9.md](measurement-plan-p9.md). Branch `w1012/j` (PR #272).
Data: [rejudge-artifacts-p9.json](rejudge-artifacts-p9.json) and
[rejudge-summary-p9.json](rejudge-summary-p9.json) (output of the predeclared
[analyze-rejudge-p9.mjs](analyze-rejudge-p9.mjs)).

## Proposed verdict

**ACCEPT (proposed).** The post-run independent review is still open. The orchestrator runs it.
This verdict is not final until that review is complete and every finding is reconciled.

- Stage 1 passes. Each changed Stage 1 row shows the list records that the replay shows.
  No new vote calls a shown record or span fabricated or absent. Blend TVL moves up.
- Stage 2 passes under R6. Three rows score lower. No lower score has an identified pack cause.
  Two are reused p8 panels that keep their p8 classification. The third is a new p9 panel; see below.
- The R8-1 row no longer blocks. Its new panel is `correct` (C C C). No lower score exists, so the
  R8-1 scope question does not arise.
- Stage 3 stands: 0 up, 6 same. No p9 row is in Stage 3. All six panels are reused p8 panels.
- No rationale cites `claimSupportNotice`. No rationale mentions an entry number.

## Authorization

The owner approved the spend on 2026-10-13 in chat: "approved for your next collection of work,
don't do stuff you don't need to, but do what's truely valuable and needful".
The orchestrator (Claude Opus 5.5, pane w3W:p1P) gave the lane brief. The brief authorizes the p9
plan once, at its own caps: total $8.55 (self-test $3.50, five invocations at the plan's file caps).
It gives no continuation, no re-run, and no raised cap.

## Reviewed commit

- The pre-spend review ([review-astra.md](review-astra.md), Codex `gpt-6-astra`, high) approved
  `59f5490a` (CODE: APPROVE, PLAN: LAUNCH-OK).
- Commit `7d00d61f` then changed one regex, `VERSION_ANCHOR_RE` in `eval/qa/evidence-pack.mjs`
  (a ReDoS fix).
- A bounded delta review, [review-delta-7d00d61f-astra.md](review-delta-7d00d61f-astra.md) (Codex
  `gpt-6-astra`, high), returned `DELTA: APPROVE`. It argues that the two expressions match the
  same language with the same match positions. It also checked 142,206 generated inputs.
  The Codex sandbox refused the write under `.agents`, so the lane copied the report from
  `/private/tmp/claude-501/w1013/` without a change.
- The lane ran `replay-p9.mjs` at `7d00d61f` and at `59f5490a`. The two outputs differ only in
  `revisions.p9`. All 64 p9 pack and prompt hashes in part B are identical.
- `REVIEWED` and `armBNew.commit` record `7d00d61fb0dda51a2b49e45bc12fb8faaf3dd070` (commit `a236d57c`).
  The detached arm worktree `/Users/kalepail/Desktop/raven-p9-arm` was at that commit for every call.

## Free preflight (2026-10-13)

| Check | Result |
|---|---|
| Binary pin, through `run-node.sh` | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`, version `2.1.296 (Claude Code)`; equal |
| Environment pin, through `run-node.sh` | `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac` (names `HOME`, `PATH`, `SHELL`, `TMPDIR`); equal |
| Replay (baseline verification) | equal to `replay-p9.json` apart from `revisions.p9` |
| Reading command, default | byte-identical to `rejudge-summary-p9-notrun.json`: `not-run`, 26 reused, 0 inconclusive |
| Reading command, `--stand-in p8` | byte-identical to `rejudge-summary-p9-standin.json`: all six changed rows INCONCLUSIVE |
| Static self-test in `raven-p9-arm` | GREEN, exit 0 |
| Dry runs, all five | exit 0; pack `p9`, rubric `v2.11`, `claude-sonnet-5`; `goldenTime.violations` empty; `wouldRefuse` false |
| Worktree-mode cases (P9-S1a, P9-S2b) | `55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f`; equal |

## Paid self-test

Artifact: `eval/qa/results/2026-10-13-pack-p9/2026-10-13T21-09-57-p9-selftest.json` in the main
checkout, SHA-256 `856dada8e02610ad65ef546f678fa9f41d048d14afedc2e125a7a0c0bb918449`.

7 of 7 grades match (expected C P W C C, not-C, not-C; actual C P W C C W W).
7 costs reported. No call over the $0.50 cap. Runner `7d00d61f`, clean. Total $0.2833.

## Costs

| Item | Calls | Cap | Spend | Max call |
|---|---|---|---|---|
| Self-test | 7 | $3.50 | $0.2833 | $0.0439 |
| P9-S1a | 3 | $0.85 | $0.2883 | $0.1035 |
| P9-S1b | 3 | $0.85 | $0.3769 | $0.1360 |
| P9-S2a | 6 | $1.65 | $0.6517 | $0.1320 |
| P9-S2b | 3 | $0.85 | $0.2817 | $0.1046 |
| P9-S2d | 3 | $0.85 | $0.1772 | $0.0641 |
| **Total** | **25** | **$8.55** | **$2.0591** | |

The plan expected about $2.06 to $2.15. No file reached its cap. No call cost more than $0.60.

## Artifacts

`re-judge.mjs` writes into the arm worktree. The lane copied each artifact to the main checkout's
ignored `eval/qa/results/2026-10-13-pack-p9/raven-p9-arm/` and checked the copy hash.
The manifest records the persistent copy, because the arm worktree is removed after the run.

| Invocation | Artifact | SHA-256 |
|---|---|---|
| P9-S1a | `2026-10-13T21-11-00-rejudge.json` | `df0bf2d2583f9bebeaa5ea69e77bedaa991a3af88dbb652149e971c1c44f30df` |
| P9-S1b | `2026-10-13T21-12-39-rejudge.json` | `c8139396f32d49eebf3d2a344b9ac07233e9c0ac9b56fb7bcfc7d5bd553f86dc` |
| P9-S2a | `2026-10-13T21-15-36-rejudge.json` | `cb096c96961ac81065f4800f6ff1caf5665d6b9b7419e2a095521aca8812b42c` |
| P9-S2b | `2026-10-13T21-19-52-rejudge.json` | `6c78748138dc621d1e5f12fe7166fceb79ae579370fd1564bdf221fa593fb79a` |
| P9-S2d | `2026-10-13T21-21-30-rejudge.json` | `b4e5502b351383cb9831ec5e2c772aa12eecd1b90372c4440b04fc8134bdf731` |

Each manifest entry has `arm: "B"` and `commit` in addition to `{invocation, path, sha256}`.
`inputs.mjs` needs `commit` to read the cases of the worktree-mode rows. Without it, the reading
command stops with "no cases commit for worktree mode".

## Method completeness

| Check | Result |
|---|---|
| Invocations | 5 of 5, status `successful`, postflight `passed`, pack `p9` |
| New judge calls | 18 of 18, every cost reported; maximum $0.1360 |
| Mechanical gate | 6 of 6 rows pass: rebuilt pack and prompt hashes equal the artifact; every call input hash equals the prompt; 3 graded votes |
| Replay agreement | every artifact pack and prompt hash equals the part-B p9 hash in `replay-p9.json` |
| Arm-A reuse | 32 of 32 rebuilt p6 packs and prompts equal the stored baseline |
| Arm-B reuse | 26 of 26 rebuilt p9 prompts equal the recorded p8 prompts |
| Error votes | 0 new. The reused S3c p8 panel keeps its one error vote |
| Stop rules | none fired |
| Inconclusive rows | 0 |

## Per-row panels

Order: correct > partial > wrong. `p8-reused` panels are the p8 run verdicts of identical inputs.

| Stage | Inv. | Row | Arm A (p6, reused) | Arm B | Arm-B source | Move |
|---|---|---|---|---|---|---|
| 1 | S1a | `q-defi-etherfuse-stablebonds` | partial (P P P) | partial (P P P) | p9-new | same |
| 1 | S1b | `q-edge-fresh-latest-blend-tvl` | wrong (W P W) | correct (W C C) | p9-new | up |
| 1 | S1b | `q-sor-deploy-invoke-from-js-sdk` | wrong (W W W) | wrong (P W W) | p8-reused | same |
| 1 | S1b | `q-ti-rpc-gettransactions-pagination-xdr` | partial (P W P) | wrong (W W W) | p8-reused | down |
| 1 | S1c | `q-hist-quantum-preparedness-plan` | wrong (W W P) | wrong (W W W) | p8-reused | same |
| 1 | S1c | `q-soroban-oz-upgradeable-macro` | wrong (W W W) | wrong (W W W) | p8-reused | same |
| 2 | S2a | `q-aas-list-token-on-exchanges-aggregators` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-asset-stablecoin-issuers-discovery` | correct (C C C) | correct (C C C) | p9-new | same |
| 2 | S2a | `q-comp-cross-moneygram-partnership-sep24` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-defi-arbitrage-pathpayment-bots` | correct (C C P) | correct (C C C) | p9-new | same |
| 2 | S2a | `q-eco-pyusd-stellar-freshness` | correct (C C C) | correct (C C P) | p8-reused | same |
| 2 | S2a | `q-edge-fresh-latest-scf-round` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-mpp-discovery-and-modes` | correct (P C C) | correct (P C C) | p8-reused | same |
| 2 | S2a | `q-raph-remove-scam-token` | correct (C W C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-scf-funding-by-category` | correct (C C C) | partial (P P C) | p8-reused | down |
| 2 | S2a | `q-sep-43-web-wallet-api` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-sor-cross-warmancer-zk-stack` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2a | `q-soroban-contract-build-verification` | correct (P C C) | correct (C C P) | p8-reused | same |
| 2 | S2a | `q-ti-vocab-content-tags-live` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2b | `q-agent-identity-erc8004-stellar` | partial (P P P) | partial (P C P) | p9-new | same |
| 2 | S2b | `q-protocol-27-cap-0071` | correct (C C C) | correct (C C C) | p8-reused | same |
| 2 | S2b | `q-soroban-token-transfer-pattern` | correct (P C C) | correct (C C C) | p8-reused | same |
| 2 | S2c | `q-hist-quantum-preparedness-plan` | correct (C C C) | partial (P P C) | p8-reused | down |
| 2 | S2c | `q-raph-withdraw-exchange-self-custody` | correct (C C P) | correct (C C C) | p8-reused | same |
| 2 | S2d | `q-gap-leaderboard-project-not-builder` | correct (C C P) | partial (C P P) | p9-new | down |
| 2 | S2e | `q-pc-quantum-preparedness-dormant` | wrong (W W W) | partial (P P P) | p8-reused | up |
| 3 | S3a | `q-defi-bridge-evm-to-stellar-axelar` | partial (P W P) | partial (W P P) | p8-reused | same |
| 3 | S3b | `q-ti-freighter-localhost-not-detected` | wrong (W W W) | wrong (W W W) | p8-reused | same |
| 3 | S3c | `q-sor-force-fast-archival-localnet` | partial (P P P) | partial (P error P) | p8-reused | same |
| 3 | S3d | `q-scf-verified-members` | wrong (W W W) | wrong (W W W) | p8-reused | same |
| 3 | S3d | `q-soroban-sdk-cve` | partial (P P P) | partial (P P P) | p8-reused | same |
| 3 | S3d | `q-tool-sdk-repos-discovery` | partial (P W P) | partial (P P P) | p8-reused | same |

Totals: Stage 1 has 1 up, 4 same, 1 down. Stage 2 has 1 up, 16 same, 3 down. Stage 3 has 0 up, 6 same.

## New p9 rows

I read all 18 new rationales. The hashes are the rebuilt p9 values; the artifacts record the same values.

| Row | p9 pack SHA-256 | p9 prompt SHA-256 | List records shown | Cost |
|---|---|---|---|---|
| `q-defi-etherfuse-stablebonds` | `cde2fab5…c47c55` | `901f0389…cd9fa` | 5 of 7 | $0.2883 |
| `q-edge-fresh-latest-blend-tvl` | `b4ddb9ae…9102b0` | `cfe0a6e4…067062` | 6 of 6 | $0.3769 |
| `q-asset-stablecoin-issuers-discovery` | `26b3dd98…f727e` | `57efd8ef…0ecd` | 41 of 42 | $0.3667 |
| `q-defi-arbitrage-pathpayment-bots` | `8f8ee18a…ec767` | `cdcce52f…19836` | 11 of 11 | $0.2850 |
| `q-agent-identity-erc8004-stellar` | `7bc0777f…d80` | `1a00fa43…b803` | 0 of 2 | $0.2817 |
| `q-gap-leaderboard-project-not-builder` | `a8160504…ab18` | `ef6e4fcb…2a82b4c4` | 2 of 2 | $0.1772 |

The full hashes are in [rejudge-summary-p9.json](rejudge-summary-p9.json).

- **Etherfuse (Stage 1, same, P P P).** The pack shows 5 of 7 list records, as the replay predicts.
  The 2 missing records lose claim fields to the 4-field limit; that gap is known.
  All three votes have no wrong claim and find no fabricated number.
  The held `partial` comes from omissions: the US-unavailability risk and the YieldBlox incident.
  Arm A held `partial` for the same omissions.
- **Blend TVL (Stage 1, up, W C C).** The pack shows 6 of 6 records. Votes 2 and 3 cite pack values
  (`tvlAsOf` 2026-10-05, DefiLlama, the $80M and $100.6M dated sources). Vote 1 grades `wrong`
  on avoid item 1: the answer's "+65%" trend joins figures from different providers. Its span
  check is `no-pack-omission`. It objects to the derived trend, not to a shown record.
  Votes 2 and 3 note the same cross-provider issue as a soft gap.
- **Stablecoin issuers (Stage 2, same, C C C).** The pack shows 41 of 42 records. The votes name
  up to 11 listed records (for example USDC, EURC, Circle, APSUSDM, EURMTL). They read the
  unconfirmed rows as unverified, not as fabricated.
- **R8-1 row, `q-defi-arbitrage-pathpayment-bots` (Stage 2, same, C C C).** The pack shows all
  11 entity-list records. The `dexProjects` span shows nine distinct DEX records with StellarTerm
  `Live` and Comet `Inactive`. No vote names a listed record. No vote names Comet or StellarTerm.
  No vote takes the broad reading, and no vote states the narrow reading. No vote cites avoid item 4.
  The R8-1 rule applies to a lower score; this row has none, so it does not block.
  This result shows that p9 removed the p8 regression on this row. It does not show that the
  judges resolved the sentence scope.
- **ERC-8004 (Stage 2, same, P C P).** The pack shows 0 of 2 detected list records; the plan
  accepts this known gap. The two `partial` votes cite one omission: the answer never says that a
  registry record is not proof of a payment. No vote cites missing support.
- **Leaderboard (Stage 2, down, C P P).** See the R6 review below.

## Stage 1 reading

Rule: each changed Stage 1 row shows the list records that the replay shows, and no new vote calls
a shown record or span fabricated or absent.

- Etherfuse shows 5 of 7 records; Blend shows 6 of 6. Both equal the replay.
- No new vote calls a shown record or span fabricated or absent.
- The reused RPC downgrade keeps its p8 classification, "mixed cause". Its votes object to an
  example that the transcript does not support. That is not a call against supported text.

**Stage 1: pass.**

## Stage 2 reading (R6)

Three Stage 2 rows score lower in arm B.

1. `q-scf-funding-by-category` (C C C to P P C): a reused p8 panel. It keeps "no identified pack cause".
2. `q-hist-quantum-preparedness-plan`, `2026-10-07T23-25-14` (C C C to P P C): a reused p8 panel.
   It keeps "no identified pack cause".
3. `q-gap-leaderboard-project-not-builder` (C C P to C P P): a new p9 panel. I reviewed it against
   the complete saved transcript and both packs.

R6 record for the leaderboard row:

- Candidate claim: none is disputed. Every vote in both arms has an empty wrong-claim list.
  The lower votes cite an omission. The answer never says that the leaderboard response also
  supplies an aggregate developer metrics block (key fact 1, second half).
- Source text: the saved execute call (entry 1) returned only `leaderboardSample` (from
  `lb.data.projects`), `leaderboardMeta` (from `lb.data.meta`), `buildersSample`, and `buildersMeta`.
  The execute return omitted the developer block; the saved model-visible result does not contain
  it. The saved transcript holds that projection, not the complete upstream response, so it does
  not show whether the upstream response held the block (review RJ-post-2). The word "developer"
  occurs in the transcript only in two search queries.
- Pack locations: neither the p6 pack nor the p9 pack shows a developer aggregate block. No pack
  could show it, because the transcript does not hold it. The p9 pack shows the leaderboard rows
  (`leaderboardSample`, entity-list span, Rumble Fish rank 1, Stellar Development Foundation rank 2),
  `leaderboardMeta.metricDefinitions`, and `buildersMeta.counts` (total 300). p6 showed raw snippets
  of the same result. AI-Net (rank 3) is a source item in both packs.
- Votes: arm A vote 1 calls the omission "trivial" (C). Arm A vote 3 grades `partial` for the same
  omission. Arm B vote 1 grades `correct`. Arm B votes 2 and 3 grade `partial` for the same omission.
  All six votes find no fabrication or contradiction.
- Qualifications: the answer states the core conclusion and names `getBuilders`. The transcript
  holds no competing support for the missing fact.
- Cause: p9 does not lose relevant support, change meaning, remove a qualifier, or misattribute a
  source. The judges weigh the same omission differently. The p7 and p8 runs show the same split
  on this row. So the change has no identified pack cause. It keeps the predeclared variance
  classification, without a statistical variance claim.

No lower score has an unresolved cause. The Stage 1 support rule and the Stage 3 rule are unchanged.

**Stage 2: pass under R6.**

## R8-1 reading

The new panel is `correct` (C C C); arm A is `correct` (C C P). There is no lower score.
The predeclared R8-1 conditions apply to a lower score, so none of them fires.
No vote names a listed record, so the reading command lists no named records for the three votes.
No vote rests on must-avoid item 4.
The honest prior in the plan said that this row could still block. It did not block in this run.

## Stage 3 reading

No p9 row is in Stage 3. All six panels are reused p8 panels: 0 up, 6 same, 0 down.
The p8 Stage 3 reading stands.

## Notices and entry numbers

No new rationale or wrong claim cites `claimSupportNotice`. No new rationale mentions an entry number.

## Reused versus new

- Arm A: 32 reused p6 panels from the p7 run (`d15a4ce5`). No call.
- Arm B: 26 reused p8 panels from the p8 run (`36e77d40`), 6 new p9 panels (18 calls).
- The p8 run as a whole stays BLOCKED, and the p8b continuation stays NOT ACCEPTED. Their verdicts
  are valid observations of identical inputs. This result reuses them under the plan's rule.

## Limits and open risks

- One panel of 3 per arm per row. No identical-input noise floor exists for panel 3 under `v2.11`.
- Arm A ran on 2026-10-10. The reused arm-B rows ran on 2026-10-10. The new p9 rows ran on 2026-10-13.
  The model, rubric, panel, binary, and environment pins are the same.
- Three measured rows have incomplete detected-list coverage: Etherfuse 5 of 7, stablecoin issuers
  41 of 42, and ERC-8004 0 of 2. The plan accepts these gaps.
- The control diagnostic still loses eight answer probes against p8 (278 against 270).
- The R8-1 sentence scope is still unresolved. The C C C panel does not resolve it.
- The cause attribution for each changed score is my reading of the rationales. The post-run
  independent review must check it.
- The manifest entries add `arm` and `commit` fields; see "Artifacts".
