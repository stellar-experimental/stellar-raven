# Independent review: PR #156 plus host-ownership correction

Reviewer: Grok high (Grok 4.6). Completion review of an Astra-authored one-line fix.
Mode: audit-reviewability, audit only. No repository edits. No GitHub writes.
Date: 2026-09-16.

## Verdict

PR [#156](https://github.com/stellar-experimental/stellar-raven/pull/156) was ready to merge at the audit, and it later merged.

The 13 documents remain truthful against current code. Paid-evaluation and owner-decision safeguards remain. The Astra one-line correction removes the false adapter-ownership claim.

The one-line change was tested at pre-merge head `e4c34d18`.
PR #156 later merged as `d4a6cefb3db52702e8f3b605d7693e83974e10fd`.

Companion Docs-closure report: `/tmp/raven-execution-2026-09-16/docs-review.md`.

## Scope and fixed point

| Item | Value |
|---|---|
| Mode | Audit. Repair guidance only. |
| PR | [stellar-experimental/stellar-raven#156](https://github.com/stellar-experimental/stellar-raven/pull/156) |
| Base | `origin/main` `722eef5f2a81845ebdd8206e17ee100344eabd58` |
| Tested pre-merge head | `e4c34d18eb0553a8976c63ee6b2d78dc9abd62db` |
| Merge commit | `d4a6cefb3db52702e8f3b605d7693e83974e10fd` |
| Range | `origin/main...HEAD` |
| Files | 13 documentation files; 197 insertions, 695 deletions |
| Working tree | `PLAN.md` matches HEAD (0 bytes of extra diff) |
| Unrelated dirty tree | untracked `.agents/rounds/2026-09-16-*` review files; left untouched |

Commits:

1. `4d194bd1` Remove stale handoffs and consolidate current documentation
2. `ac1769f7` Clarify evaluation snapshots and preserve cleanup review safeguards
3. `e4c34d18` docs: correct host responsibility summary

GitHub state at the audit: OPEN, `MERGEABLE`, `CLEAN`. CI secrets, test, Analyze, and CodeQL succeeded on `e4c34d18`.
Later merge commit: `d4a6cefb3db52702e8f3b605d7693e83974e10fd`.
Copilot reviewed `ac1769f7` and flagged the old `PLAN.md:22` sentence. That sentence is gone on `e4c34d18`.

## Astra one-line correction

Old text at `PLAN.md:22`:

```text
Host adapters own service traffic, authentication, argument validation, and secrets.
```

New text:

```text
The host owns service traffic, authentication, argument validation, and secrets.
```

Independent re-derivation against code:

| Claim | Owner in code | Result |
|---|---|---|
| Service traffic | `src/adapters/` via host RPC | Host-owned. True. |
| Authentication | `src/server.ts`, `src/auth/` | Host-owned. Not adapters. True after the correction. |
| Argument validation | `src/policy/guard.ts` and `src/policy/validate.ts`, before adapter dispatch | Host-owned. Not adapters. True after the correction. |
| Secrets | Worker env; adapters read them; sandbox never sees keys | Host-owned. True. |
| Sandbox network | `src/executor/run.ts` sets `globalOutbound: null` | Unchanged. True. |

The Copilot request asked to name separate layers in that sentence. The one-line fix instead names the host versus the sandbox. That boundary is the load-bearing fact in §1. Separate owners remain in `PLAN.md` §4 and in `ARCHITECTURE.md` §2 step 4.

This is truthful. It is the smallest repair of the false adapter claim.

## File coverage

Every changed file was read in the complete `origin/main...HEAD` diff and against current code or generated ownership.

| File | Truth check | Owner / safeguard check |
|---|---|---|
| `PLAN.md` | Current product scope, two-tool shape, digest-only runner, unexposed paid Lumenloop ops, and separate source/eval/deploy decisions match code and `scripts/exposure.mjs`. | Host vs model ownership is now correct. §4 keeps the model-must-not-own-args invariant. |
| `ARCHITECTURE.md` | Framing now says source owns current behavior. Policy, auth, and sandbox paths are unchanged and still match `src/`. | Present-state owner. Dated 2026-07-03 claim removed. |
| `.agents/NEXT.md` | Replaces the 2026-09-09 deployment narrative with the 2026-09-14 ranked handoff. Paid-eval defaults remain no spend. | Keeps diagnostic-budget isolation, unsigned paired-plan block, and Scout `1.9.1` hold. |
| `.agents/TODO.md` | Header now points at the September 14 ledger. Task bodies are unchanged. | Owner-decision pointer stays in `NEXT.md`. |
| `eval/README.md` | Dated result sections are labeled historical. Commands and `gates.json` remain the live operators. | Dated evidence cannot authorize a new paid run. |
| `eval/discovery/README.md` | Seed pool `extended-strict-misses` is a frozen authored set, not a live miss count. | Prevents a stale 12-case claim from tracking routing drift. |
| `eval/playground/README.md` | Removes the stale 469-case battery count. `DEMO_CAPS.chatsPerHour` is still 30 in `src/demo/budget.ts`. | Hourly subject cap and no-rotation safeguard remain. |
| `eval/qa/README.md` | Case counts now belong to the generated lifecycle registry. | Dated run sections do not authorize new paid calls. |
| `ideas/README.md` | Ideas remain research notes. Playground stays stateless at the existing 8,000-character limit. | Not implementation authority. |
| `ideas/architecture-explorations.md` | Completed experiments stay no-ship with evidence links. New runs need eval authorization. | Prevents re-queue of measured nulls. |
| `ideas/observability-r2-retention.md` | Dated 2026-07-07 observations. Current logging points at architecture and usage docs. | Research-only status kept. |
| `ideas/per-user-mcp-observability.md` | 2026-07-13 snapshot. Personalization remains deferred. | Usage guide owns later aggregate reports. |
| `inventory/README.md` | Catalog assembly reads hash-verified skill bodies and fetches on cache miss (`scripts/lib/skill-mirror.mjs`). Stellar Light count is no longer hardcoded as 24. | Partner stubs and generated-file rule remain. |

Checked PLAN links all resolve. Runnable-skill registry has one entry: `skills.lumenloop.stellar-ecosystem-digest`. `EXCLUDED_LUMENLOOP_OPS` still contains `request_research`, `list_my_research`, and `research_result`. Search signatures attach only to operations and runnable skills (`src/catalog/search.ts` `renderSignature`).

## Findings

No critical or high findings.

### Low — `PLAN.md` §6 omits `src/policy/`

Location: `PLAN.md:82-87`.

Evidence: §1 now says the host owns argument validation. The §6 owner table lists `src/server.ts`, `src/auth/`, `src/catalog/`, `src/adapters/`, and `src/executor/`. It does not name `src/policy/`. `ARCHITECTURE.md:365-372` and `src/policy/guard.ts` own that check.

Consequence: a reader of the short owner table can still miss the policy module. The §1 sentence is no longer false.

Smallest repair: add one row, or add `src/policy/` to the ranking/adapters/executor row. Do not restore "host adapters own authentication". This gap existed in the rewrite commit. The one-line fix did not introduce it. It does not block merge.

### Low — `NEXT.md` item 2 lags the 2026-09-16 index check

Location: `.agents/NEXT.md:11-12`.

Evidence: the handoff still says to recheck `sd-040`, `sd-041`, and `sd-045` after ingestion. Independent live source and index checks on 2026-09-16 show those three original triggers no longer reproduce. The file dates itself 2026-09-14.

Consequence: a later agent may repeat a completed index check. Paid and source-acceptance safeguards are unaffected.

Smallest repair: refresh the handoff after merge, in the current maintenance round. Do not block this documentation PR.

## Owner safeguards that remain

These safeguards survive the cleanup and the one-line fix:

- Model code does not own endpoints, arguments, authentication, or exposure (`PLAN.md` §4).
- Arguments must match the manifest before a host call.
- Sandbox has `globalOutbound: null`.
- Paid Lumenloop research stays unexposed until approval, elicitation, budget, persistence, and dedup land together.
- Ideas are not implementation authority.
- Source acceptance, paid evaluation, deployment, and upstream closure stay separate decisions (`ADR-0008`).
- No current authorization permits new collection or paid rejudging.
- Diagnostic budget must not move to headline collection.
- Playground harness cannot rotate subjects to evade the hourly cap.
- Discovery seed membership does not silently track live routing misses.
- Dated eval sections cannot authorize another experiment.
- Generated inventory files stay script-owned. Partner Lumenloop details stay name-only stubs.

## Reviewability

The rewrite replaces a 365-line historical plan with a 116-line present-state plan. That matches the rubric: source files describe the current system; history stays in ADRs, eval records, and dated ledgers.

Commit `ac1769f7` preserves four cleanup-review safeguards: diagnostic-budget isolation, signature-only-on-callable-hits, frozen discovery seed membership, and removal of a stale playground battery count.

No generated files were hand-edited. No runtime code changed. `git diff --check origin/main...HEAD` is clean.

## Adjacent residual outside this PR

`AGENTS.md` still says "host adapters own all service traffic, policy, and secrets." Policy lives in `src/policy/`, not in adapters. That file is not in the 13-file diff. Do not expand this PR to edit it unless the parent wants a follow-up.

## Verification

This audit did not run `npm test`. The diff contains no runtime, catalog, or generated-code change. GitHub CI on tested head `e4c34d18` reports success for secrets, test, Analyze, and CodeQL. The merge commit is `d4a6cefb`.

Exact local commands used:

```sh
git diff origin/main...HEAD
git show e4c34d18 -- PLAN.md
git diff HEAD -- PLAN.md
gh pr view 156 --json headRefOid,statusCheckRollup,mergeable,mergeStateStatus
```

## Unresolved and deferred

- Optional §6 `src/policy/` row after merge.
- Optional `NEXT.md` refresh after the current Docs-index review.
- Optional later `AGENTS.md` host-adapter wording, outside this PR.
- Copilot's suppressed comment on `ac1769f7` is stale. It quotes the old sentence.

No finding requires a further commit before merge.
