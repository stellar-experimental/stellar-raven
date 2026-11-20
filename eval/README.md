# Search-routing evaluation

This instrument checks which services and operations `searchCatalog()` returns for a question.
It runs offline and does not execute service operations or grade final answers.
Use the [evaluation map](EVALS.md) to select an instrument.

[gates.json](gates.json) owns the accepted totals, thresholds, input hashes, and baseline decisions.

## How to run

```sh
npm run eval:selftest
npm run eval:routing -- --gate

# Regenerate routing cases after an approved source-label change.
npm run eval:compile

# Save ordered result IDs for comparisons between builds.
node eval/run-routing.mjs --dump-ranked eval/results/ranked.json
```

Writes `eval/results/routing-<timestamp>.json` and prints gate results (`--gate` exits non-zero on evidence, threshold, or denominator failures). `--dump-ranked` exports ordered result IDs for legacy, extended, skills, and protocol-history cases (never holdout); compare dumps with `cmp` across identical memberships, counting differences on confirmation-only rows without printing them. Imports `src/catalog/search.ts` via Node 24 native TS (`.nvmrc`), falling back to `eval/.build/` if needed.

## Cases and measures

| Case set | Source | Measure | Status |
|---|---|---|---|
| Legacy | `routing-cases.json` | Service top-1/3/5 | Gate |
| Skills | `skills-cases.json` | Skill service top-1 | Gate |
| Holdout | `holdout-cases.json` | Exact-card top-1/3/5 and forbidden captures | Gate |
| Extended | `routing-cases.json` | Service top-1/3/5 | Diagnostic |
| Accept-either | Compiled labels and `build-question-overlay.json` | Any declared acceptable service | Diagnostic |
| Protocol-history v1 | `protocol-history-cases.json` | Target operation ranking and control captures | Diagnostic |

The compiler reads inputs in [corpus/PROVENANCE.md](corpus/PROVENANCE.md), maps `stellar_light` → `scout` and `stellar_docs` → `stellarDocs`, excludes unsupported general-web/unlabeled cases, and records skipped reasons. Strict service measures run the original question at `limit: 5`, keeping each set's denominator separate; accept-either combines source acceptable cards with the reviewed overlay without changing strict scores.

### Confirmation-only rows

Any routing or discovery row whose question has token Jaccard ≥ 0.8 against a question in `qa/cases.json` is confirmation-only and listed by routing row ID (no QA ID or score) in [routing-qa-overlap.json](routing-qa-overlap.json). `npm test` checks sync; regenerate with `npm run eval:routing:overlap` after routing recompiles or golden question edits.

No lane tunes on a listed row or reads its per-row output (aggregates only). `run-routing.mjs`, `run-protocol-history.mjs`, `discovery/run-discovery.mjs`, and `discovery/run-replay.mjs` tag listed rows `confirmationOnly: true` and print `confirmation-only` instead of rank/hit/miss while counting them in aggregates (preserving grades in result files). The agentic workflow and agent discovery runner do not tag rows—report listed rows as counts only. Add any new question set to `routing-qa-overlap.mjs`, and have its runner pass its set name and row IDs to `lib/confirmation-only.mjs`.

### Row output

`run-routing.mjs` and `run-protocol-history.mjs` print aggregates only by default (routine runs and CI omit `--rows`). Pass `--rows` only when you need holdout or protocol-history per-row tables; result files carry every row regardless. Error text names files and positions rather than case IDs, questions, or cards (except warnings on `build-question-overlay.json`, which name a legacy routing case).

### Card-name normalizer

`card@5` ([lib/grade.mjs](lib/grade.mjs)) normalizes case and converts `-`, `.`, and spaces to `_`. A match holds on: (1) exact normalized name, (2) matching mapped service and operation name, (3) matching service with substring containment (shorter ≥ 4 chars), or (4) matching service where `<noun>_detail` matches `get_<noun>`/`get<noun>`. Cross-service matches require explicit acceptable-service labels; `<service>_mcp` cards are excluded from `card@5` (legacy has 27 Stellar Docs cases with operation labels).

### Gate evidence

[gates.json](gates.json) owns legacy bands, skills top-1 floor, holdout floors/forbidden ceiling, and required input SHA-256s/counts (missing skills or holdout files fail; overlay and protocol-history v1 are optional). Update hashes, totals, thresholds, and the decision record together on approved baseline changes. Never tune on individual failed holdout cases; freeze blind labels before reading scorer details or result traces.

### Protocol-history diagnostics

The routing run includes frozen v1 if present; `npm run eval:protocol-history` runs the two v2 contracts and reports `source-expired` on epoch mismatch. Diagnostic failures do not change the three routing gates.

## Evidence

[Cited routing records](qa/reviewed/2026-09-30-routing-guide-records.md) retain evidence referenced by current artifacts.
