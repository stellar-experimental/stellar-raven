# Final code gate: reviewability audit of 848edec4..d4cac5a9

- Mode: audit (no edits). Fixed point: `848edec4..d4cac5a9` in `/private/tmp/raven-routing-audit-2026-09-17/repo`, clean tree.
- Skill: `audit-reviewability`; rubric read in full.
- Scope: all 27 changed files. Read in full: `src/catalog/search.ts`, `test/drift-141-routing.test.ts`,
  `test/eval-discovery-cases.test.mjs`, `eval/discovery/{cases.json,lib.mjs,run-discovery.mjs}`, `eval/EVALS.md`,
  `.agents/NEXT.md`, `.agents/skills/run-evals/SKILL.md`, the round ledger, the experiment brief, and the committed review
  copies. Excluded by instruction: raw live-probe and evidence JSON contents already scanned (`live-probes-*`, `live-skills`,
  `probe-plan`, `surface-ledger`, `coverage-map`, `runtime-benchmark`, `discovery-repair.json`, `initial-pins`); only their
  placement and size were assessed. No fresh result cases inspected. No server, spend, or edit.
- Validation run by the reviewer on the candidate: `git diff --check` clean; `npm run typecheck` passes;
  `test/drift-141-routing.test.ts` 65 passed / 3 skipped; `test/eval-discovery-cases.test.mjs` 5 passed. Root reports the
  full suites (2,172 unit, 94 smoke, routing gate) passing.

## Verdict

**Pass with two medium findings, both outside runtime and measurement bytes.** The production deletion is exact, has no
compatibility residue, and leaves no dead helper. The measurement repair consolidates validation into one owner. Documentation
edits are accurate. Neither medium finding blocks the paid run, because the arms pin only runtime and measurement files;
both should be fixed before merge to `main`.

## Findings (severity order)

### M1. Evidence JSON committed under `.agents/rounds/` against the repository's own routing rule (Medium, scope and locality)
- Evidence: commit `d4cac5a9` adds 7,589 of the change's 8,229 inserted lines as JSON under
  `.agents/rounds/2026-09-17-routing-audit/` (coverage map, six live-probe files, probe plan, surface ledger, runtime
  benchmark, discovery repair record). `.agents/README.md:31` routes "evidence from a dated investigation" to
  `research/audits/` or `eval/qa/reviewed/`, and `:10` defines `rounds/` as "one dated ledger per multi-lane round".
- Consequence: 92% of the diff is evidence that a reviewer must scroll past to find the behavioral change, and it lands in
  the directory the repository reserves for ledgers. Future readers will look in `research/audits/` and not find it.
- Repair (one follow-up commit, no content change): move the JSON evidence to
  `research/audits/2026-09-17-routing-audit/` and update the ledger links; keep the ledger, brief, and review copies in
  `rounds/`. Alternatively keep large probe dumps local and gitignored, committing only `surface-ledger.json` and the
  repair record with their hashes in the ledger.

### M2. Two review copies in the round directory are frozen snapshots that now misstate status (Medium, one truth owner)
- Evidence: `.agents/rounds/2026-09-17-routing-audit/d3-review.md` (162 lines) still carries "Laundering finding (must fix
  before merge)" and "Blocking (test contract)" with no resolution marker; the resolution (assertion deleted in
  `d4cac5a9`) is recorded only in the ledger. `paid-plan-review.md` (43 lines) is the pre-reconciliation snapshot; the
  durable record at `/tmp/raven-routing-audit-2026-09-17/paid-plan-review.md` has sections 7-11 (reconciliation,
  environment pin, realpath correction, approvals). Two owners for one fact will drift further as the round proceeds.
- Consequence: a reader of the committed review alone sees an open blocker and an unreconciled plan.
- Repair: at round close, replace both copies with their final versions, or add a two-line status header to each
  ("Resolved in `d4cac5a9`; see the ledger") and point to the final record. Do not edit the reviews' historical findings.

### L1. Remaining pre-scoring admission gate is undocumented in ARCHITECTURE §2 (Low, pre-existing)
- Evidence: `rejectsRoutingIntent` (`search.ts:439-467`) still admits or rejects a Scout operation before scoring by notFor
  coverage, two positive phrase tokens, two enum witnesses, a dense routing-vocabulary witness, or an identity token.
  `ARCHITECTURE.md` §2 mentions only that the builder excludes `notFor` (line 220) and never names the gate. This gap
  predates the diff; the deletion introduced no false statement.
- Repair: one bullet under "Structural wrappers" naming the gate and its four admission witnesses, as a separate docs change.

### L2. Fixture comment reuses the deleted rule's vocabulary (Low)
- Evidence: `test/drift-141-routing.test.ts:277` says each domain "repeats a catalog-unique entity token in useWhen and
  exampleQuestions". "Catalog-unique" was the deleted rule's term; the invariant the suite tests is placement independence.
- Repair: reword to "an entity token that appears only in this entry, placed in useWhen and exampleQuestions", so the
  fixture rationale stands without the removed concept. Optional.

### L3. Instruction names an unnamed artifact (Low)
- Evidence: `.agents/skills/run-evals/SKILL.md` now says "read current membership from the generated registry" without
  naming it. The registry is `eval/qa/lifecycle-registry.json`.
- Repair: name the file once. The removal of the stale denominator narrative is otherwise an improvement.

## Verified clean (no finding)

- Production deletion (`181d5b0f`): removes `discriminativeDirectoryVocabularyCoverage`, `discriminativeRoutingTokens`
  and its cache, `GENERIC_ROUTING_ACTION_TOKENS`, and the `discriminativeTokens` parameter thread. `completeInputEnumWitnesses`
  returns a count; its only remaining caller keeps `>= 2`. `canonicalRoutingToken` and `tokensOverlap` remain used. No
  flag, shim, fallback, or replacement threshold. No bespoke entity or query logic introduced.
- Test contract: the real-query absence assertion is gone; three positive Soroswap rows remain with an accurate title; the
  synthetic suite fails 9 assertions on baseline and passes on candidate; RWA controls activate on `exposesRwa` rather than
  an environment variable, and the exclusion test still holds on the shipped manifest.
- Measurement repair: 24 cases changed, 29 dispositions (17 removals, 12 whole-skill replacements), each with a body-check
  reason; no question changed; both arms use one file. `loadDiscoveryCases` is now the single validator (ids, families,
  ops, searchable membership); `run-discovery.mjs` reuses it and keeps only seed and groundTruth checks. The four case
  notes containing "#" refer to issue numbers, not skill sections.
- Docs: `eval/EVALS.md` 501-case denominator and the added id are correct; `.agents/NEXT.md` matches the ledger and
  production state; `.agents/skills/run-evals/SKILL.md` replaces a stale history with a present-state rule.
- Records: the committed ledger and brief carry no holdout or challenge question text or id; the ledger's "29 section
  references" matches the repair record.
- Hygiene: no whitespace errors; no unrelated edits inside the runtime or measurement files.

## Exclusions and residual risk

- Raw probe and evidence JSON contents were not re-read (excluded by instruction).
- Fresh result cases were not inspected; that belongs to the later result review.
- The reviewer ran no server and made no paid call.
