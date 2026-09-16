# Stellar Light pin impact review

The coordinator read both changed bodies on 2026-09-16.
This review does not accept the pin.

## Source identity

The accepted commit is `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5`.
The candidate commit is `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
The coordinator fetched both versions directly from `raw.githubusercontent.com`.
All four Git blob hashes match their respective manifests.

| File | Old blob | New blob |
| --- | --- | --- |
| `SKILL.md` | `54f214d228b665bd1f0579ed79dd39226dd9621e` | `de459e784e9e927f42662aa53ab22c8dedab04b7` |
| `references/api-reference.md` | `14f9c9c817ff853089e42333e35a7d60ca7a258a` | `5035cc98f1e0a7339ab9837e2dee19e7da0616cb` |

## Changed behavior

The skill distinguishes an open RFP brief from an open SCF submission window.
It changes the repository-score explanation from funding authority to code evidence and corroboration.
The reference distinguishes missing hackathon submission counts from zero.
It adds repository-resolution fields, the `asset-issuer` partner type, and the `accepting=0` filter.
It adds the `GET /api/rwa` operation and its product-state distinctions.

## Dependencies

The accepted Scout 1.9.1 schema does not permit `type=asset-issuer` or `accepting=0`.
The candidate Scout 1.9.52 schema permits both.
The accepted catalog has no RWA operation.
RWA remains an unaccepted exposure proposal while the full routing checks fail.

The added repository paragraph names `/api/repos` as a stored-row collection.
Neither compared OpenAPI document exposes that path.
The final source review must reconcile that reference with Raven's exposed surface.
The existing runtime scrub filters explicit excluded paths; this path is absent from that exclusion set.

These dependencies prevent classifying this pin as an independent metadata update.

## Golden impact

`q-scf-open-rfps-live` already requires the SCF submission-window distinction.
`q-scf-hackathon-compare-live` already distinguishes null from zero.
This review found no need to weaken either golden.
It does not renew their factual verification dates.

## Evidence

The temporary evidence directory is `/tmp/raven-execution-2026-09-16/light-pin-review/`.
It contains the four bodies, complete unified diffs, and `sources.json` with URLs and digests.
The source hashes above make this review reproducible without that temporary directory.
The coordinator sent the schema and exposure dependencies to the drift author.
The final source acceptance still needs an independent review and the applicable gates.
