# Bounded delta review — repaired `finish-plan-fable.md`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Source review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-finish-plan.md` (BLOCK)
Reconciliation: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-reconciliation-fable.md`
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-fable.md`
Status: complete. No model fetch ran. No model load ran. No preflight ran. No referee ran. This reviewer wrote only this file.

This delta does not authorize a fetch. It does not authorize the referee. The referee still waits for `review-grok-finish.md` PASS on the loader-and-preflight diff.

## Verdict

**PASS**

H1, H2, M1, L1, and L2 are repaired in substance. The asset-repair fetch is gone. This attempt has zero fetches.

The required contracts hold: fail-closed snapshot checks, preflight unset refusal, four-file loader presence checks before `pipeline()`, FS-cache isolation via `env.useFSCache = false`, one referee, and the same acceptance table as brief section 11.

No residual finding reopens an H, M, or L issue. No plan re-edit is required before implementation.

## Check method

All checks were free and read-only. The embedder did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Artifact bytes | 3,917,367 |
| `eval/vectorize/results/` | absent |
| Asset-repair fetch section | deleted; attempt has three parts |
| Fetch budget | `0` of every kind |
| `getCache` when `useFSCache` is false | returns `null` on Node (no custom cache, no browser cache); `checkCachedResource` then returns `undefined` |
| Acceptance vs brief §11 | same table |

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| H1 | repaired | The old section 5 fetch is deleted. Section 1 states zero fetches. Section 3 stop rule records `BLOCKED-ASSETS` on a failed copy, a missing source, or a gone worktree cache. `embedQueries` is named as never a repair mechanism because `pipeline()` probes `main`. Re-acquire needs a new reviewed fetch budget. Sections 6 and 10 repeat the zero-fetch rule. |
| H2 | repaired | Loader §4.2 step 1 verifies all four snapshot files and throws before `pipeline()`. Preflight §4.3 step 1 refuses unset, empty, or non-directory `RAVEN_VECTORIZE_MODEL_DIR` before model load, and step 2 hashes first. Section 5 makes that preflight a referee precondition. Section 2.1 documents the silent `{ exists: false }` tokenizer path. |
| M1 | repaired | Loader §4.2 step 3 sets `env.useFSCache = false` while the env var is set. That is one of the two reviewed mechanisms. With the FS cache off, `getCache` returns `null` on this Node runtime, so a stale `main`-key file cannot shadow the snapshot. |
| L1 | repaired | Section 3 uses `shasum -a 256 -c` over the four pinned absolute paths. It exits `1` on mismatch or a missing file. No `2>/dev/null`. No directory glob. |
| L2 | repaired | Sections 2, 4.2, and 4.4 state both vitest files import the embedder module transitively and never call `extractor()`. Env mutation lives inside `extractor()`. Test gates keep the variable unset. The 31-test count is `21 + 10`. |

## Required contracts

| Contract | Status | Plan evidence |
| --- | --- | --- |
| Zero fetches | hold | §§1, 3, 6, 10; no `embedQueries` repair command remains |
| Fail-closed snapshot checks | hold | §3 `shasum -a 256 -c` over the four pins; stop as `BLOCKED-ASSETS` |
| Preflight unset refusal | hold | §4.3 step 1; exit `1` before model load |
| Four-file loader presence checks before `pipeline()` | hold | §4.2 step 1, inside `extractor()`, before env mutation and `pipeline()` |
| FS-cache isolation | hold | §4.2 step 3 `env.useFSCache = false` |
| One referee | hold | §§5–6; no second invocation |
| Same acceptance contract | hold | §7 matches reviewed brief §11: 8/8 with 0/4; 11/11 with 0/9; legacy ±3 of 208/279/311; skills top-1 ≥16; holdout ≥10/22/25 with ≤11 forbidden captures; extended ≥90/109/117 with accept-either top-5 122/122; `q-protocol-version-history-list` strict top-1; every changed ranking and every new `scout.searchResearch` capture listed |

`FAIL` still needs completed readings. `BLOCKED` and `BLOCKED-ASSETS` consume no scored outcome. Identity abort stays a harness defect.

## What this PASS allows

- Copy the four pinned files to the flattened snapshot with the fail-closed hash check.
- Edit `eval/vectorize/embedder.mjs` behind `RAVEN_VECTORIZE_MODEL_DIR` per §4.2.
- Add `eval/vectorize/preflight-clause-model.mjs` and the package script per §4.3.
- Run the free gates in §4.4 with the env var unset.

Implement the preflight env check before any call to `embedQueries`. Prefer a dynamic import of the embedder after that check, so ESM static imports cannot run first.

## What this PASS does not allow

- Any fetch, including an asset-repair fetch.
- A clause-artifact rebuild.
- A `src/` change, a test-assertion change, or a frozen-contract change.
- The referee run. That run waits for `review-grok-finish.md` PASS on the loader-and-preflight diff.
