# Item 6.3: RWA re-test, results (phase 1, steps 1 to 5)

Executor: Claude Sonnet 5.5 (agentpc `t1w5`). Lead: Claude Opus 5.5 (`t1w3`). Plan: [PLAN.md](PLAN.md).
Execution record: [EXEC.md](EXEC.md). Un-blinded verdicts: [verdicts.json](verdicts.json).

## Outcome

**Rule outcome (mechanical, from `blind.mjs --score`): exclude.** One clause failed, clause 1:
INCLUDED loses control C3 on an attributable drop (INCLUDED `partial`, EXCLUDED `correct`, and the INCLUDED
run called `scout.getRwaAssets`). Nothing else failed: no INCLUDED bad answer on any pair, no wrong RWA call,
D2 and D3 no loss, D1 and D4 losses 0 minus wins 0. No pair is missing, so the inconclusive clause does not
apply. The lead does not override the outcome (PLAN.md step 5). Phase 2 is the lead's call: step 6b applies
as the rule reads.

Read with the limits below: one sample per pair, one client, and the C3 `partial` cites a documentation claim,
not registry data (see "Reading the outcome").

## Setup

| Item | Value |
|---|---|
| Client | Claude Sonnet 5.5 (`claude-sonnet-5-5`), Claude Code CLI as an `hc` child, one local `npm run dev:eval` (port 8793), no API-billed path |
| Pre-registration commit | `370fb3224f9dcb9059cd51a16419978fd8b42698` (plan, review, questions, harness, blind scorer; tree = EXCLUDED arm) |
| Commit I | `92f71b8dc7c3cd937fbeb635e69642d6c8679059` (RWA exposed) |
| EXCLUDED manifest SHA-256 | `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` |
| INCLUDED manifest SHA-256 | `d90a7a46926dd70eff2fcd0ab07550d1f3f9c56a0c1055e199e7a9129947c3a1` |
| Windows (UTC, 2026-11-17) | EXCLUDED 20:57:01 to 20:59:52; INCLUDED 21:01:34 to 21:04:20; neither straddles 00:00 UTC |
| Judge | Claude Opus 5.5 (`--model opus`, effort high, `--max-budget-usd 15`), blind, one session over 10 pairs, ~21:05 to 21:10 UTC; it did not answer. Judge cost not recorded (subscription CLI; cap USD 15) |
| Answer counts | EXCLUDED 10 of 10, INCLUDED 10 of 10 (20 of 20); one attempt each, no retry, no failure, no resume |

## Per arm

| Arm | Answered | Failures | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD | `rwaCalled` runs | `rwaMentioned` runs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EXCLUDED | 10/10 | none | 37 | 47 | 90 | 20,551 | 1,128,539 | 200,138 | 1.12 | 0 | 0 |
| INCLUDED | 10/10 | none | 36 | 46 | 88 | 20,383 | 1,118,593 | 190,749 | 1.08 | 6 | 6 |

Cost is the subscription-equivalent cost of the answer runs (cap USD 10 per arm, USD 4 per run). Total answers USD 2.20.
`rwaCalled` runs: C1, C2, C3, D1, D3, D4. Not called: D2, N1, N2, N3.

## Probes and identity checks

- Both arms: `serverInfo.sourceRevision` equals the arm commit at start and end; manifest SHA-256 as above
  (`git show <rev>:catalog/manifest.json`); `git status --porcelain` empty.
- EXCLUDED probe, top seven for "Which tokenized real-world assets are live on Stellar?" (start and end the same):
  skills.stellar-dev.assets, stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs,
  lumenloop.search_content_semantic, skills.lumenloop.stellar-ecosystem-scout, scout.searchProjects,
  skills.stellar-dev.standards. No `scout.getRwaAssets`.
- INCLUDED probe (start and end the same): `scout.getRwaAssets` rank 1, then the same six.
- `scout.getRwaAssets({ limit: 3 })` through `execute`: start ok, `asOfBasis` "observed", 3 rows (427 ms); end ok,
  "observed", 3 rows (143 ms). The registry stayed reachable for the whole arm.
- Commit I routing re-check on the committed manifest against main (counts only): legacy 219/293/326/113 to
  219/291/325/111; extended 93/112/117/16, skills top1 17, protocol history unchanged; holdout counts 12/26/30/30
  unchanged, captures 11 to 10, passed 24 to 25; top-five list changes 16/3/1/0; the same three legacy rows go hit to
  miss. Every number equals PLAN.md. The only gate failure is the expected manifest SHA-256 mismatch.
- Commit I generated files: exactly `catalog/manifest.json`, `specs/super-spec.json` (66 paths) and
  `eval/plan/op-classes.json` (+1 id, `broad`); the manifest equals the free-run INCLUDED manifest apart from
  `generatedAt` and the new entry's `cardCaveat`.
- Served skill text saved for the Codex review (only used on 6a): `tmp/6.3/stellar-light-rwa-section.md`.

## Pairs

Grades are per answer (correctness, `+fab` = fabrication). `offTopic` is the judge's flag on that answer. Turn and cost
columns are EXCLUDED/INCLUDED. In the judge's reasons, X and Y are mapped to arms in the next section.


| Key | Class | Outcome | EXCLUDED grade | INCLUDED grade | INCLUDED offTopic | rwaCalled (INCL) | rwaMentioned (INCL) | Attributable drop | Calls RWA wrongly | EXCLUDED offTopic | Turns E/I | Cost E/I | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C1 | C | tie | correct | correct | false | true | true | false | false | false | 5/5 | 0.11/0.10 | Both give the documented simulateTransaction JSON-RPC procedure with SEP-41 transfer and auth caveats; X's endpoints and the stellar token transfer CLI command check out; Y's TPT30/USTBL contract IDs match the registry. |
| C2 | C | tie | correct | correct | false | true | true | false | false | false | 4/4 | 0.10/0.09 | Both correctly split classic trustline reads (Horizon/getLedgerEntries) from SEP-41 balance() calls; X's contract IDs, decimals and auth flags match the registry; Y's generic SDK/CLI guidance is accurate. |
| C3 | C | tie | correct | partial | false | true | true | true | false | false | 4/4 | 0.12/0.11 | X's issuance steps and flags are sound, but it misstates the docs' three tokenization models (it lists classic/SAC/SEP-41, while the docs say Stellar Assets, SEP-41 and SEP-57) and its legal guidance stops at 'get counsel'; Y matches the docs (models, clawback timing, jurisdiction quote, Securitize 2026-10-28, DTCC H1 2027) and covers the legal issues, labelled as general knowledge. |
| D1 | D1 | tie | partial | correct | false | true | true | false | false | false | 4/4 | 0.10/0.10 | X's per-asset values, states and discontinued flags match the registry; Y's 82 live RWA-type directory projects is accurate, but it covers only 40 (by its own admission), lists projects rather than products, and includes non-asset tooling. |
| D2 | D2 | tie | correct | correct | false | false | false | false | false | false | 4/4 | 0.10/0.10 | Both list SCF-funded RWA and fund projects; the totals I checked against the stellarlight directory scf records (67 non-draft awarded RWA projects, Lend $213,460, Untangled $320,000, 0xAuth #27/#29, etc.) all match. Y's Unlock $110K in SCF #19 claim could not be confirmed either way. |
| D3 | D3 | tie | correct | partial | false | true | true | false | false | false | 6/4 | 0.14/0.09 | X's Centrifuge deRWA and registry rows are accurate, but it misses major 2025 launches in the reference year-in-review (RedSwan by name, PYUSD, Franklin Luxembourg fund, Ondo USDY, Whisk); Y's launches and figures (Ondo 5.3%, 21X, RedSwan, Archax, Templar, $3B/$290M, $1.5B/$48M, Messari $533M/$496M, Turbo Energy, US Bancorp) all check out. |
| D4 | D4 | tie | correct | correct | false | true | true | false | false | false | 4/4 | 0.10/0.11 | X's BENJI/gBENJI/sgBENJI/grBENJI issuers, supply, holders and flags match the registry, and $654M matches the case study; Y's 1940 Act, $580M/85%, $650M, $2.5B and $4.5B figures all match SDF and Lumen Loop pages. |
| N1 | N | tie | correct | correct | false | false | false | false | false | false | 5/5 | 0.13/0.13 | Both match research.stellar.org/research-grants (quarterly deadlines, 3-page PDF, $150K cap/$75K avg) and the 2024 review (14 groups); Y also adds the eligibility rules from the page. |
| N2 | N | tie | correct | correct | false | false | false | false | false | false | 5/4 | 0.09/0.08 | Both match SEP-8: AUTH_REQUIRED+AUTH_REVOCABLE, the authorize/pay/deauthorize sandwich, status codes, CORS and the regulated/approval_server/approval_criteria toml fields; the Go server removal note is from the dev skill. |
| N3 | N | win | partial+fab | partial | false | false | false | false | false | false | 6/8 | 0.13/0.16 | X's snapshot and Reflector columns are accurate, but its SQL uses an unsupported dataset (crypto_stellar_2; the docs use crypto-stellar.snapshots) and skips contract-token balances; Y's gold/SCD2 and cex/fex/sdex details are right, but its sketch prices only trustline_balance and uses an unconfirmed dataset path for the gold table. |


### X and Y in the judge's reasons

- C1: X = excluded, Y = included
- C2: X = included, Y = excluded
- C3: X = included, Y = excluded
- D1: X = included, Y = excluded
- D2: X = excluded, Y = included
- D3: X = included, Y = excluded
- D4: X = included, Y = excluded
- N1: X = excluded, Y = included
- N2: X = excluded, Y = included
- N3: X = excluded, Y = included


`offTopic` was false on every EXCLUDED and every INCLUDED answer, so no answer calls RWA wrongly.

## Rule, clause by clause

| Clause | Result |
|---|---|
| 1. C1 to C3, N1 to N3: no INCLUDED loss, no wrong RWA call | **Fails on C3**: INCLUDED `partial`, EXCLUDED `correct`, `rwaCalled` true (attributable drop). C1, C2: tie, both correct. N1 to N3: no loss, no wrong call (N3 is a win for INCLUDED: EXCLUDED `partial` with fabrication, INCLUDED `partial`, no RWA call). |
| 2. D2 and D3: no INCLUDED loss | Holds. D2 tie (both correct, no RWA call). D3 tie (EXCLUDED `correct`, INCLUDED `partial`; neither is bad). |
| 3. D1 and D4: INCLUDED losses minus wins ≤ 0 | Holds: losses 0, wins 0 (D1 INCLUDED `correct` over EXCLUDED `partial`, D4 both correct; neither is a bad-answer flip). |
| Inconclusive (any C, N, D2, D3 pair missing; D1 and D4 both missing) | Not triggered; 10 of 10 pairs complete. |

Correct against partial without an RWA call (reported, not counted): none. Turn and cost difference where INCLUDED
called RWA on a C or N pair: C1 0 turns, USD -0.01; C2 0 turns, USD -0.01; C3 0 turns, USD -0.01. Over all ten runs
INCLUDED used 1 fewer turn and USD 0.04 less.

## Reading the outcome (reported, not a rule change)

- The failing clause rests on one sample of one pair. The 6.2 record found 5 of 10 correct-against-partial flips
  between equivalent arms for this client, so a single `partial` against `correct` is within that noise; the attributable-
  drop clause was written to count it anyway when the run called RWA, and it did.
- The C3 `partial` cites the answer's list of the documentation's tokenization models (classic, SAC, SEP-41, where the
  docs say Stellar Assets, SEP-41 and SEP-57) and thin legal guidance, which are documentation and general-knowledge
  points, not registry data. The judge did not name the RWA call as the cause; the rule attributes by the call alone.
- Where INCLUDED answers used the registry (C1, C2, D1, D4), the judge found the registry rows accurate against the
  registry; D1's INCLUDED answer was graded `correct` over a `partial` EXCLUDED one. On D1 to D4 the registry is both
  the treatment and a reference source, so those pairs cannot show the registry is wrong by comparison with itself.
- D3: INCLUDED `partial` (misses launches in the year-in-review) against EXCLUDED `correct`; INCLUDED called RWA, but D3
  is a displacement question and the attributable-drop clause applies only to C and N pairs, so it is not counted.
- On the three neutral questions (RWA at rank 2 on N1 and rank 4 on N2 and N3 of the page of 7) the INCLUDED runs made no
  RWA call. No off-target capture at the answer level.
- Cost: no cost penalty; INCLUDED is USD 0.04 cheaper in total, 1 turn fewer.

## Limits

- One client, one sample per pair, one judge; the A/B detects a large effect only (PLAN.md Risks).
- The judge saw the registry as a source for every pair and was not told what is compared; answer text can still reveal
  registry rows.
- Live content moved between the sequential arms (about four minutes apart); the INCLUDED registry probe bracketed the arm.
- The judge's reason strings were written with X and Y labels; the arm mapping is in the table above and in
  `verdicts.json`.

## Deviations from the plan

- EXEC.md and RESULTS.md were drafted under ignored `tmp/6.3/` until both servers stopped (an untracked file in the item
  folder makes `dev:eval` refuse a dirty tree); both are now copied here, uncommitted, as the brief asks.
- PLAN.md step 3 says commit I holds "four source and three generated files"; the diff holds three source files
  (`scout-exposure.ts`, `card-caveats.mjs`, `build-op-classes.mjs`) and three generated files, six in all, with no other
  change. The expected generated diffs matched.
- The plan's "stellar-light skill" is `skills.stellar-light.stellar-scout`; its RWA text is in the companion file
  `references/api-reference.md` (a `GET /api/rwa` section and a mention under `GET /api/vet-idea`), not in `SKILL.md`.

## Not done (per the brief)

No step 6a or 6b, no tests, no gates beyond the routing re-check, no push, no records commit. Commit I is still the HEAD of
`np/6.3-rwa-retest` (step 6b would `git revert` it).
