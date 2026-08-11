---
id: sk-006
service: skills
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-ti-cli-rust-windows-troubleshooting)
  - live zero-hit probes for exact error strings across search_docs + skill sections (2026-07-03 evening)
  - Solo project 49, todo 807, scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): search_sdk_cli_tools_docs on 'No such file or directory wasm' → 5 generic Lab/Quickstart/cookbook hits, still no error-keyed missing-wasm/wrong-path troubleshooting row
  - upstream source rechecked 2026-07-09 at stellar/stellar-dev-skill skills commit c2f3c07: smart-contracts development.md contains no "No such file or directory", link.exe, alias-already-exists, or unable-to-fund troubleshooting row
  - upstream issue filed 2026-07-09: https://github.com/stellar/stellar-dev-skill/issues/53
recurrences:
  - date: 2026-07-09
    evidence: current upstream smart-contracts/development.md still has zero verbatim "No such file or directory" rows, leaving the missing-wasm/wrong-workspace failure ungrounded
  - date: 2026-07-10
    evidence: GT-41 reproduced distinct no-contract-context, non-root auth, event-testutils, ledger-testutils, and Bad-union-switch failures that remain absent from error-keyed troubleshooting
  - date: 2026-07-13
    evidence: structured HTTP probe returned 200 and still found no "No such file or directory" troubleshooting row in the upstream smart-contracts development guide
  - date: 2026-08-11
    evidence: structured HTTP probe returned 200 and still found no verbatim "No such file or directory" troubleshooting row in the upstream smart-contracts development guide
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/smart-contracts/development.md
  expect:
    status: 200
    excludes:
      - No such file or directory
---

## Finding

The smart-contracts skill lacks error-keyed troubleshooting for common CLI and build failures.

Neither the `stellar-dev/smart-contracts` skill's troubleshooting table
(`development.md` §Troubleshooting) nor the docs corpus carries
error-message-keyed guidance for common CLI/build failures. Probed this
round: "No such file or directory" on a missing `.wasm` output path
(build succeeded in the wrong workspace/package, or silently produced no
wasm), "alias already exists", link.exe/MSVC setup on Windows, "Unable to
fund account". `stellarDocs.search_docs` on the exact strings returns
irrelevant hits (XDR/Lab pages) and the skill table has no
missing-wasm/wrong-path row. Agents answering troubleshooting questions
must fall back on general knowledge, and graders can't distinguish a
good general answer from a corpus-grounded one. Distinct from sk-001
(stale build target — which the agent in this round correctly avoided by
preferring docs).

## Evidence

Live probes 2026-07-03: `search_docs({query:'"No such file or
directory" wasm'})` → XDR/Lab pages only; `search_sdk_cli_tools_docs`
build/output/workspace queries → cookbook lifecycle pages only; local
read of `development.md` troubleshooting table → no matching row. The QA
case was graded partial for missing exactly the diagnostic branch
(build-succeeded-but-wrong-path) that no corpus source prompts.

## Recommendation

In the upstream skill source, extend the `development.md` troubleshooting
table with rows keyed by the *verbatim error text* a builder will paste
("no such file or directory: target/wasm32v1-none/release/*.wasm",
"alias already exists", "linker `link.exe` not found", "Unable to fund
account"), each with the two-branch diagnosis (did the build produce a
wasm at all? is the path/workspace the one the command reads?). Verbatim
error strings are what agents and humans search by; today those searches
zero-hit.
