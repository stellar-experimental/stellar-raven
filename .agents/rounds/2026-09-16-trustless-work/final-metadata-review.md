# PR157 final metadata review

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T20:46:59Z`.
Worktree: `/tmp/raven-execution-2026-09-16/pr157-integrated`.
Author freeze: `/tmp/raven-execution-2026-09-16/pr157-integration-report.md`.

Staged binary SHA-256 **matches**: `91a7152767ab85af37b45601dc836c7eb34f45729b3e2ad8354ea273fda2e0c7`.
Index has 40 staged files. Working tree matches the index (0 unstaged bytes). `HEAD` is `a83b3c59` (PR #164). `MERGE_HEAD` is `b447ff403`.

## 1. Paid-plan contract

**Keep the frozen 500-ID paired-collection contract. Do not retarget it in this merge.**

Activating the 501st golden does **not** change `ACTIVE_CORPUS_COUNT`. That constant freezes **all** active IDs in an authorized paid plan, not a sample drawn down from a larger corpus. A future collection on the 501-case battery needs either:

- the runner tree frozen when the corpus was 500, or
- a newly reviewed plan and canonical plan hash for 501.

It does **not** use the existing sampler to shrink 501 IDs to 500. That earlier suggestion is withdrawn.

These four files are absent from the staged diff and match `HEAD` / PR #164:

- `.agents/skills/run-evals/SKILL.md`
- `eval/qa/README.md`
- `eval/qa/paired-collection-supervisor.mjs` (`ACTIVE_CORPUS_COUNT = 500`)
- `test/qa-paired-collection-supervisor.test.mjs`

No runtime change to that contract belongs here. No new paid authority belongs here.

The **lifecycle** test may (and does) expect compiled 501 / `active: 501`. That is the live corpus size, not the paid plan.

## 2. Activation and gospel

Battery path: `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json`.
Proposed copy is gone.

`question`, `golden`, and `tags` match landed PR #164 (`a83b3c59` proposed file) field-for-field.

Activation:

- `state: active`, `reviewState: none`
- date `2026-09-16`
- author `Sol high`
- reviewer `Grok high` (distinct)
- ledger `.agents/rounds/2026-09-16-trustless-work-acceptance.md`
- evidence: independent-review.md, source-review.md, pin `634f32bd` / `sel:7c6d71f8eef2`

`rootCause` includes `eval-authoring` and `improvements/skills/sk-025-trustless-work-beta-auth-scope.md`.
`sk-025` cites the active battery path. File SHA-256 matches the freeze: `2947b48a…`.

Complete case file SHA-256 matches the freeze: `ae2378df…`.

## 3. Generated lifecycle counts

| Metric | Value |
|---|---|
| Compiled cases | 501, includes the TW id |
| Registry active / proposed / quarantined / retired | 501 / 0 / 0 / 0 |
| Reserved IDs | 501 |
| `cases.json` | `7d5e4dcce68faffdd51975b8421c5fa7c4b7040d2c003944e5674b6579827609` |
| `lifecycle-registry.json` | `4d355ebe52ef7d4cf0859713e23cb150908dcf7d92119639ef5dc03a9e494269` |
| `sample.json` | `f339010df2509509038e373d38a1cfbd59eed7e6972f8f119ab6dfc750afd77f` |

`test/qa-lifecycle.test.mjs` expects those 501 counts. That is required.

## 4. Routing gates

Numerical floors and `acceptedTotals` are unchanged: legacy 213/279/312, skills 16/23/23, holdout 10/22/26 with 11 forbidden.

Catalog fingerprint is `0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869` and matches disk. Other input fingerprints are unchanged. `eval/gates.json` SHA-256 matches the freeze: `d25251f2…`.

Measured totals may exceed floors (author: 213/280/314, holdout top-5 27). Do not raise `acceptedTotals`. Identity change remains 15 movements across 544 rows. Dump SHA `4e2ece4a…` unchanged.

Scout inventory remains 1.9.1.

## 5. Mandatory gates

Author recorded pass on compile, register, lint `--since a83b3c59 --stale --enforce-floors`, selftest, paired:validate, improvements index/lint/probes, routing `--gate`, pin-review, mirrors, typecheck, test, build, smoke, secrets scan, `git diff --cached --check`.

This lane did not rerun those commands and did not run paid work.

Two credentialed probes were inconclusive in the worker. Parent will run them on the existing host environment. They do not block this metadata verdict.

Filter commit `e1ea4ab` is not in this merge.

## Result

**Accept this freeze for the merge commit.**

Keep paid-plan 500. Keep routing floors. Keep PR #164 as first parent. Activation and `sk-025` backlink are present. Catalog fingerprint is updated in this candidate. No extra source-only commit.
