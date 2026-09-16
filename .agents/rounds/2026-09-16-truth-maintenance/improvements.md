# Improvements audit — 2026-09-16

## Result

The active queue contains 61 records.

- 58 records have `reported-upstream` status.
- Three records have `declined-upstream` status.
- No active record has `proposed`, `verified`, or `fixed-upstream` status.
- The census covers 61 issue references, six direct pull request references, and 24 comment references.
- The references span ten upstream repositories.

The base lint passed all 61 records.
The authenticated live lint passed all 61 records and all recorded references.
All seven registered probes returned `recurring`.

Fresh original-trigger coverage exists for 12 active records.
These records are the seven probe records and the five priority Docs records.
The other 49 records are `unchecked` in this round.
This report does not label those records as `still-repro`.

The five new Raven handoffs are valid notification signals.
The five source fixes are live.
Each original Raven index trigger now shows the correction.
This report makes no lifecycle transition, as requested.

## Scope and safety

This lane audited active improvements records, upstream references, and inbound handoffs.
The parent lane owns Raven pull requests, Raven issue `#40`, and drift issue `#141`.
This report does not duplicate that metadata review.

No command committed, pushed, merged, deployed, commented, or closed anything.
No command changed a finding, golden, policy, gate, crawler, or index.
No paid evaluation or model collection ran.
No child agent ran.

One local terminal output exposure occurred during inspection.
This report contains no credential values.

## Checkout snapshot

The snapshot was taken after other lanes created their owned worktrees.
This lane did not enter or change those worktrees.

| Item | Value |
|---|---|
| Shared checkout | `/Users/kalepail/Desktop/stellar-raven-codemode` |
| Branch | `docs/cleanup-current-guidance` |
| `HEAD` | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` |
| Tracking ref | `origin/docs/cleanup-current-guidance` at `ac1769f75f72ba41622534f5f53b9c8944aeb69d` |
| `origin/main` | `722eef5f2a81845ebdd8206e17ee100344eabd58` |
| Existing untracked round state | `.agents/rounds/2026-09-16-truth-maintenance.md` and this round directory |

Observed worktrees:

| Path | Ref |
|---|---|
| `/Users/kalepail/Desktop/stellar-raven-codemode` | branch `docs/cleanup-current-guidance`, `ac1769f75f72ba41622534f5f53b9c8944aeb69d` |
| `/private/tmp/raven-audit-2026-09-16/base-worktree` | detached `722eef5f2a81845ebdd8206e17ee100344eabd58` |
| `/private/tmp/raven-audit-2026-09-16/pr-157-worktree` | detached `b447ff403f82734a0297b56c78a1a5515aa1f824` |
| `/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo` | detached `ac1769f75f72ba41622534f5f53b9c8944aeb69d` |

## Commands and gate evidence

The audit used these read-only commands.

```sh
git status --short --branch
git worktree list --porcelain
git branch --all --no-color --verbose --verbose
npm run improvements:lint
PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin node scripts/improvements-lint.mjs --live
npm run improvements:probes
npm run secrets:scan -- --tree
/opt/homebrew/bin/gh api repos/<owner>/<repo>/issues/<number>
/opt/homebrew/bin/gh api repos/<owner>/<repo>/issues/<number>/comments?per_page=100
/opt/homebrew/bin/gh api repos/<owner>/<repo>/issues/<number>/timeline?per_page=100
/opt/homebrew/bin/gh api repos/<owner>/<repo>/pulls/<number>
/opt/homebrew/bin/gh api repos/<owner>/<repo>/pulls/<number>/reviews?per_page=100
/opt/homebrew/bin/gh api repos/<owner>/<repo>/commits/<sha>/check-runs?per_page=100
/opt/homebrew/bin/gh api repos/stellar/stellar-docs/actions/runs?head_sha=<sha>&per_page=100
node /tmp/raven-improvements-live-recheck.mjs
node /tmp/raven-docs-index-extract.mjs
node /tmp/raven-sd044-search.mjs
rg -n --hidden --glob '!.dev.vars' --glob '!.env' --glob '!.env.*' --glob '!node_modules/**' --glob '!dist/**' \
  'protocol-20-soroban-phase-1-mainnet-edition-february-5-2024' .
```

Gate results:

| Gate | Result |
|---|---|
| `npm run improvements:lint` | Passed: `improvements lint ok (61 findings)` |
| Live lint | Passed: `improvements lint ok (61 findings, live intake checked)` |
| Probes | Seven recurring, zero fixed-candidate, zero inconclusive, zero errors |
| Inbound issue census | 24 total handoffs; five open and 19 closed |
| Active record census | 61 files; 58 reported and three declined |
| Tracked-tree secret scan | Passed with `gitleaks`; it covered tracked files only |
| Targeted output secret check | Six new files; zero exact-value matches and zero token-format matches |

The first live-lint attempt lacked external network access.
It reported 101 inaccessible references.
The authenticated external rerun passed every reference.
The first result was an environment limitation, not repository drift.

The `--tree` secret scan excludes untracked reports and evidence.
The targeted check covered this report and all five evidence files.
The coordinator will also use a temporary Git index for the new reports.

## Preserved reproduction evidence

The evidence directory contains three read-only scripts and one concise result file.
The scripts contain no credential values or private issue bodies.

| File | Purpose |
|---|---|
| `improvements-evidence/priority-source-index-recheck.ts` | Repeats all source marker and page-index checks. |
| `improvements-evidence/sd044-search-recheck.ts` | Repeats the original `sd-044` search and source example checks. |
| `improvements-evidence/priority-index-section-extract.ts` | Extracts only the named corrected index sections. |
| `improvements-evidence/priority-recheck-results.json` | Preserves concise sanitized results from this round. |
| `improvements-evidence/README.md` | States the read-only and credential-handling boundaries. |

All three scripts compiled and executed successfully from the repository root.

## Priority inbound handoffs

All five open handoffs were created by `ElliotFriend` on 2026-09-15.
They have no comments and remain open.

| Raven issue | Finding | Upstream work | Deployment workflow | Source recheck | Raven index recheck | Audit result |
|---|---|---|---|---|---|---|
| [#158](https://github.com/stellar-experimental/stellar-raven/issues/158) | `sd-040` | [stellar-docs#2768](https://github.com/stellar/stellar-docs/issues/2768) closed completed; [PR #2849](https://github.com/stellar/stellar-docs/pull/2849) merged as `41919839b9cfc38ebf80a393d461f5644169de98` | [Run 34893615637](https://github.com/stellar/stellar-docs/actions/runs/34893615637) completed successfully | HTTP 200. Old `.unwrap()` count was zero. `ConversionError` count was two. | Complete 7-section result. The corrected section returns `Result&lt;Address, ConversionError&gt;`. It has no `.unwrap()`. | Fix observed. Keep stored status by instruction. |
| [#159](https://github.com/stellar-experimental/stellar-raven/issues/159) | `sd-041` | [stellar-docs#2769](https://github.com/stellar/stellar-docs/issues/2769) closed completed; [PR #2853](https://github.com/stellar/stellar-docs/pull/2853) merged as `525c722ceaeb4b839f46d03c2503cb61a019f4d9` | [Run 34891807895](https://github.com/stellar/stellar-docs/actions/runs/34891807895) completed successfully | HTTP 200. The past-tense lead was absent. All three corrected markers were present. | Complete 15-section result. The page-root record contains all corrected statements. | Fix observed. Keep stored status by instruction. |
| [#160](https://github.com/stellar-experimental/stellar-raven/issues/160) | `sd-044` | [stellar-docs#2772](https://github.com/stellar/stellar-docs/issues/2772) closed completed; [PR #2850](https://github.com/stellar/stellar-docs/pull/2850) merged as `6a8bea6a253a74ab646023b82459a007072f1baf`; [PR #2859](https://github.com/stellar/stellar-docs/pull/2859) merged as `6aafb49f59522b399f0a60642dd815d730cd6904` | [Run 34984769468](https://github.com/stellar/stellar-docs/actions/runs/34984769468) and [run 34992371097](https://github.com/stellar/stellar-docs/actions/runs/34992371097) completed successfully | HTTP 200 on all three pages. The run-command page contains the local example and port `11626`. | The original search returns two correct flag records. Operation Modes and Network Modes page reads are complete. The Run Commands page read returns soft-empty. | The source fix and original search fix are observed. Keep stored status by instruction. |
| [#161](https://github.com/stellar-experimental/stellar-raven/issues/161) | `sd-045` | [stellar-docs#2773](https://github.com/stellar/stellar-docs/issues/2773) closed completed; [PR #2851](https://github.com/stellar/stellar-docs/pull/2851) merged as `29728e1f15890151859d340ba5c8a8fad24ec6b1` | [Run 34891414642](https://github.com/stellar/stellar-docs/actions/runs/34891414642) completed successfully | HTTP 200. The old HTTPS phrase was absent. All loopback markers were present. | Complete 35-section result. `#setup-https-on-localhost` contains the corrected secure-context text. | Fix observed. Keep stored status by instruction. |
| [#162](https://github.com/stellar-experimental/stellar-raven/issues/162) | `sd-051` | [stellar-docs#2843](https://github.com/stellar/stellar-docs/issues/2843) closed completed; [PR #2845](https://github.com/stellar/stellar-docs/pull/2845) merged as `0efbb0559b4851fdc2bff83beb1b03a851641630` | [Run 35014808562](https://github.com/stellar/stellar-docs/actions/runs/35014808562) completed successfully | HTTP 200. All corrected phase and date markers were present. `Mainnet Edition` count was zero. | Complete 159-section result. The new anchor, breadcrumb, activation text, and 2024 Core date are correct. | Fix observed. Keep stored status by instruction. |

The `#162` handoff contains one narrative date typo.
It says `2026-02-05` in one deviation paragraph.
The deployed page and Raven index correctly say `February 5, 2024`.
The handoff should receive a correction during an authorized closure action.

The old `sd-051` anchor has no match in the current repository corpus.

## Priority source and index details

### `sd-040`

The source and index contain this corrected signature:

```text
pub fn address_from_xdr_bytes(env: Env, bytes: Bytes) -> Result<Address, ConversionError>
```

The index explains both failure modes.
It states that invalid XDR can panic without contract recovery.

### `sd-041`

The source and index use the same current lead.
They state that many services still rely on memos.
They also state that the guide covers both approaches.

### `sd-044`

The Operation Modes index record contains the flag, default, setting, and constraints.
It also contains the `manualclose` command and one-ledger behavior.

The Network Modes index record lists the flag for local mode.
The source Run Commands page contains this example:

```text
docker run ... -p "127.0.0.1:11626:11626" ... --local --enable-core-manual-close
```

The original search query now returns two relevant records.
It no longer returns only unrelated ingestion pages.

### `sd-045`

The source and index remove the unqualified HTTPS statement.
They name `http://localhost` and `http://127.0.0.1` as secure contexts.
They retain optional HTTPS setup guidance.

### `sd-051`

The source and index use this current heading:

```text
Protocol 20: Soroban Phase 0 (Mainnet, February 20, 2024)
```

The indexed record states the Mainnet activation time.
It dates Stellar Core `v20.2.0` to February 5, 2024.
The Phase 1 and Phase 2 breadcrumbs retain February 27 and March 19.

## Probe coverage

The command `npm run improvements:probes` ran every registered probe.

| Finding | Fresh result | Exact signal |
|---|---|---|
| `ll-003` | `still-repro` | The response still contains `africa`, `Africa`, `mena`, and `MENA`. |
| `ll-007` | `still-repro` | Event identifiers `1597` and `1598` retain the date-prose mismatch. |
| `sk-005` | `still-repro` | `user-invocable: true` remains. `audience:` and `transport:` remain absent. |
| `sk-007` | `still-repro` | The source still contains `Today is 2026-06-08`. |
| `sk-014` | `still-repro` | The source still claims `Pausable` and `ReentrancyGuard` primitives. |
| `sk-015` | `still-repro` | The vendor-specific setup trigger remains. |
| `sk-022` | `still-repro` | `#[derive(UpgradeableMigratable)]` remains. |

No probe changed a lifecycle state.

## Deterministic active population table

`Unchecked` means no original trigger ran during this round.
It does not mean the finding still reproduces.

### Lumenloop

| Finding | Stored status | Current upstream signal | Fresh trigger | Action |
|---|---|---|---|---|
| `ll-001` | reported | [backend#21](https://github.com/lumenloop/lumenloop-backend/issues/21) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-002` | reported | [backend#22](https://github.com/lumenloop/lumenloop-backend/issues/22) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-003` | reported | [backend#23](https://github.com/lumenloop/lumenloop-backend/issues/23) open; latest `kalepail`, 2026-07-13 | `still-repro` | Keep reported. Keep routine recurrence local. |
| `ll-004` | reported | [backend#42](https://github.com/lumenloop/lumenloop-backend/issues/42) open; latest `kalepail`, 2026-07-27 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-005` | reported | [backend#19](https://github.com/lumenloop/lumenloop-backend/issues/19) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-006` | reported | [backend#18](https://github.com/lumenloop/lumenloop-backend/issues/18) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-007` | reported | [backend#20](https://github.com/lumenloop/lumenloop-backend/issues/20) open; latest `kalepail`, 2026-07-13 | `still-repro` | Keep reported. Keep routine recurrence local. |
| `ll-008` | reported | [ecosystem-db#3](https://github.com/lumenloop/stellar-ecosystem-db/issues/3) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-009` | reported | [backend#25](https://github.com/lumenloop/lumenloop-backend/issues/25) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-010` | reported | [backend#27](https://github.com/lumenloop/lumenloop-backend/issues/27) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-011` | reported | [backend#24](https://github.com/lumenloop/lumenloop-backend/issues/24) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-012` | reported | [backend#29](https://github.com/lumenloop/lumenloop-backend/issues/29) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-013` | reported | [backend#26](https://github.com/lumenloop/lumenloop-backend/issues/26) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-014` | reported | [backend#30](https://github.com/lumenloop/lumenloop-backend/issues/30) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-015` | reported | [backend#28](https://github.com/lumenloop/lumenloop-backend/issues/28) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-016` | reported | [backend#31](https://github.com/lumenloop/lumenloop-backend/issues/31) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-017` | reported | [backend#36](https://github.com/lumenloop/lumenloop-backend/issues/36) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-018` | reported | [backend#34](https://github.com/lumenloop/lumenloop-backend/issues/34) open; latest `kalepail`, 2026-08-11 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-019` | reported | [backend#35](https://github.com/lumenloop/lumenloop-backend/issues/35) open; latest `kalepail`, 2026-08-19 | Unchecked | Inconclusive. Keep separate from `ll-029`. |
| `ll-020` | reported | [backend#32](https://github.com/lumenloop/lumenloop-backend/issues/32) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-022` | reported | [backend#38](https://github.com/lumenloop/lumenloop-backend/issues/38) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-023` | reported | [backend#39](https://github.com/lumenloop/lumenloop-backend/issues/39) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-024` | reported | [backend#33](https://github.com/lumenloop/lumenloop-backend/issues/33) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-025` | reported | [backend#37](https://github.com/lumenloop/lumenloop-backend/issues/37) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-026` | reported | [backend#40](https://github.com/lumenloop/lumenloop-backend/issues/40) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-027` | reported | [backend#41](https://github.com/lumenloop/lumenloop-backend/issues/41) open; latest `kalepail`, 2026-07-13 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-028` | reported | [backend#43](https://github.com/lumenloop/lumenloop-backend/issues/43) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `ll-029` | reported | [backend#35](https://github.com/lumenloop/lumenloop-backend/issues/35) open; latest `kalepail`, 2026-08-19 | Unchecked | Inconclusive. Keep separate from `ll-019`. |
| `ll-030` | reported | [backend#44](https://github.com/lumenloop/lumenloop-backend/issues/44) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |

### Skills

| Finding | Stored status | Current upstream signal | Fresh trigger | Action |
|---|---|---|---|---|
| `sk-004` | reported | [lumenloop-skills#1](https://github.com/lumenloop/lumenloop-skills/issues/1) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `sk-005` | reported | [lumenloop-skills#2](https://github.com/lumenloop/lumenloop-skills/issues/2) open; no comments | `still-repro` | Keep reported. Keep routine recurrence local. |
| `sk-007` | reported | [lumenloop-skills#3](https://github.com/lumenloop/lumenloop-skills/issues/3) open; no comments | `still-repro` | Keep reported. Keep routine recurrence local. |
| `sk-014` | reported | [openzeppelin-skills#13](https://github.com/OpenZeppelin/openzeppelin-skills/issues/13) open; no comments | `still-repro` | Keep reported. Keep routine recurrence local. |
| `sk-015` | reported | [openzeppelin-skills#14](https://github.com/OpenZeppelin/openzeppelin-skills/issues/14) open; no comments | `still-repro` | Keep reported. Keep routine recurrence local. |
| `sk-019` | reported | [stellar-scout#13](https://github.com/Stellar-Light/stellar-scout/issues/13) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `sk-022` | reported | [openzeppelin-skills#16](https://github.com/OpenZeppelin/openzeppelin-skills/issues/16) open; related [#14](https://github.com/OpenZeppelin/openzeppelin-skills/issues/14) open | `still-repro` | Keep reported. Do not collapse it into `sk-015`. |

### Stellar Docs and protocol owners

| Finding | Stored status | Current upstream signal | Fresh trigger | Action |
|---|---|---|---|---|
| `sd-003` | reported | [docs#2566](https://github.com/stellar/stellar-docs/issues/2566) open; [PR #2572](https://github.com/stellar/stellar-docs/pull/2572) merged | Unchecked | Inconclusive. A merge does not prove the original trigger. |
| `sd-004` | declined | [docs#2567](https://github.com/stellar/stellar-docs/issues/2567) closed completed; [PR #2572](https://github.com/stellar/stellar-docs/pull/2572) merged | Unchecked | Keep declined. Revisit only with new evidence. |
| `sd-005` | reported | [docs#2565](https://github.com/stellar/stellar-docs/issues/2565) open; latest `kalepail`, 2026-07-27 | Unchecked | Inconclusive. Keep the narrowed recommendation. |
| `sd-009` | declined | [docs#2575](https://github.com/stellar/stellar-docs/issues/2575) closed `not_planned` | Unchecked | Keep declined. Revisit only with new evidence. |
| `sd-014` | reported | [docs#2611](https://github.com/stellar/stellar-docs/issues/2611) open; latest `ElliotFriend`, 2026-07-21 | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `sd-027` | reported | [docs#2700](https://github.com/stellar/stellar-docs/issues/2700) open; [PR #2367](https://github.com/stellar/stellar-docs/pull/2367) closed unmerged; [PR #2837](https://github.com/stellar/stellar-docs/pull/2837) open blocked | Unchecked | Inconclusive. Recheck both live pages after deployment. |
| `sd-029` | reported | [docs#2602](https://github.com/stellar/stellar-docs/issues/2602) open; [PR #2789](https://github.com/stellar/stellar-docs/pull/2789) merged | Unchecked | Inconclusive. The PR states that a residual remains. |
| `sd-032` | reported | [docs#2606](https://github.com/stellar/stellar-docs/issues/2606) open; [PR #2410](https://github.com/stellar/stellar-docs/pull/2410) merged; [PR #2810](https://github.com/stellar/stellar-docs/pull/2810) draft blocked | Unchecked | Inconclusive. Recheck after the draft merges and deploys. |
| `sd-034` | reported | [docs#2700](https://github.com/stellar/stellar-docs/issues/2700) open; [PR #2367](https://github.com/stellar/stellar-docs/pull/2367) closed unmerged; [PR #2837](https://github.com/stellar/stellar-docs/pull/2837) open blocked | Unchecked | Inconclusive. Keep separate from `sd-027`. |
| `sd-035` | reported | [docs#2609](https://github.com/stellar/stellar-docs/issues/2609) open; [PR #2659](https://github.com/stellar/stellar-docs/pull/2659) merged | Unchecked | Inconclusive. The recorded merge was a stopgap. |
| `sd-037` | reported | [stellar-protocol#1981](https://github.com/stellar/stellar-protocol/issues/1981) closed `not_planned`; latest bot comment, 2026-08-14 | Unchecked | Inconclusive. Closure does not prove a fix. |
| `sd-040` | reported | [docs#2768](https://github.com/stellar/stellar-docs/issues/2768) closed completed; [PR #2849](https://github.com/stellar/stellar-docs/pull/2849) merged | Fix observed | Keep stored status. A later reviewer can evaluate retirement. |
| `sd-041` | reported | [docs#2769](https://github.com/stellar/stellar-docs/issues/2769) closed completed; [PR #2853](https://github.com/stellar/stellar-docs/pull/2853) merged | Fix observed | Keep stored status. A later reviewer can evaluate retirement. |
| `sd-044` | reported | [docs#2772](https://github.com/stellar/stellar-docs/issues/2772) closed completed; [PR #2850](https://github.com/stellar/stellar-docs/pull/2850) and [PR #2859](https://github.com/stellar/stellar-docs/pull/2859) merged | Fix observed | Keep stored status. A later reviewer can evaluate retirement. |
| `sd-045` | reported | [docs#2773](https://github.com/stellar/stellar-docs/issues/2773) closed completed; [PR #2851](https://github.com/stellar/stellar-docs/pull/2851) merged | Fix observed | Keep stored status. A later reviewer can evaluate retirement. |
| `sd-046` | reported | [docs#2842](https://github.com/stellar/stellar-docs/issues/2842) open; [PR #2844](https://github.com/stellar/stellar-docs/pull/2844) open blocked | Unchecked | Inconclusive. Recheck both pages after deployment. |
| `sd-048` | reported | [stellar-protocol#2010](https://github.com/stellar/stellar-protocol/issues/2010) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `sd-050` | reported | [docs#2561](https://github.com/stellar/stellar-docs/issues/2561) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |
| `sd-051` | reported | [docs#2843](https://github.com/stellar/stellar-docs/issues/2843) closed completed; [PR #2845](https://github.com/stellar/stellar-docs/pull/2845) merged | Fix observed | Keep stored status. Correct the handoff typo during authorized closure. |
| `sd-052` | reported | [stellar-cli#2722](https://github.com/stellar/stellar-cli/issues/2722) open; no comments | Unchecked | Inconclusive. Wait for owner activity or a fresh trigger. |

### Stellar Light and Scout

| Finding | Stored status | Current upstream signal | Fresh trigger | Action |
|---|---|---|---|---|
| `sls-024` | reported | [stellarlight#494](https://github.com/Stellar-Light/stellarlight/issues/494) and [stellar-scout#9](https://github.com/Stellar-Light/stellar-scout/issues/9) closed completed | Unchecked | Inconclusive. Do not infer a fix from closed refs. |
| `sls-029` | reported | [stellarlight#514](https://github.com/Stellar-Light/stellarlight/issues/514) and [#742](https://github.com/Stellar-Light/stellarlight/issues/742) closed completed | Unchecked | Inconclusive. Do not infer a fix from closed refs. |
| `sls-033` | reported | [stellarlight#519](https://github.com/Stellar-Light/stellarlight/issues/519) and [#742](https://github.com/Stellar-Light/stellarlight/issues/742) closed completed | Unchecked | Inconclusive. Do not infer a fix from closed refs. |
| `sls-039` | declined | [stellarlight#522](https://github.com/Stellar-Light/stellarlight/issues/522) closed completed; [PR #530](https://github.com/Stellar-Light/stellarlight/pull/530) merged | Unchecked | Keep declined. Revisit only if provider history fails. |

### Workers AI provider

| Finding | Stored status | Current upstream signal | Fresh trigger | Action |
|---|---|---|---|---|
| `wai-001` | reported | [cloudflare/ai#634](https://github.com/cloudflare/ai/issues/634) open; [PR #639](https://github.com/cloudflare/ai/pull/639) open blocked | Unchecked | Inconclusive. Wait for review, checks, release, and a fresh trigger. |

The tables contain exactly 61 active rows.

## Pull request checks and reviews

The table covers direct pull references and active issue-linked pull requests.
Passing checks do not prove an upstream deployment or a fixed trigger.

| Pull request | Current state | Review signal | Check signal | Required action |
|---|---|---|---|---|
| [stellar-docs#2367](https://github.com/stellar/stellar-docs/pull/2367) | Closed without merge; blocked | Comment-only reviews | Listed checks passed | Keep `sd-027` and `sd-034` unresolved. |
| [stellar-docs#2410](https://github.com/stellar/stellar-docs/pull/2410) | Merged `ef832168a80a064b3e17f8bc763d7b7c7fafb3d2` | `ElliotFriend` approved | Listed checks passed | Do not infer `sd-032` completion. |
| [stellar-docs#2572](https://github.com/stellar/stellar-docs/pull/2572) | Merged `26542769f692926bc20cf44638c73b219a986802` | `ElliotFriend` approved | Listed checks passed | Keep `sd-003` and `sd-004` evidence-separated. |
| [stellar-docs#2659](https://github.com/stellar/stellar-docs/pull/2659) | Merged `7a8791c4eca5e031c5185876f3127a2fe3d1589a` | `kaankacar` approved | Listed checks passed | Keep the durable `sd-035` residual. |
| [stellar-docs#2789](https://github.com/stellar/stellar-docs/pull/2789) | Merged `9d71821f8405c262dec974da53da834604fd63ca` | Two approvals | Listed checks passed | Recheck the remaining `sd-029` boundary later. |
| [stellar-docs#2810](https://github.com/stellar/stellar-docs/pull/2810) | Open draft; blocked | `xw-dd` approved | Listed checks passed | Draft state blocks a deployment check. |
| [stellar-docs#2837](https://github.com/stellar/stellar-docs/pull/2837) | Open; blocked | `xw-dd` approved | Listed checks passed | Merge and deployment remain pending. |
| [stellar-docs#2844](https://github.com/stellar/stellar-docs/pull/2844) | Open; blocked | `xw-dd` approved; `ElliotFriend` commented | Listed checks passed | Merge and deployment remain pending. |
| [stellar-docs#2845](https://github.com/stellar/stellar-docs/pull/2845) | Merged `0efbb0559b4851fdc2bff83beb1b03a851641630` | `ElliotFriend` and `xw-dd` approved | Listed checks passed | Live source and index now agree. |
| [stellar-docs#2849](https://github.com/stellar/stellar-docs/pull/2849) | Merged `41919839b9cfc38ebf80a393d461f5644169de98` | `ElliotFriend` approved | Listed checks passed | Live source and index now agree. |
| [stellar-docs#2850](https://github.com/stellar/stellar-docs/pull/2850) | Merged `6a8bea6a253a74ab646023b82459a007072f1baf` | `ElliotFriend` approved | Listed checks passed | Live source and index now agree. |
| [stellar-docs#2851](https://github.com/stellar/stellar-docs/pull/2851) | Merged `29728e1f15890151859d340ba5c8a8fad24ec6b1` | `ElliotFriend` approved | Listed checks passed | Live source and index now agree. |
| [stellar-docs#2853](https://github.com/stellar/stellar-docs/pull/2853) | Merged `525c722ceaeb4b839f46d03c2503cb61a019f4d9` | `ElliotFriend` approved | Listed checks passed | Live source and index now agree. |
| [stellar-docs#2859](https://github.com/stellar/stellar-docs/pull/2859) | Merged `6aafb49f59522b399f0a60642dd815d730cd6904` | `ElliotFriend` approved | Listed checks passed | It completes the `sd-044` local-mode list. |
| [stellarlight#530](https://github.com/Stellar-Light/stellarlight/pull/530) | Merged `7bcd2857057006ced420b1a5516bf68478c12c13` | No reviews | Listed checks passed | Keep the `sls-039` owner decision. |
| [cloudflare/ai#639](https://github.com/cloudflare/ai/pull/639) | Open; blocked | No reviews | No checks reported | Review, checks, release, and trigger recheck remain pending. |

The closed Scout issues link additional merged pull requests.
All their listed checks passed.
This round did not run their original triggers.

| Active record scope | Linked pull requests |
|---|---|
| `sls-024` via `stellarlight#494` | [#538](https://github.com/Stellar-Light/stellarlight/pull/538), [#1301](https://github.com/Stellar-Light/stellarlight/pull/1301), [#1302](https://github.com/Stellar-Light/stellarlight/pull/1302), [#1316](https://github.com/Stellar-Light/stellarlight/pull/1316) |
| `sls-029` via `stellarlight#514` and `#742` | [#527](https://github.com/Stellar-Light/stellarlight/pull/527), [#748](https://github.com/Stellar-Light/stellarlight/pull/748), [#842](https://github.com/Stellar-Light/stellarlight/pull/842), [#991](https://github.com/Stellar-Light/stellarlight/pull/991), [#1298](https://github.com/Stellar-Light/stellarlight/pull/1298) |
| `sls-033` via `stellarlight#519` and `#742` | [#528](https://github.com/Stellar-Light/stellarlight/pull/528), [#540](https://github.com/Stellar-Light/stellarlight/pull/540), [#543](https://github.com/Stellar-Light/stellarlight/pull/543), [#748](https://github.com/Stellar-Light/stellarlight/pull/748), [#842](https://github.com/Stellar-Light/stellarlight/pull/842), [#991](https://github.com/Stellar-Light/stellarlight/pull/991), [#1298](https://github.com/Stellar-Light/stellarlight/pull/1298) |

## Recorded comment attribution

The live lint resolved all 24 stored comment URLs.
The audit also checked each recorded author.

- All recorded Lumenloop comments are by `kalepail`.
- The stored `stellarlight` comments are by `kalepail`.
- The stored Docs maintainer comments are by `ElliotFriend` or `kaankacar`.
- The stored Docs recurrence comments are by `kalepail`.

No record misattributes a Raven-authored comment as maintainer acceptance.

## Complete inbound handoff census

There are 24 `[upstream-ready]` issues in Raven.
Five are open, and 19 are closed completed.

| State | Raven issues |
|---|---|
| Open | [#158](https://github.com/stellar-experimental/stellar-raven/issues/158), [#159](https://github.com/stellar-experimental/stellar-raven/issues/159), [#160](https://github.com/stellar-experimental/stellar-raven/issues/160), [#161](https://github.com/stellar-experimental/stellar-raven/issues/161), [#162](https://github.com/stellar-experimental/stellar-raven/issues/162) |
| Closed completed | [#6](https://github.com/stellar-experimental/stellar-raven/issues/6), [#22](https://github.com/stellar-experimental/stellar-raven/issues/22), [#28](https://github.com/stellar-experimental/stellar-raven/issues/28), [#29](https://github.com/stellar-experimental/stellar-raven/issues/29), [#30](https://github.com/stellar-experimental/stellar-raven/issues/30), [#31](https://github.com/stellar-experimental/stellar-raven/issues/31), [#32](https://github.com/stellar-experimental/stellar-raven/issues/32), [#33](https://github.com/stellar-experimental/stellar-raven/issues/33), [#34](https://github.com/stellar-experimental/stellar-raven/issues/34), [#37](https://github.com/stellar-experimental/stellar-raven/issues/37), [#130](https://github.com/stellar-experimental/stellar-raven/issues/130), [#131](https://github.com/stellar-experimental/stellar-raven/issues/131), [#132](https://github.com/stellar-experimental/stellar-raven/issues/132), [#136](https://github.com/stellar-experimental/stellar-raven/issues/136), [#138](https://github.com/stellar-experimental/stellar-raven/issues/138), [#140](https://github.com/stellar-experimental/stellar-raven/issues/140), [#144](https://github.com/stellar-experimental/stellar-raven/issues/144), [#145](https://github.com/stellar-experimental/stellar-raven/issues/145), [#146](https://github.com/stellar-experimental/stellar-raven/issues/146) |

The older closed handoffs refer to resolved records.
This audit did not reopen their retired findings.

## Required `sls-080` cadence check

The current round requires one free local `scout.explainRepo` reading.
The required question is:

```text
Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?
```

The repository is `stellar/stellar-horizon`.

No pre-existing local Raven server was available.
The process census showed no Raven Wrangler or Raven `workerd` process.
The observed local listeners belonged to unrelated projects.
This lane did not start Wrangler.

Therefore, this round has no new value, `generatedAt`, `scannedRef`, or `answerSource` result.
The cadence check remains `unchecked` because its allowed runtime was unavailable.

## Limitations

- Only 12 active records received fresh original-trigger coverage.
- The other 49 records remain `unchecked` and `inconclusive` in this round.
- GitHub state shows workflow history and owner activity only.
- GitHub state does not prove deployment or trigger repair.
- The local Raven cadence check could not run without an existing server.
- The parent lane owns Raven pull request, branch, worktree, and drift conclusions.
- This lane only records the shared checkout snapshot for coordination.

## Next actions

1. Keep all active statuses unchanged in this audit.
2. Assign a distinct reviewer before any priority finding enters retirement review.
3. Correct the `#162` narrative typo during an authorized handoff action.
4. Close `#158` through `#162` only after the approved lifecycle update records this evidence.
5. Recheck `sd-027`, `sd-032`, `sd-034`, and `sd-046` after their pull requests deploy.
6. Recheck `wai-001` only after `cloudflare/ai#639` passes review, checks, merge, and release.
7. Run the `sls-080` free check when an existing local Raven server is available.
8. Keep routine recurrences local unless owner activity meets the comment threshold.
