---
id: sls-103
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Funding snapshotDelta compares against an empty persisted snapshot and reports every project as added"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/analyze?dimension=funding
  expect:
    status: 200
    contains:
      - "e3b0c44298fc1c14"
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/analyze?dimension=funding returned scfAwardedProjects 582, scfTotalDistributedUSD 58585451.99, projectSetHash b44bd87c48cd5ef9, snapshotAsOf 2026-10-24T13:59:04.410Z, computedAt 2026-11-02T16:48:39.897Z, deltaUnavailable null. previousSnapshot is {projectSetHash 'e3b0c44298fc1c14', computedAt 2026-10-24T13:59:01.772Z, scfAwardedProjects 0, scfTotalDistributedUSD 0}. snapshotDelta reports addedCount 582, removedCount 0, totalUSDDelta 58585451.99. Response sha256 97b4d3f4cdb92bac9a8e37a90cab57b4b54eca30c03c83802ead921e05f634c1."
  - "The prefix e3b0c44298fc1c14 is the first 16 hex characters of SHA-256 over empty input (python hashlib.sha256(b'').hexdigest()). The previous snapshot was persisted from an empty project set 2.6 seconds before the current one."
  - "OpenAPI 1.9.116 says previousSnapshot is 'The most recent persisted snapshot with a DIFFERENT project set' and that deltaUnavailable is 'Non-null when snapshotDelta cannot be served, stating WHY (no differing prior snapshot recorded yet, or snapshot store unavailable)'."
  - "Dedupe 2026-11-02: resolved sls-013 (2026-07-14) fixed the unstable funding dimension, and closed Stellar-Light/stellarlight issue 520 added snapshot delta provenance. This defect is a new failure inside that mechanism, so it takes a new id. GitHub search repo:Stellar-Light/stellarlight previousSnapshot returned only closed issue 520."
  - "Golden consumer: eval/qa/corpus/battery case q-scf-total-distributed records the empty previous snapshot."
---

## Finding

The funding analysis compares the current awarded set with an empty snapshot.
`previousSnapshot` has `projectSetHash: "e3b0c44298fc1c14"`, 0 projects, and 0 USD.
That hash prefix is SHA-256 of empty input.
As a result, `snapshotDelta` lists all 582 projects as added and reports a delta of 58585451.99 USD.
`deltaUnavailable` is null, so the response presents the delta as real.
An agent can report that SCF funding grew by 58.6 million USD in one step.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/analyze?dimension=funding'
python3 -c "import hashlib; print(hashlib.sha256(b'').hexdigest()[:16])"
```

The empty snapshot has `computedAt: 2026-10-24T13:59:01.772Z`.
The current set was first observed at `2026-10-24T13:59:04.410Z`, 2.6 seconds later.
This pattern fits a failed or empty read that the store persisted as a real snapshot.

## Recommendation

Do not persist a snapshot whose project set is empty.
Skip empty snapshots when choosing `previousSnapshot`.
When no valid differing snapshot exists, return `deltaUnavailable` with a reason.
Delete the stored empty snapshot so the next delta uses the last valid set.
