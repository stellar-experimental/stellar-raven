---
id: sk-031
service: skills
status: verified
discovered: 2026-11-02
upstreamTitle: skills.stellar.org still serves the removed soroban skill, with the stale wasm32-unknown-unknown build target
evidence:
  - "2026-11-02T17:18:43Z F: https://skills.stellar.org/skills/soroban/SKILL.md returned HTTP 200 (71331 bytes; frontmatter 'name: soroban'). The file has 12 lines with wasm32-unknown-unknown, for example line 151 '--wasm target/wasm32-unknown-unknown/release/my_contract.wasm'. https://skills.stellar.org/skills/smart-contracts/SKILL.md returned 200 with 4 wasm32v1-none lines and 0 wasm32-unknown-unknown lines."
  - "2026-11-02 F: the https://skills.stellar.org/ index links skills/smart-contracts/SKILL.md and does not link skills/soroban/SKILL.md."
  - "2026-11-02 B: stellar/stellar-dev-skill main has no skills/soroban directory; its skills/ entries are agentic-payments, assets, cross-chain, dapp, data, smart-contracts, standards, zk-proofs. Commit 5907afc601 (2026-06-29, 'Split soroban skill, rebrand prose, add concrete ZK toolchain walkthroughs (#32)') is the last commit on skills/soroban."
  - "2026-11-02 B: the gh-pages branch (GitHub Pages source, cname skills.stellar.org) still contains skills/soroban/SKILL.md. Its last gh-pages commit is 5c6c26a24c (2026-06-11T15:57:47Z, 'deploy: main @ 6956c5f30384424723678ce77f6255f76ec00080'). The gh-pages head is c8f8523429 (2026-10-31)."
  - "2026-11-02 B: .github/workflows/deploy-pages.yml publishes with peaceiris/actions-gh-pages and 'keep_files: true', with the comment 'Don't wipe pr/<N>/ subdirectories owned by preview-pr.yml.' keep_files also keeps files that main no longer builds, so the removed skill stays published."
  - "Resolved predecessor sk-001 (receipt in improvements/resolved.json, stellar/stellar-dev-skill issue 44 and PR 45) replaced wasm32-unknown-unknown with wasm32v1-none in the live skill. The orphaned file predates that fix and still serves the old target."
  - "Consumer path: the Stellar-Light/stellar-scout skill at 9f77b3f9433be8b57b2b78a7c14b94855779f4fe names 'soroban' as an SDF skill and builds install URLs as https://skills.stellar.org/skills/{name}/SKILL.md (sk-027, references/api-reference.md line 203). An agent that follows it gets HTTP 200 and the stale skill instead of a 404. Golden case q-tool-skill-detail-install (golden audit 2026-11-02, batch tooling-infra-06) records this file."
  - "Dedupe 2026-11-02: no active or resolved finding covers the orphaned file; sk-027 recorded it only as context for the Scout skill. A search of stellar/stellar-dev-skill issues and PRs for soroban, gh-pages, legacy, and orphan found no report."
---

## Finding

`https://skills.stellar.org/skills/soroban/SKILL.md` returns HTTP 200.
The source repository removed the `soroban` skill on 2026-06-29 and replaced it with `smart-contracts`.
The site index does not list `soroban`.
The orphaned file is the 2026-06-11 deploy, and it teaches the old build target
`wasm32-unknown-unknown` on 12 lines.
The current `smart-contracts` skill uses `wasm32v1-none`.

An agent or a user that requests the old slug gets the stale skill and no error.
The Scout skill still names `soroban` and builds this exact URL, so the path is live.

## Evidence

On 2026-11-02 the `gh-pages` branch of `stellar/stellar-dev-skill` still holds `skills/soroban/SKILL.md`.
The `main` branch has no `skills/soroban` directory.
The deploy workflow `.github/workflows/deploy-pages.yml` publishes with
`peaceiris/actions-gh-pages` and `keep_files: true`.
That setting keeps PR preview folders, but it also keeps every file that `main` no longer builds.

Line 151 of the orphaned file reads `--wasm target/wasm32-unknown-unknown/release/my_contract.wasm`.
The live `smart-contracts` skill has 4 `wasm32v1-none` lines and no `wasm32-unknown-unknown` line.

## Recommendation

Delete `skills/soroban/` from the `gh-pages` branch.
Alternatively, publish a short `skills/soroban/SKILL.md` that points to `skills/smart-contracts/SKILL.md`.
To stop the same drift for later removals, make the main deploy remove files outside `pr/`.
One way is to restore `pr/` into `site/out` before the publish step and set `keep_files: false`.
