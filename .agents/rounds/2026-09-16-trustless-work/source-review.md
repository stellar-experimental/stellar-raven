# Trustless Work source and implementation review

Date: `2026-09-16`

Reviewer: Grok 4.6 high.

Author: Sol high.

Orchestrator: Astra.

The reviewer differs from the author and orchestrator.

Fixed point: accepted main `a83b3c5943b27f585ab4caafe264518e09ab236a`.

Candidate merge parent: `b447ff403f82734a0297b56c78a1a5515aa1f824`.

Durable review record: `.agents/rounds/2026-09-16-trustless-work/independent-review.md`.

Review source SHA-256: `918ef54c32b22ecdb0ac2762aaf3a22f6f5c18f61d29dfc95f823247268a9464`.

## Verdict

The independent reviewer accepted the Trustless Work source pin and implementation.

The same review accepted activation of the unchanged PR164 gospel in this candidate.

The review does not accept new routing thresholds.

Scout remains at OpenAPI `1.9.1`. The separate Scout `1.9.52` candidate is outside this review.

## Accepted source

| Field | Accepted value |
| --- | --- |
| Source | `trustless-work` |
| Repository | `Trustless-Work/trustlesswork-skill` |
| Commit | `634f32bd4be6769b0cae52e72db4899d5f5a069c` |
| Selection | `sel:7c6d71f8eef2` |
| Selected files | `22` |
| Skill ID | `skills.trustless-work.trustless-work-dev` |
| Main body blob | `c95f53e79a513dd3efb74badc70c3477d11ea052` |
| Main body SHA-256 | `02640920a2bf6e3325b6232b1ea80890d02e1ad420ccdcad370ccbf5f2f99476` |

The four existing source selections remain unchanged.

The reviewer accepted the source boundaries, hashes, external links, and authentication scope.

The selected bodies contain no literal credential or instruction override.

They contain no retired skill or non-exposed Raven operation reference.

The host description does not modify the pinned bodies. Existing exposure scrubbing still applies during reads.

The beta authentication conflict remains recorded in `improvements/skills/sk-025-trustless-work-beta-auth-scope.md`.

## Accepted implementation

The shared YAML parser handles `>`, `>-`, and `>+` folded scalars.

The shared source selector rejects root Markdown files during directory selection.

The exact-ID host description limits discovery text to Trustless Work escrow integration.

The whole-skill admission helper applies only after lexical scoring. It applies only to whole skills.

The helper preserves exact identity, aliases, slug evidence, description evidence, and published short codes.

It matches `DeFi` and `defi` through one case-folded whole-code form.

It matches conservative trailing-`s` pairs, including `passkey` and `passkeys`.

It does not match slug `dev` to query token `development`.

The implementation does not edit `src/catalog/scoring.ts` or the vendored scorer.

It adds no ID rename, query exception, label change, or numerical threshold change.

## Full routing reconciliation

The normal ranked dump contains `495` rows. The holdout lane contains another `49` rows.

The full comparison covers `544` rows. It has `15` ordered-ID movements.

Fourteen movements occur in the normal dump. One movement occurs in the holdout lane.

| Case | Removed | Added |
| --- | --- | --- |
| `q-defi-defindex-honest` | `skills.lumenloop.stellar-ecosystem-scout` | `scout.getClusters` |
| `q-edge-noinfo-sep-9999` | `skills.lumenloop.scf-submission-radar` | `stellarDocs.search_wallet_dapp_docs` |
| `q-org-sdf-enterprise-fund` | `skills.lumenloop.scf-submission-radar` | `scout.getRfps` |
| `q-pc-account-merge-reclaim-reserve` | `skills.lumenloop.stellar-integration-finder`, `skills.lumenloop.stellar-content-auditor` | `scout.hackathonBrief`, `scout.vetIdea` |
| `q-pc-practical-fee-setting` | `skills.lumenloop.scf-submission-radar`, `skills.lumenloop.stellar-integration-finder` | `scout.vetIdea`, `stellarDocs.search_docs` |
| `q-sep-31-cross-border` | `skills.openzeppelin-stellar.upgrade-stellar-contracts` | `stellarDocs.search_protocol_concepts_docs` |
| `q-sep-43-web-wallet-api` | `skills.lumenloop.scf-submission-radar`, `skills.lumenloop.stellar-ecosystem-digest` | `scout.getClusters`, `stellarDocs.search_wallet_dapp_docs` |
| `q-sep-53-sign-verify-message` | `skills.lumenloop.scf-submission-radar`, `skills.lumenloop.stellar-ecosystem-digest` | `skills.stellar-dev.standards`, `stellarDocs.search_asset_token_docs` |
| `q-sep-6-24-deprecation` | `skills.lumenloop.stellar-ecosystem-digest` | `scout.getClusters` |
| `q-sor-contract-as-claimable-arbiter` | `skills.lumenloop.stellar-content-auditor` | `lumenloop.find_content_about_project` |
| `q-soroban-sdk-cve` | `skills.lumenloop.stellar-ecosystem-digest`, `skills.lumenloop.scf-submission-radar` | `skills.stellar-light.stellar-scout`, `skills.openzeppelin-stellar.upgrade-stellar-contracts` |
| `q-soroban-storage-types` | `skills.lumenloop.stellar-ecosystem-digest` | `skills.stellar-dev.cross-chain` |
| `q-soroban-vuln-classes` | `skills.lumenloop.scf-submission-radar` | `scout.getPartners` |
| `q-soroban-zk-bn254-poseidon` | `skills.lumenloop.stellar-integration-finder` | `lumenloop.search_content_semantic` |
| `q-holdout-b-03-clawback-stablecoin` | `skills.openzeppelin-stellar.setup-stellar-contracts` | `skills.stellar-dev.assets` |

No movement adds Trustless Work to an unrelated query.

The reviewer accepted all movements. The review did not tune the holdout lane.

The reconstructed `495`-row dump has this SHA-256:

`4e2ece4a33fd1d35706dd5ace182536a5496649820be58eae72669da7d1a1765`

## Routing measurements

| Lane | Current top-1/top-3/top-5 | Committed accepted totals |
| --- | --- | --- |
| Legacy | `213/280/314` | `213/279/312` |
| Extended | `90/111/116` | Not a committed gate field |
| Skills | `16/23/23` | `16/23/23` |
| Holdout | `10/22/27` | `10/22/26` |

The holdout run has `11` forbidden captures. The committed maximum is also `11`.

The current measurements meet or exceed all committed numerical baselines.

The catalog file SHA-256 is:

`0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869`

## Verification

The following checks passed on the integrated tree:

- Typecheck.
- `2,087` unit tests across `117` files.
- Worker dry-run build.
- `94` smoke tests across `5` files.
- QA registry generation check.
- Improvements lint.
- Pin digest check.
- Pinned mirror verification.
- Secret scan.
- Diff whitespace checks.

The final QA lifecycle and coverage lint passes with `501` active cases and `0` proposed cases.

The routing gate passed after the accepted catalog fingerprint was recorded.

The protocol-history run at `2026-09-16T20:22:56Z` scored no questions.

Both protocol-history contracts reported `source-expired (manifest-sha256)`.

The protocol-history log SHA-256 is `8cf4898084f36622bdcb0c5054a282a45cffe738daa329bd6784525b82e01de8`.

This state is expected under `.agents/TODO.md` lines 191-196. The lane remains diagnostic-only.

## Boundaries

The golden case is `active` with `reviewState: none`.

Its activation records `Sol high` as author and `Grok high` as reviewer.

The activation ledger is `.agents/rounds/2026-09-16-trustless-work-acceptance.md`.

The independent review is `.agents/rounds/2026-09-16-trustless-work/independent-review.md`.

This review authorizes no deployment, push, merge, issue closure, or paid evaluation.

The Blocks UI references vendor package installation and execution. This remains the recorded supply-chain boundary.
