# Result wording delta verification

Date: 2026-08-31

## Verdict: PASS

The repair resolves the prior wording issue.
No unsupported closest-to-full-table claim remains in the active result wording.

The reconciliation file keeps the old wording only as quoted historical text.
It labels that text as `Original`.
It does not repeat it as a result claim.

## Required checks

| Check | Result |
| --- | --- |
| Grok L1 repair | PASS |
| Grok L2 repair | PASS |
| Unsupported closest-table claim | Absent from active wording |
| `m=0.10` interpretation | Limited to fewest gate failures and ranking changes |
| Blind top-five movement | Correct |
| Probe-vector hash in ledger | Present |
| Result files unchanged | PASS |
| Clause artifact unchanged | PASS |
| Code change evidence | None in this wording delta |

## Prior wording block

`finish-result-sol.md` now states:

> m=0.10 had the fewest routing-gate failures and fewest changed rankings among grids.

This statement is accurate.
Grid `0.10` has two routing-gate failures and 163 changed rankings.
The other grids have five, eight, and nine failures.
They have 346, 477, and 495 changed rankings.

The repair no longer calls grid `0.10` closest to the full acceptance table.
The final interpretation uses exact counts instead of a broad protocol claim.

## Grok L1

Grok L1 required exact protocol top-five wording.
The corrected statement says grid `0.03` and grid `0.06` increase blind top-five from 3 to 4.
That is correct.

Identity and grid `0.10` have blind top-five of 3.
Grid `0.03` and grid `0.06` have blind top-five of 4.
Original top-five stays 4 on every grid.
The repair does not treat this movement as a contract win.

## Grok L2

Grok L2 required the preflight probe hash in the ledger.
The shared ledger records this value with the result pins:

```text
d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b
```

The result JSON still omits this field.
That omission is the known local-result schema limit.
The ledger repair satisfies the requested record placement.

## Immutable evidence check

The local result inventory still has one query cache and one result JSON.
Their SHA-256 values remain:

```text
65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2
17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0
```

The clause artifact SHA-256 remains:

```text
e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4
```

The code and artifact inventory has no new delta evidence.
The reconciliation scope also declares no result, code, or artifact change.
I ran no model or referee command.
