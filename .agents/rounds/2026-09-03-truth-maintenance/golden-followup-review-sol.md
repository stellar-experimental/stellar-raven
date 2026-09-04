# Golden follow-up review

## Verdict

**PASS**

The initial review of `4308f6c293a0996f4d170b41b6bed5d9a9846c8b` found one blocking provenance error.
Repair commit `cdbbf57dafa8a5b9aebf0374ce1a26a800c971b6` closes that finding.
The LOBSTR answer correction itself matches the live owner documentation.

## Review record

- Reviewer: Codex Sol high.
- Branch: `codex/tm-golden-followup`.
- Fixed parent: `80aaf52d81c032a44bbd844e9d1f6e6c94aab12b`.
- Reviewed commit: `4308f6c293a0996f4d170b41b6bed5d9a9846c8b`.
- I read the complete commit diff before the author report.
- I then read `golden-followup-fable.md` and checked its claims.
- I made no implementation or golden-file edits.

## Exact finding

### F1: The verification record misstates the parent answer

Status: closed by `cdbbf57dafa8a5b9aebf0374ce1a26a800c971b6`.

The new `truth.verified.evidence` says the parent answer read as an era-independent local-only claim.
The author report makes the same claim.

The parent answer did not say `only`.
It expressly limited its storage statement to current or migrated accounts.
It also kept the pre-2020 unmigrated-account exception.
Therefore, the parent answer did not match avoid item 4.

The real defect was narrower.
The answer omitted the encrypted server copy already present in its corroboration record.
That omission still supports the answer correction.

The initial review required this replacement:

> The 2026-08-31 corroboration row already verified the server copy, but the answer omitted it. The parent answer was era-bounded and did not say `only`.

It also required the same correction in `golden-followup-fable.md`.
The existing `eval-authoring` root cause stayed unchanged.
That root cause accurately identifies the omitted server copy.

The repair regenerated `cases.json`, `sample.json`, and `lifecycle-registry.json`.

## LOBSTR corroboration matrix

| Claim | Live source and class | Evidence | Verdict |
| --- | --- | --- | --- |
| LOBSTR keeps an encrypted server copy. | A: LOBSTR security article `151000169419` | The page says the key is “uploaded to our server in encrypted form.” | Confirmed as an attributed owner statement. |
| Decryption and signing occur on the device. | A: LOBSTR security article `151000169419` | The page says keys can “only be decrypted and accessed by users on-device.” It also states local signing. | Confirmed as an attributed owner statement. |
| Password material participates in encryption. | A: LOBSTR security article `151000169419` | The page describes a password-derived encryption key and a per-key salt. | Confirmed as an attributed owner statement. |
| A pre-2020 unmigrated exception remains documented. | A: LOBSTR articles `151000001271` and `151000001273` | Both pages use the boundary `September 1, 2020`. The migration page describes encrypted platform storage. | Confirmed as an attributed owner statement. |
| LOBSTR says it cannot reconstruct user credentials. | A: LOBSTR backup article `151000001289` | The page says the LOBSTR team lacks access to phrases, keys, codes, and passwords. | Confirmed as an attributed owner statement. |
| LOBSTR has a current official publisher footprint. | A: Ultra Stellar site. D: Apple listing and lookup. | The sources identify LOBSTR and the Ultra Stellar publisher. | Confirmed as of 2026-08-31. |

The storage evidence uses owner documentation only.
No public class B mobile-wallet source or class F audit verified the implementation.
The answer correctly limits the claim with `Current LOBSTR documentation says`.
The corroboration note also records the missing class F evidence.

The public `Lobstrco` repositories do not expose the mobile-wallet implementation.
The browser extension does not independently prove mobile key storage.
I did not treat that repository as corroboration.

## Golden semantics

- The server-copy statement is accurate.
- The on-device generation, decryption, and signing statements are accurate.
- The phrase `LOBSTR says it cannot decrypt` is an accurate paraphrase.
- The pre-2020 exception is accurate.
- `truth.status: confirmed` is valid for the attributed documentation claim.
- `truth.verified.date: 2026-09-04` matches this verification event.
- `truth.asOf: 2026-08-31` still controls the dated activity assessment.
- The storage corroboration has its own `2026-09-04` observation date.
- `truth.reverifyBy: 2026-11-30` remains future and quarter-granular.

Key fact 3 still requires the local or on-device half.
The full trap answer now states both storage locations.
The trap rubric derives required behavior from the full answer.
Therefore, a current-account local-only claim still contradicts the golden answer.

Avoid item 4 correctly rejects an era-independent one-location claim.
It did not describe the parent answer.
This distinction causes F1.

## Consistency and lifecycle

The sibling sweep found no conflicting LOBSTR storage claim.
`q-eco-lobstr-wallet` states only the noncustodial control model.
The restore case covers recovery formats, not storage location.

`q-raph-lobstr-legitimacy` has no consistency-cluster membership.
It also has no numeric invariant or date-contingent trap entry.
The consistency register stayed unchanged.
The register check reported `0 reopened`.

The compiler produced 500 cases.
The corpus content digest is `3d736cd1c44bf1c9c0c34706b9a24152844b8c648d9f622959989c4a922d6571`.
Only `q-raph-lobstr-legitimacy` changed in the parsed compiled corpus.
The 30 sample case IDs stayed unchanged.
The sample carries the same corpus digest.

The lifecycle registry still reserves 500 IDs.
Only the reviewed case entry changed.
Its content digest is `0de1f44543ce82323c1698dd2899f40b08abcc55957d876be44bf8b02870cdf6`.

## Score-laundering review

The parent case already recorded the encrypted server copy on 2026-08-31.
That evidence predates the reviewed change.
The change adds the omitted fact to the answer.
It does not make the failed local-only answer more correct.
No paid rejudge ran.

I found no score laundering.
F1 concerns the accuracy of the durable change narrative.

## Fourteen unchanged cases

All fourteen cases correctly remain unchanged.
Their next actions need human judgment, more research, an upstream result, or a bounded rejudge.

| Case | Reason to remain unchanged |
| --- | --- |
| `q-scf-rfp-tooling` | The RFP-track meaning needs a human scope decision. |
| `q-sor-persistent-unbounded-collection-cap` | The fixed-limit wording needs live settings research and a rubric decision. |
| `q-protocol-ledger-close-time` | Primary pages conflict. The required multi-ledger sample is unavailable on the exposed surface. |
| `q-ti-historical-pointintime-balances` | Trade-implied USD treatment needs a human method decision. |
| `q-soroban-x402-auth-entry-signing` | The official roster and implementation evidence still disagree. The dispute remains current. |
| `q-tool-cctp-stellar-integration` | Circle pages and source names still conflict. The dispute remains current. |
| `q-pay-anchor-msb-licensing` | Any wider caution needs the ADR-0008 owner decision. |
| `q-pay-travel-rule-aid-flows` | Any wider caution needs the same owner decision. |
| `q-comp-finclusive-caas` | The golden remains mixed. One judge label needs a rejudge, not a truth edit. |
| `q-crp-custodial-vs-noncustodial-wallets` | The legal boundary needs the compliance-cluster owner decision. |
| `q-crp-become-an-anchor-licensing` | The legal perimeter remains unverifiable by design. |
| `q-ti-stellar-lab-usage-and-new-ui` | The documentation and implementation still conflict. The upstream finding remains proposed. |
| `q-edge-metamask-evm-mental-model` | The dated Snap fact holds. Its freshness class needs an owner decision. |
| `q-defi-aquarius-what-is` | The golden matches operator docs. The remaining issue is surface coverage. |

The two reviewed protocol cases correctly keep `truth.status: disputed`.
The Laboratory case also correctly remains disputed.
No unchanged case received a silent truth or score adjustment.

## Commands and results

| Command | Result |
| --- | --- |
| `git show --find-renames --find-copies 4308f6c` | Reviewed before the author report. |
| `curl -LsS` for LOBSTR articles `151000169419`, `151000001271`, `151000001273`, and `151000001289` | Live pages fetched. The cited wording matched. |
| `gh api --paginate orgs/Lobstrco/repos` | Public source inventory checked. No mobile-wallet source appeared. |
| `npm run eval:qa:compile` | Passed. It produced 500 cases and the expected corpus digest. |
| `npm run eval:qa:lint -- --since 80aaf52d81c032a44bbd844e9d1f6e6c94aab12b --stale` | Passed with 0 errors and 62 existing warnings. None named this case. |
| `npm run eval:qa:register` | Passed. The register was current, with 0 reopened entries. |
| `npm run eval:selftest` | Passed all routing and frozen-contract checks. |
| `npm run eval:plan -- eval/qa/reviewed/2026-08-26-connectors-item8/2026-08-26T17-39-11-variantA.json` | Passed. It reported 7 of 8 required plans covered. |
| `npx vitest run test/golden-compiler.test.mjs test/qa-corpus-lint.test.mjs test/qa-golden-max-tx.test.mjs test/qa-judge-evidence.test.mjs test/qa-lifecycle.test.mjs test/qa-register-cli.test.mjs test/qa-verdict-consistency.test.mjs` | Passed 7 files and 221 tests. |
| `npm run secrets:scan -- --tree` | Passed. Gitleaks found no leaks in tracked files. |
| `git diff --check 80aaf52d81c032a44bbd844e9d1f6e6c94aab12b 4308f6c293a0996f4d170b41b6bed5d9a9846c8b` | Passed. |

The exact 500-case result file is not present in this worktree.
I could not repeat its 464-of-500 plan grade.
The author report records that result.
This absence does not affect the deterministic corpus checks.

The plan command updated path and time metadata in its tracked output.
I restored those generated metadata lines exactly.
No implementation or golden diff remains from the review.

## Risks and blockers

- Blockers after repair: none.
- Risk: The storage implementation has no independent class B or F verification.
- Risk: Key fact 3 names only local storage, although the full trap answer names both locations.
- Risk: The exact 500-case saved result is absent from this worktree.
- Paid calls: none.
- Deployment: none.

## Final repair review

I reviewed only commit `cdbbf57dafa8a5b9aebf0374ce1a26a800c971b6` against F1.
The repair uses the exact required correction in the golden evidence record.
It makes the same correction in `golden-followup-fable.md`.
It keeps the accurate `eval-authoring` root cause.
It does not change the golden answer, key facts, avoids, status, or dates.

The compiler reproduced all generated files without a working-tree difference.
The corpus still contains 500 cases.
Its content digest is `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e`.
The 30-case sample carries the same digest.

The lifecycle registry still reserves 500 IDs.
The reviewed case remains active with review state `none`.
Its content digest is `b75ab199e2abf94dc521ca8c24821be2aa6d1b42c00fc803134d6051f4c4b15a`.

Focused verification passed:

- `npm run eval:qa:compile`
- `npm run eval:qa:register`
- `npm run eval:qa:lint -- --since cdbbf57^ --stale`
- `npm run eval:selftest`
- Seven focused Vitest files, with 221 passing tests
- `npm run secrets:scan -- --tree`
- `git diff --check cdbbf57^ cdbbf57`

The lint reported 0 errors and the existing 62 warnings.
The register reported 0 reopened entries.
The secret scan found no leaks.
The repair leaves no remaining F1 finding.

PASS
