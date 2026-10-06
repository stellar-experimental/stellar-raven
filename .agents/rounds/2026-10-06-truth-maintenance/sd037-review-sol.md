# sd-037 distinct reviewer check

Review time: 2026-10-06T15:35:19Z.
Reviewer: the separate Codex session assigned by `tmp/2026-10-06-maintenance/brief-sd037.md`.

## Verdict

**retire**. The original source defect no longer reproduces. No successor is needed for the checked source behavior.

This verdict approves the source finding's retirement. The coordinator must complete the cleanup and upstream comment requirements below.
The active record still has `status: reported-upstream`. This review does not claim that the retirement already occurred.

## Direct upstream verification

I read the finding, [PR #2021](https://github.com/stellar/stellar-protocol/pull/2021), and [issue #1981](https://github.com/stellar/stellar-protocol/issues/1981) directly.
I used fresh GitHub API responses through `gh api`.
The browser fetch failed. The direct API reads succeeded.

| Check | Fresh result |
| --- | --- |
| PR title | Add a list of SLPs and mention SLPs in the root README |
| PR state | `closed`, `merged: true` |
| Merge time | `2026-10-06T15:32:25Z` |
| Merge commit | `f93e69105c995d0a5f85a81da8fd984eaf3d6280` |
| Base branch | `master` |
| Current `master` | `f93e69105c995d0a5f85a81da8fd984eaf3d6280` |
| Required review | `APPROVED`; `leighmcculloch` approved at `2026-09-29T21:44:44Z` |
| Review thread | The only thread is outdated and resolved. |
| Checks | `mddiffcheck`, `lineendings`, and both Socket checks report `SUCCESS`. |
| Issue state | `closed`, `state_reason: not_planned`, closed at `2026-09-14T18:14:06Z` |
| Issue comment | Only `github-actions[bot]` posted the stale notice on `2026-08-14T18:19:18Z`. |

The merge claim matches the API exactly.
The issue closure came from the stale process. It does not prove a maintainer rejected the correction.

The checked surface is the repository's default-branch documentation.
Fresh reads show the fix on current `master`, which equals the merge commit.
This proves publication on the affected source surface. It does not prove downstream Algolia ingestion.

Reproduction commands:

```sh
gh api repos/stellar/stellar-protocol/pulls/2021
gh api repos/stellar/stellar-protocol/issues/1981
gh api repos/stellar/stellar-protocol/issues/2021/comments --paginate
gh api repos/stellar/stellar-protocol/issues/1981/comments --paginate
gh api repos/stellar/stellar-protocol/pulls/2021/reviews
gh api repos/stellar/stellar-protocol/commits/master
gh api repos/stellar/stellar-protocol/contents/README.md \
  -f ref=f93e69105c995d0a5f85a81da8fd984eaf3d6280 --method GET
gh api repos/stellar/stellar-protocol/contents/limits/README.md \
  -f ref=f93e69105c995d0a5f85a81da8fd984eaf3d6280 --method GET
gh api repos/stellar/stellar-protocol/git/trees/f93e69105c995d0a5f85a81da8fd984eaf3d6280 \
  -f recursive=1 --method GET
```

I decoded the fresh `content` fields with `base64.b64decode`.
I numbered the decoded lines with `enumerate(body.decode().splitlines(), 1)`.
I did not use the author's stored transcript as proof.

## Original trigger and exact source locations

| Source | Blob SHA | SHA-256 |
| --- | --- | --- |
| `README.md` | `4d80b14cf0d82e4a76c4b3df7b63383a8f29dee8` | `afef1ecb6bba3d6a6e37b134adb0615aa2f72c3088230513280ae70fff69ce99` |
| `limits/README.md` | `468007abab8e7c3f7c347874977405b7c2de6732` | `e17216c3b32d1ab7c5e2dd0a290a52dbbb243600458da1a32628c34058c05a5f` |

These locations use the merge commit, which was also current `master` during this review.

| Exact lines | Observed result |
| --- | --- |
| [Root L10](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/README.md#L10) | The SLP badge links to `./limits/README.md`. |
| [Root L24-L26](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/README.md#L24-L26) | The overview names SLPs, describes protocol limits and network configuration, and links the process and list. |
| [Root L36](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/README.md#L36) | The directory description names `limits`, `slp-xxxx.md`, and `slp-0004.md`. |
| [Root L56-L58](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/README.md#L56-L58) | The example tree includes `limits`, its README, and `slp-0001.md`. |
| [Limits L7-L10](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/limits/README.md#L7-L10) | The proposal list has number, title, author, and status columns. |
| [Limits L11-L16](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/limits/README.md#L11-L16) | Six rows link all six proposal files. |
| [Limits L14](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/limits/README.md#L14) | SLP-0004 links to `slp-0004.md` and has status `Final`. |
| [Limits L16](https://github.com/stellar/stellar-protocol/blob/f93e69105c995d0a5f85a81da8fd984eaf3d6280/limits/README.md#L16) | SLP-0006 links to `slp-0006.md` and has status `Draft`. |

The opening root sentence still names CAPs and SEPs at L13-L14.
The added SLP paragraph supplies the missing family recognition and direct link.
That opening sentence does not preserve the original omission when the overview is read in full.

## Adjacent behavior

The fresh recursive tree response has `truncated: false`.
I compared every `limits/slp-*.md` file with every proposal link in the new index.

| File | Index line | Preamble lines | Title and status match |
| --- | --- | --- | --- |
| `limits/slp-0001.md` | 11 | Title 5; Authors 6; Status 8 | yes; `Final` |
| `limits/slp-0002.md` | 12 | Title 5; Authors 6; Status 8 | yes; `Final` |
| `limits/slp-0003.md` | 13 | Title 5; Authors 6; Status 8 | yes; `Final` |
| `limits/slp-0004.md` | 14 | Title 5; Authors 6; Status 8 | yes; `Final` |
| `limits/slp-0005.md` | 15 | Title 5; Authors 6; Status 8 | yes; `Final` |
| `limits/slp-0006.md` | 16 | Title 5; Authors 6; Status 8 | yes; `Draft` |

All six links resolve to files in the pinned tree. There are no missing rows, extra rows, or duplicate rows.
I fetched all six proposal files independently. All index titles and statuses match their preambles after whitespace trimming.
The author names match. The table omits handles and organization details from the preambles.

The first metadata script expected `Author:`. The source uses `Authors:`, so that script stopped after SLP-0001.
I corrected the script and fetched all six files again. The completed title and status checks passed.

The root tree lists only SLP-0001. It does not list every proposal file.
Root L38 identifies this tree as an example. The same tree lists only three CAPs and three SEPs.
The complete SLP index supplies all six links. The abbreviated example is not a residual source defect.
The root definition also covers SLP-0006's network configuration proposal.

I did not recheck Algolia ranking or crawler ingestion.
The brief identifies the original retirement trigger as the two source READMEs.
The finding treats Algolia results as impact evidence rather than the source defect.
A later verified search defect needs its own finding. This review does not assert that search results changed.

## Persistent references

I ran the requested search and excluded `node_modules`:

```sh
rg -n "sd-037" . --glob "!node_modules/**"
```

That command finds five references in four visible files.
I also searched hidden directories because the default command skips `.agents/`:

```sh
rg -n "sd-037" . --glob "!node_modules/**" --hidden --glob "!.git/**"
git grep -n 'sd-037' -- ':!node_modules'
```

The tracked-file search finds 33 references in 13 files.
The following table lists every tracked location and the required treatment.

| File | Lines | Required treatment |
| --- | --- | --- |
| `.agents/TODO.md` | 18, 42 | Remove sd-037 from priority 2. Remove the completed follow-up section after retirement. |
| `improvements/intake.json` | 153 | Remove the per-finding override through the resolver. |
| `improvements/INDEX.md` | 50 | Regenerate through the resolver. Do not edit the generated row directly. |
| `improvements/stellar-docs/sd-037-limits-slps-discoverability.md` | 2 | Record this live result, then delete through the resolver after all gates pass. |
| `improvements/README.md` | 19, 177 | Replace these active examples or identify sd-037 as a resolved precedent. Correct the protocol owner example. |
| `.agents/rounds/2026-10-06-truth-maintenance.md` | 134, 177, 196 | Append the verified merge and retirement outcome. Reconcile the current thread-resolution action and checkbox. |
| `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md` | 24, 94, 137, 143 | Append the merge result and retirement disposition. Reconcile the current author-action recommendation. |
| `.agents/rounds/2026-09-21-improvements-followup.md` | 36, 102, 150, 154, 169, 193, 199 | Preserve the dated evidence. Link the resolved receipt from a closeout note. |
| `.agents/rounds/2026-09-08-maintenance-execution.md` | 136 | Preserve the dated state. The resolved receipt supplies the later outcome. |
| `.agents/rounds/2026-09-30-raven-next.md` | 58, 164, 166, 189, 234 | Preserve the dated state. The resolved receipt supplies the later outcome. |
| `.agents/rounds/2026-09-29-truth-maintenance.md` | 82 | Preserve the dated state. The resolved receipt supplies the later outcome. |
| `.agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-review-opus.md` | 196 | Preserve the dated comparison. It can refer to the resolved precedent. |
| `.agents/rounds/2026-09-03-truth-maintenance/post-candidate-measurement-fable.md` | 396, 496, 657, 829 | Preserve the dated measurement. Do not rewrite historical results as present behavior. |

Additional reference classes:

- Probe: the finding has no `probe` frontmatter. The probe script has no sd-037 reference.
- Golden: `eval/qa/corpus/battery/protocol-core/q-pc-slp-0004-0006-status.json` has no sd-037 reference.
- Golden: the case tests historical proposal facts. Keep the case and its dated statuses.
- Register: `eval/qa/consistency-register.json` has no sd-037 reference.
- Register: its SLP citations concern proposal facts. Retirement does not invalidate those citations.
- Research: `research/` has no sd-037 reference. Related SLP citations are dated evidence and remain valid.
- Algolia rules: the searched scripts and documentation have no sd-037 reference or finding-specific rule.
- Resolved ledger: `improvements/resolved.json` has no sd-037 receipt yet.

The temporary brief and this review are task evidence. They are not active queue references.
The dated `.agents/rounds/` files contain the persistent research and measurement references listed above.

## Remaining step 6 gates

The brief prohibits tracked edits and GitHub posts. I inspected these gates without performing those actions.

1. Update the active finding to `fixed-upstream` with this dated live result.
2. Reconcile the active references listed above. Preserve the dated records and historical golden facts.
3. Post the resolution result and immutable source snapshot on both upstream references.
4. Read both comments back. Neither reference currently has the required resolution comment.
5. Run the resolver dry run with truthful gate flags and PR #2021 as `--resolving-ref`.
6. Run the resolver after the comment and reference gates pass.
7. Verify the file and intake override are absent. Verify the generated index excludes sd-037.
8. Verify the receipt includes both upstream references, PR #2021, this review, and the live commit evidence.
9. Confirm the probe inventory needs no deletion because this finding has no probe.

PR #2021 has no issue comments. Issue #1981 has only the stale-bot comment.
The resolved Copilot reply concerns the earlier wording fix. It is not a final retirement comment.
The coordinator must post on both [PR #2021](https://github.com/stellar/stellar-protocol/pull/2021) and [issue #1981](https://github.com/stellar/stellar-protocol/issues/1981).
The `--upstream-comment-na` exception does not apply because the finding was filed.

The latest committed finding snapshot is:

[sd-037 at 528fa335dbc52defd82cdd961aba5304f5ee52ca](https://github.com/stellar-experimental/stellar-raven/blob/528fa335dbc52defd82cdd961aba5304f5ee52ca/improvements/stellar-docs/sd-037-limits-slps-discoverability.md).

Use the resolver's current immutable snapshot when preparing the final comments.
The existing issue also contains an older immutable source snapshot.

I ran the resolver with `--dry-run`, without claiming that unresolved gates passed:

```sh
node scripts/improvements-resolve.mjs \
  --file improvements/stellar-docs/sd-037-limits-slps-discoverability.md \
  --live-recheck '2026-10-06: gh api confirms master f93e69105c995d0a5f85a81da8fd984eaf3d6280; fresh README checks confirm root links and six-row SLP index.' \
  --review-evidence 'Distinct reviewer independently checked upstream PR, issue, pinned READMEs, full tree, and references; tmp/sd037-review.md.' \
  --resolving-ref https://github.com/stellar/stellar-protocol/pull/2021 \
  --dry-run
```

The resolver returned exit code 2 with this message:

```text
sd-037: status must be fixed-upstream before resolution; got reported-upstream
```

It changed no files. I did not pass `--references-reviewed` or `--upstream-commented` because their requirements remain incomplete.
This result confirms that the current record cannot yet complete the resolver.
The source checks support retirement after the coordinator completes those administrative gates.

## Scope check

I did not edit tracked files, commit, push, or post to GitHub.
I wrote only this report in the repository. Fresh source captures live under `/private/tmp/sd037-review/`.
