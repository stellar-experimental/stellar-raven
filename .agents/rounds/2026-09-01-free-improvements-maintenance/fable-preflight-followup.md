# Preflight follow-up — Fable

- Round: `.agents/rounds/2026-09-01-free-improvements-maintenance.md`.
- Reviewer: Claude Fable 5.1, effort high. Same reviewer as `fable-preflight-review.md`.
- Scope: reconciliation of F1 through F8, the new `summarize` self-tests, and the durable
  `sls-074` and `sd-047` evidence. Read-only. Writes: this file only.

## Verdict

**REMAINING FINDINGS: two, both low.** F1, F2, F3, F5, F6, F7, and F8 are reconciled with
evidence. F4 is unchanged and one ledger validation line is now stale.

## Reconciliation table

| finding | state | evidence |
|---|---|---|
| F1 README truth | reconciled | `improvements/README.md:141` now reads `` `sd-006` is a resolved precedent, and `sd-001` is fixed pending retirement ``; lines 153-154 read `` The `sd-001` crawler fix and the resolved `sd-006` precedent retain separate monitor-only canaries ``; `scripts/eval-algolia-raven.mjs:28` note no longer says `resolved` |
| F2 `sls-074` ledger row | reconciled | row now says `resolved record` and points to a new `Orchestrator recheck for resolved sls-074` section with `generatedAt` stamps `2026-09-01T18:31:09.456Z` and `…09.827Z`; this review re-ran the same two calls (below) and observed the same behavior |
| F3 `sd-048` owner-facing prose | reconciled | `rg 'sd-036\|canonical-source\|successor'` over the finding returns nothing; the third paragraph now reads `Pull request #1996 corrected the field selector and left this interface text unchanged.`; no GitHub URL was added to `evidence`, so lint still permits `proposed` |
| F4 `sd-048` status note | not addressed | `status: proposed` stands, which was allowed; the ledger still lacks the note that the `verified` evidence bar is already met (`rg 'evidence bar'` over the ledger returns nothing). See R2 |
| F5 canary control and self-tests | reconciled | `monitorExpectationMet` now requires `primaryRulesBest` and `primaryNoRulesBest` both equal `expectedPrimaryRulesRank`; the drift message prints both observed ranks; self-test adds `text-all` (2 assertions) and three `summarize` cases: met, `rules=#1, no-rules=#2`, and `rules=miss, no-rules=miss`; `--self-test` prints `ok (14 controls)` |
| F6 `sls-080` duplicate and stale phrase | reconciled | `generatedAt 2026-09-01T18:23:41.351Z` now appears once (the recurrence); the evidence bullet was removed; the recurrence ends with `independent review deferred retirement pending lifecycle cleanup in …/grok-sls080-review.md` |
| F7 `sd-047` recurrence provenance | reconciled | recurrence names the command, repo HEAD `83c68f21c721905327f5db12fb84702e3a48367c`, and blobs `37f87980…` and `06c92f8d…`; verified below |
| F8 review lane recorded | reconciled | route card `Safe pre-resolution review` names Fable 5, high, pane `w1H:p6`, fallback Opus 5 high; `Reviewer outcomes` records the preflight result |

## Independent verification

| check | result |
|---|---|
| `node scripts/eval-algolia-raven.mjs --self-test` | `Algolia semantic matcher self-test ok (14 controls)` |
| `npm run improvements:lint` | `improvements lint ok (70 findings)` |
| `git diff --check` | clean |
| `node scripts/eval-algolia-raven.mjs` (read-only) | canary row: rules `#1`, no-rules `#1`; recommendation `Monitor only: the target remains at expected rank #1 with rules enabled and disabled.` |
| `gh api repos/stellar/stellar-docs/commits/HEAD` | `83c68f21c721905327f5db12fb84702e3a48367c`, committed 2026-09-01T14:59:54Z; matches the recurrence |
| `contents/docs/validators/README.mdx?ref=83c68f21` `.sha` | `37f879807c150e794578e80d2e751597938f8423`; matches |
| `contents/docs/learn/fundamentals/stellar-stack.mdx?ref=83c68f21` `.sha` | `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713`; matches |
| `scout.searchResearch({ q: "V-SOR-APP-VUL-003", source: "audit", limit: 2 })` via `http://localhost:8787/mcp` | `ok`, `meta.exactMiss` absent, first section `V-SOR-APP-VUL-003:`, `generatedAt 2026-09-01T18:56:31.779Z` |
| `scout.searchResearch({ q: "V-SOR-APP-VUL-999", source: "audit", limit: 2 })` | `ok`, `meta.exactMiss.identifiers = ["V-SOR-APP-VUL-999"]`, `generatedAt 2026-09-01T18:56:33.230Z` |

The `summarize` self-tests exercise the real function with synthetic `results` rows for the
`sd-001` case. The `null` case confirms a miss on both controls reports drift. The `(1, 2)` case
confirms a rules-only rank 1 is not accepted. This matches the crawler-fix invariant.

## Remaining findings

### R1 — Low — the ledger validation line for the self-test is stale

- File: `.agents/rounds/2026-09-01-free-improvements-maintenance.md` line 116.
- Text: `` `node scripts/eval-algolia-raven.mjs --self-test`: PASS; 9 controls. ``
- Evidence: the script now prints `ok (14 controls)` after the F5 additions.
- Smallest fix: change `9 controls` to `14 controls`, or re-run and record the new line.

### R2 — Low — F4 remains a silent choice

- File: ledger `Remaining gated actions` item 5.
- Text: `` Keep `sd-048` proposed until an authorized filing lane reviews and files it. ``
- Evidence: the finding records pinned commits, read-only commands, and two independent
  executions. The skill's `verified` bar is met. Nothing in the ledger says so, so the filing lane
  may repeat the source reads or treat the record as unproven.
- Smallest fix: append to item 5: `The verified evidence bar is already met; the filing lane
  reviews prose and owner, not the source facts.` Keeping `proposed` remains acceptable.

## No new findings

- `sd-048` mention of `#1996` is plain text, not a URL, so the lint evidence rule does not fire.
- The `sls-074` recheck section describes the call in prose with both stamps. This review
  reproduced it, so the description is sufficient for a stranger.
- `INDEX.md` still matches the generator; the `sls-080` recurrence count of 3 is unchanged and
  matches the mandated `TODO.md` recording rule.
