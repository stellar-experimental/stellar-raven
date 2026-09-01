# Remaining-work adversarial audit brief

Date: 2026-09-01
Scope: read-only independent audit of the remaining `.agents/` queue
Orchestrator: Codex, GPT-5.6 Sol

## Purpose

Determine whether `.agents/NEXT.md` and `.agents/TODO.md` describe every remaining work block,
decision, evidence trigger, evaluation gate, and completion condition clearly enough for a new
agent or the owner to proceed without reconstructing prior rounds.

This audit does not authorize implementation, a paid evaluation, a live fetch, a production
change, a golden change, a routing attempt, or an upstream message.

## Required evidence

Read these files before reaching a verdict:

- `AGENTS.md`
- `.agents/README.md`
- `.agents/NEXT.md`
- `.agents/TODO.md`
- `.agents/skills/run-evals/SKILL.md`
- `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`
- `.agents/rounds/2026-08-29-paired-verdict.md`
- `.agents/rounds/2026-08-29-five-track-same-100.md`
- `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`
- `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md`, section 16
- `ideas/source-delivery-ranked-references.md`, sections 8 and 9
- `eval/EVALS.md`
- `eval/qa/README.md`, paired-verdict and current-results sections
- `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`

Inspect other repository files when needed to verify a claim. Do not use another auditor's report.

## Questions

1. Does the queue omit any active own-repo work, human decision, evaluation debt, or external block?
2. Does it incorrectly keep completed work active?
3. Does each block state its prerequisites, permitted actions, forbidden actions, and completion gate?
4. Does the Raven capability-boundary block define enough design constraints for the next plan?
5. Does it separate a focused diagnostic from a paid headline measurement correctly?
6. What evidence must exist before a stronger capability-boundary mechanism can ship?
7. Does the paired QA owner decision present the correct decision object and trade-offs?
8. What exact artifacts and reviews still block paired-method promotion?
9. Should protocol-history routing remain trigger-only after three failed attempts?
10. Are T1 through T4 sufficient, measurable, and resistant to post-hoc goal changes?
11. Are repository recovery, `sources.locate`, Friendbot, token-prefix, and upstream watches sequenced correctly?
12. Which tasks need human product judgment, human spend authorization, independent model review, or mechanical checks?
13. Which statements rely on stale, mixed-tuple, local-only, or otherwise weak evidence?
14. What block-by-block plan would make progress measurable without reopening spent work accidentally?
15. Which exact `.agents/` edits would remove ambiguity or prevent an invalid future run?

## Review rules

- Treat judge verdicts as evidence, not truth.
- Preserve the one-headline and two-gate evaluation contract.
- Do not recommend per-question tuning.
- Do not weaken a frozen contract merely because a mechanism failed.
- Separate owner decisions from automatic evidence triggers.
- Separate an independently reviewed plan from paid-run authorization.
- Treat prior method-specific authorizations as spent.
- Do not convert monitor-only evidence into a fix without the recorded action threshold.
- Prefer the least expensive evidence that can settle a decision.
- Name contradictions and missing definitions precisely.

## Required report format

1. Runtime: model, provider or CLI, requested effort, and observed effort or variant.
2. Verdict: `PASS`, `PASS-WITH-FIXES`, or `BLOCK`.
3. Findings: severity, source paths, exact problem, consequence, and required repair.
4. Human decisions: exact question, options, evidence needed, and safe default.
5. Evaluation ladder: ordered stages, entry gate, instrument, exit gate, and authorization boundary.
6. Block map: actionable, owner-blocked, evidence-triggered, upstream-blocked, and complete.
7. Suggested `.agents/` edits: file, section, and replacement substance.
8. Residual uncertainty: facts the available evidence cannot settle.

Write only your assigned report file. Reply with only its repository-relative path.
