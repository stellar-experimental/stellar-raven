# Independent final closeout review — protocol-history attempt three

Date: 2026-09-01
Reviewer: Grok 4.6 high
Author of closeout: Claude Fable 5 high
Verifier: Codex GPT-5.6 Terra high (`result-verification-terra.md`, `PASS`)
Fixed point: `7c2c2857df1ed3696ec863eef3d2da80332c609c`
Implementation commit: `24de12200c459ac0ce9ae91e7a4f39988429bf20`
Status: complete. The pair-score cache was not opened. The support referee was not rerun.
No model was loaded. No network call ran. This reviewer wrote only this file.

This review does not authorize a fourth attempt. It does not authorize a production edit.

## Verdict

**BLOCK**

The measured `FAIL` is authentic. The implementation hashes still match. No production
search file changed. `.agents/NEXT.md` and `.agents/TODO.md` correctly spend the box.

Two live eval README paragraphs still say attempt three is unused. Those sentences sit in
the same files this closeout just edited. A later agent can read them as an open slot.

Repair those two sentences. Then run one bounded delta of the documentation repair only.

## Evidence this review checked

All checks were free and read-only. The pair-score cache was not opened.

| Check | Result |
| --- | --- |
| `HEAD` | `24de12200c459ac0ce9ae91e7a4f39988429bf20` |
| Diff from `7c2c285` | 16 committed paths plus untracked `closeout-fable.md` and `result-verification-terra.md`; dirty closeout docs |
| `src/`, manifest, gates, frozen contracts, overlay, runners, attempt-one and attempt-two harnesses | no diff from `7c2c285` |
| `run-support-fit.mjs` SHA-256 | `fbc059e455f5685b2a3866e766462ef35a80aecc63ad346eceba663c1b3004b5` |
| Support test SHA-256 | `c2ee273d4c4682280ad6aff3c34c43d414e94459416687116a4437ab79af84b7` |
| `package.json` SHA-256 | `01b850a3f15d32c452ee113c72f590769c33132ad6e6ced76046a6a41201d8d1` |
| Local result SHA-256 | `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c` |
| Retained result copy SHA-256 | same as local result |
| Result stamp | `2026-09-01T14-22-28-993Z-clause-support-fit-v1` |
| Result `experiment` | literal `clause-support-fit-v1` |
| Result `implementationCommit` | `24de12200c459ac0ce9ae91e7a4f39988429bf20` |
| Result `outcome` | `FAIL` |
| Calibrations | identity `PASS`; max-clause `PASS` |
| Focused tests | 18 passed in 1.37s |
| `git diff --check 7c2c285…` | no output |
| Attempt-two pair-score directory mtime | `Aug 31 19:37`; not opened |
| Fourth-attempt authority in NEXT/TODO | none; both forbid it |
| Brief leftovers of B1/B2/B3 overclaims | none |

## Measured result versus Terra and closeout

The saved result matches `result-verification-terra.md` and `closeout-fable.md`.

| Reading | Original top-1/3/5; captures | Blind top-1/3/5; captures | Changed | New captures | Gate |
| --- | --- | --- | ---: | ---: | --- |
| identity | 3/4/4; 1/4 | 3/3/3; 6/9 | 0 | 0 | pass |
| max-clause | 3/4/5; 2/4 | 2/2/3; 4/9 | 495 | 67 | fail |
| support-fit | 4/6/7; 2/4 | 5/6/10; 7/9 | 495 | 158 | fail |

Support-fit misses: `ph-protocol-upgrade-chronology`; `phb-auth-recursion-auditors`.
Support-fit original captures: `ph-control-current-protocol`, `ph-control-validator-vote`.
Support-fit blind captures: `phb-control-protocol-xdr-bug`,
`phb-control-contract-fail-after-upgrade`, `phb-control-incident-runbook`,
`phb-control-sdk-version-history`, `phb-control-kyc-breach-report`,
`phb-control-client-protocol-version-failure`, `phb-control-failed-deploy-post-mortem`.

Support-fit lanes: legacy 220/266/276; skills 18/20/20; holdout 22/35/41 with 19 forbidden;
extended strict 55/89/96; accept-either top-five 118; protocol-version top-1
`scout.searchResearch`.

Source pins in the result match the brief: cache `fa1252fc…`, scores `44c27468…`, record
`ecea4c69…`, 563 queries, 383,273 scores, clause artifact `e5f86644…`.

The outcome is `FAIL`. Attempt three is spent.

## What holds

- The write set is the reviewed instrument, its 18 tests, one package script, round records,
  and the four closeout documents. No `src/` file changed.
- `.agents/NEXT.md` ranks eval instruments first. Routing is block 3, trigger-only.
- `.agents/TODO.md` keeps the defect open. It forbids a fourth attempt. Triggers T1–T4 point
  at brief section 16. The "Done when" sentence is unchanged.
- T3 is an owner decision for a new box. It is not a fourth attempt in this box.
- No `improvements/` finding is filed. The data remains reachable.
- Prior review findings stay reconciled in the brief: B1–B3, R1–R4, D1–D6. The four
  implementation residuals remain non-blocking.
- The vendor prefix note is monitor-only under Eval instruments.

## Blocking finding

### C1 — Two live README paragraphs still say attempt three is unused

Severity: blocking

`eval/README.md` lines 1105–1108 still say "Attempt three of the box remains unused."
The next paragraph then records the spent `FAIL`.

`eval/vectorize/README.md` lines 263–264 still say "attempt three remains unused and needs
its own reviewed brief with a distinct mechanism." The next section is that completed
attempt.

`.agents/NEXT.md` and `.agents/TODO.md` already spend the box. These two leftover
sentences do not. A later agent that reads the eval README first can treat the slot as
open.

Repair: rewrite those two historical sentences to "attempt three is spent." Do not change
a number, stamp, hash, or production file.

## Residual findings

### C2 — Gate-failure lists omit protocol-version top-1

Severity: residual

The support-fit gate failures include
`q-protocol-version-history-list top1=scout.searchResearch`.
The ledger Outcome names that failure.
`.agents/TODO.md` line 78 names only legacy, holdout, and extended.
`eval/vectorize/README.md` lines 299–300 do the same.

The `FAIL` outcome is still correct. Add the protocol-version miss to those two lists.

### C3 — Ledger Outcome says Complete while this review was still pending

Severity: residual

The ledger Outcome section says "Complete." The same file also says the independent
closeout review remains before finalization. After this repair and delta, set Outcome to
Complete only when the closeout review passes.

## Prior findings

| Finding | Status |
| --- | --- |
| B1–B3, R1–R4 | remain repaired in `brief-fable.md` |
| D1–D6 | remain repaired; `review-grok-hold-delta-2.md` is `PASS` |
| Implementation R1–R4 | remain residual; none affects the measured `FAIL` |

## Required repair

Edit only the two stale README sentences in C1. Apply C2 in the same pass.
Do not open the pair-score cache. Do not rerun the referee. Do not edit `src/`.

Then request one bounded delta of those documentation lines.

## What this review does not change

The measured `FAIL` stands. The implementation commit stands. The spent-box rule in
`.agents/NEXT.md` and `.agents/TODO.md` stands. No fourth attempt is authorized.
