# Item 8.3 execution report

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`), high effort, 2026-11-18. Worktree
`/home/tyler/code/raven-wt/np-8.3`, branch `np/8.3-model-families`. Carried out `PLAN.md` and its
"Reconciliation" table. No model call of any kind, no dev server, no subagent, nothing pushed.
`eval:qa:lint` and `eval:qa:register` were not run.

Commits (hooks on, secrets scan clean on each):

1. `76198f8b` resolver, roster, AGENTS.md, skill, docs, TODO
2. `7cbb167f` eval runners, their docs, tests
3. `e936c250` Playground constant, gauntlet, tests
4. this file

## What I did per plan step

**1. Resolver.** `scripts/lib/model-family.mjs` (`resolveFamily`, `resolveFamilyDetail`) and
`scripts/latest-model.mjs`. Claude families pass through as aliases. `sol|astra|terra` take the
highest dotted version among `visibility: "list"` slugs matching `^gpt-(\d+(?:\.\d+)*)-<family>$`.
`grok` takes the highest among non-hidden `info.id` values matching `^grok-(\d+(?:\.\d+)*)$`.
Versions compare as numeric arrays, so 6.10 is above 6.2. It fails closed on a missing or
unparsable cache, a wrong shape, an unknown family or no match, and its errors never echo file
content. The CLI prints the ID on stdout and the catalog's `fetched_at` on stderr, and exits 1
(failure) or 2 (usage). It reads only the model key or slug, `info.id`, the visibility or hidden
flag, and `fetched_at`. `test/model-family.test.mjs` (18 tests) uses hand-written fixtures in
temp directories; no test reads a host cache. Listed in `test/README.md` and `scripts/README.md`.

**2. Roster and launch lines.** `.agents/model-roster.md` rewritten: family tiers, the eval set by
family, the two-step launch form (`M=$(node <worktree>/scripts/latest-model.mjs <family>) && hc run
...`), the record-the-resolved-ID rule (Claude `modelUsage` key or stream `init.model`; Codex and
Grok the resolver output plus Grok's reported key), re-verify with the resolver and the offline
catalog reads (model fields only), "a family move needs no edit", and "the first lane on a newly
resolved ID is that check". The verified-version line and per-ID context column are gone. The
intro and the frozen-contract bullet are reworded. A dated brief's explicit launch line stays.
`.agents/README.md` row reworded.

**3. AGENTS.md.** "Eval and test models" is now Claude Sonnet, Codex Terra and Grok at each
family's newest, plus Opus and Sol where they help, Haiku and Luna out, and "every run records
the exact ID it resolved". The closing paragraph says launch lines name families and that a dated
brief's explicit launch line stays as written.

**4. Skill.** `run-evals` section 2: pass an alias or an ID, the run records the resolved ID. The
defaults paragraph names the aliases, the requested/resolved pair, the new-baseline rule and that
a resumed or re-judged file keeps its recorded judge. Section 4: the paid self-test also applies
when the resolved judge model changed. No other version pin in `.agents/skills/`.

**5. Eval runners.** New `eval/qa/model-identity.mjs` holds the shared rules.
- Defaults: `AGENT_MODEL`, `JUDGE_MODEL`, discovery `DEFAULT_MODEL` are `"sonnet"`.
- Capture: `parseAgentResult` (answering) and the discovery parser take the stream `init.model`
  when it matches `^claude-`, else the result's `modelUsage` key. `judgeCase` takes the envelope's
  `modelUsage` key: alias request, the single key starting `claude-<family>-` (auxiliary Haiku key
  ignored); exact request, the key equal to it; zero or two give `null`. Verdicts carry
  `resolvedModel`.
- Identity fields keep exact IDs. `meta.model`, `meta.judgeModel` and `row.agent.model` hold what
  ran; new `meta.requestedModel`, `meta.judgeRequestedModel` and `row.agent.requestedModel` hold
  the request. `re-judge.mjs`, `paired-verdict.mjs`, `compare-architecture-ab.mjs` and the
  supervisor are untouched and keep comparing exact IDs.
- Pin after the first response: `createModelPin`. The answering, judge, discovery, re-judge and
  Playground paths call with the alias until a call reports its ID, then pass that exact ID.
- Unknown or mixed: `observeJudgeModel` throws `JudgeModelIdentityError` when a non-error judge
  verdict reports `null`, or an ID other than the pin, or nothing under an alias request. That
  stops the judging method the way a missing cost does. `answeringModelComparabilityReasons`
  (and `discoveryModelComparabilityReasons`) add a reason to `comparabilityReasons` for two
  answering IDs, or an alias request whose answered rows name none. No separate flag.
- Resume and re-judge: `judgeStoredResults` defaults the judge to the file's recorded exact
  `meta.judgeModel` (else its requested value, else `JUDGE_MODEL`); the mixing guard is unchanged
  and refuses an explicit different `--judge-model`. A fresh file stamps `judgeModel: null` before
  the first call (an exact request stamps itself) and the alias is pinned by the first response.
  `re-judge.mjs` defaults to `recordedJudgeModel(results)` (Playground: `judge.resolvedModel`,
  else `judge.model`), so `--dry-run` stays free; an explicit alias pins and the artifact records
  the exact ID.
- Agent result schema: `resolvedModel` added, `AGENT_RESULT_SCHEMA` stays `qa-agent-result-v4`;
  the schema comment says an optional added field no reader requires is not a shape move.
- Playground artifact: `judge.model` stays the request inside the pre-run tuple and
  `judgeTupleSha256`; `judge.resolvedModel` is added after the first verdict. Contract stays
  `playground-semantic-result/v3` (see deviation 3). `re-judge.mjs` `tupleGuard` prefers it.
- Stability register: `_meta.judgeModels` (distinct exact judge IDs of source artifacts);
  `loadJudgeStabilityRegister` returns `judgeModels` (null for an old register);
  `stabilityRegisterJudgeMatch` is `true|false|null` in `meta.judgeTiering` (so `--judge-stored`
  writes it too) with one stderr line on `false`.
- Self-test record: not changed (deviation 4).
- Tests: updated the ones asserting old defaults (`gateway-judge`, `qa-judge-evidence`,
  `qa-harness-preconditions`) and added `qa-model-identity` (capture from init, from `modelUsage`
  with an auxiliary Haiku key, an exact request whose key differs, two family keys, the pin),
  resume default, unknown and mixed stops, the register match values, mixed-answering reasons,
  the re-judge default and pin (`re-judge-model-identity`), the register `judgeModels`, and the
  Playground v3 optional field. The fixture for capture is synthetic (`type`, `subtype`,
  `session_id`, `model`, a minimal result); recorded stream fixtures are untouched.
  `test/helpers/fake-judge-cli.mjs` gained an optional `modelUsage`, and the
  `qa-harness-preconditions` fake `claude` now reports `modelUsage` from its `--model` argument.

**6. Docs.** `eval/EVALS.md` rule 7 (resolved-model change is not like for like; the paid
self-test before a new resolved judge's first headline run; the old rule 7 became 8).
`eval/qa/README.md` "Judging rubric" rewritten as planned, `eval/discovery/README.md`,
`eval/qa/gateway-judge.md` (explicit config stays by design) and `run-evals` section 4 follow.
`.agents/TODO.md` gained "Run the judge self-test on the resolved judge model". Header comments in
`judge.mjs`, `run-qa.mjs` and `workflow-agentic-routing.js` updated.

**7. Playground.** `DEMO_CATALOG_LATEST = { terra, haiku, grok }` in `src/demo/model-config.ts`
with the no-alias comment; primary, fallback and Grok control read it. Primary and fallback are
unchanged; the Grok control moves from `xai/grok-4.6` to `xai/grok-4.7` and no `src/` path reads
it. `scripts/run-demo-model-gauntlet.mjs` keeps its matrix literal; `test/demo-model-config.test.ts`
asserts its Terra and Grok entries equal the constant (the matrix was already exported). Header
comment names families; dated observations stay. `.agents/TODO.md` gained "Bump the Playground
catalog IDs when the AI Gateway lists a newer model" (names `DEMO_ANTHROPIC_5X_MODEL`), and its
Terra and Grok-control wording now names families. `eval/playground/README.md` names families.
Test lines 144/195/201/311/328 use `xai/grok-4.6` as an arbitrary xAI ID for prefix logic and
stay; only line 86 followed the constant.

**8. Ledger.** No round-ledger row: the brief forbids editing `.agents/rounds/` except this file,
so the lead adds the row.

## Gates (each run bare)

| Gate | Result |
|---|---|
| `npm run typecheck` | clean (needed the placeholder `.dev.vars` and `npm run typegen` first; both ignored by git) |
| `npm test` | 177 files passed, 5 skipped; 4247 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | exit 0 (dry run) |
| `npm run test:smoke` | 10 files, 173 tests passed |
| `npm run eval:selftest` | all checks passed |
| `npm run secrets:scan -- --tree` | clean |

No `usage/` change, so the three usage gates were not run. An earlier `npm test` run failed 40
tests; the causes were the old-default assertions and stub judges that report no model, now fixed
(deviation 1 explains the alias definition that cleared most).

## Final version-pin scan

Regex over live files, excluding `research/`, `improvements/`, `.agents/rounds/`, `plugins/openai/`,
`ecosystem-skills/`, `eval/gates.json`, `test/fixtures/`, `usage/`, `package-lock.json`. What
remains, each with its reason:

- `src/demo/model-config.ts` `DEMO_CATALOG_LATEST` values: the single home of Playground catalog
  IDs. Its comments about the 5.x family and the `DEMO_ANTHROPIC_5X_MODEL` pattern state a
  provider fact the code depends on, and the kimi control (`@cf/moonshotai/kimi-k2.7-code`) is
  not a named family.
- `scripts/run-demo-model-gauntlet.mjs` `DEFAULT_MODELS` (the single home of the eval-client
  matrix, pinned to the constant by a test) and its header's dated observations.
- `.agents/TODO.md` lines 151, 161, 1201 (CLI-version facts), 623 and 1049 to 1050 (measured
  results), and the new self-test item's account of the move from `claude-sonnet-5`: records.
- `eval/qa/README.md` line 442: states that stored `claude-sonnet-5` verdicts are a different
  judge, a statement of the transition, not a choice.
- `eval/qa/gateway-judge.md`: an explicit config example and its reference link, by design (the
  config hashes exact IDs).
- `usage/report-site/src/launch.js:64`: the dated launch snapshot naming its auditor (not touched).
- Tests and fixtures: exact IDs as inputs and expectations, including `xai/grok-4.6` and the
  older `gpt-5.6`/`gpt-6` IDs the Playground prefix logic tests use, the synthetic
  `claude-sonnet-5-5` capture fixture, and the resolver's catalog fixtures.

## Deviations and findings

1. **`isAliasRequest` is the four Claude family names** (`sonnet|opus|fable|haiku`, optional
   `[..]` suffix), not "anything not starting `claude-`". Anything else is an exact request and is
   its own identity. This keeps stub judges named `stub-judge` working as exact requests, and it
   is the accurate definition.
2. **An exact request whose `modelUsage` key differs is unknown**, per the plan's "take the key
   equal to it". There is no prefix match, because `claude-sonnet-5` is a prefix of the different
   model `claude-sonnet-5-5`. A CLI that reports a dated or suffixed key for an exact request
   therefore stops the judge. That is fail-closed on purpose.
3. **Playground v3 can take the optional field, but its validator had to change.**
   `assertPlaygroundArtifactMeta` hashed the whole `judge` object against `judgeTupleSha256`.
   `judgeTupleForSnapshot()` now hashes `judge` without `resolvedModel` in both places, so stored
   v3 artifacts (no field) hash and validate exactly as before and a new one validates with the
   field. The stop rule did not fire. `judge.resolvedModel` must be a non-empty string when present.
4. **Self-test record not changed.** `run-p6-judge-self-test.mjs:137` requires the call record's
   exact key set (`CALL_RECORD_KEYS`), so adding a model field would break the wrapper. The TODO
   item says to record the resolved judge ID beside the record instead.
5. **`observeJudgeModel` rules.** An error verdict (CLI failure, parse, consistency) never sets or
   checks the identity, so ordinary judge retries are unchanged. A verdict reporting `undefined`
   (an adapter or stub that reports nothing) is accepted for an exact request and stops an alias
   request. The Playground path uses the same check, so an unknown judge model there throws out
   of `judgeAnswer`. I did not test how the Playground orchestrator handles that throw.
6. **Not covered by a test:** the inline `main()` wiring in `run-qa.mjs` (answering pin, the row's
   `agent.model`, `meta.model`, the comparability merge) and the discovery runner's spawn parse,
   because both need a live server and a spawned CLI. The pieces they call are tested
   (`parseAgentResult`, the pin, the comparability functions, `judgeStoredResults`), and the
   lead's alias smoke matches the capture rule. The first paid run is still the first live test
   of that wiring.
7. **Host caches.** The resolver reads `~/.codex` and `~/.grok` by design. While building it I ran
   `node scripts/latest-model.mjs <family>` for all four families (it printed `gpt-6.2-astra`,
   `gpt-6.2-sol`, `gpt-6.1-terra`, `grok-4.7`) and a `jq` read of key names, slugs, visibility and
   `info.id`/`hidden` to learn the shape. I never printed a credential field, and no test or
   fixture reads or copies a real cache.
8. **Small additions beyond the list:** the Playground README example `--models` ID became
   `<provider>/<catalog-id>`; `eval/qa/README.md` documents the register match field and the pin.
9. **Not edited, as briefed:** `research/`, `improvements/`, `.agents/rounds/` (this file only),
   `plugins/openai/`, `ecosystem-skills/PIN-REVIEW.md`, recorded stream fixtures, dated briefs.
   `paired-collection-supervisor.mjs` passes explicit `--model` and `--judge-model` from frozen
   plans and is unchanged.

## For the reviewer and the orchestrator

- Deploy: `src/demo/model-config.ts` changes bytes but not behavior.
- The one measurement change is the judge default: stored `claude-sonnet-5` verdicts, and a
  stability register built from them, are a different judge from `claude-sonnet-5-5`. The new
  TODO item holds the paid self-test.
- Independent review of `eval/`, `scripts/` and `src/demo/` is still outstanding, per the plan.
