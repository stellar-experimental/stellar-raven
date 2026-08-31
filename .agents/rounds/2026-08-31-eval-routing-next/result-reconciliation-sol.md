# Result reconciliation

Date: 2026-08-31

Scope: `.agents/rounds/2026-08-31-eval-routing-next/finish-result-sol.md` only.

I made no result, code, README, TODO, NEXT, ledger, or artifact change.
I did not run a model or referee.

## Exact repair mapping

### Decision

Original:

> The `0.10` grid was the closest reading.

Replacement:

> m=0.10 had the fewest routing-gate failures and fewest changed rankings among grids.

### Grid `0.10` acceptance

Original:

> This reading was closest to the full acceptance table.

Replacement:

> m=0.10 had the fewest routing-gate failures and fewest changed rankings among grids.

### Final interpretation

Original:

> The closer grids preserved more routing quality but did not improve the protocol top-five counts.

Replacement:

> m=0.03 and m=0.06 increased blind top-five from 3 to 4.
>
> Original top-five stayed 4.
>
> All controls and routing gates still failed.

The repair preserves the measured `FAIL` outcome and all reported values.
