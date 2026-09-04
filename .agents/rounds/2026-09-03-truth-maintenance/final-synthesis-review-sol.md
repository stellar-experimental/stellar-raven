# Final synthesis review — Codex Sol

Date: 2026-09-04.

Reviewer: Codex Sol at `high` effort.

Author: Claude Fable 5.1.

Fixed point: `main` at `2ee801f80d626e68f010392a7d541aab7997349d`.

Reviewed snapshot: `b5dca1c3c4ac4f731fdef7bef027fb6d1b81fef4`.

## Verdict

`CHANGES-REQUIRED`

Revision 2 does not earn `LAUNCH-OK`.

The design is incomplete and does not fully match the landed supervisor.

Three high-severity launch findings remain open.

Three medium-severity documentation findings also remain open.

I made no network request, paid call, deployment, filing, or golden change.

## Scope

I reviewed these files closely:

- `.agents/NEXT.md`
- `.agents/TODO.md`
- `.agents/rounds/2026-09-03-truth-maintenance.md`
- `.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md`

I also reviewed the linked local evidence and the paired supervisor contract.

The current paired contract includes commit `a5ac32f` and its I1 closure at `5603d6d`.

## Spec findings

### P1 — High — The authorization does not bind the exact paid commands

Evidence:

- The authorization block appears at `revised-impact-measurement-fable.md:425-480`.
- The block names method classes and caps.
- It does not contain any exact paid command array.
- It does not include the final manifest SHA-256.
- The uncommitted manifest holds the collection, judge, and comparison arrays.
- The supervisor validates those arrays.
- The supervisor cannot validate the owner signature or its authorized bytes.
- The block omits the exact P6 wrapper command and wrapper hash.
- The block omits both exact flip commands and their source direction.
- The block does not specify the flip commands' cases reference.
- The block does not specify their binary or environment identity.
- The block does not decide how a valid zero-flip result uses `--allow-empty`.
- `eval/qa/re-judge.mjs:572-575` rejects an empty flip set without that flag.
- The earlier Sol review required every command, cumulative cap, and final hash.

Impact:

A general signature can exist without approval for the exact paid command bytes.

This gap violates the strict authorization requirement.

The latest general round approval cannot fill this gap.

Required change:

- Freeze one canonical manifest before authorization.
- Put its SHA-256 in the signed block.
- Put every paid command array in the signed evidence.
- Include the P6 wrapper command and wrapper SHA-256.
- Include its identity flags and seven internal `$0.50` caps.
- Include both flip commands and their source order.
- Include each flip command's cases reference and judge flags.
- Define the valid zero-flip behavior.
- State that the owner signature covers those exact bytes.

### P2 — High — The free capacity gate is not deterministic

Evidence:

- Revision 2 requires the check at lines 175-176 and 214-216.
- It gives no exact command.
- It gives no request set, endpoint set, or concurrency schedule.
- It gives no test duration.
- It gives no latency, failure-rate, or completion threshold.
- It gives no exact failure action.
- The supervisor checks only three capacity fields.
- It requires `accepted: true`.
- It requires `answeringAgents: 2`.
- It requires a nonempty `evidence` string.
- `eval/qa/paired-collection-supervisor.mjs:284-288` implements only those checks.

Impact:

Two operators can reach different decisions from the same system state.

The capacity result affects the shared concurrent-load estimand.

Required change:

- Define the exact free command and input set.
- Define the concurrency schedule and test duration.
- Define every measured field.
- Define every pass threshold.
- Define the stop result for each failed threshold.
- Bind the command hash and result into the signed manifest.

### P3 — High — The supervisor does not enforce the denominator contract

Evidence:

- Revision 2 lines 132-134 claim four frozen corpus identities.
- The manifest list includes only three corpus hashes at lines 170-172.
- It includes the cases-file hash.
- It includes the selected-content hash.
- It includes the selected-ID hash.
- It omits the ordered 500-ID hash.
- The supervisor accepts any nonempty unique selected ID list.
- It does not require exactly 200 selected IDs.
- It does not require exactly 500 unique active corpus IDs.
- `eval/qa/paired-collection-supervisor.mjs:252-265` implements the selected-list checks.
- The stop rule states both counts at lines 343-344.
- The supervisor cannot enforce those stated counts.

Impact:

The machine gate can accept a different estimand and denominator.

The design therefore does not match the stated machine-owned launch contract.

Required change:

- Add `selected.count: 200` and enforce it.
- Add an active corpus count and require `500`.
- Add the ordered active corpus ID hash.
- Recompute every field from both runner worktrees.
- Reject the manifest when any corpus field differs.

## Standards findings

### S1 — Medium — The final supervisor and branch claims are stale

Evidence:

- Revision 2 lines 11-13 call `e0df186` the final supervisor contract.
- At `e0df186`, `meta.inputSnapshot.casesSha256` was optional.
- Commit `a5ac32f` later made that content identity mandatory.
- Commit `5603d6d` records the independent I1 closure.
- The closure says I1 was the final open supervisor finding.
- The repair table at ledger lines 430-447 omits both commits.
- `NEXT.md:16-17` says `codex/tm-final-synthesis` carries the whole round.
- That branch points to `cbdfc5be38f34821789a656255ead4dbb5bbb636`.
- Its parent is `e0df186ebfbaa4063f97b7845e76e288050df474`.
- It does not contain `a5ac32f` or `5603d6d`.
- The reviewed branch contains both commits.
- All four reviewed document blobs match `cbdfc5b`.

Impact:

The launch document points to a contract with the former I1 weakness.

The whole-round branch claim is also false.

Required change:

- Point the design to the actual final supervisor revision.
- Add `a5ac32f` and `5603d6d` to the repair record.
- Correct the whole-round branch claim or advance that branch.
- Recompute every provisional launch hash after that correction.

### S2 — Medium — The handoff marks an unfinished round as completed

Evidence:

- `NEXT.md:264-270` lists the truth-maintenance round under completed blocks.
- `NEXT.md:47-56` lists combined validation and three reviews as pending.
- Those items include revision 2 review and the capacity check.
- They also include the independent closeout review.
- The ledger line 554 marks the final closeout review as not done.
- The ledger still lists production smoke checks and deployment as open.

Impact:

The completed label conflicts with the recorded work state.

Required change:

- Rename the block as completed repair work.
- Keep the full round open until every closeout gate passes.

### S3 — Medium — The production state lacks a last-read label

Evidence:

- `NEXT.md:12-15` states the active production version as a current fact.
- The linked local record supports that deployment on 2026-09-02.
- No later local deployment record exists.
- Network access was forbidden for this review.
- I therefore could not verify the current live Worker.
- The issue states at `NEXT.md:37-38` use a dated last-read label.
- The Scout 1.9.30 statement also uses a dated observation.

Impact:

The production statement has stronger certainty than its local evidence supports.

Required change:

- Label the production version as the last recorded deployment state.
- Include the 2026-09-02 observation date.

## Causal and authorization boundaries

The stopped candidate remains a diagnostic artifact.

The documents never use it as paired causal evidence.

They never state a valid two-week causal result.

They exclude all rows collected before a guard stop.

They state that no baseline artifact exists.

They prohibit the stopped artifact from entering the revised comparison.

The old `$882.50` plan is spent for P6 and the stopped candidate.

Its unused amount does not transfer.

Revision 2 remains unapproved.

The general round approval does not authorize revision 2.

The filing queue still requires explicit owner filing authority.

No finding was filed.

Deployment still requires separate owner authority.

## Golden blocker verification

All 14 unchanged human golden blockers remain recorded.

The blocker classes B1 through B11 remain in the handoff.

The five compliance cases under B6 remain owner-blocked.

The B7 and B8 rejudge decisions remain owner-blocked.

`q-soroban-x402-auth-entry-signing` remains disputed and owner-blocked.

`q-tool-cctp-stellar-integration` remains disputed and owner-blocked.

The documents prohibit golden changes from judge scores alone.

The one reviewed LOBSTR correction does not remove the other blockers.

## Material count verification

The stopped artifact has 500 rows.

Its score counts are 199 correct, 230 partial, and 71 wrong.

Its strict share is 39.8%.

Its half-credit share is 62.8%.

Its core-answer-correct share is 92.6%.

Its total cost is `$190.1686672`.

Its answering cost is `$130.1715028`.

Its judge cost is `$59.9971644`.

It records 500 answering calls and 790 judge calls.

Every recorded call has a reported cost.

The executor fault affects 380 rows.

The top-level transcripts contain 493 fault occurrences.

The fault affects 220 of 239 Docs rows.

The mean answering attempt duration is 44.231 seconds.

The median duration is 35.497 seconds.

The p90 duration is 84.892 seconds.

The mean row cost is `$0.3803373`.

The p90 row cost is `$0.609391`.

The maximum row cost is `$1.200939`.

The artifact started at `2026-09-03T18:29:30.879Z`.

It finished at `2026-09-04T05:40:51.010Z`.

The artifact saw Scout 1.9.23 and Scout 1.9.30.

The ledger uses zero-based rows 173 and 450 for those observations.

They correspond to one-based rows 174 and 451.

The timestamps are `22:35:38.445Z` and `04:34:02.708Z`.

## Hash verification

| Item | SHA-256 |
| --- | --- |
| Stopped artifact | `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7` |
| Stability register | `06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480` |
| `eval/qa/cases.json` | `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396` |
| Corpus content | `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e` |
| Ordered corpus IDs | `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` |
| Ordered 200 IDs | `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da` |
| Selected 200 content | `b8512352599ed9df760113cb86db8337ae3136a1cec4aea8461ef08d61e55ee1` |
| Ordered 150 IDs | `cbc850c65ad18709ae5a5d94c6ae009f041b78a6a11b0f51e5888959ca7001cc` |
| Selected 150 content | `f0ffb53fb3a3312197310a9b157e7e6d6cbd66420d37596e8893fc6c763dcc0c` |
| Affected-case IDs | `0aca348f...` |
| `catalog/manifest.json` | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| Remote identity probe | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` |
| Paired supervisor | `23407c4d8f120ae432ad715f6b0b5edc225c5e622a41bc67be246bbaed3e36bc` |
| Paired control | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` |
| QA runner | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` |
| Paired verdict | `5a473a57708ddb17791e264b7da68e96b5b49b0102141d3a687b15510e8bd960` |

The affected-case stratum contains 496 of 500 cases.

The source report stores only its shortened hash form.

## Deterministic sample verification

The 200-case sample has 96 Docs cases.

It has 57 Scout cases.

It has 25 Lumenloop cases.

It has 13 skill cases.

It has nine cases with no service.

It has 84 stable cases.

It has 60 scheduled cases.

It has 56 live cases.

It has 16 trap cases.

These counts match revision 2.

The current corpus has 500 unique active cases.

## Improvements verification

`improvements/` contains 70 active findings.

Their states are 57 `reported-upstream`, 10 `verified`, and 3 `declined-upstream`.

The ten verified IDs are:

- `ll-030`
- `sd-046`
- `sd-049`
- `sd-050`
- `sd-051`
- `sd-052`
- `sk-021`
- `sk-022`
- `sk-023`
- `sk-024`

All ten filing dry runs passed.

The dry runs made no network request because each command stopped before `gh` execution.

The records remain unfiled.

## Other verified claims

`TERMS_EFFECTIVE_DATE` is `August 5, 2026`.

The accepted Scout inventory remains version 1.9.1.

The accepted manifest and Scout inventory hashes match the ledger.

Both protocol-history v2 contracts are `source-expired`.

The protocol-history diagnostic returns no scored question.

Every short commit named in the repair table resolves to a commit object.

The current branch contains 61 commits after `main`.

The four target files have identical blobs on `b5dca1c` and `cbdfc5b`.

The local deployment record supports Worker version `f62b64fa-1fb7-4c25-970d-7f98c83ab302`.

It links that version to source commit `0c71b99` on 2026-09-02.

I found no later local deployment record.

The external issue states retain their 2026-09-04 last-read label.

The Scout 1.9.30 state retains its 2026-09-04 observation label.

## Commands and results

| Command | Result |
| --- | --- |
| `git diff --check main...HEAD` | Pass |
| `git show-ref --heads` | Confirmed the branch references |
| `git log --format='%H %P %s'` | Confirmed the relevant ancestry |
| `git diff --exit-code b5dca1c cbdfc5b -- <four target files>` | Pass |
| `shasum -a 256 <reviewed artifacts and contract files>` | All listed hashes matched |
| `npm run eval:qa:paired:validate` | Pass, all six gates |
| `npm run eval:qa:lint -- --stale` | Pass, 0 errors and 62 warnings |
| `npm run eval:protocol-history` | Pass, both v2 contracts are `source-expired` |
| `npm run improvements:lint` | Pass |
| `npm run improvements:file -- --file <each verified record> --dry-run` | Pass for all ten records |
| `npx vitest run <five paired-contract test files>` | Pass, 5 files and 164 tests |

The five test files were:

- `test/qa-paired-collection-control.test.mjs`
- `test/qa-paired-collection-supervisor.test.mjs`
- `test/qa-paired-verdict.test.mjs`
- `test/qa-remote-identity-guard.test.mjs`
- `test/qa-remote-identity-probe.test.mjs`

The current worktree has no `node_modules` directory.

I ran the protocol and test commands in an isolated archive.

That archive used the available dependency tree from `/private/tmp/stellar-raven-tm-runner/node_modules`.

I initialized a temporary Git repository because the tests require a valid `HEAD`.

The final five-file test run passed 164 tests.

## Repository report and commit failure

The requested repository path was read-only in the active sandbox.

The blocked path was `.agents/rounds/2026-09-03-truth-maintenance/final-synthesis-review-sol.md`.

Both direct and repository-local `apply_patch` attempts failed before any write.

The sandbox reported that the target was outside the writable project area.

A direct permission check reported `target-read-only`.

The requested repository report therefore does not exist.

The repository worktree remained clean.

No report file existed for `git add` or `git commit`.

The Git administrative directory also resolves outside the writable workspace.

Therefore, the requested review commit did not occur.

This temporary report records the complete review without changing any repository file.

## Final standing

Standards has three medium-severity findings.

Spec has three high-severity findings.

The worst severity is high.

Revision 2 does not earn `LAUNCH-OK`.

The required verdict is `CHANGES-REQUIRED`.

