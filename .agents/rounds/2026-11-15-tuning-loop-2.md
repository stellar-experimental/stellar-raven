# Round 2026-11-15: second tuning loop

Orchestrator: Claude Fable 5.2 (Mac, `hc`). Lanes run on the owner's Linux machine under the
owner's Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning
loops while weekly limits have headroom). No API-billed path. Worktree
`/home/tyler/code/raven-wt/loop2`, branch `tune/loop-2`, from `origin/main` at `0a603453` (loop 1
merged and deployed there).

## Scope

The owner approved this order on 2026-11-14:

1. Carry the corroboration guard for audit, incident and governance claims on a surface every
   client receives; measure it; then remove the source micro-map from the server instructions.
2. Land the `stellarOrg` source (PR 439, held). With the map in place it overflows Claude Code's
   4,096 characters by 594.
3. Seven search cards by default against five (caps audit M1).
4. Per-client delivery fixes from the client text-limits probe: the first line of the
   instructions and the first 120 characters of each tool description stand alone; `execute` is
   2,029 characters against Grok's 2,033 cut.
5. Agents that never call research on a named SEP or CAP (the routing gap loop 1's arm 2 cannot
   reach).

Plan: [PLAN.md](2026-11-15-tuning-loop-2/PLAN.md) (Claude Fable 5.2, lane `loop2-plan`). It is
not adopted until its review is reconciled and the orchestrator rules on its open questions Q1 to
Q7. No paid run is authorized by this file yet: each run gets its own authorization entry below
before launch. Loop 1's record is [the 2026-11-14 round](2026-11-14-baseline-tuning.md).

## Rules that bind every lane

- A general mechanism or the case stays red. No case id, question phrase or golden fragment in
  any product surface.
- Subscription spend on Claude models only. `sets.tuning` is the only part of the split a lane
  reads, and a script selects rows by tuning id before it reads any other field.
- Held-out and reserve rows are never opened. A held-out read is counts only, launched by the
  orchestrator with `eval/qa/heldout-read.sh`.
- Every run in a comparison uses the same judge-panel policy and stability register. A change
  counts only when its cause is traced in the transcript.

## Orchestrator ruling: routing rows that duplicate held-out questions

The owner agreed with the lean (2026-11-14). The 73 legacy and 26 extended routing rows that
duplicate held-out or reserve QA questions are off-limits for routing tuning. No lane reads their
per-row output; aggregate gate counts stay allowed. Their ids are not recorded anywhere.

## Lanes

| Lane | Model | Terminal | State | Output |
|---|---|---|---|---|
| `loop2-plan` | Claude Fable 5.2 | (finished) | Plan written | [PLAN.md](2026-11-15-tuning-loop-2/PLAN.md) |
| plan review | Claude Opus 5.5 | (finished) | Reviewed: launch after amendments | [PLAN-REVIEW.md](2026-11-15-tuning-loop-2/PLAN-REVIEW.md) |
| `loop2-impl` | Claude Sonnet 5.5 | `t1pk`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 1 free work done and review reconciled (R1 to R10); P1 ran, step 1 decided | [STEP-1-IMPL.md](2026-11-15-tuning-loop-2/STEP-1-IMPL.md) |
| `loop2-impl2` | Claude Sonnet 5.5 | `t1ps`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 2 free work done (items 4, 2, 3 and the scans); awaits the independent review, the A7 check and the P2 authorization | [STEP-2-IMPL.md](2026-11-15-tuning-loop-2/STEP-2-IMPL.md) |

## Ledger

### 2026-11-15: orchestrator rulings on the plan review

Direct instruction to the implementer (`loop2-impl`). The review file is the authoritative text;
the amendments are copied from it verbatim in [PLAN-AMENDMENTS.md](2026-11-15-tuning-loop-2/PLAN-AMENDMENTS.md).

- Amendments A1 to A10 in `PLAN-REVIEW.md` are all adopted.
- Q1 is decided as amendment A2: the primary record a result returned counts as support; a
  party's statement about itself does not.
- Q2 to Q7 are decided as the reviewer answers them (Q2 ship seven cards inside P2; Q3 item 5 may
  run, with A6; Q4 the 58-row panel and repeat passes; Q5 required before P2, as A7; Q6 do not
  re-home the "not for" guidance now; Q7 keep the order, and report each run's research-call share
  on the 17 identifier rows).
- No paid run is authorized by these rulings. The implementer does the free work for step 1 only.
- Implementer reading, to be confirmed by the orchestrator: A10 adopted means P2's two extra
  passes over the 12 source rows are cut (P2 becomes one pass over the 58 rows plus nothing
  else), so the plan's "three passes" paired check on the source rows and its gain figure are
  dropped. P1's guard-row passes and R's passes stay, as A10 says.

### 2026-11-15: step 1, free work (no paid run)

[STEP-1-IMPL.md](2026-11-15-tuning-loop-2/STEP-1-IMPL.md). Code tip `0a343e3f` (the guard `b8ea957d`, then the map removal alone, which reverts
alone). The amended panel is 58 rows and the scan reproduces the plan's counts. The guard rows are 10 by the amended claim words (the plan's 8
plus two); the stored with-map reference is 1 violation in 29 exposed answers (1 in 24 by the plan's list), no map 1 in 9 (1 in 8), class 3 bare
0 in both. All gates 0 on every tip. **No paid run is authorized by this entry.** Open for the orchestrator: the guard-row count (10 or 8), the A10
reading, and the independent review of the diff before P0 and P1.

## Step 1 free work, and P0

Implementer report: `2026-11-15-tuning-loop-2/STEP-1-IMPL.md` (guard `b8ea957d`, map removal
`0a343e3f`, each reverting alone; all gates exit 0).

Orchestrator rulings on its asks (Claude Fable 5.2, 2026-11-15): the guard commit preceding the
answer-reading scans is accepted, and the disclosed structure peek (one stored answer with no
claim, two result excerpts, before the wording commit; wording unchanged) is recorded here as a
deviation; the guard rows are the 10 that amendment A3's rule selects, not the plan's 8; amendment
A10 is read as cutting P2's extra passes over the source rows.

**Authorization, P0.** One collection of the 58-row panel on `origin/main` at `0a603453` (the
deployed loop 1 surface), Claude Sonnet 5.5 answering, pinned judge, `--max-panel-cases 58`,
`--max-budget-usd 14.5`. Subscription spend under the owner approval of 2026-11-14 and the loop 2
go-ahead of 2026-11-15. No resume, no re-judge. P1 is authorized separately after the independent
review of the step 1 diffs.

### 2026-11-15: step 1 review reconciled (R1 to R10)

Review: [STEP-1-REVIEW.md](2026-11-15-tuning-loop-2/STEP-1-REVIEW.md) (Claude Opus 5.5, tier Claude Opus, the stable fallback; its reasons for
skipping a matched tier are in its header). Orchestrator direct instruction: adopt blocking findings R1, R2 and R3 and the non-blocking findings as
written. The implementer (`loop2-impl`, Claude Sonnet 5.5) applied them; details in `STEP-1-IMPL.md` section 8. The guard wording, `b8ea957d` and
`0a343e3f` are unchanged (the Worker diff against `0a343e3f` is empty). No paid run is authorized by this entry.

- **R1, the read rubric.** A violation is a statement of the four kinds that is (a) bare, with support class 3, 4 or 5, or (b) attributed or hedged
  to a named source or record that no result returned (class 5), reported in its own column "unreturned attribution". A source-scoped absence
  statement about a source that was searched is not (b). Code (`eval/qa/corroboration-rubric.mjs`), brief, fixtures (a ninth: an attribution to a
  roundup no result returned) and tests changed. The five class 5 rows were re-read from uncut results: all three first-read fabrications were
  truncation artifacts, and the two agent-identity absence claims are source-scoped hedges. **Re-tally:** with map, no guard, 1 violation in 29
  answers (66 statements); no map, no guard, 1 in 9 (21 statements); class 3 bare 0 and unreturned attribution 0 in both. P0 and P1 are read with
  this rubric.
- **R2, one judge policy.** The plan's `--max-panel-cases 100` is **superseded**. P1 passes the value that P0's results file records
  (`meta.judgeTiering.maxPanelCases`, expected 58) on all three calls, the guard-row passes included, and stops if it is not 58. Recorded
  beside it: the P0-against-arm-1 null pairs a cap of 58 with a cap of 50. Both are at or above the run size, so no row is skipped and no verdict
  differs. The corrected command is in `STEP-1-IMPL.md` section 8.
- **R3, the denominator.** A3's violation rule (P1's count at most the P0 rate on the same read times P1's count, rounded up, plus one) applies to
  **P1 pass 1 only**, the same 58 rows as P0. The two repeat passes over the 10 guard rows are reported per row against those rows' P0 samples and
  feed the over-hedging trace (H1, H2) and the "Guard delivered" row.
- **R4.** The A3 and A6 blocks in `PLAN-AMENDMENTS.md` now hold their full review ranges (172 to 190, 239 to 248).
- **R5 to R8, R10: constraints recorded, no code change.** R5: build-stage runs with a candidate-lane call carry no guard; do not change before P1,
  and the P1 read covers `q-nft-vault-contract-standards` (the fix, if it shows a violation, is the guard line after the PRIOR-ART block when
  `candidateEvidence > 0`). R6: license table, Grok CLI column, "the guard on results under 20,000 bytes only". R7: the map removal ships only with
  item 4's `search` opening (A5), or it reverts. R8: `stellarOrg` in `CORROBORATING_FAMILIES` is a step 2 review decision (SDF's own posts would
  become official by data), not a one-line change. R10: `b8ea957d`'s message overstates "frozen before any stored answer was read"; deviation 2 in
  `STEP-1-IMPL.md` is the accurate record.
- **R9, not applied.** Optional. Adding `attack`, `drain(ed)`, `compromis*`, `stolen` and `theft` would change the guard-row set and the stored
  reference sample after both were fixed. The orchestrator may order it before the P0 read starts, applied to both arms.
- **Read protocol (review section 9).** One reader model and one brief for P0 and P1, interleaved packets, every violation and every unreturned
  attribution to a second reader. The guard sentence shows in P1 transcripts, so the reader is not blind.
- **Ordering.** P1 does not check out in `gca-eval` until the P0 lane (`loop2-run`, server `p0-server`) has finished and released that worktree.
  The orchestrator owns the ordering and P1's authorization line.

## P0 result, and P1

**P0.** Stamp `2026-11-15T04-31-41-variantA`, `main` at `0a603453`, 58 of 58, USD 11.81 (P0.md on
`tune/loop-2-runs`). 25 correct, 32 partial, 1 wrong. Same-surface movement against the stored
loop 1 arm 1 run on the 46 comparable shared rows: 6 flips, net 2 down, none on tier-matched rows.
Governance and attribution read (R1 rubric, uncut results): 1 violation in 23 claim-word answers;
unreturned attribution 0. Traps 5 of 6; the one failure is an agent failure on content with the
trap behaviour intact.

**T fixed before P1 (Claude Fable 5.2, 2026-11-15): T = 5.** The measured flip rate is 0.13 (T
would be 4); the repository's earlier pairwise rate is 0.16 (T = 5); loop 1's mixed-tier pair gave
0.34 (T = 7). 5 is the middle value and errs against charging noise to the change. It is a
judgment between two measured rates, not a measurement.

**Step 1 diff review.** STEP-1-REVIEW.md (Claude Opus 5.5): guard `b8ea957d` and map removal
`0a343e3f` fit to measure; R1 to R3 applied in `06b15651`.

**Authorization, P1.** The corrected command of STEP-1-IMPL.md section 8, on the map-removal tip
(product code of `0a343e3f`): the 58-row panel once and two more passes over the ten guard rows,
`--max-panel-cases` read from P0 (58), remote vector equal to P0's, `--max-budget-usd 19.5`. Cost
flags are read against P0, not against loop 1. No resume, no re-judge.

### 2026-11-15: P1 result, step 1 decided

Run record: `P1.md` on `origin/tune/loop-2-runs` (Claude Sonnet 5.5 run lane `loop2-run`; the file lives on that branch, not here).
Surface: this branch at `42a46274`, whose Worker is the map-removal commit `0a343e3f`. Stamps `2026-11-15T05-28-42-variantA` (58 rows), then
`05-38-45` and `05-45-31` (10 guard rows each). USD 16.10 of the 19.5 cap. T = 5.

Orchestrator direct instruction (2026-11-15): **step 1 is decided by rule. The guard and the map removal are both kept.**

- **Guard, kept.** Delivered on 35 of 35 block results (and on two standalone lines); 0 violations in 22 claim-word answers on pass 1 against a P0
  rate that gives a bound of 2 or 3; no traced over-hedging down; no cost flag. Caveat from the run lane, carried here: this is **not** read as the guard
  lowering violations. The reference is about 1 in 25, so "no rise" is the strongest result the rule can return, the readers' own calls varied as much
  as the margin (P0 1, 2, 1), and the guard rows still produced a bare absence-of-standard statement on a repeat pass with the guard in the result.
- **Map removal, kept, and only together with item 4's `search` opening.** All 58 rows: 8 flips, net +2 down (3 up, 5 down); tier-matched 44 rows: net
  +1; both under T = 5. Six of the eight flips changed judge tier. Required-service coverage in `npm run eval:plan` fell on 2 rows (58 to 56), under the
  3-row bar. The two downs with a possible map cause (`q-infra-which-indexer`, `q-nft-vault-contract-standards`) are untraced. It is "not shown harmful on
  Claude Code with Sonnet 5.5", not "harmless": up to about 4 net downs from losing the routing rules would hide under T. R7 therefore binds: the removal
  ships with the `search` opening that names every family (item 4, A5), or it reverts. OpenCode and Grok are not measured.
- Carried to step 2: the pointer gap on `q-nft-vault-contract-standards` is item 5's, and the research-call share on the 17 identifier rows was 25% (P0)
  and 29% (P1), under the 33% bar R0 sets.

### 2026-11-15: step 2, free work (no paid run)

Implementer `loop2-impl2` (Claude Sonnet 5.5, `t1ps`) under the direct instruction of the orchestrator; record: [STEP-2-IMPL.md](2026-11-15-tuning-loop-2/STEP-2-IMPL.md).
Commits, each reverting alone (section 1 there gives the order): item 4, the delivery text `0b07783a`; item 2, the `stellarOrg` source, a merge commit
`2796299c` (the map's source line and authority sentence dropped, not re-homed per Q6; one `detail` edge added; `eval/gates.json` re-stamped); item 3,
seven cards `160cd1fa`; the step 2 scans `b3709f74`; live checks and a guard test `6523ee6e`. All seven gates exit 0 on every tip.

- **Lengths, assembled:** instructions 1,899 (`67a6bd0b…6c00`, unchanged); `search` 1,960 (73 under Grok's 2,033); `execute` 1,964 (69 under; 4 under on `main`). First lines: instructions 133; `search` 116;
  `execute` 115 (OpenCode lists 117). The `search` opening is generated from the manifest (A5), so R7 holds: the map removal ships with it.
- **Routing, 544 rows:** 0 grade changes, 0 top-1 changes, 8 top-five lists gain a `stellarOrg` operation (counts only). Off-golden 40: adapter recall 33/40 and 37/40; catalog reach at 5: 8/40 and 14/40.
- **Seven cards:** a default page is 8,889 bytes against 6,992 on average (max 16,839, none over Grok's clip); 0.11% to 0.14% of input tokens per question on P0 and P1.
- **Predicted intrusions** on stored queries: `q-protocol-tier1-requirements`, `q-soroban-reentrancy` and `q-ti-parse-raw-ledger-data` would see a `stellarOrg` card in place of a Docs or Lumenloop operation; P2 reads them.
- **Not run:** the client probe harness (it needs each client's model), the reachability record for the 12 source rows, anything on Cloudflare.

Open for the orchestrator: R8 (SDF site as a corroborating family: left out, so each `stellarOrg` result carries the guard line); whether the `detail` edge and its `part` nouns stay;
the independent review of the step 2 diff before P2; the A7 Cloudflare check (preview URLs are off in `wrangler.jsonc`); P2's authorization line. **No paid run is authorized by this entry.**

## Step 2 free work; amendment A7 satisfied

Implementer report: `2026-11-15-tuning-loop-2/STEP-2-IMPL.md` (item 4 `0b07783a`, the `stellarOrg`
source `2796299c`, seven cards `160cd1fa`; all gates exit 0).

**A7 (Worker egress to stellar.org), done by the orchestrator on 2026-11-15 without a preview
version.** `wrangler.jsonc` has `workers_dev: false` and no preview URLs, and an authenticated MCP
call on a preview would need OAuth. Instead a throwaway Worker (`raven-egress-probe`, account
"Ecosystem - Stellar", `workers.dev`) fetched `https://stellar.org/api/search?q=audit+bank&locale=en`
and `https://stellar.org/foundation/strategy` with the adapter's User-Agent. Three calls: HTTP 200
for both each time (JSON 1,798 bytes; HTML about 424,600 bytes), no `cf-mitigated` header. The
Worker was then deleted (its URL returns 404). It did not touch the production Worker. Limit: this
shows egress from the account's Workers, not the adapter's own code path, which the post-deploy
check covers.

Orchestrator rulings on the step 2 asks: the 12-row reachability record may run (the questions are
tuning rows from a public repository); whether `stellarOrg` belongs in `CORROBORATING_FAMILIES` and
whether the added detail edge and its nouns stay go to the independent reviewer.

### 2026-11-15: step 2 review, adopted by the orchestrator

Review: [STEP-2-REVIEW.md](2026-11-15-tuning-loop-2/STEP-2-REVIEW.md) (Claude Opus 5.5, high; tier Claude Opus, the stable fallback; Fable is the orchestrator and Codex frontier was not launched,
so the vendor-diverse attack on the adapter that `SORG-REVIEW.md` left open stays open). No model call, no spend. The orchestrator adopts all of it.

- **Verdict.** Item 4 (`0b07783a`), item 2 (`2796299c`) and item 3 (`160cd1fa`): fit to measure. Item 2's adapter, spec, adapter tests, `wrangler.jsonc` and `env.d.ts` are byte-identical to the
  reviewed branch tip `b81e7a03`; the fetch boundary is unchanged, and the merge adds no egress, secret or binding. Two fixes asked before P2, not blocking: S1 and S2, applied below.
- **Intrusion measurement (S3).** On the 58 panel questions asked as written, a `stellarOrg` operation enters the top five of **0**. At limit 7 it enters on one (`q-raph-official-help-sdf-cannot-recover`, a source row, rank 7,
  displacing `stellarDocs.search_asset_token_docs`). The cost is at the **page tail above the default**: at limit 10 a generic probe loses a non-SDF card on 3 of 25 non-SDF questions (for example the OpenZeppelin
  `develop-secure-contracts` skill on "soroban security best practices"), at the limit the agent uses three times in four. Three causes, not one: (1) the description's words ("Soroban Security Audit Bank",
  "security-audited") pass the lexical gate on Soroban security queries; (2) the id token `org` matches every query word that starts with "org" under the vendor scorer's prefix rule (no minimum length), which
  put `stellarOrg.get_page` at rank 1 for "organization" questions, and no description edit removes it; (3) gate fill: `search_site` passes the gate with a weak score (47) and fills the gated page, so a
  higher-scoring operation that fails the gate (`stellarDocs.search_soroban_contract_docs`, 111, on "soroban reentrancy security" at limit 8) loses its tier-2 backfill slot. Causes 2 and 3 are ranker
  properties; any new family can trigger them.
- **Decision: the description is measured as is in P2.** A reworded description (Audit Bank, audited projects) removes the non-SDF security displacement at limit 7 but cuts off-golden reach from 8 to 6 of 40
  (questions) and 14 to 13 (keywords), and SDF questions at limit 10 from 4 to 2 of 5. That moves cost between audit-category queries and tunes tokens against the scorer, so it is not made. P2 cannot see an
  effect this small (T = 5 on 58 rows); it checks for gross intrusions only. **Watch rows**, read from both transcripts whatever their verdict: `q-soroban-reentrancy`, `q-protocol-tier1-requirements`,
  `q-ti-parse-raw-ledger-data`; and every row whose P2 `search` page carries a `stellarOrg` card at a rank above a card that the row's P1 script called. Report the number of source-exposed rows outside the
  12, and the rank of each `stellarOrg` card. If P2 shows two traced displacements, the remedy is a ranker change, not a description edit or result text. Forward ranker changes (4-character minimum for the
  prefix rule; a gate-failed candidate that beats the page's weakest gated card keeps its slot) are for `.agents/TODO.md`, which the orchestrator owns.
- **R8, decided.** `stellarOrg` stays out of `CORROBORATING_FAMILIES`; no code change. Every `stellarOrg` result keeps the standalone guard line. The rule for the P2 claim read is in `eval/qa/claim-read-brief.md`
  and applies to every run read from now on (neither P0 nor P1 had a `stellarOrg` result, so no earlier call changes). P2's over-hedging check (H1, H2 on source-exposed rows) is the test of whether the
  guard line makes the agent hedge an SDF programme fact.
- **The `detail` edge and its `part` nouns: kept**, with S1.
- **S1, applied.** The `detail` sentence counts a call as a source only when at least one returned row carries every join key of the edge. The ledger records `detailReady` (the targets whose keys a row carried);
  an unchecked call is not narrowed, so the Docs pointer is byte-identical (a test pins it). A live keyless query had returned `OtterSec`: 8 audit rows, 1 partner row, no `path`.
- **S2, applied.** A site search that returns no rows at all is `soft-empty` with the retry hint; rows that came back and were all filtered out stay ok with `no-rows`. One adapter test for the empty case; the
  filtered case's existing test holds.
- **P2 reading rules (S5).** (a) **P2 compares each changed row with P0 as well as with P1 pass 1.** For every row that changed between P1 and P2, report the P0, P1 and P2 verdicts and judge tiers. A row whose
  P2 verdict equals its P0 verdict, after a P1 move that the P1 trace classed as noise (`q-hot-sdf-xlm-holdings-sales` up by retrieval variance; `q-asset-usdc-eurc-issuer` down by judge tier), is reported as "returned"
  and counts only if the P2 transcript traces it: a fact in a `stellarOrg` result for a gain, a displaced or wrong call for a harm. (b) 14 of 58 rows changed judge tier between P0 and P1, and 6 of the 8 flips
  were tier changes: read the tier-matched net first; a result that reaches T only on all rows is "no decision" (A4). (c) Source gain rests on 12 single samples (A10): report counts; it is not evidence that the
  source improves answers.
- **What a P2 result must not be read as:** evidence that the source improves answers; that it causes no displacement harm (S3's tail effect is below what P2 detects, and the panel holds one `org…` question);
  about seven cards' benefit (P2 has 0 or 1 seven-used rows); about delivery or answers on Codex, Grok, OpenCode, the Playground or claude.ai; that Worker egress works through the adapter's own code path (A7
  tested the account's Workers); a separation of the delivery text from item 2's always-on description text (A8).
- **Cap, for the orchestrator's word.** P2's `--max-budget-usd 14.5` is a 21% margin on P1 pass 1's measured USD 12.02. A cap stop voids the run with no resume. The plan's rate (USD 0.25 per case) gives 14.5 for
  58 rows. Kept at 14.5 only on the orchestrator's acceptance of that risk; a higher cap needs the orchestrator's word. **No paid run is authorized by this entry.**
- **Still open from the review.** The client probe harness on this tip (it calls models; plan section 6; its own authorization line); the vendor-diverse adapter attack.
