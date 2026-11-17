# Item 6.3: RWA re-test, second measurement (RESULTS-2)

Executor: Claude Sonnet 5.5 (agentpc `t1wd`, `6.3-exec2`). Lead: Claude Opus 5.5 (`t1w3`). Plan: [PLAN.md](PLAN.md), "Re-test: second
measurement". Execution record: [EXEC.md](EXEC.md), "Re-test". Un-blinded grades, deficiencies and attribution: [verdicts-2.json](verdicts-2.json).
Result 1 ([RESULTS.md](RESULTS.md)) stays as recorded and was not edited; this is the second, separate result.

## Outcome

**Rule outcome (mechanical, `blind.mjs --retest --score` then `attribute.mjs --score`): exclude.** One clause fired, on one question:
**D3, clause 2 (attributable drop), count 3 of 3 complete pairs.** In every D3 sample the INCLUDED answer was graded `partial` against an
EXCLUDED `correct`, the INCLUDED run called `scout.getRwaAssets`, and the attribution judge found the deficiency involves registry data, with
two verified quotes. Nothing else fired: no bad loss (net 0 on all seven questions), no wrong registry use (`offTopic` false on all 42 answers),
no clause on C1, C2, C3, N1, N2 or N3 (C1: one candidate, count 1 of 3, passes). No pair is missing and no inconclusive condition holds. The carried
result-1 clauses for D1, D2 and D4 hold (single-sample passes: D2 no INCLUDED loss; D1 and D4 losses 0, wins 0). The lead does not override the outcome.

Reported alongside (not counted): the other reading of the orchestrator's sentence (worse in a majority of samples, registry involved at least
once) also gives D3 and no other question. No question outside D3 has two or more worse pairs. All four candidate pairs have `involvesRegistry: true`;
there is no crowd-out candidate (a drop with a registry call but no registry involvement).

## Setup

| Item | Value |
|---|---|
| Client | Claude Sonnet 5.5 (`claude-sonnet-5-5`), Claude Code CLI as `hc` children, one local `npm run dev:eval` at a time (port 8793), no API-billed path |
| Pre-registration commit | `0100fa6a5c7115d63f7c8231f473bd05952dcac7` (rule, review, briefs, harness, scorers; tree outside `.agents/` = `cd4520bd`) |
| EXCLUDED arm | tree `0100fa6a`, served from `/home/tyler/code/raven-wt/np-6.3`; manifest SHA-256 `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` |
| INCLUDED arm | commit I `92f71b8dc7c3cd937fbeb635e69642d6c8679059`, served from a second worktree `/home/tyler/code/raven-wt/np-6.3-inc` (removed after the arm); manifest SHA-256 `d90a7a46926dd70eff2fcd0ab07550d1f3f9c56a0c1055e199e7a9129947c3a1` |
| Windows (UTC, 2026-11-17) | EXCLUDED 21:36:25 to 21:42:29; INCLUDED 21:42:57 to 21:50:33; neither straddles 00:00 UTC |
| Grading judge | Claude Opus 5.5 (`--model opus`, effort high), blind, one session over 21 pairs, 21:51 to 21:57; it answered nothing. First write valid; no completion pass |
| Attribution judge | Claude Fable (`--model fable`, effort high), one session over 4 items, about 21:58; it answered and graded nothing. First write valid; no correction pass |
| Answers | 21 of 21 planned per arm (42 of 42), one attempt each, no retry, no failure, no resume; 42 attempts of the 45 cap (EXCLUDED 21 of 22, INCLUDED 21 of 24) |
| Order | EXCLUDED, then INCLUDED; round-major (sample 1 over C1, C2, C3, D3, N1, N2, N3, then sample 2, then 3) |

## Per arm (21 runs each)

| Arm | Answered | Attempts | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD | `rwaCalled` runs | `rwaRan` runs | `rwaMentioned` runs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EXCLUDED | 21/21 | 21 | 84 | 105 | 196 | 45126 | 2508156 | 452007 | 2.51 | 0 | 0 | 0 |
| INCLUDED | 21/21 | 21 | 87 | 108 | 202 | 48635 | 2634035 | 456231 | 2.58 | 8 | 8 | 8 |

Answer cost USD 5.09 (cap USD 10 per arm); judge costs are subscription runs and were not recorded (caps USD 15 each). `rwaCalled` and `rwaRan`
never differ on any run. The INCLUDED runs that called the registry: C1 samples 1 and 2, C2 samples 1 to 3, D3 samples 1 to 3. No INCLUDED run on
C3, N1, N2 or N3 called it (0 of 12), although RWA ranks 1 to 4 on the page of 7 for those questions.

Grade distribution over the 21 pairs is identical on both arms: 17 `correct`, 4 `partial`, 0 `wrong`, 0 fabrication, 0 `offTopic`.
Per question turns and cost, EXCLUDED/INCLUDED: C1 14/15 turns, USD 0.30/0.35; C2 12/12, 0.28/0.31; C3 14/17, 0.41/0.48; D3 16/13, 0.38/0.29;
N1 17/18, 0.38/0.36; N2 12/12, 0.28/0.28; N3 20/21, 0.48/0.50. INCLUDED used 3 more turns and USD 0.07 more over all 21 runs.

## Probes and identity checks

- Both arms, start and end: `serverInfo.sourceRevision` equals the arm commit and the serving worktree's `HEAD`; manifest SHA-256 as in Setup;
  `git -C <serving worktree> status --porcelain=v1 --untracked-files=all` empty. Start probes plus one skill read (`skills.stellar-light.stellar-scout`,
  section `when-to-use-this-skill`) warmed the skills cache on both arms.
- EXCLUDED probe, top seven for "Which tokenized real-world assets are live on Stellar?" (start and end the same): skills.stellar-dev.assets,
  stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic, skills.lumenloop.stellar-ecosystem-scout,
  scout.searchProjects, skills.stellar-dev.standards. No `scout.getRwaAssets`.
- INCLUDED probe (start and end the same): `scout.getRwaAssets` rank 1, then the same six.
- `scout.getRwaAssets({ limit: 3 })` through `execute`: start ok, `asOfBasis` "observed", 3 rows (382 ms); end ok, "observed", 3 rows (161 ms).
- Diff checks: `git diff --stat cd4520bd 0100fa6a -- . ':!.agents'` is empty; the diff from `0100fa6a` to `92f71b8d` outside `.agents/` is commit I's six files.

## Pairs

Grades are per answer (`+fab` = fabrication). "Judge's X" is the arm the judge saw as X in that pair; the reasons are as written, with X and Y
labels. Candidate: INCLUDED graded below EXCLUDED and the INCLUDED run called or ran the registry; "registry" means the attribution judge found the
deficiency involves registry data. Turn and cost columns are EXCLUDED/INCLUDED.

| Pair | Judge's X | EXCLUDED | INCLUDED | INCL worse | rwaCalled/rwaRan | Candidate | Turns E/I | Cost E/I | Reason |
|---|---|---|---|---|---|---|---|---|---|
| C1:1 | included | correct | partial | true | true/true | yes, registry | 5/5 | 0.10/0.12 | Both describe the simulateTransaction flow accurately; X wrongly asserts that bonds on Stellar are Soroban-only. |
| C1:2 | excluded | correct | correct | false | true/true | no | 4/5 | 0.09/0.12 | Both describe a correct simulateTransaction flow; X's recording/enforcing auth-mode note matches the docs, and Y's SDK script and registry contract IDs are accurate. |
| C1:3 | excluded | correct | correct | false | false/false | no | 5/5 | 0.11/0.11 | Both give a doc-accurate simulateTransaction flow (invokeHostFunction transfer, request shape, result handling); CLI and error-code details in X match the CLI guides. |
| C2:1 | included | partial | correct | false | true/true | no | 4/4 | 0.09/0.10 | Both give the classic-trustline and SEP-41 balance paths correctly; X adds registry-accurate issuers/contract IDs, Y has one outdated Horizon field claim. |
| C2:2 | excluded | correct | correct | false | true/true | no | 4/4 | 0.10/0.10 | Both correctly describe Horizon trustline balances vs SEP-41 balance(); Y's treasury asset table, decimals and auth/clawback flags match the registry. |
| C2:3 | included | partial | correct | false | true/true | no | 4/4 | 0.09/0.11 | X gives the classic and Soroban paths with registry-accurate IDs and a correct `stellar token balance` CLI usage; Y is generic and has one outdated Horizon field claim. |
| C3:1 | excluded | correct | correct | false | false/false | no | 6/6 | 0.15/0.17 | Both correctly cover the classic-asset issuance path, issuer flags, SEP-8/SEP-57 and appropriately flagged general legal considerations. |
| C3:2 | excluded | correct | correct | false | false/false | no | 4/5 | 0.14/0.14 | Both give the documented issuance path, issuer flags and SEP-8/SEP-57 options, plus clearly labeled general legal guidance. |
| C3:3 | included | correct | correct | false | false/false | no | 4/6 | 0.12/0.18 | Both give a documented issuance path and controls; X's SDF Q3 2026 and SEC wrapped/native citations and Y's hot-account and 0.5 XLM reserve points check out. |
| D3:1 | excluded | correct | partial | true | true/true | yes, registry | 6/5 | 0.14/0.10 | X's dated list and the $785M year-end figure check out; Y's registry figures are accurate but cover only part of the question. |
| D3:2 | included | correct | partial | true | true/true | yes, registry | 6/4 | 0.14/0.10 | Y's dated list (Franklin, Archax, 21X, Ondo, Centrifuge, RedSwan, Turbo Energy, Templar) checks out against press pages; X's items check out but miss Ondo, Franklin and PYUSD. |
| D3:3 | included | correct | partial | true | true/true | yes, registry | 4/4 | 0.10/0.09 | Y covers Franklin, Centrifuge, Ondo, RedSwan, PYUSD with figures matching its cited SDF review; X is registry-centric, misstates the registry on issuers and misses the headline launches. |
| N1:1 | included | correct | correct | false | false/false | no | 5/7 | 0.13/0.13 | Both accurately reproduce the program page's scope, eligibility/gift terms, deadlines and proposal outline, with correct supporting SDF posts. |
| N1:2 | excluded | correct | correct | false | false/false | no | 7/5 | 0.14/0.13 | Both accurately reproduce the Academic Research Grants page (quarterly deadlines, 2/year, 3-page PDF outline, $150K cap, ~$75K average) and the 14-groups 2024 figure. |
| N1:3 | excluded | correct | correct | false | false/false | no | 5/6 | 0.11/0.10 | Both match the research-grants page; X also correctly covers eligibility (degree-granting institution, PI status, gifts to institutions). |
| N2:1 | included | correct | correct | false | false/false | no | 4/4 | 0.09/0.09 | Both match the SEP-8 spec on flags, stellar.toml fields, transaction composition and approval-server statuses; the Go reference server removal (Oct 2025) is confirmed. |
| N2:2 | excluded | correct | correct | false | false/false | no | 4/4 | 0.10/0.10 | Both match the SEP-8 spec: AUTH_REQUIRED+AUTH_REVOCABLE, regulated/approval_server/approval_criteria in stellar.toml, the authorize-pay-deauthorize composition and the five response statuses. |
| N2:3 | included | correct | correct | false | false/false | no | 4/4 | 0.09/0.10 | Both are consistent with the SEP-8 spec (Status Active) on approval flow and stellar.toml fields. |
| N3:1 | excluded | correct | correct | false | false/false | no | 6/7 | 0.17/0.16 | Both correctly combine SCD2 accounts/trustlines snapshots with Reflector daily prices, with caveats that match the data dictionary. |
| N3:2 | included | partial | correct | false | false/false | no | 7/7 | 0.15/0.16 | X covers both balance routes and the Reflector price join; Y gets the snapshot balances right but misses Hubble's historical price tables. |
| N3:3 | excluded | partial | correct | false | false/false | no | 7/7 | 0.16/0.18 | Both use the documented SCD2 snapshots and Reflector close_usd correctly; Y adds the gold account_balances_daily_agg route and flags the dataset path as unconfirmed, while X states it as fact. |

## Rule, clause by clause

| Question | Complete pairs | 1 bad loss (net) | 2 attributable drop | 3 wrong registry use | Worse pairs (samples) |
|---|---|---|---|---|---|
| C1 | 3 | 0 ok | 1 ok | 0 ok | 1 |
| C2 | 3 | 0 ok | 0 ok | 0 ok | none |
| C3 | 3 | 0 ok | 0 ok | 0 ok | none |
| D3 | 3 | 0 ok | 3 fires | 0 ok | 1,2,3 |
| N1 | 3 | 0 ok | 0 ok | 0 ok | none |
| N2 | 3 | 0 ok | 0 ok | 0 ok | none |
| N3 | 3 | 0 ok | 0 ok | 0 ok | none |

A clause fires at a count of 2 or more with three complete pairs. Carried from result 1 and recomputed from `verdicts.json` (single samples, D1, D2 and D4 were not
re-sampled): D2 no INCLUDED loss, holds; D1 and D4 INCLUDED losses 0 minus wins 0, holds. Inconclusive conditions: none.

## Attribution (every line)

- D3:3 item 1: involvesRegistry true. Deficiency: States the registry does not name the issuers of the 2025 tokenized real-estate tokens; the registry lists an issuerEntity for each (e.g. Olympus Capital Real Estate, LLC for Sedona Ranch, Goldman Investments R&B Towers Owner LP for RSRB).
- D3:3 item 2: involvesRegistry true. Deficiency: Omits the 2025 launches SDF's 2025 year-in-review highlights, such as Franklin Templeton's expansion, PayPal's PYUSD going live, RedSwan's $100M real estate and Ondo's USDY (stellar.org press, 2025-09-17).
- D3:2 item 1: involvesRegistry true. Deficiency: Omits notable 2025 RWA launches documented by SDF, notably Ondo's USDY launch on Stellar (stellar.org press, 2025-09-17), Franklin Templeton's 2025 Luxembourg fund launch and PYUSD going live.
- D3:1 item 1: involvesRegistry true. Deficiency: Lists only registry rows with 2025 launch dates and names no 2025 DeFi launches; omits headline 2025 launches such as Franklin Templeton's Luxembourg fund, Ondo's USDY, RedSwan's $100M real estate and PYUSD.
- C1:1 item 1: involvesRegistry true. Deficiency: States that tokenized bonds and treasury funds on Stellar are Soroban contract tokens and that no bond token is in the roster; the registry lists classic-asset bonds and treasuries (e.g. Bitbond's BB1 tokenized bond, Etherfuse USTRY, BENJI) and a Soroban 'VuMe Bond 2030' (TPT30).

Calibration recorded in PLAN.md before any run held: result 1's C3 drop `false`, D3 drop `true` under (b). The D3 drops here are `true` on the same
basis: registry rows given in the place where the year-in-review launches belong (D3:1, D3:2), or a misstatement of what the registry rows contain
(D3:3 item 1). C1:1's drop (item 1) is a claim about what the registry lists that the answer got wrong.

## Reading the outcome (reported, not a rule change)

- The deciding evidence is one question, D3 ("notable DeFi launches of 2025"), three of three samples, always INCLUDED `partial` against `correct`.
  The pattern matches result 1's single D3 sample. Neither arm made a bad (`wrong` or fabricated) answer anywhere, so this is a completeness loss, not an
  accuracy loss. INCLUDED answers used fewer turns (13 against 16) and USD 0.29 against 0.38 on D3: they stopped at registry rows, which date launches
  but do not hold the year-in-review headlines.
- On the controls and off-target questions the registry did not hurt: C2 INCLUDED was `correct` three of three against EXCLUDED `partial` twice (one outdated Horizon
  field claim each, once with a generic answer); C3, N1, N2 and N3 made no registry call and tied or improved. C1:1 is the only other INCLUDED-worse pair (a wrong claim that
  bonds on Stellar are Soroban-only, with a registry call), a single pair that passes clause 2 at 1 of 3.
- Result 1's attributable drop on C3 did not repeat: C3 tied correct on all three samples, with no registry call, which is consistent with that sample being noise.
- On D1 to D4 the registry is both the treatment and a reference source (see RESULTS.md); those pairs cannot show the registry wrong against itself.

## Limits

- One client, one judge per stage, three samples per pair. D1, D2 and D4 carry single-sample result-1 clauses.
- The grader sees each question three times (accepted limit; it grades each pair on its own).
- The attribution judge sees the INCLUDED arm's tool output by construction (the registered deviation from blind judging); it sees no EXCLUDED answer, no grade and no stake.
- Live content moved between the sequential arms (about eight minutes apart); the INCLUDED registry probe bracketed the arm and the registry stayed reachable.
- The judge's reason strings were written with X and Y labels; the mapping is in the Pairs table and in `verdicts-2.json`.

## Deviations from the plan

See EXEC.md, "Re-test", deviations. None changes the rule, the questions, the rubrics or the scoring.

## Not done (per the brief)

No commit after the pre-registration commit, no TODO or PR edit, no gates beyond the scripts' selftests, no push. RESULTS.md is unedited.
