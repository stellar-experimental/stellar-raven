# PR #157 stage-1 proposal review

Reviewer: Grok high (Grok 4.6). Distinct from the Sol author and the Astra coordinator.
Clock: `2026-09-16T19:23:42Z`.
Mode: proposal-only. No owned-code edits, push, paid evaluation, or GitHub posts.

Base: `c4b2ff095cf9c3f318a09dab5ae58cf1711b1982` (`origin/main`).
Worktree: `/tmp/raven-execution-2026-09-16/proposal`.

## Verdict

**Approve the stage-1 proposal land.**

Source acceptance and golden activation stay blocked. Those waits are separate from this three-file proposal.

## Files versus `c4b2ff09`

Exactly three intentional files:

1. `eval/qa/corpus/proposed/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json` (untracked)
2. `eval/qa/lifecycle-registry.json`
3. `test/qa-lifecycle.test.mjs`

`eval/qa/cases.json`, `eval/qa/sample.json`, and the battery tree are clean. The ID is not in the compiled 500-case battery.

## Lifecycle counts

| Metric | Base `c4b2ff09` | Proposal |
|---|---|---|
| Compiled cases | 500 | 500 |
| `counts.active` | 500 | 500 |
| `counts.proposed` | 0 | 1 |
| `counts.quarantined` | 0 | 0 |
| `counts.retired` | 0 | 0 |
| `reservedIds` length | 500 | 501 |

The only new reserved ID is `q-tw-escrow-api-auth-custody`.
The only changed registry entry is that ID, path `eval/qa/corpus/proposed/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json`, state `proposed`, `reviewState: none`.
Canonical digest `539b8174973d4225c6399fd5f3769b28646b22df0c0ebf01dfad69d5b8b1360c` matches the proposed file.

The lifecycle test still expects 500 compiled cases. It now expects `proposed: 1` and reserved length 501. That count update belongs in this stage.

## Corrected gospel

The question and the two avoid items are unchanged.

Key fact 4 requires the documented send-transaction helper for the API version. It does not require one exact path.

The answer and notes accept:

- pinned V1: `/helper/send-transaction`
- pinned V2 and current Core API: `/stellar/send-transaction`

This lane already fetched those pinned bodies and the Core API send-transaction page during the independent source review. V1 `skills/api/core-concepts.md` names `/helper/send-transaction`. V2 `skills/api/v2/core-concepts.md` names `/stellar/send-transaction` and records the V1 helper route. Current Core API documents `/stellar/send-transaction`.

The new class B sources and the new `confirmed-as-of` corroboration row match that evidence. Authentication remains `disputed`. Bearer exclusivity and server-side signing remain contradicted avoid traps.

This closes the proposal-stage submit-path finding.

## Not in this approval

- Trustless Work source pin
- Catalog/INDEX description repair
- The five irrelevant routing captures
- Battery activation

Sol may repair the host-curated description without changing this proposal. Land stage 1 now.
