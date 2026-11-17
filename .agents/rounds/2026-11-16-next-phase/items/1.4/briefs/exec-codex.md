# Item 1.4: executor follow-up, reconcile CODEX-REVIEW.md

Same rules as `briefs/exec.md`. The lead adopts all eight findings in
`items/1.4/CODEX-REVIEW.md` with these dispositions. The lead has already made three edits in the
tree: the B/X date D is never before 2026-12-02 (PRESTAGE.md), the follow-up cutoff wording in
`2.1-LEAD.md`, and two sibling ids redacted in `REVIEW.md` and `briefs/review.md`, plus one TODO
wording fix. Keep them.

1. **Write set.** Add the compiler outputs `eval/qa/lifecycle-registry.json` and
   `eval/qa/tool-cases.json` (the second only when the compiler changes it) to the PRESTAGE write
   set, the commit instructions and the merge "May" condition. They are never hand-edited.
2. **Membership disclosure.**
   - In `REVIEW.md` finding 3, replace the Evidence bullets that describe particular register
     entries and what their members imply with one bracketed line:
     `[evidence redacted by the lead: it described which register entries allow identification by
     subtraction. The class of leak: per-entry counts against the public register.]`.
     Leave the Change part.
   - Audit every new or changed file in this branch for the same thing: entry-specific membership
     statements, per-entry counts, and read/unread partitions. Record the audit result in EXEC.md.
   - **Closure rule, all-or-none.** Within one run, if any reopened entry holds a member the lead
     may not open, close none of that run's reopened entries. Every one stays at `reopen`, with no
     `reSwept` written. Only when every reopened entry was read in full does the run close them,
     with the neutral template. This is stricter than answer 2 (1) and consistent with it. Record
     the count of entries left open in the TODO bullet. Update PRESTAGE.md, the briefs, and
     PLAN.md's register paragraph.
3. **Software Versions after a Bell follow-up.** In B or X, 2.1 schedules two follow-ups, both
   with due date D:
   - `2.1 r1`;
   - `2.2a r1`, fired 4 hours after the `2.1r1` fire time.
   `2.2a-LEAD.md` must handle run key `2.2ar1` and take due date D from the task line (cutoff D
   20:00 UTC, merge deadline D+1 00:00 UTC). A follow-up that again ends in B or X extends its
   own cases, alerts, and schedules nothing.
4. **Start limit.** Units and `schedule-followup.sh`: set `StartLimitIntervalSec=0`, so there is no
   rate limit. Keep `Restart=on-failure`, `RestartSec=20min` and `RestartPreventExitStatus=75`.
   The launcher enforces the time bound itself, before anything else after argument parsing:
   - The cutoff is the `cutoff` field in `items.json`. For a run key with a run suffix, it is the
     due date at 20:00 UTC.
   - If now is past the cutoff, `fail 75 "missed cutoff <time>"`, which alerts.
5. **Watchdog.**
   - Validate that every expected id is present with a `reverifyBy`. Treat a missing id, an
     unreadable or malformed input, or a failed `git` or `jq` step as "cannot verify": alert, then
     exit 1.
   - Log "ok" only after a positive check of every id.
   - The watchdog services get `Restart=on-failure`, `RestartSec=15min` and
     `StartLimitIntervalSec=0`. The script stops retrying (exit 0, after one final alert) once the
     merge deadline has passed.
   - Also exit 1 when no alert channel accepted an alert, so it retries.
6. **Launcher after `hc run`.** Guard every post-launch command (`hc get`, `jq`, `hc keys`,
   `hc read`) with `|| true`, or an explicit check, inside the bounded loop. Keep the terminal
   address. Any path that cannot establish readiness ends in `fail 75` with a diagnostic. Never
   start a second lead.
7. **Alert delivery.**
   - Wrap each channel in `timeout 60`.
   - `alert` returns 0 only if at least one channel accepted the alert.
   - Write the `FAILED-<key>.txt` marker, which suppresses repeat alerts, only after an accepted
     alert.
   - When no channel accepted, the launcher exits 1 (retryable) even for an otherwise final
     failure, but only before `hc run`; after `hc run`, it keeps 75 and logs the delivery failure.
   - Deduplicate the issue: look for an open issue with the same title and comment on it instead
     of creating a second one (`gh issue list --search` on the title, `--state open`).
8. **SCF corroboration.** In PRESTAGE.md 2.2c:
   - Scout is a retrieval comparison, not a second class; it mirrors the awards page.
   - Give a second independent class for a newly pinned phase or deadline (for example an SDF or
     SCF announcement outside the awards page, found by the CLI's built-in web search, class D).
   - The no-#47 claim gets an explicit web sweep, as negative claims require.
   - With no qualifying second class, use source-relative wording ("per the official SCF Awards
     page, observed <timestamp>") or the extension.

Then re-run the gates of PLAN.md "Gates (this item)", including the dry run and
`systemd-analyze --user verify` with the scripts in a scratch `HOME`.

Add a short "Codex reconciliation" section to EXEC.md, one line per finding. Commit with the normal
hooks, Sonnet attribution, and no push. Report with
`hc send t1rs '/home/tyler/code/raven-wt/np-1.4/.agents/rounds/2026-11-16-next-phase/items/1.4/EXEC.md'`.
