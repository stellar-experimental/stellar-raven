# Scout skill reference filter

Date: 2026-09-16

## Decision

Accept the host filter for the unlisted `/api/repos` collection path.
Astra authored the change. Grok 4.6 high independently reviewed the six-file implementation.
The [review](2026-09-16-scout-skill-filter/independent-review.md) accepts this bounded filter.
It does not accept the newer Light pin, Scout 1.9.52, or RWA exposure.

The filter removes complete Markdown blockquotes and matches exact endpoint boundaries.
Exposed child paths remain available, including `/api/repos/search` and `/api/repos/explain`.
The existing excluded-operation presence guard remains unchanged.
A separate guard requires a policy decision if OpenAPI later lists the collection.

## Verification

The focused 20 tests, typecheck, 2,078 unit tests, build, and routing gate passed.
The catalog rebuild produced no change to the committed manifest.
The protocol-history diagnostic reported `source-expired (manifest-sha256)` and scored no questions.
It did not pass. Existing instructions retain this diagnostic state.

The [candidate body proof](2026-09-16-scout-skill-filter/candidate-body-proof.json) verifies the later pin against this filter.
The proof checks the upstream Git blob and raw body hash.
The filter removes the collection quotation and preserves the exposed child sections.
This isolated body check does not accept the pin.

After review, the coordinator corrected one comment to name the host exposure policy.
No executable code changed after review.

## Combined verification

The filter was combined with the accepted PR #157 implementation after its independent review.
Typecheck, 2,091 unit tests, build, and the unchanged routing gate passed.
The catalog content and its accepted fingerprint did not change.
The merged PR #157 tree at `58954b6759b8d5a1b7a743e5d2d96893b4c6151f` exactly matches tested commit `cd87615f`.
The filter contains no later source pin or operation exposure change.
