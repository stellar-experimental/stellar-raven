---
id: sk-028
service: skills
status: verified
discovered: 2026-09-30
upstreamTitle: Scout skill states fixed Builders directory sizes (dozens, about 110); the live directory has more than 200 profiles
evidence:
  - Stellar-Light/stellar-scout commit 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6 (the pinned commit and upstream HEAD on 2026-09-30) SKILL.md line 91 says the Builders directory is "currently in the dozens, not hundreds".
  - The same commit references/api-reference.md line 104 says the directory is "small and sparse (~110 profiles".
  - 2026-09-30T20:23:13.664Z GET https://stellarlight.xyz/api/status returned the builders source with count 226, lastUpdatedAt 2026-09-30T12:57:22.194Z, and notes "Synced from Stellar Passport — small and growing dataset".
  - 2026-09-30 GET https://stellarlight.xyz/api/builders?q=zzzzqqq returned the advisory "The directory has 226 builder profiles, but none match these filters".
  - 2026-10-02T01:55:51Z GET https://stellarlight.xyz/api/status returned the builders source with count 233 and lastUpdatedAt 2026-10-01T13:42:53.078Z. The count grew by 7 in two days. Upstream main is still commit 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6, and SKILL.md line 91 and references/api-reference.md line 104 still carry the two fixed sizes.
  - A 2026-10-02 check of all 13 Stellar-Light/stellar-scout issues found no builder-count report. Closed issue 2 covers substring filtering. Open issue 14 covers the skills catalog. Title and text searches of the Stellar-Light/stellarlight issues found no builder-count report either.
  - The same two lines are in Stellar-Light/stellarlight at public/skills/stellar-scout.md line 91 and public/skills/references/api-reference.md line 104 (main 98eb8ae133d822badf02ec341f301e45cb335537, read 2026-10-02). SHIPPING.md in that repository says the monorepo is canonical and the distribution repositories sync from it. src/lib/stellar-scout-skill.ts is a generated mirror.
---

## Finding

The Scout skill gives the size of the Builders directory as a fixed count.
`SKILL.md` says the directory is "currently in the dozens, not hundreds".
`references/api-reference.md` says it has about 110 profiles.
The live API reported 226 builder profiles on 2026-09-30 and 233 on 2026-10-02.
An agent that follows the skill can understate the directory to a user.
It can also judge a small result set against the wrong baseline.

## Evidence

At commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`:

- `SKILL.md` line 91: "currently in the dozens, not hundreds".
- `references/api-reference.md` line 104: "small and sparse (~110 profiles".

On 2026-09-30, `GET https://stellarlight.xyz/api/status` returned `count: 226` for the `builders` source.
The same day, a no-match `GET /api/builders` query returned the advisory
"The directory has 226 builder profiles, but none match these filters".
On 2026-10-02, `/api/status` returned `count: 233`.

The two lines are mirrors.
The canonical copies are `public/skills/stellar-scout.md` line 91 and `public/skills/references/api-reference.md` line 104 in `Stellar-Light/stellarlight`.

## Recommendation

Remove the fixed profile counts at their canonical source in `Stellar-Light/stellarlight`.
Edit `public/skills/stellar-scout.md` line 91 and `public/skills/references/api-reference.md` line 104.
Regenerate `src/lib/stellar-scout-skill.ts` with `scripts/sync-scout-skill-mirror.ts`. Do not edit it by hand.
Then let `sync-scout-skill.yml` copy the result to `SKILL.md` and `references/api-reference.md` in `Stellar-Light/stellar-scout`.
Point readers to the `builders` count in `/api/status`, or to the `/api/builders` advisory, for the current size.
Keep the guidance that the directory holds only opt-in Stellar Passport profiles.
