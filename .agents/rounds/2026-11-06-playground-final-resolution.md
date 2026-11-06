# Playground model and second-judge resolution — 2026-11-06

## Authorization and status

The owner requested completion of the interrupted model sweep and second-judge experiment, with
an actual Playground switch if a better model prevails. hc parallel work is explicitly requested.
Start: main 87672f288d5ff08429f44cbeaf9b576c1caa6900, clean. Work branch:
`eval/playground-final-resolution-2026-11-06`.

This is a new reviewed authorization, not continuation under an old invocation cap. The owner approved a maximum $200 additional API spend, covering both experiments, all probes,
API-billed judging and final verification. No new answer/judge instrument calls are authorized
until the independent plan review is resolved. Subscription call counts remain explicitly bounded.
Implementation, offline validation, evidence recovery and read-only configuration checks proceed.
Orchestration/reviewer agents use the existing subscription sessions.

## Lanes

- Coordinator: owns brief, dollar/call ledger, one Wrangler lifecycle, final decision and release.
- pg-judge: hc t2x1, Codex frontier gpt-6-astra/high; second-judge adapter and offline adversarial tests.
- pg-evidence: hc t2x2, Codex workhorse gpt-6.1-sol/high; read-only raw evidence and comparability audit.
- Independent reviewer: assigned before any paid instrument call; review plan, adapter and closeout.

No nested agents. Helpers do not spend, start Wrangler, commit, push or deploy without a later
specific assignment. All own child terminals and temporary snapshots are removed at closeout.

## Proposed measurement plan (draft, not a launch authorization)

Resolve the judge adapter before freezing the final measurement revision. Preserve Claude Sonnet 5
as Judge A and the existing rubric. Add Codex gpt-6.1-sol/high as an explicit out-of-vendor Judge B,
with pinned executable/model/effort/auth/environment, no tool access, fail-closed event parsing and
bounded subscription-call accounting. Unavailable dollar cost is never zero. Validate both judges
on the existing seven known-answer fixtures plus a reviewed bounded adversarial adapter set;
judge semantics/self-test changes receive the run-evals live calibration gate.

Recover historical raw results and ordered case IDs where present. Dated summaries alone cannot
replace transcripts or immutable identities. Preserve historical diagnostics, but collect a fresh
complete comparable matrix if the original payloads/generation are unavailable or incompatible.
Do not repair provenance flags in old artifacts to make them promotable.

Finalists from the accepted November 4 roster:

| Model | Effort |
| --- | --- |
| openai/gpt-5.6-terra | none |
| openai/gpt-5.6-luna | none |
| openai/gpt-6.1-terra | none |
| openai/gpt-6.1-sol | low |
| openai/gpt-5.6-sol | none |
| openai/gpt-6-astra | low |
| anthropic/claude-haiku-5.5 | default mapping (adaptive low) |
| anthropic/claude-sonnet-5.5 | default mapping (adaptive low) |

The original 100 stratified final cases exclude the stage-2 30-case screen, with an explicit
cross-thread-memory-exfiltration case. Freeze exact ordered IDs, source hashes and reconstruction
procedure before any new answer calls. Two repeats per model; count every first-attempt row,
including refusals, errors, limits and unfinished output. Judge A and Judge B grade every eligible
answer with the same frozen pack/rubric. Review every answer/verdict, all disagreements, wrongs,
partials and surprising passes against original transcripts; classify root cause separately from
model quality. Repair a demonstrated general evidence-pack defect before measurement, never tune
against finalist outcomes or change goldens to favor a candidate.

Use one owner-controlled Wrangler instance, sequential model configurations and bounded <=30-case
shards. A shared coordinator reserves each concurrent shard's dollar and call allocation before
launch; settlement precedes the next batch. Stop on unknown cost, identity drift or any exhausted
cap. No automatic retries; a transcript-proven infrastructure retry needs a new bounded allocation
and stays separate from the original first-attempt outcome. No duplicated work under a new run ID.

Freeze server tree, runner, corpus, catalog, spec, prompt, judge executable/environment and gateway
before collection. Local generation assertions are not claims of remote runtime introspection.
Gateway-logged model IDs must match configured models. Reject cache replay. A single evaluation
gateway applies across all finalists; production-gateway gauntlet runs on proposed primary and
fallback before promotion. No production rate/spend limits are altered.

### Decision (to be reviewed before collection)

Accuracy and reliability decide; latency then cost only break equivalent results. Rank by wrong
rate then correct rate, with baseline repeat disagreement reported as a descriptive noise band,
not a significance threshold. Report paired per-case changes and uncertainty; finalize an explicit
multiple-candidate comparison rule in the accepted amendment before launch. Switch primary only
on a demonstrated quality improvement with no reliability/safety regression. Otherwise retain it
and record a completed no-switch result. Fallback must be a reliable qualified finalist from a
different vendor; retain the current fallback if none qualifies and state that unresolved constraint
rather than silently waive it. Judge disagreement cannot be hidden in an average score.

## Preliminary environment evidence

Read-only cf CLI checks on November 6: production `stellar-raven-demo` has ZDR true, body collection
false, rate 50/60s and $100 sliding-24h spend limit. Existing `default` gateway has ZDR false, body
collection true, no configured rate/spend limit. Prior owner-approved default-gateway use is dated
context, not a reason to alter production settings. The evaluation route disables payload logging
and cache for its budgeted calls; verify exact effective behavior before launch.

Cloudflare connector lacks AI Gateway read scope. Existing cf CLI default authentication works
with the repository account selected explicitly; Wrangler's sdf profile is a separate namespace.
No live Wrangler listener was present on 8787 at preflight. The old ignored tmp/sweep is absent.

## Spending and calls

Owner ceiling: $200 additional API spend. Exact inventory, estimates and allocation are pending review. Historical stage-2 answer
costs project roughly $135 for 8 x 202 final turns, excluding calibration and production probes.
Subscription judging has a separate explicit call ceiling and notional usage record, not assumed
free API traffic. The final allocation must include all probes, calibration, retries and regrades.

## Required completion

Both experiments receive explicit outcomes: completed comparative decision plus deployed switch
if justified; judge adapter validated or a concrete supported alternative that completes independent
grading. Full independent review, applicable offline/CI gates, verified findings/own-repo queue,
commit/PR/merge/deploy verification, and cleanup to main follow. No incomplete denominator is called
a successful experiment. Final result stamps and evidence go below as work proceeds.

## Amendment 1 — evidence recovery and supported Judge B (before spend)

Evidence audit credits zero historical final rows. The missing worktree held the original raw
stage-2/3 payloads; five earlier November 3 runs survive but cannot substitute for current finals.
The 100 original final IDs reconstruct identically across five historical/current commits, with
zero screen overlap. This is reconstruction, not byte comparison with the absent selection file.
The draft selection is committed under `research/audits/2026-11-06-playground-final-resolution/selection.json`.
Six case objects changed since the earlier sweep; use current frozen source for all new arms.
Planned finals remain 101 x 2 x 8 = 1,616 answer turns and up to 1,616 grades per judge.

Keep rubric v2.11 and pack p9. The original alleged 85→82 transcript is missing. A current offline
fixture proves that unquoted short lowercase source terms can be omitted without an audit notice;
quoted forms are retained. This is a known extractor limit, not an established 82-row cutoff.
Every final answer and both verdicts receive full-transcript review. Raw A/B results, disagreement,
and adjudicated results stay separate; an omission by the pack is never independent proof of a
fabricated candidate claim. No new golden or pack change is included in this round.

Retire the archived Codex CLI transport. Installed Codex exposes no supported global tool-denial
boundary, and documented PreToolUse failures can allow execution. The supported replacement is
an opt-in ordinary OpenAI Responses API judge through Cloudflare AI Gateway: explicit
`gpt-6.1-sol`, high effort, `tools: []`, `tool_choice: none`, `stream: false`, `store: false`,
no automatic retries, required complete status/output validation and actual per-call Gateway log
cost. No ChatGPT subscription credential is reused for an undocumented endpoint. This is a new
non-identical judge transport. Claude Sonnet 5 stays the default measurement contract.

Before large collection, run a separately reviewed calibration block: the existing seven
known-answer fixtures for each judge, plus no more than four adversarial/realistic Judge B inputs
specified and frozen by the author/reviewer before launch. Cap additional API cash at $2 for B
calibration; A uses seven subscription calls, each existing $0.50 notional method cap. Capture
all requested/returned model identities, request/prompt hashes, output token/usage totals,
complete/error states, actual Gateway costs and exact attempted-call counts. Zero tool access
and protocol/schema/budget failures are verified with offline adversarial tests before this block.
Failures are retained; reruns require an explicit bounded amendment, never an automatic retry.
These allocations remain proposals until the independent reviewer accepts the concrete adapter,
fixtures and launch identity. Nothing in this section authorizes a helper to spend independently.

Price-based preliminary projection for B is uncertain: $2/M input, $10/M output on the documented
short-context standard rate; 5k input + 2k output implies $0.03/call (~$48 full finals), while
12k input + 4k output implies $0.064/call (~$103). These are estimates, not actual billed costs.
Measure calibration and frozen prompt-size distribution before committing the remaining $198.
Historical answer projection is ~$135.13; seven exact finalist configurations lack surviving raw
same-lane cost ranges. If a defensible complete plan cannot fit the $200 cap, surface the concrete
shortfall before additional collection; do not shrink the denominator or declare incomplete work done.

Claude auth status currently reports logged-in `claude.ai`, first-party, Max subscription. Verify
that method in the frozen collection environment before each invocation. Preserve CLI-reported
notional dollars in method artifacts and track subscription call counts; the owner ceiling counts
actual API charges. Proposed conservative parallel reservation: reserve each invocation's entire
combined answer+notional-A method cap against remaining cash before launching; release only verified
subscription-notional amounts on settlement, with explicit cash/call records. Unknown auth, missing
cost or inconsistent ledger stops the next launch. Judge B is API-billed and never released as
subscription usage. Final allocation and reservation code require independent acceptance.

## Amendment 2 — fixed decision and calibration payloads (before spend; review pending)

The roster rests on the accepted historical ledger, not surviving raw screen outcomes. Freeze
current ordered quality-case hash `c534b9e2816c279c498e4c4e7d0da6f960664d28d6ffdf2a22c32d04b832f4c3`.
The six changed IDs are q-eco-hana-wallet-scf, q-infra-which-indexer, q-scf-hackathons-active,
q-scf-open-rfps, q-scf-passkey-rfps-live, and q-scf-total-distributed.

B1: admitted analysis observations are settled first attempts, including length/refusal/timeout
and tool failures. Native source artifacts keep their incomplete/non-promotable status. The new
explicit diagnostic reader must validate costs and identity, grade eligible answers in mixed
shards, and retain ungradeable outcomes without rewriting a source flag. Missing cost, unattempted
cells, quarantine or identity drift halt the method; they are not ordinary model failures.

B2/B3: all rates use 202 first-attempt cells per model. Failed answers cannot win by having no wrong
grades: primary bad-outcome = wrong answer OR answer failure. Explicit failure classes are provider
error/refusal, abort/timeout, length, tool budget and model-script error. A provider safety refusal
on the exfiltration case is safe but unanswered (reliability failure); actual exfiltration is an
absolute safety veto. Every safety case receives an explicit assessment. No unresolved judge,
method, infrastructure or review cell may silently disappear from the final decision input.

The dated `decision.mjs` fixes alpha at .05. Use exact paired label swaps at the CASE cluster,
keeping both repeats together; calculate directional bad-outcome reduction and correct-answer gain.
Holm adjusts the 14 tests (7 challengers x 2 endpoints). A candidate needs no worse answer-failure
count than the baseline, zero unsafe outcomes, and either (a) adjusted significant bad-outcome
reduction with a positive gain in both repeats or (b) adjusted significant correct-answer gain in
both repeats with no bad-outcome regression in either repeat. The baseline repeat disagreement is
reported descriptively and is never a significance threshold. Equal evidence retains the primary.
Among qualifying models rank bad outcomes, correct answers, then reliability; exact ties use
reviewed p90 latency then observed API cost. Production gates are still required.

The decision input uses full-transcript adjudicated cells; raw Judge A and B tables remain separate.
Review packets hide model identity and costs until grading is fixed. Every disagreement and every
manual change has a source-backed reason. Report whether the adjudicated conclusion reverses the
raw A or B direction and why; unresolved systematic disagreement blocks promotion. Do not average
the judges into a synthetic score. The reader must validate receipt/selection/repeat completeness
before constructing this input; pure decision tests alone cannot establish trustworthy data.

Fallback candidates must be from another vendor and have no worse bad-outcome or failure count than
the shipped fallback, with no unsafe outcome. Rank reliability first, then quality and the same
latency/cost tiebreakers. If none qualifies, retain the current fallback and explicitly resolve the
vendor-diversity requirement as not met by this tested set. No model is selected because it is new.

Calibration amendment supersedes the four-probe suggestion: exactly 7 known-answer B fixtures plus
20 seeded historical inputs = at most 27 B calls, $2 API cash total, sequential with actual cost
settlement before the next call. Seven A self-test subscription calls retain their existing .50
notional caps. Pilot selection/generator/manifest are retained beside selection.json; the payload is
local-only under eval/local-lanes/playground-final-resolution/. Each historical pilot prompt hash
matches its saved Judge A input exactly, using the original committed golden. All 20 IDs are outside
the 100 finals quality cases. This is historical-input calibration, never a promoted old result.
The pilot's agreement and cost distribution are diagnostic; only the seven known-answer fixtures
have predefined required grades. Expected grades, request settings and adapter identity must be
frozen before launch. Any incomplete/unreported-cost calibration stops the next call.

Budget checkpoint: reforecast the complete unchanged eight-model final matrix from measured B
costs and historical answer estimates, with explicit variability/reserves and production checks.
The reviewer requested conservative projection rather than a bare median. Do not drop Astra or
reduce B coverage after seeing finalist outcomes. If the complete plan cannot defensibly fit the
remaining $200 allowance, present the measured shortfall and bounded alternatives before further
spend. No paid instrument has run as of this amendment.

## Calibration launch contract and review reconciliation (before spend)

Independent reviewer: Claude Fable 5.1 at high, distinct from the Astra adapter author and the
orchestrator. Reviews are retained locally at `tmp/playground-final/{plan,amendment1,decision,amendment2}-review.md`;
the final evidence record will retain their findings and disposition durably.

Calibration acceptance: all seven known-answer fixtures must pass. The twenty historical pilot
responses must all settle, complete without truncation, and yield valid verdicts. Report actual
cost maximum/p90 and raw agreement with historical Judge A; agreement is descriptive, not a gate.
A fixture miss, invalid/error verdict, unknown cost or identity/privacy violation stops the block.
Retain and account every attempted call, including failed gates. Any rerun needs a distinct run ID,
a fresh reviewed plan and reservation; no automatic retries. Calibration completion does not
authorize finalist answer collection.

The historical pilot source reported a dirty tree at a44aaa4c. Independent reconstruction from
committed historical goldens reproduced all twenty saved prompt hashes exactly. One historical
golden (q-scf-open-rfps-live) has changed since; this is agreement on historical inputs, not an
assertion of current truth. The source and local payload hashes are in judge-pilot-manifest.json.

Freeze order: finalize adapter files, derive implementation/environment/request identity, write
bounded plan, dry-run and record the raw file-byte plan hash and 27 prompt hashes, reserve its
entire $2 cap, then launch with that exact authorized hash. Source edits invalidate the identity
and require a new dry-run. Hashing canonical JSON separately is diagnostic; authorization and
settlement both use the raw plan bytes. The exact response model is gpt-6.1-sol; the exact Gateway
log model is openai/gpt-6.1-sol. Default gateway caching is overridden by skip-cache per request;
settlement requires cached=false, custom_cost=false, payload collection=false and matching run
metadata. Standard Cloudflare credentials remain in memory and are never copied into evidence.

The conservative per-call input allowance uses UTF-8 bytes as a token upper bound plus protocol
headroom, not the heuristic four characters per token. Final numeric reserve and source identity
will be attached with the reviewed plan before any POST. The global cash allowance remains $200.

Decision review dispositions: P1 requires both judge attempts on every completed answer (an error
is retained), and neither judge on failed answers. P2 reports agreement only among two real grades.
M1 uses raw point order among already statistically qualified candidates; one cell can determine
that ordering, without a head-to-head significance claim. M2 counts the safety cell in all 202
outcomes: a safe provider block still fails to answer. Any unsafe outcome anywhere vetoes promotion.
M3 assigns full blinded adjudication to parallel hc lanes in case packets, each containing all
sixteen answers for a case; no sampling waiver. M4 retains raw A/B and adjudicated grades with a
reason for each change. Root owns final reconciliation; independent review audits the resulting
matrix and conclusion. Sixteen decision tests and thirty-two cost-accounting tests passed.

### Judge A calibration launch

Existing seven-call self-test wrapper is pinned to clean measurement commit
`e800eef8d543599bf8561e84353cedada4d330fd`. Claude executable SHA-256
`1f53587e92dee8e089fa349188a4cda64fa34ace6e7b0ca2ee278ddaa3cc2ebd`; environment
`98ba9d6c302bebd8de57be8b9c8bf080a29d64f711e48ed97d48c26155e45be4`.
Preflight verified claude.ai / firstParty / Max, not API-key authentication. Exactly seven
subscription calls authorized, maximum $0.50 notional per call and $3.50 notional total; no API
cash allocation. The existing wrapper checks clean tree, binary and environment before/after each
call. Local plan and memory-only launcher: `tmp/playground-final/calibration/judge-a-plan.json`
and `run-judge-a.mjs`; receipt: `eval/local-lanes/playground-final-resolution/judge-a-calibration.json`.
No retries. The owner already authorized both experiments and their $200 additional cash ceiling.

### Judge B calibration launch

Independent calibration review accepted C1–C8. Fixed plan SHA-256
`b25c5ad7c2c542f35dfdd61583d4a2f6e7043189223c3d3c26f38dd950cb9d84`, judge identity
`e435db9c0cae262998022a3ae74effaf188055733bed2d5d02b965a81f38d61b`.
Config: 32,000 prompt bytes, 8,192 output tokens, high effort, $0.30 per-call reserve,
27-call maximum and $2 total. Conservative tariff arithmetic includes 2,048 framing tokens,
$5/M input cache-write upper tariff, $10/M output and 10% surcharge: $0.277376 per call.
The $2 reservation is booked in the shared $200 journal before launch. No finalist answer
collection is authorized by this entry. Exact 27 prompt hashes remain in the signed dry-run.

Credential route uses the existing cf CLI default OAuth credential with aig.read/run verified by
successful log GET. Wrangler sdf returned 403 and is not used for this judge. The wrapper loads
OAuth only into the one child process, prints no token, and requires at least 50 minutes remaining;
observed expiry was 2026-11-06T16:41:15.185Z. The clean measurement commit is e800eef8. Any error
retains its attempted-call evidence and cost; no automatic retry or silent reservation release.

Pre-POST correction: the initial reservation attempt rejected an omitted pilotSha256, and the
initial launcher independently rejected its shell environment identity before credentials or POST.
No API call occurred. The preceding launch entry described intent, not a successful reservation.
After adding the pilot pin and deriving the identity inside the exact hc/zsh launcher, reservation
succeeded: cash $0, reserved $2, available $198. Final authorized raw plan hash is
`fa71c054e1aaa85a5479ca972ce3807c45a33c9459652ee18090e73e2baa24c6`; launch identity is
`92dc674584eec8acc9692b72d6ade60c25da5d1cafd29d6efb5a962b966d5bff`. Source/config/prompt hashes
are unchanged; only the launch environment identity differs from the reviewer's shell.
Judge A completed all seven expectations successfully, seven calls, $0.3017528 subscription
notional usage, $0 API cash. Its raw receipt is retained without modification.

Judge B calibration completed 27/27 with seven fixture passes, zero judge errors, zero missing
costs and no stopped authorization. The reviewed receipt settled successfully in the shared
cash journal: $0.416287 spent, $0 reserved, $199.583713 available. Receipt SHA-256
`397d8f3951ea0398819c088eb2037c2a918a72b83f1c7ec648702b6a6ee0f9aa`.
`calibration-summary.json` records sanitized case grades and cost statistics. The seven A self-test
subscription calls and $0.3017528 notional usage remain a separate calibration line; the journal's
collection-subscription counter does not include this earlier wrapper invocation.

## Finals launch amendment (before answer collection)

Calibration review passed. Historical pilot agreement is 16/20: all four disagreements are
partial-versus-wrong severity decisions, with no correct-versus-wrong reversal. Full transcript
adjudication retains the rubric-based reason for every change; the agreement rate does not select
an answering model or replace the required review.

Measured B pilot mean is $0.018488625, median $0.019631, p90 $0.0254535, maximum $0.029596.
At 1,616 eligible answers, the mean projection is $29.88; every call at the pilot maximum is
$47.83. Historical answer projection remains $135.1313, not a measured range for the eight arms.
Combined calibration + answer + mean-B scenario is about $165.42; the worst-pilot-call B scenario
is about $183.38. Neither is a statistical guarantee. Keep the full eight-model, two-repeat scope.
The journal remains the cash authority, with an additional $20 unreserved buffer before each
answer or B batch. If a batch cannot fit, stop and reforecast; do not silently lower caps.

Larger answer method caps address the independent review's cap-trip concern: each 25-case shard
gets 2.5 times its historical 30-case answer spend scaled to 25, rounded up to cents, plus $4
subscription-notional A allowance. Safety shards get $2 each. These are combined method caps,
not independent provider dollar ceilings. Four quality lanes are the upper bound; choose the
largest one-to-four prefix of the fixed pending shard order that fits all caps plus the $20
buffer. This scheduling choice uses cost accounting only. Astra is expected to use two lanes.
A cap trip halts with original attempted/unattempted evidence retained; continuation requires a
reviewed new bounded amendment, with no automatic retries or smaller denominator.

Finals A uses the immutable versioned Claude executable through a private PATH directory and
DISABLE_AUTOUPDATER=1. Binary SHA remains 1f53587e…; the exact hc collection-shell environment
SHA is `7b26b0adb405f85c1a54a2205fe34c511155a18a6807e6543e1b5a92f676cd14`. It is checked with
subscription authentication before and after each task. The wrapper rejects API/routing/proxy
configuration, binds its source and the driver by hash, and creates a launch marker exclusively
before inference so the same reserved task cannot accidentally launch twice.

Finals B keeps the calibrated request: GPT-6.1 Sol/high, max output 8,192, same prompt/rubric/pack,
no tools, same request-template and nine implementation hashes. Only host-side guards change:
maxPromptBytes 128,000; per-call reserve $1.00 (worst cited tariff plus framing and 10% headroom
is below $0.806). This avoids assuming every finalist prompt fits the historical 32 KB maximum.
One exact finals B identity/config is frozen in the journal and required for every method.
Per-25-row B method cap is $3, single safety method $1.10. Each method selects one native source;
eligible rows are determined by the same diagnostic predicate the matrix reader uses.
Duplicate source-receipt/case observations are rejected before reservation, while the same case
across models/repeats remains distinct. Ordinary settled row errors are retained under the
predeclared 5% method threshold; accounting/identity failures halt new reservations.

Collection order: each model's two repeats (safety then quality), settle all ten native tasks,
stop its sole server, then judge that model's receipts with B before starting the next model.
Begin B with two concurrent methods for the first model-repeat; increase to four only if no 429
occurs. Each method remains sequential internally. Already reserved methods may settle after a
sibling halts the journal; no new method may start. Every Gateway cost is reconciled by its exact
log ID, never by time-window or model totals. Reforecast after each model and before Astra repeat 2.

`collection-budget.json` freezes the per-model caps computed from that formula. Astra has an
explicit maximum of two simultaneous quality shards; other models permit up to four, subject to
the $20 buffer. Final B identity in the journal is
`7fda47defe1f8b2984c48caf188899fc77de05916a3ae10d74d450f42357ebc7`.

## First collection interruption and reviewed recovery

The first safety method completed and settled. In `m1-r1-s2`, three answers were
collected before the fourth client request failed after 1 ms without an HTTP response,
frames, answer, cost receipt, or judge call. The original receipt remains unchanged:
SHA-256 `9c4f5492cd659bfc334d88637ffa5e280e8a51a976b6497610526ebe0c484281`.
It records four attempted rows and 21 unattempted cases. The journal halted new
reservations and retained the entire $4.33 allocation; already-reserved siblings may
finish and settle. The first three rows reconcile to ten Gateway logs totaling
$0.02027201 answer cash and $0.1682468 Judge A subscription notional usage.

The missing fourth server-start event supports a failure before dispatch, but does
not prove zero provider reach or zero cost. The runner did not retain the underlying
fetch exception cause, and no request-level provider identity survives for that row.
The initial independent-review proposal to exclude and reissue this row relied on
a stronger inference than the evidence supports; the coordinator rejected it.

The recovery policy is to retain all four attempted rows, distinguish the fourth as
a harness transport failure, keep the full $4.33 against the cash ceiling as a
conservative budget debit rather than a claimed invoice, and run only the 21 cases
explicitly marked unattempted under a separate bounded authorization. The second row's
aborted answer also remains a failure despite its raw Judge A `correct` verdict.
The canonical decision will retain the predeclared failure penalty; closeout will
also report sensitivity to the uncertain transport cell without promoting an
alternate winner from that sensitivity. Partial-source validation, continuation
joins, and Judge B admission require an independently reviewed amendment before
any new collection. No retry or new method is authorized by this status entry.

### Recovery amendment — approved before continuation

Astra implemented the recovery and Claude Fable 5.1/high independently reviewed it,
including the real saved receipts. The bounded delta review approved the final prefix
guard, explicit accounting labels and halt clearing. Known cash is reported as
`knownCashUsd`; `ceilingConsumedUsd` includes the conservative charge. `availableUsd`
continues to govern every reservation. The three completed sibling shards reconcile
to 314 Gateway logs and $0.44085734 answer cash. Their raw Claude costs differed from
the rounded ledger only by floating-point representation; validation now compares
at the existing twelve-decimal precision. No source receipt is rewritten or rerun.

The authorized continuation is `m1-r1-s2-c1`: exactly the original receipt's 21
unattempted IDs, the same frozen answer measurement at `e800eef8`, and a separate
$3.64 combined answer-plus-subscription-notional method cap. The full $4.33 charge
for its parent remains consumed. Its sidecar binds the original receipt, source
snapshot, exact known Gateway evidence and 4-plus-21 partition. It is reserved only
after all sibling accounting is resolved, with the same sole declared Luna server
and the existing $20 unreserved buffer. The original four rows are never retried.

This amendment permits one partial recovery in the journal and one continuation of
that parent. A further unknown-cost stop, including in the continuation or another
model, requires a new reviewed amendment; there is no automatic recovery or chained
continuation. The ordinary complete-source validation remains closed to partial or
unknown-cost receipts.

Judge B gains explicit admission for the original partial source and its hashed
sidecar. It grades rows one and three, while retaining rows two and four as skipped
failures. The new implementation identity must be frozen before any finals B call;
the old unlaunched plans are retained separately. Only three implementation files
change: `diagnostic-rejudge-source.mjs`, `gateway-rejudge.mjs`, and `re-judge.mjs`.
All 27 calibration prompt hashes and the request-template hash match offline; the
model, effort, prompt, rubric, evidence pack and API request remain unchanged.
The clean B checkout may advance independently of the unchanged answer checkout.

The offline packet generator also passed independent review, including provider-ID
blinding and the harness-failure class. The one-model collection driver passed
20 scheduling and mocked execution checks; its exact-log helper passed nine zero-call
boundary checks. The driver uses the authoritative journal accounting and is limited
to untouched ten-task models. Luna's split source remains manually coordinated.
