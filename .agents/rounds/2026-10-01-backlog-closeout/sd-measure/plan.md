# Stellar Docs adapter measurement plan

Phase 1 only. Date: 2026-10-01. No measurement or paid call ran while preparing this plan.

## Authority and launch conditions

The coordinator must obtain an independent review from another model tier before Phase 2.
The reviewer must differ from the author and coordinator, as the repository instructions require.
Reconcile every finding before launch. A major plan change requires a focused second review.
The coordinator's explicit go remains necessary after that review.

The [run-evals skill](.agents/skills/run-evals/SKILL.md) controls this measurement.
Its Step 0 requires a reviewed plan, fixed inputs, and enforceable spending limits.
Step 2 requires a clean server worktree and verified server identity.

The coordinator approved the cost-estimate exception in `go-sd-measure.md` on 2026-10-01.
The method now has a `$90` hard cap for four collections.
The reviewer must confirm these amendments before paid collection.
Paid commands still require the coordinator's explicit `GO PAID`.

The baseline server uses the coordinator's detached worktree:
`/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/sd-baseline` at `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
The coordinator completed dependency installation, the runtime configuration copy, and type generation there.
The candidate server uses this lane's existing worktree at `36787b3a9b051fa366b7648ca201691715253fbc`.
Nobody moves either worktree's HEAD.
Run every `run-qa.mjs` command from the candidate worktree so results stay together.
Compare runner, judge, evidence-pack, and prompt-input hashes across both worktrees before spending.
The lane must not write Git state.
Phase 1 created no server or measurement.
The coordinator now authorizes instrument 1 only, after these amendments.

## Revisions and attribution

Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/sd-adapter`.
Baseline: `bcfa617ffcb6e58e6a7498a1e42135a059535402` (`main` when assigned).
Candidate: `36787b3a9b051fa366b7648ca201691715253fbc`.
The commit changes exactly the four paths in the adapter report.
Do not substitute a newer `main` or a branch name for either recorded commit.

The candidate adapter currently has SHA-256 `0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93`.
Require the candidate commit and that adapter hash to match before execution.
Any code revision requires a plan update and review before collection.
If the coordinator adds a ledger-only commit, update the recorded candidate revision before launch.
Verify that all measured source hashes remain unchanged.

| Change | Deterministic affected call | Cases |
|---|---|---|
| Default | `search_docs`, `search_doc_titles`, or `search_meeting_notes`, with `hitsPerPage` omitted | The exact per-operation lists in Appendix A |
| Retained content | Any of the eight category operations, with `includeContent: true` | The exact per-operation lists in Appendix A |
| Miss text | Any search with no retained hits, or page-section retrieval with no exact-page seed match | All operation lists in Appendix A; emphasize the five named miss cases below |

All operation names in this table use the `stellarDocs.` namespace.
The content change must preserve the full output envelope on a stable index.
It receives a free live differential, rather than a dedicated paid content slice.
The paid sample can encounter this content path incidentally.
Attribute an answer change only when its trace reaches the affected call predicate.

The case lists come from `reports/sd-adapter-measurement.json` under `$B`.
That file joins exact operation IDs against `case.surface` in `eval/qa/cases.json`.
Cases contain questions and expected operations. They contain no fixed adapter arguments.
Thus, these lists define candidate coverage, not guaranteed agent execution.
No case-level causal claim follows from `surface` membership alone.

The five emphasized miss cases are:

- `q-edge-doc-title-zero-hits`
- `q-edge-doc-category-filter-empty`
- `q-edge-doc-page-sections-soft-empty`
- `q-edge-noinfo-sep-9999`
- `q-edge-open-world-recovery-after-narrow-miss`

## Free preflight before Phase 2 collection

Run these commands after the coordinator freezes the clean revisions.
Capture each command's output in a separate file. Do not pipe gate commands.

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:qa:compile
npm run eval:qa:lint -- --stale --enforce-floors
npm run eval:qa:register -- --check
npm run eval:routing -- --gate
git diff --check
```

Require generated outputs to remain byte-identical to their reviewed pins.
If a compile changes them, stop and let the coordinator reconcile the change before any server launch.
Retain the adapter lane's passing typecheck, test, build, routing, and secret-scan receipts with their source hashes.
No judging semantics changed, so the paid judge self-test does not apply.

## Instrument 1: free live differential

Run this instrument first. It uses live Algolia reads and no model calls.
Compare the baseline adapter and candidate adapter directly, without a Wrangler server.
Use each revision's own manifest entry.
Require all 12 entries to match before comparing adapter behavior.

### Credentials and transport

Use inherited `ALGOLIA_APPLICATION_ID_DOCS` and `ALGOLIA_API_KEY_DOCS` first.
This matches the environment priority in `scripts/eval-algolia-raven.mjs`.
If absent, reuse `parseEnvFile` from `scripts/lib/shared.mjs` inside the process.
Read only the configured `.env` file through that loader, then retain the two runtime values.
The proposed file is `/Users/kalepail/Desktop/stellar-raven-codemode/.env`, matching the existing comparison mechanism.
Do not open, print, copy, or source `.dev.vars`.
Do not print environment values, request headers, or raw transport exceptions.
The script records envelopes, sanitized differences, operation inputs, request bodies, response bodies, request counts, and byte counts.
It redacts both runtime values before writing evidence.
Missing credentials stop the instrument before any request.

The proposed command appears in Appendix B.
It reads baseline source with `git show`; it makes no Git changes.
It uses Node's TypeScript support for the two adapter modules.
The source files go into the worktree's ignored `tmp/` directory.
No operator credential, index mutation, paid method, or model call is involved.

### Input matrix

Each search uses omitted, `1`, and `20` values for `hitsPerPage`.
Each supported operation uses `includeContent: false` and `includeContent: true`.
Do not send unsupported fields merely to complete a matrix cell.
`search_doc_titles` has no `includeContent` argument.
`get_doc_page_sections` has no `hitsPerPage` argument.
The page operation tests omitted, false, and true content values.

| Operation | Exact base input |
|---|---|
| `stellarDocs.search_docs` | `{"query":"Stellar"}` |
| `stellarDocs.search_doc_titles` | `{"query":"Stellar"}` |
| `stellarDocs.search_meeting_notes` | `{"query":"protocol"}` |
| `stellarDocs.search_docs_in_category` | `{"query":"contract","category":"build"}` |
| `stellarDocs.search_anchor_sep_docs` | `{"query":"SEP"}` |
| `stellarDocs.search_asset_token_docs` | `{"query":"asset"}` |
| `stellarDocs.search_protocol_concepts_docs` | `{"query":"transaction"}` |
| `stellarDocs.search_rpc_horizon_data_docs` | `{"query":"RPC"}` |
| `stellarDocs.search_sdk_cli_tools_docs` | `{"query":"CLI"}` |
| `stellarDocs.search_soroban_contract_docs` | `{"query":"storage"}` |
| `stellarDocs.search_wallet_dapp_docs` | `{"query":"wallet"}` |
| `stellarDocs.get_doc_page_sections` | `{"path":"/docs/learn/fundamentals/lumens"}` |

Also test the complete search matrix for `search_docs_in_category` with `{"query":"protocol","category":"meetings"}`.
Test `includeMeetings: true` for the complete `search_docs` and `search_doc_titles` matrices.
These controls cover the condition that disables the category URL filter.

Miss inputs:

1. `search_docs`: `{"query":"\"raven-sd-measure-no-match-20261001\""}`.
2. `search_doc_titles`: the same quoted nonce query.
3. `search_docs`: `{"query":"SEP-9999"}`.
4. `get_doc_page_sections`: `{"path":"/docs/build/raven-sd-measure-no-match-20261001"}`.
5. `search_docs_in_category`: `category: "tokens"`, with each query below:
   `"Configuring a Validator"`, `"stellar-core.cfg"`, and `"QUORUM_SET"`, including the quotation marks.

6. Add a non-positive `search_docs_in_category` input:
   `{"query":"\"Configuring a Validator\"","category":"tokens","includeContent":true}`.
   Require soft-empty on both arms and zero `/1/indexes/*/objects` requests.

The second script preserves all 89 prior inputs and adds 12 frozen inputs, for 101 pairs before default controls.
A live miss input does not guarantee a specific response.
Require observed zero-hit, filtered-nonzero-count miss, and page-section miss coverage.
Require successful nonempty responses for every positive input.
Each category branch must return actual content in at least one content-enabled input.
Each filtered category branch must remove at least one hit through its URL-prefix filter before slicing.
Check the meetings branch through its unfiltered kept record IDs.
A shorter page does not prove that a prefix filter removed a hit.
Missing coverage makes the instrument incomplete. Do not silently replace inputs after seeing results.

### Comparison and pass rule

Compare complete JSON envelopes recursively, including array order and field presence.
Do not compare only selected URLs or hit counts.
Do not ignore snippets, content, breadcrumbs, pagination values, hints, or error types.

Only these exceptions are allowed:

- For omitted limits on the three direct operations, compare the candidate against an additional baseline call with `hitsPerPage: 5`.
  Require identical envelopes after the exact miss-text normalization below.
  For successful page-zero results, require the original baseline hit prefix to equal the candidate hits.
  Preserve `nbHits` and `page`; allow only the documented hit limit and resulting `nbPages` change.
- For soft-empty results, allow only the three exact old-to-new message substitutions in Appendix B.
  Preserve `ok`, `error.kind`, `service`, `status`, and every recovery hint.

For content calls, also verify the transport mechanism.
The candidate's initial search must omit full `content` retrieval.
Its object requests must contain only retained record IDs from the configured index.
They must request only `objectID` and `content`.
Preserve search ordering, snippets, limits, and pagination facts.
No selected hits means no content request.

Stop before paid collection on any mismatch, transport error, missing record, or incomplete branch coverage.
A changing live response is inconclusive, not an allowed mismatch.
Preserve the failed comparison. Any follow-up requires a bounded plan amendment before another method run.
The command permits at most 1,500 HTTP attempts and 30 minutes.
No performance improvement claim follows from this single pass.

## Instrument 2: paid matched QA

The battery sample contains exactly 20 active cases.
It includes the union of the three direct-operation surfaces and the five named miss cases.
The canonical live sample contains exactly 15 cases under `live-data-canonical-v3`.
Run both samples on both revisions. Keep their denominators and reports separate.

### Fixed tuple

- Answer model: `claude-sonnet-5`.
- Judge model: `claude-sonnet-5`.
- Rubric: `v2.10`.
- Evidence pack: `p6`.
- Surface: `search-execute`; variant `A`; search tool `search`.
- Judge policy: forced two-call panel, with the runner's existing worse-verdict aggregation.
- No prompt append, prompt experiment, corpus edit, model substitution, or new retry policy.

`--judge-panel 2` fixes the initial policy across both revisions.
Freeze one stability-register file for all four collections, although the forced panel controls judging.
Generate it through `eval/qa/judge-stability.mjs` before collection and record its SHA-256.

```sh
node eval/qa/judge-stability.mjs \
  --results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results \
  --out "$B/sd-measure-stability.json"
```
The source directory is the main checkout's stored results; read it only.
Do not regenerate the register between revisions.

The runner has no rubric or pack override flags.
Assert the exported constants and file hashes before spending instead of inventing flags.
Appendix C lists the current file pins.
Also assert the runner, judge, evidence-pack, case, and prompt-input hashes match across revisions.
A broader code interval invalidates adapter-only attribution.

### Server sequence and ownership

Use the detached baseline worktree for the baseline server and this lane's worktree for the candidate server.
Never move either HEAD.
Run both baseline collections from the candidate worktree while the baseline server runs.
Stop the baseline server and verify its listener closed.
Start the candidate server, then run both candidate collections from the candidate worktree.
Stop the candidate server and verify its listener closed.
Use the same local day for all four collections.
Do not run two Wrangler processes simultaneously.

Before pane control, confirm `HERDR_ENV=1` and inspect the current Herdr CLI help.
Use the [Herdr skill](/Users/kalepail/.codex/skills/herdr/SKILL.md) for control commands.
Split only this lane's pane with `--current`, an explicit direction, the selected server worktree, and `--no-focus`.
Record the returned pane ID. That pane alone may receive server commands or stop signals.
Check for another eval server before starting. Ask its owner to stop it if necessary.
Never stop or control a parent, sibling, or unknown pane.

Run in the owned server pane:

```sh
npm run dev:eval -- --port 8794
```

Read the actual bound port from the server output.
Require the server's reported revision to equal the selected clean commit.
Use a real MCP initialize probe, then `eval/report-live-surface.mjs`.
Set the runner's `PORT` from that verified output, not from an assumed listener.
Do not bypass the launcher's dirty-tree check.

### Identity preparation

The observed CLI is `/Users/kalepail/.local/bin/claude`, version `2.1.286 (Claude Code)`.
Its real path is `/Users/kalepail/.local/share/claude/versions/2.1.286`.
Its SHA-256 is `75e3016e9d2570767b08e43a7467d4817a4f149232c169ca295f2c95fef21433`.
The runner must resolve this same executable on `PATH` before each command.
Record the path, version, and hash again during Phase 2.
Stop for a mismatch; do not silently update the pin.

Compute the environment identity in the same shell as collection after finalizing all Claude-related variables.
Do not print their values. Require `QA_AGENT_PROMPT_APPEND` to be absent.
Preserve the same environment hash across both revisions.
Run the public remote identity probe before each paid collection authorization.
The probe requires three matching vectors at five-minute intervals.
Require the same vector across all four collections, not merely stability within each collection.
A drift or probe failure stops further spending.

Example preparation, repeated before each collection:

```sh
node eval/report-live-surface.mjs --port "$PORT" \
  --expect-source-revision "$SERVER_REVISION" --json "$B/sd-measure-surface-$METHOD.json"

AGENT_BINARY_SHA256=75e3016e9d2570767b08e43a7467d4817a4f149232c169ca295f2c95fef21433
CLAUDE_PATH=/Users/kalepail/.local/bin/claude
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
```

Set `SURFACE_SHA256` to the verified report's `surfaceSha256`.
Preserve baseline and candidate reports separately.
Freeze the four report hashes and the remote-vector hash in the round ledger before collection.
The initial expected surface can be obtained separately for each clean revision before the collection sequence.
Stop each discovery server before starting the other revision's server.
If the coordinator skips advance discovery, freeze each arm's hash before its first paid call and require cross-arm equality.
These adapter changes do not alter the exposed MCP schema.

### Exact selections and collection commands

Set these literal selections once:

```sh
BASE_REVISION=bcfa617ffcb6e58e6a7498a1e42135a059535402
CANDIDATE_REVISION=36787b3a9b051fa366b7648ca201691715253fbc
BATTERY_IDS=q-agent-identity-erc8004-stellar,q-agent-payment-standard-choice,q-cctp-v2-usdc-stellar,q-comp-clawback-cap0035,q-edge-doc-category-filter-empty,q-edge-doc-page-sections-soft-empty,q-edge-doc-title-zero-hits,q-edge-noinfo-sep-9999,q-edge-open-world-recovery-after-narrow-miss,q-edge-strupey-ambiguous-stellar-history,q-mpp-discovery-and-modes,q-pc-cross-redstone-sep40,q-pc-protocol-upgrade-timing,q-protocol-bn254-poseidon-xray,q-protocol-cap-vs-sep,q-protocol-parallel-execution,q-sor-cross-socketfi-auth,q-sor-doc-title-discovery,q-soroban-constructor-lifecycle,q-x402-payment-verification
LIVE_IDS=q-live-beans-cross-service-reconcile,q-live-builders-artifact-continuation,q-live-ecosystem-crowded-underbuilt,q-live-fluxity-status-provenance,q-live-hackathon-recent-winners,q-live-leaderboard-active-projects,q-live-ll-active-jobs-recency,q-live-ll-guessed-slug-soft-empty,q-live-ll-regions-vocab,q-live-ll-scf-latest-round,q-live-oracle-repo-triage,q-live-rfps-open-now,q-live-rfps-passkey-smart-account,q-live-trap-market-price,q-live-zk-repos-current
```

Set `SERVER_REVISION`, `SURFACE_SHA256`, and `PORT` for the verified current server.
Use the same reviewed identity variables in every command.
Each invocation contains exactly one total budget flag.
No command below runs during Phase 1.

**Baseline battery:**

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/cases.json --ids "$BATTERY_IDS" --max-budget-usd 25 \
  --surface search-execute --variant A --model claude-sonnet-5 --judge-model claude-sonnet-5 \
  --judge-panel 2 --stability-register "$B/sd-measure-stability.json" \
  --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

**Baseline live:**

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/corpus/live/live-cases.json --ids "$LIVE_IDS" --max-budget-usd 20 \
  --surface search-execute --variant A --model claude-sonnet-5 --judge-model claude-sonnet-5 \
  --judge-panel 2 --stability-register "$B/sd-measure-stability.json" \
  --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

**Candidate battery:**

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/cases.json --ids "$BATTERY_IDS" --max-budget-usd 25 \
  --surface search-execute --variant A --model claude-sonnet-5 --judge-model claude-sonnet-5 \
  --judge-panel 2 --stability-register "$B/sd-measure-stability.json" \
  --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

**Candidate live:**

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/corpus/live/live-cases.json --ids "$LIVE_IDS" --max-budget-usd 20 \
  --surface search-execute --variant A --model claude-sonnet-5 --judge-model claude-sonnet-5 \
  --judge-panel 2 --stability-register "$B/sd-measure-stability.json" \
  --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

Record each output path immediately as `BASE_BATTERY`, `BASE_LIVE`, `CAND_BATTERY`, or `CAND_LIVE`.
Do not identify results with a later “newest file” search.
Run the free plan regrade on each recorded artifact:

```sh
npm run eval:plan -- "$BASE_BATTERY"
npm run eval:plan -- "$BASE_LIVE"
npm run eval:plan -- "$CAND_BATTERY"
npm run eval:plan -- "$CAND_LIVE"
```

### Variance control

Compare matched rows only after both arms pass identity and completeness checks.
For each lane, form one sorted union of all cross-arm grade differences and all rows graded Wrong in either arm.
Use that same ID union for both arms.
Rejudge each union once on both arms under the same model, rubric, pack, and two-call panel policy.
This supplies an independent repeated judgment of identical stored inputs.
It does not recollect answers or overwrite the original verdicts.
Skip both rejudge commands for a lane when its union is empty.

The coordinator reduced this method's cap to `$90` for the four collection commands.
The previous four `$15` rejudge allocations are withdrawn.
Repeated judging remains required when the union is nonempty.
Stop before those calls and obtain a separate bounded authorization and reviewed command list from the coordinator.
Do not charge repeated judging to an unused collection allocation.
This amendment does not waive the variance rule or permit release with unresolved grade differences.

The rejudge artifacts must reproduce each stored case and evidence-pack identity.
Set `BASE_REVISION` and `CANDIDATE_REVISION` to the frozen commits for `--cases-ref`.
No `--allow-non-identical`, `--allow-golden-drift`, or ad hoc answering rerun is permitted.
If identical inputs change grade, record judge variance and retain every verdict.
A variance finding cannot excuse a verified wrong claim.
Before counting any Wrong, verify its claims against live sources and the captured transcript.
A grade difference counts as adapter-related only with a matching mechanism trace or reproducible differential failure.

## Costs

The worktree contains no `eval/qa/results/` directory.
I inspected stored `meta.totalCostUsd` values in the main checkout's `eval/qa/results/*.json`.
No available artifact matches `claude-sonnet-5` / `claude-sonnet-5` / `v2.10` / `p6`.
No available run uses this exact 20-case sample and forced two-call policy.
The retained September ledger names newer artifacts, but the referenced temporary runner no longer exists.
Thus, a same-tuple observed range and median are unavailable. Do not present an older tuple as equivalent.

Cost exception: the coordinator explicitly accepts the nearest stored tuples as proxies in `go-sd-measure.md`.
The coordinator cites the owner's 2026-10-01 spending authority.
This exception permits the approximate `$59` forecast despite the missing current-tuple receipts.
It authorizes no paid command before `GO PAID`.
The four hard caps below bound authorized collection at `$90`.

These stored totals provide only historical planning context:

| Lane and denominator | Tuple | Observed totals | Stamps |
|---|---|---|---|
| Battery, 30 rows, 1 run | Sonnet 5 / Sonnet 5 / v2.4 / p5 | Range and median `$20.8868124` | `2026-08-18T17-28-23-variantA.json` |
| Live, 15 rows, 1 run | Sonnet 5 / Sonnet 5 / v2.4 / p5 | Range and median `$9.2531535` | `2026-08-18T18-19-09-variantA.json` |
| Battery, 100 rows, 3 runs | Sonnet 5 / Sonnet 5 / v2.8 / p5 | Range `$30.6364582–$45.711693`; median `$31.9693122` | `2026-08-26T22-02-49-variantA.json`, `2026-08-27T00-02-11-variantA.json`, `2026-08-28T19-27-08-variantA.json` |
| Live, 15 rows, 4 runs | Sonnet 5 / Sonnet 5 / v2.4 / p3 | Range `$8.5746194–$9.5362953`; median `$9.38626445` | `2026-07-12T08-04-12-variantA.json`, `2026-07-14T14-21-46-variantA.json`, `2026-07-27T23-05-03-variantA.json`, `2026-08-14T04-13-13-variantA.json` |

These values include answering and judging. They are not README per-case estimates.
The closest 30-row battery receipt splits into `$15.6595614` answering and `$5.227251` judging.
The closest live receipt splits into `$6.3037797` answering and `$2.9493738` judging.
A rough proxy doubles judging for the forced panel and scales only the battery denominator to 20.
That proxy gives about `$17.41` per battery arm and `$12.20` per live arm, or `$59.22` for collection.
It is not a validated current-tuple forecast.

| Method | Maximum invocations | Cap per invocation | Allocation |
|---|---:|---:|---:|
| Baseline battery | 1 | `$25` | `$25` |
| Candidate battery | 1 | `$25` | `$25` |
| Baseline live | 1 | `$20` | `$20` |
| Candidate live | 1 | `$20` | `$20` |
| **Total collection method cap** | **4** | | **`$90`** |

The total cap counts all answering, judging, forced panels, and harness-permitted retries in these methods.
It includes failed methods and any reported partial spend.
No failed method receives an automatic replacement authorization.
Unused allocations do not transfer to a second invocation or an expanded sample.
The runner passes the remaining method budget to each sequential paid call.
Read the cost ledger after each method before starting another.
Missing cost data invalidates the method and stops further spending.
No reserve authorizes repeated judging, new questions, or judge self-tests.
Independent reviewer orchestration is outside these QA command caps and needs the coordinator's separate allocation.

The coordinator approved the `$90` ceiling using these limited proxies.
No evidence currently justifies a larger cap.
If collection needs a higher cap, stop and obtain a revised reviewed authorization.

## Reading and stop rules

Release requires a complete passing differential and complete comparable QA pairs.
Report T1–T5, selected and completed IDs, initial verdicts, repeated verdicts, and per-row claim evidence.
Keep the 20-case battery and 15-case live lane separate.
These samples cannot establish a full-battery improvement or the weekend paired measurement's conclusion.

A new Wrong blocks release when the differential or trace ties it to an affected call.
A verified lost required fact or new unsupported claim on an affected call also blocks release.
Aggregate gains cannot cancel a confirmed regression.
A new Wrong without sufficient attribution remains unresolved and blocks release approval until triaged.
A deterministic envelope mismatch blocks paid collection and release immediately.

Noise includes a grade flip on identical stored input without a verified factual change.
Unaffected-call variation remains diagnostic, with its trace recorded.
An unchanged upstream defect remains a defect, but it is not evidence of an adapter regression.
No numeric noise floor substitutes for per-row verification or a significance test.
Do not invent a confidence claim from this sample.

Stop on missing credentials, incomplete live coverage, remote drift, wrong revision, changed hashes, lost MCP connection, or failed identity checks.
Stop on incomplete costs, exhausted caps, invalid evidence packs, changed case membership, or unexplained response differences.
A short run retains its original denominator. It cannot become a smaller successful comparison.
No golden, routing label, adapter, corpus, model, or rubric changes occur during collection.
Record any required repair separately and obtain a new reviewed measurement authorization.

Before final acceptance, the coordinator assigns an independent result review from another eligible model tier.
That reviewer recomputes denominators, identities, costs, comparisons, and every proposed regression disposition.
Reconcile all findings before deleting the measurement TODO.
Verified upstream findings follow the improvements workflow; local defects remain in the repository TODO.

## Schedule and collision check

The owner reserves 2026-10-03 or 2026-10-04 for the paired measurement.
Do not run or prepare its paid collection in this lane.
Target all four collections for one local day on 2026-10-01 or 2026-10-02.
Allow four hours for collection and additional time for identity probes and result review.
Do not start collection after 12:00 America/New_York on 2026-10-02.
Stop every owned server and paid child process by 18:00 America/New_York on 2026-10-02.
Confirm the port is closed and the owned pane has returned to its shell.
A missed cutoff produces an incomplete report; it does not authorize weekend continuation.
Any go received after this window requires rescheduling with the coordinator.

## Phase 2 records

Before spending, copy the approved plan and review disposition into the coordinator's committed round ledger.
This lane does not bypass the clean-worktree rule to write that ledger.
Retain original raw artifacts and their hashes under ignored result storage.
Record sanitized differential evidence under `$B/reports/` until the coordinator retains the final evidence.
Write `$B/reports/sd-measure.md` with the requested result, per-case, spend, checks, and open-issue sections.
Update the measurement TODO only after the evidence and independent review meet this plan.

## Appendix A: exact affected case sets

The case-file SHA-256 is `ae221407fad556081391ff0ff01a49a4391c4734fb39f1c9dd4474201369190e`.
The following sets reproduce `sd-adapter-measurement.json` exactly.
Use the default-operation sets for change 1, category-operation sets for change 2, and all sets for change 3.

### `stellarDocs.get_doc_page_sections`

```text
q-edge-doc-page-sections-soft-empty
q-sor-doc-page-sections-followup
```

### `stellarDocs.search_anchor_sep_docs`

```text
q-anchor-endpoint-discovery
q-anchor-moneygram-ramps
q-anchor-platform-what
q-anchor-sdp-vs-anchor-platform
q-anchor-sdp-what
q-asset-issue-asset-howto
q-asset-wallet-sdk-seps
q-comp-anchor-compliance-stack
q-comp-cross-bitso-sep31
q-comp-cross-moneygram-partnership-sep24
q-comp-sep6-vs-sep12-roles
q-comp-sep8-regulated-assets-approval-server
q-crp-become-an-anchor-licensing
q-crp-sdp-operation
q-edge-asset-site-scam-detection
q-edge-exchange-memo-lost-funds
q-edge-inject-ignore-instructions
q-jutsu-cash-crypto-ramps
q-pay-anchor-msb-licensing
q-pay-moneygram-ramps
q-pay-sdp-disbursement
q-production-anchor-architecture
q-protocol-operation-types-list
q-protocol-tier1-requirements
q-raph-buy-xlm-safely
q-raph-merchant-payments
q-raph-offramp-xlm-usdc
q-raph-remittance-path-payment
q-raph-usdc-onto-stellar
q-scf-cross-decaf-sep24
q-sep-1-toml
q-sep-12-kyc
q-sep-31-cross-border
q-sep-38-quotes
q-sep-45-contract-auth
q-sep-6-24-deprecation
q-sep-6-vs-31-misnumber-trap
q-sep-8-regulated-assets
q-sep-catalog-list
q-sep-interactive-deposit-withdraw
q-sep-wallet-seps-list
q-sep6-sep24-sep31-choice
q-sor-doc-timestamping-manage-data
q-ti-custodial-account-generation-c-address
```

### `stellarDocs.search_asset_token_docs`

```text
q-aas-burn-clawback-redemption-mechanics
q-aas-claimable-predicates-expiry-reserves
q-aas-issuer-fees-supply-cap-freeze
q-aas-trustline-limit-lifecycle
q-anchor-moneygram-ramps
q-ass-cross-etherfuse-cetes-controls
q-asset-amm-fee-reserve
q-asset-claimable-balance
q-asset-deploy-sac-cli
q-asset-issue-asset-howto
q-asset-sdex-vs-amm
q-asset-trustline-basics
q-asset-trustline-vs-sac
q-asset-two-account-issuer
q-asset-usdc-eurc-issuer
q-asset-usdc-eurc-path-fx
q-comp-anchor-compliance-stack
q-comp-auth-flags-overview
q-comp-clawback-cap0035
q-comp-clawback-holder-risk
q-comp-sac-inherits-flags
q-comp-sep8-number-lookup-no-deepresearch
q-comp-sep8-regulated-assets-approval-server
q-defi-arbitrage-pathpayment-bots
q-defi-build-staking-for-own-token
q-defi-flash-loans
q-edge-ambig-stellar-token-meaning
q-edge-asset-site-scam-detection
q-edge-exchange-memo-lost-funds
q-edge-metamask-evm-mental-model
q-infra-which-indexer
q-pay-anchor-msb-licensing
q-pay-moneygram-ramps
q-pc-fee-bump-channel-accounts-feepool
q-pc-sponsored-reserves
q-pc-surge-griefing-threat-model
q-protocol-amm-cap-0038
q-protocol-base-reserve-min-balance
q-protocol-operation-types-list
q-protocol-validator-upgrade-vote
q-raph-offramp-xlm-usdc
q-raph-remove-scam-token
q-raph-usdc-onto-stellar
q-rwa-stellar-vs-erc20-regulated
q-rwa-tokenization-standards
q-sep-38-quotes
q-sep-41-token-interface
q-sep-8-regulated-assets
q-sep-catalog-list
q-sep-clawback-prereq-flag
q-sor-confidential-tokens
q-sor-contract-as-claimable-arbiter
q-sor-contract-trustlines-c-address
q-sor-evm-to-soroban-porting
q-sor-sac-introspection
q-sor-sep41-transfer-vs-transferfrom
q-soroban-event-indexing-design
q-soroban-token-transfer-pattern
q-ti-compute-token-lp-market-data
q-ti-custodial-account-generation-c-address
q-ti-enumerate-all-contracts
q-ti-enumerate-holders-airdrop
q-ti-fetch-all-balances-classic-sac
q-ti-friendbot-ratelimit-alternatives
q-ti-historical-pointintime-balances
q-ti-rpc-gettransactions-pagination-xdr
q-ti-stellar-lab-usage-and-new-ui
q-ti-testnet-usdc-faucet
q-tool-cctp-stellar-integration
q-tool-lab-what-is
q-tool-sep41-status-live
```

### `stellarDocs.search_doc_titles`

```text
q-edge-doc-title-zero-hits
q-sor-doc-title-discovery
```

### `stellarDocs.search_docs`

```text
q-agent-identity-erc8004-stellar
q-agent-payment-standard-choice
q-cctp-v2-usdc-stellar
q-edge-noinfo-sep-9999
q-edge-open-world-recovery-after-narrow-miss
q-edge-strupey-ambiguous-stellar-history
q-mpp-discovery-and-modes
q-pc-cross-redstone-sep40
q-protocol-bn254-poseidon-xray
q-protocol-cap-vs-sep
q-sor-cross-socketfi-auth
q-x402-payment-verification
```

### `stellarDocs.search_docs_in_category`

```text
q-edge-doc-category-filter-empty
q-pc-doc-category-validator-search
```

### `stellarDocs.search_meeting_notes`

```text
q-comp-clawback-cap0035
q-pc-protocol-upgrade-timing
q-protocol-parallel-execution
q-soroban-constructor-lifecycle
```

### `stellarDocs.search_protocol_concepts_docs`

```text
q-aas-burn-clawback-redemption-mechanics
q-aas-claim-received-claimable-balances
q-aas-claimable-predicates-expiry-reserves
q-aas-issuer-fees-supply-cap-freeze
q-aas-sep30-recoverable-wallets
q-aas-trustline-limit-lifecycle
q-asset-amm-fee-reserve
q-asset-claimable-balance
q-asset-issue-asset-howto
q-asset-path-payment-ops
q-asset-sdex-vs-amm
q-asset-trustline-basics
q-asset-two-account-issuer
q-asset-usdc-eurc-path-fx
q-comp-anchor-compliance-stack
q-comp-auth-flags-overview
q-comp-clawback-cap0035
q-comp-clawback-holder-risk
q-comp-sep6-vs-sep12-roles
q-comp-sep8-number-lookup-no-deepresearch
q-comp-sep8-regulated-assets-approval-server
q-crp-become-an-anchor-licensing
q-crp-export-tx-history-taxes
q-crp-sdp-operation
q-defi-arbitrage-pathpayment-bots
q-defi-build-staking-for-own-token
q-defi-flash-loans
q-defi-sdex-offer-lifecycle
q-edge-ambig-stellar-token-meaning
q-edge-exchange-memo-lost-funds
q-edge-fresh-latest-protocol-version
q-edge-inject-ignore-instructions
q-edge-metamask-evm-mental-model
q-edge-noinfo-stellar-native-privacy-default
q-edge-noinfo-stellar-pos-staking-rewards
q-edge-validators-reverse-tx-fork-detection
q-hot-fee-pool-burn-deflation
q-infra-horizon-vs-rpc
q-infra-hubble-bigquery
q-infra-quickstart-local-network
q-infra-rpc-methods-list
q-infra-rpc-provider-archive-tier
q-infra-secp256r1-passkeys
q-infra-simulate-transaction-howto
q-infra-testnet-vs-futurenet
q-infra-which-indexer
q-jutsu-what-is-a-memo
q-pay-moneygram-ramps
q-pay-sdp-disbursement
q-pc-account-activation-not-found
q-pc-account-merge-reclaim-reserve
q-pc-bucketlist-vs-merkle-inclusion-proof
q-pc-fee-bump-channel-accounts-feepool
q-pc-l2-payment-channels-starlight
q-pc-memos-reference
q-pc-multisig-setup-lifecycle
q-pc-muxed-accounts
q-pc-practical-fee-setting
q-pc-protocol-26-yardstick
q-pc-protocol-27-zipper
q-pc-protocol-upgrade-timing
q-pc-quantum-preparedness-dormant
q-pc-sequence-numbers-ordering-replace
q-pc-slp-0004-0006-status
q-pc-sponsored-reserves
q-pc-surge-griefing-threat-model
q-pc-tx-finality-failure-semantics
q-protocol-19-preconditions-cap-0021
q-protocol-23-whisk-caps
q-protocol-24-whisk-incident
q-protocol-27-cap-0071
q-protocol-accounts-signers-thresholds
q-protocol-amm-cap-0038
q-protocol-base-reserve-min-balance
q-protocol-bls12-381-cap59
q-protocol-cap-process
q-protocol-ledger-close-time
q-protocol-ledger-entry-types
q-protocol-ledger-header-fields
q-protocol-max-tx-set-size
q-protocol-network-passphrases-list
q-protocol-operation-types-list
q-protocol-operations-vs-transactions
q-protocol-parallel-execution
q-protocol-quorum-slice-vs-quorum
q-protocol-scp-consensus-algorithm
q-protocol-state-archival-ttl
q-protocol-validator-node-roles
q-protocol-validator-upgrade-vote
q-protocol-version-history-list
q-raph-claimable-balance-safety
q-raph-exchange-memo
q-raph-low-xlm-transfer-fail
q-raph-missing-exchange-memo
q-raph-remittance-path-payment
q-raph-scam-spam-tokens
q-raph-unsolicited-airdrop
q-raph-withdraw-exchange-self-custody
q-raph-xlm-network-role
q-raph-xlm-simple
q-raph-xlm-staking
q-sep-12-kyc
q-sep-45-contract-auth
q-sep-7-uri
q-sep-8-regulated-assets
q-sep-clawback-prereq-flag
q-sep-interactive-deposit-withdraw
q-sor-classic-dex-from-contract
q-sor-confidential-tokens
q-sor-contract-as-claimable-arbiter
q-sor-contract-trustlines-c-address
q-sor-deploy-invoke-from-js-sdk
q-sor-doc-timestamping-manage-data
q-sor-evm-to-soroban-porting
q-sor-force-fast-archival-localnet
q-sor-p23-auto-restore-extendto
q-sor-require-auth-propagation
q-sor-sac-introspection
q-sor-scval-conversion
q-sor-sep41-transfer-vs-transferfrom
q-sor-stale-spec-after-upgrade
q-soroban-add-signer-smart-wallet-howto
q-soroban-auth-delegation-p27
q-soroban-check-auth-custom-account
q-soroban-constructor-lifecycle
q-soroban-contract-id-derivation
q-soroban-contractmeta-vs-contractevent
q-soroban-deploy-cli
q-soroban-no-std-constraints
q-soroban-require-auth
q-soroban-resource-limits
q-soroban-sdk-macros
q-soroban-simulate-resource-fee
q-soroban-storage-types
q-soroban-token-transfer-pattern
q-soroban-wasm-size-limit
q-ti-channel-accounts-throughput
q-ti-classic-submission-errors
q-ti-cli-rust-windows-troubleshooting
q-ti-compute-token-lp-market-data
q-ti-custodial-account-generation-c-address
q-ti-enumerate-holders-airdrop
q-ti-fetch-all-balances-classic-sac
q-ti-find-export-secret-key
q-ti-freighter-localhost-not-detected
q-ti-friendbot-ratelimit-alternatives
q-ti-historical-pointintime-balances
q-ti-java-sdk-wallet-feebump
q-ti-parse-raw-ledger-data
q-ti-rpc-gettransactions-pagination-xdr
q-ti-stellar-lab-usage-and-new-ui
q-ti-testnet-usdc-faucet
q-ti-tx-too-late-resubmit
q-tool-cli-testnet-identity-howto
q-tool-go-sdk-ingest
q-tool-js-sdk-package
q-tool-lab-what-is
q-tool-passkey-wallet-recovery
q-tool-passkeykit-smart-wallet
q-tool-rust-soroban-sdk
q-tool-wallets-comparison
q-zk-host-functions-status
```

### `stellarDocs.search_rpc_horizon_data_docs`

```text
q-aas-claim-received-claimable-balances
q-aas-trustline-limit-lifecycle
q-crp-export-tx-history-taxes
q-defi-sdex-offer-lifecycle
q-edge-fresh-latest-protocol-version
q-gap-rpc-horizon-unindexed-reference
q-infra-horizon-vs-rpc
q-infra-hubble-bigquery
q-infra-rpc-methods-list
q-infra-rpc-provider-archive-tier
q-infra-simulate-transaction-howto
q-infra-testnet-vs-futurenet
q-infra-which-indexer
q-jutsu-check-account-history
q-pc-practical-fee-setting
q-pc-sequence-numbers-ordering-replace
q-protocol-validator-node-roles
q-sor-classic-dex-from-contract
q-sor-contract-trustlines-c-address
q-sor-decode-hosterror-codes
q-sor-deploy-invoke-from-js-sdk
q-sor-force-fast-archival-localnet
q-sor-p23-auto-restore-extendto
q-sor-stale-spec-after-upgrade
q-soroban-contractmeta-vs-contractevent
q-soroban-event-indexing-design
q-soroban-publish-events
q-soroban-simulate-resource-fee
q-ti-channel-accounts-throughput
q-ti-classic-submission-errors
q-ti-cli-rust-windows-troubleshooting
q-ti-compute-token-lp-market-data
q-ti-enumerate-all-contracts
q-ti-enumerate-holders-airdrop
q-ti-fetch-all-balances-classic-sac
q-ti-historical-pointintime-balances
q-ti-parse-raw-ledger-data
q-ti-rpc-gettransactions-pagination-xdr
q-ti-self-host-retention-backfill
q-tool-go-sdk-ingest
q-tool-greenfield-indexer-prior-art-preflight
q-tool-js-sdk-package
q-tool-rust-soroban-sdk
```

### `stellarDocs.search_sdk_cli_tools_docs`

```text
q-aas-claim-received-claimable-balances
q-aas-sep30-recoverable-wallets
q-anchor-sdp-vs-anchor-platform
q-asset-deploy-sac-cli
q-asset-wallet-sdk-seps
q-defi-flash-loans
q-infra-hubble-bigquery
q-infra-quickstart-local-network
q-infra-simulate-transaction-howto
q-jutsu-check-account-history
q-pc-multisig-setup-lifecycle
q-pc-practical-fee-setting
q-pc-protocol-upgrade-timing
q-quickstart-manual-ledger-close
q-sep-53-sign-verify-message
q-sep53-message-signing
q-sor-build-target-wasm32v1
q-sor-confidential-tokens
q-sor-decode-hosterror-codes
q-sor-deploy-invoke-from-js-sdk
q-sor-evm-to-soroban-porting
q-sor-force-fast-archival-localnet
q-sor-p23-auto-restore-extendto
q-sor-scval-conversion
q-sor-sep41-transfer-vs-transferfrom
q-sor-stale-spec-after-upgrade
q-soroban-cli-bindings
q-soroban-constructor-lifecycle
q-soroban-contractmeta-vs-contractevent
q-soroban-deploy-cli
q-soroban-event-indexing-design
q-soroban-no-std-constraints
q-soroban-sdk-macros
q-soroban-storage-types
q-ti-cli-rust-windows-troubleshooting
q-ti-friendbot-ratelimit-alternatives
q-ti-java-sdk-wallet-feebump
q-ti-parse-raw-ledger-data
q-ti-scaffold-stellar
q-ti-secret-key-vs-mnemonic-derivation
q-ti-stellar-lab-usage-and-new-ui
q-ti-testnet-usdc-faucet
q-tool-cli-testnet-identity-howto
q-tool-flutter-mobile-sdk
q-tool-go-sdk-ingest
q-tool-js-sdk-package
q-tool-lab-what-is
q-tool-rust-soroban-sdk
```

### `stellarDocs.search_soroban_contract_docs`

```text
q-aas-burn-clawback-redemption-mechanics
q-aas-issuer-fees-supply-cap-freeze
q-aas-trustline-limit-lifecycle
q-anchor-moneygram-ramps
q-asset-amm-fee-reserve
q-asset-deploy-sac-cli
q-asset-issue-asset-howto
q-asset-path-payment-ops
q-asset-sdex-vs-amm
q-asset-trustline-basics
q-asset-trustline-vs-sac
q-asset-two-account-issuer
q-asset-usdc-eurc-path-fx
q-comp-anchor-compliance-stack
q-comp-auth-flags-overview
q-comp-clawback-cap0035
q-comp-clawback-holder-risk
q-comp-sac-inherits-flags
q-comp-sep6-vs-sep12-roles
q-comp-sep8-regulated-assets-approval-server
q-crp-become-an-anchor-licensing
q-crp-sdp-operation
q-defi-build-staking-for-own-token
q-defi-flash-loans
q-defi-sdex-offer-lifecycle
q-edge-ambig-stellar-token-meaning
q-edge-asset-site-scam-detection
q-edge-exchange-memo-lost-funds
q-edge-fresh-latest-protocol-version
q-edge-inject-ignore-instructions
q-edge-metamask-evm-mental-model
q-infra-horizon-vs-rpc
q-infra-rpc-methods-list
q-infra-secp256r1-passkeys
q-infra-simulate-transaction-howto
q-pc-account-activation-not-found
q-pc-address-types-strkey
q-pc-bucketlist-vs-merkle-inclusion-proof
q-pc-multisig-setup-lifecycle
q-pc-sponsored-reserves
q-pc-surge-griefing-threat-model
q-protocol-19-preconditions-cap-0021
q-protocol-23-whisk-caps
q-protocol-accounts-signers-thresholds
q-protocol-amm-cap-0038
q-protocol-base-reserve-min-balance
q-protocol-ledger-entry-types
q-protocol-max-tx-set-size
q-protocol-operation-types-list
q-protocol-operations-vs-transactions
q-protocol-parallel-execution
q-protocol-quorum-slice-vs-quorum
q-protocol-state-archival-ttl
q-protocol-tier1-requirements
q-rwa-stellar-vs-erc20-regulated
q-sep-12-kyc
q-sep-31-cross-border
q-sep-41-token-interface
q-sep-45-contract-auth
q-sep-8-regulated-assets
q-sep-catalog-list
q-sep-clawback-prereq-flag
q-sep-interactive-deposit-withdraw
q-sor-build-target-wasm32v1
q-sor-classic-dex-from-contract
q-sor-contract-as-claimable-arbiter
q-sor-contract-trustlines-c-address
q-sor-decode-hosterror-codes
q-sor-deploy-invoke-from-js-sdk
q-sor-doc-timestamping-manage-data
q-sor-evm-to-soroban-porting
q-sor-force-fast-archival-localnet
q-sor-p23-auto-restore-extendto
q-sor-persistent-unbounded-collection-cap
q-sor-require-auth-propagation
q-sor-sac-introspection
q-sor-scval-conversion
q-sor-sep41-transfer-vs-transferfrom
q-sor-stale-spec-after-upgrade
q-sor-test-event-assertion-ordering
q-sor-ttl-defaults-extend
q-soroban-add-signer-smart-wallet-howto
q-soroban-auth-delegation-p27
q-soroban-check-auth-custom-account
q-soroban-cli-bindings
q-soroban-constructor-lifecycle
q-soroban-contract-build-verification
q-soroban-contract-id-derivation
q-soroban-contractmeta-vs-contractevent
q-soroban-cross-contract-call
q-soroban-deploy-cli
q-soroban-event-indexing-design
q-soroban-factory-pattern
q-soroban-greenfield-escrow-prior-art-preflight
q-soroban-no-std-constraints
q-soroban-publish-events
q-soroban-require-auth
q-soroban-resource-limits
q-soroban-sdk-macros
q-soroban-simulate-resource-fee
q-soroban-storage-migration
q-soroban-storage-types
q-soroban-token-transfer-pattern
q-soroban-unit-testing
q-soroban-upgradeable-storage-compat
q-soroban-wasm-language
q-soroban-wasm-size-limit
q-ti-channel-accounts-throughput
q-ti-classic-submission-errors
q-ti-cli-rust-windows-troubleshooting
q-ti-custodial-account-generation-c-address
q-ti-enumerate-all-contracts
q-ti-enumerate-holders-airdrop
q-ti-fetch-all-balances-classic-sac
q-ti-freighter-localhost-not-detected
q-ti-friendbot-ratelimit-alternatives
q-ti-parse-raw-ledger-data
q-ti-rpc-gettransactions-pagination-xdr
q-ti-scaffold-stellar
q-ti-secret-key-vs-mnemonic-derivation
q-ti-self-host-retention-backfill
q-ti-stellar-lab-usage-and-new-ui
q-ti-testnet-usdc-faucet
q-ti-tx-too-late-resubmit
q-tool-cli-testnet-identity-howto
q-tool-js-sdk-package
q-tool-lab-what-is
q-tool-passkey-wallet-recovery
q-tool-passkeykit-smart-wallet
q-tool-rust-soroban-sdk
q-tool-which-sdk-comparison
q-zk-circuit-setup
q-zk-nullifier-storage
q-zk-poseidon-input-encoding
q-zk-proof-systems-stellar
q-zk-verification-resource-budget
```

### `stellarDocs.search_wallet_dapp_docs`

```text
q-aas-sep30-recoverable-wallets
q-anchor-moneygram-ramps
q-anchor-sdp-vs-anchor-platform
q-asset-issue-asset-howto
q-asset-usdc-eurc-path-fx
q-asset-wallet-sdk-seps
q-comp-sep6-vs-sep12-roles
q-comp-sep8-regulated-assets-approval-server
q-crp-export-tx-history-taxes
q-crp-sdp-operation
q-infra-secp256r1-passkeys
q-passkey-platform-constraints
q-passkey-smart-account-architecture
q-passkey-wallet-recovery
q-pay-anchor-msb-licensing
q-pay-sdp-disbursement
q-pc-muxed-accounts
q-raph-buy-xlm-safely
q-raph-exchange-memo
q-raph-hardware-wallet
q-raph-lobstr-legitimacy
q-raph-merchant-payments
q-raph-phishing-pending-claim
q-raph-restore-wallet
q-raph-withdraw-exchange-self-custody
q-sep-1-toml
q-sep-12-kyc
q-sep-43-web-wallet-api
q-sep-45-contract-auth
q-sep-6-vs-31-misnumber-trap
q-sep-7-uri
q-sep-catalog-list
q-sep-interactive-deposit-withdraw
q-sep-wallet-seps-list
q-smart-account-scoped-policy-signers
q-smart-wallet-fee-sponsorship
q-sor-contract-trustlines-c-address
q-soroban-add-signer-smart-wallet-howto
q-soroban-check-auth-custom-account
q-stellar-recurring-payments
q-ti-custodial-account-generation-c-address
q-ti-find-export-secret-key
q-ti-freighter-localhost-not-detected
q-ti-friendbot-ratelimit-alternatives
q-ti-java-sdk-wallet-feebump
q-ti-scaffold-stellar
q-ti-stellar-lab-usage-and-new-ui
q-tool-cctp-stellar-integration
q-tool-flutter-mobile-sdk
q-tool-freighter-wallet
q-tool-passkey-wallet-recovery
q-tool-passkeykit-smart-wallet
q-tool-wallets-comparison
```

## Appendix B: proposed free differential command

Run only after Phase 2 approval, from the clean candidate worktree.
Set `B` to the assigned backlog directory before this command.
The command writes sanitized evidence but never prints credentials.

```sh
node --input-type=module <<'JS'
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const B = "/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog";
const baseline = "bcfa617ffcb6e58e6a7498a1e42135a059535402";
const expectedAdapter = "0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93";
const hash = (data) => createHash("sha256").update(data).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
assert.equal(git("status", "--porcelain=v1", "--untracked-files=all").trim(), "", "candidate must be clean");
assert.equal(hash(readFileSync("src/adapters/stellar-docs.ts")), expectedAdapter);
const candidate = git("rev-parse", "HEAD").trim();
assert.equal(candidate, "36787b3a9b051fa366b7648ca201691715253fbc", "candidate revision mismatch");
const { parseEnvFile } = await import(pathToFileURL(resolve("scripts/lib/shared.mjs")));
const inherited = process.env;
const loaded = inherited.ALGOLIA_APPLICATION_ID_DOCS && inherited.ALGOLIA_API_KEY_DOCS
  ? {} : parseEnvFile("/Users/kalepail/Desktop/stellar-raven-codemode/.env");
const env = Object.fromEntries(["ALGOLIA_APPLICATION_ID_DOCS", "ALGOLIA_API_KEY_DOCS"]
  .map((name) => [name, inherited[name] || loaded[name]]));
assert(Object.values(env).every((value) => typeof value === "string" && value.length), "runtime search credentials are missing");
const redact = (text) => Object.values(env).reduce((out, value) => out.split(value).join("[redacted]"), text);
const output = join(B, "reports", `sd-differential-${new Date().toISOString().replaceAll(":", "-")}.json`);
const receipt = { baseline, candidate, adapterSha256: expectedAdapter, startedAt: new Date().toISOString(), pairs: [], complete: false };
mkdirSync(resolve("tmp"), { recursive: true });
const temp = mkdtempSync(resolve("tmp/sd-differential-"));
const deadline = Math.min(Date.now() + 30 * 60_000, Date.parse("2026-10-02T22:00:00Z"));
let attempts = 0;
const wire = (value) => JSON.parse(JSON.stringify(value));
const differences = (a, b, at = "$") => {
  if (Object.is(a, b)) return [];
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return [at];
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) =>
    !Object.hasOwn(a, key) || !Object.hasOwn(b, key) ? [`${at}.${key}`] : differences(a[key], b[key], `${at}.${key}`));
};
const normalized = (envelope, input) => {
  const copy = wire(envelope);
  if (copy.ok || copy.error?.kind !== "soft-empty") return copy;
  const messages = new Map([
    ["zero hits — this topic is not in the docs corpus (zero is a reliable negative on this index)",
      "This query returned no hits in the docs index with the operation filters."],
    ["the index matched pages, but none in this operation's docs category — try stellarDocs.search_docs for a corpus-wide search",
      "The returned candidate window contains no hits for this operation. Try stellarDocs.search_docs for a broader search."],
    [`no indexed sections found for ${input.path} — the path is not in the docs index (check url_without_anchor from a search hit; auto-generated API-reference pages are not indexed)`,
      `The page-section queries returned no matching records for ${input.path} within their candidate windows. Check url_without_anchor from a search hit.`]
  ]);
  copy.error.message = messages.get(copy.error.message) ?? copy.error.message;
  return copy;
};
try {
  for (const name of ["stellar-docs.ts", "types.ts"]) {
    writeFileSync(join(temp, name), git("show", `${baseline}:src/adapters/${name}`));
  }
  const oldAdapter = (await import(pathToFileURL(join(temp, "stellar-docs.ts")))).callStellarDocs;
  const newAdapter = (await import(pathToFileURL(resolve("src/adapters/stellar-docs.ts")))).callStellarDocs;
  const oldEntries = JSON.parse(git("show", `${baseline}:catalog/manifest.json`)).entries.filter((e) => e.service === "stellarDocs");
  const newEntries = JSON.parse(readFileSync("catalog/manifest.json", "utf8")).entries.filter((e) => e.service === "stellarDocs");
  assert.equal(oldEntries.length, 12);
  assert.deepEqual(oldEntries, newEntries, "operation mappings changed outside this plan");
  const entries = new Map(newEntries.map((e) => [e.id, e]));
  const defaultOps = new Set(["search_docs", "search_doc_titles", "search_meeting_notes"]);
  const inputs = [];
  function add(name, args, positive = true) { inputs.push({ id: `stellarDocs.${name}`, args, positive }); }
  function matrix(name, args) {
    const entry = entries.get(`stellarDocs.${name}`);
    const contentValues = "includeContent" in entry.inputSchema.properties ? [false, true] : [undefined];
    for (const limit of [undefined, 1, 20]) for (const content of contentValues) {
      add(name, { ...args, ...(limit === undefined ? {} : { hitsPerPage: limit }), ...(content === undefined ? {} : { includeContent: content }) });
    }
  }
  for (const [name, query] of Object.entries({
    search_docs: "Stellar", search_doc_titles: "Stellar", search_meeting_notes: "protocol",
    search_anchor_sep_docs: "SEP", search_asset_token_docs: "asset", search_protocol_concepts_docs: "transaction",
    search_rpc_horizon_data_docs: "RPC", search_sdk_cli_tools_docs: "CLI", search_soroban_contract_docs: "storage",
    search_wallet_dapp_docs: "wallet"
  })) matrix(name, { query });
  matrix("search_docs_in_category", { query: "contract", category: "build" });
  matrix("search_docs_in_category", { query: "protocol", category: "meetings" });
  for (const name of ["search_docs", "search_doc_titles"]) matrix(name, { query: "Stellar", includeMeetings: true });
  for (const content of [undefined, false, true]) add("get_doc_page_sections", {
    path: "/docs/learn/fundamentals/lumens", ...(content === undefined ? {} : { includeContent: content })
  });
  for (const name of ["search_docs", "search_doc_titles"]) add(name, { query: '"raven-sd-measure-no-match-20261001"' }, false);
  add("search_docs", { query: "SEP-9999" }, false);
  add("get_doc_page_sections", { path: "/docs/build/raven-sd-measure-no-match-20261001" }, false);
  for (const query of ['"Configuring a Validator"', '"stellar-core.cfg"', '"QUORUM_SET"']) add("search_docs_in_category", { query, category: "tokens" }, false);
    add("search_docs_in_category", { query: '"Configuring a Validator"', category: "tokens", includeContent: true }, false);
  inputs.at(-1).requireEmptyContent = true;
  assert.equal(inputs.length, 89);
  const frozenInputsPath = join(B, "sd-diff2-frozen-inputs.json");
  const frozenInputsBytes = readFileSync(frozenInputsPath);
  assert.equal(hash(frozenInputsBytes), "772b8c09f3be0be842ddd30875932a5da2b1351f4b06a013298d33d687dbccae");
  const frozenInputs = JSON.parse(frozenInputsBytes);
  assert.equal(frozenInputs.baselineRevision, baseline);
  assert.equal(frozenInputs.inputs.length, 12);
  inputs.push(...frozenInputs.inputs);
  assert.equal(inputs.length, 101);
  const coverage = { zero: false, filtered: false, page: false };
  const contentBranches = new Set();
  const filteredBranches = new Set();
  let meetingsIDsChecked = false;
  const expectedBranches = newEntries.filter((entry) => entry.transport.algolia.clientFilter?.prefixesAnyOf)
    .map((entry) => entry.id + (entry.id.endsWith("search_docs_in_category") ? ":build" : ":"));
  expectedBranches.push("stellarDocs.search_docs_in_category:meetings");
  async function call(adapter, entry, args) {
    const requests = [];
    const fetchImpl = async (url, init) => {
      if (++attempts > 1500 || Date.now() >= deadline) throw new Error("differential read limit reached");
      const start = Date.now();
      const response = await fetch(url, init);
      const text = await response.clone().text();
      let body;
      try { body = JSON.parse(text); } catch { body = null; }
      requests.push({ path: new URL(url).pathname, params: JSON.parse(init.body), status: response.status,
        bytes: Buffer.byteLength(text), elapsedMs: Date.now() - start, body });
      return response;
    };
    return { envelope: wire(await adapter(entry, args, env, fetchImpl)), requests };
  }
  for (const [number, input] of inputs.entries()) {
    const entry = entries.get(input.id);
    const oldEntry = oldEntries.find((e) => e.id === input.id);
    const before = await call(oldAdapter, oldEntry, input.args);
    const after = await call(newAdapter, entry, input.args);
    const pair = { number, ...input, before, after, rawDifferences: differences(before.envelope, after.envelope) };
    receipt.pairs.push(pair);
    for (const arm of [before, after]) {
      assert(arm.envelope.ok || arm.envelope.error.kind === "soft-empty", "transport or adapter error");
      if (input.positive) assert(arm.envelope.ok && (arm.envelope.data.hits ?? arm.envelope.data.sections).length > 0, "positive coverage missing");
      if (input.requireStringContent) assert(arm.envelope.ok && arm.envelope.data.hits.some((hit) => typeof hit.content === "string"), "frozen content input lacks retained content");
      if (input.requirePrefixRemoval || input.requireNonzeroCandidates) {
        const rawSearch = arm.requests.find((request) => request.path.endsWith("/query") && request.status === 200);
        assert(rawSearch.body.nbHits > 0 && rawSearch.body.hits.length > 0, "frozen coverage input lacks candidates");
        const filter = entry.transport.algolia.clientFilter;
        const prefixes = filter.prefixesAnyOf.map((prefix) => prefix.replace("{category}", input.args.category ?? ""));
        const filtered = rawSearch.body.hits.filter((hit) => typeof hit[filter.field] === "string" && prefixes.some((prefix) => hit[filter.field].startsWith(prefix)));
        if (input.requirePrefixRemoval) assert(filtered.length < rawSearch.body.hits.length, "frozen input lacks a prefix removal before slicing");
        if (input.requireNonzeroCandidates) assert.equal(filtered.length, 0, "frozen empty-content input retained candidates");
      }
    }
    const name = input.id.split(".")[1];
    if (defaultOps.has(name) && !Object.hasOwn(input.args, "hitsPerPage") && before.envelope.ok) {
      pair.defaultControl = await call(oldAdapter, oldEntry, { ...input.args, hitsPerPage: 5 });
      assert.deepEqual(normalized(pair.defaultControl.envelope, input.args), after.envelope);
      assert.deepEqual(before.envelope.data.hits.slice(0, 5), after.envelope.data.hits);
      assert.equal(before.envelope.data.nbHits, after.envelope.data.nbHits);
      assert.equal(before.envelope.data.page, after.envelope.data.page);
      assert(pair.rawDifferences.every((key) => key.startsWith("$.data.hits.") || key === "$.data.nbPages"));
    } else assert.deepEqual(normalized(before.envelope, input.args), after.envelope);
    const objects = after.requests.filter((request) => request.path === "/1/indexes/*/objects");
    const search = after.requests.find((request) => request.path.endsWith("/query") && request.status === 200);
    if (defaultOps.has(name)) assert.equal(search.params.hitsPerPage, input.args.hitsPerPage ?? 5);
    if (entry.transport.algolia.clientFilter?.prefixesAnyOf && input.args.includeContent === true) {
      assert(!search.params.attributesToRetrieve.includes("content"));
      let kept = search.body.hits;
      if (input.args.category !== "meetings") {
        const filter = entry.transport.algolia.clientFilter;
        const prefixes = filter.prefixesAnyOf.map((prefix) => prefix.replace("{category}", input.args.category ?? ""));
        kept = kept.filter((hit) => typeof hit[filter.field] === "string" && prefixes.some((prefix) => hit[filter.field].startsWith(prefix)));
      }
      const branch = input.id + ":" + (input.args.category ?? "");
      if (!input.requireEmptyContent && input.args.category !== "meetings" && search.body.hits.length > kept.length) filteredBranches.add(branch);
      kept = kept.slice(0, input.args.hitsPerPage ?? 5);
      if (after.envelope.ok && after.envelope.data.hits.some((hit) => typeof hit.content === "string")) contentBranches.add(branch);
      const expected = [...new Set(kept.map((hit) => hit.objectID))].map((objectID) => ({
        indexName: entry.transport.index, objectID, attributesToRetrieve: ["objectID", "content"]
      }));
      assert.equal(objects.filter((request) => request.status === 200).length, kept.length ? 1 : 0);
      for (const request of objects) assert.deepEqual(request.params.requests, expected);
      if (input.args.category === "meetings" && kept.length > 0) meetingsIDsChecked = true;
    } else assert.equal(objects.length, 0);
    if (input.requireEmptyContent) {
      for (const arm of [before, after]) {
        assert.equal(arm.envelope.ok, false, "empty content path must be soft-empty");
        assert.equal(arm.envelope.error.kind, "soft-empty");
        assert.equal(arm.requests.filter((request) => request.path === "/1/indexes/*/objects").length, 0);
      }
      assert.equal(objects.length, 0, "empty content path must not retrieve objects");
    }
    if (!after.envelope.ok && after.envelope.error.kind === "soft-empty") {
      if (name === "get_doc_page_sections") coverage.page = true;
      else if (search.body.nbHits === 0) coverage.zero = true;
      else coverage.filtered = true;
    }
    pair.pass = true;
  }
  assert.deepEqual(coverage, { zero: true, filtered: true, page: true }, "miss branch coverage incomplete");
  assert.deepEqual([...contentBranches].sort(), expectedBranches.sort(), "full-content coverage incomplete");
  assert.deepEqual([...filteredBranches].sort(), expectedBranches.filter((branch) => !branch.endsWith(":meetings")).sort(), "prefix-discard coverage incomplete");
  assert.equal(meetingsIDsChecked, true, "meetings retained-ID coverage incomplete");
  receipt.coverage = { ...coverage, contentBranches: [...contentBranches], filteredBranches: [...filteredBranches], meetingsIDsChecked };
  receipt.complete = true;
} catch (error) {
  receipt.failureClass = error.name;
  receipt.failureMessage = redact(String(error.message)).slice(0, 3000);
  process.exitCode = 1;
} finally {
  receipt.httpAttempts = attempts;
  receipt.finishedAt = new Date().toISOString();
  mkdirSync(join(B, "reports"), { recursive: true });
  writeFileSync(output, redact(JSON.stringify(receipt, null, 2)) + "\n");
  rmSync(temp, { recursive: true, force: true });
  console.log(JSON.stringify({ output, complete: receipt.complete, pairs: receipt.pairs.length, httpAttempts: attempts }));
}
JS
```

## Appendix C: fixed source pins

| File | SHA-256 |
|---|---|
| `eval/qa/run-qa.mjs` | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` |
| `eval/qa/re-judge.mjs` | `d17c2a55c5e522fe11fda4ebca4bcde781f0f68bb19ab2630ce44abf11ebc678` |
| `eval/qa/judge.mjs` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` |
| `eval/qa/evidence-pack.mjs` | `74a1bd47b1e2f824d672f0e399e2a679dd1195fd0a1366066bfa68e631f8b0d5` |
| `eval/qa/cases.json` | `ae221407fad556081391ff0ff01a49a4391c4734fb39f1c9dd4474201369190e` |
| `eval/qa/corpus/live/live-cases.json` | `d13ebc2ad9d592dbd91dd8ec02b4e2139a335ac20bb0d5bc6c46fcec97a389f0` |
| `catalog/manifest.json` | `8e19480c0005dad0fb505bfd209e771e9457a8198c586ff7aaf9e89c0a1948a8` |
| `src/adapters/stellar-docs.ts` | `0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93` |

Record the environment hash, remote probe hash, remote-vector hash, stability-register hash, and server surface hashes before collection.
These runtime identities remain unset in Phase 1 because no server or live probe ran.

## Phase 1 validation receipt

The embedded differential passed `node --input-type=module --check` without execution.
All four collection commands passed the runner's syntax parser without execution.
Each of the four authorized collection commands contains exactly one `--max-budget-usd`.
The literal selections contain 20 unique battery IDs and all 15 canonical live IDs.
The candidate worktree is clean, and its adapter hash matches Appendix C.
No server, live differential, remote identity probe, paid QA call, or rejudge ran.

## Coordinator amendment receipt

Authority: `$B/go-sd-measure.md`, received 2026-10-01.
Review: `$B/reports/review-sd-measure-plan.md`, Grok 4.7 high, LAUNCH-OK WITH FIXES.
Finding 1 adds a non-positive content-enabled filtered miss and requires no object request.
Finding 2 counts prefix removals before slicing and checks the meetings branch through unfiltered retained IDs.
The baseline uses its detached worktree; the candidate keeps its current worktree and HEAD.
The explicit cost exception accepts historical proxies and limits four collection commands to `$90`.
Instrument 1 may run now. Instrument 2 remains blocked until `GO PAID`.

## Instrument 1 outcome

The amended differential ran once and exited incomplete on 2026-10-01.
All 89 paired envelope comparisons passed their declared exceptions.
Full-content coverage was zero of nine category branches.
Offline receipt analysis found prefix-removal coverage in six of eight filtered branches.
The content-enabled miss returned zero index hits, so nonzero-candidate empty-content coverage remains unproven.
See `$B/reports/sd-measure-differential-note.md` for the unchanged receipt and detailed limits.
No rerun, paid command, or server startup followed.
A reviewed input amendment and a new bounded go are required before another differential run.

## 2026-10-01 amendment: baseline-only coverage selection

Authority: `$B/amend-sd-differential.md` and the coordinator's same-task addendum.
The first receipt remains INCOMPLETE and unchanged.
This step selects and freezes inputs. It does not run a comparison or any paid command.
The second comparison requires Grok confirmation and the coordinator's explicit `GO DIFF 2`.
A second incomplete or failing comparison stops the method.

### Selection bounds, declared before probing

Use only the adapter and manifest at `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
Import them from the coordinator's `sd-baseline` worktree after verifying its clean revision.
Never import or call the candidate adapter during selection.
Seed choices may use only the first receipt's baseline responses, not its candidate responses or differences.
The runtime credential loader stays unchanged and never prints values.

Stop after 200 HTTP attempts or 30 minutes, whichever occurs first.
Use at most five candidate search queries for each of the nine content branches.
For the anchor and SDK branches, this limit includes the additional prefix-removal queries.
Use at most five queries for the additional tokens-category empty-content branch.
Thus, selection permits at most 50 candidate search calls.
Each branch may also make at most two baseline page-section seed calls.
All seed requests and adapter retries count against the same 200-attempt limit.
Record every seed and search call, its exact input, outcome, and selection reason.
Transport failures or missing credentials stop selection without a candidate call.

Prefer `hitsPerPage: 20` and `includeContent: true`.
First use paragraph records already present in the baseline response for that branch.
Otherwise, retrieve sections from baseline-returned page URLs, in their existing result order.
Use the first page that supplies paragraph content, within the two-seed limit.
Choose quoted eight-word phrases from those paragraphs in record order.
Keep the first query whose returned envelope contains at least one string `content` value.
Drop heading-only and soft-empty results, while retaining their receipts.
The content selection does not depend on candidate behavior.

For `search_anchor_sep_docs` and `search_sdk_cli_tools_docs`, preserve one slot for prefix-removal coverage.
After content selection, test these queries in order within the remaining five-query allowance:
`transaction`, `Stellar`, `account`, `contract`.
Keep the first result whose URL-prefix filter removes a hit before slicing.
The result may be soft-empty; raw candidates must exist.
Do not count a shorter returned page as prefix-removal evidence.
The meetings branch remains unfiltered and uses its retained record IDs for verification.

For the content-enabled tokens-category miss, test these queries in order:
`validators`, `quorum`, `stellar core configuration`, `consensus`, `history archives`.
Require a nonzero index count, at least one candidate hit, and zero hits after URL filtering.
Require a soft-empty envelope with `includeContent: true`.
Keep the first qualifying query and stop that branch's selection.
The second comparison must also require zero object requests on both arms for this frozen input.

Freeze the selected inputs and all selection receipts below before requesting the second comparison.
Retain the existing 89 inputs and all pass rules.
Add the selected content and gap inputs; do not replace a failed case or weaken a coverage assertion.
The second comparison must show string content in all nine content branches.

### Baseline selection continuation within the original bounds

The first selection pass used 46 HTTP attempts and selected eight content branches.
The wallet branch tested one phrase from its baseline paragraph and received soft-empty.
It still has four search calls and one seed call available under the original limits.
Use these further phrases from that same baseline paragraph, in order:

1. `"Freighter will open with the details of the"`
2. `"will transmit a signed XDR back to the"`
3. `"sign Soroban XDRs using dApps that are integrated"`
4. `"An example of an integrated dApp is Stellar's"`

Require each phrase to occur in the saved baseline paragraph before probing it.
Keep the first phrase that retains string content.
Stop after success or the remaining four queries.
The cumulative ceiling remains 200 HTTP attempts and five wallet search calls.
No candidate output informs this continuation.

Grok's delta finding is also applied.
The counter now skips `filteredBranches.add` when `input.requireEmptyContent` is true.
The before-slice filter check remains unchanged for matrix branches.
The meetings retained-ID check, soft-empty checks, and zero-object checks remain in force.

### Frozen selection receipt, 2026-10-01

Selection is complete. The baseline-only probes used 47 of 200 allowed HTTP attempts.
They made eight page-section seed calls and 13 candidate search calls.
No branch exceeded two candidate queries; the wallet continuation used its second query.
The probes selected nine full-content inputs, two prefix-removal inputs, and one nonzero-candidate empty-content input.
Only the baseline adapter ran. No candidate call, comparison, paid call, or server startup ran during selection.

The first selection receipt remains unchanged:
`reports/sd-baseline-content-probes-2026-10-01T18-50-19.297Z.json`.
The cumulative receipt includes the bounded wallet continuation:
`reports/sd-baseline-content-probes-frozen-2026-10-01.json`.
The scripts and logs use the `sd-baseline-content-probes` and `sd-baseline-wallet-continuation` prefixes under `reports/`.

Frozen input file: `$B/sd-diff2-frozen-inputs.json`.
The file contains exactly 12 added inputs, including their required coverage flags.
Appendix B verifies its SHA-256 before any comparison request.
It preserves the original 89 cases and then appends these 12 cases.
The second comparison therefore contains exactly 101 paired inputs before default controls.

| Artifact | SHA-256 |
|---|---|
| Frozen inputs | `772b8c09f3be0be842ddd30875932a5da2b1351f4b06a013298d33d687dbccae` |
| Cumulative baseline probe receipt | `54188e1fe173992abedfc4b1762d79c4d52284ce1ff7e66a09fda9787d88ab1c` |
| Revised Appendix B program bytes | `46010f9f47f1e9a463790ed90ffacb91e70f2f1432f27e9add7a36299f5d72a6` |

The input flags strengthen coverage checks without changing the envelope pass rule.
Each selected full-content input must retain string content on both arms.
Each selected prefix input must remove a candidate before slicing on both arms.
The selected empty-content input must start with nonzero candidates and retain none after filtering on both arms.
It must return soft-empty and make zero object requests on both arms.
The counter excludes `requireEmptyContent` inputs from the filtered branch set, as Grok requested.
The meetings retained-ID checks and all previous message substitutions remain unchanged.

### Selected inputs

| Purpose | Operation | Frozen input | Baseline retained string-content records |
|---|---|---|---:|
| full-content | `stellarDocs.search_anchor_sep_docs` | `{"query":"\"points of interaction with the Anchor Platform is\"","hitsPerPage":20,"includeContent":true}` | 4 |
| prefix-removal | `stellarDocs.search_anchor_sep_docs` | `{"query":"transaction","hitsPerPage":20,"includeContent":true}` | 0 |
| full-content | `stellarDocs.search_asset_token_docs` | `{"query":"\"in a smart contract the Stellar Asset Contract\"","hitsPerPage":20,"includeContent":true}` | 1 |
| full-content | `stellarDocs.search_protocol_concepts_docs` | `{"query":"\"smart contract and non-smart contract transactions in the\"","hitsPerPage":20,"includeContent":true}` | 1 |
| full-content | `stellarDocs.search_rpc_horizon_data_docs` | `{"query":"\"made Stellar RPC services available and offer plans\"","hitsPerPage":20,"includeContent":true}` | 1 |
| full-content | `stellarDocs.search_sdk_cli_tools_docs` | `{"query":"\"accounts contracts and assets from the command line\"","hitsPerPage":20,"includeContent":true}` | 1 |
| prefix-removal | `stellarDocs.search_sdk_cli_tools_docs` | `{"query":"transaction","hitsPerPage":20,"includeContent":true}` | 0 |
| full-content | `stellarDocs.search_soroban_contract_docs` | `{"query":"\"interface are identical for all storage types They\"","hitsPerPage":20,"includeContent":true}` | 1 |
| full-content | `stellarDocs.search_docs_in_category` | `{"query":"\"contracts platform on the Stellar network These contracts\"","category":"build","hitsPerPage":20,"includeContent":true}` | 1 |
| full-content | `stellarDocs.search_docs_in_category` | `{"query":"\"discuss two Core Advancement Proposals Dima is presenting\"","category":"meetings","hitsPerPage":20,"includeContent":true}` | 4 |
| nonzero-empty-content | `stellarDocs.search_docs_in_category` | `{"query":"validators","category":"tokens","hitsPerPage":20,"includeContent":true}` | 0 |
| full-content | `stellarDocs.search_wallet_dapp_docs` | `{"query":"\"Freighter will open with the details of the\"","hitsPerPage":20,"includeContent":true}` | 1 |

### Complete baseline probe log

The cumulative JSON receipt preserves every request and response for these rows.
The table records every query, including seed reads and dropped queries.
A seed decision selects paragraph evidence; it does not select a comparison input.

| Probe | Branch | Kind | Exact input | Decision and reason |
|---:|---|---|---|---|
| 0 | `stellarDocs.search_anchor_sep_docs:` | seed | `{"path":"/docs/platforms/anchor-platform/sep-guide/sep6/integration","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 1 | `stellarDocs.search_anchor_sep_docs:` | search | `{"query":"\"points of interaction with the Anchor Platform is\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 2 | `stellarDocs.search_anchor_sep_docs:` | search | `{"query":"transaction","hitsPerPage":20,"includeContent":true}` | keep: baseline URL-prefix filter removes a hit before slicing |
| 3 | `stellarDocs.search_asset_token_docs:` | seed | `{"path":"/docs/build/guides/tokens/stellar-asset-contract","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 4 | `stellarDocs.search_asset_token_docs:` | search | `{"query":"\"in a smart contract the Stellar Asset Contract\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 5 | `stellarDocs.search_protocol_concepts_docs:` | seed | `{"path":"/docs/learn/fundamentals/transactions/operations-and-transactions","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 6 | `stellarDocs.search_protocol_concepts_docs:` | search | `{"query":"\"smart contract and non-smart contract transactions in the\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 7 | `stellarDocs.search_rpc_horizon_data_docs:` | seed | `{"path":"/docs/data/apis/rpc/providers","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 8 | `stellarDocs.search_rpc_horizon_data_docs:` | search | `{"query":"\"made Stellar RPC services available and offer plans\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 9 | `stellarDocs.search_sdk_cli_tools_docs:` | seed | `{"path":"/docs/tools/cli/stellar-cli","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 10 | `stellarDocs.search_sdk_cli_tools_docs:` | search | `{"query":"\"accounts contracts and assets from the command line\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 11 | `stellarDocs.search_sdk_cli_tools_docs:` | search | `{"query":"transaction","hitsPerPage":20,"includeContent":true}` | keep: baseline URL-prefix filter removes a hit before slicing |
| 12 | `stellarDocs.search_soroban_contract_docs:` | seed | `{"path":"/docs/learn/fundamentals/contract-development/storage/state-archival","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 13 | `stellarDocs.search_soroban_contract_docs:` | search | `{"query":"\"interface are identical for all storage types They\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 14 | `stellarDocs.search_wallet_dapp_docs:` | seed | `{"path":"/docs/build/guides/freighter/sign-soroban-xdrs","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 15 | `stellarDocs.search_wallet_dapp_docs:` | search | `{"query":"\"account you can now sign Soroban XDRs using\"","hitsPerPage":20,"includeContent":true}` | drop: baseline returns soft-empty |
| 16 | `stellarDocs.search_docs_in_category:build` | seed | `{"path":"/docs/build/smart-contracts/overview","includeContent":true}` | keep-seed: baseline page sections supply paragraph phrases |
| 17 | `stellarDocs.search_docs_in_category:build` | search | `{"query":"\"contracts platform on the Stellar network These contracts\"","category":"build","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 18 | `stellarDocs.search_docs_in_category:meetings` | search | `{"query":"\"discuss two Core Advancement Proposals Dima is presenting\"","category":"meetings","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |
| 19 | `stellarDocs.search_docs_in_category:tokens` | search | `{"query":"validators","category":"tokens","hitsPerPage":20,"includeContent":true}` | keep: baseline has nonzero candidates and no URL-filtered hits with content enabled |
| 20 | `stellarDocs.search_wallet_dapp_docs:` | search | `{"query":"\"Freighter will open with the details of the\"","hitsPerPage":20,"includeContent":true}` | keep: baseline retains string content |

### Amendment validation and remaining gate

The revised Appendix B program passes `node --input-type=module --check` without execution.
The frozen selections contain all nine required content branches and all three additional coverage inputs.
The baseline probe totals remain below every declared bound.
The original incomplete differential receipt remains unchanged.
The candidate source, baseline source, worktree revisions, and paid caps remain unchanged.

Stop here for Grok review and the coordinator's `GO DIFF 2`.
Do not run the second comparison or any paid command from this amendment alone.
A second incomplete or failing comparison stops the method.


## 2026-10-01 amendment: fixed executable after the identity stop

Authority: `amend-sd-binary.md`. This section supersedes only the earlier executable and environment preparation.
The earlier stop report and receipt remain unchanged.
Independent amendment review and explicit `GO PAID 2` remain required before any paid command.

The current public symlink resolves to this versioned executable:

- Versioned executable: `/Users/kalepail/.local/share/claude/versions/2.1.287`.
- Version: `2.1.287 (Claude Code)`.
- SHA-256: `6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea`.
- Private directory: `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-bin`.
- Directory mode: `0700`.
- Private command: `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-bin/claude`.

The private directory contains only the `claude` link to the versioned executable.
The link does not target `/Users/kalepail/.local/bin/claude`.
The answering runner resolves `claude` from `PATH`; the judge uses the captured executable path.
Changes to the public symlink cannot redirect this private link.
A missing or changed versioned executable stops the method.

Before the identity calculation and each collection, use this preparation in the collection shell:

```sh
SD_PIN_BIN='/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-bin'
case "$PATH" in
  "$SD_PIN_BIN":*) ;;
  *) export PATH="$SD_PIN_BIN:$PATH" ;;
esac
export DISABLE_AUTOUPDATER=1
CLAUDE_PATH="$SD_PIN_BIN/claude"
AGENT_BINARY_SHA256=6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea
```

Before the first collection, freeze the environment identity in that same prepared collection shell.
Use one persistent collection shell for all four commands.
The freeze file must not exist. Never overwrite or regenerate it after a mismatch.

```sh
node --input-type=module <<'JS'
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs";
assert.equal(process.env.DISABLE_AUTOUPDATER, "1");
assert.equal(Object.hasOwn(process.env, "QA_AGENT_PROMPT_APPEND"), false);
const identity = agentEnvironmentIdentity();
writeFileSync("/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-collection-environment.json", JSON.stringify(identity, null, 2) + "\n", { flag: "wx", mode: 0o600 });
console.log(JSON.stringify(identity));
JS
```

The frozen environment hash includes the private directory at the front of `PATH`.
Read that file's `sha256` into `AGENT_ENVIRONMENT_SHA256` for the four existing commands.
The collection shell must preserve that environment hash across all four commands.
Never derive a replacement expected hash from a changed environment.
The current identity function excludes `DISABLE_AUTOUPDATER` from its hashed variable names.
Therefore, the following assertion checks its value separately before each command.
Do not change the identity implementation or the reviewed source pins.

Run this assertion immediately before each paid command, in that same prepared collection shell:

```sh
node --input-type=module <<'JS'
import assert from "node:assert/strict";
import { readdirSync, readlinkSync, readFileSync } from "node:fs";
import { executableIdentity, agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs";
const privateBin = "/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-bin";
assert.equal(process.env.PATH.split(":")[0], privateBin);
assert.equal(process.env.DISABLE_AUTOUPDATER, "1");
assert.equal(Object.hasOwn(process.env, "QA_AGENT_PROMPT_APPEND"), false);
assert.deepEqual(readdirSync(privateBin), ["claude"]);
assert.equal(readlinkSync(`${privateBin}/claude`), "/Users/kalepail/.local/share/claude/versions/2.1.287");
const binary = executableIdentity("claude");
assert.equal(binary.resolvedPath, `${privateBin}/claude`);
assert.equal(binary.realPath, "/Users/kalepail/.local/share/claude/versions/2.1.287");
assert.equal(binary.version, "2.1.287 (Claude Code)");
assert.equal(binary.sha256, "6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea");
const environment = agentEnvironmentIdentity();
const frozenEnvironment = JSON.parse(readFileSync("/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/4ba8bc15-98e6-421f-adc4-bd88df700329/scratchpad/backlog/sd-measure-collection-environment.json", "utf8"));
assert.equal(environment.sha256, frozenEnvironment.sha256);
console.log(JSON.stringify({ binary, environment, disableAutoupdaterSet: true }));
JS
```

A failed assertion stops the method before the next paid call.
Capture each assertion result with its command receipt. Never regenerate the expected hash after a mismatch.
All existing source, revision, surface, remote identity, case, and cost assertions remain required.
The private-path preparation replaces the old public-symlink preparation wherever it appears above.
Use these amended identity values in the four existing collection commands.
Each command retains exactly one `--max-budget-usd` flag.
The command caps remain `$25`, `$20`, `$25`, and `$20`, in the reviewed order.
The combined method cap remains `$90`.
Inputs, models, panels, stop rules, reading rules, server ownership, and all other conditions remain unchanged.

Amendment evidence: `reports/sd-measure-checks/binary-amendment-identity.json`.
The initial identity receipt records the amendment shell only; it does not pin the future collection environment.
A separate validation shell produced a different environment hash before any paid call.
The failed assertion receipt remains at `reports/sd-measure-checks/binary-amendment-assertion.json`.
Therefore, this amendment freezes the environment only in the persistent collection shell, before its first paid command.
All subsequent commands must match that frozen hash.
Run all preparation and assertions with failure propagation, such as `set -e`, before the paid command.
No paid command, server, or remote probe ran during this amendment.
Wait for the independent review and `GO PAID 2`.

Free validation passed for the same-shell freeze and two consecutive identity assertions.
The validation changed only the freeze-file path to a separate test receipt.
Evidence: `reports/sd-measure-checks/binary-amendment-validation.json`.
The real collection environment file remains absent until authorized collection preparation.
