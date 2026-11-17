# Item 7.1 required review (Codex frontier)

You are the independent security and integrity reviewer for round item 7.1 of stellar-raven-codemode,
worktree /home/tyler/code/raven-wt/np-7.1, branch np/7.1-case-search-guard. Review the five commits `git diff 131c6c1c..HEAD`
(none of them contains case text; reading that diff is safe). Context: AGENTS.md, /home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/PLAN.md (read
the "Reconciliation with REVIEW.md" section, it overrides the rest), /home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md.

Goal of the change: keep held-out and reserve QA case text out of the context of agents that search
the repository. Pieces: parent-folder .ignore files (eval/.ignore, eval/qa/.ignore,
.agents/rounds/.ignore); a Claude Code PreToolUse hook (scripts/agent-hooks/case-search-guard.mjs,
.claude/settings.json, the .gitignore negation) that denies recursive grep, git grep without the full
exclusion pathspec, rg with no-ignore flags or positive globs reaching listed paths, and similar; a
case-text ratchet (eval/qa/case-text-scan.mjs, eval/qa/case-text-baseline.json, its test); the routing
and protocol-history runners printing aggregates only unless --rows; the rule text in AGENTS.md,
eval/qa/README.md and the golden-truth skill; CI installing ripgrep.

Check, with concrete failing inputs where you find a defect:
1. Hook bypasses that an agent could hit by accident during normal work (not a determined
   attacker): command forms the parser misreads, wrappers, quoting, heredocs, cd handling, opt-in
   leakage, paths relative to cwd, Windows/macOS differences irrelevant. Run the decision function
   on your candidates with node; do not run searches against the real case folders.
2. Safety of the hook as repository code that runs on every Bash and Grep call in every Claude
   session in any checkout of this repo, including a checked-out PR branch: fail-open behavior,
   exit codes, timeouts, imports, anything that could block work or execute untrusted input.
3. False positives that would block routine work (scoped searches, commit messages, gh bodies).
4. The .ignore layout and the tests that pin it; the ratchet's correctness, its runtime, and that it
   prints no case text on any path (pass or fail).
5. The runner changes: no holdout or protocol-history case id on stdout or stderr by default, results
   file unchanged, exit codes unchanged.
6. Whether the rule text matches what the code does.

Rules: never open eval/qa/corpus/, eval/corpus/, eval/qa/cases.json, eval/qa/sample.json,
eval/qa/tool-cases.json, eval/qa/results/, eval/qa/reviewed/, eval/qa/consistency-register.json,
eval/qa/source-sentinels.json, eval/holdout-cases.json, the protocol-history blind case files, or the
files inside .agents/rounds/2026-11-02-golden-audit/ and .agents/rounds/2026-11-14-golden-coverage-audit/.
Search with rg (which skips them via .ignore) or with git grep plus ':!eval/qa' ':!eval/corpus'
':!eval/holdout-cases.json' ':!.agents/rounds/2026-11-02-golden-audit' ':!.agents/rounds/2026-11-14-golden-coverage-audit'.
You may run npm test or single test files. No model-calling eval. Do not edit tracked files or commit.

Write findings to /home/tyler/code/raven-wt/np-7.1/tmp/CODEX-REVIEW.md: a verdict (PASS, PASS with findings, or FAIL), then numbered
findings with severity (blocker, major, minor), evidence and a proposed fix. When done, run:
hc send t1wn '/home/tyler/code/raven-wt/np-7.1/tmp/CODEX-REVIEW.md'
