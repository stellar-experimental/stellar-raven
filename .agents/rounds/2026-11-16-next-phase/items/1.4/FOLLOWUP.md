# Item 1.4 follow-up: rehearsal and split v6

Lead: Claude Opus 5.5, agentpc `t1rs`, 2026-11-17, after #459 merged (`19d53257`).

## Orchestrator's answer

Received from `t40j` on 2026-11-17 over `hc`, verbatim:

> Orchestrator: #459 merged (19d53257); split v5 copied to the Mac and its SHA-256 matches. Run the
> rehearsal now. Open question 1: option (a), split v6 by a script that takes the id from the Codex
> session log so nobody sees it; record counts and SHA-256. Put the rehearsal result and the v6
> amendment in one small follow-up PR from a fresh branch off origin/main, then report. The message
> at 02:55 was my answer to question 2, which you already applied; nothing to resend.

## Split v6

- [amend-split-v6.mjs](amend-split-v6.mjs) does the move. It reads the Codex review session log on
  agentpc (`~/.codex/sessions/2026/11/17/rollout-2026-11-17T02-50-08-…jsonl`) and collects the
  corpus case paths it shows. It keeps those outside the seven files that review was allowed to
  open, and requires exactly one of them to sit in held-out or reserve. It moves that case with
  `moveToTuning`.
  - It prints only counts and the SHA-256, so nobody saw the id.
  - The dry run and the real run gave the same hash.
- Path: `~/backups/gca-2026-11-14-split-v6.json`, mode 600.
- SHA-256: `04107a463c462eecb02a64fe0b69fab6cb4a1bc388197c3e3a01107e9350c362`.
- Counts: 87 tuning, 113 held-out, 47 reserve. v5 (86/114/47) stays in place.
- `TUNING_ROW_COUNT` is 87. The `.agents/TODO.md` held-out status names v6. The owner-question
  count is now 66 cases outside tuning with a `reverifyBy`, and the next one is still 2027-01-14.
- **The dated briefs and PRESTAGE.md now name v6.** This is needed: `sibling-check.mjs` asserts
  `TUNING_ROW_COUNT` through `tuningIdsOf`, so against v5 it now fails. That was checked: v5 is
  rejected, and v6 gives 2.1: 0 and 2.2c: 1, as before. PRESTAGE.md also tells a lead to use any
  later split that the TODO names.

## Rehearsal

The real launch path ran end to end through two timers on agentpc: `rehearsalr0`, and the
`rehearsalr1` follow-up that `rehearsalr0` scheduled. Neither made a file edit, a real push or a
pull request.

| Run | Fired (UTC) | Lane | Steps | Result |
|---|---|---|---|---|
| `rehearsalr0` | 03:09:30 | `t1s0` | `git fetch`; a worktree and branch from `origin/main` (`19d53257`); `hc run --no-parent`; `working` after 10 s; `npm ci`; `git push --dry-run`; `gh pr list` (authenticated); `npm run eval:qa:sentinels -- --check` (21 sentinels, 0 errors); one Fable child and one Codex child (`gpt-6.1-sol`, confirmed in the Codex session log), each replying by `hc send`; `schedule-followup.sh rehearsal r1` for 03:12:10, then `--remove rehearsalr0` | All exit 0; report sent to `t1rs` and `t40j` |
| `rehearsalr1` | 03:12:30 | `t1s3` | The same launcher path and steps 1 to 5, scheduling nothing (its key is r1) | All exit 0; report sent to `t1rs` and `t40j` |

- No start-up dialog appeared, in the launcher or in any child.
- `hc wait --children all` returns once for each child's message, so a lead waits again. The briefs
  already say to check after each wait.
- Cleanup by the lead, who owns these runs:
  - both lanes killed and removed;
  - `schedule-followup.sh --remove rehearsalr1`;
  - both worktrees and local branches removed (neither was pushed);
  - the rehearsal timer stamps deleted.
- Only the eight production timers remain.
- Raw results stay on agentpc: `~/.local/state/raven-dated/rehearsalr0-REHEARSAL.md`,
  `rehearsalr1-REHEARSAL.md`, and the launcher logs `rehearsalr0.log` and `rehearsalr1.log`.

## Report

- PR [#460](https://github.com/stellar-experimental/stellar-raven/pull/460), from the fresh branch
  `np/1.4b-rehearsal-split-v6` off `origin/main` at `19d53257`.
- The lead ran every gate bare and each passed:
  - `npm run typecheck`
  - `npm test`: 3680 passed
  - `npm run build`
  - `npm run eval:qa:lint -- --stale`: 0 errors
  - `npm run secrets:scan -- --tree`
  - `node --check` on the new script
- No deploy is needed.
- **For the orchestrator:**
  - Merge #460 before 2026-11-23 18:00 UTC. The 2.1 lead reads the v6 path from `origin/main`. The
    v5 path would now fail `sibling-check.mjs`.
  - Copy split v6 to the Mac (SHA-256 above).
- **Review.** No separate review ran. `amend-split-v6.mjs` reuses the `moveToTuning` core and the
  runner shape that the item 1.4 reviews covered. If you want an independent read of it, say so.
- **Open questions:** none.
