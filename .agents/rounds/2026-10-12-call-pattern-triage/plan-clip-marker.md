# Playground clip marker — pre-spend measurement plan

Status: **draft, not authorized.** No paid call ran. The plan needs an independent pre-spend
review and a spend authorization. The paid run waits for the next weekend authorization.
Revision 2 reconciles review RP (Codex `gpt-6-astra`, high, CHANGES-NEEDED on `704d84ae`).

Change under test: the clip marker of Pattern 1 in the
[triage ledger](../2026-10-12-call-pattern-triage.md). When `clipSignature` clips a Playground
`search` card, the marker names the entry's required top-level input fields. Example:
`… [middle clipped for the demo] required input: query`.

Base plan for structure, checkpoints, and helpers:
[ai-upgrade measurement plan](../2026-10-10-weekend/ai-upgrade/measurement-plan.md) and its
[results](../2026-10-10-weekend/ai-upgrade/results.md). This plan names each rule it reuses.

## Question

Does the marker stop the Playground model from calling `stellarDocs.*` operations without a
required input? Does it do so with no routing regression and no verified answer regression?

## Arms

Each arm differs from the other by the clip-marker change only. The section guard and the
section text are absent from both arms.

| Arm | Revision | Tree (pin) | Built how |
| --- | --- | --- | --- |
| BASE | `main` `6891dca23a2e1baab44916a6cd8524006f0e9267` | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` | Detached worktree at that commit |
| CANDIDATE | `main` plus two cherry-picks: `c3b25d9424e74decc819e3132caceeb80e2193b5`, then `6ab15c9f378df80579e0a393fb6b3903337da263` | `db523f8055fc4b9060bcb51727fdb478475b2a9a` | Detached worktree at `main`, then `git cherry-pick` of the two commits |

- The commit SHAs are the `w1012/t` commits after the 2026-10-12 rebase onto `6891dca2`.
  A later rebase changes the SHAs. Cherry-pick the commits with the same subjects:
  "demo: name required inputs in a clipped Playground signature" and
  "demo: keep the required-input marker in the clip fallback".
- The cherry-pick commit SHA depends on the time. The tree hash does not. Assert the tree pin.
- `git diff --stat BASE CANDIDATE` must list only `src/demo/tools.ts` and
  `test/smoke/demo-tools.test.ts`.
- Both arms lock `ai` 7.0.137 and `@ai-sdk/openai` 4.0.91. No arm changes `package.json` or
  `package-lock.json`.
- If `main` moves before launch, build both arms on the new `main`. Record the new trees in the
  ledger as an amendment. The amendment needs no new review only when
  `git diff BASE CANDIDATE` shows the same changed lines as the two commits. Otherwise it needs a
  reviewed amendment.

## Instrument and models

The six-case Playground semantic screen (`scripts/run-playground-semantic-eval.mjs`), as in the
ai-upgrade plan.

| Role | Model | Spend surface |
| --- | --- | --- |
| Answer | `openai/gpt-5.6-terra`, Responses, reasoning `none`, no fallback | Cloudflare AI Gateway `stellar-raven-demo` |
| Judge | `claude-sonnet-5`, rubric `v2.11`, pack `p6` (record from `meta`) | The pinned Claude CLI judge executable |

The server sets `DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra`, `DEMO_OPENAI_API_MODE=responses`, and
`DEMO_REASONING_EFFORT_OVERRIDE=none`.

## Frozen rows

Use the six frozen IDs of the ai-upgrade plan, in corpus order:
`q-anchor-list-builders-discovery`, `q-asset-stablecoin-issuers-discovery`,
`q-protocol-base-reserve-min-balance`, `q-scf-build-award-cap`, `q-sep-45-contract-auth`,
`q-soroban-storage-types`. All six are `active` in `eval/qa/lifecycle-registry.json` at
`6891dca2`.

| Row | Role | Reason |
| --- | --- | --- |
| `q-anchor-list-builders-discovery` | Target | 4 of 4 stored runs called `search_anchor_sep_docs` without `query`. Its card appeared in every stored run. |
| `q-asset-stablecoin-issuers-discovery` | Target | 2 of 4 stored runs called `search_asset_token_docs` without `query`. |
| `q-protocol-base-reserve-min-balance` | Control | Stellar Docs routing control. Its cards are clipped, so it sees the marker. Stored runs had no omission. |
| `q-sep-45-contract-auth` | Control | The same reason. Both target-operation cards appeared in its stored searches. |
| `q-soroban-storage-types` | Control | The same reason. It also did a section read in stored runs. |
| `q-scf-build-award-cap` | Control | Ecosystem control. Clipped `lumenloop` cards with hidden required fields can show the marker. |

**Deterministic exposure.** The marker reaches a row only through a clipped card of an entry
with required inputs. The helper below lists each marker in each `search` result. A row-run
with no marker is unexposed. A grade difference on an unexposed row-run is variance.

## Order and server starts

Two repetitions per arm, in ABBA order: B1, C1, C2, B2. ABBA balances slow source drift.

1. Server `base-a` (BASE): one receipt probe, then B1.
2. Server `candidate` (CANDIDATE): C1, then C2.
3. Server `base-b` (BASE): B2.

The change is not a transport change, so the plan has one receipt probe only (BASE).
One Wrangler process at a time. Stop each server before the next start. Nobody sends a manual,
browser, or `--preflight` turn to an eval server during collection.

## Counts and how to read them

Run the pinned counter (`$COUNT`, see "Commands") on each result. It parses every execute
script with acorn, and it marks each call that it cannot resolve as `unknown`. Its
`--self-check` holds the three review RP fixtures and runs before every count. On the four
stored ai-upgrade runs it prints 28 docs calls, 6 omissions, 0 unknown calls, and 6
`invalid-args` entries. That matches the triage ledger.

| Count | Source | Use |
| --- | --- | --- |
| M1: docs calls that omit a required top-level input, by row and operation | Counter `docsMissing` (parsed against `catalog/manifest.json`) | Primary metric |
| M2: `[invalid-args: …]` entries, by field | Counter `invalidArgs` (the host's `calls:` line) | Cross-check of M1. It also covers non-docs operations. |
| M3: markers per row | Counter `markers` | Exposure check |
| M4: unknown docs calls, unresolved `stellarDocs` references, and unparsed scripts | Counter `docsUnknown`, `unresolvedDocsRefs`, `unparsedScripts` | A reader decides each one by hand before M1 is final |
| M5: `search` response characters per row | Transcript `resultChars` | Card cost of the marker |
| M6: routing class (E, T, O, N) | First successful execute, as in the ai-upgrade plan | Routing rule |
| M7: grades | `verdict.score` | Answer rule |
| M8: tool-loop shape | `demo-steps.mjs` on the server log | Tool-loop defects |

Two readers check M1 against each script and against M2. They reconcile every difference.
Report M1 to M5 per run and per arm.

## Reading rules (fixed before spend)

1. **Completeness.** Apply the ai-upgrade "Method completeness" rules to all four runs. An
   incomplete run gives INDETERMINATE, unless the replacement fills its slot.
   **Grade coverage:** each of the six rows needs a valid grade (`correct`, `partial`, or `wrong`)
   in all four runs. A judge error gets one initial-judge retry: one `re-judge.mjs` command for the
   failed IDs of that run, under `--max-budget-usd 1`, at most two such commands in the round. A
   valid retry grade becomes the row's grade. A grade that is still missing gives INDETERMINATE.
   No repair run is authorized.
2. **Arm integrity.** Every CANDIDATE target row-run that shows a target-operation card must
   show a marker that names `query`. No BASE result may show a marker. A failed check means a
   wrong arm. The method is then INDETERMINATE. Fix the arm and request a new authorization.
3. **PASS** needs all of these:
   - M1 on the two target rows is 2 or more in BASE (B1 plus B2);
   - M1 on the two target rows is at most 1 in CANDIDATE (C1 plus C2);
   - M1 on the four controls is not higher in CANDIDATE than in BASE;
   - no routing regression and no verified answer regression (the ai-upgrade rules);
   - the protocol controls pass routing in both CANDIDATE runs;
   - no tool-loop defect in a CANDIDATE row.
4. **FAIL** if any of these is true. A FAIL blocks the merge.
   - BASE M1 on the target rows is 2 or more, and CANDIDATE M1 is not lower;
   - a routing regression, or a confirmed verified answer regression;
   - a tool-loop defect in a CANDIDATE row;
   - M2 on non-docs operations is higher in both CANDIDATE runs than in both BASE runs, and the
     reviewer traces it to the marker.
5. **INDETERMINATE** in every other case. Examples: an incomplete or non-comparable run, BASE M1
   below 2 on the target rows, or a CANDIDATE M1 of 2 or more that is still below BASE.
   Do not repeat a run under the same authorization.
6. **Confirmation re-judge.** A grade difference is a candidate regression only when both
   CANDIDATE grades are worse than both BASE grades (Correct, Partial, Wrong). Write the list of
   such IDs in the ledger before any re-judge spend. Re-judge those IDs once in B1 and once in
   C1. A difference that the re-judge does not reproduce is judge variance.
7. **Failed confirmation re-judge.** A re-judge that ends T4 or T5 on a listed ID gets one retry
   of the failed IDs, on the same source run artifact, under `--max-budget-usd 1`. When the retry gives a
   valid grade, use it. When the retry also fails, the row is an **unconfirmed regression**.
   An unconfirmed regression on a target row gives FAIL. On a control row, a reviewer other than
   the author traces it to answer content, source drift, or judge variance. An untraced
   unconfirmed regression on a control gives INDETERMINATE. The ledger keeps "unconfirmed"
   separate from "confirmed".
8. Live-check every CANDIDATE `wrong` against the service before it counts.
9. Do not tune per case. A failed row supplies a test, not new marker wording.

The claim stays narrow: a primary-model, six-case Playground screen. It does not cover the
fallback model or the MCP surface. The MCP surface has no clip and 0 of 1,891 omissions.

## Pins and checkpoints (assert before spend)

Apply the ai-upgrade "Launch checkpoints" 1 to 6 with these changes:

- **Paired window.** `test ! -e /private/tmp/stellar-raven-paired-launch`. The owner confirms
  that no paired plan signature or collection is in progress. Do not create that directory.
- **Server slot.** Use a count only: `pgrep -f 'wrangler|workerd' | wc -l` must print `0`.
  Never use `pgrep -fl` or `ps` with arguments. That printed credentials on 2026-10-10.
- **Freeze.** Both worktrees are clean. Both tree pins match. Both arms pass
  `npm run test:smoke`. Record `BASE_GENERATION` and `CANDIDATE_GENERATION` from
  `npm run eval:playground -- --print-generation`. The two values must differ.
- **SDK receipt.** Both arms print `7.0.137 4.0.91` before each server start.
- **Judge pin.** Reuse `judge-pin.mjs` from the ai-upgrade folder in a shell with
  `DISABLE_AUTOUPDATER=1` and a private `$B/bin` first on `PATH`. Re-check it before each judged
  command and each re-judge.
- **Frozen environment.** Compute `AGENT_ENVIRONMENT_SHA256` once, after every Claude variable
  has its final value. Assert it (`ENV_CHECK`, see "Commands") before every paid command: the
  probe, each method run, the replacement, and each re-judge. `judge-pin.mjs` does not check the
  environment, and the Playground runner takes no expected value. A changed value stops the method
  before the next paid call. Keep the original expected value after a failure; a new value needs a
  reviewed amendment. Record each check's output in that command's launch receipt in the ledger.
- **Counter.** `$COUNT` is a copy of `count-patterns.mjs` from the reviewed commit, outside both
  worktrees. Record its SHA-256 before the probe, and check it before each use.
- **Source probe.** Run `node eval/qa/probe-remote-identities.mjs --sha256` before each method
  run and after the last one. Apply the ai-upgrade source-probe stop rule.
- **Logs.** Run each server under `script -q "$B/server/<slot>.log"`, as the ai-upgrade results
  record. `tee` breaks the Wrangler start.

## Budget

Cost basis: the four 2026-10-10 ai-upgrade method runs and two probes
(`/private/tmp/raven-ai-upgrade/results/`). Same lane, answer model, judge model, rubric, pack,
and six IDs. No call had a missing cost.

| Item | n | Range (USD) | Median (USD) |
| --- | ---: | --- | ---: |
| Method run (`meta` total) | 4 | 0.7558 to 0.8493 | 0.8189 |
| Answer turn | 24 | 0.0371 to 0.0817 | 0.0544 |
| Judge call | 24 | 0.0546 to 0.1073 | 0.0738 |
| Receipt probe | 2 | 0.0849 to 0.0850 | 0.0849 |

Expected spend: one probe plus four runs, about $3.40.

| Item | Cap (`--max-budget-usd`) |
| --- | ---: |
| BASE receipt probe | 1 |
| Each method run (4) | 3 |
| One replacement run (reserve) | 3 |
| Re-judge in B1 | 1 |
| Re-judge in C1 | 1 |
| Rule 7 retry in B1, if needed (reserve) | 1 |
| Rule 7 retry in C1, if needed (reserve) | 1 |
| Initial-judge retries, if needed (reserve, at most two commands) | 1 each, 2 in all |
| **Total authorization** | **22** |

- Each cap is about 3.5 times the highest stored run. Caps are limits, not forecasts.
- An answer turn or a judge call above $0.30 stops collection before the next invocation.
- Missing, zero, or excess cost for a started call invalidates the method.
- Call limits: 24 planned answer turns and 24 judge calls, absolute caps 30 each, plus one probe
  turn. Write the cap files as in the ai-upgrade plan, with `experimentId`
  `2026-10-12-clip-marker`. Set the consumed counts from actual counts before each run.
- Use the replacement only for a transport failure with complete cost accounting, as in the
  ai-upgrade "One replacement authorization" section.
- Gateway headroom must cover $22 plus public Playground traffic. Read it privately.

## Commands

Run by hand, in this order, in the pinned shell. Fill each `<…>` from recorded receipts.

```sh
B=/private/tmp/raven-clip-marker          # outside the repository; not the paired-launch path
BASE=6891dca23a2e1baab44916a6cd8524006f0e9267
IDS=q-anchor-list-builders-discovery,q-asset-stablecoin-issuers-discovery,q-protocol-base-reserve-min-balance,q-scf-build-award-cap,q-sep-45-contract-auth,q-soroban-storage-types
UPG=<repo>/.agents/rounds/2026-10-10-weekend/ai-upgrade
REVIEWED=<the reviewed w1012/t commit that holds count-patterns.mjs>
mkdir -p "$B/caps" "$B/results" "$B/server" "$B/bin" "$B/tools"
git show "$REVIEWED:.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs" > "$B/tools/count-patterns.mjs"
COUNT="$B/tools/count-patterns.mjs"
COUNT_SHA256=$(shasum -a 256 "$COUNT" | cut -d ' ' -f 1)   # record in the ledger

# Arms.
git worktree add --detach "$BASE_WT" "$BASE"
git worktree add --detach "$CAND_WT" "$BASE"
git -C "$CAND_WT" cherry-pick c3b25d9424e74decc819e3132caceeb80e2193b5 6ab15c9f378df80579e0a393fb6b3903337da263
test "$(git -C "$BASE_WT" rev-parse HEAD^{tree})" = ab4c63e3de9e85b479dea657169d2ff5a8ed9387
test "$(git -C "$CAND_WT" rev-parse HEAD^{tree})" = db523f8055fc4b9060bcb51727fdb478475b2a9a
git -C "$CAND_WT" diff --stat "$BASE" HEAD   # only the two demo files
# In each worktree: npm ci, copy .dev.vars without printing it, npm run typegen,
# npm run test:smoke, then git status --porcelain must print nothing.

# Judge pin (ai-upgrade procedure).
export DISABLE_AUTOUPDATER=1
ln -s "$(realpath "$(/usr/bin/which claude)")" "$B/bin/claude"
export PATH="$B/bin:$PATH"
node "$UPG/judge-pin.mjs" "$B/bin" > "$B/judge-pin.json"   # record JUDGE_SHA256
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
# Record AGENT_ENVIRONMENT_SHA256. ENV_CHECK exits 1 when the environment differs from it.
ENV_CHECK='import { agentEnvironmentIdentity } from "'"$BASE_WT"'/eval/lib/executable-identity.mjs"; const got = agentEnvironmentIdentity().sha256; if (got !== process.argv[1]) { console.error("agent environment changed: " + got); process.exit(1); } console.log("agent environment ok " + got);'
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
(cd "$BASE_WT" && node "$COUNT" --self-check)

# Dry runs and generations, from each arm's worktree.
npm run eval:playground -- --print-generation
npm run eval:playground -- --dry-run --ids "$IDS"

# Server base-a, from $BASE_WT.
script -q "$B/server/base-a.log" npm run dev:eval -- --var DEMO_MODEL_OVERRIDE:openai/gpt-5.6-terra \
  --var DEMO_OPENAI_API_MODE:responses --var DEMO_REASONING_EFFORT_OVERRIDE:none
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 1 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/receipt-base.json" --ids q-soroban-storage-types --no-judge --out-dir "$B/results/receipt-base"
node "$UPG/demo-steps.mjs" "$B/server/base-a.log" --strict-usage   # turn 1; receipt gate
node eval/qa/probe-remote-identities.mjs --sha256
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 3 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/b1.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/b1"
node "$UPG/demo-steps.mjs" "$B/server/base-a.log"   # turns 2-7
# Stop base-a.

# Server candidate, from $CAND_WT (same dev:eval command, log "$B/server/candidate.log").
node eval/qa/probe-remote-identities.mjs --sha256
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 3 --url "$URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/caps/c1.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/c1"
node eval/qa/probe-remote-identities.mjs --sha256
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 3 --url "$URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/caps/c2.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/c2"
node "$UPG/demo-steps.mjs" "$B/server/candidate.log"   # turns 1-6 (C1), 7-12 (C2)
# Stop candidate.

# Server base-b, from $BASE_WT (log "$B/server/base-b.log").
node eval/qa/probe-remote-identities.mjs --sha256
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 3 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/b2.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/b2"
node "$UPG/demo-steps.mjs" "$B/server/base-b.log"   # turns 1-6
node eval/qa/probe-remote-identities.mjs --sha256
# Stop base-b.

# Replacement, only under the replacement rule, on the failed run's arm and server.
node eval/qa/probe-remote-identities.mjs --sha256
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 3 --url "$URL" --server-generation "<failed arm generation>" --round-cap-context "$B/caps/replacement.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/replacement"
node eval/qa/probe-remote-identities.mjs --sha256

# Free reads, from $BASE_WT (acorn and the manifest resolve from the working directory).
test "$(shasum -a 256 "$COUNT" | cut -d ' ' -f 1)" = "$COUNT_SHA256"
node "$COUNT" --rows "$B"/results/{b1,c1,c2,b2}/*-playground-semantic.json
npm run eval:plan -- "<each result file>"

# Re-judges, only for the IDs listed in the ledger: a confirmation (rule 6), a rule 7 retry, or an
# initial-judge retry (rule 1). The source is always the original run artifact. re-judge.mjs
# writes a new artifact; record the source path and the new path. Dry run first.
node eval/qa/re-judge.mjs "<source run result>" --ids "<listed IDs>" --cases-ref "$BASE" --dry-run
node "$UPG/judge-pin.mjs" "$B/bin" "$JUDGE_SHA256"
node --input-type=module -e "$ENV_CHECK" "$AGENT_ENVIRONMENT_SHA256"
node eval/qa/re-judge.mjs "<source run result>" --ids "<listed IDs>" --cases-ref "$BASE" \
  --max-budget-usd 1 --claude-path "$B/bin/claude" \
  --expect-agent-binary-sha256 "$JUDGE_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256"
```

Each paid command passes exactly one `--max-budget-usd`. Check that before each command.

## Records

Record the pins, stamps, costs, counts, and readings in a new "Measurement results" section of
the [triage ledger](../2026-10-12-call-pattern-triage.md). Results, caps, and logs stay outside
the repository. A non-author reviewer reviews the result before the merge decision.
