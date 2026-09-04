# Envelope guidance and category routing check — 2026-09-04

## Scope

This lane checked two bounded hypotheses from the post-candidate measurement.
It made no paid call.
It made no scoring, manifest, baseline, or generated-artifact change.

## Envelope guidance

| rows | stored verdict | current source | current generated output | decision |
|---|---|---|---|---|
| `q-gap-scout-status-envelope`, `q-gap-scout-changelog-envelope`, `q-gap-explainrepo-payload-ok`, `q-ti-explain-repo-payload-status` | All four were partial for omitting the outer Raven `ok` versus Scout `data.ok` distinction. | `scripts/description-notes.mjs` contains a shared note for `getStatus`, `getChangelog`, and `explainRepo`. | `catalog/manifest.json` contains the note in `scout.getStatus`, `scout.getChangelog`, and `scout.explainRepo`. | Covered. No code change. |

The stored artifact is `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.
The artifact confirms all four partial rows and their missing-fact reason.

`scripts/build-catalog.mjs` applies `SCOUT_DESCRIPTION_NOTES` to each Scout operation.
The same source also feeds `scripts/build-super-spec.mjs`.
The source note predates this lane.
`git blame` shows `getStatus` changed on 2026-08-04.
The other two notes date to 2026-07-03.

Before and after are the same surface.
The current source and manifest state already meet the requested general guidance.

## Category routing

The compiled routing case already exists.

| input | expected operation | current top-five result | decision |
|---|---|---|---|
| `q-defi-lumenloop-categories-vocab` | `lumenloop.get_categories` | `skills.lumenloop.stellar-ecosystem-scout`, `lumenloop.search_directory`, `lumenloop.get_project`, `scout.analyzeEcosystem`, `scout.searchProjects` | Miss. |
| `ecosystem project category filter` | `lumenloop.get_categories` | `scout.analyzeEcosystem`, `lumenloop.get_project`, `skills.lumenloop.stellar-ecosystem-scout`, `lumenloop.get_related_projects`, `scout.searchProjects` | Miss. |
| `directory project categories list` | `lumenloop.get_categories` | `scout.listAudits`, `scout.searchProjects`, `lumenloop.search_content_semantic`, `skills.lumenloop.stellar-ecosystem-scout`, `skills.stellar-dev.smart-contracts` | Miss. |

The exact operation description already says it returns the controlled category vocabulary.
It also says to use exact values before filtering or labeling.
The evidence does not support another wording change.
A repair needs a general scoring design.
It must not add a query rule or an operation exception.

The existing general scoring TODO now records this family and an acceptance condition.
The ranked before and after dumps are byte-identical.

## Changes

- Recorded the completed envelope result in this report only.
- Added the category-family evidence to the existing general scoring TODO.

No generated artifact changed.
No source code changed.
No test changed because no implementation changed.

## Checks

- `npm run eval:compile` passed. The generated routing corpus had no diff.
- `npm run eval:selftest` passed.
- `npm run eval:routing -- --gate --dump-ranked /tmp/envelope-guidance-routing-ranked-before.json` passed its gate.
- The matching after dump also passed and was byte-identical.
- Focused `test/catalog.test.ts` and `test/search.test.ts` passed: 107 tests.
- `npm test` passed: 1,770 tests.
- `npm run typegen`, `npm run typecheck`, and `npm run build` passed.
- `npm run secrets:scan -- --tree` passed.
- The routing results were `eval/results/routing-2026-09-04T06-26-49-265Z.json` and `eval/results/routing-2026-09-04T06-30-53-669Z.json`.

## Risks and blockers

The category defect remains open.
The routing gate can pass while this single case misses.
The existing general scoring program owns the next action.
No paid measurement is authorized by this check.
