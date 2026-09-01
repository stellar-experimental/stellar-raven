# Release standards review — `main...823c3fc`

Scope: 9 commits, 59 files. Read the release ledger
`.agents/rounds/2026-09-01-release-closeout.md`, both local QA artifacts, and the four
`2026-09-01-release-closeout/` reviews.

## Documented-standard breaches

None found. Checks that passed: forward-only; manifest untouched; no secret or `solo://`
live path added; ledger routing per `.agents/README.md`; reviewer lane and effort recorded
per AGENTS.md "Model routing"; retirement receipts carry `liveRecheck`, `reviewEvidence`,
`sourceCommit`, and intake removal per `improvements-pipeline` step 6. The golden's dropped
Solo provenance is sanctioned by `golden-truth/SKILL.md:173` ("LATEST verification event
only"). Ledger claims verified against artifacts: both SHA-256 values, `$0.3764636` cost
split, `matches: true` pins, and the honest timeout record all reconcile.

**Outstanding gate (declared, not hidden):** the ledger's own "final Opus review remains
before merge" is not yet reconciled in-tree.

## Judgment-only smells

**Duplicated Code** — `eval/qa/run-qa.mjs:244` clones `parseRequiredBudgetFlag:231`
line-for-line:
`const indexes = args.map((arg, index) => arg === flag ? index : -1).filter((index) => index !== -1);`
plus both count guards and the `value.startsWith("--")` check. Extract
`parseRequiredFlagValue(args, flag, {absentMessage})`. The `=<value>` guard then stops
being asymmetric — `--max-budget-usd=1` still reports as absent.

**Duplicated Code** — `scripts/eval-algolia-raven.mjs:274` adds a second rank-monitor
engine (`monitorOnly` + `expectedPrimaryRulesRank`) beside
`scripts/lib/algolia-rule-canary.mjs:52`, whose own comment says "new rule guards [are]
data additions, not new query-specific branches." The new invariant (rank stable rules-on
*and* off) should be data in that engine. It also has no enforcing runner like
`check-algolia-rule-canary.mjs`, so the sd-001 canary can never fail; `improvements/README.md:153`
implies parity with sd-006's.

**Speculative Generality** — the same hunk orphans `expectTextIncludesAll`. After
`- expectTextIncludesAll: ["state", "archival", "Whisk"]`, no real case uses it;
`rankExpected:210` and the `text-all(...)` label at :232 survive only for the synthetic
`const textAll = {...}` at :341.

**Shotgun Surgery** — the 499→500 denominator prose is triplicated
(`eval/qa/README.md:635`, `eval/EVALS.md:39`, `run-evals/SKILL.md:408`). Two lagged four
days behind the corpus. Keep it in one generated file.

**Behavior change, unremarked** — `eval/lib/executable-identity.mjs:58` drops
`.toLowerCase()` from `expectedSha256.trim().toLowerCase()`. Uppercase pins now throw
instead of normalizing. No test covers it.

PASS
