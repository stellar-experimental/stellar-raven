accept with fixes

The test detects the reviewed SDK change. It does not yet protect the production tool definitions from changes.
Fix the test connection and the documentation findings before merge.
No production source or dependency changed in this PR.

Reviewed PR #213 at `ac9c2f44bb16b0f68d76ac4b04a089743047eccd`, against `a1b765488da1e4f778cd1dfc177629c7f4b32940`.
The branch is `test/playground-tool-request-shape`.
The worktree is `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-guard`.

In this report, `ledger` means `.agents/rounds/2026-10-02-raven-next-followup.md`.
`retained review` means `.agents/rounds/2026-10-02-raven-next-followup/review-ai-plan-astra.md`.

## Numbered findings

1. **P1 — The test can pass after production changes its strictness.**

   Evidence: `test/demo-openai-tool-request.test.ts:51–62` rebuilds both tools instead of calling `buildDemoTools`.
   Production builds them at `src/demo/tools.ts:268–271,407–410`.
   Both currently use `z.object` with the same imported input schemas and omit `strict`.
   The production descriptions differ from the test's literal `"search"` and `"execute"` descriptions.
   The test therefore protects the imported parameter schemas and the provider's defaults, not the complete production request.

   I added `strict: true` to production's search tool in an isolated scratch copy.
   Both new tests still passed.
   A production-only schema wrapper or provider option could escape this test in the same way.
   This directly weakens the instruction at test lines 78–80 to make future strictness decisions in `src/demo/tools.ts`.

   **Expected fix:** Capture requests from the real `buildDemoTools` result in an offline Worker test.
   `test/smoke/demo-tools.test.ts:15–16` already demonstrates the supported production import.
   Supply the capturing fetch and prevent actual tool execution.
   Alternatively, extract shared tool metadata and schemas into a small module used by production and this test.
   Preserve the production descriptions and options in that shared definition.
   Verify that changing production strictness makes this guard fail.
   Describe the assertion scope accurately if descriptions remain outside the guard.

2. **P2 — Qualify the API default and distinguish request changes from observed model behavior.**

   Evidence: `.agents/TODO.md:214–225`, ledger lines 164–173, and test comments at lines 10–13.
   The provider change is confirmed: omitted `strict` becomes explicit `false` in `@ai-sdk/openai@4.0.77`.
   However, omitted `strict` does not guarantee strict execution.
   Responses attempts schema conversion and can fall back to non-strict execution when conversion fails.
   The documentation omits that fallback and then asserts a change in how the model calls both tools.
   The evidence proves a request change, but it does not establish the previous server-selected mode.

   The TODO's rejection claim is correct for the unchanged search schema.
   Explicit `strict: true` requires every property in `required` and each object to reject additional properties.
   The current search schema lists six properties but requires only `query`.
   A capture with explicit `strict: true` preserved that mismatch.
   Optional values can instead use required fields that accept `null`.
   These conclusions follow the [official OpenAI function-calling guide](https://developers.openai.com/api/docs/guides/function-calling#strict-mode).

   **Expected fix:** Link the guide and state both default-conversion outcomes.
   Describe the update as a confirmed request change with a possible behavior effect.
   Say that the unchanged search schema violates the documented requirements for explicit strict mode.
   Do not imply that a live API rejection was observed or that schema redesign cannot support strict mode.
   The capture returns a synthetic HTTP 400; it does not validate the schema with OpenAI.

3. **P2 — The reconciliation text overstates what the earlier review required and what the TODO records.**

   Evidence: ledger lines 175–177 say the proper measurement requires a judge and two repetitions per arm.
   The retained review permits the bounded six-case screen without extra judging or repetition at lines 101–104 and 169–175.
   The lead can choose a stronger answer-quality measurement.
   That choice must remain distinct from the review's requirements.

   Ledger line 189 says the TODO records a primary-only claim. The new TODO item contains no such claim.
   Line 190 says the TODO records all listed checkpoints.
   The item names a receipt gate, headroom, step events, and the collection window.
   It does not explicitly record usage correlation, server-slot ownership, or a failed-source-probe stop rule.
   The referenced authority plan supplies some details, but the disposition should identify that source accurately.

   Ledger lines 137–139 also infer the absence of a freeze from an absent directory.
   The retained review already rejects that inference at lines 50–55.
   A missing directory does not establish that the paired plan lacks a signature or active collection.

   **Expected fix:** Attribute the judged design to the lead's decision and state its broader measurement question.
   Correct the disposition table to distinguish recorded requirements from future work and linked requirements.
   Record an independent signature/collection check for the deploy freeze, or mark that historical assertion as unverified.
   Do not rewrite the retained review to support the new decision.

4. **P2 — The branch-removal and exact-reproduction claims do not match the available evidence.**

   Evidence: ledger lines 195–196 say the candidate branch is removed and the update is reproducible with `npm update`.
   During this review, `refs/heads/chore/ai-sdk-in-range-bump` still pointed to `8f578ac8d53f16ee127f205bdec7a204cdf83e74`.
   No matching remote-tracking ref existed locally. This does not prove that the branch was never pushed.

   `npm update ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/openai` resolves the versions available when it runs.
   It does not reproduce the reviewed lockfile exactly.
   The retained plan records versions, but it does not preserve the candidate lockfile or its full diff.

   **Expected fix:** Correct the branch statement to the observed state.
   Name the full candidate commit and preserve its lockfile evidence before deleting its last reachable reference.
   Describe `npm update` as a new candidate-generation command, not an exact replay command.
   This review does not authorize deleting the branch.

5. **P3 — The new documentation violates the supplied writing rules.**

   Evidence: `.agents/TODO.md:212–213` contains a 21-word sentence about the attempted update.
   It also uses passive wording: `was not shipped`.
   The paragraph at lines 212–221 contains more than six sentences.
   Ledger lines 155–156 contain a 23-word sentence about the prepared update.
   Ledger lines 195–196 also use passive wording: `was never pushed` and `is removed`.

   **Expected fix:** Split the long sentences and paragraphs, and name the actor.
   For example: `The lead held the update after the review.`
   Apply the 20-word and six-sentence limits to the new TODO and ledger prose.
   Preserve exact technical identifiers.
   Preserve the two historical evidence files as evidence; do not silently rewrite their original claims.
   The supplied style rule excludes code comments from its prose-only requirement.

## Test and hash verification

The exact new test passed on this branch: one file, two tests, exit 0.
The installed versions were `ai@7.0.79` and `@ai-sdk/openai@4.0.47`.

I created an isolated archive of `8f578ac8` and copied the test into that archive.
It used the installed dependencies from `raven-next-ai`, including `ai@7.0.127` and `@ai-sdk/openai@4.0.83`.
The strictness test failed at line 81 because `search.strict` was `false`.
The parameter-hash test passed.
No test was added to the real `raven-next-ai` worktree.

The production-only mutation test used a separate scratch copy with the old dependencies.
Adding `strict: true` to `src/demo/tools.ts` left both tests green.
This is the direct evidence for finding 1.

The hash implementation at test lines 23–34 is sound for this input domain.
The input comes from `JSON.parse`, so it excludes functions, cycles, and undefined object values.
The function sorts object keys recursively, preserves array order, and uses SHA-256.
It hashes structural JSON, not the original request bytes.
It intentionally ignores object-key order and remains sensitive to array order.
That sensitivity includes arrays such as `required`, whose order may not change schema meaning.

This can cause conservative failures, but it does not invalidate the guard.
The recorded hashes matched both dependency versions:

| Tool | SHA-256 |
|---|---|
| `search` | `c683ff874aeae288a21842cfef134670674ad294b4b96cf44da7d2803943bbfc` |
| `execute` | `8a2d74fec2536309aaab83458396de4e4a0fef6d1184e670f689274c194641a5` |

The update instruction at lines 86–87 clearly requires a reviewed schema or provider-normalization change.
Printing `stable(entry.parameters)` exposes the replacement input for review.
A readable expected-schema fixture would improve diagnosis, but the hash choice itself is not a blocker.
Do not replace hashes merely to make a dependency update pass.

## Documentation and evidence checks

- The diff contains only the new test, the TODO item, the ledger addition, and the two evidence files.
- Production source, `package.json`, and `package-lock.json` are unchanged.
- The two evidence files exactly match the original plan and review by SHA-256.
- The retained review has the claimed `NO-LAUNCH` verdict and five numbered findings.
- The user's instruction confirms that no paid run followed that review and the update remains held.
- The installed package source and capture confirm the omitted-to-false strictness change.
- The source confirms that both production tools currently omit `strict` and use the shared input schemas.
- The changelog entries named in the TODO match the retained review's risk inventory.
- The planned judge and two repetitions exist in the authority precedent. They remain a future choice for this update.
- The old free-gate success claim has operator-log support despite the earlier review's sandbox limitation.

The operator's scratch log `ai-bump.log:28–36` records successful typecheck, unit, build, and smoke runs.
It records 2360 passing unit tests, three expected failures, and 100 passing smoke tests.
The log directory is:
`/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/e0458147-7f27-43a1-a99f-931d74bf4ad9/scratchpad`.
These logs support the historical gate claim.
The new report does not substitute its sandbox failures for that evidence.

The deploy statements have partial independent support:

| Claim | Verification |
|---|---|
| The Wrangler configuration diff contains only comments | Confirmed from `git diff c43b8092 a1b76548 -- wrangler.jsonc`. |
| CI passed for `a1b76548` | Confirmed from GitHub run `36955006523`. |
| The deploy preflight found a clean main revision | Confirmed in `deploy-main.log:5`. |
| The deployed version is `92ccf13a-f2b7-49ed-bdad-61826e4389cc` | Confirmed in `deploy-main.log:32`. |
| The postdeploy check passed | Confirmed in `deploy-main.log:34–37`. |
| The listed PR commits were included | Confirmed in the commit interval through `a1b76548`. |
| The exact creation times and 100% traffic allocation | Not independently established by the retained files or inspected log. |
| The historical nine-route, health, and authenticated connector results | The ledger reports them, but the supplied evidence files do not retain their outputs. |
| The freeze had not started | The directory check alone is insufficient; see finding 3. |

The lead judged that no fix warrants an immediate update.
A clean vulnerability audit does not establish that conclusion.
Nothing inspected demonstrates an urgent defect that requires this update.
The evidence also does not establish that every update fix is irrelevant to this service.

## Other checks and limits

`npm run typecheck` passed in `raven-next-guard`.
`npm run build` passed in the isolated, restored PR archive with the branch's installed dependencies.
The archive build produced `7275.61 KiB`, gzip `1422.70 KiB`.
Its filesystem layout differs from the operator's build, so I did not equate those byte counts.

A full local `npm test` attempt stopped before collection.
The sandbox denied Vite's temporary-file write under the guard worktree's `node_modules/.vite-temp` directory.
The targeted test had completed successfully earlier.
GitHub's [PR CI run](https://github.com/stellar-experimental/stellar-raven/actions/runs/36958065854) passed for the reviewed commit.
Its test job includes typecheck, build, unit tests, smoke tests, and the repository evaluation checks.
This review did not rerun a paid evaluation or start an evaluation server.

Both scratch source copies were removed after verification.
Both real worktrees retained their original tracked contents.
The sandbox blocked the requested report write to `raven-next-guard/tmp/review-guard-astra.md`.
This report is available at `/private/tmp/review-guard-astra.md` instead.
