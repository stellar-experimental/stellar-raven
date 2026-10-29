# Lead rulings on C3 and the plan for C4–C6 (2026-10-28)

C3 is rejected. Legacy cardHit5 112→107, six paired-source losses, hackathon interference 7→14,
locator 6→8. Both sub-changes cause losses (attribution: `tmp/impl/c3-attribution.json`).

My E1 ruling was too loose. Correction: the scorer's canonicalization stays exactly as on main.
The Porter stem (or any fold) applies ONLY inside the C2 schema-support comparison
(`schemaAugmentedScore`'s "allowed" test). No alias, overlap, or scorer change.

Three candidate designs remain. Revised plan:

- **C4 (parent C2):** E1 scoped as above, E2, and a narrow T1 fix: the fill or backfill path may
  not take a service above its quota while another service has an admitted candidate for that slot.
  No other quota or selector change (no "admit under-quota services on full pages"). Measure as
  usual. Report whether x402, OZ, and Friendbot recover; do not add a mechanism for them in C4.
- **C5 (parent: best of C2/C4):** positive-coverage admission hygiene from
  `tmp/verify/design-check8.md` §3.4: (c) tokens present in more than half of the searchable
  entries do not count toward positive routing coverage (derived from the per-catalog frequency
  map, no word list); (d) tokens that occur only in `exampleQuestions` (not in `purpose`, `useWhen`,
  or `keywords`) add rank but do not count toward the admission threshold. Measure (c) and (d) as two
  steps, C5a and C5b, and report both; they count as one design.
- **C6:** the intent/object compatibility gate (§3.1–3.3), implemented by you, not by the verify
  lane (the verify lane authored the design and will review it). Before C6 code, produce the offline
  report (§4 step 1): labels, a committed deterministic classifier, accuracy on the held-out 149
  probes and a new held-out set, and a confusion matrix. The eval corpus never trains it.
  Clef spend for labeling is approved up to USD 3 total for C6 (estimate in §5 is about USD 1);
  log each batch in `tmp/impl/spend.md`. Shipping a serve-time classifier still needs the parent's
  approval after a measured pass; measuring it does not.

If C6 fails, write `tmp/impl/failure-analysis.md` per the brief: which checks fail, why, and what
the best partial candidate fixes.
