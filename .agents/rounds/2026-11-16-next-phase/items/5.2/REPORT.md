# Item 5.2 report

Lead: Claude Opus 5.5, agentpc `t1ty`. Pull request:
[#468](https://github.com/stellar-experimental/stellar-raven/pull/468), branch
`np/5.2-owner-followups` (five commits on `7dafce0c`). Not merged and not deployed.

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
- **Gates.** Run bare by the lead, all exit 0: `eval:qa:lint`, `improvements:lint -- --live`,
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
2. **Exposure: 1 event, five case ids (decision needed).** The executor piped
   `npm run eval:qa:lint` to `tail`, and its warning lines showed five cases with golden text.
   - It opened no corpus file and looked up no set.
   - It wrote the ids to `~/.local/state/raven-dated/5.2-EXPOSURE.txt` on agentpc. The file is
     untracked, and I have not opened it.
   - The executor is not a maintenance lane, so the new exception does not cover it. Under the
     README rule, the cases move to tuning by a dated amendment (split v9).
   - Precedent: items 3.5 and 5.1, where the move was made by script with the ids unseen in prose.
   - I have not amended the split. Tell me to make v9 from that file by script, and I will update
     `TUNING_ROW_COUNT` and the dated briefs' split pointer in this PR.
   - Two notes on that path:
     - The file sits in the dated runs' state folder. Move it out if that matters to you.
     - The dated runs need the new split pointer before 2026-11-23 18:00 UTC, so v9 should land
       in this PR or before it merges.
3. **Recurring hazard.** This is the second time QA lint output has exposed golden text (3.5 was
   the first). A lint mode that prints ids without text, or a rule that lint output goes to a file
   and only its exit code is read, would stop it. I did not add a TODO item, because that is outside
   this item's scope. Say if you want one.
4. **`sd-077` and `sd-111`.** When the owner confirms the forward was sent, set
   `reported-upstream` with the date and channel. Any machine can do it.

## Open questions for the owner

None.
