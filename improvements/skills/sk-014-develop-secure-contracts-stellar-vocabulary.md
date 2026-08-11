---
id: sk-014
service: skills
status: verified
discovered: 2026-08-11
upstreamTitle: develop-secure-contracts claims Stellar support but its trigger list names only Solidity components
evidence:
  - 2026-08-11 pinned body fetch, catalog pin 6f215af60eb60017ab1a933ce9d22a479cd42b26 — https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/develop-secure-contracts/SKILL.md
  - 2026-08-11 upstream `main` recheck — the description on `main` is byte-identical to the pinned copy, so this is current upstream text, not a stale pin
  - the description's component list is ERC20/ERC721/ERC1155, Ownable/AccessControl/AccessManager, Pausable/ReentrancyGuard, Governor, i.e. Solidity names only, while the closing clause claims "Supports Solidity, Cairo, Stylus, Stellar, and Sui Move"
  - the same file's own body gives Stellar different names — "Directory Structure Conventions" maps Stellar to `packages/tokens`, `packages/access`, `packages/governance`, `packages/contract-utils`, `packages/accounts`, and the CLI section names the generator `stellar-fungible`
  - the sibling `setup-stellar-contracts` skill shows the real Stellar import vocabulary — `stellar_tokens::fungible`, `stellar_access::ownable`, `stellar_contract_utils::pausable`, `stellar_macros`
  - the body contains zero occurrences of "audit", "vulnerability", "reentrancy" (outside the description's `ReentrancyGuard` component name), or "review": the skill is library integration, not security analysis
  - 2026-08-11 live Raven ranking counter-evidence, recorded so the finding is not overstated: for "review Soroban contract for security vulnerabilities" this skill ranked 4th (score 87, backfill) behind `skills.stellar-dev.smart-contracts` (132) — the naming risk is reader-facing, not a measured mis-ranking
  - Solo todo 1438 item 1, solo://proj/49/scratchpad/independent-holdout--798
probe:
  type: http-text
  url: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/develop-secure-contracts/SKILL.md
  expect:
    status: 200
    contains:
      - "security primitives (Pausable, ReentrancyGuard)"
---

## Finding

`develop-secure-contracts` declares support for five ecosystems but every component
it names as a trigger is a Solidity name. A Stellar/Soroban developer searching in
their own vocabulary — `stellar-tokens`, `stellar-access`, fungible/non-fungible
token, `#[only_owner]`, `#[when_not_paused]`, SEP-41 — matches nothing in the
description, even though the skill's body covers exactly those components. The
Stellar support claim rests entirely on the word "Stellar" appearing once in a
trailing list.

Separately, the description's framing ("Develop **secure** smart contracts",
"**security** primitives") reads as a security-analysis scope that the body does not
have: there is no vulnerability-class, audit, or review content anywhere in the file.
The skill's actual and stated methodology is library-first integration. Raven's own
ranking does not currently mis-route security queries to it, so this half is a
scope-clarity ask rather than a demonstrated routing failure.

## Evidence

Fetched 2026-08-11 from the pinned commit and re-checked against upstream `main`;
the description is identical in both, so the gap is live.

- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/develop-secure-contracts/SKILL.md
- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md
- https://github.com/OpenZeppelin/stellar-contracts

The body's own per-ecosystem table and CLI section are the counter-example to its
description: they name Stellar components correctly, so the omission is in the
trigger text only.

## Recommendation

Two small description edits, no body change:

1. Name the non-Solidity component vocabulary in the trigger list, or mark the
   existing names as the Solidity spelling and give the Stellar equivalents
   (`stellar-tokens` fungible/non-fungible, `stellar-access` ownable/access control,
   `stellar-contract-utils` pausable, `stellar-governance`, `stellar-accounts`).
   The body already holds this mapping, so nothing new has to be researched.
2. State the scope in one clause — library-component integration, not security
   review or auditing — so the "secure"/"security primitives" wording is not read as
   a claim to own vulnerability analysis.

The skill already cross-references a sibling for the Sui setup path in its
"Directory Structure Conventions" section, so a scope sentence of this shape is
consistent with the file's existing conventions.
