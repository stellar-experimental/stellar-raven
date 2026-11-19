# Executor brief: item 8.10 corrections and the item 8.9 close-out

You are the Claude Sonnet executor for round item 8.10. The lead is Claude Fable in terminal `t20j`.
Work only in `/home/tyler/code/raven-wt/np-8.10`, on branch `np/8.10-audit-8.9`. Everything here is
documentation: no file under `src/`, `test/`, `eval/lib/`, `scripts/*.mjs` or any generated file
changes. If an edit seems to need one, stop and report.

Read first: `AGENTS.md`, then [`../AUDIT.md`](../AUDIT.md) (the reasons for every fix below).

## Rules that bind

- Search only with `rg --hidden -g '!.git' <pattern> [path]`. Never `grep -r`, `git grep`, `rg -u`,
  `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
  `.agents/rounds/`. Never open a file under `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`,
  `sample.json`, `tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`, or the two golden round
  folders (`.agents/rounds/2026-11-02-golden-audit/`, `.agents/rounds/2026-11-14-golden-coverage-audit/`).
  Never run the QA lint (`npm run eval:qa:lint`). Name no case id you did not find in this brief.
- Never print a secret, `.dev.vars`, or an environment dump.
- No subagents and no model-calling command.
- `.agents/TODO.md` frozen anchors stay byte-identical (timer-launched runs read them): the heading
  `### Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote` with its
  `**SCF.**` and `**Bell/P30 Mainnet vote, 2026-11-23 17:00 UTC.**` bullets; the heading
  `### Close the register entries the dated runs leave open` and the literal `none recorded yet`;
  the bullet `**Software Versions (not filed).**`; the `## Held-out status` section; the
  `## Dependencies` heading; the client-limit item. Do not edit any of them.
- In `eval/qa/README.md`, the `### Held-out split` heading and the Maintenance exception block stay
  unchanged. In `golden-truth/SKILL.md`, change only the one sentence named below.
- Do not edit anything under `.agents/rounds/2026-11-16-next-phase/items/1.4/` or any other item's
  records. Dated records stay as they are.
- Write plain, short sentences in the style of the file you edit. Keep each file's line width.
- Commit with the normal hooks, never `--no-verify`. Do not push and do not open a pull request.

## A. Fixes from the audit

### F1. `eval/qa/README.md`: the Codex row and the "does not stop" clause

In the table under "**The agent `PreToolUse` hook.**", replace the Notes cell of the Codex row with:

> Runs when Codex is launched with `--dangerously-bypass-hook-trust`, which the launch line in
> [`.agents/model-roster.md`](../../.agents/model-roster.md) carries. Probed live with that flag in
> the main checkout and in worktrees that `~/.codex/config.toml` does not list as trusted. Without
> the flag, Codex runs a project hook only after it is approved in `/hooks`; treat such a session as
> unguarded.

(One table cell on one line, like the other rows.)

In the paragraph "**What the guard does not stop.**":

- replace "a Codex session in an untrusted worktree or without hook trust" with "a Codex session
  launched without `--dangerously-bypass-hook-trust` or `/hooks` approval";
- replace "untrusted Codex/Grok sessions and other CLIs rely on the rule in `AGENTS.md`" with "those
  sessions and other CLIs rely on the rule in `AGENTS.md`".

Change nothing else in that file.

### F2. The Codex launch lines

- `.agents/model-roster.md`, "Launch lines": in the Codex line, add `--dangerously-bypass-hook-trust`
  directly after `--no-daemon`. In the "**Codex**" bullet below it, add: the flag makes Codex run the
  project hook in `.codex/hooks.json` (the case-search guard); without it Codex skips the hook unless
  it was approved in `/hooks`. Add one sentence that an Antigravity (`agy`) lane needs no flag for
  `.agents/hooks.json`, and that Grok runs `.grok/hooks/` in a trusted folder.
- `.agents/rounds/2026-11-16-next-phase/briefs/ITEM-LEAD.md`, the Codex launch line in "Children":
  add the same flag directly after `--no-daemon`. Change nothing else there.

### F3. `scripts/README.md`

After the `scripts/agent-hooks/` line, add one entry in the same style:
`find-uncited-golden-round-json.mjs` lists the JSON files in the two golden round folders that no
case file, QA register or `improvements/` finding cites. It prints paths and counts and never opens
a listed file. `npm test` fails while a file is uncited; `--uncited` prints the list to `git rm`.

## B. Close-out edits

### B1. `.agents/TODO.md`

1. Delete these eight items, each from its `###` heading to the line before the next heading:
   - "Bind the `scout_hackathon_detail` card to its operation"
   - "Narrow the skill scrub so an excluded operation keeps the skill's workflow"
   - "Repair the `test/live/` suites against current code"
   - "Move the pinned judge-stability register out of the `gca-eval` worktree"
   - "Stabilize the timing-ratio assertion in `test/qa-judge-evidence.test.mjs`"
   - "Flush the uncited golden-round JSON"
   - "Wire the case-search guard into Codex and Grok"
   - "Move the playground blind-packets test out of a record folder"
2. In "Owner decisions", delete decision 5 ("Install ripgrep on agentpc") and renumber decision 6
   to 5. `ripgrep 15.1.0` is installed at `/usr/bin/rg` on agentpc (the ledger records it).
3. "Priorities", point 4: it now names only the work that is still open. Rewrite it to: the Freighter
   and Scout SDK-status golden look, and the case-file move once every dated run and follow-up has
   merged and `systemctl --user list-timers` on agentpc shows no `raven-dated` or `raven-watchdog`
   unit. Keep the sentence about the timers word for word.
4. Item "Move the compiled case files into `eval/qa/compiled/`": its first paragraph says a
   non-Claude lane's glob can reach the files and "The case-search hook covers Claude Code only."
   Rewrite those two sentences: the files sit where an unguarded session's `rg -g '*.json'` glob
   can reach them; the hook denies that glob in Claude Code, Codex, Grok and Antigravity where it is
   active (`eval/qa/README.md`, "Searching without reading case text"), but a session without the
   hook is not stopped; moving them closes that hole at the source. Leave the trigger and "Done
   when" as they are.
5. Add this item in "## Executor and tool surface", where the scrub item was:

   ```markdown
   ### Align the skill scrub with the emitted-text guard

   `src/skills/scrub.ts` and `scripts/emitted-text-guard.mjs` guard the same boundary (ADR-0003) and
   differ in three places. None can leak, because each case fails closed in one of the two, but a
   difference costs a failed build or a silently dropped line where a scrub would do
   ([scrub review](rounds/2026-11-16-next-phase/items/8.9/scrub/REVIEW.md), "Pre-existing"):

   - the scrub matches an excluded path case-sensitively, and the guard lowercases first;
   - the guard's path list leaves out `SCOUT_PATHS_ABSENT_FROM_SPEC` (`/api/repos`), which the scrub
     covers;
   - the scrub's fence toggle ignores the fence kind, so a `~~~` line inside a backtick fence ends
     the fence.

   A fourth point comes from the round item 8.10 audit
   ([AUDIT.md](rounds/2026-11-16-next-phase/items/8.10/AUDIT.md)). The trailing-`or` rule can change
   a sentence's meaning, because it also drops a qualifier that follows the excluded alternative. A
   re-pin review reads the upstream diff, not the served sentence. A pinned count of narrowed
   sentences in `test/skill-scrub.test.ts` would make a new narrowing fail `npm test` at the re-pin.

   Trigger: the next change to either file, or the next `stellar-light` re-pin. A change to served
   text is model-facing and needs the served-text check.

   Done when: the two matchers agree on letter case and on the path set, the fence toggle matches
   the fence kind, and a new narrowing fails a test until someone has read the served sentence.
   ```

6. Add this item in "## Eval instruments", where the register item was:

   ```markdown
   ### Decide whether `partialRecoverySource` stays

   `partialRecoverySource` and `isHarnessTransportFailure` in
   `eval/qa/diagnostic-rejudge-source.mjs` have one caller:
   `research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs`, the orchestrator of a
   study that `research/audits/2026-11-09-playground-product-decision.md` closed as superseded.
   `npm test` no longer runs that folder (round item 8.9). `test/diagnostic-rejudge-source.test.mjs`
   still tests `partialRecoverySource`: one accepting case and twelve rejection branches.

   Next: delete both functions and their tests and accept that the superseded orchestrator no
   longer loads, or keep them and record why. Deleting removes a capability of a dated record, so
   the owner or the lead decides first.

   Done when: the functions have a live caller, or they and their tests are gone with the decision
   recorded.
   ```

   Before you write it, check each fact with `rg` (the two function names, the two `research/`
   paths) and correct the item if a fact differs.

Do not add an item about where the env-gated replay tests live; the audit declines it.

### B2. Round ledger `.agents/rounds/2026-11-16-next-phase.md`

Add one row after the 8.8 row, in the table's format, for item 8.9. Facts (write them as one row;
link each PR as the other rows do, `https://github.com/stellar-experimental/stellar-raven/pull/<n>`):

- Item: `8.9 free fixes and test reduction (owner follow-up)`.
- Lead: orchestrator (Claude Opus 5.5, Mac `t40j`); eight parallel lanes on agentpc, each Gemini 4
  Neon in Antigravity 1.5.12, each reviewed by Claude Opus 5.5 in Antigravity.
- PRs and results:
  - `register` #499: `eval/qa/heldout-read.sh` defaults to `/home/tyler/raven-data/qa/judge-stability.json`
    with the same pin; register and 24 stored QA result files copied, 25 of 25 SHA-256 matches. After
    the merge the orchestrator removed the `gca-eval` worktree on agentpc; backups in
    `~/backups/raven-next-phase/gca-eval-2026-11-19` (ignored-files tar, bundle of its detached
    commit `361ff2ef`, SHA256SUMS) and branch `keep/gca-eval-361ff2ef` in the agentpc clone.
  - `live` #500: both `test/live/` suites pass again; all four failures were deliberate contract
    changes, no `src/` change.
  - `flake` #501: the URL-scan linearity test counts work, not time; 20 of 20 runs; 
    `qaImplementationSha256` changes.
  - `flush` #502: 80 uncited golden-round JSON files removed, 34 kept as cited (30 by file, 4 by the
    `gap/` folder), by `scripts/find-uncited-golden-round-json.mjs`; `npm test` fails if one becomes
    uncited.
  - `cards` #503: grading rule 4 binds a `<noun>_detail` card to `get<Noun>`/`get_<noun>`; every
    routing and skills card now binds, with a test. Accepted evidence per `eval/gates.json`: legacy
    `cardHit5` 113 to 114 of 182, no loss, no other lane changes, GATE PASS.
  - `scrub` #504: the served `stellar-scout` skill keeps its partner-filter step (step 4) and the
    `getPartner` "Use when" sentence with `scout.matchPartners` excluded; two rounds, the second cut
    `scrub.ts` from 807 to 354 lines on the orchestrator's instruction; served text checked; routing
    gate unchanged.
  - `hooks` #505: the case-search guard is wired into Codex (`.codex/hooks.json`), Grok
    (`.grok/hooks/case-search-guard.json`) and Antigravity (`.agents/hooks.json`); Grok probe 4 of 4,
    Antigravity 3 of 3 after the probe caught a deny-all bug; the lane's `codex exec` probe did not
    load the hook. Orchestrator's Codex probe, 2026-11-19 (`gpt-6.2-sol`, low effort, ChatGPT login,
    no API key in the environment, with `--dangerously-bypass-hook-trust`): in the main checkout
    `grep -r` and a positive `rg -g '*.json' … eval` were denied with the guard message and the
    control `grep -n` ran (exit 0); in a fresh detached worktree off `origin/main`, `grep -r` was
    denied.
  - `tests` #506: 182 to 176 files, 4,304 to 4,150 tests, `npm test` 48.7 s to 18.0 s (median of 3);
    `research/**` excluded from vitest; INVENTORY.md names each removal's guard.
- TODO items closed: the eight deleted in B1, plus owner decision 5 (ripgrep 15.1.0 is at
  `/usr/bin/rg` on agentpc, installed 2026-11-19).
- Model calls: eight Antigravity lanes and nine Opus reviews on the subscription; three hook probes
  (Codex `gpt-6.2-sol`, Grok `grok-4.7`, Antigravity `gemini-4-neon`) and the orchestrator's Codex
  probe. USD 0 API.
- Lane lesson: the `cards` lane was interrupted once, when Antigravity went idle while a background
  `npm test` ran; it resumed from its conversation ID.
- Item folder: `2026-11-16-next-phase/items/8.9/`.
- Deployed column: `scrub` only: deployed 2026-11-19, Version `d860f844`; the other seven change no
  Worker bytes.

Do not add the 8.10 row; the lead adds it.

### B3. The hook wording

- `AGENTS.md`, hard rule "Search without opening case text": replace the sentence "A Claude Code hook
  denies these; Codex and Grok lanes rely on this rule." with: "A `PreToolUse` hook denies these in
  Claude Code, Codex, Grok and Antigravity; `eval/qa/README.md` gives each CLI's condition (Codex
  needs the roster's `--dangerously-bypass-hook-trust`). The rule binds a session whether or not its
  hook is active." Re-wrap that bullet only. Change nothing else in `AGENTS.md`.
- `.agents/skills/golden-truth/SKILL.md`: in "Case text stays out of searches by default (`.ignore`
  files and a Claude Code hook).", replace "a Claude Code hook" with "a `PreToolUse` hook in Claude
  Code, Codex, Grok and Antigravity". Nothing else.
- `.agents/README.md`, the path table: add a row after `model-roster.md`: `hooks.json` holds
  Antigravity's `PreToolUse` hook config, which runs the case-search guard
  (`scripts/agent-hooks/case-search-guard.mjs`); the other CLIs' configs are `.claude/settings.json`,
  `.codex/hooks.json` and `.grok/hooks/case-search-guard.json`; lifetime Durable.

### B4. `usage/README.md`, "Owner data stays outside the repository"

The paragraph says two private local Git repositories sit beside the repository. Reword it so that
it introduces private directories on the owner's machines, of which the first two are local Git
repositories with no remote. Add a third table row: `/home/tyler/raven-data/qa` (on agentpc) holds
the pinned judge-stability register and the stored QA results, which contain held-out verdicts;
`eval/qa/heldout-read.sh` reads the register from there by default; never open or commit them.
Keep the two existing rows word for word.

### B5. `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`

Add a section before `## Timing`:

```markdown
## Follow-up answers (2026-11-19, free fixes and their audit)

- **Free fixes and test reduction** (round item 8.9). Owner (2026-11-19), verbatim: "sounds good, do
  all of this in parallel, use the new agy antigravity cli with Neon for all of this in parallel with
  hc, ensure you test, eval and ensure. Also run a lane to reduce the amount of tests especially
  overlap, meaningless, overdone to reduce load there if reasonable"
- **Audit of that work** (round item 8.10). Owner (2026-11-19), verbatim: "Once all of this work is
  done plan to spawn a fable hc agent to carefully review all completed work and ensure it was done
  well, correctly, completely and wasn't over or underfit for it's task. Likely all good but worth an
  assessement and correction with Sonnet where neccesary"
- **Applied.** Item 8.9 ran eight parallel Antigravity lanes (pull requests #499 to #506). Item 8.10
  is the audit: [items/8.10/AUDIT.md](items/8.10/AUDIT.md).
```

The two quotes are verbatim, spelling included. Do not correct them.

## C. Finish

1. Check your work: every heading you deleted is gone (`rg -n '^### ' .agents/TODO.md`), no frozen
   anchor changed (`git diff origin/main -- .agents/TODO.md` shows none of them on a `-` line), no
   link you added is dead (each relative path exists), and
   `rg --hidden -g '!.git' -n 'Claude Code hook|covers Claude Code only' AGENTS.md .agents/TODO.md .agents/skills .agents/README.md eval/qa/README.md`
   finds nothing.
2. Run each gate bare, one command per call, no pipe: `npm run typecheck`, `npm test`,
   `npm run build`, `npm run secrets:scan -- --tree`. Report each exit code. A failure you did not
   cause: rerun once, then report it with its output.
3. Write `.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md`: what you changed per file, each
   gate's result in one line, and any deviation from this brief with its reason.
4. Commit everything on `np/8.10-audit-8.9` (include the untracked `items/8.10/` folder; `tmp/` is
   ignored). End the commit message with
   `Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>`, using the exact name of the
   model you are, as your system prompt gives it.
5. Run `hc send t20j '/home/tyler/code/raven-wt/np-8.10/.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md'`.
   If you are blocked or unsure about an edit, send the question the same way and stop.
