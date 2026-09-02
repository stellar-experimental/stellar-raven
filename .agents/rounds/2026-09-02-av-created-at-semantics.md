# A/V `created_at` semantics

Date: 2026-09-02
Scope: `lumenloop.find_av_passages` model-facing catalog and super spec.

## Review status

Complete and reviewed.

Fable 5 high reviewed this change as the product reviewer.
Fable was selected for product and API wording.
The final bounded delta review in the closure report passed with no actionable finding.

## Evidence

The verified 2026-09-01 passkeys-relayer matrix recorded a DEVCON 2024 row.
The row had `av_id` 445 and `created_at` `2026-04-02T23:21:21.744Z`.
The matrix also recorded `av_id` 1162 with `created_at`
`2026-04-28T05:25:34.817Z`.

The observations do not document the field meaning.
The catalog therefore says only that `created_at` is upstream metadata.
It says not to treat it as the recording date or recency evidence.
The matrix confirmed AI `summary` and `long_summary` fields.
It found no transcript text field.

## Final correction

The authored correction uses this operation description:

`Find specific passages in long videos, podcasts, and recorded talks by semantic similarity. Returns parent recording metadata, AI summaries, and an opaque ordering offset.`

The returns text keeps this rule:

`created_at (upstream metadata; do not treat it as the recording date or recency evidence)`

The returns text also keeps the opaque `start_offset` rule.
It does not promise transcript text, quotes, or playback timestamps.
`ll-019` is the evidence pointer beside the authored correction.

## Routing comparison and decision

I ran `node eval/run-routing.mjs --manifest /tmp/main-manifest.json` against
the `main` manifest.
I ran `node eval/run-routing.mjs` against the final manifest.
Both runs used the same frozen corpus and scoring rule.
The ranked dumps changed for 123 cases.
I reviewed every changed ranked outcome.

| Lane | Main | Final |
| --- | --- | --- |
| Legacy strict | 208 / 279 / 311 | 213 / 279 / 312 |
| Extended strict | 90 / 109 / 117 | 90 / 110 / 116 |
| Skills strict | 16 / 23 / 23 | 16 / 23 / 23 |
| Holdout top-one / top-three / top-five | 10 / 22 / 25 | 10 / 22 / 26 |
| Holdout forbidden / passed | 11 / 21 | 11 / 21 |

The grading changes were these.

- Legacy losses: `q-eco-lobstr-wallet` lost top-three and top-five.
  `q-eco-xbull-wallet` lost top-three.
  `q-soroban-av-passkeys-talk` lost top-one.
- Legacy gains: `q-protocol-24-whisk-incident` gained top-one, top-three,
  and top-five. `q-sep-38-quotes`, `q-soroban-fee-structure`,
  `q-soroban-instance-storage-dos`, `q-soroban-vuln-classes`, and
  `q-token-initial-supply-distribution` gained top-one.
  `q-sep-53-sign-verify-message` gained top-five.
  `q-soroban-auth-recursion-dos-audit` gained top-three.
- Extended losses: `q-crp-anchors-by-corridor` lost top-one.
  `q-ti-video-tutorials` lost top-five and its expected card.
- Extended gains: `q-aas-trusted-asset-list-whitelist` gained its expected
  card. `q-pc-muxed-accounts` gained top-one.
  `q-scf-nontechnical-participation` gained top-three.
- Holdout gain: `q-holdout-b-01-sep-asset-metadata` gained top-five and its
  expected card.

The two wallet cases and the anchor case had false service credit from the
A/V operation. The final contract removes that broad capture.
The passkey talk remains a direct A/V result at rank three.
The tutorial discovery case moved from rank four to outside the top five.
I did not add terms or edit cases to recover that result.
The old false sentence restored rank four with a score of 242 in the gated tier.
The final wording scored 212 in backfill.
One evidence-true video wording scored 222 in backfill.
The interleave margin is 1.6.
A backfill result needed a score of 346 against the gated rank-five score of 216.
No evidence-true wording reaches that score.

I accepted the final evidence-true wording. I re-baselined `eval/gates.json`
for the final manifest SHA-256
`4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.
The accepted totals are the final totals above.
The frozen holdout was not changed or used for wording changes.
The final routing gate passed.

## A/V case recheck

I rechecked all three affected A/V QA cases.

- `q-soroban-av-passkeys-talk` uses `lumenloop.find_av_passages`, AI
  summaries, parent metadata, and the recording link. It rejects transcript
  quotes and playback timestamps.
- `q-gap-av-offset-not-timestamp` treats `start_offset` as opaque ordering.
  It rejects a video timestamp or deep link.
- `q-ti-video-tutorials` requires a media-source playback timestamp. It
  rejects converting `start_offset` to seconds.

None treats A/V `created_at` as a recording date or recency evidence.

## Clause artifact

The first clause build attempted remote metadata and failed.
I did not permit that provider call.
I used the supplied pinned local model cache through the local-only loader.
The final script rebuild succeeded.

- Artifact SHA-256: `d9de70079a1b94507854949b93b99f90b4f03370021c9a2e313a59f8b759002b`
- Clause-set SHA-256: `bed608469e73e719beb51912f483c4f8daf9fc2d843334387d0851475b581ff2`
- Vector SHA-256: `c6acd8b8e97d598c3d8a5714e677747198667667e1aba7545e6b52e57ffd121f`

I updated both rerank pins to these final values.
The focused vector tests passed.

## Protocol-history diagnostic

Main had 4/8 positive top-five captures and 1/4 control captures.
The final manifest has 4/8 positive top-five captures and 2/4 controls.
`ph-protocol-regression-remediation` moved from rank two to rank one.
`ph-control-validator-vote` moved from a miss to rank five.
The blind diagnostic stayed at 3/11 positives and 6/9 controls.
The diagnostic still fails. It is not a new regression gate.

## Improvement follow-up

`ll-019` remains `reported-upstream`.
It now states the owner-facing undocumented-field defect.
It names `av_id` 445 and `av_id` 1162.
Its 2026-09-02 recurrence records observations only.
No external issue changed.

`research/services/lumenloop.md` now records the upstream claim, the live-row
contradiction, and the undocumented real field meaning.

I removed the completed A/V catalog TODO item.
I added the stellar-ecosystem-digest A/V date-sorting follow-up.
This catalog branch does not implement that runtime follow-up.

## Checks

- `node scripts/build-catalog.mjs`: PASS.
- `npm run spec:build`: PASS.
- Generated A/V contract assertion: PASS.
- `npm exec vitest run test/catalog.test.ts test/super-spec.test.ts test/eval-vectorize-rerank-fit.test.mjs test/eval-vectorize-support-fit.test.mjs`: PASS, 94 tests.
- `npm run eval:routing -- --gate`: PASS.
- `npm run eval:protocol-history`: FAIL, diagnostic only. Final: 4/8 and 2/4.
- `npm run improvements:index`: PASS. It wrote 66 findings.
- `npm run improvements:lint`: PASS. It checked 66 findings.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 100 files and 1,630 tests.
- `npm run build`: PASS with a zero exit status. Wrangler reported an EPERM
  warning when it wrote its user-home debug log.
- `npm run secrets:scan -- --tree`: PASS. No leaks found.
- `git diff --check`: PASS.
- `npm run eval:selftest`: PASS. The offline self-test completed successfully.

No paid provider call occurred.
No external write, commit, or pull request occurred.
