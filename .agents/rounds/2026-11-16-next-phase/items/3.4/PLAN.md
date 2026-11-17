# Item 3.4 plan: the `execute` boundary read (M2), free

Lead: Claude Opus 5.5, agentpc `t1sp`. Worktree `/home/tyler/code/raven-wt/np-3.4`, branch
`np/3.4-execute-boundary-read`, base `origin/main` `41300519` (after #463). Binding inputs: round
[PLAN.md](../../PLAN.md) 3.4, [DECISIONS.md](../../DECISIONS.md), the orchestrator note
`/home/tyler/code/raven-wt/orch/3.4-NOTE.md`, and `.agents/TODO.md` "M2: execute boundary of 4,000
tokens against 6,000" ("Next, free"). Plan review: [REVIEW.md](REVIEW.md) (Claude Fable 5.2, high),
18 findings, all adopted; the reconciliation is at the end.

## Decision

Whether the `execute` model boundary drops from 6,000 tokens to 4,000 (16,000 characters), or stays
at 6,000 with M2 closed. Also recorded: the standing recount of `data.sections` misreads, `.data`
omissions and failed calls with an omitted reason. USD 0: no model call, no network, no local
server.

4,500 is not a candidate (review 7 and 9): at an 18,000-character cut, 79 to 100 of the 119 stored
results over the cut still exceed Grok's 20,000-byte clip once the host blocks and multi-byte
characters count, and it saves about 265 tokens per question. At 16,000 none exceeds it. The read
still reports the 18,000 figures.

## Facts re-checked on `41300519`

- The boundary is `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` = `"6000"` in `wrangler.jsonc` `vars`
  (comment "about 6k tokens" above it); the code default is `DEFAULT_MAX_TOKENS = 6000`
  (`src/policy/truncate.ts`), four characters per token, cut at a fixed character offset of the
  serialized result. The same budget caps console logs and error text (`src/mcp/tools.ts:432-435`).
- Model-facing text that states the cap: the `execute` description (`src/mcp/tools.ts:155`, "capped
  near 6k tokens"; also the Playground tool's description, `src/demo/tools.ts:442`), asserted in
  `test/mcp-instructions.test.ts:210` and `test/smoke/demo-tools.test.ts:17`; and the skill-read
  `data.notice` (`src/skills/store.ts:76`, "~${DEFAULT_MAX_TOKENS}-token model boundary", threshold
  `NOTICE_THRESHOLD_TOKENS = 5000` derived from 6,000). The error and log footers print the
  configured limit already. `ARCHITECTURE.md:309` says "Default 6,000 tokens".
- Stored results: `/home/tyler/code/raven-wt/gca-eval/eval/qa/results/`, 15 run files (and 9
  `.plan.json` files), all `claude-sonnet-5-5` on `search-execute`, 2026-11-14 to 2026-11-15. Each
  holds tuning rows under split v6 (`~/backups/gca-2026-11-14-split-v6.json`, 87 tuning ids). Tuning
  rows per run, in file-name order: 23, 87, 50, 50, 5, 5, 5, 50, 58, 58, 10, 10, 58, 17, 17. The
  baseline is `2026-11-14T20-13-51` (all 87, before both tuning loops); the shipped surface is loop
  2's P2 run `2026-11-15T07-33-40` (58); `2026-11-15T08-55-41` and `09-08-35` carry the unshipped
  identifier pointer. The main checkout has no `eval/qa/results`.
- `transcript[]` stores the full text of `execute` results only (`result`, length `resultChars`).
  `search` and `ToolSearch` entries keep `resultProjection` (hit ids, ranks, scores, a `nextSteps`
  excerpt), not the text (`eval/qa/run-qa.mjs:863-875`).
- An `execute` result is the value text, then host blocks, each opened by a newline and a header:
  `--- SOURCE BASIS ---` (at exactly offset 24,000 when truncated; its `shape:` line gives the
  original size) or `--- SOURCE METADATA ---` (untruncated, compact), or neither (a failed run,
  `Execution failed: …`, or a run with no call or only soft-empty calls, `run.ts:557`); then
  optional `--- EVIDENCE RECOVERY ---`, `--- SERVICE ERRORS ---`, `--- INCONCLUSIVE SERVICE
  OUTCOMES ---`, `--- CANDIDATE EVIDENCE ---`, `--- PRIOR-ART CANDIDATES ---`, `--- EVIDENCE
  CHECKPOINT ---`, `--- console (`; error and log text can end in `--- TRUNCATED ---`.
- Sizes (review, tuning rows, all runs): 503 (run, row) units on 87 rows; 939 `execute` results, 7
  failed (none over 683 characters), none with a console block; 66 truncated at 24,000; value over
  16,000 in 146 results, 141 units, 44 rows; over 18,000 in 119, 116, 38. A 16,000 cut removes 9.9%
  of value characters (about 396 tokens per unit).

## Steps

Work files go in the worktree's `tmp/` (git-ignored) unless named under this folder.

1. **Selector** (`items/3.4/select-tuning.mjs`, committed). Arguments: the results directory, the
   split path, an output directory. It reads the split's `sets.tuning` only, then each run file's
   `rows`, selecting by `id` alone with `selectById` from `eval/qa/tuning-rows.mjs` before any other
   row field is read. The expected count per run is a constant table in the script (the counts
   above), not the filter's own output. It writes `{ run, model, startedAt, rows }` per run, tuning
   rows only, no other `meta`. It prints each run file's name and SHA-256 (recorded in RESULT.md).
   Nothing prints a non-tuning id or counts by set name. `gca-eval` is read, never written; no git
   command runs there. Every later step reads only the selector's output.
2. **Read script** (`items/3.4/read-boundary.mjs`, committed). Arguments: the selector's output
   directory. Value region: the text before the first host header, matched with its leading
   newline. Original length: the `shape:` chars when truncated, else the value region's length.
   Report per run and in total: `execute` results, truncated at 24,000, original value over
   16,000, 18,000 and 24,000 (results, units, rows); value characters removed at each cut (share,
   tokens per unit).
3. **Matching rules.** Cut by raw character offset of the stored text first, then decode JSON
   string escapes in each region. An occurrence counts as kept only if it ends at or before C;
   one that straddles C is a tail occurrence. Match case-insensitively. Numbers match at digit
   boundaries; commas are removed only inside digit groups (`\d{1,3}(,\d{3})+`); dotted versions
   and decimals stay whole. Dates are normalized (month-name forms such as "November 14, 2026" and
   "Nov 14, 2026" to ISO).
4. **Kept corpus at cut C**, per unit: every `execute` result with its value region cut at C and
   its stored host blocks kept; every `search` projection's hit ids; the static surface text (the
   server instructions and both tool descriptions on `41300519`); the question.
5. **Candidates, three sources.**
   - Answer side: from the stored `answer`, URLs (trailing punctuation stripped), numbers of three
     or more digits (bare years 1990 to 2039 left out), dates, dotted versions, backticked spans of
     four or more characters, bold spans and link texts of three or more characters, strkeys and
     hex strings of eight or more characters.
   - Tail side: for each `execute` result whose value exceeds C, the distinctive tokens of
     `[C, min(length, 24000))` (containing a digit, capitalized, or eight or more characters, plus
     capitalized multi-word runs) that occur nowhere in the kept corpus, looked up in the answer.
   - Chained: string literals of each later `execute` script k in the unit. A literal that occurs
     only in the tail of an earlier result j (and not in the kept corpus as it stood before script
     k, nor in the question) is a candidate of class `chained`.
   A candidate is **past the cut** when it occurs in some value tail and nowhere in the kept corpus.
6. **Confirmation.** The executor reads every past-the-cut candidate in context (the answer
   sentence or script line, and the result span) and classes it:
   - `cited`: the answer states it as a fact taken from that span;
   - `chained`: a later script used it as an input, and the answer depends on that script;
   - `search-card`: an operation id, input or output field name, or card prose the model could have
     read on a `search` card (not stored, so not checkable);
   - `incidental`: formatting, a token that stands for something else, a coincidence.
   Also flagged in the table: a URL that is among the first five `https` URLs of the full value
   (the truncated block's `canonicalUrls` would have shown it), and a candidate whose only kept
   occurrence is in the source block of a result that changes from untruncated to truncated at C.
   Each row of the table in `items/3.4/RESULT.md`: run, row id, cut, candidate, source, class, flag,
   one-line reason. Row ids are tuning ids only.
7. **Control** (fixed now). The executor reads by hand the tail and the full answer of 12 exposed
   units at 16,000: the first 12 by row id from `2026-11-15T07-33-40`. If that reading finds a
   `cited` or `chained` fact the script missed, the script's zero is not accepted, and R(16,000)
   comes from a direct read of every exposed unit of that run.
8. **Grok clip** (informational, for item 4.1). The kept corpus is the first 20,000 UTF-8 bytes of
   each stored `execute` result, converted to a character offset; the lost region is everything
   after, host blocks included. Same candidate and class rules. Also the table: per cut (16,000,
   18,000), results over the cut, how many still exceed 20,000 bytes with the stored host blocks
   and with a manifest at its 1,600-character bound, and the largest size. `search` cannot be
   simulated; report the largest stored `resultChars` of a `search` entry (18,755).
9. **Stop rule** (fixed here, before any count). R(C) is the number of distinct rows with at least
   one `cited` or `chained` candidate past cut C in any run; units are reported beside it, and R is
   also given without the two identifier-pointer runs. The floor is 30 exposed rows at 16,000 (44
   now); below it the read reports "sample too small" and stops.
   - R(16,000) = 0, and the control passes: the boundary goes to 4,000 (step 11).
   - R(16,000) ≥ 3: keep 6,000 and close M2 ("many").
   - R(16,000) is 1 or 2: keep 6,000; the report asks the owner whether M2 closes or waits for a
     paid comparison (which needs a new authorization).
   R(18,000) and the Grok table are reported, not decided on. The read does not credit a narrower
   re-run at the lower cap, and does not see paraphrased facts; it is not a bound in either
   direction. Logs and errors share the budget; the sample has no console block and no long
   error, so the read says nothing about them.
10. **Recount**, one table row per run: the baseline (`2026-11-14T20-13-51`, 87 rows) and the
    shipped surface (`2026-11-15T07-33-40`, 58 rows), with each run's surface stamp. Run
    `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs` (repository root as working
    directory) on the selector's output. The executor reads every `execute` script and counts each
    script at most once per class, quoting the expression:
    - `data.sections` misreads: the 2026-10-12 ledger's definition and exclusions word for word
      (`.agents/rounds/2026-10-12-call-pattern-triage.md:105-108`). Denominator:
      `sectionReadScripts` from `count-patterns.mjs`.
    - `.data` omissions: a field read at the envelope's top level other than `ok`, `data`, `error`,
      `asOf`, `asOfBasis`, `caveat`. A fallback such as `r.data?.hits ?? r.hits` is listed apart,
      not counted. Denominator: scripts with at least one service call.
    - Failed calls with an omitted reason: a call that resolved `ok: false` with `error.kind`
      `"error"` (soft-empty listed apart, not counted), where neither `error.kind` nor
      `error.message` reaches the returned value or a console line. Failed calls are identified
      from the `calls:` line, the error blocks, or the returned value (the `calls:` line shows at
      most 14 calls and is absent on a soft-empty-only run). Denominator: scripts with at least one
      failed call.
11. **Only if step 9 sets 4,000.** One number everywhere (forward-only; a default and a production
    value that differ would let `npm test` and `npm run test:smoke` test different caps, and an
    invalid variable would silently raise production):
    - `DEFAULT_MAX_TOKENS = 4000` and the `truncate.ts` header comment; `wrangler.jsonc`
      `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` `"4000"` and its comment; the `execute` description
      phrase "capped near 4k tokens" (one constant, so the Playground follows); the skill-read
      notice threshold scaled to the new cap with its comment (`src/skills/store.ts:62-70`, `:349`);
      `ARCHITECTURE.md:309`;
    - tests: `test/policy.test.ts` (pins 6,000 and 24,000), `test/mcp-instructions.test.ts`,
      `test/skills.test.ts:284-357`, `test/executor-providers.test.ts` and
      `test/artifacts-store.test.ts` `capTokens` where they mean the boundary, and any smoke test
      that pins it;
    - comments: `src/demo/tools.ts:541`, `eval/qa/run-qa.mjs:867`, and the log-budget comment at
      `truncate.ts:243-249`, which says to tighten logs "only when production data supports the
      change": the change says no production `logsTruncated` or `errorTruncated` rate is in the
      repository, and names the check after deploy. `src/executor/spec-sandbox.ts` is a separate
      cap and stays.
    - Then the Codex frontier review (`gpt-6-astra`, high): the diff, the security invariant (fixed
      cut offset, redaction before truncation, `run.ts:549-550`), and the description length
      against Grok's 2,033-character cut. The executor reconciles its findings.
12. **Records.** `items/3.4/RESULT.md`: run hashes, the size and saving tables, the candidate table,
    the control, R and units per cut, the Grok table, the recount, the decision. `.agents/TODO.md`
    M2: deleted when closed, else reduced to what stays open; the recount recorded where the TODO
    keeps it. Round ledger row (the lead).

## Gates

- Always: `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`, each
  run bare. `read-boundary.mjs` re-run on the selector's output reproduces RESULT.md's counts.
- With step 11: `npm run test:smoke`, and the Codex review.

## Production check after a step 11 deploy (for the orchestrator)

Landing 200 and `/mcp` 401 `Bearer`; one `execute` whose value exceeds 16,000 characters returns a
`SOURCE BASIS` block at offset 16,000 with `limit` 4000 in its shape; after about a week, the
`execute` event's `resultTruncated` share, `execute` calls per request, `artifactReadCount`,
`logsTruncated` and `errorTruncated`, against the week before.

## Risks

- Held-out exposure: the selector is the only reader of the run files and selects by id first.
- Matcher misses (paraphrase, reworded names). The tail-side pass and the control reduce them;
  the report says what remains.
- The host blocks at 16,000 differ from the stored ones (review 6); step 6 flags the cases.
- Rows repeat across runs; R counts distinct rows.

## Needs

Nothing from the orchestrator before execution. A 4,000 result needs a deploy and the check above.

## Reconciliation of REVIEW.md

| # | Disposition |
|---|---|
| 1 | Adopted: kept corpus is `execute` results, search hit ids, static surface text, question; class `search-card` (steps 4, 6). |
| 2 | Adopted: the notice is a model-facing statement (facts; step 11). |
| 3 | Adopted: layout facts complete. |
| 4 | Adopted: `chained` candidates from later scripts count toward R; the "upper bound" sentence is replaced (steps 5, 9). |
| 5 | Adopted: raw-offset cut, straddle rule, digit-boundary numbers, digit-group commas (step 3). |
| 6 | Adopted: URL and source-block flags; logs and errors stated as unmeasured (steps 6, 9). |
| 7 | Adopted: Grok kept corpus is the byte head of the whole text; the fit table; largest `search` size (step 8). |
| 8 | Adopted: tail-side pass, date and version normalization, the 12-unit control (steps 3, 5, 7). |
| 9 | Adopted: 4,500 dropped as a candidate; 16,000 decides (Decision, step 9). |
| 10 | Adopted: R over distinct rows, units beside it, floor of 30 exposed rows (step 9). |
| 11 | Adopted: saving reported; re-run and artifact costs go to the production check. |
| 12 | Adopted: one number in default, variable, description, notice, docs and tests (step 11). This sets the boundary by the variable and the default together, a deviation from "by the environment variable" alone, for the reasons in step 11. |
| 13 | Adopted: the log comment and the post-deploy check (step 11, production check). |
| 14 | Adopted: in the Codex review scope. |
| 15 | Adopted: recount on the baseline and the shipped run (step 10). |
| 16 | Adopted: the three definitions and denominators (step 10). |
| 17 | Adopted: selector committed with constant expected counts and run hashes (step 1). |
| 18 | Adopted: R also without the two pointer runs (step 9). |
