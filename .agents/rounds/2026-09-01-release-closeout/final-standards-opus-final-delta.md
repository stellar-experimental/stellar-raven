# Final bounded delta review — Opus 5 high

Scope: the current uncommitted delta in `/private/tmp/stellar-raven-release`
(5 modified source/doc files, 2 modified ledgers, 3 untracked reports) over
`823c3fc`. Read-only; no repository file changed.

## Blockers

None.

## The five items from `/tmp/release-standards-opus-delta.md`

**1. Spec F2 route rationale — fixed.** Both ledgers now carry it.
`2026-09-01-free-improvements-maintenance.md:33` records the actual reviewer plus
a route note; `2026-09-01-release-closeout.md` adds "Grok was not selected because
Opus better matched the precision-review lane" and "The completed Fable and Grok
reviews already supplied vendor-diverse assumption checks." I checked that second
claim rather than accepting it: `grok-sls080-review.md` and
`remaining-work-adversarial-audit/audit-grok.md` are both in the release diff, so
it is accurate. Under AGENTS.md the matched lane (Sol, dense implementation) was
the author, so Opus high as last resort is the sanctioned path. The maintenance
ledger's line changed from plan tense to outcome tense, but the closeout ledger
still records that the draft named Grok, so the provenance survives.

**2. Binary pin — fixed.** `run-qa.mjs:1411` now calls
`parseRequiredFlagValue(args, "--expect-agent-binary-sha256")` instead of `argVal`.
Two new controls cover it (`qa-harness-preconditions.test.mjs:551-552`): duplicate
and equals form, each asserting a non-zero exit and an empty paid-call log. The
absent case now reports "requires ... for every paid run" instead of the old
"must be a 64-character lowercase SHA-256"; the direct unit test at line 374 calls
`assertExpectedExecutable` and is unaffected. Argument order still runs
`executableIdentity("claude")` before the flag check, so a bad pin spawns
`claude --version` first — free, not paid, and unchanged behavior.

**3. Untracked reports — still open.** Now three files
(`final-standards-opus.md`, `final-spec-opus.md`, `final-standards-opus-delta.md`;
the last is byte-identical to `/tmp/release-standards-opus-delta.md`). They must
enter a commit before the merge, per this round's clean-tree rule. The ledger
sequences that after this review, so it is a pending action, not a defect.

**4. Monitor wording — fixed and verified.** `improvements/README.md:154` now reads
"The `sd-001` canary reports drift, while the load-bearing `sd-006` rule canary
fails on drift." Confirmed against code: `check-algolia-rule-canary.mjs:124` sets
`process.exitCode = 1` on a failed assertion, and `eval-algolia-raven.mjs` has no
rank-based exit path. `npm run improvements:lint` exits 0 (66 findings).

**5. Unused `label` option — neither fixed nor accepted.** `parseRequiredBudgetFlag`
still takes `{ label = "run-qa" }`, and `parseRequiredFlagValue` now takes it too,
but no caller passes one. Lowest severity, pre-existing, and harmless.

## Narrow checks run

- `npx vitest run` over the three changed test files: 3 files, **81 tests passed**
  — matches the ledger's "81 tests across three files" exactly.
- `npm test`: 99 files, **1591 tests passed**.
- `npm run improvements:lint`: exit 0, 66 findings.

## Other non-blocking observations

1. **Ledger pin count is ambiguous.** "All three paid-run identity and budget pins
   now require exactly one positional value" is true of the budget, environment,
   and binary flags, but the same brief's pin list names **five** (adding the server
   revision and the MCP surface). `--server-revision` and `--expect-sha256` still use
   `argVal` (`run-qa.mjs:1478`, `:1515`), so `--flag=value` reads as absent and a
   duplicate silently takes the first. Both still refuse to collect
   (`mcp-surface.mjs:116`, `run-qa.mjs:517`), so nothing unsafe ships. Either name
   the three flags explicitly or route all five.

2. **A second paid runner still has the old weakness.**
   `eval/discovery/run-agent-discovery.mjs:294` pins the binary through its own
   `argValue` and has no budget or environment pin at all, though it spends
   (`costUsd` at `:212`). Pre-existing and outside this release diff; worth a
   `.agents/TODO.md` line rather than scope creep here.

3. **Release-baseline count is now stale.** The ledger's "Release baseline" records
   `npm test` at 99 files / 1,588 tests, taken before this delta added three tests.
   My re-run gives 1591. Refresh that line so the release evidence matches the
   merged tree.

4. **Doc gap.** `eval/qa/README.md:181-190` still attributes the "absent, duplicate,
   missing, malformed, mismatched, or equals-form" rejection to the environment flag
   alone. It now applies to the budget and binary flags too.

PASS
