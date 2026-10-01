# Independent result review: Stellar Docs adapter measurement

Reviewer: `scf-fable`, Claude Fable 5.1 (`claude-fable-5-1`). Date: 2026-10-01.
Change: `36787b3a` against baseline `bcfa617f`. Plan: `$B/sd-measure-plan.md`.
Result: `$B/reports/sd-measure.md` and the four collection artifacts in the `sd-adapter` worktree.
I did not author the change, the plan, or the run. This review is read-only and spent nothing.
It made free reads only: Algolia searches with the public Docs search key that the repository
publishes, and requests to the public Scout API.

## Verdict

**RELEASE OK.**

The predeclared release rule passes. No blocking item remains.

- The differential is complete: 101 of 101 pairs, no adapter error.
- Both QA pairs are complete and comparable: 20 of 20 and 15 of 15 in each arm.
- No grade difference reaches a changed adapter behavior in its trace.
- The SocketFi fact loss is not an adapter effect. A same-input replay proves it.
- The Scout count difference is outside the Docs path. I reproduced it and found its mechanism.

Three records must be completed in the same closeout. They do not block the adapter release.

1. Record the SocketFi replay and correct two statements in `sd-measure.md` (findings 1 and 2).
2. Add one own-repo TODO item for Scout responses that report a failed backend read (finding 3).
3. Delete the measurement TODO item (finding 4).

## Per-difference dispositions

"Changed behavior" means one of three things: an omitted `hitsPerPage` on `search_docs`,
`search_doc_titles`, or `search_meeting_notes`; `includeContent: true` on one of the eight
category operations; or one of the three new miss messages in a result.

### Differences that remain after the rejudge

| Case | Grades | Changed behavior in the trace | Disposition |
| --- | --- | --- | --- |
| `q-edge-noinfo-sep-9999` | Baseline Wrong (repeat: Correct and Wrong). Candidate Correct (repeat: Correct and Correct). | None in either arm. | Not adapter-related. Answer variance. |
| `q-live-beans-cross-service-reconcile` | Baseline Correct (repeat: Partial). Candidate Wrong (repeat: Wrong). | None. Neither arm calls a `stellarDocs` operation. | Not adapter-related. Judge evidence defect plus one unsupported side claim. |

**SEP-9999.** The baseline calls `search_docs` and `search_anchor_sep_docs`, each with
`hitsPerPage: 10`. The candidate calls `search_docs` and `search_protocol_concepts_docs`, each
with `hitsPerPage: 5`. No call sets `includeContent`. The host status line in each trace reads
`totals ok=3 error=0 soft-empty=0`. Every Docs call succeeded, so no miss message occurred in
either arm. The query "SEP-9999" returns 1,584 index hits because the token "SEP" matches.
The baseline answer adds a sequential-numbering argument. The candidate answer does not.
The model made that difference. The direction is Wrong to Correct, so this row is not a new Wrong.

**Beans.** The candidate calls `scout.searchProjects`, `scout.searchResearch`,
`lumenloop.search_directory`, `lumenloop.search_content_semantic`, and `lumenloop.get_project`.
The baseline calls Scout and Lumenloop operations only. The changed code runs only inside
`callStellarDocs`. The commit changes four paths, and only one is runtime source.
The raw candidate transcript contains "Wouter", "Philippines", "Kulipa", and "v3.5.0".
The artifact marks the verdict `evidenceSupportCheck: pack-omission`. The Wrong grade rests on
facts that the judge did not see. The plan requires triage of a new Wrong. This is the triage:
no affected call exists, so the adapter cannot be the cause.

### SocketFi required-fact loss (`q-sor-cross-socketfi-auth`, Partial in both arms)

**Disposition: cleared. The adapter change does not explain the loss.**

Both arms call `search_soroban_contract_docs` with `includeContent: true` and `hitsPerPage: 5`.
That call uses the changed content path. The queries differ:

- Baseline, second call: `custom account __check_auth require_auth`.
- Candidate, single call: `custom account __check_auth signer authorization`.

I replayed each exact input through the baseline adapter and the candidate adapter against the
live index.

| Input | Old and new envelopes | Explanation of `require_auth` and `__check_auth` in the content |
| --- | --- | --- |
| Candidate query | Identical. 5 hits, same content lengths. | Absent with both adapters. |
| Baseline query 1 | Identical. 4 hits. | Present with both adapters. |
| Baseline query 2 | Identical. 5 hits. | Present with both adapters. |

The replayed candidate envelope is also equal to the envelope in the stored candidate transcript.
The baseline adapter therefore gives the candidate's query the same result that the candidate
received. The required sentence is not in that result with either adapter. The candidate model
chose a query without `require_auth` and made one Docs call. The baseline model made two.
The fact loss is real, and it is answer variance. The plan counts a difference as
adapter-related only with a matching mechanism trace or a differential failure. Neither exists.

### Scout category counts (`q-live-ecosystem-crowded-underbuilt`, Correct in both arms)

**Disposition: no changed Docs path ran. The cause is an upstream backend timeout under load.**

Neither trace calls a `stellarDocs` operation. Both arms send the same `scout.searchProjects`
filters. The baseline batch has 58 calls. The candidate batch has 65 calls, and several took
about 26 seconds. The candidate received a count of 0 for eleven filters. Each of those filters
has more than 100 projects: the totals for Tooling, User-Facing App, Payments, SDK, and RWA, and
six Live variants. Every filter with a smaller population returned its normal count.

I sent the same 65 requests to the public API in one burst. One request, `category=Infrastructure`,
returned HTTP 200 after 25 seconds with `counts.total: 0`, no rows, and this field:

```text
meta.warnings: ["backend read failed: projects candidate fetch — results may be incomplete
(timeout after 8000ms)", "backend read failed: projects candidate fetch (retry without
structured clauses) — results may be incomplete (timeout after 8000ms)"]
```

Sequential requests before and after the burst returned the normal counts (184, 407, 303).

This is worth more than a monitor. It has two parts:

- **Own-repo gap.** The Scout adapter maps `meta.error` to `soft-empty`. It returns a response
  with this warning as `ok` data. A model then reads a failed read as a true zero. The candidate
  answer called two categories "unused" for this reason. `AGENTS.md` requires Raven to keep
  soft-empty, error, and data responses distinct.
- **Upstream contract mismatch.** The Scout OpenAPI text says `meta.warnings` appears only when
  the request has query parameters that the endpoint does not read. The service also uses it for
  a failed backend read, with HTTP 200 and a zero total. This is a verified and reproduced
  observation. It meets the bar for a record in `improvements/stellar-light-scout/`.
  Upstream filing follows the improvements workflow and the owner's authority.

### Differences that disappeared in the rejudge

| Case | Initial grades | Changed behavior in the candidate trace | Disposition |
| --- | --- | --- | --- |
| `q-cctp-v2-usdc-stellar` | Partial, then Wrong | None. No Docs call in either arm. | Judge variance. |
| `q-protocol-bn254-poseidon-xray` | Correct, then Partial | None. `search_meeting_notes` with `hitsPerPage: 10` returned `ok`. | Judge error on CAP-0059; judge variance. |
| `q-live-oracle-repo-triage` | Correct, then Partial | None. Two `search_docs` calls with limits 5 and 3, both `ok`. | Judge variance. The numeric error in the answer is real and unrelated. |
| `q-live-leaderboard-active-projects` | Correct, then Partial | None. No Docs call. | Judge error on the RWA tag; judge variance. |

### All rows

Ten candidate rows reach a changed behavior. All ten have the same grade in both arms.
None of the six rows with an initial grade difference reaches a changed behavior.
No candidate trace contains an error from the new content request.

## The release rule, item by item

| Rule in the plan | Result |
| --- | --- |
| Complete passing differential | Pass. 101 pairs, 19 with the two permitted difference kinds, no error envelope. |
| Complete comparable QA pairs | Pass. Four artifacts, `comparable: true`, correct revisions, one remote identity. |
| New Wrong tied to an affected call | None. The two new Wrong grades (CCTP, Beans) have no Docs call. |
| Lost required fact or new unsupported claim on an affected call | None caused. SocketFi is cleared by the replay. |
| New Wrong without attribution, until triaged | Triaged above. |
| Deterministic envelope mismatch | None. |
| Independent result review | This review. |

## Findings

### 1. Medium: `sd-measure.md` says that changed miss text reached two rows; it did not

`$B/reports/sd-measure.md` lines 71, 78, 182 to 183, and 305.

- Line 78 and line 182 say that SEP-9999 Docs misses reach the changed text. Every Docs call in
  both SEP-9999 traces returned `ok`. No miss message exists in either trace.
- Line 71 says that candidate misses reach the changed text in `q-agent-identity-erc8004-stellar`.
  All five candidate Docs calls are `search_docs` with explicit limits. No miss message is in
  the results, and the status line shows `ok` for the three calls that it lists.

Both errors overstate the reach of the change. They do not alter a disposition.

Fix. In lines 78 and 305, replace the miss-text sentences with: "All Docs calls returned `ok`
with explicit limits. No changed behavior was reached in either arm." Replace lines 182 to 183
with the same two sentences. In line 71, replace "misses reach changed text" with
"no miss message occurs".

### 2. Medium: the SocketFi causation was left open although a free control existed

`$B/reports/sd-measure.md` lines 137 to 157 and 319 to 321; the uncommitted `.agents/TODO.md`
edit in the `sd-adapter` worktree.

The report says that no controlled same-query trace exists. The control is one free replay of
three inputs. My result is in the dispositions above.

Fix. Replace lines 152 to 154 and line 321 with: "Disposition: cleared. A same-input replay on
2026-10-01 returned identical envelopes from both adapter versions for all three captured
queries. The candidate query result lacks the explanation with either adapter. Evidence:
`reports/review-sd-result-evidence/replay-socketfi.json`."

### 3. Medium: a failed Scout backend read reaches the model as a true zero

`src/adapters/scout.ts` (the `meta.error` branch); `$B/reports/sd-measure.md` lines 202 to 226
and 259 to 260.

The mechanism is in the Scout disposition above. This defect is older than the adapter change
and is in both revisions. It can also affect the weekend paired run, because one large parallel
Scout batch can return silent zeros in one arm.

Fix:

- Add this item to `.agents/TODO.md` under "Adapters":

  ```markdown
  ### Do not return a failed Scout backend read as data

  Found on 2026-10-01 in the Stellar Docs adapter measurement. Under a parallel batch of 65
  `scout.searchProjects` calls, Scout returned HTTP 200 with `counts.total: 0`, no rows, and
  `meta.warnings` that begins "backend read failed" and reports a timeout. The adapter returned
  `ok` data. One answer then called two populated categories unused. A direct burst of the same
  65 requests reproduced one such response.

  Done when: a response whose own metadata reports a failed backend read does not resolve as
  `ok` data, a test pins the mapping, and the unread-parameter warning stays a success.
  Measure the change before release, because it alters what an agent sees.
  ```

- Create the upstream record through the `improvements-pipeline` skill. State the contract
  mismatch with the OpenAPI text for `meta.warnings`.
- In `sd-measure.md`, replace "zero-count mechanism remains unresolved" with the mechanism and
  the evidence path `reports/review-sd-result-evidence/`.

### 4. Low: the measurement TODO item is now a run log, and its condition is met

`.agents/TODO.md`, item "Measure the Stellar Docs adapter contract before release" (committed
text at `36787b3a`, plus the uncommitted edit in the `sd-adapter` worktree).

The condition is "a separately reviewed QA comparison finds no verified answer regression before
release". The comparison ran, two reviews are complete, and no regression is verified.

Fix. Delete the item. Do not keep the lane's uncommitted run-log lines. The round ledger holds
the result. Keep the lane's new item "Investigate missing source evidence in the p6 judge pack".
Add the item from finding 3.

### 5. Low: single-run grades on these lanes are weak evidence

Five of 18 repeated panels changed grade on identical input, and four of six cross-arm
differences disappeared. The report states this correctly. A future reader must not cite the
live-lane totals (12, 2, 1 against 9, 4, 2) as an adapter effect. No fix is necessary beyond
the sentence that the report already has.

## Checked

**Artifacts and identities.** The four collection files match the SHA-256 values in the report.
Each has the stated row count and grade totals. The baseline files record server revision
`bcfa617f…`, and the candidate files record `36787b3a…`. All four record model
`claude-sonnet-5`, rubric `v2.10`, pack `p6`, and one remote identity vector `1ad47664…`.

**Costs.** The four collection totals sum to `$26.5212068`. The four rejudge totals sum to
`$2.7761750`. Each rejudge file reports the expected number of judge costs and none missing.

**Rejudge grades.** I read the 18 repeated verdicts from the four rejudge files. They match the
report. The remaining cross-arm differences are SEP-9999 and Beans.

**The change.** `git diff bcfa617f 36787b3a` touches four paths. The adapter diff has three
behaviors: the default of 5, content retrieval after selection, and three miss messages.
The new content request can return an `error` envelope. No candidate trace contains one.

**Traces.** I parsed every `execute` call in all 70 rows. For each row I recorded the Docs
operations, their arguments, the miss messages in the results, and the host status lines.
I read the full traces of SEP-9999, SocketFi, the ecosystem case, and the ERC-8004 case in both
arms. I read the operation lists of Beans, BN254, the oracle case, the leaderboard case, and CCTP.

**Differential.** The stored result has 101 pairs, 50 with `includeContent: true`, and no
error envelope. Its 19 raw differences are the default-limit and miss-message kinds.

**Replay.** `replay-socketfi.json` holds the three input pairs, the request paths, and the
envelopes. The new adapter makes one `/query` request and one `/objects` request. The old adapter
makes one `/query` request.

**Scout probe.** Three files hold the sequential run, the 65-request burst, and the second
sequential run, with status, count, and time for each request.

**Evidence files.** All are in `$B/reports/review-sd-result-evidence/`.

**Limits.**

- I used the public Docs search key, not the host credential. The replay equals the stored
  candidate envelope, so the two keys gave the same result for that input.
- The replay ran some hours after the collection. An index change in that interval is possible.
  The equal stored envelope makes it improbable for the candidate query.
- For the rows that I did not read in full, I rely on my scan and on the lane's row review.
  I did not re-verify each side claim in those answers against primary sources.
- I did not rerun a judge or collect an answer.
- One burst reproduced one failed read, not eleven. The rate under load is not measured.
