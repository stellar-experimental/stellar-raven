# Independent assets handoff review — 2026-11-06

Reviewer: independent session t361. Read-only repository review; no source edits, public comments, paid calls, commits, Wrangler, or nested agents. Commands ran in owned hc children t364–t366 and t368. Read AGENTS.md, improvements-pipeline, improvements/README.md, live-drift-resolution, PLAN.md, ARCHITECTURE.md and hc instructions. Root expanded the brief to the generated candidate, sk-038 retirement and the narrow Vitest exclusion repair.

**Verdicts: sk-039 NO RETIRE; sk-038 RETIRE candidate accepted on live evidence, subject to the explicit lifecycle cleanup below; candidate stellar-dev pin ACCEPT.** The ordinary Docs skill has caught up with the issuer-lockout correction but still contains the old token-interface types. These are separate defects. Acceptance of the pin does not establish Raven production deployment or complete a retirement receipt.

## Fresh observations

All times UTC on 2026-11-06. Detailed local evidence is in `tmp/playground-final/assets-handoff-evidence/`; compact public receipts accompany this promoted report. Public bodies, GitHub responses, allowlisted response headers, request times, hashes, comparison scripts/results and offline compiler output are saved. No authorization headers, cookies, environment dumps, credentials, or private partner data were captured. Public commit-author email fields were removed from saved API JSON; issue/comment body values remain exact. API metadata hashes describe the original response; `SHA256SUMS.json` hashes the final sanitized files. Requests have no query-string cache bust or no-cache directive. An initial Python-default-user-agent Docs request received HTTP 403; repeating the same ordinary URL with User-Agent `curl/8.7.1` returned HTTP 200. This was not a content failure or cache bypass.

| Surface | GET started | HTTP | SHA-256 |
|---|---|---|---|
| [Ordinary canonical skill](https://skills.stellar.org/skills/assets/SKILL.md) | 18:59:10.317688 | 200 | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| [Canonical main](https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/assets/SKILL.md) | 18:59:10.318066 | 200 | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| [Merge fb63412](https://raw.githubusercontent.com/stellar/stellar-dev-skill/fb63412da70102edb527baf4cf3068f25713cd14/skills/assets/SKILL.md) | 18:59:10.318183 | 200 | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| [Candidate ceeb2f17](https://raw.githubusercontent.com/stellar/stellar-dev-skill/ceeb2f17a0fd1da3f47e28c6a73a026883020c09/skills/assets/SKILL.md) | 19:00:52.196656 | 200 | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| [Ordinary published Docs skill](https://developers.stellar.org/.well-known/agent-skills/assets/skill.md) | 18:59:10.318370 | 200 | `ff836f85491d74fcd2f2d0d1331bff502f45c8ad53b6bf351dc39a1114976b55` |
| [Generated Docs main](https://raw.githubusercontent.com/stellar/stellar-docs/main/.mintlify/skills/assets/SKILL.md) | 18:59:10.318450 | 200 | `ff836f85491d74fcd2f2d0d1331bff502f45c8ad53b6bf351dc39a1114976b55` |

Canonical/candidate Git blob is `e6493237cbc9c236a7ec9f5bfb179faf3d105cde`; held pin blob was `1658bebe308055e105cfedf7fcd9f6f1ba478a7b`, SHA-256 `ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8`. Docs blob is `9f841ce7f3b08d3f471676462d0ecec14a504cd6`. Docs response reports `Age: 34`, `Last-Modified: Fri, 06 Nov 2026 18:58:35 GMT`, and `Cache-Control: public, max-age=86400`.

## sk-039: canonical fix accepted; deployed downstream residual remains

Re-read original `improvements/skills/sk-039-assets-token-interface-types.md`, [issue180](https://github.com/stellar/stellar-dev-skill/issues/180), [PR181](https://github.com/stellar/stellar-dev-skill/pull/181), and [handoff388](https://github.com/stellar-experimental/stellar-raven/issues/388) directly. GitHub readbacks are saved, including byte-preserving API bodies and comments.

- Canonical `ordinary.body:380–390` has `transfer(... to: MuxedAddress ...)`, adjacent `transfer_from(... to: Address ...)`, `symbol() -> String`, and the generated-client conversion explanation. The existing caller at line372 still uses `token.transfer(&from, &to, &amount)` with `to: Address`.
- Fresh SEP-41 v0.5.2 (`sep41.body:97,123,145,189`, SHA-256 `c9742e8dd6bfc925d73df0284712f9f09b2adc14be708b8c19b34da098e4abaf`) agrees, including `approve`'s `live_until_ledger`. It explicitly permits MuxedAddress or Address as the recipient representation. SDK27.0.6 `token.rs:154,178,240` independently declares the same three types; `muxed_address.rs:178` provides `From<&Address>`.
- A fresh isolated `cargo check --offline --locked` against exactly SDK27.0.6 passed the unchanged `&to` example, exit0, 18:59:30–18:59:45. Replacing only `&to` with `&to.into()` failed at type checking with E0283, exit101, 18:59:45. The log identifies multiple `Address` conversions and ambiguous `MuxedAddress: From<&_>`. This verifies the note in its shown untyped context; it does not claim that explicitly typed conversions are impossible. Sources, Cargo.lock, logs and `compile-results.json` are saved.
- **Residual:** `docs-ordinary.body:381,386` and identical generated Docs main still say `to: Address` and `symbol() -> Symbol`. The canonical correction must propagate through Docs generation and normal publication. Because the generated source is itself old, calling this merely a stale delivery cache would be inaccurate. Keep sk-039 `reported-upstream`; no further canonical type patch is needed. Do not erase its intake override or active row.

Upstream state, freshly read at approximately 18:59:10–12:

| Ref | State | Reviews/checks and attribution |
|---|---|---|
| issue180 | CLOSED/completed, 18:41:22 | Three comments by `stellar-triage-bot[bot]`; latest announces deployment and handoff. These are upstream bot assertions, independently checked here. |
| PR181 | MERGED 18:41:20, merge `fb63412da70102edb527baf4cf3068f25713cd14` | Head `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`; review submissions `[]`, inline review comments `[]`, requested reviewers `[]`. No independent upstream approval. Bot explicitly says Copilot did not start and it self-reviewed. |
| Head checks | 7 success, 1 skipped | Two preview checks, CodeQL, two Socket checks and two Analyze checks succeed; `site-ci` skipped. No failed/action-required check. Legacy combined status says pending with **zero statuses**, not a failing check or proof of approval. |
| Merge checks | 4 success | build-and-deploy, two Analyze checks and Socket Project Report succeed. |
| Handoff388 | OPEN when read, no comments | Notification signal, not retirement evidence by itself. |

Deployment run [42272963111](https://github.com/stellar/stellar-dev-skill/actions/runs/42272963111) succeeded on the merge SHA, updated18:41:59. Follow-on [42273084054](https://github.com/stellar/stellar-dev-skill/actions/runs/42273084054) succeeded18:42:40 on generated Pages SHA `335eb741d6870b49ddd60283c599fefbebdcee59`. Ordinary live body equality supplies the direct deployment proof.

## sk-038: original trigger no longer reproduces

Re-read original finding, [issue177](https://github.com/stellar/stellar-dev-skill/issues/177), [PR178](https://github.com/stellar/stellar-dev-skill/pull/178), [handoff381](https://github.com/stellar-experimental/stellar-raven/issues/381), and every comment on these references. PR178 merged as `981705739483f0f04eccb309c2460a421eeba6c2` at02:21:51. Issue177 is closed/completed. PR178 also has no submitted reviews; its author bot recorded its own verification. Handoff381 is already closed with an explicitly partial result by **kalepail**, not maintainer acceptance of full retirement.

The ordinary Docs body now contains all three originally missing qualifications:

1. Lines420–427 require complete issuer account lockout, distinguish master-key disablement from surviving signers, and identify medium/high threshold consequences.
2. Lines429–436 preserve `set_admin` before complete lockout and condition the inability to hand over on **no signer** being able to authorize. The continuing SAC-admin minting power remains distinguished from classic issuer lockout.
3. Lines553–560 require master weight0 plus no other qualifying signers, explicitly including the low threshold for freezing, and separate admin-role review.

The earlier Lock Issuing Account example already gives signer qualifications; the later security list and handover paragraph no longer contradict it. Canonical published and generated Docs copies agree on these claims. Fresh [Control asset access](https://developers.stellar.org/docs/tokens/control-asset-access.md), fetched19:00:52 (SHA-256 `5538168044c288637a4003406f27504dab93bfa839a6fa19b32e23b4db30af10`), independently explains the surviving-signers distinction at lines222–224. The unrelated SEP-41 type residual belongs to sk-039 and does not prevent retiring sk-038.

**Accept sk-038 as fixed and eligible for retirement.** This reviewer has not deleted it or posted the required resolution comments. Root must complete and inspect the resolver receipt/cleanup before claiming retirement complete.

## Pin and generated-candidate review

Baseline: Raven HEAD `657ae9880d1f6dfd8d608a2bcd0374dd20691294`, stellar-dev `5aafdf96760944ee112a8325b035d5e0f78eadb8`, `sel:bf7230c02ed4`. Candidate: `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`, `sel:603c9e0eebba`.

Independently fetched untruncated old, merge and candidate Git trees; compared **all23 selected Markdown files across8 skills**, paths, blob hashes and sizes against the manifests. `selected-files.json` lists every result. All23 candidate selections equal the merge selections; there are no additions/removals, and only `skills/assets/SKILL.md` changes. Full body diff was read and is saved as `selected-body.diff`. It consists solely of the two type fixes, `transfer_from` signature addition, `approve` parameter rename, and four-line client note. Other four source objects are exactly unchanged.

The candidate differs from the handoff's merge SHA because `ecosystem-skills/update.sh:117–122` resolves the latest commit touching `skills/` with `commits?sha=main&path=skills`, rather than blindly pinning main HEAD. Merge `fb63412` has parents `248c4ca...` and candidate `ceeb2f17...`; candidate is the merged PR head, not an unmerged fork. Its entire selected tree is byte-identical to the merge. **Both commits are suitable content pins; the standard updater's candidate is accepted.** No hand-authored alternative manifest is needed.

Upstream old-to-merge comparison has exactly two changed files: the selected assets skill and `evals/scenarios/assets/06-sep41-interface-types.json`. The latter is an upstream regression case outside Raven's selected surface. No unrelated selected content, external action instruction, credential, override instruction, retired skill, or newly exposed Raven operation enters this pin.

Independently derived generated changes:

- Catalog has533 leaf changes:224 fetchedAt,94 commit,94 source,94 raw URLs,13 assets sha and13 assets sha256, plus generatedAt. Entry sets, descriptions, schemas, searchable flags and routing fields remain equal. No new/removed operation or skill; runtime runners and their projections are unaffected.
- Super-spec changes only three generated/synced timestamps. Both discovery directories change only fetched_at. Inventory, runner source/fixtures, op classes and micro-map have no changed files.
- All544 complete routing rows independently compared equal:338 legacy,122 extended,23 skill,49 holdout,12 history. Evidence: `routing-independent.json`. Root's ranked dump comparison is also equal.
- `eval/gates.json` changes only `/evidence/inputs/0/sha256` and `/evidence/notes`. New catalog SHA-256 `fc0834c5f9241a9af909bb15baf4b4d89366857037a3ec41be16cd7b8c36b5a8` matches the actual file. No numeric floor, accepted count, date or label moved. This is an evidence-fingerprint refresh, not a scoring rebaseline.
- Golden impact search found current `q-sep-41-token-interface`, `q-soroban-token-transfer-pattern`, and `q-sor-sep41-transfer-vs-transferfrom` already distinguish MuxedAddress/Address. The last also deliberately accepts `expiration_ledger`/`live_until_ledger` terminology. No golden answer edit follows from this pin. No stale runtime/docs implementation assertion was found. Search results are saved in `impact-search.txt`.
- Independent `check-pin-review --digests`, `check-pin-review --base HEAD`, and `git diff --check` pass. Full build/test/QA/mirror gates are root's executions; this reviewer did not run Wrangler.

Classification: served skill body correction/runtime content drift, with routing inputs unchanged; not pure provenance even though most generated JSON diff lines are provenance.

## Reference cleanup and remaining gates

Saved `references.txt` from `rg -n --hidden` across the repository (excluding tmp, node_modules and .git); this includes .agents, research, intake, resolved ledger, generated index and active findings. No sk-038/sk-039 reference was found in active golden/register files. Dated evidence must remain historical rather than be rewritten as current state.

- **sk-038:** remove its active finding and intake override with the resolver; it has no probe frontmatter to remove. Regenerate INDEX; append a complete `resolved.json` receipt with original source, independent live result, review evidence and resolving refs. Update/remove the active `.agents/TODO.md:57` cache-recheck item. Keep dated round/research and PIN-REVIEW statements as history. Keep sd-082's existing resolved receipt mentioning its successor sk-038; the new sk-038 receipt makes that reference durable. Freshly read immutable original record [657ae988…/sk-038](https://github.com/stellar-experimental/stellar-raven/blob/657ae9880d1f6dfd8d608a2bcd0374dd20691294/improvements/skills/sk-038-assets-custom-admin-issuer-lock-signers.md), blob `b83ab460d5d8917189e7b6efeed3311a12fd5340`, SHA-256 `461afe47a6c71629287a189a1ae7b7a793c5b2b84ba93be81a096aabcc2ec9f8`.
- The existing [issue177 comment6685112671](https://github.com/stellar/stellar-dev-skill/issues/177#issuecomment-6685112671) is by kalepail and reports a partial result. It does **not** satisfy a final resolution comment. Root must record the fresh ordinary result and immutable source on upstream refs177/178 and reconcile the earlier partial handoff381, then read comments back before asserting `--upstream-commented`. No public writes were performed by this lane.
- **sk-039:** retain active finding, intake override and index row; preserve source snapshot [2bcecb740…/sk-039](https://github.com/stellar-experimental/stellar-raven/blob/2bcecb740d8802bf3769d41af7b6470d5e8d47ae/improvements/skills/sk-039-assets-token-interface-types.md). Root's current amendment correctly records the canonical fix and separate generated/published Docs residual. Recheck both normal Docs source and URL after generation/publication changes; do not create a duplicate finding for the same remaining types. A handoff388 acknowledgement must say partial, not retired.
- Acceptance is scoped to the captured candidate selection and catalog hash. Root owns final lifecycle reconciliation, baseline gates, secrets scan, any commit and deployment. Re-run mirror/hash checks and applicable gates when changing those bytes.

## Additional Vitest exclusion repair

Root added only `tmp/**` to `vitest.config.ts` exclusions and updated its explanatory comment. Accepted: no tracked file exists under tmp; tracked research and canonical test suites remain eligible. The exclusion addresses real loader failures from archived copies and a node:test scratch file without deleting evidence.

Independently parsed root's before/after logs and compared paths to `git ls-files`. Before:159 files,156 passing plus3 loader failures,3445 passing tests plus3 expected failures. After:151 files,3348 passing plus3 expected failures. Exactly8 untracked tmp files disappeared:5 passing scratch suites totaling97 tests (36+17+23+20+1), plus3 zero-test loader failures. **Zero tracked suites disappeared.** The tracked research `blind-packets.test.mjs` remains and passes28 tests. Thus the earlier154-file/44-test expectation was inaccurate; the current151-file result is the appropriate tracked suite count. Exact removed paths/counts are saved in `test-discovery-comparison.json`. This is a separate bounded own-repo repair, not an upstream pin change.

## Final cleanup review — 19:06–19:08 UTC

**ACCEPT the actual sk-038 retirement cleanup; retain the sk-039 no-retire verdict. Candidate pin approval remains valid.** This appendix supersedes the procedural-pending qualification above. PR/release and Raven deployment verification remain outside this read-only lane.

Independently inspected the resolver arguments/dry-run and actual working tree. The sk-038 active file is deleted; its intake override and generated index row are absent. `resolved.json` adds exactly one receipt, sk-038, and changes/removes no prior receipt. It records the original discovery date, resolution date, service/owner, all three upstream refs177/178/381, resolving refs177/178, timed ordinary-URL result/hash, distinct review evidence, source commit and immutable source URL. There was no finding probe to leave behind. The active TODO now names sk-039 and its generated/published Docs recheck; old sk-038 references in dated research and sd-082's resolved receipt appropriately remain historical. The round ledger accurately distinguishes resolved issuer lockout from remaining interface types.

Fresh public immutable source reads at19:06:35 returned HTTP200 and matched `git show c2f05adb6c6f8ec3d3eb4e33753e4f4128f5aaa3:<path>` byte-for-byte:

| Snapshot | SHA-256 | Git blob |
|---|---|---|
| sk-038 fixed source | `b7b12f52ef46bc9684db449fd7e68174cbb5be3a94ad2f588d67e9589dde7f44` | `0c55ed9dcf17e8e1581e42be57f1673bd4ad0a06` |
| sk-039 retained source | `05108b8903fe212cf4b73d1a083f0e0873a547a546c47331cc731ed2a44c145b` | `69990f95de32506dcedca9fc46a6a2beae3c8cb8` |

The sk-038 receipt and public comments use the fixed source snapshot, preserving the final live evidence before deletion. The retained working sk-039 file exactly matches its public snapshot and remains `reported-upstream`, with its intake override/index row and no resolved receipt.

Independently fetched all six exact public comment IDs through the GitHub API. Each URL matches the posted receipt, each body matches the reviewed draft, and each author is **kalepail**. These are Raven verification comments, not independent upstream maintainer endorsements:

- sk-038 complete result and immutable snapshot: [issue177 comment6693079159](https://github.com/stellar/stellar-dev-skill/issues/177#issuecomment-6693079159), [PR178 comment6693079659](https://github.com/stellar/stellar-dev-skill/pull/178#issuecomment-6693079659), [handoff381 comment6693080123](https://github.com/stellar-experimental/stellar-raven/issues/381#issuecomment-6693080123).
- sk-039 partial result and retained generated/published residual: [issue180 comment6693080712](https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6693080712), [PR181 comment6693081152](https://github.com/stellar/stellar-dev-skill/pull/181#issuecomment-6693081152), [handoff388 comment6693081643](https://github.com/stellar-experimental/stellar-raven/issues/388#issuecomment-6693081643).

Fresh handoff388 closure readback confirms CLOSED/completed at **19:06:50 UTC**, with one comment. Its partial-result comment explicitly retains sk-039. Closing the processed notification therefore does not misrepresent retirement of the finding. Closure metadata and all comment/source readbacks are saved under `assets-handoff-evidence/cleanup/`.

`PIN-REVIEW.md:592` now correctly records independent t361 acceptance of `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`, `sel:603c9e0eebba`. Current catalog hash remains `fc0834c5f9241a9af909bb15baf4b4d89366857037a3ec41be16cd7b8c36b5a8`; no reviewed pin bytes changed. Independent narrow read-only checks pass: improvements lint **101 findings** (including regenerated-index consistency), pin-review guard, and `git diff --check`. No broad live sweep or full test rerun was performed for this appendix. Only owned cleanup child t36d was used and removed.
