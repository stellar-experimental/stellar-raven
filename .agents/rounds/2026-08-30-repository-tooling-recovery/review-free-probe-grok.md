# Independent review: repository recovery free probe

- Reviewer: Grok 4.6, high effort. Independent of the commit author.
- Date: 2026-08-31
- Mode: audit only. No repository file changed. No paid eval, deploy, push, merge, or second Wrangler process.
- Spec: commit `875edc7` only. Verify the two free probes against the recorded report and source findings. Confirm `sls-080` still reproduces and the freshness trigger did not fire. Confirm `sls-081` did not reproduce, never reached verified, and its active removal follows the improvements lifecycle. Check the ledger, `TODO.md`, `NEXT.md`, generated `INDEX.md`, the no-post-hoc rule, and the no-paid-rerun condition. Confirm no product or measurement change.
- Fixed point: commit `875edc7a933687e20e0e4fe4da0f4cb8895365cd` versus parent `ea6420f03f2a04a74aaf92b795f270b2d5d3d506e`.
- HEAD matches that commit. The worktree stayed clean after the checks.

## Summary

Commit `875edc7` is a record-only reconciliation of one approved free probe. Independent re-execution against the existing local server at port 8788 returned the same DeepWiki stamps and answers as `.agents/rounds/2026-08-30-repository-tooling-recovery/free-probe-2026-08-31.md`. `sls-080` still states `MaxSupportedProtocolVersion = 25` while pinned source defines `28`, so the freshness trigger did not fire. `sls-081` was `proposed` only; the live answer now includes the ancestor walk and the `<cwd>/.stellar` fallback, so the unverified candidate left the active queue without a resolved receipt. No product, ranking, receipt, catalog, corpus, golden, reviewer-guidance, or measurement-code file moved. The stored v2 result remains a FAIL. G1 is not applied.

## Issues

No blocking issues.

## Checklist

| Question | Result |
| --- | --- |
| Scope is commit `875edc7` only | Yes. Seven files. Parent `ea6420f`. HEAD `875edc7`. |
| Product or measurement change | None. Empty `git diff --name-only` against `src`, `catalog`, `eval`, `scripts`, `test`, ADR-0010, `package.json`, `wrangler.jsonc`. |
| Horizon probe matches recorded report | Yes. Same question, repo, `generatedAt`, `answerSource`, `scannedRef`, and value `25`. |
| `sls-080` still reproduces | Yes. DeepWiki still returns `25`. Pinned source at `82660510` and `2abda012` still defines `28`. |
| Freshness trigger fired | No. The trigger fires when the Horizon probe returns `28`. |
| CLI probe matches recorded report | Yes. Same question, repo, `generatedAt`, `answerSource`, and `scannedRef: null`. Answer includes ancestor search and `<cwd>/.stellar` fallback. |
| `sls-081` reproduced | No. The omission is absent from the live answer. |
| `sls-081` reached `verified` | No. Parent frontmatter is `status: proposed`. Resolver requires `fixed-upstream`. |
| Active removal follows lifecycle | Yes. Unverified candidate withdrawn from the active queue. No ceremonial upstream issue. No resolved receipt, as recorded. |
| Ledger, TODO, NEXT, INDEX | Match the probe, the stop rule, and 68 findings. INDEX is generated. Lint ok. |
| No-post-hoc rule | Held. Stored v2 FAIL is unchanged. G1 remains a v3 candidate only. |
| No paid rerun until Horizon returns `28` | Present in the probe record, ledger, `TODO.md`, and `NEXT.md`. |
| Focused gates | `improvements:lint` ok (68 findings). `git diff --check` clean. `secrets:scan --tree` clean. Tree remains clean. |

## Independent live probes

Method: existing local `workerd` on port 8788. Script `/tmp/repo_recovery_free_probe.mjs`, the recorded method. Two free `execute` calls. No second Wrangler process. No paid answering call.

The live payloads reuse the recorded DeepWiki `generatedAt` stamps. That is the cached upstream answer, not a new index.

### Horizon freshness (`sls-080`)

| Field | Recorded report | Independent re-run |
| --- | --- | --- |
| Question | Which Horizon ingestion constant pins the highest supported protocol version, and what is its value? | Same |
| Repository | `stellar/stellar-horizon` | Same |
| `generatedAt` | `2026-08-31T01:42:10.098Z` | `2026-08-31T01:42:10.098Z` |
| `answerSource` | `deepwiki` | `deepwiki` |
| `scannedRef` | `82660510ecda7fd365a14d08badb9d85fa22bc32` | `82660510ecda7fd365a14d08badb9d85fa22bc32` |
| Answer value | `MaxSupportedProtocolVersion = 25` | `MaxSupportedProtocolVersion` value is `25` |
| Trigger | Did not fire | Did not fire |

Pinned source still contradicts the answer:

- `https://raw.githubusercontent.com/stellar/stellar-horizon/82660510ecda7fd365a14d08badb9d85fa22bc32/internal/ingest/main.go` defines `MaxSupportedProtocolVersion uint32 = 28`.
- The same constant is `28` at `2abda012313e162d822fda44076893054a3b27a2`.

The finding already records those refs. The free-probe recurrence in `sls-080` matches this re-run: date `2026-08-31`, value `25`, full `scannedRef`, and “the freshness trigger did not fire”. Status remains `verified`. Recurrence count in generated `INDEX.md` is `2`.

### Stellar CLI local config (`sls-081`)

| Field | Recorded report | Independent re-run |
| --- | --- | --- |
| Question | How does local_config find the local Stellar CLI configuration directory, including the fallback when no ancestor contains .stellar or .soroban? | Same |
| Repository | `stellar/stellar-cli` | Same |
| `generatedAt` | `2026-08-31T01:42:31.077Z` | `2026-08-31T01:42:31.077Z` |
| `answerSource` | `deepwiki` | `deepwiki` |
| `scannedRef` | `null` | `null` |
| Disposition | Ancestor search and `<cwd>/.stellar` fallback | Same |

The live answer names the ancestor walk in `find_config_dir`, the helper error at filesystem root, and the caller fallback:

> If `find_config_dir` returns an error (meaning no `.stellar` or `.soroban` directory was found in any ancestor), the `local_config` function falls back to creating a `.stellar` directory directly within the initial current working directory.

Pinned source still has that caller fallback. Current `locator.rs` line 187 is `Ok(find_config_dir(pwd.clone()).unwrap_or_else(|_| pwd.join(".stellar")))`. `find_config_dir` in `utils.rs` at `0cc28fc` walks ancestors and returns an error only from the helper. The live DeepWiki answer now states both layers. The candidate omission does not reproduce.

The probe record correctly stores no recovery receipt and no full payload. This review recovered those payloads live and did not write them into the repository.

## `sls-081` lifecycle

Parent file `improvements/stellar-light-scout/sls-081-explain-repo-local-config-fallback-omission.md`:

- `status: proposed`
- `discovered: 2026-08-31`
- Body: stay proposed until a fresh free Raven probe reproduces the omission.

That probe did not reproduce the omission. The finding therefore never met the `verified` bar.

The improvements resolver refuses any status other than `fixed-upstream`. A never-verified candidate cannot enter `resolved.json` without a false status change. The skill also forbids a ceremonial upstream issue when the trigger does not reproduce. The honest path is withdrawal from the active queue.

This commit takes that path:

- Deletes the active file.
- Removes the `sls-081` INDEX row.
- Regenerates `improvements/INDEX.md` (lint byte-compares; 69 → 68).
- Records in the ledger: “The candidate never reached verified status, so it has no upstream report or resolved receipt.”
- Leaves no intake override and no probe frontmatter to drain.

That matches the proposed-candidate contract in the Fable plan (“status stays candidate until one fresh free probe reproduces the omission”) and the pipeline evidence bars. It is not the `fixed-upstream` drain, and it must not be.

Historical review files still name `sls-081`. Git history still holds the deleted file at `ea6420f`. Current-state `TODO.md`, `NEXT.md`, INDEX, and `resolved.json` do not keep an active record. The mechanical next-id rule (“maximum across the active tree and resolved ledger”) currently yields `sls-081` again because active+resolved max is `80`. That is a residual for the next Scout finding, not a reason to restore a false active defect. The next Scout id must be `sls-082`.

## Ledger, TODO, NEXT, INDEX

### Ledger

`.agents/rounds/2026-08-30-repository-tooling-recovery.md` adds “Approved free-probe reconciliation”. It points at `free-probe-2026-08-31.md`. It records Horizon `25`, the generatedAt stamp, the scanned ref, trigger not fired, the complete local-config answer, no resolved receipt, monitor-only Docs-versus-repository synthesis, no paid rerun until the Horizon probe returns `28`, and “This free evidence does not change the no-post-hoc rule or the stored v2 FAIL.”

The fifth-collection decision line now says “No paid rerun may occur until the Horizon free probe returns `28`” instead of a generic “no rerun now”. The 9-of-12 FAIL, the failure partition, and the G1-as-v3-only rule remain.

### TODO

`.agents/TODO.md` block 4 keeps the ranking trigger unmet (one selection miss) and the Docs-versus-repository monitor (three successful-recovery conflicts). It drops the stale “keep the fresh free probe for `sls-081`” sentence. It adds “No paid repository-recovery rerun may occur until the Horizon free probe returns `28`.” G1 stays a pre-registered v3 candidate only.

### NEXT

`.agents/NEXT.md` block 4 records the v2 FAIL, monitor-only synthesis, Horizon free probe value `25`, the complete local-config answer, and the same paid-rerun stop. The improvements count is `68`, which matches lint.

### INDEX

`improvements/INDEX.md` still says it is generated. Total findings `68`. `sls-080` recurrences `2`. `sls-081` absent. `npm run improvements:lint` reports `improvements lint ok (68 findings)`.

## No-post-hoc rule and no paid rerun

The Fable plan forbids a measurement change to the stored v2 contract. Regrading under G1 would be a post-hoc pass. This commit does not touch `eval/repo-recovery/cases.json`, `contract.mjs`, `grade-results.mjs`, ADR-0010, or any result artifact. The ledger still reports 9 of 12 positives and a failed gate. G1 remains a v3 candidate that needs an owner decision, new digests, and an ADR.

The pre-registered freshness trigger is a zero-cost `scout.explainRepo` probe for `stellar/stellar-horizon`. It fires when the answer states `28`. Independent re-execution still returns `25`. The stop condition is present in four current-state places: the probe record, the ledger, `TODO.md`, and `NEXT.md`. No paid collection is authorized by this commit.

## No product or measurement change

`git diff --name-only 875edc7^ 875edc7` is:

- `.agents/NEXT.md`
- `.agents/TODO.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery/free-probe-2026-08-31.md`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`
- `improvements/stellar-light-scout/sls-081-explain-repo-local-config-fallback-omission.md` (delete)

The probe script uses a host-issued recovery receipt to dispatch `scout.explainRepo`. That is the existing product path. This commit does not change it.

## Focused gates

- `npm run improvements:lint` — ok, 68 findings. Confirms INDEX bytes match the generator.
- `git diff --check 875edc7^ 875edc7` — clean.
- `npm run secrets:scan -- --tree` — clean.
- Worktree status after the live probes — clean. No file writes.

`npm test`, `typecheck`, and `build` were not required. This commit has no product, test, or catalog change.

## Residual

The next Scout finding id chosen only from `max(active, resolved)` would be `sls-081`. Git history and the v2 close reviews already used that id. Do not reuse it. Assign `sls-082`. This residual does not restore the withdrawn candidate and does not block this commit.

## Verdict

PASS
