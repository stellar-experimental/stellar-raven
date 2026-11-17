# Fable evaluation: owner follow-ups after the next-phase round (2026-11-17)

Evaluator: Claude Fable 5.2, agentpc `t1tk`, on `main` `9b1a483b`. Read-only: no repo edit, no
model call, no credentialed call. Public reads only: nine `stellar.org` GETs and the public
`@cloudflare/codemode` 0.5.6 tarball. No QA case was opened; the FAM backup files were hashed, not
read.

| Item | Verdict |
|---|---|
| A `sd-077` | Act: forward to SDF |
| A `sd-111` | Act: forward to SDF |
| A `sd-113` | Close: do not forward |
| B `scout.matchPartners` | Act now, on the owner's yes to a holdout ceiling of 11 |
| C stellar.org displacement | Close as accepted |
| D FAM rows | Do nothing: no move, set stays sealed |
| E maintenance exception | Adopt (rule text below) |
| F live surface-hash check | Do nothing |
| G `SERVICE ERRORS` wording | Act only as a ride-along in B's pull request |
| H non-Error throw | Drop here; one upstream finding |
| I OpenCode lane | Do nothing: keep OpenCode out |

## A. Three unposted stellar.org findings

**`sd-077`: act, forward.** It belongs. Both pages exist to say who can apply, and they disagree
about a pre-launch project. Rechecked today: the index still says "with a live product", the
Marketing Grants page still carries "preparing to launch soon". Work is one internal message.
After it is sent, set `reported-upstream` with an evidence line naming the date and channel (the
README accepts "a GitHub issue, or an equivalent"; lint needs no URL for that status). Golden: no
change, it already accepts both wordings.

**`sd-111`: act, forward in the same message.** It belongs. The register's job is to list audits by
project, and 4 of 77 records have no project. Rechecked today: still four "Unnamed record" titles.
The record ids are Airtable ids, so the audit-bank data owner fixes it in minutes; the web team may
only relay it. Same status handling. Raven side: nothing. `scout.listAudits` already returns Blend's
audits.

**`sd-113`: close, do not forward.** The owner's doubt is right for this one. It is not a defect in
any page: no Stellar page undertakes to compare networks, the facts are Pi Network's, and the
README says a missing result does not make stellar.org the owner. Asking SDF to name another
network on its site is a communications choice, not a fix.

- Status: keep the file at `verified`, intake `unclear`, and add one evidence line: "Not forwarded
  (owner, 2026-11-17): out of scope for stellar.org; Pi Network owns the fact." Do not delete it.
  `sd-113` is the highest id, and ids come from "the next number above", so a delete lets the id be
  reused. `declined-upstream` does not fit: lint requires a GitHub decline reference.
- Raven side: accept `wallets.pi-network` as a fact no reached source holds. It is one leaf, so it
  does not earn a source; drop it from the candidates in "Audit source coverage". I propose no
  golden edit, because I did not open the case.

Also update the "Audit register (done)" bullet in "Prove the stellar.org source".

## B. `scout.matchPartners`

**Verdict: act now, remove it. The owner's yes to this item is the authorization the re-baseline
needs.**

**Why.** The operation failed on nearly every call in both production reads and answers 503 today.
Every call costs a wasted operation and usually a second `execute`. The cost on the other side is
one row of 49 on a blind lane, moved by corpus statistics, with every legacy, extended, skills and
protocol-history grade identical and the holdout rank totals identical. The holdout grades the top
five, and the public page shows seven. That is the rare isolated event, and the broken operation
is the cost paid on every partner question.

**Is the ceiling move legitimate?** Yes, as an explicit re-baseline.

- ADR-0009 does not govern it. That ADR keeps discovery lexical and says a ranking mechanism's gain
  cannot offset a gate failure. This is an exposure change under ADR-0003 that claims no routing gain.
- The governing rule is `run-evals` section 6 and the `gates.json` comment: re-baseline only for a
  named reason ("drift, a deliberate policy change"), in the same commit, with the per-case check
  and provenance. Removing a non-working operation is a deliberate policy change. The Scout
  1.9.116 and Mintlify re-baselines are the precedents.
- The ceiling of 10 is a ratchet set to the observed count, with zero headroom. It is "a
  no-regression vector, not a target" (`run-routing.mjs`).
- What would not be legitimate: reading the flipped row to argue it is harmless, editing a holdout
  case, or keeping 11 after the operation returns.

**If act (about an hour, USD 0):**

1. Start from commit `b4a74b8f`. Its branch was deleted, but the object is still in the agentpc
   clone, unreferenced: run `git branch np/matchpartners b4a74b8f` before a gc drops it. Otherwise
   follow item 3.2 `EXEC.md`: one line in `EXCLUDED_SCOUT_OPERATIONS`
   (`src/policy/scout-exposure.ts`), the normal rebuild, and the listed test retargets.
2. `eval/gates.json`, same commit: the manifest fingerprint; holdout `forbiddenCaptures` 11 and
   `passed` 24; `maxForbiddenCaptures` 11. The dated note states the reason, the zero graded
   change on the other four lanes, "counts only", and that the change which re-exposes the
   operation restores 10.
3. `test/search.test.ts:631`: Scout hits 2 to 1. `scout.getLeaderboard` stays, so the test's
   stated intent holds.
4. Gates: `npm run eval:routing -- --gate`, `typecheck`, `test`, `build`. Review: Codex frontier,
   which re-runs the runner on both manifests. Then deploy.
5. File one Scout finding (`improvements-pipeline`): the hosted match endpoint has answered 503 on
   every observed call since 2026-10-26. No active finding covers it. Its fix is the re-exposure
   trigger.

## C. stellar.org displacement

**Verdict: close as accepted. There is no compromise worth having.**

**Why.** The measured harm is small: a `stellarOrg` card displaces a non-SDF card on 0, 1 and 3 of
25 questions at limits 5, 7 and 10, always as backfill at ranks 6 to 9 on a short page, so the card
it displaces is the page's weakest. Both general ranker changes failed the no-loss rule. The one
lever left is the `search_site` description, and a reword already measured as moving the cost
(reach 8 to 6 of 40). A `stellarOrg`-only backfill rule is the per-slice fitting the owner ruled
out. The source is little used in production.

**If act (documentation only):** delete the TODO item, record "closed as accepted, 2026-11-17" in
the round ledger, and rewrite the "Routing reach" bullet in "Prove the stellar.org source" with
the standing numbers (reach 8 of 40 at top five; displacement 0, 1, 3 of 25). Reopen only on a
production transcript where a `stellarOrg` card cost an answer, not on another probe count.

## D. FAM development rows and the sealed confirmation set

**Verdict: do nothing. No move, and the set stays sealed and unspent.**

**Why.** The move into `eval/discovery/` changes the routing set and needs its own gate run and
fingerprint re-baseline. With C closed, nothing reads the rows. Holding the sealed set costs
nothing; retiring it destroys a single-use asset for no gain. The free transcript count changes no
decision while no page change is proposed.

**If act (same documentation pass as C):**

- Move the development rows' archive pointer (bundle ref, path, SHA-256 `0246ad02…`) into the held
  item "Preserve structured routing intent", as an optional no-loss lane for the next ranker
  attempt. The move into `eval/discovery/` is owed by that attempt, not before.
- Shrink "Decide what test earns the sealed FAM confirmation rows" to a hold: sealed, spent once,
  only by an answer-outcome test with its pass rule fixed first; no test is planned.
- One risk for the owner: every copy of both sets is on agentpc (`~/backups/fd-2026-11-14/split/`
  and the branch bundle). Both hashes match today. A copy on the Mac's private folder is cheap.

## E. Golden-maintenance exception (option 2)

**Verdict: adopt.** It is less work than option 1, not more.

**Why.** Option 1 moves a case at every `reverifyBy`. 65 of the 159 cases outside tuning carry one,
so the held-out set loses exactly its time-sensitive cases. The split is stratified by freshness,
and live and fresh questions are where Raven is weakest, so option 1 drains the stratum the read
most needs. It also costs a split amendment each quarter. Option 2 costs one paragraph. A
maintenance edit changes the answer key because the world changed; it tunes nothing. The dated
leads can also read every register member, which ends the entries left at `reopen`. Decide before
2027-01-14.

**Rule text** (`eval/qa/README.md`, "Held-out split", after the paragraph on moving a seen case):

> **Maintenance exception.** A golden-maintenance lane may open and edit a held-out or reserve
> case without moving it, when all of these hold:
>
> - The trigger is outside Raven: a `reverifyBy` date, a source sentinel, or an upstream event. An
>   edit prompted by a Raven answer, transcript, or verdict on that case is not maintenance, and
>   that case moves to tuning.
> - The lane and its reviewer change only the corpus, the register, and their compiled outputs.
>   They change no product code, catalog, prompt, rubric, or judge pack in that session or pull
>   request.
> - The lane works by case id and does not look up which set a case is in. Its report, ledger, and
>   TODO entries carry ids and counts, never golden text.
> - Nobody else reads the case or the diff. The orchestrator merges on the review verdict and CI.
>
> Anyone outside the lane and its reviewer who sees the content still triggers the move above. A
> held-out read reports, as a count, the cases whose golden changed since the read it pairs with.

Also: record the choice as an owner decision in the round ledger, and delete the TODO item once
the left-open register entries are closed. Cases already moved (v5 to v7) stay in tuning. Gate:
`npm run eval:qa:lint`; no code changes.

## F. Live surface-hash check after the 3.5 deploy

**Verdict: do nothing.**

**Why.** The check cannot tell the new deploy from the old one. Item 3.5 left the surface hash
unchanged, so `--expect-sha256 42ec6102…` passes on either Worker. `--expect-source-revision`
cannot be used in production: `__RAVEN_SOURCE_REVISION__` is defined only by
`scripts/run-eval-server.mjs`. The documented post-deploy checks (`docs/operations.md`: Version
ID, landing page 200, `/health` 200, `/mcp` 401) do not include it. Running it means minting a
non-expiring, full-access named key on the Mac for a check that carries no information.

Use the check where it has value: after a deploy that is meant to change the surface, from a
machine that already holds a key.

## G. SERVICE ERRORS wording

**Verdict: a real conflict, a small one. Fix it only as a ride-along in B's pull request.**

**Why.** When every call fails, the block says "inspect or retry the failures before broadening".
The timeout hint says "Do not retry it in this script. Report this source as unavailable", and
the 503 hint says "do not retry". No measured answer was lost to it. Its common trigger today is a
script that calls only `scout.matchPartners`, which B removes. What remains is an all-calls-timeout
script, which is rare. It does not earn its own pull request or deploy.

**If act:** two strings in `src/mcp/tools.ts` (the SERVICE ERRORS and INCONCLUSIVE SERVICE OUTCOMES
blocks): replace "inspect or retry the failures" with "follow each failure's hint", and "inspect or
retry errors" with "follow each error's hint". No test pins either phrase. Gates: `typecheck`,
`test`, `build`.

## H. A non-Error throw is logged as `ok`

**Verdict: drop it as own-repo work. File one upstream finding and delete the TODO sentence.**

**Why.** It is an upstream one-line defect: the Dynamic Worker executor returns
`error: err.message` (`dist/index.js:365` in 0.5.6, the current release; `:307` in the pinned
0.5.1). The browser executor in the same package already uses `err.message || String(err)`.
Models rarely throw a bare string, and the cost is one mislabelled event. A local wrapper would
change `src/executor`, with the smoke lane and a review, for that rare event.

**If act:** a `canonical-source` finding against the codemode repository, verified by one free
local `throw "x"` run. Add a clause to "Re-check the upstream codemode short-token repair" so the
upgrade re-checks it.

## I. OpenCode lane

**Verdict: do nothing. Recommend the owner keeps OpenCode out of client diagnostics.**

**Why.** No pending decision depends on it.

- The two open questions from item 4.1 are closed: M2 and the runner rule.
- The models are already measured in their own CLIs.
- OpenCode's static behaviour is already measured: the server instructions reach the system prompt
  whole and the tools are listed up front (`2026-11-14-client-text-limits.md`).
- The one question a same-model lane could answer is whether Codex's `execute` without `code` is
  Codex or Terra. The record already answers it: all three failures are rows where the model never
  saw the descriptions.
- It is not just a run. The brief, the smoke pass rule and `prices.json` assume Anthropic and
  Sonnet, and the reader's OpenCode path has never read a real transcript.

**If the owner wants it anyway:** GPT-6.1 Terra through the ChatGPT login, so the client is the
only variable against the Codex lane. Expect about USD 1 for 24 rows at Codex's rate. Not Grok:
it stopped at the cap after 20 rows.

**TODO text** (replace the item, or record it in the ledger and delete the item):

> OpenCode stays out of client diagnostics (owner, 2026-11-17): no decision depends on it. Reopen
> on a production signal: OpenCode in the user-agent read, or a reported OpenCode failure. Then run
> GPT-6.1 Terra through the ChatGPT login, smoke first, under a new spend authorization, after the
> brief and the smoke rule are rewritten for that provider.
