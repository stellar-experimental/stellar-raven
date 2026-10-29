# Verification lane — Phase 0 (independent baseline), 2026-10-28

Status: **complete.** Part A was written before I read `tmp/impl/phase0.md` or `tmp/impl/acceptance.mjs`.

## Summary

- **Agreement is total.** The manifest hashes match for main, fresh, fresh-nopin, and
  fresh-nolocate. All 4 × 544 rows have zero grade differences and zero topHits differences (IDs,
  order, and scores). The lane totals and gate failures match. All twelve verdicts match on both
  labels: main fails 5, 8, and 12; fresh fails 5, 6, 8, and 12.
- **No disagreement** on any number or verdict. I re-derived every causal claim I checked (below).
- **Decision needed before Phase 1 (D1).** The strict check-12 rule fails the baseline on two
  *gains* that come from the Scout source text. It does not depend on the scorer. Under that rule, a
  general scorer change can pass only by giving main the same two gains or by removing them from
  fresh. That pushes candidates toward row-targeted tuning.
- The helper is sound on integrity. It has eight scope defects (H1–H8), and none makes a check
  vacuous except the `reviewSubmission` clause, which is vacuous by design.

## Part A — independent re-derivation

### Method

- I made scratch copies with `git archive HEAD` (344d6af2) under `tmp/verify/src-<label>/`. Each copy
  has a local `git init` and `git add`. The build's alias-receipt guard needs `git ls-files`.
- `main`: tracked inventory and pins. Its rebuilt `catalog/manifest.json` is byte-identical to the
  tracked manifest (`033e277f…`).
- `fresh`: the frozen `tmp/fresh-inventory-2026-10-28/` (SHA256SUMS OK), plus the four pin files from
  `tmp/fresh-pin-2026-10-28/` (addendum 1). Exposure is the current policy, unchanged.
  `analyzeHackathonSubmissions`, `getHackathonSubmission`, and `locateSource` are exposed.
  `reviewSubmission` (optional exclusion), RWA, quality, and verify stay excluded.
- `fresh-nopin`: the same as `fresh` but without the pin files (addendum 1 diagnostic).
- Exposure diagnostics, not acceptance labels: `fresh-nolocate`, `fresh-review` (`reviewSubmission`
  exposed), `main-rwa`, and `fresh-rwa` (RWA exposed through the real builder).
- `node eval/run-routing.mjs --gate --dump-ranked …` runs in each copy. The results are in
  `tmp/verify/runs/<label>-routing.json` and the manifests in `<label>-manifest.json`.
- The helper is `tmp/verify/accept.mjs`. I wrote it from the TODO text and the 2026-10-09 step 1
  helper, and I did not read `tmp/impl/acceptance.mjs`. It checks that the saved manifest, the
  scratch build, and the routing run have the same SHA-256. It replays all 544 rows with the scratch
  scorer, and every row reproduced. It exits 1 on any failed check.

### Manifest hashes

| Label | SHA-256 |
|---|---|
| main | `033e277fd62ae71b1ad2ae5210cf5ff96bd0abe7e3727b3648d8d710a0ab6ba4` |
| fresh (with pin) | `0b345ab378a9ea1dc77dff5e97c1c2dabce14daa9ce0863b5a93dbe076b1c5a5` |
| fresh-nopin | `366fe63017a64cea9b5e3cb73fe5589db201c326db73a8d28b13852d09bad67e` |
| fresh-nolocate | `78925f4016463abab0871728f44892da1c919db3e1a85a257c0b41b99dfb7363` |
| fresh-review | `4b8bb77644bbe205364c407e05850bb7ceee8e63c7308df53861e9d15519c9ae` |
| main-rwa | `5ed9023084e0d7f6c923cb0879fb613b3181cdfb7de47f54b2d2de78d0a3ca4b` |
| fresh-rwa | `ea4aaf5876ec49b58a4beddf1aab36615f7b3759d33ada32d31612c59b060ecc` |

Scout counts: main 30 operations, fresh 33 operations.

### Lane totals

| Lane | main | fresh |
|---|---|---|
| legacy (338) top1/top3/top5/cardHit5 | 219/298/326/112 | **220**/298/326/112 |
| extended (122) top1/top3/top5/cardHit5 | 93/111/117/16 | 93/**112**/117/16 |
| skills (23) top1/top3/top5 | 17/23/23 | 17/23/23 |
| holdout (49) top1/top3/top5, forbidden, passed | 12/26/29, 10, 24 | 12/26/29, 10, 24 |
| `--gate` exit | 0 | 1 (manifest fingerprint only) |

`fresh-nopin` is identical to `fresh` on all 544 rows: zero topHits differences (IDs, order, and
scores).

### Twelve checks (baseline)

| # | main | fresh | Cause of failure |
|---|---|---|---|
| 1 | PASS | PASS | |
| 2 | PASS | PASS | |
| 3 | PASS | PASS | |
| 4 | PASS | PASS | Docs rank 2; hackathonBrief absent, with and without "use" |
| 5 | **FAIL** | **FAIL** | `has widgets`: the `phase` keyword raises the gated score 141→143 and the ungated score 25→35; `status phase value` scores 46 (expected null) |
| 6 | PASS | **FAIL** | `stellarDocs.search_wallet_dapp_docs` (565, backfill) leaves `q-tool-wallets-kit` on fresh; the known Docs-title effect |
| 7 | PASS | PASS | |
| 8 | **FAIL** | **FAIL** | The three deferred `it.fails` controls capture RWA; positives and ordinary negatives pass |
| 9 | PASS | PASS | |
| 10 | PASS | PASS | The fresh fingerprint failure is ignored by design |
| 11 | PASS | PASS | |
| 12 | **FAIL** | **FAIL** | Two per-row grade changes main→fresh, and **both are gains** (see below) |

Check 12 detail (a pair property, so main and fresh have the same verdict):

- Scout 1.9.111 is fresh enough (≥ 1.9.71).
- The four named 1.9.71 regressions (`q-defi-agentic-payment-standards-compare`,
  `q-defi-blend-alternatives`, `q-defi-rwa-overview`, `q-scf-funded-similar-payroll`) **have no
  losses** on 1.9.111. Upstream text changes since 1.9.71 appear to have removed them.
- The fresh numeric gate failures are none.
- The grade changes main→fresh are `q-defi-stellarx-what-is` top1 false→true and
  `q-edge-scf-v7-centralization-myths` (extended) top3 false→true. Both are gains. The
  `fresh-nolocate` run shows that both come from the Scout source text, not from `locateSource`.
- 66 of 544 rows change top-five order without a grade change.

So the only check-12 failure on the baseline is the strict "zero per-row grade changes" rule. It
fails on two improvements. **The lead must decide**: does check 12 forbid gains, or only losses?
The TODO says "the absorb needs only a manifest-fingerprint re-baseline". A legacy top1 change from
219 to 220 still fits the ±1% band, so a fingerprint-only re-baseline is possible. The step 1 helper
read the rule as zero changes in either direction.

### Diagnostics beyond the strict checks

1. **The check 12 `reviewSubmission` clause is vacuous while the operation is excluded.** With
   `reviewSubmission` exposed (`fresh-review`), it ranks in the top five on 12 rows. It is **rank 1
   on `q-pc-sequence-numbers-ordering-replace`** (the 1.9.71 finding persists). It is also rank 2 on
   `q-defi-phoenix-scf`, `q-scf-submission-lifecycle-deadlines`, and
   `q-holdout-c-12-blend-directory`. It costs legacy top3 298→297 and extended top1 93→92. Exclusion
   satisfies the clause; ranking does not. Keep it excluded.
2. **New hackathon operations capture non-hackathon rows on fresh** without a grade change, so check 12
   does not see them:
   - `analyzeHackathonSubmissions` is rank 2 on `q-comp-sep10-auth-role` ("What is SEP-10 and why
     does an anchor need it…"), rank 4 on `q-infra-anchor-platform`, rank 4 on
     `q-holdout-b-14-compliance-backfill` (Horizon/RPC/Hubble backfill), and rank 5 on
     `q-defi-agentic-payment-standards-compare` and `q-defi-soroswap-what-is`.
   - `getHackathonSubmission` is rank 4 on `q-defi-phoenix-scf`, rank 5 on
     `q-eco-pyusd-stellar-freshness`, rank 2 on `q-scf-hackathon-detail-results` (plausible), and
     rank 5 on `q-scf-hackathons-active` (plausible).
3. **`locateSource` exposure evidence.** It is in the top five on 7 rows:
   `q-protocol-simple-lookup-no-deep-research` (rank 2, "what's the Testnet network passphrase?"),
   `q-sep-1-toml` (3), `q-soroban-contract-build-verification` (3), `q-tool-smart-wallet-repos-discovery`
   (3), `q-tool-cli-skills-discovery` (5), and `q-skill-assets-stablecoin-issuance` (5). Exposed versus
   excluded (`fresh-nolocate`): **zero graded changes on all 544 rows**. The rank-2 passphrase capture
   is a poor fit. It costs no grade because the expected Docs operation stays rank 1.
4. **Check 8 tests a fixture, not the entry that exposure would emit.** `test/fixtures/rwa-routing.ts`
   matches the builder's RWA entry on `description`, `routingKeywords`, `routingPhrases`, and
   `routingExclusions`. It has **no schema `keywords`** (the builder emits 28–29), and its
   `inputSchema` differs. With RWA exposed through the real builder (`main-rwa`, `fresh-rwa`):
   - Check 8 gives the same verdicts: the positives reach ranks 1–2, the negatives stay out, and the
     deferred controls capture at ranks 3, 2, and 1.
   - The corpus cost is large: legacy top3 298→296, top5 326→325, cardHit5 112→110, and extended top1
     93→92. RWA enters the top five on 20 rows. That includes `q-holdout-a-15-resource-profiling`
     (rank 2), `q-infra-horizon-deprecated` (4), and `q-ti-historical-pointintime-balances` (4).
   - **A check 8 pass on the fixture does not prove that RWA exposure is safe.** Before the RWA
     exposure decision, measure the builder-emitted entry on all 544 rows.
5. **Check 5 on real data.** On main, removing `phase` from `scout.hackathonBrief` keywords changes
   its gated score on "which project has a grant" from 30 to null. This is the `has`⊂`phase` defect
   on a real entry. The fresh source shows no such difference. The synthetic probe fails on both.
6. **Check 2 is narrow.** The test and the TODO wording ("cannot route alone") are checked only
   against `scout.searchResearch`. Alone, `through` gates `lumenloop.list_documents` and
   `skills.stellar-dev.agentic-payments`. `each` gates five operations (`lumenloop.get_categories`,
   `get_project_tags_vocabulary`, `get_scf_submissions`, `stellarDocs.get_doc_page_sections`, and
   `search_doc_titles`). `network` gates five Docs and Lumenloop operations, which is arguably
   legitimate. These are the same short-token triggers as `is`, `an`, and `also`. Report them as
   diagnostics; they are not a defined check.
7. **Check 1.** The cap-6 probe passes. A stronger probe passes on both sources: older yieldblox and
   reflector phrases mid-field, then 30 long new sections at the default cap 256.

### Addendum 1 — pin effect and ADR-0003 leak check

- **Pin effect.** Against `fresh-nopin`, the pin changes 17 manifest entries, all
  `skills.stellar-light.stellar-scout*`. 16 of them are `searchable: false` sections. The `transport`
  changes on every entry (the pin SHA), and the `description` changes on two file sections
  (`api-reference.md` and `examples.md`). The one searchable entry (the whole skill) changes only
  `transport`. The other 206 entries differ only in `provenance.fetchedAt`. **Zero routing
  changes on all 544 rows.** The pin is routing-neutral.
- **Leak check.** I ran the runtime `scrubNonExposedRefs` (`src/skills/scrub.ts`) over all four
  pinned files at `789c9061` from the verified cache (`tmp/verify/leakcheck/`). The policy variants
  were "as measured" (`locateSource` exposed) and "`locateSource` excluded". No file throws.
  **No non-exposed Scout path or operation name survives** in either variant. The raw
  `api-reference.md` names `/api/hackathons/review`, `/api/rwa`, `/api/quality`, `/api/verify`,
  `/api/feedback`, and `/api/repos`. The scrub removes each block. The pin text never names
  `/api/sources/locate`, so the `locateSource` choice does not affect leaks. The fresh manifest also
  contains none of the non-exposed paths or names. The scrub keeps the `/api/hackathons/builds/{id}`
  and `/api/hackathons/analyze` sections, which matches the planned exposure.
- **Caveat.** If `reviewSubmission` were exposed, the scrub would keep its section. That case is
  measured only for routing (`fresh-review`).

## Part B — comparison with the implementation lane

### Agreements (re-derived, not copied)

| Item | Result |
|---|---|
| Manifest SHA-256, 4 labels | identical |
| Per-row grades and topHits, 4 × 544 rows | 0 differences |
| Lane totals, gate failures, routing exit codes | identical |
| Twelve verdicts, main and fresh | identical |
| Check 5 numbers (141→143, 25→35, 46) | identical |
| Check 6 cause: fresh `search_soroban_contract_docs` gains the keywords `approach` and `sponsorship`; `approach` matches `app` from `dApp`; the operation fills rank 5 at gated 178 and `search_wallet_dapp_docs` (565) drops | confirmed in the manifests |
| Check 8: the deferred controls rank 3, 2, 1 | identical; the builder-emitted entry gives the same ranks |
| Check 12: two gains (`q-defi-stellarx-what-is` top1, `q-edge-scf-v7-centralization-myths` top3); the four named rows have no losses | identical |
| Hackathon captures (nine appearances) and the six `locateSource` pages | identical sets and ranks |
| `locateSource` exposed vs excluded: zero grade changes | identical |
| Pin: zero changes on 544 rows | identical |
| Skill-read leak audit: no non-exposed path or name survives, for both `locateSource` choices | agree (I used a separate method: the runtime scrub over the cached pinned files) |
| 2026-10-09 main → current main: 0 graded, 0 topHits differences | confirmed against `tmp/evidence/.../routing3/baseline-main.json` |
| 2026-10-09 fresh → current fresh: 5 recovered rows, 83 topHits differences | confirmed; the same five rows |

### Disagreements

None on numbers or verdicts. Two notes on interpretation:

- **`locateSource` recommendation.** The implementation lane recommends exclusion. I agree that the
  captures are poor fits; the clearest is rank 2 on "what's the Testnet network passphrase?". The
  exposure costs zero graded rows, though. So the evidence for exclusion is interference, not
  regression. The lead should record it that way.
- **Check 12 four-row basis.** The helper compares the four rows `baseline-main → cN-fresh`. My
  helper compares `cN-main → cN-fresh`. They agree on the baseline. For candidates, the helper's
  basis is the stricter one, which is acceptable.

### Helper attack (`tmp/impl/acceptance.mjs`, `verify-run.mjs`)

Strengths that I checked:

- `verify-run.mjs` replays all 544 rows with the source tree's own grader.
- It hashes every input, every catalog, policy, skill, and script source file, and the scorer.
- It re-derives the gate failures independently.
- It freezes every `eval/*` and `test/*` input to the baseline-main hashes, so a candidate cannot
  weaken labels, cases, gates, or the drift test without failing the helper.
- **Check 6 is not vacuous.** I replayed the synthetic probe. Five weak Scout entries (gated 36 or
  21) fill the page, and the Docs entry (ungated 220) still enters it.

Defects and gaps, most important first:

- **H1. Check 12 strict rule: gains count as failures.** See D1. The baseline fails only on two
  gains. Lead or owner decision: either (a) keep zero changes in both directions, or (b) count only
  losses and require a cause for each gain. Under (a), every scorer candidate inherits this failure,
  whatever its merit.
- **H2. Check 10 "extended shows no regression" compares totals only.** `extendedLosses` compares
  lane totals. A candidate that loses one extended row and gains another passes.
  `extendedChangedRows` is recorded but does not gate. Fix: fail on any per-row extended loss
  against baseline-main (top1, top3, top5, cardHit5), or require a stated cause for each loss.
- **H3. No check bounds unnamed per-row losses against the baseline.** Legacy is checked only through
  the gate band, ±3 rows (`round(338 × 1%)`). Skills and holdout are checked only through their
  floors. Check 12 compares only cN-main with cN-fresh. A candidate can lose up to three legacy rows
  on both sources and still pass all twelve checks. `changedGradedRows` records the losses but does
  not gate them. Recommend: the lead treats any unexplained loss in `changedGradedRows` as a failure.
- **H4. The check 12 `reviewSubmission` clause is satisfied by exclusion.** The helper requires
  `!reviewExposed`, so the clause can never test ranking. The report says this honestly. My
  `fresh-review` measurement shows `reviewSubmission` at rank 1 on
  `q-pc-sequence-numbers-ordering-replace` and in the top five on 12 rows. Cite the pass as an
  exclusion pass only, and keep the operation excluded.
- **H5. New hackathon captures do not gate.** `analyzeHackathonSubmissions` is rank 2 on the SEP-10
  row and rank 4 on the Horizon/Hubble backfill holdout row. These appear only as diagnostics.
  Recommend a candidate-level diagnostic gate: no new hackathon-operation appearance on a
  non-hackathon row against baseline-fresh, and a list of every appearance.
- **H6. Check 8 tests a fixture, not the builder-emitted RWA entry.** The inline fixture has no
  schema `keywords`; the builder emits 28–29 of them. Through the real builder, RWA exposure costs
  legacy top3 −2, top5 −1, cardHit5 −2, and extended top1 −1, and it enters 20 corpus pages. A check-8
  pass does not prove RWA exposure readiness. Before any RWA exposure, run an exposure-variant build
  on all 544 rows.
- **H7. Check 2 tests only `scout.searchResearch`.** The TODO says "cannot route alone". Alone,
  `through` and `each` gate other operations (Part A, item 6). Report these as diagnostics, and do
  not count them as passes of the TODO wording.
- **H8. The frozen test hash conflicts with the Done criteria.** `verify-run` asserts that
  `test/drift-141-routing.test.ts` equals the baseline. The Done list removes its `it.fails` markers.
  Measure candidates with the frozen test, and make the marker removal a separate final step outside
  the helper's freeze, or add a recorded exception.

Minor points:

- Check 4 deletes "use " and leaves "can I it to reclaim…". This is harmless.
- Check 1 is a cap-6 synthetic. My stronger long-section probe also passes on both sources, so
  check 1 is not hiding a defect today.
- Check 6 `wholeWordDiagnostic`: five whole-word gated entries at 66 push out a Docs entry at
  ungated 220. Under the TODO wording, "strong ungated evidence competes with five weak gated rows",
  the definition of "weak" decides this case. The helper treats it as a diagnostic only. The lead
  should state that definition before Phase 1, so that candidates are not graded on a moving target.

### Requests to the lead

1. **D1:** decide the check-12 rule for gains (H1) before Phase 1.
2. Decide whether H2, H3, and H5 become gating in the helper, or stay as reviewed tables. My Phase 1
   reports will flag all three either way.
3. Record the `locateSource` evidence as interference without grade cost.

Evidence: `tmp/verify/runs/` (routing, manifests, `*-accept.json`, `variants.json`),
`tmp/verify/leakcheck/`, `tmp/verify/accept.mjs`, `tmp/verify/variants.mjs`, and
`tmp/verify/probe6.mjs`. Spend: USD 0, no model calls.

## Part C — response to the lead's decisions (`tmp/lanes/phase1-go.md`)

**No objection to D1–D5.** I have four conditions, so that the decisions do not leave gaps.

- **D1 (losses only, gains listed): accept.** The TODO text supports this reading: "meet their main
  grades" and "needs only a manifest-fingerprint re-baseline". Conditions:
  1. Name the basis for "main grades" now. I recommend **baseline-main**, not cN-main. Otherwise a
     candidate that loses a named row on both sources passes.
  2. D1 bounds only *cross-source* losses. It does not cover H2 or H3, which are candidate-versus-
     baseline losses within one source. Each loss in `changedGradedRows`, including per-row extended
     losses, needs a stated mechanism cause and the lead's acceptance. I will flag any loss that
     has no cause as DISPUTED.
  3. The two fresh gains raise legacy top1 from 219 to 220 and extended top3 from 111 to 112. That
     is inside the ±3 band. Still, the absorb commit will move `acceptedTotals` in `gates.json`,
     unless the lead deliberately leaves the totals stale. Then the change is more than "fingerprint
     only" in the literal sense. The ledger should say which of the two applies.
- **D2 (hackathon and locator capture guard): accept.** Freeze the row classification now, so that
  the target does not move between candidates. My reading of baseline-fresh:
  - **Hackathon, 7 rows:** `q-comp-sep10-auth-role` (2), `q-infra-anchor-platform` (4),
    `q-holdout-b-14-compliance-backfill` (4), `q-defi-agentic-payment-standards-compare` (5),
    `q-defi-soroswap-what-is` (5), `q-defi-phoenix-scf` (4), and `q-eco-pyusd-stellar-freshness` (5).
    The plausible rows are `q-scf-hackathon-detail-results` and `q-scf-hackathons-active`.
  - **`locateSource`, 6 rows**, as listed in Part A item 3.
  - I propose that "not worse" means all three of these hold: no new row; no rank improvement on an
    existing row; the count does not rise. My Phase 1 probes test the same guard off-corpus.
- **D3 (`locateSource` excluded by default): accept.** It matches the evidence: interference, zero
  grade cost. The leak audit is clean for both choices.
- **D4 (check 8 on the fixture; the builder entry gates RWA exposure): accept.** This is the outcome
  I recommended in H6. I will report both forms for every candidate.
- **D5 (decision B, option 1, conditional): accept.** The Groth16 skill is at holdout rank 3 on both
  baselines today. I will confirm that any rank-4 move is the *only* check-10 failure before the
  option applies.
- **C1 note.** `routingExclusions` (from `notFor`) already exist and run in `rejectsRoutingIntent`.
  A candidate that "uses notFor more" changes an existing mechanism. I will check that it stays
  general, with no RWA-specific phrase handling. I will also check that it does not reject the
  directory and stablecoin controls in `test/drift-141-routing.test.ts`.
