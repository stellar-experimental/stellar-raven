# Goldens lane report: two new Scout operations (issue #223), 2026-10-06

Lane: `fable-goldens` (Claude Fable 5.1 `claude-fable-5-1`, high), pane `w3W:p1T`.
Worktree: `/Users/kalepail/Desktop/srcm-drift-goldens`, branch `drift/2026-10-06-goldens`.
Nothing was pushed, deployed, or posted. No paid lane ran.

## Result

- Four cases are authored. All four are **proposals**. No case is active.
- The independent review permits activation for three cases. It blocks one case.
- The coverage gate still fails (`operation floor 2; found 0` for each operation).
- The coordinator held the Scout `1.9.71` absorb during the second review pass. For that reason I
  did not activate the three cleared cases.

This is a deviation from the brief. The brief asked for cases under `eval/qa/corpus/battery/` and a
passing floor gate. The `golden-truth` skill forbids a direct battery addition: a new id lands as a
proposal in one commit, and a later commit activates it after an independent review. Activation
also changes `cases.json`, `sample.json`, and the count contracts on a held candidate.

## Commits (local only)

| sha | content |
| --- | --- |
| `8837a422` | Four proposals, the round ledger, the first review, and its reconciliation |
| `486cec46` | Second review pass reconciled; three TODO items |

Base: `c76b517c`. The pre-commit secret scan passed on both commits.
An earlier local proposal commit (`16c49bfa`) was replaced before any push. It reserved an id for a
case that the review rejected.

## Cases

All files are in `eval/qa/corpus/proposed/scf-grants-builders/`. All probes ran on 2026-10-06.

| id | operation | freshness | review verdict | status |
| --- | --- | --- | --- | --- |
| `q-scout-hackathon-winner-libraries-vs-field` | `scout.analyzeHackathonSubmissions` | scheduled, reverifyBy 2027-01-13 | activate | verified |
| `q-scout-hackathon-submission-link-comet-hoops` | `scout.getHackathonSubmission` | stable | activate after edits (applied) | verified |
| `q-scout-hackathon-submission-xbid-outcome` | `scout.getHackathonSubmission`, `scout.searchHackathonBuilds` | scheduled, reverifyBy 2027-01-20 | activate after edits (applied) | verified |
| `q-scout-hackathon-placed-share-kale-vs-zk` | `scout.analyzeHackathonSubmissions` | scheduled, reverifyBy 2027-01-06 | do-not-activate | not verified (`truth.status: unverifiable`) |

Base URL confirmed in `inventory/stellar-light.json`: `https://stellarlight.xyz`.

## Truth evidence per key fact

Source classes follow the `golden-truth` skill: A primary page, B repository, C Scout API,
D general web, F calculation.

### `q-scout-hackathon-winner-libraries-vs-field` (verified)

Question: "Do Stellar hackathon winners build on different Stellar libraries than the rest of the
field, or is the stack about the same?"

| key fact | evidence |
| --- | --- |
| Stellar JS SDK is first among winners, about 78% of those read | C: `https://stellarlight.xyz/api/hackathons/analyze?facet=library&winnersOnly=1` (14:15Z; reviewer 14:28Z): 35 of 45, share 0.778 |
| Soroban Rust SDK is second, about 58% | C: same response: 26 of 45, share 0.578 |
| JS SDK lift is about 1.0 | C: `.../analyze?facet=library`: 0.778 against 0.768, lift 1.01. F: reviewer calculation 1.012 |
| Stellar Wallets Kit lift is about 1.3 | C: same response: 0.356 against 0.267, lift 1.33 |
| Shares use 45 of 64 placed submissions | C: `field` 64, `known` 45, `unknown` 19 |

The aggregates exist only in Scout. Their verdict is `corpus-only`, and the notes accept newer dated
results. Two GitHub manifest samples support the per-submission data: eight repositories by me and
five by the reviewer, twelve distinct. Examples: `https://github.com/poki-tcg/wraith`,
`https://github.com/CTX-com/Cards402`, `https://github.com/MatejMecka/notcircleoftrust`.
Avoid item "every placed submission declares the JS SDK" is contradicted by class B evidence:
`https://github.com/Klorenn/topkale` declares no Stellar JS SDK.

The review found one real error in my first draft: "shares are a floor" was false. It is fixed.

### `q-scout-hackathon-submission-link-comet-hoops` (verified)

Question: "Someone sent me dorahacks.io/buidl/27417. What is that submission, which Stellar
hackathon was it entered in, and did it place?"

| key fact | evidence |
| --- | --- |
| It is Comet x Hoops Finance, a swap interface for Blend's backstop | A: `https://dorahacks.io/buidl/27417`. C: `https://stellarlight.xyz/api/hackathons/builds/27417` (14:39Z). B: reviewer read of the repository README |
| It was entered in Stellar Hacks: Blend | A: `https://dorahacks.io/hackathon/stellar-hacks-blend/report`. D: `https://www.reddit.com/r/Stellar/comments/1lzrofu/announcing_the_winners_of_the_stellar_hacks_blend`. C: same Scout record |
| It took 2nd place | A: DoraHacks summary, "2nd Place Comet x Hoops Finance". D: the r/Stellar announcement, same order. C: `placement: "2nd Place"`. The reviewer read the Reddit page independently |
| Code is at `github.com/hoops-finance/cometswap` | A: submission page. B: `https://github.com/Hoops-Finance/cometswap`, public, last commit 2025-07-06T23:23:53Z. C: `links.github` |

Both avoid items ("did not place", "took 1st place") are contradicted by classes A and D.

### `q-scout-hackathon-submission-xbid-outcome` (verified)

Question: "What did xbid.ai submit to Stellar Hacks: KALE x Reflector, how did it place, and does
Scout's project directory list it now?"

| key fact | evidence |
| --- | --- |
| xbid.ai submitted a multi-LLM AI agent that trades on Stellar | A: `https://dorahacks.io/buidl/32593`. B: `https://raw.githubusercontent.com/xbid-ai/xbid-ai/main/README.md` (reviewer). C: `https://stellarlight.xyz/api/hackathons/builds/32593` (14:18Z) |
| It took 1st place at KALE x Reflector | B: `https://raw.githubusercontent.com/xbid-ai/xbid-ai-blog/main/content/posts/xbid-ai-first-place-stellar-hackathon.md`, dated 2025-09-15. A: `https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/report`. C: `placement: "1st Place"` |
| Scout links it to the directory project XBid AI | C only (`corpus-only`): `project.slug: xbid-ai`, `basis: website`. Footprint: `https://xbid.ai/.well-known/stellar.toml` (HTTP 200) |
| The linked project's status is Live | C only (`corpus-only`), as of 2026-10-06: `https://stellarlight.xyz/api/projects/resolve?q=xbid.ai` (14:22Z) |

The golden names Scout for the two directory facts and dates them. The negative "no SCF award" is
kept out of the key facts.

### `q-scout-hackathon-placed-share-kale-vs-zk` (not verified, stays inactive)

Question: "What share of submissions ended up placing at Stellar Hacks: KALE x Reflector compared
with Stellar Hacks: Real-World ZK?"

| key fact | evidence | gap |
| --- | --- | --- |
| Ten KALE x Reflector submissions placed | A: `https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/report`. C: `.../analyze?facet=placement&by=event&hackathon=stellar-hacks-kale-reflector,stellar-hacks-zk` (14:20Z): 10 of 45 | Scout derives its record from DoraHacks. No independent source gives all ten |
| Five Real-World ZK submissions placed | A: `https://dorahacks.io/hackathon/stellar-hacks-zk/report`. C: same response: 5 of 319 | Same gap |
| About 21 to 22 percent, and under 2 percent | F on the counts above | Depends on the two counts |

The numeric bar needs two independent classes. The reviewer applied the bar that I had applied to
another candidate, and the reviewer is correct. Submission totals also differ by source:
Scout 45 and 319; DoraHacks 46 to 47 and 345.

## Independent review

- Reviewer: `rev-astra-goldens`, Codex frontier `gpt-6-astra`, high effort, pane `w3W:p1W` (closed).
- Tier choice: the author is Claude Fable and the coordinator is Claude Opus, so both Claude tiers
  were not eligible. The change is fact re-derivation, which matches Codex frontier.
- Pass 1 ran without my evidence. Pass 2 ran on the revised cases.
- Reports and the finding-by-finding record are in
  `.agents/rounds/2026-10-06-scout-hackathon-goldens/`: `review-astra.md`,
  `review-astra-pass2.md`, `reconciliation.md` (19 rows, all reconciled).
- Round ledger: `.agents/rounds/2026-10-06-scout-hackathon-goldens.md`.

## Gates on `486cec46`

| command | exit | result |
| --- | --- | --- |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 1 | 2 errors, 62 warnings. The 2 errors are the two operation floors (`found 0`). No warning names a new case |
| `npm run eval:qa:register -- --check` | 0 | `up to date` |
| `npm run eval:selftest` | 1 | 1 failure: `catalog/manifest.json must match its committed gate fingerprint` |
| `npm test` | 1 | 12 failed, 2403 passed, in 6 files |
| `npm run secrets:scan -- --tree` | 0 | clean |

The `eval:selftest` failure and the 12 `npm test` failures are not from this lane. My diff does not
touch `catalog/`, `eval/gates.json`, or `src/`. The same six test files fail on an export of
`c76b517c`: `catalog`, `drift-141-routing`, `live-cases`, `plain-operation-harness`, `search`, and
`super-spec`. `test/qa-lifecycle.test.mjs` passes with the new count contract (4 proposed, 505
reserved ids).

## Re-check when the absorb lands

1. Run the `golden-truth` workflow again for the dated facts. Re-probe
   `.../analyze?facet=library` and `...&winnersOnly=1` for the library case. Re-probe
   `.../builds/32593` and `/api/projects/resolve?q=xbid.ai` for the xbid.ai case. Update
   `truth.asOf` and `truth.reverifyBy` if the date moved.
2. The Comet x Hoops Finance facts are historical. Confirm only that `.../builds/27417` still
   serves the record.
3. Activate each cleared case in a new commit: move the file to
   `eval/qa/corpus/battery/scf-grants-builders/`, set `truth.lifecycle.state` to `active`, and add
   `truth.lifecycle.activation` (date, author, a different reviewer, ledger, evidence). Then run
   `npm run eval:qa:compile` and update the counts in `test/qa-lifecycle.test.mjs`.
4. The activation reviewer must confirm the re-probe. The 2026-10-06 verdicts cover the text, not
   later values.
5. `scout.analyzeHackathonSubmissions` will then have one active case. The floor needs two. Unblock
   the placed-share case by one of two routes: find an organizer announcement outside DoraHacks for
   both winner lists, or use the reviewer's source-relative rewrite and review it again.
6. If the absorb changes the exposed operation set, check each case `surface` against the manifest.

## Open risks

- **DoraHacks access.** DoraHacks served the pages to my `curl` requests, which used a
  desktop-browser `User-Agent` header (HTTP 200, no challenge). It refused the reviewer on both
  passes with a human-verification page. No challenge was solved or bypassed. The reviewer's
  DoraHacks rows therefore rest on my captures
  (`.agents/rounds/2026-10-06-scout-hackathon-goldens/dorahacks-captures.json`). A web reader
  service returned the same pages to me.
- **DoraHacks summaries are machine-written.** The `/report` pages carry an "AIGC" label. They are
  DoraHacks publications, but they are not organizer prose. The case files state this.
- **Scout store gaps (not filed).** Stored totals are below the organizer totals for four events.
  Scout holds the Blend first-place submission (`buidl/27438`) under `stellar-hacks-paltalabs` with
  no placement, so Blend shows 2 winners where 3 exist. This affects `winners` counts and placed
  shares. `.agents/TODO.md` has an item for the improvements lane.
- **Workflow overlap in two existing cases.** `q-scf-kale-winner-live` and
  `q-gap-hackathon-winner-order` require the event-detail path. Submission detail now also returns
  explicit placement. No facts conflict. `.agents/TODO.md` has an item.
- **Scheduled key facts pin dated values.** The reviewer accepted this design. The grader notes
  accept newer dated values, including a changed ordering.
- **Rejected subjects.** Cards402 (`buidl/42819`) and Wraith (`buidl/46348`) were dropped. Their
  placements have no witness independent of DoraHacks.
