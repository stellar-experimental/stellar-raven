# Independent continuation cross-review — 2026-11-06

Reviewer: Codex, `sweep-alias` (`t2r6`). This review is independent of the maintenance authors.
Only this report is written by the reviewer; no upstream writes, paid calls, code edits, or
production changes. The 73-ID action-table and sls-115 filing reviews are complete below.
The 14 targeted finding corrections, sls-115 filing, and sls-097 retirement cleanup are accepted. Final lifecycle verification appears at the end; earlier pending statements describe their observation time.

## Horizon: new regression after sls-087 — independently reproduced

At **2026-11-06T14:06:02.578Z**, freshly called the free authenticated `scout.explainRepo` operation
through the available Stellar Raven MCP server with the exact original monitor question:

```js
await scout.explainRepo({
  repo: "stellar/stellar-horizon",
  q: "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?"
});
```

Observed `ok=true`, `answerSource=knowledge-note`, `answerAsOf=2026-10-08T00:00:00Z`.
The selected answer says `MaxSupportedProtocolVersion = 29` and directs the reader to prefer
that dated note over the separate walkthrough. `meta.generatedAt=2026-11-06T13:54:27.220Z`
(the independent request received the same cached upstream generation); the new MCP observation
time is stated above. `codeVerified.scannedAt=2026-11-02T20:24:39.829Z` and
`codeVerified.scannedRef=597544b60c20f8536d532d32abca8462394874f3`.

Independently fetched both immutable primary sources:

| Source | Line 38 | SHA-256 of complete `internal/ingest/main.go` |
| --- | --- | --- |
| [Historical note ref 430a28e](https://raw.githubusercontent.com/stellar/stellar-horizon/430a28e79b3b43c213840e45523519ca11251c0a/internal/ingest/main.go) | `MaxSupportedProtocolVersion uint32 = 29` | `8ea8c735f70863f0df17deaf4452ab0858ca0609d21be6ea0cc046976bd6db59` |
| [Response's own scan ref 597544b](https://raw.githubusercontent.com/stellar/stellar-horizon/597544b60c20f8536d532d32abca8462394874f3/internal/ingest/main.go) | `MaxSupportedProtocolVersion uint32 = 30` | `3b8ed977bf4c149b6a78eb7a9c28b65ea1283b20f88d60d9ff562918ffe475bf` |

The historical October 8 note is correctly dated and true at its cited ref. The regression is
using it as the answer to the current source question despite the newer scan's incompatible value.
This is the ingestion software ceiling, not a claim that Mainnet has activated protocol 30.
No DeepWiki answer was queried or blamed. The unrelated fixture-interface residual stays separate.

Read the live closed/completed [issue 1738](https://github.com/Stellar-Light/stellarlight/issues/1738)
and `improvements/resolved.json`'s sls-087 receipt. That predecessor described the same mechanism
with answer 28 versus scan 29, then independently verified 29 versus 29 on October 10. The new
29-versus-30 mismatch justifies a **new successor ID**, not resurrection of sls-087. A general
ref/path/symbol drift check or explicit current-source conflict is needed; changing only the
constant in a curated note leaves the recurrence mechanism intact.

### sls-115 author-record review — accepted for filing

Read the complete new `sls-115-horizon-ceiling-note-scan-drift.md` authored by the coordinator.
Its original-query reproduction, exact source ref/value, historical-scope caveat, successor
relationship, separation from active-network version and sls-114, and general recommendation are
accurate. **No blocking finding in the new record; accept the verified classification and filing.**
The reviewer performed no filing or GitHub comment.

Also independently repeated the explicit-current control at **2026-11-06T14:10:14.641Z**:

```text
As of today, which Horizon ingestion constant pins the highest supported protocol version,
and what is its value in the source at codeVerified.scannedRef? I am asking about the ingestion
software ceiling, not the currently active Mainnet protocol.
```

The tool again selects 29 from the October 8 note, with the same scan ref defining 30.
Its generation timestamp is `2026-11-06T14:06:53.337Z`. The independently observed payload agrees
with the author's retained `research/audits/2026-11-06-remaining-sweep/other-horizon-current-tool.json`.
The existing source claim is a historical 29, not a false claim about that old commit. The
current-source answer selection is the defect. Adding this explicit-current receipt to the
finding would strengthen its evidence; the original-query proof already establishes the issue.

## sk-038: retain active; ordinary published URL still stale

Independent GETs at **2026-11-06T14:01:30Z**, with no query parameters:

| Surface | Bytes | SHA-256 | Verdict |
| --- | --- | --- | --- |
| [Ordinary Docs assets](https://developers.stellar.org/.well-known/agent-skills/assets/skill.md) | 21,972 | `141b4f4417599cd1679f7c82f26fae50f6eb5ca9a50c12f66bc14f72e5694856` | All three original faulty custom-admin statements remain |
| [Canonical assets](https://skills.stellar.org/skills/assets/SKILL.md) | 19,363 | `ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8` | Corrected |
| [Generated Docs source](https://raw.githubusercontent.com/stellar/stellar-docs/main/.mintlify/skills/assets/SKILL.md) | 22,468 | `0cbd9cdbf2f2bc2b7a34270eb3a33079c88d7ac3bc94750b631c8720328c7737` | Corrected |

Also freshly fetched archived before/after canonical files at `77bf4e8` and `9817057`.
Before hash is `a6302542ad64bf50df0d57ca31f9e80575185b05800b48ecd5fdcba2285b6bed`;
after is byte-identical to the canonical live asset above. Read the active finding, the prior
independent handoff review, and live issue 177 (closed/completed). The ordinary Docs URL still
uses master-weight-only prerequisite/checklist and the unconditional nobody-can-sign warning.
Source correction is deployed canonically, but complete published scope is not healed.
No retirement or status-to-fixed transition is justified.

## sd-081 and sd-091: fresh independent snippet checks

At **2026-11-06T14:05:06Z**, both ordinary restoration pages and their current raw source contain
`.addOperation(Operation.restoreFootprint({})).setTimeout(30).build()` (whitespace normalized).
An offline SDK 17.4.0 restoration-transaction fixture produces `minTime=0`, `maxTime=now+30`.
The complete served snippets still fail TypeScript parsing with diagnostics **1131 and 1128**.
Both omit `xdr` from imports, pass a `LedgerKey` to the entry getter, and insert the RPC response
object into the footprint. Separate SDK 17.4.0 local controls produce `TypeError: instance.val
is not a function` and `TypeError: v.toXdrObject is not a function` for those two runtime shapes.
Combining freshly fetched polling-helper and restore-data blocks in an in-memory TypeScript 5.9.3
program reproduces **TS2440**, the duplicate `Api` declaration. No ledger/network execution,
signing, or transaction submission occurred.

Fresh page SHA-256 receipts:

- `restore-contract-js.md`: `fd3664cfb011c040b847d8ad70eab3eee987d3bf32de2bba1b64c581f05523ad`
- `state-archival.md`: `1ddca55cfa930d9e4fc48d999344c9e049456b1a8f78948105f0b3c3a0e76f5c`
- `restore-data-js.md`: `2b4f699dfdb2a50f354698069146f0b595a75390b0b01c223fadf4c30dcfebc8`
- `submit-transaction-wait-js.md`: `a8cc71d50fa59aef5aaaeaec5839b4d32216b999f9eeeced874a025779567229`
- `simulateTransaction-Deep-Dive.md`: `42c8c2b830682c3d47aadb252170c03f66b1109041c61f9945f5aac8a6a15f04`
- Raw current `restore-contract-js.mdx`: `f0730a816973f543b2519094ec03a822c644fc3de886854181d4e0f4323331bb`
- Raw current `state-archival.mdx`: `29044b1b857ea5f776b9312f637c23f4b3838ec123166dbd4936c84bf7ec7070`

The Docs author's sd-091 fixture is valid. Independently extracted the live function and replaced
only its upstream fetch with **actual `Response.json(...)` instances**, for normal result, top-level
JSON-RPC error, and nested simulation error. All three exact functions throw the reported
`SyntaxError: "[object Object]" is not valid JSON`; changing only `JSON.parse(result)` to `result`
preserves each object without error. This is the page's double parse, not a fixture type error.
That control proves preservation, not complete error-handling correctness of any proposed PR.

### sd-081 partial correction and upstream response — accepted

Read the coordinator's full sd-081 diff. Removing the current no-time-bounds claim and
recommendation, correcting the November 6 recurrence, and retaining all independently reproduced
residuals is appropriate. The historical November 2 observation is supported by upstream source
history: [PR 2977](https://github.com/stellar/stellar-docs/pull/2977) merged at
`2026-11-03T16:14:21Z`, commit `d7845d6c594bfac2c1a9cbc856ccd68d92d66eb0`; its exact two-file
patch adds `.setTimeout(30)` before `.build()` on both pages. Fresh immutable-source reads of
parent `64c821791334b4b19d5f6bd28fc549cbfd53ecaf` lack the call in both `restoreContract` bodies;
the merge contains it. The restoration source parent hash is
`8281c91c09f7fb712e56a61a95fa49246baa16bdddcf6f50df20fab99556e81b`; state-archival parent is
`e4aa89fd2da8909db2794312558a51172fde42da42713b9e88f50719a981fd2b`.
This was a November 3 source fix missed by the later sweep, not evidence that the original
November 2 finding invented the missing timeout.

Read live issue 2562 and its sole comment directly. The comment is Raven's own November 2
[comment 6590839544](https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6590839544)
and includes the no-time-bounds bullet. A **narrow correction/partial-verification comment is
warranted**: acknowledge PR 2977's now-deployed timeout change, withdraw that remaining request,
and list only the still-reproduced parse/import/XDR/footprint/Api issues. This changes the action
requested of the owner, rather than chasing an untouched issue. Do not retire sd-081 or claim a
full fix; do not describe the dated November 2 comment as false when made.

## Drift routing: retain held titles; verified

Independently hashed the held and candidate manifests, counted 666 and 978 title rows, compared
all graded fields in the two final routing receipts (`13-59-09-694Z` held and `13-59-15-074Z`
candidate), and compared each 495-query ranked dump against its receipt. All checks agree with
`research/audits/2026-11-06-remaining-sweep/drift-routing.json`.

- Held manifest SHA-256: `008c16e31e5a53ea221a10007ff7198d317c0f2f15bd8b0354e552fe85776e33`.
- Candidate: `eb532a662f5bb83f7123c094f002294211a94de92f117c3bdb940d6e09cd6de4`.
- Legacy strict top-1 **219→218**, top-3 **293→293**, top-5 **327→326**, card@5 **113→113**.
- Holdout top-3 **27→26**; top-1/top-5/pass/forbidden-capture totals unchanged.
- Extended, skills, and protocol-history aggregates unchanged.

Fresh read-only `searchCatalog` execution on both manifests independently reproduces the deep-report,
Hubble/RPC, Groth16, and wallet witnesses. Root's three boolean grade-change rows are accurate.
Additional within-bucket holdout movements exist: asset-metadata expected rank 2→3 (forbidden hit
identity changes while capture stays true), Freighter payment 2→3, RWA digest 3→2. These do not
change the retention decision. The 495-key ranked dumps exclude the 49 holdout rows; complete
graded receipts cover 544 rows. No baseline thresholds or labels were changed by this review.

## Lumenloop original-evidence gaps — preliminary independent check

Fresh direct free read-only calls at **2026-11-06T14:03:09Z** independently reproduced:

- Article 6461: CCTP live prose and `publishing_date=2026-05-19T14:00:00.000Z`, no typed milestone
  fields. Current SDF page also exposes May 19. No incorrect May 8 Lumenloop answer was captured.
- Article 8877: title says developer preview, short summary says Testnet live, long summary says
  audits are underway before mainnet. No typed maturity/network/audit fields. No false Mainnet
  launch claim was captured.
- Event 1457: successful soft-empty text, no document. Event 1819: Lisbon/Convento do Beato,
  October 28–29. Exact Yas Marina title/URL search empty; Abu Dhabi returns unrelated event 1212.
  None proves a prior stale Meridian row was corrected or that a supersession mechanism exists.

Read live issues 38, 39, and 33 via the connector and raw `gh api` bodies/comments. All are open
and untouched since July 13 except Raven's own tracking comment. Their filed scope is explicitly
metadata enhancement with false-content claims disclaimed. Do not infer a fix from already-correct
prose, assert a content defect from missing optional fields, or post routine recurrence comments.
Issue 38's dated July evidence says the SDF post was May 8; its current primary page and current
Lumenloop timestamp are May 19. Preserve the distinction between a historical recorded observation
and a new verification. Complete author-table review follows when the 73-ID report is stable.

### ll-022 public-date correction — warranted, with narrow scope

At **2026-11-06T14:11:10Z**, freshly retrieved
[SDF's CCTP announcement](https://stellar.org/blog/foundation-news/circle-cctp-is-live-on-stellar).
The HTML has `<time dateTime="2026-05-19T14:00:00.000Z">`; its `__NEXT_DATA__` has
`props.pageProps.date="2026-05-19"` and `props.pageProps.hero.meta.date="2026-05-19"`.
Complete response SHA-256 for this observation is
`a59e9470616484672d3a6aa5cca893de694e539c1d0354cc06323e70cb737cfd` (HTML includes variable
rendering values; the extracted date fields are the stable evidence). Article 6461's fresh direct
response above agrees with the May 19 timestamp. Independently retrieved
[Circle's 2026 CCTP notes](https://developers.circle.com/release-notes/cctp-2026): the May 2026
section has a `2026.05.18` subsection adding Stellar mainnet support. That is a separate technical
milestone from the SDF post date.

A **narrow evidence correction on issue 38 is warranted** because its public evidence currently
says the SDF page is May 8 and asks the owner not to backfill unsupported May 18/19 dates. State
that the November 6 observation now supports these two separately sourced dates; do not assert
that the July observation was fabricated, or that a historical Lumenloop answer was wrong.
The issue's metadata request remains separate and unresolved. Current article 6461 agreement
does not establish a previously reproduced content defect or deployed fix. This is materially
new source evidence affecting the recommendation, not a routine reminder. The author's archived
`tmp/sweep-2026-11-06/other/cctp-primary.body` is an additional source receipt; this report records
the reviewer's independent extracted fields and exact observation hash.

## Complete other-lane table review

Read all 73 action rows in `other-actions.json` and the accompanying `other.md`, including their
original triggers, fresh results, limitations, and recommended actions. Compared the IDs against
the active collections at baseline `d5f3a280`: **73 expected, 73 distinct reviewed, no missing or
extra IDs** (37 Lumenloop, 14 Scout, 13 skills excluding sk-038, 8 canonical-source, 1 Workers AI).
Disposition counts are 60 still-repro, 9 partial, 4 inconclusive. New sls-115 is correctly outside
that initial denominator. This is a full disposition/coverage review, not a claim that this
reviewer independently replayed all 73 service triggers.

No full-scope retirement is supported by the table as written. The four inconclusive entries
are ll-022/023/024 and the no-paid-POST boundary for sls-097. Partial results remain explicit:
ranking examples improved without a guaranteed freshness ordering, generic weak-match warnings
without per-result provenance, new post-vote material without a supersession relation, provenance
coverage that is still incomplete, and merged changes whose owner data refresh has not run.
The table correctly distinguishes new evidence from older supplementary checks not repeated.

Independently checked the two most advanced candidates at **2026-11-06T14:13:10Z**:

- **sls-097:** current `/api/openapi.json` version 1.9.122 declares a 502 JSON response referencing
  `ErrorResponse`, requiring string `error`, and describing retry or GET `/api/partners` fallback.
  This fixes the named schema omission and matches the historical JSON error shape. Live issue
  1908 is closed/completed. No metered POST was run, so no current model-availability/transport
  outcome is certified. The original title/request is documentation-only; schema-only closure
  would be a defensible explicit scope decision, but should never be reported as a successful
  partner-ranking replay. Full retirement cleanup/comment gates remain the coordinator's work.
- **sls-101:** current `/api/analyze?dimension=tvl` explicitly reports `staleTvlUSD=1664183220`,
  `oldestAsOf=2026-08-10T06:16:01.283Z`, and a 3-of-17/84-percent stale warning. `staleProjects`
  lists Spiko, Sentora, and Etherfuse; the warning fix is deployed. Underlying values remain
  Spiko 1,653,789,314, Sentora 10,393,904, Etherfuse 2. Fresh DefiLlama `/protocol/spiko` has
  empty `currentChainTvls`; `/protocol/sentora` has `Stellar=82603181`. This proves a remaining
  stale-provider-data concern, not a missing warning. Live issue 1912 is closed/completed.
  Retain a narrowed residual or create a self-contained successor before warning-only retirement.

All of these calls were free reads. The current provider number is a timestamped observation,
not a timeless replacement value or a claim that an absent provider value equals zero.

The ll-022/023/024 action rows agree with the independent checks above and warrant no false-content
or fixed-content classification. Their optional structured-metadata requests remain separate.
The table's no-duplicate-filing/no-routine-comment decisions are appropriate. The only narrow
public correction in that group is ll-022's changed primary-date evidence.

Two receipt filenames initially failed the table's pointer check: `lobstr-scf.body` (ll-013) and
`tw-sdk.body` (sk-025). Reported them to the author; both files appeared during reconciliation.
Their final receipt linkage is checked with the stable finding diff below. Also requested replacing
"Deleted PR18" with "unavailable/404" unless deletion is separately established.

## Coordinator correction comments — independently read back

Read raw GitHub API comment bodies and authors after the coordinator posted them:

- [Docs 2562 comment 6686867459](https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6686867459),
  author `kalepail`: accurately acknowledges deployed 30-second timeouts and retains the verified
  parsing/import/XDR/footprint and Api-redeclaration residuals. It does not claim full resolution.
- [Lumenloop 38 comment 6686881728](https://github.com/lumenloop/lumenloop-backend/issues/38#issuecomment-6686881728),
  author `kalepail`: accurately distinguishes the now-observed May 19 SDF publication from May 18
  Circle mainnet support, disclaims knowledge of the original July page, and does not invent a
  Lumenloop content defect or fix. It preserves the metadata request.

Both comments are substantive scoped corrections, not status reminders. Their attribution as
Raven verification is correct; neither constitutes upstream-maintainer acceptance.

## sls-097 distinct retirement review — documentation scope accepted

**Accept the original documentation defect as fixed.** This supersedes the conditional scope
verdict above. Re-read the active title, Finding, Recommendation and issue 1908: the requested
change is to document the known 502 JSON response, its `error` field and GET directory fallback.
The recommendation explicitly separates investigating ranking failure. Requiring successful
ranking would enlarge the original defect; retiring this record does not hide a demonstrated
current availability defect, because no current availability observation was made.

Independent ordinary GET at **2026-11-06T14:19:31.512Z**:
`https://stellarlight.xyz/api/openapi.json` returned 200, version **1.9.122**, SHA-256
`4dd846f44ef80603d5ec7ba0ea810762f2a5b6df9235b64f19a1ede2fd00db2c`.
The 502 response for POST `/api/partners/match` declares application/json `ErrorResponse`,
requires string `error`, and explicitly describes retry later or GET `/api/partners` filters.
This freshly replays the original documentation check and resolves the missing response.

Read merged PR 1929 (merged 2026-11-05T15:38:28Z) and source at immutable merge
`56f10c0e03ca93634c26faf3432b607fecbc5cd8`:

- `src/app/api/partners/match/route.ts`, SHA-256
  `4839048cd463d5161597bf2de9b13ef27bda479cb80cb655d9a4aa0d1515123e`
  (also matches the freshly fetched main handler).
- `src/lib/model-failure.ts`, SHA-256
  `973b7f999382484de5ad847e32fe9aecdd71e149895f4a727e20c4a11216d6ff`.
- `src/lib/__tests__/partner-ai-failures-contract.test.ts`, SHA-256
  `20147563ad330c1a21e1768c3a4be79aab2590c1f59f7e4f2db7e9cdf9017215`.

At **14:20:23.842Z**, independently transpiled the unmodified pinned handler and classifier
in memory with TypeScript 5.9.3. All external imports were explicit local fixtures: `Response`
for NextResponse, a fake directory and rate limit, a model client that only throws/returns the
selected fixture, and synthetic APIError classes. The exact original `need` request went to
that local function, never a remote POST. Provider 500, 529, 408 and connection-error fixtures
all returned the historical JSON error and status 502; malformed model text returned the other
502 JSON error. All five fit the freshly fetched live ErrorResponse (required string `error`,
known properties, no `unavailable`). Adjacent 401-provider refusal returned 503/unavailable;
ordinary internal Error returned 500, both statuses declared live. This verifies source/schema
consistency with controlled fixtures; it is not proof of SDK network behavior, current deployed
handler execution, model availability, ranking correctness, or earlier plain-text gateway repair.
The first harness attempt used the repo's TypeScript wrapper, which lacks ModuleKind; it did
not run a fixture. Re-running with the existing isolated TypeScript package passed all seven.

Reference scan identified active golden provenance in
`eval/qa/corpus/battery/assets-anchors-seps/q-gap-match-partners-degrade.json` and generated
`eval/qa/cases.json`, plus TODO, INDEX and dated research/round references. The golden provenance
currently says status verified and describes 502 versus documented503; preserve it explicitly as
historical and replace the active-file pointer with a resolved receipt or immutable historical
blob. Do not change expected fallback behavior or truth domain based on these fixtures. Dated
research remains historical. No per-finding intake override or probe was found in the active
record. Coordinator still must post/read back a resolution with pinned source, run the resolver,
regenerate index/generated corpus as needed, and provide cleanup for final verification.

No paid call or upstream write was made by this reviewer.

## Targeted other-record corrections — independent diff review

Read the complete 14-record patch against HEAD and compared each current claim with its action
row and underlying receipts. Scope is appropriate: cs-010; ll-004/006/016/017/020/023/024/025/026;
sls-024/029/033/101. Statuses remain unchanged. Historical evidence is retained or explicitly
labeled historical; the current Finding/Recommendation no longer treats old observations as
current failures or missing optional metadata as demonstrated false content.

The cs-010 change correctly removes the resume opt-out from pending recommendations while
retaining its observed behavior and the main provider-options defect. Independently read issue
2790 and its closing comment: `github-actions[bot]`, 2026-11-03T15:50:21Z, explicitly declines
both no-gateway and resume-opt-out controls. This is automated triage, not human acceptance.
The LL changes appropriately acknowledge warning and corpus progress, separate ranking-contract
uncertainty from inferred implementation bugs, and preserve the unsubstantiated original
false-content triggers of ll-023/024. The quantum record keeps its October Accepted/TBD evidence
historical and separates current CAP implementation, Testnet, Mainnet, and native signer scope.

Independently recomputed the Scout population from every archived category page, deduplicated
by slug: **1,006** projects, **104** positive network qualifiers (**100 mainnet, 4 testnet**),
**55** without deployment source and **35** without supportedNetworks. Every lifecycle row has
date/basis; every non-unverified lifecycle claim has a source. Independently recomputed exact
Wallet data: **72 rows, 72 normalized names, 10 null productKind, 39 empty availability**. The
seven named Live null-kind rows, two Development rows and Inactive MXlet match the proposed text.
These are arithmetic checks over the author's fresh receipt, not extra live population replays.
The oracle correction keeps July feed samples historical and does not claim current feed liveness.
The sls-101 narrowed residual agrees with this reviewer's independent aggregate/provider reads;
warning deployment must not be described as a provider-value refresh.

One requested precision correction remains at this point: ll-026's initial new paragraph calls
February 9 “the trading date” in the retrieved prose. Exact article 5416 says **planned February 9,
pending regulatory review**; 4809 confirms a **February launch**, without the day. Asked the author
to retain that distinction so the record does not make the very announcement/actual-date inference
it warns about. No other substantive diff blocker found. Final author stability, receipt repairs,
ll-026 correction and sls-097 retirement cleanup are verified below when available.

## sls-115 filed issue — independent final readback

Read exact raw API body and author of
[Stellar-Light/stellarlight#1933](https://github.com/Stellar-Light/stellarlight/issues/1933):
open, author `kalepail`. The posted body retains the automated marker/notice, all five required
sections, exact 29-versus-own-scan-30 evidence, the explicit-current control, honest historical
note scope, general source invalidation recommendation, sls-087 successor distinction and
resolution handoff. The public immutable snapshot at
`58dbac43fde1a8462b66f442c5e356f2d0d39bd9` returned 200 and matched the local committed blob exactly.
The active finding now correctly records `reported-upstream` with issue 1933. This readback
confirms a published Raven report, not maintainer acceptance or an upstream fix. No filing blocker.

### Stable finding patch acceptance

After the author's stable signal, re-read ll-026: it now distinguishes the planned February 9
launch pending regulatory review from article 4809's February-only actual launch, and explicitly
says these records do not confirm the exact first-trade day. **All 14 finding corrections are
accepted, with no remaining substantive finding-diff blocker.** `git diff --check` passes.
The author's lint found only stale generated INDEX in the shared tree; regeneration is owned
by the coordinator, not silently treated as a passing check here.

Both repaired receipt entries now have fresh 14:22Z URL/status/hash provenance. Verified exact
body lengths and hashes against disk: LOBSTR SCF 66,765 bytes,
`d1b57f4e50d39f7d82a46ea3fc683ea5e642e6d19314fcba47b9b4d3c1f1111a`;
Trustless Work SDK 4,677 bytes,
`6a9413689b53ea56e98c55b99ba558a1d54137ba850742cb0ba9e9cc425bd218`.
The LOBSTR HTML hash differs from the earlier independent observation because this is a new
fetch; both parsed award/payment facts agree. The unsupported “Deleted PR18” wording is gone.
The table now accepts sls-097's documentation scope and retains the pending lifecycle gate.
Asked for final table housekeeping: record the already-posted ll-022 correction and replace
“next revise/align” instructions for completed local edits with future owner-change triggers.

## sls-097 prepared retirement — accepted for resolver

**The prepared retirement/reference gate is accepted.** The owned golden changes exactly two
JSON leaves: `truth.verified.evidence[14]` and `truth.verified.rootCause[2]`. Independently compared
all leaves with HEAD: no answer, key fact, avoid clause, verification date or grading change.
The generated `eval/qa/cases.json` case exactly equals the owned case. Its replacement immutable
historical source `049fb7476f609af398b00d2812736470f4602430` returned 200, preserves `status: verified`
from that historical snapshot, and matches archived bytes at SHA-256
`3bbe8f45f52f0f68aef219958c853e2d67800c4c8e5ebcd4918510144109b056`.
No sls-097 intake override, register/sentinel link or probe needs deletion. The candidate is now
`fixed-upstream`, and the preview title describes the original missing-502 contract defect.
Public audit receipts now preserve the live schema, pinned handlers, original finding and
positive/negative validation results under `research/audits/2026-11-06-remaining-sweep/docs-sls097/`.

Independently read exact posted bodies and `kalepail` attribution on both required upstream refs:
[issue 1908](https://github.com/Stellar-Light/stellarlight/issues/1908#issuecomment-6687147857) and
[PR 1929](https://github.com/Stellar-Light/stellarlight/pull/1929#issuecomment-6687148441).
Flagged “five 502 branches” because four fixtures share one provider-failure branch; the
coordinator edited the existing comments. Fresh independent readback now says “five 502 fixtures,”
with accurate adjacent 503/500 scope. Both comments explicitly disclaim a paid POST, model
availability and gateway-format repair. The source link preserves the historical reported record;
the new verification is in the comments and pending resolved receipt. No duplicated comment was
needed. Comment scope and reference cleanup are accepted; actual removal/receipt/index inspection
follows the coordinator's resolver execution.

The author's stable gate report says corpus compilation, register check, QA lint, index generation
and improvements lint passed. This reviewer independently checked the generated case equality
and diff cleanliness; it does not represent the author's command runs as separate reviewer runs.
The remaining preparation-note link is populated by the author as part of its final handoff.


## Final lifecycle acceptance

**Accepted with no outstanding findings in this review's scope.** Inspected the actual resolver
result: sls-097's active file is absent, INDEX no longer contains it, and exactly one complete
resolved receipt exists with the original defect title, both upstream refs, resolving PR1929,
live documentation proof, distinct review, historical source commit and explicit availability
limits. The corrected “five 502 fixtures” wording is in the receipt and both independently
read-back comments. There was no probe or intake override to remove.

Parsed the four changes to November3 `case-dispositions.json`: all are locator-only replacements
with the verified immutable049fb747 source. Historical statuses, evidence hashes and other fields
are unchanged. Generated lifecycle registry changes only this case's content digest; sample
changes only the corpus digest. Golden source/generated equality and unchanged answer/dates
were independently checked above. The final root ledger correctly supersedes preparation
notes, links both resolution comments and records **102 active / 196 resolved**. The completed
sls-097 TODO bullet is removed; no paid-model follow-up was silently added.

Replayed the compact, newly archived schema evidence through hc terminal t2v4: six positive/
negative fixtures passed, exit0, no network/model request. Removed that owned terminal after
reading its result. All prior owned command terminals were already removed; no other agent's
terminal was controlled. `git diff --check` passed. The root's final scan/release gates remain
coordinator work; this reviewer made no commit, push, upstream write or production mutation.
