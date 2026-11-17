# Item 1.4 report: pre-stage the dated golden runs and their timers

Lead: Claude Opus 5.5, agentpc `t1rs`. Plan review: Claude Fable 5.2, high. Executor: Claude
Sonnet 5.5, high. Independent review: Codex frontier `gpt-6-astra`, high, read-only. This tier was
chosen because the change is an unattended path that holds an admin `gh` token. Spend: USD 0, with
no eval or paid call.

## Pull request and result

[#459](https://github.com/stellar-experimental/stellar-raven/pull/459), branch `np/1.4-prestage-dated-goldens`. It refs TODO entries only, so no issue closes. I
read the full diff and re-ran every gate bare on the final tree, and each exited 0:

- typecheck;
- `npm test`: 3680 passed;
- build;
- QA lint with `--stale`: 0 errors;
- secrets scan;
- syntax checks and `systemd-analyze verify`.

**Split v5** (your answer to question 1, option 1):

- path `~/backups/gca-2026-11-14-split-v5.json`, mode 600;
- SHA-256 `c8796ec14c4d77d114693cfcf5a51a9f5da80a6506956bb7f88c6992725f4b15`;
- 86 tuning, 114 held-out and 47 reserve cases; v4 is kept;
- `TUNING_ROW_COUNT` is 86;
- the TODO held-out status is updated, and the TODO has the owner question you asked for. 67 cases
  outside tuning carry a `reverifyBy`, and the next one comes due on 2027-01-14. The runner's
  "scheduled" count of 64 used `tags.freshness`, which undercounts, so the TODO uses 67.

**Staged** in `items/1.4/dated/`:

- `probe.mjs` and its baseline from today. The baseline shows Mainnet on P29 and Testnet on P30, the
  Bell vote still set for 2026-11-23 17:00 UTC, Software Versions with no P30, and SCF #46 in
  Initial Review.
- `sibling-check.mjs`. It prints counts only for cases a lane may not open.
- `items.json`.
- `PRESTAGE.md`, which holds:
  - the write set;
  - the merge limits;
  - the evidence slots;
  - the A/B/X outcome test, keyed on the ledger; the status page proves nothing, and X never
    becomes B;
  - every edit, field by field, including the staged sentinel-test edit and the dormant sibling;
  - the register steps, with all-or-none closure;
  - the gates.
- Five briefs (2.1, 2.2a, 2.2b, 2.2c, rehearsal).
- `launch-dated-lead.sh`, `watchdog-dated.sh` and `schedule-followup.sh`.

**Timers on agentpc.** Linger is on. Lead timers:

| Lead | Fires (UTC) | Notes |
|---|---|---|
| 2.1 | 2026-11-23 18:00 | Also takes the quantum case |
| 2.2a | 2026-11-30 06:00 | |
| 2.2b | 2026-12-01 06:00 | Normally ends in the launcher as "already done" |
| 2.2c | 2026-12-04 06:00 | |

- Model-free watchdogs fire at 16:00 UTC on each due date. They alert through `hc` to `t40j` and
  through a GitHub issue in this repository.
- In outcome B or X, 2.1 extends to a date D no earlier than 2026-12-02, and schedules the follow-ups
  `2.1r1` and `2.2ar1`.
- Your limits are in every brief, including the cutoffs: 2.1 at 2026-11-24 20:00 UTC, and each 2.2
  run 4 hours before its deadline.
- I fired a timer twice. Each time a top-level Opus lane started with no parent and reported back
  ([TIMER-TEST.md](TIMER-TEST.md)).
- The units were re-armed after the reviews, and no service has fired yet.

**Reviews.**

- Fable plan review: 17 findings (5 blocking), all adopted.
- Codex review: 8 findings (3 blocking), all adopted:
  - the compiler's `lifecycle-registry.json` added to the write set;
  - membership-by-subtraction text redacted from REVIEW.md;
  - Software Versions stranded by a Bell follow-up; fixed by the `2.2ar1` follow-up;
  - start limits replaced by a cutoff the launcher checks itself;
  - watchdog validation;
  - launcher guards after `hc run`;
  - alert delivery that is checked, with deduplicated issues;
  - SCF independent corroboration.

## Deploy

None needed. No Worker bytes change.

## For the orchestrator

1. **Merge this PR before 2026-11-23 18:00 UTC.** The 2.1 launcher reads its brief from
   `origin/main`. If the merge is late, it retries every 20 minutes up to the cutoff, and the
   watchdog alerts on 11-24 at 16:00.
2. **Copy split v5 to the Mac.** SHA-256 above.
3. **Tell me here (`t1rs`) when it has merged.** I then run the rehearsal (PLAN.md step 7): the real
   launch path, with a worktree, `npm ci`, push access, a Fable child and a Codex child, and a
   follow-up timer. It makes no edit and opens no PR, and takes about 20 minutes of Opus. I record
   the result where you choose: a follow-up commit or the 2.1 lead's PR.
4. **A message of yours reached me unread.** One message from you arrived around 02:55 UTC while I
   was waiting on a child. `hc wait` reported it, but I never saw its text. If it needed an answer,
   please resend it.

## Open questions

1. **Incidental exposure during the Codex review (orchestrator).** Codex ran one `rg` whose
   exclusions were wrong. It showed provenance snippets from corpus files beyond the allowed set,
   and Codex reported this itself. I checked its session log by script, counting only: one case from
   held-out or reserve appears in that output. I did not look at which one. Under the README rule, a
   case an agent saw moves to tuning by a dated amendment. Options:
   - **(a)** A split v6 by a script that takes the id from the session log, so nobody sees it.
   - **(b)** Treat a reviewer's glimpse of provenance as no exposure, and record why.

   The executor's single grep showed lines from two dated case files only (EXEC.md, deviation 1).
2. **Owner question in the TODO.** May golden maintenance open held-out cases (option 2)?
   - The dated runs leave some register entries at `reopen` under answer 2 (1). The 2.2c scan
     already finds one pending-state match among the SCF cases that run may not open. So one golden
     outside tuning will state a stale SCF phase until the owner decides.
   - The same question returns on 2027-01-14.
