# Lead rulings on C4 (2026-10-29), from tmp/verify/c4.md

- C4 as reported is rejected. The full-page block (F2) is outside the C3 ruling and causes every new
  cardHit5 loss; drop it.
- The short-page fill (F3, `c4n`) changes the effective quota on short and all-backfill pages from 6
  to 2, breaks the pure-order contract named by the unit test "keeps long technical all-backfill
  advice broad-only and ranking untouched", and causes all D2 growth. It is not part of the C6
  parent. You may report `C6 + c4n fill` as a diagnostic only.
- T1 correction: T1 fails on main in C1–C4. The cap at `test/search.test.ts:1039` held on main only
  because the spurious schema-only `scout.getRfps` admission filled the slot. Contract, restated:
  a service must not exceed its quota while another service has an admitted candidate for that
  slot. If a candidate's main page overflows only because no other-service candidate passes
  admission, the lead may accept a rewritten assertion with that reason. That acceptance is open
  until a candidate passes everything else.
- F4: in the E1 "allowed" test, skip query tokens in the existing `STOPWORDS` and tokens shorter than
  three characters (`one`→`on`, `ide`→`id`). F5: pin the `porter.ts` source version in its header.
  Keep the E2 vendor edit (minimal, header already says "adapted").
- **C6 parent = `c4p` + F4 + F5** (C2 + scoped Porter + E2; grades equal to C2). C6 adds the
  intent/object gate only. The intent gate is the bet for x402 and OZ as well: on x402 the blocking
  entries are gated Scout discovery entries (266–287) on a how-to query, and on OZ the 281 entry
  that the 448 Docs entry cannot beat at the 1.6 margin. Report whether the gate removes them.
- C6 validation set must include long, multi-clause questions (verify note: the D2 growth came from
  long corpus questions that produce short or all-backfill pages).
