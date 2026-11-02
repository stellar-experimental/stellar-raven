# Cross-case consistency audit: entities touched by the golden diff

Worktree: /private/tmp/claude-501/raven-goldens-1102 (branch eval/golden-audit-2026-11-02), diff against origin/main.
Date: 2026-11-02. Scope: judge-facing text (question, answer, keyFacts, avoid, notes) of all 501 battery cases, plus eval/qa/consistency-register.json.
Method: a per-case dump of base and current judge-facing text, then entity greps across the whole battery for each entity, number, date, and name in the diff.

## Checked and consistent (no action)

- Varial/Freighter rename. All 13 cases that name the wallet now carry the rename. They agree on 2026-10-29, extension 5.50.0, `@stellar/varial-sdk` 7.0.0 (2026-10-28), `@stellar/freighter-api` 6.0.1, and Wallets Kit 2.8.0 `VarialModule`. No unchanged case still names Freighter in judge-facing text.
- Protocol versions in cases. P27 2026-07-08 ledger 63386819, P28 2026-09-16 ledger 64458446, P29 2026-10-01 ledger 64717645, and Bell/P30 votes on 2026-11-03 and 2026-11-23 agree across 8 or more cases. The P26 six-CAP set (no CAP-0081) agrees between q-pc-protocol-26-yardstick and q-protocol-version-history-list.
- Cluster setting 1 to 2 to 3 (SLP-0004, then SLP-0007 at ledger 65080525) agrees in q-protocol-parallel-execution and q-protocol-23-whisk-caps.
- Confidential Tokens. The status (preview on 2026-06-29, then v0.8.0 audited and Mainnet-ready on 2026-10-22, with the non-ZK verifier limit) agrees across the three cases.
- SEP statuses (41 Draft v0.5.2, 45 Draft, 57 Draft v0.4.0, 38 Draft), Stellar CLI 28.1.0, soroban-sdk 29.0.1, OZ v0.8.0, CAP-0080 Final 2026-09-22, Allbridge Core/Next, the Instaward $15K cap, and SCF Build $150K all agree.

## Findings

### F1 HIGH: the two YieldBlox cases now contradict each other on Script3 and the 14,000 USDC
- q-comp-yieldblox-oracle-incident (changed) says Script3's 2026-03-04 post-mortem lists a separate 14,000 USDC *attacker borrow* (tx 01c2ba75, 00:20:50 UTC). It asserts a Script3 net loss of about $10.5M, and its avoid forbids attributing any *other* net-loss figure to Script3.
- q-hist-yieldblox-v2-2026-exploit (notes and asOf changed, answer kept) says "Script3 reported about $10M". Its avoid is "Do NOT ... repeat the unverified Script3 $10.5M net-loss attribution". It frames the 14,000 USDC only as a pre-existing liability.
- An answer that cites Script3's $10.5M gets credit on one case and fires an avoid on the other.
- The register still carries the old fact. The numericInvariants "YieldBlox borrowed XLM USDC totals" rule says the 14,000 USDC "was a PRE-EXISTING liability, not a separate earlier borrow". The cluster-013 and cluster-126 notes say "Script3 ~$10.5M net-loss attribution remains unverified".
- Fix: reconcile q-hist with the newly found Script3 post-mortem, or revert q-comp. Then update the YieldBlox invariant rule and the cluster-013/126 notes, and re-stamp the hashes.

### F2 MEDIUM: the official SCF #46 deadline is Nov 8 in one case and Nov 9 in four others
- q-scf-contract-verification-rfp-live notes say: "official awards page deadline November 8, 2026; Scout lists 2026-11-09".
- q-scf-current-round, q-edge-fresh-latest-scf-round, q-scf-open-rfps-live, and the register "SCF Submission" invariant say something different. They say the official page moved to 2026-11-09 after the 2026-10-18 snapshot. They also say both the official page and Scout show Nov 9.
- Fix: change the q-scf-contract-verification-rfp-live note to say the official page and Scout both show 2026-11-09 (the page showed Nov 8 earlier).

### F3 MEDIUM: q-scf-open-rfps-live keeps an avoid about an ended round
- Its avoid "Claims that an open brief proves SCF #45 still accepts a new full proposal." has not changed since base. Siblings say #45 has ended and #46 is in Submission.
- Fix: make it round-neutral, for example "...proves the current SCF round accepts a new full proposal" (the q-scf-passkey-rfps-live wording).

### F4 MEDIUM: register Confidential Tokens entries are stale
- cluster-047 and cluster-127 notes say Confidential Tokens is a 2026-06-29 Testnet developer preview.
- The dateContingentTraps entry disposition says "open — Testnet developer preview, unaudited". It cites reverifyBy 2026-12-15 and 2026-11-19. The trigger ("any Confidential Tokens Mainnet approval/launch") fired on 2026-10-22.
- The cases now say v0.8.0 is audited and Mainnet-ready, with reverifyBy 2027-04-22 and 2027-04-08.
- Fix: update both cluster notes and the trap disposition and dates, then re-stamp.

### F5 MEDIUM: register entries still call Protocol 27 current
- numericInvariants "Protocol 27 Mainnet version" has recheckOn "next Mainnet protocol activation". Two activations happened since (P28, P29).
- The dateContingentTraps P28 trigger fired on 2026-09-16, but its disposition still says "open — P27 is current as of 2026-08-30".
- cluster-120 says "P27 is current on Mainnet ... P28/AddressV2 remains a future recheck".
- Cases now say P29 is current.
- Fix: retarget the invariant to P29 or to a history-only rule, close the trap, and update cluster-120.

### F6 MEDIUM: the register x402 roster is stale
- cluster-125 says the official roster "excludes Freighter Mobile".
- q-soroban-x402-auth-entry-signing now lists Varial Mobile through WalletConnect, and adds Scopuly.
- Fix: update the cluster-125 note and re-stamp.

### F7 LOW-MEDIUM: register SCF RFP entries are stale
- cluster-081 says "the official Q3 page and live feed support two open briefs ... #45 is in Panel Review ... stays queued in .agents/TODO.md".
- cluster-085 says "absent from the two current Q3 briefs".
- The SCF dateContingentTraps disposition says the roster conflict "stays queued" and repeats the text ".agents/TODO.md before their 2026-11-12/13 due dates" twice.
- The changed cases now report that the official page lists no brief (new Q4 RFPs are "coming soon"), and that Scout lags.
- Fix: rewrite these notes for the 2026-11-02 state and fix the repeated text.

### F8 LOW: the register CAP-0073 status is stale
- cluster-008 says "CAP-73 Implemented/P26". q-sor-contract-trustlines-c-address changed that text from "CAP-0073, Implemented" to "CAP-0073, Final".
- Fix: update cluster-008.

### F9 MEDIUM: q-gap-compare-hackathons contradicts q-scf-hackathon-compare-live
- q-gap-compare-hackathons (unchanged, 2026-07-11) says to use `getHackathon` for one event's submissions and winners, "not the comparison response".
- q-scf-hackathon-compare-live (changed) says that on 2026-11-02 `compareHackathons` returns `submissionCount` and `winnerCount`, which match the detail stats, so "either explicit source is acceptable".
- Fix: date the q-gap wording, or add a note that comparison counts are acceptable when returned. Winner *names* and order stay detail-only.

### F10 LOW: q-crp-anchors-by-corridor notes describe MoneyGram's old SEP path
- The notes say "MoneyGram Ramps uses Stellar USDC with SEP-10/24". They also say the 2026-08-14 /info minimum was 1 USDC against the guide's 15.
- q-anchor-moneygram-ramps and q-pay-moneygram-ramps now say SEP-10/24 is the legacy allowlisted path and new partners use the widget SDK. They also say the named production anchor (mgxanchor) /info shows 15 USDC, and only the older stellar.moneygram.com shows 1.
- Fix: add the widget/legacy split and the per-host minimum to the note.

### F11 LOW: q-defi-etherfuse-stablebonds notes call OrbitCDP Live
- The notes (unchanged) say "live Scout confirms OrbitCDP (Live, Lending, SCF $280K)".
- q-defi-named-newer-protocols, q-defi-blend-alternatives, and q-defi-rwa-scf-similar say Scout labels OrbitCDP Inactive, that the operator site conflicts, and that it must not be called unqualifiedly live.
- Fix: date that note to 2026-06-22, or drop the "Live" label.

### F12 LOW: ledger-header wording conflicts with the Bell guide
- q-protocol-ledger-header-fields says `LedgerHeader` is "the same in the stellar-xdr v27.0, v28.0, and v30.0 releases", and that P30 changes only the nested StellarValue extension.
- q-pc-protocol-upgrade-timing quotes the Bell guide: "CAP-88 changes the ledger header format".
- An answer that repeats the Bell guide could be marked wrong on the ledger-header case.
- Fix: add a note that the CAP-88 change is the nested `closeTimeMs` ext, so "changes the header format" is not wrong.

### F13 LOW: the supply-cap caveat is missing from a sibling
- q-aas-issuer-fees-supply-cap-freeze now has a caveat: locking the issuer caps supply only while the SAC admin is still the issuer, because a SAC admin moved with `set_admin` can still mint.
- q-asset-issue-asset-howto step 6 says "Optionally cap supply by locking the issuer" with no caveat.
- Fix: add the same do-not-penalize caveat.

### F14 LOW: the Scout SCF totals now disagree in size across dates
- q-scf-total-distributed (asOf moved to 2026-11-02) still gives Scout funding-v2 $39,851,645.13 across 391 projects (2026-07-10/11).
- q-scf-funding-by-category gives Scout active-only $58,585,451.99 across 582 funded projects on 2026-11-02. That active-only subset is larger than the earlier all-status total.
- Fix: refresh the dated Scout figure in q-scf-total-distributed, or add a note that the Scout reconstruction grew between dates.

### F15 LOW: staking cases disagree on the newer facts
- q-edge-noinfo-stellar-pos-staking-rewards still dates its negative to the 2026-07-10 sweep and has no caution about the October 2026 SDF fee-pool rewards discussion paper.
- q-raph-xlm-staking and q-hot-fee-pool-burn-deflation now carry that caution, and q-defi-liquid-staking-whitespace re-swept on 2026-11-02.
- Fix: add the same dated do-not-penalize caution, and update the sweep date.

### F16 LOW: dates and notes disagree inside changed cases (internal, adjacent to the lens)
- q-eco-hana-wallet-scf has freshness "stable" but now carries a dated domain claim (hana.money redirects to Wend).
- q-crp-regional-offramp-mobilemoney notes still say "HoneyCoin mobile-money lead unchanged", but the new six-entry answer roster has no HoneyCoin.
- q-scf-build-tracks, q-sep6-sep24-sep31-choice, and q-infra-testnet-vs-futurenet have answers that say "As of 2026-07-10/11/08-04" while truth.asOf is 2026-11-02.
