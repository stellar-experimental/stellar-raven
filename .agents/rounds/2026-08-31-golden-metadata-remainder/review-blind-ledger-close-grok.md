# Blind re-derivation: q-protocol-ledger-close-time

Case: `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`
Question: How often does the Stellar network close a ledger?
Lane: independent blind re-derivation, 2026-08-31.
Method: read AGENTS.md, golden-truth SKILL.md, and the case file. Query live sources. Do not use prior verification notes as evidence. Do not edit the repository.

## Verdicts

Active 3-5-second official conflict: **yes, it persists.**

New Stellar Docs finding: **yes, the finding has evidence.**

Observed Pubnet cadence in this sample: **5–7 seconds typical, with rare 8–9 second deltas. No delta below 5 seconds.**

Configured target: **5000 ms.** Legal range: **[4000, 5000] ms.**

## Domain

This is a real-world / protocol fact.

Numeric close-time claims need two independent source classes. One class must be primary (A or B).

## Commands and timestamps

All times are UTC.

| When | Command | Result |
|---|---|---|
| 2026-08-31T13:10:23Z | `date -u +"%Y-%m-%dT%H:%M:%SZ"` | session start |
| 2026-08-31T13:10:23Z | `curl -sS -D /tmp/gmr-2026-08-31-horizon.headers -o /tmp/gmr-2026-08-31-horizon.json "https://horizon.stellar.org/ledgers?order=desc&limit=200"` | HTTP 200. Header Date: Mon, 31 Aug 2026 13:10:23 GMT |
| 2026-08-31T13:10:23Z | Python parse of that JSON (199 consecutive `closed_at` deltas) | see sample below |
| 2026-08-31T13:10:23Z–13:10:24Z | `curl -sS -L` of rendered docs URLs listed below | HTTP 200 except noted 404s |
| 2026-08-31T13:11:32Z–13:11:34Z | `curl -sS -L` of GitHub raw URLs listed below | HTTP 200 |
| 2026-08-31T13:12:10Z–13:12:17Z | `curl -sS -L` of more official pages | HTTP 200 except noted 404s |
| 2026-08-31T13:12:10Z | `curl https://api.github.com/repos/stellar/stellar-docs/commits/main` | SHA `21557e044aa578d6e4a5f764c788a16a6fbafef7`, committer date 2026-08-27T17:49:16Z |
| 2026-08-31T13:12:10Z | `curl https://api.github.com/repos/stellar/stellar-core/commits/master` | SHA `0752b5176d22c8d57ed562c93038f76ab97e8285`, committer date 2026-08-28T18:59:49Z |
| 2026-08-31T13:12:10Z | `curl https://api.github.com/repos/stellar/stellar-protocol/commits/master` | SHA `8912a8047931453bb5d6a631e10a9d7125c570f3`, committer date 2026-08-25T20:40:46Z |
| 2026-08-31T13:13:25Z | `gh search issues --repo stellar/stellar-docs --limit 10 "3-5 seconds"` | empty |
| 2026-08-31T13:13:25Z | `gh search prs --repo stellar/stellar-docs --limit 10 "3-5 seconds"` | empty |
| 2026-08-31T13:13:25Z | `gh search issues --owner stellar --limit 10 "ledger close 3-5 seconds"` | empty |
| 2026-08-31T13:14:07Z | `date -u` after last fetch | 2026-08-31T13:14:07Z |

GitHub MCP `search_code` and `get_file_contents` ran in the same window (about 13:10–13:13Z). Stellar Raven `search` and `execute` ran in the same window. Perplexity `perplexity_search` ran in the same window.

## Official wording (class A): raw and rendered

### Stellar Stack — current 5-7 second wording

Rendered URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
Fetch: `curl -sS -L` at 2026-08-31T13:10:23Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:32 GMT`. `cf-ray: a33c466dfc9a297f-ATL`. 52518 bytes.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-stack.mdx
Fetch: `curl -sS -L` at 2026-08-31T13:11:32Z. HTTP 200. ETag `"93bdf9b50c0c1ca127d3b66f0a1aeed5c67f9d55c0706e3dfca573e03e842adc"`.

GitHub blob: https://github.com/stellar/stellar-docs/blob/main/docs/learn/fundamentals/stellar-stack.mdx
File SHA: `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713`. Repo HEAD: `21557e044aa578d6e4a5f764c788a16a6fbafef7`.

Exact quote (raw and rendered match):

> Generally, nodes reach consensus, apply a transaction set, and update the ledger every 5-7 seconds.

### Validators Introduction — current 3-5 second wording

Rendered URL: https://developers.stellar.org/docs/validators
Fetch: `curl -sS -L` at 2026-08-31T13:10:24Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:47 GMT`. `cf-ray: a33c466fbb617b9a-ATL`. 56457 bytes.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/validators/README.mdx
Fetch: `curl -sS -L` at 2026-08-31T13:11:32Z. HTTP 200. ETag `"9410b11118b2c04649c9e6570e588a2c3fa33a6f148a0c984e7563c2d5053fa8"`.

GitHub blob: https://github.com/stellar/stellar-docs/blob/main/docs/validators/README.mdx
File SHA: `37f879807c150e794578e80d2e751597938f8423`.

Exact quote (raw and rendered match):

> Generally, nodes reach consensus, apply a transaction set, and update the ledger every 3-5 seconds.

This is the only `org:stellar` code hit for `"3-5 seconds"` in GitHub `search_code` (total_count 1). It is the only Docs-index hit for `"3-5 seconds"` (nbHits 1).

### Ledgers — closeTime semantics, not a cadence number

Rendered URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers
Fetch: `curl -sS -L` at 2026-08-31T13:10:24Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:32 GMT`.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx
Fetch: 2026-08-31T13:11:32Z. HTTP 200. File SHA: `7c91cf0ead893a078bb44f04d2858f377db6cee6`.

Exact quote:

> The close time is a UNIX timestamp indicating when the ledger closes. Its accuracy depends on the system clock of the validator proposing the block. Consequently, SCP may confirm a close time that lags a few seconds behind or up to 60 seconds ahead. It's strictly monotonic – guaranteed to be greater than the close time of an earlier ledger.

### Fees — qualitative bound

Rendered URL: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering
Fetch: 2026-08-31T13:10:24Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:30 GMT`.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/fees-resource-limits-metering.mdx
Fetch: 2026-08-31T13:11:32Z. HTTP 200.

Exact quote:

> Stellar’s ledger close time is constrained to a few seconds, preventing the execution of arbitrarily large transactions, regardless of the resource fees involved.

### Storage strategies — ~5-second target, not 3-5

Rendered URL: https://developers.stellar.org/docs/build/guides/storage/storage-strategies
Fetch: 2026-08-31T13:12:11Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:12 GMT`.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/build/guides/storage/storage-strategies.mdx
Fetch: 2026-08-31T13:12:10Z. HTTP 200. File SHA from code search: `3893d518f37293043f20580ec3e5b2e3c7cb988d`.

Exact quotes:

> The current maximum is 3,110,400 ledgers — approximately 180 days at today's ~5-second ledger close time.

> Two numbers to remember: **`17,280` ledgers is about one day at today's ~5-second target close time**, and **64 KiB is the whole contract-data entry limit**. Close time is a network setting, so day-based TTL constants are approximations, not wall-clock guarantees.

### Hubble history-ledgers — ~every 5 seconds

Rendered URL: https://developers.stellar.org/docs/data/analytics/hubble/data-catalog/data-dictionary/history-ledgers
Fetch: 2026-08-31T13:12:12Z. HTTP 301 then 200. Final: `.../bronze/history-ledgers`.

Raw URL: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/data/analytics/hubble/data-catalog/data-dictionary/bronze/history-ledgers.mdx
Fetch: 2026-08-31T13:13:05Z. HTTP 200.

Exact quote:

> Timestamp in UTC when this ledger closed and committed to the network. Ledgers are expected to close ~every 5 seconds

### x402 Built on Stellar — ~5-second finality

Rendered URL: https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar
Fetch: 2026-08-31T13:12:12Z. HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:07 GMT`.

Exact meta description:

> Free, public x402 facilitator for Stellar with ~5-second finality and sponsored fees.

### Pages that did not resolve

- https://developers.stellar.org/docs/build/guides/storage/choose-a-storage-strategy — HTTP 404 at 13:10:24Z.
- https://developers.stellar.org/docs/learn/encyclopedia/network-configuration/ledger-headers — HTTP 404 at 13:12:12Z.
- https://developers.stellar.org/docs/learn/fundamentals/intro-to-stellar — HTTP 404 at 13:12:15Z.

## Official site pages (class A, broader stellar.org)

These pages are not the developer-docs conflict. They show other official cadence talk.

https://stellar.org/soroban — HTTP 200 at 13:12:13Z.

> Benefit from 5-second smart contract finality on a mature network with 150 real-time TPS.

https://stellar.org/learn/intro-to-stellar — HTTP 200 at 13:12:15Z.

> The Stellar network achieves consensus in under 6 seconds and relies on Federated Byzantine Agreement consensus which enjoys instant TTF.

JSON on that page also has: `The Stellar network transactions are confirmed within 5 seconds, with all time average ledger speed at 5.19s.`

https://stellar.org/foundation/roadmap — HTTP 200 at 13:12:17Z.

> We're aiming for Stellar-core to support ledger close times of 2.5 seconds (down from 5) through improvements to the overlay network along with pipelining consensus and execution.

https://dashboard.stellar.org/ — HTTP 200 at 13:12:17Z. HTML is a small shell (3245 bytes). It does not print a close-time sentence in static HTML.

## Protocol spec (class B)

URL: https://github.com/stellar/stellar-protocol/blob/master/core/cap-0070.md
Raw: https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0070.md
Fetch: 2026-08-31T13:11:32Z. HTTP 200. File SHA: `6be041641be00090fc8cb3b6e551a8dbe0e6536d`. Repo HEAD: `8912a8047931453bb5d6a631e10a9d7125c570f3`.

CAP 0070 status: Final. Protocol version: 23. Title: Configurable SCP Timing Parameters.

Exact quotes:

> Currently, Stellar's ledger close time and SCP timeout settings are hardcoded.

> - **ledgerTargetCloseTimeMilliseconds**
>     - Target ledger close time in milliseconds. Validators will use this value to set the nextLedgerTrigger timer.
>     - Initial value: 5000
>     - Range: [4000, 5000]

> All initial values will match the current hardcoded values.

A configured target is not a guarantee for every observed close.

## Controlling stellar-core timespan symbol (class B)

Repo HEAD: `0752b5176d22c8d57ed562c93038f76ab97e8285` (master, committer 2026-08-28T18:59:49Z).

### Pre-protocol-23 hardcoded timespan

File: `src/herder/Herder.h`
Raw: https://raw.githubusercontent.com/stellar/stellar-core/master/src/herder/Herder.h
Fetch: 2026-08-31T13:11:33Z. HTTP 200.

```
    // Expected time between two ledger close.
    static std::chrono::milliseconds const
        TARGET_LEDGER_CLOSE_TIME_BEFORE_PROTOCOL_VERSION_23_MS;
```

File: `src/herder/Herder.cpp`
Raw: https://raw.githubusercontent.com/stellar/stellar-core/master/src/herder/Herder.cpp
Fetch: 2026-08-31T13:11:33Z. HTTP 200.

```
std::chrono::milliseconds const
    Herder::TARGET_LEDGER_CLOSE_TIME_BEFORE_PROTOCOL_VERSION_23_MS(5000);
```

This is the controlling `std::chrono` timespan symbol before protocol 23. The value is 5000 milliseconds.

### Protocol 23+ controlling setting

Runtime path: `LedgerManagerImpl::getExpectedLedgerCloseTime()` in `src/ledger/LedgerManagerImpl.cpp`.
Raw: https://raw.githubusercontent.com/stellar/stellar-core/master/src/ledger/LedgerManagerImpl.cpp
Fetch: 2026-08-31T13:11:34Z. HTTP 200.

Exact quote:

```
    if (protocolVersionStartsFrom(lcl.header.ledgerVersion,
                                  ProtocolVersion::V_23))
    {
        auto const& networkConfig = getLastClosedSorobanNetworkConfig();
        return std::chrono::milliseconds(
            networkConfig.ledgerTargetCloseTimeMilliseconds());
    }

    return Herder::TARGET_LEDGER_CLOSE_TIME_BEFORE_PROTOCOL_VERSION_23_MS;
```

The live controlling symbol on protocol 23+ is `ledgerTargetCloseTimeMilliseconds`. The function still returns `std::chrono::milliseconds`.

Initial, min, and max constants live in `src/ledger/NetworkConfig.h`.
Raw: https://raw.githubusercontent.com/stellar/stellar-core/master/src/ledger/NetworkConfig.h
Fetch: 2026-08-31T13:11:33Z. HTTP 200.

```
struct MinimumSorobanNetworkConfig
{
    // SCP timing minimums
    static constexpr uint32_t LEDGER_TARGET_CLOSE_TIME_MILLISECONDS = 4000;
```

```
struct MaximumSorobanNetworkConfig
{
    static constexpr uint32_t LEDGER_TARGET_CLOSE_TIME_MILLISECONDS = 5000;
```

```
struct InitialSorobanNetworkConfig
{
    // SCP timing settings
    static constexpr uint32_t LEDGER_TARGET_CLOSE_TIME_MILLISECONDS = 5000;
```

`NetworkConfig.cpp` sets the SCP timing entry from `InitialSorobanNetworkConfig::LEDGER_TARGET_CLOSE_TIME_MILLISECONDS`. Validation requires the value to sit between the minimum 4000 and the maximum 5000.

This sample’s Horizon records report `protocol_version` 27. Protocol 23+ path applies. The legal target cannot be 3 seconds.

## Fresh Horizon 199-delta sample (class C + F)

Command:

```
curl -sS -D /tmp/gmr-2026-08-31-horizon.headers \
  -o /tmp/gmr-2026-08-31-horizon.json \
  "https://horizon.stellar.org/ledgers?order=desc&limit=200"
```

URL: https://horizon.stellar.org/ledgers?order=desc&limit=200
HTTP 200. Date: Mon, 31 Aug 2026 13:10:23 GMT. `Content-Type: application/hal+json; charset=utf-8`.

Records: 200. Consecutive sequences: yes (step 1, no gaps). Deltas: 199.

| Field | Value |
|---|---|
| Oldest sequence | 64209159 |
| Newest sequence | 64209358 |
| Oldest `closed_at` | 2026-08-31T12:51:23Z |
| Newest `closed_at` | 2026-08-31T13:10:16Z |
| Protocol | 27 |
| Min delta | 5.0 s |
| Max delta | 9.0 s |
| Mean | 5.693467 s |
| Median | 6.0 s |
| Histogram | 5s×77, 6s×111, 7s×8, 8s×1, 9s×2 |
| Deltas below 5 s | 0 |

Outliers:

- 9.0 s: 64209175 `2026-08-31T12:52:52Z` → 64209176 `2026-08-31T12:53:01Z`
- 8.0 s: 64209181 `2026-08-31T12:53:29Z` → 64209182 `2026-08-31T12:53:37Z`
- 9.0 s: 64209347 `2026-08-31T13:09:11Z` → 64209348 `2026-08-31T13:09:20Z`

Oldest hash: `3d652b55a359f035376818f4cad8db4685f3a99ff98050c72e8a3c5cf1763503`
Newest hash: `2cd7446020d1e333cca8fd46a4119af67deb46810f4dd3793de2953a777134f2`

No 3-second or 4-second close exists in this sample. The 5–7 second band holds 196 of 199 deltas (98.5%). Three slower closes show that a target is not a per-ledger guarantee.

## Docs index (class E)

Stellar Raven `stellarDocs.search_docs` and `stellarDocs.search_protocol_concepts_docs` at about 13:12Z.

Query `"3-5 seconds"`: nbHits 1.

- URL: https://developers.stellar.org/docs/validators
- Snippet: `consensus, apply a transaction set, and update the ledger every **3-5 seconds.**`

Query `"5-7 seconds"`: nbHits 1.

- URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-stack#stellar-core
- Snippet: `consensus, apply a transaction set, and update the ledger every **5-7 seconds.**`

Both phrases are in the live index. This is not a search-index miss. It is a content conflict.

`search_protocol_concepts_docs({ query: "ledger close time" })` returns 45 hits. Top cadence-like hit is the fees “few seconds” sentence. The stack 5–7 sentence is not in the first eight protocol-concepts hits for that query. That is ranking, not absence.

## General web (class D)

Perplexity search query: `Stellar network ledger close time seconds site:developers.stellar.org`
Domain filter: developers.stellar.org, stellar.org. Time: about 13:11Z.

Hits that matter:

- Ledgers page close-time paragraph (same as class A).
- Hubble “~every 5 seconds”.
- Fees “a few seconds”.
- SDF Q3 2025 report: average ledger close of 5.76 seconds (https://stellar.org/blog/foundation-news/q3-2025-quarterly-report, dated 2025-11-03).
- Roadmap 2.5 second goal, down from 5.

Class D agrees with a ~5 second target and a ~5–6 second observed mean. It does not support 3–5 seconds as current observed cadence.

## Does the 3-5-second official conflict persist?

Yes.

Two live canonical developer-docs pages use the same sentence frame and different ranges:

1. Stack page: every 5-7 seconds.
2. Validators page: every 3-5 seconds.

Raw MDX, rendered HTML, and the Algolia index all carry both sentences today (2026-08-31). GitHub `search_code` `"3-5 seconds" org:stellar` finds only the validators README.

The validators 3-5 range conflicts with:

- the stack page (class A);
- this 199-delta Pubnet sample, min 5 s, median 6 s (class C/F);
- CAP-0070 initial 5000 ms and range [4000, 5000] (class B);
- `InitialSorobanNetworkConfig::LEDGER_TARGET_CLOSE_TIME_MILLISECONDS = 5000` and minimum 4000 (class B).

Three seconds is below the protocol minimum target. Four seconds is the minimum legal target, not an observed close in this sample.

Other official ~5-second wording is a target approximation. It is not the 3-5 vs 5-7 clash. Do not mix those pages into the same defect without a separate check.

## Does a new Stellar Docs finding have evidence?

Yes. Evidence meets the improvements-pipeline bar for `docs-content`.

Owner surface: `https://developers.stellar.org/docs/validators` (source `docs/validators/README.mdx`).

The page undertakes to state how often nodes update the ledger. That sentence is stale and internally contradictory with the stack page.

Smallest correction: change “every 3-5 seconds” on the validators introduction to match the stack wording, or to a target-versus-observed formulation that names CAP-0070.

Not a docs-search finding: both strings are indexed.

Dedupe:

- `improvements/stellar-docs/` has no ledger-close-time finding. Highest active id seen: `sd-046`.
- `improvements/resolved.json` has no “3-5 second” or “ledger close” match for this defect.
- `sd-044` is about Quickstart `--manual-close`. It is a different fact.
- `gh search issues --repo stellar/stellar-docs --limit 10 "3-5 seconds"` returned empty at 2026-08-31T13:13:25Z.

This lane does not file the finding. The task forbids repository edits. The evidence is enough for an author to file `sd-047` (or the next free `sd-NNN`) as `docs-content`.

## Corroboration matrix

| Claim | Verdict | Classes |
|---|---|---|
| Current stack-docs wording is “every 5-7 seconds” | confirmed | A (rendered+raw), E (index) |
| Current validators-docs wording is “every 3-5 seconds” | confirmed | A (rendered+raw), E (index), B (GitHub file search) |
| Those two official sentences conflict today | confirmed | A + E |
| Pubnet observed closes in this 199-delta sample are 5–7 s typical, min 5, median 6, mean 5.693, rare 8–9 | confirmed-as-of 2026-08-31T13:10:23Z | C, F |
| No 3 s or 4 s delta in this sample | confirmed-as-of | C, F |
| Target close time is configurable; initial 5000 ms; range [4000, 5000] | confirmed | B (CAP-0070 + NetworkConfig.h) |
| Controlling timespan before protocol 23 is `Herder::TARGET_LEDGER_CLOSE_TIME_BEFORE_PROTOCOL_VERSION_23_MS` = 5000 ms | confirmed | B |
| Controlling setting on protocol 23+ is `ledgerTargetCloseTimeMilliseconds`, returned as `std::chrono::milliseconds` | confirmed | B |
| closeTime is consensus-agreed, monotonic, with bounded wall-clock skew | confirmed | A (ledgers page) |
| “Ledgers close every 3–5 seconds” as current observed cadence | contradicted | A (stack), C/F (sample), B (min 4000 ms) |
| A new Stellar Docs `docs-content` finding has live evidence | confirmed | A, B, C, E; no existing sd-* duplicate |

## What this lane did not do

It did not edit repository files.
It did not read `.agents/rounds/2026-08-31-golden-metadata-remainder.md`.
It did not treat the case file `truth.verified` notes as evidence.
It did not file the finding.

## Reply verdict

Active 3-5-second official conflict persists. New Stellar Docs finding has evidence.
