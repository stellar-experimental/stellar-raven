# Upstream handoffs and drift — November 9, 2026

Scope: every open issue and PR in `stellar-experimental/stellar-raven` on 2026-11-09. No PRs were
open. Fifteen issues were open: thirteen inbound `[upstream-ready]` notifications (twelve
stellar-docs findings; sd-058 arrived twice, #402 and #403), drift issue #223, and RWA routing
issue #167.

## Lanes

Coordinator: Claude Opus 5.5 (root, hc terminal t2dn). Lanes ran under herdr-core (`hc`) in
worktrees under `/private/tmp/claude-501/raven-wt/`. Lane reports stayed in ignored `tmp/`; this
ledger records their conclusions.

| Lane | hc | Tier / model / effort | Role |
|---|---|---|---|
| ho-author | t38r | Codex workhorse / `gpt-6.1-sol` / high | Author rechecks for the twelve findings; successors and golden edits |
| ho-review | t38s | Codex frontier / `gpt-6-astra` / high | Independent re-derivation in parallel, without reading the author file; then review of the author's edits |
| drift-author | t38t | Codex frontier / `gpt-6-astra` / high | #223 regeneration, classification, gates |
| drift-review | t3bf | Claude Fable / `claude-fable-5-1` / high | Independent drift review; sls-113 recheck |

Reviewer selection: the handoff reviewer is Codex frontier because the work is dense verification
(snippet compilation, SDK runs) and it differs from the author and coordinator. The drift
reviewer is Claude Fable for vendor diversity against the Codex author.

## Upstream-ready handoffs

Both lanes reached the same verdict on every finding. All original issues are closed as
completed and every resolving PR is merged; production pages were read directly.

| Finding | Notification | Resolving PR | Verdict | Successor | Resolution comment |
|---|---|---|---|---|---|
| sd-032 | #400 | stellar-docs#2898 | fixed | — | [2606](https://github.com/stellar/stellar-docs/issues/2606#issuecomment-6749348123) |
| sd-053 | #401 | stellar-docs#2899 | partial | sd-102 (declined) | [2602](https://github.com/stellar/stellar-docs/issues/2602#issuecomment-6749348438) |
| sd-054 | #398 | stellar-docs#2931 | partial | sd-100 | [2889](https://github.com/stellar/stellar-docs/issues/2889#issuecomment-6749348775) |
| sd-058 | #402, #403 | stellar-docs#2932 | fixed | — | [2909](https://github.com/stellar/stellar-docs/issues/2909#issuecomment-6749349101) |
| sd-062 | #391 | stellar-docs#3010 | fixed | — | [2999](https://github.com/stellar/stellar-docs/issues/2999#issuecomment-6749349499) |
| sd-088 | #394 | stellar-docs#3050 | fixed | — | [3035](https://github.com/stellar/stellar-docs/issues/3035#issuecomment-6749349882) |
| sd-090 | #393 | stellar-docs#3052 | fixed | — | [3037](https://github.com/stellar/stellar-docs/issues/3037#issuecomment-6749350237) |
| sd-091 | #390 | stellar-docs#3053 | fixed | — | [3038](https://github.com/stellar/stellar-docs/issues/3038#issuecomment-6749350551) |
| sd-092 | #395 | stellar-docs#3054 | fixed | — | [3039](https://github.com/stellar/stellar-docs/issues/3039#issuecomment-6749350892) |
| sd-093 | #392 | stellar-docs#3055 | fixed | — | [3040](https://github.com/stellar/stellar-docs/issues/3040#issuecomment-6749351241) |
| sd-098 | #396 | stellar-docs#3067 | partial | sd-101 | [3065](https://github.com/stellar/stellar-docs/issues/3065#issuecomment-6749351559) |
| sd-099 | #397 | stellar-docs#3071 | fixed | — | [3070](https://github.com/stellar/stellar-docs/issues/3070#issuecomment-6749351948) |

Code checks: sd-058 ran the served extraction and rebuild blocks on `@stellar/stellar-sdk` 17.4.0
with unsigned local transactions; sd-090 ran the Python snippets (Java and PHP read only); sd-091
ran the served fetch function on local fixtures; sd-098 compiled the served event definitions on
soroban-sdk 29.0.1 and compared typed and raw event XDR; sd-099 passed `cargo check` on 29.0.1.
Nothing was signed, submitted, or paid.

Residuals:

- **sd-100** (verified): the USDT0 launch page still says Stellar finalises in "5–7 seconds" and
  "5–7s". The two named pages of sd-054 are fixed.
- **sd-101** (verified): the complete WebAuthn contract on the auth tutorial fails `cargo check`
  with 14 diagnostics (missing `ADMIN_SIGNER_COUNT`, `WEEK_OF_LEDGERS`, `ClientDataJson`, and
  dependency wiring). PR3067's body acknowledges the gap. The event migration itself is correct.
- **sd-102** (declined-upstream): the RPC team declined documenting the backfill gap check
  ([review](https://github.com/stellar/stellar-docs/pull/2899#discussion_r4516284001)). Do not
  re-file.

Golden reconciliation (golden-truth skill, reviewed by t38s): `q-tool-flutter-mobile-sdk`,
`q-ti-self-host-retention-backfill`, `q-pay-sdp-disbursement`, and `q-protocol-ledger-close-time`
drop stale "page still says" claims; register clusters 017, 018, 065, and 135 were re-swept as
consistent. The reviewer's two successor fixes (sd-101 hash qualifier, absolute ledger links in
sd-100/sd-101) were applied before filing. Filed with `improvements:file`:
[sd-100 → stellar-docs#3078](https://github.com/stellar/stellar-docs/issues/3078) and
[sd-101 → stellar-docs#3079](https://github.com/stellar/stellar-docs/issues/3079).

## Issue #223 — drift

Scout moved 1.9.122 to 1.9.127 and the stellar-light skill pin moved `f63e83a0` to `0f3040cf`.
Class: routing-relevant schema drift plus provenance. Ten operations and two shared components
change schema; no operation is added, removed, or renamed; all twelve exclusions stay; the only
runner is Lumenloop-only, so no runner is affected. The Docs-title snapshot stays byte-identical
(hold continues). Lumenloop and Stellar Docs descriptors were not refreshed locally (no host keys
in the lane); CI run 42574389455 reports both unchanged.

Routing over 544 rows: one strict gain (`q-defi-streaming-payments-prior-art` top1), no strict
loss. Legacy 220/293/327, skills 17/23/23, holdout 12/27/30 with ten forbidden captures.
Coordinator decision: accept the source. `eval/gates.json` moves the manifest fingerprint, the
accepted legacy total, and the legacy baseline (219 to 220) together, because
`eval/self-test.mjs` requires the accepted total to equal the baseline. The gain comes from
schema keywords, not a routing repair.

Independent review (Fable, high): approve with changes. F1 (PIN-REVIEW attestation and evidence
path), F2 (this ledger), F3 (sls-113 lane narrative), and F4 (TODO sls-113 line) are applied.

sls-113 is retired: both lanes repeated the original trigger live, and the resolution comment is
[1905](https://github.com/Stellar-Light/stellarlight/issues/1905#issuecomment-6749359205). The
drift probe run flags sls-099/100/102 as fixed candidates; `.agents/TODO.md` queues their
distinct-reviewer recheck.

#223 stays open for the general routing repair and the Docs-title hold.

## Issue #167

No change since the 2026-11-03 status. Cloudflare agents #2296 is open with no comments (last
update 2026-09-17); `@cloudflare/codemode` is still 0.5.6. No general lexical intent mechanism is
ready. The issue stays open without a new comment.
