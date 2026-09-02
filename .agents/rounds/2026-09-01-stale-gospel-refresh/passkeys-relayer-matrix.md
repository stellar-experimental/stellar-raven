# Passkeys and Relayer claim matrix

Date: 2026-09-01
Live probes: 2026-09-02 UTC
Lane: Grok 4.6 high, vendor-diverse assumption attack
Cases: `q-soroban-av-passkeys-talk`, `q-ti-openzeppelin-relayer`
Paid Lumenloop research: not used
Faucet calls: not used
Case-file, TODO, NEXT, and main-ledger edits: none

## Method

This review re-derives volatile event, product-status, release-version, support, and ownership claims from live sources. It does not reuse prior `truth.corroboration` notes as evidence.

Source classes follow the golden-truth skill:

- A: official docs or owner pages
- B: source, tags, or license files
- C: live service or HTTP checks
- D: independent web or package registry
- E: this repo's catalog or inventory contract
- F: empirical payload inspection

Each volatile claim uses at least two independent classes. Official event or vendor docs plus a source or release record are required where those records exist.

Vendor-diverse attack: this review treats SDF wording, OpenZeppelin wording, GitHub tags, rendered docs, npm, status pages, and live HTTP as rival witnesses. A search snippet is not a release record.

Accidental side effect: a GET to `https://channels.openzeppelin.com/gen` returned HTTP 201 and an `apiKey` field. That endpoint issues keys. This review does not record the key and did not use it.

## Verdict summary

| case | overall | judge-facing gospel |
| --- | --- | --- |
| `q-soroban-av-passkeys-talk` | routing and output contract confirmed as of 2026-09-02 | **No judge-facing change is needed.** Refresh `truth.asOf` / `reverifyBy` only. |
| `q-ti-openzeppelin-relayer` | product split confirmed; version pin stale; status feed inactive | **Judge-facing change is required** for the dated version snapshot and status/funding wording. |

Recommended next `reverifyBy`:

- `q-soroban-av-passkeys-talk`: **2026-12-10**
- `q-ti-openzeppelin-relayer`: **2026-11-19**

---

## Case 1 — `q-soroban-av-passkeys-talk`

Question intent: find a recorded passkeys / smart-wallet talk, not a docs page.
Golden intent: route to `lumenloop.find_av_passages`, return summary-plus-source rows, refuse fabricated quotes.

Current as-of in the case file: 2026-07-11.
This review as-of: **2026-09-02**.

### Claim matrix

| ID | claim | type | verdict | classes |
| --- | --- | --- | --- | --- |
| P1 | The exposed A/V operation is `lumenloop.find_av_passages`. | product-status / ownership of the surface | confirmed | E, C |
| P2 | Live rows return AI `summary` / `long_summary`, title, URL, channel, and `start_offset`. They do not return transcript text. | product-status | confirmed-as-of | C, E, B |
| P3 | `start_offset` is an opaque chunk/order key, not playback seconds. | product-status | confirmed | E, C, F |
| P4 | Recorded Stellar passkeys / smart-wallet talks exist outside the aggregator. | event / existence | confirmed | A, D, C |
| P5 | One canonical talk URL can be pinned as the gospel answer. | event | contradicted (avoid-side) | A, D, C |
| P6 | `created_at` on A/V rows is the recording date. | event-date | disputed | E vs C+D |
| P7 | Upstream skills still teach verbatim transcript passages. | support / canonical-page conflict | confirmed-as-of | B, C |
| P8 | Retired `lumenloop_find_av_passages` remains the live id. | product-status | contradicted (avoid-side) | E, C |

### P1 — Exposed operation

**Verdict: confirmed**

- **E, catalog, observed 2026-09-02.** `catalog/manifest.json` id `lumenloop.find_av_passages`. Transport `POST /v1/tools/find_av_passages`.
- **C, live execute, observed 2026-09-02.** `stellar_raven.execute` accepted `lumenloop.find_av_passages({ query, limit })` and returned rows.

No judge-facing change.

### P2 — No transcript text

**Verdict: confirmed-as-of 2026-09-02**

- **E, catalog Returns clause.** Quote: "Transcript text itself is never returned — cite the link + the passage summary."
- **C/F, live payload, query `Stellar passkeys secp256r1 WebAuthn smart-wallet signing`, limit 8.** Row keys: `av_id`, `title`, `url`, `channel`, `summary`, `long_summary`, `slug`, `created_at`, `start_offset`, `similarity`. No `transcript`, `text`, or `chunk` field.
- **B, upstream digest skill, SHA `40cb36fa`, observed 2026-09-02.** [stellar-ecosystem-digest SKILL.md](https://github.com/lumenloop/lumenloop-skills/blob/40cb36fa69a5629b07eca3ee7c33b0af84a52be3/skills/stellar-ecosystem-digest/SKILL.md) still says "only `find_av_passages` gives verbatim passages." That is the known sk-004 conflict, not live payload proof.

Catalog first sentence still says "matched chunk text." Later Returns text denies transcript. Live rows match the Returns clause, not the first sentence.

No judge-facing change. Keep the sk-004 partial-cap note.

### P3 — `start_offset` is opaque

**Verdict: confirmed**

- **E, catalog.** Quote: "start_offset (an opaque transcript chunk offset for ordering passages within a recording — NOT playback seconds."
- **C/F, live offsets for this query:** 8100, 10800, 16200, 14850, 4050, 5400, 13500, 40500. A Developers Meeting row used `start_offset: 40500`. That value is not a usable playback timestamp.
- **Sibling:** `q-gap-av-offset-not-timestamp` and `q-ti-video-tutorials` already encode the same rule.

No judge-facing change.

### P4 — Real recorded talks exist

**Verdict: confirmed**

Official owner recordings and independent listings agree. Sampled talks:

| title | owner channel | URL | independent check |
| --- | --- | --- | --- |
| Enabling DeFi Adoption Through Passkeys \| Meridian 2024 | Stellar Development Foundation | https://www.youtube.com/watch?v=n7nHHHFMqMQ | YouTube oembed 200, 2026-09-02 |
| Passkeys: The Future of Passwords | Stellar Development Foundation | https://www.youtube.com/watch?v=6jJtOGwMoDY | oembed 200; live A/V row `av_id` 1162 |
| Engineering Stellar Smart Wallets for Real-World Activation \| Meridian 2025 | Stellar Development Foundation | https://www.youtube.com/watch?v=hBDBT7uXcIs | oembed 200; live A/V row `av_id` 1616 |
| Workshop: Stellar \| Multichain Day \| DEVCON 2024 | Wrapped | https://www.youtube.com/watch?v=TVl3FOZF8JY | oembed 200; live A/V row `av_id` 445 |
| How To Use Smart Contracts & Passkeys To Set Up Auth On A Web App | James Bachini | https://www.youtube.com/watch?v=V2DwDzp43E8 | oembed 200; [Lumen Loop media page](https://lumenloop.com/media/use-smart-contracts-passkeys-set-auth-web-app) dated 2025-08-06 |
| Stellar Developers Meeting - 08/20/2026 | Stellar Development Foundation | https://www.youtube.com/watch?v=npqRSfq-rWA | oembed 200; live A/V row names Passkey Kit and Smart Account Kit |

Official docs that the talks discuss, not substitutes for A/V:

- https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets
- https://developers.stellar.org/docs/build/apps/guestbook

A live A/V miss would still be a corpus-bounded miss. A docs page is not an A/V passage.

No judge-facing change. Do not pin one talk URL.

### P5 — One talk is the gospel answer

**Verdict: contradicted** (this is an avoid trap, not a golden assertion)

Multiple official recordings exist. Pinning Meridian 2024, Meridian 2025, or the Elliot passkeys video as "the" talk is false.

No judge-facing change. Keep "no fixed source URL."

### P6 — `created_at` is the recording date

**Verdict: disputed**

- **E, catalog.** Quote: "created_at (the recording's date — use it to judge and cite how recent the talk is)"
- **C, live row `av_id` 445.** Title "Workshop: Stellar | Multichain Day | DEVCON 2024", `created_at` `2026-04-02T23:21:21.744Z`.
- **D, YouTube oembed, 2026-09-02.** Same URL is DEVCON 2024, channel Wrapped.
- **C, live row `av_id` 1162.** Title "Passkeys: The Future of Passwords", `created_at` `2026-04-28T05:25:34.817Z`.

`created_at` behaves as an ingest or index date, not the event date. The golden already says "available channel/date metadata" and does not pin `created_at` as event day.

**Required gospel change: none in `answer` / `keyFacts`.** Optional notes caution: do not grade `created_at` as the talk date. That is metadata, not a judge-facing rewrite.

### P7 — Upstream verbatim claim

**Verdict: confirmed-as-of 2026-09-02**

- **B, lumenloop-skills digest, SHA `40cb36fa`.** Quality rule: "only `find_av_passages` gives verbatim passages." Pass 4: "quote the passage."
- **C, live rows.** Summaries only.

Keep the existing sk-004 partial-cap note. Finding `improvements/skills/sk-004-av-passages-verbatim-claim.md` remains `reported-upstream`.

### P8 — Retired underscore id

**Verdict: contradicted** (avoid-side)

Live and catalog ids are `lumenloop.find_av_passages`. Keep the avoid trap.

### Case 1 overall

Routing, output honesty, and "do not substitute docs" remain current.

**No judge-facing change is needed.**

Recommended truth-only refresh after author reconciliation:

- `truth.asOf`: 2026-09-02
- `truth.reverifyBy`: 2026-12-10
- evidence: this matrix path plus the live execute and YouTube URLs above

Sibling search terms: `find_av_passages`, `start_offset`, `transcript passages`, `verbatim passages`, `passkeys`, `secp256r1`, `WebAuthn`, `PasskeyKit`, `smart wallet`.

Sibling cases checked: `q-gap-av-offset-not-timestamp`, `q-ti-video-tutorials`, `q-edge-open-world-recovery-after-narrow-miss`, `q-tool-passkeykit-smart-wallet`, `q-passkey-smart-account-architecture`, `q-infra-secp256r1-passkeys`, `q-passkey-platform-constraints`, `q-tool-passkey-wallet-recovery`. No gospel contradiction. Do not pin a talk URL in those files either.

---

## Case 2 — `q-ti-openzeppelin-relayer`

Question intent: what Relayer is, whether it is live on mainnet, how funding/top-up works, and how to integrate.
Current gospel snapshot: as of 2026-08-04, GitHub latest **v1.7.0** (2026-07-28) versus rendered **1.5.x**.

This review as-of: **2026-09-02**.

### Claim matrix

| ID | claim | type | verdict | classes |
| --- | --- | --- | --- | --- |
| R1 | OpenZeppelin Relayer is a self-hostable AGPL service owned by OpenZeppelin. | ownership / license | confirmed | A, B |
| R2 | OpenZeppelin Channels / hosted Relayer Service is a distinct managed offering. | product-status | confirmed, with a naming dispute | A, B, D |
| R3 | SDF docs may call Relayer "also known as Stellar Channels Service." | canonical-page conflict | confirmed-as-of | A vs A |
| R4 | Stellar support includes XDR submit, payments, Soroban invoke, fee-bump/sponsorship, policies, and multiple signers. | support | confirmed-as-of | A, B |
| R5 | Self-hosted operators fund the Stellar relayer account themselves. | support / funding | confirmed | A, B |
| R6 | Hosted Channels has no generic public top-up address. Current official terms are free use plus a fair-use stroop limit. | product-status / funding | confirmed-as-of | A, C |
| R7 | Hosted mainnet and testnet endpoints exist. An unauthenticated request is not a full health proof. | product-status | confirmed-as-of | A, C |
| R8 | Repository latest release is v1.7.0, published 2026-07-28. | release-version | contradicted | B, D |
| R9 | Rendered docs expose 1.5.x as latest stable and lag the GitHub tag. | release-version | confirmed-as-of, retargeted | A, B |
| R10 | `status.channels.openzeppelin.com` is a live public health feed. | product-status | contradicted | C, D |
| R11 | npm `@openzeppelin/relayer-sdk` version is the Relayer release. | release-version | contradicted (avoid-side) | D, B |

### R1 — Self-hosted AGPL Relayer, OpenZeppelin-owned

**Verdict: confirmed**

- **B, LICENSE, default branch SHA `a2b4b04`.** Quote: "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007."
- **B, README.md.** Badge: "License: AGPL v3". Link: https://github.com/OpenZeppelin/openzeppelin-relayer
- **A, Relayer docs.** https://docs.openzeppelin.com/relayer — "This project is licensed under the GNU Affero General Public License v3.0."
- **A, owner news 2026-03-24.** https://www.openzeppelin.com/news/expanding-stellar-support-with-relayer-service — "The open source Relayer is self-hosted, teams deploy and operate it themselves."

No judge-facing change for license or owner.

### R2 — Relayer versus Channels / Relayer Service

**Verdict: confirmed**, with naming overlap

OpenZeppelin uses three labels:

1. Open-source Relayer: self-hosted AGPL binary.
2. Relayer Service: hosted OpenZeppelin offering.
3. Channels plugin / Stellar Channels Service: parallel channel-account submission, also the managed Stellar endpoint.

- **A, OZ news FAQ, 2026-03-24.** Quote: "The open source Relayer is self-hosted... The Relayer Service provides the same core functionality, hosted by OpenZeppelin." Quote: "What is the Channels plugin? A parallel transaction processing system that uses a pool of independent channel accounts."
- **A, Channels guide, observed 2026-09-02.** https://docs.openzeppelin.com/relayer/guides/stellar-channels-guide — "OpenZeppelin Stellar Channels Service is a managed infrastructure..."
- **B, repo docs.** https://github.com/OpenZeppelin/openzeppelin-relayer/blob/a2b4b04c3a71d0f10ab1543d4b231852c9d17b61/docs/guides/stellar-channels-guide.mdx
- **D, npm.** `@openzeppelin/relayer-plugin-channels` latest `0.20.0` is a separate package from Relayer.

The golden split (self-hosted Relayer vs managed Channels) remains the right durable gate. Do not treat Channels as a Stellar protocol guarantee.

**Required gospel change:** keep the split. Optionally name "Relayer Service" as the hosted wrapper so an answer that uses OZ's FAQ wording is not punished.

### R3 — SDF page conflates the names

**Verdict: confirmed-as-of 2026-09-02** (canonical-page conflict)

- **A, Stellar Docs, observed 2026-09-02.** https://developers.stellar.org/docs/tools/openzeppelin-relayer Quote: "OpenZeppelin Relayer, also known as Stellar Channels Service, is a managed infrastructure..."
- **A, same page.** The tutorial uses `@openzeppelin/relayer-plugin-channels` against `https://channels.openzeppelin.com/testnet`.
- **A, OZ FAQ.** Self-hosted Relayer and hosted Relayer Service are distinct.

An attributed SDF quote is not a false claim. An unattributed identity collapse remains wrong.

**Required gospel change:** add a grader caution in `golden.notes` in lint-canonical form. Name the SDF page. Cap an attributed "also known as Stellar Channels Service" quote at partial. Keep the avoid trap for unattributed conflation.

### R4 — Stellar feature support

**Verdict: confirmed-as-of 2026-09-02**

- **A, Stellar Integration, main/dev docs.** https://docs.openzeppelin.com/relayer/stellar Quote: "Full Soroban smart contract support (invocation, deployment, WASM uploads)"; "Standard Stellar payment operations"; "Support for all Stellar operations via XDR transaction submission"; "Fee bump transaction support"; "Sponsored transactions"; "Secure transaction signing with multiple signer backends."
- **B, source.** `src/domain/relayer/stellar/xdr_utils.rs`, `gas_abstraction.rs`, `docs/guides/stellar-sponsored-transactions-guide.mdx`.
- **A, same page, tension.** Relayer index still says Stellar has "Partial support." The Stellar page says comprehensive support and "under active development."

Do not pin "partial" or "complete" as a timeless grade gate. The listed operations remain documented and present in source.

No change to the feature list. Date the observation.

### R5 — Self-hosted funding

**Verdict: confirmed**

- **A, stellar.mdx policies.** `min_balance` is "Minimum balance in stroops ... required for the relayer account." `fee_payment_strategy: relayer` means "relayer pays all fees in XLM."
- **A, OZ news.** Hosted service wraps fee-bump with a dedicated fund account. That is the hosted model, not self-host.
- **B, README / examples.** Operators configure signers and deploy the service.

Keep: self-hosted operators fund the relayer account. Do not publish a generic address.

### R6 — Hosted Channels funding / top-up

**Verdict: confirmed-as-of 2026-09-02**

Current official Channels guide, main/dev docs and matching GitHub file:

> "Free to Use: No credits, subscriptions, or payment systems (subject to fair use policy)"

Fair use: each API key has a stroop fee-consumption limit; it resets 24 hours after the first transaction; over-limit returns `FEE_LIMIT_EXCEEDED`. Higher throughput: self-host the Channels plugin.

No public top-up address appears on the official guide or the SDF tutorial.

The 2026-03-24 OZ news still says networks that want to sponsor the service should contact OpenZeppelin. That is a sales path, not a published address.

**Required gospel change:** replace "billing/top-up policy is a Channels contract" with dated current terms: free with fair-use stroop limit as of 2026-09-02; no generic top-up address; self-hosted Relayer still needs a funded account. Keep the avoid trap against a published hosted address.

### R7 — Mainnet / testnet live endpoints

**Verdict: confirmed-as-of 2026-09-02**

- **A, Channels guide.** Mainnet `https://channels.openzeppelin.com`. Testnet `https://channels.openzeppelin.com/testnet`. Key pages `/gen` and `/testnet/gen`.
- **C, HTTP 2026-09-02.**
  - `GET https://channels.openzeppelin.com` → 401 `{"success":false,"code":401,"error":"Unauthorized"}`
  - `GET https://channels.openzeppelin.com/testnet` → 401 same JSON
  - `GET https://channels.openzeppelin.com/gen` → 201 with an `apiKey` field (secret discarded)
- **A, SDF x402 page, observed via Scout 2026-09-01.** Hosted facilitator URLs `https://channels.openzeppelin.com/x402` and `/x402/testnet`.

401 proves an authenticated endpoint is reachable. 201 on `/gen` proves key issuance is live. Neither proves a successful relay.

Keep that health rule. Date the observation.

### R8 — Latest Relayer release is v1.7.0

**Verdict: contradicted** (golden currently asserts v1.7.0 as of 2026-08-04)

Independent release records, 2026-09-02:

| witness | latest | published |
| --- | --- | --- |
| GitHub `list_releases` / `get_latest_release` | **v1.8.0** | 2026-08-19T13:58:23Z |
| Tag URL | https://github.com/OpenZeppelin/openzeppelin-relayer/releases/tag/v1.8.0 | same |
| `Cargo.toml` at tag `v1.8.0` | `version = "1.8.0"` | same |
| Default-branch `Cargo.toml` SHA `a2b4b04` | `version = "1.8.0"` | same |

v1.7.0 still exists: https://github.com/OpenZeppelin/openzeppelin-relayer/releases/tag/v1.7.0 published 2026-07-28T15:17:03Z. It is no longer latest.

Attack note: the v1.8.0 release *body* starts with `## [1.9.0] ... (2026-08-19)`. That is a changelog-generator heading. The tag, name, and `Cargo.toml` are v1.8.0. Do not pin 1.9.0.

Attack note: a web-search snippet of the GitHub releases HTML still showed "v1.6.0 Latest". The API and tag list disagree. Trust the API and `Cargo.toml`, not the snippet.

**Required gospel change:** rewrite the dated snapshot. As of **2026-09-02**, latest GitHub release is **v1.8.0**, published **2026-08-19**. Root cause: `freshness-drift`.

### R9 — Rendered docs still expose 1.5.x as latest stable

**Verdict: confirmed-as-of 2026-09-02** (mismatch remains; left side moved)

- **B, `docs/latest-versions.js`.** Quote: `export const latestStable = "1.5.x";` and label `v1.5.x (latest stable)`.
- **A, rendered `/relayer`, `/relayer/stellar`, `/relayer/guides/stellar-channels-guide`.** Banner: "You're viewing documentation for unreleased features from the main branch. For production use, see the latest stable version (v1.5.x)."
- **A, `/relayer/1.5.x`.** Banner: "v1.5.x (latest stable)".
- **C, HTTP.** `/relayer/1.5.x` and `/relayer/1.4.x/guides/stellar-channels-guide` return 200. `/relayer/1.7.x` and `/relayer/1.8.x` return 404.
- **A, OZ news 2026-03-24** still links `docs.openzeppelin.com/relayer/1.4.x/guides/stellar-channels-guide`.
- **A, SDF Relayer page** still links `docs.openzeppelin.com/relayer/1.3.x/guides/stellar-channels-guide`.

The mismatch is stronger than 2026-08-04: GitHub is now two minor versions past the last rendered stable path, and 1.7/1.8 docs paths do not exist.

**Required gospel change:** keep the mismatch as disputed/dated. Replace "v1.7.0 versus rendered 1.5.x" with "v1.8.0 versus rendered 1.5.x / missing 1.7.x–1.8.x docs paths." Do not claim one synchronized current version.

### R10 — Official status feed

**Verdict: contradicted** as a live public health oracle

- **C, 2026-09-02.** `https://status.channels.openzeppelin.com/` → `https://relayerchannelsmainnet.statuspage.io/inactive`
- **A/D, inactive page.** Title: "Stellar Relayer Channels Mainnet Status - Page Inactive." Quote: "This page is currently inactive and can only be viewed by team members."
- **C.** `https://status.channels.openzeppelin.com/api/v2/status.json` and the Statuspage JSON URL return HTTP 401.

SDF docs still point to https://status.channels.openzeppelin.com/. That link no longer yields a public status JSON.

**Required gospel change:** stop treating the status feed as a current health source. Keep "401 is reachability, not full health." Add that the Statuspage is inactive as of 2026-09-02.

### R11 — npm SDK version is not Relayer

**Verdict: contradicted** if used as Relayer latest

- **D, npm abbreviated metadata, 2026-09-02.** `@openzeppelin/relayer-sdk` dist-tag `latest` = **1.10.0**.
- **B, Relayer tag.** v1.8.0.

Do not pin 1.10.0 as the Relayer version. No current golden asserts that. No change unless an answer starts using the SDK tag.

### Case 2 overall

Durable product split, AGPL, Stellar feature set, and "date version/health" remain true.

The dated version snapshot is stale. Hosted funding terms and the status page have moved.

**Judge-facing gospel changes required:**

1. `golden.answer` version paragraph: as of 2026-09-02, latest GitHub release **v1.8.0** (2026-08-19); rendered stable docs still **1.5.x**; `1.7.x`/`1.8.x` docs 404.
2. `golden.keyFacts` item that names v1.7.0: retarget to v1.8.0 vs 1.5.x.
3. Hosted funding sentence: current official Channels terms are free plus fair-use stroop limit; still no generic top-up address.
4. `golden.notes`: drop v1.7.0; add SDF canonical-page caution; add inactive Statuspage.
5. `truth.asOf`: 2026-09-02. `truth.reverifyBy`: **2026-11-19**. `truth.status` may stay `disputed` while docs and GitHub disagree.
6. `truth.sources`: replace the v1.7.0 tag with v1.8.0; drop or qualify the status JSON URL.

Root cause for the version rewrite: `freshness-drift`.

Sibling search terms: `OpenZeppelin Relayer`, `OpenZeppelin Channels`, `v1.7.0`, `v1.8.0`, `1.5.x`, `channels.openzeppelin.com`, `Relayer Service`, `Launchtube`.

Sibling cases checked: `q-defi-x402-on-stellar-what`, `q-soroban-x402-auth-entry-signing`, `q-x402-payment-verification`, `q-smart-wallet-fee-sponsorship`, `q-pc-fee-bump-channel-accounts-feepool`, `q-tool-passkeykit-smart-wallet`. None pin Relayer v1.7.0. x402 siblings already treat OpenZeppelin hosted endpoints as dated provider facts. No sibling rewrite is required for the version pin. If Relayer gospel adds the SDF conflation caution, x402 siblings do not need the same caution unless they start grading Relayer identity.

---

## Assumption-attack log

These are the rival witnesses this review refused to average:

1. GitHub HTML search snippet "v1.6.0 Latest" versus API/tag/Cargo.toml **v1.8.0**.
2. Release body heading **1.9.0** versus tag and crate version **1.8.0**.
3. npm `@openzeppelin/relayer-sdk` **1.10.0** versus Relayer **v1.8.0**.
4. SDF "also known as Stellar Channels Service" versus OZ FAQ split.
5. Relayer index "Partial support" versus Stellar page "comprehensive support."
6. Catalog first sentence "matched chunk text" versus live A/V rows with no transcript.
7. Catalog `created_at` = recording date versus DEVCON 2024 talk `created_at` 2026-04-02.
8. Status URL in SDF docs versus Statuspage **inactive**.
9. Older web hits of Channels guide "latest stable v1.4.x" versus current banner **v1.5.x**.

## Sources touched

Official / owner:

- https://docs.openzeppelin.com/relayer
- https://docs.openzeppelin.com/relayer/stellar
- https://docs.openzeppelin.com/relayer/guides/stellar-channels-guide
- https://docs.openzeppelin.com/relayer/1.5.x
- https://www.openzeppelin.com/news/expanding-stellar-support-with-relayer-service
- https://www.openzeppelin.com/networks/stellar
- https://developers.stellar.org/docs/tools/openzeppelin-relayer
- https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets
- https://developers.stellar.org/docs/build/apps/guestbook
- https://developers.stellar.org/docs/build/agentic-payments/x402

Source / release:

- https://github.com/OpenZeppelin/openzeppelin-relayer/releases/tag/v1.8.0
- https://github.com/OpenZeppelin/openzeppelin-relayer/releases/tag/v1.7.0
- https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-relayer/v1.8.0/Cargo.toml
- https://github.com/OpenZeppelin/openzeppelin-relayer/blob/a2b4b04c3a71d0f10ab1543d4b231852c9d17b61/docs/latest-versions.js
- https://github.com/lumenloop/lumenloop-skills/blob/40cb36fa69a5629b07eca3ee7c33b0af84a52be3/skills/stellar-ecosystem-digest/SKILL.md

Live / independent:

- `lumenloop.find_av_passages` execute 2026-09-02
- YouTube oembed for the seven talk URLs above
- https://channels.openzeppelin.com and `/testnet` (401)
- https://relayerchannelsmainnet.statuspage.io/inactive
- npm `@openzeppelin/relayer-sdk` and `@openzeppelin/relayer-plugin-channels`
- https://lumenloop.com/media/use-smart-contracts-passkeys-set-auth-web-app
- https://lumenloop.com/media/stellar-developer-meeting-openzeppelin-relayer
- https://www.youtube.com/watch?v=nxU16dOjN3M
