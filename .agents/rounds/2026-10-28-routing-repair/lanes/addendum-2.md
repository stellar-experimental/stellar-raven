# Addendum 2 (lead, 2026-10-28) — acceptance rules fixed before candidates are judged

1. Check 12 basis: the four named rows must meet their **baseline-main** grades on cN-fresh.
2. Per-row losses (verify H2/H3): every graded loss of cN-main against baseline-main and of
   cN-fresh against baseline-fresh, in every lane (legacy, extended, skills, holdout), needs a
   stated mechanism cause in `cN.md`. The lead accepts or rejects each one. An unexplained loss is a
   failure even when lane totals stay inside the gate band.
3. D2 guard, frozen classification from baseline-fresh. Hackathon interference rows (7):
   `q-comp-sep10-auth-role`, `q-infra-anchor-platform`, `q-holdout-b-14-compliance-backfill`,
   `q-defi-agentic-payment-standards-compare`, `q-defi-soroswap-what-is`, `q-defi-phoenix-scf`,
   `q-eco-pyusd-stellar-freshness`. Plausible: `q-scf-hackathon-detail-results`,
   `q-scf-hackathons-active`. `locateSource` interference rows: the six in phase0. "Not worse" means
   no new interference row, no rank improvement on an existing one, and no higher count.
4. Check 6 "weak gated" means gated only by prefix or substring matches, not by a whole query word.
   The whole-word synthetic stays a diagnostic.
5. H8: measure every candidate with `test/drift-141-routing.test.ts` frozen. Removing the
   `it.fails` markers (and the dApp override) is a separate final step after a candidate passes.
6. `gates.json`: if the absorb raises accepted totals through listed gains, the re-baseline moves
   the fingerprint and those totals; the ledger records it. No floor or band may fall.
7. Check 2 and the short-token triggers (verify H7): report `through`, `each`, `network`, `is`,
   `an`, `also`, `approach`→`app` gating on any entry as a diagnostic table for every candidate.
