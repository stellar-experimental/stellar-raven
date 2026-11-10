# Independent review: q-protocol-ledger-close-time (golden/ledger-close-time-p28-date)

Reviewer: Claude Fable 5.1 (independent; not the author or orchestrator). Read-only.
Worktree: /private/tmp/claude-501/raven-wt/lct, diff against origin/main (5 files).
Date: 2026-11-10 (facts re-derived live at 18:53Z, see URL list).

## Verdict: APPROVE WITH FIXES

The change implements the owner decision faithfully as a soft requirement, the live facts in the
new corroboration row and `truth.verified.evidence` re-derive exactly, the register re-sweeps are
accurate, no notes sentence trips the cap-finding lint, and the sibling sweep is clean. One
REQUIRED item is a provenance claim in `truth.verified.by` that this diff does not yet make true,
plus the skill's Step 6 close-out (ledger line, TODO closure). The rest are wording sharpenings
for the judge.

Gates I ran in the worktree (all pass, no stray diff):
- `node eval/qa/lint-corpus.mjs --since origin/main --stale` → exit 0, 0 errors; the only
  finding for this case is the pre-existing-style WARN `key fact exceeds 90 characters (125)`.
- `npm run eval:qa:compile` → exit 0; regenerated `cases.json` / `sample.json` /
  `lifecycle-registry.json` reproduce the branch byte-for-byte (diff stat unchanged, 138/45).
- `npm run eval:qa:register -- --check` → "up to date".

## Independent fact re-derivation (check 1)

| Claim in the diff | What I observed | Match |
|---|---|---|
| Ledger 64458445 closed 2026-09-16T17:00:01Z, protocol 27 | `closed_at` 2026-09-16T17:00:01Z, `protocol_version` 27, hash 553561b4… | yes |
| Ledger 64458446 closed 2026-09-16T17:00:06Z, protocol 28 | `closed_at` 2026-09-16T17:00:06Z, `protocol_version` 28, hash 22d26a28… | yes |
| 2026-11-10 sample: 199 deltas, all 5 s, protocol 29 (65409934–65410133) | My fetch at 18:53:29Z: ledgers 65409953–65410152, consecutive, all protocol 29, 199 deltas, every one 5.0 s (mean 5.0, min 5, max 5) | yes (19 ledgers later) |
| stellar-stack.md says "about every 5 seconds" with configurable-target caveat | Line 21: "update the ledger about every 5 seconds. The target close time is a network setting that can change, and a single ledger can take longer to close." No 5–7. | yes |
| validators.md the same | Line 9, identical sentence. No 5–7. | yes |
| usdt0.md says about 5 seconds / ~5s, no 5–7 | Line 186 "Stellar finalises in about 5 seconds"; line 256 "Stellar settlement … ~5s". No 5–7. | yes |
| llms-full.txt has no 5–7-second range | 5.9 MB served; zero hits for 5–7 / 5-7 / five-to-seven second; "about every 5 seconds" at the stack and validators sections; no 3–5 hits either. | yes |
| Bell blog: "In September, Adapter (Protocol 28) brought mainnet ledger close times down from about 5.7 seconds to 5 seconds." | Verbatim present; also "November 23, 2026" and "faster than 5s? Not by itself." | yes |
| Docs changed on 2026-11-09 (cluster-065 note) | stellar-docs PR 2931 (Stack + Validators) merged 2026-11-09T16:43:29Z; PR 3080 (USDT0) merged 2026-11-09T20:38Z per sd-100. Both the same day, so "since 2026-11-09 the official Docs say about 5 seconds" is accurate. | yes |

Protocol 28's Mainnet boundary date of 2026-09-16 is therefore fixed by Horizon directly, and the
5–7 figure is confirmed as pre-Protocol-28 cadence by the 2026-08-30/31 samples already in the
file (median 6 s) and the blog's "about 5.7 seconds".

## Findings

### 1. REQUIRED — `truth.verified.by` asserts a ledger record that this diff does not contain; close out per skill Step 6

`truth.verified.by` ends with "independent review recorded in
.agents/rounds/2026-11-09-improvements-sweep.md". The diff touches neither that ledger nor
`.agents/TODO.md`, and the ledger's last word on this topic (line 126) is that the owner question
"is queued". At merge time the claim would be false, and the golden-truth skill's Step 6 requires
the round ledger to record the affected case ID and the `.agents/TODO.md` item to be closed with
commit refs. The previous verification event pointed `by` at a committed audit file
(`research/audits/2026-11-09-improvements-sweep/review-astra-sd100.md`); this review lives in a
gitignored `tmp/`.

Fix (any one of these makes the claim true; (a) is the precedent):

(a) Copy this file to `research/audits/2026-11-09-improvements-sweep/review-lct-fable.md` (or a
new dated audit folder), append a short entry to `.agents/rounds/2026-11-09-improvements-sweep.md`
(decision, affected case, reviewer, verdict, commit), delete the TODO heading "Decide whether the
ledger close-time golden still accepts an undated 5–7 seconds" with a commit ref, and set:

```
"by": "coordinator Claude Opus 5.5 on the owner decision of 2026-11-10 (closed in .agents/TODO.md; ledger .agents/rounds/2026-11-09-improvements-sweep.md); independent review Claude Fable high (research/audits/2026-11-09-improvements-sweep/review-lct-fable.md)"
```

(b) If the ledger entry is deliberately deferred, drop the clause so the field only claims what
exists:

```
"by": "coordinator Claude Opus 5.5 on the owner decision of 2026-11-10 (.agents/TODO.md, 'Decide whether the ledger close-time golden still accepts an undated 5–7 seconds'); independent review Claude Fable high"
```

### 2. RECOMMENDED — make key fact 1 an explicit disjunction

Current: `States about 5 seconds with a date or source; a 5–7-second figure counts only as the cadence before Protocol 28 (2026-09-16).`

"counts only as" can be read two ways by a judge: (i) a pre-Protocol-28-dated 5–7 *satisfies* key
fact 1 (the owner's intent), or (ii) 5–7 is merely *accurate* for that period while the key fact
still demands "about 5 seconds". Reading (ii) would fail case (b) in the brief. The notes resolve
it ("Accept 5–7 seconds only as the cadence before Protocol 28 …"), but the key fact is what the
judge walks one by one. A parallel disjunction removes the ambiguity, drops the clause count, and
shortens the fact (99 chars; still a WARN, same as before):

```
States about 5 seconds with a date or source, or 5–7 seconds dated before Protocol 28 (2026-09-16).
```

Checked against the lint: no `and`/`;` split, so no multiple-predicate warning; no negative
predicate.

### 3. RECOMMENDED — resolve case (d) and the past-framed 5–7 in the notes

Current grading sentences:

> Accept about 5 seconds when the answer dates it or names its source. Accept 5–7 seconds only as the cadence before Protocol 28, dated before 2026-09-16 or tied to that upgrade. An undated 5–7-second figure, or one attributed to current Docs, is stale and does not meet key fact 1. It is a minor error, not a fired avoid, and does not by itself make the answer wrong.

How a judge grades the four shapes under the current text:
- (a) "about 5 seconds as of 2026" → key fact 1 met → correct (given key fact 2).
- (b) "5–7 seconds before Protocol 28 / mid-2026 before September" → accepted → correct.
- (c) "5–7 seconds per the Stellar docs", undated → key fact 1 missing, minor error, no avoid →
  partial. The sentence "does not by itself make the answer wrong" is load-bearing because the
  judge prompt otherwise says a claim contradicting the golden goes in `wrongClaims` and sets
  `coreAnswer` incorrect; the notes override that. Fine.
- (d) dated ~5 s **plus** an undated 5–7 → ambiguous. Key fact 1 is met by the ~5 s, but the
  notes label every undated 5–7 "a minor error", so the judge will most likely put it in
  `wrongClaims` as a minor slip → partial. That is defensible for a present-tense stale claim
  ("the docs say 5–7 seconds"). It over-reaches for a past-framed clause ("it used to be 5–7
  seconds; as of November 2026 it is about 5 seconds"), which is true, informative, and is what
  the golden answer itself says, yet is neither "dated before 2026-09-16" nor explicitly "tied to
  that upgrade". Under a literal reading that correct answer drops to partial.

Proposed replacement for the four sentences (lint-checked: none matches `PARTIAL_CAP_RE`,
`NOT_WRONG_RE`, or carries canonical/official/upstream):

```
Accept about 5 seconds when the answer dates it or names its source. Accept 5–7 seconds only as the cadence before Protocol 28: dated before 2026-09-16, tied to that upgrade, or clearly framed as past. A 5–7-second figure presented as current, undated, or attributed to current Docs is stale and does not meet key fact 1; list it in missingFacts. That miss is a minor error, not a fired avoid, and never scores the answer wrong by itself. When the answer also gives a dated or sourced about-5-seconds figure, key fact 1 is met and the stale 5–7 is a minor slip that still blocks correct.
```

If the owner prefers the strict reading (past-framed but undated 5–7 still misses), delete
", or clearly framed as past" and the text is otherwise unchanged. Either way the last sentence
settles (d) explicitly instead of leaving it to the judge.

Note on the sentence the brief flagged, "Their earlier 5–7-second estimate matched samples before
Protocol 28": it does not contradict the new rule. It is a statement about the Stack and Validators
pages' earlier wording, and it is consistent with accepting 5–7 only as pre-Protocol-28 cadence.
The one wrinkle it hints at (those pages kept saying 5–7 until 2026-11-09, so "5–7 per the docs,
as of October 2026" was an accurate attribution at the time but now misses key fact 1) is the
owner's chosen cut-off (pre-Protocol-28 rather than pre-2026-11-09), so no change is needed.

### 4. RECOMMENDED — refresh `truth.asOf` and the in-text date, or record why not

`truth.asOf` stays 2026-11-02 and the answer still opens "As of **2026-11-02**", although a fresh
2026-11-10 sample confirms the value and this is a judge-facing edit. The skill says: "When a
re-check confirms an unchanged value, truth.asOf may lead the date in the golden text; refresh the
in-text date at the next judge-facing edit." The 2026-11-09 edit also left both at 11-02, so there
is precedent for leaving them, and this case has no `source-sentinels.json` entry, so bumping
`asOf` carries no sentinel obligation. If bumped:

```
"asOf": "2026-11-10"
```
and in `golden.answer`:
```
As of **2026-11-10**, Stellar Mainnet closes a ledger about every **5 seconds**. The network setting `ledger_target_close_time_milliseconds` is 5000. Every delta in 199-ledger samples on 2026-11-02 and 2026-11-10 was 5 seconds, and the mean has been 5.0 seconds since Protocol 28 activated on 2026-09-16.
```
(the remainder of the answer unchanged). Leaving it as is remains acceptable; the notes' own "As
of 2026-11-02" then also stays.

## Checks with no finding

- **Cap-finding lint (check 3).** I split `golden.notes` with the lint's own sentence splitter and
  tested each sentence: no sentence matches `PARTIAL_CAP_RE` or `NOT_WRONG_RE`; "not a fired
  avoid" and "make the answer wrong" are not in the regex. `hasSymmetricCaution` is not required
  because the only `improvements/` rootCause is `improvements/resolved.json`, which the lint
  excludes. Confirmed by the lint run (no symmetric-caution or cap-finding entry for this case).
- **truth.verified.evidence and rootCause (check 4).** Every evidence line is a concrete URL or
  ledger path with a timestamp and I re-walked each (table above). `rootCause` =
  `freshness-drift` + `improvements/resolved.json (sd-100 …)` is accurate: the grading rule
  changed because the last served page saying 5–7 was corrected (sd-100, PR3080), i.e. the
  source drifted, not the eval score. Not a score-laundering shape: the change can only move a
  verdict toward partial/wrong for an undated 5–7, never toward correct.
- **New corroboration row shape.** `{claim, verdict: "confirmed-as-of", evidence: [{class, ref,
  observedAt, note}]}` matches the skill's required shape; the composite ref
  "…/ledgers/64458445 and /ledgers/64458446" follows the file's existing precedent
  ("/ledgers/64460000 and /ledgers/65269965"). Classes C and A, two independent classes, meets
  the numeric/date bar. The blog row reuses `observedAt` 2026-11-02 honestly (not re-observed by
  the author); I re-observed it today and the quote is unchanged.
- **Register re-sweeps.** cluster-017 reason is accurate (q-asset-path-payment-ops says "roughly
  one ledger close (~5 s)" and "≈ one ledger close, ~5s"; fee/reserve/supply/timestamping members
  untouched). cluster-065 note and reason are accurate: both Docs PRs merged 2026-11-09, the
  2026-11-10 sample was 199 five-second deltas, and q-protocol-max-tx-set-size makes no cadence
  claim. Member hashes re-stamped (register --check up to date).
- **Sibling sweep (check 5).** `grep` over `eval/qa/corpus/battery` for 5–7 / 5-7 / five-to-seven
  second: only this case. A regex sweep of golden fields for cadence phrases found: 
  q-asset-path-payment-ops "~5 s" (consistent); q-defi-x402-on-stellar-what notes say the "~5
  second settlement" figure was removed from its gate (consistent); q-quickstart-manual-ledger-close
  "~1s" is the localnet manual-close setting, not Mainnet; q-sor-doc-timestamping-manage-data
  discusses closeTime semantics without a cadence number. No case now conflicts.
- **Avoid items.** Unchanged; no judge-blind avoid item added; the decision is encoded as a soft
  key-fact miss, as the owner asked.
- **Lifecycle registry.** Only this case's `caseContentSha256` changed; state active, reviewState
  none. Correct for a verified in-place edit.

## URLs hit (all via curl from this session, 2026-11-10 18:53Z unless noted)

1. https://horizon.stellar.org/ledgers/64458445
2. https://horizon.stellar.org/ledgers/64458446
3. https://horizon.stellar.org/ledgers?order=desc&limit=200 (18:53:29Z; ledgers 65409953–65410152)
4. https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md
5. https://developers.stellar.org/docs/validators.md
6. https://developers.stellar.org/launch/usdt0.md
7. https://developers.stellar.org/llms-full.txt
8. https://stellar.org/blog/developers/introducing-bell-protocol-30-on-stellar
9. https://api.github.com/repos/stellar/stellar-docs/pulls/2931 (via `gh pr view`; mergedAt 2026-11-09T16:43:29Z)
