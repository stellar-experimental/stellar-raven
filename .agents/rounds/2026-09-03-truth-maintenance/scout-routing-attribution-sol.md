# Scout 1.9.23 routing attribution

Date: 2026-09-03

## Decision

Do not file `sls-082` from this evidence.
The evidence shows Raven scoring-policy defects.
It does not prove an upstream Scout routing contract defect.

Revert three Scout scorer projections to remove every real regression:

- `scout.searchResearch`
- `scout.explainRepo`
- `scout.hackathonBrief`

This three-operation set is minimal.
Keep this result as a diagnostic only.
Do not ship stale upstream routing text as a second production source.

Add a general Raven scoring TODO after the current truth-maintenance round.
The draft TODO appears below.

The Stellar Docs USDT0 title can land independently.
It causes no routing regression or ranked-row change.

## Inputs

The clean input is the `main` catalog manifest.
Its canonical SHA-256 is:

`4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`

The rejected input is `/private/tmp/stellar-raven-manifest-1.9.23-verify-only.json`.
Its canonical SHA-256 is:

`4273c2990a48eac1b749afe07d4971d99c7d32117e7b6ee4bc823265cf22c476`

The rejected manifest changes 26 existing Scout scorer projections.
It also adds `scout.verifyClaim`.

Each experiment changed these scorer fields only:

- `description`
- `keywords`
- `routingKeywords`
- `knownAliases`
- `knownAliasTriggers`
- `searchable`

The `scout.verifyClaim` experiment removed the added operation.
All non-target candidate fields stayed unchanged.

## Reproducible method

I created one temporary manifest for each changed Scout operation.
Each manifest started from the rejected candidate.
Each experiment restored one operation's clean scorer projection.

I ran this command for every temporary manifest:

```text
node eval/run-routing.mjs --manifest <temporary-manifest> --dump-ranked <temporary-ranked-dump>
```

I compared every returned row against both fixed inputs.
Each run covered 495 ranked cases across four committed lanes.
The command also scored the 49-case holdout lane.

The temporary evidence is under `/private/tmp/scout-routing-attribution/`.
Its `runs.json` file records every result path and manifest digest.
Its `ranked/` directory contains every full ranked dump.

## Independent operation results

The clean legacy result is `213 / 279 / 312`.
The candidate legacy result is `211 / 277 / 312`.

The clean extended result is `90 / 110 / 116`.
The candidate extended result is `90 / 109 / 114`.

The clean skills result is `16 / 23 / 23`.
The candidate skills result is `16 / 22 / 23`.

The holdout ranks stay `10 / 22 / 26`.
Its forbidden captures improve from 11 to 10.

Only five independent reversions change an aggregate value.

| Reverted operation | Change from the candidate |
| --- | --- |
| `scout.searchResearch` | Legacy top-one +2, top-three +1, skills top-three +1 |
| `scout.searchResearch` | Legacy card hits -7, forbidden captures +1, holdout passes -1 |
| `scout.explainRepo` | Legacy top-three +1 and card hits +1 |
| `scout.hackathonBrief` | Extended top-five +1 |
| `scout.getLeaderboard` | Legacy card hits -1 |
| `scout.getRfps` | Legacy card hits -1 |

The last two reversions remove valid candidate improvements.
They do not repair a regression.

The other 22 reversions change no aggregate value.
They include `scout.verifyClaim`.

The no-change operations are:

- `scout.analyzeEcosystem`
- `scout.compareHackathons`
- `scout.getBuilders`
- `scout.getChangelog`
- `scout.getChanges`
- `scout.getClusters`
- `scout.getHackathon`
- `scout.getHackathons`
- `scout.getPartner`
- `scout.getPartners`
- `scout.getRepoTrust`
- `scout.getSkill`
- `scout.getStablecoins`
- `scout.listAudits`
- `scout.listContracts`
- `scout.matchPartners`
- `scout.scfPitch`
- `scout.searchHackathonBuilds`
- `scout.searchProjects`
- `scout.searchRepos`
- `scout.verifyClaim`
- `scout.vetIdea`

## Regression attribution

### `scout.searchResearch`

This projection causes four real regressions.
Reverting only its `routingKeywords` field repairs all four.
Reverting only its schema `keywords` field repairs none.

The new projection adds these relevant routing tokens:

`upgrade`, `feature`, `state`, `archival`, `version`, `shipped`, `19`, `headline`, `24`, `latest`, `each`, `network`, `ship`, `soon`, `after`, `23`, `timelines`, `upgrades`, `causes`, `works`, `walk`, `through`, `21`, `22`, `whisk`, `notes`, `root`, `cause`

The generated projection also loses `yieldblox` and `reflector`.
The upstream `x-routing` object still contains both terms.
Raven's 256-token extraction cap removes these later terms.

Its schema keywords remove `repo`, `version`, and `title`.
The field-only test shows that this schema change causes no listed regression.

| Regression | Exact cause | Measured effect |
| --- | --- | --- |
| `q-comp-yieldblox-oracle-incident` | The cap drops `yieldblox` and `reflector` | Score 256 becomes 220; rank one becomes rank two |
| `q-defi-rwa-scf-similar` | Added flattened token `through` creates a weak capture | The exact Lumenloop card leaves rank five |
| `q-protocol-network-passphrases-list` | Added `network` and `each` create a strong capture | Official Docs moves from rank three to rank four |
| `q-skill-soroban-first-contract` | Added `walk` and `through` create a broad capture | The smart-contract skill moves from rank three to rank four |

The upstream contract adds useful protocol-history intent.
It also adds two exact protocol-history example questions.
Raven flattens their structured phrases into independent tokens.

The useful upstream intent must remain available to production.
The scoring projection must preserve structure and older intent.

### `scout.explainRepo`

This projection causes two real regressions.

The description changes from Stellar internals to any indexed repository.
It adds the phrase `how does X implement/calculate Y in its code`.
It also adds the graded repository index as an authority.

The routing projection adds these tokens:

`implemented`, `interest`, `rate`, `model`, `contract`, `algorithm`, `formula`, `mechanism`, `walkthrough`

Its schema keywords add these tokens:

`cap`, `knowledge`, `notes`, `kind`, `fork`, `template`, `tutorial`, `application`

They remove `contract`, `commit`, and `stars` from schema keywords.
The field-only test shows that this schema change causes no listed regression.

Reverting `routingKeywords` repairs both affected grades.
Reverting `description` repairs only the parallel-execution grade.
Reverting both fields restores both clean rows exactly.

| Regression | Exact cause | Measured effect |
| --- | --- | --- |
| `q-protocol-parallel-execution` | Broad description text and `contract` satisfy the gate | `scout.explainRepo` replaces official Docs at rank three |
| `q-soroban-reentrancy` | The standalone `contract` token satisfies the gate | `scout.explainRepo` replaces `scout.searchResearch` at rank five |

The operation can answer source-grounded indexed-repository questions.
The broader upstream scope is therefore valid.
Raven loses the required repository and code anchors during token flattening.

### `scout.hackathonBrief`

This projection causes one real regression.
Its raw description and raw `x-routing` object do not change.

Only derived schema keywords change.
The exact added list follows:

`awarded`, `usd`, `projects`, `open`, `phase`, `submission`, `deadline`, `unavailable`, `domains`, `use`, `events`, `delta`, `size`, `project`, `stellar`, `proof`, `audit`, `drift`, `days`, `latest`, `audits`, `auditor`, `published`, `truth`, `depth`, `scan`, `state`, `scanned`, `sdk`, `capabilities`, `activity`, `tier`, `signals`, `succession`, `predecessors`, `successor`, `usage`, `subinvocations`, `scored`, `weak`, `types`, `winners`, `progress`, `audited`

No schema keyword is removed.

| Regression | Exact cause | Measured effect |
| --- | --- | --- |
| `q-pc-account-merge-reclaim-reserve` | Added `use` raises the ungated score from 218 to 228 | `scout.hackathonBrief` replaces official Docs at rank five |

This regression originates fully in Raven's schema keyword policy.
No upstream routing text causes it.

### Cross-operation gate interaction

`q-defi-build-staking-for-own-token` needs two independent reversions.
Neither single reversion repairs the row.

The clean result has four gated candidates.
Raven then backfills `stellarDocs.search_asset_token_docs` at rank three.

The candidate adds `scout.explainRepo` as a fifth gated candidate.
Reverting it lets `scout.hackathonBrief` become the fifth gated candidate.

The new `phase` schema keyword causes that rescue.
Raven matches the query stopword `has` inside `phase`.
The score is 88, while the clean projection returns `null`.

Reverting only `scout.hackathonBrief` leaves `scout.explainRepo` gated.
Reverting both operations leaves four gated candidates.
The Docs backfill then returns at rank three.

This behavior comes from Raven's five-result gated-tier seam.
The upstream services do not control that seam.

## Minimal repair set

I tested all relevant two-operation combinations.
No two-operation set removes all eight real regressions.

`scout.searchResearch` is necessary for four unique regressions.
`scout.explainRepo` is necessary for the reentrancy regression.
`scout.hackathonBrief` is necessary for the account-merge regression.

The three-operation diagnostic manifest has this SHA-256:

`bdbcdd434038c8a01efd4f730c8a6f49f34746775004dbcae222163954e7c4d5`

Its result is `eval/results/routing-2026-09-03T16-54-04-107Z.json`.

| Lane | Clean | Three-operation diagnostic |
| --- | ---: | ---: |
| Legacy top 1 / 3 / 5 | 213 / 279 / 312 | 213 / 279 / 312 |
| Extended top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 110 / 116 |
| Skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 23 / 23 |
| Holdout top 1 / 3 / 5 | 10 / 22 / 26 | 10 / 22 / 26 |
| Holdout forbidden / passed | 11 / 21 | 11 / 21 |

Legacy card hits become 97 instead of the clean value 95.
The two retained gains are valid leaderboard and RFP improvements.

All eight real regressions disappear.
Therefore, three operations form the smallest complete set.

## Contract ownership

### Upstream Scout behavior

Scout 1.9.23 adds valid protocol-history intent to `searchResearch`.
It broadens `explainRepo` to repositories that the operation can answer.

One wording risk remains in `explainRepo`.
Standalone words such as `contract`, `formula`, and `mechanism` are broad.
However, this corpus does not prove a bad upstream endpoint choice.

The measured failures require Raven's flattening, truncation, and gate behavior.
The evidence does not justify an upstream defect finding.

### Raven scoring behavior

Raven creates all demonstrated failures through four general policies:

1. It flattens structured routing phrases into independent tokens.
2. Its 256-token cap drops valid older intent from later positions.
3. It promotes generic schema property names into gate evidence.
4. It accepts unrelated substring matches inside schema words.
5. Five weak gated candidates suppress stronger cross-service backfill.

These are own-repository scoring defects.
They need a general Raven repair.

## Finding decision

Do not create `sls-082`.
An upstream finding needs evidence that Scout misstates the operation contract.
This experiment does not provide that evidence.

Do not attach Raven's local scoring details to an upstream finding.
That would ask Scout to compensate for a consumer-specific scorer.

## Draft own-repository TODO

Title: Preserve structured routing intent across extraction caps and gate tiers

Scope:

- Keep phrase and field boundaries from `x-routing` during scoring.
- Replace first-token truncation with deterministic fair allocation.
- Retain specific older intent when a source adds long new sections.
- Stop generic response-property names from satisfying the coverage gate.
- Stop unrelated substrings inside schema words from satisfying query coverage.
- Let strong ungated cross-service evidence compete with five weak gated rows.
- Avoid operation-specific and question-specific exceptions.

Acceptance tests:

1. Protocol-history additions do not remove `yieldblox` or `reflector` intent.
2. `through`, `network`, `each`, and `walk through` cannot route alone.
3. `contract` cannot route `explainRepo` without a repository or code anchor.
4. Added `use` cannot promote `hackathonBrief` above account-merge Docs.
5. `has` cannot match inside the schema keyword `phase`.
6. Strong Docs evidence remains eligible after five weak gated Scout candidates.
7. All eight regression rows meet their clean grades.
8. The leaderboard and RFP improvements remain.
9. The full legacy, extended, skills, and holdout gates do not regress.
10. The protocol-history measurement stays source-expired for Scout 1.9.23.

## Stellar Docs title isolation

I built the Docs title snapshot against clean `main`.
That build uses the accepted Scout 1.9.1 inventory.

The clean commit is `2ee801f80d626e68f010392a7d541aab7997349d`.
The Scout inventory SHA-256 is:

`1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`

The snapshot is `/private/tmp/stellar-docs-titles-2026-09-03.json`.
Its SHA-256 is:

`2ec2718fa24df11b02ec11eee7f5079a81f3464673fcf0182dfdd4afed00412e`

The snapshot adds one title:

- Path: `/docs/tokens/usdt0-layerzero`
- Title: `USDT0 Transfers with LayerZero`

The temporary catalog build adds three scorer keywords only:

- `usdt0`
- `layer`
- `zero`

I built the temporary manifest with this command:

```text
node scripts/build-catalog.mjs --out /private/tmp/stellar-raven-manifest-docs-usdt0.json
```

The temporary manifest has this canonical SHA-256:

`3a4f795cb94504b4bb94e28911439a1f57af1cc3e9879cad41dde484ba098c76`

The full result is `eval/results/routing-2026-09-03T16-56-44-721Z.json`.
Every aggregate equals clean `main`.

Both full ranked dumps have this SHA-256:

`d36c808d66928c7270e2fedc6d79d6b340169f6f903a3d24d1ce03612cc42122`

The ranked dumps are byte-identical.
The title changes no score, rank, membership, or grade.

The single USDT0 title can land independently without routing regressions.
Its acceptance must not include the rejected Scout 1.9.23 routing projection.

## Blocked decisions

- Do not accept the full Scout 1.9.23 routing drift.
- Do not change a routing baseline from this experiment.
- Do not ship the three-operation stale projection without a routing-epoch policy.
- Do not file `sls-082` without direct upstream contract evidence.
- Do not credit the contaminated v1 protocol-history result.
- Do not credit the source-expired v2 protocol-history result.
- Do not combine the accepted Docs title with the rejected Scout surface.
- Defer the Raven scoring TODO edit to the owning lane.

## Scope confirmation

This analysis made no product-file change.
It made no finding-file change.
It made no baseline change.
It used no paid call.
It made no deployment.
