# Upstream Skill Findings: Terra

Date: 2026-09-04

## Scope and verdict

I reviewed the root candidate report at:

`/Users/kalepail/Desktop/stellar-raven-codemode/.agents/rounds/2026-09-03-truth-maintenance/candidate-row-review-skills-none-fable.md`

I verified the candidate artifact at:

`/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`

Its SHA-256 is `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`.

I verified three current, distinct upstream defects.
The parallel Docs lane owns the permanent `sk-022` record.
Its root commit is `c9a4afa`.
This branch creates only `sk-023` and `sk-024`.
I did not file an external issue.

## Duplicate check

I searched active findings and `improvements/resolved.json` before authoring.

- `sk-015` covers generic OpenZeppelin trigger scope. It does not cover retired APIs.
- `sk-012` covers the retired MPP Channel mode name.
- `sk-016` covers MPP discovery support.
- `sd-039` covers a separate Stellar Docs relayer concern.

No active or resolved finding duplicated the three candidate defects.
The parallel Docs lane later created `sk-022` for the OpenZeppelin defect.
This branch retains independent `sk-022` verification only in this report.
The branch creates the next remaining IDs: `sk-023` and `sk-024`.

## Verified findings

### Independent sk-022 verification: retired OpenZeppelin upgrade APIs

The parallel Docs lane owns the permanent record:
`improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md`.

This branch does not create another `sk-022` record.

Current OpenZeppelin skills commit: `6f215af60eb60017ab1a933ce9d22a479cd42b26`.

- https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/upgrade-stellar-contracts/SKILL.md
  SHA-256: `80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71`.
- https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/6f215af60eb60017ab1a933ce9d22a479cd42b26/skills/setup-stellar-contracts/SKILL.md
  SHA-256: `86ab688baf8d47e06945c13a956fd2d4a4d8ca92474b1767d053fca575c0eb44`.
- https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable
  SHA-256: `55a9d1f04749cb3af95eca77d659b8ddcdd0bb276be63a8e4acefa639ebaaeb0`.

The current skill teaches `#[derive(Upgradeable)]` and `#[derive(UpgradeableMigratable)]`.
It also teaches retired internal traits.
The current contract implementation commit is `9c5e279aa7efabf94ef84fdef29497ff13656e9d`.
It provides `Upgradeable` and explains why no `Migratable` trait exists.

### sk-023: MPP protocol identity

Current stellar-dev skill commit: `790f607b451372495c94c76ec15a520e5e9b8d66`.

- https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/mpp.md
  SHA-256: `14214c9ae7e1e61a3f00c0df50a7d40fcd323997aa06399bf36613c2e39d279d`.
- https://mpp.dev/overview
  SHA-256: `39c571e5ff17b80020b09726305c463d8b0e3d1c3db9f45ac807285d14b90dd4`.
- https://mpp.dev/protocol
  SHA-256: `a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d`.
- https://developers.stellar.org/docs/build/agentic-payments/mpp
  SHA-256: `9056df9951a1624ce5e2c6a3b7f431d0a6d9d6c252da4eafd3ce5134c9e182f7`.

The current guide calls MPP a Stellar-native stack.
It does not state that MPP has payment-method layers for different networks.
The MPP protocol source and Stellar documentation establish that distinction.

### sk-024: x402 facilitator and key scope

- https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/SKILL.md
  SHA-256: `2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570`.
- https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/x402.md
  SHA-256: `5b07269ec626abede4020525e744a1285e3aad23bf3aa3de8ca0b10523eff950`.
- https://docs.x402.org/dev-tools/facilitators.md
  SHA-256: `aceb37a8ad4115c53f71925c74cb8939c39cbee5480fda1ab192b4032fda1be5`.
- https://docs.x402.org/faq.md
  SHA-256: `bd0e91764248524790646704746402d1a18f8423b2cc3a9d4ac3463698fd2013`.

The root table states that x402 needs OZ Channels.
The shared setup says x402 needs an OZ key.
The detailed page does not first limit those statements to its OZ example.
The x402 primary pages describe self-operation, multiple providers, a public Stellar option, and a provider with no key requirement.

## Non-finding

I selected the dapp Freighter sample as the required single-case check.

The sample records the wallet network.
Its production checklist already requires a loading state, mismatch handling, and double-submit prevention.
The candidate answer failure does not prove a current skill defect.
I created no dapp finding.

I created no Golden change.
The candidate artifact is measurement evidence, not sufficient source evidence for a Golden change.

## Commands

I ran these read-only verification commands before authoring:

```text
git status --short
git branch --show-current
rg -n -i 'derive\\(Upgradeable\\)|UpgradeableMigratable|UpgradeableInternal|Migratable' <fetched OpenZeppelin sources>
rg -n -i 'MPP|Channels|facilitator|API.?key|OZ_API_KEY' improvements/skills/*.md improvements/resolved.json
shasum -a 256 <candidate artifact and fetched sources>
parallel-cli search --query <MPP and x402 primary-source queries>
curl -fsSL <primary-source URLs>
```

## Verification

These commands passed after authoring:

```text
npm run improvements:index
npm run improvements:lint
npm run improvements:probes
npm test -- test/improvements-lint.test.ts test/improvements-writes.test.mjs test/improvements-run-probes.test.ts test/improvements-file-issue.test.ts
npm run secrets:scan -- --tree
git diff --check
```

Before collision reconciliation, `improvements:index` wrote an index with 67 findings.
Before collision reconciliation, `improvements:lint` passed with 67 findings.
After reconciliation, `improvements:index` wrote an index with 66 findings.
After reconciliation, `improvements:lint` passed with 66 findings.
The focused test run passed 4 files and 36 tests.
The secrets scan found no leak.
The prior probe run reported `sk-022`, `sk-023`, and `sk-024` as recurring.
It reported seven recurring findings, two credential-gated inconclusive probes, and no probe error.

I also ran `npm run improvements:lint -- --live`.
The command did not complete before the execution environment stopped its 30-second window.
I directly checked every ten `improvements/intake.json` GitHub repository target with `gh api --method HEAD --include /repos/<owner>/<repo>`.
All ten returned HTTP 200.

## Limitations

The fetched pages can change after this check.
The findings record source URLs, revisions where available, and response hashes.
I did not make a paid model call.
I did not start a QA arm.
The full live lint result remains unavailable because the execution window stopped the command.
