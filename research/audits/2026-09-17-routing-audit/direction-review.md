# Routing direction and authority audit at 848edec4

- Mode: read-only audit. Fixed point: `848edec4`, clean tree, `main`.
- Actions not taken: no runtime changes, no paid calls, no secret contents, no upstream messages, no Git changes, no new servers, no nested agents, no other pane control.
- Exclusions: holdout cases (`eval/holdout-cases.json`) and reviewer-only holdout evidence were not read. No QA corpus case under `eval/qa/corpus/` was read.
- Path note: the task named `src/catalog/retrieval-profiles.ts`. That file does not exist. The profile data lives in `scripts/catalog-data/retrieval-profiles.mjs`, and `attachRetrievalProfiles` in `scripts/build-catalog.mjs:1045` attaches it to `catalog/manifest.json` at build time.

## 1. Reproduction details

Commands used (all read-only):

```
git rev-parse --short HEAD                     # 848edec4
node -e '<project catalog/manifest.json: id, lane/emptyScope, notFor, routingKeywords count, alias>'
git log -S"<symbol>" --format='%h %ad %s' --date=short   # rule provenance
awk '/These hits are composable/{print length($0)}' src/mcp/tools.ts   # nextSteps length
npx vitest run --root <scratchpad>/clip   # clip.test.ts imports src/mcp/tools.ts and writes string lengths and slices at 1700..2300
```

Measured facts:

| Item | Value |
|---|---|
| Operations in manifest | 60 (18 lumenloop, 30 scout, 12 stellarDocs) |
| Whole skills | 20; sections 202, all `searchable: false` |
| Operations with `retrievalProfile` | 37 of 60 (historical text said 39; corrected 2026-09-17) |
| Operations with `routingExclusions` (notFor) | Scout only (29 of 30 Scout ops; `scout.resolveProject` has none) |
| `SEARCH_DESCRIPTION` length | 4,887 chars; the 2,048 clip lands inside workflow step 6 (prior-art) |
| `EXECUTE_DESCRIPTION` length | 9,684 chars; the clip lands inside the first rule (globals); all later rules are invisible to a 2KB client |
| `BASE_SERVER_INSTRUCTIONS` length | 1,977 chars; `SERVER_INSTRUCTIONS` 7,864; a 2,048 client sees 71 chars of the micro-map |
| `nextSteps` base string | 2,517 chars, `src/mcp/tools.ts:451`, sent in both `text` and `structuredContent` |
| Micro-map token estimate | 1,472 (`src/mcp/micro-map.ts`) |

Rule provenance (from `git log -S`):

| Symbol | Introduced |
|---|---|
| `VOCABULARY_INTENT_TOKENS`, `FRESHNESS_INTENT_TOKENS`, `isPersonIdentityQuestion`, `discriminativeDirectoryVocabularyCoverage`, `rejectsRoutingIntent`, `preserveStrongBackfill` | `022970d5` 2026-09-16, PR #168 (Scout 1.9.52 acceptance) |
| `KNOWN_ALIAS_PACKS` | `c2428488` 2026-08-27, PR #73 |
| `EVIDENCE_OPERATION_IDS` | `5c51c06a` 2026-08-13, PR #23 |
| `BUILD_AUTHORITY_SKILL_ROLES` | `03064257` 2026-07-13 |

Unprofiled operations (23; historical text said 21): `lumenloop.find_similar_projects_semantic`, `get_categories`, `get_document`, `get_project_tags_vocabulary`, `get_regions`, `get_related_projects`, `get_scf_submissions`, `get_tags_vocabulary`, `list_research`; `scout.analyzeEcosystem`, `compareHackathons`, `explainRepo`, `getChangelog`, `getChanges`, `getClusters`, `getLeaderboard`, `getPartner`, `getSkill`, `getStatus`, `hackathonBrief`, `listSkills`, `matchPartners`, `resolveProject`.

## 2. Traces

### Exact-ID resolution
- Public `search`: `service` validated against `catalogServices` (`src/catalog/search-resolution.ts:63`); unknown value returns `isError: true`, zero hits, and the valid list in `nextSteps` (`src/mcp/tools.ts:400`). `kind` is a Zod enum. `recoverFrom` ids must be exact operation ids; skill ids are rejected (`search-resolution.ts:77`).
- Sandbox `codemode.search`: same stages, error envelopes instead (`src/executor/providers.ts:800-870`). `codemode.describe` exact id only (`providers.ts:571`). `skill.read` and `skill.run` exact ids with a nearest-id suggestion, never a resolution (`src/skills/store.ts:145,217`, `src/skills/run.ts:257`). Sandbox function names come from id terminal segments; wrong names fail through the Proxy.
- Conclusion: exact-match holds on every surface. No fuzzy path found.

### Search constraints, quotas, recovery
- `searchCatalogPage` (`src/catalog/search.ts:1156`): clamp limit 1..50 default 10; gated pass; `diversifyByService` with quota `max(2, ceil(0.4*limit))` (`src/catalog/scoring.ts:542`); ungated backfill only when the gated page is short; then `preserveStrongBackfill`, `preserveIntentWithinServiceQuota`, `interleaveSelectedPage` (1.6x margin), then `prioritizeDatedSemanticForFreshness`.
- Operation admission before scoring: `rejectsRoutingIntent` (`search.ts:509`) uses `routingExclusions`, which only Scout entries carry.
- Whole-skill admission after scoring: `admitsWholeSkill` (`src/catalog/skill-search-admission.ts`).
- `widerCandidates` (`search.ts:1440`): only on zero-hit or all-backfill operation pages, plus one directory anchor for one-content-token queries with no operation-name token match. Directory anchor = most inbound directory-to-directory edges (`scout.searchProjects`; under a lumenloop filter, `lumenloop.search_directory`). Broad anchors = one winner per lane by inbound count (research, semantic, corpus, av). Person-regex reorders advisories on all-backfill unfiltered pages.
- `recoveryMetadata.serviceFilterExcludedSkills`: a second skills-only search whenever `service` is not `skills` and `kind` is not `operation`.
- `recovery`: exact-id graph walk from `recoverFrom`, filtered by `reason`, cap 3.

### Execute grounding
- Op ledger per call (`providers.ts:412-470`): outcome, `hasServiceData`, allowlisted metadata.
- `summarizeOperationLedger` (`run.ts:163`) counts `candidateEvidence` and `priorArtCandidates` from the hand list `EVIDENCE_OPERATION_IDS` (`run.ts:129`).
- `evidenceRecoveryHint` (`run.ts:192`): returns nothing if any successful op is unprofiled; broad lane (semantic/research/av/corpus) gives `conditional-alternatives`; else `emptyScope: "operation"` gives `narrow-only`.
- Tool boundary (`src/mcp/tools.ts:526-565`): appends up to four blocks: EVIDENCE RECOVERY or SERVICE ERRORS, CANDIDATE EVIDENCE, PRIOR-ART CANDIDATES, EVIDENCE CHECKPOINT, then logs. Prior-art requires a build-authority skill read in the same run plus a prior-art op call.
- Truncation and artifacts: `truncateForModel` then a source-basis block (`run.ts:400-470`, `src/policy/source-basis.ts`). The block also appears on non-truncated results when any op returned allowlisted metadata (`data.count` etc.). Artifact guidance names `codemode.artifact.read` only when available; API-key and playground calls never get an owner, so the artifact line is always absent for them.

### Playground steering
- `DEMO_SYSTEM_PROMPT` = full `SERVER_INSTRUCTIONS` + `DEMO_PREAMBLE` (`src/demo/prompt.ts`). Caps: 7 steps, 3 searches, 3 executes, search limit clamped to 6, default page 5 (`src/demo/budget.ts`, `src/demo/tools.ts`).
- `prepareDemoStep` (`src/demo/steps.ts:126`): final step is tool-free; a recovery note is injected when the latest execute is failed, truncated, evidence-poor, hint-bearing, or when the state is navigation-only (search with no execute yet).

## 3. Findings (severity order)

### H1. Two host blocks contradict each other on one execute
> STATUS (2026-09-17): WITHDRAWN as a logic contradiction. Kept below as the historical observation. See section 8. Residual: wording overlap only (Low).
- Paths: `src/executor/run.ts:129-139,163-181`, `src/mcp/tools.ts:526-545`, `src/policy/evidence-checkpoint.ts:24-41`.
- Evidence: `EVIDENCE_OPERATION_IDS.candidate` includes `lumenloop.search_directory` and `scout.searchProjects`. Both carry profile lane `directory`, `emptyScope: "operation"`. A run that calls only one of them and gets rows produces `candidateEvidence: 1` (CANDIDATE EVIDENCE block: "This run used 1 semantic, research, A/V, or fallback-directory call(s)") and a `narrow-only` hint (EVIDENCE CHECKPOINT: "the host did not observe a semantic, research, A/V, or corpus-wide candidate lane").
- Consequence: the model receives two opposite statements about lane class on the same run. The candidate set is a second source of truth beside `retrievalProfile.lane`. `find_content_about_project` (lane semantic) is not in the candidate set; `search_docs` (lane corpus) is not; `find_similar_scf_submissions` is.
- Repro: unit call of the execute tool with a stub runner whose ledger has one `lumenloop.search_directory` ok row with rows; assert both markers in the text. `test/server.test.ts:1337` and `:1345` already pin each block separately.

### H2. The evidence checkpoint silently vanishes for the micro-map's own compositions
> STATUS (2026-09-17): CORRECTED. The abort is justified for the narrow-only mode. Count corrected to 23 unprofiled (37 profiled), not 21 (39). Kept below as the historical observation. See section 8. Residual: conditional-alternatives mode is also suppressed (Low).
- Path: `src/executor/run.ts:213` (`if (successfulIds.some((id) => !byId.get(id)?.retrievalProfile)) return undefined;`).
- Evidence: 23 of 60 operations are unprofiled (list above). [Historical text said 21; corrected in section 8.] The project/funding archetype in `scripts/catalog-data/workflow-archetypes.mjs` ends with `lumenloop.get_scf_submissions` (unprofiled). Any run following that archetype gets no checkpoint. Same for runs touching `get_document`, `explainRepo`, `getClusters`, `analyzeEcosystem`, `getLeaderboard`, `getStatus`.
- Consequence: hidden narrowing of ADR-0007 guidance to a subset of compositions; the playground latch then never fires for those turns. `test/server.test.ts:1300` pins the abort as intended behavior.

### H3. Family authority contradicts itself across client-visible surfaces
- Paths: `scripts/catalog-data/workflow-archetypes.mjs:45-56` (`FAMILY_LINE`, `AUTHORITY_RULES`), `src/mcp/tools.ts:250-262` (search workflow), `src/mcp/tools.ts:296` (execute skills bullet), `src/mcp/micro-map.ts`, upstream descriptions of `scout.searchResearch` and `scout.searchProjects` in `catalog/manifest.json`.
- Evidence:
  1. `FAMILY_LINE` (inside the 2,048-char visible search prefix): lumenloop = "community/editorial projects, research, content, SCF/funding; use for what's-been-said/editorial/freshness skims". `SERVICE_FAMILY_PURPOSES` (micro-map, beyond the 2,048 instruction clip): lumenloop is "Primary for project dossiers, funding or SCF context". Claude Code sees only the first.
  2. `EXECUTE_DESCRIPTION` skills bullet: "purely factual questions use docs first". `AUTHORITY_RULES[2]`: "for ecosystem facts (funding/awards/amounts, program names, coverage/directories, who-builds-what, adoption), start Scout/Lumenloop even when docs mention the topic".
  3. Upstream `scout.searchResearch` description: "THE surface for 'how does X work', 'what does the SEP/spec/audit say', and how-to/feasibility questions". `scout.searchProjects`: "Not for docs, standards, or how-to/reference knowledge -> use searchResearch". `AUTHORITY_RULES[1]` says Scout research is community-aggregated and standards claims stay unverified until Stellar Docs corroborates. The catalog note on searchResearch softens but keeps the upstream claim.
- Consequence: an agent on a 2KB client is steered toward docs for ecosystem facts and toward Scout research for spec questions, opposite to the authority table it cannot see.

### H4. Four query-shape rules from PR #168 key on vocabulary or prose rather than structure
- Path: `src/catalog/search.ts`.
- Rules:
  - `vocabularyIntentCoverage` (`:786`): fires when the description contains "controlled vocabulary" or matches `/\bdistinct\b[^.\n]*\bvalues\b/` and the query has one of eight `VOCABULARY_INTENT_TOKENS`. Matches four lumenloop vocabulary ops. Pinned in `test/drift-141-routing.test.ts:145-160`.
  - `discriminativeDirectoryVocabularyCoverage` (`:465`): requires a catalog-unique token present in `useWhen` and `exampleQuestions` but absent from `purpose` and `keywords`, plus one input-enum witness. The acceptance ledger states the Soroswap token appears in two source routing fields and the query matches the `DEX` enum. The general directory rule changed 140 lists and was rejected; this fingerprint changed 1-2.
  - `FRESHNESS_INTENT_TOKENS` + `prioritizeDatedSemanticForFreshness` (`:1108-1140`): with two or more freshness tokens, a dated semantic op swaps above an `exact`-lane op. All three pinned queries are Blend TVL (`test/drift-141-routing.test.ts:239-244`).
  - `isPersonIdentityQuestion` (`:1421`): regex `^who (is|was) <Capitalized words>` on all-backfill unfiltered pages reorders advisories. Pinned to "Who is Tyler van der Hoeven?" (`test/search.test.ts:356`).
- Consequence: page membership and advisory order depend on description prose and word lists that mirror the pinned examples. Each rule adds a branch to a page-shaping path that already has five stages.

### M1. Negative-intent admission applies to Scout only
- Path: `src/catalog/search.ts:509` (`rejectsRoutingIntent`), `scripts/build-catalog.mjs:666-681` (x-routing extraction).
- Evidence: only Scout publishes `x-routing`; 29 Scout ops carry `routingExclusions`; no lumenloop or stellarDocs entry can be rejected before scoring.
- Consequence: a per-service asymmetry in admission that is driven by upstream data availability, not by policy. Not documented as such in `ARCHITECTURE.md` section 2.

### M2. Build-authority roles cover 4 of about 10 build playbooks
- Path: `scripts/build-catalog.mjs:798-803`.
- Evidence: roles on `skills.stellar-dev.{smart-contracts,dapp,standards,data}` only. `skills.openzeppelin-stellar.{develop-secure-contracts,setup-stellar-contracts,upgrade-stellar-contracts}`, `skills.trustless-work.trustless-work-dev`, `skills.stellar-dev.{agentic-payments,zk-proofs,assets,cross-chain}` have none.
- Consequence: a design-stage run that reads an OpenZeppelin skill and calls `scout.searchRepos` gets no PRIOR-ART block, while the same run with `smart-contracts` does.

### M3. The prior-art rule has five model-facing copies
- Paths: `src/mcp/tools.ts:262` (search step 6), `:296` (execute bullet), `:451` (nextSteps), `:551` (PRIOR-ART block), `workflow-archetypes.mjs` (Design/build/integrate archetype).
- Evidence: the search step 6 straddles the 2,048 clip (chars ~1,990-2,400) and spends the tail of the visible prefix.

### M4. `nextSteps` is a 2,517-char static restatement on every hit page
- Path: `src/mcp/tools.ts:451`; mirror in `src/demo/tools.ts`.
- Evidence: sent in both `text` and `structuredContent`; about 5KB of every hit response is fixed prose that repeats the descriptions and instructions. `search` telemetry `responseChars` already measures it.

### M5. The known-alias pack is one entity on one operation
- Paths: `scripts/catalog-data/known-aliases.mjs`, `src/catalog/search.ts:344` (`entryScoringName`), `test/search.test.ts:70-90`.
- Evidence: one pack (WisdomTree/CRDT/CRDYX) attached to `lumenloop.find_content_by_entity`, receipts under `research/qa-deep-dive-2026-08-25/receipts/`.
- Consequence: the mechanism is general and receipt-gated, but the sole instance is an entity-specific routing rule.

### L1. Playground steering carries failure-specific sentences and a routine "recovery" note
- Paths: `src/demo/prompt.ts` (preamble), `src/demo/steps.ts:154-163` (navigation-only triggers a recovery note after the first search), `src/demo/tools.ts:232-245` (AST preflight for `Promise.all({})`).
- Evidence: preamble sentences on XLM prediction pivots, `region`/`country`/`description` field names, "top 5-8 named rows", and the Promise.all array rule.

### L2. Demo clamps search `limit` to 6 while the schema advertises 50
- Path: `src/demo/tools.ts` (limit clamp), `src/demo/budget.ts:maxSearchLimit`.

### L3. SOURCE METADATA block appears on most non-truncated executes
- Paths: `src/executor/run.ts:400`, `src/executor/providers.ts:130-160` (allowlist includes `data.count`, `data.total`).
- Evidence: `lumenloop.search_directory` returns `count`, so any run that calls it appends the block.

## 4. Rule inventory: per-service and per-operation rules outside core scoring

| Rule | Location | Class | Verdict |
|---|---|---|---|
| `RETRIEVAL_PROFILES` (39 ops) | `scripts/catalog-data/retrieval-profiles.mjs` | mechanism | justified (ADR-0007); coverage gap is H2 |
| `EVIDENCE_OPERATION_IDS` candidate (6 ids), prior-art (3 ids) | `src/executor/run.ts:129` | hand list | unjustified duplicate of lanes (H1) |
| `BUILD_AUTHORITY_SKILL_ROLES` (4 skills) | `scripts/build-catalog.mjs:798` | hand list | partial (M2) |
| Broad-pass op table (4 ids) | `BASE_SERVER_INSTRUCTIONS`, `EXECUTE_DESCRIPTION` | prose | justified; matches `catalogBroadAnchors` winners today; third copy |
| `SCOUT_MISS_HINT` (4 ids) | `src/adapters/scout.ts:34` | adapter hint | justified, service-scoped |
| Lumenloop text-format hint (2 ids) | `src/adapters/lumenloop.ts:111` | adapter hint | justified |
| Stellar Docs soft-empty hints | `src/adapters/stellar-docs.ts:465,504` | adapter hint | justified |
| `LUMENLOOP_DESCRIPTION_NOTES` (3 ops), Scout notes, one skill override | `scripts/description-notes.mjs` | per-op prose | justified where they correct upstream facts (`data.ok`, `created_at`); the `search_content_semantic` note is routing steering that also feeds lexical scoring |
| Model-contract corrections (3 lumenloop ops) | `scripts/catalog-data/model-contract-corrections.mjs` | per-op | justified (ll-019) |
| Workflow archetypes (12) | `scripts/catalog-data/workflow-archetypes.mjs` | orientation | justified as data; direction conflicts with `FAMILY_LINE` (H3) |
| `KNOWN_ALIAS_PACKS` (1 entity) | `scripts/catalog-data/known-aliases.mjs` | per-entity | unjustified instance (M5) |
| `QUERY_TOKEN_ALIASES` (5 tokens) | `src/catalog/scoring.ts:323` | domain | justified |
| `rejectsRoutingIntent` thresholds | `src/catalog/search.ts:509` | mechanism | general in form; Scout-only in effect (M1) |
| `vocabularyIntentCoverage`, directory fingerprint, freshness reorder, person regex | `src/catalog/search.ts` | query-shape | unjustified/narrow (H4) |
| `routingConceptToken` (`token`->`asset`, `-ing` stem) | `src/catalog/search.ts:365` | heuristic | low; domain |
| Service quota `max(2, ceil(0.4*limit))` | `src/catalog/scoring.ts:542` | structural | justified |
| Demo caps (7/3/3, limit 6, page 5) | `src/demo/budget.ts` | cost | justified |
| `deriveServiceFilterExcludedSkillAdvisories` | `src/catalog/search.ts:1268` | advisory | justified |
| SOURCE_METADATA allowlist | `src/executor/providers.ts:130` | structural | justified; volume is L3 |

## 5. Directional contradictions and hidden narrowing (summary)

1. Candidate block vs narrow-only checkpoint on directory runs (H1). WITHDRAWN 2026-09-17: consistent by ADR-0007 design; wording overlap only.
2. Checkpoint aborts on any unprofiled success; archetype compositions never get it (H2). CORRECTED 2026-09-17: abort justified for narrow-only; residual applies to conditional mode only.
3. `FAMILY_LINE` vs `SERVICE_FAMILY_PURPOSES` on lumenloop authority; only the first is visible to a 2KB client (H3).
4. "purely factual questions use docs first" vs "start Scout/Lumenloop for ecosystem facts" (H3).
5. Upstream Scout self-routing ("THE surface", "-> use searchResearch") vs Raven docs authority (H3).
6. Scout-only pre-scoring rejection (M1).
7. Build-authority cue fires for 4 skills only (M2).
8. Demo limit clamp vs advertised max (L2).

## 6. Smallest general simplifications, user failures, controls, hypotheses

| Id | Change | Concrete user failure today | Fresh control | Testable hypothesis |
|---|---|---|---|---|
| S1 (H1) WITHDRAWN 2026-09-17 (see section 8) | Move candidate and prior-art classes into `RETRIEVAL_PROFILES` as fields; delete `EVIDENCE_OPERATION_IDS`; `assertExecutorEvidenceOperationIds` becomes a profile check | A run of `search_directory` only gets "used a candidate lane" and "did not observe a candidate lane" in one result | Unit test: no execute text contains both markers; routing gate untouched (no scoring change) | Zero contradictory block pairs across the smoke and server suites; QA sample unchanged |
| S2 (H2) WITHDRAWN 2026-09-17 (see section 8) | Profile all 60 operations (lane per op); delete the unprofiled abort at `run.ts:213` | Project/funding archetype (`search_directory` -> `get_project` -> `get_scf_submissions`) returns empty and no checkpoint appears | Ledger unit test `[search_directory ok-empty, get_scf_submissions ok]` yields `narrow-only`; existing `test/server.test.ts:1300` re-baselined | Playground `recoveryHintedExecutes` / empty-success ratio rises; no new hint on closed-world detail runs |
| S3 (H3) | Generate `FAMILY_LINE` from `SERVICE_FAMILY_PURPOSES`; delete "purely factual questions use docs first"; add one build-time rewrite that drops upstream "THE surface" and "-> use <op>" cross-service clauses | 2KB client asks "who funded X" and starts at stellarDocs; asks "what does SEP-10 say" and starts at Scout research | Micro-map byte pins (`test/micro-map.test.mjs`); `test/mcp-instructions.test.ts` prefix pins; measurement needs the discovery agent arm or the playground lane (paid, approval required) | Family-first choice on ecosystem-fact questions shifts from stellarDocs to Scout/Lumenloop; no regression on protocol questions |
| S4 (H4) | Delete the four rules, or replace triggers with schema/lane facts (e.g. vocabulary = profiled `exact` lane with no free-text input; freshness = advisory only) | Page order depends on description prose and word lists; a freshness question about a non-Blend entity may or may not reorder | Free: `npm run eval:routing -- --gate`; count changed ranked lists; `test/drift-141-routing.test.ts` and `test/search.test.ts:356` consciously re-baselined | At most 4 of 495 lists move (the ledger's own count for these rules); holdout floors hold |
| S5 (M3, M4) | Keep the PRIOR-ART runtime block and the archetype; cut `nextSteps` to <=400 page-specific chars; drop search step 6 and the execute prior-art bullet | Every search response carries ~5KB of repeated contract text | `search` telemetry `responseChars`; server tests; `test/mcp-instructions.test.ts:92` re-baselined | QA sample-30 unchanged; median search response shrinks by ~5KB; prior-art adoption (`priorArtCandidates` with build skill read) unchanged in telemetry |
| S6 (M2) | Derive build authority per skill source (stellar-dev, openzeppelin-stellar, trustless-work) instead of per skill id | OpenZeppelin skill + `searchRepos` run gets no prior-art reminder | Landscape control: `stellar-ecosystem-scout` skill read + `searchProjects` still gets no cap | Prior-art block fires on all build-source skill reads with a Scout repo/project call |
| S7 (M5) | Delete the WisdomTree pack | One entity has a private routing path | Free: `searchCatalogPage({query:"CRDT"})` still returns `scout.searchProjects` as short-query-directory advisory; `test/search.test.ts:70` removed | The six alias queries still reach a usable route via advisory plus the BASE broad pass |
| S8 (M1) | Report per-service rejection counts before changing anything | Unknown count of Scout top-5 candidates removed pre-scoring | Free: instrument `rejectsRoutingIntent` over the routing corpora and the extended lane | If rejections exceed a stated share of Scout candidates, cap rejection to ties or lift the asymmetry |
| S9 (L1) | Remove navigation-only from the recovery-note trigger; keep the final-step policy | Every first search injects a "recovery" note into the system prompt | `test/demo-steps.test.ts` pins updated | Playground step counts unchanged; note frequency drops to real failures |

## 7. Scope coverage

Read in full: `src/mcp/tools.ts`, `src/mcp/micro-map.ts`, `src/executor/providers.ts`, `src/executor/run.ts`, `src/policy/evidence-checkpoint.ts`, `src/policy/source-basis.ts`, `src/catalog/search.ts`, `src/catalog/search-resolution.ts`, `src/catalog/skill-search-admission.ts`, `src/catalog/known-aliases.ts`, `src/catalog/types.ts`, all four `scripts/catalog-data/*.mjs`, `src/demo/prompt.ts`, `src/demo/steps.ts`, `src/demo/tools.ts`, `src/demo/budget.ts` (caps), adapter hint strings in `src/adapters/{scout,lumenloop,stellar-docs}.ts`, `PLAN.md`, `AGENTS.md`, both named skills, ADR-0007.

Read in part: `src/catalog/scoring.ts` (stopwords, aliases, quota, witness gate), `scripts/build-catalog.mjs` (routing attach, aliases, build roles, profile attach, leak guard), `scripts/build-micro-map.mjs` (head), `scripts/description-notes.mjs` (head), `ARCHITECTURE.md` sections 1-6, `eval/EVALS.md` (head), `.agents/TODO.md` and `.agents/NEXT.md` (heads), `.agents/rounds/2026-09-16-scout-acceptance.md`, `.agents/rounds/2026-09-16-truth-maintenance/scout-routing-deferrals.md` (head), test indexes for `test/search.test.ts`, `test/drift-141-routing.test.ts`, `test/mcp-instructions.test.ts`, and the person-advisory block of `test/search.test.ts:300-400`.

Not read: holdout cases, any QA corpus case, `src/catalog/vendor/*`, `src/server.ts`, adapter bodies beyond hints, `src/demo/chat.ts` body, `src/demo/page.ts`, `src/skills/store.ts` body, `src/executor/spec-sandbox.ts`, `src/policy/truncate.ts`.

## 8. Reconciliation (2026-09-17, after owner review)

### H1 withdrawn as a logic contradiction; kept as a wording overlap (Low)
ADR-0007 decision 2 states the checkpoint is rendered "independent of whether the operation belongs to the candidate-evidence allowlist". `src/executor/run.ts:205-209` states: "Candidate-evidence classification controls attribution guidance, not retrieval breadth. Directory candidates remain operation-scoped and may still need an exact wider recovery edge." The two blocks answer different questions: the CANDIDATE EVIDENCE block says the rows need identity, source, and date checks; the narrow-only CHECKPOINT says no broad lane ran yet. For `lumenloop.search_directory` (semantic fallback rows, lane `directory`) both statements are true at once. `test/server.test.ts:1337` and `:1345` pin each block on purpose. S1 (delete the hand list) is withdrawn.
Residual: the two blocks share the phrase "semantic, research, A/V" and the narrow-only block calls the missing thing a "candidate lane" (`src/policy/evidence-checkpoint.ts:39`). A reader sees "used a candidate call" next to "did not observe a candidate lane". This is a wording overlap only. A one-word repair ("broad lane" instead of "candidate lane" in the narrow-only sentence) removes the overlap without changing logic. Not proposed as code yet.

### H2 reclassified: the abort is justified for narrow-only; one residual gap remains (Low)
`src/executor/run.ts:210-213`: "An unprofiled successful operation may itself be a wider/candidate lane. Stay silent instead of making the stronger (and potentially false) claim that the host observed narrow lookups only." The narrow-only sentence asserts a fact about the whole run, so silence is correct when an unclassified success could be a broad lane (for example `lumenloop.find_similar_projects_semantic`, `scout.getLeaderboard`). S2 as written (profile all operations, delete the abort) is withdrawn; profiling everything would also require lane judgments the ADR does not authorize by default.
Residual: the abort runs before the broad-lane branch. When a profiled broad operation succeeded (for example `lumenloop.search_content_semantic`) beside an unprofiled success (for example `lumenloop.get_document`), the conditional-alternatives sentence "the host observed successful broad operation class(es) (X)" is still true, but the abort suppresses it. This is a hidden narrowing of the conditional mode only. It is small and bounded. No code proposed yet; a future change would only reorder the two checks.
Corrected count: 23 unprofiled operations, not 21. The list in section 1 was complete (9 lumenloop, 14 scout, 0 stellarDocs). Profiled: 37 (9 lumenloop, 16 scout, 12 stellarDocs). The earlier "39 of 60" figure was wrong.
Archetype note: `lumenloop.get_scf_submissions` is a slug-keyed detail lookup by its description. Its presence silences the checkpoint for the project/funding archetype. Whether it deserves a `detail` profile is a lane judgment for the owner, not a defect.

### H3: one minimal source-authority wording repair (no upstream rewrite, no profile field)
Real contradiction: `src/mcp/tools.ts:312` ends "Skip it for single-step how-tos and debugging; purely factual questions use docs first." `scripts/catalog-data/workflow-archetypes.mjs:51` (AUTHORITY_RULES) says ecosystem facts start at Scout/Lumenloop even when docs mention the topic. No test pins the tools.ts clause (grep over test/, src/, scripts/, eval/ finds only tools.ts:312). The clause sits at about character 5,000 of the execute description, so it is invisible to a 2KB client and visible to full-description clients.
Proposed repair (one clause, one file, `src/mcp/tools.ts:312`):
- Replace: "purely factual questions use docs first."
- With: "a factual question starts at the family that owns the fact: Stellar Docs for protocol, standards, API, and implementation wording; Scout or Lumenloop for ecosystem facts such as funding, programs, coverage, and who builds what."
Why this and not more: it restates AUTHORITY_RULES[2] in the one place that contradicts it. It touches no upstream description, no profile, no archetype, no base instructions, and no clipped prefix. Controls: `test/mcp-instructions.test.ts` (no phrase pin on this clause; the 2KB prefix pins are unaffected because the clause is beyond the clip), `test/demo-prompt.test.ts` and the ADR-0003 emitted-text guard (the new sentence names no operation id), and the routing gate (no scoring input changes). The FAMILY_LINE versus SERVICE_FAMILY_PURPOSES divergence in H3 remains a separate item and is not covered by this repair.

### Exact minimal wording proposal (verbatim, for a later implementation task)
File: `src/mcp/tools.ts`, line 312, last clause of the skills bullet in `EXECUTE_DESCRIPTION`.

Current text (end of bullet):
```
Skip it for single-step how-tos and debugging; purely factual questions use docs first.
```
Proposed text (end of bullet):
```
Skip it for single-step how-tos and debugging. A factual question starts at the family that owns the fact: Stellar Docs for protocol, standards, API, and implementation wording; Scout or Lumenloop for ecosystem facts such as funding, programs, coverage, and who builds what.
```
Scope: one clause in one file. No upstream description, no profile field, no archetype, no base-instruction, and no clipped-prefix change. Verification when implemented: `npm run typecheck`, `npm test` (covers `test/mcp-instructions.test.ts`, `test/demo-prompt.test.ts`, and the ADR-0003 emitted-text guard), and `npm run eval:routing -- --gate` (expected unchanged; the clause is not a scoring input).

### Reproduction of the reconciliation evidence
```
sed -n 40,50p research/decisions/0007-structural-recovery-guidance.md      # decision 2: checkpoint independent of allowlist
sed -n 200,215p src/executor/run.ts                                         # candidate vs breadth comment; unprofiled abort rationale
sed -n 1290,1345p test/server.test.ts                                       # both blocks pinned separately
node -e '<count entries with kind operation and no retrievalProfile in catalog/manifest.json>'   # 60 ops, 37 profiled, 23 unprofiled
grep -rn "docs first\|purely factual" test src scripts eval/*.mjs           # only src/mcp/tools.ts:312
```
Status: nothing implemented; nothing spent.
