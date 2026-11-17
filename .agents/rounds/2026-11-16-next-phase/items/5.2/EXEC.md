# Execution record, item 5.2

Executor: Claude Sonnet 5.5, agentpc `t1ty` child, on `np/5.2-owner-followups`. Plan:
[PLAN.md](PLAN.md) with its "Reconciliation" section. No model call, no paid call, no local Wrangler
server, no deploy, no merge, no pull request. USD 0.

## Per step

1. **DECISIONS.md.** New "## Follow-up answers (2026-11-17)" before "## Timing", six bullets (the
   NOTE.md answers; E's bullet says answer 2 is unchanged and an exposure outside a maintenance lane
   still moves the case). H and F are in the ledger row only.
2. **`eval/qa/README.md`.** REVIEW.md finding 6 text, verbatim, after the paragraph that ends
   "`split-amend.mjs` holds the checked move." (set as a paragraph with bullets, not a block quote).
   No "v5 to v8" sentence.
3. **`.agents/TODO.md`**, by heading:
   - C: deleted "Treat stellar.org routing reach as a lexical and description question"; rewrote the
     "Routing reach" bullet (closed as accepted, standing numbers, 3.3 record link, reopen trigger);
     Priorities item 3 points at the 3.3 record.
   - D: retitled "Hold the sealed FAM confirmation rows" (sealed set SHA-256, "the record lists the
     paths", Done-when line, Mac copy covers both development and confirmation files, path held by the
     orchestrator, free-count paragraph dropped). The FAM development archive pointer (bundle, ref,
     path, SHA-256, `~/backups/fd-2026-11-14/split/`, Mac copy, "the loader now accepts
     `stellarOrg`, the move changes the routing set, and it needs its own gate run") is in
     "Preserve structured routing intent" as an optional no-loss lane.
   - E: retitled "Close the register entries the dated runs leave open". Keeps the sentence "Count
     left open so far: none recorded yet." verbatim (PRESTAGE section 6 edits it). The follow-up lane's
     brief must claim the exception and override `ITEM-LEAD.md` "Never open a held-out or reserve QA
     case". The held-out status paragraph points at DECISIONS.md and gains one sentence on the
     exception with the README link. No plan-step reference in the text.
   - A: Audit source coverage drops Pi Network from the open facts (`sd-113` not forwarded, accepted
     as a leaf no reached source holds); "Audit register (done)" says the owner forwards `sd-111` and
     `sd-077`, the orchestrator sets `reported-upstream` on the owner's confirmation, `sd-113` not
     forwarded.
   - H: deleted the non-Error sentence; added the `cs-012` re-check clause to "Re-check the upstream
     codemode short-token repair".
   - I: replaced the OpenCode item with "Keep OpenCode out of client diagnostics" (EVAL-FABLE text
     plus the 2026-11-17 login fact).
4. **PRESTAGE.md** section 1: REVIEW.md finding 8 paragraph verbatim ("does not apply to these
   runs", exposure file under `~/.local/state/raven-dated/`); line-371 pointer retitled. The four
   `*-LEAD.md` briefs, `sibling-check.mjs`, the launcher and the timers are untouched.
5. **improvements/.** `sd-113` last evidence line replaced (finding 17 text). `sd-077` and `sd-111`
   each gain the owner-forwarding evidence line, status unchanged. New
   `canonical-source/cs-012-codemode-dynamic-worker-non-error-throw.md` with the intake override to
   `cloudflare/agents`. Order followed: write at `verified` with the reproduction, `improvements:index`,
   commit, push the branch, dry run, read as the maintainer, post, commit the script's edits.
   - Dedupe on `cloudflare/agents` before posting: `gh search issues` for "non-Error", "err.message
     codemode", "DynamicWorkerExecutor error undefined", "codemode throw string", "codemode non-Error
     throw", "DynamicWorkerExecutor throw", "codemode executor error", "codemode thrown value",
     "sandbox code throws", plus PR searches. No match (the "non-Error" hits are unrelated `createAI`
     and similar issues). Upstream `main` `366d5b5baf846b4669a2ecd0e61e104aa634432b`
     (2026-11-17 12:23 UTC) still has `error: err.message` at `packages/codemode/src/executor.ts:511`.
   - **Issue: https://github.com/cloudflare/agents/issues/2897** (no duplicate). The issue's `main`
     source-record link is dead until the orchestrator merges the branch, so the merge should not
     wait. The immutable snapshot link points at commit `7dcc6a1f`.
6. **H verification** (below). Premise holds, so the finding was filed.
7. **Ledger.** One 5.2 row in `.agents/rounds/2026-11-16-next-phase.md` with each letter's outcome, F's
   "no action" wording, the issue URL, review, USD 0, "Not needed: no Worker bytes change", and the
   merge window (before 2026-11-23 18:00 UTC; else hold until 2.1 and its follow-ups have merged,
   then rebase and carry the lead's count into the rewritten TODO item).

## Reproduction (step 6)

Scratch test `test/smoke/zz-non-error-throw.test.ts`, run with
`npx vitest run --config test/smoke/vitest.config.ts test/smoke/zz-non-error-throw.test.ts
--reporter=verbose --disableConsoleIntercept`, then deleted (it never entered a commit). Installed
`@cloudflare/codemode` is 0.5.1. Console output:

```text
PACKAGE string: result=undefined error=undefined keys=result,logs
RUNNER string: ok=true result="undefined"
PACKAGE object: result=undefined error=undefined keys=result,logs
RUNNER object: ok=true result="undefined"
RUNNER null: ok=false error=Cannot read properties of null (reading 'message')
PACKAGE null: rejected: TypeError: Cannot read properties of null (reading 'message')
Tests 5 passed (5)
```

The package boundary returns no `error` key for a thrown string or object (`keys=result,logs`), and
Raven's runner records `ok: true` with result `"undefined"`. `throw null` is outside the stop rule: both
paths fail inside the catch block (`TypeError: Cannot read properties of null (reading 'message')`),
and the runner returns `ok: false`. Source of the test, kept here because the file is deleted and the
TODO clause asks a later upgrade to re-run it:

```ts
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { DynamicWorkerExecutor } from "@cloudflare/codemode";
import { createExecuteRunner } from "../../src/executor/run";

const run = createExecuteRunner(env as unknown as Env);

const CASES = [
  ["string", 'async () => { throw "x"; }'],
  ["object", "async () => { throw { code: 1 }; }"]
] as const;

describe("non-Error throw is recorded as ok", () => {
  for (const [label, code] of CASES) {
    it(`package ${label}`, async () => {
      const executor = new DynamicWorkerExecutor({ loader: (env as unknown as Env).LOADER });
      const out = await executor.execute(code, []);
      console.log(`PACKAGE ${label}: result=${String(out.result)} error=${String(out.error)} keys=${Object.keys(out).join(",")}`);
      expect(out.error).toBeUndefined();
    });
    it(`runner ${label}`, async () => {
      const outcome = await run(code);
      console.log(`RUNNER ${label}: ok=${outcome.ok} result=${outcome.ok ? JSON.stringify(outcome.result) : "-"}`);
      expect(outcome.ok).toBe(true);
    });
  }
  it("null throws inside the catch (recorded, not asserted)", async () => {
    const outcome = await run("async () => { throw null; }");
    console.log(`RUNNER null: ok=${outcome.ok} error=${outcome.ok ? "-" : outcome.error}`);
    let packageOut: string;
    try {
      const out = await new DynamicWorkerExecutor({ loader: (env as unknown as Env).LOADER }).execute("async () => { throw null; }", []);
      packageOut = `result=${String(out.result)} error=${String(out.error)}`;
    } catch (e) {
      packageOut = `rejected: ${String(e)}`;
    }
    console.log(`PACKAGE null: ${packageOut}`);
  });
});
```

(The first draft logged JSON of the whole outcome and showed the same result; this is the final
version, whose asserted cases are the string and object throws.)

## Gates (bare, one at a time, scratch test deleted before `typecheck`)

- `npm run eval:qa:lint`: exit 0, 0 errors, 98 warnings.
- `npm run improvements:lint -- --live`: exit 0, "improvements lint ok (93 findings, live intake checked)".
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 168 files passed, 5 skipped; 3733 tests passed, 3 expected fail, 5 skipped.
- `npm run secrets:scan -- --tree`: exit 0, clean over all tracked files.
- `git status` was clean of the scratch test before every commit. The pre-commit hook ran on each
  commit (never `--no-verify`).

## Exposure

**exposure: 1 (QA output, five case ids).** My first `npm run eval:qa:lint` was piped to `tail -8`,
which printed warning lines for five cases with golden text. I did not open any corpus file or look
up any set. The ids are in `~/.local/state/raven-dated/5.2-EXPOSURE.txt` (untracked, never
committed, one id per line) for the orchestrator's split amendment. Every later lint run wrote to a
file and I read only its last line.

## Deviations and notes

- **Three commits, not one or two.** Commit 1 holds steps 1 to 7 except the ledger row, commit 2
  trims `cs-012` evidence after I read the dry run (the evidence list repeated the body, so I cut it
  to the two lines that add information and recommitted before posting, so the snapshot link
  matches), commit 3 holds the script's edits, the ledger row and this file.
- The `cs-012` evidence says "Raven impact" in terms of `createExecuteRunner`; it names no round
  term and no `EXEC.md` path (finding 16).
- `sd-077` and `sd-111` evidence lines name only the other finding ("with sd-111" / "with sd-077")
  instead of "sd-077/sd-111"; the effect is the same.
- The smoke vitest config fetches pinned skill files on a cold cache; the first run hit HTTP 429 from
  `raw.githubusercontent.com`, and the retry succeeded from the partial cache. No code or test change.
- `npm run typegen` and the placeholder `.dev.vars` were already in place (finding 22), so typecheck
  ran without setup.
- The Mac path of the second `~/backups/fd-2026-11-14/split/` copy is not in any file ("held by the
  orchestrator"), per finding 20.
- No stop rule fired.

## Still open for the orchestrator

- The owner's confirmation that `sd-077` and `sd-111` were sent; then set `reported-upstream` with the
  date and channel.
- Open the pull request for `np/5.2-owner-followups` and merge before 2026-11-23 18:00 UTC.
- Amend the split for the five exposed ids (file above) if the orchestrator treats the lint tail as an
  exposure.
