# M1-C1 vs M1-B1: final paired fact review (v3)

- **Decision:** D3 rejected under the frozen stop. Root and Fable independently verified the AV K1 loss.
- **Matrix:** `M1-C1-vs-B1-matrix.json` (v3). Earlier versions are kept as `M1-C1-vs-B1-matrix.v1.json`
  and `M1-C1-vs-B1-matrix.v2.json`. In each row, `originalReviewerJudgment` holds the prior value that changed.
- **Criteria:** `paid-comparison-review-criteria.md`. Aggregate grade gain never excuses a loss.
- **Artifacts:**
  - B1 `2026-09-17T01-33-03-variantA.json`, sha256 `ef988d64…afa0`, rev `848edec4`.
  - C1 `2026-09-17T03-21-24-variantA.json`, sha256 `9f5fdab8…5308`, rev `c6968e74`, $5.9831158.
- **Validity:** both runs are comparable and cost-complete, with 16 rows in the same order. Tuple, register,
  binary, env, and surface are identical. The 13 unchanged IDs have equal `caseInputSha256`, and the 3 corrected
  IDs differ as expected. The coordinator verified `meta.sourceIdentity.qaImplementationSha256` in both artifacts: `4d0ccc8d4b37023b3804449d295b25441a9391f19bb9916b9db7dc80b194d83a`.

## Verified losses (3)

| ID | Type | B1 | C1 |
|---|---|---|---|
| q-soroban-av-passkeys-talk | keyFact K1 | "AI-generated summaries … not verbatim transcripts" | absent |
| q-defi-aquarius-what-is (corrected) | keyFact K3 | "boosts a holder's liquidity-reward multiplier (up to 2.5x…)" | absent |
| q-eco-stablecoins-on-stellar | new wrong claim | no count error | "spanning 10 fiat pegs"; "USDZ … already listed above" |

### AV passkeys
- **K0:** present in both arms. The transcript uses `lumenloop.find_av_passages`, and the answer does not need
  to name the operation. **Correction:** v1 wrongly marked K0 as a shared miss.
- **K2:** present in both arms (opaque `start_offset`). **K1:** present in B1, absent in C1.
- **Evidence:** the C1 execute result has only `summary`/`long_summary` rows. The operation description in
  `av-live-recheck.json` says "Transcript text itself is never returned".
- **Cause:** the agent's answer left out a limit that the host describes. This review does not establish a D3
  effect either way, because different queries do not prove that internal rankings stayed the same.

### Aquarius (corrected golden)
- **Transcript:** C1 has 0 mentions of "boost". B1 reached the aqua governance proposal "ICE Stage 3 - liquidity
  rewards boost formula".
- **Live evidence (class A, read 2026-09-17):**
  - `https://docs.aqua.network/aqua-and-ice/ice-boosts-how-to-maximize-lp-rewards.md`: "Liquidity providers who
    hold ICE receive a **reward boost** on their AQUA rewards, up to x2.5."
  - `https://docs.aqua.network/aqua-and-ice/ice-tokens-locking-aqua-and-getting-benefits.md`: "non-transferable
    ICE tokens that carry liquidity-voting power, governance-voting power, and a reward boost for liquidity
    providers".
  - Local copies: `golden-corrections/evidence/aq_aqua-and-ice_*.md`.
- **Shared defect:** both arms merge the ICE, upvoteICE, and governICE roles (avoid[1] in both). This is not new.
- **Cause:** C1 did not reach a source with the boost fact. This review does not establish whether query
  variance or the D3 ranking caused it.

### Stablecoins
- **Live evidence:**
  - `live-stablecoins-2026-09-17.json`: `https://stellarlight.xyz/api/stablecoins`, generatedAt
    2026-09-17T03:28:52.984Z, dataAsOf 2026-09-16T21:26:19.752Z. Counts: tracked 41; byBasis live 40,
    curated-static 1, unmeasured 0. There are **16 pegs:** AED, ARS, AUD, BRL, CAD, CHF, CLP, EUR, GBP, JPY, MXN,
    NGN, PEN, SGD, USD, ZAR.
  - Root `stablecoins-root-recheck.json`: the `scout.getStablecoins` compact projection at 03:35Z returns 41 rows
    and 16 pegs, dataAsOf 21:26. Aggregation inside the sandbox returns the full, correct count.
- **Transcript:**
  - Both arms' first execute returned a truncated result (25,778 chars, artifact pointer, 12 pegs visible).
  - B1 execute 2 read the same artifact with `codemode.artifact.read` and used `full.stablecoins`. The host
    envelope guard stopped it: "`.stablecoins` is on the data payload, not the envelope — use r.data.stablecoins".
  - B1 execute 3 read the same artifact and used `full.data.stablecoins`. It succeeded with count 41 and all
    16 pegs. B1 made no new upstream call.
  - C1 ran one execute only and did not read the artifact. It stated 10 pegs, which matches neither the visible
    data (12) nor the live data (16).
  - USDZ appears once in the C1 answer, so "already listed above" is false.
- **Cause:** truncation is an observed boundary. Host recovery works: B1 recovered all rows from the artifact
  after it fixed the envelope access. The wrong count is C1 agent behavior. This review establishes no host
  defect. v1 wrongly proposed an own-repo truncation fix. v2 wrongly described B1 as making a narrower call
  after a failed artifact read.
- **Shared imprecision:** both arms call all 41 rows "live". The registry has 40 live rows and 1 curated-static row.

## M0 overlays (kept separate; not the loss decision)

| ID | M0-B1 (`02-24-27`, nonIdentical, $0.6172996) | M0-C1 (`03-28-28`, revision c6968e74, $0.5692046, 9 calls) |
|---|---|---|
| Aquarius | wrong/correct, avoid[1]; K3 not listed as missing | wrong/correct, avoid[1], 3/3; K3 boost scope listed as missing |
| Soroswap | wrong/correct, avoid[2]; no wrongClaims | wrong, core incorrect 2/3, avoid[2] 3/3; wrongClaims: aggregator routes via SDEX, CAG5 address |
| LOBSTR | correct/correct | correct/correct, 3/3 |

- **Aquarius:** the M0-C1 panel names the same K3 omission. This result is symmetric with M0-B1.
- **Soroswap:** B1 also has both M0-C1 wrong claims. B1 says "even the classic Stellar order-book DEX (SDEX)" and
  names the "Aggregator router contract: CAG5…". The difference is in what the judges listed, not a new C1 claim.
  The row stays monitor-only.
- **LOBSTR:** the original reviewer judged B1's "$267,463 reconciled round-award total" a basis error. The
  M0-B1 panel did not flag it. Both views are kept. C1 has no loss in either view.

## Other rows

| ID | Verdict | Note |
|---|---|---|
| q-soroban-oz-upgradeable-macro | monitor-only | Same skill read and the same retired API in both arms. The judge flipped the core grade. |
| q-defi-soroswap-what-is | monitor-only | Both arms mislabel CAG5 and conflate SDEX with the aggregator. C1 attributes "first" better. |
| q-defi-blend-what-is | monitor-only | K4 absent in both. The C1 Liquidity Award label matches Scout only. |
| q-aas-issuer-fees-supply-cap-freeze | no-difference | C1 better: it adds K4. |
| q-eco-lobstr-wallet | no-difference | C1 better in the reviewer view; equal in the overlay view. |
| q-asset-rwa-tokenized-freshness | no-difference | New C1 claims match the tool output. |
| q-gap-rpc-horizon-unindexed-reference | no-difference | |
| q-org-sdf-board-directors | no-difference | |
| q-scf-hackathon-compare-live | no-difference | Identical data. |
| q-protocol-parallel-execution | no-difference | K1 absent in both; V1 in both. |
| q-rwa-projects-tokenizing-stellar | no-difference | K2 absent in both. |
| q-tool-soroban-auth-audit-live | no-difference | Both arms call the Critical "still open"; K1–K3 absent in both. Cause: agent projection or query failure (see below). |
| q-tw-escrow-api-auth-custody | no-difference | K0–K3 in both; both claim `x-api-key` exclusivity from the pinned skill. |

## Root-cause and upstream classes

- **Agent behavior (counts as loss):** a disclosed output limit was omitted (AV). A source was not reached
  (Aquarius). The agent did not recover from truncation and invented a count (stablecoins).
- **Not established:** the D3 ranking mechanism for any loss, and any host defect.
- **Upstream, shared by both arms:**
  - Scout CAG5 onchain label (sls-085 draft, outside the repo).
  - Old Soroswap docs (cs-002).
  - Scout Aquarius description merges the ICE roles (monitor).
  - LumenLoop `awarded_total` shows the paid amount (ll-013).
  - The OpenZeppelin skill has a retired API.
  - The Trustless Work skill wording about auth exclusivity.
- **Auth audit, agent projection or query failure in both arms (corrected in v3):**
  - **Rejected upstream gap:** `upstream-two-candidates-review.md` shows that Scout `searchResearch`
    returns all four facts:
    - the V2 "Why Invalid" ruling (report 28 chunk 7)
    - the V-SOR-APP-VUL-003 appendix entry (report 42 chunk 16)
    - "Critical-Severity Issues 0" (report 28 chunk 1)
    - the V2.1 relocation (report 42 chunk 0)
  - **What the agents did:** both arms cut chunk text in their execute code. B1 used `.slice(0,500)` and
    `.slice(0,1500)`. C1 used `.slice(0,600)` and `.slice(0,1200)`.
  - **Result:** no query targeted the summary table. No execute result in either arm contains "Why Invalid",
    "Critical-Severity Issues 0", or "V2.1".
  - **Upstream status:** no Scout finding. The exact-ID path stays covered by resolved `sls-074` (#1031).
  - **Own-repo follow-up:** agent guidance to read full audit rows and summary tables before cutting text.
  - **v2 judgment (superseded):** "possible Scout `searchResearch` gap for the Veridise ruling".

## Source verification gaps

- **Aquarius:** this lane did not re-verify the SDEX half of K3. The loss rests on the LP boost scope, and the only
  source is class A docs.
- **Blend:** the "Liquidity Award $50,000 Q1 2024" claim was not checked on communityfund.stellar.org.
- **RWA freshness:** the DTCC H1 2027 claim and the Spiko tvlUSD 1,653,789,314 figure were checked against tool
  output only.
- **Soroswap:** the C1 claim that LumAgg and StellarBroker came after Soroswap is not verified.
- **OZ:** this lane did not re-check the retired API against the current OZ stellar-contracts.

## Coordinator reconciliation

The runtime candidate was rejected before further collection. All three losses remain recorded without a causal routing claim.
The existing artifact recovery worked after the baseline agent corrected its envelope access. No host repair follows from this trace.
Scout contract labeling is now `sls-085`; Aquarius governance wording is now independently verified as `sls-086`.
The earlier monitor-only Aquarius status is superseded by its exact source comparison and independent review.
OZ and Trustless Work recurrences map to existing `sk-022` and `sk-025`. No duplicate issue is needed.
The separate source audit rejected the Veridise gap; the current corpus contains all required facts.
