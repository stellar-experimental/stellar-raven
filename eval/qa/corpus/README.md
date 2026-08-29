# QA corpus — the owned battery

This directory is the hand-owned source of truth for the golden Q→A battery. Schema, lanes,
commands, and the CI contract are documented in `eval/qa/README.md`.

- `battery/<category>/<id>.json` — one hand-owned JSON file per case, ten category
  directories. Filename must equal the case `id`; the parent directory must equal
  `tags.category` (compile-enforced). Edits are ordinary reviewed diffs; judge-facing changes
  go through the `golden-truth` skill and the CI gospel-change lint.
- `proposed/<category>/<id>.json` — verified proposal files outside the compiled battery.
  A new ID must land here in one commit before a later activation commit can move it.
- `retired/<id>.json` — permanent tombstones outside the compiled battery. Each tombstone
  reserves its ID and records the final case digest, evidence, and replacements.
- `lifecycle-policy.json` — the mass-review cadence and frozen-review state. An open review
  binds the named `qa-mass-review-rules-v1` digest and the frozen active-ID digest.
- `live/` — the two frozen whole-file live contracts (`live-data-canonical-v3`,
  `live-digest-supplement-v2`), membership- and digest-pinned by `eval/self-test.mjs`.
- `migration-ledger.json` — the permanent losslessness ledger (schema
  `qa-migration-ledger-v1`). Rows carry `sourceId`, `source`, `disposition`
  (`carry | merge | redefine | retire`), `destination`, and `reason`; destinations are
  required for `carry`/`merge`/`redefine`, reasons for `merge`/`redefine`/`retire`.
  `compile-qa.mjs` and `lint-corpus.mjs` cross-check it against the battery: every
  non-authored case must be a ledger destination and its `truth.origin` must name the source.

`npm run eval:qa:compile` compiles `battery/` and reserves every lifecycle lane. It generates the
CI-byte-pinned `eval/qa/cases.json`, `eval/qa/sample.json`, and
`eval/qa/lifecycle-registry.json`. The registry uses prior Git history as its reservation anchor.
Never hand-edit these generated files.
