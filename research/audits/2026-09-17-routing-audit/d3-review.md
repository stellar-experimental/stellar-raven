Status: the coordinator removed the reported real-query absence assertion before commit `181d5b0f`.
The independent reviewer verified the removal. Paid answer comparison remains pending.

# D3 review: remove the directory field-placement exception

Reviewer: Fable high (route-audit-direction). Author: Opus code lane. Coordinator: root Astra.
Read-only review. No edits, paid calls, servers, Git commands, or nested agents.
Holdout and the frozen challenge set were inspected as a blind reviewer. This file reports
aggregates only. No holdout or challenge question text or case ID appears here.

## Verdict

**Conditional accept.** The diff implements exactly D3 and nothing else. Every free instrument is
unchanged except one legacy case, which the brief already names as the expected moved case.
Source access for that case survives through documented alternative routes, so this is not a
genuine control loss. One test change launders the moved case into a pinned expectation and must
be repaired before merge. One mechanism finding explains the moved case and belongs to a separate
candidate, not D3.

## Diff scope

- `src/catalog/search.ts`: deletes `discriminativeRoutingTokens`, `GENERIC_ROUTING_ACTION_TOKENS`,
  `discriminativeDirectoryVocabularyCoverage`; narrows `completeInputEnumWitnesses` to a count;
  removes the `discriminativeTokens` parameter from `rejectsRoutingIntent`, `targetedIntentCoverage`,
  `preserveIntentWithinServiceQuota`, `fullPageUngatedAdmission`, and `searchCatalogPage`.
  No threshold, list, or profile field is added. Matches the brief's single-change rule.
- `test/drift-141-routing.test.ts`: one real-query control moved to a negation (see Laundering);
  one new synthetic-domain suite (two domains, three placements, eight controls each).
- No other file changed. `eval/gates.json`, `catalog/manifest.json`, and results are untouched.
  The worktree `src/catalog/search.ts` hash equals `code/search.ts.d3` (`3cc4c140e323…`).

## Free measurements (baseline 848edec4 vs candidate, same manifest `da21ab9ab785…`)

| Instrument | Baseline | Candidate | Changed cases |
|---|---|---|---|
| Legacy 338 strict top-1/3/5 | 219/298/326 | 219/298/326 | 1 list changed (`q-defi-soroswap-what-is`); strict grade unchanged |
| Legacy accept-either top-5 | 337 | 336 | same case loses its rank-5 accept-either hit |
| Extended 122 strict | 93/111/117 | 93/111/117 | 0 |
| Skills 23 | 17/23/23 | 17/23/23 | 0 |
| Holdout 49 (blind) | 12/26/29, forbidden 10, passed 24 | identical | 0 lists changed, 0 pass or forbidden flips |
| Protocol-history v1 diagnostic | 7/8, controls 3/4, FAIL | identical | 0 (pre-existing FAIL) |
| Frozen 54-case challenge (`34edbc2f…`) | 12 strata tallies | identical | 0 top-5 lists changed, 0 flips |
| Known controls set (3) | 2 pass / 1 fail | identical | 0 |
| QA 501, live 15, digest 2, discovery 43 (author's affected-diff at limits 5/8/10) | | | 1 QA case and its discovery twin; both are the Soroswap case |
| Routing gate `--gate` | PASS | PASS | |
| Unit suites `drift-141`, `search`, `catalog`, `mcp-instructions` on candidate | | 224 passed, 3 skipped | |

Candidate run artifact: `repo/eval/results/routing-2026-09-17T00-44-39-947Z.json`.
Baseline run artifact: `repo/eval/results/routing-2026-09-17T00-26-33-412Z.json`.
Challenge outputs: reviewer scratchpad only (per-case outputs withheld from the implementer).

## The moved Soroswap case: source access check

Query (already public in `test/drift-141-routing.test.ts` and the legacy corpus):
"What is Soroswap and what makes it different from other Stellar DEXes?"

Why it moves: on the candidate, `scout.searchProjects` is rejected before scoring by
`rejectsRoutingIntent`. Diagnosis of the admission branches for this query:
- Best single positive phrase covers 1 token (`soroswap` in one useWhen phrase; `dexes` in another).
- Enum witnesses: 1 (`type: DEX`). Two are required.
- Vocabulary witness: 2 of 6 routing keywords matched; 3 are required.
- Identity token `projects` is absent from the query.
The deleted rule was the only branch that admitted "entity + one enum" and it keyed on field placement.

What remains on the candidate for this query:
- Default page (limit 5 and 10): no project-directory operation in hits. Advisories: docs, `scout.searchResearch`, `lumenloop.search_content_semantic`.
- Pool at limit 50: `lumenloop.search_directory` at rank 23 of 48; `scout.searchProjects` absent at every limit.
- `service: "scout"` filter: only `scout.resolveProject` plus a research anchor. The Scout project directory is unreachable under this filter for this phrasing.
- `service: "lumenloop"` filter: `lumenloop.search_directory` rank 2 and `get_project` rank 5 (unchanged from baseline).
- Documented entity-first workflow (search description step 2, base instructions): `"soroswap"` and
  `"what is soroswap"` return `lumenloop.search_directory` gated on page and `scout.searchProjects`
  as the short-query-directory advisory. Identical on both arms.
- Related unlabeled phrasing `"Soroswap DEX"` also loses `scout.searchProjects` (baseline rank 1
  backfill) but gains `lumenloop.search_directory` on the page.

Assessment: a project-directory route stays reachable through the Lumenloop family, the
service-filtered Lumenloop page, and the documented entity-first search on both families. The loss
is confined to the Scout directory under the verbatim long phrasing and under the Scout service
filter. This is the exact behavior change the brief predicted and does not remove source access.
It is a measured accept-either loss of one case inside the 1% band. Do not block on this ground.

## Laundering finding (must fix before merge)

The original control line
`"What is Soroswap and what makes it different from other Stellar DEXes?"` was removed from the
positive `it.each` and re-added as `does not admit directory lookup from source field placement
alone`, asserting `not.toContain("scout.searchProjects")` at limit 50 with a rationale comment.
This converts a documented control loss into a pinned expectation. A future general repair that
restores the route (for example the mechanism below) would fail this test and be pushed back.
The brief says the case remains evidence of changed behavior. A negated real-query pin is not
evidence; the synthetic suite already proves the mechanism.

Required repair options (author's choice):
1. Delete the negated real-query test and record the moved case in the round ledger with both
   arms' ranks, or
2. Replace it with an alternative-route assertion that is true and desirable: the page for that
   query still carries a broad advisory and `"what is soroswap"` still reaches a directory
   operation on the page or in `widerCandidates`.

The renamed positive `it.each` title ("admits directory lookup from positive phrase evidence
without case dependence") is accurate for the three retained queries. Acceptable.

## Synthetic suite check (not laundering)

Run against baseline `search.ts` with the production manifest: 9 of the new assertions fail on
baseline and pass on the candidate (placement-equality for entity-with-enum, service filter, and
operation kind in both domains; no-admission-without-phrase in both domains). The suite therefore
discriminates the mechanism. Controls are symmetric across two unrelated domains. One extra
failure in my harness (`separates RWA discovery from implementation`) was an artifact of setting
`RAVEN_ROUTING_MANIFEST` to the production manifest and is not a candidate defect.

## Mechanism finding for a separate candidate (not D3)

The upstream useWhen phrase for `scout.searchProjects` reads "list enumerate compare curated
directory wallets exist differ … dexes". It was published for this question shape. The query
token `different` does not overlap `differ` because `tokensOverlap` requires a 0.75 length ratio
(6/9 = 0.67). With that overlap the phrase covers 2 tokens (`differ`, `dexes`) and the operation
is admitted by the existing positive-phrase rule, with no placement rule and no entity list.
Hypothesis: a general suffix canonicalization (`-ent`, `-ence` → stem, alongside the existing
`-ing` strip in `routingConceptToken`) restores this case and is query-independent. This changes
a lexical rule, so it is a new candidate with its own gate run, challenge run, and review. It is
outside the D3 brief and must not ride in this diff.

## Exclusions and limits

- Holdout and challenge per-case outputs were read by the reviewer only and are not reported.
- No paid QA verification ran. The paid brief must include `q-defi-soroswap-what-is` and its
  discovery twin `agentic-lumenloop-q-defi-soroswap-what-is` as affected cases, plus unrelated controls.
- Protocol-history v1 remains FAIL on both arms; pre-existing and unrelated.
- The candidate routing run wrote one gitignored results file in the worktree. Nothing else changed.

## Reproduction

```
cd /tmp/raven-routing-audit-2026-09-17/repo && git diff --stat            # 2 files
node eval/run-routing.mjs --gate                                            # candidate gate PASS
node /tmp/raven-routing-audit-2026-09-17/evals/rank-challenge.mjs <repo> <manifest> evals/challenge-set-v1.json <out> <arm>   # both arms, tallies identical
npx vitest run test/drift-141-routing.test.ts test/search.test.ts test/catalog.test.ts test/mcp-instructions.test.ts
# reviewer scripts (scratchpad): soroswap.test.ts, routes.test.ts, why.test.ts, baseline-drift141.test.ts
```

## Addendum after reading `code/implementation.md`

1. **Blocking (test contract).** The new test `does not admit directory lookup from source field
   placement alone` turns a real project question into a product contract that requires the correct
   directory operation to be absent at limit 50. That is the inverse of the product goal. The
   implementation report itself calls the row "explicit evidence of the changed real Soroswap
   behavior"; evidence belongs in the audit record (this file, the round ledger, and
   `code/soroswap-real-before.jsonl` / `after.jsonl`), not in a pinned negation. Required: delete
   that test. The synthetic placement-invariance suite stays; it discriminates (9 baseline failures)
   and is the legitimate mechanism contract. Optional: keep one positive real-query assertion that a
   directory route still exists for the documented entity-first search (`"what is soroswap"` yields
   `lumenloop.search_directory` on the page and `scout.searchProjects` in `widerCandidates`).
2. **Not blocking, scope note.** Part 2 (RWA control activation via `exposesRwa`) is a test-only
   repair outside the D3 single-change rule. It is correct and safe, but it should land as its own
   commit so the D3 diff stays one mechanism.
3. **Not blocking, worktree hygiene.** The worktree now also carries changes not owned by this lane:
   `.agents/NEXT.md`, `.agents/skills/run-evals/SKILL.md`, `eval/EVALS.md`, `eval/discovery/cases.json`,
   and untracked `test/eval-discovery-cases.test.mjs`. The D3 commit must not sweep them in.
   `src/catalog/search.ts` is unchanged since my measurements (hash `3cc4c140e323…`).
4. **Blind-set overlap check (report item 4).** 117 query literals in the test file were compared
   against the holdout and challenge questions, exact and substring, case-folded. Zero overlaps in
   either set. No question text or ID is disclosed here.
5. Report claims verified: 128-line deletion scope, 1 changed page across 460 routing questions,
   exact-ID top-1 unchanged, and the 9-failure baseline detection proof all match my independent runs.
