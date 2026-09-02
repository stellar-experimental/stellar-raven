# Post-merge documentation review: agent queue closeout

Reviewer: Fable (Claude Code), independent of the author.
Date: 2026-09-02
Worktree: `/private/tmp/stellar-raven-agent-queue-integration`, branch
`codex/post-merge-queue-handoff` at `5774a1e` (equal to `origin/main`).
Scope: the uncommitted changes to `.agents/NEXT.md` and
`.agents/rounds/2026-09-02-agent-queue-closeout.md` against `origin/main`. No other file is
modified in the worktree. Mode: audit only. Neither source file was edited. Every external check
was read-only.

## Verdict

**FAIL on one Low finding.** Every factual claim in both files verified against GitHub,
Cloudflare, the repository, and the live service. The authorization boundaries are correct, the
queue sequence is correct, and no unconditional machine-ready block remains. One reviewability
gap remains actionable: the closeout ledger lists six pre-squash commit hashes without stating
where they stay reachable. Fix that one line and this review is a PASS.

## The diff

`NEXT.md` changes four places: the header line, two "State at handoff" bullets, the deploy
block's opening sentences, and the "Suggested sequence" first line. Every change replaces
pre-merge language ("the current task first pushes the branch") with the merged fact
("PR #117 merged as `5774a1e`"). The ledger changes three lines: the post-verification sentence,
one new ledger entry, and the outcome line. No pre-merge tense survives in either file. A search
for "will", "follow this commit", "current task", and "pushes the branch" returns nothing.

## PR #117 and commit `5774a1e`

| Claim | Verified |
| --- | --- |
| PR #117 merged to `main` | `gh pr view 117`: state MERGED, merged 2026-09-02T21:10:59Z, merge commit `5774a1e3b1f8…`. |
| Squash merge | `5774a1e` has one parent, `3428631` (PR #116). The message carries the eight branch subjects. |
| Passed CI, CodeQL, secrets scanning before merge | Check rollup on the head `c11b185`: `secrets` SUCCESS 21:09:09Z, `Analyze (actions)` SUCCESS 21:09:42Z, `test` SUCCESS 21:10:38Z, `CodeQL` SUCCESS 21:09:35Z. All before the merge time. Post-merge `main` runs for CI and CodeQL also succeeded. |
| Independent closure review before merge | `review-grok-final-closure.md` and `ci-epipe-review-opus-final-closure.md` exist under the round directory and record passes. |
| CI EPIPE history: first attempt failed three cases, second failed one different case | Run 33678792152 on `8088467` has two attempts. Attempt 1 logged three FAIL lines and attempt 2 logged one, all in `test/qa-harness-preconditions.test.mjs`. The fix commit `c11b185` then passed. |
| Six integrated block commits | `ce58e6b`, `52f6ae4`, `d6efe5f`, `02af87e`, `1421ffe`, `c4a064b` are all on the PR branch, in the ledger's order, followed by `8088467` (docs closeout) and `c11b185` (EPIPE fix). |
| No open pull request | `gh pr list --state open` returns none. |

## Production state

| Claim | Verified |
| --- | --- |
| Production runs Worker Version `5ea8c1fe-e052-494d-b36b-ee8f5486a662` | `wrangler deployments list`: the newest deployment was created 2026-09-01T22:27:28Z with that version at 100 percent. No later deployment exists. |
| Source commit `ea01f0d03c2bba88f5846922465c6a03af57e41e` | The 2026-09-01 release record (`8c0f006`) ties that version to `ea01f0d`. Nothing deployed after it. |
| Production does not serve the two runtime changes | Follows from the above: both landed in `5774a1e`, after the last deployment. |
| Service is up | `GET /health/skills` returns `ok: true`, 41 checked. `GET /` returns 200. Unauthenticated MCP initialize returns 401, as designed. |

## Authorization boundaries

- The deploy block is owner-blocked. It says "Deployment requires separate authorization" and
  conditions `npm run deploy` on that authorization. The ledger scope says deployment is out of
  scope. Both agree.
- The ledger records that the owner authorized push, pull-request creation, and merge for the
  closeout task, and that those stages completed. That matches the merged state and does not
  extend to deployment.
- "No current item has authorization for evaluation ladder stages 3 or 4" stands. Every paid item
  under "Owner decisions" carries "Safe default: no spend".
- `NEXT.md:6-7` states that no unconditional agent-actionable block remains. I read every block:
  the two owner-blocked blocks require an owner decision or authorization first; the five
  conditional programs are trigger-only or monitor-only; the four owner decisions default to no
  action. The ledger at line 55 makes the same statement with the phrase "machine-ready block".
  The claim holds.

## Queue sequencing

The "Suggested sequence" is: deploy under separate authorization and verify production, then
obtain the capability-boundary and protocol-history decisions, keeping each paid or production
action behind its own authorization. That ordering matches the state: the only completed-but-
unshipped work is the deployment, and both decisions have their free evidence in place. The
deploy verification list names `/playground`, `/health/skills`, an authorized initialize, a free
`search`, and one digest call returning an A/V row with `date: null`. That last check is the
right probe for the `stellar-ecosystem-digest.ts` change.

## State-at-handoff facts

| Claim | Verified |
| --- | --- |
| Both paid runners use fail-closed CLI syntax; equals forms, unknown flags, stray arguments, duplicate `--ids` fail before any paid call | `run-qa.mjs:217` and `run-agent-discovery.mjs:88` both call `assertFailClosedCliSyntax` from `eval/lib/harness-guards.mjs` with explicit value and boolean flag lists; the helper throws on equals forms and missing values. `run-qa.mjs:262-268` rejects `--ids=` and duplicates. |
| QA evidence pack is `p6`; detected A/V rows omit `created_at` and derived `date` | `eval/qa/evidence-pack.mjs:3` `PACK_VERSION = "p6"`; lines 390-392 drop `created_at` and any `date` whose `dateField` is `created_at`. |
| `eval/gates.json` re-baselined for manifest `4cd28f4b…`: legacy 213/279/312, holdout 10/22/26, 11 forbidden | `gates.json` reads exactly that. Extended 90/110/116 matches my own measurement in the A/V round. |
| Protocol-history 4/8 and 2/4, blind 3/11 and 6/9; union of 78 QA cases | Matches the diagnostic runs in the A/V round and `2026-09-02-protocol-history-free-evidence.md:164`. |
| 66 active findings: 60 reported-upstream, 3 proposed, 3 declined-upstream | Frontmatter count over `improvements/*/*.md`: 60, 3, 3. |
| stellar-docs#2805, stellar-docs PR #2806, lumenloop-backend#35 remain open | All three OPEN via `gh`. |
| Corpus lint 0 errors, 62 warnings | `npm run eval:qa:lint -- --stale` in the worktree: 0 errors, 62 warnings. |
| `TERMS_EFFECTIVE_DATE` is `August 5, 2026` | `src/site.ts:998`. |

## Historical accuracy

- "Earlier" completed blocks: #116 "Guard paid agent-discovery runs", #115 "Refresh seven stale
  golden truth cases", #112 to #114 (release closeout: "Clarify remaining work after adversarial
  audit", "pin answering-agent environment before spend", "Complete free improvements maintenance
  closeout"), #106 "Close the remaining golden metadata provenance". All merged with those titles.
- Every ledger path named in `NEXT.md` and in the closeout ledger resolves: the six block ledgers,
  the closeout review directory files, the Raven free-evidence file, and the Grok label review.
- Ledger line 34: the `c4a064b` evidence-pack commit landed after the Fable audit at `1421ffe`.
  The branch order confirms it.

## Reviewability

- Both files use present-state statements. The ledger keeps its dated entries as history and
  moves the merge fact to the entry list and the outcome, which is the right split.
- The `NEXT.md` header, deploy block, and sequence no longer describe the closeout task as
  pending. The file can be read cold.

## Findings

### L1 — Low. The integrated-commit hashes are reachable only through the pull-request ref, and the ledger does not say so.

- Location: `.agents/rounds/2026-09-02-agent-queue-closeout.md:13-24` ("Integrated commits").
- Evidence: PR #117 was squash-merged, so `ce58e6b` through `c4a064b` are not ancestors of
  `main`. They remain reachable through `refs/pull/117/head` (`c11b185`). The ledger records
  the squash at line 158 but never names the ref. The 2026-09-01 release ledger set the
  precedent: "Commit `9074093` remains reachable through `refs/pull/114/head`." A reader on a
  fresh clone who runs `git show ce58e6b` gets "bad object" and has no pointer.
- Smallest repair: one sentence after the table: "PR #117 was squash-merged; these commits and
  the later `8088467` and `c11b185` remain reachable through `refs/pull/117/head`."

## Notes, not findings

- The EPIPE repair section does not name its commit (`c11b185`). The four linked Opus review
  files do, so the hash is one click away. If L1 is repaired with the sentence above, this is
  covered.
- `NEXT.md:6` says "agent-actionable block" and the ledger line 55 says "machine-ready block".
  Same claim, two phrases. Harmless.
