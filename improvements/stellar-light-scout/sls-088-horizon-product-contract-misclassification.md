---
id: sls-088
service: stellar-light-scout
status: reported-upstream
discovered: 2026-09-29
upstreamTitle: Horizon API repository is marked as a deployable Soroban contract product
evidence:
  - 2026-09-29 free explainRepo response for stellar/stellar-horizon at 19:32:18.708Z returned repoMeta.kind contract, kindBasis isDeployableContract, and codeVerified.isDeployableContract true. The scannedRef is 430a28e79b3b43c213840e45523519ca11251c0a. Evidence is .agents/rounds/2026-09-29-truth-maintenance/horizon-monitor.json.
  - https://github.com/stellar/stellar-horizon/blob/430a28e79b3b43c213840e45523519ca11251c0a/README.md
  - The README identifies Horizon as the client-facing API server between Stellar Core and applications.
  - A recursive tree read at that scannedRef places all Rust Cargo.toml and .rs files under internal/integration/contracts. The IncrementContract, bulk_transfer, and constructor symbols returned by Scout belong to these integration contracts.
  - Live OpenAPI 1.9.54 defines Repo.codeVerified.isDeployableContract as the repository product, not vendored runtime or fixture crates. Its description explicitly excludes platform, SDK, and tooling repositories with such crates.
  - Dedupe 2026-09-29 found no Horizon contract-classification issue. Retired sls-046 covered the same classification error for stellar/stellar-core and remains in improvements/resolved.json.
  - upstream issue filed 2026-09-29: https://github.com/Stellar-Light/stellarlight/issues/1739
---

## Finding

Scout marks the Horizon API server repository as a deployable Soroban contract product.
The response returns `codeVerified.isDeployableContract: true` and `repoMeta.kind: "contract"`.
Horizon is an API server.
Its Soroban contracts are integration fixtures under `internal/integration/contracts`.

The schema defines the flag as the repository's product.
It explicitly excludes infrastructure repositories that contain runtime or fixture contract crates.
The Horizon response does not follow that distinction.
An agent can treat an API server as a deployable contract implementation.

## Evidence

Read-only reproduction:

```sh
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
```

Inspect `repoMeta.kind`, `repoMeta.kindBasis`, and `codeVerified.isDeployableContract`.
Compare the repository README and tree at `codeVerified.scannedRef` with the flag's OpenAPI definition.

At `430a28e79b3b43c213840e45523519ca11251c0a`, every Rust contract source is an integration fixture.
The repository README identifies the product as the Horizon API server.
The live OpenAPI defines `isDeployableContract` as the repository product.

This record covers one verified repository.
It does not claim a population-wide classification error.
The earlier `sls-046` repair for `stellar/stellar-core` remains a separate resolved record.

## Recommendation

Set Horizon’s product contract flag to false and classify its API-server role accurately.
The current kind rule falls through to `application` when `projectSlug` is present.
Do not replace the false contract label with a false application-product label.
Use a kind rule for service infrastructure, with any required schema change.
Preserve the observed fixture contracts as source evidence with their paths.
Apply the existing infrastructure distinction to serving and scan-time classification.
Add a regression fixture for Horizon's integration contracts and retain a genuine contract-product positive control.
