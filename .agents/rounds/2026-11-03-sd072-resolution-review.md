# sd-072 independent resolution review

Verdict: **RESOLVE**

The Lab API Explorer Horizon card no longer says "Horizon is considered deprecated." The agreed sentence is on the live page and in current `main`. No residual of that phrase remains in `docs/`. Retire the finding after the gates at the end. This review did not edit tracked files, commit, comment, or start agents.

## Live trigger

Observation time is the origin `Date` header on each response.

| Request | Result |
|---|---|
| GET https://developers.stellar.org/docs/tools/lab/api-explorer | HTTP 200 at 2026-11-03T18:46:25Z. Final URL is the same address. |
| GET https://developers.stellar.org/docs/tools/lab/api-explorer.md | HTTP 200 at 2026-11-03T18:46:26Z. `content-type: text/markdown`. Final URL is the same address. |

Both bodies contain zero occurrences of "considered deprecated".

The rendered Horizon Endpoints card text, in the HTML card and in the markdown export, is:

> Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs.

That is the sentence the finding recommends. The HTML also repeats it in the page script and in the sidebar description of the child page. The sidebar description adds the existing Horizon Endpoints sentences about continued compatibility updates. Those sentences were already on that child page. They are not the old card label.

Served page metadata: `x-served-version` and `deploymentId` are `dpl_36EDyZCDfRuoUD9af5CH4M1bqY2h`. JSON-LD `dateModified` is `2026-11-03T16:49:20.421Z`. The HTML `age` was 7012 seconds, so that HTML object dates from about 16:49Z. The markdown `last-modified` is `2026-11-03T18:45:26Z`. Both copies show the new sentence.

## Upstream state

| Ref | State |
|---|---|
| https://github.com/stellar/stellar-docs/issues/3007 | Closed at 2026-11-03T16:47:59Z. `state_reason` is `completed`. Title matches the finding. Author is `kalepail`. |
| https://github.com/stellar/stellar-docs/pull/3020 | Merged at 2026-11-03T16:47:56Z by `ElliotFriend`. Merge commit `51c89c4ff5cc057ffb391f66915929dc2377ccc6`. Base `main`. Head `docs-agent/3007-horizon-lifecycle-label` at `ddd311534cd534c8a5a827518d361be8afb11c57`. Body says `Closes #3007`. |
| https://github.com/stellar/stellar-docs/commit/51c89c4ff5cc057ffb391f66915929dc2377ccc6 | Current `main`. Compare `51c89c4...main` returns `status: identical`, `ahead_by: 0`, `behind_by: 0`. A depth-1 sparse clone of `docs/` has the same HEAD. |

The PR changes one line in `docs/tools/lab/api-explorer/index.mdx`. It replaces `Horizon is considered deprecated.` with the agreed sentence. `ElliotFriend` approved the PR at 2026-11-03T16:47:34Z. The review body is empty. The same account is the closer on the issue timeline at 2026-11-03T16:48:00Z.

Issue comments are from `stellar-triage-bot[bot]` only:

- https://github.com/stellar/stellar-docs/issues/3007#issuecomment-6589823374 (2026-11-02T22:15:07Z) says the bot is assessing the `raven` issue.
- https://github.com/stellar/stellar-docs/issues/3007#issuecomment-6589888017 (2026-11-02T22:18:23Z) says the finding is real and names PR 3020.

The PR discussion comment is the Mintlify preview from `mintlify[bot]`: https://github.com/stellar/stellar-docs/pull/3020#issuecomment-6589830837. This review did not open the preview URL.

No Raven resolution comment is on issue 3007 or PR 3020. The drain still requires that comment before a non-dry-run resolve.

The Mintlify Deployment check on the merge commit completed with conclusion `success` at 2026-11-03T16:49:31Z. The check output title is `Deployment Succeeded`. Check URL: https://github.com/stellar/stellar-docs/runs/126063697189. The same commit's check-runs API also lists success for Socket Security: Project Report, `update-completed-sprint`, Analyze (actions), and Analyze (javascript-typescript). This review did not open those four logs. The served card text matches `docs/tools/lab/api-explorer/index.mdx` at this commit, and this commit is `main`.

Inbound handoff https://github.com/stellar-experimental/stellar-raven/issues/353 is open. Author is `ElliotFriend`. Created 2026-11-03T18:27:51Z. It has no comments. It names sd-072, issue 3007, PR 3020, and merge `51c89c4`. This review treated that text as a claim and repeated the live check. The live check agrees with the claim. This review did not close or comment on issue 353.

## Source residual

Grep of `docs/` at `51c89c4ff5cc057ffb391f66915929dc2377ccc6` (903 files, 900 `.mdx` files): the phrase `considered deprecated` has zero matches.

The agreed Horizon sentence is present in:

- `docs/tools/lab/api-explorer/index.mdx` line 13 (the fixed card)
- `docs/tools/lab/api-explorer/horizon-endpoint.mdx` lines 3 and 8
- `docs/data/apis/index.mdx` line 30
- `docs/learn/fundamentals/stellar-stack.mdx` line 37

Shorter "nearing end-of-life" wording also appears in `docs/index.mdx` line 23, `docs/data/index.mdx` line 24, and `docs/learn/migrate/evm/smart-contract-deployment.mdx` line 59. None of those lines say Horizon is already deprecated.

Other `is deprecated` lines in `docs/` are about `SetTrustlineFlags` versus an older operation, inflation, and `stellar contract bindings typescript`. They are not this Horizon card defect. No successor finding is required.

The active finding still has status `reported-upstream`. `scripts/improvements-resolve.mjs` refuses any status other than `fixed-upstream`. A resolver run does nothing until that status change lands.

## What a resolver run leaves dangling

`npm run improvements:resolve` deletes the active file, removes a per-finding intake override when one exists, appends `improvements/resolved.json`, and regenerates `improvements/INDEX.md`. It does not edit golden files, the consistency register, research, or `eval/qa/cases.json`.

`rg -n "sd-072" .` with `node_modules` excluded hits only the paths below.

### Golden rootCause

`eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json` still encodes the defect as current:

- `golden.notes` says the Lab API Explorer page says `Horizon is considered deprecated.` It says an attributed quote of that page is allowed while sd-072 is active, and it says to remove the caution when sd-072 is fixed and the card matches the overview.
- `truth.sources` for `https://developers.stellar.org/docs/tools/lab/api-explorer` still notes the old card text, `observedAt` 2026-11-02.
- `truth.verified.evidence` says the finding status is `reported-upstream` and `active`.
- `truth.verified.rootCause` includes `improvements/stellar-docs/sd-072-lab-api-explorer-horizon-deprecated-label.md`.

The 2026-11-02 corroboration claim can stay as a dated observation. The current-state caution and the active rootCause path cannot stay after retirement. The resolver will not change them.

`eval/qa/cases.json` repeats those four spots (notes, verified evidence, rootCause). `eval/qa/compile-qa.mjs` emits `cases.json`. The resolver does not run that script. A corpus edit still needs a compile or the generated file keeps the old caution.

### Register

`eval/qa/consistency-register.json` states the split label as current in three cluster notes:

- cluster-018, line 560
- cluster-061, line 1578
- cluster-063, line 1618

Each note says the Lab API Explorer page says `Horizon is considered deprecated.` and points at sd-072. The resolver will not edit the register.

### Research

`research/audits/2026-11-03-qa-followup/case-dispositions.json` records sd-072 four times, all as the active file and as `reported-upstream`:

- inventory entry at lines 713 and 716
- a second inventory entry at lines 2588 and 2591
- disposition map at lines 3593–3595 (`target` is the active path; action says to use the existing record)
- locator index at line 10379

That file is a dated audit. The resolver will not rewrite it. After deletion those paths do not exist. Leave the audit as a snapshot. Do not read its `reported-upstream` status as the status after retirement.

### Intake

`improvements/intake.json` has no `sd-072` override. The resolver's intake edit is a no-op. The stellar-docs service repo entry stays. Nothing in intake dangles.

### Probes

The finding has no `probe` frontmatter. No probe file mentions sd-072. The resolver removes nothing for probes.

### Removed by the resolver

These two active-collection hits are the records the resolver is built to retire:

- `improvements/stellar-docs/sd-072-lab-api-explorer-horizon-deprecated-label.md`
- the sd-072 row in `improvements/INDEX.md`

## Gates before a non-dry-run resolve

1. Add the dated live recheck to the finding and set status to `fixed-upstream`. The resolver exits while the status is `reported-upstream`.
2. Reconcile the golden caution, `truth.verified` active pointer, `truth.verified.rootCause`, and the three register notes through the golden-truth path. Then compile `eval/qa/cases.json`. Pass `--references-reviewed` only after that. The dated research audit can remain a snapshot.
3. Post the resolver's resolution comment on https://github.com/stellar/stellar-docs/issues/3007. Include the live result and the commit-pinned source URL. PR 3020 is the resolving ref. Pass `--upstream-commented` only after the comment is on the issue. `--upstream-comment-na` does not apply.
4. Close Raven issue 353 only after the finding status and the live result are recorded. This review did not do that.

## URLs read

- https://developers.stellar.org/docs/tools/lab/api-explorer
- https://developers.stellar.org/docs/tools/lab/api-explorer.md
- https://github.com/stellar/stellar-docs/issues/3007
- https://github.com/stellar/stellar-docs/issues/3007#issuecomment-6589823374
- https://github.com/stellar/stellar-docs/issues/3007#issuecomment-6589888017
- https://github.com/stellar/stellar-docs/pull/3020
- https://github.com/stellar/stellar-docs/pull/3020#issuecomment-6589830837
- https://github.com/stellar/stellar-docs/commit/51c89c4ff5cc057ffb391f66915929dc2377ccc6
- https://github.com/stellar/stellar-docs/blob/51c89c4ff5cc057ffb391f66915929dc2377ccc6/docs/tools/lab/api-explorer/index.mdx
- https://github.com/stellar/stellar-docs/runs/126063697189
- https://github.com/stellar-experimental/stellar-raven/issues/353

GitHub API reads that have no separate page: issue 3007 comments, issue 3007 timeline, PR 3020 reviews and files, commit status, commit check-runs, and compare `51c89c4...main`. Local reads: the finding file, `scripts/improvements-resolve.mjs`, the golden case, `eval/qa/cases.json`, `eval/qa/consistency-register.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, and `improvements/intake.json`. Source grep used a depth-1 clone of `stellar/stellar-docs` at `51c89c4` under `/tmp/stellar-docs-sd072`.
