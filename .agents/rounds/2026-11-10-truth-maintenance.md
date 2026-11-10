# Truth maintenance 2026-11-10

## Scope

Owner request: review all outstanding improvements, issues and PRs, and resolve what can be
resolved. Follows the [November 9 sweep](2026-11-09-improvements-sweep.md) and
[handoff round](2026-11-09-upstream-handoffs.md).

Starting state at `origin/main` 8e58f7a8: no open PRs; four open issues — #407 (inbound
`[upstream-ready]` for sd-101), #406 (golden sentinels), #223 (drift), #167 (RWA routing);
83 active findings. The stale-gospel gate was green, with four SCF cases due by 2026-11-12.

Upstream delta since the November 9 sweep: all 93 recorded upstream refs were fetched. Three
moved: stellar-docs#3079 and PR3081 (sd-101) and Inferara/soroban-security-portal#256 (cs-009).

## Lane plan

Coordinator: Claude Opus 5.5 (hc t2dn). Worktrees under `/private/tmp/claude-501/raven-wt/`:
`tm1110` (coordinator, reviewers) and `gold1110` (golden lane).

| Lane | hc | Tier / model / effort | Role |
|---|---|---|---|
| gold | t3kr | Codex workhorse / `gpt-6.1-sol` / high | Golden author: #406 sentinels, four due SCF cases, six look-ahead cases |
| gold-fix | t3m7 | Codex workhorse / `gpt-6.1-sol` / high | Applied the golden review's required and recommended fixes |
| rv-gold | t3m6 | Claude Fable / `fable` (self-reported Fable 5.2) / high | Independent golden review, fix verification, register closure draft |
| rv-sd101 | t3ks | Codex frontier / `gpt-6-astra` / high | Independent re-derivation of sd-101 |
| rv-cs009 | t3kv | Codex frontier / `gpt-6-astra` / high | Independent re-derivation of cs-009 |

Reviewer selection: the coordinator (Claude Opus) authored the sd-101 and cs-009 rechecks, so the
retirement reviewers are Codex frontier (dense verification: compilation and data comparison).

## Drift verdict

Issue #223, CI run 42768898859. Regenerated locally with read keys:

- `inventory/lumenloop.json`, `inventory/stellar-light.json`: unchanged.
- `inventory/stellar-docs.json`: provenance/data. The `llms.txt` index moved 287 → 288 pages
  (979 total). `diff-inventory.mjs` surface, text and deep all exit 0.
- `inventory/stellar-docs-titles.json`: held at its Algolia-era bytes (the hold continues).
- Anchors: 977 pages, 0 changed, 0 removed. Catalog, micro-map, spec and op classes rebuild
  byte-identical. No runner is affected. Not model-facing; no deploy needed for this part.

CI summary defect: the CI hint reported `inventory/stellar-light.json: new inventory file`. The
file is 1,060,524 bytes, over Node's 1 MiB `execFileSync` default; `git show` failed with ENOBUFS,
and `readHeadJson` swallowed the error as "absent at HEAD". Every Scout drift summary since the
file crossed 1 MiB lost its operation-level hints. Fixed in `scripts/summarize-live-drift.mjs`
(explicit `maxBuffer`; null only when `git cat-file -e` says the path is absent), with a regression
test that fails without the fix.

#223 stays open for the general routing repair and the Docs-title hold.

Horizon monitor (free reading, direct Scout call, 2026-11-10T22:52:45Z): `answerSource`
`knowledge-note`, `answerAsOf` 2026-10-08, answer `MaxSupportedProtocolVersion = 29`;
`codeVerified.scannedRef` `6a13f418…` (scan 2026-11-07) defines `30` at
`internal/ingest/main.go:38`. Still fails; identical to the November 9 recurrence, so no new
recurrence is recorded. sls-115 (stellarlight#1933, open, no comments) is unchanged.

## Eval verdict

No eval instrument was needed: no model-facing change, no paid run.

## Golden verdict

Trigger: #406 (sentinels `scf-46-submission-deadline` and `-edge` drifted after the SCF #46
deadline passed) plus the stale-gospel look-ahead. Author: Codex workhorse (hc t3kr, fixes t3m7).
Reviewer: Claude Fable high (hc t3m6), chosen for grading and product judgment and distinct from the
Codex author and the Opus coordinator. Reports:
[gold-report.md](../../research/audits/2026-11-10-truth-maintenance/gold-report.md),
[review-gold-fable.md](../../research/audits/2026-11-10-truth-maintenance/review-gold-fable.md).

Truth on 2026-11-10: SCF #46 is in Initial Review (Panel Review November 11–18, Community Vote
November 23–December 3); no #47 is listed; the handbook's Q4 RFP roster is two placeholders.
Protocol 30 (Bell) has been live on Testnet since November 3; Pubnet runs Protocol 29, and the
Mainnet vote is scheduled for November 23 at 17:00 UTC. The December 16 Testnet reset and the three
Reflector Testnet IDs still hold.

| Case | Verdict | reverifyBy |
|---|---|---|
| q-scf-current-round | changed (no open round; #46 phase) | 2026-12-04 |
| q-edge-fresh-latest-scf-round | changed (same; stale "no round in Submission" trap removed) | 2027-01-07 |
| q-scf-open-rfps | changed (Q4 roster empty; Scout synthetic row gone) | 2027-01-28 |
| q-scf-rfp-tooling | changed (same; synthetic-count trap removed) | 2027-02-18 |
| q-edge-fresh-latest-protocol-version | re-verified (P29) | 2026-11-24 |
| q-pc-protocol-upgrade-timing | changed (Bell live on Testnet) | 2026-11-24 |
| q-protocol-version-history-list | changed (tail: Bell on Testnet, Mainnet vote pending) | 2026-11-24 |
| q-hist-quantum-preparedness-plan | notes changed (CAP-0087 on Testnet) | 2026-12-01 |
| q-infra-testnet-reset-schedule-recovery (proposed) | re-verified | 2026-12-02 |
| q-sor-reflector-testnet-contract-addresses (proposed) | re-verified | 2026-12-17 |

The review approved every fact and required date fixes. The author's first pass moved the protocol
cases past the November 23 vote and the proposals past the December 16 reset, and dropped the
lint-enforced trap sentence. R2 added `scf-47-not-listed` anchors because no anchor fired on a new
round. S5 made the #46 anchors phase-agnostic so routine phase changes stop re-firing #406.
Sentinels now: 33, all holding live.

Upstream candidates: Software Versions lacks Protocol 30 (queued in `.agents/TODO.md` for after the
Mainnet vote, matching upstream's usual cadence); the Networks page says resets typically happen at
17:00 UTC while the linked legacy `stellar/packages` runbook says 09:00 UTC (minor, not filed); the
"SCF Dashboard" link on https://communityfund.stellar.org/awards redirects to
`http://localhost:8080/dashboard` (confirmed; no public repository owns the site, so not filed).

Register closure: the reviewer re-read every unchanged member (40 cases) and judged all 26
reopened entries consistent (22 clusters, two numeric invariants, two date-contingent traps). The
coordinator applied the reviewer's draft with `node eval/qa/register-helper.mjs --review` and
`npm run eval:qa:register -- --check` is up to date. The SCF trap disposition now names the two
round cases' `reverifyBy` dates, so the `date-trap` lint pairs them as it does the Bell trap.
The coordinator restored the `\u` escapes that the fix pass had expanded in three unrelated
sentinel patterns (review note N1).

Issue #406 should close on the first clean sentinel run after merge: both drifted IDs now hold.

## Improvements/issues/PR verdict

| Finding | Trigger | Upstream ref | Ref state | Live re-check | Repo action |
|---|---|---|---|---|---|
| sd-101 | inbound #407 | [stellar-docs#3079](https://github.com/stellar/stellar-docs/issues/3079), [PR3081](https://github.com/stellar/stellar-docs/pull/3081) | closed completed; merged 16:54:33Z, approved, Mintlify deploy check green on the merge commit | fixed | retired; successors sd-103, sd-104 |
| cs-009 | ref moved | [soroban-security-portal#256](https://github.com/Inferara/soroban-security-portal/issues/256) | closed completed by collaborator | fixed | retired |
| sls-115 | Horizon monitor | [stellarlight#1933](https://github.com/Stellar-Light/stellarlight/issues/1933) | open, no comments | still-repro (same scannedRef as November 9) | none |
| all others (80) | — | 90 refs | no update since the November 9 sweep | not re-run (swept November 9) | none |

**sd-101.** Author recheck (coordinator, 22:50:10Z): served page SHA-256 `58bc90a3…` and Tutorial 2
complete fence `8699bc9c…` match #407's claims. With `soroban-sdk =29.0.1`, `serde` and
`serde-json-core` 0.6 as the page lists, `cargo test` builds with no warnings and the page's test
passes (rustc 1.93.0). The distinct review
([review-sd101-astra.md](../../research/audits/2026-11-10-truth-maintenance/review-sd101-astra.md))
reproduced this and found two defects outside sd-101 that PR3081 did not introduce; the
coordinator reproduced Tutorial 1's `E0432 soroban_sdk::Hash` and confirmed the admin-count
control flow by reading the served fence:

- sd-103 → [stellar-docs#3097](https://github.com/stellar/stellar-docs/issues/3097): Tutorial 1
  complete contract imports root `Hash`; its test lacks dependency setup, uses `protocol_version: 1`,
  and discards its time-limit comparison.
- sd-104 → [stellar-docs#3098](https://github.com/stellar/stellar-docs/issues/3098):
  `set_signer` counts a re-added admin twice, so `remove` can delete the last admin.

Resolution comments (read back, author kalepail):
[3079](https://github.com/stellar/stellar-docs/issues/3079#issuecomment-6781657486),
[3081](https://github.com/stellar/stellar-docs/pull/3081#issuecomment-6781658006). PR3067 stays
silent: it is sd-098's event-migration PR, recorded in sd-101 only because its body acknowledged the
gap, and sd-098's resolution was posted on November 9. No golden or register references sd-101.

**cs-009.** Coordinator recheck (22:52:15Z): the portal returns 73 reports including ids 85–90,
all eight OpenZeppelin Stellar Contracts audits; the Scout mirror returns the same eight. The
distinct review
([review-cs009-astra.md](../../research/audits/2026-11-10-truth-maintenance/review-cs009-astra.md))
found ids 85–90 byte-identical to the upstream PDFs, and a latest-audit research query ranks v0.8.0
first. Residual metadata only: report 89 (v0.7.0) is dated 2026-04-26 against an April 6 cover,
noted in the resolution comment. No successor. `q-soroban-oz-token` already cites v0.8.0 and has no
cs-009 dependency. Resolution comment:
[256](https://github.com/Inferara/soroban-security-portal/issues/256#issuecomment-6781610108).

Historical references to both ids in dated ledgers and research audits stay as written.

Active findings: 83 → 81 retired + 2 filed = 83.

## Own-repo todos

- `.agents/TODO.md`: the Docs continuation entry now records sd-101's retirement and the sd-103 and
  sd-104 rechecks; a new dated entry checks the Software Versions page for Protocol 30 on or after
  December 1.
- `scripts/summarize-live-drift.mjs` buffer defect: fixed in this round (see Drift verdict).

## Decisions

- No deploy. Nothing in this round reaches the Worker: the inventory snapshot is not bundled, and
  catalog, spec and micro-map are byte-identical.
- #223 and #167 stay open without a comment; neither close condition moved.
- The Software Versions gap waits for upstream's usual Mainnet-time update instead of an issue now.

## Final checklist

- Spawned lanes t3kr, t3ks, t3kv, t3m6 and t3m7 finished; their reports are in
  `research/audits/2026-11-10-truth-maintenance/` (raw evidence stayed in ignored `tmp/`).
- Gates on the combined change, each exit 0: `npm run typecheck`, `npm test`, `npm run build`,
  `npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`,
  `npm run eval:qa:register -- --check`, `npm run improvements:lint`,
  `npm run eval:routing -- --gate`, `npm run secrets:scan -- --tree`, the generated-artifact sync
  block, and the live-contract lint. The sentinel check holds all 33 anchors.
- Upstream writes, all read back: comments on soroban-security-portal#256, stellar-docs#3079 and
  PR3081; new issues stellar-docs#3097 and #3098.
