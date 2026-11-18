# Item 8.4 report: families everywhere

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t1z6`, 2026-11-18. Branch
`np/8.4-families-everywhere` from `origin/main` at `b623d5ac` (#494).

## Pull request and result

[#495](https://github.com/stellar-experimental/stellar-raven/pull/495), one PR. No issue applies,
so it has no `Refs`.

- **Roster.** The dated-brief exception is gone. Codex and Grok launch lines read
  `M=$(node <wt>/scripts/latest-model.mjs <family>) && echo "resolved: $M" && hc run ...`, so the
  resolved ID appears on screen for the record. A failed resolution or launch takes the tier
  fallback. The old rule was "fall back to the previous model", which needed a version picked by
  hand.
- **`briefs/ITEM-LEAD.md` and the dated briefs.** This covers `items/1.4/dated/{2.1,2.2a,2.2b,2.2c,rehearsal}-LEAD.md`.
  - The briefs name families: Claude Opus and Sonnet, Codex Astra and Sol, Grok.
  - Codex and Grok resolve at launch.
  - Each lane writes its own exact model name in the commit trailer.
  - A new fail-closed sentence: "Never type a model version by hand."
  - Only model lines changed. The 2.2a, 2.2b and 2.2c hunks are byte-identical to 2.1's.
- **Gauntlet.** `DEFAULT_MODELS` takes Terra and Grok from `DEMO_CATALOG_LATEST`. One Sonnet
  literal stays in the script, because the Worker never uses Sonnet. Fable judged that putting it
  in `src/` would cost a deploy and a Playground semantic hash move for no gain. The test now checks
  which clients are in the default matrix. The Playground primary and fallback pins stay; they
  guard that the deployed models move only with a measured verdict.
- **TODO.** The catalog-bump item is updated. **DECISIONS.md** records the owner's instruction,
  verbatim, in "Follow-up answers (2026-11-18)", and that it supersedes 8.3's choice to leave the
  dated briefs pinned.
- **Scope change mid-item.** Per your instruction I dropped note item 5 and reverted my edits to
  `eval/qa/gateway-judge.md` and `AGENTS.md` to `origin/main`, in a forward commit. The branch
  touches none of the files that 8.6 owns.
- **Records left as they are.** `usage/report-site/src/launch.js:64` names the reviewer of a dated
  launch-report snapshot. The other records stay too: the TODO measurements, PIN-REVIEW rows,
  `eval/gates.json` notes, `plugins/openai` evidence, fixtures, and test version strings used as
  fixtures.
- **Reviews.**
  - Claude Fable plan review (`claude-fable-5-2`, high, `t1z8`): 10 findings, all adopted.
  - Sonnet executor (`claude-sonnet-5-5`, `t1zb`).
  - Codex workhorse diff review (`gpt-6.2-sol`, high, `t1zc`): approve with changes. It raised
    1 should (the roster's "fall back to the previous model" line) and 1 nit; both are adopted.
- **Gates.** I ran each one bare at the final head: typecheck, `npm test` (4283 passed), build,
  `eval:selftest` and `secrets:scan -- --tree`. All pass. `eval:qa:lint` and `eval:qa:register`
  are left to CI under the case rules. No model-calling eval and no paid call ran. USD 0.

## Deploy

**Not needed.** `dist/server.js` is byte-identical to the `origin/main` build. No `src/` change.

## Dated runs (2.1 fires 2026-11-23 18:00 UTC)

- **Nothing to refresh on agentpc.** The installed `~/.local/share/raven-dated/launch-dated-lead.sh`,
  `watchdog-dated.sh` and `schedule-followup.sh` are byte-identical to their copies on main.
- **Merge #495 before 2026-11-23 18:00 UTC and the 2.1 lead reads the new briefs.** The launcher
  runs `git fetch origin`, cuts the worktree `np-<key>` from `origin/main` when it fires, and points
  the lead at the brief inside that worktree. So the brief, `ITEM-LEAD.md` and
  `scripts/latest-model.mjs` all come from the same snapshot. The launcher already starts
  `claude --model opus`. The units need no change.
- **The resolver works on agentpc.** I checked it from a launcher-like
  `env -i HOME=... PATH=<launcher PATH>` shell, where `node` is `/usr/bin/node`:
  - Codex cache `fetched_at` 2026-11-18T22:08Z: `sol` gives `gpt-6.2-sol`, `astra` gives
    `gpt-6.2-astra`, `terra` gives `gpt-6.1-terra`.
  - Grok cache `fetched_at` 2026-11-18T22:08Z: `grok` gives `grok-4.7`.
  - With a missing cache it exits 1, and the `&&` chain launches nothing.
- **Live proof.** This item's Codex review ran on the byte-exact Codex line the dated briefs now
  carry, including the `systemd-run` scope wrapper, and resolved `gpt-6.2-sol`. The Grok line got
  an `echo`-for-`hc` dry run.
- **No measurement changes.** In the dated runs, Codex Sol is the golden re-derivation reviewer and
  Grok is its fallback, followed by Claude Opus. No dated run calls a model for an eval or
  re-judges stored rows (each brief's "Spend" override and PRESTAGE section 1). A newer reviewer
  model therefore changes no measurement.

## For the orchestrator

- **Merge #495** before 2026-11-23 18:00 UTC. No deploy is needed.
- **Hand to item 8.6.** `AGENTS.md` line 94 still says "a dated brief's explicit launch line stays
  as written". After this PR that clause contradicts the roster and the briefs. I reverted my edit
  to it because 8.6 owns `AGENTS.md`. Please have 8.6 drop the clause.
- **Outside the repo.** `/home/tyler/code/raven-wt/orch/7-COMMON.md` still says "a Sonnet 5.5
  child".
- **CLI configs.** These are reported, not edited.
  - **agentpc Codex.** `~/.codex/config.toml` has `model = "gpt-6.2-astra"`, which is the newest
    Astra today. Dropping the key would not give Astra. The Codex default follows its own catalog
    ordering, where `gpt-6.2-sol` has priority 1, so the default is a different family. Keep the
    key and move it when a new Astra lands. Launch lines always pass `-m`, so the key only affects
    unflagged `codex` runs.
  - **agentpc Grok.** `~/.grok/config.toml` has no `default` key, so the CLI uses its own default.
    Only `grok models`, a network read, shows that default; I did not run it. The newest in the
    cache is `grok-4.7`. Launch lines always pass `--model`.
  - **Mac.** I cannot read the Mac configs from here. Check `~/.codex/config.toml` for `model` (it
    should be `gpt-6.2-astra` if it is meant to be the frontier tier) and `~/.grok/config.toml` for
    `default` (`grok-4.7`). The resolver reads the Mac's own caches when run on the Mac.
- **AI Gateway catalog** (keyless docs read, 2026-11-18). The newest IDs are `openai/gpt-6.1-terra`
  (there is no 6.2 Terra), `anthropic/claude-haiku-5.5`, `anthropic/claude-sonnet-5.5` and
  `xai/grok-4.7`. `DEMO_CATALOG_LATEST` is current, so there is no bump and no model-facing change.
  `openai/gpt-6.2-sol` is listed in the catalog. That matters only if 8.6 keeps any gateway path.

## Open questions for the owner

None.
