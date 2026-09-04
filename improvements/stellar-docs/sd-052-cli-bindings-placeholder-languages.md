---
id: sd-052
service: stellar-docs
status: verified
discovered: 2026-09-04
upstreamTitle: CLI manual presents unimplemented bindings as generators
evidence:
  - 2026-09-04 live read of https://developers.stellar.org/docs/tools/cli/stellar-cli lists Python, Java, Flutter, Swift, and PHP under Generate bindings
  - 2026-09-04 local read-only run of stellar 27.1.0 showed each listed placeholder command exits with a not implemented error and links to https://github.com/lightsail-network/stellar-contract-bindings
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-soroban-cli-bindings presented placeholder languages as built-in generators and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
---

## Finding

The generated CLI manual lists five placeholder languages as binding generators.
Each command exits before generating bindings in Stellar CLI 27.1.0.

The page therefore advertises unavailable built-in capability.
This caused a candidate answer to claim support for Python and Java.

## Evidence

On 2026-09-04, the manual listed Python, Java, Flutter, Swift, and PHP under `stellar contract bindings`.
The local CLI reported that each generator is not implemented in stellar-cli.
Each error directed users to the external Lightsail Network tool.

Rust and TypeScript accepted their documented input forms.
The defect affects only the placeholder-language descriptions.

## Recommendation

Mark each placeholder language as not implemented in the generated command description.
Link the external tool as an alternative.
Or remove the placeholder commands from the shipped CLI help until implementation exists.
