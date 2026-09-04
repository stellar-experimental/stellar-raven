---
name: run-evals
description: Run a full eval round on stellar-raven-codemode from Codex, Claude Code, or another CLI agent — pick the right instruments (routing gate, QA headline, agentic, plan, live-data), distinguish the orchestrating agent from the spawned answering and judge agents, record results, review every answer/verdict, triage failures to root cause, and file evidence-backed upstream service-improvement findings in improvements/. Use when asked to run evals, check gates, measure a scoring/catalog/executor change, review QA verdicts, understand eval model roles, or close an eval round. The primary artifact of every round is upstream findings, not the scores.
---

# Eval round — stellar-raven-codemode

This skill is agent-agnostic: it is a plain-markdown runbook. Claude Code invokes it as a
skill; Codex or any other CLI agent can be pointed at this file directly.

## North star

Every instrument answers one question at some layer:

> Does an agent driving this MCP end-to-end produce a correct, current, non-fabricated answer?

Two non-negotiables, from `eval/EVALS.md` and `improvements/README.md` (re-read both before
any round — they are the current truth; this skill is the orchestration around them):

1. **The scores are the instrument; the findings are the product.** This server's own tuning
   ceiling is single-digit points. The outsized leverage is discovering gaps in the four
   upstream surfaces (Lumenloop, Stellar Light/Scout, Stellar Docs, skill sources). A round
   that surfaces an upstream gap and doesn't file it in `improvements/` has dropped its most
   valuable output.
2. **One headline, two gates, everything else diagnostic.** Never merge lanes, never tune
   per-question, never promote a view to a gate without a decision recorded in the round ledger.

## Agent roles and model boundaries

Do not conflate the agent running this runbook with the model under test:

- **Orchestrating agent**: Codex/Claude Code/etc. in the repo. It starts servers, runs commands,
  records result stamps, joins rows with goldens, reviews transcripts, patches code/docs, and
  files findings. It is not the QA answer model being measured.
- **Answering agent**: spawned by `eval/qa/run-qa.mjs` once per QA case via headless
  `claude -p`. It only gets the MCP `search` + `execute` tools and produces the candidate
  user-facing answer. Default model: `claude-sonnet-5`, override with `--model`.
- **Judge agent**: spawned by `eval/qa/judge.mjs` to grade the candidate answer against the
  golden. Default model: `claude-sonnet-5`, override with `--judge-model`. Judge verdicts are
  evidence to review, not unquestionable truth.

There is no committed multi-model matrix unless the round explicitly creates one. Report the
answering model, judge model, sample/full-set size, and results-file stamp for every QA run.

The answering/judge defaults above are part of the **measurement contract** — changing them
changes what the numbers mean, so they move only by explicit eval decision, never by the general
model-picking guidance.
[`AGENTS.md` “Model routing for repo-work fan-out”](../../../AGENTS.md#model-routing-for-repo-work-fan-out)
applies to everything *around* the measurement: helper/reviewer/triage sub-agents the
orchestrator fans out into Herdr panes while running a round.

## Clean Codex workflow

When asked to run evals "from this Codex agent", use this loop:

1. Run the preflight and selected instruments from this repo.
2. Let the eval runner spawn the answering and judge agents; do not answer cases manually from
   the orchestrating session.
3. Save and name the results file stamp(s).
4. Systematically review every `wrong` and `partial` row first; for a full closeout, review every
   row, including surprising passes.
5. Join each result row with its golden from `eval/qa/cases.json` before analysis.
6. Classify each issue with the Step 5 root-cause table.
7. Apply own-repo fixes where appropriate; file upstream findings in `improvements/`; make
   gospel edits to owned case files only through the `golden-truth` workflow.
8. Update the committed eval record and close the round only after failures and learnings are
   accounted for.

## Step 0 — scope the round and set up tracking

Decide what changed (or what question you're asking) — that picks the instruments:

| Trigger | Run |
|---|---|
| Any scoring/catalog/manifest change | routing (`--gate`) — free, seconds, ALWAYS |
| Retrieval work (query decomposition, vocab, semantic) | routing; read the **extended lane** as the target metric, legacy 338 as the non-regression gate |
| Skills routing / skill store changes | routing; read the skills lane vs its floor |
| Major search-behavior change | + agentic lane (~$, minutes, needs live server) |
| Big change / A-B / before-after on answer quality | + QA battery sample (headline; ~$0.2–0.7/case, ~30 min per 30) |
| Executor / adapter / envelope changes | + QA live-data lane (`--cases eval/qa/corpus/live/live-cases.json`) |
| Tool-description / agent-prompt-surface change (tool descriptions, MCP instructions, nudges) | QA sample + plan regrade — behavior shifts, routing math doesn't |
| Any QA run already stored | + plan regrade (free, offline) |
| Upstream drift refresh landed | routing `--gate`; refresh `improvements/` statuses (drift is the natural checkpoint for `fixed-upstream` re-checks) |
| Stale-gospel gate fired (PR CI or the daily refresh runs `eval:qa:lint -- --stale`) | triage each past-due `truth.reverifyBy` case via `golden-truth`: re-verify (update `truth.verified` + `asOf` + a new staggered `reverifyBy`) or record an explicit dated extension with rootCause — never silently bump the date; `truth-maintenance` owns the queue |
| Corpus-health cadence (periodic, no code change needed) | cross-question contradiction scan (corpus-internal, no live calls: flag golden pairs whose answers can't both be true — the ancestor corpora's dominant silent-drift failure; results + verified-consistent clusters + method all live in `eval/qa/consistency-register.json`, member hashes stamped by `npm run eval:qa:register`) + a sampled refute-then-repair sweep (skeptic agent attacks a small sample of goldens' claims/citations with real tools, weighted toward freshness-sensitive + numeric/version claims and `truth.status != "confirmed"` cases — the strata where breaks concentrate; fixes go through the `golden-truth` skill) + re-verify any `dateContingentTraps` in the register whose trigger has passed. |

Tracking (see [`AGENTS.md` “Coordination”](../../../AGENTS.md#coordination)): open
`.agents/rounds/<YYYY-MM-DD>-<lane>.md` as the round's working record (numbers, per-case notes,
triage table, findings drafted). Repo fixes discovered during the round become **their own
`.agents/TODO.md` entries** — never `improvements/` files.

**Pre-spend plan review — a launch gate for any round with paid instruments** (QA, agentic,
live-data — anything the table above prices). Before the first paid token: draft the round
brief in the round ledger (instruments, sample, reading rules, budget); have it
adversarially reviewed by an arm from the
[`AGENTS.md` routing table](../../../AGENTS.md#model-routing-for-repo-work-fan-out) that is
not the brief's author; reconcile every finding; on a major revision, run a bounded delta
re-review of what changed. Only then spend. The review checks, at minimum, the patterns
pre-spend review has actually caught (dated evidence:
[`research/audits/2026-07-11-eval-round-orchestration.md`](../../../research/audits/2026-07-11-eval-round-orchestration.md)):

- The round's own independent review is scheduled as mandatory, not optional.
- Attribution over a composite interval is predeclared: name the cases each landed change
  can deterministically affect before running, or claim only a diagnostic.
- The noise floor bounds what variance can explain; it is never a significance threshold.
- Environment and revision pins (prompt-surface overrides, server revision, sample
  membership) are asserted before spend, not reconstructed after.
- Budget caps are enforceable: define counted costs and reserves, and structure paid work
  around observable checkpoints or bounded call-count authorizations so the cap can stop
  the next spend.
- A call-count authorization covers one method run. Any method re-run needs its own bounded
  authorization before launch, even when the re-run repairs the measurement method.

A missed plan review blocks launch; it never retroactively invalidates data already collected.

**Cost estimates come from stored runs, never from the per-case figure in a README.** Read
`meta.totalCostUsd` out of `eval/qa/results/*.json` for combined answering and judging cost. Use
`meta.totalAgentCostUsd` and `meta.totalJudgeCostUsd` only for the component breakdown. Quote the
observed range and median for the same lane, contract, denominator, model, rubric, and pack. The
2026-07-27 round's brief estimated a sample-30 at $6–21
from the documented per-case range; nine stored Sonnet-5/Sonnet-5 sample-30 runs actually cost
$17.98–$23.08 (median $21.80), so the estimate excluded most real runs and its maximum sat below
the observed maximum. Four stored `live-data-canonical-v3` Sonnet-5/Sonnet-5 `p3` runs cost
$8.57–$9.54, with a $9.39 median. One stored `p5` run cost $9.25.

**Use the implemented total method cap for every paid QA command.** Pass exactly one
`--max-budget-usd` to `run-qa.mjs`, `--judge-stored`, `re-judge.mjs`, or
`eval/discovery/run-agent-discovery.mjs`. A missing or duplicate flag
stops the command before a paid call. The harness sends only the remaining authorized amount to
each sequential answering or judge call. Reported cost reduces the ledger, exhaustion stops the
next call, and the artifact retains incomplete and unattempted IDs. A budgeted call with no
reported cost invalidates the method. Record the real CLI path, version, and hash.

`run-qa.mjs` and `run-agent-discovery.mjs` use fail-closed CLI syntax.
Every value flag requires the spaced `--flag value` form.
`--no-judge` is the only boolean flag in either runner and uses its bare form.
Both runners reject every equals form, unknown flag, and stray argument before any paid call.
Required paid-run flags still reject missing values and duplicates.
`--ids` also rejects duplicates in both runners.

**Incomplete lanes are incomplete, not smaller.** Harnesses that catch per-job failures and filter
them out (`eval/agentic/workflow-agentic-routing.js`) shrink the denominator silently, so
percentages still look clean. Assert the expected job count before reading any result; a short run
forbids an aggregate or baseline delta, though a paired per-row comparison on the jobs that did
complete remains valid and is often the cheapest variance estimate available.

### Additional pre-registration for source-addition lanes

Adding a new source family changes both evidence access and routing competition. Before spending on
an A/B for a new service, index, corpus, or source namespace, add these items to the reviewed round
brief:

1. **Fix the gainable denominator.** For every proposed upside case, require baseline below
   Correct, probe-verified evidence for every missing key fact in the new source, and no residual
   that is merely answer craft. State `X of N audited-gainable` before launch; do not count
   baseline-Correct or structurally ungainable rows as upside opportunities.
2. **Measure the symmetric capture slice.** Every existing routing case the candidate newly captures
   at top 1 enters a paired no-regression QA arm. A source can improve its intended questions while
   degrading unrelated answers through evidence flooding; aggregate routing alone does not measure
   that downside.
3. **Control verdict variance.** Use two or three runs per arm on a small slice, or a second judge for
   every cross-arm grade difference before it counts. The exact replication rule and cost ceiling
   belong in the pre-spend brief.
4. **Grade facts as well as verdicts.** Pre-register missing-fact and wrong-claim deltas as the
   mechanism-sensitive metric; Correct/Partial/Wrong remains the headline. A useful source can fill
   facts without moving a coarse verdict, while one precision error can hide the gain.
5. **Measure provenance directly.** If first-party or otherwise unique sourcing is the value
   proposition, define its own instrument—such as uniquely reachable golden-source URLs or
   first-party citation rate. Do not use QA-grade movement as a proxy for provenance.
6. **Review labels before routing measurement.** Adjudicate cases whose expected source predates the
   candidate namespace before the A/B, and pre-commit the disposition for the common
   retrieval-win/QA-neutral/routing-cost outcome. Operation names are routing-load-bearing text, so
   inspect exact per-case captures rather than treating a source namespace as neutral metadata.

When the candidate surface differs from HEAD, the answering server must serve the complete candidate
manifest, spec, adapters, and descriptions from one pinned revision. A partial local overlay is not a
valid source-addition arm.

For a multi-lane or CI-like round, use `truth-maintenance` as the coordinator rather than
holding every transcript, drift note, golden check, and improvement follow-up in one context
window. The coordinator should own the round ledger and spawn isolated reviewers for:

- wrong/partial QA rows or shards of rows,
- plan/routing regression diffs,
- golden contradiction or freshness clusters,
- improvements filing/follow-up,
- adversarial closeout review.

Route pane and agent mechanics through the global `herdr` skill; split one pane per reviewer and
select model/effort explicitly per `AGENTS.md`. Each reviewer appends a narrow evidence-backed
verdict to the ledger; coordinator reconciles and patches. Do not pass the
coordinator's expected answer to reviewers.

## Step 1 — free preflight (always)

```sh
npm run eval:selftest           # grader math sanity + live-contract pins — no server needed
npm run eval:compile            # corpus → eval/routing-cases.json (deterministic)
npm run eval:qa:compile         # only if running QA; always emits cases.json + sample.json
npm run eval:qa:lint -- --stale # owned-corpus lint lanes + the stale-gospel gate (CI runs this)
# Editing judge-facing gospel (answer/keyFacts/avoid/notes)? Add --since <base-ref>.
# Without it the diff-based gospel gate ("changed without changing truth.verified")
# SKIPS locally (a NOTE line only) while CI resolves the push base and enforces it — a clean
# local lint is vacuous for that lane — a merged round has been bitten by this.
```

Compiles are deterministic and never touch the hand-authored files: the owned QA battery
(`eval/qa/corpus/battery/**`), the routing supplements (`eval/skills-cases.json`,
`eval/build-question-overlay.json`), and the frozen live contracts
(`eval/qa/corpus/live/live-cases.json` — the membership-frozen 15-case
`live-data-canonical-v3` contract — and the two-case opt-in `live-digest-supplement-v2`).
Both live contracts are membership- and digest-pinned by `eval:selftest`; change their case
content only with a recorded provenance note, contract-version bump, and digest update.
Generated files (`routing-cases.json`, `qa/cases.json`, `qa/sample.json`,
`plan/op-classes.json`) are never hand-edited — CI byte-pins them.

## Step 1b — paid judge behavior self-test (only when judging semantics move)

`npm run eval:qa:selftest` needs no MCP server, so it is easy to mistake for a free preflight
command. It is paid: it calls the configured judge once for each `SELF_TEST_CANDIDATES` entry,
which is currently exactly seven judge calls. CI never runs it for that reason. Obtain paid
authorization, record a seven-call cap, and record the judge model before you run it. It prints
`expected`, `actual`, `reportedCosts`, `missingCosts`, and `totalCostUsd`; reconcile `actual`
against your cap and treat a nonzero `missingCosts` as an incomplete spend figure.

Run it when the judging rubric, prompt, evidence pack, or judge adapter changes. Otherwise skip
it — Step 1 already covers the free lanes.

## Step 2 — live server (only for QA / agentic / live-data lanes)

Reuse a running server first. Look for a pane already running `npm run dev:eval` (`herdr pane list`)
and read its bound port from that pane's output (`herdr pane read <id>`). Pass that port to the
eval runner. Do not start a duplicate Wrangler process just because the example below uses `8788`.

If no dev pane exists and a live lane needs one, split your own pane and run it there
(`herdr pane run <id> "npm run dev:eval -- --port 8788"`). Close only a pane you split yourself, and stop it before
finalizing:

```sh
npm run dev:eval -- --port 8788
```

`--host localhost` is REQUIRED: the production routes make wrangler present request.url as a
public hostname, so the `DEV_ALLOW_UNAUTHENTICATED` loopback gate never fires and every
request 401s. Routing/plan lanes need no server.

Loopback dev-bypass sessions carry a fixed `dev-local` artifact owner, so eval runs exercise
the full artifact lane (writes go to the local simulated R2 binding, never production).
Truncated execute results end in a `--- SOURCE BASIS ---` block (shape, op ledger, artifact
handle, guidance) — transcript reviewers should expect that block, not a bare truncation
footer, and answering agents may issue follow-up executes that call `codemode.artifact.read`.

Readiness check before launching any lane (a plain GET on `/mcp` is not meaningful — probe
with a real MCP initialize):

```sh
PORT=<port read from the dev pane>
curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${PORT}/mcp" \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
```

Expect `200`. The `dev:eval` launcher adds the required `--host localhost` flag.

Before a QA launch, start the server with `npm run dev:eval -- --port "$PORT"`. The launcher
requires a clean worktree and compiles its commit into MCP `serverInfo`. Record its `surfaceSha256`
and commit. `run-qa.mjs` refuses collection without both values. It checks the same listener,
revision, clean state, compiled source revision, and surface after collection. Treat any change as
a failed comparison.
The runner still writes paid rows after a failed final check. It marks them non-comparable and
suppresses all aggregates.

Collection also requires a pinned remote identity probe. The probe must use only free, read-only
requests. It must emit the exact `qa-remote-identity-vector-v1` contract from `eval/qa/README.md`.
The vector covers Scout, Lumenloop, and Stellar Docs. It excludes timestamps and volatile telemetry.
The runner calls the probe before and after every answering call.

Stop after any probe failure or identity change. The runner preserves completed rows and lists
unattempted IDs. It records the changed service and both vectors. It marks the artifact
non-comparable and suppresses aggregates. Never resume that artifact under the same authorization.

```sh
SERVER_REVISION=<clean 40-character server commit>
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface.json
SURFACE_SHA256=<surfaceSha256 from the report>
AGENT_BINARY_SHA256=<SHA-256 of the capped Claude wrapper resolved on PATH>
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=<absolute path to the reviewed probe executable>
REMOTE_IDENTITY_PROBE_SHA256=<SHA-256 of that executable>
```

Compute `AGENT_ENVIRONMENT_SHA256` after every Claude-related environment variable has its final
value. Use the same shell for the identity command and the paid run. The command emits only the
SHA-256. It does not emit environment values.

Every `run-qa.mjs` mode requires exactly one budget, binary, and environment pair.
This includes `--judge-stored`. Collection also requires one server-revision pair and one
surface-SHA-256 pair. Collection also requires one probe path and probe SHA-256 pair.
Do not use the `--flag=value` form for any required pair.

The QA runner starts each answering agent in a temporary directory outside the repository.
It uses `--setting-sources ""`, `--disable-slash-commands`, and `--strict-mcp-config`.
It does not use Claude `--safe-mode`, because Claude Code 2.1.247 drops explicit MCP servers in
that mode. Judges use `--safe-mode` because they use no MCP server. For collection artifacts,
confirm `meta.agentEnvironment.isolation.safeMode: false`, `meta.agentBinary.matches: true`, and
`meta.agentEnvironment.inherited.matches: true`. For stored judging, confirm
`meta.judgeEnvironment.matches: true`. Confirm that each `expectedSha256` and `sha256` pair
matches. The artifact records variable names, but it does not record environment values.
Confirm `agent.mcpServers` reports the explicit `raven` server as `connected` in every row.

## Step 3 — run the instruments

```sh
# Routing (gate): prints legacy-strict, skills-lane, extended, accept-either tables
npm run eval:routing -- --gate            # exit 1 on gate breach or changed denominator

# QA headline (sample) — variant A = the shipped `search` tool
node eval/qa/run-qa.mjs --variant A --sample 30 --max-budget-usd "$MAX_BUDGET_USD" --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" --remote-identity-probe "$REMOTE_IDENTITY_PROBE" --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256"
# targeted smoke: --ids a,b,c ; collect-only: --no-judge ; overrides: --model/--judge-model

# QA live-data lane (grounding behavior; graded behaviorally, never on snapshot values)
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-cases.json --max-budget-usd "$MAX_BUDGET_USD" --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" --remote-identity-probe "$REMOTE_IDENTITY_PROBE" --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256"

# Opt-in digest supplement — run and report separately from the canonical lane
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-digest-supplement-cases.json --max-budget-usd "$MAX_BUDGET_USD" --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" --remote-identity-probe "$REMOTE_IDENTITY_PROBE" --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256"

# Plan regrade (offline, reads stored transcripts)
npm run eval:plan -- eval/qa/results/<stamp>-variantA.json

# Agentic lane (Claude Code only — Workflow harness): boot server, then invoke the
# Workflow tool with eval/agentic/workflow-agentic-routing.js and
# args {"port": Number(process.env.PORT), "cases": [...]} mapped from eval/agentic/sample.json
# (id/question/expected_service). Codex fallback: skip, or drive sub-agents manually
# per eval/agentic/README.md "Method".
```

The QA runner is sequential (one agent + one judge call at a time). For orchestration,
prefer letting the runner own execution and spend agent effort on **review** (step 4);
if parallelizing across shards, keep one results file per shard and report lanes separately.

## Five-track accounting contract

When a result stamps `meta.trackSchema: "qa-five-track-v1"`, report these tracks. If that stamp is
absent, report only counts supported by existing fields, mark unsupported measures unavailable, and
never emulate a retry with an ad hoc rerun.

1. **T1 first-pass answer quality:** use active selected IDs. Report first-attempt-row coverage,
   answered first-attempt coverage, valid-grade coverage over answered first attempts, and the
   valid-grade count over all active selected IDs. Conditional quality uses valid first-pass grades
   only. Judge-error rows are ungraded and remain visible in T4. Unsafe trap output is wrong in T1.
2. **T2 retry recovery:** use eligible first-pass transport failures. Preserve the first attempt and
   report recovered, repeated-failure, and unattempted counts over that fixed set. Permit one byte-
   identical retry; it never replaces T1.
3. **T3 safety behavior:** use answered active trap rows and print answered coverage over selected
   active traps. Derive safety from explicit answer behavior and trap evidence. T3 never derives
   from `judgeScore`; `judgeScore` is diagnostic only. Unsafe output fails T3 and remains wrong in
   T1. A provider safeguard is `not observed`, not a safety pass, and stays in T5.
4. **T4 harness and judge health:** report collection completeness, spawn and protocol failures,
   named attempted and unattempted judging ID lists, non-timeout judge CLI or parse failures,
   consistency contradictions, panel behavior, cost completeness, invalid-test diagnostics, and
   quarantined diagnostics. Include each failed panel vote in the method evidence. Keep invalid
   tests separate from harness failures and safety outcomes.
5. **T5 provider availability:** report answer-provider safeguards, transport, and timeouts
   separately. Report judge-provider safeguards and timeouts separately. The CLI cannot distinguish
   a judge transport failure from another judge CLI failure. Include each failed panel vote in the
   method evidence. Agent-limit termination is a T1 system failure, not a T5 outcome.

Allow one total judge retry across inline runs and stored resumes for an explicitly typed,
non-timeout CLI failure or parse failure. Treat an untyped legacy judge error as terminal. Use the
separate re-judge path for that row. Never retry a provider safeguard, any timeout, or deterministic
consistency contradiction. Preserve every attempt, input hash, answer hash, failure class, and cost.

For T3, pass a graded `correct` trap or an error row carrying
`successful-trap-refusal-not-correct`. Fail a graded `wrong` trap, a trap with non-empty
`avoidMatches`, or a row carrying `fired-avoid-not-wrong`. List every other trap error as unresolved.
Each contradiction also remains a T4 consistency error.

## Lifecycle reporting contract

Queue lifecycle review from verified observability failures, landed improvements, live drift,
verified user failures, and recurrent eval evidence. Judge noise without golden-ambiguity evidence
queues review while trusted truth remains active. A trigger changes no golden by itself.

Sample the full active-plus-quarantined compiled pool first. Then
partition the selected IDs. Never re-pick, replace, or append IDs. Active IDs form the performance
set; quarantined IDs remain diagnostic and stay outside T1 and T3. Print the denominator as
`active k of N selected`. List every excluded quarantined ID. Apply the same partition to explicit
`--ids` lists. Stored judging uses the collection lifecycle snapshot for panels and tracks. It
fails closed when the current lifecycle differs.

Keep the corpus-health report separate from T1 through T5. A corpus change is not a system gain.
Use unchanged IDs for comparisons after small edits. Require a pre-spend baseline decision when
sample membership changes or at least five percent of active cases change.

## Step 4 — gate verdicts and agentic review of results

**Gates first.** `eval/gates.json` holds the baselines (legacy 338 top-1/3/5 within ±1%,
skills-lane top-1 floor; current grading rule v3, manifest-exposed entries only). On a FAIL:
- If the change is a regression → fix or revert; don't rationalize.
- If the numbers moved legitimately (drift, deliberate policy change) → re-baseline:
  update `gates.json` **in the same commit** as the change that moved the numbers, decision
  recorded in the ledger, and check per-case hit→miss regressions (zero-regression is the standard
  the last re-baselines held themselves to), plus the `$comment`/`note` provenance fields.

**QA verdicts are NOT ground truth — review them agentically before believing them.**
Known judge failure modes (from `eval/qa/README.md`):
- Transcript visibility is conditional: cases tagged live-data/freshness (or explicitly
  transcript-tagged) get a deterministic transcript source-basis evidence pack in the judge
  input; untagged cases are still judged corpus-blind, where transcript-invisible
  corpus-grounded specifics get misgraded as fabrication. The rubric's unverified-not-wrong
  rule covers the blind lane — but still **live-verify every `wrong` verdict** by
  re-executing the claim against the live service before counting it as an agent failure
  (past rounds have overturned the majority of a run's wrongs as judge artifacts).
- Judge variance: verdicts are single samples. Before treating an isolated or flipped
  `wrong` as real, re-judge the identical row once — a verdict that flips on identical
  input is variance: record it monitor-only, don't chase it. Read `wrong` counts before
  `correct` counts; compare variants only on the
  same sample; re-judging is cheap (`rows[].answer` is saved — feed back through `judgeCase`:
  `judgeCase({ ...caseFromCasesFile, candidateAnswer: row.answer, transcript: row.transcript })`,
  or use `eval/qa/re-judge.mjs <results> --ids a,b` / `--flips-vs <baseline-results>` to persist
  an identity- and tuple-guarded machine-readable re-judge artifact). A paid re-judge requires
  exactly one `--max-budget-usd`. The artifact uses `meta.resultSchema: qa-rejudge-v1`; it does not
  claim the five-track contract. Re-judge panel votes remain in `rows[].attempts.judgeCalls`.
  Never cross-compare runs judged under different rubric/pack versions without a re-judge
  (`JUDGE_RUBRIC` in `judge.mjs` is the current version; verdicts carry
  `{rubric, packVersion, promptSha256}` stamps). The comparability rules and the committed
  noise floor live in `eval/qa/README.md` ("Judging rubric and score comparability").
- **Denominator note:** the owned battery is 500 cases as of 2026-08-28. The 499→500 compile added
  `q-scf-resolve-passport-superseded-slug`. The retrieval audit added five service-semantics cases
  to the 492-case corpus. The 2026-08-19 maintenance change added two
  broad `scout.hackathonBrief` cases to the 497-case corpus. Commit `6e1f979` previously added two Soroban
  cases to the 490-case corpus. The 2026-07-11 baseline remains historically 484-denominated, and
  the 2026-07-13 corpus remains historically 490-denominated. Pre-rebuild aggregates remain archival
  (`research/audits/2026-07-qa-history.md`). Historical aggregates are not directly comparable to a
  current 500-case aggregate. Per-id comparisons remain valid for continuing ids under the same tuple.
- **Deterministic sample-membership note:** sample-30 is proportional by service and uses
  even-spaced picks over id-sorted strata. Adding cases can therefore change sampled ids without
  changing sampler code. The 484→490 expansion retained 25 ids and replaced five (full list in
  `eval/qa/README.md`); none of the six new cases entered the sample. The 490→492 expansion
  retained 24 ids, removed six, and added six (full list in `eval/qa/README.md` under
  "Deterministic sample history"). The 492→497 expansion retained 9 ids and replaced 21. Two new
  cases entered sample-30: `q-gap-vet-pitch-vertical-null` and
  `q-ti-scout-refresh-cached-rows`. The 497→499 expansion retained 28 ids and replaced two. It
  removed `q-edge-noinfo-exact-tvl-figure` and `q-scf-total-distributed`; it added
  `q-edge-partner-detail-soft-empty` and `q-scf-v7-changes`. The 499→500 expansion added
  `q-scf-resolve-passport-superseded-slug`. Before claiming movement across any denominator change,
  use an explicit common-id list or disclose the membership churn.
- Freshness cases: sourced drift from the golden snapshot is fine; confident unsourced
  contradiction is not. Expect a small floor of judge-vs-live disagreements.
- **Avoid-clause bypass of the rubric-v2 addendum**: a golden whose must-avoid item bans
  claims "beyond corpus support" (or similar evidence-support phrasing) lets a corpus-blind
  judge read "not in the golden" as "must-avoid matched" — re-criminalizing thorough
  retrieval despite the addendum. Treat any `wrong` verdict whose rationale cites an avoid
  item phrased in terms of corpus/evidence support as a suspect artifact until live-verified.

### Paired stored-run verdict

Use `npm run eval:qa:paired -- <baseline.json> <candidate.json> --json` for the experimental
same-ID printer. It reads stored results only and never spends. It is not a ship gate.

The `qa-paired-ordinal-ni-v1` estimand has two paired cumulative-grade components:
`P(correct)` difference and `P(correct or partial)` difference. It keeps `correct`, `partial`, and
`wrong` without a half-credit weight. `FAIL` means that a loss is demonstrated because either
upper bound is below zero. Otherwise, `PASS` requires both lower bounds above the negative
experimental margin. Every other result is `INDETERMINATE`.

Here, `P` samples one eligible ID uniformly and one collection and judge realization under the
fixed contract. Do not generalize the result to another corpus or measurement contract.

Require 100 eligible IDs after exclusions. This method does not apply to sample-30. Below 100,
record `INDETERMINATE` with `denominator-below-powered-n` and do not repeat.

The default `0.08` margin is only `NO_CHANGE_CONFIDENCE_RADIUS`. It is not an accepted product
tolerance. A default `PASS` must retain the experimental no-change-radius label. The owner margin
question and the 0.05, 0.08, and 0.10 tables live in `.agents/NEXT.md`.

Require identical ordered IDs and canonical recomputable `caseInputSha256` values under
`qa-judge-case-v2`. Require one answering model and one judge model/rubric/pack tuple. Also require
identical result, prompt, agent, QA-implementation, and tiering contracts. Both artifacts must be
complete and comparable.

Generate one stability register before collection. Pass its path to every arm and repeat with
`--stability-register <path>`. Default sequential launches regenerate the register and cannot
share the required panel contract. The load-bearing tier fields are policy, threshold,
`judgePanel`, pinned register source/hash, effective `maxPanelCases`, its source, and the scaled
default policy.

Exclude the union of fixed T4 and T5 rows. T4 contains judge/verdict errors and spawn, protocol,
unclassified, or unknown harness failures. T5 contains provider safeguards, transport, and
timeouts. Count an `agent` termination as T1 `wrong`. Candidate-only means candidate T4/T5 against
baseline T1. It forces `INDETERMINATE`. A T4-to-T5 swap is only a union exclusion.

The fixed repeat rule permits one extra paired collection only after statistical uncertainty.
Stop after an initial `PASS` or `FAIL`. Do not repeat a guard failure, a denominator below 100, or
a candidate-only T4/T5 loss. Supply the one repeat with `--baseline-repeat` and
`--candidate-repeat`; the command averages repeats within each ID and then stops. There is no
third look.

Record the `--json` form in the round ledger. It includes `verdict`, the adjacent warning in
`verdictLabel`, look, denominator, exclusions, estimates, bounds, tuple, and reasons.
`transitions.perLook` records each look's T1/T1 attempts before union exclusion.
`transitions.perId` records the first look for final eligible IDs.

Run `npm run eval:qa:paired:validate` after any method change. The simulator reports look-1 and
two-look tables at n=90 and n=100. It reports 0, 5, 8, 10, 12, and 16-point losses. Its gates
require no-change `FAIL` at most 5%, two-look no-change `PASS` at least 80%, 12-point-loss `FAIL`
at least 80%, and false `PASS` at an 8-point loss at most 5%. Reduced deterministic gates also run
under `npm test`.

The current 10% and 8% discordance inputs come from mixed judge-tier contracts. Label every
operating characteristic `(mixed-tuple calibration)`. After one same-tuple pinned pair exists, run
`npm run eval:qa:paired:validate -- --recalibrate <baseline.json> <candidate.json>`. Promotion
still needs that recalibration and the owner margin decision.

Fan out sub-agents for this review when the run is big: one per `wrong`/`partial` case, each
re-executing the disputed claims live (production or dev `execute`) and returning a verdict
+ evidence. Collect into the round ledger.

Shard by evidence type when that is cheaper than case-by-case review. Example: one reviewer
checks all rows involving docs-index freshness, another checks Scout/Lumenloop corpus claims,
and another checks plan transcripts. Keep the write sets disjoint: reviewers append to the ledger;
the coordinator edits repo files.

New rows store the canonical judge input in `caseInput` under `qa-judge-case-v2`. This payload
includes `golden`. Legacy rows can lack it. Join legacy rows with `eval/qa/cases.json` on `id`:

```js
const golden = Object.fromEntries(cases.cases.map(c => [c.id, c.golden]))
// per row: { ...row, golden: golden[row.id] }
```

## Step 5 — triage every failure to its root cause

For each miss/wrong/partial (and each surprising pass), classify and route:

| Root cause | How to recognize | Where it goes |
|---|---|---|
| Judge artifact | live re-execution contradicts the verdict | round record; re-judge; rubric note if a new failure mode |
| Agent failure | tool use / synthesis genuinely wrong in transcript | round record; only actionable if a pattern → `.agents/TODO.md` (prompt/tool-shape) |
| Own-repo gap: scoring/catalog/executor/adapters/normalizers | search buried the right entry; envelope/normalizer misread a payload | **own-repo `.agents/TODO.md` entry** — never improvements/ |
| Eval-side gap: stale golden, mislabeled case, missing lane coverage | golden disagrees with live truth from the service's own mouth | `.agents/TODO.md` (goldens live in this repo); the fix lands directly in the owned case file (`eval/qa/corpus/battery/<category>/<id>.json`) **via the `golden-truth` skill** (`.agents/skills/golden-truth/SKILL.md` — gospel changes need multi-source triangulation, never a single source class) with `truth.verified` updated in the same diff (the CI gospel-change lint enforces it); freshness-drifting truth moves to the live-data lane as behavioral golden |
| **Upstream data/content gap**: missing fields, unordered arrays, empty lanes, extraction quality, stale skill content | correct agent + correct plumbing still can't answer from what the service returns | **`improvements/` finding** |
| **Upstream semantics/spec gap**: response contracts, error shapes, vocabulary, index tokenization/ranking | the service works but its self-description or behavior misleads any consumer, not just us | **`improvements/` finding** |
| Corpus-coverage diagnostic: canonical truth exists elsewhere and no tested surface undertakes to host it | the answer is verifiable from its canonical owner, while the miss only proves that one corpus/index does not carry it | keep truth and provenance in the golden; record a local coverage/monitoring result, not a manufactured Docs/site issue |

**Before accepting a reported "regression", check whether the mechanism is a threshold doing its
job.** A reviewer (or a later you) reporting that a change dropped a keyword, a hit, or a rank is
reporting an OUTCOME, not a cause. Find where the input came from and what the threshold actually
measures before writing a fix. Worked example, 2026-07-30: an upstream release added a shared
`totalBasis` envelope property, and a review reported the resulting loss of the `basis` keyword
from six Scout ops as a routing regression. Measured, the token's document frequency went 7/24
(29.2%) to 14/24 (58.3%) — it had never been op-distinguishing and had survived only just under
the 30% cut. The DF filter dropping it was the filter doing exactly what it was measured to do (the
naive no-filter variant regressed extended top-1 74->71). The proposed fix would have special-cased
one envelope property to preserve a keyword present on 58% of the service. Closed won't-fix on the
measurement, not on argument.

Anti-overfitting rules bind here: zero-hit routing cases stay failing until a *general*
mechanism fixes them; no query→service maps, no per-question vocabulary. If the only fix
you can imagine is case-specific, the case stays red and the note says why. **This binds harder
now that operator Algolia write/crawler access exists** (`.env`; see
`research/services/stellar-docs-algolia.md`): a docs-search rule/synonym you *can* now add still
must be a general mechanism with a measured win on the A/B harness (`npm run eval:algolia-raven`)
before it lands, and content-shaped gaps still go upstream — the `improvements-pipeline` skill's
"Direct Algolia remediation" section is the gate.

**Keep case evidence in the round record.** Production descriptions, keywords, examples,
archetypes, scorer constants, and tool instructions express a general user intent. Give each
proposed edit a source owner. A failed case supplies the test, not its wording. Case ids, question
phrases, and golden answer fragments stay in the round record. When the first failed boundary is an
upstream content or contract gap, create or update the improvement before proposing local wording.

**"Do not act yet" bucket.** A finding backed by a single case goes into a named
monitor-only list in the round record, not into a fix. The bar for acting: the same
failure across 2+ unrelated cases, a contract mismatch, a reproducible infra bug, or
trace evidence the model was asked the wrong thing. (Prior-art rule from both ancestor
repos; it kept their improvement loops from chasing variance.)

**Prose-surface check — run it before proposing any prompt/description change.** When an
agent-failure pattern clears the acting bar and a wording fix looks tempting, first inventory
what the model was already told at the failure moment. The surfaces, nearest-to-failure first:
runtime guard/warning messages and `codemode.*` error strings (`src/executor/providers.ts`),
truncation footers (`src/policy/truncate.ts`), adapter hints (`src/adapters/`), `search`'s
`nextSteps`, tool descriptions + schema `.describe()` strings + `SERVER_INSTRUCTIONS`
(`src/mcp/tools.ts`), and catalog entry descriptions (generated — change `scripts/`, never
the manifest). Then route:

- Prose already teaches the behavior and the transcript shows the agent read past it →
  prefer a mechanism (fail-loud guard, exact-match error with the fix in the message,
  schema change) over more words; repeating ignored guidance across surfaces is clutter,
  not reinforcement.
- Prose is absent, wrong, or contradicts another surface → smallest wording change in the
  ONE surface closest to the failure moment.
- Catalog/manifest descriptions feed the lexical scorer — any change there re-runs the
  routing gates before landing (Step 0's instrument row for prompt-surface changes applies).

Measure prose changes like code changes: before/after on the same instrument, delta in the
round record. A prose edit with no measured behavior shift gets reverted, not accumulated.

**Gospel-change doctrine — a golden fix always wears its provenance.** Editing a case
corrects the eval's *copy* of the truth; the defect that made it necessary lives somewhere
else and MUST be captured where it can actually get fixed: upstream service gap →
`improvements/` finding, eval-side authoring/rubric flaw → `.agents/TODO.md`, plain freshness drift →
named as such (`freshness-drift` in `truth.verified.rootCause`). A gospel edit without its
root-cause capture is a patch hiding a defect. This is CI-enforced by the gospel-change lint
(`eval:qa:lint`, diff-aware in CI; run `-- --since <ref>` locally): any judge-facing change
requires `truth.verified` to change in the same diff with non-empty `evidence` + `rootCause`,
and score-only rationales are rejected — but the enforcement only checks the fields exist;
the reviewer checks they're true.

## Step 6 — file the findings (the round's primary artifact)

Charter: `improvements/README.md`. One file per finding in the matching collection
(`lumenloop/`, `stellar-light-scout/`, `stellar-docs/`, `skills/`, `workers-ai-provider/`), next id in the
collection's `<prefix>-NNN` sequence. Frontmatter + three sections.
For lifecycle, intake, probe, index, and lint maintenance details, use the
`improvements-pipeline` skill.

Before choosing a collection, classify web failures as Docs content, Docs search/Algolia, broader
site content, broader site search/Algolia, or canonical-source defects. Search absence is not enough:
the proposed owner must actually undertake to expose the fact.

```
---
id: <collection>-NNN
service: lumenloop | stellar-light-scout | stellar-docs | skills | workers-ai-provider
status: proposed | verified | reported-upstream | declined-upstream | fixed-upstream
discovered: YYYY-MM-DD
evidence:
  - eval results-file stamp(s)
  - live verification note
  - round ledger path
---
## Finding        (what's wrong, factually)
## Evidence       (stamps, paths, re-execution notes — reproducible by a stranger)
## Recommendation (the concrete upstream change — cheapest fix first, alternatives noted)
```

Quality bar (match the existing findings, e.g. `sls-005`):
- **Verified requires live re-execution evidence** — a judge's opinion alone never
  graduates a finding past `proposed`. Probe the live service yourself (production
  `execute` on free ops is the usual instrument) and record exactly what came back.
- Quantify prevalence ("4 of 11 completed events"), so upstream can judge routine vs edge.
- The Recommendation is written for the **service owner**: concrete, self-describing-data
  biased, with the consumer-side workaround this repo shipped noted (commit ref) so they
  see the cost of not fixing it.
- At closeout, list every verified finding that the round did not file. Record its intake status
  and the next filing action or explicit deferral reason.
- Skills findings target the **source repos**. Bodies are not vendored here (pinned + fetched), so there is nothing local to patch and re-pinning is not a fix.
- Update existing findings rather than filing near-duplicates; refresh statuses when the
  daily drift refresh lands (a fix upstream → live re-check → `fixed-upstream`, residuals
  become successor findings, as sls-001 → sls-005).

Then push where it's clear how: when a finding is `verified` and the service has an obvious
intake (repo issues for skill sources, service owner contact, changelog feedback channel),
file it and flip to `reported-upstream` with the ref in `evidence`. If intake is unclear,
say so in the round record instead of letting the finding stall silently.

## Step 7 — close the round

Results JSONs are **local-only evidence** (`eval/**/results/`, gitignored). The committed
record is the READMEs — update the relevant lane README's results section with the exact
results-file stamp, the numbers table, and honest reading notes (report as-is; "nothing
tuned, numbers as-is" is the house style; caveats belong in the record, not omitted).

Close-out checklist:
- [ ] Gate verdict recorded (and `gates.json` re-baselined in-commit if legitimate)
- [ ] Lane README(s) updated with stamped results + reading notes
- [ ] Every failure triaged (step 5 table complete in the round ledger)
- [ ] New/updated `improvements/` findings committed — a round with zero findings needs an
      explicit "nothing new surfaced, here's what was re-checked" note to be credible
- [ ] Own-repo fixes filed in `.agents/TODO.md` (not improvements/, not silently patched)
- [ ] Corpus lint green: `npm run eval:qa:lint -- --since <ref> --stale` passes over any case
      edits — every gospel change carries an updated `truth.verified` with live evidence +
      `rootCause` (the lint enforces the fields; the reviewer verifies the substance) and its
      root cause is actually filed; `npm run eval:qa:register` re-stamped/reopened clusters
- [ ] Independent/adversarial review finished and every finding was reconciled or explicitly
      recorded as a non-blocking residual risk
- [ ] Round ledger closed with its Outcome section linking results stamps

## Hard rules (violating any of these invalidates the round)

- Lanes never merge; denominators never quietly change (`--gate` fails on that too).
- Headline = QA end-to-end; when two instruments disagree, the one closer to the headline wins.
- No per-question tuning, no foreign schemas/judge code from prior-art repos (spirit, not schema).
- Freshness-sensitive truth is graded as behavior, never pinned values in gates.
- Never print or commit secrets (`LUMENLOOP_API_KEY`, Algolia keys); paid Lumenloop research
  stays gated (dedup via `list_my_research`, budget cap, off by default) — eval runs use free ops.
- Sandbox/network posture is not relaxed for eval convenience.
