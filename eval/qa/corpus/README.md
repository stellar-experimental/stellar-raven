# QA corpus — the owned battery

This directory is the hand-owned source of truth for the golden Q→A battery. Schema, lanes,
commands, and the CI contract are documented in `eval/qa/README.md`.

- `battery/<category>/<id>.json` — one hand-owned JSON file per case, ten category
  directories. Filename must equal the case `id`; the parent directory must equal
  `tags.category` (compile-enforced). Edits are ordinary reviewed diffs; judge-facing changes
  go through the `golden-truth` skill and the CI gospel-change lint.
- `live/` — the two frozen whole-file live contracts (`live-data-canonical-v2`,
  `live-digest-supplement-v2`), membership- and digest-pinned by `eval/self-test.mjs`.
- `migration-ledger.json` — the permanent losslessness ledger (schema
  `qa-migration-ledger-v1`). Rows carry `sourceId`, `source`, `disposition`
  (`carry | merge | redefine | retire`), `destination`, and `reason`; destinations are
  required for `carry`/`merge`/`redefine`, reasons for `merge`/`redefine`/`retire`.
  `compile-qa.mjs` and `lint-corpus.mjs` cross-check it against the battery: every
  non-authored case must be a ledger destination and its `truth.origin` must name the source.

`npm run eval:qa:compile` compiles `battery/` into the generated, CI-byte-pinned
`eval/qa/cases.json`, `eval/qa/sample.json`, and `eval/qa/lifecycle-registry.json`. Never hand-edit those.
