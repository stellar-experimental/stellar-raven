---
id: ll-008
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - live production execute 2026-07-03 (lumenloop.get_project on lobstr and moneygram; Solo scratchpad 521 follow-up, todo 826 comment 2224)
  - consumer-side workaround shipped in the goldens: q-crp-anchors-by-corridor concrete trap on the footprint conflation, q-eco-lobstr-wallet golden.notes caution (owned cases under eval/qa/corpus/battery/)
  - live re-verified 2026-07-06 (eval round todo 846): lobstr still operating_region ["Indonesia"] / based_in "Estonia"; moneygram description still "over 200 countries and territories" with no rail-vs-footprint distinction or as-of date
  - live re-verified 2026-07-10 (golden audit GT-10, Solo process 3230): MoneyGram still described with the 200+ corporate footprint, while current operator surfaces report 170+/174 cash coverage and separately label bank/mobile/card rails coming soon
  - GT-18 recurrence 2026-07-10: Soroswap resolves as Financial Protocols in Lumenloop while sibling Scout records use Protocol/Contract and DEX type fields
  - https://github.com/lumenloop/stellar-ecosystem-db/issues/3
recurrences:
  - date: 2026-08-11
    evidence: `lobstr` still reports operating_region ["Indonesia"] and based_in "Estonia"; `moneygram` still says "operating in over 200 countries and territories" without rail scope or an as-of date. Upstream stellar-ecosystem-db#3 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity.
---

## Finding

Directory records carry misleading region/coverage values, two live instances:

1. **lobstr**: `operating_region: ["Indonesia"]` while `based_in: "Estonia"` —
   implausible for a global consumer wallet; looks like a mis-mapped field.
2. **moneygram**: description states "over 200 countries and territories" —
   MoneyGram's *corporate money-transfer* footprint — with no distinction from
   the *Stellar USDC off-ramp* coverage (~170–174 countries per Scout and the
   MoneyGram developer docs) and no as-of date. Any consumer quoting the
   record inherits the conflation; the same corpus disagrees with itself
   (Scout "170+ cash-out countries", a third record says "185+").

Related but distinct from ll-003 (region *vocabulary* is free-text): these are
wrong/unqualified *values*, which a controlled vocabulary alone wouldn't fix.

GT-18 found a taxonomy-provenance variant: the live Lumenloop Soroswap record
uses category `Financial Protocols`, while Scout siblings expose
`Protocol/Contract` and DEX type fields. Neither taxonomy is necessarily wrong,
but consumers cannot safely merge them into one purported source record.

## Evidence

Live 2026-07-03, production `execute`: `get_project({slug:"lobstr"})` and
`get_project({slug:"moneygram"})` returned the values quoted above; the Scout
counterpart figures were fetched in the same probe session for comparison.

Live 2026-07-10 recurrence: the MoneyGram project description still carried
the unscoped 200+ footprint. Current MoneyGram operator surfaces distinguish
170+/174-country cash coverage and mark bank, mobile-wallet, and card rails as
coming soon. The stale directory wording therefore continues to support both
coverage inflation and product-rail conflation.

## Recommendation

(1) Fix the lobstr `operating_region` mapping (spot-audit the field across
records — one implausible value in a two-record sample suggests more). (2) For
coverage claims in descriptions, distinguish corporate footprint from
Stellar-rail coverage and date the figure; the eval corpus shows the 200+
figure actively propagating into wrong answers about the Stellar off-ramp.
For cross-service fields, return a source-qualified taxonomy name and stable
semantic role so a consumer can preserve the original value instead of silently
substituting another service's category.
