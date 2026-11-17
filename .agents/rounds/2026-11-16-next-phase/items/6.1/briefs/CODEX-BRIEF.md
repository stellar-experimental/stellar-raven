# Item 6.1 Codex frontier review brief (gpt-6-astra, high)

Review the diff `origin/main..HEAD` on branch `np/6.1-codemode-0.5.6` in `/home/tyler/code/raven-wt/np-6.1`. It upgrades
`@cloudflare/codemode` 0.5.1 to 0.5.6 and moves `src/executor/spec-sandbox.ts` onto upstream's host-side
output shaping. Plan: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/PLAN.md` (its "Review reconciliation" binds). Executor record: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/EXEC.md`.
Unpacked upstream packages: `/home/tyler/code/raven-wt/np-6.1/tmp/6.1/pkgs/0.5.1/package` and `.../0.5.6/package`.

## Rules

- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never open anything under `eval/qa/`
  or `eval/corpus/` except `eval/qa/tuning-rows.mjs` and `eval/qa/split-amend.mjs`. Never read a file under
  `~/backups/` and never open `tmp/6.1/EXPOSURE.md`. Do not run `amend-split-v10.mjs`.
- No model-calling eval, no Wrangler, no network except keyless GitHub/npm reads. Do not edit tracked files.

## Scope

1. Security boundary: `globalOutbound: null`, the provider passing, and secrets handling in `src/executor/run.ts`
   are unchanged. Does the 0.5.5 `ExecutionGate` change anything for Raven's providers, op ledger or artifacts?
2. Does `specResponseText` and the `createSpecSearchRunner` try/catch match 0.5.6 `dist/mcp.js` (`responseText`,
   `formatError` handler)? Does the generated wrapper match 0.5.6 `createOpenApiSandboxCode` with `includeRequest` false?
3. Re-derive the "not model-facing" claim: the production `search` and `execute` tools, their descriptions,
   schemas, output and error shapes.
4. `.agents/rounds/2026-11-16-next-phase/items/6.1/amend-split-v10.mjs` (read it, do not run it): it must print no
   case id, path or note text; it must check the v9 SHA-256, refuse to overwrite, and write mode 600.
5. Tests: are the new unit and smoke assertions right and sufficient? Lockfile: only the codemode entry changed?
6. Anything else wrong in the diff (TODO, DECISIONS.md, improvements edits, cs-012/cs-001 accuracy).

## Output

Write `/home/tyler/code/raven-wt/np-6.1/tmp/6.1/CODEX-REVIEW.md`: numbered findings with severity (blocking / should-fix / low / info),
evidence (file:line or command), and a fix; end with a PASS or FAIL verdict line.
