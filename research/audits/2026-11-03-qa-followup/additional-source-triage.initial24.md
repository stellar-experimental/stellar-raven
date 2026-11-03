# Additional source triage

This pass assesses all eight candidates with 24 free primary reads.
All 24 reads return HTTP 200. This pass follows no redirect and makes no retry.
This pass makes no model call, network simulation, paid dataset query, or external write.

| Candidate | Disposition | Action |
| --- | --- | --- |
| OC-JSON-PARSE | confirmed-error; new-verified-finding | sd-089; Remove the second JSON.parse and retain separate JSON-RPC success/error handling. |
| OC-RWA-ARITHMETIC | confirmed-internal-inconsistency; held-owner-and-denominator | Ask the site editor to identify the period, denominator, and component set before correcting any rate. |
| OC-PHOENIX-COUNT | confirmed-page-denominator-mismatch; held-owner-and-status-dates | Make the statistic use the same status-filtered submission IDs, or name a different authoritative denominator. |
| OC-PASSKEY-STORAGE | ambiguous-overbroad-wording; held-actual-flow-scope | Clarify device-bound versus synchronized credentials and website non-disclosure after checking the SDP registration configuration. |
| OC-MUXED-SOURCE | confirmed-error; new-verified-finding | sd-090; Exclude muxed inner transaction and operation sources for this invocation from Protocol 25 onward. |
| OC-FOOTPRINT-CONFLICT | confirmed-error; new-verified-finding | sd-091; Distinguish RO/RO overlap from RO/RW and RW/RW conflicts. Preserve may-execute wording and scheduling limits. |
| OC-CHANGE-TRUST | deletion-concern-disproven; ambiguous-description-no-new-finding | Keep the candidate deletion claim false. An optional table clarification can name the underlying pool asset and authorization predicate. |
| OC-META-TYPE | confirmed-error; new-verified-finding | sd-092; Correct only the field type and link. Preserve the declined operational-limit policy. |

Four new verified findings use sd-089 through sd-092.
Four candidates receive precise held or no-new-finding dispositions.
No original answer, grade, digest hash, reference, or measurement contract changes.

## Source and owner proof

The current stellar/stellar-docs tree has revision `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
Each new finding names an existing file in that tree.
Fresh raw bytes match the tree Git blob identity.
The published page retains each affected claim.
Required per-finding intake mappings target stellar/stellar-docs.
Root will add these mappings and regenerate INDEX. This lane edits neither file.

## OC-JSON-PARSE

The current example parses the object returned by response.json() a second time.
Remove the second JSON.parse and retain separate JSON-RPC success/error handling.

Case: `q-infra-simulate-transaction-howto`.
Review SHA-256: `bd938e28e69fd4dc8941e2e65ee1c10b89aac4d94a48db511eb340c663a60df0`.
Packet SHA-256: `a4cf3f90a8ee33c79629c0f4f79854d2cce08391ab400d3a86e0a5908d55a99b`.
Source row SHA-256: `237f89f8b156259898676a5e9146db5c5cd08e05d81626f4b3ef002719db3550`.
Primary reads: 1, 2, 10.

- The local fixture mocks HTTP. No network simulation or transaction executes.

## OC-RWA-ARITHMETIC

The rounded endpoint intervals imply 77.2655% to 78.4565%, outside the displayed 91% interval.
Ask the site editor to identify the period, denominator, and component set before correcting any rate.

Case: `q-asset-rwa-tokenized-freshness`.
Review SHA-256: `3427cc9aad3f160deb74393aea1cf7b0b6af445ead993cc48533c9b4e224fafd`.
Packet SHA-256: `96a863c0bc4d6aea833380d4e39a3f81b9215942ef0a49c0c84702de46344ca2`.
Source row SHA-256: `6d35452fb86251efa9e85d214d7754006bb62ed925387f3e76e59e5b981cb6fd`.
Primary reads: 3.

- No public edit-owner repository is verified. No finding ID is assigned.
- The true unrounded growth rate remains unresolved. Do not replace 91% with an asserted 77.86%.
- The paragraph describes ex-stablecoin RWAs from Q4 2025 to Q1 2026. Hidden component changes remain possible.

## OC-PHOENIX-COUNT

The page labels seven awarded submissions, but its seven distinct IDs contain four Awarded statuses.
Make the statistic use the same status-filtered submission IDs, or name a different authoritative denominator.

Case: `q-defi-phoenix-what-is`.
Review SHA-256: `8eead9edd597257b3ca16ba87c6b97ceb04ade1e5f29f6d4619027aa6ffd84f8`.
Packet SHA-256: `e830b5267372b1ee8aac92b44ac765315a35947a2622ca2ccf15691c69759c67`.
Source row SHA-256: `15f14927b270094dd426047c4ea7edebff48b02b07e73e9ae9616070cef07d0f`.
Primary reads: 4.

- The page supplies no status-effective dates or verified source-owner repository. No finding ID is assigned.
- The observed four-status count does not rewrite historical awards or establish a complete backend inventory.

## OC-PASSKEY-STORAGE

The tutorial says the key never leaves the device. Google documents encrypted provider-managed synchronization.
Clarify device-bound versus synchronized credentials and website non-disclosure after checking the SDP registration configuration.

Case: `q-passkey-platform-constraints`.
Review SHA-256: `f0e3f2c50323d7c25a427cc58e079d0e37c2ffd968e1f0f134bbcad0519896d9`.
Packet SHA-256: `84f00279d5c0e123a5727f797ecdf0474f38c983694bca7a784763e45a1faef8`.
Source row SHA-256: `7368f9795e5192e947320442eb47aec06a5fcb436815a519326a1b8a342a72b4`.
Primary reads: 1, 5, 11, 19.

- Provider synchronization does not expose private keys to websites.
- This budget does not establish whether the actual SDP flow restricts credential backup eligibility.
- No verified application security defect or new finding ID follows from this wording alone.

## OC-MUXED-SOURCE

The generic source matrix omits the InvokeHostFunction exception enforced by Core v29.0.0 and v30.0.0.
Exclude muxed inner transaction and operation sources for this invocation from Protocol 25 onward.

Case: `q-pc-muxed-accounts`.
Review SHA-256: `c00e62867a4934936a47c1996858999aaf8d818cfe16be782511e1c2ea49c62e`.
Packet SHA-256: `1c8b6c7941e2ab6fd10a19e43363c47c483140ae89ce7c9d7c6d45b56ec37a19`.
Source row SHA-256: `003eda477402f2e86554d0ba00d5cb01040b824e2ebda939448371ce6ca6fb0a`.
Primary reads: 1, 6, 12, 15, 16.

- The helper fixture uses production function bodies with minimal input stubs. It does not run a full Core transaction.
- The exception does not ban the fee-bump fee source or the SAC destination interface.

## OC-FOOTPRINT-CONFLICT

The page treats every overlapping footprint as contention. CAP-0063 requires at least one write access.
Distinguish RO/RO overlap from RO/RW and RW/RW conflicts. Preserve may-execute wording and scheduling limits.

Case: `q-protocol-parallel-execution`.
Review SHA-256: `90e76cc8b8a06b89658cdeda4cd21d1ac5c06eff58f7e9413924214af1e90e37`.
Packet SHA-256: `2b8da6b11aa1f122e601bd2455a4a4c30da7ff0270c9bde3142a20cb409e4aa0`.
Source row SHA-256: `62e3101dd1cec1f88a8a934208b43255b619eef12ff165c8bd75236428139ffa`.
Primary reads: 1, 7, 13, 18.

- The fixture checks the normative conflict relation. It does not benchmark or execute a Core scheduler.

## OC-CHANGE-TRUST

The error belongs to a new positive-limit pool-share line and an underlying asset authorization check.
Keep the candidate deletion claim false. An optional table clarification can name the underlying pool asset and authorization predicate.

Case: `q-raph-remove-scam-token`.
Review SHA-256: `661763c18176c35aab2c7f379f69bf9b1a7ce30ee3d066697ed2b9c86dab9d39`.
Packet SHA-256: `b726a76c65c945735d04541f3e8e59a0025153688f7e5b5c2ef1e6e404397cfa`.
Source row SHA-256: `eb53d800a0c67fe50d840942dc929e3e39255edc6526549ea7a6cfd7200c8aee`.
Primary reads: 1, 8, 14, 17.

- The generic description lacks context but does not assert a deletion rule.
- Ordinary zero-limit deletion still needs balance, liability, pool-reference, and other applicable checks.
- The extracted helper fixture does not execute the complete ledger operation or redefine authorization flags.

## OC-META-TYPE

The field is TransactionMeta. The page names TransactionResultMeta and uses a malformed L446https link.
Correct only the field type and link. Preserve the declined operational-limit policy.

Case: `q-ti-rpc-gettransactions-pagination-xdr`.
Review SHA-256: `4e3ee1909698963cd7e673407b3692b73a6fc6520489dc533095e10d1b619972`.
Packet SHA-256: `7d6d68cbd706047f8684b5085b10f366e76239729851f63bd2961171af41a87a`.
Source row SHA-256: `77e3657488863ee37f769573065659903fbbaf02ec4f44f9b25529ed0b7c14b7`.
Primary reads: 1, 9, 20, 21, 22, 23, 24.

- The SDK 17.4.0 fixture tests an actual parser using synthetic unsigned metadata.
- The live sd-004 issue, comment, and PR files cover limits only. No duplicate limit request is made.

## Precision and denominator checks

The RWA start interval is $854.55M to $854.65M under nearest-unit rounding.
The end interval is $1,515M to $1,525M.
Their possible growth interval is approximately 77.2655% to 78.4565%.
The displayed 91% interval is 90.5% to 91.5%.
These intervals do not overlap. Rounded endpoints alone are not treated as exact values.
The source still needs matching component and date identities before anyone states the true growth rate.

The Phoenix projection deduplicates seven submission IDs and filters status exactly Awarded.
Four IDs pass that filter. Their budgets sum to $394,500.
The page statistic says seven awarded submissions.
The page supplies no status-effective dates. The receipt records the observation date only.
This pass makes no claim about historical award decisions.

The official pages establish SDF publication, but they do not establish a public editing repository.
Both concerns remain held for exact source ownership and any missing denominator evidence.

## Declined coverage

The live sd-004 issue, maintainer comment, and merged PR files concern operational pagination limits.
The PR changes only the pagination structure page.
They contain no TransactionMeta or TransactionResultMeta correction.
The new sd-092 record addresses only the field type and malformed link.
It preserves the owner decline and makes no limit request.

## Local fixture limits

The JavaScript fixtures extract the current simulation function and exercise the actual installed SDK parser.
The Core fixtures compile production helper bodies with minimal input and ledger stubs.
They do not execute complete Core transactions.
The conflict matrix checks the CAP rule. It does not measure scheduler behavior or throughput.
The ChangeTrust path check identifies a positive-limit new pool-share line and its underlying reserve asset.
It does not turn an ordinary trustline deletion into a pool-authorization operation.

## Integration

Root owns intake mappings, INDEX regeneration, existing record changes, and source patch integration.
This lane adds four new local records and two public triage files.
No existing finding, corpus file, digest file, ledger, TODO, or frozen method file changes in this lane.

