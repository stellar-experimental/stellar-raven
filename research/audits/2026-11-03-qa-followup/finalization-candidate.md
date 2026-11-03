# Unmeasured finalization candidate

The candidate reserves the last existing answer request for synthesis.
Requests 1–15 keep tool choice `auto`.
Request 16 uses provider `tool_choice: "none"` and a short evidence-based reminder.
Earlier final answers finish without another answer request.
The ceiling remains 16 answer requests, with the existing separate judge request.

The candidate stays in `codex/golden-finalization-2026-11-03` at base `0aea991fd36ecd5653eef07c317568c7aa71f0e8`.
`finalization-candidate.patch` changes three experimental modules, their README, and the existing focused test file.
The manifest records before/after file hashes, original blobs, protected sources, test logs, and patch checks.

## Identity and failures

The result schema is `direct-grok-final-synthesis-candidate-v1`.
The plan schema is `direct-grok-final-synthesis-plan-v1`.
Every plan must acknowledge `answerPolicy: "reserve-last-answer-request-v1"`.
Older reviewed plans fail validation.
The source-pinning guards remain unchanged.

Artifacts retain the reminder, its hash, the policy identity, actual request messages, and each requested tool choice.
Invalid parsed choices retain their original response choice as rejected evidence.
Returned tools on request 16 never execute.
Empty, refused, and violating final outputs remain failed rows.
Missing cost and identity failures still prevent answer acceptance.
No retry, fallback, panel, extra answer request, or historical result reuse was added.
The judge tuple, prompt, evidence pack, and acceptance rules remain unchanged.

## Provider contract

The [official xAI guide](https://docs.x.ai/developers/tools/function-calling) documents `none` as disabling tool calling.
The installed Cloudflare Workers types accept `tool_choice: "none"` in the chat-completion input.
The Cloudflare documentation request returned HTTP 403; the local primary types supplied that binding evidence.
The saved source receipt includes URLs, hashes, and bounded excerpts.
No live capability check for `xai/grok-4.7` ran.

## Free verification

- The focused runner suite passed 88 tests.
- The full unit suite passed 3215 tests, with three expected failures.
- The type check passed after local type generation supplied the missing Env bindings.
- The dry-run Worker build passed without deployment.
- The eval self-test passed.
- Corpus lint passed with zero errors and 92 existing warnings.
- Both forward and reverse patch checks passed.

The new tests reach the actual sixteenth request and check its tool choice and retained messages.
They cover early completion, forbidden tool returns, empty and refused outputs, missing costs, and identity failures.
The provider test checks the native payload with a mocked provider.
The tests use past mocked clocks; the production deadline is unchanged.

## Reproduction

Use the finalization worktree and its existing dependency and development-variable symlinks.
Run these free commands there:

```sh
npm run typegen
npm test -- test/direct-grok-runner.test.ts
npm run typecheck
npm test
npm run build
npm run eval:selftest
npm run eval:qa:lint -- --since 0aea991fd36ecd5653eef07c317568c7aa71f0e8
```

Do not run inference from an older reviewed plan.
The deadline remains `2026-11-03T10:00:00Z` and has expired.
This patch provides no new selection, deadline, budget, or launch authorization.

## Required future experiment

Independent review must finish before a commit or paid experiment.
A separate reviewed protocol must authorize fresh control and candidate collections.
Both arms must share an approved corpus, selection, provider tuple, server identity, and source evidence basis.
The protocol must pin each arm's source and policy identity.
It must authorize an active deadline and spend without reusing historical results.
It must include a separately authorized provider capability check.

Pre-register completion failures, quality errors, unsupported claims, refusals, tool-policy violations, latency, and reported cost.
Retain every selected failure and suppress invalid aggregates.
Review factual quality as well as completion; forced synthesis can increase unsupported answers.
The candidate establishes no measured improvement.
