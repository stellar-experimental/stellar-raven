# QA discovery follow-up — 2026-11-03

The follow-up maps all 100 selected cases and 314 observations to concrete actions.
The [case digest](case-dispositions.md) and [machine-readable map](case-dispositions.json) retain source, review, and packet identities.
Original answers, artifacts, historical references, grades, and measurement contracts remain unchanged.

The [original diagnostic](../2026-11-02-golden-overnight/README.md) retains 97 grades, three answer-step limits, and $28.973832 in reported measurement cost.
Its quality score remains withheld.
No historical answer was regraded, and no new paid measurement ran.

## Verified source work

The final set contains 15 verified source findings: `sd-082` through `sd-095`, plus `sk-037`.
Eight [local SDK checks](sdk-fixtures-result.json) support three promotions: `sd-089`, `sd-090`, and `sk-037`.
The checks cover simulation decoding, enum encoding, and unsupported mixed-operation assembly.
Python, Java, PHP, and on-chain contract decoding remain outside those runtime checks.

Three local source patches are ready for owner review:

| Patch | Findings | Evidence |
|---|---|---|
| [Stellar Docs](stellar-docs.patch) | `sd-082` through `sd-090` | [Manifest](upstream-patch-manifest.json), [repair notes](upstream-patches.md) |
| [Stellar developer skill](stellar-dev-skill.patch) | `sk-037` | [Manifest](upstream-patch-manifest.json), [repair notes](upstream-patches.md) |
| [Additional Stellar Docs](additional-stellar-docs.patch) | `sd-091` through `sd-095` | [Manifest](additional-stellar-docs-manifest.json), [repair notes](additional-stellar-docs-readme.md) |

The ledger patch retains the original heading titles and changes only their heading levels.
The passkey correction concerns maintained source and provider behavior; it establishes no deployed revision or universal synchronization support.
The patches remain local and do not establish upstream fixes or production gains.

Method-page generation remains pending for `sd-087` and `sd-094`.
Their patches include corrected OpenRPC inputs and generated specifications.
A maintainer must regenerate the `simulateTransaction` and `getTransactions` MDX pages with the external generator.
No generated method page was edited manually.

## Applied reference and register repairs

Both exact v4 golden corrections have independent approval and are now applied.
The [approval](reference-approval.md), [behavior notes](reference-changes.md), and [member-hash check](register-member-approval-check-v4.json) record the evidence.

- The protocol reference requires a dated live-network observation for the requested current value.
- The native-rewards reference requires the SCP/FBA correction and the absence of native validator rewards.
- External yield background remains optional; claims about it still need accurate source classification and date bounds.

The dated examples and review deadlines remain unchanged.
The register helper now accepts reviewed numeric-invariant closures through `matchLabel`.
It rejects unsupported collections and fields while preserving invariant values and member hashes.
The lifecycle test checks case states and digests instead of assuming every case is active.

## Separate unmeasured candidate

The [finalization candidate](finalization-candidate.md) changes five files in a separate worktree.
Its [patch](finalization-candidate.patch) and [source manifest](finalization-candidate-manifest.json) preserve that separation.
It reserves the last existing answer request for synthesis with provider `tool_choice: "none"`.
The answer-request ceiling remains 16.
The original method branch remains unchanged.

The candidate rejects old plan identities and retains the expired `2026-11-03T10:00:00Z` deadline.
It preserves failed, refused, empty, and tool-policy-violating outputs as failures.
It changes no judge contract and establishes no completion, quality, cost, or production improvement.
No live provider capability check ran.
A fresh paired experiment and capability canary need separate review and paid authorization.

## Remaining holds

The [source triage](additional-source-triage.md) retains two owner and denominator holds.
The RWA concern needs its source owner, measurement period, denominator, and component set.
The Phoenix concern needs its source owner and dated submission IDs with consistent award statuses.
The [bounty access record](bounty-policy-access.json) does not establish the current controlling policy.
That policy needs direct authoritative access before scope, severity, or reward claims can be settled.

## Checks and review

The authoritative [final checks](final-checks.json) record 3093 passing tests across 146 files and three expected failures.
Corpus lint reports zero errors and 93 warnings.
All 25 offline sentinel checks pass; they do not perform live primary-source reads.
All 137 finding records validate.
Typecheck, dry-run build, eval self-test, register checks, and pin review pass.

The routing gates pass.
The separate protocol-history diagnostic still fails: top-5 is 7/8, and controls are 3/4.
This follow-up changes no routing source.
The [final independent review](independent-review.md) is complete.
It clears the reviewed follow-up and closes the digest-scope finding.
The [completion record](completion.json) records the final review, native helper costs, and local candidate commit.

## Cost and publication boundaries

New paid measurement calls total 0.
The [budget snapshot](budget.json) records native helper costs before the final review.
Grok helper billing remains separate from the original measurement ledger.
The completion record supplies the final native helper cost and budget allocation.
Codex exact dollars remain unavailable.
The $100 Codex reserve is policy only, not a measured cost or proven cap.
The record establishes no whole-session bill or spending-cap claim.

No upstream issue, pull request, admin write, push, or deployment occurred.
The [follow-up queue](../../../.agents/TODO.md#review-a-fresh-finalization-comparison-and-capability-canary) records the remaining measurement and source-evidence work.
