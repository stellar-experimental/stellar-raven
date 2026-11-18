# Item 8.1 review: the TODO audit plan

Reviewer: Claude Fable 5.2 (documentation tier), high effort, agentpc `t1yh`, 2026-11-18. Read-only.
Reviewed [PLAN.md](PLAN.md) against the orchestrator's `8.1-NOTE.md`, `.agents/TODO.md` at
`bb171055`, the issues, the 1.4, 3.1, 7.1, 7.2 and 7.3 records, and the code the plan cites. No
case file opened, no QA lint, no model call, nothing posted.

Result: 1 blocking, 14 should-fix, 7 nits. The plan's re-checked facts are accurate (list at the
end). The findings are about facts the rewrite could lose, cross-references the executor would
apply wrongly, and items whose trigger or done condition does not match the current state.

Row numbers are the plan's disposition-table rows.

## Blocking

### 1. Two planned deletions remove the only committed copy of a fact

- **Rows:** 26 (Playground output-cap bullet) and 3 (held-out status).
- **Evidence, row 26.** The plan deletes the bullet "with a recorded 'no change'" because "the 3.1
  read found cap stops rare". That observation is committed only in the TODO (line 817).
  `rg -i 'output cap|maxOutputTokens|stopped at'` over `items/3.1/` and the round ledger finds no
  statement of it; the figures are in the owner's private folder. The plan names no record that
  receives it.
- **Evidence, row 3.** Row 3 lists what the new section keeps and deletes only "the amendment
  history". It does not say what happens to the rest of the paragraph at lines 88 to 100. Three
  things there have no other committed home or are rules a TODO writer needs in place:
  - "The audit's battery test read the answers of 70 headline cases before the draw" with its ids
    link. `rg '70 headline'` finds it only in the TODO and in the 0.4 review that discusses the
    TODO.
  - "An item may name a case by ID; never record which set a case is in, and tune no product
    change on a held-out or reserve case."
  - "The baseline and one read per loop ran the held-out rows, counts only", and the stored reads
    on 119 rows (this one is also in the loop 2 ledger, line 473).
- **Change.**
  - Row 26: write the decision and its evidence sentence into DECISIONS.md "Follow-up answers
    (2026-11-18)" (or the 8.1 ledger row): "Playground output cap: no change. The 3.1 production
    read found replies that stopped at `DEMO_CAPS.maxOutputTokens` (4096) rare. Lead's call, open
    to owner veto." AUDIT.md points there.
  - Row 3: add the three lines above to the row's keep list. The split hashes and reasons are safe
    to delete: all of v5 to v11 are in the ledger with full SHA-256 (checked), v3 and v4 in the D2
    and 1.1 rows.

## Should-fix

### 2. Three cross-references in the table point at the wrong rows

- **Rows:** 6 and 26.
- **Evidence.** Row 6 says "Items 22 and 23 point here". Rows 22 and 23 are the codemode
  short-token item and the Scout exposure item. The items that point at the Workers Logs read are
  rows 26 (`recoveryHint`, client loops) and 27 (anomalies), as rows 26 and 27 themselves say. Row
  26 says the client-loop bullet "points at the sign-in watch (item 33)". The sign-in watch is row
  32; row 33 is the WorkOS item.
- **Change.** Row 6: "Items 26 and 27". Row 26: "(item 32)". A Sonnet executor applies the table
  literally, so fix these before the hand-off. Better: cite items by their new heading, because the
  TODO has no numbers.

### 3. The sign-in watch can be read too late, and cannot tell "no rejects" from "no attempts"

- **Row:** 32, and Priorities 2.
- **Evidence.**
  - Workers Logs keep at most 7 days (`docs/operations.md:116`; 3.1 got 6.5 days). The deploy was
    2026-11-18. "On or after 2026-11-25" allows a later read, and each day after 2026-11-25 drops a
    day of the deploy week, where the bare-origin grants fail and a missing scheme first shows.
  - Auth logs only failures: `auth_reject` (`src/auth/workos.ts:529,586,603`) and `oauth_error`
    (`src/auth/gate.ts:110`). There is no success event. A week with no rejects is also what a week
    with no sign-in attempts looks like.
  - The platform rows that would give a denominator (requests to `/authorize`, `/token`,
    `/register` by status) are the `cf-worker-event` rows that returned nothing in 3.1, the same
    unknown the `execute` timeout read has to solve first.
- **Change.**
  - Done condition: "one read on 2026-11-25 (a later read loses deploy days to the 7-day
    retention; if it slips, state the window that was read)".
  - Add a denominator: the count of `/authorize`, `/token` and `/register` requests by status if
    the platform rows can be read; otherwise say the read shows rejects only, and add one positive
    control (a fresh Claude Code sign-in through the `claude:` callback, which the PR 4 report
    already asked for in step 3).
  - Keep one sentence that defines the "known bare-origin class", from the current item: those
    grants get `401` on the token and `invalid_grant` on refresh; a client that re-derives the bare
    origin gets `invalid_target` and cannot sign in. Keep the DESIGN.md D1 link. Without it a
    reader on 2026-11-25 cannot judge "beyond the known class".
  - Say that `redirect_refused:http` (non-loopback http) and `redirect_refused:other` (unparseable)
    are not native-scheme leads (`redirectSchemeToken`, `src/auth/redirects.ts:60`).

### 4. Priorities 2 and 3 are one Mac session, not two

- **Row:** 1 (Priorities text).
- **Evidence.** Both are Workers Logs reads on the Mac, over the same 7-day window, and the
  sign-in read needs the row-type answer the timeout read looks for first (finding 3).
- **Change.** One entry: "One Workers Logs session on the Mac on 2026-11-25: the sign-in watch,
  then the `execute` timeout read with its `recoveryHint`, `skipped`, `errorName` and user-agent
  questions." It also removes a second owner-machine trip.

### 5. Priorities loses the "Round item N" definition that kept items rely on

- **Row:** 1.
- **Evidence.** The current Priorities preamble defines "Round item N" and links the round, its
  plan and DECISIONS.md. The target text drops it. Kept and frozen items say "round item 3.1",
  "round items 2.1 and 2.2", "decision 6(a)" throughout (the frozen "Re-verify" item among them).
- **Change.** Keep that two-line definition, in Priorities or in the header.

### 6. Priorities leaves out two pieces of owner value

- **Row:** 1 and 50.
- **Evidence.**
  - The Freighter and Scout SDK-status goldens (row 12) may be stale since 2026-11-16 and the fix
    is free. A stale golden mis-grades answers. Priority 5 lists eight free fixes and not this one.
  - The OpenAI submission has sat "In review" since 2026-10-23 with the reply an unsent draft, and
    `/terms` still says 30 days (`src/site.ts:1146`). It is owner-blocked and appears nowhere in
    Priorities or Owner decisions.
- **Change.** Add the golden look to priority 5 (or to priority 1 as truth maintenance). Add one
  pointer line under Owner decisions for owner-blocked actions that already have items: the OpenAI
  portal check and reply, the `sk-031` cleanup patch, the `cs-006` contact authorization, the
  auxiliary-Workers question of 2026-10-25. One line each, linking the item; no duplicated text.

### 7. The client-limit item's own trigger has fired; the plan keeps it for the wrong reason

- **Row:** 7.
- **Evidence.** The trigger is "whenever its client version changes". Measured versions: Claude
  Code 2.1.325, Codex 0.167.0, Grok 1.0.77. On agentpc today: `claude --version` 2.1.327,
  `codex --version` 0.169.0, `grok --version` 1.0.88. The plan's reason, "the surface is unchanged
  since 2026-11-14", is about Raven, not the clients.
- **Change.** Rewrite (R): record the three current versions and that the re-check is due. Also
  fix the trigger, because as written it fires every week: re-check before a change to the server
  instructions or tool descriptions, and when a client's release notes name an MCP text limit.
  State the cheapest check (the audit's table method for Grok's 2,033 cut, which the test pin
  depends on).

### 8. The case-file move needs a state trigger, not a date

- **Row:** 41, Priorities 5, and "Facts re-checked".
- **Evidence.** The plan is right that the dated scripts read the path
  (`watchdog-dated.sh:64`, `launch-dated-lead.sh:110`, `sibling-check.mjs:102`). But 2026-12-04 is
  not the end: 2.2c's merge deadline is 2026-12-05 00:00 UTC, and in outcome B or X run 2.1
  schedules `2.1r1` and `2.2ar1` with a due date D of 2026-12-02 or later, each of which can
  extend once more by 7 days (PRESTAGE.md section 4). The installed copies in
  `~/.local/share/raven-dated/` read the same path.
- **Change.** Trigger: "after every dated run and follow-up has merged and
  `systemctl --user list-timers` on agentpc shows no `raven-dated` or `raven-watchdog` unit". Use
  the same wording in Priorities.

### 9. The JSON flush would delete a file a finding cites

- **Row:** 40.
- **Evidence.** 7.1 PLAN.md lines 171-172 and REVIEW.md line 24: the corpus cites 24 of the 109
  files "and `sd-108` cites a 25th", which is why 84 can go (109 − 25). The plan says "the corpus
  cites 24", which leaves 85.
- **Change.** "Remove the files that neither the corpus nor an `improvements/` finding cites (84
  at 7.1: 24 cited by the corpus, 1 by `sd-108`)". The token-only script searches `improvements/`
  too, and the done condition says so.

### 10. The merged Docs-search item rests on evidence older than the titles change

- **Row:** 31.
- **Evidence.** The HackMeridian bullet dates from 2026-10-26. #474 replaced the 666 Algolia-era
  titles with 982 live ones on 2026-11-17, and those titles feed catalog keywords. The bullet does
  not say which search missed: Raven's `search` or `stellarDocs.search_docs`. The contract-id
  evidence is about `stellarDocs.search_docs` (1.3 CLASSIFICATION.md row 18: "reached, not
  surfaced"), which is Mintlify's ranking; 1.3 filed the same class for SEP-7 upstream as `sd-112`.
- **Change.** Keep the two mechanisms apart inside the item. First step: one free re-probe of the
  three pages and the contract-id page on current `main`, recorded per search path. Routing cases
  only for what still misses. State whether the contract-id miss is filed upstream (the `sd-112`
  precedent) or why not. Place the item next to "Point agents at the page" (`sd-059`), which is the
  same surface.

### 11. The release item's new done condition drops its only measurable test

- **Row:** 28, and Owner decision 2.
- **Evidence.** Today: "Done when: probes Q5, R23, R33, and R35 of the HackMeridian review pass
  again, or the owner leaves release data upstream and the finding is filed." The plan's version is
  "that trap is fixed", with no test. The fix is a ranking change while the routing item holds any
  operation-specific exception and holdout top-3 sits on its floor of 26.
- **Change.** Keep the probes as the test. State the ranking fix's gate: a general mechanism or a
  description change that passes `npm run eval:routing -- --gate` with no holdout loss. Add the 3.1
  finding that `getChangelog` ranks first in few searches, so the fix is low value. In Owner
  decision 2, give the Dashboard lumens API its own safe default: not added (no telemetry proxy,
  and 1.3's `sdf-mandate-holdings` row shows it is not needed).

### 12. The Freighter next step asks the lane to look up a case's set

- **Row:** 12.
- **Evidence.** The plan says "under the maintenance exception if a case is outside tuning".
  `eval/qa/README.md` ("Maintenance exception", "Records"): "The lane works by case id and never
  looks up or writes which set a case is in", and the brief claims the exception and names the
  trigger before any case is opened.
- **Change.** "One `golden-truth` lane whose brief claims the maintenance exception and names the
  trigger: an upstream event shown by a primary source (the Docs retitle of 2026-11-16, Scout
  1.9.150)." No condition on the set.

### 13. A 7.3 leftover is missing: the post-deploy host check has no credential

- **Rows:** 48 and 50.
- **Evidence.** PR 3 REPORT.md line 48: "`live-host-check.mjs` was not run after PR 2's deploy. No
  production bearer credential exists on the Mac or agentpc." It is the only free check of both
  wire eras on all three hosts, and two deploys (`fe3708cb`, `9f01ae3e`) went out without it. It
  is in no TODO item and not in the plan. It also touches row 48: the plan ties the first remote
  `npm run mcp-key` run on wrangler 4.164.0 to the OpenAI key revoke, which may be months away,
  while any `create` or `rotate` before then meets the unchecked script first.
- **Change.**
  - Add an owner decision: "A production bearer credential for post-deploy checks. Safe default:
    none; deploy checks stay on the OAuth metadata, the `/mcp` 401 and one connector `execute`."
  - Row 48: say "the next `npm run mcp-key` use of any kind", and note the free part: one
    read-only `wrangler kv key list --binding OAUTH_KV --remote --prefix raven:api-key:v1:` in the
    2026-11-25 Mac session settles the list parse with no write (record the shape only, no key
    name).

### 14. No merge deadline against the 2.1 timer

- **Rows:** "Steps" and the ledger row.
- **Evidence.** The 2.1 lead branches from `origin/main` at 2026-11-23 18:00 UTC and edits the
  TODO. The ledger rows for 5.2, 6.1 and 6.2 each carry "Merge before 2026-11-23 18:00 UTC; if
  that is missed, hold the merge until 2.1 and its follow-ups have merged, then rebase". This plan
  rewrites most of the file and states no such rule. The frozen-anchor gate compares against
  `origin/main`, which a merged dated run would have moved.
- **Change.** Put the same sentence in the plan and the 8.1 ledger row.

### 15. New items have no stated section, and renamed titles are cited by name

- **Rows:** 29, 30, 31, 40, 41, 42, and "Gates".
- **Evidence.** Only row 33 names its section. The TODO cites items by quoted title, which a
  relative-link check does not see: "Ship the cap decisions from the production read" (lines 819
  and 840), "Triage the runtime and client gaps" (line 201), "Audit source coverage" (Priorities).
  Outside the TODO, `research/audits/2026-11-14-caps-audit.md:436` names the section "Caps audit
  follow-ups", `plugins/openai/README.md:8` names "OpenAI plugin submission", and
  `scripts/summarize-npm-audit.mjs:114` names "Dependencies".
- **Change.** Give each new item a section: 29 Routing, 30 and 31 Executor and tool surface, 40 to
  42 Eval instruments. Keep the three section headings above unchanged. Add a gate: every quoted
  item title in the new TODO matches a heading in it.

## Nits

### 16. WorkOS record: the only copy is untracked

- **Row:** 33 and Owner decision 4. An untracked file does not survive `git clean` or a worktree
  removal, and owner decision 8 is "never delete work that hasn't been considered". Add to the safe
  default: "the orchestrator keeps a second copy outside the checkout until it is decided".

### 17. Row 2 is marked K but trims text

- "Trimmed to its links and the ADR-0011 line" is a rewrite. Mark it R so AUDIT.md lists it.

### 18. Row 6: the figures are not in the 3.1 record

- The plan says the deleted caps' "figures are in the 3.1 record". The figures are private; the
  record holds the decisions and reasons (`items/3.1/EXEC.md:36`, ledger row 3.1, and the
  per-call budget in `items/3.2/REPORT.md:14`). The deletion is safe; word the AUDIT.md line that
  way.

### 19. Row 39: drop the line range

- The `it` opens at 1504, the timed loop is 1514 to 1520, and the test continues past 1520, so
  neither "1505-1520" nor "1504-1520" is the block. Name the test by its title and keep the two
  assert lines (1518, 1519).

### 20. Row 43: the offered downgrades changed

- #481's current body lists `@cloudflare/vitest-plugin` (direct) with the fix
  `@cloudflare/vitest-plugin@0.0.0`, beside `agents@0.8.3` and `vitest@3.1.4`. Add it when "Reach"
  is re-measured. The advisory still names no patched version (checked 2026-11-18).

### 21. Owner decision 1 should say why there is no demand evidence

- The deleted item explains it: query and answer text are not logged, so "silence is no measured
  demand, not absence". Carry that clause, and note that the NBU fact already waits upstream as
  `ll-039`, so the testable candidate is the other-chain source.

### 22. One sentence would make Priorities usable for picking work

- After the list: "Everything not named here is a hold, a monitor or waits on its trigger; do not
  start one without its trigger." About 25 of the kept items are of that kind.

## Checked and correct

- Open issues #481, #427, #223; no open PR; each maps to one item (rows 43, 18, 20).
- #167 closed 2026-11-18 00:35:18 UTC with the quoted comment and three triggers.
- Run 44223760712: PR #484's final head `997f8e30`, attempt 1 failure, attempt 2 success; asserts
  at lines 1518 and 1519. The last 40 CI runs passed; no second occurrence.
- `src/auth/redirects.ts:17`, `src/auth/workos.ts:292` and `:543`, `src/site.ts:1146`,
  `eval/qa/heldout-read.sh:52`, `DEMO_GROK_CONTROL_MODEL` `xai/grok-4.6`.
- All six watched log reasons exist in oauth-provider 1.2.4 or `src/auth`.
- cloudflare/agents#2790 closed not planned 2026-11-03; #2809, #2296, #2897 open; PR #2898 open,
  unmerged; stellarlight#1976 and #1952 open.
- npm latest equals `package.json` for codemode, `agents`, oauth-provider, wrangler, the vitest
  plugin, vitest and picomatch; `workers-ai-provider` 4.0.1 is deprecated on npm; no `overrides`;
  one `workerd`.
- The `cs-010` re-run date 2026-11-09 on `agents` 0.33.0 is right (published 2026-11-03).
- Frozen anchors: the four leads, PRESTAGE.md and the scripts read nothing else from the TODO by
  name. `briefs/ITEM-LEAD.md` does not name the TODO. The launcher reads `items.json` and the
  briefs from `origin/main`, which this change does not touch. The ten agentpc timers match the
  dates in the Priorities text.
- Required changes 1 to 4 of the note are all in the plan; findings 3 and 16 refine 1 and 3.
- 7.1 proposals 1 to 5 each land once (rows 40, 41, 42, owner decision 5, row 38).

## Verdict

Approve with changes: fix finding 1 before the executor starts, reconcile 2 to 15, and the plan is
safe for the dated runs and gives a TODO that matches `main`.
