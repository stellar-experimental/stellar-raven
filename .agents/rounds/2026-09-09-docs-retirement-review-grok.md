# Docs retirement fact review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
This reviewer did not read the Sol ingestion matrix as evidence.
Original finding files, GitHub refs, live pages, current source, and production Raven searches were read directly.
No source, golden, generated, comment, commit, paid, operator-write, or deploy action occurred.
This file is the only write.

Checks: `2026-09-09T16:58:39Z` through `2026-09-09T17:01:48Z`.
This pass is fact review. Final cleanup review follows after golden edits.

## Verdict

All three original content defects are gone from live pages and from current `stellar/stellar-docs` `main`.
All three original production Raven search triggers no longer return the stale phrases.
Corrected positive records are present.

| Finding | Canonical / source | Original Raven search | Corrected positive search | Pipeline class |
|---|---|---|---|---|
| `sd-039` | **fixed** | **fixed** (`staleAliasHits: 0`) | both Tools hits distinguish Relayer vs managed Channels | original trigger **fixed** |
| `sd-042` | **fixed** | **fixed** (`staleDeprecatedHits: 0`) | EVM hit is `Horizon API (nearing end-of-life)` | original trigger **fixed** |
| `sd-047` | **fixed** | **fixed** (`every 3-5 seconds` absent in 20 hits) | Validators and Stack both return `every 5-7 seconds` | original trigger **fixed** |

Active findings already read `fixed-upstream` in the tree.
This lane independently confirms that status for the original triggers.
Do not drain in this pass.
Four golden cases still encode search-lag or alias cautions that the live surfaces no longer support.
Root will edit those goldens after the Sol matrix. A later pass inspects that diff.

## State table

| finding | trigger evidence | upstream ref | ref state | PR | live re-check | action |
|---|---|---|---|---|---|---|
| `sd-039` | alias "also known as Stellar Channels Service" on Tools pages | https://github.com/stellar/stellar-docs/issues/2707 | closed `completed` `2026-09-08T17:13:50Z` by `ElliotFriend` | #2723 merged `df8417ab` `2026-09-08T17:13:49Z` | pages + source + original search **fixed** | keep `fixed-upstream`; goldens still stale |
| `sd-042` | EVM "the deprecated Horizon API" vs four canonical EOL sentences | https://github.com/stellar/stellar-docs/issues/2770 | closed `completed` `2026-09-08T15:05:27Z` by `ElliotFriend` | #2806 merged `ad0accbd` `2026-09-08T15:05:25Z` | pages + source + original search **fixed** | keep `fixed-upstream`; goldens still stale |
| `sd-047` | Validators "every 3-5 seconds" vs Stack "every 5-7 seconds" | https://github.com/stellar/stellar-docs/issues/2805 | closed `completed` `2026-09-08T15:05:26Z` by `ElliotFriend` | #2806 merged `ad0accbd` | pages + source + original search **fixed** | keep `fixed-upstream`; goldens still stale |

Raven handoffs https://github.com/stellar-experimental/stellar-raven/issues/130 (`sd-042`) and https://github.com/stellar-experimental/stellar-raven/issues/132 (`sd-047`) remain **open**.
Comment authors: `kalepail` on #130/#132/`#2707` (Raven-side); `ElliotFriend` on #2770/#2805 (maintainer).
This lane posted no comment.

`stellar/stellar-docs` `main` HEAD at check: `db501fe9f2d8` `2026-09-08T23:05:42Z`.
Rendered `Last-Modified`: `Tue, 08 Sep 2026 23:09:07Z`–`23:09:27Z`.

## Original triggers (independent)

### sd-039

Original defect: Tools pages said OpenZeppelin Relayer is "also known as Stellar Channels Service" / managed infrastructure.

Live HTML `2026-09-09T16:58:40Z`:

- https://developers.stellar.org/docs/tools SHA-256 `37ada31ea18a0275ee9079055675ea33bb52007d30bd5ad9691cfd3062ed9c3a` — alias count 0.
- https://developers.stellar.org/docs/tools/openzeppelin-relayer SHA-256 `4c0e3689fbcdbb5238b7f0926606edfa1e847549d4f064b92137eda8c00877b9` — alias count 0.

Live quote, Tools index: "OpenZeppelin Relayer is an open source framework for submitting Stellar transactions. Its Channels plugin adds parallel submission and automatic fee bumping. You can run both yourself, or you can use Stellar Channels, the managed service OpenZeppelin operates on top of …"

Live quote, Relayer page: "OpenZeppelin Relayer is an open source (AGPL-3.0) framework … If you run your own instance, you control the signer and you fund the accounts that pay the fees. … Stellar Channels is the managed service OpenZeppelin operates on top of the Relayer and the Channels plugin."

Current source:

- `docs/tools/README.mdx` SHA-256 `ae286789c796ddafaf9f2036099ebb0bfb0129bd69c55e4a1f9656e85db08786` — alias 0.
- `docs/tools/openzeppelin-relayer.mdx` blob `8ef7a6f219393fb8495fecc848982e1f37d78a13` SHA-256 `b42c07752d393071b21c4dbb13ca88851d07d76df08d6b1fcf8725063c81d40f` — alias 0. Frontmatter: "OpenZeppelin Relayer is an open source framework … and Stellar Channels is the managed service OpenZeppelin runs on top of it."

Original Raven search `stellarDocs.search_sdk_cli_tools_docs({query:"managed Channels",hitsPerPage:15,includeContent:true})` at `2026-09-09T16:59:50.101Z`:

- `nbHits` 10. `staleAliasHits` 0.
- Hit 1 `/docs/tools/openzeppelin-relayer`: "Stellar **Channels** is the **managed** service OpenZeppelin operates on top"
- Hit 2 `/docs/tools#openzeppelin-relayer`: "You can run both yourself, or you can use Stellar **Channels**, the **managed** service"

Exact-phrase search `also known as Stellar Channels Service` returned 0 matching hits in the 12 returned Tools-index rows.

### sd-042

Original defect: EVM guide said "the deprecated Horizon API". Four canonical pages said "Horizon is nearing end-of-life and will eventually be deprecated".

Live HTML `2026-09-09T16:58:40Z`:

- EVM https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment — `deprecated Horizon API` 0; `Horizon API (nearing end-of-life)` 1.
- Stack, APIs, Lab explorer, Lab Horizon endpoint: `deprecated Horizon API` 0; canonical "nearing end-of-life" / "will eventually be deprecated" present.

Current source `docs/learn/migrate/evm/smart-contract-deployment.mdx` blob `c7b63187d38d9d368e7eadade08df45d88bff886` SHA-256 `829a5935335127dd358337d9b6e6085bc5ce0b53f156282e1f15b0674b2ca837`: `deprecated Horizon API` 0. L65: "as well as the Horizon API (nearing end-of-life)".

Stack source blob `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713` L40: "Horizon is nearing end-of-life and will eventually be deprecated …"

Original Raven search `stellarDocs.search_docs({query:"deprecated Horizon API stellar-sdk networking layer",hitsPerPage:10,includeContent:true})` at `16:59:50Z`:

- `staleDeprecatedHits` 0 in 10 returned hits.
- First hit is the EVM Soroban Client section with `Horizon API (nearing end-of-life)`.

Companion search `Horizon nearing end-of-life deprecated`: 4 hits, all the canonical hedged sentence, none with `deprecated Horizon API`.

Exact-phrase `the deprecated Horizon API`: 4 hits returned, 0 matched the phrase.

### sd-047

Original defect: Validators said "every 3-5 seconds". Stack said "every 5-7 seconds".

Live HTML:

- https://developers.stellar.org/docs/validators SHA-256 `a5b47c44bc1b8a9c7a15358b4953c2c24ba068876c1df2f727a96319fbffc987` — `every 3-5 seconds` 0; `every 5-7 seconds` 1.
- Stack SHA-256 `b78a8c111bc0f30231f01f9a35aeb05b70fa4114d003033587302d7105e1c73f` — `every 3-5 seconds` 0; `every 5-7 seconds` 1.

Quote (both pages): "Generally, nodes reach consensus, apply a transaction set, and update the ledger every 5-7 seconds."

Current source:

- `docs/validators/README.mdx` blob `f74c26290ba7653f584805bb3b02867b97aee3af` SHA-256 `5492877ee38f706187453f5274f7aed6f545100f062a59d3a851850ed9a24f48` — `every 3-5 seconds` 0; `every 5-7 seconds` 1.
- Stack blob `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713` — same 5-7 sentence.

Original Raven search `stellarDocs.search_docs({query:"3-5 seconds",hitsPerPage:10,includeContent:true})` at `16:59:50Z`: `stale35Hits` 0 in 10 hits. Validators root URL is not in those 10.

Follow-up at `17:00:53Z`, `hitsPerPage: 20`: `every35: []`, `validatorsRoot: []`.
Query `update the ledger every 3-5 seconds` returned Validators root without `every 3-5 seconds` in the 20-hit scan.

Corrected positive `stellarDocs.search_docs({query:"5-7 seconds",hitsPerPage:10,includeContent:true})`: `nbHits` 3. Hits 1 and 2 are Stack `#stellar-core` and `/docs/validators`, both `corrected57: true`.

Neighboring facts (not the original trigger, used for golden cadence):

- Horizon `https://horizon.stellar.org/ledgers?order=desc&limit=200` at `2026-09-09T16:59:49Z`: 199 deltas, sequences 64349845–64350044, protocol 27, min 5 s, max 7 s, median 6 s, mean 5.608 s, below-5 count 0.
- CAP-0070 `https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0070.md` SHA-256 `79c467e77ae6780715d7fd7d69d7d916aeb0fe0ef598037274193f66418c3353`: `ledgerTargetCloseTimeMilliseconds` initial 5000, range `[4000, 5000]`.
- `stellar-core` `master` `NetworkConfig.h` SHA-256 `2e354d9d85395cf9f7494854f1dd9e1c1d222135f0e56cdb5a5289f70c9febeb`: minimum struct 4000, maximum struct 5000, initial settings 5000.

## Residuals

1. Original extra recommendations not required for occurrence close: sd-039 comparison table and dated version claims; sd-042 shared lifecycle snippet; sd-047 CAP-0070 target wording. Do not stretch these findings.
2. Relayer page now links `https://status.channels.openzeppelin.com/`. Golden `q-ti-openzeppelin-relayer` still cites an inactive Statuspage from 2026-09-02. Separate from the alias defect.
3. Relayer version 1.8.0 vs rendered 1.5.x docs remains a dated product-docs mismatch in that golden, not `sd-039`.
4. Search `3-5 seconds` still returns many unrelated hits (retry waits, TTL copy). None of 20 returned the old Validators sentence.
5. Raven #130 and #132 stay open until retirement receipts.

## Four golden cases (current gospel vs live)

`rg` in `eval/qa/corpus` hits these four IDs. Root will edit after the Sol matrix. This pass records fact state only.

| Case | Finding link | Live fact | Gospel that is now stale | Keep |
|---|---|---|---|---|
| `q-ti-openzeppelin-relayer` | `sd-039` in `truth.verified.rootCause` | Tools pages distinguish Relayer vs managed Channels | `golden.notes` still says official Docs call Relayer "also known as Stellar Channels Service"; `truth.status: disputed` for that alias | Avoid "do not conflate" still true; version/health dating still needed |
| `q-infra-horizon-vs-rpc` | `sd-042` | EVM and canonical pages agree on nearing-EOL; original search no longer returns `deprecated Horizon API` | `truth.status: disputed` and class-E note that search still returns the pre-deploy clause (`observedAt` 2026-09-08) | Avoid "do not call Horizon already deprecated" still true; architecture split still true |
| `q-pc-practical-fee-setting` | `sd-042` | Same Horizon EOL agreement | `golden.notes` still says the daily index has one pre-deploy phrase under `sd-042` | Durable fee/RPC/`getFeeStats` facts; Hubble-as-analytics |
| `q-protocol-ledger-close-time` | `sd-047` | Both pages 5–7 s; search no longer returns Validators 3–5 s | Class-E note that production search still returned the pre-deploy snippet (`observedAt` 2026-09-08) | Avoid "3–5 seconds as an immutable guarantee"; observed 5–7 s; CAP-0070 target 5000 ms |

ADR-0008 canonical-page cautions expire when the finding is `fixed-upstream` **and** the live page no longer carries the wording. Both conditions hold for the alias and present-tense-deprecated clauses.

Do not edit goldens in this lane.

## Current-state references (cleanup list for later)

Do not clean up now.

When goldens are updated and a later reviewer drains:

- delete the three `improvements/stellar-docs/sd-039-*.md`, `sd-042-*.md`, `sd-047-*.md` files
- remove intake overrides `sd-039` and `sd-042` (`sd-047` has none)
- regenerate `improvements/INDEX.md`
- append `improvements/resolved.json`
- close Raven #130 and #132 after receipts
- close TODO `Retire the ingested sd-039, sd-042, and sd-047 fixes`
- keep historical round notes
- keep `sd-039` mention inside `sk-024` as a sibling-scope pointer until that skill finding is itself retired

## Safe action

Treat the original Docs content defects and the original Raven search triggers as independently **fixed**.
Leave findings at `fixed-upstream` until goldens drop the stale search-lag/alias cautions and a later reviewer runs resolver gates.
This pass does not drain, comment, or edit gospel.

---

# Pre-retirement author-diff review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort. Reviewer ≠ author and ≠ orchestrator.
Base: `9a3e1857b02870fc09d9469edf0a2917b807b8ed` on `maintenance/docs-ingestion-closeout`.
Working tree HEAD is that commit. This review reads the uncommitted author diff against that base.
Blind live verification in the first section of this file is the live-fact source. The Sol golden matrix was not used to derive facts.

This lane wrote only this append. No comment, deletion, golden edit, commit, paid call, or deploy occurred.

## Verdict

**PASS** for the fixed-record evidence commit.

Expired canonical-page cautions are gone from judge-facing notes.
Answer, keyFacts, and avoid are unchanged on all four cases.
No numeric, fee, cadence, or API fact changed.
Historical corroboration and unrelated `sd-003` / version / health disputes remain.
Generated `cases.json` / `sample.json` / lifecycle registry match the owned files.
The register is current: seven clusters plus the base-fee invariant, all `consistent`.
Finding records are `fixed-upstream` deletion candidates with historical evidence kept.
`rootCause` still points at the active finding paths. That is required until resolver deletion.

Do not comment, delete, or run the resolver in this commit.

## Scope vs `9a3e185`

Tracked files in the author diff:

| Path | Role |
|---|---|
| `eval/qa/corpus/battery/tooling-infra/q-ti-openzeppelin-relayer.json` | owned golden |
| `eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json` | owned golden |
| `eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json` | owned golden |
| `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json` | owned golden |
| `eval/qa/cases.json` | compiled 500; only those four IDs changed |
| `eval/qa/sample.json` | compiled 30; only `q-protocol-ledger-close-time` changed |
| `eval/qa/lifecycle-registry.json` | four `caseContentSha256` values only |
| `eval/qa/consistency-register.json` | seven clusters + `Stellar base fee floor` |
| `improvements/stellar-docs/sd-039-*.md` | `reported-upstream` → `fixed-upstream` plus 2026-09-09 crawl evidence |
| `improvements/stellar-docs/sd-042-*.md` | same |
| `improvements/stellar-docs/sd-047-*.md` | same |
| `improvements/INDEX.md` | generated; three rows now `fixed-upstream` |
| `.agents/rounds/2026-09-09-truth-maintenance.md` | root ledger |

No finding file was deleted. Intake overrides `sd-039` and `sd-042` remain. `sd-047` has none.

## Four goldens

Judge-facing equality vs `9a3e185`:

| Case | answer | keyFacts | avoid | notes | truth.status |
|---|---|---|---|---|---|
| `q-ti-openzeppelin-relayer` | equal | equal | equal | expired alias caution removed | stays `disputed` |
| `q-infra-horizon-vs-rpc` | equal | equal | equal | expired index partial-cap removed | `disputed` → `confirmed` |
| `q-pc-practical-fee-setting` | equal | equal | equal | expired `sd-042` index qualifier removed; `sd-003` partial-cap kept | stays `confirmed` |
| `q-protocol-ledger-close-time` | equal | equal | equal | equal | stays `confirmed` |

Relayer `asOf` `2026-09-02` and `reverifyBy` `2026-11-24` are unchanged.
Version 1.8.0 vs rendered 1.5.x and the inactive Statuspage rows are unchanged.
Horizon/RPC architecture, avoid "already deprecated", fee floor, surge, `getFeeStats`, Hubble, and 5–7 s cadence text are unchanged.

Each case adds one `confirmed-as-of` 2026-09-09 corroboration row with classes A, B, and E.
Those rows match this lane's earlier live quotes: Tools alias count 0, EVM `Horizon API (nearing end-of-life)`, Validators/Stack `every 5-7 seconds`, original search triggers empty.

Historical rows stay. Horizon/RPC still carries the dated 2026-09-08 `disputed` source/index row. Ledger-close still carries the 2026-08-31 `sd-047` 3–5 s evidence. That is preservation, not a current caution.

`truth.verified.rootCause` still names the active files:

- Relayer → `improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md`
- Horizon/RPC and fee-setting → `…/sd-042-horizon-deprecated-present-tense-regression.md`
- Cadence → `…/sd-047-validators-ledger-close-cadence-conflict.md`
- Fee-setting also keeps `…/sd-003-rpc-method-reference-pages-unindexed.md`

Provenance cites `.agents/rounds/2026-09-09-docs-ingestion-sol.md` and this file.
It does not wait on `.agents/rounds/2026-09-09-docs-golden-matrix-sol.md`.

ADR-0008 expiry holds: findings are `fixed-upstream`, and live pages no longer carry the alias or present-tense-deprecated wording.

## Generated artifacts

`eval/qa/cases.json`: 500 active cases. Changed IDs are exactly the four goldens. Owned `question` / `golden` / `truth` / `tags` / `surface` match the compiled rows.

`eval/qa/sample.json`: 30 cases. Only `q-protocol-ledger-close-time` changed, and it matches the owned file.

`eval/qa/lifecycle-registry.json`: 500 active / review `none`. Only the four `caseContentSha256` values changed. Canonical `contentSha256` matches the owned JSON.

## Consistency register

`npm run eval:qa:register -- --check` → `up to date`.

Changed entries, all `verdict: consistent`, `lastChecked: 2026-09-09`, hashes match raw case bytes:

| Entry | Members that changed | Standing note |
|---|---|---|
| `cluster-017` | fee-setting, cadence | unchanged numeric/reserve note |
| `cluster-018` | Horizon/RPC | current prefix: source/index conflict is fixed; dated 2026-07-11 dispute text kept after that prefix |
| `cluster-042` | fee-setting | unchanged |
| `cluster-056` | fee-setting | unchanged |
| `cluster-061` | Horizon/RPC, fee-setting | still `encode dispute; sd-017` |
| `cluster-063` | Horizon/RPC, fee-setting | still `Official Horizon lifecycle polarity is disputed.` |
| `cluster-065` | cadence | unchanged 5–7 s / max-tx note |
| numeric `Stellar base fee floor` | fee-setting | unchanged; sibling `q-edge-1xlm-activation-fee` hash unchanged |

`cluster-018` is the cluster whose current claim changed, and its note was updated.
`cluster-061` / `cluster-063` standing notes are stale labels. `reSwept` reasons are current. Member goldens do not contradict: both still reject complete Horizon/RPC replacement, keep the dated 100-stroop floor, and forbid calling Horizon already deprecated. Residual, not a commit blocker.

Sibling `q-ti-compute-token-lp-market-data` already uses nearing-end-of-life wording. Unchanged in this diff.

## Findings, INDEX, root ledger

All three findings: `status: fixed-upstream`. New 2026-09-09 evidence is prepended. Older bullets, recurrences, and the 2026-09-09 `kalepail` partial-search comments remain as history. Body now calls each record a deletion candidate pending retirement review. Recommendation no longer says keep the finding open while search reproduces.

`npm run improvements:lint` → `ok (70 findings)`. INDEX matches the generator. Count stays 70 because the files are not deleted.

Root ledger `.agents/rounds/2026-09-09-truth-maintenance.md` records the four IDs, expired-caution-only scope, preserved Relayer/`sd-003` disputes, register review, plan-regression SHA `71431f5ced6eacc68b05f9b141db6e901f2f08c5ce68f5ad43f4cc98033ea1de`, and lint 0/64. It does not claim deletion, resolver drain, or upstream comments for these three findings.

## Lint

`npm run eval:qa:lint -- --since 9a3e185` → **0 error(s), 64 warning(s)**.

New expected `[symmetric-caution]` warnings on `q-infra-horizon-vs-rpc` and `q-ti-openzeppelin-relayer` after the expired notes were removed.
`q-protocol-ledger-close-time` already had that warning; notes did not change.
`q-pc-practical-fee-setting` does not warn, because the `sd-003` partial-cap remains.
`q-protocol-bn254-poseidon-xray` is unrelated.
Do not restore an expired caution to silence those warnings.

## Cleanup still blocked until after this commit

Keep `rootCause` on the active paths until the resolver deletes the files, then switch those pointers to `improvements/resolved.json` entries and regenerate.

After this evidence commit, a later drain still needs:

- delete `improvements/stellar-docs/sd-039-*.md`, `sd-042-*.md`, `sd-047-*.md`
- remove intake overrides `sd-039` and `sd-042`
- regenerate `improvements/INDEX.md`
- append `improvements/resolved.json`
- post live-result comments, then close Raven #130 and #132
- close TODO `Retire the ingested sd-039, sd-042, and sd-047 fixes`
- keep `sd-039` inside `sk-024` until that skill finding retires
- keep historical round notes and research citations

This lane still posts no comment and deletes no record.

---

# Final-bytes gate after Sol matrix — Grok 4.6 high — 2026-09-09

Sol matrix now present: `.agents/rounds/2026-09-09-docs-golden-matrix-sol.md`.
This lane inspected current working-tree bytes against `9a3e185`.
It did not treat the matrix as a substitute for the byte check.
Finding records are already in `176513cc`. The golden package is still uncommitted.

## Verdict

**PASS.**

All four `golden.answer` values are byte-identical to `9a3e185`.
`golden.keyFacts` and `golden.avoid` are identical on all four cases.
`q-infra-horizon-vs-rpc` `truth.asOf` remains `2026-09-08`.
Its 2026-09-08 `disputed` corroboration row is JSON-identical to base.
The appended 2026-09-09 `confirmed-as-of` row records current A/B/E agreement only.
No numeric token in any answer changed. No old observation row was rewritten.

## Byte checks vs `9a3e185`

| Field | Relayer | Horizon/RPC | Fee | Cadence |
|---|---|---|---|---|
| `golden.answer` | identical | identical | identical | identical |
| `golden.keyFacts` | identical | identical | identical | identical |
| `golden.avoid` | identical | identical | identical | identical |
| `golden.notes` | expired alias caution removed | expired index partial-cap removed | expired `sd-042` index sentence removed; `sd-003` kept | identical |
| `truth.status` | stays `disputed` | `disputed` → `confirmed` | stays `confirmed` | stays `confirmed` |
| `truth.asOf` | stays `2026-09-02` | stays `2026-09-08` | none | none |
| `reverifyBy` | stays `2026-11-24` | none | none | none |
| prior corroboration rows | 4/4 exact | 2/2 exact | 1/1 exact | 4/4 exact |
| `truth.sources` | identical | identical | identical | Validators note only, provenance refresh |

Horizon answer still contains `2026-07-11` and `2026-09-08`.
Fee answer still contains `2026-07-10`, `100`, and `2026-09-08`.
Cadence answer still contains the `2026-07-10` 199-ledger sample (`5.839` / `6`) and CAP-0070.
Relayer answer still dates version and health to `2026-09-02`.

Owned-file SHA-256 values are unchanged from the prior Grok diff review:

- Relayer `1cbc12e9cfb05bd42865ebac7f6fa15cdce8356a6c5431117e0a6713d7b8945d`
- Horizon/RPC `ac50a0b0fca7863e7e5bae064f3d2961113f0e77e24b53f2f841578f62375f3f`
- Fee `b2b3add37716a621f8a813b058bdafa1455b6c3884b5ef41e1abb67263b84385`
- Cadence `b9accde040d46de223f08aebd18a5967659db045889337c1c44486929278c67d`

The Sol exact-notes patch was not applied. Root adopted the matrix’s narrower boundary: keep answers and historical rows, remove expired cautions, add dated current rows. That matches the landed bytes.

## Generated restamp and register

`eval/qa/cases.json` (500) changed only the four IDs. Compiled `golden`/`truth` match the owned files.
`eval/qa/sample.json` (30) changed only `q-protocol-ledger-close-time`.
Lifecycle `caseContentSha256` values match canonical JSON of those four files.

`npm run eval:qa:register -- --check` → `up to date`.
`npm run eval:qa:lint -- --since 9a3e185` → **0 error(s), 64 warning(s)**. Expected extra `symmetric-caution` warnings remain; do not restore expired cautions.

Cluster-061 and cluster-063 standing notes now state current source/index agreement. That clears the earlier non-blocking residual. Numeric and endpoint rules in those notes are unchanged.

## Residual, not a blocker

`rootCause` still names the active finding files. Keep that until resolver deletion.
Do not comment or delete in this golden commit.

---

# Final cleanup review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort. Reviewer ≠ author and ≠ orchestrator.
HEAD: `25d8d8f53858e3935af614fd2d1fd9ff180ff2b1`.
Working-tree cleanup is uncommitted against that golden package.
Total scope also compared to `9a3e1857b02870fc09d9469edf0a2917b807b8ed`.
Prior live-source and final-bytes PASSes in this file are reused. Live facts were not re-fetched.
Root runs full tests and live lint in parallel. This lane did not wait for them.

This append is the only write.

## Verdict

**PASS.**

The three resolver receipts pin public finding snapshots at `176513cc5e058fa12ad81f607ea4ca0d514a659a`.
GitHub blob SHAs match local `176513cc` blobs.
Active files and intake overrides are gone.
INDEX is 67 findings and contains no `sd-039` / `sd-042` / `sd-047` rows.
Four golden `rootCause` pointers name the resolved-ledger entries and that source commit.
All judge-facing bytes match the reviewed `25d8d8f` package.
Register hashes are current. The Docs retire TODO is gone. No unrelated TODO heading was lost.
Seven ledger comment URLs exist. Author is `kalepail`. Bodies pin the same snapshot.

## Snapshot receipts

Latest git commit that still contains each finding file is `176513cc`.
`176513cc` vs `25d8d8f` finding-file bytes are identical.

| ID | local blob at `176513cc` | GitHub `contents?ref=176513cc` sha | match |
|---|---|---|---|
| `sd-039` | `79e5c510f3953169c4406b81e9ad87423c0a0afe` | same | yes |
| `sd-042` | `5a0aff2c189fa24a06a6ebb53a1da51245fc03bb` | same | yes |
| `sd-047` | `c62008b53ff8cc6701434b0aaa4723bd08420bcc` | same | yes |

Receipts in `improvements/resolved.json` use `sourceCommit` `176513cc5e058fa12ad81f607ea4ca0d514a659a` and the matching `sourceUrl` blob paths.
`resolved` date is `2026-09-09`. Review evidence cites this report.

Working tree deletes the three active files. They still exist on `25d8d8f` HEAD, as expected before the cleanup commit.
`improvements/intake.json` no longer contains `sd-039` or `sd-042`. `sd-047` had no override.
`npm run improvements:lint` → `ok (67 findings)`.

`sk-024` now points at the `sd-039` receipt. That skill finding stays open.

## Goldens vs `25d8d8f`

`25d8d8f` owned-file SHA-256 values match the prior final-bytes PASS.
The cleanup diff changes only `truth.verified.rootCause` on the four cases:

- Relayer → `improvements/resolved.json entry sd-039; source commit 176513cc5e058fa12ad81f607ea4ca0d514a659a`
- Horizon/RPC and fee-setting → `… entry sd-042; source commit 176513cc…`
- Cadence → `… entry sd-047; source commit 176513cc…`
- Fee-setting keeps `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md`

`golden.answer`, `keyFacts`, `avoid`, `notes`, corroboration, sources, `asOf`, `reverifyBy`, and `truth.status` are identical to `25d8d8f`.

Compiled `cases.json` (500, content SHA-256 `631a03338681f8846866f5ee5e5830dacab4c8ed70611bfe0a08fa164c14aad7`) and `sample.json` (30) match the owned files.

## Register, TODO, historical refs

`npm run eval:qa:register -- --check` → `up to date`.
Seven clusters plus `Stellar base fee floor` stay `consistent` with current member hashes.

TODO: only `### Retire the ingested sd-039, sd-042, and sd-047 fixes` was removed (18 → 17 headings). No other heading added or dropped.

Remaining `sd-039` / `sd-042` / `sd-047` hits are receipts, golden notes, register history, dated corroboration, round notes, and research. Those stay historical. No live active finding path remains.

## Seven comments (`gh api` issue-comment readback)

All seven are `kalepail`. Each body contains the `176513cc5e058fa12ad81f607ea4ca0d514a659a` permalink.

| Finding | URL | Created |
|---|---|---|
| `sd-039` | https://github.com/stellar/stellar-docs/issues/2707#issuecomment-5606026404 | `2026-09-09T17:28:19Z` |
| `sd-039` | https://github.com/stellar/stellar-docs/pull/2723#issuecomment-5606026849 | `2026-09-09T17:28:21Z` |
| `sd-042` | https://github.com/stellar-experimental/stellar-raven/issues/130#issuecomment-5606027493 | `2026-09-09T17:28:24Z` |
| `sd-042` | https://github.com/stellar/stellar-docs/issues/2770#issuecomment-5606027983 | `2026-09-09T17:28:26Z` |
| `sd-042`/`sd-047` | https://github.com/stellar/stellar-docs/pull/2806#issuecomment-5606028449 | `2026-09-09T17:28:28Z` |
| `sd-047` | https://github.com/stellar-experimental/stellar-raven/issues/132#issuecomment-5606028913 | `2026-09-09T17:28:31Z` |
| `sd-047` | https://github.com/stellar/stellar-docs/issues/2805#issuecomment-5606029417 | `2026-09-09T17:28:33Z` |

Bodies report the live trigger result and the immutable finding blob. They were posted before resolver deletion.

`npm run eval:qa:lint -- --since 25d8d8f` → **0 error(s), 64 warning(s)**. Expected `symmetric-caution` warnings remain.

Non-blocking: Raven #130 and #132 stay open until this cleanup merges. Comment text still says retirement follows reference checks, because the comments preceded the resolver. This lane posted no comment and made no external write.
