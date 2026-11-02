---
id: sls-114
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "explainRepo lists fixture contract interfaces for a platform repo without their source paths"
evidence:
  - "Successor of sls-088, which Stellar-Light/stellarlight PR 1806 fixed (Horizon now returns kind platform and isDeployableContract false). sls-088 also asked to keep the fixture contracts as source evidence with their paths; the sls-088 retirement review (Codex gpt-6.1-sol high, 2026-11-02, .agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md section A5) found that part not done."
  - "2026-11-02T22:26:43Z GET https://stellarlight.xyz/api/repos/explain?repo=stellar/stellar-horizon&q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value? (HTTP 200, OpenAPI 1.9.116, response sha256 7210f4fa611c69d8ec82d13f585621008bf20e9b32645ed72a20c0969f30523a): repoMeta.kind platform; codeVerified.contractInterface lists six entries, including 'IncrementContract.increment() -> u32' and 'Contract.bulk_transfer(sender: Address, contract: Address, recipients: Vec<Address>, amounts: Vec<i128>)'. No entry carries a path; sources has only repoUrl and DeepWiki links."
  - "2026-11-02 gh api repos/stellar/stellar-horizon/git/trees/597544b60c20f8536d532d32abca8462394874f3?recursive=1 (the response's scannedRef): every Rust contract is under internal/integration/contracts/, for example internal/integration/contracts/increment/src/lib.rs, add_u64/src/lib.rs, bulk/src/lib.rs, constructor/src/lib.rs, and store/src/lib.rs (the source of Contract.set and Contract.remove)."
  - "Dedupe 2026-11-02: Stellar-Light/stellarlight issue 1739 (closed) and PR 1806 (merged) fixed the product classification. The sls-088 recommendation also asked for interface source paths, and that part remains. No other active or resolved Raven record covers interface source paths."
---

## Finding

For `stellar/stellar-horizon`, `GET /api/repos/explain` returns `repoMeta.kind: platform`, which is correct.
Its `codeVerified.contractInterface` still lists six contract interfaces, such as `IncrementContract.increment() -> u32`.
These are integration-test fixtures under `internal/integration/contracts/`.
The response gives no source path for any of them.
A reader can take a fixture interface for a contract that the repository ships.

## Evidence

```sh
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?' \
  | jq '{kind: .repoMeta.kind, contractInterface: .codeVerified.contractInterface, sources}'
```

At the returned `scannedRef` `597544b60c20f8536d532d32abca8462394874f3`, the six interfaces come from five files under `internal/integration/contracts/`:

| Returned signature | Source file |
| --- | --- |
| `IncrementContract.increment()` | `increment/src/lib.rs` |
| `Contract.add(...)` | `add_u64/src/lib.rs` |
| `Contract.bulk_transfer(...)` | `bulk/src/lib.rs` |
| `Contract.__constructor(...)` | `constructor/src/lib.rs` |
| `Contract.set(...)` | `store/src/lib.rs` |
| `Contract.remove(...)` | `store/src/lib.rs` |

## Recommendation

Give each `contractInterface` entry its source path, or mark entries from fixture, test, or example folders as fixtures.
