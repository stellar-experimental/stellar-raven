# Item 8.2 report: documentation audit

Lead: Claude Opus 5.5, agentpc `t1yk`, 2026-11-18. Owner instruction: "We should probably work
with Fable and Sonnet to audit and review all docs around this repo to ensure accuracy,
cleanliness, organization, etc."

## Pull requests

| PR | Scope | State |
|---|---|---|
| [#488](https://github.com/stellar-experimental/stellar-raven/pull/488) | Root docs, `docs/`, ADR index, 4 comments, item records, DECISIONS entry | Merged `7221e8af` |
| [#489](https://github.com/stellar-experimental/stellar-raven/pull/489) | `.agents/` README, rounds guide, roster, skills | Merged `697d2e97` |
| [#490](https://github.com/stellar-experimental/stellar-raven/pull/490) | Split v12, `TUNING_ROW_COUNT` 98, TODO held-out status, dated briefs, PRESTAGE, ledger row | Merged `ecb16018`; v12 copied to the Mac |
| [#491](https://github.com/stellar-experimental/stellar-raven/pull/491) | Case text out of `ideas/` (codegen note to `research/audits/`). **Do not read the diff.** | Merged `87de1572` |
| [#492](https://github.com/stellar-experimental/stellar-raven/pull/492) | Eval and folder guides, `ideas/` dispositions, TODO additions | Rebased on `87de1572`; open |

Merge window for all three: before 2026-11-23 18:00 UTC. If that is missed, hold until run 2.1
and its follow-ups merge, then rebase. I checked locally that #492 merges cleanly on top of #490 and
#491. The only conflict is `ideas/README.md`; take #492's side, which already links the research
path. The combined tree's link check finds 0 problems. I can rebase #492 myself once the first two
merge.

## Result

- 147 audit findings from four Sonnet accuracy lanes (sets A to D) and one Fable organization lane
  (set O). One Fable plan review (18 findings, all adopted, [RECONCILE.md](RECONCILE.md)) caught a
  wrong adopted fix (B-03), the PR 3 case-text diff exposure, and a missed case id.
- Every finding is applied, declined with a reason, or deferred, per EXEC-1 to EXEC-4.
- No Worker bytes change in any PR, so **no deploy is needed**. Nothing here is model-facing. No
  model-calling eval ran; USD 0.

## Split v12 (orchestrator ruling)

- `~/backups/gca-2026-11-14-split-v12.json` on agentpc, mode 600.
- SHA-256 `6a032d098ea9f8e4dadcfdd4599d610d1d2eca9d704d6bb1a30c7f71c144c85f`.
- 98 tuning, 105 held-out, 44 reserve.
- 10 ids: 5 moved, 1 already in tuning, 4 in no set. v11 is untouched.

## Approved and still pending

- Approved and merged: the AGENTS.md accuracy edits, the frozen-list correction, and the skill
  behavior changes B-02, B-04, B-05 and O-16.
- The #492 TODO item is approved as an item; each change in it still needs approval after run 2.2c merges: "Apply the item 8.2 deferred
  documentation changes" (RECONCILE "Approval list" point 3).

## Owner questions (you relay them)

1. Do `gpt-6.2-sol` and `gpt-6.2-astra` replace or join the Codex tiers?
2. Partner-side detail sat in a public idea file. Is any action needed beyond removing it from
   `main`?
3. `/terms` says 30 days; `docs/operations.md` says 7 days and no query text.
4. Should the stellar.org admission and the OAuth per-origin design each get an ADR?
5. Counsel review of skill forwarding against upstream licenses (new owner decision 7 in the TODO).

## Lanes (all closed)

| Terminal | Role | Model |
|---|---|---|
| `t1ym` to `t1yq` | Sets A to D accuracy | Sonnet 5.5 |
| `t1yr` | Set O organization | Fable 5.2 |
| `t1ys` | Plan review | Fable 5.2 |
| `t1yt`, `t1yv`, `t1yx`, `t1yw` | Executors E1, E2, E3, E4 | Sonnet 5.5 |
