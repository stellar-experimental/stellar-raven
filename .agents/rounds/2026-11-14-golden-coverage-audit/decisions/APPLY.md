# Applying the scope decisions

Lane `scope-apply`, Claude Opus 5.5, high, 2026-11-14. Author of every change below. The owner
approved every recommendation in `decisions/SCOPE.md` on 2026-11-14, including the optional
`q-edge-oos-solana-vs-aptos` edit. Branch `audit/scope-decisions`, from `origin/main` at `fc33c6e8`.
A different model re-derives the two proposals blind and reviews this diff; both proposals stay
`proposed`.

## Changes by case

| Case | Change | Commit |
|---|---|---|
| `q-pay-anchor-msb-licensing` | Retired. Tombstone reason: lost relevance, it grades US money-transmitter and Travel Rule law that no Raven source holds. Replacement IDs: `q-comp-aml-analytics-vendors` (KF2, anchor's own KYC and AML duty) and `q-crp-remittance-founder-advisory` (KF4 and its legal-advice avoid item), both re-read today. | `6a4dfcbf` |
| Tombstone `q-crp-custodial-vs-noncustodial-wallets` | Survivor was the retired case. Now points at the proposed `q-comp-issuer-institutional-custody`, and the reason says it is a proposal. | `18fdd1f3` |
| Tombstone `q-pay-travel-rule-aid-flows` | Survivor was the retired case. `replacementIds` emptied; the reason says the Travel Rule regime has no battery case. | `6a4dfcbf` |
| Tombstones `q-comp-finclusive-caas`, `q-crp-become-an-anchor-licensing` | Reasons named the retired case as the owner of licensing. Rewritten to say licensing law left the battery; survivors unchanged. | `6a4dfcbf` |
| `q-comp-xlm-us-classification` (new, proposed) | "Is XLM a security in the United States?" on `security.regulation-policy`, `scheduled`, reverify by 2027-02-11. Three key facts. | `5bba4269` |
| `q-comp-issuer-institutional-custody` (new, proposed) | Issuer key protection and institutional custodians on `security.key-custody`, `live`. Four key facts, one avoid item. | `18fdd1f3` |
| `q-pc-multisig-setup-lifecycle` | Primary leaf `protocol.signatures-multisig`, secondary `security.key-custody`. Judge-facing text unchanged. | `18fdd1f3` |
| `q-defi-agentic-payment-standards-compare` | KF3 (AP2) and KF4 (ACP) replaced by "Stellar docs define payment methods for x402 and MPP only, not for AP2 or ACP." AP2 and ACP stay in the answer; notes say they are optional but a false one is wrong. `truth.asOf` 2026-11-14. | `eba5df21` |
| `q-defi-agent-identity-stellar-experimental` | KF1 (ERC-8004 is an Ethereum Draft) moved to notes as accepted context. | `eba5df21` |
| `q-asset-usdc-eurc-issuer` | KF4 (EU legal issuer) moved to notes. Grading caution on the LLC (see deviations). | `eba5df21` |
| `q-edge-oos-solana-vs-aptos` | KF2 removed; notes make the framework welcome, not required. Avoid item drops "or provide only refusal boilerplate". GT-26 history moved from `golden.notes` to `truth.notes`. | `eba5df21` |
| `q-n3-pi-network-wrong-chain` | Added `https://minepi.com/blog/pi-linux-node` to `truth.sources`. | `f9f0a74b` |
| `eval/qa/taxonomy.json` | Two open slots, `security.regulation-policy` and `security.key-custody`, each naming its pending proposal. Both go when the proposals activate (the lint errors on a slot whose leaf has an active case). | `6a4dfcbf`, `18fdd1f3` |
| `improvements/stellar-light-scout/sls-119-…` | New, `verified`, not posted: Scout's EURC `issuerOfRecord` names Circle's US reseller. A residual of `sls-107`. | `eba5df21` |
| `eval/qa/judge.mjs` | The judge self-test pins the rendered prompt of `q-edge-oos-solana-vs-aptos`; the pin moved with the owner-approved golden edit. | `f9f0a74b` |

Battery: 245 active headline cases, 6 tool-lane cases, 2 proposals, 292 tombstones. Once both
proposals activate: 247 headline cases.

## Sources for each new key fact

All read 2026-11-14. The SEC PDFs were read in full through `parallel-cli extract --full-content`,
because sec.gov refuses a generic client.

### `q-comp-xlm-us-classification`

| KF | Class | Source | Quote |
|---|---|---|---|
| 1. A joint SEC–CFTC release of March 2026 classes XLM as a digital commodity, not a security. | A | `https://www.sec.gov/files/rules/interp/2026/33-11412.pdf` | "Solana (SOL); Stellar (XLM); Tezos (XTZ); and XRP (XRP)." / "Dated: March 17, 2026." |
| | A | same | "Digital commodities, digital collectibles, and digital tools ... are not themselves securities." |
| | A | `https://www.sec.gov/comments/S7-2026-27/s7202627-1103179-3882886.pdf` | "recognized as a “digital commodity” in the Commission’s March 2026 joint interpretive release" |
| | C | `lumenloop.search_content_semantic`, row 12600 | "the "digital commodity" classification (already established in the March 2026 SEC interpretation)" |
| | D | `https://www.cornerstone.com/wp-content/uploads/2026/10/The-SEC-on-Crypto-Assets-2026-Developments.pdf` | "March 17, 2026, Interpretive Release explaining how federal securities laws apply to certain crypto assets" |
| 2. The classification is SEC interpretive guidance, not codified rule text. | A | 33-11412 | "the Commission may refine, revise, or expand upon the interpretation" |
| | A | SDF letter | "appears only in the preamble ... Both would remain guidance that could be narrowed or withdrawn without notice and comment." |
| | D | `https://www.coinsrate.org/news/sec-regulation-crypto-assets-comments` (2026-10-25) | "The SEC has not adopted the proposal or announced a timetable." |
| 3. In October 2026 SDF asked the SEC to write the classification into rule text. | A | SDF letter, dated "October 20, 2026" | "The final rules should also codify the 2026 Interpretation’s digital commodity classification" |
| | C | `lumenloop.search_content_semantic`, row 12600 | "urging codification of the "digital commodity" classification in Regulation Crypto Assets" |
| | D | `https://www.cryptotimes.io/2026/10/21/chainlink-cardano-hedera-avalanche-stellar-aptos-urge-sec-to-codify-digital-commodity-status` | "write the definition of a “digital commodity,” and its status as a non-security" |

Later-change sweep (Parallel search, after 2026-10-20): the SEC staff FAQ update of 2026-11-02
adds classification questions and changes no named asset; the Canton Coin no-action letter of
2026-11-03 adds an asset; Regulation Crypto Assets is not adopted; the Clarity Act is not law.

### `q-comp-issuer-institutional-custody`

| KF | Class | Source | Quote |
|---|---|---|---|
| 1. Keep issuing-account keys in cold storage, such as a hardware wallet, or under multisig. | A | `https://developers.stellar.org/docs/tokens/how-to-issue-an-asset` | "Many users secure their issuing account with cold storage techniques, such as a hardware wallet or multisignature setup." |
| | B | `stellar/stellar-dev-skill@b1785b7b` `skills/assets/SKILL.md` | "Consider multisig for issuer account" |
| | B | `stellar-deprecated/docs` `guides/security.md` | "keeping its secret seed stored offline" |
| 2. An issuer may self-custody, use wallet infrastructure, or appoint a regulated custodian. | A | `https://developers.stellar.org/docs/tokens/asset-issuance-stack` | "an institution may self-custody, use institutional wallet infrastructure, or appoint a regulated/qualified custodian" |
| | D | `https://www.abra.com/learn/how-to-custody-digital-assets` (2026-09-16) | "Three ways to custody digital assets: self-custody, third-party and hybrid." |
| 3. Names custodians with documented Stellar support, such as Anchorage, BitGo or Taurus. | A | asset-issuance-stack, Layer 3 | "Examples: Anchorage · BitGo · Taurus." |
| | A | Anchorage press, 2026-06-15 | "announced custody support for CETES, tokenized Mexican government debt issued by Etherfuse on the Stellar blockchain" |
| | A | `https://developers.bitgo.com/docs/stellar-tokens` | "Stellar tokens can be accessed with the following coin types" |
| | C | `scout.searchProjects` BitGo, Taurus | BitGo: "a regulated qualified custodian and multisignature wallet provider supporting Stellar (XLM)" |
| | C | Lumenloop, The Block 2019-08-21 | "Custodian Anchorage adds support for Tezos and Stellar" |
| 4. Network support does not mean a custodian supports a specific asset or contract token. | A | asset-issuance-stack, Layer 3 | "Do not assume support for Stellar generally means support for a specific contract token or permissioned standard." |
| | A | taurushq.com, 2024-06-24 and 2026-10-29 | Custody on Stellar from 2024; "announced live support for smart contract-based assets on the Stellar network" in 2026 |
| | C | Lumenloop row, 2026-10-29 | "Taurus adds Soroban smart contract support to its institutional custody and tokenization platforms on Stellar" |
| Avoid: wallet software by itself is not a regulated custodian. | A | asset-issuance-stack, Layer 2 | "is not, by itself, a regulatory custody status" |
| | D | Abra guide | "Qualified custodian is a regulatory designation; cold storage, multi-signature and MPC are security techniques." |

### Rewritten facts

| Fact | Class | Source | Quote |
|---|---|---|---|
| Stellar docs define x402 and MPP methods, none for AP2 or ACP (as of 2026-11-14) | A | `https://developers.stellar.org/docs/build/agentic-payments.md` | "using HTTP-native payment protocols like x402 and MPP" |
| | B | `stellar/stellar-docs` `docs/build/agentic-payments/` | Holds `index.mdx`, `mpp`, `x402`; code search for AP2, ACP and both protocol names finds only hash substrings |
| | E | `stellarDocs.search_docs` for AP2 and ACP queries | Only agentic-payments, x402 and MPP pages |
| | D | Parallel search, "Stellar AP2", "Stellar ACP" | No Stellar method for either |
| EURC's legal issuer is Circle Internet Financial Europe SAS; the LLC resells it | A | `https://www.circle.com/legal/eurc-terms` | "EURC is a digital token issued by Circle Internet Financial Europe SAS" / "acts as a reseller of EURC" |
| | A | `https://www.circle.com/eurc` (dated 2026-11-12) | "EURC is issued by Circle Internet Financial Europe SAS" |
| | F | `https://www.circle.com/.well-known/stellar.toml` | `ORG_NAME="Circle Internet Financial, LLC"` |
| Pi lineage (source only) | A | `https://minepi.com/blog/pi-linux-node` (2025-08-27) | "The Pi protocol is adapted from Stellar protocol." |

## Deviations from SCOPE.md

1. **XLM KF1 adds "not a security".** The draft said only "digital commodity", which does not answer
   the question asked. Release 33-11412 states that digital commodities are not themselves
   securities; the SEC staff FAQ (A) and the CryptoTimes report (D) restate it.
2. **XLM primaries did not disagree with the draft.** The letter's date, 2026-10-20, now comes from
   the letter itself. Two corrections to SCOPE's notes: the SEC documents are class A, not D, and
   file S7-2026-27 is not "open" in the sense of accepting comments: comments closed 2026-10-20 and
   the proposal is not adopted. The release's ACTION line reads "Final rule; interpretation;
   guidance" because it is filed in the interpretive-release parts 17 CFR 231 and 241; KF2 says
   "interpretive guidance, not codified rule text", which both primaries support.
3. **Custody KF3 is behavioural.** A `live` key fact must accept a later roster, so it reads "Names
   custodians ... such as Anchorage, BitGo or Taurus", and the notes accept any two with a
   current source. Scout's directory has no Anchorage project; Anchorage rests on its own press page
   and Lumenloop.
4. **Custody gains an avoid item** the draft did not have (wallet software alone is not a
   regulated custodian), backed by Docs (A) and Abra (D).
5. **Custody KF2 for the retired custodial-wallets case.** SCOPE said the custody case gives the
   custody-model fact a survivor. Its KF2 tests custody options for an issuer, not "who controls
   the keys" for a consumer wallet. The tombstone points at it and says it is a proposal.
6. **EURC: "accept either Circle entity when sourced" became "tolerate".** Circle's terms settle the
   issuer as Circle Internet Financial Europe SAS and call the LLC a reseller. The note says naming
   Circle suffices and that naming the LLC from Circle's toml or Scout "does not fail on that point
   alone". It does not call the LLC correct. Scout's value is filed as `sls-119` (`verified`).
7. **Four tombstones edited, not two.** Two named the retired case as survivor; two more named it
   as the owner of licensing in their reasons. All four now say what is true.
8. **Code edit.** `eval/qa/judge.mjs` holds the pinned prompt hash of `q-edge-oos-solana-vs-aptos`;
   `npm test` fails until it moves with the golden. Earlier rounds moved it the same way.
9. **Register re-sweeps by the author.** Edits reopened `cluster-060` (leaf swap only) and
   `cluster-015`, `cluster-029`, `cluster-034`, `cluster-039` (facts removed, none added). I
   re-read each and closed them with `apply/scope-apply-register-review-1.json` and `-2.json`,
   whose reasons ask the diff reviewer to confirm. They are not independent reviews.
10. **Tombstone reviewer.** The retirement's `reviewer` field names the owner's approval of SCOPE.md
    A6 and the scope lane. The diff review is still outstanding.

## Gates

Run bare from the repository root on `f9f0a74b`, and again after the last tombstone wording edit in the APPLY commit (compile, lint, register, selftest, test, secrets scan: all 0).

| Command | Exit |
|---|---|
| `npm run eval:qa:compile` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 (0 errors, 95 warnings; 97 before) |
| `npm run eval:qa:register -- --check` | 0 |
| `npm run eval:selftest` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0 (3398 passed). It failed with 1 test on `eba5df21` (the judge prompt pin); `f9f0a74b` fixes it. |
| `npm run build` | 0 (a code file changed) |
| `npm run improvements:lint` | 0 |
| `npm run secrets:scan -- --tree` | 0 |

No model-calling eval ran. Nothing was posted upstream.

## Not verified

- No blind re-derivation of either proposal yet; that is the reviewer's task.
- Raven, the system under test, reached the XLM fact only through the comment-letter row. For "SEC
  CFTC March 2026 interpretation XLM digital commodity", Lumenloop's first row was a 2025 price
  article. Recorded as an observation, not as a source for the fact.
- Anchorage's current product page for Stellar assets beyond tokenized CETES was not read.
- The Taurus 2024 date comes from Taurus's blog and stellar.org press excerpts in a search result,
  not a full read.
- Whether Scout's USDC `issuerOfRecord` ("Circle Internet Financial, LLC") is the legal issuer was
  not assessed; `sls-119` covers EURC only.
- Whether the Raven connector served this branch's build.
- `.agents/TODO.md` still describes the scope advice as waiting for the owner; this lane did not
  edit it.
