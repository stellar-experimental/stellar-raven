# Gated local closeout implementation — Sol

Date: 2026-09-01

## Outcome

The authorized local phase is complete.
The golden now reflects the current CAP-0075 interface state.
`sd-048` is `verified` and remains unfiled.
`sls-080` is `fixed-upstream` and remains unresolved.
The recovery monitor now uses durable ledger and receipt records.

No external or production write occurred.
`.agents/NEXT.md` did not change.

## Golden correction

Changed case:

- `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json`

The case preserves these stable facts:

- Protocol 25 activated X-Ray on 2026-01-22.
- CAP-0074 added exactly three BN254 functions.
- CAP-0075 added exactly two low-level permutation functions.
- The functions are not turnkey hash helpers.
- The primitives do not create default privacy.
- Answers must not invent helper names.

The case removes these obsolete claims:

- The CAP-0075 field selector is `U32Val`.
- CAP-0075 contains a Protocol 24 availability sentence.
- `sd-036` needs a grading caution.
- The old source-conflict corroboration row remains current.

The case now uses source classes A and B.
It sets `truth.asOf` to `2026-09-01`.

Its root causes are:

- `improvements/resolved.json entry sd-021`
- `improvements/resolved.json entry sd-036`
- `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md`

The `sd-036` receipt is a forward reference for the later resolver phase.
This local phase did not create that receipt.

Active `sd-048` stays outside the judge-facing grading contract.
The lint warning for that choice is expected.

## Source matrix

| class | exact source | result |
|---|---|---|
| A | `https://stellar.org/blog/developers/announcing-stellar-x-ray-protocol-25` | The official announcement records the exact Mainnet activation time: 2026-01-22 at 17:00 UTC. |
| A | `stellar/stellar-docs@83c68f21c721905327f5db12fb84702e3a48367c/docs/build/apps/zk.mdx` | Lines 6 and 41-42 state that Protocol 25 introduced BN254 and Poseidon/Poseidon2. They name `poseidon_permutation` and `poseidon2_permutation`. |
| B | `stellar/stellar-protocol@65e2b6262c0825494caf2a94116eb512c8335f22/core/cap-0074.md` | CAP-0074 defines the three BN254 functions at Protocol 25. |
| B | `stellar/stellar-protocol@65e2b6262c0825494caf2a94116eb512c8335f22/core/cap-0075.md` | CAP-0075 defines two permutation primitives at Protocol 25. |
| B | `stellar/rs-soroban-env@a7e15b439c4b49b17ba8f9e4527efee8d8119aba/soroban-env-common/env.json` | The shipped CAP-0075 interface matches the current field and protocol gates. |

## Sibling sweep

The sweep reviewed these cases:

- `q-edge-noinfo-stellar-native-privacy-default`
- `q-pc-protocol-26-yardstick`
- `q-protocol-bls12-381-cap59`
- `q-protocol-version-history-list`
- `q-sor-confidential-tokens`
- `q-sor-cross-warmancer-zk-stack`
- `q-tool-zk-repo-live`
- `q-zk-host-functions-status`
- `q-zk-poseidon-input-encoding`
- `q-zk-proof-systems-stellar`

No sibling contradicts the corrected case.
No sibling retains the obsolete interface caution.

The register reopened five clusters after the case hash changed:

- `cluster-007`
- `cluster-008`
- `cluster-047`
- `cluster-110`
- `cluster-117`

The lane reviewed all five clusters.
Each cluster remains `consistent`.
The final register run reported 0 reopened clusters.

## Finding lifecycle preparation

### `sd-048`

Changed `status: proposed` to `status: verified`.
The pinned CAP, ABI, and host evidence remains unchanged.
No issue was filed.

### `sls-080`

Changed `status: reported-upstream` to `status: fixed-upstream`.
Removed the stale open-issue prose.

The finding now records this deployed evidence:

- Public API version: `1.9.16`
- Answer value: `MaxSupportedProtocolVersion = 28`
- `answerSource`: `knowledge-note`
- `answerAsOf`: `2026-09-01T00:00:00Z`
- `generatedAt`: `2026-09-01T19:42:19.933Z`
- `scannedRef`: `82660510ecda7fd365a14d08badb9d85fa22bc32`
- Source value at that ref: `MaxSupportedProtocolVersion uint32 = 28`
- Issue `#1134`: closed as completed
- PR `#1174`: merged as `76cb312d6bcee5260d98720402204feb774a3be6`

No resolution comment was posted.
No resolver ran.

## Recovery queue change

Only the `sls-080` recovery section changed in `.agents/TODO.md`.

The section preserves:

- The exact Horizon monitor question.
- Repository `stellar/stellar-horizon`.
- One free reading during each improvements or drift round.
- The returned value, `generatedAt`, `scannedRef`, and `answerSource` fields.
- Source comparison at the response's own `scannedRef`.
- The non-literal match rule.
- The three successful-recovery recurrence threshold.
- The three positive operation-selection miss trigger.
- The Docs-first, inspect, then one-later-Scout sequence.
- The case ID, result stamp, transcript, and finding identity requirements.
- The ADR-0008, `10-of-12`, and `0-of-8` gates.
- The separate paid-collection authorization gate.

Future evidence now goes into the current round ledger.
After retirement, it cites the `sls-080` resolved receipt.
`sls-082` remains reserved for a later distinct defect.

## Generated change review

`npm run eval:qa:compile` generated these owned changes:

- `eval/qa/cases.json`
- `eval/qa/sample.json`
- `eval/qa/lifecycle-registry.json`

Only `q-protocol-bn254-poseidon-xray` changed in `cases.json`.
`sample.json` changed only its corpus hash.
`lifecycle-registry.json` changed only the affected case hash.

`npm run eval:qa:register` updated five reviewed clusters.
No other cluster changed.

`npm run improvements:index` changed two status rows:

- `sd-048`: `proposed` to `verified`
- `sls-080`: `reported-upstream` to `fixed-upstream`

The generated index still contains 70 findings.

## Commands and results

| command | result |
|---|---|
| `gh api 'repos/stellar/stellar-docs/contents/docs/build/apps/zk.mdx?ref=83c68f21c721905327f5db12fb84702e3a48367c' -H 'Accept: application/vnd.github.raw+json' \| nl -ba \| sed -n '1,220p'` | PASS; line 6 gives the introduction claim; lines 41-42 give both permutation functions. |
| `npm run eval:qa:compile` | PASS; 500 cases; corpus SHA-256 `4f9b5017d6ee1efbd18c542873b0bfdf5dbd330d102112187cff83e0ab964cef` |
| `npm run eval:qa:register` | Initial run reopened five changed-member clusters. |
| `npm run eval:qa:register` | Final run passed with 0 reopened clusters. |
| `npm run eval:qa:lint -- --since 23982548b7b67a1931c61f2d02a04d8a386f6b5c` | PASS; 0 errors and 62 warnings. |
| `npm run improvements:index` | PASS; wrote 70 findings. |
| `npm run improvements:lint` | PASS; `improvements lint ok (70 findings)`. |
| `git diff --check` | PASS. |

The lint added one warning for this case.
Active `sd-048` appears in `rootCause` without a grading caution.
The user required the conflict to stay outside the grading contract.
Therefore, the lane did not add that caution.

## Changed files

- `.agents/TODO.md`
- `.agents/rounds/2026-09-01-free-improvements-maintenance.md`
- `.agents/rounds/2026-09-01-free-improvements-maintenance/closeout-sol.md`
- `eval/qa/cases.json`
- `eval/qa/consistency-register.json`
- `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json`
- `eval/qa/lifecycle-registry.json`
- `eval/qa/sample.json`
- `improvements/INDEX.md`
- `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md`
- `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`

The pre-existing `closeout-gate-sol.md` report remains unchanged.

## Remaining gates

- Do not file `sd-048` without a later filing authorization.
- Do not resolve `sd-036` before the successor filing and comment gates pass.
- Do not resolve `sls-080` before its public snapshot and comment gates pass.
- Do not edit `.agents/NEXT.md` before the authorized resolution phase.
- Run the separate final-diff review before round closeout.
