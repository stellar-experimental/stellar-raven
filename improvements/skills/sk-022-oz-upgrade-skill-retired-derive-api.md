---
id: sk-022
service: skills
status: verified
discovered: 2026-09-04
upstreamTitle: OpenZeppelin upgrade skill teaches retired derive APIs as current
evidence:
  - 2026-09-04 source read of https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/upgrade-stellar-contracts/SKILL.md; SHA-256 80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71. Commit 6f215af is the current main head and the pin in ecosystem-skills/MANIFEST.json. The file recommends #[derive(Upgradeable)] and #[derive(UpgradeableMigratable)] and the UpgradeableInternal and UpgradeableMigratableInternal traits.
  - 2026-09-04 live read of https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable; SHA-256 55a9d1f04749cb3af95eca77d659b8ddcdd0bb276be63a8e4acefa639ebaaeb0. The page defines the Upgradeable trait and UpgradeableClient, says to implement the trait directly with #[contractimpl], and has a section titled "Why There Is No Migratable Trait".
  - 2026-09-04 source read of https://github.com/OpenZeppelin/stellar-contracts/commit/e7722e4923accfd754991a56b3226e0a834c27a1 (pull request 585, merged 2026-02-26) removed the derive macros and the internal traits. packages/macros/src/lib.rs at tag v0.6.0 (2026-01-09) still defines them; the same file at tag v0.7.0 (2026-04-03) does not.
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-soroban-oz-upgradeable-macro read the skill at pin 6f215af through codemode.skill.read, repeated the derive macros as the current API, and received a wrong verdict. The artifact is a stopped mixed-upstream diagnostic; the skill source is unaffected by that stop.
  - eval/qa/corpus/battery/soroban/q-soroban-oz-upgradeable-macro.json already lists the retired derives as an avoid trap after its 2026-08-27 live re-check; no golden change is needed.
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
probe:
  type: http-text
  url: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/upgrade-stellar-contracts/SKILL.md
  expect:
    status: 200
    contains:
      - "#[derive(UpgradeableMigratable)]"
---

## Finding

The `upgrade-stellar-contracts` skill teaches `#[derive(Upgradeable)]`, `#[derive(UpgradeableMigratable)]`,
`UpgradeableInternal`, and `UpgradeableMigratableInternal` as the current OpenZeppelin API.

OpenZeppelin Stellar Contracts removed those derive macros and internal traits on 2026-02-26 in pull request 585.
The `packages/macros` crate at v0.6.0 still defines them. The crate at v0.7.0 and later does not.
The current release line ships only the `Upgradeable` trait, its `UpgradeableClient`, and free helper functions.

The current documentation instructs implementors to implement `Upgradeable` directly with `#[contractimpl]`.
It also states that there is no Migratable trait.
The skill therefore teaches retired APIs as current.

## Evidence

On 2026-09-04, the skill at commit 6f215af recommended both derive macros as "the recommended way".
The derive claim appears in seven places: the description item (2), the module component table,
"Upgrade only", "Upgrade and migrate", "Access Control", "Version tracking", and the last testing checklist item.

The current package documentation defines an `Upgradeable` trait and `UpgradeableClient`.
It instructs implementors to use `#[contractimpl]` with the trait and to call `upgradeable::upgrade()`.
It describes eager, lazy, and atomic migration patterns instead of `UpgradeableMigratable`.

The removal commit is dated 2026-02-26. The skill file last changed on 2026-03-04.
The candidate answer read the pinned skill and repeated the obsolete API names.

## Recommendation

Replace the derive-macro and internal-trait guidance with the documented `Upgradeable` trait flow.
Show `impl Upgradeable for Contract` with `#[contractimpl]` and a call to `upgradeable::upgrade()`.
Remove `UpgradeableMigratable`, `UpgradeableInternal`, and `UpgradeableMigratableInternal`.

Keep the `Upgrader` example. It already uses `UpgradeableClient`.
Describe migration as the documented explicit patterns and link the current upgradeable page.
State that atomic upgrade-and-migrate requires an auxiliary `Upgrader` contract.

Update every location that repeats the derive claim, including the description item (2).
Re-verify the SEP-49 version-metadata claim against the current crate, because the skill attributes it to the removed macros.
`sk-015` already asks for a description change in its open issue; one description edit can serve both findings.
