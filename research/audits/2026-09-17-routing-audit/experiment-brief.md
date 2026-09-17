# Routing simplification experiment

Status: free candidate work authorized; paid collection awaits independent review and final pins.

Baseline: `848edec4c9a156ef16f71dc0605409aa59c0be5c`.
Production exposure stays unchanged. RWA remains excluded.

## Candidate D3: remove the directory field-placement exception

Hypothesis: directory admission must not depend on a token being absent from its source keyword field.
The existing exception requires a unique token in useWhen and exampleQuestions, but not purpose or keywords.
Adding the same entity to keywords can therefore remove the exception.
This depends on source field placement rather than stronger evidence about the requested action.

Single change: delete `discriminativeDirectoryVocabularyCoverage` and code used only by that exception.
Keep the other scoring, quota, recovery, alias, exposure, and source contracts unchanged.
Do not add replacement entity lists or thresholds.

Mechanism checks use synthetic directory entries from unrelated project and builder domains.
Move repeated entity evidence into purpose or keywords and require stable admission.
Use six symmetric controls: exact ID, exact service filter, operation kind, skill kind, unrelated entity, and enum-only query.
The existing Soroswap case remains evidence of changed behavior; do not delete its historical result.

Evaluation: baseline and candidate routing gates, exact-ID checks, protocol-history diagnostic,
the frozen 54-case challenge, and reviewed per-case changes.
The challenge hash is `34edbc2fe99dd560a1c1350dbd9b371020b9f7d149b85f440d8d12fb43f63406`.
The implementer must not inspect its per-case outputs.
Stop after any verified control, exposure, security, or exact-ID regression.
Do not change the frozen acceptance thresholds to make this candidate pass.

Paid answer verification will include every affected active QA case and unrelated controls.
The paid brief will fix those IDs, models, runner, surface, corpus, repetitions, and method ceilings before collection.
No paid result can override a verified loss of required facts.

## Separate source-authority repair

Hypothesis: scope factual-source guidance by claim type to remove conflicting instructions.
Protocol and API facts use official Docs; ecosystem facts use Scout and Lumenloop.
This is a separate prompt change. Review and measure it separately from D3 before combining candidates.
Do not rewrite upstream descriptions or add a second routing profile taxonomy.

## Rejected proposals

- A 70% catalog-frequency cutoff changes 91 ranked lists and loses source coverage.
  It has no principled acceptance basis yet and will not ship in this round.
- Do not weaken issue #167 from its current controls merely to permit exposure.
- Do not delete all unprofiled-operation safeguards without proving the claimed guidance defect.
- Do not treat all entity aliases as invalid merely because one published alias pack exists.

Approved total evaluation cap: $250. Paid spend remains $0.

## D3 free review

The candidate changes one of 501 active QA questions: `q-defi-soroswap-what-is`.
The long Soroswap question loses `scout.searchProjects` at rank 5, including under the Scout service filter.
The Lumenloop service-filtered route and documented entity-first queries still reach project directories.
Legacy strict grades remain 219/298/326; accept-either top-5 falls from 337 to 336.
The blind holdout and frozen challenge show no changed ranked lists.

Fable high conditionally accepted D3 after independent review.
The reviewer rejected a test that required the real Soroswap route to stay absent.
The coordinator deleted that assertion. This record preserves the changed behavior without making it a desired contract.
Paid comparisons must include the affected Soroswap question and unrelated controls before release.
