# Item 8.4: execution

Executor: Claude Sonnet (`sonnet` alias), resolved `claude-sonnet-5-5` (the ID my system prompt
gives), high effort, agentpc, 2026-11-18. Branch `np/8.4-families-everywhere` from `b623d5ac`.
Carried out `PLAN.md` steps 1 to 6 as amended by its "Reconciliation of REVIEW.md". No model call,
no paid call, no network write, no push, no PR, no subagent, no case file opened.

## Steps

1. **Roster and AGENTS.md.** Removed the dated-brief exception (`.agents/model-roster.md`, the
   "A dated brief that names an explicit launch line keeps it" bullet; `AGENTS.md`, the clause "a
   dated brief's explicit launch line stays as written"). Roster launch lines for Codex and Grok
   are now `M=$(node <worktree>/scripts/latest-model.mjs <family>) && echo "resolved: $M" && hc run
   ...`, and the sentence above them says the `echo` prints the resolved ID for the orchestrator to
   record (reconciliation 1).
2. **`briefs/ITEM-LEAD.md`.** "Claude Opus 5.5" to "Claude Opus" (lines 6, 7), "Claude Sonnet 5.5"
   to "Claude Sonnet" (step 4). Trailer block is now `Co-Authored-By: Claude <Family> <version>
   <noreply@anthropic.com>` under "the exact name of the model that wrote the commit, as its system
   prompt gives it". Codex line takes `astra`, Grok line `grok`, both in the
   `M=$(...) && echo "resolved: $M" && hc run ...` form with the `systemd-run` scope wrapper and all
   flags unchanged (`-m "$M"`, `--model "$M"`). Added two bullets under Children: record the
   resolved ID the `echo` printed, and the fail-closed sentence (reconciliation 4).
3. **Dated briefs** (`items/1.4/dated/{2.1,2.2a,2.2b,2.2c,rehearsal}-LEAD.md`). Only model-naming
   lines, launch lines, the trailer sentence and the added fail-closed sentence changed; checked
   hunk by hunk with `git diff --word-diff`. Four lead briefs: "Claude Opus 5.5 lead" and
   "orchestrator (Claude Opus 5.5" to "Claude Opus"; trailer sentence now names the running
   model's exact name for every lane (the executor line is gone, since every lane writes its own);
   Codex line `M=$(node <wt>/scripts/latest-model.mjs sol) && echo "resolved: $M" && hc run ...
   -m "$M"`; Grok line the same with `grok` and `--model "$M"`; "Codex workhorse (`gpt-6.1-sol`)"
   to "Codex workhorse (Sol family, resolved at launch, ID recorded)"; "Grok 4.7, then" to "Grok
   (newest, resolved at launch), then"; fail-closed sentence added as a continuation of the
   reviewer bullet, after the fallback sentence, with the bullet's two-space indent. Rehearsal
   brief: "Claude Opus 5.5 lane" to "Claude Opus lane", Codex line in the two-step form at its
   three-space indent, plus the fail-closed sentence (see Deviations). `bash -n` over all nine
   edited launch lines (with `<wt>` and `<key>` substituted) parses; not launched.
4. **Gauntlet default** (script-only, reconciliation 2). `scripts/run-demo-model-gauntlet.mjs`:
   imports `DEMO_CATALOG_LATEST` beside `demoReasoningEffortOverride`;
   `DEFAULT_MODELS = ["anthropic/claude-sonnet-5.5", DEMO_CATALOG_LATEST.terra,
   DEMO_CATALOG_LATEST.grok]`; the comment says the Sonnet literal is the one eval-client-only
   catalog ID and Terra and Grok come from the constant. Dated-observation comments stay.
   `test/demo-model-config.test.ts`: the first test is now a membership guard (three entries, one
   `anthropic/claude-sonnet-` ID, contains `.terra` and `.grok`, no `.haiku`); the primary and
   Haiku fallback pins stay. No `src/` edit. `.agents/TODO.md` "Bump the Playground catalog IDs
   ...": the constant holds Terra, Haiku and Grok; the gauntlet takes Terra and Grok from it and
   holds the one Sonnet literal; the bump edits the constant plus that literal for a new Sonnet;
   "a test pins that they agree" is gone (reconciliation 3, 7).
5. **Gateway judge doc** (`eval/qa/gateway-judge.md`). Example config uses `gpt-<version>-sol` and
   `openai/gpt-<version>-sol`; dropped "(the example uses `gpt-6.1-sol`)"; added that the Codex CLI
   catalog is not the AI Gateway catalog, so `scripts/latest-model.mjs` cannot fill the field
   (the sentence that identity hashes the exact model and the config stays explicit was already
   there); the protocol reference points at `https://developers.openai.com/api/docs/models`. No
   change to `gateway-rejudge.mjs` (reconciliation 5).
6. **Records.** `DECISIONS.md`, section "Follow-up answers (2026-11-18)", inside the "Owner answers
   to the item 8.2 questions" list under the 8.3 "Models" answer: the owner's instruction verbatim
   and that it supersedes 8.3's dated-brief exception. Line 11 ("a Claude Sonnet 5.5 executor") is
   a dated record and was left. This file is the executor's record; the ledger row and `REPORT.md`
   are the lead's.

## Setup

The worktree had no `.dev.vars` and no `env.d.ts`, so the first `npm run typecheck` failed on
missing `Env` members (`OAUTH_KV` and others) before any edit mattered. Created `.dev.vars` (mode
600, ignored) with the placeholder names from `ci.yml` and ran `npm run typegen`. Names only, no
secret values. Nothing from either file is committed.

## Gates (each run bare; output redirected to a file only to read the tail)

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0. One fix on the way: `(model: string)` annotation in the new test filter (TS7006) |
| `npm test` | exit 0. 177 files passed, 5 skipped; 4283 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | exit 0 (`wrangler --dry-run`; Total Upload 6918.57 KiB, gzip 1375.14 KiB). `dist/server.js` sha256 starts `8f8ac7f9ca79afb9` for the lead's `cmp` against an `origin/main` build |
| `npm run eval:selftest` | exit 0. 37 `ok` lines, 0 failures, "self-test: all checks passed" |
| `npm run secrets:scan -- --tree` | exit 0. "secret-scan: clean — scanned all tracked files" |

Not run, per the brief: `test:smoke`, `eval:qa:lint`, `eval:qa:register`.

## Stop-rule scan

`rg --hidden -g '!.git' -n -i 'gpt-[0-9]|claude-[a-z]+-[0-9]|grok-[0-9]|(opus|sonnet|fable|haiku|grok|sol|astra|terra) [0-9]'`
over the repo: 2925 matches. After removing research/, improvements/, test/fixtures/,
`.agents/rounds/` and `test/*.{ts,mjs}`, 50 matches remain in these live files. Both
`items/1.4/dated/` and `briefs/ITEM-LEAD.md` have no match. The four wrapped "Claude Sonnet / 5.5)"
trailer lines (2.1 59-60, 2.2a 52-53, 2.2b 45-46, 2.2c 51-52) are gone: checked by `rg` for
`5\.5\)` and by reading 2.1 lines 58-60.

Remaining live matches, each kept on purpose:

- `src/demo/model-config.ts` (10): `DEMO_CATALOG_LATEST` and the primary/fallback IDs. The AI
  Gateway has no alias, so they are exact catalog IDs by necessity; the rest are comments about the
  generation-5 model family and a dated observation. Not edited (`src/` out of scope; no newer
  catalog ID, per the plan's re-check).
- `scripts/run-demo-model-gauntlet.mjs` (8): the one Sonnet literal (no alias) and dated-observation
  and routing-note comments.
- `.agents/TODO.md` (9): lines 151 and 161 and 830, 1201 are CLI versions (Claude Code, Codex,
  Grok) or a Grok CLI behavior note, not model selections; 623, 1049-1050, 1236-1237 are dated measurements (plan out-of-scope).
- `ecosystem-skills/PIN-REVIEW.md` (15): review rows, records.
- `eval/gates.json` (2): gate notes, records.
- `plugins/openai/review-evidence-2026-10-23.json` (2), `plugins/openai/REVIEW-CASES-2026-10-23.md`
  (1): dated evidence.
- `usage/report-site/src/launch.js` (1): the reviewer of a dated launch-report snapshot.
- `ideas/playground-chatgpt-subscription-login.md` (1): link text, per plan.
- `eval/qa/README.md` (1, line 442): a dated measurement.
- `test/*.ts|mjs` and `test/fixtures/`: version strings used as fixtures and as the demo model
  pins that guard against drift, not as defaults. Includes `test/qa-judge-stored.test.mjs`
  (`claude-sonnet-5-5` as a stubbed alias resolution).
- research/, improvements/ and `.agents/rounds/` (dated round records, including
  `briefs/PLAN-BRIEF.md`, a past item's brief): records.

## Deviations

- **Rehearsal brief fail-closed sentence.** The rehearsal has no fallback chain, so "take the next
  fallback and record the reason" would not apply. It reads: "If the resolver exits non-zero or the
  resolved model fails to start, that tier is unavailable: report the reason instead of that
  child's line. Never type a model version by hand." The reconciliation allowed the sentence "where
  it has a Codex line"; the wording differs only in that clause.
- **Gateway doc sentence.** The reconciliation asks for the reason in one sentence plus the Codex
  catalog remark. The existing sentence already states that identity hashes the exact model, so I
  added only the catalog remark. The "a live lookup needs credentials and the network" reason from
  plan step 5 is not in the doc.
- **Trailer wording.** The briefs' commit-trailer sentence now covers every lane (each writes its
  own running model's exact name) instead of listing a lead name and an executor name.
- **Placeholder files.** The temporary `.dev.vars` and `env.d.ts` above are local setup, not part
  of the diff.

## Commits

Two commits on the branch, normal hooks, each ending `Co-Authored-By: Claude Sonnet 5.5
<noreply@anthropic.com>`: one for code and docs (everything above except the round records) and
one for the round records (`PLAN.md`, `REVIEW.md`, `briefs/`, `EXEC.md`, `DECISIONS.md`). The
dated briefs and `briefs/ITEM-LEAD.md` are round files too, but they are step 2 and 3 edits to
live briefs, so they go with the first commit. 
