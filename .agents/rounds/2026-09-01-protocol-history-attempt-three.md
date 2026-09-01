# Protocol-history routing — attempt three brief — 2026-09-01

## Scope

This round authors and reviews the attempt-three mechanism brief for the held routing block.
The block is the `.agents/TODO.md` item "`search` does not surface the research lane for
protocol-history questions". Attempt one (`clause-fit-hysteresis-v1`) and attempt two (`cross-encoder-fit-v1`) both ended as
reviewed measured `FAIL` on 2026-08-31. Attempt three is the last attempt in the box.

The brief must select one distinct general mechanism or record a justified hold. It must not
reuse the clause bi-encoder or the pairwise cross-encoder with hysteresis. It stays
measurement-only.

This round authorizes no model fetch and no model run. It authorizes no network call and no
paid call. It authorizes no production edit and no corpus-label edit. It authorizes no
frozen-contract edit, no gate edit, and no generated-artifact edit. The brief lane writes only
this ledger and its files under the round directory.

Out of scope: closeout edits to `.agents/TODO.md`, `.agents/NEXT.md`, `eval/README.md`, and
`eval/vectorize/README.md`. Those need a separate authorization after the review gates.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Evidence analysis | Codex, GPT-5.6 Terra, high (per the file's own title) | not recorded in this ledger | `2026-09-01-protocol-history-attempt-three/evidence-terra.md` | complete before brief authoring; recommends `HOLD`; names family 3 as the cheapest next measurement |
| Mechanism brief | Claude, Fable 5, high | this session | this ledger; `…/brief-fable.md`; `…/brief-reconciliation-fable.md` | revised after review; registers `clause-support-fit-v1` |
| Independent brief review | Grok, Grok 4.6, high | not recorded in this ledger | `…/review-grok-hold.md` | complete; verdict `BLOCK` |
| Brief reconciliation | Claude, Fable 5, high | this session | `…/brief-reconciliation-fable.md` | complete |
| Bounded delta review | Grok, Grok 4.6, high | not recorded in this ledger | `…/review-grok-hold-delta.md` | complete; verdict `BLOCK` on D1; D2–D6 residual |
| Second reconciliation | Claude, Fable 5, high | this session | `…/brief-reconciliation-fable.md` (appended) | complete |
| Second bounded delta review | Grok, Grok 4.6, high | not recorded in this ledger | `…/review-grok-hold-delta-2.md` | complete; verdict `PASS` |
| Implementation | Codex, GPT-5.6 Sol, high | not recorded in this ledger | section 11 files; `…/implementation-sol.md` | complete; all implementation gates passed |
| Independent implementation review | Grok, Grok 4.6, high | not recorded in this ledger | `…/review-grok-implementation.md` | complete; verdict `PASS` |
| Referee | to be assigned | pending | one local result under `eval/vectorize/results/` | pending; cache remains unopened |
| Closeout | to be assigned after the result | pending | `.agents/TODO.md`, `.agents/NEXT.md`, README sections | not authorized by this ledger |

Role record: Claude Fable 5 high authored the brief and the reconciliation. The root agent that
opened this worktree orchestrates; it is not the brief lane. Grok 4.6 high reviews and differs
from both.

## Route cards

### Mechanism brief

- Worker CLI: Claude
- Model: Fable 5
- Effort: high
- Reason: the lane needs product and measurement synthesis over two reviewed negative results.
- Reviewer: Grok 4.6 high, vendor-diverse. Fallback if Grok orchestrates: Codex GPT-5.6 Sol
  high, then Opus high as last resort. Record the lane used and why a matched lane was skipped.
- Report contract: one brief with pins, the mechanism decision, and the full pre-registration
  record.

### Independent brief review

- Worker CLI: Grok
- Model: Grok 4.6
- Effort: high; escalate to xhigh only after a high pass misses a real finding.
- Report contract: verdict `PASS` or `BLOCK` with numbered findings. The first review is
  `review-grok-hold.md`. The delta review is `review-grok-hold-delta.md`.

## Ledger

### 2026-09-01 — round opened

Worktree `next-protocol-history-attempt-three` at `HEAD`
`7c2c2857df1ed3696ec863eef3d2da80332c609c`, equal to `main`. `git status --porcelain` returned no
tracked change. The untracked directory `.agents/rounds/2026-09-01-protocol-history-attempt-three/`
already held `evidence-terra.md`. That file is 13,653 bytes. Its SHA-256 is
`18c92bf50f79559fdb0217fef0c465a01cc5e24d7d88728ab8d8137bd0ca24d7`. Its own commands table
records `mkdir -p` of that directory and read-only commands only.

This entry authorizes brief authoring only.

### 2026-09-01 — pins captured

`shasum -a 256` over the gated and protected inputs:

| Path | SHA-256 |
| --- | --- |
| `catalog/manifest.json` | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` |
| `eval/skills-cases.json` | `3ec4d90444489550f9ac9745384a4371cdbd0077dfc77a84597652d02f61ba1f` |
| `eval/holdout-cases.json` | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` |
| `eval/gates.json` | `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371` |
| `eval/protocol-history-cases.json` | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| `eval/run-routing.mjs` | `7b1e396b7db74dc7028bd6b6d1dd7fb51e9b6401f084a6bb0d58a326420eeed0` |
| `eval/run-protocol-history.mjs` | `bfaaf48969676492529b83a0fad19473891e0b359e47cedeeaa8ccfb616f68c0` |
| `eval/self-test.mjs` | `7543b7f7d818d12426c57bf65d6d7d87777994400995729abcacfe828aec9d0b` |
| `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `eval/vectorize/clause-config.mjs` | `39e0b2c42d845913541231dce90b8ecd0e949adc11c50eefea015b7cb291932e` |
| `eval/vectorize/clause-retrieval.mjs` | `a99e32319d27fe66c92887299971da257a1938073dececc095e7201c29c27cd9` |
| `eval/vectorize/rerank-config.mjs` | `2cb45a972ee6fc89f7bed13c795124a3a9e19485731b9e28c5538a5b12d4fe4d` |
| `eval/vectorize/run-rerank-fit.mjs` | `788a6df923c1ac844fc83b428bfe52a531cf1e134274a0d9e894adc34066487f` |
| `src/catalog/search.ts` | `04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` |
| `src/catalog/scoring.ts` | `b8c84cb0c73b89e1ae624bb449bc305fac313e03ee844026763c8735fe8ef548` |
| `src/catalog/vendor/search-scoring.ts` | `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` |
| `scripts/build-catalog.mjs` | `59bbc8f581a556c20085d1dc8257ab84e63803e170a37ed5af719d72a0c29c49` |
| `scripts/catalog-data/workflow-archetypes.mjs` | `beeea9b5ff48680e2f13a030dfd68f21f2d5c50ed4220733d8f1e6095a1b5c14` |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |

The four gated inputs equal their `eval/gates.json` pins. The upstream `x-routing` object at
`openapi.paths["/api/research"].get` hashes to
`468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` under `JSON.stringify`. It
holds 9 `useWhen`, 6 `exampleQuestions`, 91 `keywords`, and 2 `notFor`. The
`scout.searchResearch` manifest entry carries 176 `routingKeywords`. Its description hashes to
`80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43`.

`git diff --stat 1bfb983 7c2c285` over the protected paths printed nothing. The paths were
`src`, `catalog/manifest.json`, `scripts/build-catalog.mjs`, `eval/gates.json`,
`eval/routing-cases.json`, both frozen contract files, `eval/holdout-cases.json`,
`eval/skills-cases.json`, `eval/build-question-overlay.json`, `eval/run-routing.mjs`,
`eval/run-protocol-history.mjs`, `eval/self-test.mjs`, and `inventory/stellar-light.json`. The
two commits after the attempt-two revision (`#108`, `#110`) touched no protected path. The frozen
baselines therefore hold by hash equality without a re-run. They are original 4/8 and 1/4;
blind 3/11 and 6/9; legacy 208/279/311; skills 16/23/23; holdout 10/22/25 with 11 forbidden
captures.

The retained attempt-two cache directory
`~/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/` holds two files. They are
`…-cross-encoder-pair-scores.json` (6,263,125 bytes) and `…-cross-encoder-fit-v1.json`
(1,651,703 bytes). This round did not read them.

### 2026-09-01 — vocabulary reachability audit, vendor rules

The author wrote `reachability-audit.mjs` in the session scratchpad. Its SHA-256 is
`220b27d1d372a380f5436efb33a6d7da31a49022541496305c6ad14be211faa4`. The author ran
`node reachability-audit.mjs "$PWD"` from the worktree. The script reads `catalog/manifest.json`,
both frozen contract files, `STOPWORDS`, and the vendor `tokenize`. It loads no model and opens
no socket. It printed the three input hashes above. It then printed
`searchable entries: 79 target scored tokens: 338 target full tokens: 1300`.

Under the vendor's own match rules (exact token, prefix overlap with no minimum length, raw
substring), the summary was:

```
SUMMARY positives: { n: 19, withAbsent: 6, noRare: 11, meanRare: '0.79', meanCommon: '5.95' }
SUMMARY controls:  { n: 13, withAbsent: 0, noRare: 9,  meanRare: '0.31', meanCommon: '3.92' }
```

Observation: the target matched `archival` with `DF` 68, `after` with `DF` 66, `auth` with `DF`
72, `am` with `DF` 73, and `anchor` with `DF` 74. The vendor tokenizer keeps one-character
tokens. A description that contains `a` therefore prefix-matches every query token that starts
with `a`. This inflates reach and coverage. It is a property of the untouched vendored upstream
math. It is recorded as a single-source, monitor-only observation. No file changed because of
it.

`git status --porcelain` after the run showed only the untracked round directory.

### 2026-09-01 — vocabulary reachability audit, strict rule

The author derived `reachability-audit-strict.mjs` from the first script. It replaces the
matcher return line. The strict rule accepts an exact token. It also accepts a prefix overlap
where the shorter token has at least four characters. It uses no raw substring. Its SHA-256 at
that time was
`4d3ccfdb40d9214567e15f6838ce610b3f3e9d173b87eaf4e2d294c5d1f7b3e8`.
`node reachability-audit-strict.mjs "$PWD"` printed the same three input hashes. It printed the
same 79 / 338 / 1,300 counts. Summary:

```
SUMMARY positives: { n: 19, withAbsent: 17, noRare: 4, meanRare: '1.53', meanCommon: '3.37' }
SUMMARY controls:  { n: 13, withAbsent: 3,  noRare: 6, meanRare: '0.69', meanCommon: '2.62' }
```

Per-case results:

- `phb-whisk-forced-follow-up`: 0 of 8 content tokens match the target's full view.
  Catalog-absent: `rushed`, `whisk`, `eviction`, `matter`.
- `phb-clawback-origin-emergency-changes`: 0 of 7 match. Catalog-absent: `emergency`.
- `phb-second-cut-after-whisk`: 2 of 8 match (`protocol`, `live`). Catalog-absent: `cut`, `whisk`.
- `phb-cap-archival-fee-repair`: 2 of 9 match (`cap`, `pool`). Catalog-absent: `cleaned`,
  `eviction`, `stroop`, `repair`.
- `ph-control-current-protocol`: 5 of 5 match the target.
- `phb-control-cap-history-sep-support`: 5 of 5 match the target.
- Seven controls carry a rare (`DF <= 8`) target token: `vote`, `upgrade`, `bug`, `incident`,
  `exploit`, `reviewing`, `kyc`, `mortem`.

The complete per-case tables are in `brief-fable.md` section 3.2 and Appendix B. The raw
console outputs are session-local files in the scratchpad. They are not committed. The script is
reproduced verbatim in the brief's Appendix A.

### 2026-09-01 — first brief authored: hold recorded

Fable wrote the first `brief-fable.md`. It recorded a hold and left attempt three unused. Its
stated basis had four parts. It read the pure-fit readings as a class ceiling. It read the two
zero-overlap positives as a bound on comparators. It cited the control-side coupling. Its
disposition table marked Terra family 3 as not distinct. It pre-registered four reopen
triggers.

The brief authorized no fetch, no run, no network call, no paid lane, no production edit, no
contract change, and no closeout edit.

### 2026-09-01 — verification of the first brief lane

- `git status --porcelain`: only the untracked round ledger and round directory.
- Files written by this lane: this ledger and `…/brief-fable.md`. No other path.
- Commands run by this lane: `cat`, `sed`, `ls`, `grep`, `wc`, `shasum -a 256`, `git rev-parse`,
  `git status`, `git log`, `git diff --stat`, `node -e` over JSON files, and the two audit
  scripts. No `npm` command ran. No dependency install ran.
- Network: none. Model: none. Paid call: none. Cost: `$0`.

### 2026-09-01 — independent review returned BLOCK

Grok wrote `review-grok-hold.md` with verdict `BLOCK`. It reproduced the two zero-overlap results
and the 32-question summary on the pinned inputs. It confirmed that no protected path changed.
It found three blocking claims and four residual defects.

- B1: zero token overlap does not prove that a learned comparator cannot rank the target.
- B2: the pure-fit readings are max-clause readings of two models, not a class ceiling; the best
  measured blind top-five is 4/11; the attempt-two miss intersection is seven ids, and pure fit
  rescued `phb-auditor-auth-recursion-follow-up`.
- B3: Terra family 3 (aggregation over the retained pair scores without a hysteresis grid) is
  distinct and eligible; the hold closed the last attempt against it.
- R1: T3 did not pin the 76-case inventory or the 495-row membership.
- R2: the attempt accounting was easy to misread.
- R3: the brief and the ledger missed ASD-STE100 length and one-idea rules.
- R4: the strict script's header comment and one provenance sentence did not match the files.

The review did not authorize closeout. Repair and one bounded delta review were required.

### 2026-09-01 — reconciliation: measurement selected

Fable rewrote `brief-fable.md` in full and wrote `brief-reconciliation-fable.md`. Every finding
B1 to B3 and R1 to R4 is reconciled there, one section per finding.

Decision after reconciliation: register `clause-support-fit-v1`. It is Terra family 3 with one
fixed aggregate. The mechanism replaces the max-clause fit with noisy-OR over each entry's
positive clauses and negative clauses. The negative rule is unchanged. The ordering is a stable
descending sort of the attempt-two candidate union. There is no margin, no grid, and no
hysteresis sweep. The referee reads the retained attempt-two cache only. It loads no model and
scores no pair.

New facts recorded for the decision, all from read-only offline commands:

- `loadClauseSource()` from `eval/vectorize/clause-config.mjs` rebuilt 683 clauses at `HEAD`.
  It reported 608 positive and 75 negative clauses over 79 entries. Its three input hashes and
  its `clauseSetSha256` `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` match
  the artifact.
- `scout.searchResearch` has 25 positive clauses (1 purpose, 9 useWhen, 6 exampleQuestion, 7
  description, 2 workflow) and 2 negative clauses. It ranks first of 79 by positive clause
  count. The next entries are `scout.searchProjects` (21), `scout.analyzeEcosystem` (19),
  `scout.getBuilders` (19), `lumenloop.search_content_semantic` (18), and `scout.searchRepos`
  (18). Positive counts: min 2, median 6, mean 7.70, max 25. 25 entries carry a negative clause.
- QA regression inventory: 76 files under `eval/qa/corpus/battery/**` carry
  `scout.searchResearch` in their top-level `surface` array. The sorted-id list hashes to
  `c88940063e3306f6afa279e9f004a0824fd9de5c674895aa98c09a657008e17a`. One more file,
  `q-hist-yieldblox-v2-2026-exploit`, mentions the id outside `surface`. The battery holds 500
  JSON files.
- 495-row membership: legacy 338, extended 122, skills 23, original 8 positives, original 4
  controls. With holdout 49 and blind 20 the referee has 564 rows and 563 unique questions.

The predicted-fail reason without lexical overlap is recorded as risk P2 in the brief. A
support-growing aggregate raises the entry with the most clauses on every query. The max-clause
readings already captured 6 of 13 controls. The brief chose the measurement over that
prediction. The measurement is free, cache-only, and decisive.

R4 repair: the strict script's header comment was corrected. The code did not change. The
rerun reproduced the same two zero-overlap results and the same summaries. The corrected
script's SHA-256 is `7a30222b9f7ad215de8e06286d18865d4006803d0400419020018ae93edea0b7`. The
earlier hash `4d3ccfdb…7b3e8` stays in the strict-audit entry above as the hash at that time.

R3 repair in this ledger: the earlier entries above received sentence splits only. No fact,
number, hash, command, or verdict changed in them. The Scope section received the same repair.

Verification of the reconciliation lane:

- `git status --porcelain`: only the untracked round ledger and round directory.
- Files written by this lane: this ledger, `…/brief-fable.md`, and
  `…/brief-reconciliation-fable.md`. No other path.
- Commands run: `cat`, `sed`, `ls`, `grep`, `wc`, `shasum -a 256`, `git status`, `node -e` over
  `clause-config.mjs` and the battery JSON files, and the corrected strict audit script. No
  `npm` command ran. No model loaded. The retained cache was not opened. Network: none. Paid
  call: none. Cost: `$0`.

The next gate is the bounded delta review in `review-grok-hold-delta.md`. No implementation,
run, fetch, or closeout is authorized before it passes.

### 2026-09-01 — bounded delta review returned BLOCK on D1

Grok wrote `review-grok-hold-delta.md`. It found B1–B3 and R1–R4 repaired in substance. It
confirmed the noisy-OR math, the `m = 0` sort, the union, and the cache pins against the frozen
helpers. It ran 50 synthetic trials of `m = 0` against a stable descending sort with zero
mismatches. It did not open the cache.

It blocked on D1. Test 12 followed every relative specifier under `eval/`. That walk reaches
`run-rerank-fit.mjs`, which calls `import("./rerank-scorer.mjs")` and
`require("onnxruntime-node/package.json")` inside `main()`. A faithful walk would fail on a
correct referee. It listed five residual pins: D2, a local `shouldFail`; D3, the dynamic import of
`src/catalog/search.ts`; D4, the missing `rerank-retrieval.mjs` hash; D5, the literal
`result.experiment` string; D6, noisy-OR is not a calibrated probability.

### 2026-09-01 — second reconciliation applied

Fable repaired `brief-fable.md` for D1 to D6 only. The second reconciliation section is appended
to `brief-reconciliation-fable.md`.

- D1: test 12 now walks top-level static `import` declarations only. It does not follow
  `import()` or `require()` calls. It does not enter `main()`. Section 10 states the same rule.
- D2: section 11 adds a local `shouldFail` that inspects the support-fit reading only. Test 18
  names it. The referee does not import the attempt-two export.
- D3: section 10 names the one dynamic import of `src/catalog/search.ts`.
- D4: section 2 pins `eval/vectorize/rerank-retrieval.mjs` at
  `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116`. `shasum -a 256` on this
  `HEAD` returned that value.
- D5: section 9 states that `result.experiment` is the literal string `clause-support-fit-v1`.
- D6: section 5.3 calls noisy-OR a support-growing transform, not a probability.

No formula, union, cache pin, or acceptance value changed. No protected path changed. The
retained cache was not opened. No model loaded. Network: none. Paid call: none. Cost: `$0`.
`git status --porcelain` still shows only the untracked round ledger and round directory.

The next gate is the second bounded delta review in `review-grok-hold-delta-2.md`. It covers
the repaired test and import lines only.

### 2026-09-01 — second bounded delta review returned PASS

Grok wrote `review-grok-hold-delta-2.md` with verdict `PASS`. It reviewed D1 through D6 only.
It confirmed that every repair matches the reviewed contract.

Test 12 now walks top-level static `import` declarations only. The local `shouldFail` reads the
support-fit result. The dynamic catalog import is named. The union helper has a pinned hash.
The result uses the literal `clause-support-fit-v1` name. The brief does not call noisy-OR a
calibrated probability.

The formula, union, cache pins, acceptance values, and protected paths did not change. The
reviewer did not open the cache. It loaded no model and used no network or paid work.

This `PASS` authorized the section 11 implementation only. It did not authorize the referee or
the cache open.

### 2026-09-01 — implementation completed

Codex GPT-5.6 Sol high completed the reviewed section 11 write set. It wrote these paths:

- `eval/vectorize/run-support-fit.mjs`;
- `test/eval-vectorize-support-fit.test.mjs`;
- the `eval:vectorize:support:run` script in `package.json`;
- `2026-09-01-protocol-history-attempt-three/implementation-sol.md`.

The implementation preserved the formula, union, cache pins, and acceptance table. It also
preserved the result schema, local `shouldFail`, cache-only boundary, and one-referee rule.
Module import succeeds when `RAVEN_SUPPORT_CACHE_PATH` is unset.

File SHA-256 values:

| Path | SHA-256 |
| --- | --- |
| `eval/vectorize/run-support-fit.mjs` | `fbc059e455f5685b2a3866e766462ef35a80aecc63ad346eceba663c1b3004b5` |
| `test/eval-vectorize-support-fit.test.mjs` | `c2ee273d4c4682280ad6aff3c34c43d414e94459416687116a4437ab79af84b7` |
| `package.json` | `01b850a3f15d32c452ee113c72f590769c33132ad6e6ced76046a6a41201d8d1` |

Exact implementation validation results:

| Command | Exit | Result |
| --- | ---: | --- |
| `./node_modules/.bin/vitest run test/eval-vectorize-support-fit.test.mjs` | 0 | 1 file passed; 18 tests passed; 1.34 seconds |
| `npm run typecheck` | 0 | `tsc --noEmit` passed |
| `npm test` | 0 | 99 files passed; 1,579 tests passed; 15.91 seconds |
| `npm run build` | 0 | Wrangler dry run passed; total upload 6,990.49 KiB |
| `npm run secrets:scan -- --tree` | 0 | 1 commit and 173,077 bytes scanned; no leaks found |
| `npm run eval:selftest` | 0 | all checks passed |
| `npm run eval:compile` | 0 | 338 of 395 legacy; 122 of 144 extended |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS` |
| `git diff --check` | 0 | no output |

The routing gate kept the accepted totals. Legacy was 208/279/311. Skills was 16/23/23.
Holdout was 10/22/25 with 11 forbidden captures. Extended was 90/109/117.
Extended accept-either top-five was 122/122.

The routing command wrote the ignored local result
`eval/results/routing-2026-09-01T14-09-50-670Z.json`. It changed no tracked routing artifact.

The implementation did not run the referee. It did not open the retained cache. It loaded no
model and used no network or paid work. No commit was created.

### 2026-09-01 — independent implementation review returned PASS

Grok wrote `review-grok-implementation.md` with verdict `PASS`. The review covered brief
sections 5 through 14. It started from the final brief and inspected the implementation files.

The reviewer confirmed the noisy-OR fit and the unchanged negative rule. It confirmed the stable
sort, frozen union, cache checks, calibrations, result schema, and local `shouldFail`.
It confirmed that the static import graph has no model loader. It also confirmed one result write
from one `main()`.

The reviewer reran the focused suite. All 18 tests passed in 1.33 seconds. No forbidden path
changed. The reviewer opened no cache and ran no referee, model, or network call.

The review recorded four residual findings. None blocks the implementation handoff. Test 14 does
not execute the live parse order. The `-expm1` form equals the registered formula.
`sourceEnvironment` copies the complete cache environment. The later cache-directory copy remains
a closeout step.

The review requires a recorded 40-character implementation commit before the referee.

### 2026-09-01 — current state

The implementation is ready. The final delta and independent implementation reviews both passed.
The retained score cache remains unopened. Attempt three remains unspent.

The referee is pending. It cannot run until the implementation commit exists in the ledger.
The next authorized measurement is one referee invocation from that commit.

## Outcome

Open. The brief lane is complete after two `BLOCK` verdicts and two reconciliations. The final
delta review passed. The implementation and its independent review also passed.

The revised brief registers `clause-support-fit-v1`. It is a cache-only multi-clause aggregation
measurement. It has no grid and no hysteresis. This round has not spent attempt three.

The slot stays reserved for one referee run. The cache remains unopened. A 40-character
implementation commit must enter this ledger before the referee.

Pending, in order: the implementation commit; the single referee; result verification by Codex
GPT-5.6 Terra high; and a separately authorized closeout.

No production routing change ships from this round. No `improvements/` finding applies: the
evidence measures this repository's catalog text and ranking, and the data remains reachable
upstream. The vendor short-token prefix observation stays monitor-only.
