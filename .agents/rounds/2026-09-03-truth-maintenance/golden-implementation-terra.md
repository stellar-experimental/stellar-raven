# Golden-truth implementation

Implementation date: 2026-09-03.

## Evidence recheck

- The SCF awards page showed #46 in Submission through 2026-11-08.
  It showed #45 in Panel Review and #44 ended.
- The Scout RFP response had `generatedAt` `2026-09-03T15:39:35.870Z`.
  It returned two RFP briefs and one synthetic `scf-round-46` row.
- The Scout skills response returned 43 rows.
  It retained the reported source and kind boundaries.
- GitHub advisory data returned the same three Soroban SDK advisories.
  No advisory was withdrawn.
- DefiLlama returned Soroswap Stellar TVL of about $1.19M.
  The historical maximum remained below $10M.
- The RPC page still calls the 200 limit hardcoded.
  The RPC source still exposes 200 and 50 configurable defaults.
- The Saved Keypairs page says obfuscated but not encrypted.
  The storage helper uses direct JSON serialization for SavedKeypair objects.
  The SavedKeypair type defines a `secretKey` string.
  The live UI says storage is unencrypted and unprotected.
- The Smart Contracts skill says Mainnet is on Protocol 26.
  Horizon reports Mainnet Protocol 27.

## Changed files

### Owned golden cases

- `eval/qa/corpus/battery/scf-grants-builders/q-scf-current-round.json`
- `eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-scf-round.json`
- `eval/qa/corpus/battery/scf-grants-builders/q-scf-open-rfps.json`
- `eval/qa/corpus/battery/scf-grants-builders/q-scf-rfp-tooling.json`
- `eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json`
- `eval/qa/corpus/battery/soroban/q-soroban-sdk-cve.json`
- `eval/qa/corpus/battery/edge-behavior/q-edge-factcheck-soroswap-first-amm.json`
- `eval/qa/corpus/battery/tooling-infra/q-ti-rpc-gettransactions-pagination-xdr.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-cli-skills-discovery.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-indexer-repos-discovery.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-leaderboard-open-issues.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-sdk-repos-discovery.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-skill-detail-install.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-smart-wallet-repos-discovery.json`
- `eval/qa/corpus/battery/protocol-core/q-pc-slp-0004-0006-status.json`

The five material edits, three date-only edits, and seven metadata-only refreshes landed.
The Lab case has a disputed status and a canonical-page caution.

### Register and generated outputs

- `eval/qa/consistency-register.json`
- `eval/qa/cases.json`
- `eval/qa/sample.json`
- `eval/qa/lifecycle-registry.json`

The register now contains the SCF #46 invariant and updated SCF trap.
It also contains `cluster-137` for the Saved Keypairs conflict.
The helper reopened 19 clusters, one invariant, and one trap.
Every reopened cluster and the trap received a dated review.
The SCF invariant received a manual dated review because the helper only reviews clusters and traps.
The final canonical-page caution changed one Lab case.
The helper reopened `cluster-023` and `cluster-137` again.
Both clusters received a final dated review.

### Improvements and queue

- `improvements/stellar-docs/sd-049-lab-saved-keypairs-obfuscation-conflict.md`
- `improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md`
- `improvements/INDEX.md`
- `.agents/TODO.md`

Both finding files use `proposed` status.
The TODO item requires an independent live re-derivation before filing.

The approved report requested `sk-020`.
`sk-020` already exists in `improvements/resolved.json`.
It resolved on 2026-09-01 for a different Discord URL defect.
The permanent-ID rule prohibits reuse.
This implementation uses `sk-021`.

## Commands and results

```text
parallel-cli search "Verify the approved 2026-09-03 golden-truth evidence for SCF 46, Laboratory Saved Keypairs storage, Stellar RPC getTransactions configuration, Soroban SDK advisories, Soroswap TVL, Stellar Skills Protocol example, and SLP status." -q "SCF 46 Submission 2026-11-08 awards" -q "Stellar Laboratory Saved Keypairs obfuscated unencrypted localStorage" -q "stellar-rpc max-transactions-limit default 200 getTransactions" -q "Stellar Skills smart-contracts Protocol 27 Mainnet Protocol 26" --json --max-results 10 --excerpt-max-chars-total 27000 -o /tmp/golden-truth-health-evidence.json
result: passed

npm run eval:qa:register -- --date 2026-09-03
result: reopened 19 clusters, one invariant, and one trap

npm run eval:qa:register -- --date 2026-09-03 --review /private/tmp/golden-register-review.json
result: passed

npm run eval:qa:compile
result: wrote 500-case cases.json, sample.json, and lifecycle-registry.json; SHA-256 2059e1e5c7103d4ded6e56b4fa68ddafedb896b40b463e7813704f51d992c4ae

npm run improvements:index
result: wrote improvements/INDEX.md with 68 findings

npm run improvements:lint
result: passed, 68 findings

npm run eval:qa:lint -- --since 2ee801f80d626e68f010392a7d541aab7997349d --stale --today 2026-09-03
result: passed with 0 errors and 66 warnings

npm run eval:qa:register -- --check
result: up to date

npm run eval:qa:register -- --date 2026-09-03 --review /private/tmp/golden-register-review-final.json
result: passed after the final Lab caution review
```

## Unresolved disputes

`q-ti-rpc-gettransactions-pagination-xdr` remains disputed.
The official page says the maximum is hardcoded.
The source exposes configurable maximum and default options.
The partial-credit canonical-page caution remains.

`q-ti-stellar-lab-usage-and-new-ui` remains disputed.
The official page says obfuscated.
The current source and UI show unencrypted JSON storage.
The new proposed `sd-049` finding records the conflict.

No Scout drift generator, exposure policy, routing baseline, vector artifact, paid evaluation, or deployment changed.

## Final-review reconciliation

The independent Sol review required F1 through F7.
This reconciliation repaired each item without changing unrelated work.

- F1 updated the Soroswap verification date, reviewer, root cause, and dated DefiLlama evidence.
- F2 attached each RPC evidence note to its correct source record.
- F3 narrowed the SCF #45 source note to the linked page evidence.
- F4 replaced the stale `cluster-081` state note.
- F5 removed two presentation-only avoid items and split the RFP facts.
- F6 replaced the advisory corroboration references with the verified OSV records.
- F7 separated the storage-helper evidence from the SavedKeypair type evidence in `sd-049`.

`q-ti-rpc-gettransactions-pagination-xdr` remains disputed.
`q-ti-stellar-lab-usage-and-new-ui` remains disputed.
Both proposed findings remain proposed.
No upstream issue was filed.

The register helper reopened eleven clusters, the SCF invariant, and the SCF phase-change trap.
Each reopened cluster and the trap received a dated reconciliation review.
The SCF invariant received the same review because the helper cannot apply invariant reviews.

### Reconciliation commands and results

```text
npm run eval:qa:compile
result: wrote 500-case cases.json, sample.json, and lifecycle-registry.json; SHA-256 623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915

npm run eval:qa:lint -- --since 2ee801f80d626e68f010392a7d541aab7997349d --stale --today 2026-09-03
result: passed with 0 errors and 62 warnings

npm run eval:qa:register -- --check
result: up to date

npm run improvements:index
result: wrote improvements/INDEX.md with 68 findings

npm run improvements:lint
result: passed, 68 findings

npm run secrets:scan -- --tree
result: passed; gitleaks found no leaks in all tracked files

git diff --check
result: passed with no output
```

## Judge fixture reconciliation

The static P6 preflight differed only for `q-edge-factcheck-soroswap-first-amm`.
I rebuilt both prompts with the current deterministic renderer.
The `2ee801f80d626e68f010392a7d541aab7997349d` case produced `7ae0a8e4575fe3cdd7dd973c395beb5f7184a1039dd1b1f23bcbac5980bcd8f8`.
The current case produced `9cbc76ff1bb5e6d46edc0df684a9cdd048d8d2469630fa94aceeeab9385a6254`.

Only `golden.answer` differs in the prompt fields.
The approved 2026-09-03 edit changed the DefiLlama observation date and current TVL example.
`golden.keyFacts`, `golden.avoid`, `golden.notes`, and `tags` are unchanged.
The prompt SHA fixture in `eval/qa/judge.mjs` now uses the current hash.

```text
node eval/qa/judge.mjs --self-test-static
result: passed; 15/15 prompt SHA fixtures matched

npm test -- test/p6-judge-self-test.test.mjs test/qa-judge-evidence.test.mjs test/qa-judge-qpp-dormant.test.mjs test/qa-judge-stability.test.mjs test/qa-judge-stored.test.mjs test/qa-verdict-consistency.test.mjs
result: passed; 6 files and 218 tests

npm run eval:qa:compile
result: wrote 500 cases; SHA-256 623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915

npm run eval:qa:lint -- --since 2ee801f80d626e68f010392a7d541aab7997349d --stale --today 2026-09-03
result: passed with 0 errors and 62 warnings

npm run eval:qa:register -- --check
result: up to date

npm run secrets:scan -- --tree
result: passed; gitleaks found no leaks in all tracked files

git diff --check
result: passed with no output
```
