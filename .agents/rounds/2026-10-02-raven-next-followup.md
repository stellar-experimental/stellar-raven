# raven-next follow-up — 2026-10-02

Lead `raven-next` (Claude Fable 5.1, pane `w3W:p2`). Base `origin/main` `8e5234ba`.
This round finishes the items the [2026-09-30 raven-next round](2026-09-30-raven-next.md) left
with the owner, after the [backlog closeout](2026-10-01-backlog-closeout.md) landed #190 to #210.

## Scope

Re-verify each remaining item against current `main`, then do the clear ones.

- `sd-052`: post the resolution comment on stellar/stellar-cli issue 2722 and retire the record.
- `sk-028`: file the verified finding on `Stellar-Light/stellar-scout`.
- In-range dependency refresh: `ai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`,
  `@cloudflare/workers-types`, `@types/node`. Stop and report if the `ai` changelog names a
  behavior change on the Playground path.

Out of scope here: any deploy (the owner approves deploys), paid evaluations, the majors
(`vitest` 5, `@cloudflare/workers-oauth-provider` 1.x, `agents` 0.24), and `@cloudflare/codemode`.

## Re-verification (2026-10-02, about 01:55Z)

- `sd-052`: status `fixed-upstream`, not in `improvements/resolved.json`. Issue 2722 is closed as
  completed with no comment. The live manual carries "(requires external plugin)" on the Python,
  Java, Flutter, Swift, PHP, and Kotlin Multiplatform binding descriptions. Still open: yes.
- `sk-028`: status `verified`, not filed. Upstream `main` is still `3b587aa9f23d`; `SKILL.md`
  line 91 and `references/api-reference.md` line 104 still carry the two fixed sizes.
  `/api/status` now reports 233 builders (226 on 2026-09-30). None of the 13 issues in
  `Stellar-Light/stellar-scout` covers the count. Still open: yes.
- Dependencies: `npm outdated` lists the six in-range packages. Wrangler is 4.145.0 and
  `npm audit` reports 0 findings on `main`.

## Lanes

| lane | agent (tier, model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| lead | `raven-next` (Claude Fable 5.1) | `w3W:p2` | both branches, this ledger | done |
| improvements review | `rev-grok-imp` (Grok, `grok-4.7`, high) | `w3W:p1B` | `review-improvements-grok.md` in this round directory | `sd-052` go; `sk-028` go with fixes, both applied |
| dependency review | `rev-sol-deps` (Codex workhorse, `gpt-6.1-sol`, high) | `w3W:p1C` | `review-deps-sol.md` in this round directory | accept with one verification gap, closed |

Panes `w3W:p1B` and `w3W:p1C` were split from `w3W:p2` and belong to this lead. Grok was chosen
for the improvements gate because it repeats live upstream reads without a sandbox; the Codex
workhorse fits the bounded lockfile verification. Neither is the author or the orchestrator.

## Dependency refresh — stopped for `ai` and `@ai-sdk/*`, with a report

The Playground (`src/demo/chat.ts`) calls `streamText` with `prepareStep`, `onStepFinish`,
`abortSignal`, and `stopWhen`, reads `result.fullStream`, and runs in the Workers runtime.
`prepareDemoStep` returns `activeTools: []` and a `system` string on the final step. It sets no
`toolChoice` and no `model`.

The `ai` changelog from 7.0.80 to 7.0.127 (48 releases) names these changes on that path:

| change | entry | why it is on the Playground path |
| --- | --- | --- |
| `streamText` no longer executes tool calls that violate tool choice | `ccf98e7` | the Playground uses `streamText` with tools; it sets `activeTools: []` on the final step, and the interaction of that fix with an empty active set is not stated |
| unhandled stream-completion rejections are prevented in non-Node runtimes | `34d869e` | the Playground runs in Workers and has its own abort and error handling around `fullStream` |
| streamed step results report the `prepareStep` model; response-metadata fallbacks use it | `6696728`, `107343a` | the Playground uses `prepareStep` and reads step results in `onStepFinish` (it sets no model, so the likely effect is none) |
| pending tool-call repairs stop on cancel; telemetry spans close on provider stream failure | `6317504`, `9c1ea74` | cancel and failure paths of the same call |
| packages compile for ES2022 and build with tsdown | `af9597b`, `ede5b89` | changes the code that enters the Worker bundle |

A trial run of the four-package bump in a scratch state of the dependency branch passed every free
gate: `npm run typecheck` exit 0; `npm test` 134 files, 2360 passed, 3 expected fail;
`npm run build` exit 0 (7300.52 KiB, gzip 1445.15 KiB); `npm run test:smoke` 100 passed;
`npm audit` 0 findings. The bump also moves `@ai-sdk/provider-utils` to 5.0.53 and its `undici` to
7.30.0. The trial was reverted and is not on any branch.

Decision for the owner: the free gates do not exercise a live model loop. The stop rule applies,
so the `ai` and `@ai-sdk/*` bumps are not shipped. Shipping them needs either an owner call that
the entries above are acceptable on the free evidence, or a seeded Playground run (paid).

The type-only part ships separately as PR #211: `@cloudflare/workers-types` 5.20261001.1 →
5.20261002.1 and `@types/node` 26.3.0 → 26.6.4. Lockfile only; no runtime package moves.

## What a deploy would ship

Production is Worker Version `cc77c5bf-e0d6-4f98-b57b-d526a9e7c393` (2026-09-30T22:23:30Z), built
from `c43b8092`. Nothing in this round changes the Worker bundle. A deploy of `main` `8e5234ba`
would ship these runtime-affecting commits, none of them from this lead:

- #190 repository audit (`wrangler.jsonc`, source comments and types across `src/`).
- #193 `build:usage` output location.
- #194 Wrangler 4.145.0 and the pool override.
- #195 audit verification fixes.
- #197 Playground page script test.
- #208 Stellar Docs adapter contract: `hitsPerPage` default 5 is now sent (model-facing).
- #209 the "docs first" clause removed from the `execute` description (model-facing), and
  Playground evaluation cost accounting (`src/demo/eval-cost.ts`, `src/demo/chat.ts`).

34 files under `src/` and `wrangler.jsonc` differ from the deployed commit (751 insertions, 446
deletions). The owner decides the deploy.

## Reconciliation

| review | finding | disposition |
| --- | --- | --- |
| `rev-sol-deps` | `npm test` exits 1 in the Codex sandbox on both base and candidate (`spawnSync ps EPERM` in `test/qa-paired-launch.test.mjs`); repeat it outside the sandbox | closed: the lead's unsandboxed run passed (2360 passed, 3 expected fail) and the CI `test` job passed. The reviewer also showed `dist/server.js` is byte-identical to `main` |
| `rev-grok-imp` | `sd-052`: no finding; post the resolver comment before the real resolve | done in that order |
| `rev-grok-imp` | `sk-028`: the two stale lines are mirrors; the canonical files are in `Stellar-Light/stellarlight` and a generated mirror must not be hand-edited | fixed before filing: the recommendation names `public/skills/stellar-scout.md` line 91, `public/skills/references/api-reference.md` line 104, the regeneration script, and the sync workflow. The lead verified the paths and `SHIPPING.md` through `gh api` |
| `rev-grok-imp` | `sk-028`: three evidence bullets used internal workflow language | fixed before filing: replaced by one owner-facing dedupe bullet |

## Receipts

- **PR #211 (types-only dependency bump).** CI passed. GitHub merged it by squash as
  `d3e85dc670ffa596ca656482652a5ef11d7e127e` at 2026-10-02T02:08:08Z. Not deployed: the Worker
  bundle is byte-identical to `main` before the merge.
- **`sk-028` filed.** `npm run improvements:file` created
  https://github.com/Stellar-Light/stellar-scout/issues/15 at 2026-10-02T02:13:47Z. The record is
  `reported-upstream` with the URL in its evidence. The issue body was read back: marker, notice,
  and all five sections present. The repository exposes no `raven` label, so none was applied.
- **`sd-052` drained.** Resolution comment posted and read back:
  https://github.com/stellar/stellar-cli/issues/2722#issuecomment-5944336604 (2026-10-02T02:13:58Z).
  `npm run improvements:resolve` then retired the record to `improvements/resolved.json`, removed
  its intake override, deleted the active file, and regenerated `INDEX.md`.
  `npm run improvements:lint` → ok (66 findings); `npm run improvements:lint -- --live` → ok,
  live intake checked. `npm run improvements:probes` → 6 recurring, 0 fixed-candidate, 2
  inconclusive (`ll-003` and `ll-007` need `LUMENLOOP_API_KEY`, which this worktree does not
  carry), 0 errors. `npm test` → 134 files, 2360 passed, 3 expected fail.
- **This PR (improvements bookkeeping).** Not deployed: it changes only `improvements/` and
  `.agents/`. Its merge commit is in the Git history of this file.

## Outcome

Done: `sd-052` comment and retirement, `sk-028` filing, the type-only dependency bump. Stopped by
rule, with a report above: the `ai` and `@ai-sdk/*` bumps. Open for the owner: whether to ship
those four packages on the free evidence or after a seeded Playground run, and when to deploy
`main` (the list above). The dated golden checks from 2026-10-08 are not due. Panes `w3W:p1B` and
`w3W:p1C` are closed.

## Second pass, 2026-10-02 (after the owner's reply)

The owner answered both open questions: use judgement on the `ai` update, paid tests allowed; and
merge and deploy as work completes unless something argues against it.

### Deploy of `main`

Checks before the deploy: the `wrangler.jsonc` diff since the deployed commit is comments only; CI
on `a1b76548` passed; #208 and #209 carry measured release verdicts; no paired launch is in
progress (`/private/tmp/stellar-raven-paired-launch` absent), so the paired plan's merge and deploy
freeze has not started.

- `npm ci` then `npm run deploy` from a clean detached worktree at `a1b76548`. The preflight
  printed `tree clean and HEAD == origin/main`. Worker Version ID
  `92ccf13a-f2b7-49ed-bdad-61826e4389cc`, version created 2026-10-02T02:41:23.585Z, deployment
  created 2026-10-02T02:41:25.960Z, 100% of traffic. The `postdeploy` hook passed.
- Verification at 02:41:29Z: the nine public routes returned HTTP 200; unauthenticated
  `POST /mcp` returned HTTP 401; `/health/skills` reported `checked: 64`.
- Authenticated check through the Raven connector: `stellarDocs.search_docs`,
  `search_doc_titles`, and `search_meeting_notes` each returned 5 hits with no `hitsPerPage`
  argument (the #208 change is live); `scout.getStatus` returned apiVersion `1.9.54`.

This deploy shipped #190, #193, #194, #195, #197, #208, and #209.

### `ai` and `@ai-sdk/*` update: held, with a guard test

The lead prepared a measured update: candidate commit `8f578ac8` (lockfile only), a live
loop-check plan (`ai-bump-plan.md` in this round directory), and cap files. Nothing paid ran.

Source check by the lead: the changelog's tool-choice enforcement (`ccf98e7`) runs only for
`toolChoice.type` `required` or `tool`; the Playground sets none. `ai` enters the Worker only
through `src/demo`.

Plan and code review by `rev-astra-ai` (Codex frontier, `gpt-6-astra`, high, pane `w3W:p1D`):
`NO-LAUNCH`, five findings (`review-ai-plan-astra.md`). The decisive one: `@ai-sdk/openai` 4.0.77
defaults an omitted tool `strict` to `false`. A request-capture fixture showed BASE omits `strict`
and CANDIDATE sends `"strict": false`. The lead confirmed it in the package source
(`strict: tool.strict ?? false` against `...tool.strict != null ? { strict } : {}`) and in the
OpenAI function-calling guide: with `strict` omitted, Responses attempts strict mode and
normalizes the schema; `strict: false` opts out to best-effort function calling.

Decision (lead, under the owner's delegation): do not ship the update now.

- It changes how the Playground model calls its two tools. That is a model-facing change, and
  this repository measures those before release.
- The update brings no fix this service needs. `npm audit` is at 0 findings on `main`.
- A proper measurement is the reviewed two-repetition judged design, not the six-case screen the
  lead drafted. The reviewer's other findings (receipt gate, current Gateway headroom, saved step
  events, completion rule, replacement order) all point the same way.
- The owner's paired collection is scheduled for the weekend and freezes merges and deploys once
  signed. A dependency change with an open strictness decision should not land just before it.

What landed instead: `test/demo-openai-tool-request.test.ts`. It sends the two Playground tool
schemas through the production OpenAI Responses factory with a capturing `fetch`, and asserts that
`strict` is not sent and that the parameter schemas match recorded hashes. It passes on `main` and
fails on the updated lockfile (`expected … to not have property "strict"`), so the free gates now
catch this class of change. `.agents/TODO.md` carries the upgrade item with the decision it needs.

| review finding (`rev-astra-ai`) | disposition |
| --- | --- |
| 1. The artifact cannot prove the final-step rule; a single-model override tests no fallback | accepted; no launch. Recorded in the `TODO.md` item (saved `demo-step` events; primary-only claim) |
| 2. Current Gateway headroom, receipt gate with usage, paired-window and server-slot checkpoints are missing | accepted; no launch. Recorded in the `TODO.md` item |
| 3. Risk inventory omits active-path changes, first of all tool strictness | accepted; this is the reason for the hold. The guard test pins the strictness and the schemas |
| 4. Completion must use the runner's complete-method state | accepted; applies to the future plan |
| 5. Replacement order and consumption updates are ambiguous | accepted; the future plan follows the authority plan's order |

The candidate branch `chore/ai-sdk-in-range-bump` was never pushed and is removed; the update is
reproducible with `npm update ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/openai`.

