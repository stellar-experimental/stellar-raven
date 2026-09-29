# Final independent findings review — 2026-09-29

I reviewed the named files and their actual diff. I reached my first conclusion before reading the docs review. I then checked source snapshots, live responses, the resolved receipt, and posted comments. I made no GitHub write or finding edit.

## Verdict

The package has no remaining blocking evidence or scope error. Three new findings have reproducible upstream defects and concrete recommendations. The four local recurrences match their response snapshot. The `sd-046` retirement has live page and index evidence, an immutable source link, and three posted resolution comments. `npm run improvements:lint` passes with 63 findings. `git diff --check` passes.

I identified three errors during review. The author corrected each before this final verdict:

1. `sls-033` now names the actual `productKind` field. The response has no `walletKind` field.
2. `sls-024` now says 35 positive deployment rows have null `supportedNetworks` and null `networksBasis`. The independent scan supports that pair.
3. `sls-088` now addresses the `kind: application` fallback. The schema has no infrastructure kind today.

## New findings

| Finding | Verification | Recommendation check |
| --- | --- | --- |
| `sls-087` | The original and explicit current questions returned 28. The answer used a September 1 note. Its scanned Horizon source defines 29. | Refresh the note, pin its source, and recheck numeric notes against newer scans. Preserve the old dated observation as history. |
| `sls-088` | Scout called Horizon a deployable contract product. The [Horizon README](https://github.com/stellar/stellar-horizon/blob/430a28e79b3b43c213840e45523519ca11251c0a/README.md) identifies an API server. Its Rust contracts sit under `internal/integration/contracts/`. | Set the product contract flag false. Add a service-infrastructure kind rule, so the project link does not produce `application`. Keep fixture paths as evidence. |
| `sk-026` | The pinned [Core API skill](https://github.com/Trustless-Work/trustlesswork-skill/blob/80e2467f34041b9f70e66d6c2f567fc76ba9b1bb/trustless-work-dev/skills/api/v2/core-concepts.md) gives ungrouped error URLs. I got HTTP 404 for both ungrouped examples. The grouped escrow and token pages returned HTTP 200. | Fix the skill links and template. Check the linked docs. Keep the API `type` question separate until a deployed API response confirms it. |

The `sls-087` draft no longer claims its `blob/master` link returns 404. I confirmed that GitHub redirects it to `main`. Its commit-pinned link gives better evidence. The old `sls-080` receipt and issue cover a different, resolved DeepWiki dating defect. The old `sls-046` receipt covers `stellar-core`, not Horizon. Existing [Trustless Work PR #15](https://github.com/Trustless-Work/trustlesswork-skill/pull/15) added the affected skill text. It does not resolve the broken links.

## Existing Scout findings

The revised `sls-024` marks the lifecycle-source omissions as historical. Its current state targets positive deployment provenance. The [independent population scan](docs-independent-review.md) found 1,004 searchable rows. All rows have lifecycle dates and bases. All non-`unverified` rows have lifecycle sources. The 906 unknown deployments carry null basis, source, and date fields. Those nulls are an explicit unknown state. Among 98 positive deployment rows, 55 lack `deployment.sourceUrl`. Thirty-five have null `supportedNetworks` and null `networksBasis`. Rendergate and CleverCon show mainnet labels, while their returned status links point to testnet. The finding does not assert that these mainnet labels are false. Its recommendation now asks for evidence or an explained scope for positive claims. It retains the valid unknown state.

The [Scout response snapshot](scout-rechecks.json) supports the four new recurrences. `sls-029` sees null DIA and Band products and a Lightecho product without a contract ID. It does not call those unknowns false deployments. `sls-033` sees 72 wallet rows, ten null `productKind` values, and 39 missing availability values. `sls-085` still sees the Soroswap `aggregator router` label on the known AMM router address. `sls-086` still sees the Aquarius governance-vote reward wording. Both latter records keep their original one-row scope.

## `sd-046` retirement

The [live recheck](sd-046-live.json) shows HTTP 200 for the Lumens and Accounts pages. It also shows complete indexed responses with 12 and 5 sections. Both surfaces contain the two-reserve rule. The old 3.5 XLM example is absent. [Docs PR #2844](https://github.com/stellar/stellar-docs/pull/2844) merged as `efd7b4a47192a8ee2e1c84559cf1bd7c7ef5da3d`. The distinct [docs review](docs-independent-review.md) verified the live fix and adjacent source rules.

The [resolved receipt](../../../improvements/resolved.json) has the discovery date, resolution date, upstream refs, live recheck, distinct review, and immutable source commit. The [immutable source record](https://github.com/stellar-experimental/stellar-raven/blob/8ab7b88f95177022cd24c0d0acb6e619b19ea23c/improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md) resolves. I read back each posted comment from GitHub: [Docs issue #2842](https://github.com/stellar/stellar-docs/issues/2842#issuecomment-5897470588), [Docs PR #2844](https://github.com/stellar/stellar-docs/pull/2844#issuecomment-5897471025), and [Raven issue #181](https://github.com/stellar-experimental/stellar-raven/issues/181#issuecomment-5897471527). Each author is `kalepail`. Each body matches the [resolution-comments snapshot](sd-046-resolution-comments.json). Raven issue #181 is closed.

The active finding file and intake override are gone. The generated index omits `sd-046`. The two current golden cases link the dated live check or immutable resolved record. They no longer point to the deleted active path. Other `sd-046` mentions in dated rounds remain historical evidence. No retired live-path reference remains in the current case, queue, index, or intake files.
