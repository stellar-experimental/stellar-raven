---
id: sd-052
service: stellar-docs
status: reported-upstream
discovered: 2026-09-04
upstreamTitle: CLI manual presents unimplemented bindings as generators
evidence:
  - 2026-09-08 fresh execution used the current v28.0.0 release binary, SHA-256 10c5abc3796505626c098583b4bdc6d4bf52dd50157aa710c62e3d9cb348326b. `python`, `java`, `flutter`, `swift`, and `php` each exited 1 with the same not-implemented error. The current generated manual still labels them as generators; rendered SHA-256 96d0a29ea5598340d1289165354f48ce94be8c063a054b9ff022429f73ca1170.
  - 2026-09-04 live read of https://developers.stellar.org/docs/tools/cli/stellar-cli lists Python, Java, Flutter, Swift, and PHP under Generate bindings
  - 2026-09-04 local read-only run of stellar 27.1.0 showed each listed placeholder command exits with a not implemented error and links to https://github.com/lightsail-network/stellar-contract-bindings
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-soroban-cli-bindings presented placeholder languages as built-in generators and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
  - upstream issue filed 2026-09-09: https://github.com/stellar/stellar-cli/issues/2722
---

## Finding

The generated CLI manual lists five placeholder languages as binding generators.
Each command exits before generating bindings in Stellar CLI 28.0.0.

The page therefore advertises unavailable built-in capability.
This caused a candidate answer to claim support for Python and Java.

## Evidence

On 2026-09-08, the manual listed Python, Java, Flutter, Swift, and PHP under `stellar contract bindings`.
The current v28.0.0 CLI reported that each generator is not implemented in stellar-cli.
Each error directed users to the external Lightsail Network tool.

On 2026-09-04, Rust and TypeScript accepted their documented input forms in v27.1.0.
The defect affects only the placeholder-language descriptions.

## Recommendation

Mark each placeholder language as not implemented in the generated command description.
Link the external tool as an alternative.
Or remove the placeholder commands from the shipped CLI help until implementation exists.
