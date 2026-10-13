# Improvements follow-up — 2026-10-13

## Scope

Verify the deployed fix for `sd-027` and `sd-034` after stellar/stellar-docs PR #2837 merged, and
prepare the retirement gates. In scope: upstream state, deployment, fresh live triggers, residual
scan, finding status edits, golden and register reconciliation, prepared (unposted) upstream text,
and resolver dry runs. Out of scope: posting to GitHub, running the resolver for real, pushing,
paid model calls, and every other active finding.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
|---|---|---|---|---|
| Author (brief S) | Claude Fable 5.1, high; worktree `raven-w1013-s`, branch `w1013/sd-resolve` | orchestrator-owned | `improvements/stellar-docs/sd-027*`, `sd-034*`, `improvements/INDEX.md`, `eval/qa/corpus/battery/tooling-infra/q-tool-smart-wallet-repos-discovery.json`, `eval/qa/consistency-register.json`, generated `eval/qa/{cases,sample,lifecycle-registry}.json`, `.agents/TODO.md`, this ledger | done, review pending |
| Distinct reviewer | to be chosen by the orchestrator (not the author; Codex frontier or Grok at high per AGENTS.md) | — | review report only | pending |

## Ledger

- 16:13:13Z. Worktree at `6891dca2` (main). `npm ci` exit 0.
- `gh pr view 2837 -R stellar/stellar-docs`: MERGED at 2026-10-12T20:37:44Z by ElliotFriend; merge commit
  `2dd75fef3ea318d19cf8af8a261a2a37c4701982`; head `0c20e720138eb126c37dab3336501b16751d1d2f`; approvals
  xw-dd (2026-09-15, "Auto-approved: raven label") and kaankacar (2026-10-07, "LGTM"). Body says `Closes #2700`.
  Last commit title: "docs: describe passkey-kit as a sibling of smart-account-kit".
- `gh api repos/stellar/stellar-docs/issues/2700`: CLOSED, state_reason completed, closed 2026-10-12T20:37:45Z by
  ElliotFriend. Comments: one, Raven's 2026-08-05 premise correction. No maintainer comment. Timeline cross-refs:
  PR #2367, PR #2837, Raven #275, Raven #276.
- `gh api .../actions/runs?head_sha=2dd75fef`: `Build and push stellar-docs` run 38305457471 success, created
  2026-10-12T20:37:47Z, completed 2026-10-12T20:42:52Z. (`Codespaces` run failed; unrelated to the site build.)
- `gh api .../compare/2dd75fef...b3cb1c5a`: main is 2 commits ahead (Galexie and oracle pages, `routes.txt`); none
  of the finding pages changed after the merge. Latest main build run 38421582672 completed 2026-10-13T15:27:28Z.
- 16:13:13Z. `curl -D` live pages (saved headers and bodies in the author scratchpad):
  - `passkeys-prerequisites`: last-modified Tue, 13 Oct 2026 15:26:14 GMT; SHA-256 `c3ff53d1…7281`; 67076 bytes.
    LaunchTube (ci) 0; JWT 1 ("no JWT to fetch"); Smart Account Kit 3; kalepail/passkey-kit 0; Zephyr 0;
    `channels.openzeppelin.com/testnet/gen` 4; "submission and fee sponsorship" 1; "credential-to-address lookup" 1;
    `smart-account-indexer` 1; links to `/docs/build/guides/contract-accounts/smart-wallets` 1 and
    `/docs/tools/openzeppelin-relayer` 1. Footer "Last updated on Oct 12, 2026 by Elliot Voris".
  - `smart-wallets`: last-modified Tue, 13 Oct 2026 15:26:16 GMT; SHA-256 `72dc8d81…0c9`; 70186 bytes.
    kalepail/passkey-kit 0; `github.com/stellar/passkey-kit` 2; `github.com/stellar/smart-account-kit` 2; "drop-in" 1;
    "flat map of signatures" 1; "context rules, signers, and policies" 1; "have not been independently audited" 1;
    "Retired tooling" present; predecessor/successor/legacy 0; the only other "audit" matches are the navbar link.
  - `openzeppelin-relayer`: last-modified Tue, 13 Oct 2026 15:26:40 GMT; SHA-256 `bfe350bc…879`. Launchtube 3
    (still "discontinued"); no link to the smart-wallets guide; Mercury 0. Source file not in PR #2837.
  - `guestbook/overview`: last-modified 15:26:14 GMT; SHA-256 `3af13231…416`; kalepail/passkey-kit 0; audit 0; source
    line 27 names `passkey-kit` as a sibling SDK and links the smart-wallets Client SDKs section.
  - `check-auth-tutorials`: last-modified 15:26:15 GMT; SHA-256 `4430d661…a86`; kalepail/passkey-kit 1 (source line
    617, a code-credit sentence).
- `gh api search/code` in stellar/stellar-docs: `kalepail/passkey-kit` in meetings/2024-06-13.mdx, meetings/2024-07-18.mdx,
  docs/build/guides/auth/check-auth-tutorials.mdx; `launchtube` in meetings/2024-06-13.mdx, meetings/2026-07-30.mdx,
  docs/tools/openzeppelin-relayer.mdx, docs/build/guides/contract-accounts/smart-wallets.mdx.
- 16:14:45Z. `npm run improvements:probes -- --service stellar-docs`: `sd-054` recurring; 1 run, 0 errors. Neither
  `sd-027` nor `sd-034` has probe frontmatter; their triggers are the live page checks above.
- Inbound handoffs read with `gh issue view --json body`: #276 (sd-027) and #275 (sd-034), both OPEN, author
  ElliotFriend (the PR author), created 2026-10-12T20:47Z. Every marker in both tables reproduced live. Treated as
  signals; the author lane's own recheck is the evidence.
- Verdict: `sd-027` fixed (trigger no longer reproduces; recommendation 2 shipped as prose, recommendation 3 partial:
  the Relayer page has no back-link; editorial, no successor). `sd-034` fixed (trigger no longer reproduces;
  recommendation 4 met by absence of any stack-wide audit claim; one adjacent credit link to the archived pointer at
  check-auth-tutorials.mdx:617 is outside the finding; no successor).
- Edits: both findings to `fixed-upstream` with the dated evidence above; `.agents/TODO.md` item appended, not deleted;
  golden `q-tool-smart-wallet-repos-discovery` `truth.verified` refreshed (judge-blind only; answer, keyFacts, avoid,
  notes unchanged); `npm run eval:qa:register` reopened clusters 022, 105, 131 on the hash change; member sweep found no
  judge-facing mention of the guide, the archived pointer, or legacy framing in any other member; review applied with
  `--review` and `--check` passes. `npm run eval:qa:compile` regenerated `cases.json`, `sample.json`, and
  `lifecycle-registry.json`. `npm run improvements:index` wrote 73 findings.
- `rg -n "sd-027|sd-034" .`: references in `improvements/intake.json` (override; the resolver removes it on drain),
  `improvements/INDEX.md` (regenerated), `eval/qa/cases.json` (regenerated from the golden case), the golden case
  (refreshed), `research/qa-deep-dive-2026-08-25/{terra-max,sol-max}.md` (dated research, left unchanged), and the two
  findings. No Algolia rule cites either id.
- Prepared, not posted: `/private/tmp/claude-501/w1013/s-comments.md` (comments for #2700, #2837, #275, #276; #2367
  marked not applicable).

## State table

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `sd-027` | live page: Guestbook prerequisites require a LaunchTube JWT; Relayer page says LaunchTube discontinued | stellar/stellar-docs#2700; PR #2837; PR #2367 (closed, superseded) | #2700 closed completed 2026-10-12; #2837 merged 2026-10-12 `2dd75fef`; #2367 closed 2026-09-09 | #2837: 2 approvals, deployed (run 38305457471 success 20:42:52Z) | fixed 2026-10-13T16:13:13Z (0 LaunchTube, role split present) | status edit to `fixed-upstream`; residual note (Relayer back-link) | `.agents/TODO.md` item: distinct review, #2700 comment, #276 ack, resolver |
| `sd-034` | live page: smart-wallet guide links archived kalepail/passkey-kit and omits Smart Account Kit | stellar/stellar-docs#2700; PR #2837; PR #2367 (closed, superseded) | same as above | same as above | fixed 2026-10-13T16:13:13Z (0 archived links, siblings, canonical repos, Passkey Kit caveat) | status edit to `fixed-upstream`; golden `truth.verified` refresh; clusters 022/105/131 re-swept | `.agents/TODO.md` item: distinct review, #2700 comment, #275 ack, resolver |
| Raven #276 | inbound handoff for `sd-027` | stellar-experimental/stellar-raven#276 | open | n/a | markers reproduced | acknowledgment drafted | close after the review records status and ref |
| Raven #275 | inbound handoff for `sd-034` | stellar-experimental/stellar-raven#275 | open | n/a | markers reproduced | acknowledgment drafted | close after the review records status and ref |

## Outcome

Pending the distinct reviewer. Author verdict: both findings `fixed-upstream`; no successor filed; two
editorial residual notes recorded in the findings. Gate results and resolver dry-run outputs are
appended below once they run.
