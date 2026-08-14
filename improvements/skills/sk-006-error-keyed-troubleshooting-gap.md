---
id: sk-006
service: skills
status: fixed-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-ti-cli-rust-windows-troubleshooting)
  - live zero-hit probes for exact error strings across search_docs + skill sections (2026-07-03 evening)
  - Solo project 49, todo 807, scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): search_sdk_cli_tools_docs on 'No such file or directory wasm' → 5 generic Lab/Quickstart/cookbook hits, still no error-keyed missing-wasm/wrong-path troubleshooting row
  - upstream source rechecked 2026-07-09 at stellar/stellar-dev-skill skills commit c2f3c07: smart-contracts development.md contains no "No such file or directory", link.exe, alias-already-exists, or unable-to-fund troubleshooting row
  - upstream issue filed 2026-07-09: https://github.com/stellar/stellar-dev-skill/issues/53
  - "2026-08-14 read-only probe: npm run improvements:probes -- --service skills returned sk-006 fixed-candidate (status 200 == 200; excludes \"No such file or directory\": false), so the original trigger no longer reproduces"
  - 2026-08-14 current stellar/stellar-dev-skill main at 792c608cf697a22ed1194626a8e1e1d8dcc22659; skills/smart-contracts/development.md lines 422-453 now key the troubleshooting table to verbatim CLI and compiler output and cover missing WASM, wrong workspace, link.exe/MSVC, identity collision, contract-alias collision, and Unable to fund account
  - "2026-08-14 exact rows verified at that commit: \"reading file target/wasm32v1-none/release/my_contract.wasm: No such file or directory (os error 2)\"; \"linker `link.exe` not found\" with \"the msvc targets depend on the msvc linker but `link.exe` was not found\"; \"An identity with the name 'alice' already exists\"; \"alias 'x' is already referencing contract 'C…' on network '…'\"; \"Unable to fund account alice on …\" with the exit-0 caveat; plus the \"No wasm at the path you passed\" subsection at lines 446-453"
  - 2026-08-14 upstream issue 53 is closed with state_reason completed after merged PR 93; merge commit 677a6aaf940ea1b1b695da8f08e5515d693f6311
  - https://github.com/stellar/stellar-dev-skill/pull/93
  - independent review Solo todo 1555 (process 4601, actor mcp-93dde25c60b4a7f7) classified fixed; root re-derived the same commit, lines, issue state, and merge commit in todo 1555 comment 4081
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

### Resolution, 2026-08-14

Upstream fixed this. The current `main` at
`792c608cf697a22ed1194626a8e1e1d8dcc22659` opens the troubleshooting table with
the rule this record asked for: "Rows are keyed by the text the CLI or the
compiler actually prints — search this table for the string you got, not for a
paraphrase of it."

Every probed failure now has a verbatim row. The missing-WASM row reads
`reading file target/wasm32v1-none/release/my_contract.wasm: No such file or
directory (os error 2)` and routes to a "No wasm at the path you passed"
subsection that splits the two branches this record named: a wasm built
elsewhere, and no wasm built at all with a zero exit. The Windows row carries
both ``linker `link.exe` not found`` and ``the msvc targets depend on the msvc
linker but `link.exe` was not found``. The funding row carries `Unable to fund
account alice on …` together with the exit-0 caveat.

**One original premise was wrong and upstream corrected it.** This record asked
for a row keyed to `alias already exists`. The Stellar CLI never prints that
string. Upstream instead added the two real messages: `An identity with the name
'alice' already exists` for the identity collision, and `alias 'x' is already
referencing contract 'C…' on network '…'` for the contract-alias collision. The
alias row also records that `stellar contract deploy --alias` overwrites without
asking. The shorthand this record used is not added to the probe, because it is
not emitted output and would key a search token no builder can paste.

The probe is retained unchanged so a distinct resolver can re-run the original
trigger. `fixed-upstream` records are skipped by the default probe runner.

## Recommendation

In the upstream skill source, extend the `development.md` troubleshooting
table with rows keyed by the *verbatim error text* a builder will paste
("no such file or directory: target/wasm32v1-none/release/*.wasm",
"alias already exists", "linker `link.exe` not found", "Unable to fund
account"), each with the two-branch diagnosis (did the build produce a
wasm at all? is the path/workspace the one the command reads?). Verbatim
error strings are what agents and humans search by; today those searches
zero-hit.
