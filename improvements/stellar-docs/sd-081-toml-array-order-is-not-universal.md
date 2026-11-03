---
id: sd-081
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Qualify the publishing guide's TOML array ordering rule
evidence:
  - "2026-11-03T00:47:17Z GET https://developers.stellar.org/docs/tokens/publishing-asset-info.md returned HTTP 200. Line 36 says TOML requires arrays at the end. Body SHA-256: 718ace624e81508859c0c2df2ba5720e3c510974ad85378781942be26898e0c9."
  - "2026-11-03T00:38:46Z GET https://toml.io/en/v1.0.0 returned HTTP 200. Its table and array-of-table rules permit the counterexample. Body SHA-256: 728a5c13aef1c14d9e3f2ef7ec7f6bcc9f06f51d770101e50ab365307eb219fe."
  - "Python 3.12.15 tomllib accepted [[CURRENCIES]] before [DOCUMENTATION], with both entries at the intended root. Fixture SHA-256: 9305615eb7f557e92c7373c27a03297e16c7173b462e1507d72cab7a960aabe4."
  - "Retained receipts, fixture, and parser result: research/audits/2026-11-02-golden-overnight/toml-order-*. The parser check proves syntax only, without SEP-1 or wallet acceptance claims."
  - "A new direct-Grok diagnostic answer for q-aas-list-token-on-exchanges-aggregators repeats this rule. Its original correct grade remains unchanged. No aggregate prevalence claim follows."
---

## Finding

The asset publishing guide presents a false universal TOML syntax rule.
Its section-order note says that TOML requires arrays at the end.
The same note recommends the SEP-1 section order.
That recommendation can remain, but the syntax explanation needs qualification.

The failing surface is `docs-content`, owned by `stellar/stellar-docs` under the intake map.
This finding records a direct source claim, rather than an omission inferred from a question.
No external issue was filed.

## Evidence

The [publishing guide](https://developers.stellar.org/docs/tokens/publishing-asset-info.md) contains the claim at line `36`.
The [TOML v1.0.0 specification](https://toml.io/en/v1.0.0#array-of-tables) defines tables and arrays of tables without that universal restriction.
A named root table can follow an array of tables.
The retained fixture places `[[CURRENCIES]]` before `[DOCUMENTATION]`.
Python `3.12.15` parses both entries under the root and preserves their intended values.

The fixture uses placeholder asset identifiers.
It proves TOML syntax, rather than a valid SEP-1 document or acceptance by any wallet.
Arbitrary reordering can still change key ownership or cause errors.
The root table ends at the first table header, and table headers determine later key ownership.
The recommendation must preserve that distinction.

Evidence lives under `research/audits/2026-11-02-golden-overnight/`:

- `toml-order-receipts.json` contains public request descriptors, timestamps, statuses, and exact body hashes.
- `toml-order-fixture.toml` contains the counterexample.
- `toml-order-result.json` contains the parser version, parsed structure, and fixture hash.

One reviewed answer repeats the source claim.
Its original judge score remains `correct`; the separate review records the missed false statement.
The source defect and the judge disagreement remain distinct.
No golden or runtime source changed for this finding.

## Recommendation

Keep the SEP-1 section order as practical guidance.
Replace the universal arrays-at-the-end rule with the actual table ownership rules.
Explain that bare root keys must precede the first table header.
Explain that explicit named tables can follow arrays of tables when their paths remain valid.
Link the syntax explanation to the TOML specification.

Recheck the revised paragraph against the retained counterexample.
It must permit that syntax without implying that every section order preserves the same document.
