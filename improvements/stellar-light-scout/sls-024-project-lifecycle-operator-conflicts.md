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
---

## Finding

Scout lifecycle labels lack populated provenance and deployment qualifiers.
The schema exposes `statusAsOf`, `statusBasis`, `statusSourceUrl`, and
`supportedNetworks`, but current project records can leave all of them null or
empty. A consumer therefore cannot tell whether `Live` means an active entity,
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

The gap is prevalent in a current query result, not only in edge examples. On
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

Populate the existing nullable qualifier fields for each project record; do not
only expose them in the schema:

- `statusAsOf`, `statusBasis`, and `statusSourceUrl` for every retained
  lifecycle label;
- `supportedNetworks` when deployment scope is known, with an explicit unknown
  basis when it is not;
- a status basis that distinguishes operator announcement, site liveness,
  on-chain activity, human verification, and inherited/unverified data;
- separate entity/project lifecycle from testnet and mainnet product deployment.

When the source is unknown, retain the record but mark that fact explicitly
instead of leaving the qualifier fields null. A `Live` label without a populated
basis and scope must not read as proof of mainnet deployment or audit maturity.

Add regression fixtures for Slender, Laina, K2 Lend, and OrbitCDP. A consumer
should be able to tell whether each record means organization active,
development active, testnet available, mainnet live, paused, or inactive.
For listed integrations, expose whether the relationship is current,
historical, provider-declared, or independently code/deployment verified.
For apps, track per-platform store URL/status and roadmap-versus-shipped feature
state with independent timestamps.
