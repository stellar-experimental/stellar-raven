---
id: sk-015
service: skills
status: verified
discovered: 2026-08-11
upstreamTitle: setup-stellar-contracts and upgrade-stellar-contracts list vendor-neutral triggers for vendor-scoped skills
evidence:
  - 2026-08-11 pinned body fetches, catalog pin 6f215af60eb60017ab1a933ce9d22a479cd42b26 — https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/setup-stellar-contracts/SKILL.md and .../upgrade-stellar-contracts/SKILL.md
  - 2026-08-11 upstream `main` recheck — both descriptions are byte-identical to the pinned copies, so this is current upstream text
  - `setup-stellar-contracts` trigger (1) is "install Stellar CLI and Rust toolchain for Soroban" and trigger (2) is "create a new Soroban project" — neither mentions OpenZeppelin
  - `upgrade-stellar-contracts` trigger (1) is "make Soroban contracts upgradeable via native WASM replacement" — the native Soroban mechanism, not the OpenZeppelin module the leading sentence scopes the skill to
  - 2026-08-11 live Raven probe, query "install Stellar CLI and Rust toolchain for Soroban" (no vendor term) — `skills.openzeppelin-stellar.setup-stellar-contracts` top-1 at score 303, gated; `skills.stellar-dev.smart-contracts` absent from the top 4 despite owning a `project-setup` section
  - 2026-08-11 live Raven probe, query "how do I upgrade a deployed Soroban contract" (no vendor term) — `skills.openzeppelin-stellar.upgrade-stellar-contracts` top-1 at score 262, gated, above `skills.stellar-dev.smart-contracts` at 176
  - Solo todo 1438 items 2 and 3, solo://proj/49/scratchpad/independent-holdout--798
probe:
  type: http-text
  url: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/setup-stellar-contracts/SKILL.md
  expect:
    status: 200
    contains:
      - "(1) install Stellar CLI and Rust toolchain for Soroban"
---

## Finding

Both OpenZeppelin Stellar skills open by scoping themselves to OpenZeppelin
("with OpenZeppelin Contracts for Stellar", "using OpenZeppelin's upgradeable
module") and then enumerate triggers that describe vendor-neutral Soroban tasks.
`setup-stellar-contracts` claims installing the Stellar CLI and Rust toolchain and
creating a new Soroban project; `upgrade-stellar-contracts` claims making a contract
upgradeable via native WASM replacement — which is the platform's own mechanism,
available to projects that never depend on OpenZeppelin.

The consequence is that a developer who has not chosen OpenZeppelin is routed into a
vendor-specific playbook for a generic task. This reproduces live: two vendor-neutral
queries, both lifted from the skills' own trigger wording, take these skills to
top-1 above the vendor-neutral Stellar skill.

This is one defect in two sibling files with one fix, so it is recorded once rather
than split; the two skills are also the only pair where the pattern reproduces.

## Evidence

Fetched 2026-08-11 from the pinned commit and re-checked against upstream `main`.

- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md
- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/upgrade-stellar-contracts/SKILL.md

Live ranking probes against the deployed Raven catalog, 2026-08-11 (skill-only,
vendor-neutral queries):

| query | top-1 | score | generic Stellar skill |
|---|---|---|---|
| install Stellar CLI and Rust toolchain for Soroban | `openzeppelin-stellar.setup-stellar-contracts` | 303 | not in top 4 |
| how do I upgrade a deployed Soroban contract | `openzeppelin-stellar.upgrade-stellar-contracts` | 262 | `stellar-dev.smart-contracts` at 176 |

The body content is not the problem — both skills legitimately contain the generic
prerequisite material. The problem is that the trigger clauses claim the generic task
rather than the vendor path through it.

## Recommendation

Qualify the two trigger clauses so the vendor scope carries into them, without
removing any body content:

- `setup-stellar-contracts`: scope triggers (1) and (2) to setting up a project that
  will use OpenZeppelin Contracts for Stellar — e.g. "install the Stellar CLI and Rust
  toolchain **as prerequisites for an OpenZeppelin Stellar project**".
- `upgrade-stellar-contracts`: scope trigger (1) to the OpenZeppelin upgradeable
  module rather than to native WASM replacement in general, since triggers (2)–(5)
  already are vendor-specific and (1) is the only vendor-neutral one.

Optionally name the vendor-neutral fallback in the body, as the develop skill already
does for the Sui setup path.
