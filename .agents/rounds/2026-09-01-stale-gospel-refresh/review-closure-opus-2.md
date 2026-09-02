# Stale-gospel refresh — independent closure review (Opus 5, pass 2)

Reviewer CLI: Claude. Model: Opus 5. Effort: high.
Date: 2026-09-01.
Branch: `maintenance/stale-gospel-2026-09-02`.
Base: `8c0f0069dff2f5b1d8d69666bd779dff994c6f08`.
Author and orchestrator: Codex GPT-5.6 Sol.

**Verdict: CHANGES REQUIRED.**

The required changes are limited to `eval/qa/register-helper.mjs` and its tests. See F1 and F5.
The committed corpus, register, and instruction changes are correct as far as this pass checked
them. This pass did not cover the claim-level truth of the seven golden refreshes. Read
"Coverage limits" before you treat this report as a full closure gate.

## Reviewed surface

`git diff main --stat` reports 17 files, 1049 insertions, and 551 deletions.

| Area | Files | Covered here |
| --- | --- | --- |
| Seven golden refreshes | 7 case files under `eval/qa/corpus/battery/` | No — see Coverage limits |
| Consistency-register closure | `eval/qa/consistency-register.json` | Yes |
| Register-helper `--review` safety | `eval/qa/register-helper.mjs`, `test/qa-register-cli.test.mjs` | Yes |
| Generated artifacts | `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/lifecycle-registry.json`, `improvements/INDEX.md` | Partly |
| Source support | `improvements/stellar-docs/sd-039-*.md` | Yes |
| Stale dates | diff-local only | Partly |
| Repository instructions | `.agents/skills/golden-truth/SKILL.md`, `.agents/TODO.md` | Yes |

## Commands run in this pass

```
git status --short
git diff main --stat
git diff main -- eval/qa/register-helper.mjs
git diff main -- .agents/skills/golden-truth/SKILL.md .agents/TODO.md improvements/INDEX.md \
  improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md \
  eval/qa/sample.json
git diff main -- test/qa-register-cli.test.mjs
git diff main -- eval/qa/consistency-register.json
for id in <the seven case ids>; do grep -c "\"$id\"" eval/qa/consistency-register.json; done
npm run eval:qa:register -- --check
npm run eval:qa:lint -- --stale
```

Results:

- `npm run eval:qa:register -- --check` printed `[register-helper] up to date` and exited 0.
- `npm run eval:qa:lint -- --stale` printed `0 error(s), 62 warning(s)`. No stale case remains.

I read `eval/qa/register-helper.mjs` in full. All line references below point to that file.

## Findings

### F1 — `--seed` defeats the `--review` reopen guard. Severity: medium. Required.

`main()` guards the review path at line 178:

```js
if (result.reopened.length > 0) throw new Error("cannot apply a review while member changes are unstamped");
```

`updateRegister()` fills `reopened` at line 97:

```js
if (!seed && knownHashChanged) {
```

Under `--seed`, `reopened` stays empty even when a recorded member hash changed. The guard at
line 178 then passes. Line 177 rejects `--review` with `--check`, but no line rejects `--review`
with `--seed`.

Failure scenario: an agent edits corpus case files, then runs
`node eval/qa/register-helper.mjs --seed --review review.json`. The helper re-baselines every
member hash. It also stamps `verdict: "consistent"` and an authored `reSwept` on the named
entries. It prints no `REOPEN` line and no error. The register then records a reconciliation for
content that was never shown to have changed. This is the exact outcome the line 178 guard exists
to prevent.

Required change: reject `--review` together with `--seed`, next to the existing `--check`
rejection. A stricter option is to compute the reopen signal for the guard independently of
`seed`.

### F2 — A review can close an entry that was never reopened. Severity: medium-low. Recommended.

`applyReviewFields()` requires `clearReopened === true` at line 127. That flag only drives
`delete entry.reopened` at line 131. Nothing checks that the target entry currently carries
`verdict: "reopen"`, and nothing checks that `entry.reopened` exists.

Failure scenario: a review item names a cluster id that currently carries
`verdict: "contradiction"` or `verdict: "tension"`. The helper overwrites the verdict with
`"consistent"`, writes the authored `reSwept`, and exits 0. A live contradiction leaves the
register without a reconciliation of its own subject matter. The line 120 check
(`verdict must be consistent`) blocks a downgrade. It does not block this upgrade.

Recommended change: require `entry.verdict === "reopen"` before `applyReviewFields()` writes.

This round does not trip F2. All seven changed entries were genuine reopens.

### F3 — Trap reviews are not idempotent. Severity: low. Document or change.

`applyRegisterReview()` matches a date trap on `triggerDateEvent` at line 143. `REVIEW_FIELDS`
at line 112 also makes `triggerDateEvent` writable. The match key and a writable field are the
same field.

This round uses that behaviour. The trap moved from
`"2026-09-01/2026-11-19 review or any Confidential Tokens Mainnet approval/launch"` to
`"2026-11-19/2026-12-15 review or any Confidential Tokens Mainnet approval/launch"`.

Two consequences follow. Re-running the same review file throws
`expected one match, found 0`, so a trap review is a one-shot operation. A cluster review, by
contrast, is idempotent. Within one review file, retargeting trap A onto trap B's trigger value
makes B ambiguous on the next item.

Both consequences fail closed. `applyRegisterReview()` throws before `writeFileAtomic()` at
line 187, so a rejected review leaves the register file untouched. Record the asymmetry in the
helper header comment so the next round does not retry a trap review after a failure.

### F4 — `reSwept` validation is shape-only. Severity: low.

Line 124 accepts any non-array object. `reSwept: {}` passes. Every `reSwept` already in
`eval/qa/consistency-register.json` carries `date`, `reason`, and `verdict`. The helper does not
require those keys. It does not require `reSwept.date` to equal `lastChecked`. It does not
require `reSwept.verdict` to equal `verdict`.

The helper therefore cannot stop an undated or empty re-sweep claim from landing. I did not
confirm whether `eval/qa/lint-corpus.mjs` enforces the `reSwept` shape downstream. Confirm that,
and add the key checks to `applyReviewFields()` if the lint does not already cover them.

### F5 — `--review` has happy-path tests only. Severity: medium. Required.

`test/qa-register-cli.test.mjs` adds one test, "applies reviewed closures without changing
generated member hashes". It asserts one successful closure. It asserts that the member hash is
unchanged and that `--check` then exits 0. That part is good and it is the right invariant.

No test covers any rejection path. The uncovered guards are:

| Guard | Line |
| --- | --- |
| unsupported review field | 117 |
| verdict is not `consistent` | 120 |
| malformed `lastChecked` | 121 |
| `reSwept` is not an object | 124 |
| `clearReopened` is not `true` | 127 |
| cluster match is absent or ambiguous | 139 |
| trap match is absent or ambiguous | 144 |
| `--review` with `--check` | 177 |
| `--review` with unstamped reopens | 178 |

Those nine guards carry the whole safety argument for the feature. Nothing pins them. A later
refactor can delete any of them and the suite stays green.

Required change: add negative tests for at least line 120, line 127, line 177, and line 178.
Add the F1 rejection test at the same time.

### Positive verifications on the helper

- A rejected review never reaches disk. `applyRegisterReview()` mutates entries in place, but any
  throw travels through `main()` to the top-level catch at lines 192-193. `writeFileAtomic()` at
  line 187 never runs. Partial application is therefore not persisted.
- Line 180 sets `changed = true`, so an accepted review always writes. No path accepts a review
  and then silently skips the write.
- For a non-seed run, the two-step flow is enforced. The operator must stamp hashes first, then
  close.
- The unsupported-field check at lines 115-119 uses an allowlist, not a denylist. That is the
  correct direction.

## Consistency-register closure

The arithmetic checks out. The diff changes six clusters and one date-contingent trap. The round
ledger records "reopened six clusters and one date trap". The two counts agree.

Only two member hashes moved: `q-sor-confidential-tokens` and `q-ti-testnet-usdc-faucet`. I
counted occurrences of each of the seven refreshed case ids in
`eval/qa/consistency-register.json`. Five ids return zero: `q-sor-evm-to-soroban-porting`,
`q-sor-reflector-integration-code`, `q-soroban-av-passkeys-talk`, `q-ti-openzeppelin-relayer`,
and `q-ti-friendbot-ratelimit-alternatives`. Those five belong to no register entry, so no
further reopen was expected. The closure set is complete for this diff.

`npm run eval:qa:register -- --check` reports "up to date". The committed hashes match the
committed corpus.

Every closed entry carries a dated and specific `reSwept.reason`. Each reason names what changed
and names the source it was re-derived from. Named re-derivations include `cap-0059.md`,
`cap-0074.md`, and `cap-0075.md` status and protocol values,
`https://developers.stellar.org/docs/build/apps/privacy`,
`https://developers.stellar.org/docs/build/apps/zk`,
`https://developers.stellar.org/docs/tools/lab/account`, and the SDF developer-preview post. This
is materially stronger than a generic "no contradiction" close. I accept these closures on their
recorded reasoning.

The testnet-funding closure is the most load-bearing one. It removes a named Lab path-payment
distribution route. Its reason cites `https://developers.stellar.org/docs/tools/lab/account` for
what the Lab does document, which is Friendbot XLM funding and USDC/EURC trustline creation. It
then names six sibling cases it re-read. That is the right shape for a removal.

The retargeted date trap is internally coherent. Its new `disposition` names
`q-sor-confidential-tokens reverifyBy 2026-12-15` and
`q-scf-confidential-tokens-preview reverifyBy 2026-11-19`. The new `triggerDateEvent` carries the
same two dates. The 2026-12-15 value matches the ledger's next-review column for that case. I did
not open the case file to confirm that `reverifyBy: 2026-12-15` is written there.

### Note on the 2026-09-02 stamps

Every closed entry is stamped `2026-09-02`. Today is 2026-09-01. The ledger explains this at its
Trigger and Matrix-reconciliation sections. The preflight crossed midnight UTC, and the
orchestrator reconciled the matrices on 2026-09-02 while the funding sources were observed on
2026-09-01. The stamps are consistent with that account. No change is required. I record the
point because a reader who arrives at this diff without the ledger will read the stamps as
forward-dated.

## Generated artifacts

`improvements/INDEX.md` moves the sd-039 recurrence count from 3 to 4. The source file
`improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md` adds
exactly one recurrence block. The generated index and its source agree.

The added recurrence is dated 2026-09-02. It cites
`.agents/rounds/2026-09-01-stale-gospel-refresh/passkeys-relayer-matrix.md`. It records that
issue `stellar/stellar-docs#2707` remains open without comments or maintainer activity, and that
the round posted no recurrence-only comment. That matches the improvements-pipeline rule for an
open issue with no maintainer activity. The recurrence also adds two new observations: the
inactive Channels Statuspage, and the 1.3.x guide link against rendered docs that label 1.5.x
stable. Those strengthen the finding rather than restate it.

`eval/qa/sample.json` moves `corpusContentSha256` from `0393e7be…` to `0ee23486…`.
`eval/qa/cases.json` and `eval/qa/lifecycle-registry.json` are regenerated. I did not re-run
`npm run eval:qa:compile` in this pass, so I did not prove that these three outputs match the
corpus byte-for-byte. `npm test` is the gate that enforces this. I rely on the orchestrator's
reported passing full suite for that specific correspondence, and I record the reliance rather
than claiming my own verification.

## Repository instructions

The `golden-truth` SKILL.md addition is the correct durable fix for the recorded authorization
deviation:

> Use a documented read path for a read-only probe. Treat provisioning, issuing, and creation
> endpoints as side effects, including endpoints that use `GET`.

It sits in the class C direct-service-probe section, which is where the deviation happened. It is
timeless. It carries no run stamp, no todo id, and no round reference. It states the rule as a
method-independent property, which is the exact lesson from the `https://channels.openzeppelin.com/gen`
HTTP 201 result. This satisfies the repository rule that skills hold patterns and not ephemera.

One residual item, low severity: other skills also direct live probing. I did not sweep
`run-evals`, `retrieval-system-audit`, `live-drift-resolution`, or `improvements-pipeline` for an
unqualified "read-only means `GET`" framing. Confirm those carry no contradicting statement.

The `.agents/TODO.md` addition, "Correct Lumenloop A/V `created_at` semantics", is correctly
routed. The defect is in our own `catalog/manifest.json` description, so it belongs in
`.agents/TODO.md` and not in `improvements/`. The entry carries concrete evidence: a DEVCON 2024
recording returned `created_at: 2026-04-02T23:21:21.744Z`. It names the matrix that holds the
observation. Its "Done when" is testable and it requires a regression test. This is a real and
valuable catch. The manifest currently tells agents to use that field for recency, so the current
text can silently mis-rank A/V results.

The Reflector README Beam decision is kept ledger-only. The ledger argues it is a
`canonical-source` defect in `reflector-network/reflector-contract`, that no improvements
collection or intake owner applies, and that no own-repo correction belongs in `.agents/TODO.md`.
That routing is defensible. The consequence is that a verified third-party defect leaves its only
durable trace in a dated round note. No change is required.

## Coverage limits

State these plainly when you use this report as a gate.

1. I did not read the seven case-file diffs. The claim-level truth of the golden refreshes is
   **not independently verified here**. That covers in-answer as-of dates, `keyFacts`, `avoid`
   clauses, `truth.verified` provenance, `truth.asOf`, and `reverifyBy` values. My statements
   about the refreshes rest on the register `reSwept` reasons and the round ledger, which the
   author wrote. Claim-level assurance must come from the three lane matrices and from the
   earlier `review-final-opus.md` pass.
2. I ran two gates myself: `npm run eval:qa:register -- --check` and
   `npm run eval:qa:lint -- --stale`. I did not run `npm run eval:qa:compile`, `npm test`,
   `npm run typecheck`, `npm run build`, `npm run improvements:lint`, or
   `npm run secrets:scan -- --tree`. The orchestrator reports the full suite passes.
3. I did not sweep the repository for stale dates outside the diff.
4. `review-final-opus.md` and `review-delta-opus.md` already exist in this round directory. I did
   not read either one. This report is therefore independent of their conclusions. It may
   duplicate them, and it may contradict them. Reconcile any contradiction before merge.

## Required before merge

1. **F1.** Reject `--review` together with `--seed` in `eval/qa/register-helper.mjs`.
2. **F5.** Add negative tests for the `--review` guards. Cover at least lines 120, 127, 177, and
   178, plus the new F1 rejection.

## Recommended before merge

3. **F2.** Require `entry.verdict === "reopen"` before a review closes an entry.
4. **F4.** Confirm that `eval/qa/lint-corpus.mjs` enforces the `reSwept` key shape. Add the key
   checks to `applyReviewFields()` if it does not.

## Optional

5. **F3.** Record in the helper header that a date-trap review is one-shot, because the review
   rewrites its own match key.
6. Confirm that no sibling skill carries an unqualified "read-only means `GET`" framing.
7. Re-run this closure review against the seven case-file diffs, or state in the round ledger that
   `review-final-opus.md` is the covering pass for claim-level truth.
