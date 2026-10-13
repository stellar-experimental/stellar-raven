CHANGES-NEEDED

Codex RS reviewed commits `087cc6b5` and `7087abdf` against `6891dca2` on 2026-10-13.
Both original defects have live fixes. The retirement preparation needs the corrections below.

1. **P2 — PR #2367 still needs a resolution comment.**

   Evidence: `/private/tmp/claude-501/w1013/s-comments.md:15` marks this reference as not applicable.
   The round ledger repeats that decision.
   The improvements-pipeline skill requires a resolution comment on every upstream reference.
   It permits the exception only for a finding that was never filed.
   Both findings contain Raven's reports on PR #2367.
   Both resolver receipts include PR #2367.
   ElliotFriend's closing comment only says that #2837 supersedes it.
   It contains neither the deployed verification result nor the final source snapshots.
   The rule against unnecessary comments concerns untouched open issues.
   It does not remove the retirement requirement for this closed PR.

   Fix: prepare one short joint resolution comment for #2367.
   Include the dated live result, PR #2837, and both commit-pinned source links.
   Correct the comment matrix and round ledger.
   The final operator must post and read back comments before using `--upstream-commented`.

2. **P2 — The refreshed golden evidence still asserts the old defect as current.**

   Evidence: `eval/qa/corpus/battery/tooling-infra/q-tool-smart-wallet-repos-discovery.json:116` retains the archived-pointer claim.
   That sentence calls the guide current and calls `sd-034` active.
   The same `truth.verified` block now carries the date `2026-10-13` and records the opposite live result.
   The generated `eval/qa/cases.json` repeats the contradiction.
   This claim has no explicit historical date, unlike adjacent retained evidence.

   Fix: label the old observation with its original date and its superseded status, or remove it.
   After retirement, update the pending-review and active-file statements to the resolved receipt and committed source snapshot.
   Regenerate the compiled corpus and reconcile the affected register hashes.
   Keep the answer, keyFacts, avoid, and notes unchanged.

3. **P3 — The prepared comments do not meet the required writing style.**

   Evidence: comment C, line 49, starts with a 28-word sentence about recommendation coverage.
   Comment D, line 57, puts the URL, timestamp, counts, and several marker phrases into one long sentence.
   Its final sentence on line 59 also exceeds 20 words.
   Comment A's smart-wallet bullet contains seven sentences.
   The resolver's suggested comments also contain very long evidence sentences and passive retirement wording.

   Fix: separate the marker results into short sentences or table rows.
   Use active retirement wording, such as “Raven will retire both findings.”
   Replace the placeholders and describe the completed independent review when posting.
   Give each notification comment its source snapshot or the posted joint resolution reference.
   The drafts contain no credentials or partner-tier details.

I fetched the five requested GitHub bodies with `gh api ... --jq .body`.
I also read their comments, the resolving PR's reviews, its checks, and both deployment runs.
The saved responses are in `tmp/rs-evidence/`.

| Reference | Verified state |
|---|---|
| stellar/stellar-docs#2837 | Merged 2026-10-12T20:37:44Z; commit `2dd75fef3ea318d19cf8af8a261a2a37c4701982` |
| stellar/stellar-docs#2700 | Closed as completed 2026-10-12T20:37:45Z |
| stellar/stellar-docs#2367 | Closed without merge 2026-09-09T19:35:25Z; ElliotFriend named #2837 as its replacement |
| stellar-experimental/stellar-raven#275 | Open; ElliotFriend reported the sd-034 fix |
| stellar-experimental/stellar-raven#276 | Open; ElliotFriend reported the sd-027 fix |

PR #2837 has approvals from xw-dd and kaankacar. Its ten reported checks passed.
Deployment run `38305457471` succeeded for the merge commit at `2026-10-12T20:42:52Z`.
Run `38421582672` succeeded for `b3cb1c5a642e092f90e7bef242ebfe6885a58006` at `2026-10-13T15:27:28Z`.
Issue #2700 has one comment, from kalepail, correcting the earlier premise.
The author correctly distinguished that comment from maintainer approval.

I fetched the live pages independently with `curl -sS -L -A Mozilla/5.0` at `2026-10-13T16:30:14Z`.
Every page returned HTTP 200. Their bytes matched the author's recorded hashes.
The original Python fetch returned HTTP 403; the successful curl requests supplied the evidence below.

| Page | Last-Modified | SHA-256 |
|---|---|---|
| Guestbook passkeys-prerequisites | Tue, 13 Oct 2026 15:26:14 GMT | `c3ff53d1f9bf0acad20a321cfe53facfdf4fa1386572fc4d52cd2296fbcf7281` |
| Smart-wallets guide | Tue, 13 Oct 2026 15:26:16 GMT | `72dc8d81c99522f1d7e900e6d1fe0223d8d724758a7b38908e40d0d6eebbc0c9` |
| OpenZeppelin Relayer | Tue, 13 Oct 2026 15:26:40 GMT | `bfe350bc5d6aa191881f7be57c15995bdcffb21cab884a0cf68d87bcbcd88879` |
| Guestbook overview | Tue, 13 Oct 2026 15:26:14 GMT | `3af13231c4446ffbf0b94b7decb8fcf05d32e98e351c61ae2970cfbc52dd6416` |
| Check-auth tutorials | Tue, 13 Oct 2026 15:26:15 GMT | `4430d66101451349065762e37b290b33371069a7ba1c2df78adbe3794daa1c86` |

The prerequisites contain 0 LaunchTube matches, 3 Smart Account Kit matches, and 4 Channels key-generation URL matches.
They contain one JWT match, in “no JWT to fetch.”
The submission, credential lookup, and `smart-account-indexer` markers each occur once.
The page requires one relayer API key and clearly separates submission from indexing.

The smart-wallets page contains 0 archived-pointer matches and 2 matches for each canonical repository URL.
It contains each authorization-boundary marker and the independent-audit caveat once.
It contains 0 predecessor, successor, or legacy matches.
Its article presents sibling SDKs and retired LaunchTube tooling.
These counts independently reproduce every current marker in both handoff tables.

I also fetched the remaining four Guestbook tutorial pages at `2026-10-13T16:31:34Z`.
All returned HTTP 200, with 0 LaunchTube matches and 0 archived-pointer matches.
Their headers, hashes, bodies, and metadata remain in `tmp/rs-evidence/guestbook-*`.
I read the seven Guestbook source files at upstream commit `b3cb1c5a642e092f90e7bef242ebfe6885a58006`.
The frontend and setup pages preserve the local-cache versus hosted-indexer distinction.

The adjacent findings need notes, without successors:

- The Relayer page lacks the requested link to the role explanation. It correctly limits its service description to submission.
  The Guestbook now explains indexing explicitly. The missing link is an editorial improvement, without a remaining contradictory instruction.
- The check-auth link credits the original author's example. Source line 617 confirms that purpose.
  It does not recommend the archived repository as the current SDK installation target.
  Retaining this historical credit does not reproduce the model-selection defect.
- The smart-wallets article makes one component-specific unaudited statement about Passkey Kit.
  It claims no shared audit for Smart Account Kit, the relayer, or the indexer.
  An exact-release audit statement remains optional because the page asserts no positive audit coverage.
- The Guestbook overview calls Passkey Kit a sibling and links the model-selection explanation.
  Its educational-use caution remains present. I found no residual of either original defect in the tutorial.

I ran `rg -n "sd-027|sd-034" .` and separately searched `.agents`.
The intake overrides and index entries correctly remain until the resolver runs.
Neither finding has a probe to remove.
The dated research and older round records can retain historical references.
The current TODO and round ledger correctly identify unfinished retirement work, except for the #2367 exception above.
No committed Algolia rule references either ID. I did not inspect live Algolia settings.

I compared parsed golden objects against `6891dca2` after removing `truth.verified` from both objects.
Every remaining field matched exactly, including all judge-facing fields.
I inspected the affected register members in clusters 022, 105, and 131.
Their model-selection and audit boundaries remain consistent.

Both resolver dry runs passed and reproduced the author's receipt fields.
The source commit is `087cc6b5a863811d8311ad0ed15a5f4746d0f773` for both findings.
Both public raw snapshots already resolve and exactly match the local finding files.
The draft's claim that these snapshots are unavailable is now stale.
Keep these exact pins unless a new committed finding version requires new pins.

The dry runs do not prove that comments exist or that cleanup completed.
The resolver code appends the receipt, removes the intake override, deletes the finding, and regenerates the index.
Its dry-run receipts contain the required fields and correct upstream references.
Actual cleanup remains pending under this review's read-only scope.
Comments are required on #2700, #2837, #2367, #275, and #276 before retirement.

| Required check | Result |
|---|---|
| `npm run improvements:lint` | Passed; 73 findings |
| `npm run improvements:lint -- --live` | Passed; live intake checked |
| `npm run eval:qa:lint -- --stale --enforce-floors` | Passed; 0 errors, 62 warnings |
| `npm run eval:qa:register -- --check` | Passed; up to date |
| `npm run secrets:scan -- --tree` | Passed; no leaks |

I changed no tracked files, posted nothing, pushed nothing, and made no paid model calls.
The worktree remains clean. This review does not authorize retirement until the findings above are reconciled.

REVIEW-EVIDENCE: Codex RS re-derived sd-027/sd-034 live fixes, upstream state, residual decisions, reference cleanup, comments, and checks on 2026-10-13.
