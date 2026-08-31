# Repository recovery review repair

Date: 2026-08-30
Commit: `ae00292 Repair repository recovery review findings`

Scope: Repair the review findings for `a92ccf4` in the current worktree.
The repair preserves the forward-only, manifest-owned receipt design.
It does not change frozen cases, goldens, `.agents/TODO.md`, or `NEXT.md`.

## Dispositions

| Finding | Disposition |
| --- | --- |
| B1 | Fixed in `ARCHITECTURE.md`. A recovery-only refusal now uses the standard `error` envelope before dispatch. |
| B2 | Fixed in `.agents/rounds/2026-08-30-repository-tooling-recovery.md`. The record states the sequence evidence, receipt design, accepted totals, holdout floors, exact gates, and the `eval/README.md` evidence reference. |
| B3 | Fixed with ADR-0009. ADR-0003 now names the amendment and retains the ban on a generic runtime deny layer. |
| M1 | Fixed. Search instructions now state that repository detail is separate from ranked hits. |
| M2 | Fixed. `codemode.describe` returns manifest-derived `qualifyingSources` for recovery-only operations. |
| M3 | Fixed. The architecture and policy comment state that the host sees outcomes, not row relevance. The receipt handoff limits use to empty or adjacent Docs evidence. |
| M4 | Fixed. `recoveryReceiptBlock` is the shared MCP and demo receipt formatter. |
| M5 | Fixed. The rejection list no longer claims a same-execute consume check. `requestId` has an audit-only comment. |
| L1 | Fixed. The second request now reports one recovery-only attempt per execute. |
| L2 | Fixed. `RANKED_AUTHORITY_REPOSITORY_RULE` is now `AUTHORITY_REPOSITORY_RULE`. |
| L3 | Fixed. Receipt refusals log `outcome`, `reason`, and `target` without receipt content. |
| L4 | Fixed. The two test names now describe their actual assertions. |
| L5 | Fixed. The super-spec test asserts `x-discovery-mode: recovery-only`. |
| L6 | Fixed. The eval documents separate free discovery checks from receipt tests. |
| L7 | Fixed. The R2 wildcard conditional assumption is documented beside receipt issuance. |
| Grok residual 1 | Fixed. HMAC verification now runs before the version check. An altered, unsigned version reports `invalid`. |
| Grok residual 2 | Fixed. The generic wallet/tooling workflow no longer includes `scout.explainRepo`. The generated micro-map was rebuilt. |

## Commands and results

| Command | Result |
| --- | --- |
| `npm run micro-map:build` | PASS. Regenerated `src/mcp/micro-map.ts`. |
| `npm run typecheck` | PASS. |
| `npm test` | PASS. 101 files and 1567 tests passed. |
| `npm run test:smoke` | PASS. 4 files and 85 tests passed. Dependency source-map warnings occurred. |
| `npm run build` | PASS. Wrangler dry-run build completed. |
| `npm run eval:repo-recovery:lint` | PASS. 12 positive and 8 negative frozen cases. |
| `npm run eval:repo-recovery -- --gate` | PASS. 12 eligible positives and zero ordinary discovery leaks. |
| `npm run eval:routing -- --gate` | GATE PASS. Baseline `2026-08-30T20:57:46.024Z`. |
| `npm run secrets:scan -- --tree` | PASS. No leaks found. |
| `git diff --check` | PASS. |

No paid eval, deployment, push, pull request, or TODO/NEXT edit ran.

## Residual risks

- Receipt issuance relies on R2 treating `etagDoesNotMatch: "*"` as HTTP `If-None-Match: *`.
- The repository does not define the bucket lifecycle rule. Marker retention needs operator confirmation.
- A receipt does not bind the repository argument. It binds the caller, source, target, request, expiry, and nonce.
- A sandbox error after an authority call issues no receipt. This is a fail-closed result.
- MCP and playground receipts use separate identity namespaces. Receipts cannot cross surfaces.
