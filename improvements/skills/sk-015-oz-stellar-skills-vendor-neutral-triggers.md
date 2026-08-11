---
id: sk-015
service: skills
status: reported-upstream
discovered: 2026-08-11
upstreamTitle: Scope generic Stellar triggers to OpenZeppelin-specific skills
evidence:
  - 2026-08-11 setup source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/setup-stellar-contracts/SKILL.md
  - 2026-08-11 upgrade source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/upgrade-stellar-contracts/SKILL.md
  - Both pinned descriptions matched upstream `main` byte for byte on 2026-08-11.
  - `setup-stellar-contracts` triggers include generic installation and project creation.
  - `upgrade-stellar-contracts` includes generic native WASM replacement.
  - A live setup query ranked the OpenZeppelin skill first at 303.
  - A live upgrade query ranked the OpenZeppelin skill first at 262.
  - Solo todo 1438 items 2 and 3, solo://proj/49/scratchpad/independent-holdout--798
  - upstream issue filed 2026-08-11: https://github.com/OpenZeppelin/openzeppelin-skills/issues/14
probe:
  type: http-text
  url: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/setup-stellar-contracts/SKILL.md
  expect:
    status: 200
    contains:
      - "(1) install Stellar CLI and Rust toolchain for Soroban"
---

## Finding

Both skills start with an OpenZeppelin scope. Their trigger lists then claim generic Soroban tasks.

`setup-stellar-contracts` claims Stellar CLI installation and new Soroban project creation.
`upgrade-stellar-contracts` claims native WASM replacement. Neither task requires OpenZeppelin.

These triggers route generic requests to OpenZeppelin-specific playbooks. Two live queries reproduced this result.

## Evidence

Both pinned descriptions matched upstream `main` byte for byte on 2026-08-11.

- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md
- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/upgrade-stellar-contracts/SKILL.md

Raven ran these vendor-neutral queries on 2026-08-11:

| query | top-1 | score | generic Stellar skill |
|---|---|---|---|
| install Stellar CLI and Rust toolchain for Soroban | `openzeppelin-stellar.setup-stellar-contracts` | 303 | not in top 4 |
| how do I upgrade a deployed Soroban contract | `openzeppelin-stellar.upgrade-stellar-contracts` | 262 | `stellar-dev.smart-contracts` at 176 |

Both bodies contain useful prerequisite content. The trigger clauses should claim only the OpenZeppelin path.

## Recommendation

Qualify the generic triggers. Do not remove prerequisite content.

- `setup-stellar-contracts`: limit triggers (1) and (2) to projects that will use OpenZeppelin Contracts for Stellar.
- `upgrade-stellar-contracts`: limit trigger (1) to the OpenZeppelin upgradeable module.

Optionally name the generic Stellar skill as the fallback.
