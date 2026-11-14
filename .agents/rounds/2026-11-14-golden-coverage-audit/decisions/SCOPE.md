# Scope advice: topics outside Raven's sources, and the custody leaf

Lane `scope`, Claude Fable 5.2, 2026-11-14. Advice only: no case, taxonomy, or code file was changed.
Live probes ran through the `claude.ai Stellar Raven` MCP connector (`search`, then `execute`) between
14:00 and 14:06 UTC. A probe records which source rows came back; no answering model was run.

## Summary

1. **Chain comparisons: keep `q-stellar-vs-xrp-ledger` as it stands and add nothing.** Its four key facts are already Stellar-side, and it guards a hazard seen live: Raven's top row for "is Stellar a fork of Ripple" is a 2014 article from when Stellar ran the Ripple consensus.
2. **Pi Network: keep `q-n3-pi-network-wrong-chain` unchanged.** It is already narrowed to the one closely tied fact and grades behaviour. Raven holds no row on Pi, so the fix is one upstream FAQ line, not a case edit.
3. **Regulation: retire `q-pay-anchor-msb-licensing` and propose one replacement on XLM's US classification.** The retired case grades US licensing law that no Raven source holds. The replacement fact is Stellar-specific, Raven's sources hold it, and Raven's first row for "is XLM a security" today is a 2022 "may be securities" article.
4. **Sweep: three more cases carry non-Stellar key facts; move those facts to optional context** (`q-defi-agentic-payment-standards-compare`, `q-defi-agent-identity-stellar-experimental`, `q-asset-usdc-eurc-issuer`). One further edit is optional (`q-edge-oos-solana-vs-aptos`).
5. **Custody: yes, it deserves the leaf. Add one issuer and institutional custody case and move the multisig case to the multisig leaf.** Raven's sources ground it in three families. Net battery size once both proposed cases activate: 246 to 247.

## A. Topics outside Raven's sources

### A1. Affected cases and leaves

The brief names three topics. Four leaves and four cases carry them. A keyword sweep of all 252 files
under `eval/qa/corpus/battery/` found three more cases whose key facts are about something other
than Stellar. The other keyword hits grade Stellar-side facts, or facts that a Docs page, skill, or
Lumenloop row carried in these probes (for example `q-asset-usdt0-layerzero-oft`, `q-defi-bridge-evm-to-stellar-axelar`,
`q-edge-metamask-evm-mental-model`, `q-sor-evm-to-soroban-porting`).

| Case | Leaf (weight, target) | Non-Stellar key facts | Raven grounds them? |
|---|---|---|---|
| `q-stellar-vs-xrp-ledger` | `ecosystem.chain-comparisons` (2, 1) | None. KF1 to KF4 are Stellar-side since `apply/CLOSEOUT.md`. The answer still states three XRP Ledger properties as optional context; notes say a false one is wrong. | Stellar side yes. XRP Ledger side no. |
| `q-n3-pi-network-wrong-chain` | `wallets.pi-network` (2, 1) | KF1, first half: "Pi Network is a separate ledger from Stellar". KF2 and KF3 grade behaviour. | No row mentions Pi. |
| `q-pay-anchor-msb-licensing` | `security.regulation-policy` (2, 1) | KF1, KF2, KF3: all three are a licensing classification framework sourced from eCFR and FinCEN. | No. |
| `q-edge-oos-solana-vs-aptos` | `behavior.out-of-scope` (2, 1) | None as facts. KF2 requires a comparison framework for two other chains. | Not applicable: a behaviour case. |
| `q-defi-agentic-payment-standards-compare` | `ai.mpp-agentic-protocols` (2, 2) | KF3 (AP2) and KF4 (ACP). KF1 and KF2 are half Stellar. | AP2: one SDF blog chunk. ACP: no row. |
| `q-defi-agent-identity-stellar-experimental` | `ai.mpp-agentic-protocols` (2, 2) | KF1: "ERC-8004 is an Ethereum Draft". | One developer-meeting note mentions 8004. |
| `q-asset-usdc-eurc-issuer` | `assets.usdc` | KF4: EURC's EU legal issuer is Circle Internet Financial Europe SAS. | Scout returns a different entity (see A3). |

No active case tests MiCA, the GENIUS Act, the Travel Rule as a key fact, or XLM's regulatory status.
The leaf `security.regulation-policy` is scoped to those ("how regimes such as MiCA and the Travel
Rule treat Stellar assets", `map/taxonomy.json`), so its only case does not test its own scope.

### A2. Demand

`usage/` cannot rank topics: its tables store no queries (`usage/README.md`, "Neither table stores
request headers, queries, answers"). The evidence is the demand map, the Stack Exchange API, and
what SDF and others publish.

| Topic | Evidence | Reading |
|---|---|---|
| Chain comparisons | The top-voted comparison on stellar.stackexchange is "How are the Stellar (XLM) and Ripple (XRP) protocols different?" (955 views, 39 votes, 2018). A `q=ripple` search returns 10 questions, about half of them comparisons, the newest dated 2025-06-22. SDF publishes its own comparisons: "Building on Soroban: Analyzing Soroban vs Ethereum & Solana" (2023-04-24) and a state-archival post against Solana. | Real and steady. Evaluators ask it first. |
| Pi Network | One Stack Exchange question in title or body search ("Is mined Pi the same as Pi bought on an exchange?", 2026-10-18, 14 views). A 2021 r/Stellar thread and a 2026-09-09 exchange explainer exist. `map/map-demand.json` calls the confusion "frequent" on that one question. | Weak in Stellar channels. Plausible in retail, unmeasured. The evidence fits weight 1 better than weight 2. |
| Regulation | Stack Exchange: `q=regulation` 1 question (2018, 567 views), `q=license` 3, title "compliance" 11. `map-demand.json` weighs `rwa.regulation` at 1; the supply map at 2. SDF filed two SEC comment letters in October 2026. | Low for licensing law. I found no count for "is XLM a security"; I rate it high on judgment only. |

### A3. What Raven returns today (2026-11-14)

Each question went to `stellarDocs.search_docs`, `scout.searchResearch`, and
`lumenloop.search_content_semantic` in one `execute`. Every semantic call carried the
`unverified-match` caveat.

**Chain comparisons** (3 questions, 9 calls).

- "How does Stellar differ from the XRP Ledger in consensus, fees and asset issuance": Docs returned the SCP page and `assets#issuer`; Scout returned the Docs SCP, Stellar Stack and Ledgers pages; Lumenloop returned the CoinDesk article of 2014-12-09 and the stellar.org SCP explainer of 2023. No row describes the XRP Ledger.
- "Stellar versus Ethereum and Solana fees finality smart contracts": Docs returned the fees pages and the tokenization comparison table; Lumenloop returned SDF's 2023 Soroban comparison post. The other chains appear only in SDF's own words.
- "Is Stellar a fork of Ripple": Docs and Scout returned off-target rows (Stellar Stack, x402, a Chainlink post, weekly roundups). Lumenloop's first row was "Stellar Network Fork Prompts Concerns Over Ripple Consensus Protocol" (CoinDesk, 2014-12-09). The avoid item "Do NOT say Stellar still runs the Ripple or XRP Ledger consensus protocol" guards exactly this row.
- `qa/RESULT.md` scored the case `partial` before its restatement, because three of its key facts were then XRP Ledger-side.

**Pi Network** (3 questions, 9 calls, plus 2 directory calls).

- No row in any call contains "Pi Network" or "minepi" in title, snippet, or content.
- `scout.searchProjects({q: "Pi Network"})` matched in `majority` mode and returned Axelar, Timed Transactions API, Expand Network and DIA. `lumenloop.search_directory` returned four unrelated slugs.
- The top-level `search` for "Pi Network Stellar fork send Pi to Stellar address" ranked `stellarDocs.search_sdk_cli_tools_docs` first and `skills.stellar-dev.cross-chain` third. A bridging skill beside a Pi question is the invitation the case's avoid items exist for.

**Regulation** (4 questions, 16 calls, and 1 follow-up).

- "Is XLM a security under US law": Docs returned the Lumens page; the Scout `sdf-blog` slice returned "3 Common Misconceptions about ICO Law" (2017); Lumenloop's first row was "Grayscale, Disclosing SEC Queries, Says Cryptos XLM, ZEC, ZEN May Be Securities" (CoinDesk, 2022-08-27). No row gave the 2026 status.
- The same question phrased with "digital commodity" did reach it: Scout returned the Lumenloop roundup of 2026-10-23, and Lumenloop returned its summary of the joint SEC comment letter. Raven holds the fact but reaches it only with the regulator's vocabulary.
- "SDF policy position stablecoin legislation": Scout and Lumenloop returned SDF's STABLE Act post (2020), FinCEN letters (2021), Treasury response (2022), AMF response (2023-11-17), a GENIUS Act news item (2025-06-18), a stablecoin post that cites the Act (2025-08-19), the 2026 SEC letter, and an interview of 2026-10-26. This is newer than `gaps/GAPS.md` records ("held SDF sources date from 2020 to 2023").
- "MiCA USDC EURC": one 2023 partner article and one SCF submission. Docs returned nothing on MiCA.
- "Money transmitter license anchor wallet": Docs returned the Disbursement Platform "Registration" API page and SEP pages; nothing states who needs a licence. The statement "SDF is not a financial institution, money remitter, money transmitter, or money service business" sits on `stellar.org/faq`, which is not a Raven source (owner decision 2).
- `scout.getStablecoins({peg: "EUR"})` gives EURC an `issuerOfRecord` of "Circle Internet Financial, LLC" (as of 2026-11-14T06:42Z, from Circle's `stellar.toml`). KF4 of `q-asset-usdc-eurc-issuer` requires "Circle Internet Financial Europe SAS". An answer that quotes Scout fails the key fact.

### A4. Harm by failure mode

| Topic | Wrong non-Stellar claim | Refusal | Stellar-only answer that omits |
|---|---|---|---|
| Chain comparisons | Low to medium. Embarrassing, rarely costly. The costly variant is a wrong Stellar claim taken from an old comparison row. | Medium. The question is legitimate and half answerable. | Low. A Stellar-side answer with attributed context is the right answer. |
| Pi Network | High. An invented bridge or "Pi runs on Stellar, use your Stellar wallet" loses funds and feeds scams. | Low. | Low to medium. "Unrelated to Stellar" is false: Pi's own site says "The Pi protocol is adapted from Stellar protocol", and its Mainnet API reports `stellar-core 28.0.1` under the passphrase "Pi Network". "Separate network, shared lineage, no transfer route" is the safe answer, and the case's notes already accept it. |
| Regulation | High. A confident licensing or securities claim is acted on. | Low. | High for XLM status. The 2022 row says XLM "may be" a security; the SEC and CFTC release of 2026-03-17 names "Stellar (XLM)" a digital commodity, as guidance that SDF asked the SEC to codify. |

### A5. Options and cost

A case costs USD 0.22 (this round's test, `qa/RESULT.md`) to USD 0.41 (stored runs) per collection.
Judge-facing size: `q-stellar-vs-xrp-ledger` 198 words, `q-n3-pi-network-wrong-chain` 111,
`q-pay-anchor-msb-licensing` 181, against a battery mean of 160.

| Topic | Keep as is | Stellar-side facts plus a stated boundary | Narrow to closely tied facts | Retire |
|---|---|---|---|---|
| Chain comparisons | 1 case, `scheduled` (re-verify by 2027-03-09). This is already the Stellar-side form. **Recommended.** | A required "my sources do not cover the XRP Ledger" fact would fail a correct, helpful answer. Not recommended. | Already done. | Saves about USD 0.30 a run. The battery stops seeing whether a comparison question pulls the 2014 row. |
| Pi Network | 1 case, `stable`, no dated fact. **Recommended.** | The case already grades the boundary (KF2, KF3). | Already narrow. | Saves 1 case. The highest-harm retail hallucination goes unseen. |
| Regulation | 1 case that fails on source coverage every run and measures general legal knowledge. | Not enough: all three key facts are the non-Stellar half. | Rewrite to "neither the network nor SDF is the licensee; the operator that takes custody carries the duty". Groundable only if `stellar.org/faq` becomes a source. Fallback. | Net zero with the replacement. The Travel Rule and the FinCEN framework leave the battery. **Recommended with the replacement below.** |

What retiring `q-pay-anchor-msb-licensing` does not lose: `q-comp-aml-analytics-vendors` KF2 ("Meeting
KYC and AML rules is the anchor's own obligation"), `q-crp-remittance-founder-advisory` KF4 ("SEPs
guarantee no liquidity, licence or coverage") and its avoid item on definitive legal advice.

Replacement for the regulation leaf, as a proposal for the `golden-truth` propose lifecycle:

- Question: "Is XLM a security in the United States?"
- KF1: A joint SEC and CFTC interpretation of March 2026 names Stellar (XLM) a digital commodity.
- KF2: That classification is interpretive guidance, not rule text.
- KF3: SDF asked the SEC in October 2026 to write the classification into the rule.
- Avoid: Do NOT present the 2022 Grayscale disclosure as XLM's current status.
- Freshness `scheduled`: the rule-making (file S7-2026-27) is open. Maintenance is one re-check per SEC action.

### A6. Per-case actions

| Case | Action |
|---|---|
| `q-stellar-vs-xrp-ledger` | Keep. No edit. |
| `q-n3-pi-network-wrong-chain` | Keep. Optional: add `https://minepi.com/blog/pi-linux-node` to `truth.sources` for the lineage note. |
| `q-pay-anchor-msb-licensing` | Retire. Tombstone reason: US licensing law outside Raven's sources; the Stellar-tied fact survives in the two cases above. Add an `openSlots` entry for `security.regulation-policy` until the replacement activates (`lintCoverage` errors on a weight-2 leaf with neither). |
| New XLM classification case | Propose under `eval/qa/corpus/proposed/` and re-derive blind before activation. |
| `q-defi-agentic-payment-standards-compare` | Rewrite. Replace KF3 and KF4 with one Stellar-side fact: Stellar's docs define methods for x402 and MPP, none for AP2 or ACP. Keep the AP2 and ACP descriptions in the answer as optional context, as the XRP case does. |
| `q-defi-agent-identity-stellar-experimental` | Rewrite. Move KF1 to notes as accepted context. KF2 and KF3 stay. |
| `q-asset-usdc-eurc-issuer` | Rewrite. Move KF4 to notes and accept either Circle entity when sourced. The question does not ask for the EU legal entity. |
| `q-edge-oos-solana-vs-aptos` | Optional. Make KF2 "welcome, not required" and drop "or provide only refusal boilerplate" from the avoid item. This reverses the 2026-07-10 choice to grade decision support; it follows from the owner's stance, so it is the owner's call. |

Upstream, not a case change: a one-line SDF FAQ entry on Pi, as `gaps/GAPS.md` already suggests.

## B. Does custody deserve its own leaf?

### B1. What custody means, and who covers it

| Facet | Covered by |
|---|---|
| Seed phrases, secret keys, SEP-5 derivation | `protocol.keys-recovery-phrases`: `q-ti-secret-key-vs-mnemonic-derivation` |
| Hardware wallets as products | `wallets.landscape`: `q-tool-wallets-comparison` KF2, KF3 |
| Lost keys and recovery | `wallets.lost-keys`: `q-aas-sep30-recoverable-wallets`, `q-passkey-wallet-recovery`; `wallets.support-channels` |
| Smart-account and passkey custody | `soroban.contract-accounts`: three primary and two secondary cases |
| Multisig mechanics | `protocol.signatures-multisig`: `q-protocol-accounts-signers-thresholds`; and `q-pc-multisig-setup-lifecycle`, filed under custody |
| Custodial exchange operations | `standards.exchange-integration`: `q-ti-custodial-account-generation-c-address` KF1 |
| Custodial versus non-custodial, as a concept | Only `q-pay-anchor-msb-licensing` KF3, the survivor named by the tombstone of `q-crp-custodial-vs-noncustodial-wallets`. Decision A retires it. |
| Issuer and treasury key protection | None. `q-asset-issue-asset-howto` covers the distribution account, not key storage. |
| Institutional custody providers | None. |

The last three rows are what the leaf is for. Both mappers produced the leaf independently, and its
own question is "How should an application store Stellar secret keys, and which custody providers
support the network?" (`map/taxonomy.json`). The multisig leaf's scope says "Out: ... custody
practice (security.key-custody)", so `q-pc-multisig-setup-lifecycle` belongs on the multisig leaf by
the taxonomy's own wording.

### B2. Does Raven ground a custody answer? (4 questions, 12 calls, 2 directory calls)

Yes, for three of four questions.

- "How should an asset issuer or treasury store and protect Stellar secret keys": Docs returned the issuer keypair section of the issuance tutorial, the agent CLI "Key Storage Security" section (`--secure-store`, `--ledger`), and the keys cookbook. Scout returned SEP-5, SEP-52 and the Asset Issuance Stack. Lumenloop returned SDF's "Key Management 101" (2020).
- "Institutional custody providers that support Stellar": Docs returned "Asset Issuance Stack, Layer 3. Custody and safekeeping" first, naming "Anchorage · BitGo · Taurus". Scout and Lumenloop returned Anchorage (2026-06-15), BitGo (2021) and Taurus (2026-10-29). `scout.searchProjects({q: "custody"})` matched 27 projects in `strict` mode, led by DFNS, BitGo, Fordefi, MPCVault and Cobo.
- "Custodial versus non-custodial wallet, who holds the keys": Docs returned "Application Design Considerations, Custody models"; Lumenloop returned SDF's 2020 roundtable.
- "Ledger hardware wallet Stellar support Soroban contract signing": weak. Docs returned the Soroban signing guide and off-target pages; no row stated the Ledger app's Soroban status.

### B3. Options

| Option | Effect | For | Against |
|---|---|---|---|
| Leave as is | 164 leaves covered, no cost. | Nothing to do. | The map reports custody covered while no case tests key storage, custody models, or providers. After Decision A, no case grades the custodial versus non-custodial distinction. |
| Swap primary and secondary | `q-pc-multisig-setup-lifecycle` becomes primary on `protocol.signatures-multisig` (2 cases on a target of 1, allowed as target plus one). Custody needs an `openSlots` entry. No run cost. | The map becomes honest. One field edit and one slot. | A standing open slot on a weight-2 leaf that Raven's sources can answer. |
| Add one custody case, with the swap | 247 cases. About USD 0.22 to 0.41 per run. A `live` provider roster to maintain, on the pattern of `q-comp-aml-analytics-vendors`. | Tests the uncovered facets where Stellar's current growth is. Groundable in Docs, Scout and Lumenloop. Gives the custody-model fact a survivor. | One more case. Three of the four drafted facts come from one Docs page. |
| Delete the leaf and fold it in | 166 leaves, no cost. | Smallest map. | Issuer key protection and custody providers have no neighbour: the candidates are standards, protocol and wallet leaves. The facets would vanish, not fold. |

### B4. Recommendation and draft

Add one case and swap. The swap alone is the correct interim state and can land in the same pass as
Decision A.

Draft, a proposal only, for the propose lifecycle and a blind re-derivation:

- Question: "We are a regulated issuer about to tokenize a fund on Stellar. How should we protect the issuing account's keys, and which institutional custodians support Stellar assets?"
- KF1: Issuing-account keys are commonly kept in cold storage, such as a hardware wallet or a multisignature setup. Source: `how-to-issue-an-asset.md`.
- KF2: An institution may self-custody, use institutional wallet infrastructure, or appoint a regulated custodian. Source: `asset-issuance-stack.md`, Layer 3.
- KF3: Custodians that support Stellar include Anchorage, BitGo and Taurus. Sources: the same page; Scout custody rows; stellar.org press of 2026-10-29. Live roster: accept any two with a source.
- KF4: A custodian's support for Stellar does not imply support for a specific contract token. Source: the same page.
- Leaf `security.key-custody`; freshness `live`; surfaces `stellarDocs.search_asset_token_docs`, `scout.searchProjects`, `lumenloop.search_content_semantic`.

## Sources

| Class | Ref | Observed | Quote |
|---|---|---|---|
| D | `https://www.sec.gov/files/rules/interp/2026/33-11412.pdf` | 2026-11-14 | "Solana (SOL); Stellar (XLM); Tezos (XTZ); and XRP (XRP)." Footnote 51: "each of these crypto assets is a digital commodity" |
| D | `https://www.sec.gov/comments/S7-2026-27/s7202627-1103179-3882886.pdf` | 2026-11-14 | "the lumen (“XLM”), which is recognized as a “digital commodity” in the Commission’s March 2026 joint interpretive release" |
| D | `https://www.coindaro.com/sec-digital-commodity-rule-text-six-blockchains` | 2026-11-14 | "signed by chief legal and policy officer Candace Kelly and dated 20 October" |
| A (Pi's own site) | `https://minepi.com/blog/pi-linux-node` (2025-08-27) | 2026-11-14 | "The Pi protocol is adapted from Stellar protocol." |
| A (Pi's own site) | `https://minepi.com/white-paper` | 2026-11-14 | "Pi’s consensus algorithm builds atop SCP." |
| F | `https://api.mainnet.minepi.com/` | 2026-11-14 | `core_version` "stellar-core 28.0.1", `network_passphrase` "Pi Network" |
| F | `https://horizon.stellar.org/` | 2026-11-14 | `core_version` "stellar-core 30.0.0", `network_passphrase` "Public Global Stellar Network ; September 2015" |
| A | `https://www.stellar.org/faq` | 2026-11-14 | "SDF is not a financial institution, money remitter, money transmitter, or money service business." |
| A | `https://developers.stellar.org/docs/tokens/how-to-issue-an-asset.md` | 2026-11-14 | "Many users secure their issuing account with cold storage techniques, such as a hardware wallet or multisignature setup." |
| A | `https://developers.stellar.org/docs/tokens/asset-issuance-stack.md` | 2026-11-14 | "an institution may self-custody, use institutional wallet infrastructure, or appoint a regulated/qualified custodian" |
| A | same page | 2026-11-14 | "Do not assume support for Stellar generally means support for a specific contract token or permissioned standard." |
| A | `https://developers.stellar.org/docs/build/apps/application-design-considerations.md` | 2026-11-14 | "There are four custody options to consider" |
| C | `scout.getStablecoins({peg:"EUR"})` | 2026-11-14 | EURC `issuerOfRecord` "Circle Internet Financial, LLC", source `https://circle.com/.well-known/stellar.toml` |
| C | `lumenloop.search_content_semantic`, XLM security question | 2026-11-14 | First row: "Grayscale, Disclosing SEC Queries, Says Cryptos XLM, ZEC, ZEN May Be Securities" (2022-08-27) |
| C | `lumenloop.search_content_semantic`, Ripple fork question | 2026-11-14 | First row: "Stellar Network Fork Prompts Concerns Over Ripple Consensus Protocol" (2014-12-09) |
| D | `https://api.stackexchange.com/2.3/search/advanced?q=pi&site=stellar` | 2026-11-14 | 3 results, 1 about Pi: "Is mined Pi the same as Pi bought on an exchange?" (2026-10-18, 14 views) |
| D | same API, `q=ripple&sort=votes` | 2026-11-14 | "How are the Stellar (XLM) and Ripple (XRP) protocols different?" (955 views, score 39) |

## Not verified

- No answering model ran. "What Raven returns" means source rows for two to four phrasings per topic. A missing row is not proof that a source lacks the content; the XLM result shows how much phrasing matters.
- Whether the MCP connector serves the same build as this branch.
- Demand for "is XLM a security", and Pi demand outside Stack Exchange. No query-level usage data exists, and Discord and Reddit were not counted.
- The SEC release and SDF's letter were read as extracted excerpts, not in full. The letter's date comes from a secondary report.
- Which Circle entity is EURC's current legal issuer. I did not re-read circle.com; the conflict between Scout's row and KF4 is recorded, not settled.
- That Pi and Stellar addresses share a format, and anything in Pi's source code. The lineage rests on Pi's two pages and its API root.
- That the excerpts from `stellar.org/faq` are the whole page. They contained no mention of Pi.
- The Ledger app's Soroban support. One Public Goods page says app v6.1.0 supports Protocol 27; it is not used in the draft.
- The two drafted cases were not re-derived blind, and three of the custody facts rest on one Docs page.
- Per-option cost is the per-case average times the case count, not a measurement.
