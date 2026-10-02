not safe

I reviewed `c4d60eb169bc32ad780505129dd9e8fae2c8d976` against `origin/main` at `38aa07fc8a4b05c5fa271d0227d2e80c2fdc650d`.
This includes `3c1183b7`, the brief commit `b22b786c`, and the requested baseline correction.
The checks pass, but the baseline decision does not meet Step 4.
The candidate also introduces reproducible discovery regressions and a contradictory parameter description.

I read the runbook, ledger, and [issue #215](https://github.com/stellar-experimental/stellar-raven/issues/215).
I used temporary copies for commands that write files.
I changed no tracked file in the supplied worktree.
I made no upstream post, deployment, or paid call.

**Findings**

1. **[P2] The new baseline accepts a regression without evidence of an intended improvement.**

   Evidence: `eval/gates.json:58`; `.agents/rounds/2026-10-02-drift-scout-1.9.61.md:78`; `.agents/skills/live-drift-resolution/SKILL.md:228`.
   Commit `c4d60eb1` changes the legacy top-3 center from 298 to 297.
   The allowed lower result changes from 295 to 294 because the band remains ±3.
   The self-test requires matching accepted totals and centers, but that requirement does not justify accepting worse routing.
   Step 4 also requires an intended improvement.

   I reproduced the only changed graded result, `q-defi-agentic-payment-standards-compare`.
   Its query compares x402, MPP, AP2, and ACP.
   The base returns `stellarDocs.search_docs` at rank 3, with score 326.
   The candidate removes that operation from the first five results.
   It returns `stellarDocs.search_sdk_cli_tools_docs` at rank 5, with score 130.
   The first Docs result therefore moves from rank 3 to rank 5.
   This is a measured loss, not evidence of improved comparison coverage.

   The claimed title cause is substantially correct, but its token attribution needs precision.
   Removing only the newly added `x402` keywords restores the base result order.
   Removing only the newly added `pay` keywords also restores it.
   Removing only the newly added `apis` keywords does not restore it.
   These experiments change the in-memory manifest only.

   Expected fix: correct the general routing mechanism and repeat the comparison before accepting a new baseline.
   Alternatively, separate the rejected routing change from the schema and directory changes.
   Do not lower the center only to satisfy the self-test.
   Also correct `eval/gates.json:54`, which still says all thresholds are unchanged.

2. **[P2] The changed text causes additional skill-discovery regressions outside the gate.**

   Evidence: `catalog/manifest.json:27548` through `27566`, `catalog/manifest.json:13020`, and `scripts/build-catalog.mjs:298`.
   The title generator adds generic words to Docs operations.
   These words can displace the live skill-directory operation.

   | Query | Base | Candidate | Causal check |
   | --- | --- | --- | --- |
   | `Stellar skills for signing messages` | `scout.listSkills` rank 3, score 166; SDK/CLI Docs rank 4, score 144 | SDK/CLI Docs rank 3, score 168; `scout.listSkills` rank 4, score 166 | Removing new `skills` or `messages` keywords restores the directory above Docs. |
   | `Stellar skills for security auditing` | `scout.listSkills` rank 3, score 166; SDK/CLI Docs rank 4, score 153 | SDK/CLI Docs rank 3, score 168; `scout.listSkills` rank 4, score 166 | Removing the new `skills` keyword restores the base order. |
   | `Stellar authority skills` | `scout.listSkills` rank 3, score 135 | SDK/CLI Docs rank 3; Soroban Docs rank 4; `scout.listSkills` rank 5 | Restoring only the base Docs keyword sets restores the base order. |
   | `Are there any model context protocol skills for Stellar?` | `scout.listSkills` rank 3, score 195 | `scout.listSkills` absent from the first five results | Restoring only its old description restores the base order. |

   The last case has a separate cause: the changed `listSkills` description.
   Restoring the base Docs keywords does not repair that case.
   These are targeted discovery checks, not a measured production failure rate.
   The first three directly answer the brief's keyword question.
   The last establishes another text-driven regression in the same candidate.

   Expected fix: preserve discovery intent through a general keyword or scoring correction.
   Add independent diagnostic coverage for these intent classes.
   Do not add query-specific exceptions or change frozen labels.
   Replace the ledger's unrestricted acceptance of the keyword change with the measured results and resolution.

3. **[P2] The new documentation advertises a `source` value that Raven rejects.**

   Evidence: `catalog/manifest.json:19051`, `catalog/manifest.json:19073`, `specs/super-spec.json:4248`, and `src/policy/validate.ts:58`.
   Both new descriptions say a comma in `source` works like `sources`.
   However, `source` retains a single-value enum.

   ```js
   validateArgs(entry.inputSchema, {
     q: "base reserve",
     source: "cap,sep",
     perSource: 2
   })
   // [{ path: "source", message: "must be one of: ..." }]
   ```

   The live upstream accepts `source=cap,sep&perSource=1` and returns HTTP 200 with two results.
   Raven rejects the advertised alias before the adapter runs.
   The new array form works correctly: `sources: ["cap", "sep"]` passes validation and returns four results with `perSource: 2`.

   Expected fix: make the generated descriptions match Raven's validated contract.
   Prefer directing callers to the supported array form.
   Correct the generator or reviewed source description, then regenerate the artifacts.
   Do not disable enum validation globally or edit generated files manually.

4. **[P2] The `sls-089` recheck contains an incorrect schema claim and overstates recurrence evidence.**

   Evidence: `improvements/stellar-light-scout/sls-089-project-search-failed-read-zero-count.md:18`;
   `.agents/rounds/2026-10-02-drift-scout-1.9.61.md:35` and `:98`;
   `inventory/stellar-light.json:6156`.

   The live OpenAPI document exactly matches the committed `1.9.61` document.
   `/api/research` references `RequestError` for 400 and `RetryableError` for 429 and 503.
   `/api/hackathon-brief` has only description strings for 400, 429, and 503.
   It does not declare either new response schema.
   Its complete operation object is unchanged from the base.

   `/api/projects/search` still declares only its 200 response.
   That fact supports a continuing documentation gap.
   It does not reproduce a backend timeout or prove the runtime still returns a false zero count.
   The new line says “Still repro by contract” while admitting the burst trigger was not repeated.
   The upstream issue remains open with no comments, but issue state is not runtime evidence.

   Expected fix: correct the endpoint/schema attribution in the finding and ledger.
   State “contract gap persists; runtime recurrence was not re-tested.”
   Keep `reported-upstream` based on the existing dated reproduction.
   Do not claim a new reproduction without observing the original failure.

5. **[P3] The impact audit misses a current-count correction in `sk-027`.**

   Evidence: `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:25`, `improvements/INDEX.md:20`, and the ledger at `:100`.
   The finding still states that the live catalog has 43 entries from four sources.
   The candidate and my live check both show 62 entries from five populated sources.
   The 19 added entries have `source=community`.
   The pinned Scout skill remains stale, so the finding should stay open.
   An unchanged pin does not make the finding's present-tense API count correct.

   Expected fix: update the current finding summary and add a dated recheck.
   Preserve the historical 43-entry observation.
   Regenerate `improvements/INDEX.md` and correct the ledger's “no edit” conclusion.
   No upstream post is required for this local correction.

**Verified drift classification**

The `surface` comparison exits 0 with no added or removed path/method pairs.
Both inventories contain the same 38 operations and operation IDs.
The `text` comparison exits 1 for two descriptions: `listSkills` and `getSkill`.
No summary, operation ID, or `x-routing` block changes.
The `deep` comparison exits 1: both complete paths and components differ.
The classification is routing-relevant text plus model-visible schema drift.

Every changed operation is listed below.
These changes are broader than the ledger's named operation list.

| Operation | Changed fields and effect |
| --- | --- |
| `scout.listAudits` | Response: revised 400 description. |
| `scout.getChangelog` | Response: added `meta.warnings` schema. |
| `scout.getChanges` | Response: revised 400 description. |
| `scout.searchResearch` | Parameters: revised `source` description; added `sources` and `perSource`. Responses: added source metadata, response headers, and 400/429/503 contracts. |
| `scout.getRfps` | Response: added `meta.warnings` schema. |
| `scout.listSkills` | Description: expanded registry scope. Response: added `meta.registry`. |
| `scout.getSkill` | Description: expanded raw-content scope to registry entries. |
| `scout.getStablecoins` | Response: revised 400 description. |

Every changed component is listed below.

| Component | Change |
| --- | --- |
| `Meta` | Revised `warnings.description` to distinguish unknown-parameter policies. |
| `Skill` | Added `registry`; revised `source`, `install`, `rawUrl`, `argumentHint`, and `userInvocable` descriptions. |
| `RequestError` | New 400 error schema with `error` and optional `hint`. |
| `RetryableError` | New retryable-error schema with retry and advisory fields. |

The research success metadata adds `sourceEmpty`, `sourceDocCount`, `resultsHash`, `bySource`, and `sourceAdvisory`.
The direct operation comparison does not count indirect changes through shared components as new operation-object edits.

**Verified exposure and runners**

Both catalog builds print the same exclusions and produce 282 IDs with 60 service operations.
The ID sets are equal, not merely their counts.
The service counts remain Lumenloop 18, Scout 30, and Stellar Docs 12.
The remaining entries are 20 whole skills and 202 skill sections.
The 19 new directory entries do not become new callable skills.

The exclusions remain the paid Lumenloop research trio and eight Scout path/method pairs.
The Scout exclusions include feedback, partner submission/AI endpoints, quality, verification, and RWA.
The retired `lumenloop-mcp-connect` skill stays excluded.
The builders' guards pass.
Explicit emitted-text checks also pass for the manifest, super-spec, and micro-map.

The machine-derived runner intersection is empty.
`skills.lumenloop.stellar-ecosystem-digest` declares only:

- `lumenloop.search_content_semantic`
- `lumenloop.list_documents`
- `lumenloop.find_content_by_entity`

The Lumenloop inventory is unchanged.
No runner smoke is required by Step 4b.

**Verified routing results**

I ran `npm run eval:compile && npm run eval:routing -- --gate` for the base and final candidate.
Both gates pass.
The final candidate also passes `npm run eval:selftest`.
The earlier center/accepted-total mismatch is therefore resolved mechanically.
Finding 1 remains a separate acceptance problem.

| Lane | Base | Final candidate |
| --- | --- | --- |
| Legacy, 338 cases | 219 / 298 / 326 | 219 / 297 / 326 |
| Legacy exact-card hits | 112 / 182 | 112 / 182 |
| Skills, 23 cases | 17 / 23 / 23 | 17 / 23 / 23 |
| Holdout, 49 cases | 12 / 26 / 29 | 12 / 26 / 29 |
| Holdout forbidden / passed | 10 / 24 | 10 / 24 |
| Extended, 122 cases | 93 / 111 / 117 | 93 / 111 / 117 |

The protocol-history diagnostic still fails in both versions.
Its result remains 7/8 positive top-five hits and 3/4 control captures.
This is unchanged, and it does not control the routing gate.

I compared all 544 per-case result records, including the holdout records.
Exactly 56 records change a top-five hit or score.
Only the named payment-comparison row changes a graded result.
The ledger should say “within the first five results,” not “below rank 5.”
`--dump-ranked` itself covers 495 records; it omits the 49 holdout records.
I used the complete result files for the 544-record comparison.

Only these gate fields change against the base:

- `baselinedAt`
- `evidence.inputs[0].sha256`
- `evidence.acceptedTotals.legacy.top3`
- `evidence.localTrace`
- `note`
- `legacy.top3`

All other thresholds, corpus hashes, and grading rules remain unchanged.
The manifest fingerprint is `6b8cc6ed28f125cc0ea7d3c65f7161d46fff23979de8bbc3294e108345eda196`.

**Verified mirrors and titles**

`check-mirrors.mjs --fetch` verifies 66 upstream files.
`check-pin-review.mjs --base origin/main` reports no moved pin or file selection.
`check-skills-drift.mjs` reports every source as current.
`MANIFEST.json` changes only `synced_at`; `community.json` changes only `fetched_at`.

The Scout directory adds these 19 community entries and removes none:

```text
anchors, caatinga, cogladius, contextio-sdk, defindex-sdk, discover,
eunomia-bounded-agent-treasury, nirium-agentic-payments, pmll,
pollar-wallet-auth, rozo-checkout, rozo-intents, setup-stellar-contracts,
soroban-common-mistakes, sozu-faucet, stellar-agent-search, stellartools,
sub-rosa, trustless-work-dev
```

Eight existing SDF entries also change their install command and repository metadata.
Seven of those entries change their title.
These directory changes do not alter the five served source pins.

The title snapshot grows from 651 to 666 rows and from 563 to 575 distinct titles.
No title/path pair disappears.
Fourteen added paths are under `/docs/tools/cli/agent-cli`.
The other added path is `/docs/build/guides/events/replay-ledger-close-meta`.
The ledger's “Delegate Auth” and “USDT0 Transfers with LayerZero” are not added titles.
The actual new guide titles include “Delegate spending” and “USDT0 on mainnet.”
Correct that ledger wording when reconciling the findings.

**Verified adapter, live contract, and impact audit**

The live OpenAPI JSON equals the committed OpenAPI object exactly at version `1.9.61`.
The new `sources` schema remains an array with `style: form` and `explode: false` in the super-spec.
`perSource` remains an integer with minimum 1, maximum 25, and default 8.

I called the real adapter with `{q: "base reserve", sources: ["cap", "sep"], perSource: 2}`.
At `2026-10-02T14:37:28.406Z`, it sent:

```text
https://stellarlight.xyz/api/research?q=base+reserve&sources=cap%2Csep&perSource=2
```

The response returned four results: two `cap` rows, then two `sep` rows.
`meta.bySource` reports status 200 and returned count 2 for each source.
The validator rejects a string-valued `sources`, invalid array members, `perSource: 26`, and fractional `perSource` values.
`src/adapters/scout.ts:55` correctly joins array members with commas.
Finding 3 concerns the separately advertised `source` alias.

I searched the requested battery, plan, docs, repository skills, source, and improvements directories.
The skill-discovery goldens already require live rows and distinguish discovery from detail lookup.
Their old counts are explicitly dated observations, not required current counts.
I found no golden-answer change required by this drift.
The new parameter forms need focused validation coverage when the schema-description contradiction is repaired.
The `eval/README.md` version update is correct.
Historical `1.9.54` evidence should retain its original version.

`sk-027` and `sk-028` remain valid findings against unchanged Scout skill bytes.
The live status now reports 252 builders; `sk-028` retains dated 226 and 233 observations.
The local corrections required by this review are Findings 4 and 5, plus the ledger corrections above.

**Checks, scope, and retained evidence**

These checks pass on the final candidate:

- Catalog generation, micro-map generation, super-spec generation, and operation-class generation.
- Routing compilation, routing gate, and evaluation self-test.
- Live mirror verification, pin-review check, and skill-drift check.
- `npm run improvements:lint -- --live` for 66 findings.
- Improvements index regeneration, with no resulting tracked difference.
- `npm run secrets:scan -- --tree`, including Gitleaks.
- `git diff --check origin/main...HEAD`.

All regenerated tracked artifacts equal the committed final candidate.
I inspected added generated text and checked long token candidates; I found no secret-shaped additions.
The complete change contains 14 files.
Its hand edits match the ledger, with two corrections to its scope description.
The committed review brief is an additional hand-authored file.
`eval/gates.json` also changes the top-3 center after `c4d60eb1`.
`improvements/INDEX.md`, the micro-map, and operation classes have no committed difference.

I did not run a paid evaluation, the timeout burst, a deployment, or production acceptance checks.
I did not rerun the full unit/build/smoke suite for this generated-data review.
The report does not independently certify the author's earlier unit/build/smoke receipt.

Reproduction files and complete result captures remain at:

```text
/private/tmp/review-drift-astra.qVtpQi/
  classification.json
  inventory-surface.log
  inventory-text.log
  inventory-deep.log
  base/eval/results/routing-2026-10-02T14-34-38-508Z.json
  candidate/eval/results/routing-2026-10-02T14-37-30-498Z.json
  probe-routing.mjs
  probe-routing.json
  probe-expanded.mjs
  probe-expanded.json
  causality.mjs
  causality.json
  probe-adapter.mjs
  adapter-live.json
  live-source-alias.json
  live-openapi.json
  live-skills.json
  live-status.json
  final-gate.log
  selftest.log
  final-build-catalog.log
  final-secrets.log
  improvements-lint.log
```

Run `node /private/tmp/review-drift-astra.qVtpQi/causality.mjs` to repeat the offline causal comparisons.
The temporary copies preserve the reviewed base and candidate.
