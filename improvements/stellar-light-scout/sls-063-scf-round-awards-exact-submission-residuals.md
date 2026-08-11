---
id: sls-063
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-11
upstreamTitle: Populate verified SCF round award records for remaining awarded projects
evidence:
  - 2026-08-11 https://stellarlight.xyz/api/openapi.json (API 1.8.41) defines scfRoundAwards as the official submission record per awarded round, including a published budget when available
  - 2026-08-11 production sweep of https://stellarlight.xyz/api/projects/search?scfAwarded=true used limit=100 and offsets 0, 100, 200, 300, and 400; it returned all 467 of 467 awarded rows and found 26 rows with non-empty scfAwardedRounds but scfRoundAwards []
  - 2026-08-11 official submission recheck matched the Scout slug and awarded round for 17 residual rows with published budgets; all 17 records are listed in this finding
  - 2026-08-11 predecessor sls-061 and Stellar-Light/stellarlight#767 cover seven earlier rows that now return populated scfRoundAwards; this independently verified residual does not rely on their prose
  - upstream issue filed 2026-08-11: https://github.com/Stellar-Light/stellarlight/issues/806
---

## Finding

The Scout project search returns 26 awarded projects with known award rounds
and an empty `scfRoundAwards` array. Seventeen rows have an exact official
submission identity and a published budget for an awarded round. The API
contract defines that submission as the per-round record for this field.

The affected rows are not one parser group. They include different award
rounds and both disclosed and undisclosed project totals. This prevents users
from reconciling the known award round to its published submission budget.

## Evidence

The full paginated sweep used `scfAwarded=true`, `limit=100`, and offsets 0,
100, 200, 300, and 400. The final page returned 67 rows. The five pages
reported a stable total of 467 rows.

For 15 included rows, `lumenloop.get_scf_submissions` returned an official
submission from the exact Scout slug. `usdc-swap` required its exact name or
the adjacent `usdc` lookup. TuCambio required semantic submission discovery.
Both recovery rows still contain the exact Scout slug in `linked_project_slugs`.
Every included round equals one in `scfAwardedRounds`, and every budget is published.

| Scout project | awarded round | official submission budget (USD) | Scout aggregate state |
| --- | ---: | ---: | --- |
| Allbridge (`allbridge`) | 23 | 100000 | undisclosed |
| Obsrvr (`obsrvr`) | 41 | 79999 | 79999 |
| Ibis (`ibis`) | 42 | 60000 | 60000 |
| Digibank (`digibank`) | 35 | 99000 | 99000 |
| Vottun (`vottun`) | 27 | 50000 | undisclosed |
| Utoken (`utoken`) | 35 | 31600 | undisclosed |
| USDC Swap (`usdc-swap`) | 26 | 50000 | undisclosed |
| Transfuse (`transfuse`) | 20 | 30000 | undisclosed |
| Stride (`stride`) | 33 | 120000 | 120000 |
| SStream (`sstream`) | 16 | 36000 | 36000 |
| Palremit (`palremit`) | 32 | 60000 | 60000 |
| Catalyst (`catalyst`) | 22 | 91800 | 91800 |
| Blade (`blade`) | 25 | 50000 | undisclosed |
| AutoAction (`autoaction`) | 29 | 50000 | 50000 |
| Wagelink (`wagelink`) | 24 | 50000 | 50000 |
| Unalivio (`unalivio`) | 32 | 18475 | undisclosed |
| TuCambio (`tucambio`) | 37 | 75000 | undisclosed |

Digibank also lists round 44. No exact official submission record was found
for that round. The correction must not infer that record.

The other nine residual rows are excluded from this finding. Trustswap's round
36 submission links to `teamfinance`. Merkl's round 41 submission links to
`merkle-science`, not `merkl`. TRAK's round 25 submission links to `devtrak`.
Trace's round 38 candidate links to `agtrail`. DEB's round 41 candidate links
to `simbolik`. USDC's round 43 candidate links to `vank`. PEN has no linked
project slug. Liqvid.xyz has no matching official submission record. Fastbuka
has linked records for rounds 38 and 44, but none for its awarded round 9.
These rows need separate identity evidence.

Reproduction:

```js
await scout.searchProjects({ scfAwarded: true, limit: 100, offset: 0 });
await lumenloop.get_scf_submissions({ slug: "obsrvr" });
await lumenloop.get_scf_submissions({ name: "USDC Swap" });
await lumenloop.find_similar_scf_submissions({
  query: "TuCambio remittances USDC LATAM",
  round: "SCF #37",
  limit: 50,
});
```

Page through offsets until `offset + meta.counts.returned` equals
`meta.counts.total`. For each empty row, compare the Scout slug and each
awarded round with the official submission identity, round, and budget.

## Recommendation

For every awarded project, populate `scfRoundAwards` when an official
submission has the same project identity and awarded round. Copy its published
budget and award type. Preserve an empty or partial record when the identity,
round, or budget is not exact. Do not infer a record from a similar name,
aggregate total, or different linked project.
