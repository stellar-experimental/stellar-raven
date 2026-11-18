# Item 8.1 plan: audit `.agents/TODO.md`

Lead: Claude Opus 5.5, agentpc `t1yg`, 2026-11-18. Branch `np/8.1-todo-audit` from `origin/main`
`bb171055`. Bound by the orchestrator's `8.1-NOTE.md` and `7-COMMON.md`.

Owner instruction (2026-11-18, verbatim): "sounds good, rewrite for watching, put this and the Your
call items into TODO and audit and ensure that TODO has all the right stuff for the right reasons well
scoped and detailed and accurate to the current state".

## Decision this changes

What the next sessions work on, and in what order. After this PR every TODO item matches `main`
at `bb171055`, the open issues, and the 6.x and 7.x records. Each item states what is wrong, its
current state, its next step or trigger, and "done". No code changes.

## Frozen anchors (timer-launched dated runs read them from `origin/main`)

Runs 2.1 (2026-11-23 18:00 UTC), 2.2a, 2.2b and 2.2c edit the TODO by name. These strings stay
exactly as they are:

- the heading `### Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote`,
  with its bullets `**SCF.**` and `**Bell/P30 Mainnet vote, 2026-11-23 17:00 UTC.**`;
- the heading `### Close the register entries the dated runs leave open` and the literal
  `none recorded yet`;
- the bullet `**Software Versions (not filed).**` and its text under "Improvements follow-up";
- the phrase "held-out status" next to the current split path, because PRESTAGE.md line 10 reads
  "if `.agents/TODO.md` names a later split in its held-out status".

Also kept: the `## Dependencies` heading (named by `scripts/summarize-npm-audit.mjs` and #481's
body), and the client-limit item (named by `test/helpers/mcp-tool-metadata.ts`).

## Facts re-checked on 2026-11-18

- Open issues: #481 (npm audit, picomatch), #427 (sls-116), #223 (live drift). No open PR.
- #167 closed 2026-11-18 00:35 UTC with the comment "Closed as decided: excluded by measurement
  (round items 6.3 and 7.2 …)", and the three re-open triggers.
- Run 44223760712 is PR #484's CI on its final head `997f8e30`: attempt 1 failed, attempt 2
  succeeded. The block is `test/qa-judge-evidence.test.mjs:1504-1520`; the single-sample asserts
  are on lines 1518 and 1519.
- `NATIVE_REDIRECT_SCHEMES` is `src/auth/redirects.ts:17` (`claude:`, `cursor:`, `warp:`). The refusal
  reason `redirect_refused:<scheme>` is logged at `src/auth/workos.ts:543`. The callback keys on
  `auth.user?.id` (`src/auth/workos.ts:292`) through `deriveSubject`.
- `scripts/mcp-key.mjs` on wrangler 4.164.0: `kv key list`, `put` and `delete` all still take
  `--binding`, `--remote`, `--prefix` and `--path` (`--help`). A local `kv key list --binding OAUTH_KV
  --prefix raven:api-key:v1:` returns a JSON array. The script fails closed: a failed list or
  put throws before any credential is written, and `rotate` overwrites without a delete first. Only
  the remote run is unchecked.
- cloudflare/agents#2790 (stream-resume opt-out) was **closed as not planned on 2026-11-03**. The demo
  item still calls it open. `workers-ai-provider` 4.0.1 is marked deprecated on npm. cs-010 is
  cloudflare/agents#2809, still open.
- cloudflare/agents#2296 (`cs-001`) and #2897 (`cs-012`) are open. PR #2898 is open and unmerged.
  Latest versions: codemode 0.5.6, agents 0.33.0, oauth-provider 1.2.4, wrangler 4.164.0,
  vitest-plugin 1.8.4, picomatch 4.0.7. All match `package.json`, or there is nothing newer.
- The dated runs read `eval/qa/cases.json`-family paths (`items/1.4/dated/PRESTAGE.md`,
  `launch-dated-lead.sh`, `watchdog-dated.sh`, `sibling-check.mjs`). So the 7.1 file move has to wait
  until run 2.2c has merged (2026-12-04 or later), not just 2026-11-23.
- `/terms` (`src/site.ts:1145-1147`) still says 30 days for query and response logs. `docs/operations.md`
  says at most 7 days. The OpenAI item stays.
- agentpc has no `rg` in a plain `bash -c`. A Claude lane gets `rg` from Claude Code's shell.
- `gca-eval` still exists. `eval/qa/heldout-read.sh:52` still defaults to it.

## Disposition, item by item

K = keep, R = rewrite, M = merge, D = delete, N = new. Every R, M and D gets a line in `AUDIT.md`.

| # | Section / item | Disp. | What changes |
|---|---|---|---|
| 0 | Header | K | No change. |
| 1 | Priorities | R | Rewritten to the state after 6.x and 7.x, by owner value (see "Priorities text" below). Drop the 3.2/3.3 history and "No mechanism here is pending". Keep the holds sentence. |
| 2 | First-principles intro paragraph | R | Trimmed to its links and the ADR-0011 line. |
| 3 | Held-out status (v5 to v11 bullets, loops paragraph) | R | Becomes its own `## Held-out status` section. It keeps the current split (v11 path, SHA-256, 93/109/45), the "earlier split is stale" rule, the tuning-scan flag, the confirmation-only rule and the maintenance-exception line. The amendment history (v2 to v10 hashes and reasons) is deleted, because the round ledger rows hold every hash and reason; the section links them. Fix: "a future read pairs on v6's 113" becomes "pairs on the current split's 109 held-out rows". |
| 4 | Audit source coverage | R+M | The owner's source choice moves to Owner decisions. The 1.3 class summary is cut to one sentence plus links. The contract-id derivation bullet merges into the new item 31. The item is deleted once both parts have moved; AUDIT.md records where each part went. |
| 5 | Check what the judge saw | K | No change. |
| 6 | Caps audit intro + Ship the cap decisions | R | Renamed "Decide the `execute` timeout from one more Workers Logs read". The three decided caps (keep 50, 24 s shipped in #462, artifact caps kept) are deleted as done; their figures are in the 3.1 record. What remains is `EXECUTE_TIMEOUT_MS` plus the Mac follow-up read. That read is listed once, with every question it answers: wall time of `POST /mcp` over 59 s with its outcome, user-agent families, and the `recoveryHint`, `skipped` and `errorName` keys. Items "Triage the runtime and client gaps" (row 26) and the anomalies item (row 27) point here. |
| 7 | Re-verify each external client limit | K | No change (the surface is unchanged since 2026-11-14). |
| 8 | Carry the guard to absence-of-standard | K | |
| 9 | Watch required-service coverage | K | |
| 10 | Test the `stellarOrg` result rule | K | |
| 11 | Hold the sealed FAM rows | R | Trim the decision history to one sentence with its link. The hash, use rule and done condition stay. |
| 12 | Freighter and Scout SDK-status goldens | R | Drop "(round items 1.1 and 1.3 do not take it)". Next step: one `golden-truth` lane, under the maintenance exception if a case is outside tuning. |
| 13 | Prove the stellar.org source | R | Delete the "Audit register (done)" and "Anchor Directory (done)" bullets (done; recorded in the 1.3 record and #469). Cut the routing-reach bullet to its standing numbers and reopen trigger. |
| 14 | Re-verify the event-tied goldens | K | Frozen anchor. Not edited. |
| 15 | Close the register entries | K | Frozen anchor. Not edited. |
| 16 | sls-024/029 cap-review golden follow-up | K | |
| 17 | Held source ownership and bounty policy | K | |
| 18 | Improvements follow-up list | K | sls-116 already maps #427, and the Software Versions bullet is frozen. Touch nothing else. |
| 19 | Horizon protocol-ceiling monitor | K | |
| 20 | Preserve structured routing intent | R | RWA bullet: state that #167 closed on 2026-11-18 as "decided: excluded by measurement". The 6.3 and 7.2 results shrink to one sentence with three links. The re-open triggers now live here (Scout `/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner product need; no re-run on routine drift). #223 stays mapped here. |
| 21 | Stop schema enum values … / Bind `scout_hackathon_detail` / protocol-history research lane / identity substitution / directory admission | K | |
| 22 | Re-check the upstream codemode short-token repair | R | Delete the last paragraph about #167 (closed; history). |
| 23 | Re-evaluate Scout exposure | R | Cut "Fired 2026-11-16 …" to one "Last fired" line with its link. |
| 24 | Point agents at the page (sd-059) | K | |
| 25 | `codemode.describe` shape | K | |
| 26 | Triage runtime and client gaps | R+M | Split it up. The `matchPartners` re-exposure bullet becomes item 29. The skill-scrub bullet becomes item 30. The Docs-ranking bullet merges into item 31. The Playground output-cap bullet is deleted with a recorded "no change": the 3.1 read found cap stops rare, and the TODO already offered that close. The `errorName` "Shipped" line is deleted (done in #462). The rest stays: `recoveryHint`, the client loops and the Codex/Grok 4.1 findings. The client-loop bullet notes that the 1.x deploy changed the OAuth path, so a repro runs against current production, and it points at the sign-in watch (row 32). The `recoveryHint` read points at item 6. |
| 27 | Soft-empty and skipped-write anomalies | R | The next step points at item 6's read. No other change. |
| 28 | Add a release and package-version source | R | The owner choice (and the Dashboard lumens API under 6(b)) moves to Owner decisions. The item keeps the own-repo part: fixing the `getChangelog` ranking trap. Done when that trap is fixed, and when either the owner's source decision is recorded or the finding is filed. |
| 29 | N: Re-expose `scout.matchPartners` when `sls-123` is fixed | N | Taken from item 26's first bullet: trigger, the four steps and the holdout ceiling, unchanged. |
| 30 | N: Narrow the skill scrub so an excluded operation keeps the skill's workflow | N | Taken from item 26's second bullet. |
| 31 | N: Docs search misses canonical pages | N (M) | Merges the contract-id derivation evidence (item 4) with the HackMeridian Docs-ranking bullet (testnet reset, Custom Account, fee sponsorship). Next step: add routing or retrieval cases first, then only a general mechanism through a free retrieval A/B (`docs/stellar-docs.md`, "Maintenance"). |
| 32 | Re-check Devin CLI sign-in | R | Rewritten as "Watch sign-in rejects after the oauth-provider 1.x deploy" (note, required change 1; text below). |
| 33 | N: WorkOS GitHub sign-in recovery record | N | Note, required change 3 (text below). Authentication section. |
| 34 | Repair `test/live/` suites | K | |
| 35 | Method note: verdict noise | K | |
| 36 | Keep OpenCode out of client diagnostics | K | |
| 37 | p9 gaps / unsupported memory / OOS prompt / capability-boundary monitor / Friendbot monitor | K | |
| 38 | Move the judge-stability register out of `gca-eval` | K | |
| 39 | Timing-ratio flake | R | Note, required change 4. "first CI run of PR #484" becomes "PR #484's CI run 44223760712 on its final head `997f8e30`: attempt 1 failed (8.41 against `< 8`), attempt 2 passed with no code change". Block lines become 1504-1520. Scope and done condition unchanged. |
| 40 | N: Flush the uncited golden-round JSON | N | 7.1 proposal 1. Remove the JSON intermediates that no current artifact cites (84 of 109 at 7.1; the corpus cites 24). Build the list with a committed token-only script that searches the case folders without printing their text. Records-only PR; reviewers read `--stat` only. Done when the files are gone and the script proves nothing cited went. |
| 41 | N: Move the compiled case files into `eval/qa/compiled/` | N | 7.1 proposal 2. `cases.json`, `sample.json` and `tool-cases.json`, about 30 references. Trigger: after run 2.2c has merged (on or after 2026-12-04), because the dated runs read these paths. Done when no `rg -g '*.json'` file entry reaches them from the repo root, and the hook and `.ignore` tests are updated. |
| 42 | N: Wire the case-search guard into Codex and Grok | N | 7.1 proposal 3. Codex 0.169 has a Claude-shaped `PreToolUse` deny; its payload field names are unverified. Grok 1.0.88 has a hook dispatcher, not yet investigated. Done when each CLI denies the hook's probe set in a live probe, or the item records why one cannot. |
| 43 | Picomatch / #481 | R | Re-measure "Reach": `dist/server.js` on `bb171055` (the executor builds and counts `picomatch` occurrences, which should be 0), and picomatch 4.0.7 is still the latest on 2026-11-18. Done condition unchanged. |
| 44 | Move wrangler, miniflare and the plugin together | R | Already current after #483 and #485. Add a done condition so it fits the header rule: "Delete when the plugin no longer pins `wrangler` exactly". |
| 45 | Move the demo off `workers-ai-provider` | R | cloudflare/agents#2790 was closed as not planned on 2026-11-03, so `createAI` keeps stream resume with no opt-out and the "reviewed decision covers stream resume" clause stands. Name cs-010 as cloudflare/agents#2809 (open). Say that `workers-ai-provider` 4.0.1 is marked deprecated on npm. |
| 46 | xAI `strict` field | K | |
| 47 | `sources.locate`, `retrieve`/`read`, auxiliary Workers | K | |
| 48 | OpenAI exception | R | Fold in the `mcp-key` check: the revoke step names the remote `kv key list` as the first remote run of `npm run mcp-key` on wrangler 4.164.0. It fails closed. If it errors, fix the script before revoking. |
| 49 | Remove the OpenAI verification Worker | K | |
| 50 | Owner decisions | R | "None open" is replaced by the list below. |

### Owner decisions (new entries; each with question and safe default)

1. **Which source, if any, to test for the facts no reached source holds.** Today that is the XRP
   Ledger facts (`ecosystem.chain-comparisons`) and the NBU statement (`ll-039`). Pass condition,
   fixed in advance: more correct answers and no more wrong ones. Safe default: test none. The gaps
   stay recorded in the 1.3 classification.
2. **Release and package-version data, and the Dashboard lumens API (decision 6(b)).** Options: an
   upstream Scout request (filed in `improvements/`), or a new host adapter (an ADR-0003 exposure
   change). Safe default: leave release data upstream and file the request. The `getChangelog`
   ranking fix (item 28) proceeds either way.
3. **The MCP Skills extension** (SEP-2640, MCP SDK 2.4; from 7.3 PR 2's report). It could publish
   Raven's pinned ecosystem skills through native client skill listing and reading. Its `attach`
   is experimental. A new client-visible surface falls under ADR-0003, so it needs an owner
   decision, a design study and a measured A/B. Safe default: not started.
4. **The WorkOS recovery record.** Commit it (and with what redaction) or discard it. See the
   Authentication item (33). Safe default: it stays untracked on the Mac until the recovery is
   confirmed.
5. **Install ripgrep on agentpc** (owner, needs sudo; 7.1 proposal 4). Safe default: Claude lanes use
   the `rg` from Claude Code's shell, and other lanes use the `git grep` exclusion form in
   `eval/qa/README.md`.

### Priorities text (target)

1. Dated truth maintenance, timer-started: run 2.1 on 2026-11-23 18:00 UTC must merge before
   2026-11-25 00:00 UTC; runs 2.2a, 2.2b and 2.2c follow on 2026-11-30, 2026-12-01 and 2026-12-04.
   After them comes the register maintenance lane.
2. Sign-in watch: one Workers Logs read of the week after the 1.x deploy, on or after 2026-11-25.
3. One more Workers Logs read on the Mac. It decides the `execute` timeout and supplies the inputs for
   the anomaly item and the client-gap item.
4. Owner decisions (the list at the end).
5. Free own-repo fixes that need no paid measurement: the timing flake, the `test/live/` suites,
   the judge-stability register move, the skill-scrub narrowing, the card binding, the golden-round
   JSON flush, the hook wiring, and the case-file move after 2026-12-04.

Holds stay: no third tuning loop, no paid run without a new written owner authorization, and the
general routing repair stays held for new mechanism evidence.

### Sign-in watch item (required change 1, target content)

Heading: `### Watch sign-in rejects after the oauth-provider 1.x deploy`. Content, in plain
sentences:

- What changed at deploy `9f01ae3e` (#484, 2026-11-18): one provider per served origin; the
  native-callback allowlist (https, loopback http, `claude:`, `cursor:`, `warp:`); the root
  protected-resource document now answers 404; and grants bound to the bare origin (fewer than 10,
  all Devin CLI) are no longer honored. The orchestrator accepted the bare-origin loss under the
  owner's 7.3 delegation ("decide and execute what sticks"). The owner does not use Devin. Devin CLI
  is one of many third-party DCR clients.
- What to watch in Workers Logs:
  - `auth_reject` with `redirect_refused:<scheme>`: a real client's scheme missing from
    `NATIVE_REDIRECT_SCHEMES` (`src/auth/redirects.ts`);
  - `oauth_error` `grant_audience_unbound`, `token_audience_unbound` or `invalid_target` beyond the
    known bare-origin class;
  - `legacy_grant_resource_mismatch` and `resource_not_configured`.
- Baseline: the orchestrator's 150-second tail right after the deploy showed none of these, only one
  `token_not_found`.
- A refused scheme is a lead, not proof of demand. Add a scheme by name, and only for a real client.
- Rollback target: `fe3708cb`. It is storage-compatible, but it strands a CIMD `private_key_jwt`
  client.
- Done when one read of a week of logs after the deploy, on or after 2026-11-25, shows no unexplained
  rejects, or each one is fixed or recorded.

### WorkOS item (required change 3, target content)

Heading: `### Confirm the WorkOS GitHub sign-in recovery and decide its record`. It names no person,
email or WorkOS ID. Content:

- One person's GitHub sign-in reaches an older, unverified WorkOS user instead of their active one.
- WorkOS support confirmed this is expected behavior, not a defect.
- The owner approved and sent a reply asking support to remove only the GitHub link from the older
  user.
- Still outstanding: support's confirmation of the removal, and the person's verified GitHub
  sign-in.
- Raven's callback keys on the WorkOS user ID (`src/auth/workos.ts`), so no Raven code change
  follows.
- The record is an untracked file on the Mac checkout,
  `research/audits/2026-11-17-workos-github-email-collision.md`. It is not on agentpc and is not
  recreated here.
- Owner decision 4 covers whether to commit it, and with what redaction.
- Done when the recovery is confirmed and the record is committed or discarded.

## Other files

- `DECISIONS.md`: a new section, "Follow-up answers (2026-11-18)". It holds the owner's quote above;
  #167 closed as "decided: excluded by measurement" (the orchestrator, on the owner's 7.2 instruction);
  and the oauth-provider 1.x D1 (one provider per origin) and D2 (native-callback allowlist)
  choices, made by the orchestrator under the owner's 7.3 "decide and execute what sticks",
  including the accepted bare-origin loss.
- The round ledger: one row for 8.1.
- `items/8.1/AUDIT.md`: every R, M, D and N row from the table, with a one-line reason each.
- `items/8.1/EXEC.md` and `REPORT.md`.

## Steps

1. Lead (done): worktree, fact checks, this plan.
2. Fable review of this plan, written to `REVIEW.md`. The lead reconciles every finding here.
3. A Sonnet executor applies the reconciled table to `.agents/TODO.md`. It writes `AUDIT.md`,
   `EXEC.md`, the DECISIONS.md section and the ledger row, runs the gates, and makes one commit (or a
   few), never with `--no-verify`.
4. The lead reads the full diff, re-runs the gates bare, pushes, and opens one records-only PR with
   `Refs #481`, `Refs #427` and `Refs #223` and no closing keyword. Then the report.

No further required review: there is no code, no exposure change, no security boundary, and no
finding retirement.

## Gates

Records only, so the gates are: `npm run typecheck`, `npm test`, `npm run build` (unchanged bytes),
`npm run secrets:scan -- --tree`. Also: a check that the four frozen anchors are byte-identical to
`origin/main` (a `diff` of the extracted sections), and a link check of every relative link in the
new TODO (a script that resolves each `](path)` target). No eval, no QA lint, no model call. USD 0.

## Stop rule

The work stops when every TODO item has a disposition in AUDIT.md and the gates pass. If a fact
cannot be settled from the repository, the issues or a free public read, the item records it as
unknown with its next check. The lead does not guess, and does not ask the owner for something the
TODO can carry as an owner decision.

## Risks

- **Breaking a dated run's anchor.** Guard: the frozen-anchor diff.
- **Losing a fact by deleting history.** Guard: each deleted history line is checked against the
  ledger row or the item record it moves to, and AUDIT.md names that target.
- **Naming a case's set, or case text.** The TODO keeps only the case ids it already names. No new
  case id is added. No case file is opened.
- **Personal details in the WorkOS item.** Guard: no name, email or ID, and the lead checks the
  final diff for them.
- **Scope creep into code.** A defect found during the audit becomes an item, not a fix.

## Needs from the orchestrator or owner

None to start. The report will list the owner decisions as written. It will also flag one judgment
call for owner veto: closing the Playground output-cap bullet as "no change".

## Review reconciliation (Fable, [REVIEW.md](REVIEW.md), 22 findings: all adopted)

These rules override the table and the target texts above wherever they differ. The executor
applies them.

1. **Blocking, adopted.** Row 26: the Playground output-cap "no change" decision goes into
   DECISIONS.md "Follow-up answers (2026-11-18)", with this text: "Playground output cap: no change. The
   3.1 production read found replies that stopped at `DEMO_CAPS.maxOutputTokens` (4096) rare. Lead's
   call, open to owner veto." AUDIT.md points there. Row 3: the new Held-out status section also
   keeps three things: "The audit's battery test read the answers of 70 headline cases before the
   draw" with its ids link; "The baseline and one read per loop ran the held-out rows, counts only",
   with the stored reads on 119 rows; and the rule "An item may name a case by ID; never record which
   set a case is in, and tune no product change on a held-out or reserve case."
2. **Adopted.** The cross-references are fixed in the table. The executor cites items by their new
   heading, never by row number.
3. **Adopted.** Sign-in watch:
   - Done condition: one read on 2026-11-25, because Workers Logs keep at most 7 days and a later read
     loses deploy days. If the read slips, it states the window it read.
   - A denominator: count `/authorize`, `/token` and `/register` requests by status if the platform
     rows can be read. Otherwise the record says the read shows rejects only, and one positive control
     is added: a fresh Claude Code sign-in through the `claude:` callback.
   - Keep the known-class sentence: bare-origin grants get `401` on the token and `invalid_grant` on
     refresh, and a client that re-derives the bare origin gets `invalid_target`. Keep the DESIGN.md
     D1 link.
   - Say that `redirect_refused:http` (non-loopback) and `redirect_refused:other` are not native-scheme
     leads (`redirectSchemeToken`, `src/auth/redirects.ts`).
4. **Adopted.** Priorities 2 and 3 become one entry: "One Workers Logs session on the Mac on
   2026-11-25: the sign-in watch, then the `execute` timeout read with its `recoveryHint`, `skipped`,
   `errorName` and user-agent questions, and the read-only remote `kv key list` for `mcp-key`
   (finding 13)."
5. **Adopted.** Keep the two-line "Round item N" definition and its links at the top of Priorities.
6. **Adopted.** Priority 5 gains the Freighter and Scout SDK-status golden look. Owner decisions
   gains a short "Owner-blocked actions" pointer list, one line each with a link to the item: the
   OpenAI portal check and reply, the `sk-031` cleanup patch, the `cs-006` contact authorization, and
   the auxiliary-Workers question of 2026-10-25.
7. **Adopted.** Row 7 becomes R:
   - Record the current agentpc versions (Claude Code 2.1.327, Codex 0.169.0, Grok 1.0.88) against the
     measured ones (2.1.325, 0.167.0, 1.0.77), and say the re-check is due.
   - New trigger: before a change to the server instructions or tool descriptions, and when a client's
     release notes name an MCP text limit.
   - Name the cheapest check: the audit table's method for Grok's 2,033-character cut, which the test
     pin depends on.
8. **Adopted.** Row 41 trigger, used in Priorities too: "after every dated run and follow-up has
   merged and `systemctl --user list-timers` on agentpc shows no `raven-dated` or `raven-watchdog`
   unit". The installed copies under `~/.local/share/raven-dated/` read the same paths.
9. **Adopted.** Row 40: "Remove the files that neither the corpus nor an `improvements/` finding
   cites (84 at 7.1: 24 cited by the corpus, 1 by `sd-108`)". The script searches `improvements/`
   too, and the done condition says so.
10. **Adopted.** Row 31:
    - Keep the two mechanisms apart: Raven `search` routing, and `stellarDocs.search_docs` ranking
      (Mintlify).
    - First step: one free re-probe of the three HackMeridian pages and the contract-id page on
      current `main` (after the #474 titles), recorded per search path. Routing cases only for what
      still misses.
    - State that the contract-id miss is not filed upstream, and that the `sd-112` precedent applies
      if the re-probe shows a Mintlify ranking miss.
    - Place the item next to "Point agents at the page when a docs hit has no body".
11. **Adopted.** Row 28:
    - Keep the probes Q5, R23, R33 and R35 as the test.
    - The ranking fix needs a general mechanism or a description change that passes
      `npm run eval:routing -- --gate` with no holdout loss. Add the 3.1 finding: `getChangelog` ranks
      first in few searches, so the fix is low value.
    - Owner decision 2: the Dashboard lumens API gets its own safe default, "not added" (no telemetry
      proxy, and 1.3's `sdf-mandate-holdings` row shows it is not needed).
12. **Adopted.** Row 12: "One `golden-truth` lane whose brief claims the maintenance exception and
    names the trigger: an upstream event shown by a primary source (the Docs retitle of 2026-11-16,
    Scout 1.9.150)." No condition on the set.
13. **Adopted.**
    - New owner decision: "A production bearer credential for post-deploy checks
      (`research/audits/2026-11-06-remaining-sweep/live-host-check.mjs`, not run after the 7.3
      deploys). Safe default: none; deploy checks stay on the OAuth metadata, the `/mcp` 401 and one
      connector `execute`."
    - Row 48: "the next `npm run mcp-key` use of any kind". The free part runs in the 2026-11-25 Mac
      session: one read-only `wrangler kv key list --binding OAUTH_KV --remote --prefix
      raven:api-key:v1:`. Record the output shape only, never a key name. That check lives in a short
      Dependencies item, "Confirm `npm run mcp-key` on wrangler 4.164.0", not in the OpenAI item;
      the OpenAI revoke step points to it.
14. **Adopted.** The 8.1 ledger row and the PR body carry: "Merge before 2026-11-23 18:00 UTC; if
    that is missed, hold the merge until 2.1 and its follow-ups have merged, then rebase and re-run
    the frozen-anchor check."
15. **Adopted.**
    - Sections for the new items: 29 Routing; 30 and 31 Executor and tool surface; 40, 41 and 42
      Eval instruments.
    - These headings stay unchanged: "Caps audit follow-ups", "OpenAI plugin submission" and
      "Dependencies".
    - When an item is renamed, every quoted title that cites it is updated.
    - New gate: every quoted item title in the TODO matches a heading in it.
16. **Adopted.** WorkOS safe default: "the orchestrator keeps a second copy outside the checkout
    until it is decided".
17. **Adopted.** Row 2 is now R.
18. **Adopted.** The AUDIT.md line for row 6 says the decisions and reasons are in
    `items/3.1/EXEC.md`, the 3.1 ledger row and `items/3.2/REPORT.md`, and the figures are private.
19. **Adopted.** Row 39: name the test by its title and keep the assert lines 1518 and 1519. No block
    range.
20. **Adopted.** Row 43: add the offered `@cloudflare/vitest-plugin@0.0.0` downgrade, and that the
    advisory names no patched version (2026-11-18).
21. **Adopted.** Owner decision 1 carries "query and answer text are not logged, so silence is no
    measured demand, not absence". It notes that NBU waits upstream as `ll-039`, so the testable
    candidate is an other-chain source.
22. **Adopted.** After the Priorities list: "Everything not named here is a hold, a monitor or waits
    on its trigger; do not start one without its trigger."
