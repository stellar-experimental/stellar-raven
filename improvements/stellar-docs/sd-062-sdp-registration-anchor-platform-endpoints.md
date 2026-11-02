---
id: sd-062
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: SDP Registration API reference still describes decommissioned Anchor Platform endpoints
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/registration returned HTTP 200 with "the wallet must authenticate and initiate a registration flow using the Anchor Platform Endpoints defined below. Note that these endpoints are hosted on a different host than the Stellar Disursement Platform."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/platforms/stellar-disbursement-platform/api-reference/registration.mdx carries the same paragraph
  - stellar/stellar-disbursement-platform-backend CHANGELOG.md 6.0.0 (released 2025-12-04) "Decommission Anchor Platform and add support for SEP-10 and SEP-24 endpoints in the SDP" with "Add SEP10 /auth endpoints", "Add SEP24 /info endpoints", and "Remove Anchor Platform integration from the SDP"; latest release 7.1.0 (2026-10-26)
  - golden case q-pay-sdp-disbursement (golden audit pass 2, 2026-11-02) records the stale reference as an observation
---

## Finding

The SDP Registration API reference says that wallets authenticate through Anchor Platform
endpoints on a separate host. SDP 6.0.0 removed the Anchor Platform integration. The SDP now
serves the SEP-10 and SEP-24 endpoints itself.

A wallet integrator can look for a separate Anchor Platform host that a current SDP deployment
does not have.

The page also has two spelling errors in the same paragraph block: "Disursement" and "Platfrom".

This is a `docs-content` finding.

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
"Disursement" and "Platfrom".

Optional: state that SDP versions before 6.0.0 used a separate Anchor Platform host.
