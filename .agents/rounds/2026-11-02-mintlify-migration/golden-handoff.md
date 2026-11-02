# Golden hand-off from the 2026-11-02 Mintlify QA diagnostic

The QA row review (`qa-rows-lane-1.md` to `qa-rows-lane-3.md`) found these golden issues. The
full golden audit (`.agents/rounds/2026-11-02-golden-audit.md`, branch
`eval/golden-audit-2026-11-02`) owns battery edits today, so this branch edits no golden. Each item
needs the `golden-truth` evidence bar before any change.

| Case | Status in the audit or on main | Open point |
|---|---|---|
| `q-sor-confidential-tokens` | Audit `cd449919` now dates the v0.8.0 audit. | None if it lands. |
| `q-builder-content-by-person` | Audit `cd449919` records the `/meetings/authors` 404. | The seven live 2024 meeting pages carry the byline `Tyler van der Hoeven … Developer Advocate Director` (lane 3); they can replace the author index as the source. |
| `q-mpp-discovery-and-modes` | Re-verified on main in #310 (sources fixed). | Key fact 5 says "non-interchangeable adapters". https://mpp.dev/mpp-vs-x402 now says one `mppx` endpoint can serve both protocols for x402-compatible EVM charges. "Never relabel payloads" still holds (lane 2). |
| `q-soroban-instance-storage-dos` | Audit `cd449919`: no gospel change; the atomic-failure row stands. | stellar-core validates entry size on reads too (`InvokeHostFunctionOpFrame.cpp` `addReads` → `validateContractLedgerEntry`; `TransactionUtils.cpp` "ContractData size exceeds network config maximum size", master `b46d35c5`). If validators lower `contract_data_entry_size_bytes` below an existing instance entry, every call fails until the limit rises. Key fact 3 and avoid 1 may need that qualifier (lane 2). |
| `q-anchor-endpoint-discovery` | Audit `cd449919` adds SEP-45. | Key fact 3 grading split: a single judge accepted "derives endpoints only from live stellar.toml"; a panel required an explicit directory caveat. A `notes` line can settle which (lane 1). |
