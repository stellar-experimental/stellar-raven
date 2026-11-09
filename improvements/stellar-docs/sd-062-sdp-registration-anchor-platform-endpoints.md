---
id: sd-062
service: stellar-docs
status: fixed-upstream
discovered: 2026-11-02
upstreamTitle: SDP Registration API reference still describes decommissioned Anchor Platform endpoints
evidence:
  - "2026-11-09: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/registration.md says SDP hosts the SEP-10 and SEP-24 endpoints itself and limits the separate Anchor Platform host to versions before 6.0.0; the four typos are gone and the bundled spec agrees. https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/troubleshooting.md lists SDP and TSS only. The SDP backend's stellar.toml handler builds both endpoints from the SDP base URL. Resolving PR: https://github.com/stellar/stellar-docs/pull/3010. Independent recheck: Codex frontier (gpt-6-astra, high)."
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/registration returned HTTP 200 with "the wallet must authenticate and initiate a registration flow using the Anchor Platform Endpoints defined below. Note that these endpoints are hosted on a different host than the Stellar Disursement Platform."
  - stellar/stellar-docs main 5142b219d3ead7605cc1d9dd661582c653664ec5 docs/platforms/stellar-disbursement-platform/api-reference/registration.mdx lines 7 and 9, and the Registration tag description in openapi/stellar-disbursement-platform/main.yaml and bundled.yaml lines 68 and 70, carry the same paragraph
  - the same Registration tag already lists /sep10/auth, /sep24/info, and /sep24-interactive-deposit/* operations, added by stellar/stellar-docs#2150 (merged 2026-01-08), which kept the old tag description
  - stellar/stellar-disbursement-platform-backend CHANGELOG.md 6.0.0 (released 2025-12-04) "Decommission Anchor Platform and add support for SEP-10 and SEP-24 endpoints in the SDP" with "Add SEP10 /auth endpoints", "Add SEP24 /info endpoints", and "Remove Anchor Platform integration from the SDP"; latest release 7.1.0 (2026-10-26)
  - golden case q-pay-sdp-disbursement (golden audit pass 2, 2026-11-02) records the stale reference as an observation
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/2999
recurrences:
  - date: 2026-11-06
    evidence: "Live Registration and main/bundled YAML retain AP separate-host paragraph/typos. PR3010 remains CHANGES_REQUESTED though bot Nov6 00:44Z reports head02341a3 fixes TOML host and troubleshooting; checks green. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-062"
---

## Finding

The SDP Registration API reference says that wallets authenticate through Anchor Platform
endpoints on a separate host. SDP 6.0.0 removed the Anchor Platform integration. The SDP now
serves the SEP-10 and SEP-24 endpoints itself.

A wallet integrator can look for a separate Anchor Platform host that a current SDP deployment
does not have.

The page also has four spelling errors in the same paragraph block: "Disursement", "Platfrom",
"chose" (for "choose"), and "intstead".

## Evidence

The live page says: "First, the wallet must authenticate and initiate a registration flow using
the Anchor Platform Endpoints defined below. Note that these endpoints are hosted on a different
host than the Stellar Disursement Platform."

The SDP backend changelog for 6.0.0 lists under "Potential Breaking Changes": "Decommission
Anchor Platform and add support for SEP-10 and SEP-24 endpoints in the SDP". The sub-items add
SEP-10 `/auth`, SEP-24 `/info`, and the SEP-24 interactive deposit endpoint. They also remove the
Anchor Platform integration. The current release is 7.1.0.

## Recommendation

Change the paragraph to say that the wallet authenticates with SEP-10 and starts the flow with
SEP-24 on the SDP host. Rename the "Anchor Platform Endpoints" group to match. Correct
"Disursement", "Platfrom", "chose", and "intstead".

Make the same change in the `Registration` tag description in
`openapi/stellar-disbursement-platform/main.yaml`, then regenerate `bundled.yaml` with
`pnpm bundle-stellar-disbursement-platform`. The page repeats that tag description word for word.

Optional: state that SDP versions before 6.0.0 used a separate Anchor Platform host.
