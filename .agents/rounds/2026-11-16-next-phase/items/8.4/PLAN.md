# Item 8.4 plan: no version pins left in live raven files

Lead: Claude Opus (`opus` alias, resolved `claude-opus-5-5`), agentpc `t1z6`, 2026-11-18. Branch
`np/8.4-families-everywhere` from `origin/main` at `b623d5ac` (#494). Bound by the orchestrator's
8.4 note and 7-COMMON (search, held-out, spend and deletion rules).

## Decision

No live file selects a model by version. Launch lines, briefs and defaults name a family and take
its newest model; a run records the ID it resolved. Records (research, improvements, PIN-REVIEW
rows, gates notes, dated round records, fixtures, recorded streams) keep the model they ran on.
The owner's instruction of 2026-11-18 overrides item 8.3's choice to leave the dated briefs pinned.

## Facts re-checked (2026-11-18, agentpc)

- Resolver, plain shell and a launcher-like `env -i` shell (PATH as in the launch script):
  `sol` gpt-6.2-sol, `astra` gpt-6.2-astra, `terra` gpt-6.1-terra (Codex cache `fetched_at`
  2026-11-18T21:59:54Z); `grok` grok-4.7 (Grok cache 2026-11-18T20:32:32Z). It imports only Node
  built-ins, so it runs before `npm ci`.
- Dated launcher: the installed `~/.local/share/raven-dated/launch-dated-lead.sh` is byte-identical
  to `items/1.4/dated/launch-dated-lead.sh` on main (the watchdog and follow-up scripts too). It
  runs `git fetch origin`, adds the worktree `~/code/raven-wt/np-<key>` from **`origin/main`** at
  fire time, and points the lead at `<wt>/.agents/rounds/.../items/1.4/dated/<item>-LEAD.md`. So a
  brief merged before 2026-11-23 18:00 UTC is what the 2.1 lead reads. No pinned SHA, nothing to
  refresh on agentpc. The launcher itself starts `claude --model opus` (already a family alias).
- AI Gateway catalog (developers.cloudflare.com/ai/models, keyless): newest per family the demo
  uses is unchanged: `openai/gpt-6.1-terra` (no 6.2 Terra), `anthropic/claude-haiku-5.5`,
  `xai/grok-4.7`, and `anthropic/claude-sonnet-5.5`. `openai/gpt-6.2-sol` is listed. So no
  `DEMO_CATALOG_LATEST` bump and no model-facing change.
- No test pins the content of the dated briefs or `ITEM-LEAD.md`.
- In the dated briefs the Codex and Grok children are the golden **re-derivation reviewer** and its
  fallback; no dated run is a model-calling eval or re-judge (each brief's "Spend" override and
  PRESTAGE section 1). A newer reviewer model changes no measurement.

## Steps (one Sonnet executor; files per step)

1. **Roster and AGENTS.md.** Remove the dated-brief exception: `.agents/model-roster.md` line 49
   ("A dated brief that names an explicit launch line keeps it ...") and the clause in `AGENTS.md`
   line 94 ("a dated brief's explicit launch line stays as written"). Keep the surrounding
   sentences grammatical; no other change.
2. **`briefs/ITEM-LEAD.md`.** Prose "Claude Opus 5.5" becomes "Claude Opus" (lines 6, 7), "Claude
   Sonnet 5.5" becomes "Claude Sonnet" (line 36). The commit-trailer block (line 66) becomes "the
   exact name of the model that wrote the commit" with an example shape
   `Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>`, not a pinned one. The Codex
   and Grok launch lines (78, 79) take the roster's two-step form, keeping the existing
   `systemd-run` scope wrapper and flags:
   `M=$(node <worktree>/scripts/latest-model.mjs astra) && hc run ... codex --no-daemon -m "$M" ...`
   and the same with `grok` and `--model "$M"`. Add one line: record the resolved ID (the
   resolver's stdout) in the child's record.
3. **Dated briefs** `items/1.4/dated/{2.1,2.2a,2.2b,2.2c,rehearsal}-LEAD.md`: the same treatment,
   only on model-naming lines. "Claude Opus 5.5 lead/lane" and "orchestrator (Claude Opus 5.5" become
   "Claude Opus"; the commit-trailer sentence names the running model's exact name (executor: its
   own); Codex line takes `M=$(node <wt>/scripts/latest-model.mjs sol) && ...`; Grok line
   `M=$(node <wt>/scripts/latest-model.mjs grok) && ...`; "Codex workhorse (`gpt-6.1-sol`)" becomes
   "Codex workhorse (Sol family, resolved at launch, ID recorded)"; "Fallbacks: Grok 4.7" becomes
   "Grok (newest, resolved at launch)". Every other line stays byte-identical: verify with
   `git diff --word-diff` that each hunk touches only model names, launch lines or the trailer.
4. **Gauntlet default** (`src/demo/model-config.ts`, `scripts/run-demo-model-gauntlet.mjs`,
   `test/demo-model-config.test.ts`). Add `sonnet: "anthropic/claude-sonnet-5.5"` to
   `DEMO_CATALOG_LATEST` (the comment above it already says what it holds). The gauntlet already
   imports `../src/demo/model-config.ts`; make
   `DEFAULT_MODELS = [DEMO_CATALOG_LATEST.sonnet, DEMO_CATALOG_LATEST.terra, DEMO_CATALOG_LATEST.grok]`
   and update its comment ("This literal is the single home ..." becomes: the IDs live in
   `DEMO_CATALOG_LATEST`). Dated-observation comments stay. The test asserts `DEFAULT_MODELS` equals
   that triple instead of `toContain`. The primary-model pin
   (`expect(DEMO_PRIMARY_MODEL).toBe("openai/gpt-6.1-terra")`) stays: it guards that the deployed
   Playground primary moves only with a measured verdict.
5. **Gateway judge doc** (`eval/qa/gateway-judge.md`). Example `model` / `gatewayLogModel` to
   `gpt-6.2-sol` / `openai/gpt-6.2-sol`; the sentence already says "the newest Sol in the AI
   Gateway catalog on the day of the run" and keep "The config stays explicit by design". Protocol
   reference link to GPT-6.2 Sol. No code change to `gateway-rejudge.mjs`: there is no offline
   AI Gateway catalog to resolve against, a live lookup needs account credentials and the network,
   and identity hashes the exact config model, so a family in the config would let identity drift
   between hash and call. State that reason in one sentence in the doc.
6. **Records.** `DECISIONS.md` "Follow-up answers (2026-11-18)": the owner's verbatim instruction
   and that it overrides 8.3's dated-brief choice. `EXEC.md` by the executor. Ledger row and
   `REPORT.md` by the lead.

Out of scope, with reason: `usage/report-site/src/launch.js:64` ("Fable 5.1 high checked ...") is
the reviewer of a dated launch-report snapshot, so it is a record. `.agents/TODO.md` 623, 1049,
1236 and `eval/qa/README.md:442` are dated measurements. PIN-REVIEW rows, `eval/gates.json` notes,
`plugins/openai/*-2026-10-23*`, `ideas/` link text, test fixtures and the test files that use
version strings as fixtures (not as defaults) stay. `briefs/PLAN-BRIEF.md` is a past item's brief.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke` (step 4 touches
`src/demo`), `npm run secrets:scan -- --tree`, all bare. Compare `dist/server.js` with
`origin/main`'s build: the only expected difference is the new `sonnet` string. No model-calling
eval, no paid call, no AI Gateway call.

## Reviews

- Claude Fable plan review (this plan) to `REVIEW.md`.
- Codex workhorse (Sol, resolved at launch) diff review of steps 4 and 5 plus the launch-line
  syntax in steps 2 and 3, to `tmp/`, copied to `CODEX-REVIEW.md`. Executor reconciles.

## Stop rule

Stop when the re-scan (`rg --hidden -g '!.git'` with the version patterns) shows only records
and fixtures, the gates pass, and the Codex review is reconciled. One review round, one re-check
only if it raises a blocker.

## Risks

- A broken launch line in a dated brief breaks an unattended run on 2026-11-23. Mitigation: the
  two-step form fails closed; the Codex reviewer checks the exact shell; the lead dry-runs the
  2.1 Codex and Grok lines up to `hc run` by substituting `echo` for `hc` (no launch).
- A stale Codex cache on agentpc on 2026-11-23 resolves an older Sol, which is still a valid model;
  the resolver prints `fetched_at`. Not worth a guard.
- The `sonnet` entry adds bytes to the Worker: a deploy with no behavior change.

## Needs from the orchestrator

- Nothing on agentpc: the timer reads `origin/main` at fire time. Merge before 2026-11-23 18:00 UTC.
- Report-only items for the Mac and agentpc CLI configs, and `7-COMMON.md` (outside the repo) still
  says "Sonnet 5.5 child".

## Reconciliation of REVIEW.md (Claude Fable `claude-fable-5-2`, high, `t1z8`)

All ten findings adopted. Where this section differs from the steps above, this section wins.

1. **Echo the resolved ID.** Every edited Codex and Grok line is
   `M=$(node <wt>/scripts/latest-model.mjs <family>) && echo "resolved: $M" && hc run ... "$M" ...`.
   Same in `ITEM-LEAD.md` and in the roster's launch lines (`.agents/model-roster.md` lines 62 and
   64), whose line 59 promises the ID to record.
2. **Step 4 is script-only.** No `src/` edit. `DEFAULT_MODELS = ["anthropic/claude-sonnet-5.5",
   DEMO_CATALOG_LATEST.terra, DEMO_CATALOG_LATEST.grok]`; the gauntlet comment says the Sonnet
   literal is the one eval-client-only catalog ID and the rest come from `DEMO_CATALOG_LATEST`.
   This drops `test:smoke`, the dist comparison and the deploy; the lead still checks that
   `dist/server.js` is byte-identical to `origin/main`'s build.
3. **TODO.** `.agents/TODO.md` "Bump the Playground catalog IDs ..." (lines 1250-1258): the
   constant holds Terra, Haiku and Grok, the gauntlet derives those two and holds the one Sonnet
   literal; a bump edits the constant, plus the gauntlet's Sonnet literal for a new Sonnet. Drop
   "a test pins that they agree".
4. **Fail-closed rule** in each dated brief (2.1, 2.2a, 2.2b, 2.2c) after the fallback line, and the
   rehearsal brief where it has a Codex line: "If the resolver exits non-zero or the resolved model
   fails to start, that tier is unavailable: take the next fallback and record the reason. Never
   type a model version by hand." The same sentence once in `ITEM-LEAD.md` under Children.
5. **Gateway example uses placeholders**, a deliberate deviation from the note's "update the
   example to the current newest" (a newer pin is the edit the owner asked to stop making):
   `"model": "gpt-<version>-sol"`, `"gatewayLogModel": "openai/gpt-<version>-sol"`; drop "(the
   example uses `gpt-6.1-sol`)"; the protocol reference points at the OpenAI models index
   (`https://developers.openai.com/api/docs/models`). The added sentence also says the Codex CLI
   catalog is not the AI Gateway catalog, so `scripts/latest-model.mjs` cannot fill the field.
6. **`eval/` gates.** The lead runs `npm run eval:selftest` bare. `eval:qa:lint` and
   `eval:qa:register -- --check` are left to CI: 7-COMMON bars this item from the QA lint, and the
   edit is one Markdown file.
7. **Test.** `test/demo-model-config.test.ts:82-85` becomes a membership guard: the default matrix
   is exactly three eval clients, one `anthropic/claude-sonnet-` ID plus `DEMO_CATALOG_LATEST.terra`
   and `.grok`, and no Haiku. The primary and Haiku fallback pins (lines 92-93) stay: they guard
   that the deployed Playground models move only with a measured verdict.
8. **Stop-rule scan pattern:**
   `rg --hidden -g '!.git' -n -i 'gpt-[0-9]|claude-[a-z]+-[0-9]|grok-[0-9]|(opus|sonnet|fable|haiku|grok|sol|astra|terra) [0-9]'`
   over the live paths, plus a by-eye check of the wrapped "Claude Sonnet / 5.5)" trailer lines in
   2.1 (59-60), 2.2a (52-53), 2.2b (45-46), 2.2c (51-52).
9. **DECISIONS.md.** Line 11 ("a Claude Sonnet 5.5 executor") is a dated record and stays. The new
   entry goes in the existing "Follow-up answers (2026-11-18)" section beside the 8.3 "Models"
   answer, and says it supersedes 8.3's dated-brief exception.
10. **Live proof.** The lead launches this item's Codex review with the byte-exact two-step line the
    dated briefs will carry (scope wrapper included), so it is the first agentpc lane on the newly
    resolved Sol; REPORT.md records it. The Grok line gets an `echo`-for-`hc` dry run only. Keep
    `M=... && hc run` (never the prefix form) and the three-space indent at `rehearsal-LEAD.md:26`.

Amended gates: `npm run typecheck`, `npm test`, `npm run build` (then `cmp dist/server.js` with an
`origin/main` build), `npm run eval:selftest`, `npm run secrets:scan -- --tree`, all bare. No
`test:smoke` (no `src/` change). No deploy expected.

## Scope change (orchestrator, 2026-11-18, after execution)

Note item 5 is dropped: the owner wants gateway judging removed entirely, and item 8.6 owns
`eval/qa/gateway-judge.md`, `eval/qa/gateway-judge.mjs`, `eval/qa/gateway-rejudge.mjs`,
`test/gateway-judge.test.mjs`, `eval/EVALS.md`, `AGENTS.md`, `.agents/skills/run-evals/` and
`eval/qa/README.md`. The lead reverted this branch's edits to `eval/qa/gateway-judge.md` and
`AGENTS.md` (step 1's AGENTS.md clause and step 5) to `origin/main` in a forward commit. The
AGENTS.md clause "a dated brief's explicit launch line stays as written" therefore remains and now
contradicts the roster and the briefs; it is handed to item 8.6.
