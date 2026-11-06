# Independent retirement review: Raven handoffs 385 and 386

Reviewed 2026-11-06 by the independent Codex review lane (`HC_TERMINAL_ID=t35p`).
Scope: read-only upstream/live/reference review; the root performs its own trigger verification.
Read `AGENTS.md`, `PLAN.md`, `ARCHITECTURE.md`, the improvements-pipeline skill, its upstream-writing-style reference, `improvements/README.md`, both complete finding files, and the resolver implementation.

## Verdicts

| Finding | Independent live verdict | Retirement decision |
| --- | --- | --- |
| sd-097 | Original wrong-backend statement is fixed in ordinary live Markdown, HTML, and the corresponding full-export section. | **RETIRE**, once root records its independent trigger result, posts/readbacks resolution comments, and completes the reference/resolver actions below. No successor required for the original defect. |
| sd-095 | Original device-only private-key claim is fixed; the live guide distinguishes device-bound and provider-synced passkeys. | **RETIRE**, under the same procedural conditions. Record the exact scope of the fix: the final text does not explicitly describe end-to-end encryption. No remaining original storage-boundary defect was found. |

At initial inspection both active files said `reported-upstream`, and no Raven retirement-result comments were present on the inspected upstream refs. During report finalization, root independently staged both as `fixed-upstream`, added its `18:41:02Z` ordinary-GET evidence, and updated the pending prose. I read that staged diff: both root hashes match this lane's later independent hashes. The status/author-check step is therefore now satisfied; comments, durable evidence and resolver cleanup still require root completion. This review approves the factual resolution; it does not attest that final bookkeeping has already happened. No source edits, paid calls, public comments, filings, commits, Wrangler, nested agents, or resolver mutations were performed by this lane.

## Current upstream and maintainer state

### sd-097 / handoff 385

- [Raven handoff 385](https://github.com/stellar-experimental/stellar-raven/issues/385) is open, authored by **ElliotFriend**, created/updated `2026-11-06T15:41:47Z`, with zero comments at inspection. Its source snapshot resolves and matches the active finding as initially inspected, before root staged the resolution evidence.
- [Docs issue 3064](https://github.com/stellar/stellar-docs/issues/3064) is closed/completed at `2026-11-06T15:40:03Z`. Its two comments are by **stellar-triage-bot[bot]**; they acknowledge the issue and link the proposed PR. They are not Raven's completed-retirement evidence.
- [PR 3066](https://github.com/stellar/stellar-docs/pull/3066) is **MERGED / APPROVED**, merged by **ElliotFriend** at `2026-11-06T15:40:01Z`; last update `15:40:04Z`. Head `2796dbd2ee1dae20942cd873ec93908454de01d5`; merge `8cd151394ad33e8212d3fa421dda053b42c5a2af`.
- Human approval: [ElliotFriend at 15:39:53Z](https://github.com/stellar/stellar-docs/pull/3066#pullrequestreview-5802639484). The earlier triage-bot self-review is not used as independent approval. No pending reviewer requests or inline review threads; no outstanding requested changes.
- All eight head check runs succeeded. The merge commit's [production Mintlify deployment](https://github.com/stellar/stellar-docs/runs/127985603996) succeeded at `15:40:54Z`, corroborating the handoff. A later same-name run was skipped at `16:38:16Z`. **Use `check-runs?filter=all`, not the default latest-per-name response**, which hides the earlier success. This is not a failed deployment.
- The one-word PR diff changes Algolia to Mintlify and preserves the source list and Raven host. Fresh live evidence below proves deployment independently of GitHub state.

### sd-095 / handoff 386

- [Raven handoff 386](https://github.com/stellar-experimental/stellar-raven/issues/386) is open, authored by **ElliotFriend**, created/updated `2026-11-06T17:20:23Z`, with zero comments at inspection. Its source snapshot resolves and matches the active finding as initially inspected, before root staged the resolution evidence.
- [Docs issue 3042](https://github.com/stellar/stellar-docs/issues/3042) is closed/completed at `2026-11-06T17:19:09Z`. Its two comments are by **stellar-triage-bot[bot]** and describe the proposed fix; neither is a Raven retirement-result comment.
- [PR 3057](https://github.com/stellar/stellar-docs/pull/3057) is **MERGED / APPROVED**, merged by **ElliotFriend** at `2026-11-06T17:19:07Z`; last update `17:19:10Z`. Head `40751f7c0ba161d8b859f1bd52196e4300de07a6`; merge `22103ac670068f38fa0b77724bfe04ec1e447524`.
- Maintainer sequence was read directly: [ElliotFriend's November 5 review](https://github.com/stellar/stellar-docs/pull/3057#pullrequestreview-5790201606) asks to remove the hardware-security-key example, surface loss of access, and get Platform eyes. [hypekostas's November 6 comment](https://github.com/stellar/stellar-docs/pull/3057#issuecomment-6689905660) calls the changes accurate and requests a shorter warning and a limitations bullet. The bot applies those revisions; **hypekostas approves at 16:51:53Z** and **ElliotFriend approves at 17:18:59Z**. Do not leave the old “awaiting Platform-team signoff” blocker active after these approvals and merge.
- Approval refs: [hypekostas](https://github.com/stellar/stellar-docs/pull/3057#pullrequestreview-5803774166), [ElliotFriend](https://github.com/stellar/stellar-docs/pull/3057#pullrequestreview-5804146929). No pending review requests, inline review threads, or outstanding requested changes.
- All eight head check runs succeeded. All five inspected merge check runs succeeded, including [Mintlify Deployment](https://github.com/stellar/stellar-docs/runs/128038961040) at `17:19:33Z`.
- For both PRs, the legacy commit-status endpoint returns `pending` with an empty `statuses` list. That is absence of legacy status contexts, not a failing check. Check Runs and the PR rollup supply the actual CI evidence.

## Fresh ordinary live GETs

Ran `curl --silent --show-error --location --max-time 90 --dump-header <file> --output <file> --write-out '%{http_code}\n%{url_effective}\n' <ordinary-url>`.
No query parameters, cachebusting, conditional requests, request Cache-Control override, or special Accept header. All returned HTTP 200 at their original URL. SHA-256 below hashes the actual saved response body bytes, not normalized text. HTTP Date for all five was `Fri, 06 Nov 2026 18:42:08 GMT`.

| Surface | GET started → completed (UTC, 2026-11-06) | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| [Building with AI Markdown](https://developers.stellar.org/docs/build/building-with-ai.md) | 18:42:07.980560 → 18:42:08.114476 | 13657 | `6d5b6d53c7f0abe75c28c40b4d07bec3df92a87e31c722d0dfaf6094d4ab5d35` |
| [Building with AI HTML](https://developers.stellar.org/docs/build/building-with-ai) | 18:42:07.981730 → 18:42:08.210900 | 445014 | `62609a9d270dcb709289c7caf749c9b47ba66668c4bd8b37d4a9667f193f04f3` |
| [Embedded Wallets Markdown](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets.md) | 18:42:07.983347 → 18:42:08.123599 | 14279 | `e57186a4f72e0024d276a2626068e52354bd50fbd0c4ef3a4b8ba2aee48653bf` |
| [Embedded Wallets HTML](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets) | 18:42:07.984448 → 18:42:08.183849 | 351074 | `c89ae20414b933dc1503d105cffbabed3cf444306f7814dd30ff085b5d2de058` |
| [Full Docs export](https://developers.stellar.org/llms-full.txt) | 18:42:07.985758 → 18:42:08.295609 | 5877376 | `f99598013b1ac6aae1ae3515febec924889d70f8ae4a0ac59208aa6d2afdad54` |

Both Markdown responses reported `x-vercel-cache: MISS` and `last-modified: 18:41:02 GMT`; Age was 65 for sd-097 and 4923 for sd-095. Those are response metadata, not inferred deployment timestamps. HTML reported BYPASS. The export reported MISS and a one-day public cache lifetime. No cache headers were altered to produce these results.

### Adjacent prose and residuals

**sd-097:** Markdown line 20 names Mintlify, with the expected source-family list. Line 13 and connection examples use `raven.stellar.org`; the page still exposes the intended search/execute descriptions. Neither complete Markdown nor complete HTML contains Algolia. The corresponding Building with AI section of `llms-full.txt` also has the fixed text.

The full export has **one case-insensitive Algolia occurrence**, in the [dated July 16 meeting recap](https://developers.stellar.org/meetings/2026/07/16.md), export line 116308. This is historical reporting about Raven's earlier architecture, not the current Building with AI architecture statement. A separate ordinary GET at `18:43:13.901624Z` returned 200, SHA-256 `8b74b2d7eef6915689be34936d9646f323c3c2b0c44d680a1e2974fa88e0370c`. Preserve the historical page; do not claim that the entire site/export has zero Algolia mentions. No successor is justified by that dated reference alone.

**sd-095:** Markdown line 35 assigns key storage to the authenticator/provider; line 50 removes the device-only claim and keeps website/SDP non-disclosure. Line 56 explicitly distinguishes device-bound and synced passkeys. Line 29 states one registered passkey controls each wallet and loss of that passkey means loss of wallet access. Line 52 treats biometrics/PIN as examples. The HTML contains the same rendered prose. The corresponding full-export section at lines 92988–93015 agrees. There is no remaining “never leaves” device claim in either complete page.

Read the rest of the guide, including key concepts, security explanations, registration steps, returning-user behavior, and configuration. Device-side key generation later in the guide does not assert permanent device-only storage and does not contradict synchronization. Reusing the same credential across disbursements does not contradict one credential per wallet.

The final warning **does not explicitly say synchronization is end-to-end encrypted**, unlike the original recommendation and an earlier PR draft. Do not describe that phrase as deployed. The core finding is the absolute device-only assertion, now corrected; absence of this extra explanation is not evidence of plaintext synchronization or an unresolved original defect. The final text does not promise every receiver recovery or universal cross-device availability.

A separate precision issue remains: key concepts, “What are Passkeys?”, and later registration prose still describe biometrics/PIN too narrowly, while the amended numbered step says “for example.” This is related to the minor point already raised by hypekostas, but is not the device-bound-versus-synced storage defect. It does not block sd-095 retirement. If root elects to pursue that distinct issue, create a new, self-contained finding after validating the exact provider/application scope; do not extend or resurrect sd-095. This review did not test authentication ceremonies or claim a vulnerability.

## Exact reference and cleanup actions

Captured both the required default `rg -n 'sd-095|sd-097' .` and a hidden-file-inclusive scan:

```sh
rg -n --hidden -g '!.git/**' -g '!node_modules/**' -g '!tmp/**' 'sd-095|sd-097' .
rg -n 'sd-095|sd-097' eval catalog specs src ecosystem-skills scripts
```

The second command has zero hits (exit 1). No golden case, disputed register, runtime source, catalog, pin, or generated spec needs a reference change for either ID. Neither finding has `probe` frontmatter. The resolver deletes a finding-carried probe by deleting the file; there is no separate probe record here to remove.

| Location | Required action |
| --- | --- |
| `improvements/stellar-docs/sd-095-sdp-passkey-synchronization-boundary.md` | Root adds its dated live result, this independent review, PR3057 and handoff386; marks `fixed-upstream`; then resolver deletes it. |
| `improvements/stellar-docs/sd-097-raven-backend-still-names-algolia.md` | Root adds its dated live result, this review and handoff385; updates/removes the now-stale pending-patch prose; marks `fixed-upstream`; then resolver deletes it. |
| `improvements/intake.json` | Resolver removes only `findings["sd-095"]` and `findings["sd-097"]`. Keep service routing and unrelated overrides. |
| `improvements/INDEX.md` | Regenerate through resolver/`npm run improvements:index`; never hand-edit. Both active rows disappear. |
| `improvements/resolved.json` | Append one complete receipt per ID. Preserve the existing sd-079 receipt mentioning successor sd-097: it describes the earlier historical resolution. The new sd-097 receipt completes that chain. Do not rewrite prior receipts. |
| `.agents/TODO.md:90` | Remove sd-097/PR3066 from the pending review/deployment clause. Preserve sd-098/PR3067 and all unrelated work. The shared “Both await review/deployment” wording must change. Keep the general Docs queue while other findings remain. |
| `.agents/rounds/2026-11-06-playground-final-resolution.md` and `research/audits/2026-11-06-playground-final-resolution/README.md` | Root records the new handoffs, final independent verdicts, immutable evidence location, cleanup outcome, and actual comment/receipt URLs. Promote sanitized evidence from tmp before referencing it as durable committed evidence. |
| Earlier `.agents/rounds/2026-11-03-qa-followup.md`, `2026-11-05-truth-maintenance.md`, its `docs.md`/`docs-independent.md`, and `2026-11-06-remaining-sweep/docs.md`/`docs-actions.json` | Preserve dated observations, including historical open/blocked state. Use the current final-resolution ledger to supersede the old wake-up, rather than rewriting historical evidence. |
| `research/audits/2026-11-03-qa-followup/` matches | Preserve dated manifests, `README.md`, `additional-stellar-docs-readme.md`, source findings/triage, case dispositions, independent review, and final-checks evidence. Old path strings describe the then-active source; the immutable source snapshots and new receipts preserve access. No active golden/register dependency was found. |
| `research/audits/2026-11-06-remaining-sweep/docs-evidence.json` and `docs-live.py` | Preserve this dated audit and its reproduction script; they are not active probes/configuration. |

Full file/line inventory: `handoff-review-evidence/repo-references.txt`; default scan: `repo-rg-default.txt`. The working tree contains unrelated root edits, which this lane did not touch.

### Resolution comments and immutable snapshots

Before deletion, root must post and read back the dated live result plus commit-pinned source on **Docs issue3064 and PR3066** for sd-097, and **Docs issue3042 and PR3057** for sd-095. A finding initially listing only the issue is not a reason to omit the resolving PR. Acknowledge Raven385/386 with the result and resulting receipt; close the notification only after recording the outcome. If handoff URLs enter finding evidence, the resolver will include them in `upstreamRefs`; the acknowledgements then satisfy that reference too. This lane was explicitly forbidden to post any of these comments.

Public immutable snapshots were freshly fetched and verified byte-for-byte against the active files before root's concurrent status/evidence updates:

- sd-095: [a73e0b25c4062ca4e3c4382e501630a631ff4656](https://github.com/stellar-experimental/stellar-raven/blob/a73e0b25c4062ca4e3c4382e501630a631ff4656/improvements/stellar-docs/sd-095-sdp-passkey-synchronization-boundary.md), SHA-256 `6037e29346f9df36c636178cfd29a6679b0315bffdf35363bcabd227a4282cc9`.
- sd-097: [e62c2b97f52f338248537f43a3fd3871de67bc83](https://github.com/stellar-experimental/stellar-raven/blob/e62c2b97f52f338248537f43a3fd3871de67bc83/improvements/stellar-docs/sd-097-raven-backend-still-names-algolia.md), SHA-256 `8182333a60d86058d8fb66c73ec7d62837976628146178b0623f8984e50047c7`.

Both handoffs' `87672f288d5ff08429f44cbeaf9b576c1caa6900` snapshots also resolve and have the same corresponding bytes. Root has since staged finding updates: describe these snapshots as the pre-resolution source, not immutable copies of the new uncommitted evidence. The resolver selects the latest commit touching each path; inspect the emitted source link and receipt.

### Resolver invocation plan (not executed)

After root's original-trigger check, reference reconciliation, `fixed-upstream` update, and actual comment posting/readback, use these dry runs. Replace the review evidence with the durable promoted report path if committing it. `--upstream-commented` is an attestation, including in dry-run mode; this lane has not set it falsely.

```sh
npm run improvements:resolve -- \
  --file improvements/stellar-docs/sd-097-raven-backend-still-names-algolia.md \
  --resolved 2026-11-06 \
  --live-recheck '2026-11-06T18:42:08Z ordinary GET https://developers.stellar.org/docs/build/building-with-ai.md HTTP200, via Mintlify, zero Algolia; SHA256 6d5b6d53c7f0abe75c28c40b4d07bec3df92a87e31c722d0dfaf6094d4ab5d35; HTML and corresponding full-export section agree; root independent result must also be recorded.' \
  --review-evidence 'Independent Codex lane t35p: tmp/playground-final/final-handoff-review.md; fresh GET, direct upstream reviews/checks, adjacent prose, and repository references reviewed.' \
  --resolving-ref https://github.com/stellar/stellar-docs/issues/3064 \
  --resolving-ref https://github.com/stellar/stellar-docs/pull/3066 \
  --references-reviewed --upstream-commented --dry-run

npm run improvements:resolve -- \
  --file improvements/stellar-docs/sd-095-sdp-passkey-synchronization-boundary.md \
  --resolved 2026-11-06 \
  --live-recheck '2026-11-06T18:42:08Z ordinary GET https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets.md HTTP200; provider-managed key, explicit device-bound/synced distinction, one-passkey access warning, no never-leaves-device claim; SHA256 e57186a4f72e0024d276a2626068e52354bd50fbd0c4ef3a4b8ba2aee48653bf; root independent result must also be recorded.' \
  --review-evidence 'Independent Codex lane t35p: tmp/playground-final/final-handoff-review.md; fresh GET, direct upstream reviews/checks, adjacent prose, and repository references reviewed; deployed text does not explicitly claim end-to-end encryption.' \
  --resolving-ref https://github.com/stellar/stellar-docs/issues/3042 \
  --resolving-ref https://github.com/stellar/stellar-docs/pull/3057 \
  --references-reviewed --upstream-commented --dry-run
```

Inspect both dry-run receipts, then omit `--dry-run` only when all attestations are true. Do not use `--upstream-comment-na` or `--upstream-ref-gone`: these findings were filed and every inspected reference resolves. Verify receipt fields `id`, `title`, `service`, `discovered`, `resolved`, `repo`, `upstreamRefs`, `resolvingRefs`, `liveRecheck`, `reviewEvidence`, `sourceCommit`, and `sourceUrl`. Verify the active files and overrides are gone, the index is regenerated, and the two IDs occur exactly once as receipt IDs. Run the improvements-pipeline verification gates in the authorized root lane, respecting any broader round's service scope; this review did not launch unrelated service probes.

## Evidence inventory and limits

All detailed evidence is under `tmp/playground-final/handoff-review-evidence/`:

- `live.json`, response `.body` files, and allowlisted `.headers.txt`: fresh ordinary GET timestamps, statuses, byte hashes, and cache metadata. Headers exclude cookies and unrelated fields.
- `github-connector.json`: independently read public handoffs, issues, PR diffs and comments with authors.
- `reviews.json`: complete review decisions and empty inline-thread results.
- `checks.json`, `github-supplement.json`: head/merge check runs, all-history Mintlify deployment checks, merge actor, review requests, and PR rollups. GitHub reads span approximately 18:39–18:43 UTC.
- `sources.json` and matching bodies: public source snapshot verification and merge-commit MDX. Merge MDX SHA-256: sd-095 `a42eede52405f32bcf6ea5f86c75fe1151e56a43cd8cafd95a0a782ccafa7cb9`; sd-097 `d74f3d69e5ccba1422e7f2457b89a1678b04035271888d878b80b651190917d6`.
- `repo-references.txt`, `repo-rg-default.txt`: exact reference scans. No active eval/register reference was found.
- `collect.py`, `supplement.py`, `sources.py`: read-only collection commands for reproduction.

The supplied public page bodies are deployment evidence, not a browser-interaction test or an SDP authentication test. This lane independently repeated the original content triggers and inspected adjacent content; root's separate trigger check remains its responsibility. No claim is made about every cache location worldwide. The ordinary canonical URLs tested here serve the fixes.

## Final working-tree cleanup verification — 2026-11-06, 18:47–18:49 UTC

**PASS for both retirement cleanups.** This appendix supersedes the earlier prospective status, comment and cleanup conditions. I inspected the actual final working tree and independently read the four public resolution comments and new immutable source. No blocking defect was found in the finding deletions, receipts, generated index, intake cleanup or promoted evidence. Root's remaining notification closeout is listed separately below.

- Both active finding files are absent. Both per-finding intake overrides are absent, and the intake diff removes only those two overrides. Neither finding carried a probe.
- `improvements/resolved.json` contains exactly one receipt for sd-095 and one for sd-097. Each includes the correct discovery/resolution dates, service/repository, original issue and fixing PR in both reference arrays, root's exact timestamp/hash/result, independent review path, and source commit/permalink. The diff appends only these two receipts; prior receipts, including sd-079's historical successor reference, are unchanged.
- The generated index removes the two active rows and reports 102 findings. The independent read-only `npm run improvements:lint` completed successfully: `improvements lint ok (102 findings)`. Its index byte comparison also passes. The unrelated sk-039/sd-099 status changes belong to root's existing work and were untouched by this lane.
- `.agents/TODO.md` no longer lists sd-097/PR3066 as awaiting review/deployment. It records both retirements and links the resolution ledger. The sd-098/PR3067, sd-091 and other pending work remains. The final round ledger and research README now summarize these retirements and link the promoted evidence. Earlier dated pending observations remain historical.
- A fresh targeted `rg` over the index, intake, eval, catalog, specs, runtime, ecosystem skills and scripts has zero sd-095/sd-097 hits. No active golden/register reference requires repair.
- The promoted `handoff-retirement-review.md` was byte-identical to this review before this appendix. Root must copy this appended version as requested. `handoff-independent-live.json` is byte-identical to this lane's `live.json`. `handoff-root-live.json` contains separate 18:41 observations with the same two page hashes as this lane's independent 18:42 observations. `handoff-resolution-comments.json` contains the four real public comment IDs and the correct author. These files and the updated research README provide durable evidence paths; large raw page captures remain disposable tmp evidence.

### Four public resolution comments verified directly

Read the raw GitHub REST comment bodies with `gh api repos/stellar/stellar-docs/issues/comments/<id>` at `2026-11-06T18:47:27Z`. All four are by **kalepail**, not upstream maintainer endorsements. They report root verification at 18:41 and independent verification at 18:42, link the correct ordinary live page, identify the resolved original trigger, and link the matching `5ababf34190a23badac7979f58e0823e9125efe6` finding snapshot.

| Finding | Reference | Comment creation time (UTC) |
| --- | --- | --- |
| sd-095 | [issue3042 comment6692685797](https://github.com/stellar/stellar-docs/issues/3042#issuecomment-6692685797) | 2026-11-06T18:46:30Z |
| sd-095 | [PR3057 comment6692686278](https://github.com/stellar/stellar-docs/pull/3057#issuecomment-6692686278) | 2026-11-06T18:46:32Z |
| sd-097 | [issue3064 comment6692686883](https://github.com/stellar/stellar-docs/issues/3064#issuecomment-6692686883) | 2026-11-06T18:46:34Z |
| sd-097 | [PR3066 comment6692687346](https://github.com/stellar/stellar-docs/pull/3066#issuecomment-6692687346) | 2026-11-06T18:46:35Z |

The sd-095 comments explicitly avoid claiming deployed end-to-end-encryption wording. The sd-097 comments limit the absence of Algolia to the current Building with AI page, rather than the whole historical export. Their scope matches the independent evidence. Every original/fixing upstream reference in the two receipts is covered.

The new public immutable source snapshots were freshly fetched at approximately `18:47:27.97Z`, read in full and compared with `git show 5ababf34190a23badac7979f58e0823e9125efe6:<path>`. Public and committed bytes match:

- sd-095 SHA-256: `eb36f09a568f1910e32eecc02372ce6dbd7417f052384bcb133f10bb460faf38`.
- sd-097 SHA-256: `fa21e6b9e1267d6af87dd71bdb85371f343f65d91d2e36edf094ade1b79a23f5`.

Both snapshots contain `fixed-upstream` status and root's fresh live evidence. Their source commit/permalinks agree with the resolver receipts and all four comment bodies. These supersede the earlier pre-resolution snapshots for the final receipt; no uncommitted evidence is falsely represented by the new pins.

### Remaining notification closeout

At `2026-11-06T18:47:28Z`, Raven385 and Raven386 remained **open**, with their original unchanged update timestamps. The four Docs comments satisfy the upstream retirement comment gate; they do not acknowledge the inbound Raven notifications. Root should acknowledge each with the result and durable resolved receipt and then close it, as required by the improvements-pipeline handoff workflow. This is outstanding handoff bookkeeping, not a reason to resurrect either retired finding. This lane did not post or close anything. The new receipts correctly list only the two Docs refs per finding; the handoff URLs were not added to those source records.

The cleanup recheck ran only read-only commands in child terminal `t35t`; it exited 0 and was removed by its owning review lane. This follow-up changed only this report. Root retains responsibility for copying the final appendix, committing the promoted evidence and completing the two notification acknowledgements/closures.
