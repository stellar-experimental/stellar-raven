# Independent review: Lumenloop A/V `created_at` semantics

Reviewer: Fable (Claude Code), independent of the author.
Date: 2026-09-02
Fixed point: `main` at `3428631`. Branch `codex/lumenloop-av-semantics` has no commits ahead of
`main`. The whole change is uncommitted: 10 modified files and one untracked ledger.
Mode: audit only. No implementation file was edited. One generated artifact was rebuilt to a
scratch copy for a reproducibility check and the author's bytes were restored.

## Verdict

**FAIL.** Three High findings block the change. The catalog wording itself is correct and
evidence-bounded. The gates around it are not reconciled.

## Verification run

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | FAIL. 4 tests in 2 files. 1626 passed. See H2. |
| `npm run build` | PASS. `src/mcp/micro-map.ts` unchanged after prebuild. |
| `npm run improvements:lint` | PASS. `INDEX.md` matches the generator. |
| `npm run eval:routing -- --gate` (HEAD) | FAIL. Manifest fingerprint mismatch and legacy top-1 213 outside 208 ±3. See H1. |
| `node eval/run-routing.mjs --gate` (main worktree) | PASS. |
| `npm run eval:protocol-history` (HEAD) | FAIL, diagnostic only. 4/8 top-5, controls 2/4. |
| `node eval/run-protocol-history.mjs` (main worktree) | FAIL, diagnostic only. 4/8 top-5, controls 1/4. |
| `npx vitest run test/catalog.test.ts test/super-spec.test.ts` | PASS. 51 tests. Matches the ledger. |
| Catalog and super-spec staleness tests | PASS. `catalog/manifest.json` and `specs/super-spec.json` match their generators byte for byte. |
| Clause artifact rebuild (`npm run eval:vectorize:clauses:build`) | PASS. The pinned model was in the local cache. The rebuild reproduced the author's artifact byte for byte (file SHA-256 `d007f348…`, `vectorsSha256` `22df5ca3…`). The author's file was restored unchanged. |

## Findings

### H1 — High. The routing gate fails and the ledger records no decision.

- Location: `eval/gates.json` (unchanged), `.agents/rounds/2026-09-02-av-created-at-semantics.md`
  "Checks", `catalog/manifest.json:4`.
- Evidence: `npm run eval:routing -- --gate` prints
  `catalog/manifest.json SHA-256 does not match the committed gate evidence` and
  `legacy top1=213 outside ±3 of baseline 208`. CI runs this command
  (`.github/workflows/ci.yml:113`). The ledger says only `Routing gate: FAIL`.
- Standard: `.agents/skills/run-evals/SKILL.md` Step 4. A legitimate move re-baselines
  `gates.json` in the same commit, records the decision in the round ledger, and checks per-case
  hit-to-miss regressions against the zero-regression standard.
- Measured movement, HEAD versus main, same corpus and rule v3:

  | Lane | main | HEAD |
  | --- | --- | --- |
  | legacy 338 top-1 / top-3 / top-5 | 208 / 279 / 311 | 213 / 278 / 312 |
  | extended 122 top-1 / top-3 / top-5 | 90 / 109 / 117 | 90 / 110 / 116 |
  | skills 23 top-1 | 16 | 16 |
  | holdout 49 top-1 / top-3 / top-5, forbidden, passed | 10 / 22 / 25, 11, 21 | 10 / 22 / 26, 11, 21 |

- Per-case hit-to-miss transitions:
  - `q-soroban-av-passkeys-talk` (legacy, expected lumenloop): `lumenloop.find_av_passages`
    moves from rank 1 to rank 5. This is the canonical A/V case for this very operation.
  - `q-ti-video-tutorials` (extended, expected card `lumenloop_find_av_passages`): rank 4 to
    outside top-5.
  - `q-eco-lobstr-wallet`, `q-eco-xbull-wallet` (legacy, expected lumenloop) and
    `q-crp-anchors-by-corridor` (extended, expected lumenloop): the lost hit was
    `find_av_passages` capturing a wallet or anchor question. Those were service-level false
    credits. Losing them is honest.
- Per-case miss-to-hit transitions: 8 legacy cases (`q-sep-38-quotes`, `q-soroban-fee-structure`,
  `q-soroban-instance-storage-dos`, `q-soroban-vuln-classes`,
  `q-token-initial-supply-distribution`, `q-protocol-24-whisk-incident`,
  `q-sep-53-sign-verify-message`, `q-soroban-auth-recursion-dos-audit`), 3 extended cases, and
  `q-holdout-b-01-sep-asset-metadata`. In every one, `find_av_passages` stopped capturing a
  docs, Scout, or skills question at rank 1 to 3. The removed words `quote`, `transcripts`,
  `chunk`, and `embedding` were the promiscuous tokens.
- Consequence: CI is red. The two genuine A/V regressions are unexamined, and the ledger cannot
  show a reader whether they were accepted or missed.
- Smallest repair: choose one and record it in the ledger.
  1. Accept the trade. Re-baseline `eval/gates.json` in the same commit: legacy 213/278/312,
     holdout accepted `top5` 26 and `cardHit5` 26, the manifest SHA-256
     `8394993ce664c59941bd292caf68881893a4f4d4a337aae40de35197bf085d24`, new `baselinedAt`,
     `note`, and `localTrace`. Name the two genuine A/V regressions in the decision text.
  2. Keep the zero-regression standard. Return evidence-true A/V vocabulary to the first
     sentence (for example "talk", "podcast", "video", "recorded") without the false
     `quote`/`transcript`-text claims, re-run the gate, and re-baseline only the remaining
     movement.

### H2 — High. `npm test` fails on stale clause-artifact pins.

- Location: `eval/vectorize/rerank-config.mjs:18-19`,
  `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`.
- Evidence: `test/eval-vectorize-rerank-fit.test.mjs` (3 tests) and
  `test/eval-vectorize-support-fit.test.mjs` (1 test) throw
  `clause artifact file SHA-256 drift` at `eval/vectorize/rerank-retrieval.mjs:13`. The artifact
  was rebuilt against the new manifest (`inputs.manifestSha256` `8394993c…`, `clauseSetSha256`
  `15b7a522…`, `vectorsSha256` `22df5ca3…`). The pins still hold the old file SHA-256
  `e5f86644…` and clause-set SHA-256 `cc5df2e4…`.
- Standard: `AGENTS.md` "Commands and verification" names `npm test` as baseline validation.
  `.github/workflows/ci.yml:86` runs it.
- Consequence: CI is red. The frozen cross-encoder and support instruments no longer load.
- Smallest repair: update `CLAUSE_ARTIFACT_SHA256` to
  `d007f3487d28e2e959cfe7c5552e4aa5c72b17016feba45e136dff296a73c468` (the committed artifact
  bytes, reproduced by this review) and `CLAUSE_SET_SHA256` to `15b7a5220ae230c4596098c4a92b8362b67d1b6887f42ac1c2f1163286216b6c`,
  then re-run `npm test`. The 2026-08-31 cross-encoder result stays attached to the old clause
  set through the hashes recorded in `eval/vectorize/README.md:230-231`; state in the ledger
  that the instrument is re-pinned to the new clause set.

### H3 — High. The ledger contradicts the tree.

- Location: `.agents/rounds/2026-09-02-av-created-at-semantics.md` "Checks".
- Evidence: the ledger says `Vector artifact: blocked` and that the model fetch failed. The
  tree carries a rebuilt artifact. The model cache
  `node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394…`
  was written at 13:08, the artifact at 13:13, and the ledger last at 13:11. The ledger also
  omits `npm run typecheck`, `npm test`, `npm run build`, and `npm run improvements:lint`. It
  reports only the two focused test files.
- Standard: `AGENTS.md` "Definition of done": failures are reported, not hidden.
  `.agents/README.md`: ledgers record what happened.
- Consequence: a reader cannot tell which gates ran, or that `npm test` fails.
- Smallest repair: rewrite "Checks" with the real sequence: model fetched, artifact rebuilt,
  pins updated (after H2), and the full baseline command results.

### M1 — Medium. The originating TODO item is neither closed nor fully met.

- Location: `.agents/TODO.md` "Correct Lumenloop A/V `created_at` semantics" (the
  "Catalog correctness" section).
- Evidence: the item is untouched in the diff. Its "Done when" has four parts. Three are met:
  the owning source (`scripts/catalog-data/model-contract-corrections.mjs`) describes the field
  from verified semantics, generated outputs are rebuilt, and focused tests block the
  recording-date claim. The fourth, "affected A/V cases are rechecked", has no record. The
  routing recheck in H1 shows the canonical A/V case regressed. The QA goldens
  `q-soroban-av-passkeys-talk`, `q-gap-av-offset-not-timestamp`, and `q-ti-video-tutorials`
  carry no recording-date claim for `created_at` (verified by reading them).
- Smallest repair: record the A/V case recheck in the ledger, resolve H1, then remove the TODO
  item in the same commit.

### M2 — Medium. The `ll-019` rewrite drops the upstream defect and adds consumer instructions.

- Location: `improvements/lumenloop/ll-019-av-output-contract-shape-and-date.md:17-18`
  (recurrence), `:26-28` (Finding), `:30-35` (Recommendation).
- Evidence: the old Finding said the field is "described/consumed as a recording date". The new
  Finding says "`created_at` is upstream metadata. It must not be treated as a recording date or
  recency evidence." That is guidance for Raven's own agents, not a defect the owner can fix.
  "Upstream metadata" tells the owner nothing, because every field they return is upstream
  metadata. The Recommendation "Separate recording/event date from upstream metadata" has the
  same problem. The recurrence `evidence` string repeats the two instruction sentences, which are
  not evidence.
- Standard: `.agents/skills/improvements-pipeline/SKILL.md`: a finding needs a concrete
  owner-facing defect and reproducible evidence; recurrences carry date and evidence.
- Smallest repair, local only (issue #35 is untouched, so the silence rule applies):
  - Finding: "The `returns` text calls `created_at` the recording's date. Live rows contradict
    it: `av_id` 445 (DEVCON 2024) carries `created_at` `2026-04-02T23:21:21.744Z`, and `av_id`
    1162 carries `2026-04-28T05:25:34.817Z`. The field's meaning is undocumented."
  - Recommendation: "Document what `created_at` records, and expose the recording or event date
    as a separate field."
  - Recurrence evidence: the observation only, plus one sentence that Raven's catalog no longer
    describes the field as the recording date.

### M3 — Medium. An adjacent own-repo surface still uses `created_at` as A/V recency.

- Location: `src/skills/runners/stellar-ecosystem-digest.ts:63-65` and `:101-104`.
- Evidence: `itemDate` falls through to `created_at` for A/V rows ("av/research created") and
  the digest sorts date-descending inside a `dateStart`/`dateEnd` window. For A/V items that is
  exactly "recency evidence". `research/services/lumenloop.md:95` records the same mapping
  (`av`/`research → created_at`) as the per-row date.
- Scope: not part of this diff and not a reason to widen it. `.agents/README.md` routes an
  own-repo gap to `.agents/TODO.md`.
- Smallest repair: add one `.agents/TODO.md` entry naming the runner, the two `av_id` rows, and
  a "Done when" (A/V rows are undated or dated from a verified recording field). Add a one-line
  caveat at `research/services/lumenloop.md:95`.

### L1 — Low. One fact is stated twice inside one entry.

- Location: `scripts/catalog-data/model-contract-corrections.mjs:10` and `:12`.
- Evidence: the description ends "Transcript text is not returned." The returns text ends
  "Transcript text itself is never returned — cite the link + the passage summary." Both land in
  the same manifest description.
- Smallest repair: keep the returns sentence, which carries the citation guidance, and drop the
  description sentence. Re-run the routing gate after the change (H1).

### L2 — Low. The correction carries no evidence pointer.

- Location: `scripts/catalog-data/model-contract-corrections.mjs:8-13`.
- Evidence: the file header says "Evidence-backed corrections". The new entry has no reference
  to `ll-019` or the 2026-09-01 matrix. The two older entries have none either, so this is a
  pattern, not a new defect.
- Smallest repair: one comment line per entry naming the finding id.

### L3 — Low. The protocol-history line lacks its baseline.

- Location: `.agents/rounds/2026-09-02-av-created-at-semantics.md` "Checks".
- Evidence: main also fails this diagnostic at 4/8 top-5 and 1/4 controls. HEAD moves
  `ph-protocol-regression-remediation` from rank 2 to rank 1 (`find_av_passages` no longer
  captures rank 1) and `ph-control-validator-vote` from miss to rank 5. Blind lane unchanged at
  3/11 and 6/9.
- Smallest repair: state the main numbers and the two moved rows so the FAIL is not read as new.

## Checks that passed

- **No claim treats `created_at` as a recording date or recency evidence** in
  `catalog/manifest.json`, `specs/super-spec.json`, `scripts/`, `src/mcp/`, `src/adapters/`, or
  the touched tests. `src/adapters/lumenloop-shape.ts:82-88` labels the copied `date` honestly
  ("not automatically a publication or observation date"). The only remaining uses are in M3.
- **Transcript text is not promised.** The manifest and super spec say it is not returned.
  `src/mcp/tools.ts` routes speech questions to the operation without promising text.
  `improvements/skills/sk-004` stays consistent. `eval/plan/coverage-rules.json:7,14` mention
  "transcripts" only in eval-internal comments.
- **Evidence-bounded wording.** "Upstream metadata; do not treat it as the recording date or
  recency evidence" claims nothing beyond the two live rows. It does not assert an ingestion
  timestamp.
- **Generated artifacts came from scripts.** Manifest, super spec, and `INDEX.md` match their
  generators. `eval/plan/op-classes.json` does not read descriptions, so it is unaffected.
- **Both generators share one correction.** `build-catalog.mjs` and `build-super-spec.mjs` apply
  `applyModelContractCorrection` to `description` and `returns`, and the super-spec `summary`
  derives from the corrected first sentence.
- **Tests guard the recurrence.** The negative assertions on `matched chunk text` and
  `recording's date` in `test/catalog.test.ts:426-427` and `test/super-spec.test.ts:401-402`
  meet the TODO's "focused tests" clause. The positive exact-string assertions memorialize text,
  which matches the existing precedent in the same tests. No action.
- **Secrets and exposure.** No credential, no non-exposed reference, no `solo://` path.

## Spec conformance summary

Spec: `.agents/TODO.md` "Correct Lumenloop A/V `created_at` semantics", evidence in
`.agents/rounds/2026-09-01-stale-gospel-refresh/passkeys-relayer-matrix.md` P6.

| Requirement | Status |
| --- | --- |
| Owning catalog source describes the field from verified semantics | Met |
| Generated catalog outputs rebuilt | Met |
| Affected A/V cases rechecked | Not recorded. Routing recheck shows a regression (H1, M1). |
| Focused tests prevent the recording-date claim from returning | Met |

## Residual risk

The lexical scorer treats operation descriptions as routing-load-bearing text. Any wording
change made to resolve H1 or L1 must re-run `npm run eval:routing -- --gate` and re-baseline in
the same commit.
