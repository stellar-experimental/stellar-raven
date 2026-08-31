# NEXT — handoff for the next work block

Updated 2026-08-31 after the golden-metadata verify-and-close pass. Read this first. `TODO.md` holds the
full item text; this file only ranks and sequences. Delete or rewrite this file when the block
below is done.

## State at handoff

- The record-only closeout does not change production. Production runs Worker Version ID
  `6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28 from `main` HEAD. Session 3 did
  not deploy.
- `improvements/`: 69 active findings. `sd-047` is `reported-upstream` at
  https://github.com/stellar/stellar-docs/issues/2805. Lint passes.
  `sls-080` is verified.
  Stellar-Light/stellarlight#1031 is still open;
  the maintainer owns the close.
- Corpus lint: 0 errors, 61 warnings (0 long-fact, 44 sourcing-guard, 16 corroboration, 1
  symmetric-caution). Every warning carries a recorded disposition: the 44 sourcing-guard items stay
  advisory (20-case audit, two models); the 16 corroboration items are grammar-only (56/56 class
  agreement, two models); the `symmetric-caution` on `q-protocol-ledger-close-time` is accepted under
  the ADR-0008 no-caution decision. Do not chase these counts to zero.
- Golden import validates Stellar strkeys (CRC16, SEP-23 version bytes) in `eval/qa/compile-qa.mjs`
  through `eval/qa/strkey.mjs`.
- The first `qa-five-track-v1` same-100 result is local at
  `eval/qa/results/2026-08-30T03-43-11-variantA.json`. Its independent decision is
  `VALID WITH A T4 EXCEPTION`. The one T4 exclusion leaves 99 paired-eligible IDs, so the
  100-ID method is `INDETERMINATE`. Judge stability remains 57 of 100 below 0.75.
- The paid artifact used rubric `v2.9`. The closeout fixes its `partial-without-issue` defect in
  rubric `v2.10`. Cross-rubric comparison requires a rejudge under the target tuple.
- Consistency register: reconciled on 2026-08-29; 0 reopen entries.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.
- Ledgers for the finished blocks: `.agents/rounds/2026-08-29-golden-truth-session-3.md`,
  `.agents/rounds/2026-08-29-five-track-same-100.md`, and
  `.agents/rounds/2026-08-30-golden-metadata-remainder.md` (PR #100, merged 2026-08-30 as
  `a617512`). The 2026-08-31 verify-and-close ledger is
  `.agents/rounds/2026-08-31-golden-metadata-remainder.md`.
- Both temporary-path classes are gone from the battery (0 files on 2026-08-31).
  301 files carry a `solo://` reference; these are retained historical dated records.
- `sd-047` (Validators 3-5 versus Stellar Stack 5-7 ledger cadence) is `reported-upstream`.
- Recovery PR https://github.com/stellar-experimental/stellar-raven/pull/102 closed without merge.
  QA PR https://github.com/stellar-experimental/stellar-raven/pull/103 also closed without merge.
  The record-only evidence is in
  `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.

## Ranked blocks

### 1. Golden metadata remainder

Skill: `golden-truth`. PR #100 landed the 47 dead-provenance repairs, both dated-conflict
dispositions, and the five same-100 candidates. The 2026-08-31 round verified all 54 landed ids,
repaired all 37 bare-relative files through verified touches (two after blind re-derivation),
superseded the stale `~3-5s` notes sentence on `q-protocol-ledger-close-time`, created `sd-047`
(`verified`), and closed the two metadata gaps. Grok 4.6 high completed the independent review and
follow-up review; every finding was repaired, and the follow-up verdict is `PASS`. PR #106 merged the
round as `0916e09`. Stellar Docs issue #2805 records `sd-047`. Block 1 is complete.

Decisions recorded on 2026-08-31: `solo://` references in corpus truth metadata are historical dated
records under `AGENTS.md` and are never rewritten; `q-protocol-ledger-close-time` gets no
canonical-page caution (ADR-0008 three-case boundary), and its advisory `symmetric-caution` lint
warning is accepted.

Record the affected case-id list in the round ledger, as this round did
(`2026-08-31-golden-metadata-remainder/affected-case-ids.md`).

### 2. Eval instruments

Skill: `run-evals`. The Raven capability-boundary prompt change is rejected and does not ship.
Method 1 failed its product gate. Its inherited environment hash also differed.
Method 2 did not run and has no authorization from this result.
The next boundary attempt needs a stronger mechanism and a new pre-registered diagnostic before a
headline sample.

The Friendbot network-context failure is monitor-only.
Judge stability is degrading (47 → 57 unstable). Watch its trend at the next register refresh.

The `qa-five-track-v1`, paired verdict, judge `v2.10`, and golden lifecycle contracts are implemented.

### 3. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 4. Repository-level tooling recovery

The rejected v2 implementation does not ship. Its result was 9 of 12 positive recoveries and 0 of
8 premature detours. It had 18 of 20 correct and 20 of 20 grounded answers.

`sls-080` is a verified active finding. The free Horizon probe still returned `25` at
`2026-08-31T01:42:10.098Z`, with scanned ref `82660510ecda7fd365a14d08badb9d85fa22bc32`.
Do not run a paid recovery collection until this probe returns `28`.
The selection trigger remains three recurring misses. The Docs-versus-repository conflict stays
monitor-only until three recurrences. The `stellar-cli` fallback did not reproduce and has no active
finding. G1 remains a pre-registered v3 candidate only.

The next Scout finding must use `sls-082`. `sls-081` is historical only.

`sources.locate` stays deferred. Its phase-zero study reopens only through the measured trigger in
`ideas/source-delivery-ranked-references.md` §8.

### 5. Playground message limit

Raise the user-message ceiling from 4,000 to 8,000 characters. Keep excessive text intact, disable
Send, show the accessible count and error, and reject bypassed requests server-side. Keep the
Playground stateless; durable session history remains a deferred idea.

### 6. Small own-repo fixes

- `test/demo-chat.test.ts` mocks the `ai` module, so the tool-loop guard never runs. Stub the
  model instead.
- Remove the leading blockquote marker from generated improvement titles.

## Owner decisions

The 2026-08-28 human-review grill resolved its 21 questions. One later eval-method question is open.

### Choose a product-loss margin for the paired QA method

The current `0.08` value is only the no-change confidence radius. It is not an accepted quality-loss
tolerance. The table uses the mixed-tuple 2026-08-27 and 2026-08-28 discordance upper bound.

| Candidate margin | Look-1 no-change `PASS` | Two-look no-change `PASS` | Two-look false `PASS` at a true 5-point loss | Second collection under no change |
| ---: | ---: | ---: | ---: | ---: |
| 0.05 | 6.992% | 25.963% | 0.051% | 91.812% |
| 0.08 | 36.350% | 80.925% | 3.899% | 62.454% |
| 0.10 | 66.208% | 95.657% | 18.357% | 32.596% |

Choose the largest acceptable product loss from product impact. Do not choose it from power alone.
Promotion also needs one same-tuple pinned pair for recalibration.

## Suggested sequence

Use the next register refresh for block 2, judge stability. Continue with block 3, protocol-history
routing.

Block 4 is monitor-only until its stated free-probe trigger occurs. Then continue with block 5, the
Playground message limit, and block 6, small own-repo fixes. Resolve the owner product-loss margin
before a later paired QA promotion.
