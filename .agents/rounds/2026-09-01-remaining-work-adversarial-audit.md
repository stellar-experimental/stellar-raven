# Remaining-work adversarial audit

Date: 2026-09-01
Status: six independent reviews complete; findings reconciled
Branch: `docs/remaining-work-adversarial-audit`

## Scope

Audit every active, blocked, monitor-only, owner-decided, and evaluation-dependent item in
`.agents/NEXT.md` and `.agents/TODO.md`. Reconcile the findings into a block-by-block handoff.

This round changes durable planning and eval-workflow documents only. It authorizes no
implementation, paid evaluation, live fetch, production change, golden change, routing attempt,
or upstream message.

## Review lanes

| Lane | Runtime | Requested effort | Report | Status |
| --- | --- | --- | --- | --- |
| Grok | Grok 4.6 through OpenCode | max | `2026-09-01-remaining-work-adversarial-audit/audit-grok.md` | complete; `PASS-WITH-FIXES` |
| GLM Flash | GLM 5.3 Flash through OpenCode | max | `2026-09-01-remaining-work-adversarial-audit/audit-glm-flash.md` | complete; `PASS-WITH-FIXES` |
| GLM | GLM 5.3 through OpenCode | max | `2026-09-01-remaining-work-adversarial-audit/audit-glm.md` | complete; `PASS-WITH-FIXES` |
| Kimi | Kimi K3 through OpenCode | max | `2026-09-01-remaining-work-adversarial-audit/audit-kimi.md` | complete; `PASS-WITH-FIXES` |
| Opus | Claude Opus 5 | max | `2026-09-01-remaining-work-adversarial-audit/audit-opus.md` | complete; `PASS-WITH-FIXES` |
| Fable | Claude Fable 5 | xhigh | `2026-09-01-remaining-work-adversarial-audit/audit-fable.md` | complete; `PASS-WITH-FIXES` |

All lanes receive `.agents/rounds/2026-09-01-remaining-work-adversarial-audit/brief.md`.
Each lane works independently and reads no other lane report.

The orchestrator ran every lane in an owned Herdr pane. Inner provider sessions could not observe
that outer pane layer. OpenCode recorded each requested `max` variant, but the served variant is not
independently observable from inside those sessions.

## Synthesis

All six auditors passed the queue with required fixes. Fable and Opus received the highest weight
for product and API judgment. Repository evidence controlled every factual disposition.

### Reconciled findings

| Finding | Auditor overlap | Disposition |
| --- | --- | --- |
| Raven capability-boundary block lacked a product hypothesis, surface owner, trap and control contract, no-tool constraint, and authorization ladder | Grok, GLM Flash, GLM, Opus, Fable | Accepted. `TODO.md` now carries the full design boundary. `NEXT.md` starts with free evidence and a reviewed plan. |
| The prior Raven result had an unenforced environment pin | Grok, GLM Flash, Opus, Fable | Accepted. The result is now an invalid measurement with one safety observation. A fail-closed CLI pin is the first eval-instrument task. |
| Paired promotion had no durable work item and the margin question hid denominator failure | Grok, GLM Flash, Kimi, Opus, Fable | Accepted. The queue restores the paired item. Denominator, candidate-only T4, margin, cost, and spend trigger are separate decisions. |
| `sls-080` used stale `verified` wording | all six | Accepted. The queue now says `reported-upstream` and cites stellarlight#1134. |
| Protocol-history trigger names collided with five-track T-codes | Grok, Opus, Fable | Accepted. The queue maps the dated T1 to T4 triggers to PH1 to PH4. |
| Protocol-history PH1 and PH4 lost measurable conditions | Grok, GLM Flash, GLM, Opus, Fable | Accepted. PH1 now has both full hashes. PH4 now defines unrelated cases and transcript evidence. |
| The routing completion gate was weaker than the frozen table | Grok, Opus, Fable | Accepted. Completion now requires the complete attempt-three section 8 table. |
| Recovery confused freshness with authorization and used a fragile literal `28` gate | Grok, GLM Flash, GLM, Kimi, Opus, Fable | Accepted with Fable's source-parity rule. A matching probe removes one blocker only. |
| Free recovery monitoring had no cadence or result contract | Grok, GLM Flash, GLM, Kimi, Opus, Fable | Accepted. Each improvements or drift round records value, `generatedAt`, `scannedRef`, and `answerSource`. |
| `sources.locate` had no durable TODO and cannot trigger while recovery steering is absent | Grok, Opus, Fable | Accepted. The TODO records the full deferral and logs incomplete incidents without counting them. |
| Friendbot and vendor monitors lacked executable signatures | Grok, GLM Flash, Opus, Fable | Accepted. Both items now name the case or file, evidence signature, and trigger. |
| The first five-track same-100 run was missing from the committed QA record | Grok, Kimi, Opus, Fable | Accepted. `eval/qa/README.md` now records the stamp, pins, costs, tracks, result, and paired exclusion. |
| `eval/EVALS.md` and `run-evals` still said 499 cases | Grok, Opus, local verification | Accepted. Both now state 500 cases as of 2026-08-28. |
| `run-evals` omitted `workers-ai-provider/` from its finding collections | GLM Flash, local verification | Accepted. The skill and example frontmatter now include it. |
| `improvements/README.md` still routed own-repo work to retired Solo | Kimi, local verification | Accepted. The live route now points to `.agents/TODO.md`. Historical dated Solo references remain unchanged. |
| PR #99 may be merged but undeployed | Opus, Fable, local git history | Accepted as an uncertainty, not a live fact. The next block verifies production before an owner deploy decision. |
| Three `fixed-upstream` findings need independent retirement | Kimi, improvements charter | Accepted. The next improvements block names `sd-001`, `sd-036`, and `sk-020`. |
| The capability-boundary `Method 2` name collides with the complete five-track method | GLM, final Sol review | Accepted. Both queue records now define the capability-boundary method and distinguish the complete five-track method. |
| Recovery and Friendbot recurrence terms were not measurable | Grok, final Sol review | Accepted. The queue now defines qualifying misses, successful recovery, unrelated cases, stamps, identities, and transcripts. |

### Adjudicated disagreements

- The audits disagreed on whether 69 findings are “active.” The queue now gives the exact status
  counts and avoids that ambiguous word.
- Opus proposed immediate paired over-selection. Fable treated it as a pre-registered design
  decision. The queue uses Fable's safer disposition. It authorizes free validator design only.
- Several auditors kept a literal `28` recovery gate. Fable showed that the upstream value can
  advance. The queue now compares answer and source at the same `scannedRef`.
- The audits differed on whether a same-tuple pair should run now. The recorded 2026-08-31 plan
  says a merged product candidate must need the look. The queue preserves that trigger.
- The audits differed on protocol-history PH2 and PH3 urgency. The safe default stays closed.
  Free evidence must exist before the owner sees that decision again.
- Fable found the capability artifact missing and pin-invalid. The queue no longer describes its
  result as a clean product-gate failure.

### Human judgment that remains

| Decision | Evidence gate | Safe default |
| --- | --- | --- |
| Deploy or hold current `main` | Live Worker revision, diff from deployed commit, smoke and baseline results | Hold until live state is verified |
| Choose the Raven capability surface | Free prevalence scan, prose-surface inventory, no-tool reachability | Monitor-only |
| Choose paired denominator, candidate-only rule, and margin | A merged candidate needs a look; free validator evidence exists | No spend and no promotion |
| Reopen protocol-history through PH2 or PH3 | Per-control matrix, independent label review, 76-case product-impact count | Stay trigger-only |

No current decision authorizes a paid run, production deployment, fetch, or upstream message.

## Documentation changes

- Rewrote `.agents/TODO.md` around executable gates, safe defaults, and non-transferable authority.
- Re-ranked `.agents/NEXT.md` around production verification, eval reliability, and free maintenance.
- Added the 2026-08-30 five-track checkpoint to `eval/qa/README.md`.
- Corrected the 500-case denominator in `eval/EVALS.md` and `run-evals`.
- Added `workers-ai-provider/` to the `run-evals` finding route.
- Removed the live Solo route from `improvements/README.md`.
- Added closed-PR evidence retrieval and artifact-loss notes to the rejected-experiments closeout.

## Independent completion review

Codex Sol ran the independent completion review at requested `max` effort. It differed from the
author and orchestrator. The runtime did not expose the served model or observed effort. The report
is `2026-09-01-remaining-work-adversarial-audit/review-final-sol.md`.

The first verdict was `FINDINGS`. Every finding received this disposition:

| Finding | Disposition |
| --- | --- |
| The queue authorized a live production read that this round did not authorize | Repaired. The queue permits local comparison and query-plan writing only. The live read is owner-blocked. |
| The capability-boundary `Method 2` was undefined | Repaired. Both records define it and distinguish the complete five-track Method 2. |
| Recovery and Friendbot triggers were open to interpretation | Repaired. The queue now defines qualifying misses, successful recovery, unrelated cases, identities, stamps, and transcripts. |
| The tree secret scan did not cover untracked audit files | Repaired. The staged scan covered 238.09 KB across all intended files and found no leaks. |
| The stellarlight#1031 state lacked an evidence date | Repaired. The state now says it was last recorded open on 2026-08-31. |

Sol reviewed the repairs in
`2026-09-01-remaining-work-adversarial-audit/review-final-sol-followup.md`. The follow-up verdict is
`PASS`. It confirms that F1 through F5 are resolved and all authorization boundaries remain intact.

## Validation

All validation ran offline. No paid model call or live service fetch ran in the validation stage.

| Command | Result |
| --- | --- |
| `git diff --check` | pass |
| `npm run eval:qa:compile` | pass; 500 cases, 30 sample cases, 500 reserved IDs |
| `npm run eval:compile` | pass; 338 legacy and 122 extended cases |
| `npm run eval:selftest` | pass |
| `npm run eval:qa:lint -- --stale` | pass; 0 errors and 61 reviewed warnings |
| `npm run eval:qa:register -- --check` | pass; current |
| `npm run eval:qa:paired:validate` | pass; all deterministic gates pass |
| `npm run improvements:lint` | pass; 69 findings |
| `npm run typecheck` | pass |
| `npm test` | pass; 99 files and 1,579 tests |
| `npm run eval:routing -- --gate` | pass |
| `npm run build` | pass; Wrangler dry run |
| `npm run secrets:scan -- --tree` | pass for tracked files; no leaks |
| `npm run secrets:scan` after final staging | pass; all intended files and both review receipts; no leaks |

## Outcome

The documentation now distinguishes actionable, owner-blocked, evidence-triggered,
upstream-blocked, and complete work. The next paid or production action remains blocked by its own
decision and authorization gate. The independent completion follow-up verdict is `PASS`.
