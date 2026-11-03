# Attack reconciliation — model-ranking contract v1, before any measurement

Author: lane b-amend (Claude Opus 5.5 high), for the coordinator t16, on 2026-11-03.

Inputs:

- `contract.md` v1, SHA-256 `0ec05f5fa1850e12000c9947239cb75cb425ee471bcb4be8ece11fcd9930f0c0`, and its three
  companions at the hashes in v1 section 8. Byte copies of all four v1 files are in `v1/`.
- `tmp/attack/attack-argon.md` (Gemini 4 Argon high, findings A1–A24).
- `tmp/attack/attack-kimi.md` (Kimi K3.1 Pro high, findings K-01–K-23).

No candidate of this round was built or measured. This lane read no candidate result. Each verdict rests on
the repository at `e530c7f4` or on a property of the rule. The amendment ids (N1–N24) refer to "Amendment 1"
at the end of `contract.md`.

## 1. Repository checks

This lane checked each cited claim against the code before it decided. The checks that decide a verdict:

| Claim | Result | Evidence |
|---|---|---|
| The legacy gate is a two-sided band | True | `eval/run-routing.mjs:418-421` uses `Math.abs(o[k] - g.legacy[k]) > band`; `bandPct` 1 gives ±3 |
| `--dump-ranked` omits holdout and non-id fields | True | `eval/run-routing.mjs:461-466` dumps `perCase`, extended, skills, protocol history; ids only |
| Only holdout rows carry `forbidden_cards` | True | `eval/routing-cases.json` and `eval/skills-cases.json` rows have no such field |
| 156 legacy rows have no operation-level card | True, reworded | Every legacy row has `expected_cards`, but 156 hold only service-level `_mcp` cards (`eval/lib/grade.mjs` `isServiceLevelCard`); `cardN` is 182 |
| Strict top-k is a service-level metric | True | `gradeCase` in `eval/lib/grade.mjs` compares `hit.service` only |
| The runner result omits `question` | True | `runCase` in `eval/run-routing.mjs:240-252` writes id, service, grades, and `topHits` only |
| `q-scf-ecosystem-listing-partner-jobs` is a non-hackathon victim | True | Its question has "hackathon sponsor"; its card is `scout_projects`; `.agents/TODO.md:191` names it |
| Exposed hackathon operations | 5 on main | `compareHackathons`, `getHackathon`, `getHackathons`, `hackathonBrief`, `searchHackathonBuilds`; fresh adds 2 |
| `confidence.topScoreGap` uses `hit.score` | True | `src/catalog/search.ts:1291` |
| An all-backfill page enables `widerCandidates` | True | `src/catalog/search.ts:1496-1499` |
| Gibberish must give no hits | True | `test/search.test.ts:116` |
| Advisory search recurses with two arguments | True | `src/catalog/search.ts:1281`, `1298` onward |
| `scoreCandidates` applies `rejectsRoutingIntent` and `admitsWholeSkill` for every score function | True | `src/catalog/search.ts:741-770` |
| `serviceQuota(10)` is 4, `serviceQuota(5)` is 2 | True | `src/catalog/scoring.ts:559-561` |
| Unit tests call two-argument `searchCatalog` | True | `test/drift-141-routing.test.ts:20`; `it.fails.each` at line 188 |
| Smoke tests run with remote bindings off | True | `test/smoke/vitest.config.ts:64` |
| `registerTools` gets no caller key; API-key callers get no artifact owner | True | `src/server.ts:76-83`, `110-118` |
| `npm run eval:protocol-history` exits 1 on `source-expired` | True | `eval/run-protocol-history.mjs:61-70` |
| The routing runner's protocol-history lane uses `eval/protocol-history-cases.json` | True | 8 positive and 4 control cases (`eval/run-routing.mjs:71`, `355-372`) |
| Check 6 uses synthetic catalogs | True | `.agents/rounds/2026-10-28-routing-repair/impl/acceptance.mjs` (`scout.weak0`–`4`, `docs.walletDapp`) |
| `eval:discovery:replay` runs offline | False | `eval/discovery/run-replay.mjs` posts to a running MCP server; lanes may not start one. Its 91 stored queries in `eval/discovery/mined-lumenloop-queries.json` carry `expectedFamilies` and `acceptableOps`, so they can run offline |
| Morph lexical alone hurts skills and holdout | True | `report-rt-c.md` lines 87–94: skills 17/23/23 → 9/17/19, holdout 12/27/30 → 9/17/18 |

## 2. Verdicts

Verdicts: **accept** (adopt as proposed), **accept-modified** (adopt the intent with a different mechanism,
reason given), **reject** (no change, reason given). Duplicate findings share one row.

| Findings | Claim (short) | Verdict | Evidence and reason | Resolved by |
|---|---|---|---|---|
| A1, K-03, K-04 | Class (m) excuses every model-caused loss; it has no relevance check and no rule for combined evidence | accept-modified | Confirmed: (m) holds by construction when the lexical scorer is unchanged, and 483 of 532 graded rows have no forbidden list. K-03 asks for a blinded human judgment. That is slow and subjective. A1's label test is mechanical and uses the repo's own labels. The new test uses no model value, so it is the same for single and combined evidence. Unlabelled model losses count against the candidate with a cap. The demoted entry is now defined for service-level losses. | N3 |
| A2, K-01 | Selection over about 89 variants and post-hoc family f components fit the graded rows; no untouched confirmation set | accept-modified | Confirmed: `candidates.md` section 8 picks components by Q score, which includes holdout and extended. K-01 asks for a new corpus. A seeded, stratified partition of graded rows does the same job now and needs no new authoring. One finalist is chosen on the development part only. Extended, holdout, and the confirmation part run only for that finalist. The primary set has 8 variants with fixed components. | N1, N2 |
| A3, K-05 | The +10 minimum counts nested key flips; three rows can pass; gain can come only from extended | accept-modified | Confirmed: top1 ⊂ top3 ⊂ top5, so one row can give four wins. The new rule counts distinct net-win and net-loss rows on the gated lanes only (legacy and skills). The confirmation part uses an exact one-sided sign test. A1's extra top1 rule is not adopted: the row rule and Q2 already cover it. | N4 |
| A4 | `rel(e)` has no absolute floor; GATE admits entries on gibberish and narrow filters; admission bypasses `notFor`; gated admission hides `widerCandidates` | accept-modified | Confirmed in code. GATE moves to the exploratory tier, because a fix needs a new similarity floor constant that no prior evidence sets. Every model admission now has three guards: no admission when the lexical list is empty, `rejectsRoutingIntent` always holds, and model-admitted entries are `backfill`. Model admission may bypass `admitsWholeSkill`; the reason is in N13. | N1, N13 |
| A5 | POOL-ALL makes `total` and `truncated` wrong; RRF and PURE keep lexical scores in model order, so `topScoreGap` is wrong | accept | Confirmed at `src/catalog/search.ts:1286-1292`. `total` counts lexical entries plus model-only entries on the page. RRF and PURE pages report `topScoreGap: null`. | N13 |
| A6, K-06 | R6 and Q9 run on repeat 1 only; the lower-Q rule can pick the higher main repeat; a lane can recapture a failed repeat | accept | Both repeats gate every rule. The committed fixture is repeat 1, fixed now. Selection uses the lower value of the two repeats. An append-only capture manifest records every attempt. Recapture needs a recorded infrastructure failure. | N5 |
| A7 | Family b keeps the old lexical scorer in fallback, so it cannot close the lexical TODO item | accept | True by R3. No candidate of this round closes "Preserve structured routing intent across extraction caps and gate tiers". | N21 |
| A8 | `--gate` rejects a legacy gain above +3 | accept | Confirmed. Assisted candidates are judged from result JSON on both sources. Only fallback mode runs `--gate`. The shipping assisted profile uses floors, not a band. | N9 |
| A9, K-17 | The proposed `AGENTS.md` text allows one model, so family f cannot ship; it points future changes at this frozen contract | accept | New text allows the pinned model set of the accepted variant, under one total timeout and one total cost bound. A later change needs a new pre-registered contract. | N10 |
| A10 | `f-gr` admissions sort below the first K entries | accept-modified | The defect is real. `f-gr` moves to the exploratory tier. Its pool definition is fixed anyway, so a later round can use it. | N1, N13 |
| A11 | Ties, zero probabilities, even-length median, rounding, and `L_ungated` are undefined | accept | Each rule is now defined. `L_ungated` uses `scoreCandidates`, so it keeps `rejectsRoutingIntent` and `admitsWholeSkill` (confirmed at `src/catalog/search.ts:741-770`). | N13 |
| A12, K-21 | The dense validity screen penalizes skills hits and rejects complementary evidence | accept-modified | K-21 is right: dense-only accuracy does not measure fused value. Embedding spend is small. The screen becomes a diagnostic and drops no variant. A12's operation-only form is reported beside the v1 form. | N23 |
| A13 | The question-token rule makes the canonical victim a "hackathon row"; reviewSubmission has no "hackathon" token; the runner output lacks labels | accept | Confirmed. Hackathon operations are an exact id set. A hackathon row is a label property only. `compare.mjs` reads the corpus files for labels. Q4 scans every graded lane. `reviewSubmission` stays under Q5. A per-row exception for the skills hackathon row is not added, because the label rule is general. | N15 |
| A14, K-07 | The fresh source has no pinned manifest hash; the skills manifest splice is ambiguous | accept | The coordinator builds fresh once and records the archive, input, and manifest SHA-256 values before any candidate run. Every lane stops on a mismatch. | N6 |
| A15, K-08 | `--dump-ranked` cannot prove fallback identity | accept | Confirmed. A new `--dump-pages` flag deep-compares complete `SearchPage` objects on every lane, every probe, and every slice. | N7 |
| A16 | Invalid outputs can hide losses and enter the CI fixture; entry vectors have no rule; the denominator is undefined | accept-modified | Entry vectors must be 100% valid. The denominator is query keys. Deterministic encoders (families a, b, d) need zero invalid or error keys in the committed fixture. Clef keeps the 1% ceiling, because fallback grading on those rows is what production does. | N14 |
| A17, K-11, K-12 | Character estimates and the reranker query count understate tokens; the two ceilings are merged; a search with several calls is not priced as one | accept-modified | One search is priced as the sum of every call. Tokens come from reported usage or the model's published tokenizer. The reranker counts the query once per context. The worst case bounds only the query (user input) by UTF-8 bytes; card text is fixed, so its tokens are measured exactly. A token cap inside the Worker (K-11) is not needed with that bound. | N12 |
| A18, K-10 | Latency omits CPU, idle gaps, cold calls, and worst-case pools; percentiles and timeouts are undefined; lexical runs twice or after the wait | accept-modified | In a Worker, `Date.now()` advances only across I/O, so CPU must be measured on the host and added. Windows add idle-gap calls and worst-case requests. Percentiles are nearest-rank, and timed-out calls count. A second colo is not available to the coordinator; production telemetry after deploy is the guard. The lexical stage runs once, during the model wait. | N11, N20 |
| A19 | The fixture omits synthetic probe catalogs; "protocol history" is ambiguous; `eval:protocol-history` exits 1 | accept | Confirmed in code. The fixture covers synthetic and injected entries and their pools. R10 "protocol history" names `eval/protocol-history-cases.json`. `source-expired` with exit 1 satisfies Q11. | N16 |
| A20 | Unit tests and the RWA vetoes run only in fallback mode in CI | accept | Confirmed. A new committed test file runs the vetoes and probes in assisted mode from the fixture. `test/drift-141-routing.test.ts` stays frozen and tests fallback. The v1 Q6 instruction to remove an `it.fails` marker is withdrawn. | N16 |
| A21 | No caller key reaches MCP `search` or API-key `codemode.search`; no reason for the per-execute cap; smoke tests have no `AI` binding | accept | Confirmed in code. The design threads a caller key and adds `execute-cap`. Smoke tests default to `lexical`. | N19 |
| A22 | The cache URL has no version; writes are not off the critical path; `rankingModelMs` is null on colo hits; hits count against the execute cap | accept | Adopted as proposed. | N18 |
| A23 | The advisory recursion is unspecified in assisted mode | accept | The advisory search stays lexical, with no model call. | N20 |
| A24, K-09 | No filtered, limit-10, or short-query measurement | accept-modified | Four diagnostic slices with non-regression vetoes. `eval:discovery:replay` needs a running server, which lanes may not start. Its stored queries run offline instead. | N8 |
| K-02 | The CLI-captured fixture may differ from the Worker binding path | accept-modified | The finalist's full key set is replayed once through the probe Worker and gateway, and compared with repeat 1. Capturing every variant through the Worker would need the coordinator's secret for every lane. | N17 |
| K-13 | Clef partial-output rules differ across harness, runtime, and R6a | accept | One shared validator for capture, CI, and production. | N14 |
| K-14 | Same-id model drift can be fixed by fixture regeneration | accept | A canary failure switches the runtime to `lexical` and needs a new round. | N17 |
| K-15 | Late, invalid, or partial outputs could enter the shared cache | accept | Only validated outputs that arrive before T are cached. | N18 |
| K-16 | No combined fallback ceiling; gateway limits are unsigned; the alert is optional | accept-modified | A 2% combined ceiling applies to the failure kinds that the probe can observe (timeout, error, invalid). Budget and rate-limit refusals cannot occur in the probe. The owner signs the gateway and caller limits before deploy, not before acceptance, because they are runtime settings. The alert is mandatory before deploy. | N19 |
| K-18 | The shipping gates omit extended and `cardHit5` metrics that Q2 protects | accept | Every Q2 metric joins both shipping profiles as a floor. | N9 |
| K-19 | `f-bdr` escapes the full Q7 bar | accept | The full bar applies to every variant with lexical mode `morph-schema`. | N21 |
| K-20 | Q9 fails on a harmless page change | accept | G12's intent is "must not need the override". A strict-key loss against the candidate's own result measures need. Page changes stay a diagnostic. | N22 |
| K-22 | The shared-cache key is a dictionary-reversible query hash | accept | The Cache API key is an HMAC with a host secret. The offline fixture key stays SHA-256. | N18 |
| K-23 | The spend guard is not atomic across concurrent calls and lanes | accept | One round ledger with an exclusive lock reserves spend before dispatch. | N24 |

No finding is rejected outright. Three parts of findings are not adopted, each with its reason in the row:
K-01's new corpus (N2 uses a partition), K-03's blinded human judgment (N3 uses labels), and A24's live
replay run (N8 runs the stored queries offline).

## 3. Guidance points from the lane brief

| Guidance | Adopted as | Note |
|---|---|---|
| Cut variants to ≤ 8 primary, fixed from prior evidence and published defaults | N1 | 8 primary variants. Every other v1 variant is exploratory and cannot ship. |
| Untouched confirmation split; holdout and extended never feed selection, also for family f | N2 | `partition.json` is generated now by `partition.mjs`. Family f components are fixed in N1. |
| Replace class (m) or cap it; define it for combined evidence | N3 | Both: a label-relevance test, and a cap on unlabelled model losses. |
| Minimum effect on distinct rows; gain on gated lanes; repeat rules | N4, N5 | |
| Freeze fresh by manifest SHA-256; prove fallback identity on full pages | N6, N7 | |
| Filtered searches and limit 10 as non-regression diagnostics | N8 | |
| Gate-band conflict and the `AGENTS.md` text | N9, N10 | |
| Latency with idle gaps and end-to-end time; cost of one complete search | N11, N12 | |

The lane found no repo evidence against any guidance point. One point needed a choice: family b is not in the
primary set. The reason is prior evidence: morph lexical alone lowered skills top1 from 17 to 9 and holdout top1
from 12 to 9 (`report-rt-c.md`), and its fallback keeps the old scorer (A7).
