# Affected case ids — golden metadata remainder (2026-08-31)

Generated from the parsed-JSON diff against `35b5a38` (`main`). 40 case files changed (second pass added the two remaining S1 files).

## Judge-facing gospel changed (3)

- q-protocol-ledger-close-time (golden.notes only: the stale `~3-5s ledger close.` sentence superseded; answer, keyFacts, avoid unchanged)
- q-raph-lobstr-legitimacy (answer: dated activity observation `as of 2026-07-11` → `as of 2026-08-31`; storage language stays source-relative; keyFacts, avoid, notes unchanged)
- q-scf-round-43-results (answer last sentence, keyFact 5, avoid item 4, notes addendum: 28 / $3,049,069 labeled as the dated dashboard `Awarded` paid-state view as of 2026-08-31, 29 / $3,139,069 kept as the official selection result; freshness `stable` → `scheduled`)

## Judge-blind `truth` block only (37)

S1 verified touches, lane A (22): q-jutsu-cash-crypto-ramps, q-jutsu-check-account-history,
q-jutsu-what-is-a-memo, q-raph-claimable-balance-safety, q-raph-exchange-memo, q-raph-hardware-wallet,
q-raph-low-xlm-transfer-fail, q-raph-merchant-payments, q-raph-missing-exchange-memo,
q-raph-offramp-xlm-usdc, q-raph-phishing-pending-claim, q-raph-remittance-path-payment,
q-raph-remove-scam-token, q-raph-restore-wallet, q-raph-scam-spam-tokens, q-raph-stolen-wallet-recovery,
q-raph-unsolicited-airdrop, q-raph-usdc-onto-stellar, q-raph-withdraw-exchange-self-custody,
q-raph-xlm-network-role, q-raph-xlm-simple, q-raph-xlm-staking

S1 verified touches, lane B (13): q-crp-cme-xlm-futures-dates, q-crp-dtcc-stellar-connection-plan,
q-hist-cctp-stellar-live-announcement, q-hist-meridian-2026-corrected-venue,
q-hist-quantum-preparedness-plan, q-hist-x402-stellar-announcement, q-pc-protocol-26-yardstick,
q-pc-protocol-27-zipper, q-pc-slp-0004-0006-status, q-scf-confidential-tokens-preview,
q-n3-cross-thread-memory-exfiltration, q-n3-inject-ignore-previous-instructions,
q-n3-issues-842-backup-faucet-wallet

Verification-gap repairs (2): q-comp-finclusive-caas (second class on the 2026-08-30 row),
q-protocol-base-reserve-min-balance (mutual `sd-046` link)

## Not changed (remainder)

- None. Both previously kept files were repaired in the second pass after blind re-derivation. Bare-relative temporary-path scan → 0 files.
