---
id: sk-028
service: skills
status: verified
discovered: 2026-09-30
upstreamTitle: Scout skill describes the Builders directory as dozens of profiles; the live directory has 226
evidence:
  - Stellar-Light/stellar-scout commit 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6 (the pinned commit and upstream HEAD on 2026-09-30) SKILL.md line 91 says the Builders directory is "currently in the dozens, not hundreds".
  - The same commit references/api-reference.md line 104 says the directory is "small and sparse (~110 profiles".
  - 2026-09-30T20:23:13.664Z GET https://stellarlight.xyz/api/status returned the builders source with count 226, lastUpdatedAt 2026-09-30T12:57:22.194Z, and notes "Synced from Stellar Passport — small and growing dataset".
  - 2026-09-30 GET https://stellarlight.xyz/api/builders?q=zzzzqqq returned the advisory "The directory has 226 builder profiles, but none match these filters".
  - Found by the independent rev-grok review in .agents/rounds/2026-09-30-skill-system-audit/review-rev-grok.md. This is a different defect from sk-027 (the skills-catalog description), so it is a successor finding, not an sk-027 residual.
  - Dedupe 2026-09-30 found no Stellar-Light/stellar-scout issue for the builder count.
---

## Finding

The Scout skill gives the size of the Builders directory as a fixed count.
`SKILL.md` says the directory is "currently in the dozens, not hundreds".
`references/api-reference.md` says it has about 110 profiles.
The live API reports 226 builder profiles.
An agent that follows the skill can understate the directory to a user.
It can also judge a small result set against the wrong baseline.

## Evidence

At commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`:

- `SKILL.md` line 91: "currently in the dozens, not hundreds".
- `references/api-reference.md` line 104: "small and sparse (~110 profiles".

On 2026-09-30, `GET https://stellarlight.xyz/api/status` returned `count: 226` for the `builders` source.
The same day, a no-match `GET /api/builders` query returned the advisory
"The directory has 226 builder profiles, but none match these filters".

## Recommendation

Remove the fixed profile counts from `SKILL.md` and `references/api-reference.md`.
Point readers to the `builders` count in `/api/status`, or to the `/api/builders` advisory, for the current size.
Keep the guidance that the directory holds only opt-in Stellar Passport profiles.
