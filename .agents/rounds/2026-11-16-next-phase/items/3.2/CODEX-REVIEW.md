# Item 3.2 independent executor and adapter review

Reviewed commit `8f6236dbd2738a86c523f4488d738480aa4fa492` against its parent
`4319c6ac` on `np/3.2-per-source-status`, following `briefs/CODEX-BRIEF.md`.
Reviewer: Codex, terminal `t1sd`. Read the item plan, plan review, execution record,
and installed `@cloudflare/codemode` 0.5.1 wrapper. Step E is excluded.
At the final scope check HEAD was still `8f6236db`; no later documentation commit
existed. The separate uncommitted documentation and coordination edits are outside
this verdict. No tracked file was changed by this review.

## Findings

1. **Low — the new tests leave several integration invariants unpinned.**
   Evidence: `test/per-source-status.test.ts:145` calls its case “passes the request
   through to fetch untouched”, but asserts only a URL substring, GET method, and
   signal type. It would pass if the wrapper dropped authorization headers or
   `redirect: "manual"`. The cases beginning at `test/per-source-status.test.ts:55`
   invoke operations sequentially, and the summary test at `:174` supplies a
   hand-built ledger. The existing skill-run smoke at
   `test/smoke/executor.test.ts:1352` checks the skill's returned call ledger but
   does not assert `outcome.sourceSummary`.

   The implementation is correct by inspection: `src/executor/providers.ts:634`
   allocates trace state inside each invocation, `:543` forwards the original
   input and init, and `:1401` shares the instrumented closures with the skill
   runner. This is a regression-coverage gap, not an observed runtime defect.

   Suggested fix: add one controlled, interleaved pair of calls with different
   statuses/retry counts and assert each ledger row; assert the skill-run source
   summary in the existing smoke; extend request assertions to cover the host
   authorization header, POST body, and manual redirect mode. A stalled-body
   case through `buildSandbox` would also pin `finalStatus: "timeout"` rather
   than just the adapter envelope. Use deferred promises and the existing
   shortened abort signals, with no long waits. This improvement is nonblocking.

## Checked with no finding

- **Security and host boundary.** `tracedFetch` retains only counts, numeric
  response status, a boolean, and the host-created signal
  (`src/executor/providers.ts:531`). Neither URL, arguments, headers nor body
  text is copied into the new telemetry. `finalStatusOf` uses adapter HTTP status
  or fixed labels (`:554`); current adapters source those statuses from the
  response or host literals. Source summaries admit only four service names and
  eight bucket names (`src/executor/run.ts:79`, `:214`, `:226`). Error classes are
  fixed literals. The closures and their trace are host-side, reachable from the
  sandbox only through dispatched operation calls; sandbox replacement of a
  global cannot replace them. `globalOutbound` remains explicitly null
  (`src/executor/run.ts:431` and the installed codemode loader).
- **Timeouts.** Lumenloop uses one 24,000 ms signal for fetch and JSON body read,
  and checks `signal.aborted` in both catches
  (`src/adapters/lumenloop.ts:81`, `:98`, `:143`). Scout uses the same single
  signal for both text and JSON branches and checks it in the outer catch
  (`src/adapters/scout.ts:132`, `:141`, `:157`, `:247`). Neither retries or resets
  the budget. Timeout envelopes have fixed text and no status. Docs and
  stellar.org retain their prior deadline/attempt behavior; the shared constant
  has the same value. This bounds upstream I/O, not synchronous CPU work or an
  injected fetch implementation that ignores its signal.
- **Mintlify status.** Retryable 5xx records its status after the body read
  (`src/adapters/stellar-docs.ts:119`); every subsequent retryable outcome replaces
  it, including clearing it on no-response failure (`:170`). Exhaustion retains
  the last attempt's status. Terminal, absent and success handling is unchanged.
- **Attempts and final status.** Counting occurs once per host fetch invocation,
  including retries, `/index`, the site probe and manual redirect hops. Adapter
  error status takes precedence, preserving an absent Docs page as 404 even when
  the probe fails or times out. Failed body reads with an aborted signal become
  `timeout`; fetch rejection without abort becomes `network`; guard refusal and
  missing keys make zero attempts and yield `none`. Independent invocation state
  and shared skill dispatch are correct by inspection. Both successful and failed
  execute outcomes summarize completed ledger rows (`src/executor/run.ts:513`).
- **Error classification.** The exact timeout message wins, then syntax forms,
  then the non-syntax load-rejection fallback, then reference and type forms
  (`src/executor/script-hints.ts:56`). The installed wrapper drops `err.name`,
  returns `err.message`, and rejects loader/RPC faults, matching the implementation's
  assumptions and documented heuristic limitation. Classification happens before
  hinting and secret redaction (`src/executor/run.ts:496`, `:537`). The span and
  both events receive only the class; runner-threw catches use `other`
  (`src/mcp/tools.ts:414`, `src/demo/tools.ts:485`). Successful events use null.
- **Model-facing text.** The intended changes are the preserved Docs error status
  and resulting specific `http-503`/other 5xx reason, plus fixed timeout envelopes
  and `[timeout]`. The source-basis renderer still reads explicit fields
  (`src/policy/source-basis.ts:335`), and the artifact projection remains
  `op`/`status`/`ms` (`src/executor/run.ts:571`). New counts, statuses and classes
  are not added to those model-facing projections. `sourceBasis.calls.first`
  retains the new bounded fields in telemetry as planned.
- **Tests and timing.** The adapter tests cover never-answering requests and
  stalled bodies with real abort signals shortened to 5 ms, including Lumenloop's
  inner JSON catch. Mintlify tests cover retained 5xx and subsequent timeout
  clearing. Real Worker smoke exercises ReferenceError, TypeError, a plain
  model-thrown Error, and syntax/load rejection. No new test waits 24 or 60 seconds;
  timeout spies are restored in `finally`. No flakiness was observed in this run.

## Verification

Ran the allowed commands bare in owned `hc` child terminals and collected their
exit status:

- `npm run typecheck`: exit 0 (`t1sf`).
- `npm test`: exit 0; 167 files passed, 5 skipped; 3,716 tests passed,
  3 expected failures and 5 skipped (`t1sg`).
- `npm run test:smoke`: exit 0; 9 files, 145 tests passed (`t1sh`).

No server, live upstream probe, model-calling eval, or paid call was started.
The smoke suite used its offline Worker boundary. No build, generated-file
rewrite, or commit was performed. No blocking or should-fix finding remains
in the reviewed runtime commit.

Verdict: PASS.
