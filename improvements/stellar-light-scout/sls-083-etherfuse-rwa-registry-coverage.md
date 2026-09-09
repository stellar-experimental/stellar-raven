---
id: sls-083
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-09-08
upstreamTitle: The RWA registry omits four current Etherfuse assets and does not mark project coverage partial
evidence:
  - Maintainer theboycoder supplied the deployed correction and clarified trustlines versus supply in https://github.com/stellar-experimental/stellar-raven/issues/146. At 2026-09-09T18:38:49Z root independently confirmed CETESZ has 16 authorized trustlines and zero balances. Trustlines alone do not prove issuance. The Circle control reports complete=false and issuersUnreconciled=1, so partial coverage remains explicit.
  - 2026-09-09T18:27:20Z root live RWA recheck returned nine Etherfuse assets, including MEX, CETESZ, GILTS, and MEXe. The project reports productsCoverage declared=9, tracked=9, served=8, complete=true. CETESZ is deployed-no-supply and stays outside the served products. The issuer TOML still declares those same nine assets; SHA-256 f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe. The original upstream trigger is fixed; Raven catalog acceptance remains separate.
  - .agents/rounds/2026-09-09-upstream-sweep-terra.md independently repeats the registry and project coverage checks.
  - https://github.com/Stellar-Light/stellarlight/pull/1532
  - 2026-09-08 fresh checks reproduced five Scout assets and nine issuer-declared assets. Scout RWA SHA-256 is 3fb7e278ad5c7452ec15e061c2983e0384e3492fcf945874b70243acdf519def. Project search SHA-256 is 0c41ff0039823cf56f214fb657520fd848fa037935a3d6fcdc3a3ba51ed1c031. `stellar.toml` SHA-256 is f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe. Horizon SHA-256 is 0b7fabe1bcfb10fc5b33a9154ecaa5639b39955ee85dd99901e9d7c0f409ca1a and confirms authorized trustlines for all nine declared assets.
  - 2026-09-08T17:32:33.197Z live `GET /api/projects/search?q=etherfuse&limit=20` returned five Etherfuse products with no completeness qualifier; response SHA-256 85667958f041f49756dc586f568059d974ef265167a83f343796c2e95e26b4c9.
  - 2026-09-08 live `GET /api/rwa?project=etherfuse&limit=100` returned the same five assets: USTRY, CETES, TESOURO, EUROB, and KTB.
  - 2026-09-08 https://etherfuse.com/.well-known/stellar.toml declares nine currencies for issuer GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC; response SHA-256 f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe.
  - 2026-09-08 `GET https://horizon.stellar.org/assets?asset_issuer=GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC&limit=200` returned 11 assets. All nine TOML-declared assets have authorized trustlines; undeclared USTR and GBPx are the other two. Response SHA-256 437383b0e96c37a81587ee0c845198f0a08eac528462fe14ade636f6bb7bf161.
  - independent residual review: .agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md
  - upstream issue filed 2026-09-09: https://github.com/Stellar-Light/stellarlight/issues/1531
---

## Finding

Scout's RWA registry and the Etherfuse project row expose five Etherfuse assets.
The current issuer `stellar.toml` declares nine assets for the same issuer.
Horizon returns all nine declared code-and-issuer pairs with authorized trustlines.

The four omitted assets are `MEX`, `CETESZ`, `GILTS`, and `MEXe`.
The non-empty `products` list has no field that says its coverage is partial.
A consumer can therefore mistake five verified products for the issuer's complete current set.

This residual is narrower than fixed-upstream finding `sls-023`.
That finding established the product and deployment model across verified RWA issuers.
This finding concerns completeness within one issuer that the registry already tracks.

## Evidence

The original trigger no longer reproduces on the live service.
The registry contains all nine issuer-declared assets and the project declares its coverage explicitly.
The difference between nine tracked assets and eight products is the zero-supply `CETESZ` asset.

The following observations describe the previous defect.

The live checks used one exact issuer:

    GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC

The operator file declares `USTRY`, `CETES`, `TESOURO`, `MEX`, `CETESZ`, `EUROB`, `KTB`, `GILTS`, and `MEXe`.
The Scout surfaces return `USTRY`, `CETES`, `TESOURO`, `EUROB`, and `KTB`.
Horizon independently confirms authorized trustlines for the four omitted assets.
Trustlines do not prove issuance: the current `CETESZ` balances are zero.
It also returns undeclared `USTR` and `GBPx`, so the TOML-declared set is the correct comparison set.

The RWA registry correctly says that absence means untracked.
The project row does not carry that scope note beside its non-empty `products` list.

## Recommendation

Reconcile every tracked issuer against its current issuer-declared currencies.
Add verified missing assets when their exact code-and-issuer pairs pass the registry evidence rules.
Also expose a `productsCoverage` field when a project list can remain partial.
The field should state the source, observation date, checked count, returned count, and completeness state.
