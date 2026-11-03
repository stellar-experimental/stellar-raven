---
id: sd-093
service: stellar-docs
status: verified
discovered: 2026-11-03
upstreamTitle: "Distinguish read-only overlap from footprint write conflicts"
evidence:
  - "research/audits/2026-11-03-qa-followup/additional-source-findings.json (OC-FOOTPRINT-CONFLICT; fresh source receipts, case/review/packet hashes, owner proof, and fixture results)."
  - "Current source: https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/learn/fundamentals/contract-development/storage/persisting-data.mdx; SHA256 96d9869f47d9be00d5fbf87b8d158e312b2757d48bec49569e5d115cb2cad403; Git blob ad0715f7d4ef1123ca354af114076e70bc0f6ee3."
  - "Published page: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/persisting-data.md; SHA256 341dad73f10891a8e830b6e184f833ca3de467cbda35217a2238084c23243148."
  - "Case q-protocol-parallel-execution; review SHA256 90e76cc8b8a06b89658cdeda4cd21d1ac5c06eff58f7e9413924214af1e90e37; packet SHA256 2b8da6b11aa1f122e601bd2455a4a4c30da7ff0270c9bde3142a20cb409e4aa0; full source-row SHA256 62e3101dd1cec1f88a8a934208b43255b619eef12ff165c8bd75236428139ffa."
---

## Finding

The storage page says transactions with overlapping footprints must execute sequentially.
CAP-0063 defines a conflict only when at least one shared-key access permits writing.
Two read-only accesses to the same key do not create that conflict.
The current sentence overstates the serialization rule.

## Evidence

The [published page](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/persisting-data.md) and [canonical source](https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/learn/fundamentals/contract-development/storage/persisting-data.mdx) contain the reported text.

[CAP-0063](https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0063.md) defines the read/write dependency rule for Protocol 23.
The local matrix checks RO/RO, RO/RW, RW/RO, RW/RW, and disjoint keys.
This fixture tests the specification's rule.
It does not run or benchmark the Core scheduler.

The owner is stellar/stellar-docs at source revision 85d2d1b8e7a4451b7a6af0931f587ce73109b816.
Canonical edit path: `docs/learn/fundamentals/contract-development/storage/persisting-data.mdx`.

## Recommendation

State that a shared key creates a conflict when at least one transaction lists it as read-write.
Say that nonconflicting transactions may execute in parallel.
Keep stage ordering, cluster limits, and configured parallel capacity separate.
