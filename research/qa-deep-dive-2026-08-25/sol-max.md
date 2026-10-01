# Raven QA pipeline failure forensics

Date: 2026-08-25  
Run: `eval/qa/results/2026-08-14T03-56-23-variantA.json`  
Run revision: `70726884a723786c669283953f576277ce9d955b`  
Scope: all 55 original non-correct rows

## Scope and method

The requested `brief-sol-max.md` file did not exist.
The nearby `brief-sol.md` file names the `sol-max` mission.
I used that matching brief.

I made no repository changes.
I did not start a server or run a paid evaluation.
I read the saved results, the rejudge, the goldens, and the relevant source code.

I treated each saved transcript as the primary evidence.
I assigned the earliest loss that the transcript proves as the primary stage.
Some rows also show a later or measurement-side loss.

The saved search entries contain inputs and character counts.
They do not contain search response bodies.
I therefore replayed search against the historical manifest and scorer.
The historical scorer and the current scorer have the same executable logic.
Their diff contains comment changes only.

I use a strict rule for Stage F.
Stage F means no visible exposed source carried the required fact at this snapshot.
It does not mean that the fact was absent from the public internet.

The report uses `M` for a measurement contribution.
It uses `P` for an answering-provider failure.
These modifiers do not replace the required A through F stage.

## Main findings

The original run had 45 correct, 39 partial, 15 wrong, and one error.
The diagnostic half-credit score was 64.5 points.
This score gives each partial answer one-half point.

The 55 misses split as follows:

| Stage | Rows | Share | Maximum half-credit gain |
|---|---:|---:|---:|
| A — search failed | 2 | 3.6% | 1.5 |
| B — execute misused | 6 | 10.9% | 3.0 |
| C — output lost | 3 | 5.5% | 2.0 |
| D — multi-hop break | 9 | 16.4% | 5.0 |
| E — answerer failure | 15 | 27.3% | 10.0 |
| F — no exposed source | 20 | 36.4% | 14.0 |
| **Total** | **55** | **100%** | **35.5** |

Search ranking was not the main loss.
The right operation or skill ranked near the top for most replayed queries.
Most losses happened after discovery.

The miss set contains 136 search calls and 136 execute calls.
Thirty-four rows contain a `SOURCE BASIS` truncation block.
Twelve rows contain at least one execute error.

Stage F has the largest mass.
However, it contains several independent source gaps.
No single source change can recover its full 14-point ceiling.

Stage E has the largest local product opportunity.
Many answers ignored dates, exact types, formulas, or source conflicts already present in context.

The original `p3` evidence pack also hid evidence from the judge.
This defect changed some grades without changing any answer.

## Stage taxonomy for all 55 rows

The quote column contains saved transcript text.
An empty transcript has no tool line to quote.

| # | Case | Original | Stage | Decisive transcript evidence | Causal finding |
|---:|---|---|---|---|---|
| 1 | `q-agent-identity-erc8004-stellar` | partial | F + M | Response: `"judgeScore":0.8,"judgedHackathon":"Agentic Hackathon"` | No exposed ERC-8004 specification supported the trust-signal caveat. The judge also called the visible `0.8` unsupported. |
| 2 | `q-anchor-sdp-vs-anchor-platform` | partial | D | Response: `SEP-6: Programmatic Deposit and Withdrawal ... SEP-24 ... SEP-31 ... SEP-10 ... SEP-12 ... SEP-38` | The agent combined a general anchor page with shallow SDP and Wallet SDK results. It did not resolve each product's exact SEP role. |
| 3 | `q-asset-stablecoin-issuers-discovery` | partial | D | Responses: `"EURC","company":"MyKobo"` and `Circle is the issuer of USDC ... and EURC` | Two source views described different roles. The answer copied one row without reconciling Circle's issuer role. |
| 4 | `q-comp-auth-flags-overview` | partial | E + M | Skill response lists `AUTH_REQUIRED`, `AUTH_REVOCABLE`, `AUTH_IMMUTABLE`, and `AUTH_CLAWBACK_ENABLED`. | The answer covered the current four key facts. The rejudge changed this row to correct. |
| 5 | `q-comp-finclusive-caas` | partial | D | Source basis: `"lumenSearch" ~19.3k chars (cut); kept intact: "anchorDocs", "sep12Docs"` | The answer needed current product claims, dated Biccos history, and scoped legal duties. The composition did not preserve all three. |
| 6 | `q-defi-allbridge-what-is` | partial | B | Execute called `scout.searchProjects({ q: "Allbridge", limit: 5 })` and docs searches. | Historical search placed the cross-chain skill first. The agent did not read it, so current and historical route distinctions stayed unresolved. |
| 7 | `q-defi-arbitrage-pathpayment-bots` | partial | B | Errors: `pathPayDocs.data.map is not a function` and `ops.data.filter is not a function` | The script treated object payloads as arrays. Recovery found path-payment basics, but it lost time and risk coverage. |
| 8 | `q-defi-bridge-evm-to-stellar-axelar` | partial | E | Skill response: `Axelar waits for validator confirmation, intents wait for a market maker.` | The trust-model distinction reached the answerer. The final answer omitted the intent and RFQ trust model. |
| 9 | `q-defi-etherfuse-stablebonds` | partial | D | Response: `Stablebonds — tokenized government treasury bonds (Mexican CETES, US Treasuries and others)` | The agent found the product. It did not compose issuer, legal, maturity, liquidity, oracle, and incident evidence. |
| 10 | `q-defi-perps-whitespace` | partial | C | Script: `return { dexNames, perpMatch, derivMatch, semanticHits, hackathonHits, derivCluster };` | The script projected project rows but discarded service metadata. The final answer therefore lacked a defensible as-of value. |
| 11 | `q-defi-phoenix-what-is` | partial | F | Source basis: `"contentPhoenix" ~46.2k chars (dropped), "projSearch" ~35.0k chars (cut)` | No visible result proved the classic-asset, SAC, or 2024-whitepaper facts. A tail-loss claim would be speculation. |
| 12 | `q-defi-skill-ecosystem-scout` | partial | B | Searches: `"ecosystem landscape sector projects categories regions"` and `"sector map projects by category and region"`; no execute followed. | The exact ecosystem skill ranked first in replay. The agent found it but never read it. |
| 13 | `q-defi-wisdomtree-crdt` | wrong | F | Response returned adjacent `DTCC` material; source basis reports `"entCRDT" 71 chars (dropped)`. | No visible source carried CRDYX, CRDT launch, transfer-agent, or exact issuer facts. |
| 14 | `q-eco-pyusd-stellar-freshness` | partial | F + M | Response: `PYUSD ... launched on Stellar in September 2025.` | No visible source supplied September 18. The rejudge still changed the unchanged answer to correct. |
| 15 | `q-eco-stellar-wallets-list` | wrong | C | Script reads `first.data.meta?.counts?.total`, then returns `total`, `count`, and `wallets`. | The script proved metadata existed, then dropped it. The final roster had no observation date or lifecycle qualification. |
| 16 | `q-edge-asset-site-scam-detection` | partial | F | Response: `An asset consists of a type, code, and issuer.` It only shows contract-token headings. | The exposed result supported classic identity checks. It did not supply the required custom-contract ID check. |
| 17 | `q-edge-exchange-memo-lost-funds` | partial | E | Response: memos were used for `individual accounts in a pooled account` and points to muxed accounts. | No transaction-status evidence existed. The final answer nevertheless assumed successful settlement before giving recovery steps. |
| 18 | `q-edge-noinfo-stellar-native-privacy-default` | partial | F | Response shows `Privacy on Stellar` and `Confidential Tokens`; it shows no Testnet or audit status. | The global-toggle rejection was sound. The exposed docs did not carry the required network and audit qualifications. |
| 19 | `q-edge-send-me-free-xlm` | partial | E | Saved transcript: `[]` | The agent correctly refused. It chose no retrieval and omitted Futurenet and local Quickstart Friendbot. |
| 20 | `q-gap-related-projects-empty` | partial | B | Only call: `search({"query":"get_related_projects"})` | The exact operation ranked first. The agent did not execute it, so it omitted content-ID and soft-empty semantics. |
| 21 | `q-infra-horizon-vs-rpc` | wrong | D | First script used `migrate.data.length`; result returned `"migratePage":null`. Later docs said `Horizon is nearing end-of-life`. | The agent recovered one lifecycle source. It did not compose the conflicting official lifecycle language or RPC's wider scope. |
| 22 | `q-infra-secp256r1-passkeys` | partial | F | Source basis: `"research" ~21.0k chars (cut), "smartAccounts" ~3.7k chars (dropped)` | No visible result carried the complete WebAuthn checks and relayer distinction. Output loss is possible, but unproved. |
| 23 | `q-jutsu-what-is-a-memo` | partial | F | Response only describes `Pooled accounts: muxed accounts and memos`. | The exposed text did not contain the exact supplied-memo crediting rule. |
| 24 | `q-mpp-discovery-and-modes` | wrong | F | Skill response: `MPP — Machine Payments Protocol (Charge + Session)` | The pinned skill covered the modes. It lacked current OpenAPI `x-payment-info.offers` and runtime challenge precedence. |
| 25 | `q-n3-ssrf-metadata-endpoint` | error | E + P | Saved transcript: `[]`; agent output tokens: `0`; stored agent error: `"success"`. | The provider safeguard replaced the required refusal. The old runner then mislabeled the provider outcome as an API error. |
| 26 | `q-org-sdf-enterprise-fund` | partial | D | Source basis: `"generalResearch" ~23.7k chars (cut), "semantic" ~9.2k chars (dropped)` | The response needed fund totals plus a separate MoneyGram treasury-investment distinction. The agent did not preserve both. |
| 27 | `q-pay-moneygram-ramps` | partial | F | Partner response lists `"services":["sep-24","on-ramp","off-ramp","usdc"]`. | The exposed data supported SEP-24 and USDC. It did not supply SEP-10 or current per-transaction limits. |
| 28 | `q-pc-protocol-27-zipper` | partial | F | Response: `Protocol 27 activated on Stellar mainnet July 9.` | No visible result supplied the July 11 independent check or the exact V2 credential symbol. |
| 29 | `q-protocol-23-whisk-caps` | partial | F | Response shows `CAP: 0062`; source basis reports `"capRes" ~15.8k chars (dropped)`. | No visible source carried the complete eight-CAP set, current value two, and `slp-0004.md`. |
| 30 | `q-protocol-base-reserve-min-balance` | wrong | F | Docs response: `(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling.` | The answer copied a source formula that merges minimum balance with selling liabilities. The source also undercounted pool-share reserves. |
| 31 | `q-protocol-ledger-close-time` | partial | E | Response includes `update the ledger every 5-7 seconds` and `It's strictly monotonic`. | The observed range and close-time rule reached the model. The final answer omitted the close-time semantics and target distinction. |
| 32 | `q-quickstart-manual-ledger-close` | wrong | F | The script queried `stellar-core manualclose`; no result contains `MANUAL_CLOSE` or `--enable-core-manual-close`. | The exposed docs missed the manual-close feature. The final answer therefore denied a supported workflow. |
| 33 | `q-raph-hardware-wallet` | partial | E + M | Source basis reports large research loss, but the final answer preserved the security boundary and no universal threshold. | The current golden's two key facts were present. The rejudge changed this row to correct. |
| 34 | `q-scf-academic-research-grant` | partial | B | Source basis: `"q3" ~48.5k chars (dropped), "q1" ~32.0k chars (cut), "q2" ~28.8k chars (dropped)` | The agent returned broad raw searches without a narrow projection. It never reached a usable institution, PI, and student distinction. |
| 35 | `q-scf-build-tracks` | partial | C | Source basis: `"chunks" ~124.8k chars (cut), "rfpsSample" ~7.1k chars (dropped)` | The script mapped result arrays into `chunks` and lost source metadata. Truncation then hid Resubmission and decision details. |
| 36 | `q-scf-ecosystem-listing-partner-jobs` | wrong | E | Response includes `"generatedAt":"2026-08-14T03:18:28.966Z"`; source basis says `"dirListing" ~27.9k chars (cut)`. | The evidence was incomplete and dated. The final answer still made a categorical no-form claim. |
| 37 | `q-scf-v7-changes` | wrong | E | Response: `10% upon award`, then `20%`, `30%`, and `40%`; it separately shows `Growth Hack`. | The final answer called all four payments milestones and invented a unified prior Growth track. |
| 38 | `q-sep6-sep24-sep31-choice` | partial | D | Skill response lists SEP-6, SEP-24, and SEP-31 uses. It shows no endpoint keys or current status. | The answer needed protocol choice, live standard status, and SEP-1 endpoint discovery. The composition stopped after protocol choice. |
| 39 | `q-sor-cross-warmancer-zk-stack` | wrong | A | Searches hard-filtered `service:"scout"` and `service:"lumenloop"`; response kept `pending technology availability`. | The filters excluded Raven's ZK skill. An unfiltered historical replay places that skill first. |
| 40 | `q-sor-p23-auto-restore-extendto` | partial | E | Response: `current_ledger_number + 4095`; another result exposes `max_entry_ttl`. | The needed bound was visible. The final formula omitted the maximum-minus-one rule. |
| 41 | `q-sor-sep41-transfer-vs-transferfrom` | partial | E | Response: `transfer(... to: MuxedAddress ...)` and `transfer_from(... to: Address ...)`. | The exact type distinction reached the answerer. The final answer did not state it. |
| 42 | `q-soroban-auth-recursion-dos-audit` | wrong | F | Response: `V-SOR-VUL-002 ... Severity Critical ... Status Investigated`. | No visible result supplied the V2.1 `V-SOR-APP-VUL-003` renumbering. The source indexed the finding without version-safe identity. |
| 43 | `q-soroban-sdk-cve` | partial | F | Release response includes `compare/v23.5.1...v23.5.2`. | The sources supported three advisories. They did not expose every branch mapping or the package distinction in one usable result. |
| 44 | `q-soroban-token-transfer-pattern` | wrong | E | Skill response: `token transfer accepts [MuxedAddress] for the destination`. | The exact current signature was visible. The final code used `Address` for direct transfer. |
| 45 | `q-stellar-recurring-payments` | partial | D | Response contains custom-account authorization and allowance material. It contains no idempotency, failed-payment, or pause material. | The answer composed authorization only. It did not add the application operations required for safe recurring billing. |
| 46 | `q-ti-connect-wallet-button-code` | partial | E | Skill code calls `isConnected`, `requestAccess`, `getAddress`, and `getNetwork`. | The final hook copied the main flow. It omitted passphrase validation and a pending-action guard. |
| 47 | `q-ti-custodial-account-generation-c-address` | partial | B | Errors: skill content `sits at the top level`; artifact field requires `r.data.vanityRepos`. | Repeated envelope mistakes interrupted a complex workflow. The recovery still omitted C-account auth, fee-payer, seed, and muxed handling. |
| 48 | `q-ti-freighter-localhost-not-detected` | wrong | F | Official result points to `setup-https-on-localhost`. | No visible source carried the current implementation disagreement. The answer copied the official HTTPS rule as universal. |
| 49 | `q-ti-rpc-gettransactions-pagination-xdr` | wrong | F | Error: artifact field requires `r.data.tokenTransferPage`; later source basis drops several large docs sections. | The current docs did not expose configurable limits, failed transactions, diagnostics, and XDR-mode distinctions accurately. |
| 50 | `q-ti-testnet-usdc-faucet` | partial | D | Skill response says `Fund both with testnet XLM (friendbot)` and then `Add a USDC trustline`. | The answer needed Friendbot, Circle faucet, Lab, trustline, SAC, reserve, and non-redeemable distinctions. It combined only part. |
| 51 | `q-token-circle-usdc-on-stellar` | partial | F | First error: skill content `sits at the top level`; retry source basis says `"cctpSkill" ~17.9k chars (cut)`. | The agent recovered native USDC and CCTP mechanics. No visible source supplied the required date and legal-entity qualification. |
| 52 | `q-tool-freighter-wallet` | partial | E | Response: `"generatedAt":"2026-08-14T03:52:21.590Z"` and `"statusAsOf":"2025-12-17T23:01:54.133Z"`. | The final answer had browser and mobile facts. It did not expose an as-of date for those changing facts. |
| 53 | `q-tool-indexer-repos-discovery` | wrong | E + M | Response contains Galexie, SubQuery, and `xycloo/rs-zephyr-toolkit` with URLs and activity fields. | The final answer found useful projects but blurred their roles. The original judge also missed visible support; p5 raised the grade. |
| 54 | `q-tool-passkeykit-smart-wallet` | wrong | F | Skill response: `Legacy SDK: https://github.com/kalepail/passkey-kit`. | The pinned source itself used retired wording. The final answer faithfully repeated stale guidance. |
| 55 | `q-tool-sep41-status-live` | partial | A | Execute searched only Stellar Docs; result states SAC implements `SEP-41 Token Interface`. | The interface source surfaced, but the standards-status source did not. The standards skill missed the top historical results. |

## Code-level mapping

### Stage A — search failed

The base scorer lives in `src/catalog/vendor/search-scoring.ts::scoreEntry`.
It scores exact, prefix, and substring token matches.
It requires full coverage for queries with two tokens or fewer.
It requires 60% coverage for longer queries.

`src/catalog/scoring.ts::scoreEntryWeighted` adds aliases, keywords, stopword rescue, and kind weights.
It remains a lexical scorer.
It does not infer question clauses or entity relationships.

`src/catalog/search.ts::searchCatalogPage` applies hard `service` and `kind` filters before ranking.
The filters fully excluded the ZK skill in the Warmancer row.

`src/catalog/search.ts::deriveWiderCandidates` only returns operation candidates.
It cannot recover a skill excluded by a service-filtered search.

`scripts/build-catalog.mjs::attachOperationKeywords` and `attachRoutingKeywords` add structural search terms.
They depend on available descriptions and routing metadata.
They did not make current standards status discoverable for SEP-41.

The two A rows have medium confidence.
The saved transcript omits search bodies, so the replay supplies the ranking evidence.

### Stage B — execute misused

`src/executor/providers.ts::buildOpsFns` returns every service call as an envelope.
The successful shape is `{ ok: true, data }`.
The failed shape is `{ ok: false, error }`.

`src/executor/providers.ts::envelopeGuardPrelude` catches direct payload reads on the envelope.
It also explains skill and artifact result shapes.
The saved errors show these guards working.

The guard does not catch array methods on an object payload.
For example, `r.data.map` fails when `r.data` contains `hits`.
The error does not list the available payload keys.

`src/catalog/search.ts::renderSignature` exposes signatures and output keys in search hits.
This metadata did not prevent repeated object-versus-array mistakes.

The allbridge, ecosystem-skill, and related-project rows show another B mode.
The correct surface ranked first, but the agent never called it.

### Stage C — output lost

Model code can discard data before the host receives its return value.
This loss happens inside the sandbox.
The host cannot recover a field that the script never returns.

`src/executor/run.ts::createExecuteRunner` applies redaction and `truncateForModel` after script completion.
It can store the full returned value as an artifact.
It cannot store upstream fields removed by model code.

`src/policy/truncate.ts::truncateForModel` keeps a fixed prefix.
It then appends a loss footer.
This design favors early object keys and early array items.

`src/policy/source-basis.ts::buildSourceBasisManifest` reports cut and dropped top-level keys.
It does not preserve source timestamps or match modes by itself.

This mechanism explains the wallet roster, perps roster, and SCF track rows.
Each script discarded provenance or returned an oversized aggregate.

The artifact path is useful after host truncation.
It is not a fix for model-authored projection loss.

### Stage D — multi-hop break

`execute` supports `Promise.all` and dependent calls.
It provides computation, not a plan or a coverage model.

`src/policy/evidence-checkpoint.ts::evidenceCheckpointBlock` sees called operation classes.
It can suggest a different retrieval lane.
It cannot inspect the returned facts or the user's unresolved clauses.

The operation ledger records operation IDs and outcomes.
It does not record claim coverage.

Nine rows needed two or more distinct evidence roles.
Common pairs included current versus historical, product versus risk, and protocol versus endpoint discovery.

The agent often gathered one role well.
It then answered before it resolved the other role.

### Stage E — answerer failure

Raven does not generate the final prose.
The external answering model generates it after Raven returns evidence.

`eval/qa/run-qa.mjs::agentPrompt` controls the evaluation answerer contract.
It asks the model to ground specific claims and date current facts.
Several rows ignored those rules even when the transcript contained the needed values.

`src/policy/evidence-checkpoint.ts::candidateEvidenceBlock` warns about candidate evidence and open-world claims.
It does not check the final answer.

The frequent E patterns were consistent:

- The answer omitted a visible date.
- The answer changed an exact type or formula.
- The answer made a categorical absence claim from incomplete evidence.
- The answer flattened a visible source conflict.
- The answer skipped a safety or trust qualification.

Three E rows also have a strong measurement contribution.
Those rows are auth flags, hardware wallet, and indexer discovery.

### Stage F — no exposed source

`catalog/manifest.json` defines every exposed source operation and skill.
`src/adapters/index.ts::callService` dispatches those operations.
Local code cannot return a fact that no adapter, index, or pinned skill carries.

Stage F contains several source families.
Examples include stale skills, missing docs sections, wrong indexed formulas, and missing exact audit identifiers.

Existing findings already cover several cases:

- `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md`
- `improvements/stellar-docs/sd-004-rpc-limits-described-as-hardcoded.md`
- `improvements/stellar-docs/sd-034-smart-wallet-passkey-kit-legacy-routing.md`
- `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md`
- `improvements/stellar-docs/sd-045-freighter-https-requirement-unqualified.md`
- `improvements/stellar-light-scout/sls-074-appendix-audit-identifiers-exact-miss.md`

The Phoenix and passkey rows need special care.
Their transcripts prove that visible evidence was insufficient.
They do not prove that an exact fact existed beyond the truncation boundary.

## Evidence-pack and judge path

The original run used rubric `v2.4` and evidence pack `p3`.
The execute result footer used `--- SOURCE BASIS ---`.

Historical `p3` only split results at `--- TRUNCATED ---`.
Its `tryParseJsonPrefix` therefore included the source-basis footer in the JSON text.
JSON parsing then failed for those rows.

Historical `p3::shapeLine` also counted only `--- TRUNCATED ---` markers.
It reported many source-basis-truncated results as untruncated.

Historical `p3::truncationLine` had the same marker error.
The judge did not receive the host's loss summary.

Current `eval/qa/evidence-pack.mjs::splitExecuteResult` recognizes both markers.
It also recognizes the console marker.
This is the correct mechanical fix.

The stable-case gate remains active.
`shouldIncludeTranscriptEvidence` returns false when `freshness === "stable"`.

Among the 55 misses, the pack coverage was:

| Freshness | Rows | Non-empty p3 packs | Rows with source-basis truncation | Rows with execute errors |
|---|---:|---:|---:|---:|
| live | 16 | 15 | 11 | 3 |
| scheduled | 22 | 22 | 13 | 4 |
| stable | 17 | 0 | 10 | 5 |
| **Total** | **55** | **37** | **34** | **12** |

The stable gate deprived the judge of direct support on 17 misses.
Ten of those rows also had explicit output loss.

`eval/qa/judge.mjs::buildTranscriptEvidence` delegates to the pack builder.
`buildJudgePrompt` then treats that bounded pack as transcript support.
The judge never sees the complete transcript.

The current omission diagnostic is useful.
`findTranscriptEvidencePackOmissions` checks wrong-claim terms against full execute results.
However, `attachTranscriptEvidenceDiagnostics` skips stable rows.

## Measurement-side defects

### 1. Search responses are not reproducible

Saved search rows contain `resultChars` but no response body.
The record loses hit IDs, ranks, signatures, output keys, and next steps.

This omission blocks direct Stage A review.
It also hides whether the model ignored a top-ranked hit.

The harness should save a bounded search summary.
It should include rank, ID, service, kind, tier, and output keys.

### 2. `p3` misparsed current execute footers

The `SOURCE BASIS` marker mismatch corrupted JSON extraction and truncation counts.
The original judge therefore received incomplete evidence on many large results.

Current `p5` fixes the parser.
Historical `p3` results remain non-comparable unless a rejudge uses the original golden snapshot.

### 3. Stable rows receive no transcript evidence

The stable gate assumes that transcript support matters only for changing facts.
That assumption is false.

Stable answers can contain exact types, formulas, identifiers, and supported extra claims.
The auth-flags and indexer rows show this problem clearly.

The pack should cover every row with execute evidence.
A smaller stable-row cap can control judge cost.

### 4. The rejudge changed two variables

The rejudge used pack `p5` instead of `p3`.
It also used a different `cases.json` hash.

Its metadata correctly reports `nonIdentical: true`.
Its tuple also reports `matches: false`.

The 17 flips therefore mix pack changes, golden changes, and judge variance.
They do not measure one intervention.

### 5. The result does not embed the golden text

Each row stores only a small `truth` status and date.
The full golden remains external in `cases.json`.

A later rejudge can silently grade an old answer against changed facts.
The artifact should embed each exact golden or a content-addressed snapshot.

### 6. One provider safeguard became a transport-style error

The SSRF row produced zero output tokens and an agent error named `success`.
The stored answer was a provider safeguard notice.

The current runner now parses provider outcomes separately.
It blanks errored provider text before judging.
The historical row still depresses the product headline.

### 7. One judge sample has visible variance

The same answer and model produced 17 score flips.
Seven original misses improved, while one original miss worsened.

The full diagnostic score fell from 64.5 to 63.0.
This movement occurred without new answer generation.

A second judge should review only wrong, error, and flip rows.
This keeps cost bounded while exposing unstable grades.

## General fixes ranked by expected gain divided by effort

The expected ranges are forensic estimates.
They are not rerun results.
The ranges overlap because one row can have secondary losses.

| Rank | General fix | Expected gain on this sample | Effort | Main stages |
|---:|---|---:|---|---|
| 1 | Add payload-shape guards and stronger read-after-search guidance | 1.5–2.5 points | low | B |
| 2 | Add a host-owned provenance sidecar | 2.0–4.0 points | low to medium | C, E |
| 3 | Add a bounded final evidence checklist | 3.0–5.0 points | medium | E |
| 4 | Add multi-clause retrieval support | 2.5–4.5 points | medium to high | D |
| 5 | Repair and refresh upstream truth surfaces | 5.0–9.0 points | high | F |
| 6 | Add skill recovery and status-oriented search metadata | 0.5–1.5 points | medium | A |

### 1. Payload-shape guards

Wrap successful object payloads with a diagnostic proxy.
Trap array-only reads such as `.map`, `.filter`, `.length`, and iteration.

The error should list real payload keys.
For example, it can say `use r.data.hits` when `hits` exists.

Keep the current skill and artifact guards.
They already produce useful recovery instructions.

Add one search next-step when a top hit is a skill.
The message should say that search does not read skill content.

### 2. Host-owned provenance sidecar

Capture a safe metadata allowlist inside `buildOpsFns` before sandbox projection.
Useful fields include `generatedAt`, `dataAsOf`, `matchMode`, and result counts.

Append this metadata to `SOURCE BASIS`.
The model then receives dates even when its script maps only rows.

Do not capture arbitrary nested values.
Do not expose secrets or partner-tier details.

This fix addresses the proven metadata losses.
It does not claim to preserve unknown answer facts.

### 3. Bounded final evidence checklist

Add a short internal checklist to the answering contract.
The final answer need not show the checklist.

The checklist should require these checks:

- Date every changing roster, status, version, or measurement.
- Copy exact symbols, types, formulas, and identifiers.
- Scope every absence claim to the searched source.
- State visible source conflicts instead of selecting one silently.
- Include trust and safety qualifications already present in evidence.

Any prompt change creates a new evaluation variant.
Test it against unrelated failures before adoption.

### 4. Multi-clause retrieval support

Extend search recovery metadata to include skills and excluded source families.
Do not mix excluded hits into the filtered result list.

Return an advisory group for likely missing evidence roles.
Useful roles include current state, historical state, technical specification, and risk evidence.

Extend the execute checkpoint with called-role coverage.
Keep the wording conditional because the host does not judge payload contents.

Avoid question-specific query maps.
Use manifest metadata and retrieval profiles only.

### 5. Upstream truth repair

Use the existing improvements pipeline for exposed-source defects.
Prioritize wrong rows with exact reproducible gaps.

The first group should include these mechanisms:

- Wrong formulas or limits in official docs indexes.
- Missing current commands and configuration flags.
- Stale pinned skill wording.
- Audit identifier and version collisions.
- Missing exact dates, entities, and standard statuses.

Each change needs provenance and a recurrence probe.
Do not add per-question aliases or fabricated facts.

### 6. Search recovery improvements

Include skill candidates in `deriveWiderCandidates`.
Show them as advisories when a service filter excluded them.

Build status and specification keywords from skill section metadata.
This can improve SEP and CAP status discovery.

Do not add a semantic reranker only for these two rows.
The measured Stage A ceiling is too small for that cost.

## Changes that lack evidence

Do not increase the global execute cap based on this run.
No audited miss proves that the required fact sat only beyond the returned prefix.

Do not read artifacts automatically.
Automatic reads increase cost and can repeat the same oversized result.

Do not make artifacts replace narrow projections.
The Phoenix and custodial rows show that a poor artifact projection can still fail.

Do not add a global verbose-response instruction.
The failures concern specific evidence disciplines, not answer length.

## Ceiling estimates

The stage ceiling assumes every row in that stage becomes correct.
It uses the original 100-case denominator.

| Fix class | Rows | Original mix | Absolute ceiling | Score after isolated perfect fix |
|---|---:|---|---:|---:|
| Search discovery | 2 | 1 partial, 1 wrong | +1.5 | 66.0 |
| Execute-use contract | 6 | 6 partial | +3.0 | 67.5 |
| Output and provenance | 3 | 2 partial, 1 wrong | +2.0 | 66.5 |
| Multi-hop support | 9 | 8 partial, 1 wrong | +5.0 | 69.5 |
| Answer discipline | 15 | 10 partial, 4 wrong, 1 error | +10.0 | 74.5 |
| Source truth | 20 | 12 partial, 8 wrong | +14.0 | 78.5 |

These ceilings are not additive in practice.
Several rows have a secondary failure after the primary failure.

The observed rejudge gives a separate measurement bound.
Seven original misses moved upward by one grade.
Their maximum upward movement was 3.5 points.

One original miss moved downward by one-half point.
The net movement within the 55 misses was therefore +3.0 points.

The full 100-case score moved down by 1.5 points.
The changed golden hash prevents a causal measurement claim.

## Recommended order

First, fix the harness evidence record.
Save bounded search hits and exact golden snapshots.
Include transcript evidence for stable rows.

Next, add the payload-shape guard and provenance sidecar.
Both changes target proven mechanics with limited surface risk.

Then test a bounded final evidence checklist.
Use unrelated E rows as the acceptance set.

After that, add multi-clause recovery metadata.
Keep its output advisory and manifest-driven.

Finally, continue upstream truth repair through `improvements/`.
That work has the largest ceiling and the highest coordination cost.

