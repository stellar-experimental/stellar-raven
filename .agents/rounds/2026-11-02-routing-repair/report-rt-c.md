Verdict: none. Neither combined variant passes. The admission-only control also fails. Nothing ships.

The contract remains unchanged. No candidate changes production floors, labels, expected answers, overrides, or exposure rules.
No paid evaluation, model call, subagent, commit, push, or deployment ran.

**Design and source controls**

c.1 uses a1’s schema rule and its pinned Porter implementation. Schema words cannot create gated admission.
Unsupported schema rank evidence contributes nothing. The unrelated a1 selector condition was not included.
c.2 uses b2’s short or morph token rule. The vendor scorer and ungated replica use the same matching helpers.

c.3 uses the existing manifest property `retrievalProfile.lane`. Its classes are `corpus`, `semantic`, `research`, and `av`.
The rule applies to every operation in those classes. Exact title/URL lookup remains outside this class.
A query activates admission when an unexplained content token has at least three characters.

An ordinary gated entry explains tokens through its ID, description, or routing phrases. The existing morphology rule compares those tokens.
Schema words do not explain tokens. Caller filters and routing exclusions still apply.
Newly admitted entries receive their ungated lexical score. An entry without that score receives one point.

The existing selection, replacement, and ordering rules then operate on this gated pool.
These parameters stayed fixed. Only the required short and morph token variants were measured.
The admission-only control ran first. Its G7 and G11 results were inspected before either combined measurement.

The experiment source describes admission in `ARCHITECTURE.md`. The production worktree stays clean.
The experiment patch selects the token rule at module initialization through `RAVEN_TOKEN_MATCH`.
The search function remains synchronous and performs no I/O. Its sandbox policy stays unchanged.

Measurements use `35fa569f098ad74680749df6b2b4190de36a4f9d`. Each routing result contains 544 rows. Each probe result contains 149 queries.
The broad requested Git comparison found five QA file changes since `d6ad7350`.
The routing scorer, routing corpus, builders, and inventories have no changes between those commits.

The main source uses its committed manifest. The fresh source uses rt-a’s amended frozen fixture.
That fixture contains Scout 1.9.111, 682 titles, and the stellar-light skill pin `789c9061`.
It exposes the two archived hackathon read operations. It keeps all five G8 operations excluded.

Both manifests were rebuilt locally. Their hashes exactly match the baseline measurement inputs.
The baselines match round 1, including the legacy, extended, skills, holdout, and interference counts.

[Source comparison] (`tmp/rt-c/source-proof.json`); [rebuild proof] (`tmp/rt-c/rebuild-proof.json`); [final integrity] (`tmp/rt-c/final-integrity.json`).

**Required probes**

| Design/source | 1 | 2 | 3 | 4 diagnostic | 5 | 6 | G10 H2 scope | G9 positives | G9 negatives | Mixed diagnostics |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base-main | PASS | PASS | PASS | PASS | FAIL | PASS | 12/42 | PASS | PASS | 0/3 |
| base-fresh | PASS | PASS | PASS | PASS | FAIL | FAIL | 12/42 | PASS | PASS | 0/3 |
| c3-main | PASS | FAIL | PASS | PASS | FAIL | PASS | 12/42 | PASS | PASS | 0/3 |
| c3-fresh | PASS | FAIL | PASS | PASS | FAIL | PASS | 12/42 | PASS | PASS | 0/3 |
| short-main | PASS | FAIL | PASS | FAIL | PASS | PASS | 39/42 | PASS | PASS | 3/3 |
| short-fresh | PASS | FAIL | PASS | FAIL | PASS | PASS | 39/42 | PASS | PASS | 3/3 |
| morph-main | PASS | FAIL | PASS | FAIL | PASS | PASS | 42/42 | PASS | PASS | 3/3 |
| morph-fresh | PASS | FAIL | PASS | FAIL | PASS | PASS | 42/42 | PASS | PASS | 3/3 |

Every c.3 run admits `scout.searchResearch` for `walk through`. This fails required check 2.
The short variant still matches `approach` with `app`. Three scoped G10 comparisons fail.
The morph variant passes all 42 scoped G10 comparisons. Both variants pass the complete schema probe in check 5.

Check 4 remains diagnostic under H1. Its failure does not excuse the other failures.
Probe 6 keeps its required Docs-presence checks. Removed spurious vendor admission remains visible as a diagnostic.
The RWA test file stays frozen. All combined mixed controls now pass their diagnostic assertions.

Their existing `it.fails` markers were not changed.

**Strict counts and G2**

Counts use top1/top3/top5/cardHit5. W and L count strict-key flips within each lane.
Holdout counts top5 once. No accept-either metric enters W or L.

| Design/source | Lane | Baseline | Candidate | W | L | G2 |
| --- | --- | --- | --- | --- | --- | --- |
| c3-main | legacy | 218/294/327/113 | 216/290/327/105 | 44 | 58 | FAIL |
| c3-main | extended | 93/111/117/16 | 91/113/119/16 | 20 | 18 | PASS |
| c3-main | skills | 17/23/23/23 | 15/19/19/19 | 0 | 14 | FAIL |
| c3-main | holdout | 12/27/30/30 | 10/21/24/24 | 1 | 15 | FAIL |
| c3-fresh | legacy | 219/293/327/113 | 219/290/327/104 | 45 | 57 | FAIL |
| c3-fresh | extended | 93/112/117/16 | 92/113/119/15 | 20 | 19 | PASS |
| c3-fresh | skills | 17/23/23/23 | 14/19/20/20 | 0 | 13 | FAIL |
| c3-fresh | holdout | 12/27/30/30 | 10/21/24/24 | 1 | 15 | FAIL |
| short-main | legacy | 218/294/327/113 | 239/300/328/117 | 97 | 65 | PASS |
| short-main | extended | 93/111/117/16 | 90/110/119/15 | 23 | 26 | FAIL |
| short-main | skills | 17/23/23/23 | 9/17/19/19 | 0 | 22 | FAIL |
| short-main | holdout | 12/27/30/30 | 9/17/19/19 | 5 | 29 | FAIL |
| short-fresh | legacy | 219/293/327/113 | 240/302/331/117 | 98 | 60 | PASS |
| short-fresh | extended | 93/112/117/16 | 91/110/119/15 | 23 | 26 | FAIL |
| short-fresh | skills | 17/23/23/23 | 9/17/19/19 | 0 | 22 | FAIL |
| short-fresh | holdout | 12/27/30/30 | 9/17/19/19 | 5 | 29 | FAIL |
| morph-main | legacy | 218/294/327/113 | 241/298/328/116 | 100 | 69 | PASS |
| morph-main | extended | 93/111/117/16 | 89/110/119/12 | 24 | 31 | FAIL |
| morph-main | skills | 17/23/23/23 | 9/17/19/19 | 0 | 22 | FAIL |
| morph-main | holdout | 12/27/30/30 | 9/17/18/18 | 5 | 30 | FAIL |
| morph-fresh | legacy | 219/293/327/113 | 242/300/330/116 | 101 | 65 | PASS |
| morph-fresh | extended | 93/112/117/16 | 89/110/119/12 | 23 | 31 | FAIL |
| morph-fresh | skills | 17/23/23/23 | 9/17/19/19 | 0 | 22 | FAIL |
| morph-fresh | holdout | 12/27/30/30 | 9/17/18/18 | 5 | 30 | FAIL |

**G3, G4, G7, G8, G11, and G12**

| Design/source | G3 | Exact gate | Hackathon pairs | New / better rank | Forbidden captures | G8 | G11 full pages / violations | G12 pages / grade changes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| c3-main | FAIL | FAIL | 45→33 | 0/3 | 10→11 | PASS | 536/0 | 6/0 |
| c3-fresh | FAIL | FAIL | 66→45 | 0/1 | 10→10 | PASS | 535/0 | 6/0 |
| short-main | FAIL | FAIL | 45→3 | 0/0 | 10→12 | PASS | 515/0 | 2/0 |
| short-fresh | FAIL | FAIL | 66→3 | 1/0 | 10→11 | PASS | 517/0 | 2/0 |
| morph-main | FAIL | FAIL | 45→2 | 0/0 | 10→11 | PASS | 513/0 | 2/0 |
| morph-fresh | FAIL | FAIL | 66→1 | 0/0 | 10→10 | PASS | 515/0 | 2/0 |

G7 also rejects any increased holdout forbidden captures. Fewer hackathon captures do not cancel a new pair or rank increase.
`locateSource` stays excluded. Its interference set remains empty on both sources.
All G11 comparisons preserve full-page gated membership and order, subject to the existing replacement rules.

G12 removes the dApp override through the builder. No strict grade changes follow its removal.
No variant relies on the override for its reported grades. The G12 files record changed scores and page order.

c3-main G3 violations:

- legacy.top1: 218→216; allowed decrease 0.
- legacy.top3: 294→290; allowed decrease 0.
- legacy.cardHit5: 113→105; allowed decrease 0.
- extended.top1: 93→91; allowed decrease 0.
- skills.top1: 17→15; allowed decrease 0.
- skills.top3: 23→19; allowed decrease 0.
- skills.top5: 23→19; allowed decrease 0.
- skills.cardHit5: 23→19; allowed decrease 0.
- holdout.top1: 12→10; allowed decrease 0.
- holdout.top3: 27→21; allowed decrease 1.
- holdout.top5: 30→24; allowed decrease 1.
- holdout.cardHit5: 30→24; allowed decrease 1.
- holdout.forbiddenCaptures: 10→11; allowed decrease 0.

c3-main G7 set changes:

- Better rank: q-anchor-sdp-what → scout.searchHackathonBuilds, 5→4.
- Better rank: q-asset-path-payment-ops → scout.searchHackathonBuilds, 4→3.
- Better rank: q-defi-sdex-offer-lifecycle → scout.searchHackathonBuilds, 5→3.

c3-fresh G3 violations:

- legacy.top3: 293→290; allowed decrease 0.
- legacy.cardHit5: 113→104; allowed decrease 0.
- extended.top1: 93→92; allowed decrease 0.
- extended.cardHit5: 16→15; allowed decrease 0.
- skills.top1: 17→14; allowed decrease 0.
- skills.top3: 23→19; allowed decrease 0.
- skills.top5: 23→20; allowed decrease 0.
- skills.cardHit5: 23→20; allowed decrease 0.
- holdout.top1: 12→10; allowed decrease 0.
- holdout.top3: 27→21; allowed decrease 1.
- holdout.top5: 30→24; allowed decrease 1.
- holdout.cardHit5: 30→24; allowed decrease 1.

c3-fresh G7 set changes:

- Better rank: q-anchor-sdp-what → scout.searchHackathonBuilds, 5→4.

short-main G3 violations:

- extended.top1: 93→90; allowed decrease 0.
- extended.top3: 111→110; allowed decrease 0.
- extended.cardHit5: 16→15; allowed decrease 0.
- skills.top1: 17→9; allowed decrease 0.
- skills.top3: 23→17; allowed decrease 0.
- skills.top5: 23→19; allowed decrease 0.
- skills.cardHit5: 23→19; allowed decrease 0.
- holdout.top1: 12→9; allowed decrease 0.
- holdout.top3: 27→17; allowed decrease 1.
- holdout.top5: 30→19; allowed decrease 1.
- holdout.cardHit5: 30→19; allowed decrease 1.
- holdout.forbiddenCaptures: 10→12; allowed decrease 0.

short-fresh G3 violations:

- extended.top1: 93→91; allowed decrease 0.
- extended.top3: 112→110; allowed decrease 0.
- extended.cardHit5: 16→15; allowed decrease 0.
- skills.top1: 17→9; allowed decrease 0.
- skills.top3: 23→17; allowed decrease 0.
- skills.top5: 23→19; allowed decrease 0.
- skills.cardHit5: 23→19; allowed decrease 0.
- holdout.top1: 12→9; allowed decrease 0.
- holdout.top3: 27→17; allowed decrease 1.
- holdout.top5: 30→19; allowed decrease 1.
- holdout.cardHit5: 30→19; allowed decrease 1.
- holdout.forbiddenCaptures: 10→11; allowed decrease 0.

short-fresh G7 set changes:

- New pair: q-asset-claimable-balance → scout.searchHackathonBuilds, rank 4.

morph-main G3 violations:

- extended.top1: 93→89; allowed decrease 0.
- extended.top3: 111→110; allowed decrease 0.
- extended.cardHit5: 16→12; allowed decrease 0.
- skills.top1: 17→9; allowed decrease 0.
- skills.top3: 23→17; allowed decrease 0.
- skills.top5: 23→19; allowed decrease 0.
- skills.cardHit5: 23→19; allowed decrease 0.
- holdout.top1: 12→9; allowed decrease 0.
- holdout.top3: 27→17; allowed decrease 1.
- holdout.top5: 30→18; allowed decrease 1.
- holdout.cardHit5: 30→18; allowed decrease 1.
- holdout.forbiddenCaptures: 10→11; allowed decrease 0.

morph-fresh G3 violations:

- extended.top1: 93→89; allowed decrease 0.
- extended.top3: 112→110; allowed decrease 0.
- extended.cardHit5: 16→12; allowed decrease 0.
- skills.top1: 17→9; allowed decrease 0.
- skills.top3: 23→17; allowed decrease 0.
- skills.top5: 23→19; allowed decrease 0.
- skills.cardHit5: 23→19; allowed decrease 0.
- holdout.top1: 12→9; allowed decrease 0.
- holdout.top3: 27→17; allowed decrease 1.
- holdout.top5: 30→18; allowed decrease 1.
- holdout.cardHit5: 30→18; allowed decrease 1.

Every fresh exact gate also fails the committed manifest fingerprint. The unchanged fresh baseline has the same fingerprint failure.
Main exact gates also reject large legacy improvements because the legacy gate uses a symmetric band.
Every candidate has independent skill, holdout, mechanism, or interference failures. The fingerprint issue does not decide this rejection.

No gate file was changed. Each result JSON preserves every exact gate failure.

**Loss causes and G5**
**Loss causes and G5**

Each loss has query tokens, per-field matches, prepared query forms, score deltas, and page-selection stages.
The loss tables below give the cause for every strict loss row. JSON files retain all token witnesses.
A loss-only diagnostic removes c.3 while keeping the same candidate scorer. It does not define another shipping variant.

A restored grade identifies an admission-caused loss. An unrestored grade shows that schema/token changes already suffice.
The report does not certify every promoted entry as relevant to the same question. No G5 loss waiver is claimed.
Whole-token witnesses alone cannot establish that relevance. The rejected candidates therefore have no G5 pass.

Admission-caused losses also promote entries without any whole content-token witness. The table gives these failing G5(b) witnesses.

| Design/source | Promotions without a whole-token witness | First row | Promoted entry |
| --- | --- | --- | --- |
| c3-main | 21 | q-anchor-platform-repo-discovery | lumenloop.find_similar_scf_submissions |
| c3-fresh | 21 | q-anchor-platform-repo-discovery | lumenloop.find_similar_scf_submissions |
| short-main | 26 | q-defi-blend-repo | lumenloop.find_av_passages |
| short-fresh | 24 | q-defi-blend-repo | lumenloop.find_av_passages |
| morph-main | 25 | q-defi-blend-repo | lumenloop.find_av_passages |
| morph-fresh | 23 | q-defi-blend-repo | lumenloop.find_av_passages |


| Design/source | Strict loss rows | Rows with admission-caused losses | Rows with schema/token-caused losses | Token and selection trace | Loss causes |
| --- | --- | --- | --- | --- | --- |
| c3-main | 79 | 79 | 0 | [trace] (`tmp/rt-c/runs/c3-main/token-traces.json`) | [causes] (`tmp/rt-c/runs/c3-main/loss-causes.json`) |
| c3-fresh | 80 | 80 | 0 | [trace] (`tmp/rt-c/runs/c3-fresh/token-traces.json`) | [causes] (`tmp/rt-c/runs/c3-fresh/loss-causes.json`) |
| short-main | 98 | 59 | 47 | [trace] (`tmp/rt-c/runs/short-main/token-traces.json`) | [causes] (`tmp/rt-c/runs/short-main/loss-causes.json`) |
| short-fresh | 98 | 59 | 47 | [trace] (`tmp/rt-c/runs/short-fresh/token-traces.json`) | [causes] (`tmp/rt-c/runs/short-fresh/loss-causes.json`) |
| morph-main | 101 | 64 | 48 | [trace] (`tmp/rt-c/runs/morph-main/token-traces.json`) | [causes] (`tmp/rt-c/runs/morph-main/loss-causes.json`) |
| morph-fresh | 101 | 64 | 48 | [trace] (`tmp/rt-c/runs/morph-fresh/token-traces.json`) | [causes] (`tmp/rt-c/runs/morph-fresh/loss-causes.json`) |

**Validation and limits**

All four vendor/ungated comparisons pass. The checks cover every searchable entry against all 544 queries.
The equality check applies whenever the vendor gate admits the entry.
`eval:selftest`, `eval:compile`, and `eval:qa:lint -- --stale` pass.

No candidate passes the acceptance rules. The conditional A7 suite was therefore not run.
No unit test ran in the shared worktree. All experiment trees are plain Git clones with Git override variables removed.
G15 has no changed test expectation. The `getRfps` witness and RWA tests stay unchanged.

G13 passes. G14 does not apply because no vector or model call was used.
The combined experiment passes the tracked-tree secret scan. The scan log is `secret-scan.log`.
No new upstream finding is established. The measured defects belong to Raven admission and ranking.


_The per-row loss tables (557 rows) stayed in the lane-local report and are not kept._
