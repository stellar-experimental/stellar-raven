# Design review: whole-skill ID/name admission

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T19:39:04Z`.
Mode: design recommendation. No file edits. No gate changes. Not source acceptance.

Catalog and search under test: `/tmp/raven-execution-2026-09-16/pr157`.
Vendor scorer: `src/catalog/vendor/search-scoring.ts` (must stay byte-identical).
Host description: `scripts/description-notes.mjs` `SKILL_DESCRIPTION_OVERRIDES`.

## Verdict

The narrowed Trustless Work description is doing its job. Four earlier captures are gone. The remaining SDF-spending capture is **not** a description problem.

It is an ID/name tokenization problem. `entryName` is `trustless-work-dev`. Vendor scoring splits that on hyphens, then prefix-matches `development` to `dev` and exact-matches `work`. Those hits ride the high-weight `id` (12) and `name` (10) fields. The gated vendor score for the SDF query is `null` (coverage). Ungated backfill still admits the skill into the top five.

Do not rename the skill id. Do not retune the override to one query. Do not add `work` to STOPWORDS.

Add a **general whole-skill admission boundary** after vendor scoring. Keep operations on current vendor semantics. Coordinate with the drift search.ts work; do not ship two competing filters.

## Mechanism

`entryName` returns `lastIdSegment(id)` (`search.ts`). For this skill that is `trustless-work-dev`.

`entryScoringName` only appends `knownAliases` when an alias trigger fires. This skill has no alias path in the SDF query. The scoring name is the last segment.

Vendor `normalizeSearchText` / `tokenize` replace `[_./:#-]` with spaces. Fields become:

- name tokens: `trustless`, `work`, `dev`
- id tokens: `skills`, `trustless`, `work`, `trustless`, `work`, `dev`

Vendor `scoreField` then:

- exact token: weight × 4
- prefix either way: weight × 2 (`development`.startsWith(`dev`))
- raw substring: weight × 1

`id` weight 12 and `name` weight 10 make those fragments stronger than description weight 5.

The SDF question tokenizes to include `development` and `work`. Description tokens (`escrow`, `milestone`, `dispute`, `release`) are absent. Vendor `scoreEntry` returns null on coverage. The skill still appears at rank 5 through the ungated path.

Exact-id access still uses the same name/id fields plus the +20 exact-id/name bonus. That path must remain.

## Measured probes (PR157 catalog, unpaid)

| Query | TW in top 5? | Note |
|---|---|---|
| SDF spending / work / development | **yes, rank 5** | residual leak |
| `skills.trustless-work.trustless-work-dev` | yes, rank 1 | exact id |
| `trustless-work-dev` | yes, rank 1 | exact last segment |
| `trustless work` | yes, rank 1 | distinctive component |
| `How do I integrate Trustless Work escrow?` | yes, rank 1 | name + description |
| `Trustless Work escrow API x-api-key` | yes, rank 1 | genuine API discovery |
| path payments | no | description repair held |
| StellarX / SDF-built | no | held |
| Blend TVL | no | held |
| Soroban CLI bindings | no | held |
| `How do I connect a Stellar dapp wallet?` | `skills.stellar-dev.dapp` rank 3 | other whole skills |
| `stellar ecosystem digest this week` | digest skill rank 1 | other whole skills |
| OpenZeppelin secure contracts | OZ develop-secure-contracts rank 1 | hyphenated last segment with `develop` |

## Proposed rule

Apply only to `kind === "skill"` (whole-skill entries). Do not change `vendor/search-scoring.ts`. Do not change operation scoring. Skill-sections stay `searchable: false` in the shipped catalog.

After `scoreEntryWeighted` / ungated replica returns a number, **null that score unless one of these holds**:

1. **Exact identity.** Normalized query equals normalized `id` or normalized last-segment `name`. This is the existing +20 exact-match family. Keep `skill.read` / typed id lookup discoverable.
2. **Hyphenated last-segment phrase.** The query contains the full last segment as a phrase (`trustless-work-dev`).
3. **Distinctive last-segment component.** Some hyphen component of the last segment has length ≥ 6 and appears as an **exact** query token (`trustless`). Prefix is not enough (`development` must not satisfy `dev`).
4. **Description evidence.** Some non-stopword description token of length ≥ 5 appears as an **exact** query token (`escrow`, `milestone`, `dispute`, `release`).

If none hold, the whole skill is not a search hit. Exact-id describe/read/run is unchanged because those paths do not use this scorer.

That is an admission boundary, not a per-query exception and not a rename.

### Why this is smallest

- It does not retokenize the vendor.
- It does not invent a `work` stopword (that would harm “Trustless Work” queries and other prose).
- It does not special-case `skills.trustless-work.trustless-work-dev`.
- It treats hyphenated last segments as product slugs: short fragments (`dev`, `work`, `kit`, `app`) are routing noise; the long component or the description carries intent.

## Expected effect on the probes

| Query | After the rule |
|---|---|
| SDF spending | drop TW (`work` is 4 letters; `development` is prefix-only; no escrow terms) |
| exact id / `trustless-work-dev` | keep (rules 1–2) |
| `trustless work` | keep (`trustless`, rule 3) |
| escrow / x-api-key integration | keep (`trustless` and/or `escrow`, rules 3–4) |
| `dapp wallet` | `skills.stellar-dev.dapp` still admits: last segment is a single token `dapp`, treated as complete name equality when that token is present, **or** keep single-token last segments as rule 1b: exact token equals the entire last segment |
| digest | `digest` length 6, exact, rule 3 |
| OZ “develop secure contracts” | `develop` length 7 exact, plus `contracts`; SDF “development” does not exact-match `develop` |

Add an explicit subclause for **unhyphenated last segments**: if `name` has no hyphen, an exact query token equal to that whole name admits the skill (`dapp`, `data`, `assets`). Do not let that subclause apply to one hyphen piece of a multi-piece slug.

## All-source implications

Every whole skill with a hyphenated slug is affected:

- `trustless-work-dev` — intended.
- `stellar-ecosystem-digest` — `ecosystem` / `digest` (both ≥ 6) still admit topical queries.
- `develop-secure-contracts` — exact `develop` still works; prefix `development` does not.
- `stellar-dev.*` children whose last segment is `dapp` / `data` / `assets` stay on the unhyphenated clause.
- Future vendor skills named `something-dev` or `platform-work` will not rank on “development” or “work” alone. That is the point.

Operations keep vendor path/method analogue (id weight 12, name weight 10, prefix matches). Scout and Docs ops are unchanged. Drift-author intent filters on operations must not be reused as a Trustless-only patch.

## Vendor parity and discovery contracts

- **Vendor parity:** do not edit `src/catalog/vendor/search-scoring.ts`. Prefix matching remains for operations and for the raw score. The new rule only decides whether a **whole-skill** score may enter the result page.
- **Exact-id access:** rule 1 preserves current exact id/name bonus behavior.
- **Active discovery:** genuine Trustless Work / escrow questions still match `trustless` or description tokens. Do not require the user to type the hyphenated slug.
- **Host description:** keep the current escrow-scoped override. Do not add SDF-specific negative wording.
- **No gate change in this design step.** After implementation, source author and drift author run the unpaid routing gate together on one frozen tree.

## Implementation placement

Prefer `scoreCandidates` in `search.ts` (where `kind === "skill"` is visible) or a helper next to `entryScoringName`. Do not put this inside vendor `scoreField`.

If drift’s `hasSpecificRoutingIntent` / `tokensOverlap` work lands first, compose: this skill-kind gate runs for whole skills; Scout operation intent filters stay on operations. One shared `tokensOverlap` change is **not** a substitute: SDF uses exact `work`, not only prefix.

## Out of scope

- Renaming `trustless-work-dev`
- Per-query scoring exceptions
- Shipping `GET /api/rwa` or changing routing floors
- Final source acceptance

## Coordination

Source author owns the skill-kind admission helper and tests for exact-id plus escrow positives plus SDF/path-payment negatives.
Drift author owns Scout operation intent and must not regress this helper.
Join before either lane claims routing acceptance.
