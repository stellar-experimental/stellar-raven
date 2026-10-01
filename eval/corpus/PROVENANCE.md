# Routing corpus provenance

This directory contains retained source material for the routing evaluation.
The QA battery uses its own [case files](../qa/corpus/README.md).
Do not use these snapshots as current truth for QA answers.
Use the owned cases and their [migration ledger](../qa/corpus/migration-ledger.json) to trace QA provenance.

## Retained files

### `raven-next/research/golden/`

- `<category>/q-*.md`: 538 question cards with routing labels and source context.
- `compiled/golden.json`: the generated 538-case artifact.
- `_meta/compile.mjs`: the compiler that rebuilds that artifact from the cards.
- `_meta/CARDS.md`: the card reference cited by retained case provenance.

The [routing compiler](../compile-routing.mjs) reads the compiled artifact and per-question frontmatter.
CI runs `_meta/compile.mjs` and checks that `compiled/golden.json` stays byte-identical.
Keep all 538 source cards, including cards that the routing compiler excludes from scored lanes.

Authoring briefs, drafts, dossiers, candidate notes, and unused indexes are not required inputs.
Git history retains those files.

### `raven-golden-qa/`

| File | Retained use |
|---|---|
| `big.json` | The routing compiler reads all 395 entries and preserves their routing labels. |
| `raph.json`, `kaan.json`, `flue.json`, `og.json` | Owned QA cases and migration records cite these source exports. |
| `boxy.json` | Owned live-data case provenance cites this source export. |

These exports came from a directory without Git history.
Do not treat their source-system rubrics or skill labels as this repository's evaluation contract.

## Capture record — 2026-07-02

The `raven-next` snapshot came from commit `a3aaa2d8cca6b9026912c2f1c902c63a2dfc12f8`.
The last corpus-touching commit was `ed34114`, dated 2026-06-29.
The capture compared the copied tree with its source through `diff -r`.
The compiled artifact had 538/538 ID parity with the source cards.
The routing compile produced the same bytes before and after the source paths changed.

The source repository name `kalepail/stellar-raven` identified a different codebase at capture.
Historical citations to that name refer to the retired source system.
The [prior-art guide](../../research/prior-art.md) records that history.

## Privacy rule

Never commit raw user-message or question pools here.
The excluded `jutsu` pool contained personal data and user-pasted secret keys.
It is not a required evaluation input. Do not restore it from an external copy.
Any future mining work requires a fresh privacy review before collection or import.
Keep only reviewed, sanitized evaluation questions and their required provenance.
