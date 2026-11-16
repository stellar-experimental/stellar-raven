# Item 0.4 report: TODO and loop ledgers reconciled

Lead: Claude Opus 5.5, agentpc `t1qz`. Plan review: Claude Fable 5.2, high, `t1r0` (17 findings,
no blocker, all adopted). Executor: Claude Sonnet 5.5, high, `t1r1`. Both children were killed and
removed.

## Pull request and result

[#454](https://github.com/stellar-experimental/stellar-raven/pull/454), branch
`np/0.4-todo-ledgers`, docs only. The PR body gives the full list.

- **TODO:**
  - 5 items deleted and 3 merged.
  - Decisions 1, 5 and 6(a)(b) applied.
  - Decisions 2, 3, 4 and 7 recorded, with their work kept open.
  - The 0.2 inputs absorbed, including the report's item 4 (`sd-081` and Freighter/Varial). The
    0.3 edits were already on `main` and are unchanged.
- **Ledgers:**
  - Loop 1 and loop 2 have Outcome sections and bundle pointers, and the Lanes table is fixed.
    Their launch briefs are deleted under the retention rule.
  - The round ledger has the 0.2 Deployed cell as you instructed, stamped by the #223 comment,
    and the 0.4 row.
- **Gates:** I ran them bare on the final tip. Typecheck 0, test 0 (3,608 passed), build 0,
  secrets scan clean. The link check found 0 broken links in 131.
- **Spend:** USD 0.

## Deploy

Not needed. No Worker bytes change.

## For the orchestrator

1. **Merge #454** when CI is green.
2. **Loop 2 deploy evidence.** No tracked file holds the post-deploy egress check except the
   round brief. The TODO keeps the "Worker egress" bullet open, and the loop 2 ledger says "the
   orchestrator reports". Please send:
   - the full Version ID of `c3596dcc…`;
   - the two `stellarOrg` operations called and what each returned;
   - the date.

   With those, a small follow-up commit records them and deletes the bullet. I can make it on
   this branch before merge.
3. **DECISIONS.md 5 paraphrases ADR-0011 rule 3 backwards.** The ADR reopens the trim on "a fix
   for the live-data weakness that gives back most of the token saving". DECISIONS.md says "a fix
   that keeps most of the token saving reopens the question". The TODO now says the owner's
   intent ("a fix that keeps most of the token saving reopens it") and leaves the ADR's rules
   unchanged. Correct DECISIONS.md if you want the two to read the same.
4. **Decision 2 has no round item.** The overlap list and the exposed-row amendment need agentpc.
   The TODO says no item carries them yet. Until part (a) lands, the loop 2 ruling stands: no
   lane reads per-row legacy or extended routing output. **Round item 3.3's per-case review
   therefore waits on 2(a).** Schedule 2(a) before 3.3, or tell 3.3 to use aggregate counts only.
5. **Decision 6(c)** (the National Bank of Ukraine, scam-recovery and Pi Network gaps) also has no
   item. The TODO assigns the filing to round item 1.3's change. Tell the 1.3 lead.
6. **Retention:** I deleted only the two launch briefs. Every other file in the loop folders
   stays, with the reason named in each Outcome section.

## Open questions for the owner

None.

## Housekeeping

The worktree `/home/tyler/code/raven-wt/np-0.4` stays until merge. Its `.dev.vars` (placeholder
names only) and `tmp/` are ignored.

## Follow-up after the orchestrator's reply

- The loop 2 ledger records the deploy and egress evidence the orchestrator supplied. That
  covers Version `c3596dcc-90d7-4602-bbab-d813b3eaf1ec`, the post-deploy checks, and both
  `stellarOrg` operations ok from production at 2026-11-16 00:06:28 UTC.
- In the TODO, the egress bullet and its done-when clause are deleted. The heading is now
  "Prove the stellar.org source".
- DECISIONS.md decision 5 now quotes ADR-0011 rule 3 correctly, with the owner's intent beside
  it.
- Decision 2 runs as the next item, and decision 6(c) goes to the 1.3 lead. No change from this
  item.
