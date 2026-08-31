# Blind re-derivation: q-raph-lobstr-legitimacy

Case: `eval/qa/corpus/battery/retail-consumer/q-raph-lobstr-legitimacy.json`
Question: Is LOBSTR legit, and where does my recovery phrase live?
Lane: independent blind re-derivation, 2026-08-31.
Method: read AGENTS.md, golden-truth SKILL.md, and the case file. Query live sources. Do not use prior verification notes as evidence. Do not edit the repository. Do not read round ledgers or `/tmp/gmr-2026-08-31/retail-report.md`.

Domain: mixed. Provider identity and app listings are real-world. Key-storage and recovery rules are owner-documented product claims. On-chain metadata control is protocol fact.

## Verdicts

| Item | Verdict |
|---|---|
| KF1. LOBSTR is an active Ultra Stellar third-party wallet | **confirmed-as-of** 2026-08-31 |
| KF2. Date the activity assessment | **confirmed** as required method. This lane’s observation date is **2026-08-31**. The case’s printed 2026-07-11 date is an older snapshot. |
| KF3. Current LOBSTR docs describe local/on-device storage | **confirmed** as an owner-docs attribution. The same docs also describe an encrypted server copy. Exclusive “device only” storage is **contradicted** by those docs. |
| KF4. Pre-2020 unmigrated-account exception | **confirmed** |
| KF5. Credentials stay unshared and support cannot reconstruct them, per current LOBSTR docs | **confirmed** as current owner wording. **unverifiable** as an independent implementation audit. |
| Extra focus: an unshared recovery phrase proves no third party controls account metadata | **contradicted** |
| Meaning of “LOBSTR trusted services” | Ordinary English for services the user elects to trust, including the LOBSTR platform. Not a named Stellar protocol product. |

## Commands and timestamps

All times are UTC.

| When | Command or tool | Result |
|---|---|---|
| 2026-08-31T13:47:40Z | `date -u` then `curl -sS -L` of LOBSTR-controlled URLs below | HTTP 200 except `/privacy-policy/` and `/terms-of-use/` (404) |
| 2026-08-31T13:48:04Z–13:48:08Z | `curl` of terms, privacy, recovery tool, extra Freshdesk pages, Play Store, Stellar Docs operations and accounts | HTTP 200 except encyclopedia stellar-toml (404) |
| 2026-08-31T13:47Z–13:49Z | Perplexity search; GitHub `search_code`; Stellar Raven `search` and `execute` | see class D/E/B rows |
| 2026-08-31T13:49:44Z | last quote extraction | complete |

## KF1 — active Ultra Stellar third-party wallet

**Verdict: confirmed-as-of 2026-08-31.**

Class A, https://ultrastellar.com/, curl 2026-08-31T13:47:40Z, HTTP 200:

> Ultra Stellar is building the future of money on the Stellar network.

> Our products LOBSTR Simple & Secure Stellar Wallet … Available as web and mobile app.

Footer: `© 2015 - 2026 Ultra Stellar LLC.`

Class A, https://lobstr.co/, curl 2026-08-31T13:47:41Z, HTTP 200:

> LOBSTR is operated by an independent commercial entity unaffiliated with the Stellar Development Foundation.

Footer: `© 2026 Lobstr.co Ultra Stellar , OÜ.`

Class A, https://lobstr.co/terms/, curl 2026-08-31T13:48:04Z, HTTP 200. Page says last updated Jan 9, 2024:

> Your use of the Lobstr.co website (www.lobstr.co) and its interface ("LOBSTR", "LOBSTR wallet" or "LOBSTR Vault"), software, services, mobile applications, and any other application, software, services, websites, and other related services provided by Ultra Stellar OÜ (A Private Limited company)

> LOBSTR wallet is provided to you by Ultra Stellar OÜ, an independent commercial entity unaffiliated with the Stellar Development Foundation. LOBSTR wallet is only a user interface to Stellar and does not operate the Stellar Network.

> LOBSTR wallet is not a custodian of your Stellar lumens or any other cryptoassets issued on the Stellar Network.

Class D, https://apps.apple.com/us/app/lobstr-wallet-buy-xlm-xrp/id1404357892, curl 2026-08-31T13:47:41Z, HTTP 200:

> Developer ULTRA STELLAR, LLC

> Version 15.6.0 Aug 19

Also lists `Copyright © Ultra Stellar, OÜ`. The listing is live. Version history includes 15.5.1 Aug 10 and 15.4.0 Jul 24.

Class D, https://play.google.com/store/apps/details?id=com.lobstr.client, curl 2026-08-31T13:48:06Z, HTTP 200:

> About the developer Ultra Stellar OU receipts@ultrastellar.com Vesivarava tn 50-201 10152 Tallinn Estonia

Class E, Stellar Docs `search_docs` query `LOBSTR wallet` at about 13:48Z. Hit: https://developers.stellar.org/docs/tools/developer-tools/wallets#stellar-wallet-kit lists `Lobstr` among wallets. That is ecosystem listing, not SDF endorsement.

Legal names differ: OÜ / OU on web and Play; LLC on Apple. The brand owner is still Ultra Stellar. The wallet is still a third party, not SDF.

Activity is current: owner site, live stores, and an Aug 19 app version.

## KF2 — date the activity assessment

**Verdict: confirmed** as the correct method for this scheduled case.

The case tag is `freshness: scheduled`. Store listings and product copy can change. This lane dates the live check to **2026-08-31**.

The golden still prints `as of 2026-07-11`. That older date is not this lane’s observation. A later author must refresh the printed date if the golden keeps a dated activity sentence.

## KF3 — local/on-device storage in current LOBSTR docs

**Verdict: confirmed** as attribution to current owner docs.
**Exclusive device-only storage: contradicted** by the same docs.

Class A, https://lobstr.freshdesk.com/support/solutions/articles/151000169419-security-of-your-wallet-on-lobstr, curl 2026-08-31T13:47:42Z, HTTP 200. Header in page text: Modified on Fri, 26 Jun.

> They then create a Stellar wallet on that LOBSTR account that is both securely stored locally on-device, and uploaded to our server in an encrypted form.

> We store the encrypted version of the Recovery phrase/Secret key on our server.

> Your Stellar Secret key is generated on the device, is encrypted client-side, and is never sent unencrypted to our server.

> We encrypt your Secret key and Recovery phrase using keys derived from your password via script and a per-key salt.

> When a user logs into their account on another platform, the app downloads the encrypted version of the key from the server and stores it locally for further usage.

> The keys themselves can only be decrypted and accessed by users on-device since that requires password (and 2FA) authentication.

> The transaction signing also happens locally on-device.

> Your Secret key and Recovery phrase are encrypted using tweetnacl.secretbox (xsalsa20-poly1305)

Class A, https://lobstr.freshdesk.com/support/solutions/articles/151000001271-where-can-i-find-my-secret-key-, curl 2026-08-31T13:47:41Z, HTTP 200:

> User passwords take part in the process of encryption/decryption of secret keys.

The golden may attribute on-device storage to these pages. It must not claim that current keys never leave the device. Current docs say ciphertext is stored on LOBSTR servers.

The security page also names Passkey accounts on mobile and email-based accounts on web. This lane did not fully re-derive Passkey storage. Do not pin Passkey internals from this pass.

Vault keys are a different product:

> Vault keys are stored on the device only and not backed up anywhere.

Do not mix Vault storage with the main LOBSTR wallet.

No independent binary audit was run (class F absent). Owner crypto claims stay source-relative.

## KF4 — pre-2020 unmigrated-account exception

**Verdict: confirmed.**

Class A, same secret-key article, 2026-08-31T13:47:41Z:

> If your account was created before LOBSTR switched to local key storage (before September 1, 2020) and you haven’t migrated your account to on-device key storage, you can view and backup the secret key of your Stellar wallet only in the Settings of the LOBSTR website.

Class A, https://lobstr.freshdesk.com/support/solutions/articles/151000001273, curl 2026-08-31T13:47:43Z, HTTP 200. Title: Switching to on-device key storage: Migration process overview. Modified on Mon, 6 Jul.

> For users who connected their wallets to LOBSTR before September 1, 2020 , wallet keys are securely stored inside our platform in encrypted form.

> The old key storage system is now deprecated and will no longer be supported. All users who still use the old storage system must complete the migration before July 10, 2026. After this date, wallets that have not been migrated will no longer function until the migration process is completed.

Today is 2026-08-31. The stated migration deadline is past. The exception still exists in live docs: unmigrated wallets wait on migration and keep the old storage model until then.

Restore-key article repeats the same September 1, 2020 website-only reveal rule (curl 2026-08-31T13:47:42Z).

## KF5 — unshared credentials and support-unrecoverable, per current docs

**Verdict: confirmed** as current LOBSTR wording.
**unverifiable** as an audited “LOBSTR cannot decrypt ciphertext” implementation fact.

Class A, backup article https://lobstr.freshdesk.com/support/solutions/articles/151000001289-how-can-i-back-up-my-stellar-wallet-, curl 2026-08-31T13:47:43Z:

> Do not share your Recovery Phrase and Secret key with anyone and keep them secure. Any person or application knowing your private keys may move your funds without your authorization.

> We (the LOBSTR team) do not have access to users' Recovery phrases, Secret keys, Recovery codes, or Account passwords. That’s the main point of LOBSTR security - we don't have access to users' money.

Class A, restore-key article https://lobstr.freshdesk.com/support/solutions/articles/151000001291-how-to-restore-my-secret-key-, curl 2026-08-31T13:47:42Z:

> We (the LOBSTR team) do not have access to users' Recovery phrases, Secret keys, Recovery codes, or Account passwords for security reasons. That's the main point of LOBSTR security - we don't have access to users' money.

> If you have lost your Recovery code or Recovery Phrase and removed your Stellar wallet from LOBSTR systems - we won't be able to help you restore the Secret key of your Stellar wallet.

Class A, phrase article https://lobstr.freshdesk.com/support/solutions/articles/151000001252-what-is-a-recovery-phrase-on-lobstr-, curl 2026-08-31T13:48:06Z:

> You are the only one who has access to your Recovery Phrase. We (the LOBSTR team) do not have access to users' Recovery phrases.

> Anybody else who discovers the phrase can access your Stellar wallet and its private key

Class A, scam article https://lobstr.freshdesk.com/support/solutions/articles/151000109419-how-to-protect-yourself-from-scammers-beware-of-scam, curl 2026-08-31T13:48:05Z:

> The LOBSTR | Ultra Stellar team will NEVER ask you for your private keys.

> Never share it with anyone.

Class A, https://recovery.lobstr.co/, curl 2026-08-31T13:48:05Z, HTTP 200:

> This tool allows you to restore the secret key of the LOBSTR account in case the access to the secret key has been lost. Please make sure to have your Recovery code or Recovery Phrase nearby. You will also need the email address of your LOBSTR account. The process is secure and may require several confirmation steps, or manual approval from our staff. All recovery attempts are logged in our database.

The recovery tool does not claim staff can invent a lost phrase. It requires the user to still hold the phrase or code. Staff approval is a process gate, not reconstruction.

Negative implementation claims stay owner-relative. This lane did not audit the app or server.

## Extra focus — unshared recovery phrase vs account metadata

**Claim:** An unshared recovery phrase proves that no third party controls account metadata.

**Verdict: contradicted.**

### Protocol (class A / E)

https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations#manage-data
`stellarDocs.get_doc_page_sections` and curl 2026-08-31T13:48:07Z, HTTP 200. `last-modified: Thu, 27 Aug 2026 17:55:31 GMT`.

> Sets, modifies, or deletes a data entry (name/value pair) that is attached to an account

> Threshold: Medium

https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations#set-options
same fetch:

> Set options for an account such as flags, inflation destination, signers, home domain, and master key weight

> Threshold: High (when updating signers or other thresholds) or Medium (when updating everything else)

https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts, curl 2026-08-31T13:48:07Z:

> Home domain (up to 32 characters)

> Data entries (includes data made with the manageData operation, not smart contract ledger entries)

On-chain data entries and `home_domain` change only with a signature that meets the threshold. An unshared seed, a sole signer, and no extra signers mean a stranger cannot submit those operations. That is a protocol condition. It is not a proof about every kind of “account metadata.”

### Off-chain metadata LOBSTR still controls

Class A, backup article:

> Stellar Federation address A unique name of a Stellar wallet, which can be set by a LOBSTR user. It commonly looks similar to ‘username*lobstr.co’.

A `*lobstr.co` federation name is a LOBSTR-server mapping. LOBSTR can set, change, or drop that name without the recovery phrase.

Class A, security article: LOBSTR stores encrypted recovery phrase and secret key on its server, plus an email-linked account. That is third-party held account data even when ciphertext is claimed not to be decryptable by staff.

Class A, terms: the service is provided by Ultra Stellar OÜ. Account records live in that service.

### Extra signers and old storage

Vault and other signers can authorize medium-threshold operations if their weight is enough. Unshared *wallet* phrase does not bind those extra keys.

Pre-2020 unmigrated wallets still have keys stored on the LOBSTR platform per KF4.

### Result

Unshared phrase does **not** prove “no third party controls account metadata.”

It does **not** control federation names, LOBSTR email accounts, or server-side encrypted blobs.

It does **not** remove extra signers.

It does **not** override the pre-2020 exception.

A narrower true protocol sentence is: only a signer with enough weight can change on-chain data entries and home domain. Keep that sentence. Do not upgrade it to a metadata-control proof.

## Meaning of LOBSTR “trusted services”

**Verdict: resolved as ordinary English, not a named product.**

Class A, secret-key article:

> Use caution and only share your keys with trusted services. If your funds were stolen due to your actions outside the LOBSTR platform and trusted services, we will not be able to help.

Class A, restore-key article:

> You can also use your Recovery Phrase to derive the secret key(s) of your Stellar wallet(s) using other reliable third-party tools. Only share your Recovery Phrase with trusted services.

GitHub `search_code` `"trusted services" org:lobstr` returned no code hits. Stellar Docs `"trusted services"` in `stellar/stellar-docs` returned none.

Freshdesk search for the phrase lands on those recovery articles, not on a product page titled Trusted Services.

Reading:

1. “Trusted services” means services the user chooses to trust.
2. The LOBSTR platform is included (“LOBSTR platform and trusted services”).
3. `https://recovery.lobstr.co/` is a LOBSTR-operated tool that accepts a Recovery Phrase or Recovery code plus email.
4. Reliable third-party derivation tools are the same class once the user shares the phrase.
5. This is not a Stellar protocol type and not a documented API named “LOBSTR Trusted Services.”
6. WalletConnect “connected services” is a different phrase. Lobstr Vault is a signer product. Do not merge those names.

Sharing the phrase with any such service gives that service the seed. That is why the extra metadata-control claim fails.

## Corroboration matrix

| Claim | Verdict | Classes and refs |
|---|---|---|
| LOBSTR is an active Ultra Stellar wallet unaffiliated with SDF as of 2026-08-31 | confirmed-as-of | A: ultrastellar.com, lobstr.co, lobstr.co/terms. D: Apple id1404357892 (v15.6.0 Aug 19), Play `com.lobstr.client`. E: Stellar Docs wallet list names Lobstr |
| Activity claims must carry an observation date | confirmed | scheduled freshness; this observation 2026-08-31 |
| Current docs say current/migrated keys are encrypted with password participation and used on-device | confirmed | A: security article; secret-key article |
| Current docs also say encrypted phrase/key copies are stored on LOBSTR servers | confirmed | A: security article |
| Keys exist only on the device and never on LOBSTR servers | contradicted | A: “uploaded to our server in an encrypted form” |
| Pre-September 1, 2020 unmigrated wallets keep a documented exception | confirmed | A: secret-key, restore-key, article 151000001273 (migration deadline July 10, 2026) |
| LOBSTR docs require unshared credentials and say support cannot reconstruct a lost phrase | confirmed | A: backup, restore-key, phrase, scam articles |
| LOBSTR actually cannot decrypt server ciphertext | unverifiable | owner claim only; no class F audit |
| Unshared recovery phrase proves no third party controls account metadata | contradicted | A/E protocol Manage Data / Set Options; A federation `*lobstr.co`; A server-side encrypted copies; A extra signers / pre-2020 exception |
| “Trusted services” is a named LOBSTR protocol product | contradicted | A wording is generic; no product page or docs-index hit |

## What this lane did not do

It did not edit repository files.
It did not read current round ledgers or `/tmp/gmr-2026-08-31/retail-report.md`.
It did not treat the case `truth.verified` notes as evidence.
It did not reverse-engineer the LOBSTR app.

## Reply verdict

KF1 confirmed-as-of 2026-08-31. KF2 confirmed; date this check 2026-08-31. KF3 confirmed as owner-docs on-device attribution; exclusive local-only storage contradicted. KF4 confirmed. KF5 confirmed as owner-docs, unverifiable as audit. Unshared phrase does not prove that no third party controls account metadata (contradicted). “Trusted services” is ordinary English, not a named product.
