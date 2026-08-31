# Product and measurement plan — eval stability and protocol-history routing

Date: 2026-08-31 (revised after the Grok plan review)
Lane: Product and measurement plan (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-08-31-eval-routing-next.md`
Review reconciled: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-plan.md`
Reconciliation record: `.agents/rounds/2026-08-31-eval-routing-next/plan-reconciliation-fable.md`
Status: plan only. No paid call ran. No code, shared ledger, or production file changed.
This plan authorizes no paid work.

## 1. Decision

This round runs a sequence. It does not run a paid collection first.

| Step | Work | Cost | Gate to start |
| --- | --- | --- | --- |
| 1 | Free stability register refresh and record (block 2) | `$0` | none; done in this plan |
| 2 | Routing mechanism design and measurement (block 3) | `$0` | section 4.3 family list reconciled; done in this revision |
| 3 | Independent code review of a product commit | `$0` | a step 2 candidate passes both frozen contracts |
| 4 | Paid routing slice `R0` + `R1` (unjudged paired collection) | `$35.40` ceiling | step 3 PASS, a pre-spend delta review PASS, and user authorization of the exact caps |
| 5 | Optional paid judging `R2` | `$5.00` ceiling | the row review documents a need; separate user authorization |

The expected paid spend for this round is `$0`. Step 4 runs only if step 2 produces a
candidate that passes every frozen contract. No candidate exists today.

Reasons for this order:

- The free register refresh answers the judge-stability TODO. The same-100 unstable count is
  `57` before and after the 2026-08-30 collection. See section 3.
- A paid same-100 collection has no product candidate to measure. The routing fix is unshipped.
  The owner product-loss margin is still open. A paired verdict is therefore impossible this round.
- The stored same-tuple baseline is rubric `v2.9`. The current rubric is `v2.10`. The reviewed T4
  exclusion leaves 99 eligible IDs, and the powered method needs 100. A new collection cannot repair
  that old paired result.
- The routing defect is in this repository's lexical router. Free routing instruments measure it.
  A paid QA slice only checks that a passing candidate does not harm answers. It cannot prove a gain.

## 2. Verified state at the plan revision

All checks below ran on 2026-08-31 in the worktree. All were free and offline. The Grok review
reproduced every hash and result in this section.

| Pin | Value |
| --- | --- |
| Branch | `next/eval-routing-stability` |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c`; equal to `origin/main` |
| Tree | tracked files clean; the round-directory files are untracked, so this is not a clean paid-launch tree |
| `catalog/manifest.json` | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| `eval/run-routing.mjs` | `7b1e396b7db74dc7028bd6b6d1dd7fb51e9b6401f084a6bb0d58a326420eeed0` |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` |
| `eval/gates.json` | `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371` |
| `eval/protocol-history-cases.json` | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| `eval/run-protocol-history.mjs` | `bfaaf48969676492529b83a0fad19473891e0b359e47cedeeaa8ccfb616f68c0` |
| `src/catalog/search.ts` | `04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` |
| `eval/qa/judge.mjs` | `b895910e5b2d0fd17cae6f111ec2ed648fc7c8ddf5f76cee98bf796b28fa8137` (`JUDGE_RUBRIC = "v2.10"`) |
| `eval/qa/run-qa.mjs` | `3f7414ced6f1c6852ecf9e8e2d3e4af4a4c6a50d721285882105cbd43109755d` |
| Evidence pack | `p5` |

Free instrument results at `HEAD`:

| Command | Result | Trace |
| --- | --- | --- |
| `npm run eval:routing -- --gate` | `GATE PASS`; legacy 208/279/311; skills 16/23/23; holdout 10/22/25 with 11 forbidden captures; extended strict 90/109/117 | `eval/results/routing-2026-08-31T15-02-56-852Z.json` |
| `npm run eval:protocol-history` | `protocol-history-routing-v1`: 4/8 positives, 1/4 control captures, FAIL; `protocol-history-blind-v1`: 3/11 positives, 6/9 control captures, FAIL | `eval/results/protocol-history-2026-08-31T15-02-49-140Z.json` |

These values equal the 2026-08-30 baseline. The router did not move between the two rounds.
The ranked dump holds 338 + 122 + 23 + 12 = 495 cases. The holdout and blind sets are outside it.

Two setup facts apply to every lane:

- The worktree lacks `.dev.vars` and `env.d.ts`. Before `npm run typecheck`, create the
  placeholder `.dev.vars` with the CI names and run `npm run typegen`, as `AGENTS.md` describes.
- The worktree has no `eval/qa/results` directory. Every register command must pass
  `--results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results`. A default
  refresh from this tree would be empty.

## 3. Block 2 — judge stability (free refresh done; one TODO closes; the block stays open)

### 3.1 The refresh

The 2026-08-29 register predates the 2026-08-30 same-100 collection. Two lanes regenerated the
register on 2026-08-31 with the two new artifacts. Both commands were free and read-only.

```sh
node eval/qa/judge-stability.mjs \
  --results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results \
  --out <local path>
```

Output for both: `judge-stability: 538 case(s) from 197 artifact(s) (163 collection, 34 rejudge, 0 skipped)`.

| Register file | SHA-256 | `generatedAt` |
| --- | --- | --- |
| 2026-08-29 durable register (`eval/qa/results/2026-08-29-five-track-same-100-stability.json`) | `50dd2d79adae60cba85935776f4bb3458ac191f84a9bb43dc8f94657f9bdbd00` | `2026-08-29T20:27:05.073Z` |
| Terra refresh `/tmp/qa-register-2026-08-31.json` | `5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53` | `2026-08-31T14:59:16.388Z` |
| Fable refresh `<scratchpad>/stability-refresh-2026-08-31.json` | `f13c687b642b514d90e6fd3c3899e8b3fc5be1729dcc92eac0ffd32fd173fdd6` | `2026-08-31T15:01:08.296Z` |

The two 2026-08-31 files share one case body. Their `_meta` objects match after `generatedAt` is
removed. The case-body digest is
`0c9face7c641a84c5829416570a1dbf24aa27ff8f02a58528e172f21e0985315`. Reproduce it with this rule:
remove `_meta`, sort every object key recursively, serialize with compact `JSON.stringify`, and
take the SHA-256. Use the body digest to prove reproduction. The file SHA-256 cannot reproduce,
because `generateStabilityRegister` writes `generatedAt` and source `mtimeMs` into `_meta`.

| Measure over the pinned same-100 IDs | 2026-08-29 register | 2026-08-31 refresh |
| --- | ---: | ---: |
| Source artifacts | 195 | 197 |
| Cases below `0.75` | 57 | 57 |
| Mean stability score | 0.7137 | 0.7085 |
| Pooled instability events / comparisons | 277 / 920 = 0.301 | 311 / 1023 = 0.304 |

Four cases crossed into unstable: `q-gap-builders-person-empty`,
`q-history-ecosystem-index-freshness-live`, `q-protocol-ledger-close-time` (0.75 to 0.60), and
`q-soroban-sdk-macros`. Four cases crossed out: `q-edge-fresh-latest-scf-round`,
`q-org-sdf-enterprise-fund`, `q-quickstart-manual-ledger-close`, and
`q-sor-p23-auto-restore-extendto`. The set moved. The count did not.

Unstable count by comparison count in the refresh:

| Comparisons | Unstable | All same-100 |
| ---: | ---: | ---: |
| 7 | 28 | 51 |
| 8 | 13 | 23 |
| 9 | 1 | 2 |
| 10 | 2 | 5 |
| 11 | 0 | 1 |
| 12 or more | 13 | 18 |

### 3.2 Reading

The count is stable at `57`. It did not fall. The earlier jump from `47` to `57` held; it did not
reverse. The correct close note is "stable at 57", not "no degradation".

The score formula divides instability events by comparisons. The pooled event rate is `0.30`. The
threshold `0.75` accepts at most `0.25` events per comparison. The threshold therefore sits below
the observed event rate. Under a stationary binomial model at rate `0.30`, a case with 7
comparisons falls below `0.75` with probability `0.67`. A case with 8 comparisons falls below with
probability `0.45`. A case with 10 comparisons falls below with probability `0.62`. The observed
`57` of `100` sits inside that band. The data shows no further rise. It also shows a threshold set
near the event rate.

The register mixes two variance sources. Each collection artifact adds a new answer and a new
verdict. Only re-judge artifacts hold the answer fixed. The register therefore measures verdict
stability across collections and re-judges, not judge-only stability. The committed `23.3%` noise
floor came from identical-input re-judges and is a different quantity.

### 3.3 What closes and what stays open

Close only the `.agents/TODO.md` item "Judge stability on the same-100 set is degrading" at round
closeout. Its done condition is met: the post-collection refresh reports a stable count. Record
in the round ledger: the refresh command, the output line, the three file hashes, the case-body
digest, the 4-in and 4-out lists, and the mean-score drop from 0.7137 to 0.7085.

`.agents/NEXT.md` block 2 stays open. It still holds the Raven capability-boundary diagnostic and
the Friendbot monitor. Do not write "block 2 is done".

Record two calibration facts for future briefs. First, the register measures verdict stability
across collections and re-judges, not judge-only variance. Second, the 2026-08-30 same-100 mean
panel-row cost was `$0.244` and the mean single-row cost was `$0.0617`; `57 × 0.244 + 43 × 0.0617`
matches the stored judge spend `$16.5629124`. The Method 2 brief used `$0.180` per panel and
estimated `$13.23`. Future briefs must use the `$0.244` figure. Both facts belong in the
`eval/qa/README.md` "Judge-tier contract" section in the closeout commit.

Register identity rules for this round:

- Two hashes mean two files with different `generatedAt` values, not two schedules.
- Do not pin "the 2026-08-31 register" by regenerating it. If a later method needs a pin, copy one
  of the two existing files at authorization time and record its full SHA-256 and the case-body
  digest.
- No register is pinned for paid use in this round. No method in this round consumes it.
- Do not copy a register into the Desktop `eval/qa/results/` path before a method is approved. A
  closeout copy is optional documentation only. The name `2026-08-31-eval-routing-next-stability.json`
  does not match the collection or re-judge ingest rule, so a later refresh would not ingest it.

Do not change the escalation policy in this round. With this register, a later same-100
collection selects 57 uncapped panels and 43 singles, which is 214 judge calls. That is the price
of three votes on the noisy half of the set. A policy change needs its own reviewed brief.

The following block 2 items get no work this round:

- The Raven capability-boundary diagnostic. No new mechanism exists. The round ledger excludes it.
  Trigger: a mechanism proposal that is not prose, plus a free offline diagnostic.
- The Friendbot network-context failure. It stays monitor-only under the two-unrelated-cases bar.
- The owner product-loss margin. No paired verdict is planned, so the decision is not blocking.
- The T4 `partial-without-issue` row `q-eco-stellar-wallets-list` stays untested under `v2.10`.
  The optional one-row re-judge stays out of this round.

### 3.4 Deferred paid work with its trigger

A same-tuple pinned pair remains the missing calibration input for the paired method. It needs two
complete same-100 collections under one `claude-sonnet-5` / `v2.10` / `p5` tuple with one pinned
register. Stored same-100 costs are `$31.9693122` (2026-08-28), `$40.9579502` (2026-08-30), and
`$45.711693` (2026-08-27). The median is `$40.96`. A pair costs about `$82`, with a stored range of
`$64` to `$92`. The Method 2 cap of `$50` per collection left a `$9.04` residual and is the
right cap shape.

Trigger for that spend: a merged product candidate that needs a paired look, plus the owner margin
recorded in `.agents/NEXT.md`. Neither exists today. Do not spend on calibration alone.

## 4. Block 3 — protocol-history routing (free)

### 4.1 Scope

Surface `scout.searchResearch` for protocol-history and incident questions with one general
mechanism. Protect direct technical searches. Measure only with the free routing instruments.
Keep the commit topology from the 2026-08-30 round: measurement commits first, one product commit
last. Keep both frozen case files byte-stable.

The Sol lane owns the mechanism design. This plan sets the bar, the boundaries, and the exit.

### 4.2 Inherited acceptance for a product commit

The 2026-08-30 ledger fixed these conditions. They stand unchanged.

- Keep the original and blind case content byte-stable.
- Pass every positive and every control in both frozen contracts: 8/8 and 0/4; 11/11 and 0/9.
- Keep coverage-failed entries in the backfill tier.
- Preserve score order and `TIER_INTERLEAVE_MARGIN` across tiers.
- Keep `q-protocol-version-history-list` at strict top-1 `stellarDocs.search_protocol_concepts_docs`.
- Add `searchCatalog` tests for all nine hostile control shapes.
- Preserve every routing gate without a rebaseline: legacy 208/279/311, skills 16/23/23,
  holdout 10/22/25 with at most 11 forbidden captures.
- Record every changed query from the exact 495-case ranked comparison.

If the best candidate reaches zero control captures and all gates but misses blind positives, do
not ship it. Record it as a named candidate with its exact misses. A change to the positive bar is
a ledger-level decision for the user, not for a lane.

### 4.3 Boundaries for the mechanism

Rejected mechanisms stay rejected. The lane must not reuse them:

- Case vocabulary copied into descriptions, keywords, or a classifier.
- Coverage-failed research hits placed in the gated tier.
- All corpus-scope entries or the research profile pair moved to backfill.
- A full-page research backfill that raised hostile captures from 6/9 to 8/9.
- A fixed bonus that bypasses `TIER_INTERLEAVE_MARGIN`.
- A classifier that maps or collapses the diagnostic classes.
- Any per-question map from a query to a service.
- A paid or hosted comparator inside step 2. Step 2 is a `$0` eval step.

Allowed mechanism families:

- **Structured semantic route-fit, measurement only.** This is the Sol design family. The pinned
  local Qwen embedding infrastructure compares a query with operation-owned routing clauses over a
  bounded candidate union that includes coverage-failed entries. The exact experiment is
  `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md`. It uses no
  production model call and changes no `src/` file. A pinned local cross-encoder belongs to the
  same family but is deferred to a later brief.
- A query-shape feature that reads structure, not topic. Examples: first-person ownership
  tokens, imperative request forms, and named-entity presence. The feature must apply to every
  entry through manifest profiles, not to one operation by name.
- A generated catalog-note change in `scripts/` that reduces bag-word overlap on the research
  entry. This is a prose change and must show a measured before-and-after delta.
- A retrieval-profile edge change in the manifest profiles, if the profile schema already supports
  it.

Every candidate records the same four items: the exact 495-case ranked diff, both frozen contract
tables, the routing gate verdict, and the four relevant extended cases from the 2026-08-30 ledger.

### 4.4 Attempt box

The lane tries at most three distinct mechanisms. The implementation brief's clause-fit experiment
is attempt one. Attempt one is blocked: `review-grok-clause-brief.md` returned BLOCK, and the
build stays blocked until `review-grok-clause-brief-delta.md` is PASS. The plan-delta PASS does
not lift that block. Each attempt gets one ledger entry with the four items above. After the third
failed attempt, the lane stops. The branch then stays measurement-only, and block 3 moves to a held
state with this trigger: a non-lexical retrieval lane, or an upstream Scout-side query hint.

### 4.5 Free commands for each candidate

Setup once per worktree:

```sh
cp <placeholder with the CI secret names> .dev.vars
npm run typegen
```

Per candidate:

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:routing -- --gate --dump-ranked <scratchpad>/protocol-routing-<candidate>.json
npm run eval:protocol-history
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Compare each ranked dump against the `HEAD` dump. The `HEAD` dump must hold exactly 495 cases.
Record the changed query IDs in the ledger.

### 4.6 Independent code review

Author: Codex GPT-5.6 Sol high. Orchestrator: Claude Fable 5 high. Reviewer: Grok 4.6 high. The
reviewer differs from both. Effort stays high. Escalate to xhigh only after a high pass misses a
real finding. The reviewer writes findings to
`.agents/rounds/2026-08-31-eval-routing-next/review-grok-product.md` and replies with the path.

The review checks the rejected-mechanism list, the nine hostile shapes, the tier invariants, the
gate totals, and the byte-stability of both frozen case files. Every finding is reconciled before
step 4 starts.

## 5. Paid method — routing slice `R0` + `R1` (conditional; not authorized)

### 5.1 Purpose

Check that a passing routing candidate does not harm end-to-end answers on the queries it changes.
The method is an unjudged paired collection with transcript review. It follows the 2026-08-27
connector A/B shape. It can block a candidate. It cannot prove a gain.

### 5.2 Preconditions

- The Grok plan review is reconciled. This revision does that.
- Step 3 review verdict is PASS with all findings reconciled.
- The product commit exists on the branch, and the tree is clean including untracked files. The
  round-directory files must be committed first, or `run-qa.mjs` refuses.
- `S` is frozen in runner order with its `caseInputSha256` values.
- The pre-spend delta review in section 5.10 is PASS. The plan review is not that delta review,
  because `S` does not exist yet.
- The user authorizes the exact caps in section 5.5 after that review.

### 5.3 ID selection rule

The IDs are not known today. They come from the candidate. The rule is fixed now.

1. Take the exact 495-case ranked dumps for arm A and the candidate.
2. Form `C`, the set of routing case IDs whose ordered top-five list differs.
3. Form `S = C ∩ active QA IDs` from `eval/qa/cases.json` with `truth.lifecycle.state = active`.
   The compiled battery has 500 active cases and 0 quarantined cases.
4. Never keep more than 20 IDs. Let `T` be the IDs in `S` whose top-1 changed.
   - If `|T| > 20`: sort `T` by id and take 20 even-spaced picks with the `stratifiedSample` step
     rule from `eval/qa/lib.mjs`: `step = pool.length / want`, pick `pool[floor(i * step)]` for
     `i` from 0 to `want - 1`. Keep nothing else.
   - If `|T| <= 20` and `|S| > 20`: keep all of `T`. Sort the remainder `S \ T` by id and fill to
     20 with the same step rule, where `want = 20 - |T|`.
   - If `|S| <= 20`: keep all of `S`.
5. If `|S| < 4`, skip `R1`. Record that the free instruments cover the change.
6. Freeze `S` in runner order, not lexicographic order. `run-qa.mjs --ids` filters `cases.json`
   in battery order and stamps that order as `meta.selectedIds`. Produce the order with a free
   dry filter over `eval/qa/cases.json` and record it. Record the ordered SHA-256 and each
   `caseInputSha256`.

Evidence for the rule: the closest rejected 2026-08-30 candidate changed 15 of 495 rankings.
Eight of those IDs exist in the QA battery: `q-comp-clawback-cap0035`,
`q-hist-remittance-corridors`, `q-protocol-24-whisk-incident`, `q-protocol-bls12-381-cap59`,
`q-scf-funding-by-category`, `q-sep-clawback-prereq-flag`, `q-tool-skill-detail-install`, and
`q-tool-which-sdk-comparison`. `q-pc-protocol-upgrade-timing` is a QA case but was not in that
changed set. The `ph-*` and `phb-*` diagnostic cases have no QA case and never enter `S`.

### 5.4 Arms and servers

| Arm | Revision | Role |
| --- | --- | --- |
| A | the parent commit of the product commit | control |
| B | the product commit | candidate |

Arm A isolates the product diff. Do not assume arm A equals `main` `1bfb983`. If the claim "same
router as `main`" is needed, verify that `src/catalog/search.ts` at arm A hashes to
`04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` and record the check.

Each arm uses one clean worktree for both its server and its runner. One Wrangler process runs at
a time, in a pane the operator split. Run arm A first, then arm B. Stop and record arm A before arm
B starts. Record the wall-clock gap between arms.

Per arm, before spend:

```sh
PORT=8788
SERVER_REVISION="$(git rev-parse HEAD)"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
grep -q '^DEV_ALLOW_UNAUTHENTICATED=true$' .dev.vars
npm run dev:eval -- --port "$PORT"      # in the owned pane
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json <scratchpad>/raven-eval-surface-<arm>.json
```

Record `surfaceSha256` per arm. The two hashes can be equal for a scorer-only change. Record both.

### 5.5 Cost caps from stored runs

Percentile method for every row below: sort the per-row `agent.costUsd` values ascending and take
the nearest-rank P90, the value at index `ceil(0.9 × n) - 1`.

Matching evidence: `claude-sonnet-5` answering, variant A, `qa-agent-result-v4`, no prompt append,
agent binary `2.1.251` (`625869b0…`):

| Stored run | Rows | Mean | P90 | Max |
| --- | ---: | ---: | ---: | ---: |
| `2026-08-30T03-43-11-variantA.json` | 100 | `$0.244` | `$0.411` | `$0.650` |
| `2026-08-28T19-27-08-variantA.json` | 100 | `$0.240` | `$0.374` | `$0.860` |

Extra context only, not matching evidence:

| Stored run | Rows | Mean | Max | Why not matching |
| --- | ---: | ---: | ---: | --- |
| `2026-08-27T00-02-11-variantA.json` | 100 | `$0.337` | `$0.969` | `qa-agent-result-v1`; no binary pin |
| `2026-08-27T18-50-04-variantA.json` (A1) | 8 | `$0.281` | `$0.558` | binary `2.1.247` |
| `2026-08-27T18-59-44-variantA.json` (B1) | 8 | `$0.297` | `$0.584` | binary `2.1.247` |

| Method | Calls | Expected at `$0.244` | P90 case at `$0.411` | Cap | Cap basis |
| --- | ---: | ---: | ---: | ---: | --- |
| `R0` qualification | 1 | `$0.24` | `$0.41` | `$1.00` | above every stored maximum |
| `R1` arm A | `|S| <= 20` | `$4.88` | `$8.22` | `$17.20` | `20 × $0.860`, the matching maximum |
| `R1` arm B | `|S| <= 20` | `$4.88` | `$8.22` | `$17.20` | same |
| Total collection | `<= 41` | `$10.00` | `$16.85` | `$35.40` | sum |

The arm cap uses the larger matching maximum, so a 20-row arm at the stored worst case completes.
A call above `$0.860` can still stop an arm. An incomplete arm is incomplete evidence. Do not raise
a cap mid-method. If the delta review wants a different cap, it sets the cap before authorization.
Each command carries exactly one `--max-budget-usd`.

### 5.6 Pins asserted before each paid command

- `HEAD` equals the arm revision. The tree is clean including untracked files.
- MCP `initialize` returns HTTP 200 and the pinned revision.
- The live surface report passed with `--expect-source-revision`, and `surfaceSha256` is recorded.
- The `claude` binary on `PATH` resolves to one path. Record its version and SHA-256. The last pin
  was `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5` for `2.1.251`. A new
  version is a new pin, not a stop. Both arms must share one binary hash.
- `QA_AGENT_PROMPT_APPEND` is unset. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set. No
  `ANTHROPIC_*`, other `CLAUDE_*`, or `RAVEN_CLAUDE_*` name is set. Run the five-name environment
  check from the 2026-08-29 ledger and record its `sha256`. Both arms must share one environment
  hash.
- `.dev.vars` sets `DEV_ALLOW_UNAUTHENTICATED=true` in the arm worktree. This is an operator
  prerequisite for the loopback bypass.
- The frozen `S` in runner order, its SHA-256, and the `caseInputSha256` map match the ledger.

### 5.7 Commands

`R0` runs against arm B only. It checks that the answering agent can see the new ranking.

```sh
node eval/qa/run-qa.mjs --variant A --ids q-protocol-24-whisk-incident \
  --no-judge --model claude-sonnet-5 --max-budget-usd 1 --port "$PORT" \
  --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256"
```

Reading `R0`: the row keeps each `search` call's whole `input` and a bounded `resultProjection`
with `hits[].id`. Compare the stored search query with the case question.

- The query equals the case question and `scout.searchResearch` is absent from the hits: stop.
  The candidate contradicts the free dump. Inspect before any further spend.
- The query is a rephrase and `scout.searchResearch` is absent: the qualification failed. It is
  not proof that the dump is false. Record the stored query string. Do not abandon the candidate
  on this evidence alone. `R1` does not start under this authorization.
- `scout.searchResearch` appears in any search call's hits: the qualification passed.

Note that `q-protocol-24-whisk-incident` is tagged `service: stellarDocs` with surface
`stellarDocs.search_protocol_concepts_docs`. A correct research route can move `execute` onto
Scout. That movement is expected, not a defect.

`R1` runs the same command per arm with `--ids <S in runner order>` and `--max-budget-usd 17.20`.

After each arm: repeat the surface report, confirm `meta.comparable: true`, confirm
`meta.costAccounting.complete: true`, confirm `meta.selectedIds` equals the frozen order, and
confirm every row reports `raven` as `connected`.

Copy behavior: the original artifact stays in the arm worktree `eval/qa/results/`. Record its
SHA-256. Make one read-only archive copy under the round's local evidence path and record that
hash too. Do not copy into the Desktop `eval/qa/results/` directory before the round closes. A
closeout copy there is optional documentation. Unjudged rows never enter the stability register.

### 5.8 Reading rules

1. Completeness first. Each arm needs `|S|` rows, zero agent failures, and `comparable: true`.
   Otherwise read per row only and make no arm-level claim.
2. Run the free plan regrade on both artifacts: `npm run eval:plan -- <artifact>`. Read
   `requiredCovered` and `onPlanRatio` per id as a diagnostic only. The motivating case is tagged
   `stellarDocs`; a correct research route can add Scout and drop Docs coverage. A regrade drop is
   therefore never a regression by itself.
3. Check the stored search projection per row. Record whether arm B surfaced
   `scout.searchResearch` and at which rank.
4. Run a free deterministic key-fact check. For each id, test each `golden.keyFacts` string and
   each numeric or identifier token against the answer text. Report presence per arm. This is a
   diagnostic, not a grade.
5. The independent reviewer reads each transcript pair and assigns one label per id: `improved`,
   `neutral`, `regressed`, or `indeterminate`. A `regressed` label needs a trace: arm B's search
   hits differ, the agent followed the new hit, and the answer lost a key fact or gained a wrong
   claim.
6. Verdict `FIRST-PAIR-BLOCK`: one or more `regressed` labels with a trace from rule 5. A regrade
   drop or a key-fact difference alone cannot block.
7. Verdict `FIRST-PAIR-PASS`: zero `regressed` labels. The candidate may merge with this exact
   claim: "no observed regression on the changed slice; routing gates green; frozen contracts
   green". Never claim a QA gain from `R1`. The sample is at most 20 and unjudged.
8. No repeat under this authorization.

### 5.9 Stop conditions

- Stop before spend if any pin in section 5.6 fails.
- Stop after `R0` when the stored query equals the case question and `scout.searchResearch` is
  absent. Record a rephrased miss as a failed qualification and do not start `R1`.
- Stop after any incomplete row, missing cost, MCP not-connected row, or comparability failure.
- Stop when a command reaches its exact cap. Do not raise a cap mid-method.
- Keep only the harness's one byte-identical transport retry. Do not retry an arm.
- Stop after arm A and record before arm B starts.
- A budgeted call with no reported cost invalidates the method.
- Do not run a judge, a repeat, or a second slice under this authorization. `R2` needs its own.

### 5.10 Independent review for the paid method

Pre-spend delta review: Grok 4.6 high. Input: the frozen `S` in runner order, the pins, the caps,
and sections 5 and 6. Report path:
`.agents/rounds/2026-08-31-eval-routing-next/review-grok-r1-prespend.md`. The review verifies
that `S` follows the rule in 5.3, that the caps come from the stored runs above, and that the
reading rules cannot produce a gain claim. Reconcile every finding before authorization. This
review is mandatory after `S` exists.

Post-collection raw-row review: Grok 4.6 high, blind to the orchestrator's expected labels. Report
path: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-r1-rows.md`. The reviewer assigns
the per-id labels in 5.8 and states the verdict.

## 6. Optional paid method `R2` — judging the slice (not authorized)

Run `R2` only if the row review documents that a label depends on a fact the transcript cannot
settle. `R2` needs its own user authorization of a separate `$5.00` cap.

Panel contract: all-single judging. `--max-panel-cases 0` caps boundary panels only. Stability
panels are uncapped and fire for any `S` id with usable register history below `0.75`. Two of
the eight example ids already sit below `0.75`: `q-hist-remittance-corridors` at 0 and
`q-protocol-24-whisk-incident` at 0.5. Therefore pin a register with no usable history:

```sh
mkdir -p <scratchpad>/r2-empty
node eval/qa/judge-stability.mjs --results-dir <scratchpad>/r2-empty --out <scratchpad>/r2-empty-register.json
shasum -a 256 <scratchpad>/r2-empty-register.json
```

Prove the no-panel path with this free check before spend. It must print `available`, `0`, and
`single`:

```sh
node --input-type=module -e 'import { loadJudgeStabilityRegister } from "./eval/qa/judge-stability.mjs"; import { selectJudgeTier } from "./eval/qa/judge.mjs"; const r = loadJudgeStabilityRegister(process.argv[1], { verifySources: false }); console.log(r.status, r.caseCount); const budget = { boundaryPanelCases: 0, maxPanelCases: 0 }; console.log(selectJudgeTier({ caseId: "q-protocol-24-whisk-incident", verdict: { score: "partial", missingFacts: ["x"], wrongClaims: [], avoidMatches: [] }, tags: {}, stabilityRegister: r, panelBudget: budget }).judgeTierUsed);' <scratchpad>/r2-empty-register.json
```

`--judge-stored` writes in place. Judge a copy, never the original or the archive copy:

```sh
cp <arm-worktree>/eval/qa/results/<stamp>-variantA.json <scratchpad>/r2/<arm>.json
node eval/qa/run-qa.mjs --judge-stored <scratchpad>/r2/<arm>.json \
  --judge-model claude-sonnet-5 \
  --stability-register <scratchpad>/r2-empty-register.json \
  --max-panel-cases 0 --max-budget-usd 2.5 \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256"
```

`run-qa.mjs` asserts `--expect-agent-binary-sha256` before the `--judge-stored` branch. Both arms
must use one binary hash. `--judge-stored` also refuses a moved corpus, a changed evidence pack,
a changed result schema, or a mixed judge tuple. Record the register hash and the stamped
`meta.judgeTiering` in the ledger.

Cost basis: mean single-row cost `$0.0617` to `$0.0686`. Expected `20 × $0.069 = $1.38` per arm.
The `$2.50` per-arm cap is valid only under all-single judging. If the free check does not print
`single`, `R2` does not run. Verdicts on at most 20 rows are diagnostic under the `23.3%` noise
floor. They never override a transcript label.

## 7. Closeout requirements

- Record every command and its output in the round ledger, not a summary.
- Record the three register hashes, the case-body digest, the 4-in and 4-out lists, and the
  mean-score drop.
- Update `eval/README.md` "Protocol-history frozen measurement" with the candidate result, the
  changed-query list, and the traces. If nothing ships, say so.
- Update `eval/qa/README.md` "Judge-tier contract" with the two calibration facts in 3.3.
- Update `.agents/TODO.md`: delete only the judge-stability item with the note "stable at 57".
  Keep or retarget the routing item.
- Update `.agents/NEXT.md` blocks 2 and 3 to the new state. Do not call block 2 complete.
- File upstream findings only if a transcript review surfaces a verified service gap. The routing
  defect itself is own-repo and files nothing in `improvements/`. State "nothing new surfaced" if
  true.
- Run the baseline gates before the closing commit: `npm run typecheck`, `npm test`,
  `npm run build`, `npm run secrets:scan -- --tree`, and `npm run eval:routing -- --gate`.
- Confirm every review finding is reconciled or recorded as a non-blocking residual.

## 8. Out of scope

- Any same-100 or sample-30 collection.
- Any re-judge of the 2026-08-30 artifact under `v2.10`.
- The Raven capability-boundary diagnostic.
- The repository-tooling recovery lane. It stays monitor-only until the free Horizon probe returns
  `28`.
- Deployment, pushing, or pull requests from this round.
