# Independent review — A/V runtime date semantics

Date: 2026-09-02
Reviewer model: Fable 5
Effort: high
Mode: audit only. No repository file was edited. No paid or live provider call was made.
Author lane: the uncommitted change on `codex/av-runtime-date-semantics`.

## Verdict

**PASS with four non-blocking findings.** No Critical or High finding exists.

The change does what the task requires. A/V `created_at` no longer provides a digest date.
A/V rows never take a recency position among dated rows. Non-A/V date selection is byte-identical
to the baseline. Data, soft-empty, and error responses are unchanged. All required read-only gates
pass. The findings below are documentation, comment, test, and ledger repairs. Reconcile them
before the TODO item leaves the queue.

## Scope and fixed point

| Item | Value |
| --- | --- |
| Fixed point | `09c095986dfcf21833d5382fd1cef2518bd0ee31` (HEAD, verified) |
| Changed files | `src/skills/runners/stellar-ecosystem-digest.ts`, `test/skill-runners.test.ts`, `test/smoke/executor.test.ts`, `research/skill-run-design.md` |
| New file | `.agents/rounds/2026-09-02-av-runtime-date-semantics.md` |
| Diff size | 4 files, 63 insertions, 4 deletions, plus the ledger |
| `git diff --check` | clean |

Ledger pins re-verified by hash: manifest `4cd28f4b…`, initial runner `a9146a7f…`, QA corpus
`8e144123…`, semantic fixture `f892a964…`. All four match the committed files. The ledger claim
"17 tests filtered out" matches the 18 `it(` blocks in `test/skill-runners.test.ts`.

## Verification run

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS. 100 files, 1631 tests. Includes catalog and super-spec staleness tests and `assertRunnersWired`. |
| `npm run test:smoke` | PASS. 4 files, 82 tests. Includes the changed digest smoke. |
| `npm run secrets:scan -- --tree` | PASS. No leaks. |
| `npm run build` | Not run by the reviewer. Its `prebuild` rewrites a generated file, which the no-edit rule forbids. The author must run it. |
| Local before/after probe | Run with Node strip-types against the HEAD runner and the working-tree runner. Results below. |

The working tree was unchanged after every command.

## Runtime trace

1. **Adapter.** `src/adapters/lumenloop-shape.ts:161-190` normalizes semantic rows and copies the
   first present field from `date`, `publishing_date`, `published_at`, `start_at`, `created_at`
   into canonical `date` with a `dateField` label. For an A/V row this is `created_at`. The
   adapter is unchanged by this diff. The digest runner never reads canonical `date`; the new
   unit test proves it ignores a row that carries `date` and `dateField: "created_at"`.
2. **Upstream filter.** The runner still sends `date_start` and `date_end` with
   `types: ["articles","av","events","research"]` to `search_content_semantic` and to
   `find_content_by_entity` (`stellar-ecosystem-digest.ts:239-257`). Lumenloop applies that filter
   on its own undocumented basis before rows reach the host. This is unchanged. See finding F1.
3. **Projection.** `itemDate(type, row)` at `:66-69` returns `null` for `type === "av"` and the
   `publishing_date` → `start_at` → `created_at` fallback for every other type. Both the
   normalized theme path and the type-keyed entity path call the same `projectItems`, so both
   modes get the same rule.
4. **Sort.** The existing comparator at `:107-112` puts `null` after every dated row. Order among
   dated rows is untouched.
5. **Output.** `items[].date` is `null` for every A/V row. `counts.av` still counts the row.
   `softEmpty`, `window`, `upcomingEvents`, and the schema are unchanged.

### Probe results (HEAD runner vs working-tree runner)

| Case | HEAD | Working tree |
| --- | --- | --- |
| Theme, live fixture | A/V row dated `2026-06-18T18:18:47.672Z`, ranked fifth of six | A/V row `null`, ranked last. Five non-A/V dates identical. |
| Entity, A/V row with `created_at` and `publishing_date` | A/V dated from `publishing_date`, ranked first | A/V `null`, ranked last. Three non-A/V dates identical. |
| Theme, primary soft-empty | `items: []`, `softEmpty: true`, zero counts | Identical |
| Theme, primary error | `ok: false`, kind `error`, same message | Identical |

Non-A/V `created_at` behavior is unchanged: research rows still date from `created_at` in both
arms.

## Distinction checks

- **Data vs soft-empty vs error.** The three branches at `:263-274` are untouched. The probe shows
  identical envelopes in both arms.
- **Exposure.** No manifest operation, schema, description, or keyword changed. The catalog entry
  for the skill and the super-spec `x-runnable-index` embed the runner schemas; the staleness tests
  inside `npm test` pass, so no regeneration is needed. `src/mcp/micro-map.ts` derives from the
  manifest and is unaffected.
- **Secrets and confinement.** The runner adds no import and no network path. The confinement
  tests pass.
- **Scope.** The diff touches only the runner, its tests, and the design note. No unrelated edit.
  The TODO item remains, as the ledger states, until this review reconciles.

## Findings

### F1 — Medium. A/V rows are still window-admitted by the unverified field, and no durable document says so

- **Location:** `src/skills/runners/stellar-ecosystem-digest.ts:239-257` (call arguments) and
  `research/skill-run-design.md:345-347` (new paragraph).
- **Evidence:** The runner sends `date_start`/`date_end` with `av` in `types`. Upstream filters A/V
  rows on its own basis, most likely the same `created_at`. The ledger records this: "The host
  cannot verify the A/V date basis after that filter. The runner therefore keeps returned A/V
  candidates but marks them as undated." The research paragraph says only that A/V rows are
  undated. Ledgers are records, not instruction surfaces (`.agents/README.md`).
- **Consequence:** The digest's `window` framing implies each item is activity inside the window.
  For A/V rows that claim rests on an ingest-like field. A DEVCON 2024 recording ingested in the
  window still appears in a "recent activity" digest, now with no date at all. A future maintainer
  reading the design note sees no reason to question A/V membership.
- **Smallest repair:** Add one sentence after `research/skill-run-design.md:347`: "Upstream still
  applies `date_start`/`date_end` to A/V rows on an undocumented basis; the digest keeps those rows
  but never restates the window as their date." Whether to drop `av` from theme `types` is an
  owner product decision outside this change's stop rules. Record it in `.agents/TODO.md` if the
  owner wants it considered.

### F2 — Low. The runner comment overstates verification for non-A/V `created_at`

- **Location:** `src/skills/runners/stellar-ecosystem-digest.ts:62-65`.
- **Evidence:** The comment says a date is selected "only when the row type gives the upstream
  field a verified date meaning." Research rows still date from `created_at`. No verification of
  research `created_at` exists in the repository; `research/services/lumenloop.md:95` records it
  only as the observed per-collection date field.
- **Consequence:** The comment presents an unverified claim as fact. A reader may believe research
  `created_at` was checked the way A/V `created_at` was.
- **Smallest repair:** Reword to state the invariant and its owner: "A/V `created_at` is upstream
  metadata with no verified recording-date meaning (see `improvements/lumenloop/ll-019`). Every
  other collection keeps the `publishing_date` → `start_at` → `created_at` fallback."

### F3 — Low. The new unit test skips the schema oracle and has no entity-mode assertion

- **Location:** `test/skill-runners.test.ts:112-155`.
- **Evidence:** Every sibling happy-path test ends with `expectValidates(...)`. The new test does
  not. The entity fixture has `av: []`, so no committed test exercises the entity path with an A/V
  row. The reviewer's probe shows the entity path returns `null`, so behavior is correct today.
- **Consequence:** The regression test does not prove the changed output still satisfies the
  runner's own `outputSchema`. A future entity-only regression would pass the suite.
- **Smallest repair:** Add `expectValidates(stellarEcosystemDigest, out, ["lumenloop.search_content_semantic","lumenloop.list_documents"])`
  to the new test. Optionally add one entity-mode row with `created_at` and assert `date: null`.

### F4 — Low. The round ledger does not satisfy the evidence-contract brief fields

- **Location:** `.agents/rounds/2026-09-02-av-runtime-date-semantics.md`, "Evidence and
  hypothesis" and "Decision scorecard".
- **Evidence:** `references/evidence-contract.md` requires two unrelated targets, at least six
  symmetric controls for a product change, model roles, and the author and reviewer names. The
  brief names one target, three controls, and no roles or names. The "Finding" row in the
  evidence-contract table records the pre-change defect only. Five scorecard rows are still
  "pending", and "Status" is "implementation in progress".
- **Consequence:** A later reader cannot tell which contract items were judged not applicable and
  which were missed. The ledger cannot close in its current form.
- **Smallest repair:** Mark the missing brief items "not applicable: deterministic $0 code
  change" or supply them. Record author, reviewer lane (Fable 5, high), and this report's path.
  Fill every "pending" scorecard row with the gate results. Delete the TODO item in the same commit
  that lands the change, per the prior review's M1 precedent.

### Observation — out of scope. `eval/qa/evidence-pack.mjs` still dates any row from `created_at`

- **Location:** `eval/qa/evidence-pack.mjs:315-326`, `sourceDate`.
- **Evidence:** The generic fallback reads `created_at` for every source row, including A/V rows.
  The prior closure review stated the digest runner was the only remaining own-repo use.
- **Consequence:** A QA evidence pack can show an A/V ingest date as the source date. This is an
  eval instrument, not product, and is not part of this change.
- **Smallest repair:** None here. File a `.agents/TODO.md` item under "Eval instruments" so the
  packer either omits A/V `created_at` or labels the field.

## Material preserved correctly

- The existing date-desc comparator, dedup key, and per-section degradation are untouched.
- The runner docblock remains true. "date-desc (undated last)" now also describes A/V rows.
- `research/services/lumenloop.md:95-97` still records the upstream per-collection fields and the
  `created_at` contradiction. It remains the canonical owner of the upstream observation.
- The catalog description "dated, cited digest" remains true for articles, events, and research.

## Residual risks and exclusions

- `npm run build` was not run by the reviewer. Reason above. The author's planned verification
  list includes it.
- The semantic fixture's A/V row is a weekly developer meeting whose `created_at` matches the date
  in its title. The field sometimes equals the recording date. The change drops that signal too.
  This is consistent with the TODO's "undated or dated only from a verified recording field" and is
  not a finding.
- Upstream issue `lumenloop/lumenloop-backend#35` (ll-019) is the only path to a verified A/V
  recording date. If upstream adds such a field, `itemDate` needs a forward-only update.
