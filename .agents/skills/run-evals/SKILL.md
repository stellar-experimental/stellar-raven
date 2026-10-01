---
name: run-evals
description: Run a full eval round on stellar-raven-codemode from Codex, Claude Code, or another CLI agent — pick the right instruments (routing gate, QA headline, agentic, plan, live-data), distinguish the orchestrating agent from the spawned answering and judge agents, record results, review every answer/verdict, triage failures to root cause, and file evidence-backed upstream service-improvement findings in improvements/. Use when asked to run evals, check gates, measure a scoring/catalog/executor change, review QA verdicts, understand eval model roles, or close an eval round. The primary artifact of every round is upstream findings, not the scores.
---

# Eval round — stellar-raven-codemode

This skill is the orchestration around the instruments. The instruments and their contracts live
in `eval/EVALS.md`, `eval/README.md`, and `eval/qa/README.md`. Re-read `eval/EVALS.md` and
`improvements/README.md` before any round; they are the current truth.

## North star

Every instrument answers one question at some layer:

> Does an agent driving this MCP end-to-end produce a correct, current, non-fabricated answer?

Two non-negotiables:

1. **The scores are the instrument; the findings are the product.** This server's own tuning
   ceiling is single-digit points. The outsized leverage is discovering gaps in the four
   upstream surfaces (Lumenloop, Stellar Light/Scout, Stellar Docs, skill sources). A round
   that surfaces an upstream gap and doesn't file it in `improvements/` has dropped its most
   valuable output.
2. **One headline, three routing gates, everything else diagnostic.** The headline is QA
   end-to-end (contracts in `eval/qa/README.md`). The gates are the legacy, skills, and holdout
   routing lanes (thresholds in `eval/gates.json`). Never merge lanes, never tune per-question,
   never promote a view to a gate without a decision recorded in the round ledger.

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

Report the answering model, judge model, sample/full-set size, and results-file stamp for every QA
run. There is no committed multi-model matrix unless the round explicitly creates one.

The answering/judge defaults are part of the **measurement contract**. They move only by explicit
eval decision, never by the general model-routing guidance.
[`AGENTS.md` “Model routing for repo-work fan-out”](../../../AGENTS.md#model-routing-for-repo-work-fan-out)
applies only to the helper, reviewer, and triage agents around the measurement.

## Round loop

1. Run the preflight and selected instruments from this repo.
2. Let the eval runner spawn the answering and judge agents; do not answer cases manually from
   the orchestrating session.
3. Save and name the results file stamp(s).
4. Review every `wrong` and `partial` row first; for a full closeout, review every row, including
   surprising passes.
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
| Big change / A-B / before-after on answer quality | + QA battery sample (headline; paid; ~30 min per 30 cases) |
| Executor / adapter / envelope changes | + QA live-data lane (`--cases eval/qa/corpus/live/live-cases.json`) |
| Tool-description / agent-prompt-surface change (tool descriptions, MCP instructions, nudges) | QA sample + plan regrade — behavior shifts, routing math doesn't |
| Any QA run already stored | + plan regrade (free, offline) |
| Upstream drift refresh landed | routing `--gate`; refresh `improvements/` statuses (drift is the natural checkpoint for `fixed-upstream` re-checks) |
| Stale-gospel gate fired (`eval:qa:lint -- --stale` in PR CI or the daily refresh) | the `truth-maintenance` stale queue owns triage; each case goes through `golden-truth` |
| Corpus-health cadence (periodic, no code change needed) | cross-question contradiction scan over `eval/qa/consistency-register.json` (member hashes stamped by `npm run eval:qa:register`) + a sampled refute-then-repair sweep weighted toward freshness-sensitive, numeric/version, and `truth.status != "confirmed"` cases (fixes through `golden-truth`) + re-verify any `dateContingentTraps` whose trigger has passed |

Tracking (see [`AGENTS.md` “Coordination”](../../../AGENTS.md#coordination)): open
`.agents/rounds/<YYYY-MM-DD>-<lane>.md` as the round's working record (numbers, per-case notes,
triage table, findings drafted). Repo fixes discovered during the round become **their own
`.agents/TODO.md` entries** — never `improvements/` files.

**Pre-spend plan review — a launch gate for any round with paid instruments** (QA, agentic,
live-data). Before the first paid token: draft the round brief in the round ledger (instruments,
sample, reading rules, budget); have it adversarially reviewed by a tier from the
[`AGENTS.md` routing rules](../../../AGENTS.md#model-routing-for-repo-work-fan-out) that is
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

**Cost estimates come from stored runs, never from a per-case figure in a README.** Read
`meta.totalCostUsd` out of `eval/qa/results/*.json` for combined answering and judging cost. Use
`meta.totalAgentCostUsd` and `meta.totalJudgeCostUsd` only for the component breakdown. Quote the
observed range and median for the same lane, contract, denominator, model, rubric, and pack. A
range derived from per-case figures has excluded most real runs before.

**Use the implemented total method cap for every paid QA command.** Pass exactly one
`--max-budget-usd` to `run-qa.mjs`, `--judge-stored`, `re-judge.mjs`, or
`eval/discovery/run-agent-discovery.mjs`. A missing or duplicate flag stops the command before a
paid call. The harness sends only the remaining authorized amount to each sequential answering or
judge call. Reported cost reduces the ledger, exhaustion stops the next call, and the artifact
retains incomplete and unattempted IDs. A budgeted call with no reported cost invalidates the
method. Record the real CLI path, version, and hash.

**Pin the immutable executable, not a self-updating launcher.** A CLI launcher such as
`~/.local/bin/claude` is a link that any other session on the machine can move during an update.
Put a private directory first on `PATH` that holds only a link to the versioned file, turn off the
CLI's auto-update in the collection shell (for Claude Code, `DISABLE_AUTOUPDATER=1`), freeze the
environment identity in that shell, and re-verify the binary and environment before each paid
command. A changed pin stops the method before the next paid call; never re-derive the expected
value after a mismatch.

`run-qa.mjs` and `run-agent-discovery.mjs` use fail-closed CLI syntax: every value flag requires the
spaced `--flag value` form, `--no-judge` is the only boolean flag, and both runners reject every
equals form, unknown flag, stray argument, missing required value, and duplicate before any paid
call.

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
window. The coordinator owns the round ledger and spawns isolated reviewers (as `AGENTS.md`
"Coordination" describes) for:

- wrong/partial QA rows or shards of rows,
- plan/routing regression diffs,
- golden contradiction or freshness clusters,
- improvements filing/follow-up,
- adversarial closeout review.

Each reviewer appends a narrow evidence-backed verdict to the ledger; the coordinator reconciles
and patches. Do not pass the coordinator's expected answer to reviewers.

## Step 1 — free preflight (always)

```sh
npm run eval:selftest           # grader math sanity + live-contract pins — no server needed
npm run eval:compile            # corpus → eval/routing-cases.json (deterministic)
npm run eval:qa:compile         # only if running QA; always emits cases.json + sample.json
npm run eval:qa:lint -- --stale # owned-corpus lint lanes + the stale-gospel gate (CI runs this)
# Editing judge-facing gospel (answer/keyFacts/avoid/notes)? Add --since <base-ref>.
# Without it the diff-based gospel gate SKIPS locally (a NOTE line only) while CI enforces it
# against the push base, so a clean local lint is vacuous for that lane.
```

Compiles are deterministic and never touch the hand-authored files: the owned QA battery
(`eval/qa/corpus/battery/**`), the routing supplements (`eval/skills-cases.json`,
`eval/build-question-overlay.json`), and the frozen live contracts
(`eval/qa/corpus/live/live-cases.json` and the opt-in
`eval/qa/corpus/live/live-digest-supplement-cases.json`). `eval:selftest` pins both live
contracts by membership and digest; change their case content only with a recorded provenance
note, contract-version bump, and digest update. Generated files (`routing-cases.json`,
`qa/cases.json`, `qa/sample.json`, `qa/lifecycle-registry.json`, `plan/op-classes.json`) are never
hand-edited — CI byte-pins them.

## Step 1b — paid judge behavior self-test (only when judging semantics move)

`npm run eval:qa:selftest` needs no MCP server, so it is easy to mistake for a free preflight
command. It is paid: it calls the configured judge once for each `SELF_TEST_CANDIDATES` entry
(seven judge calls). CI never runs it. Obtain paid authorization, record a seven-call cap, and
record the judge model before you run it. Reconcile its printed `actual` count against your cap,
and treat a nonzero `missingCosts` as an incomplete spend figure.

Run it when the judging rubric, prompt, evidence pack, or judge adapter changes. Otherwise skip it.

## Step 2 — live server (only for QA / agentic / live-data lanes)

Reuse a running server first. Look for a pane already running `npm run dev:eval` (`herdr pane list`)
and read its bound port from that pane's output (`herdr pane read <id>`). Pass that port to the
eval runner. Do not start a duplicate Wrangler process.

If no dev pane exists and a live lane needs one, split your own pane and run
`npm run dev:eval -- --port <port>` there. Close only a pane you split yourself, and stop it before
finalizing. The `dev:eval` launcher adds the required `--host localhost` flag: without it, the
production routes make Wrangler present a public hostname, the `DEV_ALLOW_UNAUTHENTICATED`
loopback gate never fires, and every request returns 401. Routing and plan lanes need no server.

Loopback dev-bypass sessions carry a fixed `dev-local` artifact owner, so eval runs exercise the
full artifact lane (writes go to the local simulated R2 binding, never production). Truncated
execute results end in a `--- SOURCE BASIS ---` block; transcript reviewers should expect it, and
answering agents may follow up with `codemode.artifact.read`.

Readiness check before launching any lane (a plain GET on `/mcp` is not meaningful — probe
with a real MCP initialize; expect `200`):

```sh
PORT=<port read from the dev pane>
curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${PORT}/mcp" \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
```

QA collection is identity-guarded. The launcher requires a clean worktree and compiles its commit
into MCP `serverInfo`. `run-qa.mjs` requires the server revision, the surface SHA-256, the agent
binary and environment identities, and a pinned remote identity probe, and it checks them again
after collection. Any change marks the artifact non-comparable and suppresses aggregates. Never
resume such an artifact under the same authorization. The guard contract, isolation flags, and the
`meta.*` fields to confirm are in `eval/qa/README.md`. Compute the identities in the same shell as
the paid run, after every Claude-related environment variable has its final value:

```sh
SERVER_REVISION=<clean 40-character server commit>
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface.json
SURFACE_SHA256=<surfaceSha256 from the report>
AGENT_BINARY_SHA256=<SHA-256 of the capped Claude wrapper resolved on PATH>
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
```

The stable probe command captures three vectors at five-minute intervals and fails unless all three
match. Run it for each new paid authorization.

## Step 3 — run the instruments

```sh
# Routing (gate): prints legacy-strict, skills-lane, extended, accept-either tables
npm run eval:routing -- --gate            # exit 1 on gate breach or changed denominator

# QA headline (sample) — variant A = the shipped `search` tool
node eval/qa/run-qa.mjs --variant A --sample 30 --max-budget-usd "$MAX_BUDGET_USD" --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" --remote-identity-probe "$REMOTE_IDENTITY_PROBE" --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
# targeted smoke: --ids a,b,c ; collect-only: --no-judge ; overrides: --model/--judge-model

# QA live-data lane (grounding behavior; graded behaviorally, never on snapshot values):
# the same command with --cases eval/qa/corpus/live/live-cases.json instead of --variant/--sample.
# Opt-in digest supplement: --cases eval/qa/corpus/live/live-digest-supplement-cases.json,
# reported separately from the canonical lane.

# Plan regrade (offline, reads stored transcripts)
npm run eval:plan -- eval/qa/results/<stamp>-variantA.json

# Agentic lane (Claude Code only — needs the Workflow tool): reuse the running server, then invoke
# the Workflow tool with eval/agentic/workflow-agentic-routing.js and
# args {"port": Number(process.env.PORT), "cases": [...]} mapped from eval/agentic/sample.json
# (id/question/expected_service). Other agents: skip, or follow eval/agentic/README.md "Method".
```

The QA runner is sequential (one agent + one judge call at a time). Let the runner own execution
and spend agent effort on **review** (Step 4). If you shard, keep one results file per shard and
report lanes separately.

Result reporting follows the contracts in `eval/qa/README.md`: the five-track result contract
(T1–T5, when a result stamps `meta.trackSchema: "qa-five-track-v1"`), the golden lifecycle
partition (active versus quarantined IDs, printed as `active k of N selected`), and the paired
verdict. Never emulate a retry with an ad hoc rerun, and keep the corpus-health report separate
from system performance.

## Step 4 — gate verdicts and agentic review of results

**Gates first.** `eval/gates.json` holds the thresholds for the legacy, skills, and holdout gates
(manifest-exposed entries only). On a FAIL:
- If the change is a regression → fix or revert; don't rationalize.
- If the numbers moved legitimately (drift, deliberate policy change) → re-baseline:
  update `gates.json` **in the same commit** as the change that moved the numbers, record the
  decision in the ledger, check per-case hit→miss regressions (zero regressions is the standard),
  and fill the `$comment`/`note` provenance fields.

**QA verdicts are NOT ground truth — review them agentically before believing them.**
Known judge failure modes (from `eval/qa/README.md`):
- Transcript visibility is conditional: cases tagged live-data/freshness (or explicitly
  transcript-tagged) get a deterministic transcript source-basis evidence pack in the judge
  input; untagged cases are judged corpus-blind, where transcript-invisible corpus-grounded
  specifics get misgraded as fabrication. **Live-verify every `wrong` verdict** by re-executing
  the claim against the live service before counting it as an agent failure; past rounds
  overturned most of a run's wrongs as judge artifacts.
- Judge variance: verdicts are single samples. Before treating an isolated or flipped `wrong` as
  real, re-judge the identical row once; a verdict that flips on identical input is variance:
  record it monitor-only. Read `wrong` counts before `correct` counts, and compare variants only on
  the same sample. Use `eval/qa/re-judge.mjs <results> --ids a,b` or
  `--flips-vs <baseline-results>` for an identity- and tuple-guarded re-judge artifact; a paid
  re-judge requires exactly one `--max-budget-usd`. Never cross-compare runs judged under different
  rubric/pack versions without a re-judge (`JUDGE_RUBRIC` in `judge.mjs` is the current version;
  verdicts carry `{rubric, packVersion, promptSha256}` stamps). The comparability rules and the
  noise floor live in `eval/qa/README.md` ("Judging rubric and score comparability").
- **Denominator:** read current membership from `eval/qa/lifecycle-registry.json` and the selected
  case IDs. Sample-30 is proportional by service with even-spaced picks over id-sorted strata, so
  adding cases can change sampled IDs without a sampler change. Before claiming movement across a
  denominator change, use an explicit common-ID list or disclose the membership churn. Historical
  runs and frozen plans keep their original denominators.
- Freshness cases: sourced drift from the golden snapshot is fine; confident unsourced
  contradiction is not. Expect a small floor of judge-vs-live disagreements.
- **Avoid-clause bypass of the rubric-v2 addendum**: a golden whose must-avoid item bans claims
  "beyond corpus support" (or similar evidence-support phrasing) lets a corpus-blind judge read
  "not in the golden" as "must-avoid matched". Treat any `wrong` verdict whose rationale cites an
  avoid item phrased in terms of corpus/evidence support as a suspect artifact until live-verified.

The experimental paired stored-run verdict (`npm run eval:qa:paired`, the
`qa-paired-ordinal-ni-v1` estimand, and the `npm run eval:qa:paired:collect` launch contract) is
not a ship gate. Its full contract is in `eval/qa/README.md` ("Paired verdict"). Paid paired
collection waits for owner decision A in `.agents/TODO.md`, which also holds the open margin
question.

Fan out sub-agents for this review when the run is big: one per `wrong`/`partial` case, each
re-executing the disputed claims live (production or dev `execute`) and returning a verdict
+ evidence. Or shard by evidence type (docs-index freshness, Scout/Lumenloop corpus claims, plan
transcripts) when that is cheaper. Keep the write sets disjoint: reviewers append to the ledger;
the coordinator edits repo files.

New rows store the canonical judge input in `caseInput` under `qa-judge-case-v2`, including
`golden`. Join legacy rows that lack it with `eval/qa/cases.json` on `id`:

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
| Eval-side gap: stale golden, mislabeled case, missing lane coverage | golden disagrees with live truth from the service's own mouth | `.agents/TODO.md`; the fix lands in the owned case file **via the `golden-truth` skill**; freshness-drifting truth moves to the live-data lane as behavioral golden |
| **Upstream data/content gap**: missing fields, unordered arrays, empty lanes, extraction quality, stale skill content | correct agent + correct plumbing still can't answer from what the service returns | **`improvements/` finding** |
| **Upstream semantics/spec gap**: response contracts, error shapes, vocabulary, index tokenization/ranking | the service works but its self-description or behavior misleads any consumer, not just us | **`improvements/` finding** |
| Corpus-coverage diagnostic: canonical truth exists elsewhere and no tested surface undertakes to host it | the answer is verifiable from its canonical owner, while the miss only proves that one corpus/index does not carry it | keep truth and provenance in the golden; record a local coverage/monitoring result, not a manufactured Docs/site issue |

**Before accepting a reported "regression", check whether the mechanism is a threshold doing its
job.** A reviewer reporting that a change dropped a keyword, a hit, or a rank is reporting an
OUTCOME, not a cause. Find where the input came from and what the threshold actually measures
before writing a fix. Example: an upstream envelope property that spreads across many operations
raises a token's document frequency past the scorer's cut, so the token drops from every
operation. That is the document-frequency filter doing its job, not a regression to special-case.

Anti-overfitting rules bind here: zero-hit routing cases stay failing until a *general*
mechanism fixes them; no query→service maps, no per-question vocabulary. If the only fix
you can imagine is case-specific, the case stays red and the note says why. The same rule binds
operator Algolia access: a docs-search rule or synonym must be a general mechanism with a
measured win on the A/B harness (`npm run eval:algolia-raven`) before it lands, and content-shaped
gaps still go upstream. The `improvements-pipeline` skill's "Direct Algolia remediation" section is
the gate.

**Keep case evidence in the round record.** Production descriptions, keywords, examples,
archetypes, scorer constants, and tool instructions express a general user intent. Give each
proposed edit a source owner. A failed case supplies the test, not its wording. Case ids, question
phrases, and golden answer fragments stay in the round record. When the first failed boundary is an
upstream content or contract gap, create or update the improvement before proposing local wording.

**"Do not act yet" bucket.** A finding backed by a single case goes into a named
monitor-only list in the round record, not into a fix. The bar for acting: the same
failure across 2+ unrelated cases, a contract mismatch, a reproducible infra bug, or
trace evidence the model was asked the wrong thing.

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

**A golden fix always carries its provenance.** The `golden-truth` skill owns the gospel-change
doctrine: every judge-facing change updates `truth.verified` with live evidence and a `rootCause`
that points at the real defect (`improvements/` finding, `.agents/TODO.md` entry, or
`freshness-drift`). The CI gospel-change lint checks that the fields exist; the reviewer checks
that they are true.

## Step 6 — file the findings (the round's primary artifact)

Use the `improvements-pipeline` skill for collections, IDs, frontmatter, intake, filing, and
lint. Charter: `improvements/README.md`. The round-specific bar:

- **Verified requires live re-execution evidence** — a judge's opinion alone never
  graduates a finding past `proposed`. Probe the live service yourself (production
  `execute` on free ops is the usual instrument) and record exactly what came back.
- Quantify prevalence ("4 of 11 completed events"), so upstream can judge routine vs edge.
- The Recommendation is written for the **service owner**: concrete, self-describing-data
  biased, with the consumer-side workaround this repo shipped noted (commit ref) so they
  see the cost of not fixing it.
- Skills findings target the **source repos**. Bodies are not vendored here (pinned + fetched),
  so there is nothing local to patch and re-pinning is not a fix.
- Update existing findings rather than filing near-duplicates; a residual after an upstream fix
  becomes a successor finding.
- At closeout, list every verified finding that the round did not file. Record its intake status
  and the next filing action or explicit deferral reason.

## Step 7 — close the round

Results JSONs are **local-only evidence** (`eval/**/results/`, gitignored).
Record result stamps, numbers, and interpretation limits in the round ledger.
Place retained dated evidence in `research/audits/` or `eval/qa/reviewed/`.
Link required evidence from the relevant lane guide.
Apply the [retention rule](../../README.md#retention) when closing the round.

Close-out checklist:
- [ ] Gate verdict recorded (and `gates.json` re-baselined in-commit if legitimate)
- [ ] Dated results recorded; lane guides link the evidence their current contracts need
- [ ] Every failure triaged (step 5 table complete in the round ledger)
- [ ] New/updated `improvements/` findings committed — a round with zero findings needs an
      explicit "nothing new surfaced, here's what was re-checked" note to be credible
- [ ] Own-repo fixes filed in `.agents/TODO.md` (not improvements/, not silently patched)
- [ ] Corpus lint green: `npm run eval:qa:lint -- --since <ref> --stale` passes over any case
      edits, and `npm run eval:qa:register` re-stamped/reopened clusters
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
