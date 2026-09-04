# Production deployment closeout — independent review

Date: 2026-09-04.

Reviewer: Claude Opus 5 at `high` effort. Mode: audit. The reviewer changed no product code and no
existing document.

Author of the reviewed work: Codex Terra.

Reviewed commit: `bbc606b0e5cb29f1ff4fba088ff480976699a546`, "docs: record production deployment
closeout".

Worktree: `/private/tmp/stellar-raven-tm-deployment-record`, branch
`codex/truth-maintenance-deployment-record`.

Base: `50bf5518860584ec1e5d352acbe11033515a0b7f`, the PR #125 merge on `main`.

## Verdict

`CHANGES-REQUIRED`. Five actionable findings remain.

The deployment itself is real, correct, and verified. The reviewer confirmed every substantive
factual claim in `production-deployment-terra.md` against Git, the GitHub API, Wrangler, the public
routes, authenticated free MCP probes, and Cloudflare telemetry. Not one deployment fact was wrong.

The findings are documentation-state defects. `NEXT.md` and the round ledger still carry four
passages that direct or describe PR #125 and the deployment as open work. The commit updated some
surfaces and missed others, so both files now contradict themselves. One further finding covers the
missing query inputs in the closeout record.

The reviewer made no paid call, no external write, no deployment, and no network mutation. Every
probe was a free read.

## Scope

The commit changes three files. All three sit under `.agents`. The reviewer measured zero changed
files outside `.agents`. No product code, test, or generated artifact changed.

## Verified facts

Every claim below reproduced exactly.

### Git and PR #125

| Claim | Evidence | State |
| --- | --- | --- |
| PR #125 merged as `50bf5518860584ec1e5d352acbe11033515a0b7f` | `gh pr view 125` returns that exact `mergeCommit` | Confirmed |
| Merged at `2026-09-04T12:27:17Z` | `mergedAt` is `2026-09-04T12:27:17Z`; the commit date is `2026-09-04 08:27:17 -0400` | Confirmed |
| PR state | `MERGED`, base `main`, head `codex/truth-maintenance-2026-09-03` | Confirmed |
| `main` carries the merge | `main` and `origin/main` both resolve to `50bf551` | Confirmed |
| Copilot comment `3933695212` | Real comment by Copilot on `src/catalog/search.ts:51` about the unused `COMPACT_OUTPUT_THRESHOLD` import | Confirmed |
| Fixed in `ab5388e` | `ab5388e` removes exactly that import; it is the PR head OID | Confirmed |
| Resolved | The single review thread on PR #125 reports `isResolved: true` | Confirmed |
| The fix reached `main` | `git diff ab5388e 50bf551 -- src/catalog/search.ts` is empty | Confirmed |

`50bf551` is a squash merge with one parent, `2ee801f`. `ab5388e` is therefore not an ancestor of
`main`. The record does not claim otherwise.

### Final CI

The reviewer read the check runs for the PR head `ab5388e`. All four succeeded. Every duration
matches the record to the second.

| Check | Started | Completed | Duration | Record |
| --- | --- | --- | ---: | ---: |
| Analyze (actions) | 12:25:14Z | 12:26:03Z | 49 s | 49 s |
| CodeQL | 12:25:53Z | 12:25:56Z | 3 s | 3 s |
| secrets | 12:25:16Z | 12:25:39Z | 23 s | 23 s |
| test | 12:25:17Z | 12:26:50Z | 1 m 33 s | 1 m 33 s |

### Wrangler deployment state

`wrangler deployments list` shows the newest deployment created at `2026-09-04T12:29:24.371Z`,
carrying version `8022e211-c731-49cc-aef1-a20f1da798b9` at `(100%)`. The prior deployment, created
`2026-09-02T22:16:20.411Z`, carries `f62b64fa-1fb7-4c25-970d-7f98c83ab302` and remains the rollback
target. Both the timestamp and both version identifiers match the record exactly.

The deployment followed the merge by two minutes and seven seconds.

### Public routes

All eight probes returned 200.

| Path or host | Status |
| --- | ---: |
| `https://raven.stellar.org/` | 200 |
| `/docs` | 200 |
| `/terms` | 200 |
| `/playground` | 200 |
| `/health` | 200 |
| `/.well-known/oauth-protected-resource` | 200 |
| `https://raven.stellar.buzz/` | 200 |
| `https://agents.stellar.buzz/` | 200 |

`/health/skills` returns
`{"ok":true,"checkedAt":"2026-09-04T12:07:53.530Z","checked":41,"ms":9918,"error":null}`. The
`ok`, `checked: 41`, and `checkedAt` values match the record exactly.

The `checkedAt` value predates the deployment by 21 minutes. That is correct, not stale. The skill
canary is an hourly cron that writes its verdict to KV, and `src/skills/canary.ts:139-143` records
that a stale `checkedAt` is the intended downstream symptom of a canary that could not record
itself. A per-request timestamp was never the contract.

The playground response carries
`script-src 'sha256-ZB8MB5SKhRnJx0CaegzHU7J/JhdbqAhUdhGgxaO8z+o='`. That value equals
`DEMO_SCRIPT_SHA256` at `src/demo/page.ts:909`. The record's hash is correct.

### Authentication and MCP surface

An unauthenticated `initialize` against `https://raven.stellar.org/mcp` returns **401** with a
`WWW-Authenticate: Bearer` challenge. The record's 401 claim is correct.

The authenticated surface exposes exactly two tools, `search` and `execute`. The reviewer confirmed
this through the configured production MCP client at `https://agents.stellar.buzz/mcp`, which binds
the same Worker.

The reviewer could not recompute the surface SHA-256
`21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`. That value needs
`eval/report-live-surface.mjs` with a named bearer credential. No such credential exists in this
shell, and the reviewer did not extract one. The reviewer verified the surface composition instead.
This is a stated limit, not a finding.

The record's `sourceRevision` claim is structurally correct. `src/server.ts:43-51` adds
`sourceRevision` only when the build-time define `__RAVEN_SOURCE_REVISION__` holds a 40-character
hex value. Only `scripts/run-eval-server.mjs:37` injects that define. Production `wrangler.jsonc`
never defines it, so `serverInfo` omits the field and a source pin cannot bind production. Terra
correctly relies on Wrangler version evidence instead.

### Runtime behavior

The reviewer reran each runtime probe as a free service call.

**Search.** A Soroban query returned three hits with `stellarDocs.search_soroban_contract_docs`
first. This matches the record.

**Execute.** A script returned a raw Lumenloop envelope across the Dynamic Worker RPC boundary. The
result carried `ok: true` and `count: 1`, with `lumenloop.search_directory=ok/169ms`. The record
states `ok: true`, `count: 1`, and 143 ms. Latency varies between runs; the structure matches
exactly.

This probe is the behavioral proof that the envelope serialization repair `795fa41` is live. That
repair was the substantive product change in this deployment.

**Digest.** The record states 10 articles, 7 A/V, 17 total, one successful constituent call, and
null A/V dates. A default-parameter rerun returned 5, 4, and 9. A rerun with `perTypeLimit: 10`
returned **10 articles, 7 A/V, 17 total**, one successful `lumenloop.find_content_by_entity` call,
window `2026-06-06` to `2026-09-04`, and null dates on all four inspected A/V rows. The record is
correct at `perTypeLimit: 10`, which it does not state. See finding F4.

### Cloudflare telemetry

The reviewer queried the account observability API for each Ray the record names.

| Ray | Service | Worker Version |
| --- | --- | --- |
| `a35d03a369b1dcbf` search | `stellar-raven-codemode` | `8022e211-c731-49cc-aef1-a20f1da798b9` |
| `a35d03a40fccaa0c` raw execute | `stellar-raven-codemode` | `8022e211-c731-49cc-aef1-a20f1da798b9` |
| `a35d05e68906291e` digest | `stellar-raven-codemode` | `8022e211-c731-49cc-aef1-a20f1da798b9` |
| `a35d048bf9700eef` authenticated initialize | `stellar-raven-codemode` | `8022e211-c731-49cc-aef1-a20f1da798b9` |
| `a35d048baf859877` unauthenticated initialize | `stellar-raven-codemode` | `8022e211-c731-49cc-aef1-a20f1da798b9` |

Every Ray binds to the deployed version. That is the core telemetry claim and it holds.

The search Ray records `evt: mcp_request` with `status: 200`, matching the record.

The reviewer joined 8 events for the four key Rays, one `cf-worker` and one `cf-worker-event` each.
The record states 14. The reviewer also observed that the service emits four further app event
kinds in the same window: `execute`, `skill_run`, `op`, and `search`. Six such tool-level events —
`search`, `execute`, and `op` for the raw execute, then `execute`, `skill_run`, and `op` for the
digest — added to the 8 request-level events give exactly 14. The count is therefore consistent
with the observed event kinds. The reviewer could not reproduce the join, because those events do
not carry the `rayId` field the reviewer filtered on and the record does not state the query. See
finding F4. The reviewer does not dispute the count.

The `cloudflare-workers-traces` dataset held no events in the window, so no OTel span evidence
exists for this deployment.

Both `8022e211` and `f62b64fa` appear in a window that starts before the cutover. That is the
expected shape of a version change, not a split deployment.

## Findings

### F1 — Medium — The handoff still directs work on the merged PR #125

Location: `.agents/NEXT.md:354-359`, section "## Suggested sequence".

Evidence:

- The section reads "Add the timeout repair commit to PR #125 after the owner grants external-write
  authority. Confirm CI, then prepare PR integration, deployment verification, and cleanup. Merge
  and deploy only after the owner grants each required authority."
- PR #125 is `MERGED`. Its final CI passed. The deployment completed at `2026-09-04T12:29:24.371Z`.
- The same file states at lines 82-86 that "PR #125 merged", "Final CI passed", and "Deployment work
  is complete".
- The commit rewrote the "Next actions by class" block and left this section unchanged.

Consequence:

`NEXT.md` gives two different answers to the same question. An agent that reads the handoff bottom
up receives an instruction to push a commit to a merged pull request and then to merge and deploy.
The instruction cannot succeed and contradicts the file's own state section.

Smallest repair:

Rewrite the section. State that PR #125 merged, CI passed, and the deployment completed. Keep only
the owned-resource cleanup and the owner decisions as remaining sequence.

### F2 — Medium — Owner decision E still poses merge and deployment as open

Location: `.agents/NEXT.md:248-253`.

Evidence:

- The decision reads "Question: merge `codex/truth-maintenance-2026-09-03` and deploy the repaired
  runtime?"
- That branch merged as PR #125 into `50bf551`. Wrangler then deployed `8022e211` at 100 percent.
- The decision's evidence line says "the last recorded deployment state carries the envelope
  fault".
- Production now runs the repaired runtime. The reviewer proved it by returning a raw Lumenloop
  envelope through the Dynamic Worker boundary in production.
- The commit did not touch decision E.

Consequence:

The owner decision list presents a decision that the owner already made and that the round already
executed. It also repeats a retired risk claim about the deployed runtime. A reader taking the
decision list as current would believe production still carries the envelope fault.

Smallest repair:

Record decision E as exercised. Name the merge commit, the deployment time, and the deployed
version. Remove the retired envelope-fault sentence, or relabel it as the pre-deployment state.

### F3 — Medium — The ledger keeps two bullets that say deployment and merge are pending

Location: `.agents/rounds/2026-09-03-truth-maintenance.md:625-629`, section
"## Decisions (2026-09-04)".

Evidence:

- Line 625 reads "Production deployment waits for round closeout and explicit deployment
  authority."
- Lines 625-627 add "The last recorded deployment state, from 2026-09-02, carries the envelope
  serialization fault that `795fa41` repairs."
- Line 628 reads "PR integration, deployment verification, and owned-resource cleanup remain. Merge
  and deployment still need explicit owner authority."
- The same ledger marks "Production smoke checks pass" as complete at line 343 and records the
  deployment in its scope section and outcome table.

Consequence:

The ledger contradicts itself inside one document. Its decision list keeps a deployment gate that
its checklist and outcome table both report as passed. Only owned-resource cleanup actually
remains.

Smallest repair:

Replace both bullets. State that the merge and the deployment completed, name
`8022e211-c731-49cc-aef1-a20f1da798b9`, and keep only owned-resource cleanup as remaining work.

### F4 — Medium — The closeout record omits the inputs that produced its results

Location: `.agents/rounds/2026-09-03-truth-maintenance/production-deployment-terra.md:35-37`,
`:61`, and `:67`.

Evidence:

- Line 35-36 says "Health returned `ok: true` and `checked: 41`" and gives `checkedAt`. The table
  above lists a route named "health". `/health` returns
  `{"status":"ok","service":"stellar-raven-codemode"}` and has no `checked` field. The quoted
  payload comes from `/health/skills`, which the record never names.
- Line 37 says "The CSP remains `sha256-…`". The root CSP carries no hash; its `script-src` is
  `'unsafe-inline'`. The hash appears only on `/playground`. The record names no page.
- Line 61 gives 10 articles, 7 A/V, and 17 total. A default-parameter rerun returns 5, 4, and 9. The
  numbers reproduce only at `perTypeLimit: 10`, which the record omits along with `subject`,
  `subjectType`, and `days`.
- Line 67 says "Cloudflare telemetry matched 14 events for the four key Rays" and gives per-event
  latencies. The record states no query, dataset, join key, or time window.
- `.agents/skills/cloudflare-observability-review/SKILL.md:12-15` requires that a maintenance pass
  "record the query inputs, Ray IDs, and verdict in the relevant round ledger". The record captured
  Ray IDs and the verdict, and not the query inputs.

Consequence:

The record is a verification artifact whose purpose is re-verification. A reader who checks the
health line against `/health`, or the digest line with default parameters, finds a mismatch and
must suspect the record. The reviewer hit both mismatches before locating the real endpoint and the
real parameter. Every underlying fact is true; the labels make true facts look false.

Smallest repair:

Name the endpoint on the health line and the page on the CSP line. State the digest input object.
State the telemetry dataset, join key, and time window. No measurement needs to change.

### F5 — Low — A design blocker still says the round branch is not merged

Location: `.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md:693-695`.

Evidence:

- The launch blocker reads "The branch `codex/truth-maintenance-2026-09-03` contains the work
  through `dc0761d`. It contains all five but is not merged."
- That branch merged as PR #125 into `50bf551`.

Consequence:

A launch prerequisite reads as unmet when it is met. The error is conservative: it makes a closed
gate look more closed and cannot unlock spend.

Smallest repair:

State that the branch merged as `50bf551`, and keep the remaining launch-revision requirement.

## Gates that remain blocked

The reviewer confirmed each class at `bbc606b`.

- `.agents/NEXT.md:122` keeps the filing block. `.agents/NEXT.md:128` keeps the paid block.
  `.agents/NEXT.md:141` keeps the human-judgment block.
- `improvements/INDEX.md` still shows 57 `reported-upstream`, 10 `verified`, and 3
  `declined-upstream`. That total is 70. No record moved to a filed state. The commit changed no
  `improvements` file.
- Revision 3 still says that it authorizes nothing. Its signature line at line 626 still offers
  `AUTHORIZED` or `NOT AUTHORIZED`.
- Owner decisions A to D and F to J stay open. Decision 5, the concurrent-load acceptance, stays
  open. Decision E is stale, which is finding F2.
- The commit changed no file under `eval/qa/corpus`, so no golden answer moved.
- The ledger keeps two checklist items open: the pane record and the owned Herdr cleanup.

The commit grants no paid, filing, or golden authority. Deployment authority was exercised, not
extended.

## Observations

These need no action.

**O1 — A loose heading.** `.agents/NEXT.md:150` reads "### Owner-blocked cleanup". Its first bullet
is the owned Herdr cleanup, which no owner blocks. Its second bullet points at genuinely
owner-blocked work. A name such as "Remaining cleanup" would fit the content better.

**O2 — Ray order.** The recorded Ray IDs order the runtime probes before the public sweep, while the
record narrates the public sweep first. Section order need not follow probe order. Nothing depends
on it.

**O3 — No OTel spans.** The `cloudflare-workers-traces` dataset held no events for this deployment.
App logs and platform events carried all the evidence. This is a property of the current setup, not
a defect in the record.

## Commands and results

| Command | Result |
| --- | --- |
| `gh pr view 125 --json state,mergedAt,mergeCommit,headRefOid` | `MERGED`, `2026-09-04T12:27:17Z`, `50bf551…`, head `ab5388e…` |
| `gh api …/commits/ab5388e/check-runs` | Four checks, all `success`, durations 49 s, 3 s, 23 s, 1 m 33 s |
| `gh api …/pulls/comments/3933695212` | Copilot comment on `src/catalog/search.ts:51` |
| `gh api graphql` review threads for PR 125 | One thread, `isResolved: true` |
| `git rev-parse main origin/main` | Both `50bf551…` |
| `git diff ab5388e 50bf551 -- src/catalog/search.ts` | Empty |
| `wrangler deployments list` | Newest `2026-09-04T12:29:24.371Z`, `8022e211…` at 100%, prior `f62b64fa…` |
| `curl` on eight public routes and hosts | All 200 |
| `curl https://raven.stellar.org/health/skills` | `ok: true`, `checked: 41`, `checkedAt` as recorded |
| `curl -I https://raven.stellar.org/playground` | CSP carries the recorded `sha256-…` |
| `curl -X POST …/mcp` unauthenticated `initialize` | 401 with a Bearer challenge |
| Authenticated `search` probe | Three hits, top `stellarDocs.search_soroban_contract_docs` |
| Authenticated `execute` raw-envelope probe | `ok: true`, `count: 1`, `lumenloop.search_directory` ok |
| Authenticated digest probe, `perTypeLimit: 10` | 10 articles, 7 A/V, 17 total, one call, null A/V dates |
| Cloudflare observability query per Ray | Five Rays, all `8022e211…` on `stellar-raven-codemode` |
| Cloudflare observability event-kind survey | `mcp_request`, `execute`, `skill_run`, `op`, `search` |
| `git diff --name-only 50bf551 bbc606b` outside `.agents` | Zero files |
| `git diff --check 50bf551 HEAD` | Pass |
| `npm run secrets:scan -- --tree` | Pass, clean with gitleaks |

The reviewer linked a prepared `node_modules` tree for Wrangler and the secret scan, then removed
it. The worktree carries no change except this report. The reviewer printed no credential, no
bearer token, no API key name, and no IP-bearing field.

## Standing

The deployment is complete, correct, and independently verified. Production runs Worker Version
`8022e211-c731-49cc-aef1-a20f1da798b9` at 100 percent, and it carries the envelope serialization
repair.

The five findings are documentation repairs. None of them changes the deployment state. After F1,
F2, F3, and F4 land, and F5 with them, this review supports `PASS`.

Owned Herdr cleanup remains the only open round work. No paid, filing, golden, or human-decision
gate is opened by this review.
