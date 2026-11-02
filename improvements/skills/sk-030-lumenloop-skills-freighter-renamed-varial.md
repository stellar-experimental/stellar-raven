---
id: sk-030
service: skills
status: verified
discovered: 2026-11-02
upstreamTitle: Four lumenloop-skills playbooks name the Freighter wallet, which SDF renamed Varial on 2026-10-29
evidence:
  - "2026-11-02 B: lumenloop/lumenloop-skills main a87ca95730d2a4015c884defebd66b44ea01d3b2 (2026-10-12; the only change since the Raven pin d92c56bda17ab702d3202335cfe814d64e70e191 is .github/workflows/pg-atlas-sbom.yml, and the four SKILL.md files hash the same at both commits). grep -n -i freighter: skills/stellar-project-dossier/SKILL.md line 36 'JS stellar-sdk + Freighter + Stellar'; skills/stellar-ecosystem-digest/SKILL.md line 34 'Freighter / Stellar Wallets Kit'; skills/stellar-builder-quickstart/SKILL.md line 39 'Freighter, Stellar Wallets Kit, passkeys' and line 134 '(or Freighter directly)'; skills/stellar-integration-finder/SKILL.md line 34 '**Freighter** + **Stellar Wallets Kit**' and line 149 'JS **stellar-sdk**, **Freighter**, **Stellar Wallets Kit**'. No file names Varial."
  - "2026-11-02 B: https://raw.githubusercontent.com/stellar/freighter/master/README.md opens '# Varial' and 'Varial (formerly Freighter) is a non-custodial wallet extension that enables you to sign Stellar transactions via your browser.' It names the client SDK '@stellar/varial-sdk'. stellar/freighter release 5.51.0 was published 2026-10-28T22:11:58Z."
  - "2026-11-02 A: https://stellar.org/blog/foundation-news/freighter-is-now-varial (SDF, 2026-10-29): 'Today, Freighter becomes Varial, with a new name and a new focus'. Its developer section says 'Already integrated with Freighter? Update your branding with assets at varialwallet.com/brand' and 'New to Varial? Get started at docs.varialwallet.com'."
  - "2026-11-02 F: curl -sI https://www.freighter.app/ returned HTTP/2 301 with location https://varialwallet.com/. npm registry: @stellar/varial-sdk latest 7.0.0 (modified 2026-10-28); @stellar/freighter-api latest 6.0.1, not deprecated."
  - "2026-11-02 B: Creit-Tech/Stellar-Wallets-Kit release v2.8.0 (2026-10-28T21:55:28Z) notes 'Migrate FreighterModule to VarialModule'."
  - "2026-11-02 C: Raven codemode.skill.read of skills.lumenloop.stellar-project-dossier, skills.lumenloop.stellar-ecosystem-digest, skills.lumenloop.stellar-builder-quickstart, and skills.lumenloop.stellar-integration-finder served the same Freighter lines from the pinned commit d92c56b."
  - "Golden impact: golden audit 2026-11-02 batch tooling-infra-04 (cases q-ti-skill-builder-quickstart and q-ti-skill-integration-finder) found the stale name. Neither golden grades a wallet name, so no golden change depends on this finding. Related case q-tool-freighter-wallet already encodes 'Freighter (renamed Varial on 2026-10-29; same product)'."
  - "Dedupe 2026-11-02: no active or resolved skills finding names Freighter or Varial. lumenloop/lumenloop-skills issues 1-5 cover other defects (sk-004, sk-005, sk-007, and two CI items)."
  - "Adjacent sweep 2026-11-02, not part of this finding: stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 skills/dapp/SKILL.md has 13 Freighter mentions and 0 Varial mentions (react.md 4, smart-accounts.md 1). That owner needs its own finding if the rename is to be tracked there."
---

## Finding

Four `lumenloop/lumenloop-skills` playbooks name the Freighter wallet in their stack summaries.
SDF renamed Freighter to Varial on 2026-10-29.
The product source README now opens "Varial (formerly Freighter)".
The old site `www.freighter.app` redirects to `varialwallet.com`.
No playbook names Varial.

An agent that follows these playbooks recommends a wallet under a retired name.
The user then cannot match the advice to the current product page, the store listing, or the
`VarialModule` in Stellar Wallets Kit 2.8.0.

## Evidence

At `lumenloop/lumenloop-skills` commit `a87ca95730d2a4015c884defebd66b44ea01d3b2` (main on 2026-11-02):

- `skills/stellar-project-dossier/SKILL.md` line 36: "JS stellar-sdk + Freighter + Stellar".
- `skills/stellar-ecosystem-digest/SKILL.md` line 34: "Freighter / Stellar Wallets Kit".
- `skills/stellar-builder-quickstart/SKILL.md` line 39: "Freighter, Stellar Wallets Kit, passkeys".
- `skills/stellar-builder-quickstart/SKILL.md` line 134: "(or Freighter directly)".
- `skills/stellar-integration-finder/SKILL.md` line 34: "**Freighter** + **Stellar Wallets Kit**".
- `skills/stellar-integration-finder/SKILL.md` line 149: "JS **stellar-sdk**, **Freighter**, **Stellar Wallets Kit**".

The rename has two independent sources.
The SDF announcement at `https://stellar.org/blog/foundation-news/freighter-is-now-varial` says
"Today, Freighter becomes Varial".
The `stellar/freighter` README says "Varial (formerly Freighter)" and names the SDK `@stellar/varial-sdk`.

## Recommendation

In the six lines above, replace "Freighter" with "Varial (formerly Freighter)".
Use the plain name "Varial" after the first mention in each file.
Where a playbook names a wallet SDK, name `@stellar/varial-sdk`.
Point readers to `https://docs.varialwallet.com` for wallet integration details.
