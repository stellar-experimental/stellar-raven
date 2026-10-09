# Review — lane R2 (step 2: schema keywords as rank-only evidence)

Reviewer: Claude Fable 5.1 (independent; did not author the change).
Directory: the lane R2 worktree at `ef3843e3`. The tracked tree was clean before and after this review.
Date: 2026-10-09.

## Verdict

**Agree with the rejection. Agree that step 3 did not run.**

- Step 2 fails check 10 on both sources and check 11 on current sources. The baseline passes both. The stop rule therefore rejects step 2 and forbids step 3.
- I reproduced all four acceptance replays byte for byte. I also re-ran the step 2 current-source routing eval with the candidate scorer. All 544 rows match the author's saved run: zero grade, order, score, or target-rank differences.
- The baseline re-measurement matches the archived step 1 baseline. I diffed the archived acceptance files against the new ones after path normalization. Both are identical.
- The patch is general. It contains no operation ID, question ID, or routing-baseline change. Keywords can no longer admit an entry in either tier.
- The causal account is correct for the two failures that decide the verdict (check 10 holdout, check 11). It is wrong for three of the other changed rows. Those rows move because the candidate also changes the keyword rank magnitude for entries that other evidence admits (finding 1).
- The evidence does point to one clear next mechanism in the selector (finding 2).

I did not edit tracked files permanently, commit, push, or make paid calls. I copied two scorer variants into `src/catalog/scoring.ts` for one eval run each and restored the file with `git checkout`. I deleted only the two result files my runs created under the ignored `eval/results/`.

## Reproduction

| Claim | Method | Result |
|---|---|---|
| Tree clean | `git status --short`, `git diff --exit-code` | clean, exit 0 |
| Helper changed only its prefix and labels | `diff` of the archived helper and snapshot against `tmp/routing4/` | two lines each; identical to `helper-paths.patch` |
| `tmp/routing4/accepted/` equals HEAD | `diff -r` on `src/` and `inventory/` | identical |
| Fresh snapshot equals the step 1 snapshot | `diff -r tmp/routing3/fresh-inventory tmp/routing4/fresh-inventory` | identical |
| Candidate equals HEAD plus the patch | `git apply --check`, `patch` into a scratch copy, `diff` against `tmp/routing4/candidate/src/catalog/scoring.ts` | identical; the candidate tree differs from `src/` only in `scoring.ts` |
| Manifests | `cmp` | baseline and step 2 manifests are identical per source; the tree manifest equals `baseline-main-manifest.json` |
| Baseline matches the archive | my own normalized `diff` of the step 1 and routing4 baseline acceptance files | identical on both sources |
| Four acceptance replays | `node tmp/routing4/acceptance.mjs <label> [tmp/routing4/candidate]` | exit 1 each; JSON identical to the author's files |
| Step 2 routing run | candidate scorer in the tree, `node eval/run-routing.mjs`, `compare.mjs` against `step2-main.json` | 0 graded, 0 order, 0 score, 0 target-rank differences |

Verified check verdicts (identical to the report):

| Check | Baseline current | Baseline fresh | Step 2 current | Step 2 fresh |
|---|---|---|---|---|
| 1–4, 7, 9 | PASS | PASS | PASS | PASS |
| 5 | FAIL | FAIL | PASS | PASS |
| 6 | PASS | FAIL | PASS | PASS |
| 8 | FAIL (deferred controls only) | FAIL | FAIL | FAIL |
| 10 | PASS | PASS | FAIL | FAIL |
| 11 | PASS | PASS | FAIL | PASS |
| 12 | FAIL | FAIL | FAIL | FAIL |

Check 10 details match: holdout top3 25 below floor 26 on both sources; extended top1 93 to 92 and top5 117 to 116; the fresh label also leaves the legacy top3 band (294 against 298 ±3). Check 11: `lumenloop.get_categories` leaves the long category page on current sources only. Check 8: the deferred controls capture RWA at ranks 3, 2, and 1 on every label; positives and ordinary negatives pass. Check 12: seven changed rows between sources for the baseline, nine for step 2.

## Findings

### 1. Major — the report attributes every loss to page selection, but three loss rows come from the new rank magnitude

The report says "Changed-row traces confirm unchanged scores when both implementations omit keywords" and "This smaller admission change still causes unacceptable page selection." The traces support the first sentence. They do not support the second for every row.

From `changed-row-traces.json` (current source):

| Row | Grade change | Score change on an admitted entry | Cause |
|---|---|---|---|
| `q-holdout-a-05-groth16-soroban` | −top3 | `search_wallet_dapp_docs` gated 64 → null | admission loss, then short-page fill |
| `q-defi-lumenloop-categories-vocab` | −cardHit5 | `scout.getRfps` gated 94 → null | admission loss, then selection |
| `q-infra-hubble-vs-rpc-layer` | +top1 | `search_rpc_horizon_data_docs` gated 184 → null; ungated 445 → 451 | admission loss; the entry now competes at its full score |
| `q-soroban-oz-upgradeable-macro` | −top3 | `search_soroban_contract_docs` ungated 457 → 440 | rank magnitude only; 440 < 1.6 × 281, so it no longer interleaves above `searchResearch` |
| `q-ti-friendbot-ratelimit-alternatives` | −top5 | `search_wallet_dapp_docs` ungated 219 → 204 | rank magnitude only; falls below `search_directory` 217 |
| `q-ti-multisig-recover-lobstr-vault` | −top1 | `search_content_semantic` 359 → 375; `search_protocol_concepts_docs` 370 → 366 | rank magnitude only |

I confirmed the split with one bounded probe. I changed one condition in the accepted scorer so keywords can never admit (`hasSchemaEvidence` requires `base !== null`) and kept everything else. On current sources that variant changes only three graded rows: the Groth16 holdout row (−top3), the category row (−cardHit5), and the Hubble row (+top1). Extended stays at 93/111/117. The holdout gate still fails at top3 25. The category page and the Groth16 page are identical to step 2's pages. The OpenZeppelin, Friendbot, and multisig rows do not move.

So the candidate bundles three sub-changes: no admission, whole-token matching instead of prefix and substring matching, and a flat 8-point-per-token magnitude instead of the vendor blended delta. The measured regressions on the extended lane come from the third sub-change. The report does not say this.

Fix: state in the report and in the next TODO entry that the admission removal alone produces the two decisive failures, and that the magnitude change produces the three extended and legacy losses. The next attempt should measure the admission-only variant as its own step before changing the magnitude.

### 2. Major — the evidence suggests a clear next mechanism in the selector for check 11, and no rank-only keyword variant can pass check 10 alone

Both decisive failures recur under the admission-only variant. Both come from `src/catalog/search.ts`, which the patch does not touch.

Check 11, category row. The baseline page relied on `scout.getRfps` at score 94, admitted only through the schema words `category` and `categories`. With that junk row on the page, Lumenloop held exactly two slots, and `preserveIntentWithinServiceQuota` swapped `get_project` for `get_categories`. Without it, the gated page backfills a third Lumenloop entry (`search_content_semantic` 267) from overflow. The same-service branch then skips Lumenloop because `indexes.length !== quota` (3 ≠ 2). The cross-service branch also skips it because it requires `count < quota`. A vocabulary operation therefore cannot replace an over-quota service. That is a general selector gap, not a scoring gap. A general repair lets the vocabulary or structured-intent replacement fire when a service is at or above quota and replace the weakest same-service entry.

Check 10, Groth16 row. The baseline page was full only because `search_wallet_dapp_docs` entered the gated tier at score 64 through the schema words `proofs` and `soroban`. Without it, the page is short, the ungated fill admits `search_soroban_contract_docs` at 323, and the 1.6 interleave margin places it above `searchRepos` (196) and the ZK skill (164). The Docs entry outscores the skill on its own evidence. I do not see a general selector rule that keeps the skill at rank 3 without a new mechanism. This loss will recur in every rank-only keyword attempt. The owner should decide whether the holdout floor must absorb it or whether a skill-evidence change precedes step 2.

Note the Hubble row for the record. The baseline shows `search_rpc_horizon_data_docs` at rank 5 with a damped gated score of 184 while its ungated score is 445. Schema-only rescue puts strong entries on the page at weak scores. Step 2 fixes that, which is why the row gains top1.

### 3. Minor — "check 12 worsens from seven to nine rows" counts one gain as a worsening

The two added rows are `q-soroban-x402-auth-entry-signing` (fresh −top5, a real regression) and `q-defi-lumenloop-categories-vocab` (fresh cardHit5 false → true, a recovery on the fresh source). The stop rule already rejects step 2 on check 10, so the verdict does not change. The report should name the one real regression instead of the count.

The x402 fresh loss has the same shape as finding 2. Two Docs entries leave the gated tier (134 and 182, both schema-only). The 1.9.72 `getHackathon` fills the fifth Scout slot. The full-page rule then needs 1.6 × 266 = 425.6 to replace the weakest Scout row, and the Docs entry scores 402. On current sources the page stays short and the Docs entry still fills it.

### 4. Minor — check 10 on fresh labels compares the legacy band against current-source accepted totals

The fresh baseline scores legacy top3 295 and passes the ±3 band around 298 only because the source loss is small. Step 2 fresh scores 294 and fails the band. Relative to the fresh baseline that is one row. The helper inherited this from step 1 (prior review finding 2). It cannot make step 2 pass or fail wrongly here, because the holdout floor fails on both sources independently. Keep it in mind for a future candidate that moves a fresh legacy count by one.

### 5. Minor — the admission verification proves rank-only, not score preservation

`verify-keyword-admission.mjs` compares the candidate with and against without keywords for every keyword-bearing entry and query. It proves that keywords never flip admission and never lower a score inside the candidate. It does not compare the candidate against the baseline for admitted entries. The report sentence "Adding keywords lowers no independently admitted score" is true but incomplete: baseline-to-candidate scores fall on admitted entries (457 → 440, 219 → 204, 370 → 366). Fix: add a baseline-versus-candidate comparison over admitted entries, or state the magnitude change in the report.

### 6. Nit — helper changes are benign

`helper-paths.patch` is complete. The only edits are the evidence prefix and the accepted label pattern. The helper still verifies manifest hashes, lane membership, and recomputes every saved page from the given source root (line 177 asserts the recomputed ids and scores equal the saved hits). The candidate replay therefore cannot pass on stale results.

### 7. Nit — unit tests were not re-run by this review

The author's `step2-test.log` shows 22 failures. Five encode the old keyword behavior or the category page (`rescues an entry only matchable via keywords`, `weights curated routing vocabulary above lever-4 keywords`, two `drift-141` rows, one full-page total test). Those are expected under the candidate. The other 17 are `qa-paired-launch`, `qa-lifecycle`, `qa-corpus-lint`, and `qa-paired-verdict` timeouts and process checks that passed on the restored run. I did not re-run `npm test`; the verdict does not depend on it.

## Patch review against `src/catalog/scoring.ts`

- The patch deletes `matchingTokens` and the schema branch in `scoreWithKeywords`. Routing keywords keep their branch unchanged. Stopword rescue, aliases, and acronym rescue run without keywords.
- `addKeywordRank` wraps both entry points. It returns the admitted score unchanged when the pipeline returns null, so keywords cannot admit. It adds `round(count × 5 × 4 × 0.4 × kindWeight)` for distinct whole-token matches after plural canonicalization, over the original and alias forms. It uses no prefix or substring matching and no phrase bonus.
- Entries without keywords score identically to the baseline in both tiers. The schema branch was the only keyword consumer, and the new function returns early for them. The author's trace assertions confirm this on the changed rows.
- `search.ts` still counts `entry.keywords` in `discriminativeRoutingTokens`. The patch does not change that, which is correct for this step.
- No operation exception, question exception, or routing-baseline edit exists. The change is general. It is one design, but it bundles three measurable sub-changes (finding 1).

## Stop decision

Correct. The brief says to reject step 2 if it fails any check the baseline passes. Check 10 fails on both sources and check 11 fails on current sources. Step 3 must not run. The retained patch must not ship. The improvements on checks 5 and 6 (fresh) are real but do not override the rule.

## Commands run

| Command | Exit |
|---|---:|
| `git status --short`; `git diff --exit-code` (before and after) | 0 |
| `git apply --check tmp/routing4/step2.patch` | 0 |
| `node tmp/routing4/acceptance.mjs baseline-main` | 1 (expected) |
| `node tmp/routing4/acceptance.mjs baseline-fresh` | 1 (expected) |
| `node tmp/routing4/acceptance.mjs step2-main tmp/routing4/candidate` | 1 (expected) |
| `node tmp/routing4/acceptance.mjs step2-fresh tmp/routing4/candidate` | 1 (expected) |
| `node eval/run-routing.mjs` with the admission-only variant, then `git checkout -- src/catalog/scoring.ts` | 0 (advisory gate fail: holdout top3 25) |
| `node eval/run-routing.mjs` with the candidate scorer, then `git checkout -- src/catalog/scoring.ts` | 0 (advisory gate fail: holdout top3 25) |
| `node tmp/routing4/compare.mjs` (baseline → variant; author step 2 → my step 2) | 0 |

The four acceptance replays rewrote the author's `*-acceptance.json` files with identical content. I kept copies of the originals in my scratchpad and diffed them.
