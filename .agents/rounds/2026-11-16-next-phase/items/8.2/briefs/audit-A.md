# Item 8.2 accuracy audit, set A: root and docs/

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you. You are a Claude Sonnet 5.5 auditor,
read-only. Write your findings to `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/A.md` in the format COMMON.md gives, then report.

## Your files (this set only; other sets are audited by other lanes)

- `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `PLAN.md`, `SECURITY.md`, `THIRD-PARTY-NOTICES.md`
- `docs/operations.md`, `docs/stellar-docs.md`
- `.github/PULL_REQUEST_TEMPLATE/upstream-improvement-handoff.md` and the text in `.github/ISSUE_TEMPLATE/*.yml`
- `research/decisions/*.md` (ADRs): links and index only. Do not judge decision text; check that living
  docs cite ADRs that exist, by the right number, and say whether any ADR is cited nowhere.
- The code comment `test/helpers/mcp-tool-metadata.ts:29` (it says re-verify "whenever a Claude Code
  version changes"; the TODO trigger is now "before a change to model-facing text, or when release
  notes name an MCP limit"). Confirm against `.agents/TODO.md` and propose the comment text.

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

Specific checks: the AGENTS.md source-of-truth map (does each row point at the right file, and does
`CLAUDE.md` exist? it does not on `main`: find what replaced it and propose the fix); every AGENTS.md
rule still true against the code and tools (propose removals for rules no longer needed, separately
labelled `AGENTS-RULE`); the CONTRIBUTING.md "Checks" table against `.github/workflows/ci.yml`
and `package.json` (every area, command and gate); README "Run locally" step by step against the
scripts (`.dev.vars` placeholder, `npm run typegen`, ports); ARCHITECTURE.md against `src/`
(module names, request flow, catalog counts, sandbox, auth and OAuth origins, bindings in
`wrangler.jsonc`); docs/operations.md commands and retention claims against code and `src/site.ts`.

Stop when every file in your set is covered. Do not edit any file except your findings file.
