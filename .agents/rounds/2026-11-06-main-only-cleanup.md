# Main-only repository cleanup — 2026-11-06

## Authorization and inventory

The owner requested commit, push, deploy and reconciliation of every remaining local/remote
branch, worktree, PR and stash, leaving only main. Start: clean main `e62c2b97`.
Remote GitHub had only main, no open PRs, and the repository had no stashes.
Two local branches remained:

| Branch | Tip | Reconciliation |
| --- | --- | --- |
| codex/openai-review-remediation | 82a83917125688fa375c477cdd6dbe610df90ad1 | Three commits recovered: submitted plugin package, source for the existing domain challenge Worker, dated review evidence and owner follow-ups. Sanitize private account details and qualify historical status before publication. |
| eval/playground-model-sweep-1103 | 0d90bbb7be03fb3be1bc0a10119ec1953f5c093d | Five commits recovered: reusable SDK/transport/judge/gauntlet work and historical sweep evidence. Stage 3 remains incomplete; no model promotion or new paid collection. |

The OpenAI worktree was clean. The `/private/tmp/rv-models` directory was already absent;
only its stale Git worktree registration remained. All branch changes are reconciled in this
release before removal. Main's newer corpus, alias routing and maintenance work are preserved.
Only squash merges are enabled; the integration branch is rebuilt as one sanitized commit before
push, so private prose from the unpublished local OpenAI commits never enters public history.

## Review and repairs

Two hc Codex Astra agents at high reviewed the original branches. `clean-openai` authored the
OpenAI documentation sanitization and build-dependency repair; `clean-playground` independently
reviewed the integration and coordinator's gauntlet repair. Their reports accompany this ledger.

- Restore source for the separately deployed domain challenge; do not change or redeploy its route.
  Ordinary GET returned200 and matched the recovered source exactly (SHA-256
  `54c4d79eac55672506a89a64f1b8cf23c3a371cdc4e25e9b6a53e594642c1ec5`).
- Preserve the plugin manifest and its eight dated review cases; current approval/publication
  is not inferred from the October portal record. Remove personal account/identity details.
- Repair the nested Worker toolchain's nine high dependency advisories through compatible updates;
  no audit-suppressing override. Declare its newer Node patch requirement and validate in isolation.
- Retain completed provider/SDK compatibility fixes. The experimental Codex judge adapter is
  preserved only in the exact original patch: its billing identity, comparison metadata and
  tool/event isolation need hardening. Active judge code stays identical to main; shipped
  Playground primary/fallback stay unchanged.
- The old gauntlet counted missing cost but kept authorizing turns. It now closes authorization
  on missing/invalid cost, accounting errors or unsettled call counts, saves the incomplete matrix,
  and exits nonzero. Last-turn overspend and early exhaustion also fail completion explicitly.
- Keep the historical stage-2 evidence and interrupted stage-3 ledger. Correct the summary's stale
  seven-finalist/pending framing using the later eight-finalist ledger; no winner is asserted.

## Validation

Root reproducible install: zero dependency advisories. Typecheck, build and eval self-tests passed.
Exact-final unit suite: 145 files, 3,142 passes and 3 expected failures. Full smoke: 9 files,
140 passes, including legacy MCP/OAuth host behavior.
The final gauntlet CLI suite passes15 tests. Its five fake-server cases assert one HTTP turn,
nonzero exit and an incomplete persisted artifact for missing cost, accounting error, unsettled
calls, last-turn overspend and early exhaustion. No real Wrangler/model request runs in those tests.
The subsequent typecheck passed.

Nested Worker: saved plugin-schema validation, manifest evidence hash and icon equality, isolated
GET/HEAD/404/405 behavior, supported-Node install/typecheck/build, and zero-advisory audit.
Final independent review accepted the bounded integration with no unresolved blockers. The exact
final tree passed typecheck, unit tests, smoke, build, eval self-tests, QA registration, routing gate,
and QA lint (zero errors; 84 existing warnings). Staged and whole-tree secret scans passed.
Both reviewers removed their owned temporary snapshots, build outputs and child terminals.
CI, merge, deploy and final Git cleanup receipts are recorded on the release PR after the exact
commit is known.

## Completion boundary

This closes Git leftovers, not the existing product queue. A future model-selection evaluation
still requires its reviewed plan and full gates. OpenAI approval/exception handling and potential
Worker consolidation remain explicit owner follow-ups; repository cleanup does not perform them.
No upstream issue reminders, submission writes, or paid model calls are part of this cleanup.
