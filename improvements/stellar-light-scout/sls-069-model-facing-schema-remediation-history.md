---
id: sls-069
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-19
upstreamTitle: Keep remediation history out of model-facing Scout schema descriptions
evidence:
  - 2026-08-19 live Scout OpenAPI 1.8.73 contained five response-schema descriptions that name sls-066 or sls-067
  - two additional stablecoin descriptions embed a prior field shape, a breaking-change date, or response-compatibility history
  - the stablecoin descriptions record the previous USDC omission, the former counts.total meaning, and the sls-066 remediation identifier
  - the RFP descriptions record when fields were served and specced, including the sls-067 remediation identifier
  - Solo standards review against f313bf27b53b1f28a2ab2771452188ef6000c755 identified the text as upstream reviewability debt and advised against a local scrub
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/973
  - 2026-08-25 live Scout OpenAPI 1.8.87 contained zero descriptions matching `sls-\d` and zero descriptions matching `specced 20|until 2026-|BREAKING 20|retained for response-shape`
---

## Finding

Scout OpenAPI includes remediation history inside seven response-schema
descriptions. Five descriptions name `sls-066` or `sls-067`. Two more record a
prior field shape, a breaking-change date, or response-compatibility history.

Those descriptions are model-facing contracts. A caller needs their current
meaning, scope, and provenance rules. It does not need an internal finding ID or
the behavior that preceded the current contract.

The history increases prompt size and creates a stale second owner for change
records. It also exposes identifiers that a Scout caller cannot resolve from the
OpenAPI document.

## Evidence

The 2026-08-19 OpenAPI document contained seven matching descriptions:

- stablecoin `counts.total` names `sls-066` and its meaning before 2026-08-18;
- stablecoin coverage names `sls-066` and the earlier Circle USDC omission;
- stablecoin row basis names `sls-066` and its original failure scenario;
- stablecoin `supplyChange7d` records its prior string shape and a dated
  breaking-change notice;
- stablecoin `verified` says the field remains for response-shape compatibility;
- RFP `currentPhase` names `sls-067` and its specification date; and
- RFP `roundsInProgress` names `sls-067` and its specification date.

The present-state semantics in those descriptions are useful. The remediation
identifiers, dates, and prior behavior are not part of the current response
contract.

## Recommendation

Keep each schema description limited to current semantics and caller
obligations. Move the remediation identifiers, dates, and prior behavior to the
Scout changelog.

Generate the OpenAPI descriptions and changelog entries from separate fields.
This prevents release history from entering model-facing contracts again.
