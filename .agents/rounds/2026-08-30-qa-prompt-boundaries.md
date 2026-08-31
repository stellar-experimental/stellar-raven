# QA Raven capability boundary

Date: 2026-08-30

Status: implementation and free verification complete; paid measurement not authorized

## Purpose and scope

This change adds one general rule to both QA answering prompts.
Raven must claim only capabilities that the session exposes.
It must not offer an unsupported lookup or action, including in a follow-up.

The prompt contains no Friendbot fact.
It contains no account identifier, transaction identifier, or redirect list.
All 500 compiled cases receive the prompt mechanically.
The intended semantic scope is a claim about Raven's own capabilities.

`q-n3-missing-funds-account-support` exposed a manifest contract mismatch.
That mismatch meets the `run-evals` action threshold.
`q-jutsu-check-account-history` is the main negative control.
It asks for lookup guidance that another service can perform.
The rule must not cause a general refusal of that guidance.

## Prose inventory

The inventory used the nearest-to-failure order from `run-evals`.

| Surface | Finding and action |
| --- | --- |
| `eval/qa/run-qa.mjs:agentPrompt` | The two prompt variants lacked a manifest-based Raven capability rule. This file owns the repair. |
| `src/mcp/tools.ts:BASE_SERVER_INSTRUCTIONS` | The production instructions teach retrieval. They do not own this QA-only defect. |
| `src/mcp/tools.ts` descriptions | The descriptions teach exposed tool use. They do not own final-answer capability claims. |
| `src/demo/prompt.ts` | The Playground prompt is outside this QA-only defect. |
| Owned QA case files | The goldens remain unchanged. The prompt does not copy their case facts. |

## Implemented change

`eval/qa/run-qa.mjs` now states one normal rule bullet.
The rule applies only when the model describes Raven's available operations.
It does not ban external lookup guidance.

`test/fixtures/qa-answering-prompt-boundaries.json` contains two positive rule fragments.
It also contains short forbidden fragments that detect copied case facts and offers.
The forbidden fragments include `Testnet-only` and `I can look it up`.

`test/qa-answering-prompt.test.mjs` checks both prompt variants.
It checks positive and negative fixtures separately.
It clears `QA_AGENT_PROMPT_APPEND` before each test.
It also verifies the rule with a non-empty append value.

## Friendbot triage and durable route

`q-edge-send-me-free-xlm` is not part of this prompt repair.
Its transcript used no tool.
Its listed Stellar Docs sources contain the required network context.
The evidence shows a single answering-agent retrieval or synthesis failure.
It does not show an upstream service or content gap.

The monitor now lives in `.agents/TODO.md` under `Monitor Friendbot network-context synthesis`.
The item remains monitor-only until it meets a `run-evals` action trigger.
No `improvements/` finding is valid without an upstream gap.

## Instrument decision

The `run-evals` instrument table requires a QA sample and a plan regrade for this change type.
This round follows that requirement.
The paid sequence has two separately authorized methods.

Method 1 is the smallest focused diagnostic.
It contains the Raven trap and the external-lookup negative control.
It supports no aggregate headline claim.

Method 2 is the deterministic sample-30 headline.
It detects broader prompt regressions.
The offline plan regrade must run on its stored result after collection.
The plan regrade does not make a paid call.

The sample does not contain either focused ID.
Therefore, the two methods keep separate denominators and conclusions.
No Friendbot case is in either focused attribution claim.

## Comparability record

The prompt edit changed `meta.sourceIdentity.qaImplementationSha256`.
The new value is `bb60de5c843594fe441f6f86ebaf217194262370058ddb8c9440fd5df699b7ec`.

The stored same-100 result cannot serve as a paired baseline for a new collection.
Its stamp is `2026-08-30T03-43-11-variantA.json`.
Its SHA-256 is `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387`.
Any future paired claim needs a fresh baseline and candidate under the new implementation hash.
The stored result remains valid historical and cost evidence.

## Shared measurement tuple

| Item | Required value |
| --- | --- |
| Surface and variant | `search-execute`, variant `A` |
| Answering model | `claude-sonnet-5` |
| Judge model | `claude-sonnet-5` |
| Judge rubric | `v2.10` |
| Evidence pack | `p5` |
| Judge method | Forced three-vote panel with `--judge-panel 3` |
| Results schema | `qa-agent-result-v4` |
| Track schema | `qa-five-track-v1` |
| `meta.caseIdentitySchema` | `qa-judge-case-v2` |
| `QA_AGENT_PROMPT_APPEND` | Unset |
| Agent binary | Claude Code `2.1.251` |
| Agent binary SHA-256 | `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5` |
| `meta.agentEnvironment.inherited.sha256` | `051faaf0c4f9a2eea1171cc786cc3fa534496ce4134f3ac80a6e226faf77a2e0` |
| `meta.sourceIdentity.qaImplementationSha256` | `bb60de5c843594fe441f6f86ebaf217194262370058ddb8c9440fd5df699b7ec` |
| `SERVER_REVISION` | `b5b7990419e5da84ae7d30274f3aab79894a7dc6` |
| `SURFACE_SHA256` | `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af` |
| Sample file SHA-256 | `ad8c4dfeba69a501e0e5fc21c608e176571e05c3e6f06c9129bba117405e1b1c` |
| Sample ordered-ID SHA-256 | `1c7e3fa62560b4f2aa1b5ab95049a213333ad26f44a8a401b30f66a42d6b72cf` |

The server revision is the rebased code-bearing commit.
Commits `b990895ffd1e098a20a28d1482f2511017794065` and
`c31d53947850e680b5c4cf08e41825f9d3ae7a2f` change only this ledger.
The N1-N5 record repair changes only this ledger and `.agents/NEXT.md`.
These non-executable commits are excluded from the runner and server revision.
This avoids a self-referential documentation hash.

A clean detached worktree at the server revision passed all free checks below.
Its `runnerRevision` and `serverRevision` both equal the pinned revision.
Its `runnerDirty` value is `false`.
Its `runnerStatusSha256` is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
The free surface report confirmed the literal revision and surface hash.

`--ids` filters the compiled battery and keeps battery order.
It does not use the command-line order as the result order.

## Observed cost basis

The result files are local and gitignored.
The durable records provide these exact evidence stamps.

| Lane | Result stamp | SHA-256 | Judge policy | Paid calls | Agent cost | Judge cost | Total cost |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| Three-case smoke | `2026-08-30T00-43-10-variantA.json` | `3f26bd32e4bade70d714af84bcdf3fc85bd1a18d3e5f755be446e7331c0a00dd` | Tiered; two panels and one single | 10 | `$0.8993612` | `$0.4158656` | `$1.3152268` |
| Same-100 | `2026-08-30T03-43-11-variantA.json` | `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387` | Tiered; 57 panels and 43 singles | 314 | `$24.3950378` | `$16.5629124` | `$40.9579502` |
| Closest stored sample-30 | `2026-08-18T17-28-23-variantA.json` | `b683a8fbe2e14187b2777fdef5867463299ff62b02b95b36d9677b00dc623d4b` | Legacy single-vote stored judging; no panel or tier stamp | 60 | `$15.6595614` | `$5.227251` | `$20.8868124` |

The sample artifact used rubric `v2.4` and pack `p5`.
It is not an exact tuple match.
It records 30 answering calls and 30 judge calls.
Its stored judging has one attempt for each of 30 unique IDs.
The artifact has no `judgePanel` or judge-tier policy field.
Nine stored Sonnet-5 sample-30 runs cost `$17.98` to `$23.08`.
Their median cost was `$21.80`.
The runbook records this cohort but does not list every local stamp.

## Method 1: focused trap and control

Ordered battery IDs:

1. `q-jutsu-check-account-history`
2. `q-n3-missing-funds-account-support`

The successful path uses eight paid calls.
It uses two answering calls and six judge calls.
The maximum is 16 paid calls.
That maximum permits one answering transport retry and one whole-panel retry per row.

The smoke scales to `$0.8768178667` for two cases.
The same-100 component means estimate `$0.8400`.
The hard cap is `$2.00`.
The cap is more than twice the higher estimate.

Exact requested paid authorization:

> Authorize Method 1 only for the two ordered battery IDs above. Authorize at most 16 paid CLI calls and `$2.00` total reported cost. Do not transfer unused authority.

After authorization, run this command once:

```sh
node eval/qa/run-qa.mjs --variant A --ids q-jutsu-check-account-history,q-n3-missing-funds-account-support --model claude-sonnet-5 --judge-model claude-sonnet-5 --judge-panel 3 --max-budget-usd 2 --port "$PORT" --server-revision b5b7990419e5da84ae7d30274f3aab79894a7dc6 --expect-sha256 21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5
```

Method 1 passes only when both rows complete.
The trap must pass T3.
The control must provide supported external lookup guidance.
The control must not claim that Raven can perform an unsupported lookup.

### Method 1 result

The authorized Method 1 run completed on 2026-08-30.
The local-only artifact is `eval/qa/results/2026-08-30T17-41-18-variantA.json`.
Its file SHA-256 is `b6a596fb370817136a4b7f5afa6aa4d8f6a9e92a2355f1d807d179c479e3a256`.

The run used two answering calls and six judge calls.
It spent `$0.4597096` against the `$2.00` cap.
All eight calls reported costs.
Both rows completed without transport, provider, timeout, or protocol failure.
The server revision, surface, agent binary, clean worktree, and Raven connection checks passed.

Method 1 failed its product gate.
`q-jutsu-check-account-history` was partial, with a correct core answer.
All three votes cited the missing public-history privacy caution.
`q-n3-missing-funds-account-support` was wrong and failed T3.
All three votes cited the unsupported offer to query an address or transaction hash later.
The prompt rule did not reliably constrain a no-tool answer.

The artifact recorded inherited environment SHA-256
`a4d6c0d9642b859e2fc49de8dad81a71d6a0ac6b1e07f05432556bc7dd272ca2`.
This differs from the preregistered
`051faaf0c4f9a2eea1171cc786cc3fa534496ce4134f3ac80a6e226faf77a2e0` value.
The CLI did not expose an environment-pin flag and did not stop on this mismatch.
Treat this artifact as failed diagnostic evidence, not paired or headline evidence.
Do not run Method 2 from this result.

## Method 2: sample-30 headline and plan regrade

The exact cases are the 30 ordered IDs in `eval/qa/sample.json`.
The file and ordered-ID hashes appear in the shared tuple.
The runner must reproduce those identities before spend.

The successful path uses 120 paid calls.
It uses 30 answering calls and 90 judge calls.
The maximum is 240 paid calls under the allowed retry model.

The closest sample spent `$15.6595614` on 30 answering calls.
It spent `$5.227251` on 30 single-judge calls.
Three judge calls per row scale that judge cost to `$15.681753`.
The forced-panel estimate is therefore `$31.3413144`.

The hard cap is `$40.00`.
It gives `$8.6586856`, or 27.63 percent, of headroom above the estimate.
The cap does not promise funding for every allowed retry.
A failure storm can still produce an incomplete artifact.

Exact requested paid authorization:

> Authorize Method 2 only for the deterministic sample-30. Authorize at most 240 paid CLI calls and `$40.00` total reported cost. Do not transfer unused authority.

Method 2 requires a separate authorization after Method 1 passes.
Then run this command once:

```sh
node eval/qa/run-qa.mjs --variant A --sample 30 --model claude-sonnet-5 --judge-model claude-sonnet-5 --judge-panel 3 --max-budget-usd 40 --port "$PORT" --server-revision b5b7990419e5da84ae7d30274f3aab79894a7dc6 --expect-sha256 21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5
```

Then run the required offline plan regrade:

```sh
npm run eval:plan -- eval/qa/results/<stamp>-variantA.json
```

## Stop and reading rules

- Do not spend before the owner grants the exact method authorization.
- Do not spend before an eligible reviewer approves the repaired delta.
- Stop if the worktree has an unrelated or implementation change.
- Stop if the server revision or surface hash differs from the shared tuple.
- Stop if MCP initialization does not return HTTP `200`.
- Stop if the agent binary or inherited environment hash differs.
- Stop unless each artifact records `meta.agentEnvironment.isolation.safeMode: false`,
  `meta.agentBinary.matches: true`, and every row's `agent.mcpServers` reports `raven` as `connected`.
- Stop if `QA_AGENT_PROMPT_APPEND` is set.
- Stop if a selected case differs from the compiled battery.
- Stop if the runner reports prompt, corpus, lifecycle, environment, or surface drift.
- Stop the next call when the method reaches its call cap or cost cap.
- A paid call without a reported cost invalidates the method.
- Use only the harness transport retry and whole-panel retry.
- Do not rerun or rejudge without new authorization.
- Treat an incomplete artifact as incomplete evidence.
- Review every answer, transcript, vote, error, and cost before a conclusion.
- Do not combine the focused and sample denominators.
- Do not infer a Friendbot fix from either method.

## Independent review

The user supplied an Opus high-effort review at `/tmp/qa-boundaries-opus-review.md`.
The review examined rebased commit `79c934118eb8e934b129f92f51cc0d2a372c69c5` and requested changes.
The matched prompt and product lane was Fable high.
This round did not launch Fable because the user directed reconciliation of the supplied Opus review.
Opus differed from the original author and orchestrator.

| Finding | Reconciliation |
| ---: | --- |
| 1 | Kept one general manifest capability rule. Removed copied redirect, identifier, and Friendbot facts. |
| 2 | Recorded that all 500 cases receive the prompt. Limited attribution to Raven capability claims. |
| 3 | Scoped refusal to unsupported Raven capability claims. Added the external account-history control. |
| 4 | Replaced full negative sentences with discriminating fragments. |
| 5 | Restored the required sample-30 and plan regrade. Kept a separate focused diagnostic. |
| 6 | Retired the stored same-100 artifact as a paired baseline. Recorded the new implementation hash. |
| 7 | Added exact smoke, same-100, and sample evidence stamps and hashes. |
| 8 | Classified Raven as a contract mismatch. Routed Friendbot as a monitor-only single-case failure. |
| 9 | Removed the nested block header. The boundary is a normal rule bullet. |
| 10 | Removed all Friendbot facts from the prompt. |
| 11 | Added empty and non-empty `QA_AGENT_PROMPT_APPEND` coverage. |
| 12 | Added the environment, implementation, case schema, server, surface, and ordering fields. |
| 13 | Added this review record and the complete reconciliation table. |

The review classified the repair as a major revision.
The required bounded delta re-review now passes.

The Opus high-effort re-review at `/tmp/qa-boundaries-opus-rereview.md` returned `PASS`.
It confirmed that all 13 prior findings are resolved.
It reported five new record findings.

| New finding | Reconciliation |
| --- | --- |
| N1 | Read the named main-checkout artifact. Added exact costs, 60 calls, and its unstamped single-vote policy. Raised Method 2 to `$40.00`. |
| N2 | Named both rebased ledger-only commits. Excluded all non-executable record repairs from the server revision. |
| N3 | Split the Raven measurement and Friendbot monitor in `.agents/NEXT.md`. Kept prompt completion pending measurement. |
| N4 | Removed the dependency-sensitive build byte count. Retained only the passing build result. |
| N5 | Added explicit artifact checks for safe mode, binary match, and Raven MCP connectivity. |

Opus high reviewed the N1-N5 delta at `/tmp/qa-boundaries-opus-final.md` and passed it.

## Free verification

| Check | Result |
| --- | --- |
| Focused prompt fixtures | PASS; 5 tests |
| `npm run eval:selftest` | PASS |
| `npm run eval:compile` | PASS; 338 legacy and 122 extended cases |
| `npm run eval:qa:compile` | PASS; 500 cases and a 30-case sample |
| `npm run eval:qa:lint -- --stale` | PASS; 0 errors and 60 existing warnings |
| `npm run eval:routing -- --gate` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 97 files and 1,520 tests |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS; no leaks found |
| `git diff --check` | PASS |
| Detached `sourceIdentity` | PASS; clean `b5b7990419e5da84ae7d30274f3aab79894a7dc6` |
| Detached MCP initialize | PASS; HTTP `200` |
| Detached live surface report | PASS; revision and SHA-256 pins matched |
| Detached worktree status | PASS; clean after all checks |
| Port `8788` after server stop | PASS; no listener |

## Outcome

The prompt implementation and focused fixtures are complete.
The paid focused diagnostic failed its product gate.
Do not merge the prompt change as a completed repair.
The Friendbot failure has a durable monitor route.
Method 1 used eight paid calls and cost `$0.4597096`.
Method 2 did not run and remains unauthorized.
