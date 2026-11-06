---
id: sk-038
service: skills
status: reported-upstream
discovered: 2026-11-06
upstreamTitle: Qualify issuer lockout in the assets skill's custom SAC admin guidance
evidence:
  - "2026-11-06 GET https://raw.githubusercontent.com/stellar/stellar-dev-skill/77bf4e8fc2533ac6ad680d061e89371e8474a1a8/skills/assets/SKILL.md returns the custom-admin prerequisite 'lock the issuer (master key weight 0)' and says the admin stays locked forever because nobody can sign the handover."
  - "The same source's fixed-supply example correctly says to remove other signers or check their combined weight against thresholds. Its custom-admin subsection omits that condition."
  - "2026-11-06 GET https://developers.stellar.org/docs/tokens/control-asset-access.md says master weight 0 disables only the master key. Other signers can still authorize issuance or restore the master weight when they meet the relevant thresholds."
  - "2026-11-06 the generated stellar-docs .mintlify/skills/assets/SKILL.md contains the same custom-admin wording. The canonical source is stellar/stellar-dev-skill; correct it there."
  - "Residual from sd-082: its two original Docs pages are corrected; this distinct skill subsection needs its own source correction. See .agents/rounds/2026-11-05-truth-maintenance/docs.md."
  - "Dedupe: all active/resolved skill findings and stellar/stellar-dev-skill open issuer PRs/issues checked; no existing finding covers this subsection."
  - upstream issue filed 2026-11-06: https://github.com/stellar/stellar-dev-skill/issues/177
  - "2026-11-06 partial fix: https://github.com/stellar/stellar-dev-skill/pull/178 merged as 981705739483f0f04eccb309c2460a421eeba6c2. Canonical https://skills.stellar.org/skills/assets/SKILL.md matches its corrected source (SHA-256 ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8). The prerequisite, handover warning and checklist qualify other signers and thresholds."
  - "2026-11-06 generated Docs source now contains the correction (SHA-256 0cbd9cdbf2f2bc2b7a34270eb3a33079c88d7ac3bc94750b631c8720328c7737), but the ordinary published URL https://developers.stellar.org/.well-known/agent-skills/assets/skill.md still serves the original defect at 12:42 UTC (SHA-256 141b4f4417599cd1679f7c82f26fae50f6eb5ca9a50c12f66bc14f72e5694856). Cache-busted requests serve corrected bytes; those do not prove the normal URL is fixed."
  - "Verification response posted by kalepail on 2026-11-06, with the published-cache residual: https://github.com/stellar/stellar-dev-skill/issues/177#issuecomment-6685112671 (read back; this is Raven verification, not an upstream maintainer acceptance)."
  - "2026-11-06 inbound handoff https://github.com/stellar-experimental/stellar-raven/issues/381 independently checked by a separate Astra reviewer. Keep reported-upstream until the ordinary Docs skill URL serves the corrected prerequisite, handover warning and checklist. Review: .agents/rounds/2026-11-06-skill-handoff/review.md."
---

## Finding

The assets skill equates issuer lockout with master key weight 0 in its custom SAC admin guidance.
It also says setting that weight before handover leaves nobody able to authorize `set_admin`.
Both claims omit additional account signers and their thresholds.

A remaining signer can authorize classic issuance despite the master key being disabled.
The role model therefore needs a complete account lockout, not only a disabled master key.

## Evidence

Read `skills/assets/SKILL.md` at commit `77bf4e8fc2533ac6ad680d061e89371e8474a1a8`.
The custom-admin subsection starts its prerequisite with `lock the issuer` and `master key weight 0`.
The fixed-supply example earlier in that file already gives the missing signer qualification.
The deployed asset-control guide also explains the relevant medium and high thresholds.

## Recommendation

Apply the fixed-supply example's signer qualification to the custom-admin subsection and final security checklist.
Keep the handover-before-lockout ordering, but describe complete account lockout rather than master-key disablement alone.
Qualify the claim that nobody can sign after setting master weight 0.
Regenerate the Docs skill copy from the corrected source.

## Remaining delivery defect, 2026-11-06

The canonical skill source and generated Docs source are corrected. The ordinary published
Docs skill URL still serves the earlier copy. Retain this finding until that URL serves the
corrected text without a query parameter. Invalidate or expire the stale published response;
no further canonical wording change is requested. The observations above describe the original
source defect and its remaining delivery path separately.
