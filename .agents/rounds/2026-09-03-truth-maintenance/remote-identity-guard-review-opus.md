# Remote identity guard review

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort

Author lane: Codex GPT-5.6 Sol, high effort

Commits reviewed: `2ca588080c4ae9097aff66f79ff1a2dcc20126b5`, then the repairs
`8cd724de76858a0c9d6fa0908964f3c119ed52aa`,
`5d47ab6900af6aa14d65d271879c9340f5b6bf3c`, and
`f2e2d10770385315358378748d65de2c20fac6b9`

Branch: `codex/tm-remote-identity-guard`

Worktree: `/private/tmp/stellar-raven-tm-remote-guard`

## Current verdict

`PASS` for the postflight commit `f2e2d10`.

`8cd724d` reconciled every blocker and finding from the first pass.
`5d47ab6` closed R2, R3, and R5 from the first re-review.
`f2e2d10` closes N3 and N4 from the second re-review.
I re-derived each result rather than accepting the author's tables.

The guard implementation is complete. No code finding remains open.

Two operational items stay open, and neither is a code defect.
R1 is the Scout release cadence, which the owner must still decide about.
R4 is the 1,000-record Stellar Docs enumeration ceiling.

The four sections below run in commit order.

## First-pass verdict (commit `2ca5880`)

`CHANGES-REQUIRED`

The guard logic is correct. I verified every rejection path myself.
The commit does not yet deliver a usable paid-measurement control.
Three blockers remain. Seven further findings need repair before a paid arm.

## Method

I read the diff before the author report.
I read `AGENTS.md`, the run-evals skill, and the stop audit.
I read the full collection loop, the spend ledger, and the judge path.
I then wrote adversarial probes and a temporary test file.
I deleted every temporary file. The tree is clean.

The stop audit lives only in the root checkout.
This branch does not carry `post-candidate-stop-audit-sol.md`.
I read the root copy and edited nothing there.

## Commands

| Command | Result |
|---|---|
| `npx vitest run test/qa-remote-identity-guard.test.mjs test/qa-paired-verdict.test.mjs test/qa-harness-preconditions.test.mjs` | PASS, 149 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 104 files, 1,786 tests |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `npm run secrets:scan -- --tree` | PASS, no leaks |

I ran no paid command. I started no QA collection.
I made no answering-agent call and no judge call.

## What the commit gets right

I confirmed each item below by reading code or by running a probe.

The vector carries the exact six fields the stop audit demands.
`exactKeys` rejects any extra field. It therefore rejects timestamps.
`parseRemoteIdentityVector` normalizes field order before hashing.
The comparison is byte-exact per service.

The runner captures one vector before each answering call.
It captures a second vector after that call.
Each before-vector must equal the baseline vector.
Each after-vector must equal its paired before-vector.
The chain makes all captures equal across the whole arm.

Every paid call has a comparison immediately before it.
The judge for row N runs after the after-comparison for row N.
`run-qa.mjs:1807` skips the judge when `stopError` is set.
The attempt loop breaks, so no retry starts.

The spend-ledger order is correct.
`authorizeSpend` reserves nothing and writes no ledger entry.
An early guard stop therefore leaves no dangling authorization.
The runner records the spend before the after-probe runs.
A paid call that completes always reaches the ledger.

The stop preserves partial work.
Completed rows stay in `rows`. Later IDs land in `meta.unattemptedIds`.
`applyCollectionComparability` sets `comparable: false`.
It clears `summary` and `metrics`.
`meta.aggregatesSuppressed` becomes `true`.

Resume is blocked. `assertActive` closes the guard instance.
`judgeStoredResults` refuses a non-comparable artifact at `run-qa.mjs:1179`.

The probe pin is re-checked before every capture.
I replaced the probe bytes after pinning. The next capture failed closed.

The paired printer is strict. I mutated eight guard fields on a candidate.
Every mutation produced `remote-identity-guard` and `INDETERMINATE`.
The mutations covered a missing record, `matches: false`, a present failure,
a probe hash mismatch, an allowed resume, a short capture count, a low call
count, and a drifted final vector.
A pre-guard artifact therefore cannot enter a pair.

`collectionTuple` compares `probeSha256` and `baselineVector` across arms.
Both arms must share one probe and one remote identity.

## Blockers

### B1. The repository commits no production-ready probe executable

`eval/qa/run-qa.mjs:1629` requires `--remote-identity-probe`.
No probe exists in the tree. `git ls-files` finds none.
The guard therefore cannot run today.

The probe holds every load-bearing measurement rule.
`eval/qa/README.md` states those rules in prose only.
The prose asks the probe to sort object keys recursively.
It asks the probe to sort set-like arrays before hashing.
It asks the probe to omit volatile telemetry.
No code implements those rules. No test checks them.

Two operators will produce two different `canonicalOpenapiSha256` values.
The stop audit requires three pre-arm probes at least five minutes apart.
It requires all three vectors to match exactly.
No committed command performs that check.

**A committed production-ready probe executable is required.**
The stop audit gates a new authorization on a landed, tested guard.
A guard whose measurement definition lives outside the repository is not landed.
The probe must ship with its own tests and its own canonicalization code.

### B2. The probe inherits the full parent environment

`eval/qa/remote-identity-guard.mjs:126` calls `spawnSync` with no `env` option.
The child therefore receives every parent variable.
I verified this. A test probe printed a secret I set in the parent shell.

The QA shell holds Claude credentials and repository secrets.
An unreviewed operator script would receive all of them.
It would receive them about 1,000 times in a 500-case arm.
`AGENTS.md` requires secrets to stay host-side.

The probe also runs outside the spend ledger.
`meta.budget` has no line for probe cost.
A probe that called a paid endpoint would spend invisibly.
The documents forbid paid probe calls. Nothing enforces that rule.

Pass an explicit minimal `env` allowlist to `spawnSync`.
Commit the probe so a reviewer can confirm it makes free calls only.

### B3. The remote guard has no postflight capture

The local guard rechecks its identity after collection.
`run-qa.mjs:1909`, `:1919`, and `:1941` recompute the listener, adapter, and source.
`run-qa.mjs:1943` only reads the remote record. It captures nothing.

The last remote capture happens before the last row's judge calls.
The stop audit requires the vector to stay unchanged through both postflights.
An upstream change during final judging or postflight stays invisible.

Add a postflight capture. Compare it against the baseline vector.
Record it in `meta.remoteIdentityGuard`. Feed a mismatch into `comparabilityReasons`.

## Further findings

### F4. The runner cannot pin the pre-arm vector

The stop audit requires three matching pre-arm vectors.
The runner never compares its baseline against that result.
It accepts whatever the first capture returns.

Add `--expect-remote-identity-sha256` as a required collection pair.
Fail closed when the baseline vector hash differs.
This makes pre-arm criteria 5 through 7 machine-enforced.

### F5. The after-capture masks the primary error

`remote-identity-guard.mjs:300` calls `guard.afterCall` inside `finally`.
A throw there replaces the error from the paid call.
I verified this. A `BUDGET-EXHAUSTED-PRIMARY-CAUSE` error disappeared.
The surfaced error carried no `cause`.

This breaks the incomplete-ID accounting.
`run-qa.mjs:1874` adds a row to `incompleteIds` only for budget error types.
A budget stop that coincides with a guard stop loses that classification.
The artifact then reports a budget-stopped row as complete.

Attach the primary error as `cause`. Re-throw the primary error first.

### F6. `completedAnsweringCalls` counts calls that never completed

`remote-identity-guard.mjs:243` increments the counter before the after-capture.
`afterCall` runs from `finally`, so a thrown paid call also increments it.
I verified this. A call that threw still reported one completed call.
That call recorded no spend and produced no row.

The paired invariant still holds, because the count only grows.
The field name still overstates what it measures.
Increment the counter only after a paid call returns a result.

### F7. The paired guard gate has no committed test

`paired-verdict.mjs:252` emits the `remote-identity-guard` reason.
No committed test asserts that reason code.
The one new paired test mutates both vectors together.
It therefore trips `measurement-tuple` instead.

I proved the eight rejection paths by hand.
The logic is correct today. A regression would pass CI silently.
Add table-driven tests for the eight mutations I listed above.

### F8. The real probe path is almost untested

One committed test exercises `captureRemoteIdentity`. It covers invalid JSON only.
Every other path uses an injected `capture` function and a fake probe identity.

I verified these paths by hand. All fail closed:
a tampered probe, exit status 3, a 300 ms timeout, a 2 MB stdout overflow,
a missing file, and a directory path.
A valid end-to-end capture has no test at all.

Add tests for each path. Include one happy path through the real `spawnSync`.

### F9. Probe failures give the operator no diagnostic

Three distinct faults collapse into one message.
A timeout, a non-zero exit, and a buffer overflow all say
"remote identity probe did not complete successfully".
A missing file and a directory both say "probe executable is unavailable".

A stopped arm may have consumed $190 or more.
The operator gets no exit status, no signal, and no path.
Report `result.status`, `result.signal`, and a timeout flag.
Those values carry no secret.

### F10. A transient upstream fault ends a paid arm permanently

The timeout defaults to 60 seconds. No CLI flag changes it.
The guard performs no retry, which the stop audit demands.
One network blip in any of three services stops the arm.
No resume is possible under the same authorization.

The stop behavior is correct and required. The risk is still severe.
The probe must therefore own bounded internal retries.
It must emit one vector only after it reaches all three services.
This keeps the guard fail-closed and survives a blip.
This is a further reason to commit and review the probe.

### F11. The artifact stores an absolute local path

`remote-identity-guard.mjs:268` copies `probeIdentity` into the record.
That object holds `resolvedPath`.
Result files are gitignored, but reviewers attach them to round notes.
Store the probe hash only, or store a repository-relative path.

### F12. `eval/EVALS.md` is not updated

The stop audit lists `eval/EVALS.md` in its required updates.
It must define remote-service stability as part of comparability.
It must explain that listener stability alone is insufficient.
The commit updates `eval/qa/README.md` and the run-evals skill only.
`eval/EVALS.md` contains no remote identity text.

## Pre-existing observations

`judgeStoredResults` tests `meta?.comparable === false` at `run-qa.mjs:1179`.
An artifact with an absent `comparable` field would pass.
The runner always writes the field, so no live artifact is affected.
A `!== true` test would be safer.

`--judge-stored` does not require the probe pins.
The judge never uses MCP. `buildJudgeArgs` passes `--strict-mcp-config` with no servers.
A judge verdict therefore does not depend on remote identity.
I accept this narrowing. The comparability gate already blocks a stopped artifact.

## Risks

An operator can satisfy every committed gate with a wrong probe.
The runner checks the probe bytes, not the probe meaning.
A probe that hashed a volatile field would stop a healthy arm.
A probe that hashed too little would pass a mixed-upstream arm.
Only a committed, reviewed probe removes this risk.

The guard adds about 1,000 probe runs per 500-case arm.
Each run re-hashes the probe file and spawns a process.
The operator must budget that wall-clock cost.

The `captures` array grows to about 1,000 entries per arm.
Each entry holds a phase, an ID, an attempt, and a hash.
The artifact grows by roughly 120 KB. This is acceptable.

## Blockers for the next paid authorization

1. Commit a production-ready probe executable with tests (B1).
2. Restrict the probe environment and prove the probe makes free calls only (B2).
3. Add a postflight remote capture and feed it into comparability (B3).
4. Pin the pre-arm vector with a required flag (F4).
5. Repair the error masking and the call counter (F5, F6).
6. Add the missing paired and probe tests (F7, F8).
7. Improve probe diagnostics and probe-side retries (F9, F10).
8. Update `eval/EVALS.md` (F12).

The stop audit keeps the baseline arm stopped for other reasons too.
The Scout `1.9.30` drift decision is still open.
The full candidate row review is still incomplete.
This review does not lift either block.

## Definition-of-done check

| Item | Result |
|---|---|
| Diff scoped, unrelated work preserved | PASS |
| Proportionate tests pass | PASS, with the gaps in F7 and F8 |
| Required gates pass | PASS |
| Generated artifacts from scripts | PASS, none changed |
| Secrets scanning | PASS |
| Independent review completed | This document |
| Documentation matches behavior | FAIL, see F12 |

---

# Repair re-review

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort

Commit re-reviewed: `8cd724de76858a0c9d6fa0908964f3c119ed52aa`

Verdict: `PASS`

I made no implementation edit. I only re-read, re-ran, and measured.

## Commands

| Command | Result |
|---|---|
| `npx vitest run` on the four touched test files | PASS, 173 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 105 files, 1,810 tests |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `env -i PATH="$PATH" ./eval/qa/probe-remote-identities.mjs` | PASS, valid vector |
| The same probe seven times over about 30 minutes | one identical hash every time |
| Ten extra paired-gate mutations in a scratch test | all rejected |
| Direct Algolia settings and multi-query reads | measured, see below |
| `git ls-files -s` on the probe | mode `100755` |

I started no QA collection. I made no paid model call. I wrote to no upstream service.

## Blocker reconciliation

### B1 — committed production-ready probe: RECONCILED

`eval/qa/probe-remote-identities.mjs` is committed with mode `100755` and a
`#!/usr/bin/env node` line, so `spawnSync` can execute it directly.

I ran it. It returned the exact vector the implementation report records:

- Scout `1.9.30`, OpenAPI hash `2acc43c4…0311571`
- Lumenloop `openapi-1.0.0`, inventory hash `a588bf48…796a404c`
- Docs settings hash `ca09d2a9…d43de623c`, title hash `aecaf9a5…beb9b209`
- vector hash `afd993854a981d4a5a3026ad047347c7a62a1b731b887ec08d48d5b9e07bbc7f`

The canonicalization now lives in code, not prose.
`canonicalizeRemoteSource` sorts object keys recursively and keeps array order.
Set-like arrays are sorted explicitly: Docs titles by path then title, and
Lumenloop tools, workflows, and skills by name.
Seven runs across about 30 minutes produced one identical hash, so nothing flaps.

`captureStablePreArmIdentity` implements the stop audit's pre-arm criteria 5 to 7.
It takes three captures at five-minute intervals and fails on any difference.
`--stable-sha256` exposes it, and the skill documents it.

### B2 — probe environment isolation: RECONCILED

`captureRemoteIdentity` now passes `env: { PATH: process.env.PATH ?? "" }`.

I set `FAKE_SECRET` and `ANTHROPIC_API_KEY` in the parent and dumped the child
environment. The child received only `PATH`. Neither secret appeared.

The committed probe uses public sources only. I verified the one credential it
carries. `VNSJF5AWIZ` and `c932e7670879e29070e269d202fb6740` both ship inside the
public docs bundle `https://developers.stellar.org/assets/js/main.6326a0cd.js`.
That is the public search-only DocSearch key, not an operator Algolia credential.
It is therefore safe to commit and does not touch the AGENTS.md operator-key rule.

The probe performs reads only. It cannot write to any index.

### B3 — postflight capture: RECONCILED

`guard.postflight()` captures once after the local postflight and compares it to
the baseline. `run-qa.mjs` records `remoteIdentityPostflightError` and feeds a
failure into `comparabilityReasons`.

The paired printer now requires `postflight.attempted === true` and
`postflight.matches === true`. It also requires the last capture to carry the
`postflight` phase at the final sequence number.

## Finding reconciliation

### F4 — pre-arm vector pin: RECONCILED

`--expect-remote-identity-sha256` is now required for collection.
`createRemoteIdentityGuard` refuses a malformed value.
The first `beforeCall` compares the baseline hash to the pin and stops on a mismatch.
The paired printer requires `expectedBaselineVectorSha256` to equal the recomputed
baseline hash, so the pin travels into the artifact and across both arms.

### F5 — primary paid-call error preserved: RECONCILED

The wrapper no longer runs `afterCall` from `finally`.
I threw `BUDGET-PRIMARY-CAUSE` from the paid call while forcing an identity change.
The surfaced error was `BUDGET-PRIMARY-CAUSE`, with the guard error as `cause`.
The budget classification at `run-qa.mjs:1874` therefore survives.

### F6 — completed-call accounting: RECONCILED

`afterCall(context, { completed })` increments only when the paid call returned.
My thrown-call test recorded `completedAnsweringCalls: 0` with two captures.
The paired invariant moved to `completedAnsweringCalls * 2 + 1` for the postflight.

### F7 — paired gate tests: RECONCILED

The commit adds table-driven tests for all eight mutations I named.
Each asserts the `remote-identity-guard` reason code, not just `INDETERMINATE`.

I added ten further mutations in a scratch test and deleted it.
All ten were rejected: postflight not attempted, postflight not matching,
postflight hash differing, a wrong final phase, non-alternating phases, a drifted
mid-run capture hash, both pin fields, a renumbered sequence, and a `2N` record
with no postflight entry.

### F8 — real probe path tests: RECONCILED

`test/qa-remote-identity-probe.test.mjs` is new and covers real spawns.
I independently reproduced fail-closed behavior for a tampered binary, exit
status 3, a 300 ms timeout, invalid JSON, an invalid vector, a missing file, a
non-executable file, and a directory.

### F9 — probe diagnostics: RECONCILED

`RemoteIdentityProbeError` carries `kind`, `path`, `status`, `signal`, and `timedOut`.
I observed seven distinct kinds: `nonzero-exit` with status 3, `timeout` with
`SIGTERM` and `timedOut: true`, `invalid-json`, `invalid-vector`, `hash-mismatch`,
`not-executable`, and `not-file`.
No message carried stdout or stderr.

### F10 — bounded probe retries: RECONCILED, with one bound mismatch

Each source gets a 20-second timeout and two retries at 250 ms and 1,000 ms.
Retries fire on timeout, network error, 408, 425, 429, and 5xx. Other errors fail fast.

See finding R3 below. The retry budget slightly exceeds the harness timeout.

### F11 — no absolute path in artifacts: RECONCILED

`publicProbeRecord` emits `path`, not `resolvedPath`.
My record dump contained `eval/qa/probe-remote-identities.mjs` and no absolute path.
An out-of-repo probe falls back to the basename, which also leaks no directory.

### F12 — `eval/EVALS.md`: RECONCILED

Item 11 states that a stable listener does not prove remote identity.
It names the pinned probe, the pinned pre-arm vector, the per-call captures, and
the postflight, and it states the aggregate-suppression consequence.

### Pre-existing observation: RECONCILED

`judgeStoredResults` now tests `meta.comparable === true` instead of `!== false`.
An artifact with an absent field no longer passes.

## New findings from the repair

These are new observations, not regressions. None blocks the commit.

### R1 — Scout's release cadence probably prevents a valid pair

This answers the drift question directly. The probe induces no drift itself.
It performs reads only, and seven runs gave one identical hash.
The drift risk is external, and Scout dominates it.

The repository has recorded Scout at `1.9.0`, `1.9.1`, `1.9.8`, `1.9.13`, `1.9.14`,
`1.9.15`, `1.9.16`, `1.9.23`, and `1.9.30`.
The stopped candidate arm alone spanned `1.9.23` to `1.9.30` in about ten hours.
That is roughly seven releases inside one arm.

The vector hashes the complete Scout OpenAPI document, so any release stops the arm.
A paired run needs two arms of about eleven hours inside one identity window.
The stop audit also requires the intermediate review to sit inside that window.
The pair therefore needs more than twenty-two hours of Scout stability.

The guard is correct. It converts a silent invalid measurement into a loud stop.
The consequence is that the current 500-case paired design may never complete.
The owner should settle this before spending the next authorization.
I do not prescribe a code change, because the vector content is the audit's own contract.

For comparison, `stellar/stellar-docs` had 29 commits over 30 days on twelve days.
Only a page add, removal, or `lvl1` retitle moves the Docs title hash, so Docs is
a far smaller risk than Scout.

### R2 — Algolia load lands on the public shared DocSearch key

The volume is real but the wall-clock cost is not a problem.

I measured one capture at about 0.36 seconds. A 500-case arm makes 1,001 captures,
so the guard adds roughly six minutes per arm. That is cheap.

The request count is the concern. Each capture makes six HTTP requests:

| Host | Requests per arm |
|---|---|
| `stellarlight.xyz` | 1,001 |
| `api.lumenloop.com` | 3,003 |
| `VNSJF5AWIZ-dsn.algolia.net` | 2,002 |

The Algolia figure understates the billed cost. The title request is one
multiple-query POST that carries ten sub-queries, and Algolia counts each
sub-query as one search operation.
One arm therefore issues about 10,010 Algolia search operations plus 1,001
settings reads. A pair issues about 20,020 search operations.

That load lands on the same public key that serves the real developers.stellar.org
search box. AGENTS.md asks for shared-corpus caution on exactly this surface.

Three of the ten sub-queries are always wasted. I measured the live index at
`nbHits: 650` across `nbPages: 7`, because the public key clamps `hitsPerPage`
to 100 rather than the requested 1,000.
Sizing the batch to the real page count would remove about 3,003 search
operations per arm at no loss of coverage.

A 429 is the failure this makes plausible, and the current retry handles it poorly.
See R3.

### R3 — the retry budget slightly exceeds the harness timeout, and ignores `Retry-After`

`captureRemoteIdentity` uses a 60-second `spawnSync` timeout, and `run-qa.mjs`
passes no override.
The probe's worst case per source is three 20-second attempts plus 250 ms and
1,000 ms of delay, which is 61.25 seconds.

The outer kill therefore truncates the third attempt by 1.25 seconds whenever two
attempts time out in full. That is the exact case F10 exists to survive.
The effect is small, but the two bounds should not disagree.

The retry delays are also fixed at 250 ms and 1,000 ms with no jitter, and the
probe does not read `Retry-After`.
Against a 429 the three attempts finish inside 1.25 seconds and then stop the arm.
Given R2's volume, a rate-limit response is the most likely transient failure, and
it is the one the current backoff handles worst.

### R4 — the Docs title enumeration has a 1,000-record ceiling

The probe requests ten pages and rejects a page count above ten.
The live index reports `paginationLimitedTo: 1000`, and the public key clamps
`hitsPerPage` to 100, so ten pages is exactly 1,000 records.

The current title set holds 650 records, which is 65 percent of that ceiling.
When Stellar Docs passes 1,000 `lvl1` records the probe will throw and block every
paid arm. Raising the page count will not help, because Algolia's own
`paginationLimitedTo` sets the same limit.
A different enumeration strategy would be needed at that point.
The failure is loud and fail-closed, so this is a scheduling risk, not a safety risk.

### R5 — one comparability reason string is wrong for the new failure kind

`run-qa.mjs` maps any non-`identity-changed` guard failure to the string
`remote identity probe unavailable`.
The new `pre-arm-vector-mismatch` reason therefore reports a probe failure that
did not happen.

A stopped guard also makes `postflight()` throw `already stopped`, so the artifact
gains a second reason line that names neither the pre-arm mismatch nor the probe.

The artifact stays correctly non-comparable, and
`meta.remoteIdentityGuard.failure.reason` records the truth.
Only the human-readable summary misleads. This is a one-line wording fix.

## Residual notes

The guard pins probe bytes, not probe provenance.
An operator can still pass a different executable that hashes to its own value.
The F4 pre-arm vector pin narrows this, because a substitute probe must also
reproduce the pinned vector.
The skill now names the committed probe, which is the practical control.

`--stable-sha256` blocks its shell for about ten minutes and prints nothing until
it finishes. That is expected, and the skill states the interval.

## Blockers for the next paid authorization

The guard work no longer blocks anything. Two round-level blockers remain, and
R1 adds a planning decision.

1. The Scout `1.9.30` drift decision is still open.
2. The candidate row review and closeout decision are still incomplete.
3. R1 needs an owner decision on how a valid pair can complete at Scout's cadence.

## Definition-of-done check

| Item | Result |
|---|---|
| Diff scoped, unrelated work preserved | PASS |
| Proportionate tests pass | PASS, F7 and F8 gaps closed |
| Required gates pass | PASS |
| Generated artifacts from scripts | PASS, none changed |
| Secrets scanning | PASS |
| Independent review completed | this document |
| Documentation describes current behavior | PASS, F12 closed |

---

# Bounds re-review

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort

Commit re-reviewed: `5d47ab6900af6aa14d65d271879c9340f5b6bf3c`

Scope: R2, R3, and R5 only.

Verdict: `PASS`

I made no implementation edit. I only re-read, re-ran, and measured.

## Commands

| Command | Result |
|---|---|
| `npx vitest run` on the four touched test files | PASS, 182 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 105 files, 1,819 tests |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| Probe run three times, minimal environment | one identical hash each time |
| Independent full Docs enumeration | matched the probe hash exactly |
| Instrumented `fetchImpl` capture | 7 requests, 7 Algolia search operations |
| 25-case `parseRetryAfterMs` table | every case bounded, no throw |
| Simulated 429 storm | sleeps capped, fails closed |
| 9-case `collectionComparabilityReasons` table | one accurate reason per stop |
| 4 extra paired-gate postflight mutations | see N3 below |
| `npm run secrets:scan -- --tree` | clean |

I started no QA collection and made no paid model call.

## R2 — Algolia billed load: RECONCILED

The probe now discovers the page count first. It requests page zero alone.
It then requests exactly the remaining pages in one batch.

I instrumented the probe's `fetchImpl` and counted the real traffic:

| Measure | `8cd724d` | `5d47ab6` | Change |
|---|---|---|---|
| Algolia search operations per capture | 10 | 7 | −30% |
| Algolia search operations per 500-case arm | 10,010 | 7,007 | −3,003 |
| HTTP requests per capture | 6 | 7 | +1 |
| HTTP requests per arm | 6,006 | 7,007 | +1,001 |
| Algolia HTTP requests per arm | 2,002 | 3,003 | +50% |
| Measured wall time per capture | 0.36 s | 0.47 s | +0.11 s |
| Added wall time per arm | about 6 min | about 8 min | +2 min |

The sub-query count now equals the live page count exactly, so no operation is wasted.
The billed metric that Algolia rate-limits and bills fell by 30 percent.
The HTTP connection count rose by one per capture, which is the cost of the split.
That trade is favourable, because Algolia counts each sub-query as one search operation.
See N1 for the honest statement of the one metric that got worse.

Per-host load for a 500-case arm is now `stellarlight.xyz` 1,001,
`api.lumenloop.com` 3,003, and the Algolia DSN host 3,003.

### Enumeration completeness

I verified completeness independently rather than trusting the split.

I fetched all seven pages in one batch, applied the probe's own
`normalizeStellarDocsTitles` and `canonicalRemoteSourceSha256`, and compared.

- Live index: `nbHits` 650, `nbPages` 7, `hitsPerPage` 100, `exhaustiveNbHits` true.
- Seven pages flattened to 650 hits and 650 unique records, with no dropped duplicates.
- My independent hash `aecaf9a5…beb9b209` equals the probe's `canonicalTitleSetSha256`.
- Page seven, one past the end, returns zero hits.
- The whole vector hash is still `afd993854a…e07bbc7f`, unchanged across the refactor.

The refactor is therefore hash-neutral and loses no record.

## R3 — timeout math: RECONCILED

The constants now live in `remote-identity-guard.mjs`, and the outer process
timeout is derived from them instead of being a separate literal.

I recomputed the arithmetic from the exported constants:

- Request timeout 20,000 ms, retry delays `[250, 1000]`, `Retry-After` cap 5,000 ms.
- Worst case per phase: `3 × 20,000 + 2 × 5,000` = 70,000 ms.
- Two serialized Docs query phases: `REMOTE_IDENTITY_MAX_NETWORK_BUDGET_MS` = 140,000 ms.
- `REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS` = 145,000 ms, which leaves 5,000 ms of slack.

The old pair was 60,000 ms against a 61,250 ms budget, so the retry could not finish.
The new pair satisfies `process timeout >= network budget`. The mismatch is gone.

### `Retry-After` parsing and caps

I ran 25 adversarial header values. Every one stayed bounded and none threw.

- Integer seconds parse and clamp: `0` to 0, `1` to 1,000, `5` and `120` to 5,000.
- A 400-digit value becomes `Infinity` and is caught, returning the 5,000 ms cap.
- `1.5`, `-1`, `+3`, `0x10`, `3, 4`, and free text all return null and fall back to 250 ms.
- IMF-fixdate parses; a future date clamps to the cap and a past date floors at zero.
- RFC 850, asctime, a non-GMT zone, and a bad month name all return null.
- A header carrying a newline returns null, so nothing is injected into a log line.

The effective delay is `max(fixed delay, Retry-After)`, so a server can lengthen a
wait but never shorten it below the built-in backoff.

A simulated 429 storm slept 5,000 ms twice, for 10,000 ms total, then failed closed.
The header value never appeared in the error message.

`retryAfterMs` is only set on the `http` branch, so timeout and network errors keep
the fixed delays. That is correct.

## R5 — stop reason deduplication: RECONCILED

`collectionComparabilityReasons` is now an exported pure function with tests.
I exercised it across nine scenarios.

- A pre-arm mismatch produces exactly one line:
  `remote identity pre-arm vector SHA-256 mismatch`.
  The first re-review saw three lines here, none of which named the real cause.
- `identity-changed` names the changed services.
- `probe-unavailable` keeps its own wording.
- An unrecognised future reason yields `remote identity guard failed: <reason>`,
  so no new failure kind can be silently misattributed.
- A non-guard collection failure and a non-guard remote postflight failure both survive.
- `[...new Set(reasons)]` collapses identical strings.

Two mechanisms remove the duplicates. Errors carrying
`code === "remote-identity-guard"` no longer add a collection or postflight line,
because the guard record already supplies the specific reason.
`postflight()` no longer throws on an already-stopped guard; it returns null and
records `skippedReason: "guard-already-stopped"`.

I checked the safety of the code-based suppression. Every `RemoteIdentityGuardError`
comes from `fail()`, which sets `failure` first, or from `assertActive()`, which only
fires once `failure` is set. A guard-coded error therefore always implies
`record().matches === false`, so suppressing its generic line loses nothing.

The paired printer still rejects a skipped postflight, because it requires
`postflight.attempted === true` and `postflight.matches === true`.
I confirmed that a removed, null, or `attempted: false` postflight all give
`INDETERMINATE` with the `remote-identity-guard` code.

## New observations

None of these blocks the commit. I record them so the next lane inherits them.

### N1 — one load metric moved the wrong way

Algolia HTTP requests per arm rose from 2,002 to 3,003, a 50 percent increase,
because the settings read now sits beside two title POSTs instead of one.

This is the honest counterweight to the 30 percent search-operation saving.
The saving is on the metric Algolia bills and rate-limits, so the trade is right.
The report should not claim the change reduced load on every axis.

### N2 — the split adds a small torn-read window

The two title batches are no longer one request, so the index can move between them.

I measured the window over three runs: 313 ms, 148 ms, and 150 ms.
The gap between the two POSTs was 5 ms, 1 ms, and 2 ms.

The per-page check compares `page`, `nbPages`, and `nbHits` against the first
response, so an added or removed page is caught. A pure retitle that preserves both
counts would not be caught, and the capture would hash a mixed snapshot.

That mixed hash matches neither the old nor the new state, so the guard stops the arm.
The failure is closed, not silent. Given a roughly daily docs deploy and a window
under a third of a second, the probability is negligible. I accept it.

### N3 — the paired gate does not cross-check `skippedReason`

I mutated a candidate artifact to carry `postflight.attempted: true` together with
`skippedReason: "guard-already-stopped"`. The paired printer returned `PASS`.

The runner cannot emit that pair. The skip branch always sets `attempted: false`,
and the success branch always sets `skippedReason: null`.
So this is forgery hardening, not a real-run hole.

Every other guard field is cross-checked, so the new field is the one exception.
Requiring `skippedReason === null` whenever `attempted === true` would close it.

### N4 — `missing-baseline` still reads as a probe failure

A postflight with no answering call at all fails with `reason: "probe-unavailable"`
and `diagnostics.kind: "missing-baseline"`.
The comparability line therefore says the probe was unavailable when it was fine.

This only happens on an artifact that already failed before its first row, and the
diagnostics carry the truth. It is a residual nit from the same family as R5.

### N5 — the worst-case capture ceiling grew

Fixing R3 raised the per-capture ceiling from 60 s to 145 s.
A systematically slow but eventually successful upstream would therefore extend an
arm further than before.

This is the correct trade, because the old ceiling truncated a legitimate retry.
The measured normal case is 0.47 s, so the ceiling stays theoretical.
Any single probe failure stops the arm, so the ceiling cannot accumulate in practice.

### N6 — the phase count is a hand-maintained constant

`REMOTE_IDENTITY_DOCS_QUERY_PHASES = 2` lives in the guard module, while the phases
themselves live in the probe. A third phase added later would silently under-count
the budget and reproduce R3.

The new test that pins seven requests per capture would fail on such a change, so a
guard exists. I record the coupling rather than treat it as a defect.

## Still open from earlier passes

R1 and R4 are unchanged, because this commit did not address them.

- **R1.** Scout shipped about seven releases inside the last eleven-hour arm.
  A pair needs more than twenty-two hours of Scout stability.
  The owner must decide how a valid pair can complete before the next authorization.
- **R4.** The Docs title enumeration has a hard 1,000-record ceiling.
  The live index holds 650 records, which is 65 percent of that limit.
  I re-measured both numbers on this commit and they are unchanged.

## Blockers for the next paid authorization

The guard work blocks nothing. The round-level blockers are unchanged.

1. The Scout `1.9.30` drift decision is still open.
2. The candidate row review and closeout decision are still incomplete.
3. R1 still needs an owner decision on pair feasibility at Scout's cadence.

---

# Postflight re-review and final verdict

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort

Commit re-reviewed: `f2e2d10770385315358378748d65de2c20fac6b9`

Scope: N3 and N4 only.

Verdict: `PASS`

I made no implementation edit. I only re-read, re-ran, and measured.

## Commands

| Command | Result |
|---|---|
| `npx vitest run` on the four touched test files | PASS, 191 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 105 files, 1,828 tests |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| Eight scratch paired-gate mutations on `skippedReason` | all rejected |
| Four end-to-end guard classification scenarios | all accurate |
| Repository sweep for every consumer of the changed fields | complete, see below |
| `npm run secrets:scan -- --tree` | clean |

I started no QA collection and made no paid model call.

## N3 — paired artifact validation: RECONCILED

`paired-verdict.mjs:245` now requires `postflight.skippedReason !== null` to fail
the record. A successful postflight must therefore carry an explicit null.

I re-ran my exact original mutation. In the second re-review, a candidate with
`attempted: true` beside `skippedReason: "guard-already-stopped"` returned `PASS`.
It now returns `INDETERMINATE` with the `remote-identity-guard` code.

I then swept eight variants. Every one is rejected:

| Mutation | Result |
|---|---|
| `attempted: true` with `"guard-already-stopped"` | rejected |
| field absent, which is the pre-`5d47ab6` shape | rejected |
| explicit `undefined` | rejected |
| the string `"null"` | rejected |
| `NaN` | rejected |
| `{}` | rejected |
| `[]` | rejected |
| a single space | rejected |

A clean pair still passes, so the check is not over-tight.
The check also applies to the baseline arm, not only the candidate. I mutated the
baseline alone and the comparison still returned `INDETERMINATE`.

The author's own table adds `false`, `0`, and a missing field, so the committed
suite covers falsy values that a loose `!skippedReason` test would have missed.
The strict inequality is the right shape here.

## N4 — missing-baseline classification: RECONCILED

`missing-baseline` is now its own failure reason with its own message.
`failure.reason` and `failure.diagnostics.kind` agree, which was the defect.

I exercised four end-to-end scenarios against the real guard and the real
`collectionComparabilityReasons`:

| Scenario | Reason recorded | Comparability line |
|---|---|---|
| postflight with zero answering calls | `missing-baseline` | `remote identity baseline is missing` |
| capture throws before the first paid call | `probe-unavailable` | `remote identity probe unavailable` |
| identity change, then postflight | `identity-changed` preserved | `remote service identity changed: scout` |
| early collection failure plus missing baseline | both | two distinct accurate lines |

The third row matters most. After a real stop, `postflight()` still takes the skip
path, returns null, and records `skippedReason: "guard-already-stopped"`.
The original `identity-changed` reason survives, so the new reason cannot shadow a
genuine stop, and no duplicate line appears.

The fourth row shows the two causes staying separate rather than collapsing.

## Schema compatibility

The strict null check changes what older artifacts mean, so I checked the blast radius.

An artifact collected before `5d47ab6` has no `skippedReason` field at all.
`undefined !== null`, so the paired gate now rejects it. I confirmed that by mutation.

That is the correct forward-only outcome. Those artifacts came from a guard whose
retry budget was wrong and which had no postflight skip semantics, so they were
never safe pair inputs.

The practical impact is zero, and I verified it rather than assuming it:

- `eval/qa/results/` does not exist in this worktree.
- The one real 500-case artifact, the stopped candidate, carries no
  `remoteIdentityGuard` key at all. The gate already rejected it before this commit.
- No paid arm has ever run under any version of this guard.

I also swept every consumer of the changed fields across `eval`, `src`, `scripts`,
and `test`. Three reason strings are mapped in `run-qa.mjs`, three messages in
`remote-identity-guard.mjs`, and `skippedReason` is read in exactly one place,
`paired-verdict.mjs`. Nothing else reads either field, so no other module can
break silently. The vector and guard schema identifiers are unchanged.

## Residual note

A missing-baseline postflight leaves `postflight` as
`{ attempted: false, matches: false, vectorSha256: null, skippedReason: null }`,
which is the initial state. It is therefore not distinguishable from a postflight
that was never called, by that object alone.

The `failure` record carries the true cause, and the paired gate rejects both cases
on `attempted !== true`. Nothing depends on telling them apart. I record this for
completeness and propose no change.

## Final verdict for the remote identity guard

`PASS`.

Every item from all three review passes is now closed:

| Pass | Items | State |
|---|---|---|
| First review of `2ca5880` | B1, B2, B3, F4 to F12 | closed by `8cd724d` |
| First re-review of `8cd724d` | R2, R3, R5 | closed by `5d47ab6` |
| Second re-review of `5d47ab6` | N3, N4 | closed by `f2e2d10` |
| Second re-review, accepted | N1, N2, N5, N6 | recorded, no change needed |

No code finding remains open. The guard is complete and independently verified.

## Blockers for the next paid authorization

The guard work blocks nothing. Three round-level items remain.

1. The Scout `1.9.30` drift decision is still open.
2. The candidate row review and closeout decision are still incomplete.
3. R1 still needs an owner decision on pair feasibility at Scout's release cadence.
   R4, the 1,000-record Docs enumeration ceiling, needs a scheduled re-check.
