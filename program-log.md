# Golden-truth burn-down — program log

## Session 2 (2026-08-27) — negative predicates, compound facts, long facts

Branch `lane/golden-truth-burndown-2-20260827`, base `37dc50d` (main; contains session 1's three
closed classes). Owner: Claude Fable 5 (Herdr pane `w12:p1`). Brief: `/tmp/raven-qadeep/own-goldentruth2.md`.
Assets: `/tmp/raven-qadeep/gt2/{rules.md,batch4-negative.md,reviewer-rules.md,reconcile-register.py}`.
Session-1 log (corrections and pitfalls) is in the git history of this file below.

### Baseline (2026-08-27, `37dc50d`)

`node eval/qa/lint-corpus.mjs`: 0 errors, 1,212 warnings.

| class | count | cases |
|---|---|---|
| key-fact: negative predicate object absent | 131 | 127 |
| key-fact: multiple predicates | 188 | 148 |
| key-fact: exceeds 90 characters | 790 | 402 |
| avoid: sourcing-guard/judge-blind (out of scope) | 47 | — |
| corroboration (out of scope) | 56 | — |

Overlap: 46 negative cases are also compound; 107 negative cases are also long; 135 compound cases
are also long. Union of all three classes: see `/tmp/raven-qadeep/gt2/*-cases.txt`.

### Method change from session 1

One pass per case: a worker clears every `[key-fact]` warning on an assigned case in the same edit,
because any keyFact edit already trips the gospel lint and needs a refreshed `truth.verified`.
Batch 4 = the 127 negative-predicate cases (also clearing their compound/long warnings). Batch 5 =
the compound cases not in batch 4. Batch 6+ = long-only cases.

Pitfalls carried forward: keyFacts compile cap 1–5 (migration exceptions pinned at exactly 6/7:
q-ti-stellar-lab-usage-and-new-ui, q-tool-cctp-stellar-integration); one keyFact is sha256-pinned
by `eval/qa/fact-stage-benchmark.mjs` (q-hist-quantum-preparedness-plan[0]) and must not change;
the negative-predicate regex also matches the adjective "separate"; count register entries, not
lines, when grepping for `reopen`.

### Stop-point

Stop after batch 4 (negative class) is closed and either batch 5 (compound) is closed or 6 wall-
clock hours of crew time have elapsed from the first worker prompt, whichever comes first. The long
class is taken only with remaining time after that.

### Crew

Workers: Codex `gpt-5.6-sol` high, `-a never -s workspace-write`. Reviewer: Grok 4.6 high (differs
from author and owner); Opus high fallback. Panes recorded per batch below; the owner created all.

### Batches

#### Batch 4 — negative-predicate class (127 cases; one pass per case) — complete

Crew: gt2-sol-a (pane w12:p2), gt2-sol-b (w12:p3), gt2-sol-c (w12:p4), Codex gpt-5.6-sol high,
four cases per prompt (32 chunks, `/tmp/raven-qadeep/gt2/negchunk-NN`); reviewer gt2-grok-rev
(w12:p5), Grok 4.6 started with `--reasoning-effort high` (the Grok banner reports "xhigh"; the
CLI label is recorded as seen). Startup note: two Codex panes hit a ChatGPT login race while the
first pane refreshed `~/.codex/auth.json`; both were quit and restarted, then signed in cleanly.

Part 1 review (32 cases, chunks 00–02, 11–13, 22–23): `/tmp/raven-qadeep/gt2/review-b4-part1.md`
— APPROVE-WITH-FIXES, 26 PASS / 6 FAIL. Every FAIL was a claim silently dropped while tightening a
long fact (central-limit orderbook; mintRecipient/destinationCaller; hosted facilitators; the
default G-address trustline rule; ledger-testutils; the non-universal-remedy caveat) or a claim
added without a receipt ("unaudited"). Owner applied the reviewer's exact replacement text, moved
two dropped "not X" tails into golden.avoid, and recorded an owner-fix evidence line on each case.
The feedback was appended to `batch4-negative.md` and the worker loops were restarted so every
later prompt requires a per-case "claims kept / moved to avoid / none dropped" line.

Part 2 review (52 cases, chunks 03–06, 14–19, 24–26): `/tmp/raven-qadeep/gt2/review-b4-part2.md`
— APPROVE-WITH-FIXES, 40 PASS / 12 FAIL. Eight content fixes applied with the reviewer's exact
text (USTRY vs CETES; XycLoans as its own evidence tier; "not an SDF-built product" moved to
avoid; explicit FCP accept/reject branches; removed added qualifiers "adjacent credit", "audited",
"discovery evidence", "memory as an exception"). Owner declined one proposed fix: appending
"Do NOT substitute an unsupported memory claim for source-supported content" to six cases whose
old keyFact 0 ended "... rather than as an unsupported memory claim". Reason: that tail is a
sourcing demand, not a concrete false-content claim (the avoid list punishes false claims only);
the rewritten positive fact ("Uses dated source observations for changeable claims") carries the
same requirement, and part 1 accepted the identical rewrite on other cases. Recorded here as the
reconciliation; the six cases (q-defi-flash-loans, q-defi-provide-liquidity-impermanent-loss,
q-defi-rwa-scf-similar, q-eco-stellar-rwa-stablecoin-volume, q-protocol-23-whisk-caps,
q-pay-moneygram-ramps) otherwise carry every claim. Reviewer also noted seven worker
"claims kept" lines that did not match the diff; the owner fixes above cover each.

Part 3 review (43 cases, chunks 07–10, 20–21, 27–31): `/tmp/raven-qadeep/gt2/review-b4-part3.md`
— APPROVE-WITH-FIXES, 41 PASS / 2 FAIL (dropped field names recipient/caller on the CCTP
integration case; dropped "OpenZeppelin context-rule" on the passkey-kit case). Both fixed with the
reviewer's text; OpenZeppelin is abbreviated "OZ" in the second fact to respect the 90-char cap
while keeping flat multi-signer, context-rule, auth-digest, and policy. The reviewer's part-1
replacement that named SEP-41 in q-sor-confidential-tokens tripped the numeric-corroboration lint
(no covering row); the HEAD fact never named SEP-41, so the worker's wording was restored and the
reason recorded in that case's evidence. Migration exceptions kept their pinned counts (6 and 7).

Lint after batch 4: 0 errors, 799 warnings (negative-predicate 131 → 0; compound 188 → 125; long
790 → 571). Register: 92 entries auto-reopened by member hashes, 83 closed by form-only reSwept
events; the nine clusters already `reopen` at `37dc50d` were re-stamped with identical
`reopened` blocks and left as they were. Gates: compile, lint --since 37dc50d --stale (0 errors),
typecheck, npm test, build, secrets scan — all green (`/tmp/raven-qadeep/gt2/gate-negative-predicate-*.txt`).
Batch-5 edits in progress (29 files) were set aside by id list during the gate run and restored after.
Commit pitfalls: the gitleaks pre-commit hook flagged a sibling-sweep evidence line where the id
`q-n3-inject-ignore-previous-instructions` followed `...-secret-key-refusal,` (generic-api-key
rule); the ids were reordered. The `YieldBlox borrowed XLM USDC totals` numeric invariant carried
hashes but no verdict at `37dc50d` and was stamped `consistent` with a dated reason. The generated
`eval/qa/cases.json` is committed with the batch, as in session 1.

#### Batch 5 — compound-predicate class (102 cases not in batch 4; one pass per case) — complete

Chunks `/tmp/raven-qadeep/gt2/cmpchunk-NN` (26). Brief: `/tmp/raven-qadeep/gt2/batch5-compound.md`
(includes the batch-4 reviewer feedback). Part 1 review (32 cases, chunks 00–03, 09–10, 18–19):
`/tmp/raven-qadeep/gt2/review-b5-part1.md` — APPROVE-WITH-FIXES, 25 PASS / 7 FAIL. Three content
fixes applied (removed the added qualifier "core"; restored RestoreFootprintOp as the required
manual fallback together with the read-write footprint + archivedSorobanEntries requirement, which
the reviewer's own replacement had dropped; restored `--network testnet` on the deploy command).
Four FAILs were chunk 18: worker gt2-sol-c answered with ids that were not in its prompt, reported
its four assigned cases "absent", edited an unassigned long-only case (q-soroban-publish-events —
set aside unreviewed in `/tmp/raven-qadeep/gt2/stray/`), and re-touched the metadata of the
already-reviewed batch-4 case q-ti-friendbot-ratelimit-alternatives minutes before the batch-4
commit (keyFacts identical to the reviewed ones; `by` corrected). Chunk 18 is re-queued to worker
gt2-sol-b after its loop, with the four ids spelled out.

Part 2 review (32 cases, chunks 04–06, 11–13, 20–21): `/tmp/raven-qadeep/gt2/review-b5-part2.md`
— APPROVE-WITH-FIXES, 28 PASS / 4 FAIL (a subject swap to "over-limit writes"; three must-state
claims demoted to avoid traps: provider-response handling, the Windows rustup/MSVC-or-WSL install
path, the Horizon C-address exclusion). All four fixed with the reviewer's exact text.

Part 3 review (42 cases incl. the chunk-18 redo, chunks 07–08, 14–18, 22–25):
`/tmp/raven-qadeep/gt2/review-b5-part3.md` — APPROVE-WITH-FIXES, 38 PASS / 4 FAIL (dropped the
2026-08-16 deadline date; added qualifier "apt"; dropped the fall-behind claim; a must-state
wallet/version-specific backup claim demoted to avoid on a pinned-6 case). All four fixed with the
reviewer's exact text.

Lint after batch 5: 0 errors, 475 warnings (compound 125 → 0; long 571 → 372; negative stays 0).
Register: 70 entries auto-reopened, 62 closed by form-only reSwept events; the q-defi-perps-whitespace
date trap carried a hash but no verdict at `daaa829` and was stamped `consistent` with a dated
reason (its open disposition and 2026-10-29 reverifyBy unchanged); the nine pre-existing `reopen`
clusters unchanged; reopen count equals HEAD. Gates: compile, lint --since 37dc50d --stale (0
errors), typecheck, npm test, build, secrets scan — all green
(`/tmp/raven-qadeep/gt2/gate-compound-predicate-*.txt`, re-run after the stamp as `gate-cp2-*`).
The unreviewed stray edit to q-soroban-publish-events stays out of the commit
(`/tmp/raven-qadeep/gt2/stray/`).

### Session 2 close (2026-08-27, 15:30)

Batches landed: `daaa829` (negative-predicate, 127 cases), `c321f5d` (compound-predicate, 102
cases). Final `node eval/qa/lint-corpus.mjs`: 0 errors, 475 warnings (baseline 1,212).

| class | session-2 baseline | now |
|---|---|---|
| key-fact: negative predicate object absent | 131 | 0 |
| key-fact: multiple predicates | 188 | 0 |
| key-fact: exceeds 90 characters | 790 | 372 (204 cases) |
| avoid: sourcing-guard/judge-blind (out of scope) | 47 | 47 |
| corroboration (out of scope) | 56 | 56 |

Stop rule from the brief met: negative class closed and compound class closed. The long class was
not opened as its own batch; its count fell as a side effect of the one-pass-per-case method.

Escalations: none. No golden was found factually wrong in this session; every reviewer FAIL was a
form defect (a dropped claim, an added qualifier, or a must-state claim demoted to an avoid trap)
and was repaired with the reviewer's text or an owner rewrite that keeps every HEAD claim.

Crew panes (all created by the owner from w12:p1): w12:p2 gt2-sol-a, w12:p3 gt2-sol-b, w12:p4
gt2-sol-c (Codex gpt-5.6-sol high), w12:p5 gt2-grok-rev (Grok 4.6). Left idle at session end.

Next session: long keyFacts (372 warnings, 204 cases, all long-only now). Follow the current
session-3 handoff in `.agents/TODO.md`. The reviewer must keep the claim-by-claim check. In this
session, 33 of 233 reviewed cases dropped or added a claim while tightening. The temporary helper
files and the unreviewed `q-soroban-publish-events` draft have expired.

## Session 2 ledger receipt (added by orchestrator at collection)

Round ledger entry appended in the PR for this branch; report archived from
/tmp/raven-qadeep/golden-truth-owner2.md.

## Temporary asset status (2026-08-27)

The session-2 files under `/tmp/raven-qadeep/gt2/` expired after the host restart. This log remains
the durable record of the completed method, review results, fixes, and gate results.

The session-3 handoff now lives in `.agents/TODO.md`. A new session must rebuild its helper files
from current `main`. The lost `q-soroban-publish-events` draft was unreviewed and must not be used
as evidence.
