# Independent review: cs-003 golden-truth pass

Verdict: **CHANGES**

Reviewer: Grok lane, 2026-11-03. Author lane is Codex (`tmp/cs003`). This review did not use the author evidence notes as proof. It read the case diff, the finding, and the resolver command, then re-read the live sources below.

The three case edits and the register stamp can stand. Do not drop `--dry-run` on the prepared resolver command until findings 1–4 are done.

## Live status check

Current `stellar/stellar-protocol` master is `ba980f02dc50025e86e83e3d9bef430b59104a15` (2026-11-03T17:50:47Z). That SHA matches master. [PR #2058](https://github.com/stellar/stellar-protocol/pull/2058) is merged. Merge time is 2026-11-03T03:39:04Z. Merge commit is `ded60f56201478b82b341151a6c44f7d1a4aec6e`. Master is 2 commits ahead of that merge and 0 behind. Those 2 commits do not touch `ecosystem/`. They touch `core/cap-0090.md`, `limits/README.md`, and `limits/slp-0008.md`. The PR change is on master.

The PR edits `ecosystem/README.md` and `ecosystem/sep-0054.md`. The SEP-0054 preamble moves from `Draft` to `Active`. The README row was already `Active`. The recommendation allows either side to move. Both sides now say `Active`.

Pinned read at `ba980f02` (`ecosystem/README.md` rows vs the first `Status:` line):

| SEP | README table and cell | Preamble | Match |
|---|---|---|---|
| SEP-0007 | Proposals, line 56, Active | `Status: Active` (Version 2.1.0) | yes |
| SEP-0008 | Proposals, line 57, Active | `Status: Active` (Version 1.7.4) | yes |
| SEP-0014 | Proposals, line 62, Active | `Status: Active` | yes |
| SEP-0039 | Draft Proposals, line 94, Draft | `Status: Draft` | yes |
| SEP-0054 | Proposals, line 74, Active | `Status: Active` (Version 0.2.0) | yes |
| SEP-0013 | Abandoned Proposals, line 119, Abandoned | `Status: Rejected (In favor of SEP-6)` | no |

A fresh pass compared all 60 README rows with the linked preamble `Status:` line. SEP-0013 is the only status mismatch. `Rejected` is not a term in README "SEP Status Terms" (lines 19–45). `Abandoned` is an additional status. The same pass saw 6 title differences. Those titles are outside cs-003. This pass does not ask for a title finding. The pairs are SEP-0005, SEP-0010, SEP-0016, SEP-0030, SEP-0034, and SEP-0055.

Issue [#2055](https://github.com/stellar/stellar-protocol/issues/2055) is closed completed at 2026-11-03T03:39:05Z. It has 0 comments. PR #2058 has 0 issue comments and 0 review comments.

## Gospel diff

Checked `git diff` for `q-sep-7-uri`, `q-sep-8-regulated-assets`, `q-sep-catalog-list`, and `eval/qa/consistency-register.json`.

Supported changes:

- `q-sep-7-uri.json` notes drop the Final-vs-Active caveat. The answer, keyFacts, and avoid stay. `sep-0007.md` still defines `web+stellar:`, `tx`, `pay`, `origin_domain`, and `URI_REQUEST_SIGNING_KEY`. The docs page `wallet/sep7` shows the same scheme and both operations.
- `q-sep-8-regulated-assets.json` answer drops only the status sentence. The approval flow stays. `sep-0008.md` still requires Authorization Required and Authorization Revocable, `approval_server` in `stellar.toml`, and `POST` of `tx`. Response statuses `success`, `revised`, `pending`, `action_required`, and `rejected` are still in the spec. The anatomy page names SEP-8 under Compliance.
- `q-sep-catalog-list.json` drops the "sources disagree" grader rule. The purpose table, keyFacts, and avoid stay. README rows for SEP-1, 6, 7, 8, 9, 12, 24, and 31 still match those purpose titles. SEP-38, 41, 43, and 45 remain Draft in the README, and their preambles match. The docs page "Complete list of active proposals" lists SEP-7, SEP-8, and SEP-14. That page does not set a precedence rule between the README cell and the preamble.

Nothing material is weakened. Status stays ungated. The old rule rejected a claim that the two surfaces agree. Both surfaces now say Active for SEP-7 and SEP-8. Keeping that reject rule would punish a true claim. keyFacts and avoid do not change. This is not score laundering. The root cause is the upstream fix, not a score.

`truth.verified` is complete on all three cases. Each has `date` 2026-11-03, `by` the author lane, non-empty evidence, and `rootCause` set to the cs-003 finding path. That path is an upstream defect, not a score rationale.

`q-sep-catalog-list.json:36` moves `truth.status` from `disputed` to `confirmed`. That move is justified. The graded claims are the purpose list. The case does not pin Active as a required answer fact. The new corroboration rows use `confirmed-as-of` for the dated agreement. That is the right row verdict. Case freshness stays `stable`. The notes date the 2026-11-03 check. They do not use the lint form `as of <date>` inside the golden answer.

Register hashes match the working-tree bytes:

- `q-sep-8-regulated-assets` `9e47d31e86b633465bfe69bc5c91191922c7c6bf23ee48f0b465b327b67f15b0`
- `q-sep-catalog-list` `c667a56c964ac7bdfa818dba253762065bdccaa577c8264af5a5cb1a3c21d5c4`

`q-sep-7-uri` hashes to `b35b83268ba01d36cb68b8e65e7c455bcabc4b4941217f853f0cc7f7329b928b`. It is not a register member. No cluster still holds an old hash for these ids. Updated clusters are `cluster-004` (line 67), `cluster-009` (line 219), and `cluster-031` (line 873). Each stays `consistent` with a 2026-11-03 re-sweep. `cluster-031` still keeps the LOBSTR and corridor source and date requirements.

One loose evidence sentence, not a gospel change: `q-sep-catalog-list.json:161` says the README retains the catalog titles. The SEP-10 README title is `Stellar Authentication`. The preamble and the golden say `Stellar Web Authentication`. That title split is older than this diff. The purpose row was not edited here.

Sibling claim check: a battery search for SEP-0013 hits only the evidence text inside these three cases. No graded case asserts a SEP-0013 status.

## What a resolver run leaves

`scripts/improvements-resolve.mjs` deletes the finding file, removes the `cs-003` intake override, appends `improvements/resolved.json`, and regenerates `improvements/INDEX.md`. It does not edit the corpus.

`rg -n "cs-003" .` with `node_modules` excluded hits:

| Path | Line | After a resolver run |
|---|---|---|
| `improvements/INDEX.md` | 158 | removed when the index is regenerated |
| `improvements/intake.json` | 202 | override removed by the resolver |
| `improvements/canonical-source/cs-003-sep-registry-status-disagrees-with-preambles.md` | 2 | file deleted |
| `q-sep-7-uri.json` | 52 | left in place; path will not exist |
| `q-sep-8-regulated-assets.json` | 55 | left in place; path will not exist |
| `q-sep-catalog-list.json` | 164 | left in place; path will not exist |
| `eval/qa/cases.json` | 51384, 51464, 51653 | left in place until the corpus is compiled again |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` | 90, 93, 1965, 1968, 3059, 3061, 10015 | dated audit; leave it |

The cs-002 precedent repoints `rootCause` to the `improvements/resolved.json` entry after the receipt exists. Do that same repoint here, then compile the corpus. Leave the research audit unchanged. The finding has no probe to remove.

## Resolver command

`tmp/cs003/resolver-dry-run.txt` is a dry run. These parts match the script and the live read:

- file path, `--repo stellar/stellar-protocol`, and `--resolved 2026-11-03`
- `--resolving-ref` is PR #2058, the commit that changes the files
- the live-recheck text matches master `ba980f02`, the five agreements, the SEP-0013 remainder, and the merge SHA and time
- `--dry-run` is present, so this file does not delete anything

The command is not accurate as a real resolve. See findings 1 and 2.

## Findings

### 1. High — `tmp/cs003/resolver-dry-run.txt:6`

The `--review-evidence` text names lane cs003 (Codex) and says the case-edit review is outstanding. The drain step needs a distinct reviewer. This file is that review. A real run would store the author as the reviewer.

Evidence: the command text; improvements-pipeline skill, "Drain genuinely resolved records"; this review.

Change: replace `--review-evidence` with this file, this reviewer, and the live URLs below before you drop `--dry-run`.

### 2. High — `tmp/cs003/resolver-dry-run.txt:7`

The command passes `--upstream-commented`. No resolution comment exists.

Evidence: `gh issue view 2055` shows `commentCount: 0`. `gh api repos/stellar/stellar-protocol/issues/2058/comments` is empty. Pull review comments length is 0. Both URLs are in the finding (`cs-003` file lines 18–19), so both are commentable refs.

Change: post the printed resolution comment on issue #2055 and PR #2058. Then you may keep `--upstream-commented` on the real run. The dry-run shape matches the skill example. The attestation is not earned yet.

### 3. Medium — `improvements/canonical-source/cs-003-sep-registry-status-disagrees-with-preambles.md:15` and `:54-58`

SEP-0013 still differs. The recommendation covers SEP-0007, 0008, 0014, 0039, and 0054 only. A delete of cs-003 drops the only active record of the SEP-0013 mismatch. The receipt sentence is not a tracked finding.

Evidence: README line 119 `Abandoned`; `sep-0013.md` line 7 `Status: Rejected (In favor of SEP-6)`; full 60-row compare; README status terms lines 19–45.

Change: file a successor for the SEP-0013 cell before you delete cs-003. Do not stretch cs-003 to cover it.

### 4. Medium — case `rootCause` lines cited above

`--references-reviewed` says every repo reference is reconciled. The three case files and `eval/qa/cases.json` still point at the active finding path. A resolver run leaves those paths dangling.

Evidence: `rg` table above; `q-defi-soroswap-what-is.json` repoint of cs-002 to `improvements/resolved.json`.

Change: after the receipt exists, point the three `rootCause` values at the resolved entry and regenerate `cases.json`. Leave `research/audits/2026-11-03-qa-followup/case-dispositions.json` as a dated record.

## URLs read

- https://github.com/stellar/stellar-protocol/commit/ba980f02dc50025e86e83e3d9bef430b59104a15
- https://github.com/stellar/stellar-protocol/commit/ded60f56201478b82b341151a6c44f7d1a4aec6e
- https://github.com/stellar/stellar-protocol/pull/2058
- https://github.com/stellar/stellar-protocol/issues/2055
- https://github.com/stellar/stellar-protocol/blob/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/README.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/README.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0007.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0008.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0013.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0014.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0039.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0054.md
- https://raw.githubusercontent.com/stellar/stellar-protocol/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-NNNN.md (all 60 `sep-*.md` files; first `Title:` and `Status:` lines)
- https://api.github.com/repos/stellar/stellar-protocol/contents/ecosystem?ref=ba980f02dc50025e86e83e3d9bef430b59104a15
- https://api.github.com/repos/stellar/stellar-protocol/compare/ded60f56201478b82b341151a6c44f7d1a4aec6e...master
- https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals
- https://developers.stellar.org/docs/build/apps/wallet/sep7
- https://developers.stellar.org/docs/tokens/anatomy-of-an-asset
