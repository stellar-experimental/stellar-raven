# Independent final audit: branch `next/repo-tooling-recovery` through `f33b755`

- Reviewer: Claude Fable 5, high effort. Independent of every commit author and of the repair lane.
- Date: 2026-08-30
- Mode: audit only. No repository file was edited. No paid eval, deploy, push, or merge ran.
- Scope: the full branch `014a4e7..f33b755` (14 commits, 60 files, +6285/−199), plus the code, docs,
  ledger, and ADRs that the diff depends on.
- Prior reports rechecked: `/tmp/repo-recovery-receipt-fable-review.md`,
  `/tmp/repo-recovery-receipt-grok-review.md`, `/tmp/repo-recovery-receipt-grok-final.md`,
  `/tmp/repo-recovery-review-repair-terra.md`.
- Rubric: `AGENTS.md`, `.agents/skills/audit-reviewability/SKILL.md`, and
  `references/audit-rubric.md`.

## Verdict

**CHANGES-REQUESTED.** The mechanism is correct, host-owned, one-use, and well tested. Every
prior finding was repaired. Two records still fail the truth gate. One model-facing tool
description still says that everything in `codemode.catalog` is callable. The round ledger deleted
its own pre-registered stop rule instead of recording the deviation. Both repairs are small.

## Blocking findings

### B1. "Everything is callable" survives in a model-facing contract and two docs — High

- `src/mcp/tools.ts:322` (`EXECUTE_DESCRIPTION`, `codemode.catalog` sentence): "Everything listed
  is callable/readable." The same description at `src/mcp/tools.ts:296` says `scout.explainRepo`
  needs a receipt. `codemode.catalog` returns `scout.explainRepo` with
  `discoveryMode: "recovery-only"` (`src/executor/providers.ts:606`), and a direct call is refused
  before dispatch (`src/executor/providers.ts:472-515`).
- `src/executor/providers.ts:594-595` (`catalogEntryView` docblock): "Every entry is
  callable/readable — exposure is filtered at build time (ADR-0003), so there is no policy to
  show." The function now emits `discoveryMode` because there is policy to show.
- `ARCHITECTURE.md:538-539`: "Everything in it is callable/readable — the manifest is pre-filtered
  at build time (ADR-0003), so there is no policy layer to show." This contradicts
  `ARCHITECTURE.md:512-514` and `ARCHITECTURE.md:479-503`.
- `PLAN.md:115`: "a typed entry per callable surface". `src/catalog/types.ts:5` was changed to
  "exposed surface" in this branch; PLAN kept the old word.
- Consequence: the model reads two contradictory rules inside one tool description. The prior
  round rated the identical sentence class blocking (B1, `ARCHITECTURE.md:449`), and the repair
  fixed only that instance.
- Repair: in all four places, say "Everything listed is exposed; a `discoveryMode: "recovery-only"`
  entry needs a host receipt before dispatch (ADR-0009)." Keep the sentences short.

### B2. The ledger rewrote its pre-registered stop rule instead of recording the deviation — High

- `.agents/rounds/2026-08-30-repository-tooling-recovery.md:25-29`, section "Fixed scope and stop
  rules". Commit `ae00292` deleted "It does not change ranking unless three qualifying positive
  misses remain after recovery." and replaced it with "Prompt-only guidance did not enforce the
  later-execute boundary. The receipt design now keeps the operation out of ordinary ranking…".
  See `git diff 892d899..f33b755 -- .agents/rounds/2026-08-30-repository-tooling-recovery.md`.
- The standing task queue still carries the rule: `.agents/TODO.md:139-140` "Consider ranking only
  if at least three qualifying positive misses remain." `.agents/NEXT.md:61-64` says "Build the
  separate frozen 20-case suite before any ranking work."
- What happened: the branch removed `scout.explainRepo` from ranked membership and moved every
  routing total (`eval/gates.json`) after a 0/12 sequence result in which 16/20 answers were
  correct. The pre-registered trigger ("three qualifying positive misses remain after recovery")
  did not fire as written; an operation-order failure fired instead. That may be the right call,
  but the record must show the rule, the deviation, the trigger, and who decided. The prior
  Fable review (B2) asked for exactly this record. The repair erased the rule.
- The "Outcome" section (`.agents/rounds/…:482-496`) is also stale. It says "A replacement paid
  measurement needs separate authorization." The replacement ran (`…:976-990`) and scored 0/12 on
  sequence. No live measurement of the receipt design exists at HEAD. The ledger nowhere states
  plainly that the round's own ship gate (`…:18-21`: at least 10 of 12 positives with accepted
  operation order and grounded answer) is unmet at `f33b755`.
- Consequence: a reader who follows the `eval/gates.json` note pointer finds a record that hides a
  crossed pre-registration and overstates completion. Pre-registration is the frozen suite's
  defense against tuning toward failures (`eval/EVALS.md:128-132`).
- Repair (ledger only; `…:31` forbids task-queue edits in this round):
  1. Restore the deleted sentence verbatim in "Fixed scope and stop rules".
  2. Add a dated "Deviation (2026-08-30)" paragraph under the final section: the rule as written,
     the evidence that fired (0/12 sequence, 16/20 correct, prompt-only guidance failed), the
     decision (ranked-membership removal plus host receipt), the decider, and the note that
     `.agents/TODO.md` and `.agents/NEXT.md` block 4 need owner reconciliation.
  3. Refresh "Outcome": live ship gate unmet at HEAD; receipt design has zero live measurements;
     a third authorized collection is required before promotion.

## Medium findings

### M1. The ledger's final section stops at `ae00292` and keeps its verification only in `/tmp`

- `.agents/rounds/…:976-1001` records the `a92ccf4` re-baseline and names the repair pass, but not:
  the Grok PASS on `ae00292` (`/tmp/repo-recovery-receipt-grok-final.md`), the repair report
  (`/tmp/repo-recovery-review-repair-terra.md`), commit `f33b755`, the verification results at the
  repaired revision (101 files / 1567 tests, smoke 4 / 85, build, secrets scan), or the current
  manifest SHA `efd567d0…324d1`. The earlier "Verification" section (`…:436-480`) reports 100
  files / 1,548 tests from a superseded revision, so a reader sees only stale numbers in the repo.
- Repair: add one short table for `ae00292`/`f33b755` with commands, results, reviewer lane and
  effort, and report paths. Copy the final reports into
  `.agents/rounds/2026-08-30-repository-tooling-recovery/` (precedent:
  `.agents/rounds/2026-08-30-golden-metadata-remainder/review-final-grok.md`).

### M2. Post-authority detours are invited on every Docs execute and no instrument measures them

- `src/policy/recovery-receipt.ts:186-207` and `src/executor/run.ts:448-469`: every execute whose
  ledger holds a non-error `search_rpc_horizon_data_docs`, `search_sdk_cli_tools_docs`, or
  `search_soroban_contract_docs` call performs an HMAC and an R2 conditional PUT in the request
  path and appends the `--- RECOVERY RECEIPT ---` block, including after a sufficient Docs result.
- `eval/repo-recovery/contract.mjs:263-280` (`negativePrematureDetour`) flags `scout.explainRepo`
  only when it precedes the authority call. A detour in a later execute after sufficient Docs is
  not a detour under the frozen contract. The suite therefore cannot see the new failure mode that
  the receipt block creates.
- ARCHITECTURE documents the design choice (`ARCHITECTURE.md:485-487`), so this is not a hidden
  contract. It is an unmeasured product risk plus one R2 Class A write per qualifying execute.
- Repair: do not change the frozen contract. Record the gap in the ledger and
  `eval/repo-recovery/README.md`. Rely on the pre-registered telemetry band
  (`.agents/rounds/…:99-111`, `scout.explainRepo` share 0–5%) and add a `recovery_receipt`
  `outcome: "consumed"` event so the post-deploy consume rate is observable. Consider minting only
  when the Docs call was `soft-empty` or returned zero rows once that host observation exists.

### M3. The frozen suite's identity pin is self-referential

- `eval/repo-recovery/lint.mjs:620-625` compares `suite.contractProvenance.caseContentDigest` and
  `orderedIdsDigest` to digests computed from the same file. `test/repo-recovery.test.mjs:787-788`
  repeats that self-comparison. `contract.mjs` holds no literal expected digest. The only
  out-of-file copy of `5dee4166…5534` is prose in the ledger (`.agents/rounds/…:48`).
- Consequence: an edit to a case plus a recompute of the two `contractProvenance` lines keeps
  lint, `npm test`, `measure`, and `grade` green under the unchanged contract name. The README
  promise "Change either digest only with a new contract version" (`README.md:9`) is not
  enforced. Routing pins its inputs in a separate committed file (`eval/gates.json`); this lane
  does not.
- Repair: export the two frozen digest strings from `contract.mjs` and compare the computed values
  against them in `lintSuite`. A case edit then needs a visible `contract.mjs` change.

### M4. The lane README omits the only paid entry point and its flags

- `eval/repo-recovery/README.md` never shows `npm run eval:repo-recovery:collect`. `collect.mjs`
  parses `--suite`, `--server-revision`, `--max-paid-calls`, `--max-budget-usd`, `--output`,
  `--port`, `--model`, `--expect-sha256`, `--expect-agent-binary-sha256`, `--collector-author`,
  and `--orchestrator`. The only documented invocation is in the ledger (`.agents/rounds/…:171-181`).
- Consequence: the README presents itself as the operator contract but omits the paid command,
  the exact `$30.00` cap rule, and the 1..40 call cap.
- Repair: copy the ledger's command block into the README with each required flag.

## Low findings

- **L1.** `.agents/rounds/…:38` calls `/tmp/repo-recovery-truth-review.md` "the durable report".
  `/tmp` is not durable; the repo ran a temporary-artifact audit on 2026-08-27 for this reason.
  Copy the report into the round directory or drop the word "durable".
- **L2.** `eval/gates.json` note and `eval/README.md:1101-1110` omit two accepted-total moves:
  holdout `cardHit5` 25 → 26 and `passed` 21 → 22 (`eval/gates.json:47-50`). Add one clause.
- **L3.** `README.md:114` documents `MCP_SERVER_SECRET` only as the subject pepper. It now also
  signs recovery receipts (`src/executor/run.ts:392-393`). Add one sentence: rotating the secret
  invalidates outstanding receipts, which expire within five minutes anyway.
- **L4.** `scripts/build-catalog.mjs:1024-1045` (`attachDiscoveryModes`) has two throw paths with
  no test; only the loader guards in `src/catalog/search.ts:259-331` are tested
  (`test/catalog.test.ts:42-66`). Add two small cases.
- **L5.** `test/recovery-receipt.test.ts:582` is titled "rejects another identity, target, expiry,
  alteration, and version", but the version case (`:615-623`) expects `invalid`, not `version`,
  because HMAC verification now runs first. The `version` reason is reachable only for a
  host-signed receipt from an older version. Rename the case or add a signed-version fixture.
- **L6.** `src/mcp/tools.ts:296-322`: the `## Rules` header and its first bullet moved above the
  worked example to satisfy the 2 KB clipped-prefix test (`test/mcp-instructions.test.ts:199-200`).
  The remaining rule bullets now follow the envelope paragraph, so the list is split in two. Move
  the whole block or retitle the trailing bullets.
- **L7.** `.agents/skills/run-evals/SKILL.md` lists every instrument except the new
  `eval:repo-recovery*` lane. `AGENTS.md` names the skill as the gate authority. Add one row that
  points to `eval/repo-recovery/README.md`.
- **L8.** `test/repo-recovery-collector.test.mjs:344-378` ("projects readiness envelopes before
  Raven serializes the execute result") returns a serialization error only when the generated code
  contains `response: await`. No committed `collect.mjs` on this branch ever contained that string
  (`git log -p` count 0), so the branch under test never runs. Return the error envelope
  unconditionally and assert the recorded `reason`.
- **L9.** `eval/repo-recovery/artifact.mjs:394-399` accepts any collected operation whose `id`
  equals `initialEvidence.id`, but `contract.mjs:238` grades the first occurrence. If a row has two
  Docs calls and the reviewer annotates the second, `sequencePass` is false with no reason. Require
  the first occurrence at join time, or grade the operation that carries `evidence`.
- **L10.** `eval/repo-recovery/contract.mjs:274-278` counts a same-execute `scout.explainRepo` as a
  premature detour even when it follows the authority call in source order.
  `eval/repo-recovery/README.md:158` says only "before Docs or a skill". Add "or in the same
  execute".
- **L11.** `test/repo-recovery.test.mjs:819` ("rejects raw collections and same-execute recovery")
  deletes `artifactSchema` from a reviewed artifact, not a raw collection; the same-execute
  mutation also breaks embedded integrity, and the test asserts only `positivePasses === 11`. The
  rule is still proven; rename the case.
- **L12.** Duplicated definitions across `contract.mjs` and `artifact.mjs`: schema constants
  (`contract.mjs:203-205` vs `artifact.mjs:6-8`), `EVIDENCE_OUTCOMES`/`REVIEW_EFFORTS`, `sha256`,
  and the reviewer-overlap predicate (`contract.mjs:294-300` vs `artifact.mjs:364-366`);
  `argValue`/`requiredArg` are byte-identical in `collect.mjs` and `review-results.mjs:11-24`. A
  change to one copy desynchronizes the join step from the grader. Export once from
  `contract.mjs`.
- **L13.** Cost cap: `assertRecoveryBudget` runs only in `collect.mjs` `main()`; the exported
  `collectRepositoryRecovery` accepts any `maxBudgetUsd`, and `authorizeSpend` hands the full
  remaining budget to each call. The README sentence "The collector CLI rejects any other cap"
  (`README.md:186`) is accurate but narrow. State that the API is test-only, or move the assertion
  inside.
- **L14.** `eval/repo-recovery/README.md:29` says "exact MCP tool inputs and results"; search
  results are projected (`eval/qa/run-qa.mjs:695-720`). Say "exact execute inputs and results, and
  projected search results".

## Prior finding recheck

| Prior finding | Status at `f33b755` | Evidence |
| --- | --- | --- |
| Fable B1 `ARCHITECTURE.md:449` false "nothing callable can be policy-refused" | Fixed | `ARCHITECTURE.md:448-450` now names the `"error"` kind and §4. Same class remains elsewhere → new B1. |
| Fable B2 gate note pointed at a ledger that denied the re-baseline | Fixed in substance, defective in form | `.agents/rounds/…:976-1001` records the trigger and totals; the stop rule was deleted rather than annotated → new B2. |
| Fable B3 ADR-0003 forbade the design; no ADR-0009 | Fixed | `research/decisions/0009-…md` accepted; ADR-0003 status, item 3, item 4, correction rule, and a 2026-08-30 amendment all point to it. |
| Fable M1 stale "except source-code corroboration" | Fixed | `src/mcp/tools.ts:463` "These hits are composable. Repository detail is separate: …". |
| Fable M2 no channel names qualifying sources | Fixed | `qualifyingSources` in `describeCatalogEntry` (`src/executor/providers.ts:640-642`); rule names RPC/SDK/Soroban search; unit test at `test/executor-providers.test.ts:198-209`. |
| Fable M3 minting ignores edge `on` with no artifact | Fixed | Comment at `src/policy/recovery-receipt.ts:190-191`; `ARCHITECTURE.md:485-487`; block text "If its Docs result was empty or adjacent". Residual product risk → M2. |
| Fable M4 duplicated receipt block | Fixed | `recoveryReceiptBlock` in `src/policy/recovery-receipt.ts:246-256`, used by `src/mcp/tools.ts:607` and `src/demo/tools.ts:561`. |
| Fable M5 "same-execute" listed as a consume rejection | Fixed | `ARCHITECTURE.md:500-501`; `requestId` comment at `src/policy/recovery-receipt.ts:17`. |
| Fable L1 misleading second-attempt message | Fixed | `src/executor/providers.ts:476`. |
| Fable L2 `RANKED_AUTHORITY_REPOSITORY_RULE` | Fixed | Renamed `AUTHORITY_REPOSITORY_RULE` (`src/mcp/tools.ts:259`). |
| Fable L3 no denial reason in logs | Fixed | `logEvent("recovery_receipt", { outcome: "denied", reason, target })` at `src/executor/providers.ts:511`; test proves the receipt string is absent. |
| Fable L4 two overclaiming test names | Fixed | `test/executor-providers.test.ts:272`, `test/server.test.ts:1243`. |
| Fable L5 no `x-discovery-mode` assertion | Fixed | `test/super-spec.test.ts:135`. |
| Fable L6 free gate overstated | Fixed | `eval/EVALS.md:29` and `eval/repo-recovery/README.md:18-20, 151-156`. |
| Fable L7 R2 `*` wildcard assumption | Fixed | Comment at `src/policy/recovery-receipt.ts:227`. |
| Grok residual 1 version check before HMAC | Fixed | `src/policy/recovery-receipt.ts:170-172`. |
| Grok residual 2 micro-map named `scout.explainRepo` | Fixed | `scripts/catalog-data/workflow-archetypes.mjs:185-189`; regenerated `src/mcp/micro-map.ts` reproduces byte-identical. |
| Grok residual 3 receipt does not bind `repo` | Open by design | ADR-0009 lists the bound fields; checkpoint text requires one exact owner/name. Acceptable. |
| Grok residual 4 sandbox throw after Docs issues no receipt | Open by design | Fail-closed. Acceptable. |
| Grok residual 5 playground `demo:` namespace | Open by design | Receipts do not cross surfaces. Acceptable. |
| Grok final residual 1 ADR-0003 amendment said search visibility unaltered | Fixed | `f33b755`; `research/decisions/0003-…md:188-190`. |
| Terra residual: bucket lifecycle rule not in repo | Still unverified | `wrangler.jsonc:55-56` comment only. Logical expiry is signed, so this is retention hygiene. |

## Standards, spec, and architecture review

- **Manifest is the surface (ADR-0003):** exposure still comes from the build. `discoveryMode` is
  manifest data (`scripts/catalog-data/discovery-modes.mjs`, `attachDiscoveryModes`), validated at
  build and at load. No model code owns the gate. `assertNoNonExposedRefs` still runs on
  `npm test`; the micro-map no longer names the operation.
- **Forward-only:** no shim, no dual format, no deprecated path. `execute` gained one optional
  field. The `"denied"` kind stayed absent.
- **Secrets host-side:** `MCP_SERVER_SECRET` reaches `RecoverySandboxDeps` only inside
  `buildOpsFns`; `globalOutbound` is unchanged; the sandbox never sees the secret or the receipt
  state. Denial logs carry reason and target only.
- **Receipt correctness:** HMAC-SHA256 with a domain prefix; strict payload key set; identity
  stored as an HMAC binding; expiry must equal issue + 5 min; 30 s future-skew guard; HMAC checked
  before version; R2 `head` then `put` with `etagMatches` for one winner; marker digest bound to
  the encoded payload. `recoveryAttempted` is set synchronously before the first `await`, so
  `Promise.all` cannot spend two attempts in one isolate.
- **Ordering:** receipts mint only after the Dynamic Worker returns without error, so code in the
  authority execute cannot use them. The real-isolate smoke test proves direct refusal,
  same-execute refusal, one later success, and replay refusal.
- **Search contract:** ranked hits, `total`, `widerCandidates`, and broad anchors exclude the
  operation; exact `recoverFrom`, `codemode.describe`, `codemode.catalog`, and the super-spec keep
  it. Demo sample "4 of 17 matches" matches the committed manifest (unchanged since `a92ccf4`).
- **ADR coherence:** ADR-0009 states the invariant positively. ADR-0003 is amended in four places
  and its ban now reads "generic runtime allow/deny layer". ADR-0007's ranking invariant describes
  the wider-candidate mechanism, not a global promise; it is not contradicted. `PLAN.md` and
  `ARCHITECTURE.md` §1, §3, §4, §7 are present-state except for B1.
- **Reviewability:** `git diff --check` clean; no TODOs, session narrative, or rejected-design
  prose in source. New comments state contracts. Commit `a92ccf4` still has a one-line message for
  a 34-file change; `ae00292` carries a body. Note for the PR description.

## Test claims

- Every test named in the four prior reports exists and asserts what its title says after the
  `ae00292` renames.
- `test/mcp-instructions.test.ts:437-448` asserts description text added by the same change. This
  follows the repo's existing "load-bearing phrase" convention for the 2 KB budget; observation,
  not a finding.
- `test/repo-recovery.test.mjs` grades synthetic reviewed artifacts through the real
  `gradeResults`, `buildReviewedArtifact`, and `lintSuite`; it is behavior-level, including the
  same-execute false-negative boundary (`:819-829`).
- `test/repo-recovery-cost.test.mjs` pins plan constants and calls the real `assertRecoveryBudget`.
  It is a constants pin by design; acceptable because the constants are the reviewed method.

## Generated artifacts

- `catalog/manifest.json` sha256 `efd567d04ed0b00d27d0a664ab2d225d04362e657f1661ae7cfab330e89324d1`
  matches `eval/gates.json`. All four `evidence.inputs` hashes MATCH.
- `node scripts/build-micro-map.mjs` and `node scripts/build-super-spec.mjs` rewrote their outputs
  byte-identical (`git status` clean afterward). `npm run build` (prebuild + dry-run) also left the
  tree clean.
- `catalog/manifest.json` diff is limited to `discoveryMode`, `searchable:false`, and the three
  reordered `source-code` edges; `specs/super-spec.json` diff is one `x-discovery-mode` key.

## Frozen eval integrity

- `eval/routing-cases.json`, `eval/holdout-cases.json`, `eval/skills-cases.json`,
  `eval/qa/corpus/**`, and `eval/corpus/**` have no diff against `014a4e7`.
- `eval/repo-recovery/cases.json` was written once in `ffd5ba6` and never touched again; its
  content digest `5dee4166…5534` and ordered-ID digest `1883592c…115f` match the ledger and the
  measure output.
- `eval/qa/run-qa.mjs` changed only by exporting three existing functions; no behavior change.
- `eval/gates.json` moved legacy 208/279/311 → 209/280/312 and holdout 10/22/25 → 11/23/26 with a
  new baseline stamp and manifest hash in one commit. Routing gate PASS against committed evidence.
  Advancing holdout floors on an improvement is the strict direction; recorded in `eval/README.md`.

## Secrets

- `npm run secrets:scan -- --tree`: clean, gitleaks no leaks.
- No receipt string, key, or token appears in committed files. Denial and issuance logs omit
  receipt content (tested). `eval/repo-recovery/results/` is gitignored.

## Verification run (this audit, read-only)

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | 101 files, 1567 tests, PASS |
| `npm run test:smoke` | 4 files, 85 tests, PASS |
| `npm run build` | PASS (dry-run), tree clean |
| `npm run eval:repo-recovery:lint` | PASS — 12 positive, 8 negative |
| `npm run eval:repo-recovery -- --gate` | PASS — 12/12 eligible, 0 leaks, 0 rank risks |
| `npm run eval:routing -- --gate` | GATE PASS, baseline `2026-08-30T20:57:46.024Z`, committed evidence verified; local trace `routing-2026-08-30T21-35-41-666Z.json` (gitignored) |
| `npm run secrets:scan -- --tree` | clean |
| `git diff --check 014a4e7...f33b755` | clean |
| Manifest sha256 vs `eval/gates.json` | match; all evidence inputs MATCH |
| `build-micro-map.mjs`, `build-super-spec.mjs` regeneration | byte-identical |
| Frozen corpora diff vs `014a4e7` | none |

No paid command ran. `npm run build:catalog` was not run (needs the skill mirror); the committed
manifest is covered by the hash match and the determinism tests.

## Collector and artifact lane

A delegated read-only sub-review covered `eval/repo-recovery/collect.mjs`, `artifact.mjs`,
`contract.mjs`, `cases.json`, the four `test/repo-recovery-*.test.mjs` files, and the three new
exports in `eval/qa/run-qa.mjs`. I spot-checked its material claims (M3, M4, L8, L9, L10) against
the source before including them above. Verified correct:

- **Identity at grade time:** `gradeResults` (`contract.mjs:450-454`) and
  `assertReviewedArtifactIntegrity` (`contract.mjs:314-319`) require the result, the embedded
  collection, and the reviewed identity to match the loaded suite. No path grades rows against a
  different corpus identity.
- **Cost cap:** `$30.00` hard cap with a derivation that matches the ledger; per-call
  `authorizeSpend`/`recordSpend`; call cap 1..40; missing cost and over-authorization throw. The
  collector tests exercise the real ledger stop paths.
- **Sequence gate:** `executeCallIndex` is the 1-based tool-call ordinal across the transcript, so
  `explainCall.executeCallIndex > initialCall.executeCallIndex` (`contract.mjs:251`) is strictly a
  later execute. Exactly one `scout.explainRepo`, after the first Docs call, with
  `args.repo === caseEntry.repository`, and a reviewer outcome equal to the frozen label. No
  off-by-one.
- **Receipt capture:** execute inputs are stored whole, so a top-level `recoveryReceipt` is visible
  to the reviewer by `executeCallIndex`. The grader does not check for it; the README attributes
  receipt enforcement to unit and smoke suites, which is correct.
- **Secrets:** `eval/repo-recovery/results/` is gitignored (`.gitignore:35`). Environment identity
  stores names and one hash, never values; stderr is stored as chars, sha256, and a redacted
  excerpt; readiness stores ids, outcome, error kind, status, and a body hash only. No credential
  appears in any committed file on the branch.
- **`run-qa.mjs`:** the three functions changed only from `function` to `export function`.
- **README commands:** `lint`, `measure -- --gate`, `review -- --prepare`, `review -- --annotations
  --output`, and `grade -- <results.json> --gate` all exist and parse as documented. Only the paid
  `collect` command is undocumented (M4).
- **Focused tests:** `npx vitest run` on the four files — 4 files, 30 tests, PASS.

## Required changes

1. Fix the four "callable" sentences (B1).
2. Restore the deleted stop rule, add the dated deviation record, and refresh the ledger Outcome
   (B2).
3. Then M1–M4 and L1–L14 as time allows. M1 and L1 belong in the same ledger edit as B2. M3 is
   the one change that strengthens the frozen-suite guarantee and should not wait for a later round.

**CHANGES-REQUESTED**
