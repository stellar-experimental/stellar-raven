# Item 5.2 report

Lead: Claude Opus 5.5, agentpc `t1ty`. Pull request:
[#468](https://github.com/stellar-experimental/stellar-raven/pull/468), branch
`np/5.2-owner-followups` on `7dafce0c`. Not merged and not deployed.

## Result

The full scope in [NOTE.md](NOTE.md) is done, through A, C, D, E, F, H and I. The
[ledger row](../../2026-11-16-next-phase.md) and the PR body have the details.

- **E.** The maintenance exception is in `eval/qa/README.md`, "Held-out split", in the Fable
  reviewer's tightened text (REVIEW.md finding 6). The two blocking findings were both about the
  evaluation's draft:
  - its write set could not be met (the sentinel `caseAsOf` rule);
  - its trigger list missed register closure.
- **E, the dated briefs.** No dated brief moved a case. The dated runs keep their narrow scope.
  `PRESTAGE.md` now says:
  - the exception does not apply to these runs;
  - how to record an incidental exposure without committing it.

  `sibling-check.mjs`, the four `*-LEAD.md` briefs, the launcher and the timers are unchanged.
  Left-open register entries go to one later maintenance lane after 2.2c (TODO "Close the register
  entries the dated runs leave open").
- **H.** Reproduced free at the package boundary and in Raven's runner on 0.5.1:
  - a thrown string or object gives `error: undefined`, and Raven records `ok: true`;
  - `throw null` rejects.

  Filed as `cs-012`, [cloudflare/agents#2897](https://github.com/cloudflare/agents/issues/2897)
  (no duplicate found).
- **Reviews.** Fable plan review: 22 findings, all adopted
  ([REVIEW.md](REVIEW.md), reconciliation table in [PLAN.md](PLAN.md)). No further review: the
  `improvements-pipeline` skill asks for a distinct reviewer only to retire a finding.
- **Gates.** Run bare by the lead, all exit 0, again after split v9: `eval:qa:lint`, `improvements:lint -- --live`,
  `typecheck`, `test`, `secrets:scan -- --tree`.
- **Spend.** USD 0.

## Deploy

**Not needed.** No Worker bytes change.

## For the orchestrator

1. **Merge before 2026-11-23 18:00 UTC.** The 2.1 lead starts from `origin/main` and reads the
   `PRESTAGE.md` text and the TODO item this PR changes.
   - If that time is missed, hold the merge until 2.1 and its follow-ups have merged.
   - Then rebase, and carry the lead's left-open count into the rewritten TODO item.

   The `cs-012` issue links the finding on `main`, so that link stays dead until the merge.
2. **Exposure: done, split v9 (orchestrator's answer, 2026-11-17).** The executor piped
   `npm run eval:qa:lint` to `tail`, and its warning lines showed five case ids with golden text.
   It opened no corpus file and looked up no set. The executor is not a maintenance lane, so the
   README rule applies and the cases outside tuning move.
   - The exposure note was moved from `~/.local/state/raven-dated/` to the worktree's untracked
     `tmp/5.2/EXPOSURE.txt`. Nobody read it.
   - [`amend-split-v9.mjs`](amend-split-v9.mjs) checked the v8 SHA-256 (`1f0c1268…7720`). It moved
     only the ids outside tuning (2 of the 5; 3 were already tuning) and printed counts and the
     SHA-256 only.
   - **v9:** `~/backups/gca-2026-11-14-split-v9.json`, mode 600, SHA-256
     `0b6c9c04b59f5f49225df4c054df0a1117bfb8f179660147dde14887515c800c`, 91 tuning, 111 held-out,
     45 reserve. 63 cases outside tuning carry a `reverifyBy`; the earliest is 2027-01-14.
   - `TUNING_ROW_COUNT` is 91. `PRESTAGE.md` and the four dated `*-LEAD.md` briefs point at v9, and
     `sibling-check.mjs` runs on it for 2.1, 2.2a and 2.2c (last line only read). The TODO held-out
     status records v9.
3. **Recurring hazard: TODO item added.** "Stop QA lint from printing golden text" (under "Eval
   instruments"): lint prints case ids and check names only, and a test pins that. Its cost so far:
   two exposures (items 3.5 and 5.2). It is not implemented here.
4. **`sd-077` and `sd-111`.** When the owner confirms the forward was sent, set
   `reported-upstream` with the date and channel. Any machine can do it.

## Open questions for the owner

None.
