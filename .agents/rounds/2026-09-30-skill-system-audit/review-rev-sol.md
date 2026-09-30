## Verdict

**accept with fixes** — The count fixes and golden refresh are correct, but the admission procedure and existing safeguards need corrections.

Reviewer: `rev-sol`, independent code-versus-docs and missed-work lane.
Review date: `2026-09-30`.
Reviewed commit: `f65e165db4d579042d756a9c07a6a22b17e11347`; base: `605c1558`.
The review also examined current upstream sources and current local files.

## Findings

### 1. should-fix — The admission rule conflicts with accepted reference content

**Location:** `ecosystem-skills/README.md:182`.

The new rule excludes or scrubs instructions that need credentials or writes.
The accepted skills still teach those procedures as reference content.
The rule does not clearly distinguish reference procedures from operations inside Raven's sandbox.

**Evidence:** The pinned Trustless Work `SKILL.md:11`, `:76`, and `:129` contain network requirements, API-key headers, and transaction submission instructions.
[The pinned body](https://github.com/Trustless-Work/trustlesswork-skill/blob/80e2467f34041b9f70e66d6c2f567fc76ba9b1bb/trustless-work-dev/SKILL.md) returned HTTP `200`.
[The pinned SDF smart-contracts skill](https://github.com/stellar/stellar-dev-skill/blob/65375fd2b2582af27fd267f912e8c6d01752120d/skills/smart-contracts/SKILL.md) also teaches funding and deployment at lines `169`–`175`.
`src/skills/scrub.ts:165` removes excluded references, rather than all credential or write instructions.
`scripts/build-catalog.mjs:871` applies this scrub to skill bodies.
The Trustless Work source review retained the vendor installation and execution boundary.
See `.agents/rounds/2026-09-16-trustless-work/source-review.md:168`.

**Exact fix:** Allow build and integration procedures as reference content.
State that these procedures grant no sandbox network access or authorization for credentials, payments, signing, or writes.
Require host approval controls for added callable operations.
If the owner intends stricter content rules, record that decision and review all current exposed skills.

### 2. should-fix — New cherry-picked sources can bypass omitted-directory checks

**Locations:** `ecosystem-skills/README.md:189`, `:194`; `scripts/check-skills-drift.mjs:115`.

The admission procedure allows a pick list but omits `unpinnedUpstream` decisions.
The checker identifies cherry-picked sources through a nonempty exclusion table.
Without that table, it skips directory classification.
A new sibling can remain unclassified after repeated re-pins.

**Evidence:** `unclassifiedSkillDirs` returns `[]` when `excluded.size === 0`.
`ecosystem-skills/groups.json` records exclusions for OpenZeppelin and Trustless Work.
Trustless Work excludes `scripts` and `.github`.
The README at lines `72`–`74` also describes an older implementation.
The current checker lists only unclassified directories and checks them even when the commit remains current.
See `scripts/check-skills-drift.mjs:128` and `:142`.

**Exact fix:** Add explicit exclusion decisions for every cherry-picked directory source.
Correct the README's description.
Represent selection mode explicitly instead of inferring it from a nonempty exclusion table.
Test a cherry-picked source with no exclusions and one new upstream sibling.

### 3. should-fix — The admission procedure offers insufficient coverage and omits necessary gates

**Locations:** `ecosystem-skills/README.md:197`, `:199`, `:201`.

One routing case for a source does not satisfy QA coverage for its exposed skills.
The procedure puts coverage creation after its rebuild-and-gate step.
Its linked Step 1 contains generation commands, rather than complete acceptance gates.
Its reviewer requirement omits independence from the orchestrator.

**Evidence:** `eval/qa/lint-corpus.mjs:627` requires active battery coverage for each exposed skill.
A routing-only case contributes no battery coverage.
`.agents/skills/golden-truth/SKILL.md:224` requires a committed proposal before activation in a later commit.
The Trustless Work review records this sequence at `independent-review.md:26`.
It records the required catalog fingerprint change at `independent-review.md:28`.
`.agents/rounds/2026-09-16-trustless-work-acceptance.md:45` records gate success after that change.
`.agents/skills/live-drift-resolution/SKILL.md:58`–`68` lists builders and pin verification only.
`AGENTS.md:86` requires independence from both the author and the orchestrator.

**Exact fix:** Require active QA coverage for every new exposed skill before final gates.
Document proposal, independent activation review, activation, and corpus regeneration.
Keep routing cases as additional coverage.
Require routing comparison and an accepted catalog fingerprint decision before the final routing gate.
Link complete verification and deployment steps.
Require independence from both the author and the orchestrator.

### 4. should-fix — The complete-refresh claim exceeds validation and swap guarantees

**Locations:** `ecosystem-skills/README.md:79`, `:98`; `ecosystem-skills/update.sh:105`, `:212`.

The README promises unchanged pins after failed refreshes and no partial pin set.
The selector accepts incomplete trees and missing selected directories.
The script marks these results complete.
It replaces both data files before building the index.
An index failure leaves changed pins and an older index.
Two separate `mv` commands do not form one atomic transaction.

**Evidence:** Memory-only selector probes returned success:

```js
selectGitHubSkillFiles({ tree: [] }, {
  sourcePath: ".", picks: ["trustless-work-dev"]
}) // []

selectGitHubSkillFiles({ truncated: true, tree: [
  { type: "blob", path: "skills/a/SKILL.md", size: 1, sha: "a".repeat(40) }
] }, { sourcePath: "skills" }) // selects a/SKILL.md
```

See `scripts/lib/skill-source-selection.mjs:7` and `:42`.
An in-memory run of the actual mirror-check functions accepted an added source with `skills: []`.
Observed output: `offline mirror failures after adding empty source []`.
`scripts/check-mirrors.mjs:64` accepts an empty source.
`ecosystem-skills/update.sh:212` and `:213` replace the data files.
Line `225` then runs the index builder.
The builder can fail during description-override validation or upstream fetching.
See `ecosystem-skills/build-index.mjs:49` and `:61`.

**Exact fix:** Reject malformed or truncated trees, missing selections, and missing `SKILL.md` files before replacement.
Require an explicit removal decision when a selected skill disappears.
Reject empty sources in the mirror checker.
Stage and validate the index before replacement.
Implement rollback or narrow the atomicity claim to individual files.
Test each failure condition.

### 5. should-fix — The pin-review digest omits upstream-location fields

**Location:** `scripts/check-pin-review.mjs:46`.

The digest omits the repository owner, repository name, and source path.
Those fields change transport URLs.
The gate can accept a source-location change without a new review entry.
This defect predates PR #183.

**Evidence:** `scripts/lib/skill-mirror.mjs:40` and `:47` use these fields.
I evaluated the checker's actual projection against the current Trustless Work source in memory.
Changing its owner, repository, and path preserved `sel:05e2eb56866c`, while changing the transport URL.
`scripts/check-pin-review.mjs:116` detects changes through this digest only.
Runtime hash verification still rejects bytes that differ from compiled hashes.
This finding concerns review coverage and provenance.

**Exact fix:** Include `type`, `owner`, `repo`, and `path` in the canonical selection projection.
Include independently used provenance URLs, or derive them from canonical fields.
Test that a location-only change requires a new attestation.

### 6. should-fix — The sk-027 correction misses an adjacent dead URL

**Locations:** `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:53`; pinned upstream `README.md:76`.

The catalog defect is correct.
The recommendation misses an adjacent direct skill URL.
The pinned README sends contract builders to `skills.stellar.org/soroban`.

**Evidence:** [The pinned Scout README](https://github.com/Stellar-Light/stellar-scout/blob/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/README.md#L76) contains that URL.
[The old URL](https://skills.stellar.org/soroban) returned `404`.
[The current URL](https://skills.stellar.org/skills/smart-contracts/SKILL.md) returned `200`.
[Issue #14](https://github.com/Stellar-Light/stellar-scout/issues/14) carries the same recommendation as the local finding.
The improvements-pipeline skill requires checking adjacent prose.

**Exact fix:** Add the adjacent URL and HTTP results to the finding.
Require replacement of direct `soroban` skill URLs, as well as list entries.
Use the authorized upstream follow-up for this substantive correction.
Remove “five places”; the evidence lists six bullets.

### 7. nit — Active descriptions retain old storage, count, and collection claims

**Locations:** `inventory/README.md:7`; `ecosystem-skills/update.sh:36`; `.agents/skills/cloudflare-observability-review/SKILL.md:166`; `.agents/skills/run-evals/SKILL.md:644`.

The inventory guide still calls upstream files mirror Markdown files.
The update script still claims approximately `30` directory entries.
The observability runbook names `204` section entries; the current manifest has `202`.
The eval finding template omits `canonical-source` from its collections and service values.
`improvements/intake.json:51` already supports that collection.

**Exact fix:** Describe upstream files at pinned commits.
Remove mutable counts or point to generated sources.
Add `canonical-source` to the collection list and service template.
Preserve counts inside dated historical records.

## Additional work

1. **simple:** Correct the admission procedure before using it for another source.
2. **simple:** Expand the pin-review digest and add its behavior test.
3. **simple:** Validate source selections before replacement and stage the index.
   Transactional rollback needs a separate implementation choice.
4. **simple:** Remove inactive private-archive and credential-recovery branches from `ecosystem-skills/build-index.mjs:111` and `:131`.
   The accepted sources are public GitHub only.
   The drift checker already rejects unknown source types at `scripts/check-skills-drift.mjs:268`.
5. **simple:** Correct the active descriptions and adjacent Scout URL.
6. **needs-decision:** Read all twelve SCF skill bodies before deciding exposure under decision K.
   The live directory confirms twelve entries from `Stellar-Light/awesome-stellar-community-fund`.
   This review does not accept their bodies based on names.
7. **simple:** Obtain fresh production catalog and exact skill-read evidence before closing the review.
   The Raven MCP tool rejected the read-only call because its approval policy is `never`.
   These production checks remain **unverified in this lane**.

## Checked and correct

- I read `git show f65e165d` and examined clipped portions separately.
  The PR changes no Worker source, compiled catalog, or generated specification.
  Its `update.sh` change alters a comment only.
- `node scripts/check-skills-drift.mjs` exited `0`.
  All five pins and the `43`-entry directory snapshot were current.
  Observed pins: `d92c56bda17a`, `6f215af60eb6`, `65375fd2b258`, `3b587aa9f23d`, `80e2467f3404`.
  `node scripts/check-mirrors.mjs` reported `mirror checks ok`.
  `node scripts/check-pin-review.mjs --base 605c1558` reported no selection movement.
- Direct, memory-only verification fetched all `66` pinned Markdown files.
  Every upstream response and git blob hash matched.
  The retirement scrub affected seven Lumenloop files and one Stellar Light file.
  These counts match `THIRD-PARTY-NOTICES.md:32`.
  The separately evaluated retired onboarding body fails its scrub; the builder excludes it before loading.
  This review created no skill cache files.
- The local catalog has `60` operations, `20` skills, and `202` sections.
  The pin manifest has `21` skills.
  `scripts/build-catalog.mjs:849` excludes the retired onboarding skill.
  `research/skill-exposure-inventory.md:48` correctly dates the older count table and names the two later additions.
- [The live skills API](https://stellarlight.xyz/api/skills) returned `43` entries.
  Source counts were `sdf: 8`, `stellarlight: 15`, `lumenloop: 8`, `external: 12`.
  The SDF slugs match the corrected README.
  `GET /api/skills/soroban` returned `404`; `GET /api/skills/smart-contracts` returned `200`.
  `GET /api/skills/stellar-scout` returned `200`, source `stellarlight`, and `34541` content characters.
  `GET /api/skills/stellar-sdk` returned metadata without content.
  These observations confirm the main sk-027 claims and its content-versus-metadata recommendation.
- Direct upstream reads confirmed every sk-027 phrase at `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
  `gh api repos/Stellar-Light/stellar-scout/issues/14` returned the open issue and its complete body.
  It contains the automated marker, public record, immutable snapshot, and resolution instructions.
  `node scripts/improvements-lint.mjs` reported `improvements lint ok (64 findings)`.
  The current finding correctly uses `reported-upstream`.
  Earlier ledger references to `verified` describe dated filing history.
- The Trustless Work root-directory mode matches PR #157.
  Source selection, upstream-path reconstruction, and index links handle the `.` layout correctly.
  The admission procedure names the correct intake fields, license notice, inventory, and attestation.
- Parsed comparison of the Lab case against `605c1558` found no change outside `truth`.
  Judge-facing text and tags remain unchanged.
  Register changes affect only the stated clusters, their review metadata, and the changed member hash.
  Fresh sources support their preserved funding and storage conclusions.
- The dead cookbook URL returned `404`; [its replacement](https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract) returned `200`.
  The replacement documents SAC deployment and address lookup.
  `stellar --version` returned `28.1.0 (c0f4d0da891bbf214c08b8c5035ae6db80e9a3bd)`.
  `stellar contract asset --help` confirms deployment and directs address lookup to `stellar contract id asset`.
  No key operation or transaction ran.
- Fresh [Lab docs](https://developers.stellar.org/docs/tools/lab) confirm test-network funding and simulation.
  [Transaction docs](https://developers.stellar.org/docs/tools/lab/transactions) retain sequence lookup and operation addition.
  [Saved-keypair docs](https://developers.stellar.org/docs/tools/lab/saved/keypairs) describe reversible storage and legacy plaintext.
  [Quickstart docs](https://developers.stellar.org/docs/tools/quickstart) retain the nonproduction boundary.
- GitHub queries for both storage helpers returned `624d40ff29ca897f07290ca52011893175dae200`, dated `2025-09-04T19:34:02Z`.
  Independent current-source reads confirm XOR/base64 encoding and the legacy JSON fallback.
  The live page loads `page-dbc03db5d85268bb.js`.
  A fresh bundle read returned `200` and contained matching encoding, decoding, and JSON parsing paths.
  I read no user keys and changed no browser storage.
- `node eval/qa/lint-corpus.mjs --since 605c1558 --stale` exited `0` with `0 error(s), 62 warning(s)`.
  The edited case produced no reported warning.
  I did not rerun generators, builds, paid evaluations, or the full unit-test suite.
- Cloudflare's read-only deployment API verified the current production version.
  Endpoint: `GET /accounts/{account_id}/workers/scripts/stellar-raven-codemode/deployments`.
  Active deployment: `6ebfc176-1365-45e0-892e-37142c7f3b5c`, created `2026-09-30T19:49:09.958146Z`.
  Version `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81` receives `100%` of traffic.
  The preceding deployment records PR #182 at `2026-09-29T20:03:14.619586Z`.
  [Live Scout OpenAPI](https://stellarlight.xyz/api/openapi.json) reports `1.9.54`.
- [Production skill health](https://raven.stellar.org/health/skills) returned `200`, `ok: true`, and `checked: 64`.
  Its observation time, `2026-09-30T19:07:27.474Z`, precedes the reviewed deployment.
  It proves that earlier canary result only.
  Fresh production catalog counts and exact skill reads remain unverified here.
- All eight repository skill files passed the performed relative Markdown-link check.
  `.agents/README.md` correctly describes queue, handoff, and ledger roles.
  The new AGENTS.md entry names an existing retrieval-system-audit skill.
  I preserved dated historical evidence and other agents' work.
