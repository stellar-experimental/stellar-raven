# Round 2026-11-15: second tuning loop

Orchestrator: Claude Fable 5.2 (Mac, `hc`). Lanes run on the owner's Linux machine under the
owner's Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning
loops while weekly limits have headroom). No API-billed path. Worktree
`/home/tyler/code/raven-wt/loop2`, branch `tune/loop-2`, from `origin/main` at `0a603453` (loop 1
merged and deployed there).

This round's branches and the commits it cites are archived in the branch bundle
`~/backups/raven-next-phase/raven-branches-2026-11-16.bundle` (SHA-256
`15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7`); see
[DISPOSITION.md](2026-11-16-next-phase/items/0.3/DISPOSITION.md).

`P0.md`, `P1.md`, `P2.md` and `R.md` are in this round's folder on `main` since #447; entries below
that place them on `tune/loop-2-runs` were written before that merge.

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
| `loop2-run` | Claude Sonnet 5.5 | `t1pm`, parent `kalepail-c3614nvxph-mbp/t40f` | P0 collected and read; `gca-eval` released | [P0.md](2026-11-15-tuning-loop-2/P0.md) |
| `loop2-impl` | Claude Sonnet 5.5 | `t1pk`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 1 free work done and review reconciled (R1 to R10); P1 ran, step 1 decided | [STEP-1-IMPL.md](2026-11-15-tuning-loop-2/STEP-1-IMPL.md) |
| `loop2-impl2` | Claude Sonnet 5.5 | `t1ps`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 2 free work done (items 4, 2, 3 and the scans); reviewed, P2 ran, step 2 decided | [STEP-2-IMPL.md](2026-11-15-tuning-loop-2/STEP-2-IMPL.md) |
| `loop2-impl3` | Claude Sonnet 5.5 | `t1py`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 3 free work done (item 5, the identifier pointer, and its free checks); reviewed, R ran, step 3 decided: the pointer is not shipped | [STEP-3-IMPL.md](2026-11-15-tuning-loop-2/STEP-3-IMPL.md) |
| `loop2-kept` | Claude Sonnet 5.5 | `t1q5`, parent `kalepail-c3614nvxph-mbp/t40f` | R decided; the pointer removed and the kept set prepared (free work, no model call) | [KEPT-SET.md](2026-11-15-tuning-loop-2/KEPT-SET.md) |

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

### 2026-11-15: P1 collected and read (run lane `loop2-run`)

[P1.md](2026-11-15-tuning-loop-2/P1.md). Surface `dcc295de…` (instructions 1,899 characters), revision `42a46274` (Worker identical to `0a343e3f`), every pin equal, remote vector and `--max-panel-cases` 58 equal to P0's. 58 + 10 + 10 jobs, USD 16.10 of 19.5. Pass 1: 23 correct, 33 partial, 2 wrong.
Against P0 on 58 rows: 8 flips (3 up, 5 down), **net +2, tier-matched +1 (44 rows)**, T = 5; no row traced to the guard or the map removal (two untraced downs with a possible map cause). Guard delivered on 35 of 35 block results and every repeat-pass block. Governance read (R1 rubric, uncut):
P1 pass 1 **0 violations in 22 claim-word answers** against P0's 1 to 2 in 23 (bound 2 or 3); class 3 bare 0, unreturned attribution 0; passes 2 and 3 on the guard rows 2 and 1 contested violations, one confirmed by the second reader. No traced over-hedging. Required-service coverage 56 of 58 (P0 58 of 58). Cost, turns and tokens flat or lower. Trap review: 4 of 6 pass; the two fails are a judge-tier grade on a materially
identical answer (injection row) and the same agent failure as P0 (Soroswap row). Rules: keep the guard; keep the map removal as the rule gives it; recommendation: ship the removal only with item 4's `search` opening (R7). P1 server stopped, `gca-eval` released. No P2 was run.

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

### 2026-11-15: step 2 review reconciled; the adapter, scorer inputs and descriptions are frozen

Implementer `loop2-fix2` (Claude Sonnet 5.5), record: [STEP-2-IMPL.md](2026-11-15-tuning-loop-2/STEP-2-IMPL.md) section 10. S1, S2 and the R8 brief landed as one commit, **`bd9719fb`** (pushed before anything else ran).
All gates exit 0 on it, bare: typecheck, `npm test` (3,602 passed), build, smoke (144), the routing gate, the generated-artifacts sync and diff, the secrets scan. The off-golden 40 is unchanged (adapter 33/40 and 37/40;
reach 8/40 and 14/40 at 5, 8/40 and 16/40 at 7): neither S1 nor S2 moved a row. The surface pin `42ec6102…f17f` stands (local fingerprint identical on `bd9719fb` and `160cd1fa`); P2's code-identity commit is now `bd9719fb`.

**Reachability record, read-only, 12 source rows, from this workstation** (commit after `bd9719fb`): `search_site` on the question returns a cited page for 7 of 12; `get_page` returns text for a cited page on 12 of 12.
The five rows whose own search misses (`q-asset-usdc-eurc-issuer`, `q-comp-aml-analytics-vendors`, `q-data-network-metrics-sources`, `q-eco-stellar-rwa-stablecoin-volume`, `q-scf-ambassador-program`) are marked
unreachable by the question as written, per the plan's two-part test, and are not counted against the source (one sample; the orchestrator may loosen it). **After this read, the `stellarOrg` adapter, scorer inputs and
descriptions are frozen at `bd9719fb` for this loop.** **No paid run is authorized by this entry.**

## P2 authorization

Step 2 review reconciled in `bd9719fb` (frozen product commit; all gates exit 0). Reachability
record: `search_site` on the question returns a cited page for 7 of the 12 source rows; `get_page`
returns text for 12 of 12. The five rows whose own search misses stay marked
unreachable-by-question, as the plan's literal rule says; the orchestrator does not loosen it.

**Authorization, P2 (Claude Fable 5.2, 2026-11-15).** The final command of STEP-2-IMPL.md section
10 on `bd9719fb`: the 58-row panel once, `--max-panel-cases 58`, remote vector equal to P0's.
**Cap: `--max-budget-usd 17`**, raised from the plan's 14.5 before launch, because P1 pass 1 cost
USD 12.02 and this surface adds page reads; a cap stop would void the run, and 17 is a 41% margin.
Changed rows are compared with P0 as well as with P1 pass 1. No resume, no re-judge.

### 2026-11-15: P2 collected and read (run lane `loop2-run`)

[P2.md](2026-11-15-tuning-loop-2/P2.md) (on `tune/loop-2-runs`). Surface `42ec6102…` (instructions 1,899; `search` 1,960; `execute` 1,964), revision `bd9719fb`, every pin equal, remote vector and `--max-panel-cases` 58 equal to P0's. 58 jobs, USD 11.62 of 17, 40 min 39 s. 23 correct, 34 partial, 1 wrong.
Against P1: 9 flips (4 up, 5 down), **net +1, tier-matched -1** (37 rows); against P0 net +3, tier-matched +2; T = 5. **Traced ups and downs to the source, the search page or the description text: 0 and 0.** `stellarOrg` was called on 3 of 58 rows, all source rows (3 of 12), all calls ok, one answer used a fact from it; 0 intrusions as calls;
2 rows outside the 12 carried a card (`q-protocol-tier1-requirements`, `q-soroban-reentrancy`) and neither called it. Default-limit searches 14 of 62 (23%; P1 18%); explicit limits moved toward 10. Seven-used rows 1 (unchanged). Governance read (R1 and R8, uncut): **0 violations in 25 claim-word answers**; no claim rested on a `stellarOrg` result, so R8 is untested.
Required services 55 of 58 (P1 56, P0 58). Tokens +2.5% median against P1. Traps 6 of 6 pass. New `wrong`: `q-ti-enumerate-holders-airdrop`, traced to the agent's own query wording and a stricter tier. Rules: keep the source, keep item 4, keep seven cards. Server stopped, `gca-eval` released. Step 3 was not run.

### 2026-11-15: P2 result, step 2 decided

Run record: `P2.md` on `origin/tune/loop-2-runs` (Claude Sonnet 5.5 run lane `loop2-run`; the file lives on that branch, not here). Surface: `bd9719fb`. Stamp
`2026-11-15T07-33-40-variantA`, 58 of 58, USD 11.62 of the 17 cap, no stop event. 23 correct, 34 partial, 1 wrong (P1 pass 1: 23, 33, 2; P0: 25, 32, 1). T = 5.

Orchestrator direct instruction (2026-11-15): **step 2 is decided by rule. The `stellarOrg` source, item 4 (the description openings) and seven cards are all kept.**

- **Source, kept, and unproven.** The rule keeps it unless H1 or H2 fails on a source-exposed row or two unrelated rows go down by a traced displacement. None did: 0 traced
  displacements, 0 intrusions as calls (every `stellarOrg` call is on a source row), 2 rows outside the 12 carried a source card on their `search` page and neither called it.
  Caveats from the run lane, carried here: the source was **called on 3 of 58 rows** (3 of the 12 source rows); one answer used a fact from it (a dated balance table that no
  judged fact needed); **0 traced ups**. Nothing is read as shipped value, as a result about the guard line on `stellarOrg` results (no claim statement rests on one), as a
  result for Worker egress (A7 tested the account's Workers, not the adapter's own path from a deployed Worker), or as evidence that the source causes no displacement: S3's
  tail effect is below what T = 5 on 58 rows can see.
- **Item 4, kept.** The 40 rows in neither exposure set are net 0 against P1 (tier-matched -1, 26 rows) and +4 against P0 (tier-matched +3), all untraced, under T. P2
  cannot separate the delivery text from item 2's always-on description text (A8).
- **Seven cards, kept.** One seven-used row, unchanged and correct; median input tokens +2.5% against P1, -1.6% against P0. P2 says nothing about seven cards' benefit.
  Explicit limits moved to 10 (36 of 48 calls); no transcript ties that to a sentence.
- Both nets (P2 against P1 pass 1 +1, tier-matched -1; against P0 +3, tier-matched +2) are under T on all rows and on the tier-matched rows: no decision on harm, H3 does not
  trip. Required-service coverage 55 of 58 (P1 56, P0 58): the three misses are rows whose verdict did not move for coverage reasons. Zero violations in 25 claim-word answers.
  Research-call share on the 17 identifier rows: P0 25%, P1 29%, P2 23%; R0's bar stays above 33% and above the highest of these.
- Step 3 free work starts from this decision. No paid run is authorized by this entry.

### 2026-11-15: step 3, free work (no paid run)

[STEP-3-IMPL.md](2026-11-15-tuning-loop-2/STEP-3-IMPL.md). Implementer `loop2-impl3` (Claude Sonnet 5.5). Code commit **`a49ee918`** (one commit on top of the ledger entry above; reverts alone and returns the product paths to
`bd9719fb`); the sentence was frozen and pushed there before any stored answer, transcript or golden was read. It changes `execute` results only: the ordered top-five lists of all 495 routing cases are byte-identical, the
surface pin is P2's (`42ec6102…f17f`), and the new manifest field is not visible to `search`, `describe` or `codemode.catalog()`. `eval/gates.json` is re-baselined for the manifest fingerprint only.

The pointer reads the series from Scout's own `source` enum in the manifest (seven plain-letter values; no list), accepts only a hyphenated or joined token (A6), and fires once per identifier, at most three, when a call
names it and no call to the research operation does. **Replay over nine stored runs** (tuning rows by id first; scripts and result text only): it fires on 13 to 22 executes and 12 to 15 rows per run, almost all among the 17 identifier rows (the
committed rule reproduces the plan's 17 exactly), only for `sep` and `cap`, never where research for that identifier came earlier in the row (0 in 163 fires), never without a call that names the identifier. **Live, keyless:**
the call the sentence names returns an exact row for 22 of 22 distinct identifiers (the ceiling); a named identifier that does not exist returns none. Measured: one sentence is 175 to 181 characters (177 for `SEP-45`),
three at most 541, 2% of a median firing result. All gates exit 0 on the product commit and on the tip. **Open for the orchestrator:** the independent review of the diff before R; D1 (a series name joined to digits, `audit-2024`, fires:
the manifest cannot say which series are numbered); T for 17 rows (2, 3 or 4 by the three flip rates; 3 proposed); one incidental exposure of a failed-gate table (D7). **No paid run is authorized by this entry.**

### 2026-11-15: step 3 review reconciled; the pointer is frozen at `940dc013`

Review: [STEP-3-REVIEW.md](2026-11-15-tuning-loop-2/STEP-3-REVIEW.md) (Claude Opus 5.5, the stable Claude fallback for the matched Codex frontier tier; author Sonnet 5.5, orchestrator Fable 5.2). Verdict: fit to measure after two text fixes
to R's reading rules. Record: [STEP-3-IMPL.md](2026-11-15-tuning-loop-2/STEP-3-IMPL.md) section 11. Implementer `loop2-fix3` (Claude Sonnet 5.5).

**Rulings (orchestrator, direct instruction, all adopted).** B1: R0 measures the per-fire follow rate against the replay's per-fire baseline (7 of 163), with the row share reported beside it. B2: H3 per pass at
T = 3 (A4's rule at P0's 0.13 for n = 17; "T = 2" in the earlier text used the wrong convention), the pooled 34-row-pass net at T = 4; R1 needs one traced up pass and no contrary pass; H1 and H2 count a traced down in either pass.
D1: a series name joined to digits fires; A6's two sentences are superseded in `PLAN-AMENDMENTS.md` by the review's text, as a dated supersession (the old sentences stay). D2: accepted. F3 and F4: recorded only.

**Code, one commit: `940dc013`** (the frozen Worker commit; later commits are docs and data). F1: the joined token reads at most six digits. F2: a token whose letters are title case (`Sep-24`, `Cap-12`) is not an
identifier; all-upper and all-lower are. **F2 sits in the one shared module, so it also changes code deployed in loop 1: arm 2's exact-row matching.** `Sep-24` no longer fires the pointer and no longer marks `sep-0024`
exact; `SEP-24` and `sep-24` still do (unit cases for both hosts). One loop 1 unit case that pinned `Sep-43` as exact now says `SEP-43`. An all-upper month joined to digits (`10-SEP-2024`) still reads as an identifier; the review
chose that over a month list. Free replays, old and new code: **the 90 live research queries from loop 1 give byte-identical reports (90 of 90 ok, 17 with an exact row), and the nine-run step 3 replay gives byte-identical
reports: no stored output changes.** One difference that this change did not cause: the committed `replay-report.json` differs from the committed reader's own output in two `researchedWithIt` flags (arm 1 and P2, row
`q-comp-aml-analytics-vendors`), so two cells of the 17-row table move (arm 1 3 to 2, P2 2 to 1); R's counts should come from R's own transcripts (STEP-3-IMPL section 11).

`git revert 940dc013 a49ee918` (in that order) returns the product paths to `bd9719fb` (checked in a scratch worktree). **Open for the orchestrator:** the held-out QA read should be analysed by a lane other than `loop2-impl3`; a TODO item for the
fingerprint gate's failure message; the `eval/gates.json` note wording; the `live-drift-resolution` checklist line for `documentSeries`. **R is not authorized by this entry. No paid run is authorized.**

## R authorization (step 3)

Step 3 review reconciled; frozen Worker commit `940dc013` (the pointer `a49ee918` plus the digit
bound and the title-case rule; all gates exit 0). The title-case rule also changes loop 1's
exact-row matching, which is deployed: `Sep-24` no longer reads as SEP-24. Replays of the 90 live
research queries and of the nine stored runs are byte-identical before and after.

**Authorization, R (Claude Fable 5.2, 2026-11-15).** The final command of STEP-3-IMPL.md section
11 on `940dc013`: the 17 identifier rows, two passes, pins equal to P0's, `--max-panel-cases 58`,
`--max-budget-usd 8.5` in total. Keep rule as amended by B1 and B2; T = 3 per pass and 4 pooled.
Counts come from the R transcripts, not from the stored replay table (two of its cells are known
to differ from the reader's own output). No resume, no re-judge.

### 2026-11-15: R collected and read (run lane `loop2-run`)

[R.md](2026-11-15-tuning-loop-2/R.md) (on `tune/loop-2-runs`). Frozen Worker `940dc013`, surface `42ec6102…` (P2's), every pin equal, remote vector and `--max-panel-cases` 58 equal to P0's. The three live assertions held (sentence after a Docs call naming `SEP-45`; none after research; none for `Sep-24`). 17 rows twice, USD 7.05 of 8.5, 22 min of collection.
**Fired 42 times (23 and 19), followed 9 (21%; 22% and 21% by pass), 9 of 9 follows returned an exact row; baseline 7 of 163 (4%); the bar is above 33%: R0(b) not met, "inconclusive".** R0(a) met (the replay of R's own transcripts predicts the same executes; one execute differs in which three of five identifiers the cap kept). Row share by the committed definition 38%, 50%, pooled 44% (reported, not decided).
R1: 0 traced ups (the one verdict up has no pointer in its pass). H1 to H3 met: nets -1 and +2 against T = 3, pooled +1 against 4; the two new `wrong` rows (`q-crp-oz-rwa-erc3643-trex` pass 2, `q-edge-inject-ignore-instructions` pass 2) are retrieval variance, one with no pointer in the pass; the trap row kept its trap behaviour. No firing for a series other than `sep` or `cap`, no title-case token; 2 re-fires after a follow; follow cost 0 to +2 turns.
Governance read: 0 violations in 20 claim-word answers. By the rule: **revert** (`git revert 940dc013 a49ee918`); recommendation the same, with a note that reverting `940dc013` also reverts F2 (the title-case rule on loop 1's exact-row matching). Server stopped, `gca-eval` released at `940dc013`. Nothing else was run.

### 2026-11-15: R result, step 3 decided: the identifier pointer is not shipped

Run record: `R.md` (Claude Sonnet 5.5 run lane `loop2-run`). Frozen Worker `940dc013`, 17 identifier rows twice, USD 7.0453 of the 8.5 cap.

Orchestrator direct instruction (2026-11-15): **step 3 is reverted by rule, and the orchestrator agrees.** The identifier pointer does not ship. Per-fire follow rate 21% (9 of 42; 22% and
21% by pass) against a bar above 33%, and no traced up (R0(b) and R1 not met: "inconclusive reverts"). Caveats, in the run lane's words:

- **The mechanism worked as built and the model's behaviour was the limit.** Delivery was exact (the replay of R's own transcripts predicts every fire; one execute differs only in which three of
  five identifiers the cap kept), every follow returned an exact row (9 of 9), and the rate is about five times the 4% baseline (7 of 163). It did not reach the bar and it moved no verdict; three
  of nine follows cost +2 turns. A higher follow rate would need a different surface, not a longer sentence.
- **Two general defects for a later attempt:** the cap of three keeps the first three identifiers, not the ones the question names (on `q-sep6-sep24-sep31-choice` it dropped SEP-6 and SEP-31); a
  token read from a `get_doc_page` path string (`sep24`) fires for a page the agent is already reading.
- **Not read as:** an improvement for any other source or series (no non-`sep`/`cap` firing); a result about `search` ranking of the research lane; evidence on any set but these 17 rows, a held-out
  result, or a result for Codex, Grok, OpenCode, the Playground or claude.ai; evidence that an exact row is a better source than the Docs page or skill for a how-to question (the follows added
  preamble facts and moved no verdict); stability (five rows change judge tier between the two passes, and the two `wrong` grades in pass 2 are retrieval variance with no pointer link, one with no
  pointer in the pass).
- Nets against P2, T = 3 per pass and 4 pooled: -1, +2, pooled +1; tier-matched -1, 0, -1. Governance read: 0 violations in 20 claim-word answers. Required services 17 of 17 in both passes.
- The title-case rule (F2) is the one part of step 3 that touched code deployed in loop 1, and R did not measure it (no title-case token appeared in any R call). It is kept for exact-row matching,
  see the kept set below.

### 2026-11-15: the kept set (implementer, Claude Sonnet 5.5)

The kept set is the product tree of `bd9719fb` (the P2 surface) plus one change: the shared identifier-token module, with its title-case rule and six-digit bound, now read only by exact-row
matching. Record: [KEPT-SET.md](2026-11-15-tuning-loop-2/KEPT-SET.md).

**Kept** (each decided by rule at its step): the corroboration guard (`b8ea957d`); the micro-map removal (`0a343e3f`, shipped with item 4's `search` opening, R7); the delivery text, item 4
(`0b07783a`); the `stellarOrg` source with S1, S2 and the R8 brief (`2796299c`, `bd9719fb`); seven cards (`160cd1fa`); the title-case rule and digit bound for exact rows.
**Not shipped:** the identifier pointer (`a49ee918`, `940dc013`; the product paths return to `bd9719fb`, the manifest has no `documentSeries` field, `execute` results carry no pointer sentence).
The pointer's replay tooling is removed with it (git history `3d65d0ff`; the report and summary stay under `scans/step3/`).

Caveats carried from P1 and P2, in the run lane's words: the guard is "delivered, harmless, cost-neutral", not "reduces violations"; the map removal is "not shown harmful on Claude Code with Sonnet
5.5", not "harmless"; the source is **unproven** (called on 3 of 58 rows, one fact used, 0 traced ups; no displacement shown at what T = 5 on 58 rows can see; Worker egress from the deployed adapter is not
tested); seven cards and item 4 are kept on a result that cannot isolate either (A8); required-service coverage fell 58 to 56 to 55 of 58 across P0, P1 and P2.

**Spend, per run** (Claude subscription CLI agents and judge; no API-billed path):

| Run | Rows | USD | Cap |
|---|---|---:|---:|
| P0 | 58 | 11.8093 | 14.5 |
| P1 (pass 1 12.0160; two guard-row passes 1.9989 and 2.0803) | 58 + 10 + 10 | 16.0951 | 19.5 |
| P2 | 58 | 11.6214 | 17 |
| R (pass 1 3.3025, pass 2 3.7428) | 17 + 17 | 7.0453 | 8.5 |
| **Total** | | **46.5711** | 59.5 |

Work on the kept set (free, no model call): the pointer removed in `91f6a2d2`, the rule's unit cases and a differential test against the loop 1 matcher, the 90-query live replay (byte-identical to `bd9719fb`'s, 90 of 90 ok, 17 exact), the
TODO items (`.agents/TODO.md`, "Tuning loop 2 follow-ups" and the items this loop closes). Review findings marked "before ship" or "fix now": F1 (the digit bound) was the only one, applied in
`940dc013` and kept; S1, S2 and the R8 brief were applied in `bd9719fb`. What is left, and why, is in KEPT-SET.md. **No paid run is authorized by this entry.**


## Held-out harm check: thresholds and authorization

Kept set: `tune/loop-2`, code tip `ac5756a4` (KEPT-SET.md); surface hash equals P2's.

**Thresholds recomputed from P0's measured rate and fixed before launch (Claude Fable 5.2,
2026-11-15).** The plan set "ship unless correct is at most 42 or wrong is at least 13" at a 20%
flip rate. P0 measured 0.13 (6 flips in 46 comparable rows). Scaling the plan's two margins by
the square root of 0.13 over 0.20 (about 0.81) gives margins of about 7 and 5, so the reading is:
**ship unless correct is at most 44 or wrong is at least 12.** This is the orchestrator's
arithmetic on the plan's null model, not a new measurement; it is stricter than the plan's reading.
Reference: loop 1's read of its kept surface (51 correct, 61 partial, 7 wrong; judge-panel cap
119, as here), whose sealed results file is the pairing baseline. No held-out result is called an
improvement.

**Authorization.** One collection of the held-out set on the kept commit, launched by the
orchestrator with `eval/qa/heldout-read.sh` from the sealed id list, `--max-budget-usd 30`, counts
only; results sealed outside the repository.

## Held-out harm check, result

119 planned, 119 completed, 118 judged, USD 25.01; results SHA-256
`1902171b4cd930459f4b3baf149cc20a2b581c0df5dc2ff28cd6c5405851f9d3` (sealed, outside the
repository). Correct 50, partial 59, wrong 9, ungraded 1 (the judge's consistency check, not an
agent failure); core answer correct on 110; trap rows graded correct 5 of 7. Paired with loop 1's
read on 118 rows: 14 up, 16 down, 7 became wrong, 5 left wrong. Reference: 51, 61, 7; core 115;
traps 7 of 7.

**Reading (thresholds fixed before launch): no harm shown; ship the kept set.** Correct is above
44 and wrong is below 12. Not an improvement, and not evidence of one. Recorded beside the reading,
because the rule does not use them: core-answer-correct is 5 lower, downs exceed ups by 2, and two
trap rows are not graded correct. Counts-only detail on those two (no id or text): both are
scam-check rows; one is the ungraded row; the other is graded wrong with no wrong claim and no
must-avoid match (two missing facts). Neither shows the forbidden behaviour by the judge's fields;
neither transcript was opened.

**Deviation: one held-out row's answer text was exposed to the orchestrator.** A counts-only script
over the sealed results printed a field that embeds the answer, for one row; the orchestrator saw
the opening of that answer (the ungraded scam-check row). The output file was deleted and the
script re-run with a safe projection. No lane saw it, and no product change has been made since.
The row is identified only by its case-input hash in the sealed directory
(`exposed-row.sha256`); at the next split draw it is treated as exposed and leaves the held-out set.

**Loop 2 closed.** Spend: P0 11.81, P1 16.10, P2 11.62, R 7.05, held-out 25.01; USD 71.59
subscription-equivalent (plan estimate 72, caps 92).

### 2026-11-16: merged and deployed

Recorded by the orchestrator from the loop 2 session transcript.

- **Deploy.** #447 merged 2026-11-16 00:04:53 UTC as `986ffbaa`. `npm run deploy` ran from a clean
  worktree at `origin/main` at 00:05 UTC: preflight ok, Version
  `c3596dcc-90d7-4602-bbab-d813b3eaf1ec`, usage tail consumer check passed.
- **Post-deploy checks, 00:06 UTC.** `/` 200, `/health` 200, unauthenticated `POST /mcp` 401 with
  `WWW-Authenticate: Bearer realm="OAuth" ... scope="mcp"`.
- **Egress through the adapter's own path, 00:06:28 UTC.** One `execute` through the production
  Raven connector:
  - `stellarOrg.search_site({ query: "SDF strategy" })`: ok in 171 ms; top hits
    `/foundation/strategy` ("SDF's Strategy"), `/foundation/team`, `/foundation`.
  - `stellarOrg.get_page({ path: "/foundation/strategy" })`: ok in 34 ms; 4,455 characters,
    beginning "2026 / # Accelerating growth".
  - `scout.listAudits({ limit: 2 })`: ok in 840 ms, as a control.
  - Totals: 3 ok, 0 error, 0 soft-empty.

This closes the A7 gap: the deployed Worker reaches stellar.org through the adapter itself.

## Outcome

Verdicts, each decided by rule at its step (the kept-set entry above has the commits):

| Item | Verdict |
|---|---|
| 1. Corroboration guard, then micro-map removal | Kept, on "no harm shown" |
| 2. `stellarOrg` source | Kept, unproven (called on 3 of 58 rows) |
| 3. Seven search cards by default | Kept |
| 4. Description openings that stand alone | Kept |
| 5. Identifier pointer for SEP and CAP queries | Not shipped; the title-case rule for exact rows stays |

The held-out harm check reads "no harm shown" and claims no improvement. Spend: USD 71.59
subscription-equivalent. Decision 2(b) of
[the next-phase decisions](2026-11-16-next-phase/DECISIONS.md) replaces "at the next split draw"
above: the exposed row moves to tuning by a dated amendment, with no re-draw.

Every file in this round's folder stays, because each defines a label the ledger and
[`.agents/TODO.md`](../TODO.md) cite (`R8`, `D7`, the step and review ids) or holds a result: the
plan, review and amendments, `STEP-1` to `STEP-3` and their reviews, `P0.md`, `P1.md`, `P2.md`,
`R.md` and `KEPT-SET.md`. `scans/` stays because the TODO's "Tuning loop 2 follow-ups" and "Prove
the stellar.org source" items rest on its claim reads and counts. The raw JSON output is not
committed; it is in `~/backups/loop2-scans-2026-11-15/scans/` on agentpc. The launch brief
`briefs/loop2-plan.md` is deleted.

Open work moved to the TODO: the follow-ups under "Tuning loop 2 follow-ups" and "Prove the
stellar.org source".
