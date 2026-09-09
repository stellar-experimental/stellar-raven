# Issue #124 bounded implementation experiment

Date: 2026-09-09

## Verdict

The experiment improves both original leaderboard triggers.
It changes no frozen routing row.
The behavior candidate is acceptable for independent code review.
This verdict is not a shipping decision.

The unchanged gate command exits `1` for the expected manifest fingerprint change.
Its quality counts match the accepted counts exactly.
I did not change the gate or its evidence.

## Scope and authority

This work used the approved eight implementation files and this report.
All implementation files remain unstaged.
I made no commit, stash, branch, worktree, pane, server, paid call, or GitHub write.
I did not change scoring, labels, exposure, or gate thresholds.
I preserved unrelated worktree changes.

PR `#147` merged as `58898790348b05601bc70b992507f0a8ba6aed0c`.
That merge changes reports and improvement records only.
It changes none of this experiment's eight implementation files.

The measured local HEAD was `43b99d14e54f30478f635de0718a65637f781ef9`.
No implementation file changed between `b6913d1` and that local HEAD.
No implementation file changed between that local HEAD and merge `5889879`.

## Source provenance

The accepted behavior base is `b6913d13e8ea0df15382503eb16ed47327a450d6`.
Its accepted manifest SHA-256 is `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`.
The accepted gate trace is `eval/results/routing-2026-09-09T16-46-02-887Z.json`.
That trace passed the unchanged gate.

The diagnosis trace is `eval/results/routing-2026-09-09T16-44-14-655Z.json`.
Its 544 rows equal the accepted gate trace exactly.
It ran before the gate evidence recorded the accepted manifest hash.

The candidate manifest SHA-256 is `0745b09421e0ad56e4398dcdabde8477a047c3852bb4c528567b8af0028abcfd`.
The candidate trace is `routing-2026-09-09T18-53-12-142Z.json` in the temporary evaluation copy.

Both arms use the same accepted Scout source.
The source is `https://stellarlight.xyz/api/openapi.json`.
Its version is `1.9.1`.
Its recorded fetch time is `2026-08-28T12:50:57.417Z`.

The candidate adds only generated phrase metadata and final selection logic.
It does not absorb the rejected Scout `1.9.49` source.
Removing `routingPhrases` makes the candidate manifest JSON equal the accepted manifest.

## Original trigger results

### `top projects by GitHub activity`

The accepted source-identical control returned these hits:

| Rank | ID | Score | Tier |
| ---: | --- | ---: | --- |
| 1 | `scout.searchProjects` | 165 | `gated` |
| 2 | `lumenloop.find_similar_projects_semantic` | 155 | `gated` |
| 3 | `lumenloop.find_content_by_entity` | 145 | `gated` |
| 4 | `scout.searchRepos` | 139 | `gated` |
| 5 | `skills.lumenloop.stellar-project-dossier` | 90 | `gated` |

The candidate returned these hits:

| Rank | ID | Score | Tier |
| ---: | --- | ---: | --- |
| 1 | `scout.searchProjects` | 165 | `gated` |
| 2 | `lumenloop.find_similar_projects_semantic` | 155 | `gated` |
| 3 | `lumenloop.find_content_by_entity` | 145 | `gated` |
| 4 | `scout.getLeaderboard` | 108 | `gated` |
| 5 | `skills.lumenloop.stellar-project-dossier` | 90 | `gated` |

Both pages report `total: 41` and `truncated: true`.
The target enters the top five.
The later Scout slot changes from repository search to project ranking.

### `top Stellar projects by GitHub activity`

The accepted source-identical control returned these hits:

| Rank | ID | Score | Tier |
| ---: | --- | ---: | --- |
| 1 | `skills.lumenloop.stellar-project-dossier` | 199 | `gated` |
| 2 | `scout.searchProjects` | 185 | `gated` |
| 3 | `skills.lumenloop.stellar-ecosystem-scout` | 165 | `gated` |
| 4 | `scout.searchRepos` | 159 | `gated` |
| 5 | `stellarDocs.get_doc_page_sections` | 157 | `gated` |

The candidate returned these hits:

| Rank | ID | Score | Tier |
| ---: | --- | ---: | --- |
| 1 | `skills.lumenloop.stellar-project-dossier` | 199 | `gated` |
| 2 | `scout.searchProjects` | 185 | `gated` |
| 3 | `skills.lumenloop.stellar-ecosystem-scout` | 165 | `gated` |
| 4 | `stellarDocs.get_doc_page_sections` | 157 | `gated` |
| 5 | `scout.getLeaderboard` | 129 | `gated` |

Both pages report `total: 33` and `truncated: true`.
The target enters the top five.
Existing scores and tiers do not change.

## Implemented mechanism

The builder preserves positive Scout `x-routing` source strings as token phrases.
It preserves `purpose`, `useWhen`, and `exampleQuestions` strings.
It also preserves each single multiword `keywords` item.

The accepted `top projects` text is one published `keywords` item.
The builder never joins separate keyword items.
It drops one-token items because they cannot meet the coherent phrase rule.
It continues to exclude `notFor`.

The 256-token cap keeps a prefix of complete phrases.
The extractor stops before a phrase that does not fit.
It never stores a chopped phrase as coherent evidence.

The selector runs after the unchanged gated scorer and service diversity.
It inspects only gated overflow operations.
It skips a `detail` retrieval lane.
It requires two query tokens in the description alone.
It requires one source phrase to match at least two query tokens.
The phrase must add a token that the description lacks.
The description and that phrase must cover every query token.

Schema `keywords` never provide structured intent evidence.
Two source phrases cannot combine their evidence.
The selector preserves the first selected service result.
It replaces at most one later slot for each full service quota.
It replaces only a result with weaker intent coverage.
It restores score order with the existing identifier tie-break.

## Design corrections and deviations

The diagnosis proposed a four-token query floor.
The independent design review rejected that example-length floor.
The candidate instead requires two description matches.

The three-token positive test proves the corrected rule generalizes.
The two-token ambiguous test proves that one description token is insufficient.

The review described positive prose fields and questioned `keywords` provenance.
The implementation includes only real multiword `keywords` source items.
This choice is necessary because accepted `top projects` lives in that field.
The implementation does not join independent items.

The first extractor candidate chopped the last phrase at its cap.
The final extractor rejects that partial phrase.
This correction happened before routing measurement.

The first selector candidate allowed a description-only full match.
The final selector requires a qualifying phrase.
This correction also happened before routing measurement.

## TDD evidence

The first public regression test failed before the selector existed.
It returned `scout.searchRepos` instead of `scout.getLeaderboard`.

The description-only boundary failed against the first selector candidate.
The selector incorrectly replaced the second Scout result.

The three-token positive also failed before the design correction.
The old four-token floor blocked the valid overflow result.

The extractor tests failed for separate unigrams and chopped cap output.
The final extractor passes those tests.

The focused suite passed `145` tests across three files.
It includes both original triggers and all requested selector boundaries.

## Frozen routing comparison

The candidate and accepted source produced identical complete hit lists and scores.
The comparison covered every frozen row.

| Lane | Changed rows | Total rows |
| --- | ---: | ---: |
| Legacy | 0 | 338 |
| Extended | 0 | 122 |
| Skills | 0 | 23 |
| Holdout | 0 | 49 |
| Protocol history | 0 | 12 |
| Total | 0 | 544 |

The candidate causes no expected-card loss.
It causes no service-grade loss.
It causes no new forbidden holdout capture.
It causes no new protocol-history control capture.

The quality totals equal the accepted gate evidence:

- Legacy: top-one `213`, top-three `279`, and top-five `312` from `338`.
- Skills: top-one `16`, top-three `23`, and top-five `23` from `23`.
- Holdout: `21` passed, with `11` forbidden captures from `49`.

The frozen protocol-history diagnostic remains failed in both arms.
It has top-five target coverage of `4/8`.
It has `2/4` control captures.
This experiment does not change that existing diagnostic state.

## Gate interpretation

`npm run eval:routing -- --gate` exited `1`.
The only failure was the manifest SHA-256 mismatch.
The gate expected `83d9998f...` and measured `0745b094...`.

This mismatch follows from the new generated `routingPhrases` metadata.
It does not identify a routing quality loss.
The gate's accepted quality criteria all match exactly.

I did not update `eval/gates.json`.
A later acceptance change must review the new manifest fingerprint explicitly.

## Verification

| Command | Result |
| --- | --- |
| Focused Vitest command | PASS, `145` tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, `2014` tests in `109` files |
| `npm run build` | PASS |
| `npm run test:smoke` | PASS, `85` tests in `4` files |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |

The first smoke run failed inside the restricted sandbox.
The sandbox blocked the Wrangler log path and localhost binding.
The authorized rerun passed.

## Handoff

Keep the implementation files unstaged for independent review.
The reviewer must check the selector and generated manifest before any acceptance change.
The gate evidence remains unchanged by design.
