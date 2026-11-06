# Playground sweep reconciliation review — 2026-11-06

## Verdict

Integrate the completed runtime transport repairs and SDK update after the integration gates. Preserve the unfinished sweep as dated, non-promotional evidence and an actionable TODO; keep `openai/gpt-5.6-terra` primary and `openai/gpt-5.6-luna` fallback. Do not resume paid work. Do not ship the Codex judge adapter unchanged. The original gauntlet accounting defect has a bounded repair under review below.

This is an independent, read-only review of `eval/playground-model-sweep-1103` at `0d90bbb7` against the requested main `e62c2b97`. Complete implementation, package-lock, test, README, ledger, audit, and all 12 gauntlet-summary diffs were read. No implementation edits, paid/model calls, repository commits, GitHub writes, deployments, branch/worktree/stash deletions, or nested agents were performed by this reviewer. Test fixtures use temporary directories. Only this report and disposable validation artifacts were written. Parent/coordinator changes to the shared checkout are distinguished below.

## History and already-landed work

- Merge base: `fec1c79f3ae4e4210e7d988c3aff40cda9928482`; branch tip `0d90bbb7`.
- PR [#359](https://github.com/stellar-experimental/stellar-raven/pull/359), merge `fbd822b4`, is an ancestor of both refs. GitHub read-only metadata confirms merged on 2026-11-03. Its gateway-observed model IDs, semantic-result v3 contract, mismatch refusal before judging, and retained Terra/Luna decision already landed. Do not count those as new sweep work.
- Main has three subsequent commits absent from the old branch: #380, #382, and #383. Never restore the branch tree wholesale over main: it would regress updated corpus, skill/catalog, and connection work.
- Unique commits: `59a8a26d` (all implementation, tests, initial evidence), `6b451221` (pre-stage-2/generation ledger), `a8c0b86b` (stage-2 evidence/review/finalists), `cb4f1ca4` (eight-finalist amendment), `0d90bbb7` (stage-3 gateway switch amendment). There are 27 changed files, 1,730 insertions and 150 deletions versus the merge base.
- Initial stash list was empty. The `/private/tmp/rv-models` worktree registration was prunable and its directory absent. This does not establish that ignored raw sweep files were preserved elsewhere.
- During this review the coordinator imported these commits into `maintenance/main-only-cleanup-2026-11-06`. At integrated HEAD `b2a07a3`, the implementation matched the reviewed branch except two newer main prompt-hash fixtures in `eval/qa/judge.mjs`, correctly retained. The coordinator subsequently edited gauntlet accounting/tests; see below. Other imported OpenAI-plugin work is outside this original sweep review.

## Integration disposition

| Change | Disposition and evidence |
| --- | --- |
| OpenAI `store: false` in `demoOpenAiProviderOptions` | Integrate. Addresses the recorded ZDR reasoning-item replay 404. Preserves model defaults. Existing smoke assertions verify requested encrypted reasoning content; they do not themselves exercise a returned encrypted reasoning item across steps. A focused replay fixture would strengthen coverage. |
| Anthropic 5.x dotted/dashed matching, including Haiku | Integrate. Unit coverage exercises supported spellings, older-family exclusion, and major-version boundaries. No promotion or judge-default change follows from supporting these overrides. |
| Google passthrough instead of run transport | Integrate with recorded transport limitation. Dated probe completes the tool loop; earlier run-path replay failed with 7003. The default shipped tuple is OpenAI. Current all-Google routing is broader than the one explicitly probed model, so do not claim every Gemini model was verified. |
| Meta/Particle unified-run prefixes, `openaiEndpoint`, Moonshot-only temperature quirk, Muse JSON-reply wrapper | Integrate as completed transport support, not candidate endorsement. Fake-binding coverage verifies forwarding and targeted `stream: false`; dated gauntlets separate restored transport from poor model/tool reliability. Muse first-token latency is not comparable to streaming models. No executor/network policy changes. |
| `ai` 7.0.162, OpenAI 4.0.108, Anthropic 4.0.96, Google 4.0.111 and matching lock changes | Integrate as one dependency unit with runtime changes, subject to fresh baseline and smoke checks. Shared provider/provider-utils/gateway also change. This affects all Playground turns even though defaults remain unchanged. |
| Gauntlet cost/model recording | Useful reusable work, but original version blocked by B1. Coordinator repair addresses stopping and completion; validate its final revision. |
| Codex judge adapter and re-judge CLI changes | Preserve exact patch/evidence but exclude from shipped code unless B2–B4 are repaired and independently tested. Keep the existing Claude contract and its flag/docs/tests together if deferring. No compatibility shim is required. |
| Ledger, audit, 12 gauntlet summaries | Preserve dated evidence with explicit current disposition and corrections described below. Raw historical measurements must not be rewritten into current scores. |

## Concrete blockers

### B1 — High: gauntlet continues authorizing spend after missing accounting (original branch)

`scripts/run-demo-model-gauntlet.mjs:173–207,299–315`: `record()` increments `unknownCostTurns` but leaves `remainingUsd()` spendable; the outer loop only checks remaining dollars. A lost eval-cost frame or unsettled turn permits subsequent calls with an unchanged allowance. Offline reproduction: on a $1 budget, `{costUsd:null, reportedCostUsd:0.8, error:"missing-answer-cost"}` produces reported $0 and remaining $1. The new original unit test explicitly expected this behavior.

Finite `costUsd` with an accounting `error` is also ignored. Final-turn overspend returns success because no following iteration tests the balance. Historical corroboration: stage-1 report records 10 unknown-cost turns and $15.3264 against $15.31 authorization; stage1b-astra2 records $1.8710 against $1.60 with all three turns passed and no failures. These are post-call accounting stops, not a guarantee that an in-flight call cannot exceed a dollar cap.

**Repair reviewed:** coordinator's current diff closes remaining authorization on unknown cost, checkpoints then stops, rejects finite-cost accounting errors/call-count mismatch, records planned/completed/incomplete status, and exits nonzero for unknown accounting, last-turn overspend, or a shortened matrix. Five real-CLI/local-fixture regressions assert one POST, nonzero exit, and retained incomplete artifact for missing frame, finite-cost error, mismatched counts, final-turn overspend, and budget exhaustion. This is a sound bounded repair for the identified continuation/completion bugs, pending passing tests on the final diff. No actual Wrangler/provider runs are needed. An unknown turn's `reportedCostUsd` remains available in the row but is not included in aggregate `reportedUsd`; improve that presentation or label it explicitly as fully settled-turn spend. Do not describe the cap as an absolute pre-call dollar guarantee.

### B2 — High: Codex zero-cost subscription assumption is not enforced

`eval/qa/judge.mjs:640–660,693–697,780–805`: every Codex call and failure is labeled `subscription-no-usd-figure` with `costUsd: 0`; `maxBudgetUsd` is never passed/enforced on the Codex branch. The full inherited environment is forwarded. There is no forced or verified subscription-auth mode. Therefore the dollar ledger is not an enforceable spend contract for arbitrary executable/auth/provider configurations. The dated coordinator decision can authorize those specific historic subscription runs; it does not make every future invocation free.

Smallest safe disposition now: archive the adapter patch and leave Claude-only re-judge operational. To ship later, require and attest the intended authentication/billing mode, represent unavailable dollar costs honestly, and use explicit bounded-call authorization where costs are subscription-only. Test failure paths as well as success.

### B3 — Medium: new judge identity/comparability metadata omits Codex controls

`eval/lib/executable-identity.mjs:7–8,109–122` remains Claude-specific while the new adapter uses it. Offline reproduction proves changing synthetic `OPENAI_BASE_URL` and `CODEX_HOME` does not change its fingerprint. `re-judge.mjs:562–587,945` compares only model/rubric/pack; CLI and effort are recorded in metadata but omitted from `tupleGuard` and `nonIdentical`. Reusing an identical model tuple with another CLI/effort can still be labeled identical despite requiring `--allow-non-identical` at parsing time. `--judge-cli codex` also silently defaults to the Claude model ID if `--judge-model` is omitted.

Repair before enabling: CLI-aware relevant environment identity, CLI/effort in comparison identity, explicit non-identical labeling for any override, and require a Codex model. Add offline checks for each. The normal sweep invocation used a different model, so these findings do not by themselves prove its saved rows were mislabeled.

### B4 — Medium: adapter's blind/stdin-only and event-completion promises exceed checks

`judge.mjs:638–646,780–805`: an empty working directory plus read-only sandbox and ignored user config does not disable shell/file tools or prevent reading absolute filesystem paths. The adapter claims the judge reads only stdin, but no tool-denial mechanism is configured or asserted. This is an isolation gap, not evidence that any historic judge actually accessed unrelated files.

`judge.mjs:693–697,813–841`: parser returns an `error`, but `judgeCase` ignores it; it does not require a completed turn. A zero-exit stream with a valid earlier agent message and a later error/missing completion can be accepted. Existing stub tests check argument presence and a clean final message, not these boundaries. If shipping, enforce the actual blind tool surface and reject unsuccessful/incomplete event streams with adversarial offline fixtures. Otherwise archive with B2/B3.

## What the experiment establishes and what remains incomplete

Stage 1 reached an eleven-model advancing set after documented transport reruns and cap amendments. Stage 2 collected 11 × 30 rows on generation `6b451221`, with three concurrent 10-case shards per model. Recorded answer spend: stage 1 $29.10, stage 2 $32.42. Scores, hand corrections, and Judge A/B disagreement are historical diagnostic evidence, not independently recalculated by this review.

Stage 3 is unfinished. Latest ledger says eight finalists (Sonnet 5.5 added because the cutoff was judge-sensitive), 100 disjoint cases plus an explicit exfiltration case, two repeats, and Judge B across all finalist rows. Before a gateway switch, Luna, Haiku, and 6.1-Terra completed two repeats each on the demo gateway for recorded $10.9974. The latest commit authorizes a switch to `default` and plans reruns plus a paired gateway comparison; it contains no completed default-gateway finals, noise-band result, all-finalist Judge B review, production-transport confirmation of winners, final model decision, or closed Outcome. One Luna row ended `length` and remains incomplete despite a correct Judge A grade. No promotion is justified.

The historic Stage-2 baseline shard was copied and had `budget.status`, `incompleteCaseIds`, and `nonPromotable` patched to permit Judge B diagnostics. Preserve this caveat; do not treat that derivative as the untouched promotable original.

## Evidence retention and documentation repairs

Retain the ledger and audit with a current, dated closeout/status note: “sweep suspended/incomplete; no promotion; no further paid runs authorized by cleanup.” Link that record from the current TODO so it has a current consumer under `.agents/README.md` retention rules. Preserve the five commits' exact content in an archive/patch if squash-only linear history prevents keeping original ancestry; a list of SHAs alone does not protect otherwise unreachable objects. The coordinator owns archival/deletion decisions.

Correct or explicitly qualify these audit inconsistencies before treating the audit as the retained summary:

- Candidate table says OpenAI “passthrough, chat” although default mode is Responses and the implementation/evidence includes Responses reasoning replay. Record effective per-run mode rather than guess.
- Haiku row says “thinking off”; implemented provider option is adaptive thinking at low effort.
- Muse initial “not reachable” conclusion is superseded by the JSON-reply transport repair; final exclusion is reliability/execute allowance, not unreachable transport.
- Audit lists seven finalists and says Sonnet 5.5 missed the cut; latest ledger deliberately expands to eight.
- Ledger says the 100 stage-3 IDs are in the audit, but the audit contains no list. The actual selection, raw JSONs, hand-review notes, and gateway-switch scripts were under ignored paths in the now-missing worktree. Mark their availability unverified; do not claim reconstruction or completed-row validation.
- Audit heading “Code changes made before any paid run” includes fixes discovered during paid probes. Preserve timestamps accurately.
- Old gauntlet script commentary says Google passthrough is unusable, contradicting this new implementation/probe. Replace that current-source claim; keep historical observations in dated evidence.

Actionable TODOs: evidence-pack truncation of the 85-row tag result to 82 rows (possible false wrong grades); Cloudflare Responses-stream conversion defect (with recorded repro/log IDs); disposition or recovery of ignored sweep evidence; Codex adapter isolation/identity/billing hardening if retained for future work. No new upstream filing or live repro was performed here. Keep historical stage costs separate from production usage data.

## Validation performed and remaining gates

- `git diff --check fec1c79f..0d90bbb7`: passed.
- Archived `0d90bbb7` into `/private/tmp/playground-review.DL11m2` without creating a worktree or changing refs. Used the existing dependency directory; this narrow run is not a frozen clean-install SDK validation.
- Via owned hc terminal `t2vm`: `vitest run test/demo-model-config.test.ts test/demo-gauntlet-cli.test.ts test/judge-cli-adapters.test.mjs test/re-judge.test.ts`: 73 passed; one archive-environment failure because a test reads historical commit `70726884` and the archive has no Git database.
- Via owned hc terminal `t2vq`: reran only that history-reading test with `GIT_DIR` pointing at the repository, without modifying history: passed, 40 skipped. Thus all 74 selected tests passed across the two invocations; the original 1-failure run is not hidden.
- Offline pure-function probes reproduced B1 and B3. No judge process/model was called by those probes.
- Both owned hc children exited and were removed. No other terminal was controlled. Snapshot retained for reproducibility; no requested repository cleanup was performed by reviewer.
- Coordinator reports integrated typecheck, 3,143 unit tests, smoke, build, and eval:selftest passed before its final budget hardening. That is coordinator evidence, not a fresh result from this reviewer, and does not validate later edits.
- Final integration needs its current narrow budget/CLI tests, typecheck/unit/build, assembled-worker smoke (demo changes), eval:selftest and applicable QA lint/register gates, and secrets scan. No paid gauntlet or semantic/model rerun is necessary for this cleanup disposition. Independent final review must reconcile the Codex adapter and evidence-status blockers; do not equate old sweep gate claims with current integration checks.

## Final bounded integration cross-review

The coordinator accepted B2–B4 and removed the Codex adapter from operational code. Confirmed `eval/qa/judge.mjs`, `eval/qa/re-judge.mjs`, `eval/qa/README.md`, and `test/re-judge.test.ts` are byte-identical to requested main `e62c2b97`, and `test/judge-cli-adapters.test.mjs` is absent. Thus the new billing/isolation/comparability defects do not ship.

Independently verified `research/audits/2026-11-06-main-only-cleanup/playground-sweep.patch` is byte-for-byte identical to `git format-patch --stdout fec1c79f..0d90bbb7`: all five original commits, 174,719 bytes, SHA-256 `2a125ae7502dcc122e11f9ee93f04b1295d3e58ba278d8ea0aa6bf4ed47b322e`. This preserves exact experimental content without enabling it and does not depend on dangling original refs. Keep its base and unapplied status in the archive's current guide/TODO.

Read the final gauntlet implementation/test diff and the actual `tmp/main-only-cleanup/budget-final.log`: **15 tests passed**, including all five one-POST/incomplete/nonzero-exit fixtures. B1 is reconciled. Tests cover behavior across the executable boundary, not just a helper mirror. The current status/retention edits correctly say stage 3 was interrupted and no paid run or model promotion happened. The historical wording corrections listed above remain documentation reconciliation work for the coordinator; they do not require new paid evidence.

At the coordinator's request, independently cross-reviewed the OpenAI author's stable sanitization/toolchain changes, three affected TODOs, and `tmp/main-only-cleanup/openai-review.md`. Read the full changed prose and nested package/config/handler; compared lockfile package changes and source/dependency scope. **No additional blocking finding.** Sanitization removes private account and portal-version context without removing the public challenge or durable reviewer procedure. Historical status is qualified, the stale legal-declarations claim is corrected, and the real privacy discrepancy remains tracked. The fixed-response Worker still has only host/path/method gates and a public response, no credentials/network/storage bindings. SDK/toolchain changes are confined to that separately built package; Node `^24.22.0` matches its documented Node 24 constraint. The author reports reproducible supported-Node install/typecheck/build and audit zero; this reviewer did not repeat those builds or claim a fresh portal/deployment check. Plugin JSON, icon, and rehearsal evidence remain unchanged by the sanitization repair. The review does not authorize publication, correspondence, challenge-Worker deployment/removal, or runtime policy changes.

`git diff --check` on the working integration passed. Final source/evidence disposition is acceptable once the coordinator records the adapter exclusion/TODO and historical table qualifications and runs its exact-final-tree gates. No further paid run, source investigation, or nested review agent is needed for this review scope.

### Final acceptance

Re-read the finished archive README, adapter-hardening TODO, cleanup ledger, corrected sweep table/selection note, and current Google routing comment. The planned documentation reconciliations are now present. **Accept this bounded integration disposition and the OpenAI cross-review: no unresolved blocking findings in the reviewed scope.** B1 is repaired and covered by the passing executable regressions; B2–B4 remain preserved and explicitly deferred outside operational code. Exact-final-tree verification, publication/deployment, and destructive Git cleanup remain the coordinator's responsibility. This acceptance does not claim stage-3 completion, endorse a model change, or approve the archived adapter.

### Cleanup confirmation

At the coordinator’s explicit request, removed the owned `/private/tmp/playground-review.DL11m2` validation snapshot and verified it is absent. Both owned hc test terminals (`t2vm`, `t2vq`) were already removed; fresh `hc get` checks returned `not_found` for each. No owned children remain. This cleanup changed only the temporary snapshot and this temporary report; no other source or durable report was edited.
