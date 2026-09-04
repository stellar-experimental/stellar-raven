---
id: sk-022
service: skills
status: verified
discovered: 2026-09-04
upstreamTitle: OpenZeppelin upgrade skill teaches retired derive APIs as current
evidence:
  - 2026-09-04 live read of https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/upgrade-stellar-contracts/SKILL.md recommends #[derive(Upgradeable)] and UpgradeableMigratable
  - 2026-09-04 live read of https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable requires direct Upgradeable trait implementation and says there is no Migratable Trait
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-soroban-oz-upgradeable-macro received the stale derive API from the indexed skill and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
---

## Finding

The current OpenZeppelin upgrade skill teaches `#[derive(Upgradeable)]` and `UpgradeableMigratable`.
The current OpenZeppelin Stellar Contracts documentation requires direct `Upgradeable` trait implementation.

The official documentation also states that there is no Migratable Trait.
The skill therefore teaches retired APIs as current.

## Evidence

On 2026-09-04, the skill recommended both derive macros.
The current package documentation defines an `Upgradeable` trait and `UpgradeableClient`.
It instructs implementors to use `#[contractimpl]` with the trait.

The documentation describes explicit migration patterns instead of `UpgradeableMigratable`.
The candidate answer repeated the obsolete API names.

## Recommendation

Replace the derive-macro and `UpgradeableMigratable` guidance with the documented `Upgradeable` trait flow.
Link the current upgradeable documentation for migration patterns.
State that migration requires an explicit pattern or an auxiliary Upgrader contract.
