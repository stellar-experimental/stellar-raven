# Search-routing evaluation

This instrument checks which services and operations `searchCatalog()` returns for a question.
It runs offline and does not execute service operations or grade final answers.
Use the [evaluation map](EVALS.md) to select an instrument.

The committed Scout inventory version is `1.9.61`.
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

The runner writes `eval/results/routing-<timestamp>.json` and prints the gate result.
`--gate` returns a nonzero exit status for a failed evidence check, threshold, or denominator.
Without `--gate`, the runner reports threshold failures without enforcing their exit status.

The ranked dump includes legacy, extended, skills, and protocol-history cases.
It excludes holdout cases. Compare dumps only across identical case memberships.
An empty diff establishes result-ID order for those cases; it does not establish answer quality.

The runner imports `src/catalog/search.ts` through Node's native type support.
If that import fails, it uses the repository's TypeScript package and writes temporary output under `eval/.build/`.
Use the Node version in [.nvmrc](../.nvmrc).

## Cases and measures

| Case set | Source | Measure | Status |
|---|---|---|---|
| Legacy | `routing-cases.json` | Service top-1/3/5 | Gate |
| Skills | `skills-cases.json` | Skill service top-1 | Gate |
| Holdout | `holdout-cases.json` | Exact-card top-1/3/5 and forbidden captures | Gate |
| Extended | `routing-cases.json` | Service top-1/3/5 | Diagnostic |
| Accept-either | Compiled labels and `build-question-overlay.json` | Any declared acceptable service | Diagnostic |
| Protocol-history v1 | `protocol-history-cases.json` | Target operation ranking and control captures | Diagnostic |

The compiler reads the retained inputs described in [corpus/PROVENANCE.md](corpus/PROVENANCE.md).
It preserves source labels and records skipped questions with their reasons.
The compiler maps `stellar_light` to `scout` and `stellar_docs` to `stellarDocs`.
It excludes questions for unsupported general-web services and cases with no expected service.

Each strict service measure uses the original question and `limit: 5`.
A top-1 hit matches `expected_service` at rank 1.
Top-3 and top-5 require a matching service within their respective limits.
Keep each case set's denominator separate.

The accept-either view combines source `acceptable_cards` with the reviewed overlay.
It does not change the strict service score.
The extended cases remain separate from the legacy aggregate.

### Card-name normalizer

`card@5` checks operation labels through [lib/grade.mjs](lib/grade.mjs).
It normalizes letter case and converts hyphens, periods, and spaces to underscores.
A card matches when one of these conditions holds:

1. The complete normalized names match.
2. The mapped services and remaining operation names match.
3. The services match, and one operation name contains the other with a minimum shorter length of four characters.

Cross-service matches require an explicit acceptable-service label; the normalizer does not create them.
A `<service>_mcp` card names a service, so `card@5` excludes it.
Cases with only service cards have no operation score.
The legacy set includes 27 Stellar Docs cases with operation labels.

### Gate evidence

The legacy gate uses a band around its accepted top-1/3/5 totals.
The skills gate uses a top-1 floor.
The holdout gate uses top-1/3/5 floors and a forbidden-capture ceiling.
Read their exact values from [gates.json](gates.json).

The gate file also pins each required input's SHA-256 and accepted case count.
A missing skills or holdout file fails the evidence check.
The accept-either overlay and protocol-history diagnostic are optional inputs.
Their absence does not remove the compiled extended cases.

Update gate hashes, totals, thresholds, and the decision record together after an approved baseline change.
Do not tune the implementation against individual failed holdout cases.
Freeze new blind labels before their author reads scorer details or result traces.

### Protocol-history diagnostics

The routing command includes the frozen v1 diagnostic when its file exists.
The standalone `npm run eval:protocol-history` command reads the two v2 contracts.
It checks their source epoch before scoring. A mismatch produces `source-expired` without scored sets.
A diagnostic failure does not alter the three routing gate decisions.

## Evidence

[Cited routing records](qa/reviewed/2026-09-30-routing-guide-records.md) retain evidence used by current artifacts.
[Earlier routing history](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/README.md) remains available at the audit base.
