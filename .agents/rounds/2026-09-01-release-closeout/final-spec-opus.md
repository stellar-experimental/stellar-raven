# Release spec review — Opus 5 high

Fixed point `9815785` → `823c3fc`. Read-only; no repository file changed.

## Independently reproduced

`eval:qa:compile` 500 cases sha `0393e7be…`; `eval:qa:register` up to date; `eval:qa:lint --since main --stale` 0 errors/62 warnings; `eval:selftest`; `eval:routing --gate` PASS; `eval:algolia-raven` PASS live (`sd-001` canary #1); `typecheck`; `npm test` 99/1588; `build`; `test:smoke` 4/82; `improvements:lint` 66; `improvements:probes` 6 recurring/0 inconclusive with the host credential; `secrets:scan` clean; generators reproduce byte-identically.

Artifacts: `2026-09-01T21-36-44-variantA.json` sha `d9b11729…`, plan sha `e1ad69bb…` — both match the ledger. `aggregatesSuppressed:false`, `costAccounting.complete:true`, $0.3764636 under the $1.50 cap, binary/environment/surface/revision pins matched before and after, `safeMode:false`, `mcpServers:[{raven,connected}]`, one `correct` row. Timeout artifact matches its recorded incomplete-cost reading. Pre-spend commit `1142971` carries the brief, both Fable reviews, and the second authorization; tree `dirty:false`. Golden, resolved receipts, four upstream refs, and production reads (CSP `sha256-J5utxnf3…`, `/health/skills` `checked:41`) all verified. Env-pin tests cover absent, mismatch, malformed, missing, duplicate, equals-form, and collection mode. No scope creep found.

## Findings

**F1 — Medium. Stack is stale; merge strategy is constrained.** Spec: "It reviews comments, validates the stack, merges it, deploys `main`, and cleans related Git state." PR #112's head is `0a933c2` ("docs: use consistent sample terminology"), which reconciles the sole Copilot comment on `eval/EVALS.md`. It is **not** an ancestor of `823c3fc`, so the validated tree still reads "disclosed membership check". Merge #112 → #113 → #114 as merge commits. A squash of #114 drops `0a933c2` and orphans `9074093`; deleting branches then breaks `resolved.json` `sls-080` `sourceUrl`. Fable recorded the same condition: "do not rewrite `9074093`".

**F2 — Low. Named final reviewer substituted.** Spec: "Reviewer: A later Grok 4.6 gate will review the final diff." The final-diff gate was Fable 5 high. AGENTS.md requires recording "why the matched lane was skipped"; no rationale is recorded. Independence still holds.

**F3 — Partial, by design.** Spec: "The final Opus review remains before merge." Merge, `main` deployment, and PR/branch/worktree cleanup (3 worktrees, 3 branches; 0 stashes) are unexecuted and gated on this review.

## Verdict

Work in the diff is complete, evidence-backed, and reproducible. Execute F1's merge order, then deploy and clean.

PASS
