Independent post-run review: section text v2

Reviewer: Codex, independent of the author and the orchestrator.
Review target: `w1012/t`, `f527d1f78e140e94203f6ab2e6f757656e02aa9b`.
Measured baseline: `0a60d98a48e3bc0c7076961e33991aee2c7375d8`.
Shipping baseline: `d6d6ca67d38f9cf28d4631d3322a114398721adf`.

The text passes the written rules on `0a60d98a`.
The text change alone can merge onto `d6d6ca67`.
One misread classification needs correction, but that correction does not change the verdict.
This review does not approve the section guard or the complete branch diff.
I changed no repository file and made no paid call.

I read the plans, both prior reviews, the ledger, the result report, and the stored artifacts.
I inspected all 73 section-read scripts and all four execute errors.
I read all 24 answers for the six rows with grade differences, their goldens, and their judge reasons.
I also inspected their relevant retrieval scripts and returned evidence.

Artifact references below use `/private/tmp/raven-section-text-v2/` unless another path appears.
Transcript indexes are zero-based.
Repository report references use `.agents/rounds/2026-10-12-call-pattern-triage/` at `f527d1f7`.
Independent audit files use `/private/tmp/rt2-astra-review/`.

1. **Nonblocking correction: `Object.keys` alone does not establish a misread.**

`result-text-v2.md:112` says `Object.keys(skill.data.sections || {})` treats the array as keyed by section name.
That conclusion does not follow from the code.
The A1 `q-edge-noinfo-sep-9999` script at index 3 returns the actual enumerable keys: `["0","1","2"]`.
It does not read a section-name property, convert a section into text, or claim those keys are section names.
Its answer also makes no claim about the returned section keys.

The written reader definition explicitly accepts a deliberate shape inspection.
See `read/READER-PROMPT.md`, the `correct` definition.
The absence of returned content cannot alone establish a misread under that definition.
I classify this script as `correct`, with no silent loss.

The other borderline script differs materially.
A2 `q-stellar-recurring-payments`, index 4, uses `(v || "").length` on each section object.
It labels those values `agenticContentLen`.
The result is `{}`, because the supposed lengths are undefined.
This operation assumes text values and fails to obtain the requested content lengths.
I retain its `string-use` classification and silent loss.
`Object.entries` itself is valid; the incorrect use of each value causes the misread.
Indexes 5 and 6 then inspect the shape and read `.sections[0].content` correctly.

The four unambiguous misreads also reproduce:

| Artifact | Row | Index | Evidence |
| --- | --- | ---: | --- |
| `results-A1.json` | `q-defi-build-staking-for-own-token` | 4 | Named array access returns an empty `devSnippet`. |
| `results-A2.json` | `q-defi-build-staking-for-own-token` | 4 | `.toString()` returns `[object Object]` values. |
| `results-A2.json` | `q-passkey-smart-account-architecture` | 4 | `.slice` on a section object throws. |
| `results-A2.json` | `q-pc-surge-griefing-threat-model` | 5 | `.join` returns `[object Object]` instead of section text. |

My corrected counts follow.
S counts section-read scripts; M counts misreads; L counts silent losses.
K counts `codemode.describe` calls on sectioned skills.

| Collection | S | M | L | Guard messages | Execute calls | Execute errors | K |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 18 | 1 | 1 | 0 | 39 | 1 | 0 |
| T1 | 21 | 0 | 0 | 0 | 37 | 1 | 0 |
| T2 | 14 | 0 | 0 | 0 | 35 | 0 | 0 |
| A2 | 20 | 4 | 3 | 0 | 39 | 2 | 0 |
| A total | 38 | 5 | 4 | 0 | 78 | 3 | 0 |
| T total | 35 | 0 | 0 | 0 | 72 | 1 | 0 |

A has one map-key misread and four string-use misreads.
Neither arm has an absent-content misread.
Thus, my rate comparison is `5/38` against `0/35`.
Excluding the second borderline script also leaves PASS: `4/38` against `0/35`.
This sensitivity check removes observations; it adds no rule or threshold.

Correct the report's A1 counts, total counts, rate, and noise-floor misread counts.
Relevant locations include `result-text-v2.md:118`, line 122, and line 129.
The corresponding ledger summary also repeats six misreads.
The correction is nonblocking because the four unambiguous errors already satisfy the preregistered floor.

2. **Completeness, identities, and spend match the authorized measurement.**

A1, T1, T2, and A2 contain the same 16 IDs in battery order.
All 64 cells have a `graded-*` outcome.
There are no missing grades, `agent-limit` cells, unattempted IDs, or incomplete IDs.
Every collection has `comparable: true` and unsuppressed aggregates.
The saved revision, surface, source, process, executable, environment, and remote-identity checks pass.
The saved before-and-after surfaces match within each collection.

| Arm | Revision | Tree | Surface SHA-256 |
| --- | --- | --- | --- |
| A | `0a60d98a48e3bc0c7076961e33991aee2c7375d8` | `488e1aeb923435c8da13799c47d72a5a75097140` | `8c2e4dfc3c074fc918223922f10529e980f4414d4b07b5799d0c4011188ad4ad` |
| T | `badbda8a045620b64df626e82e8ff2cce579f479` | `eb1a91e2da8fc06a4ab8aebf7560464d302aaab2` | `0026761dfe97bbe58c795fd1c9d374dac6125a800c0c27c54f583282a6b3b740` |

The execute descriptions contain 10,367 and 10,572 characters.
The difference is 205 characters.
The runner revision remains `0a60d98a`, with a clean-tree identity in each artifact.
Both answer and judge models are `claude-sonnet-5`.
All collection verdicts use rubric `v2.11` and pack `p9`.
K1 and K2 use the same model, rubric, and pack.

I compared every saved `caseInput` with the baseline corpus and recomputed its SHA-256.
The repository's `verifySourceCases` also passes independently for all four collections.
The selected-case digest is `5872d7527c914fbd2a862e1ec6499659460c2ffe58fc804b4f7fab646f08fe83`.
The ordered-ID digest is `980dcb5ada85ad03582c9aaa7630457eaaf8ff4916a4aab33e8c89b82c2f5c4a`.
All selected rows remain active.
No case, catalog, spec, package, or evaluation implementation changed between the measured baseline and `d6d6ca67`.

The following pins appear in launch amendment 3 before spend:

| Pin | Value |
| --- | --- |
| Versioned executable | Claude Code `2.1.299` |
| Executable SHA-256 | `ba5ab7b8c195fa03ab8d5bf3915c76153b576a2c40e79a5c46e265e7ed9744b3` |
| Environment SHA-256 | `ab375f5217db1e878d6786279d8b5d7134d299db2415e3a1f9ed71c96ca6a12d` |
| Probe SHA-256 | `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226` |
| Remote vector SHA-256 | `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` |
| Stability register SHA-256 | `5b5c16ae90547df8252adf60f549dc0cf33ec09d62c855cf8a4d1ffb4f1461a9` |
| Counter SHA-256 | `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f` |

Commit `06f3509d` records these pins at `04:19:31Z`.
The first text collection starts at `04:42:37Z`.
I hashed the retained versioned executable and counter independently; both match.
The drivers supply explicit expected hashes and one method cap per paid command.
K1 and K2 retain matching executable and environment identities before and after judging.
The removed collection worktrees prevent repeating their original clean-tree and `.dev.vars` checks.
That limitation remains explicit; I found no recorded identity mismatch.

I summed each `budget.calls[].costUsd` with decimal arithmetic.
All 168 calls report costs: 64 answer calls and 104 judge calls.
Each collection's sequential call authorization respects its remaining method budget.

| Method | Calls | Recomputed USD | Cap USD |
| --- | ---: | ---: | ---: |
| A1 | 42 | 6.8097870 | 12 |
| T1 | 40 | 7.0359366 | 12 |
| T2 | 42 | 6.5992428 | 12 |
| A2 | 42 | 6.4597222 | 12 |
| K1 | 1 | 0.0715162 | 3 |
| K2 | 1 | 0.0687684 | 3 |
| Total | 168 | 27.0449732 | 74 |

No retry, replacement, or guard arm appears in this authorization's artifacts.
The six result-file hashes match the committed result report.
See `audit.py` and `audit.json` for the independent assertions and sums.

3. **The grade differences do not establish a consistent regression.**

I preserve all stored grades.
The table follows the collection order A1, T1, T2, A2.

| Row | Grades | Independent reading |
| --- | --- | --- |
| `q-aas-list-token-on-exchanges-aggregators` | 1, 1, 2, 2 | A1 omits market creation; T1 omits a general holder-trustline requirement. T2 and A2 cover both. |
| `q-asset-trustline-basics` | 1, 2, 2, 2 | A1 and T1 both imply payment failure through the receipt restriction. Their judges apply different explicitness standards. |
| `q-defi-build-staking-for-own-token` | 1, 2, 2, 1 | The initial T judges accept security caveats as sufficient risk coverage. K2 requires the broader missing risk discussion. |
| `q-jutsu-check-account-history` | 2, 1, 1, 1 | All answers use public identifiers and network-specific endpoints. All omit the explicit public-history caution. |
| `q-pc-surge-griefing-threat-model` | 1, 0, 1, 1 | T1 gives more operational abuse detail and omits defenses. T2 does not repeat its wrong grade. |
| `q-soroban-cross-contract-call` | 1, 2, 1, 1 | T1 includes the direct-invoker authorization distinction. The other answers omit it. |

The listing omissions concern different facts across A1 and T1.
T1 retrieves trustline material but does not state the general requirement clearly.
A1's answer focuses on metadata and lacks the market-creation explanation.
This pattern is mixed answer coverage, not a repeated candidate regression.

The trustline difference partly reflects judge variance.
A1 explicitly says an account needs a trustline before it can receive the asset.
Its judge requires an additional explicit payment-failure statement.
T1 receives credit for the same implication.
T2 gives a direct failure statement, and A2 also receives full credit.

The account-history difference also reflects inconsistent judging.
A1 receives `correct` despite omitting the public-history warning required by its golden.
T1, T2, and A2 receive `partial` for that omission.
No T answer requests a secret key or claims private on-chain history.
The pairwise grade condition fails because T equals A2.

The cross-contract difference has direct retrieval evidence.
T1's execute result at index 3 contains the implicit-authorization statement and the authorization-guide reference.
Its answer includes that distinction.
A1, A2, and T2 omit the authorization discussion.
T2's grade equals both A grades, so the improvement does not repeat.

Staking is the only initial consistent change.
The ledger records its K1/K2 selection in `bd81e30f` at `06:16:47Z`.
K1 starts at `06:17:10Z`; K2 starts at `06:17:38Z`.
Both source cells are gradeable, and both dry runs pass their case and contract checks.
The re-judge artifacts bind their sources by SHA-256.
K1 preserves A1 `partial`; K2 changes T1 `correct` to `partial`.
Both answers omit the broader sustainability, compliance, pricing, and disclosure discussion.
The improvement therefore fails confirmation and counts as no change.
Neither re-judge fails, so K1r and K2r have no trigger.

I independently checked the official sources used for the T1 surge-pricing wrong cell.
The fee page supports the cited minimum, dated capacity, auction example, and storage-pricing factor.
See [Stellar fee documentation](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering).
The fee-bump page supports the replacement multiplier and the inner transaction's sequence handling.
See [Stellar fee-bump documentation](https://developers.stellar.org/docs/build/guides/transactions/fee-bump-transactions).
These checks support the cited mechanics; they do not prove every speculative abuse scenario.
The stored judge identifies a must-avoid violation and missing defenses, with no `wrongClaims` entry.
T1 remains `wrong`; the live check does not erase that grade.
T2 and both A cells remain `partial`, so no consistent regression exists.

Grade disagreement counts are A1/A2 = 3 and T1/T2 = 3.
My corrected A misread counts are 1 and 4.
The counts describe variation; they provide no significance threshold.

4. **All written text decision rules support PASS.**

The controlling rules are `plan-section-text.md:98` through line 134.

| Rule | Independent result |
| --- | --- |
| 1: completeness | Four complete collections; all 64 grades valid. |
| 2: arm integrity | No guard message; T and A have different surfaces. |
| 3: consistent change | One initial improvement; no consistent regression across all 16 rows. |
| 4: rate denominator | T has 35 section-read scripts; 35 exceeds half of 38. |
| 5: PASS | A has five accepted misreads, or four without either borderline observation. T has zero. |
| 6: FAIL | No rate failure, repeated new error class, or confirmed regression. |
| 7: INDETERMINATE | No remaining condition applies. |
| 8: confirmation | K1/K2 correctly remove the staking improvement. The only graded T wrong has a source check. |
| 9: failed confirmation | Neither command fails; no retry applies. |
| 10: noise floor | Grade disagreement is 3 per arm; corrected A misreads are 1 and 4. |
| 11: no case tuning | The candidate contains the same reviewed text lines. No case-specific edit appears. |

I reran the unchanged counter and all 23 self-check fixtures.
Every saved counter output reproduces exactly.
There are no unknown skill-read scripts or unparsed scripts.
The T2 unresolved docs reference is the inert `get_doc_page_sections ? null : null` expression.
It introduces no unknown section read.

Read avoidance V is 0.
The repeated A reads include recovery after staking, passkey, surge, and recurring-payment misreads.
Other differences include additional sections or repeated searches within the same skill families.
T2 answers the trustline row through documentation without a section read.
T adds reads for agent identity, Etherfuse, and address types; those grades remain unchanged.
T1 repeats fuzz-testing and SCF sections; all use valid section shapes.
The report's per-row S totals at `result-text-v2.md:164` match my reconstruction.

One routing sentence needs qualification.
`result-text-v2.md:168` says the skills otherwise remain the same.
Staking reads `skills.openzeppelin-stellar.setup-stellar-contracts` in A2 and `skills.openzeppelin-stellar.develop-secure-contracts` in T1.
Record that difference rather than claiming identical skill selection.
It does not create a repeated adverse grade change.

K remains 0 in every collection.
A1 calls `codemode.describe("scout.scfPitch")`, which describes an operation.
Thus, the screen measures exposure to the execute description but does not directly exercise the changed describe usage line.

A1 and T1 share the `scout` initialization error.
A2 has the undefined `repo` read and the section-object `.slice` error.
T2 has no execute error.
Its invalid docs path produces a handled host refusal, not a failed execute script.
No script-error class appears in both T collections and neither A collection.

5. **Process deviations remain visible and do not invalidate this screen.**

The slot conditions appear in `06f3509d` before any v2 paid collection.
Thus, this run does not repeat the earlier screen's retrospective contention amendment.
The three text start receipts report Raven count 0 and no listener on port `8799`.
Their loads are 6.56, 3.81, and 3.33, all below 12.
The first clip start receipt reports load 10.60 at `04:26:19Z`.
The report's earlier 64.30 and 11.34 observations have no separate retained receipt that I found.
The retained start follows the reported high-load observation by about eight minutes.
That interval fits the 30-minute wait rule, and the retained start itself passes.
I cannot independently reconstruct the intermediate load readings.

All recorded execute errors arise from model scripts.
No recorded timeout or host/server failure reaches the contention threshold.
This check does not establish identical machine load across collections.
Gateway headroom and the original `.dev.vars` equality check remain operator records with limited repeatability.

Commit `f527d1f7` documents `--no-verify` and the manual staged scan.
The hook itself runs `node scripts/scan-secrets.mjs --staged`.
I reconstructed that exact staged commit diff in an isolated temporary repository.
The private-usage guard, custom secret checks, and redacted Gitleaks scan all pass.
I also read the two changed Markdown files and found no credential-shaped content.
They contain measurement counts, costs, hashes, and local artifact paths.
See `scan-final.log` and `final-commit.patch`.
I did not copy production credentials for equality matching.
The original manual scan remains an author assertion; my independent scan covers the committed content.

The original readers used separate subagents, but shared the author's session and labeled inputs.
They did not use independent Herdr panes or blinded arm labels.
Their agreement therefore provides limited independence and does not settle the shape-inspection dispute.
This review supplies a separate non-author reading of the scripts and grade differences.
No extra paid reader or changed decision rule supports the verdict.

6. **The exact text change remains compatible with current main.**

A direct remote read returns `d6d6ca67d38f9cf28d4631d3322a114398721adf` for `refs/heads/main`.
Compared with `0a60d98a`, that commit changes only `src/demo/tools.ts` and `test/smoke/demo-tools.test.ts`.
It adds no MCP surface change.

I compared the ordered added and removed lines, per file, against `7cf3a833`.
The measured `0a60d98a` to `badbda8a` diff has exactly the same changed lines.
I then applied `7cf3a833` through a three-way merge onto an isolated `d6d6ca67` copy.
All six files merge cleanly.
A plain context patch initially fails because #271 changes surrounding lines; this is not a three-way conflict.
All six resulting files equal the measured T files byte for byte.
The combined tree is `bfeb04e9724ade2cf521f16227ceec54506db510`.
It preserves #281 and contains no section guard.

The implementation still returns section objects in request order.
See `src/skills/store.ts:381`, line 416, and line 426 in the combined copy.
The successful section result omits `data.content`.
The execute description, describe usage line, docs page, skills README, and assertions agree with that behavior.

I installed the exact lockfile dependencies with `npm ci` in the temporary copy.
An earlier copied dependency tree had older AI SDK versions; I discarded those test results and repeated verification.
The final dependency versions include `ai` `7.0.137` and `@ai-sdk/openai` `4.0.91`.

| Check | Final result |
| --- | --- |
| `npm run typecheck` | Pass. |
| `npm test` | 142 files pass; one process-control test file has 29 failures. |
| Changed provider and instruction tests | Pass within the final unit run. |
| `npm run test:smoke` | 8 files and 125 tests pass. |
| `npm run build` | Pass; dry-run bundle only. |
| Patch whitespace check | Pass. |

The remaining unit failures come from denied `ps` process inspection and its cleanup consequences.
They all occur in unchanged `test/qa-paired-launch.test.mjs`.
The final unit totals are 2934 passed, 29 failed, and 3 expected failures.
I do not report the full unit suite as passing.
The launch ledger separately records passing A and T unit suites before collection.
See `test-final.log`, `smoke-final.log`, `typecheck-final.log`, and `build-final.log` for this review's results.

The result remains a small 16-row MCP screen with two collections per arm.
It supports this text change on the stated baseline and model, with the corrections above.
It does not establish a general misread-rate estimate or direct evidence for the describe usage line.
The source worktree remains clean.

TEXT: PASS-CONFIRMED-MERGE-OK
