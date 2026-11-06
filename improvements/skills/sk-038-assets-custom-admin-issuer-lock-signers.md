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
