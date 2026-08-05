---
id: sls-058
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-27
upstreamTitle: Reconcile project SCF funding metadata against official submission records
evidence:
  - eval round 2026-07-27 QA sample-30, results stamp 2026-07-27T22-32-31-variantA.json, case q-defi-streaming-payments-prior-art graded wrong with 2 wrong claims, both traceable to Scout structured fields
  - 2026-07-27 live production scout.searchProjects({ query "SStream", limit 5 }) returned scfAwarded false, scfTotalAwardedUSD null, scfAwardedRounds []
  - 2026-07-27 live production lumenloop.get_scf_submissions({ name "SStream" }) returned SCF #16, budget 36000, award_type "Legacy v4.0 Award", official submission recnfJhEt3t2QogUI
  - 2026-07-27 live production scout.searchProjects({ query "Fluxity", limit 5 }) returned scfAwarded true, scfTotalAwardedUSD 82750, scfAmountStatus "disclosed", scfAwardedRounds [21]
  - 2026-07-27 live production lumenloop.get_scf_submissions({ name "Fluxity" }) returned SCF #21, budget 68000, award_type "Legacy v5.0 Community Award", official submission recDXtqYuR8g9FMXt
  - independently re-executed by the round lead after the triage lane reported it; both contradictions reproduced
  - 2026-07-28 adversarial review added a third case: live scout.searchProjects({ query "WageLink" }) returned scfAwarded false / null / [] against an official SCF #24 award of 50000; re-verified by the lead the same day
  - 2026-07-28 Fluxity claim narrowed after review: scfCountBasis documents scfTotalAwardedUSD as an in-house reconstruction, so the defect is the missing reconciling basis, not an asserted wrong number
  - filed upstream 2026-07-28 as a new issue cross-referencing closed #511 (the linkage class survived that fix): https://github.com/Stellar-Light/stellarlight/issues/744
  - upstream https://github.com/Stellar-Light/stellarlight/issues/744 CLOSED completed 2026-08-03T19:41:48Z
  - fixed by openapi@1.8.31 plus a data backfill, NOT by the 1.8.32 contract-honesty release absorbed in the same drift pass; live changelog 2026-08-03 names the finding directly - "scfRoundAwards - each awarded round's official submission record (published budget + award type), the reconciling basis sls-058 asked for (openapi@1.8.31)"
  - author live re-check 2026-08-04 re-running the ORIGINAL trigger against production Scout - defect 1 cleared - SStream now scfAwarded true, scfTotalAwardedUSD 36000, scfAwardedRounds [16] (filed as false/null/[]); Wagelink now true, 50000, [24] (filed as false/null/[])
  - author live re-check 2026-08-04 - defect 2 cleared - Fluxity carries scfRoundAwards [{round 21, amountUSD 68000, awardType "Legacy v5.0 Community Award"}], the reconciling basis between the official round budget and the 82750 SCF-page total that the narrowed finding asked for
  - independent reviewer (Solo process 4209, distinct from the author) re-ran the same trigger the same day and reproduced all three, and confirmed no other open sls finding is closed by this release
  - resolution-blocking residual rechecked 2026-08-04: scfRoundAwards is still [] for sstream and wagelink while scfAwardedRounds is populated and the API contract says scfRoundAwards carries each awarded round's official submission record; retain this finding until legacy rows populate or a separately tracked successor owns that contract gap
---

## Finding

Scout's structured SCF funding fields disagree with the official SCF submission
records. There are two distinct defects, and they need separating.

**Defect 1 — award-linkage false negatives (the strong claim).** `sstream` is
reported as never SCF-funded (`scfAwarded: false`, `scfTotalAwardedUSD: null`,
`scfAwardedRounds: []`), while the official submission record shows it won
SCF #16 with a budget of `36000`. `wagelink` fails identically against an
official SCF #24 award of `50000`. These are flat contradictions with no
interpretation that reconciles them.

**Defect 2 — an unreconcilable aggregate (the weaker, narrower claim).**
`fluxity` reports `scfTotalAwardedUSD: 82750` with `scfAmountStatus:
"disclosed"` and `scfAwardedRounds: [21]`, while its only linked submission is
SCF #21 at `68000`. Scout's own `scfCountBasis` states that
`scfTotalAwardedUSD` is an in-house reconstruction that can legitimately differ
from SDF's submission-based counters, so **this is not asserted to be a wrong
number.** The defect is that no exposed field reconciles the two, while the
adjacent `scfAwardedRounds: [21]` invites a consumer to read the aggregate as
that round's award.

These are machine-readable fields on the primary discovery surface. An agent
that trusts them states false funding facts with no way to detect the error
from Scout alone — which is what happened in the eval case cited above.

The two defects need different fixes: the first is a missing linkage, the
second is a missing basis/label. Repairing totals alone would leave `sstream`
and `wagelink` broken.

## Evidence

All probes are free production operations; sstream/fluxity observed 2026-07-27 and
re-confirmed 2026-07-28, wagelink observed 2026-07-28.

| project | Scout structured fields | official SCF submission record |
| --- | --- | --- |
| `sstream` | `scfAwarded: false`, `scfTotalAwardedUSD: null`, `scfAwardedRounds: []` | SCF #16, budget `36000`, Legacy v4.0 Award, `recnfJhEt3t2QogUI` |
| `wagelink` | `scfAwarded: false`, `scfTotalAwardedUSD: null`, `scfAwardedRounds: []` | SCF #24, budget `50000`, Legacy v5.0 Activation Award |
| `fluxity` | `scfAwarded: true`, `scfTotalAwardedUSD: 82750`, `scfAmountStatus: "disclosed"`, `scfAwardedRounds: [21]` | SCF #21, budget `68000`, Legacy v5.0 Community Award, `recDXtqYuR8g9FMXt` |

Reproduction:

```js
await scout.searchProjects({ query: "SStream", limit: 5 });
await lumenloop.get_scf_submissions({ name: "SStream" });
await scout.searchProjects({ query: "WageLink", limit: 5 });
await lumenloop.get_scf_submissions({ name: "WageLink" });
await scout.searchProjects({ query: "Fluxity", limit: 5 });
await lumenloop.get_scf_submissions({ name: "Fluxity" });
```

Prevalence: 2 of 2 named project-funding assertions in the failing eval case
were wrong because of these fields; a third project (`wagelink`) was checked
independently during adversarial review and shows the same linkage false
negative. So the linkage defect is 2 of 3 projects checked. Projects were
reached through ordinary discovery, not adversarial selection. Broader
prevalence across the corpus was not measured and is the first thing worth
checking upstream.

`wagelink` matters for a second reason: it is named in the evidence of
Stellar-Light/stellarlight#511, which was closed as fixed. That fix verified
the awarded records, which by construction cannot surface a project whose
award linkage is missing entirely. The linkage class therefore survived it.

## Recommendation

Reconcile `scfAwarded`, `scfAwardedRounds`, and `scfTotalAwardedUSD` against
the official submission IDs on a per-round basis.

Cheapest fix first: repair the linkage for the affected slugs and add a
reconciliation check that fails when a project's SCF fields disagree with the
official submission set for the same canonical slug.

Better, if the data model allows it: keep a project-level lifetime aggregate
separate from per-round award amounts, and expose the per-round amount with its
official submission URL so a consumer can cite the round award rather than
inferring it from an aggregate. The existing `scfAmountStatus` and
`scfCountBasis` fields already acknowledge that SDF does not publish every
per-award amount; the same honesty applied per round would let an agent tell
"reconstructed aggregate" apart from "official round award" without a second
service call.

Consumer-side workaround currently required: cross-check every Scout funding
claim against `lumenloop.get_scf_submissions` before asserting it. That is an
extra service call per project and it only works for consumers who happen to
have both services available.
