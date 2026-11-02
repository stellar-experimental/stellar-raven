# Assumption attack — lane rt-g (2026-11-02)

Read-only. No candidate was measured. No tracked file was edited. The amendments below stand or fall on the contract text, the runner, and the current scorer. They do not use a result from this round.

Sources: `contract.md`, `brief-common.md`, `brief-a.md`, `brief-b.md`, `.agents/TODO.md` (the structured-routing item and the enum-token item), `.agents/rounds/2026-10-28-routing-repair/impl/failure-analysis.md`, `.agents/rounds/2026-10-28-routing-repair/impl/acceptance.mjs`, `src/catalog/search.ts`, `src/catalog/vendor/search-scoring.ts`, `scripts/build-catalog.mjs`, `scripts/description-notes.mjs`, `src/policy/scout-exposure.ts`, `eval/gates.json`, `eval/run-routing.mjs`, `wrangler.jsonc`, `.github/workflows/ci.yml`, `AGENTS.md`.

## Verdict

The contract lets a score-laundering candidate through. The lax parts are the cross-lane `W − L`, the blanket one-count drop, cause class (b), the count-only interference rule, and the permission to move floors. A5 is too strict: it puts a veto back on every fresh-source row and cancels the named-row demotion on the source that changed. Dropping all of check 8 is wider than the evidence. Checks 1–6 are probes. Passing them does not prove a general scorer. Named-row demotion matches the owner's principle only inside one lane, and only for a metric that already has floor slack. A hybrid that calls Workers AI on the search path cannot be gated by this CI, and A7 does not satisfy the paid-call rule.

## 1. Score laundering

### W − L is undefined, and the natural reading is too lax

A2 says to count graded wins W and graded losses L and require `W − L ≥ 0`. It does not say which keys, whether one row can be both, or whether lanes add. The old helper's grade object has `top1`, `top3`, `top5`, `cardHit5`, `any1`, `any3`, `any5`, `forbiddenCapture`, and `pass` (`acceptance.mjs` `gradeKeys`). Accept-either is a second grading (`eval/run-routing.mjs` header).

Two readings both launder:

- One net label per row. Forty rows can flip up and forty can flip down. The net is zero. Each gate metric can still fall by one. The page the repair was for can lose, paid for by easy rows.
- A sum across lanes. Legacy can gain five and holdout can lose four. The sum passes. `eval/run-routing.mjs` lines 423–428 say the holdout exists so that a gain in one metric cannot pay for damage in another. A cross-lane net is that payment.

The first preference among passers is the larger `W − L` summed over both sources. That pays a design to churn rows until the net looks good. The owner's principle was to avoid fitting one case. It was not to maximize flips. The smaller diff is last in the list, so it never breaks a tie that churn already won.

### The one-count budget copies one slack cell onto every series

`eval/gates.json` accepted totals and floors, read on this tree:

| Series | Accepted | CI rule | Room for a drop |
| --- | --- | --- | --- |
| Legacy top1 / top3 / top5 | 218 / 294 / 327 | ±3 (`bandPct` 1, n=338, `Math.round(3.38)` = 3) | CI allows 3. A2 allows 1. |
| Legacy cardHit5 | 113 | Not checked | A2 allows 1. CI will not see it. |
| Skills top1 | 17 | Floor 17 | None. A2 allows 1. Shipping needs a lower floor. |
| Skills top3 / top5 / cardHit5 | 23 / 23 / 23 | Not checked. Saturated at n=23 | A2 allows 1. |
| Holdout top1 | 12 | Floor 12 | None. A2 allows 1. |
| Holdout top3 | 27 | Floor 26 | One. This is the only historical Groth16-shaped room. |
| Holdout top5 | 30 | Floor 29 | One. |
| Holdout cardHit5 | 30 | Same value as top5 | Not a second budget. `run-routing.mjs` line 333 sets holdout `cardHit5 = top5`. |
| Holdout forbidden captures | 10 | Ceiling 10 | None. A2 does not mention them. |
| Holdout `passed` | 25 | Not checked | Unbounded under A2. |
| Extended top1 / top3 / top5 / cardHit5 | Not in `gates.json` | Not checked | A2 allows 1 on each. |

The runner's holdout comment says there is no ±band because one case is 2% of n=49, and the floors are the frozen first measurement. A2 gives every series the slack that comment refuses. Decision B was about one holdout rank loss. After the Mintlify re-baseline, holdout top3 already has that one count of slack (27 against floor 26). A2 is not required for that cell. It becomes harmful when the same −1 is applied to cells that sit on their floor.

A6 then moves floors to the candidate's measured values when they stay inside A2. That is how a skills top1 drop from 17 to 16, or a holdout top1 drop from 12 to 11, becomes the new law. `gates.json` `holdoutNote` says not to tune the holdout and not to edit failed cases. A floor edit that hides a loss is that tune. The CI command is `npm run eval:routing -- --gate` on unmodified `gates.json` (`.github/workflows/ci.yml`). A contract pass that still fails that command is not a pass. A contract pass that becomes a CI pass only after A6 edits the floors is a re-baseline.

Legacy's CI band is ±3, which is looser than A2's −1. A candidate can fail A2 and pass CI, or pass A2 and fail CI. The contract never says the two must agree. The gap is the laundering slot.

### Cause class (b) accepts the failure the holdout was built to catch

A3(a) is a real class: substring, stopword, prefix, or schema-only evidence. A3(b) is "a different entry now ranks higher on legitimate evidence." The vendor scorer gives a prefix match weight 2 and a raw substring weight 1 (`src/catalog/vendor/search-scoring.ts` lines 85–90). Any of those tokens can be called legitimate in a sentence. Nothing in A3 requires a token list, a field, or a score delta. The lane writes the cause. The orchestrator can recompute W, L, and A4 from the JSON. It cannot recompute A3. A loss caused by new spurious evidence fails only if the author does not call it legitimate.

Class (b) also has no boundary with the holdout. The runner says the holdout catches a scorer that rescues one family by taking another's territory. Class (b) is that rescue, renamed.

### A4 counts identities out of the guard

The 2026-10-28 D2 guard was the same rows and no better rank. A4 keeps the count only. A design can drop one hackathon capture and add a worse one, or move the same capture from rank 5 to rank 1, and the count holds. `locateSource` is in `OPTIONAL_EXCLUDED_SCOUT_OPERATIONS` and is excluded on the accepted manifest. "Where exposed" is then a zero. The clause does not fire. Forbidden captures are the interference metric the gate already computes, and A4 does not include them. They sit on the ceiling (10 = 10). A dense rerank can raise them, pass A1–A5, and fail CI. A6 does not list that ceiling as a floor it may move, so the lane can also claim the ceiling is free to move. The contract should close that reading.

### A5 puts the veto back

A5 says the candidate may have no graded loss on the fresh source that the unchanged scorer lacks. The unchanged fresh diagnostic had no graded loss. Every new fresh loss is fatal, and A3 does not apply. Main may lose rows under the aggregate. Fresh may not. Damage moves onto main, and the fresh source stays frozen even when the defect is in the fresh text. That is the named-row veto again, one source wide.

### Check 8

Dropping the exposure change is safe. `GET /api/rwa` stays in `EXCLUDED_SCOUT_OPERATIONS`. The repair must not expose it. Issue #167 and the three `it.fails` markers can stay.

Dropping the measurement is not safe. Two different bars were bundled:

- Four discovery positives and the ordinary negatives. They are passing tests in `test/drift-141-routing.test.ts` lines 162–182. The 2026-10-28 failure analysis says the best designs already passed these. They are a general exposure bar for an injected entry.
- Three mixed-intent controls. No design passed them. They are single queries. Treating them as a veto is the overfitting the owner refused.

The contract drops both. Production stays safe only while the test file stays. A7 says to update a test that encodes a named-row expectation changed by an accepted loss. That sentence reaches the RWA tests and `test/search.test.ts` line 1039, which the failure analysis names as the witness that schema-only `scout.getRfps` admission is still load-bearing. An edit there removes the witness.

There is a second trap. `it.fails` fails the suite when the assertion starts passing. A general repair that also clears the three mixed controls cannot pass `npm test` unless those markers are removed. The contract forbids removing them. The lane must preserve the three bugs, or avoid any rule that fixes them. That is a per-case exception written into the acceptance rule.

### Checks 1–6 are probes

The contract says a scorer that lets `has` match inside `phase`, or lets `through` route alone, is wrong for every query. The helper does not test that general claim.

| Check | What `acceptance.mjs` actually asserts |
| --- | --- |
| 1 | `extractRoutingPhrases` keeps the tokens `yieldblox` and `reflector` in a synthetic cap of 6, and one corpus question still has `scout.searchResearch` in the top five. Extractor behavior, plus presence. Not a grade. |
| 2 | The four strings `through`, `network`, `each`, and `walk through` do not return `scout.searchResearch`. Other operations are free. The failure analysis says `is` / `an` / `also` / `app` captures remained on designs that passed this check. |
| 3 | The query `contract` does not return `scout.explainRepo`. One longer query does. |
| 4 | One account-merge question, with and without `use`, keeps `stellarDocs.search_docs_in_category` and omits `scout.hackathonBrief`. |
| 5 | Adding the keyword `phase` does not change the score of `has widgets`, and `status` / `phase` / `value` score null. One word. |
| 6 | Two named corpus rows (the staking question and `q-tool-wallets-kit`) plus a synthetic page of five weak Scout entries. |

A guard on those strings passes A1. The current baseline note names a different class. `eval/gates.json` says the Mintlify losses come from short-token prefix and substring matches in Returns lines: `url_without_anchor` with `with`, `type` with `types`, `lvl1` with `1`, and `in` as a prefix of `integration`. Checks 1–6 do not mention those tokens. The vendor rule that produces them is general (`startsWith` either way, then `raw.includes`). A1 does not touch it.

Check 4 and the named half of check 6 are single rows. The contract reclassified them as mechanism vetoes. A general repair that moves the wallet row fails A1. A narrow repair that special-cases that row passes. That is the overfitting decision C refused, kept inside the "general" set.

## 2. Named-row demotion

The demotion of checks 7, 9, 11, the Groth16 rank, and strict check 12 matches "do not overfit any single case" when the replacement is a per-lane non-regression on the strict keys. It does not match it when the replacement is a cross-lane net plus a one-count drop on every series.

It conflicts with the gate rule the repo already runs. `eval/run-routing.mjs` lines 423–428: holdout floors have no band, a gain cannot pay for a loss, and moving a floor is a re-baseline. `AGENTS.md` does not use the sentence "no re-baseline to hide a regression." The runner and `gates.json` `holdoutNote` do. A6 is a re-baseline path. Decision B did not delegate a floor change. The orchestrator added one.

The clean 2026-10-28 parent is not a reason to loosen this further. That parent lost more than the Groth16 row (OpenZeppelin, Friendbot, fresh x402). A per-lane `W − L ≥ 0` rejects that parent. That rejection is right. What is wrong is a rule that forces the lane to add a second mechanism until some other rows go up. Brief-a design a2 is that second mechanism: the short-page fill. The 2026-10-28 analysis says F3 changed the effective short-page quota from 6 to 2, broke pure order, and caused the interference growth. The contract does not state pure order. A4 will not see a swap of equal count. The preference for a larger `W − L` selects the fill.

## 3. Hybrid dense retrieval

Brief-b keeps lexical candidate generation and the gate tiers, then adds a dense score. That shape cannot fix the lexical failure class. Prefix and substring matches act at admission (`search-scoring.ts`). A target that never enters the gated pool never receives a dense score. Dense rerank only reorders whoever the gate already admitted. Design b2 is a veto on low similarity, which removes candidates. It does not add the missed one. The 2026-10-28 note asked for new mechanism evidence. A fusion on the surviving pool is still a lexical admission design.

### CI cannot gate a live embedding call

`searchCatalog` and `searchCatalogPage` are synchronous (`search.ts` lines 1183 and 1559). `eval/run-routing.mjs` imports them in Node and grades a pure function. CI permissions are `contents: read`. The workflow has no Cloudflare token. The AI binding does not exist in that process.

A runtime `env.AI.run` on the search path leaves three CI outcomes:

- The Node run always takes the lexical fallback. CI gates the fallback. The hybrid numbers are not the CI numbers.
- The run calls Workers AI. CI cannot do that with this workflow.
- The run reads a committed query-vector cache. The cache covers the 544 questions and misses the mechanism probes, the 149 probes, and every production query. Production is a different function from CI.

Workers AI can change a hosted model without a repo commit. One count of movement fails `--gate`. There is no model hash in the tree. The August 2026 retrieval note already required a frozen model and a vector fingerprint before this kind of index (`research/qa-deep-dive-2026-08-25/grok-xhigh.md`). That note is evidence, not an instruction. The constraint it names is still unmet.

### The fallback hides the candidate

A7 requires a bounded timeout and a deterministic lexical fallback. On timeout, error, empty vector, or a NaN cosine, the user gets the lexical page or a broken sort. Nothing in the MCP response says which function ran. The accepted scores are the model scores. The scores under a hung binding are the fallback. A load-dependent timeout makes search not a pure function, so the same query has two legal pages. Require the unmodified gate to pass on the fallback alone. Under the contract's own preference, a lexical passer then beats the hybrid. A hybrid that passes only while the model answers does not pass.

### Cost, latency, and the paid-call rule

`wrangler.jsonc` lines 30–33: the AI binding is for `/playground` chat, and the MCP surface never touches it. `AGENTS.md` lines 128–129: a paid or side-effecting model operation needs host-side request-context approval, elicitation, and budget enforcement before it can ship. A query embedding on every `search` is a paid call on the unauthenticated tool path. There is no per-request elicitation that makes sense there, and there is no budget on that path. The playground gateway spend limit does not cover a new call site. A7 names `globalOutbound: null` and a timeout. `globalOutbound: null` is the sandbox rule (`src/executor/run.ts`). The host binding is already outside the sandbox. A7 answers the wrong rule. The lane's USD 5 cap does not bound production.

Search today is an in-process loop over the manifest. An embedding round trip adds a network wait to every search. A short timeout makes the fallback the common path. A long timeout stalls MCP search when the binding hangs. Either way, the measured dense page is not the page CI or production reliably serves.

### Determinism of the lane's own report

Document vectors committed at build time go stale when catalog text changes. `npm run build` does not rebuild the catalog (`AGENTS.md`). The CI sync check rebuilds the catalog and will not know about a vector file until the check lists it. Lexical scoring then sees new text and dense scoring sees old vectors. Query vectors from a live model are not a function of the repo. The orchestrator can recompute W and L from saved JSON. The next CI run will not reproduce them.

### Fitting the fusion weight on legacy is tuning a gate

Brief-b says to choose any free parameter on the legacy lane only, and to leave holdout and extended untouched until evaluation. Legacy is 338 of the graded rows and it is a CI gate. Choosing the weight there fits the gate. One later look at holdout losses, followed by a new weight, is a second fit. The contract does not forbid either. Pre-register the fusion constants in the design file before the 544-row run. Do not change them after a loss appears.

### Dense makes the enum-token bug semantic

`scripts/build-catalog.mjs` `schemaTextParts` pushes every string enum value into operation keywords. The open TODO names the fresh-source result: `anchor`, `dex`, `rpc`, `indexer`, `off`, `others`, plus example tokens such as `stellar`, `building`, `use`, `show`, and `pay`. A lexical repair can refuse those as schema-only. An embedding of the same text treats `rpc` as near an RPC question. A4's count can stay flat while the captured rows change. The builder is outside both lane briefs.

## 4. What both lanes will miss

1. The live defect named on the current baseline is short-token prefix and substring matching in Mintlify Returns lines (`gates.json` note). The 2026-10-28 parents were measured on Algolia-era docs text. Replaying c4p does not aim at `with`, `types`, `1`, or `in`.
2. Three title snapshots exist. Current main holds the old snapshot. The gates note says 666 to 973 titles adds two graded losses and 47 top-five order changes. The archive fresh source has 682 titles. Neither lane measures the 973-title snapshot. A pass does not clear that hold or issue #223.
3. Scout on current main is held at 1.9.61. The archive fresh source is 1.9.111. `src-scout` in the failure analysis passed a losses-only reading with exclusions still in place. A scoring pass is not an absorb authorization. The contract should say that in one line.
4. `SKILL_DESCRIPTION_OVERRIDES["skills.stellar-dev.dapp"]` still strips "Blux is also an option." The comment in `scripts/description-notes.mjs` says to remove it when short tokens cannot match alone. A6 forbids a new override and does not require this measurement. Both lanes will score the overridden text and can report a pass that still depends on the exception.
5. The enum and example harvest above. Lane A edits the scorer. Lane B embeds the harvest. The second TODO stays open, and dense makes it harder to see in an A3 sentence.
6. Pure page order. Brief-a says to keep it. A1–A7 do not state it. Design a2 is the fill that broke it.
7. `analyzeHackathonSubmissions` and `getHackathonSubmission` are optional exclusions, not a scoring victory. A candidate that leaves the builder alone keeps the fresh-source captures ready for the day the hold ends.
8. Protocol-history is outside A2 and outside CI. Check 1 does not grade that lane. A scorer change can break it and still pass. The TODO already marks that diagnostic source-expired, so this is a gap only if the lane claims the diagnostic is covered.
9. The acceptance helper parses `const rows = [...] as const` out of `test/drift-141-routing.test.ts`. Checks 1, 4, and 6 call those queries. An A7 edit to that array changes the probes and the grades together. Freeze the file.

## Amendments

Each reason is a property of the rule or the repo. None needs a candidate score.

G1. Pin the baseline commit. Compare A2 with a remeasured unchanged scorer at that commit, on current main and on the frozen archive source. Do not read `gates.json` accepted totals as the baseline. State that a pass does not authorize the Scout 1.9.111 absorb, the 973-title absorb, or closing issue #223.

G2. Define a win and a loss on strict keys only: `top1`, `top3`, `top5`, and `cardHit5` for legacy, skills, and extended. Holdout `cardHit5` is `top5`. Do not count it twice. Do not count `any*`, `pass`, or accept-either. One true→false is one loss. One false→true is one win. A row may contribute both. Require `W − L ≥ 0` inside each lane on each source. Do not add lanes together.

G3. A metric may fall by one only where the committed floor already has that slack. That is holdout top3 (27 against 26) and holdout top5 (30 against 29). Holdout top1, skills top1, forbidden captures, and every saturated skills metric may not fall. Legacy cardHit5 and every extended metric may not fall. They are outside the CI gate, so a one-count drop there is silent.

G4. A pass includes `npm run eval:routing -- --gate` on unmodified `gates.json`. Remove A6's permission to move floors in the shipping change. The one-count holdout slack already in the file is the only room. A floor edit that makes a loss legal is a re-baseline.

G5. Replace A3 prose with a token trace. For each loss, name the tokens and fields whose contribution changed. Class (a) is a removed substring, stopword, prefix (`startsWith`), or schema keyword that missed a word boundary. Class (b) is a promoted entry whose new decisive tokens are whole query tokens in its description, a routing phrase, or its operation id, and the loss adds no forbidden capture. A new substring, prefix, stopword, or schema-only contribution fails the candidate. The orchestrator checks the trace against saved per-hit scores.

G6. Prefer fewer strict-key flips, then fewer A3 losses, then no model call on the search path, then the smaller diff. Remove "larger `W − L`" as a preference. It rewards churn.

G7. Restore D2 as a set. The multiset of row id, operation id, and rank for non-hackathon hackathon captures must not gain a row or a better rank. Apply the same rule to `locateSource` while it is excluded, so a later exposure is not an empty clause. Holdout forbidden captures must not increase.

G8. Use G2 and G5 on the fresh source. Delete the rule that every fresh loss is fatal. Keep one absolute exclusion: do not expose `reviewSubmission`, `getRwaAssets`, `getQualityReport`, `verifyClaim`, or `locateSource`, and do not let `reviewSubmission` appear in a top five.

G9. Split check 8. Keep the four discovery positives and the ordinary negatives as vetoes. Keep the three mixed controls as diagnostics, not as bugs the candidate must preserve. Freeze `test/drift-141-routing.test.ts` against A7 edits.

G10. Keep checks 1–6, and label them probes. Add one synthetic probe for the current defect: a token of length 1 or 2, and a prefix or substring pair (`in`/`integration`, `type`/`types`, `1`/`lvl1`), must not admit an entry and must not change its score. State that passing 1–6 does not close the class.

G11. On a full gated page, ungated fill must not change gated membership except by the existing replacement rule, and must not change the relative order of gated hits. Equal interference counts do not prove this.

G12. Measure once with `SKILL_DESCRIPTION_OVERRIDES["skills.stellar-dev.dapp"]` removed. If any graded page changes, the candidate fails G10 or it does not pass. Add no new override.

G13. A hybrid may be reported. It ships only if `searchCatalog` stays a pure function with no model call. The lexical fallback must pass unmodified `--gate` by itself. A design that passes only while the model answers is not accepted. Declare any fusion constants before the 544-row run, and do not retune them. A7's timeout does not meet `AGENTS.md` lines 128–129 or the `wrangler.jsonc` playground-only binding note.

G14. If a lane builds vectors anyway, pin the model id and the dimensions, embed the exposed manifest only, and add the file and a fingerprint to the generated-artifact sync. Do not embed pre-exposure inventory or the enum harvest as if it were intent.

G15. A7 may change a unit test only when the test asserts an old score for a token the G5 trace removed. Do not edit the `getRfps` schema-admission witness or the RWA tests under that sentence.

## What should stay

Pre-registration before any candidate result is the right shape. Refusing to ship when nothing passes is the right default. Forbidding new overrides, label edits, and expected-answer edits is the right hard line. Keeping RWA, quality, verify, and `reviewSubmission` unexposed is the right exposure line. "No model call beats one" is the right preference, and G13 makes it a gate.
