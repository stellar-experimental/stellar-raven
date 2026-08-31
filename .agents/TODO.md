# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, and what "done" means.

## Improvements backlog

### Remove a blockquote marker from generated improvement titles

`oneLineTitle` preserves a leading `>` from the first Markdown paragraph. The generated
`improvements/INDEX.md` title for `sd-036` therefore starts with `>`. This is a presentation defect,
not a finding-state defect.

Add a regression test to `test/improvements-resolve.test.ts`, fix the shared title helper, and
regenerate the index. Do not replace `scripts/improvements-resolve.mjs`'s global GitHub-reference
matcher with the non-global `GITHUB_EVIDENCE_REF_RE`. A later refactor needs a shared extraction
helper if it removes that private matcher.

Done when: generated titles remove a leading blockquote marker, the resolver tests pass, and the
index comes only from `npm run improvements:index`.

### Watch Stellar-Light/stellarlight#1031 for the maintainer close

`sls-074` was retired on 2026-08-28 after a live verification comment
(https://github.com/Stellar-Light/stellarlight/issues/1031#issuecomment-5455030587). The issue was
still open at retirement. Untouched open issues stay quiet; do not post reminders.

Done when: the next improvements round records the issue state. No action if it is closed.

## Goldens

### Replace expired temporary evidence in golden truth metadata

Golden-truth session 3 (2026-08-29, `.agents/rounds/2026-08-29-golden-truth-session-3.md`)
repaired every temporary-path reference on the 224 cases it touched. Forty-seven untouched files
still cite a temporary path: most cite the deleted Fable report `conversions-copy-review.md`,
whose full report is not recoverable, and a few cite the session-2 Grok reviews under
`/tmp/raven-qadeep/gt2/`, whose finding summaries live in `program-log.md`.

Do not replace these paths with an unreviewed bulk edit. Use the session-3 rule: a Fable-report
line is replaced only when every keyFact of the case has been re-verified live in the same edit;
a session-2 review line migrates to the `program-log.md` pointer during the next verified touch.

Done when: no active corpus evidence names a temporary path, every replacement is re-walkable from
the repository or a live primary source, the consistency register is reconciled, and all
golden-truth gates pass.

### Recheck two dated source-metadata conflicts

The 2026-08-29 temporary-artifact audit found two current conflicts that need `golden-truth` review.

- `q-tool-soroban-auth-audit-live` has `truth.asOf: 2026-08-25`, while its verification date is
  `2026-08-28`. Confirm the intended claim date before changing the metadata.
- `q-protocol-ledger-close-time` cites official wording for a 5–7-second range. Verify the current
  wording across every cited official page. Preserve the dated 199-ledger observation, but verify
  its attribution separately. Add a symmetric caution or file a Stellar Docs finding only if a
  live conflict remains after direct confirmation.

Done when: `golden-truth` records both dispositions, any changed fact keeps primary-source
provenance, the round records the affected IDs, and all golden gates pass.

### Review five round-specific golden-truth candidates

The 2026-08-30 independent same-100 review found five current candidates. It found no false
golden and authorized no corpus edit.

- `q-protocol-base-reserve-min-balance`: keep the two-reserve pool-share rule. Add the current
  Lumens and Accounts page conflict as provenance.
- `q-comp-finclusive-caas`: record the TPSP legal text and the conflicting operator marketing.
- `q-eco-stellar-wallets-list`: refresh the illustrative count and distinguish exact-type from
  keyword-search totals.
- `q-pc-protocol-27-zipper`: refresh the dated Horizon example. Keep the vote-versus-live rule.
- `q-ti-freighter-localhost-not-detected`: retain the manifest fact and the Docs conflict caution.

Done when: a later `golden-truth` pass verifies each candidate through independent source classes,
records each disposition, updates only supported facts, and passes every golden gate.

## Playground

### Raise the user-message ceiling to 8,000 characters without truncation

The current client uses a 4,000-character `maxlength`, and `parseChatBody` silently slices user
messages to that limit. ADR-0008 replaces both behaviors.

Keep the full pasted text editable. Show a live count and exact excess, disable Send while over the
limit, and use an accessible inline error associated with the composer. Reject bypassed requests
server-side with a 400 response and the same 8,000-character contract. Keep the Playground
stateless; durable history remains a deferred idea. The existing 20-message and 24,000-character
history clamps remain unchanged, so longer messages can reduce the number of replayed turns. The
384-KiB body ceiling already accommodates the new per-message limit.

Done when: client and server tests cover 7,999, 8,000, and 8,001 characters; no path truncates the
current user message; the UI retains excessive text; accessibility behavior is tested; smoke
passes; and the Playground idea describes the shipped result.

## Tests

### The `ai` tool-loop guard is never exercised

`test/demo-chat.test.ts:6` calls `vi.mock("ai")`. It spreads `importOriginal` and replaces only
`streamText`, so the unsafe-finish-reason guard added in `ai@7.0.70` never runs. Smoke stops at the auth gauntlet, and
`workers-ai-provider` maps unknown finish reasons to `"stop"`, which can hide the exact condition
the guard exists for. Affects `/demo/chat` only.

Done when: a test stubs the model rather than the module, so the real tool loop runs.

## Routing

### Monitor the rejected repository-tooling recovery experiment

The record-only closeout is in
`.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.
The rejected `repository-tooling-recovery-v2` implementation does not ship.
The v2 collection returned 9 of 12 positives and 0 of 8 premature detours.
It had 18 of 20 correct answers and 20 of 20 grounded answers.

`sls-080` is a verified active Scout finding.
The free Horizon probe still returned `25` at `2026-08-31T01:42:10.098Z`.
Its scanned ref was `82660510ecda7fd365a14d08badb9d85fa22bc32`.
Do not run a paid recovery collection until this free probe returns `28`.

The selection trigger remains three recurring misses.
The Docs-versus-repository conflict remains monitor-only until three recurrences.
The `stellar-cli` fallback candidate did not reproduce and has no active finding.
G1 is a pre-registered v3 candidate only.

Done when: a free Horizon probe returns `28`, or a new evidenced trigger authorizes a separately
reviewed recovery plan. A later Scout finding must use `sls-082`; `sls-081` is historical only.

### `search` does not surface the research lane for protocol-history questions

Eval case `q-protocol-24-whisk-incident` asks why Protocol 24 followed Protocol 23 so quickly. The
answer needs the eviction-defect cause, the counts 478 / 84 / 77 / 394, `CAP-0076`, Hot Archive,
and a 31,879,035-stroop fee-pool remediation.

`scout.searchResearch` holds all of them. `source: "cap"` returns 478, 84, 77, 394, Hot Archive,
and TTL; a broad call returns 478, 84, 77, 31879035, `CAP-0076`, and Hot Archive. The union is the
complete fact set, so this question is fully answerable today.

`search` does not point there. Measured 2026-08-25 with the case's own wording: ten hits, none of
them `scout.searchResearch`. The top hits were `stellarDocs.*` operations, and no Stellar Docs
lane carries a single required fact.

This is not a description gap. `scout.searchResearch` already advertises "incident reports" and
offers `source` values `cap` and `incident`. The lane says what it is; ranking does not find it.

Done when: a protocol-history or incident question surfaces `scout.searchResearch` in `search`,
measured on the routing eval rather than on this one case. Treat a fix that only helps this case
as unshipped.

Filed here and not in `improvements/`: the data is reachable, so there is no upstream gap. This is
our ranking.

## Staleness

### Decide the two hackathon cases' consistency-cluster membership

The consistency-register comment now states the current 499-case battery. The remaining question
concerns the two added `scout.hackathonBrief` cases.

This is not a number bump. Neither added `scout.hackathonBrief` case appears in any of the 135
clusters. The only hackathon id in the register is `q-scf-hackathons-active`, and it sits in four
clusters — `cluster-011` (SCF program mechanics), `cluster-074` and `cluster-079` (Growth Hack
amount basis), and `cluster-091` (v7 program menu). All four are SCF program facts; none concerns
the `scout.hackathonBrief` operation. Whether the new cases join a cluster is a content decision.

Done when: `golden-truth` records whether each case belongs in an existing or new cluster.

## Eval instruments

### Design a new Raven capability-boundary diagnostic

The rejected QA prompt change does not ship.
Its Method 1 result is recorded in
`.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.
The Raven trap failed T3 and the external lookup control was partial.
The inherited environment hash also differed from the registered value.

Method 2 did not run. This result does not authorize Method 2.
The next attempt needs a stronger mechanism and a new pre-registered diagnostic before a headline
sample.

Done when: an independently reviewed plan defines the new mechanism and diagnostic. It must then
pass its stated product gate before any headline sample receives separate authorization.

### Monitor Friendbot network-context synthesis

The Friendbot failure is a monitor-only single-case result.
Do not infer a prompt repair from it.

Done when: the same failure appears in two unrelated cases, a contract mismatch appears, or trace
evidence shows the prompt requests the wrong behavior.

### Judge stability on the same-100 set is degrading

57 of the same-100 cases now sit below the 0.75 stability threshold, up from 47
before the 2026-08-28 run. Eleven crossed into unstable and one crossed out
when the run added one sample per case. The register decides paid escalations,
so this number governs future spend as well as verdict quality.

Found: register regenerated 2026-08-28 after
`eval/qa/results/2026-08-28T19-27-08-variantA.json` — 538 cases from 195
artifacts (161 collection, 34 rejudge, 0 skipped).

Done when: the next post-collection register refresh reports a stable or
falling unstable-count trend, or the escalation policy accounts for the drift.

## Owner decisions

Owner decisions that block agent work are listed once, in `NEXT.md` under "Owner decisions".
Record each answer there or in `eval/qa/README.md`, then delete the question.
