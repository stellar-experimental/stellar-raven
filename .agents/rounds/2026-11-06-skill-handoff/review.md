# Independent sk-038 handoff review — 2026-11-06

Reviewer: hc terminal `t2p4`, requested Astra review lane; no subagents. Read-only review except this report and `tmp/nov6-handoff-review/` receipts. No paid calls, upstream comments, commits, deployment, or shared artifact edits were performed by this reviewer.

## Verdict: partial deployment; retain sk-038

The canonical skill correction is sound and live on skills.stellar.org. The generated stellar-docs source is corrected, and a cache-busted published Docs request serves that correction. **The ordinary published Docs skill URL still serves every original faulty claim.** Do not retire sk-038 or claim its full deployed scope fixed yet. Keep it `reported-upstream` with this dated partial result; recheck the ordinary URL after its delivery cache updates.

This conclusion comes from independent GETs and byte comparisons, not the coordinator's transcript or the merged/closed GitHub state. Primary checks ran at 2026-11-06 12:40–12:42 UTC.

## Original scope and GitHub evidence

Read the complete local finding and exact GitHub issue body. [Issue 177](https://github.com/stellar/stellar-dev-skill/issues/177) asks for all of: qualify other signers in the custom SAC admin prerequisite; preserve handover-before-complete-lockout; qualify the claim that nobody can sign after master weight zero; update the final security checklist; regenerate the Docs skill copy. Its scope is not limited to the first corrected sentence.

[Inbound Raven issue 381](https://github.com/stellar-experimental/stellar-raven/issues/381), authored by `stellar-triage-bot[bot]`, was open with no comments at initial inspection. It names [PR 178](https://github.com/stellar/stellar-dev-skill/pull/178), merge `981705739483f0f04eccb309c2460a421eeba6c2`, and the skills.stellar.org deployment, while explicitly saying the Docs copy updates at the next sync. Issue 177 was closed/completed at 02:21:53Z. PR 178 merged at 02:21:51Z; head `f230e26f7ded94c5b3f375e0180ea35726ed5973`, base `6771a3fde615d9d86300934fea57e6d411be3c5e`.

Read the actual three-file PR diff: assets skill, LayerZero companion, and `evals/scenarios/assets/04-sac-admin-handover.json`. No formal review submissions or inline review comments were present. The verification/merge comment is by the same triage bot, not an independent human reviewer: [comment 6675132659](https://github.com/stellar/stellar-dev-skill/pull/178#issuecomment-6675132659). Its claim that Copilot did not start a review is not review acceptance. Head checks showed success or skipped, with no failure. [Deploy run 42149843093](https://github.com/stellar/stellar-dev-skill/actions/runs/42149843093) succeeded on merge `9817057`; [Pages run 42149932806](https://github.com/stellar/stellar-dev-skill/actions/runs/42149932806) succeeded with deployment-branch head `8b03f49370272588855df0d1d49ee1844c8b3bd8`. These corroborate deployment; the GET below proves the actual served bytes.

## Independently observed source and deployed bytes

All successful rows below were HTTP 200. SHA values in this table are SHA-256 content hashes, not Git commits.

| Surface | Result | SHA-256 |
| --- | --- | --- |
| [Original assets at 77bf4e8](https://raw.githubusercontent.com/stellar/stellar-dev-skill/77bf4e8fc2533ac6ad680d061e89371e8474a1a8/skills/assets/SKILL.md) | Original defect reproduced | `a6302542ad64bf50df0d57ca31f9e80575185b05800b48ecd5fdcba2285b6bed` |
| [Merge assets at 9817057](https://raw.githubusercontent.com/stellar/stellar-dev-skill/981705739483f0f04eccb309c2460a421eeba6c2/skills/assets/SKILL.md) | All scoped prose corrected | `ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8` |
| [skills.stellar.org assets](https://skills.stellar.org/skills/assets/SKILL.md) | Byte-identical to merge; 19,363 bytes | `ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8` |
| [Generated Docs assets at b085617](https://raw.githubusercontent.com/stellar/stellar-docs/b085617ffa0f0d5df5b9380e64c55fb7f157b9ce/.mintlify/skills/assets/SKILL.md) | All scoped prose corrected; source marker 9817057; 22,468 bytes | `0cbd9cdbf2f2bc2b7a34270eb3a33079c88d7ac3bc94750b631c8720328c7737` |
| [Ordinary published Docs assets](https://developers.stellar.org/.well-known/agent-skills/assets/skill.md) | **Still faulty**; source marker 6fe91cc; 21,972 bytes | `141b4f4417599cd1679f7c82f26fae50f6eb5ca9a50c12f66bc14f72e5694856` |
| [Cache-busted published Docs assets](https://developers.stellar.org/.well-known/agent-skills/assets/skill.md?verify=20261106T1242) | Byte-identical to corrected generated source | `0cbd9cdbf2f2bc2b7a34270eb3a33079c88d7ac3bc94750b631c8720328c7737` |
| [Live LayerZero companion](https://skills.stellar.org/skills/cross-chain/layerzero.md) | Corrected qualifier; byte-identical to merge | `47fb851f9df9c10cd816d4ced5127fbd3c4b4d8225977e4164b93acdcc3a5526` |

Canonical assets were also fetched at then-current upstream main `248c4caeeb8d8c149ed0a8ae05e5725aa0cd9d29` and matched the merge and live bytes. Assets Git blob SHA is `1658bebe308055e105cfedf7fcd9f6f1ba478a7b`; LayerZero is `a7905630f4ae3ebfb6e49bb3ace822a1d7bfdd19`; generated Docs assets is `9b3c3c21a272fa9e5f6c60db30a8cbbbdeefc7d5`.

The Docs sync [commit b085617](https://github.com/stellar/stellar-docs/commit/b085617ffa0f0d5df5b9380e64c55fb7f157b9ce) records PR 3068 and source 9817057 at 10:00:38Z. Generated/source byte differences are expected: source frontmatter, rewritten related-skill URLs, and appended regulated-assets companion. The affected prose is identical.

The ordinary published URL reproduced the old prerequisite, old nobody-can-sign handover warning, and master-weight-only checklist at **12:41:07Z and 12:41:50Z**; the second GET sent `Cache-Control: no-cache`. First response headers include `cache-control: public, max-age=86400`, `age: 65242`, `last-modified: Fri, 06 Nov 2026 01:22:19 GMT`, deployment `dpl_9VVk5y1P8k1ATeJguVngy9Q3cmbD`, and CF Ray `a5642baf7db0bfb6-ATL`. The query-varied GET at 12:41:50Z was corrected. This supports a stale-delivery/cache residual, not a missing source fix. A cache-busted success cannot substitute for the original ordinary URL.

The repository-path-shaped URL `https://developers.stellar.org/.mintlify/skills/assets/SKILL.md` returned 404. It is not the published route and is not evidence of a deployment defect. The generated file itself supplies the `.well-known/agent-skills/.../skill.md` route convention.

## Technical and adjacent-claim review

Read adjacent fixed-supply, SAC/custom-admin, security, and LayerZero text, as well as the entire actual patch. The fixed-supply section already qualified other signers; the patch now applies that condition consistently to the custom-admin prerequisite and final checklist. It keeps `set_admin` before complete issuer lock and preserves minting under the new SAC admin afterward. LayerZero removes the same master-zero-only shorthand. The eval expectation is aligned with those claims; no paid eval was run.

Independently read live [Control asset access](https://developers.stellar.org/docs/tokens/control-asset-access.md), [Signatures and Multisig](https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig.md), [List of operations](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations.md), and [Custom SAC admin](https://developers.stellar.org/docs/build/guides/tokens/custom-sac-admin.md). They support medium-threshold issuance, high-threshold signer/master changes, low-threshold trustline freezing, independent issuer/SAC administration, and handover authorization by the current admin. Also read [account_contract.rs at 0c99950](https://github.com/stellar/rs-soroban-env/blob/0c99950e96128beba3319aa96b116646ce974e69/soroban-env-host/src/builtin_contracts/account_contract.rs#L175): account authentication rejects empty signatures and zero-weight signers, sums valid signer weights, and compares with medium threshold. This supports the original surviving-signer counterexample and avoids assuming master-key disablement is account lockout. No new adjacent content residual within sk-038 was found. The unchanged production USDT0 assertion was not treated as newly proven chain state.

## Repository references and lifecycle boundary

Independent `rg` results are saved in `sk038-references.txt`. Active references are the finding, intake override, and generated index. Prior round notes, prior PIN-REVIEW observations, and sd-082's resolved receipt are historical and should remain truthful to their dates. The new pin note can supersede the old source-content observation without asserting complete Docs delivery. No golden/register case directly names sk-038 in this scan. Since retirement is not accepted, no cleanup or resolved-ledger deletion verification is claimed. The coordinator owns any upstream verification comment and the resulting active-record update.

## Receipts and reproducibility

`tmp/nov6-handoff-review/` contains exact issue/PR JSON, PR file patches, comment authors, checks, deployment runs, source files, HTTP headers, `http-receipts.json`, `repeat-receipts.json`, Docs sync history, the commit-pinned Soroban source, and the reference scan. GETs used `curl -sS -L --max-time 30 -D <headers> -o <body> -w '%{http_code}' <URL>`; repeat requests added `-H 'Cache-Control: no-cache'`. SHA-256 and Git blob SHA were computed over exact response bytes. GitHub exact-body receipts used `gh api`, as required by the improvements-pipeline skill.

Pin-author review follows separately below after the parent's request; it is independent of the partial-deployment disposition above.

## Pin-author and final lifecycle review — accepted

The parent requested the second review after the author (`t2p5`) stabilized the patch. **Accept the pin update and the retained-active partial disposition. No blocking findings remain in the reviewed diff.** This acceptance does not certify Raven deployment or resolution of the ordinary Docs URL residual.

Independently fetched all three changed bodies at both exact pins, read their actual diffs, and computed sizes, Git blob hashes, and SHA-256 values (`pin-receipts.json` and `pin-diff-*.patch`). The selected update is `77bf4e8fc2533ac6ad680d061e89371e8474a1a8` → `5aafdf96760944ee112a8325b035d5e0f78eadb8`, `sel:bf7230c02ed4`. It is not necessary to pin repository main `248c4ca...`: the updater selected the latest commit affecting the skills path. The assets and LayerZero files at the selected pin exactly match the corrected deployed/source bytes reviewed above.

The third diff, `standards/ecosystem.md`, changes only four Raven connection/repository lines: canonical server/MCP URL, Playground URL, GitHub repository, and the Claude Code connection command. These agree with README and the host configuration. New file SHA-256 is `94b7cca3e80afe95fae7698e1d8a61fdc1b7846451871fb760a889bbd2d182f3`, Git blob `56be3f99ddd5e8ec85316f318a68c000d6d9bef3`. No newly selected file, instruction override, credential, exposure change, or invented Raven callable appears in any of the three diffs. Reference signing instructions do not grant this review permission to sign.

Independent structural checks against baseline commit `a73e0b25c4062ca4e3c4382e501630a631ff4656` confirm:

- All 67 selected file paths are identical; only the three named file records change. Other source selections are exactly unchanged.
- Catalog remains 284 entries: 60 operations, 20 whole skills, 204 skill sections. Every complete operation object is identical. All content outside provenance, transport, and generated timestamp is identical. The 537 changed scalar leaves comprise 224 fetched timestamps, 94 each of commit/source/URL, 15 each of Git/SHA-256 hashes, and one generated timestamp. `catalog-structural-diff.json` preserves the full comparison.
- Catalog/community snapshots change only timestamps. Super-spec changes only three provenance timestamps. No runtime code, service inventory, section structure, micro-map, operation classes, or exposure policy changes.
- Independent pin guard and offline mirror validation passed; author mirror receipts show all 67 live files verified. `git diff --check` passed.
- Author baseline manifest matches baseline Git content. All **544 complete graded routing records** are exactly equal across before/after receipts (338 legacy, 122 extended, 23 skills, 49 holdout, 12 protocol-history). The separate full-ranked dumps, keyed by 495 distinct query IDs, are also exactly equal. This distinction avoids calling the 495-key dump itself 544 unique queries. `routing-review.json` preserves the comparison.
- Final catalog raw SHA-256 is `008c16e31e5a53ea221a10007ff7198d317c0f2f15bd8b0354e552fe85776e33`, matching `after-routing.json` and the parent's gate evidence. The author's report contains an earlier/stale `f1c0da...` hash in its rebuild bullet; the accepted final hash is the independently recomputed `008c16...`. This is an evidence-note correction, not a changed catalog or failed gate.
- `eval/gates.json` changes only the catalog fingerprint and `evidence.notes`. All accepted totals, numerical thresholds, other input fingerprints, and baseline date are unchanged. The original author routing failure was solely the then-old fingerprint. Read the parent's final routing receipt: **GATE PASS**, committed evidence verified, `routing-2026-11-06T12-44-06-256Z.json`.

Read author focused-test evidence (277 passed) and parent final logs (145 test files; 3,134 passed and 3 expected failures; typecheck success; build dry-run completion; eval self-test passed). The parent owns the complete release gates; this reviewer did not redundantly rerun the full suite or mutate generated artifacts. No paid eval was run.

Reviewed final finding and TODO diffs. They retain `reported-upstream`, preserve the full original scope, record the canonical/source correction separately from the stale ordinary URL, and schedule the exact no-query URL check after invalidation or from November 7. No deletion, intake removal, or resolved-ledger retirement occurs. The preserved historical source note in `q-aas-issuer-fees-supply-cap-freeze.json` describes an August 29 observation; the associated claim speaks of locking issuance authority. No new golden rewrite is justified by this patch.

Independently read back [verification comment 6685112671](https://github.com/stellar/stellar-dev-skill/issues/177#issuecomment-6685112671). It is authored by `kalepail`, correctly reports Raven's partial verification, gives the stale ordinary URL/hash, and requests delivery refresh without another canonical wording patch. The finding accurately attributes it as Raven verification rather than maintainer acceptance. Receipt: `resolution-verification-comment.json`.

The source correction can ship while the finding remains active. Future retirement still requires fresh ordinary-URL verification by two distinct reviewers. Final reviewed tracked-file digests are retained in `reviewed-file-hashes.json`; subsequent upstream comment evidence was additionally read back as described above. Update the PIN-REVIEW pending-review cell to cite this acceptance, and correct the author report's stale catalog hash before finalizing evidence. Neither requires changing the reviewed implementation.
