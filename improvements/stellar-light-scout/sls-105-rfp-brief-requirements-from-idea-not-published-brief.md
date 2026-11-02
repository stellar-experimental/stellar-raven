---
id: sls-105
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "GET /api/rfps source-verification requirements omit the published brief scope and source"
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
  - "The published brief excludes fully deterministic Rust compilation research, while still requiring reproducible rebuilds. The published brief requires SEP-58 fields and an SDF-allowlisted trusted build image, which the Scout row does not mention."
  - "Dedupe 2026-11-02: resolved sls-045, sls-060, sls-067, and sls-072 cover RFP counts, closed-brief CTAs, fundability, and round source schema. None covers brief body provenance. GitHub search repo:Stellar-Light/stellarlight contract-source-verification returned no matching issue."
  - "Golden consumer: eval/qa/corpus/battery case q-scf-contract-verification-rfp-live records the mismatch in truth.verified evidence."
  - "2026-11-02 recheck: curl -sS --retry 2 --max-time 30 'https://stellarlight.xyz/api/rfps?q=source%20verification' returned HTTP 200. The first attempt failed with curl exit 35 and HTTP 000; the retry succeeded. contract-source-verification remains a closed q2-2026 rfp. technicalRequirements names Deterministic Build, Registry API, and Explorer Integration, with no SEP-58 fields or trusted-image requirement."
  - "2026-11-02T22:38Z source check: curl -sS --max-time 50 https://raw.githubusercontent.com/stellar/scf-handbook/e37c0d541ddbee5f06f152b9cd1f03bbe0321f23/scf-awards/build-award/rfp-track.md returned HTTP 200. Its Q2 brief requires SEP-58 source modes and an SDF-allowlisted trusted build image. It excludes fully deterministic Rust compilation as a research effort. Reproducible builds themselves remain in scope."
  - "2026-11-02 calibration: gh api repos/stellar/scf-handbook/commits/e37c0d541ddbee5f06f152b9cd1f03bbe0321f23 confirms 2026-06-29T15:40:50Z. This is a historical publication snapshot, not an introduction date. The current main handbook page returned HTTP 200 and now lists Q4 placeholders. Grep of ideas.ts and rfps/route.ts confirms that the API copies the idea requirements and links /ideas. The missing metadata requirements are verified; deterministic-build incompatibility is not."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for contract-source-verification and 'rfp requirements', across all states. The broad identifier query returned unrelated source, resolver, and triage records. No matching brief-scope correction appeared. rg over improvements/ and improvements/resolved.json found resolved sls-045, sls-060, sls-067, and sls-072, with different defects. Intake resolves to Stellar-Light/stellarlight without an override."
---

## Finding

`GET /api/rfps` presents idea requirements for `contract-source-verification` without the published brief's SEP-58 scope or source link.
The closed Q2 2026 row lists "Deterministic Build", "Registry API", and a specific explorer integration.
The published Q2 brief requires SEP-58 source metadata and an SDF-allowlisted trusted build image.
The row omits those requirements.
A reader cannot use the row to recover the published brief's scope.

The brief requires rebuilds and excludes fully deterministic Rust compilation as a research effort.
The row's reproducible-build wording alone does not prove a contradiction with that research exclusion.

## Evidence

Read-only reproduction:

```sh
curl -sS --retry 2 --max-time 30 'https://stellarlight.xyz/api/rfps?q=source%20verification'
gh api 'repos/stellar/scf-handbook/contents/scf-awards/build-award/rfp-track.md?ref=e37c0d541ddbee5f06f152b9cd1f03bbe0321f23' --jq .content | base64 -d
```

The API returned HTTP 200 on the successful retry.
The historical handbook source also returned HTTP 200.
The handbook commit dates from 2026-06-29.
It names `bldimg`, `bldopt`, `source_repo`, `source_rev`, `tarball_url`, and `tarball_sha256`.
It requires public and private source modes and an SDF-allowlisted trusted build image.
The current handbook page now contains Q4 placeholders, so the closed Q2 row needs a historical source link.

The API copies the matching record from `src/data/ideas.ts`.
Its `url` points to `https://stellarlight.xyz/ideas/contract-source-verification`.

## Recommendation

Link this closed RFP row to its published Q2 brief snapshot and identify the existing text as an idea summary.
Add the SEP-58 source modes and trusted-image requirement to its requirements summary.
Keep the original idea text separate from the published brief requirements.
As a separate coverage check, compare other promoted ideas with their published briefs.
