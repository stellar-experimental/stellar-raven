# Independent verification: does stellar/stellar-docs#2806 fully resolve sd-042?

Reviewer: Claude Fable 5.1, high effort (lane `docs_horizon_fable`).
Lane: research-only. This file is the only file the lane wrote.
Observation window: 2026-09-08T15:41:39Z to 2026-09-08T15:43:30Z (all live reads below).
Author of the fix and of the handoff differ from this reviewer. This reviewer did not
author the finding, the issue, or the PR.

## 1. Sources read

| Source | Identifier observed | Class |
|---|---|---|
| Active finding | `improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md` at worktree HEAD `76e0bf4` (file last changed `81ba59a`, 2026-08-19) | E (repo record) |
| Upstream issue | https://github.com/stellar/stellar-docs/issues/2770 — opened 2026-08-19T20:36:57Z by `kalepail` (MEMBER), closed 2026-09-08T15:05:27Z as completed by `ElliotFriend` | C (upstream tracker) |
| Upstream PR | https://github.com/stellar/stellar-docs/pull/2806 — author `ElliotFriend` (MEMBER), head `2632c7a3681cb964ae7612325f085d1eacfa8b0d`, base `d2f5cd7ba07a685821b8ebef80f520134686c9d4`, merged 2026-09-08T15:05:25Z by `ElliotFriend` | C |
| Merge commit | https://github.com/stellar/stellar-docs/commit/ad0accbd0da545ccba12b5a01fd5dc9e387977f8 — git author "Elliot Voris <elliot@stellar.org>", 4 files, +7/-3; touches `docs/learn/migrate/evm/smart-contract-deployment.mdx` (+1/-1) | B (upstream source) |
| Current upstream `main` | `997a85c23f5c458313fac4c30ec4fbd4c4e841ef` (2026-09-08T15:37:39Z), shallow clone taken 2026-09-08T15:41:39Z. The round ledger recorded `79a50fde…` at its first re-check; two commits landed since, neither touching Horizon wording. | B |
| Current file blob | `docs/learn/migrate/evm/smart-contract-deployment.mdx` blob `c7b63187d38d9d368e7eadade08df45d88bff886` at `997a85c2`; identical to the post-image blob in the PR diff (`index 9d54df6a6..c7b63187d`) | B |
| Pre-PR `docs/README.mdx` | blob `62af02b8dcf5af59695f11e2b4cc5c5ce9fdb242` at base `d2f5cd7b`, line 24 already reads `Horizon (nearing end-of-life)` | B |
| Deploy workflow | https://github.com/stellar/stellar-docs/actions/runs/34242504493 "Build and push stellar-docs", head `ad0accbd`, created 2026-09-08T15:05:28Z, success 2026-09-08T15:10:43Z (read via `gh run list --commit`) | B |
| Rendered EVM guide | https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment — HTTP 200 via curl at 2026-09-08T15:42:21Z | A (official rendered docs) |
| Rendered canonical pages | /docs/data/apis, /docs/learn/fundamentals/stellar-stack, /docs/tools/lab/api-explorer/horizon-endpoint, /docs/tools/lab/api-explorer, /docs, /docs/data/apis/horizon | A |
| Raven search surface | `stellarDocs.search_docs` (Algolia index `crawler_Stellar Docs - Docusaurus`) via the production Raven MCP, 2026-09-08 ~15:43Z | D (Raven-exposed derived index) |
| Handoff issue | https://github.com/stellar-experimental/stellar-raven/issues/130 — opened 2026-09-08T15:38:59Z by `ElliotFriend` (MEMBER), open | C |

### Cited comments and their authors

- PR #2806 comment https://github.com/stellar/stellar-docs/pull/2806#issuecomment-5572761807,
  2026-09-07T15:24:29Z, account `kaankacar` (MEMBER). The body self-labels as
  "Automated message from Kaan's Automated Triage Bot" and carries a hidden
  `automated-triage-bot head:2632c7a3…` marker. Treat it as a bot post under a human account.
  Its claim "Canonical pages still put Horizon deprecation in the future" was re-derived below.
- PR #2806 approval https://github.com/stellar/stellar-docs/pull/2806#pullrequestreview-5143452105,
  2026-09-08T15:05:02Z, `kaankacar` (MEMBER), state APPROVED at head `2632c7a3`.
- Issue #2770 comment https://github.com/stellar/stellar-docs/issues/2770#issuecomment-5587808641,
  2026-09-08T15:40:21Z, `ElliotFriend` (MEMBER). Claims: merge `ad0accbd`, deploy success
  15:10:43Z, live observation 15:37:28Z, and "no line in `docs/` now pairs Horizon with a
  present-tense deprecated". Each claim was re-derived below; none was accepted on trust.
- Copilot reviews (`copilot-pull-request-reviewer[bot]`) on 2026-08-31 concerned the
  minimum-balance formula (sd-043), not the Horizon clause.
- Three `stellar-jenkins-ci[bot]` preview comments (2026-08-31) point at an expired preview host.

## 2. Claim matrix

Classes: A = official rendered developers.stellar.org page; B = upstream git source, commit,
or workflow; C = upstream maintainer statement or tracker state; D = Raven-exposed derived
search index; E = this repository's records.

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | The EVM guide rendered page no longer contains `deprecated Horizon` | **Confirmed** | A: curl of the page, `grep -o -i 'deprecated Horizon'` count 0 |
| 2 | The EVM guide rendered page contains `the Horizon API (nearing end-of-life)` in the Soroban Client sentence | **Confirmed** | A: count 1; extracted clause "as well as the Horizon API (nearing end-of-life), simplifying the process of building and signing transactions." |
| 3 | The source file on current `main` carries the same clause | **Confirmed** | B: line 65 of `docs/learn/migrate/evm/smart-contract-deployment.mdx` at `997a85c2`, blob `c7b63187d` |
| 4 | Merge commit `ad0accbd` exists, is PR #2806, and is deployed | **Confirmed** | B: commit metadata; "Build and push stellar-docs" run 34242504493 succeeded 15:10:43Z; A: live page matches the merged source |
| 5 | The four canonical pages still carry the hedged future-tense sentence | **Confirmed** | A: all four rendered pages return "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs." B: three source sites (`stellar-stack.mdx:40`, `horizon-endpoint.mdx:5`, `data/apis/README.mdx:32`). The fourth page, `/docs/tools/lab/api-explorer`, has no such sentence in its own source; it renders a `DocCardList` whose card for `horizon-endpoint` derives its description from that page's first paragraph. So there are three source copies and four rendered copies. |
| 6 | The short form `(nearing end-of-life)` is site convention, not new phrasing | **Confirmed** | B: `docs/README.mdx:24` at pre-PR base `d2f5cd7b` already used it; A: rendered /docs shows it |
| 7 | No line in upstream `docs/` pairs Horizon with a present-tense "deprecated" | **Confirmed** | B: tree-wide grep at `997a85c2` for `deprecated … Horizon`, `Horizon … is/are/now deprecated`, `deprecated Horizon` returns 0 hits; every Horizon+deprecat line is future tense (listed in section 4) |
| 8 | The Raven-exposed search index no longer returns the defect text | **Not confirmed** | D: `stellarDocs.search_docs("deprecated Horizon API stellar-sdk networking layer")` returned one hit, `…/smart-contract-deployment#soroban-client`, snippet "…as well as the **deprecated** **Horizon** **API**, simplifying…". The Algolia record predates the deploy. The DocSearch crawler schedule is "every 1 day at 12:00 am" (`research/services/stellar-docs-algolia.md`), so the next crawl after 15:10Z is expected around 2026-09-09T00:00 |
| 9 | The recommendation's second half (shared partial for the lifecycle sentence) shipped | **Not done, declared** | C: PR body "Left out on purpose"; handoff issue #130 and the #2770 closing comment both state the class fix did not ship. B: no partial or import exists; the sentence is still copied in three source files |
| 10 | The replacement matches the recommendation's literal wording | **Deviation, acceptable** | The recommendation asked for the canonical sentence verbatim. The defect sits inside a clause about the SDK's networking layer, where the standalone sentence does not fit. The short form removes the tense conflict, which is the finding. |
| 11 | Issue #2770 is closed as completed and cross-linked | **Confirmed** | C: state closed, `state_reason: completed`, closed 15:05:27Z by `ElliotFriend`; `closed_by_pull_requests.total_count` is 0 because the API did not link the PR, but the merge commit message carries "Refs #2770" and the PR body carries "Closes #2770" |

## 3. Re-derivation summary

The rendered page, the merged source blob, and the deploy run agree. The
present-tense label is gone from the page and from the whole upstream `docs/` tree. The
four canonical pages did not move, so the labels now agree rather than both having
changed. The bot comment's claim and the maintainer's closing comment are both correct.

The one surface that still shows the defect is Raven's own docs search, which serves a
daily-crawled Algolia index. That index lags the deploy by up to one crawl cycle.

## 4. Adjacent Horizon lifecycle wording (upstream, at `997a85c2`)

None of these is the sd-042 defect class. All are future tense or a different label.

| File and line | Text | Assessment |
|---|---|---|
| `docs/data/indexers/README.mdx:16` | "…as Horizon will be deprecated." | Future tense. Consistent. |
| `docs/data/indexers/README.mdx:36` | "Horizon will soon be deprecated, but for now it is the only way to get some of this data." | Future tense, but "soon" is firmer than the canonical "eventually". Same observation the handoff made. Not a contradiction of tense; a contradiction of urgency. Candidate for the class-level cleanup, not a new finding on its own. |
| `docs/build/building-with-ai.mdx:59` | "…modern Stellar RPC or the legacy Horizon endpoints" | "Legacy" is a third label. It does not assert deprecation. Note only. |
| `docs/data/apis/horizon/README.mdx` | No lifecycle sentence at all (source grep and rendered page both empty for deprecat/end-of-life/legacy) | The Horizon landing page carries no status notice while its parent `/docs/data/apis` does. Gap, not contradiction. Same state the sd-017 receipt recorded on 2026-07-27. |
| `docs/data/apis/migrate-from-horizon-to-rpc.mdx` | No lifecycle label | Consistent with sd-017 receipt. |

## 5. Is the fix deployed? Does the finding qualify as fixed-upstream?

**Deployed: yes.** Merge `ad0accbd` at 15:05:25Z, build-and-push success at 15:10:43Z, and
the corrected clause observed on the live page at 15:42:21Z by content match.

**Qualifies as fixed-upstream: yes, for the occurrence.** The lifecycle rule in
`improvements/README.md` is "an author-side live re-check confirms the fix". The rendered
page confirms it. This reviewer independently repeated the original trigger, which is the
lifecycle gate for the later resolve step.

**Does not qualify for resolve-and-delete today.** Two gates are not met:

1. The original evidence used two instruments: a page read and `stellarDocs.search_docs`.
   The second instrument still returns the defect text (claim 8). Resolution should wait for
   one crawl cycle and a repeat of that exact search. Expected to clear after
   2026-09-09T00:00 crawler time.
2. Repository references still encode the dispute as live (section 6).

**Class versus occurrence.** PR #2806 resolves the sd-042 occurrence. It does not resolve the
defect class, which has recurred once (sd-017, cleared 2026-07-27) and once more (sd-042).
The shared-partial recommendation is unshipped and, by upstream's own statement, wanted.
It needs a tracked home. Options: a new proposed finding with the three source copies and
`indexers/README.mdx:36` as evidence, or an explicit `disposition` note in the sd-042 resolve
receipt saying the class fix remains open upstream.

## 6. Persistent repository references that need cleanup

Live records that state the dispute as current. Each must change before the finding is
deleted. Generated artifacts are rebuilt by their scripts, never hand-edited.

| Path | What it says now | Required action |
|---|---|---|
| `improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md` | `status: reported-upstream` | Flip to `fixed-upstream` with dated live-recheck evidence (this report), the merge commit, the deploy run, and the search-index caveat. Later: `npm run improvements:resolve` with `--references-reviewed` after the items below land. |
| `improvements/intake.json` lines 167-170 | `sd-042` override: "contradicts four canonical Docs pages" | Removed by the resolve script (`resolveIntake`) at resolution time. No manual edit. |
| `improvements/INDEX.md` line 51 | `sd-042 … reported-upstream … 0` | Regenerate with `npm run improvements:index` after the status flip and again after resolve. |
| `improvements/resolved.json` | No sd-042 receipt | Appended by the resolve script. The receipt should name `sd-017` as the prior occurrence and record that the class fix is still open. |
| `eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json` | `truth.status: "disputed"`, `asOf: "2026-07-11"`; corroboration claim at line 84 "the EVM migration guide calls it deprecated"; source note line 91 "calls Horizon the deprecated Horizon API"; provenance lines 141 and 147 dated 2026-08-29; `rootCause` line 152 points at the sd-042 file | Golden-truth edit under the `golden-truth` skill: the dispute is resolved as of 2026-09-08. Rewrite the disputed claim as confirmed-consistent, or keep it dated as a historical dispute with a 2026-09-08 resolution line. Keep the 2026-08-29 provenance lines as history; add the new observation, do not rewrite old ones. The `rootCause` pointer will dangle after deletion and must point at the `resolved.json` receipt instead. |
| `eval/qa/cases.json` lines 21651-21718 | Same content as the battery case | Generated. Rebuild with `npm run eval:qa:compile` after the battery edit. Never edit by hand. |
| `.agents/TODO.md` lines 16-27 | "Re-check `sd-047` only after PR #2806 merges" | The trigger has fired. Not an sd-042 reference, but the same PR; the sd-047 lane owns it. |
| `.agents/rounds/2026-09-08-improvements-docs-fixes.md` | Lane row for sd-042 shows `running`; upstream `main` recorded as `79a50fde…` | Ledger owner updates the row with this report's verdict and may note the newer `997a85c2` head. |

Historical records to leave untouched (dated provenance, not live claims):
`research/qa-miss-analysis-2026-08-25.md`, `research/qa-deep-dive-2026-08-25/*.md`,
`research/audits/2026-08-28-human-review/*.md`,
`.agents/rounds/2026-08-29-golden-truth-session-3.md` and its subdirectory,
`.agents/rounds/2026-09-01-free-improvements-maintenance/terra-evidence.md`, and
`improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` line 23
(dated evidence that PR #2806 was open; the sd-047 lane owns that file).

External references outside this repo: issue #2770 links the immutable snapshot
`95da2afe171e`; handoff issue stellar-experimental/stellar-raven#130 remains open and should
be closed by the orchestrator with a link to the resolve receipt once resolution lands.

## 7. Verdict

The occurrence is fixed, merged, deployed, and independently confirmed on the live page and
in the current upstream tree. The status may move to `fixed-upstream` now.

Full resolution of sd-042 is not yet complete: the Raven-exposed search index still emits the
defect text until the next daily crawl, the golden case still encodes the dispute as live, and
the class-level recommendation has no tracked home. Resolve-and-delete must wait for those.

**CHANGES-REQUIRED**
