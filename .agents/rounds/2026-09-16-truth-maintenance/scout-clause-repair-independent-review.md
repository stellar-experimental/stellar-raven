# Independent non-X clause repair review

Reviewer: Grok high (Grok 4.6). Distinct from parent, Terra, quality Sol, and runtime Sol.
Clock: `2026-09-16T23:22:15Z`.
Mode: read-only. **No gate edit. No holdout identity or text in this file. No case-specific tuning.**

Live file under review: `source-integration/src/catalog/search.ts` SHA-256 `46fa7be7cad1f50bdfb8d48ab5af85d14fcb8cdd98997d2647f30c78ca9e5111`. Not the prior `6aca9f7c…`.

Result: `source-integration/eval/results/routing-2026-09-16T23-20-09-940Z.json` SHA-256 `17a8c81fd553b84ca27545712e676f022f491410bf46c2a8d9c98e7f44b791a8`.
Before: `22:56:43-112Z` SHA-256 `bdcdb8f7e725212bb4d7a49f297100302e9b8587445abd7c476a2c68137d0057`.
Movements: `/tmp/raven-execution-2026-09-16/scout-clause-repair-movements.json` SHA-256 `448f35962028c6c782a226697b43f5af1e3399bd926dd21f84bd541d11b4d567`.

Catalog file hash still `da21ab9a…`. Gates **unchanged**. Frozen quality tree **unchanged**. Existing final timings precede this fix. Root remeasures only after this verdict. Terra rechecks modifier logic.

## Clause (adversarial)

`negativeRoutingIntentCoverage` no longer drops only the token after source `non`. If a source phrase contains `non X`, the **whole phrase** scores 0 unless the **original ordered** query tokens (`prepareQueryForm` `tokens`, including stopwords) contain adjacent `non`+X or `not`+X, with `tokensOverlap` on X.

Other exclusion phrases without `non` still use plain `routingIntentCoverage`. Positive phrases are unchanged.

Call site passes `query.scoring.original.tokens` as `queryWords` and content tokens as `queryTokens`. The per-search `routingRejections` map is unchanged.

This matches the Terra defect: “Which stablecoins issued assets?” no longer treats leftover `issued`+`assets` as a two-token negative. “Which stablecoins are issued as Stellar assets?” is the same class. Genuine `non-stablecoin` / `not stablecoins` still require the modifier and still reject `getStablecoins`.

Conservative residual (Terra’s check): `not` / `non` must sit **immediately** before X in the token stream. A hedge with a word between them will not arm the clause. That under-rejects, it does not over-reject positives.

Focused tests in `test/drift-141-routing.test.ts` encode the positive and negative probes. Parent reports **57 focused tests pass**. This lane did not re-run them.

`ecosystem-skills/groups.json` is valid UTF-8. The tracked diff adds a `.github` skip string. It is not a routing rule.

## Independent dump check

Versus 22:56, independently:

| Lane | Identity changes | Grade changes |
|---|---:|---:|
| legacy 338 | 0 | 0 |
| extended 122 | 0 | 0 |
| skills 23 | 0 | 0 |
| protocol 12 | 0 | 0 |
| holdout 49 | **1** | **top3 1 loss** |

Legacy 219/298/326 card 112, extended 93/111/117 card 16, skills 17/23/23, protocol 7/7/7, forbidden 10, holdout passed 24 — all match 22:56 except holdout **top3 27→26**. Parent aggregate is correct.

## Hidden holdout movement (no identity, no text)

Inspected the one changed holdout row against before/after hits.

The query contains a `non-Y` modifier that is **not** the source clause’s `non-X`. Under the old rule, presence of `non` armed the full source phrase (including unrelated remainder tokens). Under the new rule that clause correctly scores 0, so a Scout “brief” operation that was previously excluded now scores and takes rank 1.

The **dedicated similar-proposal and program-radar surfaces remain in the top 5**. Expected-service skills leaves top 3 and stays at rank 4. That is why top3 flips. `pass` and forbidden counts do not move.

Class: **not a concrete user-facing regression that should block the clause.** It is a side-effect of a general, correct modifier scope. Rank 1 is a weaker sibling “brief” than the still-present similar-proposal hit. Do **not** restore the old false `non` trigger. Do **not** send this case to authors or root. Do **not** propose a holdout-specific patch.

## Decision

**Accept the non-X clause repair** on `46fa7be7…`.

**Do not block** on the hidden holdout top3 movement.

**Do not edit gates** in this turn. If this dump is the freeze for holdout acceptedTotals, record **top3 26** (not 27). Legacy/skills numbers are unchanged from the prior 219/298/326 and 17/23/23.

**Do not accept timings** for this file. Root remeasures after this semantic verdict.

**RWA remains excluded. #141 stays open.**
