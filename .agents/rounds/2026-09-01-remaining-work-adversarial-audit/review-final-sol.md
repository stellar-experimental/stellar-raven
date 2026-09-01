# Independent completion review — Sol

Date: 2026-09-01
Branch: `docs/remaining-work-adversarial-audit`
Fixed point: `origin/main` at `981578552a40ccf7cb847ef80a7f96c9edb8802f`
Reviewed state: working tree at the same commit, with the branch document changes

## Runtime

| Field | Value |
| --- | --- |
| Runtime | Codex |
| Assigned review lane | Sol |
| Served model | Not exposed by the runtime |
| Requested effort | Not present in the assignment |
| Observed effort | Not exposed by the runtime |
| Review sessions | One |
| Sub-agents | None |
| Network calls | None |
| Paid calls | None |
| Live service reads | None |
| Production actions | None |
| File writes | This report only |

## Verdict

**FINDINGS**

The branch has one authorization conflict, three incomplete repairs, and one unstamped state claim.

The 17 listed reconciliation groups have repository support. However, the synthesis did not cover every required auditor finding.

No paid run or deployment has authorization. A read-only production fetch does have authorization, contrary to the round scope.

## Review scope

I read `AGENTS.md` and the complete diff from `origin/main`.

I read all seven untracked files in the audit directory. I also read the synthesis ledger.

I checked each reconciliation against its cited source. I checked the queue against all six audit reports.

I reviewed the validation record and repeated each safe, non-writing check. I did not query any live service.

The worktree had seven modified documents. It also had the synthesis ledger and seven untracked audit files.

The diff contains 385 insertions and 139 deletions. It changes no runtime source file.

## Findings

### F1 — High — The queue authorizes a live production fetch

Locations:

- `.agents/rounds/2026-09-01-remaining-work-adversarial-audit.md:12`
- `.agents/rounds/2026-09-01-remaining-work-adversarial-audit.md:85`
- `.agents/NEXT.md:9`
- `.agents/NEXT.md:61`
- `.agents/NEXT.md:181`
- `.agents/TODO.md:21`
- `.agents/TODO.md:24`

The round scope authorizes no live fetch. The synthesis also says that no decision authorizes a fetch.

`NEXT.md` directs the next agent to read the live Worker revision. `TODO.md` explicitly permits that production check.

The check uses `cloudflare-observability-review`. That workflow reads live production observability data.

The queue therefore grants authority that the round explicitly denies. The conflict also fails this completion review requirement.

Exact repair:

1. Remove `Permitted now` from `.agents/TODO.md:21`.
2. Remove the statement that the production check is allowed.
3. Mark the live check as owner-blocked.
4. Permit only local revision analysis and a proposed query plan before owner approval.
5. Keep deployment under its separate owner decision and production preflight.
6. Retain the current no-fetch scope unless the owner grants explicit authority later.

### F2 — Medium — The capability-boundary `Method 2` remains undefined

Locations:

- `.agents/TODO.md:204`
- `.agents/TODO.md:206`
- `.agents/rounds/2026-08-31-rejected-experiments-closeout.md:65`
- `.agents/rounds/2026-09-01-remaining-work-adversarial-audit/audit-glm.md:40`

The GLM audit required a qualified method name. The synthesis did not list or apply this repair.

The current text says only that `Method 2` did not run. Another dated ledger uses the same name differently.

The five-track `Method 2` completed and spent `$40.9579502`. A search can therefore produce the opposite result.

Closed snapshot `fb9a35eb` defines the capability-boundary method. It is the deterministic sample-30 headline and plan regrade.

Exact repair:

1. Replace both bare names with `the capability-boundary Method 2`.
2. Define it as the deterministic sample-30 headline with an offline plan regrade.
3. State that the five-track `Method 2` is separate and complete.
4. Preserve the statement that the capability-boundary authorization is spent.

### F3 — Medium — Three monitor triggers remain open to interpretation

Locations:

- `.agents/TODO.md:75`
- `.agents/TODO.md:76`
- `.agents/TODO.md:264`
- `.agents/rounds/2026-09-01-remaining-work-adversarial-audit/audit-grok.md:168`

The Grok audit required measurable recurrence terms. The synthesis did not list this repair.

`three recurring misses` does not identify the required miss class. `three recurrences` does not identify a successful recovery.

ADR-0008 supplies the positive-miss rule. Closed snapshot `6baec0a4` supplies the successful-recovery recurrence rule.

The Friendbot item still uses `a second unrelated case`. It does not define an unrelated case.

The vendor and protocol-history items now define this term. The Friendbot item does not use those definitions.

Exact repair:

1. Use `three qualifying positive operation-selection misses remaining after recovery` for ranking.
2. Use `three successful-recovery recurrences` for the Docs conflict.
3. Define each recurrence as a dated re-execution with the same finding identity.
4. Require the correct recovery sequence before counting a Docs conflict recurrence.
5. Define Friendbot cases by different question families and primary services.
6. Exclude paraphrases of the first case.
7. Require a case ID, a result stamp, and a transcript for every counted case.

### F4 — Medium — The secret scan excludes the new audit files

Locations:

- `.agents/rounds/2026-09-01-remaining-work-adversarial-audit.md:115`
- `scripts/scan-secrets.mjs:15`
- `scripts/scan-secrets.mjs:17`
- `scripts/scan-secrets.mjs:247`

The validation table reports a clean tree scan. Tree mode scans tracked files only.

The synthesis ledger and all seven audit-directory files were untracked during that scan. This report is also untracked now.

The clean result does not cover the primary new artifacts. Manual reading found no apparent secret.

Exact repair:

1. Stage only the intended branch files after all document repairs.
2. Run `npm run secrets:scan` in its default staged mode.
3. Record that staged coverage in the validation table.
4. Do not claim full new-file coverage before the staged scan passes.

### F5 — Low — One upstream issue state lacks an evidence date

Location: `.agents/NEXT.md:17`

The text says that `Stellar-Light/stellarlight#1031` is still open. This review used no live service.

The audit sources last read this issue on 2026-08-31. Its state can change after that read.

The nearby production state uses `last recorded`. The issue state needs the same evidence label.

Exact repair:

Replace the sentence with this text:

> `Stellar-Light/stellarlight#1031` was last recorded open on 2026-08-31. The maintainer owns the close.

Keep the existing next-round refresh task. Do not post a reminder comment.

## Reconciled finding verification

| Reconciled group | Result | Repository evidence |
| --- | --- | --- |
| Raven capability boundary | Verified | `.agents/TODO.md:197`; `.agents/NEXT.md:69`; closed snapshot `fb9a35eb` |
| Answering-agent environment pin | Verified | `.agents/TODO.md:171`; invalid inherited hash in the closeout |
| Paired promotion design | Verified | `.agents/TODO.md:230`; `.agents/NEXT.md:141`; paired validator output |
| `sls-080` status | Verified | `reported-upstream`; issue `Stellar-Light/stellarlight#1134` |
| Protocol-history code names | Verified | PH1 through PH4 replace the conflicting T-codes |
| PH1 and PH4 conditions | Verified | Both PH1 hashes match; PH4 defines distinct families and entities |
| Routing completion gate | Verified | `.agents/TODO.md:163`; attempt-three brief section 8 |
| Recovery source parity | Verified | `.agents/TODO.md:71`; source and answer share `scannedRef` |
| Recovery cadence | Verified | `.agents/TODO.md:66`; four required result fields are present |
| `sources.locate` deferral | Verified | `.agents/TODO.md:270`; design record sections 8 and 9 |
| Friendbot and vendor signatures | Partial | Both exist; Friendbot unrelatedness remains undefined in F3 |
| First same-100 checkpoint | Verified | `eval/qa/README.md`; artifact and ledger hash match |
| 500-case denominator | Verified | `eval/EVALS.md`; `run-evals`; 500 battery files |
| Workers AI finding route | Verified | `workers-ai-provider/` appears in the skill and frontmatter example |
| Retired Solo route | Verified | `improvements/README.md` now routes work to `.agents/TODO.md` |
| PR #99 deployment uncertainty | Verified | `3c7f0e5` is after the recorded 2026-08-28 deployment |
| Fixed-upstream candidates | Verified | `sd-001`, `sd-036`, and `sk-020` have `fixed-upstream` status |

The 17 tabled groups have evidence. F2 and F3 show required auditor findings that the synthesis omitted.

## Completion checks

### Owner decisions

The documents do not pre-decide an owner choice. They preserve four explicit decisions.

- Deploy or hold remains open.
- The Raven product surface remains open.
- The paired denominator, candidate-only rule, and margin remain open.
- Protocol-history PH2 or PH3 remains open.

The safe defaults do not select an option. They prevent action while evidence or authority is absent.

### Paid and production authority

No text authorizes a paid run. All paid stages require a new cap and a separate authorization.

No text authorizes a deployment or production edit. F1 covers the separately authorized production read.

### Solo routes

No live Solo work route remains. `improvements/README.md` points own-repository work to `.agents/TODO.md`.

The 301 `solo://` battery references are dated historical provenance. `AGENTS.md` explicitly preserves that evidence.

Other remaining Solo text explains retirement or cites historical records. It does not route current work.

### Paths and records

All normal repository paths in the changed documents resolve. The two closed snapshots also resolve in this clone.

The closeout correctly warns that snapshot commits are outside branch ancestry. It provides exact pull-reference fetch commands.

The local-only capability and recovery artifacts are absent. The documents correctly avoid treating them as durable baselines.

The following checked values match repository evidence:

| Value | Verified result |
| --- | --- |
| `origin/main` and `HEAD` | `981578552a40ccf7cb847ef80a7f96c9edb8802f` |
| Improvements status counts | 60 reported, 3 proposed, 3 declined, 3 fixed; 69 total |
| QA battery, sample, reserved IDs | 500, 30, 500 |
| Routing compiled cases | 338 legacy, 122 extended |
| QA lint | 0 errors, 61 warnings |
| QA tests | 99 files, 1,579 tests |
| Same-100 eligible count | 99 after one T4 exclusion |
| Judge-stability count | 57 of 100 below 0.75 |
| Paired terminal rate | 99.356% |
| Candidate-only blocking rate | 64.079% |
| New pair estimate | about `$82`; stored range `$64` to `$92` |
| Same-100 artifact hash | `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387` |
| Stellar Light inventory hash | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| `x-routing` hash | `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` |
| Vendor scorer hash | `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` |
| PR #99 merge commit | `3c7f0e5`, dated 2026-08-30 |
| Recorded Worker Version ID | `6282fe2a-54d8-471e-9f0a-0a2565110af1` |

The Worker Version ID remains an operator record. This review did not verify it against production.

### Reviewability

The revised documents separate current work, owner decisions, evidence triggers, and closed experiments.

The documents use durable paths for active work. They label local artifacts and closed pull references clearly.

F2 and F3 still force a reviewer to reconstruct definitions from separate records. Those gaps need direct repairs.

The synthesis is otherwise concise and traceable. Its validation claim needs the F4 coverage correction.

## Validation review

I repeated these non-writing checks:

| Command | Independent result |
| --- | --- |
| `git diff --check origin/main` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass; 99 files and 1,579 tests |
| `npm run eval:selftest` | Pass |
| `npm run eval:qa:lint -- --stale` | Pass; 0 errors and 61 warnings |
| `npm run eval:qa:register -- --check` | Pass; current |
| `npm run eval:qa:paired:validate` | Pass; all deterministic gates passed |
| `npm run improvements:lint` | Pass; 69 findings |
| `npm run secrets:scan -- --tree` | Pass for tracked files only |

I did not repeat commands that generate or assemble files. The user allowed only this report write.

| Recorded command | Evidence review |
| --- | --- |
| `npm run eval:qa:compile` | Generated counts match 500 cases, 30 samples, and 500 reserved IDs |
| `npm run eval:compile` | Generated counts match 338 legacy and 122 extended cases |
| `npm run eval:routing -- --gate` | The recorded pass matches the current routing record |
| `npm run build` | The ledger records a Wrangler dry-run pass |

The branch does not touch `src/executor` or `src/demo`. Therefore, this diff does not require `npm run test:smoke`.

The validation record is internally consistent, except for the untracked secret-scan coverage in F4.

## Residual risks

- The runtime does not expose the served model or effort.
- The production revision remains unverified.
- The three upstream issue states can change after their dated reads.
- GitHub can remove the closed pull-reference retention path.
- The local-only result artifacts can disappear.
- This review did not rerun writing validation commands.
- The new files need the staged secret scan after repairs.

These risks do not authorize a fetch, a paid call, a production change, or an upstream message.
