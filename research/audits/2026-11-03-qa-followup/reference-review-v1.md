# Exact golden review

Reviewer: Grok lane `t9r`, session `01a1a1ad-6040-7f62-8b86-5a0238054c06`.
Reviewed at: 2026-11-03.
Paid model calls: 0.
Session spend stays inside the stated `0.x` USD amount.
The session stop remains `4.40` USD.
The helper allocation remains `45` USD.
This review edits no canonical file.
Old scores and saved answers stay untouched.

Blind comparison file: `tmp/2026-11-03-qa-followup/grok-blind-golden-matrix.json`.
Blind content SHA-256: `71613d857fce1aeacde402866fbfb2eb549424e3af4695e1df76c0b9357ddde0`.
Blind file SHA-256: `47bfe35cd53f9766810db8af42a378578fb0e09939d8d0054aedd0787826ae4a`.

## Decision

Hold both exact proposed file hashes.
Hold both exact proposed content hashes.
The before hashes match the current owned files.
Do not apply either proposal file.

## Hash identity

| Case | Hash | Value | Disk check | Decision |
|---|---|---|---|---|
| `q-edge-fresh-latest-protocol-version` | before file | `442c2eeeddcd8de6606479d1481dd37c94169613a68cb09398a3aaff7665dd7d` | match | current file only |
| `q-edge-fresh-latest-protocol-version` | before content | `951abcb0e4e29a8bed1ea49ac4cf6f771353a48f95c642e8d53dd760ea2da2d5` | match | current file only |
| `q-edge-fresh-latest-protocol-version` | proposed file | `353d62238703af7ae932581b235bc775d7614e235866d5255898541768670e24` | match | HOLD |
| `q-edge-fresh-latest-protocol-version` | proposed content | `6e0bcc4b747bc28c08ed4c2e939acc2e370e6e2ffe06624c0b7f8f2af63a3a8c` | match | HOLD |
| `q-edge-noinfo-stellar-pos-staking-rewards` | before file | `673d822b4a7ec68b10fd98dd9841b63e01cc86f6ce5cb38acffdf073605e0f72` | match | current file only |
| `q-edge-noinfo-stellar-pos-staking-rewards` | before content | `6b8cb779e2cf03bd99943338d6ef15ac7bd8726fe2e2ac2e1a2d2bd71998f16f` | match | current file only |
| `q-edge-noinfo-stellar-pos-staking-rewards` | proposed file | `cfcd4799dd6834d8f64c04702f2bc6c38608ec068c47062a04ada4e6999f8a88` | match | HOLD |
| `q-edge-noinfo-stellar-pos-staking-rewards` | proposed content | `7ca4cab687af9b8014babdee3e390c500840ca5775e9e2ae458d2f4924ade872` | match | HOLD |

Content hash means sorted canonical JSON with compact separators.
File hash means the raw file bytes.

## Blind comparison

The protocol question asks for the live Pubnet version.
The blind read requires a closed-ledger observation.
Dated documentation does not answer that question.
Supported protocol `30` is not the live ledger version.
Codex saw protocol `29` at ledger `65285576`.
That ledger closed at `2026-11-03T13:51:59Z`.
The blind read saw protocol `29` at ledger `65285622`.
That ledger closed at `2026-11-03T13:55:49Z`.
The two live reads agree.
Neither read changes the dated `2026-11-02` example.

The staking question asks for native protocol earnings and validator rewards.
The blind derivation says those rewards are none.
Stellar consensus is SCP/FBA, not proof of stake.
An LST search is not required for that question.
An LST search is required before an absence claim.
The Codex proposal uses the same boundary.
This review does not add a primary read.

## Protocol behavior

The current introduction accepts official documentation as the measurement.
Key fact 2 requires a dated live-network lookup.
The citation note also accepts a docs page or a release tag.
Those instructions conflict.
The proposal requires an identified live-network observation.
It keeps the dated Protocol 29 example.
It keeps the Protocol 28 avoid clause.
It keeps the requirement to report the live value.
A tool limitation does not complete that answer.
The new key fact separates docs, releases, and scheduled votes.
This change repairs valid ambiguity.
It does not concede the live-value requirement.
The exact proposed hash stays on hold.
The hold is for lifecycle and provenance, not for that behavior.

## Staking behavior

The current key facts require a third-party classification.
They also require a dated LST absence finding.
The question does not ask for that market survey.
Conditional checks match the blind contract.
The case tag is `fabrication-bait`.
Trap grading reads the golden answer, the details, and the notes.
Trap grading does not require every key fact as its own item.
The proposed answer text is unchanged.
That answer still says third-party products must disclose a source.
That answer still states the dated LST negative.
The new notes say a correct answer need not survey LST products.
The trap contract therefore stays ambiguous.
Conditional key facts do not finish the repair.
The proposal also says contract existence proves no yield mechanism.
That proof sentence is false.
Contract existence does not prove a yield result.
Hold this proposed hash for both defects.
Keep both current avoid clauses exact.
Keep the native SCP and no-reward requirement.
Do not drop the historical negative.
Do not make that negative mandatory for every answer.
This hold does not approve replacement answer bytes.

## Lifecycle

Both current cases use `state: active`.
Both current cases use `reviewState: none`.
Both proposals copy those values.
This review confirms a score-independent validity conflict in each case.
Quarantine is required before the next aggregate.
Do not leave either case at `active` and `none` after this confirmation.
Do not use trigger `judge-noise`.
That trigger cannot quarantine a case.
This review does not approve a quarantine file.
Any repaired file needs a new review of its hash.

## Required metadata

Set `truth.lifecycle.state` to `quarantined`.
Set `truth.lifecycle.reviewState` to `queued` or `in-review`.
Do not use `resolved` while the case remains quarantined.
Do not use `none` after this confirmation.
Add `truth.lifecycle.quarantine`.
Remove that object if the state is not `quarantined`.
Set `quarantine.startedOn` to `2026-11-03`.
Set `quarantine.reviewBy` from `2026-11-03` through `2026-12-03`.
Set `quarantine.author` to the Codex proposer.
Set `quarantine.reviewer` to this Grok lane.
The reviewer must differ from the author.
Write a score-independent `quarantine.cause`.
Do not use the words score, verdict, accuracy, aggregate, or headline.
Do not use `judge-noise`, pass rate, or desired movement.
Set `quarantine.ledger` to a ledger path that root owns.
Set `quarantine.evidence` to non-empty strings.
Include this review path in that evidence.
Include the blind matrix path in that evidence.
Do not cite a grade or an aggregate.

Add `truth.lifecycle.review` for `queued` or `in-review`.
Set `review.queuedOn` to a `YYYY-MM-DD` date.
Set `review.trigger` to `proposal-verification`.
Set `review.evidence` to non-empty strings.
For `in-review`, also set `review.startedOn`, `review.reviewer`, and `review.ledger`.

Set `truth.verified.by` to the completed independent review.
Do not say that independent review remains pending.
The current proposed `by` string fails that test.
A TODO root cause may remain.
The heading exists in `.agents/TODO.md`.
The anchor is `resolve-diagnostic-noncompletions-and-judge-ambiguities`.
Do not use a score-only root cause.
This cause is an authoring conflict.
Do not replace it with `freshness-drift`.
Keep `truth.asOf`, freshness, and `reverifyBy` unchanged.
Neither case has a source-sentinel entry.

For the staking repair, delete the false proof sentence.
Do not approve a substitute sentence in this review.
Make the market survey optional in the golden answer.
Keep the native no-reward behavior required there.
Keep the dated absence as optional background.
Do not renew the `2026-11-02` LST sweep.

## Sibling consistency

The sibling facts do not conflict with the intended repair.
`q-defi-liquid-staking-whitespace` still requires a dated LST result.
Its question asks which LST protocols are live.
`q-raph-xlm-staking` still separates third-party yield from native staking.
Its question asks about passive income and future plans.
`q-defi-build-staking-for-own-token` still separates application rewards from consensus.
`q-protocol-scp-consensus-algorithm` still separates SCP from proof of stake.
`q-hot-fee-pool-burn-deflation` does not call fees validator rewards.
`q-pc-protocol-upgrade-timing` still separates a vote from activation.
`q-protocol-version-history-list` still dates the historical protocol list.
`q-pc-protocol-27-zipper` still dates its Protocol 27 observation.
`q-tool-rust-soroban-sdk` still separates a release from network compatibility.
The sweep reports zero matches in four proposal files.
Those four files are not the two prospective cases.
That zero count does not prove a sibling result.
Root still regenerates the consistency register after application.
No application is approved here.

## Evidence durability

The protocol evidence lists live Horizon and RPC URLs.
It also lists the upgrade doc and `Upgrades.cpp`.
Those URLs can be re-walked.
Temporary report paths are not enough by themselves.
The historical activation rows remain in `truth.sources`.
The latest `truth.verified` event does not repeat every old row.
Git history keeps the prior event.
The staking evidence repeats the false contract-existence proof.
That row is not durable evidence.
The `2026-11-02` LST and fee-pool rows remain in the proposal.
This review does not treat them as a new sweep.
