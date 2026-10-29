# Verification lane — final review, 2026-10-29

Reviewed: `tmp/impl/failure-analysis.md`, `src-scout.md`, and `src-titles.md`. I built both source-only
diagnostics myself from my Phase 0 copies, with no candidate code:

- `src-scout` = `src-fresh-nolocate` (Scout 1.9.111, pin `789c9061`, `locateSource` excluded) + the
  main Docs titles (666).
- `src-titles` = `src-main` + the fresh Docs titles (682).

For each one, I ran a build, routing with `--gate`, `accept.mjs` (both check-12 readings), and a
per-row diagnostic against baseline-main (`diag2.mjs`). I also ran the full unit suite, which the
analysis does not report. Spend in this lane for the whole round: USD 0.

## Verdict

**The failure analysis is accurate. I found one material omission (O1) and three smaller ones.**
Every number that I re-derived matches. The stop decision and the "no passing candidate" verdict are
correct.

## The two diagnostics, re-derived

| Claim | Verdict | Evidence |
|---|---|---|
| Both manifests and runs | CONFIRMED | 0 grade and 0 topHits differences from the implementation lane on 2 × 544 rows. The manifest SHA-256 values match |
| src-scout totals: legacy 220/298/326/112, ext 93/112/117/16, holdout 12/26/29/10 | CONFIRMED | `runs/scout-routing.json` |
| src-scout: 0 graded losses; 2 gains (StellarX top1, SCF-v7 top3) | CONFIRMED | `runs/srcdiag-diag.json` |
| src-scout checks: 5 and 8 fail, D1 check 12 passes, strict check 12 fails | CONFIRMED | `runs/scout-accept.json`. Check 5's real-entry probe now **passes**; only the synthetic part fails |
| src-scout D2 PASS: the same 7 hackathon rows, with no new row and no promoted rank | CONFIRMED against the **fresh** baseline | The same 7 rows and ranks, for example `q-comp-sep10-auth-role` at rank 2. See O2 for the main-baseline reading |
| src-titles: 0 graded changes, 2 order changes, check 6 fails | CONFIRMED | `runs/titles-accept.json`. The wallets-kit page loses `search_wallet_dapp_docs` |
| src-titles: D1 check 12 fails only on the Scout epoch | CONFIRMED | No cross-source loss, and the four named rows are unchanged. `freshEnough` is false at 1.9.61 |
| Clef total USD 0.56901984, 242 calls | CONFIRMED | 242 ledger lines sum to USD 0.569018 (rounding). No failed calls |

## Accuracy of the check table and the partial-result table

I checked every row that rests on my own runs:

- C2/`c4p` totals and the 3 / 4 baseline-loss rows.
- The Friendbot 219→212 vs 217 and OZ 448 < 1.6 × 281 causes.
- `c4n`: 12 / 11 gains, 0 losses vs `c4p`, extended cardHit5 17, D2 7→13 and 6→9.
- C5a on `c4p`: 16 added and 18 total; C5b: 22.
- D2 on the clean parent: 7→4 and 6→4, then 3.
- T1 and the C4 correction.
- The C6 D1–D3 summary.

**All CONFIRMED.** I did not review C3 (lead ruling), so the C3 numbers are not re-derived here.

## Omissions

**O1 (material). The Scout absorb alone breaks unit tests, including a frozen routing assertion.**
"supports a separate Scout and stellar-light pin absorb" rests on routing evidence only.

- The full suite on `src-scout` has **17 failures beyond the 5 environment failures** that my
  scratch `src-main` also shows (git-snapshot tests). `src-titles` adds 1 (a generated artifact).
- Most of the 17 are expected for an exposure change. They need regenerated artifacts and counts from
  the `package.json` scripts: the 60→62 operation counts, `op-classes.json`, the micro-map text, the
  signature stubs, and the drift fixtures.
- **Two are routing assertions on the unchanged scorer:**
  - `test/drift-141-routing.test.ts:270` (frozen) expects `page.total` 6 and gets 7.
  - `test/search.test.ts:1040` (the T1 test) has the same total, 6→7.
- Cause: on the controlled-vocabulary query, `analyzeHackathonSubmissions` and
  `searchHackathonBuilds` enter the gated pool, and `getRfps` leaves it. This is the same
  hackathon-interference class as the `q-defi-lumenloop-categories-vocab` row. It stays off the top
  five but grows the gated total.
- So a Scout-only absorb needs an owner decision on a frozen drift assertion. It is not a clean
  mechanical bump.

Evidence: `runs/{main,scout,titles}-fulltests.log` and `runs/*-fails.txt`.

**O2. The D2 PASS for src-scout is relative to the fresh baseline, not to production.** Production
runs main. Against main, the Scout absorb adds the 7 hackathon captures on non-hackathon questions
(ranks 2–5; SEP-10 at rank 2), and hackathon probe negatives go from 3/22 to 5/22. None of these is a
graded loss, but users will see the interference. State this next to "supports a separate absorb".

**O3. The capture cause is more specific than "generic … vocabulary", and it is own-repo work.**
For the 7 rows, the matched evidence comes from two sources:

- The input-schema **category enum values**, which the builder turns into entry `keywords`
  (`anchor`, `dex`, `rpc`, `indexer`, `off`, `others` on `analyzeHackathonSubmissions`).
- Generic tokens that the repo **extracts** from Scout's `exampleQuestions` into `routingKeywords` and
  phrases (`stellar`, `building`, `use`, `show`, and `pay` from "TollPay").

Scout's own `x-routing` keywords for these operations are specific ("hackathon trends", "share of
submissions"), and its `notFor` clauses are correct. I agree with "Real new upstream finding: none".
Recommend: record "schema enum values as admission keywords" in `.agents/TODO.md` as an own-repo
routing item.

**O4. Check 5 on src-scout.** The text says "Existing repair checks 5 and 8 still fail". That is true.
But the fresh Scout text alone removes the real-entry `hackathonBrief` defect (with `phase`: 30;
without: null on main, and equal on src-scout). Only the synthetic `has`⊂`phase` shape remains.
This is a small point in favour of the Scout absorb.

## For the lead

1. Accept the failure analysis with O1–O4 added.
2. Before any Scout-only absorb ships, the owner must decide on the frozen
   `drift-141-routing.test.ts:270` total (6→7) and the T1 total. Regenerate the remaining artifacts
   only through their scripts.
3. Keep the title absorb held (check 6), as the analysis says.

Evidence: `runs/{scout,titles}-{routing,manifest,accept}.json`, `runs/srcdiag-diag.json`,
`diag2.mjs`, and the full-suite logs above.
