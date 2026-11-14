---
name: run-evals
description: Plan and run scoped evaluations, check routing gates, compare answer quality or client models, review stored verdicts, or close an eval round. Name the decision first, run the smallest instrument that can change it, call the result early, and route evidence-backed findings.
---

# Run evals

Every instrument asks one question at some layer: does an agent driving this MCP end to end give a
correct, current, non-fabricated answer? The instruments and their contracts live in
[`eval/EVALS.md`](../../../eval/EVALS.md) (map), [`eval/README.md`](../../../eval/README.md)
(routing), and [`eval/qa/README.md`](../../../eval/qa/README.md) (QA flags, identity pins, judge
contract). This skill decides what to run, how much, and what to do with the result.

## 1. Decide before you spend

The size of the work is what to keep small: how long it takes, what it costs, and where it runs.
Routing, plan, lint, and self-test checks are free: run them whenever their inputs changed. Before
any paid call or long agent task, write four lines in the round ledger or pull request:

1. **Decision.** What changes with the result: ship or revert, switch a model, file a finding.
2. **Smallest run.** The fewest cases, arms, and clients that can change that decision. Reuse a
   stored result when its case, model, rubric, pack, and source identities match. A new session is
   not a reason to collect again.
3. **Stop rule, cap, and estimate.** The observation that ends the run for each outcome, the
   dollar cap (`--max-budget-usd`) or call count, and the expected time and cost.
4. **Review coverage.** Which rows get transcript review: safety rows, failures, and
   decision-changing disagreements first, plus a fixed sample of agreements.

Then hold to it:

- Call the result as soon as the evidence meets the stop rule. Do not buy a confirmation round, a
  second look, or a re-judge that cannot change the decision.
- A no-switch or inconclusive result finishes the round. Never expand collection or review to get a
  preferred answer.
- A changed scope or stop rule is a named amendment: keep the old results, failures, and
  denominator, and report the new sample separately.
- A paid run needs the owner's spending authorization. One call-count or dollar authorization
  covers one method run; a re-run needs its own, even when it repairs the method.
- Get an independent review of the four lines only when the owner asks for one, or when the run is
  a multi-arm comparison or a source-addition lane
  ([`references/source-addition.md`](references/source-addition.md)). Reuse that review while its
  inputs hold. A missed review blocks launch; it does not invalidate data already collected.
  [`research/audits/2026-07-11-eval-round-orchestration.md`](../../../research/audits/2026-07-11-eval-round-orchestration.md)
  records what such reviews catch.

**Cost counts.** Record cost per answer beside correctness for every arm. Prefer the more correct
path only when the alternative is far less correct: new wrong answers, fabrication, or a failed
safety or trap behavior. A path that is much cheaper and only slightly less correct can be the
better product, because two calls for the price of one leave room for clarification and refinement.
State both numbers and make the call; scores are evidence, not the decision.

## 2. Clients, models, and billing

| Client under test | CLI and model ID | Use |
|---|---|---|
| Claude Sonnet 5.5 | `claude --model claude-sonnet-5-5` | Default set |
| GPT-6.1 Terra | `codex -m gpt-6.1-terra` | Default set |
| Grok 4.7 | `grok --model grok-4.7` | Default set |
| Claude Opus 5.5 | `claude --model claude-opus-5-5` | Add only where a stronger client can change the decision |
| GPT-6.1 Sol | `codex -m gpt-6.1-sol` | Add only where a stronger client can change the decision |

- Do not test or evaluate with Haiku or GPT-6 Luna. They are uncommon among users and too
  inconsistent to weigh.
- One client is enough when the decision does not depend on the client. Add clients only for a
  client-dependent decision.
- **Run here, on `hc`.** Development tests and evals use the local `wrangler dev` server
  (`npm run dev:eval`) and the subscription CLIs (Claude Code, Codex, Grok) driven through `hc`,
  before any API-billed path (Cloudflare AI Gateway, provider APIs). Use API billing only when no
  CLI can do the job, and say why in the four lines. Two lanes qualify: the Playground lane,
  because the product route itself calls the Gateway, and the Gateway second judge, because no CLI
  guarantees a tool-free judge.
- The QA runner and the discovery agent arm spawn headless `claude -p` themselves. Start the runner
  as an `hc` child (`hc run --bg --name <lane> ...`) and `hc wait` for it. `--model` selects the
  Claude client.
- Codex and Grok have no committed runner. Run them as `hc` lanes with the launch lines in
  [`.agents/model-roster.md`](../../model-roster.md), register the loopback MCP URL with
  `codex mcp add` or `grok mcp add`, and have each lane write its answers to a file. Report the
  result as a client diagnostic with its own denominator; never merge it with QA-runner results.

Three roles stay separate. The **orchestrating agent** runs this skill and never answers cases
itself. The **answering agent** and the **judge** are spawned by the runner. Their defaults
(`AGENT_MODEL` in `eval/qa/run-qa.mjs`, `JUDGE_MODEL` in `eval/qa/judge.mjs`) are a measurement
contract: they move only by a recorded eval decision, never by the repo-work routing in
`AGENTS.md`. The judge stays on its pinned model so that verdicts remain comparable across runs. Report the answering model, judge model, rubric, pack, case count, and results stamp
with every QA number.

## 3. Pick the instrument

| What changed or what you ask | Run |
|---|---|
| Scoring, catalog, or manifest | `npm run eval:routing -- --gate` (free, seconds, always) |
| Retrieval work (decomposition, vocabulary) | Routing; the extended lane is the target, the legacy lane the non-regression gate |
| Skill routing or skill store | Routing; read the skills lane against its floor |
| Upstream drift refresh landed | Routing gate; refresh `improvements/` statuses |
| Tool descriptions, MCP instructions, nudges | Small QA sample plus plan regrade; routing math does not move |
| Answer quality before and after a big change | QA battery on matched IDs (headline, paid) |
| Executor, adapter, or envelope | QA live lane (`--cases eval/qa/corpus/live/live-cases.json`) |
| Search behavior of agents | Agentic lane (paid, Claude Code Workflow tool, live server) |
| Tool-plan question on a stored run | `npm run eval:plan -- <results>` (free, offline) |
| Stale-gospel gate fired | `truth-maintenance` owns the queue; each case goes through `golden-truth` |
| Playground model or prompt | `eval/playground/README.md` (paid, API-billed) |

Open `.agents/rounds/<YYYY-MM-DD>-<slug>.md` for a round with paid instruments or several lanes;
a single free check needs no ledger. Use `truth-maintenance` only for an explicitly broad round.

## 4. Free checks

```sh
npm run eval:selftest            # grader math and frozen live-contract pins
npm run eval:compile             # corpus -> eval/routing-cases.json
npm run eval:routing -- --gate   # exit 1 on a breach or a changed denominator
npm run eval:qa:compile          # only when QA cases changed
npm run eval:qa:lint -- --stale  # add --since <base-ref> after editing judge-facing gospel
```

Without `--since`, the gospel-change lane skips locally while CI enforces it. Generated files
(`routing-cases.json`, `qa/cases.json`, `qa/sample.json`, `qa/lifecycle-registry.json`,
`plan/op-classes.json`) come from these scripts; CI byte-pins them. The two live contracts are
frozen: change them only with a provenance note, a contract-version bump, and a digest update.

`npm run eval:qa:selftest` is **paid** (seven judge calls) although it needs no server. Run it only
when the rubric, prompt, evidence pack, or judge adapter changed, under its own authorization.

## 5. Paid runs

1. **Server.** Reuse a terminal already running `npm run dev:eval` (`hc ls`, then `hc read <t>` for
   its port). If none exists, start your own: `hc run --bg --name dev-eval npm run dev:eval --
   --port <port>`, then `hc wait dev-eval --output Ready`. Stop only a server you started. Use
   `dev:eval`, not `dev`: without its `--host localhost` every request returns 401.
2. **Readiness.** A plain GET on `/mcp` proves nothing. Expect `200` from a real initialize:

   ```sh
   curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${PORT}/mcp" \
     -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
   ```
3. **Pins and cap.** Compute the identity pins in the collection shell as
   [`eval/qa/README.md`](../../../eval/qa/README.md#identity-and-budget-requirements) describes,
   and pass exactly one `--max-budget-usd`. A changed pin stops the method; a new pin needs a new
   authorization. Never resume a stopped artifact under the same authorization.
4. **Estimate cost from stored runs**, not from a per-case figure in a README: read
   `meta.totalCostUsd` in `eval/qa/results/*.json` for the same lane, model, rubric, and pack, and
   quote the observed range and median.
5. **Run.**

   ```sh
   # QA sample (variant A = the shipped search tool); add the pin flags from eval/qa/README.md
   node eval/qa/run-qa.mjs --variant A --sample 30 --port "$PORT" --max-budget-usd "$MAX_BUDGET_USD" ...
   # smallest run: --ids a,b,c   collect only: --no-judge   other client: --model <id>
   # live lane: --cases eval/qa/corpus/live/live-cases.json instead of --variant/--sample
   npm run eval:plan -- eval/qa/results/<stamp>-variantA.json   # free regrade of the stored run
   ```

   The agentic lane needs the Claude Code Workflow tool; follow `eval/agentic/README.md`. Report
   QA by the five-track contract in `eval/qa/README.md`, and never emulate a retry with an ad hoc
   rerun.

Before reading any aggregate, assert the expected job count. A harness that filters failed jobs
shrinks the denominator silently. A short run forbids an aggregate or a baseline delta; a paired
per-row comparison on the completed jobs stays valid. When attributing a delta across several
landed changes, name the cases each change can affect before the run, or claim only a diagnostic.
The noise floor bounds what variance can explain; it is not a significance threshold.

## 6. Read the result

**Gates first.** `eval/gates.json` owns the legacy, skills, and holdout thresholds. On a failure,
a regression is fixed or reverted. Re-baseline only when the numbers moved for a legitimate, named
reason (drift, a deliberate policy change): update `gates.json` in the same commit, check per-case
hit-to-miss regressions (zero is the standard), and fill its provenance fields.

**QA verdicts are evidence, not ground truth.** Review the declared rows against the full
transcript and the exact golden. `caseInput` on each row holds the judge input; a review packet
needs the question, golden, `trap` and `freshness` tags, as-of metadata, and transcript. Truncated
execute results end in a `--- SOURCE BASIS ---` block.

- Read `wrong` counts before `correct` counts. Compare runs only on the same case IDs, model,
  rubric, and pack; the sampler can change membership when the corpus grows.
- Untagged cases are judged corpus-blind, so a grounded specific that the judge cannot see can be
  graded as fabrication. Resolve a decision-bearing dispute from the transcript.
- A verdict is one sample. A flip does not show which grade is right; keep both observations.
  Re-judge (`eval/qa/re-judge.mjs`, one `--max-budget-usd`) only when it can settle the decision.
- For freshness cases, a sourced difference from the golden snapshot is fine; a confident unsourced
  contradiction is not.
- A `wrong` whose rationale cites a must-avoid item phrased as "beyond corpus support" is a suspect
  judge artifact until verified live.
- The paired verdict (`npm run eval:qa:paired`) is experimental and never a ship gate.

## 7. Triage reviewed failures

Classify each reviewed failure and surprising pass. Disclose unreviewed rows; they are not passes.

| Root cause | How to recognize | Where it goes |
|---|---|---|
| Judge artifact | Live re-execution contradicts the verdict | Round record; rubric note if the mode is new |
| Agent failure | Tool use or synthesis is wrong in the transcript | Round record; `.agents/TODO.md` only for a pattern |
| Own-repo gap (scoring, catalog, executor, adapters) | Search buried the right entry, or a normalizer misread a payload | `.agents/TODO.md`, never `improvements/` |
| Eval-side gap (stale golden, mislabeled case) | The golden disagrees with the service's own live answer | `.agents/TODO.md`; fix through `golden-truth` |
| Upstream data or content gap | Correct agent and plumbing still cannot answer from what the service returns | `improvements/` finding |
| Upstream semantics or spec gap | The service's self-description misleads any consumer | `improvements/` finding |
| Corpus-coverage diagnostic | The truth lives with another canonical owner and no tested surface undertakes to host it | Keep truth in the golden; record a coverage result, not a Docs issue |

- **Bar for acting.** The same failure in two unrelated cases, a contract mismatch, a reproducible
  infrastructure bug, or trace evidence that the model was asked the wrong thing. A single-case
  finding goes on a named monitor-only list in the round record.
- **No overfitting.** Fix a general mechanism or leave the case red with a note. No
  query-to-service maps and no per-question vocabulary. Case IDs, question phrases, and golden
  fragments stay in the round record, out of descriptions, keywords, scorer constants, and prompts.
  The same bar binds docs scoping changes (`improvements-pipeline`). When the first failed boundary
  is an upstream gap, file or update the finding before you propose local wording.
- **A reported regression is an outcome, not a cause.** Before you special-case a dropped keyword
  or rank, check whether a threshold (for example the document-frequency cut) is doing its job.
- **Before a wording fix**, read what the model was already told at the failure moment, nearest
  first: guard and `codemode.*` error strings (`src/executor/providers.ts`), truncation footers
  (`src/policy/truncate.ts`), adapter hints (`src/adapters/`), `search` `nextSteps`, tool
  descriptions and `SERVER_INSTRUCTIONS` (`src/mcp/tools.ts`), then catalog descriptions (generated;
  change `scripts/`). If the prose already teaches the behavior, prefer a mechanism (a fail-loud
  guard, an error that carries the fix) over more words. If it is absent or wrong, change the one
  surface nearest the failure. Measure before and after on the same instrument and revert a prose
  edit with no measured shift. A catalog description change re-runs the routing gate.
- **Findings.** Use `improvements-pipeline`. A judge's opinion never moves a finding past
  `proposed`; `verified` needs your own live re-execution. Update an existing finding before filing
  a near-duplicate.
- **Goldens.** Every judge-facing change goes through `golden-truth` with live evidence and a root
  cause. A desired score is never a reason.

## 8. Close

Results JSON is local-only evidence under ignored `results/` directories. Record in the ledger or
pull request: the decision and the evidence that met the stop rule, result stamps, models, cost,
review coverage, retained failures, and limits. Keep dated evidence in `research/audits/` or
`eval/qa/reviewed/` only when a current artifact needs it
([retention](../../README.md#retention)). Then check:

- Gate verdict recorded; `gates.json` re-baselined in-commit if the movement was legitimate.
- Verified findings filed or explicitly deferred; own-repo fixes are `.agents/TODO.md` entries.
- After case edits, `npm run eval:qa:lint -- --since <ref> --stale` is green and
  `npm run eval:qa:register` re-stamped the clusters.
- A requested independent review finished and every finding was reconciled.

## Hard rules

- One headline (QA end to end) and three routing gates; everything else is diagnostic. Lanes never
  merge, denominators never change quietly, and no view becomes a gate without a recorded decision.
- When two instruments disagree, the one closer to the headline wins.
- No per-question tuning. No schemas or judge code copied from prior-art repos.
- Freshness-sensitive truth is graded as behavior, never as pinned values in a gate.
- Never print or commit secrets. Paid Lumenloop research stays off; eval runs use free operations.
- Sandbox and network posture is never relaxed for eval convenience.
