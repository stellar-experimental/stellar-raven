# Independent review: `sd-046` and `sls-024`

Reviewed at 2026-09-29T19:35–19:40Z. I used the committed `sd-046` finding from `git show HEAD`. I did not use the author's live snapshot or round conclusion.

## Verdicts

| Finding | Independent verdict | Reason |
| --- | --- | --- |
| `sd-046` | Eligible for `fixed-upstream` and retirement after resolver cleanup. | Both live pages and all indexed sections now state the two-reserve rule. The upstream PR merged and the corrected content reached production. |
| `sls-024` | Keep active, or create a self-contained successor before retirement. | The lifecycle provenance gap closed across 1,004 searchable rows. Positive deployment claims still lack direct source links on 55 rows. Thirty-five known deployments have `supportedNetworks: null`. Two mainnet labels show only testnet status links on their returned rows. |

## `sd-046`: original trigger and recommendation

The committed finding asks for four changes. I checked each change against the rendered pages at 2026-09-29T19:35–19:37Z.

| Original item | Live result |
| --- | --- |
| Put the pool-share exception beside trustlines on both general pages. | [Lumens](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) says a pool-share trustline counts as two subentries. [Accounts](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#subentries) lists ordinary and pool-share trustlines separately. |
| State one reserve for an ordinary trustline and two for a pool-share trustline. | Accounts says “one subentry each” and “two subentries each.” Both pages state the two-base-reserve cost. |
| Link the Liquidity Pools explanation. | Both rendered HTML pages contain a link to `/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools#trustlines`. |
| Match CAP-0038 and the Liquidity Pools rule. | [Liquidity Pools](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools#trustlines) gives two reserves. [CAP-0038](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md) gives two subentries and two reserves. The two general pages now agree. |

The Lumens example now totals 3 XLM. Its one-claimant cost is 0.5 XLM. The old 3.5 XLM arithmetic is absent.

The source-class matrix supports the minimum golden edit:

| Claim | Class | Source and observation | Verdict |
| --- | --- | --- | --- |
| A pool-share trustline costs two reserve units. | A | [Lumens](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance), [Accounts](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#subentries), and [Liquidity Pools](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools#trustlines); live 2026-09-29. | Confirmed. |
| A pool-share trustline counts as two subentries. | B | [CAP-0038](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md); live 2026-09-29. [Core `computeMultiplier`](https://github.com/stellar/stellar-core/blob/cf8f96d8e165ef94b7e99c6ea45a12e4973841a1/src/transactions/SponsorshipUtils.cpp#L193) returns 2 for pool shares and 1 for ordinary trustlines. [Core `calculateDelta`](https://github.com/stellar/stellar-core/blob/cf8f96d8e165ef94b7e99c6ea45a12e4973841a1/src/invariant/AccountSubEntriesCountIsValid.cpp#L25) adds 2. | Confirmed. |
| The search index includes the corrected text. | E | `stellarDocs.get_doc_page_sections`, live 2026-09-29T19:37:36Z. Lumens returned 12 complete sections. Accounts returned 5 complete sections. Both relevant sections contain the rule. | Confirmed. |

The index call returned `complete: true` and `truncated: false` for both pages. It used the production adapter and the authored `specs/stellar-docs.json` transport. A bounded script loaded only the two Docs Algolia names from `.env` and `.dev.vars` in memory. It printed presence flags and selected results, never values.

[Docs issue #2842](https://github.com/stellar/stellar-docs/issues/2842) closed at 2026-09-28T16:34:06Z. [Docs PR #2844](https://github.com/stellar/stellar-docs/pull/2844) merged at 2026-09-28T16:34:05Z as `efd7b4a47192a8ee2e1c84559cf1bd7c7ef5da3d`. Its file list has exactly the two general pages. [Raven #181](https://github.com/stellar-experimental/stellar-raven/issues/181) supplies the deployment workflow time and a live string check. That report supports deployment history. My fresh page and index reads establish the current state independently.

## Minimum golden and resolver work for `sd-046`

Remove the expired canonical-page caution from `q-protocol-base-reserve-min-balance.json`. Keep the two-reserve answer, key fact, and false one-reserve trap. Refresh the stale Lumens and Accounts source notes. Replace the old conflict note in the two-reserve corroboration row with current A, B, and E evidence. Update `truth.verified` with the date, this independent review, live URLs, and the resolved root cause. The sibling `q-pc-sponsored-reserves.json` has no judge-facing pool-share caution. Its `truth.verified.evidence` still says `sd-046 remains active`; update that provenance sentence when the finding retires.

Recheck register clusters `cluster-017`, `cluster-114`, and `cluster-123` after the case edit. Their member facts already agree. Run `npm run eval:qa:register`, `npm run eval:qa:compile`, and the required QA lint. Regenerate compiled `eval/qa/cases.json`; do not edit it by hand.

Persistent `sd-046` references occur in the active finding, `improvements/intake.json`, `improvements/INDEX.md`, the two owned cases, compiled `eval/qa/cases.json`, `.agents/TODO.md`, and dated records. The dated records are provenance; retain them. Remove the live intake override and active finding through the resolver. Refresh the generated index. Put the immutable Raven source commit in the resolved receipt and any remaining case provenance. Do not leave a pointer to the deleted active path. The current [Raven #181](https://github.com/stellar-experimental/stellar-raven/issues/181) remains open. The Docs issue has no final Raven resolution comment. The resolver contract requires the dated live result, a commit-pinned source, the resolving refs, and a read-back of the posted comment before final retirement. This review authorizes no GitHub write.

## `sls-024`: independent live population scan

I read [Scout OpenAPI](https://stellarlight.xyz/api/openapi.json) at 2026-09-29T19:38:06Z. It reports version `1.9.54`. I paged `GET /api/projects/search?category=<category>&limit=100&offset=<offset>` for all seven documented categories. The 15 page reads ran from 19:38:43Z through 19:38:48Z. Each page reached its reported category total.

| Category | Rows |
| --- | ---: |
| Infrastructure | 204 |
| Tooling | 184 |
| User-Facing App | 407 |
| Asset | 36 |
| Protocol/Contract | 157 |
| Anchor | 15 |
| Partner Integration | 1 |
| **Searchable total** | **1,004 unique slugs** |

All 1,004 rows have `statusAsOf` and `statusBasis`. Every row with a non-`unverified` basis has `statusSourceUrl`. The five `unverified` rows also happen to have a URL. Those URLs do not upgrade the basis. The scan found 906 deployments with `network: unknown`; all 906 had null `basis`, `sourceUrl`, and `asOf`. That is the documented unknown state, not a defect. `products: null` also means unknown coverage. [The status endpoint](https://stellarlight.xyz/api/status) reports 1,133 source projects. Therefore this scan proves the seven-category searchable surface, not all source records.

The 98 positive deployment rows have a network, basis, and date. Fifty-five have `deployment.sourceUrl: null`; each uses `basis: onchain-activity`. Their `statusSourceUrl` fields are present, but those fields support lifecycle labels. They do not automatically prove the separate deployment claim. Thirty-five of the 98 positive deployment rows have `supportedNetworks: null` and `networksBasis: null`. `circle` is an example: its products include two mainnet evidence URLs, but its project network list is null. The positive deployment assertion and product evidence must be considered separately.

Two rows need a focused owner recheck. `rendergate` and `clevercon` say `deployment.network: mainnet` with a null deployment source URL. Their only returned `statusSourceUrl` points to `stellar.expert/explorer/testnet/`. Both have `onchain: null` and `products: null`. This does not prove the mainnet label false. It shows that the returned row does not let a reader verify that label. [Scout's schema](https://stellarlight.xyz/api/openapi.json) says a known deployment has evidence. These two rows give no mainnet evidence in the returned fields.

The original fixtures now carry dated lifecycle bases and links. Slender is Inactive/human-verified. Laina is Pre-Release/human-verified. K2 Lend is Live/site-liveness. OrbitCDP is Inactive/human-verified. Fluxity is Live/repo-activity. Each has `deployment.network: unknown`, so no fixture asserts mainnet. I requested their five status URLs. The Laina GitHub, K2 Lend, OrbitCDP, and Fluxity URLs returned HTTP 200. DefiLlama returned HTTP 403 to this client. That response limits link reachability verification; it does not invalidate Slender's status. `xBull` is Live/human-verified with unknown deployment. `Centaurus` is Inactive/human-verified with unknown deployment.

The original unqualified-label trigger is largely fixed. The remaining deployment provenance and positive-network inconsistencies still match the finding's recommendation. Do not mark `sls-024` fixed solely from the closed [service issue #494](https://github.com/Stellar-Light/stellarlight/issues/494) or [Scout issue #9](https://github.com/Stellar-Light/stellar-scout/issues/9). A successor could isolate the 55 missing deployment links and 35 missing supported-network values. That successor needs its own source and live probe before `sls-024` retires.

## Reproduction commands

The review ran `git show HEAD:improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md`, `gh issue view 2842 -R stellar/stellar-docs`, `gh pr view 2844 -R stellar/stellar-docs`, and `gh issue view 181 -R stellar-experimental/stellar-raven`. It used `node --experimental-strip-types --input-type=module` to call `callStellarDocs` with the authored transport. It fetched the rendered page HTML and checked the `#trustlines` links. It fetched the commit-pinned Core files and the live Scout API with Node `fetch`. It used no paid operation, GitHub write, or authoritative file edit.
