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
  - 2026-09-30 independent review (.agents/rounds/2026-09-30-skill-system-audit/) found more stale locations at the same commit. SKILL.md line 90 lists "Soroban / dapp / assets / data / agentic-payments / zk-proofs / standards". README.md line 76 links skills.stellar.org/soroban and line 78 links skills.stellar.org/anchors. references/api-reference.md line 196 builds an install URL at skills.stellar.org for every entry, including non-SDF entries.
  - 2026-09-30T20:23:11Z https://skills.stellar.org/soroban and https://skills.stellar.org/anchors returned HTTP 404. https://skills.stellar.org/skills/anchors/SKILL.md and https://stellarlight.xyz/api/skills/anchors returned HTTP 404. https://skills.stellar.org/skills/soroban/SKILL.md still returned HTTP 200 as an unlisted legacy file; the skills.stellar.org index lists smart-contracts, not soroban.
  - 2026-09-30 correction comment posted with the added locations and the revised recommendation, because the correction changes the proposed action: https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-5919085549
  - 2026-10-02 recheck: GET https://stellarlight.xyz/api/skills returned 62 entries (sdf 8, stellarlight 15, lumenloop 8, external 12, community 19) at Scout API 1.9.61. Upstream Stellar-Light/stellar-scout main is still 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6, so the pinned skill text is unchanged and the finding still reproduces. Issue 14 is open with one comment.
---

## Finding

The Scout skill describes `/api/skills` as a catalog of seven SDF skills.
On 2026-09-30 the live catalog had 43 entries from four sources and eight SDF skills; on 2026-10-02 it has 62 entries from five sources (19 community-built entries from skills.stellar.org) and still eight SDF skills.
The skill names `soroban` as an SDF skill.
The live API returns HTTP 404 for `/api/skills/soroban`.
The listed slug is `smart-contracts`.
The skill also omits the `cross-chain` SDF skill.
The README links two skill pages that return HTTP 404.

An agent that follows the skill can request a slug that does not exist.
It can also tell a user that the catalog holds only SDF skills.
It can miss the Stellar Light, LumenLoop, and external entries that the endpoint returns.

## Evidence

The stale text is at commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`:

- `SKILL.md` line 14: "(soroban, dapp, assets, data, agentic-payments, zk-proofs, standards)".
- `SKILL.md` line 90: "(Soroban / dapp / assets / data / agentic-payments / zk-proofs / standards)".
- `SKILL.md` lines 240-241: "SDF skills catalog (skills.stellar.org)" and "Full content of one SDF skill".
- `SKILL.md` line 312: "The 7 official SDF skills (soroban, dapp, ...)".
- `references/api-reference.md` line 189: "~30 entries" and "the 7 official SDF skills".
  The rest of line 189 already describes a multi-source catalog correctly.
- `references/api-reference.md` line 194: "Full content of one SDF skill". This contradicts line 189.
- `references/api-reference.md` line 196: an install URL at `skills.stellar.org` for every entry.
- `README.md` line 64: "Catalog of skills.stellar.org's 7 official skills".
- `README.md` lines 76 and 78: `skills.stellar.org/soroban` and `skills.stellar.org/anchors`.
- `references/examples.md` line 20: "Also recommend `soroban`".

On 2026-09-30, `GET https://stellarlight.xyz/api/skills` returned 43 entries.
The `sdf` entries were `agentic-payments`, `assets`, `cross-chain`, `dapp`, `data`,
`smart-contracts`, `standards`, and `zk-proofs`.
`GET https://stellarlight.xyz/api/skills/soroban` returned HTTP 404 with `unknown skill: soroban`.
`GET https://stellarlight.xyz/api/skills/stellar-scout` returned full content for a `stellarlight` entry.
`https://skills.stellar.org/soroban` and `https://skills.stellar.org/anchors` returned HTTP 404.
`https://skills.stellar.org/skills/soroban/SKILL.md` still returned HTTP 200 as an unlisted legacy file.

## Recommendation

Remove the fixed SDF skill lists and the fixed counts.
Point readers to `/api/skills` for the current entries and to `.meta.counts` for the totals.
Where a concrete slug is required, use `smart-contracts` instead of `soroban`.
Replace or remove the `anchors` link in `README.md`.
Correct line 194 of `references/api-reference.md` to match line 189: full content for entries that ship a
`SKILL.md`, and metadata only for other entries.
Describe `/api/skills` as the merged multi-source catalog in `SKILL.md` and `README.md`.
Take each entry's install location from its own catalog metadata, not from a fixed `skills.stellar.org` path.
