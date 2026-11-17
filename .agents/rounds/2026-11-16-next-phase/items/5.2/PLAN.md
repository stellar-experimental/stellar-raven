# Item 5.2 plan: owner follow-ups after the round (documentation, corpus rule, one finding)

Lead: Claude Opus 5.5, agentpc `t1ty`. Branch `np/5.2-owner-followups` from `origin/main`
`7dafce0c` (item 5.1 merged, split v8 current). Worktree `/home/tyler/code/raven-wt/np-5.2`.
Inputs: the orchestrator's [NOTE.md](NOTE.md) (binds over ITEM-LEAD.md) and the evaluation
[EVAL-FABLE.md](EVAL-FABLE.md), items A, C, D, E, F, H and I. Both are copied here from
`/home/tyler/code/raven-wt/orch/` so the record is self-contained.

## Decision this item changes

It records seven owner and orchestrator answers of 2026-11-17 and makes the repository follow them:
stellar.org displacement closes as accepted (C); the FAM rows stay put and sealed (D); golden
maintenance may open held-out and reserve cases without moving them (E); the three stellar.org
findings get their dispositions (A); the non-Error throw becomes an upstream finding, not own-repo
work (H); OpenCode stays out of client diagnostics (I); no live surface-hash check after 3.5 (F).
No product code, catalog, gate or golden changes. No deploy.

## Facts re-checked on `7dafce0c`

- `.agents/TODO.md` holds every item NOTE.md names, at these headings: "Priorities" item 3 (cites
  the C item by title), "Audit source coverage" (names `sd-113` among facts no reached source
  holds), "Decide what test earns the sealed FAM confirmation rows", "Treat stellar.org routing
  reach as a lexical and description question" (holds the 3.3 record and the FAM archive pointer),
  "Prove the stellar.org source" (bullets "Routing reach" and "Audit register (done)"), "Decide
  whether golden maintenance may open held-out cases (owner decision)" (says 65 cases, split v8),
  "Preserve structured routing intent across extraction caps and gate tiers", "Triage the runtime
  and client gaps from the HackMeridian telemetry" (last paragraph: the non-Error sentence),
  "Re-check the upstream codemode short-token repair", "Run the OpenCode lane of round item 4.1
  after a re-login (owner)".
- Standing stellar.org numbers (3.3 [MEASURE.md](../3.3/MEASURE.md) baseline, `main` before 5.1):
  off-golden 40 question form at top five 8; non-SDF displacement 0, 1, 3 of 25 at limits 5, 7, 10.
  Not re-measured after 5.1; the reopen trigger is a production transcript, not a probe count.
- `PRESTAGE.md` line 371 points at the held-out-maintenance TODO item by its title.
- No dated brief (`items/1.4/dated/*.md`) tells a lead to move a case it opens. Each lead may open
  only the dated cases (already in tuning since split v5), one staged sibling, and the ids
  `sibling-check.mjs` prints (tuning only; the script reads the split's `sets.tuning`). The closure
  rule leaves an entry at `reopen` when a member is unopenable.
- `@cloudflare/codemode` 0.5.1 (pinned) `dist/index.js:307`: `return { result: undefined, error:
  err.message, logs: __logs };`. `src/executor/run.ts:496-497` treats `result.error === undefined`
  as ok. The browser executor uses `err.message || String(err)` (`dist/browser.js:116`).
- Next canonical-source id: `cs-012` (active max `cs-010`, `resolved.json` max `cs-011`).
  `intake.json` already overrides other codemode findings to `cloudflare/agents`.
- The `improvements-pipeline` skill requires a distinct reviewer only for retiring a finding, not
  for filing one. No further review runs for `cs-012`.

## Steps

1. **DECISIONS.md.** Add "## Follow-up answers (2026-11-17)" after "## Answers", one bullet per
   NOTE.md owner answer, quoting the owner where NOTE.md quotes. E's bullet says it amends answer 2:
   a maintenance lane under the README exception no longer triggers a move.
2. **eval/qa/README.md, "Held-out split".** Insert the EVAL-FABLE rule text (section E) as a new
   paragraph after the paragraph that ends "`split-amend.mjs` holds the checked move.", with any
   tightening the Fable review asks for. Add one sentence: cases already moved (v5 to v8) stay in
   tuning.
3. **.agents/TODO.md** (all edits by heading):
   - C: delete "Treat stellar.org routing reach as a lexical and description question". Rewrite
     "Prove the stellar.org source" → "Routing reach" bullet: closed as accepted (owner,
     2026-11-17); standing numbers above with their source; both ranker mechanisms failed (3.3
     record link); a `search_site` reword moved the cost (8 to 6 of 40); reopen trigger: a
     production transcript where a `stellarOrg` card cost an answer, not another probe count.
     Priorities item 3: drop the pointer to the deleted item, point at the 3.3 record.
   - D: move the FAM development rows' archive pointer (bundle path, ref, file path, full SHA-256
     `0246ad022163…cf89c`, the `~/backups/fd-2026-11-14/split/` copy) into "Preserve structured
     routing intent", as an optional no-loss lane for the next ranker attempt; the move into
     `eval/discovery/` is owed by that attempt. Add: a second copy of `~/backups/fd-2026-11-14/split/`
     is on the Mac (orchestrator, 2026-11-17, hashes checked). Shrink "Decide what test earns the
     sealed FAM confirmation rows" to a hold, retitled "Hold the sealed FAM confirmation rows":
     sealed, spent once, only by an answer-outcome test with its pass rule fixed first; no test is
     planned (decision: no move, sealed and unspent, orchestrator 2026-11-17). Drop the free-count
     paragraph (it changes no decision while no page change is proposed).
   - E: retitle "Decide whether golden maintenance may open held-out cases (owner decision)" to
     "Close the register entries the dated runs leave open". Body: the owner adopted the exception
     (2026-11-17, README link); the dated runs keep their narrow scope (step 4), so a run that
     cannot read every member still leaves its entries at `reopen` and adds its count here; next
     step after 2.2c: one maintenance lane under the exception reads every member of each left-open
     entry and closes or accepts it. Done when the count is zero or accepted. Drop the option 1 and
     2 bullets and the 65-case count.
   - A: "Audit source coverage": Pi Network's relation to Stellar leaves the candidates (one leaf,
     `sd-113` not forwarded, accepted as a fact no reached source holds). "Audit register (done)":
     the owner forwards `sd-111` and `sd-077` to the SDF web team; the orchestrator sets
     `reported-upstream` when the owner confirms; `sd-113` is not forwarded.
   - H: delete the sentence "Out of scope there: … `errorName` never sees it." from the HackMeridian
     item. Add to "Re-check the upstream codemode short-token repair": an upgrade past 0.5.1 also
     re-checks `cs-012` (a non-Error throw reaches Raven as `error: undefined` and is logged ok).
   - I: replace "Run the OpenCode lane of round item 4.1 after a re-login (owner)" with
     "Keep OpenCode out of client diagnostics", body the EVAL-FABLE section I text plus the 2026-11-17
     login fact from NOTE.md (ChatGPT and SuperGrok logins exist on both machines; Anthropic only
     by API key in OpenCode 2.2.7).
4. **Dated briefs.** `items/1.4/dated/PRESTAGE.md` section 1: one paragraph after the held-out rule:
   the README maintenance exception exists; these runs keep the narrower rule above (the
   sibling-check scope and the section 6 closure rule are unchanged); a run moves no case. Fix the
   line-371 pointer to the new TODO title. The four `*-LEAD.md` briefs need no edit (none moves a
   case); `sibling-check.mjs`, the launcher and the timers are untouched. Reason for not widening
   the runs to every register member: the runs are unattended, their scope was rehearsed twice, and
   2.1 has a hard merge deadline (2026-11-25 00:00 UTC); widening changes the script and the
   closure rule six days before the first run with no rehearsal. The left-open entries go to one
   later lane (step 3, E).
5. **improvements/.** One evidence line each, status unchanged:
   - `sd-113`: "Not forwarded (owner, 2026-11-17): out of scope for stellar.org; Pi Network owns the
     fact." Stays `verified`, intake `unclear`; not deleted (ids are never reused).
   - `sd-077`, `sd-111`: "2026-11-17 owner: forward to the SDF web team with sd-077/sd-111; the
     orchestrator sets reported-upstream with the date and channel once the owner confirms it was
     sent."
   - New `improvements/canonical-source/cs-012-codemode-dynamic-worker-non-error-throw.md`,
     `canonical-source`, intake override `cloudflare/agents` (reason: package metadata names it,
     like cs-001). Evidence: the pinned 0.5.1 line, the current npm release's line (re-read the
     public tarball; EVAL says 0.5.6 `dist/index.js:365`), the browser executor's contrast, the
     upstream `main` source line, and the local reproduction (step 6). Recommendation: `err
     instanceof Error ? err.message : String(err)`, the form the package uses elsewhere.
   - Dedupe on `cloudflare/agents` (open and closed issues and PRs: "non-Error", "err.message",
     "throw string", "DynamicWorkerExecutor error undefined"). If a duplicate exists, cite it and do
     not post. Else `npm run improvements:file -- --file … --dry-run`, read it as the maintainer
     (style reference), then post.
   - `npm run improvements:index`.
6. **H verification (free, no model call).** A scratch smoke test, never committed:
   `test/smoke/zz-non-error-throw.test.ts` calling `createExecuteRunner(env)` as
   `test/smoke/executor.test.ts` does, with `async () => { throw "x"; }` and `async () => { throw
   { code: 1 }; }`, asserting the observed outcome (expected `ok: true`, result undefined). Run
   `npx vitest run --config test/smoke/vitest.config.ts test/smoke/zz-non-error-throw.test.ts`, record
   the output in EXEC.md and the finding, delete the file. No `dev:eval` server is needed.
7. **Ledger.** Row for 5.2 in `.agents/rounds/2026-11-16-next-phase.md`: each letter's outcome, F's
   "no action: the 3.5 surface hash is unchanged, so `--expect-sha256` passes on either Worker and
   carries no information", the `cs-012` URL, reviews, USD 0, "Not needed: no Worker bytes change".

## Gates (run bare)

`npm run eval:qa:lint`; `npm run improvements:lint -- --live` (a GitHub URL is added);
`npm run typecheck`; `npm test`; `npm run secrets:scan -- --tree`. `git status` clean of the
scratch test before the commit.

## Stop rule

Done when every step above is committed, gates pass, and `cs-012` is posted (or a duplicate cited).
Stop and report instead of acting if: the reproduction does not show `ok` (then H's premise is
wrong and no finding is filed); any step would need a product code, catalog, gate or golden edit;
or the Fable review shows the dated runs must change scope to stay correct.

## Risks

- The dated leads read PRESTAGE.md unattended. The added paragraph must not widen their scope or
  contradict section 6. Mitigation: it says the narrow rule stands.
- Deleting the C item drops the 3.3 measurement summary from TODO. Mitigation: the ledger row and
  `items/3.3/MEASURE.md` keep it; the "Routing reach" bullet links it.
- The README rule changes who may see held-out content. Mitigation: it binds the lane to trigger,
  write-set and reporting limits and keeps the move for anyone else.
- An upstream post is outward-facing. Standing authority (decision 4); dedupe first.

## Needs from the orchestrator or the owner

- The owner's confirmation that `sd-077` and `sd-111` were sent, so the orchestrator can set
  `reported-upstream` (Mac or any machine).
- Nothing else. No deploy.

## Reconciliation of the Fable review

[REVIEW.md](REVIEW.md): 22 findings (2 blocking). All adopted; where a finding gives text, that text
is used. This section overrides the steps above where they differ.

| # | Severity | Disposition |
|---|---|---|
| 1, 2, 3, 4, 5 | blocking / should-fix | Adopted through finding 6: step 2 inserts the REVIEW.md finding 6 text verbatim in place of the EVAL-FABLE text, and drops the plan's "v5 to v8" sentence (the text's "The exception moves no case back" covers it). |
| 6 | proposed text | Adopted as the rule text. |
| 7 | no change | Agreed: the dated runs keep their narrow scope; the stop condition is not met. |
| 8 | should-fix | Adopted: step 4 uses the REVIEW.md finding 8 paragraph verbatim ("does not apply to these runs", with the exposure file under `~/.local/state/raven-dated/`, which `launch-dated-lead.sh:37` and `watchdog-dated.sh:22` already use). |
| 9 | should-fix | Adopted: the rewritten TODO E item keeps the sentence "Count left open so far: none recorded yet." verbatim, because PRESTAGE section 6 replaces that literal. |
| 10 | should-fix | Adopted: Risks and REPORT.md say merge before 2026-11-23 18:00 UTC; if missed, hold the merge until 2.1 and its follow-ups have merged, then rebase and carry the lead's count into the rewritten item. |
| 11 | agreement | No change. |
| 12 | should-fix | Adopted: the scratch test also calls `new DynamicWorkerExecutor({ loader: env.LOADER }).execute('async () => { throw "x"; }', [])` and records `{ result, error }`. The finding states: executed on 0.5.1; the same template line read, not executed, in 0.5.6 `dist/index.js` and upstream `main` `packages/codemode/src/executor.ts:511`. |
| 13 | nit | Adopted: third case `throw null`; its outcome is recorded, and only the string and object cases are in the stop rule. |
| 14 | nit | Adopted: assert `outcome.ok === true`, record `outcome.result` verbatim; the test source goes into EXEC.md. |
| 15 | should-fix | Adopted: order is write at `verified` with the reproduction → `improvements:index` → commit → push the branch → `--dry-run` → read → post → commit the script's edits → push. The executor may push the branch (not open a pull request). REPORT.md notes the issue's `main` link is dead until merge. |
| 16 | nit | Adopted: `upstreamTitle` "codemode: DynamicWorkerExecutor reports no error when sandbox code throws a non-Error value"; evidence lines carry no round terms or `EXEC.md` paths. |
| 17 | should-fix | Adopted: `sd-113`'s last evidence line is replaced by "Not posted and not forwarded (owner, 2026-11-17): out of scope for stellar.org; Pi Network owns the fact. No owner page undertakes the topic." |
| 18 | should-fix | Adopted: `.agents/TODO.md:77` pointer goes to DECISIONS.md "Follow-up answers (2026-11-17)", and the held-out status gains one sentence on the exception with the README link. |
| 19 | should-fix | Adopted: the section goes before "## Timing" and holds NOTE.md's six bullets; E's bullet uses the finding's wording (answer 2 unchanged). H and F go in the ledger row only. "Seven answers" in "Decision this item changes" reads as six owner answers plus F and H. |
| 20 | should-fix | Adopted: the hold item keeps the sealed set's SHA-256, "the record lists the paths", a Done-when line, and says the Mac copy of `~/backups/fd-2026-11-14/split/` covers both the development and confirmation files (path held by the orchestrator). The moved pointer keeps "the loader now accepts `stellarOrg`, the move changes the routing set, and it needs its own gate run". |
| 21 | nit | Adopted: no plan-step reference in TODO text; the E item says the follow-up lane's brief must claim the exception and override `ITEM-LEAD.md` "Never open a held-out or reserve QA case". |
| 22 | should-fix | Done by the lead before execution: placeholder `.dev.vars` (names only, the CI stub) and `npm run typegen` in the worktree. |
| 23 | nit | Adopted: the scratch test is deleted before `typecheck` and `secrets:scan`; extra stop condition: if upstream `main` is fixed at filing time, record `cs-012` with the fix reference and do not post. |

Added risk (finding 10): merge timing against the 2026-11-23 18:00 UTC timer.
