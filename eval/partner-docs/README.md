# Partner-doc retrieval diagnostic

This instrument compares required facts in Raven results with facts in allowlisted public partner documentation.
It measures source coverage. It does not measure final-answer quality or authorize a runtime adapter.

## Run

Reuse the existing local Raven server and substitute its bound URL:

```sh
npm run eval:partner-docs -- --raven-url http://localhost:8787/mcp
```

The [case file](cases.json) defines questions, baseline sources, candidate URLs, and literal fact groups.
The [schema](cases.schema.json) defines the allowed source IDs and case fields.
Each baseline composes its declared sources in one `execute` call.
Supported sources include Stellar Docs operations, `scout.searchResearch`, and two pinned OpenZeppelin skills.
The candidate arm combines its declared documents. Both arms use the same fact matcher.
A run without `--raven-url` measures only the candidate documents and reports an inconclusive retrieval gate.

## Fetch boundaries

The harness makes read-only GETs to candidate URLs from the validated case file.
Code restricts Alchemy URLs to `https://www.alchemy.com/docs/**/*.md` or admitted `llms.txt` files.
OpenZeppelin URLs must address MDX below the `OpenZeppelin/docs` Stellar or Relayer content roots.
The fetch helper validates redirect targets, content types, UTF-8 decoding, and a 256 KiB document limit.
It never connects to partner MCP servers or invokes APIs described by the documents.

Measured OpenZeppelin URLs use pinned commits.
Each result records the resolved commit and body SHA-256.
A missing or failed baseline makes the retrieval gate `inconclusive`; it does not reduce the comparison denominator.

## Case cohorts and scoring

`page-derived` questions come from reading the candidate page.
`paraphrase`, `negative`, and `conflict` questions represent independently identified information needs.
Each independent case requires provenance that lets a reviewer check that claim.
The gate counts independent cases; it does not verify their independence.

All cohorts use literal fact groups drawn from candidate pages.
A high candidate score therefore does not establish generalization or answer quality.
Repeated fact groups count toward `totalFacts`; `distinctFactGroups` identifies their shared evidence.
Neither count measures statistically independent observations.

The `alchemy-stellar-balances` case includes the phrases `data envelope` and `results under a data envelope`.
The [dated authoring review](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/partner-docs/README.md#the-one-miss-is-a-case-authoring-defect-not-a-source-gap)
found that wording on a sibling page, rather than the selected balances page.
Treat a miss on that group as an authoring limitation, not proof of a source gap.

An absence claim must identify the checked sources and method.
A text search over rendered HTML alone does not establish source absence.
A conflict case tests whether both claims are retrievable; only an answering evaluation tests whether an agent keeps them separate.

## Gate and interpretation

The retrieval gate requires all of these conditions:

- Every baseline case produces a score without a baseline error.
- Candidate recall exceeds baseline recall by at least 20 percentage points.
- At least three cases improve, and no case regresses.
- Candidate fetches produce no errors.
- At least four cases carry an independent case type.

Use a fresh paired run after source or case changes.
Compare the declared source sets and result hashes before interpreting a difference.
Single-run latency and prompt-signal counts do not prove reliability or security.

The harness always reports `headlineQaGate: not-run` and `shipDecision: do-not-ship-runtime-adapter`.
The [source-admission design](../../research/partner-doc-source-onboarding.md) defines the remaining QA, resilience, drift, and security gates.
The [dated measurements](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/partner-docs/README.md)
preserve earlier comparisons and their limitations.
