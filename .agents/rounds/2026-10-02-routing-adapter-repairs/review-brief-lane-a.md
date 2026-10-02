# Independent adversarial review — lane A

You are the independent reviewer for lane A of round `2026-10-02-routing-adapter-repairs`. The
author was Codex frontier `gpt-6-astra` (agent `lane-a-astra`). The orchestrator is Claude Fable 5.1 (`raven-next`). You differ from both.

Worktree (read-only for you except `tmp/`): /Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-a on branch `fix/docs-title-keyword-rescue`, base `origin/main` `76c7f02b`.
The diff under review: `git diff origin/main` in that worktree (uncommitted changes plus any
commit on the branch). The author's report: /Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-a/tmp/lane-a-report.md. The brief the author followed:
`/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-a/.agents/rounds/2026-10-02-routing-adapter-repairs/brief-lane-a.md` and
`brief-common.md` beside it. Read `AGENTS.md` for the project's hard rules.

Your job is to break the change, not to approve it. In particular:

1. Verify every measurement in the report yourself. Re-run the gates named in the brief bare, no
   pipes, and record exit codes. Re-run the probe scripts. If a number in the report does not
   reproduce, that is a finding.
2. Attack the general rule. Construct queries, inputs, or responses that the rule handles wrongly:
   false positives, false negatives, and anything the rule now hides that an agent should see.
   Check it is not a query-specific exception, a compatibility shim, or a dual format.
3. Check scope: the diff touches only what the brief allows; generated artifacts were rebuilt by
   scripts, not hand-edited (rebuild them and diff); no edit under `.agents/`, `ecosystem-skills/`,
   or an inventory file the brief did not name; no secrets.
4. Check tests: they pin the behavior the brief's "done when" names, and they fail without the
   change (revert the source in a scratch copy or reason from the assertion).
5. Check documentation and the adapter or scoring header comments still describe the behavior.
6. Lane-specific checks: (a) the rule has two parts, "exclude service names" and "exclude unnamed title vocabulary shared across every other searchable service" with "named topics" preserved: state the rule precisely from the code, then attack it: does the "named topic" criterion smuggle in a word list or a threshold, is "every other service" a stable notion when services are added or removed, and is it a general mechanism rather than a fit to this title set; (b) reproduce the before table (titles absorbed, no code change) and the after table from `tmp/lane-a-measure.mjs` and `probe-discovery.mjs`, including the four probe ranks; (c) verify the legacy top-1 gain (`q-infra-hubble-vs-rpc-layer`, rank 5 to rank 1) is a legitimate consequence of the rule and not a side effect that should be rejected, and that raising the accepted legacy top-1 from 219 to 220 in `eval/gates.json` is justified with `npm run eval:selftest` passing; (d) check the inventory diff adds 15 titles and the timestamp only, removes or renames nothing; `catalog/manifest.json` changes only `keywords` on five Docs entries plus the generated timestamp; `specs/super-spec.json` changes only timestamps; micro-map and op-classes unchanged; the vendor scorer is untouched; (e) regenerate the chain yourself (`node scripts/build-catalog.mjs ACHECKSACHECKS npm run micro-map:build ACHECKSACHECKS npm run spec:build ACHECKSACHECKS node eval/plan/build-op-classes.mjs`) and confirm the committed artifacts are byte-identical to your regeneration apart from timestamps; (f) run `npm run eval:compile ACHECKSACHECKS npm run eval:routing -- --gate` and `npm run eval:selftest` yourself; (g) check the five tests in `test/title-keywords.test.ts` fail without the rule.

Do not modify the source files, commit, push, deploy, or run paid evals (`eval:qa*`, agentic).
Write your findings as Markdown to /Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-a/tmp/review-lane-a-grok.md with this structure: a verdict line
(`approve`, `approve with changes`, or `reject`), then one numbered finding per item with
severity (`blocker`, `should-fix`, `nit`), evidence (command, output, file:line), and the fix you
expect. End with the exact commands you ran and their exit codes. Reply with only that path.
