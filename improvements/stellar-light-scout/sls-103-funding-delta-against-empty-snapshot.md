---
id: sls-103
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "GET /api/analyze funding delta treats an empty snapshot as a valid comparison"
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
  - "Dedupe 2026-11-02: resolved sls-013 (2026-07-14) fixed the unstable funding dimension, and closed Stellar-Light/stellarlight issue 520 added snapshot delta provenance. This defect concerns the baseline inside that mechanism. GitHub search repo:Stellar-Light/stellarlight previousSnapshot returned only closed issue 520."
  - "Golden consumer: eval/qa/corpus/battery case q-scf-total-distributed records the empty previous snapshot."
  - "2026-11-02T22:38Z recheck: curl -sS --max-time 50 'https://stellarlight.xyz/api/analyze?dimension=funding' returned HTTP 200. Current set has 582 projects and projectSetHash=b44bd87c48cd5ef9. previousSnapshot has projectSetHash=e3b0c44298fc1c14, scfAwardedProjects=0, scfTotalDistributedUSD=0, and computedAt=2026-10-24T13:59:01.772Z. snapshotAsOf=2026-10-24T13:59:04.410Z. snapshotDelta has addedCount=582, removedCount=0, totalUSDDelta=58585451.99; deltaUnavailable=null."
  - "2026-11-02 calibration: the Python hashlib command in Evidence printed e3b0c44298fc1c14. The standard-library snippet ran successfully. The two stored timestamps differ by 2.638 seconds. They date the observed records, not the first defective release."
  - "2026-11-02 adjacent-source check: analyze/route.ts catches a failed projects read and continues with projects=[]. The funding branch can then persist that empty set. The snapshot selection accepts a hash without checking baseline completeness. This code supports a failure mechanism but does not prove the historical request failed. The response already cautions against inferring causes from headline drift."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for previousSnapshot and snapshotDelta, across all states. Only closed issue 520 and merged PR 530 appeared. They introduce comparison provenance and do not address an empty baseline. rg over improvements/ and improvements/resolved.json found resolved sls-013 and sls-044, with different defects. Intake resolves to Stellar-Light/stellarlight without an override."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1914
---

## Finding

`GET /api/analyze?dimension=funding` treats an empty stored snapshot as a valid baseline for its funding delta.
`previousSnapshot` has `projectSetHash: "e3b0c44298fc1c14"`, 0 projects, and 0 USD.
That hash prefix is SHA-256 of empty input.
`snapshotDelta` therefore lists all 582 projects as added and reports `totalUSDDelta: 58585451.99`.
`deltaUnavailable` is null.
This baseline cannot explain changes between valid non-empty awarded sets.

## Evidence

Read-only reproduction:

```sh
curl -sS --max-time 50 'https://stellarlight.xyz/api/analyze?dimension=funding'
python3 -c "import hashlib; print(hashlib.sha256(b'').hexdigest()[:16])"
```

The HTTP request returned 200 on 2026-11-02.
The Python command printed `e3b0c44298fc1c14`.
The empty snapshot has `computedAt: 2026-10-24T13:59:01.772Z`.
The current set has `snapshotAsOf: 2026-10-24T13:59:04.410Z`, 2.638 seconds later.

The current route continues with an empty project array after a failed project read.
Its funding branch can persist that array as a snapshot.
This path supports a possible cause; the stored timestamps do not prove a historical read failure.
The existing `deltaBasis` already warns against inferring causes from headline changes.

## Recommendation

Skip incomplete or unexplained empty snapshots when selecting `previousSnapshot`.
Return `deltaUnavailable` when no valid differing baseline remains.
Prevent snapshot writes after a failed or incomplete project read.
Quarantine the existing empty snapshot after checking its origin.
