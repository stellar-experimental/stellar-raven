# Sol temporary-artifact review — 2026-08-29

## Verdict

**PASS.** HEAD `6817e9986eba01f45f3c9cbded19b619099dd9f6` owns every accepted implementation category.

No categorical work item lacks a durable destination. No implementation question lacks a durable destination.

The five-track, retry, trap, and lifecycle contracts remain queued. The repository does not claim that they shipped.

I did not read `research/audits/2026-08-29-temp-artifact-reconciliation/fable-review.md`.

## Scope and method

I inspected all 20 requested top-level `/tmp` artifacts. I also inspected four Raven Claude scratchpad families.

The scratchpad set includes both `eval-block2` worktree sessions. The audit excludes `node_modules`.

I compared the artifacts with code, tests, eval records, research, ideas, improvements, and git history.

I treated logs and generated JSON as evidence families. I separated files that contain a distinct implementation question.

## Explicit inventory

The classification words match the requested classification set.

| Artifact or evidence family | Classification | Current durable destination | Missing change |
| --- | --- | --- | --- |
| `/private/tmp/raven-owner-decisions-fable.md` | Superseded with a durable disposition | `research/decisions/0008-human-review-eval-and-playground-policy.md`; `.agents/rounds/2026-08-28-human-review-grill.md` | None. The later Q16–Q20 chain replaced its provisional questions. |
| `/private/tmp/raven-owner-decisions-fable-addendum.md` | Superseded with a durable disposition | ADR-0008; `.agents/TODO.md` “Eval instruments”; `run-evals` | None. The final contract rejects an automatic score rewrite. T3 uses behavior evidence and keeps contradictions in T4. |
| `/private/tmp/raven-decisions-fable-xhigh.md` | Superseded with a durable disposition | Later Fable decision files; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-fable-reconciliation.md` | Superseded with a durable disposition | `/private/tmp/raven-decisions-fable-final.md`; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-fable-final.md` | Superseded with a durable disposition | `/private/tmp/raven-decisions-fable-close.md`; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-fable-close.md` | Superseded with a durable disposition | `/private/tmp/raven-decisions-fable-sampling.md`; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-fable-sampling.md` | Fully captured | ADR-0008 “Golden lifecycle”; `run-evals`; `.agents/TODO.md` | None. Sampling uses the full pool before partitioning. It never re-picks. |
| `/private/tmp/raven-decisions-sol-xhigh.md` | Superseded with a durable disposition | Later Sol decision files; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-sol-reconciliation.md` | Superseded with a durable disposition | `/private/tmp/raven-decisions-sol-final.md`; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-sol-final.md` | Superseded with a durable disposition | `/private/tmp/raven-decisions-sol-close.md`; then ADR-0008 | None. |
| `/private/tmp/raven-decisions-sol-close.md` | Fully captured | ADR-0008; `.agents/rounds/2026-08-28-human-review-grill.md` | None. |
| `/private/tmp/raven-decisions-sol-sampling.md` | Fully captured | ADR-0008; `run-evals`; `.agents/TODO.md` | None. |
| `/private/tmp/eval-refusal-policy.json` | Generated/transient | ADR-0008; `run-evals`; `.agents/TODO.md` | None. This search-result JSON supports the refusal discussion. It owns no policy. |
| `/private/tmp/hyg-comment-sk-006.md` | Fully captured | `improvements/resolved.json` entry `sk-006`; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sk-009.md` | Fully captured | `improvements/resolved.json` entry `sk-009`; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sd-008.md` | Fully captured | `improvements/resolved.json` entry `sd-008`; updated QA provenance; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sd-025.md` | Fully captured | `improvements/resolved.json` entry `sd-025`; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sls-074.md` | Fully captured | `improvements/resolved.json` entry `sls-074`; two repaired QA cases; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sls-075.md` | Fully captured | `improvements/resolved.json` entry `sls-075`; eval documentation; commit `842f953` | None. |
| `/private/tmp/hyg-comment-sls-076.md` | Fully captured | `improvements/resolved.json` entry `sls-076`; commit `842f953` | None. |
| `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/518ac614-95a1-42df-bb0b-305e3d2d33c6/scratchpad/section.md` | Fully captured | `.agents/rounds/2026-08-28-live-drift-86.md`; commits `d08212f`, `0133653`, and `c9b99f7` | None. The final routing pin and resolver coverage landed. |
| Same scratchpad: `apiref.old.md`, `apiref.new.md`, `apiref.diff`, `q.old.json`, `q.new.json`, `live-openapi.json`, `routing-cases.before.json` | Generated/transient | The live-drift ledger, generated inventory, manifest, pin review, and git history | None. |
| Same scratchpad: `typecheck.log`, `test.log`, `test2.log`, `build.log`, `pinreview.log`, `evalcompile.log`, `evalrouting.log`, `secrets.log`, `mirrors.log`, `oc.log`, `oc.bak`, `mm.log`, `mm.bak` | Generated/transient | `.agents/rounds/2026-08-28-live-drift-86.md` gate record | None. |
| `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/d2c13b65-147b-48b3-ba0a-6aba402d8e91/scratchpad/hyg-common.md` | Generated/transient | `.agents/rounds/2026-08-28-improvements-hygiene.md` | None. This file only assigns lane rules. |
| Same scratchpad: `hyg-lint-brief.md`, `hyg-lint-report.md` | Fully captured | Improvements scripts and tests; commit `5e23340` | None. |
| Same scratchpad: `hyg-recheck-brief.md`, `hyg-recheck-report.md`, `hyg-recheck-repairs.md` | Fully captured | Updated finding records; hygiene round ledger; commit `5e23340` | None. |
| Same scratchpad: `hyg-retire-brief.md`, `hyg-retire-report.md`, `hyg-resolve-brief.md`, `hyg-resolve-report.md` | Fully captured | `improvements/resolved.json`; repaired QA provenance; commit `842f953` | None. |
| Same scratchpad: `hyg-review-brief.md`, `hyg-review-report.md` | Fully captured | Hygiene round reconciliation; commits `5e23340` and `842f953` | None. All review findings were reconciled. |
| Same scratchpad: `b2-common.md` | Generated/transient | `.agents/rounds/2026-08-28-eval-block2.md` | None. This file only assigns lane rules. |
| Same scratchpad: `b2-grokpin-brief.md`, `b2-grokpin-report.md` | Fully captured | Demo model config, gauntlet, and tests; commit `17291e2` | None. |
| Same scratchpad: `b2-resolver-case-brief.md`, `b2-resolver-case-report.md` | Fully captured | Passport QA case and compiled artifacts; commit `17291e2` | None. |
| Same scratchpad: `b2-evalrun-brief.md`, `b2-evalrun-report.md` | Fully captured | `eval/qa/README.md`; consistency register; eval-block2 ledger | None. Local result JSON remains intentionally gitignored evidence. |
| Same scratchpad: `b2-findings-brief.md`, `b2-findings-report.md` | Fully captured | `sls-079`; `ll-030`; `.agents/TODO.md` “Eval instruments”; commit `17291e2` | None. |
| Same scratchpad: `b2-review-brief.md`, `b2-review-report.md` | Fully captured | Eval-block2 ledger; reconciled files in commit `17291e2` | None. The final re-verification passed. |
| Eval-block2 scratchpad `4850fd67-2e0c-4490-9dfe-da53dae627bd`: `baseline-ids.txt`, `baseline-ids-csv.txt`, `comparable-ids.txt`, `comparable-ids-644f364.txt`, `changed-ids.json`, `case-change-report.json`, `cases-baseline.json`, `comparison.json` | Generated/transient | Eval-block2 ledger and `eval/qa/README.md` comparison record | None. |
| Same scratchpad: `wrong-rows.txt`, `keyfact-diffs.txt`, `reopen-members.txt`, `reopen-field-summary.json`, `open-reopens.json`, `reopen-commits.json`, `case-paths.json`, `reconcile-reopens.mjs` | Fully captured | Consistency register; four eval-instrument TODO items; eval-block2 ledger | None. These files answer distinct triage questions. |
| Same scratchpad: `judge-stability-preview.json`, `raven-eval-surface-b2.json`, `phase2-run.log` | Generated/transient | QA README; eval-block2 ledger; TODO stability item | None. |
| Same scratchpad: `gate-typecheck.txt`, `gate-test.txt`, `gate-secrets.txt`, `gate-register.txt`, `gate-selftest.txt`, `gate-qalint.txt`, `gate-compile.txt`, `gate-qacompile.txt`, `p3-typecheck.txt`, `p3-test.txt`, `p3-secrets.txt`, `p3-selftest.txt`, `p3-qalint.txt`, `p3-qalint-since.txt` | Generated/transient | Eval-block2 ledger gate record | None. |
| Eval-block2 scratchpad `d85946a3-616a-42f2-bed2-727073861dc3`: `projects.json`, `openapi.json`, `resolve-passport.json`, `cases-main.json`, `sample-main.json` | Generated/transient | Passport case, compiled QA artifacts, and eval-block2 ledger | None. |
| Same scratchpad: `gates-base.txt`, `gates-eval.txt` | Generated/transient | Eval-block2 ledger gate record | None. |
| `/Users/kalepail/.claude/projects/-Users-kalepail-Desktop-stellar-raven-codemode/memory/production-deployment-facts.md` | External-only | Claude project memory | None. It contains deployment memory, not a 2026-08-28 work category. |
| Dated Claude `tool-results/*.txt` under the Raven and eval-block2 project roots | Generated/transient | Matching scratchpad reports and round ledgers | None. They duplicate task output or raw tool output. |

## Eval statistics reconciliation

The scratchpad evidence and the durable README agree on the same-100 run.

| Measure | Reconciled value | Durable owner |
| --- | ---: | --- |
| Result artifact | `2026-08-28T19-27-08-variantA.json` | `eval/qa/README.md` |
| Raw verdicts | 45 correct, 35 partial, 16 wrong, 4 error | `eval/qa/README.md` |
| Half-credit | 62.5% | `eval/qa/README.md` |
| Strict | 45.0% | `eval/qa/README.md` |
| Core-answer | 88.5% | `eval/qa/README.md` |
| Continuous coverage | 67.1% | `eval/qa/README.md` |
| Comparable IDs | 41 of 100 | Eval-block2 ledger |
| Comparable verdict mix | 25 correct and 10 partial on both runs | Eval-block2 ledger |
| Golden changes | 59 of 100 IDs | `.agents/TODO.md` affected-ID item |
| Per-row flip rate | 22.0% against the 23.3% noise floor | `eval/qa/README.md` |
| Judge tiers | 90 single and 10 panel | `eval/qa/README.md` |
| Boundary rows without a panel | 21 | `.agents/TODO.md` panel-cap item |
| Judge stability below 0.75 | 57 of 100 | `.agents/TODO.md` stability item |
| Register reopens | 18 reconciled to zero | `eval/qa/consistency-register.json` |
| Cost | `$31.9693122` | Eval-block2 ledger |

The repository treats the three-point aggregate decrease as diagnostic. It does not claim a product regression or gain.

The 59 changed goldens prevent an aggregate causal comparison. The affected-ID TODO prevents this reconstruction problem from recurring.

## Retry and trap contracts

Every accepted retry rule has one durable policy owner and one queued implementation owner.

| Contract | Durable policy | Implementation state |
| --- | --- | --- |
| Preserve first attempts | ADR-0008 T1 and T2 | Queued in `.agents/TODO.md` `qa-five-track-v1` |
| Retry answer transport once | ADR-0008 T2; `run-evals` | Queued |
| Use byte-identical prompt bytes | ADR-0008 T2; `run-evals` | Queued |
| Never retry safeguards | ADR-0008 T5; `run-evals` | Queued tests cover the prohibition |
| Never retry timeouts | ADR-0008; `run-evals` | Queued tests cover the prohibition |
| Never retry consistency contradictions | ADR-0008 T4; `run-evals` | Queued tests cover the prohibition |
| Retry a judge CLI or parse failure once | ADR-0008 T4; `run-evals` | Queued across inline and stored resumes |
| Count every retry cost | ADR-0008; `.agents/TODO.md` | Queued |
| Derive T3 from behavior | ADR-0008 T3 | Queued. `judgeScore` remains diagnostic only. |
| Keep trap contradictions in T4 | ADR-0008 T3 and T4 | Queued |
| Repair the two judge contradictions | `.agents/TODO.md` | Queued as a separate rubric or trap-path change. |

The addendum proposed an automatic trap score rewrite. The accepted package did not adopt that proposal.

The accepted package keeps `successful-trap-refusal-not-correct` as T3 pass evidence and a T4 contradiction.

It treats `fired-avoid-not-wrong` as T3 failure evidence and a T4 contradiction. This disposition is durable.

## Categorical work inventory

| Work category | Current durable destination | State |
| --- | --- | --- |
| Scout 1.9.1 drift and excluded schemas | Live-drift ledger, inventory, manifest, pin review | Landed |
| `scout.resolveProject` coverage | Passport QA case and compiled artifacts | Landed |
| Improvements title lint | Shared library, lint, filer, and tests | Landed |
| Stale finding rechecks | Active finding records and hygiene ledger | Landed |
| Seven fixed-upstream retirements | `improvements/resolved.json` and repaired QA provenance | Landed |
| Grok 4.6 control pin | Demo model config, gauntlet, and tests | Landed |
| Same-100 record and judge-tier verification | QA README and eval-block2 ledger | Landed |
| Stability, panel cap, and contradiction defects | `.agents/TODO.md` “Eval instruments” | Already queued |
| Affected-ID recording | `golden-truth`; `.agents/TODO.md` | Already queued |
| Sourcing-guard and corroboration audits | `.agents/TODO.md` warning audit | Already queued |
| Canonical-page conflict repairs | `.agents/TODO.md`; `golden-truth` | Already queued |
| Repository-level recovery suite | `.agents/TODO.md`; ADR-0008 | Already queued |
| `sources.locate` | `ideas/source-delivery-ranked-references.md` | Superseded with a durable deferral |
| Five-track outcome accounting | ADR-0008; `.agents/TODO.md`; `run-evals` | Already queued |
| Golden lifecycle | ADR-0008; `.agents/TODO.md`; both eval skills | Already queued |
| Playground 8,000-character limit | ADR-0008; `.agents/TODO.md` | Already queued |
| Durable Playground sessions | `ideas/shareable-durable-playground-sessions.md` | Superseded with a durable deferral |
| Connectors Directory work | Connectors round addendum and `.agents/NEXT.md` | External-only |

## Missing destinations and changes

No accepted implementation question lacks a destination. No artifact requires a new TODO, idea, improvement, test, or code change.

Earlier review stages contain rejected alternatives and temporary blockers. Later acceptance files and ADR-0008 provide their durable dispositions.

The current code does not yet stamp `meta.trackSchema: "qa-five-track-v1"`. It also has no lifecycle fields.

Those absences are expected queued work. They are not missing durable work.

## Verification

- `git rev-parse HEAD` returned `6817e9986eba01f45f3c9cbded19b619099dd9f6`.
- Git history contains the drift, hygiene, eval-block2, and human-review commits.
- Repository searches found every accepted five-track and lifecycle term in ADR-0008 and the TODO.
- Repository searches found no shipped `qa-five-track-v1` code path.
- I changed only this report.

## Focused reconciliation

This section supersedes the earlier `PASS` verdict. The final verdict is **CHANGES-REQUESTED**.

### M1–M8 disposition

| Item | Classification | Current durable destination | Required change |
| --- | --- | --- | --- |
| M1 paired non-regression method | TODO-required | `.agents/skills/run-evals/SKILL.md`; `.agents/TODO.md` “Eval instruments” | Queue method design and validation. Do not queue the addendum thresholds as an accepted gate. |
| M2 behavior proof for trap rows | TODO-required | ADR-0008 T3; `.agents/TODO.md` contradiction item; `eval/qa/judge.mjs`; `eval/qa/verdict-consistency.mjs` | Add behavior fixtures for each trap class. A generic refusal must fail when the required legitimate behavior is absent. |
| M3 exact 41/59 partition | dated-audit-only | This focused reconciliation; Fable's dated audit contains the 41-ID list | Keep both exact partitions with revisions in a dated audit. No new standing TODO is required. |
| M4 `sk-006` successor candidate | existing-destination | `research/audits/2026-07-10-gt41-soroban-empirical-findings.md`; `eval/qa/consistency-register.json`; `ideas/codegen-correctness-substrate.md` | No patch. Keep the retired finding closed until the recurrence threshold is met. |
| M5 generator cleanups | TODO-required in part | `scripts/improvements-resolve.mjs`; `scripts/improvements-lib.mjs`; `improvements/INDEX.md` | Reject the direct regex replacement. Fix the current blockquote-title defect with a test and regeneration. |
| M6 suite and golden notes | TODO-required in part | `.agents/TODO.md` Routing item; `.agents/skills/golden-truth/SKILL.md`; two corpus cases | The suite metadata has an existing destination. Reject the Passport split. Queue the stale `truth.asOf` correction. |
| M7 ledger-close documentation conflict | TODO-required | `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`; dated GT-32 research | Recheck the golden through `golden-truth`. File a Docs finding if the source conflict remains. |
| M8 GLM 5.3 Flash trial | dated-audit-only | Both 2026-08-28 round ledgers | No roster patch. Correct the claimed lane count and preserve the balanced outcomes in dated records. |

### Statistical review of M1

The addendum's exact paired gate is not safe as a queued specification.

- Classical McNemar testing uses binary paired outcomes. The proposed `correct/partial/wrong` direction is an ordinal sign test.
- Rejudging observed discordances and dropping changed pairs conditions the sample on the observed outcome.
- One extra judgment does not remove judge error. It only applies another noisy measurement.
- `k_down <= 1` does not prove a regression margin. A non-inferiority claim needs a margin and power calculation.
- A sign-test `p` value tests directional symmetry. It does not test the proposed three-row regression threshold.
- A second replicate after `INDETERMINATE` creates optional stopping unless the repeat rule is fixed beforehand.
- T4 and T5 exclusions must be fixed before collection. Outcome-dependent exclusions change the estimand.

M1 still needs a durable destination. The TODO must require simulations or backtests against repeated judgments.

The task must define the estimand, non-inferiority margin, power, and fixed replicate rule. It must preserve three outcomes.

### Generic-refusal proof for M2

The behavior proof is missing. `eval/qa/judge.mjs` names several acceptable trap behaviors in one generic instruction.

`eval/qa/verdict-consistency.mjs` rejects one rationale pattern about an omitted legitimate part. Its tests do not cover every trap class.

The Fable statement “39 of 41” is internally inconsistent. It names three exceptions, which would leave 38 cases.

The fix must test required behavior, not key-fact position. It must cover a legitimate answer, clarification, boundary, alternative, and scam warning.

A refusal alone must not pass T3 when the golden requires another behavior. ADR-0008's accepted T3 accounting remains unchanged.

### Exact M3 comparison partition

The exact partitions must be durable. Counts and commit hashes do not preserve the audit denominator without reconstruction.

This list compares judge-visible `question`, `golden`, and `tags` at `9bb465d` and `644f364`.

The 41 byte-identical IDs are:

`q-aas-sep30-recoverable-wallets`, `q-anchor-sdp-vs-anchor-platform`,
`q-asset-rwa-tokenized-freshness`, `q-asset-two-account-issuer`,
`q-comp-auth-flags-overview`, `q-comp-cross-moneygram-partnership-sep24`,
`q-comp-sep8-number-lookup-no-deepresearch`, `q-defi-bridge-evm-to-stellar-axelar`,
`q-defi-comet-what-is`, `q-defi-skill-ecosystem-scout`, `q-eco-pyusd-stellar-freshness`,
`q-edge-noinfo-stellar-native-privacy-default`, `q-gap-av-offset-not-timestamp`,
`q-gap-match-partners-degrade`, `q-gap-related-projects-empty`,
`q-gap-upcoming-hackathon-fallback`, `q-history-ecosystem-index-freshness-live`,
`q-jutsu-what-is-a-memo`, `q-n3-missing-funds-account-support`,
`q-n3-ssrf-metadata-endpoint`, `q-protocol-ledger-close-time`,
`q-protocol-operation-types-list`, `q-raph-offramp-xlm-usdc`,
`q-raph-scam-spam-tokens`, `q-scf-history-soroswap`, `q-scf-rfps-hackathons-live`,
`q-sep-31-cross-border`, `q-sep-53-sign-verify-message`, `q-sep-catalog-list`,
`q-sor-doc-page-sections-followup`, `q-sor-sep41-transfer-vs-transferfrom`,
`q-soroban-contract-id-derivation`, `q-soroban-oz-token`, `q-soroban-sdk-cve`,
`q-soroban-sdk-macros`, `q-stellar-recurring-payments`,
`q-ti-vocab-content-tags-live`, `q-token-circle-usdc-on-stellar`,
`q-tool-indexer-repos-discovery`, `q-tool-sep41-status-live`, `q-zk-circuit-setup`.

The 59 changed IDs are:

`q-aas-burn-clawback-redemption-mechanics`, `q-aas-list-token-on-exchanges-aggregators`,
`q-agent-identity-erc8004-stellar`, `q-asset-issue-asset-howto`,
`q-asset-stablecoin-issuers-discovery`, `q-comp-finclusive-caas`,
`q-crp-partner-detail-after-discovery`, `q-defi-allbridge-what-is`,
`q-defi-arbitrage-pathpayment-bots`, `q-defi-etherfuse-stablebonds`,
`q-defi-perps-whitespace`, `q-defi-phoenix-what-is`, `q-defi-wisdomtree-crdt`,
`q-eco-defi-market-map`, `q-eco-stellar-wallets-list`, `q-edge-1xlm-activation-fee`,
`q-edge-asset-site-scam-detection`, `q-edge-exchange-memo-lost-funds`,
`q-edge-fresh-latest-blend-tvl`, `q-edge-fresh-latest-scf-round`,
`q-edge-send-me-free-xlm`, `q-gap-builders-person-empty`,
`q-hist-quantum-preparedness-plan`, `q-infra-horizon-vs-rpc`,
`q-infra-secp256r1-passkeys`, `q-mpp-discovery-and-modes`,
`q-org-sdf-enterprise-fund`, `q-pay-moneygram-ramps`,
`q-pc-bucketlist-vs-merkle-inclusion-proof`, `q-pc-multisig-setup-lifecycle`,
`q-pc-protocol-27-zipper`, `q-pc-sponsored-reserves`, `q-protocol-23-whisk-caps`,
`q-protocol-base-reserve-min-balance`, `q-protocol-state-archival-ttl`,
`q-quickstart-manual-ledger-close`, `q-raph-hardware-wallet`, `q-raph-xlm-simple`,
`q-scf-academic-research-grant`, `q-scf-build-tracks`,
`q-scf-ecosystem-listing-partner-jobs`, `q-scf-how-to-apply`, `q-scf-open-rfps`,
`q-scf-v7-changes`, `q-sep6-sep24-sep31-choice`, `q-sor-confidential-tokens`,
`q-sor-cross-warmancer-zk-stack`, `q-sor-p23-auto-restore-extendto`,
`q-soroban-auth-delegation-p27`, `q-soroban-auth-recursion-dos-audit`,
`q-soroban-factory-pattern`, `q-soroban-token-transfer-pattern`,
`q-ti-connect-wallet-button-code`, `q-ti-custodial-account-generation-c-address`,
`q-ti-freighter-localhost-not-detected`, `q-ti-rpc-gettransactions-pagination-xdr`,
`q-ti-testnet-usdc-faucet`, `q-tool-freighter-wallet`, `q-tool-passkeykit-smart-wallet`.

The existing future-round TODO remains correct. Each new golden-edit round must record its affected IDs.

### Current-fact review of M5–M8

- M5a is not a valid direct cleanup. The private regex is global, while `GITHUB_EVIDENCE_REF_RE` is not global.
- Reusing the shared regex with `.match` would return only one reference. A future refactor needs a shared extraction helper.
- M5b is current. `improvements/INDEX.md:48` starts the `sd-036` title with `>`.
- M6 suite provenance already belongs to the Routing TODO. Exact metadata fields are implementation details for that destination.
- M6's Passport complaint is not valid. The three facts each contain one necessary contrast and satisfy the key-fact limit.
- M6's `q-tool-soroban-auth-audit-live` mismatch is current. `truth.asOf` is `2026-08-25`; verification is `2026-08-28`.
- M7 is current. Official Stellar Docs still say ledgers close approximately every five seconds.
- The golden attributes 5–7 seconds to current official wording. That attribution conflicts with the cited source.
- The dated 199-ledger observation can remain valid. The source attribution needs separate verification.
- M8's roster absence is current. Its “three lanes” statement is false because the model ran four lanes.
- The four lanes were hygiene A, hygiene C, eval G, and eval H. Their outcomes were mixed.
- The roster documents current callable routing evidence. The two dated ledgers already own this one-off trial.

The current M7 source is the official [History Ledgers page](https://developers.stellar.org/docs/data/analytics/hubble/data-catalog/data-dictionary/bronze/history-ledgers).

### Ledger corrections

Both round tables still mark orchestration as `in progress`. Every other lane and review is complete.

`.agents/rounds/2026-08-28-improvements-hygiene.md` also has two stale Outcome statements.

- Lane B says `sls-077` and `sls-078` are filing-ready. Later ledger entries record issues `#1086` and `#1087`.
- Lane C says retirement is recommended. Later entries record all seven completed retirements.

`.agents/rounds/2026-08-28-eval-block2.md` uses ambiguous filing words.

- Lane H says `sls-079` and `ll-030` were “filed as proposed.” The repository only created proposed finding records.
- The follow-up means upstream filing. It must say “await verifying re-execution before upstream filing.”

### Exact minimum patch list

1. Extend `.agents/TODO.md` with an M1 method-validation task. Require a fixed estimand, margin, power, and repeat plan.
2. Extend the existing `.agents/TODO.md` contradiction item with behavior fixtures for every trap class.
3. Update `scripts/improvements-lib.mjs` to strip a leading blockquote marker in `oneLineTitle`.
4. Add the M5b regression test to `test/improvements-resolve.test.ts`. Regenerate `improvements/INDEX.md` through its script.
5. Queue `q-tool-soroban-auth-audit-live` for a `golden-truth` `truth.asOf` correction.
6. Queue `q-protocol-ledger-close-time` for a `golden-truth` source review. File an improvement only after direct confirmation.
7. Mark orchestration `completed` in both 2026-08-28 ledgers.
8. Update the hygiene Outcome to record the two filed issues and seven completed retirements.
9. Replace “filed as proposed” with “created as proposed” in the eval-block2 Outcome.
10. Add “upstream” before “filing” in the eval-block2 follow-up.

No patch is required for M3, M4, M5a, the Passport wording, or M8. This section now preserves M3's exact partition.

**Final verdict: CHANGES-REQUESTED.**

## Final patch review

**PASS.** The patch captures future work without implementing it.

This verdict supersedes the focused `CHANGES-REQUESTED` verdict. HEAD remains
`6817e9986eba01f45f3c9cbded19b619099dd9f6`.

### Required destinations

| Requirement | Applied destination | Review result |
| --- | --- | --- |
| M1 method validation | `.agents/TODO.md` “Design and validate a paired comparison verdict”; `.agents/NEXT.md` | Captured. The task rejects unvalidated addendum thresholds. |
| M2 generic-refusal proof | Existing contradiction item in `.agents/TODO.md`; `.agents/NEXT.md` | Captured. The task requires positive and negative behavior fixtures. |
| M3 exact comparison partition | This dated audit; reconciliation `README.md` | Captured. This report contains both exact ID lists and both revisions. |
| M4 `sk-006` candidate | Existing GT-41 research, consistency register, and idea file | Unchanged. No new work is queued below the recurrence threshold. |
| M5 generator repair | `.agents/TODO.md` “Remove a blockquote marker from generated improvement titles” | Captured. Code, tests, and generated output correctly remain future work. |
| M5 regex proposal | The M5 TODO rejection and this dated audit | Rejected. The patch does not replace the global matcher with the non-global matcher. |
| M6 suite metadata | Existing Routing TODO | Unchanged. The existing provenance and freeze contract owns implementation details. |
| M6 Passport wording | This dated audit | Rejected. The patch does not change the accepted golden. |
| M6 `truth.asOf` conflict | `.agents/TODO.md` “Recheck two dated source-metadata conflicts” | Captured through `golden-truth`. |
| M7 ledger-close source conflict | The same source-metadata TODO | Captured. An improvement requires direct confirmation first. |
| M8 GLM trial | Both dated 2026-08-28 ledgers; this audit | Captured as four lanes. No model-roster change is required. |
| Generated logs and JSON | Dated audit inventory | Preserved as generated or transient evidence families. |
| External actions | Dated reconciliation `README.md` | Preserved as external-only. No action occurred. |

The queued M5 repair satisfies the requested durable capture. This review does not require the generator code now.

### Ledger review

Both orchestration rows now say `completed`.

The hygiene Outcome now records issues `#1086` and `#1087`. It also records all seven retirements.

The eval-block2 Outcome now says the two records were created as `proposed`. The follow-up now names upstream filing.

These changes match later entries in each ledger. They do not change any owner decision.

### Owner-decision and scope review

The patch changes no ADR, decision record, accepted golden, implementation file, test, or generated index.

`.agents/NEXT.md` only mirrors the expanded durable queue. The human-review README only links the later reconciliation.

The reconciliation README summarizes the inventory and dispositions. It does not promote a temporary artifact into policy.

The initial no-read statement describes the first audit pass. The focused pass later read Fable at the user's request.

### Verification

- `git rev-parse HEAD` returned `6817e9986eba01f45f3c9cbded19b619099dd9f6`.
- `git diff --check HEAD` passed.
- The tracked patch contains five documentation, queue, and ledger files.
- The reconciliation directory contains its README and two dated review reports.
- No code test was necessary because this patch only captures future work and corrects records.

### Remaining findings

None.

**Final verdict: PASS.**
