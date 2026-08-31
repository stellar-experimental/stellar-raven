# Finish-plan reconciliation — Grok review of `finish-plan-fable.md`

Date: 2026-08-31
Author: Claude Fable 5 high
Review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-finish-plan.md` (verdict BLOCK)
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-fable.md`
Status: every finding is reconciled in place. No model fetch, model load, preflight, referee, or
paid call ran. No implementation file or shared ledger changed.

| Issue | Severity | Disposition | Plan section |
| --- | --- | --- | --- |
| H1 | bug | Repaired by removal. The asset-repair fetch section is deleted. The plan now has zero fetches of every kind, and the budget table says so. A failed copy, a missing source file, or a gone worktree cache stops the attempt as `BLOCKED-ASSETS`. The plan records why `embedQueries` can never be a repair mechanism: `pipeline()` probes at revision `main` and cannot honor a four-file, pinned-revision budget. Re-acquiring assets needs a new reviewed authorization with its own fetch budget. | 1, 3, 6, 10 |
| H2 | bug | Repaired. The loader verifies all four snapshot files before `pipeline()` construction and throws a direct missing-asset error on any miss. The preflight refuses an unset, empty, or non-directory `RAVEN_VECTORIZE_MODEL_DIR` before any model import, and runs the four-hash check first among its checks. The preflight is a mandatory referee precondition. The silent-tokenizer path is documented: `get_file_metadata` returns `{ exists: false }` and never throws in local-only mode, so presence and hash checks — not `allowRemoteModels` — are the protection. | 2.1, 4.2, 4.3, 5 |
| M1 | suggestion | Repaired with the reviewed mechanism. While `RAVEN_VECTORIZE_MODEL_DIR` is set, the loader sets `env.useFSCache = false`, so `checkCachedResource` cannot let a stale `main`-key file in the package's default `.cache` shadow the snapshot, and nothing writes new cache entries. | 4.2 step 3 |
| L1 | nit | Repaired. The copy step is fail-closed: `shasum -a 256 -c` over the four pinned lines exits `1` on any mismatch or missing file. No stderr suppression. No directory in a hash command. The preflight repeats the same checks. | 3 |
| L2 | nit | Repaired. The plan now states that both vitest files import the embedder module transitively (`run-clause-fit.mjs`; `run-frontier.mjs` → `retrieval.mjs`) but never call `extractor()`. The env mutation lives inside `extractor()`, not at module load. Test and gate runs keep the variable unset. The 31-test (21 + 10) count stays. | 2, 4.2, 4.4 |

Corrected claims from the review's narrative sections:

- **Silent tokenizer.** Section 2.1 no longer claims `allowRemoteModels = false` makes every miss
  fail loudly. It splits the paths: `getModelFile`/`loadResourceFile` throw; the
  `get_file_metadata` probe returns `{ exists: false }` silently. The three `main`-revision
  discovery paths (tokenizer, config, processor) are named.
- **Copy verification.** The copy is now verified per file with pinned hashes and a fail-closed
  exit; the `main`-key `config.json` is explicitly excluded from the snapshot as a fifth file.
- **Test imports.** The false "tests do not import the embedder" claim is replaced as above.
- **Budgets.** The budget table now reads: paid calls 0; model fetches of every kind 0; artifact
  builds 0; referee invocations 1; preflight runs unbounded, local-only, never a reading.
- **Network claims.** The "no network by construction" wording is replaced: the preflight is
  local-only because the asset checks run first, `allowRemoteModels` is false, and the FS cache
  is off; any observed network attempt with the variable set is a loader defect and a stop.

Kept, per the review's authorization table:

- The snapshot copy of the fetch-1 files, run before any `npm ci`, outside every checkout.
- The env-gated loader edit on `eval/vectorize/embedder.mjs`; unset keeps the current
  `pipeline({ revision, dtype })` call for the frontier and build paths.
- The new preflight script and `package.json` script; the allowed and forbidden edit sets.
- One referee invocation reusing artifact `e5f86644…`; the acceptance table; the outcome labels;
  `BLOCKED` and `BLOCKED-ASSETS` consume no scored outcome; identity calibration abort is a
  harness defect.
- Retention: keep the harness, the artifact, and the snapshot until block 3 closes; results for
  30 days; `implementation-sol.md` stays as written.

Next action: the section 8 narrow review of the loader-and-preflight diff
(`review-grok-finish.md`). The referee run waits for that PASS. Nothing in this reconciliation
authorizes a fetch.
