# Routing design — candidate 1

The current scorer treats a partial token as independent evidence.
Short field tokens therefore match unrelated query words.
The tokenizer also splits `dApp` into `d` and `app`.
Schema tokens then supply unrelated coverage through substring matches.
Routing keyword flattening joins unrelated source clauses.
The phrase extractor allocates fairly, but flat keywords use a different budget.
Five gated rows can exclude a stronger result before scoring.
The identity fallback treats one operation-name component as a complete identity.

## One evidence model

Each entry has identity, description, source phrases, and auxiliary schema evidence.
Every field uses the same token matcher.
Whole words and grammatical forms supply evidence.
Partial tokens contribute only after an independent whole-word anchor.
Partial tokens never supply coverage.
Closed-class words do not supply token scores or coverage.
Full phrases use token boundaries.
The tokenizer preserves a single lowercase prefix before a capitalized word.
This orthographic rule handles `dApp`, `iPhone`, and `eBay` consistently.

Source phrases remain separate scoring alternatives.
Each alternative combines the description with one complete source phrase.
Declared keywords provide vocabulary after a phrase establishes intent.
Example questions corroborate declared intent; example topics cannot establish intent alone.
Schema evidence supplies rank only after content establishes admission.
Page-title evidence stays separate from schema evidence at build time.
Input enum evidence remains a separate complete-value witness.

The phrase extractor keeps its deterministic fair allocation.
Routing scoring derives vocabulary from retained phrases, including singleton keywords.
No independent flat-token cap can discard an older phrase's scoring vocabulary.
An exact operation ID always resolves.
An identity fallback requires every meaningful operation-name component.
Source exclusions retain their precedence.

All admitted candidates compete before page selection.
The existing 1.6 tier margin becomes a comparison weight before diversity selection.
The candidate count therefore cannot suppress an unscored stronger candidate.
Targeted vocabulary selection and freshness ordering remain explicit selection rules.

## Generality and measurement

These rules use token structure, field provenance, and catalog data.
They contain no operation IDs, question IDs, query exceptions, or tuned token-length threshold.
The existing numerical field weights, coverage requirement, and tier margin remain fixed.
The three-revision limit applies to complete candidate models.
Every revision runs all 544 rows on current sources and fresh sources.
The routing baseline, labels, and gate thresholds remain unchanged.
The report records all 12 checks, the dApp override, and the three RWA controls.

## Candidate 2 revision

Whole-content anchors stopped the original unrelated short-token triggers.
Strict coverage reduced legacy top3 from 298 to 271.
The first candidate also kept all three mixed RWA captures.
The second revision treats a partial match as corroboration after a whole-content anchor.
The anchor must occur in the same field.
Closed-class words match only complete words and cannot anchor a field.
Coverage and ranking use this shared evidence rule.
Procedural questions also require their leading action and object in declared capability text.
An example topic cannot supply that action witness.
The grammar rule applies to every operation with source-authored exclusions.
No service or operation name selects the rule.
The phrase budget now counts distinct vocabulary, with a separate bounded phrase count.
Repeated source phrases cannot consume the vocabulary budget repeatedly.
Fair field allocation still retains whole phrases.

## Candidate 3 revision

Candidate 2 restores some legacy coverage but increases unrelated positive evidence.
Its procedural witness removes the three mixed RWA captures.
It still captures the custom-token walkthrough through inconsistent word forms.
Candidate 3 restores strict content coverage and keeps the procedural witness.
One shared grammatical matcher handles plurals, past tense, gerunds, and regular suffix forms.
The matcher uses grammar rules, not a token-length threshold.
All scoring alternatives use the same matcher.
Schema properties still cannot establish coverage.
Titles retain their existing low-weight contribution after content establishes coverage.
The selector scores every admitted entry before it applies the gate preference.
Strong candidates can replace a weaker result from their own service or a repeated service.
The existing 1.6 margin and stronger-intent requirement control each replacement.
The first result remains protected.
This final revision uses the full three-candidate allowance.
