# Source integration evidence

Date: 2026-09-16. Status: source review accepted; routing and release gates remain open.

The source snapshot contains Scout 1.9.52 and 651 Stellar Docs titles.
The only added Docs page is `/docs/data/analytics/public-dashboards`.
The Light skill advances to `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
The other four skill source selections stay unchanged.
The 43-entry public skill directory changes only its fetch timestamp.

`ecosystem-skills/update.sh` generated the pin, index, and directory files.
The parent read both changed skill body diffs.
`node scripts/check-mirrors.mjs --fetch` verified all 66 pinned files upstream.
`node scripts/check-pin-review.mjs --base origin/main` passed.
A live Scout refresh kept the exact reviewed inventory snapshot.
Its SHA-256 is `0e99b00af91f2336869af8c8a28be4dbd1317cf24755ac445b95ff43997210c1`.

The catalog still exposes 282 entries and 30 Scout operations.
`GET /api/rwa` remains excluded.
The parent independently reproduced both scrubbed Light skill hashes.
See [the scrub proof](source-integration-scrub-proof.json) and [the independent pairing review](light-pin-excluded-rwa-review.md).
The filter removes the new RWA section and the unavailable bare repository path.
The supported repository search, explanation, and trust paths remain available.

The source-only generation used the committed builder before later routing integration.
The final routing candidate must regenerate these outputs again.
Source review does not accept routing quality, execution cost, or production release.

[The independent source review](source-integration-review.md) accepts the composed source snapshot only.

The source and quality changes were combined before runtime optimization.
All 544 measured result orders and grades stayed unchanged.
Two existing Docs result scores increased by 8.
The added title keywords caused these changes; no new result entered either page.
See [the measured source attribution](source-integration-attribution.json).

The final skill drift check found an unclassified Trustless Work `.github` directory.
At pinned commit `634f32bd4be6769b0cae52e72db4899d5f5a069c`, it contains only `workflows/consistency.yml`.
The workflow blob is `dcb7140189b5c29939846eff1d3b6115af237bd5`.
The parent records `.github` as repository CI configuration in `groups.json`.
This classification changes no pinned file, skill selection, or runtime catalog entry.
