---
id: sd-044
service: stellar-docs
status: reported-upstream
discovered: 2026-08-14
upstreamTitle: Quickstart documentation omits the shipped --enable-core-manual-close flag
evidence:
  - 2026-08-14 code search over stellar/stellar-docs for "enable-core-manual-close" returned zero results
  - 2026-08-14 read of stellar/quickstart start script shows the flag ships today; line 47 sets ENABLE_CORE_MANUAL_CLOSE=false, line 202 parses --enable-core-manual-close, and line 520 writes it into etc/stellar-core.cfg
  - 2026-08-14 live stellarDocs.search_docs for "enable-core-manual-close quickstart manual close ledger" returned eight hits, all about LedgerCloseMeta ingestion, and none about the flag
  - 2026-08-14 read of the stellar/quickstart README found no manual-close documentation either
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, row q-quickstart-manual-ledger-close
  - Solo scratchpad 809, todo 1542 review
  - upstream issue filed 2026-08-19: https://github.com/stellar/stellar-docs/issues/2772
recurrences:
  - date: 2026-08-30
    evidence: same-100 row q-quickstart-manual-ledger-close and its independent live review confirmed that stellar/quickstart/start still parses --enable-core-manual-close and that current Quickstart Docs do not teach the flag or manualclose operation
---

## Finding

The Quickstart container supports a manual ledger-close mode. The
`stellar/quickstart` `start` script parses `--enable-core-manual-close` and
writes the value into the generated `etc/stellar-core.cfg`.

Stellar Docs do not document the flag. The site holds a full Quickstart
section at `/docs/tools/quickstart/`, including `advanced-usage/container`,
`advanced-usage/operation-modes`, and `advanced-usage/run-command-examples`.
None of those pages names the flag. A repository-wide search of
`stellar/stellar-docs` for the exact string returns zero results.

Docs search cannot recover the flag either. A live search for the flag name
returns only ledger-ingestion pages.

Deterministic ledger close is a common local-test requirement. A developer who
needs it today must read the Quickstart shell script. The Quickstart section
already undertakes to document the container's run options, so this is an
omission on an existing page family.

The related count behavior is a separate upstream request. Stellar Core issue
4040, "Support manual closing N ledgers", is open. A manual close advances one
ledger per call today. Documentation should state that limit rather than imply
a count parameter exists.

## Evidence

The code search, the live docs search, and the source reads all ran on
2026-08-14.

The `stellar/quickstart` `start` script carries these three lines:

```sh
: "${ENABLE_CORE_MANUAL_CLOSE:=false}"
    --enable-core-manual-close)
  run_silent "finalize-core-config-manual-close" perl -pi -e "s/__MANUAL_CLOSE__/$ENABLE_CORE_MANUAL_CLOSE/g" etc/stellar-core.cfg
```

## Recommendation

Add `--enable-core-manual-close` to the Quickstart run options on
`/docs/tools/quickstart/advanced-usage/`. Give the flag name, the default value
`false`, and the Stellar Core setting it controls.

Add one run-command example that starts a local network with the flag enabled.

State that one manual close advances one ledger, and link Stellar Core issue
4040 for the pending count request.
