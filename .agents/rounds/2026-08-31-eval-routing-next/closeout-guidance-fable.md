# Closeout guidance — eval stability and protocol-history routing round

Date: 2026-08-31
Lane: Product and measurement plan (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-08-31-eval-routing-next.md`
Status: guidance only. This lane edited no shared file, no code, and no result. The closeout
operator applies these edits and records each one in the ledger.

## 1. Final state this closeout records

- The clause-fit finish completed. The measured outcome is `FAIL`, reviewed and reconciled:
  `finish-result-sol.md` (repaired), `review-grok-result.md` (PASS), and
  `result-verification-delta-terra.md` (PASS).
- Result pins: stamp `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`; result SHA-256
  `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0`; query-cache SHA-256
  `65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2`; query-vector payload
  SHA-256 `55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9`; clause artifact
  SHA-256 `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`; preflight
  probe-vector SHA-256 `d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b`.
- Identity calibration reproduced `gates.json` and the frozen 4/8, 1/4, 3/11, 6/9 baselines
  exactly. No grid reading passed the acceptance table or the `PARTIAL` rule. Blind top-five
  moved from 3 to 4 at `m = 0.03` and `m = 0.06`; that movement is not a contract win.
- No production change ships. `src/`, the frozen contracts, and `eval/gates.json` are unchanged.
- The free register refresh reported the same-100 unstable count stable at `57` (57 before and
  after the 2026-08-30 collection; 4 in, 4 out; mean 0.7137 to 0.7085). Register hashes: Terra
  `5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53`, Fable
  `f13c687b642b514d90e6fd3c3899e8b3fc5be1729dcc92eac0ffd32fd173fdd6`, shared case-body digest
  `0c9face7c641a84c5829416570a1dbf24aa27ff8f02a58528e172f21e0985315`.
- No upstream finding surfaced. The routing defect is this repository's ranking, so
  `improvements/` stays unchanged. Say this explicitly in the ledger Outcome.

## 2. Smallest exact updates, file by file

### 2.1 `.agents/rounds/2026-08-31-eval-routing-next.md` (round ledger)

Append one closing entry and complete the Outcome section. Per lane: verdict, stamps, and the
review chain. State: the measured `FAIL` with the five pins above; attempt one of the block 3
box closed as a measured negative; only the judge-stability TODO closed; "nothing new surfaced"
for `improvements/`; and the retained evidence (harness, artifact, results, snapshot). The
probe-vector hash already sits in the ledger; do not duplicate entries.

### 2.2 `.agents/TODO.md`

Delete only the item "Judge stability on the same-100 set is degrading". Its done condition is
met: the post-collection refresh reports a stable trend. The deletion commit message or ledger
note says "stable at 57", not "no degradation".

Keep every other item. In the item "`search` does not surface the research lane for
protocol-history questions", append one short dated paragraph: the `clause-fit-hysteresis-v1`
measurement completed on 2026-08-31 with a reviewed `FAIL` (result stamp and artifact SHA-256
above); no grid passed both frozen contracts with the gates intact; attempt one of the three-
attempt box is spent; attempt two is a future, separately reviewed pinned local cross-encoder
measurement brief, not started in this round. The done condition does not change.

Do not touch the repository-tooling recovery item, the boundary-diagnostic item, or any other
queue entry.

### 2.3 `.agents/NEXT.md`

Block 2: replace the sentence "Judge stability is degrading (47 → 57 unstable). Watch its trend
at the next register refresh." with: the 2026-08-31 post-collection refresh reported the count
stable at 57 (4 in, 4 out) and the TODO item is closed; the register measures verdict stability
across collections and re-judges, not judge-only variance. Keep the Raven boundary-diagnostic
and Friendbot text unchanged. Block 2 stays open.

Block 3: append the attempt accounting. Attempt one (clause-level Qwen route fit) is a measured,
reviewed `FAIL`; the frozen contracts remain the acceptance test; the harness and artifact stay
as the frozen instrument; attempt two is a future, separately reviewed cross-encoder brief with
its own model pin, loader, artifact, and review chain; attempt three remains in the box. No
production routing change shipped.

Update "State at handoff" and "Suggested sequence" only as far as these two blocks require.
Preserve blocks 4, 5, 6 and the owner-margin decision text as they are.

### 2.4 `eval/vectorize/README.md`

In the section "Clause-fit measurement attempt (2026-08-31)", keep the first three paragraphs
(clause set, artifact build, offline tests). Replace the stopped-referee paragraphs with the
completed record: the local-only finish (snapshot, loader, preflight) ran one referee on
2026-08-31; preflight probe hash `d32aabf3…`; result stamp
`2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1` with the query-cache and result hashes; the
five-reading table (identity PASS-gate/FAIL-contracts; pure fit diagnostic; grids 0.03 / 0.06 /
0.10 all FAIL); the blind top-five 3-to-4 note with the exact wording bounds from the result
review; outcome `FAIL` with `selected: null`; no production change; harness and artifact kept as
the frozen instrument. Point to `finish-result-sol.md` for the full command record. Do not add
claims beyond the reviewed result wording.

### 2.5 `eval/README.md`

Replace the two stale pointer sentences ("Its 2026-08-31 referee stopped before scoring… no
ranking result…") with: the clause-fit follow-up completed on 2026-08-31 and measured `FAIL`
under both frozen contracts; no production search change; details in `eval/vectorize/README.md`.

### 2.6 `eval/qa/README.md`

In "Judge-tier contract", after the 2026-08-28 ceiling-evidence paragraph (mean panel `$0.180`,
mean single `$0.069`), add one short paragraph with the two calibration facts: the 2026-08-30
same-100 run's mean panel-row cost was `$0.244` and mean single-row cost `$0.0617`
(`57 × 0.244 + 43 × 0.0617` reproduces the stored `$16.5629124`), and future briefs must use the
`$0.244` figure; and the stability register measures verdict stability across collections and
re-judges, not judge-only variance — the committed `23.3%` noise floor is identical-input
re-judge noise and is a different quantity.

### 2.7 No other file changes

Do not edit `finish-result-sol.md`, `implementation-sol.md`, any review file, any result JSON,
the clause artifact, the frozen contracts, `eval/gates.json`, or anything under `src/`.

## 3. Commit and gate guidance

The closing commits land on `next/eval-routing-stability`: the harness and artifact files
(currently modified `eval/README.md`, `eval/vectorize/README.md`, `eval/vectorize/embedder.mjs`,
`package.json`; untracked `eval/vectorize/clause-*.mjs`, `build-clause-artifact.mjs`,
`preflight-clause-model.mjs`, `run-clause-fit.mjs`, the artifact JSON,
`test/eval-vectorize-clause-fit.test.mjs`), the round-directory files, and the TODO / NEXT /
README edits above. Keep measurement code and documentation edits in separate commits where the
diff is clearer.

Run before the closing commit, bare, with no pipes:

```sh
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
npm run eval:routing -- --gate
npm run eval:qa:lint -- --since origin/main --stale
```

No deployment, push authorization, or PR merge is part of this guidance; open the PR per normal
review flow. Result JSON files stay local and gitignored.

## 4. Retention

- Keep the harness, the clause artifact, the query cache, the result JSON, and the `/tmp` dump
  hashes, per the result review. Results stay at least 30 days after the investigation ends.
- Keep the model snapshot at
  `/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394` until block 3 closes.
  It may then be deleted; the four pinned hashes make it reproducible under a future authorized
  fetch. Record a deletion in the ledger.

## 5. Ranked next sequence from the current documents

1. **Land this closeout.** Apply sections 2 and 3. This is the only open work in this round.
2. **Block 3 goes to a held state.** Attempt two is a future, separately reviewed pinned local
   cross-encoder measurement brief. It needs its own model pin, loader, artifact, review chain,
   and zero-paid budget. Do not start it inside this round. The plan's pre-registered `R0`/`R1`
   QA slice stays dormant; it activates only for a future candidate that passes both frozen
   contracts.
3. **Block 5, Playground message limit** (`.agents/TODO.md`, ADR-0008). Free own-repo work; the
   NEXT suggested sequence points here because block 4 stays monitor-only until the free Horizon
   probe returns `28`.
4. **Block 6, small own-repo fixes**: stub the model in `test/demo-chat.test.ts` so the `ai`
   tool-loop guard runs; remove the leading blockquote marker from generated improvement titles.
5. **Standing items, unchanged**: the owner product-loss margin decision before any paired QA
   promotion; the same-100 `v2.10` pinned-pair spend only when a merged product candidate needs a
   paired look; the Raven boundary diagnostic only with a new mechanism; Friendbot monitor-only.
