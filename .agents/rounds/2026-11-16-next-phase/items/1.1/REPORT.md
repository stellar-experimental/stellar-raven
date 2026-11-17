# Item 1.1 report: drain the upstream handoffs

Lead: Claude Opus 5.5, agentpc `t1r5`.

## Pull request and result

[#456](https://github.com/stellar-experimental/stellar-raven/pull/456), branch
`np/1.1-drain-upstream-handoffs`. It carries `Closes #429`, `Closes #425` and `Refs #427`. I re-ran
every gate bare at `b1e4de09` and each exited 0. CI was pending when I wrote this.

**Retired**

- **sls-033** went to `improvements/resolved.json`. Resolution comments are on stellarlight #519,
  #742 and PR 1967.
- **sls-107** went to `improvements/resolved.json`. Resolution comments are on stellarlight #1900
  and PR 1944. They link both successors: sls-119 (#1971) and the new **sls-120** (BRLT issuer of
  record), which is filed as [stellarlight#1973](https://github.com/Stellar-Light/stellarlight/issues/1973).
- I commented on #425 and #429 with the live result. Each closes when #456 merges.

**Kept, with dated statuses**

- **sls-116:** all three remaining items still reproduce. I posted a dated reply on
  [#427](https://github.com/stellar-experimental/stellar-raven/issues/427#issuecomment-6933957089),
  which stays open.
- **sd-105 to sd-110 and sls-117 to sls-119:** all still reproduce. Fix pull requests are open for
  five of the Docs findings.
- **sd-081:** partly fixed by Docs PR 3083. The `restore-data` `Api` defect remains. I rewrote the
  finding and posted a verification comment on stellar-docs#2562.

**Process.** Every finding was adopted from each review:

- the Fable plan review (18 findings);
- the Fable retirement review, part A, which gated v4;
- the Fable retirement review, part B (three fixes).

**Spend:** USD 0.

**Correction to the round plan:** the sls-033 "cap" was not a judge-facing cap.
- `q-scf-resolve-passport-superseded-slug` had none at all.
- `q-tool-wallets-comparison` had only a judge-blind `truth.notes` sentence. Its judge-facing cap
  left in #436 on 2026-11-14.
- I rewrote that sentence as dated provenance. `golden.*` and `caseInputSha256` are unchanged, so
  the case needs no re-judge.
- The v4 move therefore turned out to be unnecessary for the edit itself, though the
  `golden-truth` skill and the round plan both read the finding as cap-backing. v4 stands because
  the case was opened. A cheaper path existed: a `--hidden` grep of `truth.notes` versus
  `golden.notes`, done before asking. I missed it.

## Deploy

None is needed. No Worker bytes change: only `improvements/`, `eval/`, `test/` and `.agents/` are
touched, and the build is unchanged.

## For the orchestrator on the Mac

1. Copy `~/backups/gca-2026-11-14-split-v4.json` from agentpc. Its SHA-256 is
   `58ad28bb903fcd7c72122de4ca13f93438a42b92a6987dcbce7d6c3f8096c191`, with 81 tuning, 117
   held-out and 49 reserve cases. Any tuning scan now needs
   `--split ~/backups/gca-2026-11-14-split-v4.json`: `TUNING_ROW_COUNT` is 81, so a scan against
   v3 fails its count assertion.
2. Merge #456 when CI is green. No deploy.
3. Item 1.3 id reservation: this item took **sls-120**. The next free ids are **sls-121** and
   **sd-111**.
4. Input for item 1.3 or a later Scout sweep, now a dated TODO line, not verified to the filing
   bar:
   - 5 `Live` wallet rows whose own `availabilityCheck` says the operator is gone;
   - a `q=wallet` paging overlap (196 rows for a total of 195).
5. Item 0.2's Freighter/Varial note: `q-tool-wallets-comparison` already treats the two names as
   one wallet. No action is needed for that case.

## Open questions for the owner

None.

## Housekeeping

- I killed and removed the children `1.1-review` (`t1r6`) and `1.1-retire` (`t1r7`). I kept
  `1.1-exec` (`t1r8`) for CI fixes until you reply.
- The worktree `/home/tyler/code/raven-wt/np-1.1` stays until merge. `.dev.vars` is mode 600 and
  is ignored.
