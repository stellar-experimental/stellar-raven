# Explicit re-check of the register reopen fix (Grok) — 2026-08-29

Lane: read-only except this report. Path checked: `eval/qa/consistency-register.json`.

## 1. No `reopened` keys — PASS

Walked `clusters`, `numericInvariants`, and `dateContingentTraps`. Reopened-key count: 0. `cluster-018` keys are `id`, `label`, `lastChecked`, `memberContentSha256`, `members`, `note`, `reSwept`, `verdict`.

## 2. cluster-018 tension + sd-004/sd-042 — PASS

- `verdict`: `tension`
- `reSwept.date`: `2026-08-29`
- `reSwept.verdict`: `tension`
- `reSwept.reason` names `sd-004` (declined-upstream getTransactions hardcoded cap) and `sd-042` (Horizon lifecycle wording)

Tension set is `cluster-017`, `cluster-018`, `cluster-114`.

## 3. `npm run eval:qa:register` — PASS

Printed: `[register-helper] up to date; 0 reopened`

## 4. Lint — PASS

`node eval/qa/lint-corpus.mjs --since origin/main --stale` → `0 error(s), 60 warning(s)`.

## VERDICT: APPROVE
