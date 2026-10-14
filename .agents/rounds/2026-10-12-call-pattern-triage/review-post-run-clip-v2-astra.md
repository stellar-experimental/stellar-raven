Independent post-run review: clip marker v2

Reviewer: Codex, independent of the author and the orchestrator.
Review target: `b1e7d2bacd7bb68a8537f01277969adc77de1ffd`, clip result only.
I read all 24 answers, their goldens, execute scripts, returned evidence, and judge reasons.
I changed no repository file and made no paid call.

The clip passes the written screen on `0a60d98a`.
The clip-only change can merge onto the current `origin/main`.
This conclusion does not approve the section text, section guard, or the complete branch diff.
The screen remains limited to six cases and the primary Playground model.

1. The measured arms match the intended shipping comparison.

At `2026-10-14T06:09:31Z`, `git ls-remote origin refs/heads/main` returned `0a60d98a48e3bc0c7076961e33991aee2c7375d8`.
The local `origin/main` has the same revision.
Thus, main has not moved beyond the measured baseline.
The paired-launch directory was absent during this review.

| Arm | Revision | Tree | Generation |
| --- | --- | --- | --- |
| BASE | `0a60d98a48e3bc0c7076961e33991aee2c7375d8` | `488e1aeb923435c8da13799c47d72a5a75097140` | `9743c67c5a9a0568283274f80a4d20b2ed0b49d8e555fdfc111e7214aa258f87` |
| CANDIDATE | `6e0d11000f6762e773189e66278fd8979fedd880` | `d4cc6e801d68631cd9936c91a4d61d24ce889745` | `6d65ccb545409be3831b6bbcbd5b36dd14c6d9d3bfc1416fdefd02da79950f85` |

I recomputed both generations from the stored revision and clean-tree hashes.
The surviving arm worktrees remain clean and match these trees.
The complete arm diff contains only `src/demo/tools.ts` and `test/smoke/demo-tools.test.ts`.
Its added and removed lines match the net clip changes from `c3b25d94` and `6ab15c9f`.
They also match the previous measured clip arm, `f7b1b775..fb84c199`.
Only patch context differs after #271.

The clip code reads required fields from the exact catalog entry.
It applies the same marker mechanism to hits, wider candidates, and recovery candidates.
It changes no catalog ranking, endpoint, authorization, or executor behavior.
Both arms include #271 and exclude the separate section changes.

2. Completeness and retained pins pass, with stated evidence limits.

All four method artifacts contain the six frozen IDs in corpus order.
Every ID remains active, and the selected case entries match `6891dca2`.
I recomputed the selected-case hash: `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d`.
All four method artifacts match it.
The corpus, manifest, spec, runner, judge, and evidence-pack file hashes match their recorded arm revisions.
The artifact contract validator accepts all five artifacts, including the receipt.

Every method command retained an exit-0 receipt and a complete budget.
All 24 grades are valid.
All rows finish with `stop` and a nonempty answer.
There are no HTTP, SSE, client, or unfinished-tool errors.
Every row has exactly one valid `eval-cost` frame, with complete provider-call accounting.
No replacement, initial-judge retry, or confirmation re-judge ran.

The judge uses `claude-sonnet-5`, rubric `v2.11`, and pack `p9` throughout.
Launch amendment 3 declares `p9` before collection.
The retained binary hashes to `ba5ab7b8c195fa03ab8d5bf3915c76153b576a2c40e79a5c46e265e7ed9744b3`.
It is Claude Code `2.1.299`.
Each judged command retains a matching binary check in `results/{b1,c1,c2,b2}.out`.

All five paid-command receipts retain the same successful environment check:
`44fab7741c89828747de93eb2a8f27dd7946493f907033d3c94427d339b91f12`.
The four launch probes and final probe retain the same source identity:
`414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e`.
This identity does not prove that every upstream page stayed unchanged.
The answer traces below therefore use the actual returned evidence.

The arm installations currently report `ai` `7.0.137` and `@ai-sdk/openai` `4.0.91`.
The ledger records these receipts before each server start.
The retained server logs do not contain those package-version printouts.
Thus, the historical per-start SDK check remains an operator receipt, supported by the unchanged lockfile and surviving installations.

The Playground generation remains an operator assertion, as `meta.server.proofLimit` states.
It does not independently inspect loaded Worker bytes.
The server revision lines, clean arm snapshots, and observed marker exposure support the asserted comparison.
These are evidence limits, not observed identity mismatches.

3. The receipt, server mapping, and slot conditions pass.

I reran `demo-steps.mjs --strict-usage` on all three complete logs.
They contain 7, 12, and 6 turns respectively.
Every turn attempts only `openai/gpt-5.6-terra`.
Every turn's search and execute counts match its assigned artifact row.
All usage sums match; no turn reaches step 7.
The final-step behavior therefore remains unexercised.

The first BASE turn is the receipt, with cost `$0.0963855`.
It reports 3 of 3 provider calls and tokens `34,620 / 820 / 35,440`.
Its answer contains 2,135 characters, and it finishes with `stop`.
This satisfies the imported receipt gate.

The three start receipts record no Raven process and no listener on port `8799`.
Their one-minute loads are `10.60`, `9.09`, and `4.72`.
Each is below the predeclared limit of `12`.
The load wait is recorded separately and stays within the authorized 30 minutes.
All four collections have zero host, server, or sandbox-timeout rows.
They remain below the contention limit of `1`.

The candidate log's `GET /` does not add a chat turn.
Its 12 chat turns map exactly to C1 and C2.
The only execute failure is C1 anchor's `dirRows.map is not a function`.
The next script repairs the local array handling and returns evidence.
This is a recovered model error, not a tool-loop defect under the written definition.

Gateway headroom was not read.
This remains an acknowledged launch-check omission, not a completed checkpoint.
The complete receipts show no Gateway refusal, missing cost, or resulting incomplete collection.
I do not use that omission to invent a new answer-quality failure rule.

4. Independent counts reproduce the primary result.

The counter hash is `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`.
All 23 fixtures pass.
My counter output equals the retained `results/count.json`.
I also checked each execute script and each host invalid-argument record.

| Run | Target M1 | Control M1 | M2 | Non-docs M2 | Docs calls | Marked search results | Search characters |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| B1 | 1 | 0 | 1 | 0 | 6 | 0 | 105,322 |
| C1 | 0 | 0 | 0 | 0 | 9 | 14 | 115,884 |
| C2 | 0 | 0 | 0 | 0 | 9 | 14 | 111,123 |
| B2 | 2 | 0 | 2 | 0 | 8 | 0 | 122,961 |

M4 has zero unknown calls, unresolved docs references, and unparsed scripts.
BASE has 14 docs calls, 3 target omissions, and 228,283 search characters.
CANDIDATE has 18 docs calls, zero omissions, and 227,007 search characters.
Different queries and search counts limit the card-cost interpretation.

The three omissions are directly visible:

- B1 anchor, transcript entry 3: `search_anchor_sep_docs({ hitsPerPage: 3 })`.
- B2 anchor, transcript entry 3: `search_anchor_sep_docs({ hitsPerPage: 3 })`.
- B2 stablecoin, transcript entry 3: `search_asset_token_docs({ hitsPerPage: 5 })`.

Each has one matching `[invalid-args: query]` record.
Every candidate target card carries `required input: query`.
No BASE search result carries a required-input marker.
All six candidate cases receive marker exposure.
The per-row hit-card and wider-candidate marker counts match the result report.

Search calls total `14, 15, 15, 16` in ABBA order.
Every search supplies `kind`, `service`, and `limit`.
None supplies `recoverFrom`, `reason`, or a null value.
Only the recovered C1 script produces a tool-error entry.

5. The independent answer trace supports the fixed verdict.

Artifact references below use `/private/tmp/raven-clip-marker-v2/results/{run}/*-playground-semantic.json`.
Each reference identifies the row by its full ID.
I preserve all stored grades.
The trace distinguishes answer omissions from inconsistent judging.

| Row | B1 | B2 | C1 | C2 |
| --- | --- | --- | --- | --- |
| `q-anchor-list-builders-discovery` | correct / T | partial / T | partial / T | partial / T |
| `q-asset-stablecoin-issuers-discovery` | partial / T | correct / T | partial / T | partial / T |
| `q-protocol-base-reserve-min-balance` | wrong / E | partial / E | partial / E | wrong / E |
| `q-scf-build-award-cap` | partial / E | partial / T | wrong / E | partial / E |
| `q-sep-45-contract-auth` | partial / E | partial / E | partial / T | partial / E |
| `q-soroban-storage-types` | partial / E | partial / E | partial / E | partial / E |

Anchor: B1 dates the directory snapshot as `2026-10-14`.
B2, C1, and C2 omit the observation date.
Their named examples follow their returned project or partner records.
C2 uses the 43-partner directory; other answers emphasize the 15-project anchor category.
They state source limits instead of claiming a complete permanent roster.
The grade difference traces to a real dating omission that also occurs in BASE.

Stablecoin: all four answers date their registry observation as `2026-10-13`.
They name Circle's USDC and EURC and distinguish MyKobo's separate EURC.
Their issuer examples follow the visible registry, with different projection lengths.
None explicitly calls Circle the dominant issuer.
B2's judge nevertheless credits that statement, while the other judges require it explicitly.
Thus, the B2 advantage reflects inconsistent judging of the same missing fact.

Reserve: B1 and C2 present the unsponsored formula without adequately limiting its scope.
B2 limits that formula to an ordinary non-sponsored account.
C1 supplies the complete sponsorship-aware formula.
B2 and C1 retrieved the sponsored-reserves page; B1 and C2 did not retrieve that formula.
However, B1 did retrieve and mention sponsorship generally.
C2 also omits selling-liability information that the other answers include.

These are real retrieval and answer differences within both arms.
No answer covers every golden requirement, including Soroban rent and the reserve obligation after sponsorship ends.
The repeated arm grades do not satisfy the regression condition.
This remains the known `sd-046` area.

SCF: every answer gives the source-supported `$150,000` cap paid in XLM.
Every answer omits the observation date and milestone-based tranches.
The returned evidence supplies tranche information in every run.
C1 additionally omits the source name; the other answers name the awards page.
The C1 judge applies the undated-measurement avoid clause more strictly than the other judges.
C2 matches both BASE grades, so no repeated candidate grade regression exists.

C1 also adds a payment-time valuation statement.
Its transcript supplies the detailed pricing clause under Growth-Hack official rules, not a Build-specific rule.
The FAQ supports USD valuation and XLM payment, but does not establish that precise Build pricing schedule.
Treat this as a source-scope limitation in one answer.
The second reader's unconditional support claim is too strong.
It does not supply a repeated candidate regression.

SEP-45: all four answers identify the correct standard and contract-account scope.
Both BASE answers also explain the SEP-10 distinction.
Both candidate answers omit that distinction.
The BASE scripts request `includeContent: true`; the candidate scripts omit it.
Their returned snippets omit SEP-10, while the BASE results contain the distinction.
This is a repeated detail loss worth retaining as a monitoring observation.

All four SEP-45 grades remain `partial`.
The written rule requires worse grades in both candidate repetitions; this observation does not meet that condition.
The evidence does not isolate why the model omitted `includeContent`.
I do not claim that equal grades prove equal answer detail.
All four answers also omit the requested freshness framing.

Storage: all four answers correctly distinguish permanent Temporary deletion from restorable Persistent and Instance archival.
They give supported use cases and SDK accessors.
All omit the two-variant XDR distinction and the complete auto-restore requirements.
Some returned text supplies manual restoration or simulation guidance, but the answers do not fully convey it.
The candidate answers retain the core semantics; C2 adds simulation handling.
The equal partial grades do not conceal a repeated core-semantics regression.

6. Live checks and reporting corrections do not change the gate result.

I independently retrieved the public SCF awards page and the relevant official Stellar documentation.
The awards page confirms the `$150K` cap in XLM and tranche releases after deliverable review.
See [SCF awards](https://communityfund.stellar.org/awards).
The retained page is `/private/tmp/claude-501/w1013/rc2-awards.html`.

The current documentation confirms `0.5 XLM` and sponsorship exceptions.
It gives the sponsorship-aware formula in the dedicated guide.
See [Lumens](https://developers.stellar.org/docs/learn/fundamentals/lumens) and [Sponsored reserves](https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves).
Thus, checking the reserve value alone does not validate C2's unqualified formula.

The following reporting corrections are nonblocking:

- `result-clip-v2.md:157` describes both wrong cells as having no factual error.
  Prefer a narrower statement: the cap and reserve value match sources, but answer omissions and scope errors remain.
- `result-clip-v2.md:191` should distinguish missing sponsorship formula terms from missing sponsorship evidence generally.
  B1's returned Lumens content includes sponsorship and zero-balance creation.
  Its answer mentions sponsorship too.
- `/private/tmp/claude-501/w1013/clip-v2-reader2.md:118` incorrectly reports zero B1 matches for `sponsor`.
  The execute result contains five case-insensitive matches.
- The second-reader summary at line 17 gives C2 grades as `0/4/2`.
  The artifact and that reader's detailed table give `0/5/1`.
- The second-reader summary at line 134 implies every candidate search has a marker.
  Each candidate has 14 marked searches out of 15 searches.
- Retain the SEP-45 detail loss and C1 pricing-source limitation alongside the grade-based trace.

These corrections improve the explanation without changing any stored grade or threshold.
The report's primary counts, main grade table, spend, and routing totals are correct.

7. Spend and code verification support merge of the clip alone.

I summed individual `budget.calls[].costUsd` values with decimal arithmetic.
Every started call reports a positive cost below `$0.30`.
Every command remains within its authorization.

| Command | Answer USD | Judge USD | Total USD |
| --- | ---: | ---: | ---: |
| Receipt | 0.0963855 | 0 | 0.0963855 |
| B1 | 0.3677998 | 0.4557164 | 0.8235162 |
| C1 | 0.4160236 | 0.4489484 | 0.8649720 |
| C2 | 0.3323356 | 0.4421224 | 0.7744580 |
| B2 | 0.3600800 | 0.4458356 | 0.8059156 |
| Total | 1.5726245 | 1.7926228 | 3.3652473 |

The total is below the `$22` cap.
The highest call costs `$0.1256729`.
There are 25 answer turns, including the receipt, and 24 judge calls.
The cap files correctly record method-call consumption as `0/0`, `6/6`, `12/12`, and `18/18`.
No unused reserve was spent.

The candidate passes `npm run typecheck` during this review.
I also exercised the actual clip functions against all 61 current callable catalog entries.
All callable lines survive; 56 signatures clip, and 32 clipped signatures receive required-field markers.
Every current result stays within 400 characters.
A synthetic long callable retains the required marker through the fallback.
The ledger documents that this fallback can exceed 400 characters for future entries.

The smoke assertion at `test/smoke/demo-tools.test.ts:531` checks the target marker and callable line.
It also checks the current 400-character limit.
Launch amendment 3 records passing BASE and CANDIDATE smoke suites, with 124 and 125 tests.
I did not rerun smoke, the full unit suite, or the build during this read-only review.
I started no additional Worker while the separate text measurement could still be active.

The fixed decision rules apply as follows:

- Rule 1 passes: four complete runs and all 24 grades.
- Rule 2 passes: candidate target markers and no baseline markers.
- Rule 3 passes: target omissions fall from 3 to 0; control omissions remain 0.
- Every routing cell passes; all six candidate protocol-control cells pass.
- No row meets the repeated worse-grade condition after independent tracing.
- No candidate tool-loop defect occurs.
- Rule 4 supplies no FAIL condition; non-docs invalid-argument counts remain zero.
- Rule 5 does not apply because every PASS condition holds.
- Rule 6 correctly produces an empty confirmation list; rule 7 is unused.
- Rule 8 has live checks for both candidate wrong cells.
- Rule 9 remains satisfied: the experiment makes no per-case change after collection.

The controlling grade condition is `plan-clip-marker.md:142` and the imported ai-upgrade plan at line 578.
My trace above supplies the non-author review required by the imported plan at line 580.
No new exception, threshold, regrade, or paid confirmation supports this verdict.

Independent audit artifacts remain beside this report:
`rc2-audit.py`, `rc2-audit.json`, `rc2-count.json`, and `rc2-steps-{base-a,candidate,base-b}.json`.
The five result-file hashes match the committed report.
The repository remains unchanged by this review.

CLIP: PASS-CONFIRMED-MERGE-OK
