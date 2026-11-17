# Item 6.2: second opinion (Claude Fable 5.2, high effort)

Independent read for the 6.2 lead (`t1v9`), 2026-11-17. I did not look for or read the other second
opinion. No model-calling run, no tracked file edited, no subagent, no QA path opened.

## Verdict: absorb

The evidence supports the rule's outcome. FRESH has no loss in 30 pairs, so no hold trigger can
fire, and I found no scoring bug, blinding leak, arm-identity gap, or cost or reach pattern that
argues against it. The two routing rows that lost a grade did not turn into worse answers: on L1
and L2 the FRESH runs still called the operations that had dropped in rank, reached the same
reference pages, and cost the same. The outcome survives any two judge reversals against FRESH.

## What I checked

- **Scoring.** I recomputed every pair from `blind-key.json`, the two verdict files and the six
  answer files with my own script. It matches `score.md` and RESULTS.md: 0 losses, 1 win, 29 ties;
  rule pairs net -1; per client -1, 0, 0; 0 missing. `blind.mjs --score` applies the rule as PLAN.md
  states it.
- **Pre-registration.** Commit `4092901a` is stamped 19:43:47Z and the first answer started at
  19:44:20Z. `blind.mjs`, `ab-run.mjs` and `questions.json` are unchanged since that commit.
- **Arm identity.** Each answer file has 10 rows with the right arm, model and one attempt, inside
  its arm's window, all on Claude Code 2.1.326. The manifest SHA-256 of each arm commit matches
  RESULTS.md. The Worker imports `catalog/manifest.json` statically (`src/catalog/load.ts:12`) and
  `dev:eval` stamps the revision from `git rev-parse HEAD` on a clean tree at launch, so a server
  restarted on commit A serves the fresh catalog.
- **Blinding.** Both packets hold only the pair id, question, reference URLs, answer, tool calls
  (tool, query, ops) and result URLs. They contain no arm name, commit, model name, file name, cost
  or timestamp; the `localhost` strings are example URLs from Docs pages and appear on both arms.
  Packet order is shuffled. The verdict files in `tmp/6.2/` are byte-identical to the judges' own.
- **Judge errors that could flip a pair.** I read the answers behind the four pairs nearest to a
  flip (below). None is misjudged in a way that makes a FRESH loss.
- **Cost and reach.** 143 calls and 173 turns on each arm; cost USD 9.94 against 9.96. Reach is
  identical in every pair.

## The pairs nearest to a flip

| Pair | Risk | My read |
|---|---|---|
| Sonnet F3 | Neither arm reached a reference page, so `R` is empty and any FRESH loss here would count as attributable (rule 2b). | Both arms made the same calls, read the same pinned skill file and gave near-identical answers. HOLD, not FRESH, carries the "no code changes for mainnet" claim that the other judge marked down on Opus F3. No basis for a FRESH-only bad grade. |
| Sonnet L2 | FRESH is partial for a miscomputed ratio (2.5x; the figures give 1.9x). | A slip in arithmetic on cited figures is "one minor error", so partial is right under the L2 rubric. If it were marked wrong, the loss is not attributable (FRESH called `scout.*`). |
| Opus L1 | FRESH is partial for `source_account` on `history_transactions`. | The judge says the column comes from the cited data skill. I did not open the skill; an earlier round record in this repo describes the same skill query, which agrees. If it were marked fabricated, the loss is not attributable (FRESH called an operation in `R` and reached four reference paths). |
| Fable L2 | The only win. HOLD is wrong for three figures with no URL. | The judge applied the L2 rubric strictly and correctly: HOLD names a "weekly roundup" twice and an article once with no link, while every FRESH figure has a source. This reflects how one run cited its sources, not retrieval. I count it as noise. |

Sensitivity: reversing Sonnet L2 and Opus L1 to losses gives rule pairs net 1 and each client net
1, which is still absorb. Hold needs both of those reversals and the Fable L2 win voided. A judge
strict enough to do the first two would also mark Sonnet L1 HOLD wrong (it says SDF hosts only the
Futurenet RPC, against the reference page), which adds a FRESH win.

## Caveats for the orchestrator

1. **The result is "no detectable harm", not "FRESH is better".** F1 to F4, the questions written
   for the fresh vocabulary, are all ties. The correct-against-partial lean toward FRESH (4 pairs
   to 2) should not be cited as a gain: see caveat 2.
2. **X and Y came out unbalanced.** HOLD was X in 22 of 30 pairs (14 of 20 for the Opus judge, 8 of
   10 for the Fable judge). The code is right (`crypto.randomInt`), so this is chance, about 1 in 60.
   The Opus judge graded X lower in 4 pairs and Y lower in 2, and HOLD was X in all 4. A position
   effect cannot be separated from an arm effect in those pairs. It cannot produce a FRESH loss, so
   the rule outcome does not depend on it.
3. **The treatment reaches an answer only through `search` ranking.** The clients mostly went on to
   `stellarDocs.search_docs` and `get_doc_page`, which read live Docs on both arms. Sonnet's FRESH
   L1 run never called `search`. With one sample per cell the A/B can show only a large effect, as
   PLAN.md says.
4. **No behavioural proof of arm identity exists.** The "Varial wallet" probe returned the same top
   five on both arms, and the answer records do not keep `search` results. Identity rests on the
   build path I read (static import, revision stamped at launch, clean tree, restart) and the
   manifest hashes.
5. **One operation choice differs on a lost-row question and I did not trace it.** Sonnet L2 called
   `scout.searchProjects` on HOLD and `scout.vetIdea` on FRESH, after slightly different search
   queries. I did not replay those queries against the two manifests. It does not change the grade
   beyond partial and is not attributable under the rule.
6. **The third lost row was not tested.** It is a holdout row known only by count, and its slot went
   to a control by design. The answer evidence covers two of the three routing losses.
7. **Holdout top3 will sit on its floor (26).** After the re-baseline, the next change that costs
   one holdout top-3 fails the gate. The gates note and the TODO should say so, as step 7a plans.
8. **Only Claude clients were run**, as the owner asked. GPT-6.1 Terra and Grok 4.7 are on the
   roster and may lean on `search` ranking differently; this A/B says nothing about them.
9. **Judges were not consistent with each other on one claim.** The Fable judge marked both Opus F3
   answers partial for the mainnet and spending-limit claims; the Opus judge marked the Sonnet F3
   answers correct although HOLD makes the mainnet claim. The inconsistency is the same on both arms
   within each pair, so it moves no outcome.
