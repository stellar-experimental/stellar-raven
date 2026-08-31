# Next QA register refresh analysis

Date: 2026-08-31

Scope: local result inspection and free analysis only. No paid call ran. No result file changed.

## Decision

Run the free register refresh now. Do not run another same-100 collection now.

The refresh measures judge stability only. It cannot measure a product change, a production change, or a QA quality change.
It also cannot repair the existing paired result.

The smallest valid next method is free. Use the refreshed register only as a frozen tier schedule for a future approved collection.
Do not copy it into a durable results directory before approval.

## Free result

Command run:

```sh
node eval/qa/judge-stability.mjs --results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results --out /tmp/qa-register-2026-08-31.json
shasum -a 256 /tmp/qa-register-2026-08-31.json
```

The register hash is `5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53`.
It used 197 artifacts: 163 collections and 34 rejudges. It registers 538 cases.

The same-100 set still has 57 cases below `0.75`. It has 43 cases at or above `0.75`.
The count did not change.

Four cases entered the unstable set:

- `q-gap-builders-person-empty`
- `q-history-ecosystem-index-freshness-live`
- `q-protocol-ledger-close-time`
- `q-soroban-sdk-macros`

Four cases left the unstable set:

- `q-edge-fresh-latest-scf-round`
- `q-org-sdf-enterprise-fund`
- `q-quickstart-manual-ledger-close`
- `q-sor-p23-auto-restore-extendto`

`q-protocol-ledger-close-time` moved from `0.75` to `0.60`. It now needs a panel.

This refresh validly measures observed stability, threshold crossings, and the future panel schedule.
It selects 57 three-vote panels and 43 single votes. This schedule has 214 judge calls.

It cannot estimate a score delta. It cannot establish paired non-inferiority.
It cannot validate rubric `v2.10`. It cannot show a change in Raven behavior.

## Current same-100 evidence

The reviewed artifact is `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-30T03-43-11-variantA.json`.
Its SHA-256 is `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387`.

It is complete and comparable under its own tuple. It contains 100 agent calls and 214 judge calls.
It reported 314 costs and no missing costs. Its spend was `$40.9579502`.

The artifact used `claude-sonnet-5` for both roles, rubric `v2.9`, and pack `p5`.
It used runner and server revision `d8ae30bba3e57f7da89bb465e1489ef85b65873d`.
Its surface hash was `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`.
Its agent binary hash was `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`.

Its environment hash was `f17ba7ffa59d9bcb58cd45601ced3a2cde358565c1a49997c485f53c141a42ff`.
The names were `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, `HOME`, `PATH`, `SHELL`, and `TMPDIR`.
`QA_AGENT_PROMPT_APPEND` was unset.

The artifact has one T4 consistency contradiction. The affected ID is `q-eco-stellar-wallets-list`.
One panel vote failed with `partial-without-issue`. The independent review retained two valid `partial` votes.

The reviewed method excludes that ID. It has 99 paired-eligible IDs.
The powered paired method requires 100 eligible IDs. The reviewed result is `INDETERMINATE`.

The stored paired printer compares the artifact to itself with a 100-ID denominator.
That output does not overrule the reviewed T4 exclusion. It does not model the reviewed panel exception as a row exclusion.
Do not use that self-comparison as paired evidence.

## Why another same-100 collection is not justified

No shipped Raven mechanism changed after the reviewed collection. The capability-boundary prompt change was rejected.
Its Method 2 did not receive authorization.

Rubric `v2.10` changed the grading contract. It requires an answer-visible issue for a non-trap `partial`.
The existing artifact uses `v2.9`. A new full collection would measure a new judge tuple, not a product delta.

The owner has not selected a product-loss margin. The current `0.08` is an experimental no-change radius.
It is not a product tolerance.

The existing T4 exception prevents a powered paired look. A fresh collection cannot make the old result a valid paired baseline.
A full collection now would produce a new point estimate only.

Another same-100 collection would spend about forty dollars without answering a new approved product question.
It is not justified now.

## Smallest paid method, if needed

Use one non-identical rejudge only if the owner wants evidence that `v2.10` handles the known contradiction.
This is a judge diagnostic. It is not a QA collection, a five-track result, or paired evidence.

The free dry run passed with the historical case snapshot and `--allow-non-identical`.
The tuple changes from `v2.9` to `v2.10`. Non-identical labeling is required.

```sh
node eval/qa/re-judge.mjs /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-30T03-43-11-variantA.json --ids q-eco-stellar-wallets-list --cases-ref d8ae30bba3e57f7da89bb465e1489ef85b65873d --allow-non-identical --max-budget-usd 0.50
```

This method makes one judge call. It needs no development server and no answering-agent call.
Matching `v2.9`/`p5` same-100 judge calls cost `$0.0321638` to `$0.1589992`.
Their median was `$0.0777878`; their mean was `$0.0773968`.
The `$0.50` cap covers the observed range with a bounded reserve.

Stop before the call if the dry-run guards change. Stop if the historical case guard fails.
Stop if cost reporting is missing. Stop after the one call or the exact cap.

Review the returned claim lists and consistency fields. Confirm that every returned `partial` names an answer-visible issue.
Record the result as judge-contract evidence only.

## Conditions for a later full same-100 collection

A later full collection needs a product mechanism or a new pre-registered diagnostic.
It needs separate paid authorization and an independent pre-spend review.

Use the new register once. Freeze its path and SHA-256 before the first paid call.
Reuse it for every arm and any stored-judge resume in that method.

The selected IDs must come from the reviewed artifact. Their order must remain unchanged.
The selected-case snapshot and case-input hashes must reproduce before spend.

```sh
RESULTS_DIR=/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results
BASELINE="$RESULTS_DIR/2026-08-30T03-43-11-variantA.json"
STABILITY=/tmp/qa-register-2026-08-31.json
EXPECTED_REGISTER_SHA256=5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53
SAME_100_IDS="$(jq -r '.meta.selectedIds | join(",")' "$BASELINE")"

test -z "$(git status --porcelain=v1 --untracked-files=all)"
test "$(shasum -a 256 "$STABILITY" | awk '{print $1}')" = "$EXPECTED_REGISTER_SHA256"
SERVER_REVISION="$(git rev-parse HEAD)"
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface-next-same-100.json
SURFACE_SHA256=<surfaceSha256 from that report>
AGENT_BINARY_SHA256=<SHA-256 of the resolved capped Claude executable>

node eval/qa/run-qa.mjs --variant A --ids "$SAME_100_IDS" --model claude-sonnet-5 --judge-model claude-sonnet-5 --max-panel-cases 34 --stability-register "$STABILITY" --max-budget-usd 50 --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256"
```

The current worktree is not clean. It contains an untracked round file.
Do not start the server or a paid method from this state.

Do not reuse the old revision or surface hash as a current pin. Capture both after the worktree is clean.
Require the runner, server, surface, agent binary, and environment values to remain unchanged during collection.

Require `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to be set. Require `QA_AGENT_PROMPT_APPEND` to be unset.
For a comparison, both arms must share the same inherited environment hash.

The exact current-contract cost observation is one point: `$40.9579502` for 314 calls.
The nearest earlier 100-ID records range from `$31.9693122` to `$45.711693`.
Their three-observation median, including the current-contract result, is `$40.9579502`.
The `$50` cap provides `$9.0420498` above the recorded current-contract spend.

Expect 100 answering calls and 214 judge calls. Expect 314 paid calls total.
The 57-panel and 43-single schedule creates the 214 judge calls.

Stop the full method on a dirty worktree, a failed MCP initialize, a source-revision mismatch, a surface mismatch, or an agent-binary mismatch.
Stop on an environment mismatch, a register-hash mismatch, changed case order, changed identity, changed lifecycle state, or a prompt append.
Stop on missing cost. Stop after the exact cap. Treat an incomplete result as incomplete evidence.

Do not retry a provider safeguard, timeout, consistency contradiction, spawn failure, protocol failure, or unclassified failure.
Keep only the runner's allowed transport and judge retries.

## Required review work

Before a paid call, write a narrow round brief. State the product mechanism, diagnostic, method, call count, cap, frozen register, and reading rule.

An independent reviewer must differ from the brief author and the orchestrator. Use the appropriate high-effort lane under `AGENTS.md`.
Reconcile every finding before the first paid call.

For the one-row rejudge, review the verdict fields and the `partial-without-issue` outcome.
For a full collection, review every `wrong`, every `partial`, every T4 and T5 row, and the panel vote evidence.
Live-verify any claimed agent failure before creating a repository task or an upstream finding.

Run the free plan regrade after any stored QA artifact. Keep it diagnostic and separate from QA.
