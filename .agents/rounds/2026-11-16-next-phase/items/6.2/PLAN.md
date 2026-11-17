# Item 6.2 plan: Docs titles hold, evaluate and decide

Lead: Claude Opus 5.5, agentpc `t1v9`, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-6.2`,
branch `np/6.2-docs-titles` from `origin/main` `5279f46a` (6.1 merged as #472). Binding notes:
`/home/tyler/code/raven-wt/orch/6-COMMON.md` and `6.2-NOTE.md`. Owner answer (DECISIONS.md,
"Follow-up answers (2026-11-17, assumptions review)"): "eval with Fable, Opus and Sonnet and decide
and proceed". Reviewed by Claude Fable ([REVIEW.md](REVIEW.md)); every finding is reconciled in the
last section.

**Search rule (orchestrator, 2026-11-17, binds the lead and every child):** every repo-wide search
is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare `grep -r` over the repo. Never
print the stdout of `node eval/run-routing.mjs` (it prints the holdout table): redirect it to a
file under `tmp/6.2/` and read totals from the result JSON with `node tmp/6.2-compare.mjs <base>
<variant>`, which prints holdout counts only. Never open a QA case or QA results; never run the QA
lint.

## Decision this changes

Whether `inventory/stellar-docs-titles.json` takes the live Mintlify titles (982 pages) in place of
the held Algolia-era file (666 pages), with a one-time routing re-baseline. Today the hold rests on
a rank proxy only. This item adds an answer-level A/B on three Claude clients, then either absorbs
(the hold ends and the daily drift line for this file stops) or keeps the hold and stops re-running
the A/B on every drift.

## Facts re-checked on `5279f46a` (lead, free and local; reproduced by the Fable reviewer)

- `node scripts/refresh-inventory.mjs --service stellar-docs` (Mintlify key exported from
  `.dev.vars`, never printed) writes 982 titles from 4 `llms.txt` files. `inventory/stellar-docs.json`
  is unchanged apart from `fetchedAt`, which the script keeps. The new titles file drops the dead
  `source.authEnv` names (`auth: "none (keyless)"`). 342 paths are new, 23 are gone.
- Only `scripts/build-catalog.mjs` reads the titles file for the catalog. `build-catalog.mjs --out`
  changes no other tracked file, and no spec reads the titles, so "specs" in the note needs no
  regeneration beyond the catalog. The manifest's `generatedAt` is the newest input stamp, which is
  the titles `fetchedAt` (`scripts/build-catalog.mjs:1384-1390`).
- Routing, fresh against held (`tmp/6.2-fresh-manifest.json` against `catalog/manifest.json`): the
  same three losses as item 0.2, no gains.
  - Legacy: top1 220 → 219, top5 327 → 326; top3 293 and card@5 113 unchanged. Losses:
    `q-infra-hubble-vs-rpc-layer` (top1 and any1: `stellarDocs.search_rpc_horizon_data_docs` 433 at
    rank 1 → 180 at rank 5) and `q-edge-exhaustive-defi-deep-report` (top5: `scout.searchResearch`
    pushed out by `stellarDocs.search_anchor_sep_docs`). Neither is on `eval/routing-qa-overlap.json`.
    18 top-five list changes, 41 score-only moves, no confirmation-only grade change.
  - Extended, skills, protocol history: no grade change (24, 2 and 0 list changes).
  - Holdout lane, counts only: top3 27 → 26; top1 12, top5 30, card@5 30, passed 24, captures 11
    unchanged. The floor `minTop3` is already 26.
  - The legacy band is ±3 (`eval/run-routing.mjs:368`), so FRESH passes the gate once the manifest
    hash moves; only accepted totals change.
- Fresh vocabulary the held file lacks: "Varial" (Freighter pages renamed, paths unchanged),
  `fee-sponsorship`, `x402/seller-and-agent-guide`, the Hubble `data-catalog` and data-dictionary
  pages.
- `dev:eval` refuses a dirty tree (`scripts/run-eval-server.mjs:18-21`) and stamps
  `serverInfo.sourceRevision` from `git rev-parse HEAD` (`src/server.ts:36-44`).

## The third lost row

It is a routing holdout row, known only as a count. Under `eval/README.md` ("Do not tune the
implementation against individual failed holdout cases") and the counts-only rule, it is not
identified, opened or used. Its slot goes to a fourth neutral control. The rule's "lost rows" are
the two legacy rows.

## Steps

Commits use the normal hooks, never `--no-verify`, and end with
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Every child the executor starts gets
the search rule in its brief.

### 1. Split v11 (orchestrator approval of option (a) in [QUESTION.md](QUESTION.md)), own commit

Mirror item 6.1 step 1, one version on.

- Add `items/6.2/amend-split-v11.mjs`, adapted from `items/6.1/amend-split-v10.mjs`. It verifies the
  v10 SHA-256 `fea3d467e0df7b21a3fab7b5e4013d077da789de5aea16188d5bf975063f35e9` and counts
  92 / 110 / 45, reads `tmp/6.2/EXPOSURE.md` (untracked), and requires exactly one id. Three
  outcomes, each printing only counts, the SHA-256 and one of these words:
  - "no move": the id is already in v10 tuning. Nothing is written.
  - "not in split": the id is in none of the three sets. Nothing is written.
  - "moved": it moves the id with `moveToTuning` and a dated note and writes
    `~/backups/gca-2026-11-14-split-v11.json` with mode 600, never overwriting.
  Run it with `--dry-run`, then for real. On "no move" or "not in split", the rest of this step is
  skipped, the script is still committed, and EXEC.md records the outcome.
- On "moved": `eval/qa/tuning-rows.mjs` `TUNING_ROW_COUNT` 92 → 93 and every test or document that
  asserts 92 (found with `git grep` under the search rule, as 6.1 did); point
  `items/1.4/dated/{2.1,2.2a,2.2b,2.2c}-LEAD.md` and `items/1.4/dated/PRESTAGE.md` at v11 and its
  SHA-256; update the `.agents/TODO.md` held-out status block (path, SHA-256, counts, the `--split`
  line, the "outside tuning with a `reverifyBy`" figure from counts-only script output).
- The timers need no edit (`launch-dated-lead.sh` reads briefs from `origin/main`); EXEC.md says so.

### 2. Pre-registration commit (before any answer)

Commit, in one commit: PLAN.md, QUESTION.md, REVIEW.md, `briefs/`, `items/6.2/questions.json`,
`items/6.2/ab-run.mjs` and `items/6.2/blind.mjs`, each written and unit-checked offline first
(`node --check`, and a dry run of `blind.mjs` on synthetic answers). EXEC.md records this commit's
SHA as proof that the questions, rubric, scoring and rule predate every answer. Nothing else is
written to a tracked path until both arms have ended; scratch goes to ignored `tmp/6.2/`.

- `questions.json`: the table below, in this order: L1, L2, N1, N2, N3, N4, F1, F2, F3, F4 (rule
  questions first). Each entry has an opaque key, the question text and the reference URLs.
- `ab-run.mjs`: imports `runAgent` and `isRetryableAgentFailure` from `eval/qa/run-qa.mjs` (guarded
  by `isMain`; importing runs nothing). Per answer it calls `runAgent` with
  `surface: "search-execute"`, `searchTool: "search"`, allowed tools
  `mcp__raven__search,mcp__raven__execute`, an MCP config naming only `raven` at
  `http://localhost:<port>/mcp`, an agent cwd from `mkdtempSync(join(os.tmpdir(), ...))`, and
  `maxBudgetUsd: 4`. It deletes `QA_AGENT_PROMPT_APPEND` from its environment first. So the prompt,
  isolation flags, 24-turn cap and transcript parser are the QA runner's. Flags: `--arm`, `--model`,
  `--port`, `--out`, `--from <key>` (resume). One JSON line per run: key, requested model id,
  `claude --version`, arm, answer, failure class, turns, `costUsd`, `usage`, timestamps, the tool
  calls (tool name, the `search` query, `stellarDocs.*`/`scout.*`/`lumenloop.*` ids named in
  `execute` code), and the deduplicated URLs found in its tool results. The resolved model is not
  recorded (`runAgent` does not return `modelUsage`); EXEC.md says so.
  - Retry: one retry per run, only when `isRetryableAgentFailure` is true.
  - A run is **answered** when `failure` is null and the answer is non-empty.
  - Two consecutive unanswered runs of a class other than `agent` stop that client's harness. The
    executor fixes the cause and resumes that client once with `--from`, on the same arm and server
    revision; a resumed question is a first sample.
  - Cost: it sums `costUsd` per client per arm, counting a run with null `costUsd` at USD 4, and
    stops the client when the next run could pass USD 25 for that arm. If any client's HOLD arm
    stops on this cap, the executor stops and reports to the lead before FRESH.
- `blind.mjs`: builds judge packets and later scores (step 5).

### 3. HOLD arm (tree = the pre-registration commit)

- Start one `npm run dev:eval -- --port <free port>` as an `hc` child of the executor. Readiness:
  the `initialize` POST from the `run-evals` skill returns 200.
- Arm identity, at arm start and arm end: `serverInfo.sourceRevision` from `initialize` equals the
  arm's commit; record `git show <rev>:catalog/manifest.json | sha256sum`; `git status --porcelain`
  is empty. Second check: one MCP `search` call for "Varial wallet"; record the top five (the fresh
  manifest carries "Varial", the held one never does).
- Docs probe, at arm start and end: one `execute` of a `stellarDocs.search_docs` call through the
  server; record ok or the error kind.
- Run three harness processes in parallel as `hc` children, one per client: `claude-fable-5-2`,
  `claude-opus-5-5`, `claude-sonnet-5-5` (default effort). Output `tmp/6.2/answers-hold-<model>.jsonl`.
- Stop the dev server after the end checks.

### 4. Absorb commit (A) and FRESH arm

- `node scripts/refresh-inventory.mjs --service stellar-docs` (keys exported, never printed), then
  `node scripts/build-catalog.mjs`. If `inventory/stellar-docs.json` changes beyond `fetchedAt`,
  stop and report. Compare with the lead's candidate: titles by (path, title) pairs against
  `tmp/6.2-titles-fresh.json`, and the manifest against `tmp/6.2-fresh-manifest.json` with
  `generatedAt` removed. Only if either differs, re-run the routing comparison on the new manifest
  and record it. Commit A holds the titles file and `catalog/manifest.json` only.
- Restart `dev:eval` on commit A, run the same identity and Docs probes (start and end), collect
  the FRESH arm the same way to `tmp/6.2/answers-fresh-<model>.jsonl`, stop the server.
- Record both arms' time windows. If they straddle 00:00 UTC, record that (the prompt asks for
  as-of dates).

### 5. Blind grading

- `blind.mjs --pack`: for each (client, question) it assigns HOLD and FRESH to X and Y by a random
  bit from `crypto.randomInt`, stored only in `tmp/6.2/blind-key.json`, and gives each pair an
  opaque random id. Pairs are shuffled. Each judge gets a fresh directory outside the worktree
  (`mktemp -d` under `/tmp`) holding only `packet.json` and the rubric. A packet entry has the pair
  id, the question, the reference URLs, and for X and Y: the answer text, the tool-call list, and
  the deduplicated URLs from its tool results. No arm, question class, file name, timestamp, cost,
  token count or model name enters a packet.
- Judges (so no judge grades a comparison it answered in): Claude Opus 5.5 grades the Sonnet and
  Fable comparisons (20 pairs, one session); Claude Fable grades the Opus comparison (10 pairs).
  Both run at high effort as `hc` children of the executor, `--cwd` their own directory, and may
  fetch any URL (WebFetch or `curl`). They write `verdicts.json` in that directory. Record model and
  effort.
- Rubric, per answer:
  - `correctness`: correct (every material claim agrees with the reference pages and the question
    is answered), partial (right but missing a material part, or one minor error), or wrong (a
    material claim contradicts the reference pages, or the question is not answered).
  - `fabrication`: true when the answer states a specific identifier, number, API name, table name
    or URL that neither the reference pages, nor the pages it cites, nor its listed result URLs
    support. The judge fetches what it needs before marking it.
  - A one-line reason per pair.
  - L2 (no Docs reference): wrong when the answer claims to have produced an exhaustive or
    multi-hour report, names a protocol the judge cannot confirm on the web as a Stellar protocol,
    or gives a figure with no cited source; otherwise correct or partial by coverage.
- Grounding is not judged; the mechanical reach metric covers it.

### 6. Scoring, results and the rule (the executor stops here)

`blind.mjs --score` un-blinds and computes:

- An answer is **bad** when its `correctness` is wrong or `fabrication` is true. FRESH **loses** a
  pair when its answer is bad and HOLD's is not; **wins** in the reverse case; otherwise a tie.
  Correct against partial is reported, not counted.
- A pair is **missing** when either run is unanswered; it counts as a tie and is reported with its
  failure class.
- **Attributable** FRESH loss (mechanical). For a question with reference pages: let `R` be the
  `stellarDocs.*` ids named in HOLD `execute` calls whose tool results contain a reference path. The
  loss is attributable when the FRESH run names no id in `R` and no FRESH tool result contains a
  reference path. For L2: HOLD called a `scout.*` or `lumenloop.*` operation and FRESH called none.
- Reach metric (reported only): per run, whether any `stellarDocs.*` operation was called and
  whether a reference path appears in a tool result.

The executor writes `items/6.2/RESULTS.md`: per client and arm, answered runs, failures by class,
calls, turns, tokens and cost; the per-pair table (question key, client, outcome, both grades, the
judge's reason, attributable or not); the reach metric; probes and identity checks; the rule
outcome. Then it stops and reports to the lead.

## Decision rule (pre-registered; adjusted on the Fable review before any run, never after)

Rule pairs: L1, L2 and N1 to N4 across three clients (18 pairs). **Absorb FRESH unless:**

1. over the 18 rule pairs, FRESH losses − FRESH wins ≥ 2; or
2. any one client shows a clear regression that HOLD avoids:
   - (a) for that client, over all 10 pairs, FRESH losses − FRESH wins ≥ 2; or
   - (b) any attributable FRESH loss, on any question.

**Inconclusive** (the rule is not applied) when more than 3 of the 30 pairs are missing, or more
than 2 of the 18 rule pairs, or FRESH has at least 3 more unanswered runs than HOLD. Inconclusive
goes to step 7b in its inconclusive form and to the orchestrator.

This is a margin of two where the note says "more losses than wins": with one sample per cell, one
unattributed flip is noise (Fable finding 2), while one attributed flip or a net of two holds.

Second opinions (the lead runs them after RESULTS.md): Claude Opus 5.5 and Claude Fable, separate
children at high effort, each read RESULTS.md and the un-blinded verdicts and write
`SECOND-OPUS.md` and `SECOND-FABLE.md`: absorb or hold, with a reason. If either disagrees with the
rule's outcome, the lead stops and reports to the orchestrator.

## Steps after the decision (the lead resumes the executor)

### 7a. Absorb

- Commit B, gates: `eval/gates.json` re-baselined under the `run-evals` rule. Legacy `top1` 220 →
  219 and `top5` 327 → 326, in `acceptedTotals.legacy` and in the `legacy` band block; holdout
  `acceptedTotals.holdout.top3` 27 → 26 (floor `minTop3` stays 26; every other holdout number
  unchanged); the manifest SHA-256 in `evidence.inputs`; `baselinedAt` and `localTrace` from the
  `--gate` run. A new note at the head of `evidence.notes`: the owner's answer and this item; that the
  absorb departs from the zero-regression standard on that answer; the two legacy losses by id; the
  holdout lane by count; extended, skills and protocol history unchanged in grade with their
  list-change counts; the A/B outcome; that holdout top3 now equals its floor (26), so the next
  change that costs one holdout top-3 fails the gate; an "Independent review:" line (Codex frontier,
  below); then "Prior note:" and the current note text. `npm run eval:routing -- --gate` exits 0
  (stdout to a file).
- Commit C, text that described the hold:
  - `scripts/summarize-live-drift.mjs:336`: delete the "held at its Algolia-era bytes" line; the
    routing-relevance line stays.
  - `inventory/README.md:49`: delete the hold sentence.
  - `.agents/TODO.md`: replace the titles hold bullet (about lines 507-514, which hold the file's
    only `#223` reference) with one sentence in the routing repair item: issue #223 stays open for
    the repair. Add to that item that holdout top3 now sits on its floor.
  - Any test that asserts the deleted summary sentence (`git grep -n "Algolia-era" -- test scripts`).
- The PR says commits A and B land as one commit by squash merge, as `gates.json` asks. It uses
  `Refs #223`; #223 stays open for the routing repair.

### 7b. Hold or inconclusive

- Revert commit A on the branch (`git revert`), so the evidence stays in history.
- Hold: the `.agents/TODO.md` titles bullet records the A/B result with a link to RESULTS.md and
  says the A/B is not re-run on routine drift; it re-runs only when the scorer or the Docs catalog
  scoping changes, or when the live title count moves by more than 10% from 982.
  `summarize-live-drift.mjs:336` and `inventory/README.md:49` point at that TODO bullet instead of
  "until the general routing repair lands".
- Inconclusive: the TODO bullet records "inconclusive" with the reason and leaves the re-run to the
  orchestrator; it does not say the A/B decided the hold.

### 8. Records, own commit

`items/6.2/EXEC.md` (what was done, a short summary of each gate's output, deviations),
`RESULTS.md`, and the un-blinded verdict files (answers and transcripts stay in ignored `tmp/`).
The lead adds the ledger row.

## Questions (pre-registered; reference pages are live Docs paths under `https://developers.stellar.org`)

| Key | Class | Question | Reference pages |
|---|---|---|---|
| L1 | lost row `q-infra-hubble-vs-rpc-layer` | Should I read account balances and history from Stellar RPC or from Hubble/BigQuery? When does each make sense? | `/docs/data`, `/docs/data/apis/rpc`, `/docs/data/analytics/hubble`, `/docs/data/analytics/hubble/analyst-guide/queries-for-horizon-like-data` |
| L2 | lost row `q-edge-exhaustive-defi-deep-report` | Produce an exhaustive, multi-hour deep-research report covering the entire Stellar DeFi landscape end to end. | None (L2 rubric above) |
| N1 | control `q-asset-claimable-balance` | What is a claimable balance on Stellar and when would you use one instead of a direct payment? | `/docs/build/guides/transactions/claimable-balances` |
| N2 | control `q-protocol-fee-model-base-fee` | How does the Stellar fee model work for classic transactions — what is the base fee and how are fees computed? | `/docs/learn/fundamentals/fees-resource-limits-metering`, `/docs/build/guides/transactions/fee-bump-transactions` |
| N3 | control `q-infra-simulate-transaction-howto` | How do I simulate a Soroban contract invocation to get the resource footprint and fees before submitting? | `/docs/data/apis/rpc/api-reference/methods/simulateTransaction`, `/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation` |
| N4 | control `q-sor-msg-sender-equivalent` | The routing row's text, copied exactly from `eval/routing-cases.json` by id | `/docs/learn/fundamentals/contract-development/authorization`, `/docs/build/smart-contracts/example-contracts/auth` |
| F1 | fresh vocabulary | What is the Varial wallet, and how do I prompt it to sign a transaction from a JavaScript dapp? | `/docs/build/guides/freighter`, `/docs/build/guides/freighter/prompt-to-sign-tx` |
| F2 | fresh vocabulary | How can my app pay transaction fees on behalf of its users on Stellar, and how do I choose between the approaches? | `/docs/build/guides/transactions/fee-sponsorship`, `/docs/build/guides/transactions/fee-bump-transactions` |
| F3 | fresh vocabulary | I want to charge AI agents per request for my API using x402 on Stellar. How do I set up the seller side, and how does an agent pay? | `/docs/build/agentic-payments/x402/seller-and-agent-guide`, `/docs/build/agentic-payments/x402/quickstart-guide` |
| F4 | fresh vocabulary | Which Hubble tables hold account signer data, and how is the Hubble data catalog organized? | `/docs/data/analytics/hubble/data-catalog`, `/docs/data/analytics/hubble/data-catalog/data-dictionary`, `/docs/data/analytics/hubble/data-catalog/data-dictionary/bronze/account-signers`, `/docs/data/analytics/hubble/data-catalog/data-dictionary/silver/account-signers-current` |

L1, L2 and N1 to N4 use the routing row's text exactly as `eval/routing-cases.json` has it (the
executor copies it by id; the table shows L1 to N3 as the lead read them). F1 to F4 are written for
this item. Selection: L1 and L2 are the two identifiable lost rows; F1 to F4 target pages whose
vocabulary only the fresh file has; N1 to N4 are Docs-labelled rows, not on the overlap list, whose
first-search top five differs between arms without a grade change, across four Docs scopes. All
reference paths returned 200 on 2026-11-17 (reviewer check); the executor re-checks each once before
step 3 and records the status codes.

## Caps, time and stop rule

- 60 answered runs at most (10 × 2 × 3), one retry per run for transport failures only, one resume
  per client; 30 pair gradings in two judge sessions; two second-opinion reads. No re-judge, no
  extra arm, no second sample.
- Per run `--max-budget-usd 4`; per client per arm USD 25 (null cost counted at USD 4); whole item
  at most USD 150 subscription-equivalent. The estimate (USD 40 to 90, 2 to 3 hours wall time with
  three clients in parallel) is a guess from Opus- and Fable-class answers taking several turns; no
  stored result for these clients and this prompt exists to base it on (QA results may not be opened).
- Subscription CLIs only, as `hc` children, against the single local `dev:eval`. No AI Gateway,
  Workers AI or provider API. Paid Lumenloop research is not exposed.
- Stop rule: collection ends when every run is answered or stopped under the rules above; the rule is
  computed once; a cap stop is reported and handled by the missing-pair and inconclusive clauses.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:routing -- --gate` (stdout to a
file), `npm run secrets:scan -- --tree`, each run bare. No `test:smoke` (no `src/executor` or
`src/demo` change). No QA lint (orchestrator rule); `npm test` covers the tuning count test.

## Required reviews after execution

- Codex frontier (`gpt-6-astra`, high): reads the diff, re-runs `run-routing.mjs` on the base and
  branch manifests (holdout counts only, stdout to a file), checks every number in the gates note and
  the split counts, and checks `ab-run.mjs` and `blind.mjs` for a blinding or scoring defect. It
  writes `tmp/6.2/CODEX-REVIEW.md`; the lead copies it into the item folder. Tier reason: routing
  re-baselines here have used a Codex frontier reviewer (0.2, 5.1); the author is Sonnet, and Opus
  and Fable are the lead, judges and second opinions.
- The executor reconciles every finding.

## Risks

- One sample per cell: the A/B detects only a large effect. The bad-answer outcome, the margin of
  two and the attribution clause keep a single noisy flip from deciding.
- The arms run in sequence, so live content can change between them; FRESH starts soon after HOLD,
  the Docs probe brackets each arm, and the inconclusive clause catches a lopsided failure count.
- Opus and Fable judges differ; the rule sums across judges without normalization.
- A judge could reach other files on the box; its directory holds only its packet, and the key lives
  in the worktree's ignored `tmp/` with no reference to it in the packet.
- A child could print holdout routing rows or QA text; the search rule and the stdout-to-file rule
  are in every brief.

## Needs from the orchestrator

- Copy split v11 to the Mac if step 1 moves the id.
- Deploy from the Mac if FRESH is absorbed: catalog keywords are model-facing search text (routing
  measured by the gate, answers by this A/B).

## Reconciliation of the Fable review

| # | Severity | Disposition |
|---|---|---|
| 1 | blocking | Adopted: step 2 pre-registration commit; nothing tracked is written until both arms end. |
| 2 | blocking | Adopted: bad-answer pair outcome, margin of two in rule 1 and 2(a), attributable loss in 2(b). |
| 3 | blocking | Adopted: answered/missing definitions, stop-and-resume, the three inconclusive thresholds, Docs probes, inconclusive form of 7b. |
| 4 | blocking | Adopted: result URLs in packets, fabrication against reference, cited and listed pages; judged grounding dropped; L2 rubric. |
| 5 | should-fix | Adopted: judge dirs outside the worktree, random bit in the key file, opaque shuffled pair ids, high effort recorded. |
| 6 | should-fix | Adopted: the mechanical attribution in step 6, including L2. |
| 7 | should-fix | Adopted: `sourceRevision` identity at arm start and end, clean-tree check, "Varial" probe, manifest compared without `generatedAt`, commit A limited to two files. |
| 8 | should-fix | Adopted: N2 reference replaced; F4 silver table added. |
| 9 | should-fix | Adopted: rule questions first; USD 25 per client per arm with null at USD 4; stop before FRESH on a HOLD cap; estimate stated as a guess. |
| 10 | should-fix | Adopted: TODO bullet replaced by one sentence, zero-regression departure, independent review line, floor warning in the note and the TODO, squash note in the PR. |
| 11 | should-fix | Adopted: requested model id and `claude --version` recorded; resolved model stated as not recorded. |
| 12 | should-fix | Adopted: "not in split" outcome. |
| 13 | nits | Adopted: routing rows copied exactly by id; `QA_AGENT_PROMPT_APPEND` deleted; `mkdtempSync` under `os.tmpdir()`; midnight straddle recorded; "one retry per run". |
