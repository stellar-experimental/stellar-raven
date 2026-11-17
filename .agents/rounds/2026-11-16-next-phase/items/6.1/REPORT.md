# Item 6.1 report: `@cloudflare/codemode` 0.5.1 to 0.5.6

Lead: Claude Opus 5.5, agentpc `t1v5`, 2026-11-17. Executor: Claude Sonnet 5.5. Plan review: Claude Fable
5.2, high ([REVIEW.md](REVIEW.md), 15 findings, all adopted). Diff review: Codex frontier `gpt-6-astra`,
high ([CODEX-REVIEW.md](CODEX-REVIEW.md); FAIL on one should-fix, which was reconciled with the two lows,
see [EXEC.md](EXEC.md) "Codex reconciliation"). USD 0. No model-calling run.

## Pull request and result

PR: [#472](https://github.com/stellar-experimental/stellar-raven/pull/472) (`np/6.1-codemode-0.5.6`). Nine commits on `origin/main` `35d5de90`.

- **Pin.** `@cloudflare/codemode` is pinned exactly to 0.5.6. The lockfile changes only the codemode
  entry and that entry's own optional `@tanstack/ai` peer range. `agents` 0.28.1 dedupes to 0.5.6. No
  other dependency changes.
- **Spec sandbox moved to upstream behavior.** The 0.5.1 copy of the truncation code is gone (the
  constants, `truncateResponse`, `sandboxResponseText` and the in-sandbox `__truncateResponse`). The
  generated wrapper now returns the raw value and is byte-identical to 0.5.6
  `createOpenApiSandboxCode(…, false)`; Codex confirmed this. `createSpecSearchRunner` shapes the result
  host-side with `specResponseText`, a line-for-line copy of the private 0.5.6 `responseText` built on
  the exported `truncateResult` (structural truncation, 24,000 chars). Like the upstream handler, it
  turns an executor or serialization failure into `{ ok: false }`. Without that catch, a BigInt result
  would now reject.
- **0.5.5 pending-call release.** Raven gets it without any code change: `DynamicWorkerExecutor` now
  wraps every provider fn. A smoke case checks that an unawaited provider call does not break a run. It
  does not regression-test the release itself. Codex's caveat applies: host work from an unawaited call
  still runs, and when it lands in the op ledger relative to the summary is a race, not an atomic
  guarantee.
- **cs-012**, re-executed on 0.5.6: unchanged. A thrown string or object gives `error` undefined, and
  Raven logs `ok: true`. A dated recurrence was added and the status stays `reported-upstream`.
  Upstream fix PR [cloudflare/agents#2898](https://github.com/cloudflare/agents/pull/2898) was opened by
  a bot and is open and unmerged; it has bot activity only. No upstream comment was posted (skill
  rule 6).
- **cs-001 / #2296:** the 0.5.6 search region is byte-identical to 0.5.1's (SHA-256
  `a7daa25f…0255`), and the reverse short-token rule is at `dist/index.js:1328` and on `main`
  `search.ts:68`. #2296 is still open with no comments. Upstream has not fixed it, so the vendored
  scorer **should not change**, and it did not.
- **Records.**
  - `DECISIONS.md` has a new section, "Follow-up answers (2026-11-17, assumptions review)", with the
    three owner quotes: answer 1, RWA, goes to item 6.3; answer 2, Docs titles, to item 6.2; answer 3,
    codemode, to item 6.1.
  - The TODO codemode item no longer says "Raven stays on 0.5.1" and drops the spec-sandbox
    paragraph, which is now done. It keeps cs-001 ("reproduces through 0.5.6") and the done criterion,
    and keeps cs-012 open with its retirement trigger.
- **Gates.** The lead ran each gate bare on the final head: `typecheck`, `npm test` (3744 passed),
  `build`, `test:smoke` (149 passed), `eval:selftest`, `improvements:lint -- --live`, all exit 0. The
  executor also ran `secrets:scan -- --tree` (clean). The routing gate was not run: the diff touches
  nothing under `src/catalog/` except one header comment, nor `catalog/`, `specs/` or `eval/*.json`.

### Corrections to carry forward

- Host-side structural truncation arrived in **0.5.2** (#2224), not 0.5.3 as 6.1-NOTE.md and the old
  TODO said.
- The vendored scorer had one adaptation that was never written down: `normalizeSearchText` also splits
  on `#`. Its header now says so (comment only).

## Is the change model-facing?

No. Measured: `npm run -s mcp:surface -- --json` gives surface `815333b7…bd07` and instructions
`67a6bd0b…6c00` before and after (Codex re-ran it). The production `search` and `execute` output and
error paths do not change. The only runner whose output shape changes is `createSpecSearchRunner`, and
it is not a registered tool. So there was no Sonnet spot check.

## Deploy

**Needed.** Worker bytes change: the new codemode executor and the 0.5.5 gate. Deploy on the Mac after
merge.

## Split v10 (orchestrator answer, [QUESTION.md](QUESTION.md))

- **v10:** `~/backups/gca-2026-11-14-split-v10.json` on agentpc, mode 600, SHA-256
  `fea3d467e0df7b21a3fab7b5e4013d077da789de5aea16188d5bf975063f35e9`. Counts: 92 tuning, 110
  held-out, 45 reserve. 62 cases outside tuning carry a `reverifyBy`; the earliest is 2027-01-14.
  It was made by [`amend-split-v10.mjs`](amend-split-v10.mjs), which prints no id. `TUNING_ROW_COUNT`
  is now 92.
- **Dated runs point at v10.** The four `items/1.4/dated/*-LEAD.md` briefs, `PRESTAGE.md` (both lines)
  and the TODO held-out block name v10 and its SHA-256. The timers need no edit:
  `launch-dated-lead.sh` reads each brief from `origin/main` when it fires, and no unit names a split.
  So **the timers use v10 only if this PR merges before 2026-11-23 18:00 UTC.** If that is missed,
  hold the merge until run 2.1 and its follow-ups have merged, then rebase.
- **Search rule.** After the orchestrator's 2026-11-17 rule, the lead, Fable and Codex saw no corpus
  content. The executor had a few `git grep` slips that printed no case text (EXEC.md, deviation 3).
  Fable printed four lines that contain only the `TUNING_ROW_COUNT` constant name.

## For the orchestrator on the Mac

1. Merge before 2026-11-23 18:00 UTC (see above), then deploy.
2. Copy `~/backups/gca-2026-11-14-split-v10.json` from agentpc to the Mac. A Mac copy of an earlier
   split is stale.

## Remaining deviations from upstream codemode

| Deviation | Reason |
|---|---|
| Raven registers its own `search` and `execute` tools and calls `DynamicWorkerExecutor` directly, instead of using `codeMcpServer`, `openApiMcpServer` or `createCodeTool` | ADR-0001 and ADR-0003. This is why `toModelOutput` (0.5.2), the Standard Schema metadata (0.5.3) and upstream's tool descriptions do not apply. |
| A vendored scorer, `normalizeCode` and JSON-schema types from 0.4.2 (`src/catalog/vendor/*`), plus the ungated tier-2 replica | Upstream exports no `searchConnectors` scoring and has no Node-safe entry. Raven searches its catalog host-side (ADR-0001, ADR-0009). Against 0.5.6, the only differences are the documented field mapping and `kind` weight, a behavior-neutral `?.` in `stripCodeFences`, and the `#` separator, which is now documented. |
| Execute model-boundary truncation (`src/policy/truncate.ts`) slices and adds the SOURCE BASIS footer and artifact storage, where upstream truncates structurally | It is Raven's model-facing footer, artifact and 6,000-token contract (item 3.4), and the module must load under plain Node. See proposal 1. |
| Log shaping (`src/executor/shape-logs.ts`: 100 lines, 2,000 chars per line, redaction before the clip), where upstream bounds `logs` with `truncateResult` | The redaction order is a security rule, and the module must load under plain Node. Candidate for proposal 1. |
| `resolveSpecRefs`, a host-side twin for `execute`'s `codemode.spec()` | Injecting the spec would shadow Raven's `codemode` provider global. The document returned is the same. |
| Spec sandbox: `includeRequest` is always false, the spec is the unified super spec, serialized once per isolate | Raven has per-operation providers and a multi-service spec. |
| `specResponseText` copies upstream's private `responseText` | Upstream does not export it. |
| The `is not defined` hint (`src/executor/script-hints.ts`) adapts upstream's private `withGlobalsHint`: it names Raven's providers and adds "and standard JavaScript" | Not exported, and upstream applies it only in the durable runtime. The addition keeps the hint from denying builtins. |
| `classifyExecuteError` derives `errorName` from the message | `DynamicWorkerExecutor` drops `err.name` (item 3.2). |
| Not a deviation: there is no local cs-012 workaround | Raven inherits the defect until upstream ships a fix. |

## Proposals (not in this PR)

1. **Structural truncation at the execute model boundary.** Replace the text slice in
   `truncateForModel`, and perhaps log shaping, with `truncateResult`-style structural shrinking,
   keeping the SOURCE BASIS footer and artifact path. This changes what the model sees. It needs its
   own measured A/B (answer quality and tokens on tuning rows) and a Codex security read of the
   redaction order. Item 3.4's boundary of 6,000 tokens stays.
2. **A deterministic 0.5.5 release test** using a deferred host provider, if the release behavior is to
   be pinned rather than trusted to upstream. This is small, but it tests upstream code, so it is
   optional.

## `npm outdated` (2026-11-17)

| Package | Current → latest | Recommendation |
|---|---|---|
| `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `ai`, `workers-ai-provider` | in-range patches | One routine `npm update` PR. They are used by the demo and eval paths; check the demo smoke. |
| `@types/node`, `acorn`, `@cloudflare/workers-types`, `@modelcontextprotocol/sdk` (dev, 1.32.2), `esbuild` (0.28.2, exact) | patch | Fold into the same routine PR. |
| `@cloudflare/workers-oauth-provider` | 0.10.3 → 0.10.4 in range; 1.2.4 is a major | Take 0.10.4 in the routine PR. Treat 1.x as its own item with a Codex frontier security review; it is the auth boundary. |
| `@modelcontextprotocol/server`, `@modelcontextprotocol/client` | 2.3.1 → 2.4.0 (exact pins) | Own small item. It is the protocol surface, so check the `mcp:surface` hash and the smoke. |
| `agents` | 0.28.1 → 0.33.0 (exact pin) | Own item. Five minors of transport and session code; read the changelog, then smoke and the surface hash. |
| `wrangler` | 4.153.0 → 4.164.0 (exact pin) | Own toolchain PR, aligned with `@cloudflare/vitest-pool-workers` and the pinned miniflare beta. |
| `miniflare` | pinned 5.x beta; npm `latest` is an older 4.x | No action: `latest` is behind the pin. |
| `vitest` | 4.1.12 → 5.1.0 (major) | Wait until `@cloudflare/vitest-pool-workers` supports vitest 5. |

## Open questions for the owner

None.
