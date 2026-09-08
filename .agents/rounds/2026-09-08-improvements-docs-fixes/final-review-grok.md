# Independent completion review

Reviewer: Grok 4.6, high effort.
Role: independent adversarial completion reviewer.
This reviewer is not the author and is not the orchestrator.

## Verdict

**CHANGES-REQUIRED**

The `sd-043` content fix, independent review, resolver receipt, and generated corpus checks hold.
`sd-042` and `sd-047` correctly stay active because both exact search triggers still reproduce.
Handoff truth and the Raven inbound closeout for `sd-043` do not meet the completion bar.

## Scope and fixed point

- Fixed point: `origin/main` = `76e0bf4d00829e63146be206c1c834db5c22166d`
- Pushed commit: `767c981a9304bd74b167357ffdf9a39dd017cce4` on `codex/improvements-docs-fixes-2026-09-08`
- Candidate: that commit plus the current dirty tree
- Skills read: `AGENTS.md`, `.agents/skills/golden-truth/SKILL.md`, `.agents/skills/improvements-pipeline/SKILL.md`
- Mode: audit only. This file is the only file this reviewer wrote.

`767c981` records the deployed Docs fixes and sets `sd-043` to `fixed-upstream`.
The dirty tree runs the resolver: it deletes the active file, appends the receipt, and restamps provenance.

Do not merge `767c981` alone.
That commit still holds an active `fixed-upstream` file and has no receipt.

## Re-derived dispositions

I re-read the committed lane reports, then re-ran the live surfaces.
I did not accept the author's transcript as proof.

### `sd-043` — resolve

Independent Sol report: `verify-sd-043-sol.md`, verdict `PASS`.

Live rendered pages on 2026-09-08 still carry the corrected split:

- Sponsored Reserves: `(2 + numSubEntries + numSponsoring - numSponsored) * baseReserve`
- Both pages: `available balance = balance - minimum balance - liabilities.selling`
- `liabilities.selling` appears only in that available-balance identity

The original content trigger does not reproduce.
The Core split in the Sol report remains the right protocol fact.
No adjacent selling-liability formula conflict remains.
The pool-share residual stays in active `sd-046`.

Disposition: terminal resolve is warranted in the dirty tree.

### `sd-042` — keep active

Independent Fable report: `verify-sd-042-fable.md`.
The page and source are fixed.
The report withholds resolve until the search trigger clears.

This reviewer re-ran the exact production search:

`stellarDocs.search_docs({query:"deprecated Horizon API stellar-sdk networking layer",hitsPerPage:10,includeContent:true})`

Result: one hit at the EVM guide Soroban Client section.
Snippet still contains `the **deprecated** **Horizon** **API**`.

The rendered page now says `Horizon API (nearing end-of-life)` and has no `deprecated Horizon`.
The original two-surface trigger still reproduces on the search surface.

Disposition: keep `reported-upstream`. Do not resolve.

### `sd-047` — keep active

Independent Terra report: `verify-sd-047-terra.md`.
The later search delta supersedes the earlier `fixed-upstream` claim.

This reviewer re-ran both exact production searches:

- `query:"3-5 seconds"` still returns Validators with `every **3-5** **seconds**`
- `query:"5-7 seconds"` still returns Stellar Stack with `every **5-7** **seconds**`

Rendered Validators and Stellar Stack pages each contain one `every 5-7 seconds` sentence.
They contain zero `every 3-5 seconds` sentences.

Disposition: keep `reported-upstream`. Do not resolve.

## `sd-043` resolver receipt

`improvements/resolved.json` entry `sd-043` is present and complete:

| Field | Observed value |
|---|---|
| `id` | `sd-043` |
| `resolved` | `2026-09-08` |
| `repo` | `stellar/stellar-docs` |
| `upstreamRefs` | issue `2771` |
| `resolvingRefs` | issue `2771` and PR `2806` |
| `liveRecheck` | 2026-09-08T15:50:00Z rendered pages plus Core `7e64393b` |
| `reviewEvidence` | Sol report path plus comment `5588559296` |
| `sourceCommit` | `767c981a9304bd74b167357ffdf9a39dd017cce4` |
| `sourceUrl` | commit-pinned `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md` |

The active file is deleted.
The `sd-043` intake override is gone.
`improvements:lint` reports 70 findings and no live/resolved id collision.

`gh api` read-back of comment `5588559296`:

- Author: `kalepail` (`MEMBER`)
- Created: `2026-09-08T16:36:30Z`
- Body matches the resolver-generated comment, including the live recheck and snapshot URL

The comment is a Raven resolution notice.
It does not invert maintainer validation.

## Source snapshot

Commit `767c981` exists on `origin/codex/improvements-docs-fixes-2026-09-08`.
The blob URL returns HTTP 200.
Raw content matches `git show 767c981:improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md`.

The snapshot status is `fixed-upstream`.
It records PR `2806`, merge `ad0accbd`, Core `7e64393b`, the 15:50:00Z live recheck, and the Sol review path.

This meets the immutable-snapshot rule for the finding that the resolver deleted.

## Reference cleanup

Required current-state references were updated:

- `improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md` points at `improvements/resolved.json`
- `ideas/source-delivery-ranked-references.md` marks the Docs/Core conflict as fixed on 2026-09-08
- Both goldens replace the deleted active-file `rootCause` with Raven commit `767c981`
- `q-protocol-base-reserve-min-balance` keeps active `sd-046` as a second root cause

Historical `research/` and dated round records still name the old path.
Those records stay as provenance.
That is correct.

Raven inbound handoff `stellar-experimental/stellar-raven#131` is still open.
It has zero comments.
The improvements-pipeline skill requires an acknowledge-and-close after the receipt exists.
See finding F1.

Handoffs `#130` and `#132` stay open.
That is correct while `sd-042` and `sd-047` remain active.

## Generated artifacts

`npm run improvements:index` rewrote `improvements/INDEX.md` to 70 findings and removed the `sd-043` row.
The working-tree file already matched that output.

`npm run eval:qa:compile` wrote 500 cases.
Content SHA-256: `49bc52baae868ff48ca5c04d5f3a823cc7bb4fc0a4e4f5adae34810f954289cd`.
That hash matches `NEXT.md` and the Sol register follow-up.
It does not match the round-ledger sentence that still calls `5a66e56c…` the final corpus hash.
That sentence is the pre-resolver state.

`cases.json`, `sample.json`, and `lifecycle-registry.json` match the compiler.
They were not hand-edited after the source-case provenance change.

## Consistency register

`npm run eval:qa:register -- --check` reports `up to date`.
No cluster still carries a `reopened` object.

The dirty-tree `reSwept` reasons for `cluster-017`, `cluster-054`, `cluster-114`, `cluster-123`, and `base reserve` match `register-review-sol-v3.json`.
That helper file is untracked.
`register-review-sol.json` and `register-review-sol-v2.json` are committed.
See finding F4.

The Sol follow-up withdrew the fourth ADR-0008 caution for `q-protocol-ledger-close-time`.
The current goldens keep the accepted three-case set.
The cadence avoid item still rejects an immutable 3–5-second guarantee.
It does not add a new canonical-page caution.

## TODO and NEXT accuracy

`TODO.md` correctly keeps `sd-042` and `sd-047` on the two exact search triggers after `2026-09-09T00:00Z`.
It correctly forbids close of `#130` and `#132` until those findings reach terminal receipts.

False or stale handoff claims remain:

1. `NEXT.md` says the 70 findings include 56 `reported-upstream`, 11 `verified`, and 3 `declined-upstream`, then says `None is filed`.
   The 56 reported findings are already filed.
   The dropped qualifier made a true sentence about verified findings into a false sentence about the whole queue.
2. `NEXT.md` lists eleven verified findings including `sls-082`.
   `TODO.md` still says ten verified findings and omits `sls-082`.
   The live tree has exactly those eleven verified ids.
3. `NEXT.md` still says only local and remote `main` remain, and that the repository has no open pull request.
   This worktree is branch `codex/improvements-docs-fixes-2026-09-08` with a dirty resolver.
4. `TODO.md` never names Raven handoff `#131` as the `sd-043` close action.

Finding counts in `NEXT.md` otherwise match the tree: 70 active, 56 / 11 / 3.

## Validation claims

This reviewer re-ran the claimed local gates against the dirty tree:

| Claim | Result |
|---|---|
| `npm run improvements:lint` | `ok (70 findings)` |
| `npm run eval:qa:register -- --check` | `up to date` |
| `npm run eval:qa:compile` | 500 cases, SHA-256 `49bc52ba…289cd` |
| `npm run eval:qa:lint -- --since origin/main` | 0 errors, 62 warnings |
| `git diff --check origin/main` | clean |
| Resolution comment read-back | matches resolver text |
| Snapshot URL | HTTP 200, blob matches `767c981` |
| Exact `sd-042` search trigger | still stale |
| Exact `sd-047` search trigger | still stale |

The 62 warnings include the accepted ADR-0008 `symmetric-caution` warning on `q-protocol-ledger-close-time`.
That warning is not a new gospel error.

This reviewer did not run `improvements:lint --live` or `improvements:probes`.
The round ledger does not claim those two commands after the resolver.
The two Docs findings have no `probe` frontmatter.

## Reviewability and scope

The golden edits stay inside the three findings.
`sd-043` gospel now teaches the corrected formula.
The expired `sd-043` cautions are gone.
The `sd-046` caution remains on the accepted base-reserve case.

`q-infra-horizon-vs-rpc` still uses `truth.status: "disputed"` for rendered pages versus the stale index.
The notes use the lint-canonical partial cap for an attributed official-index quote.
That encoding is acceptable while the search trigger remains live.

`ideas/source-delivery-ranked-references.md` is in scope.
It had a present-tense active `sd-043` claim.

`NEXT.md` also adds `sls-082` to owner decision B.
That finding is already `verified` in the tree.
The count repair is useful.
It is not a product-code scope creep.
It is incomplete because `TODO.md` was not updated with it.

The Sol consistency file keeps superseded verdicts and then records the follow-ups.
That is acceptable for a dated review record.

## Findings

### F1 — High — Raven handoff `#131` is still open

`stellar-experimental/stellar-raven#131` is the inbound `sd-043` notification.
It is `open`.
It has no comments.

The improvements-pipeline skill requires an acknowledge-and-close after the receipt exists.
`TODO.md` names `#130` and `#132` only.

Repair:

1. Commit and push the dirty-tree receipt first.
2. Comment the live recheck, receipt, and `767c981` snapshot on `#131`.
3. Close `#131`.
4. Leave `#130` and `#132` open.

### F2 — Medium — `NEXT.md` says no finding is filed

The edited state list now ends with `None is filed` after counting 56 `reported-upstream` findings.

Repair: restore the qualifier.
State that the eleven verified findings are unfiled.
Do not say the reported findings are unfiled.

### F3 — Medium — verified-filing lists disagree

`NEXT.md` lists eleven verified findings, including `sls-082`.
`TODO.md` still lists ten and omits `sls-082`.

The live verified set is `ll-030`, `sd-046`, `sd-049`, `sd-050`, `sd-051`, `sd-052`, `sk-021`, `sk-022`, `sk-023`, `sk-024`, and `sls-082`.

Repair: make `TODO.md` and owner decision B name the same eleven ids.

### F4 — Medium — `register-review-sol-v3.json` is untracked

The post-resolver register close depends on this helper file.
The two earlier helper files are committed.

Repair: add `.agents/rounds/2026-09-08-improvements-docs-fixes/register-review-sol-v3.json` to the resolver commit.

### F5 — Low — `NEXT.md` still claims a clean `main`-only repository

The same handoff section says only local and remote `main` remain, and that no pull request is open.
This branch and dirty tree contradict that present-state claim.

Repair: mark those sentences as the 2026-09-04 closeout, or remove them from the current handoff.

### F6 — Low — round ledger still calls the pre-resolver hash final

`.agents/rounds/2026-09-08-improvements-docs-fixes.md` still names corpus SHA-256 `5a66e56c…` as the final corpus.
The resolver changed provenance and the compiler now emits `49bc52ba…`.

Repair: label `5a66e56c…` as pre-resolver, and record `49bc52ba…` as the post-resolver hash.

## Actionable findings

1. Acknowledge and close Raven handoff `#131` after the receipt commit is public. Keep `#130` and `#132` open.
2. Fix `NEXT.md` so `None is filed` applies only to the unverified-or-verified-unfiled set, not to 56 reported findings.
3. Align `TODO.md` with the eleven verified findings, including `sls-082`.
4. Commit `register-review-sol-v3.json` with the resolver.
5. Remove or qualify the `NEXT.md` claim that only `main` remains.
6. Record the post-resolver corpus SHA-256 `49bc52ba…` in the round ledger.
7. Commit the dirty-tree resolver before any merge. Do not land `767c981` without the receipt.

## CHANGES-REQUIRED
