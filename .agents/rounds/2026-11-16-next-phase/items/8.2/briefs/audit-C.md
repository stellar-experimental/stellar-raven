# Item 8.2 accuracy audit, set C: eval/ documentation

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you. You are a Claude Sonnet 5.5 auditor,
read-only. Write your findings to `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/C.md` in the format COMMON.md gives, then report.

## Your files (this set only; other sets are audited by other lanes)

- `eval/README.md`, `eval/EVALS.md`
- `eval/qa/README.md` (long; read all of it), `eval/qa/claim-read-brief.md`, `eval/qa/gateway-judge.md`
- `eval/agentic/README.md`, `eval/discovery/README.md`, `eval/partner-docs/README.md`,
  `eval/plan/README.md`, `eval/playground/README.md`, `eval/temporal/README.md`

## What to check

Verify every checkable claim in your files against the code on this branch (`package.json`,
`wrangler.jsonc`, `src/`, `scripts/`, `eval/` code, `test/`, `.github/workflows/`,
`catalog/manifest.json`, `ecosystem-skills/MANIFEST.json`): every command, npm script name, path,
file name, environment variable, binding, host, route, version, count, threshold and behavior claim.
Recent changes the docs may not reflect: `@cloudflare/codemode` 0.5.6 (#472); `agents` 0.33 with
`@modelcontextprotocol/server` 2.4 and `agents/mcp/server` (#482); `wrangler` 4.164 and
`@cloudflare/vitest-plugin` replacing `@cloudflare/vitest-pool-workers` (#483);
`@cloudflare/workers-oauth-provider` 1.2.4 with one provider per served origin and a native-callback
allowlist (#484); `vitest` 5 (#485); the case-search guard hook and `.ignore` files (#478);
`scout.matchPartners` removed (#467). Use `git log --oneline -40` and `gh pr view <n>` for context.

Also flag, in your files: history narration in a living doc ("we used to", "was changed in round X",
dated status that belongs in a record); stale TODO-like text outside `.agents/TODO.md`; a fact your
file states that another living doc also owns (name both places); terms used inconsistently.

Specific checks: every `npm run eval:*` name and `node eval/...` path exists; flags named exist in
the script's argument parser; thresholds and counts (routing gate thresholds in the gate code,
row counts in compiled files, constants such as `TUNING_ROW_COUNT`) match the code. Read code and
compiled files that are not case files; for a case-bearing file check only `test -e`.
`eval/qa/claim-read-brief.md` is a model-facing instrument brief: report inaccuracies but mark each
`INSTRUMENT` (it is changed only with a measured reason). Flag duplicated procedure between eval
READMEs and `.agents/skills/run-evals/SKILL.md` (name both places).

Stop when every file in your set is covered. Do not edit any file except your findings file.
