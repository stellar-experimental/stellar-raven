# Evidence support diagnostic repair

## Verdict

PASS.

A safe general repair exists. The repair detects omitted supporting prose without case-specific terms.

This work is an own-repo eval harness gap under `run-evals` Step 5.

## Root cause

`findTranscriptEvidencePackOmissions` extracted only structured exact terms from judge claims.

The extractor covered identifiers, dates, URLs, money, and numeric values. It did not cover ordinary supporting prose.

The first row retained one unrelated exact term. That match hid the omitted proposition from the diagnostic.

The second row produced zero exact terms. Therefore, the diagnostic had no support probe to test.

## Exact reproductions

The source artifact was `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.

I rebuilt each `p6` pack from its saved row. Both rebuilt packs matched the saved character count and SHA-256.

I ran the reproduction twice before the repair. Both runs produced the same results.

| Row | Saved pack SHA-256 | Before | Transcript support | Pack support |
| --- | --- | --- | --- | --- |
| `q-edge-scf-v7-centralization-myths` | `8150123b25d25dcd570bf948d8db0eaa6856bec467bd2f996e1c9f2f0faa5472` | `no-pack-omission` | `launched January 2026` | absent |
| `q-ti-stellar-lab-usage-and-new-ui` | `20b3bc328a51a18ca1f39034b134d4d6329cc9ab9f0aff7ced983e05b1fd0c03` | `no-pack-omission` | `top-right corner` | absent |

After the repair, both rows return `pack-omission` and `requiresReview: true`.

The first row returns `omittedProse: ["launched January 2026"]`.

The second row returns `omittedProse: ["top-right corner"]`.

The rebuilt pack hashes remain unchanged after the repair.

## Decision

The diagnostic now adds conservative prose probes beside the existing exact-term probes.

Quoted probes require 3 through 24 normalized tokens. Each probe also requires a long token or a numeric token.

Unquoted probes require at least five content tokens. The listed verdict suffixes do not enter the probe.

The unquoted path does not remove leading judge verbs. Therefore, verbs such as `States` can prevent a support match.

The matcher preserves token order. It permits small intervening words within a tight total window.

Each match must occur inside one text unit.

The matcher does not join adjacent fields in line-leading JSON. Prefixed or nested JSON text can still join fields.

The diagnostic reports prose counts and bounded `omittedProse` values. It keeps all existing exact-term fields.

The repair does not change the evidence pack text. It does not change judge scores or claim lists.

The repair does not change goldens, product routing, the rubric, or `PACK_VERSION`.

## Tests

The new tests cover both exact false negatives.

The tests also cover unquoted prose, truncated packs, retained prose, and topical false positives.

Another test prevents phrase assembly across adjacent fields in line-leading JSON.

Existing tests continue to cover exact values, numeric boundaries, dates, identifiers, and structured fields.

## Portfolio check

I rebuilt and checked all 39 eligible wrong-claim rows in the candidate artifact.

Three rows changed from `no-pack-omission` to `pack-omission`.

The two requested rows changed as expected.

`q-tool-freighter-wallet` also changed. Its transcript directly supports the omitted quoted version and date.

One existing `pack-omission` row also gained a prose omission. Its status did not change.

This offline check made no paid model calls.

## Commands and results

- `npm ci` passed and installed 310 packages.
- `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs` passed 52 tests.
- `npm test` passed 1,777 tests in 103 files.
- `npm run typecheck` passed.
- `npm run build` passed with the Wrangler dry run.
- `npm run secrets:scan -- --tree` passed with no leaks.
- `git diff --check` passed.

`npm run typegen` generated `env.d.ts` from placeholder secret names.

Wrangler could not write its user log during type generation. Type generation still completed successfully.

The build used `WRANGLER_LOG_PATH` under `/tmp` and completed without that warning.

## Residual limits

The detector remains conservative. It can miss paraphrases, reordered claims, synonyms, and very short prose.

Leading judge verbs can make the unquoted path inert. The candidate artifact produced no supported unquoted probes.

The support test is lexical, not semantic. Query echoes, negated sentences, and quoted golden text can satisfy it.

A possessive apostrophe can end a single-quoted probe early. The fallback can then miss the support.

The label strip removes trailing punctuation. It also removes a trailing ellipsis from the reported label.

Line-leading JSON keeps adjacent fields separate. Prefixed JSON and JSON nested inside a string can join them.

The detector only examines saved execute results. An upstream transcript cap can remove support before this check.

Textual support triggers review. It does not prove the candidate claim is semantically correct.

The matcher caps each text unit at 2,000 characters. This bound limits accidental cross-context matches.

## Independent review reconciliation

The independent Fable review passed the implementation with five non-blocking findings.

- F1 narrows the JSON-field guarantee to line-leading JSON.
- F2 records the leading judge-verb limit on unquoted probes.
- F3 records query-echo, negation, and golden-quote lexical false positives.
- F4 records the possessive apostrophe limit for single-quoted probes.
- F5 records the trailing ellipsis loss in reported labels.

These findings do not change the diagnostic-only decision. They do not require an implementation change for this task.

No blockers remain.
