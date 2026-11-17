# Item 6.1 Codex review

Reviewed `origin/main..825244fe10e68d641efe4985d6498b5d86b15cc2` on
`np/6.1-codemode-0.5.6`, including PLAN.md's binding reconciliation and EXEC.md.
No tracked files changed. No amendment execution, forbidden-file read, model eval,
Wrangler invocation, or network request was made.

1. **should-fix — One failure path violates the explicit no-path-output requirement.**
   Evidence: `items/6.1/amend-split-v10.mjs:125-126` under the round directory forwards
   every `AmendError.message`. The imported `eval/qa/split-amend.mjs:34` defines
   `notACase` as `check failed: the moved id is not a case in eval/qa/cases.json`.
   If the exposed split member is absent from the supplied corpus, this prints a path.
   Instantiating `new AmendError("notACase")` independently confirmed the message;
   the amendment script itself was not run. This is a fixed public repository path,
   **not** a case-id, private-path, or note disclosure, but the brief explicitly
   requires no path output. Fix: map this error to a path-free fixed message inside
   the new runner, or map all imported amendment errors to locally approved messages.

2. **low — The gate smoke case is a compatibility check, not a deterministic pending-call regression test.**
   Evidence: `test/smoke/executor.test.ts:1481-1485` calls `codemode.search("x")`, whose
   implementation (`src/executor/providers.ts:1012-1125`) performs local catalog work
   without awaiting I/O. It neither holds a host call pending nor checks concurrency
   capacity, ledger completion, or artifact behavior; `startsWith("1")` also permits
   unexpected suffixes. It satisfies the literal planned example, so this is not an
   implementation-plan failure. Fix: retain it as a compatibility smoke, and use a
   controlled deferred host provider for any claim that the gate's release behavior
   has been regression-tested. Assert the returned value exactly where no footer is
   expected, and release the deferred work in cleanup.

3. **low — Correct the search-region line ranges in the execution evidence.**
   Evidence: `items/6.1/EXEC.md:116` says lines 1291–1403 of both package versions
   have the recorded hash. In 0.5.1 the region is **1282–1394**; in 0.5.6 it is
   **1291–1403**. Comparing the same numeric range gives different bytes. Extracting
   by `//#region src/connectors/search.ts` through its end marker confirms the actual
   regions are identical, SHA-256
   `a7daa25f312b2e6be4179c508b47fef7e1dc1c4915e97752304632933d410255`.
   Fix: correct the ranges at EXEC.md:116 and clarify :167. The committed cs-001
   evidence and its unchanged-rule conclusion are accurate.

4. **info — Security boundary remains intact; the gate does not cancel host work.**
   Evidence: `src/executor/run.ts:425-430,450-484,529-560` retains explicit
   `globalOutbound: null`, host-side secret collection, per-run providers, result
   redaction, and redaction before artifact storage. The production runner body is
   unchanged in the diff. Upstream 0.5.6 `dist/index.js:161-198,383-387,423` schedules
   the real host function even when the gate is closed, races its settlement against
   closure, and closes only after evaluation settles. Awaited calls still finish
   before the script returns. Pending calls get the late error in their sandbox
   continuations; they do not rewrite the already-returned execution result.
   Raven's providers still record completed calls (`providers.ts:640-680`), while
   summaries are snapshots after execution (`run.ts:500-528`) and artifact metadata
   is assembled later (`run.ts:551-632`). Unawaited work therefore remains a timing
   race, not a complete or atomic ledger guarantee. Exact race timing should not be
   claimed identical across versions. No new cancellation, draining, secret exposure,
   or outbound-network authority was found. Fix: none required for this upgrade;
   preserve this qualification in the report.

5. **info — Host shaping and generated wrapper match upstream.**
   Evidence: `src/executor/run.ts:663-715` implements 0.5.6 `dist/mcp.js:10-25`
   response shaping with the same 24,000-character budget, `truncateResult`, string
   pass-through, pretty/compact JSON selection, and undefined fallback. The catch
   encloses execution and serialization and uses upstream's `formatError` expression.
   Raven preserves its existing `{ok,...}` envelope and defined-error check rather
   than upstream's MCP envelope and truthiness check. These are existing interface
   adaptations, not new production behavior. Direct generation comparisons for raw
   object and fenced-code examples, including a spec containing `</script>`, produced
   byte-identical wrappers to upstream `createOpenApiSandboxCode(..., false)`.
   Fix: none.

6. **info — No production model-facing contract change found.**
   Evidence: `src/mcp/tools.ts:266-370` registers host-ranked search and retains its
   structured/text responses and error flags; :373 onward registers execute and
   retains result, console, recovery, and error text shaping. `src/server.ts:70-71`
   wires `createExecuteRunner`, not `createSpecSearchRunner`. Searches excluding both
   prohibited corpus trees found no production spec-runner caller. The diff leaves
   `src/mcp`, catalog/scoring, providers, policies, specs, and artifact code unchanged.
   Independently ran `npm run -s mcp:surface -- --json`: two tools, surface hash
   `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`, instructions hash
   `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`, matching both
   recorded baseline hashes. The gate is a lifecycle change with the race caveat in
   finding 4; these hashes alone do not prove runtime equivalence. Fix: none.

7. **info — Remaining split safeguards and dependency scope check out.**
   Evidence: the new amendment runner :83-101 verifies the pinned v9 SHA-256,
   requires exactly one outside-tuning member, and delegates count/partition checks
   to `moveToTuning`; :111-112 uses exclusive creation (`wx`) and mode 0600.
   Success output contains aggregates, an earliest date, and a hash, not ids or notes.
   TODO and dated brief edits consistently name v10 and 92/110/45. No private split
   was inspected, so its actual bytes and Mac copy are outside this review.
   A parsed lockfile comparison found only the root dependency record and
   `node_modules/@cloudflare/codemode` changed. `npm ls @cloudflare/codemode` reports
   one deduplicated 0.5.6. Fix: finding 1 only; retain the recorded merge-window and
   Mac-copy requirements.

8. **info — Tests and remaining records are consistent, within the stated verification limits.**
   Independently ran `npm test -- test/spec-sandbox.test.ts test/script-hints.test.ts`:
   **14 tests passed**. Raw-value, fence, ref resolution, circular marker, cache,
   escaping, and real-spec checks remain appropriate. The smoke additions correctly
   cover pretty JSON, structurally truncated JSON, string-footer behavior without an
   invalid total-length ceiling, and serialization failure. Smoke/build/full-suite
   results are executor-reported, not rerun here under the no-Wrangler restriction.
   `git diff --check origin/main..HEAD` passed. Upstream's generated `err.message`
   catch remains unchanged (`0.5.6 dist/index.js:365`), supporting the cs-012 recurrence
   and retained open status. The DECISIONS mapping and TODO changes follow the binding
   reconciliation. Live GitHub issue/PR activity was not independently rechecked.
   Fix: no additional source change identified beyond finding 1; reconcile the two
   low findings in the test/evidence descriptions.

FAIL
