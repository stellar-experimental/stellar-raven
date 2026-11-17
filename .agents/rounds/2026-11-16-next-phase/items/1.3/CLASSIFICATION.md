# Item 1.3 classification: the residual source gaps

Executor Claude Sonnet 5.5 (lead Claude Opus 5.5), 2026-11-17. Probes: [LEAVES.md](LEAVES.md) and
`probes/`. Classes: **reached**, **reached, not surfaced**, **held by an unreached source**,
**stated nowhere**, **did not reproduce, closed**. A finding needs the `verified` bar; anything short
of it is a dated TODO line. Every `stated nowhere` and `held by an unreached source` row, and every
finding that makes an absence claim, went to the Grok attack ([GROK-REVIEW.md](GROK-REVIEW.md)).

Result: 23 rows classed; Grok knocked three of my classes down (rows 6, 8, 9), and all three moved to "reached" (see GROK-REVIEW.md and the reconciliation below). Six new findings (`sd-111`, `sd-112`, `sd-113`, `ll-039`,
`sls-121`, `sls-122`). Four new or updated TODO lines. Nothing was posted by the classification
itself.

| # | Gap | Class | Owner | Became |
|---|---|---|---|---|
| 1 | `network.protocol-history` | did not reproduce, closed | Raven (own repo) | Nothing. The Software Versions page (147 KB, protocols 20 to 29) is whole inside the sandbox; a top-level return becomes a readable artifact |
| 2 | `standards.moneygram-ramps` | reached | Stellar Light/Scout | Scout row `anchor-moneygram` holds SEP-24 and "170+ cash-out countries". The `scout.matchPartners` 503 reproduces: dated line in the TODO bullet "Triage the runtime and client gaps" |
| 3 | `standards.exchange-integration` | did not reproduce, closed | Stellar Docs | Nothing. The pooled-accounts guide names exchanges and ranks 1 for "pooled accounts deposit memo exchange" |
| 4 | `defi.lending` | did not reproduce, closed | Scout, Lumenloop | Nothing |
| 5 | `defi.tvl-landscape` | did not reproduce, closed | Scout | Nothing. `sls-039` stays `declined-upstream` |
| 6 | `wallets.landscape` | reached (free text; no boolean field) | Scout | Nothing. Grok knocked down "stated nowhere": `shortDescription` on wallet rows states Soroban signing or smart-contract support (Freighter/Varial, xBull, Hana, MPCVault). A structured field would be a new schema ask with no case; not filed |
| 7 | `ecosystem.sdf` | did not reproduce, closed | Scout | Nothing. The `sdf-org` team row is observed 2026-11-16 and names the leadership |
| 8 | `ecosystem.sdf-mandate-holdings` | reached (stellar.org mandate page) | stellar.org | Nothing. Grok knocked down "held by an unreached source": `stellarOrg.get_page /foundation/mandate` carries the four bucket totals, dated 2026-11-11 to 2026-11-16, which sum to 14,322,772,443 XLM; the dashboard API returned `sdfMandate` 14322772457.76 the same day. The Docs Lumens page defers to the mandate page. Decision 6(b) (Dashboard API) is not needed for this fact |
| 9 | `ecosystem.xlm-staking-rewards` | reached | stellar.org | Nothing. Grok knocked down "stated nowhere": the SDF posts `stellar.org/blog/ecosystem/the-hidden-risks-of-proof-of-stake` ("There's no staking, no protocol yield tied to block production") and `.../proof-of-stake-vs-proof-of-agreement-stellars-security-edge` ("there is no concept of staking tokens") state it, and `scout.searchResearch` returns the first as a research chunk. The 2026 rewards proposal is reached too. The TODO line I had drafted is dropped |
| 10 | `ecosystem.history-origins` | did not reproduce, closed | Lumenloop | Nothing |
| 11 | `ecosystem.xlm-markets` | did not reproduce, closed | Lumenloop | Nothing |
| 12 | `wallets.scams-phishing` | reached | stellar.org (SDF guide) | Nothing. The guide's FAQ "I lost money to a scammer. Can you help?" gives the victim step; a natural wording returns the chunk. The ledger's "ask SDF to add a section" does not stand. `sd-108`, `sls-117` untouched |
| 13 | `standards.payment-patterns` (SEP-7) | docs-search miss for the long query; the page is reached for the bare string | Docs search (Mintlify) | `sd-112`, `verified`, to post |
| 14 | `ecosystem.chain-comparisons` | held by an unreached source | xrpl.org | Class only; decision 6(c) files neither. Grok-checked |
| 15 | `wallets.pi-network` | stated nowhere | Pi Network (facts); SDF (the FAQ line) | `sd-113`, net-new content request, `unclear` intake, `verified`, unposted. Grok-checked |
| 16 | `security.regulation-policy` | partly reached | SDF | Nothing: 2026-10-26 SDF interview video and 2023 to 2025 posts are reachable; no owner-side position page found. Grok-checked |
| 17 | `assets.public-sector-cbdc` | held by an unreached source | bank.gov.ua | `ll-039`, coverage request to `lumenloop/lumenloop-backend`, to post. Grok-checked |
| 18 | `q-soroban-contract-id-derivation` | reached, not surfaced | Stellar Docs, Raven | Dated TODO reachability line. The earlier claim "no checked page states the formula" is wrong. No golden edit |
| 19 | `q-sep-45-contract-auth` | reached, not surfaced (research lane) | `stellar/stellar-protocol` SEP file | Row evidence under the held research-lane TODO item. No finding, no golden edit |
| 20 | Blend audit register | stated nowhere (project name absent from the record) | stellar.org audit register | `sd-111`, `unclear` intake, unposted. Grok-checked |
| 21 | Anchor Directory | reached | Stellar Docs | Nothing. TODO label corrected; no golden edit |
| 22 | Scout `Live` wallet rows | residual of resolved `sls-033` | Scout | `sls-121`, to post |
| 23 | Scout `q=wallet` paging | stable defect | Scout | `sls-122`, to post |

The table covers the 11 leaves (rows 1 to 11), the 6 confirmed gaps without a finding (rows 12 to 17),
the two snippet-only rows, Blend, the Anchor Directory and the two Scout reads (rows 18 to 23).

## Golden and register

`q-soroban-cli-bindings` carries the canonical-page caution naming `sd-110` (commit `21f14c0a`).
`cluster-095` and `cluster-103` reopened and the lead closed them (`register-review.json`, commit
`dc8ffac6`). Sibling sweep: `rg -l "sd-110|Contract Explorer" eval/qa/corpus` returned no file. The
stored baseline verdict on this case (`wrong`, on the old notes) is **not re-judged; direction not
measured**. The PR #3153 branch of the plan did not apply: #3153 is open and unmerged.

## Grok attack

Tier: Grok (vendor-diverse assumption attack), model `grok-4.7`, effort high, started by the
executor as `hc` child `1.3-grok` (terminal `t1rr`), keyless, read-only. Scope: rows 6, 8, 9, 14, 15,
16, 17, 20 and the findings `sd-111`, `sd-112`, `sd-113`, `ll-039`. Report: [GROK-REVIEW.md](GROK-REVIEW.md).

| Grok item | Verdict | Reconciliation |
|---|---|---|
| Row 6 `wallets.landscape` | knocked down | Accepted. I re-read the Scout rows: `shortDescription` states Soroban support. Class is now reached; row 6 above |
| Row 8 `sdf-mandate-holdings` | knocked down | Accepted and re-verified: the four bucket totals on `stellar.org/foundation/mandate` sum to 14,322,772,443; the dashboard returned 14322772457.76 at 2026-11-17T01:54Z. Class reached |
| Row 9 `xlm-staking-rewards` | knocked down | Accepted and re-verified: both quotes are on the two posts. Class reached; the TODO line is removed |
| Row 14 `chain-comparisons` | stands | No change |
| Row 15 / `sd-113` | stands | No change |
| Row 16 `regulation-policy` | stands | No change |
| Row 17 / `ll-039` | stands | Grok found one more held row (id 4732, CoinDesk 2021-01-04). Added to the finding |
| Row 20 / `sd-111` | stands | Wording narrowed: a search on the project name alone finds no record, while `Certora blend` finds the three Certora records. The OtterSec recommendation now says the register's owner knows the project |
| `sd-112` | stands | No change. Separate note: `llms.txt` does not list the SEP-7 page |
