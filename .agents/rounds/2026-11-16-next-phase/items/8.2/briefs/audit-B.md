# Item 8.2 accuracy audit, set B: .agents/ (README, model roster, skills)

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you. You are a Claude Sonnet 5.5 auditor,
read-only. Write your findings to `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/B.md` in the format COMMON.md gives, then report.

## Your files (this set only; other sets are audited by other lanes)

- `.agents/README.md`, `.agents/model-roster.md`
- every `.agents/skills/*/SKILL.md` and every file under `.agents/skills/*/references/`
  (audit-reviewability, cloudflare-observability-review, golden-truth, improvements-pipeline,
  live-drift-resolution, retrieval-system-audit, run-evals, truth-maintenance)

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

Specific checks: skills are timeless (no todo IDs, run stamps, dated state, round names used as
live instructions): flag each with class `timeless`. Every command, script, flag, path and gate a
skill names exists and behaves as stated. Each skill's frontmatter `description` matches its body.
Duplicated procedure between a skill and a doc or README (name both). The model roster's model IDs
and launch lines against what `hc` launch lines elsewhere in the repo use (`claude --model fable`,
`sonnet`, `codex ... -m gpt-6-astra`, `grok --model grok-4.7`); `.agents/README.md` "which note
goes where" against the actual folders. Label any change to a skill's behavior (not just wording)
`SKILL-BEHAVIOR` so the lead can list it for orchestrator approval.

Stop when every file in your set is covered. Do not edit any file except your findings file.
