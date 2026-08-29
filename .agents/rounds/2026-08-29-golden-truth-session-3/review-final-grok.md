# Final adversarial review — complete diff vs origin/main (Grok)

Date: 2026-08-29
Lane: read-only. Wrote only this file. Did not edit cases.
Base: `origin/main`. Check: `git diff origin/main --stat` and the seven items in `pack/grok-final-brief.md`.

## 1. Strkey validation — PASS

Paths: `eval/qa/strkey.mjs`, `eval/qa/compile-qa.mjs`, `test/qa-strkey.test.mjs`.

Reproducible check:

- `npx vitest run test/qa-strkey.test.mjs` → 8 passed (G and C positive; G and C transcription/length/alphabet; unknown version; SEP-23 invalid `GAAAAAAAACGC6` and unused-bit M; compiler rejection with path+token+reason).
- `eval/qa/strkey.mjs` version bytes match SEP-23 and `js-stellar-base` `src/strkey.js`: G `6<<3`, C `2<<3`, M `12<<3`, P `15<<3`. CRC16-XModem is little-endian (`checksum[0] = crc & 0xff`, `checksum[1] = crc >> 8`), same as js-stellar-base.
- Canonical round-trip: `encodeBase32(decoded.bytes) !== text` → `non-canonical base32 encoding`. Unpadded length `1|3|6 mod 8` is rejected.
- `validateCase` in `eval/qa/compile-qa.mjs` fails `invalid strkey at ${path}: ${token} (${reason})`. Guarded `main()` plus `validateCaseFile`.
- Adversarial craft (node import of `decodeStrkey` + `validateCaseFile`):
  - CRC-valid G with algorithm bits `1` / `7` (version 49 / 55) → compile REJECT `unknown version byte`.
  - CRC-valid G with 33-byte payload (58 chars, SEP-23 vector `…UACUSI`) → compile REJECT `account payload must be 32 bytes; got 33`.
  - Valid M `MA7QYNF7…ACJUQ` → decode `muxed`. Valid P signed-payload vector → decode `signedPayload`. Compiler accepts them as valid strkeys (not G/C type errors).

Residual: `findStrkeyCandidates` is `\b[GSMTXPCLB][A-Z2-7]{55,}\b`, so tokens shorter than 56 characters are not scanned. A CRC-valid 31-byte G (55 chars) is ACCEPTED by `compile-qa.mjs`. Production G/C keys are 56 characters; the required tests still pass.

## 2. Three part-review FAILs (12) — PASS

Ledger: `.agents/rounds/2026-08-29-golden-truth-session-3.md` (08:52Z, 09:21Z, 09:50Z, 10:15Z). Check: current JSON vs the recorded owner fix.

| id | ledger reconciliation | file check |
|---|---|---|
| q-aas-list-token-on-exchanges-aggregators | single disjunctive tradability fact | keyFacts[2] is `Tradability needs SDEX offers, AMM pools, or wallet/exchange/aggregator listings.` |
| q-asset-deploy-sac-cli | URL stays; cookbook added; P2 renamed constant | evidence has cookbook URL; keyFact `CONTRACT_ID_PREIMAGE_FROM_ASSET`; avoid forbids `CONTRACT_ID_FROM_ASSET` |
| q-asset-path-payment-ops | replace SDEX abbreviation | keyFacts[2] is `Routes through the DEX order book, AMM pools, or both.` |
| q-asset-two-account-issuer | deferred then P2 stamp | date `2026-08-29`; creates-supply split; avoid `Do NOT claim the issuing account holds a balance of its own asset.` |
| q-comp-cross-bitso-sep31 | presentation fact → avoid | avoid `Do NOT assert unlisted SEP support for Bitso.` |
| q-crp-become-an-anchor-licensing | one-license tail → avoid | avoid contains `one anchor license` |
| q-passkey-smart-account-architecture | add three URLs | evidence has `cap-0051.md`, guestbook, `webauthn-3` |
| q-protocol-max-tx-set-size | presentation fact → avoid | presentation keyFact gone; avoid carries the trap |
| q-protocol-network-passphrases-list | `/docs/networks` added | evidence contains `docs/networks` |
| q-soroban-fuzz-testing | delete presentation keyFact | keyFacts has 3 entries; `Avoids unsupported claims…` absent |
| q-ti-vocab-regions-live | recorded reason, not verbatim URL swap | live line still names `https://mcp.lumenloop.com` (HTTP 400); owner-fix line names `https://api.lumenloop.com/v1/tools/get_regions` |
| q-zk-host-functions-status | P2 stamp + Implemented | date `2026-08-29`; keyFact `Protocol 26 implemented CAP-0080 with status Implemented.` |

## 3. P2 gospel changes — FAIL

Conflict 9, canonical 5, sourcing-guard rewords, and Protocol 27 dates meet the two-class bar. New corroboration rows do not.

### Conflict lane (9) — PASS

Live re-check 2026-08-29:

- Wallet intro lists SEP-1, SEP-10, SEP-24, SEP-6, SEP-12, SEP-38 and omits SEP-31 (`https://developers.stellar.org/docs/build/apps/wallet/intro`).
- Control-asset-access: `an issuing account can't actually hold a balance of its own asset` (`https://developers.stellar.org/docs/tokens/control-asset-access`).
- SAC page names `CONTRACT_ID_PREIMAGE_FROM_ASSET` (`https://developers.stellar.org/docs/tokens/stellar-asset-contract`).
- CAP-0080 header: `Status: Implemented`, `Protocol version: 26`.
- Contradicted wrap/hold/spelling claims are mirrored in `golden.avoid` on the SEP-31, issuer-hold, and SAC-constant cases.

### Canonical lane (5) — PASS

- `q-protocol-base-reserve-min-balance` notes: official Sponsored Reserves page, attributed quote is not wrong, partial cap, `sd-043`, expiry when fixed-upstream. Live page still has `liabilities.selling` (`https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves`).
- `q-ti-rpc-gettransactions-pagination-xdr` notes: official getTransactions page, attributed quote, partial cap, not universal immutability, `sd-004` declined-upstream, no expiry. Live quote: `an upper limit that is hardcoded in Stellar-RPC` … `defaults to 50` (`https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions`).
- `q-ti-freighter-localhost-not-detected` notes: official frontend guide, attributed quote, partial cap, `sd-045`, expiry, no global HTTPS exception. Live: `Freighter wallet requires a secure connection (HTTPS)` (`https://developers.stellar.org/docs/build/guides/dapps/frontend-guide`).
- Three-case boundary holds. Horizon partial-cap caution pre-existed at HEAD (`git show origin/main:eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json`).
- `q-pc-protocol-27-zipper` keyFacts: `Dates the Protocol 27 Mainnet vote to July 8, 2026.` and `Gives July 8, 2026 as the official Protocol 27 Mainnet date.` Answer keeps July 11 as a Horizon check only. Live heading: `Protocol 27 (Mainnet, July 8, 2026)` (`https://developers.stellar.org/docs/networks/software-versions`).

### Sourcing-guard rewords (3) — PASS

Concrete false claims: oracle “permanently the most established”; `github.com/stellar/go/ingest`; `stellar-deprecated/kelp` actively maintained. Avoid items do not punish a possibly-true claim.

### Corroboration rows — FAIL

Check: `git diff origin/main -- eval/qa/corpus/battery`, compare `truth.corroboration` by claim text.

- 82 new claims. 20 have ≥2 classes. **62 have one class** (48 `confirmed`, 13 `confirmed-as-of`, 1 `disputed`) across 35 cases.
- Skill bar for these rows is ≥2 independent classes. Class A docs alone is not enough.
- Examples: `eval/qa/corpus/battery/assets-anchors-seps/q-aas-claimable-predicates-expiry-reserves.json` adds four class-A-only negatives (`Expiry is not automatic deletion.` and three siblings). `q-crp-custodial-vs-noncustodial-wallets.json` splits FinCEN (A) and FATF (A) and the D sweep onto separate one-class rows. `q-infra-horizon-vs-rpc.json` disputed lifecycle row is class A only.

Exact fix: for each newly added corroboration row whose `evidence` has one `class`, add a second independent class with URL, `observedAt`, and quote. Do not merge distinct claims. Prefer class B (XDR/core/SDK) or a dated class D sweep for negatives.

## 4. Dead provenance — PASS

Check: `rg -l '/tmp/' eval/qa/corpus/battery` vs `git diff --name-only origin/main -- eval/qa/corpus/battery`.

47 files still contain `/tmp/`. All 47 are untouched. No touched file still carries a temporary path.

## 5. Parsed-JSON scope — PASS

Check: `node …/scratchpad/gt3/pack/json-diff.mjs /dev/stdout` → 224 cases, 211 judge-facing. Unexpected field list empty.

`golden.answer` only on the nine conflict cases plus `q-pc-protocol-27-zipper`, `q-crp-custodial-vs-noncustodial-wallets`, `q-defi-arbitrage-pathpayment-bots`. `golden.notes` only on the three caution cases plus `q-comp-security-disclosure-programs`, `q-crp-custodial-vs-noncustodial-wallets`, `q-defi-arbitrage-pathpayment-bots`. `tags.freshness` only on `q-comp-security-disclosure-programs`. Remaining changes are `golden.keyFacts`, `golden.avoid`, and `truth.*`.

## 6. Lint — PASS

Check: `node eval/qa/lint-corpus.mjs --since origin/main --stale`.

`0 error(s), 60 warning(s)`. `rg 'exceeds 90' /tmp/gt3-final-lint.txt` → zero. Breakdown: 44 `[avoid]` sourcing-guard + 16 `[corroboration]` grammar-only heuristics. Zero `[key-fact]`.

## 7. Independence (five random cases) — PASS

Pick: `python3` `random.seed(20260829)` over `git diff --name-only origin/main -- eval/qa/corpus/battery`. Fetch one live URL each on 2026-08-29.

| id | form | live URL | HTTP | claim on page |
|---|---|---|---|---|
| q-edge-noinfo-stellar-pos-staking-rewards | split yield vs LST bound; no-PoS kept | `https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol` | 200 | FBA vs Proof of Stake; `no monetary rewards` |
| q-pc-account-activation-not-found | shortened CreateAccount vs key/Payment | `https://developers.stellar.org/docs/build/guides/transactions/create-account` | 200 | CreateAccount creates the account after a keypair |
| q-scf-hummingbot-kelp-closed-rfp | split Kelp gap vs connector | `https://github.com/NibrasD/stellar-hummingbot-connector` | 200 | connector repo exists |
| q-passkey-smart-account-architecture | split; not-complete-WebAuthn stays in avoid | `https://developers.stellar.org/docs/build/apps/guestbook` | 200 | `passkey-powered smart wallet` |
| q-smart-account-scoped-policy-signers | split scope vs unrestricted | `https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns` | 200 | session expiry, spend limits, policy vs signer |

No dropped object. No new number/version/date.

## Findings (FAIL rows)

1. **Corroboration two-class bar.** Path: 35 battery files (see scan); first example `eval/qa/corpus/battery/assets-anchors-seps/q-aas-claimable-predicates-expiry-reserves.json`. Check: new `truth.corroboration` claims with a single `evidence.class`. Fix: add a second independent class (B or dated D) with URL, date, and quote on each of the 62 rows.

## Residual risks

- `findStrkeyCandidates` ignores strkeys shorter than 56 characters.
- `q-ti-vocab-regions-live` still cites `https://mcp.lumenloop.com` on the Live re-check line (HTTP 400); the working URL is only in the owner-fix sentence.
- `q-anchor-sdp-vs-anchor-platform` wrap list is SEP-10/12/24/38; sibling `q-asset-wallet-sdk-seps` is SEP-1/6/10/12/24/38. Incomplete, not a false wrap.
- 47 untouched files still hold `/tmp/` provenance (out of scope).
- 60 remaining lint warnings are the kept advisory classes.

## VERDICT: APPROVE-WITH-FIXES

Apply the 62-row two-class corroboration fix. Do not expand the three-case caution set. Do not change Protocol 27 July 8 / July 11 split.
