# Answer-style v2 review (Codex gpt-6-astra, high)

Author and orchestrator: Claude Opus 5.5. First pass at `ed0f1035`; delta pass at `5c86fd0a`.

## First pass

# RC review: answer-style v2

Reviewed head: `ed0f103534977f6664f719732f23877d7b47e558`.
The review covers `d65395eb` and `ed0f1035`, with the full `63396840...HEAD` diff as context.
I derived the findings from the code, plans, and stored results.
I made no paid call or live upstream call.
I changed only this report.

## Findings, by severity

### P2 — Complete the Playground terminology change

Evidence: `src/demo/tools.ts:135`, `src/demo/steps.ts:165`, `src/demo/steps.ts:173`, and `src/executor/run.ts:404`.

The Playground still exposes `evidence: service-inconclusive` in its host summary.
The runner selects this value for successful responses without data and for failed service calls.
The step instruction calls a successful response without rows “inconclusive host evidence.”
Another step instruction calls soft-empty responses “inconclusive.”
Thus, the model still receives the shared word for both outcomes.

The counters and `ok` field preserve the machine distinction.
However, the requested wording fix remains incomplete on this model-visible surface.
The exclusion in `design.md:260` acknowledges this gap; it does not remove the gap.

Use separate model-visible wording for successful responses without rows, soft-empty responses, and errors.
An internal summary name can remain if the presentation maps it to accurate outcome text.
Update the Playground summary and step tests together.

### P2 — Preserve the closed-world exception in Playground search guidance

Evidence: `src/demo/tools.ts:392`.

The new guidance says an ok caveat “grounds no negative and no identity.”
That statement applies to every question and both caveat values.
A successful exact registry lookup without rows can support a negative answer within that registry.
The base instructions preserve this exception at `src/mcp/tools.ts:340`.
The execute recovery block also preserves it at `src/mcp/tools.ts:571`.

The new Playground sentence contradicts those rules.
It can cause unnecessary recovery or abstention for a valid registry-scoped answer.
Limit the negative restriction to open-world claims.
Keep the exact, closed-world exception explicit.

### P2 — Replace the inherited collection budget in the runnable command

Evidence: `measurement-plan-v2.md:121`, `measurement-plan-v2.md:134`, and `measurement-plan.md:257`.
These paths refer to `.agents/rounds/2026-10-10-weekend/answer-style/`.

The v2 budget allows `$18` per collection.
The inherited command still passes `--max-budget-usd 19`.
The command replacement list changes revisions and hashes, but omits this budget flag.
The command therefore allows `$88` across four collections, two re-judges, and two retries.
The stated authorization allows only `$84`.

Add `--max-budget-usd 18` to the command replacements, or publish the complete v2 collection command.
Keep the stated total authorization at `$84`.
The budget table states the correct intent; the executable instructions must match it.

## Answers to the review questions

### 1. Rename coverage and outcome distinctions

The envelope rename is complete in the inspected producer and consumer paths.
The dispatcher, envelope guard, ledger, summary count, footer markers, totals, and generated spec use `caveat`.
The MCP instructions, execute description, search guidance, and recovery block also use it.
I found no remaining consumer of the removed envelope field.

The dispatcher returns failed envelopes before adding ok-result signals at `src/executor/providers.ts:499`.
It adds caveats only after that branch at `src/executor/providers.ts:511`.
The footer counts errors, soft-empty responses, and successful responses separately at `src/policy/source-basis.ts:446`.
These paths preserve the required machine distinction.

The Playground wording still needs the two changes above.
The rename alone does not establish complete model-visible separation.

### 2. Restored sentence

The restored sentence exactly matches the baseline sentence at `63396840`.
It ends the attribution rule at `src/mcp/tools.ts:340`.
It follows the broad-search instructions and precedes the remaining evidence rules.
Its final character occurs at position 1,537 in the base instructions.
Thus, it remains inside the documented 2,048-character client limit.
The base instructions contain 1,971 characters.
The unchanged generated map brings the full instructions to 7,858 characters.

### 3. Generated artifacts and tests

The generated super spec matches the committed file byte for byte.
I ran its generator with filesystem writes captured in memory and network access disabled.
The 66 pinned skill files were present and passed their Git blob hash checks.
The micro-map renderer also produced the committed bytes.
No other generated artifact changes in this branch.

| Check | Result |
|---|---|
| `npm test -- test/auth.test.ts test/executor-providers.test.ts test/mcp-instructions.test.ts test/server.test.ts test/source-basis.test.ts` | Exit 0; 5 files, 271 tests passed. |
| `npm run typecheck` | Exit 0. |
| `npm run test:smoke -- test/smoke/demo-tools.test.ts test/smoke/executor-fixes.test.ts test/smoke/executor.test.ts` | Exit 1 before tests; the sandbox blocked `listen` on `127.0.0.1` with `EPERM`. |
| `git diff --check 63396840...HEAD` | Exit 0. |

The smoke command also could not write its Wrangler log outside the allowed workspace.
No smoke test executed, so this review cannot confirm that gate.
The author report records a successful smoke run; I could not reproduce it under these permissions.

### 4. Measurement plan

The arms and common runner isolate the server bundle appropriately.
The baseline is `63396840`; the candidate requires an approved head and a fresh surface hash.
The recorded changes between the old and new baselines match the repository diff.
ABBA balances gradual time drift, but it cannot remove abrupt upstream changes.
The plan correctly limits attribution to the whole bundle.

All four stored collections use the same 34 IDs in the same order.
The baseline selection reproduces this case hash:
`2cc286f6df1cd731c2999f265bac7d10d2800f98d96f5399309e965a8fd78c74`.
All 34 selected registry entries are active.
The selection includes the quantum replacement.
The 8/8/8/10 slices remain consistent with the selection.
The prelaunch quantum check remains required; this review made no live check.

The model defaults, rubric `v2.11`, and pack `p6` match the checked runner code.
The unchanged binary, environment, server-secret identity, remote identity, and stability-register pins provide useful controls.
Fresh values remain launch requirements, not completed checks in this review.

Rule 7 is fair as a conservative release decision.
It declares the retry count, selection, budget, and failure treatment before v2 spend.
It prevents an invalid confirmation grade from silently clearing a repeated apparent regression.
An unconfirmed regression remains unconfirmed evidence, even when the release rule counts it against the limit.
The report must preserve that distinction.
Ignoring unconfirmed improvements and retaining the live check are appropriate.

The judge-contract check correctly rejects grades based on nonexistent host restrictions or obsolete metric definitions.
It applies to both directions, which avoids a one-sided exception.
However, a monitor-only row can still contain a real answer defect.
Retain those defects in the mechanism review, even when the grade cannot support a consistent-change claim.
The stored C2 contracts answer illustrates this distinction below.

I recomputed the six artifact costs from their recorded budget calls:

| Artifact | Cost |
|---|---:|
| B1 | $11.6398508 |
| C1 | $12.0836566 |
| C2 | $11.6535360 |
| B2 | $11.8514340 |
| B1 re-judge | $0.3283216 |
| C1 re-judge | $0.3603036 |
| Total | $47.9171026 |

Every recorded call has a numeric cost.
The `$47.92` basis and `$84` allocation are sound.
The command mismatch above blocks launch until corrected.
The new budget authorization remains outstanding, as the plan states.

### 5. Transcript evidence and the restored sentence

The stored scripts show a failure beyond missing caveat visibility.
Both candidates changed the search target from Strupey to Stroopy after receiving the identity warning.
They then gathered exact records for the replacement project.
Those records confirm Stroopy, but they do not connect Strupey to Stroopy.

All artifact paths below are relative to:
`/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-10-11-answer-style/`.

- C1 reads `r.inconclusive` in `2026-10-11T09-04-33-variantA.json:17630`.
  Its result retains the corrected-match warning and candidate block at line 17633.
  Its next script searches “Stroopy” at line 17640.
  Its answer presents Stroopy's history as the resolution at line 17264.
- C2 omits the envelope signal from its projection at `2026-10-11T09-48-55-variantA.json:16617`.
  The host still supplies the candidate warning at line 16620.
  Later scripts search the replacement name and slug at lines 16637 and 16647.
  The final result reports `matchMode: "strict"` for that replacement search at line 16650.
  Its answer labels the identity inferred, then supplies the replacement project's history at line 16409.

This sequence can satisfy a superficial reading of “canonical slug plus source and date.”
The model obtains a valid slug for the wrong target.
The restored fallback may help, but these transcripts cannot establish that it will prevent the substitution.
H1 should inspect the identity link and the answer, not merely the presence of “unverified” or a clarification sentence.
Its current wording already requires the answer to avoid substituting another project's history.

The C2 contracts answer also explicitly joins “empty/`soft-empty`” at `2026-10-11T09-48-55-variantA.json:18645`.
That is a real wording defect independent of C1's invalid fabricated-field judgment.
Keep this defect visible under H2 even if the judge-contract rule makes the row monitor-only.

CODE: CHANGES: Complete the Playground terminology change and preserve its closed-world exception.
PLAN: BLOCKED: Change the inherited collection command to --max-budget-usd 18 before launch.


## Delta pass

# RC2 delta review

Reviewed commits: `805a3d02` and `5c86fd0a`.
Reviewed head: `5c86fd0a77693786486dd0ec3221f957b7716cc0`.
Comparison: `ed0f1035..HEAD`.
I read the reconciliation notes and checked each fix against the source.
I changed only this report and made no paid or upstream call.

## Findings by severity

### P3 — Clarify H1's new pass condition

Evidence: `.agents/rounds/2026-10-10-weekend/answer-style/measurement-plan-v2.md:67`.

The new sentence requires that “no returned record links” the requested name to the project whose history the answer gives.
This wording reverses the evidence condition for a supported attribution.
It also conflicts with the next sentence, which rejects an unverified substituted history.
A reviewer can infer the intended rule, but the literal condition is unclear.

Use this condition instead:
“Without a returned identity link, H1 passes only if the answer reports non-verification and does not substitute another project's history.”
If new evidence establishes the identity link, assess that evidence explicitly.

This is a non-blocking diagnostic clarification.
Line 60 explicitly excludes H1 from the release gates.
The existing consistent-regression rules still control the release decision.
I found no new blocking code or plan defect.

## Verification of previous findings

1. **Playground terminology: fixed.**
   `src/demo/tools.ts:133` maps the internal summary to separate model-visible outcome labels.
   `src/demo/tools.ts:150` uses that mapping in the actual returned host summary.
   The label preserves combinations of successful responses without rows, soft-empty responses, and errors.
   `src/demo/steps.ts:51` recognizes all emitted combinations through their first outcome.
   It excludes `service-data`.
   `src/demo/steps.ts:165` now describes successful responses without rows as ok data.
   The remaining `service-inconclusive` references serve internal state, comparisons, or telemetry.
   The production caller supplies that internal state at `src/demo/chat.ts:323`.

2. **Closed-world exception: fixed.**
   `src/demo/tools.ts:407` limits the negative restriction to open-world claims.
   It explicitly permits an exact empty result within the named source's scope.
   `src/demo/steps.ts:165` preserves the same exception.
   The touched tests check both the scope restriction and the successful-result distinction.

3. **Collection budget: fixed.**
   `measurement-plan-v2.md:151` explicitly replaces the inherited value 19 with 18.
   The complete command uses `--max-budget-usd 18` at line 165.
   Lines 176–177 require exactly one budget flag with that value.
   The caps now sum to `$84`: four collections at `$18`, two re-judges at `$4`, and two retries at `$2`.
   This plan path is under `.agents/rounds/2026-10-10-weekend/answer-style/`.

The additional plan changes retain real answer defects when a judge artifact makes a row monitor-only.
They also preserve the distinction between unconfirmed evidence and the conservative release decision.
H2 retains the actual C2 envelope-confusion example.
The delta changes no MCP instructions, generated artifact, generator input, case selection, or judge implementation.

## Tests and limits

I ran the touched tests directly, without output pipes.

| Command | Result |
|---|---|
| `npm test -- test/demo-steps.test.ts` | Exit 0; 18 tests passed. |
| `npm run typecheck` | Exit 0. |
| `npm run test:smoke -- test/smoke/demo-tools.test.ts` | Exit 1 before tests; the sandbox blocked the local socket with `listen EPERM`. |
| `git diff --check ed0f1035..HEAD` | Exit 0. |

The sandbox also blocked Wrangler's external log path.
No smoke assertion executed in this review.
The author reports 124 passing smoke tests after these fixes; I could not independently reproduce that result.
This environmental limit does not identify a code defect.

The plan remains suitable for launch after its existing authorization and preflight requirements pass.
This verdict does not authorize spend or approve the eventual measurement result.

CODE: APPROVE
PLAN: LAUNCH-OK
