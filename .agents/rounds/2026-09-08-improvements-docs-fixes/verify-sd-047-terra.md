# Independent verification: `sd-047`

## Scope and result

I performed this read-only verification on 2026-09-08.
I read the active finding, issue #2805, merged PR #2806, current source, and rendered pages.
PR #2806 fully resolves the `sd-047` cadence conflict.
The fix is deployed.
The finding qualifies as `fixed-upstream`.

The active record must still complete the local resolution workflow.
This lane did not change that record.

## Claim matrix

| Claim | Source class | Exact source | Observation | Result |
|---|---|---|---|---|
| The active claim was a `3-5` versus `5-7` conflict. | Local active finding | `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` | The finding records the Validators sentence as `3-5 seconds`. It records the Stellar Stack sentence as `5-7 seconds`. | Reproduced historical claim. |
| The intended correction changes Validators to `5-7`. | Merged upstream PR diff | https://github.com/stellar/stellar-docs/pull/2806 | The PR changes only the cadence sentence in `docs/validators/README.mdx`. It replaces `every 3-5 seconds` with `every 5-7 seconds`. | Exact fix matches the finding recommendation. |
| The PR merged. | GitHub PR metadata | https://github.com/stellar/stellar-docs/pull/2806 | `merged_at` is `2026-09-08T15:05:25Z`. The merge commit is [`ad0accbd0da545ccba12b5a01fd5dc9e387977f8`](https://github.com/stellar/stellar-docs/commit/ad0accbd0da545ccba12b5a01fd5dc9e387977f8). | Merged. |
| The resolving issue closed. | GitHub issue metadata | https://github.com/stellar/stellar-docs/issues/2805 | The issue is `closed` with reason `completed`. It closed at `2026-09-08T15:05:26Z`. | Closed by the merged fix. |
| Current source has identical sentences. | Current upstream Git tree and blobs | [`main` commit `997a85c23f5c458313fac4c30ec4fbd4c4e841ef`](https://github.com/stellar/stellar-docs/commit/997a85c23f5c458313fac4c30ec4fbd4c4e841ef) | The current tree maps Validators to blob `f74c26290ba7653f584805bb3b02867b97aee3af`. It maps Stellar Stack to blob `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713`. Both contain the same `5-7` sentence. | Original trigger does not reproduce in source. |
| The rendered site has identical sentences. | Direct rendered-page HTTP reads | https://developers.stellar.org/docs/validators and https://developers.stellar.org/docs/learn/fundamentals/stellar-stack | At `2026-09-08T15:43:24Z`, no-cache GET requests returned `200`. Each HTML body contained one `5-7 seconds` occurrence. Each contained zero `3-5 seconds` occurrences. | Deployed. Original trigger does not reproduce live. |
| No residual `3-5` cadence claim remains. | Current upstream docs-tree sweep | `stellar/stellar-docs` at `997a85c23f5c458313fac4c30ec4fbd4c4e841ef` | `rg -l -i '3[[:space:]]*[-–][[:space:]]*5[[:space:]]*seconds' docs` returned zero files. The matching `5-7` search returned exactly the two canonical files. | No residual conflict found. |
| The owner reported deployment. | Upstream issue comment | https://github.com/stellar/stellar-docs/issues/2805#issuecomment-5587809243 | The comment reports a successful deployment at `2026-09-08T15:10:43Z`. It reports a live read at `2026-09-08T15:37:28Z`. | Supplemental evidence only. Direct rendered reads independently prove deployment. |

## Current source evidence

The current default-branch commit is
[`997a85c23f5c458313fac4c30ec4fbd4c4e841ef`](https://github.com/stellar/stellar-docs/commit/997a85c23f5c458313fac4c30ec4fbd4c4e841ef).
I observed it at `2026-09-08T15:42:29Z`.

The current Validators source is
[`docs/validators/README.mdx`](https://github.com/stellar/stellar-docs/blob/997a85c23f5c458313fac4c30ec4fbd4c4e841ef/docs/validators/README.mdx).
Its current blob is `f74c26290ba7653f584805bb3b02867b97aee3af`.
The commit-pinned raw source is
https://raw.githubusercontent.com/stellar/stellar-docs/997a85c23f5c458313fac4c30ec4fbd4c4e841ef/docs/validators/README.mdx.

The current Stellar Stack source is
[`docs/learn/fundamentals/stellar-stack.mdx`](https://github.com/stellar/stellar-docs/blob/997a85c23f5c458313fac4c30ec4fbd4c4e841ef/docs/learn/fundamentals/stellar-stack.mdx).
Its current blob is `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713`.
The commit-pinned raw source is
https://raw.githubusercontent.com/stellar/stellar-docs/997a85c23f5c458313fac4c30ec4fbd4c4e841ef/docs/learn/fundamentals/stellar-stack.mdx.

Both current sources contain this exact sentence:

> Generally, nodes reach consensus, apply a transaction set, and update the ledger every 5-7 seconds.

The Validators blob changed from `37f879807c150e794578e80d2e751597938f8423` to `f74c26290ba7653f584805bb3b02867b97aee3af`.
The Stellar Stack blob did not change.
It already contained the `5-7` sentence.

## Rendered deployment evidence

I checked both deployed URLs again at `2026-09-08T15:42:32Z` and `2026-09-08T15:42:33Z`.
Both responses were `HTTP/2 200`.

| URL | `Last-Modified` | `3-5 seconds` count | `5-7 seconds` count |
|---|---:|---:|---:|
| https://developers.stellar.org/docs/validators | `2026-09-08T15:32:37Z` | 0 | 1 |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-stack | `2026-09-08T15:32:23Z` | 0 | 1 |

An independent no-cache read occurred at `2026-09-08T15:43:24Z`.
It returned `cf-cache-status: DYNAMIC` for both pages.
The Validators page had `Last-Modified: 2026-09-08T15:41:58Z`.
The Stellar Stack page had `Last-Modified: 2026-09-08T15:41:44Z`.
Both bodies had the identical `5-7` sentence.

The deploy proof is the direct rendered content.
The PR merge and issue closure are not deployment proof by themselves.

## Residual cadence sweep

I searched the current `docs/` tree at commit `997a85c23f5c458313fac4c30ec4fbd4c4e841ef`.
The literal and spaced-hyphen search included ASCII and en-dash variants.

| Pattern | Result |
|---|---|
| `3[[:space:]]*[-–][[:space:]]*5[[:space:]]*seconds` | Zero files. |
| `5[[:space:]]*[-–][[:space:]]*7[[:space:]]*seconds` | `docs/validators/README.mdx:10` and `docs/learn/fundamentals/stellar-stack.mdx:22`. |

The two `5-7` matches contain the same full sentence.
No residual `3-5` cadence wording remains in `docs/`.

GitHub code search gives the same literal outcome.
Its `3-5 seconds` query returns zero `docs/` results.
Its `5-7 seconds` query returns the same two files.
The indexed result page names source snapshot `79a50fde577f83d63e284993ad86a9f47bd4cddf`.
Direct current-tree checks above control the conclusion.

## Issue, PR, and comment identities

Issue #2805 was opened by GitHub user `kalepail`.
PR #2806 was authored by GitHub user `ElliotFriend`.
The GitHub profile identifies that user as Elliot Voris at `@stellar`.

The cited issue comment is by `ElliotFriend` (Elliot Voris).
It was created at `2026-09-08T15:40:23Z`.
Its exact URL is https://github.com/stellar/stellar-docs/issues/2805#issuecomment-5587809243.
I treat it as an owner report, not independent deployment proof.

GitHub user `kaankacar` approved the PR at `2026-09-08T15:05:02Z`.
The GitHub profile identifies that user as Kaan Kacar at the Stellar Development Foundation.
I do not rely on that approval for the cadence claim.

## Classification

`sd-047` qualifies as `fixed-upstream`.
The source, full docs-tree sweep, and rendered pages all remove the original contradiction.
The merged PR directly made the required correction.
The live rendered pages prove deployment.

The finding is ready for the local fixed-upstream and resolver workflow.
This report supplies the distinct re-derivation required before retirement.
The workflow still needs its required active-record cleanup and resolution receipt.

## Persistent repository references that need cleanup

The following items are active or current-state references.
They need cleanup during the authorized resolver change.

1. `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md`
   - Set the status to `fixed-upstream`, then resolve it.
   - The resolver should append the required receipt and remove the active file.
2. `improvements/INDEX.md:56`
   - Regenerate the index after the resolver removes the active finding.
3. `.agents/TODO.md:16-27`
   - Remove the completed merge-triggered recheck item.
4. `.agents/NEXT.md:77,114,126,220-221`
   - Remove or update stale open, waiting, conflict, and caution statements.
5. `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`
   - Update current Validators guidance.
   - Remove active `sd-047` and TODO references if current metadata needs no finding.
   - Keep dated 2026-08-30 and 2026-08-31 observations as historical provenance.
6. `eval/qa/cases.json` and `eval/qa/sample.json`
   - Regenerate both derived files after the owned case changes.
7. `.agents/rounds/2026-09-08-improvements-docs-fixes/verify-sd-047-terra.md`
   - Keep this verification report in the active round ledger.

No `sd-047` intake override exists.
Do not delete dated evidence under prior `.agents/rounds/` records or `research/`.
Those records describe true historical states.

## Targeted production Raven delta

I reran the original Raven evidence at `2026-09-08T15:49:07Z`.
I used the current production Raven `execute` surface.
I ran these calls in one read-only script:

```js
stellarDocs.search_docs({ query: "3-5 seconds", hitsPerPage: 10, includeContent: true })
stellarDocs.search_docs({ query: "5-7 seconds", hitsPerPage: 10, includeContent: true })
```

Both calls returned `{ ok: true }`.

| Query | Exact Raven result | Result |
|---|---|---|
| `3-5 seconds` | One hit at https://developers.stellar.org/docs/validators. Its snippet says `consensus, apply a transaction set, and update the ledger every **3-5** **seconds**.` | The Algolia index still carries the stale Validators text. |
| `5-7 seconds` | Two hits. The canonical hit is https://developers.stellar.org/docs/learn/fundamentals/stellar-stack#stellar-core. Its snippet says `consensus, apply a transaction set, and update the ledger every **5-7** **seconds**.` The second hit is the unrelated workspace guide. | The correct Stellar Stack record remains indexed. |

The Docs deployment corrected the rendered pages and source tree.
It did not yet refresh the production Raven Algolia result for Validators.
The original Raven `stellarDocs.search_docs` trigger still reproduces.

This delta supersedes the earlier lifecycle classification.
`sd-047` does not yet qualify as `fixed-upstream`.
Keep the active finding as `reported-upstream` until the production index removes the stale result.
Do not run the resolver or delete its active references yet.

The stale index is a residual search-surface defect.
It needs a fresh upstream recheck after the crawler refreshes.

CHANGES-REQUIRED
