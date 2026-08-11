---
id: sk-014
service: skills
status: reported-upstream
discovered: 2026-08-11
upstreamTitle: develop-secure-contracts omits Stellar terms and overstates its security scope
evidence:
  - 2026-08-11 pinned source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/develop-secure-contracts/SKILL.md
  - The pinned description matched upstream `main` byte for byte on 2026-08-11.
  - The trigger list names only Solidity components.
  - The body uses separate Stellar terms and package names.
  - The body does not cover audits or vulnerability review.
  - A live security query ranked `stellar-dev.smart-contracts` first. `develop-secure-contracts` ranked fourth.
  - Solo todo 1438 item 1, solo://proj/49/scratchpad/independent-holdout--798
  - upstream issue filed 2026-08-11: https://github.com/OpenZeppelin/openzeppelin-skills/issues/13
probe:
  type: http-text
  url: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/develop-secure-contracts/SKILL.md
  expect:
    status: 200
    contains:
      - "security primitives (Pausable, ReentrancyGuard)"
---

## Finding

`develop-secure-contracts` says it supports Stellar. Its trigger list names only Solidity components.
It omits the Stellar terms that its body uses.

The title and description also imply security review. The body covers library integration instead.
It does not cover audits or vulnerability review.

Raven did not reproduce a security-query routing failure. This request asks for clearer scope.

## Evidence

The pinned description matched upstream `main` byte for byte on 2026-08-11.

- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/develop-secure-contracts/SKILL.md
- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md
- https://github.com/OpenZeppelin/stellar-contracts

The body names these Stellar terms:

- `stellar-tokens`
- `stellar-access`
- `stellar-contract-utils`
- `stellar-governance`
- `stellar-accounts`
- `stellar-fungible`

This evidence isolates the defect to the description.

## Recommendation

Make two small description changes. Do not change the body.

1. Add the Stellar component terms from the body to the trigger list.
2. State that the skill covers library integration. State that it does not cover audits or security review.
