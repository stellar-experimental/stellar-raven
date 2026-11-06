# Docs retirement mechanical review

**Verdict: all20 approved retirements pass local lifecycle, receipt, immutable-source and upstream-comment checks.** Two root completion steps remain at this snapshot: close19 inbound Raven notifications, and regenerate corpus output (two stale retired paths). Historical hash provenance is honestly qualified and passes.

Reviewer: docs lane t2dv, Astra high, distinct from resolver author t1d1. Scope is the union of resolve-docs-first.json (15) and resolve-docs-final.json (5); no other retirements are certified here. Both batches had completed before checking. Live-fix approval remains in docs-independent.md (t2dx); this bounded pass does not repeat live triggers or override that review.

## Mechanical results

- Exactly one complete resolved receipt per ID, all dated2026-11-06. Each matches the approved liveRecheck and resolving PRs, identifies the distinct review, and has correct stellar-docs service/repository and source path.
- All20 active finding files and intake overrides are absent. Probes are frontmatter-owned, so none remain in listFindingFiles/parseFinding. The active collection contains none of these IDs.
- improvements/INDEX.md exactly equals renderIndex(listFindingFiles().map(parseFinding)); observed102 active findings. No shared generation was performed by reviewer.
- All20 immutable raw source URLs returned HTTP200; bytes exactly equal git show sourceCommit:path, contain the correct finding ID, and every sourceCommit is an ancestor of origin/main.
- Independently read every recorded upstream issue comment via gh api. Every original upstream ref has a resolution comment containing the exact receipt liveRecheck and immutable source URL.19 linked Raven notifications were still OPEN at this read; sd082 has no notification.

| ID | Immutable source | Independently read resolution comment |
|---|---|---|
| sd-060 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-060-x402-wallet-list-albedo-auth-entry.md) | [comment](https://github.com/stellar/stellar-docs/issues/2997#issuecomment-6674833404) |
| sd-063 | [source](https://github.com/stellar-experimental/stellar-raven/blob/b73c8c2f99a724138447339b8e753647e33e1724/improvements/stellar-docs/sd-063-restore-ttl-4095-stale.md) | [comment](https://github.com/stellar/stellar-docs/issues/3000#issuecomment-6674834156) |
| sd-065 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-065-debugging-errors-limitexceeded-name.md) | [comment](https://github.com/stellar/stellar-docs/issues/3001#issuecomment-6674834826) |
| sd-066 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-066-test-events-guide-all-semantics.md) | [comment](https://github.com/stellar/stellar-docs/issues/3002#issuecomment-6674835513) |
| sd-067 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-067-token-interface-sep41-mint-clawback-events.md) | [comment](https://github.com/stellar/stellar-docs/issues/3003#issuecomment-6674836123) |
| sd-068 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-068-events-ingest-retention-7-days-at-most.md) | [comment](https://github.com/stellar/stellar-docs/issues/3004#issuecomment-6674836819) |
| sd-071 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-071-zk-page-omits-protocol-26-bn254-functions.md) | [comment](https://github.com/stellar/stellar-docs/issues/3006#issuecomment-6674837455) |
| sd-073 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-073-indexers-goldsky-mirror-stellar.md) | [comment](https://github.com/stellar/stellar-docs/issues/3008#issuecomment-6674838181) |
| sd-078 | [source](https://github.com/stellar-experimental/stellar-raven/blob/06d7bc0e48ac13303d0f7203a557125b79f0e7c1/improvements/stellar-docs/sd-078-simulate-deep-dive-restore-before-submit.md) | [comment](https://github.com/stellar/stellar-docs/issues/3016#issuecomment-6674838754) |
| sd-080 | [source](https://github.com/stellar-experimental/stellar-raven/blob/610a7c3c25b2d582709f17a0beb8628a0f8f9cf5/improvements/stellar-docs/sd-080-fuzzing-note-soroban-contract-build.md) | [comment](https://github.com/stellar/stellar-docs/issues/3024#issuecomment-6674839381) |
| sd-083 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-083-toml-array-order-is-not-universal.md) | [comment](https://github.com/stellar/stellar-docs/issues/3030#issuecomment-6674840075) |
| sd-084 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-084-authorization-sandwich-operations-are-ordered.md) | [comment](https://github.com/stellar/stellar-docs/issues/3031#issuecomment-6674840734) |
| sd-085 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-085-sac-authorization-prose-names-set-auth.md) | [comment](https://github.com/stellar/stellar-docs/issues/3032#issuecomment-6674841399) |
| sd-086 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-086-strict-send-destination-parameter-descriptions.md) | [comment](https://github.com/stellar/stellar-docs/issues/3033#issuecomment-6674841999) |
| sd-087 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-087-simulation-authmode-default-is-conditional.md) | [comment](https://github.com/stellar/stellar-docs/issues/3034#issuecomment-6674842530) |
| sd-069 | [source](https://github.com/stellar-experimental/stellar-raven/blob/ea544f5f190552cb7616c80407aa24fb550e75c9/improvements/stellar-docs/sd-069-evm-advanced-concepts-deprecated-events-publish.md) | [comment](https://github.com/stellar/stellar-docs/issues/3005#issuecomment-6674857563) |
| sd-079 | [source](https://github.com/stellar-experimental/stellar-raven/blob/b73c8c2f99a724138447339b8e753647e33e1724/improvements/stellar-docs/sd-079-building-with-ai-names-raven-alias-host.md) | [comment](https://github.com/stellar/stellar-docs/issues/3019#issuecomment-6674858180) |
| sd-082 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-082-issuer-lock-omits-other-signers.md) | [comment](https://github.com/stellar/stellar-docs/issues/3029#issuecomment-6674858860) |
| sd-094 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-094-gettransactions-result-meta-xdr-type.md) | [comment](https://github.com/stellar/stellar-docs/issues/3041#issuecomment-6674859500) |
| sd-089 | [source](https://github.com/stellar-experimental/stellar-raven/blob/e5865654902461d4a46b140871d929a70e72c1c6/improvements/stellar-docs/sd-089-simulation-preview-decodes-before-success-check.md) | [comment](https://github.com/stellar/stellar-docs/issues/3036#issuecomment-6674860234) |

## Persistent references and provenance

Scanned493 ID references across60 persistent files, excluding temporary evidence. Authored current golden references and historical finding links are reconciled to immutable sources or the resolved ledger; original historical observations remain dated. The three separately scoped successors persist as sk038 (stellar-dev-skill177), sd097 (Docs3064), sd098 (Docs3065). Current round reports retain their original inventory/results as review history. The only remaining bare deleted paths outside this round inventory were generated eval/qa/cases.json entries for sd082 and sd068; root owns regeneration. Register semantics are covered by scout-golden-review.md and the other reviewer’s Docs review; root owns final member hashes.

Independently checked all59 immutable path/hash objects (29 unique IDs) in research/audits/2026-11-03-qa-followup/case-dispositions.json against git blobs and the original fec1c79f3ae4e4210e7d988c3aff40cda9928482 version. Every linked snapshot hash matches actual bytes, every linked commit belongs to origin/main history, and every original captured hash is preserved. For sd082/083/084/085/086/087/089/094, searched every surviving origin/main revision of its finding: none matches the original captured bytes. These eight IDs explicitly retain capturedSha256, add snapshotSha256, and explain that the later published snapshot is historical context rather than byte-exact capture proof. This is an accepted provenance limitation, not a fabricated exact match; it does not undermine the independently freshly rechecked fix.

## Reproduction

Run from repository root:

```sh
python3 research/audits/2026-11-05-improvements/docs-retirement-check.py
python3 research/audits/2026-11-05-improvements/docs-historical-provenance-check.py
node --input-type=module -e "import {renderIndex} from './scripts/improvements-lib.mjs'; import {readFileSync} from 'node:fs'; if(renderIndex()!==readFileSync('improvements/INDEX.md','utf8')) process.exit(1)"
```

The read-only retirement script derives each target receipt/source from the durable ledger, verifies public source bytes and exact upstream comment content, and reports notification state. The original review also compared each receipt against root’s approved batch arguments. The provenance script fixes its original comparison revision, so later commits cannot silently change the baseline. Compact machine receipts: tmp/truth-2026-11-05/docs/retirement/{receipts,provenance}.json; original scripts and reference inventory are alongside them. No GitHub writes, shared edits, lifecycle changes, paid calls or evals by reviewer.

## Final completion check — PASS

The two previously pending root steps are complete. Fresh independent gh API reads now find all19 scoped Raven inbound notifications CLOSED (zero open); compact receipts are in tmp/truth-2026-11-05/docs/retirement/final-notifications.json. Regenerated eval/qa/cases.json and sample.json contain no bare retired target paths; the sd082/sd068 leftovers identified above are gone. Final independent register --check passes. Together with the20 successful receipt/source/comment/lifecycle checks and qualified historical provenance above, the bounded Docs retirement mechanical review is fully approved. No outstanding finding; no shared edits by reviewer.
