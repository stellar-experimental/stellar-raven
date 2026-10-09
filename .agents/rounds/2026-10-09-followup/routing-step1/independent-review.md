# Review — lane routing3 (step 1: whole-content anchors in the ungated replica)

Reviewer: Claude Fable 5.1 (independent; did not author the change).
Directory: `/Users/kalepail/Desktop/raven-routing3` at `c4714fda`. The tracked tree was clean before and after this review.
Date: 2026-10-09.

## Verdict

**Approve the rejection and the stop decision. Approve the helper after changes.**

- The rejection verdict is correct. I reproduced all four routing runs and all four helper outputs byte for byte. Step 1 breaches the holdout capture ceiling (12 above 10), loses extended top1 (93 to 84), and drops the account-merge Docs fixture. Checks 7 and 10 fail on current sources, so the brief's stopping rule forbids step 2.
- The patch is general. It adds one field-admission rule to the ungated replica. It contains no operation ID, question ID, query string, or tuned token-length threshold. The gated tier, the coverage gate, the selector, and the keyword projection are unchanged. All 43,520 gated scores on current sources are identical to the baseline.
- The helper computes all twelve checks from saved results plus focused probes, and it verifies manifest hashes and all 544 recorded result lists. Eleven check verdicts are correct. Check 6 contains a mis-specified synthetic control (finding 1). That control fails on the unchanged baseline for a reason unrelated to the defect. The helper must be corrected before the next attempt reuses it. The correction does not change the step 1 verdict.

I did not edit repository files, commit, write to GitHub, or make paid model calls. I applied the patch and the fresh snapshot temporarily. I restored the tree with `git checkout`, restored the four acceptance files and the probe file from backups, and removed only the result files that my own runs created under the ignored `eval/results/`. Every file named in `tmp/routing3/receipt.json` still matches its recorded SHA-256 (51 files, 0 mismatches).

## Reproduction

| Run | My command | Result |
| --- | --- | --- |
| baseline-main | `npm run eval:routing -- --gate` on the clean tree | GATE PASS; `rdiff` against `tmp/routing3/baseline-main.json`: `{ total: 544, graded: 0, order: 0 }` |
| step1-main | `git apply tmp/routing3/step1.patch`, then the gate | GATE FAIL (`holdout forbidden captures=12 above ceiling 10`); `rdiff` against `step1-main.json`: 0 / 0; against baseline: 32 / 233 |
| baseline-fresh | `node tmp/routing3/snapshot.mjs fresh`, `node scripts/build-catalog.mjs`, then the gate | manifest `c81092b7…` matches the saved fresh manifest; fingerprint failure only; `rdiff` against `baseline-fresh.json`: 0 / 0; against baseline-main: 7 / 80 |
| step1-fresh | patch on the fresh build, then the gate | fingerprint failure plus the holdout ceiling; `rdiff` against `step1-fresh.json`: 0 / 0; against baseline-fresh: 30 / 230 |
| helper, four labels | `node tmp/acceptance.mjs <label>` | exit 1 for all four; every regenerated `*-acceptance.json` is byte-identical to the author's file |
| gated scores | `cmp tmp/routing3/baseline-main-gated.json tmp/routing3/step1-main-gated.json` | identical |
| short-token probes | `node tmp/routing3/short-token-probes.mjs step1` | exit 0; all 17 controls pass; the four gated triggers still score 27, 45, 27, and 55 |
| focused tests | `npx vitest run test/scoring.test.ts test/drift-141-routing.test.ts test/routing-evidence.test.ts test/extract-routing-phrases.test.ts` with the patch | 5 failed, 93 passed, 3 expected failures, as reported |
| typecheck | `npm run typecheck` with the patch | exit 0 |
| protocol history | `npm run eval:protocol-history` on the clean tree | exit 1; both v2 contracts report `source-expired` |

The report's numbers match the raw JSON: legacy 220/297/324/111, extended 84/111/116/17, holdout 12/27/30/12, legacy gated top-five count 1192 to 1194, rows without a gated hit 35. The check 12 target ranks match the report's table (standards compare 3 → 4 → 5; Blend alternatives 5 → absent → absent; RWA overview 3 → 4 → 4; payroll 3 → 5 → 5). `scout.analyzeHackathonSubmissions` reaches rank 3 on `q-pc-sequence-numbers-ordering-replace` on step1-fresh and is absent on baseline-fresh.

## Findings

### 1. Major — the check 6 synthetic control models strong gated rows, not weak ones

`tmp/acceptance.mjs:71-73` builds five Scout entries with description `alpha beta gamma` and one Docs entry with description `wallet dapp`, then queries `alpha beta gamma wallet dapp`. Each Scout entry matches three whole query words. The Docs entry matches two. The accepted selector (`src/catalog/search.ts:985-1021`, `preserveStrongBackfill`) replaces a gated row only when the candidate has greater intent coverage and a 1.6× score. By that rule the Scout rows are stronger, so the Docs entry correctly stays out. The check therefore fails on the unchanged baseline, and it will fail on every step of the three-step plan unless the selection policy changes. That change is outside the plan.

The defect named by check 6 is five gated rows that pass the vendor gate through prefix or substring matches. I ran the same synthetic with weak Scout descriptions:

| Scout description | Scout gated score | Docs ungated score | Page under the baseline | Page under step 1 |
| --- | ---: | ---: | --- | --- |
| `alpha beta gamma` (author) | 66 | 220 | five Scout rows; Docs absent | same |
| `alphabet betamax gammaray` (prefix only) | 36 | 220 | `docs.walletDapp` rank 1, then four Scout rows | same |
| `xalphax xbetax xgammax` (substring only) | 21 | 220 | `docs.walletDapp` rank 1, then four Scout rows | same |

So the accepted baseline already passes a correctly weak synthetic, and step 1 preserves that. The real controls in the same check (staking row, `q-tool-wallets-kit`) pass on current sources for both baseline and step 1. With a corrected control, check 6 passes on `baseline-main` and `step1-main`, and fails on both fresh labels only through the known `approach` → `app` prefix mechanism on `q-tool-wallets-kit`.

Required changes:
- Replace the synthetic Scout descriptions with text that passes the vendor gate through partial matches only, or move the whole-word variant to a diagnostic field that does not affect `pass`.
- Correct the report's twelve-check table and the proposed TODO text. The text "Checks 4, 5, 6, 7, 8, 10, and 12 fail on both sources" becomes "Checks 4, 5, 7, 8, 10, and 12 fail on both sources; check 6 fails only on the fresh source through the wallet control." The sentence "its failure identifies the existing selection policy" in Risks is wrong; the failure identifies the control.

Script: `<scratchpad>/synthetic6.mjs` (imports `src/catalog/search.ts` and `src/catalog/scoring.ts`, runs the three variants on `catalog/manifest.json`).

### 2. Minor — check 10 is uninformative on fresh labels

`tmp/acceptance.mjs:96` uses `measured.gate.pass`. On a fresh manifest the gate always carries the fingerprint failure, so check 10 reads FAIL on `baseline-fresh` even though its numeric gates pass and its extended lane has no loss (`baseline-fresh-acceptance.json`: check 12 `numericFailures: []`, `extendedLosses: []`). Check 12 already strips that failure through `numericFailures` (line 43). Use the same filter for check 10 when the label ends in `fresh`, or mark the fresh column "n/a (fingerprint)" in the table. The report's prose states the cause; the table does not.

### 3. Minor — check 8 bundles the three deferred controls into one verdict

`tmp/acceptance.mjs:89` lists eleven negatives. Eight are the committed passing assertions. Three are the `it.fails` controls that `.agents/TODO.md` defers to issue #167. The TODO's check 8 sentence names Friendbot, RPC, WASM, simulation, and balance; all of those pass on every run. The helper prints `rwaFailures`, so the distinction is visible in the log, but the table shows one FAIL for baseline and step 1 alike. Report the two groups separately, so a step that fixes the mixed controls (or regresses an ordinary negative) is visible in the table.

### 4. Minor — check 12 encodes "fingerprint-only re-baseline" as zero per-row grade changes

`tmp/acceptance.mjs:100,105` requires `gradeChanges(main, fresh).length === 0` over all 544 rows. `eval/gates.json` re-baselines on lane totals, the ±1% legacy band, the skills floor, and the holdout floors and ceiling. Zero row flips is stricter than the TODO sentence. The stricter rule matches repo practice for byte-change refreshes, so keep it, but say so in the helper comment and in the TODO text. Today the point is moot: the fresh source moves seven graded rows and three legacy totals.

### 5. Nit — check 8 reads the RWA fixture from the inventory on disk, not from the label's snapshot

`test/fixtures/rwa-routing.ts` builds `scout.getRwaAssets` from `inventory/stellar-light.json`. The helper loads the label's manifest from `tmp/routing3/<label>-manifest.json` but not its inventory. I ran `node tmp/acceptance.mjs baseline-fresh` with the 1.9.61 inventory on disk and with the 1.9.72 inventory on disk; both outputs are byte-identical, because `/api/rwa` carries the same summary, description, parameters, and `x-routing` in both versions. A later Scout version that rewrites the RWA routing text would make the fresh check 8 depend on which inventory happens to be present. Read the fixture inventory from `tmp/routing3/fresh-inventory/` for fresh labels, or record the inventory hash in the output.

### 6. Nit — check 1 is a controlled probe only

`baseline-main-acceptance.json` check 1 shows `retained: []` for both `yieldblox` and `reflector`: the accepted source holds no routing phrase with either token. The check passes through the cap probe (`extractRoutingPhrases` with a six-token budget) and the incident row's `scout.searchResearch` hit. The report says this. The TODO text should also say that check 1 cannot detect a real regression until a Scout source epoch carries those phrases again.

### 7. Nit — the check 4 baseline grade rests on a stopword partial match

`tmp/routing3/step1-main-trace.json` (merge row) shows that under the baseline the `id` and `name` fields of `stellarDocs.search_docs_in_category` score only through the query token `i` prefix-matching `in`. The field anchors in those fields are empty. Step 1 removes exactly that contribution (226 to 134), and the Docs row leaves the page. This is useful for the next attempt: the committed fixture `test/drift-141-routing.test.ts:73-79` requires presence, and that presence currently depends on a stopword partial. Record this in the TODO text so a later step does not treat the fixture as a clean target.

## Check-by-check verdict review

| Check | Helper rule | Verdict correct? | Note |
| --- | --- | --- | --- |
| 1 | cap probe retains both tokens; incident row reaches `scout.searchResearch` | yes | controlled evidence only (finding 6) |
| 2 | four generic queries exclude `scout.searchResearch` | yes | |
| 3 | `contract` excludes `scout.explainRepo`; the repository query includes it | yes | |
| 4 | both merge queries contain the Docs operation and exclude `scout.hackathonBrief` | yes | same contract as the committed test; step 1 fails through Docs absence, not briefing promotion (finding 7) |
| 5 | gated and ungated `has widgets` scores unchanged when `phase` enters keywords; schema-only generic query returns null | yes | baseline 141 → 143 gated, 25 → 35 ungated, generic 46; step 2 targets this |
| 6 | staking row, wallets row, synthetic page | **no for the synthetic** | finding 1 |
| 7 | eight fixture rows present and eight corpus IDs keep top1/top3/top5/cardHit5 | yes | step 1 keeps all grades; loses the account-merge fixture |
| 8 | four positives reach RWA; eleven negatives do not | yes, with a legibility gap | finding 3 |
| 9 | leaderboard and RFP probes plus two corpus rows | yes | |
| 10 | `gate.pass` and no extended strict loss | yes on main; uninformative on fresh | finding 2 |
| 11 | three category probes and one region probe | yes | |
| 12 | version ≥ 1.9.71, four target rows keep main grades, `reviewSubmission` unexposed and uncaptured, no numeric gate failure, no extended loss, zero source grade changes | yes | stricter than the TODO sentence (finding 4) |

The helper also asserts lane sizes `[338, 122, 23, 49, 12]`, identical row IDs across the four runs, the manifest SHA-256, and a live recomputation of all 544 result lists (`Stale result` guard at line 128). That guard makes a stale or mismatched scorer fail loudly. The helper rewrites its own `*-acceptance.json` on each run; all four re-runs were byte-identical, so the saved evidence is reproducible.

## Generality of the patch

`tmp/routing3/step1.patch` changes only `src/catalog/scoring.ts` (32 insertions, 24 deletions). The new rule in `scoreFieldUngated` requires one query token that is not a stopword to equal, after `canonicalRoutingToken`, one field token that is not a stopword. It uses the existing `STOPWORDS` set and the existing plural rule. It applies to all five fields equally. `acronymComparisonScorer` passes `requireContentAnchor = false` so the gated acronym comparison keeps the old ungated value. No identifier, query, or numeric threshold is added. The vendor file is untouched. The drift-guard comment is rewritten to describe the new contract; the matching test (`test/scoring.test.ts:238`) and the SAC test fail with the patch, as the report states.

## Stop decision

The brief allows step 2 only when checks 7, 9, and 10 stay green on current sources. Check 10 fails numerically (holdout captures 12 above the ceiling of 10; extended top1 93 to 84, top5 117 to 116). Check 7 fails through the account-merge fixture. Stopping after step 1 is the correct reading of the brief. The author restored the accepted scorer and sources, kept the patch and all results under `tmp/`, and did not edit `.agents/**`.

## Proposed TODO text

The routing item text is accurate except for the check 6 sentence (finding 1) and the missing notes from findings 4, 6, and 7. The short-token item text is accurate: the ungated entry points return null for all four triggers, the gated scorer still reproduces them, and `cs-001` stays open. The orchestrator must copy the helper, report, patch, summary, four result files, four acceptance files, and five diff files into a `.agents/rounds/` folder before the worktree is removed, because `tmp/` is ignored.

## Checks run

| Command | Exit | Result |
| --- | ---: | --- |
| `node tmp/acceptance.mjs baseline-main` | 1 | checks 5, 6, 8, 12 fail; output byte-identical to the saved file |
| `npm run eval:routing -- --gate` (clean) | 0 | GATE PASS; 0 / 0 against `baseline-main.json` |
| `git apply tmp/routing3/step1.patch`; `cmp src/catalog/scoring.ts tmp/routing3/step1-scoring.ts` | 0 | patch applies; file matches the retained copy |
| `npm run eval:routing -- --gate` (patched) | 1 | holdout ceiling breached; 0 / 0 against `step1-main.json`; 32 / 233 against baseline |
| `node tmp/acceptance.mjs step1-main` | 1 | checks 4, 5, 6, 7, 8, 10, 12 fail; byte-identical |
| `node tmp/routing3/short-token-probes.mjs step1` | 0 | 17 controls pass |
| `npm run typecheck` (patched) | 0 | |
| focused `npx vitest run …` (patched) | 1 | 5 failed, 93 passed, 3 expected failures |
| `node tmp/acceptance.mjs baseline-fresh` with HEAD inventory on disk | 1 | byte-identical to the saved file (finding 5) |
| `node tmp/routing3/snapshot.mjs fresh`; `node scripts/build-catalog.mjs` | 0 | manifest SHA-256 `c81092b7…` equals the saved fresh manifest |
| `npm run eval:routing -- --gate` (fresh) | 1 | fingerprint only; 0 / 0 against `baseline-fresh.json`; 7 / 80 against baseline-main |
| `node tmp/acceptance.mjs baseline-fresh` | 1 | checks 5, 6, 8, 10, 12 fail; byte-identical |
| `npm run eval:routing -- --gate` (fresh, patched) | 1 | fingerprint and holdout ceiling; 0 / 0 against `step1-fresh.json`; 30 / 230 against baseline-fresh |
| `node tmp/acceptance.mjs step1-fresh` | 1 | same seven failures; byte-identical |
| `node <scratchpad>/synthetic6.mjs` (clean and patched) | 0 | finding 1 table |
| `cmp` of the two gated score files | 0 | identical |
| `npm run eval:protocol-history` | 1 | both v2 contracts `source-expired` |
| receipt hash check over 51 files; `git status --short` | 0 | 0 mismatches; tracked tree clean |

## Delta re-review (fix round)

Reviewer: Claude Fable 5.1. Date: 2026-10-09. The tracked tree was clean before and after this re-review. I changed no file outside my scratchpad; the helper re-runs rewrote the four acceptance files with byte-identical content, and I restored them from backups anyway.

### Verdict

**Approve.** Findings 1 to 5 are fixed in `tmp/acceptance.mjs`. Findings 4, 6, and 7 are stated in the proposed TODO text. The scorer, the routing results, the grade changes, the rejection, and the stop decision are unchanged. All four helper labels reproduce the author's fix-round outputs byte for byte.

### Re-run

| Command | Exit | Failing checks | My file against the author's |
| --- | ---: | --- | --- |
| `node tmp/acceptance.mjs baseline-main .` | 1 | 5, 8, 12 | byte-identical |
| `node tmp/acceptance.mjs baseline-fresh .` | 1 | 5, 6, 8, 12 | byte-identical |
| `node tmp/acceptance.mjs step1-main tmp/routing3/fix-round/replay` | 1 | 4, 5, 7, 8, 10, 12 | byte-identical |
| `node tmp/acceptance.mjs step1-fresh tmp/routing3/fix-round/replay-fresh` | 1 | 4, 5, 6, 7, 8, 10, 12 | byte-identical |
| `node tmp/routing3/fix-round/verify.mjs` | 0 | 2176 result lists rechecked; 44 evidence files and 1962 tracked files unchanged | `verification.json` byte-identical |
| `node tmp/acceptance.mjs step1-main` (no replay root, HEAD scorer) | 1 | `AssertionError: Stale result q-anchor-moneygram-ramps` | the stale guard rejects the wrong scorer, as intended |
| `node --check tmp/acceptance.mjs` | 0 | | |
| receipt hash check over the updated `tmp/routing3/receipt.json` | | 227 files, 0 mismatches | |

Both replay copies carry the retained step 1 scorer byte for byte (`cmp` against `tmp/routing3/step1-scoring.ts`). Every other file under `replay/src` equals HEAD. `replay-fresh/src/policy/scout-exposure.ts` differs from HEAD only by the snapshot script's reorder of the `reviewSubmission` exclusion; the helper does not import that file.

### Finding-by-finding

| Finding | Fix in the helper | Verified result |
| --- | --- | --- |
| 1 (major) | Check 6 now requires the Docs candidate on two weak synthetic pages (`alphabet betamax gammaray`, `xalphax xbetax xgammax`); an assertion requires both Scout controls to pass the vendor gate; the whole-word page is recorded as `wholeWordDiagnostic` and does not affect `pass`. | Scout gated scores 36 and 21; Docs ungated 220 at rank 1 on both pages for all four labels. Check 6 passes on both main labels and fails on both fresh labels through `q-tool-wallets-kit` only. The report's table and the TODO text now say this. |
| 2 (minor) | Fresh labels filter the fingerprint failure through `numericFailures`; the output records `applicableGateFailures` and `manifestFingerprintIgnored`. | `baseline-fresh` check 10 passes with an empty applicable list; `step1-fresh` still fails on the holdout ceiling. |
| 3 (minor) | Check 8 reports `positives`, `ordinaryNegatives`, and `deferredItFails` as separate groups with separate pass flags; `pass` still requires all three. | 4 / 8 / 3 rows; positives and ordinary negatives pass on every label; the three deferred controls fail on every label. The report's row 8 shows the three verdicts. |
| 4 (minor) | A comment above `sourceChanges` states that zero per-row grade changes is stricter than the gates.json bands; the TODO text says the same. | Rule unchanged; documented. |
| 5 (nit) | The RWA fixture is built from the label's saved inventory (`accepted/inventory` for main, `fresh-inventory` for fresh) with the same construction as `test/fixtures/rwa-routing.ts`; the output records the inventory path, inventory SHA-256, Scout version, and entry SHA-256. | Main labels use 1.9.61 (`35a511f6…`); fresh labels use 1.9.72 (`a5ae479f…`). |
| 6 (nit) | TODO text states the controlled-evidence limit of check 1. | Present. |
| 7 (nit) | TODO text records the stopword `i` → `in` partial behind the account-merge fixture. | Present. |

The helper also stamps `source.scoringSha256`, and `verify.mjs` asserts it equals the HEAD scorer for baseline labels and the retained step 1 scorer for step 1 labels. That closes the provenance gap between a label and the scorer that produced it.

### Remaining notes (no change required)

- The helper's RWA fixture is now a copy of the construction in `test/fixtures/rwa-routing.ts`. If that fixture changes, the helper must follow it. A one-line comment already names the source file.
- Check 8's `pass` still requires the three deferred controls, so check 8 cannot pass until issue #167's controls are fixed. The separate group verdicts make that visible, which is what finding 3 asked for.
- The report's fix-round text, the twelve-check table, and the proposed TODO text are accurate against the regenerated evidence.
