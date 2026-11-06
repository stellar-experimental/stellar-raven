# Truth maintenance continuation 2026-11-06

## Scope

Close the new sk-038 handoff (#381) and its related stellar-dev skill drift after the
November 5 round merged as PR380. This bounded continuation does not repeat the 130-finding
review. The original Rust CLI audit is already published at stellar-raven-jev commit 3a0714f6.

Baseline: stellar-raven a73e0b25c4062ca4e3c4382e501630a631ff4656. Both checkouts were clean.

## Lane plan

- Coordinator: live trigger, finding lifecycle, integration, PR and production verification.
- t2p4, Codex gpt-6-astra high: independent original-scope handoff and final pin review;
  report [review.md](2026-11-06-skill-handoff/review.md).
- t2p5, Codex gpt-6-astra high: official skill refresh, body diff review and generated artifacts;
  report [pin-author.md](2026-11-06-skill-handoff/pin-author.md).

The user explicitly requested hc and Astra. Separate author/reviewer agents use that model;
no nested agents, paid model calls or unrelated cleanup are authorized by this lane.

## Drift verdict

The latest #223 refresh identifies the existing Docs-title hold (666 to 978) and new stellar-dev
skill changes. Preserve the held title inventory: its routing regression remains an open task.
Absorb only independently reviewed skill source changes and regenerate their consumers.
No operation exposure, policy, routing thresholds or golden-answer changes are intended.

## Eval verdict

All 544 routing rows preserve grades, ranked hit IDs and scores. The new manifest changes only
transport/provenance; its fingerprint was updated in gates evidence. Every threshold, accepted
total and baseline date is unchanged. Final routing gate passes. No answering or paid judge runs.

## Golden verdict

Check references to changed skill claims; preserve historical resolution receipts and original
review records. No golden changes are justified merely by a pin update.

## Improvements/issues/PR verdict

| Finding | Trigger | Upstream state | Live recheck | Action |
|---|---|---|---|---|
| sk-038 | #381 handoff; custom SAC admin lockout omitted other signers | stellar-dev-skill PR178 merged; issue177 closed | Canonical live skill and generated Docs source corrected; ordinary published Docs skill URL still stale | Keep reported-upstream; record partial fix and delivery residual |

Coordinator fetched the live assets skill, merge-commit source and current generated Docs copy.
The source and live skill SHA-256 match:
`ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8`.
The generated Docs copy SHA-256 is
`0cbd9cdbf2f2bc2b7a34270eb3a33079c88d7ac3bc94750b631c8720328c7737`.
All three relevant statements in these sources now qualify complete lockout, other signers and
handover ordering. This does not establish that the normal published Docs URL is corrected.

Independent reviewer found, and coordinator reproduced at 12:42:28 UTC, that
`https://developers.stellar.org/.well-known/agent-skills/assets/skill.md` still serves the old
copy (SHA-256 `141b4f4417599cd1679f7c82f26fae50f6eb5ca9a50c12f66bc14f72e5694856`).
The response reports `Age: 65322` and `Cache-Control: public, max-age=86400`. A query-busted
URL serves corrected bytes. The ordinary URL must pass before retirement; keep all 102 active
findings and the existing intake record. No replacement finding is necessary.

Production read before the update confirms Raven still fetches assets from 77bf4e8;
its best-practices checklist still contains the old master-weight-only wording.
Deployment must make the newly reviewed source readable through Raven before this lane closes.

The warranted upstream verification response was posted on issue177 and read back:
https://github.com/stellar/stellar-dev-skill/issues/177#issuecomment-6685112671.
Author is `kalepail`; it reports Raven verification, not upstream maintainer acceptance.

## Own-repo todos

Added a bounded sk-038 recheck after cache invalidation or from November 7. Keep #223 open
for the general routing repair and held Docs titles. Other next-action entries
from the November 5 round remain unchanged. Do not close unrelated RWA issue167.

## Decisions

- The handoff is evidence to verify, not proof by itself.
- Use a pull request and squash merge; main requires PRs. Do not bypass the rule.
- Only resolution results warrant upstream comments; untouched issues remain quiet.
- Reuse existing successful original-round checks where files are unchanged.

## Final checklist

Validation completed on the integrated tree:

- Typecheck and production dry-run build pass.
- Unit suite: 145 files, 3,134 passed, three expected failures. The first run failed only on the
  deliberately stale manifest fingerprint; the final run passes after evidence reconciliation.
- Routing: all 544 grades, ranked IDs and scores unchanged; gate passes with the new fingerprint.
- Mirror fetch: 67 files verified; pin-review and generated rebuild pass.
- Eval self-test, QA freshness/floors (zero errors; 85 existing warnings), register check pass.
- Improvements lint and live-reference checks pass for all 102 findings.
- Probes: 15 recurring, zero fixed candidates, zero inconclusive, zero errors. These are retained
  known findings, not failed checks or new resolution candidates.
- Focused pin/catalog suite: 277 passed. No runtime source changed; no additional live runner
  or paid evaluation was needed.

Independent Astra review accepts the pin, generated diff and keep-active partial lifecycle.
Its two evidence corrections (review attestation and raw catalog hash) are reconciled.
Staged secret scanning (including gitleaks) passed. PR merge, production readback and cleanup
remain release gates. The original production deployment was confirmed as version
`81b38857-4c0f-4110-a544-d19f4b9d9100` from November 6 at 02:14:54 UTC.
