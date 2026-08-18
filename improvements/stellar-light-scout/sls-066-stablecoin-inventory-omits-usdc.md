---
id: sls-066
service: stellar-light-scout
status: verified
discovered: 2026-08-18
upstreamTitle: Stablecoin inventory omits Circle USDC while serving Circle EURC without market metrics
evidence:
  - 2026-08-18 deployed scout.getStablecoins({ limit: 100 }) returned 21 tracked rows at meta.dataAsOf 2026-08-18T15:17:47.179Z and no USDC row
  - 2026-08-18 deployed scout.getStablecoins({ peg: "USD", limit: 100 }) returned five rows and no USDC row while meta.counts.total remained 21
  - Circle USDC contract documentation observed 2026-08-18 lists Stellar Mainnet USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
  - StellarExpert observed 2026-08-18 shows that Circle USDC asset live with current transactions
  - The same Scout snapshot contains Circle EURC under GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2 with null supply, marketCapUSD, and holders
  - Solo scratchpad 816 Stablecoin corpus correction verdict
---

## Finding

`GET /api/stablecoins` serves a bounded tracked inventory. Its 2026-08-18 snapshot omitted Circle
USDC, although Circle still listed USDC on Stellar and current on-chain activity existed.

The same snapshot included Circle EURC. Its `supply`, `marketCapUSD`, and `holders` values were all
null. The endpoint correctly states that null means untracked, not zero. However, the omission of
USDC prevents the inventory from supporting a complete Stellar stablecoin roster or a reliable
issuer comparison.

Two rows shared the EURC ticker. They were not duplicates. One row used MyKobo issuer
`GAQRF3UGHBT6JYQZ7YSUYCIYWAF4T2SAA5237Q5LIQYJOHHFAWDXZ7NM`. The other used Circle issuer
`GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2`. The issuer account is the asset
identity and join key.

## Evidence

The full read returned 21 tracked rows at `meta.dataAsOf` `2026-08-18T15:17:47.179Z`. No row used
the USDC ticker. A separate USD-filtered read returned five rows and also omitted USDC.
`meta.counts.total` stayed 21 under the filter, while `meta.counts.returned` became five.

The model-facing contract describes `counts.total` as the filtered count before slicing. The live
peg-filtered response kept the whole-set total. The response and contract must use one meaning.

Circle's official contract table listed Stellar Mainnet USDC at
`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`. StellarExpert showed the same asset
with current transactions. This proves a coverage omission, not real-world asset absence.

## Recommendation

Add Circle USDC to the tracked inventory. Populate its dated metrics from the same documented
snapshot method used for other rows.

Add an explicit coverage field to the response metadata. It should state whether the inventory is
complete, curated, or limited to one upstream source. Preserve null metrics when the source cannot
measure them.

Align `counts.total` with the exposed contract. If it stays a whole-set count, rename or document
it clearly and add an explicit filtered count.

Keep assets distinct by `(ticker, issuer)`. Do not merge the MyKobo and Circle EURC rows because
they share a ticker.

Add a recurrence test that checks the official Circle USDC issuer against the served inventory.
The test should report an upstream coverage gap instead of treating omission as proof of absence.
