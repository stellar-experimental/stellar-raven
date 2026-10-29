Phase 0 is complete. Neither baseline passes all twelve checks.
The main label fails checks 5, 8, and 12.
The fresh label fails checks 5, 6, 8, and 12.
Phase 1 has not started.

The source revision is `344d6af2`.
Every measured label contains 544 rows: 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.
The helper verifies all 544 rows against their saved inputs and scorer.
It checks row membership, order, scores, grades, target ranks, totals, and gate failures.
It also verifies each manifest, inventory, scorer, and evaluation input hash.

| Input | baseline-main | baseline-fresh |
|---|---|---|
| Scout | 1.9.61 | 1.9.111 |
| Upstream Scout operations | 38 | 42 |
| Exposed Scout operations | 30 | 33 |
| Docs titles | 666 | 682 |
| stellar-light pin | `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` | `789c9061f0dc0fca0cbeaa9519404361a4f5d062` |
| Manifest SHA-256 | `033e277fd62ae71b1ad2ae5210cf5ff96bd0abe7e3727b3648d8d710a0ab6ba4` | `0b345ab378a9ea1dc77dff5e97c1c2dabce14daa9ce0863b5a93dbe076b1c5a5` |

Both labels use scorer SHA-256 `5c2d39dbefae23a89abd07a07eba61f05a3116f9477900f0b1324f1aa086781a`.
The fresh label exposes `analyzeHackathonSubmissions`, `getHackathonSubmission`, and `locateSource`.
It excludes `reviewSubmission`, `getRwaAssets`, `getQualityReport`, and `verifyClaim`.
All other exposure rules stay unchanged.
The fresh inventory files match the supplied `SHA256SUMS`.
The fresh label includes all four frozen pin files from addendum 1.

The following totals show top1/top3/top5/cardHit5.
The holdout column shows top1/top3/top5/forbiddenCaptures.

| Label | Legacy, n=338 | Extended, n=122 | Skills, n=23 | Holdout, n=49 | Routing command exit |
|---|---|---|---|---|---:|
| baseline-main | 219/298/326/112 | 93/111/117/16 | 17/23/23/23 | 12/26/29/10 | 0 |
| baseline-fresh | 220/298/326/112 | 93/112/117/16 | 17/23/23/23 | 12/26/29/10 | 1 |
| baseline-fresh-nopin, diagnostic | 220/298/326/112 | 93/112/117/16 | 17/23/23/23 | 12/26/29/10 | 1 |
| baseline-fresh-nolocate, diagnostic | 220/298/326/112 | 93/112/117/16 | 17/23/23/23 | 12/26/29/10 | 1 |

Each fresh routing command fails only the committed manifest fingerprint check.
Check 10 ignores that single fingerprint failure for the fresh label.
It keeps every numeric threshold and the extended comparison.
No gate file changed.
The conditional Groth16 floor decision does not apply to this phase.
The Groth16 skill remains at rank 3 on both source sets.

Both protocol-history diagnostics retain top1/top3/top5 of 7/7/7 across eight positives.
They retain three forbidden captures across four controls.
These twelve rows remain separate from every routing gate.
The main label has 1192 legacy gated hits; the fresh label has 1207.
The corresponding counts of legacy rows without gated hits are 35 and 33.

| Check | Requirement | Main | Fresh |
|---:|---|---|---|
| 1 | Preserve controlled YieldBlox/Reflector phrase intent | PASS | PASS |
| 2 | Reject generic research wording | PASS | PASS |
| 3 | Require repository intent for explainRepo | PASS | PASS |
| 4 | Preserve account-merge Docs with added use | PASS | PASS |
| 5 | Reject schema substring evidence | FAIL | FAIL |
| 6 | Preserve strong Docs against weak gated results | PASS | FAIL |
| 7 | Preserve eight corpus grades and fixture results | PASS | PASS |
| 8 | Pass RWA positives, negatives, and mixed controls | FAIL | FAIL |
| 9 | Preserve leaderboard and RFP improvements | PASS | PASS |
| 10 | Pass numeric gates and extended comparison | PASS | PASS |
| 11 | Preserve controlled directory vocabulary | PASS | PASS |
| 12 | Preserve paired source grades and exposure safety | FAIL | FAIL |

Check 5 fails through the existing keyword projection.
Adding `phase` raises the gated `has widgets` score from 141 to 143.
It also raises the ungated lookup score from 25 to 35.
The substring `has` still matches inside `phase` after another keyword supplies evidence.
The schema-only `status phase value` probe still scores 46.

Check 6 fails only through the fresh wallet control.
The main label returns `stellarDocs.search_wallet_dapp_docs` at rank 2, score 565.
The fresh label omits that operation.
Its new `approach` keyword matches the `app` token from `dApp`.
That evidence admits `stellarDocs.search_soroban_contract_docs` at gated score 178.
The fifth gated result then prevents the stronger wallet operation from entering the page.
Both synthetic weak-gated controls pass, as does the staking control.

Check 8 passes all four discovery positives and all eight ordinary negatives.
All three mixed implementation controls still fail on both labels.
The RWA fixture ranks 3 for simulation, 2 for wallet balances, and 1 for issuer protocol limits.
Each label builds that fixture from its own saved Scout inventory.

Check 12 fails because the paired sources change two grade flags.
Both changes are gains. The strict requirement permits zero changes.
It therefore rejects this source pair despite the absence of graded losses.

| Row | Grade | Main | Fresh |
|---|---|---|---|
| `q-defi-stellarx-what-is` | top1 | false | true |
| `q-edge-scf-v7-centralization-myths` | top3 | false | true |

All four named fresh-source regressions now meet their main grades.
The following table also checks the required operations directly.

| Row | Required operation | Main rank | Fresh rank |
|---|---|---:|---:|
| `q-defi-agentic-payment-standards-compare` | `stellarDocs.search_docs` | 3 | 3 |
| `q-defi-blend-alternatives` | `lumenloop.search_content_semantic` | 5 | 5 |
| `q-defi-rwa-overview` | `lumenloop.search_content_semantic` | 3 | 3 |
| `q-scf-funded-similar-payroll` | `lumenloop.find_similar_scf_submissions` | 3 | 3 |

`reviewSubmission` appears in neither manifest nor any ranked row.
That result proves exclusion safety for this build.
It does not establish safe ranking after exposure.
The sequence-number control returns only Docs operations.

The fresh hackathon operations still enter unrelated result pages.
The analysis operation enters five pages; submission detail enters four pages.
The following table records all nine appearances.

| Operation | Row | Fresh rank |
|---|---|---:|
| `analyzeHackathonSubmissions` | `q-comp-sep10-auth-role` | 2 |
| `analyzeHackathonSubmissions` | `q-defi-agentic-payment-standards-compare` | 5 |
| `analyzeHackathonSubmissions` | `q-defi-soroswap-what-is` | 5 |
| `analyzeHackathonSubmissions` | `q-infra-anchor-platform` | 4 |
| `analyzeHackathonSubmissions` | `q-holdout-b-14-compliance-backfill` | 4 |
| `getHackathonSubmission` | `q-defi-phoenix-scf` | 4 |
| `getHackathonSubmission` | `q-eco-pyusd-stellar-freshness` | 5 |
| `getHackathonSubmission` | `q-scf-hackathon-detail-results` | 2 |
| `getHackathonSubmission` | `q-scf-hackathons-active` | 5 |

I recommend excluding `locateSource` during the later source absorb.
Its exposed measurement enters these six top-five pages.

| Lane | Row | Rank | Query intent |
|---|---|---:|---|
| Legacy | `q-protocol-simple-lookup-no-deep-research` | 2 | Testnet network passphrase |
| Legacy | `q-sep-1-toml` | 3 | SEP-1 and the served stellar.toml location |
| Legacy | `q-soroban-contract-build-verification` | 3 | Deployed WASM verification and standards |
| Legacy | `q-tool-cli-skills-discovery` | 5 | Installable developer tools |
| Legacy | `q-tool-smart-wallet-repos-discovery` | 3 | Smart-wallet implementation repositories |
| Skills | `q-skill-assets-stablecoin-issuance` | 5 | Stablecoin issuance playbook |

These queries do not request a definition location inside an allowlisted repository.
The repository-discovery query also matches the operation's published `notFor` boundary.
The locator promises pointers into selected repositories, with no file content.
These captures show discovery interference; the corpus does not measure direct locator usefulness.

The exclusion diagnostic changes seven result orders and eleven pages' scores or membership.
It changes zero grade flags, holdout ranks, or protocol target ranks across all 544 rows.
The required fresh measurement still keeps `locateSource` exposed.
This recommendation does not change the tracked exposure policy.

The new stellar-light pin changes no searchable description or other scoring field.
It changes all twenty whole-skill provenance records through the manifest's shared synchronization timestamp.
It also changes the stellar-light transport and commit.
The pin diagnostic has zero grade, order, score, holdout-rank, or protocol-target changes across all 544 rows.

The skill read audit exercises the real source verification, exposure filter, and read implementation.
It uses the verified build cache as its transport.
Each fresh exposure choice passes a whole-skill read and sixteen section reads.
All seventeen reads contain zero excluded endpoint paths or operation names.
This includes the complete `references/api-reference.md` companion file.
The audit checks both `locateSource` exposure choices with the new pin.
The old-pin diagnostic and main label also pass all seventeen reads.

The current main baseline exactly matches the 2026-10-09 main baseline across all 544 rows.
Grades, orders, scores, holdout ranks, and protocol target ranks have zero differences.
The source and scorer changed since then, but these measured outputs did not change.

The current fresh baseline differs from the 2026-10-09 fresh baseline on five graded rows.
All five changes recover earlier losses.
Legacy totals improve from 220/295/325/111 to 220/298/326/112.
The extended, skills, and holdout totals stay unchanged.
The fresh acceptance failures remain checks 5, 6, 8, and 12.

| Recovered row | Recovered grade |
|---|---|
| `q-defi-agentic-payment-standards-compare` | top3 |
| `q-defi-blend-alternatives` | top5 |
| `q-defi-rwa-overview` | top3 |
| `q-defi-streaming-payments-prior-art` | cardHit5 |
| `q-scf-funded-similar-payroll` | top3 |

| Comparison | Changed grade rows | Changed orders | Changed scores or membership | Changed protocol targets |
|---|---:|---:|---:|---:|
| 2026-10-09 main → current main | 0 | 0 | 0 | 0 |
| 2026-10-09 fresh → current fresh | 5 | 54 | 83 | 0 |
| Current main → current fresh | 2 | 66 | 98 | 0 |
| Fresh old pin → fresh new pin | 0 | 0 | 0 | 0 |
| Fresh locator excluded → fresh locator exposed | 0 | 7 | 11 | 0 |

The helper remains strict on check 12.
It also compares derived protocol-history grades when source pairs change target ranks.
Check 1 remains a controlled phrase-retention probe.
Neither source contains literal YieldBlox or Reflector routing phrases.
Check 7 preserves both corpus grades and fixture presence, including their known label differences.
The short-token probes still return false scores of 27, 45, 27, and 55.
The dApp description override remains necessary.

| Verification | Exit | Evidence |
|---|---:|---|
| `npm run eval:selftest` | 0 | Grading and committed input checks pass |
| `npm run eval:compile` | 0 | Compiled cases match the tracked file |
| Catalog builds, all four labels | 0 each | Generated catalogs and saved manifests |
| `npm run eval:routing -- --gate`, main | 0 | `runs/baseline-main/routing.json` |
| `npm run eval:routing -- --gate`, three fresh labels | 1 each | Manifest fingerprint only |
| `node tmp/impl/acceptance.mjs baseline-main` | 1 | Checks 5, 8, 12 |
| `node tmp/impl/acceptance.mjs baseline-fresh` | 1 | Checks 5, 6, 8, 12 |
| `node tmp/impl/compare.mjs` | 0 | All four saved runs replay all 544 rows |
| `node tmp/impl/validate-helper.mjs` | 0 | Rejects changed manifest bytes, scorer binding, and a stale row |
| Skill read audits, all four labels | 0 each | Seventeen reads per label |
| Helper syntax checks | 0 | Acceptance, verification, snapshot, and comparison scripts |
| `git diff --exit-code` | 0 | Tracked files remain unchanged |

All gate commands ran without pipes.
All source builds used archive copies under `tmp/impl/`.
The main archive rebuild matches the tracked manifest byte for byte.
The final integrity record compares every tracked file with its initial hash.
The lead's existing untracked round ledger remains outside this lane's changes.
The work used USD 0 and made no model calls.
This phase finds no new verified upstream defect.
The observed failures belong to the existing routing repair.

The saved evidence uses `tmp/impl/runs/<label>/`.
Each directory contains `manifest.json`, `routing.json`, `inventory/`, `scorer.sha256`, and `receipt.json`.
The primary labels also contain `acceptance.json`.
The [comparison record](comparisons.json) contains all 544 rows for every comparison and every locator capture.
The [helper validation record](helper-validation.json) records the deliberate rejection checks.
Each label's `skill-read-audit.json` records the section hashes and exposure results.
Each label's `skill-read-evidence.json` preserves the complete returned content.
The [integrity record](final-integrity.json) records the final tracked-file comparison.

Replay the acceptance checks from the repository root:

```sh
node tmp/impl/acceptance.mjs baseline-main
node tmp/impl/acceptance.mjs baseline-fresh
```

Both commands must exit 1 for these saved baselines.
The helper also accepts paired `cN-main` and `cN-fresh` labels for candidates 1 through 6.
The saved receipts bind each label to its scratch source tree.
Wait for the lead's instruction before Phase 1.
