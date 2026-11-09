# Playground resumption — November 9, 2026

The owner resumed the experiments after the Claude reset, then explicitly requested only decision-relevant evaluation and simpler skills/plans. The old 1,616-cell study is preserved as incomplete and superseded. The new bounded product decision is recorded in [the result report](../../research/audits/2026-11-09-playground-product-decision.md).

## Current decision

Retain `openai/gpt-5.6-terra` as primary. `anthropic/claude-haiku-5.5` qualifies as fallback: on the disjoint 24-case confirmation it has three wrong answers versus Luna's seven, with no answer failures or unsafe output. It has fewer fully correct answers and more partial answers; this is a fallback acceptance result, not broad superiority. Haiku passed all five required production-gateway checks on 16/16 turns (broader diagnostic 14/16). The unchanged primary failed `noToolFailures` after a generated-script shape error, then recovered and answered normally. Its stopped run remains incomplete. After the owner delegated the final decision and requested Opus review, the coordinator chose `fallback-only-release-exception-2026-11-09`, approved by independent Opus 5.5/high review: ship the qualified fallback, retain the primary and preserve its failed/incomplete result and full allocation. This is a release-policy amendment, not a pass under the original two-cell gate. No retry is planned.

The second-judge experiment is closed with a route limitation: adapter/calibration passed, but 75 first attempts included two zero-cost provider 429s and 73 completions. The 125 unattempted calls and old $2.591247 unresolved hold remain. No more B collection or recovery is planned. The OpenAI primary comparison stopped after one zero-cost account-inactive evaluation failure. Existing production logs subsequently showed successful wholesale primary calls on a different gateway.

## Scope, evidence and accounting

The [original ledger](2026-11-06-playground-final-resolution.md) and [resume checkpoint](2026-11-06-playground-resume.md) govern historical evidence. Their exhaustive completion requirement is superseded by the owner's scope amendment, `playground-product-screen-confirm-v1`. The paired screen and one confirmation used 60 new answer attempts and 59 A calls; no retries or top-ups. The report records selection, raw versus adjudicated outcomes, blind review coverage, freshness handling and limitations.

New collection API cash is $1.2722109; settled Haiku production cash adds $0.1010618. Lifetime posted ceiling consumption is $12.39647583; the $2.591247 old hold, full $1.21 primary allocation and $20 reserve remain intact, leaving $163.80227717 above them. The partial primary receipt reports $0.3986999 and session-bound Gateway evidence observes $0.4129097; neither is added on top of the full hold. The $7.97 conservative charge is already inside the carried prior cohort, not another debit. A's $4.1203134 subscription notional is not API cash.

Private evidence: `tmp/playground-final/resume-2026-11-09/`, including the immutable old journal snapshot, recovery/exact-log proof, failed singleton, accepted lean plan, caps/grants/receipts, blind reviews and conditional patch reviews. The full pre-closeout chronology is retained at `chronological-ledger-before-closeout.md`, SHA `695997fdca1e15c84fe8c8f46426a021ee09de6a5581c501f156bcaa9e477ae8`. Original answers, failed methods, judge errors and denominators remain preserved.

The approved one-time B exception reconciled a fully known $0.408753 prefix and reserved its $2.591247 residual for one untouched cell. That cell returned another zero-cost 429; the journal halted again and the residual stayed held. There is no further admission or retry. Root accepted the old-85 audit reconciliation separately; it is not product-comparison data.

The conditional route and effort-receipt patches passed independent Fable review. The candidate adds Haiku and exact default-pair request-equivalence assertions. The receipt metadata creates a documented answering-config hash discontinuity; frozen collection sources were never modified. The eval skill now scopes work to decisions, reuses unchanged evidence/checks, requires a stopping rule and fixed review coverage, and preserves case tags that select rubric branches.

## Ownership and cleanup

Fresh owned lanes: t36p Astra/high for recovery/collection, t36q Astra/high for audit/docs, t36r Fable/high for independent review, and t387 Astra/high for blind product review. No historical agent was adopted. The inherited tool terminal ID did not transfer ownership of old terminals.

The scheduled handoff receipt was inspected. Root removed only launchd job `org.kalepail.raven-playground-resume-20261108` and its exact plist, then verified absence (`resume-checkpoint/schedule-removal.json`).

All collectors and servers are stopped and removed. Author-owned route/effort/docs worktrees were removed after exact patch archives and no-unique-work checks. On November 9 t36p archived and byte-verified both restored frozen source trees, corpus copies and environment provenance, then removed them. Root `.dev.vars` and `node_modules` were unchanged; only the root worktree remains. Cleanup receipt SHA: `a967b6dcdc81c67aff2f2894eaed8881e3d0585a0a03187dd664c45cc989e3cd`.

## Release checkpoint

Candidate typecheck, 3,386 unit tests (three expected failures), build, 140 smoke tests and eval self-test passed. Independent Fable/high review and secret scans passed. Haiku production checks passed; the unchanged-primary check failed as recorded above. Source stayed unchanged through both runs. PR #399 passed CI and CodeQL. The owner authorized final judgment, Opus review, merge and cleanup. The named fallback-only exception is recorded in the result report; Opus approved with the stale TODO reconciled, then merge/deploy and retain post-deploy legacy `/mcp` verification with the release receipts. Use the existing SDF deployment profile/account and the normal clean-main preflight; no billing or gateway settings changes.
