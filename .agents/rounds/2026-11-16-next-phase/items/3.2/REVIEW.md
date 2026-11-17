# Item 3.2 plan review

Reviewer: Claude Fable (`claude-fable-5-2`), plan review of [PLAN.md](PLAN.md) on
`np/3.2-per-source-status` at `4319c6ac`. Read-only: this file is the only change.

The plan is sound in shape. Two findings must be fixed before execution starts; both are in
step E6. The rest tighten steps the executor would otherwise have to improvise.

Not verified: the live 503 from `POST /api/partners/match` (not re-probed), and what workerd's
`fetch` rejects with on an aborted signal (no local server was allowed). No gate was run.

## Findings

### Blocking

1. **E6 and Gates: the edited QA case is stamped in the consistency register, so the plan's own
   gate fails.**
   - Evidence: `eval/qa/register-helper.mjs:30-39` hashes each case file's bytes;
     `:98-104` reopens a register entry when a recorded member hash changes; `:216-219` makes
     `--check` exit 1. The affected case id appears in `eval/qa/consistency-register.json` as a
     cluster member with a `memberContentSha256` entry (checked by a script that printed only a
     count; the case file was not opened).
   - The plan states only that `caseInputSha256` is unchanged. That is true
     (`eval/qa/paired-verdict.mjs:112-121`) and is a different hash.
   - Fix: add to E6, after the blind edit and `compile-qa`:
     1. `npm run eval:qa:register` (stamps the new hash and marks the one cluster `reopen`).
     2. A script proves the edit is surface-only: parse the case at `HEAD` and in the worktree,
        delete `surface` from both, assert deep equality, and assert the new `surface` is the old
        one minus exactly `scout.matchPartners`. It prints `ok` or fails.
     3. `npm run eval:qa:register -- --review <file>` with the cluster's previous `verdict`,
        `clearReopened: true`, and a `reSwept.reason` that says the change is a hidden
        `surface` id only and no judge-facing field moved (`:114-146` lists the required fields).
     4. `npm run eval:qa:register -- --check`.
   - The lead should confirm that closing the reopened cluster on that mechanical proof, without
     re-reading its members, is acceptable. I recommend it: the cluster guards judge-facing
     content, and step 2 proves none changed.

2. **Facts, line 38: the plan names the set of an identifiable QA case.**
   - "The QA case is outside tuning" sits in a tracked file (earlier item directories are
     committed), and the pull request will show which single corpus file changed. Together they
     state that a named case is not in tuning. The brief's rule is never to name which set a case
     is in.
   - Fix: delete that sentence before the first commit. Replace it with "the edit is blind for
     every case, whatever its set". Keep the same silence in EXEC.md, REPORT.md, commit messages
     and the pull request body.

### Should-fix

3. **B3: a stalled Lumenloop body is caught by the inner JSON catch and reported as HTTP 200.**
   - Evidence: `src/adapters/lumenloop.ts:74-84`. A body read aborted by the new signal rejects
     inside that `try`, so the adapter returns "lumenloop returned non-JSON (HTTP 200)" with
     `status: 200`. The ledger `reason` becomes `upstream-error` while step C1 labels the same
     call `timeout`.
   - Fix: check for the timeout in that inner catch before returning the non-JSON error. Scout
     has no inner catch (`src/adapters/scout.ts:124-147,236-238`), so its outer catch is enough.

4. **B3 and C1: detect a timeout from the signal, not from the thrown error's name.**
   - The Risks section assumes workerd's `fetch` and body read both reject with a `TimeoutError`.
     Nothing tests that: the smoke lane blocks outbound requests (`test/README.md:16`).
   - Fix: hold the signal in a local (`const signal = AbortSignal.timeout(...)`) and test
     `signal.aborted` in the catch. The signal has one abort source, so `aborted` means timed
     out, in either runtime and for headers or body. C1 already reads the signal; make B3 match.

5. **B4: fake timers cannot drive `AbortSignal.timeout`.**
   - Evidence: with the global `setTimeout` replaced by a function that never fires,
     `AbortSignal.timeout(50)` still aborted after 50 ms in Node 26 (checked). Vitest's fake
     timers replace the globals, so they do not advance it; the test would wait 24 s.
   - Fix: drop the "fake timers" option. Use
     `vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(5))`. It needs no
     production seam, and the test can also assert the adapter asked for `OPERATION_BUDGET_MS`.

6. **B3: the timeout hint invites a retry that can cost the whole script.**
   - "Retry once" inside the same script spends 48 s of the 60 s `EXECUTE_TIMEOUT_MS`
     (`src/executor/run.ts:301`). One more slow call turns a clean per-source envelope into
     `Execution timed out`, which returns no partial result.
   - Fix: "The call timed out. Do not retry it in this script. Report this source as
     unavailable, not as missing data." Scout's 503 hint already says "do not retry"
     (`src/adapters/scout.ts:175`).

7. **C1: "last response status" is the wrong final status for the multi-request Docs paths.**
   - Evidence: `src/adapters/stellar-docs.ts:451-463`. An absent page makes three requests: the
     page (404), `/index` (404), then the site probe. The wrapper would record the probe's
     status. If the probe times out, the plan's stalled-body rule labels a soft-empty "page
     absent" result `timeout`, so a real miss looks like a hung source: the reverse of the
     confusion this item removes.
   - Fix: `finalStatus` is the adapter's `error.status` when the envelope carries one. Otherwise
     it is the wrapper's label: the last response status for an ok result; for a failed result
     without a status, `timeout` if the last signal aborted, `network` if the last request
     threw, `none` with zero requests. Add a test for the absent-page path (attempts 3, `404`)
     and one for a stellar.org redirect (attempts 2, the last hop's status).
   - Document `attempts` as "upstream requests", since it counts the probe and redirect hops.

8. **D1: the load-rejection path is not always a syntax error.**
   - Evidence: `src/executor/run.ts:431-435` catches every rejection of `executor.execute`. That
     includes a return value that cannot cross the RPC boundary, an isolate limit, and a loader
     fault, none of which is a `SyntaxError`.
   - Fix: on that path classify `SyntaxError` only when the message matches
     `/SyntaxError|Failed to start Worker/`, the form `src/executor/script-hints.ts:27` already
     keys on (`test/script-hints.test.ts:19` has the real message); otherwise `other`.
   - On the brief's question: there is no cleaner structural source in 0.5.1. The only
     alternative is wrapping model code to carry `err.name` out and stripping it on the host,
     which changes every run to feed telemetry. The plan's approach is right. Put
     `classifyExecuteError` in `script-hints.ts` and share its patterns, so the runtime's message
     forms live in one file.

9. **D4: pin the classifier to the real runtime in the smoke lane.**
   - The unit tests assert hand-written strings. `npm run test:smoke` is already a gate for
     `src/executor`, and `test/smoke/executor.test.ts:1213` already produces a real
     `is not defined` error.
   - Fix: assert `errorName` there for one real `ReferenceError`, one `TypeError`
     (`null.x`) and one load failure. Leave `timeout` to the unit test; it would wait 60 s.

10. **E: the exclusion also changes the served Scout skill, and the plan does not say so.**
    - Evidence: `src/skills/scrub.ts:29,85,181` scrubs every skill body at read time from the
      same exclusion list. The pinned `stellar-scout` skill (commit `f1f781b9`) names the path
      three times. I ran the scrub on scratch copies with the entry added (repository
      untouched). It does not throw and leaves no reference. It removes:
      - `SKILL.md` workflow step 4, whole. That step also carries the stablecoin peg guidance,
        the partner-directory filters, and the rule to report empty partner results as "none
        listed at our source".
      - The "Use when" sentence of the `getPartner` paragraph in `references/api-reference.md`.
      - The `POST /api/partners/match` section of that file.
    - The manifest does not move for this: skill entries hold raw file hashes, not scrubbed text.
    - Fix: record the three removals in the plan and the report, and state that the loss of
      step 4's other guidance is accepted (I recommend accepting it; a narrower scrub unit is a
      separate change). Add the scrub run over the three pinned files to the E8 sweep.

11. **E4: four count assertions are missing from the retarget list.**
    - `test/catalog.test.ts:397` (Scout 30 to 29) with its comment at `:387-393`, and `:456-457`
      (62 operations, 286 entries, to 61 and 285).
    - `test/plain-operation-harness.test.mjs:14-22` (62 to 61).
    - `test/super-spec.test.ts:195` (Scout 30 to 29).
    - They fail loudly, so the risk is only an improvised fix. List them.

12. **E7: `--gate` cannot be the comparison, and the note must move with the fingerprint.**
    - Evidence: `eval/run-routing.mjs:105-113` fails the gate on the manifest SHA-256 as soon as
      the manifest changes, before any grade is compared.
    - Fix: follow item 0.2's method in full (`items/0.2/PLAN.md:54,82-88`). Save
      `git show HEAD:catalog/manifest.json` to `tmp/`, run the runner on it with `--manifest` and
      on the new manifest, and compare every row of every lane (grades, top-five lists,
      forbidden captures). The first `--gate` run must fail with exactly the one fingerprint
      line. If grades and totals hold, re-stamp the SHA-256, `localTrace` and `notes`
      (`eval/gates.json` `evidence.notes` describes the accepted manifest; item 0.2 changed all
      three), in the same commit as the manifest. Report top-five list changes in EXEC.md even
      when no grade moves. The stop rule is right as written.

13. **C3 and D3: decide `demo-execute` once, for both fields.**
    - Evidence: `src/demo/tools.ts:544-567` logs `demo-execute` from the same outcome, so D3's
      "if" is a yes. C3 does not mention it.
    - Fix: log `sources` and `errorName` on both events, with `errorName: "other"` in the demo
      catch at `src/demo/tools.ts:479-490`.
    - Also name a second place the new fields land: `projectSourceBasisTelemetry`
      (`src/policy/source-basis.ts:141`) copies whole ledger rows, and `run.ts:559` passes the
      ledger itself, so `attempts` and `finalStatus` appear in `sourceBasis.calls.first` on both
      events (12 rows on `execute`, 8 on `demo-execute`). That is bounded and telemetry-only.
      List it in step F1.

14. **E6: make the verification commands exact and count-only.**
    - "Style checks" leaves room for `git diff -U0 --word-diff=porcelain` without the
      `grep -c`. On `eval/qa/cases.json` that prints the unchanged words of the changed line,
      which is the case row.
    - Fix: allow only `git diff --numstat -- <case> eval/qa/cases.json` and the equality script
      of finding 1.

### Nits

15. **C3: prefer a fixed label set in `sources`.** `finalStatus: { [label]: count }` creates
    key paths from upstream status values. The 3.1 read could not find keys past a capped key
    list (`.agents/TODO.md:213-215`). Buckets (`2xx`, `3xx`, `4xx`, `429`, `5xx`, `timeout`,
    `network`, `none`) keep every key fixed; the exact status stays on the `op` event.

16. **E1 and E2.**
    - The scrub removal in E2 is required, not conditional: `scripts/build-catalog.mjs:834-840`
      throws on a scrub keyed to a non-exposed operation.
    - Put the reason and the re-exposure condition beside the entry in
      `src/policy/scout-exposure.ts`, as the other entries do (`:15-32`). Leave "round item 3.1"
      out of code comments.
    - `scripts/build-catalog.mjs:1263` uses `scout.matchPartners` as its example token; use an
      exposed id.

17. **D1 pattern gaps.**
    - `JSON.parse` failures are `SyntaxError` too: add `is not valid JSON` and
      `Unexpected end of JSON input`. Add `Cannot destructure` to `TypeError`.
    - Out of scope, worth a TODO line: a script that throws a non-Error (`throw "x"`) has no
      `err.message`, so codemode returns no error and the run is recorded as `ok: true`
      (`node_modules/@cloudflare/codemode/dist/index.js:306-307,347`). `errorName` never sees it.

18. **Facts wording.**
    - `OpLedgerCall` has more fields than the four listed (`src/executor/providers.ts:109-130`).
    - stellar.org's 24 s budget covers `get_page` only; `search_site` is one 12 s request
      (`src/adapters/stellar-org.ts:30,401`).
    - C4 says model-facing text changes only through step A. Step B also adds a `[timeout]`
      reason and a new error envelope for a call that used to hang. That is intended; say it.

19. **B1 and F.**
    - `docs/stellar-docs.md:201` says `OPERATION_BUDGET_MS` is "in the adapter"; update it when
      the constant moves.
    - The `ARCHITECTURE.md` text should say that 24 s bounds one call. Three sequential hung
      calls still exceed the 60 s `execute` limit, and one hung call uses 24 s of a skill
      runner's 30 s (`src/skills/run.ts:53`).
    - `.agents/TODO.md:203-204,213` and `:850-852` also describe work this item completes.

## Checks with no finding

- **Timeout budget (check 3).** No path exceeds 24 s per operation call and none multiplies.
  Lumenloop and Scout make one request under one signal. Docs clips every attempt, the `/index`
  retry, the probe and the moved-page fetch to one deadline (`stellar-docs.ts:159-165,445,461`).
  stellar.org clips each hop to the remaining budget (`stellar-org.ts:449-455`).
- **Fetch wrapper (check 4).** Guard refusals and missing keys make zero requests and get
  `none`. Calling the default `fetch` unbound matches the adapters today (`lumenloop.ts:45,65`).
  No new field reaches model-facing text: `callsLine` reads named fields
  (`source-basis.ts:335-349`), the artifact projection is explicit (`run.ts:505-509`), and the
  skill-run `calls` are built from named fields (`src/skills/run.ts:94-98`).
- **C5 is answered: yes.** `skill.run` calls reach the run ledger. `buildSandbox` builds the
  closures once with `onOpCall` and hands the same object to the runner facade
  (`providers.ts:1344,1356`).
- **References (check 6).** The plan's by-id list is complete; a case-insensitive search for the
  id, its snake-case form and the path finds nothing else. `eval/discovery/cases.json` is
  authored, and `eval/discovery/lib.mjs:115-121` requires the edit.
- **Step A.** Correct and minimal. The existing deadline test (`test/adapters.test.ts:853-864`)
  should also assert `status: 503`, and a "5xx then timeout" test should assert the status is
  cleared.
- **Gates.** The list covers the `CONTRIBUTING.md` Checks table, and the E3 rebuild order
  matches CI (`.github/workflows/ci.yml:119-133`).
- **Scope.** Nothing outside the note's five points crept in.

Verdict: revise, then execute — fix findings 1 and 2 in the plan first; findings 3 to 14 can be folded into the same revision without changing the plan's shape.
