# Review of the item 3.4 plan (execute boundary read, M2)

Reviewer: Claude Fable 5.2 (tier: Claude Fable, plan review), agentpc, worktree
`/home/tyler/code/raven-wt/np-3.4` at `41300519`. Read-only except this file and scratch scripts in
`tmp/review/`.

## What I ran

Four scratch scripts in `tmp/review/` (`layout.mjs`, `fields.mjs`, `exposure.mjs`,
`grok-recall.mjs`, shared `lib.mjs`). Each reads `sets.tuning` of
`~/backups/gca-2026-11-14-split-v6.json`, filters every run file's rows by id, and reads other
fields of tuning rows only. Nothing was written in `gca-eval` and no git command ran there.

I computed sizes, layouts and exposure counts. I did **not** compute which candidates sit past a
cut, so findings 5 to 8 on the stop rule were written without knowing the read's outcome.

Numbers used below, all 15 runs, tuning rows only:

| Measure | Value |
|---|---|
| (run, row) units / distinct rows | 503 / 87 |
| `execute` results | 939 (7 failed, longest 683 characters; 0 with a console block) |
| Truncated at 24,000 (`SOURCE BASIS` at offset 24,000) | 66 |
| Value region over 16,000 | 146 results, 141 units, 44 rows |
| Value region over 18,000 | 119 results, 116 units, 38 rows |
| Value characters a cut removes | 9.9% at 16,000 (about 396 tokens per unit); 6.6% at 18,000 (about 265) |
| Units with more than one `execute` | 281 of 503 |

## Findings

### Facts (check 1)

**1. Blocking. `search` results are not stored, so the kept corpus in step 4 cannot include them.**
- Plan: "A row's `transcript[]` stores each tool call's full returned text in `result`" and step 4
  "the kept corpus is every `search` and `execute` result of the row".
- Evidence: `node tmp/review/fields.mjs`: 939 of 939 `execute` entries have a string `result` with
  length equal to `resultChars`; all 488 `search` entries and all 500 `ToolSearch` entries have no
  `result`. A `search` entry holds `resultProjection` only: hit ids, ranks, scores and a
  `nextSteps` excerpt (`eval/qa/search-projection.mjs:71-101`; `eval/qa/run-qa.mjs:863-875` says
  the result "is projected instead of stored").
- Effect: an operation id, a field name or a URL that the model read on a search card, and that
  also sits in a value tail, counts as past the cut although the model had it. The read
  over-counts loss for those, and step 5 cannot settle them from stored text.
- Fix: state that the kept corpus is the row's `execute` results, plus the hit ids of each
  `resultProjection`, plus the static surface text (server instructions and both tool
  descriptions). Add a third class to step 5, `search-card` (the candidate is an operation id, an
  input or output field name, or card prose), which does not count toward L.

**2. Should-fix. More than one model-facing string states the cap.**
- Plan: "One model-facing string states the cap: the `execute` description"; `src/skills/store.ts`
  is listed under comments.
- Evidence: `src/skills/store.ts:76` returns `data.notice` to the script: "will be truncated at
  the ~${DEFAULT_MAX_TOKENS}-token model boundary". It prints the code default, not the configured
  value. Its trigger, `NOTICE_THRESHOLD_TOKENS = 5000` (`store.ts:70`), is derived from 6,000
  (comment at `store.ts:63-69`). The error and log footers print the configured limit
  (`truncate.ts:85`, `truncate.ts:239`), so they follow the variable already.
- Fix: correct the fact, and add the notice to step 8 (finding 12).

**3. Nit. Two layout statements are incomplete.**
- 24 of 939 `execute` results have neither source block: the 7 failures (`Execution failed: …`,
  `src/mcp/tools.ts:470`) and 17 others; the runner prints no source block for an untruncated run
  with no call or only soft-empty calls (`run.ts:557`). The
  plan's "or `SOURCE METADATA` when not" reads as if one of the two is always present. The parse
  in step 2 handles it; the sentence should say so.
- The error and log channels end in `\n--- TRUNCATED ---` (`truncate.ts:85`), a header the plan's
  list omits. No stored tuning result has one.

Checked and correct: the variable and default (`wrangler.jsonc:47`, `truncate.ts:18-22`); the
description phrase (`src/mcp/tools.ts:155`) and its test (`test/mcp-instructions.test.ts:210`);
`ARCHITECTURE.md:309`; 15 run files, all `claude-sonnet-5-5` on `search-execute`, each with tuning
rows; the baseline's `caseCount` 247 and its 87 tuning rows; 171 baseline `execute` results, 19
truncated, 34 with text over 16,000 (29 by value region); `SOURCE BASIS` at offset 24,000 in all
66 truncated results; the header list and its order (`src/mcp/tools.ts:516`); no
`eval/qa/results` in the main checkout. There are 9 `.plan.json` files, not one per run.

### Read method (check 2)

**4. Blocking. A later script that depends on a tail is not counted.**
- 281 of 503 units ran more than one `execute`. When script 2 uses a slug, id or URL that the
  model could only have read in the tail of result 1, the answer's facts come from result 2 and
  the rule calls them kept. At the lower cap the model would not have had that input.
- This is the main path by which the read undercounts, and the plan's sentence "A cut at 16,000 or
  18,000 is an upper bound on loss" is wrong because of it (and because of the matcher misses the
  plan lists under Risks).
- Fix: extract candidates from the string literals of each later `execute` script as well as from
  the answer. A literal in script k that occurs only in the tail of an earlier result j, and not
  in the question or the kept corpus before k, is a past-the-cut candidate with class `chained`.
  It counts toward L like `cited`. Replace the "upper bound" sentence with: the read does not
  credit a narrower re-run and does not see paraphrased facts.

**5. Should-fix. Offsets, straddling and number matching are underspecified, and each error hides
loss.**
- Cut by raw offset first, then decode. The cut lands at a character offset of the serialized
  text (`truncate.ts:225`). Decoding escapes before slicing moves it.
- A candidate that starts before C and ends after it is lost at C. With two disjoint regions it is
  in neither, so it is never counted. Rule: an occurrence is kept only if it ends at or before C;
  otherwise it is a tail occurrence.
- Match numbers at a digit boundary. On the baseline, 7 of 145 matched numeric candidates match
  only inside a longer number (`node tmp/review/grok-recall.mjs`, `numSubstringOnly`). A false
  match in the kept corpus removes a real loss before step 5 can see it.
- Remove commas only inside digit groups (`\d{1,3}(,\d{3})+`). A blanket removal joins the
  elements of a numeric JSON array.
- Value-region parse: correct for every block the handler emits. All 146 values over 16,000 are
  JSON objects or arrays, so a header preceded by a real newline cannot occur inside a value;
  match the headers with their leading newline. No header repeats in any stored result.

**6. Should-fix. The kept host blocks differ from what the host would print at the lower cap.**
- A result between C and 24,000 was stored untruncated. At C it becomes truncated, and its block
  changes from `SOURCE METADATA` to `SOURCE BASIS` (`source-basis.ts:268-291`). 33 results over
  16,000 carry the compact footer, which has no `canonicalUrls` line; the truncated form lists up
  to 5 URLs collected from the whole value (`run.ts:628`). The read over-counts URL loss there.
- In the other direction, the truncated form adds a loss detail, an artifact line and longer
  guidance inside the same 1,600 characters (`source-basis.ts:194-230`), so calls or metadata
  values in the stored block can drop out.
- Fix, no simulation needed: step 5 checks each past-the-cut URL against the first 5 `https` URLs
  of the full value, and flags any candidate whose only kept occurrence is in a source block of a
  result that changes state. Both go in the table.
- Logs and errors share the budget (`src/mcp/tools.ts:432-435`). The sample has no console block
  and no error over 683 characters, so the read says nothing about them. Record that in RESULT.md.

**7. Should-fix. The Grok-clip simulation measures the wrong region and misses the question M2
asks.**
- "Same rule" keeps the host blocks and looks only at the value region. A 20,000-byte head clip of
  the stored text removes the host blocks too: the truncation notice, the artifact id,
  `CANDIDATE EVIDENCE`, `EVIDENCE CHECKPOINT`. Define the Grok kept corpus as the first 20,000
  bytes of each result and the lost region as everything after, and convert the byte offset to a
  character offset.
- `search` cannot be simulated (finding 1). Report the largest stored `resultChars` instead: it is
  18,755, and none exceeds 20,000.
- The TODO's premise for 4,500 does not hold on this sample. Value cut at C plus host blocks,
  against 20,000 bytes (`node tmp/review/grok-recall.mjs`):

  | Cut | Results over the cut | Still over 20,000 bytes | Largest simulated size |
  |---|---|---|---|
  | 16,000 | 146 | 0 | 19,494 to 19,950 bytes |
  | 18,000 | 119 | 79 to 100 | 21,498 to 21,956 bytes |

  The range is the stored host blocks as they are, against a manifest at its 1,600-character
  bound. The TODO's "18,000 characters plus the 1,600-character manifest is under the Grok clip"
  leaves out the other host blocks (up to 3,959 characters) and multi-byte characters (136 of the
  146 results have them). 4,000 fits with 50 to 506 bytes to spare; 4,500 does not fit.
- Fix: add this table to step 4's output, computed by the committed script, and carry it into the
  stop rule (finding 9).

### Candidate extractor (check 3)

**8. Blocking. Nothing shows the extractor could have found a loss, and L = 0 changes production.**
- Baseline volume (`node tmp/review/grok-recall.mjs`): 1,984 candidates in 87 answers, median 19
  per answer. Share found anywhere in the row's `execute` results: URLs 477 of 491, numbers 145 of
  155, backticked spans 566 of 646, link texts about 55 of 76, bold spans 75 of 616.
- So the extractor sees URLs, numbers and code identifiers. It does not see a fact stated in plain
  prose or a table cell: a project or person name, a date written as "November 14, 2026" against
  `2026-11-14`, a version such as `22.0.1`, a status word. Bold spans are mostly the answer's own
  headings. Step 5 only removes false positives, so a blind extractor returns L = 0.
- Noise is not the problem: unmatched candidates never reach step 5.
- Fix, three parts, all free:
  1. Add a tail-side pass. For each result over C, take the tokens of the tail that occur nowhere
     in the kept corpus or the question and that are distinctive (contain a digit, or are
     capitalized, or are eight or more characters), and look them up in the answer. This finds
     plain-text names and table cells without guessing the answer's markup.
  2. Normalize dates (month name forms to ISO) and keep dotted versions and decimals whole.
  3. A control, fixed now: the executor reads the tail and the full answer of 12 exposed units,
     the first 12 by row id from the run on the shipped surface (`2026-11-15T07-33-40`, 18 exposed
     units at 16,000). If that reading finds a cited fact the script missed, the script's zero is
     not accepted and L comes from a direct read of all exposed units of that run.

### Stop rule (check 4)

**9. Should-fix. The 4,500 branch should not set a value by rule.**
- It fires when L(16,000) > 0 and L(18,000) = 0. Facts cited from 16,000 to 18,000 are evidence
  that tails get cited; a zero in the next band is weak support for a boundary chosen just above
  the observed loss.
- It buys little: 6.6% of value characters, about 265 tokens per question, and no Grok fit
  (finding 7). A deploy and a Codex review for that fails the cost rule in `AGENTS.md`.
- The round plan and the note name two outcomes: none sets the boundary, many keeps 6,000.
- Fix: L(16,000) = 0 sets `"4000"`. L(16,000) > 0 keeps 6,000; the report gives L(18,000) and the
  Grok table and asks the owner only if L(18,000) = 0 and the owner wants 4,500 without the Grok
  benefit.

**10. Should-fix. Use distinct rows as the unit and state the exposure.**
- Rows repeat across runs: 141 exposed units are 44 rows at 16,000, and 116 are 38 rows at
  18,000. "L ≥ 3" can be one question in three runs, which is one fact pattern, not "many".
- Fix: R(C) is the number of distinct rows with a `cited` or `chained` candidate past C in any
  run. Report units beside it. Many is R ≥ 3; R of 1 or 2 is the middle case and goes to the
  owner, as the plan already does. Zero stays zero under either unit.
- State the denominator with the result: zero of 44 exposed rows bounds the rate near 7% of
  exposed rows at 95%. Fix a floor now, for example 30 exposed rows; below it the read reports
  "sample too small" and stops, as the note requires. Both cuts clear that floor.

**11. Nit. Report the saving with the decision.** The plan counts results over each cut but not
what the cut removes. Add the share of value characters and tokens per unit (table above), and say
that the read cannot see the cost of extra re-runs or artifact reads at a lower cap. That cost
belongs in the production check: `resultTruncated` share, `execute` calls per request and
`artifactReadCount` on the `execute` event (`src/mcp/tools.ts:437-459`), before and after.

### Step 8, the conditional change (check 5)

**12. Blocking for step 8. The change as written ships a wrong number and misses the demo path.**
- `src/skills/store.ts:76` would still say "~6000-token model boundary", and a whole-skill read
  of 4,001 to 5,000 estimated tokens would be cut with no notice (`store.ts:70`). Tests:
  `test/skills.test.ts:284-357`.
- `EXECUTE_DESCRIPTION` is a module constant with no interpolation (`src/mcp/tools.ts:151`). It is
  also the Playground tool's description (`src/demo/tools.ts:442`), and
  `test/smoke/demo-tools.test.ts:17` asserts that equality. Rendering it from
  `options.modelBoundaryMaxTokens` means a function, a second call site with the demo's own value
  (`src/demo/tools.ts:295`), and edits to the 15 uses of the constant in
  `test/mcp-instructions.test.ts`.
- Simpler, and what forward-only asks for: keep one number. Set `DEFAULT_MAX_TOKENS`, the
  `wrangler.jsonc` value and its comment, the description phrase, the notice threshold, and
  `ARCHITECTURE.md:309` together, and update `test/policy.test.ts:252-381`, which pins 6,000 and
  24,000. Today all of them say 6,000; the plan would leave the default at 6,000 and production at
  4,000, so `npm test` (plain Node, default) and `npm run test:smoke` (`wrangler.jsonc` values,
  `test/smoke/executor.test.ts:34`) would test different caps, and an invalid variable would
  silently raise production to 6,000.
- If the lead keeps the rendered form, the plan must list: the function and both call sites, the
  notice text and threshold taking the configured value, and the two test files above.
- Also update the comments that state the number: `truncate.ts:2-3`, `wrangler.jsonc:45`,
  `store.ts:63-69` and `:349`, `src/demo/tools.ts:541`, `eval/qa/run-qa.mjs:867`.
  `src/executor/spec-sandbox.ts` is a separate cap and stays.
- Length caps hold: the description is 1,964 characters against 2,033.

**13. Should-fix. The same variable tightens logs and errors.** `truncate.ts:243-249` says to
tighten the log budget "only when production data supports the change". Step 8 lowers it with the
result cap. The stored sample cannot support that (no console block). Cite item 3.1's production
`logsTruncated` and `errorTruncated` rates in the change, or say that none exists and name the
check after deploy; update that comment either way.

**14. Nit. The security invariant holds.** The cut stays at a fixed offset and no caller signal
moves it (`truncate.ts:39-44`, `:221-225`); 4,000 and 4,500 are inside the 1,000 to 32,000 range
(`truncate.ts:55-68`). A lower host value narrows the boundary. A description rendered from host
configuration is not caller-supplied. The Codex frontier review should confirm that redaction
still runs before truncation (`run.ts:549-550`).

### Recount (check 6)

**15. Should-fix. The sample is the pre-loop surface; use the shipped one.**
- The baseline (`2026-11-14T20-13-51`) ran before both tuning loops. Loop 2 rewrote the opening
  of the `execute` description, and its kept set is what production serves
  (`.agents/rounds/2026-11-15-tuning-loop-2.md`, P2 stamp `2026-11-15T07-33-40`, merged and
  deployed 2026-11-16).
- Fix: recount on `2026-11-15T07-33-40` (58 tuning rows, 109 scripts), or on both with one table
  row per run and its revision, as the 2026-10-12 ledger does.

**16. Should-fix. Three definitions will not count the same way twice.**
- `data.sections` misreads: use the ledger's definition and its exclusions word for word
  (`.agents/rounds/2026-10-12-call-pattern-triage.md:105-108`: a read that loses or garbles the
  section text, or throws; correct `sections || content` fallbacks, `JSON.stringify` of the whole
  array and deliberate shape inspection do not count). Denominator: `sectionReadScripts` from
  `count-patterns.mjs`.
- `.data` omissions: say that `ok`, `data`, `error`, `asOf`, `asOfBasis` and `caveat` are the
  legal top-level reads; that a fallback such as `r.data?.hits ?? r.hits` is listed apart and not
  counted; and that a script counts once. Denominator: scripts with at least one service call.
- Failed calls with an omitted reason: say whether soft-empty counts (it is `ok: false`), and that
  the script counts when neither `error.kind` nor `error.message` of a failed call reaches the
  returned value or a console line. The `calls:` line shows at most 14 calls and is absent on a
  soft-empty-only run (`source-basis.ts:13`, `run.ts:557`), so identify failed calls from the
  returned value where the line is short. Denominator: scripts with at least one failed call.
- For each counted script, quote the expression. That makes the count checkable without a second
  reader.

### Missing or unneeded (check 7)

**17. Should-fix. Commit the selector.** Step 1's script is the only reader of files that mix the
sets, yet only `read-boundary.mjs` is committed, and its input lives in the ignored `tmp/`. Commit
the selector beside it, with the results directory and the split path as arguments (the pattern of
`eval/qa/scan-tuning-panel.mjs`), and record each run file's name and SHA-256 in RESULT.md. Say
which count `selectById` asserts per run; an expected count taken from the same filter asserts
nothing. The tuning counts per run are 23, 87, 50, 50, 5, 5, 5, 50, 58, 58, 10, 10, 58, 17, 17.

**18. Nit. Two runs carry a surface that did not ship.** `2026-11-15T08-55-41` and `09-08-35`
are the identifier-pointer runs (not shipped). Keep them in the size read, and give R(C) with and
without them.

Nothing in the plan is unneeded apart from the 4,500 branch (finding 9).

## Verdict

Revise before execution: fix findings 1, 4 and 8 (the read can both over-count and miss loss as
written), take 9 and 10 into the stop rule before any count, and rewrite step 8 per finding 12.
