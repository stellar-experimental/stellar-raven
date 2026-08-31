# Independent review: repository recovery v2 closeout

- Reviewer: Grok 4.6, high effort. Independent of the Terra author, the Sol orchestrator, the Fable planner and annotation reviewer, and the `claude-sonnet-5` answering model.
- Date: 2026-08-31
- Mode: audit only. No repository file changed. No paid eval, deploy, push, or merge ran.
- Spec: Fable plan `.agents/rounds/2026-08-30-repository-tooling-recovery/fable-plan-v2-live-failure.md` steps 1–4, plus ADR-0010 and the local-only results rule.
- Fixed point: commit `b659233c0ff3bcc106342d7774648185161399bc` versus parent `8195f2c6020ccd3352e6760e85bbaf5e50ffc0f2`.
- HEAD matches that commit. The worktree is clean.

## Summary

The closeout records a valid v2 FAIL. The stored grade is 9 of 12 positives and 0 of 8 detours. Identity and review integrity pass. The suite digest is unchanged. G1 is not applied. Findings `sls-080` and `sls-081` match the plan. `TODO.md` and `NEXT.md` keep the monitor rules.

Two defects block close.

1. The ledger records spend `$0.5646914`. The collection records `$4.5646914`. The Fable plan records `$4.5646914`.
2. The commit force-adds four gitignored eval result files. That breaks the local-only results rule. It also adds a secret-scan exception that the plan did not ask for.

## Blocking findings

### B1. Ledger spend is false

- File: `.agents/rounds/2026-08-30-repository-tooling-recovery.md` fifth-collection section
- Observed: "It cost `$0.5646914`."
- Evidence: collection `meta.budget.reportedSpendUsd` is `4.5646914`. The 20 call costs sum to `4.5646914`. Remaining budget is `25.4353086` of `$30.00`. The preserved Fable plan table says `$4.5646914`.
- Consequence: the durable round record drops the leading `4`. Later spend accounting will be wrong by `$4.00`.
- Repair: write `$4.5646914`. Keep the Fable plan unchanged.

### B2. Gitignored eval results are tracked

- Files: four `eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-*.json` plus `scripts/scan-secrets.mjs`
- Observed: parent `8195f2c` tracks zero files under `eval/repo-recovery/results/`. `.gitignore` still lists that directory. `eval/EVALS.md` says results are local-only and gitignored. `eval/repo-recovery/README.md` says result JSON stays local and the ledger holds SHA-256. Twenty-one other result files in that directory remain ignored.
- The Fable plan asks to rename the four files locally and record their hashes. It does not ask to track them.
- Consequence: the commit is an 88,169-line dump against the written results contract. The secret-scan hash allowlist exists only because these files are tracked.
- Repair: untrack the four files, keep the ledger hashes, and revert `scripts/scan-secrets.mjs`. Or, if tracking is required, change EVALS.md, the recovery README, and `.gitignore` in an explicit policy change. Do not leave a silent force-add.

## Verdict

CHANGES-REQUESTED

## Checklist

| Question | Result |
| --- | --- |
| Four artifact file SHA-256 values | Match the ledger |
| Canonical collection SHA-256 | Match the ledger and packet |
| Suite identity v2 | Match current `cases.json` |
| Spend `$4.5646914` | Artifact and Fable plan match. Ledger is wrong |
| Grade 9/12, 0/8, 0 projection errors | Reproduced. Gate fails as required |
| Answers 18/20 correct, 20/20 grounded | Match annotations |
| Failure partition | Match Fable plan and stored grade |
| Fable plan bytes | SHA-256 match. File is preserved |
| `sls-080` recurrence | Match execute call 7, generatedAt, scannedRef prefix, collection hash |
| `sls-081` proposed candidate | Match pipeline `proposed` state |
| Regenerated `INDEX.md` | Lint ok. 69 findings. `sls-080` recurrences 1. `sls-081` present |
| TODO and NEXT disposition | Match Fable step 4 |
| Post-hoc pass or G1 regrade | Absent |
| Contract, product, ranking, goldens | Unchanged |
| Hash allowlist exact public seeds only | Yes. Prefixes and alternate seeds are not skipped. Layer B live match is independent |
| Implementation scope | Extra: tracked results and secret-scan change |

## Spec

### Artifact bytes and hashes

File SHA-256 is `sha256(file bytes)`. Canonical SHA-256 is `artifactSha256(JSON.parse(file))`.

| Artifact | File SHA-256 | Canonical SHA-256 |
| --- | --- | --- |
| Collection | `4f4ee34353b236dd6d00ec896fa7888b5c19702a76a0809a67a9f35246e68bb8` | `da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da` |
| Review packet | `08a41ee2cad8822043b5263bfbcc8f28378e0fd85dc1499dd0710e56aefd1c33` | `ee79ad6547d6c2ad7ac3c862d4d54c1530f562b1c1a2ab46137b48b60a85e077` |
| Annotations | `08691d62a8f501d57684866d56e00d801474799754544308df2684e3bf24a207` | `fd81266c2142ca4e8e5418316caa1ea738e288b7971572f9e0d1cbd798495ef5` |
| Reviewed result | `e53a83952e5701ef49a33c955e59ebfa002413b542937c22c49a166f8e0a7ac0` | `0c2e28a76002ad7e20f8470348cfde02830f8db286c971850d75d509fcebcc59` |
| Fable plan | `689a1fda1639a3122b8df4404d663c34fa0463beabbaf34bd99e9d4e40dcb4b3` | n/a |

The ledger file hashes match. The ledger canonical collection hash matches. The packet `collectionSha256` and annotations `collectionSha256` match. The reviewed `review.annotationsSha256` matches.

### Canonical collection identity

- Contract: `repository-tooling-recovery-v2`
- `caseContentDigest`: `sha256(JSON.stringify(cases))=482547a95a07f760f892bc72f9014d51f9e7dec26ac457ab83e4d1a3225a5479`
- `orderedIdsDigest`: `sha256(ids.join("\\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`
- These match `eval/repo-recovery/contract.mjs` and live `cases.json`.
- Server and runner revision: `8195f2c6020ccd3352e6760e85bbaf5e50ffc0f2`
- Surface SHA-256: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`
- Answering model: `claude-sonnet-5`
- Binary SHA-256: `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`
- Prompt: `qa-agent-prompt-v1` SHA-256 `3f29c317b416ce00b7cc16f8cb15465053b46d37ae29e46841a5642f6ecfc5d6`, 1247 chars
- Reviewer: `repo_recovery_v2_live_fable`, `claude-fable-5`, high, independent, `reviewedAt 2026-08-31T01:02:36Z`
- Collection window: `2026-08-31T00:44:40.313Z` through `2026-08-31T00:56:44.235Z`
- Paid calls: 20 of 40. Retries: 0. Missing costs: 0. Comparable and complete: true

The fifth ledger section omits the prompt hash and the collection window. That is incomplete against Fable section 2. It is not the spend defect.

### Tracked aggregates

Stored grade command:

```
npm run eval:repo-recovery:grade -- \
  eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-reviewed.json --gate
```

Result: `identityPass true`, `reviewPass true`, `positivePasses 9`, `prematureDetours 0`, `operationProjectionErrors 0`, `pass false`, exit 1.

Positive failures:

| Case | sequencePass | answerPass | Cause |
| --- | --- | --- | --- |
| `rr-pos-go-sdk-query-enums` | false | true | Required `stellarDocs.search_sdk_cli_tools_docs` never ran. Receipt came from `search_rpc_horizon_data_docs`. Explain call is later and pinned. |
| `rr-pos-cli-config-home-env` | true | false | Required op in execute 3. Explain in execute 11. Answer demotes `STELLAR_CONFIG_HOME` and omits `<cwd>/.stellar`. |
| `rr-pos-horizon-max-supported-protocol` | true | false | Required op in execute 6. Explain in execute 7. Answer copies DeepWiki value 25. Source is 28. |

Annotations: 18 `correct: true`, 20 `grounded: true`. Incorrect rows are the two answer failures. That matches the ledger partition.

A G1 rule that accepted any qualifying Docs source would flip `query-enums` and read 10 of 12. The ledger does not quote that number as a result. TODO says G1 is a v3 candidate only.

### Fable plan preservation and disposition

The plan is a new file in this commit. Its SHA-256 matches the ledger. Earlier ledger sections are append-only.

Steps 1–4:

1. Fifth-collection section exists. Identities, file hashes, 9/12, 0/8, 18/20, and 20/20 are present. Spend is wrong (B1). Prompt hash and timestamps are missing.
2. `sls-080` adds the v2 recurrence with collection SHA-256 `da4a4e24…`, row `rr-pos-horizon-max-supported-protocol`, execute call 7, `generatedAt 2026-08-31T00:52:03.666Z`, value 25, `scannedRef 82660510`. Full scannedRef is `82660510ecda7fd365a14d08badb9d85fa22bc32`. Prevalence 1 of 12 is recorded. INDEX recurrences count is 1.
3. `sls-081` is `proposed` with fourth-run and v2 evidence and `locator.rs` line 187. The pipeline uses `proposed` for a candidate. The body tells the reader to wait for a free Raven probe.
4. TODO records one selection miss, the conflict monitor, and G1 as v3-only. NEXT block 4 points at the Fable plan.

The plan says no rerun now. The ledger says the same.

### No post-hoc pass or contract change

`git diff --name-only 8195f2c b659233` does not touch `src/`, catalog, `cases.json`, `contract.mjs`, `grade-results.mjs`, or ADR-0010.

`REQUIRED_POSITIVE_PASSES` remains 10. The stored gate reports `pass: false`.

Older ledger PASS lines belong to other commits. The fifth section does not call this collection a pass.

### Secret-scan allowlist

The two artifact seeds and their SHA-256 values are:

- `[public documentation seed redacted]` → `fde46e3daefdfb6d9fad0e8176385d591cd2ef5c38771fc686c2ae27b37cb075`
- `[public documentation seed redacted]` → `39926133bc993acf01d3a9753080623c3578ae0d4ecae484902f27d87cba1bde`

These are published Docs examples:

- https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment (`secret = "SAAPYA…"`)
- https://developers.stellar.org/docs/validators/admin-guide/configuring (`stellar-core gen-seed` sample)

The allowlist stores only those two hashes. `isKnownPublicStellarSeed` hashes the full Layer C regex match `\bS[A-D][A-Z2-7]{54}\b`.

Probes:

- Exact seed: hash hits the set.
- 55-character prefix: regex fails. Hash misses.
- Seed plus one extra character: regex fails as a 56-character word. Hash of the longer string misses.
- Alternate last character that still matches the regex: different hash. Not skipped.
- Layer B uses `text.includes(s.value)` and does not call the hash helper. A live `.env` value still fires.
- Layer D assignment uses `looksSecret`, which checks `KNOWN_PUBLIC` literals, not the seed hashes.

`npm run secrets:scan -- --tree` exited 0 with gitleaks 8.30.1. Report: `secret-scan: clean (+ gitleaks)`.

The allowlist does what the user asked, if the files stay tracked. No test covers it. Revert it if B2 untracks the artifacts.

## Standards

### Scope and reviewability

The approved closeout is record-only: ledger, findings, TODO, NEXT, and a preserved plan.

The commit also force-adds 6.6 MiB of reviewed JSON, 3.2 MiB of collection JSON, and 3.3 MiB of packet JSON. That is shotgun scope. It hides the ledger defect behind generated output.

The commit subject is `docs: close repository recovery v2 measurement`. The diff also changes `scripts/scan-secrets.mjs`.

`improvements/INDEX.md` is generated. `npm run improvements:lint` reports 69 findings and matches the committed index.

`sls-080` and `sls-081` are present-state records. They do not narrate the review.

### Tests and generated files

Focused tests passed: 7 files, 47 tests (`repo-recovery*`, improvements lint, gitleaks config).

`npm run eval:repo-recovery:lint` passed for v2.

`npm run eval:repo-recovery -- --gate` passed the free structural gate: 12 of 12 eligible, 0 of 8 risks.

`git diff --check 8195f2c b659233` is clean.

No new test asserts the seed-hash allowlist. The gitleaks test still covers only the consistency-register allowlist.

## Verification run in this review

| Command | Result |
| --- | --- |
| File SHA-256 of four artifacts and the Fable plan | Match the ledger |
| `artifactSha256` of collection, packet, annotations, reviewed | Collection matches ledger. Others computed |
| `npm run eval:repo-recovery:grade -- <reviewed.json> --gate` | FAIL as required: 9/12, 0/8, 0 projection errors, exit 1 |
| Annotation recount | 18 correct, 20 grounded |
| Call-cost sum | `4.5646914` |
| `npm run eval:repo-recovery:lint` | PASS, v2 |
| `npm run eval:repo-recovery -- --gate` | PASS, 12/12 eligible, 0/8 risks |
| `npm run improvements:lint` | PASS, 69 findings |
| Focused vitest | PASS, 47 tests |
| `npm run secrets:scan -- --tree` | PASS, clean + gitleaks |
| `git diff --check 8195f2c b659233` | PASS |
| Seed-hash probes | Exact only. Prefixes and alternates not skipped |

I did not run `npm test`, typecheck, build, or routing. I did not run a paid collection.

## Non-blocking notes

1. The fifth ledger section omits prompt SHA-256 `3f29c317…6ecfc5d6` and the collection timestamps. Fable section 2 listed them.
2. The Fable plan truncates the binary hash as `…8969e5`. The full hash ends in `8969a5`. Keep the plan. The ledger already has the full hash.
3. If the artifacts stay tracked, add a scanner test that the two public seeds are skipped and that a one-character alternate still fails.

## Exclusions

- No paid collection, no deploy, no push, no merge, no upstream filing.
- No GitHub re-read of `stellar/stellar-horizon` source. The stored transcript and sls-080 pin are enough for this closeout.

CHANGES-REQUESTED
