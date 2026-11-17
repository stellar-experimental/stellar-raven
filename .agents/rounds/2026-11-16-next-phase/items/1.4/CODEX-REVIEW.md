# Codex review — item 1.4

Reviewed `e5cfb3b0` plus the uncommitted edits in `np/1.4-prestage-dated-goldens`, against `origin/main`, on 2026-11-17. One pass, no implementation changes, paid calls, model-calling evals, or split-file reads. Paths below beginning `dated/`, `REVIEW.md`, or `PLAN.md` are relative to `.agents/rounds/2026-11-16-next-phase/items/1.4/`.

1. **Blocking — the allowed write set excludes an unavoidable compiler output.**

   Evidence: `dated/PRESTAGE.md:42-52` allows only `cases.json` and `sample.json` as compiler outputs; lines 61-63 forbid merging a diff outside that set. But `eval/qa/compile-qa.mjs:303,325-338` always rebuilds `eval/qa/lifecycle-registry.json`, whose `caseContentSha256` includes the complete case (`eval/qa/lifecycle.mjs:276`). Even outcome X's change to `reverifyBy` changes that hash. An in-memory check using the real `contentSha256` and the allowed edge case confirmed this. Leaving the registry out fails `lint-corpus.mjs:250-251` and the CI generated-artifact check (`.github/workflows/ci.yml:134`); including it violates the delegated write set. Thus none of A/B/X can finish within the stated rules.

   Fix: add compiler-generated `eval/qa/lifecycle-registry.json` to the write set and commit instructions. Account for `tool-cases.json` as another compiler output, permitting a change only if an authorized edited case actually affects it. Do not hand-edit either generated file.

2. **Blocking — the committed review preserves the membership disclosure that it says was removed.**

   Evidence: `REVIEW.md:91-96` still describes particular public register entries and the membership conclusion obtainable from their remaining members. This is enough to reconstruct the very subtraction attack in finding 3 without reading a private split. Redacting two sibling IDs elsewhere in the uncommitted edits does not remove it. `dated/PRESTAGE.md:32-40` and `.agents/TODO.md:62` prohibit this disclosure. `EXEC.md:98-101` also explicitly acknowledges that the future selective closure pattern exposes membership information; the orchestrator authorized leaving unread entries open, but did not authorize publishing membership conclusions in the review.

   Fix: sanitize the review's evidence to explain the class of leak without naming the affected entries or giving recoverable per-entry constraints. Audit all newly committed review/brief/execution text, not just PLAN.md. For future runs, leave the entire affected group reopened and report aggregate counts, or obtain an explicit owner resolution of the conflict between selective closure and membership privacy. Do not publish a deterministic read/unread partition through `reSwept.reason` or verdict differences. This report intentionally does not repeat the identifiable member IDs.

3. **Blocking — a successful Bell follow-up can strand Software Versions past its deadline.**

   Evidence: `dated/PRESTAGE.md:243-258` extends all five Bell-dependent cases to D (at least December 2), causing the November 30 Software Versions run to skip. But the follow-up uses the same outcome A instructions: lines 225-226 tell it to leave Software Versions to 2.2a if the page still lacks Protocol 30. The 2.1 completion/watchdog set (`dated/items.json:5-10`) excludes Software Versions.

   Concrete path: the November 23 run takes X and merges a December 2 extension; 2.2a skips on November 30; `2.1r1` runs December 1 and proves activation, while the docs still lag. It updates the four Bell cases and leaves Software Versions at December 2. Both watchdogs can report success against their respective sets/due dates, yet every PR fails stale lint from December 3. The SCF run on December 4 cannot repair this within its scope.

   Fix: explicitly transfer responsibility for every extended case to the follow-up. Either schedule a separate `2.2ar1` with due D and its existing authority to file a docs finding, or extend the follow-up's scope/authority and monitored case set to handle the lagging-page outcome itself. Do not suppress 2.2a without a replacement owner for its deadline.

4. **Should-fix — retries exhaust the start limit before the late-merge recovery window ends.**

   Evidence: all `dated/units/raven-dated-*.service` files use `StartLimitIntervalSec=12h`, `StartLimitBurst=30`, and `RestartSec=20min` (for example `raven-dated-2.1.service:3-12`); `dated/schedule-followup.sh:46-48` repeats this. With quick missing-brief failures, the 31st start is rejected roughly ten hours after the first fire. The installed `systemd.unit(5)` explicitly states that `Restart=` stops retrying after the limit; expiration of the interval alone does not restart it. A one-shot calendar timer supplies no later activation. Thus a merge early on November 24 can still fail to launch despite many hours remaining before cutoff.

   Fix: choose a limit compatible with twenty-minute retries (or disable start-rate limiting and impose an explicit cutoff in the script). Bound retries by the run's actual cutoff, including follow-ups, and alert once on final expiration. Check both static and generated units.

5. **Should-fix — the watchdog reports success for missing cases and silently exits on corpus-read errors.**

   Evidence: `dated/watchdog-dated.sh:39-45` selects only cases that exist, and treats empty output as success. It never verifies that all requested IDs were present. Its `LATE=$(...)` assignment also has no failure handler under `set -euo pipefail`. I executed the actual script tail in memory with a stubbed `git`, replacing only external inputs and alert/log functions: an expected case absent from `{ "cases": [] }` produced exit 0 and `ok: every case ...`; a failed cases read produced exit 128 and only the start log, with no alert. The launcher's corresponding expression correctly rejects missing/empty sets in the same synthetic checks.

   Fix: validate the expected and observed ID sets, distinguish unreadable/malformed/missing input from a completed run, and explicitly alert/retry on read or parse failure. Only log success after all expected dates are valid and later than the due date.

6. **Should-fix — hc status failures bypass the launcher's final-failure handling.**

   Evidence: `dated/launch-dated-lead.sh:110` assigns an unguarded `hc get | jq` pipeline under `set -euo pipefail`; line 103 has the same issue for parsing launch output, and lines 121-122 for `hc keys`. Running the actual status-loop fragment with an `hc` stub returning 7 exits 7 immediately, with no `fail` call or diagnostic. Systemd treats that as retryable, even though the worktree and possibly a live lead already exist. The next attempt hits the existing-worktree guard and exits 75, leaving a potentially blocked lead without reconciliation.

   Fix: handle each post-launch command failure explicitly. Retry transient status reads within the existing bounded startup window, preserve the returned terminal address, and end through `fail 75` with a useful diagnostic if readiness cannot be established. Reconcile only the terminal the launcher created; never infer that it is safe to start a duplicate.

7. **Should-fix — failed alert delivery is marked as delivered, and watchdog alerts have no retry.**

   Evidence: `dated/launch-dated-lead.sh:41-60` suppresses both delivery failures and writes `FAILED-<key>.txt` regardless. Subsequent retryable failures skip alerts whenever that file exists. If the first boot-time failure occurs while both the network and hc are unavailable, restoring connectivity does not deliver the original alert. `dated/watchdog-dated.sh:25-35` likewise consumes delivery failures; the watchdog services have neither `Restart=` nor another fire time. A network outage at the single watchdog fire can therefore lose both channels permanently.

   Fix: track delivery success separately from the failure record, return a failure when no durable channel accepted the alert, and retry delivery with bounded backoff/deduplication. Give watchdog delivery failures a retry path. Bound the GitHub calls so one stalled channel cannot consume the service timeout before the other/retry path runs.

8. **Should-fix — SCF's staged corroboration does not supply an independent witness or the negative-claim sweep.**

   Evidence: `dated/PRESTAGE.md:292-300` presents the Scout feed or SCF handbook as the second source class for pinning the phase/date. The handbook is another class A source. The live probe at `2026-11-17T02:51:31Z` returned Scout's `source: live` and `verifyAt: https://communityfund.stellar.org/awards`; it repeats the same Awards page and is also the service under evaluation in this case (`surface: scout.searchResearch`). `golden-truth/SKILL.md:50-70` excludes the evaluated aggregator corroborating its own claim and requires a separate class for status/dates. The staged no-#47 claim also lacks the explicit web sweep required for negatives. Existing case provenance already warns that Scout is not independent editorial confirmation.

   Fix: keep Scout as a retrieval comparison, add an actual independent class for any newly pinned phase/deadline, and explicitly stage a free CLI web sweep for the absence claim. If no qualifying evidence exists, use source-relative/unverifiable wording or the authorized extension; do not label two views of the same page independent confirmation.

9. **Info — verification results and limits.**

   The three shell scripts pass `bash -n`; both dated Node scripts pass `node --check`. The follow-up watchdog date expression yields `2026-12-02 16:00:00 UTC` for due December 2. The launcher's exact completion predicate accepts all-later dates and rejects a due date, missing case, and empty case set. The staged Protocol 30 sentinel evaluated with the real `evaluate`/`normalize` functions gives `hold` for 30, `drift` for 29 and 300, and `error` for the Testnet passphrase, as intended. Separate run keys avoid the initial/follow-up worktree collision.

   Current public reads support the baseline: [Horizon](https://horizon.stellar.org/) and RPC report Mainnet 29 (sampled ledger 65519569), Testnet 30; the [Bell guide](https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide) and [upcoming maintenance feed](https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json) schedule the Mainnet vote for November 23 at 17:00 UTC; [Software Versions](https://developers.stellar.org/docs/networks/software-versions.md) still has no Protocol 30 heading and gives the staged Protocol 29 release set. The [SCF Awards page](https://communityfund.stellar.org/awards) currently displays #46 Initial Review and #45 Ended. These reads establish today's baseline, not a future activation. The revised A/B/X rules correctly avoid treating a completed maintenance as activation or uncertainty as non-activation.

   The four briefs contain the requested cutoff, open-PR, and top-of-REPORT blocker instructions; the 2.1 brief also adjusts the follow-up cutoff. The no-admin/no-force/no-deploy limits are explicit. I did not run compile/register or the full suite: they would write generated files or read the restricted corpus, and no actual dated patch exists yet. Static analysis and the in-memory checks above already establish the blocking compiler/write-set conflict.

   Review-scope deviation: one late `rg` search used incorrectly rooted `!corpus/**` exclusions while looking for references in tests and QA tooling. It consequently scanned the corpus and displayed additional provenance/retired-record snippets beyond the seven allowed case files. This was a scope violation. I did not use those snippets as evidence, repeat the search, or inspect a private split. Any exposure reconciliation should use that command's transcript; no membership conclusion is made here.

Verdict: **revise before enabling unattended merges** — the write-set conflict, retained membership disclosure, and stranded Software Versions follow-up are blocking.
