# Instrument lane report — 2026-11-14

Lane `instrument` (Claude Opus 5.5, `agentpc/t1jr`). Design: [`DESIGN.md`](DESIGN.md). Nothing was
committed and the script was not run for real in the worktree. `coverage/coverage.json` did not
exist yet, so every run below uses the fixture from `fixture-coverage.mjs`.

## What I built

| File | Change |
|---|---|
| `eval/qa/lint-corpus.mjs` | Deleted `CATEGORY_FLOORS`, the operation, skill, cross-service, NEG, VOCAB, and catalog-note-trap floors, and the 35% scheduled cap. `lintCoverage(cases, taxonomy, enforce)` now checks the taxonomy: valid `truth.leaf` and `secondaryLeaf`, at most target + 1 primary cases per leaf, an empty weight-2/3 leaf needs an `openSlots` entry, and a slot whose leaf has an active case is an error. Tool-lane cases are excluded. New `--taxonomy` flag. `lintLedger` accepts a retired destination. |
| `eval/qa/compile-qa.mjs` | Validates `truth.leaf`, `secondaryLeaf`, and `notes` (strings) and `truth.lane` (`tool` only). Writes `truth.lane: "tool"` cases to `tool-cases.json`. `cases.json` and `sample.json` hold the headline only. The ledger accepts retired destinations. Deleted `MIGRATION_KEYFACT_EXCEPTIONS`: the five live exception IDs are all rewritten to five or fewer facts or merged, so every case is capped at five. `validateCase` is exported for the apply preflight. |
| `eval/qa/lib.mjs` | `TOOL_CASES_PATH`. |
| `eval/qa/README.md`, `eval/qa/corpus/README.md` | Coverage rules, tool lane, `truth.leaf`/`notes`/`lane`, merge-as-retirement, CI pin list. |
| `test/qa-corpus-lint.test.mjs` | Taxonomy coverage rules; retired ledger destination. |
| `test/qa-lifecycle.test.mjs` | Retires a real battery case against the checked-in registry (digest match and mismatch). The registry-coverage test now derives its counts from the lane files instead of pinning 501/507/0. |
| `test/qa-strkey.test.mjs` | The CRC-broken strkey test writes its own answer text. The real case it used drops the strkey in its rewrite. |
| `apply/apply.mjs` | The one-off apply script (see below). |
| `apply/fixture-coverage.mjs` | Builds a test-only `coverage.json` stand-in from `audit/` and `verify/`. Leaves are dealt mechanically, so they are not a coverage decision. |

### `apply.mjs`

```sh
node .agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs --dry-run [--only a,b] [--coverage <file>] [--todo-heading "<text>"] [--date 2026-11-14]
```

- Precedence: coverage `cases[]` (`finalVerdict`, `survivor`, `leaf`, `secondaryLeaf`, `note`, and an
  optional `rewrite`), then `extraCuts` and `toolLane[].final`, then the verifier, then the auditor.
- It builds every target state in memory first. It then runs `validateCase` and the
  corroboration, authoring, numeric, date-trap, ledger, and coverage lint lanes on the would-be
  corpus. It lists every refusal and writes nothing while any refusal remains.
- It writes case files, tombstones (deleting the battery file), `consistency-register.json`,
  `source-sentinels.json`, and `eval/qa/taxonomy.json` (with `openSlots`). Then run
  `npm run eval:qa:compile` and `npm run eval:qa:register`.
- `--dry-run` prints `[plan]`, `[register]`, `[sentinel]`, `[warn]`, and `[avoid-wrapped]` lines and a
  summary.
- It is idempotent. A second run printed `noop=507` and left `git status` clean.

## Gates in the scratch copy

The scratch copy is a `git clone` of this worktree at `997a2eff`, plus the lane's files committed on
top, with `node_modules` linked. Fixture adjustments (scratch only, `adjust-fixture.mjs` in my
scratchpad): nine refused rewrites set to `keep`, two retirement reasons supplied, and three date-trap
`reverifyBy` mentions of retiring cases removed from the register text.

| Command (in the scratch clone) | Exit |
|---|---|
| `node …/apply/apply.mjs --dry-run --coverage cov.json` | 0 (`leaf=17 merge=77 retire=107 rewrite=288 tool=18; refusals=0`) |
| `node …/apply/apply.mjs --coverage cov.json` | 0 |
| same again (idempotence) | 0, `noop=507`, no file diff |
| `npm run eval:qa:compile` | 0: 304 headline, 30 sample, 18 tool, 507 reserved IDs |
| `npm run eval:qa:register` | 0: updated, **140 entries reopened** |
| `npm run eval:qa:register -- --check` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0: 0 errors, 221 warnings |
| `node eval/qa/lint-corpus.mjs --since <pre-apply commit> --stale --enforce-floors` (gospel lane) | 0: 0 errors |
| `npm run eval:selftest` | 0 |
| `npm run eval:qa:sentinels -- --check` | 0 (29 sentinels) |
| `npm test` | **1**: 7 files fail, 3,333 tests pass. The strkey failure is fixed; the other 6 are below. All 7 files pass on the unmodified base clone. |

### Tests that pin case content (fail after apply; final content decides the fix)

| Test | Pins | Recommended fix |
|---|---|---|
| `test/qa-verdict-consistency.test.mjs` | reads `q-gap-vet-pitch-vertical-null` (retires), `q-defi-arbitrage-pathpayment-bots`, `q-pc-sequence-numbers-ordering-replace` as fixtures | copy minimal fixture cases into `test/fixtures/` |
| `test/p6-judge-self-test.test.mjs` via `eval/qa/judge.mjs` `PROMPT_SHA256_FIXTURES` | 15 case IDs and their judge-prompt hashes; only 1 of 15 still matches | re-pin to surviving cases after the real apply; no paid call |
| `test/playground-final-orchestrator.test.mjs` ("verifies all25 source cases") | compares the worktree `cases.json` to a frozen corpus snapshot | make the test read the frozen corpus, or re-pin |
| `test/qa-corpus-lint.test.mjs` ("seven-, eight-, nine-row archive rosters") | key-fact wording of `q-infra-rpc-provider-archive-tier` | delete if the rewrite drops the roster facts on purpose; otherwise keep the wording |
| `test/qa-golden-max-tx.test.mjs` | `q-protocol-max-tx-set-size` attributions | same question: confirm the rewrite drops them on purpose |
| `test/qa-judge-qpp-dormant.test.mjs` | `q-pc-quantum-preparedness-dormant` wording (`final`) | same |

The last three guard earlier golden-truth decisions. A compact rewrite that drops a guarded fact
needs a deliberate call, not a silent test edit.

## Refusals on the real inputs (plain fixture, no adjustments)

`apply.mjs --dry-run` exits 1 with 17 refusals:

- **Stable golden pins "as of <date>"** (lint error), 5: `q-asset-trustline-basics`,
  `q-edge-noinfo-sep-9999`, `q-pc-account-activation-not-found`,
  `q-pc-bucketlist-vs-merkle-inclusion-proof`, `q-sep-53-sign-verify-message`. Each rewrite dated a
  value in a `stable` case. Either drop the date or make the case `scheduled` with `reverifyBy`.
- **Numeric/version key fact without a covering corroboration row**, 5 facts in 4 cases:
  `q-aas-trusted-asset-list-whitelist` (SEP-42), `q-pc-sequence-numbers-ordering-replace`
  (CAP-0021), `q-protocol-accounts-signers-thresholds` (CAP-0040), `q-sor-sac-introspection`
  (SEP-41, two facts). The lint matches `SEP-n`/`CAP-n` as version fragments. Add a corroboration
  row through a coverage `rewrite` or `note`, or reword the fact.
- **No score-independent retirement reason**, 2: `q-comp-sep8-number-lookup-no-deepresearch`,
  `q-gap-rpc-horizon-unindexed-reference`. Every available text matches `SCORE_CAUSE_RE`
  ("headline", "verdict"). A coverage `note` fixes it.
- **Date-trap text names a retiring case's `reverifyBy`**, 3: `q-edge-fresh-latest-scf-round`,
  `q-scf-confidential-tokens-preview`, `q-tool-cctp-stellar-integration`. The register's
  `disposition` text must be edited by hand.

Before coverage resolves them, merges are also blocked by these:

- **18 merges have more than one candidate survivor** in their `duplicates` and no `mergeInto`.
  Coverage must set `survivor`.
- **7 merges point at a non-headline survivor.** Six go to tool-lane cases
  (`q-defi-cluster-rollup-live` ×3, `q-scf-hackathon-compare-live`,
  `q-scout-hackathon-brief-first-hour`, `q-scf-pitch-prep-live`). The script allows a tool-lane
  survivor with a warning. `q-soroban-av-passkeys-talk` → `q-gap-av-offset-not-timestamp`
  (retire) is refused as a chain.

## What the applied corpus looks like (fixture leaves)

- Register: 86 changes. 12 clusters fall under two members and are deleted. 4 numeric invariants
  and 5 date traps lose members, and none empties. **140 entries reopen** on member-hash changes,
  and each needs a `--review` closure (phase 6).
- Sentinels dropped: `scf-46-submission-deadline-edge`, `scf-47-not-listed-edge`,
  `sdp-transaction-submission-service`, `scf-rfp-q4-tooling-roster`.
- `truth.asOf` moved to 2026-11-14 in 126 cases. In each, every rot entry held or changed with
  evidence observed in this round, no `notRechecked` item remained, and no sentinel pins the case.
  `reverifyBy` never moved.
- Lint warnings rose from 81 to 221: 152 key-fact (97 "multiple predicates", the rest over 90
  characters or a negative predicate), 38 avoid, and **25 snapshot-date**. In those 25 rewrites a
  key fact demands "as of 2026-11-14", the round date. That conflicts with the common-brief rule
  that a `live` or `scheduled` key fact must accept a later dated figure.
- 63 avoid items got the `Do NOT claim that …` wrapper (printed as `[avoid-wrapped]`). Several are
  noun phrases, for example "Do NOT claim that direct user invocation of `__check_auth`, or
  EIP-4337 as the model". They read awkwardly and deserve a pass before the real run.

## Open questions for the orchestrator

1. **TODO anchor.** The script writes `rootCause: [".agents/TODO.md — Apply the 2026-11-14 golden
   coverage audit"]`. Use that exact `###` heading, or pass yours with `--todo-heading`.
2. **CI.** Add `eval/qa/tool-cases.json` to the compile byte-compare list in `.github/workflows/ci.yml`.
   That file is outside my write set.
3. **Tool lane size.** If coverage keeps fewer than five tool cases, retire them instead
   (DESIGN §5) and delete the `truth.lane` partition (about 15 lines in compile and lint).
4. **Multiple replacement IDs.** One verifier note asks for "Tombstone replacements: both IDs"
   (`q-agent-payment-standard-choice`). The coverage `survivor` field is singular. Should it accept
   an array? The tombstone format already does.
5. **Absorb text.** Five auditor merges carry `absorb` text for the survivor. The script applies only
   the survivor's own rewrite, and warns when the survivor is a `keep` with no rewrite. Coverage
   should confirm that each survivor rewrite contains its absorbed facts.
6. **Ordering.** The code change and the applied corpus must land in one commit. On the current
   corpus, `--enforce-floors` fails (no leaves) and compile fails on the six-fact cases once the
   exceptions are gone. In the worktree as I leave it, 92 of 93 tests in the three changed test
   files pass. The registry-coverage test fails until compile writes `tool-cases.json`.
7. **Prose counts** outside my write set: `README.md` "501", the register `$comment` "499-case",
   `CONTRIBUTING.md` (command unchanged), and the golden-truth skill (a new case needs `truth.leaf`).
8. **Held-out split** (DESIGN §7): the rule goes into `eval/qa/README.md` at close, with the split
   file in git-ignored `eval/qa/results/splits/`.
