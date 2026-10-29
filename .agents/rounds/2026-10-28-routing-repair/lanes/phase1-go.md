# Phase 1 go (lead, 2026-10-28)

Both Phase 0 baselines agree on every hash, total, and verdict (impl and verify lanes).
Lead decisions for Phase 1:

D1. Check 12 reading. The TODO text is: the four regressions meet their main grades,
`reviewSubmission` does not rank on non-hackathon questions, and "the absorb needs only a
manifest-fingerprint re-baseline". The 2026-10-09 helper added "zero per-row grade changes in
either direction". The acceptance verdict for this round is: zero graded LOSSES between the paired
sources on all 532 graded rows; every gain is listed with its source-text cause; the four named rows
meet main grades; the numeric gates pass with only the fingerprint failure; `reviewSubmission`
stays excluded. The helper still prints the strict zero-change verdict next to it, so the final
review sees both. (Baseline: strict FAIL on two gains, loss-only PASS.)

D2. New tracked guard (reported for every candidate, must not get worse than baseline-fresh):
top-five appearances of `analyzeHackathonSubmissions` / `getHackathonSubmission` on rows that do
not ask about hackathons or builds (baseline-fresh: 7 such rows, rank 2 on `q-comp-sep10-auth-role`),
and of `locateSource` on rows that do not ask where something is defined in source (baseline-fresh: 6).
A general fix that removes these is a strong plus.

D3. `locateSource` exposure: default is exclude in the absorb (optional exclusion with the capture
evidence), unless the final candidate removes its poor-fit captures. Keep measuring it exposed.

D4. Check 8 verdict uses the published fixture (`test/fixtures/rwa-routing.ts` construction), as
defined. Also report the builder-emitted RWA entry (verify lane diagnostic 4: the fixture lacks
the schema `keywords`; exposed through the builder, RWA costs legacy top3 298→296 and enters 20
pages). RWA stays excluded unless the builder-emitted entry also passes check 8 and costs no
graded row.

D5. Owner decision B (option 1, conditional) as written in the ledger.

C1 = the admission-only schema-keyword variant plus the selector quota fix, as one step (TODO
"Next attempt"). Then iterate per the brief: one mechanism per step, all 544 rows on both sources,
up to six candidates. Short tokens (`approach`→`app` on the fresh wallet control; `is`, `an`,
`also`, `through`, `each`) and the three mixed RWA controls are the remaining targets. The
RWA `notFor` says "how to issue an asset or build a tokenization contract -> stellarDocs / skills";
a general use of `notFor` boundaries may matter for check 8.

After each candidate: write `tmp/impl/cN.md` and `tmp/impl/cN.patch`, then reply with one line
naming the file. Continue to the next candidate unless the lead says stop; the lead and verify lane
review in parallel.
