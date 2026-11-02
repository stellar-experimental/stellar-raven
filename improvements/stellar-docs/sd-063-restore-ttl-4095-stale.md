---
id: sd-063
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: State-archival page gives a stale restored-entry TTL of current_ledger_number + 4095
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival returned HTTP 200 with "The restored entry will have its live until ledger extended to the minimum the network allows for newly created entries, which is current_ledger_number + 4095 for persistent entries."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/learn/fundamentals/contract-development/storage/state-archival.mdx line 177
  - 2026-11-02T17:19:29Z `stellar network settings --network mainnet --output json` state_archival.min_persistent_ttl 2073600, min_temporary_ttl 17280, max_entry_ttl 3110400
  - 2026-11-02T17:17:27Z the live storage-strategies appendix https://developers.stellar.org/docs/build/guides/storage/storage-strategies says "Min TTL - persistent/instance create or restore 2,073,600 ledgers ≈ 120 d"
  - 2026-11-02T17:20:48Z Raven stellarDocs.search_docs "restore persistent entry minimum TTL 4095" returned the state-archival RestoreFootprintOp record with the 4095 text
  - golden cases q-sor-p23-auto-restore-extendto and q-sor-force-fast-archival-localnet (golden audit pass 2, 2026-11-02)
  - state-archival.mdx line 179 defines [minimum] as stellar-core 2109a168 src/ledger/NetworkConfig.h#L77-L78, which is the initial constant MINIMUM_PERSISTENT_ENTRY_LIFETIME = 4096
  - 2026-11-02 stellar-core master b8c4f12d6f src/transactions/RestoreFootprintOpFrame.cpp lines 126-127 compute restoredLiveUntilLedger = ledgerSeq + archivalSettings.minPersistentTTL - 1
  - 2026-11-02 grep of stellar/stellar-docs main 5142b219 docs/ for 4095, 4096, and 4,096 finds no other prose that gives an initial TTL constant
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/3000
---

## Finding

The RestoreFootprintOp section gives a fixed restored-entry TTL of
`current_ledger_number + 4095` for persistent entries. The live Mainnet minimum persistent TTL is
2,073,600 ledgers. The value 4095 comes from the initial network configuration.

The same sentence says that the minimum is a network configuration parameter. The number in the
sentence is therefore stale, and the docs storage-strategies appendix gives the current value.

A reader can calculate a restored entry's TTL as about 5.7 hours instead of about 120 days.

## Evidence

The live page says: "The restored entry will have its live until ledger extended to the minimum
the network allows for newly created entries, which is `current_ledger_number + 4095` for
persistent entries. The minimum TTL value is a network configuration parameter and is subject to
be updated (likely increased) via network upgrades."

On 2026-11-02, the Mainnet `state_archival` setting has `min_persistent_ttl` 2073600. The
storage-strategies appendix on the same site says 2,073,600 ledgers for persistent and instance
create or restore.

## Recommendation

Replace the fixed number with the setting name. For example: the restored entry's live-until
ledger is `current_ledger_number + minPersistentTTL - 1`. Link to the "Minimum TTL" section on
the same page, which already points to the Lab network-limits page.

The `[minimum]` reference link points to the initial constant
`MINIMUM_PERSISTENT_ENTRY_LIFETIME = 4096` in a pinned stellar-core `NetworkConfig.h`. Remove
that link, or point it to the current network-limits source.

Optional: add the current Mainnet value with an as-of date.
