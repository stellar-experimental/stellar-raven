# Closeout review — agent queue integration — 2026-09-02

Mode: audit only. No repository file was edited except this report.
Author: Grok 4.6, high effort. Independent of the closeout author and of the Fable audit.
Skills applied: `audit-reviewability` (rubric read in full).
Paid or provider calls: none. No live Cloudflare, GitHub, or model call.

## 1. Scope and fixed point

| Item | Value |
| --- | --- |
| Worktree | `/private/tmp/stellar-raven-agent-queue-integration` |
| Branch | `codex/agent-queue-2026-09-02` (no upstream) |
| Base | `3428631` (`main`, PR #116) |
| HEAD | `c4a064b` |
| Commits in range | `ce58e6b`, `52f6ae4`, `d6efe5f`, `02af87e`, `1421ffe`, `c4a064b` |
| Topology | linear first-parent; no merge commit |
| Uncommitted closeout | eight tracked files plus this round directory |
| Prior audit | `.agents/rounds/2026-09-02-agent-queue-closeout/review-fable.md` against `1421ffe` |

Files read: `AGENTS.md`, `.agents/TODO.md`, `.agents/NEXT.md`, the closeout ledger, `review-fable.md`, every 2026-09-02 ledger and its closure report, `eval/README.md`, `eval/vectorize/README.md`, `eval/gates.json`, `eval/qa/README.md` pack and comparability sections, `eval/qa/evidence-pack.mjs` date selection, `eval/lib/harness-guards.mjs`, and the complete `3428631..c4a064b` plus uncommitted diffs.

## 2. Verdict

**FAIL.** The six product commits are reviewed, linear, and internally consistent. Eight of nine Fable findings are closed. The original F1 defect is closed. Two Medium findings and one Low finding remain.

Do not write the closeout Outcome or land the documentation commit until M1, M2, and L1 are repaired or explicitly deferred.

Counts: 3 findings. 0 High. 2 Medium. 1 Low.

## 3. Fable F1 through F9

| Finding | Severity | State | Evidence |
| --- | --- | --- | --- |
| F1 | High | closed for the original defect; see M1 | `NEXT.md` no longer ranks the completed `--ids` block. It states that no unconditional agent-actionable block remains. Pack `p6` is recorded as complete. |
| F2 | Medium | closed | The `--ids` item is absent from `TODO.md`. Commit `ce58e6b` implemented it. |
| F3 | Medium | closed | The "Permitted now" free-evidence paragraph is replaced by the result summary, the four disputed controls, the 78-case union, and the current-manifest counts. |
| F4 | Medium | closed | `eval/README.md` now has `## Re-baseline (2026-09-02): Lumenloop A/V contract correction` with 213/279/312, 90/110/116, 16/23/23, and holdout 10/22/26. |
| F5 | Medium | closed | The protocol-history ledger appends the `4cd28f4b…fe8b` reconciliation. Earlier identity columns remain as dated record. |
| F6 | Medium | closed | Stale-gospel status is `complete; merged as 8ee41f3 (PR #115)`. `8ee41f3` is an ancestor of `HEAD`. |
| F7 | Low | closed | `eval/vectorize/README.md` records artifact `d9de7007…`, clause set `bed60846…`, and vectors `c6acd8b8…`. Those hashes match `rerank-config.mjs` and the committed artifact. |
| F8 | Low | closed | The A/V catalog ledger cites "The final bounded delta review in the closure report". That section exists at `review-fable-closure.md` line 254 and returns `PASS`. |
| F9 | Low | closed | The ids ledger residual table has the superseded-by line pointing at the residual-guards ledger. |

## 4. Findings, severity order

### M1 — Medium. The F1 rewrite dropped the local-branch owner step

Location: `.agents/NEXT.md` "State at handoff" and "Deploy the integrated runtime changes".
Evidence: `review-fable.md` section 9.1 required these present-state facts: the branch is local, it is not pushed, and it has no pull request. Section 7 item 5 treated push and the pull request as a human decision separate from deployment. `git status -sb` shows `codex/agent-queue-2026-09-02` with no upstream. `git rev-parse --abbrev-ref @{upstream}` fails. The closeout ledger says the F1 repair is a full rewrite per 9.1, adapted only because pack `p6` landed. That adaptation does not justify dropping the local-branch fact. Current `NEXT.md` starts the owner-blocked deploy at "Merge to `main`" and never names the branch, the missing upstream, or the push.
Consequence: the next reader treats merge as the first owner action and looks for a pull request that does not exist. Push is an external write. The queue no longer says so.
Repair: restore two sentences. In "State at handoff", record that branch `codex/agent-queue-2026-09-02` is local, has no upstream, and has no pull request. In the deploy block, put push and the pull request before merge, each behind owner instruction.

### M2 — Medium. The pack `p6` ledger still says the implementation is uncommitted

Location: `.agents/rounds/2026-09-02-av-evidence-pack-source-date.md` line 4 and line 95.
Evidence: `HEAD` is `c4a064b` (`fix: omit A/V ingest dates from evidence packs`). `PACK_VERSION` is `p6`. `TODO.md` no longer carries the item. `NEXT.md` lists the block as complete. The ledger status is still "local reconciliation complete". The Closure section still says "The implementation remains uncommitted." There is no Outcome line and no commit SHA. The closeout ledger says it accounts for `c4a064b`, but this file is not in the uncommitted closeout set. This is the same class as Fable F6: an unfinished ledger signals an unfinished round.
Consequence: a later agent re-commits, re-implements, or treats pack `p6` as still in the working tree.
Repair: set the status to `complete; committed as c4a064b`. Append a dated Outcome line that names the commit. Leave the intermediate Closure paragraph as history.

### L1 — Low. The digest ledger still points at a deleted TODO item

Location: `.agents/rounds/2026-09-02-av-runtime-date-semantics.md` lines 153–154.
Evidence: "That work is now recorded in `.agents/TODO.md` under Eval instruments." Commit `c4a064b` deleted that item. The sentence is present tense and now false. `NEXT.md` already lists the evidence-pack ledger under completed blocks.
Consequence: a reader follows the pointer into an empty queue slot and may re-file finished work.
Repair: append one superseded-by line that names the evidence-pack ledger and `c4a064b`, matching the F9 pattern.

## 5. Checks that passed

### Completed queue items

`TODO.md` headings that remain are trigger-only, monitor-only, owner-blocked, or deferred. These completed items are gone: `--ids` selectors, residual equals-form flags, A/V catalog wording, digest A/V dates, and the evidence-pack item. The protocol-history "Permitted now" work is recorded as complete. The paired "Permitted now" validator extension stays explicit and speculative. It is not hidden and it is not an unconditional next block.

### Human decisions

`NEXT.md` still names the Raven surface choice, PH2 or PH3, paired denominator / T4 / margin, and the optional `v2.10` rejudge. Safe defaults remain no spend. Deployment remains owner-blocked. M1 is the missing explicit decision.

### Protocol counts and manifest reconciliation

| Pin | Claim | Observed |
| --- | --- | --- |
| `catalog/manifest.json` | `4cd28f4b…fe8b` | `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b` |
| Manifest after `d6efe5f` | unchanged through `c4a064b` | blob identical |
| Target description | `80157277…798e43` | `80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43` |
| `inventory/stellar-light.json` (PH1) | `1a261c4a…` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| Research `x-routing` (PH1) | `468a9d98…` | `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` |
| Vendor scorer | `718924d1…` | `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` |
| 76-case inventory | `c8894006…08e17a` | compact SHA-256 matches; 76 files |
| Protocol-history family | four `sourceCase` values | `q-comp-yieldblox-oracle-incident`, `q-protocol-24-whisk-incident`, `q-protocol-version-history-list`, `q-soroban-auth-recursion-dos-audit` |
| Union | 78 | 76 + 4 − 2 |
| Clause artifact | `d9de7007…002b` | file SHA-256 matches |
| Clause set | `bed60846…1ff2` | payload matches |
| Vectors | `c6acd8b8…121f` | payload matches |

PH1 has not fired. The three-attempt box stays spent. The reconciliation counts 4/8 and 2/4 original, 3/11 and 6/9 blind, rest on the unchanged manifest and target description. This review did not re-run `eval:protocol-history`.

### Pack `p6` and routing re-baseline

`PACK_VERSION` is `p6`. `eval/qa/README.md` records pack `p6` as current and sets the judge tuple to `v2.10` / `p6`. Detected A/V rows skip `created_at` and skip canonical `date` when `dateField` is `created_at`. Commit `c4a064b` does not touch fixture files, which supports the byte-identical non-A/V claim. Same-tuple comparisons require the current pack. Stored `p5` artifacts are not paired-comparable.

`eval/gates.json` matches the new README section and the A/V catalog ledger: legacy 213/279/312, skills 16/23/23, holdout 10/22/26 with 11 forbidden captures and 21 passed cases. Extended 90/110/116 is in the gate note and the README. It is not a CI accepted total. The local trace name is `routing-2026-09-02T17-26-17-593Z.json`. Holdout note now points at a README that holds the 2026-09-02 movement.

### Deployment boundary

Production identity in `NEXT.md` matches `.agents/rounds/2026-09-01-release-closeout.md`: Worker Version `5ea8c1fe-e052-494d-b36b-ee8f5486a662` from `ea01f0d03c2bba88f5846922465c6a03af57e41e`. This review did not query live Cloudflare.

Two Worker runtime changes remain undeployed:

- `catalog/manifest.json` and `specs/super-spec.json` (`lumenloop.find_av_passages`)
- `src/skills/runners/stellar-ecosystem-digest.ts` (`date: null` on A/V rows)

Pack `p6`, fail-closed CLI syntax, ids guards, and the protocol-history record do not ship in the Worker. That split is correct.

### Interactions among the six commits

The range is linear: `3428631` → `ce58e6b` → `52f6ae4` → `d6efe5f` → `02af87e` → `1421ffe` → `c4a064b`.

`assertFailClosedCliSyntax` accepts only declared spaced forms, then `parseOptionalIdsFlag` still rejects duplicate `--ids`. Residual tests and ids tests both pass on the integrated tree. The catalog contract, digest `date: null`, and pack `p6` omit A/V ingest dates on three surfaces and do not contradict each other. Generated pins stay coupled: gates, clause artifact, and `rerank-config.mjs` all name manifest `4cd28f4b…`. `c4a064b` does not retouch those generated files.

Queue claims now match five of the six commits. M2 is the remaining claim error for `c4a064b`.

### Improvements and corpus lint

Active findings: 66. Statuses: 60 `reported-upstream`, 3 `proposed`, 3 `declined-upstream`. Services: 29 Lumenloop, 21 Stellar Docs, 9 Stellar Light, 6 skills, 1 provider. `ll-019` carries the 2026-09-02 recurrence. `npm run eval:qa:lint -- --stale` reports 0 errors and 62 warnings.

## 6. Verification run

| Command | Result |
| --- | --- |
| `git diff --check` on `HEAD` and on `3428631` | clean |
| `shasum -a 256` of manifest, vendor scorer, inventory, clause artifact | match the claims above |
| Node inventory of 76-case IDs and four family `sourceCase` values | match |
| `npm test -- --run` focused files (catalog, super-spec, skill-runners, evidence-pack, qa-harness, discovery guards) | 6 files, 260 tests passed |
| `npm test` | 100 files, 1692 tests passed |
| `npm run eval:selftest` | all checks passed |
| `npm run eval:qa:lint -- --stale` | 0 errors, 62 warnings |

Not run: `eval:routing -- --gate`, `eval:protocol-history`, `npm run build`, live production probes, `gh`, Herdr. Manifest, scorer, and target description are unchanged after `d6efe5f`, so the recorded diagnostic counts were not re-measured.

## 7. Repair order

1. Restore the local-branch and push/PR owner step in `NEXT.md` (M1).
2. Record `c4a064b` on the evidence-pack ledger (M2).
3. Append the superseded-by line on the digest ledger (L1).
4. Keep the closeout ledger in progress until a reviewer other than the author confirms these three are closed.
5. Then run `git diff --check` and `npm test` on the final documentation tree, land one commit, and write the Outcome.

Do not reopen PH2, PH3, labels, gates, or generated artifacts. Do not make a provider call.

## 8. Observations, not findings

- The protocol-history source table still calls the pre-`d6efe5f` manifest "current". F5 required an append, not a rewrite. The append is present.
- The ids ledger Review status still says R1 added a `TODO.md` item. Commit `02af87e` later removed that item. Fable F9 already chose the residual-table append as the repair.
- The closeout ledger status is in progress and its Outcome is pending. That matches this review.
- `NEXT.md` lists the Fable audit under completed blocks and still tells the next agent to finish this ledger. That split is honest once M1–L1 land.
- The paired validator denominator remains permitted and unranked. It is not an unclaimed unconditional block.
