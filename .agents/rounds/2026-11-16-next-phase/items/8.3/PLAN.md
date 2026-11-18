# Item 8.3 plan: model families at their latest

Lead: Claude Opus 5.5, agentpc `t1yy`. Worktree `/home/tyler/code/raven-wt/np-8.3`, branch
`np/8.3-model-families` from `origin/main` at `74d3aebf` (#493 merged). Binding: owner answer in
DECISIONS.md ("don't tune by specific model version anywhere, just those model familes at their
latest"), the orchestrator's `8.3-NOTE.md` and `7-COMMON.md`.

## Decision this changes

Wherever the repo chooses a model for agent work, evaluation, judging or the Playground, it names a
family (Claude Sonnet, Opus, Fable; Codex Sol, Astra, Terra; Grok; Haiku for the Playground
fallback only) and takes that family's newest model. Every run records the exact ID it resolved.
A run on a different resolved model is a different measurement.

## Facts re-checked on 2026-11-18 (agentpc)

- **Claude Code 2.1.327** `--help`: "Use an alias for the latest model (e.g. 'fable', 'opus', or
  'sonnet')". Smoke: `claude -p --model sonnet --output-format json "Reply ok"` gave
  `modelUsage` key `claude-sonnet-5-5`. No resolver needed. The resolved ID is in the
  `--output-format json` envelope (`modelUsage` keys) and in the stream-json `system/init` line
  (`model`).
- **Codex 0.169.0** has no family alias (`-m <MODEL>` takes a slug). The offline catalog
  `~/.codex/models_cache.json` (visibility `list`) has `gpt-6.2-sol`, `gpt-6.2-astra`,
  `gpt-6.1-terra` as the newest of each family, with older ones described as "Previous generation"
  or "Legacy". Smoke: `codex exec --ephemeral --json -m gpt-6.2-sol "Reply ok"` completed its
  turn. The JSON events carry no model field, so the resolved ID is the slug the resolver passed.
- **Grok 1.0.88** has no family alias (`-m` "Model ID"). The unflagged default is the first model
  the server lists (config reference, `models.default`), which is not a stable contract. The
  offline catalog `~/.grok/models_cache.json` has `grok-4.5`, `grok-4.6`, `grok-4.7` and
  `grok-4.7-build-fast` (a priced variant). Smoke: `grok -p "Reply ok" -m grok-4.7 --output-format
  json` reported `modelUsage` key `grok-4.7-build`, a server-side name.
- **Playground providers** (docs only, no call): the AI Gateway catalog spells IDs exactly
  (`anthropic/claude-haiku-5.5`, `openai/gpt-6.1-terra`, `xai/grok-4.7`) and documents no family
  or `latest` alias for these vendors. Anthropic's newer IDs are pinned names. OpenAI's
  `chat-latest` is the ChatGPT Instant model, not Terra. xAI documents `grok-voice-latest` only.
  AI Gateway "model aliases" (`custom/<name>`, changelog 2026-11-04) are gateway-scoped pools
  kept in the Cloudflare account. They would move the choice out of the repo, add a second
  fallback layer next to `chat.ts`'s own, and still need a manual bump. Not adopted. The
  gateway catalog's newest are: Terra `gpt-6.1-terra`, Sol `gpt-6.1-sol` (no 6.2 listed yet),
  Haiku `claude-haiku-5.5`, Sonnet `claude-sonnet-5.5`, Grok `grok-4.7`.
- **Dated runs** (`items/1.4/dated/*-LEAD.md`, start 2026-11-23 18:00 UTC) carry their own
  explicit launch lines (`gpt-6.1-sol`, `grok-4.7`, `--model fable|sonnet|opus`), run no
  model-calling eval and no re-judge, and read neither `run-qa.mjs` nor `judge.mjs`. This item
  does not edit them (dated records under `.agents/rounds/`), so nothing it lands changes what a
  dated run does. It can merge before 2026-11-23.

## Steps

1. **One resolver** (Codex and Grok only): `scripts/lib/model-family.mjs` exports
   `resolveFamily(family, { codexHome, grokHome })`, plus a CLI `scripts/latest-model.mjs <family>`
   that prints one ID and exits non-zero with a reason on failure.
   - Families: `sonnet|opus|fable` return the Claude Code alias unchanged. `sol|astra|terra` read
     `$CODEX_HOME/models_cache.json` (default `~/.codex`) and take the highest numeric version
     among visible slugs matching `^gpt-(\d+(?:\.\d+)*)-<family>$`. `grok` reads
     `$GROK_HOME/models_cache.json` (default `~/.grok`) and takes the highest version among
     non-hidden keys matching `^grok-(\d+(?:\.\d+)*)$`, so suffixed variants such as
     `-build-fast` are excluded.
   - Fail closed on a missing or unparsable cache, or on no match. No network.
   - The caches hold credential fields (`api_key`, `env_key`, `identity`, `auth_method`). The
     resolver reads only the model keys or slugs, `info.id`, and the visibility or hidden flag.
     Its errors never echo file content. Test fixtures are hand-written, never copied from a real
     cache. The roster's re-verify commands keep selecting `.models[].info` (Grok) and model
     fields (Codex) only.
   - Test: `test/model-family.test.mjs` with fixture catalogs: version ordering (6.10 above 6.2),
     hidden and suffixed entries ignored, Claude aliases passed through, and an unknown family
     or missing cache throws.
   - Add it to `scripts/README.md` if that file lists scripts (it lists generated files; check),
     and list the new test in `test/README.md` if that file maps suites by name.
2. **Launch lines and roster** (`.agents/model-roster.md`):
   - Tier table: Model column becomes the family (Codex frontier = Astra, workhorse = Sol, Claude
     Fable, Claude Opus, Grok). Drop the verified-version line and the per-ID context column, or
     keep context as "per catalog". Keep the efforts column only if it stays version-free.
   - Eval set table: Claude Sonnet, Codex Terra, Grok (defaults); Claude Opus, Codex Sol (add
     where it helps). The flag column names the alias or resolver call.
   - Launch lines use the two-step form, so a resolver failure stops the launch instead of
     passing `-m ""` (an unflagged or empty Codex model inherits `~/.codex/config.toml`), and
     the orchestrator gets the ID to record:
     `M=$(node <worktree>/scripts/latest-model.mjs astra) && hc run --bg ... codex --no-daemon -m "$M" ...`.
     The same form applies to Grok. Claude uses `claude --model <sonnet|opus|fable> ...`.
   - New rule: every run records the resolved ID (Claude: `modelUsage` key or stream `init.model`;
     Codex and Grok: the resolver's output, plus Grok's reported `modelUsage` key). A review gate
     records it too.
   - "How to re-verify" keeps the offline catalog reads and adds the resolver. Drop "update this
     file only when a catalog changes"; replace with "nothing to update when a family moves; check
     the resolver still finds the family when a CLI renames it".
   - The intro (lines 3 and 4) and the "frozen measurement contract keeps the models it names"
     bullet are rewritten: eval defaults are family aliases, and a run's identity is the exact
     ID it resolved (step 5). The bullet "before you bind a new ID, run one short review" becomes:
     the first lane on a newly resolved ID is that check, and on a failed launch you fall back and
     report. Keep the instruction to read a catalog description when a new generation lands.
   - `.agents/README.md:6`: the same rewording ("update when a CLI catalog changes" goes).
3. **AGENTS.md**: "Eval and test models" becomes Claude Sonnet, Codex Terra and Grok, each at
   its family's newest, plus Claude Opus and Codex Sol where they help; Haiku and Luna stay out.
   Reword "when a CLI catalog changes, update the roster only" to say that launch lines name
   families and the run records the resolved ID. The routing table is already family-only. The
   wording must not read as overriding a dated brief's explicit launch line.
4. **Skills**: `run-evals` section 2. "Pass the full ID" becomes "pass an alias or an ID; the
   run records the resolved ID". The defaults paragraph changes: the defaults are family
   aliases; a change of resolved answering or judge model starts a new baseline. Re-scan
   `.agents/skills/` for any other version pin (none found by the lead).
5. **Eval runners** (code). Revised after REVIEW.md findings 1, 2, 5, 6, 9 and 11. One rule:
   **identity fields hold exact IDs; an alias only chooses the model for a fresh measurement.**
   - Defaults: `AGENT_MODEL = "sonnet"` (`eval/qa/run-qa.mjs`), `JUDGE_MODEL = "sonnet"`
     (`eval/qa/judge.mjs`), `DEFAULT_MODEL = "sonnet"` (`eval/discovery/run-agent-discovery.mjs`).
   - **Capture.** Answering and discovery: the stream-json `system/init` `model`, accepted only
     when it matches `^claude-`; otherwise the result line's `modelUsage` key. Judge: the JSON
     envelope's `modelUsage` keys. With an alias request, take the single key starting
     `claude-<family>-`; with an exact request, take the key equal to it. Zero or two candidate
     keys mean unknown (`null`). An auxiliary key of another family (for example Haiku) is
     ignored. Lead smoke, 2026-11-18: under `--model sonnet` both `init.model` and the
     `modelUsage` key were `claude-sonnet-5-5`. Write a hand-made fixture with those two lines
     (synthetic: only `type`, `subtype`, `session_id`, `model`, and a minimal result); never copy
     a real capture.
   - **Identity fields keep exact IDs.** `meta.model` and `meta.judgeModel`, and the per-row and
     per-verdict model fields, hold the exact ID that ran. New fields `meta.requestedModel` and
     `meta.judgeRequestedModel` hold what was asked for. Every existing reader
     (`re-judge.mjs` `tupleGuard`, `paired-verdict.mjs`, `compare-architecture-ab.mjs`,
     `paired-collection-supervisor.mjs`) then keeps comparing exact IDs unchanged, and a reader
     nobody updated refuses instead of passing.
   - **Pin after the first response.** Within one run, call with the requested value until a call
     reports its resolved ID, then pass that exact ID to every later call of that role. Calls
     already in flight when the pin lands keep their own recorded IDs.
   - **Unknown or mixed.** A judge call whose resolved ID is unknown stops the judging method,
     the same as a missing cost. An answering row whose ID is unknown, or a run whose rows carry
     more than one answering ID, gets a reason in the existing `comparabilityReasons` /
     `applyCollectionComparability` path (`run-qa.mjs` about 2121 to 2126), so aggregates are
     suppressed. No separate boolean flag.
   - **Resume, re-judge and compare use the recorded ID.** `judgeStoredResults`: when the file
     already carries verdicts, the default judge is the file's recorded exact `judgeModel`; the
     guard at `run-qa.mjs` about 1269 is unchanged and still refuses an explicit different
     `--judge-model`. A fresh file uses the alias and pins. `eval/qa/re-judge.mjs`: the default
     judge is the source artifact's recorded judge (`meta.judgeModel`, or `meta.judge.model` /
     `resolvedModel` for Playground sources), not `JUDGE_MODEL`, so `--dry-run` stays free and the
     tuple is identical by construction. Stored `claude-sonnet-5` files stay resumable and
     re-judgeable on `claude-sonnet-5` while the CLI serves it. That is intended.
   - **Agent result schema.** Add `resolvedModel` (null when absent) to the stored outcome with
     no `AGENT_RESULT_SCHEMA` bump, and say in the schema comment that an optional added field no
     reader requires is not a shape move. A bump would strand every v4 file.
   - **Playground artifact** (`scripts/run-playground-semantic-eval.mjs`,
     `eval/playground/artifact-contract.mjs`). `judge.model` stays the requested value inside
     the pre-run tuple and `judgeTupleSha256`. Add `judge.resolvedModel` after the first verdict,
     outside the snapshot hash. `re-judge.mjs` `tupleGuard` prefers `resolvedModel` when present.
     The contract stays `playground-semantic-result/v3`, because the added field is optional
     and stored v3 artifacts stay readable. Confirm with the validator before landing; if v3
     cannot take the optional field, stop and report.
   - **Stability register** (`eval/qa/judge-stability.mjs`). The built register records
     `judgeModels`, the distinct exact judge IDs of its source artifacts. A register without the
     list is unknown (`null`), not a mismatch. `run-qa.mjs` puts
     `stabilityRegisterJudgeMatch: true|false|null` in `meta.judgeTiering`
     (`judgeTieringMetadata`), so `--judge-stored` writes it too, and prints one stderr line on
     `false`. The register stays advisory.
   - **Self-test record.** Read `eval/qa/run-p6-judge-self-test.mjs` first. Add the resolved
     judge ID to the self-test call record (`judge.mjs` about 1048 to 1067), unless the wrapper
     checks an exact key set. In that case, record why not in EXEC.md.
   - **Tests.** Update the tests that assert the old defaults (`test/qa-judge-stored.test.mjs`,
     `test/qa-harness-preconditions.test.mjs`, `test/gateway-judge.test.mjs`,
     `test/diagnostic-rejudge-source.test.mjs`, `test/re-judge.test.ts`,
     `test/playground-eval-contract.test.ts`, and others the run finds). New tests:
     - capture from an init line;
     - capture from `modelUsage` with an auxiliary Haiku key;
     - an exact `--judge-model` whose `modelUsage` key differs from the requested string;
     - two `claude-<family>-` keys, which gives unknown and fails closed;
     - pin after the first response;
     - the resumed-file judge default;
     - the re-judge default;
     - a mixed-answering comparability reason;
     - the register match values.
     Recorded stream fixtures stay as they are. No test reads a host catalog file.
   - The gateway judge config stays explicit by design (identity hashing).
6. **Docs**: `eval/EVALS.md` gains one rule: "A comparison across a change of resolved model
   (answering or judge) is not like for like. A gate or QA baseline re-baselines when its
   resolved model changes." `eval/qa/README.md` "Judging rubric": defaults are `sonnet` for both
   roles, the run records resolved IDs, stored verdicts from `claude-sonnet-5` are a different
   judge, and the first judged run on the new judge sets a new baseline. `eval/discovery/README.md`
   and `eval/qa/gateway-judge.md` (example config names "the newest Sol in the AI Gateway catalog,
   `gpt-6.1-sol` on 2026-11-18") follow.
   - Calibration (REVIEW.md finding 4). `eval/qa/README.md` and `eval/EVALS.md` say that a new
     resolved judge model needs the paid seven-case self-test, under its own authorization,
     before its first headline judged run, and that run sets the new baseline. `run-evals`
     section 4 says the same. `.agents/TODO.md` gains one item: the pending self-test on
     `claude-sonnet-5-5`. This item makes no paid call, so it cannot close that item.
   - Header comments: `eval/qa/judge.mjs:13`, `eval/qa/run-qa.mjs:10` and `:50`.
   - `eval/agentic/workflow-agentic-routing.js:3,5`: "Sonnet 5 sub-agents" becomes "Sonnet
     sub-agents"; its model field is already the alias.
7. **Playground** (`src/demo/model-config.ts`, Worker bytes):
   - One constant, `DEMO_CATALOG_LATEST = { terra: "openai/gpt-6.1-terra", haiku:
     "anthropic/claude-haiku-5.5", grok: "xai/grok-4.7" }` (only the three IDs `src/` uses),
     with a comment: no provider offers a family alias; bump an entry when the AI Gateway catalog
     lists a newer model of that family. `DEMO_PRIMARY_MODEL` = terra, `DEMO_FALLBACK_MODEL` =
     haiku, `DEMO_GROK_CONTROL_MODEL` = grok.
   - Behavior: primary and fallback are unchanged. Only the Grok control model moves from 4.6 to
     4.7, and no `src/` path reads it (tests only), so production behavior is unchanged.
   - `scripts/run-demo-model-gauntlet.mjs`: its default matrix literal stays the single home of
     the eval-client catalog IDs, because the script is plain Node. A vitest test asserts that its
     Terra and Grok entries equal `DEMO_CATALOG_LATEST.terra` and `.grok`. Export the matrix if it
     is not exported. Drop the version names from its header comment where they state current
     choice; dated observations stay.
   - `.agents/TODO.md`: add one item, "Bump `DEMO_CATALOG_LATEST` and the gauntlet matrix when
     the AI Gateway catalog lists a newer Terra, Haiku, Sonnet or Grok", with the trigger and
     owner. Its text says to check `DEMO_ANTHROPIC_5X_MODEL`, which matches generation 5 only;
     an unmatched Claude ID silently loses the adaptive-thinking options. The existing xAI
     `strict` item names the control model by family. Lines 1049 to 1051 name "Codex Terra".
     CLI-version facts on lines 151 and 161 are records and stay.
   - `eval/playground/README.md`: name families, not versions.
   - Tests: `test/demo-model-config.test.ts` pins `xai/grok-4.6` (lines 86, 144, 195, 201, 311
     and 328). Line 86 follows the constant. The others are arbitrary xAI IDs for prefix logic;
     update them only where they assert the control constant.
   - No request changes, so no local request capture is needed (note question 3).
     `test/smoke/demo-openai-tool-request.test.ts` is the standing request pin.
   - Byte note: the Playground snapshot hashes `src/demo/model-config.ts`, `eval/qa/judge.mjs`
     and the runner, and QA artifacts carry `qaImplementationSha256`. New artifacts therefore
     separate from stored ones in those comparisons, as with any eval code change.
8. **Ledger and records**: `items/8.3/EXEC.md`, a row in the round ledger.

## Not touched (records keep the model they ran on)

`research/**`, `.agents/rounds/**` (including the dated briefs and `ITEM-LEAD.md`),
`improvements/**`, `plugins/openai/*` review evidence, `ecosystem-skills/PIN-REVIEW.md` (a review
ledger whose rows name their reviewers), `eval/gates.json` notes (every model mention is an
"Independent review:" record), recorded stream fixtures, `usage/report-site/src/launch.js` (the
"Fable 5.1 high checked..." line is the dated launch snapshot naming who ran that audit), and
`.agents/TODO.md` lines that record observed versions, and
`src/demo/model-config.ts` `DEMO_KIMI_CONTROL_MODEL` (`@cf/moonshotai/kimi-k2.7-code`, not one of
the named families).

## Gates

Bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke` (`src/demo`
changes), `npm run eval:selftest`, `npm run secrets:scan -- --tree`. No `usage/` change is
planned; if one lands, add `npm run build:usage`, `npm run test:usage-report`,
`npm run build:usage-report`. Not run: `eval:qa:lint` and `eval:qa:register` (7-COMMON: never run
the QA lint; CI runs both). No model-calling eval. The three CLI smokes above are the only model
calls; the executor makes none.

Final scan: the version-pin regex over live files returns only the records listed above, the
`DEMO_CATALOG_LATEST` values, the gauntlet literal, and test fixtures.

## Reviews

- Claude Fable reviews this plan (`REVIEW.md`).
- A Sonnet 5.5 executor carries it out (`EXEC.md`), committing with hooks.
- Codex workhorse (latest Sol via the new resolver, high) reviews the diff of `eval/`,
  `scripts/` and `src/demo/` (`CODEX-REVIEW.md`); the executor reconciles every finding.

## Stop rule

Stop and report when the gates pass and the review findings are reconciled. Stop and ask the
orchestrator instead of guessing if: the judge default change meets a guard that would refuse a
stored artifact in a way the owner should see first; a frozen measurement contract other than
`AGENT_MODEL` and `JUDGE_MODEL` turns up; or a change would alter a dated run.

## Risks

- **Judge comparability.** Moving the judge from `claude-sonnet-5` to latest Sonnet
  (`claude-sonnet-5-5` today) makes stored verdicts and the local stability register a different
  judge. Mitigation: resolved-ID guards and the EVALS rule. The owner's answer names "eval
  defaults" explicitly, so this is in scope; the report states it as the one measurement change.
- **Silent drift.** A family move changes results between runs with no diff. Mitigation: resolved
  IDs in every artifact and the mixed-model flags.
- **Codex catalog semantics.** A family name can change meaning between generations, and the
  resolver trusts the name. The roster keeps the instruction to read the description when a new
  generation lands.
- **Calibration.** Under "latest", the judge changes at every family move with no diff, and the
  first headline run on a new judge needs the paid self-test first. That is a documented rule plus
  a TODO item, not a gate.
- **Empty model on launch.** Handled by the two-step launch form.
- **First live test of the capture.** Mitigated by the lead's alias stream-json smoke and the
  fixture built from it.
- **Stale caches.** The resolver reads the CLI's cache. A cache older than the CLI could pick an
  older model; the resolver prints the cache's `fetched_at` to stderr.

## Needs from the orchestrator or owner

Nothing blocking. Deploy: `src/demo/model-config.ts` changes bytes but not behavior (primary and
fallback unchanged; the control model is read by tests only). The report says so.

## Reconciliation of REVIEW.md (Claude Fable `claude-fable-5-2`, high)

| # | Severity | Disposition |
|---|---|---|
| 1 | blocker | Adopted: identity fields keep exact IDs, new `requested*` fields, pin after first response (step 5). |
| 2 | blocker | Adopted: resume and re-judge default to the recorded exact judge; alias only for a fresh measurement (step 5). |
| 3 | should-fix | Adopted: Playground `judge.resolvedModel` outside the hash, v3 kept, stop if v3 cannot take it; byte note (steps 5, 7). |
| 4 | should-fix | Adopted: self-test rule in docs and `run-evals`, TODO item, resolved ID in the self-test record (steps 5, 6). |
| 5 | should-fix | Adopted: optional `resolvedModel`, no schema bump (step 5). |
| 6 | should-fix | Adopted: comparability reason, no separate flag (step 5). |
| 7 | should-fix | Adopted: two-step launch form (step 2). |
| 8 | should-fix | Adopted: resolver reads model fields only, synthetic fixtures (step 1). |
| 9 | should-fix | Adopted: the lead ran one more Claude smoke (stream-json under `--model sonnet`): `init.model` and the `modelUsage` key were both `claude-sonnet-5-5`. That makes two Claude smokes against the note's one; the second was a trivial prompt on the subscription CLI. Edge tests added (step 5). |
| 10 | should-fix | Adopted: every listed gap is in steps 2, 6 and 7 or under "Not touched". |
| 11 | nit | Adopted: no `sonnet` entry in `src/`, register `null` for old registers in `judgeTiering`, roster drops the verified line, no capture needed, roster first-lane rule, `test/README.md`. |
