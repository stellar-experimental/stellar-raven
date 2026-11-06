# Final mechanical review — 2026-11-05

Independent reviewer: Scout lane t2dw, Astra/high. Base fec1c79f. Scope: coordinator retirement/reference mechanics and the two prompt-fixture hash refreshes; no new corpus/source research. The separately requested wallet rename note is authored by this lane and reviewed by t2dv, not self-approved here.

## Finding and reconciliation

**Medium provenance defect found:** the mechanical replacement of local finding paths in `research/audits/2026-11-03-qa-followup/case-dispositions.json` initially pointed16 objects at newer revision bytes while keeping the original `sha256`. Eight IDs each occur twice: sk-037 and sls-095/096/098/103/104/105/106. sls-109/110 already matched. Preserve recorded hashes and point to the actual captured bytes. Independently found exact matching published ancestors:

- sk-037: `cead8195d562246293bbbf1748625ce9985fb65c`.
- sls-095/096/103/104/105/106: `049fb7476f609af398b00d2812736470f4602430`.
- sls-098: `b73c8c2f99a724138447339b8e753647e33e1724`.

Sent root exact correction; final recheck below determines acceptance. No hash should be rewritten to conceal which original snapshot was reviewed.

## Completed checks

- **Eleven retirement deletions exactly match eleven new resolved receipts:** cs-011, sk-037, sls-095/096/098/103/104/105/106/109/110. No partial/inconclusive Scout record was accidentally removed. Each receipt has upstream/resolving references, precise liveRecheck and distinct reviewEvidence. New receipt dates use November6 UTC; the round is November5 local.
- **Source snapshots exist:** all175 current resolved sourceCommit:path objects pass `git cat-file -e`. All11 new sources and all6 repaired historical sources are ancestors of the fetched origin/main. sourceUrl embeds the same40-character sourceCommit and original finding path. Six old-receipt repairs change snapshot metadata only; resolved facts/dates/IDs are retained. New receipts preserve the historical full finding rather than substituting a summary.
- **Reference changes preserve dated assertions:** reviewed source references in Hana, wallet roster, Hummingbot/Kelp, prior round JSON, overnight evidence and case-dispositions. Active source files no longer locally reference the11 deleted records. At the first check, generated cases/sample still had11 such occurrences awaiting coordinator regeneration; final status below. Historical source snapshots remain historical, not newly verified facts. Original short ID mentions in dated audits/action tables are audit identifiers, not executable active references.
- **No threshold/exposure drift:** eval/gates leaf changes are baselinedAt, the manifest input SHA and new evidence.notes only. All thresholds, accepted totals and other input hashes stay unchanged. Manifest exact ID set remains284/60 operations. `scripts/exposure.mjs` and runner declarations have no diff. No judging renderer or policy changes accompany fixture updates.
- **Two source-driven prompt fixtures only:** `eval/qa/judge.mjs` diff changes exactly the expected SHA strings for q-scf-total-distributed and q-soroban-storage-types. The former notes now reflect repaired nonempty funding provenance; the latter removes the repaired storage-legacy caution. `node eval/qa/judge.mjs --self-test-static` independently recomputes `buildJudgePrompt` against the owned cases:15/15 fixture matches, static GREEN, no paid invocation. New expected hashes are `8250f5c8695025ea73b783cfaec0a6a30ef7171296330641716e651bee3f6bcb` and `11f8aec4e220c6a6b6d2d79bb02014ad1582f14e2c2648dbb1911eb56b69a5c7` respectively. This refresh does not weaken a test or alter rubric thresholds.
- Existing independent drift ACCEPT covers schema/runner/pin safety and alias fix. Existing golden review covers12 case edits; register review remains its assigned reviewer's scope. This mechanical check does not independently re-approve the author's scientific/content claims or claim final deployment.

## Reproduction

For every source entry: parse `improvements/resolved.json`; assert sourceUrl matches `/blob/<sourceCommit>/<path>`; `git cat-file -e '<sourceCommit>:<path>'`. Compare added IDs with `git diff --name-only --diff-filter=D fec1c79f -- improvements`. For every archived `{path,sha256}` object whose path is a pinned GitHub blob, run `git show '<sha>:<path>'` and SHA256 the exact bytes; compare with its stored sha256. Hash references identify content, not just a resolvable URL. Check active consumer references after coordinator compile. `node eval/qa/judge.mjs --self-test-static` is entirely local; do not invoke paid judge-selftest variants.

No helper terminal or external checkout was created for this final check. Previously owned helper terminals were removed; no owned external checkout exists. Root retains its temporary evidence until publication.

## Expanded final receipt set and provenance repair — verified

While this check ran, root completed20 Docs retirements. The final31 deleted finding files now match31 new resolved IDs exactly (the initial11 above plus sd-060/063/065/066/067/068/069/071/073/078/079/080/082/083/084/085/086/087/089/094). All195 current source blobs exist; every new31 and repaired6 source is an origin/main ancestor. No additional content re-research was performed by this mechanical lane; Docs retirement evidence is independently owned by its assigned reviewers.

Root repaired the archival mismatch without changing original captured hashes. Recursive comparison against fec1c79f proves42 pinned `{path,sha256}` objects now match their exact source bytes, including both copies of the eight Scout/skill IDs flagged above. Seventeen objects for eight Docs IDs (082/083/084/085/086/087/089/094) had no published revision matching their captured bytes: root preserves each original `sha256` as `capturedSha256`, records the actual linked bytes as `snapshotSha256`, and adds an explicit `snapshotNote` denying byte-exact equivalence. Independently checked all17 captured hashes against the original archive and all17 snapshot hashes against `git show`; zero mismatches. t2dv separately reviews the Docs provenance explanation. This is an honest distinction between original local capture and later published record, not a relabelled digest.

Wallet follow-through is independently approved by t2dv in scout-golden-review.md. Exact frozen file: `eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json`, SHA256 `7acc5af8f61dfad090cfde25d627fe1499fe48dcf58bf65d5371bdbf91aa68cf`. Hana needed no semantic edit. No owned helper terminal or external checkout remains. Source/reference mechanics and fixture refresh are accepted; generated-consumer closure is recorded after root's final regeneration below.

## Final mechanically checked verdict — ACCEPT

After root regenerated the corpus, independently reran the retired-path scan across active consumers, including generated `eval/qa/cases.json` and `sample.json`: **zero local references to the31 retired files**. The full receipt/deletion correspondence still holds; manifest IDs and gate constraints remain unchanged. Repeated archival check: **42 exact pinned-byte comparisons, zero mismatches**; the separately recorded17 captured/snapshot distinctions remain preserved. `npm run eval:qa:register -- --check` independently reports **up to date**. An initial attempted direct command used a nonexistent script name; the documented npm command above is the successful check. No unresolved mechanical finding remains. Docs provenance semantics stay with their distinct assigned reviewer. No owned child terminal or external checkout remains.
