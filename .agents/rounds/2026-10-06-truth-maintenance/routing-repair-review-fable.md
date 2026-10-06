# Independent review — routing repair for issue #223 — 2026-10-06

Reviewer: Claude Fable 5.1 (`claude-fable-5-1`), Claude Fable tier, effort as set on the launch line.
Reviewed: `tmp/routing-repair-astra.md` (the primary report) and the artifacts in `tmp/routing-repair/`.
Candidate: branch `drift/2026-10-06-repair` at `c76b517c`. Baseline: `main` at `c06dadbd`.

## Verdict

1. **No general repair is ready. I agree with the primary report.** All four tested policies fail the zero-loss rule by a wide margin.
2. **Six of the seven per-flip verdicts are correct as written.** The seventh (streaming) is correct under the brief's definition, but it needs one qualification (finding F3).
3. **The seven graded flips undercount the routing change.** Service-level grades hide operation-level regressions in the 70 ungraded top-five reorders (finding F1). The primary report does not examine them.
4. **One experiment does not isolate its hypothesis** (finding F2). The reject decision for the tested policy stands. The hypothesis itself is not rejected.
5. **`gates.json` cannot be re-baselined under the repository's own rule.** The movement is not an intended improvement. Any acceptance is an owner exception, not a normal re-baseline (finding F4).

I found no error in the score arithmetic of the primary report.

## Method and limits

I read the two briefs, the scorer (`src/catalog/scoring.ts`), the admission rule (`src/catalog/search.ts:512`), the grader (`eval/lib/grade.mjs`), and the catalog build path (`scripts/build-catalog.mjs:154`, `:682`). I read the current Scout contracts in `inventory/stellar-light.json` and `catalog/manifest.json`. I checked the primary claims against `diagnosis.json`, `full-traces.log`, `token-deltas.log`, `joint-ablations.json`, `experiment-summary.json`, and the main-to-candidate diff.

Limits:

- I ran no Node probe and no evaluation. Every number below comes from the existing artifacts. I checked them for internal consistency and against the source. I did not reproduce them.
- I did not recount the row totals for `bounded_prefix` and `content_query`. I counted graded cells only (see the experiment table).
- The contract verdicts use stored contracts. No live service response and no answer-quality measurement supports them.
- I changed no tracked file. I did not push, deploy, or contact GitHub.

## The seven flips

`expected_any` grades (`any1`, `any3`, `any5`) do not change for any of the five losses. Holdout and skills totals do not change. In three of the four real regressions the expected operation stays in the top five. The regressions are real, but each one is a one-rank displacement.

| Case | My verdict | Primary verdict | Contract evidence |
|---|---|---|---|
| `q-defi-agentic-payment-standards-compare` (top3 lost) | Real regression, low severity | Agree | `searchHackathonBuilds` is "the PROTOTYPE layer of prior art". It cannot compare four payment standards. `stellarDocs.search_docs` moves from rank 3 to rank 4. The skill at rank 1 does not move. |
| `q-defi-blend-alternatives` (top5 lost) | Real regression | Agree | `getClusters` states `notFor`: "finding/looking up an actual named project in a category -> searchProjects". Its `sampleProjects` field is "a SAMPLE of the cluster, not its full membership". The question asks for named lending protocols. |
| `q-defi-rwa-overview` (top3 lost) | Real regression, the clearest one | Agree | `getHackathon` "Needs an exact slug". The question names no event. The admission witness is the event name in an example: "Stellar Hacks: Real-World ZK". |
| `q-defi-streaming-payments-prior-art` (cardHit5 lost) | Card label too narrow, plus a residual ordering defect | Agree in part (F3) | `vetIdea` is "The 'I want to build X on Stellar' composite: competitor repos (full search stack) + active directory projects…". That is this question. |
| `q-scf-funded-similar-payroll` (top3 lost) | Real regression, low severity | Agree | `vetIdea` returns a nullable count, `scfAwardedProjects`, not identified awards. `find_similar_scf_submissions` stays the best operation. It stays in the top five at rank 5. |
| `q-defi-stellarx-what-is` (top1 gained) | Useful result, accidental cause | Agree, with a wording correction (F5) | Content search fits an identity question better than prototype search. |
| `q-edge-scf-v7-centralization-myths` (top3 gained) | Service-label gain only | Agree | `scfPitch` prepares a grant application. It cannot answer a policy question. The match is the word `take`. The expected card, `scout_research`, is absent before and after. |

### Service-label gain versus useful operation gain

- `q-edge-scf-v7-centralization-myths` is a label gain with no operation value. Do not count it as an improvement. Do not protect it as a "loss" when a repair removes it.
- `q-defi-stellarx-what-is` is a useful result. The cause is not a routing improvement. See F5.
- Net useful gains from the upstream text on these seven rows: one accidental gain and one correct new admission (`vetIdea` on the streaming question).

### Attribution claims that I confirmed

- Three operations change from rejected to admitted through an `exampleQuestions` phrase: `getClusters` (`lending` + `stellar`), `getHackathon` (`stellar` + `real` + `world`), and `vetIdea` on the payroll question (`payroll` + `app`). `diagnosis.json` shows `rejected: true` before and `rejected: false` after for each one.
- `vetIdea` on the streaming question: positive coverage changes 3 to 4, negative coverage stays 2. The rule `negative + 1 >= positive` at `search.ts:531` changes from true to false.
- The tier arithmetic is correct. `TIER_INTERLEAVE_MARGIN` is 1.6. `326 >= 1.6 × 202` holds and `326 >= 1.6 × 212` fails. `192 < 1.6 × 131` keeps the similar-submission search behind gated `vetIdea`.
- The streaming and payroll losses each have more than one cause. `joint-ablations.json` supports the primary description.
- Only Scout entries carry `x-routing` phrases (`build-catalog.mjs:724`). The two manifest variants therefore have the same scope, although one script filters all entries and the other filters Scout entries only.

## Findings

### F1 — Material. The 70 ungraded reorders contain operation-level regressions that the grades hide

The grader checks the service of each hit (`grade.mjs:101`). A wrong Scout operation that replaces a correct Scout operation does not change a grade. The main-to-candidate diff shows 77 top-five order changes and only 7 graded flips. The primary report confirms the 77 but examines only the 7. The row and cell counts in the experiment table below come from `experiment-summary.json`.

Examples from `routing-diff-candidate.txt`:

| Case | Question | Change | Why the grade does not move |
|---|---|---|---|
| `q-hist-remittance-corridors` | "What real-world remittance deployments run on Stellar?" | `scout.getHackathon` enters at rank 1 | Expected service is `scout`. Top1 stays true. |
| `q-scf-current-round` | "What is the current open SCF round and when is its submission deadline?" | `scout.scfPitch` leaves the top five. `scout.getHackathonSubmission` takes rank 3. | Expected service is `scout`. `scfPitch` is the operation that reports live round state and the deadline. |
| `q-scf-ecosystem-listing-partner-jobs` | Directory listing, partners, jobs | `scout.getHackathonSubmission` enters at rank 1, above `getPartners` | Expected service is `scout`. |
| `q-defi-phoenix-scf` | "Show Phoenix's SCF submission history on Stellar." | `scout.getHackathonSubmission` enters at rank 2 | Lumenloop skill stays at rank 1. |
| `q-protocol-cap-process` | How a CAP moves from idea to activation | `scout.vetIdea` enters at rank 3 | Docs stays at rank 1. |

The first row has the same cause as the graded RWA loss: the `real` + `world` witness from the event name. It is the same defect at rank 1, and it is ungraded.

By my count of the diff, these operations enter a top five where they were absent on `main`:

- `scout.vetIdea`: 14 rows. About nine are documentation how-to questions (cross-contract calls, the factory pattern, CAP-0035 clawback, CAP-59, Horizon deprecation, testnet identity).
- `scout.getHackathonSubmission` (new operation): 9 rows. Its contract needs a submission id or a DoraHacks link. Two of the nine rows concern hackathons at all.
- `scout.analyzeHackathonSubmissions` (new operation): 8 rows, which include the Disbursement Platform, SEP-10, Soroswap, and Anchor Platform questions.

I did not trace the cause of each of these rows. The counts are observations from the diff, not attributions.

Consequences:

- The statement "five losses, two gains" understates the change. The correct summary is: five graded losses, plus a broad increase in false admission of three hackathon and idea operations.
- This finding strengthens the "no re-baseline" recommendation.
- The primary report should add this scope statement. It should not claim that the candidate is otherwise neutral.
- Some of these rows are holdout rows. I report them as observations only. Do not tune against them.

### F2 — Material. `intent_examples_only` does not isolate "examples as standalone witnesses"

The experiment removes every `exampleQuestions` phrase from `routingPhrases`. That field has four consumers:

1. `rejectsRoutingIntent` positive coverage (`search.ts:527`). This is the hypothesis.
2. `hasCoherentRoutingWitness` (`scoring.ts:165`), which admits routing vocabulary for an entry that fails the base gate.
3. `discriminativeDirectoryVocabularyCoverage` (`search.ts:486`). This rule requires a token in both a `useWhen` phrase and an `exampleQuestions` phrase. Without example phrases the rule can never pass.
4. The phrase loop at `search.ts:800`.

The 12 added loss rows therefore cannot be assigned to consumer 1. Some of them can come from the disabled directory rule or from lost corroboration. The same limit applies to `no_example_vocabulary`, which includes the same phrase removal.

The reject decision for the tested policies is correct. The report must not say that the hypothesis is rejected. A narrower policy is untested: an example phrase cannot satisfy the positive override alone, but it stays available as corroboration. I do not ask for that test in this round. `.agents/TODO.md:138` requires owner authorization for a scoring repair, and more variants against these rows increase the tuning risk.

### F3 — Moderate. The streaming verdict needs a qualification and a correct owner path

I agree that `vetIdea` fits the question and that the card label `scout_repos` is too narrow.

Qualification: `vetIdea` does not displace `searchRepos` alone. Two other changes do:

- `scfPitch` rises 361 to 382 through the word `payments` in a pitch example. It passes `searchRepos` at 379.
- The new `getHackathonSubmission` ties `searchRepos` at 379 and wins the tie on id order when `scfPitch` is restored.

Neither operation fits the question. The best page holds both `vetIdea` and `searchRepos`. The candidate page holds `vetIdea` and `scfPitch`. Under the brief's definition (the new ranking answers at least as well), the verdict "stale label" stands. The report should also record the residual defect.

Owner path: the primary report sends the label to the golden-truth workflow. `AGENTS.md` states that the routing labels come from the read-only prior art under `eval/corpus/`, and that the QA battery under `eval/qa/corpus/` is separate. I did not verify which mechanism can widen a routing card label. Confirm the path before the report names it. Do not widen the label in the same change that needs the grade.

Related caution: `no_example_vocabulary` "recovers" this card grade. It does so by reversing the one admission that both reviews judge correct. A recovered grade is not a recovered answer.

### F4 — Material for the decision. The gate recommendation needs one consistent statement

The primary headline says "no re-baseline". Its closing paragraph offers a second path: "explicitly retain the four real regressions as named risks". These are different decisions.

The repository rule is in `.agents/skills/live-drift-resolution/SKILL.md:228`: re-baseline only when a routing-relevant text change is the cause **and** the movement is an intended improvement. A re-baseline asserts that the new numbers are the new correct floor. Condition one holds. Condition two does not: top3 falls 298 to 295, top5 falls 326 to 325, cardHit5 falls 112 to 111, and four of the five losses are real. `.agents/TODO.md:138` also states that the routing-repair item does not authorize a baseline change.

My recommendation:

- **Do not re-baseline `gates.json` for this candidate as a normal act.** No reading of the evidence makes the movement an intended improvement. A "stale labels" justification is false for four of the five losses.
- The numeric thresholds pass. The gate fails only on the manifest fingerprint. A fingerprint-only refresh that keeps 219/298/326/112 as accepted totals is not available, because the totals moved.
- Acceptance with named regressions is an **owner exception** to the skill rule. The report must present it as an owner decision, not as a reviewer-approved path.

The report should state the cost of each option, because the owner needs both sides:

- **Hold.** Scout 1.9.71 stays unabsorbed. The catalog keeps the 1.9.61 contracts while the live service serves 1.9.71. This includes the changed `getHackathon` response and two new operations. The 2026-10-02 hold of the Stellar Docs title snapshot is the precedent.
- **Owner exception.** Accept 220/295/325/111 with the regressions named. The named risks must include F1, not only the four graded rows. The exposure of the two new operations is a separate policy decision under the same skill (operation surface, Step 3). F1 is evidence for that decision.

I do not recommend one option over the other. The choice trades contract freshness against routing precision, and no measurement in this round prices either side.

### F5 — Minor. The StellarX gain is fully a stopword effect

The primary report says the gain "arises partly from stopword changes". The trace shows that the full base loss (227 to 196) comes from `it` and `by`: 10 + 20 points and one coverage point. The schema token `development` offsets 8 points. No content word moves. The next rewording of that description can reverse the gain. Write "entirely", and do not cite this row as evidence for the candidate.

The same noise source appears on the loss side: `what` on the RWA row, and `on` on the streaming row. Stopword matches in descriptions move scores by the same amount as one content word. This supports the direction of the `content_query` hypothesis. It does not support the tested implementation.

### F6 — Minor. Compare against `main`, not only against the candidate

The brief's rule is zero other graded-row losses. The primary table counts against the candidate. Against `main` the counts are:

| Policy | Loss rows vs `main` | Gain rows vs `main` |
|---|---:|---:|
| `intent_examples_only` | 14 | 2 |
| `no_example_vocabulary` | 14 | 3 |

The decisions do not change. The `main` comparison is the correct one because it does not count the removal of the spurious `q-edge-scf-v7` gain as a loss.

### F7 — Minor. `bounded_prefix` tests more than its name

- It adds a second rule: a substring match needs a query token of four characters or more. The hypothesis named the prefix rule only. The primary report discloses this.
- Its bound is not the existing `tokensOverlap` rule. `tokensOverlap` canonicalizes plurals first (`scoring.ts:149`). The experiment compares raw lengths.
- A shipped form changes the vendored scorer. `scoring.ts:437` requires that file to stay byte-identical, and Cloudflare issue #2296 owns the upstream defect.

The result (top5 326 to 311, holdout captures 10 to 14) makes these points irrelevant to the decision. Record them so that a later repair does not reuse the script as a reference.

## Experiments

I confirmed that each patch landed in its temporary copy (`bounded_prefix/vendor/search-scoring.ts:85`, `bounded_prefix/scoring.ts:491`, `content_query/scoring.ts:239`). I confirmed that the rebuilt vocabulary in `no_example_vocabulary` uses the same `extractKeywords` arguments as `build-catalog.mjs:163`.

| Policy | Legacy top1/top3/top5/cardHit5 | Holdout captures (ceiling 10) | Graded cells lost / gained vs candidate | Decision |
|---|---:|---:|---:|---|
| `main` | 219/298/326/112 | 10 | — | Baseline |
| Candidate | 220/295/325/111 | 10 | — | Reference |
| `intent_examples_only` | 218/296/327/104 | 11 | 17 / 5 | Reject |
| `no_example_vocabulary` | 218/296/327/105 | 11 | 22 / 8 | Reject |
| `bounded_prefix` | 238/289/311/102 | 14 | 230 / 189 | Reject |
| `content_query` | 224/285/304/105 | 17 | 249 / 180 | Reject |

All four policies also break the holdout capture ceiling. Each one fails the gate without reference to the seven flips.

`content_query` raises holdout top5 from 29 to 38 and passed rows from 24 to 27. Do not act on this. The holdout is frozen and blind. The policy also raises captures to 17 and lowers extended top1 from 93 to 75.

## Is a general repair sound?

Not from these four policies, and not in this round.

- The two example policies remove evidence that accepted rows depend on. Eight SCF and protocol card grades fall with them.
- The two lexical policies rescore the whole catalog. They are redesigns, not repairs.
- The three wrong admissions share one pattern. The query matches the **topic** of an example (`lending`, `real-world`, `payroll app`) and not its **action** (`crowded`, `judged`, `vet`). The one correct admission matches the action (`want`, `build`, `exists`). The token `stellar` is necessary for the two-token witness in one wrong admission (`getClusters`), and it counts toward a second (`getHackathon`). The primary report states the first point. Both points are hypotheses for the item at `.agents/TODO.md:138`. Neither is tested.

The stopped search is the correct result.

## Untested scope

- The narrower example policy in F2.
- The 70 ungraded reorders in F1. No review has judged them row by row.
- Answer quality. No QA run and no live call measured the effect of any rank change.
- The interaction of the two new operations with exposure policy.
- A joint restore of all `x-routing` text at once. Each ablation restores one entry, or two for the joint cases.

## Changes the primary report needs

1. Add the F1 scope statement and the hidden regressions. Include them in any list of named risks.
2. Replace "the hypothesis is rejected" readings for the example policies with "the tested policy is rejected" (F2).
3. Qualify the streaming verdict and confirm the label owner path (F3).
4. Make the gate recommendation one statement: no normal re-baseline, and acceptance is an owner exception. State the cost of the hold (F4).
5. Change "partly" to "entirely" for the StellarX cause (F5).
6. Add the `main` comparison counts (F6).

Items 1, 2, and 4 are material. Items 3, 5, and 6 are corrections.
