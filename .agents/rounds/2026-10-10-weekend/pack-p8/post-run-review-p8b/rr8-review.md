The p8b continuation is NOT ACCEPTED under the amended Stage 2 rule.
The mechanical acceptance gate passes.
The candidate's sentence scope remains unresolved.
The original p8 run remains BLOCKED.

I reviewed HEAD `2cc429a49fddf4adb4e429b3135a850b49f3de15` and the declared saved artifacts.
I read every new rationale, the complete saved transcript, the candidate answer, and both reconstructed packs.
I also read the amendment, the operator's result, the R6 review, and the R7 review with its delta.
I used the run-evals skill for the saved-evidence review.
I made no paid call, started no server, and changed no tracked file.

The assigned reviewer role is Codex frontier (`gpt-6-astra`) at high effort.
The amendment identifies both the author and the orchestrator as Claude Opus.
I used no fallback reviewer.

**Mechanical acceptance gate: PASS.**

I reconstructed the input from the original source result and its historical case revision.
The reconstructed input exactly matches the cached input in `post-run-review/saved-data/`.
I rebuilt the p6 and p8 packs and their complete prompts through the pinned arm modules.
The current p8 builder produces the same pack.
The reading command reproduces `p8b-reading.json` exactly.

| Check | Independent result |
|---|---|
| New artifact | `2026-10-10T19-39-59-rejudge.json` |
| Artifact SHA-256 | `26fd63b54533e4f3f1686af88765a5a2ec1682fcc91c175e3f5ee25d2e9b9d30` |
| Source result SHA-256 | `e3517cf81b724016ac33f84be1deb9c4e17207507a2c8f2b841e08876465e5f4` |
| Selection | Exactly one row: `q-defi-arbitrage-pathpayment-bots` |
| Calls | Exactly 3 recorded judge calls; 3 graded votes; zero error votes |
| Costs | $0.1380186, $0.1320954, $0.1072764 |
| Total | $0.3773904, which rounds to $0.3774, within $0.85 |
| Cost accounting | 3 reported costs; zero missing costs; each remaining-budget authorization matches |
| Checkpoint | Every call costs less than $0.60 |
| Tuple | `claude-sonnet-5` / `v2.11` / `p8`; panel size 3 |
| Completion | `successful`; postflight `passed`; no incomplete or unattempted row |
| Identity | Before and after pins match; identity guard passes |
| Arm-B HEAD | `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b` |

Every call matches these rebuilt input hashes:

| Input | SHA-256 |
|---|---|
| p8 pack | `ac9c47b6be31afb685b94112c6c205fd7387580ea5ae935a72b5681e02caa1d0` |
| p8 complete prompt | `3cc7187326b5487ae31fb433efcbe87f5eea060e992852eca54c68d4c3b1887e` |
| Candidate answer | `7e5ec292e34ae2855bdae7d2d1089a2607544851524638b7fe7de6462f72a283` |
| Reused p6 pack | `76eec18f8cecd31e1fa7cdd3c68a6f3d85dfe1c42e0cce76a2a09903a3f6ebe8` |
| Reused p6 complete prompt | `ee8a879f38f60476aa96d7be0e0dc946a45cd448c43185c127c78a9d85955d9e` |

The p6 baseline also matches the declared model, rubric, panel, answer, and identity pins.
I verified both historical artifact hashes against the continuation manifest.
The current executable and frozen launcher reproduce the following pins:

| Identity | SHA-256 |
|---|---|
| Binary | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Environment | `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac` |

These records establish three recorded calls in this artifact.
They cannot exclude an unrecorded invocation elsewhere.
The mechanical result is `ready-for-reading`, not acceptance.

**R8-1 — Blocking: the candidate does not clearly assign Inactive to StellarTerm.**

The complete disputed sentence is:

> Current Soroban-side DEX/AMM TVL (scout directory, generated 2026-10-08): Aquarius ~$38.9M, Soroswap ~$1.24M, with Phoenix, Octarine, Zenex, Noether, Raum Network, StellarTerm (classic SDEX UI), and Comet marked Inactive.

The broad reading applies “marked Inactive” to every name after “with”.
That is a plausible grammatical reading.
The narrow reading lists the venues and applies “marked Inactive” only to Comet.
That reading is also plausible in this mixed list of amounts, names, and a parenthetical description.
The following sentence discusses shallow pools; it does not resolve which projects the candidate calls inactive.
The answer contains no separate statement that StellarTerm is inactive.

The p6 baseline's first vote explicitly identifies the ambiguity and prefers the narrow reading.
Its third vote takes the broad reading and flags Zenex.
These votes do not decide the sentence meaning, but they document the unresolved distinction.
The three new votes all assume the broad reading without addressing the narrow reading.
Repeated agreement on an assumption does not independently confirm that assumption.

The saved source establishes StellarTerm's status without ambiguity.
Execute entry 1, transcript array index 5, contains this complete record:

```json
{"id":"6943360730bcaa9def8eee87","name":"StellarTerm","slug":"stellarterm","status":"Live","tvlUSD":null,"links":{"website":"https://stellarterm.com/","github":"https://github.com/stellarterm","twitter":"https://x.com/stellarterm"},"url":"https://stellarlight.xyz/project/stellarterm"}
```

The call is `scout.searchProjects({ type: "DEX", limit: 10, fields: "name,slug,status,tvlUSD,links" })`.
Its source metadata gives `generatedAt="2026-10-08T00:04:52.749Z"`.
The entity, status field, date, source URL, and directory scope all match the candidate's citation.
No other saved result changes StellarTerm's status or qualifies this status as stale.
This confirms the source value; it does not resolve the candidate's sentence scope.

The pack locations matter:

| Pack | Relevant location |
|---|---|
| p6 | `canonicalUrls` contains the StellarTerm URL; no StellarTerm status record appears. |
| p6 | `claimSnippets` item 5, term `Zenex`, retains Comet `Inactive` and Zenex `Live` together. |
| p8 | `sourceItems` item 8 retains StellarTerm `status="Live"` with its exact source URL. |
| p8 | No status record remains for Comet, Zenex, Phoenix, Octarine, Noether, or Raum Network. |

Both packs retain the directory snapshot date in `provenance`.
The p8 StellarTerm item accurately preserves the saved source.
However, p8 removes the Comet and Zenex context that p6 exposed.
That context supports the narrow reading as a faithful description of the saved statuses.
The records do not prove that this omission caused the new votes.
They also do not justify ruling out lost relevant context as a cause.

The complete saved result gives these statuses:

| Project | Saved status |
|---|---|
| Phoenix | `Live` |
| Octarine | `Live` |
| Zenex | `Live` |
| Noether | `Pre-Release` |
| Raum Network | `Development` |
| StellarTerm | `Live` |
| Comet | `Inactive` |

All seven records have `tvlUSD: null`.
That does not mean all seven projects are inactive.
Under the broad reading, six status claims conflict with the source.
Under the narrow reading, the Comet status claim agrees with the source.
The other statuses strengthen the conditional contradiction; they do not establish the broad reading as the candidate's intended claim.

The amendment requires a direct contradiction of the candidate claim and confirmation of its scope.
It also states: “An unresolved cause blocks acceptance.”
Calling this a sentence-interpretation difference does not exempt it from that rule.
The source value is certain, but the necessary candidate claim remains uncertain.
Therefore, I cannot independently confirm the claimed evidence correction.
This finding qualifies the earlier R6 and R7 conclusions about an established answer error.
Their correct source extraction remains valid.

**Reading of every new vote.**

| Vote | Grade | Assessment |
|---|---|---|
| 1 | `wrong` | Accurately reads StellarTerm `Live` from the cited Scout result. Assumes the disputed broad reading. Records `avoidMatches: [4]`. R8-1 remains unresolved. |
| 2 | `wrong` | Accurately reads the same source value. Its quotation replaces “, and Comet” with an ellipsis. That omission hides the disputed attachment. Records `avoidMatches: [4]`. R8-1 remains unresolved. |
| 3 | `partial` | Accurately reads the same source value. Calls the candidate claim a specific contradiction without resolving its scope. Records no avoid match. R8-1 remains unresolved. |

All three votes mark the core answer correct and record no missing facts.
Their descriptions of dates, payment mechanics, risk factors, and profit caveats agree with the candidate answer.
No vote uses a notice as support or an entry number as a source identity.
No vote attributes the StellarTerm record to the wrong service, entity, or date.
I found no removed qualifier within the StellarTerm record itself.
The possible meaning change concerns the candidate sentence and omitted surrounding project context.

The current support diagnostic returns `no-pack-omission` for every vote.
That result does not test grammatical scope or prove the complete contradiction.
It does not resolve R8-1.

**R8-2 — Reconcile the must-avoid mapping before describing these grades as correct.**

Must-avoid item 4 says:

> Do NOT claim unsupported memory is a source-supported current observation.

Votes 1 and 2 expand this into a general prohibition on incorrect sourced observations.
The candidate cites an actual retrieved directory result.
The saved evidence does not establish that the disputed wording came from memory.
Even under the broad reading, a mistaken summary does not by itself establish unsupported memory.
The rubric permits a concrete source contradiction in `wrongClaims` without an avoid match.

This distinction matters because any avoid match forces `wrong` under `v2.11`.
Vote 3 records the same alleged contradiction without an avoid match and gives `partial`.
Thus, the two `wrong` grades include a disputed rubric application beyond the status comparison.
Do not treat their grade severity as an independently verified consequence of better source evidence.
This is a grading issue; it does not independently prove a defect in the p8 source item.
R8-1 already blocks acceptance for all three votes.

**Disposition and limits.**

Keep every panel and every individual vote:

| Panel | Votes | Panel score |
|---|---|---|
| Reused p6 baseline | C/C/P | `correct` |
| Historical p7 | C/C/C | `correct` |
| Historical p8 | W/P/P | `partial` |
| New p8b | W/W/P | `wrong` |

This continuation measured one new row.
The other 31 rows remain reused evidence under their unchanged rules.
Stage 1 and Stage 3 retain their prior passing readings.
The other three Stage 2 downgrades retain their declared variance classification, without a statistical variance claim.
None of those retained results resolves this row's sentence scope.

Reconcile `results-p8b.md` and the amendment's run-log conclusion with R8-1 and R8-2.
Do not replace the saved answer, remove the accurate StellarTerm item, or discard any vote.
Do not claim that another identical panel would settle the sentence meaning.
This review authorizes no retry or replacement call.

An accepted continuation would clear only the measurement gate for a later merge that makes p8 active.
That merge would still require applicable code checks, review reconciliation, and merge authorization.
Acceptance would not authorize deployment, additional paid calls, or a change to the original BLOCKED result.
It would not establish general accuracy, statistical equivalence, or 32 newly measured rows.
This continuation does not clear that measurement gate.
The current branch uses p8 in active judge construction; it is not an isolated offline diagnostic.

POST-RUN: NOT ACCEPTED: R8-1 unresolved candidate sentence scope and evidence-correction cause; R8-2 disputed must-avoid mapping
