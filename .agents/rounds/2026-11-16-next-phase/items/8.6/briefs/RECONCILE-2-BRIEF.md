# Item 8.6 reconcile 2 (executor)

Reconcile `items/8.6/CODEX-RECHECK.md` (Codex `gpt-6.2-sol`, CHANGES). Same rules as before; no model
call. Lead decisions:

1. **Blocking, judge settings.** Do not write a settings-file reader. Isolate the judge instead:
   `buildJudgeArgs` adds `--setting-sources ""` (the answering agents already launch with it), and
   `assertJudgeSubscription` probes with the same flag, so launch and probe both load no settings file.
   Reason: a judge should not depend on the operator's settings, and this closes the settings-file
   endpoint override for both. Check offline (`claude auth status --json` only) that a synthetic project
   `.claude/settings.json` with a Bedrock switch no longer changes the judge probe, and add a regression
   test that `buildJudgeArgs()` and the judge probe args contain `--setting-sources ""`. Update any test
   that pins the judge argument list. Remove the "settings file" limitation sentence from
   `eval/EVALS.md` and say instead that judges and answering agents load no settings file. In the TODO
   item "Run the judge self-test on the resolved judge model", add one line: the judge also launches with
   `--setting-sources ""` since item 8.6, which the same self-test covers. This changes `judge.mjs`, so
   the judge identity hash changes; say so in EXEC.md. No other judge flag changes.
2. **Should, `apiProvider`.** Require `apiProvider === "firstParty"` exactly; refuse missing, null and
   non-string with fixed text. Check offline that the installed CLI's genuine subscription status
   includes `apiProvider: "firstParty"` (read that one field). Tests for missing, null, numeric and
   another string.
3. **Nit, vacuous privacy tests.** Use distinctive switch values (for example `"yes-SWITCH-SENTINEL"`)
   and a distinctive endpoint value, assert the expected refusal message first, then assert the
   sentinel is absent.

Re-run the five gates bare and the `dist/server.js` hash (expected unchanged:
`8f8ac7f9ca79afb962acb8759d6fbb84a3e7ecefd8fc24cf5669db9e191d0532`). Commit with the normal hooks.
Append "Reconciliation 2" to EXEC.md, commit, and report the EXEC.md path to the lead.
