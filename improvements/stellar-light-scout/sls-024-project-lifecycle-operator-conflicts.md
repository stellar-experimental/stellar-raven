---
id: sls-024
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - service-owner verification issue source backlink added 2026-07-14: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971116711
  - direct Scout project queries and operator-site/repository re-checks for Slender, Laina, K2 Lend, and OrbitCDP on 2026-07-10
  - 2026-07-11 live `searchProjects({q:"streaming recurring payments"})` response: all 19 returned projects were `Live`; Fluxity was `Live` plus `Unverified` with null `statusAsOf`, `statusBasis`, and `statusSourceUrl`, and empty `supportedNetworks`
  - additional direct recurrences: xBull was `Live` while its Android store URL returned 404; Centaurus was `Live` plus `Unverified` while linked repositories had no activity after 2021 and no current primary deployment evidence was located
  - consumer-side mitigation in the downstream consumer (kalepail/stellar-raven commit bb25276) improved search-tier selection but cannot supply missing lifecycle provenance or deployment scope
  - upstream issue filed 2026-07-12: https://github.com/Stellar-Light/stellar-scout/issues/9
  - correct service-owner record confirmed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/494 documents the additive lifecycle-provenance fields and their zero-migration legacy-row boundary; the residual population gap remains tracked by the source issue above
  - 2026-07-14 live Fluxity residual follow-up: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971408499
  - partial-fix verification posted and read back 2026-07-15: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4982290048
  - 2026-08-10 Scout OpenAPI 1.8.40 adds Repo activityState and activitySignals as a partial upstream response, but does not populate project statusBasis or statusSourceUrl; its activity semantics say dormant is a known commit older than 180 days (an observation, not a death verdict) and unknown is no commit date held
recurrences:
  - date: 2026-07-15
    evidence: Scout 1.7.26 gives Fluxity and Freighter dated source-inherited statusBasis values, but statusSourceUrl remains null and supportedNetworks remains empty
  - date: 2026-08-10
    evidence: OpenAPI 1.8.40 adds Repo activityState/activitySignals, but this is only a partial response: it does not supply the requested project statusBasis/statusSourceUrl or deployment scope, and explicitly defines dormant/unknown as non-defunct observations rather than lifecycle death verdicts
  - date: 2026-08-11
    evidence: Production API 1.8.41 returns Fluxity as Live with statusBasis source-inherited, but statusSourceUrl remains null and supportedNetworks remains empty; issue #494 is open and issue stellar-scout#9 is open without comments
  - date: 2026-08-19
    evidence: Production API 1.8.73 returns OrbitCDP as Inactive with statusAsOf 2026-03-10T15:16:46.523Z and statusBasis unverified, but statusSourceUrl remains null, supportedNetworks and products remain empty, and deployments and oracleDeployments remain null; this is a partial improvement, not resolution
  - date: 2026-08-25
    evidence: Production API 1.8.87 fixed the nightly restamp and populated statusAsOf, statusBasis, and statusConfidence across all 583 rows reachable through the five documented status filters; however, 86 rows still lacked statusSourceUrl, 241 lacked supportedNetworks/networksBasis, and 582 lacked product deployment records, while /api/status reported 1025 total projects, so provenance coverage and testnet/mainnet product scope remain incomplete
  - date: 2026-08-28
    evidence: Production API 1.9.1 gives Slender, Laina, K2 Lend, and OrbitCDP dated status, statusBasis, and statusSourceUrl. K2 Lend still has null supportedNetworks, and all four have null products and deployments. Issue stellar-scout#9 and service-owner issue #494 are closed as completed, but the deployment-qualifier part of the finding still reproduces.
  - date: 2026-09-08
    evidence: Production API 1.9.48 gives the five named fixtures dated lifecycle provenance and a separate deployment object. A seven-category scan covered all 981 searchable rows. Five rows retain human-verified or source-inherited statusBasis with null statusSourceUrl: Scam Flagging System, Stellar Pulse, Pactta, The Blue Marble, and ChainCred. MyDataCoin correctly pairs unverified with a null source. All 887 unknown deployments consistently use null evidence fields, so those fields are explicit unknown semantics rather than defects. The duplicate QCAD and GLOUSD rows also retain unknown deployment and no canonical product link even though the RWA registry proves QCAD under stablecorp and USDGLO under glo-dollar. The separate undocumented package-release statusBasis defect is sls-084. Population review: .agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md.
  - date: 2026-09-29
    evidence: Scout 1.9.54 now gives all 1004 searchable rows a status date, basis, and deployment qualifier. Every non-unverified status has a source. All 906 unknown deployments consistently retain null evidence fields. Of 98 positive deployment qualifiers, 55 lack deployment.sourceUrl; 35 of the 98 positive deployments have null supportedNetworks and null networksBasis. Rendergate and CleverCon claim mainnet while their status sources identify testnet. This proves incomplete positive-claim provenance, not false mainnet claims. Full scan and independent review are in .agents/rounds/2026-09-29-truth-maintenance/sls-024-population.json and docs-independent-review.md.
---

## Current state

The 2026-09-29 scan confirms that the original lifecycle-source omissions are fixed.
The deployment evidence remains incomplete for positive network claims.
Unknown deployment qualifiers are explicit unknowns and do not count as defects.
This partial fix does not meet the original deployment-provenance recommendation.

## Finding

At discovery, Scout lifecycle labels lacked populated provenance and deployment qualifiers.
The schema exposes `statusAsOf`, `statusBasis`, `statusSourceUrl`, and
`supportedNetworks`, but project records left all of them null or
empty. A consumer therefore could not tell whether `Live` means an active entity,
an operator announcement, an accessible product surface, or verified mainnet
deployment.

The label is not necessarily wrong when it conflicts with an operator surface:
an operator page can be stale, an app can remain reachable after abandonment,
and a project can be active without a mainnet product. The missing qualifiers
make those distinct states indistinguishable.

Scout 1.8.40's Repo `activityState` and `activitySignals` are a useful partial
response, but they cannot replace project lifecycle provenance: `dormant` is a
known commit older than 180 days and `unknown` has no commit date, neither a
defunct verdict. They provide neither a project `statusBasis` nor a
`statusSourceUrl`, nor a deployment qualifier.

## Evidence

On 2026-07-10, direct Scout queries and independent operator-site/repository
checks found four lifecycle conflicts: Scout marked Slender Inactive, Laina
Live, K2 Lend Live, and OrbitCDP Inactive, while the corresponding operator
surfaces respectively showed an accessible app, early/testnet development, a
coming-soon product, and a still-live description. These observations are not
competing universal authorities; they show why a dated basis and deployment
scope are necessary.

The gap was prevalent in the discovery query result, not only in edge examples. On
2026-07-11, `searchProjects({ q: "streaming recurring payments" })` returned
19 projects and labeled all 19 `Live` (19/19, 100%). Fluxity was `Live` and
`Unverified`, while `statusAsOf`, `statusBasis`, and `statusSourceUrl` were all
null and `supportedNetworks` was empty. Thus the fields are schema-present but
not populated where they are needed to qualify the label.

Direct recurrences show the same distinction across product types: xBull
remained `Live` while its Android store URL returned 404, and Centaurus remained
`Live` plus `Unverified` while its linked repositories had no activity after
2021 and no current primary deployment evidence was located. Downstream
consumers have repeatedly had to add their own caveat rather than infer
deployment or audit maturity from the label.

Consumer-side mitigation in the downstream consumer (kalepail/stellar-raven
commit `bb25276`) improves search-tier selection, but it cannot provide the
missing lifecycle provenance or deployment scope. The durable fix belongs in
the project records.

## Recommendation

Complete the provenance for positive deployment claims.
For each known network qualifier, expose its deployment source and the date of that evidence.
Keep project lifecycle evidence separate from product deployment evidence.
A testnet status source cannot by itself verify a mainnet deployment qualifier.
Keep the project network list consistent with a verified positive deployment, or explain its separate scope.
Null network lists remain unknown and do not prove that a network is unsupported.

Retain the explicit unknown deployment state when no evidence establishes a network.
Null source, basis, and date fields are valid for that unknown state.
Do not infer that a product is absent from null product fields.

The current scan confirms the original lifecycle date, basis, and source requests are fulfilled.
Keep those populated fields and the original fixtures as regression checks.
Add checks for positive deployment qualifiers without sources and network claims with only testnet evidence.
