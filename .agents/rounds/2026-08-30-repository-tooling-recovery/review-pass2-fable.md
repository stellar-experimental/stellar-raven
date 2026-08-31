# Independent audit, pass 2: branch `next/repo-tooling-recovery` through `ca88ab9`

- Reviewer: Claude Fable 5, high effort. Independent of every commit author and of the repair lane.
- Date: 2026-08-30
- Mode: audit only. No repository file was edited. No paid eval, deploy, push, or merge ran.
- Scope: the full branch `014a4e7..ca88ab9` (15 commits, 74 files, +7796/−227), with the code,
  docs, ledger, ADRs, generated artifacts, frozen suites, and telemetry paths that the diff touches.
- Prior report rechecked: `/tmp/repo-recovery-receipt-fable-final.md` (B1–B2, M1–M2, L1–L7 as
  requested; M3–M4 and L8–L14 rechecked for status only).
- Rubric: `AGENTS.md`, `.agents/skills/audit-reviewability/SKILL.md`, and
  `references/audit-rubric.md`.
- Worktree state: clean before and after this audit. The only new local file is the gitignored
  routing trace `eval/results/routing-2026-08-30T21-55-20-746Z.json`.

## Verdict

**PASS.** Commit `ca88ab9` repairs every requested finding. Both blocking findings from the prior
pass are closed. The code, tests, docs, ledger, preserved reports, generated artifacts, frozen
suites, and telemetry paths are consistent with each other. This pass found no blocking finding.
It found one Medium ledger defect and four Low items. None of them changes code or contracts.

## Blocking findings

None.

## Recheck of the prior findings

| Prior finding | Status at `ca88ab9` | Evidence |
| --- | --- | --- |
| **B1** "Everything is callable" in one tool description and three docs | **Fixed** | `src/mcp/tools.ts:302` now reads "Everything listed is exposed. An entry with `discoveryMode: "recovery-only"` needs a host receipt before dispatch (ADR-0009)." `src/executor/providers.ts:599-600` (`catalogEntryView` docblock), `ARCHITECTURE.md:538-539`, and `PLAN.md:115-117` carry the same sentence. A repo-wide grep for `callable/readable`, `callable surface`, and `no policy to show` finds no other model-facing or present-state instance (see L3 below for one build-script comment). |
| **B2** Ledger deleted its pre-registered stop rule | **Fixed** | `.agents/rounds/2026-08-30-repository-tooling-recovery.md:28` restores the sentence byte-for-byte against `892d899`. `…:1008-1016` adds "Deviation (2026-08-30)": the rule as written, the evidence that fired (0/12 sequence, 16/20 correct, prompt-only guidance failed), the decision, the decider (user approval), no frozen-case change, and the note that `.agents/TODO.md` and `.agents/NEXT.md` block 4 need owner reconciliation. `…:483-502` "Outcome" now states: live ship gate unmet at HEAD, receipt design has zero live measurements, third authorized collection required. Neither queue file changed on the branch (`git diff 014a4e7..ca88ab9 -- .agents/TODO.md .agents/NEXT.md` is empty). |
| **M1** Ledger stopped at `ae00292`; verification lived only in `/tmp` | **Fixed** | `…:1025-1031` adds a "Current verification" table with commands, results, reviewer lane and effort, and report paths for `ae00292`, `f33b755`, and the repair. Five reports now live in `.agents/rounds/2026-08-30-repository-tooling-recovery/`. `review-final-fable.md`, `repair-terra.md`, and `final-audit-repair-terra.md` are byte-identical to their `/tmp` originals. `review-final-grok.md` and `truth-review.md` differ only by stripped trailing whitespace (`diff -w` is empty). The repair's numbers reproduce: 101 files / 1,570 tests, 4 smoke files / 85 tests, focused 4 files / 145 tests. |
| **M2** Post-authority detours invited and unmeasured | **Fixed as specified** | `src/executor/providers.ts:497-501` logs `recovery_receipt` with `outcome: "consumed"`, `source`, `target` after a successful consume. `test/executor-providers.test.ts:467-506` asserts the exact event and asserts the receipt string is absent. The gap is recorded in `eval/repo-recovery/README.md:157-162` and the ledger `…:1018-1023`, both pointing at the pre-registered 0–5% share band. The frozen contract is unchanged. |
| **L1** `/tmp` called "the durable report" | **Fixed** | `…:39` links `truth-review.md` in the round directory. The copy ends in `PASS` and carries both digests. |
| **L2** Gate note omitted `cardHit5` 25→26 and `passed` 21→22 | **Fixed** | `eval/gates.json` note and `eval/README.md:1109` carry the clause. `eval/gates.json:47-49` holds `cardHit5: 26`, `passed: 22`. |
| **L3** `MCP_SERVER_SECRET` documented only as the subject pepper | **Fixed** | `README.md:115-117`: "This secret also signs recovery receipts. Rotation invalidates outstanding receipts, which expire within five minutes." |
| **L4** `attachDiscoveryModes` throw paths untested | **Fixed** | `test/catalog.test.ts:218-229` covers both throws; the regexes match `scripts/build-catalog.mjs:1029` and `:1037`. `scripts/build-catalog.d.mts:19-22` adds the declaration so the test typechecks. |
| **L5** Test title claimed a `version` case | **Fixed** | `test/recovery-receipt.test.ts:111` now "rejects mismatched identity, target, expiry, and altered receipts". The version mutation stays in the case list under `reason: "invalid"` (`:143-152`), which matches HMAC-first verification. |
| **L6** `## Rules` list split around the worked example | **Fixed** | `src/mcp/tools.ts:298-321` holds every execute rule bullet in one contiguous list. `## Result envelope` follows it, then the worked example, then `UPSTREAM_DOC_LINKS`. The 2 KB clipped-prefix test (`test/mcp-instructions.test.ts:195-204`) still passes. |
| **L7** `run-evals` skill omitted the lane | **Fixed** | `.agents/skills/run-evals/SKILL.md:81` adds the row with both free commands and a pointer to `eval/repo-recovery/README.md`. |
| M3 self-referential digest pin | Open (not requested) | `eval/repo-recovery/lint.mjs:37-41` still compares against digests computed from the same file. `contract.mjs` holds no literal. Frozen suite is unchanged, so this is prospective risk only. |
| M4 paid `collect` command undocumented | Open (not requested) | `eval/repo-recovery/README.md` still shows no `eval:repo-recovery:collect` invocation. |
| L8–L13 | Open (not requested) | `collect.mjs`, `artifact.mjs`, `contract.mjs`, and their tests did not change in `ca88ab9`. |
| L14 README "exact MCP tool inputs and results" | Fixed | `eval/repo-recovery/README.md:29`. |

## Medium findings

### M-A. The ledger still says no paid agent measurement ran

- `.agents/rounds/2026-08-30-repository-tooling-recovery.md:128` ("Product measurements"): "No paid
  agent measurement ran in this round."
- Two paid collections ran and are recorded in the same file: `…:242-247` (`$4.6211474`, invalid)
  and `…:304-315` (`$3.9934568`, 16/20 correct, 0/12 sequence). The "Outcome" section
  (`…:490-493`) reports both.
- Consequence: the sentence is false at HEAD. A reader who stops at "Product measurements" believes
  no paid run happened. This is the same accretive-editing class as the prior B2, but the truth is
  present later in the same record with hashes, so it does not hide a decision.
- Repair (one line, ledger only): replace the sentence with "Paid collections are recorded below."
  or delete it.

## Low findings

### L-A. The verification table labels the repaired revision "Current repair worktree"

- `…:1031`. The row now describes commit `ca88ab9`. The label is not a revision and will be wrong
  after the next commit.
- Repair: replace the label with `` `ca88ab9` ``.

### L-B. The observability skill field list omits the receipt event fields

- `.agents/skills/cloudflare-observability-review/SKILL.md:264-270` enumerates app JSON log fields
  operators query by. `recovery_receipt` emits `outcome`, `source`, `target`, `reason`, and
  `errorName` (`src/executor/providers.ts:497-516`, `src/executor/run.ts:462-467`). None appear.
- Repair: add `outcome`, `source`, `target`, `reason`, `errorName` to that list.

### L-C. One build-script comment keeps the "(callable/readable)" parenthetical

- `scripts/build-catalog.mjs:292-294`: "an entry is either emitted (callable/readable) or it does
  not exist to consumers." The same file attaches `discoveryMode: "recovery-only"` at `:1024-1045`.
  ADR-0003 keeps the same words at `:37` but is amended at `:5`, `:62-63`, `:67-68`, and `:185-190`,
  so the ADR is coherent as a record. The comment is a present-state source comment and is not.
- Repair: "emitted (exposed; a recovery-only entry also needs an ADR-0009 receipt)".

### L-D. Two preserved reports are whitespace-normalized copies

- `review-final-grok.md` and `truth-review.md` lost the trailing double-space hard breaks that the
  `/tmp` originals carry. Words and digests are identical (`diff -w` empty). This is an observation
  for provenance, not a defect; no repair required.

## Verification run (this audit, read-only)

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | 101 files, 1,570 tests, PASS |
| `npm run test:smoke` | 4 files, 85 tests, PASS |
| `npx vitest run test/catalog.test.ts test/executor-providers.test.ts test/recovery-receipt.test.ts test/mcp-instructions.test.ts` | 4 files, 145 tests, PASS |
| `npm run build` | PASS (dry-run); tree clean afterward |
| `npm run eval:repo-recovery:lint` | PASS — 12 positive, 8 negative, `repository-tooling-recovery-v1` |
| `npm run eval:repo-recovery -- --gate` | PASS |
| `npm run eval:routing -- --gate` | GATE PASS; baseline `2026-08-30T20:57:46.024Z`; committed evidence verified |
| `npm run secrets:scan -- --tree` | clean; gitleaks no leaks |
| `git diff --check 014a4e7..ca88ab9` | clean |
| `node scripts/build-micro-map.mjs`, `node scripts/build-super-spec.mjs` | byte-identical; `git status` clean |
| `shasum -a 256 catalog/manifest.json` | `efd567d04ed0b00d27d0a664ab2d225d04362e657f1661ae7cfab330e89324d1`, matches `eval/gates.json` |

No paid command ran. `npm run build:catalog` was not run here; the repair report states it ran
clean, and the manifest hash plus determinism tests cover the committed file.

## Surface-by-surface notes

- **Code.** `ca88ab9` changes runtime code in one place: the `consumed` log line in
  `src/executor/providers.ts:497-501`. It uses fields already on `RecoveryReceiptConsumeResult`
  (`src/policy/recovery-receipt.ts:44-46`). No control-flow change. The receipt gate remains
  manifest-owned, host-enforced, one-use, HMAC-first, and fail-closed.
- **Tests.** Three tests were added; all are behavior-level (two throw paths through the real
  `attachDiscoveryModes`, one log assertion through the real provider dispatch with a real signed
  receipt). One test was renamed to match its cases. Test count 1,567 → 1,570 matches the ledger.
- **Docs.** The four B1 sentences now agree with `ARCHITECTURE.md` §4 ("Recovery-only operation
  receipts"), ADR-0009, and the manifest entry (`catalog/manifest.json:2109`, the only
  `discoveryMode` occurrence). `README.md`, `eval/README.md`, `eval/repo-recovery/README.md`, and
  the `run-evals` skill describe current behavior.
- **Skill text.** The `run-evals` row is a two-cell table row and renders. No skill text carries a
  todo id or run stamp.
- **Ledger truth.** Stop rule restored verbatim; deviation recorded with decider; outcome refreshed;
  verification table present. One stale sentence remains (M-A). The "Fixed scope" line 31
  ("No paid measurement … is authorized") is the pre-registered boundary; the later owner
  authorizations are dated and hash-backed at `…:244` and `…:306`.
- **Preserved review reports.** Five files in the round directory; three byte-identical, two
  whitespace-normalized (L-D). They reference `/tmp` paths as historical provenance, which is
  correct for dated records.
- **Generated artifacts.** `catalog/manifest.json` unchanged since `a92ccf4` (hash match). Micro-map
  and super-spec regenerate byte-identical. `specs/super-spec.json` carries the single
  `x-discovery-mode` key.
- **Frozen eval integrity.** `eval/routing-cases.json`, `eval/holdout-cases.json`,
  `eval/skills-cases.json`, `eval/protocol-history-*.json`, `eval/qa/corpus/**`, and
  `eval/corpus/**` have no diff against `014a4e7`. `eval/repo-recovery/cases.json` has one commit
  (`ffd5ba6`); lint recomputes both digests and they match the ledger and `truth-review.md`.
- **Telemetry secrecy.** Three `recovery_receipt` emitters: `consumed` (outcome, source, target),
  `denied` (outcome, reason, target), `error` (outcome, source, target, errorName). No emitter logs
  the receipt string, nonce, identity, request id, or expiry. Tests assert the receipt string is
  absent from both `consumed` and `denied` events. `logEvent` is a plain `console.log` of the
  fields (`src/observability.ts:25-31`), so the field set is the whole exposure.
- **Reviewability.** The repair diff is scoped to the findings. No session narrative or rejected
  design entered source. `ca88ab9` has a one-line commit message for a 19-file change; note this
  for the PR description alongside `a92ccf4`.

## Remaining risks and deferred work

- Live ship gate unmet at HEAD; receipt design has zero live measurements; a third authorized
  collection is required before promotion (ledger `…:494-496`). Unchanged by this pass.
- M3 (self-referential digest pin) should land before the third collection so a case edit needs a
  visible `contract.mjs` change. It is not blocking because the frozen suite is byte-identical.
- M4 and L8–L13 remain open as recorded in the prior report.
- M-A and L-A through L-C are one-line record and comment fixes. They can ride in the same PR.

**PASS**
