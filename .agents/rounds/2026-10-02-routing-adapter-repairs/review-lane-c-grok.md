reject

Reviewer: Grok. Author: Codex frontier `gpt-6-astra` (`lane-c-astra`). Orchestrator: Claude Fable 5.1 (`raven-next`).

Pinned base: `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`. HEAD equals that commit. The lane diff against the pin is uncommitted and is only `src/catalog/scoring.ts` and `test/scoring.test.ts` (143 insertions, 6 deletions).

`origin/main` moved during this review to `af740db5` (`scout: map a failed backend read to an error, not data (#219)`). A fresh `git diff origin/main` now also shows the reverse of that commit. That reverse is outside this lane. The verdict uses the pinned base.

## Findings

### 1. blocker — A 3–6 letter initialism admits unrelated rank-1 hits

`prepareAcronymForms` (`src/catalog/scoring.ts:290-308`) replaces a content-word span with one uppercase token. `acronymRescueScore` (`src/catalog/scoring.ts:346-363`) scores that short form when the gated score is null and the raw description matches `\b[A-Z]{3,6}\b`. A pure span becomes a one-token query. Coverage is then 100%. An acronym that also sits in the entry id scores about 295. A description-only witness scores about 75. Both beat ordinary lexical hits in the 10–135 range.

The rule is general. It is not a query-specific exception, a compatibility shim, or a second response format. The same mechanism hides stronger hits.

`node /tmp/lane-c-review/followup.mjs` (exit 0). `searchCatalog` limit 5. `gatedOff: null` means the hit exists only through the acronym form.

| Query | Rank 1 | Score | Best lexical hit | Witness |
| --- | --- | --- | --- | --- |
| `send every payment` | `stellarDocs.search_anchor_sep_docs` | 295 | `scout.getHackathon` 65 | SEP. 12 gated rescues. |
| `show exchange prices` | `stellarDocs.search_anchor_sep_docs` | 295 | `scout.getClusters` 37 | SEP. Top 5 are acronym-only. |
| `smart escrow patterns` | `stellarDocs.search_anchor_sep_docs` | 295 | — | SEP. 12 gated rescues. |
| `create ledger items` | `stellarDocs.search_sdk_cli_tools_docs` | 295 | `stellarDocs.search_docs` 75, off the page | CLI. |
| `simple demo kit` | `stellarDocs.search_sdk_cli_tools_docs` | 295 | `scout.listSkills` 37 | SDK. |
| `recent protocol changes` | `stellarDocs.search_rpc_horizon_data_docs` | 295 | `scout.getChanges` 135 at rank 2 | RPC. |
| `read public contracts` | `stellarDocs.search_rpc_horizon_data_docs` | 295 | `scout.listContracts` 125 at rank 2 | RPC. |
| `smart contract framework` | `lumenloop.find_similar_scf_submissions` | 295 | `skills.stellar-dev.smart-contracts` 187 at rank 2 | SCF. `scout.scfPitch` moves 13 to 348. |
| `network operations team` | `lumenloop.find_av_passages` | 75 | `stellarDocs.search_protocol_concepts_docs` 51 at rank 5 | Shouted NOT. 9 rescues. |
| `never open trades` | `lumenloop.find_av_passages` | 75 | `lumenloop.search_content_semantic` 47 | Shouted NOT. 11 rescues. |
| `offer new endpoints` | `lumenloop.find_content_about_project` | 75 | `scout.getChangelog` 75 | ONE. `scout.listSkills` moves 13 to 75. |
| `model context protocol` | `skills.stellar-dev.standards` | 75 | `lumenloop.search_content_semantic` 47 | MCP. `scout.listSkills` is outside the top 5. |

Witness text from the same run:

- `stellarDocs.search_anchor_sep_docs`: `implementing SEP standards`
- `lumenloop.find_av_passages`: `(NOT a playback timestamp)`
- `scout.listSkills`: `Not for ONE named skill` and `MCP servers`
- `stellarDocs.search_docs`: `across ALL official Stellar developer documentatio`

The listSkills probe still passes because leftover tokens `skills` and `stellar` remain outside the MCP span. Bare `model context protocol` does not place `scout.listSkills` in the first five.

Expected fix: keep the original content tokens in the scored form. Require at least one leftover content token that matches the entry. A pure collapse such as `send every payment` to `SEP` must stay null. Ignore ordinary English shout-words (`NOT`, `ONE`, `ALL`), or accept a witness only when that token is not an ordinary word. The expanded MCP probe can still pass through `skills` and `stellar`. Do not edit the vendor file, `eval/gates.json`, `catalog/manifest.json`, or the Scout description.

### 2. should-fix — A new gated score replaces a stronger ungated score

The comment at `src/catalog/scoring.ts:341-344` says both tiers use the gated result and do not amplify established hits. Two paths break that claim.

When the gated score is null, line 361 takes `Math.max` of the current score and the acronym score. That runs for the ungated scorer too. `q-protocol-amm-cap-0038` moves `stellarDocs.search_protocol_concepts_docs` from 358 to 379. The gated score stays null. `send every payment` moves `stellarDocs.search_anchor_sep_docs` ungated from 13 to 295.

When the acronym form creates a gated score, `searchCatalogPage` prefers the gated tier. `q-soroban-sac-vs-custom-token`, entry `stellarDocs.search_asset_token_docs`:

- Gated with acronyms: 322.
- Gated with `acronyms: []`: null.
- Ungated with acronyms: 812.
- Ungated with `acronyms: []`: 812.

The page at limit 5 is `search_soroban_contract_docs` 570 backfill, `scout.searchResearch` 345 gated, `skills.stellar-dev.assets` 535 backfill, `search_asset_token_docs` 322 gated, `search_anchor_sep_docs` 513 backfill. The previous rank-1 ungated score 812 leaves rank 1. Both rank-1 ids are `stellarDocs`, so the top1 grade stays true. The admitted entry does not keep its previous score. Check (b) holds only for entries whose gated score was already non-null (`src/catalog/scoring.ts:354`).

Expected fix: if an ungated score already exists, do not mint a lower gated score. Do not max an existing ungated score with an acronym form. Update the comment at lines 341–344 so it matches that behavior.

### 3. should-fix — Tests pin the pure collapse and miss the false positives

`test/scoring.test.ts:85-95` expects `scoreEntryWeighted(source, "domain name system")` to equal `scoreEntryWeighted(source, "DNS")`. The same pattern covers URL, RPC, and MCP. That equality is the rank-1 failure mode in finding 1.

`test/scoring.test.ts:136-149` pins `scout.listSkills` only at `limit: 5`. The product default is `DEFAULT_SEARCH_LIMIT = 10` (`src/catalog/search.ts:190`). At limit 10 the same query still has `scout.listSkills` at rank 5, score 207. At limit 50 it is rank 6. The test does not lock the default page, a false-positive query, or the SAC score split.

The new tests do fail on the pinned-base scorer. Detached worktree `/tmp/lane-c-review-base` at `76c7f02b`, with only the new `test/scoring.test.ts` copied in: `npx vitest run test/scoring.test.ts` exit 1. 6 failed, 18 passed, 24 total. The four pure-span rescues, the alias-plus-acronym case, and the listSkills integration test failed. The negative cases passed on the old scorer.

Expected fix: add a test that `send every payment` does not rank `stellarDocs.search_anchor_sep_docs` first. Add a test that the SAC entry keeps ungated 812 and does not gain gated 322. Keep the limit-5 listSkills assertion, and add the default limit 10.

### 4. nit — The catalog README omits acronym rescue

`src/catalog/scoring.ts:11` names acronym rescue. `src/catalog/README.md:47-55` lists stopword rescue, section weight, keyword blends, aliases, and the ungated scorer. It does not mention acronym rescue.

Expected fix: add one sentence beside the other local adjustments. State that rescue runs only after lexical coverage fails, and that a description acronym is required.

### 5. nit — Acronym forms have no cap

For N consecutive eligible tokens and N at least 6, `prepareAcronymForms` emits `4N - 14` forms. `node /tmp/lane-c-review/followup.mjs` (exit 0), letter-only tokens:

- N=6: 10 forms, 10 unique.
- N=12: 34.
- N=30: 106.
- N=60: 226.
- N=120: 466.

`weightedScore` runs only when the gated score is null and the description contains that acronym (`src/catalog/scoring.ts:354-360`). Preparation itself has no cap. `ROUTING_PHRASE_TOKEN_CAP` is 256 (`src/catalog/extract-routing-phrases.ts:12`). Search query length is not capped.

A first cost probe used tokens such as `alpha0`. `/^[a-z]{2,}$/` breaks those spans, so that probe reported 0 forms. The letter-only counts above replace it.

Expected fix: cap the forms, or cap the tokens that enter `prepareAcronymForms`.

## Checked and held

These checks held. They are not findings.

- Scope against `76c7f02b` is the two files above. No edit under `.agents/`, `ecosystem-skills/`, or `inventory/`. `git diff --check` exit 0.
- Byte identity with current `origin/main` and with the pin. `git hash-object` equals `git rev-parse origin/main:<path>`. `git diff origin/main --` those paths is empty. SHA-256: vendor `search-scoring.ts` `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14`; `catalog/manifest.json` `15a4fe9fe4c5f741a26a39e7d4037575a05f753e70865ca01dd08abdf2e6ccba`; `eval/gates.json` `222548b2a28be1863a08031109515d3e4f6ee53e3dca61fd97105b058fddb337`.
- The prefix-minimum-three candidate is a fair isolated change. `tmp/lane-c-evidence/prefix-vendor.ts` and `prefix-scoring.ts` add only `Math.min(c.length, token.length) >= 3` on the prefix branch. Live re-run in `/tmp/lane-c-review-base`: `npm run eval:routing -- --gate` exit 1. Failures: legacy top1=229 outside ±3 of 219; top3=303 outside ±3 of 298; top5=319 outside ±3 of 326; holdout forbidden captures=12 above ceiling 10. Totals: legacy 229/303/319 card 114; extended 92/104/109 card 12; skills 17/23/23; holdout 13/26/32 forbidden 12 passed 27. Per-case grades match `tmp/lane-c-evidence/prefix.json` on every lane, including protocol (0 grade differences). Result: `/private/tmp/lane-c-review-base/eval/results/routing-2026-10-02T16-25-28-715Z.json`.
- The acronym-maximum candidate was not re-executed live. Its snapshot maxes every witnessed acronym form inside `aliasMaxScore`, including entries that already have a score. Saved `tmp/lane-c-evidence/acronym-max.json` has `gate.pass` true and legacy top1 218. `comparison.json` records two regressions, both on `q-scf-vs-sdf-enterprise-fund` (`top1` and `any1`, true to false). That matches the author report.
- Current tree: `npm run eval:routing -- --gate` exit 0. `gate.pass` true. Legacy 219/298/326 card 112 of 182. Accept-either 254/321/337. Extended 93/111/117 card 16 of 28. Accept-either 102/118/121. Skills 17/23/23 card 23. Holdout 12/26/29 card 29, forbidden 10, passed 24. Protocol diagnostic 7/8 and 3/4, `pass` false. Per-case grades match `tmp/lane-c-evidence/final.json` and `tmp/lane-c-evidence/baseline.json` on legacy, extended, skills, holdout, and protocol (0 grade differences). Result: `eval/results/routing-2026-10-02T16-25-17-222Z.json`.
- `node tmp/lane-c-compare.mjs` exit 0. It reprinted zero per-case grade regressions for the final candidate. `cmp` of `comparison.json` before and after that run was identical.
- `node tmp/lane-c-probe.mjs` exit 0. Expanded query at limit 5: `scout.listSkills` rank 3, score 207, gated. The other three probe rows match the author table.
- `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` exit 0. Base and candidate columns match because both use the current scorer. That is the script contract.
- `npm run eval:compile` exit 0 and left no generated-file dirt. `npm run typecheck` exit 0. `npm test` exit 0: 135 files, 2379 passed, 3 expected fail. `npm run build` exit 0 (dry-run, no dev server). `npm run eval:selftest` exit 0. `npm run secrets:scan -- --tree` exit 0.
- Stopwords still break spans such as `know your customer`, `time to live`, `proof of stake`, and `peer to peer`. The author disclosed that limit. It withholds a rescue. It does not hide a lexical hit.

## Commands and exit codes

Exit codes are the tool's own status. A trailing `echo` is ignored when the log records the tool status.

- `git rev-parse HEAD` and `git rev-parse origin/main` — exit 0. HEAD `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`. `origin/main` now `af740db50158a1e394a7174aed682611749802a3`.
- `git diff --stat 76c7f02be5fba31c4377f067f37412bb6e5b9d4b` — exit 0. Two files, as above.
- `git diff --stat origin/main` — exit 0. Also shows the reverse of `af740db5` in `ARCHITECTURE.md`, `src/adapters/scout.ts`, `test/adapters.test.ts`, and `test/smoke/executor.test.ts`.
- `git status --short -- src test catalog eval inventory ecosystem-skills` — exit 0. `M src/catalog/scoring.ts`, `M test/scoring.test.ts`.
- `git hash-object` of vendor `search-scoring.ts`, `catalog/manifest.json`, and `eval/gates.json` compared with `git rev-parse origin/main:<path>` — exit 0. All three blobs match.
- `git diff origin/main -- src/catalog/vendor catalog/manifest.json eval/gates.json inventory ecosystem-skills` — exit 0. Empty.
- `shasum -a 256` of those three files — exit 0. Digests listed above.
- `diff` of `tmp/lane-c-evidence/{vendor-original,prefix-vendor,scoring-original,prefix-scoring,acronym-max-scoring}.ts` — exit 0. Isolated diffs described above.
- `npm run typecheck` — exit 0.
- `npm test` — exit 0. 135 files, 2379 passed, 3 expected fail.
- `npm run eval:compile` — exit 0.
- `npm run eval:routing -- --gate` on the lane tree — exit 0. GATE PASS. `eval/results/routing-2026-10-02T16-25-17-222Z.json`.
- `npm run build` — exit 0.
- `npm run eval:selftest` — exit 0.
- `npm run secrets:scan -- --tree` — exit 0.
- `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` — exit 0.
- `node tmp/lane-c-probe.mjs` — exit 0.
- `node tmp/lane-c-compare.mjs` — exit 0. `cmp` of `comparison.json` before and after — exit 0.
- `git diff --check` — exit 0.
- `npx vitest run test/scoring.test.ts` in `/tmp/lane-c-review-base` with the new test file on the pinned scorer — exit 1. 6 failed, 18 passed.
- `npm run eval:routing -- --gate` in `/tmp/lane-c-review-base` with the prefix-minimum-three overlay — exit 1. GATE FAIL. Failures listed above. Grades match the saved prefix JSON.
- `node /tmp/lane-c-review/attack.mjs` — exit 0.
- `node /tmp/lane-c-review/cases.mjs` — exit 0.
- `node /tmp/lane-c-review/evidence.mjs` — exit 0.
- `node /tmp/lane-c-review/followup.mjs` — exit 0.
- Node grade compare of the reviewer routing JSON against `tmp/lane-c-evidence/final.json` and `baseline.json`, and of the live prefix JSON against `prefix.json` — exit 0. 0 grade differences on every lane.

## Verification

reject

The five earlier findings are repaired. One new rank-1 hole remains. A proper prefix can still serve as the required context, and `alt >= ungated` then admits a much higher acronym score.

### Repair checks that held

The diff against `76c7f02be5fba31c4377f067f37412bb6e5b9d4b` is `src/catalog/scoring.ts`, `test/scoring.test.ts`, and `src/catalog/README.md`. Vendor `search-scoring.ts`, `catalog/manifest.json`, `eval/gates.json`, and `inventory/` still match that pin.

`prepareAcronymForms` (`src/catalog/scoring.ts:318-321`) drops a form when `ACRONYM_WORDS` contains the initials or when no content token remains outside the span. `acronymRescueScore` (`src/catalog/scoring.ts:370-389`) leaves a passing gated score unchanged. The ungated scorer never reads acronym forms (`src/catalog/scoring.ts:417-422`). A new gated score is kept only when `alt >= ungated` (`src/catalog/scoring.ts:385`). Preparation stops at 32 forms (`src/catalog/scoring.ts:299` and `:329`). `src/catalog/README.md:55-57` states those limits.

`node /tmp/lane-c-review/verify.mjs` (exit 0). All twelve review queries produce zero acronym forms. Gated and ungated scores match the same query with acronyms removed, on every searchable entry. Rank 1 matches section 7 of `tmp/lane-c-report.md` on every row. `send every payment` ranks `skills.stellar-dev.agentic-payments` at 67. `model context protocol` ranks `stellarDocs.search_protocol_concepts_docs` at 111.

SAC entry `stellarDocs.search_asset_token_docs`: gated null, ungated 812, page rank 1, tier backfill. The old gated 322 is below 812, so `alt >= ungated` rejects it.

`node tmp/lane-c-probe.mjs` (exit 0). `scout.listSkills` is rank 3 at limit 5 and rank 5 on the default page. Gated score 207. Ungated score 184.

`npm run eval:routing -- --gate` (exit 0). GATE PASS. Result `eval/results/routing-2026-10-02T16-42-57-443Z.json`. Legacy 219/298/326, card 112/182. Extended 93/111/117, card 16/28. Skills 17/23/23. Holdout 12/26/29, forbidden 10, passed 24. Protocol diagnostic 7/8 and 3/4, `pass` false. Grade fields match `tmp/lane-c-evidence/baseline.json` and `tmp/lane-c-evidence/review-fixed.json` (0 differences). Top hits match the author repair file. Versus the pinned baseline, one protocol row changes other hits: `ph-security-incident-postmortems`. Its target stays `scout.searchResearch` at rank 1, score 289.

`npm run typecheck` exit 0. `npm test` exit 0: 135 files, 2385 passed, 3 expected fail. `npm run eval:selftest` exit 0. A 120-token letter query prepares 32 forms.

### 1. should-fix — A 75% prefix is enough context

`tokensOverlap` (`src/catalog/scoring.ts:149-157`) returns true for a proper prefix when the shorter token has at least 4 letters and the length ratio is at least 0.75. Line 383 uses that function as the context test. The vendor scorer also treats `startsWith` as a prefix match, so this context is not a new exact token. Line 385 then keeps the acronym score when it is at least the ungated score. The acronym score is often much higher.

`node /tmp/lane-c-review/verify-more.mjs` (exit 0). Limit 5.

| Query | Rank 1 | Score | Stronger lexical hit | Overlap |
| --- | --- | --- | --- | --- |
| `send every payment stella` | `stellarDocs.search_anchor_sep_docs` | 183 gated | `skills.stellar-dev.agentic-payments` ungated 103 | `stella` / `stellar` (6/7) |
| `send every payment searc` | `stellarDocs.search_anchor_sep_docs` | 187 gated | `scout.searchHackathonBuilds` gated 119 | `searc` / `search` (5/6) |
| `send every payment toke` | `stellarDocs.search_asset_token_docs` | 99 gated | `skills.stellar-dev.agentic-payments` ungated 79 | `toke` / `token` (4/5) |

The SEP entry on `stella` moves from gated null and ungated 65 to gated 183. Ten entries are admitted. The same sweep admits 58 catalog entries when the context is the shortest 75% prefix of an id token, such as `scou` for `scout` or `lumenlo` for `lumenloop`.

`send every payment documentation` stays gated null on the SEP entry because `documentation` does not overlap its tokens. `send every payment anchors` admits that entry at 197. `anchors` is an exact description token, so that admission is the intended rescue.

`people` overlaps `person` through `canonicalRoutingToken`, and `status` overlaps `stats`. `send every payment people` admits no entry. `send every payment status` leaves `scout.getHackathon` at 85 with and without acronyms. The canonical-only path did not open a new admission on those probes.

Expected fix: require exact equality after `canonicalRoutingToken`. Do not use the prefix branch of `tokensOverlap` for acronym context. Add a test that `send every payment stella` does not rank `stellarDocs.search_anchor_sep_docs` first. The listSkills probe and the `registry` tests use exact tokens, so they can stay.

### 2. nit — The exclusion list misses shouted catalog words

`ACRONYM_WORDS` (`src/catalog/scoring.ts:292-298`) covers stopwords plus a short emphasis list. These uppercase description tokens are outside that set: `SAME` (1), `LIST` (1), `PEOPLE` (1), `BUILD` (1), `FULL` (1), `SKILL` (1), `ANSWER` (1), `NAMED` (1), `BUILT` (2), `SUPPLY` (1).

`send alpha model every lumenloop` forms `SAME` with exact context `lumenloop`. `lumenloop.list_documents` becomes gated 125. Its score with acronyms removed is null, and its ungated score is 94. Rank 1 is that entry. The next lexical hit is `lumenloop.search_content_semantic` at 116. The query is not ordinary English. The gap is still real.

Expected fix: add those shouted words to `ACRONYM_WORDS`, or reject a witness that is an ordinary English word.

### Verification commands and exit codes

- `git diff --stat 76c7f02be5fba31c4377f067f37412bb6e5b9d4b` — exit 0. Three files, 210 insertions, 5 deletions.
- `git hash-object` of the vendor scorer, `catalog/manifest.json`, and `eval/gates.json` versus the pin — exit 0. Blobs match. Inventory diff empty.
- `node tmp/lane-c-probe.mjs` — exit 0.
- `npm run typecheck` — exit 0.
- `npm test` — exit 0. 135 files, 2385 passed, 3 expected fail.
- `npm run eval:selftest` — exit 0.
- `npm run eval:routing -- --gate` — exit 0. GATE PASS. `eval/results/routing-2026-10-02T16-42-57-443Z.json`.
- `node /tmp/lane-c-review/verify.mjs` — exit 0.
- `node /tmp/lane-c-review/verify-more.mjs` — exit 0.
- Grade compare of that routing file against `tmp/lane-c-evidence/baseline.json` and `tmp/lane-c-evidence/review-fixed.json` — exit 0. 0 grade differences. 0 top-hit differences against the author repair file. 1 top-hit difference against the baseline, named above.

## Verification 2

approve

Both residual findings are repaired. Exact canonical context still admits an entry when the extra token really occurs on that entry. Prefix context and the shouted `SAME` query do not.

### Repairs that held

The diff against `76c7f02be5fba31c4377f067f37412bb6e5b9d4b` is `src/catalog/scoring.ts`, `src/catalog/search.ts`, `src/catalog/README.md`, and `test/scoring.test.ts`. The vendor scorer, `catalog/manifest.json`, `eval/gates.json`, and `inventory/` still match that pin.

Context uses `entryTokens.has(canonicalRoutingToken(token))` at `src/catalog/scoring.ts:386-391`. It does not call `tokensOverlap`. `src/catalog/README.md:56-59` states the exact-context rule and the lowercase-prose exclusion.

`node /tmp/lane-c-review/verify.mjs` (exit 0). The twelve original queries still produce no gated or ungated score changes. `stella`, `searc`, `toke`, `docume`, `submis`, and `horiz` admit zero entries. `send every payment stella` ranks `stellarDocs.search_protocol_concepts_docs` at 88. `searc` ranks that same entry at 92. `toke` ranks `skills.stellar-dev.agentic-payments` at 79 backfill. Those are the author rows in section 8.

`node /tmp/lane-c-review/verify-more.mjs` (exit 0). `send alpha model every lumenloop` ranks `lumenloop.search_content_semantic` at 116 gated. `lumenloop.list_documents` is off that page. A direct `scoreEntryWeighted` call without the catalog word set still scores that entry at gated 125. `searchCatalog` passes the catalog set from `prepareSearchQuery` (`src/catalog/search.ts:715-716`). That is the product path.

`node tmp/lane-c-probe.mjs` (exit 0). `scout.listSkills` stays rank 3 at limit 5 and rank 5 on the default page, gated 207, ungated 184.

`npm run eval:routing -- --gate` (exit 0). GATE PASS. Result `eval/results/routing-2026-10-02T16-57-40-303Z.json`. Legacy 219/298/326, card 112/182. Extended 93/111/117. Skills 17/23/23. Holdout 12/26/29, forbidden 10, passed 24. Protocol diagnostic 7/8 and 3/4, `pass` false. Grade fields match the pinned baseline and `tmp/lane-c-evidence/second-review-fixed.json`. Top hits match the author file. Versus the baseline, only `ph-security-incident-postmortems` changes other hits. Its target stays `scout.searchResearch` at rank 1, score 289.

`npm run typecheck` exit 0. `npm test` exit 0: 135 files, 2392 passed, 3 expected fail. `npm run eval:selftest` exit 0.

### Cache and cost

`ordinaryAcronymWords` (`src/catalog/search.ts:693-712`) stores a `Set` in a `WeakMap` keyed by the `Catalog` object. `if (cached)` is safe for an empty set, because a `Set` object is truthy. `loadManifest` on the same JSON returns two different objects. A rebuilt one-entry catalog does not keep another catalog's vocabulary.

I replaced an entry on an already searched catalog object so its description gained lowercase `brave`. The cached set stayed in place, and the acronym hit stayed gated. A new catalog object that contains lowercase `brave` returns that hit as backfill. No file under `src/` assigns `description` or pushes catalog entries after load. `getCatalog` (`src/catalog/load.ts:17-19`) parses the manifest once per isolate and returns that same object. A rebuilt catalog is a new object and misses the cache.

The scan covers 282 entries and 60412 characters, and it yields 627 lowercase words of length 3 to 6. It runs once per catalog object. `searchCatalogPage` calls `prepareSearchQuery` once (`src/catalog/search.ts:1199`) and both tiers share that query. Timed `searchCatalog` calls: first search on a fresh catalog 5.78 ms, second search 2.41 ms, first search on a rebuilt catalog 5.32 ms. The hot path after the first search is a `WeakMap` read plus the existing scorer.

The derived set contains `same`, `list`, `people`, `build`, `full`, `skill`, `answer`, `named`, `built`, and `supply`. It also contains `rpc`, `cli`, `sdk`, `docs`, `search`, `anchor`, and `token`. It does not contain `sep`, `mcp`, `scf`, `sac`, or `stellar` (`stellar` has 7 letters). Compounds such as `mcp-server` stay one token, so the MCP probe still resolves.

### Exact canonical context

`node /tmp/lane-c-review/verify2.mjs` (exit 0). An exact entry token still admits the acronym score when `alt >= ungated`.

| Query | Rank 1 | Target gated score | Gated score with acronyms removed |
| --- | --- | --- | --- |
| `send every payment anchors` | `stellarDocs.search_anchor_sep_docs` 197 | 197 | null |
| `send every payment docs` | `stellarDocs.search_anchor_sep_docs` 405 | 405 | null |
| `send every payment stellar` | `stellarDocs.search_anchor_sep_docs` 233 | 233 | null |
| `send every payment on stellar` | `stellarDocs.search_protocol_concepts_docs` 182 | 138, unchanged | 138 |
| `send every payment sep` | `stellarDocs.search_anchor_sep_docs` 123 backfill | null | null |
| `send every payment seps` | `stellarDocs.search_anchor_sep_docs` 187 | 187 | null |

`anchors` is the intended rescue: the canonical token is `anchor`, and that token is in the entry. `docs` and `stellar` are exact tokens on the entry, so they follow the same rule. The sentence `send every payment on stellar` does not put the SEP entry first. The literal context `sep` does not raise a new gated score, because the ungated score is already 123 and the acronym form does not clear it. `seps` does admit rank 1. `canonicalRoutingToken` strips the final `s`, so `seps` equals the description token `sep`, while the vendor scorer does not treat `seps` as `sep`. That query is not ordinary English. It does not reopen the prefix finding or the `SAME` finding.

`send charlie foxtrot skill` scores `skills.lumenloop.scf-submission-radar` at gated 199 in the direct scorer. Whole-skill admission keeps it off the limit-5 page. Rank 1 is `skills.stellar-light.stellar-scout` at 103.

### Verification 2 commands and exit codes

- `git diff --stat 76c7f02be5fba31c4377f067f37412bb6e5b9d4b` — exit 0. Four files, 293 insertions, 9 deletions.
- Protected-file diff against that pin — exit 0. Empty.
- `node /tmp/lane-c-review/verify.mjs` — exit 0.
- `node /tmp/lane-c-review/verify-more.mjs` — exit 0.
- `node /tmp/lane-c-review/verify2.mjs` — exit 0.
- `node tmp/lane-c-probe.mjs` — exit 0.
- `npm run typecheck` — exit 0.
- `npm test` — exit 0. 135 files, 2392 passed, 3 expected fail.
- `npm run eval:selftest` — exit 0.
- `npm run eval:routing -- --gate` — exit 0. GATE PASS. `eval/results/routing-2026-10-02T16-57-40-303Z.json`.
- Grade compare of that file against `tmp/lane-c-evidence/baseline.json` and `tmp/lane-c-evidence/second-review-fixed.json` — exit 0. 0 grade differences. 0 top-hit differences against the author file. 1 baseline top-hit difference, named above.

