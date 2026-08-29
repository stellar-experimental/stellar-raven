# Lane R4 — Wallet SDK vs SEP-31 conflict probe (Grok)

Date: 2026-08-29
Lane: R4 (read-only). Wrote only this file. Did not edit cases.

Cases under probe (question + golden first; truth after a live view):

- `eval/qa/corpus/battery/assets-anchors-seps/q-anchor-sdp-vs-anchor-platform.json`
- `eval/qa/corpus/battery/assets-anchors-seps/q-asset-wallet-sdk-seps.json`

Domain: **real-world / protocol** (SDK surface + SEP semantics). Negative claim bar: official supported-SEP list + repo tree/history + variant sweep + SEP-31 abstract.

## Golden claims under probe

`q-anchor-sdp-vs-anchor-platform`:

- Answer: Wallet SDK wraps client-side SEP flows **(SEP-10/12/24/31/38)**.
- keyFact: `Wallet SDK = wallet-developer (TypeScript) library wrapping client-side SEP flows (SEP-10/12/24/31/38).`

`q-asset-wallet-sdk-seps`:

- Answer: wraps client-side **SEP-10, SEP-12, SEP-24, SEP-31, SEP-38**, plus SEP-1. Cites `stellar.org` Wallet SDK page and `github.com/stellar/typescript-wallet-sdk`.
- keyFact: `It wraps client-side SEP-10 (auth), SEP-12 (KYC), SEP-24 (hosted deposit/withdraw), SEP-31 (cross-border), and SEP-38 (quotes).`

The disputed predicate is **“Wallet SDK wraps SEP-31.”**

## Live derivation

### (1) Official Wallet SDK supported-SEP list (class A)

Fetched 2026-08-29: https://developers.stellar.org/docs/build/apps/wallet/intro

Quote (Anchor Basics):

> Below you can find all the SEPs the anchor class currently supports:
> - SEP-1: Stellar Info File as shown above
> - SEP-10: explored on Stellar Authentication section
> - SEP-24: explored on Hosted Deposit and Withdrawal section
> - SEP-6: explored on Programmatic Deposit and Withdrawal section
> - SEP-12: explored on Providing KYC info subsection
> - SEP-38: explored on Quote section
>
> Besides the SEPs supported by the anchor class the wallet SDK also has support for the SEP-7 protocol …

Index page https://developers.stellar.org/docs/build/apps/wallet (2026-08-29) adds a **SEP-30 Recovery** page. No SEP-31 page. No SEP-31 in the “all the SEPs the anchor class currently supports” list.

Product page https://stellar.org/products-and-tools/wallet-sdk (2026-08-29) describes deposit/withdrawal and on/off-ramps. It does **not** name SEP-31. Docs link on that page still points at the old path `docs/building-apps/wallet/overview`.

### (2) `stellar/typescript-wallet-sdk` (class B)

HEAD `f2b7a1f6e55021306ac01c397e5d9dbd05e46de3` (2026-08-20, `Release/4.0.1`). Clone `/tmp/gt3-r4-typescript-wallet-sdk` (full history + tags through v4.0.1).

Anchor implementation files at HEAD:

- `Sep6.ts`, `Sep24.ts`, `Sep38.ts`
- **No `Sep31.ts`**

Types at HEAD include `sep6.ts`, `sep7.ts`, `sep12.ts`, `sep24.ts`, `sep38.ts`, `sep43.ts`. **No `sep31.ts`.**

`CHANGELOG.MD` lists Sep6 / Sep12 / Sep38 / Sep10 / Sep24 / Sep-7 / SEP-30 / SEP-43. **No Sep31 / SEP-31.**

Repo-wide grep `sep[-_]?31|sep31` (case-insensitive) at HEAD — **two hits only**:

1. `@stellar/typescript-wallet-sdk/src/walletSdk/Types/sep38.ts` line 59: `export enum Sep38PriceContext { SEP6 = "sep6", SEP24 = "sep24", SEP31 = "sep31" }` — this is the SEP-38 **quote context** enum required by SEP-38, not a SEP-31 client.
2. `@stellar/typescript-wallet-sdk/test/customer.test.ts` line 27: `const customerType = "sep31-receiver"` — a SEP-12 KYC **customer type** string used by testanchor; the test is `test.skip` (“the testanchor changed its SEP-12 API behavior”).

TOML helper `@stellar/typescript-wallet-sdk/src/walletSdk/Utils/toml.ts` line 96 reads `directPaymentServer: toml["DIRECT_PAYMENT_SERVER"]` (SEP-1 discovery of the receiving-anchor URL). That is not a SEP-31 payment client.

**History / tags:** `git log --all -S 'sep31'` returns one commit: `dd4b52ae401c9e9173ca6603aa3661e0b7ff5f82` (2024-01-08, `Release/1.3.0 v2 (#88)`). The patch **adds** the SEP-38 context enum and the `sep31-receiver` SEP-12 test. It does not add a Sep31 client. `git log --all -S 'SEP-31'` / `-S 'Sep31'` and `--grep` for those strings are empty aside from that enum. Tags: v1.0.0 … v4.0.1; none name SEP-31. **No SEP-31 client exists now. None existed in reachable history.**

### (3) Kotlin / Swift / Flutter variants (class B)

**Kotlin** `stellar/kotlin-wallet-sdk` HEAD `e44763c` (2026-07-01). README (2026-08-29):

> This SDK is deprecated and no longer maintained. … If you need to stay on the JVM … you will need to implement SEP protocols (SEP-1/10/12/24/30) yourself.

That successor list does **not** include SEP-31. Tree has `Sep24.kt`, `Sep10.kt`, `Sep12.kt`. **No Sep31 client.** The only `Sep31` type is a **SEP-1 TOML record** in `wallet-sdk/src/main/kotlin/org/stellar/walletsdk/toml/Data.kt`:

> SEP-31: Cross-border payments API. … data class Sep31(val directPaymentServer: String, val hasAuth: Boolean, val kycServer: String?, val anchorQuoteServer: String?)

Javadoc for wallet-sdk 1.2.2 matches that data class. Integration tests reuse customer type `"sep31-receiver"` (SEP-12). Parsing `DIRECT_PAYMENT_SERVER` is discovery, not wrapping the sending-anchor API.

**Swift** `Soneso/stellar-swift-wallet-sdk` README (2026-08-29) Functionality list: SEP-001, 006, 007, 009, 010, 012, 024, 030, 038. **No SEP-031.**

**Flutter** `Soneso/stellar_wallet_flutter_sdk` README (2026-08-29) Functionality list: same set as Swift. **No SEP-31.**

**Not a Wallet SDK variant:** `Soneso/kmp-stellar-sdk` CHANGELOG 1.6.0 (2026-05-20) adds **SEP-31 Sending Anchor side** `Sep31Service`. That is a general KMP Stellar SDK, not SDF’s Wallet SDK, and it is the **sending-anchor** role.

### (4) SEP-31 is sending-anchor → receiving-anchor (class B)

https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md (fetched 2026-08-29). Title: **Cross-Border Payments API**. Status: Active.

Abstract entities:

> - A **Sending Client**: The owner of the origin financial account.
> - A **Sending Anchor**: The business receiving funds from the Sending Client and delivering them to the Receiving Anchor for the Receiving Client. Must have a business relationship with the Receiving Anchor.
> - A **Receiving Anchor**: The business receiving funds from the Sending Anchor and delivering them to the Receiving Client.
> - A **Receiving Client**: The owner of the destination financial account.

Authentication:

> Sending Anchors must authenticate with Receiving Anchors via SEP-10 Web Authentication.

Prerequisites require bi-lateral agreements between Sending and Receiving Anchors and `DIRECT_PAYMENT_SERVER` on the receiving side. Sequence diagram steps are Sending Anchor → Receiving Anchor (`GET /info`, SEP-10, SEP-12, SEP-38, `POST /transactions`). The Sending Client talks to the Sending Anchor, not to SEP-31.

Official Anchor Platform docs (2026-08-29) https://developers.stellar.org/docs/platforms/anchor-platform assign SEP-31 to the **anchor backend**:

> SEP-31 — Cross-border payment processing (receive only)

That matches `q-anchor-platform-what` / the Anchor Platform bullet in `q-anchor-sdp-vs-anchor-platform`. It does not match a wallet-developer client library.

### Class D sweep (negative claim)

Web search 2026-08-29 for stellar Wallet SDK + SEP-31:

- Official intro list omits SEP-31 (class A above).
- DeepWiki diagram of typescript-wallet-sdk lists SEP6/10/12/24/30/38/7 — **no SEP31 client**.
- Kotlin javadoc `Sep31` is the TOML data class.
- KMP `Sep31Service` is sending-anchor, not Wallet SDK.
- Product page does not name SEP-31.
- No third-party source found that shows `@stellar/typescript-wallet-sdk` implementing SEP-31 `GET /info` / `POST /transactions`.

## Corroboration matrix

| claim | verdict | class | ref | quote | asOf |
|---|---|---|---|---|---|
| Official Wallet SDK docs list SEP-1/6/10/12/24/38 (+ SEP-7; index also SEP-30) and do not list SEP-31 | confirmed | A | https://developers.stellar.org/docs/build/apps/wallet/intro | “all the SEPs the anchor class currently supports: SEP-1 … SEP-10 … SEP-24 … SEP-6 … SEP-12 … SEP-38” + SEP-7; no SEP-31 | 2026-08-29 |
| TypeScript Wallet SDK has a SEP-31 client now | contradicted (false) | B | `stellar/typescript-wallet-sdk` HEAD `f2b7a1f` Anchor/: `Sep6.ts`, `Sep24.ts`, `Sep38.ts`; no `Sep31.ts`. CHANGELOG.MD has no SEP-31. | grep hits only `Sep38PriceContext.SEP31 = "sep31"` and test `customerType = "sep31-receiver"` | 2026-08-29 |
| TypeScript Wallet SDK historically shipped a SEP-31 client | contradicted (false) | B | `git log --all -S sep31` → only `dd4b52a` (2024-01-08) adding the SEP-38 context enum + SEP-12 test type | no Sep31 class in that patch or later tags through v4.0.1 | 2026-08-29 |
| Kotlin/Swift/Flutter Wallet SDKs wrap SEP-31 payment APIs | contradicted (false) | B | Kotlin README successor SEP-1/10/12/24/30; Kotlin `data class Sep31` is TOML only. Swift/Flutter README lists 001/006/007/009/010/012/024/030/038. | no Sep31 client files | 2026-08-29 |
| Some *other* Stellar SDK implements sending-anchor SEP-31 | confirmed-as-of | B | https://github.com/Soneso/kmp-stellar-sdk/blob/main/CHANGELOG.md 1.6.0 | “SEP-31 (Cross-Border Payments): Sending Anchor side. Sep31Service …” | 2026-05-20 / fetched 2026-08-29 |
| SEP-31 is sending-anchor → receiving-anchor, not a wallet↔anchor hosted flow | confirmed | B | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md | Sending Client / Sending Anchor / Receiving Anchor / Receiving Client; “Sending Anchors must authenticate with Receiving Anchors via SEP-10” | 2026-08-29 |
| Anchor Platform, not Wallet SDK, implements SEP-31 | confirmed | A | https://developers.stellar.org/docs/platforms/anchor-platform | “SEP-31 — Cross-border payment processing (receive only)” | 2026-08-29 |
| stellar.org Wallet SDK product page supports the golden’s SEP-31 wrap list | contradicted (false) | A | https://stellar.org/products-and-tools/wallet-sdk | page names deposit/withdrawal and ramps; does not enumerate SEP-31 | 2026-08-29 |

## Recommendation

**“Wallet SDK wraps SEP-31” is false** for the SDK the goldens name (SDF TypeScript `@stellar/typescript-wallet-sdk`).

It is **not true for another Wallet SDK variant** as a client wrap. Kotlin only stores SEP-1 `DIRECT_PAYMENT_SERVER`. Swift and Flutter omit SEP-31 from supported lists. A sending-anchor `Sep31Service` exists on `Soneso/kmp-stellar-sdk`; that is not the Wallet SDK.

It is **not a historical TS client claim**. Reachable history never added a Sep31 class. Remaining `sep31` strings are (a) SEP-38 quote `context=sep31` and (b) a SEP-12 test customer type.

The design match: SEP-31 is server-to-server (sending anchor → receiving anchor). A wallet SDK wraps wallet↔anchor flows (SEP-6/10/12/24/38). SEP-31 belongs on Anchor Platform.

Gospel change is warranted on **both** cases. Also rewrite the matching sentences in `golden.answer` (same false list). Sibling `q-sep-wallet-seps-list` repeats “SDF's TypeScript **Wallet SDK** wraps SEP-10/12/24/31/38 client-side” in its answer (not a keyFact). Out of this lane’s edit scope; flag it so a later pass does not leave a contradicting sibling.

`q-asset-wallet-sdk-seps` `truth.corroboration` currently marks the wrap-including-SEP-31 claim `confirmed` by fetching SEP-0031.md (SEP-31 exists) plus a 2026-07-11 product-page note. That does not show the SDK wraps SEP-31. After gospel change, retag that row `contradicted` (and put the false wrap in `golden.avoid`) or replace the claim with the corrected wrap list.

## Replacement keyFacts (≤90 chars, one predicate)

`q-anchor-sdp-vs-anchor-platform` (84 chars):

```
Wallet SDK is a TypeScript library wrapping client-side SEP-10/12/24/38, not SEP-31.
```

`q-asset-wallet-sdk-seps` (53 chars):

```
It wraps client-side SEP-1/6/10/12/24/38, not SEP-31.
```

Notes for the author:

- Official intro also supports SEP-7; the wallet index also covers SEP-30. Keep those out of these two keyFacts (one predicate; this probe is the SEP-31 wrap).
- `q-asset-wallet-sdk-seps` already names SEP-1 in the answer; official intro also names SEP-6. Including `1/6` there is accurate. The SDP comparison keyFact historically listed 10/12/24/31/38; drop 31 and do not expand that fact in the same edit unless the author also rewrites the answer bullet.
- Add avoid text on both cases: do not claim Wallet SDK wraps SEP-31 (that is Anchor Platform / sending-anchor).
- This lane did not edit case files.
