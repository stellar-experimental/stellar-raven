# Review — lane E routing design pass

Reviewer: Claude Fable 5.1 (independent; did not author the change).
Directory: `/Users/kalepail/Desktop/raven-routing2` (uncommitted candidate 1, unchanged by this review).
Date: 2026-10-09.

## Verdict

**Reject** the candidate. The lane's rejection is correct. Checks 7, 8, 10, and 12 fail, and I
confirmed each failure against the raw routing JSON. No check is measured in a way that hides a pass.
No check marked PASS hides a fail. The design is general. The proposed TODO text is mostly accurate,
but it needs the changes in findings 1 to 5 before it is useful for the next attempt.

I did not edit repository files, commit, write to GitHub, or make paid model calls. I re-ran the
acceptance helper once; it rewrote `tmp/routing2/selected-main-acceptance.json`, and I restored the
original file from a backup. The restored file is byte-identical to the original.

## Question 1 — Is the rejection correct?

Yes. Evidence for each failing check:

| Check | Raw evidence | Result |
| --- | --- | --- |
| 7 | `baseline-main.json` vs `c1-main.json`: `q-defi-rwa-scf-similar` loses top3; `q-protocol-parallel-execution` loses cardHit5; `q-soroban-reentrancy` loses top3 and cardHit5. | FAIL confirmed |
| 8 | `scout.getRwaAssets` appears in the top five for four negative queries (ranks 5, 5, 2, 3). | FAIL confirmed |
| 10 | `c1-main.json` gate failures: legacy top1 224, top3 271, top5 316 (baseline 219/298/326, band ±3); holdout forbidden captures 16 (ceiling 10). Extended strict falls 93/111/117/16 to 84/100/116/10. | FAIL confirmed |
| 12 | `c1-fresh.json` vs `baseline-main.json`: blend 0010 to 0000; RWA overview 0111 to 0000; payroll 0111 to 0011; standards compare holds 011-. Fresh gate repeats the numeric failures. | FAIL confirmed |

`tmp/routing2/selected-reproduction-diff.txt` reports `{ total: 544, graded: 0, order: 0 }`, so the
final tree reproduces candidate 1. All 80 exact identities rank first (`exact-identities.json`).

Command used for the grade comparison:

```
node -e '…' # reads tmp/routing2/{baseline-main,c1-main,c1-fresh}.json and prints top1/top3/top5/cardHit5 per id
```

I also rebuilt the lane totals with my own harness against the current tree and the HEAD source. It
reproduces the legacy, extended, and skills counts exactly, so the eval numbers are not an artifact of
the lane's scripts.

## Question 2 — Is the design general?

Yes. I read the full source diff. I found no operation ID, question ID, query string, or tuned
token-length threshold in scoring, selection, or admission:

- `src/catalog/search-tokens.ts`: the `dApp` rule is an orthographic regex (`/^[a-z][A-Z][a-z]+$/`),
  and it covers `iPhone` and `eBay` the same way. The plural rules and `people`/`person` mapping are
  carried over from the previous `scoring.ts`.
- `src/catalog/vendor/search-scoring.ts`: one matcher for both tiers; whole canonical tokens supply
  coverage; partial tokens add rank only inside an anchored field.
- `src/catalog/scoring.ts`: alternatives come from `routingPhrases` by field provenance; schema
  `keywords` add a fixed delta (`5 * 4 * 0.4`) and never coverage.
- `src/catalog/search.ts`: the identity fallback requires every non-generic name component; the page
  selector weights gated candidates by the existing 1.6 margin.
- `src/catalog/extract-routing-phrases.ts`: the only field-specific rule keeps singleton `keywords`
  atoms; that is provenance, not an exception.
- `test/search-evidence-model.test.ts`: all fixtures are synthetic.

## Question 3 — Is the proposed TODO text accurate and useful?

The claims in the text are accurate. The text is not yet useful enough, for the reasons below.

### Findings

**1. Major — the acceptance helper does not produce the evidence it is credited with.**
`tmp/routing2/acceptance.mjs` computes checks 1 to 9 and 11 only. The saved
`selected-main-acceptance.json` also contains checks 10 and 12, with `—` escapes that the helper's
`JSON.stringify` does not emit. A re-run drops both checks and changes the serialization. The report's
"Checks run" table says the helper "wrote evidence" for the final verdicts. The verdicts for 10 and 12
are still correct (I verified them against the routing JSON), but their script provenance is missing.
Command: `node tmp/routing2/acceptance.mjs selected-main`, then
`diff <backup> tmp/routing2/selected-main-acceptance.json`. The next attempt must keep one helper that
produces every check it reports.

**2. Major — the proposed TODO text points at evidence that will disappear.**
`tmp/` is ignored (`.gitignore:43`). The text says "Evidence: `tmp/report-routing.md` and
`tmp/routing2/` in the routing lane worktree". When the worktree is removed, the evidence is gone.
Prior rounds keep evidence under `.agents/rounds/<date>-…/`. Copy the report, the design, the
summary, the two `selected-*` acceptance files, the six `c*-{main,fresh}.json` runs, and the three
`c*-source-diff.txt` files to a round folder, and point the TODO text there.

**3. Minor — check 8 wording hides what passes and what regresses.**
The five negatives named in the TODO (Friendbot, RPC, WASM, simulation, balance) all pass. The FAIL
comes from the three `it.fails` controls (issue #167) and from one existing passing assertion,
"Walk me through issuing a new custom token on Stellar from scratch."
(`test/drift-141-routing.test.ts:177`), which the candidate regresses to rank 5 with score 43. The
TODO text should say this, because the next attempt must not lose that assertion.

**4. Minor — check 7 has two conflicting contracts, and the text does not name which one applies.**
The fixture rows in `test/drift-141-routing.test.ts:25-55` and the corpus labels disagree for two
rows. `q-soroban-reentrancy` expects `stellarDocs.search_soroban_contract_docs` in the fixture and
service `scout` with card `scout_research` in the corpus. `q-protocol-parallel-execution` expects
`stellarDocs.search_docs` in the fixture and cards `stellar_docs_mcp|scout_research` in the corpus.
The helper requires both. The TODO text should state: "clean grades" means the baseline corpus grades
of the eight IDs plus fixture presence.

**5. Minor — a sibling capture on the fresh source is not recorded.**
On `c1-fresh.json`, `scout.analyzeHackathonSubmissions` reaches rank 4 on
`q-pc-sequence-numbers-ordering-replace`. This is the same defect class as the `reviewSubmission`
clause of check 12 (a hackathon operation on a non-hackathon question). The report only says
`reviewSubmission` cannot rank because the fresh manifest excludes it. Add this capture to the text, so
the later absorb recommendation (`analyzeHackathonSubmissions` broad) is tested against it.

**6. Minor — the regression cause is measurable and should be in the TODO text.**
The report says it did not isolate a component. The following evidence narrows it. Gated hits in the
legacy top five fall from 1192 to 308. Legacy rows with no gated hit rise from 35 to 179; extended
rows from 68 to 117. The strict whole-word coverage starves the gated tier, so ranking is decided by
the ungated score. The losses concentrate by service:

| Service (legacy) | n | top3 base → c1 | top1 base → c1 | cardHit5 base → c1 |
| --- | ---: | --- | --- | --- |
| scout | 95 | 79 → 63 | 47 → 44 | 68 → 54 |
| lumenloop | 60 | 39 → 25 | 12 → 12 | 26 → 23 |
| stellarDocs | 183 | 180 → 183 | 160 → 168 | 18 → 4 |

Docs service selection improves, but card precision falls everywhere, and Scout and Lumenloop lose
service selection. Three single-component reversions in a scratch copy each move legacy top3 by at
most four rows (prefix matches counted for coverage: 273; no ungated candidates on a full gated page:
273; flat routing vocabulary as an extra alternative: 275). So the regression is spread across the new
matcher semantics, not in selection or vocabulary alone.
Script: `<scratchpad>/tiers.mjs` with `<scratchpad>/head`, `abl1`, `abl2`, `abl3` source copies.

**7. Minor — holdout gains are not recorded.**
The candidate raises holdout passed 24 to 30 and top3 26 to 37, while forbidden captures rise 10 to
16. Eight new captures: `a-07-contract-audit-checklist`, `a-14-poseidon-merkle`, `b-07-sep24-fields`,
`b-16-wallet-usdc-refresh`, `c-03-rwa-month`, `c-05-oracle-pick`, `c-07-tipping-start`,
`c-18-dapp-invoke`. This is a useful signal: structured intent helps recall but admits captures.

**8. Nit — `routingKeywords` is built but scoring no longer reads it.**
`scripts/build-catalog.mjs` derives it from phrases; `src/catalog/scoring.ts` never uses it; only
the admission helpers in `search.ts:406-450` read it. Not wrong, but the manifest field doc should say
it is an admission field.

**9. Nit — `ARCHITECTURE.md` and `src/catalog/README.md` describe the failed working tree.**
That text must never reach a commit. It is fine while the lane stays uncommitted.

### Most promising direction for the next attempt

Change one mechanism at a time from the accepted baseline, and measure all 544 rows after each step.
Candidate 1 changed six mechanisms at once, so no component can be credited or blamed. Order:

1. Keep the accepted two-tier selector and the vendored gated coverage rule unchanged. Apply the
   whole-content anchor rule only to the ungated replica. The ungated path is where the `cs-001`
   short-token captures occur, so this step targets the defect without starving the gated tier.
2. Add field provenance for schema `keywords` (rank only, never coverage). This is the check 5 fix and
   it is independent of step 1.
3. Only then try per-phrase alternatives, and prefer candidate 2's coverage rule (a partial match
   counts after a whole-word anchor in the same field). On legacy it stayed closest to baseline
   (236/290/313/106) while candidates 1 and 3 fell further.

Keep the RWA and quality exclusions, the fresh-source hold, and the dApp override. Do not change
the routing baseline.

### Short-token TODO text

Accurate. The matcher returns null for all four weather and billing triggers
(`shortTokenControls` in the acceptance file). Keep `cs-001` open as written.

## Checks run

| Command | Result |
| --- | --- |
| `git diff` over the nine source files | Read in full; no per-op or per-question rule |
| `node tmp/routing2/acceptance.mjs selected-main` (with backup, then restore) | Exit 0; checks 10 and 12 absent from output (finding 1) |
| Grade comparison over `baseline-main.json`, `c1-main.json`, `c1-fresh.json` | Confirms checks 7, 10, 12 |
| Harness over HEAD source + HEAD manifest and over the tree | Reproduces 219/298/326 and 224/271/316 |
| Three scratch ablations | Legacy top3 273, 273, 275 (finding 6) |
| `tmp/routing2/selected-fresh-focused.log` | 9 failed, 59 passed, 3 expected failures |
| `.gitignore` | `tmp/` ignored (finding 2) |
