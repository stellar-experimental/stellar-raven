---
id: sd-110
service: stellar-docs
status: verified
discovered: 2026-11-14
upstreamTitle: Lab Contract Explorer page lists JSON, Python, and Java as Stellar CLI binding languages
probe:
  type: http-text
  url: https://developers.stellar.org/docs/tools/lab/smart-contracts/contract-explorer.md
  expect:
    status: 200
    contains:
      - "TypeScript, JSON, Rust, Python, and Java"
evidence:
  - "2026-11-14 GET https://developers.stellar.org/docs/tools/lab/smart-contracts/contract-explorer.md returned HTTP 200. The Bindings section (line 84) says: \"Bindings are a feature of the Stellar CLI that generate fully typed client libraries for your smart contracts, tailored to your chosen programming language, including TypeScript, JSON, Rust, Python, and Java.\""
  - "Source: stellar/stellar-docs main 62f29bbbfef70a7b79cf6d632e750bf51e768f95, docs/tools/lab/smart-contracts/contract-explorer.mdx line 87. gh search code for the phrase in stellar/stellar-docs matches only this file."
  - "Adjacent copy: stellar/laboratory default branch, src/app/(sidebar)/smart-contracts/contract-explorer/components/Bindings.tsx lines 8 to 11 show the same sentence in the Lab Bindings tab (file last changed 2026-07-29, f0103e70)."
  - "2026-11-14 stellar 30.0.1 (latest release, published 2026-11-03): `stellar contract bindings --help` lists rust; typescript (\"⚠️ Deprecated, use the JavaScript Stellar SDK instead\"); and python, java, flutter, swift, php, kmp, each \"(requires external plugin)\". `stellar contract bindings python` and `stellar contract bindings java` print \"binding generation is not implemented in the stellar-cli, but is available via the tool located here: https://github.com/lightsail-network/stellar-contract-bindings\" and exit 1. `stellar contract bindings json` fails with \"unrecognized subcommand 'json'\" and exits 2."
  - "CLI source: stellar/stellar-cli v30.0.1, cmd/soroban-cli/src/commands/contract/bindings.rs, enum Cmd has Rust, Typescript, Python, Java, Flutter, Swift, Php, and Kmp. No JSON variant. The six plugin variants carry \"(requires external plugin)\"."
  - "Same site, correct claim: GET https://developers.stellar.org/docs/tools/cli/stellar-cli.md (2026-11-14) lines 292 to 298 list typescript as deprecated and python, java, flutter, swift, php, and kmp as \"requires external plugin\". The resolved finding sd-052 fixed that manual on 2026-10-02."
  - "2026-11-14: a model answering from Stellar Docs search retrieved this Contract Explorer section and quoted it, attributed to the Lab Contract Explorer, as the CLI's binding language coverage (baseline run 2026-11-14T20-13-51-variantA, q-soroban-cli-bindings)."
  - "Classification: docs-content. The section undertakes to say which languages the CLI binding command covers and names one that does not exist and two that the CLI does not generate."
  - "Affected golden case: eval/qa/corpus/battery/soroban/q-soroban-cli-bindings.json (key fact 3; no golden change). Ledger: .agents/rounds/2026-11-14-baseline-tuning/CASE-DEFECTS.md."
---

## Finding

The Lab Contract Explorer page gives a wrong list of Stellar CLI binding languages. It says the
CLI generates bindings in "TypeScript, JSON, Rust, Python, and Java".

The current CLI has no JSON bindings command. It does not generate Python or Java bindings. Those
commands exit with an error and point to an external plugin. The CLI generates Rust bindings. It
marks TypeScript bindings as deprecated in favor of the JavaScript Stellar SDK.

The Stellar CLI manual on the same site is correct. A reader who starts from the Lab page gets
the wrong list.

## Evidence

Read-only reproduction:

```sh
curl -sS https://developers.stellar.org/docs/tools/lab/smart-contracts/contract-explorer.md | grep -n "Python, and Java"
stellar --version                      # stellar 30.0.1
stellar contract bindings --help
stellar contract bindings python; echo "exit=$?"   # not implemented; exit=1
stellar contract bindings json; echo "exit=$?"     # unrecognized subcommand; exit=2
```

The Lab Bindings tab shows the same sentence. Its source is
`src/app/(sidebar)/smart-contracts/contract-explorer/components/Bindings.tsx` in
stellar/laboratory.

## Recommendation

Replace the language list in the Bindings section with:

> The Stellar CLI generates Rust bindings. It also generates TypeScript bindings, but that
> command is deprecated in favor of the JavaScript Stellar SDK generator. Python, Java, Flutter,
> Swift, PHP, and Kotlin Multiplatform bindings need an external plugin.

Optional: link the CLI manual section for the full command list. The same sentence in the Lab
`Bindings.tsx` component needs the same change.
