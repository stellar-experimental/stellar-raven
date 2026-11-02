---
id: sls-105
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "contract-source-verification RFP row carries the original idea text, not the published SCF brief"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/rfps?q=source%20verification
  expect:
    status: 200
    contains:
      - "Deterministic Build: Reproducible WASM compilation pipeline"
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/rfps?q=source%20verification returned rowType rfp 'contract-source-verification', status closed, quarter q2-2026, url https://stellarlight.xyz/ideas/contract-source-verification. technicalRequirements: 'Deterministic Build: Reproducible WASM compilation pipeline (e.g., via Docker) so source-to-bytecode matching is verifiable. Registry API: Public API and UI to submit, verify, and query contract source code by contract ID. Explorer Integration: Hook into the Soroban-First Block Explorer (Q1 RFP) to surface verification badges.'"
  - "Official source: https://github.com/stellar/scf-handbook/blob/e37c0d541ddbee5f06f152b9cd1f03bbe0321f23/scf-awards/build-award/rfp-track.md (2026-06-29) publishes 'Contract Source Verification Service'. It asks to 'Design and deliver a public, hosted contract source verification service for Soroban smart contracts. The service consumes the SEP-58 metadata vocabulary (bldimg, bldopt, source_repo, source_rev, tarball_url, tarball_sha256)'. Its out-of-scope list includes 'Fully deterministic Rust compilation as a research effort.'"
  - "The published brief excludes the deterministic-build research that the Scout row lists first. The published brief requires SEP-58 fields and an SDF-allowlisted trusted build image, which the Scout row does not mention."
  - "Dedupe 2026-11-02: resolved sls-045, sls-060, sls-067, and sls-072 cover RFP counts, closed-brief CTAs, fundability, and round source schema. None covers brief body provenance. GitHub search repo:Stellar-Light/stellarlight contract-source-verification returned no matching issue."
  - "Golden consumer: eval/qa/corpus/battery case q-scf-contract-verification-rfp-live records the mismatch in truth.verified evidence."
---

## Finding

The `contract-source-verification` RFP row carries requirements from the original idea.
It lists "Deterministic Build", "Registry API", and "Explorer Integration" with the Soroban-First Block Explorer.
The published SCF Q2 2026 brief asks for a hosted verification service built on SEP-58 metadata.
That brief puts fully deterministic Rust compilation out of scope.
An agent that reads this row describes requirements that the funded brief did not set.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/rfps?q=source%20verification'
gh api 'repos/stellar/scf-handbook/contents/scf-awards/build-award/rfp-track.md?ref=e37c0d541ddbee5f06f152b9cd1f03bbe0321f23' --jq .content | base64 -d
```

The handbook at commit `e37c0d541ddbee5f06f152b9cd1f03bbe0321f23` has the section "Contract Source Verification Service".
It names the SEP-58 fields `bldimg`, `bldopt`, `source_repo`, `source_rev`, `tarball_url`, and `tarball_sha256`.
It requires an SDF-allowlisted trusted build image and a free public status API.

## Recommendation

For RFP rows that became published briefs, store the published brief text and a link to its source.
Keep the idea text in a separate field, labelled as the original idea.
Re-sync `contract-source-verification` from the Q2 2026 handbook section.
Check the other promoted briefs for the same idea-text substitution.
