# Item 7.2: RWA card caveat A/B (RESULTS)

Executor: Claude Sonnet 5.5 (agentpc `t1x1`, `7.2-exec`). Lead: Claude Opus 5.5 (`t1wz`). Plan: [PLAN.md](PLAN.md). Execution record: [EXEC.md](EXEC.md).
Un-blinded grades, deficiencies and attribution: [verdicts.json](verdicts.json). The rule is item 6.3 result 2's, unchanged
(`items/6.3/PLAN.md`, "Re-test rule (second measurement)"), computed by 6.3's `blind.mjs --retest --score` and `attribute.mjs --score`, run in place.

## Outcome

**Rule outcome (mechanical): exclude.** One clause fired, on one question: **D3 ("notable DeFi and RWA launches of 2025"), clause 2 (attributable drop), count 2
of 3 complete pairs.** In D3 samples 2 and 3 the INCLUDED+CAVEAT answer was graded `partial` against an EXCLUDED `correct`, the INCLUDED run called
`scout.getRwaAssets`, and the attribution judge found the deficiency involves registry data, with two verified quotes. Nothing else fired: no bad loss (net 0
on all seven questions), no wrong registry use (`offTopic` false on all 42 answers), no clause on C1, C2, C3, N1, N2 or N3. No pair is missing and no
inconclusive condition holds. The carried result-1 clauses for D1, D2 and D4 hold. The lead does not override the outcome.

D3's worse-pair count, stated plainly: **2 of 3 samples INCLUDED+CAVEAT worse (6.3 result 2, no caveat: 3 of 3).** D3 sample 1 tied `correct`/`correct`. The rule
passes a question at one attributable drop in three, so the caveat moved D3 from three drops to two, and two is a fire. This is a partial improvement, not a fix.

The carried D1, D2 and D4 clauses are constants measured on 6.3's card (result 1, single samples, before the caveat existed). They could not fail here, and
registry use on D1 and D4 under the new card is unmeasured. This result would have rested on the seven re-sampled questions only.

Reported alongside (not counted): the other reading of the orchestrator's sentence (worse in a majority of samples, registry involved at least once) also
gives D3 and no other question. No question outside D3 has two or more worse pairs. There is no crowd-out candidate (candidate with no registry involvement).
`rwaCalled` and `rwaRan` never differ on any run.

## Setup

| Item | Value |
|---|---|
| Client | Claude Sonnet 5.5 (`claude-sonnet-5-5`), Claude Code CLI as `hc` children of the executor, one local `npm run dev:eval` at a time (port 8795), no API-billed path |
| Pre-registration commit P | `666f1784f8111dbb11dfd542db0ab5d81670a2cd` (PLAN.md, REVIEW.md, briefs); tree outside `.agents/` = `fdddbe26` |
| EXCLUDED arm | tree P; manifest SHA-256 `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` |
| INCLUDED+CAVEAT arm | commit C `815feb759ee69576ff1d04f4be57b0ed16aa72aa` (6.3's commit I plus the caveat below); manifest SHA-256 `8b655245627eb53bb5b167625e5686501edbb7560d1a95ea71ea68bef7c1aa1e`; equals `tmp/7.2/variant-manifest.json` apart from `generatedAt` |
| Caveat (card only, 132 chars) | `Not a launch or news timeline: launchedAt is Soroban contract creation only. Includes fiat stablecoins; state is not product status.` Served on the RWA card, verified in full by a D3 `search` at the arm's start |
| Windows (UTC, 2026-11-18, one day) | EXCLUDED 00:01:55 to 00:09:32; INCLUDED 00:10:56 to 00:17:31; neither starts between 23:30 and 00:00 |
| Grading judge | Claude Opus 5.5 (`--model opus`, effort high), blind, one session over 21 pairs, 00:17 to 00:25; it answered nothing. First write valid; no completion pass |
| Attribution judge | Claude Fable (`--model fable`, effort high), one session over 3 items, 00:25 to 00:26; it answered and graded nothing. First write valid; no correction pass |
| Answers | 21 of 21 per arm (42 of 42), one attempt each, no retry, no failure, no resume; 42 attempts of the 45 cap (EXCLUDED 21 of 22, INCLUDED 21 of 24) |
| Order | EXCLUDED, then INCLUDED; round-major (sample 1 over C1, C2, C3, D3, N1, N2, N3, then 2, then 3) |

Routing on C before any answer (free, `eval/run-routing.mjs --gate`, aggregates only): every number equals the lead's pre-registered table (INCLUDED+CAVEAT
legacy top3 291, top5 325, card@5 111; holdout top1 12, top3 26 (its floor), top5 30, card@5 30; holdout forbidden captures 10). The one gate failure is the expected
manifest-fingerprint mismatch. The caveat feeds no score.

## Per arm (21 runs each)

| Arm | Answered | Attempts | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD | USD per answer | `rwaCalled` runs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EXCLUDED | 21/21 | 21 | 93 | 114 | 214 | 49274 | 2871511 | 469492 | 2.66 | 0.127 | 0 |
| INCLUDED+CAVEAT | 21/21 | 21 | 87 | 108 | 202 | 50074 | 2681721 | 476985 | 2.68 | 0.128 | 9 |

Answer cost USD 5.34 against the USD 50 item total; judge costs are subscription runs and were not recorded (caps USD 15 each). Cost per answer is flat (0.127 against 0.128).

Grade distribution over the 21 pairs: EXCLUDED 19 `correct`, 2 `partial`; INCLUDED+CAVEAT 16 `correct`, 5 `partial`; 0 `wrong`, 0 fabrication, 0 `offTopic` on both.
INCLUDED worse in 4 pairs (D3:2, D3:3, N1:3, N3:2), better in 1 (N3:3). N1:3 and N3:2 made no registry call (noise, not candidates).
Per question turns and cost, EXCLUDED/INCLUDED: C1 15/13, USD 0.34/0.29; C2 14/14, 0.30/0.38; C3 21/19, 0.53/0.49; D3 17/13, 0.41/0.32; N1 17/16, 0.37/0.39;
N2 12/12, 0.28/0.29; N3 18/21, 0.43/0.52.

## Registry use and card exposure (reported, not counted)

INCLUDED+CAVEAT `rwaCalled` against 6.3 result 2's INCLUDED counts (no caveat), per question (of 3):

| Question | 6.3 result 2 | This run |
|---|---|---|
| C1 | 2 (samples 1, 2) | 1 (sample 1) |
| C2 | 3 | 3 |
| C3 | 0 | 2 (samples 2, 3) |
| D3 | 3 | 3 |
| N1, N2, N3 | 0 | 0 |
| All | 8 of 21 | 9 of 21 |

C2's 3 of 3 (the question where the registry is the right source, and the only proxy the plan named) is unchanged: the caveat did not move the client off the registry
where it is right. C1 fell from 2 to 1 and C3 rose from 0 to 2, both within the noise of three samples; no clause fired on either.

Search card before the first registry call: in all 9 INCLUDED runs that called the registry, an earlier `search` call returned the RWA card (`calls[].tool` = `search` with
`calls[].rwaInResult` true) before the first `execute` that called it. The records show the card's id appeared in the result, not which field text the model read; the
caveat is on that card as served. So the caveat was in front of the client in every D3 run and D3 still lost on 2 of 3. Of the 12 INCLUDED runs with no registry call, 5 (N2 all three,
N3 samples 2 and 3) saw the card in a search and chose not to call it.

D3 answers and non-registry launch sources: all three INCLUDED D3 answers name non-registry launch sources (stellar.org press pages for Centrifuge deRWA and Ondo,
CoinDesk, Finextra, Spiko, Reflector, The Defiant, Templar). They differ from EXCLUDED on the headline launches: samples 2 and 3 are shorter (4 turns each; 2.2 and 2.5 thousand
characters against 2.3 and 4.4 for EXCLUDED), cite no year-in-review URL, and the grader lists PYUSD, RedSwan's USD 100M real estate, Ondo USDY and Franklin Templeton's European
fund among the omissions. EXCLUDED samples 2 and 3 cite `stellar.org/blog/ecosystem/stellar-2025-year-in-review`. So the caveat moved D3 off registry-only
answers (sample 1 was graded `correct`, with a minor RedSwan omission) without reliably sending the client to the year-in-review source.

## Pairs

Grades are per answer. "Judge's X" is the arm the judge saw as X; reasons are as written, with X and Y labels (mapping in `verdicts.json`). Candidate: INCLUDED graded
below EXCLUDED and the INCLUDED run called or ran the registry; "registry" means the attribution judge found the deficiency involves registry data.

| Pair | Judge's X | EXCLUDED | INCLUDED | INCL worse | rwaCalled | Candidate | Turns E/I | Cost E/I | Reason |
|---|---|---|---|---|---|---|---|---|---|
| C1:1 | included | correct | correct | false | true | no | 5/5 | 0.11/0.11 | Both describe the simulation correctly; X's TPT30 contract ID matches the registry, Y's MuxedAddress and CLI details match the docs. |
| C1:2 | excluded | correct | correct | false | false | no | 5/4 | 0.12/0.09 | Both give a correct documented procedure for building a SEP-41 transfer and calling simulateTransaction, noting it was not executed. |
| C1:3 | excluded | correct | correct | false | false | no | 5/4 | 0.11/0.09 | Both give accurate simulateTransaction procedures with the documented request shape and token transfer interface. |
| C2:1 | included | correct | correct | false | true | no | 4/5 | 0.10/0.14 | Both are accurate; X's identifiers, flags, decimals and states match the registry and its CLI command matches the docs. |
| C2:2 | included | correct | correct | false | true | no | 4/5 | 0.09/0.12 | Both explain trustline balances via Horizon and SEP-41 balance() for contract tokens; X's issuer/contract IDs and decimals match the registry. |
| C2:3 | excluded | correct | correct | false | true | no | 6/4 | 0.11/0.11 | Both correctly describe classic vs contract balance reads; Y's issuers, contract IDs and decimals match the registry and X's CAP-73 note matches the SAC docs. |
| C3:1 | excluded | correct | correct | false | false | no | 7/6 | 0.18/0.16 | Both give the documented issuance path, flags and SEP-8 caveat, with requirements matching the Asset Issuance Stack, and flag legal points as counsel questions. |
| C3:2 | excluded | correct | correct | false | true | no | 6/7 | 0.17/0.18 | Both accurately cite the Asset Issuance Stack requirements table and irreversible-choice warnings; Y's registry flag examples match. |
| C3:3 | included | correct | correct | false | true | no | 8/6 | 0.18/0.15 | Both match the Asset Issuance Stack docs (table values, vendor examples, OpenZeppelin RWA suite) and registry facts. |
| D3:1 | included | correct | correct | false | true | no | 6/5 | 0.15/0.14 | Both give broad, dated, source-supported lists of 2025 RWA and DeFi launches. |
| D3:2 | excluded | correct | partial | true | true | yes, registry | 4/4 | 0.09/0.09 | X covers the year-in-review's main RWA/DeFi launches with supported figures; Y is accurate but misses most headline 2025 launches. |
| D3:3 | excluded | correct | partial | true | true | yes, registry | 7/4 | 0.17/0.10 | X lists the major 2025 launches with checked dates; Y is accurate on what it lists but misses several headline launches. |
| N1:1 | included | correct | correct | false | false | no | 6/5 | 0.14/0.13 | Both accurately describe the Academic Research Grants program, eligibility/PI requirement and full proposal outline. |
| N1:2 | excluded | correct | correct | false | false | no | 5/5 | 0.13/0.13 | Both accurately reproduce the research.stellar.org Academic Research Grants terms and application outline. |
| N1:3 | included | correct | partial | true | false | no | 6/6 | 0.10/0.12 | Y gives the full application requirements; X stops partway through the outline and omits the budget cap and submission method. |
| N2:1 | included | correct | correct | false | false | no | 4/4 | 0.09/0.10 | Both match the SEP-8 spec on per-transaction approval flow and the stellar.toml fields. |
| N2:2 | included | correct | correct | false | false | no | 4/4 | 0.10/0.10 | Both match SEP-8: AUTH_REQUIRED+AUTH_REVOCABLE, approval server flow and statuses, and regulated/approval_server/approval_criteria in [[CURRENCIES]]. |
| N2:3 | excluded | correct | correct | false | false | no | 4/4 | 0.09/0.09 | Both match the SEP-8 spec; the Go reference server removal is confirmed by an Oct 2025 go-stellar-sdk commit. |
| N3:1 | excluded | partial | partial | false | false | no | 6/6 | 0.14/0.17 | Both identify the right tables and columns, but each asserts a dataset path for the silver/gold tables that the Hubble docs contradict. |
| N3:2 | included | correct | partial | true | false | no | 7/7 | 0.16/0.16 | Y covers balances, all three Reflector price tables and the non-trustline holdings while flagging the unconfirmed dataset; X asserts the wrong dataset and omits contract tokens. |
| N3:3 | excluded | partial | correct | false | false | no | 5/8 | 0.12/0.18 | Y gives a sound point-in-time method with SDEX pricing and the gold table for contract tokens; X's price join uses the wrong table and key. |

## Rule, clause by clause

| Question | Complete pairs | 1 bad loss (net) | 2 attributable drop | 3 wrong registry use | Worse pairs (samples) |
|---|---|---|---|---|---|
| C1 | 3 | 0 ok | 0 ok | 0 ok | none |
| C2 | 3 | 0 ok | 0 ok | 0 ok | none |
| C3 | 3 | 0 ok | 0 ok | 0 ok | none |
| D3 | 3 | 0 ok | **2 fires** | 0 ok | 2, 3 |
| N1 | 3 | 0 ok | 0 ok | 0 ok | 3 |
| N2 | 3 | 0 ok | 0 ok | 0 ok | none |
| N3 | 3 | 0 ok | 0 ok | 0 ok | 2 |

A clause fires at a count of 2 or more with three complete pairs. Carried from result 1 and recomputed from `items/6.3/verdicts.json` (single samples): D2 holds;
D1 and D4 losses 0, wins 0, hold. Inconclusive conditions: none. Fired: D3 attributable drop (2).

## Attribution (every line)

- D3:3 item 1: involvesRegistry true. Omits PayPal PYUSD (live Sep 2025), RedSwan's USD 100M tokenized real estate and Franklin Templeton's Feb 2025 European fund
  launch, which SDF's 2025 year-in-review lists as highlights; Franklin's BENJI is mentioned only as an undated registry entry.
- D3:3 item 2: involvesRegistry false. States that DeFi TVL passed USD 70M at the time of the Flipside Quests launch; the fetched Defiant article excerpts do not show this figure.
- D3:2 item 1: involvesRegistry true. Omits the headline 2025 launches the SDF 2025 year-in-review lists (Ondo USDY on Stellar, PayPal PYUSD going live, RedSwan's
  USD 100M tokenized real estate, Franklin Templeton's fund expanding to European investors); the list is limited to Centrifuge deRWA and registry-dated Spiko tokens.
- D3:1 item 1 (not a candidate; INCLUDED graded `correct`): involvesRegistry true. Does not mention RedSwan's USD 100M tokenized real estate, a 2025 highlight in
  SDF's year-in-review (minor omission).

## Reading the outcome (reported, not a rule change)

- The deciding evidence is the same question as 6.3 result 2 (D3), now two of three samples against three of three. Neither arm made a bad (`wrong` or fabricated)
  answer anywhere, so this is a completeness loss, not an accuracy loss. D3 INCLUDED answers used fewer turns and less cost (13 against 17 turns; USD 0.32 against 0.41).
- The caveat was on the card the client saw before every registry call, named `launchedAt`, and still did not remove the loss. A caveat is a card fact, not a
  source-selection instruction; the client reads it and still treats the registry as the launches source for part of its answer.
- On the controls and off-target questions the registry did not hurt: C1, C2 and C3 tied `correct` on all nine pairs, including the six with a registry call; N1:3 and N3:2 are
  INCLUDED-worse pairs with no registry call (noise; N3:3 went the other way).
- The reading that matters for #167: a registry-served RWA answer is good where the registry is the source (C2 3 of 3), neutral on controls, and incomplete on a
  launches-and-news question in two of three samples. That is the same shape as 6.3 result 2 with one fewer loss.

## Recommended branch (the lead decides)

Plan step 6b (exclude): `git revert` commit C, check `catalog/manifest.json` hashes to `7a4fab76…5caa29` again, TODO RWA bullet gains this result and the three re-open
triggers (a Scout `/api/rwa` schema change, a general mixed-intent routing mechanism, an owner product need), check 8's sentence names round items 6.3 and 7.2; one #167
status comment; recommend closing #167 as "decided: excluded by measurement"; no deploy. The lead does not close it without the orchestrator.

## Limits

- One client, one judge per stage, three samples per pair, 2 of 3 on the deciding question. A large effect only; a caveat that does half the work looks like this.
- D1, D2 and D4 are constants from 6.3's card (see Outcome); they say nothing about the caveat.
- The grader sees each question three times (accepted limit; it grades each pair on its own).
- The attribution judge sees the INCLUDED arm's tool output by construction (the registered deviation from blind judging); it sees no EXCLUDED answer, no grade and no stake.
- Live content moved between the sequential arms (about nine minutes apart); the probes bracketed each arm and the registry stayed reachable (`asOfBasis` "observed").
- The records show the RWA card appeared before the first registry call, not that the model read the caveat clause.

## Deviations from the plan

See EXEC.md, "Deviations". None changes the rule, the questions, the rubrics or the scoring.

## Not done (per the brief)

No commit after C, no TODO, policy record or PR edit, no `npm test` (the guard tests that name `getRwaAssets` fail until step 6a), no push.
