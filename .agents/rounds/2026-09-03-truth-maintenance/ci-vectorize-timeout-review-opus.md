# CI vectorize timeout repair — independent review

Date: 2026-09-04.

Reviewer: Claude Opus 5 at `high` effort. Mode: audit. The reviewer changed no product code, no
test, and no existing document.

Reviewed commit: `0cdac4b7e4f6df167708c1304ff5508b1fa4a3de`, "test: remove redundant vectorize
timeout work".

Repair report: `.agents/rounds/2026-09-03-truth-maintenance/ci-vectorize-timeout-repair-sol.md`.

Previous snapshot: `72fb13f`.

## Verdict

`PASS`. No actionable finding remains.

The reviewer reproduced both exact CI failures under controlled load. The reviewer then verified
each repair claim with executable evidence.

The repair removes redundant work only. It raises no timeout. It skips no test. It changes no
product behavior. Measured evidence shows that the reduced rerank loop keeps every contract and
adds three assertions with real oracle value.

The reviewer records three observations. None of them is actionable.

The reviewer made no paid call, no live collection, no external write, no filing, no deployment,
and no network mutation.

## Scope

The commit changes five files. Two are test files. Three sit under `.agents`.

The reviewer measured zero changed files outside `test/` and `.agents/`. The diff touches no file
under `src`, `eval`, `catalog`, `inventory`, or `scripts`. It does not change `package.json`.

The commit is a cherry-pick. Its tree is byte-identical to the source commit `65d3380` on
`codex/tm-ci-timeout-fix`. `git diff --stat 65d3380 0cdac4b` returns an empty result.

## 1. The exact CI failures reproduce under controlled load

The reviewer created a temporary worktree at `72fb13f`. That worktree holds the pre-repair tests.
The reviewer then ran the two reported tests, first alone and then under 32 local CPU workers.

| Test | CI report | Isolated before | Stressed before |
| --- | --- | ---: | ---: |
| Clause-fit 23 | 15,328 ms, 5,000 ms limit | 3,174–3,201 ms | 8,660 ms, timeout |
| Rerank-fit 22 | 30,116 ms, 30,000 ms limit | 11,823–11,827 ms | 33,470 ms, timeout |

The stressed run produced both exact failure messages. They are "Test timed out in 5000ms." and
"Test timed out in 30000ms." Both limits match the CI report. Both tests failed together in one
run.

The isolated numbers match the repair report. Sol recorded 3,117–3,253 ms and 11,587–11,777 ms.

The reviewer then removed the temporary worktree. No other worktree changed.

The reproduction confirms the diagnosis. CPU contention is the amplifier. The two tests carried
enough avoidable work to cross their limits under load.

## 2. The SHA-256 and length check proves byte identity

`test/eval-vectorize-clause-fit.test.mjs:309-310` replaces one recursive buffer comparison with two
checks. The test asserts the exact byte length. It then asserts the SHA-256 digest.

The reviewer verified the hash helper. `eval/vectorize/rerank-config.mjs:73` calls
`createHash("sha256").update(value)`. Node hashes a `Buffer` argument as raw bytes. The digest
therefore covers the file content, not a string coercion.

The proof is sound. Equal length plus equal SHA-256 establishes byte identity for any practical
purpose. The check keeps full sensitivity:

- A truncated file fails the length assertion.
- A same-length rewrite fails the digest assertion.

The test still proves the rest of its contract. Line 293 hashes the original bytes before the
builder runs. The builder still must reject with `surface-expired: clause artifact input drift`.
The `embed` and `write` mocks still must record no call. The commit changed neither mock assertion.

The old comparison walked two 3.9 MB buffers inside the assertion library. The new check hashes the
same bytes in native code. That difference explains the drop from 3,174 ms to 15 ms.

## 3. The rerank change preserves every named contract

### Query identity and order

Test 22 still checks all 563 questions. It asserts that `dataset.questions` equals the deduplicated
question list of `dataset.allRows`. It asserts the exact length of 563. The commit did not touch
either assertion.

### Pair index

The commit reduces one loop. The loop scored 563 candidate unions. It now scores six representative
questions and one synthetic sparse case.

The reviewer measured what that loop actually covered. The result decides the question.

| Pair-index size | Questions |
| ---: | ---: |
| 682 of 682 clauses | 538 |
| 674 to 680 | 13 |
| 643 to 657 | 5 |
| 599 | 1 |
| 444 to 494 | 3 |
| 394 | 1 |

538 of 563 questions, or 95.6%, produce a **saturated** index. Their candidate union contains every
one of the 79 clause entry IDs, so the index holds all 682 clauses. Only 25 questions produce a
partial index. The smallest real index is 394 of 682.

All six representative questions are saturated. Each produces 682 indexes.

The synthetic sparse case produces 250 of 682 indexes. Its filtering is therefore stricter than
every real question in the corpus.

The reviewer then examined the oracle value of each assertion in this block.

- `expect(indexes).toEqual(indexes.slice().sort(...))` checks ascending order.
  `pairIndexForBase` builds its result with `clauses.flatMap((clause, index) => ...)`. The output is
  ascending by construction. This assertion can never fail for any input.
- `expect(indexes).toEqual(clauses.flatMap((clause, index) => baseIds.has(clause.entryId) ? [index] : []))`
  restates the implementation at `eval/vectorize/rerank-retrieval.mjs:72-75` line for line. A mirror
  cannot detect a defect in the logic that it mirrors. This holds at any sample size.

Both assertions existed before the commit. Neither gains power from more iterations.

The commit adds three assertions at `test/eval-vectorize-rerank-fit.test.mjs:304-308`:

- the sparse index is not empty;
- the sparse index is a strict subset of the clause list;
- a **reversed** sparse base still yields clause-order output.

These three carry independent oracle value. They are the first assertions in this block that can
fail on a real filtering or ordering defect. The commit therefore raises the discriminating power
of test 22 while cutting its cost.

The reviewer confirmed the synthetic case is not degenerate. The clause list holds 682 clauses over
79 unique entry IDs. The sparse set holds 27 entry IDs. The resulting index holds 250 entries. The
strict-subset assertion is meaningful, not trivially true.

### Ordering, tiering, and membership

Tests 17, 18, and 19 keep their full loops. Test 17 checks all 19 frozen positives. Tests 18 and 19
each iterate all 32 frozen rows. They still check candidate membership, duplicate freedom, backfill
tiering, and the remainder sort by ungated score then ID. The commit only changed how those tests
obtain the union.

### Batch contract

Test 22 still asserts the contiguous batch split of `[16, 1]`. It still asserts the flat query order
across both batches. The commit changed neither assertion.

## 4. Representative and sparse coverage is sufficient

The referee dataset joins eight row groups from five source files. The representative array samples
six of the eight. It omits `original.controlCases` and `blind.controlCases`.

That omission costs nothing measurable. The reviewer scored both omitted classes. Their first rows
produce indexes of 677 and 682 of 682. Both sit at or near saturation. They exercise no filtering
that the synthetic case does not exercise far more strongly.

Both control-case groups also keep full coverage elsewhere. They belong to the 32 frozen rows that
tests 18 and 19 still iterate completely.

The reviewer concludes that the sample plus the synthetic case is sufficient.

## 5. The shared cache cannot hide mutation or a test-order defect

The cache sits at `test/eval-vectorize-rerank-fit.test.mjs:55-62`. It stores one union per question
string.

The cache is safe for four independent reasons.

**The producer is pure.** `buildCandidateUnion` reads `catalog.entries`, builds fresh object
literals, sorts a local array, and returns a new array. It writes nothing. `catalog` and
`searchCatalog` are module constants in the test file. No test reassigns either one.

**The consumers do not mutate.** The reviewer inspected all four call sites at lines 224, 232, 255,
and 293. They use `.map`, `.slice`, or pass the union to `pairIndexForBase`. `pairIndexForBase`
reads only `.id`. A search for in-place `sort`, `reverse`, `splice`, `push`, `pop`, `shift`,
`unshift`, and `fill` on any union, base, remainder, or hit returned no match. A search for catalog
assignment or catalog array mutation returned no match. Line 256 copies the remainder with `.slice()`
before it sorts.

**The producer is deterministic.** The reviewer called `buildCandidateUnion` twice for each of the
36 questions that the tests use. Zero pairs differed. Determinism follows from the structure: pure
reads plus a total-order sort on ungated score with an ID tiebreak.

**Test order does not matter.** The reviewer ran the rerank file three times with
`--sequence.shuffle`. All three runs passed 25 of 25 tests.

## 6. No timeout increased, no test was skipped, no product behavior changed

The two files declare exactly one explicit timeout. It is `30_000` on test 22 at line 319. The
commit does not change it. The clause-fit file declares no per-test timeout, so test 23 keeps the
5,000 ms vitest default. That default matches the CI failure message.

The reviewer compared the full suite across the commit boundary.

| Snapshot | Test files | Tests |
| --- | ---: | ---: |
| `72fb13f`, before | 108 | 1,974 |
| `0cdac4b`, after | 108 | 1,974 |

The counts are identical. Both vectorize files hold 49 tests before and after. No test was removed,
added, or skipped. The pre-existing `it.skipIf(!artifactExists)` guard on test 23 predates this
commit and is unchanged.

The commit changes no product file. The reviewer confirmed an empty diff for `src`, `eval`,
`catalog`, `inventory`, `scripts`, and `package.json`.

The suite also grew faster. Its test time fell from about 87.7 seconds to about 69.6 seconds.

## 7. The handoff and the ledger stay accurate

The reviewer checked each recorded measurement.

| Recorded claim | Reviewer measurement | State |
| --- | --- | --- |
| Two-file run fell from 13.72–13.83 s | 13.58–13.67 s before | Confirmed |
| Two-file run now takes 1.41 s | 1.46–1.48 s after, three runs | Confirmed |
| The full suite passes 108 files and 1,974 tests | 108 files and 1,974 tests | Confirmed |
| Controlled CPU load reproduced both failures | Both exact messages reproduced | Confirmed |
| No timeout changed | One timeout exists and is unchanged | Confirmed |
| PR #125 failed only on the two vectorize timeouts | Consistent with the reproduction | Confirmed |

Small timing differences come from machine variance. The direction and the order of magnitude match
in every case.

`.agents/NEXT.md:48-51` records the repair and its report. `.agents/NEXT.md:81` places the PR update
behind owner external-write authority. The ledger adds one checked item and one repair-table row.
The ledger keeps three items open. They are the pane record, the production smoke checks, and the
owned-resource cleanup.

## 8. Every paid and owner decision stays blocked

- `.agents/NEXT.md:121`, `:127`, `:140`, and `:149` keep the four blocked classes.
- `improvements/INDEX.md` still shows 57 `reported-upstream`, 10 `verified`, and 3
  `declined-upstream`. That total is 70. No record moved to a filed state. The commit changed no
  `improvements` file.
- Revision 3 still says that it authorizes nothing. Its signature line at line 626 still offers
  `AUTHORIZED` or `NOT AUTHORIZED`.
- The PR #125 CI rerun needs external-write authority. Three places record that gate:
  `.agents/NEXT.md:81`, `.agents/NEXT.md:356`, and `ci-vectorize-timeout-repair-sol.md:96`.
- Owner decisions A to J stay open. Decision 5, the concurrent-load acceptance, stays open.
- Merge and deployment still need explicit owner authority.

The repair grants no authority.

## Observations

These three items need no action. The reviewer records them for the future reader.

**O1 — The pair-index oracle mirrors its implementation.** The assertion at line 297 restates
`pairIndexForBase` exactly. It cannot detect a defect in that function. The mirror predates this
commit. The commit does not widen it. The finding matters here only because it explains why cutting
the loop from 563 to six costs nothing. A future editor who wants real coverage should keep and
extend the sparse case, not restore the loop.

**O2 — Two of the eight row groups are unsampled.** The representative array omits
`original.controlCases` and `blind.controlCases`. Their measured indexes are 677 and 682 of 682, so
they add no filtering shape. Both groups keep full union coverage in tests 18 and 19. Adding their
first rows would cost about two union builds if the team wants exact source-class symmetry.

**O3 — The cache contract is unstated.** The cache is safe because no caller mutates the shared
union. That rule lives only in the current call sites. A one-line comment above line 55 would
preserve it for a future test author. The reviewer verified the current code by inspection, by
search, and by execution.

## Commands and results

| Command | Result |
| --- | --- |
| Narrow loop, five runs after repair | Pass; clause 15 ms; rerank 140–142 ms |
| Narrow loop, isolated, before repair | Pass; clause 3,174–3,201 ms; rerank 11,823–11,827 ms |
| Narrow loop with 32 CPU workers, before repair | Both timed out; 5,000 ms and 30,000 ms messages |
| Narrow loop with 32 CPU workers, after repair | Pass; clause 17 ms; rerank 307 ms |
| Both complete files, three runs after repair | Pass; 2 files and 49 tests; 1.46–1.48 s |
| Both complete files, two runs before repair | Pass; 2 files and 49 tests; 13.58–13.67 s |
| `npx vitest run test/eval-vectorize-rerank-fit.test.mjs --sequence.shuffle`, three runs | Pass; 25 tests each |
| `CI=true npx vitest run` after repair | Pass; 108 files and 1,974 tests |
| `CI=true npx vitest run` before repair | Pass; 108 files and 1,974 tests |
| `npm run typegen` then `npm run typecheck` | Pass |
| `npm run test:smoke` | Pass; 4 files and 83 tests |
| `npm run build` | Pass; dry run exited before upload |
| `git diff --check main...HEAD` | Pass |
| `npm run secrets:scan -- --tree` | Pass; clean with gitleaks |
| `node` determinism check over 36 questions | Zero nondeterministic unions |
| `node` pair-index distribution over all 563 questions | 538 saturated; 25 partial; smallest 394 |
| `node` sparse-case shape | 682 clauses; 79 entry IDs; 27 sparse IDs; 250 indexes |
| `git diff --stat 65d3380 0cdac4b` | Empty; the cherry-pick is byte-exact |
| `git diff --name-only 72fb13f 0cdac4b` outside `test/` and `.agents/` | Zero files |

The reviewer linked a prepared `node_modules` tree and a stub `.dev.vars` for these commands. The
reviewer removed both afterwards. The reviewer created one temporary worktree at `72fb13f` and
removed it. The reviewer touched no worktree that it did not create. The worktree carries no change
except this report.

The 32 CPU workers each carried a self-terminating deadline. The reviewer also killed them
explicitly after each run.

## Standing

The repair is correct and proportionate. It removes redundant work, keeps every stated contract,
and adds three assertions that the previous test lacked.

PR #125 still needs its CI rerun. That action needs owner external-write authority. No paid,
filing, golden, merge, or deployment action is authorized by this review.
