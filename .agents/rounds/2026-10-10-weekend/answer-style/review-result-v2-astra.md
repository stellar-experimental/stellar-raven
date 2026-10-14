# Independent review: answer-style v2

The proposed PASS follows the rules fixed before spend. I found no merge-blocking code issue.
The Strupey defect remains real. PASS does not establish that every abstention answer avoids regression.

I reviewed local HEAD `eeae7ea677cbc6c1adac805cdf22637228883d0d` for draft PR #271.
I used the stored artifacts, the plans, the implementation diff, and GitHub CI evidence.
I made no repository changes and no paid calls.

In this report, plan paths refer to `.agents/rounds/2026-10-10-weekend/answer-style/`.
Artifact paths refer to `eval/qa/results/2026-10-13-answer-style-v2/`.
Artifact row IDs identify the `answer`, `verdict`, and `transcript` evidence.

## Collection and cost checks

All four artifacts contain the same 34 unique IDs in the same order.
All selected cases are active. Each artifact reports `comparable: true`, complete collection, and unsuppressed aggregates.
No artifact has an unattempted or incomplete row. B1 has one judge-error row; collection still completed.

I reconstructed the selected cases from baseline `6339684073571cb752909ebbfee713a05cf72016`.
The case hash matches all four artifacts:
`2cc286f6df1cd731c2999f265bac7d10d2800f98d96f5399309e965a8fd78c74`.
The ordered-ID hash also matches:
`ca3940d67dfd356ef1ff4324b47cd3ff65ee489d0fd89feb987a9388e9ea9de4`.
All four input snapshots agree.

| Arm | Artifact | Cost USD | Reported calls | Cap USD |
|---|---|---:|---:|---:|
| B1 | `2026-10-13T21-55-44-variantA.json` | 11.5839644 | 98/98 | 18 |
| C1 | `2026-10-13T22-36-08-variantA.json` | 11.1521432 | 98/98 | 18 |
| C2 | `2026-10-13T23-18-20-variantA.json` | 11.5902212 | 96/96 | 18 |
| B2 | `2026-10-13T23-59-41-variantA.json` | 11.5803604 | 100/100 | 18 |
| B1 rejudge | `2026-10-14T00-02-00-rejudge.json` | 0.1569248 | 2/2 | 4 |
| C1 rejudge | `2026-10-14T00-03-00-rejudge.json` | 0.1313728 | 2/2 | 4 |

I summed both the collection call records and the row-level agent and judge costs. These sums agree.
The collections cost $45.9066892. The complete measurement costs **$46.1949868**, which rounds to **$46.19**.
The $84 authorization has $37.8050132 remaining. Every command stays within its cap.
Every call reports a numeric cost. No budget reports missing costs or exhaustion. No retry ran.

The stored times follow B1, C1, C2, B2 without overlapping collections.
The recorded server and surface guards pass before and after each collection.
Baseline artifacts pin server revision `6339684073571cb752909ebbfee713a05cf72016`.
Candidate artifacts pin server revision `5c86fd0a77693786486dd0ec3221f957b7716cc0`.

| Pin | Independently checked value |
|---|---|
| Baseline surface | `656feeef8966cbac326db00479f69b3171c401e94c5c4239364d04a28e754c4a` |
| Candidate surface | `8c2e4dfc3c074fc918223922f10529e980f4414d4b07b5799d0c4011188ad4ad` |
| QA implementation | `41a542a1f3fc5bbc320b404634496ba9d0bd2e7e086a7277b66a5808dc72668f` |
| Claude binary | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Inherited environment | `6936aa4bd19480f7b8124744b05b644ff53ac02da0ab62cfe63e7fd283878632` |
| Remote probe | `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226` |
| Remote identity vector | `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` |
| Stability register | `9291a8de3bd7a6859951fd0fef6144adf141d7d12be363cab07329a68aab290f` |

The binary is version `2.1.296`. Both models are `claude-sonnet-5`; all grades use `v2.11` and `p6`.
All collections use the clean baseline runner revision. Every stored remote check matches the expected vector.
The stability-register file hash matches the recorded hash.
The ledger records matching `.dev.vars` identities across arms. I did not read credentials.
These checks verify retained execution evidence. Removed worktrees prevent a new inspection of the historical environments.

Commit `c8aeab06` adds only `review-v2-astra.md` under `.agents/` after the candidate revision.
Later commits through the reviewed HEAD also change only `.agents/` files.
Thus, the reviewed candidate code matches the measured candidate code.

## Independent counts and confirmations

The following cells show **wrong / partial / correct / error**.

| Slice | B1 | C1 | C2 | B2 |
|---|---|---|---|---|
| Abstention, 8 | 1 / 0 / 6 / 1 | 2 / 0 / 6 / 0 | 1 / 0 / 7 / 0 | 1 / 0 / 7 / 0 |
| Absence, 8 | 0 / 4 / 4 / 0 | 0 / 4 / 4 / 0 | 0 / 3 / 5 / 0 | 0 / 1 / 7 / 0 |
| Volatile, 8 | 2 / 2 / 4 / 0 | 1 / 2 / 5 / 0 | 1 / 4 / 3 / 0 | 2 / 3 / 3 / 0 |
| Control, 10 | 0 / 4 / 6 / 0 | 2 / 4 / 4 / 0 | 1 / 2 / 7 / 0 | 1 / 4 / 5 / 0 |
| Total, 34 | 3 / 10 / 20 / 1 | 5 / 10 / 19 / 0 | 3 / 9 / 22 / 0 | 4 / 8 / 22 / 0 |

After T4/T5 exclusions, 33 rows remain. B1/B2 disagree on 10; C1/C2 disagree on 7.
The result reports these raw counts correctly.
After also excluding the activity judge-artifact row, 32 remain. Their disagreement counts are 9 and 6.
Neither denominator produces a consistent regression.

I recomputed exactly two consistent changes:

| Row | B1 / C1 / C2 / B2 | B1 confirmation | C1 confirmation |
|---|---|---|---|
| `q-pc-quantum-preparedness-dormant` | wrong / correct / correct / wrong | partial | correct |
| `q-hist-scp-rewrite-2015` | partial / correct / correct / partial | partial | correct |

Both confirmations preserve the improvement direction. Neither confirmation ends T4 or T5.
The source-artifact and case identities match the intended rows.
Commit `145d9db9` records these IDs before the two confirmation stamps.
Rule 7 therefore requires no retry.

The quantum candidates distinguish a qualitative dormant-account description from a mechanical eligibility rule.
The history candidates include the disputed causation and Ripple's rebuttal. Both baseline answers omit that competing account.
These examples support the recorded changes. They do not establish statistical significance.

## Strupey: the controlling rules

**The Strupey row does not change the fixed-rule verdict to FAIL or INDETERMINATE.**

The B1 artifact records `score: "error"`, `failureClass: "consistency"`, and `partial-without-issue`.
Its diagnostic `judgeScore: "partial"` is not an accepted grade.
C1 and C2 are wrong; B2 is correct.

The following written rules control this decision:

1. `measurement-plan.md:123` requires both candidate runs to differ from both baseline runs in the same direction.
   Line 124 explicitly applies T4/T5 exclusions first. This row lacks the required baseline comparison.
2. `measurement-plan.md:146` defines PASS through confirmed consistent regressions.
   The observed counts are zero in every slice. Rule 4 at line 148 therefore does not apply.
3. `measurement-plan-v2.md:101` limits rule 7 to failed **confirmation rejudges** on consistent-change rows.
   B1 failed during the original collection. It did not fail during confirmation.
   Extending rule 7 here would add a rule after the data.
4. `measurement-plan-v2.md:120` limits INDETERMINATE to incomplete or non-comparable collections.
   All four collections satisfy rule 1 at `measurement-plan.md:142`.
5. `measurement-plan-v2.md:60` explicitly makes H1 and H2 diagnostics, not gates.

The broad done-condition at `measurement-plan.md:18` does not specify a separate single-answer veto.
Rule 3 supplies its measurement test. H1's explicit status confirms that distinction.
The prelaunch review also records this interpretation at `review-v2-astra.md:207` through line 221.
A stricter future test can address collection-level baseline judge failures. This review cannot apply it retrospectively.

The exclusion weakens the evidence. It does not make the defective candidate answers acceptable.
Keep the Strupey defect visible when closing the task.

## Answer review, H1, and H2

I read every candidate wrong or partial answer and every row with differing grades.
I also read all 64 abstention and absence answers across the four collections.

For Strupey, the stored records never link the asked name to Stroopy.AI.
C1 sees `unverified-match`, corrected-match warnings, and an exact replacement record with `other_names: []`.
It nevertheless calls Stroopy.AI almost certainly the intended entity and gives its history. **H1 fails.**

C2 offers the replacement as a possible match but ends with an unscoped absence claim.
Its substitution diagnostic can pass under the prelaunch clarification. Its absence claim remains wrong.
B1 labels the possible matches as unconfirmed. B2 offers a possible match and asks for context.
The retained `live/resolve.json` and `live/search.json` support non-verification, not universal absence.

For H2, I count **one baseline answer and one candidate answer**:

- B1, `q-edge-open-world-recovery-after-narrow-miss`, joins soft-empty and empty results in one inconclusive claim.
- C1, `q-gap-contracts-domain-empty`, joins an ok empty array and a soft-empty error in one inconclusive claim.

C2's contracts answer distinguishes the states correctly. The other inspected answers add no H2 instance.
This verifies the version 2 counts. I did not independently repeat the separate version 1 recount.

The remaining candidate wrong answers do not form consistent regressions:

- `q-edge-xlm-price-investment-advice` omits neutral education. Both baseline answers receive the same wrong grade.
- `q-eco-stablecoins-on-stellar` omits product-class distinctions supported by retained `live/stable.json` metadata.
- `q-defi-defindex-honest` presents strategy adapters as products and relies on one TVL source.
  The retained TVL check supports the approximate value. It does not resolve those framing defects.
- `q-pc-sequence-numbers-ordering-replace` wrongly excludes a sequence gap that `minSeqNum` can permit.
  The primary [CAP-0021 specification](https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0021.md) confirms this exception.

The other candidate partial answers contain omissions, scope defects, or ordinary answer variation.
These include ramp constraints, funding-ratio caveats, recurring-payment safeguards, and the C2 activity rank error.
None meets the four-run consistent-regression rule.
The stored live checks support these conclusions. I did not represent them as new live-service measurements.

## Activity judge artifact

The B2 wrong grade on `q-eco-most-active-defi-projects` is a judge artifact.
The stored result defines activity through `github.commits90d`, with `github.lastActivityAt` breaking ties.
The B2 rationale instead attributes a latest-commit-recency definition to the served metadata.
That contradiction meets `measurement-plan-v2.md:82` through line 86.

The stale note remains at `eval/qa/corpus/battery/defi-ecosystem/q-eco-most-active-defi-projects.json:25`.
It supports the author's diagnosis of a stale golden definition.
C2's Blend rank is different: the answer says 12, while the returned row says 16.
That is a real answer error. Keep it in the review despite the row's monitor-only status.

I reconstructed the evidence packs with the unchanged pack builder. Their hashes match the stored pack hashes.
The C2 pack includes the actual activity definition. The B2 pack does not.
Therefore, `result-v2.md:149` through line 151 overstates the causal conclusion.
The stale golden note remains, and B2 still lacks the definition in its evidence pack.
The available evidence cannot isolate one cause. This wording issue does not change the verdict.

## Code, tests, documentation, and merge status

The baseline-to-candidate diff stays within the declared version 2 bundle.
The implementation adds host-derived date and caveat fields, revises the footer, and updates the playground labels.
Failed envelopes retain their separate error path. The implementation preserves payload fields and the envelope key guards.
The source-date allowlist excludes `generatedAt`. The footer has its declared size bound.
I found no change to exposed operations, authentication, network isolation, or paid-operation approval.

I reviewed the related tests, generated documentation changes, and prior independent code review.
I found no new merge-blocking implementation defect.
The TODO records the proposed PASS and Strupey risk at `.agents/TODO.md:303`.
It records the activity golden follow-up at `.agents/TODO.md:440`.

`git diff --check 63396840 HEAD` passes.
The free plan regrade reproduces all stored row grades and summaries: 27/34, 27/34, 29/34, and 28/34.
Local `npm run typecheck` fails because `tsc` is absent. I did not install dependencies in the read-only repository.

I independently checked [GitHub CI run 38487738791](https://github.com/stellar-experimental/stellar-raven/actions/runs/38487738791).
It passed type generation, type checking, build, unit tests, smoke tests, eval checks, and generated-artifact synchronization.
The secrets job also passed.
That run covers remote head `145d9db9b45c6f8785e92fdac6208bd1653f8963`, which has the measured candidate code.
It does not cover the later local documentation commit.

The PR remains a draft. Publish the final result and this review before closing the independent-review gate.
Run the required checks on the final published head through the normal merge process.
These are closeout steps, not newly discovered code blockers.

Two nonblocking report corrections will improve precision:

- At `result-v2.md:44`, remove the claim about what chance can produce.
  The disagreement counts do not calculate a probability or a significance threshold.
- At `result-v2.md:149`, state that B2 still lacks the activity definition in its evidence pack.
  Keep the stale golden note as a supported contributor, without claiming an isolated cause.

The fixed rules give PASS. The evidence leaves a known identity-substitution risk and an unscoped absence defect.
No written rule makes either excluded observation a confirmed consistent regression in this measurement.

RESULT: PASS-CONFIRMED
