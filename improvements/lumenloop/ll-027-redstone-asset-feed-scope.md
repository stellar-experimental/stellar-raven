---
id: ll-027
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 Lane X observed Lumenloop's 2026-06-04 RedStone summary say nine assets live under SEP-40 while Scout's RedStone record says launch with ten feeds; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - Live re-check 2026-07-13: https://lumenloop.com/api/md/news/reliability-scale-redstone-data-standard-stellar-rwa-moment states “Nine assets are now live”; its linked primary source is https://blog.redstone.finance/2026/06/04/reliability-at-scale-redstone-and-the-data-standard-for-stellars-rwa-moment/
  - Live re-check 2026-07-13: the public Scout directory record https://stellarlight.xyz/project/redstone-finance describes the launch as ten feeds, including BTC, ETH, USDC, PYUSD, and BENJI; assets and feeds may be different units and the two sources may have different as-of dates.
  - Upstream issue filed 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/41
  - 2026-08-11 review: issue #41 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:36Z. `get_document({collection: "articles", id: 8068})` still says nine assets are live, with no enumerated set, unit, snapshot/current-state label, or typed as-of field.
recurrences:
  - date: 2026-08-11
    evidence: Article 8068 retains the unqualified nine-asset count in prose.
---

## Finding

Lumenloop's RedStone summary gives an unqualified nine-asset count that cannot
be reconciled with Scout's ten-feed wording. Without labels for asset versus
feed, publication snapshot versus current state, and the enumerated set, either
number can be mistakenly used as the same metric.

## Evidence

P4 Lane X compared the two service records on 2026-07-11 and deliberately
excluded a numeric golden because scope was unresolved. A 2026-07-13 live
re-check reproduced the Lumenloop nine-asset wording and the Scout ten-feed
wording. The records may be compatible because they use different units or
as-of dates; neither source currently provides enough scope to reconcile them.

## Recommendation

Attach a dated, enumerated count basis to the article summary and state whether
it counts price feeds, supported assets, or another interface unit. Link later
revisions rather than silently replacing the publication snapshot.
