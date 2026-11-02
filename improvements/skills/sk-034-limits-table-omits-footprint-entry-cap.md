---
id: sk-034
service: skills
status: fixed-upstream
discovered: 2026-11-02
upstreamTitle: "Resource-limits table omits the 400-entry footprint cap and labels the 200 disk-read limit as all reads"
evidence:
  - "2026-11-02T21:23Z stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 skills/smart-contracts/development.md lines 388-399, 'Current mainnet per-transaction ceilings' table. It has the row '| Ledger entries read / written | 200 / 200 |' and no row for total footprint entries."
  - "2026-11-02T21:24:24Z `stellar network settings --network mainnet --output json` (stellar-cli 28.1.0): contract_ledger_cost_ext_v0.tx_max_footprint_entries 400; contract_ledger_cost_v0.tx_max_disk_read_entries 200; tx_max_write_ledger_entries 200. The CLI warned that the network runs Protocol 29 and the CLI supports 28; the fields above are present in the fetched config."
  - "stellar-core master src/ledger/NetworkConfig.h line 383 declares txMaxFootprintEntries(); NetworkConfig.cpp lines 1324-1328 initialize it from the older txMaxDiskReadEntries value at the upgrade that introduced the setting."
  - "The setting name tx_max_disk_read_entries shows that 200 limits disk reads only, not every read-only footprint entry."
  - "Dedupe 2026-11-02: no stellar/stellar-dev-skill issue or PR (all states) mentions footprint entries or tx_max_footprint_entries; no Raven finding covers the skill table."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R08."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-dev-skill/issues/164
  - "fixed upstream 2026-11-02: https://github.com/stellar/stellar-dev-skill/pull/171 merged and closed #164. Live recheck of the published skill source at stellar/stellar-dev-skill main 9c604c2be6ae69f962fbb578bce6b681d462fea5 (2026-11-02T22:48:07Z): skills/smart-contracts/development.md line 399 adds 'Footprint entries (read-only + read-write) | 400', and line 400 reads 'Disk-read entries / written entries | 200 / 200'."
---

## Finding

The resource-limits table in `skills/smart-contracts/development.md` has no row for the total footprint size.
On Mainnet, `tx_max_footprint_entries` is 400.
The table row "Ledger entries read / written | 200 / 200" gives the disk-read and write limits.
The label "read" suggests that 200 limits every entry in the read footprint.

A developer who sizes a footprint from this table does not see the 400-entry ceiling.
The developer can also reject a valid design that reads more than 200 in-memory entries.

## Evidence

`stellar network settings --network mainnet --output json` on 2026-11-02 returns
`tx_max_footprint_entries` 400, `tx_max_disk_read_entries` 200, and `tx_max_write_ledger_entries` 200.

## Recommendation

Add the row "Footprint entries (read-only + read-write) | 400".
Rename the existing row to "Disk-read entries / written entries | 200 / 200".
Keep the existing link to Stellar Lab's Network Limits page and the `stellar network settings` command.
