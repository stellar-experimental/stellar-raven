# Lead rulings on C1 (2026-10-28), from tmp/verify/c1.md

- S1: the victim-ordering rewrite (`indexes.slice()` and the dropped `intentCoverage` sort) has no
  measured effect (`c1b` = `c1` on all 544 rows, both sources). Drop it from C2 and later; keep the
  original victim ordering with `indexes.length < quota` unless a probe proves the rewrite is needed.
- T1: the per-service page quota (`test/search.test.ts:1039`, at most two Lumenloop entries on the
  controlled-vocabulary page) is a contract while other-service candidates with admission exist.
  A candidate that breaks it fails. The other three unit failures may get rewritten assertions with
  a stated reason; none may be deleted.
- Losses: Groth16 −top3 is accepted only under decision B (every other check must pass). Fresh x402
  −top5 is NOT accepted: it is the check-6 shape on a real row (five gated Scout entries 266–287
  block ungated Soroban Docs 399 at the 1.6 margin). Do not fix it by tuning
  `TIER_INTERLEAVE_MARGIN` for this row; a margin change needs evidence on all rows and probes.
- Off-corpus probes: the verify lane holds 159 probes (`tmp/verify/probes.json`). RWA captures
  9/20 implementation probes, hackathon ops capture 5/22 non-hackathon probes (Soroswap vs Aquarius
  → `compareHackathons` rank 1), and `locateSource` is rank 1 on "mainnet network passphrase".
  A candidate that claims check 8 must also reduce the RWA implementation-probe captures, not only
  the three controls. You may run `tmp/verify/probes.json` yourself.
- Clef is available (budget in the brief) if a build-time classification of routing text would make
  a mechanism general, for example tagging each `x-routing` phrase or `notFor` clause as
  discovery versus implementation intent and committing it as reviewed data.
