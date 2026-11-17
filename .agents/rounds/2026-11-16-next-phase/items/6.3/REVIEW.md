# Item 6.3: Fable review of the plan

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), 2026-11-17, for the 6.3 lead (`t1w3`). Reviewed
[PLAN.md](PLAN.md) on `cd4520bd`. No model-calling run, no paid call, no subagent. No holdout row, QA
case, QA result or reviewed file opened; the QA lint was not run. Routing stdout went to
`tmp/6.3/review/routing-{base,inc,plus-match}.txt` and was not read. `src/policy/scout-exposure.ts`
was edited in place for the build and restored; `git status` shows only the untracked item folder.

Disclosures:

- Finding 1 names control C3 as confirmation-only. That is the check the brief asks for. The row
  id and its rank are not printed here; I checked its rank claims by boolean only.
- One scoped search (`git grep -n -i "getRwaAssets\|api/rwa\|\brwa\b"` with the two required
  exclusions and more) printed lines of `test/fixtures/evidence-pack.mjs`, a test fixture that holds
  QA-case-shaped text. It is outside `eval/qa` and `eval/corpus`, so the rule as written does not
  cover it. See finding 3.
- For finding 9 I ran generators and a subset of the test suite in a scratch copy
  (`git archive HEAD` into `tmp/6.3/review/tree`, its own throwaway repository, removed afterwards).
  I left out every QA, tuning, golden, judge, corpus and holdout test file.

## What I checked and found correct

- **INCLUDED manifest.** My rebuild (`tmp/6.3/review/included.json`, SHA-256 `7dea11db…`) is
  byte-identical to the lead's `tmp/6.3/included-manifest.json`. 285 to 286 entries; the only added
  entry is `scout.getRwaAssets`. An in-place rebuild in the scratch copy gives the same entries.
- **Routing table.** `node tmp/6.3/compare.mjs` on my two result files reproduces every number:
  legacy 219/293/326/113 to 219/291/325/111; extended, skills and protocol history unchanged;
  holdout by count 12/26/30/30 unchanged, captures 11 to 10, passed 24 to 25. The variant's only
  gate failure is the manifest-fingerprint mismatch. The same three legacy rows change grade, none
  confirmation-only. List changes 16 / 3 / 1 / 0. `getRwaAssets` is in the top five of 11 listed
  legacy rows, 2 listed extended rows, 1 skills row and 2 holdout rows (count). `compare.mjs` is
  safe: result rows carry `confirmationOnly` (108 legacy, 43 extended, 1 protocol history).
- **Controls C1 and C2 at the page of 7.** The same Docs operation is rank 1 on both arms; RWA is
  rank 3 and rank 2; one card leaves the page on each.
- **The probe question.** EXCLUDED lists no Scout data operation in its first two ranks; INCLUDED
  lists `scout.getRwaAssets` at rank 1.
- **Live endpoint.** `GET https://stellarlight.xyz/api/rwa` is keyless and returns 200:
  `counts.registry` 113, `issuers` 52, `registryAsOf` 2026-11-12.
- **Rows D1 to D4 and N1 to N3** are not on `eval/routing-qa-overlap.json` and their question text
  is not in the holdout set (boolean checks).
- **Host adapter.** No change is needed to call `GET /api/rwa`. `callScout` is generic over
  `entry.transport` (`src/adapters/scout.ts:89-130`): a GET sends the arguments as the query string.
  The adapter has no path allowlist; the manifest is the allowlist.
- **Tightening the holdout ceiling to 10** follows the lane's rule (a no-regression vector that
  moves to the measured value). Its wording needs finding 10.

## Findings

### 1. Blocking: control C3 is a confirmation-only question

- Evidence: C3's text equals the question of one extended-lane row in `eval/routing-cases.json`,
  and that row's id is in the `extended` set of `eval/routing-qa-overlap.json` (checked by script,
  boolean output). The plan says "None is on `eval/routing-qa-overlap.json` (checked by id)". The
  controls have no id in the plan, so the id check never covered them.
- `6-COMMON.md` binds: "Never pick one for an answer A/B and never print its rank or hit." The plan
  does both. C3 is one of the ten questions, and "Facts re-checked" prints the per-control ranks
  and the rank-1 hit for all three controls. `6.3-NOTE.md` conflicts with itself here: it asks for
  "the 3 #167 controls" and for "none confirmation-only".
- C1 and C2 match no routing row, so the overlap list cannot say whether either is within the 0.8
  Jaccard of a QA headline question. I did not check that; it needs the QA questions.
- Fix:
  - Stop and ask the orchestrator before the pre-registration commit. Do not resolve the note's
    conflict in the lead session.
  - My recommended default: drop C3 from the A/B and replace it with
    `q-crp-tokenize-personal-rwa` (extended lane, not listed, not holdout). It is the same class
    (a how-to question with RWA vocabulary) and a stronger capture: RWA is rank 1 on the page of 7.
  - Remove the per-control rank line for C3 from PLAN.md; state the three controls by count.
  - Ask the orchestrator for a boolean-only check of C1, C2 and any new question against the QA
    headline questions (the generator's matcher, no text printed).
  - Step 6a rewrites the three `it.fails` controls into a rank-1 assertion. Ask whether a test may
    pin a rank for C3's text; if not, the rewritten test covers C1, C2 and the replacement.

### 2. Blocking: the rule lets grading noise decide

- Evidence: step 5 scores 0, 1 or 2 and rules 1 and 3 need `s(INCLUDED) ≥ s(EXCLUDED)` on all six
  control and neutral pairs. So a correct-against-partial flip on one pair excludes RWA.
- The 6.2 A/B measured that flip rate for the same client, judge and rubric on arms the round
  judged equivalent ([6.2 RESULTS.md](../6.2/RESULTS.md), per-pair table): 5 of the 10 Sonnet pairs
  differ by correct against partial (L1, L2, N3, F2, F4). All clients: 6 of 30, plus one bad flip.
- With no real difference and a symmetric direction, one arm grades lower on a pair with
  probability about 0.25 (Sonnet rate) or 0.10 (all-client rate). All six pairs hold with
  probability 0.75^6 = 0.18, or 0.90^6 = 0.53. With the D clause the plan's rule includes a
  harmless RWA about 11% to 39% of the time.
- The Risks section says "29 of 30 side-by-side pairs tied, so the judge's pairwise noise is low".
  That is the tie rate under 6.2's coarse outcome (bad against not bad). The 6.3 plan dropped that
  outcome and went back to the three-level score that 6.2 review finding 2 removed.
- Step 6b then records the exclude as answer-level evidence and says the A/B is not re-run. A
  noise result would become the durable record.
- Fix, in place of the score `s`:
  - An answer is **bad** when `correctness` is `wrong` or `fabrication` is true. INCLUDED **loses**
    a pair when its answer is bad and EXCLUDED's is not, and wins in the reverse case.
  - INCLUDED also loses a control or neutral pair on an **attributable drop**: its grade is
    `partial`, EXCLUDED's is `correct`, and the INCLUDED run called `scout.getRwaAssets`.
  - Include only if: no loss on any control or neutral pair; no control or neutral run "calls RWA
    wrongly" (finding 4); and the D clause of finding 5.
  - Correct against partial without an RWA call is reported, not counted.
  - `blind.mjs --score` prints the outcome (include, exclude, inconclusive). The lead does not
    override it.
- This is a faithful form of the note's "grades worse": a failed answer, or a lower grade that the
  RWA call can explain. In 6.2 the bad-flip rate was 1 in 30 pairs (0 in 10 for Sonnet), so six
  pairs hold about 90% of the time when RWA is harmless.

### 3. Blocking: the step 6a search prints holdout rows and confirmation-only ids

- Evidence: step 6a runs
  `git grep -n -i "rwa" -- ':!eval/qa' ':!eval/corpus' ':!research' ':!.agents/rounds'`. A count-only
  run of that pattern (`-c`, no content printed) shows hits in `eval/holdout-cases.json` (3 lines),
  `eval/routing-qa-overlap.json` (3), `eval/discovery/` (92), `eval/agentic/sample.json` (3) and
  `test/fixtures/evidence-pack.mjs` (20). The pattern also matches `forward` and similar words.
- So the plan's own command prints holdout rows, listed row ids and QA-shaped fixture text. Items
  6.1 and 6.2 each exposed a case this way.
- Fix: list file names only, with whole-word matching:
  `git grep -l -w -i -e rwa -e getRwaAssets -e "api/rwa" -- ':!eval/qa' ':!eval/corpus' ':!research'
  ':!.agents/rounds'` (tested; it prints 55 names and no content). Then open only the named files
  that are not a case set: never `eval/holdout-cases.json`, `eval/routing-qa-overlap.json`,
  `eval/discovery/`, `eval/agentic/` or `test/fixtures/evidence-pack.mjs`. Add
  `':!test/fixtures/evidence-pack.mjs'` to the search rule at the head of the plan and to every
  child brief.

### 4. Should-fix: "calls RWA wrongly" has three holes

- Evidence: `ab-run.mjs` records operation ids with `OP_RE` over the `execute` code
  ([6.2 ab-run.mjs](../6.2/ab-run.mjs), line 30 and 71). That matches a mention, a
  `codemode.describe("scout.getRwaAssets")` and a comment as well as a call.
- The judge sees no registry source on control and neutral pairs. Their reference lists are Docs
  pages, and the fabrication test accepts only "the reference pages, the pages it cites, its listed
  result URLs". A correct asset code or issuer taken from the registry can be marked fabricated
  there (the artifact `run-evals` section 6 warns of).
- A wasted RWA call that leaves the answer on topic is not counted. That is defensible at the
  answer level, but it costs turns and tokens, and "cost counts".
- Fix:
  - Record a call with `/\bscout\.getRwaAssets\s*\(/` and record a mention separately. The rule
    uses the call.
  - Keep the definition: the run called it and the judge marked the answer `offTopic`.
  - In the rubric, make the registry a source for every pair: a specific that
    `https://stellarlight.xyz/api/rwa` supports is not fabricated. Tell the judge the endpoint
    returns at most 100 of its 113 rows per call and takes `state`, `kind` and `level` filters.
  - Report, per control and neutral pair, the turn and cost difference when INCLUDED called RWA.

### 5. Should-fix: two of the four "direct" questions are displacement questions, and the sum lets a gain pay for a loss

- Evidence: D2 asks what the SCF funded and D3 asks for 2025 DeFi and RWA launches. The registry
  is not the primary source for either; the labelled card is a Lumenloop operation. On D2 RWA is
  rank 1 on the page of 7. Only D1 and D4 are questions the registry answers.
- Rule 2 sums the four differences. A gain on D1 or D4 can cancel a failed D2 or D3, which is the
  harm these two rows were chosen to measure.
- Fix: D1 and D4: INCLUDED losses minus wins is at most 0. D2 and D3: no INCLUDED loss on either,
  the same test as a control. Keep "more than one D pair missing" as inconclusive, and add "D2 or
  D3 missing".

### 6. Should-fix: the neutral questions are the weakest captures

- "Neutral = off-target" is the right choice. An untouched question has the same page on both
  arms, and with one sample per pair it would only add a noise pair to a strict rule.
- Evidence, ranks on the served page of 7 (`tmp/6.3/review/probe.mts`): N1 has RWA at rank 5, N2 at
  rank 6, N3 at rank 6. The plan's "rank 4, 5, 5" are the top-five ranks from the eval, not the page
  the client sees. Stronger off-target captures among listed, non-RWA rows are left out:
  `q-scf-academic-research-grant` (rank 2, an unrelated funding question),
  `q-sep-8-regulated-assets` (rank 4) and `q-ti-historical-pointintime-balances` (rank 4, extended).
- N2 is a one-fact lookup that any Docs call answers; it can hardly fail.
- Fix: choose by a stated rule, not by hand: the three listed, non-RWA rows where RWA ranks highest
  on the page of 7. Today that is `q-scf-academic-research-grant`, `q-sep-8-regulated-assets` and
  `q-ti-historical-pointintime-balances`. State every rank in the plan at limit 7.

### 7. Should-fix: status 200 is not an adequate reference

Evidence, keyless `curl` on 2026-11-17 (`tmp/6.3/review/`):

| URL | Result |
|---|---|
| The 11 developers.stellar.org paths, the SEP-0008 file, `stellar.org/case-studies` | 200, readable |
| `https://stellar.org/use-cases/tokenization` | redirects to `/solutions/real-world-assets` (200) |
| `https://communityfund.stellar.org/` | 200, an application shell with no readable text |
| `https://app.rwa.xyz/networks/stellar` | 200; the data is only inside `__NEXT_DATA__` |
| "the Franklin Templeton FOBXX product page" | no URL in the plan; the product page I fetched returns 200 with no "Stellar", "FOBXX" or "BENJI" in the body |
| `https://stellarlight.xyz/api/rwa` | 200, 117 KB, 100 of 113 rows |

- D2 has no page that lists funded projects. D3 has no page about 2025 DeFi launches.
- On D1 to D4 a reference is the treatment's own source. An EXCLUDED answer built on Lumenloop
  content is then graded against the registry.
- Fix:
  - D2: use `https://communityfund.stellar.org/projects` (200, about 200 KB of text).
  - D4: put an exact URL in `questions.json` and check it for the fund name, not for 200.
    `https://stellar.org/solutions/real-world-assets` has 38 matches for "Franklin".
  - D3: add one dated 2025 source (an SDF quarterly or year-in-review post).
  - Use the final URL after redirects. Tell the judge to fetch rwa.xyz with `curl`.
  - Record in EXEC.md, per URL, the status and one string the page must contain.
  - Say in RESULTS.md that the registry is both treatment and reference on the D pairs.

### 8. Should-fix: dropping the tool-call list does not hide the call

- Evidence: every RWA response carries `meta.source: "https://stellarlight.xyz/api/rwa"` and
  per-row `evidenceUrl` values. `ab-run.mjs` collects every URL in a tool result into `resultUrls`,
  and the packet keeps `resultUrls`. A run that called RWA shows it there as plainly as in the
  tool-call list. The served `stellar-light` skill also regains its RWA reference section on
  INCLUDED only (`src/skills/scrub.ts:85` derives from the same policy file), so a skill read can
  put `/api/rwa` text into a result on one arm.
- The answer text can show registry rows too. The plan already accepts that.
- Fix:
  - Drop from packet `resultUrls` every URL that contains `stellarlight.xyz/api/rwa`, on both
    arms. Finding 4 gives the judge the registry for every pair, so nothing is lost.
  - Assign X and Y with a balanced random split (5 and 5). 6.2 drew 22 of 30 one way by chance.
  - In `--selftest`, check the packet for `excluded`, `included`, `arm`, `getRwaAssets` outside the
    answer text, and `api/rwa` in `resultUrls`.
  - Give the judge session a `--max-budget-usd`.
- `ab-run.mjs` is a copy "unchanged" apart from three edits. 6.2 RESULTS.md ("Limits") says any
  reuse must first check the remaining arm budget before each attempt. Make that fix in the copy.

### 9. Should-fix: commit I is not yet the surface that would ship, and three facts are wrong

Evidence from the scratch copy with the policy edit and all four generators run in place:

- **Super spec.** `specs/super-spec.json` changes: 65 to 66 paths, Scout 29 to 30 operations,
  compact size 208,786 to 211,724 bytes (about 734 more tokens in the sandbox spec). The plan says
  `spec:build` "produced no change with the edit in place". It read the unchanged
  `catalog/manifest.json`, because the lead built with `--out`. `family-text:build` does produce no
  change.
- **Entry counts.** 23 other Scout entries change, not 20: 20 change `keywords`, 12 change
  `outputSchema`, 9 change both, 3 change `outputSchema` only (`getHackathons`, `getStablecoins`,
  `listSkills`).
- **Op classes.** `eval/plan/op-classes.json` gains `"scout.getRwaAssets": "detail"`. The operation
  returns a collection; its sibling is `"scout.getStablecoins": "broad"` in `OP_OVERRIDES`
  (`eval/plan/build-op-classes.mjs:77`). The prefix rule misclassifies it silently.
- **Search card.** Step 6a says "The served card already says the stablecoin inclusion and
  'absence means untracked'". The search card keeps the first 220 characters of the description
  (`src/mcp/tools.ts:203-214`). For RWA those end at "…stellar.toml plus Horizo"; both caveats are
  cut. `scout.getStablecoins` and `scout.listAudits` carry a `cardCaveat` for the same reason
  (`scripts/catalog-data/card-caveats.mjs`), and that file's rule fits RWA exactly.
- **Envelope date.** `asOf` is read only from `dataAsOf` and `asOf` paths
  (`src/executor/providers.ts:295-300`). The registry states `meta.registryAsOf`, so the envelope
  reports `asOfBasis: "observed"` with the call time, five days after the registry date today.
- The description says "97 tokens"; the live registry has 113 rows (97 rwa.xyz-listed plus 16
  issuer-declared).

Fix:

- Decide the model-facing surface before the pre-registration commit, and put all of it in commit
  I, so that the measured arm is the shipped one:
  - add a `CARD_CAVEATS` line for `scout.getRwaAssets` (135 characters at most), for example
    "Curated registry: absence means untracked, never 'not on Stellar'. Includes fiat stablecoins
    (productKind=stablecoin)." The text never feeds scoring, so the routing table holds; rebuild and
    re-run the comparison once to show it;
  - add no `retrievalProfile`. The `directory` lane takes part in admission
    (`src/catalog/search.ts:475`), so it would move routing. Say in the policy record that 22
    other operations also have none;
  - add `"scout.getRwaAssets": "broad"` to `OP_OVERRIDES`.
- Replace the "no card text is added" sentence, and correct the three facts in PLAN.md.
- In step 3, state the expected diff of each generated file, and stop on any other.
- At INCLUDED arm start, read the served `stellar-light` skill through the server and save its RWA
  section to `tmp/6.3/`. The 2026-09-16 pin review read the body with that section scrubbed
  (`ecosystem-skills/PIN-REVIEW.md:463`). Give the section to the Codex reviewer.
- The policy record states the `asOf` behaviour and the 100-row cap with no paging parameter.

### 10. Should-fix: step 6a misses tests, gate text and two gates

- **Tests.** On the INCLUDED tree, 22 tests fail in 9 files of the subset I ran (41 files, 1,078
  tests). The plan names three files. Also failing:
  - `test/catalog.test.ts` (Scout count 29, and two exact lists of operations with `x-routing`);
  - `test/super-spec.test.ts` (Scout 29, operations 61);
  - `test/plain-operation-harness.test.mjs` (61 operations, `EXPECTED_OPERATION_COUNTS`);
  - `test/search.test.ts` (the exact list of compacted signatures);
  - `test/emitted-text-guard.test.ts` (one case; line 60 asserts the name is non-exposed);
  - `test/run-routing-manifest-evidence.test.mjs` (passes once `gates.json` is re-baselined).
  `test/catalog-guards.test.mjs` fails 11 cases and `test/description-notes.test.mjs` 2, more than
  the "example name" swap the plan describes. `test/README.md:53` describes the fixture the plan
  deletes. Tell the executor to take the `npm test` failure list as the worklist.
- **Holdout text.** `eval/gates.json` `holdoutNote` says the ceiling "is 11 for the removal of
  scout.matchPartners … and returns to 10 when that operation is re-exposed". The plan does not
  edit it. The plan's new TODO sentence ("a re-exposure that measures 11 needs its own
  re-baseline") points the wrong way. With RWA included and the `matchPartners` policy line also
  removed, the holdout lane measures 9 captures and 26 passed (counts only,
  `tmp/6.3/review/included-plus-match.json`; the other 5.1 edits were not reversed). Write: the
  ceiling is 10 with RWA exposed and `matchPartners` removed; re-exposure tightens it to the
  measured count, expected 9.
- **Gate note.** Three legacy rows go from hit to miss. `run-evals` section 6 sets zero as the
  standard. The note must say the re-baseline departs from it on the owner's answer and the A/B,
  as the 6.2 note does. State the row ranks at limit 7: the labelled card moves 3 to 4 on
  `q-defi-rwa-overview`, 4 to 5 on `q-defi-rwa-scf-similar` and 6 to 7 on
  `q-eco-2025-defi-launches` (the last one sits on the page edge).
- **Gates.** Add `npm run eval:selftest` (the `eval/` row of the CONTRIBUTING table) and
  `node scripts/check-pin-review.mjs --base origin/main` (PIN-REVIEW.md is edited). Run
  `npm run test:smoke` on the 6a tree: no `src/executor` file changes, but the sandbox gains a
  binding and a larger spec, and that lane is the only one that runs the assembled Worker.
- **Drift config.** The note asks for "the drift and exposure config change". The policy file is
  that config (`assertScoutExclusionsResolve` reads it). Say so in the policy record.

### 11. Should-fix: "Closes #167" needs the orchestrator's word

- Evidence: the issue's acceptance text has lines the plan's list leaves out: "Acceptance requires
  a general intent mechanism", "implementation questions avoid the registry" and "runtime
  measurements must pass". Step 6a ships no mechanism, and the three controls still show the
  registry in the top three. The routing gates pass only after a re-baseline.
- So an include does not meet #167; it replaces its acceptance on the owner's answer.
- Fix: write "Closes #167" only if the orchestrator confirms closing by supersession. The closing
  text then says what was not built and that the mixed-intent captures stay in the TODO routing
  repair item and issue #223. Otherwise use `Refs #167`.

### 12. Should-fix: step 6b treats inconclusive as exclude

- Evidence: 6b has one text for "exclude, or inconclusive": the TODO cites "which clause failed"
  and says the A/B is not re-run.
- Fix: for an inconclusive result the TODO bullet and the #167 comment say "inconclusive", name the
  missing pairs, and leave the re-run to the orchestrator. Only a decided exclude says the A/B is
  not re-run on routine drift.

### 13. Nits

- The inconclusive clause is otherwise right: any missing control or neutral pair blocks a decision.
- The item cap (USD 25) and the estimate (about USD 2 plus the judge) are sound; 6.2 measured
  USD 0.93 to 0.96 per ten-question Sonnet arm.
- The arms run one after the other. Record whether they straddle 00:00 UTC, as 6.2 did.
- The Codex brief asks it to check "the Scout host adapter's allowlist". There is none; ask it to
  check argument validation against the input schema and the truncation of a 117 KB response.

## Verdict

Revise before any run: findings 1 to 3 are blocking (a confirmation-only control, a rule that grading noise decides, and a search that prints protected rows); the manifest, the routing numbers, the adapter path and the ceiling move are sound.
