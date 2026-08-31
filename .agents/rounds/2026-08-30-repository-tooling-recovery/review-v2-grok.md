# Independent review: repository recovery v2

- Reviewer: Grok 4.6, high effort. Independent of the Terra author, the Sol collector and diagnosis, the Fable planner, and the `claude-sonnet-5` answering model.
- Date: 2026-08-30
- Mode: audit only. No repository file changed. No paid eval, deploy, push, or merge ran.
- Fixed point: commit `d451ca499f700f7ad689c5707496e0ae50fe6656` versus parent `497181ca5b774e7639f663f9ee22d61facb749f1`.
- HEAD matches that commit. The worktree is clean.
- Controlling plan: `.agents/rounds/2026-08-30-repository-tooling-recovery/fable-plan-fourth-run.md`.
- Diagnosis read for context: `.agents/rounds/2026-08-30-repository-tooling-recovery/sol-diagnosis-fourth-run.md`.
- Author handoff read: `/tmp/repo-recovery-v2-author-terra.md`.

This commit is a measurement-contract repair. It is not a product change. It is not a ranking change. It is not a golden change.

## Blocking findings

### B1. Fourth-run grounded count is false

- Files: `.agents/rounds/2026-08-30-repository-tooling-recovery.md:1141`; `.agents/rounds/2026-08-30-repository-tooling-recovery/fable-plan-fourth-run.md:52`
- Observed: both records say answers were 15 of 20 correct and 15 of 20 grounded.
- Direct count from `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-annotations.json`: 15 of 20 `correct: true`, 17 of 20 `grounded: true`. The joined reviewed artifact matches byte for byte. Zero join mismatches.
- The two extra grounded rows are incorrect: `rr-pos-cli-config-home-env` and `rr-pos-horizon-max-supported-protocol`. Three rows are incorrect and ungrounded: `rr-pos-go-sdk-query-enums`, `rr-pos-js-rpc-durability-values`, `rr-pos-js-rpc-insecure-http-guard`. All eight negatives are correct and grounded. Positives are 7 of 12 correct and 9 of 12 grounded.
- Consequence: the committed fourth-run identity understates grounded answers by two. Those two rows are the upstream answer defects. `sls-080` depends on the Horizon row being grounded. Copying the correct count onto the grounded count hides that split.
- Repair: set the aggregate to 15 of 20 correct and 17 of 20 grounded. Keep the per-case tables. Do not change hashes, goldens, or the grader.

The v2 measurement code is not the defect. The committed history of the fourth run is.

## Verdict

CHANGES-REQUESTED

The v2 suite still implements the pre-registered set rule `{empty, adjacent}`. Immutable case facts remain intact. Label leakage is blocked. Digests and identity fail closed. Thresholds and negatives stay at 10 of 12 and 0 of 8. The ignored fourth-run files sit at the renamed paths with the claimed file hashes. `sls-080` is a verified Scout finding with live collection provenance. `improvements/INDEX.md` is generated. No `src/`, catalog, or ranking file moved.

The fourth v1 artifact still fails the gate. A diagnostic set-rule regrade of that stored trace is 7 of 12. The threshold stays 10. This is not score laundering.

The ledger and the Fable plan misreport grounded answers as 15 of 20. The annotations say 17 of 20. Correct that identity line before treating the fourth-run record as closed.

## Checklist

| Question | Result |
| --- | --- |
| v2 truthfully implements the pre-registered set rule | Yes |
| All immutable case facts and v1 history preserved | Mixed: case files and result hashes match; grounded aggregate is false |
| Label leakage prevented | Yes |
| Digests and identity enforced | Yes |
| Thresholds and negatives unchanged | Yes |
| Comparability documented | Yes |
| Ignored artifacts at exact renamed paths | Yes |
| `sls-080` status and provenance valid | Yes |
| Generated INDEX derived | Yes |
| No product or ranking change | Yes |

## Scope

Sixteen paths changed. No TypeScript product file changed. No catalog file changed. No `scripts/catalog-data` file changed. No recovery-receipt, executor, search, server, or smoke test changed.

Changed paths:

- `eval/repo-recovery/contract.mjs`
- `eval/repo-recovery/cases.json`
- `eval/repo-recovery/lint.mjs`
- `eval/repo-recovery/measure.mjs`
- `eval/repo-recovery/README.md`
- `eval/EVALS.md`
- `test/repo-recovery.test.mjs`
- `test/repo-recovery-artifact.test.mjs`
- `research/decisions/0010-repository-recovery-contract-v2.md`
- `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`
- `improvements/INDEX.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery/fable-plan-fourth-run.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery/sol-diagnosis-fourth-run.md`
- `.agents/TODO.md`
- `.agents/NEXT.md`

Sol’s diagnosis asked for a product authority bundle in ranked `search`. Fable rejected that change for this block. Terra followed Fable. That scope choice is correct.

## Set rule

`positiveRowPass` now requires `RECOVERY_TRIGGER_OUTCOMES.has(initialCall?.evidence)` with the set `{empty, adjacent}`.

It no longer compares `initialCall.evidence` to a per-case `initialEvidence.outcome`.

Every other positive check is unchanged:

- required Docs operation present
- exactly one `scout.explainRepo`
- later execute
- frozen repository pin
- correct grounded answer with non-empty evidence
- zero projection errors

`EVIDENCE_OUTCOMES` remains `empty | adjacent | sufficient | other`. `sufficient` and `other` still fail a positive. Tests cover both failure labels and an `adjacent` pass.

I regraded the stored fourth reviewed rows outside any identity claim:

| Rule | Positive passes |
| --- | ---: |
| v1 exact label equality | 3 of 12 |
| v2 set membership | 7 of 12 |

The seven v2 diagnostic passes are:

- `rr-pos-go-sdk-trade-resolutions`
- `rr-pos-js-rpc-sleep-strategies`
- `rr-pos-go-sdk-default-horizon-clients`
- `rr-pos-env-host-depth-limit`
- `rr-pos-cli-stellar-soroban-dir-precedence`
- `rr-pos-go-sdk-timebound-factories`
- `rr-pos-go-sdk-horizon-timeout`

That list matches Fable §4.3. No stored run crosses the unchanged threshold of 10.

## Immutable case facts and v1 history

Parsed JSON comparison of parent versus HEAD cases, after deletion of `initialEvidence.outcome`, is empty. These fields are byte-identical for all 20 cases:

- `id`
- `class`
- `question`
- `repository`
- `initialEvidence.id`
- `expectedOperationOrder`
- `golden`
- `truth`

Case order is unchanged. Ordered-ID digest is unchanged:

`sha256(ids.join("\\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`

v1 authorship is kept in `contractProvenance`: `authoredAt`, `blindAuthor`, and `startingRevision` `b53f62d3e6370231103b221e5474ecb6cbfd5627`. The v2 fields add `supersedes`, `supersededAt`, `reason`, and `decision`. They do not rewrite v1 history.

The fourth collection artifact still carries `contract: repository-tooling-recovery-v1` and case-content digest `5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534`. The ledger records the v1 grade as 3 of 12. It labels 7 of 12 as a diagnostic. It does not promote the fourth run. It also records 15 of 20 grounded. That grounded count is false. See B1.

## Label leakage

`cases.json` keeps only `initialEvidence.id`. Lint fails when any other key is present, including `outcome`.

`buildReviewPacket` emits `requiredInitialOperationId` only. A current packet has no `"outcome"` key, no `"expectedOperationOrder"`, and no `"initialEvidence"` object. The new artifact test pins that contract.

The packet still includes goldens and truth for answer review. That surface existed in v1. It does not restore the expected evidence label.

Reviewer vocabulary is unchanged. No reviewer-guidance edit steers toward a frozen label.

## Digests and identity

Recomputed from HEAD `cases.json`:

- case content: `sha256(JSON.stringify(cases))=482547a95a07f760f892bc72f9014d51f9e7dec26ac457ab83e4d1a3225a5479`
- ordered IDs: `sha256(ids.join("\\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`

Those values match `FROZEN_CASE_CONTENT_DIGEST`, `FROZEN_ORDERED_IDS_DIGEST`, and `contractProvenance`.

Lint checks all four equalities: provenance versus frozen literals, and computed content versus frozen literals.

`gradeResults` requires `result.contract`, `caseContentDigest`, and `orderedIdsDigest` to match the current suite. I graded the renamed fourth reviewed file against HEAD:

```
identityPass: false
pass: false
exit: 1
```

`--gate` therefore rejects the v1 artifact. Re-join through `artifact.mjs` also fails, because the embedded collection still carries the v1 contract and v1 content digest.

The grader still computes `positivePasses: 7` on that rejected input and labels the JSON `contract: repository-tooling-recovery-v2`. That is a residual comparability hazard. It is not a gate pass. See non-blocking notes.

## Thresholds and negatives

`REQUIRED_POSITIVE_PASSES` is 10. `MAX_PREMATURE_DETOURS` is 0. `cases.json` thresholds match. `negativePrematureDetour` is unchanged.

All eight stored fourth negatives remain non-detours under both the parent cases and the HEAD cases.

Free measure: 12 of 12 positives eligible for both trigger outcomes, 0 of 8 premature rank risks, recovery-only discovery still sealed.

## Comparability

ADR-0010 states:

- later collections use `repository-tooling-recovery-v2`
- v1 results remain v1 results
- no v1 artifact receives retroactive promotion
- `sufficient` still fails a positive

The ledger repeats that boundary and keeps the fourth run as v1 evidence. `eval/EVALS.md` names the live contract `repository-tooling-recovery-v2` and does not rewrite historical v1 scores. `eval/repo-recovery/README.md` states the set rule and that the suite carries no expected evidence label. Digest changes require a new contract version and a new decision record.

## Ignored fourth-run artifacts

All four files exist. The old un-qualified names do not exist.

| Path | File SHA-256 | Claimed |
| --- | --- | --- |
| `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-collection.json` | `7b7c1cb69eb044060f78b595f6f8616da37c572a3fbfefadb420ea8e510ddbc6` | match |
| `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-review-packet.json` | `965ccc0f61e9ffe5ff97f73e726e452cda0bd7f8a49c0ac4df70f6793f3191d0` | match |
| `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-annotations.json` | `8d0e025b22f38b8a978f67c7fc9ab843c1619246b33f2bb248b3796b43803087` | match |
| `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-reviewed.json` | `27f653f930afe0fa3196ca0cd2232b51963c2599b9788c1ccd0458708f688ade` | match |

Canonical SHA-256 of `JSON.stringify(parsed)`:

- collection: `8800785288fa185a2c392acc2608f781ee49d5c060ea59a7f6561aedd887a565` (match)
- annotations: `9c0a817a9e513733f626258a83807ef7e13a5419ae60f831aef0e3fac1c307e0` (match)

Packet and reviewed file hashes are the values the ledger records. Those files are pretty-printed, so their canonical `JSON.stringify` hashes differ. That is expected. The artifacts remain gitignored.

Collection identity inside the files is still v1: revision `497181c`, surface `8a223284…769b`, answering binary `625869b0…8969a5`, comparable `true`, complete `true`.

## `sls-080` status and provenance

Next Scout id after `sls-079` is `sls-080`. No collision in `improvements/resolved.json`. Status is `verified`. No GitHub URL is claimed, so `reported-upstream` is not required. The finding is not filed upstream. That matches the author residual.

I re-read the stored fourth collection row `rr-pos-horizon-max-supported-protocol`:

- required Docs op ran in execute 4
- `scout.explainRepo` ran in execute 5 with `repo: stellar/stellar-horizon`
- payload `answerSource: "deepwiki"`
- `generatedAt: 2026-08-30T23:49:33.549Z`
- `scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`
- `lastCommitAt: 2026-08-20T01:07:44.000Z`
- `scannedAt: 2026-08-14T21:59:19.911Z`
- DeepWiki text states `MaxSupportedProtocolVersion` current value `25`
- independent answer review: incorrect and grounded

That live execute is the verification the improvements pipeline requires. Class B GitHub reads at `2abda012` and `82660510` are cited. I did not re-fetch those GitHub blobs in this review. The owned golden already pins value 28 at `internal/ingest/main.go`. Fable’s independent file reads are in the plan. The finding does not change gospel.

`verified` is the correct status for this record. A later filing lane still needs owner authorization.

## Generated INDEX

`improvements/INDEX.md` header still says it is generated. The diff only increments the total 67 to 68 and adds the `sls-080` row. `npm run improvements:lint` reports `improvements lint ok (68 findings)`. That lint byte-compares the committed index to the generator. The index is derived.

## No product or ranking change

`git diff --name-only 497181c d451ca4 -- src catalog scripts` is empty.

Free measure still reports:

- `targetRecoveryOnly: true`
- `targetSearchable: false`
- `ordinaryDiscoveryLeaks: 0`
- 12 of 12 eligible
- 0 of 8 premature rank risks

The ranking trigger remains unmet. `.agents/TODO.md` records the monitor-only reopen rule for `stellarDocs.search_docs`. That is not a ranking edit.

## Fourth annotation aggregate

Source: `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-annotations.json`, reviewer `repo_recovery_live_fable`, `reviewedAt 2026-08-30T23:58:17Z`. The reviewed artifact carries the same 20 `answerReview` objects.

| Count | Annotations | Ledger / Fable plan |
| --- | ---: | ---: |
| `correct: true` | 15 of 20 | 15 of 20 |
| `grounded: true` | 17 of 20 | 15 of 20 |
| correct and grounded | 15 of 20 | not stated as a pair |
| incorrect and grounded | 2 of 20 | omitted from the aggregate |
| incorrect and ungrounded | 3 of 20 | omitted from the aggregate |

Positive split: 7 of 12 correct, 9 of 12 grounded. Negative split: 8 of 8 correct, 8 of 8 grounded. Fable’s “positives 7/12 correct, negatives 8/8 correct” is true. The grounded copy of that 15 is false.

Incorrect and grounded:

- `rr-pos-cli-config-home-env`
- `rr-pos-horizon-max-supported-protocol`

Incorrect and ungrounded:

- `rr-pos-go-sdk-query-enums`
- `rr-pos-js-rpc-durability-values`
- `rr-pos-js-rpc-insecure-http-guard`

Sol’s per-case notes already call the Horizon row grounded and incorrect. The CLI row is an answer miss after a successful repository call. The aggregate should keep that split.

The v1 and v2 gates still require `correct && grounded` for a positive pass. The two extra grounded rows do not change 3 of 12 or 7 of 12. They do change the published answer identity.

## Tests and free gates run in this review

| Command | Result |
| --- | --- |
| `npx vitest run test/repo-recovery.test.mjs test/repo-recovery-artifact.test.mjs test/repo-recovery-collector.test.mjs test/repo-recovery-cost.test.mjs` | PASS, 35 tests |
| `npm run eval:repo-recovery:lint` | PASS, v2, 12 positive, 8 negative |
| `npm run eval:repo-recovery -- --gate` | PASS, 12/12 eligible, 0/8 risks |
| `npm run improvements:lint` | PASS, 68 findings |
| `npm run eval:repo-recovery:grade -- <renamed fourth reviewed> --gate` | FAIL as required: `identityPass false`, `pass false`, exit 1 |
| `git diff --check 497181c d451ca4` | PASS |

I did not re-run `npm test`, `npm run typecheck`, `npm run build`, `npm run eval:routing -- --gate`, or `npm run secrets:scan -- --tree`. Those commands cannot change from a measurement-only diff with no `src/` or catalog edits. The author recorded them as PASS. I did not repeat them.

I did not run a paid v2 collection.

## Non-blocking notes

1. **Grade CLI still prints v2 counts for a rejected v1 file.** `grade-results.mjs` emits `contract: "repository-tooling-recovery-v2"` and `positivePasses: 7` while `identityPass` is false. The gate fails. An operator who quotes the count without the identity flag could present the diagnostic as a v2 grade. A later hardening can zero score fields when identity fails. Do not treat that as a merge blocker.

2. **Packet instructions still mention a frozen expected label.** `artifact.mjs` line 466 says “not from the frozen expected label.” The suite no longer has that label. The sentence does not leak a value. Fable forbade an `artifact.mjs` edit unless the packet copied `initialEvidence`. Leave it unless a later packet rewrite lands.

3. **Collector fixtures still name v1.** `test/repo-recovery-collector.test.mjs` builds synthetic suites with `repository-tooling-recovery-v1` and one `outcome: "empty"`. The collector reads `initialEvidence.id` only. Live `cases.json` is v2. This is fixture drift, not a live-path defect.

4. **ADR status line is slightly early.** ADR-0010 says “Accepted on owner approval.” ADR-0009 uses “accepted (date).” Fable specified the phrase. This review is the independent gate, not owner merge.

5. **The `other` unit test does not use `operationSequence: null`.** It still fails `sequencePass` for reviewed `other`. Integrity already requires `other` plus a null sequence when the required op never ran.

6. **Three operation-selection misses remain monitor-only.** That is the Fable decision. It is not a defect in this measurement block.

## Exclusions

- No GitHub re-read of `stellar/stellar-horizon` `internal/ingest/main.go` in this session.
- No paid collection, no deploy, no push, no merge, no upstream filing.
- No product-test or smoke-test rerun. Those files are untouched.

CHANGES-REQUESTED
