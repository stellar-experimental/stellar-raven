# Item 8.3 plan review

Reviewer: Claude Fable (`claude-fable-5-2`), high effort, 2026-11-18. Read-only: no file edited
except this report, no model-calling eval, no paid call. One Cloudflare docs search (read-only) to
check the AI Gateway alias claim. Worktree `np/8.3-model-families` at `74d3aebf`.

Summary: the launch-line, roster, AGENTS.md and Playground parts are sound. The eval-runner part
is not ready. As written, the artifacts would store the alias in the fields that every existing
comparison guard reads, so those guards would pass across a family move, and the `--judge-stored`
guard cannot be built as described. Findings 1 and 2 need a plan change before the executor
starts. The rest are smaller.

## Findings

### 1. Blocker: storing the alias in `meta.model` and `meta.judgeModel` makes every existing comparison guard pass across a family move

The plan sets `AGENT_MODEL = "sonnet"` and `JUDGE_MODEL = "sonnet"` and adds new resolved-ID
fields beside the old ones. The old fields keep receiving the requested value
(`eval/qa/run-qa.mjs:2147-2148`, `:1356`, `:1472`). Today those fields hold exact IDs, and these
readers compare them for equality:

- `eval/qa/re-judge.mjs:555-577` (`tupleGuard`: source `meta.judgeModel` against the current
  judge), used for the source at `:926` and for the `--flips-vs` baseline at `:601`, which the
  comment at `:585` calls absolute.
- `eval/qa/paired-verdict.mjs:135-139` and `:166` (`rubricTuple.judgeModel`, `answeringModel`),
  compared across arms at `:636`.
- `eval/qa/compare-architecture-ab.mjs:318` (`model`, `judgeModel` must be equal).
- `eval/qa/paired-collection-supervisor.mjs:419-427` and `:723` (the frozen flip-rejudge tuple and
  the shared `--model` and `--judge-model` flags).
- `scripts/run-playground-semantic-eval.mjs:816-818` and
  `eval/playground/artifact-contract.mjs:140` (`judge.model` and `judgeTupleSha256`).

After the change each of these compares `"sonnet"` with `"sonnet"`. Two artifacts judged by
different resolved models pass as the same measurement. That contradicts the plan's own decision
line ("a run on a different resolved model is a different measurement"). The plan names only the
`--judge-stored` guard and the stability register; `re-judge.mjs`, `paired-verdict.mjs`,
`compare-architecture-ab.mjs` and the supervisor are not in step 5.

Recommend the smaller design, which fails closed without touching those readers:

- `meta.model` and `meta.judgeModel` keep their meaning: the exact ID that ran. Add
  `meta.requestedModel` and `meta.judgeRequestedModel` for the alias or ID that was asked for.
  The inline path writes meta at the end of the run (`run-qa.mjs:2137`), so the resolved IDs are
  known by then.
- Within one run, pin after the first response: call with the alias until the first call reports
  its resolved ID, then pass that exact ID to every later call. A family move in mid-run cannot
  mix models, and no probe call is needed.
- A first call that reports no resolved ID stops the method (judge) or marks the artifact
  non-comparable (answering). Do not store the alias as if it were an identity.
- Paid run sheets and paired plans name the exact ID they measured. They are dated records of one
  measurement, and the supervisor's frozen-tuple check then keeps working unchanged.

With this, every reader above keeps comparing exact IDs, and a reader nobody updated refuses
instead of passing.

### 2. Blocker: the `--judge-stored` guard as written cannot run before the first paid call

Plan step 5: the guard "refuses when the stored file's resolved judge ... differs from the new
one, and an unknown resolved ID never satisfies the guard". The guard runs at `run-qa.mjs:1269`,
before any judge call. The new resolved ID exists only after a paid call returns its envelope.
Read literally, every resume of a partly judged file is refused (the new ID is unknown), or the
guard moves after a paid verdict that may have to be thrown away. The comment at
`run-qa.mjs:1470-1471` shows the current design depends on stamping the tuple before the first
paid call.

`re-judge.mjs` has the same problem and the plan does not mention it: with the default now
`"sonnet"`, `tupleGuard` (`:568`) and `--dry-run` (`:959`, which prints `wouldRefuse` with no
call) cannot know the current judge.

Recommend one rule: an alias chooses the model only for a fresh measurement. Anything that
resumes, re-judges or compares defaults to the exact judge ID recorded in the artifact.

- `judgeStoredResults`: when the file already carries verdicts, default the judge to the file's
  recorded exact ID and pass that to the CLI. The existing guard at `:1269` stays as it is and
  refuses only an explicit, different `--judge-model`. A file finishes on the judge it started
  with. A fresh file uses the alias and pins after the first response (finding 1).
- `re-judge.mjs`: default `judgeModel` to the source artifact's recorded judge, not to
  `JUDGE_MODEL`. A re-judge is "same judge, new sample", so the tuple is identical by construction
  and `--dry-run` stays free. An explicit `--judge-model` gives the labelled non-identical
  artifact, as now. If the recorded model has been retired the CLI fails and the run stops.

Effect on stored artifacts under this rule: files judged by `claude-sonnet-5` stay resumable and
re-judgeable on `claude-sonnet-5` for as long as the CLI serves it. Under the plan's rule they are
refused by default with `--allow-non-identical` as the only way through. State which is intended.

### 3. Should-fix: the Playground artifact contract is a frozen contract the plan does not handle

- `scripts/run-playground-semantic-eval.mjs:807` defaults the judge to `JUDGE_MODEL`. The judge
  object is built before any call (`:816-826`) and hashed into the input snapshot as
  `judgeTupleSha256` (`artifact-contract.mjs:140`). With an alias that hash no longer identifies
  the judge, and `re-judge.mjs:558-562` reads `meta.judge.model` for Playground sources.
- The validator requires only a string (`artifact-contract.mjs:219`), so nothing fails; the
  identity just becomes weaker.
- Step 5 says this script "follows the same rule" without saying how, and the plan's stop rule
  names exactly this case ("a frozen measurement contract other than `AGENT_MODEL` and
  `JUDGE_MODEL` turns up").

Recommend: say in the plan what the Playground artifact records (for example `judge.model` stays
the requested value inside the pre-run tuple, and a `judge.resolvedModel` is added after the first
verdict, outside the snapshot hash, with `tupleGuard` preferring it), and whether
`playground-semantic-result/v3` stays. Stored v3 artifacts must stay readable
(`assertCurrentPlaygroundContract`, `artifact-contract.mjs:14`).

Also note for the report: the snapshot hashes the bytes of `src/demo/model-config.ts`,
`eval/qa/judge.mjs` and the runner (`run-playground-semantic-eval.mjs:270-272`), and QA artifacts
carry `qaImplementationSha256` (`run-qa.mjs:727`), which `paired-verdict.mjs:653` requires to
match across arms. Any edit here separates new artifacts from stored ones for those comparisons.
That is true of every eval code change, but the plan's "behavior unchanged" sentence for
`model-config.ts` should say it.

### 4. Should-fix: a new judge model has no calibration, and the self-test does not record its model

The move from `claude-sonnet-5` to the newest Sonnet puts a judge in place that the seven-case
paid self-test has never graded. `run-evals` section 4 limits that self-test to rubric, prompt,
pack or adapter changes, and `eval/qa/README.md:440-441` says to move the judge "only with a
recorded decision and a new baseline". Under "latest", this happens again at every family move
with no diff. The self-test call record has no model field at all (`judge.mjs:1048-1067`), so a
passing self-test would not say which judge passed.

Recommend:
- `eval/qa/README.md` and `eval/EVALS.md`: a new resolved judge model needs the paid self-test
  (own authorization) before its first headline judged run. That run sets the new baseline.
- One `.agents/TODO.md` item for the pending self-test on `claude-sonnet-5-5`. This item runs
  no paid call, so it cannot close it.
- Add the resolved judge ID to the self-test call record, or state why not (the wrapper may check
  an exact key set; read `eval/qa/run-p6-judge-self-test.mjs` first).

### 5. Should-fix: adding a field to the agent result meets the schema-bump rule

`agent-result.mjs:19-35` says to bump `AGENT_RESULT_SCHEMA` when the stored outcome shape
changes. A bump to v5 makes `--judge-stored` refuse every collected, unjudged v4 file
(`run-qa.mjs:1264`), makes `compare-architecture-ab.mjs:303` refuse v4, and splits the
paired tuple (`paired-verdict.mjs:169`). The plan does not say which it wants.

Recommend: add `resolvedModel` (null when absent) with no bump, and say so in the schema comment:
an optional added field that no reader requires is not a shape move. If the lead prefers a bump,
list the stored files it strands.

### 6. Should-fix: a run answered by two models should be non-comparable, not only flagged

The plan sets `meta.mixedAnsweringModels: true`. The runner already has a mechanism that
suppresses aggregates for a run that is not one measurement: `comparabilityReasons` and
`applyCollectionComparability` (`run-qa.mjs:2121-2126`), which `--judge-stored` enforces at
`:1234`. A boolean nobody reads lets a headline aggregate print over mixed rows.

Recommend: push a comparability reason for mixed or unknown answering models and drop the separate
flag. With the pin-after-first-response rule in finding 1 this can only fire on a CLI that ignores
the exact ID, so it is a backstop.

### 7. Should-fix: the launch line passes an empty model when the resolver fails

Plan step 2: `codex ... -m "$(node <worktree>/scripts/latest-model.mjs astra)" ...`. A non-zero
exit inside `$(...)` does not stop the outer command. Codex then gets `-m ""`. The roster's first
rule is that an unflagged Codex command inherits the host's `~/.codex/config.toml`
(`.agents/model-roster.md:19-20`).

Recommend the two-step form in the roster, which also gives the orchestrator the ID to record:

```sh
M=$(node <worktree>/scripts/latest-model.mjs astra) && hc run --bg --name <lane> --cwd <worktree> codex --no-daemon -m "$M" ...
```

Same for Grok.

### 8. Should-fix: the Grok catalog file holds credentials fields; fixtures must be synthetic

`~/.grok/models_cache.json` has `api_key` and `env_key` under each model, and top-level
`auth_method` and `identity`. `~/.codex/models_cache.json` has a top-level `identity`. (Key names
only were read for this review.)

Recommend the plan state: the resolver reads only the model keys, `info.id` and the hidden flag;
its errors never echo file content; test fixtures are hand-written, never copied from a real
cache; the roster's re-verify commands keep selecting `.models[].info` only.

### 9. Should-fix: the resolved-ID sources were smoked only for the JSON envelope

The plan's Claude smoke used `--output-format json` and read `modelUsage`. Step 5 relies on the
stream-json `system/init` `model` for `run-qa.mjs` and `run-agent-discovery.mjs`
(`run-agent-discovery.mjs:288`, `agent-result.mjs:510`). The recorded fixtures do carry
`init.model` (`test/fixtures/qa-agent-streams/*.jsonl`, value `claude-sonnet-5`), but they were
recorded with an exact ID, so they do not show what `init.model` holds under an alias.

Recommend: use the Claude smoke the note allows to capture one stream-json run under
`--model sonnet` (trivial prompt, no MCP) and keep its init and result lines as a new fixture.
Accept `init.model` only when it matches `^claude-`; otherwise fall through to `modelUsage`. Add
two edge tests the plan lacks: an explicit exact `--judge-model` whose `modelUsage` key differs
from the requested string, and two `claude-<family>-` keys in one envelope (unknown, fail closed).
Without this the first paid run after the change is the first real test of the capture.

### 10. Should-fix: scan gaps

Live files that pin a version or the old rule and are missing from the plan:

- `.agents/README.md:6`: "Model IDs and launch lines ... update when a CLI catalog changes".
  Same rewording as note question 6.
- `.agents/model-roster.md:3-4` and `:40-42`: the intro and the "frozen measurement contract keeps
  the models it names ... a judge ... not a roster edit" bullet. Step 2 rewrites the tables and the
  re-verify section but not this bullet, which will contradict the new skill text.
- `eval/agentic/workflow-agentic-routing.js:3` and `:5`: "Sonnet 5 sub-agents" in the workflow
  description. The model field is already the alias (`:77`).
- Header comments: `eval/qa/judge.mjs:13`, `eval/qa/run-qa.mjs:10` and `:50`.
- `src/demo/model-config.ts:17` `DEMO_KIMI_CONTROL_MODEL` (`@cf/moonshotai/kimi-k2.7-code`): not a
  named family, so leave it, but add it to "Not touched" or the final scan will not come back
  clean.
- `src/demo/model-config.ts:149` `DEMO_ANTHROPIC_5X_MODEL` matches generation 5 only, and an
  unmatched Claude ID silently loses the adaptive-thinking options (`:145-147`). Put "check this
  pattern" in the text of the new TODO bump item.
- `test/demo-model-config.test.ts:86`, `:144`, `:195`, `:201`, `:311`, `:328` pin `xai/grok-4.6`;
  add the file to the step 5 or step 7 test list.

Checked and agreed as records: `ecosystem-skills/PIN-REVIEW.md` (review rows),
`usage/report-site/src/launch.js:64` (a dated launch snapshot naming its auditor),
`eval/gates.json` notes, `.agents/TODO.md:151`, `:161`, `:623`.

### 11. Nit: smaller points

- `DEMO_CATALOG_LATEST.sonnet` would be an entry no `src/` path reads, added so a test can compare
  the gauntlet literal. The gauntlet's own literal can stay the single home of the eval-client
  matrix; keep `src/` to the three IDs it uses (`model-config.ts:14-16`).
- Stability register: it is not judge-aware today (`judge-stability.mjs:120-178` merges every
  artifact). For the new `judgeModels` list, define the old-register case (no list) as unknown
  (`null`), not as a mismatch, and put the flag in `meta.judgeTiering` beside the other register
  fields (`judgeTieringMetadata`) so `--judge-stored` writes it too.
- Plan facts are already a version behind: the Codex cache now reports `client_version` 0.170.0
  (fetched 2026-11-18 20:38 UTC) against the plan's 0.169.0. The catalog entries match the plan.
  This supports dropping the "Verified" line from the roster.
- Note question 3 asks for docs and a local request capture. No capture is needed because no
  request changes; say that in the plan, and name `test/smoke/demo-openai-tool-request.test.ts`
  as the standing request pin.
- Auto-resolution binds a new catalog ID with no smoke. The roster rule "before you bind a new ID,
  run one short review with it" (`model-roster.md:81-82`) should become "the first lane on a newly
  resolved ID is that check; a failed launch means fall back and report".
- List `test/model-family.test.mjs` in `test/README.md` if that file maps suites by name.

## Answers to the brief's questions

1. **Every note question answered?** Yes for 1, 3, 4 and 5. Question 2 is answered but the design
   is wrong in the two ways above. Question 6 misses `.agents/README.md:6`. Checked: the Codex
   and Grok caches hold what the plan says (`gpt-6.2-sol`, `gpt-6.2-astra`, `gpt-6.1-terra`;
   `grok-4.7`, with `grok-4.7-build-fast` correctly excluded by the pattern). Cloudflare's docs
   confirm AI Gateway model aliases are per-gateway `custom/<name>` pools (changelog 2026-11-04)
   and that catalog IDs are spelled exactly. The Anthropic, OpenAI and xAI alias claims were not
   re-checked.
2. **Scan complete?** No; finding 10. No file the plan edits is a record.
3. **Code design sound?** Resolver: yes, with findings 7 and 8. Runner capture and guards: no;
   findings 1, 2, 5, 6 and 9, each with a smaller design.
4. **Judge change handled?** Not yet; findings 1 to 4.
5. **Dated runs changed?** No. The dated briefs carry their own launch lines
   (`items/1.4/dated/2.1-LEAD.md:70-73` and siblings: `--model fable|sonnet`, `-m gpt-6.1-sol`,
   `--model grok-4.7`), say their overrides win, forbid model-calling evals and re-judges, and the
   launcher reads only `items.json`, the brief and `eval/qa/cases.json` from `origin/main`
   (`launch-dated-lead.sh:93-125`). The plan leaves those files and `briefs/ITEM-LEAD.md` alone.
   Two conditions keep this true: no new test may read a host catalog file (the plan's tests use
   fixtures), and the reworded AGENTS.md must not read as overriding a brief's explicit launch
   line.
6. **Gates, stop rule, risks?** Gates are right, including leaving the QA lint to CI. The stop
   rule already fires on finding 3. Missing risks: findings 4 and 7, and the first paid run being
   the first live test of the capture (finding 9).

Verdict: changes required. Reconcile findings 1 and 2 in PLAN.md before the executor starts;
findings 3 to 10 can be folded into the same revision; finding 11 is optional.
