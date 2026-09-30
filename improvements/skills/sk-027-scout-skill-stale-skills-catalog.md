---
id: sk-027
service: skills
status: reported-upstream
discovered: 2026-09-30
upstreamTitle: Scout skill describes /api/skills as seven SDF skills and names the removed soroban slug
evidence:
  - Stellar-Light/stellar-scout commit 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6 (the pinned commit and upstream HEAD on 2026-09-30) SKILL.md lines 14 and 312 list the SDF skills as soroban, dapp, assets, data, agentic-payments, zk-proofs, standards; line 312 says "The 7 official SDF skills".
  - The same commit SKILL.md lines 240-241 describe /api/skills as "SDF skills catalog (skills.stellar.org)" and /api/skills/{name} as "Full content of one SDF skill".
  - The same commit references/api-reference.md line 189 says "~30 entries" and "the 7 official SDF skills"; line 194 says /api/skills/{name} returns "Full content of one SDF skill", which contradicts line 189 ("SDF + curated").
  - The same commit README.md line 64 says /api/skills is a "Catalog of skills.stellar.org's 7 official skills"; references/examples.md line 20 says "Also recommend `soroban`".
  - 2026-09-30T19:41:24Z GET https://stellarlight.xyz/api/skills returned 43 entries (sdf 8, stellarlight 15, lumenloop 8, external 12; generatedAt 2026-09-30T19:24:07.210Z). The sdf slugs are agentic-payments, assets, cross-chain, dapp, data, smart-contracts, standards, zk-proofs.
  - 2026-09-30T19:41:24Z GET https://stellarlight.xyz/api/skills/soroban returned HTTP 404 {"error":"unknown skill: soroban"}; /api/skills/smart-contracts returned HTTP 200; /api/skills/stellar-scout returned 34541 characters of content with source stellarlight.
  - 2026-09-30 Raven production scout.getSkill({ name "soroban" }) returned soft-empty status 404, and codemode.skill.read of skills.stellar-light.stellar-scout served all four stale phrases.
  - Dedupe 2026-09-30 found no open or closed Stellar-Light/stellar-scout issue for the skills-catalog description. Earlier API-reference drift findings sk-008, sk-009, and sk-018 covered other endpoints and are resolved.
  - upstream issue filed 2026-09-30: https://github.com/Stellar-Light/stellar-scout/issues/14
---

## Finding

The Scout skill describes `/api/skills` as a catalog of seven SDF skills.
The live catalog has 43 entries from four sources and eight SDF skills.
The skill names `soroban` as an SDF skill.
The live API returns HTTP 404 for `/api/skills/soroban`.
The canonical slug is `smart-contracts`.
The skill also omits the `cross-chain` SDF skill.

An agent that follows the skill can request a slug that does not exist.
It can also tell a user that the catalog holds only SDF skills.
It can miss the Stellar Light, LumenLoop, and external entries that the endpoint returns.

## Evidence

The stale text is in five places at commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`:

- `SKILL.md` line 14: "(soroban, dapp, assets, data, agentic-payments, zk-proofs, standards)".
- `SKILL.md` lines 240-241: "SDF skills catalog (skills.stellar.org)" and "Full content of one SDF skill".
- `SKILL.md` line 312: "The 7 official SDF skills (soroban, dapp, ...)".
- `references/api-reference.md` line 189: "~30 entries" and "the 7 official SDF skills".
  Line 194 says `/api/skills/{name}` returns "Full content of one SDF skill".
  Line 189 of the same file says curated sources also ship content.
- `README.md` line 64: "Catalog of skills.stellar.org's 7 official skills".
- `references/examples.md` line 20: "Also recommend `soroban`".

On 2026-09-30, `GET https://stellarlight.xyz/api/skills` returned 43 entries.
The `sdf` entries were `agentic-payments`, `assets`, `cross-chain`, `dapp`, `data`,
`smart-contracts`, `standards`, and `zk-proofs`.
`GET https://stellarlight.xyz/api/skills/soroban` returned HTTP 404 with `unknown skill: soroban`.
`GET https://stellarlight.xyz/api/skills/stellar-scout` returned full content for a `stellarlight` entry.

## Recommendation

Replace `soroban` with `smart-contracts` in every SDF skill list, and add `cross-chain`.
Describe `/api/skills` as the merged multi-source catalog, not an SDF-only catalog.
Describe `/api/skills/{name}` as full content for sources that ship a `SKILL.md`, and metadata only
for other entries.
Remove the fixed entry and skill counts, or point to `.meta.counts` for the current values.
Check `README.md` and `references/examples.md` for the same list.
